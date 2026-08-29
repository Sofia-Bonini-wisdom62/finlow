/**
 * Semeia o curso escolar v2 — conceitos, lições e itens avaliativos.
 *
 * Roda em SIMULAÇÃO por padrão. Grava só com `--aplicar`, e isso não é
 * cerimônia: o banco deste projeto é o de produção.
 *
 *   node --import tsx scripts/semear-curso.mts             → simula
 *   node --import tsx scripts/semear-curso.mts --aplicar   → grava
 *
 * ABORTA ANTES DE ESCREVER QUALQUER LINHA se o contrato estiver quebrado. É a
 * mesma conferência de `scripts/validar-licoes.mts`, pelo mesmo carregador —
 * duas entradas, uma resposta só, para que o ✓ do validador signifique alguma
 * coisa sobre o que entrou no banco.
 *
 * O QUE ESTE SEED NÃO TOCA
 * Nem `Modulo` nem `Tela`. As 321 lições vão para tabelas próprias, e a trilha
 * no ar continua exatamente como está — inclusive os 20 módulos de Ensino
 * Médio cujos slugs se repetem aqui (ver o comentário do bloco v2 no schema).
 * A fusão é passo separado, com o player v2 atrás: `docs/backlog-curso-v2.md`.
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

const { db } = await import("../lib/db.js")
const { carregarCurso } = await import("../lib/licao/carregar.js")
const { custoLicao } = await import("../lib/licao/formatos.js")

const aplicar = process.argv.includes("--aplicar")
const { conceitos, modulos, licoes, erros, avisos } = carregarCurso()

for (const a of avisos) console.log(`⚠ ${a}`)

if (erros.length) {
  console.log(`\n✗ ${erros.length} problema(s) no contrato — nada foi gravado:\n`)
  for (const e of erros.slice(0, 40)) console.log(`   ${e}`)
  if (erros.length > 40) console.log(`   … e mais ${erros.length - 40}`)
  await db.$disconnect()
  process.exit(1)
}

/**
 * A definição do conceito vem da LIÇÃO, não de `conceitos.json`.
 *
 * O índice de currículo traz `frase: null` nos 107 — a frase foi escrita junto
 * com o conteúdo, no `fraseConceito` do encontro 1, que é onde o conceito
 * nasce. Ler do índice gravaria 107 nulos.
 */
const fraseDoConceito = new Map<string, string>()
for (const m of modulos) {
  if (m.encontro !== 1) continue
  const frase = licoes.get(m.slug)?.fraseConceito
  if (frase) fraseDoConceito.set(m.slugBase, frase)
}

const semFrase = conceitos.filter((c) => !fraseDoConceito.has(c.slug)).map((c) => c.slug)

console.log(
  `${conceitos.length} conceitos · ${licoes.size} lições · ` +
    `${[...licoes.values()].reduce((s, l) => s + l.telas.length + l.reserva.length, 0)} itens`
)
if (semFrase.length) console.log(`   ${semFrase.length} conceito(s) sem frase: ${semFrase.join(", ")}`)

if (!aplicar) {
  const porSegmento = new Map<string, { licoes: number; itens: number }>()
  for (const m of modulos) {
    const l = licoes.get(m.slug)!
    const atual = porSegmento.get(m.segmento) ?? { licoes: 0, itens: 0 }
    atual.licoes += 1
    atual.itens += l.telas.length + l.reserva.length
    porSegmento.set(m.segmento, atual)
  }
  for (const [seg, n] of porSegmento) console.log(`   ${seg.padEnd(5)} ${n.licoes} lições · ${n.itens} itens`)
  console.log(`\n✓ contrato íntegro — simulação, nada gravado (rode com --aplicar)`)
  await db.$disconnect()
  process.exit(0)
}

