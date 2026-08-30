# Backlog de produto

O que está na fila, na palavra de quem decidiu. Este arquivo é **intenção**, não
entrega — o que existe de verdade está em [`estado-do-produto.md`](estado-do-produto.md).

Registrado em 05/08/2026.

---

## ~~Tela de objetivos~~ ✅ 14/08/2026

Construir uma nova tela onde se pode registrar novos objetivos financeiros para
guardar dinheiro para eles, uma coisa meio sonho.

> Entregue na etapa V2-4 do Redesign Fin v2: `/objetivos`, com o modelo
> `Objetivo` cifrado, "+ Guardar" e barra colorida. Detalhes na seção
> "Redesign Fin v2" abaixo; pendência que segue viva lá: remover/editar
> objetivo não tem desenho.

## ~~Tela de perfil a reconfigurar~~ ✅ 15/08/2026, e a sobra fechou em 24/08/2026

Nome e foto no topo, saldo atual + (entrada + saída) do mês, logo abaixo. Aí sim
o gráfico de rosca e os 4 botões que tem atualmente.

> **A ordem pedida virou a ordem da tela.** `/perfil` agora é: nome e foto →
> saldo com o que entrou e o que saiu do mês → rosca → leituras → Objetivos →
> as quatro portas. O bloco de dinheiro é novo; o resto já existia e só mudou
> de lugar.
>
> **A sobra registrada em 15/08 era exatamente este bloco**, e ela fechou sem
> nada sair da tela: DIAS SEGUIDOS / XP TOTAL / PRECISÃO continuam onde o
> protótipo v2 os pôs, uma linha abaixo do dinheiro. Descê-los para junto da
> porta da Liga era a outra saída, e resolvia o mesmo problema — mas mover
> elemento que um desenho registrado posicionou é decisão de produto, e o
> pedido ("nome e foto no topo, o dinheiro logo abaixo") se cumpre sem ela.
>
> **"Saldo atual" virou "saldo acumulado", e a diferença é honestidade, não
> estilo.** Não existe integração bancária: o que o app sabe é a soma do que a
> pessoa registrou. Chamar isso de saldo da conta seria a mesma falha do passo
> 1 da landing, que prometia conexão automática (item 2 da avaliação de UX). A
> tela mostra o número em destaque e diz, embaixo, de onde ele vem e o que ele
> não é. Quando o conector Open Finance existir, o saldo de verdade entra aqui
> — e aí o rótulo pode mudar porque a frase terá virado verdade.
>
> **Entradas e saídas são do MESMO mês da rosca** (o último com movimento, não
> o mês corrente — no dia 1º o corrente está vazio por definição). A escolha
> desse mês era uma função privada da rota do Perfil e virou
> `mesDeReferencia` em [`lib/financas.ts`](../lib/financas.ts): três
> leituras do mesmo mês na mesma tela não podem ter três donos. De quebra, a
> versão privada lia a data em UTC enquanto o resto da biblioteca lê em hora
> local — as duas só concordam porque o servidor roda em UTC, e em qualquer
> fuso a oeste o rótulo diria "agosto" sobre números de julho.
>
> **Sem lançamento nenhum a tela não diz "R$ 0,00"**, porque o app não sabe que
> a pessoa tem zero: sabe que não sabe. O bloco vira convite para subir o
> extrato. E o que foi para a poupança continua fora de "saiu" (regra do
> `ehPoupanca`), com linha própria quando houver — guardar não é gastar.
>
> **Guardado por `scripts/testar-perfil.mts`** (roda sem banco, sem build): 37
> casos — a escolha do mês (virada de ano, histórico vazio, data ilegível), a
> concordância entre rosca, "entrou" e "saiu", a neutralidade da poupança, e
> quatro conferências que olham o CÓDIGO da tela: a ordem dos blocos, que
> nenhum tile sumiu, que nada promete saldo bancário e que não há `R$` escrito
> à mão. Nada disso quebra build, typecheck ou lint — uma tela somando o mês
> errado compila perfeitamente. O teste foi conferido contra o código mutilado:
> escolher o primeiro mês em vez do último derruba 7 casos, e dar a
> `indicadores` um mês diferente do da rosca derruba a conferência de
> competência única.
>
> ~~⚠️ **Pendência que fica registrada, e é maior que esta tela:**
> `lib/financas.ts` agrupa por mês com `getMonth()` (hora local) enquanto
> `dataCurta()` em [`lib/formato.ts`](../lib/formato.ts) lê o dia em UTC de
> propósito — a data de um lançamento é dia de calendário, não instante. Hoje
> ninguém sente porque a Vercel roda em UTC. Uniformizar a biblioteca inteira
> para UTC é projeto próprio, com teste próprio, e não cabia dentro de um
> trabalho de tela.~~ ✅ **28/08/2026** — o projeto foi feito. Ver *A data de um
> lançamento, lida do mesmo jeito em toda parte*, no fim deste arquivo.

## Conector Open Finance

Criar a possibilidade de conexão Open Finance, onde o usuário pode conectar os
bancos direto no app, para puxar extrato, saldo atual, contas fixas e etc,
atualizando em tempo real ou diariamente.

> ~~⚠️ **Muda uma decisão registrada.** Até 05/08/2026 o Open Finance estava
> documentado como *fora deste repo* (outra frente), no `README.md` e na tabela
> de [`estado-do-produto.md`](estado-do-produto.md). Entrar aqui significa que o
> repo passa a tocar no tema — e que a frase do README sobre não tocar precisa
> sair no mesmo commit em que o trabalho começar.~~
>
> ✅ **Essa trava caiu, e já tinha caído.** A documentação que o item contrariava
> mudou no commit `e15e4c4`, que está na main: `README.md`,
> [`estado-do-produto.md`](estado-do-produto.md) e
> [`resumo-de-funcao.md`](resumo-de-funcao.md) já descrevem o conector como
> planejado deste repo. O último resto — o comentário de `Investimento` no
> `schema.prisma`, que ainda dizia "este repo não toca nisso" — caiu em
> 11/08/2026. **Não há mais decisão registrada sendo contrariada.**
>
> 🔴 **O que ainda trava, e é decisão sua, não de código:** Open Finance no
> Brasil não se conecta sozinho. É preciso escolher um agregador regulado
> (Pluggy, Belvo, Klavi ou equivalente), o que traz contrato, custo por conta
> conectada e credencial de produção. Nenhuma dessas três coisas se decide
> dentro do repositório, e por isso o conector não foi começado.
>
> 🟢 **O que já dá para construir sem essa decisão, e foi construído:**
> a metade da ingestão. Ver "Conferência de duplicata" abaixo — sincronizar
> diariamente significa, por definição, receber a mesma transação de novo todo
> dia, e sem deduplicação um conector multiplicaria o histórico da pessoa pelo
> número de sincronizações.

### ~~Conferência de duplicata na entrada de dados~~ ✅ 11/08/2026

Primeira metade do conector, e independente de qual agregador for escolhido:
o extrato passa a conferir o que chega contra o que já está lançado.

> **Era defeito de hoje, não só preparo para amanhã.** Nada no caminho do
> extrato comparava as linhas novas com o histórico. Como `limitarA3Meses` corta
> em 3 meses, subir jan–mar e depois fev–abr era o caso comum — e gravava
> fevereiro e março duas vezes, com o dash contando o dobro e nenhum sinal na
> tela.
>
> A regra mora em [`lib/extrato/duplicatas.ts`](../lib/extrato/duplicatas.ts),
> pura e sem banco, porque `descricao` e `valor` são cifrados com IV aleatório:
> o mesmo texto vira cifra diferente a cada gravação, então não existe índice
> único nem comparação em SQL que resolva — tem de ser em memória, depois de
> decifrar. `scripts/testar-duplicatas.mts` exercita as duas direções sem banco.
>
> **Nunca apaga.** Linha com descrição igual chega desmarcada; mesmo dia e valor
> com outro nome chega marcada e sinalizada. Repetição legítima existe (dois
> cafés de R$ 12 no mesmo dia), e desmarcar linha verdadeira faz faltar dinheiro
> no total tanto quanto duplicata faz sobrar.

## ~~Melhorar prompt e personalização do agente~~ ✅ 08/08/2026

Permitir que o agente se conecte melhor com o usuário por uma definição de
personalidade de resposta.

