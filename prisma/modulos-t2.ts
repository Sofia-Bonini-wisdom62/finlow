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
  // ============================ M09 — Cripto e pirâmide =================
  {
    slug: "cripto-piramide-rende-sem-risco",
    titulo: "O que paga 10% ao mês garantido",
    subtitulo: "Como reconhecer pirâmide antes de entrar nela.",
    tipoPerfil: "sonhador", ordem: 18, nivel: "iniciante",
    situacoes: ["sem_reserva"],
    tags: ["cripto", "piramide", "ponzi", "golpe", "investimento", "fraude"],
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "A assinatura da fraude", conteudo: {
        headline: "Retorno alto, garantido e sem risco: os três juntos não existem",
        corpo: "Investimento de verdade tem os três presos por um elástico: quanto maior o retorno, maior o risco, ou menor a liquidez. Sempre. Quem promete os três no máximo não descobriu um atalho — está pagando os antigos com o dinheiro dos novos.\n\nIsso tem nome: esquema Ponzi. Funciona enquanto entra gente nova, e quebra no dia em que para de entrar. Não é possibilidade: é aritmética.",
        insight: { label: "Como reconhecer em uma frase",
          texto: "Se o retorno é fixo, alto e não depende de nada, o dinheiro não vem de um investimento. Vem de outra pessoa." } } },
      { ordem: 1, tipo: "cenario", label: "Na prática", conteudo: {
        headline: "O Rafael foi convidado para um robô de trade",
        personagem: "Rafael, 32 anos, autônomo",
        linhas: [
          { label: "Entrou com", valor: 5000, tipo: "saida" },
          { label: "Recebeu nos 3 primeiros meses", valor: 1500, tipo: "entrada" },
          { label: "Aportou mais, convencido", valor: 15000, tipo: "saida" }
        ],
        rodape: "Os primeiros pagamentos são a parte mais importante do esquema: eles não são o retorno, são o marketing. Servem para você confiar, aportar mais e trazer gente. Quando o Rafael tentou sacar os R$ 20 mil, o site estava fora do ar." } },
      { ordem: 2, tipo: "quiz", label: "Os sinais", conteudo: {
        headline: "Qual destes é o sinal mais forte de pirâmide?",
        opcoes: [
          { letra: "A", texto: "Promete rendimento fixo alto todo mês", correta: true,
            feedback: "Esse é o sinal definitivo. Nenhum investimento com retorno alto consegue prometer valor fixo: quem promete não está investindo." },
          { letra: "B", texto: "Envolve criptomoeda", correta: false,
            feedback: "Cripto é o disfarce da vez, não a fraude em si. Já foi boi gordo, já foi imóvel na planta. O que denuncia é a promessa, não o produto." },
          { letra: "C", texto: "Você ganha por indicar amigos", correta: true,
            feedback: "Também é sinal forte. Quando a remuneração vem de trazer gente, e não do que o dinheiro rende, você já é parte do mecanismo." },
          { letra: "D", texto: "Tem site bonito e escritório", correta: false,
            feedback: "Aparência não diz nada, e os grandes esquemas brasileiros tinham os dois. Estrutura cara é despesa de marketing, paga com o dinheiro de quem entrou." } ] } },
      { ordem: 3, tipo: "input", label: "Avalie a promessa", conteudo: {
        headline: "Te ofereceram 10% ao mês, garantido",
        subtitulo: "O que isso deveria te dizer, antes de qualquer outra coisa?",
        aviso: "Não tem pegadinha. Escolha o que você faria.",
        campos: [ { id: "reacao", emoji: "🧠", label: "Minha leitura", tipo: "faixa", opcoes: [
          { valor: "bom", rotulo: "Parece bom, vou pesquisar" },
          { valor: "duvida", rotulo: "Desconfio, mas quero entender" },
          { valor: "nao", rotulo: "Não existe. É fraude." } ] } ] } },
      { ordem: 4, tipo: "resultado", label: "Fazendo a conta", conteudo: {
        headline: "10% ao mês são mais de 200% ao ano",
        faixas: [ { condicao: "valor >= 0", cor: "red",
          mensagem: "Se alguém conseguisse isso de forma garantida, não precisaria do seu dinheiro: bastaria pegar emprestado a qualquer taxa do mercado e embolsar a diferença. O fato de precisarem captar com você já responde a pergunta." } ],
        insightDinamico: "Como conferir de verdade, em dois minutos: procure o nome da empresa no site da CVM e no do Banco Central. Quem pode captar dinheiro do público é autorizado, e a autorização é pública. Não achou? A resposta é essa." } },
      { ordem: 5, tipo: "resultado", label: "Levar daqui", conteudo: {
        headline: "Especular não é investir, e nenhum dos dois é apostar",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "Cripto existe, é legal e algumas pessoas ganham dinheiro com ela. Isso não a torna investimento: sem fluxo de caixa, o preço depende só de alguém pagar mais caro depois.\n\nO Finlow não indica ativo nenhum, e quem indica sem ser autorizado pela CVM está cometendo infração — não fazendo um favor." } ],
        insightDinamico: "A regra que evita quase todo prejuízo: dinheiro que você não pode perder não entra em nada que você não saiba explicar para outra pessoa." } },
    ],
  },

  // ======================= M10 — Finfluencer =============================
  {
    slug: "finfluencer-e-a-dica-infalivel",
    titulo: "A dica infalível e quem ganha com ela",
    subtitulo: "Separar conteúdo de propaganda disfarçada.",
    tipoPerfil: "sonhador", ordem: 19, nivel: "intermediario",
    situacoes: [],
    tags: ["finfluencer", "desinformacao", "midia", "publicidade", "vies"],
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "O incentivo", conteudo: {
        headline: "A pergunta não é se a dica é boa. É quem ganha se você seguir",
        corpo: "Todo conteúdo tem um incentivo por trás, e nem sempre ele é ruim. O problema é quando o incentivo é invisível: link de afiliado, comissão por abertura de conta, patrocínio não declarado.\n\nEducação financeira e publicidade podem se parecer muito. A diferença é que uma explica um mecanismo, e a outra encaminha para um produto.",
        insight: { label: "Por que isso pega tanto",
          texto: "Só {{letramento_juros}} conseguem fazer um cálculo de juros simples. Quem não tem como conferir precisa confiar, e é exatamente aí que a confiança vira produto." } } },
      { ordem: 1, tipo: "cenario", label: "Na prática", conteudo: {
        headline: "A Tati seguiu a dica de quem ela achava que era professor",
        personagem: "Tati, 28 anos, enfermeira",
        linhas: [
          { label: "Aplicou onde indicaram", valor: 8000, tipo: "saida" },
          { label: "Sacou seis meses depois", valor: 6400, tipo: "entrada" } ],
        rodape: "O produto não era fraude: era um investimento de risco alto, apresentado como oportunidade e sem uma palavra sobre risco. O canal recebia comissão por cada conta aberta pelo link. Nada ilegal, nada declarado." } },
      { ordem: 2, tipo: "quiz", label: "Educação ou propaganda", conteudo: {
        headline: "O que separa conteúdo educativo de publicidade disfarçada?",
        opcoes: [
          { letra: "A", texto: "Educativo explica o mecanismo; propaganda te leva a um produto", correta: true,
            feedback: "Isso. Conteúdo que ensina serve mesmo que você nunca compre nada. Se a conclusão é sempre um link, era anúncio." },
          { letra: "B", texto: "Educativo é gratuito, propaganda é paga", correta: false,
            feedback: "Quase tudo nas redes é gratuito para quem assiste. Quem paga é o anunciante, e é por isso que o preço não indica nada." },
          { letra: "C", texto: "Educativo tem números, propaganda não", correta: false,
            feedback: "Anúncio bom é cheio de números. O que importa é se eles vêm com a fonte e com o risco, não se existem." },
          { letra: "D", texto: "Educativo é feito por quem tem certificação", correta: false,
            feedback: "Certificação ajuda, mas há conteúdo excelente sem ela e propaganda com ela. O teste do incentivo funciona melhor." } ] } },
      { ordem: 3, tipo: "input", label: "O sinal de alerta", conteudo: {
        headline: "Qual sinal você mais vê por aí?",
        subtitulo: "Todos abaixo são bandeiras vermelhas. Escolha a que mais aparece no seu feed.",
        aviso: "Não tem resposta certa: serve para você reparar.",
        campos: [ { id: "sinal", emoji: "🚩", label: "O que mais vejo", tipo: "faixa", opcoes: [
          { valor: "retorno", rotulo: "Promessa de retorno específico" },
          { valor: "urgencia", rotulo: "Urgência: acaba hoje, últimas vagas" },
          { valor: "semrisco", rotulo: "Nenhuma menção a risco" },
          { valor: "link", rotulo: "Link de cadastro na descrição" } ] } ] } },
      { ordem: 4, tipo: "resultado", label: "O checklist", conteudo: {
        headline: "Quatro perguntas antes de seguir qualquer dica",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "1. Quem ganha se eu fizer isso?\n2. Qual é o risco, dito em voz alta?\n3. A pessoa é autorizada pela CVM a recomendar produto?\n4. A dica serve para qualquer pessoa, ou depende da minha situação?\n\nA quarta é a que mais elimina: nenhuma recomendação séria vale para todo mundo ao mesmo tempo." } ],
        insightDinamico: "E vale saber: recomendar produto específico sem autorização da CVM é infração. Explicar como funciona um investimento é permitido a qualquer um — dizer em qual você deve pôr o seu dinheiro, não." } },
      { ordem: 5, tipo: "resultado", label: "Levar daqui", conteudo: {
        headline: "O conteúdo bom não te apressa",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "Urgência é ferramenta de venda, nunca de ensino. Quem quer que você entenda te dá tempo; quem quer que você compre, não.\n\nSe uma oportunidade só existe hoje, ela não era oportunidade. Era prazo de campanha." } ],
        insightDinamico: "Este app também tem um incentivo, e ele é declarado: o Finlow explica mecanismo e nunca indica onde investir. Quem recomenda produto específico é profissional autorizado pela CVM." } },
    ],
  },

  // ======================= M11 — Orçamento ==============================
  {
    slug: "orcamento-com-renda-que-varia",
    titulo: "Orçamento quando a renda não é fixa",
    subtitulo: "O método muda quando você não sabe quanto entra.",
    tipoPerfil: "lancador", ordem: 20, nivel: "iniciante",
    situacoes: ["renda_variavel", "sem_reserva"],
    tags: ["orcamento", "renda-variavel", "autonomo", "metodo", "pague-se-primeiro"],
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Por que os métodos falham", conteudo: {
        headline: "Quase todo método de orçamento assume salário fixo",
        corpo: "Aquela divisão em porcentagens funciona bem quando entra o mesmo valor todo mês. Com renda que varia, ela quebra: no mês bom sobra e você gasta, no mês ruim falta e você usa o cartão.\n\nPara renda irregular, o que funciona é inverter a lógica. Em vez de dividir o que entrou, você define quanto TIRA — um valor fixo, calculado pela média dos meses ruins — e deixa o excedente numa conta separada, para cobrir os meses fracos.",
        insight: { label: "Não é caso raro",
          texto: "{{sem_controle_orcamento}} não controlam o orçamento, e a informalidade chega a {{informalidade}}. Renda que varia é a regra para muita gente, não a exceção." } } },
      { ordem: 1, tipo: "cenario", label: "Na prática", conteudo: {
        headline: "O Sérgio ganha entre R$ 2.000 e R$ 4.000",
        personagem: "Sérgio, 37 anos, motorista de aplicativo",
        linhas: [
          { label: "Melhor mês do ano", valor: 4100, tipo: "entrada" },
          { label: "Pior mês do ano", valor: 1900, tipo: "entrada" },
          { label: "O que ele passou a tirar por mês", valor: 2200, tipo: "saldo" } ],
        rodape: "Ele parou de gastar conforme entrava e passou a se pagar R$ 2.200 fixos, um pouco acima do pior mês. O que entra além disso fica numa conta separada e cobre os meses fracos. O mês ruim deixou de ser emergência." } },
      { ordem: 2, tipo: "quiz", label: "Qual método", conteudo: {
        headline: "Com renda que varia, o que funciona melhor?",
        opcoes: [
          { letra: "A", texto: "Dividir cada entrada em porcentagens fixas", correta: false,
            feedback: "Com renda variável, a porcentagem do mês bom te acostuma a um padrão que o mês ruim não sustenta." },
          { letra: "B", texto: "Tirar um valor fixo por mês, calculado pelo pior mês", correta: true,
            feedback: "Isso. Você vira seu próprio empregador e se paga um salário. O excedente do mês bom vira o colchão do mês ruim." },
          { letra: "C", texto: "Gastar pouco em tudo, o tempo todo", correta: false,
            feedback: "Aperto permanente não é método, é desgaste. Ele funciona algumas semanas e depois estoura." },
          { letra: "D", texto: "Esperar a renda estabilizar para organizar", correta: false,
            feedback: "É a ordem invertida. O método é justamente o que estabiliza — a renda pode continuar variando para sempre." } ] } },
      { ordem: 3, tipo: "input", label: "Seus números", conteudo: {
        headline: "Dois números pra montar o esqueleto",
        subtitulo: "A média do que entra e o que você gasta com o essencial num mês.",
        aviso: "Fica só nesta tela, no seu aparelho. Não é gravado em lugar nenhum.",
        campos: [
          { id: "rendaMedia", emoji: "📈", label: "Média do que entra", placeholder: "3000", tipo: "decimal" },
          { id: "gastoFixo", emoji: "🏠", label: "Essencial do mês", placeholder: "1900", tipo: "decimal" } ] } },
      { ordem: 4, tipo: "resultado", label: "Seu esqueleto", conteudo: {
        headline: "O essencial come <strong>{pctMeta}%</strong>. Sobram <strong>{sobra}</strong>.",
        formula: "orcamento_esqueleto",
        faixas: [
          { condicao: "pctMeta >= 80", cor: "red",
            mensagem: "Com o essencial acima de 80%, não há método que resolva sozinho: o caminho é mexer numa conta fixa grande, ou na renda. Método organiza; ele não cria dinheiro." },
          { condicao: "pctMeta >= 60", cor: "yellow",
            mensagem: "É apertado mas administrável. A ordem que funciona: primeiro separa o que vai guardar, depois vive com o resto — nunca o contrário." },
          { condicao: "valor > 0", cor: "green",
            mensagem: "Você tem folga real. O risco aqui não é faltar: é a folga sumir sem você perceber para onde foi." } ],
        insightDinamico: "A regra do pague-se primeiro: no dia em que o dinheiro entra, a primeira transferência é para você. O que sobra é o orçamento do mês — e não o contrário, que é como quase todo mundo faz." } },
      { ordem: 5, tipo: "resultado", label: "Levar daqui", conteudo: {
        headline: "Um salário para você, pago por você",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "Defina um valor fixo mensal, um pouco acima do seu pior mês. Tire só ele. O que entrar além fica separado e cobre os meses fracos.\n\nCom o tempo, esse valor sobe. Mas ele sobe por decisão sua, não porque um mês foi bom." } ],
        insightDinamico: "Quem tem renda variável precisa de mais reserva que quem tem salário fixo, não de menos: o colchão faz o papel que a previsibilidade faria." } },
    ],
  },

  // ======================= M12 — Fricção do registro ====================
  {
    slug: "por-que-voce-larga-a-planilha",
    titulo: "Por que você larga em duas semanas",
    subtitulo: "O problema é o atrito, não a sua disciplina.",
    tipoPerfil: "lancador", ordem: 21, nivel: "iniciante",
    situacoes: [],
    tags: ["habito", "registro", "planilha", "atrito", "comportamento", "constancia"],
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "O que acontece", conteudo: {
        headline: "Você não desistiu por preguiça. Desistiu porque custava caro",
        corpo: "Registrar gasto numa planilha custa: abrir o arquivo, lembrar a categoria, digitar, salvar. Um minuto, talvez dois. Parece nada — mas é um minuto multiplicado por várias vezes ao dia, todo dia, para um benefício que só aparece no fim do mês.\n\nÉ o pior desenho possível para o cérebro humano: custo imediato, recompensa distante. Não existe força de vontade que segure isso por muito tempo, e não deveria mesmo.",
        insight: { label: "A pergunta certa",
          texto: "Não é 'como eu me disciplino mais'. É 'como eu faço isso custar menos'. Todo método que dura resolveu a segunda pergunta." } } },
      { ordem: 1, tipo: "cenario", label: "Na prática", conteudo: {
        headline: "A Fernanda abandonou três aplicativos",
        personagem: "Fernanda, 33 anos, arquiteta",
        linhas: [
          { label: "Primeira tentativa, durou", valor: 18, tipo: "saldo" },
          { label: "Segunda, com app mais completo", valor: 11, tipo: "saldo" },
          { label: "Terceira, com planilha própria", valor: 6, tipo: "saldo" } ],
        rodape: "Dias, não reais. Cada tentativa durou MENOS que a anterior, e a razão é contraintuitiva: cada ferramenta era mais completa que a última. Mais campos, mais categorias, mais atrito." } },
      { ordem: 2, tipo: "quiz", label: "O que reduz o atrito", conteudo: {
        headline: "O que faz um registro sobreviver a dois meses?",
        opcoes: [
          { letra: "A", texto: "Categorizar tudo com precisão", correta: false,
            feedback: "Precisão é o principal inimigo da constância. Categoria errada e valor aproximado servem; planilha abandonada não serve para nada." },
          { letra: "B", texto: "Levar menos de trinta segundos", correta: true,
            feedback: "Isso. Abaixo de meio minuto, o registro cabe na vida real — no ônibus, na fila, esperando o café." },
          { letra: "C", texto: "Fazer uma vez por semana, com calma", correta: false,
            feedback: "Semanal parece mais fácil e é mais difícil: você não lembra dos gastos pequenos, e a sessão vira uma tarefa grande que dá para adiar." },
          { letra: "D", texto: "Estar preso a algo que você já faz todo dia", correta: true,
            feedback: "Também certo. Hábito novo pega carona em hábito velho: depois do café, na fila do almoço, ao deitar." } ] } },
      { ordem: 3, tipo: "input", label: "Seu gancho", conteudo: {
        headline: "Quando você vai fazer o seu check de trinta segundos?",
        subtitulo: "Escolha um momento que já existe no seu dia. O horário importa menos que ele ser fixo.",
        aviso: "Escolha o que for verdade pra você, não o que parece mais certo.",
        campos: [ { id: "momento", emoji: "⏰", label: "Meu momento", tipo: "faixa", opcoes: [
          { valor: "manha", rotulo: "De manhã, com o café" },
          { valor: "almoco", rotulo: "Na pausa do almoço" },
          { valor: "volta", rotulo: "Na volta pra casa" },
          { valor: "noite", rotulo: "Antes de dormir" } ] } ] } },
      { ordem: 4, tipo: "resultado", label: "A conta do esforço", conteudo: {
        headline: "Trinta segundos por dia ganham de uma hora por mês",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "Não porque somam mais tempo — somam menos. Ganham porque acontecem.\n\nA planilha caprichada de uma hora tem duas propriedades ruins: é fácil de adiar, e quando você adia duas vezes, ela vira uma dívida de trabalho que ninguém quer pagar." } ],
        insightDinamico: "Comece pelo mínimo que você consegue manter numa semana ruim, não numa semana boa. É a semana ruim que decide se o hábito sobrevive." } },
      { ordem: 5, tipo: "resultado", label: "Levar daqui", conteudo: {
        headline: "Aproximado e feito ganha de exato e abandonado",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "Você não precisa registrar centavo. Precisa saber a ordem de grandeza: quanto foi para comida, quanto foi para transporte, quanto foi para o resto.\n\nO Finlow foi desenhado para isso: você conta no chat, ele entende, e você confirma. É o registro mais barato que consegui imaginar." } ],
        insightDinamico: "E se falhar um dia, não recomeça do zero. Falhar um dia é normal; tratar a falha como fracasso é o que faz parar de vez." } },
    ],
  },
  // ======================= M13 — Formalização ===========================
  {
    slug: "mei-autonomo-e-inss",
    titulo: "MEI, autônomo e a aposentadoria",
    subtitulo: "O que muda ao formalizar, e o que você perde sem contribuir.",
    tipoPerfil: "lancador", ordem: 22, nivel: "intermediario",
    situacoes: ["renda_variavel"],
    tags: ["mei", "autonomo", "inss", "das", "aposentadoria", "nota-fiscal", "cnpj"],
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "O que muda", conteudo: {
        headline: "Formalizar é trocar informalidade por três coisas concretas",
        corpo: "CNPJ para emitir nota, uma alíquota fixa mensal no lugar de imposto sobre cada serviço, e cobertura previdenciária — aposentadoria, auxílio-doença, salário-maternidade.\n\nO MEI paga o DAS, uma guia única e barata, todo mês. Quem não formaliza e não contribui como autônomo não acumula tempo: continua trabalhando, mas sem nada por trás se ficar doente ou parar.",
        insight: { label: "O tamanho e o buraco",
          texto: "São {{mei_total}} no Brasil, mas {{mei_inadimplente_das}}. Guia atrasada não conta tempo de contribuição — é o erro mais caro e mais silencioso do MEI." } } },
      { ordem: 1, tipo: "cenario", label: "Na prática", conteudo: {
        headline: "A Luana trabalha há 12 anos e tem zero de contribuição",
        personagem: "Luana, 35 anos, manicure",
        linhas: [
          { label: "Fatura por mês, em média", valor: 3200, tipo: "entrada" },
          { label: "Custo do DAS se fosse MEI", valor: 76, tipo: "saida" },
          { label: "Tempo de contribuição acumulado", valor: 0, tipo: "saldo" } ],
        rodape: "Doze anos de trabalho que não contam para nada. O valor mensal que resolveria isso é menor do que ela gasta com transporte numa semana — o problema nunca foi o preço, foi ninguém ter explicado o que estava em jogo." } },
      { ordem: 2, tipo: "quiz", label: "O que o DAS cobre", conteudo: {
        headline: "Pagar o DAS do MEI garante o quê?",
        opcoes: [
          { letra: "A", texto: "Só o imposto, nada de Previdência", correta: false,
            feedback: "A maior parte do DAS é justamente a contribuição previdenciária. É ela que garante o benefício." },
          { letra: "B", texto: "Aposentadoria por idade, auxílio-doença e salário-maternidade", correta: true,
            feedback: "Isso. Com o DAS em dia você tem cobertura previdenciária básica. A aposentadoria do MEI é por idade e no valor de um salário mínimo." },
          { letra: "C", texto: "Aposentadoria por tempo de contribuição", correta: false,
            feedback: "Não com a alíquota padrão do MEI. Para contar tempo integral é preciso complementar a contribuição." },
          { letra: "D", texto: "FGTS e férias", correta: false,
            feedback: "Esses são direitos de vínculo CLT. MEI não tem patrão, então não tem FGTS nem férias remuneradas." } ] } },
      { ordem: 3, tipo: "input", label: "Seu faturamento", conteudo: {
        headline: "Quanto você fatura por mês, em média?",
        subtitulo: "O total que entra pelo trabalho, antes de descontar material e custos.",
        aviso: "Fica só nesta tela, no seu aparelho. Não é gravado em lugar nenhum.",
        campos: [ { id: "faturamento", emoji: "💼", label: "Faturamento mensal", placeholder: "3200", tipo: "decimal" } ] } },
      { ordem: 4, tipo: "resultado", label: "Cabe no MEI?", conteudo: {
        headline: "No ano isso dá <strong>{anual}</strong>.",
        formula: "mei_cabe",
        faixas: [
          { condicao: "cabe > 0", cor: "green",
            mensagem: "Cabe no MEI. O teto é anual, não mensal — o que importa é a soma dos doze meses, então um mês forte não desenquadra ninguém." },
          { condicao: "valor > 0", cor: "yellow",
            mensagem: "Passa do teto do MEI. O caminho seria Microempresa, com contabilidade e alíquota diferentes. Vale conversar com um contador antes de decidir." } ],
        insightDinamico: "O teto do MEI é {{teto_mei}}. E o custo mensal é uma guia fixa e baixa, que não sobe quando você fatura mais — dentro do teto." } },
      { ordem: 5, tipo: "resultado", label: "Levar daqui", conteudo: {
        headline: "A guia em dia é o que vira tempo",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "DAS atrasado não conta como contribuição, e é aí que quase 7 milhões de MEIs estão. Programe o débito automático: é o tipo de coisa que ninguém esquece por desleixo, esquece porque a vida acontece.\n\nSe você não é MEI e não contribui, dá para contribuir como autônomo pelo GPS, sem abrir empresa." } ],
        insightDinamico: "Regra tributária muda todo ano. Este módulo explica o mecanismo; os valores e alíquotas de hoje você confere no Portal do Empreendedor antes de decidir." } },
    ],
  },

  // ======================= M14 — Renda extra ============================
  {
    slug: "renda-extra-precificar",
    titulo: "Quanto cobrar sem trabalhar de graça",
    subtitulo: "Preço não é chute: é custo mais tempo mais margem.",
    tipoPerfil: "lancador", ordem: 23, nivel: "intermediario",
    situacoes: ["renda_variavel"],
    tags: ["renda-extra", "precificacao", "bico", "revenda", "autonomo", "preco"],
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "O que entra no preço", conteudo: {
        headline: "Quase todo mundo esquece de cobrar o próprio tempo",
        corpo: "O preço mínimo tem três partes: o que você gastou de material, o tempo que levou, e uma margem para o negócio existir.\n\nA parte esquecida é sempre a segunda. Quando você cobra só o material mais um pouco, está trabalhando de graça e chamando isso de lucro — e como o dinheiro entra, demora meses para perceber.",
        insight: { label: "Não é impressão",
          texto: "Quem trabalha por aplicativo ganha em média {{rendimento_app}}, com renda por hora 8,3% menor que a dos demais trabalhadores. Tempo mal precificado tem escala nacional." } } },
      { ordem: 1, tipo: "cenario", label: "Na prática", conteudo: {
        headline: "A Camila vendia bolo no prejuízo e não sabia",
        personagem: "Camila, 31 anos, confeiteira nas horas vagas",
        linhas: [
          { label: "Cobrava por bolo", valor: 60, tipo: "entrada" },
          { label: "Ingredientes", valor: 32, tipo: "saida" },
          { label: "Gás, energia, embalagem", valor: 8, tipo: "saida" },
          { label: "Sobrava", valor: 20, tipo: "saldo" } ],
        rodape: "Vinte reais por três horas de trabalho: menos de R$ 7 por hora. Ela não estava lucrando pouco — estava se pagando abaixo de qualquer piso, e o negócio parecia dar certo porque o dinheiro entrava." } },
      { ordem: 2, tipo: "input", label: "Seu produto", conteudo: {
        headline: "Pensa num produto ou serviço que você faz",
        subtitulo: "Quanto custa o material, quanto tempo leva, e quanto vale a sua hora.",
        aviso: "Fica só nesta tela, no seu aparelho. Não é gravado em lugar nenhum.",
        campos: [
          { id: "custoMaterial", emoji: "📦", label: "Material e custos", placeholder: "40", tipo: "decimal" },
          { id: "horas", emoji: "⏱️", label: "Horas que leva", placeholder: "3", tipo: "decimal" },
          { id: "valorHora", emoji: "💪", label: "Quanto vale sua hora", placeholder: "30", tipo: "decimal" } ] } },
      { ordem: 3, tipo: "resultado", label: "Seu piso", conteudo: {
        headline: "Abaixo de <strong>{preco}</strong> você está pagando pra trabalhar.",
        formula: "preco_minimo",
        faixas: [ { condicao: "precoNum > 0", cor: "green",
          mensagem: "Esse é o PISO, não o preço. Ele cobre material e o seu tempo, e não deixa nada para o negócio crescer, para o imprevisto ou para o imposto." } ],
        insightDinamico: "O preço de venda fica acima do piso. Quanto acima depende do que o mercado paga e do que você entrega de diferente — mas nunca abaixo, porque abaixo do piso cada venda te empobrece." } },
      { ordem: 4, tipo: "quiz", label: "PF e PJ", conteudo: {
        headline: "Por que misturar a conta pessoal com a do trabalho atrapalha?",
        opcoes: [
          { letra: "A", texto: "Porque é proibido", correta: false,
            feedback: "Não é proibido para autônomo. Atrapalha por outro motivo, mais prático." },
          { letra: "B", texto: "Porque você não sabe se o negócio dá lucro", correta: true,
            feedback: "Isso. Com tudo junto, o dinheiro do cliente vira dinheiro do mercado e você nunca sabe se ganhou ou perdeu no mês." },
          { letra: "C", texto: "Porque o banco cobra mais caro", correta: false,
            feedback: "Tarifa é detalhe. O problema real é não enxergar o resultado do que você faz." },
          { letra: "D", texto: "Porque atrapalha o imposto de renda", correta: true,
            feedback: "Também. Na hora de declarar ou de justificar movimentação, separar economiza tempo e evita explicação difícil." } ] } },
      { ordem: 5, tipo: "resultado", label: "Levar daqui", conteudo: {
        headline: "Duas contas, e uma reserva do negócio",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "Uma conta recebe o que os clientes pagam. Dali sai o material, e uma parte fica como reserva do trabalho — para o equipamento que quebra, o mês fraco, o imposto.\n\nO que sobra você transfere para a sua conta pessoal. Isso é o seu salário, e ele passa a ser um número que você conhece." } ],
        insightDinamico: "Preço baixo demais não traz cliente fiel: traz cliente que some quando alguém cobra menos. Quem compra por preço vai embora por preço." } },
    ],
  },

  // ======================= M15 — Imposto de renda =======================
  {
    slug: "imposto-de-renda-sem-susto",
    titulo: "Preciso declarar imposto de renda?",
    subtitulo: "Quem declara, o que deduz e como não cair na malha.",
    tipoPerfil: "guardador", ordem: 24, nivel: "intermediario",
    situacoes: [],
    tags: ["irpf", "declaracao", "isencao", "dependentes", "deducao", "malha-fina"],
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Declarar x pagar", conteudo: {
        headline: "Declarar e pagar são coisas diferentes",
        corpo: "Muita gente que declara não paga nada, e muita gente que não é obrigada a declarar deveria — porque tem imposto retido a devolver.\n\nA obrigação depende de renda no ano, bens, atividade rural e algumas outras situações. A isenção depende da faixa. São dois testes distintos, e confundi-los é o erro mais comum.",
        insight: { label: "O que mudou",
          texto: "Desde janeiro de 2026, quem ganha até {{isencao_ir}} ficou isento do imposto na fonte, o que alcançou cerca de 16 milhões de contribuintes." } } },
      { ordem: 1, tipo: "cenario", label: "Na prática", conteudo: {
        headline: "O Ricardo achou que não precisava declarar",
        personagem: "Ricardo, 39 anos, dois filhos",
        linhas: [
          { label: "Imposto retido na fonte no ano", valor: 1840, tipo: "saida" },
          { label: "Devido, depois das deduções", valor: 620, tipo: "saldo" },
          { label: "Restituição que ele quase perdeu", valor: 1220, tipo: "entrada" } ],
        rodape: "Ele tinha dois dependentes e despesas de saúde que nunca informou. Não declarar não economizou nada — só deixou com a Receita um dinheiro que era dele." } },
      { ordem: 2, tipo: "quiz", label: "O que deduz", conteudo: {
        headline: "O que pode ser deduzido na declaração completa?",
        opcoes: [
          { letra: "A", texto: "Saúde, educação, dependentes e pensão alimentícia judicial", correta: true,
            feedback: "Isso. Saúde não tem teto; educação e dependentes têm limites anuais. Pensão só a fixada judicialmente." },
          { letra: "B", texto: "Aluguel que você paga", correta: false,
            feedback: "Aluguel pago não deduz. Aluguel RECEBIDO, por outro lado, é renda tributável." },
          { letra: "C", texto: "Supermercado e contas de casa", correta: false,
            feedback: "Despesa de consumo não entra. A lógica das deduções é outra: saúde, educação e dependentes." },
          { letra: "D", texto: "Financiamento do imóvel", correta: false,
            feedback: "A parcela não deduz. O imóvel entra na declaração de bens pelo valor pago, o que é coisa diferente." } ] } },
      { ordem: 3, tipo: "input", label: "Sua situação", conteudo: {
        headline: "Quanto você recebe por mês?",
        subtitulo: "Some tudo que é tributável: salário, pró-labore, aluguel recebido, aposentadoria.",
        aviso: "Fica só nesta tela, no seu aparelho. Não é gravado em lugar nenhum.",
        campos: [ { id: "rendaMes", emoji: "💰", label: "Renda mensal", placeholder: "4200", tipo: "decimal" } ] } },
      { ordem: 4, tipo: "resultado", label: "A faixa", conteudo: {
        headline: "Com <strong>R$ {valor}</strong> por mês:",
        formula: "ir_isencao",
        faixas: [
          { condicao: "cabe > 0", cor: "green",
            mensagem: "Você está na faixa de isenção do imposto retido na fonte. Isso NÃO quer dizer que está dispensado de declarar: obrigação de declarar e isenção de pagar são testes diferentes, e vale conferir os dois." },
          { condicao: "valor > 0", cor: "yellow",
            mensagem: "Acima da faixa de isenção, há imposto retido. Nesse caso as deduções são o que decide se você recebe restituição ou paga a diferença." } ],
        insightDinamico: "A isenção hoje é para quem ganha até {{isencao_ir}}. As regras e os limites mudam todo ano — este módulo explica o mecanismo, e os números do ano você confere no site da Receita." } },
      { ordem: 5, tipo: "resultado", label: "Levar daqui", conteudo: {
        headline: "Guardar comprovante durante o ano é metade do trabalho",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "Uma pasta, física ou no celular, com recibo de saúde, boleto de escola e informe de rendimento. Em março isso vira meia hora em vez de um fim de semana.\n\nE o que mais cai na malha é bobagem: valor de saúde diferente do que o profissional declarou, dependente informado por duas pessoas, renda esquecida de um trabalho antigo." } ],
        insightDinamico: "Isto aqui não é assessoria contábil. Para caso complicado — vários rendimentos, empresa, ganho de capital, exterior — meia hora com um contador custa menos que uma malha fina." } },
    ],
  },

  // ======================= M16 — Dinheiro a dois ========================
  {
    slug: "dinheiro-a-dois-e-com-filhos",
    titulo: "Dinheiro a dois",
    subtitulo: "A conversa que evita a maior fonte de briga do casal.",
    tipoPerfil: "guardador", ordem: 25, nivel: "intermediario",
    situacoes: ["dependentes"],
    tags: ["casal", "familia", "filhos", "orcamento-familiar", "divisao", "mesada"],
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Por que dá briga", conteudo: {
        headline: "Quase sempre a briga não é sobre o valor, é sobre a surpresa",
        corpo: "Casais brigam menos por gastar demais e mais por descobrir depois. Uma compra combinada, mesmo grande, raramente vira discussão; uma pequena escondida, quase sempre.\n\nO que resolve não é gastar menos: é ter um lugar onde os números ficam à vista, e um combinado sobre o que precisa de conversa antes.",
        insight: { label: "O tamanho disso",
          texto: "{{brigas_por_dinheiro}} dizem que dinheiro é o principal motivo de briga no relacionamento, e quase metade já escondeu um problema financeiro do parceiro." } } },
      { ordem: 1, tipo: "cenario", label: "Na prática", conteudo: {
        headline: "A Renata e o Paulo dividiam tudo meio a meio",
        personagem: "Renata e Paulo, 33 e 36, dois filhos",
        linhas: [
          { label: "Ela ganha", valor: 2800, tipo: "entrada" },
          { label: "Ele ganha", valor: 5200, tipo: "entrada" },
          { label: "Cada um pagava, das contas de casa", valor: 1900, tipo: "saida" } ],
        rodape: "Meio a meio parece justo e não é: os R$ 1.900 eram 68% do que ela ganhava e 37% do que ele ganhava. Ela vivia apertada e ele achava que estavam no mesmo barco." } },
      { ordem: 2, tipo: "quiz", label: "Como dividir", conteudo: {
        headline: "Com rendas diferentes, qual divisão costuma funcionar?",
        opcoes: [
          { letra: "A", texto: "Meio a meio, porque é igual", correta: false,
            feedback: "Igual não é justo quando as rendas são diferentes: o mesmo valor pesa muito mais no bolso menor." },
          { letra: "B", texto: "Proporcional à renda de cada um", correta: true,
            feedback: "Isso. Cada um entra com a mesma FATIA do que ganha, e assim sobra proporcionalmente o mesmo para os dois." },
          { letra: "C", texto: "Quem ganha mais paga tudo", correta: false,
            feedback: "Cria dependência de um lado e peso de decisão do outro. Costuma virar fonte de conflito, não solução." },
          { letra: "D", texto: "Cada um paga contas específicas", correta: false,
            feedback: "Funciona no começo e desanda quando as contas mudam de valor. É divisão sem regra, e regra é o que evita a discussão." } ] } },
      { ordem: 3, tipo: "input", label: "As duas rendas", conteudo: {
        headline: "Quanto entra de cada lado?",
        subtitulo: "A renda líquida de cada um, o que efetivamente cai na conta.",
        aviso: "Fica só nesta tela, no seu aparelho. Não é gravado em lugar nenhum.",
        campos: [
          { id: "rendaA", emoji: "🙋", label: "Renda de quem ganha mais", placeholder: "5200", tipo: "decimal" },
          { id: "rendaB", emoji: "🙋‍♂️", label: "Renda de quem ganha menos", placeholder: "2800", tipo: "decimal" } ] } },
      { ordem: 4, tipo: "resultado", label: "A divisão justa", conteudo: {
        headline: "A conta proporcional dá <strong>{pctA}%</strong> e <strong>{pctB}%</strong>.",
        formula: "divisao_casal",
        faixas: [ { condicao: "valor > 0", cor: "green",
          mensagem: "Das despesas comuns, cada um entra com essa fatia. Não é caridade nem dependência: é a mesma proporção de esforço dos dois lados, e é isso que faz sobrar o mesmo para cada um." } ],
        insightDinamico: "O resto de cada renda continua sendo de cada um, sem prestação de contas. A parte que é comum fica clara; a parte que é sua continua sua — e é justamente isso que faz o combinado durar." } },
      { ordem: 5, tipo: "resultado", label: "E os filhos", conteudo: {
        headline: "Mesada não é presente, é aula",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "Valor pequeno, data fixa, e liberdade real de errar. Criança que só pode gastar com o que os pais aprovam não está aprendendo a decidir — está executando decisão dos outros.\n\nO erro barato aos oito anos é o que evita o caro aos vinte e oito." } ],
        insightDinamico: "E sobre pensão, se for o caso: o valor sai do binômio necessidade de quem recebe e possibilidade de quem paga. Não existe percentual automático em lei, apesar de a prática girar em torno de 20% a 30% da renda líquida." } },
    ],
  },

  // ======================= M17 — Metas grandes ==========================
  {
    slug: "metas-grandes-do-adulto",
    titulo: "Da entrada do apê ao casamento",
    subtitulo: "Transformar um desejo grande em valor, prazo e aporte.",
    tipoPerfil: "sonhador", ordem: 26, nivel: "intermediario",
    situacoes: ["financiamento", "sem_reserva"],
    tags: ["meta", "entrada-imovel", "carro", "casamento", "planejamento", "aporte"],
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "O que falta", conteudo: {
        headline: "Meta sem número é desejo, e desejo não entra na conta do mês",
        corpo: "Toda meta grande precisa de três coisas: valor, prazo e aporte mensal. Faltando qualquer uma, ela não compete com os gastos do dia a dia — e perde sempre, porque o presente sempre grita mais alto.\n\nO aporte é o que transforma a meta em item do orçamento. Enquanto ela for 'um dia', ela nunca disputa espaço com nada.",
        insight: { label: "Onde as pessoas param",
          texto: "{{pouparam_no_ano}} conseguiram poupar no último ano, mas só uma pequena parte transformou isso em algo com destino. Poupar sem meta costuma virar dinheiro reabsorvido pelo mês seguinte." } } },
      { ordem: 1, tipo: "cenario", label: "Na prática", conteudo: {
        headline: "A Bianca queria dar entrada num apê em três anos",
        personagem: "Bianca, 30 anos, analista",
        linhas: [
          { label: "Entrada que ela precisa", valor: 60000, tipo: "saldo" },
          { label: "Dividido por 36 meses", valor: 1667, tipo: "saida" },
          { label: "O que ela consegue guardar hoje", valor: 900, tipo: "entrada" } ],
        rodape: "A conta não fechou, e isso é informação, não fracasso. Com R$ 900 por mês, a mesma entrada leva 67 meses. Ela escolheu esticar para cinco anos e continuar — em vez de descobrir no terceiro ano que não ia dar." } },
      { ordem: 2, tipo: "input", label: "Sua meta", conteudo: {
        headline: "Escolhe uma, a que mais te puxa",
        subtitulo: "Quanto custa, e em quantos meses você quer chegar lá.",
        aviso: "Fica só nesta tela, no seu aparelho. Não é gravado em lugar nenhum.",
        campos: [
          { id: "custo", emoji: "🎯", label: "Quanto custa", placeholder: "60000", tipo: "decimal" },
          { id: "meses", emoji: "📅", label: "Em quantos meses", placeholder: "36", tipo: "decimal" } ] } },
      { ordem: 3, tipo: "resultado", label: "O aporte", conteudo: {
        headline: "São <strong>{porMes}</strong> por mês.",
        formula: "sonhador_por_mes",
        faixas: [ { condicao: "porMesNum > 0", cor: "green",
          mensagem: "Esse é o número que decide tudo. Ou ele cabe no seu mês, ou a meta precisa mudar de prazo, de tamanho, ou você precisa de renda extra. Não existe quarta opção." } ],
        insightDinamico: "E ele é conservador de propósito: não contei rendimento nenhum. Se o dinheiro render, você chega antes — o que é uma surpresa boa. O contrário, planejar contando com rendimento que não veio, é a surpresa ruim." } },
      { ordem: 4, tipo: "quiz", label: "Quando não cabe", conteudo: {
        headline: "O aporte não cabe no seu mês. O que fazer?",
        opcoes: [
          { letra: "A", texto: "Esticar o prazo", correta: true,
            feedback: "É o ajuste mais simples e o menos doloroso. Dois anos a mais com aporte que cabe vence três anos com aporte que você abandona no segundo mês." },
          { letra: "B", texto: "Manter o plano e torcer", correta: false,
            feedback: "É o caminho que mais desanima: você falha todo mês contra uma régua impossível, e desiste achando que o problema é você." },
          { letra: "C", texto: "Cortar um gasto grande e recorrente", correta: true,
            feedback: "Também vale, e rende mais que cortar vários pequenos. Um aluguel, um carro, uma assinatura cara mexem mais que dez cafés." },
          { letra: "D", texto: "Financiar o valor todo", correta: false,
            feedback: "Financiar a entrada é trocar uma meta por uma dívida. O juro faz o objetivo custar bem mais do que ele custa hoje." } ] } },
      { ordem: 5, tipo: "resultado", label: "Levar daqui", conteudo: {
        headline: "Uma meta por vez, com data no calendário",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "Três metas ao mesmo tempo é o mesmo que nenhuma: o aporte se divide, nenhuma anda visivelmente, e você desiste das três.\n\nEscolhe uma. Bota o aporte no automático no dia em que o dinheiro entra. E revisa a cada três meses, não todo dia." } ],
        insightDinamico: "Importante: a reserva de emergência vem antes da meta. Sem colchão, o primeiro imprevisto consome o que você juntou — e aí a meta volta ao zero junto com a motivação." } },
    ],
  },
  // ======================= M18 — Consignado e FGTS ======================
  {
    slug: "consignado-emprestimo-e-fgts",
    titulo: "Crédito que salva e crédito que afunda",
    subtitulo: "Trocar dívida cara por barata, sem cair na armadilha.",
    tipoPerfil: "lancador", ordem: 27, nivel: "intermediario",
    situacoes: ["divida_rotativa", "financiamento"],
    tags: ["consignado", "emprestimo", "fgts", "credito", "cet", "troca-de-divida"],
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Nem todo crédito é igual", conteudo: {
        headline: "A diferença entre os créditos é maior que a diferença entre gastar e não gastar",
        corpo: "Consignado é desconto direto na folha: como o risco de calote é baixo, o juro é o menor do mercado. Crédito pessoal sem garantia custa várias vezes mais. Rotativo custa várias vezes o crédito pessoal.\n\nQuem tem dívida cara e acesso a crédito barato tem uma jogada disponível que quase ninguém faz: trocar uma pela outra. O total devido não muda; o que cresce em cima dele, sim.",
        insight: { label: "A distância entre eles",
          texto: "Consignado CLT ficava em {{consignado_clt}}. Crédito pessoal comum, perto de {{credito_pessoal}}. E o rotativo do cartão, {{rotativo_medio}}." } } },
      { ordem: 1, tipo: "cenario", label: "Na prática", conteudo: {
        headline: "O Marcos trocou o rotativo por consignado",
        personagem: "Marcos, 38 anos, CLT",
        linhas: [
          { label: "Saldo que rolava no cartão", valor: 5000, tipo: "saldo" },
          { label: "Juro que corria por mês", valor: 750, tipo: "saida" },
          { label: "Juro no consignado", valor: 160, tipo: "saida" } ],
        rodape: "A dívida continuou sendo R$ 5.000. O que mudou foi o quanto ela crescia por mês. Trocar não apaga dívida — para de fazer ela correr." } },
      { ordem: 2, tipo: "input", label: "Sua dívida", conteudo: {
        headline: "Qual dívida você tem hoje?",
        subtitulo: "O saldo devedor e a taxa mensal que ela cobra. A taxa está no extrato ou na fatura.",
        aviso: "Fica só nesta tela, no seu aparelho. Não é gravado em lugar nenhum.",
        campos: [
          { id: "saldo", emoji: "💳", label: "Saldo devedor", placeholder: "5000", tipo: "decimal" },
          { id: "taxaAtual", emoji: "📈", label: "Taxa ao mês (%)", placeholder: "15", tipo: "decimal" } ] } },
      { ordem: 3, tipo: "resultado", label: "A troca", conteudo: {
        headline: "Trocar pelo consignado economizaria <strong>{economia}</strong> por mês.",
        formula: "troca_divida",
        faixas: [
          { condicao: "cabe > 0", cor: "green",
            mensagem: "A troca faz sentido pela taxa. Mas só vale se o dinheiro novo QUITAR a dívida antiga — pegar consignado e manter o cartão rolando é ficar com as duas." },
          { condicao: "valor > 0", cor: "yellow",
            mensagem: "A sua taxa já está próxima ou abaixo do consignado. Nesse caso a troca não compensa: o ganho seria pequeno e você criaria um novo compromisso." } ],
        insightDinamico: "E compare sempre pelo CET, não pela taxa nem pela parcela. O CET inclui tarifa, seguro e IOF — é o único número que dá para comparar entre bancos." } },
      { ordem: 4, tipo: "quiz", label: "Quando vira armadilha", conteudo: {
        headline: "Quando o consignado ou o FGTS deixam de ser boa ideia?",
        opcoes: [
          { letra: "A", texto: "Quando o crédito barato vira consumo, não quitação", correta: true,
            feedback: "Esse é o desvio mais comum. O consignado foi tomado para trocar dívida, o dinheiro caiu na conta e virou outra coisa — e agora são duas dívidas." },
          { letra: "B", texto: "Quando antecipa o saque-aniversário do FGTS", correta: true,
            feedback: "Também. Ao aderir, você troca o saque em caso de demissão por parcelas anuais antecipadas. Se for demitido, o dinheiro que existiria para te segurar está comprometido." },
          { letra: "C", texto: "Quando a parcela cabe no orçamento", correta: false,
            feedback: "Caber é requisito mínimo, não sinal de alerta. O alerta é a parcela caber e o total ser maior do que você percebe." },
          { letra: "D", texto: "Quando o prazo é curto", correta: false,
            feedback: "Prazo curto costuma ser melhor: parcela maior, juro total menor. O perigoso é o prazo longo com parcela pequena." } ] } },
      { ordem: 5, tipo: "resultado", label: "Levar daqui", conteudo: {
        headline: "Três perguntas antes de assinar",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "1. Qual é o CET? Não a taxa, não a parcela.\n2. Esse dinheiro vai QUITAR a dívida cara hoje, ou só entrar na conta?\n3. Se eu perder o emprego, o que acontece com essa parcela e com o meu FGTS?\n\nSe a terceira não tem resposta boa, o crédito é caro mesmo com juro baixo." } ],
        insightDinamico: "Regras de consignado e FGTS mudam com frequência. Este módulo explica o mecanismo; os limites e percentuais do momento você confere antes de contratar." } },
    ],
  },

  // ======================= M19 — Financiamento ==========================
  {
    slug: "financiamento-price-ou-sac",
    titulo: "Price ou SAC no financiamento",
    subtitulo: "Parcela fixa ou decrescente, e quando vale amortizar.",
    tipoPerfil: "guardador", ordem: 28, nivel: "intermediario",
    situacoes: ["financiamento"],
    tags: ["financiamento", "price", "sac", "amortizacao", "imovel", "cet"],
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Os dois sistemas", conteudo: {
        headline: "A diferença não é a taxa, é como a dívida é devolvida",
        corpo: "No Price, a parcela é fixa do começo ao fim. Nas primeiras, quase tudo é juro e quase nada abate a dívida.\n\nNo SAC, você devolve sempre o mesmo pedaço da dívida, e o juro incide sobre um saldo que cai. A parcela começa mais alta e diminui todo mês.\n\nMesma taxa, mesmo prazo: o SAC custa menos juro no total. O Price cabe melhor no orçamento de quem está apertado no começo.",
        insight: { label: "Onde as taxas estão",
          texto: "O financiamento imobiliário ficava em {{financiamento_imovel}}. Bancos costumam limitar a parcela a 30% da renda bruta." } } },
      { ordem: 1, tipo: "cenario", label: "Na prática", conteudo: {
        headline: "O Paulo e a Renata escolheram entre os dois",
        personagem: "Paulo e Renata, 36 e 33",
        linhas: [
          { label: "Primeira parcela no Price", valor: 2900, tipo: "saida" },
          { label: "Primeira parcela no SAC", valor: 3600, tipo: "saida" },
          { label: "Parcela do SAC no ano 15", valor: 2100, tipo: "saida" } ],
        rodape: "O SAC começa R$ 700 mais caro e termina bem mais barato. Escolher entre os dois é escolher entre folga agora e economia total — e a resposta depende de qual dos dois aperta mais a sua vida." } },
      { ordem: 2, tipo: "quiz", label: "Qual é qual", conteudo: {
        headline: "Qual sistema começa com parcela maior e vai caindo?",
        opcoes: [
          { letra: "A", texto: "Price", correta: false,
            feedback: "No Price a parcela é fixa. O que muda por dentro é a proporção entre juro e amortização, mas o valor não muda." },
          { letra: "B", texto: "SAC", correta: true,
            feedback: "Isso. Amortização constante faz o saldo cair mais rápido, e como o juro incide sobre o saldo, a parcela diminui todo mês." },
          { letra: "C", texto: "Os dois, na mesma proporção", correta: false,
            feedback: "Só o SAC decresce. É a característica que dá nome ao sistema." },
          { letra: "D", texto: "Depende do banco", correta: false,
            feedback: "Não depende: são fórmulas padronizadas. O que muda entre bancos é a taxa e as tarifas, não o comportamento da parcela." } ] } },
      { ordem: 3, tipo: "input", label: "Seu financiamento", conteudo: {
        headline: "Quanto e por quanto tempo?",
        subtitulo: "O valor financiado, depois da entrada, e o prazo em anos.",
        aviso: "Fica só nesta tela, no seu aparelho. Não é gravado em lugar nenhum.",
        campos: [
          { id: "valorFinanciado", emoji: "🏢", label: "Valor financiado", placeholder: "300000", tipo: "decimal" },
          { id: "anos", emoji: "📅", label: "Prazo em anos", placeholder: "30", tipo: "decimal" } ] } },
      { ordem: 4, tipo: "resultado", label: "A diferença", conteudo: {
        headline: "Juros no Price: <strong>{jurosPrice}</strong>. No SAC: <strong>{jurosSac}</strong>.",
        formula: "price_vs_sac",
        faixas: [ { condicao: "valor > 0", cor: "yellow",
          mensagem: "A diferença entre os dois costuma ser maior que o valor do imóvel em prazos longos. É a conta que menos aparece na hora de assinar, e a que mais pesa no total." } ],
        insightDinamico: "Isto é aproximação didática, para você entender a direção — não substitui a planilha do banco. Peça a simulação nos dois sistemas e compare o CET, que é o número que inclui tarifa e seguro." } },
      { ordem: 5, tipo: "resultado", label: "Amortizar", conteudo: {
        headline: "Amortizar prazo ou parcela?",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "Abater PRAZO economiza muito mais juro: você corta os meses do fim, que são os que mais tempo tiveram para acumular.\n\nAbater PARCELA alivia o mês, e faz sentido quando o orçamento está apertado agora. As duas são válidas — o que não vale é não saber que existem duas." } ],
        insightDinamico: "E a pergunta antes de amortizar: existe alguma dívida mais cara? Nenhum imóvel tem juro perto do rotativo, então quitar cartão vem sempre antes de amortizar financiamento." } },
    ],
  },

  // ======================= M20 — Eu do futuro ===========================
  {
    slug: "o-eu-do-futuro",
    titulo: "Por que você sempre guarda mês que vem",
    subtitulo: "O viés do presente, e o truque que funciona contra ele.",
    tipoPerfil: "sonhador", ordem: 29, nivel: "intermediario",
    situacoes: ["sem_reserva"],
    tags: ["vies-do-presente", "future-self", "comportamento", "poupanca", "habito"],
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "O que acontece", conteudo: {
        headline: "Seu cérebro trata o você de daqui a dez anos como um estranho",
        corpo: "Não é força de expressão. Em exames de imagem, pensar em si mesmo no futuro distante ativa regiões parecidas com as de pensar em outra pessoa.\n\nIsso explica por que é tão difícil guardar: você está sendo convidado a tirar algo de você agora para dar a alguém que o seu cérebro não reconhece como você. O presente ganha sempre — não por indisciplina, por arquitetura.",
        insight: { label: "O que a pesquisa mostrou",
          texto: "Pessoas que viram uma imagem envelhecida de si mesmas passaram a destinar mais dinheiro à aposentadoria. Tornar o eu futuro concreto muda a decisão de hoje." } } },
      { ordem: 1, tipo: "cenario", label: "Na prática", conteudo: {
        headline: "O Diego adia guardar há dois anos",
        personagem: "Diego, 30 anos, vendedor",
        linhas: [
          { label: "O que ele guardaria por mês", valor: 300, tipo: "saida" },
          { label: "Meses que ele adiou", valor: 24, tipo: "saldo" },
          { label: "O que existiria hoje", valor: 7200, tipo: "entrada" } ],
        rodape: "Ele nunca decidiu não guardar. Decidiu começar mês que vem, vinte e quatro vezes seguidas. Cada adiamento isolado foi razoável; a soma deles custou uma reserva inteira." } },
      { ordem: 2, tipo: "input", label: "Daqui a cinco anos", conteudo: {
        headline: "Onde você quer estar em cinco anos?",
        subtitulo: "Escreva uma frase. Não precisa ser grandiosa — precisa ser sua.",
        aviso: "Fica só nesta tela, no seu aparelho. Não é gravado em lugar nenhum.",
        campos: [ { id: "futuro", emoji: "🔮", label: "Em cinco anos, eu…", placeholder: "…moro num lugar meu e não devo pra ninguém", tipo: "texto" } ] } },
      { ordem: 3, tipo: "resultado", label: "O preço disso", conteudo: {
        headline: "Isso não acontece por decisão. Acontece por transferência",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "O que você escreveu não vai virar realidade por vontade, nem por lembrar dele de vez em quando. Vai virar por um valor que sai da sua conta todo mês, sem passar pela sua decisão.\n\nEsse é o único mecanismo que atravessa o viés do presente: não depender de você estar disposto no dia." } ],
        insightDinamico: "Por isso o automático funciona e a força de vontade não. Não porque você é fraco — porque o débito automático acontece antes de existir uma decisão para tomar." } },
      { ordem: 4, tipo: "quiz", label: "O que funciona", conteudo: {
        headline: "Qual estratégia vence o viés do presente?",
        opcoes: [
          { letra: "A", texto: "Guardar o que sobrar no fim do mês", correta: false,
            feedback: "Nunca sobra. Não por falta de disciplina: o gasto se expande até ocupar o que existe, e o fim do mês é quando você tem menos disposição." },
          { letra: "B", texto: "Transferência automática no dia que o dinheiro entra", correta: true,
            feedback: "Isso. Você decide uma vez, e a decisão passa a acontecer sozinha. É o oposto de decidir todo mês." },
          { letra: "C", texto: "Se cobrar mais e ter mais disciplina", correta: false,
            feedback: "Disciplina é recurso que acaba. Qualquer plano que dependa dela em janeiro vai falhar em março." },
          { letra: "D", texto: "Colocar um lembrete no celular", correta: false,
            feedback: "Lembrete resolve esquecimento, e o problema não é esquecer: é lembrar e adiar mesmo assim." } ] } },
      { ordem: 5, tipo: "resultado", label: "Levar daqui", conteudo: {
        headline: "Automatize, e depois esqueça",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "Escolhe um valor que você não vai sentir falta na primeira semana. Programa para o dia seguinte ao pagamento. E não mexe.\n\nO valor pode ser pequeno. O que importa é que ele acontece sem você." } ],
        insightDinamico: "Um detalhe que faz diferença: deixe em uma conta separada, de preferência num banco que você não usa no dia a dia. O atrito de transferir de volta é o que protege a decisão que você já tomou." } },
    ],
  },

  // ======================= M21 — Se-então ===============================
  {
    slug: "planos-se-entao",
    titulo: "Do quero ao faço",
    subtitulo: "A frase de duas partes que transforma intenção em ação.",
    tipoPerfil: "impulsivo", ordem: 30, nivel: "intermediario",
    situacoes: [],
    tags: ["habito", "se-entao", "compromisso", "comportamento", "execucao"],
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Como funciona", conteudo: {
        headline: "Saber o que fazer é a parte fácil, e quase nunca é o que falta",
        corpo: "Quase todo mundo sabe que deveria guardar, comparar antes de comprar, pagar antes do vencimento. A distância entre saber e fazer não se fecha com mais informação.\n\nO que fecha é um plano com gatilho: 'SE acontecer X, ENTÃO eu faço Y'. A frase parece boba e o efeito é dos mais consistentes que a psicologia comportamental já mediu. Ela funciona porque tira a decisão do momento e a coloca antes dele.",
        insight: { label: "Por que isso pega",
          texto: "Intenção genérica compete com o cansaço, a pressa e o humor do dia. Um plano se-então não compete: quando o gatilho acontece, a resposta já está decidida." } } },
      { ordem: 1, tipo: "cenario", label: "Na prática", conteudo: {
        headline: "A Fernanda trocou uma intenção por uma regra",
        personagem: "Fernanda, 33 anos",
        linhas: [
          { label: "Meses tentando guardar por vontade", valor: 7, tipo: "saldo" },
          { label: "Quanto tinha guardado ao fim deles", valor: 0, tipo: "saldo" },
          { label: "Guardado nos 3 meses seguintes, com a regra", valor: 900, tipo: "entrada" } ],
        rodape: "A regra dela cabia numa linha: se cair o salário, então transfiro R$ 300 na hora. Não mudou nada na renda nem na disciplina — mudou onde a decisão acontecia." } },
      { ordem: 2, tipo: "input", label: "O seu plano", conteudo: {
        headline: "Escreve o seu, agora",
        subtitulo: "Duas partes: um gatilho que acontece de verdade, e uma ação pequena o bastante para caber.",
        aviso: "Fica só nesta tela, no seu aparelho. Não é gravado em lugar nenhum.",
        campos: [
          { id: "gatilho", emoji: "⚡", label: "SE acontecer…", placeholder: "cair o salário", tipo: "texto" },
          { id: "acao", emoji: "✅", label: "ENTÃO eu…", placeholder: "transfiro R$ 200 na hora", tipo: "texto" } ] } },
      { ordem: 3, tipo: "resultado", label: "Por que funciona", conteudo: {
        headline: "Você acabou de tirar uma decisão do calor do momento",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "O que diferencia esse plano de uma intenção é o gatilho. 'Vou guardar mais' compete com tudo que acontecer no dia. 'Se cair o salário, então transfiro' não compete com nada: ou o gatilho aconteceu, ou não.\n\nQuanto mais específico o gatilho, melhor funciona. 'Quando eu puder' não é gatilho." } ],
        insightDinamico: "Vale para gasto também, e talvez funcione ainda melhor: se der vontade de comprar algo acima de R$ 200, então espero até amanhã. A regra decide antes de o desejo aparecer." } },
      { ordem: 4, tipo: "quiz", label: "Trava de compromisso", conteudo: {
        headline: "O que é uma boa trava de compromisso?",
        opcoes: [
          { letra: "A", texto: "Algo que torna o caminho errado mais difícil", correta: true,
            feedback: "Isso. Tirar o cartão do celular, deixar a reserva em outro banco, cancelar o um-clique. Você não fica mais forte: o desvio fica mais caro." },
          { letra: "B", texto: "Prometer para si mesmo com firmeza", correta: false,
            feedback: "Promessa não é trava: ela depende exatamente do recurso que costuma faltar na hora." },
          { letra: "C", texto: "Contar o plano pra alguém", correta: true,
            feedback: "Também funciona. Compromisso público cria um custo social para desistir, e esse custo age sem você precisar querer." },
          { letra: "D", texto: "Anotar num papel e guardar", correta: false,
            feedback: "Anotar ajuda a lembrar, mas não muda o custo de desviar. Trava é o que muda o custo." } ] } },
      { ordem: 5, tipo: "resultado", label: "Levar daqui", conteudo: {
        headline: "Um plano por vez, e específico",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "Cinco regras ao mesmo tempo viram nenhuma. Escolhe uma, deixa ela rodar por um mês, e só depois acrescenta a segunda.\n\nE se falhar, não é sinal de que não funciona: é sinal de que o gatilho estava vago ou a ação era grande demais. Ajusta o plano, não a sua opinião sobre você." } ],
        insightDinamico: "O Finlow pode ser o gatilho: se você registrar um gasto e a conversa mostrar que o mês está apertado, essa é a hora do plano entrar." } },
    ],
  },

  // ======================= M22 — Inflação ===============================
  {
    slug: "inflacao-e-poder-de-compra",
    titulo: "O aumento que não foi aumento",
    subtitulo: "Ganho nominal, ganho real, e o dinheiro que encolhe parado.",
    tipoPerfil: "guardador", ordem: 31, nivel: "intermediario",
    situacoes: [],
    tags: ["inflacao", "ipca", "poder-de-compra", "nominal-real", "reajuste"],
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Nominal e real", conteudo: {
        headline: "O número subiu. A pergunta é se comprou mais",
        corpo: "Ganho nominal é o que aparece no contracheque. Ganho real é o que sobra depois de descontar a inflação — o quanto o seu dinheiro compra de verdade.\n\nUm aumento de 4% num ano em que os preços subiram 4,64% não é aumento: é uma perda de poder de compra disfarçada de boa notícia. E dinheiro parado, sem render nada, perde essa diferença todo ano, em silêncio.",
        insight: { label: "Onde estamos",
          texto: "O IPCA acumulava {{ipca_12m}}, contra uma meta de {{meta_inflacao}}. É o quanto o dinheiro parado encolheu em doze meses." } } },
      { ordem: 1, tipo: "cenario", label: "Na prática", conteudo: {
        headline: "O Sérgio comemorou um aumento que foi perda",
        personagem: "Sérgio, 37 anos",
        linhas: [
          { label: "Salário antes", valor: 3000, tipo: "entrada" },
          { label: "Depois do aumento de 4%", valor: 3120, tipo: "entrada" },
          { label: "O que precisaria pra empatar", valor: 3139, tipo: "saldo" } ],
        rodape: "Ele ganhou R$ 120 a mais e ficou R$ 19 mais pobre. Não é pegadinha nem má-fé do empregador: é o que acontece quando o reajuste fica abaixo da inflação, e quase ninguém faz essa conta." } },
      { ordem: 2, tipo: "input", label: "Seu dinheiro parado", conteudo: {
        headline: "Quanto você tem parado, sem render?",
        subtitulo: "Conta corrente, dinheiro em casa, qualquer valor que não esteja rendendo nada.",
        aviso: "Fica só nesta tela, no seu aparelho. Não é gravado em lugar nenhum.",
        campos: [ { id: "parado", emoji: "🧊", label: "Parado hoje", placeholder: "5000", tipo: "decimal" } ] } },
      { ordem: 3, tipo: "resultado", label: "A perda", conteudo: {
        headline: "Em um ano isso perde <strong>{perda}</strong> de poder de compra.",
        formula: "perda_inflacao",
        faixas: [ { condicao: "valor > 0", cor: "yellow",
          mensagem: "O número na conta continua o mesmo. O que muda é o que ele compra. É a perda mais silenciosa que existe: não aparece em extrato nenhum." } ],
        insightDinamico: "Isso NÃO quer dizer correr para investir em qualquer coisa. A reserva de emergência pode e deve ficar em algo de saque imediato, mesmo rendendo pouco — o custo de não ter liquidez na hora do aperto é maior que o da inflação." } },
      { ordem: 4, tipo: "quiz", label: "Os índices", conteudo: {
        headline: "Qual índice mede a inflação oficial do país?",
        opcoes: [
          { letra: "A", texto: "IPCA", correta: true,
            feedback: "Isso. É o índice oficial, calculado pelo IBGE, e é a ele que a meta de inflação se refere." },
          { letra: "B", texto: "IGP-M", correta: false,
            feedback: "O IGP-M pega preços no atacado e é bem mais volátil. Ficou conhecido por reajustar aluguel, não por medir o custo de vida." },
          { letra: "C", texto: "INPC", correta: false,
            feedback: "O INPC é parecido com o IPCA, mas mede famílias de renda mais baixa. Costuma ser usado em reajuste salarial." },
          { letra: "D", texto: "Selic", correta: false,
            feedback: "Selic é a taxa básica de juros, não índice de preço. Ela é uma das ferramentas para controlar a inflação, não a medida dela." } ] } },
      { ordem: 5, tipo: "resultado", label: "Levar daqui", conteudo: {
        headline: "Pense em real, não em nominal",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "Na hora do reajuste, compare com a inflação do período: abaixo dela é perda, mesmo que o número tenha subido.\n\nE separe o dinheiro por função. O que é reserva fica líquido, mesmo rendendo pouco. O que não vai ser usado tão cedo é que precisa de destino." } ],
        insightDinamico: "O Finlow explica como funciona, mas não indica onde aplicar. Quem recomenda produto específico é profissional autorizado pela CVM." } },
    ],
  },

  // ======================= M23 — Juros compostos ========================
  {
    slug: "juros-compostos-regra-72",
    titulo: "O tempo é a alavanca",
    subtitulo: "Juro sobre juro, a regra do 72, e por que começar cedo pesa mais.",
    tipoPerfil: "sonhador", ordem: 32, nivel: "intermediario",
    situacoes: [],
    tags: ["juros-compostos", "regra-72", "tempo", "aporte", "exponencial"],
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Juro sobre juro", conteudo: {
        headline: "O cérebro humano projeta em linha reta. Juro composto não é reta",
        corpo: "Juro simples incide sempre sobre o valor inicial. Juro composto incide sobre o que já tinha rendido — e é essa diferença que faz o crescimento acelerar sozinho.\n\nO problema é que ninguém consegue simular isso mentalmente. Pedem para você estimar quanto algo vira em dez anos e você projeta uma reta, porque é o que o cérebro sabe fazer. Erra sempre para menos, e erra muito.",
        insight: { label: "Não é falta de estudo",
          texto: "Só {{letramento_juros}} conseguem fazer um cálculo simples de juros. E mesmo quem consegue subestima o crescimento composto — o viés é de projeção, não de conta." } } },
      { ordem: 1, tipo: "cenario", label: "Começar cedo x aportar muito", conteudo: {
        headline: "A Camila começou cedo. O irmão dela aportou o dobro",
        personagem: "Camila, 31 anos",
        linhas: [
          { label: "Ela guardou por mês, dos 25 aos 35", valor: 200, tipo: "entrada" },
          { label: "Ele guardou por mês, dos 35 aos 55", valor: 400, tipo: "entrada" },
          { label: "Anos que ela ficou parada, sem aportar", valor: 20, tipo: "saldo" } ],
        rodape: "Ela aportou por dez anos e parou. Ele aportou por vinte, o dobro por mês. Aos 55, os montantes chegam perto — e em muitos cenários o dela é maior. A diferença não é quanto: é quando." } },
      { ordem: 2, tipo: "input", label: "Seu chute", conteudo: {
        headline: "A que taxa anual você quer testar?",
        subtitulo: "Escolha uma taxa e chute em quantos anos o dinheiro dobra a ela.",
        aviso: "Sem consultar. O chute é o ponto do exercício.",
        campos: [
          { id: "taxaAno", emoji: "📈", label: "Taxa ao ano (%)", placeholder: "10", tipo: "decimal" },
          { id: "chute", emoji: "🎯", label: "Anos pra dobrar, no meu chute", placeholder: "10", tipo: "decimal" } ] } },
      { ordem: 3, tipo: "resultado", label: "A regra do 72", conteudo: {
        headline: "Você chutou <strong>R$ {valor}</strong> anos. A conta dá <strong>{anosDobrar}</strong>.",
        formula: "regra_72",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "A regra do 72 é o atalho: divida 72 pela taxa anual e você tem, por aproximação, os anos para o dinheiro dobrar. Serve para fazer de cabeça, em qualquer conversa, sem calculadora." } ],
        insightDinamico: "E ela vale nos dois sentidos. Uma dívida a 6% ao mês dobra em cerca de um ano. É a mesma matemática que faz o aporte crescer — só que trabalhando contra você." } },
      { ordem: 4, tipo: "quiz", label: "O que pesa mais", conteudo: {
        headline: "O que pesa mais no montante final?",
        opcoes: [
          { letra: "A", texto: "Aportar valores altos", correta: false,
            feedback: "Ajuda, mas perde para o tempo em prazos longos. Cada ano a mais multiplica tudo que veio antes." },
          { letra: "B", texto: "Começar cedo, mesmo com pouco", correta: true,
            feedback: "Isso. O tempo é o único fator que não dá para recuperar depois. Dinheiro você consegue aportar mais tarde; anos, não." },
          { letra: "C", texto: "Encontrar a aplicação de maior retorno", correta: false,
            feedback: "Retorno alto atrai atenção e costuma vir com risco alto. Consistência ao longo de anos ganha de retorno alto por pouco tempo." },
          { letra: "D", texto: "Acertar o momento de entrar", correta: false,
            feedback: "Tentar acertar o momento é a estratégia que mais custa dinheiro para quem não é profissional — e para muitos que são." } ] } },
      { ordem: 5, tipo: "resultado", label: "Levar daqui", conteudo: {
        headline: "O mesmo mecanismo, dos dois lados",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "Juro composto é a coisa mais poderosa a favor de quem guarda e a mais destrutiva contra quem deve. Não existem duas matemáticas: existe uma, e você escolhe de que lado dela fica.\n\nPor isso quitar dívida cara vem antes de investir. Você está do lado errado da mesma alavanca." } ],
        insightDinamico: "As taxas aqui são ilustrativas, para mostrar o mecanismo. O Finlow não indica onde aplicar nem promete retorno." } },
    ],
  },

  // ======================= M24 — Selic, CDI, poupança ===================
  {
    slug: "selic-cdi-e-poupanca",
    titulo: "Selic, CDI e a poupança",
    subtitulo: "O que o juro básico faz com a sua dívida e com o seu dinheiro.",
    tipoPerfil: "guardador", ordem: 33, nivel: "intermediario",
    situacoes: [],
    tags: ["selic", "cdi", "poupanca", "copom", "juros", "rendimento"],
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Quem é quem", conteudo: {
        headline: "A Selic é o juro base. Todo o resto anda em volta dela",
        corpo: "O Banco Central define a Selic a cada 45 dias. Ela é a referência do custo do dinheiro no país: quando sobe, crédito fica mais caro e aplicação pós-fixada rende mais; quando cai, o contrário.\n\nO CDI é a taxa entre bancos, e anda quase colada na Selic. Por isso muita aplicação é descrita como '% do CDI' — 100% do CDI significa render praticamente o mesmo que a taxa básica.",
        insight: { label: "Onde está agora",
          texto: "A Selic estava em {{selic_atual}}. Mesmo assim, {{poupanca_pct}} ainda mantêm dinheiro na poupança." } } },
      { ordem: 1, tipo: "cenario", label: "A regra da poupança", conteudo: {
        headline: "A Aline tinha dinheiro na poupança e não sabia quanto rendia",
        personagem: "Aline, 36 anos",
        linhas: [
          { label: "Guardado na poupança", valor: 10000, tipo: "saldo" },
          { label: "Rendimento em um ano", valor: 600, tipo: "entrada" },
          { label: "O que a inflação levou no mesmo ano", valor: 464, tipo: "saida" } ],
        rodape: "Rendeu 6% e a inflação comeu 4,64%. O ganho real foi de pouco mais de 1%. A poupança não é perda garantida — é um rendimento baixo que muita gente acha que é alto porque o número na conta sobe." } },
      { ordem: 2, tipo: "input", label: "Seu dinheiro", conteudo: {
        headline: "Quanto você tem na poupança hoje?",
        subtitulo: "Se não tiver nada, chuta um valor pra ver a conta funcionando.",
        aviso: "Fica só nesta tela, no seu aparelho. Não é gravado em lugar nenhum.",
        campos: [ { id: "guardadoPoupanca", emoji: "🐷", label: "Na poupança", placeholder: "10000", tipo: "decimal" } ] } },
      { ordem: 3, tipo: "resultado", label: "O rendimento", conteudo: {
        headline: "Isso rende cerca de <strong>{guardado}</strong> em um ano.",
        formula: "poupanca_rende",
        faixas: [ { condicao: "valor > 0", cor: "yellow",
          mensagem: "Com a Selic acima de 8,5% ao ano, a poupança rende 0,5% ao mês mais TR, e essa regra não muda por mais que a Selic suba. É por isso que ela descola das outras aplicações pós-fixadas quando o juro está alto." } ],
        insightDinamico: "Compare com o que a Selic está pagando: {{selic_atual}}. A diferença entre os dois é o custo de deixar na poupança — e é maior justamente quando o juro está alto, que é agora." } },
      { ordem: 4, tipo: "quiz", label: "% do CDI", conteudo: {
        headline: "Uma aplicação que paga 100% do CDI rende o quê?",
        opcoes: [
          { letra: "A", texto: "O dobro da Selic", correta: false,
            feedback: "100% quer dizer o valor inteiro do CDI, não o dobro de nada. É a taxa cheia, não multiplicada." },
          { letra: "B", texto: "Praticamente o mesmo que a taxa básica", correta: true,
            feedback: "Isso. O CDI anda quase colado na Selic, então 100% do CDI rende quase o que a taxa básica paga." },
          { letra: "C", texto: "100% de lucro sobre o aplicado", correta: false,
            feedback: "Esse é o mal-entendido mais comum. O percentual é sobre a TAXA, não sobre o dinheiro aplicado." },
          { letra: "D", texto: "Um valor fixo, independente da Selic", correta: false,
            feedback: "Ao contrário: é pós-fixado. Se a Selic cair, o rendimento cai junto." } ] } },
      { ordem: 5, tipo: "resultado", label: "Levar daqui", conteudo: {
        headline: "Selic sobe: dívida fica mais cara, aplicação rende mais",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "É a leitura que serve para os dois lados da sua vida financeira. Com juro alto, quitar dívida vale ainda mais — porque ela cresce mais rápido — e dinheiro parado custa ainda mais caro.\n\nCom juro baixo, o oposto: crédito fica mais acessível e aplicação conservadora rende pouco." } ],
        insightDinamico: "O Finlow explica o mecanismo e não indica produto: qual aplicação escolher é conversa com profissional autorizado pela CVM." } },
    ],
  },

  // ======================= M25 — Investir do zero =======================
  {
    slug: "investir-do-zero-o-tripe",
    titulo: "Já tenho reserva. E agora?",
    subtitulo: "Risco, retorno e liquidez: não dá pra ter os três no máximo.",
    tipoPerfil: "guardador", ordem: 34, nivel: "intermediario",
    situacoes: [],
    tags: ["investir", "risco-retorno", "liquidez", "horizonte", "renda-fixa"],
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "O tripé", conteudo: {
        headline: "Liquidez, rentabilidade e segurança: escolha duas",
        corpo: "Toda aplicação equilibra três coisas. Quer sacar a qualquer momento e com risco baixo? O retorno vai ser modesto. Quer retorno alto com segurança? Vai precisar deixar o dinheiro parado por bastante tempo.\n\nNão é opinião nem esperteza de mercado: é como o preço do dinheiro funciona. Quando alguém oferece os três no máximo, o que está sendo omitido é o risco.",
        insight: { label: "Quem já está lá",
          texto: "O Brasil fechou o ano com {{investidores}} investindo, contra 31% em 2021. Ainda são mais de 100 milhões de adultos fora." } } },
      { ordem: 1, tipo: "cenario", label: "Na prática", conteudo: {
        headline: "A Bianca queria render mais, mas precisava do dinheiro em seis meses",
        personagem: "Bianca, 30 anos",
        linhas: [
          { label: "O que ela tinha", valor: 20000, tipo: "saldo" },
          { label: "Precisava em 6 meses, para a entrada", valor: 20000, tipo: "saldo" } ],
        rodape: "Com prazo curto e destino certo, o que importa é o dinheiro estar lá no dia — não render mais alguns por cento. Prazo curto elimina sozinho quase todas as opções, e isso simplifica a decisão em vez de limitá-la." } },
      { ordem: 2, tipo: "quiz", label: "Para a reserva", conteudo: {
        headline: "Para a reserva de emergência, o que prioriza?",
        opcoes: [
          { letra: "A", texto: "Rentabilidade", correta: false,
            feedback: "Reserva não existe para render. Existe para estar disponível no pior dia, e rendimento alto costuma custar prazo." },
          { letra: "B", texto: "Liquidez, e depois segurança", correta: true,
            feedback: "Isso. Poder sacar hoje é o requisito. Segurança vem em seguida, e rendimento é o que sobra da conta — não o objetivo." },
          { letra: "C", texto: "Diversificação", correta: false,
            feedback: "Diversificar faz sentido para patrimônio de longo prazo. Para a reserva, complexidade é atrito na hora de sacar." },
          { letra: "D", texto: "Isenção de imposto", correta: false,
            feedback: "Isenção é vantagem, não critério. Muitas aplicações isentas têm prazo de carência, que é justamente o que a reserva não tolera." } ] } },
      { ordem: 3, tipo: "input", label: "Seu horizonte", conteudo: {
        headline: "Pra quando é esse dinheiro?",
        subtitulo: "O prazo muda tudo, mais do que qualquer outra coisa.",
        aviso: "Fica só nesta tela, no seu aparelho. Não é gravado em lugar nenhum.",
        campos: [ { id: "horizonte", emoji: "⏳", label: "Quando vou precisar", tipo: "faixa", opcoes: [
          { valor: "emergencia", rotulo: "Não sei, é pra emergência" },
          { valor: "curto", rotulo: "Menos de 2 anos" },
          { valor: "medio", rotulo: "De 2 a 5 anos" },
          { valor: "longo", rotulo: "Mais de 5 anos" } ] } ] } },
      { ordem: 4, tipo: "resultado", label: "O que o prazo decide", conteudo: {
        headline: "O prazo é o que escolhe, não o produto",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "Dinheiro de emergência: liquidez imediata, sempre, mesmo rendendo pouco.\n\nMenos de dois anos: não pode oscilar. Prazo curto não dá tempo de recuperar de uma queda.\n\nDe dois a cinco anos: cabe alguma oscilação, desde que a data não seja rígida.\n\nMais de cinco anos: o tempo passa a trabalhar a favor, e aí faz sentido conversar sobre risco com quem pode recomendar." } ],
        insightDinamico: "Repare que nenhuma dessas frases cita um produto. É de propósito, e é a fronteira do que o Finlow pode dizer: explicar o critério é educação; dizer onde aplicar é recomendação, e recomendação é de profissional autorizado pela CVM." } },
      { ordem: 5, tipo: "resultado", label: "Levar daqui", conteudo: {
        headline: "Renda fixa e renda variável, sem mistério",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "Renda fixa: você sabe a regra do rendimento na hora de aplicar. Pode ser prefixada, pós-fixada ou atrelada à inflação. Menos oscilação, retorno mais previsível.\n\nRenda variável: o retorno depende do que acontecer. Pode render muito mais e pode dar prejuízo. Só faz sentido com prazo longo e com dinheiro que você não vai precisar." } ],
        insightDinamico: "E a ordem que não muda: dívida cara primeiro, reserva depois, investimento por último. Investir com rotativo aberto é como encher um balde furado." } },
    ],
  },

  // ======================= M26 — Taxas escondidas =======================
  {
    slug: "cet-e-as-taxas-escondidas",
    titulo: "Por que o total ficou tão alto",
    subtitulo: "Taxa mensal, taxa anual, CET e o que se esconde no meio.",
    tipoPerfil: "lancador", ordem: 35, nivel: "avancado",
    situacoes: ["financiamento"],
    tags: ["cet", "taxa-efetiva", "spread", "iof", "credito", "comparar"],
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Nominal e efetiva", conteudo: {
        headline: "Uma taxa mensal não vira taxa anual multiplicando por doze",
        corpo: "Multiplicar dá a taxa nominal, que não existe na prática. A taxa efetiva considera que o juro do mês incide sobre o juro dos meses anteriores.\n\nÉ por isso que 2% ao mês não são 24% ao ano. São quase 27%. Parece pouca diferença num exemplo pequeno; num financiamento longo, é dinheiro que dá para comprar um carro.",
        insight: { label: "O número que resolve",
          texto: "O CET, Custo Efetivo Total, é o único que junta juro, tarifa, seguro e IOF numa taxa só. É obrigatório informá-lo, e é o único que dá para comparar entre bancos." } } },
      { ordem: 1, tipo: "cenario", label: "Na prática", conteudo: {
        headline: "O Ricardo escolheu o crédito de juro menor e pagou mais caro",
        personagem: "Ricardo, 39 anos",
        linhas: [
          { label: "Banco A, taxa anunciada de 1,9% a.m.", valor: 12400, tipo: "saldo" },
          { label: "Banco B, taxa anunciada de 2,1% a.m.", valor: 11800, tipo: "saldo" } ],
        rodape: "O total pago no banco A foi maior, apesar do juro menor. A diferença estava em tarifa de cadastro e seguro embutido — coisas que a taxa anunciada não mostra e o CET mostra." } },
      { ordem: 2, tipo: "input", label: "Converta", conteudo: {
        headline: "Qual taxa mensal você quer converter?",
        subtitulo: "Pega uma taxa de um crédito que te ofereceram, ou testa com qualquer valor.",
        aviso: "Fica só nesta tela, no seu aparelho. Não é gravado em lugar nenhum.",
        campos: [ { id: "taxaMes", emoji: "📊", label: "Taxa ao mês (%)", placeholder: "2", tipo: "decimal" } ] } },
      { ordem: 3, tipo: "resultado", label: "No ano", conteudo: {
        headline: "<strong>R$ {valor}%</strong> ao mês são <strong>{taxaAnual}%</strong> ao ano.",
        formula: "taxa_anual",
        faixas: [ { condicao: "valor > 0", cor: "yellow",
          mensagem: "Sempre mais que multiplicar por doze. A diferença é o juro sobre juro, e ela cresce rápido conforme a taxa sobe — o que faz taxas altas serem muito piores do que parecem." } ],
        insightDinamico: "É o mesmo motivo pelo qual o rotativo tem número tão alto: uma taxa de dois dígitos ao mês, composta doze vezes, produz um número que ninguém estimaria de cabeça." } },
      { ordem: 4, tipo: "quiz", label: "O que o CET inclui", conteudo: {
        headline: "O que entra no CET e não aparece na taxa de juros?",
        opcoes: [
          { letra: "A", texto: "Tarifas, seguro e IOF", correta: true,
            feedback: "Isso. São custos reais que você paga e que a taxa anunciada não mostra. Por isso comparar por taxa engana e comparar por CET, não." },
          { letra: "B", texto: "Só o juro, calculado direito", correta: false,
            feedback: "Se fosse só o juro, taxa e CET seriam iguais. A diferença entre os dois é exatamente o que está embutido." },
          { letra: "C", texto: "A inflação do período", correta: false,
            feedback: "O CET não corrige por inflação. Ele soma os custos do contrato, não o efeito dos preços." },
          { letra: "D", texto: "O lucro do banco", correta: false,
            feedback: "O lucro está diluído no juro e nas tarifas, mas não é uma linha separada. O CET mostra o que você paga, não como o banco reparte." } ] } },
      { ordem: 5, tipo: "resultado", label: "Levar daqui", conteudo: {
        headline: "Uma pergunta antes de qualquer crédito",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "'Qual é o CET desta operação?' O banco é obrigado a informar, e a resposta é o número que você compara com o de outro banco.\n\nNunca compare pela parcela: parcela pequena com prazo longo esconde total maior. Parcela é sobre caber no mês; CET é sobre quanto custa." } ],
        insightDinamico: "Vale para câmbio também: a cotação anunciada raramente é a que você paga. Entre o spread da casa e o IOF, o custo real fica bem acima do número da vitrine — e a lógica de perguntar o total é a mesma." } },
    ],
  },

  // ======================= M27 — Renda x patrimônio =====================
  {
    slug: "renda-x-patrimonio",
    titulo: "Ganho bem e não sobra nada",
    subtitulo: "A diferença entre o rio e o reservatório.",
    tipoPerfil: "guardador", ordem: 36, nivel: "intermediario",
    situacoes: [],
    tags: ["renda", "patrimonio", "fluxo-estoque", "custo-de-oportunidade", "valor-hora"],
    xp: 50,
    telas: [
      { ordem: 0, tipo: "conceito", label: "Fluxo e estoque", conteudo: {
        headline: "Renda é o rio. Patrimônio é o reservatório",
        corpo: "Renda é quanto passa pela sua mão por mês. Patrimônio é quanto ficou. São coisas independentes: dá para ter renda alta e patrimônio zero, e é bem mais comum do que parece.\n\nQuem confunde os dois mede sucesso pelo salário. Mas salário some quando o emprego some; patrimônio é o que continua existindo — e é ele que dá escolha.",
        insight: { label: "Por que isso engana",
          texto: "Renda alta traz padrão de vida alto, e padrão de vida alto consome o aumento inteiro. O rio engrossa e o reservatório continua vazio." } } },
      { ordem: 1, tipo: "cenario", label: "Na prática", conteudo: {
        headline: "A Luana ganha bem há oito anos e não tem nada guardado",
        personagem: "Luana, 35 anos",
        linhas: [
          { label: "Ganha por mês", valor: 9000, tipo: "entrada" },
          { label: "Gasta por mês", valor: 8800, tipo: "saida" },
          { label: "Patrimônio depois de 8 anos", valor: 19000, tipo: "saldo" } ],
        rodape: "Ela passou quase R$ 900 mil pela conta em oito anos e reteve 2% disso. Não houve desperdício óbvio: cada aumento veio junto com um carro melhor, um aluguel maior, uma vida um pouco mais cara." } },
      { ordem: 2, tipo: "input", label: "Seus dois números", conteudo: {
        headline: "Quanto passa e quanto ficou",
        subtitulo: "Renda mensal, e tudo que você tem guardado ou investido hoje.",
        aviso: "Fica só nesta tela, no seu aparelho. Não é gravado em lugar nenhum.",
        campos: [
          { id: "rendaMensal", emoji: "💵", label: "Renda mensal", placeholder: "5000", tipo: "decimal" },
          { id: "patrimonio", emoji: "🏛️", label: "Guardado hoje", placeholder: "15000", tipo: "decimal" } ] } },
      { ordem: 3, tipo: "resultado", label: "Quanto tempo você tem", conteudo: {
        headline: "Você tem <strong>{mesesRenda}</strong> meses de renda guardados.",
        formula: "fluxo_estoque",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "Esse é o número que mede independência, não o salário. Ele responde a única pergunta que importa quando algo dá errado: quanto tempo eu aguento sem receber?" } ],
        insightDinamico: "E ele sobe de dois jeitos: guardando mais, ou precisando de menos. O segundo caminho é mais rápido do que parece — cortar uma despesa fixa alta melhora os dois lados da conta ao mesmo tempo." } },
      { ordem: 4, tipo: "quiz", label: "Custo de oportunidade", conteudo: {
        headline: "Te oferecem um bico de 8 horas por R$ 200. Como avaliar?",
        opcoes: [
          { letra: "A", texto: "Compare com o valor da sua hora", correta: true,
            feedback: "Isso. R$ 25 por hora pode ser ótimo ou péssimo, e a única forma de saber é comparar com o que a sua hora já vale hoje." },
          { letra: "B", texto: "Aceite: dinheiro extra é sempre bom", correta: false,
            feedback: "Nem sempre. Oito horas gastas mal custam o descanso, e às vezes custam a energia que renderia mais no trabalho principal." },
          { letra: "C", texto: "Considere também o que deixa de fazer", correta: true,
            feedback: "Também certo, e é a parte que quase ninguém soma. Custo de oportunidade é o valor da melhor alternativa que você abandonou." },
          { letra: "D", texto: "Recuse: bico atrapalha carreira", correta: false,
            feedback: "Generalização. Tem bico que abre porta e ensina, e tem bico que só consome tempo. A conta é caso a caso." } ] } },
      { ordem: 5, tipo: "resultado", label: "Levar daqui", conteudo: {
        headline: "Aumento vira patrimônio ou vira padrão",
        faixas: [ { condicao: "valor >= 0", cor: "green",
          mensagem: "Todo aumento é uma bifurcação, e ela acontece rápido demais para ser percebida. Se o padrão de vida sobe junto, o rio engrossa e o reservatório continua igual.\n\nA regra que funciona: quando a renda subir, direcione uma parte do aumento para o estoque ANTES de ajustar o padrão. Metade dele já muda tudo em poucos anos." } ],
        insightDinamico: "E calcule sua hora pelo menos uma vez. Renda mensal dividida pelas horas realmente trabalhadas, incluindo deslocamento. O número costuma ser menor do que se imagina, e ele muda decisões." } },
    ],
  },
]
