# Estado do produto — promessa do plano × código

Matriz viva: cada promessa do Plano de Negócios 2026–2029 e o que existe DE
VERDADE no repositório. Atualizar a cada entrega — este arquivo existe para a
documentação nunca mais divergir do produto (o README passou meses descrevendo
um app para adolescentes que já não existia).

Legenda: ✅ pronto · 🔧 em desenvolvimento · 📋 planejado · 🚫 fora deste repo

Última revisão: 07/08/2026 — varredura de resto morto e das portas que ele
deixou abertas (seção *Limpeza* abaixo). Nenhuma funcionalidade mudou de
status; o que mudou foi o que existia por baixo delas. A trilha de Ensino Médio
segue portada e semeada atrás do gate de público, e as cinco fases do script do
Plano 2026–2029 seguem entregues.

## Núcleo

| Promessa | Status | Onde |
|---|---|---|
| Chat com IA sobre os números reais da pessoa | ✅ | `app/api/chat`, `lib/ia.ts` |
| Leitura de extrato PDF/CSV/OFX no navegador | ✅ | `app/(app)/extrato`, `lib/extrato/` |
| Validação aritmética do extrato (saldos diários) | ✅ | `lib/extrato/saldos-diarios.ts` |
| Nada entra confirmado sem toque da pessoa | ✅ | `Transacao.confirmado @default(false)` |
| Painel de lançamentos + contas fixas | ✅ | `app/(app)/painel` |
| Análises (gráficos, categorias, tetos, saúde) | ✅ | `app/(app)/analises` |
| Onboarding conversacional + pipeline de 6 passos | ✅ | `app/(app)/onboarding`, `lib/onboarding/pipeline.ts` |
| Memória do assistente (opt-in, cifrada, apagável) | ✅ | `lib/memoria-repo.ts`, `/memoria` |
| Trilha em corredor: 4 lições por módulo, em sequência | ✅ | `lib/corredor.ts`, `lib/licoes.ts` |
| Tela de fim de lição (XP, tempo, acertos, conceito) | ✅ | `components/trilha/FimDaLicao.tsx` |
| Ordem do corredor personalizada por situação + nível | ✅ | `lib/situacoes.ts`, `lib/posicionar-trilha.ts` |
| 43 módulos adultos (16 T1 reformada + 27 T2) | ✅ | `prisma/modulos-data.ts`, `prisma/modulos-t2.ts` |
| Leva de 4 aulas, gatilho ao fechar, chat troca | ✅ | `lib/recomendacao.ts` |
| Pontos idempotentes + XP proporcional ao acerto | ✅ | `lib/pontos.ts` |
| Ranking opt-in (apelido e pontos, nada mais) | ✅ | `app/api/ranking` |
| Login com Google | ✅ | botão pronto; falta chave OAuth na Vercel |
| Trava de conteúdo impróprio (saída + registros) | ✅ | `lib/conteudo-proibido.ts` |
| Exportar dados (LGPD) + apagar conta em cascade | ✅ | `/api/exportar`, `/api/conta` |
| Cifra AES-256-GCM + RLS em todas as tabelas | ✅ | `lib/cripto.ts`, `prisma/seguranca-rls.sql` |

## Entregas deste script (Plano 2026–2029)

