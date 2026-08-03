import { NextRequest, NextResponse } from "next/server"
import { contemConteudoProibido } from "@/lib/conteudo-proibido"
import { db } from "@/lib/db"
import { getUserIdOr401, checarConsentimento } from "@/lib/painel"
import { listarContasFixas, criarContaFixa, atualizarContaFixa } from "@/lib/financeiro-repo"

export const dynamic = "force-dynamic"

export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const contas = await listarContasFixas(userId, { apenasAtivas: true })
  return NextResponse.json({ contas })
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  const bloqueio = await checarConsentimento(userId)
  if (bloqueio) return bloqueio

  try {
    const { nome, valor, diaVencimento } = await req.json()
    if (!nome || typeof nome !== "string") {
      return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 })
    }
    const valorNum = Number(valor)
    if (!isFinite(valorNum) || valorNum <= 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 })
    }
    const dia = diaVencimento ? Number(diaVencimento) : null
    if (dia !== null && (!Number.isInteger(dia) || dia < 1 || dia > 31)) {
      return NextResponse.json({ error: "Dia de vencimento inválido" }, { status: 400 })
    }

    if (contemConteudoProibido(String(nome ?? ""))) {
      return NextResponse.json({ error: "Esse nome não pode ser registrado." }, { status: 400 })
    }
    const conta = await criarContaFixa(userId, { nome: nome.trim(), valor: valorNum, diaVencimento: dia })
    return NextResponse.json({ conta })
  } catch (e) {
    console.error("[painel/contas-fixas POST]", e)
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  const bloqueio = await checarConsentimento(userId)
  if (bloqueio) return bloqueio

  try {
    const { id, nome, valor, diaVencimento, ativa } = await req.json()
    if (nome !== undefined && contemConteudoProibido(String(nome))) {
      return NextResponse.json({ error: "Esse nome não pode ser registrado." }, { status: 400 })
    }
    if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

    const count = await atualizarContaFixa(userId, id, {
      ...(nome !== undefined ? { nome: String(nome).trim() } : {}),
      ...(valor !== undefined ? { valor: Number(valor) } : {}),
      ...(diaVencimento !== undefined ? { diaVencimento: diaVencimento ? Number(diaVencimento) : null } : {}),
      ...(ativa !== undefined ? { ativa: Boolean(ativa) } : {}),
    })
    if (count === 0) return NextResponse.json({ error: "Não encontrada" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[painel/contas-fixas PATCH]", e)
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

  const r = await db.contaFixa.deleteMany({ where: { id, userId } })
  if (r.count === 0) return NextResponse.json({ error: "Não encontrada" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
