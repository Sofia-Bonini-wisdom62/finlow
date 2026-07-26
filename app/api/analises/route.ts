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

// Mês com lançamento mais recente ANTES do selecionado — o estado vazio usa isso
// pra oferecer um destino real ("ver junho") em vez de um beco sem saída.
function mesComDadosAntes(
  calc: TransacaoCalc[],
  ate: { mes: number; ano: number }
): { mes: number; ano: number } | null {
  const limite = ate.ano * 12 + ate.mes
  let melhor = 0
  for (const t of calc) {
    const dt = t.data instanceof Date ? t.data : new Date(t.data)
    const ordinal = dt.getFullYear() * 12 + dt.getMonth() + 1
    if (ordinal < limite && ordinal > melhor) melhor = ordinal
  }
  if (melhor === 0) return null
  const mes = ((melhor - 1) % 12) + 1
  return { mes, ano: Math.floor((melhor - mes) / 12) }
}

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

    const ind = indicadores(calc, mes, ano)
    const ate = { mes, ano }

    // Todos os recortes terminam no mês selecionado: a página inteira responde
    // "como estavam as coisas até <mês>", em vez de misturar mês e histórico.
    return NextResponse.json({
      temDados: calc.length > 0,           // já registrou alguma coisa, algum dia
      temDadosNoMes: ind.lancamentosNoMes > 0, // tem lançamento no mês selecionado
      mesAnterior: mesComDadosAntes(calc, ate),
      indicadores: ind,
      patrimonio: evolucaoPatrimonio(calc, 6, ate),
      categorias: gastosPorCategoria(calc, mes, ano),
      receitasDespesas: receitasVsDespesas(calc, 6, ate),
      fluxoDiario: fluxoCaixaDiario(calc, mes, ano),
    })
  } catch (e) {
    console.error("[analises]", e)
    return NextResponse.json({ error: "Erro ao carregar análises" }, { status: 500 })
  }
}
