import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { exigirPapel, podeGerirTurma } from "@/lib/escola"

export const dynamic = "force-dynamic"

const ESCOPOS = ["sala", "ano", "escola"] as const

/**
 * PATCH /api/escola/turmas/[turmaId] — a config do rank da turma.
 *
 * Quem liga o rank é o PROFESSOR (quadro branco): `rankAtivo` +
 * `rankEscopo` ("sala" | "ano" | "escola"). O efeito no aluno mora em
 * rankingEscolar (lib/pontos.ts); aqui só se grava a decisão.
 */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ turmaId: string }> }) {
  const { turmaId } = await ctx.params
  const v = await exigirPapel("adm", "professor")
  if (v instanceof NextResponse) return v

  if (!(await podeGerirTurma(v, turmaId))) {
    return NextResponse.json(
      { codigo: "TURMA_ALHEIA", erro: "Essa turma não é sua para gerir.", error: "Essa turma não é sua para gerir." },
      { status: 403 }
    )
  }

  const corpo = await req.json().catch(() => null)
  const data: { rankAtivo?: boolean; rankEscopo?: string } = {}

  if (typeof corpo?.rankAtivo === "boolean") data.rankAtivo = corpo.rankAtivo
  if (typeof corpo?.rankEscopo === "string") {
    if (!(ESCOPOS as readonly string[]).includes(corpo.rankEscopo)) {
      return NextResponse.json(
        { codigo: "ESCOPO", erro: "Escopo é sala, ano ou escola.", error: "Escopo é sala, ano ou escola." },
        { status: 400 }
      )
    }
    data.rankEscopo = corpo.rankEscopo
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { codigo: "VAZIO", erro: "Nada para mudar.", error: "Nada para mudar." },
      { status: 400 }
    )
  }

  const turma = await db.turma.update({
    where: { id: turmaId },
    data,
    select: { rankAtivo: true, rankEscopo: true },
  })
  return NextResponse.json({ ok: true, ...turma })
}
