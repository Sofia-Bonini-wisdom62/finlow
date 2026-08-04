/**
 * Limitador de taxa em memória, por chave (IP, e-mail, o que couber).
 *
 * É POR INSTÂNCIA de função: na Vercel cada lambda carrega o seu mapa, então
 * o teto real pode ser N × instâncias e reiniciar do zero num deploy. Serve
 * como atrito anti-abuso barato para formulário público — não como quota
 * exata. Se um dia precisar de quota de verdade, isso vira uma tabela.
 */

const janelas = new Map<string, number[]>()

/** Evita o mapa crescer sem limite com chaves que nunca mais voltam. */
const MAX_CHAVES = 2000

export function permitido(chave: string, max: number, janelaMs: number, agora: number = Date.now()): boolean {
  const corte = agora - janelaMs

  if (janelas.size > MAX_CHAVES) {
    for (const [k, lista] of janelas) {
      if (lista.every((t) => t <= corte)) janelas.delete(k)
    }
  }

  const lista = (janelas.get(chave) ?? []).filter((t) => t > corte)
  if (lista.length >= max) {
    janelas.set(chave, lista)
    return false
  }
  lista.push(agora)
  janelas.set(chave, lista)
  return true
}
