/**
 * A lista de quem opera o Finlow, sozinha num arquivo FOLHA.
 *
 * Mesma separação de lib/escola-papeis.ts e pela mesma razão prática: o guard
 * (lib/ops.ts) importa `@/lib/auth`, e o next-auth arrasta contexto de React
 * cliente atrás de si. Um script que só quer conferir "esta string vira que
 * lista de e-mails?" não consegue nem carregar o módulo, e a regra mais
 * importante da superfície ficaria sem teste.
 *
 * FALHA FECHADA, e isto é a lição do guard de /api/ops/metrics: aquele guard
 * testava "se a variável existe, confira", e portanto liberava geral quando
 * ninguém a definia, com toda a aparência de estar protegendo. Aqui a
 * ausência devolve lista vazia, e lista vazia não contém e-mail nenhum.
 *
 * Lida a CADA chamada, nunca memorizada em constante de módulo: tirar um
 * e-mail na Vercel precisa valer na request seguinte, e um `const` no topo do
 * arquivo faria a mudança só valer no próximo deploy.
 */
export function emailsDeOps(): string[] {
  return (process.env.OPS_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}
