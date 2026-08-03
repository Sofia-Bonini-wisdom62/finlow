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
  // =====================================================================
  // M05 — Impulso e o parcelado sem juros
  // =====================================================================
  {
    slug: "parcelado-sem-juros-compromete",
    titulo: "O parcelado que compromete o mês que vem",
    subtitulo: "Sem juros não quer dizer sem custo.",
    tipoPerfil: "impulsivo",
    ordem: 14,
    nivel: "iniciante",
    situacoes: ["divida_rotativa", "sem_reserva"],
    tags: ["parcelado", "impulso", "cartao", "consumo", "parcelas"],
    xp: 50,
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O que é",
        conteudo: {
          headline: "Parcelado sem juros é dívida, só que sem a palavra dívida",
          corpo:
            "Não tem juro, é verdade. Mas tem uma coisa que o juro também tem: ele compromete uma renda que ainda não chegou.\n\nCada 10x que você aceita hoje reserva um pedaço dos seus próximos dez meses. Quando várias se acumulam, o salário chega e já está gasto — e aí a compra do mês entra no cartão de novo, porque não sobrou dinheiro vivo.",
          insight: {
            label: "O tamanho disso no Brasil",
            texto:
              "O parcelado sem juros já é {{parcelado_sem_juros}}, e {{compras_nao_planejadas}} admitem ter feito compras não planejadas no mês anterior.",
          },
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Na prática",
        conteudo: {
          headline: "A Bruna recebeu o salário e ele já estava gasto",
          personagem: "Bruna, 31 anos, designer",
          linhas: [
            { label: "Salário do mês", valor: 3200, tipo: "entrada" },
            { label: "Celular, 8 de 10x", valor: 280, tipo: "saida" },
            { label: "Sofá, 4 de 12x", valor: 320, tipo: "saida" },
            { label: "Viagem, 3 de 6x", valor: 300, tipo: "saida" }
          ],
          rodape:
            "R$ 900 já estavam comprometidos antes de ela comprar comida. Nenhuma das três compras foi errada. O problema é que foram decididas em meses diferentes, e chegam todas no mesmo.",
        },
      },
      {
        ordem: 2,
        tipo: "input",
        label: "Suas parcelas",
        conteudo: {
          headline: "Some tudo que já está parcelado",
          subtitulo:
            "Abra a fatura e some as parcelas que vão cair no mês que vem. Depois me diga quanto entra por mês.",
          aviso: "Fica só nesta tela, no seu aparelho. Não é gravado em lugar nenhum.",
          campos: [
            { id: "parcelas", emoji: "🧾", label: "Parcelas do mês que vem", placeholder: "900", tipo: "decimal" },
            { id: "rendaMes", emoji: "💰", label: "Quanto entra por mês", placeholder: "3200", tipo: "decimal" }
          ],
        },
      },
      {
        ordem: 3,
        tipo: "resultado",
        label: "O mês que vem",
        conteudo: {
          headline: "<strong>{comprometido}%</strong> do mês que vem já está gasto.",
          formula: "parcelas_comprometem",
          faixas: [
            {
              condicao: "comprometidoNum >= 30",
              mensagem:
                "Acima de 30% comprometido, sobra pouco espaço para o imprevisto. Não é que você gastou demais: é que as decisões foram tomadas em meses diferentes e chegaram juntas.",
              cor: "red",
            },
            {
              condicao: "comprometidoNum >= 15",
              mensagem:
                "É uma faixa administrável, mas vale saber que ela existe antes de aceitar o próximo parcelamento.",
              cor: "yellow",
            },
            {
              condicao: "valor >= 0",
              mensagem:
                "Sobra espaço no mês que vem. É desse espaço que sai a reserva — e é ele que o próximo 10x consome.",
              cor: "green",
            },
          ],
          insightDinamico:
            "A conta que quase ninguém faz antes de comprar: a parcela nova entra num mês que já tem parcelas velhas. O número que importa não é o da prestação, é este aqui.",
        },
      },
      {
        ordem: 4,
        tipo: "quiz",
        label: "Na hora da compra",
        conteudo: {
          headline: "A vendedora oferece 10x sem juros. O que você pergunta primeiro?",
          opcoes: [
            {
              letra: "A",
              texto: "Quanto fica a parcela",
              correta: false,
              feedback:
                "É a pergunta que a loja quer que você faça: parcela pequena parece barata. O total e o prazo somem da conversa.",
            },
            {
              letra: "B",
              texto: "Quanto fica à vista",
              correta: true,
              feedback:
                "Certo. Muita loja dá desconto à vista, e aí o sem juros deixa de ser de graça: você está pagando o desconto que abriu mão.",
            },
            {
              letra: "C",
              texto: "Quanto eu já tenho comprometido nos próximos 10 meses",
              correta: true,
              feedback:
                "Também certo, e é a pergunta que protege o mês. Parcela cabe sempre; o que não cabe é a soma delas.",
            },
            {
              letra: "D",
              texto: "Se dá pra parcelar em mais vezes",
              correta: false,
              feedback:
                "Mais vezes é mais meses comprometidos. Alonga o problema em vez de resolvê-lo.",
            },
          ],
        },
      },
      {
        ordem: 5,
        tipo: "resultado",
        label: "Levar daqui",
        conteudo: {
          headline: "Duas regras que cabem na cabeça",
          faixas: [
            {
              condicao: "valor >= 0",
              mensagem:
                "1. Antes de aceitar qualquer parcelamento, some o que já está comprometido. Se passar de um terço do que entra, a resposta é não.\n\n2. Compra por impulso espera 24 horas. O desejo que sobrevive a um dia é desejo; o que some era o momento.",
              cor: "green",
            },
          ],
          insightDinamico:
            "E uma coisa que não é regra, é aritmética: quando você quita as parcelas, o dinheiro não aparece do nada. Ele volta a existir porque parou de estar reservado.",
        },
      },
    ],
  },

  // =====================================================================
  // M06 — Ler o holerite
  // =====================================================================
  {
    slug: "ler-o-holerite",
    titulo: "Por que caiu menos do que o combinado",
    subtitulo: "Cada linha do holerite, e o que fazer com o 13º.",
    tipoPerfil: "lancador",
    ordem: 15,
    nivel: "iniciante",
    situacoes: [],
    tags: ["holerite", "contracheque", "inss", "irrf", "fgts", "salario", "13"],
    xp: 50,
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Bruto e líquido",
        conteudo: {
          headline: "O salário combinado é o bruto. O que cai é o líquido",
          corpo:
            "Entre um e outro entram descontos obrigatórios:\n\n• INSS — sua contribuição para a Previdência. É o que garante aposentadoria, auxílio-doença e salário-maternidade.\n• IRRF — imposto de renda retido direto na fonte. Depende da faixa e de quantos dependentes você tem.\n• Outros — vale-transporte, plano de saúde, consignado, se houver.\n\nO FGTS não aparece como desconto: ele é depositado PELO empregador numa conta no seu nome. Não sai do seu líquido.",
          insight: {
            label: "Por que isso é confuso",
            texto:
              "Só {{letramento_juros}} conseguem fazer um cálculo simples de juros. Não é falta de inteligência: é que ninguém ensina, e o holerite não foi escrito para ser entendido.",
          },
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Na prática",
        conteudo: {
          headline: "O Paulo combinou R$ 4.200 e recebeu R$ 3.500",
          personagem: "Paulo, 34 anos, CLT",
          linhas: [
            { label: "Salário bruto", valor: 4200, tipo: "entrada" },
            { label: "INSS", valor: 380, tipo: "saida" },
            { label: "IRRF", valor: 145, tipo: "saida" },
            { label: "Vale-transporte", valor: 175, tipo: "saida" },
            { label: "Caiu na conta", valor: 3500, tipo: "saldo" }
          ],
          rodape:
            "Além disso, o empregador depositou cerca de R$ 336 de FGTS numa conta no nome dele. Esse dinheiro existe e é dele, só não está disponível agora.",
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Qual é qual",
        conteudo: {
          headline: "Qual desconto vira a sua aposentadoria?",
          opcoes: [
            { letra: "A", texto: "IRRF", correta: false,
              feedback: "IRRF é imposto de renda. Vai para o Tesouro, não para a sua Previdência." },
            { letra: "B", texto: "INSS", correta: true,
              feedback: "Isso. O INSS é a sua contribuição previdenciária: é ela que conta tempo e gera direito a aposentadoria, auxílio-doença e salário-maternidade." },
            { letra: "C", texto: "FGTS", correta: false,
              feedback: "O FGTS não é desconto seu, é depósito do empregador. Serve de reserva para demissão, e não conta como tempo de contribuição." },
            { letra: "D", texto: "Vale-transporte", correta: false,
              feedback: "É a sua parte do custo do transporte, limitada a 6% do salário. Não tem relação com aposentadoria." },
          ],
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "O seu",
        conteudo: {
          headline: "Pega o seu holerite",
          subtitulo: "Dois números: o salário bruto e o valor que caiu na conta.",
          aviso: "Fica só nesta tela, no seu aparelho. Não é gravado em lugar nenhum.",
          campos: [
            { id: "bruto", emoji: "📄", label: "Salário bruto", placeholder: "4200", tipo: "decimal" },
            { id: "liquido", emoji: "🏦", label: "O que caiu", placeholder: "3500", tipo: "decimal" }
          ],
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "A diferença",
        conteudo: {
          headline: "Saíram <strong>{desconto}</strong>, ou <strong>{pctMeta}%</strong> do bruto.",
          formula: "holerite_descontos",
          faixas: [
            {
              condicao: "pctMeta >= 25",
              mensagem:
                "É um desconto alto. Vale conferir linha por linha: além de INSS e IRRF, pode haver plano de saúde, consignado ou adiantamento que você não lembrava.",
              cor: "yellow",
            },
            {
              condicao: "valor > 0",
              mensagem:
                "Está na faixa comum para CLT. A maior parte costuma ser INSS e IRRF, nessa ordem.",
              cor: "green",
            },
          ],
          insightDinamico:
            "Não reparti a diferença entre INSS e IRRF de propósito: as duas tabelas são progressivas, mudam todo ano e dependem dos seus dependentes. Um número estimado aqui pareceria exato e estaria errado. Os valores reais estão discriminados no seu holerite, linha por linha.",
        },
      },
      {
        ordem: 5,
        tipo: "resultado",
        label: "O 13º",
        conteudo: {
          headline: "O 13º não é bônus, é salário adiado",
          faixas: [
            {
              condicao: "valor >= 0",
              mensagem:
                "Ele chega em duas parcelas, e a segunda vem com os descontos. A ordem que funciona:\n\n1. Se existe dívida cara, ela vem primeiro. Nenhuma aplicação rende perto do que o rotativo cobra.\n2. Sem dívida cara, ele vira reserva. É o único mês do ano em que dá para fechar vários meses de colchão de uma vez.\n3. O que sobrar depois disso é seu para gastar sem culpa.",
              cor: "green",
            },
          ],
          insightDinamico:
            "E o FGTS: ele rende pouco, mas não é dinheiro perdido. Ele existe para o caso de demissão sem justa causa, e sacar por antecipação troca essa proteção por dinheiro hoje.",
        },
      },
    ],
  },

  // =====================================================================
  // M07 — Bets
  // =====================================================================
  {
    slug: "bets-a-matematica-da-casa",
    titulo: "A matemática de quem sempre perde",
    subtitulo: "Por que a casa não precisa trapacear pra ganhar.",
    tipoPerfil: "impulsivo",
    ordem: 16,
    nivel: "iniciante",
    situacoes: ["divida_rotativa", "sem_reserva"],
    tags: ["bets", "aposta", "jogo", "risco", "compulsao", "azar"],
    xp: 50,
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Como funciona",
        conteudo: {
          headline: "A vantagem da casa é embutida, não escondida",
          corpo:
            "Numa aposta equilibrada, com chance real de 50%, o pagamento justo seria 2 para 1. A casa paga menos que isso — 1,90, 1,85. A diferença é a margem dela.\n\nEssa margem não aparece em nenhum lugar, não é ilegal e não é trapaça. É o preço do serviço. E ela funciona igual ao juro composto: pequena em cada rodada, inevitável ao longo de muitas.\n\nPor isso apostar mais vezes não aumenta a chance de recuperar. Aumenta a certeza de que a margem vai aparecer.",
          insight: {
            label: "O que os dados brasileiros mostram",
            texto:
              "O apostador ativo gasta em média {{gasto_medio_bets}}, e {{apostadores_negativados}} já foram negativados por dívida de aposta.",
          },
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Na prática",
        conteudo: {
          headline: "O Diego estava tentando recuperar, não ganhar",
          personagem: "Diego, 30 anos, motorista",
          linhas: [
            { label: "Apostou no primeiro mês", valor: 100, tipo: "saida" },
            { label: "Perdeu, e dobrou pra recuperar", valor: 200, tipo: "saida" },
            { label: "Perdeu de novo, dobrou de novo", valor: 400, tipo: "saida" }
          ],
          rodape:
            "A cada perda, a aposta seguinte cresceu. Não por vício de jogo: por uma conta que parece lógica — se eu recuperar, empato. O problema é que a margem da casa incide sobre o valor apostado, e o valor apostado estava crescendo.",
        },
      },
      {
        ordem: 2,
        tipo: "input",
        label: "Seu chute",
        conteudo: {
          headline: "R$ 100 por mês, durante 12 meses",
          subtitulo:
            "Alguém aposta R$ 100 todo mês por um ano. No fim desse ano, com quanto essa pessoa fica, na média?",
          aviso: "Sem consultar. O chute é o ponto do exercício.",
          campos: [
            { id: "chute", emoji: "🎯", label: "Meu chute", placeholder: "900", tipo: "decimal" }
          ],
        },
      },
      {
        ordem: 3,
        tipo: "resultado",
        label: "Os dois caminhos",
        conteudo: {
          headline: "Você chutou <strong>R$ {valor}</strong>. Saíram <strong>{apostado}</strong> da mão.",
          formula: "bets_comparacao",
          faixas: [
            {
              condicao: "valor > 1200",
              mensagem:
                "Você chutou acima do que foi apostado. Isso acontece porque a memória guarda os ganhos com muito mais nitidez que as perdas — é assim que o produto foi desenhado para ser lembrado.",
              cor: "red",
            },
            {
              condicao: "valor >= 0",
              mensagem:
                "A direção está certa: sai menos do que entrou. O que quase ninguém dimensiona é o tamanho da diferença ao longo de um ano.",
              cor: "yellow",
            },
          ],
          insightDinamico:
            "O apostador brasileiro médio perde cerca de {perda} em doze meses. Os mesmos R$ 100 por mês, guardados, viram cerca de {guardado}. A diferença entre os dois caminhos não é sorte: é a margem da casa, aplicada doze vezes.",
        },
      },
      {
        ordem: 4,
        tipo: "quiz",
        label: "Quando vira problema",
        conteudo: {
          headline: "Qual destes é o sinal mais claro de que a aposta deixou de ser diversão?",
          opcoes: [
            { letra: "A", texto: "Apostar todo fim de semana", correta: false,
              feedback: "Frequência sozinha não diz muito. Tem gente que aposta sempre um valor pequeno e planejado, e isso é lazer." },
            { letra: "B", texto: "Apostar para recuperar o que já perdeu", correta: true,
              feedback: "Esse é o sinal. Perseguir a perda é o mecanismo que transforma lazer em dívida, e é o mais comum de todos." },
            { letra: "C", texto: "Perder uma aposta grande", correta: false,
              feedback: "Perder faz parte, e uma perda grande isolada não define nada. O que define é o que se faz depois dela." },
            { letra: "D", texto: "Usar aplicativo em vez de casa física", correta: false,
              feedback: "O canal não muda a matemática. O que muda é a facilidade de repetir, e é por isso que o sinal da letra B aparece mais rápido no aplicativo." },
          ],
        },
      },
      {
        ordem: 5,
        tipo: "resultado",
        label: "Se precisar de ajuda",
        conteudo: {
          headline: "Isto não é sobre força de vontade",
          faixas: [
            {
              condicao: "valor >= 0",
              mensagem:
                "Apostar é legal para maiores de idade, e este módulo não existe para dizer que você não pode. Ele existe porque a conta é conhecida e quase nunca é mostrada.\n\nSe a aposta virou uma forma de resolver dinheiro, ou se você já apostou dinheiro que precisava para outra coisa, isso tem nome, tem tratamento e não é fraqueza de caráter.",
              cor: "green",
            },
          ],
          insightDinamico:
            "Onde procurar: o SUS atende transtorno do jogo pela rede de saúde mental, pelos CAPS. E o CVV atende 24 horas, de graça, pelo 188 — para qualquer sofrimento, inclusive o de dívida.",
        },
      },
    ],
  },

  // =====================================================================
  // M08 — Golpes
  // =====================================================================
  {
    slug: "golpe-financeiro-como-reconhecer",
    titulo: "O golpe explora pressa, não ingenuidade",
    subtitulo: "Central falsa, parente no WhatsApp e o boleto adulterado.",
    tipoPerfil: "guardador",
    ordem: 17,
    nivel: "iniciante",
    situacoes: [],
    tags: ["golpe", "pix", "phishing", "fraude", "seguranca", "engenharia-social"],
    xp: 50,
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Como funciona",
        conteudo: {
          headline: "Nenhum golpe moderno depende de você ser distraído",
          corpo:
            "Eles dependem de três coisas: pressa, medo e autoridade. A ligação diz que houve uma compra suspeita. O parente pede socorro com número novo. O boleto chega igual ao verdadeiro.\n\nO objetivo é sempre tirar de você o tempo de conferir. Por isso a defesa não é ser esperto: é ter uma regra fixa que não depende de como você está se sentindo naquele momento.",
          insight: {
            label: "O tamanho disso",
            texto:
              "{{vitimas_golpe}} foram vítimas de golpe digital em 12 meses, e as perdas somaram {{perdas_golpe}} só em 2024.",
          },
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Na prática",
        conteudo: {
          headline: "A Aline recebeu uma ligação da central do banco",
          personagem: "Aline, 36 anos, professora",
          linhas: [
            { label: "Compra suspeita que ela precisava cancelar", valor: 2400, tipo: "saldo" },
            { label: "O Pix de segurança que pediram", valor: 2400, tipo: "saida" }
          ],
          rodape:
            "Tudo batia: o atendente sabia o nome dela, os quatro últimos dígitos do cartão, e o número no visor era o do banco. O único detalhe fora do lugar era o pedido em si — banco nenhum pede transferência para conta segura, porque isso não existe.",
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "O que fazer",
        conteudo: {
          headline: "A ligação diz que há uma compra suspeita e pede confirmação. Você:",
          opcoes: [
            { letra: "A", texto: "Confirmo os dados pra cancelar rápido", correta: false,
              feedback: "É exatamente o que o golpe precisa. A pressa é a ferramenta, e confirmar dados entrega o que falta para eles." },
            { letra: "B", texto: "Desligo e ligo eu mesma no número do cartão", correta: true,
              feedback: "Certo, e é a única resposta que funciona sempre. Quem liga controla a ligação; quem retorna pelo número oficial controla a verificação." },
            { letra: "C", texto: "Peço pra pessoa provar que é do banco", correta: false,
              feedback: "Eles têm os seus dados — nome, final do cartão, às vezes até compras recentes. Provar identidade por telefone é justamente o que não dá para fazer." },
            { letra: "D", texto: "Bloqueio o cartão pelo aplicativo e continuo ouvindo", correta: false,
              feedback: "Bloquear é bom, continuar na linha não. Enquanto você fala, eles trabalham — e o número no visor pode ser clonado." },
          ],
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "O que nunca se passa",
        conteudo: {
          headline: "Marque o que um banco NUNCA vai te pedir",
          subtitulo: "Escolha o que você considera o pedido mais suspeito de todos.",
          aviso: "Não tem pegadinha: todos abaixo são pedidos que banco nenhum faz.",
          campos: [
            {
              id: "pedido",
              emoji: "🚫",
              label: "O mais suspeito",
              tipo: "faixa",
              opcoes: [
                { valor: "senha", rotulo: "A senha do aplicativo" },
                { valor: "pix", rotulo: "Um Pix para conta segura" },
                { valor: "codigo", rotulo: "O código que chegou por SMS" },
                { valor: "cartao", rotulo: "Entregar o cartão a um portador" }
              ],
            },
          ],
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "A regra fixa",
        conteudo: {
          headline: "Todos eram o mais suspeito. Nenhum banco pede nenhum deles",
          faixas: [
            {
              condicao: "valor >= 0",
              mensagem:
                "Senha, código de SMS, Pix para conta segura, cartão na mão de um portador: nada disso é procedimento de banco nenhum, em nenhuma circunstância.\n\nA regra que resolve todos de uma vez: desconfie, desligue, confirme pelo canal oficial. Não é preciso identificar o golpe — basta nunca agir dentro da ligação que chegou até você.",
              cor: "green",
            },
          ],
          insightDinamico:
            "E vale para o parente no WhatsApp também: número novo pedindo dinheiro, você liga para o número ANTIGO. Se for verdade, a pessoa atende.",
        },
      },
      {
        ordem: 5,
        tipo: "resultado",
        label: "Se já aconteceu",
        conteudo: {
          headline: "Cair num golpe não é burrice, é a engenharia funcionando",
          faixas: [
            {
              condicao: "valor >= 0",
              mensagem:
                "O que fazer, na ordem, e rápido:\n\n1. Avise o banco pelo aplicativo ou pelo telefone oficial e peça o Mecanismo Especial de Devolução do Pix.\n2. Registre boletim de ocorrência, mesmo online. Ele é necessário para qualquer contestação.\n3. Troque as senhas que você informou.\n4. Se houve empréstimo feito no seu nome, conteste formalmente por escrito.",
              cor: "green",
            },
          ],
          insightDinamico:
            "Quanto mais rápido o banco souber, maior a chance de bloquear o dinheiro antes de ele sair da conta destino. As primeiras horas valem mais que qualquer coisa que se faça depois.",
        },
      },
    ],
  },
]
