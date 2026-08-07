import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { creditar, pontosPorConclusao } from "@/lib/pontos"

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

// PATCH — atualiza telaAtual (fire-and-forget do CardFlow)
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: "Entra na sua conta primeiro" }, { status: 401 })

    const { moduloId, telaAtual } = await req.json()
    if (!moduloId || telaAtual === undefined) {
      return NextResponse.json({ error: "moduloId e telaAtual obrigatórios" }, { status: 400 })
    }

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

// POST — marca módulo como concluído
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: "Entra na sua conta primeiro" }, { status: 401 })

    const { moduloId, respostas } = await req.json()
    if (!moduloId) return NextResponse.json({ error: "moduloId obrigatório" }, { status: 400 })

    await db.progressoModulo.upsert({
      where: { userId_moduloId: { userId, moduloId } },
      create: { userId, moduloId, concluido: true, concluidoEm: new Date(), telaAtual: 999 },
      update: { concluido: true, concluidoEm: new Date() },
    })

    /**
     * Os pontos são proporcionais ao acerto nos quizzes, e quem confere é o
     * SERVIDOR, contra o gabarito do banco. O cliente manda as escolhas
     * (telaId → letra), nunca "acertei N": mandar acertos seria pedir para o
     * navegador dar a própria nota.
     *
     * Resposta ausente conta como erro. É a escolha anti-fraude: quem POSTar
     * direto na rota sem responder nada leva o piso, não o cheio — e quem usa
     * o app de verdade sempre respondeu, porque o fluxo não avança sem.
     */
    const quizzes = await db.tela.findMany({
      where: { moduloId, tipo: "quiz" },
      select: { id: true, conteudo: true },
    })
    const escolhas: Record<string, string> =
      respostas && typeof respostas === "object" ? respostas : {}
    let acertos = 0
    for (const q of quizzes) {
      const opcoes = ((q.conteudo as { opcoes?: { letra: string; correta: boolean }[] })
        ?.opcoes) ?? []
      const escolhida = opcoes.find((o) => o.letra === escolhas[q.id])
      if (escolhida?.correta) acertos++
    }

    // Refazer um módulo já concluído não credita de novo: o refId é o próprio
    // módulo, então a segunda vez esbarra na chave única e vira `creditado:
    // false`. Ponto não pode ser pagar de novo pelo mesmo trabalho.
    const credito = await creditar(
      userId,
      "modulo_concluido",
      moduloId,
      pontosPorConclusao(acertos, quizzes.length)
    )

    return NextResponse.json({ ok: true, pontos: credito, acertos, quizzes: quizzes.length })
  } catch (e) {
    console.warn("[progresso POST]", e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
