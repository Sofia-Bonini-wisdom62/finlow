# Matriz de Letramento Financeiro do Banco Central — leitura para o Finlow

Fonte: **Matriz de Competências de Letramento Financeiro (2025)**, Banco Central do Brasil
com CAEd/UFJF, ANBIMA, Sebrae e CVM — base do Programa Aprender Valor.
<https://aprendervalor.bcb.gov.br/content/cidadaniafinanceira/documentos_cidadania/Matriz%20Geral.pdf>

As 199 competências extraídas estão em [`matriz-bcb-competencias.json`](./matriz-bcb-competencias.json),
com código, texto, unidade temática e página de origem.

---

## O que essa matriz é — e o que ela não é

É um **currículo escolar**, do 1º ano do fundamental à 3ª série do médio, escrito para
professores sob a BNCC. Os códigos seguem a faixa: `EF12LF` (1º/2º ano) … `EM13LF` (ensino
médio). O verbo de cada competência marca a progressão cognitiva — começa em "identificar",
termina em "avaliar".

**Não é um framework para adultos.** Usar como roteiro produziria conteúdo escolar para um
público que já paga aluguel. O valor dela para o Finlow é outro: é uma **régua de cobertura**
construída pelo regulador, com autoridade pública, que responde à pergunta "o que uma pessoa
precisa saber sobre dinheiro no Brasil". A faixa `EM13LF` (39 competências) é a mais próxima
do adulto e é de onde vale puxar tema.

---

## As 8 unidades temáticas

| Unidade | Competências | Ensino médio | Do que trata |
|---|---:|---:|---|
| Planejamento | 39 | 4 | Orçamento pessoal e familiar, prioridades, necessidade × desejo, custo de oportunidade, inflação |
| Crédito e endividamento | 30 | 5 | Crédito, juros, CET, inadimplência, superendividamento, renegociação, cadastro positivo |
| Renda e empreendedorismo | 29 | 6 | Fontes de renda, informalidade, direitos trabalhistas, negócio próprio |
| Circulação social do dinheiro | 27 | 6 | Meios de pagamento, Pix, câmbio, formação de preço, **leitura de documentos financeiros** |
| Cenário financeiro e cidadania | 26 | 8 | Selic, inflação, PIB, tributos, direitos do consumidor, papel de BC/CVM/Susep/Procon |
| Poupança e investimento | 22 | 7 | Poupar × investir, risco/rentabilidade/liquidez, renda fixa e variável, aposentadoria |
| Risco e proteção | 14 | 3 | Golpes e fraudes, segurança em transação digital, seguros, proteção de dados |
| Consumo | 12 | 0 | Consumo planejado, consumismo, técnicas de venda, consumo consciente |

---

## Onde o Finlow está hoje

Os 16 módulos atuais (104 telas) mapeados nas unidades da matriz:

| Unidade da matriz | Módulos Finlow | Cobertura |
|---|---|---|
| Consumo | `impulsivo-m1..m4`, `guardador-m4-prazer`, `lancador-m4-freio` | **Saturada** — 6 dos 16 módulos |
| Planejamento | `lancador-m1-fluxo`, `lancador-m2-respiro`, `guardador-m2-valor-livre` | Boa no orçamento; sem inflação, sem fixo × variável, sem imprevisto |
| Poupança e investimento | `lancador-m3-meta-ancora`, `guardador-m1`, `guardador-m3-investir`, `sonhador-m1..m4` | Metas bem cobertas; investimento é **um módulo raso** |
| **Crédito e endividamento** | — | **Zero** |
| **Risco e proteção** | — | **Zero** |
| **Circulação social do dinheiro** | — | **Zero** |
| **Renda e empreendedorismo** | — | **Zero** |
| **Cenário financeiro e cidadania** | — | **Zero** |

