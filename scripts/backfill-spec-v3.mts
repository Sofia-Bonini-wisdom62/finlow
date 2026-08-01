/**
 * Dá às contas que já existem o que a SPEC v3 passou a criar.
 *
 * POR QUE PRECISA
 * O pipeline (§2.7) roda no fim de uma primeira conversa NOVA. Quem já tinha
 * concluído o onboarding é mandado direto para o chat e nunca passa por ele —
 * então ficou sem linha de Onboarding, sem nível, sem trilha gravada, sem
 * insight e com zero ponto, apesar de ter aulas concluídas. Do lado de dentro
 * do app isso não parece "recurso novo ainda não alcançou você", parece
 * quebrado.
 *
 * SEGURANÇA
 * Roda quantas vezes quiser. Tudo aqui é idempotente por construção, não por
 * flag: `creditar` esbarra na chave única, `garantirLevaInicial` só semeia
 * quando não há nada, e o pipeline refaz upsert. Rodar duas vezes tem de
 * terminar igual a rodar uma, e o relatório do fim mostra isso.
 *
 *   node --import tsx scripts/backfill-spec-v3.mts --simular   (não grava)
 *   node --import tsx scripts/backfill-spec-v3.mts
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

const { db } = await import("../lib/db.js")
const { creditar } = await import("../lib/pontos.js")
const { garantirLevaInicial } = await import("../lib/recomendacao.js")
const { rodarPipeline } = await import("../lib/onboarding/pipeline.js")

const simular = process.argv.includes("--simular")

/**
 * Lançamento antigo NÃO é creditado, de propósito.
 *
 * São 551 transações no banco. Creditadas, engoliriam tudo o mais, e o teto
 * diário conta pela data do EVENTO, não da transação: as 551 tentariam entrar
 * hoje e 10 passariam. O ponto de lançamento existe para premiar o hábito de
 * registrar, e hábito não se premia retroativamente. Aula concluída é outra
 * coisa: é conquista, e continua valendo.
 */
async function creditarAulasAntigas(userId: string): Promise<number> {
  const feitos = await db.progressoModulo.findMany({
    where: { userId, concluido: true },
    select: { moduloId: true },
  })
  let novos = 0
  for (const f of feitos) {
    if (simular) { novos++; continue }
    const r = await creditar(userId, "modulo_concluido", f.moduloId)
    if (r.creditado) novos++
  }
  return novos
}

async function trilhaDoPerfil(userId: string): Promise<string[]> {
  const perfil = await db.perfil.findUnique({ where: { userId }, select: { tipo: true } })
  const modulos = await db.modulo.findMany({
    where: { tipoPerfil: perfil?.tipo ?? "lancador" },
    select: { slug: true },
    orderBy: { ordem: "asc" },
  })
  return modulos.map((m) => m.slug)
}

const contas = await db.user.findMany({
  select: { id: true, email: true, nome: true, onboardingEm: true, pontos: true },
  orderBy: { criadoEm: "asc" },
})

console.log(`${contas.length} contas${simular ? "  (SIMULAÇÃO, nada é gravado)" : ""}\n`)

let comAula = 0
let comPipeline = 0

for (const c of contas) {
  const quem = c.nome || c.email
  const aulas = await creditarAulasAntigas(c.id)
  if (aulas) comAula++

  // Só quem já concluiu o onboarding. Quem não concluiu vai passar pelo
  // pipeline pelo caminho normal, e rodar agora tiraria dela justamente a
  // tela que mostra o processamento acontecendo.
  let passos = ""
  if (c.onboardingEm && !simular) {
    // Semeia a trilha ANTES do pipeline, marcada como já entregue: esta pessoa
    // não é nova e não deve receber "montei a sua trilha" no chat como se
    // fosse o primeiro dia. A chamada do pipeline vira no-op.
    await garantirLevaInicial(c.id, await trilhaDoPerfil(c.id), { jaEntregue: true })

    const feitos: string[] = []
    for await (const p of rodarPipeline(c.id)) {
      feitos.push(`${p.id}${p.ok ? "" : "!"}`)
    }
    passos = feitos.join(" ")
    comPipeline++
  } else if (c.onboardingEm) {
    passos = "(rodaria o pipeline)"
    comPipeline++
  }

  console.log(
    `  ${quem.padEnd(28).slice(0, 28)} ${String(aulas).padStart(2)} aula(s)  ${passos}`
  )
}

// ------------------------------------------------------------- relatório ---
const depois = {
  linhas_Onboarding: await db.onboarding.count(),
  contas_com_pontos: await db.user.count({ where: { pontos: { gt: 0 } } }),
  eventos_de_ponto: await db.eventoPontuacao.count(),
  insights: await db.insight.count(),
  recomendacoes: await db.recomendacaoTrilha.count(),
}

console.log(`\n${simular ? "SIMULAÇÃO — como ficaria" : "DEPOIS"}`)
for (const [k, v] of Object.entries(depois)) console.log(`  ${String(v).padStart(5)} ${k}`)
console.log(`\n${comAula} contas ganharam ponto por aula, ${comPipeline} passaram pelo pipeline`)

// O cache de pontos tem de bater com a soma dos eventos, sempre. Se não bater,
// é sinal de que uma transação caiu no meio e o total está mentindo.
const soma = await db.eventoPontuacao.aggregate({ _sum: { pontos: true } })
const cache = await db.user.aggregate({ _sum: { pontos: true } })
const bate = (soma._sum.pontos ?? 0) === (cache._sum.pontos ?? 0)
console.log(
  `\n${bate ? "✓" : "✗"} soma dos eventos ${soma._sum.pontos ?? 0} ` +
  `vs total nas contas ${cache._sum.pontos ?? 0}`
)

await db.$disconnect()
process.exit(bate ? 0 : 1)
