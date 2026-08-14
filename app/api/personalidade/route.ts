import { NextRequest, NextResponse } from "next/server"
import { getUserIdOr401 } from "@/lib/painel"
import { lerPersonalidade, salvarPersonalidade } from "@/lib/personalidade-repo"
import { detalheLimpo, MAX_DETALHE, PERSONALIDADES } from "@/lib/personalidade"

export const dynamic = "force-dynamic"

/**
 * Tom do assistente.
 *
 * O catálogo sai daqui junto com a escolha, num GET só: a tela precisa dos dois
 * na primeira pintura, e uma lista de tons escrita à mão no cliente seria uma
 * segunda verdade que envelhece calada no dia em que um tom for renomeado.
 */

// GET — os tons disponíveis e o que esta pessoa escolheu
export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const escolha = await lerPersonalidade(userId)
    return NextResponse.json({
      escolha,
      maxDetalhe: MAX_DETALHE,
      // `instrucao` NÃO sai: é prompt de sistema, e prompt de sistema numa
      // resposta de API é prompt de sistema numa aba de rede aberta.
      personalidades: PERSONALIDADES.map((p) => ({
        id: p.id,
        nome: p.nome,
        resumo: p.resumo,
        exemplo: p.exemplo,
      })),
    })
  } catch (e) {
    console.error("[personalidade] GET", (e as Error)?.message)
    return NextResponse.json(
      { codigo: "INDISPONIVEL", erro: "Não consegui carregar agora." },
      { status: 503 }
    )
  }
}

// PATCH — troca o tom, o texto livre, ou os dois
export async function PATCH(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const corpo = await req.json()
    if (!corpo || typeof corpo !== "object") {
      return NextResponse.json(
        { codigo: "PEDIDO_INVALIDO", erro: "Envie 'id' e/ou 'detalhe'." },
        { status: 400 }
      )
    }

    /**
     * Texto que a limpeza rejeita INTEIRO vira erro visível, não gravação
     * silenciosa de "".
     *
     * A pessoa escreveu alguma coisa; salvar vazio e devolver 200 a faria sair
     * da tela achando que ficou guardado, e descobrir o contrário só pelo
     * comportamento do assistente, que é o pior lugar para descobrir.
     * Apagar de propósito continua valendo: aí ela manda "" e nada é rejeitado.
     */
    const querApagar = typeof corpo.detalhe === "string" && corpo.detalhe.trim() === ""
    if (corpo.detalhe !== undefined && !querApagar && !detalheLimpo(corpo.detalhe)) {
      return NextResponse.json(
        {
          codigo: "DETALHE_INVALIDO",
          erro: "Não consegui guardar esse texto. Escreve uma frase curta, com pelo menos 3 letras e sem palavrão.",
        },
        { status: 400 }
      )
    }

    const escolha = await salvarPersonalidade(userId, {
      id: corpo.id,
      detalhe: corpo.detalhe,
    })
    return NextResponse.json({ escolha })
  } catch (e) {
    console.error("[personalidade] PATCH", (e as Error)?.message)
    return NextResponse.json(
      { codigo: "INDISPONIVEL", erro: "Não consegui salvar agora." },
      { status: 503 }
    )
  }
}
