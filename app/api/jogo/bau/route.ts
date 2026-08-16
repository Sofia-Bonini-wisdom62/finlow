import { NextRequest, NextResponse } from "next/server"
import { getUserIdOr401 } from "@/lib/painel"
import { abrirBau } from "@/lib/bau"

export const dynamic = "force-dynamic"

const MENSAGENS: Record<string, string> = {
  incompleto: "Ainda falta aula pra fechar essa unidade.",
  ja_aberto: "Esse baú já foi aberto.",
}

/** POST /api/jogo/bau { refId } — abre o baú de uma unidade completa. */
export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const corpo = await req.json().catch(() => null)
  const refId = typeof corpo?.refId === "string" ? corpo.refId : ""

  const r = await abrirBau(userId, refId)
  if (!r.ok) {
    const msg = MENSAGENS[r.motivo]
    return NextResponse.json({ ok: false, motivo: r.motivo, erro: msg, error: msg }, { status: 409 })
  }
  return NextResponse.json({ ok: true, xp: r.xp, total: r.total })
}
