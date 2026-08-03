import { db } from "@/lib/db"

/**
 * Os dados macro que os módulos citam.
 *
 * O conteúdo da aula NUNCA crava o número: escreve `{{selic_atual}}` e a
 * variável é trocada na hora de exibir. Selic e IPCA mudam várias vezes por
 * ano; número no corpo do texto vira mentira silenciosa meses depois, e a
 * correção obrigaria reescrever módulo.
 *
 * É o mesmo princípio da tabela de preços em `lib/custo.ts`: constante nomeada,
 * com data de apuração e fonte, num lugar só.
 */

/** Valores de referência de agosto de 2026. Semeados uma vez; depois a fonte é
 *  o banco, e atualizar é UPDATE, não deploy. */
export const INDICADORES_INICIAIS = [
  {
    chave: "selic_atual",
    valor: "14.25",
    rotulo: "14,25% ao ano",
    numero: 14.25,
    fonte: "Copom / Banco Central",
    apuradoEm: new Date("2026-06-17"),
  },
  {
    chave: "ipca_12m",
    valor: "4.64",
    rotulo: "4,64% em 12 meses",
    numero: 4.64,
    fonte: "IBGE / Banco Central",
    apuradoEm: new Date("2026-06-30"),
  },
  {
    chave: "rotativo_medio",
    valor: "428.3",
    rotulo: "428,3% ao ano",
    numero: 428.3,
    fonte: "Banco Central, Estatísticas de Crédito",
    apuradoEm: new Date("2026-03-31"),
  },
  {
    chave: "teto_rotativo",
    valor: "100",
    rotulo: "100% da dívida original",
    numero: 100,
    fonte: "Lei 14.690/2023, em vigor desde 03/01/2024",
    apuradoEm: new Date("2024-01-03"),
  },
  {
    chave: "salario_minimo",
    valor: "1621",
    rotulo: "R$ 1.621",
    numero: 1621,
    fonte: "Decreto 12.797/2025",
    apuradoEm: new Date("2026-01-01"),
  },
  {
    chave: "meta_inflacao",
    valor: "3",
    rotulo: "3% ao ano, com margem de 1,5 ponto",
    numero: 3,
    fonte: "Conselho Monetário Nacional",
    apuradoEm: new Date("2026-01-01"),
  },
  {
    chave: "consignado_clt",
    valor: "3.2",
    rotulo: "3,2% ao mês",
    numero: 3.2,
    fonte: "Ministério do Trabalho e Emprego",
    apuradoEm: new Date("2026-01-31"),
  },
  {
    chave: "isencao_ir",
    valor: "5000",
    rotulo: "R$ 5.000 por mês",
    numero: 5000,
    fonte: "Lei 15.270/2025, em vigor desde jan/2026",
    apuradoEm: new Date("2026-01-01"),
  },
] as const

export interface Indicador {
  chave: string
  rotulo: string
  numero: number | null
  fonte: string
  apuradoEm: Date
}

/** Todos, em mapa, para interpolar um módulo inteiro numa consulta só. */
export async function carregarIndicadores(): Promise<Map<string, Indicador>> {
  const linhas = await db.indicador.findMany({
    select: { chave: true, rotulo: true, numero: true, fonte: true, apuradoEm: true },
  })
  return new Map(linhas.map((l) => [l.chave, l]))
}

/**
 * Troca `{{chave}}` pelo rótulo do indicador.
 *
 * Chave desconhecida fica COMO ESTÁ, visível. A alternativa seria apagar,
 * e aí um erro de digitação num módulo viraria uma frase sem o número, que
 * ninguém percebe. `{{selic_atul}}` na tela é feio e é achado no mesmo dia.
 */
export function interpolarIndicadores(
  texto: string,
  indicadores: Map<string, Indicador>
): string {
  return texto.replace(/\{\{(\w+)\}\}/g, (bruto, chave: string) => {
    const i = indicadores.get(chave)
    return i ? i.rotulo : bruto
  })
}

/** As chaves citadas num texto. Serve para o teste conferir que todo módulo só
 *  cita indicador que existe. */
export function chavesCitadas(texto: string): string[] {
  return [...texto.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1])
}
