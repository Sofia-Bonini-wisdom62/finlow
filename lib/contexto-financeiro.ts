import { listarTransacoes, listarContasFixas } from "@/lib/financeiro-repo"
import { indicadores, gastosPorCategoria, metricasPerfil } from "@/lib/financas"
import { listarOrcamentos, cruzarComGasto } from "@/lib/orcamento-repo"
import type { ContextoFinanceiro } from "@/lib/ia"

/**
 * O retrato financeiro que a IA recebe.
 *
 * POR QUE ISTO VIROU ARQUIVO PRÓPRIO
 * Existiam duas cópias desta função, uma no chat e outra no onboarding, e elas
 * já tinham divergido: a do onboarding não passava os tetos de orçamento. O
 * efeito não aparece como erro, aparece como comportamento pior — o assistente
 * propõe um teto que a pessoa já definiu, e desfaz a decisão dela sem saber que
 * existia. A terceira cópia (as novidades do chat) seria a que consolida o
 * hábito, então ela virou a que consolidou o contrário.
 *
 * A IA nunca recebe transação crua. Só agregado, e só o que ela usa.
 */

const NOMES_MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]

export async function montarContexto(userId: string): Promise<ContextoFinanceiro> {
  const [calc, contas, tetos] = await Promise.all([
    listarTransacoes(userId, { ordem: "desc" }),
    listarContasFixas(userId, { apenasAtivas: true }),
    listarOrcamentos(userId),
  ])

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
    contasFixasTotal: contas.reduce((s, c) => s + c.valor, 0),
    mesesComHistorico: met.mesesComDados,
    // Sem os tetos no contexto, o assistente proporia de novo o que ela já
    // decidiu — e desfaria a decisão dela sem nem saber que existia.
    orcamentos: cruzarComGasto(
      tetos,
      calc
        .filter(
          (t) =>
            t.tipo === "despesa" &&
            new Date(t.data).getUTCMonth() + 1 === mes &&
            new Date(t.data).getUTCFullYear() === ano
        )
        .map((t) => ({ nomeCategoria: t.categoria?.nome ?? null, valor: t.valor }))
    ).map((o) => ({ nome: o.nome, limite: o.limite, gasto: o.gasto, restante: o.restante, pct: o.pct })),
  }
}
