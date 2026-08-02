/**
 * Testa as cores das fatias da rosca.
 *
 * POR QUE ISTO EXISTE
 * A cor de cada categoria vem do banco, e lá elas colidem: "Transferências" e
 * "Outros" nasceram com o mesmo cinza. Numa lista ninguém nota. Na rosca, as
 * duas viravam uma cunha contínua de 65% do gráfico, sem jeito de saber onde
 * uma acabava e a outra começava.
 *
 * O defeito é silencioso por natureza: nada quebra, nada loga, o gráfico
 * desenha. Só olhando é que se vê, e ninguém olha toda vez. E volta sozinho no
 * dia em que alguém criar uma categoria nova com uma cor já usada.
 *
 * Sem banco de propósito: é a regra de pintura que está sendo testada.
 *
 *   node --import tsx scripts/testar-rosca.mts
 */
import { gastosPorCategoria, type TransacaoCalc } from "../lib/financas.js"

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

const CINZA = "#9AA0A3"

/** Uma despesa em julho/2026, na categoria dada. */
function gasto(nome: string | null, cor: string | null, valor: number): TransacaoCalc {
  return {
    tipo: "despesa",
    valor,
    data: new Date("2026-07-15T12:00:00Z"),
    categoria: nome ? { nome, cor } : null,
  } as TransacaoCalc
}

function fatias(ts: TransacaoCalc[]) {
  return gastosPorCategoria(ts, 7, 2026)
}

console.log("CORES")

// O caso real que motivou o conserto.
const colisao = fatias([
  gasto("Transferências", CINZA, 460),
  gasto("Outros", CINZA, 190),
  gasto("Alimentação", "#B8863C", 220),
])
checar("duas categorias com a mesma cor no banco saem diferentes",
  new Set(colisao.map((f) => f.cor)).size === colisao.length,
  colisao.map((f) => `${f.nome}=${f.cor}`).join(" "))

const outros = colisao.find((f) => f.nome === "Outros")
const transf = colisao.find((f) => f.nome === "Transferências")
checar("o neutro fica com Outros", outros?.cor === CINZA, outros?.cor)
checar("e some de quem não é Outros", transf?.cor !== CINZA, transf?.cor)

// A maior escolhe primeiro: quem é deslocado é a menor do par em conflito.
checar("a fatia maior escolhe cor primeiro",
  colisao[0].nome === "Transferências" && colisao[0].cor !== CINZA)

// Categoria sem cor no banco ainda recebe uma.
const semCor = fatias([gasto("Nova", null, 100), gasto("Outra", null, 50)])
checar("categoria sem cor recebe uma", semCor.every((f) => !!f.cor))
checar("e não a mesma", semCor[0].cor !== semCor[1].cor, semCor.map((f) => f.cor).join(" "))

// Transação sem categoria cai em Outros, com o neutro.
const nula = fatias([gasto(null, null, 80)])
checar("sem categoria vira Outros", nula[0]?.nome === "Outros")
checar("com o neutro", nula[0]?.cor === CINZA)

// Muitas categorias: nenhuma pode ficar sem cor.
const muitas = fatias(
  Array.from({ length: 12 }, (_, i) => gasto(`Cat ${i}`, CINZA, 100 - i))
)
checar("12 categorias, todas pintadas", muitas.every((f) => !!f.cor), `${muitas.length} fatias`)
checar("nenhuma delas fica com o neutro de Outros",
  muitas.every((f) => f.cor !== CINZA))

console.log("\nORDEM E SOMA")
const ord = fatias([gasto("A", "#111111", 10), gasto("B", "#222222", 90)])
checar("maior primeiro", ord[0].nome === "B", ord.map((f) => f.nome).join(" "))
checar("percentuais somam 100", ord.reduce((s, f) => s + f.pct, 0) === 100)

// Poupança não é "para onde o dinheiro foi": ela não sai do patrimônio.
console.log("\nO QUE NÃO ENTRA")
const vazia = fatias([])
checar("mês sem despesa devolve lista vazia", vazia.length === 0)

console.log(`\n${falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`}`)
process.exit(falhas === 0 ? 0 : 1)
