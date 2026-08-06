# Governança do Finlow

Toda a documentação do projeto mora nesta pasta. Se um documento novo não estiver
aqui, ele está no lugar errado.

A única exceção deliberada é o [`README.md`](../README.md) da raiz: o GitHub o
usa como página de entrada do repositório, e movê-lo faria o repo parecer vazio
para quem chega de fora. Ele é a porta; esta pasta é a casa.

---

## Os documentos

| Documento | O que responde | Quando ler |
|---|---|---|
| [`estado-do-produto.md`](estado-do-produto.md) | O que existe **de verdade** no código, promessa por promessa | Antes de afirmar que algo está pronto |
| [`resumo-de-funcao.md`](resumo-de-funcao.md) | O que cada peça **faz**, função por função, e onde a promessa não encontrou a entrega | Ao entrar no projeto, ou ao explicar o produto para alguém |
| [`backlog-produto.md`](backlog-produto.md) | O que está na **fila**, na palavra de quem decidiu | Antes de começar algo novo |
| [`backlog-trilha-t2.md`](backlog-trilha-t2.md) | Especificação dos módulos da Trilha (Temporada 2+) | Ao escrever conteúdo de aula |
| [`matriz-bcb.md`](matriz-bcb.md) | A Matriz de Competências do Banco Central, lida e mapeada | Ao escrever ou revisar aula da trilha de Ensino Médio |
| [`matriz-bcb-competencias.json`](matriz-bcb-competencias.json) | A mesma matriz em dado estruturado, para conferência por código | Ao verificar cobertura de habilidades |
| [`banco/`](banco/README.md) | O banco em SQL: arquitetura das 26 tabelas, RLS e os dados de sistema (módulos, telas, indicadores) | Ao consultar o esquema sem abrir o Supabase, ou ao recriar o banco do zero |

## A regra que sustenta a pasta

**Documentação e código mudam no mesmo commit.**

Não é preferência de organização. O `README` deste repositório passou meses
descrevendo um app de educação financeira para adolescentes de 13–18 anos que já
não existia — o produto tinha pivotado para clareza financeira com IA para
adultos, e ninguém que lesse a documentação descobriria isso. O
`estado-do-produto.md` nasceu exatamente para que não se repita.

Daí decorre o resto:

1. **Entregou algo?** A linha correspondente em `estado-do-produto.md` vira ✅ no
   mesmo commit, com o caminho do arquivo que prova.
2. **Decidiu algo que contraria o que está escrito?** O documento antigo muda
   junto — não se acrescenta a decisão nova deixando a antiga de pé. Duas
   verdades no repositório é pior que nenhuma.
3. **Vai começar algo do `backlog-produto.md`?** Confira antes se aquela linha
   tem um aviso ⚠️. Dois itens de hoje invertem decisões registradas (Open
   Finance e a trilha em corredor); a documentação que eles contrariam precisa
   cair no mesmo commit em que o trabalho começar.

## O que NÃO mora aqui

- **`CLAUDE.md`** — está fora do repositório, na pasta acima
  (`2026/Claude/CLAUDE.md`), porque é o arquivo de contexto que a ferramenta lê
  a partir do diretório de trabalho. Atenção: ele ainda descreve o produto
  **anterior ao pivô** (público de 13–18 anos, diagnóstico de 4 perguntas,
  identidade visual navy/verde). Stack, regras de LGPD e a regra R8 do Painel
  seguem válidas; o resto é histórico.
- **`secrets/README.md`** — nota operacional que precisa estar ao lado dos
  segredos que ela descreve, não num índice.
