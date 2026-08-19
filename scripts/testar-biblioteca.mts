/**
 * Bateria da Biblioteca: o estado de uma aula, e a contagem do cabeçalho.
 *
 *   node --import tsx scripts/testar-biblioteca.mts
 *
 * Nasce de um bug relatado pela fundadora em 18/08/2026: usuário comum fazia
 * uma lição escolar, o card mostrava a aula concluída, e o "N concluídas" do
 * cabeçalho não se mexia. A causa era a MESMA pergunta respondida em dois
 * lugares, com respostas diferentes: o card olhava o público antes do
 * corredor, e o contador olhava só o corredor, que não conhece aula de outro
 * público.
 *
 * O cenário do bug está no fim do arquivo, e é o teste que realmente importa:
 * ele conta como o cabeçalho conta, e falha se alguém voltar a contar só as
 * aulas da trilha da pessoa enquanto o denominador ao lado segue contando
 * todas.
 */
import { readFileSync } from "node:fs"
import { estadoDaAula, type NoMinimo } from "../lib/biblioteca.js"

let falhas = 0
let total = 0

function conferir(nome: string, obtido: unknown, esperado: unknown) {
  total++
  const ok = JSON.stringify(obtido) === JSON.stringify(esperado)
  if (!ok) {
    falhas++
    console.log(
      `  ✗ ${nome}\n      esperado: ${JSON.stringify(esperado)}\n      obtido:   ${JSON.stringify(obtido)}`
    )
  } else {
    console.log(`  ✓ ${nome}`)
  }
}

function corredorCom(pares: [string, NoMinimo["estado"]][]) {
  return { modulos: new Map<string, NoMinimo>(pares.map(([id, estado]) => [id, { estado }])) }
}

// ------------------------------------------------ aula da trilha da pessoa ---
console.log("\nestadoDaAula — aula da trilha da pessoa (quem manda é o corredor)")

const adulta = { id: "m1", publico: "adulto" }
const corredor = corredorCom([
  ["m1", "concluido"],
  ["m2", "liberado"],
  ["m3", "trancado"],
])
const vazio = new Set<string>()

conferir("corredor diz concluido", estadoDaAula(adulta, "adulto", corredor, vazio), "concluido")
conferir(
  "corredor diz liberado",
  estadoDaAula({ id: "m2", publico: "adulto" }, "adulto", corredor, vazio),
  "liberado"
)
conferir(
  "corredor diz trancado",
  estadoDaAula({ id: "m3", publico: "adulto" }, "adulto", corredor, vazio),
  "trancado"
)
// Módulo que o corredor não conhece continua trancado para a trilha da
// pessoa: é a aula que ainda não entrou em leva nenhuma.
conferir(
  "ausente do corredor cai em trancado",
  estadoDaAula({ id: "m9", publico: "adulto" }, "adulto", corredor, vazio),
  "trancado"
)

// -------------------------------------------------- aula de OUTRO público ---
console.log("\nestadoDaAula — aula de outro público (quem manda é o ProgressoModulo)")

const escolar = { id: "e1", publico: "ef35" }

conferir(
  "escolar concluída pelo adulto conta como concluída",
  estadoDaAula(escolar, "adulto", corredor, new Set(["e1"])),
  "concluido"
)
// Nunca "trancado": a biblioteca mostraria uma parede de cadeados que nada
// destrava, que é exatamente o que a regra de público existe para evitar.
conferir(
  "escolar não feita fica liberada, nunca trancada",
  estadoDaAula(escolar, "adulto", corredor, vazio),
  "liberado"
)
conferir(
  "o corredor não decide aula de outro público",
  estadoDaAula({ id: "m3", publico: "ef35" }, "adulto", corredorCom([["m3", "trancado"]]), vazio),
  "liberado"
)
// A régua inverte para o aluno de escola: a aula ADULTA é a de fora.
conferir(
  "para o aluno de EM, aula adulta feita conta como concluída",
  estadoDaAula(adulta, "em", corredor, new Set(["m1"])),
  "concluido"
)
conferir(
  "para o aluno de EM, aula adulta não feita fica liberada",
  estadoDaAula({ id: "m7", publico: "adulto" }, "em", corredor, vazio),
  "liberado"
)

// ------------------------------------------------------- o cenário do bug ---
console.log("\no bug de 18/08/2026 — o cabeçalho conta o que o card mostra")

// Uma biblioteca de adulto: 2 aulas da trilha dele (uma concluída) e 2
// escolares, das quais ele terminou UMA explorando.
const biblioteca = [
  { id: "m1", publico: "adulto" }, // concluída no corredor
  { id: "m2", publico: "adulto" }, // liberada
  { id: "e1", publico: "ef35" }, // concluída explorando
  { id: "e2", publico: "em" }, // nunca aberta
]
const feitosForaDoCorredor = new Set(["e1"])

const estados = biblioteca.map((m) => estadoDaAula(m, "adulto", corredor, feitosForaDoCorredor))
conferir("os quatro estados", estados, ["concluido", "liberado", "concluido", "liberado"])

// Como o cabeçalho conta: sobre TODAS as aulas, que é o mesmo conjunto do
// "150 aulas" ao lado. Antes do conserto isto dava 1, porque a contagem
// filtrava só as aulas da trilha da pessoa.
const concluidas = estados.filter((e) => e === "concluido").length
conferir("o cabeçalho conta 2, não 1", concluidas, 2)

// E o denominador tem de ser o mesmo conjunto do numerador: contar "4 aulas"
// e "1 concluída" foi o defeito, não um detalhe de apresentação.
conferir("numerador e denominador saem da mesma lista", biblioteca.length, estados.length)

// --------------------------------------------- a regra tem UM endereço só ---
console.log("\na página não pode ter uma segunda cópia da regra")

const fonte = readFileSync("app/trilha/biblioteca/page.tsx", "utf8")

conferir("a página importa a regra da lib", fonte.includes('from "@/lib/biblioteca"'), true)
// Duas chamadas: o card e o contador. Se alguém reescrever uma delas à mão,
// este número cai e a bateria acusa antes de a contagem divergir de novo.
conferir(
  "a página chama estadoDaAula duas vezes (card e contador)",
  (fonte.match(/estadoDaAula\(/g) ?? []).length,
  2
)
// A contagem do cabeçalho tem de varrer `modulos`, a lista completa. Voltar
// para `daPessoa` é exatamente o bug relatado.
//
// O regex atravessa quebras de linha de propósito: a primeira versão usava
// `[^)]*` e não pegou o retorno do bug, porque o `)` de `get(m.id)` fechava a
// busca antes de chegar em `estado`. Um guard que não pega o caso que motivou
// o guard é pior do que nenhum, porque dá a sensação de estar coberto.
conferir(
  "o contador não voltou a filtrar só a trilha da pessoa",
  /daPessoa\s*\.filter\([\s\S]{0,240}?estado/.test(fonte),
  false
)
conferir(
  "o contador varre a lista completa (modulos)",
  /const concluidos = modulos\s*\.filter\(/.test(fonte),
  true
)

console.log(`\n${falhas === 0 ? "✓" : "✗"} ${total - falhas}/${total} conferências`)
process.exit(falhas === 0 ? 0 : 1)
