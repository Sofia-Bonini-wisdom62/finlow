import type { Nivel, Situacao } from "@/lib/situacoes"

/**
 * Módulos da Temporada 2, na ordem de construção que o backlog define.
 *
 * REGRA QUE NÃO SE QUEBRA AQUI
 * Nenhum número macro é cravado no texto. Selic, IPCA e a taxa do rotativo
 * entram como `{{chave}}` e são trocados na hora de exibir, a partir da tabela
 * de indicadores. Quando o Banco Central publicar taxa nova, é UPDATE numa
 * linha, não reescrever aula. Há teste conferindo que todo `{{...}}` citado
 * existe de verdade.
 *
 * Os cinco tipos de tela são os que já existem. Nenhum componente novo: é a
 * restrição dura do card flow, e o backlog a repete no cabeçalho.
 */

export interface ModuloNovo {
  slug: string
  titulo: string
  subtitulo: string
  /** Herdado do schema antigo. Não roteia mais nada: quem posiciona é
   *  nivel + situacoes. Fica como afinidade temática, usada só em desempate. */
  tipoPerfil: string
  ordem: number
  nivel: Nivel
  situacoes: Situacao[]
  tags: string[]
  xp: number
  telas: {
    ordem: number
    tipo: "conceito" | "cenario" | "quiz" | "input" | "resultado"
    label: string
    conteudo: unknown
  }[]
}

