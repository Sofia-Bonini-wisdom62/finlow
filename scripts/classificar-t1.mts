/**
 * Aplica a classificação da Temporada 1 (recomendação 4 do backlog T2).
 *
 * Idempotente: roda quantas vezes quiser, escreve sempre o mesmo. A fonte é
 * `prisma/classificacao-t1.ts`, não este arquivo — aqui só tem a escrita.
 *
 *   node --import tsx scripts/classificar-t1.mts [--aplicar]
 */
import { config } from "dotenv"
config({ path: ".env.local" }); config({ path: ".env" })

const { db } = await import("../lib/db.js")
const { CLASSIFICACAO_T1, SOBREPOSICOES } = await import("../prisma/classificacao-t1.js")

const aplicar = process.argv.includes("--aplicar")
const existentes = await db.modulo.findMany({ select: { slug: true } })
const slugs = new Set(existentes.map((m) => m.slug))

let faltando = 0
for (const c of CLASSIFICACAO_T1) {
  if (!slugs.has(c.slug)) { console.log(`  FALTA no banco: ${c.slug}`); faltando++; continue }
  console.log(`  ${c.slug.padEnd(26)} ${c.nivel.padEnd(13)} [${c.situacoes.join(", ") || "geral"}]`)
  if (aplicar) {
    await db.modulo.update({
      where: { slug: c.slug },
      data: { nivel: c.nivel, situacoes: c.situacoes, tags: c.tags },
    })
  }
}

const semClassificar = [...slugs].filter((s) => !CLASSIFICACAO_T1.some((c) => c.slug === s))
if (semClassificar.length) console.log(`\n  sem classificação: ${semClassificar.join(", ")}`)

console.log(`\n${CLASSIFICACAO_T1.length} classificados · ${faltando} faltando no banco · ${semClassificar.length} sem classificação`)

console.log("\nSOBREPOSIÇÕES COM O BACKLOG T2 (regra dos 70%)")
for (const s of SOBREPOSICOES) {
  console.log(`\n  [${s.cobertura}] ${s.t1.join(" + ")}  ↔  ${s.t2.join(" + ")}`)
  console.log(`     ${s.veredito.replace(/\s+/g, " ").slice(0, 200)}…`)
}

if (!aplicar) console.log("\n(simulação — rode com --aplicar)")
await db.$disconnect()
process.exit(faltando === 0 && semClassificar.length === 0 ? 0 : 1)
