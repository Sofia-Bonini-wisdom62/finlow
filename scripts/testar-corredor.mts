/**
 * Testa o corredor: a trava entre módulos e entre lições.
 *
 * A trava é a única coisa no app que TIRA acesso de alguém. Errar para o lado
 * frouxo é um recurso que não funciona; errar para o lado apertado tranca a
 * pessoa fora do que ela já pagou com tempo. Os dois casos estão aqui, e o
 * segundo é o que tem gente de verdade envolvida:
 *
 *   - quem concluiu módulo ANTES do corredor existir não pode reabrir como 0/4;
 *   - trocar o número da lição na URL não pode furar a fila.
 *
 *   node --import tsx scripts/testar-corredor.mts
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

const { db } = await import("../lib/db.js")
const { montarCorredor, podeAbrir } = await import("../lib/corredor.js")
const { montarLicoes, licoesExistentes, quantasLicoes } = await import("../lib/licoes.js")
import type { TelaData, TipoTela } from "../types/trilha.js"

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

const familia = "teste-corredor-"
async function varrerDescartaveis(): Promise<number> {
  const orfaos = await db.user.findMany({
    where: { email: { startsWith: familia, endsWith: "@exemplo.invalido" } },
    select: { id: true },
  })
  if (orfaos.length) await db.user.deleteMany({ where: { id: { in: orfaos.map((o) => o.id) } } })
  return orfaos.length
}

// ------------------------------------------------------- mapeamento puro ---
console.log("MAPEAMENTO DAS LIÇÕES (puro)")

const t = (ordem: number, tipo: TipoTela): TelaData => ({
  id: `t${ordem}`, ordem, tipo, label: "", conteudo: {} as never,
})

// A assinatura de 7 telas da T1
const seteTelas = [
  t(0, "conceito"), t(1, "cenario"), t(2, "quiz"), t(3, "conceito"),
  t(4, "input"), t(5, "resultado"), t(6, "conceito"),
]
const ls = montarLicoes(seteTelas)
checar("7 telas viram 4 lições", ls.length === 4, ls.map((l) => l.licao).join(","))
checar("L1 leva os conceitos e o quiz",
  ls[0]!.telas.map((x) => x.tipo).join(",") === "conceito,conceito,quiz")
checar("L2 leva o cenário", ls[1]!.telas.map((x) => x.tipo).join(",") === "cenario")
checar("L3 é o MESMO quiz, sozinho",
  ls[2]!.telas.length === 1 && ls[2]!.telas[0]!.id === ls[0]!.telas[2]!.id)
checar("L4 leva input, resultado e o fechamento",
  ls[3]!.telas.map((x) => x.tipo).join(",") === "input,resultado,conceito")

// Módulo sem cenário: a História não existe, e isso não é erro
const semCenario = [t(0, "conceito"), t(1, "quiz"), t(2, "input"), t(3, "resultado")]
checar("sem cenário, o módulo tem 3 lições", quantasLicoes(semCenario) === 3)
checar("e a que falta é a 2", !licoesExistentes(semCenario).includes(2 as never),
  licoesExistentes(semCenario).join(","))
checar("nenhuma lição sai vazia",
  montarLicoes(semCenario).every((l) => l.telas.length > 0))

// A contagem leve (sem carregar conteúdo) tem de bater com a completa
checar("contagem leve = contagem completa",
  quantasLicoes(seteTelas.map((x) => ({ tipo: x.tipo, ordem: x.ordem }))) === montarLicoes(seteTelas).length)

// -------------------------------------------------------- corredor no DB ---
console.log("\nCORREDOR (banco)")

try {
  await varrerDescartaveis()
  const u = await db.user.create({ data: { email: `${familia}${Date.now()}@exemplo.invalido`, nome: "Teste" } })

  const mods = await db.modulo.findMany({
    where: { publico: "adulto" },
    select: { id: true, slug: true, titulo: true },
    orderBy: { ordem: "asc" },
    take: 3,
  })
  const [a, b, c] = mods

  // Sem recomendação nenhuma: tudo trancado, nada liberado.
  const zero = await montarCorredor(u.id)
  checar("sem trilha montada, nada fica liberado",
    [...zero.modulos.values()].every((m) => m.estado === "trancado"), `atual=${zero.atual?.slug ?? "nenhum"}`)
  checar("o motivo diz que não entrou na trilha",
    zero.modulos.get(a!.id)?.bloqueio === "Ainda não entrou na sua trilha.")

  // Monta a sequência a, b, c
  await db.recomendacaoTrilha.createMany({
    data: mods.map((m, i) => ({ userId: u.id, moduloId: m.id, ordem: i, origem: "onboarding", motivo: "teste" })),
  })

  const c1 = await montarCorredor(u.id)
  checar("o primeiro da sequência abre", c1.modulos.get(a!.id)?.estado === "liberado")
  checar("o segundo fica trancado", c1.modulos.get(b!.id)?.estado === "trancado")
  checar("e o motivo nomeia o módulo que barra",
    c1.modulos.get(b!.id)?.bloqueio === `Conclua “${a!.titulo}” para abrir.`,
    c1.modulos.get(b!.id)?.bloqueio ?? "")
  checar("'atual' é o primeiro liberado", c1.atual?.moduloId === a!.id)
  checar("dentro do módulo, só a lição 1 abre",
    c1.modulos.get(a!.id)!.licoes.filter((l) => l.liberada).map((l) => l.licao).join(",") === "1")
  checar("proximaLicao aponta a 1", c1.modulos.get(a!.id)?.proximaLicao === 1)

  // Servidor recusa lição adiantada e módulo trancado
  checar("servidor recusa a lição 3 antes da 2",
    (await podeAbrir(u.id, a!.id, 3)).ok === false)
  checar("servidor recusa módulo trancado",
    (await podeAbrir(u.id, b!.id, 1)).ok === false)
  checar("servidor libera a lição 1 do módulo aberto",
    (await podeAbrir(u.id, a!.id, 1)).ok === true)

  // Conclui a lição 1 do módulo A
  const licoesDeA = licoesExistentes(
    (await db.tela.findMany({ where: { moduloId: a!.id }, select: { tipo: true, ordem: true } }))
  )
  await db.progressoLicao.create({
    data: { userId: u.id, moduloId: a!.id, licao: 1, concluido: true, concluidoEm: new Date() },
  })
  const c2 = await montarCorredor(u.id)
  checar("concluir a 1 abre a seguinte",
    c2.modulos.get(a!.id)!.licoes.find((l) => l.licao === licoesDeA[1])?.liberada === true)
  checar("mas o módulo seguinte SEGUE trancado", c2.modulos.get(b!.id)?.estado === "trancado")
  checar("contador anda: 1 de N", c2.modulos.get(a!.id)?.licoesConcluidas === 1)

  // Conclui TODAS as lições do módulo A
  await db.progressoLicao.createMany({
    data: licoesDeA.slice(1).map((n) => ({
      userId: u.id, moduloId: a!.id, licao: n, concluido: true, concluidoEm: new Date(),
    })),
  })
  const c3 = await montarCorredor(u.id)
  checar("fechar todas as lições conclui o módulo", c3.modulos.get(a!.id)?.estado === "concluido")
  checar("e SÓ aí o módulo seguinte abre", c3.modulos.get(b!.id)?.estado === "liberado")
  checar("o terceiro continua trancado", c3.modulos.get(c!.id)?.estado === "trancado")
  checar("'atual' avançou para o segundo", c3.atual?.moduloId === b!.id)

  // --------- o caso com gente de verdade: concluiu antes do corredor ---------
  const v = await db.user.create({ data: { email: `${familia}veterano-${Date.now()}@exemplo.invalido` } })
  await db.recomendacaoTrilha.createMany({
    data: mods.map((m, i) => ({ userId: v.id, moduloId: m.id, ordem: i, origem: "onboarding", motivo: "teste" })),
  })
  // Progresso do jeito ANTIGO: módulo concluído, zero linhas de lição.
  await db.progressoModulo.create({
    data: { userId: v.id, moduloId: a!.id, concluido: true, concluidoEm: new Date() },
  })
  const cv = await montarCorredor(v.id)
  checar("quem já concluiu o módulo antes do corredor continua concluído",
    cv.modulos.get(a!.id)?.estado === "concluido")
  checar("e não volta a 0 de N",
    cv.modulos.get(a!.id)?.licoesConcluidas === cv.modulos.get(a!.id)?.licoesTotal,
    `${cv.modulos.get(a!.id)?.licoesConcluidas}/${cv.modulos.get(a!.id)?.licoesTotal}`)
  checar("e o módulo seguinte dele está aberto", cv.modulos.get(b!.id)?.estado === "liberado")

  // Módulo concluído fora da sequência não vira "trancado"
  const f = await db.user.create({ data: { email: `${familia}fora-${Date.now()}@exemplo.invalido` } })
  await db.progressoModulo.create({
    data: { userId: f.id, moduloId: c!.id, concluido: true, concluidoEm: new Date() },
  })
  const cf = await montarCorredor(f.id)
  checar("concluído fora de qualquer leva segue concluído",
    cf.modulos.get(c!.id)?.estado === "concluido")
} finally {
  const varridos = await varrerDescartaveis()
  console.log(`\n[limpeza] ${varridos} usuário(s) descartável(is) removido(s)`)
  await db.$disconnect()
}

console.log(falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`)
process.exit(falhas === 0 ? 0 : 1)