> Entregue em `lib/personalidade.ts` (catálogo e bloco de prompt),
> `lib/personalidade-repo.ts` (leitura e gravação) e a tela
> `/personalidade`, em Menu > Personalidade do assistente. Cinco tons —
> Equilibrado (padrão), Direto ao ponto, Acolhedor, Explicador, Incentivador —
> mais um campo livre de 200 caracteres para a pessoa escrever como quer ser
> atendida. O tom vale no chat e também no onboarding refeito, para o
> assistente não trocar de voz entre as duas telas.
>
> **A decisão que sustenta o resto:** tom muda COMO ele fala, nunca O QUE é
> verdade. O bloco do prompt repete, em todos os tons, que continuam valendo os
> números do contexto, o "não sei" quando não há dado, o não julgar gasto, o
> não recomendar ativo e o formato JSON. Sem essa cláusula, a escolha de tom
> viraria uma porta para afrouxar as regras que protegem os números — e o campo
> livre seria um segundo prompt de sistema escrito pelo usuário.
>
> O campo livre entra no prompt cercado: rotulado como preferência, marcado
> como texto não confiável, sem quebra de linha (não forja seção nossa) e sem
> aspas duplas (não fecha o delimitador). `scripts/testar-personalidade.mts`
> cobre as duas coisas, e o teste foi conferido contra o código mutilado.

## ~~Tela de fim de cada lição~~ ✅ 06/08/2026

Ao final de cada lição adicionar uma telinha de checkout com o XP que o usuário
ganhou, o tempo que ele levou na lição, o quanto ele acertou e o conceito que ele
aprendeu nessa lição.

> Entregue em `components/trilha/FimDaLicao.tsx`. Os quatro números vêm do
> servidor, inclusive os acertos — se a tela calculasse o próprio acerto, ela
> poderia discordar do XP que foi creditado.

## ~~Divisão dos 4 tipos de lição na trilha~~ ✅ 06/08/2026

Dividir os módulos existentes em 4 partes, e apenas quando as 4 lições forem
feitas é que se vai pro próximo módulo. As quatro lições são respectivamente:

1. **Novo conceito!** Quiz de pergunta sobre o assunto, com consulta.
2. **História!** Exemplo de contexto prático numa historinha com perguntas
   durante a lição.
3. **Revisão!** Quiz de pergunta sobre o assunto, sem consulta.
4. **Aplicação!** A IA interpreta o contexto do próprio usuário e faz uma
   pergunta sobre o assunto dentro do conceito dele. *(EXTRA)*

> ✅ **Decidido e entregue.** A ressalva abaixo era real e foi posta à mesa antes
> de começar; Sofia escolheu o corredor com ela à vista, na variante que trava
> **entre módulos**. O custo está aceito e registrado: quem chega com dúvida no
> módulo 5 passa pelos quatro primeiros. A regra mora em `lib/corredor.ts`, é
> conferida no servidor, e a documentação da biblioteca posicionada caiu no
> mesmo commit.
>
> ~~⚠️ Inverte a arquitetura atual da Trilha. Hoje nenhum módulo é bloqueado por
> sequência: a trilha é biblioteca posicionada, não corredor — a aula é achada
> por nível e situação, e travar a aula 3 até concluir a 2 foi removido de
> propósito, porque transformava quem veio tirar uma dúvida específica em alguém
> que desiste.~~
>
> **O que ficou de fora, e é conteúdo, não código:** a lição "História!" hoje é
> a tela de cenário sozinha — falta a parte de "perguntas durante a lição". E a
> "Aplicação!" usa as telas de input e resultado, que já trabalham com os
> números da pessoa, mas ainda não é a IA gerando pergunta (era marcado EXTRA).
> Os 4 módulos sem tela de cenário ficam com 3 lições em vez de 4.

## ~~Remodelagem dos módulos~~ ✅ 06/08/2026

Agora em trilha! Blocos em ordem, ordenados pela IA: ela entende o contexto do
usuário e edita a fila de prioridade dos blocos para que seja personalizada para
ele.

> É a ordem do corredor: a sequência sai de `RecomendacaoTrilha`, montada pela
> IA a partir dos números da pessoa. Duas pessoas têm corredores diferentes — é
> o que impede o corredor de virar uma fila única igual para todo mundo.

## ~~Popular a base desde o 1º ano~~ ✅ 07/08/2026

Implementar todo o conteúdo dos assuntos desde o 1º ano.

> Estava entregue e ninguém cruzou a linha: os quatro segmentos de EF (83
> módulos, 415 telas) foram portados e semeados em 07/08, e o EM já estava
> desde 05/08. Total no banco: 150 módulos, 801 telas — a tabela viva está
> em `estado-do-produto.md`. O que resta ali é conteúdo, não código:
> thumbnails e revisão pedagógica humana.

## ~~Redesign Fin — gamificação~~ ✅ 13/08/2026

O protótipo mobile Gen-Z da fundadora (navy + dourado + Nunito + o mascote
Fin) foi implementado no miolo gamificado. **Do backlog de gamificação,
entregues:** G-03 (pop-up de lição diária), G-04/05 (energia com custo por
lição, +1/hora, devolução por acerto — limita só usuário grátis sem vínculo
de escola), G-06/12/13 (Finlo Coins + Loja do Fin com poção ×2 e avatares),
G-08 (missões diárias derivadas, resgate idempotente), G-11 (baú de unidade).
Mais: combo que atravessa lições, precisão em %, nível do jogador,
conquistas derivadas, intro do Fin, manifest PWA.

**Decisões de não-entrada (fundadora, 13/08/2026):**

- **G-17 (dashboard do professor por métrica) e liga semanal NÃO entraram**
  — o ranking mantém a mecânica de sempre (pontos totais, professor liga o
  rank da sala); só o visual virou Fin.
- **"Tema mel" da loja** ficou fora: mexeria em token global de tema.

**Pendências que esta frente cria:**

- **Baú para EM** — Ensino Médio não tem `blocoId` nem leva, então aluno de
  EM nunca vê baú. Decidir a unidade dele (segmento inteiro? grupos de 4?).
- **Números afináveis quando houver dado de uso**: custo/devolução de
  energia, preços da loja, coins por lição/missão/baú, curva de nível,
  bônus de combo (tudo constante nomeada, um lugar cada).

## Redesign Fin v2 — o app inteiro desenhado (14/08/2026)

O protótipo ganhou uma segunda versão que **desenha todas as telas
restantes** na identidade Fin (fonte: "Finlow mobile app redesign (1).zip",
tela a tela em `Finlow App.dc.html`). A landing está sendo implementada
agora (a fundadora pediu: manter a estrutura atual, trocar a identidade);
o resto entra nesta fila, tela a tela, cada uma na régua de sempre — docs e
código no mesmo commit, tom sem culpa, mecânica só muda se for decisão
registrada.

⚠️ **Fotos novas do mascote a caminho**: a fundadora vai enviar novas artes
do gato. As poses atuais de `public/fin/` seguem valendo até lá; quando
chegarem, é troca de arquivo, não de código.

**A fila, pelo desenho do protótipo v2:**

