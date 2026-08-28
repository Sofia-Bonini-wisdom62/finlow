/**
 * As regras de objetivo que a TELA e a ROTA precisam saber igual.
 *
 * Puro e sem banco de propósito — o par com `lib/objetivo-repo.ts` é o mesmo de
 * `personalidade.ts` × `personalidade-repo.ts`. A tela é componente de cliente:
 * importar o repositório traria o Prisma para o navegador.
 *
 * POR QUE ISTO EXISTE, E NÃO É UM `const` SOLTO NA TELA
 * Desde 28/08/2026 a pessoa DIGITA quanto quer guardar (antes o botão só somava
 * de R$ 50 em R$ 50). Digitar significa que existe valor recusado — e recusa é
 * a única parte da tela em que uma cópia divergente aparece como sujeira na
 * cara de quem usa: o campo aceita, a tela manda, o servidor devolve 400 e a
 * pessoa vê "Valor inválido" sem ter feito nada de errado. Ou o contrário, pior:
 * a tela recusa o que o servidor gravaria.
 *
 * Então quem decide o que é um valor é esta função, e as duas pontas chamam
 * ela. A tela usa para avisar ANTES de mandar; a rota usa porque a tela não é
 * autoridade nenhuma — o `fetch` que chega ali pode não ter vindo dela.
 */
import { paraNumero } from "./formato"

/**
 * Teto de meta e de depósito. Nada científico — só impede dedo dormindo no 9
 * de virar um gráfico ilegível.
 */
export const VALOR_MAX = 100_000_000

export type ValorLido =
  | { ok: true; valor: number }
  | { ok: false; motivo: string }

/**
 * Texto digitado → valor em reais, ou o motivo da recusa em português.
 *
 * A leitura é a de `paraNumero`, que entende o jeito brasileiro de escrever
 * dinheiro: "1.234,56" é mil duzentos e trinta e quatro reais e cinquenta e
 * seis centavos, não `NaN`. A tela de objetivos fazia `Number(texto.replace(",", "."))`,
 * que transforma "1.000,00" em "1.000.00" e devolve `NaN` — quem digitasse a
 * meta com ponto de milhar levava "Meta inválida" tendo escrito certo. É o
 * mesmo defeito que `paraNumero` foi escrita para resolver no Painel.
 *
 * Arredonda para centavos: `0.1 + 0.2` guardado três vezes seguidas vira um
 * saldo com quinze casas, e a barra de progresso passa a mentir na terceira.
 */
export function lerValor(bruto: string | number): ValorLido {
  const texto = typeof bruto === "string" ? bruto.trim() : bruto
  if (texto === "" || texto === null || texto === undefined) {
    return { ok: false, motivo: "Escreve quanto você quer guardar." }
  }

  const n = paraNumero(texto)
  if (!isFinite(n)) return { ok: false, motivo: "Não entendi esse valor. Só números, por favor." }
  if (n <= 0) return { ok: false, motivo: "O valor precisa ser maior que zero." }
  if (n > VALOR_MAX) return { ok: false, motivo: "Esse valor passa do que dá para registrar aqui." }

  return { ok: true, valor: Math.round(n * 100) / 100 }
}
