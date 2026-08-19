# Resumo de função — Finlow

O que o produto **faz** hoje, função por função, e onde a **promessa** ainda
não encontrou a entrega.

Levantado direto do código em 05/08/2026 e revisto em 17/08/2026, na varredura
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
| Landing | Posicionamento, problema, recursos, como funciona, FAQ. **Porta de entrada:** `Entrar` (`/login`) e `Criar conta` (`/cadastro`) no cabeçalho, no hero e no rodapé. Captura e-mail de quem prefere só acompanhar (`Waitlist`, e-mail único) — não é mais lista de espera, porque o cadastro é aberto | `app/page.tsx`, `components/landing/*`, `/api/waitlist`, `scripts/testar-landing.mts` (cobre também `/login` e `/cadastro`, o outro lado da porta) |
| Landing B2B | Finlow como benefício de RH, sem preço público. Formulário abre conversa comercial: upsert por e-mail (mandar duas vezes atualiza, não duplica), 5 envios/h por IP, filtro de conteúdo impróprio | `app/empresas`, `/api/empresas/lead` |
| Link de indicação | `/r/{codigo}` → cadastro já vinculado ao indicador | `app/r/[codigo]` |
| Card público do vazamento | Página compartilhável do diagnóstico, **só se a pessoa pediu o link**, com imagem OpenGraph | `app/v/[token]` |

### 2.2 Conta

- Cadastro por e-mail + senha (bcrypt) e Google (NextAuth v5).
- **A tela de cadastro fala a língua de quem ainda não entrou** (18/08/2026,
  item 4 da avaliação de UX): o subtítulo descrevia a conta como "seu perfil e
  seu progresso na trilha", e "trilha" só significa alguma coisa depois de
  entrar. Passou a descrever o que a conta guarda no vocabulário da home
  (painel, metas, conversas com a IA), e o rótulo do apelido deixou de dizer
  "na liga". Obrigatórios continuam sendo quatro: nome, e-mail, senha e data de
  nascimento; celular e apelido são opcionais. Guardado por
  `scripts/testar-landing.mts`, que agora cobre as duas telas de porta.
- Data de nascimento é informativa — **não há validação de idade**. O porquê
  fica na tela, embaixo do campo ("adequar o conteúdo à sua idade, e garantir
  que menores nunca vejam anúncio").
- Ajustes concentra: dados da conta, cor de destaque (Dourado padrão,
  Terracota, Lilás, Verde-água — só o acento muda dentro do navy; o seletor
  claro/escuro saiu em 14/08/2026, o tema Fin tem uma cara só), convite de
  amigos, exportar dados, apagar conta.
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

- Resposta em texto, no tom do produto (sem jargão sem explicação, sem culpa),
  **aparecendo enquanto é escrita** (17/08/2026). A rota responde em SSE quando a
  tela pede (`stream: true`), e `lib/resposta-parcial.ts` lê o campo `texto` do
  JSON que ainda está chegando sem adivinhar nada — escape cortado, meio emoji e
  campo `texto` de card ficam de fora. Card, lançamento e teto continuam saindo
  **só no fim**, validados como sempre: proposta pela metade seria proposta
  errada. O texto validado do fecho substitui o que foi mostrado em pedaços, e a
  trava de conteúdo roda ANTES de cada pedaço sair.
- **Cards informativos:** `resumo`, `grafico`, `recomendacao` (aula), `lembrete`,
  `caminho` (atalho para uma tela do app com os toques à vista).
- **Propostas, nunca registros:** lançamento, teto de orçamento e memória voltam
  como proposta com valor e data à vista — só o toque da pessoa grava.
- Extrato pode ser processado **dentro do chat**, pelo clipe ou **arrastando o
  arquivo para cima da conversa** (17/08/2026 — o campo de escrever já convidava
  a soltar o arquivo ali, e não havia handler: o navegador abria o arquivo numa
  aba e a conversa ia embora).
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
  ADIANTAR a aula na trilha. O botão que fecha esse mini-diálogo diz o que o
  toque faz, não o que a resposta vai ser: "Pedir pro assistente", com "Abre o
  chat com essa pergunta pronta" embaixo (19/08/2026, item 7 da avaliação de
  UX). Antes dizia "Enviar para a IA reordenar", e um "não dá" do assistente
  fazia dele um botão de mentira. Guardado por `scripts/testar-copy.mts`, que
  só exige o rótulo honesto **enquanto** o toque for navegação para o chat.
