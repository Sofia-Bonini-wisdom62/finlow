// Contratos do client do Painel. Decimal do Prisma serializa como string no JSON.
export interface CategoriaData {
  id: string
  nome: string
  tipo: "receita" | "despesa"
  cor: string | null
  padrao: boolean
}

export interface ContaFixaData {
  id: string
  nome: string
  valor: string
  diaVencimento: number | null
  ativa: boolean
}

export interface TransacaoData {
  id: string
  descricao: string
  valor: string
  tipo: "receita" | "despesa"
  categoriaId: string | null
  categoria?: { nome: string; cor: string | null } | null
  data: string
}
