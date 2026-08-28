import { competenciaDe, dataInvalida, diaDoMes } from "./dia"

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
 * Dinheiro que veio da Stripe, que conta na MENOR unidade da moeda.
 *
 * Diferente de `brl()` acima, que recebe reais. Aqui a entrada é centavos, e a
 * moeda é parâmetro porque o valor vem de um preço configurado no painel da
 * Stripe — não de uma constante nossa. Assumir BRL funcionaria até o dia em que
 * não funcionasse, e o erro seria estampar "R$" num valor em dólar.
 *
 * AS CASAS DECIMAIS VÊM DO `Intl`, não de um `/100` fixo. A Stripe usa a menor
 * unidade de CADA moeda: BRL tem duas casas, JPY não tem nenhuma (¥1990 é mil
 * novecentos e noventa ienes, não dezenove) e KWD tem três. Dividir tudo por 100
 * transformaria o preço em iene numa conta cem vezes menor. `resolvedOptions()`
 * responde quantas casas a moeda tem, então a conversão acompanha a moeda em vez
 * de repetir uma lista aqui.
 *
 * `null` vira "-" porque a tela às vezes não tem o valor (ver
 * `lib/pagamento/preco.ts`), e "R$ 0,00" seria uma afirmação falsa: de graça.
 */
export function dinheiro(centavos: number | null | undefined, moeda = "BRL"): string {
  if (centavos == null || !isFinite(centavos)) return "-"
  try {
    const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda })
    const casas = fmt.resolvedOptions().maximumFractionDigits ?? 2
    return fmt.format(centavos / 10 ** casas)
  } catch {
    // Código de moeda inválido faz o Intl lançar RangeError. Um preço sem
    // formatação bonita é melhor que uma tela que não renderiza.
    return `${moeda} ${(centavos / 100).toFixed(2)}`
  }
}

/**
 * A periodicidade de uma assinatura, em português, para ir ao lado do valor.
 *
 * O intervalo vem da Stripe, e é por isso que não é texto fixo: "por mês"
 * escrito à mão continuaria escrito depois de alguém trocar o preço para anual
 * no painel — e aí a tela dividiria por doze o custo real na cabeça de quem lê.
 */
export function porIntervalo(intervalo: string, contagem = 1): string {
  const nomes: Record<string, [string, string]> = {
    day: ["dia", "dias"],
    week: ["semana", "semanas"],
    month: ["mês", "meses"],
    year: ["ano", "anos"],
  }
  const [singular, plural] = nomes[intervalo] ?? [intervalo, intervalo]
  return contagem > 1 ? `a cada ${contagem} ${plural}` : `por ${singular}`
}

/**
 * Dia de um LANÇAMENTO, como dd/mm.
 *
 * Quem lê a data é `lib/dia.ts`, e o porquê está lá: a data de um lançamento é
 * um dia de calendário, não um instante — quem gastou no dia 21 gastou no dia
 * 21 em qualquer fuso. Formatando em hora local, uma data gravada à meia-noite
 * UTC aparece como o dia ANTERIOR em todo o Brasil (UTC-3), que foi o que
 * aconteceu com os 449 lançamentos que já estavam no banco.
 *
 * Esta função lia a data por conta própria (`getUTCDate()` aqui, `getMonth()`
 * lá em `financas.ts`), e era metade da divergência que fechou em 28/08/2026.
 *
 * Para carimbo de tempo de verdade (criadoEm, "há 2 minutos") isto está errado:
 * ali a hora local é a certa.
 */
export function dataCurta(iso: string | Date): string {
  if (dataInvalida(iso)) return "--/--"
  const { mes } = competenciaDe(iso)
  return `${String(diaDoMes(iso)).padStart(2, "0")}/${String(mes).padStart(2, "0")}`
}
