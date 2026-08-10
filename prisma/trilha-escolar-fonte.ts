/**
 * FONTE da trilha escolar — 107 módulos, 535 telas, 230/230 habilidades da
 * Matriz de Competências de Letramento Financeiro (Banco Central / Aprender
 * Valor, 2025): 183 do Fundamental e 47 do Médio.
 *
 * ISTO É FONTE, NÃO O QUE O APP LÊ.
 * O `conteudo` das telas está no contrato de quem escreveu (`texto`/`destaque`,
 * `enunciado`/`alternativas`, `campo`, `regras`), e os componentes leem outro
 * (`headline`/`corpo`, `opcoes`, `campos`, `faixas`). Semear isto direto grava
 * telas quebradas: três dos cinco tipos fazem `.map` num array que não existe,
 * e o player estoura em vez de só ficar vazio. Quem converte é
 * `scripts/portar-ef.mts`, com as decisões em `prisma/editorial-ef.ts` — o
 * mesmo caminho que a trilha de EM já percorreu.
 *
 * Os 24 módulos de segmento "em" aqui são o MESMO conteúdo de
 * `prisma/trilha-em-fonte.ts`, que já foi portado e semeado. Deles aproveita-se
 * só a estrutura nova (bloco, pré-requisito, pontos) — as telas no banco não
 * são regravadas, senão as 120 telas que hoje funcionam voltariam ao formato
 * de fonte.
 *
 * O arquivo original (`finlow-trilha-escolar.zip`) terminava chamando `main()`,
 * que semeia. Essa parte NÃO veio junto de propósito: importar a fonte não
 * pode escrever no banco.
 */

export type EstadoInicial = "disponivel" | "travado"

export type TelaSeed = {
  ordem: number
  tipo: "conceito" | "cenario" | "quiz" | "input" | "resultado"
  label: string
  conteudo: unknown
}

export type ModuloSeed = {
  slug: string
  titulo: string
  subtitulo: string
  segmento: string        // ef12 | ef35 | ef67 | ef89 | em
  blocoId: string
  blocoRotulo: string
  ordem: number           // posição no tronco da trilha do segmento
  nivel: string
  duracaoMin: number
  pontos: number
  tags: string[]
  thumbnail: string
  estadoInicial: EstadoInicial
  destravadoPor?: string  // slug do módulo pré-requisito
  /** habilidades da matriz do BC cobertas — rastreabilidade, não é campo do schema */
  habilidades: string[]
  telas: TelaSeed[]
}

export const TRILHA_ESCOLAR: ModuloSeed[] = [
  {
    slug: "ef12-o-dinheiro-serve-pra-que",
    titulo: "O dinheiro serve pra quê",
    subtitulo: "O que é dinheiro e como ele aparece no dia a dia.",
    segmento: "ef12",
    blocoId: "ef12-bloco-a",
    blocoRotulo: "Bloco A · Circulação social do dinheiro",
    ordem: 1,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["dinheiro", "moedas", "cedulas"],
    thumbnail: "/trilha/circulacao.png",
    estadoInicial: "disponivel",
    habilidades: ["EF12LF01", "EF12LF02"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Para que serve o dinheiro",
        conteudo: {
          "texto": "Dinheiro serve para trocar. Você entrega dinheiro e recebe uma coisa: pão, ônibus, caderno. No Brasil o dinheiro se chama real. Ele aparece em moedas e em cédulas. A moeda de 1 real é redonda. A cédula de 10 reais é de papel.",
          "destaque": "Dinheiro é o que a gente troca por coisas.",
          "mediacao": "Mostre uma moeda e uma cédula de verdade enquanto lê o texto."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A feira de Alessandra",
        conteudo: {
          "personagem": "Alessandra",
          "texto": "Alessandra foi à feira com a avó. A avó deu 10 reais para ela pagar. Alessandra entregou uma cédula de 10 reais na banca. A vendedora deu a sacola de laranjas. O dinheiro saiu da mão dela. As laranjas vieram no lugar.",
          "pergunta": "O que Alessandra deu, e o que ela recebeu?",
          "mediacao": "Pergunte quem já foi à feira antes de ler a história."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Qual vale mais",
        conteudo: {
          "enunciado": "Uma cédula de 10 reais ou uma moeda de 1 real: qual vale mais?",
          "alternativas": [
            {
              "id": "a",
              "texto": "A moeda de 1 real.",
              "correta": false,
              "feedback": "Um real é menos que dez reais. A moeda vale menos, mesmo sendo de metal."
            },
            {
              "id": "b",
              "texto": "A cédula de 10 reais.",
              "correta": true,
              "feedback": "Isso. Dez reais valem mais que um real."
            },
            {
              "id": "c",
              "texto": "As duas valem igual.",
              "correta": false,
              "feedback": "Não valem igual. O número escrito na cédula é maior."
            }
          ],
          "mediacao": "Leia as opções em voz alta e peça para a criança apontar."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Conte suas moedas",
        conteudo: {
          "pergunta": "Quantas moedas de 1 real você consegue encontrar em casa hoje?",
          "campo": "numero",
          "placeholder": "3",
          "ajuda": "Chutar um número perto do certo já serve.",
          "mediacao": "Ajude a contar as moedas juntos e escreva o número."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O que dá para trocar",
        conteudo: {
          "texto": "Você encontrou {valor} moedas de 1 real. Cada uma vale 1 real. Juntas, elas dão para trocar por alguma coisa pequena.",
          "regras": [
            {
              "se": "valor == 0",
              "entao": "Não achar nenhuma é normal. Em muitas casas o dinheiro fica no celular ou no cartão."
            },
            {
              "se": "valor entre 1 e 4",
              "entao": "Com 3 moedas você tem 3 reais. Isso já compra um pão."
            },
            {
              "se": "valor >= 5",
              "entao": "Cinco moedas viram 5 reais. É o mesmo valor da cédula de 5."
            }
          ],
          "proximoPasso": "Peça para um adulto mostrar uma cédula de 5 reais e uma de 10 hoje.",
          "mediacao": "Compare o número achado com uma cédula do mesmo valor."
        },
      },
    ],
  },
  {
    slug: "ef12-mais-caro-mais-barato",
    titulo: "Mais caro, mais barato",
    subtitulo: "Comparar preços e juntar as moedas certas.",
    segmento: "ef12",
    blocoId: "ef12-bloco-a",
    blocoRotulo: "Bloco A · Circulação social do dinheiro",
    ordem: 2,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["preco", "comparar", "moedas"],
    thumbnail: "/trilha/circulacao.png",
    estadoInicial: "travado",
    destravadoPor: "ef12-o-dinheiro-serve-pra-que",
    habilidades: ["EF12LF03", "EF12LF04", "EF12LF08"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Cada coisa tem um preço",
        conteudo: {
          "texto": "Todo produto tem um preço. O preço diz quanto dinheiro ele custa. Um pão custa menos que um pacote de arroz. O que custa mais é o mais caro. O que custa menos é o mais barato. Olhar o preço ajuda a escolher.",
          "destaque": "Mais caro custa mais dinheiro. Mais barato custa menos.",
          "mediacao": "Mostre dois produtos com etiqueta de preço enquanto lê."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Três preços na prateleira",
        conteudo: {
          "personagem": "Amanda",
          "texto": "Amanda foi ao mercado com o tio. Ela viu três preços na prateleira. O suco custa 4 reais. O biscoito custa 3 reais. O leite custa 6 reais. Amanda tem 5 reais na mão. Ela quer saber o que é mais barato.",
          "pergunta": "Qual dos três é o mais barato?",
          "mediacao": "Escreva os três preços num papel para a criança comparar."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Pagar 3 reais",
        conteudo: {
          "enunciado": "Amanda vai pagar o biscoito de 3 reais. O que serve para pagar?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Três moedas de 1 real.",
              "correta": true,
              "feedback": "Isso. Três moedas de 1 real somam 3 reais."
            },
            {
              "id": "b",
              "texto": "Uma moeda de 1 real.",
              "correta": false,
              "feedback": "Uma moeda dá só 1 real. Faltam 2 reais."
            },
            {
              "id": "c",
              "texto": "Uma cédula de 2 reais.",
              "correta": false,
              "feedback": "Dois reais é menos que três. Ainda falta 1 real."
            }
          ],
          "mediacao": "Use moedas de verdade para a criança montar os 3 reais."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "O preço do pão",
        conteudo: {
          "pergunta": "Quanto custa um pão na padaria perto da sua casa?",
          "campo": "faixa",
          "placeholder": "Entre 1 e 2 reais",
          "faixas": [
            "Menos de 1 real",
            "Entre 1 e 2 reais",
            "Entre 2 e 5 reais",
            "Mais de 5 reais"
          ],
          "ajuda": "Se não souber, escolha o preço mais perto.",
          "mediacao": "Pergunte a um adulto o preço antes de escolher a faixa."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Preço muda de lugar",
        conteudo: {
          "texto": "Você disse que o pão custa {valor}. O preço do pão muda de bairro e de padaria. Por isso vale olhar antes de comprar.",
          "regras": [
            {
              "se": "valor == 'Menos de 1 real'",
              "entao": "Existe pão barato assim. Vale conferir a etiqueta de novo."
            },
            {
              "se": "valor == 'Entre 1 e 2 reais' ou valor == 'Entre 2 e 5 reais'",
              "entao": "Esse é o preço mais comum hoje. Boa estimativa."
            },
            {
              "se": "valor == 'Mais de 5 reais'",
              "entao": "Pão desse preço costuma ser grande ou especial."
            }
          ],
          "proximoPasso": "Na próxima compra, leia duas etiquetas e diga qual é a mais barata.",
          "mediacao": "Leia o resultado e compare com o preço real da padaria."
        },
      },
    ],
  },
  {
    slug: "ef12-quero-ou-preciso",
    titulo: "Quero ou preciso",
    subtitulo: "A diferença entre querer e precisar — e consertar antes de comprar.",
    segmento: "ef12",
    blocoId: "ef12-bloco-b",
    blocoRotulo: "Bloco B · Planejamento",
    ordem: 3,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["desejo", "necessidade", "consertar"],
    thumbnail: "/trilha/orcamento.png",
    estadoInicial: "travado",
    destravadoPor: "ef12-mais-caro-mais-barato",
    habilidades: ["EF12LF05", "EF12LF09"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Querer e precisar",
        conteudo: {
          "texto": "Precisar é quando falta algo importante: comida, remédio, sapato para andar. Querer é gostar de algo que dá para viver sem. Os dois são normais. Precisar costuma vir primeiro. A diferença ajuda na hora de escolher onde o dinheiro vai.",
          "destaque": "Precisar é o que falta. Querer é o que dá vontade.",
          "mediacao": "Peça exemplos de algo que a criança quer e algo que precisa."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A alça rasgada",
        conteudo: {
          "personagem": "Anderson",
          "texto": "A mochila de Anderson rasgou na alça. Ele viu uma mochila nova por 40 reais na loja. Em casa, a tia disse que dava para costurar a alça. A linha custou 2 reais. Anderson usou a mesma mochila o ano inteiro.",
          "pergunta": "Anderson precisava de mochila nova ou de conserto?",
          "mediacao": "Pergunte se a criança já viu alguém consertar uma coisa quebrada."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Precisa ou quer",
        conteudo: {
          "enunciado": "Sapato apertado que machuca o pé. Isso é precisar ou querer?",
          "alternativas": [
            {
              "id": "a",
              "texto": "É querer, porque sapato novo é bonito.",
              "correta": false,
              "feedback": "O motivo aqui não é ser bonito. É o pé machucando."
            },
            {
              "id": "b",
              "texto": "É precisar, porque o pé dói e ele anda todo dia.",
              "correta": true,
              "feedback": "Isso. Sem um sapato que sirva, andar fica difícil."
            },
            {
              "id": "c",
              "texto": "Não é nem um nem outro.",
              "correta": false,
              "feedback": "É sim uma necessidade. Faz falta no dia a dia."
            }
          ],
          "mediacao": "Leia cada opção devagar e espere a criança pensar."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Coisas para consertar",
        conteudo: {
          "pergunta": "Quantas coisas quebradas dá para consertar na sua casa?",
          "campo": "numero",
          "placeholder": "2",
          "ajuda": "Olhar em volta e contar por alto já serve.",
          "mediacao": "Caminhe pela casa com a criança e conte junto."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Consertar antes de comprar",
        conteudo: {
          "texto": "Você contou {valor} coisas para consertar. Consertar costuma gastar menos que comprar de novo. E deixa menos lixo no mundo.",
          "regras": [
            {
              "se": "valor == 0",
              "entao": "Não achar nada também é resposta. Olhe de novo outro dia."
            },
            {
              "se": "valor entre 1 e 3",
              "entao": "Dá para começar por uma. Escolha a mais fácil."
            },
            {
              "se": "valor >= 4",
              "entao": "São muitas. Um adulto pode ajudar a escolher a primeira."
            }
          ],
          "proximoPasso": "Escolha uma coisa quebrada e peça ajuda de um adulto para consertar hoje.",
          "mediacao": "Combine com a criança qual objeto será consertado primeiro."
        },
      },
    ],
  },
  {
    slug: "ef12-hoje-mes-que-vem",
    titulo: "Hoje, mês que vem, ano que vem",
    subtitulo: "Planejar é decidir a ordem das coisas.",
    segmento: "ef12",
    blocoId: "ef12-bloco-b",
    blocoRotulo: "Bloco B · Planejamento",
    ordem: 4,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["tempo", "planejar", "ordem"],
    thumbnail: "/trilha/orcamento.png",
    estadoInicial: "travado",
    destravadoPor: "ef12-quero-ou-preciso",
    habilidades: ["EF12LF06", "EF12LF07"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Hoje, depois, mais longe",
        conteudo: {
          "texto": "Algumas coisas acontecem hoje. Outras acontecem mês que vem. Outras só ano que vem. Isso é curto, médio e longo prazo. Planejar é colocar as coisas em ordem no tempo. Quem planeja sabe o que vem primeiro.",
          "destaque": "Curto é hoje. Médio é mês que vem. Longo é ano que vem.",
          "mediacao": "Use o calendário da parede para mostrar hoje, o mês e o ano."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A bola de Andressa",
        conteudo: {
          "personagem": "Andressa",
          "texto": "Andressa quer uma bola que custa 30 reais. Ela junta 5 reais por mês do troco que sobra. Em um mês ela tem 5 reais. Em seis meses ela tem 30 reais. Andressa marcou no calendário o mês em que vai dar certo.",
          "pergunta": "Quantos meses Andressa espera até ter a bola?",
          "mediacao": "Conte os meses no calendário junto com a criança."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Curto ou longo",
        conteudo: {
          "enunciado": "Juntar 5 reais por mês até 30 reais leva seis meses. Isso é o quê?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Curto prazo, porque acontece hoje.",
              "correta": false,
              "feedback": "Hoje não dá. Seis meses é bem mais tempo."
            },
            {
              "id": "b",
              "texto": "Médio prazo, porque leva alguns meses.",
              "correta": true,
              "feedback": "Isso. Não é hoje nem daqui a anos. Fica no meio."
            },
            {
              "id": "c",
              "texto": "Longo prazo, porque passa de um ano.",
              "correta": false,
              "feedback": "Seis meses é menos de um ano. Ainda não é longo."
            }
          ],
          "mediacao": "Marque seis meses no calendário antes de responder."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Quando isso cabe",
        conteudo: {
          "pergunta": "Pense em algo que você quer. Quando dá para acontecer?",
          "campo": "faixa",
          "placeholder": "Mês que vem",
          "faixas": [
            "Hoje",
            "Esta semana",
            "Mês que vem",
            "Ano que vem"
          ],
          "ajuda": "Escolher a faixa mais perto já serve.",
          "mediacao": "Peça para a criança dizer em voz alta o que ela pensou."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Cada plano tem seu tempo",
        conteudo: {
          "texto": "Você escolheu {valor}. Cada plano tem um tempo certo. Saber o tempo ajuda a organizar os passos na ordem.",
          "regras": [
            {
              "se": "valor == 'Hoje' ou valor == 'Esta semana'",
              "entao": "É curto prazo. Um passo hoje já resolve boa parte."
            },
            {
              "se": "valor == 'Mês que vem'",
              "entao": "É médio prazo. Dá para dividir em quatro semanas."
            },
            {
              "se": "valor == 'Ano que vem'",
              "entao": "É longo prazo. Marque no calendário para não esquecer."
            }
          ],
          "proximoPasso": "Escreva num papel o primeiro passo e cole num lugar que você vê todo dia.",
          "mediacao": "Ajude a criança a escrever o primeiro passo no papel."
        },
      },
    ],
  },
  {
    slug: "ef12-juntar-da-certo",
    titulo: "Juntar dá certo",
    subtitulo: "O cofrinho e a ideia de guardar para conseguir algo.",
    segmento: "ef12",
    blocoId: "ef12-bloco-c",
    blocoRotulo: "Bloco C · Poupança e investimento",
    ordem: 5,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["poupar", "cofrinho", "guardar"],
    thumbnail: "/trilha/poupar.png",
    estadoInicial: "travado",
    destravadoPor: "ef12-hoje-mes-que-vem",
    habilidades: ["EF12LF10", "EF12LF11", "EF12LF12"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Guardar um pouco por vez",
        conteudo: {
          "texto": "Poupar é juntar dinheiro aos poucos e guardar. Guardado, o dinheiro não some em compras pequenas. Depois de um tempo, o valor junto dá para comprar algo maior. O cofrinho é um lugar simples de guardar. Poupar é isso: juntar e esperar.",
          "destaque": "Poupar é juntar e guardar até dar para comprar.",
          "mediacao": "Mostre um cofrinho ou um pote com tampa enquanto lê."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O pote de Aparecida",
        conteudo: {
          "personagem": "Aparecida",
          "texto": "Aparecida quer um estojo de 12 reais. Ela guarda 2 reais por semana num pote de vidro. Na primeira semana tem 2 reais. Na sexta semana tem 12 reais. Nesse dia, ela tira o dinheiro do pote e compra o estojo.",
          "pergunta": "Quantas semanas Aparecida guardou até conseguir o estojo?",
          "mediacao": "Conte as semanas com os dedos junto com a criança."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Quanto falta",
        conteudo: {
          "enunciado": "Aparecida já tem 8 reais no pote. O estojo custa 12. Quanto falta?",
          "alternativas": [
            {
              "id": "a",
              "texto": "2 reais.",
              "correta": false,
              "feedback": "8 mais 2 dá 10. Ainda não chega em 12."
            },
            {
              "id": "b",
              "texto": "4 reais.",
              "correta": true,
              "feedback": "Isso. 8 mais 4 dá 12, o preço do estojo."
            },
            {
              "id": "c",
              "texto": "12 reais.",
              "correta": false,
              "feedback": "Esse é o preço inteiro. Parte dele ela já tem."
            }
          ],
          "mediacao": "Use 12 tampinhas para a criança separar e contar."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Seu cofrinho",
        conteudo: {
          "pergunta": "Quantos reais você guardaria por semana num cofrinho?",
          "campo": "numero",
          "placeholder": "2",
          "ajuda": "Um número pequeno já vale; chutar por alto serve.",
          "mediacao": "Explique que guardar pouco também conta e anote o número."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Em quatro semanas",
        conteudo: {
          "texto": "Você guardaria {valor} reais por semana. Em quatro semanas isso vira quatro vezes esse valor. Guardar sempre no mesmo dia ajuda a não esquecer.",
          "regras": [
            {
              "se": "valor == 0",
              "entao": "Tem semana em que não sobra nada. Guardar depois também vale."
            },
            {
              "se": "valor entre 1 e 5",
              "entao": "Pouco por semana junta. Em um mês já dá para ver."
            },
            {
              "se": "valor > 5",
              "entao": "É bastante por semana. Veja se dá para manter todo mês."
            }
          ],
          "proximoPasso": "Separe hoje um pote com tampa e guarde a primeira moeda nele.",
          "mediacao": "Ajude a criança a fazer a conta de quatro semanas."
        },
      },
    ],
  },
  {
    slug: "ef35-jeitos-de-pagar",
    titulo: "Jeitos de pagar",
    subtitulo: "Dinheiro, cartão, Pix, carnê: cada um tem seu preço.",
    segmento: "ef35",
    blocoId: "ef35-bloco-a",
    blocoRotulo: "Bloco A · Circulação social do dinheiro",
    ordem: 1,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["pagamento", "pix", "cartao"],
    thumbnail: "/trilha/circulacao.png",
    estadoInicial: "disponivel",
    habilidades: ["EF35LF01", "EF35LF02", "EF45LF01"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Vários jeitos, um produto",
        conteudo: {
          "texto": "Existem vários jeitos de pagar a mesma compra. Dinheiro em espécie, Pix, cartão de débito, cartão de crédito e carnê da loja. Todos entregam o produto. O que muda é quando o dinheiro sai da sua mão. No Pix e no dinheiro, sai na hora. No carnê e no crédito, sai depois, em pedaços.",
          "destaque": "Pagar à vista tira o dinheiro agora. A prazo, tira depois, aos poucos.",
          "mediacao": "Pergunte quais desses jeitos de pagar a criança já viu alguém usar."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O tênis com três preços",
        conteudo: {
          "personagem": "Ariane",
          "texto": "Ariane vai comprar um tênis de R$ 120. Na loja, o vendedor oferece três jeitos. Sai por R$ 108 no Pix agora. Sai por R$ 120 no cartão de débito. Ou vira um carnê de quatro parcelas de R$ 33. Ariane soma o carnê e chega em R$ 132.",
          "pergunta": "Por que o mesmo tênis custa três preços diferentes?",
          "mediacao": "Escreva os três preços no quadro e compare em voz alta com a turma."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Qual sai mais barato",
        conteudo: {
          "enunciado": "Ariane tem os R$ 120 guardados e quer gastar o mínimo. Qual jeito cobra menos por esse tênis?",
          "alternativas": [
            {
              "id": "a",
              "texto": "O carnê de quatro parcelas de R$ 33.",
              "correta": false,
              "feedback": "Cada parcela é pequena, mas as quatro somam R$ 132. É o jeito mais caro dos três."
            },
            {
              "id": "b",
              "texto": "O Pix, que sai por R$ 108 na hora.",
              "correta": true,
              "feedback": "Certo. Pagar à vista rendeu R$ 12 de desconto, e ela tinha o dinheiro guardado."
            },
            {
              "id": "c",
              "texto": "O cartão de débito, por R$ 120.",
              "correta": false,
              "feedback": "O débito também tira o dinheiro na hora, mas sem desconto. São R$ 12 a mais que o Pix."
            }
          ],
          "mediacao": "Leia as três opções em voz alta e peça a justificativa antes de marcar."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "O preço da sua lista",
        conteudo: {
          "pergunta": "Escreva o preço de algo que você gostaria de comprar.",
          "campo": "moeda",
          "placeholder": "R$ 80",
          "ajuda": "Se não souber o preço exato, um valor aproximado já serve.",
          "mediacao": "Ajude a criança a lembrar de um preço que viu em loja ou anúncio."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "À vista ou aos poucos",
        conteudo: {
          "texto": "Você anotou {valor}. Imagine esse preço em dois caminhos. Um: pagar tudo de uma vez. Outro: pagar em quatro pedaços, ao longo de quatro meses. O produto chega igual nos dois. O que muda é quanto sai e quando.",
          "regras": [
            {
              "se": "valor <= 50",
              "entao": "É um preço que cabe à vista com pouca espera. Guardar algumas semanas costuma custar menos que parcelar."
            },
            {
              "se": "valor entre 51 e 200",
              "entao": "Nessa faixa a loja costuma oferecer carnê. Compare o total do carnê com o preço à vista."
            },
            {
              "se": "valor > 200",
              "entao": "Compra grande quase sempre vem com parcelas. Some todas elas: o total costuma passar do preço à vista."
            }
          ],
          "proximoPasso": "Pergunte em casa qual jeito de pagar a família mais usa e por quê.",
          "mediacao": "Peça um exemplo de compra à vista e outro de compra a prazo."
        },
      },
    ],
  },
  {
    slug: "ef35-preco-nao-e-valor",
    titulo: "Preço não é valor",
    subtitulo: "Por que duas coisas parecidas custam diferente.",
    segmento: "ef35",
    blocoId: "ef35-bloco-a",
    blocoRotulo: "Bloco A · Circulação social do dinheiro",
    ordem: 2,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["preco", "valor", "marca"],
    thumbnail: "/trilha/circulacao.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-jeitos-de-pagar",
    habilidades: ["EF35LF03", "EF35LF04"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Etiqueta e uso",
        conteudo: {
          "texto": "Preço é o número da etiqueta. Ele é igual para todo mundo que entra na loja. Valor é o quanto a coisa serve para você. Esse muda de pessoa para pessoa. Uma bola de R$ 40 tem o mesmo preço para todos. Mas vale mais para quem joga todo dia.",
          "destaque": "Preço vem da etiqueta. Valor vem de quem usa.",
          "mediacao": "Peça um exemplo de algo barato que a criança considera muito importante."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Dois cadernos",
        conteudo: {
          "personagem": "Benedito",
          "texto": "Benedito quer um caderno. Na papelaria há dois. Um custa R$ 8, tem capa simples e 96 folhas. O outro custa R$ 25, tem o desenho de um jogo famoso e 80 folhas. O mais caro tem menos folhas. Benedito escreve muito e gasta caderno rápido.",
          "pergunta": "O que o preço a mais está pagando, se as folhas são menos?",
          "mediacao": "Peça para a criança comparar o número de folhas antes de olhar o preço."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Por que custa mais",
        conteudo: {
          "enunciado": "O caderno de R$ 25 tem menos folhas e custa mais. O que explica esse preço maior?",
          "alternativas": [
            {
              "id": "a",
              "texto": "O papel dele é caro porque tem menos folhas.",
              "correta": false,
              "feedback": "Menos folhas usam menos papel, não mais. A diferença está em outra coisa."
            },
            {
              "id": "b",
              "texto": "A marca e o desenho do jogo na capa, que muita gente procura.",
              "correta": true,
              "feedback": "Isso. Marca, desenho licenciado e procura entram no preço. Nada disso melhora o que o caderno faz."
            },
            {
              "id": "c",
              "texto": "O mais caro é sempre o de melhor qualidade.",
              "correta": false,
              "feedback": "Nem sempre. Aqui o mais caro tem menos folhas: preço alto não garante qualidade."
            }
          ],
          "mediacao": "Leia as alternativas e peça para a criança apontar qual explica o preço."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Barato e importante",
        conteudo: {
          "pergunta": "Pense numa coisa sua que custou pouco e é muito importante para você. Quanto custou?",
          "campo": "moeda",
          "placeholder": "R$ 10",
          "ajuda": "Se não lembrar o preço exato, um valor aproximado já serve.",
          "mediacao": "Ajude a criança a escolher um objeto real, da casa ou da mochila."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Duas medidas diferentes",
        conteudo: {
          "texto": "Essa coisa custou {valor}. Mesmo assim, você a escolheu como importante. Isso mostra que preço e valor são medidas diferentes. Uma está na etiqueta. A outra está em quem usa.",
          "regras": [
            {
              "se": "valor <= 20",
              "entao": "Uma coisa barata em lugar importante é a prova de que valor não vem do preço."
            },
            {
              "se": "valor entre 21 e 100",
              "entao": "Preço médio e uso constante. Aqui preço e valor andam perto, mas continuam sendo coisas diferentes."
            },
            {
              "se": "valor > 100",
              "entao": "Foi um gasto alto. Pergunte quanto do preço veio do uso e quanto veio da marca."
            }
          ],
          "proximoPasso": "Compare hoje dois produtos parecidos na mesma prateleira e veja o que muda o preço.",
          "mediacao": "Peça para a criança explicar a diferença entre preço e valor com as próprias palavras."
        },
      },
    ],
  },
  {
    slug: "ef35-troco-desconto-lucro",
    titulo: "Troco, desconto, lucro e prejuízo",
    subtitulo: "As quatro contas que aparecem em toda compra e venda.",
    segmento: "ef35",
    blocoId: "ef35-bloco-a",
    blocoRotulo: "Bloco A · Circulação social do dinheiro",
    ordem: 3,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["troco", "desconto", "lucro"],
    thumbnail: "/trilha/circulacao.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-preco-nao-e-valor",
    habilidades: ["EF35LF05", "EF35LF06", "EF45LF02"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Quatro contas da venda",
        conteudo: {
          "texto": "Troco é o dinheiro que volta quando você paga mais do que a conta. Desconto é um abatimento no preço, antes de pagar. Quem vende também faz contas. Se entrou mais do que foi gasto para produzir, houve lucro. Se entrou menos, houve prejuízo.",
          "destaque": "Troco volta depois de pagar. Desconto tira antes de pagar.",
          "mediacao": "Peça exemplos de troco que a criança já viu e anote no quadro."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Os bolinhos da feira",
        conteudo: {
          "personagem": "Bruna",
          "texto": "Bruna gastou R$ 30 com ingredientes e assou 20 bolinhos para a feira da escola. Vendeu cada um por R$ 3. Uma professora levou dois, pagou com uma nota de R$ 10 e recebeu troco. No fim, para não sobrar nada, Bruna deu R$ 1 de desconto nos últimos quatro.",
          "pergunta": "Quanto a professora recebeu de troco, e quanto entrou na caixa no fim?",
          "mediacao": "Faça a conta do troco no papel: R$ 10 menos dois bolinhos de R$ 3."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Quanto entrou na caixa",
        conteudo: {
          "enunciado": "Bruna vendeu 16 bolinhos por R$ 3 e mais quatro com R$ 1 de desconto cada. Quanto entrou?",
          "alternativas": [
            {
              "id": "a",
              "texto": "R$ 60, porque eram 20 bolinhos de R$ 3.",
              "correta": false,
              "feedback": "R$ 60 seria o total sem desconto. Os quatro últimos saíram por R$ 2 cada."
            },
            {
              "id": "b",
              "texto": "R$ 56",
              "correta": true,
              "feedback": "Certo. São 16 × R$ 3 = R$ 48, mais 4 × R$ 2 = R$ 8. Total de R$ 56."
            },
            {
              "id": "c",
              "texto": "R$ 40, tirando R$ 1 de cada um dos 20 bolinhos.",
              "correta": false,
              "feedback": "O desconto valeu só para os quatro últimos. Os outros 16 saíram por R$ 3 cheios."
            }
          ],
          "mediacao": "Deixe a criança fazer as duas multiplicações no papel antes de marcar."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Seu preço de venda",
        conteudo: {
          "pergunta": "Se você vendesse bolinhos como Bruna, por quanto venderia cada um?",
          "campo": "moeda",
          "placeholder": "R$ 3",
          "ajuda": "Pense num preço que as pessoas da sua escola pagariam; estimativa serve.",
          "mediacao": "Ajude a criança a pensar em quanto os colegas pagariam de verdade."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Sobrou ou faltou",
        conteudo: {
          "texto": "Você venderia cada bolinho por {valor}. Com 20 vendidos, é esse preço vezes 20 que entra na caixa. Desse total ainda sai o gasto com ingredientes, que foi R$ 30. O que sobra é lucro. Se não sobrar nada, é prejuízo.",
          "regras": [
            {
              "se": "valor < 1,50",
              "entao": "Vinte bolinhos a esse preço entram com menos de R$ 30. Como o gasto foi R$ 30, dá prejuízo."
            },
            {
              "se": "valor entre 1,50 e 3",
              "entao": "Entram entre R$ 30 e R$ 60. Empata ou sobra pouco: o lucro existe, mas é apertado."
            },
            {
              "se": "valor > 3",
              "entao": "Entram mais de R$ 60 e sobram mais de R$ 30 de lucro. Se as pessoas aceitarem pagar."
            }
          ],
          "proximoPasso": "Some hoje o gasto e a entrada de uma venda pequena da sua escola.",
          "mediacao": "Faça junto a multiplicação do preço por 20 e subtraia os R$ 30."
        },
      },
    ],
  },
  {
    slug: "ef35-papeis-do-dinheiro",
    titulo: "Os papéis do dinheiro",
    subtitulo: "Recibo, cupom, boleto: o que cada documento conta.",
    segmento: "ef35",
    blocoId: "ef35-bloco-a",
    blocoRotulo: "Bloco A · Circulação social do dinheiro",
    ordem: 4,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["cupom", "recibo", "boleto"],
    thumbnail: "/trilha/circulacao.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-troco-desconto-lucro",
    habilidades: ["EF35LF07", "EF35LF08"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Cada papel tem função",
        conteudo: {
          "texto": "Toda compra deixa um registro, no papel ou na tela. O cupom fiscal mostra o que foi comprado e quanto custou. O recibo prova que alguém pagou. O boleto é uma cobrança com data de vencimento. O extrato lista o que entrou e o que saiu de uma conta.",
          "destaque": "Cada documento responde uma pergunta: o quê, quanto, quem pagou, até quando.",
          "mediacao": "Leve um cupom fiscal de verdade e mostre onde fica cada informação."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A caixa de papéis",
        conteudo: {
          "personagem": "Camila",
          "texto": "Camila ajuda a organizar os papéis da casa numa caixa. Aparecem três. Um cupom fiscal do mercado, com 12 itens e total de R$ 87,40. Um boleto da internet de R$ 79, com vencimento no dia 15. E um recibo assinado do conserto da geladeira, de R$ 150.",
          "pergunta": "Qual desses três papéis tem uma data que não pode ser esquecida?",
          "mediacao": "Peça para a criança apontar, em cada papel, onde aparece o valor."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Onde está a resposta",
        conteudo: {
          "enunciado": "Camila quer saber quanto a família gastou no mercado e o que comprou. Qual documento responde as duas coisas?",
          "alternativas": [
            {
              "id": "a",
              "texto": "O boleto da internet, porque mostra um valor.",
              "correta": false,
              "feedback": "O boleto mostra um valor, mas é a cobrança da internet. Ele não lista compras do mercado."
            },
            {
              "id": "b",
              "texto": "O cupom fiscal, que lista os itens e o total.",
              "correta": true,
              "feedback": "Isso. O cupom fiscal traz item por item, a quantidade e o total pago."
            },
            {
              "id": "c",
              "texto": "O recibo do conserto, porque prova um pagamento.",
              "correta": false,
              "feedback": "O recibo prova que o conserto foi pago. Ele não diz nada sobre o mercado."
            }
          ],
          "mediacao": "Leia as três opções e peça a justificativa da escolha antes de marcar."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "O total do seu cupom",
        conteudo: {
          "pergunta": "Procure um cupom fiscal em casa ou na mochila. Qual é o total dele?",
          "campo": "moeda",
          "placeholder": "R$ 42,90",
          "ajuda": "Se não achar nenhum, use o valor de uma compra que você lembra.",
          "mediacao": "Ajude a achar a linha do total, que costuma vir em letra maior no fim."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Ler é achar a linha",
        conteudo: {
          "texto": "O total do seu cupom foi {valor}. Esse número fica numa linha específica do documento. Perto dele estão a data e a lista do que foi comprado. Saber onde procurar é o que transforma um papel em informação útil.",
          "regras": [
            {
              "se": "valor <= 30",
              "entao": "Compra pequena. Confira se todos os itens da lista foram mesmo levados: erro de cupom acontece."
            },
            {
              "se": "valor entre 31 e 150",
              "entao": "Compra do dia a dia. Vale comparar o total do cupom com o que estava combinado."
            },
            {
              "se": "valor > 150",
              "entao": "Compra grande. Guarde esse cupom: ele serve para trocar produto e conferir cobrança depois."
            }
          ],
          "proximoPasso": "Guarde um cupom hoje e circule nele a data, o total e um item.",
          "mediacao": "Faça a leitura final com o cupom na mão, apontando cada parte citada."
        },
      },
    ],
  },
  {
    slug: "ef35-quero-ou-preciso-2",
    titulo: "Querer é ilimitado, ter não é",
    subtitulo: "Prioridade aparece quando o recurso acaba antes do desejo.",
    segmento: "ef35",
    blocoId: "ef35-bloco-b",
    blocoRotulo: "Bloco B · Planejamento",
    ordem: 5,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["desejo", "necessidade", "prioridade"],
    thumbnail: "/trilha/orcamento.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-papeis-do-dinheiro",
    habilidades: ["EF35LF09", "EF45LF06"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Lista sem fim",
        conteudo: {
          "texto": "Necessidade é o que você precisa para viver e estudar. Comida, remédio e material escolar entram aí. Desejo é o que você gostaria de ter, mesmo sem precisar. Os dois são legítimos. O problema é que a lista de desejos nunca acaba e o dinheiro acaba. Por isso é preciso escolher a ordem.",
          "destaque": "A lista de desejos não tem fim. O dinheiro tem. Daí vem a prioridade.",
          "mediacao": "Peça um exemplo de necessidade e um de desejo antes de seguir."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Quatro coisas, R$ 50",
        conteudo: {
          "personagem": "Carlos",
          "texto": "Carlos tem R$ 50 juntados. Ele quer quatro coisas. Um jogo de R$ 45. Um tênis de futsal de R$ 90. Um fone de R$ 35. E a caneta que acabou, de R$ 5, exigida na lista da escola. Somando tudo, dá R$ 175. Ele tem menos de um terço desse total.",
          "pergunta": "Com R$ 50, o que entra primeiro na lista de Carlos?",
          "mediacao": "Escreva os quatro itens no quadro e peça para a turma ordenar."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "O que vem primeiro",
        conteudo: {
          "enunciado": "Carlos tem R$ 50 e quer R$ 175 em coisas. Qual é a melhor primeira compra?",
          "alternativas": [
            {
              "id": "a",
              "texto": "O jogo de R$ 45, porque é o que ele mais quer.",
              "correta": false,
              "feedback": "É o maior desejo, mas gastaria quase tudo. A caneta pedida pela escola ficaria de fora."
            },
            {
              "id": "b",
              "texto": "A caneta de R$ 5, que a escola pediu.",
              "correta": true,
              "feedback": "Certo. A necessidade entra primeiro, e ainda sobram R$ 45 para escolher com calma."
            },
            {
              "id": "c",
              "texto": "O tênis de R$ 90, porque é o mais caro.",
              "correta": false,
              "feedback": "Ele não tem R$ 90. Preço alto não é o mesmo que prioridade."
            }
          ],
          "mediacao": "Peça para a criança dizer quanto sobra em cada uma das opções."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua lista de agora",
        conteudo: {
          "pergunta": "Quantas coisas você gostaria de comprar se pudesse escolher agora?",
          "campo": "numero",
          "placeholder": "5",
          "ajuda": "Conte tudo que vier à cabeça; não precisa pensar no preço.",
          "mediacao": "Deixe a criança listar em voz alta e conte os itens junto com ela."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Ordem, não corte",
        conteudo: {
          "texto": "Você listou {valor} coisas. Agora pense no dinheiro disponível hoje. Quase sempre ele cabe em menos itens do que a lista. Isso não é falha sua nem da sua família: é assim para todo mundo. A saída é decidir a ordem, e a necessidade vai primeiro.",
          "regras": [
            {
              "se": "valor <= 3",
              "entao": "Lista curta. Marque qual desses é necessidade e qual é desejo antes de escolher."
            },
            {
              "se": "valor entre 4 e 8",
              "entao": "Lista média. Separe em duas colunas, necessidade e desejo, e numere a ordem."
            },
            {
              "se": "valor > 8",
              "entao": "Lista longa, o que é normal. Ela mostra que desejo não acaba: escolha só os dois primeiros."
            }
          ],
          "proximoPasso": "Escreva sua lista em duas colunas: necessidade de um lado, desejo do outro.",
          "mediacao": "Ajude a numerar a ordem dos itens da lista depois de ler o fechamento."
        },
      },
    ],
  },
  {
    slug: "ef35-onde-quero-chegar",
    titulo: "Onde eu quero chegar",
    subtitulo: "Objetivo de curto, médio e longo prazo com data e valor.",
    segmento: "ef35",
    blocoId: "ef35-bloco-b",
    blocoRotulo: "Bloco B · Planejamento",
    ordem: 6,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["objetivo", "prazo", "planejamento"],
    thumbnail: "/trilha/orcamento.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-quero-ou-preciso-2",
    habilidades: ["EF35LF10", "EF45LF08"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Valor e data",
        conteudo: {
          "texto": "Objetivo é uma coisa que você quer alcançar, com valor e data. Curto prazo é o que cabe em poucas semanas. Médio prazo leva alguns meses. Longo prazo passa de um ano. Escrever o valor e a data transforma o desejo em plano. É isso que mostra quanto guardar por semana.",
          "destaque": "Objetivo sem valor e sem data continua sendo só vontade.",
          "mediacao": "Pergunte o que a criança quer conseguir até o fim do mês."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Três objetivos na folha",
        conteudo: {
          "personagem": "Cássia",
          "texto": "Cássia quer três coisas. Um livro de R$ 40. Uma bicicleta usada de R$ 300. E um curso de natação que começa no ano que vem. Ela consegue guardar R$ 10 por semana, do que ganha ajudando a vizinha com as plantas. Cássia escreve os três numa folha e põe uma data em cada.",
          "pergunta": "Qual dos três objetivos ela alcança primeiro, e em quantas semanas?",
          "mediacao": "Faça a divisão junto: R$ 40 guardando R$ 10 por semana dá quantas semanas?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Quantas semanas",
        conteudo: {
          "enunciado": "Cássia guarda R$ 10 por semana. Em quantas semanas ela junta os R$ 300 da bicicleta?",
          "alternativas": [
            {
              "id": "a",
              "texto": "10 semanas",
              "correta": false,
              "feedback": "Em 10 semanas ela junta R$ 100, um terço do preço. Ainda faltariam R$ 200."
            },
            {
              "id": "b",
              "texto": "30 semanas",
              "correta": true,
              "feedback": "Certo. R$ 300 divididos por R$ 10 dão 30 semanas, cerca de sete meses. É médio prazo."
            },
            {
              "id": "c",
              "texto": "300 semanas",
              "correta": false,
              "feedback": "Aí você contou uma semana por real. Cada semana entra R$ 10, não R$ 1."
            }
          ],
          "mediacao": "Deixe a criança fazer a divisão no papel antes de escolher a alternativa."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Seu objetivo",
        conteudo: {
          "pergunta": "Escreva o valor de um objetivo que você quer alcançar.",
          "campo": "moeda",
          "placeholder": "R$ 60",
          "ajuda": "Vale um preço aproximado; o importante é ter um número para dividir.",
          "mediacao": "Ajude a criança a escolher um objetivo real e lembrar o preço aproximado."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Do valor até a data",
        conteudo: {
          "texto": "Seu objetivo custa {valor}. Divida esse número pelo que você consegue guardar por semana. O resultado é a data. Guardando R$ 5 por semana, por exemplo, R$ 100 levam 20 semanas.",
          "regras": [
            {
              "se": "valor <= 50",
              "entao": "Objetivo de curto prazo. Guardando R$ 5 por semana, ele chega em até dez semanas."
            },
            {
              "se": "valor entre 51 e 200",
              "entao": "Objetivo de médio prazo, de alguns meses. Marque a data no calendário para não largar no meio."
            },
            {
              "se": "valor > 200",
              "entao": "Objetivo de longo prazo. Divida em etapas menores e confira cada pedaço juntado."
            }
          ],
          "proximoPasso": "Escreva hoje seu objetivo num papel, com o valor e a data ao lado.",
          "mediacao": "Ajude a criança a calcular a data a partir do valor que ela escreveu."
        },
      },
    ],
  },
  {
    slug: "ef35-o-que-e-orcamento",
    titulo: "O que é um orçamento",
    subtitulo: "Receita, despesa e o caderno onde isso vive.",
    segmento: "ef35",
    blocoId: "ef35-bloco-b",
    blocoRotulo: "Bloco B · Planejamento",
    ordem: 7,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["orcamento", "receita", "despesa"],
    thumbnail: "/trilha/orcamento.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-onde-quero-chegar",
    habilidades: ["EF35LF11", "EF35LF12", "EF35LF13"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O que entra e o que sai",
        conteudo: {
          "texto": "Orçamento é o registro do dinheiro que entra e do que sai, num período. O que entra chama-se receita: salário, venda, ajuda de alguém. O que sai chama-se despesa: mercado, transporte, conta de luz. Anotar os dois num caderno ou no celular mostra para onde o dinheiro está indo.",
          "destaque": "Receita é o que entra. Despesa é o que sai. Orçamento registra os dois.",
          "mediacao": "Peça exemplos de dinheiro que entra e que sai na casa da criança."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O caixa da festa",
        conteudo: {
          "personagem": "Célia",
          "texto": "Célia cuida do caixa da festa junina da turma. Entraram R$ 200 da rifa e R$ 120 da venda de pipoca. Saíram R$ 90 de ingredientes, R$ 40 de enfeites e R$ 25 de sacos e copos. Ela anota tudo numa folha, com duas colunas: o que entrou e o que saiu.",
          "pergunta": "Quanto entrou, quanto saiu e o que sobrou no caixa da Célia?",
          "mediacao": "Monte as duas colunas no quadro com a turma e some cada uma delas."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Em qual coluna",
        conteudo: {
          "enunciado": "Na folha de Célia, em qual coluna entram os R$ 90 dos ingredientes, e por quê?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Na de receita, porque o dinheiro foi usado na festa.",
              "correta": false,
              "feedback": "Receita é só o que entra. Os ingredientes foram dinheiro saindo do caixa."
            },
            {
              "id": "b",
              "texto": "Na de despesa, porque foi dinheiro que saiu do caixa.",
              "correta": true,
              "feedback": "Certo. Toda saída é despesa, mesmo quando serve para produzir algo que será vendido."
            },
            {
              "id": "c",
              "texto": "Em nenhuma, porque a pipoca foi vendida depois.",
              "correta": false,
              "feedback": "Todo valor que sai precisa ser anotado. Sem isso, o registro não bate com o dinheiro real."
            }
          ],
          "mediacao": "Leia a pergunta e peça para a criança apontar a coluna certa no quadro."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua receita da semana",
        conteudo: {
          "pergunta": "Quanto de dinheiro entrou na sua mão nos últimos sete dias?",
          "campo": "moeda",
          "placeholder": "R$ 15",
          "ajuda": "Conte troco, presente, venda ou mesada. Se não entrou nada, anote zero.",
          "mediacao": "Ajude a criança a lembrar de entradas pequenas, inclusive troco e presente."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Falta a outra coluna",
        conteudo: {
          "texto": "Entraram {valor} na sua mão em sete dias. Essa é a sua receita da semana. Agora falta a outra coluna: quanto saiu. Um orçamento só funciona quando as duas colunas existem e são anotadas na hora.",
          "regras": [
            {
              "se": "valor = 0",
              "entao": "Semana sem entrada acontece, e não é problema seu. O registro ainda mostra quando o dinheiro aparece."
            },
            {
              "se": "valor entre 1 e 50",
              "entao": "Entrada pequena e comum nessa idade. Anotar cada real ajuda a ver quanto some sem você perceber."
            },
            {
              "se": "valor > 50",
              "entao": "Entrou um valor razoável. Sem registrar as saídas, ele some sem explicação até o fim do mês."
            }
          ],
          "proximoPasso": "Faça hoje uma folha com duas colunas e anote uma entrada e uma saída.",
          "mediacao": "Monte a folha de duas colunas junto com a criança antes de encerrar."
        },
      },
    ],
  },
  {
    slug: "ef35-orcamento-que-fecha",
    titulo: "Fazendo o orçamento fechar",
    subtitulo: "Gastar menos do que entra, sozinho ou em grupo.",
    segmento: "ef35",
    blocoId: "ef35-bloco-b",
    blocoRotulo: "Bloco B · Planejamento",
    ordem: 8,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["orcamento", "saldo", "grupo"],
    thumbnail: "/trilha/orcamento.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-o-que-e-orcamento",
    habilidades: ["EF35LF14", "EF35LF15", "EF35LF16"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Quando o orçamento fecha",
        conteudo: {
          "texto": "Um orçamento fecha quando as despesas ficam menores que as receitas. O que sobra chama-se saldo positivo. É ele que permite guardar ou resolver um imprevisto. Entre os gastos, alguns são só seus, como um lanche. Outros são divididos, como a conta de luz, que serve a casa inteira.",
          "destaque": "Sobrou no fim: saldo positivo. Faltou: o orçamento não fechou.",
          "mediacao": "Pergunte quais gastos da casa são de uma pessoa só e quais são de todos."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O passeio da turma",
        conteudo: {
          "personagem": "Cíntia",
          "texto": "Cíntia organiza o passeio da turma. Entram R$ 15 de cada um dos 20 estudantes, o que dá R$ 300. A despesa prevista é R$ 180 do transporte, dividido por todos. O lanche fica por conta de cada um, que leva ou compra o seu. Ela quer terminar o dia sem dever nada.",
          "pergunta": "Quanto sobra no caixa do passeio, e esse dinheiro é de quem?",
          "mediacao": "Some as entradas e subtraia o transporte no quadro, com a turma acompanhando."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "De todos ou de um",
        conteudo: {
          "enunciado": "No orçamento do passeio, qual gasto é do grupo e qual é individual?",
          "alternativas": [
            {
              "id": "a",
              "texto": "O transporte é individual e o lanche é do grupo.",
              "correta": false,
              "feedback": "É o contrário. O transporte serve a turma inteira e cada lanche é de uma pessoa só."
            },
            {
              "id": "b",
              "texto": "O transporte é do grupo e o lanche é individual.",
              "correta": true,
              "feedback": "Certo. O transporte é dividido entre todos e o lanche cada um resolve por conta própria."
            },
            {
              "id": "c",
              "texto": "Os dois são do grupo, porque estão no mesmo passeio.",
              "correta": false,
              "feedback": "Acontecer no mesmo dia não junta os gastos. No caixa do grupo entra só o que todos pagam."
            }
          ],
          "mediacao": "Peça para a criança dizer quem paga cada um dos dois gastos."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "O custo do seu evento",
        conteudo: {
          "pergunta": "Pense num evento que você faria com a turma. Quanto ele custaria no total?",
          "campo": "moeda",
          "placeholder": "R$ 200",
          "ajuda": "Some as despesas principais; um valor aproximado já serve.",
          "mediacao": "Ajude a criança a listar duas ou três despesas antes de somar."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Quem paga e quanto sobra",
        conteudo: {
          "texto": "Seu evento custaria {valor}. Agora vem a outra metade do orçamento. De onde vem esse dinheiro e quantas pessoas dividem a conta? Se entrar mais do que {valor}, sobra saldo positivo. Se entrar menos, falta, e alguém precisa cobrir a diferença.",
          "regras": [
            {
              "se": "valor <= 100",
              "entao": "Custo baixo. Dividido por uma turma de 20, fica em R$ 5 por pessoa ou menos."
            },
            {
              "se": "valor entre 101 e 300",
              "entao": "Divida pelo número de participantes. Assim você acha a cota e confere se ela cabe no bolso de todos."
            },
            {
              "se": "valor > 300",
              "entao": "Custo alto. Corte uma despesa ou busque outra entrada, como rifa, antes de aumentar a cota."
            }
          ],
          "proximoPasso": "Escreva hoje o orçamento de um evento: entradas de um lado, despesas do outro.",
          "mediacao": "Faça a divisão do custo pelo número de participantes junto com a criança."
        },
      },
    ],
  },
  {
    slug: "ef35-contas-fixas-e-que-mudam",
    titulo: "Contas fixas, contas que mudam",
    subtitulo: "Previsto, imprevisto e por que sobrar é proteção.",
    segmento: "ef35",
    blocoId: "ef35-bloco-b",
    blocoRotulo: "Bloco B · Planejamento",
    ordem: 9,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["contas fixas", "contas variaveis", "imprevisto"],
    thumbnail: "/trilha/orcamento.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-orcamento-que-fecha",
    habilidades: ["EF45LF05", "EF45LF04"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Quais contas mudam de valor",
        conteudo: {
          "texto": "Algumas contas chegam todo mês com o mesmo valor: o aluguel, a internet. São as contas fixas. Outras mudam de um mês para o outro: a luz, a feira, o transporte. São as variáveis. Saber quais são fixas ajuda a prever quanto vai sobrar antes mesmo do mês começar.",
          "destaque": "Conta fixa você já sabe o valor. Conta variável você precisa acompanhar.",
          "mediacao": "Peça para a criança citar uma conta da casa dela e dizer se muda de valor."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O caderno de Cristiane",
        conteudo: {
          "personagem": "Cristiane",
          "texto": "Cristiane anota os gastos da casa num caderno. Todo mês ela paga R$ 120 de internet, sempre igual. A conta de luz veio R$ 60 em maio e R$ 95 em junho. Em julho, a geladeira quebrou e o conserto custou R$ 180. Esse gasto não estava na lista de nenhum mês.",
          "pergunta": "Qual desses três gastos ninguém tinha como prever?",
          "mediacao": "Leia em voz alta e peça para a criança separar os gastos em previstos e imprevisto."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Fixa, variável ou surpresa",
        conteudo: {
          "enunciado": "A conta de luz de Cristiane mudou de R$ 60 para R$ 95. Como esse gasto é classificado no orçamento da casa?",
          "alternativas": [
            {
              "id": "a",
              "texto": "É uma conta fixa, porque chega todo mês.",
              "correta": false,
              "feedback": "Chegar todo mês não faz a conta ser fixa. Fixa é a que mantém o mesmo valor."
            },
            {
              "id": "b",
              "texto": "É uma conta variável e prevista: ela sempre vem, mas o valor muda.",
              "correta": true,
              "feedback": "Isso. Cristiane sabia que a luz viria, só não sabia quanto ela ia custar."
            },
            {
              "id": "c",
              "texto": "É um gasto imprevisto, como o conserto da geladeira.",
              "correta": false,
              "feedback": "O conserto foi surpresa. A luz não: ela chega todo mês, mesmo mudando de valor."
            }
          ],
          "mediacao": "Leia as três alternativas em voz alta antes de a criança escolher."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Um imprevisto da sua casa",
        conteudo: {
          "pergunta": "Pense num gasto imprevisto que já aconteceu na sua casa. Quanto ele custou, mais ou menos?",
          "campo": "moeda",
          "placeholder": "R$ 180",
          "ajuda": "Não precisa acertar o valor exato: uma estimativa já serve para pensar.",
          "mediacao": "Ajude a criança a lembrar de um conserto, um remédio ou um material escolar de última hora."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Por que sobrar protege",
        conteudo: {
          "texto": "Você estimou {valor} de gasto imprevisto. Nenhuma família consegue prever tudo, e por isso guardar um pouco antes ajuda a atravessar o mês quando a surpresa chega.",
          "regras": [
            {
              "se": "valor < 50",
              "entao": "Mesmo um imprevisto pequeno aperta quando o dinheiro já estava todo contado. Sobrar um pouco resolve."
            },
            {
              "se": "valor entre 50 e 200",
              "entao": "Um gasto desse tamanho costuma cair no meio do mês e mexe nas contas variáveis, como a feira."
            },
            {
              "se": "valor > 200",
              "entao": "Imprevisto grande assim quase nunca cabe num mês só. Muitas famílias precisam parcelar ou pedir ajuda, e isso não é falha de ninguém."
            }
          ],
          "proximoPasso": "Escreva com um adulto quais contas da sua casa são fixas e quais mudam de valor.",
          "mediacao": "Comente que imprevistos acontecem em qualquer casa e não são culpa de quem tem pouco."
        },
      },
    ],
  },
  {
    slug: "ef35-orcamento-da-casa-toda",
    titulo: "O orçamento é da casa toda",
    subtitulo: "Cada um tem um papel — e todo gasto tem um depois.",
    segmento: "ef35",
    blocoId: "ef35-bloco-b",
    blocoRotulo: "Bloco B · Planejamento",
    ordem: 10,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["orcamento familiar", "participacao", "prioridade"],
    thumbnail: "/trilha/orcamento.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-contas-fixas-e-que-mudam",
    habilidades: ["EF45LF03", "EF45LF07"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Um plano feito junto",
        conteudo: {
          "texto": "Orçamento é o plano de quanto entra e quanto sai de dinheiro numa casa. Ele não funciona se só uma pessoa cuidar. Quem faz a compra, quem usa a água, quem pede um lanche: cada um mexe no plano. Combinar junto o que vem primeiro faz o dinheiro chegar até o fim do mês.",
          "destaque": "Orçamento combinado por todos é mais fácil de cumprir do que ordem de um só.",
          "mediacao": "Pergunte quem, na casa da criança, costuma decidir o que vai ser comprado."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A conversa na cozinha",
        conteudo: {
          "personagem": "Daniela",
          "texto": "A família de Daniela separou R$ 300 para o mês. Sentaram na cozinha e listaram: gás R$ 110, feira R$ 140 e R$ 50 para o resto. Daniela queria um jogo de R$ 45. Se comprasse, sobrariam R$ 5 para qualquer coisa que aparecesse até o dia 30.",
          "pergunta": "O que a casa de Daniela deixa de poder fazer se ela comprar o jogo agora?",
          "mediacao": "Leia os valores devagar e some com a criança quanto já estava comprometido."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "O que muda no mês",
        conteudo: {
          "enunciado": "Daniela decidiu esperar e não comprou o jogo de R$ 45. O que muda no orçamento da família até o fim do mês?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Nada muda, porque R$ 45 é pouco perto de R$ 300.",
              "correta": false,
              "feedback": "Dos R$ 300, só R$ 50 estavam livres. O jogo levaria quase tudo isso."
            },
            {
              "id": "b",
              "texto": "Continuam com R$ 50 livres para o que aparecer, como remédio ou material.",
              "correta": true,
              "feedback": "Isso. O dinheiro que não foi gasto agora continua disponível para uma necessidade depois."
            },
            {
              "id": "c",
              "texto": "A família precisa cortar a feira para repor o valor.",
              "correta": false,
              "feedback": "Não houve gasto, então nada precisa ser reposto. A feira segue como foi combinada."
            }
          ],
          "mediacao": "Peça para a criança explicar a escolha antes de você confirmar a resposta."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Uma compra que você quer",
        conteudo: {
          "pergunta": "Quanto custa uma coisa que você queria comprar e ainda não comprou?",
          "campo": "moeda",
          "placeholder": "R$ 45",
          "ajuda": "Vale um valor aproximado; o preço exato você confere depois.",
          "mediacao": "Ajude a criança a pensar num item real e a estimar o preço em voz alta."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Todo gasto tem um depois",
        conteudo: {
          "texto": "Você anotou {valor}. Esse é o dinheiro que a casa deixa de ter para outra coisa se a compra for feita agora, e por isso a conversa vale mais do que a decisão sozinha.",
          "regras": [
            {
              "se": "valor <= 50",
              "entao": "Um valor desse costuma caber, mas ainda assim mexe no que sobra. Combine com um adulto antes."
            },
            {
              "se": "valor entre 51 e 200",
              "entao": "Uma compra assim disputa espaço com contas do mês. Vale listar junto o que vem primeiro."
            },
            {
              "se": "valor > 200",
              "entao": "Nesse tamanho, dificilmente entra num mês só. Guardar aos poucos costuma ser o caminho possível."
            }
          ],
          "proximoPasso": "Pergunte hoje a um adulto da casa quais são as três contas mais importantes do mês.",
          "mediacao": "Mostre que a decisão é da casa toda e envolve o que vem depois, não só hoje."
        },
      },
    ],
  },
  {
    slug: "ef35-pesquisar-antes",
    titulo: "Pesquisar antes de comprar",
    subtitulo: "O mesmo produto, três preços, e o que vale a pena.",
    segmento: "ef35",
    blocoId: "ef35-bloco-c",
    blocoRotulo: "Bloco C · Consumo",
    ordem: 11,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["pesquisa de preco", "comparacao", "custo e beneficio"],
    thumbnail: "/trilha/consumo.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-orcamento-da-casa-toda",
    habilidades: ["EF35LF17", "EF45LF10"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O mesmo produto, três preços",
        conteudo: {
          "texto": "O mesmo produto pode ter preços diferentes em cada lugar: na loja da esquina, no mercado grande, num site. Pesquisar é olhar em pelo menos três lugares antes de decidir. E preço não é tudo: conta também o frete, a garantia e o tempo que você leva para chegar lá.",
          "destaque": "O preço mais baixo nem sempre é o que sai mais barato no fim.",
          "mediacao": "Peça para a criança lembrar de um produto que ela viu por preços diferentes."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O estojo de Dayane",
        conteudo: {
          "personagem": "Dayane",
          "texto": "Dayane precisa de um estojo. Na papelaria perto de casa custa R$ 38. No mercado grande, R$ 30, mas a ida e a volta de ônibus custam R$ 10. Num site sai por R$ 26 com R$ 12 de frete e chega em duas semanas. A aula começa segunda.",
          "pergunta": "Somando tudo, qual das três opções sai melhor para Dayane?",
          "mediacao": "Faça a conta de cada opção no papel junto com a criança antes de virar a tela."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Some antes de escolher",
        conteudo: {
          "enunciado": "Somando o preço com o transporte ou com o frete, qual opção custa menos para Dayane e chega a tempo?",
          "alternativas": [
            {
              "id": "a",
              "texto": "O site, por R$ 26, que é o menor preço da vitrine.",
              "correta": false,
              "feedback": "Com R$ 12 de frete o total vai a R$ 38, igual à papelaria, e só chega depois da aula."
            },
            {
              "id": "b",
              "texto": "A papelaria, por R$ 38, sem gasto de transporte e com o estojo na mão hoje.",
              "correta": true,
              "feedback": "Sai por R$ 38 no total e Dayane usa o estojo na segunda. Custo e benefício batem."
            },
            {
              "id": "c",
              "texto": "O mercado grande, por R$ 30, o mais barato entre as lojas.",
              "correta": false,
              "feedback": "Com R$ 10 de ônibus, o total vira R$ 40, mais caro que as outras duas opções."
            }
          ],
          "mediacao": "Confira as somas com a criança: 26 mais 12, 30 mais 10 e 38 sozinho."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua pesquisa de preço",
        conteudo: {
          "pergunta": "Escolha um produto e veja o preço em dois lugares. Qual foi a diferença entre o maior e o menor?",
          "campo": "moeda",
          "placeholder": "R$ 8",
          "ajuda": "Se ainda não pesquisou, estime a diferença que você imagina encontrar.",
          "mediacao": "Ajude a criança a consultar dois preços, um num comércio perto e outro num site."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O que a pesquisa rende",
        conteudo: {
          "texto": "A diferença que você encontrou foi {valor}. Esse é o dinheiro que a pesquisa economiza, e ele só aparece para quem olha em mais de um lugar.",
          "regras": [
            {
              "se": "valor < 10",
              "entao": "Diferença pequena. Aí pesam outras coisas: garantia, prazo de entrega e o custo de ir até lá."
            },
            {
              "se": "valor entre 10 e 50",
              "entao": "Vale pesquisar. Uma diferença assim, repetida em várias compras do mês, muda o orçamento da casa."
            },
            {
              "se": "valor > 50",
              "entao": "Diferença grande. Confira se o produto é exatamente o mesmo e se o mais barato não cobra frete alto."
            }
          ],
          "proximoPasso": "Antes da próxima compra da casa, confira o preço em três lugares e anote os três.",
          "mediacao": "Reforce que somar frete e transporte faz parte da pesquisa de preço."
        },
      },
    ],
  },
  {
    slug: "ef35-planejada-ou-impulso",
    titulo: "Planejada ou por impulso",
    subtitulo: "Como reconhecer o impulso e como dizer não.",
    segmento: "ef35",
    blocoId: "ef35-bloco-c",
    blocoRotulo: "Bloco C · Consumo",
    ordem: 12,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["compra planejada", "impulso", "recusa"],
    thumbnail: "/trilha/consumo.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-pesquisar-antes",
    habilidades: ["EF45LF11", "EF45LF12"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Decidida antes ou na hora",
        conteudo: {
          "texto": "Compra planejada é a que você decidiu antes: sabia o que ia levar e quanto ia gastar. Compra por impulso é a que aparece na hora, perto do caixa ou numa propaganda. Ela não é proibida, mas costuma tirar dinheiro do que já estava combinado. Dizer não também é uma resposta.",
          "destaque": "Se não estava na lista e você decidiu em segundos, provavelmente foi impulso.",
          "mediacao": "Pergunte se a criança já levou algo do caixa que não estava na lista."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Débora na fila do caixa",
        conteudo: {
          "personagem": "Débora",
          "texto": "Débora foi ao mercado com uma lista: arroz, feijão e sabão, R$ 42 no total. Levava R$ 50. Na fila do caixa, viu um chaveiro por R$ 15 com um cartaz de oferta. O vendedor disse que era o último. Ela parou e olhou a lista de novo.",
          "pergunta": "Com R$ 8 de sobra, o chaveiro de R$ 15 cabia na compra de Débora?",
          "mediacao": "Some com a criança quanto sobrou dos R$ 50 depois dos itens da lista."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Como justificar o não",
        conteudo: {
          "enunciado": "Débora recusou o chaveiro. Qual justificativa explica melhor a decisão dela?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Chaveiro é um produto ruim e ninguém deveria comprar.",
              "correta": false,
              "feedback": "O problema não é o produto. É que ele não estava planejado e não cabia no dinheiro."
            },
            {
              "id": "b",
              "texto": "Não estava na lista e custava mais do que os R$ 8 que sobravam.",
              "correta": true,
              "feedback": "Ela comparou o preço com o que tinha e com o que havia planejado. Recusar foi coerente."
            },
            {
              "id": "c",
              "texto": "Deveria ter comprado, porque estava em oferta e era o último.",
              "correta": false,
              "feedback": "Oferta e pressa servem para acelerar a decisão. Estar barato não faz caber no orçamento."
            }
          ],
          "mediacao": "Peça para a criança dizer em voz alta uma frase para recusar sem constrangimento."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua última compra na hora",
        conteudo: {
          "pergunta": "Quanto você gastou na última vez que comprou algo sem ter planejado?",
          "campo": "moeda",
          "placeholder": "R$ 15",
          "ajuda": "Se não lembrar o valor exato, escreva o que parece mais próximo.",
          "mediacao": "Ajude a criança a lembrar de um doce, uma figurinha ou um brinquedo comprado na hora."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Reconhecer o impulso",
        conteudo: {
          "texto": "Você lembrou de {valor} numa compra por impulso. Perceber esse valor não serve para se culpar: serve para reconhecer a situação da próxima vez e conseguir dizer não.",
          "regras": [
            {
              "se": "valor <= 20",
              "entao": "Parece pouco, mas o impulso costuma se repetir. Três vezes no mês já viram um gasto grande."
            },
            {
              "se": "valor entre 21 e 100",
              "entao": "Um valor assim normalmente sai de algo que estava planejado. Vale checar o que deixou de ser comprado."
            },
            {
              "se": "valor > 100",
              "entao": "Compras grandes por impulso pedem uma pausa combinada: esperar um dia inteiro antes de decidir."
            }
          ],
          "proximoPasso": "Na próxima ida ao mercado, leve uma lista escrita e compre só o que está nela.",
          "mediacao": "Combine com a criança uma frase curta de recusa para usar quando alguém insistir."
        },
      },
    ],
  },
  {
    slug: "ef35-comprar-menos-usar-mais",
    titulo: "Comprar menos, usar mais",
    subtitulo: "Recusar, reduzir, reutilizar, reciclar — e economizar no caminho.",
    segmento: "ef35",
    blocoId: "ef35-bloco-c",
    blocoRotulo: "Bloco C · Consumo",
    ordem: 13,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["consumo consciente", "reutilizar", "reciclar"],
    thumbnail: "/trilha/consumo.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-planejada-ou-impulso",
    habilidades: ["EF35LF18", "EF35LF20", "EF35LF21"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Quatro perguntas antes",
        conteudo: {
          "texto": "Antes de comprar algo novo, existem quatro perguntas: dá para recusar, dá para reduzir, dá para reutilizar o que já tem, dá para reciclar? Cada coisa comprada vira lixo um dia, e lixo demais suja rio, rua e ar. Comprar menos economiza dinheiro e diminui o que a casa joga fora.",
          "destaque": "Antes de comprar: recusar, reduzir, reutilizar, reciclar, nessa ordem.",
          "mediacao": "Peça para a criança apontar algo em casa que dá para reutilizar em vez de comprar."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A pasta de Denilson",
        conteudo: {
          "personagem": "Denilson",
          "texto": "A escola de Denilson pediu uma pasta para os trabalhos. A nova custa R$ 22. Ele achou em casa uma pasta do ano passado, meio gasta, e um rolo de fita por R$ 4. Consertou em dez minutos. Guardou R$ 18 e a pasta velha não virou lixo.",
          "pergunta": "Quantas outras coisas da casa de Denilson dariam para consertar em vez de comprar?",
          "mediacao": "Confira a conta com a criança: R$ 22 menos R$ 4."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "A conta do ano inteiro",
        conteudo: {
          "enunciado": "Denilson repete essa escolha em quatro materiais parecidos no ano, economizando R$ 18 em cada um. Quanto ele deixa de gastar?",
          "alternativas": [
            {
              "id": "a",
              "texto": "R$ 36",
              "correta": false,
              "feedback": "R$ 36 seria só duas vezes. Foram quatro materiais: 18 mais 18 mais 18 mais 18."
            },
            {
              "id": "b",
              "texto": "R$ 72",
              "correta": true,
              "feedback": "18 vezes 4 é igual a 72. Reutilizar poucas vezes já muda o valor gasto no ano."
            },
            {
              "id": "c",
              "texto": "R$ 88",
              "correta": false,
              "feedback": "R$ 88 é 22 vezes 4, o preço das pastas novas. A economia é de R$ 18 em cada uma."
            }
          ],
          "mediacao": "Deixe a criança somar 18 quatro vezes no papel antes de escolher."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua economia do mês",
        conteudo: {
          "pergunta": "Quanto você acha que dá para economizar num mês consertando ou reutilizando em vez de comprar?",
          "campo": "moeda",
          "placeholder": "R$ 40",
          "ajuda": "É uma estimativa: pense em duas ou três coisas que dariam para aproveitar.",
          "mediacao": "Ajude a criança a listar itens da casa antes de estimar o valor."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Dois ganhos de uma vez",
        conteudo: {
          "texto": "Sua estimativa foi {valor} por mês. Além do dinheiro, cada item aproveitado é um item a menos no lixo: os dois ganhos vêm juntos.",
          "regras": [
            {
              "se": "valor < 30",
              "entao": "Mesmo pouco por mês vira bastante no ano. E o lixo evitado não depende do valor."
            },
            {
              "se": "valor entre 30 e 150",
              "entao": "Uma economia assim já cobre uma conta pequena da casa, como o material escolar do mês."
            },
            {
              "se": "valor > 150",
              "entao": "Estimativa alta. Vale conferir item por item quanto dá para reaproveitar de verdade."
            }
          ],
          "proximoPasso": "Escolha hoje um objeto quebrado da casa e veja se dá para consertar.",
          "mediacao": "Comente que recusar e reduzir vêm antes de reciclar, porque evitam o lixo na origem."
        },
      },
    ],
  },
  {
    slug: "ef35-o-planeta-na-conta",
    titulo: "O planeta entra na conta",
    subtitulo: "Consumismo, sustentabilidade e o que a economia faz com isso.",
    segmento: "ef35",
    blocoId: "ef35-bloco-c",
    blocoRotulo: "Bloco C · Consumo",
    ordem: 14,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["sustentabilidade", "consumismo", "meio ambiente"],
    thumbnail: "/trilha/consumo.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-comprar-menos-usar-mais",
    habilidades: ["EF35LF19", "EF45LF09"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O que a compra custa ao planeta",
        conteudo: {
          "texto": "Consumismo é comprar muito além do que se usa. Tudo o que é fabricado gasta água, energia e matéria-prima, e depois vira lixo. Algumas atividades cuidam disso: oficinas de conserto, brechós, coleta de recicláveis. Outras não: fábrica que joga resíduo no rio, propaganda que empurra troca a cada mês.",
          "destaque": "Toda compra usa recursos do planeta, antes da loja e depois do lixo.",
          "mediacao": "Pergunte à criança que negócios do bairro consertam ou revendem coisas usadas."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O tênis de Diego",
        conteudo: {
          "personagem": "Diego",
          "texto": "Diego juntou R$ 60 e queria um tênis novo de R$ 55. Na feira do bairro, achou um usado em bom estado por R$ 25 e um lugar que troca o solado por R$ 15. Escolheu o usado. Sobrou R$ 20, e uma caixa a menos de plástico e papelão foi para o lixo.",
          "pergunta": "O que a escolha de Diego mudou, além do dinheiro que sobrou?",
          "mediacao": "Some com a criança R$ 25 mais R$ 15 e veja quanto sobra dos R$ 60."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Qual atividade sustenta",
        conteudo: {
          "enunciado": "Entre os comportamentos abaixo, qual ajuda a sustentabilidade e ainda faz o dinheiro render mais?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Trocar de celular todo ano para ter o modelo mais recente.",
              "correta": false,
              "feedback": "Troca rápida gera lixo eletrônico e consome renda sem necessidade real."
            },
            {
              "id": "b",
              "texto": "Levar o sapato ao sapateiro e comprar usado quando dá.",
              "correta": true,
              "feedback": "Consertar e reaproveitar alonga a vida do produto, gasta menos recursos e custa menos."
            },
            {
              "id": "c",
              "texto": "Comprar sempre o mais barato, mesmo que dure poucas semanas.",
              "correta": false,
              "feedback": "O que dura pouco é trocado logo. Sai caro no ano e vira lixo mais rápido."
            }
          ],
          "mediacao": "Peça para a criança explicar por que trocar sempre custa caro para o planeta."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "O preço da versão nova",
        conteudo: {
          "pergunta": "Pense numa coisa que você compraria usada ou consertada. Quanto custaria comprar ela nova?",
          "campo": "moeda",
          "placeholder": "R$ 55",
          "ajuda": "Um valor aproximado já basta para comparar as duas opções.",
          "mediacao": "Ajude a criança a escolher um objeto real e a lembrar o preço de vitrine."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Nova, usada ou consertada",
        conteudo: {
          "texto": "Nova, essa coisa custaria {valor}. Comprar usado ou consertar costuma custar menos e evita que outro produto precise ser fabricado do zero.",
          "regras": [
            {
              "se": "valor < 50",
              "entao": "Item de preço baixo. Aqui o ganho maior é ambiental: menos embalagem e menos descarte."
            },
            {
              "se": "valor entre 50 e 200",
              "entao": "Nessa faixa, usado ou consertado costuma custar bem menos, e o que sobra vai para outra conta."
            },
            {
              "se": "valor > 200",
              "entao": "Item caro. Compare garantia e estado de conservação antes de decidir entre novo e usado."
            }
          ],
          "proximoPasso": "Procure no seu bairro um brechó, um sapateiro ou um ponto de coleta e anote onde fica.",
          "mediacao": "Explique que negócios de conserto e reuso também geram trabalho e renda no bairro."
        },
      },
    ],
  },
  {
    slug: "ef35-guardar-tem-objetivo",
    titulo: "Guardar tem objetivo",
    subtitulo: "Poupar é escolher o depois em vez do agora.",
    segmento: "ef35",
    blocoId: "ef35-bloco-d",
    blocoRotulo: "Bloco D · Poupança e investimento",
    ordem: 15,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["poupar", "objetivo", "prazo"],
    thumbnail: "/trilha/poupar.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-o-planeta-na-conta",
    habilidades: ["EF35LF22", "EF35LF23", "EF45LF13"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Gastar agora ou usar depois",
        conteudo: {
          "texto": "Gastar é trocar dinheiro por algo agora. Poupar é guardar para usar depois. Quem poupa escolhe o depois no lugar do agora, e isso fica mais fácil quando existe um objetivo com nome e prazo: curto, de semanas; médio, de meses; longo, de anos. Parte do que se guarda fica de reserva.",
          "destaque": "Poupar sem objetivo é difícil; com nome e prazo, vira decisão.",
          "mediacao": "Peça para a criança dizer um objetivo dela e em quanto tempo quer alcançar."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A bicicleta de Dirce",
        conteudo: {
          "personagem": "Dirce",
          "texto": "Dirce quer uma bicicleta usada de R$ 240. Ela recebe R$ 20 por semana ajudando a vizinha com as plantas. Se gastar tudo em lanche, o valor nunca junta. Guardando R$ 20 por semana, chega em doze semanas. Guardando R$ 15 e gastando R$ 5, leva dezesseis semanas.",
          "pergunta": "Vale esperar quatro semanas a mais para poder gastar R$ 5 por semana?",
          "mediacao": "Faça as duas divisões com a criança: 240 dividido por 20 e 240 dividido por 15."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Quanto ainda falta",
        conteudo: {
          "enunciado": "Dirce guardou R$ 20 por semana durante oito semanas. Quanto falta para os R$ 240 da bicicleta?",
          "alternativas": [
            {
              "id": "a",
              "texto": "R$ 60",
              "correta": false,
              "feedback": "R$ 60 seria o que falta depois de nove semanas. Em oito, ela juntou R$ 160."
            },
            {
              "id": "b",
              "texto": "R$ 80",
              "correta": true,
              "feedback": "20 vezes 8 é 160, e 240 menos 160 é 80. Faltam quatro semanas no mesmo ritmo."
            },
            {
              "id": "c",
              "texto": "R$ 160",
              "correta": false,
              "feedback": "R$ 160 é o que ela já guardou, não o que ainda falta juntar."
            }
          ],
          "mediacao": "Deixe a criança fazer a multiplicação e a subtração antes de marcar."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Quanto dá para guardar",
        conteudo: {
          "pergunta": "Quanto você consegue guardar por semana para um objetivo seu?",
          "campo": "moeda",
          "placeholder": "R$ 10",
          "ajuda": "Um valor pequeno e possível funciona melhor do que um valor grande que não se cumpre.",
          "mediacao": "Deixe claro que nem toda criança recebe dinheiro; nesse caso, use um valor imaginado."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Pouco, repetido, com objetivo",
        conteudo: {
          "texto": "Guardando {valor} por semana, ao fim de um ano você teria esse valor multiplicado por 52. Poupar é isso: pouco, repetido, com um objetivo escrito.",
          "regras": [
            {
              "se": "valor <= 5",
              "entao": "Pouco por semana ainda vira algo em alguns meses. Aqui o hábito conta mais do que o tamanho."
            },
            {
              "se": "valor entre 6 e 50",
              "entao": "Nesse ritmo dá para mirar objetivos de médio prazo, de alguns meses, como uma bicicleta usada."
            },
            {
              "se": "valor > 50",
              "entao": "Valor alto para uma semana. Confira se é possível todo mês e deixe uma parte como reserva."
            }
          ],
          "proximoPasso": "Escreva seu objetivo, o preço e quantas semanas faltam, e deixe o papel à vista.",
          "mediacao": "Ajude a criança a escrever o objetivo e a calcular quantas semanas faltam."
        },
      },
    ],
  },
  {
    slug: "ef35-do-cofrinho-pro-banco",
    titulo: "Do cofrinho pro banco",
    subtitulo: "Por que o dinheiro guardado sai de casa.",
    segmento: "ef35",
    blocoId: "ef35-bloco-d",
    blocoRotulo: "Bloco D · Poupança e investimento",
    ordem: 16,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["poupanca", "banco", "conta corrente"],
    thumbnail: "/trilha/poupar.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-guardar-tem-objetivo",
    habilidades: ["EF35LF24", "EF45LF14"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Dinheiro fora de casa",
        conteudo: {
          "texto": "Guardar dinheiro em casa parece simples. Mas o dinheiro no cofrinho pode ser perdido, molhado ou gasto sem pensar. Num banco, ele fica registrado no seu nome e ninguém tira sem autorização. Banco, cooperativa de crédito e fintech são instituições financeiras: lugares que guardam dinheiro de outras pessoas.",
          "destaque": "Dinheiro em casa some fácil; no banco ele fica registrado no seu nome.",
          "mediacao": "Pergunte onde a turma guarda dinheiro hoje e anote as respostas no quadro."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A lata do Douglas",
        conteudo: {
          "personagem": "Douglas",
          "texto": "Douglas juntou R$ 120 numa lata em cima do armário. Um dia a lata caiu e as moedas rolaram pela casa. Ele achou R$ 96 e nunca encontrou o resto. A tia dele abriu uma conta poupança no nome do Douglas. O dinheiro que sobrou passou a ficar guardado lá.",
          "pergunta": "O que a conta no banco protege que a lata não protegia?",
          "mediacao": "Peça que contem situações em que dinheiro guardado em casa se perdeu."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Poupança ou corrente?",
        conteudo: {
          "enunciado": "Douglas quer separar o dinheiro que vai ficar parado juntando por muitos meses. Qual conta serve melhor para isso?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Conta corrente, feita para o dinheiro do dia a dia entrar e sair.",
              "correta": false,
              "feedback": "A conta corrente serve para movimentar dinheiro, pagar e receber. Parado nela, o dinheiro não rende."
            },
            {
              "id": "b",
              "texto": "Conta poupança, feita para guardar dinheiro que vai ficar parado.",
              "correta": true,
              "feedback": "Isso. A poupança guarda dinheiro parado e ainda rende, ou seja, aumenta um pouco com o tempo."
            },
            {
              "id": "c",
              "texto": "Nenhuma das duas, porque banco só serve para quem tem muito dinheiro.",
              "correta": false,
              "feedback": "Não é assim. Instituições financeiras abrem conta para qualquer valor, inclusive quantias pequenas."
            }
          ],
          "mediacao": "Leia as três alternativas em voz alta e peça a justificativa antes de marcar."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Quanto dá para guardar",
        conteudo: {
          "pergunta": "Se você pudesse guardar um pouco de dinheiro por mês, quanto seria?",
          "campo": "moeda",
          "placeholder": "R$ 20",
          "ajuda": "Não precisa ser exato: uma estimativa já serve para pensar.",
          "mediacao": "Ajude a escrever o valor e explique que não existe resposta certa ou errada."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Onde o dinheiro fica melhor",
        conteudo: {
          "texto": "Você pensou em guardar {valor} por mês. Em casa, esse dinheiro fica solto e some fácil. Numa instituição financeira, ele fica registrado no seu nome.",
          "regras": [
            {
              "se": "valor <= 20",
              "entao": "Mesmo quantia pequena vira um monte depois de vários meses. O banco registra qualquer valor."
            },
            {
              "se": "valor entre 21 e 100",
              "entao": "Guardado por um ano, esse valor já dá uma quantia que não vale a pena deixar solta em casa."
            },
            {
              "se": "valor > 100",
              "entao": "Com essa quantia, guardar em casa é arriscado: pode ser perdida ou levada. Uma conta protege melhor."
            }
          ],
          "proximoPasso": "Pergunte em casa se alguém tem conta poupança e para que ela é usada.",
          "mediacao": "Leia o resultado com a criança e compare com o valor que o colega escreveu."
        },
      },
    ],
  },
  {
    slug: "ef35-emprestado-tem-que-voltar",
    titulo: "Emprestado tem que voltar",
    subtitulo: "Confiança, devolução e os tipos de crédito que existem.",
    segmento: "ef35",
    blocoId: "ef35-bloco-e",
    blocoRotulo: "Bloco E · Crédito e endividamento",
    ordem: 17,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["credito", "emprestimo", "confianca"],
    thumbnail: "/trilha/credito.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-do-cofrinho-pro-banco",
    habilidades: ["EF35LF25", "EF45LF15"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Emprestar é confiar",
        conteudo: {
          "texto": "Quando alguém te empresta algo, você fica com uma dívida: precisa devolver. Com dinheiro é igual. Quem empresta faz isso porque confia que vai receber de volta. Bancos e lojas também emprestam, mas cobram um valor a mais pelo tempo, chamado juros. Devolver no prazo mantém a confiança.",
          "destaque": "Tudo que é emprestado volta — e às vezes volta custando mais.",
          "mediacao": "Peça um exemplo de algo que a criança emprestou e recebeu de volta."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O combinado do Edilson",
        conteudo: {
          "personagem": "Edilson",
          "texto": "Edilson pegou R$ 30 emprestados com o primo para comprar material da escola. Combinaram devolver em duas semanas. Na data marcada, Edilson devolveu os R$ 30 certinho. No mês seguinte precisou de novo, e o primo emprestou sem pensar duas vezes. Um colega que nunca devolveu não conseguiu mais nada.",
          "pergunta": "Por que o primo emprestou de novo para o Edilson?",
          "mediacao": "Pergunte à turma o que acontece com quem não devolve o que pegou emprestado."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Que crédito é esse?",
        conteudo: {
          "enunciado": "A família de Edilson vai comprar um fogão de R$ 400 em quatro vezes de R$ 100 na loja. Esse tipo de crédito se chama:",
          "alternativas": [
            {
              "id": "a",
              "texto": "Financiamento, usado para comprar casa ou carro ao longo de muitos anos.",
              "correta": false,
              "feedback": "Financiamento também é crédito, mas serve para bens caros pagos em muitos anos, com o bem como garantia."
            },
            {
              "id": "b",
              "texto": "Parcelamento, quando o valor da compra é dividido em prestações.",
              "correta": true,
              "feedback": "Isso. Parcelar é dividir o preço em partes pagas mês a mês até quitar tudo."
            },
            {
              "id": "c",
              "texto": "Empréstimo em dinheiro, quando o banco entrega o valor na conta.",
              "correta": false,
              "feedback": "No empréstimo o banco entrega dinheiro e a pessoa decide o uso. Aqui a loja dividiu o preço do fogão."
            }
          ],
          "mediacao": "Leia as alternativas e peça exemplos de compras parceladas que a turma já viu."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Seu prazo de devolução",
        conteudo: {
          "pergunta": "Pense em algo que você já pegou emprestado. Quantos dias levou para devolver?",
          "campo": "numero",
          "placeholder": "7",
          "ajuda": "Se não lembrar direito, um número aproximado já serve.",
          "mediacao": "Ajude a criança a contar os dias usando um calendário."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Prazo e confiança",
        conteudo: {
          "texto": "Você levou {valor} dias para devolver o que pegou emprestado. Esse tempo é o combinado, e cumprir o combinado é o que mantém a confiança.",
          "regras": [
            {
              "se": "valor <= 7",
              "entao": "Devolver rápido deixa claro que a pessoa pode contar com você da próxima vez."
            },
            {
              "se": "valor entre 8 e 30",
              "entao": "Levou um tempo, mas voltou. O que importa é ter combinado o prazo antes e cumprido."
            },
            {
              "se": "valor > 30",
              "entao": "Demorou. Quando o prazo estica, quem emprestou fica inseguro e pode não emprestar de novo."
            }
          ],
          "proximoPasso": "Combine hoje uma data para devolver algo que ainda está com você.",
          "mediacao": "Leia o resultado e ajude a criança a marcar essa data no calendário."
        },
      },
    ],
  },
  {
    slug: "ef35-o-que-e-estar-endividado",
    titulo: "O que é estar endividado",
    subtitulo: "Como a dívida começa e o que evita ela.",
    segmento: "ef35",
    blocoId: "ef35-bloco-e",
    blocoRotulo: "Bloco E · Crédito e endividamento",
    ordem: 18,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["endividamento", "divida", "consumo consciente"],
    thumbnail: "/trilha/credito.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-emprestado-tem-que-voltar",
    habilidades: ["EF45LF16", "EF45LF17"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Dever é ter prazo",
        conteudo: {
          "texto": "Estar endividado é dever dinheiro que ainda não foi pago. Ter dívida não é vergonha. Ela pode aparecer porque alguém ficou doente, perdeu o emprego ou ganha pouco. O problema começa quando o que se deve fica maior do que o que entra. Aí a conta não fecha no fim do mês.",
          "destaque": "Dívida é dinheiro que ainda não foi pago — e tem prazo.",
          "mediacao": "Explique que dívida é o que ainda falta pagar e peça exemplos do dia a dia."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "As contas da Edna",
        conteudo: {
          "personagem": "Edna",
          "texto": "Edna recebe R$ 400 por mês vendendo salgados. Este mês ela gastou R$ 180 em remédio para a filha. Também parcelou uma geladeira em R$ 90 por mês. Sobraram R$ 130 para comida e transporte, e não deu. Ela ficou devendo R$ 60 no mercado do bairro.",
          "pergunta": "O que empurrou a Edna para a dívida neste mês?",
          "mediacao": "Refaça a conta da Edna no quadro com a turma, passo a passo."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Como evitar a dívida",
        conteudo: {
          "enunciado": "Mês que vem Edna quer evitar ficar devendo de novo. Qual atitude ajuda mais a prevenir isso?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Parcelar mais compras, porque assim cada parcela fica pequena.",
              "correta": false,
              "feedback": "Cada parcela fica pequena, mas todas caem no mesmo mês e se somam. As dívidas se acumulam."
            },
            {
              "id": "b",
              "texto": "Anotar o que entra e o que sai antes de assumir uma nova parcela.",
              "correta": true,
              "feedback": "Isso. Saber quanto sobra antes de comprar evita assumir um valor que não cabe no mês."
            },
            {
              "id": "c",
              "texto": "Deixar de comprar o remédio da filha e guardar esse dinheiro.",
              "correta": false,
              "feedback": "Remédio é necessidade, não gasto que se corta. Consumo consciente começa pelo que é supérfluo."
            }
          ],
          "mediacao": "Peça que expliquem por que cortar o remédio não é uma solução."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "O preço do que você quer",
        conteudo: {
          "pergunta": "Pense em algo que você quer comprar e ainda não comprou. Quanto custa?",
          "campo": "moeda",
          "placeholder": "R$ 60",
          "ajuda": "Um preço aproximado já serve para fazer a conta.",
          "mediacao": "Ajude a estimar o preço olhando um encarte ou perguntando em casa."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Cabe ou não cabe",
        conteudo: {
          "texto": "A coisa que você quer custa {valor}. Antes de comprar parcelado, vale checar se esse valor cabe no que sobra por mês.",
          "regras": [
            {
              "se": "valor <= 50",
              "entao": "É um valor que dá para juntar em poucas semanas, sem precisar dever a ninguém."
            },
            {
              "se": "valor entre 51 e 200",
              "entao": "Vale comparar preços e juntar aos poucos, em vez de assumir parcelas por muitos meses."
            },
            {
              "se": "valor > 200",
              "entao": "Valor alto pede planejamento. Parcelar sem saber quanto sobra por mês é o começo comum da dívida."
            }
          ],
          "proximoPasso": "Escreva quanto você consegue juntar por semana até chegar nesse valor.",
          "mediacao": "Leia a regra correspondente e ajude a criança a dividir o valor por semanas."
        },
      },
    ],
  },
  {
    slug: "ef35-de-onde-vem-o-dinheiro",
    titulo: "De onde vem o dinheiro da casa",
    subtitulo: "Fontes de renda e o direito de todo mundo a ter uma.",
    segmento: "ef35",
    blocoId: "ef35-bloco-f",
    blocoRotulo: "Bloco F · Renda e empreendedorismo",
    ordem: 19,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["renda", "fontes de renda", "trabalho"],
    thumbnail: "/trilha/renda.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-o-que-e-estar-endividado",
    habilidades: ["EF35LF26", "EF45LF18"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O dinheiro tem fim",
        conteudo: {
          "texto": "O dinheiro que entra numa casa é limitado: tem um tanto, e acaba. Ele vem de fontes diferentes. A mais comum é o trabalho. Também existe a venda de algo que a pessoa tem. Existem benefícios pagos pelo governo, herança e prêmios de sorteio. Nem toda fonte entra todo mês.",
          "destaque": "O dinheiro tem fim — e pode vir de mais de um lugar.",
          "mediacao": "Peça que a turma liste de onde vem o dinheiro nas casas que conhecem."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "As entradas da Eliane",
        conteudo: {
          "personagem": "Eliane",
          "texto": "Eliane trabalha como diarista e recebe R$ 250 por mês. Ela também recebe R$ 150 de um benefício do governo. Neste mês vendeu uma bicicleta velha por R$ 80. Foram R$ 480 no total. O benefício chega todo mês; a venda da bicicleta foi só uma vez.",
          "pergunta": "Com quais dessas fontes Eliane pode contar de novo no mês que vem?",
          "mediacao": "Separe no quadro as fontes que se repetem e as que acontecem uma vez só."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Renda mínima é direito",
        conteudo: {
          "enunciado": "Por que existem benefícios do governo que garantem uma renda mínima para famílias?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Porque quem recebe benefício não quer trabalhar.",
              "correta": false,
              "feedback": "Não é isso. A maior parte de quem recebe trabalha ou procura trabalho, e o benefício completa a renda."
            },
            {
              "id": "b",
              "texto": "Porque toda pessoa precisa de uma renda mínima para comer, morar e se cuidar.",
              "correta": true,
              "feedback": "Isso. Ter o mínimo para viver é um direito de todas as pessoas, e o benefício existe para garantir isso."
            },
            {
              "id": "c",
              "texto": "Porque o governo tem dinheiro sobrando e distribui por sorteio.",
              "correta": false,
              "feedback": "Não é sorteio. O benefício segue regras e vai para quem está com a renda abaixo do mínimo."
            }
          ],
          "mediacao": "Leia as alternativas em voz alta e discuta por que a primeira é injusta."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Fontes na sua casa",
        conteudo: {
          "pergunta": "Quantas fontes de dinheiro diferentes existem na casa onde você mora?",
          "campo": "numero",
          "placeholder": "2",
          "ajuda": "Conte cada pessoa ou benefício que traz dinheiro; uma estimativa já serve.",
          "mediacao": "Ajude a contar só a quantidade de fontes, sem pedir valores nem nomes."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Quantas entradas você tem",
        conteudo: {
          "texto": "Você contou {valor} fontes de dinheiro na sua casa. Cada fonte tem seu ritmo: umas chegam todo mês, outras só de vez em quando.",
          "regras": [
            {
              "se": "valor <= 1",
              "entao": "Com uma fonte só, qualquer atraso pesa mais. Por isso existe o direito a uma renda mínima."
            },
            {
              "se": "valor == 2",
              "entao": "Duas fontes dividem o risco: se uma falhar no mês, a outra segura parte das contas."
            },
            {
              "se": "valor >= 3",
              "entao": "Várias fontes ajudam, mas vale saber quais se repetem todo mês e quais não."
            }
          ],
          "proximoPasso": "Pergunte em casa quais fontes de dinheiro chegam todo mês e quais não.",
          "mediacao": "Leia o resultado individualmente e evite comparar as respostas entre colegas."
        },
      },
    ],
  },
  {
    slug: "ef35-trabalho-e-profissoes",
    titulo: "Trabalho e profissões",
    subtitulo: "O que as pessoas fazem, e em que setor da economia.",
    segmento: "ef35",
    blocoId: "ef35-bloco-f",
    blocoRotulo: "Bloco F · Renda e empreendedorismo",
    ordem: 20,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["trabalho", "profissoes", "remuneracao"],
    thumbnail: "/trilha/renda.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-de-onde-vem-o-dinheiro",
    habilidades: ["EF35LF27", "EF35LF28", "EF35LF29"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Trabalho e remuneração",
        conteudo: {
          "texto": "Trabalho é a atividade que uma pessoa faz para produzir algo ou prestar um serviço. Quando esse trabalho vira uma ocupação com nome e preparo, chamamos de profissão. Pelo trabalho a pessoa recebe remuneração, que é o pagamento pelo tempo e esforço dela. Cada profissão tem tarefas e lugares próprios.",
          "destaque": "Trabalho produz algo ou presta serviço; a remuneração paga esse esforço.",
          "mediacao": "Peça que cada criança diga uma profissão que existe perto da casa dela."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Três lugares no bairro",
        conteudo: {
          "personagem": "Emanuel",
          "texto": "No bairro de Emanuel tem uma horta, uma fábrica de pães e uma barbearia. A horta colhe alface: isso é setor primário, que tira da natureza. A fábrica transforma trigo em pão: setor secundário. A barbearia corta cabelo e não fabrica nada: setor terciário, o dos serviços.",
          "pergunta": "Em qual desses três setores está o trabalho de alguém que você conhece?",
          "mediacao": "Escreva os três setores no quadro e encaixe as profissões que a turma citar."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "A conta dos sábados",
        conteudo: {
          "enunciado": "Emanuel ajuda na horta em três sábados e recebe R$ 25 por sábado. Quanto ele recebe de remuneração no total?",
          "alternativas": [
            {
              "id": "a",
              "texto": "R$ 28",
              "correta": false,
              "feedback": "Aqui você somou 25 mais 3. O certo é somar R$ 25 três vezes, um por sábado."
            },
            {
              "id": "b",
              "texto": "R$ 75",
              "correta": true,
              "feedback": "Isso. R$ 25 em cada um dos três sábados dá R$ 75 no total."
            },
            {
              "id": "c",
              "texto": "R$ 50",
              "correta": false,
              "feedback": "Esse é o valor de dois sábados apenas. Falta somar o terceiro."
            }
          ],
          "mediacao": "Deixe a criança usar os dedos ou o caderno para somar antes de marcar."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Profissão perto de você",
        conteudo: {
          "pergunta": "Escreva uma profissão que existe onde você mora e o que essa pessoa faz.",
          "campo": "texto",
          "placeholder": "Costureira: conserta e faz roupas",
          "ajuda": "Vale qualquer profissão que você já viu de perto.",
          "mediacao": "Ajude a escrever a frase e pergunte onde a criança viu essa profissão."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Em que setor ela está",
        conteudo: {
          "texto": "Você citou {valor}. Toda profissão tem tarefas próprias e recebe remuneração por elas. Agora veja em qual setor da economia ela se encaixa.",
          "regras": [
            {
              "se": "a profissão tira algo da natureza, como plantar, pescar ou criar animais",
              "entao": "Esse trabalho é do setor primário: pega o produto direto da terra, da água ou dos animais."
            },
            {
              "se": "a profissão transforma matéria-prima, como fábrica, padaria ou marcenaria",
              "entao": "Esse trabalho é do setor secundário: transforma uma coisa em outra antes de vender."
            },
            {
              "se": "a profissão atende pessoas, como escola, ônibus, salão ou loja",
              "entao": "Esse trabalho é do setor terciário: presta um serviço direto para as pessoas."
            }
          ],
          "proximoPasso": "Pergunte a essa pessoa quanto tempo ela levou para aprender a profissão.",
          "mediacao": "Leia as três regras e ajude a criança a decidir em qual setor a profissão cabe."
        },
      },
    ],
  },
  {
    slug: "ef35-campo-e-cidade",
    titulo: "Campo e cidade",
    subtitulo: "Uma coisa depende da outra — e tem quem empreenda nas duas.",
    segmento: "ef35",
    blocoId: "ef35-bloco-f",
    blocoRotulo: "Bloco F · Renda e empreendedorismo",
    ordem: 21,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["campo", "cidade", "empreendedorismo"],
    thumbnail: "/trilha/renda.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-trabalho-e-profissoes",
    habilidades: ["EF35LF30", "EF45LF19", "EF45LF20"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Um depende do outro",
        conteudo: {
          "texto": "No campo, boa parte do trabalho é plantar, criar animais e colher. Na cidade, é mais comum fabricar, vender e prestar serviços. Os dois dependem um do outro. O alimento sai do campo e chega às lojas da cidade. O trator e o adubo saem da indústria e vão para o campo.",
          "destaque": "Campo e cidade não vivem separados: um entrega o que falta ao outro.",
          "mediacao": "Pergunte de onde vem o arroz que a turma come e quem levou até a loja."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A mandioca da Fabiana",
        conteudo: {
          "personagem": "Fabiana",
          "texto": "Fabiana planta mandioca num sítio e vende 40 quilos por semana para um mercado na cidade. Com o dinheiro, ela compra sementes e ração numa loja da cidade. A dona do mercado transforma parte da mandioca em farinha e revende. As duas montaram o próprio negócio, cada uma no seu lugar.",
          "pergunta": "O que a cidade dá para a Fabiana, e o que ela dá para a cidade?",
          "mediacao": "Desenhe no quadro setas do que vai do campo para a cidade e do contrário."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Campo ou cidade?",
        conteudo: {
          "enunciado": "Qual dessas atividades é típica do campo e pertence ao setor primário?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Costurar uniformes numa oficina do centro.",
              "correta": false,
              "feedback": "Costurar transforma tecido em roupa. É setor secundário, e acontece mais na cidade."
            },
            {
              "id": "b",
              "texto": "Criar galinhas e vender os ovos.",
              "correta": true,
              "feedback": "Isso. Criar animais tira o produto direto da natureza: é setor primário, típico do campo."
            },
            {
              "id": "c",
              "texto": "Entregar pacotes de moto pelo bairro.",
              "correta": false,
              "feedback": "Entregar é prestar um serviço: setor terciário, mais comum na cidade."
            }
          ],
          "mediacao": "Leia as três atividades e peça que a turma diga onde cada uma acontece."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Negócios perto de você",
        conteudo: {
          "pergunta": "Quantos negócios criados por moradores existem perto da sua casa?",
          "campo": "numero",
          "placeholder": "4",
          "ajuda": "Conte mercadinho, salão, horta, oficina ou barraca; uma estimativa já serve.",
          "mediacao": "Ajude a criança a lembrar dos negócios da rua antes de escolher o número."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "A rede do seu bairro",
        conteudo: {
          "texto": "Você contou {valor} negócios criados por moradores perto de você. Quem monta o próprio negócio está empreendendo, no campo ou na cidade.",
          "regras": [
            {
              "se": "valor <= 2",
              "entao": "Mesmo poucos negócios movimentam o lugar: compram de fora e vendem para quem mora perto."
            },
            {
              "se": "valor entre 3 e 8",
              "entao": "Vale olhar quais deles dependem de produtos que vêm do campo para funcionar."
            },
            {
              "se": "valor > 8",
              "entao": "Muitos negócios juntos formam uma rede: um compra do outro e todos dependem do campo."
            }
          ],
          "proximoPasso": "Escolha um negócio perto de você e descubra de onde vem o que ele vende.",
          "mediacao": "Leia a regra do resultado e peça um negócio do bairro como exemplo."
        },
      },
    ],
  },
  {
    slug: "ef35-escolha-que-respinga",
    titulo: "Escolha que respinga nos outros",
    subtitulo: "Sua decisão financeira chega em quem está perto.",
    segmento: "ef35",
    blocoId: "ef35-bloco-g",
    blocoRotulo: "Bloco G · Cenário financeiro e cidadania",
    ordem: 22,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["consumo consciente", "escolhas", "conflito de consumo"],
    thumbnail: "/trilha/cidadania.png",
    estadoInicial: "travado",
    destravadoPor: "ef35-campo-e-cidade",
    habilidades: ["EF45LF21", "EF45LF22"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Escolha que respinga",
        conteudo: {
          "texto": "Toda escolha com dinheiro respinga em alguém. Gastar tudo de uma vez pode faltar para a comida da casa. Comprar algo que vira lixo rápido sobrecarrega o bairro e o meio ambiente. Escolher com cuidado é pensar em você, em quem mora com você e no bairro.",
          "destaque": "Sua escolha com dinheiro chega em quem está perto de você.",
          "mediacao": "Peça um exemplo de compra que acabou afetando outra pessoa da casa."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Os R$ 50 do Fábio",
        conteudo: {
          "personagem": "Fábio",
          "texto": "Fábio recebeu R$ 50 de aniversário. Ele quis gastar tudo num brinquedo que quebrou em dois dias. A irmã dele precisava de R$ 18 para o material da escola e ficou sem. O plástico do brinquedo foi para o lixo na mesma semana. A escolha do Fábio respingou em três lugares.",
          "pergunta": "Quem foi afetado pela escolha do Fábio, além dele mesmo?",
          "mediacao": "Liste com a turma os três afetados: ele, a irmã e o lixo do bairro."
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Quando dá conflito",
        conteudo: {
          "enunciado": "O brinquedo quebrou em dois dias e a loja se recusou a trocar. O que Fábio deve fazer primeiro?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Discutir alto com o vendedor até conseguir o que quer.",
              "correta": false,
              "feedback": "Brigar não resolve e pode piorar. O conflito se resolve com prova da compra e conhecimento do direito."
            },
            {
              "id": "b",
              "texto": "Levar a nota fiscal e pedir a troca, porque produto com defeito tem conserto ou troca.",
              "correta": true,
              "feedback": "Isso. A nota comprova a compra, e a lei garante solução para produto com defeito."
            },
            {
              "id": "c",
              "texto": "Aceitar o prejuízo, porque cliente nunca tem razão nessas horas.",
              "correta": false,
              "feedback": "Não é verdade. Existe conflito de consumo justamente porque quem compra também tem direitos."
            }
          ],
          "mediacao": "Explique o que é nota fiscal e mostre uma antes de ler as alternativas."
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "O que você usou pouco",
        conteudo: {
          "pergunta": "Pense em algo que você comprou e usou pouco. Quanto custou?",
          "campo": "moeda",
          "placeholder": "R$ 20",
          "ajuda": "Se não lembrar o valor exato, uma estimativa já serve.",
          "mediacao": "Ajude a criança a lembrar de uma compra recente, mesmo pequena."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Onde o dinheiro respinga",
        conteudo: {
          "texto": "Você gastou {valor} em algo que usou pouco. Esse dinheiro poderia ter ido para outra coisa sua, da sua casa ou do seu bairro.",
          "regras": [
            {
              "se": "valor <= 20",
              "entao": "Parece pouco, mas várias compras assim no mesmo mês somam um valor que faz falta."
            },
            {
              "se": "valor entre 21 e 100",
              "entao": "Com esse valor dava para resolver algo que a casa precisava. Vale perguntar antes de comprar."
            },
            {
              "se": "valor > 100",
              "entao": "Valor alto usado pouco pesa na casa inteira. Antes de comprar, converse com quem mora com você."
            }
          ],
          "proximoPasso": "Antes da próxima compra, pergunte quanto tempo você vai usar aquilo.",
          "mediacao": "Leia o resultado sem julgar a escolha; foque no que dá para fazer da próxima vez."
        },
      },
    ],
  },
  {
    slug: "ef67-do-sal-ao-pix",
    titulo: "Do sal ao Pix",
    subtitulo: "O que mudou e o que ficou igual em como se paga.",
    segmento: "ef67",
    blocoId: "ef67-bloco-a",
    blocoRotulo: "Bloco A · Circulação social do dinheiro",
    ordem: 1,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["dinheiro", "historia", "pagamento"],
    thumbnail: "/trilha/circulacao.png",
    estadoInicial: "disponivel",
    habilidades: ["EF67LF01", "EF67LF02"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Muda o formato, fica o acordo",
        conteudo: {
          "texto": "Sal, cereais, gado, moedas de metal, cédulas de papel, Pix. A forma de pagar mudou muitas vezes, mas duas coisas permaneceram: alguém precisa aceitar o que você entrega, e as duas partes precisam concordar no quanto aquilo vale. O que muda é o suporte; o que fica é o acordo e a confiança.",
          "destaque": "Muda o formato do pagamento; permanece a necessidade de acordo."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A feira da avó",
        conteudo: {
          "personagem": "Fernanda",
          "texto": "Fernanda ajuda a avó na feira. A avó conta que, quando era menina, o pai dela pagava o pedreiro com sacas de arroz. Hoje Fernanda paga R$ 12 no pastel por Pix, em dois segundos. A avó acha caro: no tempo dela, o mesmo pastel custava algumas moedas que ela juntava a semana inteira.",
          "pergunta": "O pastel ficou mais caro, ou o dinheiro de hoje é outro?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "O que permaneceu",
        conteudo: {
          "enunciado": "Comparando o pagamento em sacas de arroz com o Pix de Fernanda, o que permaneceu igual nos dois casos?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Nada: pagar com produto e pagar com celular não têm relação.",
              "correta": false,
              "feedback": "Os dois resolvem o mesmo problema: entregar algo que quita uma dívida. O que mudou foi só o meio usado."
            },
            {
              "id": "b",
              "texto": "Os dois só funcionam porque quem recebe aceita aquilo como pagamento.",
              "correta": true,
              "feedback": "Isso. Sem aceitação não há pagamento, seja em arroz ou em Pix. É o acordo que sustenta os dois."
            },
            {
              "id": "c",
              "texto": "O tempo que o pagamento leva para ser confirmado.",
              "correta": false,
              "feedback": "Aí está justamente uma das mudanças. Levar sacas até a casa do pedreiro não se compara a dois segundos de transferência."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Como se paga na sua casa",
        conteudo: {
          "pergunta": "Qual forma de pagamento foi a mais usada por você ou pela sua família nos últimos sete dias?",
          "campo": "faixa",
          "placeholder": "Pix",
          "faixas": [
            "Dinheiro em espécie",
            "Pix",
            "Cartão de débito ou crédito",
            "Vale ou benefício",
            "Troca ou serviço, sem dinheiro"
          ],
          "ajuda": "Estimativa serve; vale o que você lembra, sem conferir extrato."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Outras formas, mesmo acordo",
        conteudo: {
          "texto": "Você marcou {valor}. Não existe resposta melhor aqui: cada forma de pagar carrega vantagens e limites diferentes, em taxa, em prova de que o pagamento aconteceu e em quem precisa aceitar aquilo. Em cinquenta anos, a lista de opções mudou quase inteira. O acordo por trás delas, não.",
          "regras": [
            {
              "se": "valor == Dinheiro em espécie",
              "entao": "O papel ainda resolve o seu dia a dia. Ele não depende de internet nem de conta em banco, mas some sem deixar comprovante."
            },
            {
              "se": "valor == Pix ou valor == Cartão de débito ou crédito",
              "entao": "Seu pagamento é digital e deixa registro. Isso ajuda a comprovar compras e reclamar erros, e concentra em poucas empresas o histórico do que você gasta."
            },
            {
              "se": "valor == Vale ou benefício ou valor == Troca ou serviço, sem dinheiro",
              "entao": "Você usa algo que só vale em certos lugares ou com certas pessoas. É o limite mais antigo da troca, ainda vivo hoje."
            }
          ],
          "proximoPasso": "Pergunte a alguém com mais de 60 anos como pagava as compras aos 15."
        },
      },
    ],
  },
  {
    slug: "ef67-mesmo-produto-preco-diferente",
    titulo: "O mesmo produto, preço diferente",
    subtitulo: "Atacado, varejo, embalagem — e a conta do lucro.",
    segmento: "ef67",
    blocoId: "ef67-bloco-a",
    blocoRotulo: "Bloco A · Circulação social do dinheiro",
    ordem: 2,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["preco", "atacado", "varejo"],
    thumbnail: "/trilha/circulacao.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-do-sal-ao-pix",
    habilidades: ["EF67LF03", "EF67LF05"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Por que o preço muda",
        conteudo: {
          "texto": "O mesmo produto tem preços diferentes conforme onde e como é vendido. No atacado, quem compra leva muita quantidade e paga menos por unidade. No varejo, compra pouco e paga mais. Embalagem, transporte e o número de intermediários entre o produtor e você também entram na conta do preço final.",
          "destaque": "Preço por unidade mostra o que o preço da etiqueta esconde."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A caixa e o pacote",
        conteudo: {
          "personagem": "Flávio",
          "texto": "Flávio vende salgadinho no intervalo da escola. No mercado do bairro, o pacote com 6 unidades sai por R$ 9. No atacado da rodoviária, a caixa com 30 unidades custa R$ 36, mas ele gasta R$ 4 de ônibus para buscar. Ele vende cada salgadinho por R$ 2,50 e, em uma semana, vende os 30.",
          "pergunta": "Comprando no atacado, quanto sobra para Flávio depois de vender tudo?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "A conta do lucro",
        conteudo: {
          "enunciado": "Flávio compra a caixa no atacado, paga o ônibus e vende os 30 salgadinhos. Qual é o lucro dele?",
          "alternativas": [
            {
              "id": "a",
              "texto": "R$ 39,00",
              "correta": false,
              "feedback": "Você descontou só a caixa, de R$ 36. Os R$ 4 do ônibus também são custo e entram na conta."
            },
            {
              "id": "b",
              "texto": "R$ 35,00",
              "correta": true,
              "feedback": "Isso. A venda deu R$ 75,00 e o custo foi R$ 40,00, somando R$ 36,00 da caixa e R$ 4,00 do ônibus."
            },
            {
              "id": "c",
              "texto": "R$ 75,00",
              "correta": false,
              "feedback": "R$ 75,00 é tudo o que entrou com a venda. Lucro é o que sobra depois de tirar o que ele gastou para vender."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Pacote grande compensa?",
        conteudo: {
          "pergunta": "Pense em um produto que sua família compra sempre. Quanto por cento você acha que economiza levando o pacote grande em vez da unidade avulsa?",
          "campo": "percentual",
          "placeholder": "20%",
          "ajuda": "Estimativa serve; para conferir depois, divida o preço do pacote pelo número de unidades."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Quando o volume vale",
        conteudo: {
          "texto": "Você estimou {valor} de economia. Comprar em quantidade quase sempre baixa o preço por unidade, mas só compensa se o produto for usado antes de estragar e se o dinheiro da compra maior estiver disponível hoje. Foi essa mesma conta que Flávio fez, somando o ônibus ao preço da caixa.",
          "regras": [
            {
              "se": "valor < 10",
              "entao": "Diferença pequena. Nesse caso comprar aos poucos pode ser melhor: você não deixa dinheiro parado nem corre risco de perder o produto."
            },
            {
              "se": "valor >= 10 e valor <= 30",
              "entao": "É a faixa mais comum no varejo. Vale a pena quando o produto dura e quando a compra maior cabe no orçamento da semana."
            },
            {
              "se": "valor > 30",
              "entao": "Economia grande costuma aparecer no atacado. Confira se o preço por unidade é mesmo menor: embalagem maior nem sempre significa mais barato."
            }
          ],
          "proximoPasso": "No próximo mercado, compare o preço por quilo de duas embalagens do mesmo produto."
        },
      },
    ],
  },
  {
    slug: "ef67-conferir-a-conta",
    titulo: "Conferir a conta",
    subtitulo: "Achar o erro no recibo e saber reclamar.",
    segmento: "ef67",
    blocoId: "ef67-bloco-a",
    blocoRotulo: "Bloco A · Circulação social do dinheiro",
    ordem: 3,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["recibo", "troco", "desconto"],
    thumbnail: "/trilha/circulacao.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-mesmo-produto-preco-diferente",
    habilidades: ["EF67LF04", "EF67LF06"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O papel que prova",
        conteudo: {
          "texto": "Recibo, cupom fiscal e comprovante de Pix servem para provar o que foi pago e conferir se a conta bate. Erro acontece: item cobrado duas vezes, desconto que não entrou, troco a menos. Conferir na hora e falar com firmeza, sem grosseria, é o que resolve. Guardar o comprovante é o que sustenta a reclamação depois.",
          "destaque": "Comprovante guardado é o que transforma reclamação em direito."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O cupom errado",
        conteudo: {
          "personagem": "Franciele",
          "texto": "Franciele levou dois cadernos de R$ 15,00 e uma calculadora de R$ 32,00. Na prateleira, uma placa anunciava 10% de desconto nos cadernos. O cupom saiu com três cadernos, sem desconto nenhum, e total de R$ 77,00. Ela tinha lido numa reportagem que cobrança errada precisa ser corrigida na hora, e voltou ao caixa com o cupom na mão.",
          "pergunta": "Quanto o cupom cobrou a mais, e como ela diz isso sem brigar?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Quanto deveria dar",
        conteudo: {
          "enunciado": "Aplicando o desconto da placa, quanto Franciele deveria ter pagado pelos dois cadernos e pela calculadora?",
          "alternativas": [
            {
              "id": "a",
              "texto": "R$ 62,00",
              "correta": false,
              "feedback": "Esse é o total sem aplicar os 10% anunciados na placa. O desconto vale para os cadernos e precisa entrar na conta."
            },
            {
              "id": "b",
              "texto": "R$ 59,00",
              "correta": true,
              "feedback": "Isso. Os dois cadernos dão R$ 30,00, menos R$ 3,00 de desconto ficam R$ 27,00, mais R$ 32,00 da calculadora."
            },
            {
              "id": "c",
              "texto": "R$ 74,00",
              "correta": false,
              "feedback": "Aqui o desconto saiu do total errado. O cupom cobrou três cadernos, e ela levou dois para casa."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Onde você se informa",
        conteudo: {
          "pergunta": "Onde você buscaria informação para saber seus direitos quando uma loja cobra errado?",
          "campo": "faixa",
          "placeholder": "Reportagem ou site de notícia",
          "faixas": [
            "Reportagem ou site de notícia",
            "Vídeo de influenciador",
            "Conversa com alguém da família",
            "O próprio site da loja",
            "Nunca busquei"
          ],
          "ajuda": "Não existe fonte perfeita; o que muda é quem escreveu e para quê."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Quem escreveu e para quê",
        conteudo: {
          "texto": "Você escolheu {valor}. Todo texto sobre dinheiro é escrito por alguém com um objetivo: informar, vender ou defender uma posição. Saber quem assina e para quem aquilo foi feito muda o peso que o texto tem na hora de reclamar de uma cobrança como a de Franciele.",
          "regras": [
            {
              "se": "valor == Reportagem ou site de notícia",
              "entao": "Boa fonte quando o veículo assina o texto e cita a lei ou o órgão responsável. Repare se é reportagem ou artigo de opinião: informam de jeitos diferentes."
            },
            {
              "se": "valor == Vídeo de influenciador ou valor == O próprio site da loja",
              "entao": "Servem para entender rápido, mas quem publica tem interesse no assunto. Vale conferir a mesma informação em uma fonte que não ganhe nada com ela."
            },
            {
              "se": "valor == Conversa com alguém da família ou valor == Nunca busquei",
              "entao": "A experiência de casa ajuda, mas envelhece. Regras de troca, prazo e cobrança mudam, e é o texto oficial que vale numa reclamação."
            }
          ],
          "proximoPasso": "Confira o último cupom de compra da sua casa, item por item, antes de descartar."
        },
      },
    ],
  },
  {
    slug: "ef67-oferta-e-demanda",
    titulo: "Oferta e demanda",
    subtitulo: "Por que o preço sobe quando todo mundo quer.",
    segmento: "ef67",
    blocoId: "ef67-bloco-b",
    blocoRotulo: "Bloco B · Planejamento",
    ordem: 4,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["oferta", "demanda", "preco"],
    thumbnail: "/trilha/orcamento.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-conferir-a-conta",
    habilidades: ["EF67LF07", "EF67LF08"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Duas forças no preço",
        conteudo: {
          "texto": "Oferta é quanto de um produto existe para vender. Demanda é quanto as pessoas querem comprar. Quando muita gente quer e tem pouco disponível, o preço sobe. Quando sobra produto e poucos querem, o preço cai. Nenhuma das duas manda sozinha: o preço é o ponto onde elas se encontram.",
          "destaque": "Oferta é o que existe; demanda é o que querem. O preço fica no meio."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Sol e chuva na quadra",
        conteudo: {
          "personagem": "Gabriel",
          "texto": "Gabriel vende picolé caseiro na quadra do bairro. No sábado de sol, a caixa térmica com 40 picolés acabou antes das duas da tarde, e ainda apareceu gente pedindo. No domingo choveu: ele levou os mesmos 40 e voltou com 28. Na segunda, pensou em subir o preço de R$ 3 para R$ 4.",
          "pergunta": "O que mudou entre sábado e domingo: o picolé ou quem queria picolé?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "O que subiu no sábado",
        conteudo: {
          "enunciado": "No sábado de sol, o que aconteceu com a oferta e com a demanda de picolé na quadra?",
          "alternativas": [
            {
              "id": "a",
              "texto": "A oferta aumentou, porque ele levou muitos picolés.",
              "correta": false,
              "feedback": "A quantidade levada foi a mesma nos dois dias: 40 picolés. O que mudou foi quanta gente queria comprar."
            },
            {
              "id": "b",
              "texto": "A demanda cresceu com o calor, e a oferta continuou a mesma.",
              "correta": true,
              "feedback": "Isso. Mesma quantidade disponível e mais gente querendo: é essa combinação que empurra o preço para cima."
            },
            {
              "id": "c",
              "texto": "As duas caíram, porque o estoque acabou cedo.",
              "correta": false,
              "feedback": "Estoque acabar cedo é sinal de procura alta, não baixa. A oferta era limitada, e a demanda passou dela."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Seu preço de domingo",
        conteudo: {
          "pergunta": "Se você estivesse no lugar de Gabriel, por quanto venderia o picolé num domingo de chuva?",
          "campo": "moeda",
          "placeholder": "R$ 3,00",
          "ajuda": "Não precisa acertar: o que importa é o motivo por trás do preço escolhido."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Preço depende do dia",
        conteudo: {
          "texto": "Você marcou {valor} para o picolé de domingo. Não existe preço certo fora do contexto: o mesmo produto, na mesma quadra, vale coisas diferentes conforme quanta gente está querendo comprar e quanto tem disponível para vender naquele dia.",
          "regras": [
            {
              "se": "valor < 3",
              "entao": "Você baixou o preço. Com pouca procura, preço menor pode ser o jeito de vender o que estragaria, ao custo de sobrar menos por unidade."
            },
            {
              "se": "valor == 3",
              "entao": "Você manteve. Preço estável facilita a vida de quem compra sempre, mas a sobra do dia vira prejuízo se o picolé derreter."
            },
            {
              "se": "valor > 3",
              "entao": "Você subiu. Em dia de pouca procura, preço maior costuma afastar quem ainda compraria; o mesmo aumento faria sentido no sábado lotado."
            }
          ],
          "proximoPasso": "Repare no preço de uma fruta da estação hoje e de novo daqui a dois meses."
        },
      },
    ],
  },
  {
    slug: "ef67-onde-anotar",
    titulo: "Onde anotar o orçamento",
    subtitulo: "Caderno, planilha ou app — e o tipo de renda que entra.",
    segmento: "ef67",
    blocoId: "ef67-bloco-b",
    blocoRotulo: "Bloco B · Planejamento",
    ordem: 5,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["orcamento", "renda", "planilha"],
    thumbnail: "/trilha/orcamento.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-oferta-e-demanda",
    habilidades: ["EF67LF09", "EF67LF10"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Onde o orçamento mora",
        conteudo: {
          "texto": "Orçamento é a lista do que entra e do que sai. Pode viver num caderno, no bloco de notas do celular, numa planilha ou num aplicativo. Caderno não depende de bateria; planilha soma sozinha; aplicativo avisa, mas pede internet e guarda seus dados. A ferramenta importa menos que a constância de anotar.",
          "destaque": "A melhor ferramenta de orçamento é a que você abre todo dia."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Padaria e fim de semana",
        conteudo: {
          "personagem": "Geraldo",
          "texto": "Geraldo trabalha meio período numa padaria e recebe R$ 1.200 fixos todo dia 5, com carteira assinada. Nos fins de semana, monta som em festas e ganha entre R$ 0 e R$ 600, dependendo se aparece serviço. Ele anota tudo num caderno atrás do balcão. Em maio entrou R$ 1.800; em junho, R$ 1.200.",
          "pergunta": "Com qual das duas rendas ele consegue planejar o mês seguinte?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Duas rendas diferentes",
        conteudo: {
          "enunciado": "Qual é a diferença entre o salário da padaria e o dinheiro das festas no orçamento de Geraldo?",
          "alternativas": [
            {
              "id": "a",
              "texto": "O salário é esporádico e o dinheiro das festas é frequente.",
              "correta": false,
              "feedback": "É o contrário. O salário cai todo mês na mesma data; o serviço de festa aparece de vez em quando."
            },
            {
              "id": "b",
              "texto": "O salário é formal e frequente; o das festas é informal e esporádico.",
              "correta": true,
              "feedback": "Isso. Renda registrada e previsível sustenta o planejamento; renda informal e variável entra como reforço, não como base."
            },
            {
              "id": "c",
              "texto": "São iguais, porque no fim do mês o dinheiro é o mesmo.",
              "correta": false,
              "feedback": "O valor pode até coincidir, mas a previsibilidade não. Contar com o que talvez não venha é o que desequilibra o mês."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua ferramenta",
        conteudo: {
          "pergunta": "Onde você anotaria o que entra e o que sai do seu dinheiro hoje?",
          "campo": "faixa",
          "placeholder": "Caderno ou papel",
          "faixas": [
            "Caderno ou papel",
            "Bloco de notas do celular",
            "Planilha",
            "Aplicativo de banco ou de finanças",
            "Não anotaria"
          ],
          "ajuda": "Não tem escolha certa; cada ferramenta tem uma vantagem e um limite."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O que é fixo, o que é incerto",
        conteudo: {
          "texto": "Você escolheu {valor}. Qualquer uma funciona se for usada toda semana, e nenhuma funciona se ficar parada. Separe o que é fixo do que é incerto, como Geraldo faz: assim você sabe quanto do mês já está garantido antes de contar com o que talvez venha.",
          "regras": [
            {
              "se": "valor == Caderno ou papel ou valor == Bloco de notas do celular",
              "entao": "Rápido de abrir e não depende de internet. Em compensação, a soma é sua: um erro de conta desarruma o mês inteiro."
            },
            {
              "se": "valor == Planilha ou valor == Aplicativo de banco ou de finanças",
              "entao": "Somam sozinhos e mostram totais na hora. Exigem acesso a computador ou celular com internet, e o aplicativo guarda seus dados em outro lugar."
            },
            {
              "se": "valor == Não anotaria",
              "entao": "Sem registro, o mês vira memória, e memória esquece o que é pequeno. Comece anotando só o que entra: três linhas já mudam a leitura."
            }
          ],
          "proximoPasso": "Anote hoje tudo o que entrou e saiu do seu bolso nesta semana."
        },
      },
    ],
  },
  {
    slug: "ef67-parcelou-comprometeu",
    titulo: "Parcelou, comprometeu",
    subtitulo: "A parcela de hoje é o dinheiro do mês que vem.",
    segmento: "ef67",
    blocoId: "ef67-bloco-b",
    blocoRotulo: "Bloco B · Planejamento",
    ordem: 6,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["parcelamento", "credito", "orcamento"],
    thumbnail: "/trilha/orcamento.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-onde-anotar",
    habilidades: ["EF67LF11", "EF67LF12"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Parcela é mês que vem",
        conteudo: {
          "texto": "Parcelar divide o preço no tempo, não o diminui. Cada parcela combinada hoje já está reservada no orçamento dos próximos meses, antes mesmo de o dinheiro entrar. Quando várias compras parceladas se somam, o mês seguinte chega com boa parte da renda comprometida, e sobra pouco espaço para o que aparecer.",
          "destaque": "A parcela de hoje é dinheiro que o mês que vem já não tem."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Duas parcelas pequenas",
        conteudo: {
          "personagem": "Gilmar",
          "texto": "Gilmar recebe R$ 1.500 por mês. Em março, parcelou um celular em 10 vezes de R$ 120 e um par de tênis em 5 vezes de R$ 80. Nenhuma das duas parcelas parece grande sozinha. Em abril, quando o material escolar do sobrinho custou R$ 200, já estavam saindo outros R$ 200 por mês em parcelas.",
          "pergunta": "Quanto da renda de Gilmar já estava reservada antes de abril começar?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Quanto pesa no mês",
        conteudo: {
          "enunciado": "As duas parcelas de Gilmar somam R$ 200 por mês. Que parte da renda de R$ 1.500 isso compromete?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Cerca de 8%",
              "correta": false,
              "feedback": "8% corresponde só à parcela de R$ 120. A conta precisa somar tudo o que já está comprometido no mês."
            },
            {
              "id": "b",
              "texto": "Cerca de 13%",
              "correta": true,
              "feedback": "Isso. R$ 200 dentro de R$ 1.500 é pouco mais de 13%, e esse pedaço já está reservado antes de qualquer gasto novo."
            },
            {
              "id": "c",
              "texto": "Nada, porque parcela não é dívida.",
              "correta": false,
              "feedback": "Parcela é dívida combinada. O produto já foi entregue, e o compromisso de pagar segue nos meses seguintes."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Seu jeito com dinheiro",
        conteudo: {
          "pergunta": "Qual jeito de lidar com dinheiro se parece mais com o seu hoje?",
          "campo": "faixa",
          "placeholder": "Depende do mês",
          "faixas": [
            "Gasto assim que entra",
            "Parcelo para caber no mês",
            "Junto antes e pago à vista",
            "Evito comprar o que não é necessário",
            "Depende do mês"
          ],
          "ajuda": "Não existe jeito certo; cada escolha tem uma causa e uma consequência."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Cada escolha cobra algo",
        conteudo: {
          "texto": "Você marcou {valor}. Cada jeito de lidar com dinheiro nasce de algo: a renda que se tem, o que se viu em casa, o que o momento exige. E cada um cobra um preço diferente lá na frente, como as parcelas de março cobraram o abril de Gilmar.",
          "regras": [
            {
              "se": "valor == Gasto assim que entra ou valor == Parcelo para caber no mês",
              "entao": "Resolve o presente e empurra a conta. Quando a renda varia, esse jeito deixa o mês seguinte sem folga para o que não estava previsto."
            },
            {
              "se": "valor == Junto antes e pago à vista ou valor == Evito comprar o que não é necessário",
              "entao": "Custa esperar e devolve liberdade: dinheiro não comprometido é o que permite dizer sim a uma oportunidade ou não a uma dívida."
            },
            {
              "se": "valor == Depende do mês",
              "entao": "É o mais comum quando a renda não é fixa. Ajuda saber, logo no início do mês, quanto já está reservado em parcelas antes de decidir qualquer coisa."
            }
          ],
          "proximoPasso": "Some hoje todas as parcelas que a sua casa paga neste mês."
        },
      },
    ],
  },
  {
    slug: "ef67-metas-e-ameacas",
    titulo: "Metas e o que ameaça elas",
    subtitulo: "Revisar meta, mudar hábito e entender a inflação.",
    segmento: "ef67",
    blocoId: "ef67-bloco-b",
    blocoRotulo: "Bloco B · Planejamento",
    ordem: 7,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["metas", "inflacao", "orcamento"],
    thumbnail: "/trilha/orcamento.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-parcelou-comprometeu",
    habilidades: ["EF67LF13", "EF67LF14", "EF67LF15"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Meta é conta com data",
        conteudo: {
          "texto": "Meta financeira não é promessa: é conta com data. Ela precisa ser revista de tempos em tempos, porque a vida muda, a renda cai, uma despesa nova aparece, o preço sobe. Inflação é justamente isso: os mesmos produtos custando mais com o passar dos meses. Meta que não é revisada deixa de caber no orçamento.",
          "destaque": "Inflação é o mesmo produto custando mais; a meta precisa acompanhar."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A bicicleta que subiu",
        conteudo: {
          "personagem": "Giovana",
          "texto": "Giovana quer uma bicicleta de R$ 900 e separa R$ 75 por mês, contando doze meses. No sexto mês ela tem R$ 450 guardados, mas a mesma bicicleta está R$ 990 na loja, e a mãe dela passou a trabalhar menos horas. Giovana precisa decidir se muda o valor mensal, a data ou a meta.",
          "pergunta": "O que ela revisa primeiro: quanto guarda, quando compra ou o que compra?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "De quanto foi a alta",
        conteudo: {
          "enunciado": "A bicicleta subiu de R$ 900 para R$ 990 em seis meses. De quanto foi essa alta, em porcentagem?",
          "alternativas": [
            {
              "id": "a",
              "texto": "9%",
              "correta": false,
              "feedback": "A diferença é de R$ 90, mas a porcentagem se calcula sobre o preço antigo: 90 dividido por 900."
            },
            {
              "id": "b",
              "texto": "10%",
              "correta": true,
              "feedback": "Isso. R$ 90 sobre R$ 900 dá 10%. É esse tipo de variação de preço ao longo do tempo que chamamos de inflação."
            },
            {
              "id": "c",
              "texto": "90%",
              "correta": false,
              "feedback": "90 é quanto subiu em reais, não em porcentagem. Se fosse 90%, a bicicleta estaria custando quase o dobro."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Um hábito que dá para mudar",
        conteudo: {
          "pergunta": "Quanto você conseguiria guardar por mês cortando ou reduzindo um gasto que se repete toda semana?",
          "campo": "moeda",
          "placeholder": "R$ 40,00",
          "ajuda": "Estimativa serve; pense num gasto real seu, não num valor ideal."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Revisar em vez de desistir",
        conteudo: {
          "texto": "Você chegou a {valor} por mês. Guardando esse valor, dá para calcular quanto tempo uma meta leva, e esse tempo muda se o preço subir no meio do caminho. Por isso a revisão é periódica: renda, despesa e preço mudam sem avisar, e a meta se ajusta em vez de ser abandonada.",
          "regras": [
            {
              "se": "valor == 0",
              "entao": "Nem todo orçamento tem de onde cortar; muitas vezes é a renda que está curta, e isso não é falha sua. Nesse caso, revise o prazo da meta em vez do valor."
            },
            {
              "se": "valor > 0 e valor <= 50",
              "entao": "Corte pequeno e constante muda o prazo. R$ 40 por mês viram R$ 480 em um ano, sem depender de nenhuma renda nova."
            },
            {
              "se": "valor > 50",
              "entao": "É um corte grande. Confira se ele se sustenta por vários meses seguidos: meta cumprida é a que aguenta o mês ruim, não só o mês bom."
            }
          ],
          "proximoPasso": "Escolha uma meta sua e marque uma data no mês que vem para revisá-la."
        },
      },
    ],
  },
  {
    slug: "ef67-de-graca-nao-e-de-graca",
    titulo: "De graça não é de graça",
    subtitulo: "Quem paga a promoção — e o que a produção custa.",
    segmento: "ef67",
    blocoId: "ef67-bloco-c",
    blocoRotulo: "Bloco C · Consumo",
    ordem: 8,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["promocao", "gratis", "consumo"],
    thumbnail: "/trilha/consumo.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-metas-e-ameacas",
    habilidades: ["EF67LF16", "EF67LF17"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Alguém paga a conta",
        conteudo: {
          "texto": "Frete grátis, brinde, amostra, primeiro mês sem pagar: nada disso sai do nada. O custo está embutido em outro preço, no seu cadastro ou na expectativa de que você volte. Além do dinheiro, produzir e transportar cada item consome água, energia e trabalho de alguém. Gratuito para você não significa sem custo.",
          "destaque": "Grátis para você quer dizer pago por outro caminho."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Três pelo preço de uma",
        conteudo: {
          "personagem": "Helena",
          "texto": "Helena viu a promoção: três camisetas por R$ 60, ou uma por R$ 29,90. Ela precisava de uma só. Levou as três, achando que tinha economizado R$ 29,70, e duas ficaram no armário. Numa etiqueta, leu que cada camiseta consome cerca de 2.700 litros de água entre o cultivo do algodão e o tingimento.",
          "pergunta": "Ela economizou R$ 29,70 ou gastou a mais do que precisava?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "O desconto e o gasto",
        conteudo: {
          "enunciado": "Helena precisava de uma camiseta e pagou R$ 60 pelo combo de três. Quanto ela gastou a mais do que precisava?",
          "alternativas": [
            {
              "id": "a",
              "texto": "R$ 29,70, o desconto que a loja anunciou.",
              "correta": false,
              "feedback": "Esse é o desconto calculado sobre três camisetas. Ele só vira economia se as três forem usadas, e duas ficaram paradas."
            },
            {
              "id": "b",
              "texto": "R$ 30,10, a diferença entre R$ 60,00 e a camiseta de R$ 29,90.",
              "correta": true,
              "feedback": "Isso. Ela saiu com R$ 30,10 a menos no bolso e com duas peças que não precisava."
            },
            {
              "id": "c",
              "texto": "Nada, porque o preço de cada camiseta ficou menor.",
              "correta": false,
              "feedback": "O preço por peça caiu mesmo, mas o gasto total subiu. Pagar menos por unidade não é o mesmo que gastar menos."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "O que te convence",
        conteudo: {
          "pergunta": "O que mais te faz aceitar uma promoção que você não estava procurando?",
          "campo": "faixa",
          "placeholder": "Frete grátis",
          "faixas": [
            "Medo de perder a oferta",
            "Frete grátis",
            "Brinde ou amostra",
            "Contagem regressiva ou poucas unidades",
            "Não costumo aceitar"
          ],
          "ajuda": "Escolha a que mais pesa para você; não existe resposta que sirva a todo mundo."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O cálculo do outro lado",
        conteudo: {
          "texto": "Você marcou {valor}. Cada oferta dessas mistura dois cálculos: um financeiro, feito pela empresa para recuperar o custo em outro lugar, e um psicológico, feito para acelerar a sua decisão. Somando tudo, ainda existe o custo de produzir aquilo que talvez fique no armário, como as camisetas de Helena.",
          "regras": [
            {
              "se": "valor == Medo de perder a oferta ou valor == Contagem regressiva ou poucas unidades",
              "entao": "Escassez, real ou fabricada, encurta o tempo de pensar. Adiar a compra em um dia costuma revelar se a vontade era sua ou do relógio na tela."
            },
            {
              "se": "valor == Frete grátis ou valor == Brinde ou amostra",
              "entao": "O que veio de graça já está pago dentro do preço ou no valor do pedido mínimo. Compare o total final com o de levar só o que você queria."
            },
            {
              "se": "valor == Não costumo aceitar",
              "entao": "Bom filtro. Vale conferir se ele funciona também em promoção de coisa barata, que passa despercebida e soma no fim do mês."
            }
          ],
          "proximoPasso": "Antes da próxima promoção, calcule o total final, não o desconto anunciado."
        },
      },
    ],
  },
  {
    slug: "ef67-o-que-decide-por-voce",
    titulo: "O que decide por você",
    subtitulo: "Emoção e viés por dentro, grupo e publicidade por fora.",
    segmento: "ef67",
    blocoId: "ef67-bloco-c",
    blocoRotulo: "Bloco C · Consumo",
    ordem: 9,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["vieses", "emocao", "publicidade"],
    thumbnail: "/trilha/consumo.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-de-graca-nao-e-de-graca",
    habilidades: ["EF67LF18", "EF67LF19"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Duas forcas em toda escolha",
        conteudo: {
          "texto": "Toda decisão de compra tem duas forças agindo junto. De dentro vêm emoção, pressa e atalhos mentais — o cérebro decide rápido para não pensar demais. De fora vêm o grupo de amigos, a publicidade e o que aparece nas redes. Nenhuma das duas é vilã. O problema é decidir sem perceber que elas estão ali.",
          "destaque": "Decidir bem começa por perceber quem está decidindo junto com você."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O fone de Heloisa",
        conteudo: {
          "personagem": "Heloísa",
          "texto": "Heloísa juntou R$ 320 para um fone. No grupo da escola, três colegas apareceram com um modelo de R$ 480, e o vídeo do lançamento aparece toda hora no feed dela. Ela sentiu que ficaria de fora se comprasse o mais barato. Voltou para casa decidida a pedir os R$ 160 que faltavam, sem ter olhado nenhum outro modelo.",
          "pergunta": "O que pesou mais na decisão de Heloísa: o que veio de dentro dela ou o que veio de fora?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "De dentro e de fora",
        conteudo: {
          "enunciado": "Na situação de Heloísa, qual combinação descreve melhor o que agiu de dentro e o que agiu de fora?",
          "alternativas": [
            {
              "id": "a",
              "texto": "De dentro: o preço do fone. De fora: a quantia que ela já tinha juntado.",
              "correta": false,
              "feedback": "Preço e quantia guardada são dados do problema, não forças que empurram a decisão. Eles não explicam a pressa dela."
            },
            {
              "id": "b",
              "texto": "De dentro: o medo de ficar de fora. De fora: os colegas e o vídeo repetido no feed.",
              "correta": true,
              "feedback": "Isso mesmo. O medo é uma emoção interna; colegas e publicidade repetida agem de fora e reforçam esse medo."
            },
            {
              "id": "c",
              "texto": "De dentro: o vídeo do lançamento. De fora: a vontade dela de ter o fone.",
              "correta": false,
              "feedback": "Está invertido. O vídeo chega de fora, e a vontade nasce dentro dela."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua semana",
        conteudo: {
          "pergunta": "Nos últimos sete dias, quantas vezes você quis comprar algo logo depois de ver nas redes ou com alguém?",
          "campo": "numero",
          "placeholder": "3",
          "ajuda": "Não precisa ser exato: uma estimativa honesta já mostra o tamanho da influência."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O tamanho do empurrao",
        conteudo: {
          "texto": "Você contou {valor} vezes em uma semana. Esse número não diz se você gasta muito ou pouco: diz com que frequência a vontade chega de fora já pronta, antes de você comparar preço ou perguntar se precisa. Percebendo o gatilho, a decisão volta a ser sua.",
          "regras": [
            {
              "se": "valor == 0",
              "entao": "Ou a semana foi calma, ou os gatilhos passaram sem você notar. Repita a contagem numa semana com mais tempo de tela."
            },
            {
              "se": "valor entre 1 e 4",
              "entao": "Frequência comum. O ponto não é zerar, é reconhecer o impulso e esperar antes de decidir."
            },
            {
              "se": "valor >= 5",
              "entao": "Quase um por dia. Vale olhar quais contas e quais grupos disparam isso com mais força."
            }
          ],
          "proximoPasso": "Escolha uma vontade de hoje e espere 24 horas antes de decidir se ela continua."
        },
      },
    ],
  },
  {
    slug: "ef67-poupar-de-proposito",
    titulo: "Poupar de propósito",
    subtitulo: "Poupar deixa de ser sobra e vira parte do plano.",
    segmento: "ef67",
    blocoId: "ef67-bloco-d",
    blocoRotulo: "Bloco D · Poupança e investimento",
    ordem: 10,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["poupar", "objetivo", "planejamento"],
    thumbnail: "/trilha/poupar.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-o-que-decide-por-voce",
    habilidades: ["EF67LF20", "EF67LF23"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Sobra nao e plano",
        conteudo: {
          "texto": "Poupar por sobra é apostar que vai sobrar. Quase nunca sobra. Poupar de propósito é o contrário: você separa uma parte assim que o dinheiro entra e trata o resto como o que dá para gastar. Um objetivo com nome, valor e prazo transforma isso em plano — e um plano é bem mais fácil de seguir do que uma intenção.",
          "destaque": "Poupar não é o que sobra no fim; é o que sai primeiro."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O violao de Ivone",
        conteudo: {
          "personagem": "Ivone",
          "texto": "Ivone recebe R$ 90 por mês ajudando na barraca da feira aos sábados. Ela quer um violão usado de R$ 390. Nos três primeiros meses guardou o que sobrou: R$ 12, depois R$ 0, depois R$ 18. No quarto mês mudou a regra e separou R$ 30 no próprio sábado do pagamento, antes de qualquer gasto.",
          "pergunta": "Nos três primeiros meses faltava dinheiro ou faltava um lugar fixo para ele dentro do mês?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Quanto tempo falta",
        conteudo: {
          "enunciado": "Ivone já tem R$ 30 guardados e passa a separar R$ 30 todo mês. Em quantos meses ela chega aos R$ 390 do violão?",
          "alternativas": [
            {
              "id": "a",
              "texto": "13 meses",
              "correta": false,
              "feedback": "Isso ignora os R$ 30 que ela já tinha. Faltam R$ 360, não R$ 390."
            },
            {
              "id": "b",
              "texto": "12 meses",
              "correta": true,
              "feedback": "Certo. Faltam R$ 360 e, a R$ 30 por mês, são exatamente 12 meses."
            },
            {
              "id": "c",
              "texto": "10 meses",
              "correta": false,
              "feedback": "Em 10 meses ela junta R$ 300 e, com os R$ 30 iniciais, chega a R$ 330: ainda abaixo do preço."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Seu valor fixo",
        conteudo: {
          "pergunta": "Quanto você consegue separar por mês, logo que o dinheiro entra, sem depender de sobra?",
          "campo": "moeda",
          "placeholder": "R$ 30",
          "ajuda": "Vale qualquer valor que você consiga repetir todo mês; constância conta mais que tamanho."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "De intencao para plano",
        conteudo: {
          "texto": "Separar {valor} todo mês, sempre no mesmo dia, é o que transforma vontade em plano. Divida o preço do seu objetivo por esse valor e você tem o prazo. Se o prazo assustar, dá para mudar o valor, mudar o objetivo ou aceitar que ele vai demorar: as três respostas são honestas.",
          "regras": [
            {
              "se": "valor == 0",
              "entao": "Se hoje não dá para separar nada, o plano começa antes: mapear de onde viria essa entrada. Isso não é falha sua."
            },
            {
              "se": "valor entre R$ 1 e R$ 50",
              "entao": "Valor pequeno e constante já vale: em doze meses vira doze vezes esse número, sem esforço extra."
            },
            {
              "se": "valor > R$ 50",
              "entao": "Bom fôlego. Confira se ele sobrevive a um mês apertado; um valor menor que você nunca quebra rende mais que um alto que falha."
            }
          ],
          "proximoPasso": "Escolha o dia do mês em que o dinheiro entra e marque a separação nesse dia."
        },
      },
    ],
  },
  {
    slug: "ef67-guardar-x-render",
    titulo: "Guardar ou render",
    subtitulo: "Poupar, investir e o dinheiro que segura o imprevisto.",
    segmento: "ef67",
    blocoId: "ef67-bloco-d",
    blocoRotulo: "Bloco D · Poupança e investimento",
    ordem: 11,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["poupar", "investir", "poupanca"],
    thumbnail: "/trilha/poupar.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-poupar-de-proposito",
    habilidades: ["EF67LF21", "EF67LF22"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Separar e render",
        conteudo: {
          "texto": "Poupar é o ato de separar dinheiro e não gastar. Investir é dar um destino a esse dinheiro para que ele renda, ou seja, cresça com o tempo. Na caderneta de poupança, por exemplo, o valor guardado rende um pouco a cada mês. Poupar vem sempre primeiro: sem separar, não há o que render.",
          "destaque": "Poupar é separar. Investir é fazer o que foi separado render."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A caixa e a caderneta",
        conteudo: {
          "personagem": "Jaqueline",
          "texto": "Jaqueline guardou R$ 400 numa caixa embaixo da cama durante o ano todo. A prima dela deixou os mesmos R$ 400 na caderneta de poupança e, doze meses depois, tinha cerca de R$ 425. No mesmo período, a geladeira da casa de Jaqueline queimou e o conserto custou R$ 260 — e ela tinha o dinheiro para pagar na hora.",
          "pergunta": "Quem se saiu melhor: quem fez o dinheiro render ou quem tinha o dinheiro disponível quando o imprevisto chegou?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Qual e a diferenca",
        conteudo: {
          "enunciado": "Qual frase diferencia corretamente o que Jaqueline e a prima fizeram com os R$ 400?",
          "alternativas": [
            {
              "id": "a",
              "texto": "As duas investiram, só que em lugares diferentes.",
              "correta": false,
              "feedback": "Jaqueline apenas poupou: o dinheiro ficou parado e não rendeu nada. Guardar não é investir."
            },
            {
              "id": "b",
              "texto": "As duas pouparam; só a prima também investiu, porque o dinheiro dela rendeu.",
              "correta": true,
              "feedback": "Exato. Poupar é separar, e as duas separaram. Render com o tempo é o que caracteriza o investimento."
            },
            {
              "id": "c",
              "texto": "Jaqueline investiu ao guardar em casa, porque assumiu o risco de perder.",
              "correta": false,
              "feedback": "Correr risco não é investir. Investir é destinar o dinheiro para que ele renda, o que não acontece dentro da caixa."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Seu imprevisto",
        conteudo: {
          "pergunta": "Qual imprevisto poderia aparecer na sua casa nos próximos meses, e quanto ele custaria?",
          "campo": "moeda",
          "placeholder": "R$ 260",
          "ajuda": "Estimativa basta: o objetivo é ter uma ordem de grandeza, não o preço exato."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Para que serve a reserva",
        conteudo: {
          "texto": "Você estimou {valor} para um imprevisto. Reserva é dinheiro poupado que fica disponível justamente para isso: ela não existe para render o máximo, existe para você não precisar de crédito às pressas. Se render um pouco enquanto espera, melhor — mas o critério principal é poder usar quando a hora chega.",
          "regras": [
            {
              "se": "valor < 200",
              "entao": "Valor baixo e alcançável: dá para montar em poucos meses separando pouco de cada vez."
            },
            {
              "se": "valor entre 200 e 1000",
              "entao": "Faixa comum de imprevisto doméstico. Divida esse total pelo que você consegue separar por mês para ver o prazo."
            },
            {
              "se": "valor > 1000",
              "entao": "Reserva grande leva tempo, e isso é normal. Comece por uma parte dela em vez de adiar por parecer inalcançável."
            }
          ],
          "proximoPasso": "Escreva o valor da sua reserva e o primeiro depósito que você faz nesta semana."
        },
      },
    ],
  },
  {
    slug: "ef67-credito-pra-que-serve",
    titulo: "Crédito: pra que serve",
    subtitulo: "Quando o crédito resolve — e quem oferece ele.",
    segmento: "ef67",
    blocoId: "ef67-bloco-e",
    blocoRotulo: "Bloco E · Crédito e endividamento",
    ordem: 12,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["credito", "bancos", "emprestimo"],
    thumbnail: "/trilha/credito.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-guardar-x-render",
    habilidades: ["EF67LF24", "EF67LF34"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Dinheiro adiantado",
        conteudo: {
          "texto": "Crédito é dinheiro que alguém empresta agora para você devolver depois, com um valor a mais chamado juros. Não é sinal de descontrole: às vezes ele resolve uma necessidade que não espera, como um conserto urgente, ou permite que um negócio compre material antes de vender. Quem oferece crédito são bancos, cooperativas, financeiras e fintechs, e cada um cobra um preço diferente por isso.",
          "destaque": "Crédito adianta o dinheiro que você ainda não tem e cobra por esse adiantamento."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O forno da banca",
        conteudo: {
          "personagem": "Jefferson",
          "texto": "Jefferson ajuda a mãe na banca de pastel. O forno parou e um novo custa R$ 1.800; a banca tem R$ 600 guardados. Sem forno, a banca fecha e a família fica sem a renda do mês. A mãe comparou três ofertas para os R$ 1.200 que faltam: um banco, uma cooperativa de crédito do bairro e um aplicativo, cada um com um custo diferente.",
          "pergunta": "Nesse caso, o crédito é um problema ou a ferramenta que mantém a renda da família?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Por que comparar",
        conteudo: {
          "enunciado": "Por que faz sentido a mãe de Jefferson comparar banco, cooperativa e aplicativo antes de pegar os R$ 1.200?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Porque só bancos podem emprestar dinheiro legalmente.",
              "correta": false,
              "feedback": "Bancos não são os únicos: cooperativas de crédito, financeiras e fintechs também fornecem crédito."
            },
            {
              "id": "b",
              "texto": "Porque cada agente financeiro cobra um custo diferente pelo mesmo valor emprestado.",
              "correta": true,
              "feedback": "Isso. O valor emprestado é o mesmo, mas juros e taxas mudam de instituição para instituição."
            },
            {
              "id": "c",
              "texto": "Porque comparar faz o valor emprestado diminuir.",
              "correta": false,
              "feedback": "Comparar não muda os R$ 1.200 emprestados; muda quanto ela vai devolver a mais."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Uma necessidade real",
        conteudo: {
          "pergunta": "Cite uma situação da sua casa ou do seu bairro em que pegar crédito resolveria algo que não pode esperar.",
          "campo": "texto",
          "placeholder": "Consertar a moto que a família usa para trabalhar",
          "ajuda": "Não precisa ser algo que já aconteceu; serve qualquer necessidade que você consiga imaginar."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Quando o credito cabe",
        conteudo: {
          "texto": "Você descreveu: {valor}. Crédito faz sentido quando o que ele resolve não pode esperar e quando existe uma renda futura para pagar as parcelas. Antes de aceitar a primeira oferta, vale perguntar em mais de um lugar: banco, cooperativa, financeira e aplicativo cobram preços diferentes pelo mesmo empréstimo.",
          "regras": [
            {
              "se": "a situação é uma necessidade urgente ou uma ferramenta de trabalho",
              "entao": "É o uso clássico do crédito: ele mantém a renda ou evita um prejuízo maior que o próprio juro."
            },
            {
              "se": "a situação é um desejo de consumo que pode esperar",
              "entao": "Aqui o crédito custa caro por pressa. Esperar e poupar costuma sair mais barato que pagar juros."
            },
            {
              "se": "a situação envolve um negócio",
              "entao": "Crédito para negócio se paga com o que o negócio gera. Confira se a venda esperada cobre a parcela."
            }
          ],
          "proximoPasso": "Pergunte a um adulto da sua casa onde ele buscaria crédito e por quê."
        },
      },
    ],
  },
  {
    slug: "ef67-pecas-do-credito",
    titulo: "As peças do crédito",
    subtitulo: "Juros, taxa e prazo, no curto e no longo.",
    segmento: "ef67",
    blocoId: "ef67-bloco-e",
    blocoRotulo: "Bloco E · Crédito e endividamento",
    ordem: 13,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["credito", "juros", "taxas"],
    thumbnail: "/trilha/credito.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-credito-pra-que-serve",
    habilidades: ["EF67LF25", "EF67LF28"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Juros, taxas e prazo",
        conteudo: {
          "texto": "Todo crédito tem três peças. Os juros são o preço do dinheiro emprestado, expressos em porcentagem. As taxas são cobranças extras, como cadastro ou seguro. O prazo é em quantas parcelas você devolve. Mexer numa peça mexe nas outras: alongar o prazo diminui a parcela, mas faz você pagar juros por mais tempo.",
          "destaque": "Parcela menor não é crédito mais barato; costuma ser prazo maior."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Duas ofertas, uma bicicleta",
        conteudo: {
          "personagem": "Joana",
          "texto": "Joana quer uma bicicleta de R$ 1.200 para ir ao trabalho. A loja oferece duas opções: pagar em 6 parcelas de R$ 220 ou em 24 parcelas de R$ 70. A parcela de R$ 70 cabe melhor no mês dela. Nos dois casos há ainda uma taxa de cadastro de R$ 40 cobrada na primeira parcela.",
          "pergunta": "A parcela menor cabe melhor no mês, mas quanto Joana paga a mais no fim das contas?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "O preco do prazo",
        conteudo: {
          "enunciado": "Sem contar a taxa de cadastro, quanto Joana paga a mais escolhendo 24 parcelas de R$ 70 em vez de 6 de R$ 220?",
          "alternativas": [
            {
              "id": "a",
              "texto": "R$ 150",
              "correta": false,
              "feedback": "Esse valor não bate. Calcule cada opção separadamente antes de comparar: 24 × 70 e 6 × 220."
            },
            {
              "id": "b",
              "texto": "R$ 360",
              "correta": true,
              "feedback": "Certo. 24 × R$ 70 = R$ 1.680 e 6 × R$ 220 = R$ 1.320. A diferença é R$ 360."
            },
            {
              "id": "c",
              "texto": "R$ 480",
              "correta": false,
              "feedback": "R$ 480 é a diferença entre as 24 parcelas e o preço à vista de R$ 1.200, não entre as duas formas de parcelar."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Seu prazo",
        conteudo: {
          "pergunta": "Se você tivesse que pagar R$ 1.200 parcelado, em quantas parcelas escolheria dividir?",
          "campo": "numero",
          "placeholder": "12",
          "ajuda": "Pense no que caberia no seu mês; não existe número certo, existe consequência."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Curto ou longo prazo",
        conteudo: {
          "texto": "Você escolheu {valor} parcelas. Prazo curto significa parcela alta e menos juros no total; prazo longo significa parcela baixa e mais juros acumulados. As duas escolhas são defensáveis. O erro é escolher olhando só o tamanho da parcela e nunca o total que será pago.",
          "regras": [
            {
              "se": "valor <= 6",
              "entao": "Prazo curto: você paga menos no total, mas a parcela pesa. Confira se ela cabe mesmo num mês apertado."
            },
            {
              "se": "valor entre 7 e 18",
              "entao": "Prazo intermediário. Multiplique a parcela pelo número de vezes e compare esse total com o preço à vista."
            },
            {
              "se": "valor > 18",
              "entao": "Prazo longo: a parcela alivia agora, mas você fica devendo por muito tempo e paga bem mais no fim."
            }
          ],
          "proximoPasso": "Pegue um anúncio de parcelamento e multiplique a parcela pelo número de vezes."
        },
      },
    ],
  },
  {
    slug: "ef67-custo-efetivo-total",
    titulo: "Custo efetivo total",
    subtitulo: "O número que mostra o preço real de pegar emprestado.",
    segmento: "ef67",
    blocoId: "ef67-bloco-e",
    blocoRotulo: "Bloco E · Crédito e endividamento",
    ordem: 14,
    nivel: "avancado",
    duracaoMin: 4,
    pontos: 50,
    tags: ["cet", "credito", "juros"],
    thumbnail: "/trilha/credito.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-pecas-do-credito",
    habilidades: ["EF67LF26", "EF67LF27"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O preco inteiro",
        conteudo: {
          "texto": "O Custo Efetivo Total, ou CET, é o preço completo de um crédito: juros mais todas as taxas, seguros e tarifas, reunidos em um só número. Ele existe porque a taxa de juros sozinha esconde parte da conta. Comparar duas ofertas pelo CET é comparar o que você realmente vai pagar, e não só o que aparece no anúncio.",
          "destaque": "O CET é o preço inteiro do crédito, não só a taxa que aparece no anúncio."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Duas ofertas de Jonas",
        conteudo: {
          "personagem": "Jonas",
          "texto": "Jonas precisa de R$ 1.000 emprestados. A oferta A anuncia juros menores, mas cobra R$ 90 de tarifa e seguro, e ele devolveria R$ 1.240 no total. A oferta B anuncia juros maiores, não cobra tarifa, e ele devolveria R$ 1.180. O anúncio da A está em letra grande na vitrine; o total só aparece no contrato.",
          "pergunta": "Qual oferta é mais barata para Jonas: a de juros menores ou a de total menor?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "O que o CET revela",
        conteudo: {
          "enunciado": "Comparando as duas ofertas de R$ 1.000, o que o CET revela que a taxa de juros anunciada esconde?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Que a oferta A é melhor, porque juros menores sempre significam pagar menos.",
              "correta": false,
              "feedback": "Juros menores não bastam quando há tarifa e seguro por fora. O total da A é maior: R$ 1.240."
            },
            {
              "id": "b",
              "texto": "Que a oferta B custa R$ 60 a menos no total, mesmo com juros anunciados maiores.",
              "correta": true,
              "feedback": "Exato. R$ 1.240 contra R$ 1.180: a B sai R$ 60 mais barata, porque não tem tarifa nem seguro embutidos."
            },
            {
              "id": "c",
              "texto": "Que as duas custam o mesmo, já que o valor emprestado é igual.",
              "correta": false,
              "feedback": "O valor emprestado é igual, mas o que se devolve não. É justamente essa diferença que o CET mostra."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Seu limite",
        conteudo: {
          "pergunta": "Pegando R$ 1.000 emprestados por um ano, quanto a mais você aceitaria devolver no total?",
          "campo": "moeda",
          "placeholder": "R$ 150",
          "ajuda": "Não existe resposta certa: o valor marca o ponto em que o crédito deixa de valer para você."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Pros, contras e criterio",
        conteudo: {
          "texto": "Você aceitaria pagar {valor} a mais por R$ 1.000 emprestados. Esse número é o seu critério: se o CET de uma oferta passa desse limite, a resposta é não, por mais urgente que pareça. Crédito tem prós, porque resolve o que não espera, e contras, porque compromete a renda dos próximos meses.",
          "regras": [
            {
              "se": "valor < 100",
              "entao": "Critério exigente. Ele descarta boa parte das ofertas, o que também significa esperar e poupar mais vezes."
            },
            {
              "se": "valor entre 100 e 400",
              "entao": "Faixa razoável. Peça sempre o CET por escrito e compare com esse limite antes de assinar."
            },
            {
              "se": "valor > 400",
              "entao": "Você aceitaria devolver quase metade a mais. Confira se a parcela cabe na renda em todos os meses do contrato."
            }
          ],
          "proximoPasso": "Peça o CET por escrito em qualquer oferta de crédito antes de comparar as parcelas."
        },
      },
    ],
  },
  {
    slug: "ef67-fatura-do-cartao",
    titulo: "A fatura do cartão",
    subtitulo: "Ler a fatura e calcular o custo de pagar só o mínimo.",
    segmento: "ef67",
    blocoId: "ef67-bloco-e",
    blocoRotulo: "Bloco E · Crédito e endividamento",
    ordem: 15,
    nivel: "avancado",
    duracaoMin: 4,
    pontos: 50,
    tags: ["cartao", "fatura", "juros"],
    thumbnail: "/trilha/credito.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-custo-efetivo-total",
    habilidades: ["EF67LF31", "EF67LF32"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O que a fatura mostra",
        conteudo: {
          "texto": "A fatura do cartão é a lista do que foi gasto no mês. Ela mostra o total, a data de vencimento, as compras parceladas que ainda vão voltar nos próximos meses e o pagamento mínimo. O mínimo não é um desconto: é a menor parte que evita o atraso. O que ficar sem pagar vira dívida com juros.",
          "destaque": "Pagar o mínimo não encerra a fatura: transfere o resto para o mês seguinte, com juros."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O minimo de Josefa",
        conteudo: {
          "personagem": "Josefa",
          "texto": "A fatura de Josefa fechou em R$ 800, com pagamento mínimo de R$ 240. Ela pagou o mínimo. Os R$ 560 restantes entraram no rotativo, que cobra 10% de juros ao mês. No mês seguinte, além das compras novas, a fatura já trouxe esses R$ 560 acrescidos dos juros. Josefa achava que tinha quitado o mês.",
          "pergunta": "Se ela pagou o mínimo em dia, por que a dívida do mês anterior voltou maior?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Quanto volta no mes seguinte",
        conteudo: {
          "enunciado": "Josefa pagou R$ 240 de uma fatura de R$ 800. Com 10% de juros ao mês sobre o saldo, quanto volta na próxima fatura?",
          "alternativas": [
            {
              "id": "a",
              "texto": "R$ 560",
              "correta": false,
              "feedback": "R$ 560 é o saldo sem os juros. Falta somar os 10% cobrados sobre esse valor."
            },
            {
              "id": "b",
              "texto": "R$ 616",
              "correta": true,
              "feedback": "Certo. 10% de R$ 560 são R$ 56, e R$ 560 + R$ 56 = R$ 616, sem contar as compras novas."
            },
            {
              "id": "c",
              "texto": "R$ 880",
              "correta": false,
              "feedback": "Isso aplicaria os 10% sobre os R$ 800 inteiros. Os juros incidem só sobre o que ficou sem pagar."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Quanto voce pagaria",
        conteudo: {
          "pergunta": "Se a sua fatura fosse de R$ 800 e você só conseguisse pagar uma parte, quanto pagaria?",
          "campo": "moeda",
          "placeholder": "R$ 500",
          "ajuda": "Responda com o que caberia de verdade no mês, não com o que seria ideal."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O custo da parte que fica",
        conteudo: {
          "texto": "Pagando {valor} de uma fatura de R$ 800, o restante continua devendo e volta acrescido de juros no mês seguinte. Quanto maior a parte paga, menor o saldo sobre o qual os juros incidem. É por isso que pagar acima do mínimo, mesmo sem quitar tudo, muda o tamanho da conta.",
          "regras": [
            {
              "se": "valor >= 800",
              "entao": "Fatura quitada: nenhum saldo entra no rotativo e nenhum juro é cobrado."
            },
            {
              "se": "valor entre 241 e 799",
              "entao": "Acima do mínimo. A 10% ao mês, cada R$ 100 pagos a mais economizam R$ 10 de juros já no mês seguinte."
            },
            {
              "se": "valor <= 240",
              "entao": "No mínimo ou abaixo dele. Abaixo do mínimo entram multa e atraso; no mínimo, os R$ 560 restantes voltam como R$ 616."
            }
          ],
          "proximoPasso": "Peça para ver uma fatura de verdade e localize nela o total e o mínimo."
        },
      },
    ],
  },
  {
    slug: "ef67-quando-nao-paga",
    titulo: "Quando não paga",
    subtitulo: "Honrar dívida, o efeito do não pagamento e por que se chega lá.",
    segmento: "ef67",
    blocoId: "ef67-bloco-e",
    blocoRotulo: "Bloco E · Crédito e endividamento",
    ordem: 16,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["dividas", "endividamento", "negociacao"],
    thumbnail: "/trilha/credito.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-fatura-do-cartao",
    habilidades: ["EF67LF29", "EF67LF30", "EF67LF33"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Confianca e consequencia",
        conteudo: {
          "texto": "Pagar o que se deve mantém uma relação de confiança: quem cumpre o combinado continua tendo acesso a crédito quando precisa. Deixar de pagar traz consequências reais — juros que crescem, nome negativado, dificuldade de alugar ou financiar. E as causas raramente são só descuido: desemprego, doença, renda que oscila e juros altos empurram muita gente para a dívida.",
          "destaque": "Dívida não é falha de caráter, mas cobra juros todo mês até ser resolvida."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Quatro meses de Juliana",
        conteudo: {
          "personagem": "Juliana",
          "texto": "Juliana perdeu o serviço em março e a fatura de R$ 900 ficou sem pagamento. Em quatro meses, com juros e multa, a dívida passou de R$ 1.400 e o nome dela foi negativado. Em julho ela voltou a trabalhar, procurou a instituição e negociou o pagamento em parcelas menores. A dívida não sumiu, mas parou de crescer.",
          "pergunta": "O que mudou quando Juliana procurou a instituição em vez de esperar a dívida passar sozinha?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Causa e consequencia",
        conteudo: {
          "enunciado": "Qual leitura descreve melhor o que aconteceu com Juliana entre março e julho?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Ela se endividou por falta de disciplina e deveria ter se controlado.",
              "correta": false,
              "feedback": "A causa foi a perda da renda, não descuido. Tratar isso como falha pessoal esconde o motivo real da dívida."
            },
            {
              "id": "b",
              "texto": "A perda da renda gerou a dívida, e os juros sobre o valor não pago a fizeram crescer até a negativação.",
              "correta": true,
              "feedback": "Isso. A causa foi externa; a consequência do não pagamento total foi a dívida crescer e o crédito ficar restrito."
            },
            {
              "id": "c",
              "texto": "Como o nome já estava negativado, negociar depois não faria diferença.",
              "correta": false,
              "feedback": "Faz diferença: negociar interrompe o crescimento da dívida e é o caminho para limpar o nome."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Causas que voce conhece",
        conteudo: {
          "pergunta": "Qual dessas causas de endividamento você já viu acontecer perto de você?",
          "campo": "faixa",
          "placeholder": "Perda de emprego ou queda de renda",
          "faixas": [
            "Perda de emprego ou queda de renda",
            "Doença ou emergência na família",
            "Juros altos de uma dívida antiga",
            "Compras por impulso ou pressão do grupo",
            "Renda que varia muito de mês para mês"
          ],
          "ajuda": "Escolha a que mais aparece no que você conhece; todas são causas reais e comuns."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Negociar tambem e honrar",
        conteudo: {
          "texto": "Você apontou: {valor}. Nenhuma dessas causas se resolve com sermão. O que muda o rumo é agir cedo: falar com quem cobra, pedir prazo ou negociar antes que os juros dobrem a conta. Honrar a dívida importa pela confiança que ela sustenta, e negociar também é uma forma de honrar.",
          "regras": [
            {
              "se": "a causa é perda de renda, doença ou renda instável",
              "entao": "São causas externas e frequentes. A saída passa por renegociar prazo e valor, não por culpa."
            },
            {
              "se": "a causa é juros altos de uma dívida antiga",
              "entao": "É a dívida que cresce sozinha. Priorizar a de juro mais alto costuma ser o que estanca a bola de neve."
            },
            {
              "se": "a causa é compra por impulso ou pressão do grupo",
              "entao": "Aqui dá para agir antes: reconhecer o gatilho e adiar a decisão evita a dívida antes que ela exista."
            }
          ],
          "proximoPasso": "Se alguém da sua casa tem dívida atrasada, sugira ligar e pedir uma proposta de negociação."
        },
      },
    ],
  },
  {
    slug: "ef67-historico-e-armadilha",
    titulo: "Histórico e armadilha",
    subtitulo: "Cadastro positivo e a publicidade que empurra crédito.",
    segmento: "ef67",
    blocoId: "ef67-bloco-e",
    blocoRotulo: "Bloco E · Crédito e endividamento",
    ordem: 17,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["credito", "cadastro positivo", "publicidade"],
    thumbnail: "/trilha/credito.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-quando-nao-paga",
    habilidades: ["EF67LF35", "EF67LF36"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O histórico que fala por você",
        conteudo: {
          "texto": "Cadastro positivo é um histórico que registra se as contas de uma pessoa foram pagas em dia. Bancos e lojas consultam esse registro antes de dar crédito, que é dinheiro emprestado para pagar depois. Quem paga em dia costuma conseguir crédito mais barato. Quem atrasa costuma pagar mais caro ou ouvir um não.",
          "destaque": "Seu histórico de pagamento é lido antes de qualquer empréstimo."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O anúncio de Karina",
        conteudo: {
          "personagem": "Karina",
          "texto": "Karina, de 12 anos, viu um anúncio de fone de ouvido por R$ 480. O anúncio dizia: \"10x de R$ 48, aprovação na hora\". A mãe dela explicou que aquilo era crédito. Explicou também que a loja consulta o histórico de pagamentos antes de aprovar. Karina percebeu que o preço parecia menor porque estava fatiado em dez pedaços.",
          "pergunta": "O que o anúncio destaca e o que ele deixa em letra pequena?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Onde está a armadilha",
        conteudo: {
          "enunciado": "Um anúncio mostra \"12x de R$ 40\" em letra grande e o preço total em letra pequena. Qual é a armadilha?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Parcelar é sempre errado, mesmo sem juros.",
              "correta": false,
              "feedback": "Parcelar não é errado por si só. A armadilha está em esconder o valor total e apressar a decisão."
            },
            {
              "id": "b",
              "texto": "O anúncio destaca a parcela para o total de R$ 480 parecer pequeno.",
              "correta": true,
              "feedback": "Isso mesmo. Mostrando só a parcela, o anúncio faz um valor alto parecer baixo e acelera a compra."
            },
            {
              "id": "c",
              "texto": "A loja não pode consultar o seu histórico de pagamentos.",
              "correta": false,
              "feedback": "Pode sim. O cadastro positivo existe justamente para a loja avaliar o risco antes de dar crédito."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua conta de parcelas",
        conteudo: {
          "pergunta": "Se você aceitasse todos os anúncios que viu nesta semana, quanto pagaria por mês em parcelas?",
          "campo": "moeda",
          "placeholder": "R$ 150",
          "ajuda": "Uma estimativa aproximada já serve; ninguém precisa somar anúncio por anúncio."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Parcela é renda futura",
        conteudo: {
          "texto": "Você estimou {valor} por mês em parcelas. Parcela é compromisso: ela ocupa a renda futura antes de o mês começar. E é ela que o cadastro positivo registra, paga ou atrasada.",
          "regras": [
            {
              "se": "valor == 0",
              "entao": "Sem compromisso assumido, toda a renda do mês seguinte continua disponível para decidir na hora."
            },
            {
              "se": "valor > 0 e valor <= 100",
              "entao": "É um valor pequeno, mas somado a outros vira conta fixa. Anote em que mês ele termina."
            },
            {
              "se": "valor > 100",
              "entao": "Vale separar o que é anúncio do que é necessidade. Quando a renda cai, a parcela não cai junto."
            }
          ],
          "proximoPasso": "Escolha um anúncio que viu hoje e descubra o preço total à vista."
        },
      },
    ],
  },
  {
    slug: "ef67-de-onde-vem-a-renda",
    titulo: "De onde vem a renda",
    subtitulo: "Formal, informal, frequente, esporádica — público ou privado.",
    segmento: "ef67",
    blocoId: "ef67-bloco-f",
    blocoRotulo: "Bloco F · Renda e empreendedorismo",
    ordem: 18,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["renda", "trabalho formal", "trabalho informal"],
    thumbnail: "/trilha/renda.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-historico-e-armadilha",
    habilidades: ["EF67LF37", "EF67LF40"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Nem toda renda é igual",
        conteudo: {
          "texto": "Renda é o dinheiro que entra. Ela pode ser frequente, como um salário todo mês, ou esporádica, como um bico no fim de semana. Pode ser formal, com contrato registrado e direitos garantidos, ou informal, sem registro. Quanto mais esporádica e informal a renda, mais o planejamento precisa contar com meses fracos.",
          "destaque": "Renda frequente dá previsibilidade; renda esporádica exige mais planejamento."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "As três rendas da casa",
        conteudo: {
          "personagem": "Laís",
          "texto": "Na casa de Laís entram três rendas. A tia é professora concursada em escola pública e recebe R$ 3.200 todo mês, em data certa. O irmão trabalha registrado em uma loja privada e ganha R$ 1.600. A avó vende bolos por encomenda: em um mês bom faz R$ 700, em um mês fraco faz R$ 200.",
          "pergunta": "Qual dessas três rendas é a mais difícil de prever, e o que isso muda?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Público e privado",
        conteudo: {
          "enunciado": "A tia de Laís entrou por concurso na escola pública; o irmão foi contratado por uma loja privada. Qual diferença está correta?",
          "alternativas": [
            {
              "id": "a",
              "texto": "No emprego público não existem regras nem cobrança de resultado.",
              "correta": false,
              "feedback": "Existem sim: servidores seguem regras, prazos e avaliações. A diferença está na entrada e na estabilidade."
            },
            {
              "id": "b",
              "texto": "Entra-se no público por concurso, com mais estabilidade; no privado, a empresa contrata e demite conforme o negócio.",
              "correta": true,
              "feedback": "Isso. A forma de entrar, as regras e o risco de perder o emprego funcionam de maneiras diferentes nos dois."
            },
            {
              "id": "c",
              "texto": "Só o emprego privado paga salário; o público paga ajuda do governo.",
              "correta": false,
              "feedback": "Os dois pagam salário. No público, quem paga é o governo, com dinheiro de impostos; no privado, a empresa."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Quanto entra em data fixa",
        conteudo: {
          "pergunta": "Pense em um adulto que você conhece. Quanto da renda dele entra sempre na mesma data?",
          "campo": "faixa",
          "placeholder": "Escolha uma opção",
          "faixas": [
            "Quase tudo entra em data fixa",
            "Mais ou menos metade",
            "Quase nada, varia todo mês",
            "Não sei dizer"
          ],
          "ajuda": "É uma estimativa; não precisa perguntar valores a ninguém."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Planejar com o que se tem",
        conteudo: {
          "texto": "Você respondeu: {valor}. Renda previsível e renda variável não são melhores nem piores. Elas pedem planejamentos diferentes. Renda instável não é falta de esforço: muitos trabalhos são pagos por dia, por entrega ou por encomenda.",
          "regras": [
            {
              "se": "valor == 'Quase tudo entra em data fixa'",
              "entao": "Com data certa, dá para montar um calendário de contas ancorado no dia do pagamento."
            },
            {
              "se": "valor == 'Mais ou menos metade'",
              "entao": "Metade fixa e metade variável: o ideal é que as contas essenciais caibam na parte fixa."
            },
            {
              "se": "valor == 'Quase nada, varia todo mês' ou valor == 'Não sei dizer'",
              "entao": "Quando a renda varia, guardar parte dos meses bons é o que sustenta os meses fracos."
            }
          ],
          "proximoPasso": "Pergunte a um adulto da sua casa se a renda dele entra em data fixa."
        },
      },
    ],
  },
  {
    slug: "ef67-estudo-desigualdade-lucro",
    titulo: "Estudo, desigualdade e lucro",
    subtitulo: "O que faz a renda de um país ser distribuída assim.",
    segmento: "ef67",
    blocoId: "ef67-bloco-f",
    blocoRotulo: "Bloco F · Renda e empreendedorismo",
    ordem: 19,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["desigualdade", "renda", "estudo"],
    thumbnail: "/trilha/renda.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-de-onde-vem-a-renda",
    habilidades: ["EF67LF38", "EF67LF39", "EF67LF41"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "A distância entre as rendas",
        conteudo: {
          "texto": "Desigualdade de renda é a distância entre o que ganham as pessoas de um mesmo país. Quando essa distância é enorme, parte da população não alcança escola, saúde e transporte de qualidade. O consumo do país encolhe junto. Desigualdade não é só problema de quem ganha pouco: ela afeta a sociedade toda.",
          "destaque": "Desigualdade grande trava o país inteiro, não só quem ganha menos."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "As pulseiras de Larissa",
        conteudo: {
          "personagem": "Larissa",
          "texto": "Larissa monta e vende pulseiras na feira do bairro. No mês passado, recebeu R$ 900 com as vendas. Gastou R$ 340 em material, R$ 60 na barraca e R$ 50 no transporte. Ela achava que tinha ganhado R$ 900, até somar o que saiu. O que sobra depois das despesas tem nome: lucro.",
          "pergunta": "Quanto sobrou de verdade para Larissa no fim do mês?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "A conta do lucro",
        conteudo: {
          "enunciado": "Larissa recebeu R$ 900 e gastou R$ 340 em material, R$ 60 na barraca e R$ 50 no transporte. Qual foi o lucro?",
          "alternativas": [
            {
              "id": "a",
              "texto": "R$ 900, porque foi tudo o que entrou.",
              "correta": false,
              "feedback": "R$ 900 é a receita, o total que entrou. O lucro só aparece depois de descontar as despesas."
            },
            {
              "id": "b",
              "texto": "R$ 450, porque as despesas somam R$ 450.",
              "correta": true,
              "feedback": "Isso: 340 + 60 + 50 dá R$ 450 de despesas, e 900 menos 450 dá R$ 450 de lucro."
            },
            {
              "id": "c",
              "texto": "R$ 560, porque só o material conta como despesa.",
              "correta": false,
              "feedback": "Barraca e transporte também são despesas do negócio. Ignorar custos faz o lucro parecer maior."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Até onde você quer estudar",
        conteudo: {
          "pergunta": "Até que etapa de estudo você pretende chegar?",
          "campo": "faixa",
          "placeholder": "Escolha uma opção",
          "faixas": [
            "Terminar o ensino fundamental",
            "Terminar o ensino médio",
            "Curso técnico depois do médio",
            "Faculdade",
            "Ainda não decidi"
          ],
          "ajuda": "Não é um compromisso; é a estimativa de hoje, e ela pode mudar."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Estudo e renda possível",
        conteudo: {
          "texto": "Você marcou: {valor}. No Brasil, quem estuda por mais tempo tende a alcançar renda maior ao longo da vida. É tendência, não garantia: oportunidade, região e contatos também pesam. Por isso a desigualdade se repete de uma geração para outra.",
          "regras": [
            {
              "se": "valor == 'Terminar o ensino fundamental'",
              "entao": "Concluir o fundamental é a base. Vale conhecer as opções gratuitas de continuar, como as escolas técnicas públicas."
            },
            {
              "se": "valor é médio, técnico ou faculdade",
              "entao": "Cada etapa concluída costuma ampliar portas e renda possível. Descubra quais opções são gratuitas na sua cidade."
            },
            {
              "se": "valor == 'Ainda não decidi'",
              "entao": "Não decidir agora é normal nessa idade. Manter os estudos em dia é o que preserva as escolhas para depois."
            }
          ],
          "proximoPasso": "Descubra uma escola técnica ou universidade pública da sua região e o que ela oferece."
        },
      },
    ],
  },
  {
    slug: "ef67-o-que-e-risco",
    titulo: "O que é risco",
    subtitulo: "Reconhecer a situação antes do prejuízo.",
    segmento: "ef67",
    blocoId: "ef67-bloco-g",
    blocoRotulo: "Bloco G · Risco e proteção",
    ordem: 20,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["risco", "prejuizo", "protecao"],
    thumbnail: "/trilha/risco.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-estudo-desigualdade-lucro",
    habilidades: ["EF67LF42", "EF67LF43"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Risco é chance, não azar",
        conteudo: {
          "texto": "Risco é a chance de algo dar errado. Atravessar fora da faixa é risco; deixar o celular na borda da mesa é risco. Risco financeiro é quando o que dá errado custa dinheiro: o aparelho quebra, a bicicleta some, o serviço não é pago. Risco não é azar: é possibilidade que dá para enxergar antes.",
          "destaque": "Risco é o que ainda não aconteceu, mas dá para prever e reduzir."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A bicicleta de Leandro",
        conteudo: {
          "personagem": "Leandro",
          "texto": "Leandro juntou R$ 1.200 em um ano fazendo entregas de bicicleta no bairro. Ele deixa a bicicleta destrancada na frente das casas enquanto sobe para entregar, porque é mais rápido. Uma bicicleta usada como a dele custa perto de R$ 800. Ele economiza dois minutos por entrega e deixa exposto o que gera a renda dele.",
          "pergunta": "O que Leandro ganha e o que ele arrisca perder em cada entrega?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Qual delas custa dinheiro",
        conteudo: {
          "enunciado": "Qual destas situações do dia a dia é um risco financeiro, ou seja, pode virar prejuízo em dinheiro?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Escolher uma roupa diferente para sair de casa.",
              "correta": false,
              "feedback": "Isso é preferência, não risco. Nada de valor está exposto a perda nessa escolha."
            },
            {
              "id": "b",
              "texto": "Guardar o dinheiro das entregas em um lugar combinado com a família.",
              "correta": false,
              "feedback": "Isso reduz risco em vez de criar. Um lugar combinado diminui a chance de perda e de confusão."
            },
            {
              "id": "c",
              "texto": "Emprestar o celular novo sem combinar quando ele volta.",
              "correta": true,
              "feedback": "Sim. O aparelho pode não voltar ou voltar quebrado, e repor custa um dinheiro que ninguém planejou."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "O que você carrega",
        conteudo: {
          "pergunta": "Qual é o objeto mais caro que você usa todo dia? Quanto custaria para repor?",
          "campo": "moeda",
          "placeholder": "R$ 900",
          "ajuda": "O preço aproximado de um usado parecido já serve como estimativa."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O tamanho do prejuízo",
        conteudo: {
          "texto": "Você estimou {valor} para repor esse objeto. Esse é o tamanho do prejuízo se ele sumir ou quebrar amanhã. É esse número que decide quanto cuidado ele merece.",
          "regras": [
            {
              "se": "valor < 200",
              "entao": "Prejuízo pequeno, mas ainda é dinheiro. Cuidados simples, como guardar sempre no mesmo lugar, já resolvem."
            },
            {
              "se": "valor >= 200 e valor <= 1000",
              "entao": "Repor isso levaria semanas de economia. Vale um cuidado combinado com a família, não só boa vontade."
            },
            {
              "se": "valor > 1000",
              "entao": "É um valor alto para repor do zero. Objetos assim pedem proteção pensada: trava, seguro ou reserva guardada."
            }
          ],
          "proximoPasso": "Escolha um objeto seu e defina hoje um lugar fixo para guardá-lo."
        },
      },
    ],
  },
  {
    slug: "ef67-proteger-o-que-e-seu",
    titulo: "Proteger o que é seu",
    subtitulo: "Cuidado, seguro e reserva: três camadas de proteção.",
    segmento: "ef67",
    blocoId: "ef67-bloco-g",
    blocoRotulo: "Bloco G · Risco e proteção",
    ordem: 21,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["protecao", "seguro", "reserva"],
    thumbnail: "/trilha/risco.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-o-que-e-risco",
    habilidades: ["EF67LF44", "EF67LF45", "EF67LF46"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Três camadas de proteção",
        conteudo: {
          "texto": "Proteger um bem tem três camadas. A primeira é o cuidado do dia a dia: trancar, guardar, anotar o número do aparelho. A segunda é o seguro: você paga um valor por mês e a empresa cobre parte do prejuízo. A terceira é a reserva, dinheiro guardado que resolve o que as outras não cobriram.",
          "destaque": "Cuidado evita, seguro divide o prejuízo, reserva cobre o resto."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O violão de Lucas",
        conteudo: {
          "personagem": "Lucas",
          "texto": "O violão que Lucas usa nas aulas custou R$ 1.100. Ele guarda o instrumento na capa e anotou o número de série no caderno. A escola de música oferece um seguro de R$ 12 por mês que cobre queda e roubo. Lucas também tem R$ 300 guardados de um trabalho de férias. São três proteções diferentes.",
          "pergunta": "Se o violão cair e quebrar, qual das três proteções entra primeiro?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "O que o seguro faz",
        conteudo: {
          "enunciado": "Lucas paga R$ 12 por mês no seguro de um violão de R$ 1.100. O que esse seguro faz por ele?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Impede que o violão quebre ou seja roubado.",
              "correta": false,
              "feedback": "Seguro não impede o acidente. Quem reduz a chance de acontecer é o cuidado: capa, lugar seguro, atenção."
            },
            {
              "id": "b",
              "texto": "Troca um prejuízo grande e incerto por um custo pequeno e certo.",
              "correta": true,
              "feedback": "Exatamente. Ele paga R$ 144 no ano para não arcar sozinho com R$ 1.100 de uma vez só."
            },
            {
              "id": "c",
              "texto": "Devolve todo o dinheiro pago se nada acontecer no ano.",
              "correta": false,
              "feedback": "Não devolve. O valor pago comprou a cobertura naquele período, tendo acontecido algo ou não."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua reserva possível",
        conteudo: {
          "pergunta": "Quanto você conseguiria guardar por mês como reserva para imprevistos?",
          "campo": "moeda",
          "placeholder": "R$ 20",
          "ajuda": "Vale qualquer valor, inclusive zero: reserva se mede pelo hábito, não pelo tamanho."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "A camada que sobra",
        conteudo: {
          "texto": "Você informou {valor} por mês. Reserva é a camada que funciona para qualquer imprevisto, inclusive os que nenhum seguro cobre.",
          "regras": [
            {
              "se": "valor == 0",
              "entao": "Não sobrar nada agora é comum e não é culpa sua. Nesse caso, cuidado e prevenção são a proteção disponível."
            },
            {
              "se": "valor > 0 e valor <= 50",
              "entao": "Guardando esse valor, em doze meses você teria doze vezes ele. A constância vale mais que o tamanho."
            },
            {
              "se": "valor > 50",
              "entao": "É um valor que forma reserva rápido. Combine onde ele fica guardado, para não ser gasto sem querer."
            }
          ],
          "proximoPasso": "Escolha um bem seu e veja qual das três camadas de proteção falta nele."
        },
      },
    ],
  },
  {
    slug: "ef67-o-mundo-no-seu-bolso",
    titulo: "O mundo mexe no seu bolso",
    subtitulo: "O que acontece longe chega na conta de casa.",
    segmento: "ef67",
    blocoId: "ef67-bloco-h",
    blocoRotulo: "Bloco H · Cenário financeiro e cidadania",
    ordem: 22,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["economia", "precos", "bancos"],
    thumbnail: "/trilha/cidadania.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-proteger-o-que-e-seu",
    habilidades: ["EF67LF47", "EF67LF51"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O preço não nasce na loja",
        conteudo: {
          "texto": "O preço do que você compra não é decidido só na loja. Uma seca longe daqui reduz a colheita e o feijão sobe. Uma fábrica que fecha na sua cidade tira renda de bairros inteiros. Bancos e instituições financeiras ficam no meio desse caminho. Eles guardam dinheiro, emprestam a quem precisa e movem pagamentos.",
          "destaque": "O que acontece longe muda o preço da sua compra de amanhã."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O tomate de Luciana",
        conteudo: {
          "personagem": "Luciana",
          "texto": "A chuva estragou parte da safra de tomate em outro estado. No mercado perto de Luciana, o quilo passou de R$ 6 para R$ 14 em três semanas. A família dela comprava dois quilos por semana. Luciana não mudou nada no que faz, e mesmo assim a conta do mercado subiu R$ 64 no mês.",
          "pergunta": "Quem decidiu esse aumento na conta da família de Luciana?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Para que serve um banco",
        conteudo: {
          "enunciado": "Para que serve um banco ou outra instituição financeira?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Para deixar o dinheiro parado, sem que ele saia de lá.",
              "correta": false,
              "feedback": "Ele não fica parado. O banco usa parte dos depósitos para emprestar a outras pessoas e empresas."
            },
            {
              "id": "b",
              "texto": "Para imprimir o dinheiro que circula no país.",
              "correta": false,
              "feedback": "Quem autoriza a emissão de dinheiro é o Banco Central, não os bancos onde as pessoas têm conta."
            },
            {
              "id": "c",
              "texto": "Para guardar dinheiro, movimentar pagamentos e emprestar a quem precisa.",
              "correta": true,
              "feedback": "Sim. Esse papel de intermediário liga quem tem sobra a quem tem falta e faz o dinheiro circular."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Um preço para acompanhar",
        conteudo: {
          "pergunta": "Pense em um produto que a sua casa compra sempre. Quanto ele custa hoje?",
          "campo": "moeda",
          "placeholder": "R$ 8",
          "ajuda": "Se não souber o preço exato, chute perto: a ideia é ter um número para comparar depois."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Guarde esse número",
        conteudo: {
          "texto": "Você anotou {valor} para esse produto. Guarde o número: quando ele mudar, a causa quase sempre está fora da loja. Pode ser safra, combustível ou uma decisão tomada em outro lugar.",
          "regras": [
            {
              "se": "valor < 10",
              "entao": "Item barato muda de preço sem chamar atenção, mas pesa no mês quando é comprado toda semana."
            },
            {
              "se": "valor >= 10 e valor <= 100",
              "entao": "Uma alta de 20% aqui já aparece na compra do mês. Vale comparar o preço em dois lugares."
            },
            {
              "se": "valor > 100",
              "entao": "Em compras desse tamanho, pesquisar preço ou esperar uma semana costuma valer mais do que parece."
            }
          ],
          "proximoPasso": "Anote o preço desse produto hoje e confira de novo daqui a um mês."
        },
      },
    ],
  },
  {
    slug: "ef67-seus-direitos-consumidor",
    titulo: "Seus direitos como consumidor",
    subtitulo: "Quem tem que dever, e onde reclamar quando falha.",
    segmento: "ef67",
    blocoId: "ef67-bloco-h",
    blocoRotulo: "Bloco H · Cenário financeiro e cidadania",
    ordem: 23,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["consumidor", "direitos", "procon"],
    thumbnail: "/trilha/cidadania.png",
    estadoInicial: "travado",
    destravadoPor: "ef67-o-mundo-no-seu-bolso",
    habilidades: ["EF67LF48", "EF67LF49", "EF67LF50"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Cada lado tem dever",
        conteudo: {
          "texto": "Em uma compra, cada lado tem dever. A empresa deve informar preço e condições com clareza e entregar o que prometeu. O banco deve explicar tarifas antes de cobrar. O governo deve fiscalizar e manter canais de reclamação. E o consumidor também tem deveres: ler o contrato, guardar a nota e pagar o combinado.",
          "destaque": "Direito do consumidor não é favor da loja: é lei, e vale sem discussão."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O fone com defeito",
        conteudo: {
          "personagem": "Luzia",
          "texto": "Luzia comprou um fone pela internet por R$ 220. Chegou com defeito no terceiro dia. A loja disse que não trocava porque a caixa já estava aberta. Ela guardou a nota fiscal e a imagem do anúncio. Pelo Código de Defesa do Consumidor, produto com defeito é responsabilidade da loja. Abrir a caixa não anula esse direito.",
          "pergunta": "Se a loja continuar recusando, para onde Luzia leva essa reclamação?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Onde reclamar",
        conteudo: {
          "enunciado": "A loja recusou resolver o defeito. Qual é o caminho correto para Luzia reclamar fora da loja?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Procurar o Procon da cidade ou registrar no consumidor.gov.br, guardando nota e protocolo.",
              "correta": true,
              "feedback": "Isso. O Procon fiscaliza e media conflitos de consumo, e o consumidor.gov.br registra a reclamação com a empresa."
            },
            {
              "id": "b",
              "texto": "Postar nas redes sociais, porque é o único jeito de a empresa responder.",
              "correta": false,
              "feedback": "Reclamar em público às vezes acelera, mas não gera registro oficial nem substitui o canal formal."
            },
            {
              "id": "c",
              "texto": "Ligar para o Banco Central, que resolve qualquer problema de compra.",
              "correta": false,
              "feedback": "O Banco Central cuida de bancos e instituições financeiras, não de defeito em produto de loja."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Problemas de consumo",
        conteudo: {
          "pergunta": "Nos últimos meses, quantas vezes você ou alguém da sua casa teve problema com uma compra?",
          "campo": "numero",
          "placeholder": "2",
          "ajuda": "Conte de memória: entrega errada, defeito, cobrança a mais ou promessa não cumprida."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Cada problema tem um canal",
        conteudo: {
          "texto": "Você contou {valor} problema ou problemas de consumo. Cada um deles tinha um direito por trás e um canal onde reclamar, caso a loja não resolvesse.",
          "regras": [
            {
              "se": "valor == 0",
              "entao": "Nenhum problema até agora. Saber o caminho antes de precisar é o que faz diferença quando acontecer."
            },
            {
              "se": "valor >= 1 e valor <= 3",
              "entao": "Acontece com quase todo mundo. Guardar nota, imagem do anúncio e número de protocolo sustenta a reclamação."
            },
            {
              "se": "valor > 3",
              "entao": "Repetição assim merece registro formal. Reclamação no Procon ou no consumidor.gov.br entra nas estatísticas de fiscalização."
            }
          ],
          "proximoPasso": "Salve no celular o site consumidor.gov.br e o telefone do Procon da sua cidade."
        },
      },
    ],
  },
  {
    slug: "ef89-dinheiro-como-poder",
    titulo: "Dinheiro como poder",
    subtitulo: "O que o dinheiro significa além de comprar — e o que forma o preço.",
    segmento: "ef89",
    blocoId: "ef89-bloco-a",
    blocoRotulo: "Bloco A · Circulação social do dinheiro",
    ordem: 1,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["dinheiro", "poder", "status"],
    thumbnail: "/trilha/circulacao.png",
    estadoInicial: "disponivel",
    habilidades: ["EF89LF01", "EF89LF02"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Dinheiro não compra só coisas",
        conteudo: {
          "texto": "Dinheiro compra coisas, mas não só. Ele também organiza quem manda e quem obedece, quem é ouvido numa reunião e quem fica de fora. Marcas vendem pertencimento; cargos vendem autoridade. Quem tem dinheiro decide o que vai ser produzido e a que preço. Reconhecer essa camada social não é condenar o dinheiro. É enxergar o que está em jogo além do número da etiqueta.",
          "destaque": "Dinheiro também compra status, influência e o direito de ser levado a sério."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Os R$ 350 do logo",
        conteudo: {
          "personagem": "Maicon",
          "texto": "Maicon tem 14 anos e vende doce na saída da escola. Juntou R$ 180 e quer um tênis de marca famosa que custa R$ 499. Um modelo parecido, de outra marca, sai por R$ 149: mesma sola, mesmo tecido, mesma garantia. A diferença de R$ 350 não está no material. Está no logo, na campanha com jogador e no fato de que, no intervalo, quem usa aquele modelo é tratado de outro jeito.",
          "pergunta": "Os R$ 350 a mais estão pagando o quê, e quem decidiu que valia isso?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "O que forma o preço",
        conteudo: {
          "enunciado": "Além do custo de fabricar, quais fatores costumam empurrar para cima o preço de um tênis como esse?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Apenas o material e a mão de obra usados na fábrica.",
              "correta": false,
              "feedback": "Custo de produção é uma parte. Impostos, publicidade, concorrência e o tamanho da procura também entram no preço final."
            },
            {
              "id": "b",
              "texto": "Publicidade, impostos, pouca concorrência e procura alta pelo modelo.",
              "correta": true,
              "feedback": "Isso. O preço junta custo, tributo, esforço de marketing e a disputa entre quem vende e quem quer comprar."
            },
            {
              "id": "c",
              "texto": "Uma tabela do governo que define o valor de cada tipo de produto.",
              "correta": false,
              "feedback": "No Brasil o preço da maioria dos produtos é livre. O governo cobra impostos e fiscaliza abusos, mas não define quanto custa um tênis."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "O preço da marca",
        conteudo: {
          "pergunta": "Pense em algo que você comprou ou quis comprar pela marca. Quanto a mais custava, comparado a um parecido sem marca?",
          "campo": "moeda",
          "placeholder": "R$ 120",
          "ajuda": "Estimativa serve; a ideia é medir o tamanho do que a marca cobra a mais."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O que a marca entrega",
        conteudo: {
          "texto": "Você estimou {valor} de diferença. Esse é o preço do que a marca entrega além do produto: reconhecimento, pertencimento, a chance de não ser zoado. Às vezes vale, às vezes é o único jeito de ser respeitado num lugar específico. O que muda tudo é decidir isso sabendo o número, em vez de descobrir depois no extrato.",
          "regras": [
            {
              "se": "valor == 0",
              "entao": "Você não paga por marca ou ainda não percebeu isso acontecer. Vale olhar de novo: a diferença costuma estar escondida em detalhes pequenos."
            },
            {
              "se": "valor > 0 e valor <= 100",
              "entao": "Diferença pequena. Nessa faixa a marca ainda disputa com durabilidade e acabamento reais, não só com imagem."
            },
            {
              "se": "valor > 100",
              "entao": "Diferença grande. Compensa separar quanto disso é material melhor e quanto é o status que vem junto."
            }
          ],
          "proximoPasso": "Compare hoje dois produtos iguais, um de marca famosa e outro sem, e anote a diferença."
        },
      },
    ],
  },
  {
    slug: "ef89-moeda-de-outro-pais",
    titulo: "Moeda de outro país",
    subtitulo: "Real, dólar e a conta do câmbio.",
    segmento: "ef89",
    blocoId: "ef89-bloco-a",
    blocoRotulo: "Bloco A · Circulação social do dinheiro",
    ordem: 2,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["cambio", "dolar", "real"],
    thumbnail: "/trilha/circulacao.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-dinheiro-como-poder",
    habilidades: ["EF89LF03", "EF89LF04"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Cada país, uma moeda",
        conteudo: {
          "texto": "Cada país tem sua moeda: real no Brasil, dólar nos Estados Unidos, peso na Argentina, iene no Japão. Câmbio é o preço de uma moeda medida em outra, e esse preço muda todo dia útil. Quando o dólar sobe, tudo que vem de fora, de jogo digital a remédio e trigo, fica mais caro aqui, mesmo que o preço lá fora não tenha mudado.",
          "destaque": "Câmbio é o preço de uma moeda em outra, e ele muda todo dia."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O jogo em dólar",
        conteudo: {
          "personagem": "Manuela",
          "texto": "Manuela quer um jogo digital vendido só em loja estrangeira, por US$ 30. Ela tem R$ 170 guardados de um trabalho de fim de semana. No site o preço aparece em dólar, mas na fatura do cartão vai chegar em real, convertido pela cotação do dia da compra e com imposto e tarifa por cima. Semana passada o dólar estava a R$ 4,90; hoje está a R$ 5,20. O jogo não mudou de preço lá fora.",
          "pergunta": "Se o preço em dólar é o mesmo, por que a conta em real ficou maior?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Fazendo a conversão",
        conteudo: {
          "enunciado": "Com o dólar a R$ 5,20, quanto o jogo de US$ 30 custa em reais, antes de imposto e tarifa?",
          "alternativas": [
            {
              "id": "a",
              "texto": "R$ 35,20",
              "correta": false,
              "feedback": "Aqui a cotação foi somada ao preço. Câmbio é multiplicação: cada dólar custa R$ 5,20, e são 30 dólares."
            },
            {
              "id": "b",
              "texto": "R$ 156,00",
              "correta": true,
              "feedback": "Isso: 30 x 5,20 = R$ 156,00. Com imposto e tarifa do cartão, o valor que chega na fatura fica um pouco acima disso."
            },
            {
              "id": "c",
              "texto": "R$ 5,77",
              "correta": false,
              "feedback": "Essa é a divisão de 30 por 5,20. A divisão serve para o caminho inverso, quando você quer saber quantos dólares compra com certo valor em real."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Quanto vale um dólar",
        conteudo: {
          "pergunta": "Sem consultar nada agora: quanto você acha que custa um dólar em reais hoje?",
          "campo": "moeda",
          "placeholder": "R$ 5,20",
          "ajuda": "Estimativa serve; depois confira no buscador ou no site do Banco Central."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Multiplique antes de clicar",
        conteudo: {
          "texto": "Você estimou {valor} por dólar. Com essa cotação, uma compra de US$ 30 sai por trinta vezes esse número, antes de imposto e tarifa. Manter o hábito de multiplicar antes de comprar evita surpresa, porque a cotação usada na fatura é a do dia da compra, não a que você viu ontem.",
          "regras": [
            {
              "se": "valor < 4,50",
              "entao": "Sua estimativa está abaixo do que o dólar tem valido nos últimos anos. Confira a cotação de hoje antes de fazer qualquer conta."
            },
            {
              "se": "valor >= 4,50 e valor <= 6,50",
              "entao": "Está na faixa em que o dólar vem circulando. Ainda assim confira o número do dia: alguns centavos mudam bastante em compras grandes."
            },
            {
              "se": "valor > 6,50",
              "entao": "Sua estimativa está acima do usual. Superestimar também atrapalha: faz parecer impossível o que caberia no seu bolso."
            }
          ],
          "proximoPasso": "Converta para reais o preço de algo em dólar que você viu esta semana."
        },
      },
    ],
  },
  {
    slug: "ef89-custo-de-oportunidade",
    titulo: "Custo de oportunidade",
    subtitulo: "Todo sim é um não para outra coisa, hoje ou depois.",
    segmento: "ef89",
    blocoId: "ef89-bloco-b",
    blocoRotulo: "Bloco B · Planejamento",
    ordem: 3,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["escolha", "poupanca", "credito"],
    thumbnail: "/trilha/orcamento.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-moeda-de-outro-pais",
    habilidades: ["EF89LF05", "EF89LF08"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O que você deixa de ter",
        conteudo: {
          "texto": "Custo de oportunidade é o que você deixa de ter ao escolher uma coisa em vez de outra. Não aparece em nota fiscal, mas é real: gastar R$ 300 num fone é ficar sem o curso, sem a peça da bicicleta ou sem esse dinheiro rendendo. Escolha intertemporal é a mesma ideia esticada no tempo: consumir agora, guardar para depois ou pegar crédito e pagar mais caro na frente.",
          "destaque": "Todo sim carrega um não. O custo de oportunidade é esse não."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Três caminhos, R$ 600",
        conteudo: {
          "personagem": "Marcelo",
          "texto": "Marcelo recebeu R$ 600 por um bico nas férias e tem três caminhos na cabeça. Comprar à vista um celular usado de R$ 600. Parcelar esse mesmo celular em 10 vezes de R$ 78 e manter os R$ 600 guardados. Ou adiar o celular e pagar o curso de instalação de ar-condicionado, que custa R$ 540 e começa em março. O celular que ele usa hoje funciona, só é lento.",
          "pergunta": "Em qual desses caminhos ele paga mais caro, e em que moeda?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "O preço de parcelar",
        conteudo: {
          "enunciado": "Se Marcelo parcela o celular em 10 vezes de R$ 78 em vez de pagar R$ 600 à vista, o que ele assume?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Nada: é o mesmo valor, apenas dividido em pedaços menores.",
              "correta": false,
              "feedback": "Dez parcelas de R$ 78 somam R$ 780. São R$ 180 a mais que o preço à vista, cobrados pelo prazo."
            },
            {
              "id": "b",
              "texto": "R$ 180 a mais no total e dez meses da renda futura já comprometidos.",
              "correta": true,
              "feedback": "Isso. Além do custo extra, cada parcela ocupa um pedaço do dinheiro dos próximos dez meses, que deixa de estar livre para outra escolha."
            },
            {
              "id": "c",
              "texto": "Um desconto, porque quem parcela mostra que é bom pagador.",
              "correta": false,
              "feedback": "Parcelar não gera desconto. Quando há diferença, costuma ser o contrário: à vista sai mais barato."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Se sobrassem R$ 500",
        conteudo: {
          "pergunta": "Se sobrassem R$ 500 na sua mão hoje, para onde eles iriam primeiro?",
          "campo": "faixa",
          "placeholder": "Escolha a opção mais próxima do que você faria",
          "faixas": [
            "Gastar em algo que quero agora",
            "Guardar para uma meta com data",
            "Pagar uma dívida ou conta atrasada",
            "Ainda não sei"
          ],
          "ajuda": "Responda o que você faria de verdade, não o que soa mais certo."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O que ficou de fora",
        conteudo: {
          "texto": "Você escolheu {valor}. Nenhuma dessas opções é errada por si: o que muda é o que cada uma custa em outro lugar. Quem gasta agora abre mão do depois. Quem guarda abre mão do agora. Quem quita dívida compra tranquilidade e perde dinheiro disponível. O erro é escolher sem enxergar o que ficou de fora.",
          "regras": [
            {
              "se": "resposta == Gastar em algo que quero agora",
              "entao": "Escolha legítima, desde que consciente. O custo é a meta que fica mais distante e o imprevisto que te pega sem reserva."
            },
            {
              "se": "resposta == Guardar para uma meta com data",
              "entao": "Você troca consumo de hoje por consumo de depois. O custo é o que dava para aproveitar agora, e isso também conta na conta."
            },
            {
              "se": "resposta == Pagar uma dívida ou conta atrasada ou Ainda não sei",
              "entao": "Quitar atraso costuma valer mais que qualquer rendimento, porque juros de dívida são altos. Se ainda não sabe, comece listando o que está em aberto."
            }
          ],
          "proximoPasso": "Antes da próxima compra acima de R$ 100, escreva o que ela vai custar em outra coisa."
        },
      },
    ],
  },
  {
    slug: "ef89-preco-e-calendario",
    titulo: "Preço que muda com o calendário",
    subtitulo: "Safra, data comemorativa, promoção — e o dinheiro que cai do céu.",
    segmento: "ef89",
    blocoId: "ef89-bloco-b",
    blocoRotulo: "Bloco B · Planejamento",
    ordem: 4,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["sazonalidade", "preco", "safra"],
    thumbnail: "/trilha/orcamento.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-custo-de-oportunidade",
    habilidades: ["EF89LF06", "EF89LF09"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O preço tem calendário",
        conteudo: {
          "texto": "Preço não é fixo ao longo do ano. Fruta na safra custa menos porque há muita no mercado; na entressafra, sobe. Perto de datas comemorativas a procura aumenta e o vendedor aproveita. Promoção às vezes é desconto real, às vezes é preço inflado antes para parecer queda. Quem conhece esse calendário compra melhor e evita que o mesmo item estoure o orçamento do mês.",
          "destaque": "O calendário mexe no preço antes de qualquer negociação sua."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Junho apertado",
        conteudo: {
          "personagem": "Márcia",
          "texto": "Márcia organiza a lista de compras de casa. Em março o quilo do tomate saiu por R$ 5,90; em junho, com entressafra e chuva atrasada, o mesmo quilo foi para R$ 12,50. A conta de luz de junho veio R$ 90 acima da média, por causa do chuveiro elétrico no frio. No meio desse mês entrou uma restituição de imposto de renda de R$ 400, dinheiro que ela não esperava e não tinha planejado.",
          "pergunta": "O que muda na decisão dela pelo fato de esses R$ 400 não estarem no plano?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Dinheiro que não estava no plano",
        conteudo: {
          "enunciado": "Márcia recebeu R$ 400 inesperados no mesmo mês em que comida e luz subiram. Qual leitura é a mais consciente?",
          "alternativas": [
            {
              "id": "a",
              "texto": "É extra, então não conta no orçamento e pode ser gasto à vontade.",
              "correta": false,
              "feedback": "Dinheiro inesperado é dinheiro igual aos outros. Tratar como se não contasse é o que faz a restituição sumir sem deixar rastro."
            },
            {
              "id": "b",
              "texto": "Encaixar os R$ 400 no orçamento do mês e decidir o destino antes de gastar.",
              "correta": true,
              "feedback": "Isso. Colocar a entrada na mesma conta das despesas mostra se ela cobre o aumento sazonal, se sobra algo ou se some no caminho."
            },
            {
              "id": "c",
              "texto": "Guardar 100% de qualquer valor inesperado é sempre a decisão certa.",
              "correta": false,
              "feedback": "Guardar tudo pode não ser possível quando as contas do mês subiram. A decisão consciente olha primeiro o que o orçamento está pedindo."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "O tamanho da variação",
        conteudo: {
          "pergunta": "Em quanto por cento você acha que a comida da sua casa fica mais cara nos meses ruins?",
          "campo": "percentual",
          "placeholder": "20%",
          "ajuda": "Estimativa serve; compare de cabeça o mês mais apertado com o mais tranquilo."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Prever o mês caro",
        conteudo: {
          "texto": "Você estimou {valor} de variação. Essa oscilação existe em quase toda casa e não depende de disciplina: depende de safra, clima, feriado e reajuste. Quem conhece o tamanho dela consegue prever o mês apertado e reservar antes, em vez de descobrir no caixa. E quando entra dinheiro fora do previsto, já existe um lugar para ele ir.",
          "regras": [
            {
              "se": "valor <= 10",
              "entao": "Variação baixa. Confira olhando dois recibos de meses diferentes: a diferença costuma ser maior do que a memória guarda."
            },
            {
              "se": "valor > 10 e valor <= 30",
              "entao": "É a faixa mais comum. Reservar essa diferença nos meses baratos evita cortar comida nos meses caros."
            },
            {
              "se": "valor > 30",
              "entao": "Variação alta. Vale mapear quais itens puxam esse salto e trocar por similares durante a entressafra."
            }
          ],
          "proximoPasso": "Anote o preço de três itens da feira hoje e confira os mesmos daqui a dois meses."
        },
      },
    ],
  },
  {
    slug: "ef89-orcamento-que-fecha",
    titulo: "Orçamento que fecha",
    subtitulo: "Superavitário, neutro ou deficitário — e como virar o jogo.",
    segmento: "ef89",
    blocoId: "ef89-bloco-b",
    blocoRotulo: "Bloco B · Planejamento",
    ordem: 5,
    nivel: "avancado",
    duracaoMin: 4,
    pontos: 50,
    tags: ["orcamento", "saldo", "despesas"],
    thumbnail: "/trilha/orcamento.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-preco-e-calendario",
    habilidades: ["EF89LF10", "EF89LF11"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Entra, sai, sobra",
        conteudo: {
          "texto": "Orçamento é a lista do que entra e do que sai num período. As saídas se dividem em fixas, que repetem com valor parecido, como aluguel e internet, e variáveis, que mudam, como transporte e comida. Algumas são previstas; outras chegam sem aviso, como um remédio. Receita menos despesa dá o saldo: positivo é superavitário, zero é neutro, negativo é deficitário.",
          "destaque": "Saldo é receita menos despesa: sobra, empata ou falta."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A geladeira quebrou",
        conteudo: {
          "personagem": "Mariana",
          "texto": "Mariana mora com a mãe e a irmã, e entram R$ 2.400 por mês. As fixas são aluguel de R$ 900, luz de R$ 130, água de R$ 70, internet de R$ 100 e gás de R$ 120. As variáveis somam mercado de R$ 850 e transporte de R$ 260. Neste mês apareceu um imprevisto: R$ 180 do conserto da geladeira. Ela somou tudo e o número não fechou.",
          "pergunta": "De quanto é o buraco, e o que dá para mexer sem tirar comida da mesa?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Apurando o saldo",
        conteudo: {
          "enunciado": "Somando todas as despesas de Mariana no mês, incluindo o conserto de R$ 180, qual é o saldo dela?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Positivo em R$ 30: sobra pouco, mas fecha.",
              "correta": false,
              "feedback": "As despesas somam R$ 2.610 contra R$ 2.400 que entram. O saldo é negativo, não positivo."
            },
            {
              "id": "b",
              "texto": "Negativo em R$ 210: o orçamento está deficitário.",
              "correta": true,
              "feedback": "Isso: R$ 1.320 de fixas mais R$ 1.110 de variáveis mais R$ 180 de imprevisto dão R$ 2.610, contra R$ 2.400 de receita."
            },
            {
              "id": "c",
              "texto": "Neutro: entra e sai exatamente o mesmo valor.",
              "correta": false,
              "feedback": "Seria neutro se as despesas fossem R$ 2.400. Elas chegam a R$ 2.610, então falta dinheiro no fim do mês."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Seu saldo do mês",
        conteudo: {
          "pergunta": "Some o que entra e o que sai na sua vida em um mês comum e informe quanto sobra, ou quanto falta.",
          "campo": "moeda",
          "placeholder": "R$ 120",
          "ajuda": "Estimativa com números redondos serve; se o mês fecha no vermelho, informe o valor que falta."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Virando o jogo",
        conteudo: {
          "texto": "Seu saldo estimado é {valor}. Esse número resume o orçamento inteiro e muda de mês para mês. Deficitário não quer dizer descuido: renda baixa, atraso no pagamento, doença e imprevisto derrubam qualquer conta bem feita. O que resolve é agir nas duas pontas, reduzindo ou renegociando alguma saída e procurando alguma entrada a mais.",
          "regras": [
            {
              "se": "valor > 0",
              "entao": "Orçamento superavitário. Dê nome à sobra antes que ela evapore: reserva para imprevisto, meta com data ou quitação de dívida."
            },
            {
              "se": "valor == 0",
              "entao": "Orçamento neutro. Fecha, mas sem folga: um imprevisto de R$ 200 já joga o mês no vermelho. Vale abrir alguma margem."
            },
            {
              "se": "valor < 0",
              "entao": "Orçamento deficitário. Liste as saídas da maior para a menor, marque as que dá para reduzir ou renegociar e veja qual entrada extra é possível."
            }
          ],
          "proximoPasso": "Anote por sete dias tudo que sair da sua mão, incluindo os valores pequenos."
        },
      },
    ],
  },
  {
    slug: "ef89-seu-dinheiro-sua-responsa",
    titulo: "Seu dinheiro, sua responsabilidade",
    subtitulo: "Gerenciar o próprio dinheiro e recusar o que não cabe.",
    segmento: "ef89",
    blocoId: "ef89-bloco-b",
    blocoRotulo: "Bloco B · Planejamento",
    ordem: 6,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["planejamento", "autonomia", "oferta"],
    thumbnail: "/trilha/orcamento.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-orcamento-que-fecha",
    habilidades: ["EF89LF07", "EF89LF12"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Decidir antes que decidam",
        conteudo: {
          "texto": "Assumir o próprio dinheiro é decidir para onde ele vai antes que ele vá sozinho. Planejar não deixa ninguém rico da noite para o dia, mas muda três coisas: você sabe quanto tem, sabe quanto pode assumir e consegue recusar sem sentir culpa. Sem plano, cada oferta parece uma oportunidade. Com plano, ela vira uma pergunta simples: isso cabe no que eu já decidi?",
          "destaque": "Com um plano no papel, recusar deixa de ser sacrifício e vira cálculo."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O relógio em 12 vezes",
        conteudo: {
          "personagem": "Maurício",
          "texto": "Maurício tem 14 anos e cuida do próprio dinheiro desde que começou a ajudar no salão da tia aos sábados. Entram cerca de R$ 320 por mês. Ele separa R$ 100 para a meta de comprar uma máquina de corte, R$ 120 para transporte e lanche, e deixa R$ 100 livres. Um vendedor ofereceu um relógio conectado em 12 vezes de R$ 49, com o primeiro mês grátis. A parcela cabe no valor livre, mas ocupa ele inteiro por um ano.",
          "pergunta": "A parcela cabe. Isso basta para aceitar?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Aceitar ou recusar",
        conteudo: {
          "enunciado": "O relógio sai em 12 vezes de R$ 49 e a parcela cabe no dinheiro livre de Maurício. Qual análise sustenta melhor a decisão?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Cabe na parcela, então é seguro aceitar: é assim que se avalia uma oferta.",
              "correta": false,
              "feedback": "Caber na parcela é o mínimo, não o critério. A oferta compromete R$ 588 e todo o valor livre dele por doze meses."
            },
            {
              "id": "b",
              "texto": "Comparar o total de R$ 588 e os doze meses travados com o que ele perde: a máquina de corte.",
              "correta": true,
              "feedback": "Isso. A pergunta certa é o que a compra desloca do plano, não se o boleto cabe no mês."
            },
            {
              "id": "c",
              "texto": "Como o primeiro mês é grátis, o risco é zero e ele decide depois.",
              "correta": false,
              "feedback": "O mês grátis é isca. Depois dele as parcelas seguem, e cancelar costuma ter multa ou prazo mínimo de permanência."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "O que você olha primeiro",
        conteudo: {
          "pergunta": "Quando te oferecem algo parcelado, o que você olha primeiro?",
          "campo": "faixa",
          "placeholder": "Escolha o que mais se parece com você",
          "faixas": [
            "O valor da parcela",
            "O preço total",
            "Se aquilo está no meu plano",
            "Se eu quero muito",
            "Nunca parei para pensar"
          ],
          "ajuda": "Vale a resposta honesta, não a que parece mais responsável."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Três perguntas, sempre",
        conteudo: {
          "texto": "Você respondeu que olha primeiro {valor}. Nenhuma dessas respostas dispensa as outras: a parcela mostra se cabe no mês, o total mostra o preço real, o plano mostra o que a compra desloca. Quem assume o próprio dinheiro faz as três perguntas na mesma ordem e recusa sem precisar de justificativa elaborada.",
          "regras": [
            {
              "se": "resposta == O valor da parcela ou Se eu quero muito",
              "entao": "São exatamente os dois pontos que o vendedor mais usa. Acrescente o total e o prazo antes de responder qualquer oferta."
            },
            {
              "se": "resposta == O preço total ou Se aquilo está no meu plano",
              "entao": "Você já parte do critério certo. Falta manter isso quando a oferta chega com pressa e prazo curto."
            },
            {
              "se": "resposta == Nunca parei para pensar",
              "entao": "Comece pelo mais simples: multiplique a parcela pelo número de meses e olhe o total antes de decidir qualquer coisa."
            }
          ],
          "proximoPasso": "Escreva sua meta atual num papel e cole onde você a veja todo dia."
        },
      },
    ],
  },
  {
    slug: "ef89-custo-depois-da-compra",
    titulo: "O custo depois da compra",
    subtitulo: "Manutenção, multa e imposto — e o efeito de produzir.",
    segmento: "ef89",
    blocoId: "ef89-bloco-c",
    blocoRotulo: "Bloco C · Consumo",
    ordem: 7,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["manutencao", "impostos", "multa"],
    thumbnail: "/trilha/consumo.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-seu-dinheiro-sua-responsa",
    habilidades: ["EF89LF13", "EF89LF16"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "A etiqueta é só a entrada",
        conteudo: {
          "texto": "O preço da etiqueta é só a entrada. Depois vêm manutenção, peça de reposição, imposto anual e multa quando alguma regra é descumprida. Um objeto barato de comprar pode ser caro de manter. E existe outra conta, que não chega no seu boleto: o que a produção daquilo custou em água, salário e resíduo, para alguém, em algum lugar.",
          "destaque": "Comprar é o primeiro pagamento; manter costuma ser o mais longo."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O primeiro ano da moto",
        conteudo: {
          "personagem": "Michele",
          "texto": "Michele comprou uma moto usada por R$ 8.000 para trabalhar com entregas. No primeiro ano vieram IPVA de R$ 220, licenciamento de R$ 160, duas trocas de óleo de R$ 90 cada, um pneu novo de R$ 280 e uma multa de R$ 130 por estacionar em local proibido. Nada disso apareceu na conversa da compra. A moto segue valendo quase o que ela pagou; o ano, não.",
          "pergunta": "Quanto a moto custou além dos R$ 8.000, e o que dava para prever?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "A soma do ano",
        conteudo: {
          "enunciado": "Some os custos do primeiro ano de Michele além do preço da moto. Qual é o total?",
          "alternativas": [
            {
              "id": "a",
              "texto": "R$ 610",
              "correta": false,
              "feedback": "Ficou algo de fora. São seis valores: R$ 220, R$ 160, R$ 90, R$ 90, R$ 280 e R$ 130."
            },
            {
              "id": "b",
              "texto": "R$ 970",
              "correta": true,
              "feedback": "Isso: 220 + 160 + 90 + 90 + 280 + 130 dá R$ 970, mais de 12% do que ela pagou pela moto."
            },
            {
              "id": "c",
              "texto": "R$ 1.240",
              "correta": false,
              "feedback": "Passou do total. A soma dos seis itens dá R$ 970; só a troca de óleo aparece duas vezes."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "O custo de manter",
        conteudo: {
          "pergunta": "Pense no aparelho que você mais usa. Quanto ele custa por ano depois de comprado, somando energia, internet, capinha, conserto e reposição?",
          "campo": "moeda",
          "placeholder": "R$ 400",
          "ajuda": "Estimativa serve; some o que você lembra de ter gasto com ele no último ano."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "As duas contas",
        conteudo: {
          "texto": "Você estimou {valor} por ano depois da compra. Esse é o custo de posse, e é ele que decide se um objeto barato foi mesmo barato. Existe ainda a conta que ninguém te cobra: minério, água e trabalho que entraram na fabricação, e o lixo eletrônico que sobra no fim. Escolher durabilidade e conserto também é um posicionamento sobre isso.",
          "regras": [
            {
              "se": "valor < 100",
              "entao": "Custo de posse baixo, ou parte dele passou despercebida. Energia, pacote de dados e acessórios costumam entrar sem aparecer."
            },
            {
              "se": "valor >= 100 e valor <= 500",
              "entao": "Faixa comum. Multiplicado por três ou quatro anos de uso, esse valor pode passar o preço pago pelo aparelho."
            },
            {
              "se": "valor > 500",
              "entao": "Custo alto de manter. Vale comparar com um modelo mais durável e com a opção de consertar em vez de trocar."
            }
          ],
          "proximoPasso": "Antes da próxima compra, pesquise o preço de um conserto e de uma peça de reposição."
        },
      },
    ],
  },
  {
    slug: "ef89-publicidade-por-dentro",
    titulo: "Publicidade por dentro",
    subtitulo: "O anúncio que você não percebe que é anúncio.",
    segmento: "ef89",
    blocoId: "ef89-bloco-c",
    blocoRotulo: "Bloco C · Consumo",
    ordem: 8,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["publicidade", "consumo", "midias"],
    thumbnail: "/trilha/consumo.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-custo-depois-da-compra",
    habilidades: ["EF89LF14", "EF89LF15"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Explícita e implícita",
        conteudo: {
          "texto": "Publicidade explícita se anuncia: o comercial, o banner, o \"publi\" no canto do vídeo. A implícita não avisa. É o refrigerante que aparece na cena da novela, o tênis que o streamer usa sem comentar, a marca no fundo do vídeo. As duas querem a mesma coisa: que você associe aquele produto a um sentimento bom antes de pensar no preço.",
          "destaque": "Todo anúncio quer chegar em você pela emoção antes de chegar pelo preço."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O caderno da criadora",
        conteudo: {
          "personagem": "Milena",
          "texto": "Milena assiste a um vídeo de rotina de estudos. A criadora não diz que é publicidade, mas o caderno aparece em quatro cenas e o link está na descrição. No site, o preço está escrito assim: R$ 89,90 riscado, R$ 59,90 em vermelho, \"só hoje\", com um relógio regressivo. Milena não precisava de caderno quando abriu o vídeo.",
          "pergunta": "Quantos empurrões diferentes agiram sobre Milena antes de ela pensar se precisava do caderno?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Onde está a armadilha",
        conteudo: {
          "enunciado": "No site que Milena abriu, qual recurso age sobre a emoção dela, e não sobre a utilidade do caderno?",
          "alternativas": [
            {
              "id": "a",
              "texto": "A descrição técnica do caderno: número de folhas e gramatura do papel.",
              "correta": false,
              "feedback": "Isso é informação sobre o produto. Ajuda a decidir se ele serve para você, mas não mexe com o que você sente."
            },
            {
              "id": "b",
              "texto": "O relógio regressivo com o \"só hoje\" ao lado do preço riscado.",
              "correta": true,
              "feedback": "O relógio fabrica urgência e o preço riscado cria uma referência alta para o desconto parecer maior. Os dois atacam a emoção, não a necessidade."
            },
            {
              "id": "c",
              "texto": "O link estar na descrição do vídeo.",
              "correta": false,
              "feedback": "O link só facilita a compra. Quem pressiona a decisão são a contagem de tempo e o preço riscado."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua conta de anúncios",
        conteudo: {
          "pergunta": "Nas últimas 24 horas, de quantas aparições de marca dentro de vídeos, séries, jogos ou stories você consegue lembrar?",
          "campo": "numero",
          "placeholder": "6",
          "ajuda": "Estimativa serve: conte só as que você consegue lembrar agora."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O que passou sem ser visto",
        conteudo: {
          "texto": "Você lembrou de {valor} aparições de marca que não se anunciavam como anúncio. O número que você não lembra é sempre maior — a publicidade implícita funciona exatamente por passar sem ser notada.",
          "regras": [
            {
              "se": "valor <= 2",
              "entao": "Poucas lembranças costumam indicar pouca atenção ao formato, não pouca exposição. Reveja um vídeo curto contando as marcas visíveis."
            },
            {
              "se": "valor entre 3 e 9",
              "entao": "Você já reconhece o formato. O próximo passo é nomear o recurso usado: urgência, preço riscado, pessoa que você admira."
            },
            {
              "se": "valor >= 10",
              "entao": "Você está lendo as mídias com atenção. Use isso para separar o que você quer porque precisa do que você quer porque te mostraram bem."
            }
          ],
          "proximoPasso": "Antes da próxima compra por impulso, feche o site e volte nele um dia depois."
        },
      },
    ],
  },
  {
    slug: "ef89-poupar-e-investir-no-plano",
    titulo: "Poupar e investir no plano",
    subtitulo: "Duas coisas diferentes, ambas no mesmo planejamento.",
    segmento: "ef89",
    blocoId: "ef89-bloco-d",
    blocoRotulo: "Bloco D · Poupança e investimento",
    ordem: 9,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["poupar", "investir", "planejamento"],
    thumbnail: "/trilha/poupar.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-publicidade-por-dentro",
    habilidades: ["EF89LF17", "EF89LF18"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Guardar e fazer render",
        conteudo: {
          "texto": "Poupar é separar parte do dinheiro e não gastar. Investir é colocar esse dinheiro em algum lugar onde ele renda — ou seja, onde produza juros, um valor extra pago por deixar o dinheiro ali. Poupar é a decisão de guardar; investir é a decisão de onde guardar. Sem a primeira não existe a segunda, e as duas cabem no mesmo planejamento.",
          "destaque": "Poupar é decidir guardar. Investir é decidir onde o dinheiro guardado fica."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Os dois anos de Natália",
        conteudo: {
          "personagem": "Natália",
          "texto": "Natália quer trocar o celular em dois anos, algo perto de R$ 1.600. Ela consegue separar R$ 60 por mês do que ganha ajudando na barraca da tia. Em 24 meses isso dá R$ 1.440 parados. Se esse mesmo dinheiro ficar em uma aplicação que rende cerca de 0,8% ao mês, chega perto do valor do aparelho sem ela aumentar o depósito.",
          "pergunta": "Separar os R$ 60 todo mês já é metade da decisão. Qual é a outra metade?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "O que falta no plano",
        conteudo: {
          "enunciado": "Natália separa R$ 60 por mês e deixa o dinheiro numa caixa em casa. O que falta para o plano dela virar investimento?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Nada: guardar todo mês já é investir.",
              "correta": false,
              "feedback": "Guardar é poupar. Vira investimento só quando o dinheiro é colocado onde rende, isto é, onde recebe juros."
            },
            {
              "id": "b",
              "texto": "Aumentar o valor mensal de R$ 60 para R$ 100.",
              "correta": false,
              "feedback": "Depositar mais acelera o plano, mas dinheiro parado continua parado. O tamanho do depósito não é o que separa poupar de investir."
            },
            {
              "id": "c",
              "texto": "Colocar o dinheiro guardado em uma aplicação que renda ao longo dos 24 meses.",
              "correta": true,
              "feedback": "Exato. Poupar é a decisão de separar; investir é a decisão de onde o dinheiro separado fica rendendo."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Seu valor por mês",
        conteudo: {
          "pergunta": "Pense num objetivo seu para daqui a dois anos. Quanto você conseguiria separar por mês sem apertar o mês?",
          "campo": "moeda",
          "placeholder": "R$ 40",
          "ajuda": "Estimativa serve: um valor pequeno e constante diz mais que um valor alto que não se repete."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Do parado ao rendendo",
        conteudo: {
          "texto": "Separando {valor} por mês, em 24 meses você teria 24 vezes esse valor parado. O mesmo dinheiro rendendo chega mais alto sem exigir depósito maior — essa é a diferença entre poupar e investir dentro do mesmo plano.",
          "regras": [
            {
              "se": "valor == 0",
              "entao": "Mês sem sobra é comum e não é falha sua. O plano começa pelo mapa do que entra e do que sai, não pelo depósito."
            },
            {
              "se": "valor > 0 e valor < 50",
              "entao": "Valor pequeno e constante já constrói o hábito e o montante. A repetição pesa mais que o tamanho do depósito."
            },
            {
              "se": "valor >= 50",
              "entao": "Com esse ritmo, um objetivo de dois anos é realista. Confira se o valor cabe também nos meses de gasto extra."
            }
          ],
          "proximoPasso": "Escreva num papel só o seu objetivo, o prazo e o valor mensal."
        },
      },
    ],
  },
  {
    slug: "ef89-casa-ou-banco",
    titulo: "Casa ou banco",
    subtitulo: "Onde o dinheiro rende e onde ele só espera.",
    segmento: "ef89",
    blocoId: "ef89-bloco-d",
    blocoRotulo: "Bloco D · Poupança e investimento",
    ordem: 10,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["guardar-dinheiro", "instituicao-financeira", "juros"],
    thumbnail: "/trilha/poupar.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-poupar-e-investir-no-plano",
    habilidades: ["EF89LF20", "EF89LF26"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "A lata e a instituição",
        conteudo: {
          "texto": "Dinheiro guardado em casa fica exatamente igual: R$ 500 hoje são R$ 500 daqui a um ano, mas comprando menos, porque os preços sobem. Em uma instituição financeira autorizada pelo Banco Central, o dinheiro aplicado rende juros — um valor pago a você por deixá-lo ali. Em casa há acesso imediato e risco de perda ou roubo; na instituição há rendimento e regras para sacar.",
          "destaque": "Em casa o dinheiro espera. Na instituição autorizada, ele rende juros."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "R$ 900 na lata",
        conteudo: {
          "personagem": "Nicolas",
          "texto": "Nicolas juntou R$ 900 em dois anos numa lata em cima do armário. No mesmo período, os preços do que ele queria comprar subiram cerca de 10%: o que custava R$ 900 passou a custar perto de R$ 990. A lata não perdeu nenhuma nota, mas perdeu poder de compra. Se estivesse aplicado a 0,7% ao mês, o valor teria acompanhado essa alta em vez de ficar para trás.",
          "pergunta": "Se o valor na lata continuou sendo R$ 900, o que Nicolas perdeu nesses dois anos?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "O primeiro critério",
        conteudo: {
          "enunciado": "Nicolas quer manter R$ 200 disponíveis para emergência e aplicar o resto. Que critério ele deve usar para escolher onde aplicar?",
          "alternativas": [
            {
              "id": "a",
              "texto": "A instituição que prometer o maior rendimento, seja ela qual for.",
              "correta": false,
              "feedback": "Promessa alta sem autorização é o padrão dos golpes. Rendimento só vale alguma coisa se a instituição for autorizada e fiscalizada."
            },
            {
              "id": "b",
              "texto": "Se a instituição é autorizada pelo Banco Central e como ele poderá sacar o dinheiro.",
              "correta": true,
              "feedback": "Confiabilidade e regras de saque vêm antes do rendimento. É a instituição autorizada e fiscalizada que torna os juros seguros."
            },
            {
              "id": "c",
              "texto": "O aplicativo com a tela mais bonita e mais fácil de usar.",
              "correta": false,
              "feedback": "Facilidade ajuda no dia a dia, mas não diz nada sobre a segurança do dinheiro nem sobre quem responde se algo der errado."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Dinheiro em casa",
        conteudo: {
          "pergunta": "Quanto de dinheiro em espécie costuma ficar guardado na sua casa?",
          "campo": "faixa",
          "placeholder": "De R$ 50 a R$ 200",
          "faixas": [
            "Nada guardado em casa",
            "Até R$ 50",
            "De R$ 50 a R$ 200",
            "De R$ 200 a R$ 1.000",
            "Mais de R$ 1.000"
          ],
          "ajuda": "Estimativa serve: ninguém precisa contar nota por nota."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Parado custa",
        conteudo: {
          "texto": "Você marcou {valor}. Esse dinheiro rende zero enquanto está parado, e ainda assim uma parte em casa faz sentido: é o que se pega na hora, sem depender de aplicativo, senha ou prazo de saque.",
          "regras": [
            {
              "se": "valor == 'Nada guardado em casa'",
              "entao": "Sem espécie em casa, vale ter um valor pequeno acessível para o dia em que faltar sinal, luz ou maquininha."
            },
            {
              "se": "valor até R$ 200",
              "entao": "É um volume compatível com emergência do dia a dia. Acima disso, o que fica parado começa a custar rendimento."
            },
            {
              "se": "valor acima de R$ 200",
              "entao": "Volume alto em casa soma risco de perda e roubo ao rendimento zero. Vale checar quanto poderia ir para uma instituição autorizada."
            }
          ],
          "proximoPasso": "Confira no site do Banco Central se a instituição que você usa é autorizada."
        },
      },
    ],
  },
  {
    slug: "ef89-risco-rendimento-liquidez",
    titulo: "Risco, rendimento e liquidez",
    subtitulo: "Os três eixos que descrevem qualquer investimento.",
    segmento: "ef89",
    blocoId: "ef89-bloco-d",
    blocoRotulo: "Bloco D · Poupança e investimento",
    ordem: 11,
    nivel: "avancado",
    duracaoMin: 4,
    pontos: 50,
    tags: ["investimento", "risco", "liquidez"],
    thumbnail: "/trilha/poupar.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-casa-ou-banco",
    habilidades: ["EF89LF21", "EF89LF28"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Os três eixos",
        conteudo: {
          "texto": "Todo investimento pode ser descrito por três eixos. Risco é a chance de receber menos do que esperava. Rendimento é o quanto o dinheiro cresce. Liquidez é a rapidez com que ele volta para a sua mão. Os três se puxam: rendimento maior costuma vir com risco maior ou com prazo mais longo. Antes dos três, vem uma pergunta: quem está oferecendo isso é autorizado e fiscalizado?",
          "destaque": "Risco, rendimento e liquidez se puxam: melhorar um costuma piorar outro."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "As três ofertas de Odair",
        conteudo: {
          "personagem": "Odair",
          "texto": "Odair tem R$ 3.000 e recebe três ofertas. A primeira rende pouco e devolve o dinheiro no mesmo dia. A segunda rende mais, mas só libera o saque em dois anos. A terceira promete 15% ao mês, garantido, e chegou por mensagem de um perfil que ele não conhece. Essa terceira não tem CNPJ nem registro em nenhum órgão regulador.",
          "pergunta": "As duas primeiras se diferenciam por rendimento e liquidez. A terceira sai da conversa por outro motivo — qual?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Quando tem data marcada",
        conteudo: {
          "enunciado": "Odair precisa do dinheiro em três meses para pagar uma matrícula. Qual eixo pesa mais nessa escolha?",
          "alternativas": [
            {
              "id": "a",
              "texto": "O rendimento: ele deve escolher a opção que paga mais.",
              "correta": false,
              "feedback": "Render mais não adianta se o dinheiro não estiver disponível na data da matrícula. O prazo vem antes do ganho aqui."
            },
            {
              "id": "b",
              "texto": "A liquidez: o dinheiro precisa estar disponível na data em que ele vai usar.",
              "correta": true,
              "feedback": "Quando existe data marcada, a liquidez manda. Rendimento alto com resgate só em dois anos não serve para um gasto em três meses."
            },
            {
              "id": "c",
              "texto": "O risco: com prazo curto ele pode aceitar mais risco.",
              "correta": false,
              "feedback": "É o contrário. Quanto mais curto o prazo, menos tempo existe para recuperar uma eventual perda."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Seu eixo prioritário",
        conteudo: {
          "pergunta": "Dos três eixos, qual pesa mais para você no dinheiro que consegue guardar hoje?",
          "campo": "faixa",
          "placeholder": "Liquidez: quero poder sacar a qualquer momento",
          "faixas": [
            "Risco: não quero perder o que juntei",
            "Rendimento: quero o dinheiro crescendo mais",
            "Liquidez: quero poder sacar a qualquer momento"
          ],
          "ajuda": "Não existe resposta única: o eixo que pesa mais depende de quando você vai usar o dinheiro."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Nenhum eixo sozinho",
        conteudo: {
          "texto": "Você escolheu {valor}. Nenhuma das três respostas está errada — cada uma descreve um objetivo diferente. O erro é escolher sem antes verificar se quem oferece o investimento é autorizado e fiscalizado.",
          "regras": [
            {
              "se": "valor == 'Risco: não quero perder o que juntei'",
              "entao": "Priorizar risco baixo faz sentido para dinheiro que você não pode perder, como o de uma despesa já marcada."
            },
            {
              "se": "valor == 'Rendimento: quero o dinheiro crescendo mais'",
              "entao": "Buscar rendimento maior exige aceitar mais risco ou prazo mais longo. Só cabe com dinheiro que pode ficar parado."
            },
            {
              "se": "valor == 'Liquidez: quero poder sacar a qualquer momento'",
              "entao": "Priorizar liquidez custa rendimento, e é a escolha certa para a reserva que precisa estar disponível a qualquer momento."
            }
          ],
          "proximoPasso": "Antes de qualquer aplicação, procure o nome da instituição no site do Banco Central."
        },
      },
    ],
  },
  {
    slug: "ef89-conta-do-rendimento",
    titulo: "Fazendo a conta do rendimento",
    subtitulo: "Retorno bruto menos taxa, tarifa e imposto.",
    segmento: "ef89",
    blocoId: "ef89-bloco-d",
    blocoRotulo: "Bloco D · Poupança e investimento",
    ordem: 12,
    nivel: "avancado",
    duracaoMin: 4,
    pontos: 50,
    tags: ["rendimento", "taxas", "imposto"],
    thumbnail: "/trilha/poupar.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-risco-rendimento-liquidez",
    habilidades: ["EF89LF22", "EF89LF23"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Bruto e líquido",
        conteudo: {
          "texto": "O número que aparece na propaganda é o retorno bruto. O que chega na sua conta é o líquido. Entre um e outro entram a taxa de administração, cobrada pela gestão da aplicação, as tarifas do banco e o imposto de renda, descontado sobre o ganho no resgate. Comparar duas aplicações pelo bruto engana; a conta que importa é rendimento bruto menos os descontos.",
          "destaque": "O retorno que vale é o líquido: o bruto menos taxa, tarifa e imposto."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A conta de Patrícia",
        conteudo: {
          "personagem": "Patrícia",
          "texto": "Patrícia aplicou R$ 2.000 por um ano numa aplicação que rendeu 10% no período. O rendimento bruto foi R$ 200. A instituição cobrou R$ 20 de taxa de administração no ano e o imposto de renda levou 15% do ganho já descontada a taxa, ou seja, 15% de R$ 180, que dá R$ 27. Patrícia queria saber quanto sobrou de verdade.",
          "pergunta": "Dos R$ 200 que apareceram como rendimento, quanto é de fato de Patrícia?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Quanto sobrou",
        conteudo: {
          "enunciado": "Com rendimento bruto de R$ 200, taxa de R$ 20 e imposto de R$ 27, qual foi o ganho líquido de Patrícia?",
          "alternativas": [
            {
              "id": "a",
              "texto": "R$ 200, porque taxa e imposto são cobrados à parte.",
              "correta": false,
              "feedback": "Taxa e imposto saem do próprio rendimento. O valor bruto nunca chega inteiro na conta."
            },
            {
              "id": "b",
              "texto": "R$ 180, porque só a taxa de administração é descontada.",
              "correta": false,
              "feedback": "R$ 180 é o valor depois da taxa e antes do imposto. Faltou descontar os R$ 27 de imposto de renda."
            },
            {
              "id": "c",
              "texto": "R$ 153, porque R$ 200 menos R$ 20 menos R$ 27 dá R$ 153.",
              "correta": true,
              "feedback": "Correto: R$ 200 − R$ 20 = R$ 180, e R$ 180 − R$ 27 = R$ 153. Sobre os R$ 2.000 aplicados, o rendimento real foi de 7,65%."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua estimativa",
        conteudo: {
          "pergunta": "Imagine que você aplicou R$ 1.000 por um ano a 10%. Quanto você acha que sobraria de ganho depois de taxa e imposto?",
          "campo": "moeda",
          "placeholder": "R$ 80",
          "ajuda": "Estimativa serve: o objetivo é perceber a distância entre o número anunciado e o que sobra."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "10% que viram 7,65%",
        conteudo: {
          "texto": "Você estimou {valor} sobre um rendimento bruto de R$ 100. Com uma taxa de R$ 10 e imposto de 15% sobre o que restou, sobrariam R$ 76,50 — o anúncio dizia 10%, o bolso recebeu 7,65%.",
          "regras": [
            {
              "se": "valor >= 95",
              "entao": "Você considerou o bruto quase inteiro. Taxa e imposto saem sempre de dentro do rendimento, nunca por fora dele."
            },
            {
              "se": "valor entre 60 e 94",
              "entao": "Sua estimativa está na faixa certa. Você já espera que parte do rendimento anunciado não chegue à sua conta."
            },
            {
              "se": "valor < 60",
              "entao": "Você descontou mais do que costuma acontecer. Conferir as taxas reais importa: descontar demais também atrapalha a comparação entre aplicações."
            }
          ],
          "proximoPasso": "Procure a taxa de administração e o imposto antes de comparar duas aplicações pelo rendimento."
        },
      },
    ],
  },
  {
    slug: "ef89-poupar-x-credito-aposta",
    titulo: "Poupar, usar crédito — e aposta não entra",
    subtitulo: "Comparar os dois caminhos, e por que apostar não é nenhum deles.",
    segmento: "ef89",
    blocoId: "ef89-bloco-d",
    blocoRotulo: "Bloco D · Poupança e investimento",
    ordem: 13,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["credito", "poupanca", "juros"],
    thumbnail: "/trilha/poupar.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-conta-do-rendimento",
    habilidades: ["EF89LF24", "EF89LF25"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Esperar ou pagar juros",
        conteudo: {
          "texto": "Para comprar algo caro existem dois caminhos. Poupar: você espera, o dinheiro rende a seu favor e o preço final é menor. Usar crédito: você leva agora e paga juros, então o preço final é maior — às vezes o crédito é a opção possível, quando a necessidade não espera. Apostar não é um terceiro caminho: em loteria e jogo, a matemática trabalha contra o apostador.",
          "destaque": "Poupando, os juros trabalham a seu favor. No crédito, contra você."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A bicicleta de Paula",
        conteudo: {
          "personagem": "Paula",
          "texto": "Paula precisa de uma bicicleta de R$ 1.200 para chegar ao curso. Parcelando em 12 vezes de R$ 128, ela paga R$ 1.536: R$ 336 a mais. Guardando R$ 100 por mês, ela leva 12 meses e paga os R$ 1.200 — mas anda de ônibus até lá. Um colega sugeriu apostar R$ 50 num site de jogos para acelerar o processo.",
          "pergunta": "Os dois primeiros caminhos custam coisas diferentes: um custa dinheiro, o outro custa tempo. E o terceiro, o que custa?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Por que aposta não conta",
        conteudo: {
          "enunciado": "Por que a aposta sugerida a Paula não é uma alternativa a poupar ou a usar crédito?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Porque o valor apostado é baixo demais para comprar a bicicleta.",
              "correta": false,
              "feedback": "O problema não é o tamanho da aposta. Mesmo com valor alto, o resultado continua sendo sorteio, e não acúmulo."
            },
            {
              "id": "b",
              "texto": "Porque em poupança e investimento o resultado é previsível; na aposta, o retorno médio é negativo e o mais provável é perder o valor.",
              "correta": true,
              "feedback": "Isso. Poupar e investir têm resultado previsível dentro de uma faixa; a aposta é montada para devolver menos do que arrecada."
            },
            {
              "id": "c",
              "texto": "Porque apostar só compensa quando a pessoa entende bem as regras do jogo.",
              "correta": false,
              "feedback": "Conhecer as regras não muda as probabilidades. O jogo é desenhado para que a casa ganhe no conjunto das apostas."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Seu caminho",
        conteudo: {
          "pergunta": "Pense em algo que você quer e ainda não tem. Qual caminho você escolheria hoje?",
          "campo": "faixa",
          "placeholder": "Juntar uma parte e parcelar o resto",
          "faixas": [
            "Esperar e juntar o valor inteiro",
            "Juntar uma parte e parcelar o resto",
            "Parcelar tudo e começar a pagar agora"
          ],
          "ajuda": "Não há resposta certa: o caminho depende de quanto essa necessidade pode esperar."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Quanto custa não esperar",
        conteudo: {
          "texto": "Você escolheu {valor}. O que decide entre esperar e parcelar é uma pergunta só: quanto essa necessidade pode esperar, e quanto o crédito cobra de você por não esperar.",
          "regras": [
            {
              "se": "valor == 'Esperar e juntar o valor inteiro'",
              "entao": "Esperar é o caminho mais barato e custa tempo. Funciona quando a falta do item não impede algo importante agora."
            },
            {
              "se": "valor == 'Juntar uma parte e parcelar o resto'",
              "entao": "Uma entrada maior reduz os juros pagos. É o meio-termo mais comum quando a necessidade não espera o valor inteiro."
            },
            {
              "se": "valor == 'Parcelar tudo e começar a pagar agora'",
              "entao": "Às vezes essa é a única opção possível, e isso não é falha sua. Confira o total das parcelas, não só o valor de cada uma."
            }
          ],
          "proximoPasso": "Some as parcelas da próxima compra a prazo e compare com o preço à vista."
        },
      },
    ],
  },
  {
    slug: "ef89-colchao-aposentadoria-planeta",
    titulo: "Colchão, aposentadoria e planeta",
    subtitulo: "Resiliência, longo prazo e o critério ambiental na escolha.",
    segmento: "ef89",
    blocoId: "ef89-bloco-d",
    blocoRotulo: "Bloco D · Poupança e investimento",
    ordem: 14,
    nivel: "avancado",
    duracaoMin: 4,
    pontos: 50,
    tags: ["resiliencia", "reserva", "aposentadoria"],
    thumbnail: "/trilha/poupar.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-poupar-x-credito-aposta",
    habilidades: ["EF89LF27", "EF89LF19", "EF89LF29"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Reserva, décadas e impacto",
        conteudo: {
          "texto": "Resiliência financeira é a capacidade de aguentar um imprevisto sem desmontar a vida: uma reserva que cobre o mês em que a renda cai. Aposentadoria é o mesmo raciocínio esticado por décadas — guardar hoje para quando trabalhar deixar de ser possível ou desejado. E há um terceiro critério ganhando espaço: aplicações que declaram o impacto ambiental do que financiam, permitindo escolher onde seu dinheiro atua.",
          "destaque": "Reserva cobre o mês ruim; aposentadoria cobre as décadas depois do trabalho."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Os R$ 120 de Pedro",
        conteudo: {
          "personagem": "Pedro",
          "texto": "Pedro tem 14 anos e ouve em casa que o dinheiro nunca sobra. Ele começou guardando R$ 15 por mês do que ganha lavando carros no fim de semana. Em oito meses juntou R$ 120 e usou R$ 90 para consertar o celular quebrado, sem pedir emprestado a ninguém. Foi a primeira vez que um imprevisto não virou dívida na casa dele.",
          "pergunta": "A reserva de Pedro resolveu um mês. O que muda quando o mesmo hábito é esticado por trinta anos?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "O critério ambiental",
        conteudo: {
          "enunciado": "Duas aplicações têm risco e rendimento parecidos, mas uma informa o impacto ambiental do que financia. O que esse dado permite?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Garante rendimento maior, porque projetos sustentáveis rendem mais.",
              "correta": false,
              "feedback": "Não existe essa garantia. O impacto ambiental é um critério a mais na escolha, não uma promessa de retorno."
            },
            {
              "id": "b",
              "texto": "Acrescentar um critério à decisão: saber que atividades o seu dinheiro ajuda a financiar.",
              "correta": true,
              "feedback": "Isso. Com risco e rendimento parecidos, a informação ambiental vira um critério legítimo de desempate."
            },
            {
              "id": "c",
              "texto": "Dispensa checar se a instituição é autorizada, já que o projeto é sustentável.",
              "correta": false,
              "feedback": "Nenhum selo substitui a checagem de confiabilidade. Instituição autorizada continua sendo o primeiro filtro."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Meses de reserva",
        conteudo: {
          "pergunta": "Quantos meses de gastos essenciais você acha que uma reserva deveria cobrir?",
          "campo": "numero",
          "placeholder": "3",
          "ajuda": "Estimativa serve: o número depende de quanto a renda de casa varia de um mês para outro."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Do mês ruim às décadas",
        conteudo: {
          "texto": "Você respondeu {valor} meses. Uma reserva desse tamanho é o que separa um imprevisto de uma dívida — e o mesmo hábito, mantido por décadas, é o que constrói a renda da aposentadoria.",
          "regras": [
            {
              "se": "valor <= 1",
              "entao": "Um mês cobre um susto pequeno. Renda instável costuma exigir mais tempo coberto, porque a queda pode durar."
            },
            {
              "se": "valor entre 2 e 6",
              "entao": "Está na faixa que a maioria dos planejadores usa. Comece pelo menor número dessa faixa e aumente devagar."
            },
            {
              "se": "valor > 6",
              "entao": "Reserva longa dá tranquilidade, mas rende pouco por precisar de liquidez. Atingido o alvo, o excedente pode ir para prazos maiores."
            }
          ],
          "proximoPasso": "Calcule quanto sua casa gasta num mês comum e divida esse valor por dez."
        },
      },
    ],
  },
  {
    slug: "ef89-contrato-de-credito",
    titulo: "O contrato de crédito",
    subtitulo: "Ler as cláusulas e achar o CET no meio delas.",
    segmento: "ef89",
    blocoId: "ef89-bloco-e",
    blocoRotulo: "Bloco E · Crédito e endividamento",
    ordem: 15,
    nivel: "avancado",
    duracaoMin: 4,
    pontos: 50,
    tags: ["credito", "contrato", "cet"],
    thumbnail: "/trilha/credito.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-colchao-aposentadoria-planeta",
    habilidades: ["EF89LF31", "EF89LF32"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O que está escrito ali",
        conteudo: {
          "texto": "Todo crédito vem com um contrato, e nele aparecem palavras que só existem naquele lugar: taxa de juros, que é o preço de usar dinheiro que não é seu; IOF, um imposto sobre operações de crédito; tarifa de cadastro; seguro prestamista; prazo. O Custo Efetivo Total, o CET, é o número que junta tudo isso em uma taxa só. Sem olhar o CET, ninguém sabe quanto o crédito realmente custa.",
          "destaque": "A taxa de juros é só uma parte. O CET é o preço inteiro."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A letra menor da loja",
        conteudo: {
          "personagem": "Priscila",
          "texto": "Priscila quer um celular de R$ 1.800 parcelado em 12 vezes na loja. O vendedor repete a taxa de juros de 2,5% ao mês. No contrato, em letra menor, aparecem tarifa de cadastro de R$ 90, IOF e seguro prestamista de R$ 6 por parcela. Somando tudo, o CET informado é 4,1% ao mês. A parcela cabe no orçamento dela, mas o preço final não é o que ela ouviu do vendedor.",
          "pergunta": "Qual número Priscila deve levar para comparar com a outra loja: os 2,5% ou os 4,1%?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Comparando duas ofertas",
        conteudo: {
          "enunciado": "Duas lojas vendem o mesmo produto. A primeira anuncia juros de 2,5% ao mês; a segunda, CET de 3,4% ao mês. O que dá para concluir?",
          "alternativas": [
            {
              "id": "a",
              "texto": "A primeira é mais barata, porque 2,5% é menor que 3,4%.",
              "correta": false,
              "feedback": "Os dois números não medem a mesma coisa. A taxa de juros deixa de fora tarifas, IOF e seguros; o CET inclui todos eles."
            },
            {
              "id": "b",
              "texto": "Ainda não dá para concluir: falta o CET da primeira loja.",
              "correta": true,
              "feedback": "Comparação só vale entre CET e CET. Pedir o CET da primeira loja é o que permite decidir com informação."
            },
            {
              "id": "c",
              "texto": "A segunda é mais barata, porque o CET é sempre menor que os juros.",
              "correta": false,
              "feedback": "O CET nunca fica abaixo da taxa de juros do contrato, já que ele soma os outros custos ao juro cobrado."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Caça ao CET",
        conteudo: {
          "pergunta": "Pegue um anúncio de parcelamento que você viu esta semana e informe o CET mensal que aparece nele.",
          "campo": "percentual",
          "placeholder": "3,5",
          "ajuda": "Estimativa serve: se o anúncio não mostrar o CET, escreva a taxa de juros que ele informa."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O preço inteiro",
        conteudo: {
          "texto": "Você anotou {valor} ao mês. Esse número, e não o tamanho da parcela, é o que diz quanto o crédito está custando.",
          "regras": [
            {
              "se": "o anúncio não informava CET",
              "entao": "Anúncio que esconde o CET já é informação: a loja não quer comparação. Peça o número por escrito antes de assinar."
            },
            {
              "se": "valor <= 3",
              "entao": "Está abaixo do que costuma custar o parcelamento no varejo. Ainda assim, confira tarifa de cadastro e seguro dentro do contrato."
            },
            {
              "se": "valor > 3",
              "entao": "Custo alto. Vale simular o mesmo produto à vista e ver quanto os 12 meses acrescentam ao preço original."
            }
          ],
          "proximoPasso": "Procure a sigla CET em um anúncio de parcelamento hoje e veja se ela aparece."
        },
      },
    ],
  },
  {
    slug: "ef89-cabe-no-seu-bolso",
    titulo: "Cabe no seu bolso?",
    subtitulo: "Capacidade de pagamento antes da assinatura.",
    segmento: "ef89",
    blocoId: "ef89-bloco-e",
    blocoRotulo: "Bloco E · Crédito e endividamento",
    ordem: 16,
    nivel: "avancado",
    duracaoMin: 4,
    pontos: 50,
    tags: ["credito", "capacidade-de-pagamento", "juros"],
    thumbnail: "/trilha/credito.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-contrato-de-credito",
    habilidades: ["EF89LF34", "EF89LF33"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "A pergunta certa",
        conteudo: {
          "texto": "Antes de assinar, a pergunta não é se a parcela cabe hoje, e sim se ela cabe todo mês, até o fim, mesmo se algo mudar. Capacidade de pagamento é o que sobra da renda depois das despesas fixas. E o tipo de crédito muda o tamanho do risco: cheque especial e rotativo do cartão cobram juros bem mais altos que consignado ou crédito pessoal.",
          "destaque": "Capacidade de pagamento é o que sobra depois das contas, não o que sobra hoje."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A parcela maior que a folga",
        conteudo: {
          "personagem": "Rodrigo",
          "texto": "Rodrigo tem 17 anos e trabalha como jovem aprendiz: recebe R$ 1.100 por mês. Passe, celular e a parte dele nas contas de casa somam R$ 780, então sobram R$ 320. Ele quer um notebook de R$ 3.000 em 10 parcelas de R$ 360. O vendedor diz que dá para pagar. A parcela é maior do que tudo o que sobra, e o contrato dura dez meses seguidos.",
          "pergunta": "O que Rodrigo teria que cortar, e por quanto tempo, para essa parcela caber de verdade?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Até quanto de parcela",
        conteudo: {
          "enunciado": "Sobram R$ 320 por mês para Rodrigo. Qual parcela máxima ele deveria aceitar, considerando que imprevistos acontecem?",
          "alternativas": [
            {
              "id": "a",
              "texto": "R$ 320, usando toda a folga que ele tem.",
              "correta": false,
              "feedback": "Comprometer 100% da folga não deixa margem para um remédio, um conserto ou um mês em que a renda venha menor."
            },
            {
              "id": "b",
              "texto": "Perto de R$ 160, deixando metade da folga livre.",
              "correta": true,
              "feedback": "Sobra espaço para imprevisto e o contrato continua sendo pago até o fim, que é o que evita juros de atraso."
            },
            {
              "id": "c",
              "texto": "R$ 360, já que o vendedor aprovou o crédito.",
              "correta": false,
              "feedback": "A aprovação mede o risco da loja receber, não a sua capacidade de pagar sem apertar o resto do mês."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua folga do mês",
        conteudo: {
          "pergunta": "Quanto sobra da sua renda, ou do dinheiro que você recebe, depois das despesas de um mês?",
          "campo": "moeda",
          "placeholder": "R$ 250",
          "ajuda": "Estimativa serve: pense no mês passado e arredonde o valor."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Sua parcela máxima",
        conteudo: {
          "texto": "Você informou {valor} de folga mensal. Metade disso é uma referência razoável de parcela máxima antes de assinar qualquer contrato.",
          "regras": [
            {
              "se": "valor <= 0",
              "entao": "Sem folga, qualquer parcela nova vira dívida. O caminho é reduzir despesa fixa ou aumentar renda antes de contratar crédito."
            },
            {
              "se": "valor > 0 e valor <= 200",
              "entao": "Folga pequena. Parcela acima da metade dela transforma qualquer imprevisto em atraso, e atraso custa multa e juros."
            },
            {
              "se": "valor > 200",
              "entao": "Há espaço, mas ele some rápido em crédito rotativo ou cheque especial, onde os juros são os mais altos do mercado."
            }
          ],
          "proximoPasso": "Liste suas despesas fixas de um mês e subtraia da renda para achar sua folga real."
        },
      },
    ],
  },
  {
    slug: "ef89-conta-de-emprestimo",
    titulo: "A conta do empréstimo",
    subtitulo: "Calcular o custo real, inclusive do financiamento estudantil.",
    segmento: "ef89",
    blocoId: "ef89-bloco-e",
    blocoRotulo: "Bloco E · Crédito e endividamento",
    ordem: 17,
    nivel: "avancado",
    duracaoMin: 4,
    pontos: 50,
    tags: ["financiamento-estudantil", "emprestimo", "juros"],
    thumbnail: "/trilha/credito.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-cabe-no-seu-bolso",
    habilidades: ["EF89LF36", "EF89LF30"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Estudar agora, pagar depois",
        conteudo: {
          "texto": "Financiamento estudantil é crédito: alguém paga o seu curso superior agora e você devolve depois, com juros. O Fies é o programa público mais conhecido, e existem também linhas privadas. A conta que importa é simples: quanto foi emprestado, por quanto tempo e quanto se paga no total. O mesmo cálculo vale para o cheque especial, só que ali os juros correm por dia.",
          "destaque": "Financiamento estudantil não é bolsa: é dívida com prazo e juros."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Vinte e quatro mensalidades",
        conteudo: {
          "personagem": "Rosana",
          "texto": "Rosana entrou em um curso superior que custa R$ 800 por mês e financiou 24 mensalidades. O valor emprestado foi R$ 19.200. O contrato prevê juros simples de 0,5% ao mês sobre esse valor durante os 24 meses do curso, e a devolução só começa depois. Ao terminar, ela quer saber quanto deve de fato: o preço do curso ou algo maior que isso.",
          "pergunta": "Quanto de juros se acumula nesses 24 meses e qual vira o valor final da dívida de Rosana?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Faça a conta",
        conteudo: {
          "enunciado": "R$ 19.200 emprestados, com juros simples de 0,5% ao mês durante 24 meses. Quanto Rosana deve ao terminar o curso?",
          "alternativas": [
            {
              "id": "a",
              "texto": "R$ 19.200, porque os juros só começam depois da formatura.",
              "correta": false,
              "feedback": "Os juros correm desde a contratação. O que fica para depois é o pagamento das parcelas, não a cobrança do juro."
            },
            {
              "id": "b",
              "texto": "R$ 21.504, somando R$ 2.304 de juros.",
              "correta": true,
              "feedback": "0,5% de R$ 19.200 dá R$ 96 por mês. Em 24 meses são R$ 2.304, que somados ao valor emprestado dão R$ 21.504."
            },
            {
              "id": "c",
              "texto": "R$ 28.800, porque os juros aumentam a dívida pela metade.",
              "correta": false,
              "feedback": "Juros simples de 0,5% ao mês acrescentam 12% em dois anos, não 50%. A conta daria R$ 2.304 de juros."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "O curso que você faria",
        conteudo: {
          "pergunta": "Pense em um curso que você faria depois da escola. Quanto custaria a mensalidade dele?",
          "campo": "moeda",
          "placeholder": "R$ 600",
          "ajuda": "Estimativa serve: use o preço de um curso parecido que você já viu anunciado."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O total financiado",
        conteudo: {
          "texto": "Com mensalidade de {valor}, um financiamento de 24 meses empresta 24 vezes esse valor — e ainda cobra juros sobre o total.",
          "regras": [
            {
              "se": "valor < 500",
              "entao": "Mesmo mensalidade baixa vira número grande: 24 parcelas somam quase o equivalente a dois anos inteiros de custo."
            },
            {
              "se": "valor >= 500 e valor <= 1500",
              "entao": "Faixa comum em curso superior privado. Vale comparar o total financiado com a renda média da profissão que você quer."
            },
            {
              "se": "valor > 1500",
              "entao": "Dívida alta ao fim do curso. Antes de financiar, compare com vaga em universidade pública, bolsa e linhas de juros menores."
            }
          ],
          "proximoPasso": "Multiplique a mensalidade que você escreveu por 24 e anote o total que seria financiado."
        },
      },
    ],
  },
  {
    slug: "ef89-atrasou-e-agora",
    titulo: "Atrasou: e agora",
    subtitulo: "O que acontece, quando vira problema e como sair.",
    segmento: "ef89",
    blocoId: "ef89-bloco-e",
    blocoRotulo: "Bloco E · Crédito e endividamento",
    ordem: 18,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["divida", "inadimplencia", "negociacao"],
    thumbnail: "/trilha/credito.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-conta-de-emprestimo",
    habilidades: ["EF89LF35", "EF89LF37", "EF89LF38"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O que acontece no atraso",
        conteudo: {
          "texto": "Atrasar não é só levar uma multa. A partir do vencimento entram multa, juros de mora e correção; passados alguns dias, o nome vai para cadastros de inadimplentes, o que fecha portas de crédito e até de aluguel. A dívida vira problema quando as parcelas passam a competir com comida, moradia e transporte, ou quando é preciso fazer uma dívida nova para pagar a antiga.",
          "destaque": "A dívida vira problema quando começa a disputar espaço com o essencial."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Duas faturas atrasadas",
        conteudo: {
          "personagem": "Samuel",
          "texto": "Samuel atrasou duas faturas do cartão. O valor original era R$ 900 e, com multa, juros de mora e rotativo, chegou a R$ 1.480 em três meses. Ele passou a pagar só o mínimo, e mesmo assim a dívida cresceu. A empresa ligou oferecendo acordo: R$ 1.100 à vista ou 10 parcelas de R$ 140. A renda dele caiu quando perdeu um dos dois turnos de trabalho.",
          "pergunta": "Entre pagar o mínimo, aceitar o valor à vista ou parcelar, o que de fato reduz a dívida de Samuel?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Qual saída funciona",
        conteudo: {
          "enunciado": "Samuel tem R$ 1.480 no rotativo do cartão e recebeu uma proposta de acordo. Qual estratégia costuma reduzir mais o que ele vai pagar?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Continuar pagando o mínimo até a renda melhorar.",
              "correta": false,
              "feedback": "O mínimo mantém o restante no rotativo, que tem os juros mais altos do mercado. A dívida cresce enquanto ele paga."
            },
            {
              "id": "b",
              "texto": "Negociar e trocar o rotativo por uma dívida com valor e prazo fixos.",
              "correta": true,
              "feedback": "Sair do rotativo interrompe o crescimento e dá um número final conhecido. Só vale aceitar parcela que caiba no orçamento."
            },
            {
              "id": "c",
              "texto": "Usar o cheque especial para quitar a fatura do cartão.",
              "correta": false,
              "feedback": "O cheque especial está entre as linhas mais caras que existem. Seria trocar uma dívida cara por outra parecida."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Quanto você aguenta",
        conteudo: {
          "pergunta": "Se você tivesse uma conta atrasada hoje, quanto conseguiria destinar por mês para quitá-la?",
          "campo": "moeda",
          "placeholder": "R$ 120",
          "ajuda": "Estimativa serve: pense no que sobraria sem cortar comida nem transporte."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O número da negociação",
        conteudo: {
          "texto": "Você informou {valor} por mês. Esse é o número que se leva para uma negociação, e não o que o credor propõe primeiro.",
          "regras": [
            {
              "se": "valor = 0",
              "entao": "Sem valor disponível, procure órgãos de defesa do consumidor e mutirões de renegociação antes de assinar qualquer acordo."
            },
            {
              "se": "valor > 0 e valor < 100",
              "entao": "Valor pequeno serve: acordo com parcela realista e paga até o fim vale mais que parcela grande abandonada no terceiro mês."
            },
            {
              "se": "valor >= 100",
              "entao": "Com essa margem dá para pedir prazo mais curto e desconto maior, já que quanto menos tempo, menos juros incidem."
            }
          ],
          "proximoPasso": "Antes de aceitar acordo, peça o valor total com juros por escrito e compare com sua folga."
        },
      },
    ],
  },
  {
    slug: "ef89-endividado-ou-inadimplente",
    titulo: "Endividado ou inadimplente",
    subtitulo: "Duas situações diferentes — e o crédito verde.",
    segmento: "ef89",
    blocoId: "ef89-bloco-e",
    blocoRotulo: "Bloco E · Crédito e endividamento",
    ordem: 19,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["endividamento", "inadimplencia", "credito-verde"],
    thumbnail: "/trilha/credito.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-atrasou-e-agora",
    habilidades: ["EF89LF39", "EF89LF40"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Duas situações diferentes",
        conteudo: {
          "texto": "Endividado é quem tem dívida e está pagando em dia: financiamento, parcela, carnê. Inadimplente é quem parou de pagar e passou do vencimento. A diferença não está no tamanho da dívida, está no pagamento. Existe ainda um tipo de crédito com condições melhores para quem faz algo de interesse coletivo: o crédito verde, voltado a projetos de menor impacto ambiental, como energia solar e saneamento.",
          "destaque": "Ter dívida e estar inadimplente não são a mesma situação."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Os dois compromissos",
        conteudo: {
          "personagem": "Sandra",
          "texto": "Sandra tem dois compromissos. Um é o financiamento de painéis solares para a casa, com parcelas de R$ 210, todas pagas em dia, contratado em uma linha de crédito verde com juros menores que os do crédito pessoal comum. O outro é uma fatura de loja de R$ 340, vencida há 50 dias, que ela deixou de pagar. Só a segunda levou o nome dela para o cadastro de devedores.",
          "pergunta": "O que mudou entre as duas dívidas de Sandra: o valor, o tipo de crédito ou o pagamento?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Quem está inadimplente",
        conteudo: {
          "enunciado": "Três pessoas têm dívidas. Qual delas está inadimplente, e não apenas endividada?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Quem financiou uma moto em 36 parcelas e paga todas na data.",
              "correta": false,
              "feedback": "Essa pessoa está endividada: tem dívida, mas em dia. A inadimplência começa depois de um vencimento não pago."
            },
            {
              "id": "b",
              "texto": "Quem deixou de pagar a segunda parcela de um carnê e não negociou.",
              "correta": true,
              "feedback": "Passou do vencimento sem pagar e sem acordo. Isso é inadimplência, mesmo que o valor devido seja pequeno."
            },
            {
              "id": "c",
              "texto": "Quem tem a maior dívida entre as três pessoas.",
              "correta": false,
              "feedback": "O tamanho não define a situação. Uma dívida grande paga em dia continua sendo apenas endividamento."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Crédito verde por perto",
        conteudo: {
          "pergunta": "Que projeto do seu bairro se encaixaria em uma linha de crédito verde?",
          "campo": "texto",
          "placeholder": "Painel solar na padaria da esquina",
          "ajuda": "Estimativa serve: vale qualquer ideia que reduza consumo de água, energia ou lixo."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Por que existe crédito verde",
        conteudo: {
          "texto": "Você citou {valor}. O crédito verde existe porque projetos assim geram benefício além de quem toma o empréstimo.",
          "regras": [
            {
              "se": "a resposta envolve energia",
              "entao": "Energia limpa reduz a conta de luz de quem instala e alivia a pressão sobre o sistema elétrico de todo mundo."
            },
            {
              "se": "a resposta envolve água, lixo ou saneamento",
              "entao": "Saneamento e resíduos afetam a saúde coletiva; por isso essas linhas costumam ter juros e prazos melhores."
            },
            {
              "se": "o campo ficou em branco ou sem relação ambiental",
              "entao": "Vale olhar de novo: transporte, reforma que economiza energia e horta comunitária também entram nessas linhas."
            }
          ],
          "proximoPasso": "Procure no site de um banco público quais linhas de crédito verde existem hoje."
        },
      },
    ],
  },
  {
    slug: "ef89-o-que-determina-sua-renda",
    titulo: "O que determina a sua renda",
    subtitulo: "Estrutura, conjuntura, escolha pessoal e capital humano.",
    segmento: "ef89",
    blocoId: "ef89-bloco-f",
    blocoRotulo: "Bloco F · Renda e empreendedorismo",
    ordem: 20,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["renda", "trabalho", "capital-humano"],
    thumbnail: "/trilha/renda.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-endividado-ou-inadimplente",
    habilidades: ["EF89LF41", "EF89LF42"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Três forças ao mesmo tempo",
        conteudo: {
          "texto": "A renda de uma pessoa não depende só do esforço dela. Determinantes estruturais são de longo prazo: onde você nasceu, a escola que teve, cor, gênero, acesso a transporte. Os conjunturais mudam com o momento: inflação, desemprego, uma crise, um setor em alta. Os pessoais são as escolhas possíveis dentro disso: estudar, trocar de área, aprender uma ferramenta nova. Os três agem juntos.",
          "destaque": "Esforço explica parte da renda. Estrutura e conjuntura explicam outra parte."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Quando a fábrica fecha",
        conteudo: {
          "personagem": "Sérgio",
          "texto": "Sérgio tem 14 anos e mora em uma cidade onde a maior fábrica fechou no ano passado. O pai dele, torneiro mecânico há vinte anos, ficou sem vaga: não faltou qualificação, faltou emprego na região. A mãe faz faxina e viu a procura cair junto. Ao mesmo tempo, um curso técnico gratuito abriu no município, com aulas à noite. A renda da casa depende dessas três coisas.",
          "pergunta": "Quais partes dessa situação a família de Sérgio consegue mudar e quais dependem de algo maior?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Que tipo de determinante",
        conteudo: {
          "enunciado": "Uma cidade perde sua maior fábrica e o desemprego sobe. Esse é um determinante de que tipo para a renda das famílias?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Pessoal, porque cada um escolhe onde vai trabalhar.",
              "correta": false,
              "feedback": "A escolha existe, mas ela não cria vagas. O fechamento atinge toda a região, independentemente do esforço de cada pessoa."
            },
            {
              "id": "b",
              "texto": "Conjuntural, porque depende do momento econômico e pode mudar.",
              "correta": true,
              "feedback": "Conjuntura é o que muda com o ciclo: crise, setor em queda, desemprego alto. Afeta a renda sem depender da pessoa."
            },
            {
              "id": "c",
              "texto": "Estrutural, porque é permanente e não muda mais.",
              "correta": false,
              "feedback": "Estrutural é o que vem de longo prazo, como acesso à escola e infraestrutura. Uma fábrica que fecha é um evento do momento."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua próxima habilidade",
        conteudo: {
          "pergunta": "Cite uma habilidade que você quer ter até os 18 anos e que pode aumentar sua renda.",
          "campo": "texto",
          "placeholder": "Falar inglês para trabalhar com atendimento",
          "ajuda": "Estimativa serve: escreva a primeira que vier à cabeça, sem pesquisar antes."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Isso é capital humano",
        conteudo: {
          "texto": "Você escreveu {valor}. Isso é capital humano: o conjunto de conhecimento e experiência que uma pessoa leva para o trabalho.",
          "regras": [
            {
              "se": "a habilidade é técnica e específica, como solda, programação ou idioma",
              "entao": "Habilidade específica costuma ter demanda clara. Confira se ela existe no mercado da sua cidade e também fora dela."
            },
            {
              "se": "a habilidade é ampla, como comunicação ou organização",
              "entao": "Habilidade ampla vale em muitos setores, o que protege a renda quando um deles entra em crise."
            },
            {
              "se": "o campo ficou em branco",
              "entao": "Sem resposta, comece observando que trabalhos existem perto de você e o que cada um deles exige de quem entra."
            }
          ],
          "proximoPasso": "Descubra um curso gratuito na sua cidade que ensine a habilidade que você escreveu."
        },
      },
    ],
  },
  {
    slug: "ef89-formal-informal-precarizado",
    titulo: "Formal, informal, precarizado",
    subtitulo: "Direitos, deveres e o que a informalidade cobra depois.",
    segmento: "ef89",
    blocoId: "ef89-bloco-f",
    blocoRotulo: "Bloco F · Renda e empreendedorismo",
    ordem: 21,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["trabalho-formal", "informalidade", "precarizacao"],
    thumbnail: "/trilha/renda.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-o-que-determina-sua-renda",
    habilidades: ["EF89LF43", "EF89LF44"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Com registro e sem registro",
        conteudo: {
          "texto": "Trabalho formal tem carteira assinada: férias remuneradas, 13º, FGTS, INSS e seguro-desemprego, junto com o dever de recolher contribuição e imposto. O informal não tem esse registro. A renda pode até ser maior em um mês bom, mas não há férias pagas nem licença médica. Precarização é outra coisa: é quando o trabalho, registrado ou não, perde proteção, previsibilidade e descanso.",
          "destaque": "O que a informalidade paga hoje, ela cobra na doença e na aposentadoria."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Dezoito dias parada",
        conteudo: {
          "personagem": "Silvana",
          "texto": "Silvana faz entregas por aplicativo. Em um mês bom tira R$ 2.600, mais do que ganharia registrada na mesma função. Não desconta INSS, não tem férias nem 13º, e paga sozinha a manutenção da moto e o combustível. Quando torceu o tornozelo, ficou 18 dias sem trabalhar e sem receber nada. Como não contribui, esse tempo também não conta para a aposentadoria dela.",
          "pergunta": "Quanto a mais Silvana precisaria guardar por mês para cobrir o que a formalidade cobriria?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Comparação que engana",
        conteudo: {
          "enunciado": "Silvana ganha mais como entregadora informal do que ganharia registrada. Por que comparar só os dois valores engana?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Porque trabalho informal é sempre pior que trabalho formal.",
              "correta": false,
              "feedback": "Nem sempre é pior; existe informal com renda alta e autonomia. O ponto é o que não vem junto, não uma regra fixa."
            },
            {
              "id": "b",
              "texto": "Porque o salário formal vem com FGTS, 13º, férias e INSS, que valem dinheiro.",
              "correta": true,
              "feedback": "Esses direitos fazem parte da remuneração. Sem eles, a renda precisa cobrir também aquilo que deixa de ser recebido."
            },
            {
              "id": "c",
              "texto": "Porque quem trabalha na informalidade não paga imposto nenhum.",
              "correta": false,
              "feedback": "Quem é informal paga imposto ao consumir e pode recolher INSS por conta própria. Não é isso que diferencia os dois."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua própria proteção",
        conteudo: {
          "pergunta": "Se você trabalhasse por conta própria, que fatia da renda guardaria por mês para férias, doença e aposentadoria?",
          "campo": "percentual",
          "placeholder": "20",
          "ajuda": "Estimativa serve: pense na parte da renda que daria para separar sem faltar o básico."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O que você teria que montar",
        conteudo: {
          "texto": "Você separaria {valor} da renda. Quem tem carteira assinada recebe essa proteção embutida; quem não tem precisa montar a sua.",
          "regras": [
            {
              "se": "valor < 10",
              "entao": "Fatia pequena. Cobre um imprevisto curto, mas não substitui 13º, férias e contribuição para a aposentadoria."
            },
            {
              "se": "valor >= 10 e valor <= 25",
              "entao": "Faixa próxima do que os direitos formais representam somados. Só funciona se o dinheiro ficar separado do resto."
            },
            {
              "se": "valor > 25",
              "entao": "Reserva alta, protege bastante, mas comprime o mês. Vale checar se dá para manter isso durante o ano inteiro."
            }
          ],
          "proximoPasso": "Pesquise quanto custa a contribuição do INSS para quem trabalha por conta própria."
        },
      },
    ],
  },
  {
    slug: "ef89-atitude-empreendedora",
    titulo: "Atitude empreendedora",
    subtitulo: "Empreender dentro do emprego, e o que o MEI garante.",
    segmento: "ef89",
    blocoId: "ef89-bloco-f",
    blocoRotulo: "Bloco F · Renda e empreendedorismo",
    ordem: 22,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["empreendedorismo", "mei", "trabalho"],
    thumbnail: "/trilha/renda.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-formal-informal-precarizado",
    habilidades: ["EF89LF45", "EF89LF50"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Postura, não crachá",
        conteudo: {
          "texto": "Atitude empreendedora não é só abrir empresa. É perceber um problema, propor solução e assumir responsabilidade pelo resultado. Quem é assalariado pode ter essa atitude ao melhorar um processo no trabalho. Quem é autônomo tem ao buscar clientes e organizar a agenda. Quem tem empresa tem ao decidir onde investir. Muda o vínculo de trabalho, não a postura.",
          "destaque": "Atitude empreendedora aparece no emprego, no autônomo e na empresa."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Padaria de dia, bolo no fim de semana",
        conteudo: {
          "personagem": "Simone",
          "texto": "Simone é atendente numa padaria e ganha R$ 1.800 por mês. Ela notou que sobravam pães no fim do dia e sugeriu uma sacola de véspera por R$ 6. A ideia rendeu R$ 900 a mais no mês para a padaria. No fim de semana, Simone também faz bolos por encomenda e recebe cerca de R$ 700. Ela pensa em se formalizar como MEI.",
          "pergunta": "Em qual dos dois trabalhos Simone teve atitude empreendedora, e o que muda se ela virar MEI?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "O que o MEI garante",
        conteudo: {
          "enunciado": "Ao se formalizar como MEI, o que Simone passa a ter garantido por lei?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Salário fixo pago pelo governo todo mês.",
              "correta": false,
              "feedback": "MEI não garante renda. O dinheiro continua vindo das vendas dela; o que a lei assegura são o CNPJ e os direitos previdenciários."
            },
            {
              "id": "b",
              "texto": "CNPJ, emissão de nota fiscal e benefícios do INSS, como auxílio-doença e aposentadoria.",
              "correta": true,
              "feedback": "Correto. Pagando a guia mensal do MEI, ela passa a ter CNPJ, pode emitir nota fiscal e conta com cobertura previdenciária."
            },
            {
              "id": "c",
              "texto": "Isenção total de qualquer contribuição ou imposto para sempre.",
              "correta": false,
              "feedback": "Não. O MEI paga uma guia mensal fixa, e é justamente essa contribuição que dá acesso aos benefícios."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Renda por conta própria",
        conteudo: {
          "pergunta": "Pensando em você, em alguém da sua casa ou do seu bairro: quanto essa pessoa recebe por mês trabalhando por conta própria, fora salário fixo?",
          "campo": "moeda",
          "placeholder": "R$ 700",
          "ajuda": "Estimativa serve. O objetivo é enxergar quanta renda já vem de atividade por conta própria."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Formalizar ou ainda não",
        conteudo: {
          "texto": "Você estimou {valor} por mês vindos de trabalho por conta própria. Esse valor é o que sustenta a decisão de formalizar: o MEI cobra uma guia mensal fixa e devolve CNPJ, nota fiscal e direitos previdenciários.",
          "regras": [
            {
              "se": "valor == 0",
              "entao": "Nenhuma renda por conta própria ainda. Vale observar onde existe um problema que se repete perto de você: é daí que costuma sair a primeira oportunidade."
            },
            {
              "se": "valor entre 1 e 800",
              "entao": "Renda pequena e provavelmente irregular. Antes de formalizar, registre por três meses quanto entra de fato — a guia do MEI é cobrada mesmo em mês fraco."
            },
            {
              "se": "valor > 800",
              "entao": "Com esse movimento, a formalização começa a fazer sentido: nota fiscal abre portas para clientes maiores e a contribuição garante cobertura do INSS."
            }
          ],
          "proximoPasso": "Anote por uma semana toda entrada vinda de trabalho por conta própria, com data e valor."
        },
      },
    ],
  },
  {
    slug: "ef89-a-conta-do-negocio",
    titulo: "A conta do negócio",
    subtitulo: "Custo de matéria-prima, folha, imposto — e o orçamento inteiro.",
    segmento: "ef89",
    blocoId: "ef89-bloco-f",
    blocoRotulo: "Bloco F · Renda e empreendedorismo",
    ordem: 23,
    nivel: "avancado",
    duracaoMin: 4,
    pontos: 50,
    tags: ["custos", "orcamento", "negocio"],
    thumbnail: "/trilha/renda.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-atitude-empreendedora",
    habilidades: ["EF89LF46", "EF89LF47"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Tudo que sai antes de sobrar",
        conteudo: {
          "texto": "Todo negócio tem custos, e eles não são só a matéria-prima. Entram também folha de pagamento, energia, aluguel, embalagem, transporte e impostos. Orçamento é o mapa que junta tudo isso: quanto entra, quanto sai e o que sobra. Sem esse mapa, o dono confunde faturamento com lucro e acha que está ganhando quando está perdendo.",
          "destaque": "Faturamento é o que entra. Lucro é o que sobra depois de todos os custos."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "R$ 9.000 na confecção",
        conteudo: {
          "personagem": "Sônia",
          "texto": "Sônia tem uma pequena confecção e vendeu R$ 9.000 em camisetas no mês. Os custos foram: R$ 3.200 de tecido e aviamentos, R$ 2.400 de folha de pagamento das duas costureiras, R$ 600 de aluguel do galpão, R$ 300 de energia e R$ 540 de impostos. Ela comemorou os R$ 9.000 e comprou uma máquina de R$ 2.500 à vista.",
          "pergunta": "Quanto sobrou de verdade no mês da Sônia, e a máquina de R$ 2.500 cabia nesse valor?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Fazendo a conta",
        conteudo: {
          "enunciado": "Somando todos os custos do mês da Sônia e subtraindo do que ela vendeu, quanto sobrou?",
          "alternativas": [
            {
              "id": "a",
              "texto": "R$ 9.000, porque foi o que entrou no caixa.",
              "correta": false,
              "feedback": "Esse é o faturamento, não o lucro. Ele ainda não desconta tecido, folha, aluguel, energia e imposto."
            },
            {
              "id": "b",
              "texto": "R$ 1.960, porque os custos somam R$ 7.040.",
              "correta": true,
              "feedback": "Correto: 3.200 + 2.400 + 600 + 300 + 540 = 7.040, e 9.000 − 7.040 = 1.960. A máquina de R$ 2.500 não cabia no mês."
            },
            {
              "id": "c",
              "texto": "R$ 3.400, porque só matéria-prima e folha contam como custo.",
              "correta": false,
              "feedback": "Aluguel, energia e impostos também são custos do negócio. Deixá-los de fora infla o resultado em R$ 1.440."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Seu custo fixo mensal",
        conteudo: {
          "pergunta": "Imagine um negócio pequeno que você poderia tocar. Quanto ele teria de custo fixo por mês, somando aluguel, energia, internet, transporte e salários?",
          "campo": "moeda",
          "placeholder": "R$ 1.200",
          "ajuda": "Estimativa serve. Some só o que sai todo mês, independentemente de quanto você vender."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O piso do seu orçamento",
        conteudo: {
          "texto": "Você estimou {valor} de custo fixo por mês. Esse é o valor que o negócio precisa cobrir antes de dar qualquer lucro, e ele continua existindo no mês em que as vendas caem.",
          "regras": [
            {
              "se": "valor < 500",
              "entao": "Custo fixo baixo: o negócio aguenta um mês fraco sem quebrar. Agora some matéria-prima e impostos para ter o orçamento completo."
            },
            {
              "se": "valor entre 500 e 3000",
              "entao": "Estrutura média. Divida esse valor pelo lucro de cada item vendido para saber quantas unidades você precisa vender só para empatar."
            },
            {
              "se": "valor > 3000",
              "entao": "Custo fixo alto exige volume constante de vendas. Veja o que dá para reduzir ou transformar em custo variável antes de começar."
            }
          ],
          "proximoPasso": "Liste numa folha todos os custos fixos e variáveis do negócio que você imaginou."
        },
      },
    ],
  },
  {
    slug: "ef89-vender-e-crescer",
    titulo: "Vender e crescer",
    subtitulo: "Marketing e crédito como ferramentas de um negócio.",
    segmento: "ef89",
    blocoId: "ef89-bloco-f",
    blocoRotulo: "Bloco F · Renda e empreendedorismo",
    ordem: 24,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["marketing", "publicidade", "credito"],
    thumbnail: "/trilha/renda.png",
    estadoInicial: "travado",
    // Faltava o prefixo do segmento, e o slug sem ele existe de verdade: é o
    // módulo 21 do Ensino Médio. O pré-requisito apontava para outro público —
    // aula de 8º/9º presa atrás de aula de EM, que aluno de fundamental não vê.
    destravadoPor: "ef89-a-conta-do-negocio",
    habilidades: ["EF89LF48", "EF89LF49"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Ser encontrado e ter fôlego",
        conteudo: {
          "texto": "Ter um bom produto não basta: se ninguém souber que ele existe, ninguém compra. Marketing é o trabalho de fazer o negócio ser encontrado, entendido e lembrado, da foto do produto ao preço e ao atendimento. Crédito é dinheiro emprestado com um custo, os juros. Usado para comprar máquina ou estoque que aumentam a venda, ele acelera; usado para tapar buraco, ele afunda.",
          "destaque": "Marketing traz o cliente. Crédito acelera — e cobra juros por isso."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Anúncio, freezer e parcela",
        conteudo: {
          "personagem": "Tainá",
          "texto": "Tainá vende açaí numa banca e fatura R$ 4.000 por mês. Ela gastou R$ 200 em fotos e anúncios no celular e passou a vender R$ 5.400. Animada, pensou em pegar R$ 8.000 emprestados a juros para comprar um freezer maior e atender encomendas. A parcela ficaria em R$ 780 por mês durante doze meses, e o freezer aumentaria a venda em cerca de R$ 1.500 mensais.",
          "pergunta": "Os R$ 200 em anúncio valeram a pena, e o empréstimo do freezer se paga sozinho?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "O crédito se paga?",
        conteudo: {
          "enunciado": "A parcela do freezer é R$ 780 e o aumento esperado de venda é R$ 1.500 por mês. O crédito faz sentido para Tainá?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Não, porque todo empréstimo é prejuízo.",
              "correta": false,
              "feedback": "Crédito não é bom nem ruim por si. Ele só fica caro quando não gera retorno maior que a parcela."
            },
            {
              "id": "b",
              "texto": "Sim, se o aumento de venda cobrir a parcela e ainda sobrar depois do custo do açaí extra.",
              "correta": true,
              "feedback": "R$ 1.500 de venda a mais contra R$ 780 de parcela deixa R$ 720. O crédito se sustenta se a matéria-prima extra couber nesse resto."
            },
            {
              "id": "c",
              "texto": "Sim, porque com o dinheiro na mão ela pode pagar contas atrasadas.",
              "correta": false,
              "feedback": "Usar crédito de investimento para cobrir buraco antigo mantém a dívida velha e ainda soma juros novos."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Quanto para ser encontrado",
        conteudo: {
          "pergunta": "Se você tivesse um negócio, quanto gastaria por mês para ser encontrado por clientes: anúncio, impressão, embalagem com sua marca?",
          "campo": "moeda",
          "placeholder": "R$ 150",
          "ajuda": "Estimativa serve. Pense no que cabe no mês sem depender de empréstimo."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Divulgação que se mede",
        conteudo: {
          "texto": "Você reservaria {valor} por mês para divulgação. O teste é sempre o mesmo: comparar o que entrou a mais depois do anúncio com o que foi gasto nele.",
          "regras": [
            {
              "se": "valor == 0",
              "entao": "Divulgação também acontece sem custo: boca a boca, grupo de mensagens, foto boa do produto. Sem nenhuma delas, só compra quem passa na frente."
            },
            {
              "se": "valor entre 1 e 300",
              "entao": "Valor de teste. Anuncie por um mês, anote as vendas antes e depois e só aumente se a diferença cobrir o gasto."
            },
            {
              "se": "valor > 300",
              "entao": "Investimento alto para começar. Divida em campanhas menores e meça cada uma antes de concentrar tudo em um canal só."
            }
          ],
          "proximoPasso": "Escolha um produto e escreva o anúncio dele em três linhas: o que é, para quem, quanto custa."
        },
      },
    ],
  },
  {
    slug: "ef89-dinheiro-na-mao-risco-na-rua",
    titulo: "Dinheiro na mão, risco na tela",
    subtitulo: "O que expõe você no físico e no digital.",
    segmento: "ef89",
    blocoId: "ef89-bloco-g",
    blocoRotulo: "Bloco G · Risco e proteção",
    ordem: 25,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["riscos", "dinheiro-em-especie", "pagamento-digital"],
    thumbnail: "/trilha/risco.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-vender-e-crescer",
    habilidades: ["EF89LF51", "EF89LF52"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Dois jeitos de perder",
        conteudo: {
          "texto": "Dinheiro em espécie tem riscos próprios: pode ser perdido, roubado, queimado ou simplesmente gasto sem registro, e ninguém devolve. O digital resolve parte disso e cria outros riscos: site falso, cartão clonado, senha repetida, wi-fi público, link de pagamento adulterado. Nenhuma das duas formas é segura sozinha. O que protege é a maneira como você guarda, transporta e confere cada transação.",
          "destaque": "Papel se perde sem rastro. Digital deixa rastro, mas aceita ordem de qualquer um."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Do livro em casa ao site do anúncio",
        conteudo: {
          "personagem": "Talita",
          "texto": "Talita recebeu R$ 1.200 em dinheiro vivo por um trabalho e guardou tudo dentro de um livro em casa. Duas semanas depois, faltavam R$ 300 e ninguém soube explicar. No mês seguinte, ela passou a receber por Pix. Comprou um fone num site que apareceu num anúncio, pagou R$ 250 antecipado e o produto nunca chegou. O site saiu do ar em três dias.",
          "pergunta": "Qual risco Talita correu em cada situação, e qual dos dois prejuízos tinha como ser contestado?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Espécie contra digital",
        conteudo: {
          "enunciado": "Comparando as duas perdas de Talita, o que diferencia o risco do dinheiro em espécie do risco da compra online?",
          "alternativas": [
            {
              "id": "a",
              "texto": "O dinheiro em espécie é sempre mais seguro, porque não depende de internet.",
              "correta": false,
              "feedback": "Espécie não deixa registro. Os R$ 300 que sumiram não têm comprovante, destinatário nem como contestar."
            },
            {
              "id": "b",
              "texto": "A perda em espécie não deixa rastro; a compra online deixa comprovante, o que permite contestar e denunciar.",
              "correta": true,
              "feedback": "É a diferença central. Pix e cartão registram data, valor e destinatário, então existe o que apresentar ao banco e à polícia."
            },
            {
              "id": "c",
              "texto": "Comprar online não tem risco, porque o banco devolve tudo automaticamente.",
              "correta": false,
              "feedback": "Devolução não é automática. Em compra de site falso o dinheiro pode não voltar; conferir o site antes de pagar é o que evita."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Dinheiro sem registro",
        conteudo: {
          "pergunta": "Quanto dinheiro em espécie você ou alguém da sua casa costuma carregar ou guardar sem nenhum registro?",
          "campo": "moeda",
          "placeholder": "R$ 80",
          "ajuda": "Estimativa serve. Considere só o que não tem comprovante nem anotação em lugar nenhum."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O que some sem prova",
        conteudo: {
          "texto": "Você estimou {valor} circulando sem nenhum registro. Esse é exatamente o valor que, se sumir, não tem como provar que existia.",
          "regras": [
            {
              "se": "valor < 50",
              "entao": "Pouco em espécie. O cuidado principal passa a ser digital: senha diferente por aplicativo e conferência do destinatário antes de confirmar cada pagamento."
            },
            {
              "se": "valor entre 50 e 500",
              "entao": "Vale separar o que fica em casa do que anda com você e anotar as entradas, mesmo que seja num caderno."
            },
            {
              "se": "valor > 500",
              "entao": "Guardar essa quantia em espécie concentra risco de perda e furto sem nenhuma cobertura. Depositar parte reduz o prejuízo possível."
            }
          ],
          "proximoPasso": "Confira hoje se você repete a mesma senha no banco, no e-mail e em loja online."
        },
      },
    ],
  },
  {
    slug: "ef89-golpe-nao-e-azar",
    titulo: "Golpe não é azar",
    subtitulo: "Comportamento seguro, golpes reais e seus dados pessoais.",
    segmento: "ef89",
    blocoId: "ef89-bloco-g",
    blocoRotulo: "Bloco G · Risco e proteção",
    ordem: 26,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["golpes", "fraude", "seguranca"],
    thumbnail: "/trilha/risco.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-dinheiro-na-mao-risco-na-rua",
    habilidades: ["EF89LF53", "EF89LF54", "EF89LF55"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Pressa é a ferramenta do golpe",
        conteudo: {
          "texto": "Golpe não depende de sorte: depende de pressa, medo e informação que a pessoa entrega sem perceber. Nome completo, CPF, foto de documento, código recebido por mensagem e até a rotina que você publica são dados que valem dinheiro para o golpista. Comportamento seguro é conferir por outro canal, desconfiar de urgência e nunca repassar código de verificação.",
          "destaque": "Todo golpe pede pressa. Quem confere por outro canal quebra o golpe."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A mensagem da tia",
        conteudo: {
          "personagem": "Thiago",
          "texto": "Thiago recebeu mensagem de um número desconhecido usando a foto da tia dele. A pessoa dizia ter trocado de celular e pedia um Pix urgente de R$ 480 para pagar um boleto que venceria naquela hora. Em seguida, chegou um código de seis dígitos no celular do Thiago e a mesma pessoa pediu que ele repassasse o código para confirmar a conta.",
          "pergunta": "Quais sinais mostram que é golpe, e o que acontece se Thiago mandar o código?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "O sinal decisivo",
        conteudo: {
          "enunciado": "Qual é o sinal mais forte de que a mensagem recebida por Thiago é um golpe?",
          "alternativas": [
            {
              "id": "a",
              "texto": "A pessoa usar a foto da tia dele no perfil.",
              "correta": false,
              "feedback": "Foto de perfil é pública e fácil de copiar. É indício, mas sozinha não prova nada: muita conta legítima usa foto real."
            },
            {
              "id": "b",
              "texto": "Pedir que ele repasse o código de verificação que chegou no celular dele.",
              "correta": true,
              "feedback": "Nenhum banco, aplicativo ou parente precisa desse código. Ele serve para instalar a conta do Thiago em outro aparelho: é o roubo em si."
            },
            {
              "id": "c",
              "texto": "O valor pedido ser de R$ 480.",
              "correta": false,
              "feedback": "O valor não define golpe. Golpistas costumam pedir quantias comuns justamente para não chamar atenção."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Tentativas no último mês",
        conteudo: {
          "pergunta": "Quantas tentativas de golpe por mensagem, ligação ou link você e sua família receberam no último mês?",
          "campo": "numero",
          "placeholder": "3",
          "ajuda": "Estimativa serve. Conte também as que você percebeu na hora e ignorou."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Golpe é rotina, não azar",
        conteudo: {
          "texto": "Você contou {valor} tentativas no último mês. O número mostra que golpe é rotina, não azar, e que a defesa precisa ser hábito, não reação de última hora.",
          "regras": [
            {
              "se": "valor == 0",
              "entao": "Nenhuma percebida não quer dizer nenhuma recebida. Muitas chegam disfarçadas de cobrança ou promoção; releia mensagens com link antes de clicar."
            },
            {
              "se": "valor entre 1 e 5",
              "entao": "Frequência comum hoje. Combine com sua família uma pergunta de checagem que só vocês saibam responder, para pedidos urgentes de dinheiro."
            },
            {
              "se": "valor > 5",
              "entao": "Volume alto. Além de conferir por outro canal, ative a verificação em duas etapas no aplicativo de mensagem e no do banco."
            }
          ],
          "proximoPasso": "Combine hoje com sua família uma senha verbal para confirmar qualquer pedido de dinheiro por mensagem."
        },
      },
    ],
  },
  {
    slug: "ef89-tipos-de-seguro",
    titulo: "Tipos de seguro",
    subtitulo: "O que cada seguro cobre e quando faz sentido ter.",
    segmento: "ef89",
    blocoId: "ef89-bloco-g",
    blocoRotulo: "Bloco G · Risco e proteção",
    ordem: 27,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["seguro", "protecao", "patrimonio"],
    thumbnail: "/trilha/risco.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-golpe-nao-e-azar",
    habilidades: ["EF89LF56"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Muitos pagam, poucos usam",
        conteudo: {
          "texto": "Seguro é um acordo em que muita gente paga um valor pequeno e regular, o prêmio, para que quem sofrer um prejuízo grande seja indenizado. Existem tipos diferentes: de vida, de residência, de automóvel, de celular, de acidentes pessoais e o seguro-desemprego, que é público. Cada um cobre eventos específicos, escritos na apólice, e não cobre o que está fora dela.",
          "destaque": "Seguro troca um gasto pequeno e certo por um prejuízo grande e incerto."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Moto, corpo e celular",
        conteudo: {
          "personagem": "Valdir",
          "texto": "Valdir é motoboy e vive da moto. Ele paga R$ 140 por mês no seguro do veículo e R$ 35 no seguro de acidentes pessoais. Também pensou em segurar o celular, que custou R$ 1.400, por R$ 45 mensais. Num ano, o seguro do celular sairia por R$ 540. A moto vale R$ 14.000 e é a fonte de renda dele; o celular ele consegue repor com reserva.",
          "pergunta": "Qual dos três seguros do Valdir é o mais necessário, e qual pode ficar de fora?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "O que dá para repor sozinho",
        conteudo: {
          "enunciado": "Pelo critério de proteger o que ele não conseguiria repor sozinho, qual seguro faz menos sentido para Valdir?",
          "alternativas": [
            {
              "id": "a",
              "texto": "O da moto, porque moto é fácil de consertar.",
              "correta": false,
              "feedback": "A moto vale R$ 14.000 e é a renda dele. Perdê-la sem seguro pararia o trabalho e o sustento ao mesmo tempo."
            },
            {
              "id": "b",
              "texto": "O do celular: R$ 540 por ano para um aparelho de R$ 1.400 que ele consegue repor.",
              "correta": true,
              "feedback": "Doze parcelas de R$ 45 somam R$ 540, quase 40% do valor do aparelho, e a perda cabe na reserva dele."
            },
            {
              "id": "c",
              "texto": "O de acidentes pessoais, porque ele é jovem e saudável.",
              "correta": false,
              "feedback": "Idade não evita acidente, e ele trabalha na rua o dia inteiro. Esse seguro cobre justamente a perda da capacidade de trabalhar."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "O prejuízo que mais doeria",
        conteudo: {
          "pergunta": "Qual bem ou situação da sua casa causaria o maior prejuízo se acontecesse algo hoje, e quanto custaria repor?",
          "campo": "moeda",
          "placeholder": "R$ 2.000",
          "ajuda": "Estimativa serve. Pense no que faria falta imediata e não teria como ser reposto na hora."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Vale seguro ou vale reserva",
        conteudo: {
          "texto": "Você estimou {valor} para repor o que mais faria falta. Esse número é o ponto de partida para decidir se vale ter seguro e de qual tipo.",
          "regras": [
            {
              "se": "valor < 1000",
              "entao": "Prejuízo que cabe numa reserva. Guardar aos poucos costuma sair mais barato que pagar prêmio mensal por um bem desse valor."
            },
            {
              "se": "valor entre 1000 e 10000",
              "entao": "Faixa em que vale comparar: some doze meses de prêmio e veja quanto isso representa do valor de reposição antes de decidir."
            },
            {
              "se": "valor > 10000",
              "entao": "Prejuízo difícil de absorver sozinho. É o tipo de risco para o qual o seguro existe; leia na apólice o que está coberto e o que não está."
            }
          ],
          "proximoPasso": "Pergunte em casa quais seguros já existem e o que cada apólice cobre de fato."
        },
      },
    ],
  },
  {
    slug: "ef89-renda-desigual",
    titulo: "Renda desigual, escolhas desiguais",
    subtitulo: "Como a diferença de renda muda o que cada um pode.",
    segmento: "ef89",
    blocoId: "ef89-bloco-h",
    blocoRotulo: "Bloco H · Cenário financeiro e cidadania",
    ordem: 28,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["renda", "desigualdade", "consumo"],
    thumbnail: "/trilha/cidadania.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-tipos-de-seguro",
    habilidades: ["EF89LF57", "EF89LF58"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Renda muda o campo de escolha",
        conteudo: {
          "texto": "Duas pessoas na mesma loja não têm as mesmas opções. Quem ganha pouco decide entre necessidades; quem ganha muito decide entre preferências. A renda não muda só o quanto se compra, muda o que sequer entra na lista. Isso não é falta de esforço: salário, emprego instável e preço dos itens básicos pesam mais do que escolha individual.",
          "destaque": "Renda diferente não muda só o valor da compra: muda a lista de opções possíveis."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Dois salários, o mesmo tênis",
        conteudo: {
          "personagem": "Vanessa",
          "texto": "Vanessa e uma colega ganham, cada uma, R$ 1.600 e R$ 4.200 por mês. As duas precisam de um par de tênis para trabalhar. O modelo bom custa R$ 320 e dura dois anos; o mais barato custa R$ 120 e dura seis meses. Vanessa leva o de R$ 120, porque os R$ 320 sairiam do dinheiro do mês. Em dois anos, ela terá gasto R$ 480.",
          "pergunta": "Vanessa escolheu errado, ou a renda dela decidiu antes dela?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Quem pode mudar isso",
        conteudo: {
          "enunciado": "Vanessa gastou R$ 480 em dois anos por não poder pagar R$ 320 de uma vez. Qual agente econômico pode reduzir esse tipo de diferença?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Só a própria Vanessa, com mais disciplina para poupar",
              "correta": false,
              "feedback": "Com R$ 1.600 por mês, sobrar R$ 320 de uma vez não é questão de disciplina. Culpar a pessoa esconde a causa."
            },
            {
              "id": "b",
              "texto": "O governo e as empresas, com crédito barato, salário mínimo e preço justo",
              "correta": true,
              "feedback": "Governo define regras, salário mínimo e tributos; produtores e vendedores definem preço e parcelamento. Comprador sozinho não muda esse jogo."
            },
            {
              "id": "c",
              "texto": "Ninguém: preço e renda são naturais e não se alteram",
              "correta": false,
              "feedback": "Preço e renda resultam de decisões de produtores, vendedores, trabalhadores e governo. Podem mudar."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "O preço do que estraga rápido",
        conteudo: {
          "pergunta": "Pense em um item que você usa sempre. Quanto custa a versão barata, que estraga rápido?",
          "campo": "moeda",
          "placeholder": "R$ 120",
          "ajuda": "Estimativa serve. O objetivo é comparar duração, não acertar o preço exato."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "A conta em dois anos",
        conteudo: {
          "texto": "Você estimou {valor} na versão que dura pouco. Conte quantas vezes precisaria recomprar em dois anos e compare com o preço da versão durável.",
          "regras": [
            {
              "se": "valor < 50",
              "entao": "Item barato, mas a recompra frequente soma. Verifique quantas vezes por ano você repõe esse item."
            },
            {
              "se": "valor entre 50 e 300",
              "entao": "Nessa faixa a versão durável costuma custar duas a três vezes mais e durar quatro vezes mais. Quem tem o dinheiro na hora paga menos no fim."
            },
            {
              "se": "valor > 300",
              "entao": "Acima disso quase ninguém compra à vista: entra parcelamento ou juros, o valor extra do crédito, e a diferença de renda pesa ainda mais."
            }
          ],
          "proximoPasso": "Anote por três meses quantas vezes você repõe esse item e quanto somou."
        },
      },
    ],
  },
  {
    slug: "ef89-justo-injusto-legal-ilegal",
    titulo: "Justo, injusto, legal, ilegal",
    subtitulo: "Nem tudo que é legal é justo — e o que fazer no conflito.",
    segmento: "ef89",
    blocoId: "ef89-bloco-h",
    blocoRotulo: "Bloco H · Cenário financeiro e cidadania",
    ordem: 29,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["consumidor", "direitos", "justo"],
    thumbnail: "/trilha/cidadania.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-renda-desigual",
    habilidades: ["EF89LF59", "EF89LF61"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Quatro caixas, não duas",
        conteudo: {
          "texto": "Legal é o que a lei permite. Justo é o que trata as duas partes com equilíbrio. Nem sempre andam juntas. Cobrar juros muito altos, ou seja, o valor extra pago por um empréstimo, pode ser legal e mesmo assim injusto. Vender produto vencido é ilegal e injusto. Faça as duas perguntas separadas: isso é permitido? isso é equilibrado?",
          "destaque": "Legal e justo são perguntas diferentes. Faça as duas antes de aceitar."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Oito dias e um cupom",
        conteudo: {
          "personagem": "Vera",
          "texto": "Vera comprou um fone por R$ 189 numa loja online. Chegou com defeito em oito dias. A loja respondeu que só troca em até sete dias e ofereceu um cupom de R$ 50 para nova compra. O Código de Defesa do Consumidor dá 30 dias para reclamar de defeito em produto não durável e 90 dias em produto durável, e o fornecedor tem 30 dias para consertar.",
          "pergunta": "A regra dos sete dias da loja vale mais do que a lei?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "O que a lei garante",
        conteudo: {
          "enunciado": "A loja de Vera oferece cupom de R$ 50 em vez de resolver o defeito. O que a lei garante a ela?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Nada: ela aceitou os termos da loja ao comprar",
              "correta": false,
              "feedback": "Regra de loja não reduz direito previsto em lei. Cláusula que faz isso é nula."
            },
            {
              "id": "b",
              "texto": "Conserto em até 30 dias e, se não resolver, troca, dinheiro de volta ou abatimento",
              "correta": true,
              "feedback": "É o que o Código de Defesa do Consumidor prevê para produto com defeito. Passado o prazo, quem escolhe entre as três saídas é Vera."
            },
            {
              "id": "c",
              "texto": "Só o cupom, porque a loja fez uma oferta melhor que nada",
              "correta": false,
              "feedback": "O cupom prende Vera à mesma loja e não devolve o valor. Uma oferta ser legal não a torna justa nem obrigatória."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Quando algo deu errado",
        conteudo: {
          "pergunta": "Na última vez que você ou sua família se sentiram prejudicados numa compra, o que foi feito?",
          "campo": "faixa",
          "placeholder": "Escolha a opção mais parecida",
          "faixas": [
            "Nada foi feito",
            "Reclamamos direto com a loja",
            "Reclamamos publicamente nas redes",
            "Procon ou consumidor.gov.br",
            "Nunca aconteceu"
          ],
          "ajuda": "Vale o caso de que você lembra melhor, mesmo que tenha sido há tempo."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Caminhos de reclamação",
        conteudo: {
          "texto": "Você marcou {valor}. Cada caminho tem alcance diferente: a loja resolve rápido quando quer, o registro formal cria prova e obriga resposta.",
          "regras": [
            {
              "se": "valor é 'Nada foi feito' ou 'Nunca aconteceu'",
              "entao": "Direito que não é acionado vira prejuízo silencioso. Guardar nota fiscal e print da conversa é o primeiro passo."
            },
            {
              "se": "valor é 'Reclamamos direto com a loja' ou 'Reclamamos publicamente nas redes'",
              "entao": "Funciona em muitos casos, mas depende da boa vontade da empresa. Sem solução em 30 dias, o registro formal é o próximo nível."
            },
            {
              "se": "valor é 'Procon ou consumidor.gov.br'",
              "entao": "Esse caminho gera resposta obrigatória da empresa e entra em estatística pública de reclamação, que pressiona o setor inteiro."
            }
          ],
          "proximoPasso": "Guarde nota e conversas da próxima compra online; sem prova, reclamar fica bem mais difícil."
        },
      },
    ],
  },
  {
    slug: "ef89-imposto-vira-o-que",
    titulo: "Imposto vira o quê",
    subtitulo: "Onde o tributo reaparece, e como o cidadão fiscaliza.",
    segmento: "ef89",
    blocoId: "ef89-bloco-h",
    blocoRotulo: "Bloco H · Cenário financeiro e cidadania",
    ordem: 30,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["impostos", "servicos publicos", "orcamento"],
    thumbnail: "/trilha/cidadania.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-justo-injusto-legal-ilegal",
    habilidades: ["EF89LF60", "EF89LF63"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O caminho do imposto",
        conteudo: {
          "texto": "Parte do preço de quase tudo que você compra é imposto. Esse dinheiro vai para governo municipal, estadual ou federal e volta como escola, posto de saúde, ônibus subsidiado, iluminação e coleta de lixo. Nem sempre volta bem: o orçamento é decidido por pessoas, e decisão pode ser errada ou desviada. Por isso existe portal da transparência, tribunal de contas e audiência pública.",
          "destaque": "Imposto não some: vira serviço, obra ou desvio. Dá para conferir qual dos três."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "R$ 400 embutidos",
        conteudo: {
          "personagem": "Vitória",
          "texto": "Vitória comprou um celular de R$ 1.500. Cerca de R$ 400 desse preço são tributos embutidos. Na mesma semana, ela viu que a escola do bairro está sem professor de matemática há dois meses. No portal da transparência da prefeitura, ela achou o valor previsto para educação no ano e quanto já foi executado até junho: menos da metade.",
          "pergunta": "O que Vitória pode fazer com essa informação, além de reclamar?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Cobrar de quem decide",
        conteudo: {
          "enunciado": "Vitória descobriu que a prefeitura executou menos da metade do orçamento de educação até junho. Qual atitude realmente cobra resposta?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Postar a indignação e esperar viralizar",
              "correta": false,
              "feedback": "Alcance ajuda a pressionar, mas ninguém é obrigado a responder um post. Sem canal formal, o dado se perde."
            },
            {
              "id": "b",
              "texto": "Levar o dado à audiência pública do orçamento ou à ouvidoria da prefeitura",
              "correta": true,
              "feedback": "Audiência pública e ouvidoria geram registro e exigem resposta do órgão. É a porta pela qual o cidadão entra na decisão."
            },
            {
              "id": "c",
              "texto": "Parar de comprar produtos caros para pagar menos imposto",
              "correta": false,
              "feedback": "Consumir menos não devolve o serviço nem melhora a gestão. E quase todo consumo básico já tem tributo embutido."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Quanto você paga sem ver",
        conteudo: {
          "pergunta": "Estime quanto sua família paga de imposto por mês só no que compra em mercado, transporte e conta de luz.",
          "campo": "moeda",
          "placeholder": "R$ 180",
          "ajuda": "Chute com base no gasto total: boa parte do preço de itens básicos é tributo."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O que volta para você",
        conteudo: {
          "texto": "Você estimou {valor} por mês em tributo embutido. É o que sua família financia de serviço público todo mês, mesmo sem declarar imposto de renda.",
          "regras": [
            {
              "se": "valor < 100",
              "entao": "Provavelmente está subestimado. Tributo aparece em quase todo item, inclusive energia e combustível, que puxam o preço do resto."
            },
            {
              "se": "valor entre 100 e 500",
              "entao": "Faixa comum para muitas famílias. Em um ano passa de R$ 1.200, o bastante para justificar cobrar onde esse dinheiro reaparece."
            },
            {
              "se": "valor > 500",
              "entao": "Valor alto. Quem paga tanto tem razão de acompanhar a execução do orçamento e de falar em audiência pública."
            }
          ],
          "proximoPasso": "Abra o portal da transparência da sua cidade e veja quanto foi para saúde este ano."
        },
      },
    ],
  },
  {
    slug: "ef89-quem-e-quem-no-sfn",
    titulo: "Quem é quem no sistema financeiro",
    subtitulo: "Banco Central, banco, cooperativa, financeira — e quem é confiável.",
    segmento: "ef89",
    blocoId: "ef89-bloco-h",
    blocoRotulo: "Bloco H · Cenário financeiro e cidadania",
    ordem: 31,
    nivel: "avancado",
    duracaoMin: 4,
    pontos: 50,
    tags: ["sistema financeiro", "banco central", "cooperativa"],
    thumbnail: "/trilha/cidadania.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-imposto-vira-o-que",
    habilidades: ["EF89LF62", "EF89LF65"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O mapa do sistema financeiro",
        conteudo: {
          "texto": "O Sistema Financeiro Nacional tem andares. No topo, o Banco Central autoriza, fiscaliza e cuida do valor da moeda; ele não é banco de pessoa física. Abaixo ficam bancos, cooperativas de crédito, onde o cliente é dono e vota, financeiras e instituições de pagamento, que oferecem conta, crédito e cartão. Saber quem é quem muda o que você pode exigir de cada um.",
          "destaque": "Banco Central fiscaliza; banco, cooperativa e financeira é que atendem você."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Três ofertas para Wagner",
        conteudo: {
          "personagem": "Wagner",
          "texto": "Wagner quer R$ 2.000 para consertar a moto que usa no trabalho. Três ofertas de juros, o valor extra cobrado sobre o empréstimo: o banco onde recebe salário pede 4,5% ao mês; a cooperativa de crédito do bairro pede 3,2% ao mês e exige que ele se associe; um perfil de aplicativo de mensagens promete 1% ao mês, sem consulta, mas cobra R$ 200 adiantado de garantia.",
          "pergunta": "Qual dessas três está autorizada a emprestar, e como Wagner confere isso?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Antes da taxa, a checagem",
        conteudo: {
          "enunciado": "Antes de aceitar qualquer uma das três ofertas, qual é a checagem que Wagner precisa fazer?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Escolher a menor taxa, porque 1% ao mês é o melhor negócio",
              "correta": false,
              "feedback": "Taxa muito abaixo do mercado somada a pagamento adiantado é padrão de golpe. Instituição autorizada não cobra para liberar empréstimo."
            },
            {
              "id": "b",
              "texto": "Consultar se a instituição é autorizada pelo Banco Central antes de olhar a taxa",
              "correta": true,
              "feedback": "O Banco Central mantém lista pública das instituições autorizadas. Fora dela, não há a quem reclamar depois."
            },
            {
              "id": "c",
              "texto": "Confiar no banco onde recebe salário, já que banco grande cobra sempre menos",
              "correta": false,
              "feedback": "Tamanho não define preço: aqui a cooperativa cobra 3,2% contra 4,5% do banco. E a cooperativa também é fiscalizada pelo Banco Central."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Quantas instituições",
        conteudo: {
          "pergunta": "Quantas instituições financeiras diferentes sua família usa hoje, contando banco, cooperativa, financeira e carteira digital?",
          "campo": "numero",
          "placeholder": "3",
          "ajuda": "Conte também aplicativo de pagamento que guarda saldo parado."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Sua lista para conferir",
        conteudo: {
          "texto": "Você contou {valor} instituições. Para cada uma dá para checar, em um minuto, se ela aparece na lista de autorizadas do Banco Central.",
          "regras": [
            {
              "se": "valor <= 1",
              "entao": "Poucas opções costumam significar menos comparação de tarifa e de taxa. Vale ver o que cooperativa e banco digital cobram."
            },
            {
              "se": "valor entre 2 e 4",
              "entao": "Situação comum. Confira se todas estão autorizadas e compare a tarifa de manutenção de cada conta."
            },
            {
              "se": "valor >= 5",
              "entao": "Muitas contas espalham o controle e escondem tarifa. Encerre as que não usa e acompanhe as que ficarem."
            }
          ],
          "proximoPasso": "Busque no site do Banco Central se as instituições que você usa estão autorizadas."
        },
      },
    ],
  },
  {
    slug: "ef89-fonte-confiavel",
    titulo: "Fonte confiável",
    subtitulo: "Quem fala sobre dinheiro na sua timeline — e o endividamento do país.",
    segmento: "ef89",
    blocoId: "ef89-bloco-h",
    blocoRotulo: "Bloco H · Cenário financeiro e cidadania",
    ordem: 32,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["informacao", "fontes", "endividamento"],
    thumbnail: "/trilha/cidadania.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-quem-e-quem-no-sfn",
    habilidades: ["EF89LF66", "EF89LF67"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Quem ganha com o conselho",
        conteudo: {
          "texto": "Todo conteúdo sobre dinheiro tem alguém pagando a conta. Antes de seguir uma dica, veja três coisas: quem fala tem registro e responde pelo que diz; a fonte mostra de onde tirou o número; e o que essa pessoa ganha se você seguir. Promessa de ganho certo e rápido é o sinal mais forte de que a informação não é confiável.",
          "destaque": "Antes da dica, pergunte: quem paga essa pessoa para eu ouvir isso?"
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O vídeo e o curso",
        conteudo: {
          "personagem": "Yara",
          "texto": "Yara vê um vídeo dizendo que dívida de cartão é falta de organização. Nos comentários, gente contando que a fatura estourou depois de desemprego ou de remédio caro. No Brasil, mais de 70 milhões de pessoas estão com o nome negativado, e o cartão de crédito é a maior causa. O vídeo termina indicando um curso de R$ 297 do próprio autor.",
          "pergunta": "O que enfraquece mais esse vídeo: o dado que ele usa ou o interesse de quem fala?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Conflito de interesse",
        conteudo: {
          "enunciado": "O vídeo culpa a desorganização e vende um curso de R$ 297. Por que isso pesa contra a confiabilidade dele?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Não pesa: quem cobra por conteúdo costuma ser mais qualificado",
              "correta": false,
              "feedback": "Cobrar não é problema em si, mas o autor lucra exatamente com o diagnóstico que ele mesmo deu. Isso é conflito de interesse."
            },
            {
              "id": "b",
              "texto": "Porque ignora causas como desemprego e doença e lucra com a solução que vende",
              "correta": true,
              "feedback": "Endividamento tem causa econômica e social, não só comportamento. Fonte que reduz tudo a culpa individual e vende a cura merece desconfiança."
            },
            {
              "id": "c",
              "texto": "Porque vídeo curto nunca serve para falar de dinheiro",
              "correta": false,
              "feedback": "O formato não define a qualidade. O que define é a origem do dado e o interesse de quem publica."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua timeline mostra fonte?",
        conteudo: {
          "pergunta": "Das contas que falam de dinheiro e que você acompanha, quantas mostram a fonte dos números que citam?",
          "campo": "faixa",
          "placeholder": "Escolha a opção mais parecida",
          "faixas": [
            "Nenhuma",
            "Quase nenhuma",
            "Cerca da metade",
            "A maioria",
            "Não acompanho nenhuma"
          ],
          "ajuda": "Vale olhar as três últimas publicações de cada uma antes de responder."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O filtro que você aplica",
        conteudo: {
          "texto": "Você respondeu {valor}. Fonte citada é o critério mais fácil de checar e o que mais separa informação de propaganda.",
          "regras": [
            {
              "se": "valor é 'Nenhuma' ou 'Quase nenhuma'",
              "entao": "Sua timeline entrega opinião com cara de dado. Compare qualquer número com Banco Central, IBGE ou pesquisas de inadimplência antes de usar."
            },
            {
              "se": "valor é 'Cerca da metade' ou 'A maioria'",
              "entao": "Boa base. Agora aplique o segundo critério: o que cada conta vende e se o conselho leva sempre ao produto dela."
            },
            {
              "se": "valor é 'Não acompanho nenhuma'",
              "entao": "Sem referência própria, você depende do que aparece por acaso. Escolha uma fonte pública e uma independente para comparar."
            }
          ],
          "proximoPasso": "Pegue um número sobre dinheiro que você viu esta semana e procure a fonte original."
        },
      },
    ],
  },
  {
    slug: "ef89-negocio-doacao-voluntariado",
    titulo: "Negócio novo, doação e voluntariado",
    subtitulo: "Oportunidade em cenário difícil e o dinheiro que não volta.",
    segmento: "ef89",
    blocoId: "ef89-bloco-h",
    blocoRotulo: "Bloco H · Cenário financeiro e cidadania",
    ordem: 33,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["empreendedorismo", "risco", "oportunidade"],
    thumbnail: "/trilha/cidadania.png",
    estadoInicial: "travado",
    destravadoPor: "ef89-fonte-confiavel",
    habilidades: ["EF89LF64", "EF89LF68"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Risco, oportunidade e o que não volta",
        conteudo: {
          "texto": "Cenário difícil fecha portas e abre outras. Quando a renda cai, serviço barato e conserto crescem; quando sobra dinheiro, cresce o supérfluo. Negócio novo vive dessa leitura e do risco de errar. Do lado que não busca lucro, doação e voluntariado movimentam trabalho e recurso sem retorno financeiro: sustentam creche, banco de alimentos e mutirão, e valem como parte real da economia.",
          "destaque": "Crise muda o que as pessoas compram; nem todo valor gerado passa por dinheiro."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Duas portas no bairro",
        conteudo: {
          "personagem": "Zélia",
          "texto": "No bairro de Zélia, duas lojas fecharam e o desemprego subiu. Ela pensa em dois caminhos: abrir um conserto de roupa e eletrodoméstico, com R$ 900 de máquina e ferramenta, ou entrar no mutirão que distribui marmita e precisa de quatro horas por semana. O conserto pode render R$ 600 por mês, mas leva meses para ter clientela fixa.",
          "pergunta": "São escolhas concorrentes, ou dois tipos diferentes de retorno?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Por que conserto cresce",
        conteudo: {
          "enunciado": "Por que o conserto de roupa e eletrodoméstico pode dar certo justamente num bairro com desemprego alto?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Porque em crise as pessoas compram mais coisas novas",
              "correta": false,
              "feedback": "Ocorre o contrário: com renda menor, a compra de item novo é adiada. É aí que o conserto ganha espaço."
            },
            {
              "id": "b",
              "texto": "Porque consertar sai mais barato que substituir, e a procura por reparo sobe",
              "correta": true,
              "feedback": "Renda apertada desloca o gasto para serviço barato e durabilidade. Ler esse deslocamento é identificar a oportunidade."
            },
            {
              "id": "c",
              "texto": "Porque nenhum negócio tem risco quando o serviço é barato",
              "correta": false,
              "feedback": "Risco existe sempre: R$ 900 investidos, meses sem clientela e vizinhos com pouco dinheiro para pagar."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Horas que você tem",
        conteudo: {
          "pergunta": "Quantas horas por mês você teria disponíveis para trabalho voluntário no seu bairro?",
          "campo": "numero",
          "placeholder": "8",
          "ajuda": "Pense no tempo que já sobra hoje, não no que você gostaria de ter."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Tempo também é recurso",
        conteudo: {
          "texto": "Você indicou {valor} horas por mês. Trabalho voluntário não entra no seu orçamento, mas entra no de quem recebe: hora doada substitui serviço que alguém teria de pagar.",
          "regras": [
            {
              "se": "valor == 0",
              "entao": "Tempo também é escasso, e agenda cheia é motivo legítimo. Doação de item usado cumpre papel parecido."
            },
            {
              "se": "valor entre 1 e 8",
              "entao": "Duas horas por semana já sustentam mutirão de marmita, aula de reforço ou horta comunitária."
            },
            {
              "se": "valor > 8",
              "entao": "Volume alto. Vale escolher uma iniciativa com prestação de contas pública, para o seu tempo render de fato."
            }
          ],
          "proximoPasso": "Procure uma iniciativa do seu bairro e pergunte de que ela precisa hoje."
        },
      },
    ],
  },
  {
    slug: "de-onde-veio-esse-dinheiro",
    titulo: "De onde veio esse dinheiro",
    subtitulo: "Um acordo social que já mudou muitas vezes na história.",
    segmento: "em",
    blocoId: "em-bloco-a",
    blocoRotulo: "Bloco A · Dinheiro, preço e informação",
    ordem: 1,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["confianca", "cultura", "dinheiro"],
    thumbnail: "/trilha/circulacao.png",
    estadoInicial: "disponivel",
    habilidades: ["EM13LF01", "EM13LF47"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Dinheiro é um acordo",
        conteudo: {
          "texto": "Dinheiro não tem valor por si. Uma cédula é papel; um saldo no app é um registro digital. O que sustenta os dois é um acordo coletivo: todo mundo aceita porque confia que os outros também vão aceitar. Antes das moedas, sociedades usaram sal, gado, conchas e metal. Cada formato resolveu um problema de troca e criou limites novos.",
          "destaque": "O dinheiro vale porque as pessoas combinaram que vale."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A nota na gaveta",
        conteudo: {
          "personagem": "Tarcísio",
          "texto": "Tarcísio tem 58 anos e guarda uma nota de 50 cruzados novos numa gaveta. Em 1989 ela comprava um mês de feira; hoje não compra nada, é só lembrança. No mesmo mês, ele pagou o pedreiro de casa com R$ 300 em Pix e ainda deu uma caixa de laranjas do quintal, como o pai dele fazia. As duas coisas quitaram a dívida. Só uma delas aparece em algum registro.",
          "pergunta": "O que a nota antiga perdeu, e o que a caixa de laranjas nunca teve?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Por que parou de valer",
        conteudo: {
          "enunciado": "Por que uma cédula antiga como a de Tarcísio deixou de comprar qualquer coisa?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Porque o papel dela envelheceu e se desgastou.",
              "correta": false,
              "feedback": "O estado físico não define o valor. Cédulas novas daquela mesma moeda também não compram mais nada hoje."
            },
            {
              "id": "b",
              "texto": "Porque o acordo coletivo que sustentava aquela moeda foi substituído por outro.",
              "correta": true,
              "feedback": "Exatamente. Quando a regra e a confiança mudam, o valor migra para a nova moeda e a antiga vira objeto de memória."
            },
            {
              "id": "c",
              "texto": "Porque o governo escondeu o ouro que garantia o valor dela.",
              "correta": false,
              "feedback": "Nenhuma das duas moedas era lastreada em ouro. O que muda é a regra e a aceitação das pessoas, não um estoque de metal."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Papel ou tela",
        conteudo: {
          "pergunta": "Quanto do dinheiro que passou pelas suas mãos nos últimos sete dias foi em papel, e não digital?",
          "campo": "percentual",
          "placeholder": "10%",
          "ajuda": "Estimativa serve; não precisa conferir extrato nem contar moedas."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Mesmo acordo, outros rastros",
        conteudo: {
          "texto": "Você estimou {valor} em papel. Não existe número certo aqui: a proporção muda com a região, a idade e o tipo de trabalho de cada um. O que importa é perceber que dinheiro vivo e saldo digital carregam o mesmo acordo, mas deixam rastros diferentes — em taxa, em privacidade, em prova de que o pagamento aconteceu.",
          "regras": [
            {
              "se": "valor == 0",
              "entao": "Sua vida financeira já é toda digital. Isso facilita comprovar pagamentos e concentra em poucas empresas o registro do que você compra."
            },
            {
              "se": "valor > 0 e valor <= 30",
              "entao": "É o arranjo mais comum hoje: o papel virou exceção, usado onde o digital falha, custa caro ou não é aceito."
            },
            {
              "se": "valor > 30",
              "entao": "O papel ainda pesa no seu dia a dia. Costuma indicar renda informal, comércio local ou acesso instável à internet, cada um com vantagens e riscos próprios."
            }
          ],
          "proximoPasso": "Pergunte a alguém com mais de 50 anos qual moeda ele usava aos 20."
        },
      },
    ],
  },
  {
    slug: "por-que-custa-o-que-custa",
    titulo: "Por que custa o que custa",
    subtitulo: "Preço não é custo mais um pouco. É uma disputa.",
    segmento: "em",
    blocoId: "em-bloco-a",
    blocoRotulo: "Bloco A · Dinheiro, preço e informação",
    ordem: 2,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["custos", "demanda", "lucro"],
    thumbnail: "/trilha/circulacao.png",
    estadoInicial: "travado",
    destravadoPor: "de-onde-veio-esse-dinheiro",
    habilidades: ["EM13LF02", "EM13LF04"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O preço tem camadas",
        conteudo: {
          "texto": "O preço que você paga não é o custo do produto com um pouco a mais. Ele junta custo de produção, transporte, impostos, aluguel, salários e a margem que o vendedor quer. Em cima disso, oferta e demanda empurram para os dois lados: pouca coisa e muita gente procurando sobe; estoque parado desce. Publicidade e marca também entram na conta.",
          "destaque": "Custo é o que o vendedor gasta. Preço é o que ele consegue cobrar."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O bolo de pote da Késia",
        conteudo: {
          "personagem": "Késia",
          "texto": "Késia tem 24 anos e vende bolo de pote na saída da faculdade. Cada pote custa R$ 4,20 em ingredientes e embalagem, e ela gasta R$ 60 por semana com transporte e gás. Vende a R$ 12 e escoa 90 potes por semana. Uma concorrente abriu do lado cobrando R$ 9. Késia pensa em baixar para R$ 9,50, mas aí a margem de cada pote cai quase pela metade.",
          "pergunta": "Baixar o preço para acompanhar a concorrente vale a pena para Késia?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "A conta de baixar o preço",
        conteudo: {
          "enunciado": "Com 90 potes por semana, o que acontece com o lucro de Késia se ela baixar de R$ 12 para R$ 9,50?",
          "alternativas": [
            {
              "id": "a",
              "texto": "O lucro cai de R$ 642 para R$ 417 por semana, a menos que ela venda mais.",
              "correta": true,
              "feedback": "Isso. A margem por pote cai de R$ 7,80 para R$ 5,30; para manter o mesmo lucro ela precisaria vender cerca de 133 potes."
            },
            {
              "id": "b",
              "texto": "O lucro fica igual, porque o custo de cada pote não mudou.",
              "correta": false,
              "feedback": "O custo não muda, mas quem absorve a diferença é a margem. São R$ 2,50 a menos por pote, ou R$ 225 por semana."
            },
            {
              "id": "c",
              "texto": "Ela passa a ter prejuízo, porque o preço fica abaixo do custo.",
              "correta": false,
              "feedback": "R$ 9,50 ainda cobre os R$ 4,20 de custo e as despesas fixas da semana. Continua havendo lucro, só que bem menor."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Quanto é custo",
        conteudo: {
          "pergunta": "Pense na última coisa que você comprou. Que fatia do preço você acha que foi custo do vendedor?",
          "campo": "percentual",
          "placeholder": "60%",
          "ajuda": "É um palpite: ninguém sabe a planilha do outro de cabeça."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Margem à vista",
        conteudo: {
          "texto": "Você chutou {valor} de custo. No varejo comum, a mercadoria costuma ficar entre 50% e 70% do preço, e o resto paga aluguel, impostos, salários, perdas e o lucro de quem vende. Quem compra quer que essa fatia seja alta; quem vende precisa que sobre. Saber que existe margem é o que permite comparar, questionar e negociar.",
          "regras": [
            {
              "se": "valor < 40",
              "entao": "Você imagina uma margem enorme. Ela existe em setores como cosméticos e moda de marca, mas é exceção, não regra."
            },
            {
              "se": "valor >= 40 e valor <= 75",
              "entao": "Está na faixa mais comum do comércio. Nela, uma queda de 10% no preço pode derrubar o lucro em muito mais que 10%."
            },
            {
              "se": "valor > 75",
              "entao": "Você vê pouca folga para o vendedor. Em produtos de giro rápido isso é realista; se você achar que é sempre assim, investigue por que o mesmo item varia tanto entre lojas."
            }
          ],
          "proximoPasso": "Compare o mesmo produto em três lojas e liste o que explica a diferença."
        },
      },
    ],
  },
  {
    slug: "ler-antes-de-assinar",
    titulo: "Ler antes de assinar",
    subtitulo: "Fatura, contrato e boleto dizem mais do que parecem.",
    segmento: "em",
    blocoId: "em-bloco-a",
    blocoRotulo: "Bloco A · Dinheiro, preço e informação",
    ordem: 3,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["consumidor", "contrato", "direitos"],
    thumbnail: "/trilha/circulacao.png",
    estadoInicial: "travado",
    destravadoPor: "por-que-custa-o-que-custa",
    habilidades: ["EM13LF06", "EM13LF42"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Onde mora a informação",
        conteudo: {
          "texto": "Todo documento financeiro tem um lugar fixo onde a informação que importa aparece. Na fatura do cartão: total, vencimento, encargos e a linha de cada compra. No contrato: prazo, multa por cancelamento, reajuste e o que está fora da cobertura. No boleto: o beneficiário e o valor após o vencimento. Ler é conferir se esses campos batem com o que foi combinado.",
          "destaque": "Assinar sem ler não anula seus direitos, mas dificulta muito provar."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A fatura que cresceu",
        conteudo: {
          "personagem": "Wellington",
          "texto": "Wellington tem 31 anos e assinou um plano de internet por R$ 99,90 ao mês. Na terceira fatura veio R$ 137,40: R$ 99,90 do plano, R$ 24,90 de um pacote de antivírus que ele não pediu e R$ 12,60 de taxa de instalação parcelada. O contrato, na cláusula 8, diz que serviços adicionais dependem de aceite expresso. Ele guardou o e-mail da contratação, sem nenhuma menção ao antivírus.",
          "pergunta": "O que Wellington deve fazer antes de simplesmente pagar a fatura inteira?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Contestar do jeito certo",
        conteudo: {
          "enunciado": "Diante da cobrança do antivírus que não pediu, qual é a atitude que mais protege Wellington?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Não pagar nada até a empresa resolver, já que a cobrança está errada.",
              "correta": false,
              "feedback": "Deixar a fatura inteira vencer gera juros e negativação sobre a parte que ele realmente deve. Contestar não suspende o que foi contratado."
            },
            {
              "id": "b",
              "texto": "Pagar o valor que reconhece, abrir reclamação com protocolo e guardar contrato e e-mail.",
              "correta": true,
              "feedback": "Isso o mantém em dia com o que contratou e cria a prova documental que sustenta o pedido de estorno da cobrança indevida."
            },
            {
              "id": "c",
              "texto": "Pagar tudo agora e reclamar depois, porque contestar antes é considerado calote.",
              "correta": false,
              "feedback": "Contestar cobrança indevida é um direito, não calote. Pagar tudo sem registrar a contestação dificulta a devolução depois."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Você lê o que assina?",
        conteudo: {
          "pergunta": "Quantos dos documentos financeiros que você recebeu no último mês você abriu e leu até o fim?",
          "campo": "faixa",
          "placeholder": "Um ou dois",
          "faixas": [
            "Nenhum",
            "Um ou dois",
            "Metade",
            "Quase todos",
            "Todos"
          ],
          "ajuda": "Vale a impressão geral; não precisa conferir a caixa de entrada."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Checagem de dois minutos",
        conteudo: {
          "texto": "Você respondeu {valor}. Ler tudo, sempre, não é realista. O que funciona é uma checagem curta e fixa: valor total, vencimento, cobranças que você não reconhece e o que mudou desde o mês passado. Menos de dois minutos por documento já resolve a maior parte dos casos, e o registro de uma contestação vale mais do que a sua memória.",
          "regras": [
            {
              "se": "valor == 'Nenhum' ou valor == 'Um ou dois'",
              "entao": "Cobranças pequenas e recorrentes passam despercebidas justamente aí. Comece pela fatura de maior valor do mês."
            },
            {
              "se": "valor == 'Metade' ou valor == 'Quase todos'",
              "entao": "O hábito já existe. Falta padronizar: sempre os mesmos quatro campos, sempre no mesmo dia do mês."
            },
            {
              "se": "valor == 'Todos'",
              "entao": "Leitura completa é raro. O passo seguinte é guardar contrato, protocolo e comprovante no mesmo lugar, para o dia em que precisar provar algo."
            }
          ],
          "proximoPasso": "Abra a última fatura e procure uma cobrança que você não sabe explicar."
        },
      },
    ],
  },
  {
    slug: "fonte-confiavel",
    titulo: "Fonte confiável (e a sua opinião)",
    subtitulo: "Checar quem regula, depois escrever o que você concluiu.",
    segmento: "em",
    blocoId: "em-bloco-a",
    blocoRotulo: "Bloco A · Dinheiro, preço e informação",
    ordem: 4,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["checagem", "fontes", "opiniao"],
    thumbnail: "/trilha/cidadania.png",
    estadoInicial: "travado",
    destravadoPor: "ler-antes-de-assinar",
    habilidades: ["EM13LF45", "EM13LF05"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Quem responde por quê",
        conteudo: {
          "texto": "Cada parte do sistema financeiro tem um órgão que registra e fiscaliza quem pode operar. Banco Central: bancos, cooperativas e instituições de pagamento. CVM: fundos, corretoras e quem oferece investimento. Susep: seguros e capitalização. Previc: fundos de pensão fechados. Antes de acreditar em qualquer promessa, dá para procurar o nome da empresa no site do órgão certo e ver se ela existe ali.",
          "destaque": "Registro no regulador não garante ganho. Garante que existe a quem reclamar."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Três fontes, três versões",
        conteudo: {
          "personagem": "Nayara",
          "texto": "Nayara tem 17 anos e precisa escrever um texto de opinião sobre uma empresa que promete render 4% ao mês. Ela acha três fontes: um vídeo com 800 mil visualizações, uma matéria de jornal com o nome do CEO e uma consulta no site do Banco Central, onde a empresa não aparece em nenhuma lista de instituições autorizadas. As três dizem coisas diferentes sobre a mesma empresa.",
          "pergunta": "Qual dessas fontes ela deve colocar no centro do texto dela?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Cada um no seu órgão",
        conteudo: {
          "enunciado": "Nayara vai investigar também um seguro de celular e um fundo de investimento. Onde ela confere cada um?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Banco Central para os dois, porque ele regula todo o sistema financeiro.",
              "correta": false,
              "feedback": "O Banco Central cuida de bancos, cooperativas e meios de pagamento. Seguro e fundo têm reguladores próprios."
            },
            {
              "id": "b",
              "texto": "Susep para o seguro e CVM para o fundo de investimento.",
              "correta": true,
              "feedback": "Cada um no seu órgão: a Susep supervisiona seguros e capitalização, e a CVM supervisiona fundos e quem os distribui."
            },
            {
              "id": "c",
              "texto": "Procon para os dois, já que envolvem contratos com consumidores.",
              "correta": false,
              "feedback": "O Procon atua no conflito de consumo, mas não autoriza nem registra essas empresas. A autorização vem do regulador do setor."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua primeira frase",
        conteudo: {
          "pergunta": "Escreva a frase de abertura de um texto seu sobre uma promessa financeira que você já viu.",
          "campo": "texto",
          "placeholder": "Vi um anúncio que promete dobrar o dinheiro em 60 dias.",
          "ajuda": "Uma frase basta; é rascunho, não precisa estar pronta para publicar."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Do palpite ao argumento",
        conteudo: {
          "texto": "Sua abertura: {valor}. Um texto de opinião sustenta uma tese com evidência verificável. A estrutura mínima é: o que foi prometido, quem é a empresa, o que o regulador do setor mostra sobre ela e o que você conclui a partir disso. Sem a terceira parte, o texto vira palpite; com ela, vira argumento que outra pessoa consegue conferir.",
          "regras": [
            {
              "se": "valor tem menos de 4 palavras",
              "entao": "Curto demais para virar texto. Acrescente o que foi prometido e para quem, antes de opinar."
            },
            {
              "se": "valor cita empresa, produto ou número específico",
              "entao": "Boa base: dá para checar. Leve esse nome ao site do regulador do setor e escreva o que encontrou, inclusive se não encontrou nada."
            },
            {
              "se": "valor é genérico, sem nome nem número",
              "entao": "Falta o gancho verificável. Troque 'um site prometia muito' pelo nome exato e pela taxa anunciada."
            }
          ],
          "proximoPasso": "Procure o nome de uma empresa financeira no site do Banco Central hoje."
        },
      },
    ],
  },
  {
    slug: "escolher-e-abrir-mao",
    titulo: "Escolher é abrir mão",
    subtitulo: "Custo de oportunidade, tempo e o efeito da inflação",
    segmento: "em",
    blocoId: "em-bloco-b",
    blocoRotulo: "Bloco B · Planejamento e consumo",
    ordem: 5,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["custo oportunidade", "escolhas", "inflacao"],
    thumbnail: "/trilha/orcamento.png",
    estadoInicial: "travado",
    destravadoPor: "fonte-confiavel",
    habilidades: ["EM13LF07", "EM13LF10"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O preço do que você não escolhe",
        conteudo: {
          "texto": "Toda escolha financeira tem um preço escondido: o que você deixa de fazer com o mesmo dinheiro. Isso é custo de oportunidade. Ele aparece no tempo — gastar hoje ou daqui a seis meses muda o que aquele valor compra — e no calendário: material escolar em janeiro, passagem em julho. Quem enxerga o que abre mão escolhe com mais informação.",
          "destaque": "Não existe escolha grátis: sempre há uma segunda opção que fica para trás."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Notebook agora ou em março",
        conteudo: {
          "personagem": "Rafaela",
          "texto": "Rafaela, 19 anos, juntou R$ 900 fazendo freelas de edição de vídeo. Ela quer um notebook usado por R$ 900 agora, em dezembro, quando o preço sobe com a demanda de fim de ano. Em março, o mesmo modelo costuma sair por R$ 750. Só que sem o notebook ela recusa dois trabalhos de R$ 200 cada até lá. Esperar economiza R$ 150 e custa R$ 400 de renda.",
          "pergunta": "O desconto de março compensa a renda que ela deixa de ganhar até lá?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Quem sente mais a inflação",
        conteudo: {
          "enunciado": "A inflação de um ano ficou em 5%, puxada por alimentos e transporte. Qual família sente mais o aperto?",
          "alternativas": [
            {
              "id": "a",
              "texto": "A que gasta quase toda a renda com comida e ônibus",
              "correta": true,
              "feedback": "Quando quase toda a renda vai para itens que subiram, não há de onde cortar. A mesma inflação pesa mais em quem gasta tudo com o essencial."
            },
            {
              "id": "b",
              "texto": "A de renda mais alta, porque paga mais imposto",
              "correta": false,
              "feedback": "Imposto não é o ponto aqui. Renda mais alta tem folga para trocar marcas, adiar compras ou usar reservas, e a alta de preços morde menos."
            },
            {
              "id": "c",
              "texto": "Todas igualmente, porque o índice é o mesmo para o país",
              "correta": false,
              "feedback": "O índice é uma média. A cesta de cada família é diferente, e quem consome mais do que subiu perde mais poder de compra."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "A compra que dá para adiar",
        conteudo: {
          "pergunta": "Pense em uma compra que você faria neste mês e que dá para adiar. Quanto ela custa?",
          "campo": "moeda",
          "placeholder": "R$ 320",
          "ajuda": "Uma estimativa de cabeça basta; não precisa conferir o preço exato."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O que ficou de fora",
        conteudo: {
          "texto": "Adiar essa compra de {valor} não é só guardar dinheiro. É comparar duas coisas: o que ela resolve hoje e o que o mesmo valor resolve daqui a alguns meses, já contando que preços mudam. A sazonalidade ajuda quem consegue esperar, e a inflação cobra de quem não consegue. A decisão muda conforme a folga que você tem.",
          "regras": [
            {
              "se": "valor < 100",
              "entao": "Valor pequeno, decisão rápida. Ainda assim, vale a pergunta: em três meses, esse dinheiro faria mais por você em outro lugar?"
            },
            {
              "se": "valor entre 100 e 500",
              "entao": "Nessa faixa o calendário conta. Muitos itens caem de preço fora da alta temporada, e a espera costuma valer mais que o desconto de hoje."
            },
            {
              "se": "valor > 500",
              "entao": "Acima disso o custo de oportunidade fica visível: esse valor é reserva para imprevisto, um curso ou várias contas do mês. Escreva as duas alternativas antes de decidir."
            }
          ],
          "proximoPasso": "Anote o preço dessa compra hoje e confira o mesmo item daqui a 30 dias."
        },
      },
    ],
  },
  {
    slug: "seu-orcamento-em-uma-tela",
    titulo: "Seu orçamento em uma tela",
    subtitulo: "Monte um orçamento que aguenta o imprevisto",
    segmento: "em",
    blocoId: "em-bloco-b",
    blocoRotulo: "Bloco B · Planejamento e consumo",
    ordem: 6,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["despesas fixas", "imprevistos", "orcamento"],
    thumbnail: "/trilha/orcamento.png",
    estadoInicial: "travado",
    destravadoPor: "escolher-e-abrir-mao",
    habilidades: ["EM13LF08"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "As três colunas do mês",
        conteudo: {
          "texto": "Orçamento é uma folha com três colunas: o que entra, o que sai sempre e o que sai às vezes. Gastos fixos repetem — aluguel, transporte, assinatura. Variáveis oscilam — comida fora, presentes, farmácia. E existem os imprevistos, que ninguém agenda mas todo mês aparecem. Orçamento não é previsão perfeita: é ter o número na frente antes de decidir.",
          "destaque": "Quem não escreve o orçamento acredita que sobra mais do que sobra."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A sobra que sumia",
        conteudo: {
          "personagem": "Everton",
          "texto": "Everton, 34 anos, recebe R$ 3.200 por mês e mora com a filha. Fixos: aluguel R$ 1.100, transporte R$ 280, internet e celular R$ 160, escola R$ 300. Variáveis, na média: mercado R$ 700, farmácia e lazer R$ 250. No papel sobram R$ 410. Só que em quatro dos últimos seis meses apareceu algo fora da conta — dentista, pneu, uniforme — entre R$ 200 e R$ 500.",
          "pergunta": "Se o imprevisto acontece quase todo mês, ele ainda pode ficar fora do orçamento?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Onde está o furo",
        conteudo: {
          "enunciado": "Everton quer que a sobra pare de sumir. Qual mudança resolve melhor o problema dele?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Cortar o lazer de R$ 250 até zerar esse gasto",
              "correta": false,
              "feedback": "Corte total costuma durar poucas semanas e não cobre o imprevisto do mês seguinte. O problema não é o lazer, é a linha que falta no orçamento."
            },
            {
              "id": "b",
              "texto": "Criar uma linha mensal de imprevistos, separada da sobra",
              "correta": true,
              "feedback": "Se o inesperado aparece em quatro de cada seis meses, ele é previsível o bastante para virar linha do orçamento. Aí a sobra vira sobra de verdade."
            },
            {
              "id": "c",
              "texto": "Esperar o mês fechar e usar o cartão quando faltar",
              "correta": false,
              "feedback": "Isso empurra o problema para frente com juros junto. O gasto não some, só chega maior no mês seguinte."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Monte a sua conta",
        conteudo: {
          "pergunta": "Monte a conta: tudo que entra no mês, menos os gastos fixos e a média dos variáveis. Quanto sobra?",
          "campo": "moeda",
          "placeholder": "R$ 240",
          "ajuda": "Estimativa serve: use números redondos e a média dos últimos meses."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Sua sobra real",
        conteudo: {
          "texto": "Sua sobra estimada é {valor}. Esse número é o orçamento funcionando: ele mostra quanto do mês já está comprometido antes de qualquer decisão. A sobra só é real quando os imprevistos têm linha própria e as despesas variáveis são a média dos últimos meses, não o melhor mês. Refaça a conta quando a renda ou um gasto fixo mudar.",
          "regras": [
            {
              "se": "valor < 0",
              "entao": "O mês fecha no vermelho antes de qualquer imprevisto. A saída passa por cortar ou renegociar um gasto fixo, não por apertar os variáveis por algumas semanas."
            },
            {
              "se": "valor entre 0 e 300",
              "entao": "A sobra existe, mas um imprevisto médio consome ela inteira. Separar uma parte fixa por mês para o inesperado evita que a sobra vire dívida."
            },
            {
              "se": "valor > 300",
              "entao": "Com essa folga dá para dividir a sobra em destinos: imprevisto, objetivo de curto prazo e uso livre. Sobra sem destino tende a sumir."
            }
          ],
          "proximoPasso": "Escreva num papel só as três linhas: entra, fixo e variável médio."
        },
      },
    ],
  },
  {
    slug: "preco-justo",
    titulo: "Preço justo: pesquisar e negociar",
    subtitulo: "Compare o custo total e peça o desconto que existe",
    segmento: "em",
    blocoId: "em-bloco-b",
    blocoRotulo: "Bloco B · Planejamento e consumo",
    ordem: 7,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["consumo", "custo total", "negociacao"],
    thumbnail: "/trilha/consumo.png",
    estadoInicial: "travado",
    destravadoPor: "seu-orcamento-em-uma-tela",
    habilidades: ["EM13LF11", "EM13LF12"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Preço não é só a etiqueta",
        conteudo: {
          "texto": "Preço justo não é o menor número da tela. É o menor custo total para o que você precisa, no prazo que você precisa. Some frete, taxa de entrega, juros do parcelamento, garantia e o custo de esperar quinze dias. Pesquisar é comparar três ofertas na mesma base. Negociar é pedir — desconto à vista, frete grátis, prazo menor — sabendo o que você aceita.",
          "destaque": "Compare custo total e prazo, não a etiqueta."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Três ofertas, uma decisão",
        conteudo: {
          "personagem": "Iasmin",
          "texto": "Iasmin, 22 anos, precisa de uma bicicleta para ir ao trabalho e parar de gastar R$ 180 por mês em transporte. Loja A: R$ 1.400 à vista, retirada hoje. Loja B: R$ 1.290, frete R$ 90, entrega em 20 dias. Site C: R$ 1.180 à vista ou 10x de R$ 138, entrega em 12 dias, sem loja física para garantia. Ela tem R$ 1.500 guardados.",
          "pergunta": "Qual oferta custa menos de verdade, considerando frete, juros e dias de espera?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Como se pede desconto",
        conteudo: {
          "enunciado": "Iasmin liga para a loja A e quer negociar. Qual pedido tem mais chance de funcionar?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Dizer que só compra se derem 40% de desconto",
              "correta": false,
              "feedback": "Pedido sem base e fora da margem da loja costuma encerrar a conversa. Negociação precisa de um número que o outro lado consiga aceitar."
            },
            {
              "id": "b",
              "texto": "Mostrar o preço da concorrente e pedir R$ 1.290 à vista, levando hoje",
              "correta": true,
              "feedback": "Negociação funciona com informação e contrapartida: você traz um preço real de mercado e oferece pagamento imediato, que reduz custo e risco para a loja."
            },
            {
              "id": "c",
              "texto": "Aceitar o preço da etiqueta, porque desconto só existe em data promocional",
              "correta": false,
              "feedback": "Em compras de valor maior, à vista ou em lojas com margem, pedir é comum. Não perguntar é abrir mão de um desconto que já existia."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua última pesquisa",
        conteudo: {
          "pergunta": "Na sua última compra acima de R$ 200, em quantos lugares diferentes você comparou o preço?",
          "campo": "numero",
          "placeholder": "3",
          "ajuda": "Vale o número aproximado; precisão não é exigida aqui."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O que a pesquisa te dá",
        conteudo: {
          "texto": "Você comparou preços em {valor} lugares. Três é um bom piso: com menos, não dá para saber se o preço é bom ou só familiar. Comparar custa alguns minutos e costuma valer entre 5% e 20% do valor da compra. E o resultado da pesquisa é a sua carta na hora de negociar: sem ele você pede desconto, com ele você propõe um preço.",
          "regras": [
            {
              "se": "valor <= 1",
              "entao": "Sem comparação, o preço pago foi o primeiro que apareceu. Abrir mais duas abas é o passo com maior retorno por minuto gasto."
            },
            {
              "se": "valor == 2",
              "entao": "Duas ofertas mostram uma diferença, mas não mostram a faixa de preço do item. A terceira é que revela se a barata é barata mesmo."
            },
            {
              "se": "valor >= 3",
              "entao": "Boa base de comparação. O próximo ganho vem de padronizar a conta: preço mais frete, mais juros do parcelamento, mais custo do prazo de entrega."
            }
          ],
          "proximoPasso": "Antes da próxima compra, abra três ofertas e some frete, juros e prazo."
        },
      },
    ],
  },
  {
    slug: "o-que-te-faz-comprar",
    titulo: "O que te faz comprar",
    subtitulo: "Influência, publicidade e o custo do que você compra",
    segmento: "em",
    blocoId: "em-bloco-b",
    blocoRotulo: "Bloco B · Planejamento e consumo",
    ordem: 8,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["consumo", "etica", "impacto ambiental"],
    thumbnail: "/trilha/consumo.png",
    estadoInicial: "travado",
    destravadoPor: "preco-justo",
    habilidades: ["EM13LF13", "EM13LF09"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "De quem veio essa vontade",
        conteudo: {
          "texto": "Nem toda compra começa numa necessidade. Começa num story, num amigo com o modelo novo, numa data que a publicidade inventou. Esses empurrões não são errados — são invisíveis, e é isso que os torna caros. Ao lado deles existe outra conta: quem produziu, em que condições, quanto o produto dura e o que acontece com ele quando você enjoar.",
          "destaque": "A pergunta não é \"eu quero?\", é \"de quem veio essa vontade?\"."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Tênis, grupo e curso",
        conteudo: {
          "personagem": "Caio",
          "texto": "Caio, 17 anos, juntou R$ 700 de trabalho no fim de semana para um curso de inglês. Aí três amigos compraram o mesmo tênis de R$ 650, lançamento com campanha grande, e o grupo não fala de outra coisa. Ele leu que a marca responde a processos por condições de trabalho na fábrica. O tênis dura, em média, um ano. O curso, ele já adiou duas vezes.",
          "pergunta": "O que decide aqui: o plano dele, o grupo ou a campanha?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Prós e contras de verdade",
        conteudo: {
          "enunciado": "Caio quer decidir sem se enganar. Qual método pesa melhor os prós e contras dessa compra?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Listar preço e condição de pagamento, porque o resto é opinião",
              "correta": false,
              "feedback": "Preço e prazo são metade da conta. Ficam de fora o uso real, a durabilidade, o impacto social e ambiental e o plano que a compra atrasa."
            },
            {
              "id": "b",
              "texto": "Perguntar aos amigos se o tênis vale a pena",
              "correta": false,
              "feedback": "O grupo é justamente uma das forças que criou a vontade. Consultá-lo tende a confirmar a decisão em vez de testá-la."
            },
            {
              "id": "c",
              "texto": "Esperar 72 horas e reler o objetivo daquele dinheiro antes de decidir",
              "correta": true,
              "feedback": "O intervalo separa desejo de impulso, e o objetivo escrito devolve a comparação: curso ou tênis. A conta passa a incluir o que o dinheiro já tinha para fazer."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Compras fora do plano",
        conteudo: {
          "pergunta": "Nos últimos 30 dias, quanto você gastou em compras que não estavam no seu plano?",
          "campo": "faixa",
          "placeholder": "R$ 50 a R$ 200",
          "faixas": [
            "Nada",
            "Até R$ 50",
            "R$ 50 a R$ 200",
            "R$ 200 a R$ 500",
            "Mais de R$ 500"
          ],
          "ajuda": "Escolha a faixa mais próxima; estimativa serve, não precisa somar recibo por recibo."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O custo de não perceber",
        conteudo: {
          "texto": "{valor} em compras fora do plano é o preço de um mês de influência: grupo, campanha, data comercial. Não é sobre culpa, é sobre saber quanto custa não perceber. A cada compra, três perguntas dão conta do recado: de onde veio a vontade, quem paga o custo social e ambiental disso, e o que esse dinheiro deixaria de fazer.",
          "regras": [
            {
              "se": "valor == \"Nada\"",
              "entao": "Mês sem desvio costuma significar plano claro ou pouca exposição a gatilho. Vale conferir se foi controle ou só um mês sem lançamento e promoção."
            },
            {
              "se": "valor entre \"Até R$ 50\" e \"R$ 50 a R$ 200\"",
              "entao": "Faixa comum e administrável. O risco não é o valor do mês, é ele se repetir doze vezes sem nunca entrar na conta."
            },
            {
              "se": "valor acima de \"R$ 200 a R$ 500\"",
              "entao": "Nessa faixa, o gasto fora do plano já concorre com um objetivo inteiro. Vale mapear onde a compra começou: anúncio, grupo, aplicativo ou data comercial."
            }
          ],
          "proximoPasso": "Escolha uma compra pendente e espere 72 horas antes de decidir."
        },
      },
    ],
  },
  {
    slug: "poupar-tem-um-porque",
    titulo: "Poupar tem um porquê",
    subtitulo: "Objetivo primeiro, prazo depois, produto por último.",
    segmento: "em",
    blocoId: "em-bloco-c",
    blocoRotulo: "Bloco C · Poupança e investimento",
    ordem: 9,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["aposta", "objetivo", "poupanca"],
    thumbnail: "/trilha/poupar.png",
    estadoInicial: "travado",
    destravadoPor: "o-que-te-faz-comprar",
    habilidades: ["EM13LF14", "EM13LF21"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Poupar não é sobrar",
        conteudo: {
          "texto": "Poupar sem destino vira dinheiro parado que some no primeiro imprevisto. Quem poupa com objetivo define três coisas antes de escolher onde guardar: para quê, quanto e até quando. Um curso no fim do ano é curto prazo. Trocar de moradia em três anos é médio. Parar de depender de renda um dia é longo. O prazo é o que muda a escolha, não o contrário.",
          "destaque": "Sem prazo definido, qualquer aplicação parece boa e nenhuma serve."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Duas metas e um atalho",
        conteudo: {
          "personagem": "Renata",
          "texto": "Renata tem 24 anos e faz freelas de edição de vídeo. Guardou R$ 3.200 e tem dois planos: um notebook novo daqui a seis meses, por volta de R$ 4.000, e uma viagem em três anos. Um conhecido diz que ela dobra esse valor num fim de semana apostando em jogos online. Ele mostra um print de ganho. Não mostra as outras dez apostas da semana.",
          "pergunta": "O dinheiro dos dois planos deve ficar no mesmo lugar? E a proposta do conhecido?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Investir ou apostar",
        conteudo: {
          "enunciado": "Qual critério separa investir de apostar, independentemente de quanto cada um pode render?",
          "alternativas": [
            {
              "id": "a",
              "texto": "O valor envolvido: aposta é com pouco dinheiro, investimento é com muito.",
              "correta": false,
              "feedback": "O valor não muda a natureza da operação. Dá para apostar alto e investir pouco no mesmo dia."
            },
            {
              "id": "b",
              "texto": "A origem do retorno: investimento remunera capital emprestado ou produtivo; aposta paga com a perda de outro apostador.",
              "correta": true,
              "feedback": "Investir compra um direito sobre juros, lucros ou aluguéis. Na aposta, o ganho de um só existe porque outros perderam."
            },
            {
              "id": "c",
              "texto": "O tempo: aposta é rápida, investimento é lento.",
              "correta": false,
              "feedback": "Existe aplicação com resgate no mesmo dia e aposta que leva meses para ser liquidada. Prazo não define a diferença."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua meta mais próxima",
        conteudo: {
          "pergunta": "Em quantos meses você quer ter o dinheiro do seu objetivo mais próximo na mão?",
          "campo": "numero",
          "placeholder": "18",
          "ajuda": "Uma estimativa basta; o número aproximado já muda a escolha."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O prazo escolhe por você",
        conteudo: {
          "texto": "Você marcou {valor} meses. Esse número é o primeiro filtro: ele elimina metade das opções antes de você olhar qualquer rendimento. Quanto mais perto o objetivo, menos você pode aceitar oscilação; quanto mais longe, mais o tempo trabalha a seu favor. E nada disso vale se o dinheiro estiver numa aposta, onde não existe prazo, só sorte.",
          "regras": [
            {
              "se": "valor <= 12",
              "entao": "Curto prazo: o critério principal é poder sacar sem perder valor. Rendimento alto com resgate incerto não serve aqui."
            },
            {
              "se": "valor > 12 e valor <= 60",
              "entao": "Médio prazo: dá para aceitar alguma oscilação, desde que a data-alvo tenha folga de alguns meses."
            },
            {
              "se": "valor > 60",
              "entao": "Longo prazo: aqui o inimigo é a inflação, não a oscilação de um mês. Reveja a meta uma vez por ano."
            }
          ],
          "proximoPasso": "Escreva no celular o objetivo, o valor e a data. Sem os três, não é meta."
        },
      },
    ],
  },
  {
    slug: "risco-retorno-liquidez",
    titulo: "Risco, retorno e liquidez",
    subtitulo: "Três variáveis que se puxam: nunca as três no máximo.",
    segmento: "em",
    blocoId: "em-bloco-c",
    blocoRotulo: "Bloco C · Poupança e investimento",
    ordem: 10,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["diversificacao", "liquidez", "prazo"],
    thumbnail: "/trilha/poupar.png",
    estadoInicial: "travado",
    destravadoPor: "poupar-tem-um-porque",
    habilidades: ["EM13LF17", "EM13LF18"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O triângulo da escolha",
        conteudo: {
          "texto": "Toda aplicação responde a três perguntas. Risco: qual a chance de eu receber menos do que esperava? Retorno: quanto ela promete render? Liquidez: em quanto tempo eu transformo isso em dinheiro na conta sem perder valor? As três se puxam. Retorno alto costuma vir com risco alto ou com liquidez baixa. Quem oferece as três no máximo está escondendo alguma coisa.",
          "destaque": "Risco, retorno e liquidez: você escolhe duas e negocia a terceira."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Tudo no mesmo lugar",
        conteudo: {
          "personagem": "Cauã",
          "texto": "Cauã tem 31 anos e trabalha como técnico de refrigeração. Juntou R$ 12.000 e colocou tudo em um único ativo indicado num grupo de mensagens, com resgate só depois de dois anos. No terceiro mês, a geladeira de casa queimou e o aluguel subiu. Ele precisava de R$ 2.000 e não conseguiu tirar. No papel, o rendimento era ótimo. O dinheiro existia, mas não estava disponível.",
          "pergunta": "O problema foi o rendimento, o prazo de resgate ou ter tudo num lugar só?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Diversificar por quê",
        conteudo: {
          "enunciado": "Diversificar é dividir o dinheiro entre aplicações diferentes. Qual é o objetivo principal dessa estratégia?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Garantir que nenhuma parte do dinheiro perca valor.",
              "correta": false,
              "feedback": "Nenhuma estratégia elimina perdas. Diversificar reduz o impacto de uma perda, não a possibilidade dela."
            },
            {
              "id": "b",
              "texto": "Multiplicar o retorno, já que mais aplicações rendem mais.",
              "correta": false,
              "feedback": "Aplicações não somam rendimento por serem várias. Parte do dinheiro em opções mais conservadoras tende a render menos, e essa é a troca aceita."
            },
            {
              "id": "c",
              "texto": "Fazer com que um resultado ruim em uma parte não derrube o conjunto.",
              "correta": true,
              "feedback": "Riscos diferentes raramente acontecem ao mesmo tempo. É isso que estabiliza o resultado total e permite manter o plano de pé."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua régua de liquidez",
        conteudo: {
          "pergunta": "Que percentual do seu dinheiro guardado você precisa poder sacar em até 30 dias?",
          "campo": "percentual",
          "placeholder": "40",
          "ajuda": "Chute pelo seu histórico de imprevistos; precisão não é exigida."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Onde cada parte fica",
        conteudo: {
          "texto": "Você estimou {valor}%. Essa fatia não é a parte que rende mais: é a parte que precisa estar acessível quando algo quebra. O resto pode aceitar prazo maior e oscilação, porque não será chamado de uma hora para outra. Dividir por essa régua, e não por palpite de conhecido, é o que sustenta o plano quando um pedaço vai mal.",
          "regras": [
            {
              "se": "valor < 20",
              "entao": "Liquidez baixa demais para a maioria das rotinas. Um imprevisto médio te obriga a resgatar no pior momento."
            },
            {
              "se": "valor >= 20 e valor <= 60",
              "entao": "Faixa comum. Vale checar se essa parte acessível cobre pelo menos um mês de despesas fixas."
            },
            {
              "se": "valor > 60",
              "entao": "Quase tudo à mão. Seguro no curto prazo, mas com esse desenho a inflação corrói o que você guarda para depois."
            }
          ],
          "proximoPasso": "Liste onde está seu dinheiro hoje e o prazo de resgate de cada parte."
        },
      },
    ],
  },
  {
    slug: "quanto-sobra-de-verdade",
    titulo: "Quanto sobra de verdade",
    subtitulo: "Rendimento bruto não é o que entra na sua conta.",
    segmento: "em",
    blocoId: "em-bloco-c",
    blocoRotulo: "Bloco C · Poupança e investimento",
    ordem: 11,
    nivel: "avancado",
    duracaoMin: 4,
    pontos: 50,
    tags: ["imposto", "inflacao", "liquido"],
    thumbnail: "/trilha/poupar.png",
    estadoInicial: "travado",
    destravadoPor: "risco-retorno-liquidez",
    habilidades: ["EM13LF19", "EM13LF20"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Bruto, líquido e real",
        conteudo: {
          "texto": "Um rendimento anunciado é sempre bruto. Dele saem taxas de administração ou custódia e, na maioria das aplicações de renda fixa, imposto de renda que cai conforme o prazo aumenta. O que sobra é o retorno líquido. Depois ainda vem a inflação: se os preços subiram mais que o seu líquido, você tem mais reais e compra menos. Esse resto é o retorno real.",
          "destaque": "Se o preço subiu mais que o seu rendimento, você perdeu ganhando."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A conta de um ano",
        conteudo: {
          "personagem": "Iolanda",
          "texto": "Iolanda tem 47 anos e vende marmitas. Guardou R$ 8.000 de um pedido grande e aplicou por um ano, com rendimento anunciado de 11% ao ano. No resgate, veio o imposto de renda sobre o ganho. No mesmo período, os preços que ela paga subiram 5%. Ela anotou os três números numa planilha simples e marcou uma revisão a cada seis meses.",
          "pergunta": "Dos 11% anunciados, quanto de fato aumentou o poder de compra dela?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Faça a conta",
        conteudo: {
          "enunciado": "R$ 10.000 aplicados por um ano renderam 12% brutos. O imposto sobre o ganho foi de 20% e a inflação, 6%. Qual o ganho real aproximado?",
          "alternativas": [
            {
              "id": "a",
              "texto": "12%, ou R$ 1.200",
              "correta": false,
              "feedback": "Esse é o bruto, antes do imposto e antes da alta de preços. É o número do anúncio, não o do bolso."
            },
            {
              "id": "b",
              "texto": "9,6%, ou R$ 960",
              "correta": false,
              "feedback": "Esse é o líquido depois do imposto: R$ 1.200 de ganho menos R$ 240 de imposto. Ainda falta descontar os 6% de inflação."
            },
            {
              "id": "c",
              "texto": "Cerca de 3,4%, pouco mais de R$ 340",
              "correta": true,
              "feedback": "R$ 1.200 menos R$ 240 de imposto dão R$ 960, ou 9,6% líquidos. Descontando 6% de inflação, sobram cerca de 3,4% de ganho real."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Seu aporte mensal",
        conteudo: {
          "pergunta": "Quanto você consegue separar por mês para o seu plano, sem contar com sorte nem com renda extra?",
          "campo": "moeda",
          "placeholder": "R$ 250",
          "ajuda": "Uma estimativa média dos últimos três meses já serve."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Do plano ao papel",
        conteudo: {
          "texto": "Com {valor} por mês, o plano só fica de pé se você acompanhar três números: quanto entrou, quanto rendeu líquido e quanto os preços subiram no período. Renda fixa e renda variável entram nesse plano em proporções que você decide pelo prazo de cada meta, não pelo rendimento anunciado. Marque uma revisão a cada seis meses e ajuste o aporte.",
          "regras": [
            {
              "se": "valor < 100",
              "entao": "Valor pequeno, mas no primeiro ano a data fixa e o hábito pesam mais que o tamanho do aporte."
            },
            {
              "se": "valor >= 100 e valor < 500",
              "entao": "Nessa faixa a diferença entre bruto e líquido já aparece em reais. Vale comparar tributação e taxas antes de decidir."
            },
            {
              "se": "valor >= 500",
              "entao": "Com esse aporte, taxa de administração e imposto pesam de verdade. Um ponto percentual a menos de custo muda o resultado do ano."
            }
          ],
          "proximoPasso": "Abra uma planilha com três colunas: aporte, rendimento líquido e inflação do mês."
        },
      },
    ],
  },
  {
    slug: "aposentadoria-comeca-hoje",
    titulo: "Aposentadoria começa hoje",
    subtitulo: "Tempo é o único insumo que não dá para comprar depois.",
    segmento: "em",
    blocoId: "em-bloco-c",
    blocoRotulo: "Bloco C · Poupança e investimento",
    ordem: 12,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["aposentadoria", "inss", "longevidade"],
    thumbnail: "/trilha/poupar.png",
    estadoInicial: "travado",
    destravadoPor: "quanto-sobra-de-verdade",
    habilidades: ["EM13LF15", "EM13LF16"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Quem começa antes",
        conteudo: {
          "texto": "Aposentadoria não é assunto de quem tem 50 anos. É um problema de tempo: cada ano guardado cedo rende sobre o próprio rendimento, e esse efeito não se recupera depois. Quem começa aos 20 precisa separar uma fatia bem menor da renda do que quem começa aos 40 para chegar ao mesmo lugar. O que falta não é dinheiro, é calendário.",
          "destaque": "Começar dez anos antes vale mais que dobrar o valor guardado depois."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Teto, tempo e conta",
        conteudo: {
          "personagem": "Wesley",
          "texto": "Wesley tem 38 anos e dirige por aplicativo. Como não tem carteira assinada, ele mesmo recolhe a contribuição ao INSS todo mês. Descobriu que o benefício público tem teto e que a renda dele hoje é maior que esse teto. Também leu que quem chega aos 65 no Brasil tende a viver mais de vinte anos depois disso. A conta dele precisa cobrir esse intervalo inteiro, não só a data de parar.",
          "pergunta": "Se o benefício público tem teto, o que preenche a diferença até o padrão de vida dele?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Público e privado",
        conteudo: {
          "enunciado": "Qual comparação entre a previdência pública e os planos privados se sustenta?",
          "alternativas": [
            {
              "id": "a",
              "texto": "A previdência privada substitui a pública, então quem tem uma não precisa da outra.",
              "correta": false,
              "feedback": "São camadas diferentes. O regime público garante um piso vitalício e coberturas como incapacidade e pensão, que um plano privado não replica automaticamente."
            },
            {
              "id": "b",
              "texto": "A pública paga enquanto a pessoa viver e tem teto; a privada complementa e depende do que foi acumulado e das taxas cobradas.",
              "correta": true,
              "feedback": "É a divisão de funções: piso vitalício de um lado, complemento acumulado do outro. Por isso prazo e taxas pesam tanto na parte privada."
            },
            {
              "id": "c",
              "texto": "Contribuir para o INSS só faz sentido para quem tem carteira assinada.",
              "correta": false,
              "feedback": "Autônomos e informais podem contribuir por conta própria e manter direito a aposentadoria, auxílio por incapacidade e pensão."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Anos até reduzir o ritmo",
        conteudo: {
          "pergunta": "Com quantos anos você imagina reduzir o ritmo de trabalho e depender do que juntou?",
          "campo": "numero",
          "placeholder": "62",
          "ajuda": "Uma idade aproximada basta; a ideia é enxergar o tamanho do intervalo."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O intervalo a bancar",
        conteudo: {
          "texto": "Você marcou {valor} anos. A pergunta não é só quando parar, e sim por quanto tempo o dinheiro precisa durar depois disso. Como a expectativa de vida segue subindo, planejar por vinte ou trinta anos de despesas é mais realista que planejar por dez. Começar agora, mesmo com pouco, encurta o esforço mensal que você vai precisar fazer lá na frente.",
          "regras": [
            {
              "se": "valor < 55",
              "entao": "Parar cedo alonga o período a bancar: pode passar de trinta anos de despesas sem renda do trabalho."
            },
            {
              "se": "valor >= 55 e valor <= 64",
              "entao": "Idade comum de saída, mas provavelmente antes do benefício público integral. O intervalo entre parar e receber precisa estar coberto."
            },
            {
              "se": "valor > 64",
              "entao": "Mais tempo contribuindo e menos tempo sacando alivia a conta. Ainda assim, planeje para viver bem além dessa idade."
            }
          ],
          "proximoPasso": "Confira no Meu INSS quantas contribuições você já tem registradas."
        },
      },
    ],
  },
  {
    slug: "dinheiro-com-impacto",
    titulo: "Dinheiro com impacto (ESG)",
    subtitulo: "Critérios ambientais, sociais e de governança na prática.",
    segmento: "em",
    blocoId: "em-bloco-c",
    blocoRotulo: "Bloco C · Poupança e investimento",
    ordem: 13,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["ambiental", "consumo", "esg"],
    thumbnail: "/trilha/poupar.png",
    estadoInicial: "travado",
    destravadoPor: "aposentadoria-comeca-hoje",
    habilidades: ["EM13LF24"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "As três letras",
        conteudo: {
          "texto": "ESG resume três critérios usados para avaliar uma empresa além do resultado financeiro. Ambiental: o que ela emite, consome e descarta. Social: como trata trabalhadores, clientes e a comunidade ao redor. Governança: quem decide, com qual transparência e qual controle sobre conflitos de interesse. Esses critérios não valem só para investir: aparecem também em qual banco você usa e no que você compra.",
          "destaque": "Governança fraca costuma aparecer no balanço antes de aparecer na notícia."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Crédito, madeira e conduta",
        conteudo: {
          "personagem": "Bianca",
          "texto": "Bianca tem 29 anos e toca uma marcenaria pequena. Precisa de R$ 15.000 emprestados para comprar uma máquina. Duas instituições oferecem crédito: uma com taxa 0,4 ponto menor e histórico de cobrança abusiva contra clientes; outra um pouco mais cara, com contrato claro e ouvidoria que responde. Na mesma semana, ela escolhe o fornecedor da madeira e vê que só um deles comprova origem legal.",
          "pergunta": "O que a taxa menor não mostra sobre quem vai ficar com o seu contrato por três anos?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Critério ou marketing",
        conteudo: {
          "enunciado": "Uma empresa se anuncia como sustentável. Qual evidência sustenta melhor essa afirmação?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Uma campanha com embalagem verde e um selo criado pela própria empresa.",
              "correta": false,
              "feedback": "Selo próprio e identidade visual não são verificáveis por ninguém de fora. Isso é comunicação, não critério."
            },
            {
              "id": "b",
              "texto": "Relatórios anuais com metas medidas e auditadas por terceiros, além do histórico de multas e processos acessível.",
              "correta": true,
              "feedback": "Dado auditado é o que separa critério de propaganda. O histórico de sanções mostra o que a empresa faz quando ninguém está olhando."
            },
            {
              "id": "c",
              "texto": "O fato de o setor dela ser considerado limpo, como tecnologia ou serviços.",
              "correta": false,
              "feedback": "Setor não define conduta. Empresas do mesmo ramo variam muito em consumo de energia, condições de trabalho e transparência."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua prioridade",
        conteudo: {
          "pergunta": "Entre os três critérios, qual pesaria mais na sua próxima decisão de compra, crédito ou aplicação?",
          "campo": "faixa",
          "placeholder": "Escolha o que mais te incomodaria ver descumprido",
          "faixas": [
            "Ambiental: clima, água e destino dos resíduos",
            "Social: condições de trabalho e efeito na comunidade",
            "Governança: transparência, contratos e conflitos de interesse"
          ],
          "ajuda": "Não existe resposta certa; escolher é o que torna o critério utilizável."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Do valor ao critério",
        conteudo: {
          "texto": "Você marcou {valor}. Critério só vale se for verificável: antes da próxima compra, do próximo crédito ou da próxima aplicação, procure um dado público que confirme ou desminta a promessa. Relatório auditado, decisão de órgão regulador, processo judicial, reclamação registrada. Quando o dado simplesmente não existe, isso também é informação sobre a empresa.",
          "regras": [
            {
              "se": "valor == 'Ambiental: clima, água e destino dos resíduos'",
              "entao": "Peça o número: emissões, consumo de água, destino dos resíduos. Promessa sem dado medido não dá para acompanhar."
            },
            {
              "se": "valor == 'Social: condições de trabalho e efeito na comunidade'",
              "entao": "Procure autuações trabalhistas, reclamações de clientes registradas e como a empresa fiscaliza os próprios fornecedores."
            },
            {
              "se": "valor == 'Governança: transparência, contratos e conflitos de interesse'",
              "entao": "Veja quem responde pela empresa, se o contrato fica disponível antes da assinatura e se a ouvidoria dá resposta com prazo."
            }
          ],
          "proximoPasso": "Escolha uma empresa que você já usa e procure o histórico dela em órgãos reguladores."
        },
      },
    ],
  },
  {
    slug: "promessa-boa-demais",
    titulo: "Golpe, risco e promessa boa demais",
    subtitulo: "Retorno alto e pressa: como separar risco de golpe",
    segmento: "em",
    blocoId: "em-bloco-d",
    blocoRotulo: "Bloco D · Risco e proteção",
    ordem: 14,
    nivel: "iniciante",
    duracaoMin: 2,
    pontos: 30,
    tags: ["alto risco", "fraude", "golpe"],
    thumbnail: "/trilha/risco.png",
    estadoInicial: "travado",
    destravadoPor: "dinheiro-com-impacto",
    habilidades: ["EM13LF36", "EM13LF37", "EM13LF23"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Promessa alta, pressa maior",
        conteudo: {
          "texto": "Retorno alto com garantia e prazo apertado é a combinação que aparece tanto em golpe quanto em produto de alto risco mal explicado. Golpe é crime: promete o que não existe. Risco alto é legítimo, mas pode desvalorizar muito, como acontece com alguns criptoativos. Nos dois casos, a pressa serve para você decidir sem verificar quem está do outro lado.",
          "destaque": "Quanto maior a promessa e menor o prazo para decidir, mais tempo você deveria tomar."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O grupo que pagou primeiro",
        conteudo: {
          "personagem": "Otávio",
          "texto": "Otávio, 24 anos, entrou num grupo que promete 8% ao mês em uma carteira automatizada. Ele fez um Pix de R$ 300 para uma conta de pessoa física e recebeu R$ 24 de volta na primeira semana, a prova de que funcionava. Aí veio a oferta: R$ 3.000 hoje, só hoje, com rendimento dobrado. O site não traz CNPJ e o suporte só responde por mensagem.",
          "pergunta": "O primeiro pagamento provou alguma coisa, ou foi parte do golpe?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Antes de transferir",
        conteudo: {
          "enunciado": "Otávio resolve checar antes de mandar os R$ 3.000. Qual medida realmente reduz o risco dessa transação?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Fazer um Pix menor primeiro, para testar se o dinheiro volta.",
              "correta": false,
              "feedback": "Foi exatamente isso que já aconteceu: o retorno pequeno é a isca. Devolver R$ 24 é barato para quem quer R$ 3.000."
            },
            {
              "id": "b",
              "texto": "Conferir o CNPJ e a autorização da empresa nos sites do Banco Central e da CVM antes de qualquer transferência.",
              "correta": true,
              "feedback": "A consulta ao regulador é gratuita e leva minutos. Quem capta dinheiro do público sem autorização está irregular, prometa o que prometer."
            },
            {
              "id": "c",
              "texto": "Pagar com cartão de crédito em vez de Pix, porque o cartão sempre estorna.",
              "correta": false,
              "feedback": "Contestação de cartão existe, mas não é garantia e não cobre aporte em investimento. Trocar o meio de pagamento não torna a oferta legítima."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Seu limiar de desconfiança",
        conteudo: {
          "pergunta": "Qual retorno mensal garantido alguém precisaria prometer para você desconfiar na hora?",
          "campo": "percentual",
          "placeholder": "3%",
          "ajuda": "Uma estimativa basta: o número serve para você medir o próprio alarme, não para acertar na régua."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Onde seu alarme toca",
        conteudo: {
          "texto": "Você disse que desconfiaria a partir de {valor} ao mês. Guarde esse número: aplicações conservadoras no Brasil rendem perto de 1% ao mês, e ninguém pode garantir retorno muito acima disso. O mesmo critério vale para compra online, senha de internet banking e Pix para desconhecido: quando pedem pressa, é aí que você para.",
          "regras": [
            {
              "se": "valor <= 1",
              "entao": "Seu limiar está bem calibrado. Acima disso, com promessa de garantia, já cabe checar CNPJ e registro no regulador antes de qualquer transferência."
            },
            {
              "se": "valor entre 1 e 5",
              "entao": "Faixa razoável, mas lembre que 3% ao mês garantidos viram mais de 40% ao ano. Pergunte de onde sairia esse dinheiro e quem responde por ele."
            },
            {
              "se": "valor > 5",
              "entao": "Seu alarme toca tarde: 5% ao mês compõem cerca de 80% ao ano. Promessa desse tamanho, com garantia, não existe no mercado regulado."
            }
          ],
          "proximoPasso": "Procure o CNPJ de quem te ofereceu investimento nos sites do Banco Central e da CVM."
        },
      },
    ],
  },
  {
    slug: "colchao-e-apolice",
    titulo: "Colchão e apólice",
    subtitulo: "Reserva para o susto, seguro para o estrago",
    segmento: "em",
    blocoId: "em-bloco-d",
    blocoRotulo: "Bloco D · Risco e proteção",
    ordem: 15,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["apolice", "franquia", "imprevisto"],
    thumbnail: "/trilha/poupar.png",
    estadoInicial: "travado",
    destravadoPor: "promessa-boa-demais",
    habilidades: ["EM13LF22", "EM13LF38"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Colchão e contrato",
        conteudo: {
          "texto": "São duas proteções diferentes. A reserva de emergência é dinheiro seu, guardado onde dá para sacar rápido, para o imprevisto que você consegue pagar. O seguro é um contrato: você paga um valor por período, o prêmio, e a seguradora assume uma perda grande demais para o seu bolso. As regras do que está coberto ficam escritas na apólice.",
          "destaque": "Reserva cobre o susto pequeno. Seguro cobre o estrago que quebraria você."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A queda de Neide",
        conteudo: {
          "personagem": "Neide",
          "texto": "Neide, 38 anos, usa a moto para entregas. Paga R$ 1.380 por ano de prêmio no seguro. Numa queda em dia de chuva, o sinistro, que é o evento previsto na apólice, o conserto saiu R$ 5.200. A franquia da apólice é de R$ 2.000: essa parte fica com ela. A seguradora pagou os R$ 3.200 restantes, a indenização. Sem reserva, Neide não teria os R$ 2.000.",
          "pergunta": "O seguro resolveu tudo, ou sobrou uma parte para a reserva cobrir?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Quem paga o quê",
        conteudo: {
          "enunciado": "Um mês depois, Neide sofre outra queda e o conserto sai R$ 1.500. Com franquia de R$ 2.000, o que a apólice determina?",
          "alternativas": [
            {
              "id": "a",
              "texto": "A seguradora paga os R$ 1.500, já que o sinistro está coberto.",
              "correta": false,
              "feedback": "Prejuízo abaixo da franquia fica com o segurado. A cobertura vale para o que passa desse valor, não para qualquer conserto."
            },
            {
              "id": "b",
              "texto": "Neide paga os R$ 1.500 do próprio bolso: abaixo da franquia não há indenização.",
              "correta": true,
              "feedback": "A franquia é a parte do prejuízo que fica com você em cada sinistro. É justamente aí que a reserva de emergência entra."
            },
            {
              "id": "c",
              "texto": "Neide pode omitir que usa a moto para trabalhar e assim receber mais.",
              "correta": false,
              "feedback": "Informar dado falso descumpre um dever do segurado e pode anular a cobertura. Avisar o sinistro no prazo e dizer a verdade são obrigações do contrato."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Seu mês essencial",
        conteudo: {
          "pergunta": "Quanto você gasta por mês com o essencial: moradia, comida, transporte e contas básicas?",
          "campo": "moeda",
          "placeholder": "R$ 1.800",
          "ajuda": "Uma estimativa aproximada resolve; não precisa abrir extrato para responder."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O tamanho do colchão",
        conteudo: {
          "texto": "Com {valor} por mês de gasto essencial, uma reserva de três meses fica em torno do triplo desse valor. É ela que cobre franquia, conta inesperada e mês sem renda. O seguro entra depois, para o estrago que a reserva não aguentaria. Guardar em algo de resgate rápido importa mais aqui do que buscar rendimento.",
          "regras": [
            {
              "se": "valor < 1000",
              "entao": "Sua meta fica abaixo de R$ 3.000, alcançável guardando um pouco por mês. Comece pelo valor da franquia dos seguros que você tem ou pretende ter."
            },
            {
              "se": "valor entre 1000 e 3000",
              "entao": "A meta fica entre R$ 3.000 e R$ 9.000. Divida por doze e trate a parcela como uma conta fixa até fechar o valor."
            },
            {
              "se": "valor > 3000",
              "entao": "A meta passa de R$ 9.000 e leva tempo para juntar. Enquanto isso, o seguro é o que protege o que seria impossível repor do próprio bolso."
            }
          ],
          "proximoPasso": "Some seus gastos essenciais de um mês e veja quanto falta para o primeiro mês de reserva."
        },
      },
    ],
  },
  {
    slug: "o-preco-do-credito",
    titulo: "O preço do crédito",
    subtitulo: "A taxa anunciada não é o que você paga",
    segmento: "em",
    blocoId: "em-bloco-e",
    blocoRotulo: "Bloco E · Crédito e dívida",
    ordem: 16,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["cadastro positivo", "cet", "credito"],
    thumbnail: "/trilha/credito.png",
    estadoInicial: "travado",
    destravadoPor: "colchao-e-apolice",
    habilidades: ["EM13LF26", "EM13LF29"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Taxa não é o preço final",
        conteudo: {
          "texto": "A taxa que aparece no anúncio é só uma parte do que você paga. O Custo Efetivo Total, o CET, junta tudo: juros, tarifa de cadastro, seguro embutido, impostos e o prazo. Por lei, a instituição precisa informar o CET antes de você assinar. Duas ofertas com a mesma taxa mensal podem ter CET bem diferente. Comparar pela taxa anunciada é comparar pela metade.",
          "destaque": "A taxa é a manchete. O CET é a conta."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Duas ofertas, mesma taxa",
        conteudo: {
          "personagem": "Adriano",
          "texto": "Adriano, 29 anos, precisa de R$ 4.000 para trocar o notebook que usa no freela. Duas instituições oferecem 12 parcelas à mesma taxa nominal: 2,3% ao mês. Na oferta A, o CET é 2,9% ao mês e a parcela sai R$ 385. Na oferta B, o CET é 4,4% ao mês, porque entram tarifa de cadastro de R$ 250 e seguro de R$ 180 na conta; a parcela vira R$ 427. No fim, R$ 4.623 contra R$ 5.124.",
          "pergunta": "Duas ofertas com a mesma taxa: o que está fazendo R$ 501 de diferença?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "O que o histórico muda",
        conteudo: {
          "enunciado": "O cadastro positivo registra seu histórico de contas e parcelas pagas em dia. O que ele tende a mudar na hora de contratar crédito?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Garante a aprovação de qualquer empréstimo que você pedir",
              "correta": false,
              "feedback": "Nenhum histórico garante aprovação. A instituição continua avaliando renda, prazo e quanto você já deve."
            },
            {
              "id": "b",
              "texto": "Melhora sua avaliação de risco e pode reduzir a taxa oferecida a você",
              "correta": true,
              "feedback": "É o efeito prático: pagamentos em dia registrados baixam o risco percebido, e risco menor costuma virar taxa e CET menores."
            },
            {
              "id": "c",
              "texto": "Apaga do seu nome as dívidas antigas já vencidas",
              "correta": false,
              "feedback": "O cadastro positivo mostra o que foi pago, não elimina dívida. A negativação só sai quando a dívida é quitada ou renegociada."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "O que cabe no seu mês",
        conteudo: {
          "pergunta": "Qual é o maior valor de parcela que caberia no seu mês sem cortar o essencial?",
          "campo": "moeda",
          "placeholder": "R$ 300",
          "ajuda": "Uma estimativa basta; não é preciso abrir extrato nem acertar no centavo."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Sua faixa de decisão",
        conteudo: {
          "texto": "Você disse que cabe até R$ {valor} de parcela por mês. É esse número, e não o entusiasmo com a compra, que define quais ofertas entram na sua lista. Com ele na mão, peça o CET por escrito das duas propostas e compare o total pago, não a parcela isolada. Prazo maior quase sempre significa parcela menor e total maior.",
          "regras": [
            {
              "se": "valor < 385",
              "entao": "Nenhuma das duas ofertas do exemplo caberia no seu mês. Adiar a compra ou pedir menos custa bem menos do que atrasar parcela."
            },
            {
              "se": "valor entre 385 e 426",
              "entao": "Só a oferta de CET menor caberia. A diferença entre as duas não estava na taxa anunciada, estava nas tarifas e no seguro."
            },
            {
              "se": "valor >= 427",
              "entao": "As duas caberiam, e é aí que o CET decide: a mais cara levaria R$ 501 a mais pelo mesmo dinheiro emprestado."
            }
          ],
          "proximoPasso": "Consulte seu cadastro positivo e peça o CET por escrito antes de assinar qualquer proposta."
        },
      },
    ],
  },
  {
    slug: "quando-a-divida-vira-problema",
    titulo: "Quando a dívida vira problema",
    subtitulo: "Como a dívida cresce e como renegociar",
    segmento: "em",
    blocoId: "em-bloco-e",
    blocoRotulo: "Bloco E · Crédito e dívida",
    ordem: 17,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["dividas", "endividamento", "juros"],
    thumbnail: "/trilha/credito.png",
    estadoInicial: "travado",
    destravadoPor: "o-preco-do-credito",
    habilidades: ["EM13LF27", "EM13LF28"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Como a dívida cresce",
        conteudo: {
          "texto": "Dívida atrasada cresce em camadas: multa, que incide uma vez, juros de mora por mês de atraso e, no crédito rotativo, juros que incidem sobre o saldo já acrescido de juros. É por isso que o valor acelera. Endividamento excessivo raramente tem causa única: desemprego, doença, renda que varia de mês para mês e emergência sem reserva aparecem mais do que descontrole.",
          "destaque": "Juros compostos não perguntam por que você atrasou."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Quatro meses no rotativo",
        conteudo: {
          "personagem": "Marlene",
          "texto": "Marlene, 41 anos, ficou quatro meses sem trabalho depois que a empresa fechou. Pagou o mínimo da fatura e o resto foi para o rotativo do cartão, a 14% ao mês. Os R$ 1.200 que sobraram viraram cerca de R$ 2.027 em quatro meses, porque os juros passaram a incidir sobre juros. Ela voltou a trabalhar e propôs um acordo: R$ 300 de entrada e 10 parcelas, com taxa negociada para baixo.",
          "pergunta": "A dívida quase dobrou em quatro meses. O que fez o valor crescer assim?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Multa mais mora",
        conteudo: {
          "enunciado": "Uma conta de R$ 800 venceu há 3 meses. O contrato prevê multa de 2% e juros de mora de 1% ao mês. Quanto virou a dívida?",
          "alternativas": [
            {
              "id": "a",
              "texto": "R$ 816",
              "correta": false,
              "feedback": "Isso é só a multa de 2%, ou seja, R$ 16. Faltam os juros de mora dos três meses de atraso."
            },
            {
              "id": "b",
              "texto": "R$ 824",
              "correta": false,
              "feedback": "Aqui entrou a multa e apenas um mês de mora. O atraso é de três meses, então a mora é R$ 8 três vezes."
            },
            {
              "id": "c",
              "texto": "R$ 840",
              "correta": true,
              "feedback": "R$ 800 mais R$ 16 de multa mais R$ 8 de mora por mês, em três meses, dá R$ 840. Multa incide uma vez; mora, a cada mês."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Quanto já está comprometido",
        conteudo: {
          "pergunta": "Quanto do que entra por mês já está comprometido com parcelas, faturas e dívidas?",
          "campo": "percentual",
          "placeholder": "25",
          "ajuda": "Estimativa serve; não é preciso somar tudo no centavo para ter a leitura."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Onde você está",
        conteudo: {
          "texto": "Você estimou que {valor}% do que entra por mês já está comprometido com dívidas. Esse percentual é o que decide se sobra espaço para um imprevisto ou se o próximo mês termina no rotativo. Renegociar não é favor nem confissão de erro: credor costuma preferir receber menos e certo a não receber.",
          "regras": [
            {
              "se": "valor < 30",
              "entao": "Abaixo de 30% ainda há folga para absorver um imprevisto. É o momento de montar reserva, não de assumir mais uma parcela."
            },
            {
              "se": "valor entre 30 e 50",
              "entao": "Nessa faixa, qualquer queda de renda vira atraso. Vale procurar o credor antes do primeiro vencimento perdido, quando ainda não há multa."
            },
            {
              "se": "valor > 50",
              "entao": "Mais da metade da renda comprometida é endividamento excessivo, seja qual for a causa. Ataque primeiro a dívida de juros mais altos e proponha acordo."
            }
          ],
          "proximoPasso": "Liste suas dívidas por taxa de juros e ligue hoje para o credor da mais cara."
        },
      },
    ],
  },
  {
    slug: "estudar-sem-se-afundar",
    titulo: "Estudar sem se afundar",
    subtitulo: "O custo de estudar não é só a mensalidade",
    segmento: "em",
    blocoId: "em-bloco-e",
    blocoRotulo: "Bloco E · Crédito e dívida",
    ordem: 18,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["bolsas", "ensino superior", "financiamento"],
    thumbnail: "/trilha/credito.png",
    estadoInicial: "travado",
    destravadoPor: "quando-a-divida-vira-problema",
    habilidades: ["EM13LF25"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Entrar e permanecer",
        conteudo: {
          "texto": "Entrar e permanecer são duas contas diferentes. Enem e Sisu, Prouni, Fies, cotas e bolsas da própria instituição mudam quanto você paga de mensalidade, e o Fies vira parcela depois de formado. Nenhum deles cobre sozinho o custo de permanência: transporte, material, moradia, alimentação e as horas que você deixa de trabalhar. Muitas instituições têm auxílio de permanência, mas é preciso procurar.",
          "destaque": "A vaga é o começo da conta, não o fim dela."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Duas aprovações",
        conteudo: {
          "personagem": "Kauã",
          "texto": "Kauã, 17 anos, fez o Enem e tem nota para duas coisas: uma vaga pública pelo Sisu em outra cidade e uma bolsa de 50% pelo Prouni numa faculdade da sua cidade. Na primeira, a mensalidade é zero, mas moradia, transporte e material somam R$ 1.200 por mês. Na segunda, a mensalidade com bolsa fica em R$ 700 e o transporte, R$ 160, porque ele continua morando em casa.",
          "pergunta": "A vaga sem mensalidade é mesmo a opção mais barata para ele?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Quatro anos de conta",
        conteudo: {
          "enunciado": "Manter-se na vaga pública em outra cidade custa R$ 1.200 por mês; com bolsa de 50% na própria cidade, R$ 860. Em 4 anos, o que pesa menos?",
          "alternativas": [
            {
              "id": "a",
              "texto": "A vaga pública, porque a mensalidade é zero",
              "correta": false,
              "feedback": "Mensalidade zero não zera moradia nem transporte. Em 48 meses, esse caminho soma R$ 57.600 de custo de permanência."
            },
            {
              "id": "b",
              "texto": "A opção com bolsa de 50%, por cerca de R$ 16 mil a menos",
              "correta": true,
              "feedback": "São R$ 41.280 contra R$ 57.600 em 48 meses, uma diferença de R$ 16.320. O gasto de permanência decidiu, não a mensalidade."
            },
            {
              "id": "c",
              "texto": "As duas custam o mesmo; muda só quem paga a conta",
              "correta": false,
              "feedback": "As duas contas são diferentes: R$ 340 por mês de diferença viram mais de R$ 16 mil ao longo do curso."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Seu custo de permanência",
        conteudo: {
          "pergunta": "Quanto você gastaria por mês para se manter estudando: transporte, material, alimentação e moradia?",
          "campo": "moeda",
          "placeholder": "R$ 600",
          "ajuda": "Uma estimativa aproximada já serve para comparar caminhos; precisão não é exigida aqui."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "A conta até a formatura",
        conteudo: {
          "texto": "R$ {valor} por mês é o seu custo de permanência estimado. Multiplicado pelos cerca de 48 meses de uma graduação, é ele que diz se um caminho se sustenta, não o valor da mensalidade. Compare Sisu, Prouni, Fies, cotas e bolsas da instituição por esse total, e pergunte a cada uma quais auxílios de moradia, transporte e alimentação existem.",
          "regras": [
            {
              "se": "valor < 400",
              "entao": "Menos de R$ 400 por mês costuma pressupor morar em casa e trajeto curto. Confirme material e alimentação antes de fechar essa conta."
            },
            {
              "se": "valor entre 400 e 1000",
              "entao": "Nessa faixa, passe estudantil e auxílio de permanência da instituição mudam bastante o resultado. Vale perguntar antes de escolher a vaga."
            },
            {
              "se": "valor > 1000",
              "entao": "Acima de R$ 1.000 por mês, mudar de cidade pesa mais que qualquer mensalidade. Compare com os caminhos disponíveis onde você já mora."
            }
          ],
          "proximoPasso": "Some o custo mensal de permanência de dois caminhos que te interessam e compare os totais."
        },
      },
    ],
  },
  {
    slug: "de-onde-vem-a-sua-renda",
    titulo: "De onde vem a sua renda",
    subtitulo: "Estrutura, momento, escolhas e vínculo definem sua renda",
    segmento: "em",
    blocoId: "em-bloco-f",
    blocoRotulo: "Bloco F · Renda, trabalho e empreender",
    ordem: 19,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["direitos", "informalidade", "renda"],
    thumbnail: "/trilha/renda.png",
    estadoInicial: "travado",
    destravadoPor: "estudar-sem-se-afundar",
    habilidades: ["EM13LF30", "EM13LF31", "EM13LF35"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "As quatro forças da sua renda",
        conteudo: {
          "texto": "Sua renda não é só resultado de esforço. Quatro forças a determinam ao mesmo tempo. As estruturais mudam devagar: escolaridade, região onde você mora, cor, gênero, a rede de contatos que herdou. As conjunturais são o momento: inflação, desemprego, o setor aquecido ou parado. As pessoais são suas escolhas e sua formação. E as do trabalho são o vínculo: carteira assinada, contrato, informalidade, quantas horas você entrega.",
          "destaque": "Esforço explica parte da renda. Estrutura, conjuntura e vínculo explicam o resto."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "Cleiton e a corrida que cai",
        conteudo: {
          "personagem": "Cleiton",
          "texto": "Cleiton tem 29 anos e faz entregas por aplicativo em Belo Horizonte. Em um mês bom, roda 200 horas e leva R$ 2.800. Não tem férias, décimo terceiro nem afastamento se quebrar o braço. Guarda R$ 200 por mês para o INSS como contribuinte individual, porque ninguém recolhe por ele. Quando o combustível sobe e o número de entregadores na cidade cresce, o valor por corrida cai — e ele não tem com quem negociar.",
          "pergunta": "O que na renda de Cleiton depende dele e o que depende do vínculo e do mercado?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Direitos ou competitividade?",
        conteudo: {
          "enunciado": "Uma empresa diz que precisa reduzir encargos trabalhistas para competir com concorrentes que operam com equipes informais. O que esse debate exige avaliar?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Nada: direitos trabalhistas são custo e sempre travam a competitividade.",
              "correta": false,
              "feedback": "Direitos como férias, FGTS e limite de jornada foram conquistados ao longo do século XX e sustentam saúde, previdência e poder de compra. Reduzi-los a custo apaga metade da conta."
            },
            {
              "id": "b",
              "texto": "Os dois lados: o custo do vínculo para a empresa e o que o trabalhador perde sem proteção.",
              "correta": true,
              "feedback": "É o núcleo do debate. Encargos pesam no caixa de quem contrata, e a ausência deles transfere o risco de doença, acidente e velhice para o trabalhador e para o sistema público."
            },
            {
              "id": "c",
              "texto": "Só o lado da empresa: se ela quebrar, ninguém tem emprego.",
              "correta": false,
              "feedback": "A sobrevivência da empresa importa, mas não encerra a discussão. Competir cortando proteção costuma empurrar o custo para a saúde pública e para a previdência, ou seja, para todo mundo."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Quanto da renda é informal",
        conteudo: {
          "pergunta": "Da renda que entra na sua casa hoje, quanto vem de trabalho sem carteira, freela ou bico?",
          "campo": "percentual",
          "placeholder": "40",
          "ajuda": "Uma estimativa aproximada basta; o objetivo é enxergar a proporção, não acertar o número."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O que está exposto",
        conteudo: {
          "texto": "Você estimou que {valor} da renda da sua casa vem de trabalho sem proteção formal. Esse número não mede o esforço de ninguém: mede exposição. Renda informal costuma variar mais de mês para mês, não gera FGTS nem seguro-desemprego e só conta para a aposentadoria se alguém recolher por conta própria. Saber a proporção é o primeiro passo para decidir o que dá para blindar.",
          "regras": [
            {
              "se": "valor == 0",
              "entao": "Toda a renda da casa passa por vínculo formal. A proteção está dada, mas a dependência de um único contratante também é risco: vale saber quantos meses a casa aguenta sem esse salário."
            },
            {
              "se": "valor > 0 e valor <= 40",
              "entao": "Parte da renda oscila e não gera direito nenhum. Uma reserva de emergência e a contribuição própria ao INSS cobrem justamente essa fatia."
            },
            {
              "se": "valor > 40",
              "entao": "A maior parte da renda depende de trabalho sem proteção. Aqui, reserva e previdência não são luxo: substituem férias, licença e seguro-desemprego que ninguém vai pagar."
            }
          ],
          "proximoPasso": "Some quanto a sua renda variou nos últimos três meses e anote o pior mês."
        },
      },
    ],
  },
  {
    slug: "pensar-como-quem-empreende",
    titulo: "Pensar como quem empreende",
    subtitulo: "Testar pequeno, no emprego, no bairro ou no negócio próprio",
    segmento: "em",
    blocoId: "em-bloco-f",
    blocoRotulo: "Bloco F · Renda, trabalho e empreender",
    ordem: 20,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["comunidade", "empreender", "negocio"],
    thumbnail: "/trilha/renda.png",
    estadoInicial: "travado",
    destravadoPor: "de-onde-vem-a-sua-renda",
    habilidades: ["EM13LF32", "EM13LF33"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Empreender é comportamento",
        conteudo: {
          "texto": "Empreender não começa com abrir empresa. Começa com um comportamento: notar um problema que incomoda outras pessoas, testar uma solução pequena antes de investir muito, aceitar risco calculado e recrutar quem faz melhor que você. Esse comportamento vale dentro de um emprego com carteira assinada, num projeto de bairro ou numa loja. Muda a escala, não a lógica.",
          "destaque": "Empreender é um jeito de agir, não um tipo de CNPJ."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O teste de R$ 18",
        conteudo: {
          "personagem": "Rejane",
          "texto": "Rejane tem 17 anos e percebeu que ninguém no bairro conserta bicicleta depois das 18h. Antes de comprar ferramentas caras, ela pegou emprestado o kit de um vizinho, avisou em dois grupos de mensagem e atendeu quatro pessoas num sábado, cobrando R$ 25 por reparo. Faturou R$ 100 e gastou R$ 18 em peças. O teste custou pouco e respondeu à pergunta que importava: existe gente disposta a pagar por isso?",
          "pergunta": "O que o teste de R$ 18 comprou que uma planilha de projeções não compraria?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Cultural, social ou comercial",
        conteudo: {
          "enunciado": "Três pessoas querem tocar um negócio próprio: um sarau pago, um projeto de reforço escolar gratuito e uma loja de doces. O que muda entre eles?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Nada de relevante: todo negócio depende só de vender bem.",
              "correta": false,
              "feedback": "Vender importa nos três, mas a origem do dinheiro é diferente. Um projeto social costuma combinar doação, edital e contrapartida, e isso muda quem ele precisa convencer."
            },
            {
              "id": "b",
              "texto": "De onde vem a receita e a quem cada um presta contas.",
              "correta": true,
              "feedback": "É isso. O sarau depende de público e patrocínio, o projeto social de editais e doadores, a loja de margem e giro — e cada fonte cobra uma prestação de contas diferente."
            },
            {
              "id": "c",
              "texto": "O cultural e o social não precisam de controle financeiro, só o comercial.",
              "correta": false,
              "feedback": "Os três precisam saber custo, receita e caixa. Projetos culturais e sociais costumam ter exigência de prestação de contas ainda mais rígida, porque usam recurso de terceiros."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua próxima ideia",
        conteudo: {
          "pergunta": "Se você fosse testar uma ideia nos próximos 30 dias, de que natureza ela seria?",
          "campo": "faixa",
          "placeholder": "Social: resolver um problema da comunidade",
          "faixas": [
            "Cultural: uma oficina, um evento, um produto artístico",
            "Social: resolver um problema da comunidade",
            "Comercial: vender um produto ou serviço",
            "Dentro de onde já estou: melhorar algo no trabalho ou na escola"
          ],
          "ajuda": "Não precisa ser a ideia definitiva; vale a que você testaria com o que já tem hoje."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Do teste ao próximo passo",
        conteudo: {
          "texto": "Você escolheu {valor}. Seja qual for a natureza, o próximo movimento é o mesmo: reduzir a ideia a um teste que caiba em uma semana e em pouco dinheiro. Quem empreende bem não aposta tudo de uma vez — troca dúvida por informação barata. O que muda entre as naturezas é de onde vem a receita e para quem você presta contas.",
          "regras": [
            {
              "se": "valor começa com 'Comercial'",
              "entao": "Sua primeira pergunta é se alguém paga um preço que cobre o custo. Descubra isso com quatro clientes reais antes de investir em estoque."
            },
            {
              "se": "valor começa com 'Cultural' ou 'Social'",
              "entao": "Aqui a receita quase nunca vem só de quem usa. Mapeie desde já editais, parceiros e contrapartidas, porque cada fonte traz uma exigência de prestação de contas."
            },
            {
              "se": "valor começa com 'Dentro de onde já estou'",
              "entao": "Empreender dentro de uma organização é o caminho de menor risco pessoal. Escolha um processo que trava toda semana e proponha a mudança com número antes e depois."
            }
          ],
          "proximoPasso": "Descreva a ideia em uma frase e mostre para três pessoas que têm esse problema."
        },
      },
    ],
  },
  {
    slug: "a-conta-do-negocio",
    titulo: "A conta do negócio",
    subtitulo: "Receita, custo, margem: onde mexer para o lucro subir",
    segmento: "em",
    blocoId: "em-bloco-f",
    blocoRotulo: "Bloco F · Renda, trabalho e empreender",
    ordem: 21,
    nivel: "avancado",
    duracaoMin: 4,
    pontos: 50,
    tags: ["custos", "margem", "negocio"],
    thumbnail: "/trilha/renda.png",
    estadoInicial: "travado",
    destravadoPor: "pensar-como-quem-empreende",
    habilidades: ["EM13LF34"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Os quatro números do negócio",
        conteudo: {
          "texto": "Todo negócio cabe em quatro números. Receita é o que entra. Custo variável cresce a cada venda: ingrediente, embalagem, taxa da maquininha. Custo fixo você paga mesmo vendendo zero: aluguel, luz, salários. A margem de contribuição é o que sobra de cada venda depois do custo variável — é ela que precisa pagar o custo fixo antes de virar lucro.",
          "destaque": "A margem paga o custo fixo. O que sobra depois disso é lucro."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A marmitaria de Solange",
        conteudo: {
          "personagem": "Solange",
          "texto": "Solange tem 41 anos e faz 600 marmitas por mês a R$ 20: R$ 12.000 de receita. Cada marmita custa R$ 11 em ingredientes e embalagem, o que dá R$ 6.600 de custo variável. Aluguel, gás, energia e a ajudante somam R$ 4.200 fixos. Sobram R$ 1.200 de lucro, 10% da receita. Ela joga fora cerca de 8% dos legumes por compra mal dimensionada e gasta R$ 380 por mês em embalagem descartável.",
          "pergunta": "Onde mexer primeiro para o lucro subir sem empurrar o custo para o meio ambiente?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Qual melhoria propor",
        conteudo: {
          "enunciado": "Solange quer aumentar o lucro. Ela pode subir o preço, cortar o desperdício de insumo ou demitir a ajudante. Qual proposta ataca custo sem transferir prejuízo?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Demitir a ajudante e absorver o serviço sozinha.",
              "correta": false,
              "feedback": "Corta custo fixo no papel, mas tira uma renda do bairro e joga a jornada inteira sobre ela. Se a produção cair junto, o lucro pode nem subir."
            },
            {
              "id": "b",
              "texto": "Reduzir os 8% de perda de legumes ajustando a compra semanal.",
              "correta": true,
              "feedback": "Insumo que não vai para o lixo vira margem direta, sem aumentar preço nem cortar gente. E menos comida descartada reduz o custo ambiental da operação."
            },
            {
              "id": "c",
              "texto": "Subir o preço da marmita para R$ 24.",
              "correta": false,
              "feedback": "Pode funcionar, mas é a saída que mais depende de o cliente aceitar: em marmita, quatro reais a mais costumam derrubar o volume. Mexer no que se controla vem antes."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Quanto dá para cortar",
        conteudo: {
          "pergunta": "Quanto por mês você propõe cortar em desperdício e embalagem descartável sem reduzir a produção?",
          "campo": "moeda",
          "placeholder": "R$ 400",
          "ajuda": "Uma estimativa serve: pense em quanto dos 8% de perda e dos R$ 380 de embalagem dá para reduzir."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "O efeito no lucro",
        conteudo: {
          "texto": "Com {valor} por mês a menos em desperdício e embalagem, esse valor cai direto no lucro de R$ 1.200 — sem vender uma marmita a mais e sem cortar a ajudante. É a melhoria mais barata do orçamento: mexe no custo variável, que Solange controla, e diminui o lixo. Preço e quadro de gente entram depois, se a conta ainda não fechar.",
          "regras": [
            {
              "se": "valor < 200",
              "entao": "Parece pouco, mas R$ 150 por mês são R$ 1.800 no ano, sem depender de o cliente aceitar preço maior. Meça a perda por uma semana antes de mudar a compra."
            },
            {
              "se": "valor entre 200 e 500",
              "entao": "Uma economia nessa faixa aumenta o lucro entre 17% e 42% sem tocar no preço. Compare o custo por unidade da embalagem descartável com o de uma opção retornável ou compostável."
            },
            {
              "se": "valor > 500",
              "entao": "Acima de R$ 500 a estimativa fica otimista: a embalagem inteira custa R$ 380 por mês. Confirme com nota fiscal e com a pesagem do que vai para o lixo antes de contar com esse ganho."
            }
          ],
          "proximoPasso": "Pese por uma semana o que vai para o lixo e converta em reais."
        },
      },
    ],
  },
  {
    slug: "quem-move-a-economia",
    titulo: "Quem move a economia",
    subtitulo: "Quem produz, quem compra, quem regula — e onde você entra",
    segmento: "em",
    blocoId: "em-bloco-g",
    blocoRotulo: "Bloco G · Cenário e cidadania",
    ordem: 22,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["consumo", "desigualdade", "economia"],
    thumbnail: "/trilha/cidadania.png",
    estadoInicial: "travado",
    destravadoPor: "a-conta-do-negocio",
    habilidades: ["EM13LF39", "EM13LF40"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "A engrenagem tem quatro peças",
        conteudo: {
          "texto": "A economia é feita de gente decidindo. Produtores criam bens e serviços e contratam. Vendedores conectam quem produz a quem compra e definem preço. Compradores escolhem onde gastar e, com isso, dizem o que vale a pena existir. O governo arrecada, gasta, contrata e define regras. Cada decisão de um muda o campo de jogo dos outros — inclusive o seu.",
          "destaque": "Você é um agente econômico, não só um espectador do noticiário."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "A padaria e o bairro",
        conteudo: {
          "personagem": "Elaine",
          "texto": "Elaine, 41 anos, tem uma padaria num bairro de 3 mil moradores. Uma fábrica da região demitiu 200 pessoas e, em dois meses, o faturamento dela caiu 18%. Ninguém parou de comer: as pessoas trocaram o pão de queijo de R$ 6 pelo pão francês de R$ 1. Na mesma rua abriu uma clínica com 15 vagas de salário alto, e o café expresso passou a sair mais. A renda total do bairro quase não mudou. O que ela vende, sim.",
          "pergunta": "Se a soma da renda é quase a mesma, por que o consumo do bairro mudou tanto?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Mesmo bolo, fatias diferentes",
        conteudo: {
          "enunciado": "Duas cidades têm a mesma renda total. Na primeira, ela é bem distribuída; na segunda, concentrada em poucas famílias. O que tende a mudar?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Nada relevante: o que importa é o total, não como ele se reparte.",
              "correta": false,
              "feedback": "O total não determina o consumo. Renda espalhada entre muita gente sustenta padaria, farmácia e transporte; concentrada, esse gasto básico encolhe."
            },
            {
              "id": "b",
              "texto": "Na primeira, mais gente compra itens básicos; na segunda, o gasto se concentra em menos pessoas e em itens mais caros.",
              "correta": true,
              "feedback": "É isso. A mesma renda total gera consumo, empregos e negócios diferentes conforme quem a recebe."
            },
            {
              "id": "c",
              "texto": "A segunda cidade terá mais comércio, porque dinheiro concentrado circula mais rápido.",
              "correta": false,
              "feedback": "Não existe essa regra. Quem ganha muito tende a poupar ou investir uma fatia maior da renda, e parte desse dinheiro pode nem circular na cidade."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Onde seu dinheiro para",
        conteudo: {
          "pergunta": "Pensando no último mês, quanto do seu dinheiro ficou em comércios do seu próprio bairro ou cidade?",
          "campo": "moeda",
          "placeholder": "R$ 350",
          "ajuda": "Uma estimativa de cabeça resolve; não é preciso somar recibos."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Seu gasto é renda de alguém",
        conteudo: {
          "texto": "Os {valor} que você estimou não sumiram: viraram renda de quem vendeu, salário de quem atendeu e tributo que financia serviço público. Multiplique isso por milhares de pessoas e você tem a economia local. Como distribuir melhor essa renda — via imposto, salário, crédito ou crescimento — é uma disputa política real, com bons argumentos de mais de um lado.",
          "regras": [
            {
              "se": "valor < 200",
              "entao": "Boa parte do seu consumo sai do bairro: compras on-line e redes grandes levam esse dinheiro para outro lugar. Não é errado, mas muda quem recebe."
            },
            {
              "se": "valor entre 200 e 800",
              "entao": "Seu gasto está dividido entre o comércio local e o de fora, que é o padrão da maioria das famílias urbanas."
            },
            {
              "se": "valor > 800",
              "entao": "Quase tudo que você gasta vira renda perto de onde você mora. Isso sustenta empregos vizinhos e costuma custar um pouco mais caro que comprar de grandes redes."
            }
          ],
          "proximoPasso": "Escolha uma compra da semana e descubra quem produz, quem vende e quanto fica com cada um."
        },
      },
    ],
  },
  {
    slug: "imposto-servico-publico-e-voce",
    titulo: "Imposto, serviço público e você",
    subtitulo: "Para onde vai o imposto e como você fiscaliza isso",
    segmento: "em",
    blocoId: "em-bloco-g",
    blocoRotulo: "Bloco G · Cenário e cidadania",
    ordem: 23,
    nivel: "intermediario",
    duracaoMin: 3,
    pontos: 40,
    tags: ["cidadania", "impostos", "servicos publicos"],
    thumbnail: "/trilha/cidadania.png",
    estadoInicial: "travado",
    destravadoPor: "quem-move-a-economia",
    habilidades: ["EM13LF41", "EM13LF43"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "O que o preço já cobrou",
        conteudo: {
          "texto": "Tributo é o que financia escola, SUS, estrada e polícia. Ele vem por dois caminhos. O direto incide sobre renda e patrimônio, como o Imposto de Renda e o IPTU: quem tem mais, paga mais. O indireto vem embutido no preço do que você compra e é igual para todo mundo, independentemente da renda — por isso pesa proporcionalmente mais em quem ganha menos.",
          "destaque": "Isso se chama regressividade: é fato medido. O que fazer a respeito é debate aberto."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O fone e a nota fiscal",
        conteudo: {
          "personagem": "Berenice",
          "texto": "Berenice, 17 anos, recebeu R$ 400 por um freela de edição de vídeo e comprou um fone de R$ 250. Na nota fiscal, a linha de tributos apontava cerca de R$ 90 embutidos no preço — valor de exemplo, que varia por produto e por estado. No mesmo dia, Regina, que ganha R$ 22.000 por mês, comprou o mesmo fone e pagou os mesmos R$ 90. Para Berenice, aquilo foi 22% da renda do freela. Para Regina, 0,4%.",
          "pergunta": "O imposto pago foi idêntico. O peso foi o mesmo?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Venda sem nota",
        conteudo: {
          "enunciado": "Uma loja vende sem emitir nota e não recolhe o tributo daquela venda. Qual é o efeito mais direto?",
          "alternativas": [
            {
              "id": "a",
              "texto": "Ninguém perde: o dinheiro fica com a loja e circula do mesmo jeito.",
              "correta": false,
              "feedback": "Circula, mas fora do caixa público. Falta receita para o serviço que aquela arrecadação bancaria, e o buraco é coberto por quem não tem como deixar de pagar."
            },
            {
              "id": "b",
              "texto": "Falta receita para serviços públicos, e a conta tende a sobrar para quem não consegue sonegar.",
              "correta": true,
              "feedback": "Sim: quem tem imposto descontado na fonte ou compra com nota sustenta a parte que faltou. É daí que nascem propostas opostas — uns querem fiscalizar e cobrar mais de quem tem renda alta, outros querem simplificar o sistema e reduzir a carga para que sonegar deixe de compensar."
            },
            {
              "id": "c",
              "texto": "O comprador economiza, porque o tributo some da conta dele.",
              "correta": false,
              "feedback": "Em geral o preço não cai por isso: a diferença fica com o vendedor. E, sem nota, você perde a prova de compra para garantia e troca."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Ferramentas de fiscalização",
        conteudo: {
          "pergunta": "Quais destes você já usou: portal da transparência, pedido pela Lei de Acesso à Informação, consulta pública do Banco Central?",
          "campo": "faixa",
          "placeholder": "Um deles",
          "faixas": [
            "Nenhum deles",
            "Um deles",
            "Dois deles",
            "Os três"
          ],
          "ajuda": "Vale a estimativa: se você já abriu um portal de gastos por curiosidade, conta."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Fiscalizar é parte do preço",
        conteudo: {
          "texto": "Você marcou: {valor}. Os três canais são públicos e gratuitos: o portal da transparência mostra contratos e repasses, a Lei de Acesso à Informação obriga o órgão a responder em até 20 dias e o Banco Central abre consulta antes de mudar regras que afetam sua conta. Fiscalizar não resolve a discussão sobre quanto e de quem cobrar — mas dá base para participar dela.",
          "regras": [
            {
              "se": "valor == 'Nenhum deles'",
              "entao": "São três portas ainda fechadas. Uma consulta simples no portal do seu município costuma ser o caminho mais curto para abrir a primeira."
            },
            {
              "se": "valor == 'Um deles' ou valor == 'Dois deles'",
              "entao": "Você já sabe que os dados existem. O passo seguinte é comparar o que foi orçado, o que foi pago e o que ficou pronto — números que alimentam os dois lados do debate: quem considera a carga alta demais e quem considera a receita insuficiente para os serviços."
            },
            {
              "se": "valor == 'Os três'",
              "entao": "Você usa o instrumental completo. Divulgar o que encontrou costuma render mais efeito do que guardar o achado para si."
            }
          ],
          "proximoPasso": "Procure no portal da transparência do seu município quanto foi gasto na escola mais próxima."
        },
      },
    ],
  },
  {
    slug: "o-termometro-da-economia",
    titulo: "O termômetro da economia",
    subtitulo: "Selic, inflação, câmbio e PIB no seu extrato",
    segmento: "em",
    blocoId: "em-bloco-g",
    blocoRotulo: "Bloco G · Cenário e cidadania",
    ordem: 24,
    nivel: "avancado",
    duracaoMin: 4,
    pontos: 50,
    tags: ["cambio", "economia", "indicadores"],
    thumbnail: "/trilha/circulacao.png",
    estadoInicial: "travado",
    destravadoPor: "imposto-servico-publico-e-voce",
    habilidades: ["EM13LF03", "EM13LF44", "EM13LF46"],
    telas: [
      {
        ordem: 0,
        tipo: "conceito",
        label: "Cinco números do noticiário",
        conteudo: {
          "texto": "Cinco números resumem o noticiário. Inflação: seu dinheiro compra menos a cada mês. Selic: a taxa básica que encarece o crédito e melhora o rendimento da renda fixa. Desemprego alto: mais gente disputando a vaga ou o freela que você quer. PIB: o tamanho do que o país produz, e o que sobra para contratar. Dívida pública: juro do governo disputando espaço com escola e saúde no orçamento.",
          "destaque": "Nenhum deles é abstrato: cada um chega ao seu bolso por algum caminho."
        },
      },
      {
        ordem: 1,
        tipo: "cenario",
        label: "O dólar mexeu",
        conteudo: {
          "personagem": "Vinícius",
          "texto": "Vinícius, 27 anos, edita vídeo para um cliente nos Estados Unidos e recebe US$ 600 por mês. Quando fechou o contrato, o dólar valia R$ 5,20 — R$ 3.120. Meses depois, com o dólar a R$ 5,90, os mesmos US$ 600 viraram R$ 3.540, sem ele cobrar um centavo a mais. No mesmo período, o notebook importado que ele queria subiu de R$ 6.000 para R$ 6.700. Valores de exemplo, não a cotação de hoje.",
          "pergunta": "A alta do dólar foi boa ou ruim para Vinícius — e para quem não recebe em dólar?"
        },
      },
      {
        ordem: 2,
        tipo: "quiz",
        label: "Quando a moeda oscila",
        conteudo: {
          "enunciado": "Uma crise geopolítica no exterior faz investidores correrem para o dólar, que sobe frente ao real. No Brasil, o efeito imediato é:",
          "alternativas": [
            {
              "id": "a",
              "texto": "Todo mundo perde poder de compra, sem exceção.",
              "correta": false,
              "feedback": "Quem exporta ou recebe em moeda estrangeira passa a receber mais reais. O efeito depende de que lado da troca você está."
            },
            {
              "id": "b",
              "texto": "Importado e viagem ficam mais caros; quem exporta ou recebe em moeda estrangeira ganha mais reais.",
              "correta": true,
              "feedback": "Isso. E o encarecimento de combustível e insumos importados costuma chegar aos preços internos algumas semanas depois."
            },
            {
              "id": "c",
              "texto": "Nada muda para quem só compra produto nacional.",
              "correta": false,
              "feedback": "Muda: trigo, fertilizante, chip e combustível são cotados em dólar e entram no custo de coisas fabricadas aqui."
            }
          ]
        },
      },
      {
        ordem: 3,
        tipo: "input",
        label: "Sua leitura da inflação",
        conteudo: {
          "pergunta": "Na sua percepção, quanto os preços subiram no Brasil nos últimos 12 meses, em porcentagem?",
          "campo": "percentual",
          "placeholder": "6",
          "ajuda": "Chute pela sua experiência de compra; não precisa consultar índice nenhum."
        },
      },
      {
        ordem: 4,
        tipo: "resultado",
        label: "Seu número contra o mundo",
        conteudo: {
          "texto": "Você estimou {valor}. Como referência histórica, países ricos costumam operar perto de 2% ao ano, o Brasil orbitou entre 4% e 10% nas últimas duas décadas, e casos como Argentina e Turquia passaram de 40%. Quanto maior a inflação, mais alta tende a ser a Selic para segurá-la — e crédito caro esfria o PIB e o emprego, e encarece a dívida pública que o país precisa rolar.",
          "regras": [
            {
              "se": "valor < 4",
              "entao": "Sua percepção está na faixa de países de inflação baixa. Se a sua cesta subiu menos que a média, ela provavelmente é diferente da cesta média brasileira."
            },
            {
              "se": "valor entre 4 e 12",
              "entao": "É a faixa em que o Brasil costuma se mover. Vale comparar outro dado: o juro do rotativo do cartão aqui está entre os mais altos do mundo, o que faz a dívida das famílias crescer rápido."
            },
            {
              "se": "valor > 12",
              "entao": "Você sentiu mais do que a média costuma registrar. Índice é média de muitos itens; aluguel, transporte e alimentação podem ter subido bem mais na sua conta."
            }
          ],
          "proximoPasso": "Compare o preço de três itens que você compra sempre com o que pagava há um ano."
        },
      },
    ],
  },
]
