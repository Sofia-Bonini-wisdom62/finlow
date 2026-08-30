import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { creditar, pontosPorConclusao, pontosPorLicao, ajustarPorPublico } from "@/lib/pontos"
import { montarLicoes, licoesExistentes } from "@/lib/licoes"
import { podeAbrir } from "@/lib/corredor"
import { filtroExploravel, publicoDoUsuario, PUBLICO_ATUAL } from "@/lib/publico"
import { calcularCombo } from "@/lib/combo"
import { devolverPorAcertos, isentoDeEnergia } from "@/lib/energia"
import { bauDaConclusao } from "@/lib/bau"
import { lerOfensiva } from "@/lib/ofensiva"
import { corrigirItem } from "@/lib/licao-item/grading"
import type { ConteudoItem, RespostaItem } from "@/types/licao-item"

export const dynamic = "force-dynamic"

/**
 * O userId sai SEMPRE da sessão — a mesma regra do Painel (`lib/painel.ts`).
 *
 * Aqui havia um fallback: sem sessão, valia o header `x-user-id` do cliente, e
 * um `ensureUser` criava a conta correspondente (`<id>@anon.finlow`) na hora.
 * Somados, os dois davam uma rota de ESCRITA sem login — dava para criar
 * usuário à vontade, gravar progresso na conta de outra pessoa sabendo o id
 * dela e creditar ponto sem nunca abrir uma aula. Nenhuma tela mandava esse
 * header: era resto da era pré-auth. Fechou.
 */
async function getUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

/** Segundos que o cliente reporta, com teto: aba aberta a noite toda não vale
 *  "8 horas de estudo" na tela de fim. 30 min por lição é folga de sobra. */
function segundosPlausiveis(v: unknown): number {
  const n = Number(v)
  if (!isFinite(n) || n < 0) return 0
  return Math.min(Math.round(n), 30 * 60)
}

