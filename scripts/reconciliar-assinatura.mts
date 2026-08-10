/**
 * Reconcilia uma assinatura com a verdade da Stripe.
 *
 * PARA QUANDO O WEBHOOK NÃO CHEGOU
 * O pagamento acontece na Stripe; quem promove a linha local para "ativa" é o
 * webhook. Quando ele não chega — endpoint ainda não criado no painel, segredo
 * errado na Vercel, indisponibilidade — o dinheiro entrou e a pessoa não tem
 * acesso. Este script fecha essa distância SEM inventar dado: lê a sessão e a
 * assinatura na Stripe e aplica exatamente o que `aoConcluirCheckout` aplicaria.
 *
 * NÃO É PARA USO ROTINEIRO. O caminho normal é o webhook, e ele existe por um
 * motivo: é a única fonte que prova que o pagamento aconteecu. Se este script
 * começar a ser necessário toda semana, o defeito está na entrega do evento e é
 * lá que se mexe — o painel da Stripe reentrega evento com um clique (Resend),
 * e essa é a primeira coisa a tentar.
 *
 *   node --conditions react-server --import tsx scripts/reconciliar-assinatura.mts <email|userId>
 *   node --conditions react-server --import tsx scripts/reconciliar-assinatura.mts <email|userId> --aplicar
 *
 * Sem `--aplicar` ele só mostra o que faria. A flag existe porque o banco deste
 * projeto é o de produção.
 */
import { config } from "dotenv"
config({ path: ".env.local" }); config({ path: ".env" })

const { db } = await import("../lib/db.js")
const { getStripe, fimDoPeriodo } = await import("../lib/pagamento/stripe.js")

const alvo = process.argv[2]
const aplicar = process.argv.includes("--aplicar")

if (!alvo || alvo.startsWith("--")) {
  console.log("Informe o e-mail ou o userId de quem pagou.")
  console.log("  node --conditions react-server --import tsx scripts/reconciliar-assinatura.mts <email|userId> [--aplicar]")
  process.exit(1)
}

const usuario = await db.user.findFirst({
  where: { OR: [{ email: alvo }, { id: alvo }] },
  select: { id: true, email: true },
})
if (!usuario) {
  console.log(`✗ Nenhum usuário com e-mail ou id "${alvo}".`)
  await db.$disconnect()
  process.exit(1)
}

const local = await db.assinatura.findUnique({ where: { userId: usuario.id } })
if (!local) {
  console.log(`✗ ${usuario.email} não tem linha em Assinatura — nunca abriu checkout.`)
  await db.$disconnect()
  process.exit(1)
}

console.log(`usuário : ${usuario.email}  (${usuario.id})`)
console.log(`local   : status=${local.status}  externalId=${local.externalId ?? "—"}  expiraEm=${local.expiraEm?.toISOString() ?? "—"}`)

if (!local.checkoutId) {
  console.log("✗ A linha não tem checkoutId — não há sessão para consultar na Stripe.")
  await db.$disconnect()
  process.exit(1)
}

const stripe = getStripe()
const sessao = await stripe.checkout.sessions.retrieve(local.checkoutId)

console.log(
  `stripe  : status=${sessao.status}  payment_status=${sessao.payment_status}  ` +
    `subscription=${typeof sessao.subscription === "string" ? sessao.subscription : sessao.subscription?.id ?? "—"}`
)

/**
 * Só reconcilia o que a Stripe confirma como PAGO.
 *
 * É a guarda que separa "o webhook se perdeu" de "a pessoa abandonou o
 * checkout". Sem ela este script viraria uma porta para dar acesso premium a
 * quem abriu o pagamento e desistiu — e ele roda com a chave de produção.
 */
if (sessao.status !== "complete" || sessao.payment_status !== "paid") {
  console.log("\n✗ A Stripe NÃO confirma esta sessão como paga. Nada a reconciliar.")
  await db.$disconnect()
  process.exit(1)
}

const idAssinatura = typeof sessao.subscription === "string" ? sessao.subscription : sessao.subscription?.id
if (!idAssinatura) {
  console.log("\n✗ Sessão paga mas sem assinatura vinculada — caso fora do escopo deste script.")
  await db.$disconnect()
  process.exit(1)
}

// O vínculo tem de ser o mesmo que o webhook usaria. Divergência aqui significa
// que a sessão é de OUTRA pessoa, e reconciliar daria premium a quem não pagou.
if (sessao.client_reference_id && sessao.client_reference_id !== usuario.id) {
  console.log(
    `\n✗ A sessão pertence a outro usuário (client_reference_id=${sessao.client_reference_id}). Abortado.`
  )
  await db.$disconnect()
  process.exit(1)
}

const assinatura = await stripe.subscriptions.retrieve(idAssinatura)
const fim = fimDoPeriodo(assinatura)

const dados = {
  status: "ativa",
  externalId: idAssinatura,
  ...(typeof sessao.customer === "string" ? { clienteStripeId: sessao.customer } : {}),
  checkoutId: sessao.id,
  metodo: "cartao",
  valorCentavos: sessao.amount_total ?? undefined,
  proximaCobranca: fim,
  expiraEm: fim,
  canceladoEm: null,
}

console.log("\no que seria gravado (o mesmo que aoConcluirCheckout aplicaria):")
for (const [k, v] of Object.entries(dados)) {
  console.log(`  ${k.padEnd(16)} ${v instanceof Date ? v.toISOString() : JSON.stringify(v)}`)
}

if (!aplicar) {
  console.log("\n(simulação — rode com --aplicar para gravar)")
  console.log("Antes disso, tente o Resend do evento no painel da Stripe: é o caminho limpo.")
  await db.$disconnect()
  process.exit(0)
}

await db.assinatura.update({ where: { userId: usuario.id }, data: dados })
const depois = await db.assinatura.findUnique({ where: { userId: usuario.id } })
console.log(`\n✓ gravado. status=${depois?.status}  expiraEm=${depois?.expiraEm?.toISOString() ?? "—"}`)
await db.$disconnect()
