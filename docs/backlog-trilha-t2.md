# Backlog de módulos da Trilha — Temporada 2+

**Status: TRAVADO.** Nenhuma produção de módulo novo começa até o loop chat↔dash
mostrar retenção medida. Este documento é especificação do que será construído
quando o portão abrir, não escopo de construção imediata.

Recebido em 02/08/2026. Público: adulto brasileiro de 25 a 40 anos.

---

## Verificação contra o código (02/08/2026) — HISTÓRICO

> ⚠️ **Esta seção descreve o código de 02/08/2026 e não vale mais.** Os quatro
> pré-requisitos foram construídos: `Modulo.nivel` e `Modulo.situacoes[]`
> existem, os 27 módulos da T2 estão no ar, e o eixo de recomendação deixou de
> ser o `tipoPerfil`. Fica registrada porque explica POR QUE as decisões
> seguintes foram tomadas — não como retrato do que existe. Para o estado real,
> [`estado-do-produto.md`](estado-do-produto.md).

Quatro coisas que o documento assume e que **não existiam** no que estava no ar.
Registradas aqui porque eram pré-requisito, não detalhe de implementação.

**1. `nivel` e `situacoes[]` não existem no `Modulo`.**
O modelo tem `tipoPerfil`, `ordem`, `tags`, `duracaoMin`. O campo `situacoes[]`
existe, mas no `Onboarding` — na pessoa, não na aula. A "biblioteca posicionada
por nivel + situacoes" tem metade do mecanismo: sabemos a situação de quem
chega, não a da aula.

**2. "Os 4 perfis não roteiam nada" contradiz o que está no ar.**
Hoje eles roteiam tudo: `slugsDaTrilha(perfil.tipo)` monta a trilha inteira a
partir do `tipoPerfil` do módulo. Adotar a biblioteca por situação é trocar o
eixo de recomendação, não reclassificar conteúdo. **É a decisão que bloqueia a
recomendação 4 do documento.**

**3. `origem: "lacuna_chat"` nunca foi escrito por ninguém.**
É o gatilho declarado na maioria dos 27 módulos e a justificativa inteira da
Faixa 1 ("os módulos que a IA mais aciona por lacuna detectada no chat"). No
banco só existem `onboarding` e `gatilho_percentual`. O chat sabe RECOMENDAR um
módulo num card, mas não grava recomendação por lacuna. O mecanismo que sustenta
a priorização do documento ainda não existe.

**4. `tags` está vazio nos 16 módulos da T1.**
O campo existe com o comentário "alimenta a busca da Trilha" e nenhum módulo tem
tag. A busca varre título, subtítulo e conteúdo das telas, então funciona — mas
a coluna não faz nada.

**Sobre o R1 (política de retenção/privacidade).** O documento o trata como
bloqueio de engenharia; na prática o que falta é o texto jurídico. Já existem:
consentimento explícito e separado para o Painel (`consentimentoPainelEm`),
cifragem AES-256-GCM nos campos financeiros, RLS em todas as tabelas, exclusão
de conta em cascata e exportação de dados. Falta escrever base legal, finalidade
e prazo de retenção.

---

## Restrições duras herdadas

- Percurso de ~2 minutos por módulo.
- Exatamente 5 tipos de tela, sem componente novo: `conceito`, `cenario`,
  `quiz`, `input`, `resultado`.
- ~~Trilha como biblioteca posicionada, não corredor sequencial.~~
  **Caiu em 06/08/2026:** a trilha virou corredor, com 4 lições por módulo e o
  seguinte trancado até o atual fechar (decisão da fundadora — ver
  `lib/corredor.ts` e `backlog-produto.md`). O que continua valendo desta
  linha: as 5 telas seguem sendo as mesmas, e as lições são **derivadas** delas
  em `lib/licoes.ts` — módulo novo não precisa ser escrito em 4 partes, precisa
  ter os tipos de tela de sempre.
- Guardrails de CVM e LGPD mantidos e adaptados ao público adulto.

## Dados macro de referência (ago/2026)

