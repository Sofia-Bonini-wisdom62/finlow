# Estado do produto — promessa do plano × código

Matriz viva: cada promessa do Plano de Negócios 2026–2029 e o que existe DE
VERDADE no repositório. Atualizar a cada entrega — este arquivo existe para a
documentação nunca mais divergir do produto (o README passou meses descrevendo
um app para adolescentes que já não existia).

Legenda: ✅ pronto · 🔧 em desenvolvimento · 📋 planejado · 🚫 fora deste repo

Última revisão: 24/08/2026 — a exportação LGPD passou a entregar TUDO, que é o
que ela sempre prometeu no topo da própria rota (seção *Portabilidade LGPD*
abaixo): memórias, conversas, orçamentos, onboarding, XP, insights, progresso de
lição, ofensiva, perfil e recomendações da trilha entraram, e a lista agora é
dado conferido contra o schema. Antes disso, em 17/08/2026 — a resposta do chat deixou de chegar só no fim
(jorro em SSE), e o "solte o extrato aqui" do campo de escrever virou gesto de
verdade. Na mesma data, uma passada de segurança: as dependências com CVE no
caminho de produção subiram (pdfjs-dist, next-auth, next), o webhook da Stripe
parou de dar premium a boleto não pago, o texto que a pessoa digita passou a ser
escapado antes de virar HTML na trilha, o app ganhou cabeçalhos de segurança, e
o guard de `/api/ops/metrics` passou a falhar fechado. Foi nessa passada que o
✅ de exportar dados ganhou a ressalva que o próprio arquivo já cobrava — a
ressalva que caiu agora, com a lacuna. Antes disso: o assistente deixou de ter uma voz só (seção
*Personalidade do assistente* abaixo). A trilha de Ensino Médio segue portada e
semeada atrás do gate de público, e as cinco fases do script do Plano 2026–2029
seguem entregues.

## Núcleo

| Promessa | Status | Onde |
|---|---|---|
| Chat com IA sobre os números reais da pessoa | ✅ | `app/api/chat`, `lib/ia.ts` |
| Resposta aparecendo enquanto é escrita (SSE), com card e proposta só no fim | ✅ 17/08/2026 | `lib/resposta-parcial.ts`, `app/api/chat`, `scripts/testar-jorro.mts` |
| Arrastar extrato ou comprovante para dentro da conversa | ✅ 17/08/2026 | `components/chat/ChatIA.tsx` |
| Leitura de extrato PDF/CSV/OFX no navegador | ✅ | `app/(app)/extrato`, `lib/extrato/` |
| Validação aritmética do extrato (saldos diários) | ✅ | `lib/extrato/saldos-diarios.ts` |
| Nada entra confirmado sem toque da pessoa | ✅ | `Transacao.confirmado @default(false)` |
| Painel de lançamentos + contas fixas | ✅ | `app/(app)/painel` |
| Análises (gráficos, categorias, tetos, saúde) | ✅ | `app/(app)/analises` |
| Onboarding conversacional + pipeline de 6 passos | ✅ | `app/(app)/onboarding`, `lib/onboarding/pipeline.ts` |
| Memória do assistente (opt-in, cifrada, apagável) | ✅ | `lib/memoria-repo.ts`, `/memoria` |
| Personalidade do assistente (5 tons + campo livre cifrado) | ✅ | `lib/personalidade.ts`, `/personalidade` |
| Trilha em corredor: 4 lições por módulo, em sequência | ✅ | `lib/corredor.ts`, `lib/licoes.ts` |
| Tela de fim de lição (XP, tempo, acertos, conceito) | ✅ | `components/trilha/FimDaLicao.tsx` |
| Ordem do corredor personalizada por situação + nível | ✅ | `lib/situacoes.ts`, `lib/posicionar-trilha.ts` |
| 43 módulos adultos (16 T1 reformada + 27 T2) | ✅ | `prisma/modulos-data.ts`, `prisma/modulos-t2.ts` |
| Leva de 4 aulas, gatilho ao fechar, chat troca | ✅ | `lib/recomendacao.ts` |
| Pontos idempotentes + XP proporcional ao acerto | ✅ | `lib/pontos.ts` |
| Ranking opt-in (apelido e pontos, nada mais) | ✅ | `app/api/ranking` |
| Login com Google | ✅ | botão pronto; falta chave OAuth na Vercel |
| Trava de conteúdo impróprio (saída + registros) | ✅ | `lib/conteudo-proibido.ts` |
| Exportar dados (LGPD) + apagar conta em cascade | ✅ 24/08/2026 | `/api/exportar`, `/api/conta` — a exportação passou a cobrir tudo, com a lista conferida contra o schema (`lib/dados-exportacao.ts`, `scripts/testar-exportacao.mts`) |
| Apagar dados financeiros, com a lista conferida contra o schema | ✅ 10/08/2026 | `lib/dados-financeiros.ts`, `lib/apagar-financeiro.ts` |
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
| 9 | Superfície da operação (`/ops`): criar e suspender escola pela tela, gerir membros, revogar convite, contas de aluno em lote | ✅ 18/08 | `lib/ops.ts` + `lib/ops-lista.ts` (allowlist `OPS_EMAILS`, falha fechada, 404 para quem não está), `lib/ops-escola.ts` (regra compartilhada com `scripts/criar-escola.mts`), `app/ops/*`, `app/api/ops/{escolas,convites}/*`, `scripts/testar-ops.mts` (37 conferências). Fecha quatro buracos que só o Prisma Studio resolvia: trocar papel, remover membro, designar professor de turma e escrever `revogadoEm`. Detalhe em `resumo-de-funcao.md` §2.17 |
| 9.1 | Cadastro e edição de pessoa no `/ops`: adicionar professor ou aluno sem convite, editar nome, login e turma, sortear senha nova | ✅ 18/08 | `adicionarPessoa`, `editarMembro`, `redefinirSenha` e `normalizarNome` (`lib/ops-escola.ts`), `POST /api/ops/escolas/[id]/membros`, `PATCH` estendido em `membros/[userId]`, `POST membros/[userId]/senha`, `components/ops/{AdicionarPessoa,ListaDeMembros}.tsx`. `gravarAluno` passa a ser a única cópia das três escritas que criam aluno (vínculo, turma e `publico`), compartilhada com o lote. Bateria vai a 50 conferências |

