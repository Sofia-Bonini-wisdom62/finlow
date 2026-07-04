import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

function getUserId(req: NextRequest): string | null {
  return req.headers.get("x-user-id") || null
}

// garante que existe uma linha User pro id temporário (até NextAuth estar configurado)
async function ensureUser(userId: string) {
  await db.user.upsert({
    where: { id: userId },
    create: { id: userId, email: `${userId}@anon.finlow` },
    update: {},
  })
}

// PATCH — atualiza telaAtual (fire-and-forget do CardFlow)
export async function PATCH(req: NextRequest) {
  try {
    const userId = getUserId(req)
    if (!userId) return NextResponse.json({ error: "userId obrigatório" }, { status: 400 })

    const { moduloId, telaAtual } = await req.json()
    if (!moduloId || telaAtual === undefined) {
      return NextResponse.json({ error: "moduloId e telaAtual obrigatórios" }, { status: 400 })
    }

    await ensureUser(userId)

    await db.progressoModulo.upsert({
      where: { userId_moduloId: { userId, moduloId } },
      create: { userId, moduloId, telaAtual },
      update: { telaAtual },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.warn("[progresso PATCH]", e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

// POST — marca módulo como concluído
export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req)
    if (!userId) return NextResponse.json({ error: "userId obrigatório" }, { status: 400 })

    const { moduloId } = await req.json()
    if (!moduloId) return NextResponse.json({ error: "moduloId obrigatório" }, { status: 400 })

    await ensureUser(userId)

    await db.progressoModulo.upsert({
      where: { userId_moduloId: { userId, moduloId } },
      create: { userId, moduloId, concluido: true, concluidoEm: new Date(), telaAtual: 999 },
      update: { concluido: true, concluidoEm: new Date() },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.warn("[progresso POST]", e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
