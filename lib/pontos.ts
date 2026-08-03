import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

/**
 * Pontos.
 *
 * A regra que sustenta tudo: crédito é um EVENTO, e o total do usuário é a
 * soma dos eventos. `User.pontos` é só um cache do total, para não somar a
 * tabela inteira a cada abertura do Perfil.
 *
 * POR QUE EVENTO E NÃO UM CONTADOR
 * Contador não sabe dizer se já contou. `pontos += 10` roda duas vezes se a
 * pessoa tocar duas vezes, se a rede repetir a chamada, ou se ela refizer um
 * módulo que já tinha concluído. Com evento, a segunda tentativa esbarra na
 * chave única e não faz nada — e dá para auditar de onde veio cada ponto.
 */

/** Motivos que creditam. Fechado de propósito: motivo novo passa por aqui e
 *  ganha um valor pensado, em vez de aparecer solto no meio de uma rota. */
export const PONTOS_POR_MOTIVO = {
  onboarding: 50,
  modulo_concluido: 30,
  quiz_acerto: 5,
  lancamento_confirmado: 2,
  streak_semana: 20,
} as const

export type MotivoPonto = keyof typeof PONTOS_POR_MOTIVO

/**
 * Sentinela para crédito sem referência.
 *
 * Existe porque no Postgres dois NULL não colidem em índice único. Se
 * "onboarding" gravasse refId nulo, refazer o onboarding creditaria de novo,
 * toda vez, sem erro nenhum. Uma string qualquer resolve, desde que não seja
 * nula.
 */
export const SEM_REF = "-"

/**
 * Pontos de um módulo concluído, proporcionais ao acerto nos quizzes.
 *
 * O motivo de existir: dava para concluir clicando em qualquer alternativa —
 * o fluxo deixa avançar com resposta errada de propósito, porque o feedback
 * ensina — e levar os 30 pontos inteiros. Concluir clicando aleatório valia o
 * mesmo que concluir lendo.
 *
 * A régua: módulo sem quiz vale cheio (não há o que errar); com quiz, um
 * piso de 10 por ter percorrido as telas, mais o resto proporcional ao
 * acerto. Errar tudo ainda paga o piso — a pessoa viu o conteúdo e o
 * feedback corrigiu, o que já é a aula acontecendo.
 */
export function pontosPorConclusao(acertos: number, totalQuiz: number): number {
  const cheio = PONTOS_POR_MOTIVO.modulo_concluido
  if (totalQuiz <= 0) return cheio
  const piso = 10
  const fracao = Math.max(0, Math.min(1, acertos / totalQuiz))
  return piso + Math.round((cheio - piso) * fracao)
}

/**
 * Teto por dia, para os motivos que a própria pessoa dispara à vontade.
 *
 * A chave única impede pagar DUAS VEZES pela mesma coisa. Ela não impede fazer
 * a mesma coisa mil vezes: cada lançamento novo é um refId novo e credita
 * legitimamente. Sem teto, confirmar um extrato de 400 linhas daria 800 pontos
 * contra 50 do onboarding inteiro, e o ranking viraria uma disputa de quem sobe
 * o extrato maior — que não é o comportamento que o produto quer premiar.
 *
 * Motivo fora desta lista não tem teto porque não dá para repetir: onboarding
 * acontece uma vez, módulo concluído já é barrado pelo refId.
 */
const TETO_DIARIO: Partial<Record<MotivoPonto, number>> = {
  lancamento_confirmado: 10,
  quiz_acerto: 20,
}

/**
 * Meia-noite de hoje em São Paulo, como instante real.
 *
 * O teto é diário, e "o dia" tem de ser o de quem usa o app. Na Vercel o
 * servidor roda em UTC: contar por dia UTC faria o teto reiniciar às 21h de
 * Brasília, no meio da noite de quem está lançando.
 *
 * O caminho tentador (`new Date(agora.toLocaleString(..., {timeZone}))`) está
 * errado e erra em silêncio: ele monta os componentes de São Paulo mas os
 * interpreta no fuso do servidor, e o resultado fica deslocado exatamente pela
 * diferença entre os dois — invisível em máquina brasileira, quebrado em
 * produção.
 *
 * O -03:00 é fixo: o Brasil acabou com o horário de verão em 2019.
 */
export function inicioDoDiaSP(agora: Date = new Date()): Date {
  // en-CA formata como "2026-08-01", que é o que a montagem abaixo espera.
  const dia = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora)
  return new Date(`${dia}T00:00:00-03:00`)
}

export interface Credito {
  creditado: boolean
  pontos: number
  /** Total do usuário depois desta chamada. */
  total: number
  /** Bateu o teto do dia para este motivo. */
  noTeto?: boolean
}

/**
 * Credita uma vez só.
 *
 * Repetir a mesma chamada é seguro e é o caso NORMAL, não o excepcional:
 * a tela pode reenviar, o pipeline pode ser retomado, a pessoa pode refazer o
 * módulo. Todos esses caminhos chegam aqui e devem terminar iguais.
 */
