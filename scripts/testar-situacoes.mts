/**
 * Testa o eixo novo da Trilha: situação + nível no lugar do perfil.
 *
 * POR QUE ISTO EXISTE
 * O backlog T2 troca o roteador: os 4 perfis deixam de escolher a trilha e a
 * biblioteca inteira passa a concorrer, posicionada por `nivel` + `situacoes[]`.
 * Duas coisas podem quebrar em silêncio nessa troca, e as duas devolvem uma
 * lista de aulas — só que a lista errada:
 *
 *  1. o vocabulário de situações é todo de DÉFICIT, então quem está com a vida
 *     em ordem não casa com nada e receberia lista vazia ou aleatória;
 *  2. as situações que só a conversa sabe (`financiamento`, `dependentes`)
 *     podem ser apagadas por um recálculo dos números.
 *
 *   node --import tsx scripts/testar-situacoes.mts
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

import {
  derivarSituacoes,
  mesclarSituacoes,
  pontuarAula,
  ehSituacao,
  SITUACOES,
  type Situacao,
} from "../lib/situacoes.js"
import { nivelDeTrilha, type MetricasPerfil, type TransacaoCalc } from "../lib/financas.js"

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

function mov(tipo: "receita" | "despesa", valor: number, mes: number, categoria?: string): TransacaoCalc {
  return {
    tipo,
    valor,
    data: new Date(Date.UTC(2026, mes, 15)),
    categoria: categoria ? { nome: categoria, cor: null } : null,
  } as TransacaoCalc
}

const metricas = (p: Partial<MetricasPerfil>): MetricasPerfil =>
  ({ reservaEmergencia: 6, saudeFinanceira: 50, mesesComDados: 6, taxaEconomia: 20,
     controleOrcamentario: 80, consistencia: 80, ...p }) as MetricasPerfil

// ------------------------------------------------------------- derivação ---
console.log("O QUE OS NÚMEROS MOSTRAM")

checar("reserva curta vira sem_reserva",
  derivarSituacoes([], metricas({ reservaEmergencia: 1 })).includes("sem_reserva"))
checar("reserva de 6 meses NÃO vira sem_reserva",
  !derivarSituacoes([], metricas({ reservaEmergencia: 6 })).includes("sem_reserva"))

// Salário fixo em 4 meses: não é renda variável.
const fixo = [0, 1, 2, 3].map((m) => mov("receita", 4000, m))
checar("salário igual todo mês não é renda_variavel",
  !derivarSituacoes(fixo, metricas({})).includes("renda_variavel"),
  derivarSituacoes(fixo, metricas({})).join(", ") || "nenhuma")

// Renda que oscila de 2.000 a 6.000.
const varia = [mov("receita", 2000, 0), mov("receita", 6000, 1), mov("receita", 2500, 2), mov("receita", 5500, 3)]
checar("renda que oscila vira renda_variavel",
  derivarSituacoes(varia, metricas({})).includes("renda_variavel"))

// Dois meses só de receita não bastam para julgar a renda.
const doisMeses = [mov("receita", 2000, 0), mov("receita", 6000, 1)]
checar("dois meses não bastam para julgar a renda",
  !derivarSituacoes(doisMeses, metricas({})).includes("renda_variavel"))

// Gasto em categoria de juro é sinal direto.
const comJuro = [mov("receita", 4000, 0), mov("despesa", 300, 0, "Taxas e juros")]
checar("gasto com juros vira divida_rotativa",
  derivarSituacoes(comJuro, metricas({})).includes("divida_rotativa"))

// Fechar no vermelho duas vezes é o proxy.
const vermelho = [
  mov("receita", 3000, 0), mov("despesa", 3500, 0),
  mov("receita", 3000, 1), mov("despesa", 3800, 1),
]
checar("dois meses no vermelho viram divida_rotativa (proxy)",
  derivarSituacoes(vermelho, metricas({})).includes("divida_rotativa"))

const umMesRuim = [
  mov("receita", 3000, 0), mov("despesa", 3500, 0),
  mov("receita", 3000, 1), mov("despesa", 2000, 1),
]
checar("um mês ruim sozinho NÃO vira dívida",
  !derivarSituacoes(umMesRuim, metricas({})).includes("divida_rotativa"))

// As duas que os números não conseguem ver.
const tudo = derivarSituacoes(varia, metricas({ reservaEmergencia: 0 }))
checar("financiamento nunca sai dos números", !tudo.includes("financiamento"))
checar("dependentes nunca sai dos números", !tudo.includes("dependentes"))

// -------------------------------------------------------------- mesclar ---
console.log("\nO QUE A CONVERSA ACRESCENTA")

const juntas = mesclarSituacoes(["sem_reserva"], ["dependentes", "financiamento"])
checar("a conversa acrescenta o que os números não veem",
  juntas.includes("dependentes") && juntas.includes("financiamento") && juntas.includes("sem_reserva"),
  juntas.join(", "))
checar("lixo na conversa é ignorado",
  !mesclarSituacoes([], ["inventado", "sem_reserva"]).includes("inventado" as Situacao))
// Recalcular os números não pode esquecer o que a pessoa contou.
checar("recálculo não apaga o que veio da conversa",
  mesclarSituacoes([], ["dependentes"]).includes("dependentes"))
// Sete: as cinco originais mais `ensino_superior` e `primeiro_emprego`, que
// entraram com a trilha de Ensino Médio. As duas novas seguem a regra de
// `financiamento` e `dependentes` — não saem dos números, só da conversa —
// e é isso que a checagem seguinte afirma.
checar("o vocabulário tem as sete", SITUACOES.length === 7 && ehSituacao("divida_rotativa"))
checar("as situações de EM entram pela conversa, não pelo extrato",
  mesclarSituacoes([], ["ensino_superior", "primeiro_emprego"]).length === 2)

// ------------------------------------------------------------- pontuação ---
console.log("\nQUAL AULA GANHA")

const pessoa = { nivel: "iniciante", situacoes: ["divida_rotativa", "sem_reserva"] as Situacao[] }

const casaDuas = pontuarAula({ nivel: "iniciante", situacoes: ["divida_rotativa", "sem_reserva"] }, pessoa)
const casaUma = pontuarAula({ nivel: "iniciante", situacoes: ["divida_rotativa"] }, pessoa)
const geral = pontuarAula({ nivel: "iniciante", situacoes: [] }, pessoa)
const outraSit = pontuarAula({ nivel: "iniciante", situacoes: ["financiamento"] }, pessoa)

checar("quem casa duas situações ganha de quem casa uma", casaDuas > casaUma, `${casaDuas} vs ${casaUma}`)
checar("quem casa uma ganha da aula geral", casaUma > geral, `${casaUma} vs ${geral}`)
checar("a aula geral ganha da que fala de outra situação", geral > outraSit, `${geral} vs ${outraSit}`)

// O caso que mais me preocupa: a aula geral NÃO pode ficar de fora.
checar("aula sem situação nenhuma ainda pontua", geral > 0, `${geral}`)

const doNivel = pontuarAula({ nivel: "iniciante", situacoes: [] }, pessoa)
const doisAcima = pontuarAula({ nivel: "avancado", situacoes: [] }, pessoa)
checar("nível certo vale mais que dois degraus acima", doNivel > doisAcima, `${doNivel} vs ${doisAcima}`)

// ------------------------------------------------- quem está bem de vida ---
console.log("\nQUEM NÃO TEM DÉFICIT NENHUM")

const bemDeVida = { nivel: "intermediario", situacoes: [] as Situacao[] }
const notas = [
  { nome: "geral intermediaria", aula: { nivel: "intermediario", situacoes: [] } },
  { nome: "de dívida", aula: { nivel: "intermediario", situacoes: ["divida_rotativa"] } },
].map((x) => ({ ...x, nota: pontuarAula(x.aula, bemDeVida) }))

notas.forEach((n) => console.log(`     ${n.nome}: ${n.nota}`))
checar(
  "para quem está bem, a aula geral ganha da aula de déficit",
  notas[0].nota > notas[1].nota,
  `${notas[0].nota} vs ${notas[1].nota}`
)
checar("e ela pontua acima de zero, então não some da lista", notas[0].nota > 0)

// ---------------------------------------------------------------- nível ---
console.log("\nNÍVEL DA TRILHA x RÓTULO DO PERFIL")
checar("sem histórico é iniciante", nivelDeTrilha(metricas({ mesesComDados: 0 })) === "iniciante")
checar("saúde baixa é iniciante", nivelDeTrilha(metricas({ saudeFinanceira: 20 })) === "iniciante")
checar("saúde média é intermediario", nivelDeTrilha(metricas({ saudeFinanceira: 55 })) === "intermediario")
checar("saúde alta é avancado", nivelDeTrilha(metricas({ saudeFinanceira: 85 })) === "avancado")

console.log(`\n${falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`}`)
process.exit(falhas === 0 ? 0 : 1)
