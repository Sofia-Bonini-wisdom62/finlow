/**
 * Semeia a trilha escolar de Ensino Fundamental. Idempotente por slug.
 *
 * Roda em SIMULAÇÃO por padrão. Grava só com `--aplicar`, e isso não é
 * cerimônia: o banco deste projeto é o de produção, e o app é testado lá.
 *
 *   node --import tsx scripts/semear-ef.mts             → simula
 *   node --import tsx scripts/semear-ef.mts --aplicar   → grava
 *
 * São 83 módulos em quatro segmentos (ef12, ef35, ef67, ef89). Eles nascem com
 * o `publico` do próprio segmento, e o filtro de leitura é um ALLOWLIST
 * (`where publico = PUBLICO_ATUAL`, hoje "adulto") — então qualquer valor novo
 * fica invisível por construção, sem depender de deploy nenhum.
 *
 * POR QUE ESTE ARQUIVO DEMOROU A EXISTIR
 * O conteúdo do EF foi portado (`portar-ef.mts`) e testado (`testar-ef.mts`)
 * mas nunca semeado, porque ninguém escreveu o semeador. Os 83 módulos ficaram
 * seis dias no repositório sem existir no banco, e nada acusou: o teste passa
 * lendo o arquivo, não o banco. Se um dia o EF sumir da Trilha, comece
 * conferindo se este script chegou a rodar.
 */
import { config } from "dotenv"
config({ path: ".env.local" }); config({ path: ".env" })

const { db } = await import("../lib/db.js")
const { MODULOS_EF } = await import("../prisma/modulos-ef.js")
const { chavesCitadas } = await import("../lib/indicadores.js")
const { PUBLICOS, PUBLICO_ATUAL } = await import("../lib/publico.js")

const aplicar = process.argv.includes("--aplicar")
const conhecidos = new Set((await db.indicador.findMany({ select: { chave: true } })).map((i) => i.chave))

let erros = 0

/**
 * A coluna `publico` precisa existir ANTES de gravar.
 *
 * Sem ela as 83 aulas entrariam com o default do Prisma — "adulto" — e
 * apareceriam para todo usuário no mesmo instante. É o gate inteiro perdido
 * por uma coluna ausente.
 */
try {
  await db.$queryRaw`SELECT "publico" FROM "Modulo" LIMIT 1`
} catch {
  console.log('✗ A coluna "publico" não existe em Modulo.')
  console.log("  Rode `pnpm db:push` antes de semear.")
  await db.$disconnect()
  process.exit(1)
}

/**
 * Nenhum módulo escolar pode entrar como adulto.
 *
 * É a única falha catastrófica deste script, e ela é silenciosa: um `publico`
 * errado na fonte não dá erro de banco nem de tipo — só coloca aula de 2º ano
 * na biblioteca de quem está negativado. Conferido ANTES de gravar qualquer
 * linha, para que a checagem não valha só até o módulo em que falhou.
 */
const slugs = new Set<string>(MODULOS_EF.map((m) => m.slug))
const avisos: string[] = []

/** Slugs que existem FORA do EF, com o segmento de cada um — para separar
 *  "aponta para outro segmento" de "aponta para o nada". */
const slugsExternos = new Map<string, string>(
  (await db.modulo.findMany({ select: { slug: true, publico: true } })).map((m) => [m.slug, m.publico])
)

