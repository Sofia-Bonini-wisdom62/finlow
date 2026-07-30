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
  | { ok: true; forte: boolean; comoConferi?: string }
  | { ok: false; motivo: string; divergencia?: number }

function centavos(n: number): number {
  return Math.round(n * 100)
}

/**
 * Confere dia a dia, usando os saldos que o próprio documento declara.
 *
 * POR QUE ISTO EXISTE
 * Conferir só o saldo final não detecta OMISSÃO quando o documento não declara
 * saldo inicial — e o PicPay não declara. Medido contra o CSV do banco: o
 * modelo descartou 294 de 438 linhas e a validação aprovou, porque caiu na
 * versão fraca (que só olha datas e valores absurdos).
 *
 * Entre dois saldos declarados consecutivos, a soma das transações do intervalo
 * TEM que dar a diferença. Some uma linha a menos e a conta não fecha. Não há
 * como esconder.
 *
 * O primeiro saldo declarado não dá para conferir — não se sabe o saldo antes
 * dele. Sem saldoInicial, as transações até esse dia ficam sem conferência, e
 * é por isso que a função devolve quantas ficaram de fora.
 */
function conferirPorSaldoDiario(e: ExtratoParseado):
  | { tipo: "sem_dados" }
  | { tipo: "falhou"; motivo: string; divergencia: number }
  | { tipo: "ok"; intervalos: number; conferidas: number; conferiveis: number } {
  const saldos = [...e.saldosDiarios]
    .filter((s) => !isNaN(new Date(s.data).getTime()))
    .sort((a, b) => a.data.localeCompare(b.data))

  if (saldos.length < 2) return { tipo: "sem_dados" }

  // Âncora: com saldoInicial declarado dá para conferir até o primeiro dia
  // também. Sem ele, o primeiro intervalo começa no primeiro saldo declarado.
  const ancora =
    e.saldoInicial !== null
      ? { data: e.periodoInicio, saldo: e.saldoInicial, anterior: true }
      : null

  const pontos = ancora
    ? [{ data: ancora.data, saldo: ancora.saldo }, ...saldos]
    : saldos

  let conferidas = 0
  for (let i = 1; i < pontos.length; i++) {
    const de = pontos[i - 1]
    const ate = pontos[i]
    // Intervalo aberto no início, fechado no fim: o saldo de `de` já embute o
    // que aconteceu naquele dia. Com âncora de saldoInicial, o início do
    // período é anterior a qualquer transação, então inclui tudo.
    const noIntervalo = e.transacoes.filter(
      (t) =>
        // Compra no crédito está listada no dia mas não move o saldo da conta
        // — ela cai na fatura. Somá-la aqui reprovaria leitura correta.
        t.afetaSaldo !== false &&
        (ancora && i === 1 ? t.data <= ate.data : t.data > de.data && t.data <= ate.data)
    )
    const soma = noIntervalo.reduce((s, t) => s + centavos(t.valor), 0)
    const esperado = centavos(ate.saldo) - centavos(de.saldo)
    const diferenca = (soma - esperado) / 100

    if (Math.abs(diferenca) > TOLERANCIA_REAIS) {
      return {
        tipo: "falhou",
        motivo:
          `Em ${ate.data} a soma do dia não bate com o saldo declarado: ` +
          `diferença de R$ ${Math.abs(diferenca).toFixed(2)}.`,
        divergencia: diferenca,
      }
    }
    conferidas += noIntervalo.length
  }

  // Denominador são as transações CONFERÍVEIS por saldo, não todas.
  // Compra no crédito não move o saldo do dia — cobrá-la da verificação
  // faria um extrato correto com muitas compras no cartão parecer mal
  // conferido, quando na verdade não há o que conferir ali.
  const conferiveis = e.transacoes.filter((t) => t.afetaSaldo !== false).length

  return { tipo: "ok", intervalos: pontos.length - 1, conferidas, conferiveis }
}

export function validarExtrato(e: ExtratoParseado): ResultadoValidacao {
  if (e.transacoes.length === 0) {
    return { ok: false, motivo: "Nenhuma transação foi encontrada no documento." }
  }

  // ---- conferência dia a dia: a única que enxerga omissão ----
  const diario = conferirPorSaldoDiario(e)
  if (diario.tipo === "falhou") {
    return { ok: false, motivo: diario.motivo, divergencia: diario.divergencia }
  }
  if (diario.tipo === "ok") {
    const cobertura = diario.conferiveis > 0 ? diario.conferidas / diario.conferiveis : 0
    // Guarda contra conferência vazia: se o modelo marcasse quase tudo como
    // crédito, sobrariam pouquíssimas linhas para conferir e a aprovação seria
    // vácuo com cara de rigor.
    const temSubstancia = diario.conferiveis >= e.transacoes.length * 0.5

    // Não é "forte" quando sobra transação sem conferência: sem saldoInicial,
    // o que veio antes do primeiro saldo declarado fica sem âncora.
    return {
      ok: true,
      forte: cobertura >= 0.9 && temSubstancia,
      comoConferi:
        `${diario.intervalos} intervalos de saldo diário, ` +
        `${diario.conferidas} de ${diario.conferiveis} transações conferíveis` +
        (diario.conferiveis < e.transacoes.length
          ? ` (${e.transacoes.length - diario.conferiveis} no crédito, fora do saldo)`
          : ""),
    }
  }

  // ---- validação forte: a soma tem que fechar com o saldo declarado ----
  if (e.saldoInicial !== null && e.saldoFinal !== null) {
    // Soma em centavos inteiros: somar float acumula erro e a tolerância de
    // R$0,05 acabaria julgando o arredondamento, não o parsing.
    //
    // Compra no crédito fica de fora aqui pelo mesmo motivo da conferência
    // diária: ela aparece no extrato mas não move o saldo da conta. Esqueci
    // esta linha ao consertar a outra, e o teste sintético pegou — reprovava
    // uma leitura correta por exatamente o valor da compra no cartão.
    const soma = e.transacoes
      .filter((t) => t.afetaSaldo !== false)
      .reduce((s, t) => s + centavos(t.valor), centavos(e.saldoInicial))
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

  const inicioCortado = corte.toISOString().slice(0, 10)

  return {
    // saldoInicial deixa de valer: ele se referia ao início do período inteiro.
    // Mantê-lo faria a validação forte reprovar um recorte correto.
    //
    // Os saldos diários seguem o mesmo raciocínio, mas ao contrário: cada um
    // vale por si, então os que caem dentro do recorte continuam válidos. Só
    // os anteriores saem — mantê-los faria a conferência do primeiro intervalo
    // procurar transações que acabaram de ser removidas.
    extrato: {
      ...e,
      transacoes: dentro,
      saldoInicial: null,
      saldosDiarios: e.saldosDiarios.filter((s) => s.data >= inicioCortado),
      periodoInicio: inicioCortado,
    },
    cortou: true,
  }
}
