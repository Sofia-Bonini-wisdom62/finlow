# Backlog — curso escolar v2 (card flow v2)

**Estado em 27/08/2026.** O conteúdo existe, está íntegro e está no repositório.
**Ninguém consegue jogá-lo.** Não há player para os seis formatos novos, e por
isso as 321 lições ainda não substituíram nada.

Este documento é a fila entre esses dois fatos. A pedagogia está em
[`arquitetura-pedagogica.md`](arquitetura-pedagogica.md) (as tarefas A–H da §12
são a origem de quase tudo aqui); como o conteúdo é escrito está em
[`agente-de-licoes.md`](agente-de-licoes.md).

---

## O que já está pronto

| Entrega | Onde |
|---|---|
| 321 lições · 107 conceitos · 5.268 itens (963 de reserva) | `prisma/curso/licoes/*.json` |
| Índice de currículo: 107 conceitos, 321 lições, 230 habilidades BCB | `prisma/curso/{conceitos,modulos}.json` |
| Contrato de formato e composição por segmento | `lib/licao/formatos.ts` |
| Validador do contrato, com recálculo de 689 contas | `lib/licao/validar.ts` |
| Carregador + integridade referencial + enunciado repetido entre encontros | `lib/licao/carregar.ts` |
| Portão de conteúdo, sem banco, ~2s | `scripts/validar-licoes.mts` |
| Seed idempotente, simulação por padrão | `scripts/semear-curso.mts` |
| Schema do conteúdo: `Conceito`, `LicaoCurso`, `ItemAvaliativo` | `prisma/schema.prisma` |

**Ainda não rodou contra banco nenhum.** Não há `DATABASE_URL` no ambiente onde
isto foi construído: o seed foi exercitado só em simulação. O primeiro
`--aplicar` continua sendo um passo por fazer — é o item 0 abaixo.

| Entrega (30/08/2026) | Onde |
|---|---|
| Player v2: os 6 formatos, o fluxo e a página (Tarefa B, item 1 abaixo) | `components/curso/`, `app/curso/[licaoSlug]/page.tsx` |
| Rota que serve a fila de uma lição (reserva e item inativo nunca saem) | `app/api/curso/[licaoSlug]/route.ts` |
| Corretor puro por formato, o mesmo para tela e servidor | `lib/curso/corrigir.ts`, `types/curso.ts` |
| Bateria sem banco: os 5.268 itens corrigidos contra o próprio conteúdo | `scripts/testar-curso-player.mts` |

---

## P0 — bloqueiam tudo

### ~~0. Rodar o seed contra o banco real~~ ✅ 30/08/2026
`pnpm db:push && node --import tsx scripts/semear-curso.mts --aplicar`

> **Rodou em 30/08/2026, com autorização explícita da fundadora.** O `db push`
> precisou de `--accept-data-loss`: não por dado de verdade, mas porque a
> integração paralela abandonada (`feat/base-licoes-escolares`, ver
> `estado-do-produto.md`) tinha deixado em produção uma coluna
> `Modulo.formato` cheia do próprio default `"classico"` nas 150 linhas, e o
> Prisma não distingue default de dado. Resultado: `Conceito` 107 ·
> `LicaoCurso` 321 · `ItemAvaliativo` 5.268 (963 de reserva);
> `aplicar-rls.mjs`: as 3 tabelas nasceram abertas e fecharam no mesmo passo,
> 43 tabelas com RLS, nenhuma legível por `anon`. Trilha antiga intocada: 150
> módulos · 801 telas. Em seguida, a lição-piloto (`/curso/quando-a-divida-
> vira-problema`) rodou ponta a ponta **em produção** a 360px: 15 telas, sem
> overflow horizontal, slider da estimativa a 44px, erro bloqueando com o
> foco no "Entendi", acerto avançando sozinho com a âncora na tela seguinte,
> `ordenar` por toque com "Desfazer", "voltar" e "Continuar" ao rever, tela
> final com 93% · 14/15 · "O que ficou". É a prova do "pronto quando" do
> item 1.

O `db:push` é obrigatório antes, e não só pelas tabelas: ele reaplica o RLS, e
**tabela nova nasce legível pela API pública do Supabase** até isso rodar (o
histórico dessa janela está em `scripts/aplicar-rls.mjs` — aconteceu duas vezes
neste projeto). O seed recusa gravar se a tabela não existir, mas não tem como
saber se o RLS foi aplicado.

