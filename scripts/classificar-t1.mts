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

/**
 * Módulo fora desta lista NÃO é erro: é da Temporada 2, que já nasce
 * classificado no próprio seed. O que este script cobre é a reclassificação do
 * que veio ANTES do schema de biblioteca existir.
 *
 * Erro de verdade é módulo sem posição nenhuma — nível vazio E sem situação —,
 * porque aí alguém escreveu conteúdo que ninguém vai encontrar.
 */
const foraDaT1 = [...slugs].filter((s) => !CLASSIFICACAO_T1.some((c) => c.slug === s))
const semPosicao = await db.modulo.findMany({
  where: { slug: { in: foraDaT1 }, nivel: "", situacoes: { isEmpty: true } },
  select: { slug: true },
})

if (foraDaT1.length) console.log(`\n  da T2, classificados no próprio seed: ${foraDaT1.join(", ")}`)
if (semPosicao.length) console.log(`  SEM POSIÇÃO: ${semPosicao.map((m) => m.slug).join(", ")}`)

console.log(`\n${CLASSIFICACAO_T1.length} da T1 classificados · ${faltando} faltando no banco · ${foraDaT1.length} da T2`)

console.log("\nSOBREPOSIÇÕES COM O BACKLOG T2 (regra dos 70%)")
for (const s of SOBREPOSICOES) {
  console.log(`\n  [${s.cobertura}] ${s.t1.join(" + ")}  ↔  ${s.t2.join(" + ")}`)
  console.log(`     ${s.veredito.replace(/\s+/g, " ").slice(0, 200)}…`)
}

if (!aplicar) console.log("\n(simulação — rode com --aplicar)")
await db.$disconnect()
process.exit(faltando === 0 && semPosicao.length === 0 ? 0 : 1)
