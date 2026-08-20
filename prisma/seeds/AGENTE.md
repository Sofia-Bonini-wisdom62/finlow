# Instruções para o agente de produção de lições — Finlow

Você escreve lições de educação financeira para o Finlow. Sua saída são ARQUIVOS JSON em `/root/seed/licoes/`, um por lição, validados pelo script de contrato antes de você terminar.

## Antes de escrever qualquer coisa

1. Leia `/root/seed/licoes/quando-a-divida-vira-problema.json` — é a lição-piloto, o molde de voz e estrutura. Copie a voz dela: direta, adulta, sem coach, sem condescendência.
2. Leia o SEU arquivo de lote (o caminho vem no seu prompt). Ele tem 4 conceitos (ou menos), cada um com título, segmento, nível, habilidades da matriz do Banco Central (com texto completo), a composição exata de telas e os slugs das 3 lições.

## O que produzir

Para CADA conceito do lote: **3 lições** (encontros 1, 2 e 3), salvas como `/root/seed/licoes/<slug>.json` usando exatamente os slugs do lote. Formato do arquivo:

```json
{
  "slug": "<slug da lição>",
  "segmento": "<segmento do lote>",
  "conceitoPrincipal": "<slugBase do conceito>",
  "fraseConceito": "a definição do conceito em ≤140 caracteres (só no encontro 1)",
  "telas": [ ...na composição exata do lote, na ordem... ],
  "reserva": [ ...exatamente 3 itens... ]
}
```

## Os três encontros

- **Encontro 1 (apresentação, dificuldade 1):** o conceito nasce. Sonda antes de qualquer explicação; números redondos; contextos comuns.
- **Encontro 2 (reforço, dificuldade 2):** dias depois. A sonda vira resgate ("qual era o critério?"); contextos novos; números menos redondos; distratores que exploram erros de quem entendeu pela metade.
- **Encontro 3 (consolidação, dificuldade 3):** transferência. Situações compostas, casos-limite, "quando isto NÃO se aplica".
- **PROIBIDO repetir ou parafrasear enunciado entre os 3 encontros.** O validador compara os textos e rejeita.

## Contratos por formato (campos exatos)

`binaria`: `{ "papel", "formato":"binaria", "conceitoId", "criterio" (≤40 car., fixo no topo), "enunciado" (≤70 car.), "resposta": true|false, "ancora" (≤70 car.), "feedbackErro" (≤160 car.) }`

`escolha3` e `fecho`: `{ "papel", "formato", "conceitoId", "dificuldade", "pergunta" (≤120 car.), "ancora" (≤70; opcional no fecho), "alternativas": [3 itens: { "texto" (≤60 car.; no fecho ≤80), "correta": true|false, "feedbackErro": "≤160 car." ou null na correta }] }` — exatamente 3 alternativas, exatamente 1 correta, feedback obrigatório nas 2 erradas.

`ordenar`: `{ "papel":"pratica", "formato":"ordenar", "conceitoId", "instrucao" (≤70 car.), "ancora", "feedbackErro" (≤160 car., explica o critério), "itens": [3–4 de { "texto", "posicaoCorreta": 1.. }] }`

`classificar`: `{ "papel", "formato":"classificar", "conceitoId", "instrucao" (≤70), "ancora", "feedbackErro", "caixas": [2 de { "id", "rotulo" }], "itens": [4 de { "texto", "caixaCorreta": "<id>" }] }`

`estimativa`: `{ "papel":"aplicacao", "formato":"estimativa", "conceitoId", "pergunta" (≤100), "campo": "moeda"|"percentual"|"numero", "min", "max", "gabarito", "toleranciaPct": 20, "fonte": "origem pública nomeada", "feedbackPerto" (≤160), "feedbackLonge" (≤160, nomeia o viés) }`

`reserva`: 3 itens com `"papel":"reserva"`, pelo menos 2 formatos diferentes entre si, formatos de preferência diferentes dos mais usados na lição.

## Regras que derrubam a lição no validador

- Seguir a composição do lote TELA A TELA (papel na ordem exata). Nas posições `ordenar` pode usar `classificar` e vice-versa; na posição `estimativa` use `estimativa` (não use `caca_erro` — não há peças gráficas ainda).
- **Toda conta tem `"verificacao": { "expressao": "...", "esperado": N }`.** A expressão só pode ter números e `+ - * / ( ) . ^` (use `^` para potência; SEM funções, SEM letras). Ela é recalculada por código; se não bater, rejeitada. Confira você mesmo a aritmética antes de escrever. Se o item não tem conta, omita o campo.
- `estimativa` de preferência com gabarito derivado de conta (verificável). Se for estatística externa, use ordem de grandeza estável e `fonte` genérica correta (ex.: "taxa média do rotativo, ~14% ao mês (Banco Central)").
- Feedback de erro sempre no formato: o que a alternativa acerta → onde falha → o critério que resolve. Nunca "Errado, tente de novo".
- Sem jargão sem explicação na mesma tela (≤12 palavras). Sem tom de coach. Sem recomendação de investimento específico (ensine o critério, nunca o produto).
- Nome próprio: no máximo 1 por lição, só em `pergunta` de `escolha3`. Nomes brasileiros variados (nunca João/Maria).
- Números realistas do Brasil: rotativo ~14% a.m., cheque especial ~8% a.m., consignado ~1,8% a.m., poupança ~0,5% a.m., Selic ~15% a.a., IPCA ~4-5% a.a.
- Cada habilidade da matriz listada no lote precisa aparecer DE FATO nas perguntas dos 3 encontros — não só no título.
- Público escolar: `ef12` = 6–8 anos (frases curtíssimas, dinheiro do cotidiano: troco, cofrinho, lanche); `ef35` = 8–11; `ef67` = 11–13; `ef89` = 13–15; `em*` = 15–18. Ajuste vocabulário e contexto SEM infantilizar além do necessário.

## Ciclo de trabalho (obrigatório)

1. Escreva os 12 arquivos (ou o que o lote pedir).
2. Rode: `cd /root/seed && npx tsx scripts/validar-tudo.ts 2>&1 | grep -A6 "<seus slugs>"` — ou sem grep e leia as linhas dos seus arquivos.
3. Corrija TODO erro apontado e rode de novo, até suas lições saírem sem nenhum ✗.
4. Resposta final: APENAS uma linha por lição: `slug · telas · ok` e o total de itens escritos. Nada de análise.

O validador é a autoridade. Não discuta com ele.

## Modo continuação (quando o prompt disser "produza SÓ estas lições")

Alguns encontros dos seus conceitos podem já existir em /root/seed/licoes/. Nesse caso:
1. LEIA os arquivos existentes dos seus conceitos antes de escrever — os enunciados deles são PROIBIDOS nas suas lições novas (o validador compara).
2. NÃO edite nem reescreva os arquivos existentes. Escreva apenas os slugs listados no prompt.
3. O resto do fluxo é igual: validar até sair limpo, resumo final de uma linha por lição.
