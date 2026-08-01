/**
 * Testa o gatilho de percentual e a leva de +4 (SPEC v3, tarefa 11).
 *
 * O critério da spec é "dispara uma única vez, sem duplicar", e é justamente o
 * tipo de coisa que passa despercebida: um gatilho que dispara duas vezes gera
 * recomendação a mais, não erro. Ninguém vê no log, a pessoa só recebe uma
 * enxurrada de aulas e acha o app confuso.
 *
 * A escolha das aulas é injetada, então este teste não fala com a IA: o que
 * está sendo testado é a REGRA (quando dispara, o que entra, o que não repete),
 * e regra que só dá para testar com rede não é testada.
 *
 *   node --import tsx scripts/testar-gatilho.mts
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

const { db } = await import("../lib/db.js")
const {
  garantirLevaInicial, levaAtual, medirProgresso, talvezGerarNovaLeva,
  marcarEntregues, LIMIAR_NOVA_LEVA,
} = await import("../lib/recomendacao.js")

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

const marca = `teste-gatilho-${Date.now()}`
let userId = ""

/** Escolhe as 4 primeiras da fila. Determinístico de propósito. */
const escolherFake = async (
  candidatos: { id: string; slug: string; titulo: string; subtitulo: string }[]
) => candidatos.slice(0, 4).map((c) => ({ moduloId: c.id, motivo: `porque ${c.slug}` }))

/** Tenta empurrar o mesmo módulo que já foi recomendado. */
const escolherRepetido = async () => [{ moduloId: "id-inventado", motivo: "não existe" }]

try {
  const modulos = await db.modulo.findMany({
    select: { id: true, slug: true },
    orderBy: [{ tipoPerfil: "asc" }, { ordem: "asc" }],
  })
  if (modulos.length < 9) {
    console.log(`✗ preciso de ao menos 9 módulos no banco, achei ${modulos.length}`)
    process.exit(1)
  }

  const u = await db.user.create({ data: { email: `${marca}@exemplo.invalido`, nome: "Teste" } })
  userId = u.id

  const cinco = modulos.slice(0, 5)

  // -------------------------------------------------------------- semear ---
  console.log("LEVA INICIAL")
  const n1 = await garantirLevaInicial(userId, cinco.map((m) => m.slug))
  const n2 = await garantirLevaInicial(userId, cinco.map((m) => m.slug))
  checar("grava as 5 da primeira vez", n1 === 5, `gravou ${n1}`)
  checar("chamar de novo não duplica", n2 === 0, `gravou ${n2}`)
  checar("existem 5 recomendações", (await levaAtual(userId)).length === 5)
  checar(
    "a leva inicial já nasce entregue (aparece na Trilha, não vira mensagem)",
    (await levaAtual(userId)).every((r) => r.entregueEm !== null)
  )

  // -------------------------------------------------------------- gatilho ---
  console.log("\nGATILHO")

  async function concluir(moduloId: string) {
    await db.progressoModulo.upsert({
      where: { userId_moduloId: { userId, moduloId } },
      create: { userId, moduloId, concluido: true, concluidoEm: new Date(), telaAtual: 999 },
      update: { concluido: true, concluidoEm: new Date() },
    })
  }

  await concluir(cinco[0].id)
  await concluir(cinco[1].id)
  const p40 = medirProgresso(await levaAtual(userId))
  checar("2 de 5 dá 40%", Math.round(p40.fracao * 100) === 40, `${Math.round(p40.fracao * 100)}%`)
  checar(
    "abaixo do limiar não gera nada",
    (await talvezGerarNovaLeva(userId, escolherFake)).length === 0
  )

  await concluir(cinco[2].id)
  const p60 = medirProgresso(await levaAtual(userId))
  checar("3 de 5 dá 60%", Math.round(p60.fracao * 100) === 60)
  checar("60% é o limiar", p60.fracao >= LIMIAR_NOVA_LEVA)

  const nova = await talvezGerarNovaLeva(userId, escolherFake)
  checar("gera a leva de 4", nova.length === 4, `gerou ${nova.length}`)
  checar("as novas nascem por entregar", nova.every((r) => r.entregueEm === null))
  checar("as novas vêm com motivo", nova.every((r) => r.motivo.startsWith("porque ")))

  // O ponto do teste: a geração empurra a porcentagem para baixo do limiar, e
  // por isso não precisa de trava nenhuma para não repetir.
  const depois = await levaAtual(userId)
  const p33 = medirProgresso(depois)
  checar("agora são 9 recomendações", depois.length === 9, `${depois.length}`)
  checar(
    "a própria leva derruba a porcentagem",
    p33.fracao < LIMIAR_NOVA_LEVA,
    `${Math.round(p33.fracao * 100)}%`
  )
  checar(
    "chamar de novo NÃO gera outra leva",
    (await talvezGerarNovaLeva(userId, escolherFake)).length === 0
  )
  checar("continuam 9, sem duplicata", (await levaAtual(userId)).length === 9)

  // ------------------------------------------------------------- entrega ---
  console.log("\nENTREGA")

  const pendentes = (await levaAtual(userId)).filter((r) => !r.entregueEm)
  checar("4 esperando entrega", pendentes.length === 4)

  await marcarEntregues(userId, pendentes.map((p) => p.id))
  const aindaPendente = (await levaAtual(userId)).filter((r) => !r.entregueEm)
  checar("depois de entregue não sobra pendente", aindaPendente.length === 0)

  // ------------------------------------------------------- o que não passa ---
  console.log("\nO QUE NÃO PASSA")

  // Volta a cruzar o limiar para o gatilho poder disparar de novo.
  for (const m of depois.slice(0, 6)) await concluir(m.moduloId)
  const p66 = medirProgresso(await levaAtual(userId))
  checar("6 de 9 volta a passar do limiar", p66.fracao >= LIMIAR_NOVA_LEVA, `${Math.round(p66.fracao * 100)}%`)

  const antes = (await levaAtual(userId)).length
  await talvezGerarNovaLeva(userId, escolherRepetido)
  checar(
    "módulo inexistente escolhido pela IA não entra",
    (await levaAtual(userId)).length === antes,
    `${antes} antes`
  )
} finally {
  if (userId) await db.user.delete({ where: { id: userId } }).catch(() => {})
  const sobrou = await db.user.count({ where: { email: { contains: marca } } })
  console.log(`\nlimpeza: ${sobrou === 0 ? "nada ficou no banco" : `SOBRARAM ${sobrou}`}`)
  if (sobrou !== 0) falhas++
  await db.$disconnect()
}

console.log(`\n${falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`}`)
process.exit(falhas === 0 ? 0 : 1)