- Valores digitados nas telas de input **nunca persistem** — só sessão local.
- Números macro (Selic, IPCA, rotativo) entram por `{{variável}}` da tabela
  `Indicador`, com fonte e data de apuração. O texto da aula nunca crava o
  número.
- **A trilha é POR PESSOA desde 11/08/2026** (Finlow para Escolas):
  `publicoDoUsuario()` lê `User.publico` e todos os call sites de
  `filtroDeModulo` passam o público por parâmetro. Aluno de escola vê a
  trilha do segmento da turma em **corredor por currículo** — a sequência é a
  ordem pedagógica dos blocos (`Modulo.ordem`), sem leva de IA
  (`garantirLevaInicial` é pulado, e o "trocar aula" do chat é no-op por
  construção). A biblioteca dele agrupa o resto como "Outras trilhas",
  incluindo a adulta. O peso 1/4 virou **relativo**: cada pessoa paga cheio na
  própria trilha e 1/4 fora dela (`ajustarPorPublico`, testado em
  `scripts/testar-pontos.mts`).

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
- **O rank da SALA (11/08/2026, Finlow para Escolas) tem régua própria**: quem
  liga é o professor, por turma (`Turma.rankAtivo` + escopo sala/ano/escola) —
  é dinâmica de sala de aula, não opt-in individual. O freio do aluno é o
  apelido: sem apelido, fora da lista dos colegas. Mesma superfície mínima
  (apelido+pontos, `rankingEscolar` em `lib/pontos.ts`), independente do
  ranking global. Pendência LGPD de menores registrada no backlog.
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

### 2.13 Personalidade do assistente

Cinco tons em `/personalidade` — Equilibrado (padrão), Direto ao ponto,
Acolhedor, Explicador, Incentivador — cada um com a **mesma frase** escrita
daquele jeito, para a escolha não ser entre adjetivos. Mais um campo livre de
200 caracteres, cifrado, que a pessoa usa para dizer como quer ser atendida.

Vale no chat e no onboarding refeito. **Tom muda como ele fala, nunca o que é
verdade**: a cláusula que preserva os números, o "não sei", o não julgar gasto,
o não recomendar ativo e o formato da resposta acompanha todos os tons. O campo
livre entra no prompt como preferência declarada e explicitamente **não
confiável** — pedido de mudar número ou ignorar regra é para ser ignorado.

### 2.14 Premium — assinatura e limite grátis

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

### 2.15 Finlow para Escolas (11/08/2026)

A escola é uma **camada de vínculo e leitura** por cima do produto: nenhuma
tabela de conteúdo ou progresso mudou de dono. As peças, na ordem do fluxo:

- **Escola nasce pela operação**, nunca por signup: tela em `/ops/escolas` ou
  `scripts/criar-escola.mts` (simulação por default), os dois chamando
  `criarEscolaComAdm` (`lib/ops-escola.ts`). Segue sem UI de signup B2B e sem
  cobrança B2B neste repo. Detalhe da superfície em §2.17.
- **Papéis** ("adm" | "professor" | "aluno") moram em `MembroEscola` (uma
  escola por conta, `@unique`); guard de rota é `exigirPapel`
  (`lib/escola.ts`), lido do banco a cada request, nada no JWT.
- **Convite com código multiuso** (`lib/convite-escola.ts`): expiração + teto
  de usos + revogação num `updateMany` atômico; resgate transacional cria
  vínculo, turma e `User.publico`. Cookie próprio, precedência sobre a
  indicação.
- **Aluno = premium pela escola** (`decidirAcessoEscolar`,
  `lib/pagamento/acesso.ts`) com teto de cota próprio (300 mil tokens/mês).
- **Trilha do aluno é o currículo do segmento** em corredor sem IA;
  **concessão** (`lib/escola-acesso.ts`) deixa o professor liberar bloco a
  bloco (EF) ou aula a aula (EM) — sem concessão, tudo aberto.
- **Competência reduz** o que o professor cria e concede
  (`segmentosDoProfessor`); `Modulo.habilidades` persiste os códigos BCB.
- **Rank da sala** com régua própria (§2.10) e **desempenho**
  (`lib/escola-desempenho.ts`): turma e aluno para o professor, visão por
  turma para o adm — nome real nessas telas, apelido entre colegas. O
  denominador é sempre o segmento: aula adulta explorada não entra na conta
  da escola.
