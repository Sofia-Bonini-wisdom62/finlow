# Resumo de função — Finlow

O que o produto **faz** hoje, função por função, e onde a **promessa** ainda
não encontrou a entrega.

Levantado direto do código em 05/08/2026 e revisto em 07/08/2026, na varredura
de resto do pré-pivô (ver a seção *Limpeza* de `docs/estado-do-produto.md`).
Complementa aquele arquivo: lá está a matriz promessa-do-plano × código; aqui,
o **comportamento** de cada peça.

---

## 1. Em uma frase

Assistente financeiro conversacional com IA para adultos brasileiros: a pessoa
sobe o extrato, conversa sobre os próprios números e recebe clareza — para onde
o dinheiro vai, o que está vazando, o que fazer primeiro. As trilhas de 2
minutos são retenção, não o produto.

Três personas do plano: **A** endividado em urgência · **B** desorganizado que
quer visão · **C** organizado que quer profundidade (atendido pelo Módulo
Avançado, atrás de flag).

---

## 2. Funções entregues

### 2.1 Superfície pública (sem login)

| Função | O que faz | Onde |
|---|---|---|
| Landing | Posicionamento, problema, recursos, como funciona, FAQ. Captura e-mail na lista de espera (`Waitlist`, e-mail único) | `app/page.tsx`, `/api/waitlist` |
| Landing B2B | Finlow como benefício de RH, sem preço público. Formulário abre conversa comercial: upsert por e-mail (mandar duas vezes atualiza, não duplica), 5 envios/h por IP, filtro de conteúdo impróprio | `app/empresas`, `/api/empresas/lead` |
| Link de indicação | `/r/{codigo}` → cadastro já vinculado ao indicador | `app/r/[codigo]` |
| Card público do vazamento | Página compartilhável do diagnóstico, **só se a pessoa pediu o link**, com imagem OpenGraph | `app/v/[token]` |

### 2.2 Conta

- Cadastro por e-mail + senha (bcrypt) e Google (NextAuth v5).
- Data de nascimento é informativa — **não há validação de idade**.
- Ajustes concentra: dados da conta, tema (sistema/claro/escuro), paleta
  (teal/terracota/indigo), convite de amigos, exportar dados, apagar conta.
- **Convite de escola** (11/08/2026, Finlow para Escolas): `/convite/{codigo}`
  planta cookie e leva ao cadastro (banner "você está entrando na Escola X")
  ou, logado, a `/convite/aceitar` — vincular conta existente é botão, nunca
  efeito colateral de abrir link. O resgate (`lib/convite-escola.ts`) é
  transacional com teto de usos atômico; aluno cai na turma, ganha
  `User.publico` do segmento e vira premium pela escola. Convite tem
  precedência sobre indicação quando os dois cookies existem. Papel nas rotas
  via `exigirPapel` (`lib/escola.ts`); a superfície do professor/adm é
  `app/escola/` — fora das abas do app do consumidor de propósito.

### 2.3 Onboarding — a primeira conversa

- Os **dois aceites** (memória do assistente e Painel) ficam **antes** da
  conversa, juntos e explicados. Dá para **pular** o onboarding inteiro.
- Conversa guiada pela IA registra objetivo, eixo de dificuldade/motivação e o
  momento em que a pessoa está; **infere** nível e situações a partir do que ela
  contou (não pergunta).
- Ao concluir: pipeline de 6 passos, 50 pontos creditados, leva inicial de aulas
  gerada e — se veio de convite — a indicação **ativa** (só aqui, nunca no
  cadastro).

### 2.4 Chat — o núcleo

Roda em Vertex AI (Gemini) via `lib/vertex.ts`, costurado em `lib/ia.ts`.

**O que o assistente enxerga:** o dash inteiro, mês a mês (`montarContexto`),
mais as memórias — se a memória estiver ligada — e a lista real de aulas do
banco (slug inventado viraria card com 404).

**O que ele devolve:**

- Resposta em texto, no tom do produto (sem jargão sem explicação, sem culpa).
- **Cards informativos:** `resumo`, `grafico`, `recomendacao` (aula), `lembrete`,
  `caminho` (atalho para uma tela do app com os toques à vista).
- **Propostas, nunca registros:** lançamento, teto de orçamento e memória voltam
  como proposta com valor e data à vista — só o toque da pessoa grava.
