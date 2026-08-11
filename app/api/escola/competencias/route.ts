import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { exigirPapel } from "@/lib/escola"
import { ehPublico, PUBLICO_ATUAL } from "@/lib/publico"

export const dynamic = "force-dynamic"

/**
 * Competências do professor (Finlow para Escolas): só o adm concede e revoga.
 *
 * A competência é por SEGMENTO e REDUZ o que o professor enxerga e gerencia —
 * professor sem nenhuma linha vê tudo (lib/escola.ts, segmentosDoProfessor).
 * Granularidade por código BCB fica para depois; Modulo.habilidades já
 * persiste o vocabulário que a viabiliza.
 */

async function validar(req: NextRequest) {
  const v = await exigirPapel("adm")
  if (v instanceof NextResponse) return { erro: v }

  const corpo = await req.json().catch(() => null)
  const professorId = typeof corpo?.professorId === "string" ? corpo.professorId : ""
  const segmento = typeof corpo?.segmento === "string" ? corpo.segmento : ""

  if (!ehPublico(segmento) || segmento === PUBLICO_ATUAL) {
    return {
      erro: NextResponse.json(
        { codigo: "SEGMENTO", erro: "Escolhe um segmento escolar.", error: "Escolhe um segmento escolar." },
        { status: 400 }
      ),
    }
  }

  // O alvo precisa ser professor DESTA escola — id de fora não vale nada.
  const alvo = await db.membroEscola.findFirst({
    where: { userId: professorId, escolaId: v.escolaId, papel: "professor" },
    select: { userId: true },
  })
  if (!alvo) {
    return {
      erro: NextResponse.json(
        { codigo: "PROFESSOR", erro: "Esse professor não está na sua escola.", error: "Esse professor não está na sua escola." },
        { status: 404 }
      ),
    }
  }

  return { v, professorId, segmento }
}

/** POST — concede. Idempotente pelo @@unique(userId, escolaId, segmento). */
export async function POST(req: NextRequest) {
  const r = await validar(req)
  if ("erro" in r) return r.erro

  await db.competenciaProfessor.upsert({
    where: {
      userId_escolaId_segmento: { userId: r.professorId, escolaId: r.v.escolaId, segmento: r.segmento },
    },
    create: { userId: r.professorId, escolaId: r.v.escolaId, segmento: r.segmento },
    update: {},
  })
  return NextResponse.json({ ok: true })
}

/** DELETE — revoga. Apagar o que não existe é ok: o estado final é o pedido. */
export async function DELETE(req: NextRequest) {
  const r = await validar(req)
  if ("erro" in r) return r.erro

  await db.competenciaProfessor.deleteMany({
    where: { userId: r.professorId, escolaId: r.v.escolaId, segmento: r.segmento },
  })
  return NextResponse.json({ ok: true })
}
