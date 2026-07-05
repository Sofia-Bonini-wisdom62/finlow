import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

// GET — perfil do usuário logado (pra recuperar em outro dispositivo/navegador)
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ tipo: null })

    const perfil = await db.perfil.findUnique({ where: { userId: session.user.id } })
    return NextResponse.json({ tipo: perfil?.tipo ?? null })
  } catch (e) {
    console.warn("[perfil GET]", e)
    return NextResponse.json({ tipo: null })
  }
}
