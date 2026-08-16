import { db } from "@/lib/db"
import { debitarCoins, existeNoLedger } from "@/lib/coins"
import { POSE } from "@/lib/fin"

/**
 * Loja do Fin (G-06/12/13). Catálogo FIXO em código — item novo é deploy, não
 * linha de banco, pela mesma razão do catálogo de missões: vocabulário com
 * meia dúzia de entradas não paga uma tabela.
 *
 * Dois tipos: a POÇÃO (consumível — dobra os pontos da próxima lição via
 * motivo `pocao_bonus`, com teto próprio em lib/pontos.ts; a compra exige
 * `pocaoAtiva=false`, uma por vez) e AVATARES (permanentes — posse é a linha
 * `compra_item` no ledger, equipado é User.avatarFin). Coins nunca compram
 * vantagem de ranking: poção tem teto de pontos, cosmético é enfeite.
 *
 * O "tema mel" do protótipo ficou FORA — mexeria em token global de tema, e
 * isso é decisão de design da fundadora (registrado nas pendências).
 */

export interface ItemLoja {
  id: string
  tipo: "consumivel" | "avatar"
  nome: string
  descricao: string
  preco: number
  img: string
}

export const CATALOGO: readonly ItemLoja[] = [
  {
    id: "pocao",
    tipo: "consumivel",
    nome: "Poção de XP ×2",
    descricao: "Dobra os pontos da sua próxima lição. Uma por vez.",
    preco: 40,
    img: POSE.idea,
  },
  {
    id: "avatar-flex",
    tipo: "avatar",
    nome: "Fin maromba",
    descricao: "Pra quem treina o bolso todo dia.",
    preco: 50,
    img: POSE.flex,
  },
  {
    id: "avatar-fire",
    tipo: "avatar",
    nome: "Fin em chamas",
    descricao: "A ofensiva encarnada.",
    preco: 60,
    img: POSE.fire,
  },
  {
    id: "avatar-stars",
    tipo: "avatar",
    nome: "Fin estrelado",
    descricao: "Sente o brilho da precisão alta.",
    preco: 60,
    img: POSE.stars,
  },
] as const

export function itemDoCatalogo(itemId: string): ItemLoja | null {
  return CATALOGO.find((i) => i.id === itemId) ?? null
}

export type ResultadoCompra =
  | { ok: true; total: number }
  | { ok: false; motivo: "desconhecido" | "saldo" | "ja_tem" | "pocao_ativa" }

export async function comprarItem(userId: string, itemId: string): Promise<ResultadoCompra> {
  const item = itemDoCatalogo(itemId)
  if (!item) return { ok: false, motivo: "desconhecido" }

  if (item.tipo === "consumivel") {
    // Uma poção por vez: o updateMany condicionado ao estado é o freio — duas
    // abas comprando juntas ativam UMA e cobram UMA.
    const ativou = await db.user.updateMany({
      where: { id: userId, pocaoAtiva: false },
      data: { pocaoAtiva: true },
    })
    if (ativou.count === 0) return { ok: false, motivo: "pocao_ativa" }

    // refId único por compra: consumível pode ser comprado de novo depois.
    const pago = await debitarCoins(userId, "compra_pocao", `pocao:${Date.now()}:${userId.slice(-6)}`, item.preco)
    if (!pago.ok) {
      // Sem saldo: desfaz a ativação — a poção não pode existir de graça.
      await db.user.update({ where: { id: userId }, data: { pocaoAtiva: false } })
      return { ok: false, motivo: "saldo" }
    }
    return { ok: true, total: pago.total }
  }

  // Avatar: posse é a linha no ledger; a unique barra a segunda compra.
  const pago = await debitarCoins(userId, "compra_item", item.id, item.preco)
  if (!pago.ok) {
    return { ok: false, motivo: pago.motivo === "repetido" ? "ja_tem" : "saldo" }
  }
  return { ok: true, total: pago.total }
}

export type ResultadoEquipar =
  | { ok: true }
  | { ok: false; motivo: "desconhecido" | "nao_tem" }

/** Equipa (ou tira, com null) o avatar — só o que a pessoa comprou. */
export async function equiparAvatar(userId: string, itemId: string | null): Promise<ResultadoEquipar> {
  if (itemId === null) {
    await db.user.update({ where: { id: userId }, data: { avatarFin: null } })
    return { ok: true }
  }
  const item = itemDoCatalogo(itemId)
  if (!item || item.tipo !== "avatar") return { ok: false, motivo: "desconhecido" }
  if (!(await existeNoLedger(userId, "compra_item", itemId))) {
    return { ok: false, motivo: "nao_tem" }
  }
  await db.user.update({ where: { id: userId }, data: { avatarFin: itemId } })
  return { ok: true }
}

/** O que a pessoa possui + estado da poção, para a tela da loja. */
export async function estadoDaLoja(userId: string) {
  const [u, compras] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { coins: true, pontos: true, pocaoAtiva: true, avatarFin: true },
    }),
    db.eventoCoins.findMany({
      where: { userId, motivo: "compra_item" },
      select: { refId: true },
    }),
  ])
  return {
    coins: u?.coins ?? 0,
    // A banca de câmbio precisa saber quanto XP há pra trocar (15/08/2026).
    pontos: u?.pontos ?? 0,
    pocaoAtiva: u?.pocaoAtiva ?? false,
    avatarFin: u?.avatarFin ?? null,
    possuidos: new Set(compras.map((c) => c.refId)),
  }
}
