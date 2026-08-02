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
  garantirLevaInicial, levaAtual, medirProgresso, progressoDaTrilha,
  talvezGerarNovaLeva, marcarEntregues, LIMIAR_NOVA_LEVA,
} = await import("../lib/recomendacao.js")

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
  const p40 = await progressoDaTrilha(userId)
  checar("2 de 5 dá 40%", Math.round(p40.fracao * 100) === 40, `${Math.round(p40.fracao * 100)}%`)
  checar(
    "abaixo do limiar não gera nada",
    (await talvezGerarNovaLeva(userId, escolherFake)).length === 0
  )

  await concluir(cinco[2].id)
  const p60 = await progressoDaTrilha(userId)
  checar("3 de 5 dá 60%", Math.round(p60.fracao * 100) === 60)
  checar("60% é o limiar", p60.fracao >= LIMIAR_NOVA_LEVA)

  const nova = await talvezGerarNovaLeva(userId, escolherFake)
  checar("gera a leva de 4", nova.length === 4, `gerou ${nova.length}`)
  checar("as novas nascem por entregar", nova.every((r) => r.entregueEm === null))
  checar("as novas vêm com motivo", nova.every((r) => r.motivo.startsWith("porque ")))

  // O ponto do teste: a geração empurra a porcentagem para baixo do limiar, e
  // por isso não precisa de trava nenhuma para não repetir.
  const depois = await levaAtual(userId)
  const p33 = await progressoDaTrilha(userId)
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
  const p66 = await progressoDaTrilha(userId)
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
}

// ------------------------------------------- aula já feita fora da trilha ---
/**
 * O caso que ESTOUROU em produção, e que o teste acima não pegava.
 *
 * Quem estuda uma aula fora da trilha recomendada cria um módulo "concluído mas
 * não recomendado". Se o gatilho puder escolhê-lo, ele entra no numerador E no
 * denominador ao mesmo tempo: a leva nova não derruba a porcentagem como
 * deveria e o gatilho dispara outra vez em seguida.
 *
 * Foi exatamente isso: 4/4 = 100% disparou, a leva trouxe uma aula já feita,
 * virou 5/8 = 63%, ainda acima do limiar, e disparou de novo 22 segundos
 * depois. A pessoa levou 8 aulas de uma vez.
 */
const marca2 = `teste-gatilho2-${Date.now()}`
let userId2 = ""

try {
  console.log("\nAULA JÁ FEITA FORA DA TRILHA")

  const modulos = await db.modulo.findMany({
    select: { id: true, slug: true },
    orderBy: [{ tipoPerfil: "asc" }, { ordem: "asc" }],
  })
  const u = await db.user.create({ data: { email: `${marca2}@exemplo.invalido`, nome: "Teste 2" } })
  userId2 = u.id

  const naLeva = modulos.slice(0, 4)
  const foraDaLeva = modulos[4] // esta ela faz por conta própria

  await garantirLevaInicial(userId2, naLeva.map((m) => m.slug))

  async function concluir2(moduloId: string) {
    await db.progressoModulo.upsert({
      where: { userId_moduloId: { userId: userId2, moduloId } },
      create: { userId: userId2, moduloId, concluido: true, concluidoEm: new Date(), telaAtual: 999 },
      update: { concluido: true, concluidoEm: new Date() },
    })
  }

  for (const m of naLeva) await concluir2(m.id)
  await concluir2(foraDaLeva.id) // a de fora

  const p100 = medirProgresso(await levaAtual(userId2))
  checar("fecha a trilha recomendada", Math.round(p100.fracao * 100) === 100, `${Math.round(p100.fracao * 100)}%`)

  // A escolha ingênua: pega os 4 primeiros candidatos que vierem.
  const primeiros = async (c: { id: string; slug: string; titulo: string; subtitulo: string }[]) =>
    c.slice(0, 4).map((x) => ({ moduloId: x.id, motivo: `porque ${x.slug}` }))

  const nova = await talvezGerarNovaLeva(userId2, primeiros)
  checar("gera a leva", nova.length === 4, `${nova.length}`)
  checar(
    "a aula que ela JÁ FEZ não é recomendada",
    !nova.some((r) => r.moduloId === foraDaLeva.id),
    nova.map((r) => r.slug).join(", ")
  )

  const depois2 = await progressoDaTrilha(userId2)
  checar(
    "a porcentagem cai abaixo do limiar",
    depois2.fracao < LIMIAR_NOVA_LEVA,
    `${depois2.concluidos}/${depois2.total} = ${Math.round(depois2.fracao * 100)}%`
  )
  checar(
    "e NÃO dispara uma segunda vez",
    (await talvezGerarNovaLeva(userId2, primeiros)).length === 0
  )
  checar("continuam 8 recomendações, não 12", (await levaAtual(userId2)).length === 8,
    `${(await levaAtual(userId2)).length}`)
} finally {
  if (userId2) await db.user.delete({ where: { id: userId2 } }).catch(() => {})
}

// ------------------------------------ aula fora da trilha conta, e a borda ---
const marca3 = `teste-gatilho3-${Date.now()}`
let userId3 = ""