- Superfície em `app/escola/` (fora das abas do consumidor); telas do aluno
  são as do app normal.

### 2.16 O jogo — Redesign Fin (13/08/2026)

O miolo gamificado (trilha, player, resultado, liga, perfil do jogador,
loja) tem identidade própria — navy + dourado + Nunito + o mascote **Fin** —
escopada na classe `.tema-fin` (globals.css), que reaponta os `--finlow-*`
sem nenhum componente saber. Sempre navy, nos dois modos.

- **Economia por XP (decisão da fundadora, 15/08/2026)**: tudo desagua numa
  corrente só. Lição, missão e baú pagam XP; o XP alimenta o ranking e é a
  ÚNICA origem de moeda (conversão na loja, `lib/conversao.ts` — débito de
  pontos e crédito de moeda na MESMA transação, pareados pelo refId);
  a moeda compra poção e cosmético. Converter DESCONTA do XP de propósito:
  ranking e nível caem junto, gastar é escolha com preço.
- **Coins**: `EventoCoins` é o espelho de `EventoPontuacao` (unique
  userId+motivo+refId; `User.coins` cache na mesma transação) e também é
  ESTADO: cosmético possuído é linha do ledger. Os motivos `licao`, `bau` e
  `missao` viraram LEGADO (eram crédito na era das moedas; as linhas antigas
  seguem lidas como estado). Coins nunca compram vantagem de ranking.
- **Energia** (`lib/energia.ts`): máx 24, lição custa 4, +1/hora, acertos
  devolvem até 3. Limita SÓ usuário grátis sem vínculo de escola. Débito no
  GET da lição com RECIBO (o create de `ProgressoLicao`): refazer, retomar e
  recarregar são grátis por construção.
- **Combo** atravessa lições (`User.comboAtual`); o servidor recalcula
  contra o gabarito e paga `combo_bonus` (motivo novo com teto — nunca infla
  os existentes). Poção ×2 idem: `pocao_bonus` é um segundo crédito.
- **Missões** (`lib/missoes.ts`): 3/dia, progresso DERIVADO de
  `ProgressoLicao` do dia SP — o único estado é o resgate, hoje no ledger de
  PONTOS com o dia no refId (renova à meia-noite sem zerar nada); o de coins
  é consultado como legado da virada.
- **Baú** (`lib/bau.ts`): fecha bloco escolar ou leva adulta; paga XP;
  reconfere completude no servidor e o "já aberto" olha os DOIS ledgers.
  Lacuna registrada: EM não tem bloco nem leva.
- **Segunda chance no player** (15/08/2026): pergunta errada volta ao fim da
  MESMA lição (`CardFlow`, fila de revanche client-side). A resposta da
  revanche vive num mapa separado que nunca viaja pro servidor: nota e XP
  são sempre da primeira tentativa.
- **Nível e conquistas**: funções puras de leitura (`lib/nivel.ts`,
  `lib/conquistas.ts`) — nada a dessincronizar.
- Superfícies: `/trilha` (mapa com unidades coloridas, baú, pop-up diário,
  intro), `/trilha/[moduloId]` (player com Fin), `/trilha/loja`, `/ranking`
  (Liga — mecânica intacta). O perfil do jogador foi UNIFICADO no `/perfil`
  em 15/08/2026 (missões, conquistas e recorde moram lá; `/trilha/perfil` é
  redirect). Rotas de escrita em `/api/jogo/*`. Bateria:
  `scripts/testar-jogo.mts` (react-server).

### 2.17 Operação (`/ops`, 18/08/2026)

A **terceira superfície** do app, acima de qualquer escola. As três não são
abas uma da outra: `/(app)` é o produto, `/escola` é uma escola, `/ops` é
quem opera o Finlow.

- **Quem entra**: lista de e-mails em `OPS_EMAILS` (`lib/ops-lista.ts`), lida
  do ambiente a cada request e **falha fechada** — variável ausente recusa
  todo mundo. Não há coluna no banco: tirar acesso é editar a variável, e
  nenhum bug de escrita concede o papel. Guard em `exigirOps`
  (`lib/ops.ts`), que responde **404** a quem não está na lista, porque 403
  confirmaria que a página existe.
- **Números** (`/ops`): contas, novas em 30 dias, assinaturas ativas e
  inadimplentes, escolas por status, turmas, alunos, professores, indicações
  e leads. Só agregados, nenhum nome. A telemetria da Vertex continua em
  `/api/ops/metrics` (abaixo), que serve máquina.
