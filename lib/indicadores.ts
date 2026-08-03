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

  // ---- dados de comportamento, citados pelos módulos da Faixa 1 ----------
  // Envelhecem como os macro: pesquisa nova sai todo ano. Mesma regra, mesma
  // tabela — módulo nenhum crava esses números no texto.
  {
    chave: "inadimplentes",
    valor: "81700000",
    rotulo: "81,7 milhões de pessoas",
    numero: 81700000,
    fonte: "Serasa, Mapa da Inadimplência",
    apuradoEm: new Date("2026-02-28"),
  },
  {
    chave: "divida_media",
    valor: "6598.13",
    rotulo: "R$ 6.598,13",
    numero: 6598.13,
    fonte: "Serasa, Mapa da Inadimplência",
    apuradoEm: new Date("2026-02-28"),
  },
  {
    chave: "ticket_acordo",
    valor: "793",
    rotulo: "R$ 793",
    numero: 793,
    fonte: "Serasa, ticket médio de acordo",
    apuradoEm: new Date("2026-02-28"),
  },
  {
    chave: "endividamento_familias",
    valor: "80.4",
    rotulo: "80,4% das famílias",
    numero: 80.4,
    fonte: "Peic / CNC",
    apuradoEm: new Date("2026-03-31"),
  },
  {
    chave: "sem_reserva_pct",
    valor: "31",
    rotulo: "31% dos brasileiros",
    numero: 31,
    fonte: "Anbima / Datafolha, Raio-X do Investidor 9ª ed.",
    apuradoEm: new Date("2025-12-31"),
  },
  {
    chave: "gasto_assinaturas",
    valor: "56",
    rotulo: "entre R$ 51 e R$ 200 por mês",
    numero: 56,
    fonte: "Vindi / Opinion Box, Pesquisa de Assinaturas",
    apuradoEm: new Date("2025-05-31"),
  },
  {
    chave: "compras_nao_planejadas",
    valor: "61",
    rotulo: "61% dos consumidores",
    numero: 61,
    fonte: "CNDL / SPC Brasil",
    apuradoEm: new Date("2025-12-31"),
  },
  {
    chave: "parcelado_sem_juros",
    valor: "42.6",
    rotulo: "42,6% das compras no cartão",
    numero: 42.6,
    fonte: "ABECS",
    apuradoEm: new Date("2025-12-31"),
  },
  {
    chave: "letramento_juros",
    valor: "14.3",
    rotulo: "14,3% dos adultos",
    numero: 14.3,
    fonte: "Banco Central / OCDE-INFE",
    apuradoEm: new Date("2023-12-31"),
  },
  {
    chave: "gasto_medio_bets",
    valor: "164",
    rotulo: "R$ 164 por mês",
    numero: 164,
    fonte: "Secretaria de Prêmios e Apostas, Ministério da Fazenda",
    apuradoEm: new Date("2025-06-30"),
  },
  {
    chave: "apostadores_negativados",
    valor: "29",
    rotulo: "29% dos apostadores",
    numero: 29,
    fonte: "CNDL / SPC Brasil",
    apuradoEm: new Date("2025-11-30"),
  },
  {
    chave: "vitimas_golpe",
    valor: "24",
    rotulo: "24% dos brasileiros, cerca de 40,8 milhões de pessoas",
    numero: 24,
    fonte: "DataSenado",
    apuradoEm: new Date("2024-10-31"),
  },
  {
    chave: "perdas_golpe",
    valor: "10100000000",
    rotulo: "R$ 10,1 bilhões",
    numero: 10100000000,
    fonte: "Febraban",
    apuradoEm: new Date("2024-12-31"),
  },
  {
    chave: "sem_controle_orcamento",
    valor: "48",
    rotulo: "48% dos brasileiros",
    numero: 48,
    fonte: "CNDL / SPC Brasil",
    apuradoEm: new Date("2025-12-31"),
  },
  {
    chave: "informalidade",
    valor: "38.6",
    rotulo: "38,6% dos ocupados",
    numero: 38.6,
    fonte: "IBGE, PNAD Contínua",
    apuradoEm: new Date("2024-12-31"),
  },
  {
    chave: "mei_total",
    valor: "16170000",
    rotulo: "16,17 milhões de MEIs",
    numero: 16170000,
    fonte: "Receita Federal",
    apuradoEm: new Date("2025-12-31"),
  },
  {
    chave: "mei_inadimplente_das",
    valor: "6780000",
    rotulo: "6,78 milhões inadimplentes no DAS",
    numero: 6780000,
    fonte: "Receita Federal",
    apuradoEm: new Date("2025-12-31"),
  },
  {
    chave: "rendimento_app",
    valor: "2996",
    rotulo: "R$ 2.996 por mês",
    numero: 2996,
    fonte: "IBGE, PNAD Contínua",
    apuradoEm: new Date("2024-12-31"),
  },
  {
    chave: "brigas_por_dinheiro",
    valor: "53",
    rotulo: "53% dos brasileiros",
    numero: 53,
    fonte: "Serasa",
    apuradoEm: new Date("2025-12-31"),
  },
  {
    chave: "pouparam_no_ano",
    valor: "33",
    rotulo: "33% dos brasileiros",
    numero: 33,
    fonte: "Anbima / Datafolha, Raio-X do Investidor 9ª ed.",
    apuradoEm: new Date("2025-12-31"),
  },
  {
    chave: "credito_pessoal",
    valor: "15.81",
    rotulo: "cerca de 15,8% ao mês",
    numero: 15.81,
    fonte: "Banco Central, Estatísticas de Crédito",
    apuradoEm: new Date("2026-01-31"),
  },
  {
    chave: "financiamento_imovel",
    valor: "11",
    rotulo: "de 9,5% a 12,5% ao ano, mais TR",
    numero: 11,
    fonte: "Banco Central / Caixa",
    apuradoEm: new Date("2026-02-28"),
  },
  {
    chave: "poupanca_pct",
    valor: "22",
    rotulo: "22% da população",
    numero: 22,
    fonte: "Anbima / Datafolha, Raio-X do Investidor",
    apuradoEm: new Date("2025-12-31"),
  },
  {
    chave: "teto_mei",
    valor: "81000",
    rotulo: "R$ 81.000 por ano",
    numero: 81000,
    fonte: "Lei Complementar 123/2006, limite do MEI",
    apuradoEm: new Date("2026-01-01"),
  },
  {
    chave: "investidores",
    valor: "60600000",
    rotulo: "60,6 milhões de pessoas, 36% da população adulta",
    numero: 60600000,
    fonte: "Anbima / Datafolha, Raio-X do Investidor 9ª ed.",
    apuradoEm: new Date("2025-12-31"),
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
