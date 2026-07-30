/**
 * Testa se o portão de qualidade REPROVA leitura errada.
 *
 * POR QUE ISTO EXISTE
 * Um portão que sempre aprova é pior que portão nenhum: ele dá confiança falsa.
 * Foi literalmente o que aconteceu — `validarExtrato` aprovou um extrato em que
 * o modelo tinha descartado 294 de 438 linhas, porque sem saldo inicial ele caía
 * numa validação fraca que só olhava datas.
 *
 * Aqui cada caso parte de uma leitura CORRETA e introduz um erro conhecido. O
 * teste passa quando a leitura correta é aprovada e todo erro é reprovado.
 *
 * Não chama o modelo, não lê arquivo, não custa nada:
 *   node --import tsx scripts/testar-validacao.mts
 */
import { validarExtrato } from "../lib/extrato/validar.js"
import type { ExtratoParseado, TransacaoExtraida } from "../types/extrato.js"

function t(
  data: string,
  valor: number,
  descricao: string,
  extra: Partial<TransacaoExtraida> = {}
): TransacaoExtraida {
  return {
    data,
    descricaoOriginal: descricao,
    descricaoLimpa: descricao,
    valor,
    categoria: "outros",
    recorrente: false,
    afetaSaldo: true,
    ...extra,
  }
}

/**
 * Extrato sintético com saldos que fecham na mão:
 *   saldoInicial 1025,00 − 25,00 = 1000,00 em 10/01
 *   10/01: 1000,00
 *   11/01: 1000 − 150,50 − 0,06 + 20 = 869,44
 *   12/01: 869,44 − 300 = 569,44   (a compra no crédito NÃO entra)
 *   13/01: 569,44 + 1200,75 − 49,90 = 1720,29
 */
const CORRETO: ExtratoParseado = {
  banco: "Banco Teste",
  periodoInicio: "2026-01-10",
  periodoFim: "2026-01-13",
  saldoInicial: 1025.0,
  saldoFinal: 1720.29,
  saldosDiarios: [
    { data: "2026-01-10", saldo: 1000.0 },
    { data: "2026-01-11", saldo: 869.44 },
    { data: "2026-01-12", saldo: 569.44 },
    { data: "2026-01-13", saldo: 1720.29 },
  ],
  transacoes: [
    t("2026-01-10", -25.0, "Primeiro dia — só confere porque há saldoInicial"),
    t("2026-01-11", -150.5, "Mercado"),
    t("2026-01-11", -0.06, "Troco guardado", { categoria: "poupanca" }),
    t("2026-01-11", 20.0, "Pix recebido"),
    t("2026-01-12", -300.0, "Aluguel"),
    // Crédito: aparece no extrato, não move o saldo do dia.
    t("2026-01-12", -80.0, "Compra no cartão", { afetaSaldo: false }),
    t("2026-01-13", 1200.75, "Salário", { categoria: "renda" }),
    t("2026-01-13", -49.9, "Assinatura", { categoria: "assinaturas", recorrente: true }),
  ],
}

const clone = (): ExtratoParseado => JSON.parse(JSON.stringify(CORRETO))
const semIndice = (i: number) => { const e = clone(); e.transacoes.splice(i, 1); return e }

type Caso = { nome: string; extrato: ExtratoParseado; esperado: "aprovar" | "reprovar" }

