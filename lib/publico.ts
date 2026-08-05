/**
 * Para qual público uma aula foi escrita.
 *
 * O Finlow no ar é o produto adulto. A trilha de Ensino Médio (24 módulos,
 * cobrindo as 47 habilidades da matriz do Banco Central) mora na MESMA tabela
 * `Modulo`, porque é o mesmo card flow, o mesmo player e o mesmo progresso —
 * duplicar a tabela duplicaria também os cinco tipos de tela e o motor de
 * resultado.
 *
 * POR QUE ISTO É UM MÓDULO E NÃO UM `where` COPIADO EM NOVE LUGARES
 * São nove pontos de leitura de `Modulo` hoje: a biblioteca, a busca, o chat,
 * o onboarding, o posicionamento e quatro dentro da recomendação. Um `where`
 * copiado em nove lugares é um `where` esquecido no décimo — e o décimo não dá
 * erro nenhum: ele devolve as duas trilhas juntas, e o sintoma aparece como a
 * IA recomendando "Estudar sem se afundar" para alguém de 38 anos.
 *
 * Com o filtro num lugar só, `scripts/testar-publico.mts` consegue afirmar que
 * todo `db.modulo.find*` do app passa por aqui, e quebra quando um novo não
 * passa.
 */

export const PUBLICOS = ["adulto", "em"] as const
export type Publico = (typeof PUBLICOS)[number]

/**
 * O público do produto que está no ar.
 *
 * Hoje é constante porque só existe um app. Quando a trilha de EM virar oferta
 * de verdade, isto vira uma leitura do usuário (`User.publico`) e só este
 * arquivo muda — nenhuma das nove chamadas precisa saber.
 */
export const PUBLICO_ATUAL: Publico = "adulto"

/** O `where` de toda leitura de `Modulo`. Espalhe isto, nunca a string. */
export function filtroDeModulo(publico: Publico = PUBLICO_ATUAL): { publico: Publico } {
  return { publico }
}

export function ehPublico(v: string): v is Publico {
  return (PUBLICOS as readonly string[]).includes(v)
}
