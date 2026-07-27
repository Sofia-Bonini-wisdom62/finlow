import type { ExtratoParseado } from "@/types/extrato"

/**
 * Portão de qualidade do parsing.
 *
 * O produto vende "esse número é verdade". Número que não passou por aqui não
 * chega na tela — nem parcialmente, nem com aviso. É melhor mandar a pessoa
 * pelo CSV do que mostrar um saldo que pode estar errado.
 */

export const TOLERANCIA_REAIS = 0.05
const VALOR_ABSURDO = 500_000

export type ResultadoValidacao =
  | { ok: true; forte: boolean }
  | { ok: false; motivo: string; divergencia?: number }

function centavos(n: number): number {
  return Math.round(n * 100)
}

export function validarExtrato(e: ExtratoParseado): ResultadoValidacao {
  if (e.transacoes.length === 0) {
    return { ok: false, motivo: "Nenhuma transação foi encontrada no documento." }
  }

  // ---- validação forte: a soma tem que fechar com o saldo declarado ----
  if (e.saldoInicial !== null && e.saldoFinal !== null) {
    // Soma em centavos inteiros: somar float acumula erro e a tolerância de
    // R$0,05 acabaria julgando o arredondamento, não o parsing.
    const soma = e.transacoes.reduce((s, t) => s + centavos(t.valor), centavos(e.saldoInicial))
    const diferenca = (soma - centavos(e.saldoFinal)) / 100

    if (Math.abs(diferenca) > TOLERANCIA_REAIS) {
      return {
        ok: false,
        motivo: `A soma das transações diverge do saldo declarado em R$ ${Math.abs(diferenca).toFixed(2)}.`,
        divergencia: diferenca,
      }
    }
    return { ok: true, forte: true }
  }

  // ---- validação fraca: sem saldo declarado, checa o que dá ----
  const inicio = new Date(e.periodoInicio)
  const fim = new Date(e.periodoFim)
  if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
    return { ok: false, motivo: "O período do extrato não pôde ser lido." }
  }
  if (inicio > fim) {
    return { ok: false, motivo: "O período do extrato está invertido." }
  }

  for (const t of e.transacoes) {
    const d = new Date(t.data)
    if (isNaN(d.getTime())) {
      return { ok: false, motivo: "Uma das transações veio com data ilegível." }
    }
    // margem de 1 dia: alguns bancos lançam a última compra no dia do fechamento
    const foraDoPeriodo =
      d.getTime() < inicio.getTime() - 86_400_000 || d.getTime() > fim.getTime() + 86_400_000
    if (foraDoPeriodo) {
      return { ok: false, motivo: "Uma transação caiu fora do período declarado no extrato." }
    }
    if (Math.abs(t.valor) > VALOR_ABSURDO) {
      return { ok: false, motivo: "Um valor lido está fora de qualquer escala plausível." }
    }
  }

  return { ok: true, forte: false }
}

/** Recorta para os 3 meses mais recentes. Devolve se algo foi cortado. */
export function limitarA3Meses(e: ExtratoParseado): { extrato: ExtratoParseado; cortou: boolean } {
  const fim = new Date(e.periodoFim)
  if (isNaN(fim.getTime())) return { extrato: e, cortou: false }

  const corte = new Date(fim)
  corte.setMonth(corte.getMonth() - 3)

  const dentro = e.transacoes.filter((t) => new Date(t.data) >= corte)
  if (dentro.length === e.transacoes.length) return { extrato: e, cortou: false }

  return {
    // saldoInicial deixa de valer: ele se referia ao início do período inteiro.
    // Mantê-lo faria a validação forte reprovar um recorte correto.
    extrato: {
      ...e,
      transacoes: dentro,
      saldoInicial: null,
      periodoInicio: corte.toISOString().slice(0, 10),
    },
    cortou: true,
  }
}