| Fase | Promessa | Status | Onde |
|---|---|---|---|
| 1 | Documentação alinhada ao produto real | ✅ | `README.md`, este arquivo |
| 2 | Programa de indicação (link → cadastro → ativação → pontos) | ✅ | `lib/indicacao.ts`, `/r/[codigo]`, Ajustes |
| 2 | Métrica: % de novos usuários via indicação | ✅ | `/api/ops/metrics`, bloco `produto` |
| 3 | Diagnóstico de Vazamento (motor + página + card) | ✅ | `lib/vazamento.ts`, `/diagnostico`, `/v/[token]` |
| 3 | Entrega única no chat após 1º extrato | ✅ | `/api/chat/novidades`, padrão `entregueEm` |
| 4 | Módulo Avançado atrás de flag (`moduloAvancado`) | ✅ | `lib/plano.ts` + `AVANCADO_BETA_EMAILS` |
| 4 | Consolidação de investimentos (entrada manual) | ✅ | `lib/investimento-repo.ts`, `/api/investimentos`, card no Painel |
| 4 | Projeção de patrimônio 1/5/10 anos | ✅ | `lib/projecao.ts`, card nas Análises |
| 4 | Separação gasto pessoal × trabalho | ✅ | `Transacao.escopo`, filtros no Painel/Análises |
| 5 | Landing B2B + captação de leads | ✅ | `/empresas`, `/api/empresas/lead`, contagem em ops/metrics |

## Trilha de Ensino Fundamental (06/08/2026, semeada em 07/08)

83 módulos e 415 telas em quatro segmentos, cobrindo do 1º ao 9º ano.

| Segmento | Anos | Módulos | Telas | Status |
|---|---|---|---|---|
| `ef12` | 1º e 2º | 5 | 25 | ✅ no banco |
| `ef35` | 3º ao 5º | 22 | 110 | ✅ no banco |
| `ef67` | 6º e 7º | 23 | 115 | ✅ no banco |
| `ef89` | 8º e 9º | 33 | 165 | ✅ no banco |

O conteúdo ficou **seis dias no repositório sem existir no banco**: havia
portador (`portar-ef.mts`) e teste (`testar-ef.mts`), faltava o semeador. Nada
acusou, porque todas as baterias liam arquivo, não banco. `scripts/semear-ef.mts`
fecha o buraco, e `scripts/testar-fonte-x-banco.mts` fecha a **classe** dele:
compara as quatro fontes com o banco e falha quando um módulo existe só de um
lado, ou quando título, subtítulo, ordem, público ou a espinha das telas
divergem. É o que transforma "esqueci de semear" em erro visível em vez de um
produto que discorda do próprio repositório.

Como o resto da trilha escolar, nascem **fora da trilha de quem é adulto**:
`filtroDeModulo()` é allowlist, então segmento novo nunca entra em
recomendação, chat ou corredor sem alguém mudar o público. Desde 11/08/2026
(`f43f36d`), porém, a **biblioteca e o player enxergam tudo**: o adulto pode
explorar e fazer as aulas escolares, valendo 1/4 dos pontos
(`PESO_FORA_DA_TRILHA`, `lib/pontos.ts`). Total no banco hoje: **150 módulos,
801 telas** — a trilha do adulto continua sendo 43; a biblioteca mostra 150.

## Trilha de Ensino Médio (05/08/2026)

24 módulos cobrindo as 47 habilidades de EM da Matriz de Competências de
Letramento Financeiro (Banco Central / Aprender Valor, 2025), na mesma tabela
`Modulo` e atrás de `publico: "em"`.

| Promessa | Status | Onde |
|---|---|---|
| 24 módulos · 120 telas · 47 habilidades declaradas | ✅ | `prisma/modulos-em.ts` |
| Gate de público (as aulas não vazam para o app adulto) | ✅ | `lib/publico.ts`, `scripts/testar-publico.mts` |
| Porte da fonte para o contrato das telas | ✅ | `scripts/portar-em.mts` + `prisma/editorial-em.ts` |
| Faixas de resultado que discriminam de verdade | ✅ | `formula: "valor_direto"`, `scripts/testar-em.mts` |
| `ensino_superior` e `primeiro_emprego` no vocabulário | ✅ | `lib/situacoes.ts` |
| Thumbnails dos 24 | 📋 | `/public/thumbs/` — hoje `null`, o card usa o estado sem imagem |
| Revisão pedagógica humana | 📋 | cobertura da matriz verificada por código; adequação didática, não |
| Decisão de linha de produto (oferta separada?) | ✅ 11/08 | **Finlow para Escolas** — canal B2B escolar com perfis professor/aluno/adm, decidido pela fundadora; escopo em `backlog-produto.md` |

