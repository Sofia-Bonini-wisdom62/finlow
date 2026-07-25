// ============================================================================
// COSTURA DA IA — ponto único de integração com o provedor de LLM.
//
// Nada de LLM está implementado aqui de propósito: a escolha do provedor é
// externa a este código. Para ligar a IA, implemente APENAS `responderIA()`.
// Todo o resto do Chat (UI, histórico, montagem do contexto financeiro,
// renderização de cards) já está pronto e não precisa ser tocado.
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
  patrimonio: number
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

export interface RespostaIA {
  texto: string
  cards?: CardIA[]
}

/** Sinaliza que a IA ainda não foi ligada — a UI mostra um aviso honesto. */
export class IANaoConfigurada extends Error {
  constructor() {
    super("IA não configurada")
    this.name = "IANaoConfigurada"
  }
}

/**
 * Único ponto a implementar. Chame seu provedor de LLM aqui, passando
 * `contexto` no prompt de sistema e `mensagens` como histórico.
 *
 * Sugestão de prompt de sistema (o tom já está alinhado com a marca):
 *   "Você é o assistente financeiro do Finlow. Responda em português, direto e
 *    calmo, sem jargão e sem julgar. Baseie-se SOMENTE nos números do contexto
 *    abaixo — se não tiver o dado, diga que não tem em vez de estimar."
 */
export async function responderIA(
  _mensagens: MensagemChat[],
  _contexto: ContextoFinanceiro
): Promise<RespostaIA> {
  throw new IANaoConfigurada()
}
