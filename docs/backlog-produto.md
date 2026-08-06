# Backlog de produto

O que está na fila, na palavra de quem decidiu. Este arquivo é **intenção**, não
entrega — o que existe de verdade está em [`estado-do-produto.md`](estado-do-produto.md).

Registrado em 05/08/2026.

---

## ~~Tela de objetivos~~ — entregue em 06/08/2026

Construir uma nova tela onde se pode registrar novos objetivos financeiros para
guardar dinheiro para eles, uma coisa meio sonho.

> ✅ **Feito.** `/objetivos`, com alvo, prazo opcional, emoji e o quanto já foi
> separado. O que existe está descrito em
> [`estado-do-produto.md`](estado-do-produto.md#objetivos-financeiros-06082026).
>
> Uma decisão que o pedido não resolvia: **guardar num objetivo não mexe no
> saldo do Painel**. O valor já foi contado quando entrou, e descontá-lo de novo
> faria a mesma quantia sumir duas vezes do dash — então o campo é marcador de
> progresso, e quem transferiu de verdade registra a transferência no Painel. Se
> a intenção era o outro comportamento (objetivo como "cofre" que debita), é
> reversível, mas precisa vir junto de uma regra para o dash não contar em dobro.

## Tela de perfil a reconfigurar

Nome e foto no topo, saldo atual + (entrada + saída) do mês, logo abaixo. Aí sim
o gráfico de rosca e os 4 botões que tem atualmente.

> Nota de quem entregou os Objetivos: a entrada da tela nova está hoje em
> **Menu > Meus objetivos**, e não como quinta porta no Perfil — cinco botões
> quebrariam a grade de dois em dois, e os quatro atuais são deliberadamente do
> mesmo tamanho. Se a reconfiguração mudar essa grade, promover Objetivos a
> porta é o lugar natural dele.

## Conector Open Finance

Criar a possibilidade de conexão Open Finance, onde o usuário pode conectar os
bancos direto no app, para puxar extrato, saldo atual, contas fixas e etc,
atualizando em tempo real ou diariamente.

> ⚠️ **Muda uma decisão registrada.** Até 05/08/2026 o Open Finance estava
> documentado como *fora deste repo* (outra frente), no `README.md` e na tabela
> de [`estado-do-produto.md`](estado-do-produto.md). Entrar aqui significa que o
> repo passa a tocar no tema — e que a frase do README sobre não tocar precisa
> sair no mesmo commit em que o trabalho começar.

## Melhorar prompt e personalização do agente

Permitir que o agente se conecte melhor com o usuário por uma definição de
personalidade de resposta.

## Tela de fim de cada lição

Ao final de cada lição adicionar uma telinha de checkout com o XP que o usuário
ganhou, o tempo que ele levou na lição, o quanto ele acertou e o conceito que ele
aprendeu nessa lição.

## Divisão dos 4 tipos de lição na trilha

Dividir os módulos existentes em 4 partes, e apenas quando as 4 lições forem
feitas é que se vai pro próximo módulo. As quatro lições são respectivamente:

1. **Novo conceito!** Quiz de pergunta sobre o assunto, com consulta.
2. **História!** Exemplo de contexto prático numa historinha com perguntas
   durante a lição.
3. **Revisão!** Quiz de pergunta sobre o assunto, sem consulta.
4. **Aplicação!** A IA interpreta o contexto do próprio usuário e faz uma
   pergunta sobre o assunto dentro do conceito dele. *(EXTRA)*

> ⚠️ **Inverte a arquitetura atual da Trilha.** Hoje nenhum módulo é bloqueado
> por sequência: a trilha é *biblioteca posicionada*, não corredor — a aula é
> achada por nível e situação, e travar a aula 3 até concluir a 2 foi removido de
> propósito, porque transformava quem veio tirar uma dúvida específica em alguém
> que desiste. A regra está escrita em `prisma/schema.prisma` (comentário de
> `Modulo.situacoes`), em `lib/situacoes.ts`, em `app/trilha/page.tsx` e em
> [`backlog-trilha-t2.md`](backlog-trilha-t2.md). Voltar ao corredor é uma
> decisão legítima, mas precisa desfazer essa documentação junto — senão o repo
> volta a descrever um produto que não existe.

## Remodelagem dos módulos

Agora em trilha! Blocos em ordem, ordenados pela IA: ela entende o contexto do
usuário e edita a fila de prioridade dos blocos para que seja personalizada para
ele.

## Popular a base desde o 1º ano

Implementar todo o conteúdo dos assuntos desde o 1º ano.
