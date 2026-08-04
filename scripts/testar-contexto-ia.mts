/**
 * Testa o que o assistente REALMENTE enxerga dos números da pessoa.
 *
 * O BUG QUE ISTO GUARDA
 * "Quanto gastei com delivery em julho?" não tinha resposta possível, por dois
 * motivos somados:
 *   1. o contexto levava UM mês (o de referência) — em agosto, julho não
 *      chegava ao modelo;
 *   2. as categorias vinham de `gastosPorCategoria`, que corta em seis fatias
 *      e dobra a cauda em "Outros" porque é o recorte da ROSCA. Delivery em
 *      sétimo sumia dentro de "Outros", e o assistente dizia "não tenho esse
 *      dado" sobre um número que estava no banco.
 *
 * Por isso metade deste teste é sobre o TEXTO DO PROMPT, não sobre a função:
 * o dado pode estar certo no objeto e não chegar ao modelo. O que vale é o que
 * está na string que sai daqui.
 *
 *   node --import tsx scripts/testar-contexto-ia.mts
 */
import { historicoDetalhado, gastosPorCategoria, type TransacaoCalc } from "../lib/financas.js"
import { promptSistemaChat } from "../lib/prompts/chat.js"
import type { ContextoFinanceiro } from "../lib/ia.js"

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

function gasto(descricaoCategoria: string, valor: number, ano: number, mes: number, dia: number): TransacaoCalc {
  return {
    valor,
    tipo: "despesa",
    data: new Date(ano, mes - 1, dia),
    categoria: { nome: descricaoCategoria, cor: null },
  }
}

// Julho com NOVE categorias: mais que os seis slots da rosca, de propósito.
// Delivery é a sétima maior — exatamente a posição que sumia em "Outros".
const JULHO: TransacaoCalc[] = [
  gasto("Moradia", 1800, 2026, 7, 5),
  gasto("Mercado", 900, 2026, 7, 8),
  gasto("Transporte", 600, 2026, 7, 9),
  gasto("Saúde", 500, 2026, 7, 10),
  gasto("Educação", 400, 2026, 7, 11),
  gasto("Lazer", 300, 2026, 7, 12),
  gasto("Delivery", 260, 2026, 7, 14),
  gasto("Assinaturas", 120, 2026, 7, 15),
  gasto("Compras", 90, 2026, 7, 16),
  { valor: 6000, tipo: "receita", data: new Date(2026, 6, 1), categoria: null },
  // guardar não é gastar: fica fora das saídas e das categorias
  { valor: 500, tipo: "despesa", data: new Date(2026, 6, 20), categoria: { nome: "Reserva", cor: null } },
]

const AGOSTO: TransacaoCalc[] = [
  gasto("Moradia", 1800, 2026, 8, 5),
  gasto("Mercado", 700, 2026, 8, 8),
  { valor: 6000, tipo: "receita", data: new Date(2026, 7, 1), categoria: null },
]

const TUDO = [...JULHO, ...AGOSTO]

// ------------------------------------------------------------- função ---
console.log("HISTÓRICO DETALHADO")

const hist = historicoDetalhado(TUDO, 12)
checar("separa os dois meses", hist.length === 2, `${hist.length}`)
checar("rótulo é o nome do mês por extenso", hist[0]?.rotulo === "julho de 2026", hist[0]?.rotulo ?? "")
checar("mais recente por último", hist[1]?.rotulo === "agosto de 2026", hist[1]?.rotulo ?? "")

const julho = hist[0]!
checar("as NOVE categorias de julho vêm inteiras", julho.categorias.length === 9, `${julho.categorias.length}`)
checar("nenhuma virou 'Outros'", !julho.categorias.some((c) => c.nome === "Outros"))
const delivery = julho.categorias.find((c) => c.nome === "Delivery")
checar("Delivery está lá, com o valor certo", delivery?.total === 260, `${delivery?.total}`)
checar("saiu de julho não conta a reserva", julho.despesa === 4970, `${julho.despesa}`)
checar("guardado aparece em coluna própria", julho.guardado === 500, `${julho.guardado}`)
checar("sobrou = entrou − saiu", julho.economia === 6000 - 4970, `${julho.economia}`)
checar("pct é fatia das saídas do mês", delivery?.pct === Math.round((260 / 4970) * 100), `${delivery?.pct}`)
checar("categorias ordenadas da maior pra menor", julho.categorias[0]?.nome === "Moradia")
checar("agosto não herda categoria de julho",
  hist[1]!.categorias.every((c) => c.nome !== "Delivery"))

