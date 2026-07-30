// ============================================================================
// COSTURA DA IA — ponto único de integração com o provedor de LLM.
//
// LIGADA em 28/07/2026: `responderIA()` fala com a Vertex AI (Gemini), o mesmo
// backend do parsing de extrato. Trocar de provedor continua sendo mexer só
// nesta função — o resto do Chat (UI, histórico, contexto financeiro,
// renderização de cards) não conhece o provedor.
//
// O que você recebe:
//   - `mensagens`: histórico da conversa (o último item é a pergunta atual)
//   - `contexto`: retrato financeiro real do usuário, já calculado e resumido
//                 (indicadores do mês, categorias, métricas de perfil, etc.)
//
// O que você devolve:
//   - `texto`: a resposta em português, no tom do produto (claro, calmo, sem
//     jargão, sem julgamento — ver identidade da marca)
//   - `cards` (opcional): blocos estruturados que a UI renderiza abaixo do texto
//
// A UI já sabe desenhar os 4 tipos de card definidos em `CardIA`. Devolver
// `cards: []` ou omitir é válido — o texto sozinho funciona.
// ============================================================================

/**
 * Anexo enviado pelo usuário (comprovante, extrato). Chega em base64 e NÃO é
 * persistido — vive só na requisição. Interpretar o conteúdo (OCR, extração de
 * lançamentos) é parte da integração de IA.
 */
export interface AnexoChat {
  nome: string
  tipo: string   // MIME, ex: "image/png", "application/pdf"
  tamanho: number
  base64: string
}

export interface MensagemChat {
  papel: "usuario" | "ia"
  texto: string
  anexos?: AnexoChat[]
}

/** Retrato financeiro do usuário, montado por app/api/chat/route.ts */
export interface ContextoFinanceiro {
  temDados: boolean
  mesReferencia: string        // "julho de 2026"
  receitaMes: number
  despesaMes: number
  economiaMes: number
  /**
   * Acumulado de (receitas − despesas) desde o primeiro lançamento.
   * NÃO é patrimônio nem saldo bancário: o Finlow não vê conta, imóvel,
   * investimento fora do app nem dívida não registrada. Quem for implementar
   * responderIA() precisa refletir isso na resposta — chamar de "patrimônio"
   * seria afirmar ao usuário algo que o app não tem como saber.
   */
  acumulado: number
  reservaEmergenciaMeses: number
  taxaEconomiaPct: number
  maioresCategorias: { nome: string; total: number; pct: number }[]
  contasFixasTotal: number
  mesesComHistorico: number
}

export type CardIA =
  | { tipo: "resumo"; titulo: string; itens: { rotulo: string; valor: string }[] }
  | { tipo: "grafico"; titulo: string; barras: { rotulo: string; valor: number }[] }
  | { tipo: "recomendacao"; titulo: string; texto: string; moduloSlug?: string }
  | { tipo: "lembrete"; titulo: string; texto: string; quando?: string }

/**
 * O que o assistente já sabe sobre a pessoa, vindo de conversas anteriores.
 * Montado por app/api/chat/route.ts a partir de lib/memoria-repo.ts.
 */
export interface MemoriaConhecida {
  tipo: string
  conteudo: string
}

/** Memória que o modelo propôs guardar nesta conversa. Ainda não gravada. */
export interface MemoriaProposta {
  tipo: string
  conteudo: string
}

export interface RespostaIA {
  texto: string
  cards?: CardIA[]
  /**
   * Só vem preenchido quando a memória está LIGADA para a pessoa. A rota é
   * quem decide gravar — aqui é proposta, não fato.
   */
  memorias?: MemoriaProposta[]
}

/** Sinaliza que a IA ainda não foi ligada — a UI mostra um aviso honesto. */
export class IANaoConfigurada extends Error {
  constructor() {
    super("IA não configurada")
    this.name = "IANaoConfigurada"
  }
}

