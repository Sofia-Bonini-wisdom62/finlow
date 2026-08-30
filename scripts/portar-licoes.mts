/**
 * Transforma o material bruto da nova base de lições (`prisma/seeds/`, chegado
 * pronto em 20/08/2026 — ver "Nova base de lições" em docs/backlog-produto.md)
 * no array pronto para `scripts/semear-licoes.mts`. Mecânico, sem decisão
 * editorial: o conteúdo já veio pronto e validado (`scripts/validar-tudo.ts`
 * roda limpo, 321/321), então não existe aqui um `editorial-em.ts` — é só
 * reformatar. Molde de `scripts/portar-em.mts` → `prisma/modulos-em.ts`.
 *
 *   node --import tsx scripts/portar-licoes.mts
 *
 * Valida TODAS as 321 lições contra `lib/licao/validar.ts` antes de gerar
 * qualquer coisa — para no primeiro erro, nada é escrito pela metade.
 * Emite `prisma/modulos-licoes.ts` (ARQUIVO GERADO, não editar à mão).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs"

const { validarLicao } = await import("../lib/licao/validar.js")

interface Conceito {
  slug: string
  nome: string
  segmento: string
  habilidades: string[]
  unidade: string
}

interface ModuloFonte {
  slug: string
  titulo: string
  segmento: string
  serie: string | null
  blocoId: string
  blocoRotulo: string
  nivel: string
  conceitoPrincipal: string
  encontro: number
  ordem: number
}

const DIR_LICOES = "prisma/seeds/licoes"
const conceitos: Conceito[] = JSON.parse(readFileSync("prisma/seeds/dados/conceitos.json", "utf8"))
const modulos: ModuloFonte[] = JSON.parse(readFileSync("prisma/seeds/dados/modulos.json", "utf8"))
const porConceito = new Map(conceitos.map((c) => [c.slug, c]))

const POR_NIVEL: Record<string, number> = { iniciante: 30, intermediario: 40, avancado: 50 }

/**
 * Os 7 segmentos da fonte → os públicos que `lib/publico.ts` já conhece.
 * `em1`/`em2`/`em3` caem no bucket único `"em"` — decisão de escopo desta
 * integração (ver `docs/backlog-produto.md`): a granularidade fina do
 * Ensino Médio tocaria `CompetenciaProfessor`/`app/escola`, superfície viva
 * demais para entrar no mesmo commit do conteúdo. Nada aqui impede abrir os
 * 3 públicos depois — é adiar, não perder.
 */
const PUBLICO_DO_SEGMENTO: Record<string, string> = {
  ef12: "ef12", ef35: "ef35", ef67: "ef67", ef89: "ef89",
  em1: "em", em2: "em", em3: "em",
}

/**
 * `ordem` na fonte é POR SEGMENTO (um em3 real trazia `ordem: 12`, não
 * 260+). Como em1/em2/em3 caem no MESMO bucket `"em"` (acima), usar o
 * `ordem` cru misturaria os 3 anos no corredor. O offset garante em1 < em2 <
 * em3 sem depender de nenhuma suposição sobre o tamanho de cada um — 1000 é
 * folga de sobra para os ~30 módulos que cada segmento tem hoje.
 */
const OFFSET_ORDEM: Record<string, number> = { em1: 0, em2: 1000, em3: 2000 }

let erros = 0
const linhas: string[] = []

for (const m of modulos) {
  const caminho = `${DIR_LICOES}/${m.slug}.json`
  if (!existsSync(caminho)) {
    console.log(`✗ ${m.slug}: ${caminho} não existe`)
    erros++
    continue
  }

  let licao: { slug: string; segmento: string; conceitoPrincipal: string; telas: unknown[]; reserva: unknown[] }
  try {
    licao = JSON.parse(readFileSync(caminho, "utf8"))
  } catch (e) {
    console.log(`✗ ${m.slug}: JSON inválido — ${(e as Error).message}`)
    erros++
    continue
  }

  const problemas = validarLicao(licao as never)
  if (problemas.length) {
    console.log(`✗ ${m.slug}\n   ${problemas.join("\n   ")}`)
    erros++
    continue
  }

  const conceito = porConceito.get(m.conceitoPrincipal)
  if (!conceito) {
    console.log(`✗ ${m.slug}: conceito "${m.conceitoPrincipal}" não existe em conceitos.json`)
    erros++
    continue
  }

  const publico = PUBLICO_DO_SEGMENTO[m.segmento]
  if (!publico) {
    console.log(`✗ ${m.slug}: segmento "${m.segmento}" sem mapeamento de público`)
    erros++
    continue
  }

  const telas = licao.telas as { papel: string; formato: string }[]
  const reserva = licao.reserva as { papel: string; formato: string }[]

  linhas.push(
    JSON.stringify({
      slug: m.slug,
      titulo: m.titulo,
      subtitulo: conceito.unidade,
      // Campo legado sem leitor na trilha escolar — o mesmo valor que
      // prisma/modulos-em.ts usa (o público, não uma persona).
      tipoPerfil: publico,
      ordem: (OFFSET_ORDEM[m.segmento] ?? 0) + m.ordem,
      pontos: POR_NIVEL[m.nivel] ?? 30,
      blocoId: m.blocoId,
      blocoRotulo: m.blocoRotulo,
      nivel: m.nivel,
      situacoes: [],
      publico,
      serie: m.serie,
      // habilidadesRef do CONCEITO, não o `habilidades` do arquivo da lição
      // (só vem preenchido no encontro 1) — as 3 linhas de um conceito
      // precisam declarar a mesma cobertura, senão scripts/testar-matriz.mts
      // perderia 2/3 dela por módulo.
      habilidades: conceito.habilidades,
      formato: "item",
      conceitoId: m.conceitoPrincipal,
      encontro: m.encontro,
      itens: [
        ...telas.map((t, i) => ({ ...t, ordem: i })),
        ...reserva.map((t, i) => ({ ...t, ordem: telas.length + i })),
      ],
    })
  )
}

if (erros) {
  console.log(`\n${erros} erro(s) — nada foi gerado.`)
  process.exit(1)
}

const cabecalho =
  "// ARQUIVO GERADO por scripts/portar-licoes.mts — não editar à mão.\n" +
  "// Fonte: prisma/seeds/{dados,licoes}/ (branch feat/base-licoes-escolares, 20/08/2026).\n\n"
writeFileSync(
  "prisma/modulos-licoes.ts",
  `${cabecalho}export const MODULOS_LICOES = [\n${linhas.map((l) => `  ${l},`).join("\n")}\n]\n`
)

console.log(`\n${modulos.length} lições portadas · prisma/modulos-licoes.ts escrito.`)
