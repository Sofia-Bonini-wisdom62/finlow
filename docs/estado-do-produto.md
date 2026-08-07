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

## Trilha de Ensino Médio (05/08/2026)

24 módulos cobrindo as 47 habilidades de EM da Matriz de Competências de
Letramento Financeiro (Banco Central / Aprender Valor, 2025), na mesma tabela
`Modulo` e atrás de `publico: "em"`.

| Promessa | Status | Onde |
|---|---|---|
| 24 módulos · 120 telas · 47/47 habilidades | ✅ | `prisma/modulos-em.ts` |
| Gate de público (as aulas não vazam para o app adulto) | ✅ | `lib/publico.ts`, `scripts/testar-publico.mts` |
| Porte da fonte para o contrato das telas | ✅ | `scripts/portar-em.mts` + `prisma/editorial-em.ts` |
| Faixas de resultado que discriminam de verdade | ✅ | `formula: "valor_direto"`, `scripts/testar-em.mts` |
| `ensino_superior` e `primeiro_emprego` no vocabulário | ✅ | `lib/situacoes.ts` |
| Thumbnails dos 24 | 📋 | `/public/thumbs/` — hoje `null`, o card usa o estado sem imagem |
| Revisão pedagógica humana | 📋 | cobertura da matriz verificada por código; adequação didática, não |
| Decisão de linha de produto (oferta separada?) | 📋 | enquanto não houver, `PUBLICO_ATUAL` mantém tudo invisível |

**Ordem que não pode inverter, e custou uma exposição em produção:** coluna
(`pnpm db:push`) → **deploy do código com o filtro** → seed
(`scripts/semear-em.mts --aplicar`). Semear antes do deploy coloca as 24 aulas
num app cujo código ainda não filtra — elas aparecem para todo usuário adulto
até o deploy subir. Foi o que aconteceu em 05/08/2026.

## Fila de produto (05/08/2026)

O que está decidido construir e ainda não começou vive em
[`backlog-produto.md`](backlog-produto.md). Duas linhas de lá mudam o que este
arquivo dizia, e por isso aparecem aqui:

| Tema | Status | Nota |
|---|---|---|
| Open Finance / agregador bancário | 📋 planejado | **Deixou de ser "outra frente" em 05/08/2026.** Estava marcado 🚫 aqui e o README dizia "este repo não toca nesse tema". Passou para o backlog: conectar bancos no app para puxar extrato, saldo, contas fixas. Enquanto não começa, o caminho real de entrada de dados continua sendo o upload de extrato. |
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
| Gateway de pagamento / paywall / cobrança | 🚫 outra frente |

## Pendências conhecidas

- **`/api/ops/metrics` não tem autenticação nenhuma.** É a única rota logada
  sem porta: qualquer um que saiba a URL lê o id do projeto GCP, o consumo de
  Vertex das últimas 24h e as contagens de produto (indicações, leads B2B).
  Não há dado pessoal ali, e é por isso que não é urgência — mas é métrica de
  negócio na rua, e a correção é uma linha (um segredo em env conferido no
  topo da rota). Fica como decisão, não como conserto silencioso: quem chama
  essa rota hoje precisa saber que vai passar a mandar o segredo.
- **Chat e extrato continuam sem limite de taxa.** São as duas chamadas que
  custam dinheiro; o limitador (`lib/limite-taxa.ts`) só está na rota de lead
  B2B. Uma conta abusiva vira conta de Vertex.
- **`/api/exportar` não exporta tudo**, apesar do que o comentário no topo dela
  diz. Ficam de fora memórias, conversas do chat, orçamentos, respostas do
  onboarding, eventos de pontuação e insights — e o que falta é justamente o
  mais sensível. O *delete* cobre tudo por cascade; a exportação, não.
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