/** Cerca de markdown em volta do JSON — defesa extra além do responseMimeType. */
function limparCercas(bruto: string): string {
  const t = bruto.trim()
  const cerca = t.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/)
  if (cerca) return cerca[1].trim()
  const i = t.indexOf("{")
  const f = t.lastIndexOf("}")
  if (i > 0 && f > i) return t.slice(i, f + 1)
  return t
}

/**
 * Aceita só memórias com forma válida, e no máximo 2 por conversa.
 *
 * O teto é de propósito: sem ele o modelo tende a "anotar" meia dúzia de coisas
 * por turno e a memória vira transcrição da conversa em vez de conhecimento
 * sobre a pessoa. Duas por vez obriga a escolher o que importa.
 *
 * Os filtros de conteúdo aqui são a última linha — o prompt já proíbe o mesmo,
 * mas prompt é pedido e isto é regra. Número com R$ e sequência longa de dígito
 * (CPF, conta, cartão) não passam, porque memória não é lugar de valor
 * financeiro nem de identificador.
 */
const TIPOS_VALIDOS = new Set(["situacao", "plano", "preferencia", "compromisso"])
// Sem \b de propósito: a borda de palavra não acrescenta nada aqui e já custou
// caro uma vez — escrita por script, virou o caractere de backspace literal
// (0x08) dentro do padrão, invisível no editor e no grep. A segunda alternativa
// parou de casar e "Gasta 1.234,56 com delivery" passou pela guarda. Quem pegou
// foi scripts/testar-memoria.mts.
const TEM_DINHEIRO = /R\$\s*[\d.,]+|\d+[.,]\d{2}/
const TEM_IDENTIFICADOR = /\d[\d.\-/\s]{8,}/

export function memoriasValidas(bruto: unknown): MemoriaProposta[] {
  if (!Array.isArray(bruto)) return []
  const ok: MemoriaProposta[] = []
  for (const m of bruto.slice(0, 2)) {
    if (!m || typeof m !== "object") continue
    const x = m as Record<string, unknown>
    const tipo = typeof x.tipo === "string" ? x.tipo : ""
    const conteudo = typeof x.conteudo === "string" ? x.conteudo.trim() : ""
    if (!TIPOS_VALIDOS.has(tipo)) continue
    if (conteudo.length < 8 || conteudo.length > 240) continue
    if (TEM_DINHEIRO.test(conteudo) || TEM_IDENTIFICADOR.test(conteudo)) continue
    ok.push({ tipo, conteudo })
  }
  return ok
}

/** Aceita só os cards que batem com o contrato — modelo às vezes inventa forma. */
function cardsValidos(bruto: unknown): CardIA[] {
  if (!Array.isArray(bruto)) return []
  const ok: CardIA[] = []
  for (const c of bruto.slice(0, 2)) {
    if (!c || typeof c !== "object") continue
    const x = c as Record<string, unknown>
    const titulo = typeof x.titulo === "string" ? x.titulo : null
    if (!titulo) continue

    if (x.tipo === "resumo" && Array.isArray(x.itens)) {
      const itens = x.itens
        .filter((i): i is { rotulo: string; valor: string } =>
          !!i && typeof (i as never as { rotulo: unknown }).rotulo === "string" &&
          typeof (i as never as { valor: unknown }).valor === "string")
        .slice(0, 6)
      if (itens.length) ok.push({ tipo: "resumo", titulo, itens })
    } else if (x.tipo === "grafico" && Array.isArray(x.barras)) {
      const barras = x.barras
        .filter((b): b is { rotulo: string; valor: number } =>
          !!b && typeof (b as never as { rotulo: unknown }).rotulo === "string" &&
          Number.isFinite((b as never as { valor: unknown }).valor as number))
        .slice(0, 8)
      if (barras.length) ok.push({ tipo: "grafico", titulo, barras })
    } else if (x.tipo === "recomendacao" && typeof x.texto === "string") {
      ok.push({
        tipo: "recomendacao", titulo, texto: x.texto,
        ...(typeof x.moduloSlug === "string" && x.moduloSlug ? { moduloSlug: x.moduloSlug } : {}),
      })
    } else if (x.tipo === "lembrete" && typeof x.texto === "string") {
      ok.push({
        tipo: "lembrete", titulo, texto: x.texto,
        ...(typeof x.quando === "string" && x.quando ? { quando: x.quando } : {}),
      })
    }
  }
  return ok
}

