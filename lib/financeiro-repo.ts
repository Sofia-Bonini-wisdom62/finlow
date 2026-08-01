import { randomUUID } from "node:crypto"
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
  confirmado: boolean
  origem: string
  extratoImportId: string | null
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
  confirmado: boolean; origem: string; extratoImportId: string | null
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
  opcoes?: {
    mes?: number
    ano?: number
    ordem?: "asc" | "desc"
    comCategoria?: boolean
    /** "confirmadas" é o padrão: o que veio de extrato e ainda não foi revisado
     *  NÃO pode aparecer em Análises, Perfil nem no contexto da IA. */
    incluir?: "confirmadas" | "todas" | "pendentes"
    extratoImportId?: string
  }
): Promise<TransacaoClara[]> {
  const { mes, ano, ordem = "asc", comCategoria = true, incluir = "confirmadas", extratoImportId } = opcoes ?? {}

  const filtroConfirmacao =
    incluir === "todas" ? {} : { confirmado: incluir === "confirmadas" }

  // O filtro por data continua no BANCO porque `data` fica em claro — de outra
  // forma toda tela teria de puxar o histórico inteiro para filtrar em memória.
  const filtroData =
    mes && ano && mes >= 1 && mes <= 12 && ano > 2000
      ? { data: { gte: new Date(ano, mes - 1, 1), lt: new Date(ano, mes, 1) } }
      : {}

  const linhas = await db.transacao.findMany({
    where: {
      userId,
      ...filtroData,
      ...filtroConfirmacao,
      ...(extratoImportId ? { extratoImportId } : {}),
    },
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
  d: {
    descricao: string
    valor: number
    tipo: string
    categoriaId: string | null
    data: Date
    /** "manual" (padrão), "chat", "ajuste". Diz de onde a linha veio. */
    origem?: string
    /** Amarra a linha ao extrato que a originou, para dar para desfazer junto. */
    extratoImportId?: string | null
    /**
     * Só passe false para criar linha pendente de propósito.
     *
     * O default do BANCO é false (SPEC v3 §3): ele protege contra caminho novo
     * que esqueça o campo — esquecer produz linha pendente, visível e
     * inofensiva, em vez de dinheiro contado sem ninguém ter confirmado.
     *
     * Aqui o default é true, e as duas coisas não se contradizem: esta função
     * SÓ é chamada depois de uma ação deliberada da pessoa (lançar na mão,
     * tocar em Confirmar no card, aceitar a linha de ajuste). O banco protege
     * o descuido; a função descreve a intenção.
     */
    confirmado?: boolean
  }
): Promise<TransacaoClara> {
  const linha = await db.transacao.create({
    data: {
      userId,
      descricao: cifrar(d.descricao, userId, "descricao"),
      valor: cifrarNumero(d.valor, userId, "valor"),
      tipo: d.tipo,
      categoriaId: d.categoriaId,
      data: d.data,
      confirmado: d.confirmado ?? true,
      ...(d.origem ? { origem: d.origem } : {}),
      ...(d.extratoImportId ? { extratoImportId: d.extratoImportId } : {}),
    },
  })
  return abrirTransacao(linha as LinhaTransacao)
}

/**
 * Grava em lote o que veio de um extrato. Nasce SEMPRE confirmado: false —
 * o dash só passa a contar depois que a pessoa revisar linha a linha.
 */
export async function criarTransacoesDeExtrato(
  userId: string,
  extratoImportId: string,
  itens: { descricao: string; valor: number; tipo: string; categoriaId: string | null; data: Date }[]
): Promise<TransacaoClara[]> {
  if (itens.length === 0) return []

  // Antes eram N `create` dentro de uma transação — uma ida ao banco POR LINHA.
  // Num extrato real de 142 lançamentos isso custava ~20s sobre o pooler, mais
  // do que metade do tempo total da requisição, e sozinho ameaçava estourar o
  // limite de duração da função.
  //
  // O motivo de não usar createMany era que ele não devolve as linhas criadas,
  // e a tela de confirmação precisa dos ids. Resolvido gerando os ids aqui: o
  // id deixa de ser algo que o banco informa e passa a ser algo que já sabemos.
  const linhas = itens.map((i) => ({
    id: randomUUID(),
    userId,
    descricao: cifrar(i.descricao, userId, "descricao"),
    valor: cifrarNumero(i.valor, userId, "valor"),
    tipo: i.tipo,
    categoriaId: i.categoriaId,
    data: i.data,
    confirmado: false,
    origem: "extrato",
    extratoImportId,
    criadoEm: new Date(),
  }))

  await db.transacao.createMany({ data: linhas })
  return linhas.map((l) => abrirTransacao(l as LinhaTransacao))
}

/** Confirma as aceitas e apaga as recusadas, numa transação só. */
export async function confirmarLoteExtrato(
  userId: string,
  extratoImportId: string,
  idsAceitos: string[]
): Promise<{ confirmadas: number; descartadas: number }> {
  const [confirmadas, descartadas] = await db.$transaction([
    db.transacao.updateMany({
      where: { userId, extratoImportId, id: { in: idsAceitos } },
      data: { confirmado: true },
    }),
    db.transacao.deleteMany({
      where: { userId, extratoImportId, id: { notIn: idsAceitos }, confirmado: false },
    }),
  ])
  return { confirmadas: confirmadas.count, descartadas: descartadas.count }
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
