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
            { id: "saiu", emoji: "🛒", label: "Saiu", tipo: "faixa", opcoes: [
              { label: "até R$ 30", valor: "20" },
              { label: "R$ 30–70", valor: "50" },
              { label: "R$ 70–120", valor: "95" },
              { label: "mais de R$ 120", valor: "150" },
            ] },
            { id: "gasto", emoji: "🤔", label: "1 gasto", placeholder: "que você não lembrava até ver", tipo: "texto" },
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
            { id: "gastou", emoji: "🎉", label: "Curti", tipo: "faixa", opcoes: [
              { label: "quase nada (até R$ 10)", valor: "5" },
              { label: "R$ 10–40", valor: "25" },
              { label: "R$ 40–80", valor: "60" },
              { label: "mais de R$ 80", valor: "100" },
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

  // ============================================================
  // LANÇADOR — M2: Antes de gastar, respira (7 telas)
  // ============================================================
  {
    slug: "lancador-m2-respiro",
    titulo: "Antes de gastar, respira",
    subtitulo: "2 minutos. A regra que muda a ordem do jogo.",
    tipoPerfil: "lancador",
    ordem: 2,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "O que sobra no fim <em>nunca sobra.</em>",
        corpo: "Você já tentou 'gastar menos pra sobrar no fim do mês'. Não funcionou — e não é culpa sua. <strong>Guardar o que sobra é apostar contra o próprio cérebro.</strong> A solução é inverter a ordem.",
        insight: { label: "Por que isso importa", texto: "Quem guarda primeiro não precisa de disciplina o mês inteiro — precisa de uma decisão só, no dia que o dinheiro entra." },
      }},
      { ordem: 1, tipo: "cenario", label: "Conceito", conteudo: {
        headline: "A Bia inverteu a <em>ordem</em>",
        personagem: "Bia, 16 anos",
        linhas: [
          { label: "Entrou (mesada)", valor: 120, tipo: "entrada" },
          { label: "Separou ANTES (10%)", valor: -12, tipo: "saida" },
          { label: "Gastou o resto normalmente", valor: -103, tipo: "saida" },
          { label: "Guardado no fim da semana", valor: 12, tipo: "saldo" },
        ],
        rodape: "Semana passada sobrou −R$ 5. Essa semana sobraram R$ 12 — <strong>e ela nem sentiu falta.</strong> A diferença foi só a ordem.",
      }},
      { ordem: 2, tipo: "quiz", label: "Reflexão rápida", conteudo: {
        headline: "Por que separar antes funcionou pra Bia?",
        opcoes: [
          { letra: "A", texto: "Ela decidiu uma vez só, quando o dinheiro entrou", correta: true, feedback: "Exato. Uma decisão no dia 1 vence trinta pequenas decisões ao longo do mês. O cérebro se adapta ao que 'está disponível'." },
          { letra: "B", texto: "Ela se controlou mais durante a semana", correta: false, feedback: "Ela gastou normalmente — não se controlou nada. O truque é que os R$ 12 já não estavam na conta 'disponível'. A ordem fez o trabalho." },
          { letra: "C", texto: "10% é pouco, por isso deu certo", correta: false, feedback: "O valor ajuda a começar, mas o mecanismo é a ordem: o cérebro gasta o que vê como disponível — seja 100% ou 90%." },
        ],
      }},
      { ordem: 3, tipo: "conceito", label: "O nome disso", conteudo: {
        headline: "Pague <em>você</em> primeiro",
        corpo: "É a regra mais antiga das finanças pessoais: antes de pagar o lanche, o rolê e a assinatura, você separa uma parte <strong>pra você do futuro.</strong> Não é sacrifício — é prioridade.",
        insight: { label: "O tamanho certo", texto: "Comece pequeno: 10% é o clássico porque quase não dói. Melhor 10% que acontece do que 30% que você abandona na segunda semana." },
      }},
      { ordem: 4, tipo: "input", label: "Agora é com você", conteudo: {
        headline: "Define o <em>seu</em> respiro",
        subtitulo: "2 campos. Essa é a sua regra a partir de agora.",
        aviso: "Isso fica só com você. Não salvamos nenhum valor.",
        campos: [
          { id: "entrou", emoji: "💸", label: "Entra", placeholder: "R$ quanto entra por semana?", tipo: "decimal" },
          { id: "pctRespiro", emoji: "🫁", label: "Separo", placeholder: "% que você separa antes (ex: 10)", tipo: "decimal" },
        ],
      }},
      { ordem: 5, tipo: "resultado", label: "Seu resultado", conteudo: {
        headline: "Seu respiro: <em>{respiro} por semana</em>",
        formula: "respiro_valor",
        faixas: [
          { condicao: "valor < 5", mensagem: "Menos de 5% quase não cria reserva. Se dá pra subir sem doer, sobe um pouco — mas começar pequeno ainda é melhor que não começar.", cor: "yellow" },
          { condicao: "valor <= 20", mensagem: "Faixa ideal pra começar: cria reserva de verdade sem sufocar sua semana. Sustentável é o que vence.", cor: "green" },
          { condicao: "valor > 20", mensagem: "Ambicioso. Cuidado: respiro grande demais aperta a semana e aumenta a chance de você abandonar. Se sentir sufoco, desce — a constância vale mais.", cor: "yellow" },
        ],
        insightDinamico: "No dia que o dinheiro entrar, separa {respiro} ANTES de qualquer gasto. Pode ser transferir pra outra conta, outro app, ou até um envelope. Fora da vista, fora do 'disponível'.",
      }},
      { ordem: 6, tipo: "conceito", label: "Módulo completo", conteudo: {
        headline: "Regra do respiro <em>ativada</em>",
        corpo: "Você inverteu a ordem: agora guarda primeiro e gasta o resto — não o contrário. No próximo módulo, esse respiro ganha <strong>um destino concreto</strong>: uma meta curta pra ele deixar de ser 'dinheiro parado'.",
        insight: { label: "+ 50 XP · Módulo 2 completo", texto: "O que sobra no fim nunca sobra · Pague você primeiro · Uma decisão no dia 1 vence trinta no mês." },
      }},
    ],
  },

  // ============================================================
  // LANÇADOR — M3: Dá um destino pro que sobra (6 telas, input cedo)
  // ============================================================
  {
    slug: "lancador-m3-meta-ancora",
    titulo: "Dá um destino pro que sobra",
    subtitulo: "2 minutos. Reserva sem destino evapora.",
    tipoPerfil: "lancador",
    ordem: 3,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "Dinheiro guardado <em>sem nome</em> volta pro bolso",
        corpo: "O respiro do módulo 2 tem um inimigo: a falta de propósito. Reserva 'pra nada' é a primeira coisa que você saqueia quando bate a vontade. <strong>Reserva com nome e prazo, você defende.</strong>",
        insight: { label: "Por que isso importa", texto: "Uma meta curta e concreta transforma 'não gastar' (chato) em 'estar quase lá' (motivador). O cérebro persegue alvo, não abstração." },
      }},
      { ordem: 1, tipo: "input", label: "Agora é com você", conteudo: {
        headline: "Escolhe uma meta <em>curta</em>",
        subtitulo: "Algo alcançável em até 2 meses. Reancora seu respiro do módulo 2 aqui.",
        aviso: "Isso fica só com você. Não salvamos nenhum valor.",
        campos: [
          { id: "meta", emoji: "🎯", label: "Minha meta", placeholder: "o que você quer? (fone, tênis, jogo...)", tipo: "texto" },
          { id: "custo", emoji: "💰", label: "Custa", placeholder: "R$ quanto custa?", tipo: "decimal" },
          { id: "respiro", emoji: "🫁", label: "Respiro", placeholder: "R$ do seu respiro semanal (módulo 2)", tipo: "decimal" },
        ],
      }},
      { ordem: 2, tipo: "cenario", label: "Conceito", conteudo: {
        headline: "A conta da <em>Bia</em>",
        personagem: "Bia, 16 anos",
        linhas: [
          { label: "Meta: fone bluetooth", valor: 96, tipo: "entrada" },
          { label: "Respiro semanal", valor: 12, tipo: "entrada" },
          { label: "Semanas até a meta", valor: 8, tipo: "saldo", valorTexto: "8 semanas" },
        ],
        rodape: "Dois meses. Cada semana que ela separa os R$ 12, <strong>a barra enche.</strong> Não é 'deixar de gastar' — é comprar o fone em câmera lenta.",
      }},
      { ordem: 3, tipo: "quiz", label: "Reflexão rápida", conteudo: {
        headline: "Por que a meta precisa ser CURTA pro seu perfil?",
        opcoes: [
          { letra: "A", texto: "Porque a motivação de quem gasta rápido também acaba rápido", correta: true, feedback: "Exato. Meta de 1 ano exige uma paciência que ainda não é o seu forte — e tudo bem. Meta de 2 meses te dá a vitória antes do desânimo chegar." },
          { letra: "B", texto: "Porque metas grandes são impossíveis", correta: false, feedback: "São possíveis — depois. Primeiro você prova pra si mesmo que consegue com uma meta curta. A grande vem na sequência, com músculo treinado." },
          { letra: "C", texto: "Porque coisas baratas valem mais a pena", correta: false, feedback: "Não é sobre o preço da meta — é sobre o tempo até ela. Curta = vitória rápida = combustível pra próxima." },
        ],
      }},
      { ordem: 4, tipo: "resultado", label: "Seu resultado", conteudo: {
        headline: "<em>{semanas} semanas</em> até \"{meta}\"",
        formula: "semanas_meta",
        faixas: [
          { condicao: "semanasNum <= 8", mensagem: "Dentro da janela ideal: dá pra ver a linha de chegada daqui. Cada semana de respiro é um passo visível.", cor: "green" },
          { condicao: "semanasNum <= 16", mensagem: "Entre 2 e 4 meses. Dá, mas é longo pro seu perfil. Se der pra aumentar um pouco o respiro ou escolher uma meta menor, a chance de chegar sobe muito.", cor: "yellow" },
          { condicao: "semanasNum > 16", mensagem: "Mais de 4 meses é maratona — e você tá começando a correr agora. Escolhe uma meta menor pra primeira vitória. A grande continua existindo depois.", cor: "red" },
        ],
        insightDinamico: "\"{meta}\" agora tem preço, prazo e um caminho semanal. Quando bater vontade de sacar o respiro, lembra: cada saque adia a chegada em uma semana.",
      }},
      { ordem: 5, tipo: "conceito", label: "Módulo completo", conteudo: {
        headline: "Meta <em>ancorada</em>",
        corpo: "Seu respiro deixou de ser dinheiro parado — virou um fone, um tênis, um jogo chegando em câmera lenta. Último módulo da trilha: <strong>o freio de 24 horas</strong>, pra nenhum impulso atropelar o caminho.",
        insight: { label: "+ 50 XP · Módulo 3 completo", texto: "Reserva sem nome evapora · Meta curta = vitória antes do desânimo · Cada saque adia a chegada." },
      }},
    ],
  },

  // ============================================================
  // LANÇADOR — M4: O freio de 24 horas (6 telas, abre com quiz)
  // ============================================================
  {
    slug: "lancador-m4-freio",
    titulo: "O freio de 24 horas",
    subtitulo: "2 minutos. A última peça da sua trilha.",
    tipoPerfil: "lancador",
    ordem: 4,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "Um gasto não planejado pode <em>desfazer um mês</em>",
        corpo: "Você já tem fluxo visível, respiro e meta. Falta proteger tudo isso do inimigo clássico: <strong>a compra que aparece do nada</strong> — a promoção, o achado, o 'é só dessa vez'.",
        insight: { label: "Por que isso importa", texto: "Não dá pra prever qual compra vai aparecer. Dá pra decidir ANTES o que acontece quando ela aparecer. Regra pré-combinada vence decisão no calor do momento." },
      }},
      { ordem: 1, tipo: "quiz", label: "Situação real", conteudo: {
        headline: "Sexta à noite: aquele tênis que você queria, 40% off, 'só hoje'. O que o Lançador treinado faz?",
        opcoes: [
          { letra: "A", texto: "Anota, fecha o app e decide amanhã no mesmo horário", correta: true, feedback: "Isso. Se amanhã ainda fizer sentido — e couber sem tocar no respiro — compra. A maioria das 'promoções de hoje' existe de novo semana que vem." },
          { letra: "B", texto: "Compra — 40% off é economia, não gasto", correta: false, feedback: "Desconto em algo que você não ia comprar não é economia — é gasto com marketing de urgência em cima. O 'só hoje' é desenhado exatamente pra impedir seu amanhã." },
          { letra: "C", texto: "Não compra nunca — promoção é sempre armadilha", correta: false, feedback: "Radical demais quebra no primeiro deslize. O freio não proíbe — ele só move a decisão pra um momento em que você pensa melhor." },
        ],
      }},
      { ordem: 2, tipo: "conceito", label: "O nome disso", conteudo: {
        headline: "Fricção <em>deliberada</em>",
        corpo: "Apps de compra removem cada obstáculo entre você e o 'comprar agora' — um clique, cartão salvo, entrega amanhã. O freio de 24h <strong>devolve o obstáculo que eles tiraram.</strong>",
        insight: { label: "Como calibrar", texto: "O freio não é pra tudo — lanche não precisa de reunião. Ele vale a partir de um valor-limite que VOCÊ define. Abaixo dele, vida normal. Acima, 24 horas." },
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
          { condicao: "acimaLimite == 1", mensagem: "Esse gasto teria caído no freio — teria esperado 24 horas. Pergunta honesta: se você tivesse dormido antes de decidir, compraria mesmo assim? Se sim, ótimo: o freio não proíbe, só confirma. Se não... é exatamente pra isso que ele existe.", cor: "yellow" },
          { condicao: "acimaLimite == 0", mensagem: "Esse gasto passaria livre — abaixo do seu limite, vida normal. O freio é pros gastos que doem, não pra te transformar em contador de moedas. Confere só se o limite não ficou alto demais: se quase nada cai nele, ele não freia nada.", cor: "green" },
        ],
        insightDinamico: "Sua regra a partir de hoje: acima de R$ {valorLimite}, anota e decide amanhã. Uma regra só, decidida com a cabeça fria de hoje, protegendo todas as sextas à noite do futuro.",
      }},
      { ordem: 5, tipo: "conceito", label: "Trilha completa", conteudo: {
        headline: "Trilha do Lançador <em>completa</em> 🏁",
        corpo: "Olha o sistema que você montou: <strong>enxerga o fluxo</strong> (M1), <strong>separa antes de gastar</strong> (M2), <strong>tem uma meta puxando</strong> (M3) e <strong>um freio protegendo</strong> (M4). Isso não é teoria — são quatro regras suas, com seus números.",
        insight: { label: "+ 50 XP · Trilha completa", texto: "O jogo agora é manutenção: o respiro toda semana, o freio nos gastos grandes, e a meta enchendo. Quando ela completar — escolhe a próxima e roda de novo." },
      }},
    ],
  },

  // ============================================================
  // GUARDADOR — M2: Seu valor livre (7 telas)
  // ============================================================
  {
    slug: "guardador-m2-valor-livre",
    titulo: "Seu valor livre",
    subtitulo: "2 minutos. Gastar sem culpa começa com uma regra.",
    tipoPerfil: "guardador",
    ordem: 2,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "E se gastar já viesse <em>pré-autorizado?</em>",
        corpo: "A culpa do módulo 1 tem uma causa: cada gasto seu passa por um julgamento interno — 'posso? devo? e se faltar?'. <strong>Trinta julgamentos por mês cansam qualquer um.</strong> A saída é julgar uma vez só.",
        insight: { label: "Por que isso importa", texto: "Quando existe um valor mensal já autorizado pra você curtir, gastar dentro dele não precisa de julgamento — a decisão já foi tomada. A culpa perde o emprego." },
      }},
      { ordem: 1, tipo: "cenario", label: "Conceito", conteudo: {
        headline: "O Théo criou uma <em>categoria nova</em>",
        personagem: "Théo, 17 anos",
        linhas: [
          { label: "Entrou (freela)", valor: 200, tipo: "entrada" },
          { label: "Guardado com propósito", valor: -150, tipo: "saida" },
          { label: "Valor livre (pré-autorizado)", valor: -40, tipo: "saida" },
          { label: "Folga", valor: 10, tipo: "saldo" },
        ],
        rodape: "Os R$ 40 são dele pra curtir — rolê, jogo, o que for. <strong>Sem julgamento, porque o julgamento já aconteceu</strong> no dia que ele definiu a regra.",
      }},
      { ordem: 2, tipo: "quiz", label: "Reflexão rápida", conteudo: {
        headline: "O Théo gastou os R$ 40 no rolê. Ele foi menos responsável que antes?",
        opcoes: [
          { letra: "A", texto: "Não — gastar dentro de um plano É responsabilidade", correta: true, feedback: "Exato. Responsabilidade não é gastar zero — é decidir com intenção. Os R$ 40 estavam no plano tanto quanto os R$ 150 guardados." },
          { letra: "B", texto: "Sim — ele podia ter guardado os R$ 40 também", correta: false, feedback: "Essa é a voz do módulo 1 falando. Guardar 100% não trouxe paz pro Théo antes — trouxe culpa e isolamento. O plano com espaço pra viver é MAIS sustentável, não menos." },
          { letra: "C", texto: "Depende do que ele comprou no rolê", correta: false, feedback: "Não depende. Esse é o ponto do valor livre: dentro dele, a escolha é 100% dele, sem prestação de contas. Julgar item por item é voltar pros trinta julgamentos." },
        ],
      }},
      { ordem: 3, tipo: "conceito", label: "O nome disso", conteudo: {
        headline: "Orçamento não é corrente — é <em>alvará</em>",
        corpo: "Todo mundo acha que orçamento serve pra impedir gasto. Pro seu perfil é o contrário: <strong>o orçamento é o documento que AUTORIZA o gasto.</strong> Com limite claro, a liberdade dentro dele é total.",
        insight: { label: "O tamanho certo", texto: "Entre 10% e 30% do que entra é uma faixa comum pra começar. Menos que isso, a regra quase não muda sua vida. O número exato é seu — o que importa é ele existir." },
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
          { condicao: "valor < 10", mensagem: "Menos de 10% é quase simbólico — a regra existe mas mal muda sua semana. Se a ideia de subir dá aperto no peito, repara nisso: é exatamente a dissonância do módulo 1 defendendo o território.", cor: "yellow" },
          { condicao: "valor <= 30", mensagem: "Faixa de equilíbrio: espaço real pra viver sem comprometer o que você guarda. Agora a regra é usar — valor livre que sobra todo mês vira poupança disfarçada, e aí nada mudou.", cor: "green" },
          { condicao: "valor > 30", mensagem: "Passo grande pro seu perfil — e pode ser ótimo. Só confere no fim do mês se foi confortável ou se a culpa apareceu. A regra certa é a que você consegue manter em paz.", cor: "yellow" },
        ],
        insightDinamico: "{livre} por mês, seus, sem julgamento. Gastou dentro disso? Assunto encerrado — o plano já tinha aprovado.",
      }},
      { ordem: 6, tipo: "conceito", label: "Módulo completo", conteudo: {
        headline: "Valor livre <em>definido</em>",
        corpo: "Você trocou trinta julgamentos por um. No próximo módulo, a outra ponta: <strong>o dinheiro que você guarda tão bem vai começar a trabalhar</strong> — porque parado, ele encolhe.",
        insight: { label: "+ 50 XP · Módulo 2 completo", texto: "Orçamento é alvará, não corrente · Gastar dentro do plano é responsabilidade · Um julgamento por mês, não trinta." },
      }},
    ],
  },

  // ============================================================
  // GUARDADOR — M3: Dinheiro parado encolhe (6 telas, input cedo)
  // ============================================================
  {
    slug: "guardador-m3-investir",
    titulo: "Dinheiro parado encolhe",
    subtitulo: "2 minutos. Seu maior talento, finalmente recompensado.",
    tipoPerfil: "guardador",
    ordem: 3,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "Guardar você domina. Mas onde o dinheiro <em>dorme?</em>",
        corpo: "Plot twist do seu perfil: o dinheiro que você protege com tanto cuidado está <strong>perdendo valor em silêncio.</strong> Todo ano, tudo fica um pouco mais caro — e R$ 100 parados continuam R$ 100, comprando menos.",
        insight: { label: "Por que isso importa", texto: "Isso se chama inflação. Ela não rouba de quem gasta — rouba de quem guarda parado. Ou seja: rouba exatamente de você. A defesa é fazer o guardado render." },
      }},
      { ordem: 1, tipo: "input", label: "Agora é com você", conteudo: {
        headline: "Quanto do seu dinheiro está <em>dormindo?</em>",
        subtitulo: "2 campos. Vamos ver o que ele faria acordado.",
        aviso: "Isso fica só com você. Não salvamos nenhum valor.",
        campos: [
          { id: "guardado", emoji: "💤", label: "Parado", placeholder: "R$ quanto você tem guardado parado?", tipo: "decimal" },
          { id: "meses", emoji: "📅", label: "Há/por", placeholder: "por quantos meses pretende deixar?", tipo: "decimal" },
        ],
      }},
      { ordem: 2, tipo: "cenario", label: "Conceito", conteudo: {
        headline: "Os R$ 190 do Théo, <em>um ano depois</em>",
        personagem: "Théo, 17 anos",
        linhas: [
          { label: "Parados na conta", valor: 190, tipo: "entrada" },
          { label: "Rendendo (renda fixa simples)", valor: 208, tipo: "entrada", valorTexto: "≈ R$ 208" },
          { label: "Diferença em 12 meses", valor: 18, tipo: "saldo", valorTexto: "≈ R$ 18" },
        ],
        rodape: "R$ 18 parece pouco? É o Théo sendo pago <strong>por fazer o que ele já fazia de graça.</strong> E quem aprende o mecanismo com R$ 190, usa ele a vida inteira — com valores cada vez maiores.",
      }},
      { ordem: 3, tipo: "quiz", label: "Reflexão rápida", conteudo: {
        headline: "Por que o Théo hesitou em tirar o dinheiro da conta?",
        opcoes: [
          { letra: "A", texto: "Medo de perder o dinheiro — parado parece mais seguro", correta: true, feedback: "O medo clássico do perfil. Mas renda fixa conservadora (tipo Tesouro Selic) tem risco baixíssimo — e 'parado' também tem risco: o de encolher todo ano, garantido. Seguro de verdade é render acima da inflação." },
          { letra: "B", texto: "Investir é só pra quem tem muito dinheiro", correta: false, feedback: "Dá pra começar com menos de R$ 50 em renda fixa. O valor pequeno é até vantagem: você aprende o mecanismo errando barato." },
          { letra: "C", texto: "Menor de idade não pode investir", correta: false, feedback: "Pode — com conta em nome do menor autorizada pelo responsável. Dá um pouco mais de trabalho pra abrir, mas é totalmente possível e legal." },
        ],
      }},
      { ordem: 4, tipo: "resultado", label: "Seu resultado", conteudo: {
        headline: "Dormindo, seu dinheiro deixa de gerar <em>≈ {rende}</em>",
        formula: "render_simples",
        faixas: [
          { condicao: "rendeNum < 10", mensagem: "O valor parece pequeno — mas você não está aprendendo isso pelo dinheiro de agora. Está aprendendo o mecanismo que vai multiplicar valores bem maiores depois. Quem começa aos 17 chega aos 25 com anos de vantagem.", cor: "green" },
          { condicao: "rendeNum >= 10", mensagem: "Isso é dinheiro real deixado na mesa — pago pra quem simplesmente move o guardado de lugar. Seu talento de guardar + rendimento = a combinação mais forte que existe nas finanças pessoais.", cor: "green" },
        ],
        insightDinamico: "Estimativa ilustrativa (~0,8% ao mês, renda fixa conservadora — não é recomendação de produto). O próximo passo real: pesquisar 'Tesouro Selic' e conversar com seu responsável sobre abrir uma conta de investimento.",
      }},
      { ordem: 5, tipo: "conceito", label: "Módulo completo", conteudo: {
        headline: "Dinheiro <em>acordado</em>",
        corpo: "Você descobriu que parado não é seguro — é encolhendo devagar. Último módulo da trilha: <strong>prazer com data marcada</strong> — planejar um gasto bom com a mesma seriedade com que você guarda.",
        insight: { label: "+ 50 XP · Módulo 3 completo", texto: "Inflação rouba de quem guarda parado · Renda fixa conservadora = risco baixíssimo · Começar pequeno é aprender barato." },
      }},
    ],
  },

  // ============================================================
  // GUARDADOR — M4: Prazer com data marcada (6 telas, abre com quiz)
  // ============================================================
  {
    slug: "guardador-m4-prazer",
    titulo: "Prazer com data marcada",
    subtitulo: "2 minutos. O módulo que seu perfil mais precisa.",
    tipoPerfil: "guardador",
    ordem: 4,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "Você planeja tudo — menos <em>o que te faz bem</em>",
        corpo: "Repara na assimetria: o que você guarda tem número, destino e disciplina. O que te dá prazer fica no 'um dia', no 'quem sabe'. <strong>Esse módulo fecha a trilha invertendo isso uma vez.</strong>",
        insight: { label: "Por que isso importa", texto: "Gasto planejado com antecedência tem um bônus escondido: a espera. Quem marca a experiência pra daqui a um mês curte duas vezes — o mês inteiro de expectativa e o dia em si." },
      }},
      { ordem: 1, tipo: "quiz", label: "Situação real", conteudo: {
        headline: "O Théo quer ir num show em 2 meses (R$ 80). O que o Guardador treinado faz?",
        opcoes: [
          { letra: "A", texto: "Reserva R$ 40/mês do valor livre e compra o ingresso já", correta: true, feedback: "Isso. Cabe no valor livre, tem data, tem plano. Comprar já ainda garante o preço e transforma 2 meses de espera em 2 meses de expectativa boa." },
          { letra: "B", texto: "Espera até a véspera pra decidir se 'realmente vale a pena'", correta: false, feedback: "Conhece o final dessa história: na véspera o ingresso subiu ou esgotou, e a dúvida vence de novo. 'Decidir depois' no seu perfil quase sempre significa 'não'." },
          { letra: "C", texto: "Não vai — R$ 80 rendendo viram R$ 88 no fim do ano", correta: false, feedback: "A conta tá certa e é essa a armadilha: pela matemática, TODO gasto perde pro rendimento, sempre. Se esse for o critério, você não vive nunca. Show do artista que você ama aos 17 não tem preço de reposição." },
        ],
      }},
      { ordem: 2, tipo: "conceito", label: "O nome disso", conteudo: {
        headline: "Gasto alinhado a <em>valores</em>",
        corpo: "A pesquisa sobre culpa financeira aponta uma saída consistente: a culpa some quando o gasto está <strong>conectado ao que importa de verdade pra você</strong> — e foi decidido com intenção, não no automático.",
        insight: { label: "O critério", texto: "Antes de planejar, uma pergunta: o que te fez genuinamente feliz nos últimos meses? A resposta é o seu mapa de valores. Gasto alinhado a ele nunca é desperdício." },
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
          { condicao: "mesesJuntar <= 1", mensagem: "Cabe já no seu valor livre desse mês. Não tem mais desculpa matemática — marca a data. De verdade: abre a agenda agora e marca.", cor: "green" },
          { condicao: "mesesJuntar <= 3", mensagem: "Reservando o valor livre por alguns meses, chega. Isso é um plano — e plano é o seu idioma. A diferença é que dessa vez o destino é você.", cor: "green" },
          { condicao: "mesesJuntar > 3", mensagem: "Mais de 3 meses de valor livre inteiro é pesado. Duas saídas dignas: uma versão menor da mesma experiência agora, ou essa completa com prazo maior e parte vindo do guardado — você tem, lembra?", cor: "yellow" },
        ],
        insightDinamico: "Gasto planejado, alinhado ao que importa, dentro da sua regra. Se a culpa aparecer mesmo assim, ela não está te protegendo de nada — é só o hábito antigo fazendo barulho.",
      }},
      { ordem: 5, tipo: "conceito", label: "Trilha completa", conteudo: {
        headline: "Trilha do Guardador <em>completa</em> 🏁",
        corpo: "Olha o caminho: você entendeu a culpa (M1), criou seu valor livre (M2), acordou o dinheiro parado (M3) e <strong>marcou data com o próprio prazer</strong> (M4). Guardar continua sendo seu superpoder — agora com direção.",
        insight: { label: "+ 50 XP · Trilha completa", texto: "Manutenção: valor livre todo mês (e USA ele), guardado rendendo, e pelo menos uma experiência com data marcada por vez. Segurança e vida — as duas ao mesmo tempo." },
      }},
    ],
  },

  // ============================================================
  // IMPULSIVO — M2: A pausa que desarma (7 telas)
  // ============================================================
  {
    slug: "impulsivo-m2-pausa",
    titulo: "A pausa que desarma",
    subtitulo: "2 minutos. A técnica mais simples que existe — e a que mais funciona.",
    tipoPerfil: "impulsivo",
    ordem: 2,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "Você não precisa de mais <em>força de vontade</em>",
        corpo: "No módulo 1 você mapeou seu gatilho. Agora a ferramenta: e ela NÃO é 'se controlar mais'. Força de vontade falha exatamente nos momentos em que você mais precisa dela. <strong>O que funciona é tempo.</strong>",
        insight: { label: "Por que isso importa", texto: "O impulso é uma onda: sobe rápido, mas também desce rápido. Ele não sobrevive à espera. Quem aprende a esperar a onda passar não precisa lutar contra ela." },
      }},
      { ordem: 1, tipo: "cenario", label: "Conceito", conteudo: {
        headline: "A Lari testou a <em>pausa</em>",
        personagem: "Lari, 15 anos",
        linhas: [
          { label: "Quinta: estresse + carrinho de R$ 62", valor: -62, tipo: "saida", valorTexto: "no carrinho" },
          { label: "Regra nova: acima de R$ 30, dorme", valor: 0, tipo: "entrada", valorTexto: "pausa de 24h" },
          { label: "Sexta: vontade que sobrou", valor: 0, tipo: "saldo", valorTexto: "quase zero" },
        ],
        rodape: "Na sexta ela nem lembrava direito por que queria aquilo. <strong>Não foi disciplina — foi a onda descendo sozinha.</strong> R$ 62 continuam com ela.",
      }},
      { ordem: 2, tipo: "quiz", label: "Reflexão rápida", conteudo: {
        headline: "Por que a vontade da Lari quase sumiu em um dia?",
        opcoes: [
          { letra: "A", texto: "A emoção que criou a vontade passou — e levou a vontade junto", correta: true, feedback: "Exato. A compra era filha do estresse de quinta. Sem o estresse, ela órfã. A pausa não mata o desejo real — só o desejo emprestado da emoção." },
          { letra: "B", texto: "Ela percebeu que o produto era ruim", correta: false, feedback: "O produto era o mesmo nos dois dias. O que mudou foi ela — de 'estressada buscando alívio' pra 'tranquila avaliando de verdade'." },
          { letra: "C", texto: "Sorte — normalmente esperar não muda nada", correta: false, feedback: "É o padrão mais documentado do consumo por impulso: a intensidade da vontade despenca com o tempo. Se depois de 24h você AINDA quer, aí sim é desejo de verdade — e pode virar compra planejada." },
        ],
      }},
      { ordem: 3, tipo: "conceito", label: "O nome disso", conteudo: {
        headline: "Período de <em>esfriamento</em>",
        corpo: "É a mesma lógica das leis que dão 7 dias pra devolver compra online: decisões tomadas no calor precisam de uma chance de revisão a frio. <strong>Você vai instalar essa lei em você mesmo</strong> — com um limite que dispara automático.",
        insight: { label: "A calibragem que importa", texto: "O limite tem que ficar ABAIXO do seu impulso típico. Se seus impulsos são de R$ 40 e seu limite é R$ 100, a pausa nunca dispara — vira regra decorativa." },
      }},
      { ordem: 4, tipo: "input", label: "Agora é com você", conteudo: {
        headline: "Calibra a <em>sua</em> pausa",
        subtitulo: "2 campos. O limite certo é o que pega o SEU impulso.",
        aviso: "Isso fica só com você. Não salvamos nenhum valor.",
        campos: [
          { id: "gastoTipico", emoji: "🛍️", label: "Meu impulso", tipo: "faixa", opcoes: [
            { label: "até R$ 20", valor: "15" },
            { label: "R$ 20–50", valor: "35" },
            { label: "R$ 50–100", valor: "75" },
            { label: "mais de R$ 100", valor: "130" },
          ] },
          { id: "limiar", emoji: "⏸️", label: "Minha pausa", placeholder: "R$ a partir de quanto você espera 24h?", tipo: "decimal" },
        ],
      }},
      { ordem: 5, tipo: "resultado", label: "Seu resultado", conteudo: {
        headline: "Teste de calibragem da <em>sua pausa</em>",
        formula: "pausa_limiar",
        faixas: [
          { condicao: "cobre == 1", mensagem: "Calibrada: seu impulso típico cai dentro da pausa. Da próxima vez que a emoção do módulo 1 aparecer com um carrinho na mão, a regra dispara sozinha — anota, fecha o app, decide amanhã.", cor: "green" },
          { condicao: "cobre == 0", mensagem: "Descalibrada: seu limite está ACIMA do seu impulso típico — a pausa nunca vai disparar. Desce o limite pra baixo do valor que você costuma gastar. Regra que não dispara é decoração.", cor: "red" },
        ],
        insightDinamico: "Sua lei pessoal: acima de R$ {limiar} → anota o item, fecha o app, decide amanhã no mesmo horário. Se amanhã ainda quiser, é desejo real — e desejo real merece compra planejada, não culpa.",
      }},
      { ordem: 6, tipo: "conceito", label: "Módulo completo", conteudo: {
        headline: "Pausa <em>instalada</em>",
        corpo: "Você não vai mais lutar contra a onda — vai esperar ela passar. Mas a pausa deixa um vazio: a emoção continua lá, pedindo alívio. No próximo módulo, <strong>o que fazer nesse vazio</strong> — o alívio que não custa nada.",
        insight: { label: "+ 50 XP · Módulo 2 completo", texto: "Impulso é onda: sobe e desce sozinho · Limite abaixo do impulso típico, senão é decoração · 24h separam desejo emprestado de desejo real." },
      }},
    ],
  },

  // ============================================================
  // IMPULSIVO — M3: Troca o alívio (6 telas, input cedo)
  // ============================================================
  {
    slug: "impulsivo-m3-substituto",
    titulo: "Troca o alívio",
    subtitulo: "2 minutos. A emoção vai continuar vindo — muda o que você faz com ela.",
    tipoPerfil: "impulsivo",
    ordem: 3,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "A pausa segura a compra. Mas e a <em>emoção?</em>",
        corpo: "Módulo 1: você mapeou o gatilho. Módulo 2: instalou a pausa. Só que tem um buraco no plano — <strong>a emoção continua lá, pedindo alívio.</strong> Se você só bloquear a compra sem dar outra saída, a pressão acumula e uma hora estoura.",
        insight: { label: "Por que isso importa", texto: "O impulso de compra é uma resposta aprendida: emoção ruim → comprar → alívio. Não dá pra apagar uma resposta aprendida — mas dá pra gravar outra por cima. Mesma emoção, nova saída." },
      }},
      { ordem: 1, tipo: "input", label: "Agora é com você", conteudo: {
        headline: "Monta o <em>seu</em> plano de troca",
        subtitulo: "3 campos. Reancora seu gatilho do módulo 1.",
        aviso: "Isso fica só com você. Não salvamos nenhuma resposta.",
        campos: [
          { id: "emocao", emoji: "🎭", label: "Gatilho", placeholder: "sua emoção-gatilho (do módulo 1)", tipo: "texto" },
          { id: "substituto", emoji: "🔄", label: "Troco por", placeholder: "algo que te alivia e não custa (andar, música, treino...)", tipo: "texto" },
          { id: "obstaculo", emoji: "🪨", label: "Meu risco", placeholder: "o que pode te fazer furar o plano?", tipo: "texto" },
        ],
      }},
      { ordem: 2, tipo: "cenario", label: "Conceito", conteudo: {
        headline: "O plano da <em>Lari</em>",
        personagem: "Lari, 15 anos",
        linhas: [
          { label: "Gatilho: estresse de prova", valor: 0, tipo: "entrada", valorTexto: "mapeado" },
          { label: "Resposta antiga: compra online", valor: -55, tipo: "saida", valorTexto: "R$ 55 em média" },
          { label: "Resposta nova: playlist + volta no quarteirão", valor: 0, tipo: "saldo", valorTexto: "R$ 0" },
        ],
        rodape: "Mesma emoção, mesma necessidade de alívio. A diferença: <strong>a resposta nova alivia de verdade e não cobra nada depois</strong> — nem dinheiro, nem culpa.",
      }},
      { ordem: 3, tipo: "quiz", label: "Reflexão rápida", conteudo: {
        headline: "Qual substituto teria MAIS chance de funcionar pra Lari?",
        opcoes: [
          { letra: "A", texto: "Um que ela consegue fazer em 2 minutos, de onde estiver", correta: true, feedback: "Exato. O impulso aparece em segundos — o substituto tem que estar à mão na mesma velocidade. Simples e imediato vence perfeito e distante." },
          { letra: "B", texto: "Ficar rolando o feed pra distrair", correta: false, feedback: "Armadilha clássica: o feed é exatamente onde moram os anúncios e as lojas. É apagar incêndio com álcool. O substituto precisa te tirar do ambiente de compra, não te devolver pra ele." },
          { letra: "C", texto: "Prometer a si mesma ser mais forte na próxima", correta: false, feedback: "Promessa não é plano. 'Ser mais forte' falha exatamente no momento de fraqueza — por definição. Plano é: quando X acontecer, eu faço Y. Concreto, decidido antes." },
        ],
      }},
      { ordem: 4, tipo: "resultado", label: "Seu resultado", conteudo: {
        headline: "Seu plano: quando bater <em>{emocao}</em> → <em>{substituto}</em>",
        insightDinamico: "Esse formato 'quando X, faço Y' é o que a pesquisa chama de plano se-então — decidido a frio, executado no automático. Seu risco mapeado: \"{obstaculo}\". Já sabendo dele, você não é pego de surpresa. As primeiras vezes vão dar trabalho; da quinta em diante, o cérebro começa a puxar a resposta nova sozinho.",
      }},
      { ordem: 5, tipo: "conceito", label: "Módulo completo", conteudo: {
        headline: "Alívio <em>trocado</em>",
        corpo: "Gatilho mapeado, pausa instalada, resposta nova gravada. Último módulo da trilha: <strong>a lista que decide por você</strong> — o destino oficial de todo desejo que sobreviver à pausa.",
        insight: { label: "+ 50 XP · Módulo 3 completo", texto: "Bloquear sem substituir acumula pressão · Substituto bom = imediato e fora do ambiente de compra · Quando X, faço Y — decidido antes." },
      }},
    ],
  },

  // ============================================================
  // IMPULSIVO — M4: A lista que decide por você (6 telas, abre com quiz)
  // ============================================================
  {
    slug: "impulsivo-m4-lista",
    titulo: "A lista que decide por você",
    subtitulo: "2 minutos. O destino de todo desejo que sobreviver à pausa.",
    tipoPerfil: "impulsivo",
    ordem: 4,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "E o desejo que <em>sobrevive</em> às 24 horas?",
        corpo: "Nem todo impulso é falso alarme. Às vezes você espera um dia, espera dois — <strong>e ainda quer.</strong> Isso é desejo real, e desejo real merece respeito: um lugar oficial pra esperar a vez dele.",
        insight: { label: "Por que isso importa", texto: "Sem a lista, todo desejo vira urgência disfarçada. Com a lista, os desejos competem entre si — e o tempo revela quais eram de verdade. Você compra os vencedores, sem culpa." },
      }},
      { ordem: 1, tipo: "quiz", label: "Situação real", conteudo: {
        headline: "Um item está há 10 dias na lista da Lari e ela ainda pensa nele. O que isso significa?",
        opcoes: [
          { letra: "A", texto: "É desejo real — pode virar compra planejada, sem culpa", correta: true, feedback: "Exato. Sobreviver 10 dias sem a emoção do momento sustentando é o teste mais honesto que existe. Comprar agora não é impulso — é decisão." },
          { letra: "B", texto: "Ela deveria esperar mais, só por garantia", correta: false, feedback: "Esticar a espera pra sempre transforma a lista em prisão — e aí o sistema inteiro perde a graça e é abandonado. A lista tem que ter saída, senão vira só um jeito novo de se punir." },
          { letra: "C", texto: "A lista falhou — o certo era o desejo sumir", correta: false, feedback: "A lista não existe pra matar desejos — existe pra separar os falsos dos verdadeiros. Um item que sobrevive é a lista FUNCIONANDO, não falhando." },
        ],
      }},
      { ordem: 2, tipo: "conceito", label: "Como funciona", conteudo: {
        headline: "As 3 regras da <em>lista de espera</em>",
        corpo: "<strong>1.</strong> Todo desejo acima da sua pausa entra na lista — sem exceção, sem julgamento.<br><strong>2.</strong> Item que completar 7 dias e você ainda quiser: pode ser comprado, planejado, sem culpa.<br><strong>3.</strong> Item que você esqueceu que estava lá: sai da lista. Ele já disse tudo.",
        insight: { label: "O efeito colateral bom", texto: "Depois de algumas semanas, a lista vira um espelho: você começa a ver os padrões do que deseja — e do que só desejava por 15 minutos." },
      }},
      { ordem: 3, tipo: "input", label: "Agora é com você", conteudo: {
        headline: "Inaugura a <em>sua</em> lista",
        subtitulo: "3 campos. Os dois primeiros moradores e onde ela vai viver.",
        aviso: "Isso fica só com você. Não salvamos nenhuma resposta.",
        campos: [
          { id: "desejo1", emoji: "1️⃣", label: "Desejo 1", placeholder: "o que você quer agora?", tipo: "texto" },
          { id: "valor", emoji: "💰", label: "Custa", placeholder: "R$ quanto custa o desejo 1?", tipo: "decimal" },
          { id: "onde", emoji: "📍", label: "Onde", placeholder: "onde a lista vai viver? (notas, papel...)", tipo: "texto" },
        ],
      }},
      { ordem: 4, tipo: "resultado", label: "Seu resultado", conteudo: {
        headline: "\"{desejo1}\" entrou na lista. <em>Relógio rodando.</em>",
        formula: "impulsivo_gatilho",
        faixas: [
          { condicao: "valor > 100", mensagem: "Valor alto: esse merece o teste completo — 14 dias em vez de 7. Se sobreviver duas semanas, não só pode como MERECE ser comprado com planejamento.", cor: "yellow" },
          { condicao: "valor <= 100", mensagem: "Teste padrão: 7 dias. Anota a data de entrada. Daqui uma semana, ou ele virou compra planejada ou virou história engraçada.", cor: "green" },
        ],
        insightDinamico: "Sua lista vive em: \"{onde}\". A partir de hoje o fluxo é um só: impulso → pausa → lista → 7 dias → decisão. Nenhuma etapa é proibição — todas são filtro.",
      }},
      { ordem: 5, tipo: "conceito", label: "Trilha completa", conteudo: {
        headline: "Trilha do Impulsivo <em>completa</em> 🏁",
        corpo: "Olha o sistema: você <strong>conhece seu gatilho</strong> (M1), <strong>tem uma pausa que dispara sozinha</strong> (M2), <strong>um alívio que não custa</strong> (M3) e <strong>uma lista que separa desejo real de falso alarme</strong> (M4). O impulso não sumiu — ele só não manda mais.",
        insight: { label: "+ 50 XP · Trilha completa", texto: "Manutenção: a pausa em todo gasto acima do limite, o substituto quando o gatilho bater, e a lista rodando. O que sobreviver, compra sem culpa — isso também é vitória." },
      }},
    ],
  },

  // ============================================================
  // SONHADOR — M2: O menor passo possível (7 telas)
  // ============================================================
  {
    slug: "sonhador-m2-passo-minimo",
    titulo: "O menor passo possível",
    subtitulo: "2 minutos. A meta existe — agora ela começa.",
    tipoPerfil: "sonhador",
    ordem: 2,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "Meta definida não é meta <em>começada</em>",
        corpo: "No módulo 1 seu sonho ganhou número e prazo. Perigo agora: a sensação de progresso SEM progresso. <strong>Definir a meta dá uma satisfação que engana</strong> — parece que você já fez algo. Ainda não fez.",
        insight: { label: "Por que isso importa", texto: "A diferença entre quem realiza e quem planeja não é o tamanho do primeiro passo — é a existência dele. Começado pequeno vence perfeito adiado, sempre." },
      }},
      { ordem: 1, tipo: "cenario", label: "Conceito", conteudo: {
        headline: "O Kaio quase caiu na <em>armadilha</em>",
        personagem: "Kaio, 16 anos",
        linhas: [
          { label: "Meta: R$ 40/mês pro curso", valor: 40, tipo: "entrada", valorTexto: "R$ 40/mês" },
          { label: "Plano A: 'começo mês que vem, organizado'", valor: 0, tipo: "saida", valorTexto: "= nunca" },
          { label: "Plano B: guardou R$ 5 no mesmo dia", valor: 5, tipo: "saldo" },
        ],
        rodape: "R$ 5 não pagam curso nenhum. Mas quebram algo maior: <strong>o zero.</strong> Quem saiu do zero tem um progresso pra defender — quem 'vai começar' tem só uma promessa pra adiar.",
      }},
      { ordem: 2, tipo: "quiz", label: "Reflexão rápida", conteudo: {
        headline: "Por que os R$ 5 de hoje valem mais que os R$ 40 'de mês que vem'?",
        opcoes: [
          { letra: "A", texto: "Porque existem — e o resto ainda é promessa", correta: true, feedback: "Exato. R$ 5 reais mudam sua identidade de 'quem vai guardar' pra 'quem guarda'. E identidade puxa comportamento: quem já começou continua." },
          { letra: "B", texto: "Não valem — sem os R$ 40 completos, não conta", correta: false, feedback: "Essa é a voz do perfeccionismo — a mesma que mantém todos os planos na cabeça. 'Ou completo ou nada' termina em nada. Sempre." },
          { letra: "C", texto: "Valem porque R$ 5 rendem juros", correta: false, feedback: "Renderiam centavos. O valor dos R$ 5 não é financeiro — é comportamental: eles provam que o plano saiu da cabeça. Essa prova não tem preço." },
        ],
      }},
      { ordem: 3, tipo: "conceito", label: "O nome disso", conteudo: {
        headline: "Plano <em>se-então</em>",
        corpo: "A pesquisa mostra que intenção vaga ('vou guardar todo mês') falha, e intenção ancorada num evento ('QUANDO a mesada cair, ENTÃO transfiro R$ 10') executa quase sozinha. <strong>O evento vira o lembrete — você não depende de lembrar.</strong>",
        insight: { label: "A fórmula", texto: "Quando [evento que sempre acontece] → eu guardo [valor pequeno demais pra falhar] pra [meu sonho]. Os três espaços preenchidos = plano. Qualquer espaço vago = desejo." },
      }},
      { ordem: 4, tipo: "input", label: "Agora é com você", conteudo: {
        headline: "Preenche o <em>seu</em> se-então",
        subtitulo: "3 campos. Reancora seu sonho do módulo 1.",
        aviso: "Isso fica só com você. Não salvamos nenhuma resposta.",
        campos: [
          { id: "sonho", emoji: "✨", label: "Pra", placeholder: "seu sonho (do módulo 1)", tipo: "texto" },
          { id: "quando", emoji: "⚡", label: "Quando", placeholder: "evento-gatilho (cair a mesada, todo domingo...)", tipo: "texto" },
          { id: "quanto", emoji: "🪙", label: "Guardo", placeholder: "R$ pequeno demais pra falhar", tipo: "decimal" },
        ],
      }},
      { ordem: 5, tipo: "resultado", label: "Seu resultado", conteudo: {
        headline: "Quando <em>{quando}</em> → guardo <em>R$ {quanto}</em> pra \"{sonho}\"",
        formula: "passo_minimo",
        faixas: [
          { condicao: "valor <= 20", mensagem: "Pequeno demais pra falhar — exatamente o tamanho certo. Depois que virar automático (umas 4 repetições), aí sim você aumenta. Começar pequeno não é falta de ambição: é estratégia.", cor: "green" },
          { condicao: "valor <= 50", mensagem: "Valor médio pra um primeiro passo. Funciona se couber com folga — mas se na segunda semana apertar, desce sem culpa. O hábito importa mais que o valor agora.", cor: "yellow" },
          { condicao: "valor > 50", mensagem: "Ambicioso demais pra um começo — e primeiro passo grande é o que mais falha. Corta pela metade. Sério. Você aumenta depois que a engrenagem estiver girando.", cor: "red" },
        ],
        insightDinamico: "E agora a parte que separa esse módulo de todos os planos que ficaram na cabeça: faz a primeira transferência HOJE. Não quando o evento chegar — hoje, qualquer valor. Quebra o zero antes de fechar o app.",
      }},
      { ordem: 6, tipo: "conceito", label: "Módulo completo", conteudo: {
        headline: "Zero <em>quebrado</em>",
        corpo: "Seu sonho tem número, prazo e agora um mecanismo que executa sozinho. Próximo módulo: <strong>a matemática do sonho contra a sua renda real</strong> — porque plano que ignora a realidade volta a ser fantasia.",
        insight: { label: "+ 50 XP · Módulo 2 completo", texto: "Definir não é começar · Quando X → guardo Y pra Z · Pequeno demais pra falhar é o tamanho certo." },
      }},
    ],
  },

  // ============================================================
  // SONHADOR — M3: A matemática do sonho (6 telas, input cedo)
  // ============================================================
  {
    slug: "sonhador-m3-realidade",
    titulo: "A matemática do sonho",
    subtitulo: "2 minutos. O teste de realidade que protege a meta.",
    tipoPerfil: "sonhador",
    ordem: 3,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "Sonho que ignora a renda vira <em>frustração agendada</em>",
        corpo: "Você tem meta (M1) e primeiro passo (M2). Falta o teste que quase ninguém faz: <strong>a meta cabe na SUA renda?</strong> Não na renda ideal, não na do mês bom — na real, do mês normal.",
        insight: { label: "Por que isso importa", texto: "Meta impossível não motiva — sabota. Três meses falhando 'por sua culpa' (que era da matemática) e você desiste não só dessa meta, mas da ideia de ter metas. Melhor ajustar agora." },
      }},
      { ordem: 1, tipo: "input", label: "Agora é com você", conteudo: {
        headline: "Bota os dois números <em>na mesa</em>",
        subtitulo: "2 campos. Reancora o valor/mês da sua meta do módulo 1.",
        aviso: "Isso fica só com você. Não salvamos nenhum valor.",
        campos: [
          { id: "entrou", emoji: "💸", label: "Entra", placeholder: "R$ da sua renda mensal REAL (mês normal)", tipo: "decimal" },
          { id: "valorMes", emoji: "🎯", label: "Meta pede", placeholder: "R$ por mês da sua meta (módulo 1)", tipo: "decimal" },
        ],
      }},
      { ordem: 2, tipo: "cenario", label: "Conceito", conteudo: {
        headline: "O teste do <em>Kaio</em>",
        personagem: "Kaio, 16 anos",
        linhas: [
          { label: "Renda real (mesada + bicos)", valor: 150, tipo: "entrada" },
          { label: "Meta pede por mês", valor: -40, tipo: "saida" },
          { label: "Peso da meta na renda", valor: 0, tipo: "saldo", valorTexto: "27%" },
        ],
        rodape: "27% da renda indo pra meta: aperta, mas passa no teste. <strong>Se desse 60%, o problema não seria disciplina — seria física.</strong> E física não se resolve com força de vontade.",
      }},
      { ordem: 3, tipo: "quiz", label: "Reflexão rápida", conteudo: {
        headline: "A meta do Kaio pedisse 60% da renda. Qual seria a atitude certa?",
        opcoes: [
          { letra: "A", texto: "Esticar o prazo ou reduzir a meta — ajustar a matemática", correta: true, feedback: "Exato. Meta é ferramenta, não juramento. Ajustar o plano à realidade não é fracassar — é a diferença entre quem realiza devagar e quem desiste rápido." },
          { letra: "B", texto: "Tentar mesmo assim — quem quer, consegue", correta: false, feedback: "Essa frase já enterrou mais metas que a preguiça. Viver com 40% da renda por meses não é questão de querer — e quando falhar, a culpa (injusta) vai ser sua. Matemática primeiro, motivação depois." },
          { letra: "C", texto: "Desistir — sinal de que a meta não era pra ele", correta: false, feedback: "Extremo oposto, mesmo erro. A meta continua válida — o PRAZO que estava errado. Dobra o prazo, o peso cai pra 30%, e o sonho segue vivo e possível." },
        ],
      }},
      { ordem: 4, tipo: "resultado", label: "Seu resultado", conteudo: {
        headline: "Sua meta pede <em>{pctMeta}%</em> da sua renda",
        formula: "realidade_meta",
        faixas: [
          { condicao: "pctMeta <= 15", mensagem: "Confortável: a meta cabe com folga. Dá até pra considerar encurtar o prazo — teste de realidade aprovado com sobra.", cor: "green" },
          { condicao: "pctMeta <= 30", mensagem: "Zona de esforço real: dá, mas exige escolhas conscientes todo mês. É sustentável se o resto da sua vida financeira couber nos outros {pctMeta}... digo, no que sobra. Fica de olho nos primeiros 2 meses.", cor: "yellow" },
          { condicao: "pctMeta > 30", mensagem: "Acima de 30%, a matemática está contra você — e ela sempre vence no longo prazo. Duas saídas honestas: esticar o prazo (o peso cai na proporção) ou reduzir a versão da meta. Ajustar AGORA é o que salva o sonho.", cor: "red" },
        ],
        insightDinamico: "Esse número — {pctMeta}% — é o teste que separa meta de fantasia. Você fez a conta que a maioria só descobre na frustração do terceiro mês. Se precisar ajustar, ajusta sem culpa: o sonho agradece.",
      }},
      { ordem: 5, tipo: "conceito", label: "Módulo completo", conteudo: {
        headline: "Realidade <em>testada</em>",
        corpo: "Meta com número, primeiro passo rodando e matemática conferida. Último módulo da trilha: <strong>o check de 5 minutos</strong> — o ritual que impede a empolgação de hoje de virar abandono no mês que vem.",
        insight: { label: "+ 50 XP · Módulo 3 completo", texto: "Meta impossível sabota, não motiva · Ajustar prazo não é fracassar · Matemática primeiro, motivação depois." },
      }},
    ],
  },

  // ============================================================
  // SONHADOR — M4: O check de 5 minutos (6 telas, abre com quiz)
  // ============================================================
  {
    slug: "sonhador-m4-revisao",
    titulo: "O check de 5 minutos",
    subtitulo: "2 minutos. O ritual que mantém o sonho vivo depois da empolgação.",
    tipoPerfil: "sonhador",
    ordem: 4,
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Ponto de partida", conteudo: {
        headline: "A empolgação de hoje tem <em>prazo de validade</em>",
        corpo: "Você conhece o ciclo: semana 1, tudo perfeito. Semana 3, 'esqueci'. Semana 5, o plano nem existe mais. <strong>Não é defeito seu — é o padrão de todo começo.</strong> O que os realizadores têm não é empolgação eterna: é um ritual que funciona sem ela.",
        insight: { label: "Por que isso importa", texto: "Acompanhar o próprio progresso é um dos preditores mais fortes de meta cumprida. Não porque motiva — mas porque impede o desvio silencioso de virar abandono definitivo." },
      }},
      { ordem: 1, tipo: "quiz", label: "Situação real", conteudo: {
        headline: "Semana 4: o Kaio não guardou nada e o check de domingo mostrou isso. O que o check deve fazer?",
        opcoes: [
          { letra: "A", texto: "Registrar sem drama e ajustar a semana seguinte", correta: true, feedback: "Exato. O check é painel de controle, não tribunal. Uma semana falhada e detectada custa uma semana. Uma semana falhada e escondida vira um mês — e depois vira o fim do plano." },
          { letra: "B", texto: "Puni-lo dobrando o valor da próxima semana", correta: false, feedback: "Punição transforma o check em coisa a evitar — e check evitado é plano morto. Além disso, dobrar o valor depois de falhar o normal é receita pra falhar de novo, agora com juros de culpa." },
          { letra: "C", texto: "Nada — falhou uma vez, o plano já era", correta: false, feedback: "O pensamento tudo-ou-nada de novo — o maior inimigo do seu perfil. Todo plano de longo prazo tem semanas falhas. A diferença entre realizar e desistir é o que acontece na semana SEGUINTE." },
        ],
      }},
      { ordem: 2, tipo: "conceito", label: "Como funciona", conteudo: {
        headline: "O check tem <em>3 perguntas</em> e 5 minutos",
        corpo: "<strong>1.</strong> Guardei o combinado essa semana? (sim/não, sem julgamento)<br><strong>2.</strong> Quanto falta pra meta? (o número atualizado)<br><strong>3.</strong> Alguma coisa muda semana que vem? (ajuste, se precisar)",
        insight: { label: "A regra de ouro", texto: "Mesmo dia, mesmo horário, toda semana — atrelado a algo que você JÁ faz (domingo à noite antes de dormir, sábado depois do almoço). Ritual sem âncora vira lembrança; com âncora, vira automático." },
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
        corpo: "Olha a jornada: um sonho <strong>escolhido e ancorado</strong> (M1), um <strong>primeiro passo que quebrou o zero</strong> (M2), a <strong>matemática conferida</strong> (M3) e um <strong>ritual que sobrevive à empolgação</strong> (M4). Você não virou outra pessoa — virou um sonhador que executa.",
        insight: { label: "+ 50 XP · Trilha completa", texto: "Manutenção: o se-então rodando, o check toda semana, e quando a meta completar — festeja de verdade, e só DEPOIS escolhe a próxima. Um sonho por vez continua sendo a regra." },
      }},
    ],
  },
]
