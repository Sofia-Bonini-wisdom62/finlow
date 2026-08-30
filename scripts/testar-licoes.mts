/**
 * Confere a nova base de lições SEM banco: que `prisma/modulos-licoes.ts`
 * (gerado por `scripts/portar-licoes.mts`) bate contagem com a fonte crua
 * (`prisma/seeds/{dados,licoes}/`), e que todo módulo tem a forma que o
 * schema e o player esperam. Roda antes de qualquer `db:push`/seed — se isto
 * quebrar, rodar o seed só gravaria o mesmo defeito no banco.
 *
 *   node --import tsx scripts/testar-licoes.mts
 */
import { readFileSync } from "node:fs"

const { validarLicao } = await import("../lib/licao/validar.js")
const { MODULOS_LICOES } = await import("../prisma/modulos-licoes.js")

let falhas = 0
function falhar(onde: string, msg: string) {
  console.log(`✗ ${onde}: ${msg}`)
  falhas++
}

// ---- 1. contagens que a promessa do backlog faz por extenso ----
const conceitos = JSON.parse(readFileSync("prisma/seeds/dados/conceitos.json", "utf8")) as unknown[]
const totalItens = MODULOS_LICOES.reduce((s, m) => s + m.itens.length, 0)
const totalReserva = MODULOS_LICOES.reduce((s, m) => s + m.itens.filter((i) => i.papel === "reserva").length, 0)
const totalTelas = totalItens - totalReserva

console.log(
  `${conceitos.length} conceitos · ${MODULOS_LICOES.length} lições · ${totalItens} itens ` +
    `(${totalTelas} telas + ${totalReserva} reserva)`
)
if (conceitos.length !== 107) falhar("conceitos.json", `${conceitos.length} conceitos, esperado 107`)
if (MODULOS_LICOES.length !== 321) falhar("modulos-licoes.ts", `${MODULOS_LICOES.length} lições, esperado 321`)
if (totalReserva !== 963) falhar("reserva", `${totalReserva} itens de reserva, esperado 963 (3 × 321)`)

// ---- 2. cada lição valida de novo contra o contrato ----
// (portar-licoes.mts já validou antes de gerar; validar de novo aqui pega o
// caso "o gerado divergiu do validador depois de gerado", não só "a fonte
// era boa".)
for (const m of MODULOS_LICOES) {
  const telas = m.itens.filter((i) => i.papel !== "reserva")
  const reserva = m.itens.filter((i) => i.papel === "reserva")
  const problemas = validarLicao({
    slug: m.slug,
    // `publico` já É o segmento pra ef12/35/67/89 (mapeamento 1:1). Só o
    // Ensino Médio perdeu granularidade ("em" cobre em1/2/3), mas os 3
    // usam a mesma composição de 15 telas — `composicaoDe("em")` cai no
    // default e valida igual.
    segmento: m.publico,
    conceitoPrincipal: m.conceitoId ?? "",
    telas: telas as never,
    reserva: reserva as never,
  })
  if (problemas.length) falhar(m.slug, problemas.join(" · "))
}

// ---- 3. o que o schema e o player exigem, além do que o validador de
// conteúdo já cobre (ele não sabe que Modulo/ItemLicao existem) ----
const formatosConhecidos = new Set(["binaria", "escolha3", "classificar", "ordenar", "estimativa", "fecho"])
for (const m of MODULOS_LICOES) {
  if (!m.slug || !m.titulo) falhar(m.slug || "(sem slug)", "sem slug ou título")
  if (!["ef12", "ef35", "ef67", "ef89", "em"].includes(m.publico)) {
    falhar(m.slug, `publico "${m.publico}" fora do vocabulário de lib/publico.ts`)
  }
  if (m.formato !== "item") falhar(m.slug, `formato "${m.formato}", esperado "item"`)
  if (![1, 2, 3].includes(m.encontro)) falhar(m.slug, `encontro ${m.encontro}, esperado 1, 2 ou 3`)

  const ordens = m.itens.map((i) => i.ordem)
  if (new Set(ordens).size !== ordens.length) falhar(m.slug, "itens com ordem repetida")

  for (const item of m.itens) {
    if (!formatosConhecidos.has(item.formato)) {
      falhar(m.slug, `item de formato desconhecido: ${item.formato}`)
    }
  }
}

// ---- 4. dentro de um conceito, os 3 encontros ficam em ordem no corredor ----
// O corredor trava MÓDULO a MÓDULO por `ordem` ascendente — se o encontro 2
// de um conceito tivesse `ordem` menor que o 1, a "revisão" abriria antes da
// "apresentação". É a mesma checagem que garante que em1/em2/em3 (que caem
// juntos no bucket "em" — decisão de escopo) não se embaralham: o offset de
// `scripts/portar-licoes.mts` (OFFSET_ORDEM) só funciona se, DENTRO de cada
// conceito, a ordem por encontro também for crescente.
const porConceito = new Map<string, typeof MODULOS_LICOES[number][]>()
for (const m of MODULOS_LICOES) {
  const grupo = porConceito.get(m.conceitoId ?? "") ?? []
  grupo.push(m)
  porConceito.set(m.conceitoId ?? "", grupo)
}
for (const [conceitoId, grupo] of porConceito) {
  const porEncontro = [...grupo].sort((a, b) => a.encontro - b.encontro)
  for (let i = 1; i < porEncontro.length; i++) {
    if (porEncontro[i].ordem <= porEncontro[i - 1].ordem) {
      falhar(
        conceitoId,
        `encontro ${porEncontro[i].encontro} (ordem ${porEncontro[i].ordem}) não vem depois do ` +
          `encontro ${porEncontro[i - 1].encontro} (ordem ${porEncontro[i - 1].ordem})`
      )
    }
  }
}

console.log(`\n${MODULOS_LICOES.length - falhas} lições ok · ${falhas} com problema`)
process.exit(falhas === 0 ? 0 : 1)
