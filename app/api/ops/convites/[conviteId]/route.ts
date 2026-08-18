import { NextRequest, NextResponse } from "next/server"
import { exigirOps } from "@/lib/ops"
import { revogarConvite } from "@/lib/ops-escola"

export const dynamic = "force-dynamic"

/**
 * DELETE /api/ops/convites/{id} — mata um código.
 *
 * `revogadoEm` estava no schema desde o primeiro dia e era LIDO em quatro
 * lugares (o preview, o motivo de recusa, o `where` do resgate) sem que nada
 * jamais o escrevesse. Um convite de turma no grupo errado do WhatsApp só
 * morria por expirar em trinta dias ou por esgotar os cinquenta usos, e as
 * duas saídas são lentas demais para o caso em que alguém percebe na hora.
 *
 * Revogar não desfaz matrícula: quem já entrou continua na turma. É trancar a
 * porta, não expulsar quem passou.
 */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ conviteId: string }> }) {
  const op = await exigirOps()
  if (op instanceof NextResponse) return op
  const { conviteId } = await ctx.params

  const r = await revogarConvite(conviteId)
  if (!r.ok) {
    return NextResponse.json({ codigo: "CONVITE", erro: r.detalhe, error: r.detalhe }, { status: 400 })
  }
  console.log(`[ops] ${op.email} revogou o convite ${conviteId}`)
  return NextResponse.json({ ok: true })
}