/**
 * Implementação: Vertex AI (Gemini), o mesmo backend do parsing de extrato.
 *
 * Duas decisões que valem registro:
 *  - O contexto financeiro vai no PROMPT DE SISTEMA, não como mensagem do
 *    usuário. Assim ele não se perde no histórico longo e a pessoa não
 *    consegue reescrevê-lo pedindo "esqueça os números acima".
 *  - Falha do provedor NÃO vira IANaoConfigurada. Esse erro significa "não
 *    está ligado" e a UI mostra um aviso definitivo; um timeout da Vertex é
 *    temporário e merece "tenta de novo".
 */
export async function responderIA(
  mensagens: MensagemChat[],
  contexto: ContextoFinanceiro,
  memoria?: { ligada: boolean; conhecidas: MemoriaConhecida[] }
): Promise<RespostaIA> {
  const { getVertex, MODELO_CHAT, VertexNaoConfigurada } = await import("@/lib/vertex")
  const { promptSistemaChat } = await import("@/lib/prompts/chat")

  let vertex
  try {
    vertex = getVertex()
  } catch (e) {
    if (e instanceof VertexNaoConfigurada) throw new IANaoConfigurada()
    throw e
  }

  // Histórico recente. Conversa longa não melhora a resposta e multiplica o
  // custo por token a cada turno.
  const recentes = mensagens.slice(-12)

  const contents = recentes.map((m) => ({
    role: m.papel === "usuario" ? ("user" as const) : ("model" as const),
    parts: [
      ...(m.texto ? [{ text: m.texto }] : []),
      ...(m.anexos ?? []).map((a) => ({
        inlineData: { mimeType: a.tipo, data: a.base64 },
      })),
    ],
  })).filter((c) => c.parts.length > 0)

  if (contents.length === 0) return { texto: "Não recebi sua pergunta. Escreve de novo?" }

  const resposta = await vertex.models.generateContent({
    model: MODELO_CHAT,
    contents,
    config: {
      systemInstruction: promptSistemaChat(contexto, memoria),
      // Baixa, não zero: resposta a pergunta aberta com temperatura 0 fica
      // robótica e repetitiva. O que protege os números é o prompt, não isto.
      temperature: 0.3,
      responseMimeType: "application/json",
      maxOutputTokens: 2048,
    },
  })

  const bruto = (resposta.text ?? "").trim()
  if (!bruto) {
    throw new Error(`resposta vazia do modelo (finishReason=${resposta.candidates?.[0]?.finishReason})`)
  }

  try {
    const j = JSON.parse(limparCercas(bruto)) as {
      texto?: unknown; cards?: unknown; memorias?: unknown
    }
    const texto = typeof j.texto === "string" && j.texto.trim() ? j.texto.trim() : null
    if (!texto) throw new Error("sem campo texto")
    return {
      texto,
      cards: cardsValidos(j.cards),
      // Memória desligada: descarta o que o modelo tenha proposto. A decisão
      // de guardar é da pessoa, não dele.
      memorias: memoria?.ligada ? memoriasValidas(j.memorias) : [],
    }
  } catch {
    // JSON quebrado não é motivo para engolir a resposta: o texto costuma estar
    // lá e é o que interessa. Devolve sem cards em vez de falhar a conversa.
    const semJson = bruto.replace(/^\s*\{[\s\S]*?"texto"\s*:\s*"/, "").replace(/"[\s\S]*\}\s*$/, "")
    return { texto: (semJson || bruto).slice(0, 4000) }
  }
}
