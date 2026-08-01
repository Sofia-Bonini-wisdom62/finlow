import { getVertex, vertexConfigurada, MODELO_CHAT } from "@/lib/vertex"
import type { ContextoFinanceiro } from "@/lib/ia"

/**
 * As três linhas que aparecem no Perfil (§2.10).
 *
 * Não é conselho e não é meta: é o que os números DIZEM, dito de volta em
 * português. A pessoa acabou de entregar o extrato dela; a primeira devolutiva
 * do app precisa provar que ele olhou.
 */

const QUANTOS = 3
const MAX_LETRAS = 120

export type TipoInsight = "gasto" | "divida" | "progresso" | "alerta"

export interface Insight {
  texto: string
  tipo: TipoInsight
}

const TIPOS = new Set<TipoInsight>(["gasto", "divida", "progresso", "alerta"])

export async function gerarInsights(c: ContextoFinanceiro): Promise<Insight[]> {
  // Sem número não há leitura possível. Inventar três frases genéricas aqui
  // seria pior que não mostrar nada: a tela diria que olhou quando não olhou.
  if (!c.temDados) return []
  if (!vertexConfigurada()) return []

  const cats = c.maioresCategorias.map((m) => `${m.nome}: R$ ${m.total.toFixed(2)} (${m.pct}%)`).join("\n") || "sem categorias"

  const prompt = `Você escreve as três linhas que resumem o mês de uma pessoa no Finlow,
um app brasileiro de clareza financeira para adultos de 25 a 40 anos.

OS NÚMEROS DELA
Mês: ${c.mesReferencia}
Entrou: R$ ${c.receitaMes.toFixed(2)}
Saiu: R$ ${c.despesaMes.toFixed(2)}
Sobrou: R$ ${c.economiaMes.toFixed(2)}
Taxa de economia: ${c.taxaEconomiaPct}% da renda
Reserva de emergência: ${c.reservaEmergenciaMeses} meses de despesa coberta
Contas fixas: R$ ${c.contasFixasTotal.toFixed(2)}
Histórico: ${c.mesesComHistorico} ${c.mesesComHistorico === 1 ? "mês" : "meses"}
Maiores saídas:
${cats}

Escreva ${QUANTOS} linhas.

REGRAS
- Cada linha até ${MAX_LETRAS} caracteres, uma frase, falando com ela ("você").
- Cada linha usa um NÚMERO da lista acima. Sem número, não é leitura, é frase
  de efeito. Nunca invente valor que não esteja aí.
- Uma coisa por linha, e três coisas diferentes. Não repita o mesmo dado com
  outras palavras.
- Sem conselho e sem cobrança. "Você gastou 38% com delivery" é leitura;
  "você deveria cortar o delivery" não é.
- Se um número for bom, diga que é bom. O app não existe para dar má notícia.
- Sem jargão sem explicação. Sem "fluxo de caixa", "aporte", "patrimônio
  líquido".

Tipos: "gasto" (para onde foi), "divida" (juros, fatura, parcelas),
"progresso" (o que melhorou), "alerta" (o que aperta o mês).

Responda SÓ com JSON, sem markdown:
{"insights":[{"texto":"...","tipo":"gasto"}]}`

  try {
    const r = await getVertex().models.generateContent({
      model: MODELO_CHAT,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.5, responseMimeType: "application/json" },
    })

    const j = JSON.parse((r.text ?? "").trim()) as { insights?: unknown }
    if (!Array.isArray(j.insights)) return []

    const vistos = new Set<string>()
    const ok: Insight[] = []
    for (const i of j.insights) {
      if (!i || typeof i !== "object") continue
      const x = i as Record<string, unknown>
      const texto = typeof x.texto === "string" ? x.texto.trim().replace(/\s+/g, " ") : ""
      const tipo = (typeof x.tipo === "string" ? x.tipo : "") as TipoInsight
      if (!texto || texto.length > MAX_LETRAS + 40) continue
      // Duas linhas iguais ocupam o lugar de uma leitura que faltou.
      const chave = texto.toLowerCase()
      if (vistos.has(chave)) continue
      vistos.add(chave)
      ok.push({ texto, tipo: TIPOS.has(tipo) ? tipo : "gasto" })
      if (ok.length === QUANTOS) break
    }
    return ok
  } catch (e) {
    console.error("[insights-ia]", (e as Error)?.message)
    return []
  }
}
