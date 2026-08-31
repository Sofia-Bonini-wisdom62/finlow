/**
 * Limitador de taxa em memória, por chave (IP, e-mail, o que couber).
 *
 * É POR INSTÂNCIA de função: na Vercel cada lambda carrega o seu mapa, então
 * o teto real pode ser N × instâncias e reiniciar do zero num deploy. Serve
 * como atrito anti-abuso barato para formulário público — não como quota
 * exata. Se um dia precisar de quota de verdade, isso vira uma tabela.
 *
 * ── Duas formas de contar, e a diferença importa ───────────────────────────
 * `permitido` conta TENTATIVAS: pergunta e registra no mesmo gesto, que é o
 * que um formulário público precisa (cada envio custa, dando certo ou não).
 *
 * A porta de senha precisa da outra forma, porque ali só a FALHA é sintoma: o
 * veredito só existe depois do bcrypt, e contar o acerto junto puniria quem
 * entra e sai várias vezes no mesmo dia. Daí o par `excedeu` (pergunta, não
 * registra) + `registrar` (registra depois do resultado), com `limpar` no
 * acerto — sem ele, dez erros de digitação seguidos de um acerto deixariam a
 * pessoa trancada por quinze minutos DEPOIS de já ter provado quem é.
 */

const janelas = new Map<string, number[]>()

/** Evita o mapa crescer sem limite com chaves que nunca mais voltam. */
const MAX_CHAVES = 2000

/** Os toques daquela chave que ainda estão dentro da janela. */
function vivas(chave: string, corte: number): number[] {
  return (janelas.get(chave) ?? []).filter((t) => t > corte)
}

/** Pergunta sem registrar. Para quando o veredito ainda não é conhecido. */
export function excedeu(chave: string, max: number, janelaMs: number, agora: number = Date.now()): boolean {
  return vivas(chave, agora - janelaMs).length >= max
}

/** Registra um toque. Chamado depois do resultado, quando só a falha conta. */
export function registrar(chave: string, janelaMs: number, agora: number = Date.now()): void {
  const corte = agora - janelaMs

  if (janelas.size > MAX_CHAVES) {
    for (const [k, lista] of janelas) {
      if (lista.every((t) => t <= corte)) janelas.delete(k)
    }
  }

  const lista = vivas(chave, corte)
  lista.push(agora)
  janelas.set(chave, lista)
}

/** Zera a contagem daquela chave — o acerto perdoa os erros anteriores. */
export function limpar(chave: string): void {
  janelas.delete(chave)
}

/** Pergunta e registra no mesmo gesto: cada chamada é uma tentativa gasta. */
export function permitido(chave: string, max: number, janelaMs: number, agora: number = Date.now()): boolean {
  if (excedeu(chave, max, janelaMs, agora)) return false
  registrar(chave, janelaMs, agora)
  return true
}
