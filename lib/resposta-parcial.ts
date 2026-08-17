/**
 * Texto legível de uma resposta que AINDA ESTÁ CHEGANDO.
 *
 * POR QUE ISTO EXISTE
 * O assistente responde em JSON (`{"texto": "...", "cards": [...]}`) porque a
 * tela precisa de cards, lançamentos e propostas de teto separados do texto —
 * ver `lib/ia.ts`. Só que JSON não é legível pela metade: enquanto o modelo
 * escreve, o que trafega é `{"texto": "Você gastou R$ 4` — abrir isso com
 * `JSON.parse` dá erro de sintaxe até o último byte chegar.
 *
 * Daí o defeito que este arquivo conserta: a resposta só aparecia inteira,
 * depois de 5 a 15 segundos de pontinhos. A régua do público é o ChatGPT, que
 * começa a escrever em ~1s. O tempo total não muda — muda a espera em silêncio,
 * que é o que faz a pessoa achar que travou.
 *
 * O QUE ELE FAZ, E O QUE ELE SE RECUSA A FAZER
 * `textoParcial()` lê o pedaço de JSON que já chegou e devolve o valor do campo
 * `texto` decodificado até onde dá para afirmar. Ele NUNCA adivinha: escape
 * cortado no meio (`"\u00e`), string ainda aberta de outro campo, metade de um
 * par substituto de emoji — tudo isso fica de fora da devolução e entra no
 * pedaço seguinte, quando o resto chegar. Mostrar um `\u00e` cru na bolha seria
 * pior do que mostrar meio segundo a menos de texto.
 *
 * A PROFUNDIDADE 1 NÃO É DETALHE
 * O card de recomendação e o de lembrete TÊM UM CAMPO CHAMADO `texto`. Se o
 * modelo emitir `cards` antes da resposta — e a ordem das chaves é dele, não
 * nossa — uma busca ingênua por `"texto"` mostraria na bolha o texto do card.
 * Por isso o varredor conta chaves e colchetes e só aceita a chave no nível de
 * cima do objeto.
 */

/** Escapes de uma linha. `\u` tem tratamento próprio. */
const ESCAPES: Record<string, string> = {
  '"': '"',
  "\\": "\\",
  "/": "/",
  b: "\b",
  f: "\f",
  n: "\n",
  r: "\r",
  t: "\t",
}

/**
 * Decodifica uma string JSON a partir do caractere seguinte à aspa de abertura.
 *
 * `fim` é a posição da aspa de fechamento dentro de `cru`, ou -1 quando a
 * string ainda não fechou (ou parou num escape incompleto). Quem chama usa o -1
 * para saber que o que veio é parcial, não que acabou.
 */
function decodificar(cru: string): { texto: string; fim: number } {
  let saida = ""
  let i = 0
  while (i < cru.length) {
    const c = cru[i]
    if (c === '"') return { texto: saida, fim: i }
    if (c !== "\\") {
      saida += c
      i++
      continue
    }
    const proximo = cru[i + 1]
    // A barra invertida chegou e o que ela escapa não: para aqui e espera.
    if (proximo === undefined) return { texto: saida, fim: -1 }
    if (proximo === "u") {
      const hex = cru.slice(i + 2, i + 6)
      if (hex.length < 4 || !/^[0-9a-fA-F]{4}$/.test(hex)) return { texto: saida, fim: -1 }
      saida += String.fromCharCode(parseInt(hex, 16))
      i += 6
      continue
    }
    const literal = ESCAPES[proximo]
    // Escape que o JSON não define: o pedaço não é confiável, para aqui.
    if (literal === undefined) return { texto: saida, fim: -1 }
    saida += literal
    i += 2
  }
  return { texto: saida, fim: -1 }
}

/**
 * Metade de emoji não vai para a tela.
 *
 * Emoji em JSON vem como par substituto (`😀`). Se o pedaço acabar
 * entre os dois, o que temos é um substituto solto — que o navegador desenha
 * como o losango de interrogação. Ele sai daqui e volta inteiro no pedaço
 * seguinte.
 */
function semSubstitutoSolto(texto: string): string {
  const ultimo = texto.charCodeAt(texto.length - 1)
  if (ultimo >= 0xd800 && ultimo <= 0xdbff) return texto.slice(0, -1)
  return texto
}

/**
 * O campo `texto` do objeto de cima, decodificado até onde já dá para afirmar.
 *
 * Devolve "" quando o campo ainda não começou a chegar — inclusive quando o
 * modelo está no meio de OUTRO campo. Não lança nunca: entrada quebrada é o
 * caso normal aqui, não a exceção.
 */
export function textoParcial(bruto: string): string {
  let i = 0
  let profundidade = 0

  while (i < bruto.length) {
    const c = bruto[i]
    if (c === "{" || c === "[") {
      profundidade++
      i++
      continue
    }
    if (c === "}" || c === "]") {
      profundidade--
      i++
      continue
    }
    if (c !== '"') {
      i++
      continue
    }

    // Uma string. Se ela ainda não fechou e não é a nossa, não há o que mostrar.
    const { texto: conteudo, fim } = decodificar(bruto.slice(i + 1))
    if (fim === -1) return ""

    let j = i + 1 + fim + 1
    while (j < bruto.length && /\s/.test(bruto[j])) j++

    if (bruto[j] === ":" && profundidade === 1 && conteudo === "texto") {
      let k = j + 1
      while (k < bruto.length && /\s/.test(bruto[k])) k++
      // O valor ainda não começou, ou não é string (modelo escorregou): nada
      // a mostrar. O caminho de validação em lib/ia.ts trata o resto.
      if (bruto[k] !== '"') return ""
      return semSubstitutoSolto(decodificar(bruto.slice(k + 1)).texto)
    }

    i = i + 1 + fim + 1
  }
  return ""
}

/**
 * O texto que já dá para mostrar, em pedaços, sem repetir o que já foi.
 *
 * Guarda o que já saiu e devolve só o acréscimo. `barrar` é a trava de conteúdo
 * (`lib/conteudo-proibido.ts`), e ela roda ANTES de o pedaço sair: o teste é
 * feito no texto acumulado JÁ COM o acréscimo, então um termo proibido que se
 * completa neste pedaço trava o fluxo sem nunca ter ido para a tela. O que
 * tiver saído antes é prefixo dele, não ele.
 *
 * Barrado, o fluxo não volta a emitir. Quem decide o que a pessoa vê no lugar é
 * `lib/ia.ts`, que devolve a recusa padrão no fim — e a tela troca o texto
 * parcial pelo texto final quando o turno fecha.
 */
export class FluxoDeTexto {
  private emitido = ""
  private travado = false

  constructor(private readonly barrar?: (texto: string) => boolean) {}

  /** O acréscimo desde a última chamada. "" quando não há nada novo. */
  avancar(bruto: string): string {
    if (this.travado) return ""
    const agora = textoParcial(bruto)
    // Prefixo que encolhe não deveria acontecer (o acumulado só cresce), mas se
    // acontecer é melhor não emitir do que emitir texto embaralhado: o texto
    // final, que vem no fecho do turno, corrige de qualquer jeito.
    if (!agora.startsWith(this.emitido)) return ""
    const novo = agora.slice(this.emitido.length)
    if (!novo) return ""
    if (this.barrar?.(agora)) {
      this.travado = true
      return ""
    }
    this.emitido = agora
    return novo
  }

  /** Tudo que já foi emitido. */
  get texto(): string {
    return this.emitido
  }

  /** Verdadeiro depois que a trava de conteúdo fechou o fluxo. */
  get barrado(): boolean {
    return this.travado
  }
}
