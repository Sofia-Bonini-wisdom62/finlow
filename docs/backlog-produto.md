# Backlog de produto

O que está na fila, na palavra de quem decidiu. Este arquivo é **intenção**, não
entrega — o que existe de verdade está em [`estado-do-produto.md`](estado-do-produto.md).

Registrado em 05/08/2026.

---

## Tela de objetivos

Construir uma nova tela onde se pode registrar novos objetivos financeiros para
guardar dinheiro para eles, uma coisa meio sonho.

## Tela de perfil a reconfigurar

Nome e foto no topo, saldo atual + (entrada + saída) do mês, logo abaixo. Aí sim
o gráfico de rosca e os 4 botões que tem atualmente.

## Conector Open Finance

Criar a possibilidade de conexão Open Finance, onde o usuário pode conectar os
bancos direto no app, para puxar extrato, saldo atual, contas fixas e etc,
atualizando em tempo real ou diariamente.

> ~~⚠️ **Muda uma decisão registrada.** Até 05/08/2026 o Open Finance estava
> documentado como *fora deste repo* (outra frente), no `README.md` e na tabela
> de [`estado-do-produto.md`](estado-do-produto.md). Entrar aqui significa que o
> repo passa a tocar no tema — e que a frase do README sobre não tocar precisa
> sair no mesmo commit em que o trabalho começar.~~
>
> ✅ **Essa trava caiu, e já tinha caído.** A documentação que o item contrariava
> mudou no commit `e15e4c4`, que está na main: `README.md`,
> [`estado-do-produto.md`](estado-do-produto.md) e
> [`resumo-de-funcao.md`](resumo-de-funcao.md) já descrevem o conector como
> planejado deste repo. O último resto — o comentário de `Investimento` no
> `schema.prisma`, que ainda dizia "este repo não toca nisso" — caiu em
> 11/08/2026. **Não há mais decisão registrada sendo contrariada.**
>
> 🔴 **O que ainda trava, e é decisão sua, não de código:** Open Finance no
> Brasil não se conecta sozinho. É preciso escolher um agregador regulado
> (Pluggy, Belvo, Klavi ou equivalente), o que traz contrato, custo por conta
> conectada e credencial de produção. Nenhuma dessas três coisas se decide
> dentro do repositório, e por isso o conector não foi começado.
>
> 🟢 **O que já dá para construir sem essa decisão, e foi construído:**
> a metade da ingestão. Ver "Conferência de duplicata" abaixo — sincronizar
> diariamente significa, por definição, receber a mesma transação de novo todo
> dia, e sem deduplicação um conector multiplicaria o histórico da pessoa pelo
> número de sincronizações.

### ~~Conferência de duplicata na entrada de dados~~ ✅ 11/08/2026

Primeira metade do conector, e independente de qual agregador for escolhido:
o extrato passa a conferir o que chega contra o que já está lançado.

> **Era defeito de hoje, não só preparo para amanhã.** Nada no caminho do
> extrato comparava as linhas novas com o histórico. Como `limitarA3Meses` corta
> em 3 meses, subir jan–mar e depois fev–abr era o caso comum — e gravava
> fevereiro e março duas vezes, com o dash contando o dobro e nenhum sinal na
> tela.
>
> A regra mora em [`lib/extrato/duplicatas.ts`](../lib/extrato/duplicatas.ts),
> pura e sem banco, porque `descricao` e `valor` são cifrados com IV aleatório:
> o mesmo texto vira cifra diferente a cada gravação, então não existe índice
> único nem comparação em SQL que resolva — tem de ser em memória, depois de
> decifrar. `scripts/testar-duplicatas.mts` exercita as duas direções sem banco.
>
> **Nunca apaga.** Linha com descrição igual chega desmarcada; mesmo dia e valor
> com outro nome chega marcada e sinalizada. Repetição legítima existe (dois
> cafés de R$ 12 no mesmo dia), e desmarcar linha verdadeira faz faltar dinheiro
> no total tanto quanto duplicata faz sobrar.

## Melhorar prompt e personalização do agente

Permitir que o agente se conecte melhor com o usuário por uma definição de
personalidade de resposta.

## ~~Tela de fim de cada lição~~ ✅ 06/08/2026

Ao final de cada lição adicionar uma telinha de checkout com o XP que o usuário
ganhou, o tempo que ele levou na lição, o quanto ele acertou e o conceito que ele
aprendeu nessa lição.

> Entregue em `components/trilha/FimDaLicao.tsx`. Os quatro números vêm do
> servidor, inclusive os acertos — se a tela calculasse o próprio acerto, ela
> poderia discordar do XP que foi creditado.

## ~~Divisão dos 4 tipos de lição na trilha~~ ✅ 06/08/2026

Dividir os módulos existentes em 4 partes, e apenas quando as 4 lições forem
feitas é que se vai pro próximo módulo. As quatro lições são respectivamente:

1. **Novo conceito!** Quiz de pergunta sobre o assunto, com consulta.
2. **História!** Exemplo de contexto prático numa historinha com perguntas
   durante a lição.
3. **Revisão!** Quiz de pergunta sobre o assunto, sem consulta.
4. **Aplicação!** A IA interpreta o contexto do próprio usuário e faz uma
   pergunta sobre o assunto dentro do conceito dele. *(EXTRA)*

> ✅ **Decidido e entregue.** A ressalva abaixo era real e foi posta à mesa antes
> de começar; Sofia escolheu o corredor com ela à vista, na variante que trava
> **entre módulos**. O custo está aceito e registrado: quem chega com dúvida no
> módulo 5 passa pelos quatro primeiros. A regra mora em `lib/corredor.ts`, é
> conferida no servidor, e a documentação da biblioteca posicionada caiu no
> mesmo commit.
>
> ~~⚠️ Inverte a arquitetura atual da Trilha. Hoje nenhum módulo é bloqueado por
> sequência: a trilha é biblioteca posicionada, não corredor — a aula é achada
> por nível e situação, e travar a aula 3 até concluir a 2 foi removido de
> propósito, porque transformava quem veio tirar uma dúvida específica em alguém
> que desiste.~~
>
> **O que ficou de fora, e é conteúdo, não código:** a lição "História!" hoje é
> a tela de cenário sozinha — falta a parte de "perguntas durante a lição". E a
> "Aplicação!" usa as telas de input e resultado, que já trabalham com os
> números da pessoa, mas ainda não é a IA gerando pergunta (era marcado EXTRA).
> Os 4 módulos sem tela de cenário ficam com 3 lições em vez de 4.

## ~~Remodelagem dos módulos~~ ✅ 06/08/2026

Agora em trilha! Blocos em ordem, ordenados pela IA: ela entende o contexto do
usuário e edita a fila de prioridade dos blocos para que seja personalizada para
ele.

> É a ordem do corredor: a sequência sai de `RecomendacaoTrilha`, montada pela
> IA a partir dos números da pessoa. Duas pessoas têm corredores diferentes — é
> o que impede o corredor de virar uma fila única igual para todo mundo.

## Popular a base desde o 1º ano

Implementar todo o conteúdo dos assuntos desde o 1º ano.