// PATCH — anda a tela dentro da lição (fire-and-forget do CardFlow/ItemFlow).
// Genérico de propósito: só grava `telaAtual` por `licao`, sem olhar o
// conteúdo — serve os dois formatos sem saber que o novo existe.
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: "Entra na sua conta primeiro" }, { status: 401 })

    const { moduloId, licao, telaAtual } = await req.json()
    if (!moduloId || telaAtual === undefined) {
      return NextResponse.json({ error: "moduloId e telaAtual obrigatórios" }, { status: 400 })
    }

    const n = Number(licao)
    if (n) {
      await db.progressoLicao.upsert({
        where: { userId_moduloId_licao: { userId, moduloId, licao: n } },
        create: { userId, moduloId, licao: n, telaAtual },
        update: { telaAtual },
      })
    }

    // ProgressoModulo continua sendo escrito: é ele que o corredor lê para
    // liberar o módulo seguinte, e as linhas antigas moram nele.
    await db.progressoModulo.upsert({
      where: { userId_moduloId: { userId, moduloId } },
      create: { userId, moduloId, telaAtual },
      update: { telaAtual },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.warn("[progresso PATCH]", e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

/**
 * Conclui um módulo `formato: "item"` (base nova de lições, 20/08/2026).
 *
 * Espelha `concluirClassico` passo a passo — mesma trava de corredor, mesmo
 * congelamento de 1ª passada, mesma camada de jogo gated em
 * `creditoLicao.creditado`, mesmo fechamento "por consequência" — só troca
 * COMO se chega a `acertos`/`totalQuiz`: aqui é `corrigirItem` contra
 * `ItemLicao.conteudo`, ali era o gabarito de `Tela.conteudo.opcoes`. Uma
 * função própria em vez de `if`s espalhados pela função clássica: as duas
 * nunca precisam saber a existência uma da outra, e cada uma pode ser lida
 * (e testada) sozinha.
 *
 * Cada Modulo novo já é a lição inteira — sem sublição, `licao` é sempre 1
 * (ver o comentário de `ProgressoLicao.licao` no schema).
 */
async function concluirItem(userId: string, moduloId: string, respostas: unknown, segundos: unknown) {
  const permissao = await podeAbrir(userId, moduloId, 1)
  if (!permissao.ok) {
    return NextResponse.json({ error: "trancado", motivo: permissao.motivo }, { status: 403 })
  }

  const [modulo, publicoDaPessoa, itens] = await Promise.all([
    db.modulo.findFirst({
      where: { id: moduloId, ...filtroExploravel() },
      select: { pontos: true, publico: true, titulo: true },
    }),
    publicoDoUsuario(userId),
    db.itemLicao.findMany({
      where: { moduloId, papel: { not: "reserva" } },
      orderBy: { ordem: "asc" },
      select: { id: true, conteudo: true },
    }),
  ])
  if (!modulo) return NextResponse.json({ error: "Módulo não encontrado" }, { status: 404 })

  // Mesma postura anti-fraude do quiz clássico: resposta ausente ou de
  // formato errado conta como erro, nunca é ignorada nem lança.
  const escolhas: Record<string, RespostaItem> =
    respostas && typeof respostas === "object" ? (respostas as Record<string, RespostaItem>) : {}
  let acertos = 0
  const resultados: boolean[] = []
  for (const item of itens) {
    const acertou = corrigirItem(item.conteudo as unknown as ConteudoItem, escolhas[item.id])
    resultados.push(acertou)
    if (acertou) acertos++
  }

  const gastos = segundosPlausiveis(segundos)

  const anterior = await db.progressoLicao.findUnique({
    where: { userId_moduloId_licao: { userId, moduloId, licao: 1 } },
    select: { concluido: true },
  })
  const refazendo = !!anterior?.concluido

  await db.progressoLicao.upsert({
    where: { userId_moduloId_licao: { userId, moduloId, licao: 1 } },
    create: {
      userId, moduloId, licao: 1,
      concluido: true, concluidoEm: new Date(),
      acertos, totalQuiz: itens.length, segundos: gastos,
      telaAtual: itens.length,
    },
    update: refazendo
      ? {
          concluidoEm: new Date(),
          acertosRevisao: acertos, totalQuizRevisao: itens.length,
          segundos: { increment: gastos },
          telaAtual: itens.length,
        }
      : {
          concluido: true, concluidoEm: new Date(),
          acertos, totalQuiz: itens.length,
          segundos: { increment: gastos },
          telaAtual: itens.length,
        },
  })

  const creditoLicao = await creditar(
    userId,
    "licao_concluida",
    `${moduloId}:1`,
    ajustarPorPublico(pontosPorLicao(acertos, itens.length), modulo.publico, publicoDaPessoa)
  )

  let comboMax = 0
  let comboBonus = 0
  const coinsGanhos: number | null = null
  let energiaDevolvida: number | null = null
  let pocaoAplicada = false
  if (creditoLicao.creditado) {
    const jogador = await db.user.findUnique({
      where: { id: userId },
      select: { comboAtual: true, comboRecorde: true, pocaoAtiva: true },
    })

    const combo = calcularCombo(jogador?.comboAtual ?? 0, resultados)
    comboMax = combo.comboMax
    if (resultados.length > 0 || combo.combo !== (jogador?.comboAtual ?? 0)) {
      await db.user.update({
        where: { id: userId },
        data: {
          comboAtual: combo.combo,
          comboRecorde: Math.max(jogador?.comboRecorde ?? 0, combo.comboMax),
        },
      })
    }
    if (combo.bonus > 0) {
      const cb = await creditar(
        userId,
        "combo_bonus",
        `${moduloId}:1`,
        ajustarPorPublico(combo.bonus, modulo.publico, publicoDaPessoa)
      )
      if (cb.creditado) comboBonus = cb.pontos
    }

    if (jogador?.pocaoAtiva && creditoLicao.pontos > 0) {
      const pb = await creditar(userId, "pocao_bonus", `${moduloId}:1`, creditoLicao.pontos)
      if (pb.creditado) {
        pocaoAplicada = true
        await db.user.update({ where: { id: userId }, data: { pocaoAtiva: false } })
      }
    }

    if (!(await isentoDeEnergia(userId))) {
      energiaDevolvida = await devolverPorAcertos(userId, acertos, itens.length)
    }
  }

  // O módulo fecha SEMPRE aqui: é a única lição que ele tem. Refazer roda o
  // mesmo caminho de novo (idempotente pela chave de `creditar`), o mesmo
  // comportamento que o conteúdo clássico já tem para um módulo de 1 lição.
  await db.progressoModulo.upsert({
    where: { userId_moduloId: { userId, moduloId } },
    create: { userId, moduloId, concluido: true, concluidoEm: new Date(), telaAtual: 999 },
    update: { concluido: true, concluidoEm: new Date() },
  })
  const creditoModulo = await creditar(
    userId,
    "modulo_concluido",
    moduloId,
    ajustarPorPublico(pontosPorConclusao(acertos, itens.length, modulo.pontos), modulo.publico, publicoDaPessoa)
  )

  const [bauDisponivel, ofensiva] = await Promise.all([
    bauDaConclusao(userId, moduloId),
    lerOfensiva(userId),
  ])

  return NextResponse.json({
    ok: true,
    licao: 1,
    nome: modulo.titulo,
    acertos,
    quizzes: itens.length,
    segundos: gastos,
    pontos: creditoLicao,
    moduloConcluido: true,
    pontosModulo: creditoModulo,
    licoesConcluidas: 1,
    licoesTotal: 1,
    comboMax,
    comboBonus,
    coins: coinsGanhos,
    energiaDevolvida,
    pocaoAplicada,
    precisao: itens.length > 0 ? Math.round((acertos / itens.length) * 100) : null,
    sequencia: ofensiva.atual,
    bauDisponivel,
  })
}

/**
 * Conclui UMA lição de um módulo `formato: "classico"` (as 5 tipos de Tela).
 * O módulo fecha por consequência: quando a última lição dele é concluída, a
 * linha de ProgressoModulo vira concluída e o corredor libera o seguinte.
 */
async function concluirClassico(userId: string, moduloId: string, licao: unknown, respostas: unknown, segundos: unknown) {
  const telas = await db.tela.findMany({
    where: { moduloId },
    select: { id: true, ordem: true, tipo: true, label: true, conteudo: true },
    orderBy: { ordem: "asc" },
  })
  const licoes = montarLicoes(telas as never)
  const numero = Number(licao) || licoes[0]?.licao
  const alvo = licoes.find((l) => l.licao === numero)
  if (!alvo) return NextResponse.json({ error: "Lição não encontrada" }, { status: 404 })

  // Concluir uma lição trancada seria a mesma fraude do GET, pela outra
  // ponta: bastaria POSTar a lição 4 para o módulo inteiro fechar.
  const permissao = await podeAbrir(userId, moduloId, numero)
  if (!permissao.ok) {
    return NextResponse.json({ error: "trancado", motivo: permissao.motivo }, { status: 403 })
  }

  /**
   * O público do MÓDULO e o público da PESSOA, buscados UMA vez.
   *
   * Os dois entram no crédito das duas pontas — lição e módulo —, e precisam
   * ser lidos antes da primeira: aula de outra trilha paga menos, e reduzir só
   * o fechamento do módulo deixaria as 4 lições pagando cheio, que é onde
   * está a maior parte dos pontos. Desde 11/08/2026 a régua é RELATIVA: o
   * aluno de escola paga cheio na aula do próprio segmento e 1/4 na adulta —
   * o espelho exato do adulto explorando a escolar.
   */
  const [modulo, publicoDaPessoa] = await Promise.all([
    db.modulo.findFirst({
      where: { id: moduloId, ...filtroExploravel() },
      select: { pontos: true, publico: true },
    }),
    publicoDoUsuario(userId),
  ])

  /**
   * Quem confere é o SERVIDOR, contra o gabarito do banco, e só os quizzes
   * DESTA lição. O cliente manda as escolhas (telaId → letra), nunca
   * "acertei N": mandar acertos seria pedir para o navegador dar a própria
   * nota.
   *
   * Resposta ausente conta como erro. É a escolha anti-fraude: quem POSTar
   * direto na rota sem responder nada leva o piso, não o cheio — e quem usa
   * o app de verdade sempre respondeu, porque o fluxo não avança sem.
   */
  const quizzes = alvo.telas.filter((t) => t.tipo === "quiz")
  const escolhas: Record<string, string> =
    respostas && typeof respostas === "object" ? (respostas as Record<string, string>) : {}
  let acertos = 0
  // A ordem importa desde o combo (Redesign Fin): `alvo.telas` vem ordenado
  // por `ordem`, então `resultados` é a sequência real de acertos/erros que
  // lib/combo.ts percorre.
  const resultados: boolean[] = []
  for (const q of quizzes) {
    const opcoes = ((q.conteudo as { opcoes?: { letra: string; correta: boolean }[] })
      ?.opcoes) ?? []
    const acertou = !!opcoes.find((o) => o.letra === escolhas[q.id])?.correta
    resultados.push(acertou)
    if (acertou) acertos++
  }

  const gastos = segundosPlausiveis(segundos)

  /**
   * 1ª passada × após correção (protótipo v2). A nota que valeu XP —
   * `acertos`/`totalQuiz` da PRIMEIRA conclusão — vira pedra: refazer grava
   * em `acertosRevisao`/`totalQuizRevisao`, e o professor vê os dois números
   * separados sem a 2ª rodada inflar a média. A leitura antes do upsert é o
   * que distingue "concluindo agora" de "refazendo".
   */
  const anterior = await db.progressoLicao.findUnique({
    where: { userId_moduloId_licao: { userId, moduloId, licao: numero } },
    select: { concluido: true },
  })
  const refazendo = !!anterior?.concluido

  await db.progressoLicao.upsert({
    where: { userId_moduloId_licao: { userId, moduloId, licao: numero } },
    create: {
      userId, moduloId, licao: numero,
      concluido: true, concluidoEm: new Date(),
      acertos, totalQuiz: quizzes.length, segundos: gastos,
      telaAtual: alvo.telas.length,
    },
    update: refazendo
      ? {
          // `concluidoEm` continua andando: é o que as missões diárias contam,
          // e refazer lição sempre valeu para elas. Só a NOTA da 1ª passada
          // não se move.
          concluidoEm: new Date(),
          acertosRevisao: acertos, totalQuizRevisao: quizzes.length,
          // Soma entre visitas: refazer a lição acrescenta o tempo, não substitui.
          segundos: { increment: gastos },
          telaAtual: alvo.telas.length,
        }
      : {
          concluido: true, concluidoEm: new Date(),
          acertos, totalQuiz: quizzes.length,
          segundos: { increment: gastos },
          telaAtual: alvo.telas.length,
        },
  })

  // refId com a lição: refazer não paga de novo, mas cada lição paga a sua.
  const creditoLicao = await creditar(
    userId,
    "licao_concluida",
    `${moduloId}:${numero}`,
    ajustarPorPublico(
      pontosPorLicao(acertos, quizzes.length),
      modulo?.publico ?? PUBLICO_ATUAL,
      publicoDaPessoa
    )
  )

  /**
   * A camada de jogo (Redesign Fin) — TUDO condicionado à primeira
   * conclusão (`creditoLicao.creditado`): refazer lição não mexe no combo,
   * não paga bônus, não dá coin e não devolve energia. É o mesmo proxy de
   * idempotência que os pontos já usam.
   */
  let comboMax = 0
  let comboBonus = 0
  // Sempre nulo desde a economia por XP (15/08/2026); a chave fica na
  // resposta para o cliente antigo não quebrar lendo undefined.
  const coinsGanhos: number | null = null
  let energiaDevolvida: number | null = null
  let pocaoAplicada = false
  if (creditoLicao.creditado) {
    const jogador = await db.user.findUnique({
      where: { id: userId },
      select: { comboAtual: true, comboRecorde: true, pocaoAtiva: true },
    })

    // O combo ATRAVESSA lições: herda de User.comboAtual e devolve a
    // sequência viva. O chip do player é cortesia; este recálculo contra o
    // gabarito é o que vale.
    const combo = calcularCombo(jogador?.comboAtual ?? 0, resultados)
    comboMax = combo.comboMax
    if (resultados.length > 0 || combo.combo !== (jogador?.comboAtual ?? 0)) {
      await db.user.update({
        where: { id: userId },
        data: {
          comboAtual: combo.combo,
          comboRecorde: Math.max(jogador?.comboRecorde ?? 0, combo.comboMax),
        },
      })
    }
    if (combo.bonus > 0) {
      const cb = await creditar(
        userId,
        "combo_bonus",
        `${moduloId}:${numero}`,
        ajustarPorPublico(combo.bonus, modulo?.publico ?? PUBLICO_ATUAL, publicoDaPessoa)
      )
      if (cb.creditado) comboBonus = cb.pontos
    }

    // Poção ×2: um SEGUNDO crédito no valor do primeiro — o teto de
    // licao_concluida fica intacto. Consome a poção só se o bônus entrou.
    if (jogador?.pocaoAtiva && creditoLicao.pontos > 0) {
      const pb = await creditar(userId, "pocao_bonus", `${moduloId}:${numero}`, creditoLicao.pontos)
      if (pb.creditado) {
        pocaoAplicada = true
        await db.user.update({ where: { id: userId }, data: { pocaoAtiva: false } })
      }
    }

    // Lição NÃO paga mais moeda (economia por XP, 15/08/2026): moeda nasce
    // só da conversão na loja. O campo `coins` da resposta fica nulo e o
    // chip da tela de fim some sozinho.

    if (!(await isentoDeEnergia(userId))) {
      energiaDevolvida = await devolverPorAcertos(userId, acertos, quizzes.length)
    }
  }

  // ---- o módulo fecha quando a última lição fecha ----
  const concluidas = await db.progressoLicao.count({
    where: { userId, moduloId, concluido: true },
  })
  const totalLicoes = licoesExistentes(telas).length
  const moduloFechou = concluidas >= totalLicoes

  let creditoModulo: Awaited<ReturnType<typeof creditar>> | null = null
  if (moduloFechou) {
    await db.progressoModulo.upsert({
      where: { userId_moduloId: { userId, moduloId } },
      create: { userId, moduloId, concluido: true, concluidoEm: new Date(), telaAtual: 999 },
      update: { concluido: true, concluidoEm: new Date() },
    })
    // Soma o acerto de TODAS as lições para o bônus do módulo, e o valor
    // cheio vem do PRÓPRIO módulo (30/40/50 por nível). Antes era 30 fixo
    // para todos, do mais simples ao mais difícil.
    const todas = await db.progressoLicao.findMany({
      where: { userId, moduloId, concluido: true },
      select: { acertos: true, totalQuiz: true },
    })
    const somaAcertos = todas.reduce((s, p) => s + p.acertos, 0)
    const somaQuiz = todas.reduce((s, p) => s + p.totalQuiz, 0)
    creditoModulo = await creditar(
      userId,
      "modulo_concluido",
      moduloId,
      ajustarPorPublico(
        pontosPorConclusao(somaAcertos, somaQuiz, modulo?.pontos),
        modulo?.publico ?? PUBLICO_ATUAL,
        publicoDaPessoa
      )
    )
  }

  // O baú aparece quando o módulo recém-fechado completa a unidade dele
  // (bloco escolar ou leva adulta) e ainda não foi aberto.
  const [bauDisponivel, ofensiva] = await Promise.all([
    moduloFechou ? bauDaConclusao(userId, moduloId) : Promise.resolve(null),
    lerOfensiva(userId),
  ])

  return NextResponse.json({
    ok: true,
    licao: numero,
    nome: alvo.nome,
    acertos,
    quizzes: quizzes.length,
    segundos: gastos,
    pontos: creditoLicao,
    moduloConcluido: moduloFechou,
    pontosModulo: creditoModulo,
    licoesConcluidas: concluidas,
    licoesTotal: totalLicoes,
    // --- a camada de jogo (Redesign Fin); cliente antigo ignora ---
    comboMax,
    comboBonus,
    coins: coinsGanhos,
    energiaDevolvida,
    pocaoAplicada,
    precisao: quizzes.length > 0 ? Math.round((acertos / quizzes.length) * 100) : null,
    sequencia: ofensiva.atual,
    bauDisponivel,
  })
}

// POST — conclui um módulo/lição.
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: "Entra na sua conta primeiro" }, { status: 401 })

    const { moduloId, licao, respostas, segundos } = await req.json()
    if (!moduloId) return NextResponse.json({ error: "moduloId obrigatório" }, { status: 400 })

    // O formato decide qual gabarito confere a resposta — ver o comentário
    // de `concluirItem` para o porquê de duas funções em vez de um `if` no
    // meio da lógica clássica. `...filtroExploravel()` mesmo sendo só um
    // roteador: scripts/testar-publico.mts exige o filtro em TODA leitura
    // de Modulo, sem exceção por "é só pra decidir o formato".
    const formato = (
      await db.modulo.findFirst({ where: { id: moduloId, ...filtroExploravel() }, select: { formato: true } })
    )?.formato
    if (formato === "item") return await concluirItem(userId, moduloId, respostas, segundos)
    return await concluirClassico(userId, moduloId, licao, respostas, segundos)
  } catch (e) {
    console.warn("[progresso POST]", e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
