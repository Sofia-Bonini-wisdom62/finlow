/**
 * Mede a acurácia da extração do extrato contra ground truth.
 *
 * POR QUE ISTO EXISTE
 * O produto promete "esse número é verdade". `validarExtrato` confere se as
 * somas fecham com o saldo declarado, mas isso só pega erro que desequilibra a
 * conta — dois valores trocados entre si passam batido. Aqui a comparação é
 * transação por transação contra o CSV do próprio banco, que é exato.
 *
 * USO
 *   node --import tsx scripts/testar-acuracia.mts <extrato.pdf> <verdade.csv>
 *   node --import tsx scripts/testar-acuracia.mts <extrato.pdf> <verdade.csv> --refazer
 *
 * O CSV precisa cobrir o MESMO período do PDF, senão a comparação não quer
 * dizer nada. O resultado do modelo fica em cache para não pagar token duas
 * vezes analisando a mesma saída — `--refazer` ignora o cache.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs"
import { basename, join } from "node:path"
import { createHash } from "node:crypto"
import { config } from "dotenv"
import type { ExtratoParseado } from "../types/extrato.js"

config({ path: ".env.local" })
config({ path: ".env" })

const [caminhoPdf, caminhoCsv] = process.argv.slice(2).filter((a) => !a.startsWith("--"))
const refazer = process.argv.includes("--refazer")
// Recorte do ground truth, para quando o CSV cobre período maior que o PDF.
const arg = (nome: string) => process.argv.find((a) => a.startsWith(`--${nome}=`))?.split("=")[1]
const de = arg("de")
const ate = arg("ate")

if (!caminhoPdf || !caminhoCsv) {
  console.error("uso: node --import tsx scripts/testar-acuracia.mts <extrato.pdf> <verdade.csv> [--de=yyyy-mm-dd] [--ate=yyyy-mm-dd] [--refazer]")
  process.exit(1)
}

// ---------------------------------------------------------------- utilidades

/** Valor em CENTAVOS inteiros. Somar float em reais faz a tolerância de R$0,05 julgar arredondamento, não extração. */
function paraCentavos(bruto: string): number {
  const t = bruto.trim()
  // O CSV do PicPay usa MINUS SIGN (U+2212), não hífen ASCII. Aceita os dois.
  const negativo = /^[−–-]/.test(t)
  const digitos = t.replace(/[^\d,.]/g, "")
  // pt-BR: ponto é milhar, vírgula é decimal
  const normalizado = digitos.replace(/\./g, "").replace(",", ".")
  const n = Math.round(parseFloat(normalizado) * 100)
  if (!Number.isFinite(n)) throw new Error(`valor ilegível: ${JSON.stringify(bruto)}`)
  return negativo ? -n : n
}

const brl = (centavos: number) =>
  (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

/** CSV com campos entre aspas que contêm vírgula. */
function linhasCsv(texto: string): string[][] {
  const linhas: string[][] = []
  let campo = ""
  let atual: string[] = []
  let dentroDeAspas = false

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (dentroDeAspas) {
      if (c === '"') {
        if (texto[i + 1] === '"') { campo += '"'; i++ }
        else dentroDeAspas = false
      } else campo += c
    } else if (c === '"') dentroDeAspas = true
    else if (c === ",") { atual.push(campo); campo = "" }
    else if (c === "\n") { atual.push(campo); linhas.push(atual); atual = []; campo = "" }
    else if (c !== "\r") campo += c
  }
  if (campo || atual.length) { atual.push(campo); linhas.push(atual) }
  return linhas.filter((l) => l.some((c) => c.trim()))
}

// ------------------------------------------------------------- ground truth

interface Lancamento { data: string; centavos: number; descricao: string }

const csvBruto = readFileSync(caminhoCsv, "utf8")
const [cabecalho, ...corpo] = linhasCsv(csvBruto)
const iData = cabecalho.findIndex((c) => c.trim() === "data")
const iDestino = cabecalho.findIndex((c) => c.includes("origem"))
const iValor = cabecalho.findIndex((c) => c.trim() === "valor")
if (iData < 0 || iValor < 0) {
  console.error(`CSV sem coluna 'data' ou 'valor'. Cabeçalho lido: ${cabecalho.join(" | ")}`)
  process.exit(1)
}

const verdade: Lancamento[] = corpo
  .map((l) => ({
    data: l[iData].trim(),
    centavos: paraCentavos(l[iValor]),
    descricao: (l[iDestino] ?? "").trim(),
  }))
  .filter((l) => (!de || l.data >= de) && (!ate || l.data <= ate))

