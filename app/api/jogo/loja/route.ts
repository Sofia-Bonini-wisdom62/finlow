import { NextRequest, NextResponse } from "next/server"
import { getUserIdOr401 } from "@/lib/painel"
import { comprarItem } from "@/lib/loja"

export const dynamic = "force-dynamic"

const MENSAGENS: Record<string, string> = {
  desconhecido: "Esse item não existe na loja.",
  saldo: "Moedas insuficientes. Troque XP por moedas na banca da loja.",
  ja_tem: "Você já tem esse item.",
  pocao_ativa: "Você já tem uma poção ativa. Use antes de comprar outra.",
}

/** POST /api/jogo/loja { itemId } — compra um item do catálogo. */
export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const corpo = await req.json().catch(() => null)
  const itemId = typeof corpo?.itemId === "string" ? corpo.itemId : ""

  const r = await comprarItem(userId, itemId)
  if (!r.ok) {
    const msg = MENSAGENS[r.motivo]
    return NextResponse.json({ ok: false, motivo: r.motivo, erro: msg, error: msg }, { status: 409 })
  }
  return NextResponse.json({ ok: true, total: r.total })
}
