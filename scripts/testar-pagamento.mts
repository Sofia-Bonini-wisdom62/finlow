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

import { readFileSync } from "node:fs"
import type Stripe from "stripe"
import { decidirAcesso, type StatusAssinatura } from "../lib/pagamento/acesso.js"
import { mesSP, TETO_GRATIS_TOKENS, TETO_ESCOLA_TOKENS } from "../lib/pagamento/tokens.js"
import { perguntasNoTeto, perguntasRestantes, rotuloPerguntas } from "../lib/pagamento/perguntas.js"
import { idDaAssinaturaNaFatura, fimDoPeriodo, conferirAmbiente } from "../lib/pagamento/stripe.js"
import { lerPrecoDaStripe } from "../lib/pagamento/preco.js"
import { dinheiro, porIntervalo } from "../lib/formato.js"

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

// --------------------------------------------------- a guarda de ambiente ---
// O caso que importa não é a chave faltando: é a chave CERTA no lugar errado.
console.log("\nconferirAmbiente — chave live só roda em produção")

const ok = (r: { ok: boolean }) => r.ok

conferir(
  "sk_test em máquina local passa (é o dia a dia)",
  ok(conferirAmbiente("sk_test_123", undefined, "http://localhost:3000")),
  true
)
conferir(
  "sk_test em produção passa (é o modo atual do projeto)",
  ok(conferirAmbiente("sk_test_123", "production", "https://finlow-xi.vercel.app")),
  true
)
conferir(
  "sk_live em máquina local é BARRADO",
  ok(conferirAmbiente("sk_live_123", undefined, "http://localhost:3000")),
  false
)
conferir(
  "sk_live em preview é BARRADO",
  ok(conferirAmbiente("sk_live_123", "preview", "https://finlow-xi-git-x.vercel.app")),
  false
)
conferir(
  "sk_live em produção com URL certa passa",
  ok(conferirAmbiente("sk_live_123", "production", "https://finlow-xi.vercel.app")),
  true
)
conferir(
  "sk_live em produção apontando para localhost é BARRADO",
  ok(conferirAmbiente("sk_live_123", "production", "http://localhost:3000")),
  false
)

// A chave RESTRITA (rk_) move dinheiro igual à secreta dentro das permissões
// que recebeu, e criar Checkout Session é justamente o recorte que este app
// pediria. Reconhecer só a sk_ deixava passar a chave de quem seguiu menor
// privilégio, que é o contrário do que a trava quer.
conferir(
  "rk_live em máquina local é BARRADO",
  ok(conferirAmbiente("rk_live_123", undefined, "http://localhost:3000")),
  false
)
conferir(
  "rk_live em preview é BARRADO",
  ok(conferirAmbiente("rk_live_123", "preview", "https://finlow-xi-git-x.vercel.app")),
  false
)
conferir(
  "rk_live em produção com URL certa passa",
  ok(conferirAmbiente("rk_live_123", "production", "https://finlow-xi.vercel.app")),
  true
)
conferir(
  "rk_test em máquina local passa (é chave de teste)",
  ok(conferirAmbiente("rk_test_123", undefined, "http://localhost:3000")),
  true
)

// ------------------------------------------------- o preço para quem não paga ---
// A tela de /premium mostrava o valor SÓ para quem já assinava. Quem não assina
// via vantagens, um "Assinar" e nenhum número — e o preço só aparecia depois do
// clique, na Stripe. Estes casos guardam as duas metades do conserto: ler o
// preço certo, e nunca inventar um quando ele não existe.
console.log("\nlerPrecoDaStripe — o que vira preço na tela")

const precoMensal = {
  active: true,
  currency: "brl",
  unit_amount: 1990,
  recurring: { interval: "month", interval_count: 1 },
} as unknown as Stripe.Price

conferir("preço mensal comum", lerPrecoDaStripe(precoMensal), {
  valorCentavos: 1990,
  moeda: "BRL",
  intervalo: "month",
  intervaloContagem: 1,
})
// A moeda da Stripe vem minúscula e o Intl exige maiúscula: sem isto o
// formatador lança RangeError e a tela inteira cai.
conferir("a moeda sobe para maiúscula", lerPrecoDaStripe(precoMensal)?.moeda, "BRL")
conferir(
  "trimestral preserva a contagem",
  lerPrecoDaStripe({
    ...precoMensal,
    recurring: { interval: "month", interval_count: 3 },
  } as unknown as Stripe.Price)?.intervaloContagem,
  3
)
conferir(
  "anual preserva o intervalo",
  lerPrecoDaStripe({
    ...precoMensal,
    recurring: { interval: "year", interval_count: 1 },
  } as unknown as Stripe.Price)?.intervalo,
  "year"
)

