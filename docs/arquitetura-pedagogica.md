# Finlow — Arquitetura pedagógica v1 (card flow v2)

> **Revisão 4 (19/08/2026).** Regra nova da Sofia: **cada conceito é visto 3 vezes** — apresentação, reforço e consolidação, três lições com perguntas que nunca se repetem (18 × 3 = 54 itens por conceito nos segmentos de 15 telas). A base estrutural completa está gerada e conferida contra o **PDF oficial da Matriz** (230 códigos batem; 98 textos truncados completados). Seção 14.
>
> **Revisão 3 (19/08/2026).** O Ensino Médio foi dividido em três séries (`em1`, `em2`, `em3`) — mapa em `FINLOW_TRILHA_EM_POR_SERIE.md` — e a geração das lições virou job noturno retomável, entregue em `finlow-seed-card-flow-v2.zip`. Seção 14.
>
> **Revisão 2 (18/08/2026).** Decisão da Sofia: **toda tela tem ação** — a lição vira 15 perguntas rápidas, sem nenhuma tela de leitura — e **o portão de teste com usuário cai**: as lições atuais não retêm, converter é a decisão, não a hipótese. As seções 3, 4, 5, 9 e 10 foram reescritas.
>
> **O que este doc resolve.** Os módulos atuais apresentam conceito e quase não fazem a pessoa usar o conceito. Este documento troca o card flow de 5 telas por um **ciclo de fixação** e adiciona o que faltava por completo: um **motor de repetição espaçada** que faz o conceito voltar depois que o módulo acabou.
>
> **Precedência.** Onde este doc contradisser o `CLAUDE.md` ou a `FINLOW_SPEC_v3.md` no que diz respeito a **telas de módulo, itens de avaliação, nível e pontos de aprendizagem**, este doc vence — as duas fontes anteriores especificam produto, não pedagogia. Fora desse escopo, nada muda.
>
> **Restrições preservadas:** ~2 minutos por módulo (inviolável), sem jargão sem explicação imediata, sem tom de coach, nível só sobe por sinal duro, pontos não podem ser farmados, mobile-first, um componente React por tipo de tela.
>
> **Vale para os dois públicos.** Uma estrutura só, duas peles (`adulto` 25–40 · `jovem` escolar), como já previsto no prompt do v0.

---

## 1. Diagnóstico — por que os módulos não fixam

O card flow atual (`conceito · cenario · quiz · input · resultado`) gasta o orçamento de atenção assim:

| Tela | O que o usuário faz | Ação real? | ~Tempo |
|---|---|---|---|
| `conceito` | lê um parágrafo | não | 20s |
| `cenario` | lê uma história com nome próprio e números | não | 35s |
| `quiz` | responde **uma** pergunta | **sim** | 20s |
| `input` | digita uma estimativa sobre si mesmo | meia — **não existe certo nem errado** | 20s |
| `resultado` | lê uma tarefa para fazer fora do app | não | 15s |

**São 110 segundos para uma única resposta avaliável.** Cinco falhas, nomeadas:

1. **Exposição no lugar de recuperação.** 70% do tempo é leitura. A memória se forma quando a pessoa *puxa* a informação, não quando recebe. Um quiz em 110s é uma amostra pequena demais para fixar qualquer coisa.
2. **O `input` não ensina.** "Quanto você acha que subiu a inflação?" não tem gabarito na tela. Sem comparação com o número real, a estimativa errada fica intacta — em alguns módulos o formato até **reforça o erro**.
3. **Uma única passada, e nunca mais.** Nenhum conceito reaparece depois do módulo. Sem reencontro, a curva de esquecimento come quase tudo em uma semana, por melhor que seja o texto.
4. **O `cenario` carrega peso demais.** Ele precisa apresentar personagem, contexto, números e dilema em um bloco de leitura. É a tela mais longa e a de menor retorno pedagógico — e é justamente a que precisa ser reescrita inteira quando o público muda (custo já registrado no `CLAUDE.md`).
5. **Rastreabilidade sem verificação.** As 230 habilidades estão mapeadas para módulos, mas **não há como saber se a pessoa aprendeu a habilidade** — só se ela chegou ao fim do card flow. Para uso em escola, isso é o buraco mais caro: cobertura de currículo não é evidência de aprendizagem.

---

## 2. O princípio — o conceito é ensinado pela pergunta

A troca central: **parar de explicar e depois testar; passar a perguntar e explicar dentro da correção.**

Quatro mecanismos que fazem o trabalho:

- **Efeito de teste.** Recuperar da memória fixa mais do que reler. Toda tela que puder ser pergunta, é pergunta.
- **Pré-teste (erro produtivo).** Perguntar **antes** de ensinar, mesmo com a pessoa errando, prepara a memória para a resposta. Isso vira a tela `sonda`.
- **Feedback corretivo imediato.** A correção não é "errou". É uma frase que explica **por que aquela alternativa específica** é sedutora e falsa. Este é o lugar onde o conteúdo conceitual passa a morar.
- **Prática espaçada e intercalada.** O conceito volta em 1, 3, 7, 16 e 35 dias, em formatos diferentes, misturado com outros conceitos. É a seção 6.