Selic 14,25% a.a. (Copom, 17/06/2026) · salário mínimo R$ 1.621 (Decreto
12.797/2025) · rotativo 428,3% a.a. (BC, mar/2026) · IPCA 4,64% em 12 meses
(jun/2026) · meta de inflação 3% com margem de 1,5 p.p. · teto de 100% do
rotativo desde 03/01/2024 (Lei 14.690/2023).

> Houve variação nas manchetes sobre a Selic em 2026 (14,75% e 14,50% em
> decisões anteriores). Adota-se 14,25% como número verificado do projeto, e os
> módulos **nunca cravam o número no corpo do texto**: sempre puxam a variável
> da tabela de indicadores.

---

## Triagem dos 38 módulos originais

| # | Título original | Ação | Destino |
|---|---|---|---|
| 1 | Bets e a matemática de perder | MANTER | M07 |
| 2 | Golpes de Pix e engenharia social | MANTER | M08 |
| 3 | Primeiro emprego / contracheque | TRANSFORMAR | M06 Holerite |
| 4 | Finfluencers e desinformação | MANTER | M10 |
| 5 | Investir do zero | MANTER | fundido com 20 → M25 |
| 6 | Crédito e primeiro cartão | TRANSFORMAR | dissolvido em M01 e M18 |
| 7 | Nome sujo / negativação | MANTER | M02 |
| 8 | Consumo por impulso e BNPL | MANTER | M05 |
| 9 | Creator economy | TRANSFORMAR | fundido em M14 |
| 10 | Imposto de renda iniciantes | MANTER | M15 |
| 11 | Meta faculdade/intercâmbio | TRANSFORMAR | M17 |
| 12 | Cripto e ativos especulativos | MANTER | M09 |
| 13 | Mesada e pais | TRANSFORMAR | M16 |
| 14 | Reserva de emergência | MANTER | M03 |
| 15 | Consumo consciente / assinaturas | MANTER | M04 |
| 16 | Renda ativa x passiva, bruta x líquida | MANTER | dissolvido em M06 e M27 |
| 17 | Renda legal por idade | TRANSFORMAR | M13 |
| 18 | Métodos de orçamento | MANTER | M11 |
| 19 | Fricção do registro de gastos | MANTER | M12 |
| 20 | Horizontes e tripé | MANTER | fundido em M25 |
| 21 | Viés do presente / future self | MANTER | M20 |
| 22 | Implementation intentions | MANTER | M21 |
| 23 | Inflação e poder de compra | MANTER | fundido com 30 → M22 |
| 24 | Custo de oportunidade do tempo | MANTER | fundido em M27 |
| 25 | Salário mínimo, renda média, per capita | **CORTAR** | vira indicador |
| 26 | Vender / brechó / revenda | TRANSFORMAR | M14 |
| 27 | Renda x patrimônio | MANTER | M27 |
| 28 | Selic | MANTER | fundido 29+31 → M24 |
| 29 | CDI e % do CDI | MANTER | fundido em M24 |
| 30 | IPCA/INPC/IGP-M | MANTER | fundido em M22 |
| 31 | Poupança, TR, 8,5% | MANTER | fundido em M24 |
| 32 | Juros simples x compostos, regra 72 | MANTER | fundido 33+34 → M23 |
| 33 | Começar cedo x aportar muito | MANTER | fundido em M23 |
| 34 | Viés de crescimento exponencial | MANTER | fundido em M23 |
| 35 | Conversão de taxas, CET | MANTER | fundido com 38 → M26 |
| 36 | Rotativo e cheque especial | MANTER | M01 |
| 37 | Amortização Price x SAC | MANTER | M19 |
| 38 | Câmbio, custódia, spread, IOF | MANTER | fundido em M26 |

**Fusões:** 5+20→M25 · 6 dissolvido em M01/M18 · 9+26→M14 · 16 dissolvido em
M06/M27 · 23+30→M22 · 24+27→M27 · 28+29+31→M24 · 32+33+34→M23 · 35+38→M26.
**Corte único:** módulo 25. **Criado sem origem 1:1:** M18 Consignado/FGTS.

Resultado: **27 módulos finais**.

---

