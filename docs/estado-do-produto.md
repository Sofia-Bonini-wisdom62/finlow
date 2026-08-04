# Estado do produto — promessa do plano × código

Matriz viva: cada promessa do Plano de Negócios 2026–2029 e o que existe DE
VERDADE no repositório. Atualizar a cada entrega — este arquivo existe para a
documentação nunca mais divergir do produto (o README passou meses descrevendo
um app para adolescentes que já não existia).

Legenda: ✅ pronto · 🔧 em desenvolvimento · 📋 planejado · 🚫 fora deste repo

Última revisão: 03/08/2026.

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
| 5 | Landing B2B + captação de leads | 📋 | — |

## Fora deste repo (outra frente — NÃO tocar aqui)

| Tema | Status |
|---|---|
| Open Finance / agregador bancário | 🚫 outra frente |
| Gateway de pagamento / paywall / cobrança | 🚫 outra frente |

## Pendências conhecidas

- R1 (política escrita de retenção/privacidade): a engenharia existe
  (consentimento separado, cifra, RLS, exclusão, exportação); falta o texto
  jurídico — base legal, finalidade, prazo de retenção.
- Revisão jurídica (CVM/LGPD) dos módulos que tocam investimento (M09, M10,
  M22–M25) e do M07 (bets).
- Chaves OAuth do Google na Vercel para o botão de login aparecer em produção.
