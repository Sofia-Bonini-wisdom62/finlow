/**
 * O contrato dos 6 formatos novos da base de lições (20/08/2026): binário,
 * escolha de 3, ordenar, classificar em 2 caixas, estimativa com tolerância
 * e fecho. Fonte: `prisma/seeds/AGENTE.md` e `lib/licao/validar.ts::Item` —
 * este arquivo é o espelho, em TypeScript de tela, do que o validador de
 * conteúdo já garante no seed. Não redeclare os limites de caracteres aqui:
 * eles são regra de conteúdo (`lib/licao/formatos.ts::LIMITES`), não de tipo.
 *
 * Sibling de `types/trilha.ts`, de propósito — não uma extensão dele. O
 * formato de RESPOSTA por item (booleano / índice / ordem / mapa / número)
 * não tem nada em comum com o `telaId → letra` do quiz antigo, e forçar os
 * dois num tipo só obrigaria cada consumidor a distinguir "isto é item novo
 * ou tela clássica" toda vez que lesse o campo errado.
 */

export type FormatoItem = "binaria" | "escolha3" | "classificar" | "ordenar" | "estimativa" | "fecho"
export type PapelItem = "sonda" | "construcao" | "pratica" | "aplicacao" | "fluencia" | "fecho" | "reserva"

export interface AlternativaItem {
  texto: string
  correta: boolean
  feedbackErro: string | null
}

export interface SubItemOrdenar {
  texto: string
  posicaoCorreta: number
}

export interface CaixaClassificar {
  id: string
  rotulo: string
}

export interface SubItemClassificar {
  texto: string
  caixaCorreta: string
}

export interface VerificacaoItem {
  expressao: string
  esperado: number
  tolerancia?: number
}

/**
 * O conteúdo bruto de `ItemLicao.conteudo`, uma união por `formato` — os
 * campos são exatamente os que `prisma/seeds/AGENTE.md` define por formato,
 * sem achatar nada.
 */
export type ConteudoItem =
  | {
      formato: "binaria"
      criterio: string
      enunciado: string
      resposta: boolean
      ancora: string
      feedbackErro: string
    }
  | {
      formato: "escolha3" | "fecho"
      pergunta: string
      ancora?: string
      alternativas: AlternativaItem[]
    }
  | {
      formato: "ordenar"
      instrucao: string
      ancora: string
      feedbackErro: string
      itens: SubItemOrdenar[]
    }
  | {
      formato: "classificar"
      instrucao: string
      ancora: string
      feedbackErro: string
      caixas: CaixaClassificar[]
      itens: SubItemClassificar[]
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
      /** Só para MOSTRAR a conta no feedback — nunca para julgar a resposta
       *  da pessoa. A correção real é sempre `gabarito` ± `toleranciaPct`. */
      verificacao?: VerificacaoItem
    }

export interface ItemLicaoData {
  id: string
  ordem: number
  papel: PapelItem
  formato: FormatoItem
  conteudo: ConteudoItem
}

export interface ModuloItemData {
  id: string
  slug: string
  titulo: string
  subtitulo: string
  ordem: number
  /** Sempre "item" aqui, LITERAL — o campo viaja porque `GET /api/trilha/
   *  [moduloId]` espalha o `Modulo` inteiro (`{ ...moduloCompleto, itens }`),
   *  e é ele que `app/trilha/[moduloId]/page.tsx` usa para estreitar a união
   *  `ModuloData | ModuloItemData` e decidir entre `ItemFlow` e `CardFlow`. */
  formato: "item"
  itens: ItemLicaoData[]
}

/**
 * A resposta que o cliente manda por item, keyed por `ItemLicao.id` — o
 * espelho polimórfico do `telaId → letra` do quiz antigo. O servidor NUNCA
 * confia nisto: corrige contra `ItemLicao.conteudo` (`lib/licao-item/
 * grading.ts`), o mesmo princípio de sempre — resposta ausente ou malformada
 * conta como erro, nunca é tratada como "confia e credita".
 */
export type RespostaItem =
  | { formato: "binaria"; valor: boolean }
  | { formato: "escolha3" | "fecho"; indice: number }
  /** `ordem[posição] = índice ORIGINAL do item colocado ali` — um mapa de
   *  permutação, não uma lista de textos. */
  | { formato: "ordenar"; ordem: number[] }
  /** Chave = índice original do item (como string, porque JSON não tem
   *  chave numérica); valor = id da caixa escolhida. */
  | { formato: "classificar"; mapa: Record<string, string> }
  | { formato: "estimativa"; valor: number }
