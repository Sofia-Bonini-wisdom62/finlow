import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import { indicadores, gastosPorCategoria, metricasPerfil, type TransacaoCalc } from "@/lib/financas"
import { responderIA, IANaoConfigurada, type ContextoFinanceiro, type MensagemChat } from "@/lib/ia"

export const dynamic = "force-dynamic"

const NOMES_MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]

// Monta o retrato financeiro real do usuário para a IA usar como base.
// A IA nunca recebe as transações cruas — só os agregados de que precisa.
async function montarContexto(userId: string): Promise<ContextoFinanceiro> {
  const [transacoes, contas] = await Promise.all([
    db.transacao.findMany({
      where: { userId },
      include: { categoria: { select: { nome: true, cor: true } } },
      orderBy: { data: "desc" },
    }),
    db.contaFixa.findMany({ where: { userId, ativa: true } }),
  ])

  const calc: TransacaoCalc[] = transacoes.map((t) => ({
    valor: t.valor.toString(),
    tipo: t.tipo,
    data: t.data,
    categoria: t.categoria,
  }))

  const hoje = new Date()
  const mes = hoje.getMonth() + 1
  const ano = hoje.getFullYear()

  const ind = indicadores(calc, mes, ano)
  const cats = gastosPorCategoria(calc, mes, ano)
  const met = metricasPerfil(calc)

  return {
    temDados: calc.length > 0,
    mesReferencia: `${NOMES_MESES[mes - 1]} de ${ano}`,
    receitaMes: ind.receita,
    despesaMes: ind.despesa,
    economiaMes: ind.economia,
    acumulado: ind.acumulado,
    reservaEmergenciaMeses: met.reservaEmergencia,
    taxaEconomiaPct: met.taxaEconomia,
    maioresCategorias: cats.slice(0, 5).map((c) => ({ nome: c.nome, total: c.total, pct: c.pct })),
    contasFixasTotal: contas.reduce((s, c) => s + parseFloat(c.valor.toString()), 0),
    mesesComHistorico: met.mesesComDados,
  }
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const { mensagens } = await req.json()
    if (!Array.isArray(mensagens) || mensagens.length === 0) {
      return NextResponse.json({ error: "Nenhuma mensagem enviada" }, { status: 400 })
    }

    const contexto = await montarContexto(userId)
    const resposta = await responderIA(mensagens as MensagemChat[], contexto)

    return NextResponse.json(resposta)
  } catch (e) {
    if (e instanceof IANaoConfigurada) {
      // Estado honesto enquanto a IA não está ligada — não finge resposta.
      return NextResponse.json(
        { error: "ia_nao_configurada", mensagem: "O assistente ainda não está ligado nesta instalação." },
        { status: 503 }
      )
    }
    console.error("[chat]", e)
    return NextResponse.json({ error: "Erro ao responder" }, { status: 500 })
  }
}

// GET — devolve só o contexto (útil pra depurar o que a IA recebe)
export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  return NextResponse.json({ contexto: await montarContexto(userId) })
}
