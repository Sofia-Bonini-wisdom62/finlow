import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import {
  indicadores,
  evolucaoPatrimonio,
  gastosPorCategoria,
  receitasVsDespesas,
  fluxoCaixaDiario,
  type TransacaoCalc,
} from "@/lib/financas"

export const dynamic = "force-dynamic"

// GET /api/analises?mes=7&ano=2026
export async function GET(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const { searchParams } = new URL(req.url)
  const hoje = new Date()
  const mes = Number(searchParams.get("mes")) || hoje.getMonth() + 1
  const ano = Number(searchParams.get("ano")) || hoje.getFullYear()

  try {
    const transacoes = await db.transacao.findMany({
      where: { userId },
      include: { categoria: { select: { nome: true, cor: true } } },
      orderBy: { data: "asc" },
    })

    const calc: TransacaoCalc[] = transacoes.map((t) => ({
      valor: t.valor.toString(),
      tipo: t.tipo,
      data: t.data,
      categoria: t.categoria,
    }))

    return NextResponse.json({
      temDados: calc.length > 0,
      indicadores: indicadores(calc, mes, ano),
      patrimonio: evolucaoPatrimonio(calc, 6),
      categorias: gastosPorCategoria(calc, mes, ano),
      receitasDespesas: receitasVsDespesas(calc, 6),
      fluxoDiario: fluxoCaixaDiario(calc, mes, ano),
    })
  } catch (e) {
    console.error("[analises]", e)
    return NextResponse.json({ error: "Erro ao carregar análises" }, { status: 500 })
  }
}
