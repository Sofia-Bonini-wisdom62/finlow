/**
 * Testa as fatias da rosca: quantas, quem some e de que cor.
 *
 * POR QUE ISTO EXISTE
 * As cores das categorias no banco colidem entre si — "Transferências" e
 * "Outros" nasceram com o mesmo cinza. Numa lista ninguém nota. Na rosca, as
 * duas viravam uma cunha contínua de 65% do gráfico, sem jeito de saber onde
 * uma acabava e a outra começava. O defeito não quebra nada: o gráfico
 * desenha, ninguém loga, e só aparece para quem olha.
 *
 * A cor agora vem da posição, não do banco, e o número de fatias tem teto. O
 * teto não é estética: numa rosca a última fatia encosta na primeira, então o
 * que precisa ser legível é o CÍRCULO, e o de cada tamanho. Medindo todas as
 * ordens das oito famílias sob protanopia e deuteranopia, nos dois modos, com
 * 6 fatias todo prefixo fecha acima do alvo; com 7 cai para a banda de
 * ressalva; com 8 nenhuma ordem fecha.
 *
 *   node --import tsx scripts/testar-rosca.mts
 */
import { readFileSync } from "node:fs"
import { gastosPorCategoria, corDaSerie, type TransacaoCalc } from "../lib/financas.js"

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

/** Uma despesa em julho/2026, na categoria dada. */
function gasto(nome: string | null, cor: string | null, valor: number): TransacaoCalc {
  return {
    tipo: "despesa",
    valor,
    data: new Date("2026-07-15T12:00:00Z"),
    categoria: nome ? { nome, cor } : null,
  } as TransacaoCalc
}

const fatias = (ts: TransacaoCalc[]) => gastosPorCategoria(ts, 7, 2026)

// ------------------------------------------------------------------ cores ---
console.log("COR VEM DA POSIÇÃO, NÃO DO BANCO")

const CINZA = "#9AA0A3"
const colisao = fatias([
  gasto("Transferências", CINZA, 460),
  gasto("Outros", CINZA, 190),
  gasto("Alimentação", "#B8863C", 220),
])
checar("duas categorias com a mesma cor no banco saem diferentes",
  new Set(colisao.map((f) => f.cor)).size === colisao.length,
  colisao.map((f) => `${f.nome}=${f.cor}`).join(" "))
checar("nenhuma fatia carrega hex do banco",
  colisao.every((f) => f.cor.startsWith("var(--serie-")),
  colisao.map((f) => f.cor).join(" "))
checar("a maior recebe o primeiro slot", colisao[0].cor === corDaSerie(0), colisao[0].cor)
checar("e o cinza do banco não passa", colisao.every((f) => f.cor !== CINZA))

// ------------------------------------------------------------------- teto ---
console.log("\nTETO DE SEIS")

const muitas = fatias([
  gasto("Moradia", null, 1000),
  gasto("Alimentação", null, 900),
  gasto("Transporte", null, 800),
  gasto("Delivery", null, 700),
  gasto("Compras", null, 600),
  gasto("Saúde", null, 50),
  gasto("Lazer", null, 40),
  gasto("Educação", null, 30),
  gasto("Assinaturas", null, 20),
])
checar("9 categorias viram 6 fatias", muitas.length === 6, `${muitas.length}`)
checar("as 5 maiores continuam nomeadas",
  muitas.slice(0, 5).map((f) => f.nome).join(",") === "Moradia,Alimentação,Transporte,Delivery,Compras",
  muitas.map((f) => f.nome).join(","))

const outros = muitas.find((f) => f.nome === "Outros")
checar("a cauda vira Outros", !!outros)
checar("Outros soma a cauda inteira", outros?.total === 50 + 40 + 30 + 20, `${outros?.total}`)
// O dinheiro não pode sumir junto com as fatias.
const somaFatias = muitas.reduce((s, f) => s + f.total, 0)
checar("nada some do total", somaFatias === 4140, `${somaFatias}`)
checar("percentuais ainda somam ~100",
  Math.abs(muitas.reduce((s, f) => s + f.pct, 0) - 100) <= 1,
  `${muitas.reduce((s, f) => s + f.pct, 0)}%`)

