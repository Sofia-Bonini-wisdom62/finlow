/**
 * Testa a exportação LGPD — a LISTA, não o clique.
 *
 * O DEFEITO QUE ORIGINOU ESTE ARQUIVO
 *
 * `/api/exportar` dizia "baixa TODOS os dados do usuário" no comentário do
 * topo, e o `README.md` promete o mesmo na regra 3. Não era verdade: ficavam de
 * fora as memórias do assistente, as conversas do chat, os orçamentos, as
 * respostas do onboarding, os eventos de pontuação, os insights e o progresso
 * das lições — o mais sensível do banco. O delete cobre tudo por CASCADE; a
 * exportação é escrita à mão, e o que se escreve à mão se esquece.
 *
 * Nenhum teste podia pegar isso, porque não havia o que quebrar: uma seção que
 * ninguém escreveu não falha. É o mesmo defeito que `testar-apagar-dados.mts`
 * corrigiu do outro lado, e a correção é a mesma: a lista virou dado
 * (`lib/dados-exportacao.ts`) e este teste a confere contra o schema.
 *
 * A pergunta central é a inversa da que se costuma fazer: não "as seções da
 * lista existem?", e sim "existe tabela do usuário FORA da lista?". Um modelo
 * novo no schema, não classificado, derruba este teste pedindo a decisão.
 *
 * RODA SEM BANCO. Lê o schema pelo DMMF do Prisma, que é metadado gerado — não
 * abre conexão, não precisa de DATABASE_URL, e por isso roda em qualquer
 * máquina, inclusive na que executa a rotina agendada.
 *
 *   node --import tsx scripts/testar-exportacao.mts
 */
import { readFileSync } from "node:fs"
import { Prisma } from "@prisma/client"
import { SECOES_EXPORTADAS, NAO_EXPORTADOS, CAMPOS_FORA } from "../lib/dados-exportacao.js"
import { TABELAS_FINANCEIRAS } from "../lib/dados-financeiros.js"

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

const rota = readFileSync(new URL("../app/api/exportar/route.ts", import.meta.url), "utf8")

// Para as checagens de "isto não pode aparecer", o comentário não conta: a rota
// EXPLICA por que o token do Google não sai, e um guard que acusasse a
// explicação ensinaria a apagar a explicação.
const codigo = rota
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .split("\n")
  .map((l) => l.replace(/\/\/.*$/, ""))
  .join("\n")

// O objeto que VIRA o arquivo. Procurar a seção no arquivo inteiro aceitaria
// uma variável destrinchada no topo que nunca chegou ao JSON — que é
// exatamente o modo de falhar deste teste dar falso verde.
const inicio = rota.indexOf("const dump = {")
const fim = rota.indexOf("const data =", inicio)
const dump = inicio >= 0 && fim > inicio ? rota.slice(inicio, fim) : ""

const exportadas = new Set(Object.keys(SECOES_EXPORTADAS))
const fora = new Set(Object.keys(NAO_EXPORTADOS))

console.log("\n— o schema e as duas listas —")

checar("o schema tem modelos com userId", donoDeUsuario.length > 0, `${donoDeUsuario.length} modelos`)
checar("a rota tem o objeto `dump`", dump.length > 0, dump ? "" : "← `const dump = {` não encontrado em app/api/exportar/route.ts")

// ---------------------------------------------------------------- 1 ---
// A checagem que teria pego as memórias: nada do usuário fica sem decisão.
for (const t of donoDeUsuario) {
  checar(
    `${t}: classificado`,
    exportadas.has(t) || fora.has(t),
    exportadas.has(t) ? "exporta" : fora.has(t) ? "não exporta" : "← tabela do usuário fora das DUAS listas de lib/dados-exportacao.ts"
  )
}

// ---------------------------------------------------------------- 2 ---
// O contrário: lista que nomeia modelo que não existe mais. Um rename deixaria
// a exportação com um item classificado que nada preenche, e a conferência
// acima passaria a aprovar um schema que perdeu a tabela.
const conhecidos = new Set(modelos.map((m) => delegate(m.name)))
for (const t of [...exportadas, ...fora]) {
  checar(`${t}: existe no schema`, conhecidos.has(t), conhecidos.has(t) ? "" : "← nome na lista sem modelo correspondente")
}

// ---------------------------------------------------------------- 3 ---
for (const t of exportadas) {
  checar(`${t}: não está nas duas listas`, !fora.has(t))
}

// ---------------------------------------------------------------- 4 ---
// Classificar como "exporta" e não escrever a seção é a promessa sem a entrega
// — o defeito original com um arquivo a mais.
console.log("\n— toda seção classificada existe no arquivo exportado —")
for (const [tabela, campo] of Object.entries(SECOES_EXPORTADAS)) {
  const presente = new RegExp(`(^|[\\s{])${campo}\\s*[,:]`, "m").test(dump)
  checar(`${tabela} → ${campo}`, presente, presente ? "" : "← classificado como exportado, mas não está no `dump` da rota")
}

