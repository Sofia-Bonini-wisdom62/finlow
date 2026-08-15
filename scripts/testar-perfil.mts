/**
 * Testa o bloco de dinheiro do Perfil: o mês de que a tela fala e os números
 * que ela mostra.
 *
 * POR QUE ISTO EXISTE
 * O Perfil agora diz três coisas sobre o mesmo mês: "saiu R$ X", "entrou R$ Y"
 * e uma rosca com as saídas por categoria. Se cada uma escolhesse a própria
 * competência, a tela mostraria "suas saídas em julho" ao lado de um "saiu" que
 * somou agosto — e nada quebraria: compila, renderiza, ninguém loga. É o tipo
 * de defeito que só aparece para quem confere na mão, que é exatamente quem não
 * volta depois de conferir.
 *
 * O outro perigo é de vocabulário. O saldo daqui é o ACUMULADO do que a pessoa
 * registrou; não existe integração bancária. Prometer "saldo da conta" seria a
 * mesma falha da landing que prometia conexão automática — e por isso a tela é
 * conferida também no texto.
 *
 *   node --import tsx scripts/testar-perfil.mts
 */
import { readFileSync } from "node:fs"
import {
  indicadores, gastosPorCategoria, mesDeReferencia, type TransacaoCalc,
} from "../lib/financas.js"

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

/** Um lançamento no dia 15 do mês pedido — dia do meio, longe da virada. */
function lanc(
  tipo: "receita" | "despesa",
  valor: number,
  ano: number,
  mes: number,
  categoria: string | null = null,
  dia = 15
): TransacaoCalc {
  return {
    tipo,
    valor,
    data: new Date(ano, mes - 1, dia, 12, 0, 0),
    categoria: categoria ? { nome: categoria, cor: null } : null,
  } as TransacaoCalc
}

// ------------------------------------------------------- o mês de que fala ---
console.log("O MÊS DE QUE A TELA FALA")

const historico = [
  lanc("receita", 4000, 2026, 5, "Salário"),
  lanc("despesa", 1200, 2026, 5, "Moradia"),
  lanc("receita", 4000, 2026, 6, "Salário"),
  lanc("despesa", 900, 2026, 6, "Moradia"),
  lanc("receita", 4200, 2026, 7, "Salário"),
  lanc("despesa", 1100, 2026, 7, "Moradia"),
  lanc("despesa", 380, 2026, 7, "Alimentação"),
]

const hojeAgosto = new Date(2026, 7, 3, 12, 0, 0) // 3 de agosto: mês corrente vazio
const ref = mesDeReferencia(historico, hojeAgosto)
checar("no dia 3 do mês seguinte, ainda fala do último mês COM movimento",
  ref.mes === 7 && ref.ano === 2026, `${ref.mes}/${ref.ano}`)

const vazio = mesDeReferencia([], hojeAgosto)
checar("sem lançamento nenhum, cai no mês corrente",
  vazio.mes === 8 && vazio.ano === 2026, `${vazio.mes}/${vazio.ano}`)

const viraAno = mesDeReferencia(
  [lanc("despesa", 10, 2025, 12), lanc("despesa", 10, 2026, 1)],
  hojeAgosto
)
checar("a virada de ano não confunde dezembro com janeiro",
  viraAno.mes === 1 && viraAno.ano === 2026, `${viraAno.mes}/${viraAno.ano}`)

const soUmMes = mesDeReferencia([lanc("receita", 100, 2024, 2)], hojeAgosto)
checar("fevereiro de 2024 volta como fevereiro de 2024",
  soUmMes.mes === 2 && soUmMes.ano === 2024, `${soUmMes.mes}/${soUmMes.ano}`)

// Data inválida não pode virar o mês da tela: `new Date("banana")` é NaN, e
// NaN em comparação numérica não vence nada — mas somado ao ordinal viraria
// NaN, e o mês sairia como NaN/NaN no rótulo.
const comLixo = mesDeReferencia(
  [{ tipo: "despesa", valor: 10, data: "banana" } as TransacaoCalc, lanc("despesa", 10, 2026, 4)],
  hojeAgosto
)
checar("data ilegível é ignorada em vez de virar o mês da tela",
  comLixo.mes === 4 && comLixo.ano === 2026, `${comLixo.mes}/${comLixo.ano}`)

// ------------------------------------------------ rosca e números concordam ---
console.log("\nA ROSCA E OS NÚMEROS FALAM DO MESMO MÊS")

const ind = indicadores(historico, ref.mes, ref.ano)
const fatias = gastosPorCategoria(historico, ref.mes, ref.ano)

checar("entrou = as receitas do mês de referência", ind.receita === 4200, `${ind.receita}`)
checar("saiu = as despesas do mês de referência", ind.despesa === 1480, `${ind.despesa}`)
checar("saldo = tudo que entrou menos tudo que saiu, no histórico inteiro",
  ind.acumulado === 4000 - 1200 + 4000 - 900 + 4200 - 1480, `${ind.acumulado}`)

const somaFatias = fatias.reduce((s, f) => s + f.total, 0)
checar("a soma da rosca bate com o 'saiu' mostrado ao lado dela",
  somaFatias === ind.despesa, `rosca=${somaFatias} saiu=${ind.despesa}`)

