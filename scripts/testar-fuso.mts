/**
 * Testa que a data de um LANÇAMENTO é a mesma em qualquer fuso.
 *
 * POR QUE ISTO EXISTE
 * O app lia a mesma data de dois jeitos. `lib/financas.ts` agrupava por mês com
 * `getMonth()` (hora local) e `dataCurta()` escrevia o dia com `getUTCDate()`.
 * As duas leituras só concordavam porque a Vercel roda em UTC — uma variável de
 * ambiente do servidor sustentando a aritmética do dinheiro da pessoa. Num fuso
 * a oeste, o lançamento do dia 1º cai no mês ANTERIOR na soma e continua
 * aparecendo como dia 1º no rótulo: a tela diz "suas saídas em agosto" sobre
 * números de julho, e nada quebra. Compila, renderiza, ninguém loga.
 *
 * Por isso a bateria roda A MESMA aritmética em cinco fusos, de UTC−11 a UTC+14,
 * e exige resultado IDÊNTICO. Um teste só em UTC não veria nada: é justamente o
 * fuso em que o defeito não aparece.
 *
 * A segunda metade olha o CÓDIGO, e é o que impede a volta. Ler a data em hora
 * local não é erro de sintaxe: `t.data.getMonth()` compila, passa no lint e faz
 * a conta errada em silêncio para quem estiver fora de UTC. O que a varredura
 * proíbe é ler um lançamento sem passar por `lib/dia.ts` — e ela deixa `hoje` e
 * `agora` em paz, porque relógio de parede é a pergunta certa em hora local, e
 * guard que acusa código correto ensina a próxima pessoa a desligá-lo.
 *
 *   node --import tsx scripts/testar-fuso.mts
 */
import { readFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import type { TransacaoCalc } from "../lib/financas.js"

/** UTC no meio, os dois extremos habitados e o Brasil (onde o produto vive). */
const FUSOS = ["UTC", "America/Sao_Paulo", "Pacific/Midway", "Asia/Tokyo", "Pacific/Kiritimati"]

// ---------------------------------------------------------------------------
// Rodando como PAI: dispara um filho por fuso e soma os vereditos.
//
// Não dá para trocar de fuso dentro do processo: o `TZ` é lido na partida, e
// mexer nele no meio deixa o V8 com dois calendários na mesma execução — o
// teste passaria a medir o cache, não o código.
// ---------------------------------------------------------------------------
if (!process.env.FUSO_DO_FILHO) {
  const esteArquivo = fileURLToPath(import.meta.url)
  let quebrados = 0
  for (const tz of FUSOS) {
    console.log(`\n${"=".repeat(70)}\nFUSO: ${tz}\n${"=".repeat(70)}`)
    const r = spawnSync(process.execPath, ["--import", "tsx", esteArquivo], {
      stdio: "inherit",
      env: { ...process.env, TZ: tz, FUSO_DO_FILHO: tz },
    })
    if (r.status !== 0) quebrados++
  }
  console.log(
    `\n${quebrados === 0
      ? `✓ os ${FUSOS.length} fusos deram o mesmo resultado`
      : `✗ ${quebrados} fuso(s) discordaram`}`
  )
  process.exit(quebrados === 0 ? 0 : 1)
}

// Os imports são estáticos e isso é seguro: o `TZ` do filho vem do ambiente do
// `spawn`, ou seja, já valia antes de o Node abrir qualquer módulo.
const {
  indicadores, gastosPorCategoria, mesDeReferencia, fluxoCaixaDiario, historicoDetalhado,
} = await import("../lib/financas.js")
const {
  ancorarDia, chaveDia, chaveMes, competenciaDe, diaDoMes, diasNoMes, hojeNoCalendario,
  inicioDoMes, noMes, ordinalMes,
} = await import("../lib/dia.js")
const { dataCurta } = await import("../lib/formato.js")
const { diagnosticar } = await import("../lib/vazamento.js")

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

/** Um lançamento gravado como o app grava: o dia, ancorado ao meio-dia UTC. */
function lanc(dia: string, tipo: "receita" | "despesa", valor: number, categoria: string | null = null): TransacaoCalc {
  return {
    tipo,
    valor,
    data: ancorarDia(dia),
    categoria: categoria ? { nome: categoria, cor: null } : null,
  }
}

// ---------------------------------------------------- o ciclo que fecha ---
//
// Escolhido no calendário → gravado às 12:00Z → lido em UTC. Se os três passos
// não devolverem o mesmo dia, todo o resto é consequência.
console.log("\nO DIA ESCOLHIDO É O DIA LIDO")

for (const dia of ["2026-01-01", "2026-08-21", "2026-08-31", "2026-12-31", "2024-02-29"]) {
  const gravado = ancorarDia(dia)
  checar(`${dia} volta como ${dia}`, chaveDia(gravado) === dia, chaveDia(gravado))
}

const primeiroDeAgosto = ancorarDia("2026-08-01")
checar("o dia 1º não cai no mês anterior", chaveMes(primeiroDeAgosto) === "2026-08", chaveMes(primeiroDeAgosto))
checar("e o rótulo da tela concorda com ele", dataCurta(primeiroDeAgosto) === "01/08", dataCurta(primeiroDeAgosto))

const ultimoDeDezembro = ancorarDia("2025-12-31")
checar("o dia 31 não cai no mês seguinte", chaveMes(ultimoDeDezembro) === "2025-12", chaveMes(ultimoDeDezembro))
checar("nem no ano seguinte", competenciaDe(ultimoDeDezembro).ano === 2025)

// Linha ANTIGA do banco: o Painel gravava `new Date("2026-08-01")`, que é
// meia-noite UTC. São os 449 lançamentos que já estavam lá quando `dataCurta`
// foi corrigida — a leitura precisa continuar certa para eles, senão a correção
// de hoje quebra o histórico de ontem.
const meiaNoite = new Date("2026-08-01T00:00:00.000Z")
checar("linha antiga (00:00Z) ainda é dia 1º de agosto",
  chaveDia(meiaNoite) === "2026-08-01" && dataCurta(meiaNoite) === "01/08",
  `${chaveDia(meiaNoite)} ${dataCurta(meiaNoite)}`)

// ------------------------------------------------ a soma e o rótulo ---
//
// O defeito de verdade não é "a data está errada": é a tela dizer um mês e a
// soma contar outro, cada uma com sua leitura.
console.log("\nA SOMA E O RÓTULO FALAM DO MESMO MÊS")

const bordas = [
  lanc("2026-08-01", "despesa", 100, "Moradia"),  // primeiro instante do mês
  lanc("2026-08-31", "despesa", 200, "Lazer"),    // último
  lanc("2026-08-15", "receita", 5000, "Salário"),
  lanc("2026-07-31", "despesa", 999, "Moradia"),  // véspera: não pode entrar
  lanc("2026-09-01", "despesa", 888, "Moradia"),  // dia seguinte: idem
]

const ago = indicadores(bordas, 8, 2026)
checar("agosto soma as duas bordas e nada além", ago.despesa === 300, `${ago.despesa}`)
checar("a receita do meio do mês entra", ago.receita === 5000, `${ago.receita}`)
checar("julho e setembro ficam de fora", ago.lancamentosNoMes === 3, `${ago.lancamentosNoMes}`)

// A conferência que amarra as duas leituras: para CADA lançamento, o mês que
// `dataCurta` escreve tem de ser o mês em que `indicadores` o contou.
let discordancias = 0
for (const t of bordas) {
  const mesDoRotulo = Number(dataCurta(t.data).slice(3, 5))
  const contadoEmAgosto = indicadores([t], 8, 2026).lancamentosNoMes === 1
  if (contadoEmAgosto !== (mesDoRotulo === 8)) discordancias++
}
checar("nenhum lançamento é rotulado num mês e somado em outro", discordancias === 0, `${discordancias}`)

// O MESMO, para as linhas ANTIGAS (00:00Z) — e este é o caso que já está no
// banco de produção, não uma hipótese. A âncora de meio-dia protege o dia
// contra ±11h de escorregão; a meia-noite não protege contra nenhum minuto,
// então é aqui que um fuso a oeste transforma o gasto do dia 1º de agosto em
// gasto de 31 de julho enquanto a tela continua escrevendo "01/08".
const legado = [
  { tipo: "despesa", valor: 100, data: new Date("2026-08-01T00:00:00.000Z"), categoria: null },
  { tipo: "despesa", valor: 200, data: new Date("2026-07-31T00:00:00.000Z"), categoria: null },
] as TransacaoCalc[]
const agoLegado = indicadores(legado, 8, 2026)
checar("linha antiga do dia 1º é somada em agosto, não em julho",
  agoLegado.despesa === 100 && agoLegado.lancamentosNoMes === 1,
  `${agoLegado.despesa} / ${agoLegado.lancamentosNoMes}`)
checar("e a de 31 de julho continua em julho",
  indicadores(legado, 7, 2026).despesa === 200)
for (const t of legado) {
  const mesDoRotulo = Number(dataCurta(t.data).slice(3, 5))
  const contado = indicadores([t], 8, 2026).lancamentosNoMes === 1
  checar(`linha antiga ${dataCurta(t.data)}: rótulo e soma concordam`, contado === (mesDoRotulo === 8))
}

const rosca = gastosPorCategoria(bordas, 8, 2026)
checar("a rosca de agosto tem as duas categorias de agosto", rosca.length === 2, `${rosca.length}`)
checar("e soma o mesmo que 'saiu'", rosca.reduce((s, f) => s + f.total, 0) === ago.despesa)

// ------------------------------------------------------- a competência ---
console.log("\nO MÊS DE QUE A TELA FALA")

const ref = mesDeReferencia(bordas)
checar("o último mês com movimento é setembro", ref.mes === 9 && ref.ano === 2026, `${ref.mes}/${ref.ano}`)

const viraAno = mesDeReferencia([lanc("2025-12-31", "despesa", 10), lanc("2026-01-01", "despesa", 10)])
checar("a virada de ano não confunde dezembro com janeiro",
  viraAno.mes === 1 && viraAno.ano === 2026, `${viraAno.mes}/${viraAno.ano}`)

checar("o ordinal ordena a virada de ano",
  ordinalMes(ancorarDia("2026-01-01")) === ordinalMes(ancorarDia("2025-12-31")) + 1)

// --------------------------------------------------------- o dia do mês ---
console.log("\nO DIA DENTRO DO MÊS")

// Mês PASSADO de propósito: no mês corrente a curva para em hoje (regra do
// gráfico, não do fuso), e o teste mediria a data em que foi rodado.
const fluxo = fluxoCaixaDiario([lanc("2025-08-01", "despesa", 100), lanc("2025-08-31", "receita", 50)], 8, 2025)
checar("a curva começa no dia 1 com o gasto do dia 1", fluxo[0]?.dia === 1 && fluxo[0]?.saldo === -100,
  `${fluxo[0]?.dia} ${fluxo[0]?.saldo}`)
checar("e termina no dia 31 com o saldo do mês", fluxo[fluxo.length - 1]?.dia === 31 && fluxo[fluxo.length - 1]?.saldo === -50,
  `${fluxo[fluxo.length - 1]?.dia} ${fluxo[fluxo.length - 1]?.saldo}`)
checar("nenhum dia da curva se repete ou some", fluxo.length === 31, `${fluxo.length}`)

checar("fevereiro de 2024 tem 29 dias", diasNoMes(2, 2024) === 29, `${diasNoMes(2, 2024)}`)
checar("fevereiro de 2026 tem 28", diasNoMes(2, 2026) === 28, `${diasNoMes(2, 2026)}`)
checar("dezembro tem 31", diasNoMes(12, 2026) === 31)
checar("o dia do mês de 31/12 é 31", diaDoMes(ancorarDia("2025-12-31")) === 31)

// ------------------------------------------------------ a borda do banco ---
//
// O filtro `mes`/`ano` roda no BANCO, antes de qualquer soma. Se a borda for
// local e a soma for UTC, a consulta traz um mês e a tela conta outro — e as
// duas estão "certas" separadamente.
console.log("\nA BORDA QUE O BANCO USA")

const inicio = inicioDoMes(8, 2026)
const fim = inicioDoMes(9, 2026)
checar("o mês começa em 01/08 00:00Z", inicio.toISOString() === "2026-08-01T00:00:00.000Z", inicio.toISOString())
checar("e termina antes de 01/09 00:00Z", fim.toISOString() === "2026-09-01T00:00:00.000Z", fim.toISOString())
checar("dezembro vira janeiro do ano seguinte",
  inicioDoMes(13, 2026).toISOString() === "2027-01-01T00:00:00.000Z", inicioDoMes(13, 2026).toISOString())
for (const t of bordas.slice(0, 3)) {
  const dentro = t.data >= inicio && t.data < fim
  checar(`o lançamento de ${chaveDia(t.data)} passa pelo filtro do banco`, dentro === noMes(t.data, 8, 2026))
}

// ------------------------------------------- as outras leituras do mesmo ---
//
// Situações, diagnóstico e histórico agrupam por mês por conta própria. Cada um
// com sua leitura é a mesma pessoa vendo três meses diferentes no mesmo app.
console.log("\nAS OUTRAS TELAS LEEM O MESMO MÊS")

const historico = historicoDetalhado(bordas, 12)
const agostoDetalhado = historico.find((m) => m.mes === "2026-08")
checar("o histórico da IA acha agosto", !!agostoDetalhado, `${historico.map((m) => m.mes).join(",")}`)
checar("e com a mesma despesa que a tela", agostoDetalhado?.despesa === ago.despesa,
  `${agostoDetalhado?.despesa} × ${ago.despesa}`)

const diag = diagnosticar(
  [
    { id: "1", descricao: "Netflix", valor: 40, tipo: "despesa", data: ancorarDia("2026-07-01") },
    { id: "2", descricao: "Netflix", valor: 40, tipo: "despesa", data: ancorarDia("2026-08-01") },
  ],
  new Date("2026-08-31T23:59:59Z")
)
checar("o diagnóstico vê dois meses seguidos, não um", diag.mesesAnalisados === 2, `${diag.mesesAnalisados}`)
checar("e por isso acha a assinatura", diag.achados.some((a) => a.tipo === "assinatura"))

// ------------------------------------------------------------ o "hoje" ---
//
// A exceção, e ela é deliberada: o dia de HOJE é o do relógio de parede de quem
// está lançando. Em São Paulo, às 22h de 30 de setembro, o dia da pessoa é 30 de
// setembro — `toISOString()` responderia "1º de outubro" e o gasto iria para o
// mês seguinte enquanto ela ainda jantava.
console.log("\nO 'HOJE' É O DA PESSOA, NÃO O DO MERIDIANO")

const noiteDeSetembro = new Date(2026, 8, 30, 22, 0, 0) // 30/09 22:00, hora local
checar("hoje é o dia do calendário local", hojeNoCalendario(noiteDeSetembro) === "2026-09-30",
  hojeNoCalendario(noiteDeSetembro))
checar("e o que ela escolheu é o que ela vai ler de volta",
  chaveDia(ancorarDia(hojeNoCalendario(noiteDeSetembro))) === "2026-09-30")

// ===========================================================================
// A OUTRA METADE: o código.
// ===========================================================================
console.log("\nO CÓDIGO NÃO VOLTA A LER A DATA POR CONTA PRÓPRIA")

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8")

/**
 * Onde um lançamento é lido ou gravado. Ler a data aqui em hora local compila,
 * passa no lint e erra a conta em silêncio para quem estiver fora de UTC.
 */
const ARQUIVOS_DE_DINHEIRO = [
  "lib/financas.ts",
  "lib/vazamento.ts",
  "lib/situacoes.ts",
  "lib/contexto-financeiro.ts",
  "lib/formato.ts",
  "lib/financeiro-repo.ts",
  "lib/extrato/duplicatas.ts",
  "app/api/analises/route.ts",
  "app/api/investimentos/route.ts",
  "app/api/perfil-financeiro/route.ts",
]

// `hoje` e `agora` seguem em hora local de propósito: relógio de parede não é
// data de lançamento. Qualquer OUTRO receptor lendo o calendário por conta
// própria é a divergência voltando.
const RELOGIOS = new Set(["hoje", "agora", "nasc"])
const LEITURA_DE_CALENDARIO = /(\w+)\.get(?:UTC)?(?:Month|FullYear|Date)\(\)/g

for (const arquivo of ARQUIVOS_DE_DINHEIRO) {
  const fonte = ler(arquivo)
  const proprias = [...fonte.matchAll(LEITURA_DE_CALENDARIO)]
    .map((m) => m[0])
    .filter((m) => !RELOGIOS.has(m.split(".")[0]!))
  checar(`${arquivo} não lê o calendário por conta própria`, proprias.length === 0, proprias.join(" "))
}

// Construir data por partes em hora local é a mesma leitura pelo avesso:
// `new Date(ano, mes - 1, 1)` é meia-noite LOCAL, e vira o mês vizinho no banco.
for (const arquivo of ARQUIVOS_DE_DINHEIRO) {
  const fonte = ler(arquivo)
  checar(`${arquivo} não monta data por partes em hora local`,
    !/new Date\(\s*\w+\s*,\s*\w+/.test(fonte))
}

// A âncora da ESCRITA: os três caminhos que gravam lançamento têm de usar a
// mesma função. O do chat escrevia `T12:00:00` sem o `Z` — meio-dia local, que
// num servidor a leste de UTC+12 empurra o dia para trás, exatamente o que o
// meio-dia existia para impedir.
const CAMINHOS_DE_ESCRITA = [
  "app/api/extrato/route.ts",
  "app/api/chat/lancamentos/route.ts",
  "app/api/painel/transacoes/route.ts",
]
for (const arquivo of CAMINHOS_DE_ESCRITA) {
  const fonte = ler(arquivo)
  checar(`${arquivo} grava pela âncora de lib/dia.ts`, /ancorarDia\(/.test(fonte))
  checar(`${arquivo} não repete a âncora à mão`, !/T12:00:00/.test(fonte))
}

// As duas telas que escolhem a data de um lançamento: o dia é o do calendário
// de quem lança. `toISOString()` aqui devolve o dia UTC e adianta o lançamento
// da noite para o dia seguinte.
const TELAS_QUE_ESCOLHEM_DIA = [
  "components/painel/TransacoesCard.tsx",
  "components/chat/ConfirmarLancamentos.tsx",
]
for (const arquivo of TELAS_QUE_ESCOLHEM_DIA) {
  const fonte = ler(arquivo)
  checar(`${arquivo} usa hojeNoCalendario`, /hojeNoCalendario\(/.test(fonte))
  checar(`${arquivo} não deriva o dia de toISOString`,
    !/toISOString\(\)\s*\.\s*(slice|split)/.test(fonte))
}

// A ofensiva fica FORA disto de propósito, e o teste protege a exceção: ela
// conta o dia em São Paulo porque a virada de um streak é um evento na vida da
// pessoa. Trocar aquilo por UTC viraria a cota às 21h do dia 31.
const missoes = ler("lib/missoes.ts")
checar("a ofensiva continua contando o dia em São Paulo, não em UTC",
  /inicioDoDiaSP/.test(missoes))

// E a razão de tudo, escrita onde a próxima pessoa vai procurar.
const dia = ler("lib/dia.ts")
checar("lib/dia.ts explica por que o meio-dia", /meio-dia/i.test(dia) && /fuso negativo|dia anterior/i.test(dia))

console.log(`\n${falhas === 0 ? `✓ todos os casos passaram (${process.env.FUSO_DO_FILHO})` : `✗ ${falhas} falha(s) em ${process.env.FUSO_DO_FILHO}`}`)
process.exit(falhas === 0 ? 0 : 1)
