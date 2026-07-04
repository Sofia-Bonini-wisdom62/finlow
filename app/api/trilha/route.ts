import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

// GET /api/trilha?tipoPerfil=lancador&userId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tipoPerfil = searchParams.get("tipoPerfil")
    const userId = searchParams.get("userId")

    if (!tipoPerfil) return NextResponse.json({ error: "tipoPerfil obrigatório" }, { status: 400 })

    const modulos = await db.modulo.findMany({
      where: { tipoPerfil },
      orderBy: { ordem: "asc" },
      include: {
        ...(userId ? { progresso: { where: { userId } } } : {}),
      },
    })

    return NextResponse.json({ modulos })
  } catch (e) {
    console.error("[trilha GET]", e)
    return NextResponse.json({ modulos: [], error: String(e) })
  }
}