**Ordem que não pode inverter, e custou uma exposição em produção:** coluna
(`pnpm db:push`) → **deploy do código com o filtro** → seed
(`scripts/semear-em.mts --aplicar`). Semear antes do deploy coloca as 24 aulas
num app cujo código ainda não filtra — elas aparecem para todo usuário adulto
até o deploy subir. Foi o que aconteceu em 05/08/2026.

## Finlow para Escolas (11/08/2026, em construção)

Decisão da fundadora: o canal escolar reabre com perfis de professor, aluno e
adm — o escopo completo e as decisões estão em
[`backlog-produto.md`](backlog-produto.md), seção "Finlow para Escolas". A
tabela abaixo acompanha a entrega etapa a etapa; nada aqui vira ✅ sem o
arquivo que prova.

| Etapa | Promessa | Status | Onde |
|---|---|---|---|
| 1 | Schema: `User.publico`, `Modulo.habilidades` e 7 tabelas (Escola, MembroEscola, Turma, MembroTurma, ConviteEscola, CompetenciaProfessor, AcessoTrilhaTurma), todas com RLS e classificadas fora do retrato git | ✅ 11/08 | `prisma/schema.prisma`, `scripts/exportar-banco.mts`, `docs/banco/01-esquema.sql` |
| 2 | Papéis (`vinculoEscolar`, `exigirPapel`) + membro de escola ativa conta como premium (com teto de cota próprio) + `scripts/criar-escola.mts` | ✅ 11/08 | `lib/escola.ts`, `lib/pagamento/acesso.ts` (`decidirAcessoEscolar`, `acessoPremium`), `lib/pagamento/tokens.ts` (`TETO_ESCOLA_TOKENS`), `scripts/criar-escola.mts`, `scripts/testar-escola.mts` |
| 3 | Convites com código (gerar, resgatar no cadastro e em conta existente) + superfície `/escola` mínima | ✅ 11/08 | `lib/convite-escola.ts`, `/convite/[codigo]`, `/convite/aceitar`, `app/api/convite/*`, `app/api/escola/{turmas,convites}`, `app/escola/*`, `scripts/testar-convite.mts`. Fluxo provado no preview: adm → turma → convite → aluno cadastrado caiu na turma com `publico: "em"`, apelido e premium pela escola (`/premium` mostra a origem) |
| 4 | Público por usuário (`publicoDoUsuario`) + corredor escolar sem IA | ✅ 11/08 | `lib/publico.ts`, `lib/corredor.ts` (sequência = ordem dos blocos p/ escolar), `lib/pontos.ts` (`ajustarPorPublico` relativo, com teste), 14 call sites. Provado no preview: aluno de EM vê os 24 módulos em corredor, biblioteca com "Outras trilhas/Trilha adulta", lição paga cheio (2, não 1) |
| 5 | `habilidades` persistido no seed + competências do professor | ✅ 11/08 | Semeadores param de descartar (`semear-ef/em.mts`, re-seed aplicado: 183 EF + 47 EM no banco, `testar-fonte-x-banco.mts` compara); adm concede segmentos em `/escola/professores` (`/api/escola/competencias`), e a competência REDUZ o que o professor cria/concede (`segmentosDoProfessor`, `lib/escola.ts`) — sem competência marcada, vê tudo |
| 6 | Concessão de acesso professor → turma → trilha/bloco/módulo | ✅ 11/08 | `lib/escola-acesso.ts` (turma sem linha = trilha completa; união entre turmas), corredor intersecta e `podeAbrir` recusa no servidor, toggles na página da turma (EF por bloco; EM, sem blocos, por módulo), `/api/escola/turmas/[id]/acessos` com competência conferida. Provado no preview: 2 aulas concedidas → 22 travadas com "Sua turma ainda não liberou esta parte" e POST de progresso recusado com 403 |
| 7 | Ranks escopados (sala/ano/escola) | ✅ 11/08 | `rankingEscolar` (`lib/pontos.ts` — apelido+pontos, mesma disciplina do global; professor liga por turma via `PATCH /api/escola/turmas/[id]`, régua de consentimento própria documentada na função), seção "minha sala" em `/ranking` independente do opt-in global. Pendência LGPD de menores registrada no backlog. Provado no preview: aluno vê a sala, e aluno tentando ligar o rank leva `PAPEL_INSUFICIENTE` |
| 8 | Dashboards de desempenho (professor e adm) | ✅ 11/08 | `lib/escola-desempenho.ts` (só leitura de `ProgressoLicao`/`ProgressoModulo`; denominador = trilha do segmento — aula adulta explorada não conta), tabela na página da turma, detalhe por aluno em `turmas/[id]/aluno/[userId]`, visão geral por turma na home do adm. Nome real nessas telas: superfície interna da escola |

