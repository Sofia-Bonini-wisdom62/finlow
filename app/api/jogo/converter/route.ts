import { NextRequest, NextResponse } from "next/server"
import { getUserIdOr401 } from "@/lib/painel"
import { converterXpEmMoedas } from "@/lib/conversao"

export const dynamic = "force-dynamic"

const MENSAGENS: Record<string, string> = {
  pacote: "Esse pacote não existe.",
  sem_xp: "XP insuficiente pra esse pacote.",
}

/** POST /api/jogo/converter { pacote } — troca XP por moedas (a única origem
 *  de moeda desde 15/08/2026). O débito desconta do ranking e do nível, de
 *  propósito: gastar é escolha com preço. */
export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const corpo = await req.json().catch(() => null)
  const pacote = typeof corpo?.pacote === "string" ? corpo.pacote : ""

  const r = await converterXpEmMoedas(userId, pacote)
  if (!r.ok) {
    const msg = MENSAGENS[r.motivo]
    return NextResponse.json({ ok: false, motivo: r.motivo, erro: msg, error: msg }, { status: 409 })
  }
  return NextResponse.json({
    ok: true,
    xp: r.xp,
    moedas: r.moedas,
    pontosTotal: r.pontosTotal,
    coinsTotal: r.coinsTotal,
  })
}
