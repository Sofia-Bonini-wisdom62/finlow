import { getVertex, vertexConfigurada, MODELO_CHAT } from "@/lib/vertex"
import { registrarUso } from "@/lib/uso-ia"
import { contemConteudoProibido } from "@/lib/conteudo-proibido"
import type { ResultadoVazamento } from "@/lib/vazamento"

/**
 * A leitura em uma frase do Diagnóstico de Vazamento.
 *
 * A IA é ACESSÓRIO aqui: o diagnóstico inteiro — número, achados, página —
 * existe e funciona sem ela. Por isso o fallback não é um "erro amigável", é
 * uma narrativa de verdade montada dos próprios achados, e qualquer falha da
 * Vertex cai nele em silêncio.
 */

const MAX_LETRAS = 220

/** Determinística, sempre disponível — e é o que o teste consegue afirmar. */
export function narrativaPadrao(r: ResultadoVazamento): string {
  if (r.achados.length === 0) {
    return "Passei um pente-fino e não achei vazamento claro nos seus lançamentos. Bom sinal — vale repetir depois do próximo extrato."
  }
  const maior = r.achados.reduce((a, b) => (b.valorMensal > a.valorMensal ? b : a))
  const anual = r.totalAnual.toFixed(0)
  return `São R$ ${r.totalMensal.toFixed(2)} por mês escapando — R$ ${anual} num ano. O maior ralo é ${maior.titulo.toLowerCase()}: R$ ${maior.valorMensal.toFixed(2)} por mês.`
}

export async function gerarNarrativa(r: ResultadoVazamento): Promise<string> {
  const fallback = narrativaPadrao(r)
  if (!vertexConfigurada() || r.achados.length === 0) return fallback

  const linhas = r.achados
    .map((a) => `- [${a.tipo}] ${a.titulo}: R$ ${a.valorMensal.toFixed(2)}/mês (${a.detalhe})`)
    .join("\n")

  const prompt = `Você resume o Diagnóstico de Vazamento de uma pessoa no Finlow,
app brasileiro de clareza financeira para adultos.

O QUE FOI ENCONTRADO (${r.mesesAnalisados} meses analisados)
${linhas}
Total: R$ ${r.totalMensal.toFixed(2)}/mês = R$ ${r.totalAnual.toFixed(2)}/ano

Escreva UMA leitura de até ${MAX_LETRAS} caracteres, falando com a pessoa ("você").

REGRAS
- Use os números acima; nunca invente valor.
- Sem conselho, sem cobrança, sem culpa. Assinatura não é pecado — a pergunta
  é se ela ainda usa.
- Sem jargão. "Vazamento" pode; "fluxo de caixa" não.
- Aponte o maior ralo pelo nome.

Responda SÓ com JSON, sem markdown: {"leitura":"..."}`

  try {
    const resposta = await getVertex().models.generateContent({
      model: MODELO_CHAT,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.4, responseMimeType: "application/json" },
    })
    registrarUso("vazamento", MODELO_CHAT, resposta)

    const j = JSON.parse((resposta.text ?? "").trim()) as { leitura?: unknown }
    const leitura = typeof j.leitura === "string" ? j.leitura.trim().replace(/\s+/g, " ") : ""
    if (!leitura || leitura.length > MAX_LETRAS + 60) return fallback
    if (contemConteudoProibido(leitura)) return fallback
    return leitura
  } catch (e) {
    console.error("[vazamento-ia]", (e as Error)?.message)
    return fallback
  }
}
