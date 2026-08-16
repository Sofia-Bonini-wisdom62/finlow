/**
 * Testa as guardas dos pontos e do ranking.
 *
 * POR QUE ISTO EXISTE
 * A spec diz que a chave única (userId, motivo, refId) impede farmar. Ela não
 * impedia: no Postgres dois NULL não colidem num índice único, então todo
 * motivo sem referência natural — "onboarding", justamente — creditava de novo
 * a cada repetição, em silêncio e sem erro. Só dá para ver isso falando com o
 * banco, e por isso este teste fala.
 *
 * Cria um usuário descartável, exercita as regras e apaga no fim, inclusive se
 * algo falhar no meio.
 *
 *   node --import tsx scripts/testar-pontos.mts
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

const { db } = await import("../lib/db.js")
const { creditar, recalcularTotal, listarRanking, apelidoValido, inicioDoDiaSP, SEM_REF,
  pontosPorConclusao, ajustarPorPublico, PESO_FORA_DA_TRILHA } = await import("../lib/pontos.js")

let falhas = 0
/**
 * Varre a FAMÍLIA inteira, não só esta execução.
 *
 * Os testes criam usuário no banco de produção — não há banco separado. O
 * `finally` cobre o caso normal, mas não cobre processo morto no meio, e a
 * conferência antiga só olhava a marca desta execução: órfão de uma execução
 * anterior ficava lá para sempre. Sete ficaram, e só apareceram porque fui
 * olhar outra coisa.
 */
async function varrerDescartaveis(familia: string): Promise<number> {
  const orfaos = await db.user.findMany({
    where: { email: { startsWith: familia, endsWith: "@exemplo.invalido" } },
    select: { id: true },
  })
  if (orfaos.length) {
    await db.user.deleteMany({ where: { id: { in: orfaos.map((o) => o.id) } } })
  }
  return orfaos.length
}

function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

const marca = `teste-pontos-${Date.now()}`
let userId = ""
let outroId = ""

