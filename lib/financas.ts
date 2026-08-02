// Cálculos financeiros derivados das transações do usuário.
// Fonte única para Análises, Perfil Financeiro e o contexto enviado à IA.
//
// ⚠️ Sobre os números: tudo aqui é derivado do que o usuário registrou —
// não há integração bancária. "Patrimônio" é o acumulado de (receitas − despesas)
// ao longo do histórico, não saldo real de conta. Os índices (Saúde Financeira,
// Consistência) são heurísticas explicitadas em cada função, não padrões de mercado.

export interface TransacaoCalc {
  valor: string | number
  tipo: string
  data: string | Date
  categoria?: { nome: string; cor: string | null } | null
}

const NOMES_INVESTIMENTO = ["investimento", "reserva", "poupança", "poupanca", "aporte"]

/**
 * Guardar dinheiro não é gastar, e resgatar não é ganhar.
 *
 * Cofrinho, caixinha, reserva e aplicação são bolsos da própria pessoa. O
 * dinheiro sai da conta corrente, mas não sai do patrimônio dela. Contar isso
 * como despesa dá dois erros de uma vez: infla o gasto (num extrato real de 3
 * meses, R$ 5.270 de "gasto" que era só dinheiro trocando de bolso) e, num mês
 * em que a pessoa só guarda, mostra "Sobrou: negativo" — dizendo que ela se
 * descontrolou justamente quando fez a coisa certa.
 *
 * Por isso poupança é neutra em receita, despesa, patrimônio e no gráfico de
 * categorias. Ela aparece no seu próprio indicador: quanto foi guardado.
 */
function ehPoupanca(t: TransacaoCalc): boolean {
  const nome = (t.categoria?.nome ?? "").toLowerCase()
  return NOMES_INVESTIMENTO.some((k) => nome.includes(k))
}

function n(v: string | number): number {
  const x = typeof v === "string" ? parseFloat(v) : v
  return isFinite(x) ? x : 0
}

function d(v: string | Date): Date {
  return v instanceof Date ? v : new Date(v)
}