// ------------------------------------------------------- leitura do PDF

async function textoDoPdf(caminho: string): Promise<{ texto: string; paginas: number }> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
  const doc = await pdfjs.getDocument({ data: new Uint8Array(readFileSync(caminho)) }).promise
  const partes: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const p = await doc.getPage(i)
    const c = await p.getTextContent()
    partes.push(c.items.map((it: unknown) => ("str" in (it as object) ? (it as { str: string }).str : "")).join(" "))
  }
  return { texto: partes.join("\n").replace(/[ \t]+/g, " ").trim(), paginas: doc.numPages }
}

// ------------------------------------------------------------------ execução

const { texto, paginas } = await textoDoPdf(caminhoPdf)

const cacheDir = join("node_modules", ".cache", "acuracia")
mkdirSync(cacheDir, { recursive: true })
const chave = createHash("sha256").update(texto).digest("hex").slice(0, 16)
const arquivoCache = join(cacheDir, `${basename(caminhoPdf)}.${chave}.json`)

let extrato: ExtratoParseado
let tokens = { entrada: 0, saida: 0 }
let modelo = "(cache)"

if (!refazer && existsSync(arquivoCache)) {
  const c = JSON.parse(readFileSync(arquivoCache, "utf8"))
  extrato = c.extrato; tokens = c.tokens; modelo = `${c.modelo} (cache)`
  console.log(`↻ usando resultado em cache — --refazer para chamar o modelo de novo\n`)
} else {
  const { parsearExtrato } = await import("../lib/extrato/parsear.js")
  const t0 = Date.now()
  const r = await parsearExtrato({ modo: "texto", texto, paginas })
  console.log(`modelo respondeu em ${((Date.now() - t0) / 1000).toFixed(1)}s\n`)
  extrato = r.extrato
  tokens = { entrada: r.tokensEntrada, saida: r.tokensSaida }
  modelo = r.modelo
  writeFileSync(arquivoCache, JSON.stringify({ extrato, tokens, modelo }, null, 2))
}

const extraido: Lancamento[] = extrato.transacoes.map((t) => ({
  data: t.data,
  centavos: Math.round(t.valor * 100),
  descricao: t.descricaoLimpa,
}))

// ------------------------------------------------------------- comparação

const somar = (xs: Lancamento[], filtro: (c: number) => boolean) =>
  xs.filter((x) => filtro(x.centavos)).reduce((s, x) => s + x.centavos, 0)

/** Multiset por (data, valor): duplicatas legítimas existem aos montes ("Troco guardado"). */
function multiset(xs: Lancamento[]) {
  const m = new Map<string, number>()
  for (const x of xs) {
    const k = `${x.data}|${x.centavos}`
    m.set(k, (m.get(k) ?? 0) + 1)
  }
  return m
}

const mVerdade = multiset(verdade)
const mExtraido = multiset(extraido)

let casados = 0
const faltando: string[] = []
const sobrando: string[] = []

for (const [k, qtd] of mVerdade) {
  const tem = mExtraido.get(k) ?? 0
  casados += Math.min(qtd, tem)
  if (tem < qtd) faltando.push(`${k} ×${qtd - tem}`)
}
for (const [k, qtd] of mExtraido) {
  const tem = mVerdade.get(k) ?? 0
  if (qtd > tem) sobrando.push(`${k} ×${qtd - tem}`)
}

const linha = (r: string, a: string, b: string) => `  ${r.padEnd(26)} ${a.padStart(16)}  ${b.padStart(16)}`

console.log(`ARQUIVO   ${basename(caminhoPdf)} — ${paginas} páginas, ${texto.length.toLocaleString("pt-BR")} caracteres`)
console.log(`VERDADE   ${basename(caminhoCsv)} — ${verdade.length} lançamentos`)
console.log(`MODELO    ${modelo}  ·  tokens ${tokens.entrada}/${tokens.saida}\n`)

console.log(linha("", "VERDADE (CSV)", "MODELO (PDF)"))
console.log(linha("lançamentos", String(verdade.length), String(extraido.length)))
console.log(linha("entradas", brl(somar(verdade, (c) => c > 0)), brl(somar(extraido, (c) => c > 0))))
console.log(linha("saídas", brl(somar(verdade, (c) => c < 0)), brl(somar(extraido, (c) => c < 0))))
console.log(linha("líquido", brl(somar(verdade, () => true)), brl(somar(extraido, () => true))))