- Extrato pode ser processado **dentro do chat**.
- Histórico de conversas reabrível (título e mensagens cifrados). Propostas de
  ação **não** voltam ao reabrir — evita registrar o mesmo gasto duas vezes.
- Aula citada num card **entra na trilha** da pessoa (`origem: lacuna_chat`) e
  conta para o gatilho de progresso.
- Entrega única de novidades (ex.: o diagnóstico de vazamento aparece no chat
  uma vez, controlado por `entregueEm`).
- Sem consentimento do Painel o modelo **nem propõe** lançamento — melhor não
  oferecer do que oferecer um botão que dá 403.
- Trava de conteúdo impróprio na saída e em tudo que vira registro.

### 2.5 Extrato

1. **Leitura no navegador** (PDF via pdfjs, CSV, OFX) — o arquivo bruto **nunca
   sobe**. Limite de 10 MB.
2. Texto dividido por dia em pedaços e enviado à Vertex, em paralelo.
3. **Validação aritmética** pelos saldos diários do próprio extrato. Quando não
   fecha, o app propõe um ajuste explicado (saldo inicial ou compensação) em vez
   de esconder a divergência.
4. Recorte para os 3 meses mais recentes; categorização automática; detecção de
   recorrentes e do banco de origem.
5. Nada entra confirmado: `Transacao.confirmado` nasce `false`. A confirmação é
   em lote, com a pessoa vendo as linhas.
6. `ExtratoImport` guarda **só metadados** — status, período, total de linhas,
   erro de validação, tokens e modelo usados. Nunca o arquivo nem o texto.

### 2.6 Painel — controle (R8, consentimento próprio)

Lançamentos (criar/editar/apagar), contas fixas, categorias, resultado do
período, gasto médio por dia, distribuição de gastos, insight do perfil,
investimentos e seletor de mês. **Nenhuma rota de escrita aceita nada sem
`consentimentoPainelEm`.**

### 2.7 Análises

Indicadores do mês · evolução de patrimônio · rosca por categoria com detalhe ·
receitas × despesas · fluxo de caixa diário · tetos de orçamento cruzados com o
gasto real · projeção de patrimônio 1/5/10 anos (flag) · quatro métricas de
saúde (taxa de economia, controle orçamentário, reserva, consistência).

### 2.8 Perfil

Retrato de um minuto: rosca do último mês **com movimento** (não o corrente),
leituras em português, pontos e quatro portas para o resto do app. Os
percentuais moram em Análises de propósito.

### 2.9 Trilha

- **Corredor** (decisão da fundadora, 05/08/2026): cada módulo tem **4 lições**
  em sequência — Novo conceito!, História!, Revisão!, Aplicação! — e o módulo
  seguinte só abre quando o atual fecha todas. A regra mora em
  `lib/corredor.ts` e é conferida no **servidor**, não só no desenho.
  > Até essa data a trilha era *biblioteca posicionada*, sem trava nenhuma. A
  > reversão foi feita com a ressalva à vista e o custo aceito: quem chega com
  > dúvida no módulo 5 passa pelos quatro primeiros.
- **Nível e situação** (`divida_rotativa`, `sem_reserva`, `renda_variavel`,
  `financiamento`, `dependentes`) deixaram de dar acesso livre e passaram a
  definir a **ordem da fila** — que é personalizada por pessoa, montada pela IA.
- **43 módulos adultos** — 16 da T1 (reformada e reclassificada em
  `prisma/classificacao-t1.ts`) + 27 da T2 — de ~2 minutos, com exatamente 5
  tipos de tela: conceito, cenário, quiz, input, resultado. As lições são
  derivadas desses tipos em `lib/licoes.ts`, sem duplicar conteúdo: o quiz
  aparece na lição 1 (com o conceito à vista) e na 3 (sem), em ordens
  diferentes.
- **Fim de lição**: XP, tempo, acertos e o conceito que ficou. Antes o módulo
  terminava e a pessoa era despejada em `/perfil` sem saber de nada.
- **A tela é um caminho** (07/08/2026), não uma lista: blocos temáticos, nós com
  estado (concluído, atual, disponível, travado) e o drawer do módulo com
  pontos, nível e as lições. `components/trilha-visual/`, alimentado por
  `lib/trilha-visual.ts`.
