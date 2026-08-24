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
 * lista existem?", e sim "existe modelo de alguém FORA da lista?". Um modelo
 * novo no schema, não classificado, derruba este teste pedindo a decisão.
 *
 * A REGRA DE POSSE É A RELAÇÃO COM `User`, NÃO A COLUNA `userId`. Procurar a
 * coluna pelo nome deixava passar `Indicacao` (indicadorId/indicadoId), `Turma`
 * (professorDaTurma), `ConviteEscola` (geradorDoConvite) e `AcessoTrilhaTurma`
 * (concessorDoAcesso) — e a indicação a rota já entregava sem estar em lista
 * nenhuma, que é o falso verde mais caro que um teste destes pode dar.
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
// Modelo de ALGUÉM: qualquer um que tenha uma relação com `User`, com que nome
// for. Ver o cabeçalho: a regra por coluna `userId` perdia quatro.
const deAlguem = modelos
  .filter((m) => m.name !== "User" && m.fields.some((f) => f.type === "User" && f.relationName))
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

checar("o schema tem modelos ligados a User", deAlguem.length > 0, `${deAlguem.length} modelos`)
checar("a rota tem o objeto `dump`", dump.length > 0, dump ? "" : "← `const dump = {` não encontrado em app/api/exportar/route.ts")

