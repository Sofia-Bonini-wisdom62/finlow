/**
 * Testa a portabilidade LGPD (`/api/exportar`) — a LISTA, não o clique.
 *
 * O DEFEITO QUE ORIGINOU ESTE ARQUIVO
 *
 * O topo da rota promete, desde o primeiro dia, "baixa TODOS os dados do
 * usuário". A regra 3 do `README.md` promete o mesmo em outras palavras: dado
 * novo do usuário entra em `/api/exportar` e sai no delete de `/api/conta`. O
 * delete cumpriu sempre — é CASCADE do banco, tabela nova nasce coberta. A
 * exportação era uma lista escrita à mão dentro de uma rota, e ficou sete
 * tabelas atrás do schema: conversas do chat, memórias do assistente,
 * orçamentos, respostas do onboarding, XP, insights e progresso de lição. As
 * duas primeiras são o dado mais sensível do app; a última foi nomeada no
 * backlog em 14/08/2026, quando o professor passou a ver a nota da aluna numa
 * tela da escola e o arquivo da própria aluna não trazia.
 *
 * Nenhum teste podia pegar isso, porque não havia o que quebrar: uma tabela que
 * ninguém somou à rota não falha nada. Compila, roda, e mente na tela de
 * privacidade.
 *
 * O QUE ESTE TESTE FAZ, ENTÃO
 *
 * A pergunta é a inversa da usual: não "o que a rota exporta existe?", e sim
 * "existe tabela do usuário FORA das duas listas de `lib/dados-exportados.ts`?".
 * Modelo novo no schema, não classificado como exportado nem como excluído com
 * motivo, derruba este teste pedindo a decisão — que é o único momento em que
 * alguém sabe a resposta. É o mesmo serviço que
 * `scripts/testar-apagar-dados.mts` presta do lado do apagar, e as duas metades
 * se cruzam aqui: o que o botão de apagar financeiro destrói TEM de sair no
 * arquivo, porque a tela oferece "Baixar meus dados antes" ao lado dele.
 *
 * RODA SEM BANCO. Lê o schema pelo DMMF do Prisma (metadado gerado, não abre
 * conexão) e o fonte da rota como texto. Roda em qualquer máquina, inclusive na
 * que executa a rotina agendada.
 *
 *   node --import tsx scripts/testar-exportacao.mts
 */
import { readFileSync } from "node:fs"
import { Prisma } from "@prisma/client"
import { TABELAS_EXPORTADAS, TABELAS_FORA_DA_EXPORTACAO } from "../lib/dados-exportados.js"
import { TABELAS_FINANCEIRAS } from "../lib/dados-financeiros.js"

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8")
const rota = ler("app/api/exportar/route.ts")
const repoConversa = ler("lib/conversa-repo.ts")
const ajustes = ler("app/(app)/ajustes/page.tsx")
const schema = ler("prisma/schema.prisma")

// O delegate do Prisma é o nome do modelo com a inicial minúscula:
// model ContaFixa -> db.contaFixa
const delegate = (modelo: string) => modelo[0].toLowerCase() + modelo.slice(1)

const modelos = Prisma.dmmf.datamodel.models
const todos = new Set(modelos.map((m) => delegate(m.name)))
const donoDeUsuario = modelos
  .filter((m) => m.fields.some((f) => f.name === "userId"))
  .map((m) => delegate(m.name))

const exporta = new Set(Object.keys(TABELAS_EXPORTADAS))
const naoExporta = new Set(Object.keys(TABELAS_FORA_DA_EXPORTACAO))

console.log("\n— o schema e as duas listas —")

checar("o schema tem modelos com userId", donoDeUsuario.length > 0, `${donoDeUsuario.length} modelos`)

// ---------------------------------------------------------------- 1 ---
// A checagem que teria pego as sete ausências: nada do usuário fica sem decisão.
for (const t of donoDeUsuario) {
  const classificado = exporta.has(t) || naoExporta.has(t)
  checar(
    `${t} está classificado`,
    classificado,
    classificado ? "" : "← tabela do usuário fora das duas listas de lib/dados-exportados.ts"
  )
}

