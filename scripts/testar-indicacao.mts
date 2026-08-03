/**
 * Testa o programa de indicação de ponta a ponta no banco.
 *
 * O QUE PRECISA SER VERDADE
 * - código nasce uma vez e é estável;
 * - autoindicação e indicação dupla não criam vínculo;
 * - ativar paga os DOIS lados uma vez só, mesmo repetindo;
 * - ativar sem indicação é um não-acontecimento, não um erro;
 * - apagar a conta do indicado leva o vínculo (Cascade) mas NÃO desfaz os
 *   pontos já pagos ao indicador — crédito é evento, não estado derivado.
 *
 *   node --import tsx scripts/testar-indicacao.mts
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

const { db } = await import("../lib/db.js")
const { garantirCodigo, vincularIndicacao, ativarIndicacaoSeHouver, resumoIndicacoes, FORMATO_CODIGO } =
  await import("../lib/indicacao.js")
const { PONTOS_POR_MOTIVO } = await import("../lib/pontos.js")

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

// Varre a FAMÍLIA inteira, não só esta execução — órfão de processo morto
// no meio de uma execução anterior não pode ficar para sempre no banco.
const familia = "teste-indicacao-"
async function varrerDescartaveis(): Promise<number> {
  const orfaos = await db.user.findMany({
    where: { email: { startsWith: familia, endsWith: "@exemplo.invalido" } },
    select: { id: true },
  })
  if (orfaos.length) {
    await db.user.deleteMany({ where: { id: { in: orfaos.map((o) => o.id) } } })
  }
  return orfaos.length
}

const marca = `${familia}${Date.now()}`

try {
  const antes = await varrerDescartaveis()
  if (antes) console.log(`[limpeza] ${antes} descartável(is) de execuções anteriores\n`)

  const a = await db.user.create({ data: { email: `${marca}-a@exemplo.invalido`, nome: "Indicador" } })
  const b = await db.user.create({ data: { email: `${marca}-b@exemplo.invalido`, nome: "Indicado" } })
  const c = await db.user.create({ data: { email: `${marca}-c@exemplo.invalido`, nome: "Terceiro" } })

  // ------------------------------------------------------------- código ---
  console.log("CÓDIGO")
  const codigo = await garantirCodigo(a.id)
  checar("código tem o formato do link", FORMATO_CODIGO.test(codigo), codigo)
  checar("segundo pedido devolve o MESMO código", (await garantirCodigo(a.id)) === codigo)

  // ------------------------------------------------------------ vínculo ---
  console.log("\nVÍNCULO")
  checar("autoindicação não vincula", !(await vincularIndicacao(a.id, codigo)))
  checar("código inexistente não vincula", !(await vincularIndicacao(b.id, "zzzzzzzz")))
  checar("código em MAIÚSCULA vincula (normaliza)", await vincularIndicacao(b.id, codigo.toUpperCase()))
  checar("segunda indicação da mesma pessoa não vincula", !(await vincularIndicacao(b.id, await garantirCodigo(c.id))))

  const vinculo = await db.indicacao.findUnique({ where: { indicadoId: b.id } })
  checar("vínculo nasce 'cadastrado', sem pontos", vinculo?.status === "cadastrado" && !vinculo.ativadoEm)

  // ----------------------------------------------------------- ativação ---
  console.log("\nATIVAÇÃO")
  await ativarIndicacaoSeHouver(c.id) // c não tem indicação
  checar("ativar sem indicação não explode nem cria nada",
    (await db.indicacao.count({ where: { indicadoId: c.id } })) === 0)

  await ativarIndicacaoSeHouver(b.id)
  await ativarIndicacaoSeHouver(b.id) // repetição: refazer o onboarding
  const depois = await db.indicacao.findUnique({ where: { indicadoId: b.id } })
  checar("status virou 'ativado' com data", depois?.status === "ativado" && !!depois.ativadoEm)

  const pontosA = (await db.user.findUnique({ where: { id: a.id }, select: { pontos: true } }))?.pontos
  const pontosB = (await db.user.findUnique({ where: { id: b.id }, select: { pontos: true } }))?.pontos
  checar(`indicador ganhou ${PONTOS_POR_MOTIVO.indicacao_ativada}, uma vez`,
    pontosA === PONTOS_POR_MOTIVO.indicacao_ativada, `pontos=${pontosA}`)
  checar(`indicado ganhou ${PONTOS_POR_MOTIVO.indicado_ativado}, uma vez`,
    pontosB === PONTOS_POR_MOTIVO.indicado_ativado, `pontos=${pontosB}`)

  const resumo = await resumoIndicacoes(a.id)
  checar("resumo conta 1 cadastrada / 1 ativada",
    resumo.cadastradas === 1 && resumo.ativadas === 1, JSON.stringify(resumo))

  // ------------------------------------------------------------ cascade ---
  console.log("\nCASCADE")
  await db.user.delete({ where: { id: b.id } })
  checar("apagar o indicado leva o vínculo", (await db.indicacao.count({ where: { indicadoId: b.id } })) === 0)
  const pontosDepois = (await db.user.findUnique({ where: { id: a.id }, select: { pontos: true } }))?.pontos
  checar("pontos do indicador sobrevivem", pontosDepois === PONTOS_POR_MOTIVO.indicacao_ativada, `pontos=${pontosDepois}`)
} finally {
  const varridos = await varrerDescartaveis()
  console.log(`\n[limpeza] ${varridos} usuário(s) descartável(is) removido(s)`)
  await db.$disconnect()
}

console.log(falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`)
process.exit(falhas === 0 ? 0 : 1)
