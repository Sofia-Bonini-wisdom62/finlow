/**
 * Acha lançamento que JÁ ESTÁ no banco antes de ele entrar de novo.
 *
 * ── O problema ─────────────────────────────────────────────────────────────
 * Nada no caminho do extrato comparava o que chega com o que já foi lançado.
 * Subir o extrato de janeiro–março e depois o de fevereiro–abril gravava
 * fevereiro e março DUAS VEZES, e o dash passava a contar o dobro sem nenhum
 * sinal na tela. Como `limitarA3Meses` corta em 3 meses, período que se
 * sobrepõe é o caso comum, não o raro.
 *
 * ── Por que isto vive aqui, puro e sem banco ───────────────────────────────
 * `descricao` e `valor` são CIFRADOS com IV aleatório (lib/cripto.ts): o mesmo
 * texto vira uma cifra diferente a cada gravação. Não existe índice único nem
 * comparação em SQL que resolva isso — a comparação TEM de acontecer em
 * memória, depois de decifrar. O que sobra em claro (`data`, `tipo`) serve só
 * para estreitar o candidato antes de decifrar.
 *
 * ── A regra ────────────────────────────────────────────────────────────────
 * Mesmo dia, mesmo tipo e mesmo valor ao centavo. A descrição gradua a
 * confiança, não decide o casamento:
 *
 *   "exata"    descrição igual depois de normalizar — a tela DESMARCA
 *   "provavel" descrição diferente — a tela só AVISA, e a linha segue marcada
 *
 * ── Por que graduar em vez de cortar ───────────────────────────────────────
 * Repetição legítima existe: dá para pagar dois cafés de R$ 12 no mesmo dia no
 * mesmo lugar. Nenhuma regra distingue isso de uma duplicata com certeza. Os
 * dois erros custam caro e em direções opostas — apagar linha verdadeira faz o
 * total faltar, deixar duplicata passar faz o total dobrar. Por isso a ação
 * automática (desmarcar) fica só onde a evidência é mais forte, e o resto é
 * informação. Quem decide é a pessoa, com o motivo à vista, como já acontece
 * com a linha de ajuste.
 *
 * NUNCA apaga e nunca deixa de gravar: a linha entra como as outras, pendente.
 * O que muda é o estado do check na tela de conferência.
 *
 * ── Casamento é 1 para 1 ───────────────────────────────────────────────────
 * Cada linha existente absorve NO MÁXIMO uma linha nova. Sem isso, quem já tem
 * um café de R$ 12 no dia 3 veria os dois cafés novos do dia 3 marcados como
 * duplicata do mesmo lançamento — e perderia um gasto verdadeiro.
 */

import { chaveDia } from "@/lib/dia"

export interface LancamentoComparavel {
  /** Instante gravado. Só o DIA (em UTC) é comparado. */
  data: Date
  /** "receita" | "despesa" */
  tipo: string
  /** Sempre positivo — o sinal já mora em `tipo`. */
  valor: number
  descricao: string
}

export type ConfiancaDuplicata = "exata" | "provavel"

export interface Duplicata {
  /** Posição na lista de entrada (`novos`). */
  indice: number
  confianca: ConfiancaDuplicata
  /** A data do lançamento que já estava no banco. */
  jaLancadoEm: Date
}

/**
 * Descrição comparável: minúsculas, sem acento, sem pontuação, sem espaço
 * repetido. "NETFLIX.COM  *ASSINATURA" e "netflix com assinatura" viram a
 * mesma coisa — o mesmo lançamento lido duas vezes pelo modelo raramente volta
 * com a pontuação idêntica.
 */
export function normalizarDescricao(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // marcas de acento separadas pelo NFD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

/** Centavos inteiros. Comparar float por igualdade erraria em 0.1 + 0.2. */
function centavos(v: number): number {
  return Math.round(Math.abs(v) * 100)
}

function balde(l: LancamentoComparavel): string {
  return `${chaveDia(l.data)}|${l.tipo}|${centavos(l.valor)}`
}

/**
 * @param existentes o que JÁ está confirmado no banco, no período do extrato
 * @param novos as linhas lidas do extrato, na ordem em que serão gravadas
 * @returns uma entrada por linha nova suspeita, ordenada por `indice`
 */
export function acharDuplicatas(
  existentes: LancamentoComparavel[],
  novos: LancamentoComparavel[]
): Duplicata[] {
  if (existentes.length === 0 || novos.length === 0) return []

  // Índice por dia/tipo/valor. A descrição normalizada entra pré-calculada:
  // normalizar dentro do laço de busca faria N×M chamadas de `normalize`.
  const pool = new Map<string, { data: Date; descricao: string }[]>()
  for (const e of existentes) {
    const k = balde(e)
    const linha = { data: e.data, descricao: normalizarDescricao(e.descricao) }
    const lista = pool.get(k)
    if (lista) lista.push(linha)
    else pool.set(k, [linha])
  }

  const achados: Duplicata[] = []
  const semDescricaoIgual: number[] = []

  // 1ª passada — descrição igual tem prioridade sobre descrição diferente.
  //
  // A ordem importa: se a linha A (descrição igual) e a linha B (descrição
  // diferente) disputam o mesmo lançamento existente, dar a B primeiro
  // rebaixaria A a "provavel" e deixaria a duplicata mais evidente marcada.
  novos.forEach((n, i) => {
    const lista = pool.get(balde(n))
    if (!lista || lista.length === 0) return
    const alvo = normalizarDescricao(n.descricao)
    const p = lista.findIndex((e) => e.descricao === alvo)
    if (p === -1) {
      semDescricaoIgual.push(i)
      return
    }
    const [consumida] = lista.splice(p, 1)
    achados.push({ indice: i, confianca: "exata", jaLancadoEm: consumida.data })
  })

  // 2ª passada — sobrou lançamento no mesmo dia, tipo e valor, com outro nome.
  for (const i of semDescricaoIgual) {
    const lista = pool.get(balde(novos[i]))
    if (!lista || lista.length === 0) continue
    const consumida = lista.shift()!
    achados.push({ indice: i, confianca: "provavel", jaLancadoEm: consumida.data })
  }

  return achados.sort((a, b) => a.indice - b.indice)
}