Nenhum código lê os campos novos ainda — os defaults (`publico: "adulto"`,
`habilidades: []`) reproduzem o comportamento de antes da coluna existir, que
é o que torna a etapa 1 segura de aplicar antes do resto.

> ⚠️ **A etapa 9 traz uma exceção com risco assumido.** A criação de contas de
> aluno em lote (nome vira login `@dominio.invalid` + senha temporária) foi
> pedida pela fundadora em 18/08/2026 para o Fundamental 1, onde a criança não
> tem e-mail. Ela **não resolve** a pendência de LGPD de menores registrada no
> backlog: resolve o bloqueio operacional e aumenta a dívida jurídica, porque o
> Finlow passa a guardar nome de criança e a escola passa a conhecer a senha
> inicial de cada aluno. Validar com advogado antes de escola real.

## Redesign Fin (13/08/2026, em construção)

Protótipo da fundadora: o miolo gamificado (trilha, player, resultado, liga,
perfil do jogador, loja) ganha identidade própria — navy #0C1B21 + dourado
#E9A63C + Nunito + o mascote **Fin** — e as mecânicas do backlog de
gamificação. Decisões dela (13/08): tudo que foi desenhado entra; **energia
limita só usuário grátis sem vínculo de escola**; liga semanal e dashboard do
professor por métrica (G-17) ficam de fora; os caminhos sem design novo
(chat, painel, etc.) permanecem na identidade atual até ela desenhar.