- **Escolas** (`/ops/escolas`): criar escola com a conta do adm junto (senha
  temporária mostrada uma vez), suspender e reativar, mudar a vigência.
- **Gente** (`/ops/escolas/[id]`): adicionar uma pessoa (professor ou aluno)
  sem convite, editar nome, login e turma, sortear senha nova, trocar papel,
  tirar da escola sem apagar a conta, e designar professor de turma. Eram
  operações que só existiam no Prisma Studio: `MembroEscola` nascia por
  resgate de convite e nunca mudava, e `Turma.professorId` não tinha rota que
  o escrevesse. Regras que a tela aplica: professor **precisa** de e-mail (é
  por ele que a conta é recuperada) e aluno não; conta que já existe no
  Finlow é **vinculada**, não recriada, e mantém a senha dela; trocar de
  turma **move** o aluno (o N:N de `MembroTurma` continua servido pelo
  convite, que soma); e campo não enviado não é tocado, para abrir um
  formulário e fechar não apagar nome de ninguém.
- **Sortear senha nova** existe porque o "esqueci a senha" não alcança quem
  entrou pelo lote: o endereço `.invalid` não recebe mensagem. Sem ela, a
  criança que esquece a senha perde a conta e o progresso junto. Seis
  caracteres legíveis para aluno, doze para adulto. Conta que só entrava pelo
  Google ganha senha própria e passa a ter os dois caminhos.
- **Revogar convite**: `ConviteEscola.revogadoEm` era lido em quatro lugares
  e nunca escrito; um código vazado só morria por expirar ou esgotar os usos.
- ⚠️ **Contas de aluno em lote**: cola a lista de nomes, sai login e senha
  por aluno. Exceção para o Fundamental 1, onde a criança não tem e-mail para
  receber convite. O login vive em `User.email` (é onde o provider de
  credenciais procura) com domínio `.invalid`, reservado pela RFC 2606 para
  nunca resolver. Só o nome é coletado. **A pendência de LGPD de menores
  segue aberta**; ver `backlog-produto.md`.

`/api/ops/metrics` devolve uso da Vertex nas últimas 24h (invocações, tokens,
caracteres, latências) e um bloco de produto (indicações totais / 30 dias /
ativadas, leads B2B). Cada bloco falha sozinho. Guard próprio, por token no
cabeçalho (`OPS_METRICS_TOKEN`), porque serve máquina e não sessão. Custo por
chamada estimado em BRL (`lib/custo.ts`), uso registrado por origem
(`lib/uso-ia.ts`).