**Regra dura que sai daí:** **nenhuma tela é de leitura.** Toda tela pede uma resposta, e o conteúdo conceitual passa a morar no feedback da correção e na âncora pós-resposta (seção 3). Se uma ideia não cabe em um enunciado de 120 caracteres mais o feedback de 160, ela não é uma ideia — são duas, e a lição tem que ser partida.

---

## 3. Card flow v2 — 15 perguntas, zero telas de leitura

**Nenhuma tela sem ação.** A lição é uma sequência de 15 perguntas rápidas de dificuldade crescente. O conceito não é apresentado e depois testado — ele é **construído pela sequência das perguntas** e explicado dentro da correção.

| # | Leva | Formato | O que faz | Custo |
|---|---|---|---|---|
| 1–3 | **Sonda** | `binaria` ×3 | Pergunta antes de ensinar. Errar aqui é o desenho. Sem punição visual. | 17,4s |
| 4–5 | **Construção** | `escolha3` ×2 | Onde o conceito nasce — o feedback de cada alternativa é a aula. | 19,6s |
| 6 | Construção | `binaria` | Confirma o critério recém-formado. | 5,8s |
| 7 | **Prática** | `classificar` ou `ordenar` | A pessoa mexe no conceito. 4 microrrespostas em uma tela. | 20,0s |
| 8–9 | Prática | `binaria` ×2 | Aplica o critério em casos-limite. | 11,6s |
| 10 | **Aplicação** | `estimativa` ou `caca_erro` | Calibra intuição contra número real, ou lê um documento de verdade. | 15,0s |
| 11–12 | Aplicação | `escolha3` ×2 | Contexto novo, mesma ideia. É aqui que se mede transferência. | 19,6s |
| 13–14 | **Fluência** | `binaria` ×2 | Rápidas, sem hesitação. Fixam por velocidade. | 11,6s |
| 15 | **Fecho ativo** | `escolha3` | "Qual destas frases resume o que você acabou de ver?" A correta vira o card salvo em *Meus conceitos*. | 6,0s |

**Total: 126,6 segundos · 15 telas · 18 respostas avaliáveis · 100% com ação.**

Contra o formato atual: **1 resposta em 110 segundos** vira **18 em 126**.

### Onde a explicação mora agora

Esta é a única coisa que não pode ser perdida ao tirar as telas de leitura. Três lugares, nenhum deles uma tela:

1. **Feedback de erro** — bloqueia, ≤160 caracteres, no formato *o que a alternativa acerta → onde falha → o critério que resolve*. É a aula. Quem acerta pula; quem erra recebe.
2. **Âncora pós-resposta** — ≤70 caracteres que aparecem sob a pergunta já respondida por ~2 segundos, sem bloquear. É por onde a frase-conceito entra sem virar parágrafo. Ex.: *"CET = taxa + tarifas + seguro embutido."*
3. **Fecho ativo (tela 15)** — a pessoa **escolhe** o resumo em vez de ler o resumo. Escolher entre três frases parecidas obriga a discriminar; ler não obriga nada.

### Orçamento calculado, não estimado

Cada formato tem um custo em segundos, e o custo da lição é a soma. **O seed calcula e recusa qualquer lição acima de 140s.** Assim o limite não depende de disciplina de quem escreve.

| Formato | Base | Erro esperado | Feedback | Custo |
|---|---|---|---|---|
| `binaria` | 5,0s | 20% | 4,0s | **5,8s** |
| `escolha3` | 8,0s | 35% | 5,0s | **9,8s** |
| `classificar` / `ordenar` | 18,0s | 40% | 5,0s | **20,0s** |
| `estimativa` | 10,0s | sempre revela | 5,0s | **15,0s** |
| `caca_erro` | 12,0s | 45% | 4,0s | **14,0s** |
| `fecho` | 6,0s | — | — | **6,0s** |

**Variantes por segmento:**

| Segmento | Telas | Composição | Custo |
|---|---|---|---|
| `ef12` (1º–2º ano) | 8 | 6 `binaria` + 1 `classificar` + fecho | ~61s |
| `ef35` / `ef67` | 12 | 7 `binaria` + 3 `escolha3` + 1 prática + fecho | ~96s |
| `ef89` / `em` / `adulto` | **15** | a composição canônica acima | **126s** |

---

## 4. Catálogo — 6 formatos, 6 componentes

Cortei o catálogo de 10 para 6. Menos componentes, mais lições — e todo formato que sobrou responde em 1 ou 2 toques.

