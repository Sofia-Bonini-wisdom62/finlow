/**
 * Corta o texto do extrato em pedaços para parsear em paralelo.
 *
 * POR QUE ISTO EXISTE
 * Um extrato de 3 meses (35 páginas, 438 lançamentos) leva 90 segundos numa
 * chamada só, e com o retry da validação passa de 180. Isso estoura o tempo da
 * função e a pessoa vê "timeout" sem entender o motivo. Em paralelo, o tempo
 * total vira o do maior pedaço, não a soma.
 *
 * POR QUE SÓ AGORA
 * Tentei isto antes e revertí: o resultado mudava de 142 para 228 linhas e eu
 * não tinha como saber qual estava certo. Mudar extração sem conseguir medir é
 * troca de um erro conhecido por um desconhecido.
 *
 * Hoje dá para medir. A conferência por saldo diário (lib/extrato/validar.ts) é
 * INDEPENDENTE do corte — os saldos são lidos do texto inteiro, por regex, sem
 * passar pelo modelo. Se um pedaço perder ou duplicar uma linha na emenda, a
 * soma do dia deixa de bater e o portão reprova. O corte deixou de ser um salto
 * de fé.
 *
 * A REGRA DO CORTE
 * Só corta em cabeçalho de dia ("27 de julho de 2026"). Nunca no meio de um
 * dia, porque aí a transação partida ao meio some ou aparece torta nos dois
 * lados. Se não achar cabeçalho suficiente, NÃO corta — devolve o texto inteiro
 * e o parsing segue como antes. Extrato de banco desconhecido continua
 * funcionando, só não fica mais rápido.
 */

const MESES =
  "janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro"

/** "27 de julho de 2026" ou "10 de junho 2026" */
const CABECALHO_DIA = new RegExp(String.raw`\d{1,2}\s+de\s+(?:${MESES})\s+(?:de\s+)?\d{4}`, "gi")

/** Abaixo disso não compensa: o custo fixo do prompt por pedaço come o ganho. */
const MINIMO_PARA_CORTAR = 25_000

export interface Pedaco {
  texto: string
  /** Só para log — quantos cabeçalhos de dia caíram neste pedaço. */
  dias: number
}

export function dividirPorDia(texto: string, alvo = 14_000): Pedaco[] {
  if (texto.length < MINIMO_PARA_CORTAR) return [{ texto, dias: 0 }]

  // Posições onde um dia começa. São os únicos cortes seguros.
  const inicios: number[] = []
  for (const m of texto.matchAll(CABECALHO_DIA)) {
    if (m.index !== undefined) inicios.push(m.index)
  }

  // Menos de 4 dias num extrato grande: o formato não é o que eu espero.
  // Melhor uma chamada lenta e correta do que um corte no lugar errado.
  if (inicios.length < 4) return [{ texto, dias: inicios.length }]

  const pedacos: Pedaco[] = []
  let comeco = 0
  let dias = 0

  for (let i = 0; i < inicios.length; i++) {
    dias++
    const proximo = inicios[i + 1]
    if (proximo === undefined) break
    // Fecha o pedaço quando já passou do alvo, sempre na virada de um dia.
    if (proximo - comeco >= alvo) {
      pedacos.push({ texto: texto.slice(comeco, proximo), dias })
      comeco = proximo
      dias = 0
    }
  }
  // O resto (inclui o cabeçalho do extrato, que fica no primeiro pedaço).
  pedacos.push({ texto: texto.slice(comeco), dias })

  return pedacos.length > 1 ? pedacos : [{ texto, dias: inicios.length }]
}
