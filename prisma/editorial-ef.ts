/**
 * As decisões que a fonte do Fundamental NÃO resolve.
 *
 * Separado do conversor de propósito, como em `editorial-em.ts`: dá para
 * revisar as escolhas sem ler código. A diferença é o tamanho — aqui só
 * entram exceções, porque `scripts/portar-ef.mts` deriva o resto da própria
 * fonte. Entrada vazia é o normal.
 *
 * `cores`: por índice de faixa. O padrão é verde, e isso é decisão: no
 * Fundamental a tela de resultado devolve o que a criança respondeu, não a
 * julga. "Você encontrou 3 moedas" não é bom nem ruim. Amarelo e vermelho
 * ficam para o que o texto da própria fonte trata como ressalva.
 *
 * `emoji`: o ícone do campo de input. O conversor usa ✏️ quando não há.
 */

export interface EditorialModuloEF {
  emoji?: string
  cores?: ("green" | "yellow" | "red")[]
  /** Condição já na gramática de lib/resultado.ts, para as regras em prosa. */
  condicoes?: string[]
}

export const EDITORIAL_EF: Record<string, EditorialModuloEF> = {
  // Preenchido a partir do que `portar-ef.mts` cobrar.
}