// Nem dos dois lados ao mesmo tempo, nem inventado.
for (const t of [...exporta].filter((x) => naoExporta.has(x))) {
  checar(`${t} está em uma lista só`, false, "← classificado como exportado E como excluído")
}
for (const t of [...exporta, ...naoExporta]) {
  checar(`${t} existe no schema`, todos.has(t), todos.has(t) ? "" : "← nome que não é modelo do Prisma")
}

// ---------------------------------------------------------------- 2 ---
// Exclusão precisa de motivo escrito. "Não está na lista" e "decidimos que não
// sai, por isto" são coisas diferentes, e só a segunda sobrevive à revisão.
console.log("\n— o que fica de fora tem motivo —")
for (const [t, motivo] of Object.entries(TABELAS_FORA_DA_EXPORTACAO)) {
  checar(`${t} tem motivo escrito`, motivo.trim().length >= 60, motivo.trim().length < 60 ? "← motivo curto demais" : "")
}

// ---------------------------------------------------------------- 3 ---
// A lista não vale nada se a rota não obedecer: cada tabela exportada precisa
// ser LIDA pela rota, e a chave prometida precisa existir no JSON.
console.log("\n— a rota obedece a lista —")
// O objeto que vira o arquivo, isolado do resto da rota.
const dump = rota.slice(rota.indexOf("const dump = {"), rota.indexOf("const data = new Date()"))
checar("o objeto exportado foi encontrado", dump.length > 200)
for (const [t, { chave, via }] of Object.entries(TABELAS_EXPORTADAS)) {
  const leituraDireta = rota.includes(`db.${t}.`)
  if (via) {
    checar(`${t} é lida por ${via}()`, rota.includes(`${via}(`), rota.includes(`${via}(`) ? "" : "← a rota não chama o repositório")
    checar(`${via} é importada na rota`, new RegExp(`import\\s*\\{[^}]*\\b${via}\\b`).test(rota))
  } else {
    checar(`${t} é lida na rota`, leituraDireta, leituraDireta ? "" : `← falta db.${t} em app/api/exportar/route.ts`)
  }
  // A chave é o que a pessoa procura no arquivo. Aninhada ("jogo.extratoDeCoins")
  // vale a última parte — é ela que aparece como chave no JSON.
  //
  // A procura é DENTRO do objeto `dump`, e essa é a diferença entre a checagem
  // valer e não valer: varrendo a rota inteira, `const [..., diasAtivos, ...] =`
  // já satisfaz o padrão, e apagar a linha que põe `diasAtivos` no JSON passaria
  // batido. Conferido tirando a linha — a checagem acusa.
  const folha = chave.split(".").pop()!
  checar(`a chave "${chave}" existe no JSON`, new RegExp(`\\b${folha}\\s*[:,]`).test(dump))
}

// ---------------------------------------------------------------- 4 ---
// Campo cifrado só se lê pelo repositório dele: a cifra é amarrada ao dono e ao
// campo (AAD), e `db.<tabela>` direto entregaria "v1.VQ3H…" num arquivo que
// existe justamente para ser legível. A lista de quem é cifrado sai do SCHEMA,
// não daqui — modelo novo com campo cifrado entra nesta checagem sozinho.
console.log("\n— o que é cifrado sai pelo repositório —")
const blocos = schema.split(/\nmodel\s+/).slice(1)
const cifrados = blocos
  .map((b) => ({ nome: delegate(b.slice(0, b.indexOf(" ")).trim()), corpo: b.slice(0, b.indexOf("\n}")) }))
  .filter((m) => /cifrad[oa]s?\b/i.test(m.corpo))
  .map((m) => m.nome)

checar("o schema declara campo cifrado", cifrados.length > 0, `${cifrados.length} modelos`)
for (const t of cifrados.filter((c) => exporta.has(c))) {
  const { via } = TABELAS_EXPORTADAS[t]
  checar(`${t} tem repositório declarado`, Boolean(via), via ? "" : "← cifrado sem `via`: sairia como v1.VQ3H…")
  checar(
    `${t} não é lida direto na rota`,
    !rota.includes(`db.${t}.`),
    rota.includes(`db.${t}.`) ? `← db.${t} pula a decifragem` : ""
  )
}