| Etapa | Promessa | Status | Onde |
|---|---|---|---|
| 1 | Tema `.tema-fin` escopado (reaponta `--finlow-*`), Nunito, 24 poses do Fin, manifest PWA, fallback de thumbnail | ✅ 13/08 | `app/globals.css`, `lib/fin.ts`, `public/fin/`, `app/manifest.ts` |
| 2 | Servidor do jogo: `EventoCoins` (ledger = estado), energia com recibo, missões derivadas, combo que atravessa lições, nível, loja, baú, conquistas + `/api/jogo/*` | ✅ 13/08 | `lib/{energia,coins,missoes,combo,nivel,loja,bau,conquistas}.ts`, `scripts/testar-jogo.mts` |
| 3 | Player Fin: quiz com bolha do Fin + chip de combo, botões 3D, débito/devolução de energia, poção/coins no POST, FimDaLicao com anel de precisão %, tela de energia zerada | ✅ 13/08 | `components/trilha/*`, `app/api/trilha/[moduloId]`, `app/api/progresso`. Provado no preview: aluno isento fez lição valendo +5 e +10 coins com anel 100%; conta grátis com 3⚡ levou a tela de recarga SEM recibo, e com 24⚡ pagou 4 uma vez só |
| 4 | Trilha Fin: header com chips (chama/energia/coins/avatar), cards de unidade coloridos, nós 3D com estrela e tooltip COMEÇAR, baú no caminho (blocos escolares), pop-up diário via `diaNovo`, intro do Fin (3 slides, 1ª visita) | ✅ 13/08 | `lib/trilha-visual.ts`, `components/trilha-visual/*`, `components/trilha-visual/fin/*`, `lib/ofensiva.ts`. ⚠️ Lacuna conhecida: EM não tem `blocoId`, então aluno de EM não vê baú (nem por leva — não tem leva); registrar solução na próxima rodada |
| 5 | Perfil do jogador (`/trilha/perfil`: nível, tiles, missões com resgate, conquistas derivadas, recorde de ofensiva — nunca exibido antes) + Loja do Fin (`/trilha/loja`: poção ×2 e avatares) | ✅ 13/08 | `app/trilha/{perfil,loja}/page.tsx`, `components/trilha-visual/fin/{MissoesFin,LojaFin}.tsx`. Provado no preview: aluno resgatou 2 missões (20→45 coins), comprou a poção (45→5) e a lição seguinte saiu com "Poção ×2 aplicada" e módulo completo |
| 6 | Liga (restyle do ranking no tema Fin: medalhas, avatar, destaque da própria linha, card do Fin com a distância pro 1º — mecânica INTACTA) + relatório de pendências de design no backlog | ✅ 13/08 | `app/(app)/ranking/page.tsx`, `docs/backlog-produto.md` seção "Redesign Fin" |
| 7 | Landing na identidade Fin (protótipo v2, 14/08): mesma estrutura e copy, navy+dourado+Nunito, Fin no lugar dos mockups, botões 3D, card Finlow para Escolas, passo 1 honesto ("suba seu extrato" — cai a promessa de conexão automática, item 2 da avaliação de UX) | ✅ 14/08 | `app/page.tsx`, `components/landing/{Faq,WaitlistForm}.tsx`. O restante do protótipo v2 (todas as telas do app) está catalogado como fila em `backlog-produto.md`, seção "Redesign Fin v2" |
| V2-1 | Login, Cadastro e 1ª conversa no tema Fin + `User.celular` (opcional, só dígitos, na exportação) + apelido sempre visível no cadastro + `tema-fin` no layout de `(app)` remapeando `--fl-*` (todas as telas logadas nascem navy+dourado; refino tela a tela por cima) | ✅ 14/08 | `app/(auth)/{login,cadastro}/page.tsx`, `app/api/cadastro`, `components/auth/BotaoGoogle.tsx`, `app/(app)/{layout,onboarding/page}.tsx`, `app/globals.css`, `prisma/schema.prisma`. Provado no preview: cadastro salvou celular mascarado como dígitos e apelido; chat e painel sem nenhum fundo claro sobrando |
| V2-2 | Chat com cabeçalho do Fin (chama da ofensiva via `lerOfensiva`, avatar nas bolhas da IA, sugestões em pill, enviar 3D) + Menu com card de perfil e badge FREE/FINLOW+ (`/api/conta` ganhou `premium`). Seção Aparência REMOVIDA: o `.tema-fin` ignora tema/paleta, e controle morto engana | ✅ 14/08 | `components/chat/ChatIA.tsx`, `app/(app)/{chat,ajustes}/page.tsx`, `app/api/conta`. Provado no preview: bolha do usuário dourada com texto navy, avatar `cat-point` ao lado da resposta, badge FREE na conta grátis |
| V2-3 | Toggle Controle/Análises vira NAVEGAÇÃO entre /painel e /analises (`ToggleControleAnalises`; a aba interna do Painel morreu e os cards únicos dela — gasto médio por dia, insight do perfil — mudaram-se para /analises). Painel ganhou CTA "Subir extrato" 3D; Extrato com confirmação 3D e checkboxes douradas | ✅ 14/08 | `components/painel/ToggleControleAnalises.tsx`, `app/(app)/{painel,analises,extrato}/page.tsx`. Provado no preview: toggle navega nos dois sentidos com a aba ativa dourada; `DistribuicaoGastosChart` só não renderiza mais (arquivo fica pelo `agruparPorCategoria`) |
| V2-4 | Objetivos (tela nova): modelo `Objetivo` cifrado (nome/meta/guardado), `lib/objetivo-repo.ts` com retentativa otimista no incremento, `/api/objetivos` (GET livre; POST/PATCH atrás do consentimento R8), tela com cores por card e aviso do Fin, entrada no Menu, exportação LGPD e `exportar-banco` | ✅ 14/08 | `prisma/schema.prisma`, `lib/objetivo-repo.ts`, `app/api/objetivos`, `app/(app)/objetivos/page.tsx`, `app/api/exportar`, `scripts/exportar-banco.mts`. Provado no preview: criar meta R$ 200, rajada de "+ Guardar R$ 50" credita os 4 sem perder toque, card vira "Alcançado ✓". SEM remover/editar — pendência de design no backlog. ⚠️ **O passo fixo de R$ 50 caiu em 28/08/2026** (pedido da fundadora): ver a linha *Objetivos: quanto guardar virou campo livre*, abaixo |
| V2-5 | Cinco restyles: Perfil financeiro com cabeçalho de jogo (nível/XP via `nivelDoTotal`, tiles de chama/XP/precisão, card de Objetivos — a API `perfil-financeiro` ganhou `sequencia`, `precisaoSemana` e resumo de objetivos, tudo acessório que falha em ausência), Diagnóstico com Fin no hero, Premium "Finlow+" com Fin e "energia infinita" na lista (agora é verdade), Biblioteca vestida (`tema-fin` na rota fora do grupo), Memória com knob navy. Missões/conquistas seguem SÓ em /trilha/perfil | ✅ 14/08 | `app/(app)/{perfil,diagnostico,premium,memoria}/page.tsx`, `app/trilha/biblioteca/page.tsx`, `app/api/perfil-financeiro`. Provado no preview: Nível 1 + barra + tiles no perfil, fin-streak e CTA 3D no Finlow+, biblioteca navy+Nunito |
| V2-6 | Escola no tema Fin (`tema-fin` no layout de /escola, turmas com inicial colorida) + métrica "1ª passada × após correção": `ProgressoLicao.acertosRevisao`/`totalQuizRevisao`, a 1ª conclusão vira pedra e refazer grava na revisão (POST /api/progresso distingue pelas linhas já concluídas); detalhe do aluno pelo professor com 4 tiles (XP/acerto/lições/ofensiva), lições recentes com os dois números e a nota do Fin. Correção de catálogo: a tela "Finlow para Escolas" do protótipo é a home da administração, não landing pública | ✅ 14/08 | `prisma/schema.prisma`, `app/api/progresso`, `lib/escola-desempenho.ts`, `app/escola/{layout,turmas/page,turmas/[turmaId]/aluno/[userId]/page}.tsx`. Provado no preview: redo da lição 3 do aluno-teste devolveu 0 XP/0 coins, banco guardou 1/1 de primeira + 0/1 revisão, e o professor vê "1/1 de primeira · 0/1 após correção" |
| V2-7 | Personalização: foto de perfil e capa trocáveis, identidade Fin intacta (capa esmaece pro navy). `ImagemUsuario` no BANCO (data URI, Cascade/RLS/exportação de graça — sem bucket órfão), corte+compressão no cliente (256²/1280×512 JPEG) e teto no servidor, SVG recusado; GET só com a sessão do dono (decisão LGPD — terceiros não veem, rank segue apelido); foto no Perfil e no card do Menu, `avatarFin` da loja segue dono da trilha; "Alterar foto" do Menu deixou de ser "em breve" | ✅ 14/08 | `prisma/schema.prisma`, `app/api/imagem{,/[tipo]}`, `components/perfil/TrocarImagem.tsx` (virou `MenuDoPerfil.tsx` em 18/08, ver B5), `app/(app)/{perfil,ajustes}/page.tsx`, `app/api/{conta,perfil-financeiro,exportar}`, `scripts/exportar-banco.mts`. Provado no preview: upload → capa+foto renderizam com avatar sobreposto, foto no Menu, 401 sem sessão, remoção volta pra inicial dourada |

## Pedidos de 15/08/2026 (pós-deploy do redesign)

