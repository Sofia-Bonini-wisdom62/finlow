import { NextRequest, NextResponse } from "next/server"
import { exigirOps } from "@/lib/ops"
import { designarProfessor } from "@/lib/ops-escola"

export const dynamic = "force-dynamic"

/**
 * PATCH /api/ops/escolas/{id}/turmas/{id} — quem leciona a turma.
 *
 * O schema já prometia isto: `Turma.professorId` é `onDelete: SetNull`
 * justamente para que "professor que apaga a conta não leve a turma junto, o
 * adm designa outro". Só que nenhuma rota escrevia o campo, e turma criada
 * por adm nascia sem professor. A promessa passa a ter porta.
 *
 * `professorId: null` desdesigna, que é o que se quer antes de tirar alguém
 * da escola sem deixar turma órfã de aviso.
 */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ escolaId: string; turmaId: string }> }
) {
  const op = await exigirOps()
  if (op instanceof NextResponse) return op
  const { escolaId, turmaId } = await ctx.params

  const corpo = await req.json().catch(() => null)
  const professorId =
    typeof corpo?.professorId === "string" && corpo.professorId ? corpo.professorId : null

  const r = await designarProfessor(escolaId, turmaId, professorId)
  if (!r.ok) {
    return NextResponse.json({ codigo: "TURMA", erro: r.detalhe, error: r.detalhe }, { status: 400 })
  }
  console.log(`[ops] ${op.email} designou ${professorId ?? "ninguém"} para a turma ${turmaId}`)
  return NextResponse.json({ ok: true })
}
