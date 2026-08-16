import { db } from "@/lib/db"
import { creditar, inicioDoDiaSP } from "@/lib/pontos"
import { existeNoLedger } from "@/lib/coins"

/**
 * Missões diárias (G-08) — renovam à meia-noite de São Paulo.
 *
 * O PROGRESSO É DERIVADO, nunca acumulado: as três missões são leituras de
 * ProgressoLicao do dia, então não existe tabela de progresso para
 * dessincronizar, e "renovar à meia-noite" é só o recorte de data mudando —
 * ninguém zera nada. O único estado é o RESGATE, uma linha de ledger com o
 * dia no refId (`AAAA-MM-DD:missaoId`): amanhã o refId é outro, e a mesma
 * missão paga de novo. Ontem, nunca mais.
 *
 * Desde 15/08/2026 a missão paga XP, não moeda (economia por XP: moeda nasce
 * só da conversão na loja). O resgate mora no ledger de PONTOS; o de coins
 * ainda é consultado como legado, para o dia da virada não pagar em dobro o
 * que já foi resgatado em moeda.
 *
 * O resgate RECONFERE a condição no servidor: o botão da tela é convite,
 * não prova.
 */

export const MISSOES = [
  { id: "licao_do_dia", titulo: "Complete 1 lição hoje", meta: 1, xp: 10 },
  { id: "tres_licoes", titulo: "Complete 3 lições hoje", meta: 3, xp: 15 },
  { id: "acerto_cheio", titulo: "Feche uma lição com 100% de acerto", meta: 1, xp: 15 },
] as const

export type MissaoId = (typeof MISSOES)[number]["id"]

export interface EstadoMissao {
  id: MissaoId
  titulo: string
  meta: number
  xp: number
  progresso: number
  completa: boolean
  resgatada: boolean
}

/** "AAAA-MM-DD" do dia de SP — o pedaço do refId que faz a missão renovar. */
export function diaISO(agora = new Date()): string {
  return inicioDoDiaSP(agora).toISOString().slice(0, 10)
}

function refDaMissao(id: MissaoId, agora: Date): string {
  return `${diaISO(agora)}:${id}`
}

async function medir(userId: string, agora: Date): Promise<Record<MissaoId, number>> {
  const doDia = await db.progressoLicao.findMany({
    where: { userId, concluido: true, concluidoEm: { gte: inicioDoDiaSP(agora) } },
    select: { acertos: true, totalQuiz: true },
  })
  const licoes = doDia.length
  const cheias = doDia.filter((l) => l.totalQuiz > 0 && l.acertos === l.totalQuiz).length
  return { licao_do_dia: licoes, tres_licoes: licoes, acerto_cheio: cheias }
}

export async function estadoDasMissoes(userId: string, agora = new Date()): Promise<EstadoMissao[]> {
  const [medidas, resgates, resgatesLegado] = await Promise.all([
    medir(userId, agora),
    db.eventoPontuacao.findMany({
      where: { userId, motivo: "missao", refId: { startsWith: diaISO(agora) } },
      select: { refId: true },
    }),
    // Legado da virada para XP: resgate de hoje pago em moeda ainda conta.
    db.eventoCoins.findMany({
      where: { userId, motivo: "missao", refId: { startsWith: diaISO(agora) } },
      select: { refId: true },
    }),
  ])
  const resgatadas = new Set([...resgates, ...resgatesLegado].map((r) => r.refId))
  return MISSOES.map((m) => {
    const progresso = Math.min(m.meta, medidas[m.id])
    return {
      ...m,
      progresso,
      completa: progresso >= m.meta,
      resgatada: resgatadas.has(refDaMissao(m.id, agora)),
    }
  })
}

export type ResgateMissao =
  | { ok: true; xp: number; total: number }
  | { ok: false; motivo: "desconhecida" | "incompleta" | "ja_resgatada" }

export async function resgatarMissao(
  userId: string,
  missaoId: string,
  agora = new Date()
): Promise<ResgateMissao> {
  const missao = MISSOES.find((m) => m.id === missaoId)
  if (!missao) return { ok: false, motivo: "desconhecida" }

  const medidas = await medir(userId, agora)
  if (medidas[missao.id] < missao.meta) return { ok: false, motivo: "incompleta" }

  const ref = refDaMissao(missao.id, agora)
  // Já pago em moeda hoje (antes da virada)? Não paga de novo em XP.
  if (await existeNoLedger(userId, "missao", ref)) return { ok: false, motivo: "ja_resgatada" }

  const credito = await creditar(userId, "missao", ref, missao.xp)
  if (!credito.creditado) return { ok: false, motivo: "ja_resgatada" }
  return { ok: true, xp: credito.pontos, total: credito.total }
}
