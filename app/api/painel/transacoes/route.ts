import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401, checarConsentimento } from "@/lib/painel"
import { listarTransacoes, criarTransacao, atualizarTransacao } from "@/lib/financeiro-repo"

export const dynamic = "force-dynamic"

// GET /api/painel/transacoes?mes=7&ano=2026
export async function GET(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const { searchParams } = new URL(req.url)
  const mes = Number(searchParams.get("mes"))
  const ano = Number(searchParams.get("ano"))

  const transacoes = await listarTransacoes(userId, { mes, ano, ordem: "desc" })
  return NextResponse.json({ transacoes })
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  const bloqueio = await checarConsentimento(userId)
  if (bloqueio) return bloqueio

  try {
    const { descricao, valor, tipo, categoriaId, data } = await req.json()
    if (!descricao || typeof descricao !== "string") {
      return NextResponse.json({ error: "Descrição obrigatória" }, { status: 400 })
    }
    const valorNum = Number(valor)
    if (!isFinite(valorNum) || valorNum <= 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 })
    }
    if (tipo !== "receita" && tipo !== "despesa") {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
    }

    const transacao = await criarTransacao(userId, {
      descricao: descricao.trim(),
      valor: valorNum,
      tipo,
      categoriaId: categoriaId || null,
      data: data ? new Date(data) : new Date(),
    })
    return NextResponse.json({ transacao })
  } catch (e) {
    console.error("[painel/transacoes POST]", e)
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  const bloqueio = await checarConsentimento(userId)
  if (bloqueio) return bloqueio

  try {
    const { id, descricao, valor, tipo, categoriaId, data } = await req.json()
    if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

    const count = await atualizarTransacao(userId, id, {
      ...(descricao !== undefined ? { descricao: String(descricao).trim() } : {}),
      ...(valor !== undefined ? { valor: Number(valor) } : {}),
      ...(tipo !== undefined ? { tipo } : {}),
      ...(categoriaId !== undefined ? { categoriaId: categoriaId || null } : {}),
      ...(data !== undefined ? { data: new Date(data) } : {}),
    })
    if (count === 0) return NextResponse.json({ error: "Não encontrada" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[painel/transacoes PATCH]", e)
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

  const r = await db.transacao.deleteMany({ where: { id, userId } })
  if (r.count === 0) return NextResponse.json({ error: "Não encontrada" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
