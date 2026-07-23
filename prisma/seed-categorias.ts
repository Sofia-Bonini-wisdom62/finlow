// Categorias padrão por perfil comportamental (spec do Painel, seção 3.1).
// NÃO são globais: são copiadas pro usuário no momento em que ele ativa o
// Painel (PATCH /api/painel/consentimento). Cada perfil ganha categorias
// alinhadas com o que a trilha dele ensina (ver lib/perfis.ts).
import type { TipoPerfil } from "@/types/trilha"

export interface CategoriaPadrao {
  nome: string
  tipo: "receita" | "despesa"
  cor: string
}

const RECEITAS_COMUNS: CategoriaPadrao[] = [
  { nome: "Mesada", tipo: "receita", cor: "#00C896" },
  { nome: "Freela / Bico", tipo: "receita", cor: "#4FD1C5" },
]

export const categoriasPadraoPorPerfil: Record<TipoPerfil, CategoriaPadrao[]> = {
  // Lançador: gastos pequenos e invisíveis (M1) — dar nome é dar visibilidade
  lancador: [
    ...RECEITAS_COMUNS,
    { nome: "Delivery", tipo: "despesa", cor: "#F5A623" },
    { nome: "Streaming", tipo: "despesa", cor: "#9F7AEA" },
    { nome: "Rolê", tipo: "despesa", cor: "#63B3ED" },
    { nome: "Respiro (guardado)", tipo: "despesa", cor: "#00C896" },
  ],
  // Guardador: o destino do que guarda (M2/M3) + permissão de curtir
  guardador: [
    ...RECEITAS_COMUNS,
    { nome: "Investimento", tipo: "despesa", cor: "#00C896" },
    { nome: "Reserva", tipo: "despesa", cor: "#4FD1C5" },
    { nome: "Valor livre (curtir)", tipo: "despesa", cor: "#F5A623" },
  ],
  // Impulsivo: separar o planejado do impulso (M2/M4) é o mapa do perfil
  impulsivo: [
    ...RECEITAS_COMUNS,
    { nome: "Compra por impulso", tipo: "despesa", cor: "#F5A623" },
    { nome: "Compra planejada (da lista)", tipo: "despesa", cor: "#00C896" },
    { nome: "Lanches", tipo: "despesa", cor: "#63B3ED" },
    { nome: "Rolê", tipo: "despesa", cor: "#9F7AEA" },
  ],
  // Sonhador: a meta em primeiro lugar (M1/M2) — o sonho vira linha de registro
  sonhador: [
    ...RECEITAS_COMUNS,
    { nome: "Meu sonho (guardado)", tipo: "despesa", cor: "#00C896" },
    { nome: "Rolê", tipo: "despesa", cor: "#F5A623" },
    { nome: "Lanches", tipo: "despesa", cor: "#63B3ED" },
  ],
}

// fallback pra usuário que ativou o Painel sem ter feito o diagnóstico
export const categoriasPadraoGenericas: CategoriaPadrao[] = [
  ...RECEITAS_COMUNS,
  { nome: "Lanches", tipo: "despesa", cor: "#F5A623" },
  { nome: "Rolê", tipo: "despesa", cor: "#63B3ED" },
  { nome: "Guardado", tipo: "despesa", cor: "#00C896" },
]
