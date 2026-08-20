// Finlow — formatos de tela do card flow v2.
// Fonte: FINLOW_ARQUITETURA_PEDAGOGICA_v1.md, seções 3 a 5.

export type Formato =
  | "binaria" | "escolha3" | "classificar" | "ordenar" | "estimativa" | "caca_erro" | "fecho";

export type Papel =
  | "sonda" | "construcao" | "pratica" | "aplicacao" | "fluencia" | "fecho" | "reserva";

/** Custo em segundos: base + (erro esperado × custo do feedback). Seção 3. */
export const CUSTO: Record<Formato, number> = {
  binaria: 5.8, escolha3: 9.8, classificar: 20.0, ordenar: 20.0,
  estimativa: 15.0, caca_erro: 14.0, fecho: 6.0,
};

export const LIMITES = {
  enunciado: 120, alternativa: 60, alternativaFecho: 80,
  feedback: 160, ancora: 70, criterio: 40, instrucao: 70,
  custoMaxSeg: 140, telasSemAcao: 0, alternativasEscolha3: 3,
  itensReserva: 3, respostasMin: 15,
} as const;

/** Composição canônica de 15 telas (ef89, em1..em3, adulto). Seção 3. */
export const COMPOSICAO_15: { papel: Papel; formato: Formato }[] = [
  { papel: "sonda", formato: "binaria" },
  { papel: "sonda", formato: "binaria" },
  { papel: "sonda", formato: "binaria" },
  { papel: "construcao", formato: "escolha3" },
  { papel: "construcao", formato: "escolha3" },
  { papel: "construcao", formato: "binaria" },
  { papel: "pratica", formato: "ordenar" },        // ou "classificar"
  { papel: "pratica", formato: "binaria" },
  { papel: "pratica", formato: "binaria" },
  { papel: "aplicacao", formato: "estimativa" },   // ou "caca_erro"
  { papel: "aplicacao", formato: "escolha3" },
  { papel: "aplicacao", formato: "escolha3" },
  { papel: "fluencia", formato: "binaria" },
  { papel: "fluencia", formato: "binaria" },
  { papel: "fecho", formato: "fecho" },
];

/** 12 telas — ef35 e ef67. */
export const COMPOSICAO_12: { papel: Papel; formato: Formato }[] = [
  ...COMPOSICAO_15.slice(0, 6),
  { papel: "pratica", formato: "classificar" },
  { papel: "pratica", formato: "binaria" },
  { papel: "aplicacao", formato: "escolha3" },
  { papel: "aplicacao", formato: "binaria" },
  { papel: "fluencia", formato: "binaria" },
  { papel: "fecho", formato: "fecho" },
];

/** 8 telas — ef12. Sem escolha3: leitura ainda é custosa nessa idade. */
export const COMPOSICAO_8: { papel: Papel; formato: Formato }[] = [
  { papel: "sonda", formato: "binaria" },
  { papel: "sonda", formato: "binaria" },
  { papel: "construcao", formato: "binaria" },
  { papel: "construcao", formato: "binaria" },
  { papel: "pratica", formato: "classificar" },
  { papel: "pratica", formato: "binaria" },
  { papel: "fluencia", formato: "binaria" },
  { papel: "fecho", formato: "fecho" },
];

export function composicaoDe(segmento: string) {
  if (segmento === "ef12") return COMPOSICAO_8;
  if (segmento === "ef35" || segmento === "ef67") return COMPOSICAO_12;
  return COMPOSICAO_15;
}

export function custoLicao(formatos: Formato[]): number {
  return Number(formatos.reduce((s, f) => s + CUSTO[f], 0).toFixed(1));
}
