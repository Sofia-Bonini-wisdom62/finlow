# Estado do produto — promessa do plano × código

Matriz viva: cada promessa do Plano de Negócios 2026–2029 e o que existe DE
VERDADE no repositório. Atualizar a cada entrega — este arquivo existe para a
documentação nunca mais divergir do produto (o README passou meses descrevendo
um app para adolescentes que já não existia).

Legenda: ✅ pronto · 🔧 em desenvolvimento · 📋 planejado · 🚫 fora deste repo

Última revisão: 06/08/2026 — Objetivos financeiros entregues, primeiro item do
[`backlog-produto.md`](backlog-produto.md) a sair da fila. A trilha de Ensino
Médio segue portada e semeada atrás do gate de público (seção própria abaixo), e
as cinco fases do script do Plano 2026–2029 seguem entregues.

## Núcleo

| Promessa | Status | Onde |
|---|---|---|
| Chat com IA sobre os números reais da pessoa | ✅ | `app/api/chat`, `lib/ia.ts` |
| Leitura de extrato PDF/CSV/OFX no navegador | ✅ | `app/(app)/extrato`, `lib/extrato/` |
| Validação aritmética do extrato (saldos diários) | ✅ | `lib/extrato/saldos-diarios.ts` |
| Nada entra confirmado sem toque da pessoa | ✅ | `Transacao.confirmado @default(false)` |
| Painel de lançamentos + contas fixas | ✅ | `app/(app)/painel` |
| Objetivos: alvo, prazo e quanto já separou | ✅ | `app/(app)/objetivos`, `lib/objetivo-repo.ts` |
| Análises (gráficos, categorias, tetos, saúde) | ✅ | `app/(app)/analises` |
| Onboarding conversacional + pipeline de 6 passos | ✅ | `app/(app)/onboarding`, `lib/onboarding/pipeline.ts` |
| Memória do assistente (opt-in, cifrada, apagável) | ✅ | `lib/memoria-repo.ts`, `/memoria` |
| Trilha como biblioteca por situação + nível | ✅ | `lib/situacoes.ts`, `lib/posicionar-trilha.ts` |
| 43 módulos (16 T1 reformada + 27 T2) | ✅ | `prisma/modulos-data.ts`, `prisma/modulos-t2.ts` |
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

## Objetivos financeiros (06/08/2026)

A parte do app que fala de futuro: a pessoa escreve o que quer, quanto custa,
para quando, e marca o quanto já separou.

| Promessa | Status | Onde |
|---|---|---|
| Registrar objetivo (nome, emoji, alvo, prazo) | ✅ | `app/(app)/objetivos`, `/api/objetivos` |
| Guardar e tirar valor, com o quanto falta | ✅ | `guardarNoObjetivo()` em `lib/objetivo-repo.ts` |
| Conclusão derivada dos valores, não botão | ✅ | `carimbo()` — alcançou carimba, caiu abaixo descarimba |
| Nome e valores cifrados (AES-256-GCM) | ✅ | mesma regra de Transacao; só `deleteMany` vai direto ao banco |
| Escrita atrás do consentimento do Painel (R8) | ✅ | `checarConsentimento()` no POST/PATCH/DELETE |
| Sai na exportação LGPD e na exclusão de dados | ✅ | `/api/exportar`, `DELETE /api/painel/consentimento` |
| O assistente sabe indicar a tela | ✅ | `lib/app-mapa.ts` + `scripts/testar-mapa.mts` |

**Guardar aqui NÃO mexe no saldo.** `valorGuardado` é marcador de progresso, não
lançamento: o dinheiro já foi contado quando entrou, e descontá-lo de novo faria
a mesma quantia sumir duas vezes do dash. A tela diz isso em uma linha, e o mapa
do assistente também — senão a primeira pessoa que guardar R$ 500 vai achar que
o Painel quebrou.

**Passo de banco antes do deploy:** a tabela `Objetivo` é nova, então
`pnpm db:push` **e** `pnpm db:rls`. O `db push` cria tabela SEM Row Level
Security, e tabela sem RLS no Supabase é leitura aberta pela chave anônima —
ver o cabeçalho de `prisma/seguranca-rls.sql`.

## Fila de produto (06/08/2026)

O que está decidido construir e ainda não começou vive em
[`backlog-produto.md`](backlog-produto.md). A tela de objetivos saiu de lá e
está na seção acima. Duas linhas que continuam na fila mudam o que este arquivo
dizia, e por isso aparecem aqui:

| Tema | Status | Nota |
|---|---|---|
| Open Finance / agregador bancário | 📋 planejado | **Deixou de ser "outra frente" em 05/08/2026.** Estava marcado 🚫 aqui e o README dizia "este repo não toca nesse tema". Passou para o backlog: conectar bancos no app para puxar extrato, saldo, contas fixas. Enquanto não começa, o caminho real de entrada de dados continua sendo o upload de extrato. |
| Trilha em blocos de 4 lições, com sequência travada | 📋 em conflito | Inverte a arquitetura documentada: hoje a trilha é *biblioteca posicionada*, sem bloqueio por sequência (`prisma/schema.prisma`, `lib/situacoes.ts`, `app/trilha/page.tsx`, `backlog-trilha-t2.md`). Decisão legítima, mas quem começar precisa desfazer essa documentação no mesmo commit. |

## Fora deste repo (outra frente — NÃO tocar aqui)

| Tema | Status |
|---|---|
| Gateway de pagamento / paywall / cobrança | 🚫 outra frente |

## Pendências conhecidas

- R1 (política escrita de retenção/privacidade): a engenharia existe
  (consentimento separado, cifra, RLS, exclusão, exportação); falta o texto
  jurídico — base legal, finalidade, prazo de retenção.
- Revisão jurídica (CVM/LGPD) dos módulos que tocam investimento (M09, M10,
  M22–M25) e do M07 (bets).
- Chaves OAuth do Google na Vercel para o botão de login aparecer em produção.
