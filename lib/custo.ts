/**
 * Custo das chamadas à Vertex AI.
 *
 * A tabela é constante nomeada com data de verificação de propósito: preço de
 * modelo muda, e um número solto no meio do código vira mentira silenciosa
 * meses depois. Se o modelo trocar, esta tabela é o primeiro lugar a revisar.
 */

// Preços por 1M de tokens, em USD — verificados em 26/07/2026.
// REVISAR em toda troca de modelo.
export const PRECOS = {
  "gemini-3-flash": { in: 0.5, out: 3.0 },
  "gemini-3.1-flash-lite": { in: 0.25, out: 1.5 },
} as const

export type ModeloComPreco = keyof typeof PRECOS

// Só para o painel interno de custo. Não serve para cobrar ninguém.
export const USD_BRL_ESTIMADO = 5.4

export interface CustoEstimado {
  usd: number
  brl: number
  precoConhecido: boolean
}

export function estimarCustoBRL(
  tokensIn: number,
  tokensOut: number,
  modelo: string
): CustoEstimado {
  const preco = PRECOS[modelo as ModeloComPreco]
  if (!preco) {
    // Modelo fora da tabela: devolve zero E avisa, em vez de chutar um preço.
    // Custo subestimado em silêncio é pior que custo desconhecido.
    return { usd: 0, brl: 0, precoConhecido: false }
  }
  const usd = (tokensIn / 1_000_000) * preco.in + (tokensOut / 1_000_000) * preco.out
  return {
    usd: Number(usd.toFixed(6)),
    brl: Number((usd * USD_BRL_ESTIMADO).toFixed(4)),
    precoConhecido: true,
  }
}
