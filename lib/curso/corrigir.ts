import type { ConteudoItem, RespostaItem } from "@/types/curso"

/**
 * Corrige UM item contra o gabarito gravado. Puro, sem banco, sem IA.
 *
 * Resposta ausente, de formato errado ou fora dos limites conta como ERRO e
 * nunca lança — é a postura anti-fraude de sempre (`app/api/progresso`): quem
 * chegar aqui por fora do player leva o pior caso, não uma exceção.
 *
 * NUNCA usa `verificacao.expressao`. Ela é conferência de CONTEÚDO (o seed
 * recalcula a conta em `lib/licao/validar.ts`) e, na tela de `estimativa`,
 * serve só para mostrar a conta no feedback. A correção é sempre contra o
 * valor já gravado: `resposta`, `alternativas[].correta`, `posicaoCorreta`,
 * `caixaCorreta` ou `gabarito` ± `toleranciaPct`.
 */
export function corrigirItem(conteudo: ConteudoItem, resposta: RespostaItem | undefined): boolean {
  if (!resposta || resposta.formato !== conteudo.formato) return false

  switch (conteudo.formato) {
    case "binaria":
      return resposta.formato === "binaria" && resposta.valor === conteudo.resposta

    case "escolha3":
    case "fecho": {
      if (resposta.formato !== "escolha3" && resposta.formato !== "fecho") return false
      return !!conteudo.alternativas[resposta.indice]?.correta
    }

    case "ordenar": {
      if (resposta.formato !== "ordenar") return false
      const { ordem } = resposta
      if (!Array.isArray(ordem) || ordem.length !== conteudo.itens.length) return false
      if (new Set(ordem).size !== ordem.length) return false // sem repetir item
      return ordem.every((indiceOriginal, posicao) => conteudo.itens[indiceOriginal]?.posicaoCorreta === posicao + 1)
    }

    case "classificar": {
      if (resposta.formato !== "classificar") return false
      const { mapa } = resposta
      if (!mapa || typeof mapa !== "object") return false
      return conteudo.itens.every((item, i) => mapa[String(i)] === item.caixaCorreta)
    }

    case "estimativa": {
      if (resposta.formato !== "estimativa") return false
      const valor = Number(resposta.valor)
      if (!isFinite(valor)) return false
      return Math.abs(valor - conteudo.gabarito) <= toleranciaAbsoluta(conteudo)
    }

    default:
      return false
  }
}

/** A faixa de acerto da estimativa, em valor absoluto: `gabarito` × `toleranciaPct`%. */
export function toleranciaAbsoluta(c: Extract<ConteudoItem, { formato: "estimativa" }>): number {
  return Math.abs(c.gabarito) * (c.toleranciaPct / 100)
}

/**
 * Quanto a pessoa errou, em % do gabarito — é o que a tela de estimativa
 * revela junto com o número (§4: "revela gabarito e a distância"). Positivo =
 * chutou acima, negativo = abaixo. `null` quando o gabarito é zero: distância
 * relativa a zero não existe.
 */
export function distanciaEstimativa(c: Extract<ConteudoItem, { formato: "estimativa" }>, valor: number): number | null {
  if (c.gabarito === 0 || !isFinite(valor)) return null
  return Math.round(((valor - c.gabarito) / Math.abs(c.gabarito)) * 100)
}
