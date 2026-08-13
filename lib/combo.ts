/**
 * Combo de acertos (item "recompensar sequência de acertos" do protótipo).
 *
 * O combo ATRAVESSA lições, guardado em User.comboAtual — decisão que o
 * protótipo não precisou tomar: lá a lição de demonstração tinha 5 quizzes;
 * as lições reais têm 0–2, e um combo interno à lição nunca acenderia. A
 * sequência viva entre lições transforma "3 lições bem feitas seguidas" em
 * chama acesa, que é o comportamento que vale recompensar.
 *
 * QUEM CALCULA É O SERVIDOR, dos mesmos `respostas` que já dão a nota: o
 * cliente mostra o chip como cortesia, mas o crédito sai do recálculo contra
 * o gabarito, na ordem das telas (POST /api/progresso). Refazer lição não
 * mexe no combo nem paga bônus — mesma regra dos pontos.
 */

export const COMBO_ACENDE = 3
export const BONUS_POR_ACERTO_EM_COMBO = 3

export interface ResultadoCombo {
  /** A sequência viva ao fim da lição (vai para User.comboAtual). */
  combo: number
  /** O pico atingido DENTRO desta lição, contando a herança. */
  comboMax: number
  /** Pontos de bônus ganhos nesta lição. */
  bonus: number
}

/** Pura: percorre os quizzes na ordem das telas, partindo do combo herdado. */
export function calcularCombo(comboInicial: number, resultados: boolean[]): ResultadoCombo {
  let combo = Math.max(0, comboInicial)
  let comboMax = combo
  let bonus = 0
  for (const acertou of resultados) {
    combo = acertou ? combo + 1 : 0
    comboMax = Math.max(comboMax, combo)
    if (acertou && combo >= COMBO_ACENDE) bonus += BONUS_POR_ACERTO_EM_COMBO
  }
  return { combo, comboMax, bonus }
}
