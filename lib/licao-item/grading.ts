import type { ConteudoItem, RespostaItem } from "@/types/licao-item"

/**
 * Corrige UM item contra o gabarito gravado. Puro, sem banco — o mesmo
 * princípio do quiz antigo (`app/api/progresso/route.ts`): o cliente manda a
 * ESCOLHA, nunca "acertei". Resposta ausente, do formato errado ou fora dos
 * limites conta como erro, nunca lança — é a mesma postura anti-fraude: quem
 * POSTar direto na rota sem responder nada leva o piso, não o cheio.
 *
 * A correção NUNCA usa `verificacao.expressao` (isso só roda em tempo de
 * validação de conteúdo, em `lib/licao/validar.ts`, e opcionalmente para
 * MOSTRAR a conta no feedback da tela de estimativa) — é sempre contra o
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
      const alt = conteudo.alternativas[resposta.indice]
      return !!alt?.correta
    }

    case "ordenar": {
      if (resposta.formato !== "ordenar") return false
      const { ordem } = resposta
      if (!Array.isArray(ordem) || ordem.length !== conteudo.itens.length) return false
      // ordem[posição] = índice ORIGINAL do item colocado ali — a posição 0
      // precisa trazer o item de posicaoCorreta 1, e assim por diante.
      const usados = new Set(ordem)
      if (usados.size !== ordem.length) return false // sem repetir item
      return ordem.every((indiceOriginal, posicao) => {
        const item = conteudo.itens[indiceOriginal]
        return item?.posicaoCorreta === posicao + 1
      })
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
      const tolerancia = Math.abs(conteudo.gabarito) * (conteudo.toleranciaPct / 100)
      return Math.abs(valor - conteudo.gabarito) <= tolerancia
    }

    default:
      return false
  }
}