**Pronto quando:** `Conceito` 107, `LicaoCurso` 321, `ItemAvaliativo` 5.268
(963 com `reserva: true`), e `aplicar-rls.mjs` reportando nenhuma tabela aberta.

### ~~1. Player v2 — os seis componentes (Tarefa B)~~ ✅ 30/08/2026
`binaria`, `escolha3`, `classificar`, `ordenar`, `estimativa`, `fecho`. Um
componente por formato, dirigido pelo JSON de `ItemAvaliativo.conteudo`.

Era **o** bloqueio: sem ele o conteúdo era inalcançável e nenhuma substituição
podia acontecer. `caca_erro` não entrou — nenhuma das 321 lições usa (não há
peças gráficas), e construir componente sem conteúdo é dívida.

> **Entregue em `components/curso/`** (`ItemBinaria`, `ItemEscolha` — que
> também é o `fecho` —, `ItemOrdenar`, `ItemClassificar`, `ItemEstimativa`,
> `ItemRenderer`, `LicaoFlow`), com `app/curso/[licaoSlug]/page.tsx` por
> cima e `app/api/curso/[licaoSlug]` servindo a fila. As restrições viraram
> código, não intenção: `ordenar` e `classificar` são **por toque** (com
> "Desfazer"); todo alvo tem `min-h-11` (44px); o erro **bloqueia** e só sai
> pelo "Entendi" (que recebe o foco, para o teclado não parar); o acerto
> avança sozinho em 400ms e a âncora segue visível 2s na tela seguinte, sem
> bloquear; `card-enter` entrou no bloco de `prefers-reduced-motion` do
> `globals.css`, que já cortava as animações `fin-*`. `estimativa` é
> **slider** (`<input type="range">`, acessível por teclado de nascença) e
> revela gabarito, distância em %, fonte e a conta de `verificacao`, só
> para explicar.
>
> **O que ficou de fora de propósito, e é decisão da arquitetura, não
> esquecimento:** nenhum item pontua (§8/§11); a lição não credita XP, não
> grava progresso e não entra no corredor — isso é a fusão com a trilha
> (item 4) e as caixas (item 2), fila própria. Não há "segunda chance" nem
> combo: o erro já é a aula, e refazer na hora mediria memória da resposta.
>
> **Corretor único**: `lib/curso/corrigir.ts` é puro e serve à tela (o
> feedback) e, quando `TentativaItem` existir (item 6), ao servidor — as duas
> pontas nunca vão discordar do gabarito. `scripts/testar-curso-player.mts`
> monta a resposta certa e uma errada de cada um dos 5.268 itens a partir do
> próprio conteúdo e cobra as duas; roda sem banco em ~2s.
>
> **Pronto quando, conferido:** os 6 renderizam, sem overflow em 360px,
> navegáveis por teclado; a lição de 15 telas roda ponta a ponta contra o
> banco assim que o item 0 (seed) fechar — a página lê `LicaoCurso`, não
> fixture, para que "roda" signifique roda em produção.

### 2. Motor de fixação — caixas de Leitner (Tarefa C)
`lib/fixacao/caixas.ts`: tabela da §6.2, `registrarTentativa()`,
`itensVencidos(userId, limite)`. Puro, testável, sem IA.

Acerto sobe uma caixa; **erro volta para a 1, nunca para a 0** — o conceito já
foi visto, o que falhou foi a retenção. Cada revisão sorteia item **ainda não
visto** daquele conceito, começando pelos de reserva. É para isso que os 963
itens de reserva existem; sem esta peça eles são peso morto no banco.

Traz junto a tabela, que **não foi criada** nesta rodada. O motivo está no
schema, ao lado de `Conceito`: `DominioConceito` é dado do usuário, e
`lib/dados-exportacao.ts` obriga todo modelo ligado a `User` a ser classificado
como exportável ou não — `scripts/testar-exportacao.mts` derruba o build até
alguém decidir. Criá-la sem o motor significaria decidir a portabilidade de um
dado que nada escreve, e fazer a rota entregar array vazio numa tela de
privacidade. O próprio arquivo diz que a hora de decidir é quando alguém sabe a
resposta. Ela é dela — progresso de aprendizagem é dado da pessoa — então a
classificação esperada é **exportar**, com a rota lendo de fato.

```prisma
model DominioConceito {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  conceitoId String
  conceito   Conceito @relation(fields: [conceitoId], references: [id], onDelete: Cascade)

  caixa           Int       @default(0) // 0..5
  acertosSeguidos Int       @default(0)
  proximaRevisao  DateTime?
  primeiroVistoEm DateTime  @default(now())
  ultimoVistoEm   DateTime  @updatedAt

  @@unique([userId, conceitoId])
  @@index([userId, proximaRevisao]) // a consulta da revisão diária
}
```

