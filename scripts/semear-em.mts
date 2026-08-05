/**
 * Semeia a trilha de Ensino Médio. Idempotente por slug.
 *
 * Roda em SIMULAÇÃO por padrão. Grava só com `--aplicar`, e isso não é
 * cerimônia: o banco deste projeto é o de produção, e o app é testado lá.
 *
 *   node --import tsx scripts/semear-em.mts             → simula
 *   node --import tsx scripts/semear-em.mts --aplicar   → grava
 *
 * As aulas nascem com `publico: "em"`. Enquanto o app servir só adultos, elas
 * ficam no banco sem aparecer para ninguém — todas as leituras de `Modulo`
 * filtram por público (lib/publico.ts, conferido por scripts/testar-publico.mts).
 */
import { config } from "dotenv"
config({ path: ".env.local" }); config({ path: ".env" })

const { db } = await import("../lib/db.js")
const { MODULOS_EM } = await import("../prisma/modulos-em.js")
const { chavesCitadas } = await import("../lib/indicadores.js")

const aplicar = process.argv.includes("--aplicar")
const conhecidos = new Set((await db.indicador.findMany({ select: { chave: true } })).map((i) => i.chave))

let erros = 0

/**
 * A coluna `publico` precisa existir ANTES de gravar.
 *
 * Ordem que não pode inverter: `prisma db push` primeiro, seed depois. Semear
 * numa tabela sem a coluna faria as 24 aulas entrarem com o default do Prisma
 * — "adulto" — e elas apareceriam para todo mundo no mesmo instante, que é
 * exatamente o que o gate existe para impedir.
 */
try {
  await db.$queryRaw`SELECT "publico" FROM "Modulo" LIMIT 1`
} catch {
  console.log('✗ A coluna "publico" não existe em Modulo.')
  console.log("  Rode `pnpm db:push` antes de semear — sem ela as aulas de EM entrariam como adultas.")
  await db.$disconnect()
  process.exit(1)
}

for (const m of MODULOS_EM) {
  const citadas = [...new Set(chavesCitadas(JSON.stringify(m.telas)))]
  const orfas = citadas.filter((c) => !conhecidos.has(c))
  console.log(
    `${String(m.ordem).padStart(2, "0")}. ${m.slug}  ${m.telas.length} telas  ${m.nivel}  [${m.situacoes.join(", ") || "geral"}]  ${m.habilidades.join(" ")}`
  )
  if (orfas.length) {
    console.log(`    ✗ indicadores que não existem: ${orfas.join(", ")}`)
    erros++
  }

  const tipos = m.telas.map((t) => t.tipo)
  const validos = ["conceito", "cenario", "quiz", "input", "resultado"]
  const fora = tipos.filter((t) => !validos.includes(t))
  if (fora.length) {
    console.log(`    ✗ tipo de tela inexistente: ${fora.join(", ")}`)
    erros++
  }

  if (!aplicar || orfas.length || fora.length) continue

  // `habilidades` é rastreabilidade da matriz do BC, não coluna — sai antes do
  // upsert, senão o Prisma recusa o argumento desconhecido.
  const { telas, habilidades: _habilidades, ...dados } = m
  const salvo = await db.modulo.upsert({
    where: { slug: m.slug },
    create: { ...dados },
    update: { ...dados },
  })
  // Telas são recriadas: editar conteúdo é reescrever, não fazer diff de JSON.
  await db.tela.deleteMany({ where: { moduloId: salvo.id } })
  await db.tela.createMany({
    data: telas.map((t) => ({
      moduloId: salvo.id,
      ordem: t.ordem,
      tipo: t.tipo,
      label: t.label,
      conteudo: t.conteudo as never,
    })),
  })
  console.log(`    gravado`)
}

if (aplicar && erros === 0) {
  const [emBanco, adultos] = await Promise.all([
    db.modulo.count({ where: { publico: "em" } }),
    db.modulo.count({ where: { publico: "adulto" } }),
  ])
  console.log(`\nNo banco: ${emBanco} aulas de EM · ${adultos} aulas adultas (intocadas)`)
}

console.log(
  `\n${MODULOS_EM.length} módulo(s) · ${erros} erro(s)${aplicar ? "" : "  (simulação — rode com --aplicar)"}`
)
await db.$disconnect()
process.exit(erros === 0 ? 0 : 1)
