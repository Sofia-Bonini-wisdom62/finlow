/**
 * O vocabulário dos papéis de escola, sozinho num arquivo FOLHA.
 *
 * Ele morava em lib/escola.ts, que é o lugar certo para a REGRA (quem pode o
 * quê) mas o lugar errado para a PALAVRA: lib/escola.ts importa `next/server`
 * e `@/lib/auth`, e portanto arrasta o next-auth inteiro para dentro de quem
 * só queria saber se "professor" é um papel válido. É a mesma separação que
 * lib/publico.ts faz por outro motivo, e que faz `scripts/criar-escola.mts`
 * continuar rodando sem `--conditions react-server`.
 *
 * lib/escola.ts reexporta os três nomes, então nada que já importava de lá
 * precisa mudar.
 */

export const PAPEIS = ["adm", "professor", "aluno"] as const
export type PapelEscola = (typeof PAPEIS)[number]

export function ehPapel(v: string): v is PapelEscola {
  return (PAPEIS as readonly string[]).includes(v)
}

/** Como o papel se chama na tela. O banco guarda "adm"; ninguém lê "adm". */
export function rotuloDePapel(papel: PapelEscola): string {
  return papel === "adm" ? "administração" : papel === "professor" ? "professor" : "aluno"
}