Nenhum código lê os campos novos ainda — os defaults (`publico: "adulto"`,
`habilidades: []`) reproduzem o comportamento de antes da coluna existir, que
é o que torna a etapa 1 segura de aplicar antes do resto.

## Fila de produto (05/08/2026)

O que está decidido construir e ainda não começou vive em
[`backlog-produto.md`](backlog-produto.md). Duas linhas de lá mudam o que este
arquivo dizia, e por isso aparecem aqui:

| Tema | Status | Nota |
|---|---|---|
| Open Finance / agregador bancário | 📋 planejado, **sem trava de documentação** | **Deixou de ser "outra frente" em 05/08/2026.** Estava marcado 🚫 aqui e o README dizia "este repo não toca nesse tema". Passou para o backlog: conectar bancos no app para puxar extrato, saldo, contas fixas. Enquanto não começa, o caminho real de entrada de dados continua sendo o upload de extrato. **Em 11/08/2026 caiu o último resto** (o comentário de `Investimento` no `schema.prisma`): nenhuma decisão registrada é contrariada por começar. O que trava agora é escolher o agregador regulado — contrato, custo por conta e credencial —, que é decisão de produto, não de código. |
| Conferência de duplicata na entrada de dados | ✅ entregue em 11/08/2026 | O extrato compara o que chega com o que já está lançado e confirmado. **Corrigiu defeito de hoje:** sem isso, dois extratos com período sobreposto (o caso comum, já que o corte é de 3 meses) gravavam o trecho comum duas vezes e o dash contava o dobro, sem sinal na tela. Regra em `lib/extrato/duplicatas.ts`, pura e sem banco — `descricao` e `valor` são cifrados com IV aleatório, então a comparação não pode acontecer em SQL. Nunca apaga: descrição igual chega desmarcada, mesmo dia/valor com outro nome chega marcada e sinalizada. É também a metade da ingestão que o conector Open Finance exige e que não depende de qual agregador for escolhido — sincronização diária reentrega a mesma transação por definição. |
| Porta de entrada na landing | ✅ entregue em 12/08/2026 | Item 1 da avaliação UX. A home não tinha nenhum link `Entrar` ou `Criar conta` — quem já tinha conta precisava adivinhar `/login` na barra de endereço — enquanto o FAQ respondia "O Finlow já está disponível? **Ainda não**" com o app inteiro no ar no mesmo domínio, e o Menu do app logado apontava para esse mesmo FAQ. As duas metades caíram juntas porque uma sem a outra fica incoerente. A captura de e-mail deixou de ser lista de espera (o cadastro é aberto, então "avisamos quando abrir" era promessa vencida); `Waitlist`, `/api/waitlist` e a limpeza no delete de conta seguem intactas — mudou só o que a tela promete. Guardado por `scripts/testar-landing.mts`, sem banco. |
| Trilha em blocos de 4 lições, com sequência travada | ✅ entregue em 06/08/2026 | Era "em conflito" com a biblioteca posicionada. Sofia decidiu pelo corredor com a ressalva à vista, escolhendo travar **entre módulos**. A documentação da biblioteca caiu no mesmo commit — este arquivo, `resumo-de-funcao.md`, `backlog-trilha-t2.md`, o comentário de `Modulo.situacoes` e `app/trilha/page.tsx`. |

