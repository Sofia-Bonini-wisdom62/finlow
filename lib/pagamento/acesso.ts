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
 * A REGRA ESCOLAR, sem banco — irmã de `decidirAcesso`, pelas mesmas razões.
 *
 * Membro de escola ativa (qualquer papel: aluno, professor, adm) conta como
 * premium — decisão da fundadora, 11/08/2026. Professor precisa do produto
 * inteiro para mediar; adm é quem avalia a compra.
 *
 * "ativa" sem `ativaAte` → sim. É o piloto sem prazo: a escola foi criada por
 *   script e ninguém definiu vigência ainda.
 * "ativa" com `ativaAte` → sim ATÉ a data. Borda igual à do inadimplente:
 *   `ativaAte` IGUAL a agora já venceu.
 * "suspensa" (ou qualquer outro valor) → não, mesmo com data futura — suspender
 *   é o botão de emergência e ele não espera o contrato vencer.
 */
export function decidirAcessoEscolar(
  status: string | null | undefined,
  ativaAte: Date | null | undefined,
  agora: Date
): boolean {
  if (status !== "ativa") return false
  return !ativaAte || ativaAte > agora
}

/** De onde vem o premium de alguém. `null` = não é premium. */
export type OrigemPremium = "assinatura" | "escola"

/**
 * O veredito completo: premium ou não, e POR QUAL PORTA.
 *
 * A assinatura vence a escola quando as duas valem — quem paga do próprio
 * bolso não pode ver a tela dizer que o acesso é da escola e "cancelar sem
 * medo": cancelar a assinatura dessa pessoa tem consequência real quando o
 * vínculo escolar acabar.
 *
 * Nunca lança, pela mesma razão de `temAcessoPremium`: falha de banco NEGA.
 */
export async function acessoPremium(
  userId: string,
  agora = new Date()
): Promise<{ premium: boolean; origem: OrigemPremium | null; escolaNome: string | null }> {
  try {
    const [a, m] = await Promise.all([
      db.assinatura.findUnique({
        where: { userId },
        select: { status: true, expiraEm: true },
      }),
      db.membroEscola.findUnique({
        where: { userId },
        select: { escola: { select: { nome: true, status: true, ativaAte: true } } },
      }),
    ])

    if (decidirAcesso(a?.status as StatusAssinatura | undefined, a?.expiraEm, agora)) {
      return { premium: true, origem: "assinatura", escolaNome: m?.escola.nome ?? null }
    }
    if (m && decidirAcessoEscolar(m.escola.status, m.escola.ativaAte, agora)) {
      return { premium: true, origem: "escola", escolaNome: m.escola.nome }
    }
    return { premium: false, origem: null, escolaNome: null }
  } catch (e) {
    console.error("[acesso] falha ao ler assinatura/escola:", (e as Error)?.message)
    return { premium: false, origem: null, escolaNome: null }
  }
}

/**
 * Premium agora? As regras estão em `decidirAcesso` e `decidirAcessoEscolar`;
 * aqui é só a leitura. Desde 11/08/2026 as duas portas contam: assinatura
 * própria OU vínculo com escola ativa (Finlow para Escolas).
 *
 * Nunca lança: falha de banco NEGA acesso em vez de derrubar a tela. Negar por
 * erro dá suporte; um `catch` que devolvesse `true` daria o produto de graça a
 * qualquer um capaz de fazer o banco tossir.
 */
export async function temAcessoPremium(userId: string, agora = new Date()): Promise<boolean> {
  return (await acessoPremium(userId, agora)).premium
}

/**
 * O estado para a tela: o mesmo veredito de `temAcessoPremium` mais o que a
 * pessoa precisa ver (quando renova, quanto custa, se já pediu para sair).
 *
 * Existe para que nenhuma tela precise do status cru — pedir o status é pedir
 * para alguém reinterpretar a regra.
 */
export async function resumoDaAssinatura(userId: string, agora = new Date()) {
  const [a, acesso] = await Promise.all([
    db.assinatura.findUnique({
      where: { userId },
      select: {
        status: true,
        valorCentavos: true,
        proximaCobranca: true,
        expiraEm: true,
        canceladoEm: true,
        externalId: true,
      },
    }),
    acessoPremium(userId, agora),
  ])

  const status = (a?.status ?? null) as StatusAssinatura | null
  const premiumPorAssinatura = decidirAcesso(status, a?.expiraEm, agora)

  return {
    premium: acesso.premium,
    status,
    /** De onde vem o premium: "assinatura" | "escola" | null. A tela usa isto
     *  para NÃO oferecer checkout a quem já tem acesso pela escola. */
    origem: acesso.origem,
    escolaNome: acesso.escolaNome,
    /** Pediu para sair e ainda está no período pago. */
    saindoNoFimDoPeriodo: status === "ativa" && !!a?.canceladoEm,
    /** Cobrança falhou e a janela de tentativa ainda está aberta. */
    emAtraso: status === "inadimplente" && premiumPorAssinatura,
    valorCentavos: a?.valorCentavos ?? null,
    proximaCobranca: a?.proximaCobranca ?? null,
    expiraEm: a?.expiraEm ?? null,
    temAssinaturaNaStripe: !!a?.externalId,
  }
}