export async function creditar(
  userId: string,
  motivo: MotivoPonto,
  refId: string = SEM_REF,
  /**
   * Valor menor que o da tabela, para crédito proporcional (módulo concluído
   * com quiz errado). É TETO, não substituto: nunca credita acima da tabela,
   * então nenhum chamador consegue inflar pontos por aqui.
   */
  pontosCustom?: number
): Promise<Credito> {
  const tabela = PONTOS_POR_MOTIVO[motivo]
  const pontos =
    pontosCustom === undefined
      ? tabela
      : Math.max(0, Math.min(tabela, Math.round(pontosCustom)))

  const teto = TETO_DIARIO[motivo]
  if (teto !== undefined) {
    const hoje = await db.eventoPontuacao.count({
      where: { userId, motivo, criadoEm: { gte: inicioDoDiaSP() } },
    })
    if (hoje >= teto) {
      const u = await db.user.findUnique({ where: { id: userId }, select: { pontos: true } })
      return { creditado: false, pontos: 0, total: u?.pontos ?? 0, noTeto: true }
    }
  }

  try {
    // Evento e cache no mesmo lugar: se a linha do evento não entrar, o total
    // não pode subir. Fora de uma transação dá para creditar o cache e perder
    // o evento, e aí o total passa a mentir sem nada apontando o porquê.
    const total = await db.$transaction(async (tx) => {
      await tx.eventoPontuacao.create({ data: { userId, motivo, pontos, refId } })
      const u = await tx.user.update({
        where: { id: userId },
        data: { pontos: { increment: pontos } },
        select: { pontos: true },
      })
      return u.pontos
    })
    return { creditado: true, pontos, total }
  } catch (e) {
    // P2002 = a chave única recusou. É o mecanismo funcionando, não uma falha:
    // já foi creditado antes.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const u = await db.user.findUnique({ where: { id: userId }, select: { pontos: true } })
      return { creditado: false, pontos: 0, total: u?.pontos ?? 0 }
    }
    throw e
  }
}

/**
 * Recalcula o cache a partir dos eventos.
 *
 * O cache pode divergir se alguém apagar eventos na mão ou se uma transação
 * cair no meio. A verdade são os eventos, então a correção sempre vem daqui,
 * nunca o contrário.
 */
export async function recalcularTotal(userId: string): Promise<number> {
  const soma = await db.eventoPontuacao.aggregate({
    where: { userId },
    _sum: { pontos: true },
  })
  const total = soma._sum.pontos ?? 0
  await db.user.update({ where: { id: userId }, data: { pontos: total } })
  return total
}

export interface LinhaRanking {
  apelido: string
  pontos: number
  posicao: number
  /** Marca a linha de quem está olhando, para a tela destacá-la. */
  euMesmo: boolean
}

/**
 * O ranking.
 *
 * Devolve APELIDO E PONTOS. Nada mais sai daqui: nem e-mail, nem nome real,
 * nem id, nem qualquer número financeiro. Ranking é a única superfície do app
 * em que uma pessoa vê dado de outra, então o que ele não seleciona é tão
 * importante quanto o que ele seleciona.
 *
 * Quem não deu opt-in não aparece, inclusive para si mesmo: aparecer só para
 * você numa lista que os outros não veem é confuso e sugere que você está lá.
 */
export async function listarRanking(userId: string, limite = 50): Promise<LinhaRanking[]> {
  const linhas = await db.user.findMany({
    where: { rankingOptIn: true, apelido: { not: null } },
    select: { id: true, apelido: true, pontos: true },
    orderBy: [{ pontos: "desc" }, { criadoEm: "asc" }],
    take: limite,
  })

  return linhas.map((u, i) => ({
    apelido: u.apelido as string,
    pontos: u.pontos,
    posicao: i + 1,
    euMesmo: u.id === userId,
  }))
}

/** Um apelido serve se dá para exibir e não se passa por outra pessoa. */
export function apelidoValido(bruto: string): { ok: true; apelido: string } | { ok: false; erro: string } {
  const apelido = bruto.trim().replace(/\s+/g, " ")
  if (apelido.length < 2) return { ok: false, erro: "Escolhe pelo menos 2 letras." }
  if (apelido.length > 20) return { ok: false, erro: "No máximo 20 caracteres." }
  // Sem e-mail nem @: os dois identificam a pessoa fora do app, e o ranking é
  // visto por estranhos.
  if (/[@]/.test(apelido) || /\S+@\S+\.\S+/.test(apelido)) {
    return { ok: false, erro: "Sem e-mail nem @ no apelido." }
  }
  if (!/^[\p{L}\p{N} ._-]+$/u.test(apelido)) {
    return { ok: false, erro: "Usa letras, números, espaço, ponto, hífen ou _." }
  }
  return { ok: true, apelido }
}
