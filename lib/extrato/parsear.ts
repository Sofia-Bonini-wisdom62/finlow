import { getVertex, MODELO_PARSING, VertexNaoConfigurada } from "@/lib/vertex"
import { promptParsingExtrato } from "@/lib/prompts/parsing-extrato"
import { ExtratoParseado, ErroExtrato, type ConteudoExtrato } from "@/types/extrato"

export interface ResultadoParsing {
  extrato: ExtratoParseado
  tokensEntrada: number
  tokensSaida: number
  modelo: string
}

/**
 * Remove cercas de markdown antes do JSON.parse.
 * O prompt já pede JSON puro e a chamada usa responseMimeType JSON — isto é a
 * terceira linha de defesa, porque um ```json solto derruba o parse inteiro.
 */
function limparCercas(bruto: string): string {
  const t = bruto.trim()
  const comCerca = t.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/)
  if (comCerca) return comCerca[1].trim()
  // Alguns modelos prefixam texto antes do objeto; pega do primeiro { ao último }
  const inicio = t.indexOf("{")
  const fim = t.lastIndexOf("}")
  if (inicio > 0 && fim > inicio) return t.slice(inicio, fim + 1)
  return t
}

export async function parsearExtrato(
  entrada: ConteudoExtrato,
  opcoes?: { divergencia?: number; modelo?: string }
): Promise<ResultadoParsing> {
  const nomeModelo = opcoes?.modelo ?? MODELO_PARSING
  let vertex
  try {
    vertex = getVertex()
  } catch (e) {
    if (e instanceof VertexNaoConfigurada) {
      throw new ErroExtrato(
        "IA_NAO_CONFIGURADA",
        "A leitura de extrato ainda não está ligada nesta instalação.",
        e.message
      )
    }
    throw e
  }

  const partes =
    entrada.modo === "texto"
      ? [{ text: `${promptParsingExtrato(opcoes)}\n\n--- EXTRATO ---\n${entrada.texto}` }]
      : [
          { text: promptParsingExtrato(opcoes) },
          ...entrada.imagens.map((img) => ({
            inlineData: { mimeType: img.mime, data: img.base64 },
          })),
        ]

  const resposta = await vertex.models.generateContent({
    model: nomeModelo,
    contents: [{ role: "user", parts: partes }],
    config: {
      // Extração é tarefa determinística: nada aqui deve ser criativo.
      temperature: 0,
      responseMimeType: "application/json",
      maxOutputTokens: 65536,
    },
  })

  const uso = resposta.usageMetadata
  const tokensEntrada = uso?.promptTokenCount ?? 0
  const tokensSaida = uso?.candidatesTokenCount ?? 0

  const bruto = (resposta.text ?? "").trim()
  const motivoFim = resposta.candidates?.[0]?.finishReason

  if (!bruto) {
    throw new ErroExtrato(
      "RESPOSTA_INVALIDA",
      "A leitura do extrato não retornou nada. Tenta de novo em alguns instantes.",
      `finishReason=${motivoFim}`
    )
  }

  /**
   * Resposta cortada no teto de tokens.
   *
   * Isso virou risco real quando o prompt passou a exigir TODAS as linhas,
   * inclusive movimentação de cofrinho: a saída triplicou (11k → 37k tokens
   * num extrato de 438 transações, 57% do teto). Perto de 770 transações a
   * resposta é truncada.
   *
   * Sem este check o JSON cortado só quebra no JSON.parse e a pessoa recebe
   * "não consegui interpretar" — mensagem que não diz o que fazer, para um
   * problema com solução óbvia: pedir um período menor.
   */
  if (motivoFim === "MAX_TOKENS") {
    throw new ErroExtrato(
      "ARQUIVO_GRANDE",
      "Esse extrato tem transações demais para eu ler de uma vez. Exporta um período menor pelo app do banco — um mês por vez costuma resolver.",
      `finishReason=MAX_TOKENS, ${bruto.length} caracteres devolvidos`
    )
  }

  let cru: unknown
  try {
    cru = JSON.parse(limparCercas(bruto))
  } catch {
    // Nunca logar `bruto`: ele é o extrato reescrito, com dados financeiros.
    throw new ErroExtrato(
      "RESPOSTA_INVALIDA",
      "Não consegui interpretar a leitura desse extrato. Tenta de novo.",
      "JSON inválido na resposta do modelo"
    )
  }

  const validado = ExtratoParseado.safeParse(cru)
  if (!validado.success) {
    throw new ErroExtrato(
      "RESPOSTA_INVALIDA",
      "A leitura desse extrato veio incompleta. Tenta de novo.",
      // só os caminhos dos campos, sem os valores
      validado.error.issues.map((i) => i.path.join(".")).join(", ")
    )
  }

  return { extrato: validado.data, tokensEntrada, tokensSaida, modelo: nomeModelo }
}