## Faixa 1 — sustentam o loop chat↔dash e o primeiro valor (R5)

Oito módulos. São os mais acionados por lacuna detectada no chat e os que geram
vitória rápida e visível no dash. **7 dos 8 pedem `input` de valor financeiro**,
por isso dependem do R1.

### M01 · Rotativo do cartão: a dívida que dobra sozinha
`rotativo-cartao-dobra-sozinha` · iniciante · `["divida_rotativa"]` ·
tags: cartao, rotativo, juros, fatura, minimo · 2 min

- **Problema:** cartão é a principal modalidade de dívida das famílias endividadas
  (Peic/CNC, mar/2026); rotativo a 428,3% a.a. (BC, mar/2026). Pagar o mínimo joga
  o saldo para o juro mais caro do mercado.
- **Objetivo:** nunca pagar só o mínimo sem ver o custo; buscar troca de dívida
  cara por barata.
- **Flow:** `conceito` (o que é rotativo) → `cenario` (Renata, 33, fatura de
  R$ 3.400, paga o mínimo de R$ 510) → `input` (estimar R$ 1.000 em 12 meses a
  428% a.a.) → `resultado` (chute x real + teto de 100%) → `quiz` (mínimo,
  parcelar ou trocar?) → `resultado` (rotativo é último recurso).
- **Gatilho:** `lacuna_chat` — *"paguei só o mínimo da fatura esse mês"*.
- **Chat:** Impulsivo → o gatilho da compra; Sonhador → o rotativo come a meta.
- **Evidência:** BC (428,3% a.a., mar/2026); Lei 14.690/2023; Peic/CNC.
- **Risco:** LGPD (fatura, R1); tom não estigmatizante.

### M02 · Sair do vermelho: negativação, Desenrola e Superendividamento
`sair-do-vermelho-negativacao` · iniciante · `["divida_rotativa","sem_reserva"]` ·
tags: serasa, negativacao, desenrola, superendividamento, renegociacao · 2 min

- **Problema:** 81,7 milhões de inadimplentes (Serasa, fev/2026); faixa 26-40 anos
  é 33,5% dos negativados; dívida média R$ 6.598,13; ticket de acordo R$ 793.
- **Objetivo:** renegociar de forma ativa e conhecer o mínimo existencial da Lei
  14.181/2021.
- **Flow:** `conceito` → `cenario` (Marcos, 38, negativado por R$ 2.500) → `quiz`
  (o que a Lei garante) → `input` (valor da dívida) → `resultado` (faixa de
  desconto e ticket médio) → `resultado` (roteiro de renegociação).
- **Gatilho:** `lacuna_chat` — *"meu nome tá sujo e não sei por onde começar"*.
- **Risco:** tom não estigmatizante obrigatório; LGPD (R1).

### M03 · Reserva de emergência: o colchão antes de investir
`reserva-de-emergencia-colchao` · iniciante · `["sem_reserva","renda_variavel"]` ·
tags: reserva, emergencia, liquidez, colchao · 2 min

- **Problema:** 31% dos brasileiros sem nenhuma reserva no fim de 2025; 48% na
  classe D/E (Anbima/Datafolha, Raio-X 9ª ed.).
- **Objetivo:** separar valor fixo mensal para reserva líquida antes de investir.
- **Flow:** `conceito` → `cenario` (Carla, 29, autônoma, carro quebrou, caiu no
  cartão) → `input` (custo fixo mensal) → `resultado` (meta de 3 a 6 meses,
  começar com 1) → `quiz` (onde deixar: liquidez e baixo risco, sem indicar
  produto) → `resultado` (aporte automático).
- **Gatilho:** `onboarding` ("não tenho reserva") — *"qualquer imprevisto me joga
  no cartão"*.
- **Risco:** CVM (característica, não ativo).

### M04 · Assinaturas fantasma e vazamentos silenciosos
`assinaturas-fantasma` · iniciante · `["sem_reserva","divida_rotativa"]` ·
tags: assinaturas, streaming, recorrencia, extrato · 2 min

