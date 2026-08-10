import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import { getStripe, fimDoPeriodo } from "@/lib/pagamento/stripe"

export const dynamic = "force-dynamic"

/**
 * Cancela a assinatura NO FIM DO PERÍODO PAGO.
 *
 * `cancel_at_period_end: true`, nunca cancelamento imediato: a pessoa pagou o
 * mês e usa o mês. Cancelar na hora tiraria acesso já comprado e a Stripe não
 * devolve o valor por isso — seria cobrar e não entregar.
 *
 * O status local FICA "ativa" e só `canceladoEm` é marcado. Quem escreve
 * "cancelada" é o `customer.subscription.deleted` que a Stripe manda quando o
 * período fecha de fato. Escrever "cancelada" aqui cortaria o acesso hoje, que é
 * o oposto do que `cancel_at_period_end` significa.
 *
 * SEM TELA DE RETENÇÃO COM DESCONTO (decisão da fundadora). Quem clicou em
 * cancelar quer cancelar; oferta na saída é fricção, não retenção.
 */
export async function POST() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const assinatura = await db.assinatura.findUnique({
      where: { userId },
      select: { externalId: true, status: true },
    })

    if (!assinatura?.externalId) {
      return NextResponse.json(
        { error: "sem_assinatura", mensagem: "Não encontrei uma assinatura ativa na sua conta." },
        { status: 404 }
      )
    }
    if (assinatura.status === "cancelada") {
      // Idempotente: clicar duas vezes não é erro para quem clicou.
      return NextResponse.json({ ok: true, jaCancelada: true })
    }

    const atualizada = await getStripe().subscriptions.update(assinatura.externalId, {
      cancel_at_period_end: true,
    })
    const fim = fimDoPeriodo(atualizada)

    await db.assinatura.update({
      where: { userId },
      data: {
        canceladoEm: new Date(),
        // A data confirmada pela Stripe, não uma calculada aqui: é ela que
        // manda no fim do período e é ela que a tela vai mostrar.
        ...(fim ? { expiraEm: fim, proximaCobranca: null } : {}),
      },
    })

    return NextResponse.json({ ok: true, acessoAte: fim })
  } catch (e) {
    console.error("[cancelar]", (e as Error)?.message)
    return NextResponse.json(
      { error: "falha_cancelamento", mensagem: "Não consegui cancelar agora. Tenta de novo." },
      { status: 502 }
    )
  }
}
