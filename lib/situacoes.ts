import type { TransacaoCalc, MetricasPerfil } from "@/lib/financas"

/**
 * O eixo que posiciona a biblioteca da Trilha.
 *
 * A aula é achada por NÍVEL e por SITUAÇÃO de quem chega, não pela ordem numa
 * fila. Os quatro perfis (lancador, guardador, impulsivo, sonhador) deixam de
 * rotear e viram contexto do chat.
 *
 * DUAS COISAS QUE O VOCABULÁRIO NÃO RESOLVE, E É PRECISO SABER
 *
 * 1. Ele é todo de DÉFICIT. Não existe situação "já guarda bem". As aulas de
 *    quem tem a vida em ordem não casam com nenhuma, e por isso `situacoes: []`
 *    numa aula significa "serve pra todo mundo", não "falta classificar".
 *
 * 2. Só três das cinco saem dos números. `financiamento` e `dependentes` não
 *    têm sinal no extrato: dá para ver uma parcela saindo todo mês, não para
 *    saber que é financiamento imobiliário; e filho não aparece em lançamento.
 *    Essas duas só chegam pela conversa. Fingir que dá para inferir produziria
 *    recomendação confiante e errada.
 */

export const SITUACOES = [
  "divida_rotativa",
  "sem_reserva",
  "renda_variavel",
  "financiamento",
  "dependentes",
  // As duas de baixo entraram com a trilha de Ensino Médio e seguem a mesma
  // regra de `financiamento` e `dependentes`: NÃO saem dos números. Nenhum
  // extrato diz que a pessoa está prestes a entrar na faculdade nem que aquele
  // é o primeiro salário dela — só a conversa conta isso. `derivarSituacoes`
  // não as produz de propósito; quem as escreve é `mesclarSituacoes`.
  "ensino_superior",
  "primeiro_emprego",
] as const
export type Situacao = (typeof SITUACOES)[number]

export const NIVEIS = ["iniciante", "intermediario", "avancado"] as const
export type Nivel = (typeof NIVEIS)[number]

export function ehSituacao(v: string): v is Situacao {
  return (SITUACOES as readonly string[]).includes(v)
}

/** Quantos meses de histórico bastam para falar em "renda que varia". Com dois
 *  meses, um bônus de fim de ano já pareceria irregularidade. */
const MESES_PARA_JULGAR_RENDA = 3

/** Coeficiente de variação acima disto é renda irregular. 0,25 significa que o
 *  desvio é um quarto da média — quem recebe salário fixo fica bem abaixo. */
const VARIACAO_RENDA = 0.25

/** Meses no vermelho que caracterizam dívida rolando, não um mês ruim. */
const MESES_NEGATIVOS_PARA_DIVIDA = 2

const CATEGORIAS_DE_JURO = ["taxas e juros", "taxas_juros", "juros", "encargos"]

/**
 * As situações que os NÚMEROS mostram.
 *
 * Devolve só o que é sustentado por dado. O que não dá para ver fica de fora e
 * é preenchido pela conversa — ver `mesclarSituacoes`.
 */
export function derivarSituacoes(
  calc: TransacaoCalc[],
  metricas: MetricasPerfil
): Situacao[] {
  const achadas = new Set<Situacao>()

  // --- sem reserva -------------------------------------------------------
  // Menos de 3 meses de despesa coberta. Sem histórico nenhum também conta:
  // quem não registrou nada não tem reserva provada, e a aula de reserva é a
  // certa para quem está começando.
  if (metricas.reservaEmergencia < 3) achadas.add("sem_reserva")

  // --- renda que varia ---------------------------------------------------
  const porMes = new Map<string, number>()
  for (const t of calc) {
    if (t.tipo !== "receita") continue
    const d = t.data instanceof Date ? t.data : new Date(t.data)
    const chave = `${d.getUTCFullYear()}-${d.getUTCMonth()}`
    porMes.set(chave, (porMes.get(chave) ?? 0) + Number(t.valor))
  }
  const rendas = [...porMes.values()]
  if (rendas.length >= MESES_PARA_JULGAR_RENDA) {
    const media = rendas.reduce((s, v) => s + v, 0) / rendas.length
    if (media > 0) {
      const variancia = rendas.reduce((s, v) => s + (v - media) ** 2, 0) / rendas.length
      if (Math.sqrt(variancia) / media > VARIACAO_RENDA) achadas.add("renda_variavel")
    }
  }

  // --- dívida rolando ----------------------------------------------------
  // Sinal direto: gasto numa categoria de juro. Sinal indireto: fechar o mês
  // no vermelho mais de uma vez. O indireto é PROXY e está documentado como
  // tal — gastar mais do que entra não é necessariamente rotativo, mas é o
  // melhor sinal disponível enquanto não houver categoria de juros no banco.
  const temJuro = calc.some(
    (t) =>
      t.tipo === "despesa" &&
      CATEGORIAS_DE_JURO.includes((t.categoria?.nome ?? "").toLowerCase())
  )
  if (temJuro) achadas.add("divida_rotativa")
  else {
    const saldoMes = new Map<string, number>()
    for (const t of calc) {
      const d = t.data instanceof Date ? t.data : new Date(t.data)
      const chave = `${d.getUTCFullYear()}-${d.getUTCMonth()}`
      const v = Number(t.valor) * (t.tipo === "receita" ? 1 : -1)
      saldoMes.set(chave, (saldoMes.get(chave) ?? 0) + v)
    }
    const negativos = [...saldoMes.values()].filter((v) => v < 0).length
    if (negativos >= MESES_NEGATIVOS_PARA_DIVIDA) achadas.add("divida_rotativa")
  }

  return [...achadas]
}

/**
 * Junta o que os números mostram com o que a pessoa contou.
 *
 * A conversa ganha de empate por um motivo: `financiamento` e `dependentes` só
 * existem porque alguém disse, e apagá-los num recálculo de extrato seria
 * esquecer o que a pessoa contou porque o extrato dela mudou.
 */
export function mesclarSituacoes(
  dosNumeros: Situacao[],
  daConversa: string[]
): Situacao[] {
  const juntas = new Set<Situacao>(dosNumeros)
  for (const s of daConversa) if (ehSituacao(s)) juntas.add(s)
  return [...juntas]
}

/**
 * Quanto uma aula combina com quem chega.
 *
 * Situação em comum é o que mais pesa: é a diferença entre "esta aula é sobre o
 * seu problema" e "esta aula é boa". Nível serve de desempate — aula avançada
 * para quem está começando desanima, e o contrário entedia.
 *
 * Aula sem situação nenhuma não fica de fora: entra com nota baixa, porque
 * serve pra todo mundo e não é sobre ninguém em particular.
 */
export function pontuarAula(
  aula: { nivel: string; situacoes: string[] },
  pessoa: { nivel: string; situacoes: Situacao[] }
): number {
  const emComum = aula.situacoes.filter((s) => (pessoa.situacoes as string[]).includes(s)).length
  const geral = aula.situacoes.length === 0

  let nota = emComum * 10
  if (geral) nota += 2
  if (aula.nivel === pessoa.nivel) nota += 3
  // Um degrau acima ainda serve; dois, não.
  else if (Math.abs(indiceNivel(aula.nivel) - indiceNivel(pessoa.nivel)) === 1) nota += 1

  return nota
}

function indiceNivel(n: string): number {
  const i = (NIVEIS as readonly string[]).indexOf(n)
  return i < 0 ? 0 : i
}
