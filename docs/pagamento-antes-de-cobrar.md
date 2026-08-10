# Antes de cobrar de alguém de verdade

O código de pagamento está no ar em **modo de teste** (`sk_test`). Nada foi
cobrado de ninguém. Esta lista é o que falta, e **quase tudo aqui é passo no
painel da Stripe ou na Vercel** — não tem como ser feito de dentro do código.

A ordem importa. Cada item explica o que quebra se for pulado.

---

## 1. Provar o caminho todo em modo de teste

Nenhuma bateria cobre isto, e é por isso que precisa ser à mão: exige cartão e um
evento chegando de fora do processo.

```bash
stripe listen --forward-to localhost:3000/api/pagamento/webhook
```

O comando imprime um `whsec_…` **diferente** do que está no `.env.local`. Use o
que ele imprimir enquanto estiver testando local, senão a assinatura não fecha e
o webhook responde 400 em tudo.

Com o `listen` rodando, em outra aba suba o app e:

1. Entre em `/premium` e clique em **Assinar**.
2. Pague com `4242 4242 4242 4242`, validade futura, CVC qualquer.
3. Confirme que `/premium/obrigado` sai do "confirmando" e vira "Pronto, é seu".
   Se ficar girando até o aviso de demora, o webhook **não** chegou — olhe a
   saída do `stripe listen`.
4. Confirme no `pnpm prisma studio` que a `Assinatura` está `ativa`, com
   `externalId` (`sub_…`) e `expiraEm` preenchidos.
   **`expiraEm` vazio é o defeito a caçar**: é dele que depende a tolerância de
   cartão recusado.
5. Cancele em `/premium` e confirme que a tela passa a dizer "o acesso vai até
   …" e que o status no banco **continua `ativa`** com `canceladoEm` marcado.
   Se virar `cancelada` na hora, alguém trocou a regra e o acesso de quem pagou
   o mês está sendo cortado.

Depois, os dois eventos que ninguém testa e que são os que dão prejuízo:

```bash
stripe trigger invoice.payment_failed
```

O status tem de virar `inadimplente` **sem perder o acesso**.

```bash
stripe trigger customer.subscription.deleted
```

Agora sim o acesso acaba.

## 2. Conferir o teto grátis com olho humano

`TETO_GRATIS_TOKENS` (`lib/pagamento/tokens.ts`) está em 120 mil por mês. Esse
número foi **derivado**, não medido: veio de traduzir "15 mensagens" para tokens
estimando 5 a 8 mil por turno. Depois de algumas conversas reais, olhe
`UsoMensalIA` e veja quanto uma conversa de verdade gasta. Se o gasto real for
metade disso, o teto está dando 30 conversas em vez de 15.

## 3. O endpoint no painel, na versão certa

Em **Developers → Webhooks**, criar o endpoint apontando para
`https://finlow-xi.vercel.app/api/pagamento/webhook` com os quatro eventos:
`checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`,
`customer.subscription.deleted`.

⚠️ **A versão da API do endpoint tem de ser `2026-07-29.dahlia`** — a mesma de
`VERSAO_API` em `lib/pagamento/stripe.ts`. Versão diferente entrega payload em
outro formato, e o modo de falhar é silencioso: dois campos que este código lê
(`parent.subscription_details.subscription` e `items.data[].current_period_end`)
mudaram de lugar entre versões. Foi exatamente esse o erro do documento de
especificação, três vezes.

## 4. As chaves na Vercel, sem misturar ambiente

| Variável | Production | Preview / Development |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_…` | `sk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_` do endpoint de produção | o de teste |
| `STRIPE_PRICE_ID` | preço do modo live | preço do modo teste |
| `NEXT_PUBLIC_APP_URL` | `https://finlow-xi.vercel.app` | a URL do preview |

**Nunca misturar.** Chave de produção com preço de teste falha na hora, o que é o
bom caso. O caso ruim é o inverso: um teste rodando com `sk_live_` **cobra
dinheiro real do cartão de alguém**.

✅ **O caso ruim passou a ser barrado por código** (`conferirAmbiente`, em
`lib/pagamento/stripe.ts`). Chave `sk_live_` fora de `VERCEL_ENV=production` —
ou apontando para localhost — lança antes de o cliente Stripe existir, então
nenhuma chamada chega a sair. `sk_test_` em produção continua permitido de
propósito: é o modo atual do projeto e chave de teste não move dinheiro. Os seis
casos estão em `scripts/testar-pagamento.mts`.

O `STRIPE_PRICE_ID` do modo live é **outro id**: preço criado no teste não existe
no live. Criar o produto e o preço de novo, em live, é passo obrigatório.

## 5. Ativar a conta para receber

A conta Stripe precisa estar com o cadastro completo (dados da empresa ou da
pessoa, conta bancária, validação de identidade) para sair do modo de teste. Isso
demora — não é passo de última hora.

## 6. O que este código NÃO faz, e você precisa saber

- **Não há portal do cliente.** Quem quiser trocar o cartão não tem tela para
  isso; hoje o caminho é cancelar e assinar de novo. Se cartão recusado começar a
  aparecer, o conserto certo é o Billing Portal da Stripe, não uma tela nossa
  pedindo número de cartão — **nunca** peça dado de cartão no nosso formulário.
- **Não há e-mail nenhum.** Nem recibo, nem aviso de cobrança recusada, nem de
  cancelamento. A Stripe pode mandar recibo automático (Settings → Emails); ligar
  isso é um clique e cobre o mínimo.
- **Não há reembolso pelo app.** É pelo painel da Stripe, à mão.
- **Não há prova de assinatura de ponta a ponta em produção.** Ver §1.

## 7. A pendência que não é técnica

`CLAUDE.md` registra que falta o texto jurídico da LGPD (base legal, finalidade,
retenção) e que isso precisa passar por advogado antes de escala ou captação.
**Cobrar dinheiro torna isso mais urgente, não menos**: passa a haver relação de
consumo, e com ela dever de informação, direito de arrependimento (CDC art. 49) e
uma política de cancelamento e reembolso escrita. Nada disso existe hoje.

Junto vem a pendência já anotada no documento de especificação sobre a situação
da fundadora como controladora — resolver antes de faturar, não depois.
