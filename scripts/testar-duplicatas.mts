/**
 * Testa a conferência de duplicata do extrato (lib/extrato/duplicatas.ts).
 *
 * RODA SEM BANCO E SEM CHAVE DE CIFRA — o motor é puro de propósito. Isso
 * importa aqui mais do que no resto: a resposta certa desta regra costuma ser
 * "não achei nada", que é indistinguível de um comparador quebrado que nunca
 * acusa. Um teste que só roda contra o banco de produção nunca prova a
 * diferença; este prova, exercitando cada regra dos DOIS lados.
 *
 * O que precisa ser verdade:
 * - mesmo dia + mesmo tipo + mesmo valor + mesma descrição → "exata";
 * - a mesma coisa com outro nome → "provavel", nunca "exata";
 * - dia, valor ou tipo diferente → NÃO casa (o falso positivo caro);
 * - cada linha existente absorve no máximo UMA linha nova;
 * - descrição igual tem prioridade sobre descrição diferente;
 * - repetição legítima dentro do mesmo extrato não vira duplicata sozinha.
 *
 *   node --import tsx scripts/testar-duplicatas.mts
 */
import { acharDuplicatas, normalizarDescricao, type LancamentoComparavel } from "../lib/extrato/duplicatas.js"

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

/** Lançamento no dia `dia` de julho/2026, às 12:00Z — como o extrato grava. */
function l(dia: number, descricao: string, valor: number, tipo = "despesa"): LancamentoComparavel {
  return { data: new Date(Date.UTC(2026, 6, dia, 12, 0, 0)), tipo, valor, descricao }
}

// ------------------------------------------------------ normalização ---
console.log("\nnormalização da descrição")
checar("acento sai", normalizarDescricao("Alimentação") === "alimentacao")
checar("pontuação e caixa somem", normalizarDescricao("NETFLIX.COM *ASSIN") === "netflix com assin")
checar("espaço repetido colapsa", normalizarDescricao("  iFood   pedido  ") === "ifood pedido")
checar(
  "as duas grafias do mesmo lançamento se encontram",
  normalizarDescricao("NETFLIX.COM  *ASSINATURA") === normalizarDescricao("netflix com assinatura")
)

// ------------------------------------------------------------ casa ---
console.log("\ncasa quando é a mesma linha")
{
  const r = acharDuplicatas([l(3, "NETFLIX.COM", 39.9)], [l(3, "netflix com", 39.9)])
  checar("mesmo dia/tipo/valor e descrição equivalente → exata", r.length === 1 && r[0].confianca === "exata")
  checar("aponta o dia em que já estava lançado", r[0]?.jaLancadoEm.toISOString().slice(0, 10) === "2026-07-03")
}
{
  const r = acharDuplicatas([l(3, "Padaria do Zé", 12)], [l(3, "PAG*PADARIA", 12)])
  checar("mesmo dia/tipo/valor, outro nome → provavel", r.length === 1 && r[0].confianca === "provavel")
}
{
  const r = acharDuplicatas([l(3, "Salário", 5000, "receita")], [l(3, "Salário", 5000, "receita")])
  checar("receita também é conferida", r.length === 1 && r[0].confianca === "exata")
}

// -------------------------------------------------------- NÃO casa ---
// O falso positivo é o erro caro deste arquivo: desmarcar linha verdadeira
// faz faltar dinheiro no total, e ninguém vai atrás do que não apareceu.
console.log("\nNÃO casa (o falso positivo caro)")
checar("dia diferente não casa", acharDuplicatas([l(3, "Netflix", 39.9)], [l(4, "Netflix", 39.9)]).length === 0)
checar("um centavo de diferença não casa", acharDuplicatas([l(3, "Netflix", 39.9)], [l(3, "Netflix", 39.91)]).length === 0)
checar(
  "tipo diferente não casa",
  acharDuplicatas([l(3, "Pix", 100, "receita")], [l(3, "Pix", 100, "despesa")]).length === 0
)
checar("histórico vazio não casa nada", acharDuplicatas([], [l(3, "Netflix", 39.9)]).length === 0)
checar("extrato vazio devolve vazio", acharDuplicatas([l(3, "Netflix", 39.9)], []).length === 0)

