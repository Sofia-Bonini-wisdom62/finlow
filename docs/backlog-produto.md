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

## Finlow para Escolas — em desenvolvimento (11/08/2026)

Decisão da fundadora, desenhada em quadro branco: o canal escolar reabre como
**Finlow para Escolas**. Entrada dupla (escola × usuário comum) e três papéis:

- **Professor** — cria turma/grupo; concede acesso a trilha/bloco/módulo;
  competências (concedidas pelo adm) filtram o que ele enxerga e gerencia;
  vê desempenho individual e geral (aluno/grupo); habilita o rank da turma
  com escopo sala, ano ou escola.
- **Aluno** — entra por convite com código, cai na turma e no segmento certo;
  faz a trilha do segmento em corredor (sem IA, ordem pedagógica dos blocos);
  vê o rank da sala; tem o **app completo como um usuário premium comum**.
- **Adm da escola** — cria professores e alunos (via convites), concede
  competências, vê o desempenho geral das salas.

> ⚠️ **Muda uma decisão registrada.** `backlog-trilha-t2.md` declarava "B2B
> escolar e BNCC como canal de venda" mortos ("o v3 é B2C puro"). O parágrafo
> caiu no mesmo commit em que este trabalho começou, como manda a regra da
> pasta. O produto adulto continua B2C por assinatura; a escola é um canal
> paralelo sobre o mesmo conteúdo.

**Decisões de desenho (fundadora, 11/08/2026):**

- Escopo: o quadro completo, construído em etapas — cada etapa um commit
  deployável.
- Alunos e professores entram por **convite com código** (multiuso, por
  turma); a escola e a conta do adm nascem por **script manual**
  (`scripts/criar-escola.mts`) — sem UI de signup B2B e sem cobrança B2B
  neste repo por enquanto.
- Membro de escola ativa conta como **premium** (quem decide continua sendo
  só `lib/pagamento/acesso.ts`).

**Pendências abertas que esta frente cria (não bloqueiam build; bloqueiam
venda):**

- **LGPD de menores** — rank entre colegas expõe apelido+pontos de menor de
  idade; consentimento de responsável (`consentimentoLGPD`, reservado no
  schema) precisa de texto jurídico antes de escola real com menores.
  Relaciona-se com a pendência R1 (política de retenção).
- **Cota de IA por aluno** — premium por escola ganha teto próprio
  (`TETO_ESCOLA_TOKENS`) em vez do Infinity do assinante; o número é
  afinável e a fundadora pode derrubar o teto quando quiser.
- **Rank por eventos escolares** — a primeira versão do rank da sala usa
  `User.pontos` total (pontos de uso pessoal contam); recortar por eventos
  dos módulos do segmento fica para uma segunda rodada.
- **`preRequisitoSlug` segue inerte** — o corredor escolar usa a ordem
  linear dos blocos, que na prática cobre o grafo de pré-requisitos; ligar o
  grafo de verdade é projeto próprio.

---

## Avaliação de UX — jornada como usuário Gen Z (11/08/2026)

Walkthrough completo feito como um usuário de 20 e poucos anos chegando pelo
celular: landing ao vivo + todas as telas internas. Conclusão geral: **o miolo
do app é bom; o funil de entrada é que está de costas para o produto** — os
quatro primeiros itens acontecem antes de a pessoa ver qualquer qualidade.
Lista do mais crítico ao mais simples; cada item é um trabalho independente.

1. ~~**🔴 Landing sem porta de entrada.**~~ ✅ **12/08/2026.** A home é só lista
   de espera: não existe nenhum link "Entrar" ou "Criar conta" — nem no header,
   nem no footer (`app/page.tsx`). Quem já tem conta precisa adivinhar `/login`
   na URL. E o FAQ responde "O Finlow já está disponível? — Ainda não"
   (`components/landing/Faq.tsx:6`) com o app no ar no mesmo domínio. Agrava:
   o Menu logado aponta "Perguntas frequentes" para esse mesmo FAQ
   (`app/(app)/ajustes/page.tsx:347`).

   > **As duas metades se obrigam.** Dar a porta sem mexer no FAQ deixaria a
   > home dizendo "ainda não abriu" ao lado de um botão de criar conta; corrigir
   > o FAQ sem dar a porta deixaria "sim, está disponível" sem caminho nenhum.
   > Por isso caíram no mesmo commit.
   >
   > **O que mudou:** `Entrar` (`/login`) e `Criar conta` (`/cadastro`) no
   > cabeçalho, no hero ("Já tem conta? Entrar") e no rodapé; o CTA do hero
   > deixou de apontar para a lista e virou "Criar conta grátis"; o FAQ responde
   > "Sim" e descreve o que dá para fazer hoje; a `description` do
   > `app/layout.tsx` parou de vender lista de acesso antecipado.
   >
   > **A lista de espera virou "acompanhar por e-mail", e nada foi apagado.**
   > Com `/cadastro` aberto, "avisamos assim que o acesso abrir" era promessa
   > vencida — quem deixava o e-mail já podia entrar naquele minuto. A tabela
   > `Waitlist`, a rota `/api/waitlist` e a limpeza no delete de conta continuam
   > exatamente as mesmas; mudou só o que a tela promete. A seção final agora
   > oferece criar conta primeiro e o e-mail como segunda opção.
   >
   > **O link do Menu não precisou mudar:** ele aponta para `/#faq`, que passou
   > a dizer a verdade. O teste confere que ele continua apontando para lá — se
   > alguém mudar o destino, é para saber.
   >
   > **Guardado por `scripts/testar-landing.mts`** (roda sem banco, sem build):
   > confere que as portas existem no cabeçalho, no hero e no rodapé, que toda
   > rota interna citada na landing existe como arquivo de rota, e que nem o
   > FAQ nem o formulário voltaram a prometer acesso que já está aberto. Nenhuma
   > dessas coisas quebra build, typecheck ou lint — some sem avisar.