| Formato | Ensina | Interação |
|---|---|---|
| `binaria` | reconhecimento rápido do critério | dois botões grandes, 1 toque |
| `escolha3` | discriminar entre ideias parecidas | 3 alternativas, feedback por alternativa |
| `classificar` | fronteira entre categorias | 4 itens → 2 caixas, tocar para atribuir |
| `ordenar` | prioridade e sequência | 3–4 itens, tocar na ordem certa |
| `estimativa` | calibrar intuição contra o real | slider → revela gabarito e a distância |
| `caca_erro` | leitura crítica de documento | toca no ponto errado da peça |

**Saíram:** `conceito`, `cenario`, `resultado` e `input` (formatos passivos ou sem gabarito), mais `simulador` e `decisao` — bons, mas caros de construir e lentos de responder. Ficam como possibilidade para depois; nenhuma lição depende deles.

**O cenário não morre, encolhe.** Vira o enunciado de uma `escolha3`, em ≤120 caracteres: *"Marlene pagou o mínimo da fatura por 4 meses. A dívida quase dobrou. O que mais pesou?"* A história inteira que existe hoje não cabe e não precisa caber.

### Contrato JSON

```jsonc
// binaria
{ "criterio": "Cai no rotativo?",        // fixo no topo, ≤40 car.
  "conceitoId": "rotativo",
  "enunciado": "Pagar o mínimo da fatura",   // ≤70 car.
  "resposta": true,
  "ancora": "≤70 car., aparece após responder",
  "feedbackErro": "≤160 car. — só aparece se errar" }

// escolha3
{ "pergunta": "≤120 car.", "conceitoId": "cet", "dificuldade": 2,
  "alternativas": [
    { "texto": "≤60 car.", "correta": true,  "feedbackErro": null },
    { "texto": "≤60 car.", "correta": false, "feedbackErro": "≤160 car." }
  ],
  "ancora": "≤70 car." }

// classificar
{ "instrucao": "≤70 car.", "conceitoId": "fixa-variavel",
  "caixas": [{ "id": "fixa", "rotulo": "Fixa" }, { "id": "var", "rotulo": "Variável" }],
  "itens": [{ "texto": "Aluguel", "caixaCorreta": "fixa", "feedbackErro": "≤120 car." }],
  "ancora": "≤70 car." }

// ordenar
{ "instrucao": "≤70 car.", "conceitoId": "prioridade-divida",
  "itens": [{ "texto": "Rotativo 14% a.m.", "posicaoCorreta": 1 }],
  "feedbackErro": "≤160 car. — explica o critério, não só a ordem",
  "ancora": "≤70 car." }

// estimativa
{ "pergunta": "≤100 car.", "conceitoId": "inflacao-sentida",
  "campo": "percentual", "min": 0, "max": 30,
  "gabarito": 5.2, "toleranciaPct": 20,
  "fonte": "IBGE/IPCA 12m",                 // obrigatório: número precisa de origem
  "feedbackPerto": "≤160 car.", "feedbackLonge": "≤160 car. — nomeia o viés" }

// caca_erro
{ "instrucao": "≤70 car.", "conceitoId": "leitura-fatura",
  "peca": "/pecas/fatura-01.svg",
  "alvos": [{ "x": 62, "y": 48, "r": 12, "correto": true, "feedback": "≤160 car." }],
  "feedbackSeNaoAchar": "≤160 car." }

// fecho ativo — é uma escolha3 com papel especial
{ "pergunta": "O que você acabou de ver?", "papel": "fecho",
  "alternativas": [ { "texto": "≤80 car.", "correta": true } ],
  "salvaComoCard": true }
```

---

## 5. Contrato de conteúdo — limites duros

Validados no seed. **O seed aborta se qualquer limite estourar** — é o que impede o texto de voltar aos poucos.

| Regra | Valor |
|---|---|
| Telas sem ação por lição | **0** |
| Telas por lição | 15 (8 no `ef12`, 12 no fundamental intermediário) |
| Respostas avaliáveis por lição | ≥15 |
| Custo somado da lição | ≤140s (alvo 126s) |
| Caracteres de qualquer enunciado | ≤120 |
| Caracteres de qualquer alternativa | ≤60 |
| Caracteres de feedback de erro | ≤160 |
| Caracteres de âncora | ≤70 |
| Feedback de erro | obrigatório em **toda** alternativa errada |
| Alternativas por `escolha3` | exatamente 3 |
| Conceitos por lição | 1 principal (+1 secundário no máximo) |
| Itens no banco por conceito | ≥18 — as 15 da lição + 3 reservados só para revisão |
| `estimativa` sem campo `fonte` | rejeitada |
| Números em conta | recalculados por código no seed |
| Nome próprio | permitido só em enunciado de `escolha3`, uma vez por lição |

**Por que ≥18 itens por conceito.** As 15 perguntas da lição não podem ser as mesmas da revisão — se forem, a revisão mede memória da resposta, não do conceito. Três itens ficam guardados para o primeiro reencontro. É o único jeito de a repetição espaçada medir alguma coisa.

