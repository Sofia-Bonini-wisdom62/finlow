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
// A UI já sabe desenhar os tipos de card definidos em `CardIA`. Devolver
// `cards: []` ou omitir é válido — o texto sozinho funciona.
// ============================================================================

import { DESTINOS } from "@/lib/app-mapa"
import type { MesDetalhado } from "@/lib/financas"
import { registrarUso } from "@/lib/uso-ia"
import { contemConteudoProibido, RESPOSTA_FORA_DE_ESCOPO } from "@/lib/conteudo-proibido"

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
  /**
   * Top 5 do mês de referência, com a cauda dobrada em "Outros" — é o recorte
   * da ROSCA. Serve para as leituras do Perfil (lib/insights-ia.ts), que falam
   * das maiores saídas. O chat não usa: ele lê `meses`, que vem completo.
   */
  maioresCategorias: { nome: string; total: number; pct: number }[]
  contasFixasTotal: number
  mesesComHistorico: number
  /** Tetos já definidos, com quanto já foi gasto no mês. */
  orcamentos?: { nome: string; limite: number; gasto: number; restante: number; pct: number }[]
  /**
   * O dash mês a mês, com TODAS as categorias de cada mês.
   *
   * É o que permite responder "quanto gastei com delivery em julho?" — antes
   * disso o contexto tinha um mês só, e as categorias vinham cortadas em seis
   * pela regra da rosca. Ver lib/financas.ts → historicoDetalhado.
   */
  meses?: MesDetalhado[]
}

export type CardIA =
  | { tipo: "resumo"; titulo: string; itens: { rotulo: string; valor: string }[] }
  | { tipo: "grafico"; titulo: string; barras: { rotulo: string; valor: number }[] }
  | { tipo: "recomendacao"; titulo: string; texto: string; moduloSlug?: string }
  | { tipo: "lembrete"; titulo: string; texto: string; quando?: string }
  /** Atalho para uma tela do app, com o caminho de toques à vista. */
  | { tipo: "caminho"; titulo: string; passos: string[]; href: string }

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

/**
 * Lançamento que o modelo entendeu da conversa. PROPOSTA, não registro.
 *
 * O modelo NUNCA escreve no banco. Ele devolve isto, a tela mostra com valor e
 * data à vista, e só o toque da pessoa em "Confirmar" grava. É a diferença
 * entre um assistente que anota o que você dita e um que mexe na sua conta.
 */
export interface LancamentoProposto {
  descricao: string
  valor: number          // sempre positivo; o sinal vem do tipo
  tipo: "receita" | "despesa"
  categoria: string      // slug de CATEGORIAS_EXTRATO
  data: string           // yyyy-mm-dd
}

/**
 * Teto de gasto proposto na conversa. PROPOSTA, não registro — igual aos
 * lançamentos: o modelo sugere a partir dos números reais, a tela mostra ao
 * lado o quanto a pessoa gasta hoje, e só o toque dela salva.
 */
export interface TetoProposto {
  /** slug de categoria, ou "total" para o mês inteiro */
  categoria: string
  limite: number
}

/** Opções da chamada. Um tipo só, usado aqui e no prompt: duas listas
 *  separadas divergem no dia em que alguém acrescenta campo numa e esquece a
 *  outra, e o campo esquecido some sem erro nenhum. */
export interface OpcoesResposta {
  podeLancar?: boolean
  sistemaExtra?: string
  onboarding?: boolean
  /** Aulas reais, do banco. Sem elas o modelo não recomenda módulo nenhum. */
  modulos?: { slug: string; titulo: string }[]
}

