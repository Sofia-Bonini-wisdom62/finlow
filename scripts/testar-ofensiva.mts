/**
 * Testa a ofensiva: contagem, quebra, recorde, fuso e prêmio.
 *
 * POR QUE O RELÓGIO ENTRA POR PARÂMETRO
 * Um contador de dias seguidos erra de um jeito que ninguém vê: a pessoa usa
 * o app todo dia e o número não anda, ou anda duas vezes. Esperar a meia-noite
 * para descobrir não é teste. Aqui o tempo é congelado e a virada do dia é
 * provocada de propósito, inclusive no horário em que o servidor (UTC) já está
 * no dia seguinte e São Paulo ainda não.
 *
 *   node --import tsx scripts/testar-ofensiva.mts
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

const { db } = await import("../lib/db.js")
const { contarOfensiva, diaDeHoje, registrarDiaAtivo, lerOfensiva } = await import("../lib/ofensiva.js")

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

/** Um instante qualquer, para congelar o relógio. */
const EM = (iso: string) => new Date(iso)
/** O dia SP de N dias atrás, do jeito que o banco guarda. */
const diaAtras = (n: number, agora: Date) =>
  new Date(diaDeHoje(agora).getTime() - n * 86_400_000)

// ------------------------------------------------------------- contagem ---
console.log("CONTAGEM (pura, relógio congelado)")

const AGORA = EM("2026-08-07T15:00:00-03:00")

checar("sem dia nenhum, ofensiva zero", contarOfensiva([], AGORA).atual === 0)

const tres = [diaAtras(0, AGORA), diaAtras(1, AGORA), diaAtras(2, AGORA)]
checar("três dias seguidos até hoje", contarOfensiva(tres, AGORA).atual === 3,
  `${contarOfensiva(tres, AGORA).atual}`)
checar("e marca que já usou hoje", contarOfensiva(tres, AGORA).hoje === true)

// Ontem conta: quem ainda não abriu hoje não perde a ofensiva de manhã.
const ateOntem = [diaAtras(1, AGORA), diaAtras(2, AGORA)]
checar("usou até ontem, ofensiva de pé", contarOfensiva(ateOntem, AGORA).atual === 2,
  `${contarOfensiva(ateOntem, AGORA).atual}`)
checar("mas hoje ainda está falso", contarOfensiva(ateOntem, AGORA).hoje === false)

// Dois dias em branco quebram.
const antiga = [diaAtras(2, AGORA), diaAtras(3, AGORA)]
checar("dois dias sem usar zera a atual", contarOfensiva(antiga, AGORA).atual === 0,
  `${contarOfensiva(antiga, AGORA).atual}`)
checar("mas o recorde lembra", contarOfensiva(antiga, AGORA).recorde === 2)

// Buraco no meio: conta só a ponta, e o recorde pega o trecho maior.
const comBuraco = [
  diaAtras(0, AGORA), diaAtras(1, AGORA),
  diaAtras(4, AGORA), diaAtras(5, AGORA), diaAtras(6, AGORA), diaAtras(7, AGORA),
]
const cb = contarOfensiva(comBuraco, AGORA)
checar("buraco no meio: atual é só a ponta", cb.atual === 2, `${cb.atual}`)
checar("recorde é o trecho mais longo", cb.recorde === 4, `${cb.recorde}`)

// Dia repetido não infla (duas visitas no mesmo dia).
const repetido = [diaAtras(0, AGORA), diaAtras(0, AGORA), diaAtras(1, AGORA)]
checar("mesmo dia duas vezes não conta duas", contarOfensiva(repetido, AGORA).atual === 2,
  `${contarOfensiva(repetido, AGORA).atual}`)

// -------------------------------------------------------------- o fuso ---
console.log("\nA VIRADA DO DIA É EM SÃO PAULO")

// 22h em Brasília = 01h do dia seguinte em UTC. O dia SP tem de ser o mesmo.
const noiteSP = EM("2026-08-07T22:00:00-03:00")
const tardeSP = EM("2026-08-07T14:00:00-03:00")
checar("22h e 14h do mesmo dia dão o MESMO dia",
  diaDeHoje(noiteSP).getTime() === diaDeHoje(tardeSP).getTime(),
  `${diaDeHoje(noiteSP).toISOString()} vs ${diaDeHoje(tardeSP).toISOString()}`)