## Limpeza do pré-pivô (07/08/2026)

O produto pivotou de um app de educação para adolescentes (diagnóstico de 4
perguntas antes do login, trilha por perfil, sem conta) para o assistente
financeiro adulto. O código do produto novo está de pé; o que sobrou do antigo
é que não tinha sido varrido. Três desses restos não eram apenas peso morto —
eram porta aberta.

### Portas que o resto do pré-login deixou aberta

| O que era | Efeito | Correção |
|---|---|---|
| `/api/progresso` aceitava o header `x-user-id` quando não havia sessão, e um `ensureUser` criava a conta `<id>@anon.finlow` na hora | Rota de **escrita sem login**: criar usuário à vontade, gravar progresso na conta alheia sabendo o id, e creditar ponto sem abrir aula nenhuma. Nenhuma tela mandava o header | userId só da sessão; sem sessão, 401 |
| `/api/trilha` e `/api/trilha/[moduloId]` aceitavam `?userId=` como "sessão anônima" | Ler o progresso de qualquer conta passando o id na URL | Parâmetro removido nas duas |
| `/api/cadastro` aceitava `perfilTipo` do cliente, lido do `localStorage` | O diagnóstico que escrevia essa chave foi aposentado no pivô. O que restava no navegador na hora de criar conta só podia ser de **outra pessoa** que o usou antes — e ela entrava com o perfil de um estranho | Campo removido do cliente e do servidor. O perfil é inferido na primeira conversa, depois do cadastro |

A chave `finlow_perfil` no `localStorage` foi eliminada junto: era uma segunda
verdade sobre o perfil (a primeira é `Perfil.tipo`, no banco), sobrevivia ao
logout e alimentava o card de insight do Painel. Ele passou a ler do servidor.

### Arquivos removidos

| Arquivo | Por quê |
|---|---|
| `prisma/seed-data.sql` (93 KB) + `scripts/gen-seed-sql.ts` | Cópia paralela e **desatualizada** do seed da T1, de antes da reforma. Rodar apagava as 16 aulas, levava o `ProgressoModulo` de todo mundo em cascade e reescrevia o conteúdo na versão velha, sem `nivel`/`situacoes`/`tags`. O arquivo do banco em `docs/banco/` faz o mesmo trabalho sem destruir nada |
| `scripts/backfill-spec-v3.mts` | Backfill de uso único, já rodado. Montava a leva inicial **por perfil**, roteamento que a biblioteca posicionada substituiu — rodar hoje corromperia as levas |
| `prisma/migration-card-flow.sql`, `scripts/migrar-identidade.mjs` | Migrações de uso único, já aplicadas. O esquema e as telas atuais são a verdade |
| `lib/usuario-id.ts` | Gerava um id de usuário no `localStorage` "até o auth estar configurado". O auth está configurado desde então; zero importações |
| `components/perfil-card.tsx`, `types/index.ts`, `lib/perfis.ts` | Card e tipos do diagnóstico de 4 perguntas aposentado. `TipoPerfil` estava declarado em quatro lugares; sobrou o de `types/trilha.ts` |
| `components/ui/button.tsx` | Primitivo do shadcn que nenhuma tela importa |

## Fora deste repo (outra frente — NÃO tocar aqui)

| Tema | Status |
|---|---|
| _(nada, no momento)_ | |

> **Pagamento entrou neste repo em 10/08/2026.** Até então esta tabela dizia
> "gateway de pagamento / paywall / cobrança — 🚫 outra frente". Deixou de ser
> verdade: assinatura, checkout, webhook, cancelamento e o limite grátis por
> tokens estão em `lib/pagamento/`, `app/api/pagamento/` e `app/(app)/premium/`.
> Ver `resumo-de-funcao.md` §2.13.

