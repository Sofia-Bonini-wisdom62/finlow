import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

// GET /api/trilha/[moduloId]?userId=xxx
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ moduloId: string }> }
) {
  try {
    const { moduloId } = await params
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    const modulo = await db.modulo.findUnique({
      where: { id: moduloId },
      include: {
        telas: { orderBy: { ordem: "asc" } },
        ...(userId ? { progresso: { where: { userId } } } : {}),
      },
    })

    if (!modulo) return NextResponse.json({ error: "Módulo não encontrado" }, { status: 404 })

    return NextResponse.json({ modulo })
  } catch (e) {
    console.error("[trilha/[moduloId] GET]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
