/**
 * Semeia os módulos da Temporada 2. Idempotente por slug.
 *
 * Confere ANTES de gravar que todo `{{indicador}}` citado existe: um módulo
 * citando `{{selic_atul}}` gravaria e só apareceria na tela de alguém.
 *
 *   node --import tsx scripts/semear-t2.mts [--aplicar]
 */
import { config } from "dotenv"
config({ path: ".env.local" }); config({ path: ".env" })

const { db } = await import("../lib/db.js")
const { MODULOS_T2 } = await import("../prisma/modulos-t2.js")
const { chavesCitadas } = await import("../lib/indicadores.js")

const aplicar = process.argv.includes("--aplicar")
const conhecidos = new Set((await db.indicador.findMany({ select: { chave: true } })).map((i) => i.chave))

let erros = 0
for (const m of MODULOS_T2) {
  const citadas = [...new Set(chavesCitadas(JSON.stringify(m.telas)))]
  const orfas = citadas.filter((c) => !conhecidos.has(c))
  console.log(`${m.slug}  ${m.telas.length} telas  nivel=${m.nivel}  [${m.situacoes.join(", ") || "geral"}]`)
  console.log(`   indicadores: ${citadas.join(", ") || "nenhum"}`)
  if (orfas.length) { console.log(`   ✗ NÃO EXISTEM: ${orfas.join(", ")}`); erros++ }

  /**
   * HTML só vale no `headline`: é o único campo que o componente renderiza
   * como rich text. Em qualquer outro, a tag aparece literal na tela — foi o
   * que aconteceu no primeiro corte deste módulo, e só apareceu percorrendo
   * as telas no navegador.
   */
  for (const t of m.telas) {
    const c = t.conteudo as Record<string, unknown>
    const foraDoHeadline = [
      typeof c.corpo === "string" ? c.corpo : "",
      typeof c.rodape === "string" ? c.rodape : "",
      typeof c.subtitulo === "string" ? c.subtitulo : "",
      typeof c.insightDinamico === "string" ? c.insightDinamico : "",
      ...((c.faixas as { mensagem: string }[] | undefined) ?? []).map((f) => f.mensagem),
      ...((c.opcoes as { feedback: string }[] | undefined) ?? []).map((o) => o.feedback),
    ]
    const comTag = foraDoHeadline.filter((x) => /<\w+>/.test(x))
    if (comTag.length) {
      console.log(`   ✗ tela ${t.ordem}: HTML fora do headline vira texto literal na tela`)
      erros++
    }
  }

  const tipos = m.telas.map((t) => t.tipo)
  const validos = ["conceito", "cenario", "quiz", "input", "resultado"]
  const fora = tipos.filter((t) => !validos.includes(t))
  if (fora.length) { console.log(`   ✗ tipo de tela inexistente: ${fora.join(", ")}`); erros++ }

  if (!aplicar || orfas.length || fora.length) continue

  const { telas, ...dados } = m
  const salvo = await db.modulo.upsert({
    where: { slug: m.slug },
    create: { ...dados },
    update: { ...dados },
  })
  // Telas são recriadas: editar conteúdo é reescrever, não fazer diff de JSON.
  await db.tela.deleteMany({ where: { moduloId: salvo.id } })
  await db.tela.createMany({
    data: telas.map((t) => ({ moduloId: salvo.id, ordem: t.ordem, tipo: t.tipo, label: t.label, conteudo: t.conteudo as never })),
  })
  console.log(`   gravado`)
}

console.log(`\n${MODULOS_T2.length} módulo(s) · ${erros} erro(s)${aplicar ? "" : "  (simulação — rode com --aplicar)"}`)
await db.$disconnect()
process.exit(erros === 0 ? 0 : 1)