| Etapa | Promessa | Status | Onde |
|---|---|---|---|
| P1 | Paleta de cor DE VOLTA (os usuários gostavam), trocando só o ACENTO dentro do tema Fin: dourado padrão, terracota, lilás e verde-água novos; chaves antigas do localStorage seguem valendo | ✅ 15/08 | `app/globals.css` (overrides por `data-paleta`), `lib/tema.ts`, `app/(app)/ajustes/page.tsx` (seção Aparência de volta) |
| P2 | Contas fixas: o campo de vencimento só aceita dia de 1 a 31, recusado na digitação | ✅ 15/08 | `components/painel/ContasFixasCard.tsx` |
| P3 | Premium explícito pra quem é FREE: "FINLOW+ DISPONÍVEL" dourado no card do Menu e chip no cabeçalho do chat, os dois levando a /premium | ✅ 15/08 | `app/(app)/ajustes/page.tsx`, `app/(app)/chat/page.tsx`, `components/chat/ChatIA.tsx` |
| P4 | Economia por XP: lição/missão/baú pagam XP; XP alimenta o ranking e é a ÚNICA origem de moeda (conversão na loja, desconta do XP e o ranking/nível caem junto, decisão dela); moeda compra os itens. Ledgers pareados por refId na mesma transação; legado da era das moedas segue lido como estado | ✅ 15/08 | `lib/{conversao,pacotes-moedas,missoes,bau,pontos,coins,loja}.ts`, `app/api/jogo/{converter,missao,bau}`, `app/api/progresso`, `components/trilha-visual/fin/{LojaFin,MissoesFin,ModalBau}.tsx`, `components/trilha/FimDaLicao.tsx`, `scripts/testar-jogo.mts` |
| P5 | Segunda chance: pergunta errada volta ao FIM da mesma lição; a resposta da revanche fica num mapa separado que nunca viaja pro servidor, nota e XP sempre da 1ª tentativa. Mínimo de 8 perguntas é conteúdo dela (backlog) | ✅ 15/08 | `components/trilha/CardFlow.tsx` |
| P6 | IA com consultas: roteador determinístico detecta pedido de resumo de aprendizado e injeta a consulta pronta do banco no especialista; toda conversa leva a linha de progresso da trilha (a IA sempre sabe o que a pessoa fez) | ✅ 15/08 | `lib/{consultas-trilha,roteador-ia}.ts`, `lib/prompts/chat.ts`, `lib/ia.ts`, `app/api/chat`, `scripts/testar-roteador.mts` |
| P7 | Regra global: SEM travessão em texto de app (tela, placeholder, erro, prompt, saída da IA). 95 ocorrências varridas à mão, placeholder de vazio virou hífen, regra no CLAUDE.md e guard novo | ✅ 15/08 | `CLAUDE.md`, `scripts/testar-travessao.mts`, 40 arquivos de copy |
| P8 | Perfis UNIFICADOS (supersede a convivência de 14/08): missões, conquistas e recorde de ofensiva moram no /perfil, /trilha/perfil virou redirect, chip da trilha aponta pro /perfil. E a FOTO em todo lugar que mostrava inicial: chip da trilha (skin da loja > foto > inicial) e cabeçalho do perfil (foto > Google > skin > inicial) | ✅ 15/08 | `app/(app)/perfil/page.tsx`, `app/trilha/perfil/page.tsx` (redirect), `app/api/perfil-financeiro`, `lib/trilha-visual.ts`, `components/trilha-visual/TrilhaHeader.tsx` |
| B1 | Bug da aula fora da trilha: a conclusão sempre gravou, mas 1/4 do piso virava 1 XP ("não paga") e a biblioteca nunca mostrava aula de outro público como concluída ("não conclui"). PESO_FORA_DA_TRILHA virou 0.5 (decisão dela, custo de ranking aceito) e a biblioteca lê ProgressoModulo pros exploráveis | ✅ 16/08 | `lib/pontos.ts`, `app/trilha/biblioteca/page.tsx`. Provado: POST de adulto em lição de EF devolveu creditado com 1/4 lições gravada, antes do fix |
| B2 | Módulo em sequência única: as lições emendam (concluir navega direto pra próxima), tela de fim UMA vez com a sentada somada (acumulador em sessionStorage com expiração de 2h). Energia, XP, combo e revanche seguem POR LIÇÃO no servidor, mecânica intacta | ✅ 16/08 | `app/trilha/[moduloId]/page.tsx` |
| B3 | Foto na linha própria da Liga (colegas seguem de inicial, foto alheia é privada) | ✅ 16/08 | `app/(app)/ranking/page.tsx` |
| B4 | Comprar energia: tocar no raio abre modal com recarga cheia por 10 moedas (transação única: débito condicionado + evento no ledger + energia no máximo) ou a porta do Finlow+; botão também na tela de energia zerada | ✅ 16/08 | `lib/energia.ts` (`comprarRecarga`), `app/api/jogo/energia`, `components/trilha-visual/fin/ModalEnergia.tsx`, `components/trilha-visual/TrilhaHeader.tsx`, `app/trilha/[moduloId]/page.tsx` |
| B5 | Perfil mais limpo: os cinco controles de foto e capa saem da tela e viram um menu atrás de um botão só. `TrocarImagem.tsx` (botões soltos) vira `MenuDoPerfil.tsx` (bottom sheet do `ModalFin`), e remover imagem passa a pedir confirmação, porque a lixeira deixou de ficar a um toque no lugar em que o dedo rola a página | ✅ 18/08 | `components/perfil/MenuDoPerfil.tsx` (novo), `components/perfil/TrocarImagem.tsx` (removido), `app/(app)/perfil/page.tsx`. A mecânica de imagem não mudou: mesmo corte 256²/1280×512, mesmo POST/DELETE de `/api/imagem` |
| B6 | Bug do contador da Biblioteca: usuário comum que fazia lição escolar via o card virar concluído e o "N concluídas" do cabeçalho não se mexer. A MESMA pergunta era respondida em dois lugares (o card olhava o público antes do corredor; o contador olhava só o corredor, que não conhece aula de outro público) e o denominador ao lado já contava todas as aulas. A regra virou `estadoDaAula` em `lib/biblioteca.ts`, chamada pelos dois | ✅ 18/08 | `lib/biblioteca.ts` (novo), `app/trilha/biblioteca/page.tsx`, `scripts/testar-biblioteca.mts` (16 conferências, com o cenário do bug e uma varredura que quebra se a contagem voltar a filtrar só a trilha da pessoa) |

## Fila de produto (05/08/2026)

O que está decidido construir e ainda não começou vive em
[`backlog-produto.md`](backlog-produto.md). Duas linhas de lá mudam o que este
arquivo dizia, e por isso aparecem aqui:

| Tema | Status | Nota |
|---|---|---|
| Open Finance / agregador bancário | 📋 planejado, **sem trava de documentação** | **Deixou de ser "outra frente" em 05/08/2026.** Estava marcado 🚫 aqui e o README dizia "este repo não toca nesse tema". Passou para o backlog: conectar bancos no app para puxar extrato, saldo, contas fixas. Enquanto não começa, o caminho real de entrada de dados continua sendo o upload de extrato. **Em 11/08/2026 caiu o último resto** (o comentário de `Investimento` no `schema.prisma`): nenhuma decisão registrada é contrariada por começar. O que trava agora é escolher o agregador regulado — contrato, custo por conta e credencial —, que é decisão de produto, não de código. |
| Conferência de duplicata na entrada de dados | ✅ entregue em 11/08/2026 | O extrato compara o que chega com o que já está lançado e confirmado. **Corrigiu defeito de hoje:** sem isso, dois extratos com período sobreposto (o caso comum, já que o corte é de 3 meses) gravavam o trecho comum duas vezes e o dash contava o dobro, sem sinal na tela. Regra em `lib/extrato/duplicatas.ts`, pura e sem banco — `descricao` e `valor` são cifrados com IV aleatório, então a comparação não pode acontecer em SQL. Nunca apaga: descrição igual chega desmarcada, mesmo dia/valor com outro nome chega marcada e sinalizada. É também a metade da ingestão que o conector Open Finance exige e que não depende de qual agregador for escolhido — sincronização diária reentrega a mesma transação por definição. |
| Porta de entrada na landing | ✅ entregue em 12/08/2026 | Item 1 da avaliação UX. A home não tinha nenhum link `Entrar` ou `Criar conta` — quem já tinha conta precisava adivinhar `/login` na barra de endereço — enquanto o FAQ respondia "O Finlow já está disponível? **Ainda não**" com o app inteiro no ar no mesmo domínio, e o Menu do app logado apontava para esse mesmo FAQ. As duas metades caíram juntas porque uma sem a outra fica incoerente. A captura de e-mail deixou de ser lista de espera (o cadastro é aberto, então "avisamos quando abrir" era promessa vencida); `Waitlist`, `/api/waitlist` e a limpeza no delete de conta seguem intactas — mudou só o que a tela promete. Guardado por `scripts/testar-landing.mts`, sem banco. |
| Copy da landing alinhada ao produto real | ✅ entregue em 13/08/2026 | Item 2 da avaliação UX. O passo 1 de "Como funciona" era **"Conecte suas contas — suas transações entram sozinhas, nada de digitar CSV"**: isso é Open Finance, que está no backlog e não foi construído. O app logado já dizia a verdade — Ajustes lista "Bancos conectados" como `EmBreve` com o motivo à vista ("Requer Open Finance. Por ora, o extrato faz o mesmo trabalho") — enquanto a home vendia o recurso como pronto; mesma forma do item 1, a tela de dentro coerente e a de fora não. O passo virou "Suba seu extrato" e troca a promessa falsa por uma verdade mais forte: o arquivo é lido **no navegador da pessoa** e o servidor recebe só o texto (`lib/extrato/ler-no-navegador.ts`). O passo 2 passou a dizer o "nada entra sem confirmar", que já era verdade e não estava dito. A pergunta não sumiu: um bloco abaixo dos três passos responde que a conexão automática **está no plano e ainda não existe**. Guardado por `scripts/testar-landing.mts`, sem banco — e a checagem é amarrada ao código, não à data: afrouxa sozinha quando o conector existir, confere que a home não contradiz o `EmBreve` do Ajustes e que todo formato citado na home está no `accept` da tela de upload. |
| Cadastro na língua de quem ainda não entrou | ✅ entregue em 18/08/2026 (a metade de código do item 4) | Item 4 da avaliação UX. A tela em que a pessoa decide se cria conta abria dizendo "Pra salvar seu perfil e seu progresso na **trilha**" — palavra que só significa alguma coisa depois de entrar, e que a home nunca explica antes. Passou a descrever o que a conta guarda no vocabulário que a home acabou de usar: "Pra guardar seu painel, suas metas e as conversas com a IA. Criar conta é de graça." O rótulo do apelido seguia o mesmo defeito ("Como você quer aparecer **na liga**?") e virou "no ranking", igual ao que a versão de quem chega por convite já dizia; o campo continua o mesmo, opcional e sempre visível, como a decisão de 14/08 registrou. Guardado por `scripts/testar-landing.mts`, sem banco e sem build: o guard passou a ler `/login` e `/cadastro`, recusa jargão de dentro do app na copy das duas telas (trilha, liga, XP, ofensiva, combo, baú, corredor, missão, módulo, bloco, Finlo Coins), confere que celular e apelido continuam **opcionais** e que a data de nascimento continua com o porquê à vista. Conferido contra o código mutilado: devolver a frase antiga ou marcar o apelido como `required` faz o teste acusar. **A outra metade do item 4 não é código:** as chaves OAuth do Google na Vercel seguem pendentes, e o botão continua sumindo sozinho até elas existirem. |
| Rótulo que promete o que o toque faz, e copy sem gênero fixo | ✅ entregue em 19/08/2026 | Itens 7 e 9a da avaliação UX, juntos porque o guard é um só. (1) O botão da válvula de escape do módulo travado dizia "Enviar para a IA **reordenar**", e o toque só abre o chat com a pergunta pronta (`confirmarNecessidade` monta a frase e navega para `/chat`): se o assistente responde "não dá", o botão era mentira. Virou "Pedir pro assistente", com "Abre o chat com essa pergunta pronta" embaixo. A mecânica ficou igual de propósito — reordenar de verdade é frente nova, com decisão de produto por trás (quem pode furar o corredor, e sob qual critério). (2) "Prefiro olhar o app **sozinha**" (onboarding) flexionava em feminino para todo mundo, e a landing tinha o espelho masculino ("interpretar **sozinho**"); os dois viraram "por conta própria", e eram os dois únicos casos em `app/` e `components/`. Guardado por `scripts/testar-copy.mts`, sem banco e sem build: o rótulo do botão só é exigido honesto **enquanto** o toque for navegação para `/chat` (afrouxa sozinho se a reordenação nascer), e a checagem de flexão só acusa a palavra quando a pessoa é o sujeito da frase — "a energia volta sozinha" passa, porque ali a concordância está certa e guard que acusa frase correta só ensina a desligá-lo. Conferido contra o código mutilado: desfazer qualquer uma das duas correções derruba o guard. |
| A cota do mês contada em perguntas, e não só em token | ✅ entregue em 20/08/2026 | Item 9c da avaliação UX. `/premium` mostrava "94.300 de 120.000" como destaque: conta de padaria, porque quem lê quer saber se dá para conversar amanhã, não quantos tokens sobraram. **A contagem não mudou de moeda** (contar em token é decisão registrada da fundadora, e o guard, a soma e o teto seguem em `lib/pagamento/tokens.ts`); mudou a tela. `lib/pagamento/perguntas.ts` (novo, puro e sem `server-only`, porque quem mostra é tela de cliente) divide o que resta por `TOKENS_POR_PERGUNTA` = 8 mil, a ponta **alta** da faixa de custo de um turno, de propósito: a estimativa erra para menos e nunca promete conversa que a cota não paga. 120.000 / 8.000 = 15, exatamente a régua original do plano. Enquanto `podeUsar` for verdadeiro o resultado tem piso de 1, porque a próxima resposta vem inteira mesmo estourando o teto, e "restam 0 perguntas" com o chat respondendo seria mentira nova no lugar da antiga. A conta em token continua na tela, uma linha abaixo. `scripts/testar-pagamento.mts` vai a 79 casos, 13 novos, conferidos contra o código mutilado. |
| Perfil reconfigurado: dinheiro logo abaixo do nome | ✅ entregue em 24/08/2026 (a sobra do item de 15/08) | Ordem pedida no backlog ("nome e foto no topo, saldo + entrada/saída do mês logo abaixo, aí sim a rosca e os 4 botões"), agora é a ordem de `/perfil`. O bloco de dinheiro é novo e entra ANTES dos três tiles do jogo (dias seguidos, XP, precisão), que continuam onde o protótipo v2 os pôs: mover elemento que um desenho registrado posicionou seria decisão de produto, e o pedido se cumpre sem ela. **"Saldo atual" saiu do vocabulário:** não há integração bancária, então o número em destaque é o **acumulado do que a pessoa registrou**, com a legenda dizendo de onde vem e que não é o saldo da conta no banco — mesma régua do item 2 da avaliação de UX. Entradas e saídas são do MESMO mês da rosca: a escolha da competência era função privada da rota e virou `mesDeReferencia` em `lib/financas.ts` (a versão privada ainda lia a data em UTC contra o `getMonth()` local do resto da biblioteca — só concordavam porque o servidor roda em UTC). Sem lançamento, a tela convida a subir o extrato em vez de afirmar "R$ 0,00". Guardado por `scripts/testar-perfil.mts`, sem banco, conferido contra código mutilado. ~~⚠️ Fica registrada a divergência UTC × local de `financas.ts` inteiro, anterior a esta entrega.~~ ✅ **fechada em 28/08/2026** — ver a linha *A data de um lançamento lida do mesmo jeito em toda parte*, abaixo. Onde: `app/(app)/perfil/page.tsx`, `app/api/perfil-financeiro/route.ts`, `lib/financas.ts` |
| Objetivos: quanto guardar virou campo livre | ✅ entregue em 28/08/2026 | Pedido da fundadora ("só dá pra registrar de 50 em 50 reais, consegue colocar input livre?"). **Muda a decisão de desenho do V2-4**, que fixava o passo em R$ 50 com o porquê escrito no código ("guardar é gesto repetido, não formulário") — a intenção era boa e o custo não estava na mesa: guardar R$ 30 era impossível e R$ 400 eram oito toques. O "+ Guardar" agora abre um campo; R$ 50/100/200 viraram sugestões que **preenchem** o campo em vez de gravar, preservando a rajada de quem guarda sempre o mesmo valor. O botão fechado deixou de prometer um número (rótulo que promete o que o toque não faz é o item 7 da avaliação de UX). **A rota já aceitava qualquer valor** — o passo estava preso só na tela. O que campo livre traz de novo é valor RECUSADO, então a regra virou uma só em `lib/objetivo.ts` (puro, sem banco, o par de `personalidade.ts` × `personalidade-repo.ts`: a tela é cliente e importar o repo traria o Prisma para o navegador). A tela recusa antes de mandar com motivo em português e a rota recusa porque a tela não é autoridade. **Defeito antigo corrigido junto:** a tela fazia `Number(texto.replace(",", "."))`, que vira `NaN` em "1.000,00" — quem digitasse a meta com ponto de milhar levava "Meta inválida" tendo escrito certo, o mesmo defeito que `paraNumero` resolveu no Painel. Guardado por `scripts/testar-objetivos.mts`, sem banco, conferido contra código mutilado (cinco mutações, cinco pegas). Onde: `lib/objetivo.ts`, `app/(app)/objetivos/page.tsx`, `app/api/objetivos/route.ts` |
| A data de um lançamento lida do mesmo jeito em toda parte | ✅ entregue em 28/08/2026 | A pendência que a entrega do Perfil registrou como "maior que esta tela". `lib/financas.ts` agrupava por mês com `getMonth()` (hora local) e `dataCurta()` escrevia o dia com `getUTCDate()`; `situacoes.ts`, `contexto-financeiro.ts` e parte da rota das Análises tinham escolhido UTC por conta própria, `vazamento.ts`, `investimentos` e o filtro de mês do repositório tinham escolhido local — e a rota das Análises usava as duas ao mesmo tempo. **As leituras só concordavam porque a Vercel roda em UTC:** num fuso a oeste o lançamento do dia 1º cai no mês anterior na SOMA e continua sendo dia 1º no RÓTULO, e nada quebra. Não era hipótese: as linhas que o Painel gravou estão no banco às 00:00Z, onde bastam as três horas de Brasília. **A regra virou uma só, em `lib/dia.ts`:** a data de um lançamento é dia de calendário — escolhida no calendário de quem lança, gravada ancorada ao meio-dia UTC, lida em UTC. O caminho do chat ancorava sem o `Z` (meio-dia local) e o do Painel gravava meia-noite; os três caminhos de escrita agora chamam a mesma função. `ultimoMesComMovimento` deixou de ter conta própria e passou a chamar `mesDeReferencia` — duas respostas para "de que mês estamos falando" é o app dizer julho para a IA e agosto na tela. **Fora da regra de propósito:** `criadoEm` e "há 2 minutos" (instante, não dia) e o dia da ofensiva/missões, que continua em São Paulo — em UTC a cota viraria às 21h do dia 31. Guardado por `scripts/testar-fuso.mts`: a mesma aritmética em cinco fusos (UTC−11 a UTC+14) exigindo resultado idêntico, mais a varredura de código que recusa leitura de calendário fora de `lib/dia.ts`. Sem banco, sem build, conferido contra código mutilado. Onde: `lib/dia.ts`, `lib/financas.ts`, `lib/formato.ts`, `lib/situacoes.ts`, `lib/vazamento.ts`, `lib/contexto-financeiro.ts`, `lib/financeiro-repo.ts`, `lib/extrato/duplicatas.ts`, `app/api/analises`, `app/api/investimentos`, `app/api/extrato`, `app/api/chat/lancamentos`, `app/api/painel/transacoes`, `components/painel/TransacoesCard.tsx`, `components/chat/ConfirmarLancamentos.tsx` |
| Trilha em blocos de 4 lições, com sequência travada | ✅ entregue em 06/08/2026 | Era "em conflito" com a biblioteca posicionada. Sofia decidiu pelo corredor com a ressalva à vista, escolhendo travar **entre módulos**. A documentação da biblioteca caiu no mesmo commit — este arquivo, `resumo-de-funcao.md`, `backlog-trilha-t2.md`, o comentário de `Modulo.situacoes` e `app/trilha/page.tsx`. |