Do outro lado, `Conceito` recebe `dominios DominioConceito[]`.

**Pronto quando:** teste unitário cobre subir caixa, cair para 1, agendar a
próxima revisão, e não repetir item já visto do mesmo conceito.

---

## P1 — a substituição

> A decisão está tomada: o curso v2 **substitui** a trilha escolar EF/EM atual.
> O que segue é o caminho para fazer isso sem derrubar o que está no ar.

### 3. As 20 colisões de slug
Vinte slugs do curso novo já existem como módulos de Ensino Médio **em
produção**: `quando-a-divida-vira-problema`, `o-preco-do-credito`,
`fonte-confiavel`, `quem-move-a-economia` e outros 16.

Não é acidente — são os mesmos conceitos reescritos no formato novo, ou seja,
são literalmente a substituição. Mas os seeds fazem upsert por slug e recriam
telas, então um seed descuidado em `Modulo` **apaga as 20 aulas vivas**. Foi por
isso que o curso v2 foi para tabelas próprias (o raciocínio inteiro está no
comentário do bloco v2 em `prisma/schema.prisma`).

Decidir, com o player pronto: as 20 antigas saem de circulação, ou convivem
enquanto a conversão roda? A §9 da arquitetura diz converter sem portão.

### 4. Fusão com `Modulo`/`Tela`
A §7 quer a lição v2 como `Modulo`, com `Tela.tipo` valendo o **papel** e
colunas novas `formato`, `conceitoId`, `itemId`, `custoSeg`.

**As colunas novas em `Tela` foram deliberadamente NÃO criadas nesta rodada.**
Este repositório tem cicatriz registrada sobre coluna morta: o comentário de
`Modulo.xp` no schema conta como remover uma coluna sem a ordem certa derrubou
a Trilha inteira por horas. Criar quatro colunas que nada escreve e nada lê,
para um player que ainda não existe, é a mesma dívida com outro nome — e quem
sabe a forma certa delas é o passo que constrói o player.

Junto vem `lib/licoes.ts`: o `agrupar()` decide a lição pelo TIPO da tela, e os
tipos novos (`sonda`, `construcao`, …) não caem em nenhum ramo — escorreriam
todos para o balde de `aplicacao`, montando lições erradas **sem erro nenhum
aparecer**. Precisa tratar os dois vocabulários ou separar os caminhos.

E `lib/publico.ts`: `PUBLICOS` tem `"em"`, o curso tem `em1`, `em2` e `em3`
(§14 — o EM virou três séries). `User.publico` e `Modulo.publico` seguem o
vocabulário antigo. `scripts/testar-publico.mts` é quem cobra.

### 5. Revisão de 60 segundos (Tarefa D)
Faixa no topo da Trilha quando há conceitos vencidos; sessão de até 8 itens
misturados; `EventoPontuacao` com motivo `revisao_diaria` e `refId` = data — a
chave `@@unique([userId, motivo, refId])` que já existe torna infarmável por
construção.

**Item respondido não pontua sozinho** (§8/§11): pontuar resposta transforma a
sequência em caça-níquel e destrói o sinal de nível.

**Pronto quando:** a sessão fecha, as caixas mudam no banco, e rodar duas vezes
no mesmo dia credita ponto uma vez só.

---

## P2 — o que torna o formato mensurável

### 6. Instrumentação (Tarefa G)
Gravar `TentativaItem` com tempo e resposta bruta. As cinco métricas da §10:
ganho intralição (+30 p.p.), retenção D7 em item de reserva (≥70%), abandono no
meio (<20%), tempo real (110–150s), e novo × antigo.

A tabela também **não existe** ainda, pelo mesmo motivo do item 2 — é dado da
pessoa e precisa da decisão de portabilidade junto de quem a escreve:

```prisma
model TentativaItem {
  id     String         @id @default(cuid())
  userId String
  user   User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemId String
  item   ItemAvaliativo @relation(fields: [itemId], references: [id], onDelete: Cascade)

  contexto      String // "licao" | "revisao" | "chat"
  acertou       Boolean
  respostaBruta Json?    // QUAL distrator — é o que acha distrator morto
  msDecorridos  Int?
  criadoEm      DateTime @default(now())

  @@index([userId, criadoEm])
  @@index([itemId, acertou]) // saúde de item e de distrator
}
```

