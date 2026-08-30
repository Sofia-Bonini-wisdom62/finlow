/**
 * Semeia a nova base de lições (321 lições, 6 formatos por item — 20/08/2026)
 * e SUBSTITUI a trilha escolar atual (24 módulos de EM + 83 de EF, formato
 * `conceito/cenario/quiz/input/resultado`). Decisão da fundadora, registrada
 * em `docs/backlog-produto.md`, seção "Nova base de lições".
 *
 * Idempotente por slug nos módulos NOVOS. A parte de troca (apagar os
 * módulos antigos) roda uma vez só, de propósito — rodar de novo depois não
 * encontra mais nada pra apagar.
 *
 * Roda em SIMULAÇÃO por padrão. Grava só com `--aplicar`:
 *
 *   node --import tsx scripts/semear-licoes.mts             → simula
 *   node --import tsx scripts/semear-licoes.mts --aplicar   → grava
 *
 * PROGRESSO: mantém XP, reseta módulo (decisão da fundadora, confirmada
 * nesta integração). Apagar os módulos antigos cascateia Tela/
 * ProgressoModulo/ProgressoLicao/RecomendacaoTrilha deles — `EventoPontuacao`
 * e `User.pontos` não têm FK pra Modulo (o refId é string solta) e por isso
 * sobrevivem intactos. É por isso que a ordem do apagar é a que importa:
 * NUNCA `db.eventoPontuacao.deleteMany`, só `db.modulo.deleteMany`.
 */
import { config } from "dotenv"
config({ path: ".env.local" }); config({ path: ".env" })

const { db } = await import("../lib/db.js")
const { MODULOS_LICOES } = await import("../prisma/modulos-licoes.js")

const aplicar = process.argv.includes("--aplicar")

/**
 * `Modulo.formato`/`ItemLicao` precisam existir ANTES de gravar — a mesma
 * ordem de sempre (`CLAUDE.md`): coluna → deploy → seed. Semear numa tabela
 * sem a coluna faria os módulos novos entrarem como "classico" (o default) e
 * o player que sabe ler "item" nunca os acharia.
 */
try {
  await db.$queryRaw`SELECT "formato" FROM "Modulo" LIMIT 1`
  await db.$queryRaw`SELECT 1 FROM "ItemLicao" LIMIT 1`
} catch {
  console.log('✗ "Modulo.formato" ou a tabela "ItemLicao" não existem ainda.')
  console.log("  Rode `pnpm db:push` (e confirme o deploy do código que lê o formato novo) antes de semear.")
  await db.$disconnect()
  process.exit(1)
}

let erros = 0

for (const m of MODULOS_LICOES) {
  const { itens, ...dados } = m
  console.log(
    `${String(m.ordem).padStart(4, "0")}. ${m.slug}  ${itens.length} itens  ${m.publico}  encontro ${m.encontro}`
  )

  const formatosValidos = ["binaria", "escolha3", "classificar", "ordenar", "estimativa", "fecho"]
  const foraDoFormato = itens.filter((i) => !formatosValidos.includes(i.formato))
  if (foraDoFormato.length) {
    console.log(`    ✗ formato de item inexistente: ${[...new Set(foraDoFormato.map((i) => i.formato))].join(", ")}`)
    erros++
    continue
  }

  if (!aplicar) continue

  const salvo = await db.modulo.upsert({
    where: { slug: m.slug },
    create: { ...dados },
    update: { ...dados },
  })
  // Itens são recriados: editar conteúdo é reescrever, não fazer diff de
  // JSON — o mesmo princípio de scripts/semear-em.mts com Tela.
  await db.itemLicao.deleteMany({ where: { moduloId: salvo.id } })
  await db.itemLicao.createMany({
    data: itens.map((i) => ({
      moduloId: salvo.id,
      ordem: i.ordem,
      papel: i.papel,
      formato: i.formato,
      conteudo: i as never,
    })),
  })
  console.log(`    gravado`)
}

if (erros) {
  console.log(`\n${erros} erro(s) — nada foi apagado. Corrija antes de rodar --aplicar de novo.`)
  await db.$disconnect()
  process.exit(1)
}

/**
 * A TROCA: os módulos escolares antigos saem, nunca os adultos.
 *
 * "Reseta módulo, mantém XP" (decisão confirmada nesta integração) se cumpre
 * exatamente aqui: apagar o Modulo cascateia ProgressoModulo/ProgressoLicao
 * dele — quem estava no meio perde o progresso NESSES módulos — mas não tem
 * caminho nenhum até EventoPontuacao ou User.pontos, que ficam como estavam.
 *
 * O número é IMPRESSO ANTES de apagar, sempre — mesmo em simulação — porque
 * "quantas pessoas isso afeta" é a pergunta que decide se vale confirmar
 * antes de rodar com --aplicar contra produção, não uma curiosidade de log.
 */
const antigos = await db.modulo.findMany({
  where: { formato: "classico", publico: { in: ["ef12", "ef35", "ef67", "ef89", "em"] } },
  select: { id: true },
})
const afetados = antigos.length
  ? await db.progressoModulo.count({ where: { moduloId: { in: antigos.map((m) => m.id) } } })
  : 0

console.log(
  `\n${antigos.length} módulo(s) escolar(es) antigo(s) no banco, com ${afetados} linha(s) de ` +
    `ProgressoModulo que serão apagadas em cascata (o XP em User.pontos e o ledger EventoPontuacao NÃO são tocados).`
)

if (aplicar && antigos.length) {
  const removido = await db.modulo.deleteMany({
    where: { formato: "classico", publico: { in: ["ef12", "ef35", "ef67", "ef89", "em"] } },
  })
  console.log(`${removido.count} módulo(s) antigo(s) apagado(s).`)
}

if (aplicar) {
  const [novos, adultos, restantes] = await Promise.all([
    db.modulo.count({ where: { formato: "item" } }),
    db.modulo.count({ where: { publico: "adulto" } }),
    db.modulo.count({ where: { formato: "classico", publico: { not: "adulto" } } }),
  ])
  console.log(
    `\nNo banco: ${novos} módulos novos (formato item) · ${adultos} aulas adultas (intocadas) · ` +
      `${restantes} módulo escolar clássico restante (esperado: 0)`
  )
}

console.log(
  `\n${MODULOS_LICOES.length} módulo(s) · ${erros} erro(s)${aplicar ? "" : "  (simulação — rode com --aplicar)"}`
)
await db.$disconnect()
process.exit(erros === 0 ? 0 : 1)