// A rosca CONTINUA dobrando — é o comportamento certo dela, e o teste existe
// para deixar claro que a diferença é intencional, não um dos dois estar errado.
const rosca = gastosPorCategoria(TUDO, 7, 2026)
checar("a rosca segue com 6 fatias e 'Outros'",
  rosca.length === 6 && rosca.some((f) => f.nome === "Outros"), `${rosca.length} fatias`)
checar("e é justamente nela que Delivery some",
  !rosca.some((f) => f.nome === "Delivery"))

console.log("\nBORDAS")
checar("sem lançamento, sem histórico", historicoDetalhado([], 12).length === 0)
checar("corte por competência ignora meses posteriores",
  historicoDetalhado(TUDO, 12, { mes: 7, ano: 2026 }).length === 1)
checar("limite de meses pega os mais RECENTES",
  historicoDetalhado(TUDO, 1)[0]?.rotulo === "agosto de 2026")
const semCategoria = historicoDetalhado(
  [{ valor: 50, tipo: "despesa", data: new Date(2026, 6, 3), categoria: null }], 12)
checar("gasto sem categoria não é descartado", semCategoria[0]?.categorias[0]?.nome === "Sem categoria")

// -------------------------------------------------------------- prompt ---
// O dado certo no objeto não vale nada se não chegar ao modelo.
console.log("\nO QUE CHEGA NO PROMPT")

const contexto: ContextoFinanceiro = {
  temDados: true,
  mesReferencia: "agosto de 2026",
  receitaMes: 6000,
  despesaMes: 2500,
  economiaMes: 3500,
  acumulado: 4530,
  reservaEmergenciaMeses: 2,
  taxaEconomiaPct: 58,
  maioresCategorias: [{ nome: "Moradia", total: 1800, pct: 72 }],
  contasFixasTotal: 1800,
  mesesComHistorico: 2,
  meses: hist,
}

const prompt = promptSistemaChat(contexto)

checar("o prompt cita julho pelo nome", prompt.includes("julho de 2026"))
checar("o prompt traz o valor de Delivery", /Delivery R\$\s*260,00/.test(prompt), "")
checar("traz também as categorias pequenas", prompt.includes("Compras") && prompt.includes("Assinaturas"))
checar("diz que a lista é completa", prompt.includes("COMPLETA"))
checar("ensina a diferença entre zero e não ter o dado", prompt.includes("foi ZERO"))
checar("anuncia o alcance do histórico", prompt.includes("de julho de 2026 a agosto de 2026"))
checar("avisa que pendente de extrato não entra", prompt.includes("CONFIRMADOS"))
// Dar o histórico criou a pergunta "aumentou ou diminuiu?", e com ela o erro
// de concordar com a suposição de quem pergunta: o modelo respondia "sim,
// aumentou" para R$ 331,30 → R$ 215,94. A regra que corrige isso é parte da
// entrega, não um detalhe do texto.
checar("ensina a não concordar com a suposição da pergunta",
  prompt.includes("A PERGUNTA NÃO É A RESPOSTA") && prompt.includes("ANTES") && prompt.includes("DEPOIS"))

// Sem dados o bloco todo tem de sumir — prompt com tabela vazia convida o
// modelo a preencher.
const vazio = promptSistemaChat({ ...contexto, temDados: false, meses: [] })
checar("sem lançamento, nenhum bloco de meses", !vazio.includes("O DASH MÊS A MÊS"))

console.log(`\n${falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`}`)
process.exit(falhas === 0 ? 0 : 1)
