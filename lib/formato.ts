/**
 * Texto digitado → número. Aceita o jeito brasileiro de escrever dinheiro.
 *
 * O Painel fazia só `valor.replace(",", ".")`, então "1.234,56" virava
 * "1.234.56" e o servidor devolvia "Valor inválido". Passava despercebido
 * enquanto os exemplos eram de dezenas de reais; com valores de adulto na
 * casa dos milhares, digitar o ponto de milhar é o caminho natural.
 *
 * Regra: remove o ponto que separa milhar (seguido de exatamente 3 dígitos) e
 * trata a vírgula como decimal. "1.234,56" → 1234.56 · "1234,56" → 1234.56
 * · "1.5" → 1.5 (sem 3 dígitos depois, o ponto é decimal mesmo).
 */
export function paraNumero(v: string | number): number {
  if (typeof v === "number") return isFinite(v) ? v : 0
  const limpo = String(v)
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".")
  const n = parseFloat(limpo)
  return isFinite(n) ? n : NaN
}

// Formatação BR pra valores do Painel
export function brl(v: number | string): string {
  const n = typeof v === "string" ? parseFloat(v) : v
  if (!isFinite(n)) return "R$ 0,00"
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function dataCurta(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}