- **Recomendados** é uma **leva de 4**: fica à vista até a última ser concluída,
  e só então outra entra. O chat **troca** uma aula da leva em vez de empilhar.
- **A busca saiu.** Ela existia quando a trilha era biblioteca; com o corredor,
  achar uma aula trancada e não poder abri-la é pior que não achar. Quem chega
  com dúvida específica vai ao Chat — e o botão "Preciso disso agora" do módulo
  travado leva para lá com o assunto escrito, porque o assistente consegue
  ADIANTAR a aula na trilha.
- Valores digitados nas telas de input **nunca persistem** — só sessão local.
- Números macro (Selic, IPCA, rotativo) entram por `{{variável}}` da tabela
  `Indicador`, com fonte e data de apuração. O texto da aula nunca crava o
  número.

### 2.10 Pontos, ranking e indicação

- Crédito é **evento**, não contador: chave única `(userId, motivo, refId)`
  torna impossível farmar. `User.pontos` é só cache.
- Tabela: onboarding 50 · **módulo concluído: o valor do próprio módulo**
  (`Modulo.pontos` — 30 iniciante, 40 intermediário, 50 avançado), proporcional
  ao acerto no quiz, com piso de 1/3 · **lição concluída 5** (proporcional,
  piso de 2) · acerto de quiz 5 · lançamento confirmado 2 · streak semanal 20 ·
  indicação ativada 50 (quem convidou) / 20 (quem entrou) · **ofensiva 20 a
  cada 7 dias seguidos** de uso.
  > Até 07/08/2026 todo módulo pagava 30, do mais simples ao mais difícil, e a
  > coluna existia sem ninguém ler. Os 67 módulos já gravados estavam com 50
  > por herança do default da coluna morta `xp` — 63 deles foram corrigidos
  > pelo nível (`scripts/pontos-por-nivel.mts`), a maioria para BAIXO.
  > Módulo concluído antes disso recebeu 30 e continua com 30: evento de
  > pontuação é imutável.
  > A lição vale pouco de propósito. Se cada uma pagasse como um módulo antigo,
  > o mesmo conteúdo passaria a valer quatro vezes mais e as contas anteriores
  > ao corredor ficariam para trás no ranking sem ter feito nada.
- **Ranking é opt-in** e mostra **apelido e pontos, nada mais**. É a única tela
  em que alguém vê dado de outra pessoa.
- Indicação: código base36 gerado sob demanda, uma indicação por pessoa
  garantida **pelo banco**, autoindicação barrada, e o ponto só cai quando o
  convidado **termina a primeira conversa**.

### 2.11 Diagnóstico de Vazamento

Quatro detectores rodando em ordem de certeza sobre os 6 meses mais recentes —
**encargo** (juros, IOF, multa, tarifa, anuidade) → **cobrança duplicada** →
**assinatura** (recorrência até R$ 400) → **categoria fora da curva**. Cada um
retira do pool o que reivindicou: **nenhum lançamento é contado duas vezes**,
para o número grande da página fechar.

Devolve total mensal e anual, mais uma narrativa da IA com fallback escrito.
Recalcula a cada visita. Entrega no chat uma única vez. Link público só por
opt-in.

### 2.12 Memória do assistente

Desligada por padrão. Registros **discretos** (não um blob) nos tipos situação,
plano, preferência e compromisso, com origem IA ou usuário. A tela `/memoria`
mostra tudo em texto com data, permite escrever à mão e apagar um a um ou tudo.

### 2.13 Premium — assinatura e limite grátis

**Uma tabela, um decisor.** `Assinatura` tem uma linha por usuário
(`userId @unique`) com quatro status: `pendente`, `ativa`, `inadimplente`,
`cancelada`. Quem interpreta esses status é **só** `lib/pagamento/acesso.ts`
(`decidirAcesso` é a regra pura; `temAcessoPremium` e `resumoDaAssinatura`
chamam ela). Nenhum outro arquivo decide quem é premium.

**Desde 11/08/2026 o premium tem DUAS portas** (Finlow para Escolas): a
assinatura própria OU o vínculo com escola ativa (`decidirAcessoEscolar`, no
mesmo arquivo — "ativa" sem vigência é piloto e libera; "suspensa" nega mesmo
com data futura). `acessoPremium` devolve o veredito com a `origem`
("assinatura" | "escola"), a assinatura vence quando as duas valem, e a tela
`/premium` usa isso para não oferecer checkout nem botão de cancelar a quem
tem acesso pela escola. A cota também distingue: assinante segue sem teto;
premium pela escola tem `TETO_ESCOLA_TOKENS` (300 mil/mês) — uma escola de
500 alunos com chat sem teto seria custo sem contrato que o cubra.