**Regra do feedback de erro.** Nunca "Não é bem isso". Sempre: o que a alternativa acerta → onde falha → o critério que resolve.

> ❌ "Errado. O CET é o custo efetivo total."
> ✅ "Faz sentido olhar a taxa — é o número que a loja anuncia. Mas ela não inclui tarifa nem seguro embutido. Quem compara taxa com taxa compara metade da conta."

---

## 6. Motor de fixação — o conceito volta

Esta é a metade que **não existe hoje** e sem a qual o card flow novo também não fixaria. Três ideias:

### 6.1 A unidade de aprendizagem deixa de ser o módulo e passa a ser o **conceito**

Hoje o progresso é `ProgressoModulo.concluido` — mede presença, não aprendizagem. Entra um nível abaixo:

```
Habilidade da matriz (EM13LF26)  →  Conceito (cet, capacidade-de-pagamento)  →  Itens (≥4 por conceito)
```

Um módulo **apresenta** 1 ou 2 conceitos. Um conceito **vive** em vários módulos e na revisão. A rastreabilidade curricular continua intacta: habilidade → conceito → módulo, três colunas em vez de duas, e agora com evidência de acerto por trás.

### 6.2 Banco de itens e caixas de repetição

Cada conceito precisa de **≥18 itens** — as 15 que a lição consome mais **3 reservados exclusivamente para a revisão**. Isso não é capricho: se a revisão devolve uma pergunta que a pessoa já respondeu na lição, ela mede memória da *resposta*, não do *conceito*. Os itens de reserva usam formatos diferentes dos da lição, para forçar transferência.

Caixas (Leitner simplificado — previsível, barato e explicável ao usuário, diferente de um SM-2 opaco):

| Caixa | Próxima revisão | Como se chega |
|---|---|---|
| 0 | — | conceito nunca visto |
| 1 | **1 dia** | apresentado no módulo, ou errado em qualquer revisão |
| 2 | **3 dias** | 1 acerto a partir da caixa 1 |
| 3 | **7 dias** | 2 acertos — **conta como sinal duro de nível** |
| 4 | **16 dias** | 3 acertos |
| 5 | **35 dias** | 4 acertos — considerado consolidado |

Regras: acerto sobe uma caixa; **erro volta para a caixa 1**, nunca para 0 (o conceito já foi visto, o que falhou foi a retenção). Cada revisão sorteia um item **que a pessoa ainda não viu** daquele conceito, começando pelos 3 de reserva; esgotados, reusa o mais antigo respondido há mais de 30 dias.

### 6.3 Três canais de reaparição

1. **Revisão de 60 segundos** — faixa no topo da aba Trilha quando há conceitos vencidos: *"6 conceitos pedem revisão · 60s"*. Máximo de 8 itens por sessão, formatos misturados, uma tela por item. É o hábito diário do produto de aprendizagem, do mesmo jeito que o chat é o hábito diário do produto financeiro.
2. **Módulo de revisão gerado** — a seção 5 do `FINLOW_TRILHA_ESCOLAR.md` deixou ~27 módulos de revisão **por escrever**, porque revisão não carrega habilidade nova da matriz. **Ela não precisa ser escrita.** Um módulo de revisão passa a ser *montado em tempo de execução* com os itens vencidos dos conceitos daquele bloco — 8 itens, sem consulta, com o rótulo `Quiz sem consulta` que o `DrawerModulo` já prevê. Zero conteúdo novo para produzir, e a revisão fica diferente para cada aluno.
3. **Gatilho pelo chat (pele adulto)** — quando a conversa toca um conceito que está vencido, a IA pode enviar **um** item como card no chat: *"pergunta rápida, 10 segundos"*. No máximo 1 por dia, e nunca no meio de uma conversa sobre dívida em curso — ninguém quer quiz enquanto pede socorro.

### 6.4 Como a trilha muda de significado

Com conceito como unidade, o velho impasse "corredor vs. biblioteca" (`CLAUDE.md` diz biblioteca, o prompt do v0 diz corredor) tem uma terceira resposta, melhor que as duas: **o pré-requisito passa a ser de conceito, não de módulo**. Um módulo só trava se depende de um conceito que a pessoa ainda não tem em caixa ≥2. O resultado é que quase nada trava, o que trava tem motivo explicável em uma frase (*"este módulo usa CET, que você viu ontem e ainda não revisou"*), e o botão "Preciso disso agora" continua sendo a válvula de escape.

---

## 7. Schema Prisma

