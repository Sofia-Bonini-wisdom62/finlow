// Contratos do client do Painel.
//
// `valor` era string porque o Decimal do Prisma serializa assim no JSON. Com a
// criptografia, a coluna virou texto cifrado e quem decifra é lib/financeiro-repo,
// que devolve número — então a API passou a mandar número. Manter `string` aqui
// compilava (parseFloat aceita number por coerção) e escondia a mentira.
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
  valor: number
  diaVencimento: number | null
  ativa: boolean
}

export interface TransacaoData {
  id: string
  descricao: string
  valor: number
  tipo: "receita" | "despesa"
  categoriaId: string | null
  categoria?: { nome: string; cor: string | null } | null
  data: string
}
