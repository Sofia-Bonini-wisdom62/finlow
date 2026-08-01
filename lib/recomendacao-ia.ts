import { getVertex, vertexConfigurada, MODELO_CHAT } from "@/lib/vertex"
import { registrarUso } from "@/lib/uso-ia"
import type { ContextoFinanceiro } from "@/lib/ia"
import type { Recomendada } from "@/lib/recomendacao"

/**
 * Quem escolhe a próxima leva de aulas, e por quê.
 *
 * Separado de `lib/recomendacao.ts` de propósito: lá fica a REGRA (quando
 * dispara, o que não duplica, o que não repete), que precisa ser testável sem
 * rede. Aqui fica a parte que fala com o modelo e pode falhar.
 *
 * Por isso existe o plano B logo abaixo. Recomendação é o que a pessoa recebe
 * depois de concluir 60% da trilha; ficar sem nada porque a Vertex estava fora
 * do ar seria punir justamente quem foi até o fim.
 */

const MAX_LEVA = 4

export interface Candidato {
  id: string
  slug: string
  titulo: string
  subtitulo: string
}

export interface Escolha {
  moduloId: string
  motivo: string
}

/** Plano B: as primeiras da fila, com o motivo dito honestamente. */
function escolhaSemIA(candidatos: Candidato[]): Escolha[] {
  return candidatos.slice(0, MAX_LEVA).map((c) => ({
    moduloId: c.id,
    motivo: "Próxima da sua trilha.",
  }))
}

function blocoNumeros(c: ContextoFinanceiro): string {
  if (!c.temDados) {
    return "Esta pessoa ainda não tem lançamento nenhum. Não cite número, não estime."
  }
  const cats = c.maioresCategorias.map((m) => `${m.nome} ${m.pct}%`).join(", ") || "sem categorias"
  return [
    `Mês de referência: ${c.mesReferencia}`,
    `Sobra no mês: R$ ${c.economiaMes.toFixed(2)}`,
    `Taxa de economia: ${c.taxaEconomiaPct}% da renda`,
    `Reserva de emergência: ${c.reservaEmergenciaMeses} meses cobertos`,
    `Histórico: ${c.mesesComHistorico} ${c.mesesComHistorico === 1 ? "mês" : "meses"}`,
    `Maiores saídas: ${cats}`,
  ].join("\n")
}

/**
 * Escolhe até 4 aulas novas.
 *
 * O modelo recebe SÓ os candidatos, com id. Não dá para ele recomendar aula
 * que não existe nem repetir uma que a pessoa já recebeu, porque o que não
 * está na lista não tem id para ser citado.
 */
export async function escolherProximaLeva(
  contexto: ContextoFinanceiro,
  candidatos: Candidato[],
  jaFeitas: Recomendada[]
): Promise<Escolha[]> {
  if (candidatos.length === 0) return []

  if (!vertexConfigurada()) return escolhaSemIA(candidatos)

  const concluidas = jaFeitas.filter((r) => r.concluido).map((r) => r.titulo)

  const prompt = `Você escolhe as próximas aulas da trilha de uma pessoa no Finlow,
um app brasileiro de clareza financeira para adultos.

NÚMEROS DELA AGORA
${blocoNumeros(contexto)}

AULAS QUE ELA JÁ CONCLUIU
${concluidas.length ? concluidas.map((t) => `- ${t}`).join("\n") : "- (nenhuma)"}

AULAS DISPONÍVEIS (escolha entre estas, pelo id)
${candidatos.map((c) => `${c.id} | ${c.titulo} — ${c.subtitulo}`).join("\n")}

Escolha ${MAX_LEVA} e escreva o porquê de cada uma.

REGRAS DO MOTIVO
- UMA frase, até 120 caracteres, falando com ela ("você").
- Ligue ao que os números mostram AGORA, não a teoria: "sua reserva cobre 1 mês"
  vale, "reserva é importante" não vale.
- Se não houver número que sustente, diga o que a aula resolve, sem inventar
  dado. Nunca cite valor que não esteja acima.
- Não repita o assunto de uma aula que ela já concluiu como se fosse novidade.
- Sem jargão sem explicação. Sem tom de cobrança, sem "você deveria".

Responda SÓ com JSON, sem markdown:
{"escolhas":[{"moduloId":"...","motivo":"..."}]}`

  try {
    const r = await getVertex().models.generateContent({
      model: MODELO_CHAT,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.4, responseMimeType: "application/json" },
    })

    registrarUso("recomendacao", MODELO_CHAT, r)

    const bruto = (r.text ?? "").trim()
    const j = JSON.parse(bruto) as { escolhas?: unknown }
    if (!Array.isArray(j.escolhas)) return escolhaSemIA(candidatos)

    const validos = new Set(candidatos.map((c) => c.id))
    const vistos = new Set<string>()
    const ok: Escolha[] = []

    for (const e of j.escolhas) {
      if (!e || typeof e !== "object") continue
      const x = e as Record<string, unknown>
      const id = typeof x.moduloId === "string" ? x.moduloId : ""
      const motivo = typeof x.motivo === "string" ? x.motivo.trim() : ""
      // id fora da lista é aula que não existe ou já recomendada. Motivo vazio
      // deixaria o card com um espaço em branco onde estava a justificativa,
      // que é a coisa toda que o card tem de diferente de um link.
      if (!validos.has(id) || vistos.has(id) || !motivo) continue
      vistos.add(id)
      ok.push({ moduloId: id, motivo: motivo.slice(0, 160) })
      if (ok.length === MAX_LEVA) break
    }

    // Devolveu menos do que dá para entregar: completa com a fila, para a
    // pessoa não receber uma leva de uma aula só por causa de um lapso do
    // modelo.
    if (ok.length < MAX_LEVA) {
      for (const c of candidatos) {
        if (ok.length === MAX_LEVA) break
        if (vistos.has(c.id)) continue
        vistos.add(c.id)
        ok.push({ moduloId: c.id, motivo: "Próxima da sua trilha." })
      }
    }

    return ok
  } catch (e) {
    console.error("[recomendacao-ia]", (e as Error)?.message)
    return escolhaSemIA(candidatos)
  }
}
