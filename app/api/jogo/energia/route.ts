import { NextResponse } from "next/server"
import { getUserIdOr401 } from "@/lib/painel"
import { comprarRecarga } from "@/lib/energia"

export const dynamic = "force-dynamic"

const MENSAGENS: Record<string, string> = {
  isento: "Sua energia já é infinita.",
  cheia: "Sua energia já está cheia.",
  saldo: "Moedas insuficientes. Troque XP por moedas na loja.",
}

/** POST /api/jogo/energia — recarga cheia por moedas (16/08/2026). */
export async function POST() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const r = await comprarRecarga(userId)
  if (!r.ok) {
    const msg = MENSAGENS[r.motivo]
    return NextResponse.json({ ok: false, motivo: r.motivo, erro: msg, error: msg }, { status: 409 })
  }
  return NextResponse.json({ ok: true, energia: r.energia, coins: r.coins })
}
