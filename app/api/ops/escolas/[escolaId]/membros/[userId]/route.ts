import { NextRequest, NextResponse } from "next/server"
import { exigirOps } from "@/lib/ops"
import { removerMembro, trocarPapel } from "@/lib/ops-escola"

export const dynamic = "force-dynamic"

/**
 * PATCH e DELETE de um membro. As duas operações que só existiam no Prisma
 * Studio: `MembroEscola` nascia por resgate de convite e nunca mudava depois.
 *
 * DELETE tira da escola, não apaga a conta. Apagar conta continua sendo
 * exclusividade da própria pessoa em /api/conta, e essa fronteira é a razão
 * de este verbo poder existir aqui sem medo: o pior que ele faz é devolver
 * alguém à condição de usuário comum, com o progresso intacto.
 */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ escolaId: string; userId: string }> }
) {
  const op = await exigirOps()
  if (op instanceof NextResponse) return op
  const { escolaId, userId } = await ctx.params

  const corpo = await req.json().catch(() => null)
  const papel = typeof corpo?.papel === "string" ? corpo.papel : ""

  const r = await trocarPapel(escolaId, userId, papel)
  if (!r.ok) {
    return NextResponse.json({ codigo: "PAPEL", erro: r.detalhe, error: r.detalhe }, { status: 400 })
  }
  console.log(`[ops] ${op.email} deixou ${userId} como ${papel} na escola ${escolaId}`)
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ escolaId: string; userId: string }> }
) {
  const op = await exigirOps()
  if (op instanceof NextResponse) return op
  const { escolaId, userId } = await ctx.params

  const r = await removerMembro(escolaId, userId)
  if (!r.ok) {
    return NextResponse.json({ codigo: "MEMBRO", erro: r.detalhe, error: r.detalhe }, { status: 400 })
  }
  console.log(`[ops] ${op.email} tirou ${userId} da escola ${escolaId}`)
  return NextResponse.json({ ok: true })
}