- ~~**Landing**~~ ✅ 14/08 — estrutura e copy atuais, identidade Fin, Fin no
  lugar dos mockups, card do Finlow para Escolas, passo 1 honesto ("suba seu
  extrato").
- ~~**Login e Cadastro**~~ ✅ 14/08 — navy + botão 3D + Google creme; o
  celular entrou no schema (`User.celular`, opcional e informativo como a
  data de nascimento, só dígitos, na exportação LGPD); apelido da liga
  sempre visível no cadastro. De quebra, `tema-fin` no layout de `(app)`
  remapeia os tokens `--fl-*` — todas as telas logadas já nascem
  navy+dourado, e o refino vem tela a tela.
- ~~**1ª conversa (onboarding)**~~ ✅ 14/08 — aceite com Fin professor,
  bolhas da conversa com avatar do Fin, fechamento com Fin orgulhoso.
- ~~**Chat**~~ ✅ 14/08 — cabeçalho do Fin ("seu assistente · online" +
  chama da ofensiva), avatar nas bolhas da IA, bolha do usuário dourada,
  sugestões em pill, botão de enviar 3D.
- ~~**Menu (Ajustes)**~~ ✅ 14/08 — card de perfil no topo (inicial + badge
  FREE/FINLOW+ via `/api/conta`). A seção **Aparência saiu**: o escopo
  `.tema-fin` ignora o toggle claro/escuro e a paleta, e controle que não
  muda nada é pior que controle nenhum — `SeletorTema`/`SeletorPaleta`
  ficaram no repositório, sem uso. ⚠️ A parte da paleta foi SUPERADA em
  15/08: o pedido da fundadora trouxe a paleta de acento de volta e o
  `SeletorPaleta` voltou ao Ajustes (`app/(app)/ajustes/page.tsx`); só o
  `SeletorTema` segue sem uso.
- ~~**Painel**~~ ✅ 14/08 — o toggle Controle/Análises virou **navegação
  entre as duas páginas** (antes era aba interna do Painel que duplicava
  /analises em miniatura); CTA "Subir extrato do banco" 3D no fim do
  Controle.
- ~~**Extrato**~~ ✅ 14/08 — a tela já era o desenho; refino: CTA de
  confirmação 3D, chip do upload e checkboxes dourados.
- ~~**Análises**~~ ✅ 14/08 — ganhou o toggle e herdou os dois cards que só
  existiam na aba interna do Painel (gasto médio por dia, insight do
  perfil); `DistribuicaoGastosChart` deixou de renderizar (duplicava a
  rosca), mas o arquivo fica — exporta `agruparPorCategoria`.
- ~~**Objetivos**~~ ✅ 14/08 — TELA NOVA em `/objetivos`: modelo `Objetivo`
  (nome/meta/guardado CIFRADOS, RLS, exportação, Cascade), repo
  `lib/objetivo-repo.ts` com retentativa no "+ Guardar" (rajada de toques é
  o caso normal), escrita atrás do consentimento do Painel (R8), cores
  girando por card, aviso do Fin "cofrinho é bolso seu". Entrada pelo Menu.
  ⚠️ O passo fixo de R$ 50 desta entrega **caiu em 28/08/2026** a pedido da
  fundadora — ver *Objetivos: quanto guardar virou campo livre*, abaixo.
  ⚠️ Pendência de design: o desenho não tem caminho de **remover nem
  editar** objetivo (nome/meta) — sem rota DELETE de propósito, rota sem
  tela é porta morta. Quando desenhar, a rota nasce junto — e não precisa
  nascer do zero: a branch `claude/zealous-turing-fav2pl` construiu uma
  versão anterior desta tela, de antes do Redesign Fin v2, que já tem
  `atualizarObjetivo`, `apagarObjetivo`, DELETE na rota, emoji, prazo e
  conclusão derivada do alvo. **Ela não foi mesclada de propósito** (ver
  *Branches paralelas* no fim deste arquivo): renomearia colunas do schema
  que a v2 já batizou (`meta`/`guardado`) e trocaria a tela entregue por
  uma anterior ao desenho. Serve como fonte, não como merge.
- ~~**Diagnóstico de Vazamento**~~ ✅ 14/08 — Fin assustado com a conta no
  hero, CTA "Conversar sobre isso com o Fin" 3D.
- ~~**Memória do assistente**~~ ✅ 14/08 — a tela já era o desenho; só o
  knob do interruptor trocou branco por navy.
- ~~**Finlow+ (premium)**~~ ✅ 14/08 — título "Finlow+", Fin animado
  abrindo a venda, CTA 3D, e a lista de vantagens ganhou "Energia infinita
  na trilha" — entrou quando virou verdade.
- ~~**Biblioteca**~~ ✅ 14/08 — classe `tema-fin` na rota (vive fora do
  grupo `(app)`), aula liberada com anel e borda dourados, concluída verde.
- ~~**Perfil (financeiro)**~~ ✅ 14/08 — cabeçalho de jogo ("Nível N ·
  {rótulo financeiro}", barra de XP), tiles DIAS SEGUIDOS/XP/PRECISÃO,
  card de Objetivos com o Fin, porta "Liga". ⚠️ A convivência com
  /trilha/perfil foi SUPERADA em 15/08: a fundadora mandou unificar, e
  missões, conquistas e recorde moram no /perfil; /trilha/perfil virou
  redirect. O resgate continua numa tela só, como a ressalva pedia.
- ~~**Escola**~~ ✅ 14/08 — `tema-fin` no layout de /escola (vive fora do
  grupo logado), turmas com inicial colorida, e o **detalhe do aluno pelo
  professor** com os 4 tiles e "1ª passada × após correção": a nota que
  valeu XP (`acertos`/`totalQuiz`) vira pedra na 1ª conclusão, refazer
  grava em `acertosRevisao`/`totalQuizRevisao` — a 2ª rodada não vale XP
  nem infla a média do professor. ~~⚠️ `ProgressoLicao` continua FORA de
  `/api/exportar` (lacuna pré-existente, registrada em
  resumo-de-funcao.md) — as colunas novas herdam a pendência.~~ ✅ **24/08/2026**
  — a lacuna era a tabela inteira, e a tabela inteira entrou: as duas duplas
  ("1ª passada × após correção") saem separadas, como ficam no banco. Ver
  *Exportação LGPD completa* abaixo.
- **Landing pública do Finlow para Escolas** — ⚠️ correção de catálogo
  (14/08): a tela "Finlow para Escolas" do protótipo v2 é a **home da
  administração** (abas Início/Turmas/Professores), que já foi vestida
  acima — NÃO é landing de marketing. Página pública de venda segue sem
  desenho; o card da landing continua apontando para o e-mail.
- **Dashboard do professor por métrica (G-17)** — o desenho existe; a
  decisão de 13/08 de não entrar ainda vale até a fundadora reabrir.
- **BottomNav** — o protótipo segue com 3 abas (Trilha/Liga/Perfil);
  a decisão de manter as 4 atuais permanece até ela decidir.

**Pedido novo da fundadora (14/08/2026, fora do protótipo v2) —
personalização do perfil:**

- ~~**Foto de perfil e banner trocáveis**~~ ✅ 14/08 — o usuário troca a
  foto (círculo do avatar) e a capa no topo do Perfil, no espírito do
  mockup de referência; a identidade Fin não saiu do lugar (a capa é uma
  faixa de imagem que esmaece pro navy, o resto segue navy+dourado+
  Nunito). Como ficou cada decisão:
  1. **Armazenamento: no próprio banco** (`ImagemUsuario`, data URI), NÃO
     em bucket — decisão pragmática registrada no schema: sem storage na
     infra, e no banco a imagem morre com a conta pelo Cascade (bucket
     não morreria), sai na exportação e fica atrás de RLS. O tamanho é
     controlado nas duas pontas: corte + compressão no cliente (256² a
     foto, 1280×512 a capa, JPEG) e teto no servidor. Migrar para
     Supabase Storage/Vercel Blob só se a imagem um dia precisar de CDN
     (= visibilidade além do dono).
  2. `User.bannerUrl` **não existiu** — a tabela própria cobre foto E
     capa com a mesma mecânica; `User.image` (Google) virou fallback da
     foto.
  3. **Convivência com o avatar do Fin**: a foto real aparece no Perfil
     financeiro e no card do Menu; o `avatarFin` da loja continua dono do
     chip da trilha e do /trilha/perfil. É um default sensato, não um
     desenho — a fundadora pode redesenhar quando quiser.
  4. **LGPD cumprida como decidido**: a rota GET exige a sessão do PRÓPRIO
     dono (sem sessão = 401, provado); nenhuma superfície de terceiros —
     rank da sala incluído — mostra a foto. Expor a colegas continua
     exigindo moderação e decisão registrada.
  Pendência herdada: SVG recusado de propósito (XML executável); HEIC do
  iPhone não abre no canvas — a mensagem de erro aponta JPG/PNG.

## Pedidos da fundadora de 15/08/2026 (pós-deploy do redesign)

Sete pedidos chegaram juntos; seis viraram código no mesmo dia (paleta de
acento de volta, dia 1 a 31 nas contas fixas, FINLOW+ DISPONÍVEL explícito,
economia por XP, segunda chance no quiz, roteador de consultas da IA) e a
regra global de copy virou guard, ver `estado-do-produto.md`. O que fica de
fila:

- **Questionários com no mínimo 8 perguntas** — conteúdo, não código: a
  fundadora vai reelaborar as trilhas. O player já suporta qualquer
  quantidade de quiz por lição, e a segunda chance re-enfileira as erradas
  independente de quantas sejam.

**Leva de 16/08/2026 (bug + três pedidos), entregue no mesmo dia:**

- ~~**Bug: aula escolar no perfil adulto "não conclui nem paga"**~~ ✅ — a
  conclusão SEMPRE gravou; o que quebrava a percepção era o peso 1/4
  esmagando o piso da lição para 1 XP e a biblioteca forçando aula de outro
  público como "liberada" pra sempre. O peso virou **METADE** (decisão dela;
  o custo de varredura dominar o ranking está aceito e anotado em
  `lib/pontos.ts`) e a biblioteca passou a ler a conclusão real.
- ~~**Módulo em sequência única**~~ ✅ — as lições emendam sem tela de
  concluído no meio; a tela de fim aparece uma vez, com a sentada somada.
  Energia, XP e revanche seguem por lição no servidor.
- ~~**Foto na Liga**~~ ✅ — a linha PRÓPRIA mostra a foto; as dos colegas
  seguem de inicial (foto alheia é privada por decisão LGPD).
- ~~**Comprar energia**~~ ✅ — tocar no raio abre o modal: recarga cheia por
  10 moedas ou a porta do Finlow+ (energia infinita); o botão também está
  na tela de energia zerada do player.

## Finlow para Escolas — em desenvolvimento (11/08/2026)

Decisão da fundadora, desenhada em quadro branco: o canal escolar reabre como
**Finlow para Escolas**. Entrada dupla (escola × usuário comum) e três papéis:

- **Professor** — cria turma/grupo; concede acesso a trilha/bloco/módulo;
  competências (concedidas pelo adm) filtram o que ele enxerga e gerencia;
  vê desempenho individual e geral (aluno/grupo); habilita o rank da turma
  com escopo sala, ano ou escola.
- **Aluno** — entra por convite com código, cai na turma e no segmento certo;
  faz a trilha do segmento em corredor (sem IA, ordem pedagógica dos blocos);
  vê o rank da sala; tem o **app completo como um usuário premium comum**.
- **Adm da escola** — cria professores e alunos (via convites), concede
  competências, vê o desempenho geral das salas.

> ⚠️ **Muda uma decisão registrada.** `backlog-trilha-t2.md` declarava "B2B
> escolar e BNCC como canal de venda" mortos ("o v3 é B2C puro"). O parágrafo
> caiu no mesmo commit em que este trabalho começou, como manda a regra da
> pasta. O produto adulto continua B2C por assinatura; a escola é um canal
> paralelo sobre o mesmo conteúdo.

**Decisões de desenho (fundadora, 11/08/2026):**

- Escopo: o quadro completo, construído em etapas — cada etapa um commit
  deployável.
- Alunos e professores entram por **convite com código** (multiuso, por
  turma); a escola e a conta do adm nascem pela **operação do Finlow**, nunca
  por signup — sem UI de signup B2B e sem cobrança B2B neste repo por
  enquanto. *(Atualizado em 18/08/2026: eram só `scripts/criar-escola.mts`;
  agora há também `/ops/escolas`, e os dois caminhos chamam a mesma função.)*
- Membro de escola ativa conta como **premium** (quem decide continua sendo
  só `lib/pagamento/acesso.ts`).

**Pendências abertas que esta frente cria (não bloqueiam build; bloqueiam
venda):**

- **LGPD de menores** — rank entre colegas expõe apelido+pontos de menor de
  idade; consentimento de responsável (`consentimentoLGPD`, reservado no
  schema) precisa de texto jurídico antes de escola real com menores.
  Relaciona-se com a pendência R1 (política de retenção).

  **Cresceu em 18/08/2026, por decisão consciente da fundadora.** A criação
  de contas de aluno em lote (`/ops`, `criarAlunosEmLote`) foi pedida e
  construída sabendo que a pendência estava aberta, porque o bloqueio
  operacional era real: no Fundamental 1 a criança não tem e-mail para
  receber convite, e sem isso não há piloto. O que a decisão adiciona à
  dívida: o Finlow passa a **guardar nome de criança** sem nenhum
  consentimento coletado no produto, e a escola passa a **conhecer a senha
  inicial** de cada aluno. O que foi feito para a dívida não crescer sozinha:
  a rota pede **só o nome** (nada de data de nascimento, e-mail, telefone ou
  responsável), o login vive num domínio `.invalid` que nunca recebe
  mensagem, e a tela avisa o risco antes de abrir o formulário. **Continua
  valendo: validar com advogado antes de escola real com menores.**
- **Cota de IA por aluno** — premium por escola ganha teto próprio
  (`TETO_ESCOLA_TOKENS`) em vez do Infinity do assinante; o número é
  afinável e a fundadora pode derrubar o teto quando quiser.
- **Rank por eventos escolares** — a primeira versão do rank da sala usa
  `User.pontos` total (pontos de uso pessoal contam); recortar por eventos
  dos módulos do segmento fica para uma segunda rodada.
- **`preRequisitoSlug` segue inerte** — o corredor escolar usa a ordem
  linear dos blocos, que na prática cobre o grafo de pré-requisitos; ligar o
  grafo de verdade é projeto próprio.

## ~~Exportação LGPD completa~~ ✅ 24/08/2026

Não é pedido novo: é a lacuna que `estado-do-produto.md` e
[`resumo-de-funcao.md`](resumo-de-funcao.md) já registravam, e que a ⚠️ do
Finlow para Escolas (acima) herdou. `/api/exportar` prometia "TODOS os dados do
usuário" no comentário do topo — e a regra 3 do `README.md` promete o mesmo —
enquanto deixava de fora **memórias do assistente, conversas do chat,
orçamentos, respostas do onboarding, eventos de pontuação, insights e progresso
das lições**. Entraram também os dias da ofensiva, o perfil da trilha, as
recomendações da IA (com o `motivo` que ela escreveu sobre a pessoa) e de que
banco veio cada extrato importado.

> **O defeito não era a lista errada; era a lista morar onde esquecer não dá
> erro.** O delete cobre tudo porque quem escolhe é o banco (CASCADE); a
> exportação é escrita à mão. Tabela nova entra no schema, ninguém lembra da
> rota, e o app passa a mentir numa tela de privacidade — em silêncio, e do lado
> que a pessoa só descobre ao abrir o arquivo procurando a conversa que não
> está lá. Por isso a correção é a mesma que `lib/dados-financeiros.ts` já tinha
> feito do outro lado: a lista virou dado em `lib/dados-exportacao.ts`, e
> `scripts/testar-exportacao.mts` a confere contra o `schema.prisma` — modelo do
> usuário sem classificação derruba o teste pedindo a decisão.
>
> **Teto de tela não vale para portabilidade.** As conversas saem inteiras, por
> `exportarConversas` (novo em `lib/conversa-repo.ts`): os cortes de 40
> conversas e 200 mensagens existem para a barra lateral renderizar, e usá-los
> aqui entregaria "os 40 mais recentes" com o arquivo dizendo "todos os seus
> dados" — sendo que a conversa que a pessoa foi buscar é justamente a antiga.
> O teste recusa `take:` na rota pelo mesmo motivo.
>
> **O que fica de fora tem razão escrita, e são três famílias:** credencial
> (senha, token de sessão, token do Google — é a chave da conta, e o arquivo é
> feito para ser guardado e mandado por e-mail), identificador de sistema nosso
> (os ids `cus_`/`sub_`/`cs_` da Stripe) e dado de terceiro (quem entrou pelo
> link dela, quem estuda na mesma turma). O teste confere que nenhum desses
> nomes reaparece no código da rota — um `select` copiado de outro arquivo é o
> jeito comum de isso voltar sem ninguém decidir.
>
> **Cifrado sai decifrado, sempre pelo repositório.** Ler `db.conversaMensagem`
> direto não quebra nada: gera um arquivo de `"v1.…"` que a pessoa abre sem
> entender. O teste lê o `schema.prisma` como texto (a marca CIFRADO é
> comentário `//`, que o DMMF não carrega) e recusa leitura direta de qualquer
> modelo cifrado dentro da rota.
>
> **Simetria com o apagar virou teste:** toda tabela que "Apagar meus dados
> financeiros" leva precisa estar na exportação. Some no botão e nunca ter saído
> no arquivo é a pessoa perder sem nunca ter podido levar — era o caso de
> orçamento e de extrato importado. Conferido contra o código mutilado.
>
> **Quatro sessões resolveram este mesmo item em paralelo, e a versão que ficou
> é a soma delas** (24/08/2026). As quatro chegaram à mesma forma — lista em
> arquivo, teste contra o schema, `exportarConversas` sem teto — e cada uma viu
> uma coisa que as outras não viram. O que entrou por causa disso: a regra de
> posse passou a ser a RELAÇÃO com `User` e não a coluna `userId` (a coluna
> deixava passar `Indicacao`, `Turma`, `ConviteEscola` e `AcessoTrilhaTurma`, e
> a indicação a rota já entregava sem estar em lista nenhuma); a lista de espera
> entrou, porque o delete de conta já a apaga pelo e-mail; cada seção declara de
> qual fonte vem (`lidoPor`), o que impede uma chave presente com array vazio
> passar por entrega; e o teste confere que toda consulta filtra pelo dono.
>
> **Essa última checagem veio com defeito, e o defeito foi corrigido aqui.** A
> versão original olhava uma janela de caracteres depois da consulta — e a
> janela vazava para a consulta SEGUINTE, que quase sempre tem `userId`. Tirar o
> `where` de uma leitura passava no teste por causa do filtro do vizinho, no
> bloco que existe justamente para impedir que o arquivo saia com dado dos
> outros. Agora a checagem casa os parênteses e lê só o argumento daquela
> consulta.

## ~~Objetivos: quanto guardar virou campo livre~~ ✅ 28/08/2026

Pedido da fundadora: *"na tela de objetivos só dá pra registrar de 50 em 50
reais, consegue colocar input livre?"*

> ⚠️ **Muda uma decisão registrada, e ela cai neste mesmo commit.** O passo fixo
> era desenho do protótipo v2, com o porquê escrito no código: *"guardar é gesto
> repetido, não formulário"*. A intenção era boa e o custo não tinha sido posto
> na mesa: guardar R$ 30 era **impossível**, e R$ 400 eram oito toques. Um passo
> que não divide o valor da pessoa não é atalho, é aritmética.
>
> **O que mudou:** o "+ Guardar" abre um campo, ela escreve quanto quer e
> confirma. Os R$ 50 não sumiram — viraram sugestão junto de R$ 100 e R$ 200, e
> **preenchem o campo em vez de gravar sozinhos**, que é o que preserva a rajada
> de toques de quem guarda sempre o mesmo valor. O botão fechado deixou de
> prometer um número ("+ Guardar R$ 50" com campo livre atrás seria o rótulo
> mentindo sobre o toque, item 7 da avaliação de UX), e o campo mostra quanto
> falta para a meta como leitura, não como limite: passar da meta é escolha
> dela.
>
> **A rota não precisou afrouxar nada — ela já aceitava qualquer valor.** O
> passo de R$ 50 estava preso só na tela, e é por isso que este é um conserto
> pequeno com um arquivo novo: campo livre traz junto a parte que o passo fixo
> não tinha, que é **valor recusado**. Passo fixo nunca é inválido; texto
> digitado é inválido o tempo todo.
>
> **Por isso a regra virou uma só, em [`lib/objetivo.ts`](../lib/objetivo.ts)**
> (puro e sem banco, o mesmo par de `personalidade.ts` × `personalidade-repo.ts`
> — a tela é componente de cliente, e importar o repositório traria o Prisma
> para o navegador). A tela recusa **antes** de mandar, com o motivo escrito em
> português; a rota recusa porque a tela não é autoridade nenhuma — o `fetch`
> que chega ali pode não ter vindo dela. Duas cópias da mesma regra divergem, e
> a divergência aparece do pior jeito: o campo aceita, o servidor devolve 400, e
> a pessoa lê "Valor inválido" sem ter feito nada de errado.
>
> **Um defeito antigo caiu junto, e ele é da mesma família.** A tela lia número
> com `Number(texto.replace(",", "."))`, que transforma **"1.000,00" em
> "1.000.00" e devolve `NaN`**: quem digitasse a meta com ponto de milhar levava
> "Meta inválida" tendo escrito certo. É exatamente o defeito que `paraNumero`
> foi escrita para resolver no Painel — e que esta tela não usava. Com valores
> de adulto (mil, dois mil), o ponto de milhar é o jeito natural de escrever.
>
> **Guardado por `scripts/testar-objetivos.mts`** (sem banco, sem build): o
> jeito brasileiro de escrever dinheiro, as recusas com motivo legível, o
> arredondamento em centavos (sem ele, três depósitos deixam o saldo com quinze
> casas e a barra passa a mentir) e seis conferências que olham o CÓDIGO das
> duas pontas — que o depósito saia do CAMPO e não de uma constante (um
> `guardar: 50` literal é o passo fixo de volta com outro nome), que as duas
> usem `lerValor`, que a sugestão só preencha (sem `type="button"` o chip dentro
> do `<form>` **envia** o formulário) e que o consentimento do Painel (R8)
> continue de pé. Conferido contra o código mutilado: as cinco mutações são
> pegas, inclusive a volta do passo fixo.
>
> **O que segue pendente é o de sempre:** remover e editar objetivo continuam
> sem desenho, e a rota segue sem DELETE de propósito.

## Recuperação de senha (30/08/2026)

Criar um método de recuperação de senha, para quem esquece a senha conseguir
voltar para a conta.

> **Hoje não existe nada, e a consequência é perder a conta inteira.** Não há
> "esqueci minha senha" em `/login`, nem rota, nem tela, nem caminho de suporte
> dentro do produto — a varredura não achou uma única ocorrência em `app/` ou
> `components/`. Quem esquece a senha perde junto o histórico financeiro
> cifrado, os objetivos, a trilha e as conversas com o assistente. E perde de
> um jeito que o Finlow não consegue desfazer nem manualmente: os campos são
> cifrados com chave derivada por usuário, então não há "a gente recupera para
> você" possível sem a pessoa entrar.
>
> 🔴 **O que trava, e é decisão sua, não de código:** não existe envio de
> e-mail neste repositório. Nenhuma dependência de envio no `package.json`, e
> nunca houve — é a mesma lacuna que faz o "alertas calmos, que avisam antes"
> da landing seguir sem existir (divergência 2 de
> [`resumo-de-funcao.md`](resumo-de-funcao.md)). Recuperação por e-mail exige
> escolher um provedor (Resend, Amazon SES, Postmark ou equivalente), o que
> traz domínio verificado, SPF/DKIM, custo por mensagem e credencial de
> produção. Nenhuma dessas coisas se decide dentro do repositório, e é o mesmo
> formato de bloqueio do *Conector Open Finance* acima.
>
> 🟢 **O que já existe e serve de base:** `VerificationToken` está no
> `schema.prisma` desde sempre (veio com o adapter do NextAuth) — se ela vai
> guardar o token de reset ou se nasce tabela própria é decisão a registrar, não
> detalhe de implementação, porque a tabela do adapter tem dono. E
> `lib/limite-taxa.ts` já existe, hoje guardando só a rota de lead B2B.
>
> **Cinco decisões que este item carrega, e é melhor que estejam à mesa antes
> de começar do que descobertas no meio:**
>
> 1. **Conta do Google não tem senha.** `User.senha` é opcional e nasce `null`
>    para quem entrou pelo Google. Pedir reset numa dessas não pode responder
>    "enviamos o link" (mentira) nem "essa conta não existe" (também mentira, e
>    pior). O caminho honesto é a mensagem dizer que aquela conta entra pelo
>    Google — o que já vaza uma informação, e por isso é escolha, não detalhe.
> 2. **A resposta não pode revelar quem tem conta.** E-mail cadastrado e não
>    cadastrado precisam receber a MESMA resposta na tela, senão o formulário
>    vira uma consulta pública de "fulano usa o Finlow?". Num app de dinheiro
>    isso é dado sensível sozinho, antes de qualquer número.
> 3. **A sessão é JWT** (`lib/auth.ts`, obrigatório com provider de
>    credenciais). Trocar a senha **não derruba** as sessões já abertas: quem
>    entrou com a senha antiga continua dentro até o token vencer. Se o reset
>    tem de expulsar as outras sessões — que é o motivo pelo qual muita gente
>    troca a senha —, isso é trabalho próprio e não sai de graça com o resto.
> 4. **Aluno de escola criado em lote não recebe e-mail nenhum.** O login dele
>    vive num domínio `.invalid`, reservado pela RFC 2606 justamente para nunca
>    resolver (`lib/ops-escola.ts`, decisão de 18/08). Para esses, quem repõe a
>    senha é a escola, e isso é uma segunda porta — no `/ops` ou na
>    administração —, não a mesma tela. Recuperação por e-mail que ignore isso
>    nasce sem cobrir o público que mais esquece senha.
> 5. **A rota de reset é alvo clássico de abuso**, e o teto de requisições hoje
>    cobre só a rota de lead B2B (divergência 9 de `resumo-de-funcao.md`). Sem
>    limite, o formulário vira torneira de e-mail cobrada de você.
>
> **A saída que não depende do provedor de e-mail, se você quiser uma rede de
> segurança antes:** reposição de senha pela operação (`/ops`), que já é o
> caminho previsto para a escola. Não é o recurso — não atende quem esqueceu a
> senha às 23h —, mas tira o "perdeu a conta para sempre" da mesa enquanto a
> decisão do provedor não vem. É escolha sua se vale entrar antes ou se o item
> espera inteiro.

## ~~A data de um lançamento, lida do mesmo jeito em toda parte~~ ✅ 28/08/2026

Não é pedido novo: é a pendência que a *Tela de perfil* registrou em 24/08 e
que ela mesma chamou de "maior que esta tela". `lib/financas.ts` agrupava por
mês com `getMonth()` (hora local) enquanto `dataCurta()` escrevia o dia com
`getUTCDate()`. A divergência não estava em dois arquivos: `situacoes.ts`,
`contexto-financeiro.ts` e a rota das Análises tinham escolhido UTC por conta
própria, `vazamento.ts`, `investimentos` e o filtro de mês do repositório
tinham escolhido local, e a rota das Análises usava **as duas** — local para
achar o mês anterior com dados, UTC para cruzar os tetos de orçamento.

> **O que sustentava a conta do dinheiro era uma variável de ambiente.** As duas
> leituras só concordam porque a Vercel roda em UTC. Num fuso a oeste, o
> lançamento do dia 1º cai no mês ANTERIOR na soma e continua aparecendo como
> dia 1º no rótulo: a tela diz "suas saídas em agosto" sobre números de julho, e
> nada quebra — compila, renderiza, ninguém loga. Não era hipótese distante: as
> linhas gravadas pelo Painel estão no banco às **00:00Z**, e ali bastam as três
> horas de Brasília para o mês virar.
>
> **A regra ficou uma só, e mora em [`lib/dia.ts`](../lib/dia.ts):** a data de um
> lançamento é DIA DE CALENDÁRIO, não instante. Quem gastou no dia 21 gastou no
> dia 21 em qualquer fuso. O ciclo fecha em três passos, e o arquivo é dono dos
> três: escolhido no calendário de quem lança (`hojeNoCalendario`, no navegador
> dela), gravado ancorado ao **meio-dia UTC** (`ancorarDia`), lido em UTC. O que
> ela escolheu é o que ela lê de volta.
>
> **O meio-dia não é enfeite:** é a folga de ±11h que a meia-noite não tem. O
> caminho do extrato já ancorava assim, com o motivo escrito; o do chat ancorava
> **quase** — `T12:00:00` sem o `Z`, que é meio-dia local e escorrega para o dia
> anterior a leste de UTC+12 — e o do Painel gravava meia-noite, que escorrega
> em qualquer fuso negativo. Agora os três chamam a mesma função.
>
> **Duas contas viraram uma.** `ultimoMesComMovimento` (o caminho da IA) e
> `mesDeReferencia` (o caminho das telas) respondiam a mesma pergunta com
> leituras de data diferentes; o comentário de lá dizia, com todas as letras,
> que juntá-las dependia deste projeto. A primeira agora chama a segunda: o que
> ela faz a mais é ir ao banco. Duas respostas para "de que mês estamos falando"
> é o app dizer "julho" para a IA e "agosto" na tela da mesma pessoa.
>
> **O "hoje" ficou de fora, e isso é decisão, não esquecimento.** Relógio de
> parede não é data de lançamento: `criadoEm`, "há 2 minutos" e a regra de parar
> a curva do fluxo no dia de hoje seguem em hora local. A ofensiva e as missões
> também continuam contando o dia em **São Paulo** (`inicioDoDiaSP`) — a virada
> de um streak é evento na vida da pessoa, e em UTC a cota viraria às 21h do dia
> 31. O teste protege as duas exceções para que ninguém as "conserte" depois.
>
> De quebra, o dia sugerido nas duas telas de lançamento parou de sair de
> `toISOString()`, que é o dia UTC: às 22h de 30 de setembro em São Paulo, o
> Painel oferecia **1º de outubro**, e o gasto ia para o mês seguinte enquanto a
> pessoa ainda jantava.
>
> **Guardado por `scripts/testar-fuso.mts`** (roda sem banco, sem build): a
> mesma aritmética em **cinco fusos**, de UTC−11 a UTC+14, exigindo resultado
> idêntico — um teste só em UTC não veria nada, porque UTC é justamente o fuso
> em que o defeito não aparece. Metade dele olha o CÓDIGO: recusa leitura de
> calendário fora de `lib/dia.ts` nos dez arquivos que mexem com dinheiro,
> exige a âncora nos três caminhos de escrita e deixa `hoje`/`agora` em paz —
> guard que acusa código correto ensina a próxima pessoa a desligá-lo.
> Conferido contra o código mutilado: devolver o `getMonth()` local a
> `financas.ts` derruba quatro casos em **America/Sao_Paulo**, tirar o `Z` da
> âncora derruba sete em Kiritimati, e voltar o `toISOString()` do "hoje"
> derruba dois nos fusos a oeste.

---

## Avaliação de UX — jornada como usuário Gen Z (11/08/2026)

Walkthrough completo feito como um usuário de 20 e poucos anos chegando pelo
celular: landing ao vivo + todas as telas internas. Conclusão geral: **o miolo
do app é bom; o funil de entrada é que está de costas para o produto** — os
quatro primeiros itens acontecem antes de a pessoa ver qualquer qualidade.
Lista do mais crítico ao mais simples; cada item é um trabalho independente.

1. ~~**🔴 Landing sem porta de entrada.**~~ ✅ **12/08/2026.** A home é só lista
   de espera: não existe nenhum link "Entrar" ou "Criar conta" — nem no header,
   nem no footer (`app/page.tsx`). Quem já tem conta precisa adivinhar `/login`
   na URL. E o FAQ responde "O Finlow já está disponível? — Ainda não"
   (`components/landing/Faq.tsx:6`) com o app no ar no mesmo domínio. Agrava:
   o Menu logado aponta "Perguntas frequentes" para esse mesmo FAQ
   (`app/(app)/ajustes/page.tsx:347`).

   > **As duas metades se obrigam.** Dar a porta sem mexer no FAQ deixaria a
   > home dizendo "ainda não abriu" ao lado de um botão de criar conta; corrigir
   > o FAQ sem dar a porta deixaria "sim, está disponível" sem caminho nenhum.
   > Por isso caíram no mesmo commit.
   >
   > **O que mudou:** `Entrar` (`/login`) e `Criar conta` (`/cadastro`) no
   > cabeçalho, no hero ("Já tem conta? Entrar") e no rodapé; o CTA do hero
   > deixou de apontar para a lista e virou "Criar conta grátis"; o FAQ responde
   > "Sim" e descreve o que dá para fazer hoje; a `description` do
   > `app/layout.tsx` parou de vender lista de acesso antecipado.
   >
   > **A lista de espera virou "acompanhar por e-mail", e nada foi apagado.**
   > Com `/cadastro` aberto, "avisamos assim que o acesso abrir" era promessa
   > vencida — quem deixava o e-mail já podia entrar naquele minuto. A tabela
   > `Waitlist`, a rota `/api/waitlist` e a limpeza no delete de conta continuam
   > exatamente as mesmas; mudou só o que a tela promete. A seção final agora
   > oferece criar conta primeiro e o e-mail como segunda opção.
   >
   > **O link do Menu não precisou mudar:** ele aponta para `/#faq`, que passou
   > a dizer a verdade. O teste confere que ele continua apontando para lá — se
   > alguém mudar o destino, é para saber.
   >
   > **Guardado por `scripts/testar-landing.mts`** (roda sem banco, sem build):
   > confere que as portas existem no cabeçalho, no hero e no rodapé, que toda
   > rota interna citada na landing existe como arquivo de rota, e que nem o
   > FAQ nem o formulário voltaram a prometer acesso que já está aberto. Nenhuma
   > dessas coisas quebra build, typecheck ou lint — some sem avisar.

2. ~~**🔴 Landing promete conexão automática de contas que não existe.**~~
   ✅ **13/08/2026.** "Suas transações entram sozinhas, nada de digitar CSV"
   descreve Open Finance, que está aqui no backlog (ver *Conector Open
   Finance*, acima). O produto real é upload de extrato.

   > **O app logado já dizia a verdade.** Ajustes lista "Bancos conectados"
   > como `EmBreve`, com o motivo escrito: *"Requer Open Finance. Por ora, o
   > extrato faz o mesmo trabalho"* (`app/(app)/ajustes/page.tsx:272`). A home
   > vendia o mesmo recurso como o **passo 1** de "Como funciona". É a mesma
   > forma do item 1: a tela de dentro coerente e a de fora não.
   >
   > **O que mudou:** o passo 1 virou "Suba seu extrato" e descreve o caminho
   > real — exportar PDF, CSV ou OFX pelo app do banco. Ele troca uma promessa
   > falsa por uma verdade mais forte que ela: o arquivo é lido **no próprio
   > navegador** e o servidor recebe só o texto extraído
   > (`lib/extrato/ler-no-navegador.ts`). O passo 2 ganhou "nada entra sem a
   > sua confirmação", que também já era verdade e não estava dita.
   >
   > **A pergunta não foi varrida para debaixo do tapete.** Abaixo dos três
   > passos, um bloco responde "E a conexão automática com o banco?" com
   > *está no plano, mas ainda não existe*. Sumir com o assunto deixaria quem
   > veio pelo recurso sem resposta; dizer que existe é o defeito que se está
   > corrigindo.
   >
   > **Guardado por `scripts/testar-landing.mts`** (sem banco, sem build), e a
   > checagem é amarrada ao código, não à data: ela só exige a copy honesta
   > **enquanto não houver conector** (`app/api/open-finance`, `lib/open-finance`
   > ou dependência de agregador no `package.json`) — no dia em que ele nascer,
   > afrouxa sozinha em vez de virar teste mentiroso pedindo para ser apagado.
   > Também confere que a home não contradiz o `EmBreve` do Ajustes, e que
   > **todo formato citado na home é aceito pelo `accept` da tela de upload** —
   > prometer XLSX na home e não aceitar XLSX na tela é a mesma falha, menor.

3. ~~**🔴 /premium não mostra o preço para quem não assina.**~~ ✅ **14/08/2026.**
   O `valorCentavos` só renderiza no estado de quem já paga
   (`app/(app)/premium/page.tsx:213`). Quem não paga vê vantagens → botão
   "Assinar" → "cobrança mensal pelo cartão", sem valor. Ninguém clica
   "Assinar" às cegas; parece dark pattern.

   > **O campo que existia não servia, e essa é a causa.** `valorCentavos` é o
   > que a Stripe JÁ cobrou daquela pessoa, e mora na linha de `Assinatura` —
   > que só nasce depois do primeiro pagamento. A tela sabia o valor
   > exatamente para quem não precisava mais dele. Não dava para "só mostrar o
   > campo no outro ramo": não havia campo.
   >
   > **O que mudou:** `lib/pagamento/preco.ts` (novo) lê o preço na Stripe pelo
   > `STRIPE_PRICE_ID` — **o mesmo id que `app/api/pagamento/checkout/route.ts`
   > põe no `line_items`**. `/api/pagamento/assinatura` passa a devolver
   > `plano` (valor, moeda, intervalo) para quem não é premium, e `/premium`
   > mostra o valor em destaque logo acima do botão, com a periodicidade e a
   > letra miúda tirando o número da mesma fonte.
   >
   > **A fonte única é o ponto, não um detalhe.** Um preço escrito no código
   > (ou num `NEXT_PUBLIC_PRECO`) começaria certo e ficaria errado no primeiro
   > reajuste feito no painel da Stripe — e o modo de falhar seria anunciar um
   > valor e cobrar outro, que é pior que não anunciar nenhum. Pelo mesmo
   > motivo o "por mês" deixou de ser texto fixo: ele vem do `recurring` do
   > preço, então trocar o plano para anual no painel muda a frase sozinho.
   >
   > **Quando não há preço para afirmar, a tela diz isso.** Stripe fora do ar,
   > variável faltando, preço arquivado, preço em faixas ou de cobrança única:
   > todos caem num estado que avisa que o valor não carregou, lembra que ele
   > aparece no checkout antes de qualquer cobrança e oferece "Tentar de novo".
   > O botão continua funcionando — travar a compra por uma falha de leitura
   > seria um defeito maior que o original.
   >
   > **Guardado em `scripts/testar-pagamento.mts`** (roda sem banco, com
   > `--conditions react-server`): 62 casos, 36 novos. Além da leitura do preço
   > e da formatação (inclusive moeda sem centavos, onde um `/100` fixo erraria
   > por cem vezes), quatro conferências olham o CÓDIGO — que a tela e o
   > checkout leiam a MESMA variável de ambiente, que a rota entregue o plano,
   > que não exista `R$` escrito à mão na tela e que a letra miúda não afirme
   > "mensal" por conta própria. Nada disso quebra build, typecheck ou lint:
   > um preço errado na tela compila perfeitamente e só se revela na fatura de
   > alguém.
   >
   > **O que continua em aberto, e é decisão sua:** o preço só é visível para
   > quem está logado — `/premium` é tela de dentro do app. A landing segue sem
   > página de preços, e o FAQ ("Vai ter custo?") continua descrevendo o modelo
   > sem citar valor. Publicar o número na home é escolha comercial, não
   > conserto de defeito, e não entrou aqui por isso.

4. **🟠 Cadastro com fricção** (revisado 16/08: metade caiu; a metade de código
   fechou em 18/08). A data de nascimento GANHOU o porquê na tela ("adequar o
   conteúdo à idade e menores nunca verem anúncio", V2-1). ~~O subtítulo que
   fala "trilha" antes de a pessoa saber o que é~~ ✅ **18/08/2026.** Segue
   pendente só o que não é código: as chaves OAuth do Google na Vercel (o botão
   se esconde sem elas).

   > **O defeito era de ordem, não de palavra.** A pessoa chega da home tendo
   > lido "extrato", "painel" e "IA", e a primeira tela em que ela decide se
   > entra descrevia a conta com a única palavra que ela ainda não podia
   > conhecer. O subtítulo passou a dizer o que a conta guarda, no vocabulário
   > que ela acabou de ler: *"Pra guardar seu painel, suas metas e as conversas
   > com a IA. Criar conta é de graça."* O "de graça" já estava no CTA da home
   > e sumia justo na hora de decidir.
   >
   > **O rótulo do apelido tinha o mesmo defeito e caiu junto**: "Como você
   > quer aparecer **na liga**?" virou "no ranking", que é o que a versão de
   > quem chega por convite já dizia ("ranking da sala"). O campo é o mesmo,
   > opcional e sempre visível, como a decisão de 14/08 registrou; mudou só a
   > palavra que ninguém de fora entende.
   >
   > **Guardado por `scripts/testar-landing.mts`** (sem banco, sem build), que
   > passou a cobrir o outro lado da porta: recusa jargão de dentro do app na
   > copy de `/login` e `/cadastro` (trilha, liga, XP, ofensiva, combo, baú,
   > corredor, missão, módulo, bloco, Finlo Coins), confere que **celular e
   > apelido continuam opcionais** (fricção só volta com decisão registrada),
   > que a data de nascimento continua com o porquê à vista e que o botão do
   > Google segue perguntando ao servidor se está ligado. A varredura ignora
   > classe, estilo e rota: guard que acusasse `router.push("/trilha")` como
   > jargão de tela treinaria quem viesse depois a desligá-lo. Conferido contra
   > o código mutilado.
   >
   > **Correção de 20/08/2026, no próprio guard.** A borda de palavra era `\b`,
   > que é ASCII e erra dos dois lados quando há acento: depois do "ú" de "baú"
   > ele não vê fronteira nenhuma (a checagem dessa palavra nascia **sempre
   > verde**), e antes do "ç" de "ligações" ele vê uma que não existe (a Liga
   > seria acusada numa frase que não fala dela). As onze expressões passaram a
   > sair de um helper com `\p{L}\p{N}`, e os dois casos viraram teste. Guard
   > que não acusa parece resolvido; guard que acusa o que ninguém escreveu
   > ensina a desligá-lo.
   >
   > **A metade que sobrou é passo de painel, não de código.** Sem
   > `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` na Vercel o provider não é
   > registrado, e o botão some em vez de levar a uma tela de erro do NextAuth
   > (a pessoa concluiria que a conta dela é que tem problema). No dia em que
   > as chaves entrarem, ele aparece sozinho.

5. ~~**🟠 Imagem quebrada em toda ficha de módulo.**~~ ✅ **13/08/2026** (Fin
   1): o fallback virou o Fin professor num bloco surface — o
   `/placeholder.svg` fantasma saiu do caminho. Thumbnails reais seguem
   sendo conteúdo a produzir.

6. ~~**🟠 Chat sem streaming.**~~ ✅ **17/08/2026.** A resposta chegava inteira
   depois de segundos de pontinhos (`components/chat/ChatIA.tsx`). A régua do
   público é ChatGPT: texto aparecendo em ~1s. Bônus: o placeholder dizia "solte
   o extrato aqui", mas não havia handler de drag-and-drop — o gesto sugerido
   não funcionava.

   > **O obstáculo era o formato, e é ele que explica o desenho.** O assistente
   > responde em JSON (`{"texto": ..., "cards": [...]}`) porque a tela precisa
   > separar texto de card, de lançamento e de proposta de teto. JSON não é
   > legível pela metade: enquanto o modelo escreve, o que trafega é
   > `{"texto": "Você gastou R$ 4` — e `JSON.parse` disso é erro de sintaxe até
   > o último byte. Por isso o jorro não é "ligar uma flag": é
   > [`lib/resposta-parcial.ts`](../lib/resposta-parcial.ts), que lê o pedaço já
   > chegado e devolve **só o que dá para afirmar**.
   >
   > **Ele se recusa a adivinhar, e cada recusa tem um caso concreto.** Escape
   > cortado no meio (`"caf\u00e`) espera o resto, senão a bolha mostra `\u00e`
   > cru; meio par substituto de emoji espera o par, senão vira o losango de
   > interrogação; e o varredor conta chaves para só aceitar `texto` no nível de
   > cima — **o card de recomendação e o de lembrete têm um campo chamado
   > `texto`**, e a ordem das chaves é do modelo, não nossa. Uma busca ingênua
   > mostraria o texto do card na bolha da resposta.
   >
   > **O que NÃO foi adiantado:** card, lançamento e teto continuam saindo só no
   > fim, pelas mesmas validações. Proposta de lançamento pela metade seria
   > proposta errada, e ela leva a gravar dinheiro no Painel de alguém.
   >
   > **A trava de conteúdo continua de pé, e essa era a pergunta de verdade.**
   > Ela roda a cada pedaço, no texto acumulado JÁ COM o acréscimo — então um
   > termo proibido que se completa no meio do caminho trava o fluxo **antes** de
   > o pedaço sair. E o texto validado do fecho SUBSTITUI o que apareceu em
   > pedaços, em vez de somar com ele: se a resposta for barrada, o que fica na
   > tela é a recusa, não o que já tinha começado a aparecer.
   >
   > **Um fecho de turno só.** Memória gravada, recomendação que entra na trilha,
   > histórico da conversa e cota são o mesmo código para os dois modos de
   > entrega — duas cópias divergiriam no primeiro campo acrescentado de um lado
   > e esquecido do outro, e quem usasse o chat pelo caminho novo simplesmente
   > deixaria de ter a conversa guardada, sem erro nenhum.
   >
   > **O que a rede pode estragar, está dito no cabeçalho:** `no-transform` e
   > `X-Accel-Buffering: no`, senão um proxy junta os pedaços "para otimizar" e
   > devolve tudo no fim — exatamente o defeito que se está corrigindo, agora sem
   > ninguém ver por quê. Se mesmo assim o jorro não passar, a tela lê o corpo
   > como JSON e mostra a resposta inteira, como antes.
   >
   > **O gesto sugerido passou a funcionar.** `onDragOver` com `preventDefault`
   > (é ele que permite o drop — sem ele o navegador ABRE o arquivo numa aba e a
   > conversa vai embora), aviso "Solta aqui que eu leio" enquanto o arquivo
   > paira, e clipe e arrastar caindo no mesmo caminho de leitura.
   >
   > **Guardado por `scripts/testar-jorro.mts`** (sem banco, sem build, sem
   > chamar a Vertex): 34 casos, conferidos contra o código mutilado — tirar a
   > contagem de chaves, o corte do meio-emoji ou a ordem da trava faz o teste
   > acusar. Metade dele olha o CÓDIGO das duas pontas, porque streaming é
   > contrato entre dois arquivos que ninguém compila junto: se a tela parar de
   > pedir jorro ou a rota parar de responder em SSE, o chat volta calado para os
   > pontinhos e tudo continua "funcionando".

7. ~~**🟡 Botão "Enviar para a IA reordenar" promete o que não faz.**~~
   ✅ **19/08/2026.** Ele só abre o chat com a mensagem pronta
   (`components/trilha-visual/DrawerModulo.tsx`). Se a IA responder "não dá",
   virava botão de mentira. O problema era a promessa, não a mecânica.

   > **O rótulo passou a dizer o que o toque faz:** "Pedir pro assistente", com
   > uma linha embaixo, "Abre o chat com essa pergunta pronta". Quem decide se
   > dá para adiantar continua sendo a resposta do assistente, e agora a tela
   > não decide isso antes dele.
   >
   > **Nada da mecânica mudou** e isso é a escolha: `confirmarNecessidade`
   > continua montando a pergunta com o motivo escolhido e navegando para
   > `/chat`. Construir a reordenação de verdade era o outro caminho, e não é
   > correção de defeito — é frente nova, com decisão de produto por trás
   > (quem pode furar o corredor, e sob qual critério).
   >
   > **Guardado por `scripts/testar-copy.mts`**, e a checagem é amarrada à
   > mecânica, não à data: ela só exige o rótulo honesto **enquanto** o toque
   > for navegação para o chat. No dia em que existir rota que reordena, ela
   > afrouxa sozinha em vez de virar teste mentiroso pedindo para ser apagado.

8. **🟡 Cheiro de beta + sem experiência de app** (revisado 16/08: metade
   caiu). O manifest/PWA EXISTE desde 13/08 (`app/manifest.ts`, Fin 1); e os
   "em breve" do Menu caíram de seis pra quatro (foto e personalidade
   viraram recurso de verdade). Push notification segue sem existir.

9. **🟢 Deslizes pequenos** (revisado 19/08). (a) ~~"Prefiro olhar o app
   sozinha" com flexão feminina fixa~~ ✅ 19/08: virou "Prefiro olhar o app
   **por conta própria**", que diz o mesmo sem flexionar e sem precisar de
   "(a)". A varredura achou o espelho do deslize na landing ("Gráficos que você
   precisa interpretar **sozinho**", masculino fixo), e ele caiu no mesmo
   commit — eram os dois únicos casos em `app/` e `components/`. Guardado por
   `scripts/testar-copy.mts`, que pega a palavra flexionada **só** quando a
   pessoa é o sujeito: "a energia volta sozinha" passa, porque ali a
   concordância está certa e guard que acusa frase correta só ensina a
   desligá-lo; (b) ~~accept do chat sem
   `.qif`/`.txt`~~ ✅ 16/08, uma linha; (c) ~~a cota em tokens é conta de
   padaria, a pessoa quer "quantas perguntas ainda tenho"~~ ✅ **20/08**: o
   destaque de `/premium` virou "Dá para mais umas 12 perguntas de cerca de
   15", e a conta em token continua logo abaixo, inteira; (d) ~~Menu ×
   Ajustes~~ ✅ com o redesign, a tela diz "Menu" como a aba.

   > **A contagem NÃO mudou de moeda, e isso é o ponto.** Contar em token é
   > decisão registrada da fundadora (mensagem não mede nada: três palavras e
   > vinte turnos sobre o extrato inteiro contam igual, e é o segundo que
   > custa). O guard, a soma e o teto seguem em token; quem mudou foi a tela,
   > que dividia mal a informação e não dividia o número.
   >
   > A divisão mora em `lib/pagamento/perguntas.ts`, puro e sem `server-only`
   > (a tela que mostra é de cliente). `TOKENS_POR_PERGUNTA` é 8 mil, a ponta
   > **alta** da faixa de custo de um turno: a estimativa erra para menos, e
   > quem lê "cerca de 12" costuma conseguir mais. Errar para mais seria
   > prometer conversa que a cota não paga. A conta fecha com a régua original
   > do plano: 120.000 / 8.000 = 15 mensagens.
   >
   > **O piso de 1 pergunta é regra, não arredondamento.** O guard roda antes
   > da chamada, então quem tem qualquer sobra ganha a próxima resposta
   > inteira, mesmo estourando o teto (está escrito em `lib/pagamento/tokens.ts`
   > e é de propósito). Uma tela dizendo "restam 0 perguntas" com o chat ainda
   > respondendo trocaria a conta de padaria por uma mentira, que é pior.
   >
   > **Guardado em `scripts/testar-pagamento.mts`** (sem banco, com
   > `--conditions react-server`): 79 casos, 13 novos, conferidos contra o
   > código mutilado — tirar o piso faz dois deles acusarem. Dois olham o
   > CÓDIGO da tela: que ela use o módulo em vez de repetir a divisão (duas
   > cópias discordariam no primeiro ajuste do número) e que o total em token
   > continue visível, para "consertar o item 9c" nunca virar "esconder o
   > número".

**O que segurou o usuário (não mexer):** onboarding pulável com aceites
explicados, "nada entra sem confirmar", tom sem culpa, tema escuro + paleta,
exportar/apagar dados em dois toques, estado vazio do chat com sugestões.

---

## Branches paralelas conferidas (24/08/2026)

Nove branches estavam abertas fora da `main`, e **três itens deste backlog
tinham mais de uma solução pronta ao mesmo tempo**. Nenhuma delas foi mesclada
em cima da outra: duas seções deste arquivo descrevendo a mesma tela é
exatamente o que a regra da pasta existe para impedir, e quatro rotas de
exportação seria pior ainda. O que foi feito com cada uma:

| Branch | Item | Destino |
|---|---|---|
| `claude/dazzling-galileo-zvk92q` | Exportação LGPD | **Consolidada e mesclada.** Virou a versão única, com o que as outras três acharam |
| `claude/dazzling-galileo-2k5vjn` | Exportação LGPD | Superada: o que ela viu de único (`Indicacao` fora de qualquer lista, a fonte de cada seção declarada) entrou na consolidada |
| `claude/dazzling-galileo-qub9gg` | Exportação LGPD | Superada: dela vieram a lista de espera, as três tabelas da escola e a checagem de filtro por dono |
| `claude/dazzling-galileo-ubibgp` | Exportação LGPD | Superada: dela veio o `lidoPor` por seção |
| `claude/dazzling-galileo-ixth9w` | Perfil: dinheiro no topo | **Mesclada** como base do bloco de dinheiro |
| `claude/dazzling-galileo-qstm3a` | Perfil: dinheiro no topo | Superada: dela vieram as conferências de código amarradas ao produto |
| `claude/zealous-turing-e1n19t` | Perfil: dinheiro no topo | Superada: dela veio a guarda contra resposta velha em cache |
| `claude/dazzling-galileo-7hwagc` | Cadastro sem jargão | **Já estava na main** (entrou em 18/08 por outra branch, com a mesma copy palavra por palavra) |
| `claude/zealous-turing-fav2pl` | Objetivos | **Não mesclada, de propósito.** É uma versão anterior ao Redesign Fin v2: renomearia `meta`/`guardado` no schema e trocaria a tela entregue. Fica como fonte para a pendência de remover/editar objetivo |

**A convergência foi quase total, e as diferenças é que valeram a leitura.** As
quatro branches de exportação chegaram sozinhas à mesma forma (lista em arquivo,
teste contra o `schema.prisma`, conversa sem teto), e as três do Perfil à mesma
recusa de chamar o número de "saldo". O que cada uma enxergou de diferente virou
a versão final — inclusive um defeito: a checagem de "toda consulta filtra pelo
dono" nasceu olhando uma janela de caracteres que vazava para a consulta
seguinte, e aprovava uma leitura sem filtro por causa do `userId` do vizinho.
