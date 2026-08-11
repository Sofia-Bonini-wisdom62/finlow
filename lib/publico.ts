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

/**
 * Os públicos, que com a trilha escolar viraram SEGMENTOS.
 *
 * `publico` continua sendo o nome da coluna e da guarda, alargado em vez de
 * renomeado: são 20 arquivos lendo `filtroDeModulo()`, e um deles é o que
 * impede a trilha escolar de aparecer para adulto. Rename de campo com um
 * guarda de segurança no meio é o tipo de mudança que passa no compilador e
 * falha em produção; alargar não mexe em nenhuma chamada, e os 24 módulos de
 * EM já gravados continuam válidos sem migração.
 */
export const PUBLICOS = ["adulto", "ef12", "ef35", "ef67", "ef89", "em"] as const
export type Publico = (typeof PUBLICOS)[number]

/** Os segmentos escolares, com o nome que a pessoa lê. */
export const SEGMENTOS_ESCOLARES = [
  { id: "ef12", nome: "1º e 2º ano" },
  { id: "ef35", nome: "3º ao 5º ano" },
  { id: "ef67", nome: "6º e 7º ano" },
  { id: "ef89", nome: "8º e 9º ano" },
  { id: "em", nome: "Ensino Médio" },
] as const satisfies readonly { id: Publico; nome: string }[]

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

/**
 * A leitura que enxerga TODOS os públicos, de propósito.
 *
 * Existe para a biblioteca: o adulto pode explorar e fazer a trilha escolar,
 * mas ela nunca entra na recomendação nem no corredor dele. São duas perguntas
 * diferentes e por isso são dois helpers:
 *
 *   filtroDeModulo()   "o que é A TRILHA desta pessoa"  → recomendação, chat,
 *                      corredor, onboarding. Escolar aqui é o bug que o gate
 *                      existe para impedir.
 *   filtroExploravel() "o que esta pessoa PODE abrir"   → biblioteca, player,
 *                      progresso.
 *
 * Devolve objeto vazio em vez de `undefined` para poder ser espalhado num
 * `where` que já tem outras condições, sem o chamador precisar saber.
 *
 * NÃO USE ISTO PARA MONTAR TRILHA. Se aparecer numa leitura que alimenta
 * recomendação, a IA volta a sugerir aula de 2º ano para quem está negativado —
 * que é exatamente o sintoma que `scripts/testar-publico.mts` foi escrito para
 * pegar. O teste aceita os dois helpers, mas exige que um deles esteja lá: a
 * escolha tem de ser explícita, nunca esquecida.
 */
export function filtroExploravel(): Record<string, never> {
  return {}
}

/** A aula é de outro público — dá para explorar, mas não é a trilha da pessoa. */
export function ehDeOutroPublico(publicoDoModulo: string): boolean {
  return publicoDoModulo !== PUBLICO_ATUAL
}

export function ehPublico(v: string): v is Publico {
  return (PUBLICOS as readonly string[]).includes(v)
}
