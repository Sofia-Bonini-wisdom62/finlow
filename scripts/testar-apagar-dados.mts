/**
 * Testa "Apagar meus dados financeiros" — a lista, não o clique.
 *
 * O DEFEITO QUE ORIGINOU ESTE ARQUIVO
 *
 * A rota apagava transação, conta fixa e categoria. O app ganhou a tabela de
 * investimentos e ninguém somou na rota. Resultado: quem apertava o botão
 * recebia "Dados financeiros apagados." com a carteira inteira ainda no banco —
 * e a exportação LGPD, na tela ao lado, continuava entregando essa carteira.
 * As duas metades do mesmo direito discordavam uma da outra.
 *
 * Nenhum teste podia pegar isso, porque não havia o que quebrar: a lista era
 * três linhas literais, e uma linha que ninguém escreveu não falha.
 *
 * O QUE ESTE TESTE FAZ, ENTÃO
 *
 * Ele não confere se a rota apaga direito — confere se a LISTA está completa,
 * que é onde o erro mora. A pergunta central é a inversa da que se costuma
 * fazer: não "as tabelas da lista existem?", e sim "existe tabela do usuário
 * FORA das duas listas?". Um modelo novo no schema, não classificado como
 * financeiro nem como não-financeiro, derruba este teste pedindo a decisão.
 *
 * RODA SEM BANCO. Lê o schema pelo DMMF do Prisma, que é metadado gerado — não
 * abre conexão, não precisa de DATABASE_URL, e por isso roda em qualquer
 * máquina, inclusive na que executa a rotina agendada.
 *
 *   node --import tsx scripts/testar-apagar-dados.mts
 */
import { readFileSync } from "node:fs"
import { Prisma } from "@prisma/client"
import {
  TABELAS_FINANCEIRAS,
  TABELAS_NAO_FINANCEIRAS,
} from "../lib/dados-financeiros.js"

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

// O delegate do Prisma é o nome do modelo com a inicial minúscula:
// model ContaFixa -> db.contaFixa
const delegate = (modelo: string) => modelo[0].toLowerCase() + modelo.slice(1)

const modelos = Prisma.dmmf.datamodel.models
const donoDeUsuario = modelos
  .filter((m) => m.fields.some((f) => f.name === "userId"))
  .map((m) => delegate(m.name))

const apagar = new Set<string>(TABELAS_FINANCEIRAS)
const manter = new Set<string>(Object.keys(TABELAS_NAO_FINANCEIRAS))

console.log("\n— o schema e as duas listas —")

checar("o schema tem modelos com userId", donoDeUsuario.length > 0, `${donoDeUsuario.length} modelos`)

// ---------------------------------------------------------------- 1 ---
// A checagem que teria pego o investimento: nada do usuário fica sem decisão.
for (const t of donoDeUsuario) {
  checar(
    `${t}: classificado`,
    apagar.has(t) || manter.has(t),
    apagar.has(t) ? "apaga" : manter.has(t) ? "mantém" : "← tabela do usuário fora das DUAS listas de lib/dados-financeiros.ts"
  )
}

// ---------------------------------------------------------------- 2 ---
// O contrário: lista que nomeia tabela que não existe mais. Um rename de modelo
// deixaria a rota tentando apagar um delegate inexistente — em produção isso é
// um 500 na única operação que não tem volta.
const conhecidos = new Set(modelos.map((m) => delegate(m.name)))
for (const t of [...apagar, ...manter]) {
  checar(`${t}: existe no schema`, conhecidos.has(t), conhecidos.has(t) ? "" : "← nome na lista sem modelo correspondente")
}

// ---------------------------------------------------------------- 3 ---
for (const t of apagar) {
  checar(`${t}: não está nas duas listas`, !manter.has(t))
}

// ---------------------------------------------------------------- 4 ---
// A suposição do cast na rota: todo nome da lista é um delegate de verdade e
// tem deleteMany por userId. Confere pelo DMMF, sem instanciar cliente.
for (const t of TABELAS_FINANCEIRAS) {
  const m = modelos.find((x) => delegate(x.name) === t)
  checar(`${t}: apagável por userId`, Boolean(m?.fields.some((f) => f.name === "userId")))
}