export interface RespostaIA {
  texto: string
  cards?: CardIA[]
  /** Propostas para a pessoa confirmar. Nada aqui foi gravado. */
  lancamentos?: LancamentoProposto[]
  /** Tetos de gasto propostos. Nada aqui foi salvo. */
  orcamento?: TetoProposto[]
  /** Só no onboarding: trilha escolhida e sinal de que a conversa fechou. */
  perfilSugerido?: string
  concluido?: boolean
  /**
   * Respostas prontas para a pergunta que acabou de ser feita — só no
   * onboarding.
   *
   * Existem porque campo de texto vazio na primeira tela do app é a pior hora
   * de pedir que alguém escreva do zero. Tocar num card responde; escrever
   * também responde; e o que sai dos dois é texto igual, então o modelo não
   * precisa saber qual dos dois a pessoa usou.
   */
  sugestoes?: string[]
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
 * Aceita só lançamentos com forma plausível, no máximo 10 por resposta.
 *
 * Cada filtro aqui existe por um motivo concreto:
 *  - valor não-finito ou <= 0 viraria NaN no gráfico e zero silencioso no total
 *  - data fora de uma janela sensata denuncia alucinação de ano ("2019" num
 *    "gastei ontem"), e uma transação em 2019 suja o histórico para sempre
 *  - teto de valor barra o erro de escala (R$ 45 virando R$ 4.500.000)
 * Isto é a última linha; o prompt já pede o mesmo, mas prompt é pedido.
 */
const PERFIS_VALIDOS = new Set(["lancador", "guardador", "impulsivo", "sonhador"])
const TETO_VALOR = 1_000_000
const CATEGORIAS_OK = new Set([
  "alimentacao", "delivery", "transporte", "moradia", "assinaturas",
  "compras", "saude", "lazer", "educacao", "transferencia",
  "renda", "taxas_juros", "poupanca", "outros",
])

/**
 * Um teto tem de ser número positivo e plausível, numa categoria conhecida.
 *
 * O limite de R$ 10 milhões não é paranoia: um modelo que escorrega de "450"
 * para "450000" produz uma barra que nunca enche, e a pessoa acha que está indo
 * bem até o mês fechar no vermelho.
 */
export function orcamentoValido(bruto: unknown): TetoProposto[] {
  if (!Array.isArray(bruto)) return []
  const vistos = new Set<string>()
  const ok: TetoProposto[] = []
  for (const t of bruto.slice(0, 12)) {
    if (!t || typeof t !== "object") continue
    const x = t as Record<string, unknown>
    const categoria = typeof x.categoria === "string" ? x.categoria : ""
    if (categoria !== "total" && !CATEGORIAS_OK.has(categoria)) continue
    if (vistos.has(categoria)) continue
    const limite = typeof x.limite === "number" ? x.limite : NaN
    if (!Number.isFinite(limite) || limite <= 0 || limite > 10_000_000) continue
    vistos.add(categoria)
    ok.push({ categoria, limite: Math.round(limite * 100) / 100 })
  }
  return ok
}

export function lancamentosValidos(bruto: unknown, hoje = new Date()): LancamentoProposto[] {
  if (!Array.isArray(bruto)) return []

  // Janela: 2 anos para trás, 1 dia para frente. Lançamento futuro não é
  // registro, é plano — e plano vai para a memória, não para o extrato.
  const limiteAntigo = new Date(hoje); limiteAntigo.setFullYear(hoje.getFullYear() - 2)
  const limiteFuturo = new Date(hoje); limiteFuturo.setDate(hoje.getDate() + 1)

  const ok: LancamentoProposto[] = []
  for (const l of bruto.slice(0, 10)) {
    if (!l || typeof l !== "object") continue
    const x = l as Record<string, unknown>

    const descricao = typeof x.descricao === "string" ? x.descricao.trim().slice(0, 120) : ""
    // Trava de conteúdo (decisão da fundadora, 03/08/2026): descrição com
    // termo chulo/sexual não vira proposta nem registro.
    if (contemConteudoProibido(descricao)) continue
    if (descricao.length < 2) continue

    const valor = typeof x.valor === "number" ? Math.abs(x.valor) : NaN
    if (!Number.isFinite(valor) || valor <= 0 || valor > TETO_VALOR) continue

    const tipo = x.tipo === "receita" || x.tipo === "despesa" ? x.tipo : null
    if (!tipo) continue

    const categoria = typeof x.categoria === "string" && CATEGORIAS_OK.has(x.categoria)
      ? x.categoria
      : "outros"

    const data = typeof x.data === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x.data) ? x.data : ""
    if (!data) continue
    const d = new Date(`${data}T12:00:00`)
    if (isNaN(d.getTime()) || d < limiteAntigo || d > limiteFuturo) continue

    ok.push({ descricao, valor: Math.round(valor * 100) / 100, tipo, categoria, data })
  }
  return ok
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
    // Memória é registro durável — conteúdo chulo/sexual não entra.
    if (contemConteudoProibido(conteudo)) continue
    if (!TIPOS_VALIDOS.has(tipo)) continue
    if (conteudo.length < 8 || conteudo.length > 240) continue
    if (TEM_DINHEIRO.test(conteudo) || TEM_IDENTIFICADOR.test(conteudo)) continue
    ok.push({ tipo, conteudo })
  }
  return ok
}

