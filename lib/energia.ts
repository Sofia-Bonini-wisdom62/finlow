import { db } from "@/lib/db"
import { acessoPremium } from "@/lib/pagamento/acesso"

/**
 * Energia (G-04/05 do backlog de gamificação, protótipo de 13/08/2026).
 *
 * A régua: máximo 24, lição custa 4, acertos devolvem até 3, +1 por hora.
 * LIMITA SÓ O USUÁRIO GRÁTIS SEM VÍNCULO DE ESCOLA (decisão da fundadora,
 * 13/08) — premium por assinatura tem energia infinita (é alavanca do
 * Finlow+), e quem tem MembroEscola nunca vê o gate, mesmo com a escola
 * suspensa: a escola travar o contrato não pode travar o dever de casa.
 *
 * O DÉBITO É NO INÍCIO DA LIÇÃO, COM RECIBO NO BANCO. Cobrar na conclusão
 * inverteria o freio (a pessoa faria a lição e a recusa chegaria no fim), e
 * cobrar sem recibo cobraria de novo a cada recarregada de página. O recibo é
 * a própria linha de ProgressoLicao: o débito só acontece quando o `create`
 * dela funciona — refazer, retomar e revisar são grátis POR CONSTRUÇÃO, e
 * duas abas no mesmo segundo não cobram duas vezes (a segunda esbarra na
 * unique). Cobra QUALQUER lição, da trilha própria ou explorável — cobrar só
 * a própria abriria farm ilimitado pela biblioteca.
 */

export const ENERGIA_MAX = 24
export const CUSTO_LICAO = 4
export const DEVOLUCAO_MAX = 3
const HORA_MS = 3_600_000

/**
 * Regeneração preguiçosa, PURA: +1 por hora cheia desde a âncora, teto 24.
 *
 * A âncora só avança nas horas CONSUMIDAS — 1h59min depois de `desde`, a
 * pessoa ganha +1 e a âncora anda 1h, preservando os 59min para a próxima
 * leitura. Cheio, a âncora vira `agora`: não existe "hora acumulada" acima
 * do teto esperando ser gasta.
 */
export function regenerar(
  valor: number,
  desde: Date,
  agora: Date
): { valor: number; desde: Date } {
  const horas = Math.max(0, Math.floor((agora.getTime() - desde.getTime()) / HORA_MS))
  const novo = Math.min(ENERGIA_MAX, valor + horas)
  if (novo >= ENERGIA_MAX) return { valor: ENERGIA_MAX, desde: agora }
  return { valor: novo, desde: new Date(desde.getTime() + horas * HORA_MS) }
}

/** Minutos até o próximo +1, para a tela dizer "próxima recarga em N min". */
export function minutosParaProxima(desde: Date, agora: Date): number {
  const decorrido = (agora.getTime() - desde.getTime()) % HORA_MS
  return Math.max(1, Math.ceil((HORA_MS - decorrido) / 60_000))
}

/**
 * Devolução por acerto: proporcional, teto 3. Lição SEM quiz devolve o teto —
 * não havia o que errar, e a lição líquida custa 1.
 */
export function devolucao(acertos: number, totalQuiz: number): number {
  if (totalQuiz <= 0) return DEVOLUCAO_MAX
  return Math.min(DEVOLUCAO_MAX, Math.ceil((acertos / totalQuiz) * DEVOLUCAO_MAX))
}

/**
 * Quem NUNCA vê energia. Premium cobre assinatura E escola ativa; o segundo
 * ramo cobre vínculo escolar com escola fora de vigência.
 */
export async function isentoDeEnergia(userId: string): Promise<boolean> {
  const [acesso, membro] = await Promise.all([
    acessoPremium(userId),
    db.membroEscola.findUnique({ where: { userId }, select: { id: true } }),
  ])
  return acesso.premium || !!membro
}

export type ResultadoCobranca =
  | { ok: true; cobrado: boolean; energia: number | null }
  | { ok: false; energia: number; minutos: number }

/**
 * Cobra o início de uma lição, com o recibo descrito no cabeçalho.
 *
 * Retornos: `{ok, cobrado: false}` = lição já iniciada alguma vez (grátis);
 * `{ok, cobrado: true}` = 4 debitados agora; `{ok: false}` = sem energia — a
 * transação desfaz o recibo e nada fica gravado.
 */
export async function cobrarLicao(
  userId: string,
  moduloId: string,
  licao: number,
  agora = new Date()
): Promise<ResultadoCobranca> {
  try {
    return await db.$transaction(async (tx) => {
      const u = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { energia: true, energiaEm: true },
      })
      const r = regenerar(u.energia, u.energiaEm, agora)

      try {
        await tx.progressoLicao.create({
          data: { userId, moduloId, licao, telaAtual: 0 },
        })
      } catch (e) {
        // P2002 = a lição já foi iniciada um dia = já foi paga. A regeneração
        // calculada persiste mesmo assim — ler energia é o momento de acertar
        // o relógio.
        await tx.user.update({
          where: { id: userId },
          data: { energia: r.valor, energiaEm: r.desde },
        })
        return { ok: true as const, cobrado: false, energia: r.valor }
      }

      if (r.valor < CUSTO_LICAO) {
        // Sem energia: o throw desfaz o create — o recibo não pode existir
        // sem o débito, senão a próxima tentativa entraria de graça.
        throw new SemEnergia(r.valor, minutosParaProxima(r.desde, agora))
      }

      await tx.user.update({
        where: { id: userId },
        data: { energia: r.valor - CUSTO_LICAO, energiaEm: r.desde },
      })
      return { ok: true as const, cobrado: true, energia: r.valor - CUSTO_LICAO }
    })
  } catch (e) {
    if (e instanceof SemEnergia) {
      return { ok: false, energia: e.energia, minutos: e.minutos }
    }
    throw e
  }
}

class SemEnergia extends Error {
  constructor(
    public energia: number,
    public minutos: number
  ) {
    super("sem energia")
  }
}

/**
 * Devolve energia pelos acertos da lição recém-concluída. Chamada pelo POST
 * de progresso SÓ quando o crédito da lição aconteceu (primeira conclusão) e
 * a pessoa não é isenta — refazer não devolve, e isento não tem o que receber.
 */
export async function devolverPorAcertos(
  userId: string,
  acertos: number,
  totalQuiz: number,
  agora = new Date()
): Promise<number> {
  const dev = devolucao(acertos, totalQuiz)
  if (dev <= 0) return 0
  const u = await db.user.findUnique({
    where: { id: userId },
    select: { energia: true, energiaEm: true },
  })
  if (!u) return 0
  const r = regenerar(u.energia, u.energiaEm, agora)
  const novo = Math.min(ENERGIA_MAX, r.valor + dev)
  await db.user.update({
    where: { id: userId },
    data: { energia: novo, energiaEm: r.desde },
  })
  return novo - r.valor
}

/** O estado para as telas: null = isento (a UI mostra ∞ e nenhum custo). */
export async function estadoDaEnergia(
  userId: string,
  agora = new Date()
): Promise<{ atual: number; max: number } | null> {
  if (await isentoDeEnergia(userId)) return null
  const u = await db.user.findUnique({
    where: { id: userId },
    select: { energia: true, energiaEm: true },
  })
  if (!u) return null
  const r = regenerar(u.energia, u.energiaEm, agora)
  return { atual: r.valor, max: ENERGIA_MAX }
}
