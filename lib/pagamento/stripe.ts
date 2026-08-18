import "server-only"
import Stripe from "stripe"

/**
 * Cliente Stripe. `server-only`: a chave secreta movimenta dinheiro em nome da
 * conta, e um import acidental num componente de cliente vira ERRO DE BUILD em
 * vez de uma chave `undefined` e um bug sem explicação.
 *
 * ⚠️ SCRIPT QUE IMPORTAR ESTE ARQUIVO PRECISA DE `--conditions react-server`:
 *
 *   node --conditions react-server --import tsx scripts/testar-pagamento.mts
 *
 * O pacote `server-only` lança em qualquer import; quem o neutraliza é a
 * condição de exportação `react-server`, que o bundler do Next aplica e o Node
 * puro não. Sem a flag o erro que aparece é "cannot be imported from a Client
 * Component" dentro de um script de terminal, que não ajuda ninguém.
 *
 * A VERSÃO FIXADA DIVERGE DA SPEC, E ISSO É DELIBERADO.
 * O documento manda fixar "2026-04-22.dahlia". O SDK instalado (stripe 22.4.0)
 * é gerado para "2026-07-29.dahlia" — três meses depois —, e nesse intervalo a
 * Stripe MOVEU um campo que o webhook usa: `invoice.subscription` saiu do topo
 * do Invoice e virou `invoice.parent.subscription_details.subscription`.
 *
 * Fixar a versão antiga com este SDK produz o pior dos dois mundos: os tipos
 * descrevem um formato e os payloads chegam noutro. O código compilaria contra
 * a forma nova e receberia a antiga — e o sintoma seria silencioso, porque as
 * duas rotas afetadas (`invoice.paid` e `invoice.payment_failed`) só fazem
 * `break` quando não encontram o id. Renovação não atualizaria data, cartão
 * recusado não viraria inadimplente, e ninguém veria erro nenhum.
 *
 * Então a versão fixada é a do SDK. O motivo que a spec dá para fixar — "um
 * upgrade silencioso no painel pode mudar o formato de um payload que o webhook
 * espera" — continua valendo e é justamente o que sustenta esta escolha.
 *
 * ⚠️ O endpoint do webhook no painel da Stripe precisa estar na MESMA versão.
 * Está no checklist de go-live do documento, e é ação no painel, não no código.
 */
export const VERSAO_API = "2026-07-29.dahlia" as const

/** Faltou `STRIPE_SECRET_KEY`. Erro próprio para a rota poder distinguir. */
export class StripeNaoConfigurada extends Error {
  constructor() {
    super("STRIPE_SECRET_KEY não configurada")
    this.name = "StripeNaoConfigurada"
  }
}

/** Chave de produção fora de produção. Não é falta de config: é config perigosa. */
export class StripeAmbienteErrado extends Error {
  constructor(motivo: string) {
    super(motivo)
    this.name = "StripeAmbienteErrado"
  }
}

/**
 * A chave live só pode rodar em produção de verdade.
 *
 * O documento de go-live manda "nunca misturar ambiente" e explica o porquê: o
 * caso bom é chave live com preço de teste, que falha na hora; o caso ruim é o
 * inverso — um TESTE rodando com `sk_live_` cobra dinheiro real do cartão de
 * alguém. Até aqui isso dependia só de ninguém errar a variável na Vercel.
 *
 * A checagem usa `VERCEL_ENV`, não a URL: é o sinal da própria plataforma
 * ("production" | "preview" | "development") e não depende de adivinhar se um
 * `*.vercel.app` com hash no meio é preview. Ausente significa máquina local,
 * que é justamente onde a chave live não pode estar.
 *
 * O QUE ELA NÃO BARRA, DE PROPÓSITO: `sk_test_` em produção. É o modo atual do
 * projeto — o app está no ar em teste, sem cobrar de ninguém —, e bloquear isso
 * derrubaria o que está funcionando hoje para prevenir um risco que não existe:
 * chave de teste não move dinheiro.
 *
 * Pura para poder ser testada sem mexer em `process.env`.
 */