// ------------------------------------------------------ 1 para 1 ---
console.log("\ncada linha existente absorve no máximo uma")
{
  // Um café já lançado; o extrato traz DOIS cafés iguais no mesmo dia. Um é
  // duplicata, o outro é gasto verdadeiro — marcar os dois some com um café.
  const r = acharDuplicatas([l(3, "Café", 12)], [l(3, "Café", 12), l(3, "Café", 12)])
  checar("1 existente + 2 novas iguais → só 1 duplicata", r.length === 1, `achou ${r.length}`)
  checar("a duplicata é a primeira linha", r[0]?.indice === 0)
}
{
  const r = acharDuplicatas([l(3, "Café", 12), l(3, "Café", 12)], [l(3, "Café", 12), l(3, "Café", 12)])
  checar("2 existentes + 2 novas iguais → 2 duplicatas", r.length === 2)
}
{
  // Sem nada no histórico, repetição legítima dentro do extrato é só isso.
  const r = acharDuplicatas([], [l(3, "Café", 12), l(3, "Café", 12)])
  checar("repetição dentro do próprio extrato não vira duplicata", r.length === 0)
}

// ------------------------------------------------- prioridade ---
console.log("\ndescrição igual tem prioridade sobre descrição diferente")
{
  // Um só lançamento existente disputado por duas linhas novas. Quem leva é a
  // de descrição igual — senão a duplicata mais evidente ficaria marcada.
  const r = acharDuplicatas([l(3, "Netflix", 39.9)], [l(3, "Outra coisa", 39.9), l(3, "Netflix", 39.9)])
  checar("só uma casa", r.length === 1)
  checar("quem casou foi a de descrição igual", r[0]?.indice === 1 && r[0]?.confianca === "exata",
    `indice=${r[0]?.indice} confianca=${r[0]?.confianca}`)
}

// ------------------------------------------------------ aritmética ---
console.log("\nvalor é comparado em centavos inteiros")
{
  // 0.1 + 0.2 === 0.30000000000000004. Comparar float por igualdade erraria.
  const r = acharDuplicatas([l(3, "Teste", 0.1 + 0.2)], [l(3, "Teste", 0.3)])
  checar("0.1 + 0.2 casa com 0.3", r.length === 1)
}

// ---------------------------------------------- caso realista ---
console.log("\ncenário realista: jan–mar e depois fev–abr")
{
  // O histórico tem março inteiro; o extrato novo traz março de novo mais abril.
  const existentes = [l(5, "Aluguel", 1800), l(8, "iFood", 62.4), l(9, "Uber", 23.1)]
  const novas = [
    l(5, "Aluguel", 1800), // repetido
    l(8, "iFood", 62.4), // repetido
    l(9, "UBER *TRIP", 23.1), // repetido, nome diferente
    l(20, "Mercado", 210.5), // novo de verdade
    l(21, "Uber", 23.1), // mesmo valor, OUTRO dia — é gasto novo
  ]
  const r = acharDuplicatas(existentes, novas)
  const indices = r.map((d) => d.indice).join(",")
  checar("acha as três repetidas e só elas", indices === "0,1,2", `indices=${indices}`)
  checar("as duas de nome idêntico saem como exatas",
    r[0]?.confianca === "exata" && r[1]?.confianca === "exata")
  checar("a de nome diferente sai como provável", r[2]?.confianca === "provavel")
  checar("o gasto novo do mesmo valor em outro dia fica de fora",
    !r.some((d) => d.indice === 4))
  const desmarcadas = r.filter((d) => d.confianca === "exata").length
  checar("a tela desmarcaria 2 das 5 linhas", desmarcadas === 2)
}

console.log(falhas === 0 ? "\n✓ todos os casos passaram" : `\n✗ ${falhas} falha(s)`)
process.exit(falhas === 0 ? 0 : 1)
