import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import { getStripe } from "@/lib/pagamento/stripe"
import { temAcessoPremium } from "@/lib/pagamento/acesso"

export const dynamic = "force-dynamic"

/**
 * Abre o checkout da Stripe e devolve a URL para redirecionar.
 *
 * A ORDEM IMPORTA: `temAcessoPremium` ANTES do `upsert`.
 * Invertido, quem já paga e clica no botão de novo teria a própria assinatura
 * marcada como "pendente" no banco antes de a rota descobrir que não devia abrir
 * checkout nenhum — e o próximo `temAcessoPremium` diria que ela não é premium.
 * Um clique acidental cancelaria o acesso de quem está em dia.
 *
 * `client_reference_id` é o vínculo com o nosso usuário e é o que o webhook usa
 * no primeiro evento. Nunca casar por e-mail: a pessoa pode pagar com outro.
 */
export async function POST() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    // ANTES de escrever qualquer coisa. Ver o comentário acima.
    if (await temAcessoPremium(userId)) {
      return NextResponse.json(
        { error: "ja_premium", mensagem: "Sua assinatura já está ativa." },
        { status: 409 }
      )
    }

    const usuario = await db.user.findUnique({
      where: { id: userId },
      select: { email: true },
    })
    if (!usuario?.email) {
      return NextResponse.json({ error: "sem_email" }, { status: 400 })
    }

    const existente = await db.assinatura.findUnique({
      where: { userId },
      select: { clienteStripeId: true },
    })

    const base = process.env.NEXT_PUBLIC_APP_URL
    if (!base) {
      // Sem isto o checkout volta para uma URL inválida e a pessoa fica na
      // Stripe sem caminho de volta. Falhar aqui é melhor que descobrir depois
      // do pagamento.
      console.error("[checkout] NEXT_PUBLIC_APP_URL não configurada")
      return NextResponse.json({ error: "config_incompleta" }, { status: 500 })
    }

    const sessao = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      client_reference_id: userId,
      // Cliente que já existe é reaproveitado: criar um novo a cada tentativa
      // espalha a mesma pessoa por vários `cus_` e o histórico de cobrança
      // deixa de fazer sentido no painel.
      ...(existente?.clienteStripeId
        ? { customer: existente.clienteStripeId }
        : { customer_email: usuario.email }),
      success_url: `${base}/premium/obrigado?sessao={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/premium`,
      // A Stripe também recebe o vínculo na assinatura criada, para que eventos
      // posteriores tragam o userId mesmo sem consultar o nosso banco.
      subscription_data: { metadata: { userId } },
      allow_promotion_codes: true,
    })

    if (!sessao.url) {
      return NextResponse.json({ error: "checkout_sem_url" }, { status: 502 })
    }

    // "pendente" registra a intenção. Quem promove para "ativa" é SÓ o webhook:
    // confiar no retorno do navegador deixaria o acesso a um passo de quem sabe
    // digitar a URL de sucesso à mão.
    await db.assinatura.upsert({
      where: { userId },
      create: {
        userId,
        status: "pendente",
        provedor: "stripe",
        checkoutId: sessao.id,
        clienteStripeId: typeof sessao.customer === "string" ? sessao.customer : null,
      },
      update: {
        status: "pendente",
        checkoutId: sessao.id,
        ...(typeof sessao.customer === "string" ? { clienteStripeId: sessao.customer } : {}),
      },
    })

    return NextResponse.json({ url: sessao.url })
  } catch (e) {
    console.error("[checkout]", (e as Error)?.message)
    return NextResponse.json(
      { error: "falha_checkout", mensagem: "Não consegui abrir o pagamento agora. Tenta de novo." },
      { status: 502 }
    )
  }
}
