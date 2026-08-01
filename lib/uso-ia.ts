import { estimarCustoBRL } from "@/lib/custo"

/**
 * Registro de uso de todas as chamadas de IA.
 *
 * POR QUE ISTO EXISTE
 * O uso só era contado no parsing de extrato. Chat, onboarding, recomendação e
 * insights gastavam token sem deixar rastro, e o painel de custo mostrava uma
 * fração do gasto real com cara de total. Conta pela metade é pior que conta
 * nenhuma: dá confiança em cima de um número errado.
 *
 * Uma linha estruturada por chamada. O log da Vercel é pesquisável, então dá
 * para somar por origem sem precisar de tabela nova — e uma tabela aqui teria
 * o problema de crescer sem limite e de gravar num caminho que não pode
 * derrubar a resposta.
 */

export interface UsoBruto {
  usageMetadata?: {
    promptTokenCount?: number
    candidatesTokenCount?: number
  } | null
}

export interface Uso {
  entrada: number
  saida: number
  brl: number
}

/**
 * `origem` identifica a chamada no log: "chat", "onboarding", "recomendacao",
 * "insights", "extrato". É por ela que se soma depois.
 *
 * Nunca lança. Registrar custo não pode ser o motivo de uma resposta pronta
 * não chegar em quem pediu.
 */
export function registrarUso(origem: string, modelo: string, resposta: UsoBruto): Uso {
  try {
    const entrada = resposta.usageMetadata?.promptTokenCount ?? 0
    const saida = resposta.usageMetadata?.candidatesTokenCount ?? 0
    const custo = estimarCustoBRL(entrada, saida, modelo)

    console.log(
      `[uso-ia] ${JSON.stringify({
        origem,
        modelo,
        entrada,
        saida,
        brl: custo.brl,
        // Sem isto, um modelo fora da tabela de preços reportaria custo 0 e
        // pareceria de graça.
        precoConhecido: custo.precoConhecido,
      })}`
    )

    return { entrada, saida, brl: custo.brl }
  } catch {
    return { entrada: 0, saida: 0, brl: 0 }
  }
}
