import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

/**
 * Finlo Coins — a moeda do jogo (G-06/12/13), espelho fiel de lib/pontos.ts:
 * crédito é EVENTO com chave única (userId, motivo, refId), User.coins é só
 * cache, e os dois vivem na mesma transação. Farmar é impossível pela mesma
 * razão de sempre: a segunda tentativa esbarra na unique e não paga.
 *
 * O ledger também é ESTADO (ver o comentário do model EventoCoins): missão
 * resgatada, cosmético possuído e baú aberto são linhas daqui — a existência
 * responde "já?", e a unique responde "de novo não".
 *
 * Coins não compram vantagem de RANKING — compram poção (XP bônus com teto
 * próprio em pontos) e cosmético. A régua do ranking continua sendo pontos.
 */

export const COINS_POR_MOTIVO = {
  /** Concluir uma lição pela primeira vez. refId `${moduloId}:${licao}`. */
  licao: 10,
  /** Abrir o baú de um bloco/leva completo. refId "bloco:X" | "leva:N". */
  bau: 30,
  /** Resgatar uma missão diária. refId "AAAA-MM-DD:missaoId". */
  missao: 30, // teto — o valor real vem do catálogo de lib/missoes.ts
} as const

export type MotivoCoins = keyof typeof COINS_POR_MOTIVO

export interface CreditoCoins {
  creditado: boolean
  moedas: number
  total: number
}

/** Credita, uma vez só. Segunda chamada com o mesmo refId devolve o saldo sem pagar. */
export async function creditarCoins(
  userId: string,
  motivo: MotivoCoins,
  refId: string,
  moedas?: number
): Promise<CreditoCoins> {
  const teto = COINS_POR_MOTIVO[motivo]
  // Como em creditar(): o valor custom é sempre TETO, nunca substituto.
  const valor = Math.min(moedas ?? teto, teto)

  try {
    const [, u] = await db.$transaction([
      db.eventoCoins.create({ data: { userId, motivo, moedas: valor, refId } }),
      db.user.update({
        where: { id: userId },
        data: { coins: { increment: valor } },
        select: { coins: true },
      }),
    ])
    return { creditado: true, moedas: valor, total: u.coins }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const u = await db.user.findUnique({ where: { id: userId }, select: { coins: true } })
      return { creditado: false, moedas: 0, total: u?.coins ?? 0 }
    }
    throw e
  }
}

export type MotivoGasto = "compra_pocao" | "compra_item"

/**
 * Debita, se houver saldo — o `updateMany` condicionado é quem decide, então
 * duas abas comprando juntas não deixam o saldo negativo. O evento entra com
 * moedas NEGATIVAS na mesma transação; se o evento colidir na unique (mesmo
 * item comprado de novo), a transação inteira desfaz o débito.
 */
export async function debitarCoins(
  userId: string,
  motivo: MotivoGasto,
  refId: string,
  preco: number
): Promise<{ ok: boolean; motivo?: "saldo" | "repetido"; total: number }> {
  try {
    const total = await db.$transaction(async (tx) => {
      const r = await tx.user.updateMany({
        where: { id: userId, coins: { gte: preco } },
        data: { coins: { decrement: preco } },
      })
      if (r.count === 0) throw new SemSaldo()
      await tx.eventoCoins.create({ data: { userId, motivo, moedas: -preco, refId } })
      const u = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { coins: true } })
      return u.coins
    })
    return { ok: true, total }
  } catch (e) {
    if (e instanceof SemSaldo) {
      const u = await db.user.findUnique({ where: { id: userId }, select: { coins: true } })
      return { ok: false, motivo: "saldo", total: u?.coins ?? 0 }
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const u = await db.user.findUnique({ where: { id: userId }, select: { coins: true } })
      return { ok: false, motivo: "repetido", total: u?.coins ?? 0 }
    }
    throw e
  }
}

class SemSaldo extends Error {}

/** A pessoa tem esta linha no ledger? (posse de item, baú aberto, missão resgatada) */
export async function existeNoLedger(
  userId: string,
  motivo: string,
  refId: string
): Promise<boolean> {
  const linha = await db.eventoCoins.findUnique({
    where: { userId_motivo_refId: { userId, motivo, refId } },
    select: { id: true },
  })
  return !!linha
}
