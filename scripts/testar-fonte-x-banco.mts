/**
 * A fonte e o banco dizem a mesma coisa?
 *
 * POR QUE ESTE TESTE EXISTE
 * Todas as outras baterias leem ARQUIVO. `testar-ef.mts` afirmava "83 módulos ·
 * 415 telas" enquanto o banco tinha zero — e afirmava com razão, porque o
 * arquivo realmente tinha 83. Os módulos passaram seis dias existindo no
 * repositório e não existindo no produto, e nada acusou, porque ninguém estava
 * olhando para os dois lados ao mesmo tempo.
 *
 * A classe de falha é maior que aquele caso: qualquer edição de conteúdo que
 * não seja seguida do semeador produz um repositório que descreve um app que
 * não está no ar. É a mesma doença da documentação desatualizada, num lugar
 * onde ninguém pensa em procurar.
 *
 * O QUE ELE COMPARA
 * Os quatro pares fonte→semeador que existem hoje:
 *
 *   modulos-data.ts (16)  → prisma/seed.ts
 *   modulos-t2.ts   (27)  → semear-t2.mts
 *   modulos-em.ts   (24)  → semear-em.mts
 *   modulos-ef.ts   (83)  → semear-ef.mts
 *
 * Compara identidade (slug), os campos que toda fonte declara (titulo,
 * subtitulo, ordem, publico) e a espinha das telas (ordem, tipo, label).
 *
 * O que ele NÃO compara, de propósito: `conteudo` das telas, que é JSON e
 * volta do Postgres com as chaves em outra ordem — a comparação daria
 * divergência falsa toda vez. E `nivel`/`situacoes`/`tags` dos módulos da T1,
 * que não saem de `modulos-data.ts`: são aplicados depois por
 * `classificar-t1.mts`, a partir de `classificacao-t1.ts`. Comparar contra a
 * fonte errada acusaria erro em algo que está certo.
 *
 *   node --import tsx scripts/testar-fonte-x-banco.mts
 */
import { config } from "dotenv"
config({ path: ".env.local" }); config({ path: ".env" })

const { db } = await import("../lib/db.js")
const { modulosSeeds } = await import("../prisma/modulos-data.js")
const { MODULOS_T2 } = await import("../prisma/modulos-t2.js")
const { MODULOS_EM } = await import("../prisma/modulos-em.js")
const { MODULOS_EF } = await import("../prisma/modulos-ef.js")

interface Esperado {
  slug: string
  titulo: string
  subtitulo: string
  ordem: number
  /** T1 e T2 não declaram: caem no default da coluna. */
  publico: string
  /** Códigos da matriz BCB. T1/T2 não declaram (trilha adulta → []); EF/EM
   *  declaram e, desde 11/08/2026, o semeador PERSISTE — este teste é o que
   *  acusa quando a coluna e a fonte descolarem. */
  habilidades: string[]
  fonte: string
  telas: { ordem: number; tipo: string; label: string }[]
}

const espinha = (telas: readonly { ordem: number; tipo: string; label: string }[]) =>
  [...telas]
    .sort((a, b) => a.ordem - b.ordem)
    .map((t) => `${t.ordem}:${t.tipo}:${t.label}`)

const esperados: Esperado[] = [
  ...modulosSeeds.map((m) => ({ ...m, publico: "adulto", fonte: "modulos-data.ts" })),
  ...MODULOS_T2.map((m) => ({ ...m, publico: "adulto", fonte: "modulos-t2.ts" })),
  ...MODULOS_EM.map((m) => ({ ...m, fonte: "modulos-em.ts" })),
  ...MODULOS_EF.map((m) => ({ ...m, fonte: "modulos-ef.ts" })),
].map((m) => ({
  slug: m.slug,
  titulo: m.titulo,
  subtitulo: m.subtitulo,
  ordem: m.ordem,
  publico: m.publico,
  habilidades: ("habilidades" in m ? (m.habilidades as string[]) : []) ?? [],
  fonte: m.fonte,
  telas: m.telas.map((t) => ({ ordem: t.ordem, tipo: t.tipo as string, label: t.label })),
}))

const noBanco = await db.modulo.findMany({
  select: {
    slug: true, titulo: true, subtitulo: true, ordem: true, publico: true,
    habilidades: true,
    telas: { select: { ordem: true, tipo: true, label: true } },
  },
})