```prisma
model Conceito {
  id          String   @id @default(cuid())
  slug        String   @unique          // "cet", "custo-oportunidade"
  nome        String                    // exibido na revisão e no fecho
  frase       String   @db.Text         // a definição de 1 linha, ≤140 car. — fonte da tela `revelacao`
  habilidades String[]                  // ["EM13LF26"] — rastreabilidade curricular
  segmento    String                    // ef12 | ef35 | ef67 | ef89 | em | adulto | comum
  preRequisitos String[]                // slugs de outros conceitos

  itens       ItemAvaliativo[]
  dominios    DominioConceito[]
  modulos     ModuloConceito[]

  @@index([segmento])
}

model ModuloConceito {
  moduloId   String
  modulo     Modulo   @relation(fields: [moduloId], references: [id], onDelete: Cascade)
  conceitoId String
  conceito   Conceito @relation(fields: [conceitoId], references: [id], onDelete: Cascade)
  papel      String   // "principal" | "secundario"

  @@id([moduloId, conceitoId])
}

model ItemAvaliativo {
  id          String   @id @default(cuid())
  conceitoId  String
  conceito    Conceito @relation(fields: [conceitoId], references: [id], onDelete: Cascade)
  formato     String   // escolha | binaria | ordenar | classificar | estimativa | caca_erro
  dificuldade Int      @default(1)      // 1..3
  conteudo    Json                      // contrato da seção 4
  origemTelaId String?                  // se nasceu de uma Tela de módulo
  ativo       Boolean  @default(true)   // desligar distrator morto sem apagar histórico

  tentativas  TentativaItem[]
  @@index([conceitoId, formato])
}

model DominioConceito {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  conceitoId    String
  conceito      Conceito @relation(fields: [conceitoId], references: [id], onDelete: Cascade)
  caixa         Int      @default(0)    // 0..5
  acertosSeguidos Int    @default(0)
  proximaRevisao DateTime?
  primeiroVistoEm DateTime @default(now())
  ultimoVistoEm  DateTime @updatedAt

  @@unique([userId, conceitoId])
  @@index([userId, proximaRevisao])     // a query da revisão diária
}

model TentativaItem {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemId     String
  item       ItemAvaliativo @relation(fields: [itemId], references: [id], onDelete: Cascade)
  contexto   String   // "modulo" | "revisao" | "chat"
  acertou    Boolean
  respostaBruta Json?                    // qual distrator foi escolhido — alimenta a seção 10
  msDecorridos Int?
  criadoEm   DateTime @default(now())

  @@index([userId, criadoEm])
  @@index([itemId, acertou])            // saúde de item e de distrator
}

model Tela {
  // ... campos existentes (moduloId, ordem, tipo, label, conteudo)
  // `tipo` passa a ser o PAPEL na lição: sonda | construcao | pratica | aplicacao | fluencia | fecho
  // `formato` é o componente: binaria | escolha3 | classificar | ordenar | estimativa | caca_erro
  conceitoId String?
  formato    String?
  itemId     String?                     // toda tela da lição É um item do banco
  custoSeg   Decimal? @db.Decimal(4,1)   // derivado do formato; somado e validado no seed
}
```

**Nota de compatibilidade.** `Tela.tipo` ganha valores novos e mantém os antigos — os 535 registros escolares e os 16 módulos adultos continuam renderizando enquanto a conversão roda. Nenhuma migração destrutiva antes da seção 9.

---

## 8. Como isso conversa com o que já existe

**Nível (sinal duro).** A regra "nível nunca sobe por vibe" fica **mais forte**, não mais fraca. O sinal duro passa a ser:

- conceito atingindo **caixa 3** (dois acertos espaçados, em itens diferentes) → +1 sinal
- conceito caindo de caixa 4+ para 1 → sinal negativo, o nível pode **descer**
- acerto isolado dentro de um módulo **não** é sinal — é a primeira exposição, e acertar de primeira ali quase sempre é reconhecimento, não domínio

**Pontos (anti-farm).** `EventoPontuacao` já tem `@@unique([userId, motivo, refId])`. Três motivos novos que caem redondo nessa chave:

| motivo | refId | pontos | por quê é infarmável |
|---|---|---|---|
| `conceito_dominado` | `conceitoId` | 15 | só a primeira vez que chega à caixa 3 |
| `revisao_diaria` | `AAAA-MM-DD` | 5 | uma por dia, por construção da chave |
| `modulo_concluido` | `moduloId` | do módulo | já existia; refazer não pontua |

**Item respondido não pontua sozinho.** Se pontuasse, a rajada viraria caça-níquel.

**Peles.** A estrutura é idêntica; muda a `intensidadeGamificacao` já prevista no prompt do v0:

| | `adulto` | `jovem` |
|---|---|---|
| Rajada | sem cronômetro visível | cronômetro e combo |
| Erro | correção seca e útil | correção + reação de partícula |
| Revisão diária | "6 conceitos pedem revisão" | "revisão de hoje · 60s" com streak |
| Streak | número discreto, **nunca reset dramático** | streak com celebração |

