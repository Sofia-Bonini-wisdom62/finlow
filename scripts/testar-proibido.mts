/**
 * Testa a trava de conteúdo impróprio.
 *
 * METADE DO TESTE É O QUE NÃO PODE BARRAR
 * Filtro léxico erra para os dois lados, e o falso positivo aqui é o erro
 * grave: "Pinto" é sobrenome (inclusive da fundadora), "transação" contém
 * "transa" e "disputa" contém "puta". Barrar palavra inocente quebraria
 * lançamento legítimo e apelido legítimo — por isso cada regra de bloqueio
 * tem o seu par de contraexemplo aqui.
 *
 *   node --import tsx scripts/testar-proibido.mts
 */
import { contemConteudoProibido } from "../lib/conteudo-proibido.js"
import { apelidoValido } from "../lib/pontos.js"
import { memoriasValidas, sugestoesValidas } from "../lib/ia.js"

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

// -------------------------------------------------------------- barra ---
console.log("O QUE BARRA")

const proibidos = [
  "caralho, que fatura alta",
  "gastei uma porra de dinheiro",
  "que merda de mês",
  "vou à puta que pariu",
  "conteúdo sexual explícito",
  "mandei nudes",
  "assinei site pornô",
  "vai se foder",
  "fdp me cobrou em dobro",
  "pqp que juros",
  // disfarces
  "c4ralho de taxa",
  "p0rra",
  "caraaaaalho",
  "porrrrra",
  "PORRA em caixa alta",
  "pôrra com acento",
]
for (const t of proibidos) {
  checar(`barra: "${t.slice(0, 34)}"`, contemConteudoProibido(t))
}

// --------------------------------------------------------- NÃO barra ---
console.log("\nO QUE NÃO PODE BARRAR")

const inocentes = [
  "Sofia Pinto",                       // sobrenome — inclusive da fundadora
  "transação no cartão",               // contém "transa"
  "disputa de cobrança",               // contém "puta"
  "computador novo",                   // contém "puta"? não — mas testa substring
  "pintor da reforma",                 // contém "pinto"
  "não rola parcelar agora",           // "rola" ficou fora de propósito
  "paguei meio pau nisso",             // "pau" ficou fora de propósito
  "mercado, uber e farmácia",
  "anuidade do cartão",                // começa com "anu"
  "seguro do carro",
  "curso de culinária",                // "cu" dentro de palavra
  "CUrso em maiúscula",
  "picanha no açougue",                // "pica" dentro de palavra
  "gasto com sexta-feira",             // "sex" dentro de palavra
  "Uber 40 e mercado 130",             // números não viram letras fora de palavra
]
for (const t of inocentes) {
  checar(`passa: "${t.slice(0, 34)}"`, !contemConteudoProibido(t))
}

// ------------------------------------------------- integrado nos pontos ---
console.log("\nONDE A TRAVA ESTÁ LIGADA")

checar("apelido chulo é recusado", apelidoValido("puta braba").ok === false)
checar("apelido inocente passa", apelidoValido("Sofia Pinto").ok === true)

const memorias = memoriasValidas([
  { tipo: "situacao", conteudo: "É autônoma e a renda varia mês a mês" },
  { tipo: "situacao", conteudo: "Vive falando porra em casa" },
])
checar("memória com termo proibido não passa", memorias.length === 1, `${memorias.length} de 2`)

const sugestoes = sugestoesValidas(["Quero juntar pra uma meta", "que merda de mês"])
checar("sugestão com termo proibido não passa", sugestoes.length === 1, `${sugestoes.length} de 2`)

console.log(`\n${falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`}`)
process.exit(falhas === 0 ? 0 : 1)
