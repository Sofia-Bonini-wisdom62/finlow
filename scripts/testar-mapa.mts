/**
 * Confere que todo caminho do mapa do app existe de verdade.
 *
 * POR QUE ISTO EXISTE
 * O card de recomendação apontava para `/modulo/{slug}` — rota que nunca
 * existiu. Toda aula recomendada desde que o chat foi ligado levava a um 404,
 * e nada no build reclamou: um href é só uma string.
 *
 * Agora o mapa é a fonte que o assistente lê, então um href errado aqui vira o
 * assistente mandando a pessoa para o lugar errado com confiança. Este teste é
 * o que impede o mapa de envelhecer calado.
 *
 *   node --import tsx scripts/testar-mapa.mts
 */
import { existsSync } from "node:fs"
import { DESTINOS, ACOES } from "../lib/app-mapa.js"
import { ABAS } from "../lib/abas.js"

/** Uma rota existe se houver um page.tsx correspondente, em qualquer grupo. */
function rotaExiste(href: string): boolean {
  const limpo = href.replace(/^\//, "")
  const candidatos = [
    `app/${limpo}/page.tsx`,
    `app/(app)/${limpo}/page.tsx`,
    `app/(auth)/${limpo}/page.tsx`,
  ]
  return candidatos.some((c) => existsSync(c))
}

let falhas = 0

console.log("DESTINOS")
for (const d of DESTINOS) {
  const ok = rotaExiste(d.href)
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${d.href.padEnd(14)} ${d.nome}`)
}

console.log("\nAÇÕES")
for (const a of ACOES) {
  const ok = rotaExiste(a.href)
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${a.href.padEnd(14)} ${a.pedido.slice(0, 46)}`)
}

// Toda ação tem de terminar numa tela que o mapa também conhece: se o
// assistente cita um destino que não está em DESTINOS, ele não sabe descrevê-lo.
const conhecidos = new Set(DESTINOS.map((d) => d.href))
const orfas = ACOES.filter((a) => !conhecidos.has(a.href))
if (orfas.length) {
  falhas++
  console.log(`\n✗ ações apontando para tela fora do mapa: ${orfas.map((o) => o.href).join(", ")}`)
}

// Nenhum passo vazio — um caminho com passo em branco vira "Menu >  > Apagar".
const semPasso = [...DESTINOS.map((d) => ({ n: d.nome, p: d.caminho })), ...ACOES.map((a) => ({ n: a.pedido, p: a.passos }))]
  .filter((x) => x.p.length === 0 || x.p.some((s) => !s.trim()))
if (semPasso.length) {
  falhas++
  console.log(`\n✗ caminho com passo vazio: ${semPasso.map((x) => x.n).join(", ")}`)
}

/**
 * O primeiro passo de todo caminho tem de ser uma aba de verdade.
 *
 * A rota existir não basta. /analises continuou existindo depois de deixar de
 * ser aba, e o mapa continuou dizendo "toca em Análises": instrução impossível
 * de seguir, apontando para uma tela que existe. Nenhuma checagem de rota pega
 * isso — só comparar com `lib/abas.ts` pega.
 */
const abas = new Set(ABAS.map((a) => a.label))
const foraDaAba = [
  ...DESTINOS.map((d) => ({ n: d.nome, primeiro: d.caminho[0] })),
  ...ACOES.map((a) => ({ n: a.pedido, primeiro: a.passos[0] })),
].filter((x) => x.primeiro && !abas.has(x.primeiro))
if (foraDaAba.length) {
  falhas++
  console.log(
    `\n✗ caminho começando fora das abas (${[...abas].join(" · ")}):\n` +
      foraDaAba.map((x) => `    "${x.primeiro}" em ${x.n}`).join("\n")
  )
}

console.log(`\n${falhas === 0 ? "✓ todo caminho do mapa existe" : `✗ ${falhas} problema(s)`}`)
process.exit(falhas === 0 ? 0 : 1)
