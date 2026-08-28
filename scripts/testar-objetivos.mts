/**
 * Testa o valor que a tela de Objetivos aceita guardar.
 *
 * POR QUE ISTO EXISTE
 * Até 28/08/2026 o "+ Guardar" somava um passo fixo de R$ 50. Guardar R$ 30 era
 * impossível e R$ 400 eram oito toques. A fundadora pediu campo livre, e campo
 * livre traz junto a parte que não existia antes: valor RECUSADO. Passo fixo
 * nunca é inválido; texto digitado é inválido o tempo todo.
 *
 * Daí as duas coisas que este arquivo guarda:
 *
 * 1. A LEITURA DO NÚMERO. A tela fazia `Number(texto.replace(",", "."))`, que
 *    transforma "1.000,00" em "1.000.00" e devolve NaN — quem digitasse a meta
 *    com ponto de milhar levava "Meta inválida" tendo escrito certo. É o mesmo
 *    defeito que `paraNumero` foi escrita para resolver no Painel, e ele estava
 *    vivo nesta tela. Com valores de adulto (mil, dois mil) o ponto de milhar é
 *    o jeito natural de escrever.
 *
 * 2. UMA REGRA SÓ PARA AS DUAS PONTAS. A tela recusa antes de mandar e a rota
 *    recusa porque a tela não é autoridade. Se as duas tiverem cópias da regra,
 *    elas divergem — e a divergência aparece como sujeira na cara de quem usa:
 *    o campo aceita, o servidor devolve 400, a pessoa lê "Valor inválido" sem
 *    ter feito nada de errado.
 *
 *   node --import tsx scripts/testar-objetivos.mts
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { lerValor, VALOR_MAX } from "../lib/objetivo.js"

const raiz = join(import.meta.dirname, "..")
const ler = (p: string) => readFileSync(join(raiz, p), "utf8")

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

function aceita(bruto: string | number, esperado: number) {
  const r = lerValor(bruto)
  checar(
    `"${bruto}" vira ${esperado}`,
    r.ok && r.valor === esperado,
    r.ok ? `${r.valor}` : r.motivo
  )
}

function recusa(bruto: string | number, nota: string) {
  const r = lerValor(bruto)
  checar(`${nota} é recusado`, !r.ok, r.ok ? `aceitou ${r.valor}` : r.motivo)
  if (!r.ok) {
    // Recusa sem motivo legível é a mesma coisa que travar sem dizer por quê.
    checar(`  …com motivo em português`, r.motivo.length > 10 && /[a-zà-ú]/i.test(r.motivo))
  }
}

// ------------------------------------------------- o jeito de escrever real ---
console.log("O JEITO BRASILEIRO DE ESCREVER DINHEIRO")

aceita("50", 50)
aceita("30", 30)              // o valor que o passo fixo tornava impossível
aceita("1000", 1000)
aceita("1000,50", 1000.5)
aceita("0,10", 0.1)
aceita(250, 250)              // número puro, como a rota recebe do JSON

// O caso que quebrava: ponto de milhar. É o modo natural de escrever mil reais.
aceita("1.000,00", 1000)
aceita("1.234,56", 1234.56)
aceita("12.500", 12500)

// A prova de que não é teste decorativo: a conta ANTIGA erra estes mesmos casos.
const contaAntiga = (t: string) => Number(t.replace(",", "."))
checar(
  "a conta antiga (Number + replace) reprovaria em '1.000,00'",
  Number.isNaN(contaAntiga("1.000,00")),
  `${contaAntiga("1.000,00")}`
)

// Centavos: sem arredondar, guardar três vezes deixa o saldo com quinze casas
// e a barra de progresso passa a mentir na terceira.
aceita("33,333", 33.33)

// ------------------------------------------------------------- as recusas ---
console.log("\nO QUE A TELA RECUSA ANTES DE MANDAR")

recusa("", "campo vazio")
recusa("   ", "só espaço")
recusa("0", "zero")
recusa("0,00", "zero escrito com centavos")
recusa("-50", "valor negativo")
recusa("abc", "texto sem número")
recusa(VALOR_MAX + 1, "acima do teto")
recusa(NaN, "NaN")
recusa(Infinity, "Infinity")

aceita(VALOR_MAX, VALOR_MAX) // o teto em si passa: recusa é ACIMA dele

// ===========================================================================
// O código das duas pontas
// ===========================================================================
console.log("\nA TELA E A ROTA USAM A MESMA REGRA")

const tela = ler("app/(app)/objetivos/page.tsx")
const rota = ler("app/api/objetivos/route.ts")

checar("a tela lê o valor por `lerValor`", /lerValor\(/.test(tela))
checar("a rota lê o valor por `lerValor`", /lerValor\(/.test(rota))
checar(
  "a rota não guarda uma cópia do teto",
  !/const VALOR_MAX/.test(rota),
  ""
)
checar(
  "nenhuma das duas voltou a fazer `Number(...replace(\",\", \".\"))`",
  !/Number\([^)]*replace\(",", "\."\)/.test(tela) && !/Number\([^)]*replace\(",", "\."\)/.test(rota)
)

// O pedido da fundadora, amarrado à mecânica: o que vai no corpo do PATCH tem
// de sair do CAMPO, não de uma constante. Um `guardar: 50` literal é o passo
// fixo de volta, com outro nome.
console.log("\nO VALOR SAI DO CAMPO, NÃO DE UMA CONSTANTE")

checar("o campo existe e é numérico no celular", /inputMode="decimal"/.test(tela))
checar("o que a tela digita vira estado", /setValor\(/.test(tela))
const corpoPatch = tela.match(/JSON\.stringify\(\{ id, guardar: ([^}]+)\}/)
checar(
  "o PATCH manda o valor lido do campo",
  !!corpoPatch && /lida\.valor/.test(corpoPatch[1]!),
  corpoPatch?.[1]?.trim() ?? "não achei o corpo do PATCH"
)
checar(
  "nenhum número literal é enviado como depósito",
  !/guardar:\s*\d/.test(tela),
  ""
)

// As sugestões são atalho de digitação, não passo disfarçado: elas PREENCHEM o
// campo. E `type="button"` não é detalhe — sem ele, o chip dentro do <form>
// envia o formulário, e tocar em "R$ 100" gravaria o que estivesse escrito
// antes (ou nada) em vez de preencher.
console.log("\nAS SUGESTÕES PREENCHEM O CAMPO, NÃO GRAVAM")

const chip = tela.match(/SUGESTOES\.map\([\s\S]{0,600}?\)\)/)
checar("as sugestões existem", !!chip)
if (chip) {
  checar("a sugestão só escreve no campo", /setValor\(String\(s\)\)/.test(chip[0]))
  checar("a sugestão não envia o formulário", /type="button"/.test(chip[0]))
  checar("e não chama a rota direto", !/fetch\(/.test(chip[0]))
}

// O rótulo do botão fechado não pode voltar a prometer um valor: "+ Guardar
// R$ 50" com campo livre atrás é o botão mentindo sobre o que o toque faz.
checar(
  "o botão fechado não promete um valor",
  !/\+ Guardar \{brl\(/.test(tela),
  ""
)

// Dinheiro formatado por `brl`, nunca "R$" à mão antes de um valor: um
// `R$ ${n}` imprime "R$ 1480.5" para quem espera "R$ 1.480,50".
const rsAMao = [...tela.matchAll(/R\$\s*\{/g)]
checar("nenhum 'R$' escrito à mão antes de um valor", rsAMao.length === 0, `${rsAMao.length}`)

// A regra R8 não pode ter caído junto: objetivo é dado financeiro real, e
// escrita continua atrás do consentimento do Painel.
checar("a rota continua exigindo o consentimento do Painel", /checarConsentimento/.test(rota))
checar("e a tela continua sabendo explicar o bloqueio", /PAINEL_INATIVO/.test(tela))

console.log(`\n${falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`}`)
process.exit(falhas === 0 ? 0 : 1)
