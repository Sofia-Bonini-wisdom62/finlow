import type { SaldoDiario } from "@/types/extrato"

/**
 * Lê os saldos diários direto do TEXTO do extrato, sem passar pelo modelo.
 *
 * POR QUE NÃO PEDIR ISSO AO MODELO
 * Foi a primeira tentativa e degradou a extração de forma brutal: pedindo
 * transações + saldos diários na mesma chamada, o modelo devolveu os 54 saldos
 * e só as 14 transações do primeiro dia — 438 linhas viraram 14. As duas
 * tarefas competem por atenção na mesma resposta.
 *
 * E tem um motivo melhor, que só ficou claro depois: o saldo serve para
 * CONFERIR o que o modelo extraiu. Se ele produzisse os dois, estaria
 * corrigindo a própria prova — um modelo que inventa uma transação pode
 * inventar o saldo que a justifica. Lido aqui, o saldo é testemunha
 * independente.
 *
 * Saldo diário é texto rígido e repetitivo no documento; regex dá conta, custa
 * zero token e não varia entre execuções. Banco cujo formato não casar devolve
 * lista vazia, e a validação simplesmente cai no que já existia — sem regressão.
 */

const MESES: Record<string, number> = {
  janeiro: 1, fevereiro: 2, março: 3, marco: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
}

const ROTULO = String.raw`Saldo\s+(?:ao\s+final\s+d[oa]\s+dia|d[oe]\s+dia|final\s+d[oe]\s+dia)`
const VALOR = String.raw`(−|-)?\s*R\$\s*([\d.]+,\d{2})`

/** "27 de julho 2026 Saldo ao final do dia: R$ 26,99" */
const POR_EXTENSO = new RegExp(
  String.raw`(\d{1,2})\s+de\s+([a-zà-ú]+)\s+(?:de\s+)?(\d{4})[\s\S]{0,40}?${ROTULO}\s*:?\s*${VALOR}`,
  "gi"
)

/** "27/07/2026 Saldo do dia: R$ 26,99" */
const NUMERICA = new RegExp(
  String.raw`(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})[\s\S]{0,40}?${ROTULO}\s*:?\s*${VALOR}`,
  "gi"
)

function paraNumero(sinal: string | undefined, valor: string): number {
  const n = parseFloat(valor.replace(/\./g, "").replace(",", "."))
  return sinal ? -n : n
}

function iso(ano: number, mes: number, dia: number): string | null {
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
}

export function lerSaldosDiarios(texto: string): SaldoDiario[] {
  const achados = new Map<string, number>()

  for (const m of texto.matchAll(POR_EXTENSO)) {
    const mes = MESES[m[2].toLowerCase()]
    if (!mes) continue
    const data = iso(Number(m[3]), mes, Number(m[1]))
    if (data) achados.set(data, paraNumero(m[4], m[5]))
  }

  for (const m of texto.matchAll(NUMERICA)) {
    const anoBruto = Number(m[3])
    const ano = anoBruto < 100 ? 2000 + anoBruto : anoBruto
    const data = iso(ano, Number(m[2]), Number(m[1]))
    // Não sobrescreve o que a forma por extenso já achou: ela é menos ambígua
    // (não tem risco de trocar dia por mês).
    if (data && !achados.has(data)) achados.set(data, paraNumero(m[4], m[5]))
  }

  return [...achados.entries()]
    .map(([data, saldo]) => ({ data, saldo }))
    .sort((a, b) => a.data.localeCompare(b.data))
}
