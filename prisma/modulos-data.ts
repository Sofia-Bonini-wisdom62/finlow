// Fonte única dos módulos M1 dos 4 perfis.
// Usada pelo seed.ts (pnpm prisma db seed) e pelo scripts/gen-seed-sql.ts
// (gera SQL pro Supabase SQL Editor quando a rede bloqueia conexão direta).
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
    subtitulo: "2 minutos. Sem julgamento. Você só vai olhar.",
    tipoPerfil: "lancador",
    ordem: 1,
    xp: 50,
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Ponto de partida",
        conteudo: {
          headline: "Você sabe pra onde foi o dinheiro <em>dessa semana?</em>",
          corpo: "A maioria dos jovens não sabe. E não é por falta de cuidado — é porque o dinheiro digital <strong>some sem deixar rastro visível.</strong> Esse módulo não vai te dizer o que fazer. Primeiro você vai só <strong>olhar.</strong>",
          insight: {
            label: "Por que isso importa",
            texto: "Você não consegue mudar o que não enxerga. Consciência vem antes de qualquer regra.",
          },
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Conceito",
        conteudo: {
          headline: "Fluxo de caixa é só <em>entrada menos saída</em>",
          personagem: "Bia, 16 anos",
          linhas: [
            { label: "Entrou (mesada)", valor: 120, tipo: "entrada" },
            { label: "iFood + lanche", valor: -47, tipo: "saida" },
            { label: "Transporte", valor: -28, tipo: "saida" },
            { label: "App de música", valor: -11, tipo: "saida" },
            { label: "Compras online", valor: -39, tipo: "saida" },
            { label: "Sobrou", valor: -5, tipo: "saldo" },
          ],
          rodape: "A Bia achava que ia sobrar bastante. <strong>Não sobrou quase nada.</strong>",
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Reflexão rápida",
        conteudo: {
          headline: "Por que a Bia ficou surpresa com o saldo?",
          opcoes: [
            {
              letra: "A",
              texto: "Muitos gastos pequenos somaram sem ela perceber",
              correta: true,
              feedback: "Exato. Nenhum gasto sozinho era grande — mas a soma comeu quase tudo. É assim que o dinheiro some sem drama.",
            },
            {
              letra: "B",
              texto: "Ela fez um gasto grande demais em algo caro",
              correta: false,
              feedback: "Repara: o maior gasto foi R$ 47. Não teve gasto grande — teve muitos pequenos. Esse é o padrão que engana.",
            },
            {
              letra: "C",
              texto: "Foi azar — essa semana foi atípica",
              correta: false,
              feedback: "Quase toda semana tem essa cara quando ninguém olha o extrato. Não é azar — é padrão invisível se repetindo.",
            },
          ],
        },
      },
      {
        ordem: 3,
        tipo: "conceito",
        label: "O nome disso",
        conteudo: {
          headline: "Pequenos gastos são <em>invisíveis</em> — até somar",
          corpo: "R$ 11 de streaming. R$ 8 de café. R$ 14 de entrega. Nenhum parece grande. Mas juntos viram <strong>R$ 33</strong> — e você nem lembra de ter gasto.",
          insight: {
            label: "O nome disso",
            texto: "Dor do pagamento: entregar dinheiro físico dói, e essa dor freia o gasto. PIX e cartão removem a dor — o cérebro quase não registra a saída, e os pequenos gastos ficam invisíveis.",
          },
        },
      },
      {
        ordem: 4,
        tipo: "input",
        label: "Agora é com você",
        conteudo: {
          headline: "Abre o extrato e preenche <em>só isso</em>",
          subtitulo: "3 campos. 2 minutos. Não precisa ser exato.",
          aviso: "Isso fica só com você. Não salvamos nenhum valor.",
          campos: [
            { id: "entrou", emoji: "💸", label: "Entrou", placeholder: "R$ quanto veio essa semana?", tipo: "decimal" },
            { id: "saiu", emoji: "🛒", label: "Saiu", placeholder: "R$ soma do que saiu no extrato", tipo: "decimal" },
            { id: "gasto", emoji: "🤔", label: "1 gasto", placeholder: "que você não lembrava até ver", tipo: "texto" },
          ],
        },
      },
      {
        ordem: 5,
        tipo: "resultado",
        label: "Seu resultado",
        conteudo: {
          headline: "Você gastou <em>{pct}%</em> do que entrou",
          formula: "entrou_saiu_pct",
          faixas: [
            { condicao: "sobrou > 30pct", mensagem: "Você ficou com mais de 30% do que entrou. Isso é raro — e é um bom começo.", cor: "green" },
            { condicao: "sobrou > 0", mensagem: "Sobrou algo, mas foi pouco. O módulo 2 vai te mostrar como garantir esse espaço antes de gastar qualquer coisa.", cor: "yellow" },
            { condicao: "sobrou <= 0", mensagem: "Gastou tudo — ou mais do que entrou. Isso é comum. Agora você sabe. E saber já é mudar.", cor: "red" },
          ],
          insightDinamico: "Você mencionou \"{gasto}\". Esse tipo de gasto é exatamente o que some primeiro — e soma mais do que parece.",
        },
      },
      {
        ordem: 6,
        tipo: "conceito",
        label: "Módulo completo",
        conteudo: {
          headline: "Consciência de fluxo <em>ativada</em>",
          corpo: "Você acabou de fazer o que a maioria dos adultos nunca fez: <strong>olhar de frente pra onde foi o dinheiro.</strong> No próximo módulo você vai aprender a <strong>garantir um espaço antes de gastar qualquer coisa</strong> — sem abrir mão do que importa.",
          insight: {
            label: "+ 50 XP · Módulo 1 completo",
            texto: "Fluxo de caixa = entrada − saída · Pequenos gastos somam mais do que parecem · Você identificou seu primeiro gasto invisível.",
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
    subtitulo: "2 minutos. Você guarda bem — agora vamos falar de usar.",
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
          corpo: "A maioria dos apps assume que você gasta sem pensar. Mas o seu caso é o contrário: você segura cada centavo — e mesmo assim sente <strong>peso quando gasta, até no que importa.</strong> Esse módulo é sobre isso.",
          insight: {
            label: "Por que isso importa",
            texto: "Guardar por escolha e guardar por hábito automático parecem iguais por fora. A diferença é uma pergunta que quase ninguém se faz: guardar pra quê?",
          },
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Conceito",
        conteudo: {
          headline: "A semana do <em>Théo</em>, 17 anos",
          personagem: "Théo, 17 anos",
          linhas: [
            { label: "Entrou (freela de design)", valor: 200, tipo: "entrada" },
            { label: "Guardou", valor: -190, tipo: "saida" },
            { label: "Gastou consigo", valor: -10, tipo: "saida" },
            { label: "Parado na conta, sem destino", valor: 190, tipo: "saldo" },
          ],
          rodape: "O Théo recusou um rolê pra não gastar R$ 25. Guardou 95% do que ganhou. <strong>E passou a semana se sentindo mal mesmo assim.</strong>",
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
              texto: "Ele guarda sem saber pra quê — e aí nem gastar nem guardar traz paz",
              correta: true,
              feedback: "Isso. Dinheiro guardado sem destino não dá a sensação de progresso — só adia a decisão. E cada gasto vira culpa porque não existe um 'quanto é ok'.",
            },
            {
              letra: "B",
              texto: "Ele deveria guardar ainda mais até se sentir seguro",
              correta: false,
              feedback: "Essa é a armadilha do perfil: se 95% não trouxe paz, 100% também não traria. O problema não é o valor guardado — é a falta de propósito.",
            },
            {
              letra: "C",
              texto: "Rolê é desperdício mesmo — ele fez certo em recusar",
              correta: false,
              feedback: "R$ 25 num momento com amigos não ameaçava nada — ele tinha R$ 190 sobrando. Recusar por reflexo, sem conta feita, não é decisão: é medo no automático.",
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
          corpo: "Quando você acredita que 'deveria estar guardando' e gasta mesmo assim, o cérebro entra em conflito. Esse desconforto se chama <strong>dissonância cognitiva</strong> — e aparece até quando o gasto era totalmente ok.",
          insight: {
            label: "A pergunta que desarma",
            texto: "Guardar demais também tem custo: experiências e momentos que não voltam. Antes de recusar o próximo gasto, vale uma pergunta honesta: isso é segurança — ou é medo no piloto automático?",
          },
        },
      },
      {
        ordem: 4,
        tipo: "input",
        label: "Agora é com você",
        conteudo: {
          headline: "Responde <em>sincero</em> — só pra você",
          subtitulo: "3 campos. Ninguém vê.",
          aviso: "Isso fica só com você. Não salvamos nenhuma resposta.",
          campos: [
            { id: "guardou", emoji: "🔒", label: "Guardei", placeholder: "R$ quanto você guardou esse mês?", tipo: "decimal" },
            { id: "gastou", emoji: "🎉", label: "Curti", placeholder: "R$ quanto gastou em algo que te fez bem?", tipo: "decimal" },
            { id: "recusa", emoji: "😕", label: "Recusei", placeholder: "algo que deixou de fazer só pra economizar", tipo: "texto" },
          ],
        },
      },
      {
        ordem: 5,
        tipo: "resultado",
        label: "Seu resultado",
        conteudo: {
          headline: "Você usou <em>{pctGuardador}%</em> do seu dinheiro com você",
          formula: "guardador_ratio",
          faixas: [
            {
              condicao: "pctGuardador < 5",
              mensagem: "Quase nada foi pra você. Não existe número certo — mas se dizer 'não' virou automático, vale investigar o porquê. O módulo 2 te dá um jeito de gastar com intenção, sem peso.",
              cor: "red",
            },
            {
              condicao: "pctGuardador < 20",
              mensagem: "Você guarda muito e usa pouco. Pode ser uma fase com objetivo — ou pode ser o automático. Só você sabe. O próximo módulo ajuda a transformar isso em escolha consciente.",
              cor: "yellow",
            },
            {
              condicao: "pctGuardador >= 20",
              mensagem: "Você tem um equilíbrio entre guardar e viver que é raro no seu perfil. A pergunta que fica: ele foi planejado ou aconteceu por acaso?",
              cor: "green",
            },
          ],
          insightDinamico: "Você deixou de fazer: \"{recusa}\". Vale se perguntar: essa recusa te protegeu de verdade — ou só te tirou um momento que não custava tanto assim?",
        },
      },
      {
        ordem: 6,
        tipo: "conceito",
        label: "Módulo completo",
        conteudo: {
          headline: "Permissão <em>ativada</em>",
          corpo: "Você viu que guardar sem propósito cobra um preço invisível — e que a culpa de gastar tem explicação, não é defeito seu. No próximo módulo você vai aprender a <strong>separar um valor só pra curtir sem culpa</strong>, com regra clara.",
          insight: {
            label: "+ 50 XP · Módulo 1 completo",
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
    subtitulo: "2 minutos. Sem sermão. Só pra entender o impulso.",
    tipoPerfil: "impulsivo",
    ordem: 1,
    xp: 50,
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Ponto de partida",
        conteudo: {
          headline: "A compra alivia. A culpa vem <em>depois.</em>",
          corpo: "Você já comprou algo no impulso e, minutos depois, pensou 'por que eu fiz isso?'. Não é defeito seu — é <strong>como o cérebro reage a uma emoção forte.</strong> Esse módulo mostra o mecanismo. Sem julgamento.",
          insight: {
            label: "Por que isso importa",
            texto: "Você não consegue controlar um impulso que não enxerga. Reconhecer o gatilho é o que devolve o poder de escolha pra você.",
          },
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Conceito",
        conteudo: {
          headline: "A terça-feira da <em>Lari</em>, 15 anos",
          personagem: "Lari, 15 anos",
          linhas: [
            { label: "Entrou (mesada)", valor: 80, tipo: "entrada" },
            { label: "Prova ruim + estresse → compra online", valor: -55, tipo: "saida" },
            { label: "Briga com amiga → lanche caro", valor: -18, tipo: "saida" },
            { label: "Sobrou", valor: 7, tipo: "saldo" },
          ],
          rodape: "A Lari não planejou nada disso. Cada compra veio logo depois de <strong>um momento ruim.</strong> O dinheiro não sumiu por acaso — sumiu junto com a emoção.",
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
              feedback: "Exato. Ela não queria o produto — queria fugir do estresse e da briga. A compra foi só o atalho pro alívio.",
            },
            {
              letra: "B",
              texto: "Coisas que ela precisava e ia comprar de qualquer jeito",
              correta: false,
              feedback: "Repara no padrão: as duas compras vieram minutos depois de um momento ruim. Necessidade real não tem esse timing.",
            },
            {
              letra: "C",
              texto: "Nada — ela só foi fraca, faltou força de vontade",
              correta: false,
              feedback: "Não é caráter nem força de vontade. É um mecanismo do cérebro que busca alívio imediato — e mecanismo dá pra aprender a desarmar.",
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
          corpo: "Quando bate uma emoção forte, o cérebro prefere um alívio pequeno e imediato a um ganho maior lá na frente. Isso tem nome: <strong>desconto temporal</strong>. É por isso que 'compro agora' parece tão certo na hora — e tão errado 10 minutos depois.",
          insight: {
            label: "O truque que desarma",
            texto: "A pausa. Só o ato de esperar antes de comprar já reduz a intensidade da emoção. Quando o impulso deixa de ser imediato, ele perde força — e a escolha volta pra você.",
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
            { id: "emocao", emoji: "🎭", label: "Sentia", placeholder: "que emoção veio antes? (tédio, raiva, ansiedade...)", tipo: "texto" },
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
              condicao: "valor > 100",
              mensagem: "Foi um gasto considerável movido por emoção. Imagina esse valor indo pra algo que você escolheu de verdade. O módulo 2 te dá a técnica da pausa pra isso não se repetir.",
              cor: "red",
            },
            {
              condicao: "valor > 30",
              mensagem: "O valor foi médio, mas o padrão é o que importa: emoção → compra. Agora que você viu o mecanismo, ele fica mais fácil de pegar no flagra.",
              cor: "yellow",
            },
            {
              condicao: "valor <= 30",
              mensagem: "O valor foi pequeno — e você acabou de fazer a parte mais difícil: ligar a compra à emoção que veio antes. Esse é o mapa que a maioria nunca desenha.",
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
          corpo: "Suas compras por impulso têm um padrão emocional — e agora você consegue vê-lo chegando. No próximo módulo você aprende a <strong>técnica da pausa</strong>: o passo simples que desarma o impulso antes de ele virar compra.",
          insight: {
            label: "+ 50 XP · Módulo 1 completo",
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
    subtitulo: "2 minutos. Escolhe um sonho — a gente dá um número a ele.",
    tipoPerfil: "sonhador",
    ordem: 1,
    xp: 50,
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Ponto de partida",
        conteudo: {
          headline: "Sonhar você já sabe. Falta <em>executar.</em>",
          corpo: "Você tem ideias demais: a viagem, o setup, o curso, o presente. Todas ficam na cabeça e <strong>nenhuma sai do lugar.</strong> O problema não é motivação — você tem de sobra. É que sonho sem número e sem prazo não vira ação.",
          insight: {
            label: "Por que isso importa",
            texto: "Existe um abismo entre querer e fazer — a pesquisa mostra que a intenção sozinha explica só uma fração do que a gente realiza. O que fecha o abismo é dar forma concreta ao sonho.",
          },
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Conceito",
        conteudo: {
          headline: "Os sonhos do <em>Kaio</em>, 16 anos",
          personagem: "Kaio, 16 anos",
          linhas: [
            { label: "Fone novo", valor: 0, tipo: "entrada", valorTexto: "— sem número" },
            { label: "Viagem no fim do ano", valor: 0, tipo: "entrada", valorTexto: "— sem número" },
            { label: "Curso de edição", valor: 0, tipo: "entrada", valorTexto: "— sem número" },
            { label: "Guardado pra qualquer um deles", valor: 0, tipo: "saldo" },
          ],
          rodape: "O Kaio quer as três coisas há meses. Nenhuma tem valor definido, nenhuma tem prazo. <strong>Resultado: R$ 0 guardado.</strong>",
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Reflexão rápida",
        conteudo: {
          headline: "Por que o Kaio não saiu do zero?",
          opcoes: [
            {
              letra: "A",
              texto: "Três sonhos vagos ao mesmo tempo travam a ação",
              correta: true,
              feedback: "Isso. Uma única meta concreta gera mais economia real do que várias ao mesmo tempo — espalhar o foco paralisa. É o que a pesquisa sobre metas mostra.",
            },
            {
              letra: "B",
              texto: "Ele ainda não encontrou o sonho certo",
              correta: false,
              feedback: "O sonho 'certo' não aparece sozinho — ele é construído quando você se compromete com um. Esperar a certeza é outra forma de adiar.",
            },
            {
              letra: "C",
              texto: "Ele precisa ganhar mais dinheiro primeiro",
              correta: false,
              feedback: "Sem meta definida, mais dinheiro também sumiria sem virar nenhum dos sonhos. O gargalo não é a renda — é a falta de alvo.",
            },
          ],
        },
      },
      {
        ordem: 3,
        tipo: "conceito",
        label: "O nome disso",
        conteudo: {
          headline: "Sonho vira meta quando ganha <em>número e data</em>",
          corpo: "'Quero viajar' é um desejo. 'Quero R$ 600 até dezembro pra viajar' é uma meta. A diferença parece pequena, mas pro cérebro é enorme: a segunda tem <strong>alvo, prazo e um próximo passo óbvio.</strong>",
          insight: {
            label: "A regra que muda tudo",
            texto: "Um sonho por vez. Focar numa única meta específica funciona melhor do que perseguir várias — escolher parece perda, mas é o que faz uma delas finalmente acontecer.",
          },
        },
      },
      {
        ordem: 4,
        tipo: "input",
        label: "Agora é com você",
        conteudo: {
          headline: "Escolhe <em>um</em> sonho. Só um.",
          subtitulo: "3 campos. É aqui que ele sai da cabeça.",
          aviso: "Isso fica só com você. Não salvamos nenhuma resposta.",
          campos: [
            { id: "sonho", emoji: "✨", label: "Meu sonho", placeholder: "o que você mais quer conquistar?", tipo: "texto" },
            { id: "custo", emoji: "🎯", label: "Custa", placeholder: "R$ quanto custa (chuta se não souber)", tipo: "decimal" },
            { id: "meses", emoji: "📅", label: "Em", placeholder: "quantos meses até conquistar?", tipo: "decimal" },
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
              condicao: "porMesNum <= 30",
              mensagem: "Cabe no bolso mais fácil do que parecia, né? Menos de R$ 30 por mês e o sonho é seu. O módulo 2 te mostra o menor passo pra começar hoje.",
              cor: "green",
            },
            {
              condicao: "porMesNum <= 100",
              mensagem: "É um valor real, mas possível com organização. A diferença de agora pra ontem: agora tem número, então tem plano.",
              cor: "yellow",
            },
            {
              condicao: "porMesNum > 100",
              mensagem: "É ambicioso pro prazo que você deu. Ou estica o prazo, ou começa menor — mas agora você sabe o tamanho exato do desafio. Isso já é metade do caminho.",
              cor: "red",
            },
          ],
          insightDinamico: "\"{sonho}\" deixou de ser uma ideia solta. Agora é uma meta com número e prazo — o tipo de coisa que o cérebro consegue perseguir de verdade.",
        },
      },
      {
        ordem: 6,
        tipo: "conceito",
        label: "Módulo completo",
        conteudo: {
          headline: "Sonho <em>ancorado</em>",
          corpo: "Você fez o que trava a maioria dos sonhadores: escolheu um só e deu a ele número e prazo. No próximo módulo você define <strong>o menor passo possível pra começar já</strong> — porque meta sem primeiro passo continua sendo só um plano bonito.",
          insight: {
            label: "+ 50 XP · Módulo 1 completo",
            texto: "Intenção sozinha não vira realização · Sonho vira meta com número e prazo · Um sonho por vez > vários ao mesmo tempo.",
          },
        },
      },
    ],
  },
]