try {
  const modulos = await db.modulo.findMany({
    select: { id: true, slug: true },
    orderBy: [{ tipoPerfil: "asc" }, { ordem: "asc" }],
  })
  const u = await db.user.create({ data: { email: `${marca3}@exemplo.invalido`, nome: "Teste 3" } })
  userId3 = u.id

  async function concluir3(moduloId: string, quando = new Date()) {
    await db.progressoModulo.upsert({
      where: { userId_moduloId: { userId: userId3, moduloId } },
      create: { userId: userId3, moduloId, concluido: true, concluidoEm: quando, telaAtual: 999 },
      update: { concluido: true, concluidoEm: quando },
    })
  }

  console.log("\nAULA FORA DA TRILHA CONTA PARA O GATILHO")

  const naLeva = modulos.slice(0, 4)
  await garantirLevaInicial(userId3, naLeva.map((m) => m.slug))
  await concluir3(naLeva[0].id)
  await concluir3(naLeva[1].id)

  const so2 = await progressoDaTrilha(userId3)
  checar("2 de 4 recomendadas dá 50%", Math.round(so2.fracao * 100) === 50, `${so2.concluidos}/${so2.total}`)
  checar("e não dispara", (await talvezGerarNovaLeva(userId3, escolherFake)).length === 0)

  // Uma aula estudada por conta própria, achada pela busca da Trilha.
  await concluir3(modulos[10].id)
  const com3 = await progressoDaTrilha(userId3)
  checar(
    "estudar por fora sobe a conta",
    com3.concluidos === 3 && com3.total === 5,
    `${com3.concluidos}/${com3.total} = ${Math.round(com3.fracao * 100)}%`
  )
  checar("e passa a disparar", (await talvezGerarNovaLeva(userId3, escolherFake)).length === 4)
} finally {
  if (userId3) await db.user.delete({ where: { id: userId3 } }).catch(() => {})
}

const marca4 = `teste-gatilho4-${Date.now()}`
let userId4 = ""

try {
  /**
   * A borda: concluir TUDO deixa a fração exatamente no limiar depois da leva
   * nova (6 de 6 vira 6/10 = 60%), e o gatilho dispararia outra vez na hora.
   */
  console.log("\nA BORDA DE QUEM CONCLUI TUDO")

  const modulos = await db.modulo.findMany({
    select: { id: true, slug: true },
    orderBy: [{ tipoPerfil: "asc" }, { ordem: "asc" }],
  })
  const u = await db.user.create({ data: { email: `${marca4}@exemplo.invalido`, nome: "Teste 4" } })
  userId4 = u.id

  const seis = modulos.slice(0, 6)
  await garantirLevaInicial(userId4, seis.map((m) => m.slug))
  for (const m of seis) {
    await db.progressoModulo.create({
      data: { userId: userId4, moduloId: m.id, concluido: true, concluidoEm: new Date(), telaAtual: 999 },
    })
  }

  checar("6 de 6 dá 100%", Math.round((await progressoDaTrilha(userId4)).fracao * 100) === 100)
  const leva1 = await talvezGerarNovaLeva(userId4, escolherFake)
  checar("dispara uma vez", leva1.length === 4, `${leva1.length}`)

  const naBorda = await progressoDaTrilha(userId4)
  checar(
    "e fica EXATAMENTE no limiar, que a fração sozinha não barraria",
    Math.round(naBorda.fracao * 100) === 60 && naBorda.fracao >= LIMIAR_NOVA_LEVA,
    `${naBorda.concluidos}/${naBorda.total} = ${Math.round(naBorda.fracao * 100)}%`
  )
  checar("nada concluído desde a leva nova", naBorda.desdeUltimaLeva === 0)
  checar(
    "por isso NÃO dispara de novo",
    (await talvezGerarNovaLeva(userId4, escolherFake)).length === 0
  )
  checar("continuam 10 recomendações", (await levaAtual(userId4)).length === 10,
    `${(await levaAtual(userId4)).length}`)

  // Concluir uma aula NOVA volta a destravar.
  const jaNaLeva = new Set((await levaAtual(userId4)).map((r) => r.moduloId))
  const proxima = modulos.find((m) => !jaNaLeva.has(m.id))
  if (proxima) {
    await db.progressoModulo.upsert({
      where: { userId_moduloId: { userId: userId4, moduloId: proxima.id } },
      create: { userId: userId4, moduloId: proxima.id, concluido: true, concluidoEm: new Date(), telaAtual: 999 },
      update: { concluido: true, concluidoEm: new Date() },
    })
    checar("concluir algo novo volta a contar",
      (await progressoDaTrilha(userId4)).desdeUltimaLeva === 1)
  }
} finally {
  // Este bloco apagava `userId`, do PRIMEIRO caso, em vez de `userId4`. Foi
  // assim que descartáveis foram parar no banco de produção: o teste dizia
  // "nada ficou no banco" porque conferia a marca errada.
  if (userId4) await db.user.delete({ where: { id: userId4 } }).catch(() => {})
  const varridos = await varrerDescartaveis("teste-gatilho")
  console.log(`\nlimpeza: ${varridos === 0 ? "nada ficou no banco" : `${varridos} descartável(is) varrido(s)`}`)
  await db.$disconnect()
}

console.log(`\n${falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`}`)
process.exit(falhas === 0 ? 0 : 1)