> Cuidado registrado: streak agressivo com público endividado é a mesma aposta de duas pontas do ranking (R7 do `CLAUDE.md`). Motiva quem está indo bem e afunda quem sumiu por duas semanas — que é exatamente quem mais precisa voltar. Na pele adulto, streak quebrado **não** exibe perda; exibe convite.

**Chat.** O `lacuna_chat` de `RecomendacaoTrilha` fica mais preciso: em vez de recomendar um módulo inteiro quando a IA detecta lacuna, ela pode mandar **um item do conceito exato** e só recomendar o módulo se a pessoa errar. Menos fricção, mais sinal.

---

## 9. Migração — converter já, sem portão

**A decisão está tomada: o formato antigo não retém, e converter não é hipótese a ser testada.** Cai o portão de teste com usuário. O que **não** cai é a instrumentação — ela não atrasa nada e é a única forma de saber, daqui a três meses, se o formato novo funcionou (seção 10).

Existem hoje **107 módulos escolares (535 telas)** + **16 adultos** = 123 lições a converter. Nas contas do formato novo: 123 × 18 itens = **~2.200 itens**. Impossível à mão, e é por isso que o pipeline é o caminho — não por preguiça, por aritmética.

**O que sobrevive de cada módulo atual:**

| Tela v1 | Vira | Trabalho |
|---|---|---|
| `quiz` | 1 `escolha3` da leva de construção | **quase automático** — falta feedback nas duas alternativas erradas |
| `cenario` | enunciado de 1–2 `escolha3` (≤120 car.) | compressão de ~90% |
| `conceito` | fonte da **âncora** (≤70 car.) e do fecho ativo | compressão de ~95% |
| `input` | `estimativa` | **precisa de gabarito com fonte** (IBGE, BC, Anbima) — sem isso é rejeitada |
| `resultado` | uma das três frases do fecho ativo | corte |
| — | as outras ~13 perguntas | **geradas pelo pipeline** |

**Pipeline (`scripts/converter-modulo.ts`):**

1. Lê o módulo, o conceito e as habilidades mapeadas.
2. Gera 18 itens via Vertex, com o contrato da seção 4 no prompt, os limites da seção 5 como validação de saída e **a lição-piloto como exemplo de referência**.
3. **Verificação por código:** toda conta em `escolha3` e `estimativa` é recalculada por função de teste. Item que não bate é regerado (máx. 3 tentativas), depois vai para fila humana.
4. Valida limites, custo somado ≤140s, composição de formatos, 18 itens, feedback em toda alternativa errada.
5. Monta as 15 telas a partir dos itens, na composição canônica, e grava com `slug` idempotente.

**Ordem — por dor, não por numeração:**

| Onda | O quê | Por quê primeiro |
|---|---|---|
| **0** | **1 lição-piloto escrita à mão** (`Quando a dívida vira problema`) | é o exemplo que o pipeline copia — a voz dela se propaga por 123 lições. Não é teste, é molde. |
| **1** | Blocos B e E do EM (planejamento, crédito e dívida) — 7 lições | dor real, e são os módulos mais tocados |
| **2** | Restante do EM — 17 lições | fecha um segmento inteiro |
| **3** | Os 16 adultos | já precisavam de reescrita narrativa de qualquer jeito; a conversão sai junto de graça |
| **4** | Os 83 do Fundamental, do `ef89` para baixo | maior volume, menor urgência |

**Revisão humana amostral:** 100% da onda 0 e 1, 30% da onda 2 e 3, 15% da 4. Um professor lê o texto; o código já garantiu as contas. Isso roda **em paralelo** com o rollout, não antes dele.

---

## 10. Métricas — sem teste, mas não às cegas

Sem portão, a comparação não morre: ela fica **de graça na própria migração**. Enquanto as ondas 3 e 4 ainda estão no formato antigo, elas são a linha de base natural — mesma base de usuários, mesmo produto, formatos diferentes.

| Métrica | Como medir | Meta |
|---|---|---|
| **Ganho intralição** | acurácia nas telas 11–14 menos acurácia na sonda (1–3), mesmo conceito | **+30 p.p.** |
| **Retenção D7** | acurácia em item **de reserva** (nunca visto) 7 dias depois | **≥70%** |
| **Abandono no meio** | sessões que passam da tela 3 e não chegam à 15 | **<20%** |
| **Tempo real** | mediana de `msDecorridos` somados por lição | **110–150s** |
| **Convertida vs. antiga** | conclusão e retorno em 7 dias, formato novo vs. formato antigo | novo **≥** antigo |

Duas checagens de saúde de conteúdo, automáticas em cima de `TentativaItem`:

- **Distrator morto:** alternativa errada escolhida por <3% em 200 exposições → não ensina nada, reescrever.
- **Item quebrado:** acerto <25% (enunciado confuso) ou >95% (trivial) → sai da rotação de revisão sozinho.

