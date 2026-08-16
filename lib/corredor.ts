import { db } from "@/lib/db"
import {
  filtroDeModulo,
  filtroExploravel,
  ehDeOutroPublico,
  publicoDoUsuario,
  PUBLICO_ATUAL,
} from "@/lib/publico"
import { licoesExistentes, type NumeroLicao } from "@/lib/licoes"
import { modulosConcedidos } from "@/lib/escola-acesso"

/**
 * O CORREDOR: quem está liberado e quem está trancado.
 *
 * DECISÃO DA FUNDADORA, 05/08/2026 — e é uma REVERSÃO deliberada.
 * Até esta data a Trilha era biblioteca posicionada: nenhum módulo travava
 * outro, e a aula era achada por nível e situação. A trava havia sido removida
 * de propósito, com o argumento de que transformava quem veio tirar uma dúvida
 * específica em alguém que desiste. Sofia decidiu voltar ao corredor com essa
 * ressalva à vista, escolhendo a variante que tranca ENTRE módulos:
 *
 *   módulo 1  ✓ 4/4 lições
 *   módulo 2  ← 2/4 lições
 *   módulo 3  🔒 conclua o módulo 2
 *
 * Quem chegar com dúvida no módulo 5 passa pelos quatro primeiros. Esse é o
 * custo aceito, não um efeito colateral que ninguém previu.
 *
 * A ORDEM DO CORREDOR NÃO É Modulo.ordem — para o ADULTO.
 * É a sequência das recomendações da própria pessoa (RecomendacaoTrilha,
 * ordenada por leva e depois por ordem), que a IA monta a partir dos números
 * dela. Duas pessoas têm corredores diferentes — é o item "blocos em ordem,
 * ordenados pela IA" do backlog, e é o que impede o corredor de virar uma fila
 * única igual para todo mundo. Módulo que ainda não entrou em leva nenhuma
 * aparece trancado com esse motivo.
 *
 * PARA O ALUNO DE ESCOLA (publico escolar, 11/08/2026) a ordem É Modulo.ordem:
 * a trilha do segmento é currículo, não recomendação — a progressão pedagógica
 * dos blocos já está codificada na coluna, e não há IA montando leva sobre o
 * 4º ano. O travamento entre módulos é o MESMO. `preRequisitoSlug` continua
 * inerte de propósito: a ordem linear cobre o grafo na prática (as 102 arestas
 * seguem a ordem), e ligar o grafo real é projeto próprio, registrado no
 * backlog.
 *
 * QUEM JÁ CONCLUIU ANTES DO CORREDOR NÃO PODE SER TRANCADO
 * Existem `ProgressoModulo.concluido = true` de antes das lições existirem, sem
 * nenhuma linha de `ProgressoLicao`. Contar só as lições faria essa pessoa
 * reabrir como 0/4 e perder acesso ao que já terminou. Por isso módulo com
 * `concluido = true` conta como lições todas fechadas, aqui na LEITURA.
 *
 * E só na leitura: não há migração inventando linhas de ProgressoLicao para
 * quem veio de antes. Preencher exigiria escolher um `acertos` que ninguém
 * mediu, e esse número reaparece na tela de fim como se fosse a nota real
 * daquela pessoa. Dado que não foi medido não vira registro.
 */

export type EstadoModulo = "concluido" | "liberado" | "trancado"

export interface LicaoNoCorredor {
  licao: NumeroLicao
  concluida: boolean
  liberada: boolean
  acertos: number
  totalQuiz: number
}

export interface ModuloNoCorredor {
  moduloId: string
  slug: string
  estado: EstadoModulo
  /** Posição na sequência da pessoa; 0 para quem ainda não entrou em leva. */
  posicao: number
  licoesConcluidas: number
  licoesTotal: number
  licoes: LicaoNoCorredor[]
  /** Por que está trancado, em português, pronto para a tela. */
  bloqueio: string | null
  /**
   * Só o TÍTULO do módulo que barra este.
   *
   * Existe além de `bloqueio` porque as duas telas pedem coisas diferentes: a
   * lista quer a frase pronta, e o caminho monta a própria ("conclua X para
   * abrir"). Passar a frase onde se espera o título produz "conclua Conclua X
   * para abrir. para abrir" — que foi o que apareceu na primeira montagem.
   */
  bloqueadoPor: string | null
  /** A lição a abrir ao tocar. null quando o módulo está concluído ou trancado. */
  proximaLicao: NumeroLicao | null
}