// ---------------------------------------------------------------- 5 ---
// As mensagens penduram na conversa (ConversaMensagem não tem userId próprio),
// e o corte de leitura da TELA não pode vazar para a exportação: 200 mensagens
// bastam para rolar a conversa e devolveriam menos do que o banco tem.
console.log("\n— a conversa sai inteira —")
const exportador = repoConversa.slice(repoConversa.indexOf("export async function exportarConversas"))
const corpoExportador = exportador.slice(0, exportador.indexOf("\n}\n"))
checar("exportarConversas inclui as mensagens", /mensagens\s*:\s*\{/.test(corpoExportador))
checar("exportarConversas não corta com take", !/\btake\b/.test(corpoExportador), /\btake\b/.test(corpoExportador) ? "← teto de tela na exportação" : "")
checar("a poda continua na GRAVAÇÃO", repoConversa.includes("async function podar"))

// ---------------------------------------------------------------- 6 ---
// O que o botão de apagar destrói, a pessoa precisa conseguir baixar antes — e
// a tela de Ajustes oferece exatamente isso ao lado do botão.
console.log("\n— as duas metades do mesmo direito —")
for (const t of TABELAS_FINANCEIRAS) {
  checar(`${t} (apagável) sai na exportação`, exporta.has(t), exporta.has(t) ? "" : "← some no botão e não sai no arquivo")
}
checar('a tela oferece "Baixar meus dados antes"', ajustes.includes("Baixar meus dados antes"))
checar("o link do Menu aponta para /api/exportar", ajustes.includes('href="/api/exportar"'))

// ---------------------------------------------------------------- 7 ---
// Credencial nunca entra no arquivo. Um JSON baixado vai para a pasta de
// downloads, o Drive, o anexo de e-mail: token de sessão ali dentro é a conta
// inteira na mão de quem abrir.
console.log("\n— nada de credencial no arquivo —")
const PROIBIDOS = [
  "senha",
  "sessionToken",
  "refresh_token",
  "access_token",
  "id_token",
  "stripeCustomerId",
  "stripeSubscriptionId",
  "personalidadeDetalhe", // sai decifrado por lerPersonalidade, nunca a cifra
]
for (const campo of PROIBIDOS) {
  checar(`a rota não seleciona ${campo}`, !new RegExp(`\\b${campo}\\s*:\\s*true`).test(rota))
}

// ---------------------------------------------------------------- 8 ---
// Toda leitura é filtrada pelo dono. É a regra do `lib/painel.ts` ("userId
// sempre da sessão"), e aqui ela vale duas vezes: uma consulta sem filtro não
// vazaria uma linha — entregaria a tabela inteira de todo mundo num arquivo.
console.log("\n— toda consulta é do dono —")
//
// O trecho olhado vai de uma consulta até a PRÓXIMA, nunca uma janela fixa:
// com janela, o `where: { userId }` da consulta seguinte satisfazia a checagem
// da anterior, e tirar o filtro de uma delas passava batido. Conferido tirando
// o `where` de `db.insight` — a checagem acusa.
const consultas = [...rota.matchAll(/db\.(\w+)\.(findMany|findUnique|findFirst)\(\{/g)]
checar("a rota tem consultas para conferir", consultas.length > 0, `${consultas.length} consultas`)
consultas.forEach((c, i) => {
  const fim = consultas[i + 1]?.index ?? rota.length
  const trecho = rota.slice(c.index!, fim)
  const filtrada = /where:\s*\{[^}]*(userId|id:\s*userId)/.test(trecho)
  checar(`db.${c[1]}.${c[2]} filtra pelo dono`, filtrada, filtrada ? "" : "← consulta sem userId no where")
})

console.log(
  falhas === 0
    ? `\n${"─".repeat(60)}\nTudo certo. ${exporta.size} tabelas saem no arquivo, ${naoExporta.size} ficam de fora com motivo.\n`
    : `\n${"─".repeat(60)}\n${falhas} FALHA(S).\n`
)
process.exit(falhas === 0 ? 0 : 1)