// "Outros" já existindo entre as visíveis não pode virar duas fatias iguais.
const outrosJaExistia = fatias([
  gasto("Moradia", null, 1000),
  gasto("Outros", null, 900),
  gasto("Alimentação", null, 800),
  gasto("Transporte", null, 700),
  gasto("Delivery", null, 600),
  gasto("Compras", null, 500),
  gasto("Saúde", null, 400),
])
checar("não cria duas fatias chamadas Outros",
  outrosJaExistia.filter((f) => f.nome === "Outros").length === 1,
  outrosJaExistia.map((f) => f.nome).join(","))
checar("Outros reordena depois de absorver",
  outrosJaExistia[0].nome === "Outros" && outrosJaExistia[0].total === 1300,
  `${outrosJaExistia[0].nome}=${outrosJaExistia[0].total}`)

// Seis exatas não folda nada.
const seis = fatias(Array.from({ length: 6 }, (_, i) => gasto(`C${i}`, null, 100 - i)))
checar("exatamente 6 categorias não vira Outros",
  seis.length === 6 && !seis.some((f) => f.nome === "Outros"),
  seis.map((f) => f.nome).join(","))

// Slots distintos em qualquer tamanho.
for (const n of [2, 3, 4, 5, 6]) {
  const f = fatias(Array.from({ length: n }, (_, i) => gasto(`C${i}`, null, 100 - i)))
  checar(`${n} fatias, ${n} cores distintas`, new Set(f.map((x) => x.cor)).size === n)
}

// -------------------------------------------------------------------- css ---
console.log("\nAS SEIS CORES EXISTEM NOS DOIS MODOS")

const css = readFileSync("app/globals.css", "utf8")
const bloco = (marcador: string) => {
  const i = css.indexOf(marcador)
  return i < 0 ? "" : css.slice(i, css.indexOf("\n}", i))
}
const claro = bloco("\n:root {")
const escuro = bloco("\n.dark {")

const hexDe = (texto: string, n: number) => {
  const m = new RegExp(`--serie-${n}:\\s*(#[0-9a-fA-F]{6})`).exec(texto)
  return m?.[1]?.toLowerCase() ?? null
}

const noClaro = [1, 2, 3, 4, 5, 6].map((n) => hexDe(claro, n))
const noEscuro = [1, 2, 3, 4, 5, 6].map((n) => hexDe(escuro, n))

checar("as 6 estão no modo claro", noClaro.every(Boolean), noClaro.join(" "))
checar("as 6 estão no modo escuro", noEscuro.every(Boolean), noEscuro.join(" "))
checar("nenhuma repetida no claro", new Set(noClaro).size === 6)
checar("nenhuma repetida no escuro", new Set(noEscuro).size === 6)

// O escuro tem passos PRÓPRIOS. Se fosse cópia do claro, seria filtro
// disfarçado — e filtro em bloco desfaz a separação que foi medida.
const iguais = noClaro.filter((c, i) => c === noEscuro[i]).length
checar("o escuro não é cópia do claro", iguais <= 1, `${iguais} de 6 iguais`)

// Nenhuma pode ser cinza: cinza não faz trabalho de identidade, é o que o
// validador reprova por "reads gray".
const cinzenta = (hex: string | null) => {
  if (!hex) return true
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  return Math.max(r, g, b) - Math.min(r, g, b) < 40
}
checar("nenhuma cor de série é cinza no claro", !noClaro.some(cinzenta))
checar("nenhuma cor de série é cinza no escuro", !noEscuro.some(cinzenta))

console.log(`\n${falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`}`)
process.exit(falhas === 0 ? 0 : 1)