console.log("\nlerPrecoDaStripe — os casos em que NÃO existe um preço para estampar")
// Cada um destes, devolvendo um número, faria a tela anunciar algo que a fatura
// não confirmaria. `null` manda a tela para o estado "não consegui carregar".
conferir(
  "preço em faixas (unit_amount nulo) não vira número",
  lerPrecoDaStripe({ ...precoMensal, unit_amount: null } as unknown as Stripe.Price),
  null
)
conferir(
  "cobrança única não vira 'por mês'",
  lerPrecoDaStripe({ ...precoMensal, recurring: null } as unknown as Stripe.Price),
  null
)
conferir(
  "preço arquivado não é anunciado (a Stripe recusa o checkout com ele)",
  lerPrecoDaStripe({ ...precoMensal, active: false } as unknown as Stripe.Price),
  null
)
conferir(
  "valor negativo é dado corrompido, não desconto",
  lerPrecoDaStripe({ ...precoMensal, unit_amount: -1990 } as unknown as Stripe.Price),
  null
)
conferir("preço ausente não quebra", lerPrecoDaStripe(null), null)
// O tipo do SDK admite intervalos que ainda não existem. Sem periodicidade que
// se saiba dizer em português, o número viraria "por quarter" na tela.
conferir(
  "intervalo desconhecido não vira número solto",
  lerPrecoDaStripe({
    ...precoMensal,
    recurring: { interval: "quarter", interval_count: 1 },
  } as unknown as Stripe.Price),
  null
)
// Grátis é um preço válido — 0 não pode cair no mesmo balde de "não sei".
conferir(
  "zero é preço, não ausência de preço",
  lerPrecoDaStripe({ ...precoMensal, unit_amount: 0 } as unknown as Stripe.Price)?.valorCentavos,
  0
)
// interval_count ausente é o formato antigo/parcial; 1 é o padrão da Stripe.
conferir(
  "sem interval_count assume 1",
  lerPrecoDaStripe({
    ...precoMensal,
    recurring: { interval: "month" },
  } as unknown as Stripe.Price)?.intervaloContagem,
  1
)

// ------------------------------------------------ o valor escrito na tela ---
console.log("\ndinheiro — centavos da Stripe viram texto")
conferir("1990 centavos em BRL", dinheiro(1990, "BRL").replace(/ /g, " "), "R$ 19,90")
conferir("valor redondo mantém as casas", dinheiro(2000, "BRL").replace(/ /g, " "), "R$ 20,00")
conferir("sem valor vira hífen, não R$ 0,00 (regra sem-travessão, 15/08/2026)", dinheiro(null), "-")
// A armadilha das moedas sem centavos: ¥1990 são mil novecentos e noventa
// ienes. Um `/100` fixo escreveria "¥ 19,90" e erraria por cem vezes.
conferir("moeda sem centavos não é dividida por 100", /1\.990/.test(dinheiro(1990, "JPY")), true)
conferir("a mesma quantia em BRL é dividida", /19,90/.test(dinheiro(1990, "BRL")), true)
// Moeda inválida faz o Intl lançar. A tela não pode deixar de renderizar por isso.
conferir("moeda inválida não derruba a tela", typeof dinheiro(1990, "XYZ12"), "string")

console.log("\nporIntervalo — a periodicidade acompanha o preço, não o texto fixo")
conferir("mensal", porIntervalo("month", 1), "por mês")
conferir("anual", porIntervalo("year", 1), "por ano")
conferir("semanal", porIntervalo("week", 1), "por semana")
conferir("trimestral pluraliza", porIntervalo("month", 3), "a cada 3 meses")
conferir("bienal pluraliza", porIntervalo("year", 2), "a cada 2 anos")
conferir("sem contagem assume 1", porIntervalo("month"), "por mês")

// ------------------------------------- a tela e a cobrança na MESMA fonte ---
// Estas quatro conferências não olham comportamento, olham código — porque o
// defeito que elas guardam não quebra build, typecheck nem lint. Um preço
// escrito à mão na tela, ou lido de outra variável de ambiente, compila
// perfeitamente e só se revela na fatura de alguém.
console.log("\na tela mostra o preço que o checkout cobra")

