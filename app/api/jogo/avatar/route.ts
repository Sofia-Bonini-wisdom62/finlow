import { NextRequest, NextResponse } from "next/server"
import { getUserIdOr401 } from "@/lib/painel"
import { equiparAvatar } from "@/lib/loja"

export const dynamic = "force-dynamic"

const MENSAGENS: Record<string, string> = {
  desconhecido: "Esse avatar não existe.",
  nao_tem: "Você ainda não tem esse avatar — ele está na loja.",
}

/** PATCH /api/jogo/avatar { itemId | null } — equipa ou tira o avatar do Fin. */
export async function PATCH(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const corpo = await req.json().catch(() => null)
  const itemId = corpo?.itemId === null ? null : typeof corpo?.itemId === "string" ? corpo.itemId : ""
  if (itemId === "") {
    return NextResponse.json(
      { ok: false, erro: "Diz qual avatar equipar (ou null pra tirar).", error: "Diz qual avatar equipar (ou null pra tirar)." },
      { status: 400 }
    )
  }

  const r = await equiparAvatar(userId, itemId)
  if (!r.ok) {
    const msg = MENSAGENS[r.motivo]
    return NextResponse.json({ ok: false, motivo: r.motivo, erro: msg, error: msg }, { status: 409 })
  }
  return NextResponse.json({ ok: true })
}