`scripts/testar-ops.mts` cobre a lista de acesso, a vigência, a geração de
login e senha, e varre `app/api/ops/**` exigindo que **toda** rota escolha um
dos dois guards.

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
| ~~1~~ | ~~"**Conecte suas contas.** Suas transações entram sozinhas, nada de digitar CSV"~~ | ~~Landing, passo 1 de *Como funciona*~~ | ✅ **Fechada em 13/08/2026.** O passo 1 virou "Suba seu extrato" (`app/page.tsx`): a home passou a vender o caminho real, e um bloco abaixo dos três passos diz que a conexão automática está no plano e ainda não existe. O que fechou foi a promessa, não o recurso — o conector Open Finance segue no [backlog deste repo](backlog-produto.md). Guardado por `scripts/testar-landing.mts`. |
| 2 | "**Metas**, orçamentos e **alertas calmos, que avisam antes**" | Landing, *Recursos* | Orçamento existe (teto por categoria ou do mês). Meta existe desde 14/08/2026: model `Objetivo` no schema (cifrado) com a tela `/objetivos`. **Alerta que avisa antes não existe** — não há push, e-mail nem job; o insight só aparece quando a pessoa abre a tela. |
| 3 | "Enquanto você vive sua vida, a IA cruza cada transação" | Landing, *Insights automáticos* | Geração é **sob demanda**, na abertura da tela. Não há processamento em segundo plano. |
| ~~4~~ | ~~"O Finlow já está disponível? **Ainda não.**"~~ | ~~FAQ da landing~~ | ✅ **Fechada em 12/08/2026.** O FAQ responde "Sim" e descreve o que dá para fazer hoje; a landing ganhou as portas que não tinha (`Entrar` → `/login` e `Criar conta` → `/cadastro` no cabeçalho, no hero e no rodapé). A captura de e-mail deixou de ser lista de espera — a tabela `Waitlist` e `/api/waitlist` continuam iguais, só a promessa mudou. Guardado por `scripts/testar-landing.mts`, que roda sem banco. |
| 5 | Login com Google | Botão na tela de login | Código pronto; **falta a chave OAuth na Vercel** para aparecer em produção. |
| 6 | "Baixa **TODOS** os dados do usuário" (portabilidade LGPD) | `/api/exportar`, regra 3 do README | Incompleto. Saem conta, categorias, contas fixas, transações, investimentos, progresso, indicações e diagnóstico. **Não saem: memórias, conversas do chat, orçamentos, respostas do onboarding, eventos de pontuação e insights.** O *delete* cobre tudo (cascade); a exportação não. |
| 7 | Política escrita de retenção e privacidade (R1) | `docs/estado-do-produto.md` | Engenharia pronta (consentimento separado, cifra, RLS, exclusão, exportação). **Falta o texto jurídico**: base legal, finalidade, prazo de retenção. |
| 8 | Revisão jurídica CVM/LGPD do conteúdo | `docs/estado-do-produto.md` | Pendente nos módulos que tocam investimento (M09, M10, M22–M25) e no M07 (bets). |
| 9 | Proteção de custo por abuso | — | Rate limit existe **só** na rota de lead B2B. **Chat e extrato — as chamadas que custam dinheiro — não têm limite.** |
| 10 | "Condições especiais para quem entrar cedo" / planos | FAQ da landing | Parcialmente fechada. O paywall existe desde 10/08/2026 (`lib/pagamento/`, `/premium`), então a resposta do FAQ deixou de dizer que planos "serão definidos" e passou a descrever o que há: uso grátis com limite mensal de IA e um premium opcional. A `/premium` mostra o valor para quem ainda não assina desde 14/08/2026 (item 3 da avaliação UX): `lib/pagamento/preco.ts` lê o preço do mesmo `STRIPE_PRICE_ID` que o checkout cobra, e `/api/pagamento/assinatura` devolve o `plano` cozido para a tela. **Segue não fechada:** a cobrança está em `sk_test` e nunca cobrou ninguém. "Condições especiais" continua sendo promessa comercial, sem nada no código que a sustente. |
| 11 | "userId sempre da sessão — nunca do client" | `lib/painel.ts`, regra de segurança do Painel | Verdade em todas as rotas de dinheiro, e era **mentira em três da trilha** até 07/08/2026: `/api/progresso` aceitava o header `x-user-id` (e criava a conta correspondente), `/api/trilha` e `/api/trilha/[moduloId]` aceitavam `?userId=`. Fechado — ver *Limpeza* em `estado-do-produto.md`. |
| ~~12~~ | ~~Rota de operação só para quem opera~~ | — | ✅ **Fechada em 17/08/2026.** O guard de 31/07 não guardava: só armava se `OPS_METRICS_TOKEN` existisse, e sem ela a rota respondia a qualquer um. Agora falha fechada (503 sem a variável), lê o segredo do cabeçalho `x-ops-token` em vez da query (token em URL vira linha de log) e compara em tempo constante. Custo da mudança: a rota fica 503 até a variável ser definida na Vercel, e quem a chama passa a mandar o cabeçalho. |

**Nota sobre `docs/backlog-trilha-t2.md`:** a seção "verificação contra o
código" é de 02/08 e **já está vencida**. Os quatro pré-requisitos que ela
apontava como inexistentes foram entregues depois: `nivel` e `situacoes[]`
existem no `Modulo`, os perfis deixaram de rotear, `lacuna_chat` é escrito pelo
chat, e a T1 ganhou tags via `prisma/classificacao-t1.ts`.

---

## 5. Leitura rápida do risco

O que está entregue é coerente e defensável: o produto faz o que diz **dentro do
app** — e, desde 13/08/2026, a home também: a landing deixou de vender Open
Finance e o passo 1 virou "Suba seu extrato", o caminho real (divergência 1,
fechada). As duas divergências que importam estão **fora dele**:

- **A exportação LGPD não exporta tudo** — e o que falta (conversas e memórias)
  é justamente o mais sensível.
- **Chat e extrato não têm rate limit.** Uma conta abusiva vira conta de Vertex.

Dentro do app, a de operação fechou em 17/08/2026: **`/api/ops/metrics`** falha
fechada e lê o segredo do cabeçalho. As portas do pré-login que davam para
escrever na conta alheia foram fechadas em 07/08/2026.