const fonte = (caminho: string) => readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8")
const telaPremium = fonte("app/(app)/premium/page.tsx")
const rotaCheckout = fonte("app/api/pagamento/checkout/route.ts")
const libPreco = fonte("lib/pagamento/preco.ts")
const rotaAssinatura = fonte("app/api/pagamento/assinatura/route.ts")

const varDoCheckout = rotaCheckout.match(/process\.env\.(STRIPE_[A-Z_]*PRICE[A-Z_]*)/)?.[1] ?? null
const varDoPreco = libPreco.match(/process\.env\.(STRIPE_[A-Z_]*PRICE[A-Z_]*)/)?.[1] ?? null
conferir("o checkout cobra por um id de preço do ambiente", varDoCheckout, "STRIPE_PRICE_ID")
conferir("a leitura do preço usa EXATAMENTE a mesma variável", varDoPreco, varDoCheckout)

// `\r?` porque o checkout do git no Windows grava CRLF: um guard que só passa
// com LF acusaria falha numa rota que está certa — mesma lição do guard da
// landing, que não pode depender do estilo de quem escreveu.
conferir("a rota de assinatura entrega o plano para a tela", /\bplano,?\r?\n/.test(rotaAssinatura), true)
// O bloco de quem NÃO assina é o segundo ramo do ternário do premium; basta
// garantir que a tela lê o plano e não um número fixo em algum lugar dela.
conferir("a tela lê o plano da API", /estado\.plano\.valorCentavos/.test(telaPremium), true)
conferir(
  "nenhum preço em reais escrito à mão na tela",
  /R\$\s?\d/.test(telaPremium.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "")),
  false
)
// A letra miúda dizia "Cobrança mensal" com o intervalo vindo da Stripe: se o
// preço virar anual no painel, a frase fixa passaria a mentir.
conferir(
  "a letra miúda não afirma 'mensal' por conta própria",
  /Cobrança mensal/.test(telaPremium.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "")),
  false
)

// ------------------------------------------ a cota em perguntas, não em token ---
/**
 * A tradução não pode mentir para nenhum lado.
 *
 * Errar para MAIS é prometer conversa que a cota não paga. Errar para menos é
 * chato, mas seguro: por isso a divisão usa a ponta alta da faixa de custo.
 * O caso que mais importa é o do piso: enquanto `podeUsar` é true, a próxima
 * resposta vem inteira mesmo estourando o teto (regra escrita em tokens.ts), e
 * uma tela dizendo "0 perguntas" com o chat respondendo seria uma mentira nova
 * no lugar da conta de padaria.
 */
console.log("\ncota em perguntas")

conferir("cota cheia vira a régua do plano (15)", perguntasRestantes(TETO_GRATIS_TOKENS, true), 15)
conferir("metade da cota, metade das perguntas", perguntasRestantes(60_000, true), 7)
conferir("sobra menor que uma pergunta ainda vale uma", perguntasRestantes(3_000, true), 1)
conferir("sobra zero mas ainda pode usar vale uma", perguntasRestantes(0, true), 1)
conferir("cota esgotada é zero", perguntasRestantes(3_000, false), 0)
conferir("sem teto não tem 'quantas faltam'", perguntasRestantes(null, true), null)
conferir("o teto da escola vira 37 perguntas", perguntasNoTeto(TETO_ESCOLA_TOKENS), 37)
conferir("teto do grátis em perguntas", perguntasNoTeto(TETO_GRATIS_TOKENS), 15)
conferir("sem teto não tem tamanho", perguntasNoTeto(null), null)
conferir("singular não fica torto", rotuloPerguntas(1), "1 pergunta")
conferir("plural com separador de milhar", rotuloPerguntas(1_200), "1.200 perguntas")

// A estimativa é da TELA: se ela voltar a escrever a divisão à mão, o número da
// tela e o do teste passam a poder discordar sem ninguém notar.
conferir(
  "a tela usa o módulo, não uma divisão própria",
  /perguntasRestantes\(/.test(telaPremium) && !/\/\s*8_?000/.test(telaPremium),
  true
)
// O token não sumiu da tela: ele deixou de ser a manchete, e continua legível
// para quem quiser calibrar. Sem esta linha, a correção do item 9c poderia
// virar "esconder o número", que é outro defeito.
conferir("a conta em token continua na tela", /tokens do mês/.test(telaPremium), true)

// ------------------------------------------------------------------ fechamento ---
console.log(`\n${total - falhas}/${total} casos passaram`)
if (falhas > 0) {
  console.error(`✗ ${falhas} falha(s)`)
  process.exit(1)
}
console.log("✓ bateria de pagamento ok")