const madrugadaSP = EM("2026-08-08T00:30:00-03:00")
checar("00h30 já é o dia seguinte",
  Math.round((diaDeHoje(madrugadaSP).getTime() - diaDeHoje(noiteSP).getTime()) / 86_400_000) === 1)

// Quem usou às 22h e volta no dia seguinte tem 2, não 1 nem 3.
checar("22h de um dia + qualquer hora do outro = 2",
  contarOfensiva([diaDeHoje(noiteSP), diaDeHoje(madrugadaSP)], madrugadaSP).atual === 2)

// --------------------------------------------------------------- banco ---
console.log("\nREGISTRO E PRÊMIO (banco)")

const familia = "teste-ofensiva-"
async function varrer(): Promise<number> {
  const orfaos = await db.user.findMany({
    where: { email: { startsWith: familia, endsWith: "@exemplo.invalido" } },
    select: { id: true },
  })
  if (orfaos.length) await db.user.deleteMany({ where: { id: { in: orfaos.map((o) => o.id) } } })
  return orfaos.length
}

try {
  await varrer()
  const u = await db.user.create({ data: { email: `${familia}${Date.now()}@exemplo.invalido` } })

  const r1 = await registrarDiaAtivo(u.id, AGORA)
  checar("primeira visita abre a ofensiva em 1", r1.atual === 1, `${r1.atual}`)

  const r2 = await registrarDiaAtivo(u.id, EM("2026-08-07T23:00:00-03:00"))
  checar("segunda visita no MESMO dia não soma", r2.atual === 1, `${r2.atual}`)
  const linhas = await db.diaAtivo.count({ where: { userId: u.id } })
  checar("e não cria linha duplicada", linhas === 1, `${linhas} linha(s)`)

  // Seis dias seguidos: chega a 7 e o prêmio sai.
  for (let i = 1; i <= 6; i++) {
    await registrarDiaAtivo(u.id, new Date(AGORA.getTime() + i * 86_400_000))
  }
  const noSetimo = await lerOfensiva(u.id, new Date(AGORA.getTime() + 6 * 86_400_000))
  checar("sete dias seguidos", noSetimo.atual === 7, `${noSetimo.atual}`)

  const premios = await db.eventoPontuacao.count({ where: { userId: u.id, motivo: "streak_semana" } })
  checar("o 7º dia paga uma vez", premios === 1, `${premios} prêmio(s)`)

  // Revisitar o 7º dia não paga de novo.
  await registrarDiaAtivo(u.id, new Date(AGORA.getTime() + 6 * 86_400_000 + 3_600_000))
  const premios2 = await db.eventoPontuacao.count({ where: { userId: u.id, motivo: "streak_semana" } })
  checar("revisitar o mesmo dia não paga de novo", premios2 === 1, `${premios2} prêmio(s)`)

  // Dias 8 a 13 não pagam; o 14º paga.
  for (let i = 7; i <= 13; i++) {
    await registrarDiaAtivo(u.id, new Date(AGORA.getTime() + i * 86_400_000))
  }
  const premios3 = await db.eventoPontuacao.count({ where: { userId: u.id, motivo: "streak_semana" } })
  checar("o 14º dia paga o segundo prêmio", premios3 === 2, `${premios3} prêmio(s)`)

  // Quebra e reconstrução: o 7º dia da ofensiva NOVA volta a pagar.
  const depoisDoBuraco = new Date(AGORA.getTime() + 20 * 86_400_000)
  for (let i = 0; i < 7; i++) {
    await registrarDiaAtivo(u.id, new Date(depoisDoBuraco.getTime() + i * 86_400_000))
  }
  const nova = await lerOfensiva(u.id, new Date(depoisDoBuraco.getTime() + 6 * 86_400_000))
  checar("ofensiva nova conta do zero", nova.atual === 7, `${nova.atual}`)
  checar("e o recorde guarda a maior", nova.recorde === 14, `${nova.recorde}`)
  const premios4 = await db.eventoPontuacao.count({ where: { userId: u.id, motivo: "streak_semana" } })
  checar("reconstruir até 7 paga de novo", premios4 === 3, `${premios4} prêmio(s)`)

  await db.user.delete({ where: { id: u.id } })
  checar("apagar a conta leva os dias", (await db.diaAtivo.count({ where: { userId: u.id } })) === 0)
} finally {
  const n = await varrer()
  console.log(`\n[limpeza] ${n} usuário(s) descartável(is) removido(s)`)
  await db.$disconnect()
}

console.log(falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`)
process.exit(falhas === 0 ? 0 : 1)