## Personalidade do assistente (08/08/2026)

O tom deixou de ser fixo. Em Menu > Personalidade do assistente a pessoa
escolhe entre cinco tons e, se quiser, escreve em até 200 caracteres como quer
ser atendida.

| Promessa | Status | Onde |
|---|---|---|
| 5 tons, com amostra da mesma frase em cada um | ✅ | `lib/personalidade.ts`, `/personalidade` |
| Campo livre, cifrado, na exportação LGPD | ✅ | `User.personalidadeDetalhe`, `/api/exportar` |
| Vale no chat e no onboarding refeito | ✅ | `app/api/chat`, `app/api/onboarding` |
| O assistente sabe indicar a tela | ✅ | `lib/app-mapa.ts`, `scripts/testar-mapa.mts` |
| Tom não afrouxa regra de número, limite nem formato | ✅ | `scripts/testar-personalidade.mts` |

**A linha que separa tom de conteúdo, e por que ela está no prompt em voz
alta.** O bloco de personalidade fica ao lado das regras que protegem os
números, e o modelo lê os dois no mesmo texto. Por isso todo tom carrega, junto,
a cláusula do que ele NÃO muda: usar somente os números do contexto, dizer que
não tem o dado quando não tem, não julgar gasto, não recomendar ativo e
responder no formato JSON. Um tom que precisasse quebrar uma dessas regras não
seria um tom.

