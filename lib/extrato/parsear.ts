import { getVertex, MODELO_PARSING, VertexNaoConfigurada } from "@/lib/vertex"
import { registrarUso } from "@/lib/uso-ia"
import { promptParsingExtrato } from "@/lib/prompts/parsing-extrato"
import { ExtratoParseado, ErroExtrato, type ConteudoExtrato } from "@/types/extrato"
import { lerSaldosDiarios } from "./saldos-diarios"
import { dividirPorDia } from "./dividir"

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
  // Já era contado aqui, mas num formato próprio. Passa pelo mesmo registro que
  // as outras chamadas para dar pra somar tudo por uma busca só.
  registrarUso("extrato", MODELO_PARSING, resposta)

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
      "Esse extrato tem transações demais para eu ler de uma vez. Exporta um período menor pelo app do banco, um mês por vez costuma resolver.",
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

  /**
   * Os saldos diários NÃO vêm do modelo — são lidos do texto por regex.
   *
   * Duas razões. A prática: pedir transações e saldos na mesma resposta
   * degradou a extração de 438 linhas para 14 (o modelo devolvia os saldos e
   * só o primeiro dia de transações). A conceitual, que é a que importa: o
   * saldo existe para CONFERIR o que o modelo extraiu. Se ele produzisse os
   * dois, estaria corrigindo a própria prova.
   */
  const saldosDiarios = entrada.modo === "texto" ? lerSaldosDiarios(entrada.texto) : []

  return {
    extrato: { ...validado.data, saldosDiarios },
    tokensEntrada,
    tokensSaida,
    modelo: nomeModelo,
  }
}

/**
 * Parseia um extrato grande em pedaços paralelos.
 *
 * Uma chamada só, num extrato de 3 meses, leva 90 segundos — e com o retry da
 * validação passa de 180, o que estoura o tempo da função e a pessoa vê
 * "timeout" sem entender por quê. Em paralelo o tempo vira o do maior pedaço.
 *
 * SÓ CORTA COM REDE EMBAIXO. A condição é ter pelo menos 2 saldos diários no
 * texto inteiro, lidos por regex, sem o modelo. Isso garante que a conferência
 * dia a dia vai rodar sobre o resultado remontado — e ela é o que pega qualquer
 * linha perdida ou duplicada numa emenda entre pedaços. Sem essa rede, não
 * corta: uma chamada lenta e conferida vale mais que uma rápida e cega.
 *
 * saldoInicial e saldoFinal são descartados de propósito. Um pedaço do meio não
 * sabe que é do meio: ele lê o saldo do primeiro dia que enxerga e chama de
 * "saldoInicial". Os saldos diários vêm do texto completo e não têm esse
 * problema.
 */
export async function parsearExtratoParalelo(
  entrada: ConteudoExtrato,
  opcoes?: { divergencia?: number; modelo?: string }
): Promise<ResultadoParsing & { pedacos: number }> {
  if (entrada.modo !== "texto") {
    return { ...(await parsearExtrato(entrada, opcoes)), pedacos: 1 }
  }

  const saldos = lerSaldosDiarios(entrada.texto)
  const pedacos = saldos.length >= 2 ? dividirPorDia(entrada.texto) : [{ texto: entrada.texto, dias: 0 }]

  if (pedacos.length < 2) {
    return { ...(await parsearExtrato(entrada, opcoes)), pedacos: 1 }
  }

  const partes = await Promise.all(
    pedacos.map((p) =>
      parsearExtrato({ modo: "texto", texto: p.texto, paginas: entrada.paginas }, opcoes)
    )
  )

  const transacoes = partes.flatMap((p) => p.extrato.transacoes)
  const datas = transacoes.map((t) => t.data).sort()

  return {
    pedacos: pedacos.length,
    modelo: partes[0].modelo,
    tokensEntrada: partes.reduce((s, p) => s + p.tokensEntrada, 0),
    tokensSaida: partes.reduce((s, p) => s + p.tokensSaida, 0),
    extrato: {
      banco: partes.find((p) => p.extrato.banco)?.extrato.banco ?? null,
      // Período vem das transações, não do que cada pedaço declarou: um pedaço
      // do meio declara o período que ele vê, que não é o do extrato.
      periodoInicio: datas[0] ?? partes[0].extrato.periodoInicio,
      periodoFim: datas[datas.length - 1] ?? partes[0].extrato.periodoFim,
      saldoInicial: null,
      saldoFinal: null,
      saldosDiarios: saldos,
      transacoes,
    },
  }
}