const casos: Caso[] = [
  { nome: "leitura correta", extrato: clone(), esperado: "aprovar" },

  // A compra no crédito é o caso que me fez errar: somá-la no saldo do dia
  // reprovava uma leitura perfeita. Tem que continuar aprovando.
  { nome: "compra no crédito no mesmo dia", extrato: clone(), esperado: "aprovar" },

  { nome: "omite uma despesa grande", extrato: semIndice(1), esperado: "reprovar" },
  { nome: "omite um troco de R$ 0,06", extrato: semIndice(2), esperado: "reprovar" },
  { nome: "omite uma receita", extrato: semIndice(3), esperado: "reprovar" },

  {
    nome: "omite toda linha de poupança (o bug original)",
    extrato: (() => {
      const e = clone()
      e.transacoes = e.transacoes.filter((x) => x.categoria !== "poupanca")
      return e
    })(),
    esperado: "reprovar",
  },
  {
    nome: "troca o sinal de uma saída",
    extrato: (() => { const e = clone(); e.transacoes[1].valor = 150.5; return e })(),
    esperado: "reprovar",
  },
  {
    nome: "duplica uma transação",
    extrato: (() => { const e = clone(); e.transacoes.push({ ...e.transacoes[4] }); return e })(),
    esperado: "reprovar",
  },
  {
    nome: "erro de dígito: 150,50 vira 15,05",
    extrato: (() => { const e = clone(); e.transacoes[1].valor = -15.05; return e })(),
    esperado: "reprovar",
  },
  {
    nome: "marca crédito como se movesse o saldo",
    extrato: (() => { const e = clone(); e.transacoes[5].afetaSaldo = true; return e })(),
    esperado: "reprovar",
  },
  {
    nome: "erro dentro da tolerância de R$ 0,05 (arredondamento)",
    extrato: (() => { const e = clone(); e.transacoes[1].valor = -150.53; return e })(),
    esperado: "aprovar",
  },
  {
    // Sem âncora, o que veio antes do 1º saldo declarado fica sem conferência.
    // Continua aprovando, mas não pode se dizer forte — testado no fim.
    nome: "sem saldoInicial: aprova, mas não como forte",
    extrato: (() => { const e = clone(); e.saldoInicial = null; return e })(),
    esperado: "aprovar",
  },
  {
    // Sem saldo diário ainda sobra a conferência global por saldo inicial/final,
    // que também é forte — só não localiza o dia do erro.
    nome: "sem saldo diário: cai na conferência global",
    extrato: (() => { const e = clone(); e.saldosDiarios = []; return e })(),
    esperado: "aprovar",
  },
  {
    nome: "sem saldo nenhum: só resta a validação fraca",
    extrato: (() => {
      const e = clone()
      e.saldosDiarios = []
      e.saldoInicial = null
      e.saldoFinal = null
      return e
    })(),
    esperado: "aprovar", // aprova, mas NÃO como forte — conferido abaixo
  },
]

let falhas = 0
console.log("CASO".padEnd(48), "ESPERADO".padEnd(10), "OBTIDO")

for (const c of casos) {
  const v = validarExtrato(c.extrato)
  const obtido = v.ok ? "aprovar" : "reprovar"
  const ok = obtido === c.esperado
  if (!ok) falhas++
  const detalhe = v.ok
    ? `forte=${v.forte}`
    : v.motivo.replace(/\s+/g, " ").slice(0, 46)
  console.log(
    `${ok ? " " : "✗"} ${c.nome.padEnd(46)} ${c.esperado.padEnd(10)} ${obtido.padEnd(9)} ${detalhe}`
  )
}

// A leitura correta tem que ser aprovada COMO FORTE — aprovar fraco seria o
// mesmo buraco de antes com outro nome.
const vCorreto = validarExtrato(clone())
if (!vCorreto.ok || !vCorreto.forte) {
  falhas++
  console.log("\n✗ a leitura correta deveria passar como FORTE")
}

// Sem saldo NENHUM não pode se passar por conferência forte. É exatamente o
// buraco de antes: 294 de 438 linhas sumiram e o portão aprovou.
const semNada = clone()
semNada.saldosDiarios = []
semNada.saldoInicial = null
semNada.saldoFinal = null
const vFraco = validarExtrato(semNada)
if (!vFraco.ok || vFraco.forte) {
  falhas++
  console.log("\n✗ sem saldo algum a validação não pode se dizer forte")
}

// Sem saldoInicial sobra o que veio antes do 1º saldo declarado: aprova, mas
// não como forte.
const semAncora = clone()
semAncora.saldoInicial = null
const vSemAncora = validarExtrato(semAncora)
if (!vSemAncora.ok || vSemAncora.forte) {
  falhas++
  console.log("\n✗ sem saldoInicial a conferência não cobre tudo — não pode ser forte")
}

console.log(`\n${falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} caso(s) falharam`}`)
process.exit(falhas === 0 ? 0 : 1)
