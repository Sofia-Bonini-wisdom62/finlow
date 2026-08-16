import "server-only"
import type Stripe from "stripe"
import { getStripe } from "./stripe"

/**
 * O preço do plano, para quem AINDA NÃO assina.
 *
 * POR QUE ISTO PRECISOU EXISTIR. `Assinatura.valorCentavos` só nasce depois do
 * primeiro pagamento — é o que a Stripe cobrou daquela pessoa. Então a tela de
 * /premium sabia o valor exatamente para quem já não precisava dele, e mostrava
 * para quem não paga um botão "Assinar" com "cobrança mensal pelo cartão" e
 * nenhum número. Ninguém clica em assinar às cegas; quem clica, clica achando
 * que vai ver o preço na próxima tela, e isso é o desenho de um dark pattern
 * mesmo quando não é a intenção.
 *
 * A FONTE É A MESMA QUE COBRA. O valor sai do `STRIPE_PRICE_ID` — o mesmo id que
 * `app/api/pagamento/checkout/route.ts` põe no `line_items`. Isso não é detalhe
 * de implementação: é a única forma de o número da tela não poder divergir do
 * número da fatura. Um preço escrito à mão no código (ou numa variável
 * `NEXT_PUBLIC_PRECO`) começaria certo e ficaria errado no primeiro reajuste
 * feito no painel da Stripe — e o modo de falhar seria anunciar um preço e
 * cobrar outro, que é pior que não anunciar nenhum.
 *
 * NUNCA LANÇA. Devolve `null` quando não dá para afirmar um preço, e a tela tem
 * um estado próprio para isso. A alternativa — deixar a exceção subir — trocaria
 * "não consegui mostrar o valor" por "a tela de assinatura não abre", incluindo
 * para quem só queria ver a cota ou cancelar.
 */

export interface PrecoDoPlano {
  /** Na MENOR unidade da moeda (centavos, para BRL) — como a Stripe devolve. */
  valorCentavos: number
  /** ISO-4217 em maiúsculas, do jeito que o `Intl` espera. */
  moeda: string
  intervalo: "day" | "week" | "month" | "year"
  /** 1 = todo mês; 3 = a cada três meses. */
  intervaloContagem: number
}

/**
 * Stripe.Price → o que a tela mostra. Pura, e exportada por isso: dá para
 * exercitar todos os formatos de preço sem chave e sem rede.
 *
 * Devolve `null` em todo caso em que NÃO existe um número único e cobrável:
 *
 * - `unit_amount` nulo → preço em faixas (tiered) ou medido por uso. Existe um
 *   valor por faixa, não um valor; escolher um deles para estampar na tela seria
 *   inventar.
 * - `recurring` nulo → preço de cobrança única configurado num checkout que roda
 *   em `mode: "subscription"`. É erro de configuração, e o checkout já falha; o
 *   que não se pode é escrever "por mês" em cima de um preço que não tem mês.
 * - `active: false` → preço arquivado no painel. A Stripe recusa checkout com
 *   ele, então mostrá-lo seria anunciar o que não se pode vender.
 * - valor negativo ou não inteiro → não é preço da Stripe; é dado corrompido.
 * - intervalo desconhecido → o tipo do SDK admite valores futuros além dos
 *   quatro de hoje. Um preço sem periodicidade que se saiba dizer em português
 *   viraria um número solto na tela, e um número por período errado é pior que
 *   número nenhum — é justamente a meia-verdade que esta tela deixou de contar.
 */
const INTERVALOS = ["day", "week", "month", "year"] as const

export function lerPrecoDaStripe(preco: Stripe.Price | null | undefined): PrecoDoPlano | null {
  if (!preco) return null
  if (preco.active === false) return null
  if (!preco.recurring) return null

  const valor = preco.unit_amount
  if (typeof valor !== "number" || !Number.isInteger(valor) || valor < 0) return null

  if (!preco.currency) return null

  const intervalo = INTERVALOS.find((i) => i === preco.recurring!.interval)
  if (!intervalo) return null

  const contagem = preco.recurring.interval_count
  return {
    valorCentavos: valor,
    moeda: preco.currency.toUpperCase(),
    intervalo,
    intervaloContagem: Number.isInteger(contagem) && contagem! > 0 ? contagem! : 1,
  }
}

/**
 * Cache em memória.
 *
 * Preço muda no painel, raramente, e esta função é chamada em TODA abertura de
 * /premium por quem não assina. Sem cache, cada visita vira uma chamada de rede
 * na frente do carregamento da tela.
 *
 * A validade é curta de propósito: enquanto o cache não vence, a tela mostra o
 * preço ANTIGO depois de um reajuste no painel, e o checkout já cobra o novo.
 * Cinco minutos é o tamanho dessa janela.
 *
 * A FALHA TAMBÉM É GUARDADA, por menos tempo. Um `STRIPE_PRICE_ID` errado ou
 * apagado erra em toda chamada, e sem guardar nada seria uma ida à Stripe por
 * visita, para sempre. Trinta segundos limitam a insistência sem deixar o preço
 * escondido por muito tempo depois de a configuração ser corrigida.
 */
const VALIDADE_OK_MS = 5 * 60 * 1000
const VALIDADE_FALHA_MS = 30 * 1000

let cache: { valor: PrecoDoPlano | null; expiraEm: number } | null = null

/** Só para os testes: esvazia o cache entre casos. */
export function limparCacheDePreco(): void {
  cache = null
}

export async function precoDoPlano(agora = Date.now()): Promise<PrecoDoPlano | null> {
  if (cache && cache.expiraEm > agora) return cache.valor

  const guardar = (valor: PrecoDoPlano | null) => {
    cache = { valor, expiraEm: agora + (valor ? VALIDADE_OK_MS : VALIDADE_FALHA_MS) }
    return valor
  }

  const id = process.env.STRIPE_PRICE_ID
  if (!id) {
    // Não é console.error: máquina de desenvolvimento sem Stripe é o caso comum,
    // e um erro vermelho por visita treina todo mundo a ignorar o log.
    console.warn("[preco] STRIPE_PRICE_ID não configurada: /premium não vai mostrar o valor")
    return guardar(null)
  }

  try {
    const preco = lerPrecoDaStripe(await getStripe().prices.retrieve(id))
    if (!preco) {
      console.error(
        `[preco] STRIPE_PRICE_ID=${id} não é um preço recorrente, ativo e de valor único. ` +
          "a tela de assinatura fica sem o valor. Confira o preço no painel da Stripe."
      )
    }
    return guardar(preco)
  } catch (e) {
    console.error("[preco] não consegui ler o preço na Stripe:", (e as Error)?.message)
    return guardar(null)
  }
}