**O campo livre é a primeira vez que texto do usuário entra no prompt de
sistema.** A memória também guarda frase dela, mas passa por validação e nasce
desligada; este campo é lido em toda resposta. Ele entra rotulado como
preferência, marcado como não confiável, sem quebra de linha (não forja seção
nossa) e sem aspas duplas (não fecha o delimitador). Baixo calão não entra, pela
mesma trava da memória.

**Antes de subir para produção — passo de banco.** `User` ganhou duas colunas
(`personalidadeIA`, `personalidadeDetalhe`). Rode `pnpm db:push` **antes** do
deploy do código. Nenhuma tabela nova, então não há passo de RLS novo: as
colunas herdam a política que já protege `User`. Se o código subir primeiro, a
leitura cai no tom padrão e loga o motivo, em vez de derrubar o chat — mas isso
é rede de proteção, não a ordem certa.

**O arquivo do banco está em dia.** `docs/banco/` foi regenerado em 17/08/2026
(40 tabelas, 150 módulos, 801 telas, 33 indicadores, prova de restauro
passando). Ele não se edita à mão (ver o README da pasta): para atualizar, rode
`node --import tsx scripts/exportar-banco.mts` com acesso ao banco.

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
| Regra de acesso num só lugar (`decidirAcesso`) | ✅ 62/62 casos em `scripts/testar-pagamento.mts` |
| Checkout, webhook, cancelamento, estado | ✅ compilam e estão registrados |
| Limite grátis por tokens, guard antes do Vertex | ✅ |
| Telas `/premium` e `/premium/obrigado` | ✅ |
| **Preço visível para quem ainda não assina** | ✅ 14/08 — `lib/pagamento/preco.ts` lê o `STRIPE_PRICE_ID` que o checkout cobra |
| Assinatura no `/api/exportar` e cancelada no delete da conta | ✅ |
| **Um checkout de ponta a ponta com cartão** | ❌ **nunca rodou** |
| **Webhook recebendo evento real da Stripe** | ❌ **nunca rodou** |

As duas últimas linhas são o que separa "implementado" de "funciona", e nenhuma
bateria as cobre: exigem cartão e um evento chegando de fora. Antes de cobrar de
alguém de verdade, ver o checklist em `docs/pagamento-antes-de-cobrar.md`.

**Três defeitos do documento de especificação foram corrigidos ao implementar** —
os três da mesma família (campo que a Stripe mudou de lugar) e os três com falha
silenciosa. Estão descritos em `lib/pagamento/stripe.ts`, com teste para cada um.

## Portabilidade LGPD: a exportação passou a entregar tudo (24/08/2026)