Do outro lado, `ItemAvaliativo` recebe `tentativas TentativaItem[]`.

Sem isto, daqui a três meses a pergunta "o formato novo retém mais?" só tem
resposta por impressão — e as ondas ainda no formato antigo são a linha de base
natural, de graça, que some quando a substituição terminar.

Duas checagens de saúde de conteúdo em cima da mesma tabela: **distrator morto**
(alternativa errada escolhida por <3% em 200 exposições) e **item quebrado**
(acerto <25% ou >95% — sai da rotação sozinho).

### 7. Módulo de revisão gerado (Tarefa E)
Nó de revisão do bloco montado **em tempo de execução** com itens vencidos
daquele bloco. Resolve os ~27 módulos de revisão que ficaram por escrever, com
zero conteúdo novo, e a revisão fica diferente para cada aluno.

**Pronto quando:** dois alunos com históricos diferentes recebem revisões
diferentes do mesmo nó.

### 8. Sinal duro de nível por conceito (§8)
Conceito chegando à **caixa 3** vira +1 sinal; conceito caindo de 4+ para 1 é
sinal negativo e o nível pode **descer**. Acerto isolado dentro da lição não é
sinal — na primeira exposição, acertar quase sempre é reconhecimento.
Motivo novo `conceito_dominado` com `refId` = conceitoId, 15 pontos, uma vez só.

---

## P3 — depois

### 9. Os 16 conceitos da trilha adulta
Não foram produzidos: o conteúdo deles vive só no banco de produção. Mesma
receita de `agente-de-licoes.md`, ~48 lições, ~864 itens.

### 10. Pré-requisito por conceito (§6.4)
Um módulo só trava se depende de conceito em caixa < 2. Dissolve o impasse
corredor × biblioteca, mas exige mapear pré-requisito de conceito antes de
qualquer trava aparecer na tela. `Conceito.preRequisitos` já existe e está
vazio nos 107.

### 11. Gatilho pelo chat (§6.3)
A IA manda **um** item de conceito vencido como card. Máximo 1 por dia, e nunca
no meio de conversa sobre dívida em curso — ninguém quer quiz enquanto pede
socorro.

---

## Lacunas de conteúdo conhecidas

- ~~`quando-a-divida-vira-problema` não tem `fraseConceito`.~~ **Fechada em
  28/08/2026.** A lição-piloto era a única das 321 sem o campo (foi escrita
  antes de ele existir). A frase adotada é a alternativa correta do próprio
  fecho da piloto — "A dívida cresce sozinha pelos juros. Ataque a de maior
  taxa, não a maior." — porque, pela §3 da arquitetura, o fecho JÁ é o card
  salvo em "Meus conceitos": é voz aprovada, não autoria nova. Se a fundadora
  preferir outra formulação, é editar o campo no JSON e re-semear. O aviso do
  validador para o caso segue existindo para a próxima lição que nascer sem
  frase.

## Decisões pendentes (§13 da arquitetura)

| | Pergunta | Por que importa |
|---|---|---|
| D1 | Onde mora a revisão diária: topo da Trilha, card no chat, ou notificação? | Se o chat é a home, a faixa na Trilha só é vista por quem já foi até lá — e quem mais precisa revisar é quem não vai |
| D2 | Revisão gerada substitui os ~27 módulos escritos? | Sim resolve o buraco sem produzir 135 telas; o custo é a revisão deixar de ser auditável como material fixo, o que pesa se uma escola exigir ver impresso |
| D3 | Adotar pré-requisito por conceito? | Encerra a contradição corredor × biblioteca, mas exige o mapa de pré-requisitos antes de qualquer trava |
| D4 | 1 conceito principal + 1 secundário por lição? | O conteúdo produzido tem 299 rótulos de subconceito para 107 conceitos — na prática já são ~2,8 por lição |
| D5 | A voz da lição-piloto está certa? | Ela é o molde que se propagou por 321 lições. Corrigir tom agora custa 5.268 itens |

---

## Nota sobre os dados

`conceitoPrincipal` (na lição) e `ItemAvaliativo.conceitoId` são **rótulos
editoriais, não chaves**. São 299 valores distintos para 107 conceitos, e em 15
lições o `conceitoPrincipal` diverge do slug do módulo por seguir a
lição-piloto. A chave que fecha 107/107 nos dois sentidos é o `slugBase` de
`prisma/curso/modulos.json` — é dele que sai `LicaoCurso.conceitoSlug`. Tratar
qualquer um dos outros dois como FK quebra o seed.
