/**
 * O contrato do curso escolar v2 visto pela TELA: os 6 formatos de item
 * (`binaria`, `escolha3`, `classificar`, `ordenar`, `estimativa`, `fecho`)
 * e a resposta que cada um produz.
 *
 * Fonte do contrato: `docs/arquitetura-pedagogica.md` §4 (catálogo e JSON)
 * e `lib/licao/validar.ts` (o que o seed cobra). Este arquivo é o espelho
 * disso em tipo de componente — não redeclara limite de caracteres nenhum,
 * porque limite é regra de conteúdo (`lib/licao/formatos.ts::LIMITES`), não
 * de tipo. `caca_erro` fica de fora de propósito: nenhuma das 321 lições o
 * usa (não há peças gráficas), e componente sem conteúdo é dívida
 * (`docs/backlog-curso-v2.md`, P0 §1).
 *
 * Irmão de `types/trilha.ts`, não extensão: o quiz clássico responde com
 * `telaId → letra`; aqui a resposta é booleano, índice, permutação, mapa ou
 * número, e forçar as duas coisas num tipo só obrigaria cada consumidor a
 * adivinhar de qual lado está.
 */

export type FormatoItem = "binaria" | "escolha3" | "classificar" | "ordenar" | "estimativa" | "fecho"
export type PapelItem = "sonda" | "construcao" | "pratica" | "aplicacao" | "fluencia" | "fecho" | "reserva"

export interface AlternativaItem {
  texto: string
  correta: boolean
  feedbackErro: string | null
}

export interface VerificacaoItem {
  expressao: string
  esperado: number
  tolerancia?: number
}

/** O `ItemAvaliativo.conteudo`, uma união por `formato` — os campos são os
 *  de `arquitetura-pedagogica.md` §4, sem achatar nada. */
export type ConteudoItem =
  | {
      formato: "binaria"
      criterio: string
      enunciado: string
      resposta: boolean
      ancora: string
      feedbackErro: string
      verificacao?: VerificacaoItem
    }
  | {
      formato: "escolha3" | "fecho"
      pergunta: string
      ancora?: string
      alternativas: AlternativaItem[]
      verificacao?: VerificacaoItem
    }
  | {
      formato: "ordenar"
      instrucao: string
      ancora: string
      feedbackErro: string
      itens: { texto: string; posicaoCorreta: number }[]
    }
  | {
      formato: "classificar"
      instrucao: string
      ancora: string
      feedbackErro?: string
      caixas: { id: string; rotulo: string }[]
      itens: { texto: string; caixaCorreta: string; feedbackErro?: string }[]
    }
  | {
      formato: "estimativa"
      pergunta: string
      campo: "moeda" | "percentual" | "numero"
      min: number
      max: number
      gabarito: number
      toleranciaPct: number
      fonte: string
      feedbackPerto: string
      feedbackLonge: string
      /** Só para MOSTRAR a conta por trás do gabarito, nunca para julgar a
       *  resposta: a correção é sempre `gabarito` ± `toleranciaPct`. */
      verificacao?: VerificacaoItem
    }

/** Uma linha de `ItemAvaliativo`, como a rota serve ao player (sem `reserva`:
 *  o player só recebe a fila da lição). */
export interface ItemCursoData {
  id: string
  ordem: number
  papel: PapelItem
  formato: FormatoItem
  conteudo: ConteudoItem
}

/** O que `GET /api/curso/[licaoSlug]` devolve. */
export interface LicaoCursoData {
  id: string
  slug: string
  titulo: string
  segmento: string
  encontro: number
  tipoEncontro: string
  conceito: { slug: string; nome: string; frase: string | null }
  itens: ItemCursoData[]
}

/**
 * A resposta da pessoa a UM item. Nunca é confiada: `lib/curso/corrigir.ts`
 * confere contra o conteúdo, no cliente (para o feedback) e, quando houver
 * instrumentação (`TentativaItem`, backlog P2 §6), no servidor.
 */
export type RespostaItem =
  | { formato: "binaria"; valor: boolean }
  | { formato: "escolha3" | "fecho"; indice: number }
  /** `ordem[posição] = índice ORIGINAL do item colocado ali` — uma permutação. */
  | { formato: "ordenar"; ordem: number[] }
  /** chave = índice original do item (string, porque JSON), valor = id da caixa. */
  | { formato: "classificar"; mapa: Record<string, string> }
  | { formato: "estimativa"; valor: number }
