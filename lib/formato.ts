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

/**
 * Dia de um LANÇAMENTO, como dd/mm.
 *
 * Lê as partes em UTC de propósito. A data de um lançamento é um dia de
 * calendário, não um instante: quem gastou no dia 21 gastou no dia 21 em
 * qualquer fuso. Formatando em hora local, uma data gravada à meia-noite UTC
 * aparece como o dia ANTERIOR em todo o Brasil (UTC-3) — foi o que acontecia
 * com os 449 lançamentos que já estavam no banco.
 *
 * Para carimbo de tempo de verdade (criadoEm, "há 2 minutos") isto está errado:
 * ali a hora local é a certa.
 */
export function dataCurta(iso: string | Date): string {
  const d = iso instanceof Date ? iso : new Date(iso)
  if (isNaN(d.getTime())) return "--/--"
  const dia = String(d.getUTCDate()).padStart(2, "0")
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0")
  return `${dia}/${mes}`
}
