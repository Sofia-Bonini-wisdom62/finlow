import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401, checarConsentimento } from "@/lib/painel"
import { temModuloAvancado } from "@/lib/plano"
import { contemConteudoProibido } from "@/lib/conteudo-proibido"
import { listarTransacoes } from "@/lib/financeiro-repo"
import {
  listarInvestimentos,
  criarInvestimento,
  atualizarInvestimento,
  TIPOS_INVESTIMENTO,
} from "@/lib/investimento-repo"
import { marcosProjecao, serieProjecao, TAXA_PADRAO_MES } from "@/lib/projecao"

export const dynamic = "force-dynamic"

/**
 * CRUD do Módulo Avançado. A flag decide no SERVIDOR: sem ela, o GET devolve
 * `{ ativo: false }` (é assim que as telas sabem se desenham) e escrita
 * nenhuma passa. Escrita também exige o consentimento do Painel — investimento
 * é dado financeiro real, mesma regra R8 de Transacao.
 */

/** Média da sobra mensal (entradas − saídas) dos últimos meses com movimento. */
function sobraMensalMedia(transacoes: { valor: number; tipo: string; data: Date }[]): number {
  const porMes = new Map<string, number>()
  for (const t of transacoes) {
    const chave = `${t.data.getFullYear()}-${String(t.data.getMonth() + 1).padStart(2, "0")}`
    porMes.set(chave, (porMes.get(chave) ?? 0) + (t.tipo === "receita" ? t.valor : -t.valor))
  }
  const ultimos = [...porMes.keys()].sort().slice(-6).map((k) => porMes.get(k)!)
  if (ultimos.length === 0) return 0
  const media = ultimos.reduce((a, b) => a + b, 0) / ultimos.length
  // Sobra negativa não vira "aporte negativo": a projeção responde "e se eu
  // guardar o que tenho sobrado?", e quem não tem sobra projeta só o principal.
  return Math.max(0, Math.round(media * 100) / 100)
}

export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    if (!(await temModuloAvancado(userId))) return NextResponse.json({ ativo: false })

    const [investimentos, transacoes] = await Promise.all([
      listarInvestimentos(userId),
      listarTransacoes(userId, { comCategoria: false }),
    ])

    const total = investimentos.reduce((a, i) => a + i.valorAtual, 0)
    const porTipo: Record<string, number> = {}
    for (const i of investimentos) porTipo[i.tipo] = (porTipo[i.tipo] ?? 0) + i.valorAtual

    const aporteMensal = sobraMensalMedia(transacoes)

    return NextResponse.json({
      ativo: true,
      investimentos,
      total,
      porTipo,
      projecao: {
        taxaMes: TAXA_PADRAO_MES,
        aporteMensal,
        marcos: marcosProjecao(total, aporteMensal),
        serie: serieProjecao(total, aporteMensal),
      },
    })
  } catch (e) {
    console.error("[investimentos]", (e as Error)?.message)
    return NextResponse.json({ error: "Erro ao carregar" }, { status: 500 })
  }
}

type CorpoEscrita = {
  id?: unknown
  tipo?: unknown
  nome?: unknown
  instituicao?: unknown
  valorAtual?: unknown
}

function validar(corpo: CorpoEscrita, parcial: boolean): { erro: string } | {
  tipo?: string
  nome?: string
  instituicao?: string | null
  valorAtual?: number
} {
  const saida: { tipo?: string; nome?: string; instituicao?: string | null; valorAtual?: number } = {}

  if (corpo.tipo !== undefined || !parcial) {
    const tipo = String(corpo.tipo ?? "")
    if (!(TIPOS_INVESTIMENTO as readonly string[]).includes(tipo)) return { erro: "Tipo inválido" }
    saida.tipo = tipo
  }
  if (corpo.nome !== undefined || !parcial) {
    const nome = String(corpo.nome ?? "").trim()
    if (nome.length < 1 || nome.length > 60) return { erro: "Nome entre 1 e 60 caracteres" }
    if (contemConteudoProibido(nome)) return { erro: "Esse nome não pode ser registrado." }
    saida.nome = nome
  }
  if (corpo.instituicao !== undefined) {
    const inst = corpo.instituicao === null ? "" : String(corpo.instituicao).trim()
    if (inst.length > 60) return { erro: "Instituição até 60 caracteres" }
    if (inst && contemConteudoProibido(inst)) return { erro: "Esse nome não pode ser registrado." }
    saida.instituicao = inst || null
  }
  if (corpo.valorAtual !== undefined || !parcial) {
    const valor = Number(corpo.valorAtual)
    if (!isFinite(valor) || valor < 0) return { erro: "Valor inválido" }
    saida.valorAtual = valor
  }
  return saida
}

async function bloqueioDeEscrita(userId: string): Promise<NextResponse | null> {
  if (!(await temModuloAvancado(userId))) {
    return NextResponse.json({ error: "Recurso em beta fechado" }, { status: 403 })
  }
  return checarConsentimento(userId)
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  const bloqueio = await bloqueioDeEscrita(userId)
  if (bloqueio) return bloqueio

  try {
    const corpo = (await req.json()) as CorpoEscrita
    const v = validar(corpo, false)
    if ("erro" in v) return NextResponse.json({ error: v.erro }, { status: 400 })

    const investimento = await criarInvestimento(userId, {
      tipo: v.tipo!,
      nome: v.nome!,
      instituicao: v.instituicao ?? null,
      valorAtual: v.valorAtual!,
    })
    return NextResponse.json({ investimento })
  } catch (e) {
    console.error("[investimentos POST]", (e as Error)?.message)
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  const bloqueio = await bloqueioDeEscrita(userId)
  if (bloqueio) return bloqueio

  try {
    const corpo = (await req.json()) as CorpoEscrita
    const id = typeof corpo.id === "string" ? corpo.id : ""
    if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

    const v = validar(corpo, true)
    if ("erro" in v) return NextResponse.json({ error: v.erro }, { status: 400 })

    const count = await atualizarInvestimento(userId, id, v)
    if (count === 0) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[investimentos PATCH]", (e as Error)?.message)
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  const bloqueio = await bloqueioDeEscrita(userId)
  if (bloqueio) return bloqueio

  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

  // deleteMany direto é permitido: apagar não toca campo cifrado.
  const r = await db.investimento.deleteMany({ where: { id, userId } })
  if (r.count === 0) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
