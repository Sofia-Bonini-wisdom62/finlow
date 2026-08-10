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
| [`matriz-bcb-competencias.json`](matriz-bcb-competencias.json) | A matriz em dado estruturado — **incompleta, ver aviso abaixo** | Nunca sozinha: rode `scripts/testar-matriz.mts` |

> ⚠️ **`matriz-bcb-competencias.json` perdeu 31 entradas na extração do PDF.**
> Tem 199 chaves, mas as sequências de cada faixa vão até 230 no total — faltam
> 2 em EF12, 6 em EF35, 4 em EF67, 11 em EF89 e 8 em EM13. Não dá para completar
> a partir do repositório: `matriz-bcb.md` cita só 15 códigos e nenhum dos que
> faltam. Enquanto isso não for refeito a partir do documento do Banco Central,
> **não use este arquivo como veredito de cobertura** — ele acusa como ausente
> um código que existe na matriz de verdade.
>
> `scripts/testar-matriz.mts` mede o que dá para medir com honestidade: hoje os
> 107 módulos escolares declaram 230 habilidades distintas, sem duplicata, e
> cobrem **todos** os 199 códigos que o JSON conhece. Os 31 restantes batem
> exatamente com os buracos do JSON — indício forte de que a cobertura é
> integral e o defeito é do arquivo, não do conteúdo.
| [`pagamento-antes-de-cobrar.md`](pagamento-antes-de-cobrar.md) | O que falta para sair do modo de teste e cobrar de verdade — quase tudo passo no painel da Stripe ou na Vercel | **Antes de trocar `sk_test` por `sk_live`** |
| [`banco/`](banco/README.md) | O banco em SQL: arquitetura das tabelas, RLS e os dados de sistema (módulos, telas, indicadores) | Ao consultar o esquema sem abrir o Supabase, ou ao recriar o banco do zero |

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
   tem um aviso ⚠️: ela inverte uma decisão registrada, e a documentação que
   ela contraria precisa cair no mesmo commit em que o trabalho começar. Foi o
   que aconteceu com a trilha em corredor (06/08/2026) — o aviso serviu para
   pôr o custo à mesa antes da decisão, não para impedi-la. Open Finance é o
   que ainda está de pé com ⚠️.

## O que NÃO mora aqui

- **`CLAUDE.md`** — está fora do repositório, na pasta acima
  (`2026/Claude/CLAUDE.md`), porque é o arquivo de contexto que a ferramenta lê
  a partir do diretório de trabalho. Atenção: ele ainda descreve o produto
  **anterior ao pivô** (público de 13–18 anos, diagnóstico de 4 perguntas,
  identidade visual navy/verde). Stack, regras de LGPD e a regra R8 do Painel
  seguem válidas; o resto é histórico.
- **`secrets/README.md`** — nota operacional que precisa estar ao lado dos
  segredos que ela descreve, não num índice.
