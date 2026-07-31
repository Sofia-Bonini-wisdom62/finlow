import type { ExtratoParseado } from "@/types/extrato"
import type { ResultadoValidacao } from "./validar"

/**
 * A linha que faz a conta fechar quando ela não fecha sozinha.
 *
 * POR QUE ISTO EXISTE, DEPOIS DE EU TER DEFENDIDO O CONTRÁRIO
 * A regra era: leitura que não fecha não vira tela, nem parcialmente. A
 * intenção estava certa — não mostrar número que pode estar errado — mas o
 * resultado era pior do que o problema: 430 linhas corretas de 438 eram
 * jogadas fora por causa de 8, e a pessoa ficava sem nada e sem saber o quê.
 *
 * Uma diferença NOMEADA e visível é mais honesta que uma recusa muda. "Furo de
 * R$ 12,40 que eu não consegui explicar" é uma linha que ela vê, entende e
 * apaga se quiser. O silêncio de antes não dava escolha nenhuma.
 *
 * O que continua valendo: nada entra sem ela decidir, e o ajuste JAMAIS entra
 * escondido no meio dos outros lançamentos.
 *
 * DOIS CASOS, NOMES DIFERENTES DE PROPÓSITO
 *
 * "Saldo inicial" — o extrato fecha certinho, mas começa no meio da vida da
 * conta. Sem essa linha, o app acha que ela começou do zero e o Acumulado
 * nasce errado. Aqui o valor NÃO é um furo: é dinheiro que já existia, e
 * chamar de "compensação" seria inventar um problema onde não há.
 *
 * "Compensação" — a conta não fechou e a diferença não tem explicação. O nome
 * precisa admitir isso. Chamar de "saldo inicial" seria maquiar um erro de
 * leitura com um nome respeitável.
 */

export type TipoAjuste = "saldo_inicial" | "compensacao"

export interface AjusteProposto {
  tipo: TipoAjuste
  descricao: string
  /** Sinal já resolvido: é o valor que falta para a conta fechar. */
  valor: number
  data: string
  /** Frase que a tela mostra. Escrita aqui para não divergir entre telas. */
  explicacao: string
}

const brl = (n: number) =>
  Math.abs(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

/**
 * Calcula o ajuste que faltaria, ou null quando não falta nada.
 *
 * `veredito` é o resultado de validarExtrato sobre o MESMO extrato.
 */
export function calcularAjuste(
  extrato: ExtratoParseado,
  veredito: ResultadoValidacao
): AjusteProposto | null {
  // ---- caso 1: a conta não fechou ----
  if (!veredito.ok) {
    if (veredito.divergencia === undefined) return null
    // A validação devolve `soma − esperado`. Para fechar, falta o oposto.
    const valor = -veredito.divergencia
    if (Math.abs(valor) < 0.01) return null
    return {
      tipo: "compensacao",
      descricao: "Compensação",
      valor,
      data: veredito.dataDivergencia ?? extrato.periodoFim,
      explicacao:
        `A conta não fechou por ${brl(valor)}. Posso lançar tudo assim mesmo e incluir uma linha ` +
        `de Compensação com essa diferença, para o total do seu Painel bater com o do banco. ` +
        `Ela fica visível e você apaga quando quiser.`,
    }
  }

  // ---- caso 2: fechou, mas o extrato começa no meio da vida da conta ----
  // Sem saldo inicial declarado, o app assume que ela começou do zero. Se o
  // banco declara um saldo final, dá para saber exatamente quanto já existia
  // antes: é a diferença entre esse saldo e a soma do que foi lido.
  if (extrato.saldoInicial === null && extrato.saldoFinal !== null) {
    const soma = extrato.transacoes
      .filter((t) => t.afetaSaldo !== false)
      .reduce((s, t) => s + Math.round(t.valor * 100), 0)
    const valor = Math.round(extrato.saldoFinal * 100 - soma) / 100
    if (Math.abs(valor) < 0.01) return null
    return {
      tipo: "saldo_inicial",
      descricao: "Saldo inicial",
      valor,
      data: extrato.periodoInicio,
      explicacao:
        `Esse extrato começa no meio da história da conta: antes da primeira linha você já tinha ` +
        `${brl(valor)}. Posso incluir isso como "Saldo inicial" para o Acumulado do app bater com o ` +
        `saldo real do banco — sem ele, o app conta como se você tivesse começado do zero.`,
    }
  }

  return null
}
