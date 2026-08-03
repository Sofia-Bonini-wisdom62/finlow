/**
 * Testa a leva da Trilha: quando fecha, o que entra, e o que o chat troca.
 *
 * A REGRA
 * A leva é um bloco de 4 que fica à vista até a ÚLTIMA aula ser concluída. Só
 * então ela fecha e outra de 4 entra. Quando o chat detecta uma necessidade
 * nova, ele TROCA uma aula da leva — não acrescenta uma quinta.
 *
 * POR QUE ESTE ARQUIVO É GRANDE
 * Cada guarda aqui existe porque a versão sem ela falhou de um jeito que não
 * dava erro nenhum:
 *
 *  - recomendar aula já concluída inflava a conta e a leva disparava duas vezes
 *    seguidas (aconteceu em produção: 8 aulas de uma vez);
 *  - trocar uma aula CONCLUÍDA faria a leva nunca fechar, porque o trabalho
 *    feito sairia da conta;
 *  - a troca sem limite faria a leva crescer para acomodar a conversa, e
 *    "Recomendados" voltaria a ser um acúmulo.
 *
 *   node --import tsx scripts/testar-gatilho.mts
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

const { db } = await import("../lib/db.js")
const {
  garantirLevaInicial, levaAtual, levaAtiva, levaFechada,
  talvezGerarNovaLeva, guardarRecomendacaoDoChat, marcarEntregues,
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

/** Escolhe as 4 primeiras da fila. Determinístico de propósito. */
const escolherFake = async (
  candidatos: { id: string; slug: string; titulo: string; subtitulo: string }[]
) => candidatos.slice(0, 4).map((c) => ({ moduloId: c.id, motivo: `porque ${c.slug}` }))

const marca = `teste-gatilho-${Date.now()}`
let userId = ""

async function concluir(uid: string, moduloId: string) {
  await db.progressoModulo.upsert({
    where: { userId_moduloId: { userId: uid, moduloId } },
    create: { userId: uid, moduloId, concluido: true, concluidoEm: new Date(), telaAtual: 999 },
    update: { concluido: true, concluidoEm: new Date() },
  })
}