/** Rotas que um card pode apontar. Fonte única: lib/app-mapa.ts. */
const HREFS_VALIDOS = new Set(DESTINOS.map((d) => d.href))

/**
 * Respostas prontas do onboarding.
 *
 * O corte em 4 e em 52 caracteres não é enfeite: no celular elas ficam
 * empilhadas acima do teclado. Sete opções empurram a pergunta para fora da
 * tela, e opção longa quebra em três linhas e deixa de parecer um botão.
 *
 * Duplicata sai porque o modelo às vezes devolve a mesma ideia com duas
 * palavras diferentes, e dois cards iguais fazem a pessoa procurar a diferença
 * que não existe.
 */
const MAX_SUGESTOES = 4
const MAX_LETRAS_SUGESTAO = 52

export function sugestoesValidas(bruto: unknown): string[] {
  if (!Array.isArray(bruto)) return []
  const vistas = new Set<string>()
  const ok: string[] = []
  for (const s of bruto) {
    if (typeof s !== "string") continue
    const limpo = s.trim().replace(/\s+/g, " ")
    if (!limpo || limpo.length > MAX_LETRAS_SUGESTAO) continue
    if (contemConteudoProibido(limpo)) continue
    const chave = limpo.toLowerCase()
    if (vistas.has(chave)) continue
    vistas.add(chave)
    ok.push(limpo)
    if (ok.length === MAX_SUGESTOES) break
  }
  return ok
}

/** Aceita só os cards que batem com o contrato — modelo às vezes inventa forma.
 *
 *  `slugsReais` são as aulas que existem mesmo, do banco. Sem essa lista o
 *  card de recomendação aceitaria qualquer slug: o modelo escreve um plausível,
 *  o card fica bonito, e o toque abre um 404. É o mesmo erro do /modulo/{slug},
 *  só que dentro de um campo em vez de dentro de uma rota. */
