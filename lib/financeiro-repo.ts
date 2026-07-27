import { db } from "@/lib/db"
import { cifrar, cifrarNumero, decifrar, decifrarNumero } from "@/lib/cripto"

/**
 * Ponto único de entrada/saída dos dados financeiros cifrados.
 *
 * Existe para que nenhuma rota fale com db.transacao/db.contaFixa direto: se
 * uma esquecer de decifrar, o usuário vê "v1.VQ3H…" no lugar do valor; se uma
 * esquecer de cifrar, um registro entra em claro no banco e a camada de
 * segurança vira queijo suíço sem ninguém notar. Concentrar aqui torna isso
 * uma decisão de um arquivo só.
 */

export interface TransacaoClara {
  id: string
  userId: string
  descricao: string
  valor: number
  tipo: string
  categoriaId: string | null
  data: Date
  criadoEm: Date
  categoria?: { nome: string; cor: string | null } | null
}

export interface ContaFixaClara {
  id: string
  userId: string
  nome: string
  valor: number
  diaVencimento: number | null
  ativa: boolean
  criadoEm: Date
}

type LinhaTransacao = {
  id: string; userId: string; descricao: string; valor: string; tipo: string
  categoriaId: string | null; data: Date; criadoEm: Date
  categoria?: { nome: string; cor: string | null } | null
}

type LinhaContaFixa = {
  id: string; userId: string; nome: string; valor: string
  diaVencimento: number | null; ativa: boolean; criadoEm: Date
}

function abrirTransacao(t: LinhaTransacao): TransacaoClara {
  return {
    ...t,
    descricao: decifrar(t.descricao, t.userId, "descricao"),
    valor: decifrarNumero(t.valor, t.userId, "valor"),
  }
}

function abrirContaFixa(c: LinhaContaFixa): ContaFixaClara {
  return {
    ...c,
    nome: decifrar(c.nome, c.userId, "nome"),
    valor: decifrarNumero(c.valor, c.userId, "valor"),
  }
}

// ---------- leitura ----------

export async function listarTransacoes(
  userId: string,
  opcoes?: { mes?: number; ano?: number; ordem?: "asc" | "desc"; comCategoria?: boolean }
): Promise<TransacaoClara[]> {
  const { mes, ano, ordem = "asc", comCategoria = true } = opcoes ?? {}

  // O filtro por data continua no BANCO porque `data` fica em claro — de outra
  // forma toda tela teria de puxar o histórico inteiro para filtrar em memória.
  const filtroData =
    mes && ano && mes >= 1 && mes <= 12 && ano > 2000
      ? { data: { gte: new Date(ano, mes - 1, 1), lt: new Date(ano, mes, 1) } }
      : {}

  const linhas = await db.transacao.findMany({
    where: { userId, ...filtroData },
    ...(comCategoria ? { include: { categoria: { select: { nome: true, cor: true } } } } : {}),
    orderBy: { data: ordem },
  })
  return (linhas as LinhaTransacao[]).map(abrirTransacao)
}

export async function listarContasFixas(
  userId: string,
  opcoes?: { apenasAtivas?: boolean }
): Promise<ContaFixaClara[]> {
  const linhas = await db.contaFixa.findMany({
    where: { userId, ...(opcoes?.apenasAtivas ? { ativa: true } : {}) },
    orderBy: { criadoEm: "asc" },
  })
  return (linhas as LinhaContaFixa[]).map(abrirContaFixa)
}

// ---------- escrita ----------

export async function criarTransacao(
  userId: string,
  d: { descricao: string; valor: number; tipo: string; categoriaId: string | null; data: Date }
): Promise<TransacaoClara> {
  const linha = await db.transacao.create({
    data: {
      userId,
      descricao: cifrar(d.descricao, userId, "descricao"),
      valor: cifrarNumero(d.valor, userId, "valor"),
      tipo: d.tipo,
      categoriaId: d.categoriaId,
      data: d.data,
    },
  })
  return abrirTransacao(linha as LinhaTransacao)
}

export async function atualizarTransacao(
  userId: string,
  id: string,
  d: Partial<{ descricao: string; valor: number; tipo: string; categoriaId: string | null; data: Date }>
): Promise<number> {
  // updateMany com userId no where impede editar transação de outro dono
  const r = await db.transacao.updateMany({
    where: { id, userId },
    data: {
      ...(d.descricao !== undefined ? { descricao: cifrar(d.descricao, userId, "descricao") } : {}),
      ...(d.valor !== undefined ? { valor: cifrarNumero(d.valor, userId, "valor") } : {}),
      ...(d.tipo !== undefined ? { tipo: d.tipo } : {}),
      ...(d.categoriaId !== undefined ? { categoriaId: d.categoriaId } : {}),
      ...(d.data !== undefined ? { data: d.data } : {}),
    },
  })
  return r.count
}

export async function criarContaFixa(
  userId: string,
  d: { nome: string; valor: number; diaVencimento: number | null }
): Promise<ContaFixaClara> {
  const linha = await db.contaFixa.create({
    data: {
      userId,
      nome: cifrar(d.nome, userId, "nome"),
      valor: cifrarNumero(d.valor, userId, "valor"),
      diaVencimento: d.diaVencimento,
    },
  })
  return abrirContaFixa(linha as LinhaContaFixa)
}

export async function atualizarContaFixa(
  userId: string,
  id: string,
  d: Partial<{ nome: string; valor: number; diaVencimento: number | null; ativa: boolean }>
): Promise<number> {
  const r = await db.contaFixa.updateMany({
    where: { id, userId },
    data: {
      ...(d.nome !== undefined ? { nome: cifrar(d.nome, userId, "nome") } : {}),
      ...(d.valor !== undefined ? { valor: cifrarNumero(d.valor, userId, "valor") } : {}),
      ...(d.diaVencimento !== undefined ? { diaVencimento: d.diaVencimento } : {}),
      ...(d.ativa !== undefined ? { ativa: d.ativa } : {}),
    },
  })
  return r.count
}
