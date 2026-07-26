// Categorias padrão, copiadas para o usuário quando ele ativa o Painel.
// Conjunto único (não mais por perfil comportamental) — o pivô mira adultos
// organizando as finanças, e estas são as categorias da especificação de Análises.
// As cores saem da paleta da identidade: azul-petróleo, âmbar e neutros.

export interface CategoriaPadrao {
  nome: string
  tipo: "receita" | "despesa"
  cor: string
}

export const categoriasPadrao: CategoriaPadrao[] = [
  // receitas
  { nome: "Salário", tipo: "receita", cor: "#4A7F63" },
  { nome: "Renda extra", tipo: "receita", cor: "#7BAEB0" },

  // despesas — a ordem espelha a da especificação
  { nome: "Moradia", tipo: "despesa", cor: "#2B6D70" },
  { nome: "Alimentação", tipo: "despesa", cor: "#B8863C" },
  { nome: "Transporte", tipo: "despesa", cor: "#7BAEB0" },
  { nome: "Lazer", tipo: "despesa", cor: "#3E6E93" },
  { nome: "Saúde", tipo: "despesa", cor: "#AA4B3E" },
  { nome: "Educação", tipo: "despesa", cor: "#A7CBCC" },
  { nome: "Investimento", tipo: "despesa", cor: "#4A7F63" },
  { nome: "Outros", tipo: "despesa", cor: "#9AA0A3" },
]
