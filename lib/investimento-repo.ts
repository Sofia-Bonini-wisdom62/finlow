import { db } from "@/lib/db"
import { cifrar, cifrarNumero, decifrar, decifrarNumero } from "@/lib/cripto"

/**
 * Ponto único de entrada/saída dos investimentos — mesma razão do
 * financeiro-repo: `nome`, `instituicao` e `valorAtual` são cifrados, e rota
 * que fala com db.investimento direto lê "v1.…" e soma zero em silêncio.
 * Só deleteMany pode ir direto: apagar não toca campo cifrado.
 */

export const TIPOS_INVESTIMENTO = ["renda_fixa", "acoes", "fundos", "cripto", "outro"] as const
export type TipoInvestimento = (typeof TIPOS_INVESTIMENTO)[number]

export const NOME_TIPO_INVESTIMENTO: Record<TipoInvestimento, string> = {
  renda_fixa: "Renda fixa",
  acoes: "Ações",
  fundos: "Fundos",
  cripto: "Cripto",
  outro: "Outros",
}

export interface InvestimentoClaro {
  id: string
  tipo: string
  nome: string
  instituicao: string | null
  valorAtual: number
  criadoEm: Date
  atualizadoEm: Date
}

type Linha = {
  id: string
  userId: string
  tipo: string
  nome: string
  instituicao: string | null
  valorAtual: string
  criadoEm: Date
  atualizadoEm: Date
}

function abrir(l: Linha): InvestimentoClaro {
  return {
    id: l.id,
    tipo: l.tipo,
    nome: decifrar(l.nome, l.userId, "nome"),
    instituicao: l.instituicao ? decifrar(l.instituicao, l.userId, "instituicao") : null,
    valorAtual: decifrarNumero(l.valorAtual, l.userId, "valorAtual"),
    criadoEm: l.criadoEm,
    atualizadoEm: l.atualizadoEm,
  }
}

export async function listarInvestimentos(userId: string): Promise<InvestimentoClaro[]> {
  const linhas = await db.investimento.findMany({
    where: { userId },
    orderBy: [{ tipo: "asc" }, { criadoEm: "asc" }],
  })
  return (linhas as Linha[]).map(abrir)
}

export async function criarInvestimento(
  userId: string,
  d: { tipo: string; nome: string; instituicao: string | null; valorAtual: number }
): Promise<InvestimentoClaro> {
  const linha = await db.investimento.create({
    data: {
      userId,
      tipo: d.tipo,
      nome: cifrar(d.nome, userId, "nome"),
      instituicao: d.instituicao ? cifrar(d.instituicao, userId, "instituicao") : null,
      valorAtual: cifrarNumero(d.valorAtual, userId, "valorAtual"),
    },
  })
  return abrir(linha as Linha)
}

export async function atualizarInvestimento(
  userId: string,
  id: string,
  d: Partial<{ tipo: string; nome: string; instituicao: string | null; valorAtual: number }>
): Promise<number> {
  // updateMany com userId no where: investimento de outro dono não atualiza
  const r = await db.investimento.updateMany({
    where: { id, userId },
    data: {
      ...(d.tipo !== undefined ? { tipo: d.tipo } : {}),
      ...(d.nome !== undefined ? { nome: cifrar(d.nome, userId, "nome") } : {}),
      ...(d.instituicao !== undefined
        ? { instituicao: d.instituicao ? cifrar(d.instituicao, userId, "instituicao") : null }
        : {}),
      ...(d.valorAtual !== undefined ? { valorAtual: cifrarNumero(d.valorAtual, userId, "valorAtual") } : {}),
    },
  })
  return r.count
}
