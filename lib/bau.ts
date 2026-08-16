import { db } from "@/lib/db"
import { filtroExploravel } from "@/lib/publico"
import { creditar } from "@/lib/pontos"
import { existeNoLedger } from "@/lib/coins"

/**
 * Baú de recompensas (G-11): fecha a unidade, ganha o baú.
 *
 * "Unidade" depende da trilha: no público ESCOLAR é o bloco (a unidade
 * pedagógica que já existe em Modulo.blocoId); no ADULTO é a leva de 4
 * módulos que a IA montou (RecomendacaoTrilha.leva). O refId carrega isso,
 * "bloco:X" ou "leva:N", e a unique do ledger garante que cada baú paga
 * uma vez na vida.
 *
 * Desde 15/08/2026 o baú paga XP, não moeda (economia por XP: moeda nasce só
 * da conversão na loja). O estado "já aberto" vive nos DOIS ledgers de
 * propósito: baú aberto na era das moedas está no de coins, e ignorá-lo
 * deixaria todo baú antigo abrível de novo, agora pagando XP. `abrirBau`
 * RECONFERE a completude no banco: o botão da tela é convite, não prova.
 */

export const XP_DO_BAU = 30

export interface BauDisponivel {
  refId: string
  rotulo: string
}

/** Todos os módulos do grupo estão concluídos por esta pessoa? */
async function grupoCompleto(userId: string, refId: string): Promise<{ ok: boolean; rotulo: string }> {
  const [tipo, id] = refId.split(":", 2)

  if (tipo === "bloco" && id) {
    const modulos = await db.modulo.findMany({
      // filtroExploravel de propósito: o escopo real é o blocoId, que veio de
      // um módulo que a pessoa concluiu — mesma lógica de lib/escola-acesso.ts.
      where: { ...filtroExploravel(), blocoId: id },
      select: { id: true, blocoRotulo: true },
    })
    if (modulos.length === 0) return { ok: false, rotulo: "" }
    const feitos = await db.progressoModulo.count({
      where: { userId, concluido: true, moduloId: { in: modulos.map((m) => m.id) } },
    })
    return { ok: feitos >= modulos.length, rotulo: modulos[0].blocoRotulo ?? "Unidade" }
  }

  if (tipo === "leva" && id) {
    const n = Number(id)
    if (!Number.isInteger(n) || n < 1) return { ok: false, rotulo: "" }
    const recs = await db.recomendacaoTrilha.findMany({
      where: { userId, leva: n, substituidaEm: null },
      select: { moduloId: true },
    })
    if (recs.length === 0) return { ok: false, rotulo: "" }
    const feitos = await db.progressoModulo.count({
      where: { userId, concluido: true, moduloId: { in: recs.map((r) => r.moduloId) } },
    })
    return { ok: feitos >= recs.length, rotulo: `Leva ${n}` }
  }

  return { ok: false, rotulo: "" }
}

/**
 * O módulo recém-fechado completou a unidade dele? Chamada pelo POST de
 * progresso quando `moduloConcluido` — devolve o baú a oferecer, ou null.
 */
export async function bauDaConclusao(userId: string, moduloId: string): Promise<BauDisponivel | null> {
  const m = await db.modulo.findFirst({
    where: { ...filtroExploravel(), id: moduloId },
    select: { blocoId: true, blocoRotulo: true },
  })
  if (!m) return null

  let refId: string | null = null
  if (m.blocoId) {
    refId = `bloco:${m.blocoId}`
  } else {
    const rec = await db.recomendacaoTrilha.findFirst({
      where: { userId, moduloId, substituidaEm: null },
      select: { leva: true },
    })
    if (rec) refId = `leva:${rec.leva}`
  }
  if (!refId) return null

  if (await bauJaAberto(userId, refId)) return null
  const grupo = await grupoCompleto(userId, refId)
  return grupo.ok ? { refId, rotulo: grupo.rotulo } : null
}

/** Aberto em qualquer era: no ledger de pontos (XP) ou no de coins (legado). */
export async function bauJaAberto(userId: string, refId: string): Promise<boolean> {
  const [noDePontos, noDeCoins] = await Promise.all([
    db.eventoPontuacao.findUnique({
      where: { userId_motivo_refId: { userId, motivo: "bau", refId } },
      select: { id: true },
    }),
    existeNoLedger(userId, "bau", refId),
  ])
  return !!noDePontos || noDeCoins
}

export type ResultadoBau =
  | { ok: true; xp: number; total: number }
  | { ok: false; motivo: "incompleto" | "ja_aberto" }

export async function abrirBau(userId: string, refId: string): Promise<ResultadoBau> {
  const grupo = await grupoCompleto(userId, refId)
  if (!grupo.ok) return { ok: false, motivo: "incompleto" }

  // Aberto na era das moedas? A unique do ledger de pontos não saberia disso.
  if (await existeNoLedger(userId, "bau", refId)) return { ok: false, motivo: "ja_aberto" }

  const credito = await creditar(userId, "bau", refId, XP_DO_BAU)
  if (!credito.creditado) return { ok: false, motivo: "ja_aberto" }
  return { ok: true, xp: credito.pontos, total: credito.total }
}