export function conferirAmbiente(
  chave: string,
  vercelEnv: string | undefined,
  appUrl: string | undefined
): { ok: true } | { ok: false; motivo: string } {
  // sk_live_ e rk_live_ movimentam dinheiro igual. A restrita (rk_) é o que
  // alguém cria justamente ao seguir menor privilégio, e criar Checkout Session
  // é a permissão que este app pediria: reconhecer só a secreta deixaria passar
  // exatamente a chave de quem foi mais cuidadoso.
  if (!/^(sk|rk)_live_/.test(chave)) return { ok: true }

  const ambiente = vercelEnv ?? "local"
  if (ambiente !== "production") {
    return {
      ok: false,
      motivo:
        `STRIPE_SECRET_KEY é chave live mas o ambiente é "${ambiente}". ` +
        "Chave de produção fora de produção cobra cartão de verdade num teste. " +
        "Use sk_test_ aqui, e deixe a live só em Production na Vercel.",
    }
  }

  // Chave live com URL de retorno local: a pessoa paga e volta para lugar
  // nenhum. Sintoma diferente do de cima, mesma origem — variável trocada.
  if (appUrl && /localhost|127\.0\.0\.1/.test(appUrl)) {
    return {
      ok: false,
      motivo:
        `STRIPE_SECRET_KEY é chave live mas NEXT_PUBLIC_APP_URL aponta para ${appUrl}. ` +
        "O checkout cobraria de verdade e devolveria a pessoa para uma URL que não existe.",
    }
  }

  return { ok: true }
}

let cliente: Stripe | null = null

/**
 * O cliente, criado no primeiro uso.
 *
 * PREGUIÇOSO DE PROPÓSITO, como o `getVertex()`. Um `new Stripe(...)` no corpo
 * do módulo lança no momento do IMPORT quando a chave não está no ambiente — e
 * aí o estrago é maior que o problema: quem importa este arquivo para outra
 * coisa (a rota de apagar conta, uma bateria de teste) morre sem ter pedido nada
 * da Stripe, e a pilha aponta para o import, não para a causa. Assim a falha
 * acontece onde a chave é de fato necessária.
 *
 * Guardado numa variável porque criar um cliente por chamada joga fora o pool de
 * conexões HTTP que o SDK mantém.
 */
export function getStripe(): Stripe {
  if (cliente) return cliente
  const chave = process.env.STRIPE_SECRET_KEY
  if (!chave) throw new StripeNaoConfigurada()

  // Antes de criar o cliente, não depois: o objetivo é que a chave live nunca
  // chegue a fazer uma chamada fora de produção.
  const ambiente = conferirAmbiente(chave, process.env.VERCEL_ENV, process.env.NEXT_PUBLIC_APP_URL)
  if (!ambiente.ok) {
    console.error("[stripe]", ambiente.motivo)
    throw new StripeAmbienteErrado(ambiente.motivo)
  }

  cliente = new Stripe(chave, { apiVersion: VERSAO_API })
  return cliente
}

/**
 * O id da assinatura dentro de uma fatura.
 *
 * Existe porque o caminho é aninhado e aparece em dois eventos: ler à mão nos
 * dois convida a errar em um só, e o erro é invisível. Também aceita o formato
 * ANTIGO (campo no topo) para o caso de uma fatura emitida antes da migração
 * de versão chegar por retentativa.
 */
export function idDaAssinaturaNaFatura(fatura: Stripe.Invoice): string | null {
  const detalhes = fatura.parent?.subscription_details?.subscription
  if (detalhes) return typeof detalhes === "string" ? detalhes : detalhes.id

  const legado = (fatura as unknown as { subscription?: string | { id: string } }).subscription
  if (legado) return typeof legado === "string" ? legado : legado.id

  return null
}

/**
 * O fim do período pago de uma assinatura, como Date.
 *
 * SEGUNDA MUDANÇA DE LUGAR, MESMA FAMÍLIA DA PRIMEIRA.
 * `current_period_end` também saiu do topo do Subscription e passou para cada
 * item (`items.data[].current_period_end`). No SDK instalado, o que sobrou com
 * esse nome na raiz é só parâmetro de filtro do `list` — ler `sub.current_period_end`
 * devolve `undefined`, e `new Date(undefined * 1000)` é Invalid Date, que o
 * Prisma recusa. O sintoma seria o webhook quebrando na renovação, ou pior:
 * `expiraEm` nulo para sempre, e aí a janela de tolerância do inadimplente
 * nunca abre e o cartão recusado numa terça corta o acesso na hora.
 *
 * Pega o MAIOR entre os itens. Numa assinatura de um preço só existe um item;
 * com vários, o acesso tem de valer até o último dia que a pessoa pagou.
 */
export function fimDoPeriodo(assinatura: Stripe.Subscription): Date | null {
  const fins = (assinatura.items?.data ?? [])
    .map((i) => i.current_period_end)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n))

  if (fins.length === 0) {
    // Formato antigo, caso um evento de antes da migração chegue por retentativa.
    const legado = (assinatura as unknown as { current_period_end?: number }).current_period_end
    if (typeof legado === "number" && Number.isFinite(legado)) return new Date(legado * 1000)
    return null
  }
  return new Date(Math.max(...fins) * 1000)
}
