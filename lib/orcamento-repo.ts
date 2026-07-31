import { db } from "@/lib/db"
import { cifrarNumero, decifrarNumero } from "@/lib/cripto"

/**
 * Ponto único de entrada/saída dos orçamentos.
 *
 * `limite` é cifrado como qualquer valor financeiro. Lido direto do banco vira
 * "v1.…", e `parseFloat("v1.…")` é NaN — que vira 0 em silêncio e mostraria
 * "R$ 0 de teto" para quem definiu R$ 500. Mesmo motivo do lib/financeiro-repo.
 */

export interface Orcamento {
  id: string
  categoriaId: string | null
  limite: number
  categoria?: { nome: string; cor: string | null } | null
}

/** Progresso de um teto no mês pedido. */
export interface OrcamentoComGasto extends Orcamento {
  nome: string
  gasto: number
  restante: number
  pct: number
}

const TETO_ABSURDO = 10_000_000

export async function listarOrcamentos(userId: string): Promise<Orcamento[]> {
  const linhas = await db.orcamento.findMany({
    where: { userId },
    include: { categoria: { select: { nome: true, cor: true } } },
  })
  return linhas.map((l) => ({
    id: l.id,
    categoriaId: l.categoriaId,
    limite: decifrarNumero(l.limite, userId, "limite"),
    categoria: l.categoria,
  }))
}

/**
 * Define ou atualiza um teto. `categoriaId: null` é o teto do mês inteiro.
 *
 * Faz o upsert na mão porque a chave seria (userId, categoriaId) e o Postgres
 * trata NULL como distinto de NULL — um índice único deixaria criar vários
 * tetos globais para a mesma pessoa sem reclamar.
 */
export async function definirOrcamento(
  userId: string,
  categoriaId: string | null,
  limite: number
): Promise<Orcamento> {
  if (!Number.isFinite(limite) || limite <= 0 || limite > TETO_ABSURDO) {
    throw new Error("limite fora de escala")
  }

  if (categoriaId) {
    // A categoria tem de ser da própria pessoa — senão dá para pendurar um
    // teto na categoria de outra conta mandando um id adivinhado.
    const dona = await db.categoria.findFirst({ where: { id: categoriaId, userId } })
    if (!dona) throw new Error("categoria não é sua")
  }

  const existente = await db.orcamento.findFirst({ where: { userId, categoriaId } })
  const dados = { limite: cifrarNumero(limite, userId, "limite") }

  const linha = existente
    ? await db.orcamento.update({
        where: { id: existente.id },
        data: dados,
        include: { categoria: { select: { nome: true, cor: true } } },
      })
    : await db.orcamento.create({
        data: { userId, categoriaId, ...dados },
        include: { categoria: { select: { nome: true, cor: true } } },
      })

  return {
    id: linha.id,
    categoriaId: linha.categoriaId,
    limite,
    categoria: linha.categoria,
  }
}

export async function apagarOrcamento(userId: string, id: string): Promise<boolean> {
  const r = await db.orcamento.deleteMany({ where: { id, userId } })
  return r.count > 0
}

/**
 * Cruza os tetos com o que já foi gasto no mês.
 *
 * `gastos` vem de fora (das transações já decifradas) em vez de ser buscado
 * aqui: quem chama normalmente já tem o mês inteiro em mãos, e buscar de novo
 * seria decifrar centenas de linhas duas vezes na mesma requisição.
 */
export function cruzarComGasto(
  orcamentos: Orcamento[],
  gastos: { nomeCategoria: string | null; valor: number }[]
): OrcamentoComGasto[] {
  const totalGeral = gastos.reduce((s, g) => s + g.valor, 0)

  const porCategoria = new Map<string, number>()
  for (const g of gastos) {
    const k = g.nomeCategoria ?? "Sem categoria"
    porCategoria.set(k, (porCategoria.get(k) ?? 0) + g.valor)
  }

  return orcamentos
    .map((o) => {
      const nome = o.categoriaId ? (o.categoria?.nome ?? "Categoria") : "Todo o mês"
      const gasto = o.categoriaId ? (porCategoria.get(nome) ?? 0) : totalGeral
      return {
        ...o,
        nome,
        gasto,
        restante: o.limite - gasto,
        // Passa de 100 de propósito: cortar em 100 esconderia o tamanho do
        // estouro, que é justamente a informação que importa nessa hora.
        pct: o.limite > 0 ? Math.round((gasto / o.limite) * 100) : 0,
      }
    })
    // Teto do mês inteiro primeiro; depois, o mais apertado no topo.
    .sort((a, b) => (a.categoriaId === null ? -1 : b.categoriaId === null ? 1 : b.pct - a.pct))
}