const pct = verdade.length ? ((casados / verdade.length) * 100) : 0
console.log(`\nCASAMENTO EXATO por (data, valor)`)
console.log(`  ${casados} de ${verdade.length}  =  ${pct.toFixed(2)}%`)
console.log(`  não encontrados no modelo : ${faltando.length ? faltando.length : "nenhum"}`)
console.log(`  inventados pelo modelo    : ${sobrando.length ? sobrando.length : "nenhum"}`)

if (faltando.length) {
  console.log(`\n  FALTANDO (existe no CSV, modelo não trouxe) — até 25:`)
  for (const f of faltando.slice(0, 25)) {
    const [d, c] = f.split("|")
    const orig = verdade.find((v) => v.data === d && String(v.centavos) === c.split(" ")[0])
    console.log(`    ${d}  ${brl(Number(c.split(" ")[0])).padStart(14)}  ${orig?.descricao.slice(0, 45) ?? ""}`)
  }
}
if (sobrando.length) {
  console.log(`\n  SOBRANDO (modelo trouxe, não existe no CSV) — até 25:`)
  for (const s of sobrando.slice(0, 25)) {
    const [d, c] = s.split("|")
    const m = extraido.find((e) => e.data === d && String(e.centavos) === c.split(" ")[0])
    console.log(`    ${d}  ${brl(Number(c.split(" ")[0])).padStart(14)}  ${m?.descricao.slice(0, 45) ?? ""}`)
  }
}

// ------------------------------------------------------------------- PII

console.log(`\nREGRAS DE PII (o prompt proíbe CPF, CNPJ, chave Pix e nome de pessoa)`)
const descricoes = extrato.transacoes.map((t) => t.descricaoLimpa)
const comCpf = descricoes.filter((d) => /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/.test(d))
const comCnpj = descricoes.filter((d) => /\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/.test(d))

// Nomes de pessoa física do CSV: linhas de Pix cujo destino não parece empresa.
const marcasDeEmpresa = /\b(LTDA|S\.?A\.?|S\/A|ME|EIRELI|MEI|COM(ERCIO)?|SERVICOS|TECNOLOGIA|BRASIL|DISTRIBUIDORA|PARTICIPACOES|ALIMENTOS|RESTAURANTE|CLUBE|BANCO|CAIXA|MALL|CENTER|CINEMARK|CARREFOUR|IFOOD|UBER|JBS|SEARA|SWIFT|NUTRICAR|GOOGLE|PIX|MARKETPLACE|COFRINHO|CONTA|SALARIO|ELETRONICO)\b/i
const nomesDePessoa = [...new Set(
  verdade.map((v) => v.descricao).filter((d) => d && !marcasDeEmpresa.test(d) && /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'.\s]{8,}$/.test(d) && d.trim().split(/\s+/).length >= 2)
)]
const vazados = nomesDePessoa.filter((n) =>
  descricoes.some((d) => d.toLowerCase().includes(n.toLowerCase().split(/\s+/).slice(0, 2).join(" ")))
)

console.log(`  CPF na descrição limpa    : ${comCpf.length ? `${comCpf.length} — ${comCpf.slice(0, 3).join(" / ")}` : "nenhum"}`)
console.log(`  CNPJ na descrição limpa   : ${comCnpj.length ? `${comCnpj.length} — ${comCnpj.slice(0, 3).join(" / ")}` : "nenhum"}`)
console.log(`  nomes de pessoa vazados   : ${vazados.length ? `${vazados.length} — ${vazados.slice(0, 5).join(" / ")}` : "nenhum"}`)
console.log(`  (nomes de pessoa no CSV, para referência: ${nomesDePessoa.length})`)

// --------------------------------------------------------------- veredito

const { validarExtrato } = await import("../lib/extrato/validar.js")
const v = validarExtrato(extrato)
console.log(`\nVALIDAÇÃO INTERNA (o gate que decide se a tela mostra número)`)
console.log(`  saldoInicial declarado: ${extrato.saldoInicial ?? "não veio"}   saldoFinal: ${extrato.saldoFinal ?? "não veio"}`)
console.log(
  v.ok
    ? `  passou: sim   forte: ${v.forte}${v.forte ? "" : "  ← fraca: sem saldo inicial, não confere aritmética"}`
    : `  passou: NÃO   motivo: ${v.motivo}`
)

const perfeito = casados === verdade.length && extraido.length === verdade.length
console.log(`\n${perfeito ? "✓ EXTRAÇÃO EXATA" : "✗ HÁ DIVERGÊNCIA"} — ${pct.toFixed(2)}% de casamento por (data, valor)`)
process.exit(perfeito ? 0 : 1)
