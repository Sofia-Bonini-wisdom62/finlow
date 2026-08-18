import { NextRequest, NextResponse } from "next/server"
import { exigirOps } from "@/lib/ops"
import { fimDoDiaEmSaoPaulo, mudarStatusDaEscola, mudarVigencia } from "@/lib/ops-escola"

export const dynamic = "force-dynamic"

/**
 * PATCH /api/ops/escolas/{id} — status e vigência, o contrato da escola.
 *
 * Suspender é o botão de emergência descrito em lib/escola.ts, e ele recusa
 * TODO papel de dentro da escola, o adm inclusive. Por isso mora aqui: um
 * botão que o suspenso pode desligar não suspende nada.
 *
 * `ativaAte: null` explícito devolve a escola ao piloto sem prazo. Campo
 * ausente não mexe na vigência, que é diferente de mandar null.
 */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ escolaId: string }> }) {
  const op = await exigirOps()
  if (op instanceof NextResponse) return op
  const { escolaId } = await ctx.params

  const corpo = await req.json().catch(() => null)
  if (!corpo || typeof corpo !== "object") {
    return NextResponse.json({ codigo: "CORPO", erro: "Não entendi o pedido.", error: "Não entendi o pedido." }, { status: 400 })
  }

  if (typeof corpo.status === "string") {
    if (corpo.status !== "ativa" && corpo.status !== "suspensa") {
      return NextResponse.json(
        { codigo: "STATUS", erro: "Status desconhecido.", error: "Status desconhecido." },
        { status: 400 }
      )
    }
    const r = await mudarStatusDaEscola(escolaId, corpo.status)
    if (!r.ok) {
      return NextResponse.json({ codigo: "STATUS", erro: r.detalhe, error: r.detalhe }, { status: 400 })
    }
    console.log(`[ops] ${op.email} deixou a escola ${escolaId} ${corpo.status}`)
  }

  if ("ativaAte" in corpo) {
    let quando: Date | null = null
    if (typeof corpo.ativaAte === "string" && corpo.ativaAte.trim()) {
      quando = fimDoDiaEmSaoPaulo(corpo.ativaAte.trim())
      if (!quando) {
        return NextResponse.json(
          { codigo: "VIGENCIA", erro: "Data ilegível. Use AAAA-MM-DD.", error: "Data ilegível. Use AAAA-MM-DD." },
          { status: 400 }
        )
      }
    }
    const r = await mudarVigencia(escolaId, quando)
    if (!r.ok) {
      return NextResponse.json({ codigo: "VIGENCIA", erro: r.detalhe, error: r.detalhe }, { status: 400 })
    }
    console.log(`[ops] ${op.email} mudou a vigência da escola ${escolaId}`)
  }

  return NextResponse.json({ ok: true })
}