try {
  const u = await db.user.create({ data: { email: `${marca}@exemplo.invalido`, nome: "Teste" } })
  userId = u.id

  // ---------------------------------------------------------- idempotência ---
  console.log("IDEMPOTÊNCIA")

  const c1 = await creditar(userId, "modulo_concluido", "modulo-x")
  const c2 = await creditar(userId, "modulo_concluido", "modulo-x")
  // Sem valor custom, credita o TETO da tabela — que passou de 30 para 50
  // quando o valor do módulo virou 30/40/50 por nível.
  checar("primeiro crédito entra", c1.creditado && c1.pontos === 50, `total=${c1.total}`)
  checar("repetir o mesmo módulo não credita", !c2.creditado, `total=${c2.total}`)
  checar("total não subiu na repetição", c1.total === c2.total, `${c1.total} vs ${c2.total}`)

  // Este é o caso que estava furado antes de refId virar não-nulo.
  const o1 = await creditar(userId, "onboarding")
  const o2 = await creditar(userId, "onboarding")
  const nOnb = await db.eventoPontuacao.count({ where: { userId, motivo: "onboarding" } })
  checar("onboarding credita uma vez", o1.creditado && o1.pontos === 50)
  checar("refazer o onboarding NÃO credita de novo", !o2.creditado)
  checar("existe uma única linha de onboarding", nOnb === 1, `linhas=${nOnb}`)
  checar("o sentinela foi gravado, não NULL", (await db.eventoPontuacao.findFirst({
    where: { userId, motivo: "onboarding" }, select: { refId: true },
  }))?.refId === SEM_REF)

  // Módulo diferente é trabalho diferente: tem de creditar.
  const c3 = await creditar(userId, "modulo_concluido", "modulo-y")
  checar("outro módulo credita normalmente", c3.creditado, `total=${c3.total}`)

  // ------------------------------------------------ pontos proporcionais ---
  console.log("\nPONTOS PROPORCIONAIS AO ACERTO")

  // Sem o valor do módulo, o default é o PISO da escala (30) e não o teto:
  // chamador que esquece o argumento não pode premiar por engano.
  checar("sem quiz vale cheio", pontosPorConclusao(0, 0) === 30, `${pontosPorConclusao(0, 0)}`)
  checar("1 de 1 vale cheio", pontosPorConclusao(1, 1) === 30, `${pontosPorConclusao(1, 1)}`)
  checar("0 de 1 vale o piso", pontosPorConclusao(0, 1) === 10, `${pontosPorConclusao(0, 1)}`)
  checar("1 de 2 vale o meio", pontosPorConclusao(1, 2) === 20, `${pontosPorConclusao(1, 2)}`)
  checar("acertos acima do total não estouram", pontosPorConclusao(5, 2) === 30)
  checar("acertos negativos não afundam", pontosPorConclusao(-3, 2) === 10)

  // ---- o valor vem do MÓDULO (30/40/50 por nível) ----
  checar("módulo de 50 sem quiz paga 50", pontosPorConclusao(0, 0, 50) === 50, `${pontosPorConclusao(0, 0, 50)}`)
  checar("módulo de 50 acertando tudo paga 50", pontosPorConclusao(2, 2, 50) === 50)
  checar("módulo de 50 errando tudo paga 1/3", pontosPorConclusao(0, 2, 50) === 17, `${pontosPorConclusao(0, 2, 50)}`)
  checar("módulo de 40 acertando tudo paga 40", pontosPorConclusao(1, 1, 40) === 40)
  checar("módulo de 40 pela metade fica no meio", pontosPorConclusao(1, 2, 40) === 27, `${pontosPorConclusao(1, 2, 40)}`)
  // O teto da tabela continua sendo o limite duro de qualquer chamador.
  checar("módulo pedindo acima do teto é cortado", pontosPorConclusao(1, 1, 999) === 50, `${pontosPorConclusao(1, 1, 999)}`)
  checar("módulo com valor negativo não vira crédito", pontosPorConclusao(1, 1, -10) === 0)

  // O override é TETO, não substituto: ninguém infla ponto por ele.
  const cProp = await creditar(userId, "modulo_concluido", "modulo-prop", 10)
  checar("crédito proporcional grava o valor menor", cProp.creditado && cProp.pontos === 10)
  const cInflado = await creditar(userId, "modulo_concluido", "modulo-inflado", 999)
  checar("tentar creditar acima da tabela é cortado no teto",
    cInflado.creditado && cInflado.pontos === 50, `${cInflado.pontos}`)

  // ----------------------------------------------------------------- teto ---
  console.log("\nTETO DIÁRIO")

  let creditados = 0
  for (let i = 0; i < 13; i++) {
    const r = await creditar(userId, "lancamento_confirmado", `lanc-${i}`)
    if (r.creditado) creditados++
  }
  checar("para no teto de 10 por dia", creditados === 10, `creditou ${creditados} de 13`)

  const ultimo = await creditar(userId, "lancamento_confirmado", "lanc-99")
  checar("depois do teto avisa noTeto", ultimo.noTeto === true && !ultimo.creditado)

  // O teto conta o dia de São Paulo. Se estivesse contando dia UTC, um evento
  // gravado às 22h de Brasília cairia no dia seguinte e o teto reiniciaria.
  const inicio = inicioDoDiaSP(new Date("2026-08-01T02:00:00Z"))
  checar(
    "01/08 02:00 UTC ainda é 31/07 em São Paulo",
    inicio.toISOString() === "2026-07-31T03:00:00.000Z",
    inicio.toISOString()
  )

  // ---------------------------------------------------------------- cache ---
  console.log("\nTOTAL")

  const somaEventos = await db.eventoPontuacao.aggregate({ where: { userId }, _sum: { pontos: true } })
  const cache = (await db.user.findUnique({ where: { id: userId }, select: { pontos: true } }))?.pontos
  checar("cache bate com a soma dos eventos", cache === somaEventos._sum.pontos, `${cache} vs ${somaEventos._sum.pontos}`)

  // Cache corrompido na mão volta ao certo pelo recálculo.
  await db.user.update({ where: { id: userId }, data: { pontos: 99999 } })
  const recalculado = await recalcularTotal(userId)
  checar("recálculo conserta o cache", recalculado === somaEventos._sum.pontos, `${recalculado}`)

  // -------------------------------------------------------------- ranking ---
  console.log("\nRANKING")

  const outro = await db.user.create({
    data: { email: `${marca}-outro@exemplo.invalido`, nome: "Outro", pontos: 9999 },
  })
  outroId = outro.id

  // Sem opt-in ninguém aparece, nem quem tem mais pontos que todo mundo.
  await db.user.update({ where: { id: userId }, data: { rankingOptIn: true, apelido: `eu-${marca}` } })
  const lista = await listarRanking(userId)
  checar("quem deu opt-in aparece", lista.some((l) => l.apelido === `eu-${marca}`))
  checar("quem NÃO deu opt-in fica de fora", !lista.some((l) => l.pontos === 9999))
  checar("a linha de quem olha vem marcada", lista.find((l) => l.apelido === `eu-${marca}`)?.euMesmo === true)

  // O que sai daqui é só apelido e pontos.
  const campos = Object.keys(lista[0] ?? {}).sort().join(",")
  checar("nenhum campo além do previsto", campos === "apelido,euMesmo,pontos,posicao", campos)

  // Sair some na hora.
  await db.user.update({ where: { id: userId }, data: { rankingOptIn: false } })
  const depois = await listarRanking(userId)
  checar("sair remove da listagem", !depois.some((l) => l.apelido === `eu-${marca}`))

  // -------------------------------------------------------------- apelido ---
  console.log("\nAPELIDO")

  const casos: [string, boolean, string][] = [
    ["Sofia", true, "nome normal"],
    ["ana.paula_92", true, "com ponto, número e underline"],
    ["Zé Ninguém", true, "com acento e espaço"],
    ["a", false, "curto demais"],
    ["a".repeat(21), false, "longo demais"],
    ["sofia@gmail.com", false, "e-mail identifica fora do app"],
    ["@sofia", false, "arroba"],
    ["  ", false, "só espaço"],
    ["<script>", false, "caractere fora da lista"],
  ]
  for (const [entrada, esperado, nota] of casos) {
    checar(nota, apelidoValido(entrada).ok === esperado, `"${entrada}"`)
  }
  checar("espaço sobrando é normalizado", (() => {
    const r = apelidoValido("  Ana   Paula  ")
    return r.ok && r.apelido === "Ana Paula"
  })())

  // ------------------------------------------------- peso fora da trilha ---
  // A regra que sustenta a justiça do ranking (adulto explorando escolar vale
  // 1/4) era a única do módulo sem teste. Desde 11/08/2026 ela é RELATIVA ao
  // público da pessoa (Finlow para Escolas): o aluno paga cheio no próprio
  // segmento e 1/4 na aula adulta — o espelho exato.
  console.log("\nPESO FORA DA TRILHA")

  checar("adulto na aula adulta paga cheio", ajustarPorPublico(40, "adulto") === 40)
  checar(
    "adulto na aula escolar paga metade",
    ajustarPorPublico(40, "ef35") === Math.round(40 * PESO_FORA_DA_TRILHA)
  )
  checar("aluno de EM na aula de EM paga cheio", ajustarPorPublico(40, "em", "em") === 40)
  checar(
    "aluno de EM na aula adulta paga metade",
    ajustarPorPublico(40, "adulto", "em") === Math.round(40 * PESO_FORA_DA_TRILHA)
  )
  checar(
    "aluno de EM na aula de EF também paga metade, outra trilha é outra trilha",
    ajustarPorPublico(40, "ef67", "em") === Math.round(40 * PESO_FORA_DA_TRILHA)
  )
  checar("o piso é 1, nunca zero", ajustarPorPublico(2, "ef12") === 1)
  checar("sem terceiro argumento vale o default do produto", ajustarPorPublico(50, "adulto") === 50)
} finally {
  // Sempre limpa, inclusive se um checar acima explodir.
  for (const id of [userId, outroId].filter(Boolean)) {
    await db.user.delete({ where: { id } }).catch(() => {})
  }
  const varridos = await varrerDescartaveis("teste-pontos")
  console.log(`\nlimpeza: ${varridos === 0 ? "nada ficou no banco" : `${varridos} descartável(is) varrido(s)`}`)
  await db.$disconnect()
}

console.log(`\n${falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`}`)
process.exit(falhas === 0 ? 0 : 1)
