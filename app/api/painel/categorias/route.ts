import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401, checarConsentimento } from "@/lib/painel"

export const dynamic = "force-dynamic"

export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const categorias = await db.categoria.findMany({
    where: { userId },
    orderBy: [{ tipo: "asc" }, { nome: "asc" }],
  })
  return NextResponse.json({ categorias })
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  const bloqueio = await checarConsentimento(userId)
  if (bloqueio) return bloqueio

  try {
    const { nome, tipo, cor } = await req.json()
    if (!nome || typeof nome !== "string") {
      return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 })
    }
    if (tipo !== "receita" && tipo !== "despesa") {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
    }

    const categoria = await db.categoria.create({
      data: { userId, nome: nome.trim(), tipo, cor: cor || null },
    })
    return NextResponse.json({ categoria })
  } catch (e) {
    console.error("[painel/categorias POST]", e)
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  const bloqueio = await checarConsentimento(userId)
  if (bloqueio) return bloqueio

  try {
    const { id, nome, tipo, cor } = await req.json()
    if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

    const r = await db.categoria.updateMany({
      where: { id, userId },
      data: {
        ...(nome !== undefined ? { nome: String(nome).trim() } : {}),
        ...(tipo !== undefined ? { tipo } : {}),
        ...(cor !== undefined ? { cor: cor || null } : {}),
      },
    })
    if (r.count === 0) return NextResponse.json({ error: "Não encontrada" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[painel/categorias PATCH]", e)
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  const bloqueio = await checarConsentimento(userId)
  if (bloqueio) return bloqueio

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

  // transações da categoria ficam sem categoria (SetNull no schema)
  const r = await db.categoria.deleteMany({ where: { id, userId } })
  if (r.count === 0) return NextResponse.json({ error: "Não encontrada" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
