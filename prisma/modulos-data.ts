// Fonte única dos 16 módulos da trilha.
// Usada pelo seed.ts (pnpm prisma db seed) e pelo scripts/gen-seed-sql.ts
// (gera SQL pro Supabase SQL Editor quando a rede bloqueia conexão direta).
//
// Público: adultos de 25 a 40 anos com renda própria e contas no nome.
// Ciclo é MENSAL (salário/projeto), não semanal. Personagens:
//   Bia, 29   — CLT, R$ 3.800 líquido, mora de aluguel        → lançador
//   Théo, 34  — designer PJ, renda variável, guarda demais     → guardador
//   Lari, 27  — agência, compra pra aliviar o dia ruim         → impulsivo
//   Kaio, 31  — mil planos, nenhum com número                  → sonhador
import type { TipoPerfil, TipoTela, ConteudoTela } from "../types/trilha"

export interface SeedTela {
  ordem: number
  tipo: TipoTela
  label: string
  conteudo: ConteudoTela
}

export interface SeedModulo {
  slug: string
  titulo: string
  subtitulo: string
  tipoPerfil: TipoPerfil
  ordem: number
  xp: number
  telas: SeedTela[]
}

export const modulosSeeds: SeedModulo[] = [
  // ============================================================
  // LANÇADOR — M1: Consciência de fluxo
  // ============================================================
  {
    slug: "lancador-m1-fluxo",
    titulo: "Onde foi parar o seu dinheiro?",
    subtitulo: "Sem julgamento. Você só vai olhar.",
    tipoPerfil: "lancador",
    ordem: 1,
    xp: 50,
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Ponto de partida",
        conteudo: {
          headline: "Você sabe pra onde foi o dinheiro <em>do mês passado?</em>",
          corpo: "Não é falta de cuidado. É que o dinheiro digital <strong>some sem deixar rastro visível</strong>. Débito automático, Pix, parcela de três meses atrás. Esse módulo não vai te dizer o que fazer. Primeiro você vai só <strong>olhar.</strong>",
          insight: {
            label: "Por que isso importa",
            texto: "Você não consegue mudar o que não enxerga. Consciência vem antes de qualquer regra, e antes de qualquer planilha.",
          },
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Conceito",
        conteudo: {
          headline: "Fluxo de caixa é só <em>entrada menos saída</em>",
          personagem: "Bia, 29, analista, CLT",
          linhas: [
            { label: "Entrou (salário líquido)", valor: 3800, tipo: "entrada" },
            { label: "Aluguel + condomínio", valor: -1650, tipo: "saida" },
            { label: "Mercado + delivery", valor: -920, tipo: "saida" },
            { label: "Transporte + combustível", valor: -410, tipo: "saida" },
            { label: "Assinaturas e apps", valor: -180, tipo: "saida" },
            { label: "Fatura (parcelas antigas)", valor: -560, tipo: "saida" },
            { label: "Sobrou", valor: 80, tipo: "saldo" },
          ],
          rodape: "A Bia jurava que sobravam uns R$ 500 todo mês. <strong>Sobraram R$ 80.</strong>",
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Reflexão rápida",
        conteudo: {
          headline: "Por que a Bia errou tanto a própria conta?",
          opcoes: [
            {
              letra: "A",
              texto: "Vários gastos médios somaram sem ela perceber",
              correta: true,
              feedback: "Exato. O aluguel ela já esperava. O que a pegou foram os R$ 920 de mercado e delivery, que ela estimava em uns R$ 600, e as parcelas antigas que ela já nem lembrava de ter feito.",
            },
            {
              letra: "B",
              texto: "Ela fez um gasto grande demais em algo caro",
              correta: false,
              feedback: "Não teve gasto fora da curva. O maior era o aluguel, previsto e fixo. O rombo veio da soma dos 'normais', que é justamente o padrão mais difícil de enxergar.",
            },
            {
              letra: "C",
              texto: "Foi um mês atípico",
              correta: false,
              feedback: "Quase todo mês tem essa cara quando ninguém abre o extrato. Não é atípico: é o padrão rodando invisível há meses.",
            },
          ],
        },
      },
      {
        ordem: 3,
        tipo: "conceito",
        label: "O nome disso",
        conteudo: {
          headline: "Gasto pequeno é <em>invisível</em>, até somar",
          corpo: "R$ 39 de streaming. R$ 22 de café. R$ 48 da entrega de quarta. Nenhum parece grande. Mas trinta dias depois viram <strong>R$ 900</strong>, e você não lembra de quase nenhum deles.",
          insight: {
            label: "O nome disso",
            texto: "Dor do pagamento: entregar dinheiro em espécie dói, e essa dor freia o gasto. Pix, cartão e um clique removem a dor. O cérebro quase não registra a saída, e o gasto pequeno some do radar.",
          },
        },
      },
      {
        ordem: 4,
        tipo: "input",
        label: "Agora é com você",
        conteudo: {
          headline: "Abre o extrato e preenche <em>só isso</em>",
          subtitulo: "3 campos. Não precisa ser exato.",
          aviso: "Isso fica só com você. Não salvamos nenhum valor.",
          campos: [
            { id: "entrou", emoji: "💸", label: "Entrou", placeholder: "R$ quanto entrou no mês passado?", tipo: "decimal" },
            { id: "saiu", emoji: "🛒", label: "Saiu", tipo: "faixa", opcoes: [
              { label: "até R$ 1.500", valor: "1000" },
              { label: "R$ 1.500–3.000", valor: "2200" },
              { label: "R$ 3.000–5.000", valor: "4000" },
              { label: "mais de R$ 5.000", valor: "6500" },
            ] },
            { id: "gasto", emoji: "🤔", label: "1 gasto", placeholder: "que você não lembrava até abrir a fatura", tipo: "texto" },
          ],
        },
      },
      {
        ordem: 5,
        tipo: "resultado",
        label: "Seu resultado",
        conteudo: {
          headline: "Você gastou <em>≈ {pct}%</em> do que entrou",
          formula: "entrou_saiu_pct",
          faixas: [
            { condicao: "sobrou > 30pct", mensagem: "Sobrou mais de 30% do que entrou. Isso é raro e é uma base sólida. A pergunta agora é pra onde esse dinheiro está indo.", cor: "green" },
            { condicao: "sobrou > 0", mensagem: "Sobrou algo, mas foi apertado. O módulo 2 mostra como garantir esse espaço no dia do salário, em vez de torcer pra ele existir no dia 30.", cor: "yellow" },
            { condicao: "sobrou <= 0", mensagem: "Fechou no zero ou no vermelho. É mais comum do que parece, e ninguém fala. Agora você sabe o tamanho, e saber é o que torna o resto possível.", cor: "red" },
          ],
          insightDinamico: "Você mencionou \"{gasto}\". Esse tipo de gasto é exatamente o que some primeiro do radar, e soma mais no fim do mês do que qualquer um estima.",
        },
      },
      {
        ordem: 6,
        tipo: "conceito",
        label: "Módulo completo",
        conteudo: {
          headline: "Consciência de fluxo <em>ativada</em>",
          corpo: "Você acabou de fazer o que a maioria adia por anos: <strong>olhar de frente pra onde foi o dinheiro.</strong> No próximo módulo você aprende a <strong>garantir um espaço antes de o mês começar a consumir tudo</strong>, sem abrir mão do que importa.",
          insight: {
            label: "Módulo 1 completo",
            texto: "Fluxo de caixa = entrada − saída · Gasto pequeno soma mais do que parece · Você identificou seu primeiro gasto invisível.",
          },
        },
      },
    ],
  },

  // ============================================================
  // GUARDADOR — M1: Permissão de gastar
  // ============================================================
  {
    slug: "guardador-m1-permissao",
    titulo: "Guardar tudo também tem um custo",
    subtitulo: "Você guarda bem, agora vamos falar de usar.",
    tipoPerfil: "guardador",
    ordem: 1,
    xp: 50,
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Ponto de partida",
        conteudo: {
          headline: "E se o seu problema <em>não for</em> gastar demais?",
          corpo: "A maioria dos apps assume que você gasta sem pensar. O seu caso é o contrário: você segura cada centavo, e mesmo assim sente <strong>peso quando gasta, até no que importa.</strong> Esse módulo é sobre isso.",
          insight: {
            label: "Por que isso importa",
            texto: "Guardar por escolha e guardar por automatismo parecem iguais no extrato. A diferença é uma pergunta que quase ninguém se faz: guardar pra quê?",
          },
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Conceito",
        conteudo: {
          headline: "O mês do <em>Théo</em>",
          personagem: "Théo, 34, designer, PJ",
          linhas: [
            { label: "Entrou (projeto fechado)", valor: 5200, tipo: "entrada" },
            { label: "Contas e essenciais", valor: -2900, tipo: "saida" },
            { label: "Guardou", valor: -2250, tipo: "saida" },
            { label: "Gastou consigo", valor: -50, tipo: "saida" },
            { label: "Parado na conta, sem destino", valor: 2250, tipo: "saldo" },
          ],
          rodape: "O Théo recusou ir ao casamento de um amigo pra não gastar R$ 400 com passagem. Do que sobrou depois das contas, guardou 98%. <strong>E passou o mês se sentindo mal mesmo assim.</strong>",
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Reflexão rápida",
        conteudo: {
          headline: "Se guardar é bom, por que o Théo se sente mal?",
          opcoes: [
            {
              letra: "A",
              texto: "Ele guarda sem saber pra quê, e aí nem gastar nem guardar traz paz",
              correta: true,
              feedback: "Isso. Dinheiro guardado sem destino não dá sensação de progresso, só adia a decisão. E cada gasto vira culpa porque não existe um 'quanto é ok'.",
            },
            {
              letra: "B",
              texto: "Ele deveria guardar ainda mais até se sentir seguro",
              correta: false,
              feedback: "Essa é a armadilha do perfil: se 98% não trouxe paz, 100% também não traria. O problema não é o valor guardado: é a ausência de propósito.",
            },
            {
              letra: "C",
              texto: "Casamento é gasto besta, ele fez certo em recusar",
              correta: false,
              feedback: "R$ 400 não ameaçavam nada: ele tinha R$ 2.250 parados sem destino nenhum. Recusar por reflexo, sem fazer a conta, não é decisão: é medo no automático.",
            },
          ],
        },
      },
      {
        ordem: 3,
        tipo: "conceito",
        label: "O nome disso",
        conteudo: {
          headline: "A culpa de gastar tem <em>nome</em>",
          corpo: "Quando você acredita que 'deveria estar guardando' e gasta mesmo assim, o cérebro entra em conflito. Esse desconforto se chama <strong>dissonância cognitiva</strong>, e aparece até quando o gasto era totalmente razoável.",
          insight: {
            label: "A pergunta que desarma",
            texto: "Guardar demais também cobra: casamentos, viagens e jantares que não voltam. Antes de recusar o próximo gasto, vale uma pergunta honesta. Isso é segurança, ou é medo no piloto automático?",
          },
        },
      },
      {
        ordem: 4,
        tipo: "input",
        label: "Agora é com você",
        conteudo: {
          headline: "Responde <em>sincero</em>, só pra você",
          subtitulo: "3 campos. Ninguém vê.",
          aviso: "Isso fica só com você. Não salvamos nenhuma resposta.",
          campos: [
            { id: "guardou", emoji: "🔒", label: "Guardei", placeholder: "R$ quanto você guardou esse mês?", tipo: "decimal" },
            { id: "gastou", emoji: "🎉", label: "Curti", tipo: "faixa", opcoes: [
              { label: "quase nada (até R$ 100)", valor: "50" },
              { label: "R$ 100–400", valor: "250" },
              { label: "R$ 400–800", valor: "600" },
              { label: "mais de R$ 800", valor: "1000" },
            ] },
            { id: "recusa", emoji: "😕", label: "Recusei", placeholder: "algo que deixou de fazer só pra economizar", tipo: "texto" },
          ],
        },
      },
      {
        ordem: 5,
        tipo: "resultado",
        label: "Seu resultado",
        conteudo: {
          headline: "Você usou <em>≈ {pctGuardador}%</em> do seu dinheiro com você",
          formula: "guardador_ratio",
          faixas: [
            {
              condicao: "pctGuardador < 5",
              mensagem: "Quase nada foi pra você. Não existe número certo, mas se dizer 'não' virou reflexo, vale investigar o porquê. O módulo 2 te dá um jeito de gastar com intenção, sem peso.",
              cor: "red",
            },
            {
              condicao: "pctGuardador < 20",
              mensagem: "Você guarda muito e usa pouco. Pode ser uma fase com objetivo claro, ou pode ser o automático. Só você sabe. O próximo módulo transforma isso em escolha consciente.",
              cor: "yellow",
            },
            {
              condicao: "pctGuardador >= 20",
              mensagem: "Você tem um equilíbrio entre guardar e viver que é raro nesse perfil. A pergunta que fica: ele foi planejado, ou aconteceu por acaso?",
              cor: "green",
            },
          ],
          insightDinamico: "Você deixou de fazer: \"{recusa}\". Vale se perguntar: essa recusa te protegeu de verdade, ou só te tirou algo que não custava tanto assim?",
        },
      },
      {
        ordem: 6,
        tipo: "conceito",
        label: "Módulo completo",
        conteudo: {
          headline: "Permissão <em>ativada</em>",
          corpo: "Você viu que guardar sem propósito cobra um preço invisível, e que a culpa de gastar tem explicação, não é defeito seu. No próximo módulo você vai <strong>separar um valor pré-autorizado pra viver</strong>, com regra clara.",
          insight: {
            label: "Módulo 1 completo",
            texto: "Guardar por escolha ≠ guardar no automático · Culpa de gastar é dissonância, não fato · Você identificou uma recusa que merecia uma segunda olhada.",
          },
        },
      },
    ],
  },

  // ============================================================
  // IMPULSIVO — M1: Reconhecer o gatilho
  // ============================================================
  {
    slug: "impulsivo-m1-gatilho",
    titulo: "Por que você comprou aquilo mesmo?",
    subtitulo: "Sem sermão. Só pra entender o impulso.",
    tipoPerfil: "impulsivo",
    ordem: 1,
    xp: 50,
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Ponto de partida",
        conteudo: {
          headline: "A compra alivia. A fatura chega <em>depois.</em>",
          corpo: "Você já comprou algo às onze da noite e, no dia seguinte, pensou 'por que eu fiz isso?'. Não é falta de caráter: é <strong>como o cérebro reage a uma emoção forte.</strong> Esse módulo mostra o mecanismo. Sem julgamento.",
          insight: {
            label: "Por que isso importa",
            texto: "Você não controla um impulso que não enxerga. Reconhecer o gatilho é o que devolve o poder de escolha pra você.",
          },
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Conceito",
        conteudo: {
          headline: "O mês da <em>Lari</em>",
          personagem: "Lari, 27, agência de publicidade",
          linhas: [
            { label: "Entrou (salário)", valor: 4200, tipo: "entrada" },
            { label: "Semana pesada → compra online", valor: -680, tipo: "saida" },
            { label: "Discussão em casa → jantar caro", valor: -240, tipo: "saida" },
            { label: "Resto do mês (contas, mercado, transporte)", valor: -3100, tipo: "saida" },
            { label: "Sobrou", valor: 180, tipo: "saldo" },
          ],
          rodape: "A Lari não planejou nem a compra nem o jantar. Os dois vieram logo depois de <strong>um dia ruim.</strong> O dinheiro não sumiu por acaso, sumiu junto com a emoção.",
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Reflexão rápida",
        conteudo: {
          headline: "O que a Lari estava tentando comprar de verdade?",
          opcoes: [
            {
              letra: "A",
              texto: "Um jeito rápido de se sentir melhor",
              correta: true,
              feedback: "Exato. Ela não queria o produto. Queria sair do dia ruim. A compra foi só o atalho mais próximo pro alívio.",
            },
            {
              letra: "B",
              texto: "Coisas que ela precisava e ia comprar de qualquer jeito",
              correta: false,
              feedback: "Repara no timing: as duas compras vieram nas horas seguintes a um momento ruim. Necessidade real não tem esse padrão de horário.",
            },
            {
              letra: "C",
              texto: "Nada, faltou disciplina",
              correta: false,
              feedback: "Não é disciplina nem caráter. É um mecanismo do cérebro buscando alívio imediato, e mecanismo se desarma com método, não com força de vontade.",
            },
          ],
        },
      },
      {
        ordem: 3,
        tipo: "conceito",
        label: "O nome disso",
        conteudo: {
          headline: "Seu cérebro quer o prêmio <em>agora</em>",
          corpo: "Sob emoção forte, o cérebro prefere um alívio pequeno e imediato a um ganho maior lá na frente. Isso tem nome: <strong>desconto temporal</strong>. É por isso que 'compro agora' parece tão certo às onze da noite, e tão errado quando a fatura fecha.",
          insight: {
            label: "O que desarma",
            texto: "A pausa. Só o ato de esperar já reduz a intensidade da emoção. Quando o impulso deixa de ser imediato, ele perde força, e a escolha volta pra você.",
          },
        },
      },
      {
        ordem: 4,
        tipo: "input",
        label: "Agora é com você",
        conteudo: {
          headline: "Lembra da sua <em>última</em> compra por impulso",
          subtitulo: "3 campos. Sem vergonha.",
          aviso: "Isso fica só com você. Não salvamos nenhuma resposta.",
          campos: [
            { id: "item", emoji: "🛍️", label: "Comprei", placeholder: "o que você comprou sem planejar?", tipo: "texto" },
            { id: "valor", emoji: "💸", label: "Custou", placeholder: "R$ quanto foi?", tipo: "decimal" },
            { id: "emocao", emoji: "🎭", label: "Sentia", placeholder: "que emoção veio antes? (cansaço, raiva, ansiedade...)", tipo: "texto" },
          ],
        },
      },
      {
        ordem: 5,
        tipo: "resultado",
        label: "Seu resultado",
        conteudo: {
          headline: "Seu gatilho foi: <em>{emocao}</em>",
          formula: "impulsivo_gatilho",
          faixas: [
            {
              condicao: "valor > 500",
              mensagem: "Foi um gasto pesado movido por emoção, provavelmente parcelado, o que estica o efeito por meses. Imagina esse valor indo pra algo que você escolheu de verdade. O módulo 2 traz a técnica da pausa.",
              cor: "red",
            },
            {
              condicao: "valor > 150",
              mensagem: "O valor foi médio, mas o padrão é o que importa: emoção → compra. Agora que você viu o mecanismo, fica bem mais fácil pegar no flagra.",
              cor: "yellow",
            },
            {
              condicao: "valor <= 150",
              mensagem: "O valor foi pequeno, e você acabou de fazer a parte difícil: ligar a compra à emoção que veio antes. Esse é o mapa que quase ninguém desenha.",
              cor: "green",
            },
          ],
          insightDinamico: "Você comprou \"{item}\" sentindo \"{emocao}\". Da próxima vez que essa mesma emoção bater, é aí que a pausa entra. Você acabou de mapear seu próprio gatilho.",
        },
      },
      {
        ordem: 6,
        tipo: "conceito",
        label: "Módulo completo",
        conteudo: {
          headline: "Gatilho <em>identificado</em>",
          corpo: "Suas compras por impulso têm um padrão emocional, e agora você consegue vê-lo chegando. No próximo módulo, a <strong>técnica da pausa</strong>: o passo que desarma o impulso antes de ele virar parcela.",
          insight: {
            label: "Módulo 1 completo",
            texto: "Impulso é emoção buscando alívio rápido · Desconto temporal faz o 'agora' parecer certo · Você nomeou o gatilho que mais te pega.",
          },
        },
      },
    ],
  },

  // ============================================================
  // SONHADOR — M1: Sonho com prazo
  // ============================================================
  {
    slug: "sonhador-m1-sonho-prazo",
    titulo: "Você tem mil planos. Vamos tirar um do papel.",
    subtitulo: "Escolhe um objetivo, a gente dá um número a ele.",
    tipoPerfil: "sonhador",
    ordem: 1,
    xp: 50,
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Ponto de partida",
        conteudo: {
          headline: "Planejar você já sabe. Falta <em>executar.</em>",
          corpo: "Você tem projetos demais: a pós, a viagem, trocar o carro, a entrada do apartamento. Todos ficam na cabeça e <strong>nenhum sai do lugar.</strong> O problema não é vontade. Você tem de sobra. É que objetivo sem número e sem prazo não vira ação.",
          insight: {
            label: "Por que isso importa",
            texto: "Existe um abismo entre querer e fazer. A pesquisa mostra que a intenção sozinha explica só uma fração do que a gente realiza. O que fecha o abismo é dar forma concreta ao objetivo.",
          },
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Conceito",
        conteudo: {
          headline: "Os planos do <em>Kaio</em>",
          personagem: "Kaio, 31",
          linhas: [
            { label: "Trocar o carro", valor: 0, tipo: "entrada", valorTexto: "sem número" },
            { label: "Pós-graduação", valor: 0, tipo: "entrada", valorTexto: "sem número" },
            { label: "Viagem com a família", valor: 0, tipo: "entrada", valorTexto: "sem número" },
            { label: "Guardado pra qualquer um deles", valor: 0, tipo: "saldo" },
          ],
          rodape: "O Kaio quer as três coisas há dois anos. Nenhuma tem valor definido, nenhuma tem prazo. <strong>Resultado: R$ 0 guardado.</strong>",
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Reflexão rápida",
        conteudo: {
          headline: "Por que o Kaio não saiu do zero em dois anos?",
          opcoes: [
            {
              letra: "A",
              texto: "Três objetivos vagos ao mesmo tempo travam a ação",
              correta: true,
              feedback: "Isso. Uma única meta concreta gera mais economia real do que várias simultâneas. Espalhar o foco paralisa. É o que a pesquisa sobre metas mostra de forma consistente.",
            },
            {
              letra: "B",
              texto: "Ele ainda não encontrou o objetivo certo",
              correta: false,
              feedback: "O objetivo 'certo' não aparece sozinho. Ele se constrói quando você se compromete com um. Esperar a certeza é só uma forma elegante de adiar.",
            },
            {
              letra: "C",
              texto: "Ele precisa ganhar mais primeiro",
              correta: false,
              feedback: "Sem alvo definido, um aumento também sumiria sem virar nenhum dos três. O gargalo não é a renda: é a falta de destino.",
            },
          ],
        },
      },
      {
        ordem: 3,
        tipo: "conceito",
        label: "O nome disso",
        conteudo: {
          headline: "Objetivo vira meta quando ganha <em>número e data</em>",
          corpo: "'Quero viajar' é um desejo. 'Quero R$ 6.000 até dezembro pra viajar' é uma meta. A diferença parece pequena, mas pro cérebro é enorme: a segunda tem <strong>alvo, prazo e um próximo passo óbvio.</strong>",
          insight: {
            label: "A regra que muda tudo",
            texto: "Um objetivo por vez. Focar numa única meta específica funciona melhor do que perseguir várias. Escolher parece perda, mas é o que faz uma delas finalmente acontecer.",
          },
        },
      },
      {
        ordem: 4,
        tipo: "input",
        label: "Agora é com você",
        conteudo: {
          headline: "Escolhe <em>um</em>. Só um.",
          subtitulo: "3 campos. É aqui que ele sai da cabeça.",
          aviso: "Isso fica só com você. Não salvamos nenhuma resposta.",
          campos: [
            { id: "sonho", emoji: "✨", label: "Meu objetivo", placeholder: "o que você mais quer conquistar?", tipo: "texto" },
            { id: "custo", emoji: "🎯", label: "Custa", placeholder: "R$ quanto custa (estima se não souber)", tipo: "decimal" },
            { id: "meses", emoji: "📅", label: "Em", placeholder: "quantos meses até lá?", tipo: "decimal" },
          ],
        },
      },
      {
        ordem: 5,
        tipo: "resultado",
        label: "Seu resultado",
        conteudo: {
          headline: "Você precisa de <em>{porMes} por mês</em>",
          formula: "sonhador_por_mes",
          faixas: [
            {
              condicao: "porMesNum <= 200",
              mensagem: "Cabe mais fácil do que parecia, né? Menos de R$ 200 por mês e o objetivo é seu. O módulo 2 mostra o menor passo pra começar hoje.",
              cor: "green",
            },
            {
              condicao: "porMesNum <= 600",
              mensagem: "É um valor real, mas possível com organização. A diferença de agora pra ontem: agora tem número, então tem plano.",
              cor: "yellow",
            },
            {
              condicao: "porMesNum > 600",
              mensagem: "É ambicioso pro prazo que você deu. Ou estica o prazo, ou começa por uma versão menor, mas agora você sabe o tamanho exato do desafio. Isso já é metade do caminho.",
              cor: "red",
            },
          ],
          insightDinamico: "\"{sonho}\" deixou de ser uma ideia solta. Agora é uma meta com número e prazo. O tipo de coisa que o cérebro consegue perseguir de verdade.",
        },
      },
      {
        ordem: 6,
        tipo: "conceito",
        label: "Módulo completo",
        conteudo: {
          headline: "Objetivo <em>ancorado</em>",
          corpo: "Você fez o que trava a maioria: escolheu um só e deu a ele número e prazo. No próximo módulo você define <strong>o menor passo possível pra começar já</strong>. Porque meta sem primeiro passo continua sendo só um plano bonito.",
          insight: {
            label: "Módulo 1 completo",
            texto: "Intenção sozinha não vira realização · Objetivo vira meta com número e prazo · Um de cada vez > vários ao mesmo tempo.",
          },
        },
      },
    ],
  },

  // ============================================================
  // LANÇADOR — M2: Antes de gastar, respira (7 telas)
  // ============================================================
  {
    slug: "lancador-m2-respiro",
    titulo: "Antes de gastar, respira",
    subtitulo: "A regra que muda a ordem do jogo.",
    tipoPerfil: "lancador",
    ordem: 2,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "O que sobra no fim <em>nunca sobra.</em>",
        corpo: "Você já tentou 'gastar menos pra sobrar no fim do mês'. Não funcionou, e não é culpa sua. <strong>Guardar o que sobra é apostar contra o próprio cérebro.</strong> A solução é inverter a ordem.",
        insight: { label: "Por que isso importa", texto: "Quem guarda primeiro não precisa de disciplina o mês inteiro. Precisa de uma decisão só, no dia em que o dinheiro cai." },
      }},
      { ordem: 1, tipo: "cenario", label: "Conceito", conteudo: {
        headline: "A Bia inverteu a <em>ordem</em>",
        personagem: "Bia, 29, analista, CLT",
        linhas: [
          { label: "Entrou (salário líquido)", valor: 3800, tipo: "entrada" },
          { label: "Separou no mesmo dia (10%)", valor: -380, tipo: "saida" },
          { label: "Viveu o mês com o resto", valor: -3420, tipo: "saida" },
          { label: "Guardado no fim do mês", valor: 380, tipo: "saldo" },
        ],
        rodape: "Mês passado sobraram R$ 80. Esse mês sobraram R$ 380. <strong>e ela não sentiu falta.</strong> A diferença foi só a ordem.",
      }},
      { ordem: 2, tipo: "quiz", label: "Reflexão rápida", conteudo: {
        headline: "Por que separar antes funcionou pra Bia?",
        opcoes: [
          { letra: "A", texto: "Ela decidiu uma vez só, no dia em que o salário caiu", correta: true, feedback: "Exato. Uma decisão no dia 5 vence trinta pequenas decisões ao longo do mês. O cérebro se ajusta ao que enxerga como disponível." },
          { letra: "B", texto: "Ela se controlou mais durante o mês", correta: false, feedback: "Ela viveu o mês normalmente. Não se controlou nada. O truque é que os R$ 380 já não estavam na conta que ela olhava. A ordem fez o trabalho." },
          { letra: "C", texto: "10% é pouco, por isso deu certo", correta: false, feedback: "O valor ajuda a começar, mas o mecanismo é a ordem: o cérebro gasta o que enxerga como disponível, seja 100% ou 90% do saldo." },
        ],
      }},
      { ordem: 3, tipo: "conceito", label: "O nome disso", conteudo: {
        headline: "Pague <em>você</em> primeiro",
        corpo: "É a regra mais antiga das finanças pessoais: antes do mercado, do delivery e das assinaturas, você separa uma parte <strong>pra você do futuro.</strong> Não é sacrifício: é ordem de prioridade.",
        insight: { label: "O tamanho certo", texto: "Comece pequeno: 10% é o clássico porque quase não dói. Melhor 10% que acontece todo mês do que 30% que você abandona no segundo." },
      }},
      { ordem: 4, tipo: "input", label: "Agora é com você", conteudo: {
        headline: "Define o <em>seu</em> respiro",
        subtitulo: "2 campos. Essa é a sua regra a partir de agora.",
        aviso: "Isso fica só com você. Não salvamos nenhum valor.",
        campos: [
          { id: "entrou", emoji: "💸", label: "Entra", placeholder: "R$ quanto entra por mês (líquido)?", tipo: "decimal" },
          { id: "pctRespiro", emoji: "🫁", label: "Separo", placeholder: "% que você separa assim que cai (ex: 10)", tipo: "decimal" },
        ],
      }},
      { ordem: 5, tipo: "resultado", label: "Seu resultado", conteudo: {
        headline: "Seu respiro: <em>{respiro} por mês</em>",
        formula: "respiro_valor",
        faixas: [
          { condicao: "valor < 5", mensagem: "Menos de 5% cria reserva devagar demais. Se dá pra subir sem apertar, sobe, mas começar pequeno ainda é infinitamente melhor que não começar.", cor: "yellow" },
          { condicao: "valor <= 20", mensagem: "Faixa ideal pra começar: cria reserva de verdade sem sufocar o mês. Sustentável é o que vence no longo prazo.", cor: "green" },
          { condicao: "valor > 20", mensagem: "Ambicioso. Cuidado: respiro grande demais aperta o mês e aumenta a chance de você sacar de volta na terceira semana. Se sentir sufoco, desce. A constância vale mais que o valor.", cor: "yellow" },
        ],
        insightDinamico: "No dia em que o salário cair, transfere {respiro} pra outra conta. Antes do mercado, do delivery, do happy hour. As contas fixas seguem seu curso normal; o que muda é que o gasto variável passa a disputar um número menor.",
      }},
      { ordem: 6, tipo: "conceito", label: "Módulo completo", conteudo: {
        headline: "Regra do respiro <em>ativada</em>",
        corpo: "Você inverteu a ordem: agora guarda primeiro e vive com o resto. Não o contrário. No próximo módulo, esse respiro ganha <strong>um destino concreto</strong>, pra deixar de ser 'dinheiro parado' e virar algo que você defende.",
        insight: { label: "Módulo 2 completo", texto: "O que sobra no fim nunca sobra · Pague você primeiro · Uma decisão no dia do salário vence trinta no mês." },
      }},
    ],
  },

  // ============================================================
  // LANÇADOR — M3: Dá um destino pro que sobra (6 telas, input cedo)
  // ============================================================
  {
    slug: "lancador-m3-meta-ancora",
    titulo: "Dá um destino pro que sobra",
    subtitulo: "Reserva sem destino evapora.",
    tipoPerfil: "lancador",
    ordem: 3,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "Dinheiro guardado <em>sem nome</em> volta pro bolso",
        corpo: "O respiro do módulo 2 tem um inimigo: a falta de propósito. Reserva 'pra nada' é a primeira coisa que você saqueia quando o notebook trava ou aparece uma promoção. <strong>Reserva com nome e prazo, você defende.</strong>",
        insight: { label: "Por que isso importa", texto: "Uma meta concreta transforma 'não gastar' (chato) em 'estar quase lá' (motivador). O cérebro persegue alvo, não abstração." },
      }},
      { ordem: 1, tipo: "input", label: "Agora é com você", conteudo: {
        headline: "Escolhe uma meta <em>alcançável</em>",
        subtitulo: "Algo que você consegue em alguns meses. Reancora seu respiro do módulo 2 aqui.",
        aviso: "Isso fica só com você. Não salvamos nenhum valor.",
        campos: [
          { id: "meta", emoji: "🎯", label: "Minha meta", placeholder: "o que você quer? (viagem, curso, trocar o notebook...)", tipo: "texto" },
          { id: "custo", emoji: "💰", label: "Custa", placeholder: "R$ quanto custa?", tipo: "decimal" },
          { id: "respiro", emoji: "🫁", label: "Respiro", placeholder: "R$ do seu respiro mensal (módulo 2)", tipo: "decimal" },
        ],
      }},
      { ordem: 2, tipo: "cenario", label: "Conceito", conteudo: {
        headline: "A conta da <em>Bia</em>",
        personagem: "Bia, 29, analista, CLT",
        linhas: [
          { label: "Meta: viagem de fim de ano", valor: 2280, tipo: "entrada" },
          { label: "Respiro mensal", valor: 380, tipo: "entrada" },
          { label: "Meses até a meta", valor: 6, tipo: "saldo", valorTexto: "6 meses" },
        ],
        rodape: "Seis meses. Cada mês que ela separa os R$ 380, <strong>a barra enche.</strong> Não é 'deixar de gastar': é comprar a viagem em câmera lenta.",
      }},
      { ordem: 3, tipo: "quiz", label: "Reflexão rápida", conteudo: {
        headline: "Por que a primeira meta precisa ser curta?",
        opcoes: [
          { letra: "A", texto: "Porque motivação não dura o ano inteiro, e meta longa cobra motivação o tempo todo", correta: true, feedback: "Exato. Meta de três anos exige uma resistência que ainda não foi treinada. Uma meta de alguns meses entrega a vitória antes de o desânimo chegar, e vitória vira combustível." },
          { letra: "B", texto: "Porque metas grandes são impossíveis", correta: false, feedback: "São possíveis. Depois. Primeiro você prova pra si mesmo que consegue manter o respiro. A entrada do apartamento vem na sequência, com o músculo treinado." },
          { letra: "C", texto: "Porque coisas baratas valem mais a pena", correta: false, feedback: "Não é sobre o preço: é sobre o tempo até chegar lá. Curta significa retorno visível, e retorno visível é o que sustenta o hábito." },
        ],
      }},
      { ordem: 4, tipo: "resultado", label: "Seu resultado", conteudo: {
        headline: "<em>{periodos} meses</em> até \"{meta}\"",
        formula: "semanas_meta",
        faixas: [
          { condicao: "periodosNum <= 6", mensagem: "Dentro da janela ideal: dá pra enxergar a linha de chegada daqui. Cada mês de respiro é um passo visível, e visível é o que mantém o hábito de pé.", cor: "green" },
          { condicao: "periodosNum <= 12", mensagem: "Até um ano. Dá, mas é longo pra uma primeira meta. Se der pra aumentar um pouco o respiro ou escolher uma versão menor, a chance de chegar sobe bastante.", cor: "yellow" },
          { condicao: "periodosNum > 12", mensagem: "Mais de um ano é maratona, e você está começando a treinar agora. Escolhe algo menor pra primeira vitória. A meta grande continua existindo depois, e você chega nela com histórico.", cor: "red" },
        ],
        insightDinamico: "\"{meta}\" agora tem preço, prazo e um caminho mensal. Quando bater vontade de sacar o respiro, lembra: cada saque adia a chegada em um mês inteiro.",
      }},
      { ordem: 5, tipo: "conceito", label: "Módulo completo", conteudo: {
        headline: "Meta <em>ancorada</em>",
        corpo: "Seu respiro deixou de ser dinheiro parado. Virou uma viagem, um curso, um notebook novo chegando em câmera lenta. Último módulo da trilha: <strong>o freio de 24 horas</strong>, pra nenhum impulso atropelar o caminho.",
        insight: { label: "Módulo 3 completo", texto: "Reserva sem nome evapora · Meta curta = vitória antes do desânimo · Cada saque adia a chegada." },
      }},
    ],
  },

  // ============================================================
  // LANÇADOR — M4: O freio de 24 horas (6 telas, abre com quiz)
  // ============================================================
  {
    slug: "lancador-m4-freio",
    titulo: "O freio de 24 horas",
    subtitulo: "A última peça da sua trilha.",
    tipoPerfil: "lancador",
    ordem: 4,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "Um gasto não planejado pode <em>desfazer um mês</em>",
        corpo: "Você já tem fluxo visível, respiro e meta. Falta proteger tudo isso do inimigo clássico: <strong>a compra que aparece do nada</strong>. A promoção, o achado, o 'em 10x sem juros'.",
        insight: { label: "Por que isso importa", texto: "Não dá pra prever qual compra vai aparecer. Dá pra decidir ANTES o que acontece quando ela aparecer. Regra pré-combinada vence decisão tomada no calor do momento." },
      }},
      { ordem: 1, tipo: "quiz", label: "Situação real", conteudo: {
        headline: "Sexta à noite: o notebook que você queria, 30% off, 'só hoje'. O que o Lançador treinado faz?",
        opcoes: [
          { letra: "A", texto: "Anota, fecha o app e decide amanhã no mesmo horário", correta: true, feedback: "Isso. Se amanhã ainda fizer sentido, e couber sem tocar no respiro. Compra. A maioria das 'promoções de hoje' reaparece na semana seguinte com outro nome." },
          { letra: "B", texto: "Compra. 30% off é economia, não gasto", correta: false, feedback: "Desconto em algo que você não ia comprar não é economia: é gasto com marketing de urgência embutido. O 'só hoje' foi desenhado exatamente pra impedir o seu amanhã." },
          { letra: "C", texto: "Não compra nunca. Promoção é sempre armadilha", correta: false, feedback: "Radical demais quebra no primeiro deslize. O freio não proíbe. Ele só move a decisão pra um momento em que você pensa melhor." },
        ],
      }},
      { ordem: 2, tipo: "conceito", label: "O nome disso", conteudo: {
        headline: "Fricção <em>deliberada</em>",
        corpo: "Apps de compra removem cada obstáculo entre você e o 'comprar agora'. Um clique, cartão salvo, entrega amanhã, parcelamento sugerido. O freio de 24h <strong>devolve o obstáculo que eles tiraram.</strong>",
        insight: { label: "Como calibrar", texto: "O freio não é pra tudo. Mercado não precisa de reunião. Ele vale a partir de um valor-limite que VOCÊ define. Abaixo dele, vida normal. Acima, 24 horas." },
      }},
      { ordem: 3, tipo: "input", label: "Agora é com você", conteudo: {
        headline: "Define o <em>seu</em> limite de freio",
        subtitulo: "2 campos. Acima do limite = espera 24h.",
        aviso: "Isso fica só com você. Não salvamos nenhum valor.",
        campos: [
          { id: "valorLimite", emoji: "🛑", label: "Meu limite", placeholder: "R$ a partir de quanto você espera 1 dia?", tipo: "decimal" },
          { id: "gastoRecente", emoji: "🛒", label: "Teste", placeholder: "R$ do seu último gasto não planejado", tipo: "decimal" },
        ],
      }},
      { ordem: 4, tipo: "resultado", label: "Seu resultado", conteudo: {
        headline: "Teste do freio no seu <em>último gasto</em>",
        formula: "freio_limite",
        faixas: [
          { condicao: "acimaLimite == 1", mensagem: "Esse gasto teria caído no freio. Teria esperado 24 horas. Pergunta honesta: se você tivesse dormido antes de decidir, compraria mesmo assim? Se sim, ótimo. O freio não proíbe, só confirma. Se não, é exatamente pra isso que ele existe.", cor: "yellow" },
          { condicao: "acimaLimite == 0", mensagem: "Esse gasto passaria livre. Abaixo do seu limite, vida normal. O freio é pros gastos que doem, não pra te transformar em fiscal de si mesmo. Só confere se o limite não ficou alto demais: se quase nada cai nele, ele não freia nada.", cor: "green" },
        ],
        insightDinamico: "Sua regra a partir de hoje: acima de R$ {valorLimite}, anota e decide amanhã. Uma regra só, decidida com a cabeça fria de hoje, protegendo todas as sextas à noite do futuro.",
      }},
      { ordem: 5, tipo: "conceito", label: "Trilha completa", conteudo: {
        headline: "Trilha do Lançador <em>completa</em> 🏁",
        corpo: "Olha o sistema que você montou: <strong>enxerga o fluxo</strong> (M1), <strong>separa antes de gastar</strong> (M2), <strong>tem uma meta puxando</strong> (M3) e <strong>um freio protegendo</strong> (M4). Isso não é teoria: são quatro regras suas, com seus números.",
        insight: { label: "Trilha completa", texto: "O jogo agora é manutenção: o respiro todo mês, o freio nos gastos grandes, e a meta enchendo. Quando ela completar. Escolhe a próxima e roda de novo." },
      }},
    ],
  },

  // ============================================================
  // GUARDADOR — M2: Seu valor livre (7 telas)
  // ============================================================
  {
    slug: "guardador-m2-valor-livre",
    titulo: "Seu valor livre",
    subtitulo: "Gastar sem culpa começa com uma regra.",
    tipoPerfil: "guardador",
    ordem: 2,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "E se gastar já viesse <em>pré-autorizado?</em>",
        corpo: "A culpa do módulo 1 tem uma causa: cada gasto seu passa por um julgamento interno. 'posso? devo? e se faltar?'. <strong>Trinta julgamentos por mês cansam qualquer um.</strong> A saída é julgar uma vez só.",
        insight: { label: "Por que isso importa", texto: "Quando existe um valor mensal já autorizado pra você viver, gastar dentro dele não exige julgamento. A decisão já foi tomada. A culpa perde o emprego." },
      }},
      { ordem: 1, tipo: "cenario", label: "Conceito", conteudo: {
        headline: "O Théo criou uma <em>categoria nova</em>",
        personagem: "Théo, 34, designer, PJ",
        linhas: [
          { label: "Entrou (projeto)", valor: 5200, tipo: "entrada" },
          { label: "Contas e essenciais", valor: -2900, tipo: "saida" },
          { label: "Guardado com propósito", valor: -1800, tipo: "saida" },
          { label: "Valor livre (pré-autorizado)", valor: -500, tipo: "saida" },
          { label: "Folga", valor: 0, tipo: "saldo" },
        ],
        rodape: "Os R$ 500 são dele pra viver. Jantar, show, viagem curta, o que for. <strong>Sem julgamento, porque o julgamento já aconteceu</strong> no dia em que ele definiu a regra.",
      }},
      { ordem: 2, tipo: "quiz", label: "Reflexão rápida", conteudo: {
        headline: "O Théo gastou os R$ 500 num fim de semana fora. Ele foi menos responsável que antes?",
        opcoes: [
          { letra: "A", texto: "Não. Gastar dentro de um plano É responsabilidade", correta: true, feedback: "Exato. Responsabilidade não é gastar zero: é decidir com intenção. Os R$ 500 estavam no plano tanto quanto os R$ 1.800 guardados." },
          { letra: "B", texto: "Sim. Ele podia ter guardado os R$ 500 também", correta: false, feedback: "Essa é a voz do módulo 1 falando. Guardar quase tudo não trouxe paz pro Théo antes. Trouxe culpa e isolamento. Um plano com espaço pra viver é MAIS sustentável, não menos." },
          { letra: "C", texto: "Depende do que ele fez no fim de semana", correta: false, feedback: "Não depende. Esse é o ponto do valor livre: dentro dele, a escolha é 100% dele, sem prestação de contas. Julgar item por item é voltar pros trinta julgamentos." },
        ],
      }},
      { ordem: 3, tipo: "conceito", label: "O nome disso", conteudo: {
        headline: "Orçamento não é corrente: é <em>alvará</em>",
        corpo: "Todo mundo acha que orçamento serve pra impedir gasto. Pro seu perfil é o contrário: <strong>o orçamento é o documento que AUTORIZA o gasto.</strong> Com limite claro, a liberdade dentro dele é total.",
        insight: { label: "O tamanho certo", texto: "Entre 10% e 30% do que entra é uma faixa comum. Menos que isso e a regra quase não muda sua vida. O número exato é seu. O que importa é ele existir e ser usado." },
      }},
      { ordem: 4, tipo: "input", label: "Agora é com você", conteudo: {
        headline: "Define o <em>seu</em> valor livre",
        subtitulo: "2 campos. O julgamento único do mês acontece agora.",
        aviso: "Isso fica só com você. Não salvamos nenhum valor.",
        campos: [
          { id: "entrou", emoji: "💸", label: "Entra", placeholder: "R$ quanto entra por mês?", tipo: "decimal" },
          { id: "pctLivre", emoji: "🎟️", label: "Livre", placeholder: "% pré-autorizado pra você (ex: 20)", tipo: "decimal" },
        ],
      }},
      { ordem: 5, tipo: "resultado", label: "Seu resultado", conteudo: {
        headline: "Seu valor livre: <em>{livre} por mês</em>",
        formula: "valor_livre",
        faixas: [
          { condicao: "valor < 10", mensagem: "Menos de 10% é quase simbólico. A regra existe mas mal muda seu mês. Se a ideia de subir dá aperto no peito, repara nisso: é exatamente a dissonância do módulo 1 defendendo território.", cor: "yellow" },
          { condicao: "valor <= 30", mensagem: "Faixa de equilíbrio: espaço real pra viver sem comprometer o que você guarda. Agora a regra é usar. Valor livre que sobra todo mês vira poupança disfarçada, e aí nada mudou.", cor: "green" },
          { condicao: "valor > 30", mensagem: "Passo grande pro seu perfil, e pode ser ótimo. Só confere no fim do mês se foi confortável ou se a culpa apareceu. A regra certa é a que você consegue manter em paz.", cor: "yellow" },
        ],
        insightDinamico: "{livre} por mês, seus, sem julgamento. Gastou dentro disso? Assunto encerrado, o plano já tinha aprovado.",
      }},
      { ordem: 6, tipo: "conceito", label: "Módulo completo", conteudo: {
        headline: "Valor livre <em>definido</em>",
        corpo: "Você trocou trinta julgamentos por um. No próximo módulo, a outra ponta: <strong>o dinheiro que você guarda tão bem vai começar a trabalhar</strong>, porque parado, ele encolhe todo ano.",
        insight: { label: "Módulo 2 completo", texto: "Orçamento é alvará, não corrente · Gastar dentro do plano é responsabilidade · Um julgamento por mês, não trinta." },
      }},
    ],
  },

  // ============================================================
  // GUARDADOR — M3: Dinheiro parado encolhe (6 telas, input cedo)
  // ============================================================
  {
    slug: "guardador-m3-investir",
    titulo: "Dinheiro parado encolhe",
    subtitulo: "Seu maior talento, finalmente recompensado.",
    tipoPerfil: "guardador",
    ordem: 3,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "Guardar você domina. Mas onde o dinheiro <em>dorme?</em>",
        corpo: "Plot twist do seu perfil: o dinheiro que você protege com tanto cuidado está <strong>perdendo valor em silêncio.</strong> Todo ano tudo fica mais caro, e R$ 20.000 parados continuam R$ 20.000, comprando menos.",
        insight: { label: "Por que isso importa", texto: "Isso se chama inflação. Ela não cobra de quem gasta. Cobra de quem guarda parado. Ou seja: cobra exatamente de você. A defesa é fazer o guardado render pelo menos o suficiente pra empatar." },
      }},
      { ordem: 1, tipo: "input", label: "Agora é com você", conteudo: {
        headline: "Quanto do seu dinheiro está <em>dormindo?</em>",
        subtitulo: "2 campos. Vamos ver o que ele faria acordado.",
        aviso: "Isso fica só com você. Não salvamos nenhum valor.",
        campos: [
          { id: "guardado", emoji: "💤", label: "Parado", placeholder: "R$ quanto você tem parado em conta?", tipo: "decimal" },
          { id: "meses", emoji: "📅", label: "Por", placeholder: "por quantos meses pretende deixar?", tipo: "decimal" },
        ],
      }},
      { ordem: 2, tipo: "cenario", label: "Conceito", conteudo: {
        headline: "Os R$ 22.000 do Théo, <em>um ano depois</em>",
        personagem: "Théo, 34, designer, PJ",
        linhas: [
          { label: "Parados na conta corrente", valor: 22000, tipo: "entrada" },
          { label: "Em renda fixa conservadora", valor: 24100, tipo: "entrada", valorTexto: "≈ R$ 24.100" },
          { label: "Diferença em 12 meses", valor: 2100, tipo: "saldo", valorTexto: "≈ R$ 2.100" },
        ],
        rodape: "R$ 2.100 é quase metade de um mês de trabalho do Théo. <strong>por fazer exatamente o que ele já fazia de graça.</strong> A única mudança foi o lugar onde o dinheiro estava.",
      }},
      { ordem: 3, tipo: "quiz", label: "Reflexão rápida", conteudo: {
        headline: "Por que o Théo hesitou em tirar o dinheiro da conta corrente?",
        opcoes: [
          { letra: "A", texto: "Medo de perder. Parado parece mais seguro", correta: true, feedback: "O medo clássico do perfil. Mas renda fixa conservadora (Tesouro Selic, CDB de liquidez diária) tem risco baixíssimo, e 'parado' também tem risco: o de encolher todo ano, garantido. Seguro de verdade é acompanhar a inflação." },
          { letra: "B", texto: "Investir é só pra quem tem muito dinheiro", correta: false, feedback: "Dá pra começar com pouco mais de R$ 30 no Tesouro Direto. O valor de entrada não é o obstáculo. O obstáculo é abrir a conta e fazer a primeira aplicação." },
          { letra: "C", texto: "A poupança já resolve. Rende a mesma coisa", correta: false, feedback: "Não rende. Com a Selic acima de 8,5% ao ano, a poupança fica travada em 0,5% ao mês mais TR, enquanto o Tesouro Selic acompanha a taxa cheia. A diferença, num ano, é dinheiro que dá pra ver." },
        ],
      }},
      { ordem: 4, tipo: "resultado", label: "Seu resultado", conteudo: {
        headline: "Dormindo, seu dinheiro deixa de gerar <em>≈ {rende}</em>",
        formula: "render_simples",
        faixas: [
          { condicao: "rendeNum < 100", mensagem: "O valor ainda é modesto, mas o mecanismo é o mesmo em qualquer escala. Quem organiza isso agora chega nos R$ 100 mil com o processo já rodando no automático, em vez de começar do zero aos 45.", cor: "green" },
          { condicao: "rendeNum >= 100", mensagem: "Isso é dinheiro real deixado na mesa. Pago a quem simplesmente move o guardado de lugar. Seu talento de guardar somado a rendimento é a combinação mais forte que existe nas finanças pessoais.", cor: "green" },
        ],
        insightDinamico: "Estimativa ilustrativa (~0,8% ao mês em renda fixa conservadora. Não é recomendação de produto e não considera imposto). Próximo passo concreto: pesquisar 'Tesouro Selic' e conferir se o banco onde você já tem conta oferece CDB com liquidez diária.",
      }},
      { ordem: 5, tipo: "conceito", label: "Módulo completo", conteudo: {
        headline: "Dinheiro <em>acordado</em>",
        corpo: "Você descobriu que parado não é seguro: é encolhendo devagar. Último módulo da trilha: <strong>prazer com data marcada</strong>. Planejar um gasto bom com a mesma seriedade com que você guarda.",
        insight: { label: "Módulo 3 completo", texto: "Inflação cobra de quem guarda parado · Renda fixa conservadora = risco baixíssimo · O mecanismo é igual em qualquer escala." },
      }},
    ],
  },

  // ============================================================
  // GUARDADOR — M4: Prazer com data marcada (6 telas, abre com quiz)
  // ============================================================
  {
    slug: "guardador-m4-prazer",
    titulo: "Prazer com data marcada",
    subtitulo: "O módulo que seu perfil mais precisa.",
    tipoPerfil: "guardador",
    ordem: 4,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "Você planeja tudo, menos <em>o que te faz bem</em>",
        corpo: "Repara na assimetria: o que você guarda tem número, destino e disciplina. O que te dá prazer fica no 'um dia', no 'quando der'. <strong>Esse módulo fecha a trilha invertendo isso uma vez.</strong>",
        insight: { label: "Por que isso importa", texto: "Gasto planejado com antecedência tem um bônus escondido: a espera. Quem marca a viagem pra daqui a três meses aproveita duas vezes. Os três meses de expectativa e a viagem em si." },
      }},
      { ordem: 1, tipo: "quiz", label: "Situação real", conteudo: {
        headline: "O Théo quer ir num show daqui a 2 meses (R$ 400). O que o Guardador treinado faz?",
        opcoes: [
          { letra: "A", texto: "Reserva R$ 200/mês do valor livre e compra o ingresso já", correta: true, feedback: "Isso. Cabe no valor livre, tem data, tem plano. Comprar já garante o preço e transforma dois meses de espera em dois meses de expectativa boa." },
          { letra: "B", texto: "Espera a véspera pra decidir se 'realmente vale a pena'", correta: false, feedback: "Você conhece o final: na véspera o ingresso subiu ou esgotou, e a dúvida vence de novo. 'Decidir depois' nesse perfil quase sempre significa 'não'." },
          { letra: "C", texto: "Não vai. R$ 400 em renda fixa viram R$ 440 no fim do ano", correta: false, feedback: "A conta está certa, e é essa a armadilha: pela matemática pura, TODO gasto perde pro rendimento, sempre. Se esse for o único critério, você guarda a vida inteira e não vive nenhuma parte dela." },
        ],
      }},
      { ordem: 2, tipo: "conceito", label: "O nome disso", conteudo: {
        headline: "Gasto alinhado a <em>valores</em>",
        corpo: "A pesquisa sobre culpa financeira aponta uma saída consistente: a culpa some quando o gasto está <strong>conectado ao que importa de verdade pra você</strong>, e foi decidido com intenção, não no automático.",
        insight: { label: "O critério", texto: "Antes de planejar, uma pergunta: o que te fez genuinamente feliz nos últimos doze meses? A resposta é o seu mapa de valores. Gasto alinhado a ele nunca é desperdício." },
      }},
      { ordem: 3, tipo: "input", label: "Agora é com você", conteudo: {
        headline: "Planeja <em>uma</em> experiência. Com data.",
        subtitulo: "3 campos. Reancora seu valor livre do módulo 2.",
        aviso: "Isso fica só com você. Não salvamos nenhuma resposta.",
        campos: [
          { id: "experiencia", emoji: "🎫", label: "Quero", placeholder: "que experiência você quer viver?", tipo: "texto" },
          { id: "custoExp", emoji: "💰", label: "Custa", placeholder: "R$ quanto custa?", tipo: "decimal" },
          { id: "livre", emoji: "🎟️", label: "Livre", placeholder: "R$ do seu valor livre mensal (módulo 2)", tipo: "decimal" },
        ],
      }},
      { ordem: 4, tipo: "resultado", label: "Seu resultado", conteudo: {
        headline: "\"{experiencia}\" em <em>{mesesJuntar} mês(es)</em> de valor livre",
        formula: "prazer_planejado",
        faixas: [
          { condicao: "mesesJuntar <= 1", mensagem: "Cabe já no seu valor livre desse mês. Não tem mais desculpa matemática. Marca a data. De verdade: abre a agenda agora e marca.", cor: "green" },
          { condicao: "mesesJuntar <= 3", mensagem: "Reservando o valor livre por alguns meses, chega. Isso é um plano, e plano é o seu idioma. A diferença é que dessa vez o destinatário é você.", cor: "green" },
          { condicao: "mesesJuntar > 3", mensagem: "Mais de três meses de valor livre inteiro é pesado. Duas saídas dignas: uma versão menor da mesma experiência agora, ou a completa com prazo maior e parte vindo do guardado, que você tem, lembra?", cor: "yellow" },
        ],
        insightDinamico: "Gasto planejado, alinhado ao que importa, dentro da sua regra. Se a culpa aparecer mesmo assim, ela não está te protegendo de nada: é só o hábito antigo fazendo barulho.",
      }},
      { ordem: 5, tipo: "conceito", label: "Trilha completa", conteudo: {
        headline: "Trilha do Guardador <em>completa</em> 🏁",
        corpo: "Olha o caminho: você entendeu a culpa (M1), criou seu valor livre (M2), acordou o dinheiro parado (M3) e <strong>marcou data com o próprio prazer</strong> (M4). Guardar continua sendo seu superpoder, agora com direção.",
        insight: { label: "Trilha completa", texto: "Manutenção: valor livre todo mês (e USA ele), guardado rendendo, e pelo menos uma experiência com data marcada por vez. Segurança e vida, as duas ao mesmo tempo." },
      }},
    ],
  },

  // ============================================================
  // IMPULSIVO — M2: A pausa que desarma (7 telas)
  // ============================================================
  {
    slug: "impulsivo-m2-pausa",
    titulo: "A pausa que desarma",
    subtitulo: "A técnica mais simples que existe, e a que mais funciona.",
    tipoPerfil: "impulsivo",
    ordem: 2,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "Você não precisa de mais <em>força de vontade</em>",
        corpo: "No módulo 1 você mapeou seu gatilho. Agora a ferramenta, e ela NÃO é 'se controlar mais'. Força de vontade falha exatamente nos momentos em que você mais precisa dela. <strong>O que funciona é tempo.</strong>",
        insight: { label: "Por que isso importa", texto: "O impulso é uma onda: sobe rápido, mas também desce rápido. Ele não sobrevive à espera. Quem aprende a deixar a onda passar não precisa lutar contra ela." },
      }},
      { ordem: 1, tipo: "cenario", label: "Conceito", conteudo: {
        headline: "A Lari testou a <em>pausa</em>",
        personagem: "Lari, 27, agência de publicidade",
        linhas: [
          { label: "Quinta: dia pesado + carrinho de R$ 520", valor: -520, tipo: "saida", valorTexto: "no carrinho" },
          { label: "Regra nova: acima de R$ 200, dorme", valor: 0, tipo: "entrada", valorTexto: "pausa de 24h" },
          { label: "Sexta: vontade que sobrou", valor: 0, tipo: "saldo", valorTexto: "quase zero" },
        ],
        rodape: "Na sexta ela nem lembrava direito por que queria aquilo. <strong>Não foi disciplina. Foi a onda descendo sozinha.</strong> R$ 520 continuam com ela.",
      }},
      { ordem: 2, tipo: "quiz", label: "Reflexão rápida", conteudo: {
        headline: "Por que a vontade da Lari quase sumiu em um dia?",
        opcoes: [
          { letra: "A", texto: "A emoção que criou a vontade passou, e levou a vontade junto", correta: true, feedback: "Exato. A compra era filha do dia pesado de quinta. Sem o dia pesado, ela ficou órfã. A pausa não mata o desejo real, só o desejo emprestado da emoção." },
          { letra: "B", texto: "Ela percebeu que o produto era ruim", correta: false, feedback: "O produto era o mesmo nos dois dias. O que mudou foi ela. De 'exausta buscando alívio' pra 'descansada avaliando de verdade'." },
          { letra: "C", texto: "Sorte. Normalmente esperar não muda nada", correta: false, feedback: "É o padrão mais documentado do consumo por impulso: a intensidade da vontade despenca com o tempo. Se depois de 24h você AINDA quer, aí sim é desejo real, e pode virar compra planejada." },
        ],
      }},
      { ordem: 3, tipo: "conceito", label: "O nome disso", conteudo: {
        headline: "Período de <em>esfriamento</em>",
        corpo: "É a mesma lógica do direito de arrependimento de 7 dias em compras online: decisões tomadas no calor precisam de uma chance de revisão a frio. <strong>Você vai instalar essa lei em você mesmo</strong>, com um limite que dispara automático.",
        insight: { label: "A calibragem que importa", texto: "O limite tem que ficar ABAIXO do seu impulso típico. Se seus impulsos são de R$ 300 e seu limite é R$ 800, a pausa nunca dispara, vira regra decorativa." },
      }},
      { ordem: 4, tipo: "input", label: "Agora é com você", conteudo: {
        headline: "Calibra a <em>sua</em> pausa",
        subtitulo: "2 campos. O limite certo é o que pega o SEU impulso.",
        aviso: "Isso fica só com você. Não salvamos nenhum valor.",
        campos: [
          { id: "gastoTipico", emoji: "🛍️", label: "Meu impulso", tipo: "faixa", opcoes: [
            { label: "até R$ 100", valor: "70" },
            { label: "R$ 100–300", valor: "200" },
            { label: "R$ 300–700", valor: "500" },
            { label: "mais de R$ 700", valor: "900" },
          ] },
          { id: "limiar", emoji: "⏸️", label: "Minha pausa", placeholder: "R$ a partir de quanto você espera 24h?", tipo: "decimal" },
        ],
      }},
      { ordem: 5, tipo: "resultado", label: "Seu resultado", conteudo: {
        headline: "Teste de calibragem da <em>sua pausa</em>",
        formula: "pausa_limiar",
        faixas: [
          { condicao: "cobre == 1", mensagem: "Calibrada: seu impulso típico cai dentro da pausa. Da próxima vez que a emoção do módulo 1 aparecer com um carrinho na mão, a regra dispara sozinha. Anota, fecha o app, decide amanhã.", cor: "green" },
          { condicao: "cobre == 0", mensagem: "Descalibrada: seu limite está ACIMA do seu impulso típico. A pausa nunca vai disparar. Desce o limite pra baixo do valor que você costuma gastar. Regra que não dispara é decoração.", cor: "red" },
        ],
        insightDinamico: "Sua lei pessoal: acima de R$ {limiar} → anota o item, fecha o app, decide amanhã no mesmo horário. Se amanhã ainda quiser, é desejo real, e desejo real merece compra planejada, não culpa.",
      }},
      { ordem: 6, tipo: "conceito", label: "Módulo completo", conteudo: {
        headline: "Pausa <em>instalada</em>",
        corpo: "Você não vai mais lutar contra a onda. Vai esperar ela passar. Mas a pausa deixa um vazio: a emoção continua lá, pedindo alívio. No próximo módulo, <strong>o que fazer nesse vazio</strong>, o alívio que não custa nada.",
        insight: { label: "Módulo 2 completo", texto: "Impulso é onda: sobe e desce sozinho · Limite abaixo do impulso típico, senão é decoração · 24h separam desejo emprestado de desejo real." },
      }},
    ],
  },

  // ============================================================
  // IMPULSIVO — M3: Troca o alívio (6 telas, input cedo)
  // ============================================================
  {
    slug: "impulsivo-m3-substituto",
    titulo: "Troca o alívio",
    subtitulo: "A emoção vai continuar vindo, muda o que você faz com ela.",
    tipoPerfil: "impulsivo",
    ordem: 3,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "A pausa segura a compra. Mas e a <em>emoção?</em>",
        corpo: "Módulo 1: você mapeou o gatilho. Módulo 2: instalou a pausa. Só que tem um buraco no plano. <strong>a emoção continua lá, pedindo alívio.</strong> Se você só bloquear a compra sem dar outra saída, a pressão acumula e uma hora estoura.",
        insight: { label: "Por que isso importa", texto: "O impulso de compra é uma resposta aprendida: emoção ruim → comprar → alívio. Não dá pra apagar uma resposta aprendida, mas dá pra gravar outra por cima. Mesma emoção, nova saída." },
      }},
      { ordem: 1, tipo: "input", label: "Agora é com você", conteudo: {
        headline: "Monta o <em>seu</em> plano de troca",
        subtitulo: "3 campos. Reancora seu gatilho do módulo 1.",
        aviso: "Isso fica só com você. Não salvamos nenhuma resposta.",
        campos: [
          { id: "emocao", emoji: "🎭", label: "Gatilho", placeholder: "sua emoção-gatilho (do módulo 1)", tipo: "texto" },
          { id: "substituto", emoji: "🔄", label: "Troco por", placeholder: "algo que te alivia e não custa (caminhar, treinar, ligar pra alguém...)", tipo: "texto" },
          { id: "obstaculo", emoji: "🪨", label: "Meu risco", placeholder: "o que pode te fazer furar o plano?", tipo: "texto" },
        ],
      }},
      { ordem: 2, tipo: "cenario", label: "Conceito", conteudo: {
        headline: "O plano da <em>Lari</em>",
        personagem: "Lari, 27, agência de publicidade",
        linhas: [
          { label: "Gatilho: semana pesada no trabalho", valor: 0, tipo: "entrada", valorTexto: "mapeado" },
          { label: "Resposta antiga: compra online", valor: -520, tipo: "saida", valorTexto: "R$ 520 em média" },
          { label: "Resposta nova: caminhada de 15 min + playlist", valor: 0, tipo: "saldo", valorTexto: "R$ 0" },
        ],
        rodape: "Mesma emoção, mesma necessidade de alívio. A diferença: <strong>a resposta nova alivia de verdade e não cobra nada depois</strong>, nem dinheiro, nem culpa, nem fatura.",
      }},
      { ordem: 3, tipo: "quiz", label: "Reflexão rápida", conteudo: {
        headline: "Qual substituto teria MAIS chance de funcionar pra Lari?",
        opcoes: [
          { letra: "A", texto: "Um que ela consegue fazer em 2 minutos, de onde estiver", correta: true, feedback: "Exato. O impulso aparece em segundos. O substituto tem que estar à mão na mesma velocidade. Simples e imediato vence perfeito e distante." },
          { letra: "B", texto: "Rolar o feed pra distrair", correta: false, feedback: "Armadilha clássica: o feed é exatamente onde moram os anúncios e as lojas. É apagar incêndio com álcool. O substituto precisa te tirar do ambiente de compra, não te devolver pra ele." },
          { letra: "C", texto: "Prometer a si mesma ser mais forte na próxima", correta: false, feedback: "Promessa não é plano. 'Ser mais forte' falha exatamente no momento de fraqueza, por definição. Plano é: quando X acontecer, eu faço Y. Concreto, decidido antes." },
        ],
      }},
      { ordem: 4, tipo: "resultado", label: "Seu resultado", conteudo: {
        headline: "Seu plano: quando bater <em>{emocao}</em> → <em>{substituto}</em>",
        insightDinamico: "Esse formato 'quando X, faço Y' é o que a pesquisa chama de plano se-então. Decidido a frio, executado no automático. Seu risco mapeado: \"{obstaculo}\". Já sabendo dele, você não é pego de surpresa. As primeiras vezes vão dar trabalho; da quinta em diante, o cérebro começa a puxar a resposta nova sozinho.",
      }},
      { ordem: 5, tipo: "conceito", label: "Módulo completo", conteudo: {
        headline: "Alívio <em>trocado</em>",
        corpo: "Gatilho mapeado, pausa instalada, resposta nova gravada. Último módulo da trilha: <strong>a lista que decide por você</strong>. O destino oficial de todo desejo que sobreviver à pausa.",
        insight: { label: "Módulo 3 completo", texto: "Bloquear sem substituir acumula pressão · Substituto bom = imediato e fora do ambiente de compra · Quando X, faço Y, decidido antes." },
      }},
    ],
  },

  // ============================================================
  // IMPULSIVO — M4: A lista que decide por você (6 telas, abre com quiz)
  // ============================================================
  {
    slug: "impulsivo-m4-lista",
    titulo: "A lista que decide por você",
    subtitulo: "O destino de todo desejo que sobreviver à pausa.",
    tipoPerfil: "impulsivo",
    ordem: 4,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "E o desejo que <em>sobrevive</em> às 24 horas?",
        corpo: "Nem todo impulso é falso alarme. Às vezes você espera um dia, espera dois. <strong>e ainda quer.</strong> Isso é desejo real, e desejo real merece respeito: um lugar oficial pra esperar a vez dele.",
        insight: { label: "Por que isso importa", texto: "Sem a lista, todo desejo vira urgência disfarçada. Com a lista, os desejos competem entre si, e o tempo revela quais eram de verdade. Você compra os vencedores, sem culpa." },
      }},
      { ordem: 1, tipo: "quiz", label: "Situação real", conteudo: {
        headline: "Um item está há 10 dias na lista da Lari e ela ainda pensa nele. O que isso significa?",
        opcoes: [
          { letra: "A", texto: "É desejo real. Pode virar compra planejada, sem culpa", correta: true, feedback: "Exato. Sobreviver 10 dias sem a emoção do momento sustentando é o teste mais honesto que existe. Comprar agora não é impulso: é decisão." },
          { letra: "B", texto: "Ela deveria esperar mais, só por garantia", correta: false, feedback: "Esticar a espera pra sempre transforma a lista em prisão, e aí o sistema inteiro perde a graça e é abandonado. A lista precisa ter saída, senão vira só um jeito novo de se punir." },
          { letra: "C", texto: "A lista falhou. O certo era o desejo sumir", correta: false, feedback: "A lista não existe pra matar desejos. Existe pra separar os falsos dos verdadeiros. Um item que sobrevive é a lista FUNCIONANDO, não falhando." },
        ],
      }},
      { ordem: 2, tipo: "conceito", label: "Como funciona", conteudo: {
        headline: "As 3 regras da <em>lista de espera</em>",
        corpo: "<strong>1.</strong> Todo desejo acima da sua pausa entra na lista, sem exceção, sem julgamento.<br><strong>2.</strong> Item que completar 7 dias e você ainda quiser: pode ser comprado, planejado, sem culpa.<br><strong>3.</strong> Item que você esqueceu que estava lá: sai da lista. Ele já disse tudo.",
        insight: { label: "O efeito colateral bom", texto: "Depois de algumas semanas, a lista vira um espelho: você começa a ver os padrões do que deseja de verdade, e do que só desejava por quinze minutos." },
      }},
      { ordem: 3, tipo: "input", label: "Agora é com você", conteudo: {
        headline: "Inaugura a <em>sua</em> lista",
        subtitulo: "3 campos. Os dois primeiros moradores e onde ela vai viver.",
        aviso: "Isso fica só com você. Não salvamos nenhuma resposta.",
        campos: [
          { id: "desejo1", emoji: "1️⃣", label: "Desejo 1", placeholder: "o que você quer agora?", tipo: "texto" },
          { id: "valor", emoji: "💰", label: "Custa", placeholder: "R$ quanto custa o desejo 1?", tipo: "decimal" },
          { id: "onde", emoji: "📍", label: "Onde", placeholder: "onde a lista vai viver? (notas, planilha, papel...)", tipo: "texto" },
        ],
      }},
      { ordem: 4, tipo: "resultado", label: "Seu resultado", conteudo: {
        headline: "\"{desejo1}\" entrou na lista. <em>Relógio rodando.</em>",
        formula: "impulsivo_gatilho",
        faixas: [
          { condicao: "valor > 500", mensagem: "Valor alto: esse merece o teste completo. 14 dias em vez de 7. Se sobreviver duas semanas, não só pode como MERECE ser comprado com planejamento (e à vista, se der).", cor: "yellow" },
          { condicao: "valor <= 500", mensagem: "Teste padrão: 7 dias. Anota a data de entrada. Daqui uma semana, ou ele virou compra planejada ou virou história engraçada.", cor: "green" },
        ],
        insightDinamico: "Sua lista vive em: \"{onde}\". A partir de hoje o fluxo é um só: impulso → pausa → lista → 7 dias → decisão. Nenhuma etapa é proibição, todas são filtro.",
      }},
      { ordem: 5, tipo: "conceito", label: "Trilha completa", conteudo: {
        headline: "Trilha do Impulsivo <em>completa</em> 🏁",
        corpo: "Olha o sistema: você <strong>conhece seu gatilho</strong> (M1), <strong>tem uma pausa que dispara sozinha</strong> (M2), <strong>um alívio que não custa</strong> (M3) e <strong>uma lista que separa desejo real de falso alarme</strong> (M4). O impulso não sumiu, ele só não manda mais.",
        insight: { label: "Trilha completa", texto: "Manutenção: a pausa em todo gasto acima do limite, o substituto quando o gatilho bater, e a lista rodando. O que sobreviver, compra sem culpa, isso também é vitória." },
      }},
    ],
  },

  // ============================================================
  // SONHADOR — M2: O menor passo possível (7 telas)
  // ============================================================
  {
    slug: "sonhador-m2-passo-minimo",
    titulo: "O menor passo possível",
    subtitulo: "A meta existe, agora ela começa.",
    tipoPerfil: "sonhador",
    ordem: 2,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "Meta definida não é meta <em>começada</em>",
        corpo: "No módulo 1 seu objetivo ganhou número e prazo. Perigo agora: a sensação de progresso SEM progresso. <strong>Definir a meta dá uma satisfação que engana</strong>. Parece que você já fez algo. Ainda não fez.",
        insight: { label: "Por que isso importa", texto: "A diferença entre quem realiza e quem planeja não é o tamanho do primeiro passo: é a existência dele. Começado pequeno vence perfeito adiado, sempre." },
      }},
      { ordem: 1, tipo: "cenario", label: "Conceito", conteudo: {
        headline: "O Kaio quase caiu na <em>armadilha</em>",
        personagem: "Kaio, 31",
        linhas: [
          { label: "Meta: R$ 500/mês pra pós", valor: 500, tipo: "entrada", valorTexto: "R$ 500/mês" },
          { label: "Plano A: 'começo mês que vem, organizado'", valor: 0, tipo: "saida", valorTexto: "= nunca" },
          { label: "Plano B: transferiu R$ 50 no mesmo dia", valor: 50, tipo: "saldo" },
        ],
        rodape: "R$ 50 não pagam pós nenhuma. Mas quebram algo maior: <strong>o zero.</strong> Quem saiu do zero tem um progresso pra defender. Quem 'vai começar' tem só uma promessa pra adiar.",
      }},
      { ordem: 2, tipo: "quiz", label: "Reflexão rápida", conteudo: {
        headline: "Por que os R$ 50 de hoje valem mais que os R$ 500 'de mês que vem'?",
        opcoes: [
          { letra: "A", texto: "Porque existem, e o resto ainda é promessa", correta: true, feedback: "Exato. R$ 50 reais mudam sua identidade de 'quem vai guardar' pra 'quem guarda'. E identidade puxa comportamento: quem já começou tende a continuar." },
          { letra: "B", texto: "Não valem, sem os R$ 500 completos, não conta", correta: false, feedback: "Essa é a voz do perfeccionismo. A mesma que mantém todos os planos na cabeça há dois anos. 'Ou completo ou nada' termina em nada. Sempre." },
          { letra: "C", texto: "Valem porque R$ 50 rendem juros", correta: false, feedback: "Renderiam centavos. O valor dos R$ 50 não é financeiro: é comportamental: eles provam que o plano saiu da cabeça. Essa prova não tem preço." },
        ],
      }},
      { ordem: 3, tipo: "conceito", label: "O nome disso", conteudo: {
        headline: "Plano <em>se-então</em>",
        corpo: "A pesquisa mostra que intenção vaga ('vou guardar todo mês') falha, e intenção ancorada num evento ('QUANDO o salário cair, ENTÃO transfiro R$ 100') executa quase sozinha. <strong>O evento vira o lembrete, você não depende de lembrar.</strong>",
        insight: { label: "A fórmula", texto: "Quando [evento que sempre acontece] → eu transfiro [valor pequeno demais pra falhar] pra [meu objetivo]. Os três espaços preenchidos = plano. Qualquer espaço vago = desejo." },
      }},
      { ordem: 4, tipo: "input", label: "Agora é com você", conteudo: {
        headline: "Preenche o <em>seu</em> se-então",
        subtitulo: "3 campos. Reancora seu objetivo do módulo 1.",
        aviso: "Isso fica só com você. Não salvamos nenhuma resposta.",
        campos: [
          { id: "sonho", emoji: "✨", label: "Pra", placeholder: "seu objetivo (do módulo 1)", tipo: "texto" },
          { id: "quando", emoji: "⚡", label: "Quando", placeholder: "evento-gatilho (cair o salário, todo dia 5...)", tipo: "texto" },
          { id: "quanto", emoji: "🪙", label: "Transfiro", placeholder: "R$ pequeno demais pra falhar", tipo: "decimal" },
        ],
      }},
      { ordem: 5, tipo: "resultado", label: "Seu resultado", conteudo: {
        headline: "Quando <em>{quando}</em> → transfiro <em>R$ {quanto}</em> pra \"{sonho}\"",
        formula: "passo_minimo",
        faixas: [
          { condicao: "valor <= 100", mensagem: "Pequeno demais pra falhar. Exatamente o tamanho certo. Depois que virar automático (umas quatro repetições), aí sim você aumenta. Começar pequeno não é falta de ambição: é estratégia.", cor: "green" },
          { condicao: "valor <= 300", mensagem: "Valor médio pra um primeiro passo. Funciona se couber com folga, mas se no segundo mês apertar, desce sem culpa. O hábito importa mais que o valor agora.", cor: "yellow" },
          { condicao: "valor > 300", mensagem: "Ambicioso demais pra um começo, e primeiro passo grande é o que mais falha. Corta pela metade. Sério. Você aumenta depois que a engrenagem estiver girando.", cor: "red" },
        ],
        insightDinamico: "E agora a parte que separa esse módulo de todos os planos que ficaram na cabeça: faz a primeira transferência HOJE. Não quando o evento chegar. Hoje, qualquer valor. Quebra o zero antes de fechar o app.",
      }},
      { ordem: 6, tipo: "conceito", label: "Módulo completo", conteudo: {
        headline: "Zero <em>quebrado</em>",
        corpo: "Seu objetivo tem número, prazo e agora um mecanismo que executa sozinho. Próximo módulo: <strong>a matemática dele contra a sua renda real</strong>. Porque plano que ignora a realidade volta a ser fantasia.",
        insight: { label: "Módulo 2 completo", texto: "Definir não é começar · Quando X → transfiro Y pra Z · Pequeno demais pra falhar é o tamanho certo." },
      }},
    ],
  },

  // ============================================================
  // SONHADOR — M3: A matemática do sonho (6 telas, input cedo)
  // ============================================================
  {
    slug: "sonhador-m3-realidade",
    titulo: "A matemática do plano",
    subtitulo: "O teste de realidade que protege a meta.",
    tipoPerfil: "sonhador",
    ordem: 3,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "Meta que ignora a renda vira <em>frustração agendada</em>",
        corpo: "Você tem objetivo (M1) e primeiro passo (M2). Falta o teste que quase ninguém faz: <strong>a meta cabe na SUA renda?</strong> Não na renda ideal, não na do mês do décimo terceiro, na real, do mês comum.",
        insight: { label: "Por que isso importa", texto: "Meta impossível não motiva. Sabota. Três meses falhando 'por sua culpa' (que era da matemática) e você desiste não só dessa meta, mas da ideia de ter metas. Melhor ajustar agora." },
      }},
      { ordem: 1, tipo: "input", label: "Agora é com você", conteudo: {
        headline: "Bota os dois números <em>na mesa</em>",
        subtitulo: "2 campos. Reancora o valor/mês da sua meta do módulo 1.",
        aviso: "Isso fica só com você. Não salvamos nenhum valor.",
        campos: [
          { id: "entrou", emoji: "💸", label: "Entra", placeholder: "R$ da sua renda mensal REAL (mês comum)", tipo: "decimal" },
          { id: "valorMes", emoji: "🎯", label: "Meta pede", placeholder: "R$ por mês da sua meta (módulo 1)", tipo: "decimal" },
        ],
      }},
      { ordem: 2, tipo: "cenario", label: "Conceito", conteudo: {
        headline: "O teste do <em>Kaio</em>",
        personagem: "Kaio, 31",
        linhas: [
          { label: "Renda real (salário + freelas)", valor: 4500, tipo: "entrada" },
          { label: "Meta pede por mês", valor: -1200, tipo: "saida" },
          { label: "Peso da meta na renda", valor: 0, tipo: "saldo", valorTexto: "27%" },
        ],
        rodape: "27% da renda indo pra meta: aperta, mas passa no teste. <strong>Se desse 60%, o problema não seria disciplina. Seria física.</strong> E física não se resolve com força de vontade.",
      }},
      { ordem: 3, tipo: "quiz", label: "Reflexão rápida", conteudo: {
        headline: "Se a meta do Kaio pedisse 60% da renda, qual seria a atitude certa?",
        opcoes: [
          { letra: "A", texto: "Esticar o prazo ou reduzir a meta. Ajustar a matemática", correta: true, feedback: "Exato. Meta é ferramenta, não juramento. Ajustar o plano à realidade não é fracassar: é a diferença entre quem realiza devagar e quem desiste rápido." },
          { letra: "B", texto: "Tentar mesmo assim. Quem quer, consegue", correta: false, feedback: "Essa frase já enterrou mais metas que a preguiça. Viver com 40% da renda durante meses, pagando aluguel, não é questão de querer, e quando falhar, a culpa (injusta) vai ser sua. Matemática primeiro, motivação depois." },
          { letra: "C", texto: "Desistir. Sinal de que não era pra ele", correta: false, feedback: "Extremo oposto, mesmo erro. A meta continua válida. O PRAZO é que estava errado. Dobra o prazo, o peso cai pra 30%, e o plano segue vivo e possível." },
        ],
      }},
      { ordem: 4, tipo: "resultado", label: "Seu resultado", conteudo: {
        headline: "Sua meta pede <em>{pctMeta}%</em> da sua renda",
        formula: "realidade_meta",
        faixas: [
          { condicao: "pctMeta <= 15", mensagem: "Confortável: a meta cabe com folga. Dá até pra considerar encurtar o prazo. Teste de realidade aprovado com sobra.", cor: "green" },
          { condicao: "pctMeta <= 30", mensagem: "Zona de esforço real: dá, mas exige escolhas conscientes todo mês. É sustentável se o aluguel, as contas e a comida couberem no que sobra. Confere isso antes de comemorar. Fica de olho nos dois primeiros meses.", cor: "yellow" },
          { condicao: "pctMeta > 30", mensagem: "Acima de 30%, a matemática está contra você, e ela sempre vence no longo prazo. Duas saídas honestas: esticar o prazo (o peso cai na proporção) ou reduzir a versão da meta. Ajustar AGORA é o que salva o plano.", cor: "red" },
        ],
        insightDinamico: "Esse número. {pctMeta}%: é o teste que separa meta de fantasia. Você fez a conta que a maioria só descobre na frustração do terceiro mês. Se precisar ajustar, ajusta sem culpa: o plano agradece.",
      }},
      { ordem: 5, tipo: "conceito", label: "Módulo completo", conteudo: {
        headline: "Realidade <em>testada</em>",
        corpo: "Meta com número, primeiro passo rodando e matemática conferida. Último módulo da trilha: <strong>o check de 5 minutos</strong>. O ritual que impede a empolgação de hoje de virar abandono no mês que vem.",
        insight: { label: "Módulo 3 completo", texto: "Meta impossível sabota, não motiva · Ajustar prazo não é fracassar · Matemática primeiro, motivação depois." },
      }},
    ],
  },

  // ============================================================
  // SONHADOR — M4: O check de 5 minutos (6 telas, abre com quiz)
  // ============================================================
  {
    slug: "sonhador-m4-revisao",
    titulo: "O check de 5 minutos",
    subtitulo: "O ritual que mantém o plano vivo depois da empolgação.",
    tipoPerfil: "sonhador",
    ordem: 4,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "A empolgação de hoje tem <em>prazo de validade</em>",
        corpo: "Você conhece o ciclo: semana 1, tudo perfeito. Semana 3, 'esqueci'. Semana 5, o plano nem existe mais. <strong>Não é defeito seu: é o padrão de todo começo.</strong> O que os realizadores têm não é empolgação eterna: é um ritual que funciona sem ela.",
        insight: { label: "Por que isso importa", texto: "Acompanhar o próprio progresso é um dos preditores mais fortes de meta cumprida. Não porque motiva, mas porque impede o desvio silencioso de virar abandono definitivo." },
      }},
      { ordem: 1, tipo: "quiz", label: "Situação real", conteudo: {
        headline: "Semana 4: o Kaio não transferiu nada e o check de domingo mostrou isso. O que o check deve fazer?",
        opcoes: [
          { letra: "A", texto: "Registrar sem drama e ajustar a semana seguinte", correta: true, feedback: "Exato. O check é painel de controle, não tribunal. Uma semana falhada e detectada custa uma semana. Uma semana falhada e escondida vira um mês, e depois vira o fim do plano." },
          { letra: "B", texto: "Compensar dobrando o valor da próxima semana", correta: false, feedback: "Punição transforma o check em coisa a evitar, e check evitado é plano morto. Além disso, dobrar o valor depois de falhar o normal é receita pra falhar de novo, agora com juros de culpa." },
          { letra: "C", texto: "Nada. Falhou uma vez, o plano já era", correta: false, feedback: "O pensamento tudo-ou-nada de novo. O maior inimigo do seu perfil. Todo plano de longo prazo tem semanas falhas. A diferença entre realizar e desistir é o que acontece na semana SEGUINTE." },
        ],
      }},
      { ordem: 2, tipo: "conceito", label: "Como funciona", conteudo: {
        headline: "O check tem <em>3 perguntas</em> e 5 minutos",
        corpo: "<strong>1.</strong> Transferi o combinado essa semana? (sim/não, sem julgamento)<br><strong>2.</strong> Quanto falta pra meta? (o número atualizado)<br><strong>3.</strong> Alguma coisa muda semana que vem? (ajuste, se precisar)",
        insight: { label: "A regra de ouro", texto: "Mesmo dia, mesmo horário, toda semana. Atrelado a algo que você JÁ faz (domingo à noite antes de dormir, sábado depois do almoço). Ritual sem âncora vira lembrança; com âncora, vira automático." },
      }},
      { ordem: 3, tipo: "input", label: "Agora é com você", conteudo: {
        headline: "Marca o <em>seu</em> check",
        subtitulo: "3 campos. O compromisso mais leve e mais importante da trilha.",
        aviso: "Isso fica só com você. Não salvamos nenhuma resposta.",
        campos: [
          { id: "dia", emoji: "📅", label: "Dia", placeholder: "que dia da semana?", tipo: "texto" },
          { id: "ancora", emoji: "⚓", label: "Junto de", placeholder: "atrelado a quê? (depois do almoço, antes de dormir...)", tipo: "texto" },
          { id: "onde", emoji: "📝", label: "Registro em", placeholder: "onde anota? (notas, caderno, planilha...)", tipo: "texto" },
        ],
      }},
      { ordem: 4, tipo: "resultado", label: "Seu resultado", conteudo: {
        headline: "Seu check: toda(o) <em>{dia}</em>, {ancora}",
        insightDinamico: "Registro em: \"{onde}\". Três perguntas, cinco minutos, toda semana. Esse ritual minúsculo é o que separa a sua trilha inteira de mais um plano bonito que ficou pela metade. Primeira sessão: já no próximo {dia}.",
      }},
      { ordem: 5, tipo: "conceito", label: "Trilha completa", conteudo: {
        headline: "Trilha do Sonhador <em>completa</em> 🏁",
        corpo: "Olha a jornada: um objetivo <strong>escolhido e ancorado</strong> (M1), um <strong>primeiro passo que quebrou o zero</strong> (M2), a <strong>matemática conferida</strong> (M3) e um <strong>ritual que sobrevive à empolgação</strong> (M4). Você não virou outra pessoa, virou alguém que executa o que planeja.",
        insight: { label: "Trilha completa", texto: "Manutenção: o se-então rodando, o check toda semana, e quando a meta completar. Comemora de verdade, e só DEPOIS escolhe a próxima. Um objetivo por vez continua sendo a regra." },
      }},
    ],
  },
]
