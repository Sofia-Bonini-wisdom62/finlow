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

export interface OpcoesContexto {
  /**
   * Mês de referência. Sem isto, é o mês corrente.
   *
   * O chat PRECISA do mês corrente: quando alguém pergunta "quanto gastei esse
   * mês", responder sobre o mês passado é mentir. Mas quem faz uma LEITURA do
   * dinheiro precisa do último mês com movimento — no dia 1º os dois são a
   * mesma pergunta com respostas opostas, e o mês corrente responde "zero".
   */
  mes?: number
  ano?: number
}

export async function montarContexto(
  userId: string,
  opcoes?: OpcoesContexto
): Promise<ContextoFinanceiro> {
  const [calc, contas, tetos] = await Promise.all([
    listarTransacoes(userId, { ordem: "desc" }),
    listarContasFixas(userId, { apenasAtivas: true }),
    listarOrcamentos(userId),
  ])

  const hoje = new Date()
  const mes = opcoes?.mes ?? hoje.getMonth() + 1
  const ano = opcoes?.ano ?? hoje.getFullYear()

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

/**
 * O último mês em que entrou ou saiu dinheiro.
 *
 * Existe por causa do dia 1º. O contexto lê o mês corrente, e no primeiro dia
 * do mês ele é vazio por definição: as leituras do Perfil saíam todas sobre
 * zero para quem tem meses de histórico, o que parece defeito e não é.
 *
 * Devolve `undefined` quando não há movimento nenhum — aí o mês corrente
 * mesmo, porque não há nada melhor a apontar.
 */
export async function ultimoMesComMovimento(
  userId: string
): Promise<OpcoesContexto | undefined> {
  // Sem `limite` no repo, e não vale a pena acrescentar: os campos são
  // cifrados, então a decifragem acontece de qualquer jeito para achar a data.
  const todas = await listarTransacoes(userId, { ordem: "desc", comCategoria: false })
  if (todas.length === 0) return undefined
  const d = new Date(todas[0].data)
  return { mes: d.getUTCMonth() + 1, ano: d.getUTCFullYear() }
}
