/**
 * Confronta as habilidades declaradas pelos módulos com a matriz do BC.
 *
 * POR QUE ESTE TESTE PRECISOU EXISTIR
 * `testar-em.mts` imprime "47/47 habilidades" e `testar-ef.mts` imprime "183
 * habilidades" — mas os dois só contam os códigos que os PRÓPRIOS módulos
 * declaram. O 47 é literal cravado no `console.log`. Nada nunca abriu
 * `docs/matriz-bcb-competencias.json` para conferir se aqueles códigos existem,
 * nem se são os certos. A afirmação "cobertura verificada programaticamente"
 * era circular: os módulos dizem cobrir 47, e o teste conta 47 do que eles
 * dizem.
 *
 * Este script abre a matriz e responde três perguntas diferentes:
 *
 *  1. Algum módulo declara código que não existe na matriz? (pode ser código
 *     errado no módulo, OU buraco na matriz — ver 3)
 *  2. Algum código da matriz ficou sem módulo nenhum?
 *  3. A matriz tem buracos na própria sequência?
 *
 * A (3) importa porque a matriz é uma extração de PDF e chegou incompleta: as
 * sequências vão até números maiores do que a contagem de chaves. Enquanto ela
 * estiver assim, a (1) não consegue distinguir "módulo errado" de "matriz
 * faltando", e este script diz isso em vez de fingir um veredito.
 *
 *   node --import tsx scripts/testar-matriz.mts
 */
import { readFileSync } from "node:fs"

const { MODULOS_EM } = await import("../prisma/modulos-em.js")
const { MODULOS_EF } = await import("../prisma/modulos-ef.js")

interface Competencia {
  texto: string
  tema: string
  pagina: number
}
const matriz: Record<string, Competencia> = JSON.parse(
  readFileSync("docs/matriz-bcb-competencias.json", "utf8")
)

const naMatriz = new Set(Object.keys(matriz))

/** Faixa (EF12, EM13…) → maior número visto, e quantas chaves existem. */
const faixas = new Map<string, { chaves: number; maior: number }>()
for (const cod of naMatriz) {
  const g = cod.match(/^(E[FM][0-9]+)LF([0-9]+)$/)
  if (!g) continue
  const f = faixas.get(g[1]) ?? { chaves: 0, maior: 0 }
  f.chaves++
  f.maior = Math.max(f.maior, Number(g[2]))
  faixas.set(g[1], f)
}

/** Código → módulos que o declaram. Mais de um é duplicata. */
const declarado = new Map<string, string[]>()
for (const m of [...MODULOS_EM, ...MODULOS_EF]) {
  for (const h of m.habilidades ?? []) {
    declarado.set(h, [...(declarado.get(h) ?? []), m.slug])
  }
}

let falhas = 0

// ---- 1. declarado pelos módulos, ausente da matriz ------------------------
const orfaos = [...declarado.keys()].filter((c) => !naMatriz.has(c)).sort()

// ---- 2. na matriz, sem módulo --------------------------------------------
const semDono = [...naMatriz].filter((c) => !declarado.has(c)).sort()

// ---- 3. buracos na própria matriz ----------------------------------------
let buracos = 0
console.log("faixa    chaves  maior  buracos")
for (const [nome, f] of [...faixas].sort()) {
  const b = f.maior - f.chaves
  buracos += b
  console.log(`  ${nome.padEnd(7)}${String(f.chaves).padStart(6)}${String(f.maior).padStart(7)}${String(b).padStart(9)}`)
}

// ---- duplicatas: dois módulos reivindicando a mesma habilidade ------------
const duplicadas = [...declarado].filter(([, mods]) => mods.length > 1)

console.log(`\nmatriz            : ${naMatriz.size} códigos, ${buracos} buraco(s) na sequência`)
console.log(`módulos declaram  : ${declarado.size} códigos distintos`)
console.log(`ausentes da matriz: ${orfaos.length}`)
console.log(`matriz sem módulo : ${semDono.length}`)
console.log(`duplicados        : ${duplicadas.length}`)

if (duplicadas.length) {
  console.log("\n✗ mesma habilidade reivindicada por mais de um módulo:")
  for (const [cod, mods] of duplicadas) console.log(`   ${cod}: ${mods.join(", ")}`)
  falhas += duplicadas.length
}

if (orfaos.length) {
  console.log(`\n⚠ ${orfaos.length} código(s) declarados e ausentes da matriz:`)
  console.log("   " + orfaos.join(" "))
  if (buracos > 0) {
    console.log(
      `\n   NÃO é veredito contra os módulos: a matriz tem ${buracos} buraco(s) na\n` +
        "   própria sequência, então parte disto é extração incompleta do PDF.\n" +
        "   Só dá para separar os dois com a matriz completa em mãos."
    )
  } else {
    console.log("   A matriz está íntegra, então estes códigos estão errados nos módulos.")
    falhas += orfaos.length
  }
}

if (semDono.length) {
  console.log(`\n⚠ ${semDono.length} código(s) da matriz sem nenhum módulo:`)
  console.log("   " + semDono.slice(0, 40).join(" ") + (semDono.length > 40 ? " …" : ""))
}

/**
 * Duplicata é erro; o resto é aviso.
 *
 * Falhar por buraco de matriz travaria o build por um defeito de PDF que
 * ninguém aqui consegue consertar hoje — e teste que sempre falha vira teste
 * que ninguém lê. Duplicata, não: é erro nosso, no nosso arquivo, e tem
 * conserto imediato.
 */
console.log(`\n${falhas} falha(s)`)
process.exit(falhas === 0 ? 0 : 1)