export interface Corredor {
  modulos: Map<string, ModuloNoCorredor>
  /** O módulo em que a pessoa está agora — o primeiro liberado não concluído. */
  atual: ModuloNoCorredor | null
}

/**
 * Monta o corredor inteiro da pessoa, de uma vez.
 *
 * De uma vez porque a Trilha desenha 67 cards e cada um precisa saber se está
 * trancado e por quê: resolver módulo por módulo seriam 67 idas ao banco para
 * responder a mesma pergunta. As telas vêm sem a coluna `conteudo` — ver
 * `TelaMinima` em lib/licoes.ts.
 */
export async function montarCorredor(userId: string): Promise<Corredor> {
  const publico = await publicoDoUsuario(userId)
  const [modulos, recomendacoes, progModulos, progLicoes] = await Promise.all([
    db.modulo.findMany({
      where: filtroDeModulo(publico),
      select: {
        id: true,
        slug: true,
        titulo: true,
        ordem: true,
        telas: { select: { tipo: true, ordem: true } },
      },
      orderBy: { ordem: "asc" },
    }),
    db.recomendacaoTrilha.findMany({
      where: { userId, substituidaEm: null },
      select: { moduloId: true, leva: true, ordem: true },
      orderBy: [{ leva: "asc" }, { ordem: "asc" }],
    }),
    db.progressoModulo.findMany({
      where: { userId },
      select: { moduloId: true, concluido: true },
    }),
    db.progressoLicao.findMany({
      where: { userId },
      select: { moduloId: true, licao: true, concluido: true, acertos: true, totalQuiz: true },
    }),
  ])

  const concluidoAntigo = new Set(progModulos.filter((p) => p.concluido).map((p) => p.moduloId))
  const porModuloLicao = new Map(progLicoes.map((p) => [`${p.moduloId}:${p.licao}`, p]))

  // A sequência da pessoa. No adulto, vem das recomendações — um módulo pode
  // aparecer em duas levas (o chat trocou e depois voltou); vale a PRIMEIRA
  // aparição, senão ele andaria para o fim do corredor e trancaria o que já
  // estava liberado. No aluno de escola, a sequência é a ordem pedagógica dos
  // blocos (os módulos já chegam ordenados por `ordem`), e TODOS entram — não
  // existe "ainda não entrou na sua trilha" para quem tem currículo.
  const sequencia: string[] = []
  if (publico === PUBLICO_ATUAL) {
    for (const r of recomendacoes) {
      if (!sequencia.includes(r.moduloId)) sequencia.push(r.moduloId)
    }
  } else {
    // Concessão da turma (lib/escola-acesso.ts): null = trilha completa.
    // Módulo fora da concessão fica FORA da sequência — cai no acervo abaixo,
    // trancado com o motivo escolar, e não trava os seguintes: o corredor é
    // só o que a turma liberou.
    const concedidos = await modulosConcedidos(userId)
    for (const m of modulos) {
      if (!concedidos || concedidos.has(m.id)) sequencia.push(m.id)
    }
  }

  const porId = new Map(modulos.map((m) => [m.id, m]))
  const saida = new Map<string, ModuloNoCorredor>()

  /** Estado das lições de um módulo, sem decidir ainda se o módulo abriu. */
  function estadoDasLicoes(moduloId: string, existentes: NumeroLicao[]) {
    const jaEra = concluidoAntigo.has(moduloId)
    let anteriorConcluida = true
    const licoes: LicaoNoCorredor[] = existentes.map((n) => {
      const p = porModuloLicao.get(`${moduloId}:${n}`)
      const concluida = jaEra || !!p?.concluido
      const liberada = concluida || anteriorConcluida
      anteriorConcluida = concluida
      return {
        licao: n,
        concluida,
        liberada,
        acertos: p?.acertos ?? 0,
        totalQuiz: p?.totalQuiz ?? 0,
      }
    })
    const concluidas = licoes.filter((l) => l.concluida).length
    return { licoes, concluidas }
  }

  // ------ 1. os módulos da sequência, em ordem, com a trava entre eles ------
  // Título puro do módulo que barra os seguintes. As aspas entram só na frase.
  let travadoDaqui: string | null = null

  sequencia.forEach((moduloId, i) => {
    const m = porId.get(moduloId)
    if (!m) return // módulo de outro público, ou apagado

    const existentes = licoesExistentes(m.telas)
    const { licoes, concluidas } = estadoDasLicoes(moduloId, existentes)
    const fechado = existentes.length > 0 && concluidas === existentes.length

    const trancado = travadoDaqui !== null
    const primeiraAberta = licoes.find((l) => !l.concluida)?.licao ?? null

    saida.set(moduloId, {
      moduloId,
      slug: m.slug,
      estado: fechado ? "concluido" : trancado ? "trancado" : "liberado",
      posicao: i + 1,
      licoesConcluidas: concluidas,
      licoesTotal: existentes.length,
      licoes,
      bloqueio: trancado ? `Conclua “${travadoDaqui}” para abrir.` : null,
      bloqueadoPor: trancado ? travadoDaqui : null,
      proximaLicao: trancado || fechado ? null : primeiraAberta,
    })

    // O primeiro não concluído fecha o corredor para todos os seguintes.
    // O TÍTULO, não o slug: "Conclua lancador-m1-fluxo" não diz nada a ninguém.
    if (!fechado && travadoDaqui === null) travadoDaqui = m.titulo
  })

  // ------ 2. o que ainda não entrou em leva nenhuma ------
  for (const m of modulos) {
    if (saida.has(m.id)) continue
    const existentes = licoesExistentes(m.telas)
    const { licoes, concluidas } = estadoDasLicoes(m.id, existentes)
    const fechado = existentes.length > 0 && concluidas === existentes.length

    saida.set(m.id, {
      moduloId: m.id,
      slug: m.slug,
      // Concluído antes do corredor continua concluído: tirar acesso ao que a
      // pessoa já terminou seria punir quem estava em dia.
      estado: fechado ? "concluido" : "trancado",
      posicao: 0,
      licoesConcluidas: concluidas,
      licoesTotal: existentes.length,
      licoes,
      bloqueio: fechado
        ? null
        : publico === PUBLICO_ATUAL
          ? "Ainda não entrou na sua trilha."
          : "Sua turma ainda não liberou esta parte.",
      bloqueadoPor: null,
      proximaLicao: null,
    })
  }

  const atual =
    sequencia
      .map((id) => saida.get(id))
      .find((m): m is ModuloNoCorredor => !!m && m.estado === "liberado") ?? null

  return { modulos: saida, atual }
}