const porSlugFonte = new Map(esperados.map((m) => [m.slug, m]))
const porSlugBanco = new Map(noBanco.map((m) => [m.slug, m]))

const problemas: string[] = []

// ---- 1. slug duplicado entre fontes --------------------------------------
// Duas fontes com o mesmo slug significa que uma sobrescreve a outra no upsert,
// e quem ganha depende da ordem em que os semeadores rodaram.
const vistos = new Set<string>()
for (const m of esperados) {
  if (vistos.has(m.slug)) problemas.push(`slug repetido entre fontes: ${m.slug} (${m.fonte})`)
  vistos.add(m.slug)
}

// ---- 2. na fonte, ausente do banco ---------------------------------------
// É o bug dos seis dias: conteúdo escrito que o produto não tem.
for (const m of esperados) {
  if (!porSlugBanco.has(m.slug)) {
    problemas.push(`FALTA NO BANCO  ${m.slug}  (${m.fonte}) — falta rodar o semeador`)
  }
}

// ---- 3. no banco, ausente de toda fonte -----------------------------------
// Conteúdo vivo no produto que ninguém consegue mais reproduzir do repositório.
for (const m of noBanco) {
  if (!porSlugFonte.has(m.slug)) {
    problemas.push(`SÓ NO BANCO     ${m.slug}  (publico=${m.publico}) — sem fonte no repositório`)
  }
}

// ---- 4. divergência campo a campo ----------------------------------------
for (const esperado of esperados) {
  const real = porSlugBanco.get(esperado.slug)
  if (!real) continue

  for (const campo of ["titulo", "subtitulo", "ordem", "publico"] as const) {
    if (real[campo] !== esperado[campo]) {
      problemas.push(
        `DIVERGE ${campo.padEnd(9)} ${esperado.slug}\n` +
          `    fonte: ${JSON.stringify(esperado[campo])}\n` +
          `    banco: ${JSON.stringify(real[campo])}`
      )
    }
  }

  // Verbatim, na ordem da fonte: o semeador grava o array como está, então
  // qualquer diferença — inclusive de ordem — é semeador por rodar.
  if (real.habilidades.join(",") !== esperado.habilidades.join(",")) {
    problemas.push(
      `DIVERGE habilidades ${esperado.slug}\n` +
        `    fonte: ${JSON.stringify(esperado.habilidades)}\n` +
        `    banco: ${JSON.stringify(real.habilidades)}`
    )
  }

  const eF = espinha(esperado.telas)
  const eB = espinha(real.telas)
  if (eF.length !== eB.length) {
    problemas.push(
      `DIVERGE telas     ${esperado.slug} — fonte tem ${eF.length}, banco tem ${eB.length}`
    )
  } else {
    for (let i = 0; i < eF.length; i++) {
      if (eF[i] !== eB[i]) {
        problemas.push(
          `DIVERGE tela      ${esperado.slug}\n    fonte: ${eF[i]}\n    banco: ${eB[i]}`
        )
        break // uma por módulo basta para mandar rodar o semeador
      }
    }
  }
}

// ---- relatório -----------------------------------------------------------
const porFonte = new Map<string, number>()
for (const m of esperados) porFonte.set(m.fonte, (porFonte.get(m.fonte) ?? 0) + 1)

console.log("fonte                módulos")
for (const [f, n] of [...porFonte].sort()) console.log(`  ${f.padEnd(20)}${String(n).padStart(5)}`)
console.log(`  ${"TOTAL".padEnd(20)}${String(esperados.length).padStart(5)}`)
console.log(`\nno banco: ${noBanco.length} módulos · ${noBanco.reduce((s, m) => s + m.telas.length, 0)} telas`)

if (problemas.length) {
  console.log(`\n${problemas.length} divergência(s):\n`)
  for (const p of problemas) console.log("  ✗ " + p)
  console.log(
    "\nO repositório e o produto discordam. Rode o semeador da fonte apontada\n" +
      "(semear-t2 / semear-em / semear-ef / prisma/seed.ts) e confira de novo."
  )
} else {
  console.log("\n✓ fonte e banco batem: mesmos módulos, mesmos títulos, mesmas telas.")
}

await db.$disconnect()
process.exit(problemas.length === 0 ? 0 : 1)
