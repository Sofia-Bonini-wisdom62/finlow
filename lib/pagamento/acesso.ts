import "server-only"
import { db } from "@/lib/db"

/**
 * O ÚNICO lugar do código que decide se alguém é premium.
 *
 * NÃO DUPLIQUE ESTA LÓGICA. Nem "só um if rápido" numa rota, nem um
 * `status === "ativa"` num componente. A regra tem três casos e dois deles são
 * contraintuitivos (abaixo); no dia em que ela mudar, mudar em um lugar e
 * esquecer o outro significa ou dar de graça ou cobrar de quem já pagou.
 *
 * Quem precisa do estado para MOSTRAR na tela usa `resumoDaAssinatura`, que sai
 * daqui e chama a mesma função — em vez de reler o status e reinterpretar.
 */

/** Os quatro estados possíveis. O banco guarda string; aqui é que tem sentido. */
export type StatusAssinatura = "pendente" | "ativa" | "inadimplente" | "cancelada"

export interface Assinatura {
  status: StatusAssinatura
  externalId: string | null
  valorCentavos: number | null
  proximaCobranca: Date | null
  expiraEm: Date | null
  canceladoEm: Date | null
}

/**
 * A REGRA, sem banco. É a única implementação dela.
 *
 * Separada de `temAcessoPremium` para poder ser testada com todos os estados e
 * todas as bordas de data sem inventar usuário no banco — e para que
 * `resumoDaAssinatura` chegue ao mesmo veredito por construção, não por duas
 * cópias que concordam por enquanto.
 *
 * "ativa" → sim. INCLUSIVE com `canceladoEm` preenchido: quem pediu
 *   cancelamento pagou o mês inteiro e usa até o fim dele. `canceladoEm` marca
 *   o pedido, não o fim do acesso — o fim vem do `customer.subscription.deleted`
 *   que a Stripe manda quando o período fecha.
 *
 * "inadimplente" → sim ATÉ `expiraEm`. É a janela em que a Stripe ainda tenta
 *   recobrar. Cortar no primeiro erro perde quem só teve o cartão recusado numa
 *   terça, e a pessoa descobre o problema perdendo acesso em vez de num e-mail.
 *   Sem `expiraEm` não há janela para respeitar: nega.
 *
 * "cancelada" → não. Este status só é escrito quando a Stripe já encerrou de
 *   fato, então não há período pago sobrando para honrar.
 *
 * "pendente" → não. Checkout aberto e não concluído é isso: não concluído.
 *
 * Sem assinatura (`null`) → não.
 */
export function decidirAcesso(
  status: StatusAssinatura | null | undefined,
  expiraEm: Date | null | undefined,
  agora: Date
): boolean {
  if (status === "ativa") return true
  if (status === "inadimplente") return !!expiraEm && expiraEm > agora
  return false
}

/**
 * Premium agora? A regra está em `decidirAcesso`; aqui é só a leitura.
 *
 * Nunca lança: falha de banco NEGA acesso em vez de derrubar a tela. Negar por
 * erro dá suporte; um `catch` que devolvesse `true` daria o produto de graça a
 * qualquer um capaz de fazer o banco tossir.
 */
export async function temAcessoPremium(userId: string, agora = new Date()): Promise<boolean> {
  try {
    const a = await db.assinatura.findUnique({
      where: { userId },
      select: { status: true, expiraEm: true },
    })
    return decidirAcesso(a?.status as StatusAssinatura | undefined, a?.expiraEm, agora)
  } catch (e) {
    console.error("[acesso] falha ao ler assinatura:", (e as Error)?.message)
    return false
  }
}

/**
 * O estado para a tela: o mesmo veredito de `temAcessoPremium` mais o que a
 * pessoa precisa ver (quando renova, quanto custa, se já pediu para sair).
 *
 * Existe para que nenhuma tela precise do status cru — pedir o status é pedir
 * para alguém reinterpretar a regra.
 */
export async function resumoDaAssinatura(userId: string, agora = new Date()) {
  const a = await db.assinatura.findUnique({
    where: { userId },
    select: {
      status: true,
      valorCentavos: true,
      proximaCobranca: true,
      expiraEm: true,
      canceladoEm: true,
      externalId: true,
    },
  })

  const status = (a?.status ?? null) as StatusAssinatura | null
  const premium = decidirAcesso(status, a?.expiraEm, agora)

  return {
    premium,
    status,
    /** Pediu para sair e ainda está no período pago. */
    saindoNoFimDoPeriodo: status === "ativa" && !!a?.canceladoEm,
    /** Cobrança falhou e a janela de tentativa ainda está aberta. */
    emAtraso: status === "inadimplente" && premium,
    valorCentavos: a?.valorCentavos ?? null,
    proximaCobranca: a?.proximaCobranca ?? null,
    expiraEm: a?.expiraEm ?? null,
    temAssinaturaNaStripe: !!a?.externalId,
  }
}
