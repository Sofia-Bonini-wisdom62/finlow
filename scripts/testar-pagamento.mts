/**
 * Bateria do pagamento: a regra de acesso, o mês da cota e os dois campos que a
 * Stripe mudou de lugar.
 *
 * ⚠️ PRECISA DE `--conditions react-server`:
 *
 *   node --conditions react-server --import tsx scripts/testar-pagamento.mts
 *
 * `lib/pagamento/*` importa `server-only`, que lança em qualquer import fora do
 * bundler do Next. A condição de exportação é o que o neutraliza. Sem a flag o
 * erro é "cannot be imported from a Client Component" num script de terminal,
 * que não ajuda ninguém.
 *
 * O QUE ESTA BATERIA NÃO COBRE, e por quê:
 * um checkout de verdade. Isso exige cartão e um webhook chegando de fora, e
 * `stripe listen` é passo de terminal, não de teste automático. O que dá para
 * garantir aqui é que a REGRA está certa — e a regra é onde estavam os erros.
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

import type Stripe from "stripe"
import { decidirAcesso, type StatusAssinatura } from "../lib/pagamento/acesso.js"
import { mesSP, TETO_GRATIS_TOKENS } from "../lib/pagamento/tokens.js"
import { idDaAssinaturaNaFatura, fimDoPeriodo } from "../lib/pagamento/stripe.js"

let falhas = 0
let total = 0

function conferir(nome: string, obtido: unknown, esperado: unknown) {
  total++
  const ok = JSON.stringify(obtido) === JSON.stringify(esperado)
  if (!ok) {
    falhas++
    console.log(`  ✗ ${nome}\n      esperado: ${JSON.stringify(esperado)}\n      obtido:   ${JSON.stringify(obtido)}`)
  } else {
    console.log(`  ✓ ${nome}`)
  }
}

const AGORA = new Date("2026-08-10T15:00:00-03:00")
const ONTEM = new Date("2026-08-09T15:00:00-03:00")
const AMANHA = new Date("2026-08-11T15:00:00-03:00")

// ------------------------------------------------------- a regra de acesso ---
console.log("\ndecidirAcesso — os quatro estados")
conferir("ativa libera", decidirAcesso("ativa", null, AGORA), true)
conferir("ativa libera mesmo sem expiraEm", decidirAcesso("ativa", null, AGORA), true)
conferir("pendente nega", decidirAcesso("pendente", AMANHA, AGORA), false)
conferir("cancelada nega", decidirAcesso("cancelada", AMANHA, AGORA), false)
conferir("sem assinatura nega", decidirAcesso(null, null, AGORA), false)
conferir("status desconhecido nega", decidirAcesso("cobrança" as StatusAssinatura, AMANHA, AGORA), false)

console.log("\ndecidirAcesso — a janela do inadimplente")
conferir("inadimplente com prazo futuro MANTÉM", decidirAcesso("inadimplente", AMANHA, AGORA), true)
conferir("inadimplente com prazo vencido nega", decidirAcesso("inadimplente", ONTEM, AGORA), false)
conferir("inadimplente sem prazo nega", decidirAcesso("inadimplente", null, AGORA), false)
// A borda exata: expiraEm IGUAL a agora já venceu. Se isto virar `>=`, quem
// vence à meia-noite ganha um instante de graça — inofensivo, mas o teste
// existe para a mudança ser deliberada e não acidental.
conferir("inadimplente no instante exato nega", decidirAcesso("inadimplente", AGORA, AGORA), false)

console.log("\ncancelada é o fim, ativa+canceladoEm não é")
// O caso que a spec confundia: quem pede cancelamento fica "ativa" até a Stripe
// encerrar. Se alguém trocar por "cancelada" no POST /cancelar, este teste cai.
conferir("quem pediu para sair e está no período pago mantém", decidirAcesso("ativa", AMANHA, AGORA), true)

// ------------------------------------------------------------ o mês da cota ---
console.log("\nmesSP — o mês é o de São Paulo, não o do servidor UTC")
conferir("meio do mês", mesSP(new Date("2026-08-10T12:00:00-03:00")), "2026-08")
// A armadilha: 22h de 31/08 em Brasília é 01/09 em UTC. Contar em UTC viraria a
// cota três horas antes e o gasto cairia no mês seguinte. Mesmo defeito que o
// teto diário de pontos e a ofensiva já tiveram.
conferir("22h do dia 31 ainda é agosto", mesSP(new Date("2026-08-31T22:00:00-03:00")), "2026-08")
conferir("o mesmo instante em UTC seria setembro", new Date("2026-08-31T22:00:00-03:00").toISOString().slice(0, 7), "2026-09")
conferir("00h30 do dia 1º já é setembro", mesSP(new Date("2026-09-01T00:30:00-03:00")), "2026-09")
conferir("31/12 às 22h ainda é dezembro", mesSP(new Date("2026-12-31T22:00:00-03:00")), "2026-12")

console.log("\no teto")
conferir("teto grátis é um número finito e positivo", TETO_GRATIS_TOKENS > 0 && Number.isFinite(TETO_GRATIS_TOKENS), true)

// ------------------------------------------- os campos que mudaram de lugar ---
// Estes dois testes existem por causa de um defeito real do documento de
// especificação: ele lia `invoice.subscription` e `subscription.current_period_end`,
// que saíram do topo dos objetos nas versões recentes da API. O código do doc
// leria `undefined` e o sintoma seria silencioso — renovação sem atualizar data,
// cartão recusado que nunca vira inadimplente.
console.log("\nidDaAssinaturaNaFatura — o campo saiu do topo do Invoice")
conferir(
  "caminho novo (parent.subscription_details)",
  idDaAssinaturaNaFatura({ parent: { subscription_details: { subscription: "sub_novo" } } } as unknown as Stripe.Invoice),
  "sub_novo"
)
conferir(
  "caminho novo com objeto expandido",
  idDaAssinaturaNaFatura({ parent: { subscription_details: { subscription: { id: "sub_obj" } } } } as unknown as Stripe.Invoice),
  "sub_obj"
)
conferir(
  "caminho ANTIGO ainda é aceito (evento de retentativa)",
  idDaAssinaturaNaFatura({ subscription: "sub_velho" } as unknown as Stripe.Invoice),
  "sub_velho"
)
conferir(
  "fatura avulsa devolve null em vez de undefined",
  idDaAssinaturaNaFatura({ parent: null } as unknown as Stripe.Invoice),
  null
)

console.log("\nfimDoPeriodo — current_period_end também mudou de lugar")
const epoch = 1789000000 // um instante qualquer, em segundos
conferir(
  "lê do item da assinatura",
  fimDoPeriodo({ items: { data: [{ current_period_end: epoch }] } } as unknown as Stripe.Subscription)?.getTime(),
  epoch * 1000
)
conferir(
  "com vários itens pega o MAIOR (o último dia pago)",
  fimDoPeriodo({
    items: { data: [{ current_period_end: epoch }, { current_period_end: epoch + 86400 }] },
  } as unknown as Stripe.Subscription)?.getTime(),
  (epoch + 86400) * 1000
)
conferir(
  "cai para o campo antigo se não houver itens",
  fimDoPeriodo({ items: { data: [] }, current_period_end: epoch } as unknown as Stripe.Subscription)?.getTime(),
  epoch * 1000
)
// Sem data nenhuma tem de ser null, NUNCA Invalid Date: `new Date(undefined * 1000)`
// é NaN, o Prisma recusa a gravação e o webhook quebra na renovação.
conferir(
  "sem data devolve null, não Invalid Date",
  fimDoPeriodo({ items: { data: [] } } as unknown as Stripe.Subscription),
  null
)
conferir(
  "assinatura sem items nem quebra",
  fimDoPeriodo({} as unknown as Stripe.Subscription),
  null
)

// ------------------------------------------------------------------ fechamento ---
console.log(`\n${total - falhas}/${total} casos passaram`)
if (falhas > 0) {
  console.error(`✗ ${falhas} falha(s)`)
  process.exit(1)
}
console.log("✓ bateria de pagamento ok")