> A última linha da tabela é a que importa. Se depois de duas ondas o formato novo não estiver acima do antigo em conclusão e retorno, o problema não era o card flow — e é melhor descobrir isso na onda 2 do que na 4.

---

## 11. O que não fazer

- **Não pontuar item individual.** Ponto por resposta transforma a rajada em caça-níquel e destrói o sinal de nível.
- **Não deixar a revisão devolver uma pergunta da lição.** Os 3 itens de reserva por conceito existem só para isso. Sem eles, a repetição espaçada vira teatro.
- **Não pôr cronômetro na pele adulto.** Pressão de tempo com alguém que está endividado produz ansiedade, não aprendizagem.
- **Não deixar a IA gerar item com conta sem verificação por código.** Um quiz com conta errada custa mais confiança do que dez módulos bons constroem.
- **Não transformar arrastar em requisito.** `ordenar` e `classificar` precisam de alternativa por toque — arrastar quebra em leitor de tela e em mão trêmula, e o alvo de 44×44px do `CLAUDE.md` vale aqui também.
- **Não converter em lote antes da lição-piloto existir.** Não é portão de validação, é molde: o pipeline copia a voz do exemplo que receber. Exemplo ruim, 123 lições ruins.
- **Não deixar o texto voltar por baixo.** Sem telas de leitura, a parede de texto tenta voltar como enunciado de 300 caracteres e feedback de 400. Os limites da seção 5 moram no seed, não na boa vontade de quem escreve.
- **Não encadear duas telas pesadas.** `classificar`, `estimativa` e `caca_erro` custam 3× uma binária. Duas seguidas quebram o ritmo e estouram o orçamento.

---

## 12. Tarefas sequenciais para o Claude Code

Uma por vez, com critério de pronto — mesmo padrão da `FINLOW_SPEC_v3.md`.

**Tarefa A — Schema de conceito e item**
> Aplique a seção 7: models `Conceito`, `ModuloConceito`, `ItemAvaliativo`, `DominioConceito`, `TentativaItem`, e os campos novos em `Tela`. Migration não destrutiva — os valores antigos de `Tela.tipo` continuam válidos.
> **Pronto quando:** migration aplica limpa, `pnpm build` passa, módulos existentes continuam renderizando.

**Tarefa B — Os 6 componentes de formato**
> Um componente por formato da seção 4, dirigido pelo JSON do banco. Atribuição por toque (nunca só arrastar). Feedback de erro bloqueia; acerto avança em ~400ms com a âncora aparecendo por 2s. Respeitar `prefers-reduced-motion` e os 44×44px.
> **Pronto quando:** os 6 formatos renderizam de fixture, sem overflow em 360px, navegáveis por teclado, e uma lição de 15 telas roda ponta a ponta.

**Tarefa C — Motor de repetição espaçada**
> `lib/fixacao/caixas.ts` com a tabela da seção 6.2, `registrarTentativa()` e `itensVencidos(userId, limite)`. Puro, testável, sem chamada de IA.
> **Pronto quando:** teste unitário cobre subir caixa, cair para 1, agendar próxima revisão, e não repetir item já visto do mesmo conceito.

**Tarefa D — Revisão de 60 segundos**
> Faixa no topo da aba Trilha quando há vencidos; sessão de até 8 itens misturados; crédito de `revisao_diaria` com `refId` = data.
> **Pronto quando:** a sessão fecha, as caixas mudam no banco, e rodar duas vezes no mesmo dia credita ponto uma vez só.

**Tarefa E — Módulo de revisão gerado**
> Nó de revisão do bloco monta 8 itens vencidos daquele bloco em tempo de execução, com rótulo `Quiz sem consulta`. Sem conteúdo novo no banco.
> **Pronto quando:** dois usuários com históricos diferentes recebem revisões diferentes do mesmo nó.

**Tarefa F — Lição-piloto + validador de contrato**
> Semear a lição-piloto (`FINLOW_LICAO_PILOTO.md`) e escrever `scripts/validar-licao.ts` com todos os limites da seção 5, incluindo o custo somado por formato.
> **Pronto quando:** a piloto passa no validador, e uma lição com 16 telas, enunciado de 130 caracteres ou custo de 145s é **recusada** com mensagem clara.

**Tarefa G — Instrumentação**
> Gravar `TentativaItem` com tempo e resposta bruta; painel interno com as cinco métricas da seção 10 e as duas de saúde de conteúdo.
> **Pronto quando:** dá para responder "o formato novo retém mais que o antigo?" com número, não com impressão.

**Tarefa H — Pipeline de conversão**
> `scripts/converter-modulo.ts` conforme a seção 9, usando a lição-piloto como exemplo de referência, com verificação de conta por código e fila de revisão humana.
> **Pronto quando:** converter um módulo de EM produz 15 telas válidas e 18 itens, e o script recusa item com conta errada ou `estimativa` sem `fonte`.

---

## 13. Decisões que dependem de você