// O caso que motivou o teste: um lançamento no mês seguinte ao da rosca não
// pode entrar em "saiu" — e como ele MUDA o mês de referência, quem escolhe o
// mês tem de ser a mesma função para os dois.
const comAgosto = [...historico, lanc("despesa", 999, 2026, 8, "Lazer")]
const refAgosto = mesDeReferencia(comAgosto, hojeAgosto)
const indAgosto = indicadores(comAgosto, refAgosto.mes, refAgosto.ano)
const fatiasAgosto = gastosPorCategoria(comAgosto, refAgosto.mes, refAgosto.ano)
checar("chegou agosto: a referência anda junto", refAgosto.mes === 8, `${refAgosto.mes}`)
checar("e o 'saiu' anda com ela", indAgosto.despesa === 999, `${indAgosto.despesa}`)
checar("e a rosca também",
  fatiasAgosto.reduce((s, f) => s + f.total, 0) === indAgosto.despesa)

// ------------------------------------------------------- guardar não é gastar ---
console.log("\nGUARDAR NÃO É GASTAR")

const comPoupanca = [
  lanc("receita", 3000, 2026, 7, "Salário"),
  lanc("despesa", 800, 2026, 7, "Moradia"),
  lanc("despesa", 500, 2026, 7, "Investimento"),
]
const refP = mesDeReferencia(comPoupanca, hojeAgosto)
const indP = indicadores(comPoupanca, refP.mes, refP.ano)
checar("aporte não infla o 'saiu'", indP.despesa === 800, `${indP.despesa}`)
checar("aporte aparece no seu próprio número", indP.investimentos === 500, `${indP.investimentos}`)
checar("e não derruba o saldo — o dinheiro trocou de bolso, não sumiu",
  indP.acumulado === 2200, `${indP.acumulado}`)
checar("a rosca também ignora o aporte",
  gastosPorCategoria(comPoupanca, refP.mes, refP.ano).reduce((s, f) => s + f.total, 0) === 800)

// Um mês só de aporte ainda é um mês com movimento: a tela não pode dizer
// "nenhum lançamento" para quem acabou de guardar dinheiro.
const soAporte = [lanc("despesa", 300, 2026, 7, "Reserva")]
const indSoAporte = indicadores(soAporte, 7, 2026)
checar("mês só de aporte conta como mês com lançamento",
  indSoAporte.lancamentosNoMes === 1, `${indSoAporte.lancamentosNoMes}`)

// ------------------------------------------------------------- a tela diz ---
console.log("\nO QUE A TELA AFIRMA")

const tela = readFileSync("app/(app)/perfil/page.tsx", "utf8")
const rota = readFileSync("app/api/perfil-financeiro/route.ts", "utf8")

// A ordem pedida no backlog: identidade → dinheiro → rosca → portas.
const iNome = tela.indexOf("{perfil.nome}")
const iDinheiro = tela.indexOf('aria-label="Seu dinheiro"')
const iRosca = tela.indexOf('aria-label="Saídas por categoria"')
const iPortas = tela.indexOf('aria-label="Onde ir"')
checar("o bloco de dinheiro existe", iDinheiro > 0)
checar("nome e foto vêm antes do dinheiro", iNome > 0 && iNome < iDinheiro)
checar("o dinheiro vem antes da rosca", iDinheiro < iRosca, `${iDinheiro} < ${iRosca}`)
checar("a rosca vem antes das quatro portas", iRosca < iPortas)

// Nenhum número saiu da tela quando os tiles mudaram de lugar.
for (const tile of ["DIAS SEGUIDOS", "XP TOTAL", "PRECISÃO"]) {
  checar(`o tile ${tile} continua na tela`, tela.includes(tile))
}
checar("os tiles desceram para depois da rosca",
  tela.indexOf('aria-label="Seu jogo"') > iRosca)

// Vocabulário: o app não sabe o saldo da conta no banco, e não pode dizer que
// sabe. É a mesma régua da landing (item 2 da avaliação de UX).
// Vocabulário de conexão bancária: nada na tela pode sugerir que o número vem
// do banco. A frase honesta ("não é o saldo da sua conta no banco") é conferida
// logo abaixo — aqui o que se proíbe é a promessa, em qualquer das formas em
// que ela apareceria.
const promessaBancaria = [/saldo\s+banc/i, /saldo\s+em\s+conta/i, /conta\s+conectad/i, /sincroniz/i]
for (const p of promessaBancaria) {
  checar(`a tela não diz ${p.source}`, !p.test(tela))
}
checar("a tela diz de onde o saldo vem",
  /Tudo que entrou menos tudo que saiu/.test(tela))
checar("e diz o que ele NÃO é",
  /Não é o saldo da\s+sua conta no banco/.test(tela))

// Dinheiro formatado por `brl`, nunca "R$" à mão: um `R$ ${n}` imprime
// "R$ 1480.5" para quem espera "R$ 1.480,50".
const rsAMao = [...tela.matchAll(/R\$\s*\{/g)]
checar("nenhum 'R$' escrito à mão antes de um valor", rsAMao.length === 0, `${rsAMao.length}`)

// Estado vazio: sem lançamento, a tela não pode afirmar "R$ 0,00". Ela não
// sabe que a pessoa tem zero — sabe que não sabe.
checar("o saldo só é afirmado quando há lançamento", /temNumeros\s*\?/.test(tela))
checar("sem lançamento a tela convida em vez de mostrar zero",
  /Seu saldo aparece aqui/.test(tela))

// A rota: uma competência só, usada pelos três.
checar("a rota usa mesDeReferencia", /mesDeReferencia\(calc\)/.test(rota))
checar("a rota não tem mais um mês privado", !/function mesDaRosca/.test(rota))
const iInd = rota.indexOf("indicadores(calc, mes, ano)")
const iGastos = rota.indexOf("gastosPorCategoria(calc, mes, ano)")
checar("indicadores e rosca recebem a MESMA competência", iInd > 0 && iGastos > 0,
  `${iInd} ${iGastos}`)

console.log(`\n${falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`}`)
process.exit(falhas === 0 ? 0 : 1)