- **Problema:** 56% gastam de R$ 51 a R$ 200/mês em recorrências e 17% mais de
  R$ 200; 73% assinam streaming de vídeo (Vindi/Opinion Box, maio/2025, 2.023
  respondentes).
- **Objetivo:** auditar o extrato e cancelar o que não usa.
- **Flow:** `conceito` → `cenario` (João, 35, quatro streamings somando R$ 140) →
  `input` (estimar gasto) → `resultado` (chute x faixa real, custo anual) →
  `quiz` (quais cancelar) → `resultado` (auditoria mensal).
- **Gatilho:** `percentual` ou `lacuna_chat` — *"não sei onde meu dinheiro some"*.
- **Risco:** LGPD (leitura de extrato, R1).

### M05 · Impulso e o "parcelado sem juros" que compromete o mês que vem
`impulso-parcelado-sem-juros` · iniciante · `["divida_rotativa","sem_reserva"]` ·
tags: impulso, parcelado, BNPL, consumo, cartao · 2 min

- **Problema:** 61% admitiram compras não planejadas no mês anterior; 60,1 milhões
  com compras parceladas, média de 4 prestações em aberto (CNDL/SPC/Offerwise,
  dez/2025). Parcelado sem juros é 42,6% das compras no cartão, 64,2% em até 6x
  (ABECS, 2025).
- **Objetivo:** somar parcelas futuras antes de aceitar novo parcelamento.
- **Flow:** `conceito` (parcelado sem juros ainda é dívida) → `cenario` (Bruna,
  31, R$ 900 comprometidos antes do salário) → `input` (somar parcelas) →
  `resultado` (quanto do próximo mês já foi) → `quiz` ("10x sem juros") →
  `resultado` (pausa de 24h, teto de parcelas).
- **Gatilho:** `lacuna_chat` — *"parcelei sem juros, então não tem problema, né?"*.

### M06 · Ler o holerite: INSS, IRRF, FGTS e 13º
`ler-o-holerite-clt` · iniciante · `["financiamento","dependentes"]` ·
tags: holerite, contracheque, inss, irrf, fgts, 13 · 2 min

- **Problema:** só 14,3% dos adultos fazem um cálculo de juros simples
  (BC/OCDE-INFE, 2023); muita gente não distingue bruto de líquido.
- **Flow:** `conceito` → `cenario` (Paulo, 34, bruto R$ 4.200, líquido R$ 3.500)
  → `quiz` (qual desconto vai para a aposentadoria) → `input` (bruto e líquido)
  → `resultado` (composição; FGTS é depósito do empregador) → `resultado` (o que
  fazer com o 13º).
- **Gatilho:** `onboarding` (renda) — *"não entendo por que caiu menos"*.
- **Risco:** conteúdo trabalhista muda anualmente; LGPD (renda, R1).

### M07 · Bets: a matemática de quem sempre perde
`bets-matematica-de-perder` · iniciante · `["divida_rotativa","sem_reserva"]` ·
tags: bets, aposta, jogo, risco, compulsao · 2 min

- **Problema:** 17,7 milhões apostaram no 1º semestre, gasto médio ~R$ 164/mês e
  R$ 983 no semestre, GGR de R$ 17,4 bi (SPA-MF). Entre 39,5 milhões de
  apostadores em 12 meses, 29% já foram negativados por dívida de aposta e 41%
  sacrificaram consumo essencial (CNDL/SPC, nov/2025). 58% apostaram mesmo com
  dívidas em atraso há mais de 90 dias (DataSenado, out/2024).
- **Objetivo:** enxergar a esperança matemática negativa e reconhecer o jogo como
  fuga de dívida.
- **Flow:** `conceito` (a casa tem vantagem embutida) → `cenario` (Diego, 30,
  R$ 200/mês tentando recuperar) → `input` (estimar R$ 100 por 12 meses) →
  `resultado` (valor esperado real x guardar a mesma quantia) → `quiz` (sinais de
  que virou problema) → `resultado` (canais de ajuda: SUS e CVV 188).
- **Risco:** tema sensível. Jogo é legal para maiores. O módulo **não proíbe**:
  trata de matemática, risco de compulsão e onde buscar ajuda. Sem moralismo.

