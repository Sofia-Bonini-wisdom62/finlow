import { db } from "@/lib/db"

/**
 * Conversão de XP em moedas (decisão da fundadora, 15/08/2026).
 *
 * A economia inteira passa por aqui: lição, missão e baú pagam XP; o XP
 * alimenta o ranking e é a ÚNICA origem de moeda; a moeda compra os itens da
 * loja. Converter DESCONTA do XP total de propósito, e o ranking e o nível
 * caem junto: gastar é uma escolha com preço, não um número paralelo.
 *
 * As duas pontas na MESMA transação: o débito de pontos (evento negativo no
 * ledger de pontos) e o crédito de moedas (evento no ledger de coins) entram
 * com o MESMO refId, gerado por compra. Se qualquer perna falhar, nada muda,
 * e `recalcularTotal` de cada ledger continua batendo com os caches.
 *
 * O `updateMany` condicionado a `pontos >= xp` é quem decide se há saldo:
 * duas abas convertendo juntas não deixam o XP negativo.
 */

import { PACOTES_DE_MOEDAS, type PacoteId } from "@/lib/pacotes-moedas"

export { PACOTES_DE_MOEDAS, type PacoteId }

export type ResultadoConversao =
  | { ok: true; xp: number; moedas: number; pontosTotal: number; coinsTotal: number }
  | { ok: false; motivo: "pacote" | "sem_xp" }

class SemXp extends Error {}

export async function converterXpEmMoedas(
  userId: string,
  pacoteId: string
): Promise<ResultadoConversao> {
  const pacote = PACOTES_DE_MOEDAS[pacoteId as PacoteId]
  if (!pacote) return { ok: false, motivo: "pacote" }

  // Um refId por compra: a conversão é repetível por natureza, e o que liga
  // as duas pernas no extrato é as duas carregarem a mesma referência.
  const refId = `conv:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`

  try {
    const totais = await db.$transaction(async (tx) => {
      const r = await tx.user.updateMany({
        where: { id: userId, pontos: { gte: pacote.xp } },
        data: { pontos: { decrement: pacote.xp }, coins: { increment: pacote.moedas } },
      })
      if (r.count === 0) throw new SemXp()
      await tx.eventoPontuacao.create({
        data: { userId, motivo: "compra_moedas", pontos: -pacote.xp, refId },
      })
      await tx.eventoCoins.create({
        data: { userId, motivo: "conversao", moedas: pacote.moedas, refId },
      })
      return tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { pontos: true, coins: true },
      })
    })
    return {
      ok: true,
      xp: pacote.xp,
      moedas: pacote.moedas,
      pontosTotal: totais.pontos,
      coinsTotal: totais.coins,
    }
  } catch (e) {
    if (e instanceof SemXp) return { ok: false, motivo: "sem_xp" }
    throw e
  }
}
