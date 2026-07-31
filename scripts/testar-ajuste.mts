/**
 * Testa a linha que faz a conta fechar.
 *
 * POR QUE ISTO EXISTE
 * O ajuste mexe no total do Painel da pessoa. Um sinal trocado aqui não quebra
 * nada visivelmente — só faz o saldo ficar errado pelo DOBRO da diferença, em
 * silêncio, num número que ela vai usar para tomar decisão.
 *
 *   node --import tsx scripts/testar-ajuste.mts
 */
import { calcularAjuste } from "../lib/extrato/ajuste.js"
import { validarExtrato } from "../lib/extrato/validar.js"
import type { ExtratoParseado, TransacaoExtraida } from "../types/extrato.js"

function t(data: string, valor: number, desc = "x"): TransacaoExtraida {
  return {
    data, descricaoOriginal: desc, descricaoLimpa: desc, valor,
    categoria: "outros", recorrente: false, afetaSaldo: true,
  }
}

const base: ExtratoParseado = {
  banco: "Teste",
  periodoInicio: "2026-01-10",
  periodoFim: "2026-01-12",
  saldoInicial: null,
  saldoFinal: 700,
  saldosDiarios: [
    { data: "2026-01-10", saldo: 1000 },
    { data: "2026-01-11", saldo: 800 },
    { data: "2026-01-12", saldo: 700 },
  ],
  transacoes: [t("2026-01-11", -200, "Mercado"), t("2026-01-12", -100, "Uber")],
}

const clone = (): ExtratoParseado => JSON.parse(JSON.stringify(base))

let falhas = 0
function checar(nome: string, e: ExtratoParseado, esperado: { tipo: string; valor: number } | null) {
  const v = validarExtrato(e)
  const a = calcularAjuste(e, v)
  const ok =
    esperado === null
      ? a === null
      : !!a && a.tipo === esperado.tipo && Math.abs(a.valor - esperado.valor) < 0.01
  if (!ok) falhas++
  const obtido = a ? `${a.tipo} ${a.valor.toFixed(2)} em ${a.data}` : "nenhum"
  const alvo = esperado ? `${esperado.tipo} ${esperado.valor.toFixed(2)}` : "nenhum"
  console.log(`${ok ? "  ok   " : "  FALHA"} ${nome.padEnd(46)} esperado: ${alvo.padEnd(26)} obtido: ${obtido}`)
}

// 1. Conta fecha, mas o extrato começa no meio: falta o que já existia antes.
//    Soma lida = -300; saldo final = 700 -> antes havia 1000.
checar("fecha, sem saldo inicial -> Saldo inicial", clone(), { tipo: "saldo_inicial", valor: 1000 })

// 2. Uma saída de R$50 sumiu no dia 11: o saldo caiu 200, mas só lemos 150.
//    Falta -50 para fechar.
checar(
  "some uma saída de 50 -> Compensação -50",
  (() => { const e = clone(); e.transacoes[0].valor = -150; return e })(),
  { tipo: "compensacao", valor: -50 }
)

// 3. Uma entrada a mais de R$50: lemos -250 onde o saldo caiu 200.
//    Sobra 50, então o ajuste é +50.
checar(
  "lê 50 a mais de saída -> Compensação +50",
  (() => { const e = clone(); e.transacoes[0].valor = -250; return e })(),
  { tipo: "compensacao", valor: 50 }
)

// 4. Com saldo inicial declarado e tudo batendo, não falta nada.
checar(
  "fecha com saldo inicial declarado -> nenhum",
  (() => { const e = clone(); e.saldoInicial = 1000; e.saldosDiarios = []; return e })(),
  null
)

// 5. Sem saldo final não há como saber o que veio antes.
checar(
  "sem saldo final -> nenhum",
  (() => { const e = clone(); e.saldoFinal = null; return e })(),
  null
)

// O teste que importa de verdade: aplicar o ajuste faz a conta FECHAR?
console.log("\nO ajuste realmente fecha a conta?")
for (const [nome, mutar] of [
  ["some uma saída de 50", (e: ExtratoParseado) => { e.transacoes[0].valor = -150 }],
  ["lê 50 a mais", (e: ExtratoParseado) => { e.transacoes[0].valor = -250 }],
] as const) {
  const e = clone()
  mutar(e)
  const a = calcularAjuste(e, validarExtrato(e))
  if (!a) { falhas++; console.log(`  FALHA ${nome}: nenhum ajuste proposto`); continue }
  // aplica e revalida
  e.transacoes.push(t(a.data, a.valor, a.descricao))
  const depois = validarExtrato(e)
  const fechou = depois.ok
  if (!fechou) falhas++
  console.log(`  ${fechou ? "ok   " : "FALHA"} ${nome.padEnd(24)} -> ${fechou ? "fecha" : "AINDA NÃO FECHA: " + depois.motivo}`)
}

console.log(`\n${falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} caso(s) falharam`}`)
process.exit(falhas === 0 ? 0 : 1)
