import { NextRequest, NextResponse } from "next/server"
import { getUserIdOr401 } from "@/lib/painel"
import {
  listarConversas,
  abrirConversa,
  apagarConversa,
  apagarTodasConversas,
} from "@/lib/conversa-repo"

export const dynamic = "force-dynamic"

/**
 * Histórico de conversas.
 *
 * GET sem `id` lista; GET com `id` abre. Duas rotas fariam a mesma coisa com
 * dois nomes.
 */
export async function GET(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const id = new URL(req.url).searchParams.get("id")

  try {
    if (!id) return NextResponse.json({ conversas: await listarConversas(userId) })

    const mensagens = await abrirConversa(userId, id)
    if (!mensagens) {
      return NextResponse.json(
        { codigo: "NAO_ENCONTRADA", erro: "Essa conversa não existe mais." },
        { status: 404 }
      )
    }
    return NextResponse.json({ conversaId: id, mensagens })
  } catch (e) {
    console.error("[conversas] GET", (e as Error)?.message)
    return NextResponse.json(
      { codigo: "INDISPONIVEL", erro: "Não consegui carregar o histórico agora." },
      { status: 503 }
    )
  }
}

// DELETE — ?id=xxx apaga uma; ?tudo=1 apaga todas
export async function DELETE(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const { searchParams } = new URL(req.url)

  try {
    if (searchParams.get("tudo") === "1") {
      return NextResponse.json({ apagadas: await apagarTodasConversas(userId) })
    }
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ codigo: "PEDIDO_INVALIDO", erro: "Falta o id." }, { status: 400 })
    }
    const ok = await apagarConversa(userId, id)
    return NextResponse.json({ apagadas: ok ? 1 : 0 })
  } catch (e) {
    console.error("[conversas] DELETE", (e as Error)?.message)
    return NextResponse.json(
      { codigo: "INDISPONIVEL", erro: "Não consegui apagar agora." },
      { status: 503 }
    )
  }
}