// ---------------------------------------------------------------- 1 ---
// A checagem que teria pego as memórias: nada de ninguém fica sem decisão.
for (const t of deAlguem) {
  checar(
    `${t}: classificado`,
    exportadas.has(t) || fora.has(t),
    exportadas.has(t) ? "exporta" : fora.has(t) ? "não exporta" : "← modelo ligado a User fora das DUAS listas de lib/dados-exportacao.ts"
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
// Ficar de fora é decisão, e decisão tem motivo escrito. Sem esta checagem, a
// lista de fora aceitaria uma linha vazia — que é o silêncio de volta, agora
// com aparência de classificado.
console.log("\n— o que fica de fora tem motivo —")
for (const [t, razao] of Object.entries(NAO_EXPORTADOS)) {
  checar(`${t}: tem razão escrita`, razao.trim().length > 20, razao.trim().length > 20 ? "" : "← escreva por que não sai")
}

// ---------------------------------------------------------------- 5 ---
// Classificar como "exporta" e não escrever a seção é a promessa sem a entrega
// — o defeito original com um arquivo a mais.
console.log("\n— toda seção classificada existe no arquivo exportado —")

/**
 * Onde procurar a chave de uma seção: no `dump` da rota, ou — quando ela sai
 * aninhada — no repositório que monta o aninhado. Procurar "mensagens" na rota
 * nunca acharia nada: quem as escreve é `exportarConversas`.
 */
function fonteDa(secao: { lidoPor: string; aninhadaEm?: string }): string {
  if (!secao.aninhadaEm) return dump
  const arquivo = ["conversa-repo", "memoria-repo", "orcamento-repo", "financeiro-repo"]
    .map((n) => new URL(`../lib/${n}.ts`, import.meta.url))
    .find((u) => readFileSync(u, "utf8").includes(`export async function ${secao.lidoPor}`))
  return arquivo ? readFileSync(arquivo, "utf8") : ""
}

for (const [tabela, secao] of Object.entries(SECOES_EXPORTADAS)) {
  const onde = fonteDa(secao)
  const presente = new RegExp(`(^|[\\s{])${secao.campo}\\s*[,:]`, "m").test(onde)
  const pai = secao.aninhadaEm
    ? new RegExp(`(^|[\\s{])${secao.aninhadaEm}\\s*[,:]`, "m").test(dump)
    : true
  checar(
    `${tabela} → ${secao.campo}${secao.aninhadaEm ? ` (dentro de ${secao.aninhadaEm})` : ""}`,
    presente && pai,
    presente && pai ? "" : "← classificado como exportado, mas não está no arquivo que a rota gera"
  )
}

// ---------------------------------------------------------------- 6 ---
// E a seção tem de vir de ONDE a lista diz. Sem isto, "insights" poderia estar
// no JSON preenchido com qualquer coisa — inclusive um array vazio literal, que
// é a forma silenciosa de a exportação continuar não exportando.
console.log("\n— cada seção vem da fonte que a lista nomeia —")
for (const [tabela, secao] of Object.entries(SECOES_EXPORTADAS)) {
  const lido = codigo.includes(secao.lidoPor)
  checar(`${tabela}: lido por ${secao.lidoPor}`, lido, lido ? "" : "← a lista nomeia esta fonte e a rota não a chama")
}

// ---------------------------------------------------------------- 7 ---
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

// ---------------------------------------------------------------- 8 ---
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

// A conversa é o caso que o schema não pega sozinho: `ConversaMensagem` não tem
// relação com `User` (pende de `Conversa`), então some da lista de modelos de
// alguém. Se a exportação entregasse só os títulos, nada acima acusaria.
const repoConversa = readFileSync(new URL("../lib/conversa-repo.ts", import.meta.url), "utf8")
checar("exportarConversas existe", repoConversa.includes("export async function exportarConversas"))
checar(
  "exportarConversas traz as MENSAGENS, decifradas",
  /exportarConversas[\s\S]*mensagens[\s\S]*decifrar\(m\.texto/.test(repoConversa)
)

// ---------------------------------------------------------------- 9 ---
// Credencial e id de sistema nosso não entram no arquivo. Um `select` copiado
// de outro arquivo é o jeito comum de isso voltar sem ninguém decidir.
console.log("\n— o que nunca sai —")
for (const campo of Object.keys(CAMPOS_FORA)) {
  const presente = new RegExp(`\\b${campo}\\b`).test(codigo)
  checar(`${campo}: fora do arquivo`, !presente, presente ? `← ${CAMPOS_FORA[campo]}` : "")
}

// --------------------------------------------------------------- 10 ---
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

// --------------------------------------------------------------- 11 ---
// Toda consulta é do dono. Uma exportação sem filtro não devolve dado a mais
// para quem pediu: devolve dado DOS OUTROS, e é o vazamento com a aparência
// mais inocente que existe — o arquivo abre certinho, só que grande demais.
console.log("\n— toda consulta filtra pelo dono —")
checar("a rota exige a sessão", codigo.includes("getUserIdOr401"))
const consultas = [...codigo.matchAll(/db\.(\w+)\.(findMany|findUnique|findFirst)\(/g)]
checar("há consultas para conferir", consultas.length > 0, `${consultas.length} consultas`)

/**
 * O argumento da consulta, e SÓ ele — casando os parênteses a partir da
 * abertura.
 *
 * Uma janela de N caracteres parecia servir e não servia: ela vaza para a
 * consulta seguinte, e a consulta seguinte quase sempre tem `userId`. Tirar o
 * `where` de uma leitura passava no teste porque o filtro do VIZINHO estava
 * dentro da janela — falso verde exatamente no bloco que existe para impedir
 * que o arquivo saia com dado dos outros.
 */
function argumentoDa(indice: number): string {
  const abre = codigo.indexOf("(", indice)
  if (abre < 0) return ""
  let profundidade = 0
  for (let i = abre; i < codigo.length; i++) {
    if (codigo[i] === "(") profundidade++
    else if (codigo[i] === ")") {
      profundidade--
      if (profundidade === 0) return codigo.slice(abre, i + 1)
    }
  }
  return codigo.slice(abre)
}

for (const c of consultas) {
  const argumento = argumentoDa(c.index ?? 0)
  const filtra = /where:\s*\{[^}]*(userId|indicadoId|email: user\.email)/.test(argumento) || /where: \{ id: userId \}/.test(argumento)
  checar(`db.${c[1]}.${c[2]} filtra pelo dono`, filtra, filtra ? "" : "← consulta sem filtro do dono")
}

// --------------------------------------------------------------- 12 ---
// Exportação que ninguém acha é exportação que não existe para quem precisa
// dela. O link do Menu é a única porta.
console.log("\n— a porta no Menu —")
const ajustes = readFileSync(new URL("../app/(app)/ajustes/page.tsx", import.meta.url), "utf8")
checar("Ajustes leva a /api/exportar", ajustes.includes("/api/exportar"))
checar("e o link baixa o arquivo", /href="\/api\/exportar"[\s\S]{0,120}download/.test(ajustes))

// --------------------------------------------------------------- 13 ---
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