### M08 · Golpe financeiro: central falsa, parente no WhatsApp e boleto
`golpe-financeiro-adulto` · iniciante · `["financiamento","dependentes"]` ·
tags: golpe, pix, phishing, engenharia-social, fraude · 2 min

- **Problema:** 24% dos brasileiros de 16+ foram vítimas de golpe digital em 12
  meses, ~40,85 milhões (DataSenado, out/2024); Febraban contabilizou R$ 10,1 bi
  em perdas em 2024, 153 mil vítimas só do golpe do WhatsApp; FBSP apontou 24
  milhões de vítimas via Pix/boleto entre jul/2024 e jun/2025, ~R$ 29 bi.
- **Objetivo:** desconfiar, desligar e confirmar por canal oficial.
- **Flow:** `conceito` (engenharia social explora pressa e medo) → `cenario`
  (Aline, 36, "central do banco") → `quiz` (passo certo) → `input` (dados que
  nunca se passa) → `resultado` (checklist: banco não pede senha nem "Pix de
  segurança") → `resultado` (o que fazer se já caiu).
- **Risco:** LGPD coerente — o módulo educa a NÃO compartilhar dado sensível.

---

## Faixa 2 — aprofundamento

Entram quando a Faixa 1 estabilizou ou quando o chat detecta a lacuna. **M12, M20
e M21 são âncoras comportamentais** e podem subir de prioridade se a retenção
depender de mudança de hábito, não de conteúdo.

| ID | Slug | Nível | Situações | Núcleo |
|---|---|---|---|---|
| M09 | `cripto-piramide-rende-sem-risco` | iniciante | sem_reserva, renda_variavel | Retorno alto garantido é assinatura de fraude. Braiscompany (R$ 4,1 bi), Trust Investing (1,3 mi de vítimas). |
| M10 | `finfluencer-desinformacao` | intermediario | renda_variavel, sem_reserva | Separar educação de publicidade. Fernandes/Lynch/Netemeyer (2014): educação genérica explica 0,1% da variância. |
| M11 | `orcamento-renda-irregular` | iniciante | renda_variavel, sem_reserva, dependentes | 48% não controlam orçamento; 21% apontam renda variável como maior dificuldade (CNDL/SPC). Informalidade 38,6% (IBGE). |
| M12 | `friccao-do-registro` | iniciante | renda_variavel, divida_rotativa | O problema é atrito, não força de vontade. Registro de baixíssimo esforço. |
| M13 | `formalizacao-mei-autonomo-inss` | intermediario | renda_variavel, dependentes | 16,17 mi de MEIs, 6,78 mi inadimplentes no DAS. Trabalho por app: 71,1% informal, 5,9% contribui. |
| M14 | `renda-extra-adulto` | intermediario | renda_variavel | Precificar com custo + tempo + margem; separar PF de PJ. Rendimento médio de plataforma R$ 2.996, renda/hora 8,3% menor. |
| M15 | `imposto-de-renda-sem-susto` | intermediario | renda_variavel, dependentes | Isenção até R$ 5.000/mês desde jan/2026 (Lei 15.270/2025), ~16 mi beneficiados. |
| M16 | `dinheiro-a-dois-e-com-filhos` | intermediario | dependentes, financiamento | 53% dizem que dinheiro é o principal motivo de briga; 49% já esconderam problema financeiro (Serasa). |
| M17 | `metas-grandes-do-adulto` | intermediario | financiamento, dependentes, sem_reserva | 33% pouparam em 2025, só 12% viraram investimento (Anbima). Meta = valor + prazo + aporte. |
| M18 | `consignado-emprestimo-fgts` | intermediario | divida_rotativa, financiamento, sem_reserva | Consignado CLT 3,2% a.m. x crédito pessoal ~15,81% a.m. 83% não sabiam os juros, 47% não sabiam do FGTS como garantia (Abefin). |
| M19 | `financiamento-price-sac-amortizar` | intermediario | financiamento | 9,49% a 12,49% a.a. + TR (fev/2026); parcela limitada a 30% da renda bruta. |
| M20 | `eu-do-futuro-vies-do-presente` | intermediario | sem_reserva, renda_variavel | Hershfield et al. (2011, JMR) — amostra de 18 a 35 anos, **mais** aderente ao público adulto do que era ao adolescente. |
| M21 | `planos-se-entao-compromisso` | intermediario | divida_rotativa, sem_reserva, renda_variavel | Gollwitzer e Sheeran (2006), meta-análise, d=0,65. Âncora do mecanismo comportamental do Finlow. |
| M22 | `inflacao-poder-de-compra` | intermediario | sem_reserva, renda_variavel | Nominal x real. IPCA 4,64% em 12 meses; meta 3% ± 1,5 p.p. |
| M23 | `juros-compostos-regra-72` | intermediario | sem_reserva, renda_variavel | Subestimação sistemática do exponencial (Stango e Zinman 2009; Goda et al. 2019, erro ~12%). |
| M24 | `selic-cdi-poupanca` | intermediario | sem_reserva, renda_variavel | Poupança é o produto de 22% da população mesmo com a regra dos 8,5% + TR. |
| M25 | `investir-do-zero` | intermediario | sem_reserva, renda_variavel | 60,6 mi de investidores, 36% da população adulta (ante 31% em 2021); 107,7 mi fora. Tripé liquidez/rentabilidade/risco. |

**M25 é o mais delicado em CVM.** PODE explicar risco, liquidez, o que é renda
fixa e variável, e a importância do horizonte. NÃO PODE indicar produto, ativo,
corretora ou alocação.

---

## Faixa 3 — deixar para depois

| ID | Slug | Por quê |
|---|---|---|
| M26 | `taxas-escondidas-cet-iof` | Avançado, público mais nichado. CET, spread, IOF, câmbio, custódia. 2% a.m. ≈ 26,8% a.a. |
| M27 | `renda-x-patrimonio-tempo` | Conceitual; útil só depois do básico resolvido. Fluxo x estoque e o custo da própria hora. |

---

## O que morreu do original

- **B2B escolar e BNCC como canal de venda.** O v3 é B2C puro por assinatura. A
  BNCC fica só como referência pedagógica, nunca comercial.
- **"Pagante = pais".** O pagante é o próprio adulto.
- **PISA (estudantes de 15 anos).** Trocado pelo survey OCDE/INFE de adultos
  conduzido pelo Banco Central (2023).
- **Jovem aprendiz / primeiro contracheque** → holerite CLT adulto (M06).
- **Mesada e conversa com os pais** → dinheiro a dois e com filhos, com a mesada
  agora sendo DOS filhos (M16).
- **Renda legal por idade** → formalização do adulto (M13).
- **Faculdade/intercâmbio** → metas grandes do adulto (M17).
- **Brechó de adolescente** → renda extra do adulto (M14).
- **Salário mínimo como módulo** → vira indicador.
- **Mecânicas com componente novo** (jogos, simuladores com slider, animações de
  curva) → viram `input` + `resultado`, ou ficam marcadas como candidatas a
  ferramenta do dash, fora do card flow.

---

## Alerta regulatório

**CVM — não somos assessoria autorizada.**
PODE: explicar conceitos (risco, retorno, liquidez, juros compostos, renda fixa e
variável, Selic/CDI/IPCA), ensinar a comparar pelo CET, alertar sobre fraude e
pirâmide, ajudar a definir metas e aportes genéricos.
NÃO PODE: indicar produto, ativo, corretora ou alocação específica; dizer "invista
em X"; dar recomendação personalizada de carteira.
Frase-padrão: *"posso te explicar como funciona, mas quem recomenda um produto
específico é um profissional autorizado pela CVM"*.

**LGPD — dado financeiro sensível de adulto (ticket R1).**
O foco muda de "dados de menores (art. 14)" para persistência de valor nominal,
dívida, renda e extrato. Todo módulo com `input` de valor depende do R1: base
legal, finalidade, prazo de retenção e direito de exclusão. **7 dos 8 módulos da
Faixa 1 pedem input de valor.**

**Tom com endividados.** Nenhum módulo culpa ou envergonha quem deve.
Endividamento em 80,4% das famílias; inadimplência em 81,7 milhões de pessoas. O
tom é de parceiro que ajuda a sair, não de juiz.

**Bets.** Jogo é legal para maiores. O módulo não é "não pode": é "entenda a
matemática, reconheça o risco de compulsão e saiba onde buscar ajuda".

**Conteúdo tributário e trabalhista muda todo ano.** M06, M13, M15, M18 e M19 são
os mais expostos. Revisão anual obrigatória em dezembro/janeiro.

---

## Tabela de indicadores (conceito estável x dado volátil)

O texto conceitual nunca crava o número: puxa a variável, para que uma virada de
Selic ou de IPCA não exija reescrever módulo.

| Variável | Valor | Fonte |
|---|---|---|
| `{{selic_atual}}` | 14,25% a.a. | Copom, 17/06/2026 |
| `{{ipca_12m}}` | 4,64% | jun/2026 |
| `{{rotativo_medio}}` | 428,3% a.a. | BC, mar/2026 |
| `{{cheque_especial}}` | teto de 8% a.m. | CMN (ver caveat) |
| `{{salario_minimo}}` | R$ 1.621 | Decreto 12.797/2025 |
| `{{meta_inflacao}}` | 3% ± 1,5 p.p. | CMN |
| `{{consignado_clt}}` | 3,2% a.m. | MTE, jan/2026 |
| `{{teto_rotativo}}` | 100% da dívida original | Lei 14.690/2023 |
| `{{isencao_ir}}` | R$ 5.000/mês | Lei 15.270/2025 |

**Esta tabela ainda não existe no banco.**

---

## Recomendações do documento

1. **Não desbloquear nada até o portão abrir.** Sem retenção medida (coorte D30
   acima do limiar acordado), produzir módulo novo é otimização prematura.
2. **Resolver o R1 ANTES de construir a Faixa 1**, não em paralelo. Sem ele, os
   módulos não podem persistir o que a pessoa digita, o que quebra o valor do dash.
3. **Ordem de construção quando abrir:** M01 → M02 → M03 → M04. Medir se a
   conclusão de cada um correlaciona com retenção antes dos quatro seguintes.
4. **Reclassificar os 16 módulos da T1 no mesmo schema antes de escrever módulo
   novo.** Se um módulo novo cobrir 70% do que um da T1 já cobre, fundir.
   *(Bloqueado pelo item 2 da verificação acima.)*
5. **Simuladores (Selic, juros compostos) vão para o backlog de PRODUTO**, não de
   conteúdo. Não cabem nos 5 tipos de tela; o lugar deles é o dash.
6. **Ritual de revisão anual (dez/jan)** para M06, M13, M15, M18, M19.

---

## Caveats

- **Nenhuma pesquisa recorta especificamente a faixa 25-40.** O único recorte
  etário limpo é o da Serasa (26-40 = 33,5% dos negativados). Os cenários usam
  personagens de 25 a 40, mas as estatísticas são da população adulta ampla.
  Sinalizar isso ao usar os números em marketing.
- **A Selic tem conflito de fontes** (14,25% do projeto x 14,75%/14,50% em
  manchetes de decisões anteriores). A variável é a fonte única de verdade.
- **A taxa média do cheque especial em 2026 não veio de fonte primária limpa do
  BC.** Validar nas Estatísticas Monetárias e de Crédito antes de publicar
  qualquer módulo que cite o número.
- **CNDL/SPC, CNC e ABECS são entidades do varejo e de pagamentos:** reputáveis e
  padrão de mercado, mas com interesse setorial. Onde possível, cruzado com IBGE,
  BC, Serasa e Anbima.
- **O custo agregado das bets ao país (R$ 38,8 bi/ano) é estimativa disputada.**
  M07 usa gasto médio e impacto na inadimplência, que são mais sólidos, não a
  estimativa de dano agregado.
- **Isto é backlog, não conteúdo pronto.** Os card flows são especificação; o
  texto de cada tela ainda precisa ser redigido e revisado juridicamente.
