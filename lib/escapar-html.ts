/**
 * Escapa os cinco caracteres que dão sentido de marcação ao HTML.
 *
 * POR QUE ISTO EXISTE
 * As telas da trilha renderizam o texto da aula com `dangerouslySetInnerHTML`,
 * e isso é deliberado: quem escreve a aula usa negrito e destaque no meio da
 * frase, e o conteúdo vem do banco, semeado por nós. O problema nunca foi o
 * texto do autor, foi o pedaço que a PESSOA digita e que a tela devolve
 * interpolado no meio dele: ali o navegador não sabe distinguir a marcação que
 * o autor quis do que a pessoa escreveu.
 *
 * Escapar na SAÍDA, e não na entrada, é decisão consciente: o valor digitado
 * segue guardado como a pessoa escreveu (o extrato e o resumo dependem disso),
 * e a fuga acontece no único lugar em que o texto vira HTML.
 */
export function escaparHtml(bruto: string): string {
  return bruto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
