/**
 * A cota do mês traduzida para a pergunta que a pessoa realmente faz:
 * "quantas perguntas ainda tenho?".
 *
 * POR QUE ISTO EXISTE, E O QUE ELE NÃO MUDA
 * Contar em TOKEN é decisão registrada da fundadora e continua de pé
 * (`lib/pagamento/tokens.ts`): mensagem não mede nada, porque uma pergunta de
 * três palavras e uma conversa de vinte turnos sobre o extrato inteiro contam
 * igual, e é a segunda que custa. O guard, a soma e o teto seguem em token.
 *
 * O que estava errado era só a TELA. "Restam 94.300 de 120.000" é conta de
 * padaria: ninguém sabe se isso dá para conversar amanhã. Este módulo não
 * mede nada novo, ele só divide o que já foi medido por um número nomeado.
 *
 * PURO E SEM `server-only` DE PROPÓSITO: quem mostra o número é uma tela de
 * cliente (`/premium`), e `lib/pagamento/tokens.ts` é servidor. A tela recebe
 * `restam` pela API e faz a divisão aqui, no mesmo código que o teste exercita.
 */

/**
 * O custo típico de uma pergunta no chat, em tokens.
 *
 * De onde vem: o contexto financeiro inteiro vai em CADA turno, e uma conversa
 * gasta de 5 a 8 mil tokens de entrada mais a resposta. O número aqui é a ponta
 * ALTA dessa faixa, e isso é escolha: a estimativa erra para menos, então quem
 * lê "cerca de 12 perguntas" costuma conseguir mais que 12. Errar para mais
 * seria prometer conversa que a cota não paga.
 *
 * A conta fecha com a régua do plano: 120.000 / 8.000 = 15, exatamente as "15
 * mensagens grátis" que o documento pedia antes de a cota virar token.
 *
 * Muda aqui e muda em todo lugar: ninguém mais tem esse número escrito.
 */
export const TOKENS_POR_PERGUNTA = 8_000

/**
 * Quantas perguntas ainda cabem na cota.
 *
 * `null` quando não há teto (assinante): não existe "quantas faltam" para quem
 * não tem limite, e devolver um número grande ali seria inventar uma parede.
 *
 * O PISO DE 1 ENQUANTO `podeUsar` NÃO É ARREDONDAMENTO, É A REGRA DO TETO.
 * O guard roda antes da chamada, então quem ainda tem qualquer sobra ganha a
 * próxima resposta INTEIRA, mesmo que ela estoure o teto (está escrito em
 * `tokens.ts`, e é de propósito). Uma tela que dissesse "restam 0 perguntas"
 * com o chat ainda respondendo trocaria a conta de padaria por uma mentira, que
 * é pior. Zero aqui significa a mesma coisa que `podeUsar: false`: acabou.
 */
export function perguntasRestantes(
  restamTokens: number | null,
  podeUsar: boolean
): number | null {
  if (restamTokens == null) return null
  if (!podeUsar) return 0
  return Math.max(1, Math.floor(restamTokens / TOKENS_POR_PERGUNTA))
}

/**
 * O tamanho da cota do mês, em perguntas, para servir de referência ao lado do
 * que resta ("cerca de 12 de 15"). `null` quando não há teto.
 */
export function perguntasNoTeto(tetoTokens: number | null): number | null {
  if (tetoTokens == null) return null
  return Math.max(1, Math.floor(tetoTokens / TOKENS_POR_PERGUNTA))
}

/** "1 pergunta" / "12 perguntas", para a frase não ficar torta no singular. */
export function rotuloPerguntas(n: number): string {
  return n === 1 ? "1 pergunta" : `${n.toLocaleString("pt-BR")} perguntas`
}
