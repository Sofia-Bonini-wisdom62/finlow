import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { exigirPapel } from "@/lib/escola"
import { ehPublico, PUBLICO_ATUAL } from "@/lib/publico"

export const dynamic = "force-dynamic"

/** GET /api/escola/turmas — as turmas que este papel enxerga. */
export async function GET() {
  const v = await exigirPapel("adm", "professor")
  if (v instanceof NextResponse) return v

  const turmas = await db.turma.findMany({
    where: v.papel === "adm" ? { escolaId: v.escolaId } : { escolaId: v.escolaId, professorId: v.userId },
    select: { id: true, nome: true, segmento: true, serie: true, rankAtivo: true, rankEscopo: true },
    orderBy: { criadoEm: "asc" },
  })
  return NextResponse.json({ turmas })
}

/**
 * POST /api/escola/turmas — cria a turma.
 *
 * Professor cria turma SUA (professorId = ele); adm cria turma sem professor
 * designado — a designação é trabalho de outra rota, quando existir.
 */
export async function POST(req: NextRequest) {
  const v = await exigirPapel("adm", "professor")
  if (v instanceof NextResponse) return v

  const corpo = await req.json().catch(() => null)
  const nome = typeof corpo?.nome === "string" ? corpo.nome.trim() : ""
  const segmento = typeof corpo?.segmento === "string" ? corpo.segmento : ""
  const serie = typeof corpo?.serie === "string" && corpo.serie.trim() ? corpo.serie.trim() : null

  if (!nome || nome.length < 2) {
    return NextResponse.json(
      { codigo: "NOME", erro: "Dá um nome para a turma (ex.: 5º ano A).", error: "Dá um nome para a turma (ex.: 5º ano A)." },
      { status: 400 }
    )
  }
  // Segmento precisa ser ESCOLAR: turma "adulto" apontaria a trilha do aluno
  // para o produto adulto inteiro — é exatamente o que o vínculo evita.
  if (!ehPublico(segmento) || segmento === PUBLICO_ATUAL) {
    return NextResponse.json(
      { codigo: "SEGMENTO", erro: "Escolhe o segmento da turma.", error: "Escolhe o segmento da turma." },
      { status: 400 }
    )
  }

  const turma = await db.turma.create({
    data: {
      escolaId: v.escolaId,
      nome,
      segmento,
      serie,
      professorId: v.papel === "professor" ? v.userId : null,
    },
    select: { id: true, nome: true, segmento: true },
  })
  return NextResponse.json({ ok: true, turma })
}
