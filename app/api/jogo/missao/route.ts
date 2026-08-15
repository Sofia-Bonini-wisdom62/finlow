import { NextRequest, NextResponse } from "next/server"
import { getUserIdOr401 } from "@/lib/painel"
import { resgatarMissao } from "@/lib/missoes"

export const dynamic = "force-dynamic"

const MENSAGENS: Record<string, string> = {
  desconhecida: "Essa missão não existe.",
  incompleta: "Essa missão ainda não foi completada.",
  ja_resgatada: "Você já resgatou essa missão hoje.",
}

/** POST /api/jogo/missao { missaoId } — resgata os coins de uma missão do dia. */
export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const corpo = await req.json().catch(() => null)
  const missaoId = typeof corpo?.missaoId === "string" ? corpo.missaoId : ""

  const r = await resgatarMissao(userId, missaoId)
  if (!r.ok) {
    const msg = MENSAGENS[r.motivo]
    return NextResponse.json({ ok: false, motivo: r.motivo, erro: msg, error: msg }, { status: 409 })
  }
  return NextResponse.json({ ok: true, moedas: r.moedas, total: r.total })
}