2. ~~**🔴 Landing promete conexão automática de contas que não existe.**~~
   ✅ **13/08/2026.** "Suas transações entram sozinhas, nada de digitar CSV"
   descreve Open Finance, que está aqui no backlog (ver *Conector Open
   Finance*, acima). O produto real é upload de extrato.

   > **O app logado já dizia a verdade.** Ajustes lista "Bancos conectados"
   > como `EmBreve`, com o motivo escrito: *"Requer Open Finance. Por ora, o
   > extrato faz o mesmo trabalho"* (`app/(app)/ajustes/page.tsx:272`). A home
   > vendia o mesmo recurso como o **passo 1** de "Como funciona". É a mesma
   > forma do item 1: a tela de dentro coerente e a de fora não.
   >
   > **O que mudou:** o passo 1 virou "Suba seu extrato" e descreve o caminho
   > real — exportar PDF, CSV ou OFX pelo app do banco. Ele troca uma promessa
   > falsa por uma verdade mais forte que ela: o arquivo é lido **no próprio
   > navegador** e o servidor recebe só o texto extraído
   > (`lib/extrato/ler-no-navegador.ts`). O passo 2 ganhou "nada entra sem a
   > sua confirmação", que também já era verdade e não estava dita.
   >
   > **A pergunta não foi varrida para debaixo do tapete.** Abaixo dos três
   > passos, um bloco responde "E a conexão automática com o banco?" com
   > *está no plano, mas ainda não existe*. Sumir com o assunto deixaria quem
   > veio pelo recurso sem resposta; dizer que existe é o defeito que se está
   > corrigindo.
   >
   > **Guardado por `scripts/testar-landing.mts`** (sem banco, sem build), e a
   > checagem é amarrada ao código, não à data: ela só exige a copy honesta
   > **enquanto não houver conector** (`app/api/open-finance`, `lib/open-finance`
   > ou dependência de agregador no `package.json`) — no dia em que ele nascer,
   > afrouxa sozinha em vez de virar teste mentiroso pedindo para ser apagado.
   > Também confere que a home não contradiz o `EmBreve` do Ajustes, e que
   > **todo formato citado na home é aceito pelo `accept` da tela de upload** —
   > prometer XLSX na home e não aceitar XLSX na tela é a mesma falha, menor.

3. **🔴 /premium não mostra o preço para quem não assina.** O `valorCentavos`
   só renderiza no estado de quem já paga (`app/(app)/premium/page.tsx:213`).
   Quem não paga vê vantagens → botão "Assinar" → "cobrança mensal pelo
   cartão", sem valor. Ninguém clica "Assinar" às cegas; parece dark pattern.

4. **🟠 Cadastro com fricção.** Sem as chaves OAuth na Vercel o botão Google
   não aparece (pendência já registrada em `estado-do-produto.md`); sobra
   e-mail + senha + **data de nascimento obrigatória sem explicar o porquê**.
   E o subtítulo "Pra salvar seu perfil e seu progresso na trilha"
   (`app/(auth)/cadastro/page.tsx:99`) usa "trilha" antes de a pessoa saber o
   que é — ela veio pelo extrato, não pela trilha.

5. **🟠 Imagem quebrada em toda ficha de módulo.** O drawer usa
   `no.thumbnail || "/placeholder.svg"` (`components/trilha-visual/DrawerModulo.tsx:150`),
   mas `public/placeholder.svg` **não existe** e as thumbnails hoje são todas
   `null` — todo módulo abre com um 16:9 quebrado no topo. Criar o SVG ou
   desenhar o estado sem imagem.

6. **🟠 Chat sem streaming.** A resposta chega inteira depois de segundos de
   pontinhos (`components/chat/ChatIA.tsx`). A régua do público é ChatGPT:
   texto aparecendo em ~1s. Bônus: o placeholder diz "solte o extrato aqui",
   mas não há handler de drag-and-drop — o gesto sugerido não funciona.

7. **🟡 Botão "Enviar para a IA reordenar" promete o que não faz.** Ele só
   abre o chat com a mensagem pronta (`components/trilha-visual/DrawerModulo.tsx:394`).
   Se a IA responder "não dá", vira botão de mentira. Renomear para algo como
   "Pedir pro assistente" resolve — o problema é a promessa, não a mecânica.

8. **🟡 Cheiro de beta + sem experiência de app.** Seis itens "em breve" no
   Menu de uma vez; e **não há manifest/PWA** — no celular o Finlow vive numa
   aba, sem ícone na home e sem push, remando contra a própria mecânica de
   ofensiva diária da trilha.

9. **🟢 Deslizes pequenos.** (a) "Prefiro olhar o app sozinha" com flexão
   feminina fixa (`app/(app)/onboarding/page.tsx:276`); (b) o `accept` do
   input de arquivo do chat não inclui `.qif`/`.txt` que o código trata como
   extrato (`components/chat/ChatIA.tsx:33`); (c) a cota em tokens continua
   sendo conta de padaria — a pessoa quer "quantas perguntas ainda tenho";
   (d) a aba chama "Menu" e a tela interna oscila entre "Menu" e "Ajustes".

**O que segurou o usuário (não mexer):** onboarding pulável com aceites
explicados, "nada entra sem confirmar", tom sem culpa, tema escuro + paleta,
exportar/apagar dados em dois toques, estado vazio do chat com sugestões.