export const MODULOS_T2: ModuloNovo[] = [
  {
    slug: "rotativo-cartao-dobra-sozinha",
    titulo: "A dívida que dobra sozinha",
    subtitulo: "O que acontece quando você paga só o mínimo da fatura.",
    tipoPerfil: "lancador",
    ordem: 10,
    nivel: "iniciante",
    situacoes: ["divida_rotativa"],
    tags: ["cartao", "rotativo", "juros", "fatura", "minimo", "divida"],
    xp: 50,
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O que é",
        conteudo: {
          headline: "Rotativo é o pedaço da fatura que você não pagou",
          corpo:
            "Quando chega a fatura, o banco oferece um valor mínimo. Se você paga só ele, o resto não some: vira um empréstimo automático, no juro mais caro do país.\n\nNinguém assina nada. Não tem proposta, não tem simulação. O rotativo começa sozinho, no dia seguinte ao vencimento, e continua rodando enquanto sobrar saldo.",
          insight: {
            label: "A taxa",
            texto:
              "O rotativo cobrava {{rotativo_medio}}. Para comparação, o crédito consignado, que é o mais barato do mercado, fica perto de {{consignado_clt}}.",
          },
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Na prática",
        conteudo: {
          headline: "A Renata pagou o mínimo e a fatura cresceu",
          personagem: "Renata, 33 anos, analista",
          // A fatura é "saldo", não "saída": ela não GASTOU 3.400 mais 510.
          // Com as duas como saída a coluna lê "−3.400, −510, 2.890", como se
          // tivesse gasto 3.910, e a história do módulo fica errada na tela.
          linhas: [
            { label: "Fatura que chegou", valor: 3400, tipo: "saldo" },
            { label: "O mínimo que ela pagou", valor: 510, tipo: "saida" },
            { label: "Ficou rolando no rotativo", valor: 2890, tipo: "saldo" },
          ],
          rodape:
            "No mês seguinte, a fatura veio maior que os R$ 2.890, mesmo sem ela ter comprado nada. Não foi erro do banco: foi o juro do rotativo entrando na conta.",
        },
      },
      {
        ordem: 2,
        tipo: "input",
        label: "Seu chute",
        conteudo: {
          headline: "Chuta antes de ver",
          subtitulo:
            "Uma dívida de R$ 1.000 entra no rotativo hoje e fica lá 12 meses, sem você pagar nada. Em quanto ela se transforma?",
          aviso: "Sem consultar. O chute é o ponto do exercício.",
          campos: [
            {
              id: "chute",
              emoji: "🎯",
              label: "Meu chute",
              placeholder: "1500",
              tipo: "decimal",
            },
          ],
        },
      },
      {
        ordem: 3,
        tipo: "resultado",
        label: "A conta real",
        conteudo: {
          headline:
            "Você chutou <strong>R$ {valor}</strong>. Pela taxa, seriam <strong>{semTeto}</strong>.",
          formula: "rotativo_bola_de_neve",
          faixas: [
            {
              condicao: "subestimou > 0",
              mensagem:
                "Quase todo mundo chuta baixo, e não é falta de atenção: o cérebro humano projeta crescimento em linha reta, e juro composto não anda em linha reta. É por isso que a dívida surpreende mesmo quem sabe que ela é cara.",
              cor: "red",
            },
            {
              condicao: "valor > 0",
              mensagem:
                "Você chutou alto, e acertou a direção. A maioria das pessoas subestima, porque o cérebro projeta crescimento em linha reta e juro composto não anda em linha reta.",
              cor: "yellow",
            },
          ],
          insightDinamico:
            "Mas existe um freio na lei. Desde janeiro de 2024, os encargos do rotativo não podem passar de {{teto_rotativo}}: os seus R$ 1.000 param em {comTeto}, não em {semTeto}. O teto protege, e continua sendo a dívida mais cara que você pode ter.",
        },
      },
      {
        ordem: 4,
        tipo: "quiz",
        label: "A saída",
        conteudo: {
          headline: "A fatura não fecha esse mês. O que você faz?",
          opcoes: [
            {
              letra: "A",
              texto: "Pago o mínimo e resolvo mês que vem",
              correta: false,
              feedback:
                "É o caminho mais caro que existe. O mínimo não é uma opção de pagamento, é a porta de entrada do rotativo.",
            },
            {
              letra: "B",
              texto: "Peço pro banco parcelar a fatura",
              correta: true,
              feedback:
                "Certo. O parcelamento da fatura é caro, mas custa uma fração do rotativo, e você passa a saber quanto vai pagar. Peça o CET antes de aceitar.",
            },
            {
              letra: "C",
              texto: "Busco um crédito mais barato pra quitar a fatura",
              correta: true,
              feedback:
                "Também certo, e às vezes melhor. Trocar dívida cara por barata é a jogada mais eficiente que existe, desde que a nova dívida realmente quite a antiga.",
            },
            {
              letra: "D",
              texto: "Deixo vencer e negocio depois",
              correta: false,
              feedback:
                "Atrasar acrescenta multa e mora, e ainda leva o nome para o cadastro de inadimplentes. Negociar antes de vencer é sempre mais barato.",
            },
          ],
        },
      },
      {
        ordem: 5,
        tipo: "resultado",
        label: "Levar daqui",
        conteudo: {
          headline: "Rotativo é o último recurso, nunca o padrão",
          faixas: [
            {
              condicao: "valor >= 0",
              mensagem:
                "A regra prática: se a fatura não fecha, procure o banco ANTES do vencimento e peça o parcelamento com o CET na mão. Comparar pelo CET, e não pela parcela, é o que separa trocar dívida cara por barata de trocar de lugar.",
              cor: "green",
            },
          ],
          insightDinamico:
            "E se já estiver no rotativo: ele é a primeira dívida a atacar, antes de qualquer outra. Nenhuma aplicação do mercado rende perto de {{rotativo_medio}}, então quitar rotativo é o melhor retorno garantido que você vai encontrar.",
        },
      },
    ],
  },

  // =====================================================================
  // M02 — Sair do vermelho
  // =====================================================================
  {
    slug: "sair-do-vermelho-negociar",
    titulo: "Sair do vermelho",
    subtitulo: "O que a negativação trava, e como se negocia de verdade.",
    tipoPerfil: "lancador",
    ordem: 11,
    nivel: "iniciante",
    situacoes: ["divida_rotativa", "sem_reserva"],
    tags: ["negativacao", "serasa", "desenrola", "superendividamento", "renegociacao", "divida"],
    xp: 50,
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O que trava",
        conteudo: {
          headline: "Nome negativado não é sentença, é um aviso público",
          corpo:
            "Quando uma dívida passa do prazo, o credor pode registrar seu CPF num cadastro de inadimplentes. A partir daí, quem consulta vê o registro: banco, loja, imobiliária, às vezes empregador.\n\nO que trava na prática é crédito novo, conta em algumas instituições, aluguel e compra parcelada. O que NÃO trava: receber salário, movimentar sua conta, sacar FGTS, trabalhar.",
          insight: {
            label: "Você não está sozinho nisso",
            texto:
              "São {{inadimplentes}} com o nome restrito no Brasil, e a dívida média é de {{divida_media}}. É situação de multidão, não de exceção.",
          },
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Na prática",
        conteudo: {
          headline: "O Marcos descobriu que a dívida tinha três partes",
          personagem: "Marcos, 38 anos, técnico",
          linhas: [
            { label: "O que ele gastou de verdade", valor: 1800, tipo: "saldo" },
            { label: "Juros e encargos acumulados", valor: 520, tipo: "saida" },
            { label: "Multa e mora do atraso", valor: 180, tipo: "saida" },
            { label: "O que o credor cobrava", valor: 2500, tipo: "saldo" },
          ],
          rodape:
            "A parte que cresceu foi a de encargos, não a da compra. É justamente essa parte que o credor tem margem para descontar numa negociação — ele prefere receber o principal a não receber nada.",
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "A lei que te protege",
        conteudo: {
          headline: "A Lei do Superendividamento garante o quê?",
          opcoes: [
            {
              letra: "A",
              texto: "Que a dívida é perdoada depois de 5 anos",
              correta: false,
              feedback:
                "Não. O que caduca em 5 anos é o REGISTRO no cadastro de inadimplentes, não a dívida. Ela continua existindo e o credor pode cobrar.",
            },
            {
              letra: "B",
              texto: "Um plano de pagamento e a garantia do mínimo existencial",
              correta: true,
              feedback:
                "Isso. A Lei 14.181/2021 permite repactuar dívidas num plano de até 5 anos e garante que sobre um mínimo para você viver. Nenhum acordo pode consumir tudo o que você ganha.",
            },
            {
              letra: "C",
              texto: "Que o banco é obrigado a aceitar sua proposta",
              correta: false,
              feedback:
                "Não existe obrigação de aceitar um valor específico. O que a lei cria é o dever de negociar de boa-fé e o direito à audiência de conciliação.",
            },
            {
              letra: "D",
              texto: "Que você pode parar de pagar sem consequência",
              correta: false,
              feedback:
                "Não. A lei protege quem está superendividado de boa-fé, e o caminho é repactuar, não parar de pagar.",
            },
          ],
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua dívida",
        conteudo: {
          headline: "Quanto está em atraso hoje?",
          subtitulo:
            "Só o que já passou do vencimento. Valor aproximado serve — o objetivo é ter um número na mão antes de ligar.",
          aviso: "Fica só nesta tela, no seu aparelho. Não é gravado em lugar nenhum.",
          campos: [
            { id: "divida", emoji: "📄", label: "Total em atraso", placeholder: "2500", tipo: "decimal" },
          ],
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O que dá pra fazer",
        conteudo: {
          headline: "Você tem <strong>R$ {valor}</strong> em atraso.",
          formula: "divida_negociada",
          faixas: [
            {
              condicao: "acimaDaMedia > 0",
              mensagem:
                "Está acima da dívida média do país, e isso muda a estratégia: com valor maior, vale pedir a audiência de conciliação prevista na Lei do Superendividamento em vez de aceitar a primeira proposta do balcão.",
              cor: "yellow",
            },
            {
              condicao: "valor >= 0",
              mensagem:
                "Está na faixa em que a maioria dos acordos acontece. Credor prefere receber parte a não receber nada, e é por isso que a negociação costuma ter margem.",
              cor: "green",
            },
          ],
          insightDinamico:
            "Para calibrar: o ticket médio de acordo no Brasil é {{ticket_acordo}}, e a dívida média de quem está negativado é {{divida_media}}. Isso não é promessa de desconto — depende do credor, do tempo de atraso e da campanha do mês. É só o retrato de onde as negociações costumam fechar.",
        },
      },
      {
        ordem: 5,
        tipo: "resultado",
        label: "Levar daqui",
        conteudo: {
          headline: "A ordem que funciona",
          faixas: [
            {
              condicao: "valor >= 0",
              mensagem:
                "1. Liste tudo o que está em atraso, com credor e valor.\n2. Comece pela mais cara, não pela maior.\n3. Procure o canal oficial do credor ou os mutirões de renegociação. Nunca um intermediário que cobra para negociar.\n4. Antes de aceitar: peça o valor total do acordo, não a parcela. Parcela pequena com prazo longo pode custar mais que a dívida atual.",
              cor: "green",
            },
          ],
          insightDinamico:
            "E o mais importante: só feche um acordo que cabe. Acordo quebrado costuma voltar pior que a dívida original, e a Lei 14.181/2021 existe justamente para você não precisar assinar algo que não cabe no seu mês.",
        },
      },
    ],
  },

  // =====================================================================
  // M03 — Reserva de emergência
  // =====================================================================
  {
    slug: "reserva-de-emergencia-colchao",
    titulo: "O colchão antes de investir",
    subtitulo: "Quanto guardar pra um imprevisto não virar dívida.",
    tipoPerfil: "lancador",
    ordem: 12,
    nivel: "iniciante",
    situacoes: ["sem_reserva", "renda_variavel"],
    tags: ["reserva", "emergencia", "liquidez", "colchao", "imprevisto"],
    xp: 50,
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O que é",
        conteudo: {
          headline: "Reserva é o dinheiro que existe pra você não pegar emprestado",
          corpo:
            "Não é investimento e não é poupança para um objetivo. É um valor parado, de saque imediato, que cobre o mês quando algo quebra, some ou adoece.\n\nSem ela, todo imprevisto vira cartão. E cartão vira rotativo, que é a dívida mais cara do país. A reserva não é o passo depois de organizar as contas: é o que impede as contas de desorganizarem de novo.",
          insight: {
            label: "Por que ela vem antes",
            texto:
              "{{sem_reserva_pct}} não têm reserva nenhuma. É também por isso que {{endividamento_familias}} estão endividadas: sem colchão, o imprevisto só tem um lugar para cair.",
          },
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Na prática",
        conteudo: {
          headline: "A Carla não tinha reserva, e o carro quebrou",
          personagem: "Carla, 29 anos, autônoma",
          linhas: [
            { label: "O conserto", valor: 1400, tipo: "saida" },
            { label: "Foi pro cartão, em 6x", valor: 280, tipo: "saida" },
            { label: "Juros do parcelamento no ano", valor: 190, tipo: "saida" },
          ],
          rodape:
            "O conserto custou R$ 1.400. Ela pagou R$ 1.590. A diferença é o preço de não ter tido R$ 1.400 parados — e ela ficou com 6 meses de parcela comprometida, o que reduziu a chance de guardar para o próximo imprevisto.",
        },
      },
      {
        ordem: 2,
        tipo: "input",
        label: "Seu custo fixo",
        conteudo: {
          headline: "Quanto você gasta num mês só pra viver?",
          subtitulo:
            "Aluguel ou prestação, contas de casa, mercado, transporte, remédio. O essencial. Não inclua lazer nem o que dá pra cortar num mês apertado.",
          aviso: "Fica só nesta tela, no seu aparelho. Não é gravado em lugar nenhum.",
          campos: [
            { id: "custoFixo", emoji: "🏠", label: "Custo fixo do mês", placeholder: "2800", tipo: "decimal" },
          ],
        },
      },
      {
        ordem: 3,
        tipo: "resultado",
        label: "Sua meta",
        conteudo: {
          headline: "Sua reserva cheia é entre <strong>{reserva3}</strong> e <strong>{reserva6}</strong>.",
          formula: "reserva_meta",
          faixas: [
            {
              condicao: "valor > 0",
              mensagem:
                "É de 3 a 6 meses do seu custo fixo, não da sua renda. A diferença é grande e é de propósito: a reserva precisa cobrir o que você GASTA para viver, não o que você ganha.",
              cor: "green",
            },
          ],
          insightDinamico:
            "E o número cheio não é a meta de agora. A meta de agora é UM mês: {valor}. É o suficiente para o próximo imprevisto não virar cartão, e é o que faz a maioria das pessoas continuar em vez de desistir olhando para {reserva6}.",
        },
      },
      {
        ordem: 4,
        tipo: "quiz",
        label: "Onde deixar",
        conteudo: {
          headline: "O que importa na hora de escolher onde deixar a reserva?",
          opcoes: [
            {
              letra: "A",
              texto: "O maior rendimento possível",
              correta: false,
              feedback:
                "Não. Rendimento alto costuma vir com prazo ou com risco, e reserva presa no dia do aperto deixa de ser reserva.",
            },
            {
              letra: "B",
              texto: "Poder sacar no mesmo dia, com risco baixo",
              correta: true,
              feedback:
                "Isso. Liquidez primeiro, segurança depois, rendimento por último. A reserva não existe para render: existe para estar lá.",
            },
            {
              letra: "C",
              texto: "Deixar em casa, em dinheiro vivo",
              correta: false,
              feedback:
                "Perde para a inflação todo mês e some num roubo ou num incêndio. Liquidez imediata dá para ter sem abrir mão de segurança.",
            },
            {
              letra: "D",
              texto: "Investir em algo que valorize no longo prazo",
              correta: false,
              feedback:
                "Longo prazo é o oposto do que a reserva precisa. Se o imprevisto chega num mês ruim do mercado, você saca no prejuízo.",
            },
          ],
        },
      },
      {
        ordem: 5,
        tipo: "resultado",
        label: "Levar daqui",
        conteudo: {
          headline: "Comece pelo mês, não pelo colchão inteiro",
          faixas: [
            {
              condicao: "valor >= 0",
              mensagem:
                "Escolha um valor que sai da conta no dia em que o dinheiro entra, antes de qualquer gasto. Pode ser pequeno. O que faz a reserva existir é a repetição, não o tamanho do primeiro depósito.",
              cor: "green",
            },
          ],
          insightDinamico:
            "Regra prática: enquanto a reserva não fecha o primeiro mês, ela vem antes de qualquer investimento. Depois dela, aí sim faz sentido pensar em prazo e em render.",
        },
      },
    ],
  },

  // =====================================================================
  // M04 — Assinaturas fantasma
  // =====================================================================
  {
    slug: "assinaturas-fantasma",
    titulo: "As assinaturas que você esqueceu",
    subtitulo: "O gasto que não dói porque nunca aparece de uma vez.",
    tipoPerfil: "impulsivo",
    ordem: 13,
    nivel: "iniciante",
    situacoes: ["sem_reserva", "divida_rotativa"],
    tags: ["assinaturas", "streaming", "recorrencia", "extrato", "cancelar"],
    xp: 50,
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O que é",
        conteudo: {
          headline: "Recorrência é o gasto que some da sua atenção",
          corpo:
            "Uma compra de R$ 40 você percebe. Uma assinatura de R$ 40 por mês você percebe uma vez, no dia que assinou, e nunca mais.\n\nNão é distração: é como a cobrança foi desenhada. Ela não pede confirmação, não manda lembrete, e o valor é pequeno o bastante para não chamar atenção na fatura. O que aparece na fatura é o total, e o total não denuncia ninguém.",
          insight: {
            label: "Quanto costuma ser",
            texto:
              "A maioria dos brasileiros gasta {{gasto_assinaturas}} com assinaturas e mensalidades recorrentes. Quase sempre é mais do que a pessoa imagina antes de conferir.",
          },
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Na prática",
        conteudo: {
          headline: "O João achou quatro streamings ativos",
          personagem: "João, 35 anos, vendedor",
          linhas: [
            { label: "O que ele assistia", valor: 40, tipo: "saida" },
            { label: "Assinado no teste grátis e esquecido", valor: 35, tipo: "saida" },
            { label: "Da série que ele terminou em janeiro", valor: 30, tipo: "saida" },
            { label: "Que ele nem lembrava de ter assinado", valor: 35, tipo: "saida" },
          ],
          rodape:
            "R$ 140 por mês, dos quais ele usava R$ 40. Não é que ele não pudesse pagar: é que ele estava pagando por três coisas que não queria, sem saber.",
        },
      },
      {
        ordem: 2,
        tipo: "input",
        label: "Seu chute",
        conteudo: {
          headline: "Quanto você acha que gasta por mês com assinaturas?",
          subtitulo:
            "Streaming, música, academia, aplicativo, nuvem, clube de assinatura, jogo. Chuta antes de conferir a fatura.",
          aviso: "Sem consultar. O chute é o ponto do exercício.",
          campos: [
            { id: "assinaturas", emoji: "🔁", label: "Meu chute por mês", placeholder: "90", tipo: "decimal" },
          ],
        },
      },
      {
        ordem: 3,
        tipo: "resultado",
        label: "No ano",
        conteudo: {
          headline: "<strong>R$ {valor}</strong> por mês são <strong>{ano}</strong> no ano.",
          formula: "assinaturas_ano",
          faixas: [
            {
              condicao: "valor > 0",
              mensagem:
                "O número do mês é fácil de aceitar. O do ano costuma ser o que faz a pessoa abrir o extrato. É o mesmo dinheiro, contado de um jeito que dá pra sentir.",
              cor: "yellow",
            },
          ],
          insightDinamico:
            "Agora o teste que vale: abre a fatura do cartão e confere. Quase ninguém acerta o próprio chute, e a diferença entre o que você imaginou e o que está lá é exatamente o dinheiro que sai sem você decidir.",
        },
      },
      {
        ordem: 4,
        tipo: "quiz",
        label: "O que cortar",
        conteudo: {
          headline: "Você achou uma assinatura que usa pouco. O que fazer?",
          opcoes: [
            {
              letra: "A",
              texto: "Cancelo agora e reassino quando precisar",
              correta: true,
              feedback:
                "Certo. Quase toda assinatura digital volta com um clique, e sem multa. O custo de reassinar é baixo; o de manter doze meses ligado, não.",
            },
            {
              letra: "B",
              texto: "Mantenho, porque é barato",
              correta: false,
              feedback:
                "Barato por mês é caro por ano. E o problema não é o preço: é pagar por algo que você não escolheria hoje.",
            },
            {
              letra: "C",
              texto: "Espero acabar o ano pra decidir",
              correta: false,
              feedback:
                "Adiar a decisão é a decisão de continuar pagando. Se você não usaria hoje, cada mês de espera é dinheiro que já foi.",
            },
            {
              letra: "D",
              texto: "Troco por um plano mais barato do mesmo serviço",
              correta: true,
              feedback:
                "Também vale, quando você realmente usa. Plano com anúncio ou compartilhado costuma cortar metade do valor sem tirar o que você assiste.",
            },
          ],
        },
      },
      {
        ordem: 5,
        tipo: "resultado",
        label: "Levar daqui",
        conteudo: {
          headline: "Uma varredura por mês, no mesmo dia",
          faixas: [
            {
              condicao: "valor >= 0",
              mensagem:
                "Escolhe um dia fixo, logo depois de a fatura fechar. Abre o extrato, procura o que se repete, e pergunta de cada linha: eu assinaria isso hoje? O que não passar nesse teste, cancela na hora.",
              cor: "green",
            },
          ],
          insightDinamico:
            "É a vitória mais rápida que existe em dinheiro: não exige ganhar mais, não exige cortar nada que você goste, e o efeito aparece já na próxima fatura. Cada assinatura cancelada vira o primeiro depósito da sua reserva.",
        },
      },
    ],
  },
]
