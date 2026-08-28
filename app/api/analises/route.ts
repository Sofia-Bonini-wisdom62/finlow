import { NextRequest, NextResponse } from "next/server"
import { getUserIdOr401 } from "@/lib/painel"
import { listarTransacoes } from "@/lib/financeiro-repo"
import { listarOrcamentos, cruzarComGasto } from "@/lib/orcamento-repo"
import {
  indicadores,
  evolucaoPatrimonio,
  gastosPorCategoria,
  receitasVsDespesas,
  fluxoCaixaDiario,
  metricasPerfil,
  type TransacaoCalc,
} from "@/lib/financas"
import { competenciaDoOrdinal, noMes, ordinalMes } from "@/lib/dia"

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
    const ordinal = ordinalMes(t.data)
    if (ordinal < limite && ordinal > melhor) melhor = ordinal
  }
  if (melhor === 0) return null
  return competenciaDoOrdinal(melhor)
}

// GET /api/analises?mes=7&ano=2026&escopo=trabalho
export async function GET(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const { searchParams } = new URL(req.url)
  const hoje = new Date()
  const mes = Number(searchParams.get("mes")) || hoje.getMonth() + 1
  const ano = Number(searchParams.get("ano")) || hoje.getFullYear()
  // Filtro pessoal × trabalho (Módulo Avançado). Sem parâmetro, tudo junto —
  // que é o comportamento de sempre e o único que quem não tem a flag vê.
  const escopoBruto = searchParams.get("escopo")
  const escopo = escopoBruto === "pessoal" || escopoBruto === "trabalho" ? escopoBruto : undefined

  try {
    // decifra na camada de repositório; daqui pra baixo os números são claros
    const [calc, tetos] = await Promise.all([
      listarTransacoes(userId, { escopo }) as Promise<TransacaoCalc[]>,
      listarOrcamentos(userId),
    ])

    const ind = indicadores(calc, mes, ano)
    const ate = { mes, ano }

    // Todos os recortes terminam no mês selecionado: a página inteira responde
    // "como estavam as coisas até <mês>", em vez de misturar mês e histórico.
    return NextResponse.json({
      temDados: calc.length > 0,           // já registrou alguma coisa, algum dia
      temDadosNoMes: ind.lancamentosNoMes > 0, // tem lançamento no mês selecionado
      mesAnterior: mesComDadosAntes(calc, ate),
      indicadores: ind,
      // Saúde financeira: percorre TODO o histórico, não o mês selecionado.
      // Veio do Perfil, que virou retrato de um minuto; quem quer o número
      // atrás do retrato vem para cá.
      metricas: metricasPerfil(calc),
      patrimonio: evolucaoPatrimonio(calc, 6, ate),
      categorias: gastosPorCategoria(calc, mes, ano),
      receitasDespesas: receitasVsDespesas(calc, 6, ate),
      fluxoDiario: fluxoCaixaDiario(calc, mes, ano),
      // Cruzado aqui e não no cliente: o gasto vem de valores decifrados, que
      // nunca saem do servidor em forma bruta.
      tetos: cruzarComGasto(
        tetos,
        calc
          .filter((t) => t.tipo === "despesa" && noMes(t.data, mes, ano))
          .map((t) => ({
            nomeCategoria: t.categoria?.nome ?? null,
            valor: typeof t.valor === "string" ? parseFloat(t.valor) : t.valor,
          }))
      ),
    })
  } catch (e) {
    console.error("[analises]", e)
    return NextResponse.json({ error: "Erro ao carregar análises" }, { status: 500 })
  }
}