// ---------------------------------------------------------------- 5 ---
// Simetria com o apagar: o que a LGPD apaga a pedido, a LGPD sabe entregar.
// Era a assimetria real — investimento e diagnóstico saíam na exportação e
// ficavam no delete; orçamento e extrato importado faziam o caminho inverso.
console.log("\n— exportar e apagar têm que concordar —")
for (const t of TABELAS_FINANCEIRAS) {
  checar(
    `apagar leva ${t} → exportação entrega`,
    exportadas.has(t),
    exportadas.has(t) ? "" : "← some no botão de apagar e nunca saiu no arquivo: a pessoa perde sem nunca ter podido levar"
  )
}

// ---------------------------------------------------------------- 6 ---
// Dado cifrado tem de sair pelo repositório. Lido direto do banco vira "v1.…",
// e num arquivo JSON isso não dá erro nenhum: dá um dump de lixo que a pessoa
// abre sem entender. É o mesmo motivo de lib/financeiro-repo e lib/cripto.
console.log("\n— o que é cifrado sai decifrado —")
// Lê o `schema.prisma` como TEXTO, não pelo DMMF: a marca "CIFRADO" é
// comentário de linha (`//`), e o DMMF só carrega os `///`. Pelo metadado esta
// lista voltaria vazia e o bloco inteiro passaria sem conferir nada.
const schema = readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8")
const cifrados = [...schema.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm)]
  .filter(([, , corpo]) => /CIFRAD/i.test(corpo))
  .map(([, nome]) => nome)
checar("o schema marca campos cifrados", cifrados.length > 0, cifrados.join(", "))

for (const modelo of cifrados) {
  if (modelo === "User") continue // a rota lê User, mas nunca o campo cifrado — ver abaixo
  const leituraDireta = new RegExp(`db\\.${delegate(modelo)}\\.find`).test(codigo)
  checar(
    `${delegate(modelo)}: não é lido direto pela rota`,
    !leituraDireta,
    leituraDireta ? "← tem campo CIFRADO no schema; exporte pelo repositório, senão o arquivo sai com \"v1.…\"" : ""
  )
}
checar(
  "personalidadeDetalhe não é selecionado direto",
  !codigo.includes("personalidadeDetalhe"),
  codigo.includes("personalidadeDetalhe") ? "← é cifrado; quem decifra é lerPersonalidade()" : ""
)

// A conversa é o caso que o DMMF não pega sozinho: `ConversaMensagem` não tem
// `userId` (pende de `Conversa`), então some da lista de modelos do usuário. Se
// a exportação entregasse só os títulos, nada acima acusaria.
const repoConversa = readFileSync(new URL("../lib/conversa-repo.ts", import.meta.url), "utf8")
checar("a rota exporta conversa pelo repositório", rota.includes("exportarConversas"))
checar("exportarConversas existe", repoConversa.includes("export async function exportarConversas"))
checar(
  "exportarConversas traz as MENSAGENS, decifradas",
  /exportarConversas[\s\S]*mensagens[\s\S]*decifrar\(m\.texto/.test(repoConversa),
  ""
)

// ---------------------------------------------------------------- 7 ---
// Credencial e id de sistema nosso não entram no arquivo. Um `select` copiado
// de outro arquivo é o jeito comum de isso voltar sem ninguém decidir.
console.log("\n— o que nunca sai —")
for (const campo of Object.keys(CAMPOS_FORA)) {
  const presente = new RegExp(`\\b${campo}\\b`).test(codigo)
  checar(`${campo}: fora do arquivo`, !presente, presente ? `← ${CAMPOS_FORA[campo]}` : "")
}

// ---------------------------------------------------------------- 8 ---
// Teto de renderização não pode virar teto de portabilidade: um `take:` aqui
// entregaria "os 40 mais recentes" com o arquivo dizendo "todos os seus dados",
// e a conversa que a pessoa foi buscar seria justamente a antiga.
checar(
  "a rota não corta com take:",
  !/\btake:\s*\d/.test(rota),
  /\btake:\s*\d/.test(rota) ? "← corte de tela não vale para exportação" : ""
)
checar(
  "exportarConversas não corta com take:",
  !/exportarConversas[\s\S]{0,600}?take:/.test(repoConversa)
)

// ---------------------------------------------------------------- 9 ---
// A rota não pode voltar a prometer o que não entrega: se o comentário do topo
// diz "TODOS", a lista tem de ser a fonte. Isto amarra os dois.
console.log("\n— a promessa e a fonte —")
checar("a rota aponta para a lista", rota.includes("dados-exportacao"), rota.includes("dados-exportacao") ? "" : "← o comentário do topo promete tudo; diga onde mora a lista")

console.log(
  falhas === 0
    ? `\n✓ exportação conferida — ${Object.keys(SECOES_EXPORTADAS).length} seções, ${Object.keys(NAO_EXPORTADOS).length} fora com razão escrita\n`
    : `\n✗ ${falhas} falha(s)\n`
)
process.exit(falhas === 0 ? 0 : 1)