Duas leituras que não são óbvias:

- **`inadimplente` MANTÉM o acesso até `expiraEm`** — é a janela em que a Stripe
  ainda tenta recobrar. Cortar no primeiro erro perderia quem só teve o cartão
  recusado numa terça.
- **quem cancela fica `ativa` com `canceladoEm`**, não `cancelada`. O
  cancelamento é `cancel_at_period_end: true`: a pessoa pagou o mês e usa o mês.
  `cancelada` só é escrito quando a Stripe manda `customer.subscription.deleted`.

**Rotas.** `POST /api/pagamento/checkout` (verifica premium **antes** de gravar
`pendente`, `client_reference_id = userId`) · `POST /api/pagamento/webhook`
(corpo cru via `req.text()`, `constructEvent`, 4 eventos) · `POST
/api/pagamento/cancelar` (fim do período, **sem** tela de retenção com desconto)
· `GET /api/pagamento/assinatura` (estado já cozido, para as telas).

**Quem promove alguém a premium é o webhook**, nunca a tela. `/premium/obrigado`
só *pergunta* se já liberou (consulta repetida por ~21s, porque o
redirecionamento ganha a corrida contra o evento); escrever no banco ali daria o
produto a quem digitasse a URL.

**Limite grátis em TOKENS, não em mensagens** (decisão da fundadora). Mensagem
não mede nada — uma pergunta de três palavras e vinte turnos sobre o extrato
inteiro contam igual, e é o segundo que custa. `TETO_GRATIS_TOKENS` em
`lib/pagamento/tokens.ts`, cota mensal em `UsoMensalIA` (uma linha por pessoa
por mês, não por chamada). O mês é o de **São Paulo** (`mesSP`), pela mesma razão
que a ofensiva e o teto diário de pontos: em UTC a cota viraria às 21h do dia 31.
O guard roda **antes** da chamada ao Vertex e devolve **402**; a soma acontece
dentro de `responderIA` a partir do `userId` em `OpcoesResposta`, para que rota
nova não esqueça de contar. O onboarding **conta mas não é bloqueado**.

Apagar a conta **cancela a assinatura na Stripe antes** do delete, e falha aí
aborta o apagamento: `Assinatura` cascateia no nosso banco, mas o objeto na
Stripe continuaria cobrando um cartão de alguém que já não consegue entrar.

### 2.14 Operação

`/api/ops/metrics` devolve uso da Vertex nas últimas 24h (invocações, tokens,
caracteres, latências) e um bloco de produto (indicações totais / 30 dias /
ativadas, leads B2B). Cada bloco falha sozinho. Custo por chamada estimado em
BRL (`lib/custo.ts`), uso registrado por origem (`lib/uso-ia.ts`).

---

## 3. Regras de função que não mudam

1. **A IA propõe, a pessoa confirma.** Nenhum caminho grava dinheiro sem toque.
2. **Consentimento é separado.** Cadastro ≠ Painel ≠ memória ≠ ranking ≠ link
   público. Cada um tem o seu, e nenhum vem marcado.
3. **Campo financeiro é cifrado** (AES-256-GCM, chave por usuário+campo) e só se
   acessa pelos repos. Ler direto devolve `"v1.…"` e o número vira 0 em silêncio.
4. **Tabela nova nasce com `userId`, cascade e RLS** — `pnpm db:push` falha se
   alguma ficar aberta.
5. **O Finlow explica mecanismo e nunca indica produto financeiro.**
   Recomendação é de profissional autorizado pela CVM.

---

## 4. Promessa × entrega — onde ainda diverge