try {
  const modulos = await db.modulo.findMany({
    select: { id: true, slug: true },
    orderBy: [{ tipoPerfil: "asc" }, { ordem: "asc" }],
  })
  if (modulos.length < 12) {
    console.log(`✗ preciso de ao menos 12 módulos, achei ${modulos.length}`)
    process.exit(1)
  }

  const u = await db.user.create({ data: { email: `${marca}@exemplo.invalido`, nome: "Teste" } })
  userId = u.id

  const quatro = modulos.slice(0, 4)
  await garantirLevaInicial(userId, quatro.map((m) => m.slug))

  // ------------------------------------------------------------ a leva ---
  console.log("A LEVA")

  const inicial = await levaAtiva(userId)
  checar("nasce com 4 aulas", inicial.length === 4, `${inicial.length}`)
  checar("é a leva 1", inicial.every((r) => r.leva === 1))
  checar("não está fechada", !levaFechada(inicial))

  // ------------------------------------------------- só fecha com todas ---
  console.log("\nSÓ FECHA COM AS QUATRO")

  for (const [i, m] of quatro.slice(0, 3).entries()) {
    await concluir(userId, m.id)
    const ativa = await levaAtiva(userId)
    checar(
      `${i + 1} de 4 concluídas: não fecha`,
      !levaFechada(ativa),
      `${ativa.filter((r) => r.concluido).length}/${ativa.length}`
    )
    checar(`  e não gera leva nova`, (await talvezGerarNovaLeva(userId, escolherFake)).length === 0)
  }

  // A aula concluída CONTINUA na leva — é o que mostra o progresso.
  const comTres = await levaAtiva(userId)
  checar("a concluída continua na leva ativa", comTres.length === 4,
    `${comTres.filter((r) => r.concluido).length} concluídas de ${comTres.length}`)

  await concluir(userId, quatro[3].id)
  checar("a quarta fecha a leva", levaFechada(await levaAtiva(userId)))

  // ------------------------------------------------------ a leva nova ---
  console.log("\nA LEVA NOVA")

  const nova = await talvezGerarNovaLeva(userId, escolherFake)
  checar("entram 4 aulas", nova.length === 4, `${nova.length}`)
  checar("com número de leva próprio", nova.every((r) => r.leva === 2))

  const ativa2 = await levaAtiva(userId)
  checar("a leva ativa passa a ser a nova", ativa2.every((r) => r.leva === 2))
  checar("e tem só as 4 novas", ativa2.length === 4, `${ativa2.length}`)
  checar("nenhuma delas está concluída", ativa2.every((r) => !r.concluido))
  checar("a leva 1 sai de cena mas fica no histórico",
    (await levaAtual(userId)).filter((r) => r.leva === 1).length === 4)
  checar("não dispara de novo com a leva 2 aberta",
    (await talvezGerarNovaLeva(userId, escolherFake)).length === 0)

  await marcarEntregues(userId, nova.map((n) => n.id))

  // ------------------------------------------------- o chat troca uma ---
  console.log("\nO CHAT TROCA, NÃO SOMA")

  // Uma aula que o chat vai citar e que não está na leva nem no histórico.
  const historico = new Set((await levaAtual(userId)).map((r) => r.moduloId))
  const nova1 = modulos.find((m) => !historico.has(m.id))!

  const antesDaTroca = await levaAtiva(userId)
  const trocadas = await guardarRecomendacaoDoChat(
    userId, [nova1.slug], { [nova1.slug]: "você perguntou sobre isso" }
  )
  const depoisDaTroca = await levaAtiva(userId)

  checar("troca uma", trocadas === 1, `${trocadas}`)
  checar("a leva continua com 4", depoisDaTroca.length === 4, `${depoisDaTroca.length}`)
  checar("a aula citada entrou", depoisDaTroca.some((r) => r.moduloId === nova1.id))
  checar("com origem lacuna_chat",
    depoisDaTroca.find((r) => r.moduloId === nova1.id)?.origem === "lacuna_chat")
  checar("e já entregue, porque o card do chat é a entrega",
    depoisDaTroca.find((r) => r.moduloId === nova1.id)?.entregueEm !== null)

  const saiu = antesDaTroca.filter((a) => !depoisDaTroca.some((d) => d.moduloId === a.moduloId))
  checar("exatamente uma saiu", saiu.length === 1, saiu.map((s) => s.slug).join(", "))
  checar("a que saiu continua no histórico, marcada",
    (await levaAtual(userId)).some((r) => r.moduloId === saiu[0]?.moduloId && r.substituida))

  // ------------------------------------ concluída nunca é trocada ---
  console.log("\nA CONCLUÍDA NUNCA CEDE O LUGAR")

  const paraConcluir = (await levaAtiva(userId)).filter((r) => r.origem !== "lacuna_chat").slice(0, 3)
  for (const r of paraConcluir) await concluir(userId, r.moduloId)

  const antes3 = await levaAtiva(userId)
  const concluidasAntes = antes3.filter((r) => r.concluido).map((r) => r.moduloId)
  checar("3 concluídas na leva", concluidasAntes.length === 3, `${concluidasAntes.length}`)

  const hist2 = new Set((await levaAtual(userId)).map((r) => r.moduloId))
  const nova2 = modulos.find((m) => !hist2.has(m.id))
  if (nova2) {
    await guardarRecomendacaoDoChat(userId, [nova2.slug], { [nova2.slug]: "outra necessidade" })
    const depois3 = await levaAtiva(userId)
    checar("as 3 concluídas continuam na leva",
      concluidasAntes.every((id) => depois3.some((r) => r.moduloId === id)),
      `${depois3.filter((r) => r.concluido).length} concluídas`)
    checar("quem saiu foi a pendente", depois3.length === 4)
  }

  // Sem pendente nenhuma não há o que trocar.
  for (const r of await levaAtiva(userId)) await concluir(userId, r.moduloId)
  const hist3 = new Set((await levaAtual(userId)).map((r) => r.moduloId))
  const nova3 = modulos.find((m) => !hist3.has(m.id))
  if (nova3) {
    checar("com a leva toda concluída, o chat não troca nada",
      (await guardarRecomendacaoDoChat(userId, [nova3.slug], {})) === 0)
  }

  // --------------------------------------- aula já feita não é indicada ---
  console.log("\nAULA JÁ FEITA NÃO É INDICADA")

  checar("a leva está fechada", levaFechada(await levaAtiva(userId)))
  const proxima = await talvezGerarNovaLeva(userId, escolherFake)
  const feitos = new Set((await db.progressoModulo.findMany({
    where: { userId, concluido: true }, select: { moduloId: true },
  })).map((p) => p.moduloId))
  checar("a leva nova não traz nada já concluído",
    proxima.every((r) => !feitos.has(r.moduloId)),
    proxima.map((r) => r.slug).join(", "))
} finally {
  if (userId) await db.user.delete({ where: { id: userId } }).catch(() => {})
  const varridos = await varrerDescartaveis("teste-gatilho")
  console.log(`\nlimpeza: ${varridos === 0 ? "nada ficou no banco" : `${varridos} descartável(is) varrido(s)`}`)
  await db.$disconnect()
}

console.log(`\n${falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`}`)
process.exit(falhas === 0 ? 0 : 1)
