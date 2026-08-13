/**
 * Bateria do jogo (Redesign Fin): energia, combo, nível, coins, missões e baú.
 *
 * ⚠️ PRECISA DE `--conditions react-server` (mesmo motivo de testar-pagamento):
 *
 *   node --conditions react-server --import tsx scripts/testar-jogo.mts
 *
 * `lib/energia.ts` importa `acessoPremium`, que importa `server-only`.
 *
 * As regras puras (regenerar, devolucao, calcularCombo, nivelDoTotal) rodam
 * com relógio congelado. As de banco (idempotência de coins, saldo, missão,
 * poção) criam um usuário descartável e varrem a família inteira no fim —
 * mesmo desenho de testar-pontos.mts, pelo mesmo motivo: o banco é o de
 * produção e órfão de teste fica lá para sempre se ninguém varrer.
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

const { db } = await import("../lib/db.js")
const { regenerar, devolucao, minutosParaProxima, ENERGIA_MAX } = await import("../lib/energia.js")
const { calcularCombo } = await import("../lib/combo.js")
const { nivelDoTotal } = await import("../lib/nivel.js")
const { creditarCoins, debitarCoins } = await import("../lib/coins.js")
const { resgatarMissao, MISSOES } = await import("../lib/missoes.js")
const { comprarItem } = await import("../lib/loja.js")

let falhas = 0

function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

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

// ------------------------------------------------------------ regras puras ---
console.log("ENERGIA — regeneração")

const T0 = new Date("2026-08-13T12:00:00-03:00")
const mais = (min: number) => new Date(T0.getTime() + min * 60_000)

checar("59min não regenera nada", regenerar(10, T0, mais(59)).valor === 10)
checar("60min regenera +1", regenerar(10, T0, mais(60)).valor === 11)
checar("resto de hora é preservado na âncora", (() => {
  // 1h59: +1, âncora anda 1h; os 59min sobram para a próxima leitura
  const r1 = regenerar(10, T0, mais(119))
  if (r1.valor !== 11) return false
  const r2 = regenerar(r1.valor, r1.desde, mais(120))
  return r2.valor === 12
})())
checar("teto 24 segura", regenerar(23, T0, mais(600)).valor === ENERGIA_MAX)
checar("cheio ancora em agora (nada acumula acima do teto)", (() => {
  const r = regenerar(24, T0, mais(300))
  return r.valor === 24 && r.desde.getTime() === mais(300).getTime()
})())
checar("relógio para trás não desconta", regenerar(10, T0, mais(-60)).valor === 10)
checar("minutosParaProxima nunca é 0", minutosParaProxima(T0, mais(59)) === 1)

console.log("\nENERGIA — devolução por acerto")
checar("sem quiz devolve o teto (lição líquida custa 1)", devolucao(0, 0) === 3)
checar("tudo certo devolve 3", devolucao(2, 2) === 3)
checar("metade devolve 2 (ceil)", devolucao(1, 2) === 2)
checar("tudo errado devolve 0", devolucao(0, 2) === 0)

console.log("\nCOMBO — sequência que atravessa lições")
checar("herda o combo e acende no 3º", (() => {
  const r = calcularCombo(2, [true])
  return r.combo === 3 && r.bonus === 3
})())
checar("erro zera a sequência", calcularCombo(5, [false, true]).combo === 1)
checar("erro não paga bônus retroativo", calcularCombo(5, [false, true]).bonus === 0)
checar("comboMax registra o pico, não o fim", (() => {
  const r = calcularCombo(2, [true, false])
  return r.comboMax === 3 && r.combo === 0
})())
checar("lição sem quiz não muda nada", (() => {
  const r = calcularCombo(4, [])
  return r.combo === 4 && r.bonus === 0
})())

console.log("\nNÍVEL — curva de pontos")
checar("0 pontos = nível 1", nivelDoTotal(0).nivel === 1)
checar("50 pontos = nível 2 (o onboarding já sobe)", nivelDoTotal(50).nivel === 2)
checar("200 pontos = nível 3", nivelDoTotal(200).nivel === 3)
checar("fração fica em 0..1", (() => {
  for (const p of [0, 49, 50, 199, 777]) {
    const f = nivelDoTotal(p).fracao
    if (f < 0 || f > 1) return false
  }
  return true
})())
checar("monotônica: mais pontos nunca desce de nível", (() => {
  let anterior = 0
  for (let p = 0; p <= 2000; p += 25) {
    const n = nivelDoTotal(p).nivel
    if (n < anterior) return false
    anterior = n
  }
  return true
})())

// ------------------------------------------------------------------- banco ---
console.log("\nCOINS — idempotência e saldo (banco)")

const marca = `teste-jogo-${Date.now()}`
let userId = ""

try {
  const u = await db.user.create({ data: { email: `${marca}@exemplo.invalido`, nome: "Teste Jogo" } })
  userId = u.id

  const c1 = await creditarCoins(userId, "licao", "mod-x:1")
  const c2 = await creditarCoins(userId, "licao", "mod-x:1")
  checar("primeiro crédito entra (+10)", c1.creditado && c1.moedas === 10, `total=${c1.total}`)
  checar("repetir o mesmo refId não paga", !c2.creditado && c2.total === c1.total)

  const cCustom = await creditarCoins(userId, "missao", "2026-01-01:teste", 999)
  checar("valor custom respeita o teto do motivo", cCustom.moedas === 30)

  const semSaldo = await debitarCoins(userId, "compra_item", "avatar-caro", 9999)
  checar("débito sem saldo falha e não grava", !semSaldo.ok && semSaldo.motivo === "saldo")
  const linhas = await db.eventoCoins.count({ where: { userId, motivo: "compra_item" } })
  checar("nenhuma linha de compra ficou no ledger", linhas === 0)

  const gasto = await debitarCoins(userId, "compra_item", "avatar-x", 15)
  checar("débito com saldo funciona", gasto.ok && gasto.total === c1.total + 30 - 15)
  const deNovo = await debitarCoins(userId, "compra_item", "avatar-x", 15)
  checar("comprar o MESMO item de novo é barrado e devolve o dinheiro", !deNovo.ok && deNovo.motivo === "repetido" && deNovo.total === gasto.total)

  console.log("\nMISSÕES — resgate reconferido (banco)")
  const cedo = await resgatarMissao(userId, MISSOES[0].id)
  checar("resgatar sem completar é recusado", !cedo.ok && cedo.motivo === "incompleta")

  // Completa a missão de verdade: uma lição concluída hoje — num módulo REAL,
  // porque ProgressoLicao tem FK para Modulo (o cascade do delete limpa).
  const moduloReal = await db.modulo.findFirst({ select: { id: true } })
  if (!moduloReal) throw new Error("banco sem módulos — semeie antes de testar")
  await db.progressoLicao.create({
    data: { userId, moduloId: moduloReal.id, licao: 1, concluido: true, concluidoEm: new Date(), telaAtual: 5 },
  })
  const r1 = await resgatarMissao(userId, MISSOES[0].id)
  const r2 = await resgatarMissao(userId, MISSOES[0].id)
  checar("missão completa resgata uma vez", r1.ok)
  checar("segunda tentativa no mesmo dia é barrada", !r2.ok && r2.motivo === "ja_resgatada")

  console.log("\nPOÇÃO — uma por vez (banco)")
  await db.user.update({ where: { id: userId }, data: { coins: 100 } })
  const p1 = await comprarItem(userId, "pocao")
  const p2 = await comprarItem(userId, "pocao")
  checar("primeira poção compra", p1.ok)
  checar("segunda poção com uma ativa é recusada", !p2.ok && p2.motivo === "pocao_ativa")
  const uFinal = await db.user.findUnique({ where: { id: userId }, select: { coins: true, pocaoAtiva: true } })
  checar("só uma poção foi cobrada", uFinal?.coins === 60 && uFinal?.pocaoAtiva === true)
} finally {
  for (const id of [userId].filter(Boolean)) {
    await db.user.delete({ where: { id } }).catch(() => {})
  }
  const varridos = await varrerDescartaveis("teste-jogo")
  console.log(`\nlimpeza: ${varridos === 0 ? "nada ficou no banco" : `${varridos} descartável(is) varrido(s)`}`)
  await db.$disconnect()
}

console.log(`\n${falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`}`)
process.exit(falhas === 0 ? 0 : 1)