| # | Promessa | Onde está escrita | Estado real |
|---|---|---|---|
| 1 | "**Conecte suas contas.** Suas transações entram sozinhas, nada de digitar CSV" | Landing, passo 1 de *Como funciona* | **Ainda não existe.** Hoje é upload manual de extrato. Desde 05/08/2026 o conector Open Finance está no [backlog deste repo](backlog-produto.md) — deixou de ser "outra frente", mas continua não construído. É a divergência mais visível: é o primeiro passo do fluxo prometido na home. |
| 2 | "**Metas**, orçamentos e **alertas calmos, que avisam antes**" | Landing, *Recursos* | Orçamento existe (teto por categoria ou do mês). **Meta não existe** como objeto no schema. **Alerta que avisa antes não existe** — não há push, e-mail nem job; o insight só aparece quando a pessoa abre a tela. |
| 3 | "Enquanto você vive sua vida, a IA cruza cada transação" | Landing, *Insights automáticos* | Geração é **sob demanda**, na abertura da tela. Não há processamento em segundo plano. |
| 4 | "O Finlow já está disponível? **Ainda não.**" | FAQ da landing | O app logado está **inteiro no ar** — chat, extrato, painel, análises, trilha, diagnóstico. Landing e produto contam histórias diferentes hoje. |
| 5 | Login com Google | Botão na tela de login | Código pronto; **falta a chave OAuth na Vercel** para aparecer em produção. |
| 6 | "Baixa **TODOS** os dados do usuário" (portabilidade LGPD) | `/api/exportar`, regra 3 do README | Incompleto. Saem conta, categorias, contas fixas, transações, investimentos, progresso, indicações e diagnóstico. **Não saem: memórias, conversas do chat, orçamentos, respostas do onboarding, eventos de pontuação e insights.** O *delete* cobre tudo (cascade); a exportação não. |
| 7 | Política escrita de retenção e privacidade (R1) | `docs/estado-do-produto.md` | Engenharia pronta (consentimento separado, cifra, RLS, exclusão, exportação). **Falta o texto jurídico**: base legal, finalidade, prazo de retenção. |
| 8 | Revisão jurídica CVM/LGPD do conteúdo | `docs/estado-do-produto.md` | Pendente nos módulos que tocam investimento (M09, M10, M22–M25) e no M07 (bets). |
| 9 | Proteção de custo por abuso | — | Rate limit existe **só** na rota de lead B2B. **Chat e extrato — as chamadas que custam dinheiro — não têm limite.** |
| 11 | "userId sempre da sessão — nunca do client" | `lib/painel.ts`, regra de segurança do Painel | Verdade em todas as rotas de dinheiro, e era **mentira em três da trilha** até 07/08/2026: `/api/progresso` aceitava o header `x-user-id` (e criava a conta correspondente), `/api/trilha` e `/api/trilha/[moduloId]` aceitavam `?userId=`. Fechado — ver *Limpeza* em `estado-do-produto.md`. |
| 12 | Rota de operação só para quem opera | — | **`/api/ops/metrics` não tem autenticação.** Devolve id do projeto GCP, consumo de Vertex de 24h e as contagens de indicação e lead B2B para qualquer um que saiba a URL. |
| 10 | "Condições especiais para quem entrar cedo" / planos | FAQ da landing | Não há paywall, cobrança ou noção de plano pago no repo. Monetização é outra frente. |

**Nota sobre `docs/backlog-trilha-t2.md`:** a seção "verificação contra o
código" é de 02/08 e **já está vencida**. Os quatro pré-requisitos que ela
apontava como inexistentes foram entregues depois: `nivel` e `situacoes[]`
existem no `Modulo`, os perfis deixaram de rotear, `lacuna_chat` é escrito pelo
chat, e a T1 ganhou tags via `prisma/classificacao-t1.ts`.

---

## 5. Leitura rápida do risco

O que está entregue é coerente e defensável: o produto faz o que diz **dentro do
app**. As três divergências que importam estão todas **fora dele**:

- **A landing vende Open Finance** ("transações entram sozinhas") para um
  produto cujo caminho real é upload de extrato. Quem entra pela home espera uma
  coisa e encontra outra. O conector entrou no backlog em 05/08/2026, o que
  fecha a divergência no futuro — mas não fecha hoje, e a home segue prometendo
  no presente.
- **A exportação LGPD não exporta tudo** — e o que falta (conversas e memórias)
  é justamente o mais sensível.
- **Chat e extrato não têm rate limit.** Uma conta abusiva vira conta de Vertex.

Dentro do app sobrou uma só, e é de operação, não de usuário: **`/api/ops/metrics`
responde sem login**. As portas do pré-login que davam para escrever na conta
alheia foram fechadas em 07/08/2026.