// ---------------------------------------------------------------- 5 ---
// Ordem: quem aponta sai antes de quem é apontado. Categoria por último.
console.log("\n— a ordem do $transaction —")
const pos = (t: string) => TABELAS_FINANCEIRAS.indexOf(t as never)
checar("transacao antes de categoria", pos("transacao") < pos("categoria"))
checar("orcamento antes de categoria", pos("orcamento") < pos("categoria"))
checar("transacao antes de extratoImport", pos("transacao") < pos("extratoImport"))
checar("categoria é a última", pos("categoria") === TABELAS_FINANCEIRAS.length - 1)

// ---------------------------------------------------------------- 6 ---
// Simetria com a exportação: o que a LGPD entrega, a LGPD apaga.
// Estes dois são o caso real — a exportação já os entregava enquanto a rota de
// apagar os ignorava.
console.log("\n— exportar e apagar têm que concordar —")
const exportar = readFileSync(new URL("../app/api/exportar/route.ts", import.meta.url), "utf8")
for (const [campo, tabela] of [
  ["investimentos", "investimento"],
  ["diagnosticoVazamento", "diagnosticoVazamento"],
  ["contasFixas", "contaFixa"],
  ["transacoes", "transacao"],
  ["categorias", "categoria"],
] as const) {
  if (exportar.includes(`${campo}:`)) {
    checar(`exportação entrega ${campo} → apagar leva ${tabela}`, apagar.has(tabela))
  }
}

// ---------------------------------------------------------------- 7 ---
// A rota não pode voltar a ter a lista escrita à mão: foi assim que o
// investimento ficou de fora. Se alguém reescrever literal, isto acusa.
console.log("\n— a rota e a tela —")
const rota = readFileSync(new URL("../app/api/painel/consentimento/route.ts", import.meta.url), "utf8")
const corpoDelete = rota.slice(rota.indexOf("export async function DELETE"))
checar("a rota delega para apagarDadosFinanceiros", corpoDelete.includes("apagarDadosFinanceiros"))
checar(
  "a rota não tem deleteMany escrito à mão",
  !/db\.\w+\.deleteMany/.test(corpoDelete),
  /db\.\w+\.deleteMany/.test(corpoDelete) ? "← lista literal de volta no DELETE" : ""
)

const exec = readFileSync(new URL("../lib/apagar-financeiro.ts", import.meta.url), "utf8")
checar("a execução percorre a lista de lib/", exec.includes("TABELAS_FINANCEIRAS"))
checar(
  "a execução não tem deleteMany escrito à mão",
  !/db\.\w+\.deleteMany/.test(exec),
  /db\.\w+\.deleteMany/.test(exec) ? "← lista literal em lib/apagar-financeiro.ts" : ""
)
// O opt-in tem que cair junto: sem isso a pessoa volta a um Painel "ativo" e
// vazio, sem nunca ter reconsentido.
checar("a execução zera o consentimento no mesmo lote", /consentimentoPainelEm:\s*null/.test(exec))
checar("a execução é uma transação só", exec.includes("$transaction"))

// ---------------------------------------------------------------- 8 ---
// A tela de confirmação não pode prometer menos do que o botão faz. Era o outro
// lado do mesmo defeito: a frase dizia "transações, contas fixas e categorias".
const ajustes = readFileSync(new URL("../app/(app)/ajustes/page.tsx", import.meta.url), "utf8")
const confirmacao = ajustes.slice(ajustes.indexOf("confirmandoApagar ?"), ajustes.indexOf("Sim, apagar tudo"))
for (const palavra of ["investimentos", "contas fixas", "categorias"]) {
  checar(`a confirmação cita "${palavra}"`, confirmacao.toLowerCase().includes(palavra))
}

console.log(
  falhas === 0
    ? `\n${"─".repeat(60)}\nTudo certo. ${apagar.size} tabelas apagam, ${manter.size} ficam.\n`
    : `\n${"─".repeat(60)}\n${falhas} FALHA(S).\n`
)
process.exit(falhas === 0 ? 0 : 1)