`/api/exportar` dizia "baixa TODOS os dados do usuário" no comentário do topo, e
a regra 3 do `README.md` promete o mesmo. Não era verdade: ficavam de fora as
memórias do assistente, as conversas do chat, os orçamentos, as respostas do
onboarding, os eventos de pontuação, os insights, o progresso das lições, os
dias da ofensiva, o perfil da trilha, as recomendações da IA e de que banco veio
cada extrato importado — **o mais sensível do banco**. O delete cobre tudo por
CASCADE, porque quem escolhe é o banco; a exportação é escrita à mão, e o que se
escreve à mão se esquece.

| Peça | Estado |
|---|---|
| A lista virou dado, com a razão de cada item | ✅ `lib/dados-exportacao.ts` |
| 29 seções saem; 4 ficam (sessão e as três da escola), com a razão escrita | ✅ |
| Conversa inteira, sem o teto de 40/200 que serve à tela | ✅ `exportarConversas` em `lib/conversa-repo.ts` |
| Cifrado sai decifrado, sempre pelo repositório | ✅ o arquivo não pode sair com `"v1.…"` |
| Cada seção vem da fonte que a lista nomeia (`lidoPor`) | ✅ chave presente com array vazio deixa de passar |
| Credencial e id da Stripe nunca entram no arquivo | ✅ `CAMPOS_FORA` |
| Toda consulta da rota filtra pelo dono | ✅ conferido pelo argumento da consulta, não por janela de texto |
| Modelo novo LIGADO A `User` sem classificação derruba o teste | ✅ `scripts/testar-exportacao.mts` |

**A regra de posse é a relação com `User`, não a coluna `userId`.** Procurar a
coluna pelo nome deixava passar quatro modelos que pertencem a alguém por outro
nome de chave: `Indicacao` (`indicadorId`/`indicadoId`), `Turma`
(`professorDaTurma`), `ConviteEscola` (`geradorDoConvite`) e `AcessoTrilhaTurma`
(`concessorDoAcesso`). A indicação a rota já entregava sem estar em lista
nenhuma — o falso verde mais caro que um teste destes pode dar. As três da
escola são da instituição, não de quem as opera, e ficam de fora com a razão
escrita.

**A lista de espera sai, e não tem relação com `User`.** `Waitlist` é chaveada
por e-mail, então nenhuma regra que olhe o schema a alcança. Ela entra na
exportação porque o DELETE de conta já a apaga pelo e-mail: o que o app associa
para apagar, associa para entregar.

**O que continua FORA, e por quê:** token de sessão e de OAuth (é credencial, não
retrato da pessoa — o arquivo é feito para ser guardado e compartilhado), os ids
`cus_`/`sub_`/`cs_` da Stripe (identificador do nosso sistema) e dado de
terceiro — quem entrou pelo link dela e quem estuda na mesma turma continuam
saindo como status e datas, nunca como identidade.

**A simetria com o apagar virou teste.** Toda tabela que "Apagar meus dados
financeiros" leva precisa estar na exportação: some no botão e nunca ter saído
no arquivo é a pessoa perder sem nunca ter podido levar. Era assimetria real —
orçamento e extrato importado eram apagados e nunca exportados.

## Pendências conhecidas

- **`/api/ops/metrics` agora falha FECHADA, e por isso está fora do ar até
  `OPS_METRICS_TOKEN` existir na Vercel** (17/08/2026). O guard de 31/07 tinha
  o defeito de só armar quando a variável estava definida: sem ela o bloco
  inteiro era pulado e a rota respondia a qualquer um, com aparência de
  protegida. Hoje, sem a variável, ela devolve 503; com ela, exige o segredo no
  cabeçalho `x-ops-token` (não mais em `?token=`, que entrava inteiro no log de
  acesso da Vercel e transformava o segredo em coisa lida por quem tem o
  projeto) e compara em tempo constante. **Para voltar a usar:** definir
  `OPS_METRICS_TOKEN` na Vercel e mandar o cabeçalho. Enquanto isso, o que
  estava exposto (id do projeto GCP, consumo de Vertex de 24h, contagens de
  indicação e lead B2B) deixou de estar.
- **Chat e extrato continuam sem limite de TAXA** — o que entrou em 10/08 foi um
  teto de VOLUME mensal (tokens), que é coisa diferente. O teto limita a conta do
  mês; não impede alguém de gastar a cota inteira em dois minutos, nem protege o
  extrato, que não tem guard nenhum. O limitador (`lib/limite-taxa.ts`) segue só
  na rota de lead B2B.
- **`RecomendacaoTrilha.motivo` é decisão de produto em aberto.** É texto livre
  escrito pela IA a partir dos números da pessoa, e nada impede a frase de citar
  um valor. Ficou FORA de "apagar dados financeiros" porque é trilha, não
  dinheiro — mas a chamada é de produto. Se a decisão for que ele também sai, é
  mover uma linha em `lib/dados-financeiros.ts`.
- R1 (política escrita de retenção/privacidade): a engenharia existe
  (consentimento separado, cifra, RLS, exclusão, exportação); falta o texto
  jurídico — base legal, finalidade, prazo de retenção.
- Revisão jurídica (CVM/LGPD) dos módulos que tocam investimento (M09, M10,
  M22–M25) e do M07 (bets).
- Chaves OAuth do Google na Vercel para o botão de login aparecer em produção.
  É a metade que sobrou do item 4 da avaliação de UX (a de copy caiu em
  18/08/2026): passo de painel, não de código. Enquanto elas não entram, o
  botão some sozinho em vez de levar a uma tela de erro do NextAuth
  (`components/auth/BotaoGoogle.tsx`), e volta no dia em que as chaves
  existirem, sem deploy de código.
- `components/painel/InsightPerfilCard.tsx` escolhe a aula por `ordem`
  cravada no código (1, 2 e 4 de cada arco) e escreve a frase por `switch` nos
  quatro perfis. Funciona porque a T1 tem os quatro arcos com quatro aulas
  cada; renumerar ou aposentar um módulo troca a frase sem quebrar nada, em
  silêncio. É a última peça do app que ainda raciocina por perfil.
