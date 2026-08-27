/**
 * Os formatos de tela do curso escolar v2 — e a composição de cada segmento.
 *
 * O QUE ISTO NÃO É
 * Não são os cinco tipos do card flow adulto (`conceito`, `cenario`, `quiz`,
 * `input`, `resultado`, ver `lib/licoes.ts`). Aquele fluxo tem telas passivas:
 * a pessoa lê o conceito, lê o cenário e responde um quiz no fim. Aqui TODA
 * tela pede uma ação, e a explicação só aparece no feedback de erro — a pessoa
 * erra, e é o erro que ensina. É outro contrato pedagógico, com outro banco
 * (`Conceito`/`Licao`/`ItemAvaliativo`) e outro player.
 *
 * As duas trilhas convivem hoje. A substituição da trilha escolar antiga pela
 * nova é decisão tomada e está no backlog (`docs/backlog-curso-v2.md`), com o
 * player como pré-requisito — semear conteúdo que ninguém consegue jogar não
 * substitui nada.
 *
 * POR QUE O CUSTO É NÚMERO E NÃO INTUIÇÃO
 * Cada formato custa segundos: base + (erro esperado × custo do feedback). Uma
 * lição inteira tem teto de 140s. Sem o número, "só mais uma tela de ordenar"
 * é sempre defensável isoladamente e a lição estoura o tempo de aula sem que
 * ninguém consiga apontar onde. Com o número, o validador aponta.
 */

export type Formato =
  | "binaria"
  | "escolha3"
  | "classificar"
  | "ordenar"
  | "estimativa"
  | "caca_erro"
  | "fecho"

export type Papel =
  | "sonda"
  | "construcao"
  | "pratica"
  | "aplicacao"
  | "fluencia"
  | "fecho"
  | "reserva"

/** Custo em segundos: base + (erro esperado × custo do feedback). */
export const CUSTO: Record<Formato, number> = {
  binaria: 5.8,
  escolha3: 9.8,
  classificar: 20.0,
  ordenar: 20.0,
  estimativa: 15.0,
  caca_erro: 14.0,
  fecho: 6.0,
}

export const LIMITES = {
  enunciado: 120,
  alternativa: 60,
  alternativaFecho: 80,
  feedback: 160,
  ancora: 70,
  criterio: 40,
  instrucao: 70,
  frase: 140,
  custoMaxSeg: 140,
  telasSemAcao: 0,
  alternativasEscolha3: 3,
  itensReserva: 3,
  respostasMin: 15,
  /** ef12 lê devagar: a lição é mais curta, e o mínimo acompanha. */
  respostasMinEf12: 10,
} as const

/**
 * Composição canônica de 15 telas — ef89, em1, em2, em3.
 *
 * A ordem dos PAPÉIS é o contrato, e o validador cobra tela a tela. O formato
 * anotado é a preferência, não a regra: nas posições `ordenar` cabe
 * `classificar` e vice-versa (são o mesmo custo e o mesmo gesto de arrastar).
 */
export const COMPOSICAO_15: { papel: Papel; formato: Formato }[] = [
  { papel: "sonda", formato: "binaria" },
  { papel: "sonda", formato: "binaria" },
  { papel: "sonda", formato: "binaria" },
  { papel: "construcao", formato: "escolha3" },
  { papel: "construcao", formato: "escolha3" },
  { papel: "construcao", formato: "binaria" },
  { papel: "pratica", formato: "ordenar" },
  { papel: "pratica", formato: "binaria" },
  { papel: "pratica", formato: "binaria" },
  { papel: "aplicacao", formato: "estimativa" },
  { papel: "aplicacao", formato: "escolha3" },
  { papel: "aplicacao", formato: "escolha3" },
  { papel: "fluencia", formato: "binaria" },
  { papel: "fluencia", formato: "binaria" },
  { papel: "fecho", formato: "fecho" },
]

/** 12 telas — ef35 e ef67. */
export const COMPOSICAO_12: { papel: Papel; formato: Formato }[] = [
  ...COMPOSICAO_15.slice(0, 6),
  { papel: "pratica", formato: "classificar" },
  { papel: "pratica", formato: "binaria" },
  { papel: "aplicacao", formato: "escolha3" },
  { papel: "aplicacao", formato: "binaria" },
  { papel: "fluencia", formato: "binaria" },
  { papel: "fecho", formato: "fecho" },
]

/** 8 telas — ef12. Sem `escolha3`: ler três alternativas ainda custa caro aos 6 anos. */
export const COMPOSICAO_8: { papel: Papel; formato: Formato }[] = [
  { papel: "sonda", formato: "binaria" },
  { papel: "sonda", formato: "binaria" },
  { papel: "construcao", formato: "binaria" },
  { papel: "construcao", formato: "binaria" },
  { papel: "pratica", formato: "classificar" },
  { papel: "pratica", formato: "binaria" },
  { papel: "fluencia", formato: "binaria" },
  { papel: "fecho", formato: "fecho" },
]

/** Os sete segmentos escolares do curso, do 1º ano ao 3º do Médio. */
export const SEGMENTOS = ["ef12", "ef35", "ef67", "ef89", "em1", "em2", "em3"] as const
export type Segmento = (typeof SEGMENTOS)[number]

export function composicaoDe(segmento: string) {
  if (segmento === "ef12") return COMPOSICAO_8
  if (segmento === "ef35" || segmento === "ef67") return COMPOSICAO_12
  return COMPOSICAO_15
}

export function custoLicao(formatos: Formato[]): number {
  return Number(formatos.reduce((s, f) => s + CUSTO[f], 0).toFixed(1))
}
