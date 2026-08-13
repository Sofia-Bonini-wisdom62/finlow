/**
 * Nível do jogador — função PURA de User.pontos, sem coluna nova: o nível é
 * uma leitura, não um estado, e por isso nunca dessincroniza dos pontos.
 *
 * Curva quadrática 50·(n-1)²: nível 2 aos 50, 3 aos 200, 4 aos 450, 5 aos
 * 800… Cedo o suficiente para o começo ter progresso visível (onboarding já
 * dá 50), e crescente o bastante para nível alto significar alguma coisa.
 */

export interface Nivel {
  nivel: number
  /** Pontos ganhos dentro do nível atual. */
  noNivel: number
  /** Quanto falta para o próximo. */
  paraProximo: number
  /** 0..1, para a barra. */
  fracao: number
}

export function nivelDoTotal(pontos: number): Nivel {
  const p = Math.max(0, pontos)
  const nivel = Math.floor(Math.sqrt(p / 50)) + 1
  const base = 50 * (nivel - 1) ** 2
  const proximo = 50 * nivel ** 2
  return {
    nivel,
    noNivel: p - base,
    paraProximo: proximo - p,
    fracao: Math.min(1, (p - base) / (proximo - base)),
  }
}
