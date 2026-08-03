/**
 * Embaralho determinístico por semente (FNV-1a + xorshift).
 *
 * Vive em lib, e não dentro do TelaQuiz, por um motivo só: o teste de viés de
 * posição precisa rodar EXATAMENTE esta função contra os quizzes reais do
 * banco. Uma cópia no teste provaria a cópia, não o que a tela executa.
 *
 * Determinístico de propósito: a mesma pergunta mostra sempre a mesma ordem
 * para todo mundo — voltar de tela não rearruma as opções — e perguntas
 * diferentes mostram ordens diferentes, que é o que desfaz o vício de posição.
 */
export function embaralharPorSemente<T>(itens: T[], semente: string): T[] {
  let h = 2166136261
  for (let i = 0; i < semente.length; i++) {
    h ^= semente.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const arr = [...itens]
  for (let i = arr.length - 1; i > 0; i--) {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    const j = Math.abs(h) % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
