import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

// GET /api/trilha/[moduloId]?userId=xxx
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ moduloId: string }> }
) {
  try {
    const { moduloId } = await params
    const { searchParams } = new URL(req.url)
    // sessão NextAuth tem prioridade; query param é o fallback anônimo
    const session = await auth()
    const userId = session?.user?.id ?? searchParams.get("userId")

    // aceita id (cuid) ou slug — os cards do Perfil linkam por slug
    const modulo = await db.modulo.findFirst({
      where: { OR: [{ id: moduloId }, { slug: moduloId }] },
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