for (const m of MODULOS_EF) {
  if (m.publico === PUBLICO_ATUAL) {
    console.log(`✗ ${m.slug} tem publico="${m.publico}", que é o público do app no ar.`)
    erros++
  }
  if (!(PUBLICOS as readonly string[]).includes(m.publico)) {
    console.log(`✗ ${m.slug} tem publico="${m.publico}", que não existe em lib/publico.ts.`)
    erros++
  }
  /**
   * Pré-requisito que aponta para fora do próprio segmento.
   *
   * Hoje isto é INERTE: quem tranca o corredor é a posição na sequência de
   * `RecomendacaoTrilha` (lib/corredor.ts), e a coluna `preRequisitoSlug` não
   * é lida por nada em runtime. Por isso é aviso, não erro — barrar o seed
   * inteiro por um campo que ninguém consulta seria bloquear 83 módulos por
   * uma anotação.
   *
   * Mas fica avisando, porque a coluna existe exatamente para um dia trancar:
   * no dia em que alguém a ligar, uma aula de 8º/9º que exige uma aula de
   * Ensino Médio vira inalcançável — o pré-requisito mora num segmento que o
   * aluno de fundamental nunca enxerga.
   */
  if (m.preRequisitoSlug && !slugs.has(m.preRequisitoSlug)) {
    const ondeEsta = slugsExternos.get(m.preRequisitoSlug)
    if (ondeEsta) {
      avisos.push(
        `⚠ ${m.slug} [${m.publico}] exige "${m.preRequisitoSlug}", que é do segmento "${ondeEsta}".\n` +
          `    Inerte hoje (nada lê preRequisitoSlug), mas trancaria a aula se a coluna passar a valer.`
      )
    } else {
      console.log(`✗ ${m.slug} exige "${m.preRequisitoSlug}", que não existe em módulo nenhum.`)
      erros++
    }
  }
}
if (avisos.length) {
  console.log("\n" + avisos.join("\n") + "\n")
}
if (erros > 0) {
  console.log(`\n${erros} problema(s) de integridade — nada foi gravado.`)
  await db.$disconnect()
  process.exit(1)
}

const porSegmento = new Map<string, number>()

for (const m of MODULOS_EF) {
  const citadas = [...new Set(chavesCitadas(JSON.stringify(m.telas)))]
  const orfas = citadas.filter((c) => !conhecidos.has(c))
  console.log(
    `${m.publico}  ${String(m.ordem).padStart(2, "0")}. ${m.slug}  ${m.telas.length} telas  ${m.nivel}  ${m.habilidades.join(" ")}`
  )
  if (orfas.length) {
    console.log(`    ✗ indicadores que não existem: ${orfas.join(", ")}`)
    erros++
  }

  const validos = ["conceito", "cenario", "quiz", "input", "resultado"]
  const fora = m.telas.map((t) => t.tipo).filter((t) => !validos.includes(t))
  if (fora.length) {
    console.log(`    ✗ tipo de tela inexistente: ${fora.join(", ")}`)
    erros++
  }

  /**
   * HTML só vale no `headline` — é o único campo renderizado como rich text.
   * Em qualquer outro a tag aparece literal na tela, e isso só se descobre
   * percorrendo o módulo no navegador.
   */
  for (const t of m.telas) {
    const c = t.conteudo as Record<string, unknown>
    const foraDoHeadline = [
      typeof c.corpo === "string" ? c.corpo : "",
      typeof c.rodape === "string" ? c.rodape : "",
      typeof c.subtitulo === "string" ? c.subtitulo : "",
      ...((c.opcoes as { feedback?: string }[] | undefined) ?? []).map((o) => o.feedback ?? ""),
    ]
    if (foraDoHeadline.some((x) => /<\w+>/.test(x))) {
      console.log(`    ✗ tela ${t.ordem}: HTML fora do headline vira texto literal`)
      erros++
    }
  }

  if (!aplicar || orfas.length || fora.length) continue

  // `habilidades` VIRA COLUNA em 11/08/2026 (Finlow para Escolas): era
  // rastreabilidade descartada aqui, agora persiste em Modulo.habilidades —
  // é o que permitirá competência por código BCB. Fica no spread de `dados`.
  const { telas, ...dados } = m
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
      mediacao: t.mediacao ?? null,
    })),
  })
  porSegmento.set(m.publico, (porSegmento.get(m.publico) ?? 0) + 1)
}

if (aplicar && erros === 0) {
  const segmentos = ["ef12", "ef35", "ef67", "ef89"]
  console.log("\nNo banco, depois de gravar:")
  for (const s of segmentos) {
    const [mods, telas] = await Promise.all([
      db.modulo.count({ where: { publico: s } }),
      db.tela.count({ where: { modulo: { publico: s } } }),
    ])
    console.log(`  ${s}  ${String(mods).padStart(3)} módulos · ${String(telas).padStart(4)} telas`)
  }
  const adultos = await db.modulo.count({ where: { publico: PUBLICO_ATUAL } })
  console.log(`  ${PUBLICO_ATUAL}  ${String(adultos).padStart(3)} módulos (intocados)`)
}

console.log(
  `\n${MODULOS_EF.length} módulo(s) · ${erros} erro(s)${aplicar ? "" : "  (simulação — rode com --aplicar)"}`
)
await db.$disconnect()
process.exit(erros === 0 ? 0 : 1)