function chaveMes(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`
}

// Corte por competência: as Análises são sempre "a situação ATÉ o mês selecionado".
// Sem isso, escolher março mostrava gráficos que já contavam julho.
export interface Competencia { mes: number; ano: number }

function ateChave(ate: Competencia): string {
  return `${ate.ano}-${String(ate.mes).padStart(2, "0")}`
}

function dentroDoCorte(data: Date, ate?: Competencia): boolean {
  return ate ? chaveMes(data) <= ateChave(ate) : true
}

// ---------- indicadores rápidos (topo das Análises) ----------

export interface Indicadores {
  receita: number
  despesa: number
  economia: number        // receita − despesa do mês (sem poupança dos dois lados)
  investimentos: number   // líquido guardado no mês: guardado − resgatado. NÃO entra em despesa.
  acumulado: number       // (receita − despesa) somado desde o 1º registro ATÉ o mês selecionado
  lancamentosNoMes: number
}

export function indicadores(todas: TransacaoCalc[], mes: number, ano: number): Indicadores {
  let receita = 0
  let despesa = 0
  let investimentos = 0
  let acumulado = 0
  let lancamentosNoMes = 0

  for (const t of todas) {
    const v = n(t.valor)
    const dt = d(t.data)
    const ehReceita = t.tipo === "receita"
    const poupanca = ehPoupanca(t)

    // acumulado: do começo do histórico até o fim do mês selecionado — nunca depois.
    // Selecionar março e ver um número que já embute julho seria mentira.
    // Poupança fica de fora: mover dinheiro entre bolsos próprios não muda o
    // patrimônio, e contá-la faria o gráfico despencar toda vez que a pessoa
    // guardasse dinheiro.
    if (!poupanca && dentroDoCorte(dt, { mes, ano })) acumulado += ehReceita ? v : -v

    // demais: só o mês selecionado
    if (dt.getMonth() + 1 !== mes || dt.getFullYear() !== ano) continue
    lancamentosNoMes++

    if (poupanca) {
      // guardado (saída da conta) soma; resgatado (entrada) subtrai.
      investimentos += ehReceita ? -v : v
    } else if (ehReceita) {
      receita += v
    } else {
      despesa += v
    }
  }

  return { receita, despesa, economia: receita - despesa, investimentos, acumulado, lancamentosNoMes }
}

// ---------- gráfico 1: evolução do patrimônio ----------

export interface PontoPatrimonio {
  mes: string      // "2026-07"
  rotulo: string   // "jul"
  patrimonio: number
}

const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]

export function evolucaoPatrimonio(todas: TransacaoCalc[], meses = 6, ate?: Competencia): PontoPatrimonio[] {
  if (todas.length === 0) return []

  const porMes = new Map<string, number>()
  for (const t of todas) {
    if (ehPoupanca(t)) continue // trocar de bolso não muda o patrimônio
    const dt = d(t.data)
    if (!dentroDoCorte(dt, ate)) continue
    const k = chaveMes(dt)
    const v = n(t.valor) * (t.tipo === "receita" ? 1 : -1)
    porMes.set(k, (porMes.get(k) ?? 0) + v)
  }

  const chaves = [...porMes.keys()].sort()
  const pontos: PontoPatrimonio[] = []
  let acumulado = 0
  for (const k of chaves) {
    acumulado += porMes.get(k) ?? 0
    const [, mm] = k.split("-")
    pontos.push({ mes: k, rotulo: MESES_CURTOS[Number(mm) - 1], patrimonio: acumulado })
  }
  return pontos.slice(-meses)
}

// ---------- gráfico 2: gastos por categoria ----------

export interface FatiaCategoria {
  nome: string
  cor: string
  total: number
  pct: number
}

/**
 * Cores das fatias.
 *
 * A cor NÃO vem mais do banco. Lá as categorias colidem — "Transferências" e
 * "Outros" nasceram com o mesmo cinza, "Compras" e "Lazer" com o mesmo azul —
 * e numa rosca duas fatias da mesma cor viram uma cunha só. Numa conta real
 * eram 65% do gráfico em cinza contínuo, sem saber onde uma acabava.
 *
 * Agora a fatia recebe o slot pela posição, e os seis slots vivem no CSS
 * (`--serie-1..6` em globals.css), um jogo de valores para o claro e outro
 * para o escuro. Aqui só sai o nome da variável: quem decide o hex é o tema,
 * porque só ele sabe em que fundo a fatia vai ser desenhada.
 *
 * O TETO DE SEIS NÃO É ESTÉTICA
 * Numa rosca a última fatia encosta na primeira. O que precisa ser legível é o
 * CÍRCULO, e o de cada tamanho, já que a rosca tem de 2 a 6 fatias conforme o
 * mês. Medindo todas as ordens das oito famílias documentadas sob protanopia e
 * deuteranopia, nos dois modos: com 6 todo prefixo fecha acima do alvo; com 7
 * cai para a banda de ressalva; com 8 nenhuma das 40.320 ordens fecha.
 */
const SERIES = 6
const NOME_OUTROS = "Outros"

/** O slot de uma fatia, pela posição. Exportado porque o Painel tem a própria
 *  rosca: duas paletas no mesmo app seriam duas linguagens. */
export function corDaSerie(indice: number): string {
  return `var(--serie-${(indice % SERIES) + 1})`
}

export function gastosPorCategoria(todas: TransacaoCalc[], mes: number, ano: number): FatiaCategoria[] {
  const mapa = new Map<string, { cor: string | null; total: number }>()
  let total = 0

  for (const t of todas) {
    if (t.tipo !== "despesa") continue
    // "onde seu dinheiro foi" — dinheiro guardado não FOI a lugar nenhum.
    if (ehPoupanca(t)) continue
    const dt = d(t.data)
    if (dt.getMonth() + 1 !== mes || dt.getFullYear() !== ano) continue

    const v = n(t.valor)
    total += v
    const nome = t.categoria?.nome ?? "Outros"
    const atual = mapa.get(nome) ?? { cor: t.categoria?.cor ?? null, total: 0 }
    atual.total += v
    mapa.set(nome, atual)
  }

  const ordenadas = [...mapa.entries()].sort((a, b) => b[1].total - a[1].total)

  return montarFatias(ordenadas.map(([nome, v]) => ({ nome, total: v.total })), total)
}

/**
 * Corta em SERIES fatias e joga a cauda em "Outros".
 *
 * O teto não é para caber na paleta: catorze fatias numa rosca de 132px não se
 * leem com cor nenhuma. O que sai da rosca continua no total — some do
 * desenho, não da conta — e quem quiser a lista inteira abre o Painel.
 *
 * Duas sutilezas que custaram um teste cada:
 *
 *  - com exatamente SERIES categorias não se dobra nada. Dobrar a última ali
 *    trocaria um nome de verdade por "Outros" tendo slot sobrando.
 *  - "Outros" é o BALDE, então ele nunca ocupa uma das vagas nomeadas. Se
 *    entrasse na disputa por tamanho, uma categoria de nome próprio seria
 *    empurrada para dentro dele enquanto ele mesmo ficava visível.
 *
 * Exportado porque o Painel tem a própria rosca: duas paletas e dois tetos no
 * mesmo app seriam duas linguagens.
 */
export function montarFatias(
  categorias: { nome: string; total: number }[],
  total: number
): FatiaCategoria[] {
  const nomeadas = categorias
    .filter((c) => c.nome !== NOME_OUTROS)
    .sort((a, b) => b.total - a.total)
  const balde = categorias
    .filter((c) => c.nome === NOME_OUTROS)
    .reduce((s, c) => s + c.total, 0)

  const cabeTudo = nomeadas.length + (balde > 0 ? 1 : 0) <= SERIES

  const visiveis = cabeTudo ? nomeadas : nomeadas.slice(0, SERIES - 1)
  const sobra = cabeTudo ? 0 : nomeadas.slice(SERIES - 1).reduce((s, c) => s + c.total, 0)

  const fatias = visiveis.map((c) => ({ nome: c.nome, total: c.total }))
  if (balde + sobra > 0) fatias.push({ nome: NOME_OUTROS, total: balde + sobra })

  // Reordena: "Outros" pode ter passado alguém depois de absorver a cauda.
  return fatias
    .sort((a, b) => b.total - a.total)
    .map((f, i) => ({
      nome: f.nome,
      cor: corDaSerie(i),
      total: f.total,
      pct: total > 0 ? Math.round((f.total / total) * 100) : 0,
    }))
}

// ---------- gráfico 3: receitas × despesas por mês ----------

export interface BarraMes {
  mes: string
  rotulo: string
  receita: number
  despesa: number
  deficitario: boolean
}

export function receitasVsDespesas(todas: TransacaoCalc[], meses = 6, ate?: Competencia): BarraMes[] {
  const mapa = new Map<string, { receita: number; despesa: number }>()

  for (const t of todas) {
    if (ehPoupanca(t)) continue
    const dt = d(t.data)
    if (!dentroDoCorte(dt, ate)) continue
    const k = chaveMes(dt)
    const atual = mapa.get(k) ?? { receita: 0, despesa: 0 }
    if (t.tipo === "receita") atual.receita += n(t.valor)
    else atual.despesa += n(t.valor)
    mapa.set(k, atual)
  }

  return [...mapa.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => {
      const [, mm] = k.split("-")
      return {
        mes: k,
        rotulo: MESES_CURTOS[Number(mm) - 1],
        receita: v.receita,
        despesa: v.despesa,
        deficitario: v.despesa > v.receita,
      }
    })
    .slice(-meses)
}

// ---------- gráfico 4: fluxo de caixa diário ----------

export interface PontoDia {
  dia: number
  saldo: number // acumulado do mês (não é saldo bancário: começa em zero no dia 1)
}

export function fluxoCaixaDiario(todas: TransacaoCalc[], mes: number, ano: number): PontoDia[] {
  const diasNoMes = new Date(ano, mes, 0).getDate()
  const porDia = new Array(diasNoMes + 1).fill(0) as number[]

  for (const t of todas) {
    const dt = d(t.data)
    if (dt.getMonth() + 1 !== mes || dt.getFullYear() !== ano) continue
    porDia[dt.getDate()] += n(t.valor) * (t.tipo === "receita" ? 1 : -1)
  }

  // No mês corrente a curva para em hoje. Desenhar até o dia 31 criava uma reta
  // horizontal no futuro que parecia informação ("meu saldo estabilizou") sendo
  // só ausência de dado.
  const hoje = new Date()
  const ultimoDia =
    hoje.getMonth() + 1 === mes && hoje.getFullYear() === ano
      ? Math.min(hoje.getDate(), diasNoMes)
      : diasNoMes

  const pontos: PontoDia[] = []
  let saldo = 0
  for (let dia = 1; dia <= ultimoDia; dia++) {
    saldo += porDia[dia]
    pontos.push({ dia, saldo })
  }
  return pontos
}

// ---------- métricas do Perfil Financeiro ----------

export interface MetricasPerfil {
  saudeFinanceira: number    // 0–100 (composto)
  taxaEconomia: number       // % da renda que sobra
  controleOrcamentario: number // % dos meses dentro do orçamento
  reservaEmergencia: number  // em meses de despesa
  consistencia: number       // % dos meses com economia positiva
  mesesComDados: number      // quantos meses de histórico sustentam os números
}

export function metricasPerfil(todas: TransacaoCalc[]): MetricasPerfil {
  const barras = receitasVsDespesas(todas, 120) // histórico inteiro
  const mesesComDados = barras.length

  if (mesesComDados === 0) {
    return { saudeFinanceira: 0, taxaEconomia: 0, controleOrcamentario: 0, reservaEmergencia: 0, consistencia: 0, mesesComDados: 0 }
  }

  const receitaTotal = barras.reduce((s, b) => s + b.receita, 0)
  const despesaTotal = barras.reduce((s, b) => s + b.despesa, 0)

  // Taxa de economia: quanto da renda sobrou no período
  const taxaEconomia = receitaTotal > 0
    ? Math.max(0, Math.round(((receitaTotal - despesaTotal) / receitaTotal) * 100))
    : 0

  // Controle orçamentário: % dos meses em que não gastou mais do que ganhou
  const mesesOk = barras.filter((b) => !b.deficitario).length
  const controleOrcamentario = Math.round((mesesOk / mesesComDados) * 100)

  // Reserva de emergência: patrimônio acumulado ÷ despesa mensal média
  const despesaMedia = despesaTotal / mesesComDados
  const patrimonio = receitaTotal - despesaTotal
  const reservaEmergencia = despesaMedia > 0
    ? Math.max(0, Math.round((patrimonio / despesaMedia) * 10) / 10)
    : 0

  // Consistência: % dos meses com economia positiva (hábito recorrente)
  const mesesPositivos = barras.filter((b) => b.receita - b.despesa > 0).length
  const consistencia = Math.round((mesesPositivos / mesesComDados) * 100)

  // Saúde financeira: composto ponderado dos quatro sinais acima.
  // Pesos escolhidos por peso relativo no comportamento (não é padrão de mercado).
  const notaReserva = Math.min(100, (reservaEmergencia / 6) * 100) // 6 meses = 100
  const saudeFinanceira = Math.round(
    taxaEconomia * 0.3 + controleOrcamentario * 0.25 + notaReserva * 0.25 + consistencia * 0.2
  )

  return {
    saudeFinanceira: Math.min(100, saudeFinanceira),
    taxaEconomia,
    controleOrcamentario,
    reservaEmergencia,
    consistencia,
    mesesComDados,
  }
}

// Nível financeiro exibido no cabeçalho do Perfil
export function nivelFinanceiro(m: MetricasPerfil): string {
  if (m.mesesComDados === 0) return "Começando agora"
  if (m.saudeFinanceira >= 80) return "Planejador consolidado"
  if (m.saudeFinanceira >= 60) return "Planejador em evolução"
  if (m.saudeFinanceira >= 40) return "Organizando as contas"
  return "Construindo o controle"
}

// Resumo em no máximo 30 palavras, derivado das métricas (sem IA).
export function resumoUsuario(m: MetricasPerfil): string {
  if (m.mesesComDados === 0) {
    return "Registre suas primeiras entradas e saídas para o Finlow montar seu retrato financeiro e recomendar por onde começar."
  }

  const partes: string[] = []
  partes.push(
    m.controleOrcamentario >= 70
      ? "Você mantém os gastos dentro do que entra"
      : "Seus gastos ainda passam do que entra em vários meses"
  )
  partes.push(
    m.taxaEconomia >= 15
      ? "e guarda uma fatia consistente da renda"
      : "e sobra pouco no fim do mês"
  )
  partes.push(
    m.reservaEmergencia >= 3
      ? "Sua reserva já cobre alguns meses"
      : "Vale priorizar uma reserva de emergência"
  )
  partes.push(
    m.consistencia >= 60 ? "mantendo a regularidade." : "buscando mais regularidade."
  )

  return `${partes[0]} ${partes[1]}. ${partes[2]} ${partes[3]}`
}
