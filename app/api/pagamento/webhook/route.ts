import { NextRequest, NextResponse } from "next/server"
import type Stripe from "stripe"
import { db } from "@/lib/db"
import { getStripe, idDaAssinaturaNaFatura, fimDoPeriodo } from "@/lib/pagamento/stripe"

export const dynamic = "force-dynamic"

/**
 * Webhook da Stripe. É QUEM decide que alguém passou a ser premium — o retorno
 * do navegador não decide nada.
 *
 * 🔴 `req.text()`, NUNCA `req.json()`.
 * A assinatura HMAC é calculada sobre os BYTES exatos que a Stripe enviou.
 * `req.json()` faz parse e o corpo re-serializado não bate mais: `constructEvent`
 * passa a rejeitar tudo. E o modo como isso falha é cruel — em desenvolvimento,
 * com a CLI da Stripe, costuma passar; em produção quebra, e o sintoma é
 * "ninguém vira premium" sem um erro que aponte para cá.
 *
 * IDEMPOTÊNCIA: a Stripe REPETE eventos até receber 2xx, e pode entregar fora de
 * ordem. Todo handler aqui é `update` por chave (`externalId` ou `userId`), nunca
 * `increment` nem `create` cego — receber o mesmo evento duas vezes tem de dar no
 * mesmo resultado.
 *
 * Evento desconhecido responde 200. Responder erro faria a Stripe repetir para
 * sempre um evento que a gente nunca vai tratar, e o painel encheria de falha.
 */
export async function POST(req: NextRequest) {
  const assinaturaHeader = req.headers.get("stripe-signature")
  const segredo = process.env.STRIPE_WEBHOOK_SECRET

  if (!segredo) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET ausente")
    return NextResponse.json({ error: "config_incompleta" }, { status: 500 })
  }
  if (!assinaturaHeader) {
    return NextResponse.json({ error: "sem_assinatura" }, { status: 400 })
  }

  // O corpo CRU. Ver o comentário do topo.
  const corpo = await req.text()

  let evento: Stripe.Event
  try {
    evento = getStripe().webhooks.constructEvent(corpo, assinaturaHeader, segredo)
  } catch (e) {
    // 400 é o certo: pedido não autenticado não deve ser reentregue.
    console.error("[webhook] assinatura inválida:", (e as Error)?.message)
    return NextResponse.json({ error: "assinatura_invalida" }, { status: 400 })
  }

  try {
    switch (evento.type) {
      case "checkout.session.completed":
        await aoConcluirCheckout(evento.data.object)
        break
      case "invoice.paid":
        await aoPagarFatura(evento.data.object)
        break
      case "invoice.payment_failed":
        await aoFalharCobranca(evento.data.object)
        break
      case "customer.subscription.deleted":
        await aoEncerrarAssinatura(evento.data.object)
        break
      default:
        // Não é erro. Ver o comentário do topo.
        break
    }
    return NextResponse.json({ recebido: true })
  } catch (e) {
    // 500 pede reentrega, que é o que se quer quando a falha é nossa (banco
    // fora do ar, por exemplo): a Stripe tenta de novo e o estado se corrige.
    console.error(`[webhook] falha em ${evento.type}:`, (e as Error)?.message)
    return NextResponse.json({ error: "falha_ao_processar" }, { status: 500 })
  }
}

/**
 * Primeiro pagamento aprovado: é aqui que alguém vira premium.
 *
 * `client_reference_id` é o único vínculo confiável neste evento — é o userId que
 * a rota de checkout mandou. `metadata.userId` da assinatura serve de reserva.
 */