function cardsValidos(bruto: unknown, slugsReais?: Set<string>): CardIA[] {
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
      // Slug inventado vira card sem botão, não card com botão quebrado: a
      // recomendação em si continua valendo, só perde o atalho.
      const slug = typeof x.moduloSlug === "string" ? x.moduloSlug.trim() : ""
      const slugVale = !!slug && (!slugsReais || slugsReais.has(slug))
      if (slug && !slugVale) console.warn("[ia] slug de módulo inexistente descartado:", slug)
      ok.push({
        tipo: "recomendacao", titulo, texto: x.texto,
        ...(slugVale ? { moduloSlug: slug } : {}),
      })
    } else if (x.tipo === "caminho" && Array.isArray(x.passos) && typeof x.href === "string") {
      // href só passa se estiver no mapa. O modelo não inventa rota — foi
      // exatamente assim que o card de módulo passou meses apontando para
      // /modulo/{slug}, uma rota que nunca existiu.
      const passos = x.passos.filter((p): p is string => typeof p === "string" && !!p.trim()).slice(0, 5)
      if (passos.length && HREFS_VALIDOS.has(x.href)) {
        ok.push({ tipo: "caminho", titulo, passos, href: x.href })
      }
    } else if (x.tipo === "lembrete" && typeof x.texto === "string") {
      ok.push({
        tipo: "lembrete", titulo, texto: x.texto,
        ...(typeof x.quando === "string" && x.quando ? { quando: x.quando } : {}),
      })
    }
  }
  // Trava de conteúdo também nos cards: o gate da resposta cobre o texto,
  // e um card com termo proibido num campo próprio passaria por fora dele.
  return ok.filter((c) => !contemConteudoProibido(JSON.stringify(c)))
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
  memoria?: { ligada: boolean; conhecidas: MemoriaConhecida[] },
  opcoes?: OpcoesResposta
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
      systemInstruction: promptSistemaChat(contexto, memoria, opcoes),
      // Baixa, não zero: resposta a pergunta aberta com temperatura 0 fica
      // robótica e repetitiva. O que protege os números é o prompt, não isto.
      temperature: 0.3,
      responseMimeType: "application/json",
      maxOutputTokens: 3072,
    },
  })

  registrarUso(opcoes?.onboarding ? "onboarding" : "chat", MODELO_CHAT, resposta)

  const bruto = (resposta.text ?? "").trim()
  if (!bruto) {
    throw new Error(`resposta vazia do modelo (finishReason=${resposta.candidates?.[0]?.finishReason})`)
  }

  try {
    const j = JSON.parse(limparCercas(bruto)) as {
      texto?: unknown; cards?: unknown; memorias?: unknown; lancamentos?: unknown
      orcamento?: unknown; perfilSugerido?: unknown; concluido?: unknown
      sugestoes?: unknown
    }
    const texto = typeof j.texto === "string" && j.texto.trim() ? j.texto.trim() : null
    if (!texto) throw new Error("sem campo texto")

    /**
     * Trava de conteúdo na SAÍDA (decisão da fundadora, 03/08/2026).
     *
     * O prompt já instrui o modelo a recusar assunto chulo/sexual sem repetir
     * o termo — mas prompt é pedido. Se mesmo assim a resposta vier com o
     * termo (porque o usuário xingou e o modelo ecoou, ou porque o modelo
     * escorregou), a resposta INTEIRA é substituída pela recusa padrão: texto
     * parcialmente censurado com buracos seria pior de ler do que recusar.
     * Cards e propostas caem junto — nada daquela resposta sobrevive.
     */
    if (contemConteudoProibido(texto)) {
      console.warn("[ia] resposta barrada pela trava de conteúdo")
      return { texto: RESPOSTA_FORA_DE_ESCOPO }
    }

    return {
      texto,
      // Sem lista não dá para validar: passa `undefined` em vez de um Set vazio,
      // senão quem chama sem `modulos` perderia toda recomendação em silêncio.
      cards: cardsValidos(
        j.cards,
        opcoes?.modulos?.length ? new Set(opcoes.modulos.map((m) => m.slug)) : undefined
      ),
      // Memória desligada: descarta o que o modelo tenha proposto. A decisão
      // de guardar é da pessoa, não dele.
      memorias: memoria?.ligada ? memoriasValidas(j.memorias) : [],
      // Sem consentimento do Painel não existe destino para o lançamento —
      // descartar aqui evita mostrar um botão "Confirmar" que vai dar 403.
      lancamentos: opcoes?.podeLancar ? lancamentosValidos(j.lancamentos) : [],
      // Mesmo portão do lançamento: sem Painel não existe onde salvar um teto.
      orcamento: opcoes?.podeLancar ? orcamentoValido(j.orcamento) : [],
      // Perfil inventado levaria a pessoa a uma trilha que não existe. Só as
      // quatro reais passam, e só durante o onboarding.
      ...(opcoes?.onboarding && typeof j.perfilSugerido === "string" && PERFIS_VALIDOS.has(j.perfilSugerido)
        ? { perfilSugerido: j.perfilSugerido, concluido: j.concluido === true }
        : {}),
      // Só no onboarding, e nunca no fecho: card de resposta pronta embaixo de
      // "sua trilha é X" convidaria a responder uma pergunta que não foi feita.
      ...(opcoes?.onboarding && j.concluido !== true
        ? { sugestoes: sugestoesValidas(j.sugestoes) }
        : {}),
    }
  } catch {
    // JSON quebrado não é motivo para engolir a resposta: o texto costuma estar
    // lá e é o que interessa. Devolve sem cards em vez de falhar a conversa.
    const semJson = bruto.replace(/^\s*\{[\s\S]*?"texto"\s*:\s*"/, "").replace(/"[\s\S]*\}\s*$/, "")
    const salvo = (semJson || bruto).slice(0, 4000)
    // A trava vale também no caminho de recuperação: é justamente o caminho
    // sem validação nenhuma, então é onde ela mais faz falta.
    if (contemConteudoProibido(salvo)) {
      console.warn("[ia] resposta (recuperada) barrada pela trava de conteúdo")
      return { texto: RESPOSTA_FORA_DE_ESCOPO }
    }
    return { texto: salvo }
  }
}