// A tabela precisa existir. Semear antes do `db push` falharia item a item com
// uma mensagem do Postgres, depois de já ter gravado os conceitos.
try {
  await db.$queryRaw`SELECT 1 FROM "Conceito" LIMIT 1`
} catch {
  console.log(`\n✗ A tabela "Conceito" não existe. Rode \`pnpm db:push\` antes de semear.`)
  console.log(`  (o db:push já reaplica o RLS — tabela nova nasce aberta no Supabase)`)
  await db.$disconnect()
  process.exit(1)
}

let nConceitos = 0
for (const c of conceitos) {
  const dados = {
    nome: c.nome,
    segmento: c.segmento,
    frase: fraseDoConceito.get(c.slug) ?? null,
    habilidades: c.habilidades,
    unidade: c.unidade,
    preRequisitos: c.preRequisitos,
  }
  await db.conceito.upsert({ where: { slug: c.slug }, create: { slug: c.slug, ...dados }, update: dados })
  nConceitos += 1
}
console.log(`\n${nConceitos} conceitos gravados`)

/**
 * Itens são RECRIADOS, nunca casados um a um.
 *
 * Editar conteúdo de lição é reescrever a lição — a mesma decisão que
 * `scripts/semear-em.mts` tomou para as telas. Um diff de JSON item a item
 * precisaria de identidade estável dentro do arquivo, que não existe: os itens
 * são posicionais.
 */
let nLicoes = 0
let nItens = 0
const buffer: {
  licaoId: string
  reserva: boolean
  ordem: number
  papel: string
  formato: string
  conceitoId: string
  dificuldade: number | null
  conteudo: unknown
}[] = []

const descarregar = async () => {
  if (!buffer.length) return
  await db.itemAvaliativo.createMany({ data: buffer as never })
  nItens += buffer.length
  buffer.length = 0
}

for (const m of modulos) {
  const l = licoes.get(m.slug)!
  const dados = {
    titulo: m.titulo,
    segmento: m.segmento,
    conceitoSlug: m.slugBase,
    encontro: m.encontro,
    tipoEncontro: m.tipoEncontro,
    dificuldadeAlvo: m.dificuldadeAlvo,
    ordem: m.ordem,
    blocoId: m.blocoId,
    blocoRotulo: m.blocoRotulo,
    nivel: m.nivel,
    habilidades: m.habilidades,
    conceitoPrincipal: l.conceitoPrincipal,
    custoSeg: custoLicao(l.telas.map((t) => t.formato)),
  }
  const salva = await db.licaoCurso.upsert({
    where: { slug: m.slug },
    create: { slug: m.slug, ...dados },
    update: dados,
  })
  await db.itemAvaliativo.deleteMany({ where: { licaoId: salva.id } })

  const guardar = (itens: typeof l.telas, reserva: boolean) =>
    itens.forEach((t, i) =>
      buffer.push({
        licaoId: salva.id,
        reserva,
        ordem: i + 1,
        papel: t.papel,
        formato: t.formato,
        conceitoId: t.conceitoId,
        dificuldade: t.dificuldade ?? null,
        conteudo: t,
      })
    )
  guardar(l.telas, false)
  guardar(l.reserva, true)

  nLicoes += 1
  // Em lotes: 5.268 linhas num createMany só estouram o limite de parâmetros
  // do Postgres, e uma ida ao banco por item seriam 5.268 viagens.
  if (buffer.length >= 900) await descarregar()
}
await descarregar()

console.log(`${nLicoes} lições gravadas · ${nItens} itens gravados`)

const [c, li, it, res] = await Promise.all([
  db.conceito.count(),
  db.licaoCurso.count(),
  db.itemAvaliativo.count(),
  db.itemAvaliativo.count({ where: { reserva: true } }),
])
console.log(`\nNo banco: ${c} conceitos · ${li} lições · ${it} itens (${res} de reserva)`)

const [modulosIntactos, telasIntactas] = await Promise.all([db.modulo.count(), db.tela.count()])
console.log(`Trilha antiga, intocada: ${modulosIntactos} módulos · ${telasIntactas} telas`)

await db.$disconnect()
