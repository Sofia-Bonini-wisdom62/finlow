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
 * O público DEFAULT do produto — e, desde 11/08/2026, só o default.
 *
 * A promessa antiga deste comentário ("vira uma leitura do usuário") se
 * cumpriu com o Finlow para Escolas: `publicoDoUsuario()` lê `User.publico`,
 * e cada chamador busca o público UMA vez no topo e passa por parâmetro —
 * `filtroDeModulo(publico)` sempre aceitou o argumento. A constante segue
 * sendo o chão: usuário sem vínculo escolar é "adulto", e qualquer falha de
 * leitura cai aqui.
 */
export const PUBLICO_ATUAL: Publico = "adulto"

/**
 * O público da TRILHA desta pessoa, lido do banco.
 *
 * Falha de banco ou valor desconhecido caem em "adulto": negar a trilha
 * inteira por erro de leitura seria pior do que mostrar a default — o
 * contrário da regra do premium, onde erro NEGA, porque lá o erro generoso
 * daria produto de graça e aqui o erro conservador só mostraria a trilha
 * errada até a request seguinte.
 *
 * Importa `db` por import dinâmico para este arquivo continuar leve para os
 * scripts que só querem o vocabulário (testar-publico varre a fonte, não
 * executa; testar-convite importa ehPublico via convite-escola).
 */
export async function publicoDoUsuario(userId: string | null | undefined): Promise<Publico> {
  if (!userId) return PUBLICO_ATUAL
  try {
    const { db } = await import("@/lib/db")
    const u = await db.user.findUnique({ where: { id: userId }, select: { publico: true } })
    return u && ehPublico(u.publico) ? u.publico : PUBLICO_ATUAL
  } catch {
    return PUBLICO_ATUAL
  }
}

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

/**
 * A aula é de outro público — dá para explorar, mas não é a trilha da pessoa.
 *
 * O segundo parâmetro é o público DA PESSOA (publicoDoUsuario). Sem ele vale
 * o default, que reproduz o comportamento de antes da coluna existir. Para um
 * aluno de escola a régua inverte sozinha: a aula ADULTA é a "de outro
 * público" — explorável, valendo 1/4.
 */
export function ehDeOutroPublico(
  publicoDoModulo: string,
  publicoDaPessoa: Publico = PUBLICO_ATUAL
): boolean {
  return publicoDoModulo !== publicoDaPessoa
}

export function ehPublico(v: string): v is Publico {
  return (PUBLICOS as readonly string[]).includes(v)
}