- **D1 — Onde mora a revisão diária.** Faixa no topo da Trilha (proposta aqui), card no chat, ou notificação? Se o chat é a home do app, a revisão no topo da Trilha só é vista por quem já foi até lá — e quem mais precisa revisar é justamente quem não vai.
- **D2 — Módulo de revisão gerado substitui os ~27 escritos?** A proposta é sim (seção 6.3): resolve o buraco aberto na seção 5 do `FINLOW_TRILHA_ESCOLAR.md` sem produzir 135 telas novas. O custo é que a revisão deixa de ser auditável como conteúdo fixo — se alguma escola exigir ver o material impresso, isso pesa.
- **D3 — Pré-requisito por conceito.** Adotar encerra a contradição corredor-vs-biblioteca entre o `CLAUDE.md` e o prompt do v0, mas exige mapear pré-requisito de conceito antes de qualquer trava aparecer na tela.
- **D4 — Conceitos por módulo.** O padrão proposto é 1 principal + 1 secundário no máximo. Isso quebra alguns módulos atuais que empacotam 3 habilidades (o 14 e o 24 do EM, por exemplo) em dois módulos cada — a trilha de EM sairia de 24 para ~27.
- **D5 — A voz da lição-piloto.** Ela está escrita (`FINLOW_LICAO_PILOTO.md`) e vira o exemplo que o pipeline copia em 123 lições. Ler as 15 perguntas com olho de dona da voz é a última coisa barata deste plano — depois disso, corrigir tom custa 2.200 itens.

---

---

## 14. Segmentos e produção em lote

**O EM virou três segmentos.** `em` deixa de existir como trilha única: `em1` (8 lições, 16 habilidades), `em2` (7, 15) e `em3` (9, 16). A divisão é por bloco temático, posicionando cada tema no ano da decisão — crédito, financiamento estudantil e primeiro emprego caem na 3ª série, que é quando o aluno assina coisas. Detalhe em `FINLOW_TRILHA_EM_POR_SERIE.md`.

Consequência honesta: 7 a 9 lições por série dão ~20 minutos de conteúdo por ano letivo. O que sustenta o ano é a revisão espaçada e os nós de revisão montados em runtime — **não** mais módulos escritos. Se uma escola pedir mais superfície, a resposta é ativar revisão e aprofundamento, nunca inflar a trilha.

**Os três encontros.** Cada conceito gera **três lições** na trilha, intercaladas por bloco (o reforço do bloco A entra junto da apresentação do bloco B — espaçamento embutido na própria ordem):

| Encontro | Papel | Dificuldade | O que muda |
|---|---|---|---|
| 1 · apresentação | o conceito nasce | 1 | sonda antes de explicar, números redondos, contextos comuns |
| 2 · reforço | resgate dias depois | 2 | sonda vira "qual era o critério?", contextos novos, distratores de meio-entendimento |
| 3 · consolidação | transferência | 3 | casos compostos, casos-limite, "quando isto NÃO se aplica" |

As perguntas **nunca se repetem entre encontros** — o gerador guarda os enunciados usados por conceito e os proíbe nos seguintes; repetição detectada = lição rejeitada. Os 3 itens de reserva de cada encontro somam 9 por conceito para o motor de revisão espaçada, que continua operando por cima dos encontros (as caixas de Leitner não mudam).

**Estado da base (123 conceitos · 369 lições · ~6.132 itens):**

| Segmento | Conceitos | Lições | Itens |
|---|---|---|---|
| `ef12` | 5 | 15 | 165 |
| `ef35` · `ef67` | 45 | 135 | 2.025 |
| `ef89` | 33 | 99 | 1.782 |
| `em1` · `em2` · `em3` | 24 | 72 | 1.296 |
| `adulto` | 16 | 48 | 864 |

**A produção é um job noturno, não uma tarefa.** `scripts/gerar-licoes.ts`: uma chamada de modelo por lição, validação de contrato, **recálculo de toda conta por código**, três tentativas com os erros devolvidos ao modelo, e o que não passa vai para `revisao-humana.jsonl` em vez de entrar no banco. Retomável por checkpoint, idempotente por slug, com contagem de tokens em toda chamada.

**Ordem das noites:** EM primeiro (é onde a piloto está) → ler 3 ou 4 lições de manhã → só então adulto e fundamental. Rodar tudo de uma vez funciona, mas se a voz da piloto estiver errada você descobre com 6.132 itens no banco em vez de 430.

*Fontes pedagógicas: efeito de teste e prática de recuperação (Roediger & Karpicke), efeito de pré-teste (Richland, Kornell & Kao), prática espaçada e intercalada (Cepeda et al.; Rohrer & Taylor), feedback corretivo elaborado (Hattie & Timperley). Cobertura curricular: Matriz de Competências de Letramento Financeiro, 2025 — Banco Central do Brasil / Aprender Valor.*
