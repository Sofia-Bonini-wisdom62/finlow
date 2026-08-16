/**
 * Os pacotes da banca de câmbio (economia por XP, 15/08/2026), num arquivo
 * SEM importar o banco de propósito: a LojaFin é client component e puxar o
 * catálogo de lib/conversao.ts arrastaria o Prisma pro bundle do navegador,
 * a mesma armadilha que fez AVATAR_POSE morar em lib/fin.ts.
 *
 * A taxa é 2 XP por moeda. Referência de esforço: uma lição cheia paga 5 XP
 * mais bônus; a poção de 40 moedas custa 80 XP, mais ou menos dois módulos
 * bem feitos.
 */
export const PACOTES_DE_MOEDAS = {
  p20: { xp: 20, moedas: 10 },
  p100: { xp: 100, moedas: 50 },
} as const

export type PacoteId = keyof typeof PACOTES_DE_MOEDAS