/**
 * A pessoa pode abrir ESTA lição deste módulo?
 *
 * O player pergunta antes de servir as telas, e a rota recusa no SERVIDOR: sem
 * isso o corredor existiria só no desenho, e trocar o número na URL bastaria
 * para pular a fila.
 */
export async function podeAbrir(
  userId: string,
  moduloId: string,
  licao: number
): Promise<{ ok: true } | { ok: false; motivo: string }> {
  const corredor = await montarCorredor(userId)
  const m = corredor.modulos.get(moduloId)

  /**
   * Módulo fora do corredor: pode ser aula de OUTRO público, e aí é liberado.
   *
   * A trilha escolar é explorável mas não é a trilha de ninguém adulto — ela
   * nunca entra em `RecomendacaoTrilha`, então nunca aparece no corredor. Sem
   * este ramo o `montarCorredor` diria "não encontrado" e a pessoa veria a aula
   * na biblioteca sem conseguir abrir, que é o pior dos dois mundos.
   *
   * Não há sequência a respeitar aqui de propósito: corredor é a ordem que a IA
   * montou PARA a pessoa, e ela não montou nada sobre o 4º ano. Quem entra pela
   * biblioteca abre a lição que quiser.
   */
  if (!m) {
    const [publico, outro] = await Promise.all([
      publicoDoUsuario(userId),
      db.modulo.findFirst({
        where: { id: moduloId, ...filtroExploravel() },
        select: { publico: true },
      }),
    ])
    // Simétrico desde 11/08/2026: para o aluno de escola, é a aula ADULTA que
    // cai neste ramo — explorável, na lição que ele quiser, valendo metade.
    if (outro && ehDeOutroPublico(outro.publico, publico)) return { ok: true }
    return { ok: false, motivo: "Módulo não encontrado." }
  }

  if (m.estado === "trancado") {
    return { ok: false, motivo: m.bloqueio ?? "Este módulo ainda não abriu." }
  }

  const l = m.licoes.find((x) => x.licao === licao)
  if (!l) return { ok: false, motivo: "Esta lição não existe neste módulo." }
  if (!l.liberada) {
    return { ok: false, motivo: "Conclua a lição anterior para abrir esta." }
  }
  return { ok: true }
}