## Premium / cobrança (10/08/2026)

**No ar em modo de teste, não cobrando de verdade.** A chave em uso é `sk_test`;
nada foi cobrado de ninguém. O que existe e está verificado:

| Peça | Estado |
|---|---|
| `Assinatura` + `UsoMensalIA` no banco, com RLS | ✅ |
| Regra de acesso num só lugar (`decidirAcesso`) | ✅ 26/26 casos em `scripts/testar-pagamento.mts` |
| Checkout, webhook, cancelamento, estado | ✅ compilam e estão registrados |
| Limite grátis por tokens, guard antes do Vertex | ✅ |
| Telas `/premium` e `/premium/obrigado` | ✅ |
| Assinatura no `/api/exportar` e cancelada no delete da conta | ✅ |
| **Um checkout de ponta a ponta com cartão** | ❌ **nunca rodou** |
| **Webhook recebendo evento real da Stripe** | ❌ **nunca rodou** |

As duas últimas linhas são o que separa "implementado" de "funciona", e nenhuma
bateria as cobre: exigem cartão e um evento chegando de fora. Antes de cobrar de
alguém de verdade, ver o checklist em `docs/pagamento-antes-de-cobrar.md`.

**Três defeitos do documento de especificação foram corrigidos ao implementar** —
os três da mesma família (campo que a Stripe mudou de lugar) e os três com falha
silenciosa. Estão descritos em `lib/pagamento/stripe.ts`, com teste para cada um.

## Pendências conhecidas

- **`/api/ops/metrics` não tem autenticação nenhuma.** É a única rota logada
  sem porta: qualquer um que saiba a URL lê o id do projeto GCP, o consumo de
  Vertex das últimas 24h e as contagens de produto (indicações, leads B2B).
  Não há dado pessoal ali, e é por isso que não é urgência — mas é métrica de
  negócio na rua, e a correção é uma linha (um segredo em env conferido no
  topo da rota). Fica como decisão, não como conserto silencioso: quem chama
  essa rota hoje precisa saber que vai passar a mandar o segredo.
- **Chat e extrato continuam sem limite de TAXA** — o que entrou em 10/08 foi um
  teto de VOLUME mensal (tokens), que é coisa diferente. O teto limita a conta do
  mês; não impede alguém de gastar a cota inteira em dois minutos, nem protege o
  extrato, que não tem guard nenhum. O limitador (`lib/limite-taxa.ts`) segue só
  na rota de lead B2B.
- **`/api/exportar` não exporta tudo**, apesar do que o comentário no topo dela
  diz. Ficam de fora memórias, conversas do chat, orçamentos, respostas do
  onboarding, eventos de pontuação e insights — e o que falta é justamente o
  mais sensível. O *delete* cobre tudo por cascade; a exportação, não.
  (Assinatura e uso de IA entraram em 10/08; o resto continua de fora.)
- R1 (política escrita de retenção/privacidade): a engenharia existe
  (consentimento separado, cifra, RLS, exclusão, exportação); falta o texto
  jurídico — base legal, finalidade, prazo de retenção.
- Revisão jurídica (CVM/LGPD) dos módulos que tocam investimento (M09, M10,
  M22–M25) e do M07 (bets).
- Chaves OAuth do Google na Vercel para o botão de login aparecer em produção.
- `components/painel/InsightPerfilCard.tsx` escolhe a aula por `ordem`
  cravada no código (1, 2 e 4 de cada arco) e escreve a frase por `switch` nos
  quatro perfis. Funciona porque a T1 tem os quatro arcos com quatro aulas
  cada; renumerar ou aposentar um módulo troca a frase sem quebrar nada, em
  silêncio. É a última peça do app que ainda raciocina por perfil.
