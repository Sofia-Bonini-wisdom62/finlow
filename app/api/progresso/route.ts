import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { creditar, pontosPorConclusao, pontosPorLicao } from "@/lib/pontos"
import { montarLicoes, licoesExistentes } from "@/lib/licoes"
import { podeAbrir } from "@/lib/corredor"

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

// PATCH — anda a tela dentro da lição (fire-and-forget do CardFlow)
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
 * POST — conclui UMA lição.
 *
 * O módulo fecha por consequência: quando a última lição dele é concluída, a
 * linha de ProgressoModulo vira concluída e o corredor libera o seguinte. Não
 * existe mais "concluir módulo" como ação.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: "Entra na sua conta primeiro" }, { status: 401 })

    const { moduloId, licao, respostas, segundos } = await req.json()
    if (!moduloId) return NextResponse.json({ error: "moduloId obrigatório" }, { status: 400 })

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
      respostas && typeof respostas === "object" ? respostas : {}
    let acertos = 0
    for (const q of quizzes) {
      const opcoes = ((q.conteudo as { opcoes?: { letra: string; correta: boolean }[] })
        ?.opcoes) ?? []
      if (opcoes.find((o) => o.letra === escolhas[q.id])?.correta) acertos++
    }

    const gastos = segundosPlausiveis(segundos)

    await db.progressoLicao.upsert({
      where: { userId_moduloId_licao: { userId, moduloId, licao: numero } },
      create: {
        userId, moduloId, licao: numero,
        concluido: true, concluidoEm: new Date(),
        acertos, totalQuiz: quizzes.length, segundos: gastos,
        telaAtual: alvo.telas.length,
      },
      update: {
        concluido: true, concluidoEm: new Date(),
        acertos, totalQuiz: quizzes.length,
        // Soma entre visitas: refazer a lição acrescenta o tempo, não substitui.
        segundos: { increment: gastos },
        telaAtual: alvo.telas.length,
      },
    })

    // refId com a lição: refazer não paga de novo, mas cada lição paga a sua.
    const creditoLicao = await creditar(
      userId,
      "licao_concluida",
      `${moduloId}:${numero}`,
      pontosPorLicao(acertos, quizzes.length)
    )

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
      // Soma o acerto de TODAS as lições para o bônus do módulo — o valor da
      // tabela continua 30, igual ao que as contas antigas receberam.
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
        pontosPorConclusao(somaAcertos, somaQuiz)
      )
    }

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
    })
  } catch (e) {
    console.warn("[progresso POST]", e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