async function aoConcluirCheckout(sessao: Stripe.Checkout.Session) {
  const userId = sessao.client_reference_id
  const idAssinatura = typeof sessao.subscription === "string" ? sessao.subscription : sessao.subscription?.id

  if (!userId || !idAssinatura) {
    console.warn(`[webhook] checkout ${sessao.id} sem userId ou sem assinatura`)
    return
  }

  // Busca a assinatura para saber até quando o período pago vai. A sessão não
  // traz isso, e sem `expiraEm` a tolerância do inadimplente não tem janela.
  const assinatura = await getStripe().subscriptions.retrieve(idAssinatura)
  const fim = fimDoPeriodo(assinatura)

  await db.assinatura.upsert({
    where: { userId },
    create: {
      userId,
      status: "ativa",
      provedor: "stripe",
      externalId: idAssinatura,
      clienteStripeId: typeof sessao.customer === "string" ? sessao.customer : null,
      checkoutId: sessao.id,
      metodo: "cartao",
      valorCentavos: sessao.amount_total ?? null,
      proximaCobranca: fim,
      expiraEm: fim,
    },
    update: {
      status: "ativa",
      externalId: idAssinatura,
      ...(typeof sessao.customer === "string" ? { clienteStripeId: sessao.customer } : {}),
      checkoutId: sessao.id,
      metodo: "cartao",
      valorCentavos: sessao.amount_total ?? undefined,
      proximaCobranca: fim,
      expiraEm: fim,
      // Reassinar depois de cancelar tem de limpar a marca de saída, senão a
      // tela diria "sua assinatura termina em..." para quem acabou de voltar.
      canceladoEm: null,
    },
  })
}

/**
 * Renovação paga: empurra a data e tira do atraso.
 *
 * Também é o evento da PRIMEIRA fatura, e pode chegar antes do
 * `checkout.session.completed` — por isso não assume que a linha já existe com
 * `externalId`: se não achar, sai quieto e o outro evento resolve.
 */
async function aoPagarFatura(fatura: Stripe.Invoice) {
  const idAssinatura = idDaAssinaturaNaFatura(fatura)
  if (!idAssinatura) return // fatura avulsa, sem assinatura: não é nosso caso

  const assinatura = await getStripe().subscriptions.retrieve(idAssinatura)
  const fim = fimDoPeriodo(assinatura)

  const { count } = await db.assinatura.updateMany({
    where: { externalId: idAssinatura },
    data: {
      status: "ativa",
      proximaCobranca: fim,
      expiraEm: fim,
      valorCentavos: fatura.amount_paid ?? undefined,
    },
  })

  // Fora de ordem: a fatura chegou antes do checkout. O checkout grava o
  // externalId e a data, então não há o que corrigir aqui.
  if (count === 0) console.warn(`[webhook] invoice.paid sem assinatura local: ${idAssinatura}`)
}

/**
 * Cobrança recusada: vira "inadimplente" e MANTÉM o acesso até `expiraEm`.
 *
 * A data NÃO é tocada de propósito: ela é a janela que `temAcessoPremium`
 * respeita enquanto a Stripe tenta de novo. Sobrescrever com "agora" cortaria o
 * acesso no primeiro erro, que é exatamente o que a regra quer evitar.
 */
async function aoFalharCobranca(fatura: Stripe.Invoice) {
  const idAssinatura = idDaAssinaturaNaFatura(fatura)
  if (!idAssinatura) return

  const { count } = await db.assinatura.updateMany({
    where: { externalId: idAssinatura },
    data: { status: "inadimplente" },
  })
  if (count === 0) console.warn(`[webhook] payment_failed sem assinatura local: ${idAssinatura}`)
}

/**
 * A Stripe encerrou de fato — fim do período de quem cancelou, ou desistência
 * depois das tentativas de cobrança. Daqui em diante não há mais acesso.
 */
async function aoEncerrarAssinatura(assinatura: Stripe.Subscription) {
  const agora = new Date()
  const { count } = await db.assinatura.updateMany({
    where: { externalId: assinatura.id },
    data: {
      status: "cancelada",
      canceladoEm: agora,
      // `expiraEm` no passado deixa o estado coerente: nem "cancelada" nem uma
      // data futura poderiam ser lidas como acesso válido por engano.
      expiraEm: agora,
      proximaCobranca: null,
    },
  })
  if (count === 0) console.warn(`[webhook] subscription.deleted sem assinatura local: ${assinatura.id}`)
}