O Finlow cobre 3 das 8 unidades, e concentra 6 módulos numa unidade que é a **menor** da
matriz (12 competências, nenhuma no ensino médio). As cinco unidades vazias incluem
exatamente as que mais pesam na vida de um adulto brasileiro.

---

## Lacunas em ordem de urgência

O critério não é "quantas competências a matriz tem", é **quanto dinheiro o usuário perde
hoje por não saber isso**.

### 1. Crédito e dívida — a lacuna mais cara
Rotativo do cartão passa de 400% ao ano no Brasil. Nenhum dos 16 módulos toca no assunto.
Competências-âncora: `EM13LF26` (comparar empréstimos pelo **CET**, não pela parcela),
`EM13LF27` (calcular juros e multa, propor renegociação), `EM13LF28` (consequências do
endividamento excessivo), `EM13LF29` (cadastro positivo).

### 2. Golpes e fraudes — a lacuna mais imediata
`EM13LF36` (segurança em transação física e digital) e `EM13LF37` (casos de golpe e
prevenção). Pix tornou isso rotina, e o BC incluiu na revisão de 2024 justamente por isso.

### 3. Ler os próprios documentos — a lacuna mais silenciosa
`EM13LF06`: interpretar fatura, boleto, extrato, contrato, informe de rendimentos, apólice.
É a que mais conversa com o resto do produto: o Chat e as Análises já leem os números do
usuário — falta ensinar o usuário a ler os dele.

### 4. Investimento de verdade
Hoje há um módulo ("Dinheiro parado encolhe"). A matriz pede `EM13LF17` (risco ×
rentabilidade × liquidez), `EM13LF20` (plano com revisão periódica), `EM13LF15`/`EM13LF16`
(aposentadoria e previdência) — nada disso existe.

### 5. Inflação e o cenário que mexe no bolso
`EM13LF10` (efeito da inflação por grupo socioeconômico) e `EM13LF44` (Selic, inflação,
desemprego, PIB ligados à vida do indivíduo). Explica por que a reserva "parada" encolhe —
dá base ao módulo de investimento em vez de deixá-lo solto.

### 6. Renda — o lado que o Finlow ignora
Todos os 16 módulos tratam do que sai. `EM13LF30` (determinantes da renda) e `EM13LF31`
(informalidade e precarização) tratam do que entra. Relevante para quem é autônomo, MEI ou
trabalha por app.

---

## Como usar sem virar apostila

Três regras, se essa expansão for adiante:

1. **Tema vem da matriz, formato e voz continuam sendo do Finlow.** Card flow de 5 telas,
   2 minutos, um número no fim. A matriz responde "sobre o quê", nunca "como".
2. **A competência é critério de aceite, não título de aula.** "Comparar empréstimos pelo
   CET" vira *"A parcela cabe. E o total?"* — o usuário nunca lê a sigla `EM13LF26`.
3. **Nada de conteúdo escolar.** Os verbos da matriz ("discutir", "elaborar textos") são de
   sala de aula. Para adulto o teste é outro: a tela resolve alguma coisa hoje?

O ganho colateral é de credibilidade: um app de finanças alinhado à matriz do **Banco
Central** tem o que dizer numa landing e numa conversa de captação — desde que o alinhamento
seja real e verificável, e não um selo.

---

## Ressalva de conteúdo, independente da matriz

> **RESOLVIDA (03/08/2026).** A ressalva abaixo descrevia o estado de julho/2026
> e fica como histórico. A voz foi reescrita para adultos, a T1 foi reformada
> (resquícios dos 4 perfis removidos) e a T2 (27 módulos) já nasceu adulta.

Os 104 telas da época falavam com adolescente — "mesada", "Bia, 16 anos", "a maioria dos
jovens não sabe", valores de R$ 120. Depois do pivô para adultos, esse texto estava em
conflito com o produto. Qualquer expansão de base deveria vir junto com a reescrita de voz
dos módulos existentes, senão a base cresceria torta.
