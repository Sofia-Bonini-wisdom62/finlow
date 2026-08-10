// GERADO por scripts/portar-ef.mts — não edite à mão.
// Fonte: prisma/trilha-escolar-fonte.ts · decisões: prisma/editorial-ef.ts

export interface TelaEF {
  ordem: number
  tipo: "conceito" | "cenario" | "quiz" | "input" | "resultado"
  label: string
  /** Orientação para quem conduz a turma. Não aparece para o aluno. */
  mediacao: string | null
  conteudo: unknown
}

export interface ModuloEF {
  slug: string
  titulo: string
  subtitulo: string
  /** Segmento escolar: "ef12" | "ef35" | "ef67" | "ef89" (lib/publico.ts). */
  publico: string
  blocoId: string
  blocoRotulo: string
  ordem: number
  nivel: string
  duracaoMin: number
  pontos: number
  tags: string[]
  thumbnail: string
  preRequisitoSlug: string | null
  ehRevisao: boolean
  situacoes: string[]
  tipoPerfil: string
  /** Habilidades da matriz do BC. Rastreabilidade — não é coluna. */
  habilidades: string[]
  telas: TelaEF[]
}

export const MODULOS_EF: ModuloEF[] = [
  {
    "slug": "ef12-o-dinheiro-serve-pra-que",
    "titulo": "O dinheiro serve pra quê",
    "subtitulo": "O que é dinheiro e como ele aparece no dia a dia.",
    "publico": "ef12",
    "blocoId": "ef12-bloco-a",
    "blocoRotulo": "Bloco A · Circulação social do dinheiro",
    "ordem": 1,
    "nivel": "iniciante",
    "duracaoMin": 2,
    "pontos": 30,
    "tags": [
      "dinheiro",
      "moedas",
      "cedulas"
    ],
    "thumbnail": "/trilha/circulacao.png",
    "preRequisitoSlug": null,
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef12",
    "habilidades": [
      "EF12LF01",
      "EF12LF02"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Para que serve o dinheiro",
        "mediacao": "Mostre uma moeda e uma cédula de verdade enquanto lê o texto.",
        "conteudo": {
          "headline": "Dinheiro é o que a gente troca por coisas.",
          "corpo": "Dinheiro serve para trocar. Você entrega dinheiro e recebe uma coisa: pão, ônibus, caderno. No Brasil o dinheiro se chama real. Ele aparece em moedas e em cédulas. A moeda de 1 real é redonda. A cédula de 10 reais é de papel."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A feira de Alessandra",
        "mediacao": "Pergunte quem já foi à feira antes de ler a história.",
        "conteudo": {
          "headline": "O que Alessandra deu, e o que ela recebeu?",
          "personagem": "Alessandra",
          "narrativa": "Alessandra foi à feira com a avó. A avó deu 10 reais para ela pagar. Alessandra entregou uma cédula de 10 reais na banca. A vendedora deu a sacola de laranjas. O dinheiro saiu da mão dela. As laranjas vieram no lugar."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Qual vale mais",
        "mediacao": "Leia as opções em voz alta e peça para a criança apontar.",
        "conteudo": {
          "headline": "Uma cédula de 10 reais ou uma moeda de 1 real: qual vale mais?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "A moeda de 1 real.",
              "correta": false,
              "feedback": "Um real é menos que dez reais. A moeda vale menos, mesmo sendo de metal."
            },
            {
              "letra": "B",
              "texto": "A cédula de 10 reais.",
              "correta": true,
              "feedback": "Isso. Dez reais valem mais que um real."
            },
            {
              "letra": "C",
              "texto": "As duas valem igual.",
              "correta": false,
              "feedback": "Não valem igual. O número escrito na cédula é maior."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Conte suas moedas",
        "mediacao": "Ajude a contar as moedas juntos e escreva o número.",
        "conteudo": {
          "headline": "Quantas moedas de 1 real você consegue encontrar em casa hoje?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Chutar um número perto do certo já serve.",
              "tipo": "decimal",
              "placeholder": "3"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O que dá para trocar",
        "mediacao": "Compare o número achado com uma cédula do mesmo valor.",
        "conteudo": {
          "headline": "Você encontrou {valor} moedas de 1 real. Cada uma vale 1 real. Juntas, elas dão para trocar por alguma coisa pequena.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Não achar nenhuma é normal. Em muitas casas o dinheiro fica no celular ou no cartão.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 4",
              "mensagem": "Com 3 moedas você tem 3 reais. Isso já compra um pão.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Cinco moedas viram 5 reais. É o mesmo valor da cédula de 5.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Peça para um adulto mostrar uma cédula de 5 reais e uma de 10 hoje."
        }
      }
    ]
  },
  {
    "slug": "ef12-mais-caro-mais-barato",
    "titulo": "Mais caro, mais barato",
    "subtitulo": "Comparar preços e juntar as moedas certas.",
    "publico": "ef12",
    "blocoId": "ef12-bloco-a",
    "blocoRotulo": "Bloco A · Circulação social do dinheiro",
    "ordem": 2,
    "nivel": "iniciante",
    "duracaoMin": 2,
    "pontos": 30,
    "tags": [
      "preco",
      "comparar",
      "moedas"
    ],
    "thumbnail": "/trilha/circulacao.png",
    "preRequisitoSlug": "ef12-o-dinheiro-serve-pra-que",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef12",
    "habilidades": [
      "EF12LF03",
      "EF12LF04",
      "EF12LF08"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Cada coisa tem um preço",
        "mediacao": "Mostre dois produtos com etiqueta de preço enquanto lê.",
        "conteudo": {
          "headline": "Mais caro custa mais dinheiro. Mais barato custa menos.",
          "corpo": "Todo produto tem um preço. O preço diz quanto dinheiro ele custa. Um pão custa menos que um pacote de arroz. O que custa mais é o mais caro. O que custa menos é o mais barato. Olhar o preço ajuda a escolher."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Três preços na prateleira",
        "mediacao": "Escreva os três preços num papel para a criança comparar.",
        "conteudo": {
          "headline": "Qual dos três é o mais barato?",
          "personagem": "Amanda",
          "narrativa": "Amanda foi ao mercado com o tio. Ela viu três preços na prateleira. O suco custa 4 reais. O biscoito custa 3 reais. O leite custa 6 reais. Amanda tem 5 reais na mão. Ela quer saber o que é mais barato."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Pagar 3 reais",
        "mediacao": "Use moedas de verdade para a criança montar os 3 reais.",
        "conteudo": {
          "headline": "Amanda vai pagar o biscoito de 3 reais. O que serve para pagar?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Três moedas de 1 real.",
              "correta": true,
              "feedback": "Isso. Três moedas de 1 real somam 3 reais."
            },
            {
              "letra": "B",
              "texto": "Uma moeda de 1 real.",
              "correta": false,
              "feedback": "Uma moeda dá só 1 real. Faltam 2 reais."
            },
            {
              "letra": "C",
              "texto": "Uma cédula de 2 reais.",
              "correta": false,
              "feedback": "Dois reais é menos que três. Ainda falta 1 real."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "O preço do pão",
        "mediacao": "Pergunte a um adulto o preço antes de escolher a faixa.",
        "conteudo": {
          "headline": "Quanto custa um pão na padaria perto da sua casa?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Se não souber, escolha o preço mais perto.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Menos de 1 real",
                  "valor": "0.5"
                },
                {
                  "label": "Entre 1 e 2 reais",
                  "valor": "1.5"
                },
                {
                  "label": "Entre 2 e 5 reais",
                  "valor": "3.5"
                },
                {
                  "label": "Mais de 5 reais",
                  "valor": "7"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Preço muda de lugar",
        "mediacao": "Leia o resultado e compare com o preço real da padaria.",
        "conteudo": {
          "headline": "Você disse que o pão custa {valor}. O preço do pão muda de bairro e de padaria. Por isso vale olhar antes de comprar.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0.5",
              "mensagem": "Existe pão barato assim. Vale conferir a etiqueta de novo.",
              "cor": "green"
            },
            {
              "condicao": "valor em 1.5,3.5",
              "mensagem": "Esse é o preço mais comum hoje. Boa estimativa.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Pão desse preço costuma ser grande ou especial.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Na próxima compra, leia duas etiquetas e diga qual é a mais barata."
        }
      }
    ]
  },
  {
    "slug": "ef12-quero-ou-preciso",
    "titulo": "Quero ou preciso",
    "subtitulo": "A diferença entre querer e precisar — e consertar antes de comprar.",
    "publico": "ef12",
    "blocoId": "ef12-bloco-b",
    "blocoRotulo": "Bloco B · Planejamento",
    "ordem": 3,
    "nivel": "iniciante",
    "duracaoMin": 2,
    "pontos": 30,
    "tags": [
      "desejo",
      "necessidade",
      "consertar"
    ],
    "thumbnail": "/trilha/orcamento.png",
    "preRequisitoSlug": "ef12-mais-caro-mais-barato",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef12",
    "habilidades": [
      "EF12LF05",
      "EF12LF09"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Querer e precisar",
        "mediacao": "Peça exemplos de algo que a criança quer e algo que precisa.",
        "conteudo": {
          "headline": "Precisar é o que falta. Querer é o que dá vontade.",
          "corpo": "Precisar é quando falta algo importante: comida, remédio, sapato para andar. Querer é gostar de algo que dá para viver sem. Os dois são normais. Precisar costuma vir primeiro. A diferença ajuda na hora de escolher onde o dinheiro vai."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A alça rasgada",
        "mediacao": "Pergunte se a criança já viu alguém consertar uma coisa quebrada.",
        "conteudo": {
          "headline": "Anderson precisava de mochila nova ou de conserto?",
          "personagem": "Anderson",
          "narrativa": "A mochila de Anderson rasgou na alça. Ele viu uma mochila nova por 40 reais na loja. Em casa, a tia disse que dava para costurar a alça. A linha custou 2 reais. Anderson usou a mesma mochila o ano inteiro."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Precisa ou quer",
        "mediacao": "Leia cada opção devagar e espere a criança pensar.",
        "conteudo": {
          "headline": "Sapato apertado que machuca o pé. Isso é precisar ou querer?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "É querer, porque sapato novo é bonito.",
              "correta": false,
              "feedback": "O motivo aqui não é ser bonito. É o pé machucando."
            },
            {
              "letra": "B",
              "texto": "É precisar, porque o pé dói e ele anda todo dia.",
              "correta": true,
              "feedback": "Isso. Sem um sapato que sirva, andar fica difícil."
            },
            {
              "letra": "C",
              "texto": "Não é nem um nem outro.",
              "correta": false,
              "feedback": "É sim uma necessidade. Faz falta no dia a dia."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Coisas para consertar",
        "mediacao": "Caminhe pela casa com a criança e conte junto.",
        "conteudo": {
          "headline": "Quantas coisas quebradas dá para consertar na sua casa?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Olhar em volta e contar por alto já serve.",
              "tipo": "decimal",
              "placeholder": "2"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Consertar antes de comprar",
        "mediacao": "Combine com a criança qual objeto será consertado primeiro.",
        "conteudo": {
          "headline": "Você contou {valor} coisas para consertar. Consertar costuma gastar menos que comprar de novo. E deixa menos lixo no mundo.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Não achar nada também é resposta. Olhe de novo outro dia.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 3",
              "mensagem": "Dá para começar por uma. Escolha a mais fácil.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "São muitas. Um adulto pode ajudar a escolher a primeira.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Escolha uma coisa quebrada e peça ajuda de um adulto para consertar hoje."
        }
      }
    ]
  },
  {
    "slug": "ef12-hoje-mes-que-vem",
    "titulo": "Hoje, mês que vem, ano que vem",
    "subtitulo": "Planejar é decidir a ordem das coisas.",
    "publico": "ef12",
    "blocoId": "ef12-bloco-b",
    "blocoRotulo": "Bloco B · Planejamento",
    "ordem": 4,
    "nivel": "iniciante",
    "duracaoMin": 2,
    "pontos": 30,
    "tags": [
      "tempo",
      "planejar",
      "ordem"
    ],
    "thumbnail": "/trilha/orcamento.png",
    "preRequisitoSlug": "ef12-quero-ou-preciso",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef12",
    "habilidades": [
      "EF12LF06",
      "EF12LF07"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Hoje, depois, mais longe",
        "mediacao": "Use o calendário da parede para mostrar hoje, o mês e o ano.",
        "conteudo": {
          "headline": "Curto é hoje. Médio é mês que vem. Longo é ano que vem.",
          "corpo": "Algumas coisas acontecem hoje. Outras acontecem mês que vem. Outras só ano que vem. Isso é curto, médio e longo prazo. Planejar é colocar as coisas em ordem no tempo. Quem planeja sabe o que vem primeiro."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A bola de Andressa",
        "mediacao": "Conte os meses no calendário junto com a criança.",
        "conteudo": {
          "headline": "Quantos meses Andressa espera até ter a bola?",
          "personagem": "Andressa",
          "narrativa": "Andressa quer uma bola que custa 30 reais. Ela junta 5 reais por mês do troco que sobra. Em um mês ela tem 5 reais. Em seis meses ela tem 30 reais. Andressa marcou no calendário o mês em que vai dar certo."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Curto ou longo",
        "mediacao": "Marque seis meses no calendário antes de responder.",
        "conteudo": {
          "headline": "Juntar 5 reais por mês até 30 reais leva seis meses. Isso é o quê?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Curto prazo, porque acontece hoje.",
              "correta": false,
              "feedback": "Hoje não dá. Seis meses é bem mais tempo."
            },
            {
              "letra": "B",
              "texto": "Médio prazo, porque leva alguns meses.",
              "correta": true,
              "feedback": "Isso. Não é hoje nem daqui a anos. Fica no meio."
            },
            {
              "letra": "C",
              "texto": "Longo prazo, porque passa de um ano.",
              "correta": false,
              "feedback": "Seis meses é menos de um ano. Ainda não é longo."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Quando isso cabe",
        "mediacao": "Peça para a criança dizer em voz alta o que ela pensou.",
        "conteudo": {
          "headline": "Pense em algo que você quer. Quando dá para acontecer?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Escolher a faixa mais perto já serve.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Hoje",
                  "valor": "1"
                },
                {
                  "label": "Esta semana",
                  "valor": "2"
                },
                {
                  "label": "Mês que vem",
                  "valor": "3"
                },
                {
                  "label": "Ano que vem",
                  "valor": "4"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Cada plano tem seu tempo",
        "mediacao": "Ajude a criança a escrever o primeiro passo no papel.",
        "conteudo": {
          "headline": "Você escolheu {valor}. Cada plano tem um tempo certo. Saber o tempo ajuda a organizar os passos na ordem.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor em 1,2",
              "mensagem": "É curto prazo. Um passo hoje já resolve boa parte.",
              "cor": "green"
            },
            {
              "condicao": "valor == 3",
              "mensagem": "É médio prazo. Dá para dividir em quatro semanas.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "É longo prazo. Marque no calendário para não esquecer.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Escreva num papel o primeiro passo e cole num lugar que você vê todo dia."
        }
      }
    ]
  },
  {
    "slug": "ef12-juntar-da-certo",
    "titulo": "Juntar dá certo",
    "subtitulo": "O cofrinho e a ideia de guardar para conseguir algo.",
    "publico": "ef12",
    "blocoId": "ef12-bloco-c",
    "blocoRotulo": "Bloco C · Poupança e investimento",
    "ordem": 5,
    "nivel": "iniciante",
    "duracaoMin": 2,
    "pontos": 30,
    "tags": [
      "poupar",
      "cofrinho",
      "guardar"
    ],
    "thumbnail": "/trilha/poupar.png",
    "preRequisitoSlug": "ef12-hoje-mes-que-vem",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef12",
    "habilidades": [
      "EF12LF10",
      "EF12LF11",
      "EF12LF12"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Guardar um pouco por vez",
        "mediacao": "Mostre um cofrinho ou um pote com tampa enquanto lê.",
        "conteudo": {
          "headline": "Poupar é juntar e guardar até dar para comprar.",
          "corpo": "Poupar é juntar dinheiro aos poucos e guardar. Guardado, o dinheiro não some em compras pequenas. Depois de um tempo, o valor junto dá para comprar algo maior. O cofrinho é um lugar simples de guardar. Poupar é isso: juntar e esperar."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O pote de Aparecida",
        "mediacao": "Conte as semanas com os dedos junto com a criança.",
        "conteudo": {
          "headline": "Quantas semanas Aparecida guardou até conseguir o estojo?",
          "personagem": "Aparecida",
          "narrativa": "Aparecida quer um estojo de 12 reais. Ela guarda 2 reais por semana num pote de vidro. Na primeira semana tem 2 reais. Na sexta semana tem 12 reais. Nesse dia, ela tira o dinheiro do pote e compra o estojo."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Quanto falta",
        "mediacao": "Use 12 tampinhas para a criança separar e contar.",
        "conteudo": {
          "headline": "Aparecida já tem 8 reais no pote. O estojo custa 12. Quanto falta?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "2 reais.",
              "correta": false,
              "feedback": "8 mais 2 dá 10. Ainda não chega em 12."
            },
            {
              "letra": "B",
              "texto": "4 reais.",
              "correta": true,
              "feedback": "Isso. 8 mais 4 dá 12, o preço do estojo."
            },
            {
              "letra": "C",
              "texto": "12 reais.",
              "correta": false,
              "feedback": "Esse é o preço inteiro. Parte dele ela já tem."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Seu cofrinho",
        "mediacao": "Explique que guardar pouco também conta e anote o número.",
        "conteudo": {
          "headline": "Quantos reais você guardaria por semana num cofrinho?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Um número pequeno já vale; chutar por alto serve.",
              "tipo": "decimal",
              "placeholder": "2"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Em quatro semanas",
        "mediacao": "Ajude a criança a fazer a conta de quatro semanas.",
        "conteudo": {
          "headline": "Você guardaria {valor} reais por semana. Em quatro semanas isso vira quatro vezes esse valor. Guardar sempre no mesmo dia ajuda a não esquecer.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Tem semana em que não sobra nada. Guardar depois também vale.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 5",
              "mensagem": "Pouco por semana junta. Em um mês já dá para ver.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "É bastante por semana. Veja se dá para manter todo mês.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Separe hoje um pote com tampa e guarde a primeira moeda nele."
        }
      }
    ]
  },
  {
    "slug": "ef35-jeitos-de-pagar",
    "titulo": "Jeitos de pagar",
    "subtitulo": "Dinheiro, cartão, Pix, carnê: cada um tem seu preço.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-a",
    "blocoRotulo": "Bloco A · Circulação social do dinheiro",
    "ordem": 1,
    "nivel": "iniciante",
    "duracaoMin": 2,
    "pontos": 30,
    "tags": [
      "pagamento",
      "pix",
      "cartao"
    ],
    "thumbnail": "/trilha/circulacao.png",
    "preRequisitoSlug": null,
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF35LF01",
      "EF35LF02",
      "EF45LF01"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Vários jeitos, um produto",
        "mediacao": "Pergunte quais desses jeitos de pagar a criança já viu alguém usar.",
        "conteudo": {
          "headline": "Pagar à vista tira o dinheiro agora. A prazo, tira depois, aos poucos.",
          "corpo": "Existem vários jeitos de pagar a mesma compra. Dinheiro em espécie, Pix, cartão de débito, cartão de crédito e carnê da loja. Todos entregam o produto. O que muda é quando o dinheiro sai da sua mão. No Pix e no dinheiro, sai na hora. No carnê e no crédito, sai depois, em pedaços."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O tênis com três preços",
        "mediacao": "Escreva os três preços no quadro e compare em voz alta com a turma.",
        "conteudo": {
          "headline": "Por que o mesmo tênis custa três preços diferentes?",
          "personagem": "Ariane",
          "narrativa": "Ariane vai comprar um tênis de R$ 120. Na loja, o vendedor oferece três jeitos. Sai por R$ 108 no Pix agora. Sai por R$ 120 no cartão de débito. Ou vira um carnê de quatro parcelas de R$ 33. Ariane soma o carnê e chega em R$ 132."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Qual sai mais barato",
        "mediacao": "Leia as três opções em voz alta e peça a justificativa antes de marcar.",
        "conteudo": {
          "headline": "Ariane tem os R$ 120 guardados e quer gastar o mínimo. Qual jeito cobra menos por esse tênis?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "O carnê de quatro parcelas de R$ 33.",
              "correta": false,
              "feedback": "Cada parcela é pequena, mas as quatro somam R$ 132. É o jeito mais caro dos três."
            },
            {
              "letra": "B",
              "texto": "O Pix, que sai por R$ 108 na hora.",
              "correta": true,
              "feedback": "Certo. Pagar à vista rendeu R$ 12 de desconto, e ela tinha o dinheiro guardado."
            },
            {
              "letra": "C",
              "texto": "O cartão de débito, por R$ 120.",
              "correta": false,
              "feedback": "O débito também tira o dinheiro na hora, mas sem desconto. São R$ 12 a mais que o Pix."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "O preço da sua lista",
        "mediacao": "Ajude a criança a lembrar de um preço que viu em loja ou anúncio.",
        "conteudo": {
          "headline": "Escreva o preço de algo que você gostaria de comprar.",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Se não souber o preço exato, um valor aproximado já serve.",
              "tipo": "decimal",
              "placeholder": "R$ 80"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "À vista ou aos poucos",
        "mediacao": "Peça um exemplo de compra à vista e outro de compra a prazo.",
        "conteudo": {
          "headline": "Você anotou {valor}. Imagine esse preço em dois caminhos. Um: pagar tudo de uma vez. Outro: pagar em quatro pedaços, ao longo de quatro meses. O produto chega igual nos dois. O que muda é quanto sai e quando.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 50",
              "mensagem": "É um preço que cabe à vista com pouca espera. Guardar algumas semanas costuma custar menos que parcelar.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 200",
              "mensagem": "Nessa faixa a loja costuma oferecer carnê. Compare o total do carnê com o preço à vista.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Compra grande quase sempre vem com parcelas. Some todas elas: o total costuma passar do preço à vista.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Pergunte em casa qual jeito de pagar a família mais usa e por quê."
        }
      }
    ]
  },
  {
    "slug": "ef35-preco-nao-e-valor",
    "titulo": "Preço não é valor",
    "subtitulo": "Por que duas coisas parecidas custam diferente.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-a",
    "blocoRotulo": "Bloco A · Circulação social do dinheiro",
    "ordem": 2,
    "nivel": "iniciante",
    "duracaoMin": 2,
    "pontos": 30,
    "tags": [
      "preco",
      "valor",
      "marca"
    ],
    "thumbnail": "/trilha/circulacao.png",
    "preRequisitoSlug": "ef35-jeitos-de-pagar",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF35LF03",
      "EF35LF04"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Etiqueta e uso",
        "mediacao": "Peça um exemplo de algo barato que a criança considera muito importante.",
        "conteudo": {
          "headline": "Preço vem da etiqueta. Valor vem de quem usa.",
          "corpo": "Preço é o número da etiqueta. Ele é igual para todo mundo que entra na loja. Valor é o quanto a coisa serve para você. Esse muda de pessoa para pessoa. Uma bola de R$ 40 tem o mesmo preço para todos. Mas vale mais para quem joga todo dia."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Dois cadernos",
        "mediacao": "Peça para a criança comparar o número de folhas antes de olhar o preço.",
        "conteudo": {
          "headline": "O que o preço a mais está pagando, se as folhas são menos?",
          "personagem": "Benedito",
          "narrativa": "Benedito quer um caderno. Na papelaria há dois. Um custa R$ 8, tem capa simples e 96 folhas. O outro custa R$ 25, tem o desenho de um jogo famoso e 80 folhas. O mais caro tem menos folhas. Benedito escreve muito e gasta caderno rápido."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Por que custa mais",
        "mediacao": "Leia as alternativas e peça para a criança apontar qual explica o preço.",
        "conteudo": {
          "headline": "O caderno de R$ 25 tem menos folhas e custa mais. O que explica esse preço maior?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "O papel dele é caro porque tem menos folhas.",
              "correta": false,
              "feedback": "Menos folhas usam menos papel, não mais. A diferença está em outra coisa."
            },
            {
              "letra": "B",
              "texto": "A marca e o desenho do jogo na capa, que muita gente procura.",
              "correta": true,
              "feedback": "Isso. Marca, desenho licenciado e procura entram no preço. Nada disso melhora o que o caderno faz."
            },
            {
              "letra": "C",
              "texto": "O mais caro é sempre o de melhor qualidade.",
              "correta": false,
              "feedback": "Nem sempre. Aqui o mais caro tem menos folhas: preço alto não garante qualidade."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Barato e importante",
        "mediacao": "Ajude a criança a escolher um objeto real, da casa ou da mochila.",
        "conteudo": {
          "headline": "Pense numa coisa sua que custou pouco e é muito importante para você. Quanto custou?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Se não lembrar o preço exato, um valor aproximado já serve.",
              "tipo": "decimal",
              "placeholder": "R$ 10"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Duas medidas diferentes",
        "mediacao": "Peça para a criança explicar a diferença entre preço e valor com as próprias palavras.",
        "conteudo": {
          "headline": "Essa coisa custou {valor}. Mesmo assim, você a escolheu como importante. Isso mostra que preço e valor são medidas diferentes. Uma está na etiqueta. A outra está em quem usa.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 20",
              "mensagem": "Uma coisa barata em lugar importante é a prova de que valor não vem do preço.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 100",
              "mensagem": "Preço médio e uso constante. Aqui preço e valor andam perto, mas continuam sendo coisas diferentes.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Foi um gasto alto. Pergunte quanto do preço veio do uso e quanto veio da marca.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Compare hoje dois produtos parecidos na mesma prateleira e veja o que muda o preço."
        }
      }
    ]
  },
  {
    "slug": "ef35-troco-desconto-lucro",
    "titulo": "Troco, desconto, lucro e prejuízo",
    "subtitulo": "As quatro contas que aparecem em toda compra e venda.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-a",
    "blocoRotulo": "Bloco A · Circulação social do dinheiro",
    "ordem": 3,
    "nivel": "iniciante",
    "duracaoMin": 2,
    "pontos": 30,
    "tags": [
      "troco",
      "desconto",
      "lucro"
    ],
    "thumbnail": "/trilha/circulacao.png",
    "preRequisitoSlug": "ef35-preco-nao-e-valor",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF35LF05",
      "EF35LF06",
      "EF45LF02"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Quatro contas da venda",
        "mediacao": "Peça exemplos de troco que a criança já viu e anote no quadro.",
        "conteudo": {
          "headline": "Troco volta depois de pagar. Desconto tira antes de pagar.",
          "corpo": "Troco é o dinheiro que volta quando você paga mais do que a conta. Desconto é um abatimento no preço, antes de pagar. Quem vende também faz contas. Se entrou mais do que foi gasto para produzir, houve lucro. Se entrou menos, houve prejuízo."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Os bolinhos da feira",
        "mediacao": "Faça a conta do troco no papel: R$ 10 menos dois bolinhos de R$ 3.",
        "conteudo": {
          "headline": "Quanto a professora recebeu de troco, e quanto entrou na caixa no fim?",
          "personagem": "Bruna",
          "narrativa": "Bruna gastou R$ 30 com ingredientes e assou 20 bolinhos para a feira da escola. Vendeu cada um por R$ 3. Uma professora levou dois, pagou com uma nota de R$ 10 e recebeu troco. No fim, para não sobrar nada, Bruna deu R$ 1 de desconto nos últimos quatro."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Quanto entrou na caixa",
        "mediacao": "Deixe a criança fazer as duas multiplicações no papel antes de marcar.",
        "conteudo": {
          "headline": "Bruna vendeu 16 bolinhos por R$ 3 e mais quatro com R$ 1 de desconto cada. Quanto entrou?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "R$ 60, porque eram 20 bolinhos de R$ 3.",
              "correta": false,
              "feedback": "R$ 60 seria o total sem desconto. Os quatro últimos saíram por R$ 2 cada."
            },
            {
              "letra": "B",
              "texto": "R$ 56",
              "correta": true,
              "feedback": "Certo. São 16 × R$ 3 = R$ 48, mais 4 × R$ 2 = R$ 8. Total de R$ 56."
            },
            {
              "letra": "C",
              "texto": "R$ 40, tirando R$ 1 de cada um dos 20 bolinhos.",
              "correta": false,
              "feedback": "O desconto valeu só para os quatro últimos. Os outros 16 saíram por R$ 3 cheios."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Seu preço de venda",
        "mediacao": "Ajude a criança a pensar em quanto os colegas pagariam de verdade.",
        "conteudo": {
          "headline": "Se você vendesse bolinhos como Bruna, por quanto venderia cada um?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Pense num preço que as pessoas da sua escola pagariam; estimativa serve.",
              "tipo": "decimal",
              "placeholder": "R$ 3"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Sobrou ou faltou",
        "mediacao": "Faça junto a multiplicação do preço por 20 e subtraia os R$ 30.",
        "conteudo": {
          "headline": "Você venderia cada bolinho por {valor}. Com 20 vendidos, é esse preço vezes 20 que entra na caixa. Desse total ainda sai o gasto com ingredientes, que foi R$ 30. O que sobra é lucro. Se não sobrar nada, é prejuízo.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 1.50",
              "mensagem": "Vinte bolinhos a esse preço entram com menos de R$ 30. Como o gasto foi R$ 30, dá prejuízo.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 3",
              "mensagem": "Entram entre R$ 30 e R$ 60. Empata ou sobra pouco: o lucro existe, mas é apertado.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Entram mais de R$ 60 e sobram mais de R$ 30 de lucro. Se as pessoas aceitarem pagar.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Some hoje o gasto e a entrada de uma venda pequena da sua escola."
        }
      }
    ]
  },
  {
    "slug": "ef35-papeis-do-dinheiro",
    "titulo": "Os papéis do dinheiro",
    "subtitulo": "Recibo, cupom, boleto: o que cada documento conta.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-a",
    "blocoRotulo": "Bloco A · Circulação social do dinheiro",
    "ordem": 4,
    "nivel": "iniciante",
    "duracaoMin": 2,
    "pontos": 30,
    "tags": [
      "cupom",
      "recibo",
      "boleto"
    ],
    "thumbnail": "/trilha/circulacao.png",
    "preRequisitoSlug": "ef35-troco-desconto-lucro",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF35LF07",
      "EF35LF08"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Cada papel tem função",
        "mediacao": "Leve um cupom fiscal de verdade e mostre onde fica cada informação.",
        "conteudo": {
          "headline": "Cada documento responde uma pergunta: o quê, quanto, quem pagou, até quando.",
          "corpo": "Toda compra deixa um registro, no papel ou na tela. O cupom fiscal mostra o que foi comprado e quanto custou. O recibo prova que alguém pagou. O boleto é uma cobrança com data de vencimento. O extrato lista o que entrou e o que saiu de uma conta."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A caixa de papéis",
        "mediacao": "Peça para a criança apontar, em cada papel, onde aparece o valor.",
        "conteudo": {
          "headline": "Qual desses três papéis tem uma data que não pode ser esquecida?",
          "personagem": "Camila",
          "narrativa": "Camila ajuda a organizar os papéis da casa numa caixa. Aparecem três. Um cupom fiscal do mercado, com 12 itens e total de R$ 87,40. Um boleto da internet de R$ 79, com vencimento no dia 15. E um recibo assinado do conserto da geladeira, de R$ 150."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Onde está a resposta",
        "mediacao": "Leia as três opções e peça a justificativa da escolha antes de marcar.",
        "conteudo": {
          "headline": "Camila quer saber quanto a família gastou no mercado e o que comprou. Qual documento responde as duas coisas?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "O boleto da internet, porque mostra um valor.",
              "correta": false,
              "feedback": "O boleto mostra um valor, mas é a cobrança da internet. Ele não lista compras do mercado."
            },
            {
              "letra": "B",
              "texto": "O cupom fiscal, que lista os itens e o total.",
              "correta": true,
              "feedback": "Isso. O cupom fiscal traz item por item, a quantidade e o total pago."
            },
            {
              "letra": "C",
              "texto": "O recibo do conserto, porque prova um pagamento.",
              "correta": false,
              "feedback": "O recibo prova que o conserto foi pago. Ele não diz nada sobre o mercado."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "O total do seu cupom",
        "mediacao": "Ajude a achar a linha do total, que costuma vir em letra maior no fim.",
        "conteudo": {
          "headline": "Procure um cupom fiscal em casa ou na mochila. Qual é o total dele?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Se não achar nenhum, use o valor de uma compra que você lembra.",
              "tipo": "decimal",
              "placeholder": "R$ 42,90"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Ler é achar a linha",
        "mediacao": "Faça a leitura final com o cupom na mão, apontando cada parte citada.",
        "conteudo": {
          "headline": "O total do seu cupom foi {valor}. Esse número fica numa linha específica do documento. Perto dele estão a data e a lista do que foi comprado. Saber onde procurar é o que transforma um papel em informação útil.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 30",
              "mensagem": "Compra pequena. Confira se todos os itens da lista foram mesmo levados: erro de cupom acontece.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 150",
              "mensagem": "Compra do dia a dia. Vale comparar o total do cupom com o que estava combinado.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Compra grande. Guarde esse cupom: ele serve para trocar produto e conferir cobrança depois.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Guarde um cupom hoje e circule nele a data, o total e um item."
        }
      }
    ]
  },
  {
    "slug": "ef35-quero-ou-preciso-2",
    "titulo": "Querer é ilimitado, ter não é",
    "subtitulo": "Prioridade aparece quando o recurso acaba antes do desejo.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-b",
    "blocoRotulo": "Bloco B · Planejamento",
    "ordem": 5,
    "nivel": "iniciante",
    "duracaoMin": 2,
    "pontos": 30,
    "tags": [
      "desejo",
      "necessidade",
      "prioridade"
    ],
    "thumbnail": "/trilha/orcamento.png",
    "preRequisitoSlug": "ef35-papeis-do-dinheiro",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF35LF09",
      "EF45LF06"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Lista sem fim",
        "mediacao": "Peça um exemplo de necessidade e um de desejo antes de seguir.",
        "conteudo": {
          "headline": "A lista de desejos não tem fim. O dinheiro tem. Daí vem a prioridade.",
          "corpo": "Necessidade é o que você precisa para viver e estudar. Comida, remédio e material escolar entram aí. Desejo é o que você gostaria de ter, mesmo sem precisar. Os dois são legítimos. O problema é que a lista de desejos nunca acaba e o dinheiro acaba. Por isso é preciso escolher a ordem."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Quatro coisas, R$ 50",
        "mediacao": "Escreva os quatro itens no quadro e peça para a turma ordenar.",
        "conteudo": {
          "headline": "Com R$ 50, o que entra primeiro na lista de Carlos?",
          "personagem": "Carlos",
          "narrativa": "Carlos tem R$ 50 juntados. Ele quer quatro coisas. Um jogo de R$ 45. Um tênis de futsal de R$ 90. Um fone de R$ 35. E a caneta que acabou, de R$ 5, exigida na lista da escola. Somando tudo, dá R$ 175. Ele tem menos de um terço desse total."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "O que vem primeiro",
        "mediacao": "Peça para a criança dizer quanto sobra em cada uma das opções.",
        "conteudo": {
          "headline": "Carlos tem R$ 50 e quer R$ 175 em coisas. Qual é a melhor primeira compra?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "O jogo de R$ 45, porque é o que ele mais quer.",
              "correta": false,
              "feedback": "É o maior desejo, mas gastaria quase tudo. A caneta pedida pela escola ficaria de fora."
            },
            {
              "letra": "B",
              "texto": "A caneta de R$ 5, que a escola pediu.",
              "correta": true,
              "feedback": "Certo. A necessidade entra primeiro, e ainda sobram R$ 45 para escolher com calma."
            },
            {
              "letra": "C",
              "texto": "O tênis de R$ 90, porque é o mais caro.",
              "correta": false,
              "feedback": "Ele não tem R$ 90. Preço alto não é o mesmo que prioridade."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua lista de agora",
        "mediacao": "Deixe a criança listar em voz alta e conte os itens junto com ela.",
        "conteudo": {
          "headline": "Quantas coisas você gostaria de comprar se pudesse escolher agora?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Conte tudo que vier à cabeça; não precisa pensar no preço.",
              "tipo": "decimal",
              "placeholder": "5"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Ordem, não corte",
        "mediacao": "Ajude a numerar a ordem dos itens da lista depois de ler o fechamento.",
        "conteudo": {
          "headline": "Você listou {valor} coisas. Agora pense no dinheiro disponível hoje. Quase sempre ele cabe em menos itens do que a lista. Isso não é falha sua nem da sua família: é assim para todo mundo. A saída é decidir a ordem, e a necessidade vai primeiro.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 3",
              "mensagem": "Lista curta. Marque qual desses é necessidade e qual é desejo antes de escolher.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 8",
              "mensagem": "Lista média. Separe em duas colunas, necessidade e desejo, e numere a ordem.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Lista longa, o que é normal. Ela mostra que desejo não acaba: escolha só os dois primeiros.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Escreva sua lista em duas colunas: necessidade de um lado, desejo do outro."
        }
      }
    ]
  },
  {
    "slug": "ef35-onde-quero-chegar",
    "titulo": "Onde eu quero chegar",
    "subtitulo": "Objetivo de curto, médio e longo prazo com data e valor.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-b",
    "blocoRotulo": "Bloco B · Planejamento",
    "ordem": 6,
    "nivel": "iniciante",
    "duracaoMin": 2,
    "pontos": 30,
    "tags": [
      "objetivo",
      "prazo",
      "planejamento"
    ],
    "thumbnail": "/trilha/orcamento.png",
    "preRequisitoSlug": "ef35-quero-ou-preciso-2",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF35LF10",
      "EF45LF08"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Valor e data",
        "mediacao": "Pergunte o que a criança quer conseguir até o fim do mês.",
        "conteudo": {
          "headline": "Objetivo sem valor e sem data continua sendo só vontade.",
          "corpo": "Objetivo é uma coisa que você quer alcançar, com valor e data. Curto prazo é o que cabe em poucas semanas. Médio prazo leva alguns meses. Longo prazo passa de um ano. Escrever o valor e a data transforma o desejo em plano. É isso que mostra quanto guardar por semana."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Três objetivos na folha",
        "mediacao": "Faça a divisão junto: R$ 40 guardando R$ 10 por semana dá quantas semanas?",
        "conteudo": {
          "headline": "Qual dos três objetivos ela alcança primeiro, e em quantas semanas?",
          "personagem": "Cássia",
          "narrativa": "Cássia quer três coisas. Um livro de R$ 40. Uma bicicleta usada de R$ 300. E um curso de natação que começa no ano que vem. Ela consegue guardar R$ 10 por semana, do que ganha ajudando a vizinha com as plantas. Cássia escreve os três numa folha e põe uma data em cada."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Quantas semanas",
        "mediacao": "Deixe a criança fazer a divisão no papel antes de escolher a alternativa.",
        "conteudo": {
          "headline": "Cássia guarda R$ 10 por semana. Em quantas semanas ela junta os R$ 300 da bicicleta?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "10 semanas",
              "correta": false,
              "feedback": "Em 10 semanas ela junta R$ 100, um terço do preço. Ainda faltariam R$ 200."
            },
            {
              "letra": "B",
              "texto": "30 semanas",
              "correta": true,
              "feedback": "Certo. R$ 300 divididos por R$ 10 dão 30 semanas, cerca de sete meses. É médio prazo."
            },
            {
              "letra": "C",
              "texto": "300 semanas",
              "correta": false,
              "feedback": "Aí você contou uma semana por real. Cada semana entra R$ 10, não R$ 1."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Seu objetivo",
        "mediacao": "Ajude a criança a escolher um objetivo real e lembrar o preço aproximado.",
        "conteudo": {
          "headline": "Escreva o valor de um objetivo que você quer alcançar.",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Vale um preço aproximado; o importante é ter um número para dividir.",
              "tipo": "decimal",
              "placeholder": "R$ 60"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Do valor até a data",
        "mediacao": "Ajude a criança a calcular a data a partir do valor que ela escreveu.",
        "conteudo": {
          "headline": "Seu objetivo custa {valor}. Divida esse número pelo que você consegue guardar por semana. O resultado é a data. Guardando R$ 5 por semana, por exemplo, R$ 100 levam 20 semanas.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 50",
              "mensagem": "Objetivo de curto prazo. Guardando R$ 5 por semana, ele chega em até dez semanas.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 200",
              "mensagem": "Objetivo de médio prazo, de alguns meses. Marque a data no calendário para não largar no meio.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Objetivo de longo prazo. Divida em etapas menores e confira cada pedaço juntado.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Escreva hoje seu objetivo num papel, com o valor e a data ao lado."
        }
      }
    ]
  },
  {
    "slug": "ef35-o-que-e-orcamento",
    "titulo": "O que é um orçamento",
    "subtitulo": "Receita, despesa e o caderno onde isso vive.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-b",
    "blocoRotulo": "Bloco B · Planejamento",
    "ordem": 7,
    "nivel": "iniciante",
    "duracaoMin": 2,
    "pontos": 30,
    "tags": [
      "orcamento",
      "receita",
      "despesa"
    ],
    "thumbnail": "/trilha/orcamento.png",
    "preRequisitoSlug": "ef35-onde-quero-chegar",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF35LF11",
      "EF35LF12",
      "EF35LF13"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "O que entra e o que sai",
        "mediacao": "Peça exemplos de dinheiro que entra e que sai na casa da criança.",
        "conteudo": {
          "headline": "Receita é o que entra. Despesa é o que sai. Orçamento registra os dois.",
          "corpo": "Orçamento é o registro do dinheiro que entra e do que sai, num período. O que entra chama-se receita: salário, venda, ajuda de alguém. O que sai chama-se despesa: mercado, transporte, conta de luz. Anotar os dois num caderno ou no celular mostra para onde o dinheiro está indo."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O caixa da festa",
        "mediacao": "Monte as duas colunas no quadro com a turma e some cada uma delas.",
        "conteudo": {
          "headline": "Quanto entrou, quanto saiu e o que sobrou no caixa da Célia?",
          "personagem": "Célia",
          "narrativa": "Célia cuida do caixa da festa junina da turma. Entraram R$ 200 da rifa e R$ 120 da venda de pipoca. Saíram R$ 90 de ingredientes, R$ 40 de enfeites e R$ 25 de sacos e copos. Ela anota tudo numa folha, com duas colunas: o que entrou e o que saiu."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Em qual coluna",
        "mediacao": "Leia a pergunta e peça para a criança apontar a coluna certa no quadro.",
        "conteudo": {
          "headline": "Na folha de Célia, em qual coluna entram os R$ 90 dos ingredientes, e por quê?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Na de receita, porque o dinheiro foi usado na festa.",
              "correta": false,
              "feedback": "Receita é só o que entra. Os ingredientes foram dinheiro saindo do caixa."
            },
            {
              "letra": "B",
              "texto": "Na de despesa, porque foi dinheiro que saiu do caixa.",
              "correta": true,
              "feedback": "Certo. Toda saída é despesa, mesmo quando serve para produzir algo que será vendido."
            },
            {
              "letra": "C",
              "texto": "Em nenhuma, porque a pipoca foi vendida depois.",
              "correta": false,
              "feedback": "Todo valor que sai precisa ser anotado. Sem isso, o registro não bate com o dinheiro real."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua receita da semana",
        "mediacao": "Ajude a criança a lembrar de entradas pequenas, inclusive troco e presente.",
        "conteudo": {
          "headline": "Quanto de dinheiro entrou na sua mão nos últimos sete dias?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Conte troco, presente, venda ou mesada. Se não entrou nada, anote zero.",
              "tipo": "decimal",
              "placeholder": "R$ 15"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Falta a outra coluna",
        "mediacao": "Monte a folha de duas colunas junto com a criança antes de encerrar.",
        "conteudo": {
          "headline": "Entraram {valor} na sua mão em sete dias. Essa é a sua receita da semana. Agora falta a outra coluna: quanto saiu. Um orçamento só funciona quando as duas colunas existem e são anotadas na hora.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Semana sem entrada acontece, e não é problema seu. O registro ainda mostra quando o dinheiro aparece.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 50",
              "mensagem": "Entrada pequena e comum nessa idade. Anotar cada real ajuda a ver quanto some sem você perceber.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Entrou um valor razoável. Sem registrar as saídas, ele some sem explicação até o fim do mês.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Faça hoje uma folha com duas colunas e anote uma entrada e uma saída."
        }
      }
    ]
  },
  {
    "slug": "ef35-orcamento-que-fecha",
    "titulo": "Fazendo o orçamento fechar",
    "subtitulo": "Gastar menos do que entra, sozinho ou em grupo.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-b",
    "blocoRotulo": "Bloco B · Planejamento",
    "ordem": 8,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "orcamento",
      "saldo",
      "grupo"
    ],
    "thumbnail": "/trilha/orcamento.png",
    "preRequisitoSlug": "ef35-o-que-e-orcamento",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF35LF14",
      "EF35LF15",
      "EF35LF16"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Quando o orçamento fecha",
        "mediacao": "Pergunte quais gastos da casa são de uma pessoa só e quais são de todos.",
        "conteudo": {
          "headline": "Sobrou no fim: saldo positivo. Faltou: o orçamento não fechou.",
          "corpo": "Um orçamento fecha quando as despesas ficam menores que as receitas. O que sobra chama-se saldo positivo. É ele que permite guardar ou resolver um imprevisto. Entre os gastos, alguns são só seus, como um lanche. Outros são divididos, como a conta de luz, que serve a casa inteira."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O passeio da turma",
        "mediacao": "Some as entradas e subtraia o transporte no quadro, com a turma acompanhando.",
        "conteudo": {
          "headline": "Quanto sobra no caixa do passeio, e esse dinheiro é de quem?",
          "personagem": "Cíntia",
          "narrativa": "Cíntia organiza o passeio da turma. Entram R$ 15 de cada um dos 20 estudantes, o que dá R$ 300. A despesa prevista é R$ 180 do transporte, dividido por todos. O lanche fica por conta de cada um, que leva ou compra o seu. Ela quer terminar o dia sem dever nada."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "De todos ou de um",
        "mediacao": "Peça para a criança dizer quem paga cada um dos dois gastos.",
        "conteudo": {
          "headline": "No orçamento do passeio, qual gasto é do grupo e qual é individual?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "O transporte é individual e o lanche é do grupo.",
              "correta": false,
              "feedback": "É o contrário. O transporte serve a turma inteira e cada lanche é de uma pessoa só."
            },
            {
              "letra": "B",
              "texto": "O transporte é do grupo e o lanche é individual.",
              "correta": true,
              "feedback": "Certo. O transporte é dividido entre todos e o lanche cada um resolve por conta própria."
            },
            {
              "letra": "C",
              "texto": "Os dois são do grupo, porque estão no mesmo passeio.",
              "correta": false,
              "feedback": "Acontecer no mesmo dia não junta os gastos. No caixa do grupo entra só o que todos pagam."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "O custo do seu evento",
        "mediacao": "Ajude a criança a listar duas ou três despesas antes de somar.",
        "conteudo": {
          "headline": "Pense num evento que você faria com a turma. Quanto ele custaria no total?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Some as despesas principais; um valor aproximado já serve.",
              "tipo": "decimal",
              "placeholder": "R$ 200"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Quem paga e quanto sobra",
        "mediacao": "Faça a divisão do custo pelo número de participantes junto com a criança.",
        "conteudo": {
          "headline": "Seu evento custaria {valor}. Agora vem a outra metade do orçamento. De onde vem esse dinheiro e quantas pessoas dividem a conta? Se entrar mais do que {valor}, sobra saldo positivo. Se entrar menos, falta, e alguém precisa cobrir a diferença.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 100",
              "mensagem": "Custo baixo. Dividido por uma turma de 20, fica em R$ 5 por pessoa ou menos.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 300",
              "mensagem": "Divida pelo número de participantes. Assim você acha a cota e confere se ela cabe no bolso de todos.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Custo alto. Corte uma despesa ou busque outra entrada, como rifa, antes de aumentar a cota.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Escreva hoje o orçamento de um evento: entradas de um lado, despesas do outro."
        }
      }
    ]
  },
  {
    "slug": "ef35-contas-fixas-e-que-mudam",
    "titulo": "Contas fixas, contas que mudam",
    "subtitulo": "Previsto, imprevisto e por que sobrar é proteção.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-b",
    "blocoRotulo": "Bloco B · Planejamento",
    "ordem": 9,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "contas fixas",
      "contas variaveis",
      "imprevisto"
    ],
    "thumbnail": "/trilha/orcamento.png",
    "preRequisitoSlug": "ef35-orcamento-que-fecha",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF45LF05",
      "EF45LF04"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Quais contas mudam de valor",
        "mediacao": "Peça para a criança citar uma conta da casa dela e dizer se muda de valor.",
        "conteudo": {
          "headline": "Conta fixa você já sabe o valor. Conta variável você precisa acompanhar.",
          "corpo": "Algumas contas chegam todo mês com o mesmo valor: o aluguel, a internet. São as contas fixas. Outras mudam de um mês para o outro: a luz, a feira, o transporte. São as variáveis. Saber quais são fixas ajuda a prever quanto vai sobrar antes mesmo do mês começar."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O caderno de Cristiane",
        "mediacao": "Leia em voz alta e peça para a criança separar os gastos em previstos e imprevisto.",
        "conteudo": {
          "headline": "Qual desses três gastos ninguém tinha como prever?",
          "personagem": "Cristiane",
          "narrativa": "Cristiane anota os gastos da casa num caderno. Todo mês ela paga R$ 120 de internet, sempre igual. A conta de luz veio R$ 60 em maio e R$ 95 em junho. Em julho, a geladeira quebrou e o conserto custou R$ 180. Esse gasto não estava na lista de nenhum mês."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Fixa, variável ou surpresa",
        "mediacao": "Leia as três alternativas em voz alta antes de a criança escolher.",
        "conteudo": {
          "headline": "A conta de luz de Cristiane mudou de R$ 60 para R$ 95. Como esse gasto é classificado no orçamento da casa?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "É uma conta fixa, porque chega todo mês.",
              "correta": false,
              "feedback": "Chegar todo mês não faz a conta ser fixa. Fixa é a que mantém o mesmo valor."
            },
            {
              "letra": "B",
              "texto": "É uma conta variável e prevista: ela sempre vem, mas o valor muda.",
              "correta": true,
              "feedback": "Isso. Cristiane sabia que a luz viria, só não sabia quanto ela ia custar."
            },
            {
              "letra": "C",
              "texto": "É um gasto imprevisto, como o conserto da geladeira.",
              "correta": false,
              "feedback": "O conserto foi surpresa. A luz não: ela chega todo mês, mesmo mudando de valor."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Um imprevisto da sua casa",
        "mediacao": "Ajude a criança a lembrar de um conserto, um remédio ou um material escolar de última hora.",
        "conteudo": {
          "headline": "Pense num gasto imprevisto que já aconteceu na sua casa. Quanto ele custou, mais ou menos?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Não precisa acertar o valor exato: uma estimativa já serve para pensar.",
              "tipo": "decimal",
              "placeholder": "R$ 180"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Por que sobrar protege",
        "mediacao": "Comente que imprevistos acontecem em qualquer casa e não são culpa de quem tem pouco.",
        "conteudo": {
          "headline": "Você estimou {valor} de gasto imprevisto. Nenhuma família consegue prever tudo, e por isso guardar um pouco antes ajuda a atravessar o mês quando a surpresa chega.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 50",
              "mensagem": "Mesmo um imprevisto pequeno aperta quando o dinheiro já estava todo contado. Sobrar um pouco resolve.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 200",
              "mensagem": "Um gasto desse tamanho costuma cair no meio do mês e mexe nas contas variáveis, como a feira.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Imprevisto grande assim quase nunca cabe num mês só. Muitas famílias precisam parcelar ou pedir ajuda, e isso não é falha de ninguém.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Escreva com um adulto quais contas da sua casa são fixas e quais mudam de valor."
        }
      }
    ]
  },
  {
    "slug": "ef35-orcamento-da-casa-toda",
    "titulo": "O orçamento é da casa toda",
    "subtitulo": "Cada um tem um papel — e todo gasto tem um depois.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-b",
    "blocoRotulo": "Bloco B · Planejamento",
    "ordem": 10,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "orcamento familiar",
      "participacao",
      "prioridade"
    ],
    "thumbnail": "/trilha/orcamento.png",
    "preRequisitoSlug": "ef35-contas-fixas-e-que-mudam",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF45LF03",
      "EF45LF07"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Um plano feito junto",
        "mediacao": "Pergunte quem, na casa da criança, costuma decidir o que vai ser comprado.",
        "conteudo": {
          "headline": "Orçamento combinado por todos é mais fácil de cumprir do que ordem de um só.",
          "corpo": "Orçamento é o plano de quanto entra e quanto sai de dinheiro numa casa. Ele não funciona se só uma pessoa cuidar. Quem faz a compra, quem usa a água, quem pede um lanche: cada um mexe no plano. Combinar junto o que vem primeiro faz o dinheiro chegar até o fim do mês."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A conversa na cozinha",
        "mediacao": "Leia os valores devagar e some com a criança quanto já estava comprometido.",
        "conteudo": {
          "headline": "O que a casa de Daniela deixa de poder fazer se ela comprar o jogo agora?",
          "personagem": "Daniela",
          "narrativa": "A família de Daniela separou R$ 300 para o mês. Sentaram na cozinha e listaram: gás R$ 110, feira R$ 140 e R$ 50 para o resto. Daniela queria um jogo de R$ 45. Se comprasse, sobrariam R$ 5 para qualquer coisa que aparecesse até o dia 30."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "O que muda no mês",
        "mediacao": "Peça para a criança explicar a escolha antes de você confirmar a resposta.",
        "conteudo": {
          "headline": "Daniela decidiu esperar e não comprou o jogo de R$ 45. O que muda no orçamento da família até o fim do mês?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Nada muda, porque R$ 45 é pouco perto de R$ 300.",
              "correta": false,
              "feedback": "Dos R$ 300, só R$ 50 estavam livres. O jogo levaria quase tudo isso."
            },
            {
              "letra": "B",
              "texto": "Continuam com R$ 50 livres para o que aparecer, como remédio ou material.",
              "correta": true,
              "feedback": "Isso. O dinheiro que não foi gasto agora continua disponível para uma necessidade depois."
            },
            {
              "letra": "C",
              "texto": "A família precisa cortar a feira para repor o valor.",
              "correta": false,
              "feedback": "Não houve gasto, então nada precisa ser reposto. A feira segue como foi combinada."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Uma compra que você quer",
        "mediacao": "Ajude a criança a pensar num item real e a estimar o preço em voz alta.",
        "conteudo": {
          "headline": "Quanto custa uma coisa que você queria comprar e ainda não comprou?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Vale um valor aproximado; o preço exato você confere depois.",
              "tipo": "decimal",
              "placeholder": "R$ 45"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Todo gasto tem um depois",
        "mediacao": "Mostre que a decisão é da casa toda e envolve o que vem depois, não só hoje.",
        "conteudo": {
          "headline": "Você anotou {valor}. Esse é o dinheiro que a casa deixa de ter para outra coisa se a compra for feita agora, e por isso a conversa vale mais do que a decisão sozinha.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 50",
              "mensagem": "Um valor desse costuma caber, mas ainda assim mexe no que sobra. Combine com um adulto antes.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 200",
              "mensagem": "Uma compra assim disputa espaço com contas do mês. Vale listar junto o que vem primeiro.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Nesse tamanho, dificilmente entra num mês só. Guardar aos poucos costuma ser o caminho possível.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Pergunte hoje a um adulto da casa quais são as três contas mais importantes do mês."
        }
      }
    ]
  },
  {
    "slug": "ef35-pesquisar-antes",
    "titulo": "Pesquisar antes de comprar",
    "subtitulo": "O mesmo produto, três preços, e o que vale a pena.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-c",
    "blocoRotulo": "Bloco C · Consumo",
    "ordem": 11,
    "nivel": "iniciante",
    "duracaoMin": 2,
    "pontos": 30,
    "tags": [
      "pesquisa de preco",
      "comparacao",
      "custo e beneficio"
    ],
    "thumbnail": "/trilha/consumo.png",
    "preRequisitoSlug": "ef35-orcamento-da-casa-toda",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF35LF17",
      "EF45LF10"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "O mesmo produto, três preços",
        "mediacao": "Peça para a criança lembrar de um produto que ela viu por preços diferentes.",
        "conteudo": {
          "headline": "O preço mais baixo nem sempre é o que sai mais barato no fim.",
          "corpo": "O mesmo produto pode ter preços diferentes em cada lugar: na loja da esquina, no mercado grande, num site. Pesquisar é olhar em pelo menos três lugares antes de decidir. E preço não é tudo: conta também o frete, a garantia e o tempo que você leva para chegar lá."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O estojo de Dayane",
        "mediacao": "Faça a conta de cada opção no papel junto com a criança antes de virar a tela.",
        "conteudo": {
          "headline": "Somando tudo, qual das três opções sai melhor para Dayane?",
          "personagem": "Dayane",
          "narrativa": "Dayane precisa de um estojo. Na papelaria perto de casa custa R$ 38. No mercado grande, R$ 30, mas a ida e a volta de ônibus custam R$ 10. Num site sai por R$ 26 com R$ 12 de frete e chega em duas semanas. A aula começa segunda."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Some antes de escolher",
        "mediacao": "Confira as somas com a criança: 26 mais 12, 30 mais 10 e 38 sozinho.",
        "conteudo": {
          "headline": "Somando o preço com o transporte ou com o frete, qual opção custa menos para Dayane e chega a tempo?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "O site, por R$ 26, que é o menor preço da vitrine.",
              "correta": false,
              "feedback": "Com R$ 12 de frete o total vai a R$ 38, igual à papelaria, e só chega depois da aula."
            },
            {
              "letra": "B",
              "texto": "A papelaria, por R$ 38, sem gasto de transporte e com o estojo na mão hoje.",
              "correta": true,
              "feedback": "Sai por R$ 38 no total e Dayane usa o estojo na segunda. Custo e benefício batem."
            },
            {
              "letra": "C",
              "texto": "O mercado grande, por R$ 30, o mais barato entre as lojas.",
              "correta": false,
              "feedback": "Com R$ 10 de ônibus, o total vira R$ 40, mais caro que as outras duas opções."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua pesquisa de preço",
        "mediacao": "Ajude a criança a consultar dois preços, um num comércio perto e outro num site.",
        "conteudo": {
          "headline": "Escolha um produto e veja o preço em dois lugares. Qual foi a diferença entre o maior e o menor?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Se ainda não pesquisou, estime a diferença que você imagina encontrar.",
              "tipo": "decimal",
              "placeholder": "R$ 8"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O que a pesquisa rende",
        "mediacao": "Reforce que somar frete e transporte faz parte da pesquisa de preço.",
        "conteudo": {
          "headline": "A diferença que você encontrou foi {valor}. Esse é o dinheiro que a pesquisa economiza, e ele só aparece para quem olha em mais de um lugar.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 10",
              "mensagem": "Diferença pequena. Aí pesam outras coisas: garantia, prazo de entrega e o custo de ir até lá.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 50",
              "mensagem": "Vale pesquisar. Uma diferença assim, repetida em várias compras do mês, muda o orçamento da casa.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Diferença grande. Confira se o produto é exatamente o mesmo e se o mais barato não cobra frete alto.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Antes da próxima compra da casa, confira o preço em três lugares e anote os três."
        }
      }
    ]
  },
  {
    "slug": "ef35-planejada-ou-impulso",
    "titulo": "Planejada ou por impulso",
    "subtitulo": "Como reconhecer o impulso e como dizer não.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-c",
    "blocoRotulo": "Bloco C · Consumo",
    "ordem": 12,
    "nivel": "iniciante",
    "duracaoMin": 2,
    "pontos": 30,
    "tags": [
      "compra planejada",
      "impulso",
      "recusa"
    ],
    "thumbnail": "/trilha/consumo.png",
    "preRequisitoSlug": "ef35-pesquisar-antes",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF45LF11",
      "EF45LF12"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Decidida antes ou na hora",
        "mediacao": "Pergunte se a criança já levou algo do caixa que não estava na lista.",
        "conteudo": {
          "headline": "Se não estava na lista e você decidiu em segundos, provavelmente foi impulso.",
          "corpo": "Compra planejada é a que você decidiu antes: sabia o que ia levar e quanto ia gastar. Compra por impulso é a que aparece na hora, perto do caixa ou numa propaganda. Ela não é proibida, mas costuma tirar dinheiro do que já estava combinado. Dizer não também é uma resposta."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Débora na fila do caixa",
        "mediacao": "Some com a criança quanto sobrou dos R$ 50 depois dos itens da lista.",
        "conteudo": {
          "headline": "Com R$ 8 de sobra, o chaveiro de R$ 15 cabia na compra de Débora?",
          "personagem": "Débora",
          "narrativa": "Débora foi ao mercado com uma lista: arroz, feijão e sabão, R$ 42 no total. Levava R$ 50. Na fila do caixa, viu um chaveiro por R$ 15 com um cartaz de oferta. O vendedor disse que era o último. Ela parou e olhou a lista de novo."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Como justificar o não",
        "mediacao": "Peça para a criança dizer em voz alta uma frase para recusar sem constrangimento.",
        "conteudo": {
          "headline": "Débora recusou o chaveiro. Qual justificativa explica melhor a decisão dela?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Chaveiro é um produto ruim e ninguém deveria comprar.",
              "correta": false,
              "feedback": "O problema não é o produto. É que ele não estava planejado e não cabia no dinheiro."
            },
            {
              "letra": "B",
              "texto": "Não estava na lista e custava mais do que os R$ 8 que sobravam.",
              "correta": true,
              "feedback": "Ela comparou o preço com o que tinha e com o que havia planejado. Recusar foi coerente."
            },
            {
              "letra": "C",
              "texto": "Deveria ter comprado, porque estava em oferta e era o último.",
              "correta": false,
              "feedback": "Oferta e pressa servem para acelerar a decisão. Estar barato não faz caber no orçamento."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua última compra na hora",
        "mediacao": "Ajude a criança a lembrar de um doce, uma figurinha ou um brinquedo comprado na hora.",
        "conteudo": {
          "headline": "Quanto você gastou na última vez que comprou algo sem ter planejado?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Se não lembrar o valor exato, escreva o que parece mais próximo.",
              "tipo": "decimal",
              "placeholder": "R$ 15"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Reconhecer o impulso",
        "mediacao": "Combine com a criança uma frase curta de recusa para usar quando alguém insistir.",
        "conteudo": {
          "headline": "Você lembrou de {valor} numa compra por impulso. Perceber esse valor não serve para se culpar: serve para reconhecer a situação da próxima vez e conseguir dizer não.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 20",
              "mensagem": "Parece pouco, mas o impulso costuma se repetir. Três vezes no mês já viram um gasto grande.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 100",
              "mensagem": "Um valor assim normalmente sai de algo que estava planejado. Vale checar o que deixou de ser comprado.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Compras grandes por impulso pedem uma pausa combinada: esperar um dia inteiro antes de decidir.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Na próxima ida ao mercado, leve uma lista escrita e compre só o que está nela."
        }
      }
    ]
  },
  {
    "slug": "ef35-comprar-menos-usar-mais",
    "titulo": "Comprar menos, usar mais",
    "subtitulo": "Recusar, reduzir, reutilizar, reciclar — e economizar no caminho.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-c",
    "blocoRotulo": "Bloco C · Consumo",
    "ordem": 13,
    "nivel": "iniciante",
    "duracaoMin": 2,
    "pontos": 30,
    "tags": [
      "consumo consciente",
      "reutilizar",
      "reciclar"
    ],
    "thumbnail": "/trilha/consumo.png",
    "preRequisitoSlug": "ef35-planejada-ou-impulso",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF35LF18",
      "EF35LF20",
      "EF35LF21"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Quatro perguntas antes",
        "mediacao": "Peça para a criança apontar algo em casa que dá para reutilizar em vez de comprar.",
        "conteudo": {
          "headline": "Antes de comprar: recusar, reduzir, reutilizar, reciclar, nessa ordem.",
          "corpo": "Antes de comprar algo novo, existem quatro perguntas: dá para recusar, dá para reduzir, dá para reutilizar o que já tem, dá para reciclar? Cada coisa comprada vira lixo um dia, e lixo demais suja rio, rua e ar. Comprar menos economiza dinheiro e diminui o que a casa joga fora."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A pasta de Denilson",
        "mediacao": "Confira a conta com a criança: R$ 22 menos R$ 4.",
        "conteudo": {
          "headline": "Quantas outras coisas da casa de Denilson dariam para consertar em vez de comprar?",
          "personagem": "Denilson",
          "narrativa": "A escola de Denilson pediu uma pasta para os trabalhos. A nova custa R$ 22. Ele achou em casa uma pasta do ano passado, meio gasta, e um rolo de fita por R$ 4. Consertou em dez minutos. Guardou R$ 18 e a pasta velha não virou lixo."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "A conta do ano inteiro",
        "mediacao": "Deixe a criança somar 18 quatro vezes no papel antes de escolher.",
        "conteudo": {
          "headline": "Denilson repete essa escolha em quatro materiais parecidos no ano, economizando R$ 18 em cada um. Quanto ele deixa de gastar?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "R$ 36",
              "correta": false,
              "feedback": "R$ 36 seria só duas vezes. Foram quatro materiais: 18 mais 18 mais 18 mais 18."
            },
            {
              "letra": "B",
              "texto": "R$ 72",
              "correta": true,
              "feedback": "18 vezes 4 é igual a 72. Reutilizar poucas vezes já muda o valor gasto no ano."
            },
            {
              "letra": "C",
              "texto": "R$ 88",
              "correta": false,
              "feedback": "R$ 88 é 22 vezes 4, o preço das pastas novas. A economia é de R$ 18 em cada uma."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua economia do mês",
        "mediacao": "Ajude a criança a listar itens da casa antes de estimar o valor.",
        "conteudo": {
          "headline": "Quanto você acha que dá para economizar num mês consertando ou reutilizando em vez de comprar?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "É uma estimativa: pense em duas ou três coisas que dariam para aproveitar.",
              "tipo": "decimal",
              "placeholder": "R$ 40"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Dois ganhos de uma vez",
        "mediacao": "Comente que recusar e reduzir vêm antes de reciclar, porque evitam o lixo na origem.",
        "conteudo": {
          "headline": "Sua estimativa foi {valor} por mês. Além do dinheiro, cada item aproveitado é um item a menos no lixo: os dois ganhos vêm juntos.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 30",
              "mensagem": "Mesmo pouco por mês vira bastante no ano. E o lixo evitado não depende do valor.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 150",
              "mensagem": "Uma economia assim já cobre uma conta pequena da casa, como o material escolar do mês.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Estimativa alta. Vale conferir item por item quanto dá para reaproveitar de verdade.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Escolha hoje um objeto quebrado da casa e veja se dá para consertar."
        }
      }
    ]
  },
  {
    "slug": "ef35-o-planeta-na-conta",
    "titulo": "O planeta entra na conta",
    "subtitulo": "Consumismo, sustentabilidade e o que a economia faz com isso.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-c",
    "blocoRotulo": "Bloco C · Consumo",
    "ordem": 14,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "sustentabilidade",
      "consumismo",
      "meio ambiente"
    ],
    "thumbnail": "/trilha/consumo.png",
    "preRequisitoSlug": "ef35-comprar-menos-usar-mais",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF35LF19",
      "EF45LF09"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "O que a compra custa ao planeta",
        "mediacao": "Pergunte à criança que negócios do bairro consertam ou revendem coisas usadas.",
        "conteudo": {
          "headline": "Toda compra usa recursos do planeta, antes da loja e depois do lixo.",
          "corpo": "Consumismo é comprar muito além do que se usa. Tudo o que é fabricado gasta água, energia e matéria-prima, e depois vira lixo. Algumas atividades cuidam disso: oficinas de conserto, brechós, coleta de recicláveis. Outras não: fábrica que joga resíduo no rio, propaganda que empurra troca a cada mês."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O tênis de Diego",
        "mediacao": "Some com a criança R$ 25 mais R$ 15 e veja quanto sobra dos R$ 60.",
        "conteudo": {
          "headline": "O que a escolha de Diego mudou, além do dinheiro que sobrou?",
          "personagem": "Diego",
          "narrativa": "Diego juntou R$ 60 e queria um tênis novo de R$ 55. Na feira do bairro, achou um usado em bom estado por R$ 25 e um lugar que troca o solado por R$ 15. Escolheu o usado. Sobrou R$ 20, e uma caixa a menos de plástico e papelão foi para o lixo."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Qual atividade sustenta",
        "mediacao": "Peça para a criança explicar por que trocar sempre custa caro para o planeta.",
        "conteudo": {
          "headline": "Entre os comportamentos abaixo, qual ajuda a sustentabilidade e ainda faz o dinheiro render mais?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Trocar de celular todo ano para ter o modelo mais recente.",
              "correta": false,
              "feedback": "Troca rápida gera lixo eletrônico e consome renda sem necessidade real."
            },
            {
              "letra": "B",
              "texto": "Levar o sapato ao sapateiro e comprar usado quando dá.",
              "correta": true,
              "feedback": "Consertar e reaproveitar alonga a vida do produto, gasta menos recursos e custa menos."
            },
            {
              "letra": "C",
              "texto": "Comprar sempre o mais barato, mesmo que dure poucas semanas.",
              "correta": false,
              "feedback": "O que dura pouco é trocado logo. Sai caro no ano e vira lixo mais rápido."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "O preço da versão nova",
        "mediacao": "Ajude a criança a escolher um objeto real e a lembrar o preço de vitrine.",
        "conteudo": {
          "headline": "Pense numa coisa que você compraria usada ou consertada. Quanto custaria comprar ela nova?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Um valor aproximado já basta para comparar as duas opções.",
              "tipo": "decimal",
              "placeholder": "R$ 55"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Nova, usada ou consertada",
        "mediacao": "Explique que negócios de conserto e reuso também geram trabalho e renda no bairro.",
        "conteudo": {
          "headline": "Nova, essa coisa custaria {valor}. Comprar usado ou consertar costuma custar menos e evita que outro produto precise ser fabricado do zero.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 50",
              "mensagem": "Item de preço baixo. Aqui o ganho maior é ambiental: menos embalagem e menos descarte.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 200",
              "mensagem": "Nessa faixa, usado ou consertado costuma custar bem menos, e o que sobra vai para outra conta.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Item caro. Compare garantia e estado de conservação antes de decidir entre novo e usado.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Procure no seu bairro um brechó, um sapateiro ou um ponto de coleta e anote onde fica."
        }
      }
    ]
  },
  {
    "slug": "ef35-guardar-tem-objetivo",
    "titulo": "Guardar tem objetivo",
    "subtitulo": "Poupar é escolher o depois em vez do agora.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-d",
    "blocoRotulo": "Bloco D · Poupança e investimento",
    "ordem": 15,
    "nivel": "iniciante",
    "duracaoMin": 2,
    "pontos": 30,
    "tags": [
      "poupar",
      "objetivo",
      "prazo"
    ],
    "thumbnail": "/trilha/poupar.png",
    "preRequisitoSlug": "ef35-o-planeta-na-conta",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF35LF22",
      "EF35LF23",
      "EF45LF13"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Gastar agora ou usar depois",
        "mediacao": "Peça para a criança dizer um objetivo dela e em quanto tempo quer alcançar.",
        "conteudo": {
          "headline": "Poupar sem objetivo é difícil; com nome e prazo, vira decisão.",
          "corpo": "Gastar é trocar dinheiro por algo agora. Poupar é guardar para usar depois. Quem poupa escolhe o depois no lugar do agora, e isso fica mais fácil quando existe um objetivo com nome e prazo: curto, de semanas; médio, de meses; longo, de anos. Parte do que se guarda fica de reserva."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A bicicleta de Dirce",
        "mediacao": "Faça as duas divisões com a criança: 240 dividido por 20 e 240 dividido por 15.",
        "conteudo": {
          "headline": "Vale esperar quatro semanas a mais para poder gastar R$ 5 por semana?",
          "personagem": "Dirce",
          "narrativa": "Dirce quer uma bicicleta usada de R$ 240. Ela recebe R$ 20 por semana ajudando a vizinha com as plantas. Se gastar tudo em lanche, o valor nunca junta. Guardando R$ 20 por semana, chega em doze semanas. Guardando R$ 15 e gastando R$ 5, leva dezesseis semanas."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Quanto ainda falta",
        "mediacao": "Deixe a criança fazer a multiplicação e a subtração antes de marcar.",
        "conteudo": {
          "headline": "Dirce guardou R$ 20 por semana durante oito semanas. Quanto falta para os R$ 240 da bicicleta?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "R$ 60",
              "correta": false,
              "feedback": "R$ 60 seria o que falta depois de nove semanas. Em oito, ela juntou R$ 160."
            },
            {
              "letra": "B",
              "texto": "R$ 80",
              "correta": true,
              "feedback": "20 vezes 8 é 160, e 240 menos 160 é 80. Faltam quatro semanas no mesmo ritmo."
            },
            {
              "letra": "C",
              "texto": "R$ 160",
              "correta": false,
              "feedback": "R$ 160 é o que ela já guardou, não o que ainda falta juntar."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Quanto dá para guardar",
        "mediacao": "Deixe claro que nem toda criança recebe dinheiro; nesse caso, use um valor imaginado.",
        "conteudo": {
          "headline": "Quanto você consegue guardar por semana para um objetivo seu?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Um valor pequeno e possível funciona melhor do que um valor grande que não se cumpre.",
              "tipo": "decimal",
              "placeholder": "R$ 10"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Pouco, repetido, com objetivo",
        "mediacao": "Ajude a criança a escrever o objetivo e a calcular quantas semanas faltam.",
        "conteudo": {
          "headline": "Guardando {valor} por semana, ao fim de um ano você teria esse valor multiplicado por 52. Poupar é isso: pouco, repetido, com um objetivo escrito.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 5",
              "mensagem": "Pouco por semana ainda vira algo em alguns meses. Aqui o hábito conta mais do que o tamanho.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 50",
              "mensagem": "Nesse ritmo dá para mirar objetivos de médio prazo, de alguns meses, como uma bicicleta usada.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Valor alto para uma semana. Confira se é possível todo mês e deixe uma parte como reserva.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Escreva seu objetivo, o preço e quantas semanas faltam, e deixe o papel à vista."
        }
      }
    ]
  },
  {
    "slug": "ef35-do-cofrinho-pro-banco",
    "titulo": "Do cofrinho pro banco",
    "subtitulo": "Por que o dinheiro guardado sai de casa.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-d",
    "blocoRotulo": "Bloco D · Poupança e investimento",
    "ordem": 16,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "poupanca",
      "banco",
      "conta corrente"
    ],
    "thumbnail": "/trilha/poupar.png",
    "preRequisitoSlug": "ef35-guardar-tem-objetivo",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF35LF24",
      "EF45LF14"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Dinheiro fora de casa",
        "mediacao": "Pergunte onde a turma guarda dinheiro hoje e anote as respostas no quadro.",
        "conteudo": {
          "headline": "Dinheiro em casa some fácil; no banco ele fica registrado no seu nome.",
          "corpo": "Guardar dinheiro em casa parece simples. Mas o dinheiro no cofrinho pode ser perdido, molhado ou gasto sem pensar. Num banco, ele fica registrado no seu nome e ninguém tira sem autorização. Banco, cooperativa de crédito e fintech são instituições financeiras: lugares que guardam dinheiro de outras pessoas."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A lata do Douglas",
        "mediacao": "Peça que contem situações em que dinheiro guardado em casa se perdeu.",
        "conteudo": {
          "headline": "O que a conta no banco protege que a lata não protegia?",
          "personagem": "Douglas",
          "narrativa": "Douglas juntou R$ 120 numa lata em cima do armário. Um dia a lata caiu e as moedas rolaram pela casa. Ele achou R$ 96 e nunca encontrou o resto. A tia dele abriu uma conta poupança no nome do Douglas. O dinheiro que sobrou passou a ficar guardado lá."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Poupança ou corrente?",
        "mediacao": "Leia as três alternativas em voz alta e peça a justificativa antes de marcar.",
        "conteudo": {
          "headline": "Douglas quer separar o dinheiro que vai ficar parado juntando por muitos meses. Qual conta serve melhor para isso?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Conta corrente, feita para o dinheiro do dia a dia entrar e sair.",
              "correta": false,
              "feedback": "A conta corrente serve para movimentar dinheiro, pagar e receber. Parado nela, o dinheiro não rende."
            },
            {
              "letra": "B",
              "texto": "Conta poupança, feita para guardar dinheiro que vai ficar parado.",
              "correta": true,
              "feedback": "Isso. A poupança guarda dinheiro parado e ainda rende, ou seja, aumenta um pouco com o tempo."
            },
            {
              "letra": "C",
              "texto": "Nenhuma das duas, porque banco só serve para quem tem muito dinheiro.",
              "correta": false,
              "feedback": "Não é assim. Instituições financeiras abrem conta para qualquer valor, inclusive quantias pequenas."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Quanto dá para guardar",
        "mediacao": "Ajude a escrever o valor e explique que não existe resposta certa ou errada.",
        "conteudo": {
          "headline": "Se você pudesse guardar um pouco de dinheiro por mês, quanto seria?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Não precisa ser exato: uma estimativa já serve para pensar.",
              "tipo": "decimal",
              "placeholder": "R$ 20"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Onde o dinheiro fica melhor",
        "mediacao": "Leia o resultado com a criança e compare com o valor que o colega escreveu.",
        "conteudo": {
          "headline": "Você pensou em guardar {valor} por mês. Em casa, esse dinheiro fica solto e some fácil. Numa instituição financeira, ele fica registrado no seu nome.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 20",
              "mensagem": "Mesmo quantia pequena vira um monte depois de vários meses. O banco registra qualquer valor.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 100",
              "mensagem": "Guardado por um ano, esse valor já dá uma quantia que não vale a pena deixar solta em casa.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Com essa quantia, guardar em casa é arriscado: pode ser perdida ou levada. Uma conta protege melhor.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Pergunte em casa se alguém tem conta poupança e para que ela é usada."
        }
      }
    ]
  },
  {
    "slug": "ef35-emprestado-tem-que-voltar",
    "titulo": "Emprestado tem que voltar",
    "subtitulo": "Confiança, devolução e os tipos de crédito que existem.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-e",
    "blocoRotulo": "Bloco E · Crédito e endividamento",
    "ordem": 17,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "credito",
      "emprestimo",
      "confianca"
    ],
    "thumbnail": "/trilha/credito.png",
    "preRequisitoSlug": "ef35-do-cofrinho-pro-banco",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF35LF25",
      "EF45LF15"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Emprestar é confiar",
        "mediacao": "Peça um exemplo de algo que a criança emprestou e recebeu de volta.",
        "conteudo": {
          "headline": "Tudo que é emprestado volta — e às vezes volta custando mais.",
          "corpo": "Quando alguém te empresta algo, você fica com uma dívida: precisa devolver. Com dinheiro é igual. Quem empresta faz isso porque confia que vai receber de volta. Bancos e lojas também emprestam, mas cobram um valor a mais pelo tempo, chamado juros. Devolver no prazo mantém a confiança."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O combinado do Edilson",
        "mediacao": "Pergunte à turma o que acontece com quem não devolve o que pegou emprestado.",
        "conteudo": {
          "headline": "Por que o primo emprestou de novo para o Edilson?",
          "personagem": "Edilson",
          "narrativa": "Edilson pegou R$ 30 emprestados com o primo para comprar material da escola. Combinaram devolver em duas semanas. Na data marcada, Edilson devolveu os R$ 30 certinho. No mês seguinte precisou de novo, e o primo emprestou sem pensar duas vezes. Um colega que nunca devolveu não conseguiu mais nada."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Que crédito é esse?",
        "mediacao": "Leia as alternativas e peça exemplos de compras parceladas que a turma já viu.",
        "conteudo": {
          "headline": "A família de Edilson vai comprar um fogão de R$ 400 em quatro vezes de R$ 100 na loja. Esse tipo de crédito se chama:",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Financiamento, usado para comprar casa ou carro ao longo de muitos anos.",
              "correta": false,
              "feedback": "Financiamento também é crédito, mas serve para bens caros pagos em muitos anos, com o bem como garantia."
            },
            {
              "letra": "B",
              "texto": "Parcelamento, quando o valor da compra é dividido em prestações.",
              "correta": true,
              "feedback": "Isso. Parcelar é dividir o preço em partes pagas mês a mês até quitar tudo."
            },
            {
              "letra": "C",
              "texto": "Empréstimo em dinheiro, quando o banco entrega o valor na conta.",
              "correta": false,
              "feedback": "No empréstimo o banco entrega dinheiro e a pessoa decide o uso. Aqui a loja dividiu o preço do fogão."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Seu prazo de devolução",
        "mediacao": "Ajude a criança a contar os dias usando um calendário.",
        "conteudo": {
          "headline": "Pense em algo que você já pegou emprestado. Quantos dias levou para devolver?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Se não lembrar direito, um número aproximado já serve.",
              "tipo": "decimal",
              "placeholder": "7"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Prazo e confiança",
        "mediacao": "Leia o resultado e ajude a criança a marcar essa data no calendário.",
        "conteudo": {
          "headline": "Você levou {valor} dias para devolver o que pegou emprestado. Esse tempo é o combinado, e cumprir o combinado é o que mantém a confiança.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 7",
              "mensagem": "Devolver rápido deixa claro que a pessoa pode contar com você da próxima vez.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 30",
              "mensagem": "Levou um tempo, mas voltou. O que importa é ter combinado o prazo antes e cumprido.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Demorou. Quando o prazo estica, quem emprestou fica inseguro e pode não emprestar de novo.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Combine hoje uma data para devolver algo que ainda está com você."
        }
      }
    ]
  },
  {
    "slug": "ef35-o-que-e-estar-endividado",
    "titulo": "O que é estar endividado",
    "subtitulo": "Como a dívida começa e o que evita ela.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-e",
    "blocoRotulo": "Bloco E · Crédito e endividamento",
    "ordem": 18,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "endividamento",
      "divida",
      "consumo consciente"
    ],
    "thumbnail": "/trilha/credito.png",
    "preRequisitoSlug": "ef35-emprestado-tem-que-voltar",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF45LF16",
      "EF45LF17"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Dever é ter prazo",
        "mediacao": "Explique que dívida é o que ainda falta pagar e peça exemplos do dia a dia.",
        "conteudo": {
          "headline": "Dívida é dinheiro que ainda não foi pago — e tem prazo.",
          "corpo": "Estar endividado é dever dinheiro que ainda não foi pago. Ter dívida não é vergonha. Ela pode aparecer porque alguém ficou doente, perdeu o emprego ou ganha pouco. O problema começa quando o que se deve fica maior do que o que entra. Aí a conta não fecha no fim do mês."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "As contas da Edna",
        "mediacao": "Refaça a conta da Edna no quadro com a turma, passo a passo.",
        "conteudo": {
          "headline": "O que empurrou a Edna para a dívida neste mês?",
          "personagem": "Edna",
          "narrativa": "Edna recebe R$ 400 por mês vendendo salgados. Este mês ela gastou R$ 180 em remédio para a filha. Também parcelou uma geladeira em R$ 90 por mês. Sobraram R$ 130 para comida e transporte, e não deu. Ela ficou devendo R$ 60 no mercado do bairro."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Como evitar a dívida",
        "mediacao": "Peça que expliquem por que cortar o remédio não é uma solução.",
        "conteudo": {
          "headline": "Mês que vem Edna quer evitar ficar devendo de novo. Qual atitude ajuda mais a prevenir isso?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Parcelar mais compras, porque assim cada parcela fica pequena.",
              "correta": false,
              "feedback": "Cada parcela fica pequena, mas todas caem no mesmo mês e se somam. As dívidas se acumulam."
            },
            {
              "letra": "B",
              "texto": "Anotar o que entra e o que sai antes de assumir uma nova parcela.",
              "correta": true,
              "feedback": "Isso. Saber quanto sobra antes de comprar evita assumir um valor que não cabe no mês."
            },
            {
              "letra": "C",
              "texto": "Deixar de comprar o remédio da filha e guardar esse dinheiro.",
              "correta": false,
              "feedback": "Remédio é necessidade, não gasto que se corta. Consumo consciente começa pelo que é supérfluo."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "O preço do que você quer",
        "mediacao": "Ajude a estimar o preço olhando um encarte ou perguntando em casa.",
        "conteudo": {
          "headline": "Pense em algo que você quer comprar e ainda não comprou. Quanto custa?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Um preço aproximado já serve para fazer a conta.",
              "tipo": "decimal",
              "placeholder": "R$ 60"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Cabe ou não cabe",
        "mediacao": "Leia a regra correspondente e ajude a criança a dividir o valor por semanas.",
        "conteudo": {
          "headline": "A coisa que você quer custa {valor}. Antes de comprar parcelado, vale checar se esse valor cabe no que sobra por mês.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 50",
              "mensagem": "É um valor que dá para juntar em poucas semanas, sem precisar dever a ninguém.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 200",
              "mensagem": "Vale comparar preços e juntar aos poucos, em vez de assumir parcelas por muitos meses.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Valor alto pede planejamento. Parcelar sem saber quanto sobra por mês é o começo comum da dívida.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Escreva quanto você consegue juntar por semana até chegar nesse valor."
        }
      }
    ]
  },
  {
    "slug": "ef35-de-onde-vem-o-dinheiro",
    "titulo": "De onde vem o dinheiro da casa",
    "subtitulo": "Fontes de renda e o direito de todo mundo a ter uma.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-f",
    "blocoRotulo": "Bloco F · Renda e empreendedorismo",
    "ordem": 19,
    "nivel": "iniciante",
    "duracaoMin": 2,
    "pontos": 30,
    "tags": [
      "renda",
      "fontes de renda",
      "trabalho"
    ],
    "thumbnail": "/trilha/renda.png",
    "preRequisitoSlug": "ef35-o-que-e-estar-endividado",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF35LF26",
      "EF45LF18"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "O dinheiro tem fim",
        "mediacao": "Peça que a turma liste de onde vem o dinheiro nas casas que conhecem.",
        "conteudo": {
          "headline": "O dinheiro tem fim — e pode vir de mais de um lugar.",
          "corpo": "O dinheiro que entra numa casa é limitado: tem um tanto, e acaba. Ele vem de fontes diferentes. A mais comum é o trabalho. Também existe a venda de algo que a pessoa tem. Existem benefícios pagos pelo governo, herança e prêmios de sorteio. Nem toda fonte entra todo mês."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "As entradas da Eliane",
        "mediacao": "Separe no quadro as fontes que se repetem e as que acontecem uma vez só.",
        "conteudo": {
          "headline": "Com quais dessas fontes Eliane pode contar de novo no mês que vem?",
          "personagem": "Eliane",
          "narrativa": "Eliane trabalha como diarista e recebe R$ 250 por mês. Ela também recebe R$ 150 de um benefício do governo. Neste mês vendeu uma bicicleta velha por R$ 80. Foram R$ 480 no total. O benefício chega todo mês; a venda da bicicleta foi só uma vez."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Renda mínima é direito",
        "mediacao": "Leia as alternativas em voz alta e discuta por que a primeira é injusta.",
        "conteudo": {
          "headline": "Por que existem benefícios do governo que garantem uma renda mínima para famílias?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Porque quem recebe benefício não quer trabalhar.",
              "correta": false,
              "feedback": "Não é isso. A maior parte de quem recebe trabalha ou procura trabalho, e o benefício completa a renda."
            },
            {
              "letra": "B",
              "texto": "Porque toda pessoa precisa de uma renda mínima para comer, morar e se cuidar.",
              "correta": true,
              "feedback": "Isso. Ter o mínimo para viver é um direito de todas as pessoas, e o benefício existe para garantir isso."
            },
            {
              "letra": "C",
              "texto": "Porque o governo tem dinheiro sobrando e distribui por sorteio.",
              "correta": false,
              "feedback": "Não é sorteio. O benefício segue regras e vai para quem está com a renda abaixo do mínimo."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Fontes na sua casa",
        "mediacao": "Ajude a contar só a quantidade de fontes, sem pedir valores nem nomes.",
        "conteudo": {
          "headline": "Quantas fontes de dinheiro diferentes existem na casa onde você mora?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Conte cada pessoa ou benefício que traz dinheiro; uma estimativa já serve.",
              "tipo": "decimal",
              "placeholder": "2"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Quantas entradas você tem",
        "mediacao": "Leia o resultado individualmente e evite comparar as respostas entre colegas.",
        "conteudo": {
          "headline": "Você contou {valor} fontes de dinheiro na sua casa. Cada fonte tem seu ritmo: umas chegam todo mês, outras só de vez em quando.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 1",
              "mensagem": "Com uma fonte só, qualquer atraso pesa mais. Por isso existe o direito a uma renda mínima.",
              "cor": "green"
            },
            {
              "condicao": "valor == 2",
              "mensagem": "Duas fontes dividem o risco: se uma falhar no mês, a outra segura parte das contas.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Várias fontes ajudam, mas vale saber quais se repetem todo mês e quais não.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Pergunte em casa quais fontes de dinheiro chegam todo mês e quais não."
        }
      }
    ]
  },
  {
    "slug": "ef35-trabalho-e-profissoes",
    "titulo": "Trabalho e profissões",
    "subtitulo": "O que as pessoas fazem, e em que setor da economia.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-f",
    "blocoRotulo": "Bloco F · Renda e empreendedorismo",
    "ordem": 20,
    "nivel": "iniciante",
    "duracaoMin": 2,
    "pontos": 30,
    "tags": [
      "trabalho",
      "profissoes",
      "remuneracao"
    ],
    "thumbnail": "/trilha/renda.png",
    "preRequisitoSlug": "ef35-de-onde-vem-o-dinheiro",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF35LF27",
      "EF35LF28",
      "EF35LF29"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Trabalho e remuneração",
        "mediacao": "Peça que cada criança diga uma profissão que existe perto da casa dela.",
        "conteudo": {
          "headline": "Trabalho produz algo ou presta serviço; a remuneração paga esse esforço.",
          "corpo": "Trabalho é a atividade que uma pessoa faz para produzir algo ou prestar um serviço. Quando esse trabalho vira uma ocupação com nome e preparo, chamamos de profissão. Pelo trabalho a pessoa recebe remuneração, que é o pagamento pelo tempo e esforço dela. Cada profissão tem tarefas e lugares próprios."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Três lugares no bairro",
        "mediacao": "Escreva os três setores no quadro e encaixe as profissões que a turma citar.",
        "conteudo": {
          "headline": "Em qual desses três setores está o trabalho de alguém que você conhece?",
          "personagem": "Emanuel",
          "narrativa": "No bairro de Emanuel tem uma horta, uma fábrica de pães e uma barbearia. A horta colhe alface: isso é setor primário, que tira da natureza. A fábrica transforma trigo em pão: setor secundário. A barbearia corta cabelo e não fabrica nada: setor terciário, o dos serviços."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "A conta dos sábados",
        "mediacao": "Deixe a criança usar os dedos ou o caderno para somar antes de marcar.",
        "conteudo": {
          "headline": "Emanuel ajuda na horta em três sábados e recebe R$ 25 por sábado. Quanto ele recebe de remuneração no total?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "R$ 28",
              "correta": false,
              "feedback": "Aqui você somou 25 mais 3. O certo é somar R$ 25 três vezes, um por sábado."
            },
            {
              "letra": "B",
              "texto": "R$ 75",
              "correta": true,
              "feedback": "Isso. R$ 25 em cada um dos três sábados dá R$ 75 no total."
            },
            {
              "letra": "C",
              "texto": "R$ 50",
              "correta": false,
              "feedback": "Esse é o valor de dois sábados apenas. Falta somar o terceiro."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Profissão perto de você",
        "mediacao": "Ajude a escrever a frase e pergunte onde a criança viu essa profissão.",
        "conteudo": {
          "headline": "Pense numa profissão que existe onde você mora. O que essa pessoa faz?",
          "campos": [
            {
              "id": "valor",
              "emoji": "🧰",
              "label": "Vale qualquer profissão que você já viu de perto.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Tira algo da natureza: planta, pesca ou cria animais",
                  "valor": "1"
                },
                {
                  "label": "Transforma matéria-prima: fábrica, padaria, marcenaria",
                  "valor": "2"
                },
                {
                  "label": "Atende pessoas: escola, ônibus, salão, loja",
                  "valor": "3"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Em que setor ela está",
        "mediacao": "Leia as três regras e ajude a criança a decidir em qual setor a profissão cabe.",
        "conteudo": {
          "headline": "Você citou {valor}. Toda profissão tem tarefas próprias e recebe remuneração por elas. Agora veja em qual setor da economia ela se encaixa.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 1",
              "mensagem": "Esse trabalho é do setor primário: pega o produto direto da terra, da água ou dos animais.",
              "cor": "green"
            },
            {
              "condicao": "valor == 2",
              "mensagem": "Esse trabalho é do setor secundário: transforma uma coisa em outra antes de vender.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Esse trabalho é do setor terciário: presta um serviço direto para as pessoas.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Pergunte a essa pessoa quanto tempo ela levou para aprender a profissão."
        }
      }
    ]
  },
  {
    "slug": "ef35-campo-e-cidade",
    "titulo": "Campo e cidade",
    "subtitulo": "Uma coisa depende da outra — e tem quem empreenda nas duas.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-f",
    "blocoRotulo": "Bloco F · Renda e empreendedorismo",
    "ordem": 21,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "campo",
      "cidade",
      "empreendedorismo"
    ],
    "thumbnail": "/trilha/renda.png",
    "preRequisitoSlug": "ef35-trabalho-e-profissoes",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF35LF30",
      "EF45LF19",
      "EF45LF20"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Um depende do outro",
        "mediacao": "Pergunte de onde vem o arroz que a turma come e quem levou até a loja.",
        "conteudo": {
          "headline": "Campo e cidade não vivem separados: um entrega o que falta ao outro.",
          "corpo": "No campo, boa parte do trabalho é plantar, criar animais e colher. Na cidade, é mais comum fabricar, vender e prestar serviços. Os dois dependem um do outro. O alimento sai do campo e chega às lojas da cidade. O trator e o adubo saem da indústria e vão para o campo."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A mandioca da Fabiana",
        "mediacao": "Desenhe no quadro setas do que vai do campo para a cidade e do contrário.",
        "conteudo": {
          "headline": "O que a cidade dá para a Fabiana, e o que ela dá para a cidade?",
          "personagem": "Fabiana",
          "narrativa": "Fabiana planta mandioca num sítio e vende 40 quilos por semana para um mercado na cidade. Com o dinheiro, ela compra sementes e ração numa loja da cidade. A dona do mercado transforma parte da mandioca em farinha e revende. As duas montaram o próprio negócio, cada uma no seu lugar."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Campo ou cidade?",
        "mediacao": "Leia as três atividades e peça que a turma diga onde cada uma acontece.",
        "conteudo": {
          "headline": "Qual dessas atividades é típica do campo e pertence ao setor primário?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Costurar uniformes numa oficina do centro.",
              "correta": false,
              "feedback": "Costurar transforma tecido em roupa. É setor secundário, e acontece mais na cidade."
            },
            {
              "letra": "B",
              "texto": "Criar galinhas e vender os ovos.",
              "correta": true,
              "feedback": "Isso. Criar animais tira o produto direto da natureza: é setor primário, típico do campo."
            },
            {
              "letra": "C",
              "texto": "Entregar pacotes de moto pelo bairro.",
              "correta": false,
              "feedback": "Entregar é prestar um serviço: setor terciário, mais comum na cidade."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Negócios perto de você",
        "mediacao": "Ajude a criança a lembrar dos negócios da rua antes de escolher o número.",
        "conteudo": {
          "headline": "Quantos negócios criados por moradores existem perto da sua casa?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Conte mercadinho, salão, horta, oficina ou barraca; uma estimativa já serve.",
              "tipo": "decimal",
              "placeholder": "4"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "A rede do seu bairro",
        "mediacao": "Leia a regra do resultado e peça um negócio do bairro como exemplo.",
        "conteudo": {
          "headline": "Você contou {valor} negócios criados por moradores perto de você. Quem monta o próprio negócio está empreendendo, no campo ou na cidade.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 2",
              "mensagem": "Mesmo poucos negócios movimentam o lugar: compram de fora e vendem para quem mora perto.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 8",
              "mensagem": "Vale olhar quais deles dependem de produtos que vêm do campo para funcionar.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Muitos negócios juntos formam uma rede: um compra do outro e todos dependem do campo.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Escolha um negócio perto de você e descubra de onde vem o que ele vende."
        }
      }
    ]
  },
  {
    "slug": "ef35-escolha-que-respinga",
    "titulo": "Escolha que respinga nos outros",
    "subtitulo": "Sua decisão financeira chega em quem está perto.",
    "publico": "ef35",
    "blocoId": "ef35-bloco-g",
    "blocoRotulo": "Bloco G · Cenário financeiro e cidadania",
    "ordem": 22,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "consumo consciente",
      "escolhas",
      "conflito de consumo"
    ],
    "thumbnail": "/trilha/cidadania.png",
    "preRequisitoSlug": "ef35-campo-e-cidade",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef35",
    "habilidades": [
      "EF45LF21",
      "EF45LF22"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Escolha que respinga",
        "mediacao": "Peça um exemplo de compra que acabou afetando outra pessoa da casa.",
        "conteudo": {
          "headline": "Sua escolha com dinheiro chega em quem está perto de você.",
          "corpo": "Toda escolha com dinheiro respinga em alguém. Gastar tudo de uma vez pode faltar para a comida da casa. Comprar algo que vira lixo rápido sobrecarrega o bairro e o meio ambiente. Escolher com cuidado é pensar em você, em quem mora com você e no bairro."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Os R$ 50 do Fábio",
        "mediacao": "Liste com a turma os três afetados: ele, a irmã e o lixo do bairro.",
        "conteudo": {
          "headline": "Quem foi afetado pela escolha do Fábio, além dele mesmo?",
          "personagem": "Fábio",
          "narrativa": "Fábio recebeu R$ 50 de aniversário. Ele quis gastar tudo num brinquedo que quebrou em dois dias. A irmã dele precisava de R$ 18 para o material da escola e ficou sem. O plástico do brinquedo foi para o lixo na mesma semana. A escolha do Fábio respingou em três lugares."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Quando dá conflito",
        "mediacao": "Explique o que é nota fiscal e mostre uma antes de ler as alternativas.",
        "conteudo": {
          "headline": "O brinquedo quebrou em dois dias e a loja se recusou a trocar. O que Fábio deve fazer primeiro?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Discutir alto com o vendedor até conseguir o que quer.",
              "correta": false,
              "feedback": "Brigar não resolve e pode piorar. O conflito se resolve com prova da compra e conhecimento do direito."
            },
            {
              "letra": "B",
              "texto": "Levar a nota fiscal e pedir a troca, porque produto com defeito tem conserto ou troca.",
              "correta": true,
              "feedback": "Isso. A nota comprova a compra, e a lei garante solução para produto com defeito."
            },
            {
              "letra": "C",
              "texto": "Aceitar o prejuízo, porque cliente nunca tem razão nessas horas.",
              "correta": false,
              "feedback": "Não é verdade. Existe conflito de consumo justamente porque quem compra também tem direitos."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "O que você usou pouco",
        "mediacao": "Ajude a criança a lembrar de uma compra recente, mesmo pequena.",
        "conteudo": {
          "headline": "Pense em algo que você comprou e usou pouco. Quanto custou?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Se não lembrar o valor exato, uma estimativa já serve.",
              "tipo": "decimal",
              "placeholder": "R$ 20"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Onde o dinheiro respinga",
        "mediacao": "Leia o resultado sem julgar a escolha; foque no que dá para fazer da próxima vez.",
        "conteudo": {
          "headline": "Você gastou {valor} em algo que usou pouco. Esse dinheiro poderia ter ido para outra coisa sua, da sua casa ou do seu bairro.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 20",
              "mensagem": "Parece pouco, mas várias compras assim no mesmo mês somam um valor que faz falta.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 100",
              "mensagem": "Com esse valor dava para resolver algo que a casa precisava. Vale perguntar antes de comprar.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Valor alto usado pouco pesa na casa inteira. Antes de comprar, converse com quem mora com você.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Antes da próxima compra, pergunte quanto tempo você vai usar aquilo."
        }
      }
    ]
  },
  {
    "slug": "ef67-do-sal-ao-pix",
    "titulo": "Do sal ao Pix",
    "subtitulo": "O que mudou e o que ficou igual em como se paga.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-a",
    "blocoRotulo": "Bloco A · Circulação social do dinheiro",
    "ordem": 1,
    "nivel": "iniciante",
    "duracaoMin": 2,
    "pontos": 30,
    "tags": [
      "dinheiro",
      "historia",
      "pagamento"
    ],
    "thumbnail": "/trilha/circulacao.png",
    "preRequisitoSlug": null,
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF01",
      "EF67LF02"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Muda o formato, fica o acordo",
        "mediacao": null,
        "conteudo": {
          "headline": "Muda o formato do pagamento; permanece a necessidade de acordo.",
          "corpo": "Sal, cereais, gado, moedas de metal, cédulas de papel, Pix. A forma de pagar mudou muitas vezes, mas duas coisas permaneceram: alguém precisa aceitar o que você entrega, e as duas partes precisam concordar no quanto aquilo vale. O que muda é o suporte; o que fica é o acordo e a confiança."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A feira da avó",
        "mediacao": null,
        "conteudo": {
          "headline": "O pastel ficou mais caro, ou o dinheiro de hoje é outro?",
          "personagem": "Fernanda",
          "narrativa": "Fernanda ajuda a avó na feira. A avó conta que, quando era menina, o pai dela pagava o pedreiro com sacas de arroz. Hoje Fernanda paga R$ 12 no pastel por Pix, em dois segundos. A avó acha caro: no tempo dela, o mesmo pastel custava algumas moedas que ela juntava a semana inteira."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "O que permaneceu",
        "mediacao": null,
        "conteudo": {
          "headline": "Comparando o pagamento em sacas de arroz com o Pix de Fernanda, o que permaneceu igual nos dois casos?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Nada: pagar com produto e pagar com celular não têm relação.",
              "correta": false,
              "feedback": "Os dois resolvem o mesmo problema: entregar algo que quita uma dívida. O que mudou foi só o meio usado."
            },
            {
              "letra": "B",
              "texto": "Os dois só funcionam porque quem recebe aceita aquilo como pagamento.",
              "correta": true,
              "feedback": "Isso. Sem aceitação não há pagamento, seja em arroz ou em Pix. É o acordo que sustenta os dois."
            },
            {
              "letra": "C",
              "texto": "O tempo que o pagamento leva para ser confirmado.",
              "correta": false,
              "feedback": "Aí está justamente uma das mudanças. Levar sacas até a casa do pedreiro não se compara a dois segundos de transferência."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Como se paga na sua casa",
        "mediacao": null,
        "conteudo": {
          "headline": "Qual forma de pagamento foi a mais usada por você ou pela sua família nos últimos sete dias?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve; vale o que você lembra, sem conferir extrato.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Dinheiro em espécie",
                  "valor": "1"
                },
                {
                  "label": "Pix",
                  "valor": "2"
                },
                {
                  "label": "Cartão de débito ou crédito",
                  "valor": "3"
                },
                {
                  "label": "Vale ou benefício",
                  "valor": "4"
                },
                {
                  "label": "Troca ou serviço, sem dinheiro",
                  "valor": "5"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Outras formas, mesmo acordo",
        "mediacao": null,
        "conteudo": {
          "headline": "Você marcou {valor}. Não existe resposta melhor aqui: cada forma de pagar carrega vantagens e limites diferentes, em taxa, em prova de que o pagamento aconteceu e em quem precisa aceitar aquilo. Em cinquenta anos, a lista de opções mudou quase inteira. O acordo por trás delas, não.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 1",
              "mensagem": "O papel ainda resolve o seu dia a dia. Ele não depende de internet nem de conta em banco, mas some sem deixar comprovante.",
              "cor": "green"
            },
            {
              "condicao": "valor em 2,3",
              "mensagem": "Seu pagamento é digital e deixa registro. Isso ajuda a comprovar compras e reclamar erros, e concentra em poucas empresas o histórico do que você gasta.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Você usa algo que só vale em certos lugares ou com certas pessoas. É o limite mais antigo da troca, ainda vivo hoje.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Pergunte a alguém com mais de 60 anos como pagava as compras aos 15."
        }
      }
    ]
  },
  {
    "slug": "ef67-mesmo-produto-preco-diferente",
    "titulo": "O mesmo produto, preço diferente",
    "subtitulo": "Atacado, varejo, embalagem — e a conta do lucro.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-a",
    "blocoRotulo": "Bloco A · Circulação social do dinheiro",
    "ordem": 2,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "preco",
      "atacado",
      "varejo"
    ],
    "thumbnail": "/trilha/circulacao.png",
    "preRequisitoSlug": "ef67-do-sal-ao-pix",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF03",
      "EF67LF05"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Por que o preço muda",
        "mediacao": null,
        "conteudo": {
          "headline": "Preço por unidade mostra o que o preço da etiqueta esconde.",
          "corpo": "O mesmo produto tem preços diferentes conforme onde e como é vendido. No atacado, quem compra leva muita quantidade e paga menos por unidade. No varejo, compra pouco e paga mais. Embalagem, transporte e o número de intermediários entre o produtor e você também entram na conta do preço final."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A caixa e o pacote",
        "mediacao": null,
        "conteudo": {
          "headline": "Comprando no atacado, quanto sobra para Flávio depois de vender tudo?",
          "personagem": "Flávio",
          "narrativa": "Flávio vende salgadinho no intervalo da escola. No mercado do bairro, o pacote com 6 unidades sai por R$ 9. No atacado da rodoviária, a caixa com 30 unidades custa R$ 36, mas ele gasta R$ 4 de ônibus para buscar. Ele vende cada salgadinho por R$ 2,50 e, em uma semana, vende os 30."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "A conta do lucro",
        "mediacao": null,
        "conteudo": {
          "headline": "Flávio compra a caixa no atacado, paga o ônibus e vende os 30 salgadinhos. Qual é o lucro dele?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "R$ 39,00",
              "correta": false,
              "feedback": "Você descontou só a caixa, de R$ 36. Os R$ 4 do ônibus também são custo e entram na conta."
            },
            {
              "letra": "B",
              "texto": "R$ 35,00",
              "correta": true,
              "feedback": "Isso. A venda deu R$ 75,00 e o custo foi R$ 40,00, somando R$ 36,00 da caixa e R$ 4,00 do ônibus."
            },
            {
              "letra": "C",
              "texto": "R$ 75,00",
              "correta": false,
              "feedback": "R$ 75,00 é tudo o que entrou com a venda. Lucro é o que sobra depois de tirar o que ele gastou para vender."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Pacote grande compensa?",
        "mediacao": null,
        "conteudo": {
          "headline": "Pense em um produto que sua família compra sempre. Quanto por cento você acha que economiza levando o pacote grande em vez da unidade avulsa?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve; para conferir depois, divida o preço do pacote pelo número de unidades.",
              "tipo": "decimal",
              "placeholder": "20%"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Quando o volume vale",
        "mediacao": null,
        "conteudo": {
          "headline": "Você estimou {valor} de economia. Comprar em quantidade quase sempre baixa o preço por unidade, mas só compensa se o produto for usado antes de estragar e se o dinheiro da compra maior estiver disponível hoje. Foi essa mesma conta que Flávio fez, somando o ônibus ao preço da caixa.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 10",
              "mensagem": "Diferença pequena. Nesse caso comprar aos poucos pode ser melhor: você não deixa dinheiro parado nem corre risco de perder o produto.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 30",
              "mensagem": "É a faixa mais comum no varejo. Vale a pena quando o produto dura e quando a compra maior cabe no orçamento da semana.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Economia grande costuma aparecer no atacado. Confira se o preço por unidade é mesmo menor: embalagem maior nem sempre significa mais barato.",
              "cor": "green"
            }
          ],
          "insightDinamico": "No próximo mercado, compare o preço por quilo de duas embalagens do mesmo produto."
        }
      }
    ]
  },
  {
    "slug": "ef67-conferir-a-conta",
    "titulo": "Conferir a conta",
    "subtitulo": "Achar o erro no recibo e saber reclamar.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-a",
    "blocoRotulo": "Bloco A · Circulação social do dinheiro",
    "ordem": 3,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "recibo",
      "troco",
      "desconto"
    ],
    "thumbnail": "/trilha/circulacao.png",
    "preRequisitoSlug": "ef67-mesmo-produto-preco-diferente",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF04",
      "EF67LF06"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "O papel que prova",
        "mediacao": null,
        "conteudo": {
          "headline": "Comprovante guardado é o que transforma reclamação em direito.",
          "corpo": "Recibo, cupom fiscal e comprovante de Pix servem para provar o que foi pago e conferir se a conta bate. Erro acontece: item cobrado duas vezes, desconto que não entrou, troco a menos. Conferir na hora e falar com firmeza, sem grosseria, é o que resolve. Guardar o comprovante é o que sustenta a reclamação depois."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O cupom errado",
        "mediacao": null,
        "conteudo": {
          "headline": "Quanto o cupom cobrou a mais, e como ela diz isso sem brigar?",
          "personagem": "Franciele",
          "narrativa": "Franciele levou dois cadernos de R$ 15,00 e uma calculadora de R$ 32,00. Na prateleira, uma placa anunciava 10% de desconto nos cadernos. O cupom saiu com três cadernos, sem desconto nenhum, e total de R$ 77,00. Ela tinha lido numa reportagem que cobrança errada precisa ser corrigida na hora, e voltou ao caixa com o cupom na mão."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Quanto deveria dar",
        "mediacao": null,
        "conteudo": {
          "headline": "Aplicando o desconto da placa, quanto Franciele deveria ter pagado pelos dois cadernos e pela calculadora?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "R$ 62,00",
              "correta": false,
              "feedback": "Esse é o total sem aplicar os 10% anunciados na placa. O desconto vale para os cadernos e precisa entrar na conta."
            },
            {
              "letra": "B",
              "texto": "R$ 59,00",
              "correta": true,
              "feedback": "Isso. Os dois cadernos dão R$ 30,00, menos R$ 3,00 de desconto ficam R$ 27,00, mais R$ 32,00 da calculadora."
            },
            {
              "letra": "C",
              "texto": "R$ 74,00",
              "correta": false,
              "feedback": "Aqui o desconto saiu do total errado. O cupom cobrou três cadernos, e ela levou dois para casa."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Onde você se informa",
        "mediacao": null,
        "conteudo": {
          "headline": "Onde você buscaria informação para saber seus direitos quando uma loja cobra errado?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Não existe fonte perfeita; o que muda é quem escreveu e para quê.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Reportagem ou site de notícia",
                  "valor": "1"
                },
                {
                  "label": "Vídeo de influenciador",
                  "valor": "2"
                },
                {
                  "label": "Conversa com alguém da família",
                  "valor": "3"
                },
                {
                  "label": "O próprio site da loja",
                  "valor": "4"
                },
                {
                  "label": "Nunca busquei",
                  "valor": "5"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Quem escreveu e para quê",
        "mediacao": null,
        "conteudo": {
          "headline": "Você escolheu {valor}. Todo texto sobre dinheiro é escrito por alguém com um objetivo: informar, vender ou defender uma posição. Saber quem assina e para quem aquilo foi feito muda o peso que o texto tem na hora de reclamar de uma cobrança como a de Franciele.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 1",
              "mensagem": "Boa fonte quando o veículo assina o texto e cita a lei ou o órgão responsável. Repare se é reportagem ou artigo de opinião: informam de jeitos diferentes.",
              "cor": "green"
            },
            {
              "condicao": "valor em 2,4",
              "mensagem": "Servem para entender rápido, mas quem publica tem interesse no assunto. Vale conferir a mesma informação em uma fonte que não ganhe nada com ela.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "A experiência de casa ajuda, mas envelhece. Regras de troca, prazo e cobrança mudam, e é o texto oficial que vale numa reclamação.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Confira o último cupom de compra da sua casa, item por item, antes de descartar."
        }
      }
    ]
  },
  {
    "slug": "ef67-oferta-e-demanda",
    "titulo": "Oferta e demanda",
    "subtitulo": "Por que o preço sobe quando todo mundo quer.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-b",
    "blocoRotulo": "Bloco B · Planejamento",
    "ordem": 4,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "oferta",
      "demanda",
      "preco"
    ],
    "thumbnail": "/trilha/orcamento.png",
    "preRequisitoSlug": "ef67-conferir-a-conta",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF07",
      "EF67LF08"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Duas forças no preço",
        "mediacao": null,
        "conteudo": {
          "headline": "Oferta é o que existe; demanda é o que querem. O preço fica no meio.",
          "corpo": "Oferta é quanto de um produto existe para vender. Demanda é quanto as pessoas querem comprar. Quando muita gente quer e tem pouco disponível, o preço sobe. Quando sobra produto e poucos querem, o preço cai. Nenhuma das duas manda sozinha: o preço é o ponto onde elas se encontram."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Sol e chuva na quadra",
        "mediacao": null,
        "conteudo": {
          "headline": "O que mudou entre sábado e domingo: o picolé ou quem queria picolé?",
          "personagem": "Gabriel",
          "narrativa": "Gabriel vende picolé caseiro na quadra do bairro. No sábado de sol, a caixa térmica com 40 picolés acabou antes das duas da tarde, e ainda apareceu gente pedindo. No domingo choveu: ele levou os mesmos 40 e voltou com 28. Na segunda, pensou em subir o preço de R$ 3 para R$ 4."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "O que subiu no sábado",
        "mediacao": null,
        "conteudo": {
          "headline": "No sábado de sol, o que aconteceu com a oferta e com a demanda de picolé na quadra?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "A oferta aumentou, porque ele levou muitos picolés.",
              "correta": false,
              "feedback": "A quantidade levada foi a mesma nos dois dias: 40 picolés. O que mudou foi quanta gente queria comprar."
            },
            {
              "letra": "B",
              "texto": "A demanda cresceu com o calor, e a oferta continuou a mesma.",
              "correta": true,
              "feedback": "Isso. Mesma quantidade disponível e mais gente querendo: é essa combinação que empurra o preço para cima."
            },
            {
              "letra": "C",
              "texto": "As duas caíram, porque o estoque acabou cedo.",
              "correta": false,
              "feedback": "Estoque acabar cedo é sinal de procura alta, não baixa. A oferta era limitada, e a demanda passou dela."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Seu preço de domingo",
        "mediacao": null,
        "conteudo": {
          "headline": "Se você estivesse no lugar de Gabriel, por quanto venderia o picolé num domingo de chuva?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Não precisa acertar: o que importa é o motivo por trás do preço escolhido.",
              "tipo": "decimal",
              "placeholder": "R$ 3,00"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Preço depende do dia",
        "mediacao": null,
        "conteudo": {
          "headline": "Você marcou {valor} para o picolé de domingo. Não existe preço certo fora do contexto: o mesmo produto, na mesma quadra, vale coisas diferentes conforme quanta gente está querendo comprar e quanto tem disponível para vender naquele dia.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 3",
              "mensagem": "Você baixou o preço. Com pouca procura, preço menor pode ser o jeito de vender o que estragaria, ao custo de sobrar menos por unidade.",
              "cor": "green"
            },
            {
              "condicao": "valor == 3",
              "mensagem": "Você manteve. Preço estável facilita a vida de quem compra sempre, mas a sobra do dia vira prejuízo se o picolé derreter.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Você subiu. Em dia de pouca procura, preço maior costuma afastar quem ainda compraria; o mesmo aumento faria sentido no sábado lotado.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Repare no preço de uma fruta da estação hoje e de novo daqui a dois meses."
        }
      }
    ]
  },
  {
    "slug": "ef67-onde-anotar",
    "titulo": "Onde anotar o orçamento",
    "subtitulo": "Caderno, planilha ou app — e o tipo de renda que entra.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-b",
    "blocoRotulo": "Bloco B · Planejamento",
    "ordem": 5,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "orcamento",
      "renda",
      "planilha"
    ],
    "thumbnail": "/trilha/orcamento.png",
    "preRequisitoSlug": "ef67-oferta-e-demanda",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF09",
      "EF67LF10"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Onde o orçamento mora",
        "mediacao": null,
        "conteudo": {
          "headline": "A melhor ferramenta de orçamento é a que você abre todo dia.",
          "corpo": "Orçamento é a lista do que entra e do que sai. Pode viver num caderno, no bloco de notas do celular, numa planilha ou num aplicativo. Caderno não depende de bateria; planilha soma sozinha; aplicativo avisa, mas pede internet e guarda seus dados. A ferramenta importa menos que a constância de anotar."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Padaria e fim de semana",
        "mediacao": null,
        "conteudo": {
          "headline": "Com qual das duas rendas ele consegue planejar o mês seguinte?",
          "personagem": "Geraldo",
          "narrativa": "Geraldo trabalha meio período numa padaria e recebe R$ 1.200 fixos todo dia 5, com carteira assinada. Nos fins de semana, monta som em festas e ganha entre R$ 0 e R$ 600, dependendo se aparece serviço. Ele anota tudo num caderno atrás do balcão. Em maio entrou R$ 1.800; em junho, R$ 1.200."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Duas rendas diferentes",
        "mediacao": null,
        "conteudo": {
          "headline": "Qual é a diferença entre o salário da padaria e o dinheiro das festas no orçamento de Geraldo?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "O salário é esporádico e o dinheiro das festas é frequente.",
              "correta": false,
              "feedback": "É o contrário. O salário cai todo mês na mesma data; o serviço de festa aparece de vez em quando."
            },
            {
              "letra": "B",
              "texto": "O salário é formal e frequente; o das festas é informal e esporádico.",
              "correta": true,
              "feedback": "Isso. Renda registrada e previsível sustenta o planejamento; renda informal e variável entra como reforço, não como base."
            },
            {
              "letra": "C",
              "texto": "São iguais, porque no fim do mês o dinheiro é o mesmo.",
              "correta": false,
              "feedback": "O valor pode até coincidir, mas a previsibilidade não. Contar com o que talvez não venha é o que desequilibra o mês."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua ferramenta",
        "mediacao": null,
        "conteudo": {
          "headline": "Onde você anotaria o que entra e o que sai do seu dinheiro hoje?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Não tem escolha certa; cada ferramenta tem uma vantagem e um limite.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Caderno ou papel",
                  "valor": "1"
                },
                {
                  "label": "Bloco de notas do celular",
                  "valor": "2"
                },
                {
                  "label": "Planilha",
                  "valor": "3"
                },
                {
                  "label": "Aplicativo de banco ou de finanças",
                  "valor": "4"
                },
                {
                  "label": "Não anotaria",
                  "valor": "5"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O que é fixo, o que é incerto",
        "mediacao": null,
        "conteudo": {
          "headline": "Você escolheu {valor}. Qualquer uma funciona se for usada toda semana, e nenhuma funciona se ficar parada. Separe o que é fixo do que é incerto, como Geraldo faz: assim você sabe quanto do mês já está garantido antes de contar com o que talvez venha.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor em 1,2",
              "mensagem": "Rápido de abrir e não depende de internet. Em compensação, a soma é sua: um erro de conta desarruma o mês inteiro.",
              "cor": "green"
            },
            {
              "condicao": "valor em 3,4",
              "mensagem": "Somam sozinhos e mostram totais na hora. Exigem acesso a computador ou celular com internet, e o aplicativo guarda seus dados em outro lugar.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Sem registro, o mês vira memória, e memória esquece o que é pequeno. Comece anotando só o que entra: três linhas já mudam a leitura.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Anote hoje tudo o que entrou e saiu do seu bolso nesta semana."
        }
      }
    ]
  },
  {
    "slug": "ef67-parcelou-comprometeu",
    "titulo": "Parcelou, comprometeu",
    "subtitulo": "A parcela de hoje é o dinheiro do mês que vem.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-b",
    "blocoRotulo": "Bloco B · Planejamento",
    "ordem": 6,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "parcelamento",
      "credito",
      "orcamento"
    ],
    "thumbnail": "/trilha/orcamento.png",
    "preRequisitoSlug": "ef67-onde-anotar",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF11",
      "EF67LF12"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Parcela é mês que vem",
        "mediacao": null,
        "conteudo": {
          "headline": "A parcela de hoje é dinheiro que o mês que vem já não tem.",
          "corpo": "Parcelar divide o preço no tempo, não o diminui. Cada parcela combinada hoje já está reservada no orçamento dos próximos meses, antes mesmo de o dinheiro entrar. Quando várias compras parceladas se somam, o mês seguinte chega com boa parte da renda comprometida, e sobra pouco espaço para o que aparecer."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Duas parcelas pequenas",
        "mediacao": null,
        "conteudo": {
          "headline": "Quanto da renda de Gilmar já estava reservada antes de abril começar?",
          "personagem": "Gilmar",
          "narrativa": "Gilmar recebe R$ 1.500 por mês. Em março, parcelou um celular em 10 vezes de R$ 120 e um par de tênis em 5 vezes de R$ 80. Nenhuma das duas parcelas parece grande sozinha. Em abril, quando o material escolar do sobrinho custou R$ 200, já estavam saindo outros R$ 200 por mês em parcelas."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Quanto pesa no mês",
        "mediacao": null,
        "conteudo": {
          "headline": "As duas parcelas de Gilmar somam R$ 200 por mês. Que parte da renda de R$ 1.500 isso compromete?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Cerca de 8%",
              "correta": false,
              "feedback": "8% corresponde só à parcela de R$ 120. A conta precisa somar tudo o que já está comprometido no mês."
            },
            {
              "letra": "B",
              "texto": "Cerca de 13%",
              "correta": true,
              "feedback": "Isso. R$ 200 dentro de R$ 1.500 é pouco mais de 13%, e esse pedaço já está reservado antes de qualquer gasto novo."
            },
            {
              "letra": "C",
              "texto": "Nada, porque parcela não é dívida.",
              "correta": false,
              "feedback": "Parcela é dívida combinada. O produto já foi entregue, e o compromisso de pagar segue nos meses seguintes."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Seu jeito com dinheiro",
        "mediacao": null,
        "conteudo": {
          "headline": "Qual jeito de lidar com dinheiro se parece mais com o seu hoje?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Não existe jeito certo; cada escolha tem uma causa e uma consequência.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Gasto assim que entra",
                  "valor": "1"
                },
                {
                  "label": "Parcelo para caber no mês",
                  "valor": "2"
                },
                {
                  "label": "Junto antes e pago à vista",
                  "valor": "3"
                },
                {
                  "label": "Evito comprar o que não é necessário",
                  "valor": "4"
                },
                {
                  "label": "Depende do mês",
                  "valor": "5"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Cada escolha cobra algo",
        "mediacao": null,
        "conteudo": {
          "headline": "Você marcou {valor}. Cada jeito de lidar com dinheiro nasce de algo: a renda que se tem, o que se viu em casa, o que o momento exige. E cada um cobra um preço diferente lá na frente, como as parcelas de março cobraram o abril de Gilmar.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor em 1,2",
              "mensagem": "Resolve o presente e empurra a conta. Quando a renda varia, esse jeito deixa o mês seguinte sem folga para o que não estava previsto.",
              "cor": "green"
            },
            {
              "condicao": "valor em 3,4",
              "mensagem": "Custa esperar e devolve liberdade: dinheiro não comprometido é o que permite dizer sim a uma oportunidade ou não a uma dívida.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "É o mais comum quando a renda não é fixa. Ajuda saber, logo no início do mês, quanto já está reservado em parcelas antes de decidir qualquer coisa.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Some hoje todas as parcelas que a sua casa paga neste mês."
        }
      }
    ]
  },
  {
    "slug": "ef67-metas-e-ameacas",
    "titulo": "Metas e o que ameaça elas",
    "subtitulo": "Revisar meta, mudar hábito e entender a inflação.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-b",
    "blocoRotulo": "Bloco B · Planejamento",
    "ordem": 7,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "metas",
      "inflacao",
      "orcamento"
    ],
    "thumbnail": "/trilha/orcamento.png",
    "preRequisitoSlug": "ef67-parcelou-comprometeu",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF13",
      "EF67LF14",
      "EF67LF15"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Meta é conta com data",
        "mediacao": null,
        "conteudo": {
          "headline": "Inflação é o mesmo produto custando mais; a meta precisa acompanhar.",
          "corpo": "Meta financeira não é promessa: é conta com data. Ela precisa ser revista de tempos em tempos, porque a vida muda, a renda cai, uma despesa nova aparece, o preço sobe. Inflação é justamente isso: os mesmos produtos custando mais com o passar dos meses. Meta que não é revisada deixa de caber no orçamento."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A bicicleta que subiu",
        "mediacao": null,
        "conteudo": {
          "headline": "O que ela revisa primeiro: quanto guarda, quando compra ou o que compra?",
          "personagem": "Giovana",
          "narrativa": "Giovana quer uma bicicleta de R$ 900 e separa R$ 75 por mês, contando doze meses. No sexto mês ela tem R$ 450 guardados, mas a mesma bicicleta está R$ 990 na loja, e a mãe dela passou a trabalhar menos horas. Giovana precisa decidir se muda o valor mensal, a data ou a meta."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "De quanto foi a alta",
        "mediacao": null,
        "conteudo": {
          "headline": "A bicicleta subiu de R$ 900 para R$ 990 em seis meses. De quanto foi essa alta, em porcentagem?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "9%",
              "correta": false,
              "feedback": "A diferença é de R$ 90, mas a porcentagem se calcula sobre o preço antigo: 90 dividido por 900."
            },
            {
              "letra": "B",
              "texto": "10%",
              "correta": true,
              "feedback": "Isso. R$ 90 sobre R$ 900 dá 10%. É esse tipo de variação de preço ao longo do tempo que chamamos de inflação."
            },
            {
              "letra": "C",
              "texto": "90%",
              "correta": false,
              "feedback": "90 é quanto subiu em reais, não em porcentagem. Se fosse 90%, a bicicleta estaria custando quase o dobro."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Um hábito que dá para mudar",
        "mediacao": null,
        "conteudo": {
          "headline": "Quanto você conseguiria guardar por mês cortando ou reduzindo um gasto que se repete toda semana?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve; pense num gasto real seu, não num valor ideal.",
              "tipo": "decimal",
              "placeholder": "R$ 40,00"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Revisar em vez de desistir",
        "mediacao": null,
        "conteudo": {
          "headline": "Você chegou a {valor} por mês. Guardando esse valor, dá para calcular quanto tempo uma meta leva, e esse tempo muda se o preço subir no meio do caminho. Por isso a revisão é periódica: renda, despesa e preço mudam sem avisar, e a meta se ajusta em vez de ser abandonada.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Nem todo orçamento tem de onde cortar; muitas vezes é a renda que está curta, e isso não é falha sua. Nesse caso, revise o prazo da meta em vez do valor.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 50",
              "mensagem": "Corte pequeno e constante muda o prazo. R$ 40 por mês viram R$ 480 em um ano, sem depender de nenhuma renda nova.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "É um corte grande. Confira se ele se sustenta por vários meses seguidos: meta cumprida é a que aguenta o mês ruim, não só o mês bom.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Escolha uma meta sua e marque uma data no mês que vem para revisá-la."
        }
      }
    ]
  },
  {
    "slug": "ef67-de-graca-nao-e-de-graca",
    "titulo": "De graça não é de graça",
    "subtitulo": "Quem paga a promoção — e o que a produção custa.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-c",
    "blocoRotulo": "Bloco C · Consumo",
    "ordem": 8,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "promocao",
      "gratis",
      "consumo"
    ],
    "thumbnail": "/trilha/consumo.png",
    "preRequisitoSlug": "ef67-metas-e-ameacas",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF16",
      "EF67LF17"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Alguém paga a conta",
        "mediacao": null,
        "conteudo": {
          "headline": "Grátis para você quer dizer pago por outro caminho.",
          "corpo": "Frete grátis, brinde, amostra, primeiro mês sem pagar: nada disso sai do nada. O custo está embutido em outro preço, no seu cadastro ou na expectativa de que você volte. Além do dinheiro, produzir e transportar cada item consome água, energia e trabalho de alguém. Gratuito para você não significa sem custo."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Três pelo preço de uma",
        "mediacao": null,
        "conteudo": {
          "headline": "Ela economizou R$ 29,70 ou gastou a mais do que precisava?",
          "personagem": "Helena",
          "narrativa": "Helena viu a promoção: três camisetas por R$ 60, ou uma por R$ 29,90. Ela precisava de uma só. Levou as três, achando que tinha economizado R$ 29,70, e duas ficaram no armário. Numa etiqueta, leu que cada camiseta consome cerca de 2.700 litros de água entre o cultivo do algodão e o tingimento."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "O desconto e o gasto",
        "mediacao": null,
        "conteudo": {
          "headline": "Helena precisava de uma camiseta e pagou R$ 60 pelo combo de três. Quanto ela gastou a mais do que precisava?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "R$ 29,70, o desconto que a loja anunciou.",
              "correta": false,
              "feedback": "Esse é o desconto calculado sobre três camisetas. Ele só vira economia se as três forem usadas, e duas ficaram paradas."
            },
            {
              "letra": "B",
              "texto": "R$ 30,10, a diferença entre R$ 60,00 e a camiseta de R$ 29,90.",
              "correta": true,
              "feedback": "Isso. Ela saiu com R$ 30,10 a menos no bolso e com duas peças que não precisava."
            },
            {
              "letra": "C",
              "texto": "Nada, porque o preço de cada camiseta ficou menor.",
              "correta": false,
              "feedback": "O preço por peça caiu mesmo, mas o gasto total subiu. Pagar menos por unidade não é o mesmo que gastar menos."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "O que te convence",
        "mediacao": null,
        "conteudo": {
          "headline": "O que mais te faz aceitar uma promoção que você não estava procurando?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Escolha a que mais pesa para você; não existe resposta que sirva a todo mundo.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Medo de perder a oferta",
                  "valor": "1"
                },
                {
                  "label": "Frete grátis",
                  "valor": "2"
                },
                {
                  "label": "Brinde ou amostra",
                  "valor": "3"
                },
                {
                  "label": "Contagem regressiva ou poucas unidades",
                  "valor": "4"
                },
                {
                  "label": "Não costumo aceitar",
                  "valor": "5"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O cálculo do outro lado",
        "mediacao": null,
        "conteudo": {
          "headline": "Você marcou {valor}. Cada oferta dessas mistura dois cálculos: um financeiro, feito pela empresa para recuperar o custo em outro lugar, e um psicológico, feito para acelerar a sua decisão. Somando tudo, ainda existe o custo de produzir aquilo que talvez fique no armário, como as camisetas de Helena.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor em 1,4",
              "mensagem": "Escassez, real ou fabricada, encurta o tempo de pensar. Adiar a compra em um dia costuma revelar se a vontade era sua ou do relógio na tela.",
              "cor": "green"
            },
            {
              "condicao": "valor em 2,3",
              "mensagem": "O que veio de graça já está pago dentro do preço ou no valor do pedido mínimo. Compare o total final com o de levar só o que você queria.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Bom filtro. Vale conferir se ele funciona também em promoção de coisa barata, que passa despercebida e soma no fim do mês.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Antes da próxima promoção, calcule o total final, não o desconto anunciado."
        }
      }
    ]
  },
  {
    "slug": "ef67-o-que-decide-por-voce",
    "titulo": "O que decide por você",
    "subtitulo": "Emoção e viés por dentro, grupo e publicidade por fora.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-c",
    "blocoRotulo": "Bloco C · Consumo",
    "ordem": 9,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "vieses",
      "emocao",
      "publicidade"
    ],
    "thumbnail": "/trilha/consumo.png",
    "preRequisitoSlug": "ef67-de-graca-nao-e-de-graca",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF18",
      "EF67LF19"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Duas forcas em toda escolha",
        "mediacao": null,
        "conteudo": {
          "headline": "Decidir bem começa por perceber quem está decidindo junto com você.",
          "corpo": "Toda decisão de compra tem duas forças agindo junto. De dentro vêm emoção, pressa e atalhos mentais — o cérebro decide rápido para não pensar demais. De fora vêm o grupo de amigos, a publicidade e o que aparece nas redes. Nenhuma das duas é vilã. O problema é decidir sem perceber que elas estão ali."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O fone de Heloisa",
        "mediacao": null,
        "conteudo": {
          "headline": "O que pesou mais na decisão de Heloísa: o que veio de dentro dela ou o que veio de fora?",
          "personagem": "Heloísa",
          "narrativa": "Heloísa juntou R$ 320 para um fone. No grupo da escola, três colegas apareceram com um modelo de R$ 480, e o vídeo do lançamento aparece toda hora no feed dela. Ela sentiu que ficaria de fora se comprasse o mais barato. Voltou para casa decidida a pedir os R$ 160 que faltavam, sem ter olhado nenhum outro modelo."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "De dentro e de fora",
        "mediacao": null,
        "conteudo": {
          "headline": "Na situação de Heloísa, qual combinação descreve melhor o que agiu de dentro e o que agiu de fora?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "De dentro: o preço do fone. De fora: a quantia que ela já tinha juntado.",
              "correta": false,
              "feedback": "Preço e quantia guardada são dados do problema, não forças que empurram a decisão. Eles não explicam a pressa dela."
            },
            {
              "letra": "B",
              "texto": "De dentro: o medo de ficar de fora. De fora: os colegas e o vídeo repetido no feed.",
              "correta": true,
              "feedback": "Isso mesmo. O medo é uma emoção interna; colegas e publicidade repetida agem de fora e reforçam esse medo."
            },
            {
              "letra": "C",
              "texto": "De dentro: o vídeo do lançamento. De fora: a vontade dela de ter o fone.",
              "correta": false,
              "feedback": "Está invertido. O vídeo chega de fora, e a vontade nasce dentro dela."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua semana",
        "mediacao": null,
        "conteudo": {
          "headline": "Nos últimos sete dias, quantas vezes você quis comprar algo logo depois de ver nas redes ou com alguém?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Não precisa ser exato: uma estimativa honesta já mostra o tamanho da influência.",
              "tipo": "decimal",
              "placeholder": "3"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O tamanho do empurrao",
        "mediacao": null,
        "conteudo": {
          "headline": "Você contou {valor} vezes em uma semana. Esse número não diz se você gasta muito ou pouco: diz com que frequência a vontade chega de fora já pronta, antes de você comparar preço ou perguntar se precisa. Percebendo o gatilho, a decisão volta a ser sua.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Ou a semana foi calma, ou os gatilhos passaram sem você notar. Repita a contagem numa semana com mais tempo de tela.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 4",
              "mensagem": "Frequência comum. O ponto não é zerar, é reconhecer o impulso e esperar antes de decidir.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Quase um por dia. Vale olhar quais contas e quais grupos disparam isso com mais força.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Escolha uma vontade de hoje e espere 24 horas antes de decidir se ela continua."
        }
      }
    ]
  },
  {
    "slug": "ef67-poupar-de-proposito",
    "titulo": "Poupar de propósito",
    "subtitulo": "Poupar deixa de ser sobra e vira parte do plano.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-d",
    "blocoRotulo": "Bloco D · Poupança e investimento",
    "ordem": 10,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "poupar",
      "objetivo",
      "planejamento"
    ],
    "thumbnail": "/trilha/poupar.png",
    "preRequisitoSlug": "ef67-o-que-decide-por-voce",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF20",
      "EF67LF23"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Sobra nao e plano",
        "mediacao": null,
        "conteudo": {
          "headline": "Poupar não é o que sobra no fim; é o que sai primeiro.",
          "corpo": "Poupar por sobra é apostar que vai sobrar. Quase nunca sobra. Poupar de propósito é o contrário: você separa uma parte assim que o dinheiro entra e trata o resto como o que dá para gastar. Um objetivo com nome, valor e prazo transforma isso em plano — e um plano é bem mais fácil de seguir do que uma intenção."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O violao de Ivone",
        "mediacao": null,
        "conteudo": {
          "headline": "Nos três primeiros meses faltava dinheiro ou faltava um lugar fixo para ele dentro do mês?",
          "personagem": "Ivone",
          "narrativa": "Ivone recebe R$ 90 por mês ajudando na barraca da feira aos sábados. Ela quer um violão usado de R$ 390. Nos três primeiros meses guardou o que sobrou: R$ 12, depois R$ 0, depois R$ 18. No quarto mês mudou a regra e separou R$ 30 no próprio sábado do pagamento, antes de qualquer gasto."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Quanto tempo falta",
        "mediacao": null,
        "conteudo": {
          "headline": "Ivone já tem R$ 30 guardados e passa a separar R$ 30 todo mês. Em quantos meses ela chega aos R$ 390 do violão?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "13 meses",
              "correta": false,
              "feedback": "Isso ignora os R$ 30 que ela já tinha. Faltam R$ 360, não R$ 390."
            },
            {
              "letra": "B",
              "texto": "12 meses",
              "correta": true,
              "feedback": "Certo. Faltam R$ 360 e, a R$ 30 por mês, são exatamente 12 meses."
            },
            {
              "letra": "C",
              "texto": "10 meses",
              "correta": false,
              "feedback": "Em 10 meses ela junta R$ 300 e, com os R$ 30 iniciais, chega a R$ 330: ainda abaixo do preço."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Seu valor fixo",
        "mediacao": null,
        "conteudo": {
          "headline": "Quanto você consegue separar por mês, logo que o dinheiro entra, sem depender de sobra?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Vale qualquer valor que você consiga repetir todo mês; constância conta mais que tamanho.",
              "tipo": "decimal",
              "placeholder": "R$ 30"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "De intencao para plano",
        "mediacao": null,
        "conteudo": {
          "headline": "Separar {valor} todo mês, sempre no mesmo dia, é o que transforma vontade em plano. Divida o preço do seu objetivo por esse valor e você tem o prazo. Se o prazo assustar, dá para mudar o valor, mudar o objetivo ou aceitar que ele vai demorar: as três respostas são honestas.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Se hoje não dá para separar nada, o plano começa antes: mapear de onde viria essa entrada. Isso não é falha sua.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 50",
              "mensagem": "Valor pequeno e constante já vale: em doze meses vira doze vezes esse número, sem esforço extra.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Bom fôlego. Confira se ele sobrevive a um mês apertado; um valor menor que você nunca quebra rende mais que um alto que falha.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Escolha o dia do mês em que o dinheiro entra e marque a separação nesse dia."
        }
      }
    ]
  },
  {
    "slug": "ef67-guardar-x-render",
    "titulo": "Guardar ou render",
    "subtitulo": "Poupar, investir e o dinheiro que segura o imprevisto.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-d",
    "blocoRotulo": "Bloco D · Poupança e investimento",
    "ordem": 11,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "poupar",
      "investir",
      "poupanca"
    ],
    "thumbnail": "/trilha/poupar.png",
    "preRequisitoSlug": "ef67-poupar-de-proposito",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF21",
      "EF67LF22"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Separar e render",
        "mediacao": null,
        "conteudo": {
          "headline": "Poupar é separar. Investir é fazer o que foi separado render.",
          "corpo": "Poupar é o ato de separar dinheiro e não gastar. Investir é dar um destino a esse dinheiro para que ele renda, ou seja, cresça com o tempo. Na caderneta de poupança, por exemplo, o valor guardado rende um pouco a cada mês. Poupar vem sempre primeiro: sem separar, não há o que render."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A caixa e a caderneta",
        "mediacao": null,
        "conteudo": {
          "headline": "Quem se saiu melhor: quem fez o dinheiro render ou quem tinha o dinheiro disponível quando o imprevisto chegou?",
          "personagem": "Jaqueline",
          "narrativa": "Jaqueline guardou R$ 400 numa caixa embaixo da cama durante o ano todo. A prima dela deixou os mesmos R$ 400 na caderneta de poupança e, doze meses depois, tinha cerca de R$ 425. No mesmo período, a geladeira da casa de Jaqueline queimou e o conserto custou R$ 260 — e ela tinha o dinheiro para pagar na hora."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Qual e a diferenca",
        "mediacao": null,
        "conteudo": {
          "headline": "Qual frase diferencia corretamente o que Jaqueline e a prima fizeram com os R$ 400?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "As duas investiram, só que em lugares diferentes.",
              "correta": false,
              "feedback": "Jaqueline apenas poupou: o dinheiro ficou parado e não rendeu nada. Guardar não é investir."
            },
            {
              "letra": "B",
              "texto": "As duas pouparam; só a prima também investiu, porque o dinheiro dela rendeu.",
              "correta": true,
              "feedback": "Exato. Poupar é separar, e as duas separaram. Render com o tempo é o que caracteriza o investimento."
            },
            {
              "letra": "C",
              "texto": "Jaqueline investiu ao guardar em casa, porque assumiu o risco de perder.",
              "correta": false,
              "feedback": "Correr risco não é investir. Investir é destinar o dinheiro para que ele renda, o que não acontece dentro da caixa."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Seu imprevisto",
        "mediacao": null,
        "conteudo": {
          "headline": "Qual imprevisto poderia aparecer na sua casa nos próximos meses, e quanto ele custaria?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa basta: o objetivo é ter uma ordem de grandeza, não o preço exato.",
              "tipo": "decimal",
              "placeholder": "R$ 260"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Para que serve a reserva",
        "mediacao": null,
        "conteudo": {
          "headline": "Você estimou {valor} para um imprevisto. Reserva é dinheiro poupado que fica disponível justamente para isso: ela não existe para render o máximo, existe para você não precisar de crédito às pressas. Se render um pouco enquanto espera, melhor — mas o critério principal é poder usar quando a hora chega.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 200",
              "mensagem": "Valor baixo e alcançável: dá para montar em poucos meses separando pouco de cada vez.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 1000",
              "mensagem": "Faixa comum de imprevisto doméstico. Divida esse total pelo que você consegue separar por mês para ver o prazo.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Reserva grande leva tempo, e isso é normal. Comece por uma parte dela em vez de adiar por parecer inalcançável.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Escreva o valor da sua reserva e o primeiro depósito que você faz nesta semana."
        }
      }
    ]
  },
  {
    "slug": "ef67-credito-pra-que-serve",
    "titulo": "Crédito: pra que serve",
    "subtitulo": "Quando o crédito resolve — e quem oferece ele.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-e",
    "blocoRotulo": "Bloco E · Crédito e endividamento",
    "ordem": 12,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "credito",
      "bancos",
      "emprestimo"
    ],
    "thumbnail": "/trilha/credito.png",
    "preRequisitoSlug": "ef67-guardar-x-render",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF24",
      "EF67LF34"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Dinheiro adiantado",
        "mediacao": null,
        "conteudo": {
          "headline": "Crédito adianta o dinheiro que você ainda não tem e cobra por esse adiantamento.",
          "corpo": "Crédito é dinheiro que alguém empresta agora para você devolver depois, com um valor a mais chamado juros. Não é sinal de descontrole: às vezes ele resolve uma necessidade que não espera, como um conserto urgente, ou permite que um negócio compre material antes de vender. Quem oferece crédito são bancos, cooperativas, financeiras e fintechs, e cada um cobra um preço diferente por isso."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O forno da banca",
        "mediacao": null,
        "conteudo": {
          "headline": "Nesse caso, o crédito é um problema ou a ferramenta que mantém a renda da família?",
          "personagem": "Jefferson",
          "narrativa": "Jefferson ajuda a mãe na banca de pastel. O forno parou e um novo custa R$ 1.800; a banca tem R$ 600 guardados. Sem forno, a banca fecha e a família fica sem a renda do mês. A mãe comparou três ofertas para os R$ 1.200 que faltam: um banco, uma cooperativa de crédito do bairro e um aplicativo, cada um com um custo diferente."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Por que comparar",
        "mediacao": null,
        "conteudo": {
          "headline": "Por que faz sentido a mãe de Jefferson comparar banco, cooperativa e aplicativo antes de pegar os R$ 1.200?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Porque só bancos podem emprestar dinheiro legalmente.",
              "correta": false,
              "feedback": "Bancos não são os únicos: cooperativas de crédito, financeiras e fintechs também fornecem crédito."
            },
            {
              "letra": "B",
              "texto": "Porque cada agente financeiro cobra um custo diferente pelo mesmo valor emprestado.",
              "correta": true,
              "feedback": "Isso. O valor emprestado é o mesmo, mas juros e taxas mudam de instituição para instituição."
            },
            {
              "letra": "C",
              "texto": "Porque comparar faz o valor emprestado diminuir.",
              "correta": false,
              "feedback": "Comparar não muda os R$ 1.200 emprestados; muda quanto ela vai devolver a mais."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Uma necessidade real",
        "mediacao": null,
        "conteudo": {
          "headline": "Pense numa situação da sua casa ou do seu bairro em que pegar crédito resolveria algo. Qual delas é?",
          "campos": [
            {
              "id": "valor",
              "emoji": "🏠",
              "label": "Não precisa ser algo que já aconteceu; serve qualquer necessidade que você consiga imaginar.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Uma necessidade urgente ou uma ferramenta de trabalho",
                  "valor": "1"
                },
                {
                  "label": "Um desejo de consumo que pode esperar",
                  "valor": "2"
                },
                {
                  "label": "Algo para tocar um negócio",
                  "valor": "3"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Quando o credito cabe",
        "mediacao": null,
        "conteudo": {
          "headline": "Você descreveu: {valor}. Crédito faz sentido quando o que ele resolve não pode esperar e quando existe uma renda futura para pagar as parcelas. Antes de aceitar a primeira oferta, vale perguntar em mais de um lugar: banco, cooperativa, financeira e aplicativo cobram preços diferentes pelo mesmo empréstimo.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 1",
              "mensagem": "É o uso clássico do crédito: ele mantém a renda ou evita um prejuízo maior que o próprio juro.",
              "cor": "green"
            },
            {
              "condicao": "valor == 2",
              "mensagem": "Aqui o crédito custa caro por pressa. Esperar e poupar costuma sair mais barato que pagar juros.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Crédito para negócio se paga com o que o negócio gera. Confira se a venda esperada cobre a parcela.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Pergunte a um adulto da sua casa onde ele buscaria crédito e por quê."
        }
      }
    ]
  },
  {
    "slug": "ef67-pecas-do-credito",
    "titulo": "As peças do crédito",
    "subtitulo": "Juros, taxa e prazo, no curto e no longo.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-e",
    "blocoRotulo": "Bloco E · Crédito e endividamento",
    "ordem": 13,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "credito",
      "juros",
      "taxas"
    ],
    "thumbnail": "/trilha/credito.png",
    "preRequisitoSlug": "ef67-credito-pra-que-serve",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF25",
      "EF67LF28"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Juros, taxas e prazo",
        "mediacao": null,
        "conteudo": {
          "headline": "Parcela menor não é crédito mais barato; costuma ser prazo maior.",
          "corpo": "Todo crédito tem três peças. Os juros são o preço do dinheiro emprestado, expressos em porcentagem. As taxas são cobranças extras, como cadastro ou seguro. O prazo é em quantas parcelas você devolve. Mexer numa peça mexe nas outras: alongar o prazo diminui a parcela, mas faz você pagar juros por mais tempo."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Duas ofertas, uma bicicleta",
        "mediacao": null,
        "conteudo": {
          "headline": "A parcela menor cabe melhor no mês, mas quanto Joana paga a mais no fim das contas?",
          "personagem": "Joana",
          "narrativa": "Joana quer uma bicicleta de R$ 1.200 para ir ao trabalho. A loja oferece duas opções: pagar em 6 parcelas de R$ 220 ou em 24 parcelas de R$ 70. A parcela de R$ 70 cabe melhor no mês dela. Nos dois casos há ainda uma taxa de cadastro de R$ 40 cobrada na primeira parcela."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "O preco do prazo",
        "mediacao": null,
        "conteudo": {
          "headline": "Sem contar a taxa de cadastro, quanto Joana paga a mais escolhendo 24 parcelas de R$ 70 em vez de 6 de R$ 220?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "R$ 150",
              "correta": false,
              "feedback": "Esse valor não bate. Calcule cada opção separadamente antes de comparar: 24 × 70 e 6 × 220."
            },
            {
              "letra": "B",
              "texto": "R$ 360",
              "correta": true,
              "feedback": "Certo. 24 × R$ 70 = R$ 1.680 e 6 × R$ 220 = R$ 1.320. A diferença é R$ 360."
            },
            {
              "letra": "C",
              "texto": "R$ 480",
              "correta": false,
              "feedback": "R$ 480 é a diferença entre as 24 parcelas e o preço à vista de R$ 1.200, não entre as duas formas de parcelar."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Seu prazo",
        "mediacao": null,
        "conteudo": {
          "headline": "Se você tivesse que pagar R$ 1.200 parcelado, em quantas parcelas escolheria dividir?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Pense no que caberia no seu mês; não existe número certo, existe consequência.",
              "tipo": "decimal",
              "placeholder": "12"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Curto ou longo prazo",
        "mediacao": null,
        "conteudo": {
          "headline": "Você escolheu {valor} parcelas. Prazo curto significa parcela alta e menos juros no total; prazo longo significa parcela baixa e mais juros acumulados. As duas escolhas são defensáveis. O erro é escolher olhando só o tamanho da parcela e nunca o total que será pago.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 6",
              "mensagem": "Prazo curto: você paga menos no total, mas a parcela pesa. Confira se ela cabe mesmo num mês apertado.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 18",
              "mensagem": "Prazo intermediário. Multiplique a parcela pelo número de vezes e compare esse total com o preço à vista.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Prazo longo: a parcela alivia agora, mas você fica devendo por muito tempo e paga bem mais no fim.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Pegue um anúncio de parcelamento e multiplique a parcela pelo número de vezes."
        }
      }
    ]
  },
  {
    "slug": "ef67-custo-efetivo-total",
    "titulo": "Custo efetivo total",
    "subtitulo": "O número que mostra o preço real de pegar emprestado.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-e",
    "blocoRotulo": "Bloco E · Crédito e endividamento",
    "ordem": 14,
    "nivel": "avancado",
    "duracaoMin": 4,
    "pontos": 50,
    "tags": [
      "cet",
      "credito",
      "juros"
    ],
    "thumbnail": "/trilha/credito.png",
    "preRequisitoSlug": "ef67-pecas-do-credito",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF26",
      "EF67LF27"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "O preco inteiro",
        "mediacao": null,
        "conteudo": {
          "headline": "O CET é o preço inteiro do crédito, não só a taxa que aparece no anúncio.",
          "corpo": "O Custo Efetivo Total, ou CET, é o preço completo de um crédito: juros mais todas as taxas, seguros e tarifas, reunidos em um só número. Ele existe porque a taxa de juros sozinha esconde parte da conta. Comparar duas ofertas pelo CET é comparar o que você realmente vai pagar, e não só o que aparece no anúncio."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Duas ofertas de Jonas",
        "mediacao": null,
        "conteudo": {
          "headline": "Qual oferta é mais barata para Jonas: a de juros menores ou a de total menor?",
          "personagem": "Jonas",
          "narrativa": "Jonas precisa de R$ 1.000 emprestados. A oferta A anuncia juros menores, mas cobra R$ 90 de tarifa e seguro, e ele devolveria R$ 1.240 no total. A oferta B anuncia juros maiores, não cobra tarifa, e ele devolveria R$ 1.180. O anúncio da A está em letra grande na vitrine; o total só aparece no contrato."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "O que o CET revela",
        "mediacao": null,
        "conteudo": {
          "headline": "Comparando as duas ofertas de R$ 1.000, o que o CET revela que a taxa de juros anunciada esconde?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Que a oferta A é melhor, porque juros menores sempre significam pagar menos.",
              "correta": false,
              "feedback": "Juros menores não bastam quando há tarifa e seguro por fora. O total da A é maior: R$ 1.240."
            },
            {
              "letra": "B",
              "texto": "Que a oferta B custa R$ 60 a menos no total, mesmo com juros anunciados maiores.",
              "correta": true,
              "feedback": "Exato. R$ 1.240 contra R$ 1.180: a B sai R$ 60 mais barata, porque não tem tarifa nem seguro embutidos."
            },
            {
              "letra": "C",
              "texto": "Que as duas custam o mesmo, já que o valor emprestado é igual.",
              "correta": false,
              "feedback": "O valor emprestado é igual, mas o que se devolve não. É justamente essa diferença que o CET mostra."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Seu limite",
        "mediacao": null,
        "conteudo": {
          "headline": "Pegando R$ 1.000 emprestados por um ano, quanto a mais você aceitaria devolver no total?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Não existe resposta certa: o valor marca o ponto em que o crédito deixa de valer para você.",
              "tipo": "decimal",
              "placeholder": "R$ 150"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Pros, contras e criterio",
        "mediacao": null,
        "conteudo": {
          "headline": "Você aceitaria pagar {valor} a mais por R$ 1.000 emprestados. Esse número é o seu critério: se o CET de uma oferta passa desse limite, a resposta é não, por mais urgente que pareça. Crédito tem prós, porque resolve o que não espera, e contras, porque compromete a renda dos próximos meses.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 100",
              "mensagem": "Critério exigente. Ele descarta boa parte das ofertas, o que também significa esperar e poupar mais vezes.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 400",
              "mensagem": "Faixa razoável. Peça sempre o CET por escrito e compare com esse limite antes de assinar.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Você aceitaria devolver quase metade a mais. Confira se a parcela cabe na renda em todos os meses do contrato.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Peça o CET por escrito em qualquer oferta de crédito antes de comparar as parcelas."
        }
      }
    ]
  },
  {
    "slug": "ef67-fatura-do-cartao",
    "titulo": "A fatura do cartão",
    "subtitulo": "Ler a fatura e calcular o custo de pagar só o mínimo.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-e",
    "blocoRotulo": "Bloco E · Crédito e endividamento",
    "ordem": 15,
    "nivel": "avancado",
    "duracaoMin": 4,
    "pontos": 50,
    "tags": [
      "cartao",
      "fatura",
      "juros"
    ],
    "thumbnail": "/trilha/credito.png",
    "preRequisitoSlug": "ef67-custo-efetivo-total",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF31",
      "EF67LF32"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "O que a fatura mostra",
        "mediacao": null,
        "conteudo": {
          "headline": "Pagar o mínimo não encerra a fatura: transfere o resto para o mês seguinte, com juros.",
          "corpo": "A fatura do cartão é a lista do que foi gasto no mês. Ela mostra o total, a data de vencimento, as compras parceladas que ainda vão voltar nos próximos meses e o pagamento mínimo. O mínimo não é um desconto: é a menor parte que evita o atraso. O que ficar sem pagar vira dívida com juros."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O minimo de Josefa",
        "mediacao": null,
        "conteudo": {
          "headline": "Se ela pagou o mínimo em dia, por que a dívida do mês anterior voltou maior?",
          "personagem": "Josefa",
          "narrativa": "A fatura de Josefa fechou em R$ 800, com pagamento mínimo de R$ 240. Ela pagou o mínimo. Os R$ 560 restantes entraram no rotativo, que cobra 10% de juros ao mês. No mês seguinte, além das compras novas, a fatura já trouxe esses R$ 560 acrescidos dos juros. Josefa achava que tinha quitado o mês."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Quanto volta no mes seguinte",
        "mediacao": null,
        "conteudo": {
          "headline": "Josefa pagou R$ 240 de uma fatura de R$ 800. Com 10% de juros ao mês sobre o saldo, quanto volta na próxima fatura?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "R$ 560",
              "correta": false,
              "feedback": "R$ 560 é o saldo sem os juros. Falta somar os 10% cobrados sobre esse valor."
            },
            {
              "letra": "B",
              "texto": "R$ 616",
              "correta": true,
              "feedback": "Certo. 10% de R$ 560 são R$ 56, e R$ 560 + R$ 56 = R$ 616, sem contar as compras novas."
            },
            {
              "letra": "C",
              "texto": "R$ 880",
              "correta": false,
              "feedback": "Isso aplicaria os 10% sobre os R$ 800 inteiros. Os juros incidem só sobre o que ficou sem pagar."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Quanto voce pagaria",
        "mediacao": null,
        "conteudo": {
          "headline": "Se a sua fatura fosse de R$ 800 e você só conseguisse pagar uma parte, quanto pagaria?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Responda com o que caberia de verdade no mês, não com o que seria ideal.",
              "tipo": "decimal",
              "placeholder": "R$ 500"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O custo da parte que fica",
        "mediacao": null,
        "conteudo": {
          "headline": "Pagando {valor} de uma fatura de R$ 800, o restante continua devendo e volta acrescido de juros no mês seguinte. Quanto maior a parte paga, menor o saldo sobre o qual os juros incidem. É por isso que pagar acima do mínimo, mesmo sem quitar tudo, muda o tamanho da conta.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor >= 800",
              "mensagem": "Fatura quitada: nenhum saldo entra no rotativo e nenhum juro é cobrado.",
              "cor": "green"
            },
            {
              "condicao": "valor >= 241",
              "mensagem": "Acima do mínimo. A 10% ao mês, cada R$ 100 pagos a mais economizam R$ 10 de juros já no mês seguinte.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "No mínimo ou abaixo dele. Abaixo do mínimo entram multa e atraso; no mínimo, os R$ 560 restantes voltam como R$ 616.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Peça para ver uma fatura de verdade e localize nela o total e o mínimo."
        }
      }
    ]
  },
  {
    "slug": "ef67-quando-nao-paga",
    "titulo": "Quando não paga",
    "subtitulo": "Honrar dívida, o efeito do não pagamento e por que se chega lá.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-e",
    "blocoRotulo": "Bloco E · Crédito e endividamento",
    "ordem": 16,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "dividas",
      "endividamento",
      "negociacao"
    ],
    "thumbnail": "/trilha/credito.png",
    "preRequisitoSlug": "ef67-fatura-do-cartao",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF29",
      "EF67LF30",
      "EF67LF33"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Confianca e consequencia",
        "mediacao": null,
        "conteudo": {
          "headline": "Dívida não é falha de caráter, mas cobra juros todo mês até ser resolvida.",
          "corpo": "Pagar o que se deve mantém uma relação de confiança: quem cumpre o combinado continua tendo acesso a crédito quando precisa. Deixar de pagar traz consequências reais — juros que crescem, nome negativado, dificuldade de alugar ou financiar. E as causas raramente são só descuido: desemprego, doença, renda que oscila e juros altos empurram muita gente para a dívida."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Quatro meses de Juliana",
        "mediacao": null,
        "conteudo": {
          "headline": "O que mudou quando Juliana procurou a instituição em vez de esperar a dívida passar sozinha?",
          "personagem": "Juliana",
          "narrativa": "Juliana perdeu o serviço em março e a fatura de R$ 900 ficou sem pagamento. Em quatro meses, com juros e multa, a dívida passou de R$ 1.400 e o nome dela foi negativado. Em julho ela voltou a trabalhar, procurou a instituição e negociou o pagamento em parcelas menores. A dívida não sumiu, mas parou de crescer."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Causa e consequencia",
        "mediacao": null,
        "conteudo": {
          "headline": "Qual leitura descreve melhor o que aconteceu com Juliana entre março e julho?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Ela se endividou por falta de disciplina e deveria ter se controlado.",
              "correta": false,
              "feedback": "A causa foi a perda da renda, não descuido. Tratar isso como falha pessoal esconde o motivo real da dívida."
            },
            {
              "letra": "B",
              "texto": "A perda da renda gerou a dívida, e os juros sobre o valor não pago a fizeram crescer até a negativação.",
              "correta": true,
              "feedback": "Isso. A causa foi externa; a consequência do não pagamento total foi a dívida crescer e o crédito ficar restrito."
            },
            {
              "letra": "C",
              "texto": "Como o nome já estava negativado, negociar depois não faria diferença.",
              "correta": false,
              "feedback": "Faz diferença: negociar interrompe o crescimento da dívida e é o caminho para limpar o nome."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Causas que voce conhece",
        "mediacao": null,
        "conteudo": {
          "headline": "Qual dessas causas de endividamento você já viu acontecer perto de você?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Escolha a que mais aparece no que você conhece; todas são causas reais e comuns.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Perda de emprego ou queda de renda",
                  "valor": "1"
                },
                {
                  "label": "Doença ou emergência na família",
                  "valor": "2"
                },
                {
                  "label": "Juros altos de uma dívida antiga",
                  "valor": "3"
                },
                {
                  "label": "Compras por impulso ou pressão do grupo",
                  "valor": "4"
                },
                {
                  "label": "Renda que varia muito de mês para mês",
                  "valor": "5"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Negociar tambem e honrar",
        "mediacao": null,
        "conteudo": {
          "headline": "Você apontou: {valor}. Nenhuma dessas causas se resolve com sermão. O que muda o rumo é agir cedo: falar com quem cobra, pedir prazo ou negociar antes que os juros dobrem a conta. Honrar a dívida importa pela confiança que ela sustenta, e negociar também é uma forma de honrar.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor em 1,2,5",
              "mensagem": "São causas externas e frequentes. A saída passa por renegociar prazo e valor, não por culpa.",
              "cor": "green"
            },
            {
              "condicao": "valor == 3",
              "mensagem": "É a dívida que cresce sozinha. Priorizar a de juro mais alto costuma ser o que estanca a bola de neve.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Aqui dá para agir antes: reconhecer o gatilho e adiar a decisão evita a dívida antes que ela exista.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Se alguém da sua casa tem dívida atrasada, sugira ligar e pedir uma proposta de negociação."
        }
      }
    ]
  },
  {
    "slug": "ef67-historico-e-armadilha",
    "titulo": "Histórico e armadilha",
    "subtitulo": "Cadastro positivo e a publicidade que empurra crédito.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-e",
    "blocoRotulo": "Bloco E · Crédito e endividamento",
    "ordem": 17,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "credito",
      "cadastro positivo",
      "publicidade"
    ],
    "thumbnail": "/trilha/credito.png",
    "preRequisitoSlug": "ef67-quando-nao-paga",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF35",
      "EF67LF36"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "O histórico que fala por você",
        "mediacao": null,
        "conteudo": {
          "headline": "Seu histórico de pagamento é lido antes de qualquer empréstimo.",
          "corpo": "Cadastro positivo é um histórico que registra se as contas de uma pessoa foram pagas em dia. Bancos e lojas consultam esse registro antes de dar crédito, que é dinheiro emprestado para pagar depois. Quem paga em dia costuma conseguir crédito mais barato. Quem atrasa costuma pagar mais caro ou ouvir um não."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O anúncio de Karina",
        "mediacao": null,
        "conteudo": {
          "headline": "O que o anúncio destaca e o que ele deixa em letra pequena?",
          "personagem": "Karina",
          "narrativa": "Karina, de 12 anos, viu um anúncio de fone de ouvido por R$ 480. O anúncio dizia: \"10x de R$ 48, aprovação na hora\". A mãe dela explicou que aquilo era crédito. Explicou também que a loja consulta o histórico de pagamentos antes de aprovar. Karina percebeu que o preço parecia menor porque estava fatiado em dez pedaços."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Onde está a armadilha",
        "mediacao": null,
        "conteudo": {
          "headline": "Um anúncio mostra \"12x de R$ 40\" em letra grande e o preço total em letra pequena. Qual é a armadilha?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Parcelar é sempre errado, mesmo sem juros.",
              "correta": false,
              "feedback": "Parcelar não é errado por si só. A armadilha está em esconder o valor total e apressar a decisão."
            },
            {
              "letra": "B",
              "texto": "O anúncio destaca a parcela para o total de R$ 480 parecer pequeno.",
              "correta": true,
              "feedback": "Isso mesmo. Mostrando só a parcela, o anúncio faz um valor alto parecer baixo e acelera a compra."
            },
            {
              "letra": "C",
              "texto": "A loja não pode consultar o seu histórico de pagamentos.",
              "correta": false,
              "feedback": "Pode sim. O cadastro positivo existe justamente para a loja avaliar o risco antes de dar crédito."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua conta de parcelas",
        "mediacao": null,
        "conteudo": {
          "headline": "Se você aceitasse todos os anúncios que viu nesta semana, quanto pagaria por mês em parcelas?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Uma estimativa aproximada já serve; ninguém precisa somar anúncio por anúncio.",
              "tipo": "decimal",
              "placeholder": "R$ 150"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Parcela é renda futura",
        "mediacao": null,
        "conteudo": {
          "headline": "Você estimou {valor} por mês em parcelas. Parcela é compromisso: ela ocupa a renda futura antes de o mês começar. E é ela que o cadastro positivo registra, paga ou atrasada.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Sem compromisso assumido, toda a renda do mês seguinte continua disponível para decidir na hora.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 100",
              "mensagem": "É um valor pequeno, mas somado a outros vira conta fixa. Anote em que mês ele termina.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Vale separar o que é anúncio do que é necessidade. Quando a renda cai, a parcela não cai junto.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Escolha um anúncio que viu hoje e descubra o preço total à vista."
        }
      }
    ]
  },
  {
    "slug": "ef67-de-onde-vem-a-renda",
    "titulo": "De onde vem a renda",
    "subtitulo": "Formal, informal, frequente, esporádica — público ou privado.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-f",
    "blocoRotulo": "Bloco F · Renda e empreendedorismo",
    "ordem": 18,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "renda",
      "trabalho formal",
      "trabalho informal"
    ],
    "thumbnail": "/trilha/renda.png",
    "preRequisitoSlug": "ef67-historico-e-armadilha",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF37",
      "EF67LF40"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Nem toda renda é igual",
        "mediacao": null,
        "conteudo": {
          "headline": "Renda frequente dá previsibilidade; renda esporádica exige mais planejamento.",
          "corpo": "Renda é o dinheiro que entra. Ela pode ser frequente, como um salário todo mês, ou esporádica, como um bico no fim de semana. Pode ser formal, com contrato registrado e direitos garantidos, ou informal, sem registro. Quanto mais esporádica e informal a renda, mais o planejamento precisa contar com meses fracos."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "As três rendas da casa",
        "mediacao": null,
        "conteudo": {
          "headline": "Qual dessas três rendas é a mais difícil de prever, e o que isso muda?",
          "personagem": "Laís",
          "narrativa": "Na casa de Laís entram três rendas. A tia é professora concursada em escola pública e recebe R$ 3.200 todo mês, em data certa. O irmão trabalha registrado em uma loja privada e ganha R$ 1.600. A avó vende bolos por encomenda: em um mês bom faz R$ 700, em um mês fraco faz R$ 200."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Público e privado",
        "mediacao": null,
        "conteudo": {
          "headline": "A tia de Laís entrou por concurso na escola pública; o irmão foi contratado por uma loja privada. Qual diferença está correta?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "No emprego público não existem regras nem cobrança de resultado.",
              "correta": false,
              "feedback": "Existem sim: servidores seguem regras, prazos e avaliações. A diferença está na entrada e na estabilidade."
            },
            {
              "letra": "B",
              "texto": "Entra-se no público por concurso, com mais estabilidade; no privado, a empresa contrata e demite conforme o negócio.",
              "correta": true,
              "feedback": "Isso. A forma de entrar, as regras e o risco de perder o emprego funcionam de maneiras diferentes nos dois."
            },
            {
              "letra": "C",
              "texto": "Só o emprego privado paga salário; o público paga ajuda do governo.",
              "correta": false,
              "feedback": "Os dois pagam salário. No público, quem paga é o governo, com dinheiro de impostos; no privado, a empresa."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Quanto entra em data fixa",
        "mediacao": null,
        "conteudo": {
          "headline": "Pense em um adulto que você conhece. Quanto da renda dele entra sempre na mesma data?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "É uma estimativa; não precisa perguntar valores a ninguém.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Quase tudo entra em data fixa",
                  "valor": "1"
                },
                {
                  "label": "Mais ou menos metade",
                  "valor": "2"
                },
                {
                  "label": "Quase nada, varia todo mês",
                  "valor": "3"
                },
                {
                  "label": "Não sei dizer",
                  "valor": "4"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Planejar com o que se tem",
        "mediacao": null,
        "conteudo": {
          "headline": "Você respondeu: {valor}. Renda previsível e renda variável não são melhores nem piores. Elas pedem planejamentos diferentes. Renda instável não é falta de esforço: muitos trabalhos são pagos por dia, por entrega ou por encomenda.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 1",
              "mensagem": "Com data certa, dá para montar um calendário de contas ancorado no dia do pagamento.",
              "cor": "green"
            },
            {
              "condicao": "valor == 2",
              "mensagem": "Metade fixa e metade variável: o ideal é que as contas essenciais caibam na parte fixa.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Quando a renda varia, guardar parte dos meses bons é o que sustenta os meses fracos.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Pergunte a um adulto da sua casa se a renda dele entra em data fixa."
        }
      }
    ]
  },
  {
    "slug": "ef67-estudo-desigualdade-lucro",
    "titulo": "Estudo, desigualdade e lucro",
    "subtitulo": "O que faz a renda de um país ser distribuída assim.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-f",
    "blocoRotulo": "Bloco F · Renda e empreendedorismo",
    "ordem": 19,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "desigualdade",
      "renda",
      "estudo"
    ],
    "thumbnail": "/trilha/renda.png",
    "preRequisitoSlug": "ef67-de-onde-vem-a-renda",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF38",
      "EF67LF39",
      "EF67LF41"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "A distância entre as rendas",
        "mediacao": null,
        "conteudo": {
          "headline": "Desigualdade grande trava o país inteiro, não só quem ganha menos.",
          "corpo": "Desigualdade de renda é a distância entre o que ganham as pessoas de um mesmo país. Quando essa distância é enorme, parte da população não alcança escola, saúde e transporte de qualidade. O consumo do país encolhe junto. Desigualdade não é só problema de quem ganha pouco: ela afeta a sociedade toda."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "As pulseiras de Larissa",
        "mediacao": null,
        "conteudo": {
          "headline": "Quanto sobrou de verdade para Larissa no fim do mês?",
          "personagem": "Larissa",
          "narrativa": "Larissa monta e vende pulseiras na feira do bairro. No mês passado, recebeu R$ 900 com as vendas. Gastou R$ 340 em material, R$ 60 na barraca e R$ 50 no transporte. Ela achava que tinha ganhado R$ 900, até somar o que saiu. O que sobra depois das despesas tem nome: lucro."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "A conta do lucro",
        "mediacao": null,
        "conteudo": {
          "headline": "Larissa recebeu R$ 900 e gastou R$ 340 em material, R$ 60 na barraca e R$ 50 no transporte. Qual foi o lucro?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "R$ 900, porque foi tudo o que entrou.",
              "correta": false,
              "feedback": "R$ 900 é a receita, o total que entrou. O lucro só aparece depois de descontar as despesas."
            },
            {
              "letra": "B",
              "texto": "R$ 450, porque as despesas somam R$ 450.",
              "correta": true,
              "feedback": "Isso: 340 + 60 + 50 dá R$ 450 de despesas, e 900 menos 450 dá R$ 450 de lucro."
            },
            {
              "letra": "C",
              "texto": "R$ 560, porque só o material conta como despesa.",
              "correta": false,
              "feedback": "Barraca e transporte também são despesas do negócio. Ignorar custos faz o lucro parecer maior."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Até onde você quer estudar",
        "mediacao": null,
        "conteudo": {
          "headline": "Até que etapa de estudo você pretende chegar?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Não é um compromisso; é a estimativa de hoje, e ela pode mudar.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Terminar o ensino fundamental",
                  "valor": "1"
                },
                {
                  "label": "Terminar o ensino médio",
                  "valor": "2"
                },
                {
                  "label": "Curso técnico depois do médio",
                  "valor": "3"
                },
                {
                  "label": "Faculdade",
                  "valor": "4"
                },
                {
                  "label": "Ainda não decidi",
                  "valor": "5"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Estudo e renda possível",
        "mediacao": null,
        "conteudo": {
          "headline": "Você marcou: {valor}. No Brasil, quem estuda por mais tempo tende a alcançar renda maior ao longo da vida. É tendência, não garantia: oportunidade, região e contatos também pesam. Por isso a desigualdade se repete de uma geração para outra.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 1",
              "mensagem": "Concluir o fundamental é a base. Vale conhecer as opções gratuitas de continuar, como as escolas técnicas públicas.",
              "cor": "green"
            },
            {
              "condicao": "valor em 2,3,4",
              "mensagem": "Cada etapa concluída costuma ampliar portas e renda possível. Descubra quais opções são gratuitas na sua cidade.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Não decidir agora é normal nessa idade. Manter os estudos em dia é o que preserva as escolhas para depois.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Descubra uma escola técnica ou universidade pública da sua região e o que ela oferece."
        }
      }
    ]
  },
  {
    "slug": "ef67-o-que-e-risco",
    "titulo": "O que é risco",
    "subtitulo": "Reconhecer a situação antes do prejuízo.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-g",
    "blocoRotulo": "Bloco G · Risco e proteção",
    "ordem": 20,
    "nivel": "iniciante",
    "duracaoMin": 2,
    "pontos": 30,
    "tags": [
      "risco",
      "prejuizo",
      "protecao"
    ],
    "thumbnail": "/trilha/risco.png",
    "preRequisitoSlug": "ef67-estudo-desigualdade-lucro",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF42",
      "EF67LF43"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Risco é chance, não azar",
        "mediacao": null,
        "conteudo": {
          "headline": "Risco é o que ainda não aconteceu, mas dá para prever e reduzir.",
          "corpo": "Risco é a chance de algo dar errado. Atravessar fora da faixa é risco; deixar o celular na borda da mesa é risco. Risco financeiro é quando o que dá errado custa dinheiro: o aparelho quebra, a bicicleta some, o serviço não é pago. Risco não é azar: é possibilidade que dá para enxergar antes."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A bicicleta de Leandro",
        "mediacao": null,
        "conteudo": {
          "headline": "O que Leandro ganha e o que ele arrisca perder em cada entrega?",
          "personagem": "Leandro",
          "narrativa": "Leandro juntou R$ 1.200 em um ano fazendo entregas de bicicleta no bairro. Ele deixa a bicicleta destrancada na frente das casas enquanto sobe para entregar, porque é mais rápido. Uma bicicleta usada como a dele custa perto de R$ 800. Ele economiza dois minutos por entrega e deixa exposto o que gera a renda dele."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Qual delas custa dinheiro",
        "mediacao": null,
        "conteudo": {
          "headline": "Qual destas situações do dia a dia é um risco financeiro, ou seja, pode virar prejuízo em dinheiro?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Escolher uma roupa diferente para sair de casa.",
              "correta": false,
              "feedback": "Isso é preferência, não risco. Nada de valor está exposto a perda nessa escolha."
            },
            {
              "letra": "B",
              "texto": "Guardar o dinheiro das entregas em um lugar combinado com a família.",
              "correta": false,
              "feedback": "Isso reduz risco em vez de criar. Um lugar combinado diminui a chance de perda e de confusão."
            },
            {
              "letra": "C",
              "texto": "Emprestar o celular novo sem combinar quando ele volta.",
              "correta": true,
              "feedback": "Sim. O aparelho pode não voltar ou voltar quebrado, e repor custa um dinheiro que ninguém planejou."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "O que você carrega",
        "mediacao": null,
        "conteudo": {
          "headline": "Qual é o objeto mais caro que você usa todo dia? Quanto custaria para repor?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "O preço aproximado de um usado parecido já serve como estimativa.",
              "tipo": "decimal",
              "placeholder": "R$ 900"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O tamanho do prejuízo",
        "mediacao": null,
        "conteudo": {
          "headline": "Você estimou {valor} para repor esse objeto. Esse é o tamanho do prejuízo se ele sumir ou quebrar amanhã. É esse número que decide quanto cuidado ele merece.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 200",
              "mensagem": "Prejuízo pequeno, mas ainda é dinheiro. Cuidados simples, como guardar sempre no mesmo lugar, já resolvem.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 1000",
              "mensagem": "Repor isso levaria semanas de economia. Vale um cuidado combinado com a família, não só boa vontade.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "É um valor alto para repor do zero. Objetos assim pedem proteção pensada: trava, seguro ou reserva guardada.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Escolha um objeto seu e defina hoje um lugar fixo para guardá-lo."
        }
      }
    ]
  },
  {
    "slug": "ef67-proteger-o-que-e-seu",
    "titulo": "Proteger o que é seu",
    "subtitulo": "Cuidado, seguro e reserva: três camadas de proteção.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-g",
    "blocoRotulo": "Bloco G · Risco e proteção",
    "ordem": 21,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "protecao",
      "seguro",
      "reserva"
    ],
    "thumbnail": "/trilha/risco.png",
    "preRequisitoSlug": "ef67-o-que-e-risco",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF44",
      "EF67LF45",
      "EF67LF46"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Três camadas de proteção",
        "mediacao": null,
        "conteudo": {
          "headline": "Cuidado evita, seguro divide o prejuízo, reserva cobre o resto.",
          "corpo": "Proteger um bem tem três camadas. A primeira é o cuidado do dia a dia: trancar, guardar, anotar o número do aparelho. A segunda é o seguro: você paga um valor por mês e a empresa cobre parte do prejuízo. A terceira é a reserva, dinheiro guardado que resolve o que as outras não cobriram."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O violão de Lucas",
        "mediacao": null,
        "conteudo": {
          "headline": "Se o violão cair e quebrar, qual das três proteções entra primeiro?",
          "personagem": "Lucas",
          "narrativa": "O violão que Lucas usa nas aulas custou R$ 1.100. Ele guarda o instrumento na capa e anotou o número de série no caderno. A escola de música oferece um seguro de R$ 12 por mês que cobre queda e roubo. Lucas também tem R$ 300 guardados de um trabalho de férias. São três proteções diferentes."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "O que o seguro faz",
        "mediacao": null,
        "conteudo": {
          "headline": "Lucas paga R$ 12 por mês no seguro de um violão de R$ 1.100. O que esse seguro faz por ele?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Impede que o violão quebre ou seja roubado.",
              "correta": false,
              "feedback": "Seguro não impede o acidente. Quem reduz a chance de acontecer é o cuidado: capa, lugar seguro, atenção."
            },
            {
              "letra": "B",
              "texto": "Troca um prejuízo grande e incerto por um custo pequeno e certo.",
              "correta": true,
              "feedback": "Exatamente. Ele paga R$ 144 no ano para não arcar sozinho com R$ 1.100 de uma vez só."
            },
            {
              "letra": "C",
              "texto": "Devolve todo o dinheiro pago se nada acontecer no ano.",
              "correta": false,
              "feedback": "Não devolve. O valor pago comprou a cobertura naquele período, tendo acontecido algo ou não."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua reserva possível",
        "mediacao": null,
        "conteudo": {
          "headline": "Quanto você conseguiria guardar por mês como reserva para imprevistos?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Vale qualquer valor, inclusive zero: reserva se mede pelo hábito, não pelo tamanho.",
              "tipo": "decimal",
              "placeholder": "R$ 20"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "A camada que sobra",
        "mediacao": null,
        "conteudo": {
          "headline": "Você informou {valor} por mês. Reserva é a camada que funciona para qualquer imprevisto, inclusive os que nenhum seguro cobre.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Não sobrar nada agora é comum e não é culpa sua. Nesse caso, cuidado e prevenção são a proteção disponível.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 50",
              "mensagem": "Guardando esse valor, em doze meses você teria doze vezes ele. A constância vale mais que o tamanho.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "É um valor que forma reserva rápido. Combine onde ele fica guardado, para não ser gasto sem querer.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Escolha um bem seu e veja qual das três camadas de proteção falta nele."
        }
      }
    ]
  },
  {
    "slug": "ef67-o-mundo-no-seu-bolso",
    "titulo": "O mundo mexe no seu bolso",
    "subtitulo": "O que acontece longe chega na conta de casa.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-h",
    "blocoRotulo": "Bloco H · Cenário financeiro e cidadania",
    "ordem": 22,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "economia",
      "precos",
      "bancos"
    ],
    "thumbnail": "/trilha/cidadania.png",
    "preRequisitoSlug": "ef67-proteger-o-que-e-seu",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF47",
      "EF67LF51"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "O preço não nasce na loja",
        "mediacao": null,
        "conteudo": {
          "headline": "O que acontece longe muda o preço da sua compra de amanhã.",
          "corpo": "O preço do que você compra não é decidido só na loja. Uma seca longe daqui reduz a colheita e o feijão sobe. Uma fábrica que fecha na sua cidade tira renda de bairros inteiros. Bancos e instituições financeiras ficam no meio desse caminho. Eles guardam dinheiro, emprestam a quem precisa e movem pagamentos."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O tomate de Luciana",
        "mediacao": null,
        "conteudo": {
          "headline": "Quem decidiu esse aumento na conta da família de Luciana?",
          "personagem": "Luciana",
          "narrativa": "A chuva estragou parte da safra de tomate em outro estado. No mercado perto de Luciana, o quilo passou de R$ 6 para R$ 14 em três semanas. A família dela comprava dois quilos por semana. Luciana não mudou nada no que faz, e mesmo assim a conta do mercado subiu R$ 64 no mês."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Para que serve um banco",
        "mediacao": null,
        "conteudo": {
          "headline": "Para que serve um banco ou outra instituição financeira?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Para deixar o dinheiro parado, sem que ele saia de lá.",
              "correta": false,
              "feedback": "Ele não fica parado. O banco usa parte dos depósitos para emprestar a outras pessoas e empresas."
            },
            {
              "letra": "B",
              "texto": "Para imprimir o dinheiro que circula no país.",
              "correta": false,
              "feedback": "Quem autoriza a emissão de dinheiro é o Banco Central, não os bancos onde as pessoas têm conta."
            },
            {
              "letra": "C",
              "texto": "Para guardar dinheiro, movimentar pagamentos e emprestar a quem precisa.",
              "correta": true,
              "feedback": "Sim. Esse papel de intermediário liga quem tem sobra a quem tem falta e faz o dinheiro circular."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Um preço para acompanhar",
        "mediacao": null,
        "conteudo": {
          "headline": "Pense em um produto que a sua casa compra sempre. Quanto ele custa hoje?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Se não souber o preço exato, chute perto: a ideia é ter um número para comparar depois.",
              "tipo": "decimal",
              "placeholder": "R$ 8"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Guarde esse número",
        "mediacao": null,
        "conteudo": {
          "headline": "Você anotou {valor} para esse produto. Guarde o número: quando ele mudar, a causa quase sempre está fora da loja. Pode ser safra, combustível ou uma decisão tomada em outro lugar.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 10",
              "mensagem": "Item barato muda de preço sem chamar atenção, mas pesa no mês quando é comprado toda semana.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 100",
              "mensagem": "Uma alta de 20% aqui já aparece na compra do mês. Vale comparar o preço em dois lugares.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Em compras desse tamanho, pesquisar preço ou esperar uma semana costuma valer mais do que parece.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Anote o preço desse produto hoje e confira de novo daqui a um mês."
        }
      }
    ]
  },
  {
    "slug": "ef67-seus-direitos-consumidor",
    "titulo": "Seus direitos como consumidor",
    "subtitulo": "Quem tem que dever, e onde reclamar quando falha.",
    "publico": "ef67",
    "blocoId": "ef67-bloco-h",
    "blocoRotulo": "Bloco H · Cenário financeiro e cidadania",
    "ordem": 23,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "consumidor",
      "direitos",
      "procon"
    ],
    "thumbnail": "/trilha/cidadania.png",
    "preRequisitoSlug": "ef67-o-mundo-no-seu-bolso",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef67",
    "habilidades": [
      "EF67LF48",
      "EF67LF49",
      "EF67LF50"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Cada lado tem dever",
        "mediacao": null,
        "conteudo": {
          "headline": "Direito do consumidor não é favor da loja: é lei, e vale sem discussão.",
          "corpo": "Em uma compra, cada lado tem dever. A empresa deve informar preço e condições com clareza e entregar o que prometeu. O banco deve explicar tarifas antes de cobrar. O governo deve fiscalizar e manter canais de reclamação. E o consumidor também tem deveres: ler o contrato, guardar a nota e pagar o combinado."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O fone com defeito",
        "mediacao": null,
        "conteudo": {
          "headline": "Se a loja continuar recusando, para onde Luzia leva essa reclamação?",
          "personagem": "Luzia",
          "narrativa": "Luzia comprou um fone pela internet por R$ 220. Chegou com defeito no terceiro dia. A loja disse que não trocava porque a caixa já estava aberta. Ela guardou a nota fiscal e a imagem do anúncio. Pelo Código de Defesa do Consumidor, produto com defeito é responsabilidade da loja. Abrir a caixa não anula esse direito."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Onde reclamar",
        "mediacao": null,
        "conteudo": {
          "headline": "A loja recusou resolver o defeito. Qual é o caminho correto para Luzia reclamar fora da loja?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Procurar o Procon da cidade ou registrar no consumidor.gov.br, guardando nota e protocolo.",
              "correta": true,
              "feedback": "Isso. O Procon fiscaliza e media conflitos de consumo, e o consumidor.gov.br registra a reclamação com a empresa."
            },
            {
              "letra": "B",
              "texto": "Postar nas redes sociais, porque é o único jeito de a empresa responder.",
              "correta": false,
              "feedback": "Reclamar em público às vezes acelera, mas não gera registro oficial nem substitui o canal formal."
            },
            {
              "letra": "C",
              "texto": "Ligar para o Banco Central, que resolve qualquer problema de compra.",
              "correta": false,
              "feedback": "O Banco Central cuida de bancos e instituições financeiras, não de defeito em produto de loja."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Problemas de consumo",
        "mediacao": null,
        "conteudo": {
          "headline": "Nos últimos meses, quantas vezes você ou alguém da sua casa teve problema com uma compra?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Conte de memória: entrega errada, defeito, cobrança a mais ou promessa não cumprida.",
              "tipo": "decimal",
              "placeholder": "2"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Cada problema tem um canal",
        "mediacao": null,
        "conteudo": {
          "headline": "Você contou {valor} problema ou problemas de consumo. Cada um deles tinha um direito por trás e um canal onde reclamar, caso a loja não resolvesse.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Nenhum problema até agora. Saber o caminho antes de precisar é o que faz diferença quando acontecer.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 3",
              "mensagem": "Acontece com quase todo mundo. Guardar nota, imagem do anúncio e número de protocolo sustenta a reclamação.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Repetição assim merece registro formal. Reclamação no Procon ou no consumidor.gov.br entra nas estatísticas de fiscalização.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Salve no celular o site consumidor.gov.br e o telefone do Procon da sua cidade."
        }
      }
    ]
  },
  {
    "slug": "ef89-dinheiro-como-poder",
    "titulo": "Dinheiro como poder",
    "subtitulo": "O que o dinheiro significa além de comprar — e o que forma o preço.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-a",
    "blocoRotulo": "Bloco A · Circulação social do dinheiro",
    "ordem": 1,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "dinheiro",
      "poder",
      "status"
    ],
    "thumbnail": "/trilha/circulacao.png",
    "preRequisitoSlug": null,
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF01",
      "EF89LF02"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Dinheiro não compra só coisas",
        "mediacao": null,
        "conteudo": {
          "headline": "Dinheiro também compra status, influência e o direito de ser levado a sério.",
          "corpo": "Dinheiro compra coisas, mas não só. Ele também organiza quem manda e quem obedece, quem é ouvido numa reunião e quem fica de fora. Marcas vendem pertencimento; cargos vendem autoridade. Quem tem dinheiro decide o que vai ser produzido e a que preço. Reconhecer essa camada social não é condenar o dinheiro. É enxergar o que está em jogo além do número da etiqueta."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Os R$ 350 do logo",
        "mediacao": null,
        "conteudo": {
          "headline": "Os R$ 350 a mais estão pagando o quê, e quem decidiu que valia isso?",
          "personagem": "Maicon",
          "narrativa": "Maicon tem 14 anos e vende doce na saída da escola. Juntou R$ 180 e quer um tênis de marca famosa que custa R$ 499. Um modelo parecido, de outra marca, sai por R$ 149: mesma sola, mesmo tecido, mesma garantia. A diferença de R$ 350 não está no material. Está no logo, na campanha com jogador e no fato de que, no intervalo, quem usa aquele modelo é tratado de outro jeito."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "O que forma o preço",
        "mediacao": null,
        "conteudo": {
          "headline": "Além do custo de fabricar, quais fatores costumam empurrar para cima o preço de um tênis como esse?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Apenas o material e a mão de obra usados na fábrica.",
              "correta": false,
              "feedback": "Custo de produção é uma parte. Impostos, publicidade, concorrência e o tamanho da procura também entram no preço final."
            },
            {
              "letra": "B",
              "texto": "Publicidade, impostos, pouca concorrência e procura alta pelo modelo.",
              "correta": true,
              "feedback": "Isso. O preço junta custo, tributo, esforço de marketing e a disputa entre quem vende e quem quer comprar."
            },
            {
              "letra": "C",
              "texto": "Uma tabela do governo que define o valor de cada tipo de produto.",
              "correta": false,
              "feedback": "No Brasil o preço da maioria dos produtos é livre. O governo cobra impostos e fiscaliza abusos, mas não define quanto custa um tênis."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "O preço da marca",
        "mediacao": null,
        "conteudo": {
          "headline": "Pense em algo que você comprou ou quis comprar pela marca. Quanto a mais custava, comparado a um parecido sem marca?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve; a ideia é medir o tamanho do que a marca cobra a mais.",
              "tipo": "decimal",
              "placeholder": "R$ 120"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O que a marca entrega",
        "mediacao": null,
        "conteudo": {
          "headline": "Você estimou {valor} de diferença. Esse é o preço do que a marca entrega além do produto: reconhecimento, pertencimento, a chance de não ser zoado. Às vezes vale, às vezes é o único jeito de ser respeitado num lugar específico. O que muda tudo é decidir isso sabendo o número, em vez de descobrir depois no extrato.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Você não paga por marca ou ainda não percebeu isso acontecer. Vale olhar de novo: a diferença costuma estar escondida em detalhes pequenos.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 100",
              "mensagem": "Diferença pequena. Nessa faixa a marca ainda disputa com durabilidade e acabamento reais, não só com imagem.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Diferença grande. Compensa separar quanto disso é material melhor e quanto é o status que vem junto.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Compare hoje dois produtos iguais, um de marca famosa e outro sem, e anote a diferença."
        }
      }
    ]
  },
  {
    "slug": "ef89-moeda-de-outro-pais",
    "titulo": "Moeda de outro país",
    "subtitulo": "Real, dólar e a conta do câmbio.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-a",
    "blocoRotulo": "Bloco A · Circulação social do dinheiro",
    "ordem": 2,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "cambio",
      "dolar",
      "real"
    ],
    "thumbnail": "/trilha/circulacao.png",
    "preRequisitoSlug": "ef89-dinheiro-como-poder",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF03",
      "EF89LF04"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Cada país, uma moeda",
        "mediacao": null,
        "conteudo": {
          "headline": "Câmbio é o preço de uma moeda em outra, e ele muda todo dia.",
          "corpo": "Cada país tem sua moeda: real no Brasil, dólar nos Estados Unidos, peso na Argentina, iene no Japão. Câmbio é o preço de uma moeda medida em outra, e esse preço muda todo dia útil. Quando o dólar sobe, tudo que vem de fora, de jogo digital a remédio e trigo, fica mais caro aqui, mesmo que o preço lá fora não tenha mudado."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O jogo em dólar",
        "mediacao": null,
        "conteudo": {
          "headline": "Se o preço em dólar é o mesmo, por que a conta em real ficou maior?",
          "personagem": "Manuela",
          "narrativa": "Manuela quer um jogo digital vendido só em loja estrangeira, por US$ 30. Ela tem R$ 170 guardados de um trabalho de fim de semana. No site o preço aparece em dólar, mas na fatura do cartão vai chegar em real, convertido pela cotação do dia da compra e com imposto e tarifa por cima. Semana passada o dólar estava a R$ 4,90; hoje está a R$ 5,20. O jogo não mudou de preço lá fora."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Fazendo a conversão",
        "mediacao": null,
        "conteudo": {
          "headline": "Com o dólar a R$ 5,20, quanto o jogo de US$ 30 custa em reais, antes de imposto e tarifa?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "R$ 35,20",
              "correta": false,
              "feedback": "Aqui a cotação foi somada ao preço. Câmbio é multiplicação: cada dólar custa R$ 5,20, e são 30 dólares."
            },
            {
              "letra": "B",
              "texto": "R$ 156,00",
              "correta": true,
              "feedback": "Isso: 30 x 5,20 = R$ 156,00. Com imposto e tarifa do cartão, o valor que chega na fatura fica um pouco acima disso."
            },
            {
              "letra": "C",
              "texto": "R$ 5,77",
              "correta": false,
              "feedback": "Essa é a divisão de 30 por 5,20. A divisão serve para o caminho inverso, quando você quer saber quantos dólares compra com certo valor em real."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Quanto vale um dólar",
        "mediacao": null,
        "conteudo": {
          "headline": "Sem consultar nada agora: quanto você acha que custa um dólar em reais hoje?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve; depois confira no buscador ou no site do Banco Central.",
              "tipo": "decimal",
              "placeholder": "R$ 5,20"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Multiplique antes de clicar",
        "mediacao": null,
        "conteudo": {
          "headline": "Você estimou {valor} por dólar. Com essa cotação, uma compra de US$ 30 sai por trinta vezes esse número, antes de imposto e tarifa. Manter o hábito de multiplicar antes de comprar evita surpresa, porque a cotação usada na fatura é a do dia da compra, não a que você viu ontem.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 4.50",
              "mensagem": "Sua estimativa está abaixo do que o dólar tem valido nos últimos anos. Confira a cotação de hoje antes de fazer qualquer conta.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 6.50",
              "mensagem": "Está na faixa em que o dólar vem circulando. Ainda assim confira o número do dia: alguns centavos mudam bastante em compras grandes.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Sua estimativa está acima do usual. Superestimar também atrapalha: faz parecer impossível o que caberia no seu bolso.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Converta para reais o preço de algo em dólar que você viu esta semana."
        }
      }
    ]
  },
  {
    "slug": "ef89-custo-de-oportunidade",
    "titulo": "Custo de oportunidade",
    "subtitulo": "Todo sim é um não para outra coisa, hoje ou depois.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-b",
    "blocoRotulo": "Bloco B · Planejamento",
    "ordem": 3,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "escolha",
      "poupanca",
      "credito"
    ],
    "thumbnail": "/trilha/orcamento.png",
    "preRequisitoSlug": "ef89-moeda-de-outro-pais",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF05",
      "EF89LF08"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "O que você deixa de ter",
        "mediacao": null,
        "conteudo": {
          "headline": "Todo sim carrega um não. O custo de oportunidade é esse não.",
          "corpo": "Custo de oportunidade é o que você deixa de ter ao escolher uma coisa em vez de outra. Não aparece em nota fiscal, mas é real: gastar R$ 300 num fone é ficar sem o curso, sem a peça da bicicleta ou sem esse dinheiro rendendo. Escolha intertemporal é a mesma ideia esticada no tempo: consumir agora, guardar para depois ou pegar crédito e pagar mais caro na frente."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Três caminhos, R$ 600",
        "mediacao": null,
        "conteudo": {
          "headline": "Em qual desses caminhos ele paga mais caro, e em que moeda?",
          "personagem": "Marcelo",
          "narrativa": "Marcelo recebeu R$ 600 por um bico nas férias e tem três caminhos na cabeça. Comprar à vista um celular usado de R$ 600. Parcelar esse mesmo celular em 10 vezes de R$ 78 e manter os R$ 600 guardados. Ou adiar o celular e pagar o curso de instalação de ar-condicionado, que custa R$ 540 e começa em março. O celular que ele usa hoje funciona, só é lento."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "O preço de parcelar",
        "mediacao": null,
        "conteudo": {
          "headline": "Se Marcelo parcela o celular em 10 vezes de R$ 78 em vez de pagar R$ 600 à vista, o que ele assume?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Nada: é o mesmo valor, apenas dividido em pedaços menores.",
              "correta": false,
              "feedback": "Dez parcelas de R$ 78 somam R$ 780. São R$ 180 a mais que o preço à vista, cobrados pelo prazo."
            },
            {
              "letra": "B",
              "texto": "R$ 180 a mais no total e dez meses da renda futura já comprometidos.",
              "correta": true,
              "feedback": "Isso. Além do custo extra, cada parcela ocupa um pedaço do dinheiro dos próximos dez meses, que deixa de estar livre para outra escolha."
            },
            {
              "letra": "C",
              "texto": "Um desconto, porque quem parcela mostra que é bom pagador.",
              "correta": false,
              "feedback": "Parcelar não gera desconto. Quando há diferença, costuma ser o contrário: à vista sai mais barato."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Se sobrassem R$ 500",
        "mediacao": null,
        "conteudo": {
          "headline": "Se sobrassem R$ 500 na sua mão hoje, para onde eles iriam primeiro?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Responda o que você faria de verdade, não o que soa mais certo.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Gastar em algo que quero agora",
                  "valor": "1"
                },
                {
                  "label": "Guardar para uma meta com data",
                  "valor": "2"
                },
                {
                  "label": "Pagar uma dívida ou conta atrasada",
                  "valor": "3"
                },
                {
                  "label": "Ainda não sei",
                  "valor": "4"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O que ficou de fora",
        "mediacao": null,
        "conteudo": {
          "headline": "Você escolheu {valor}. Nenhuma dessas opções é errada por si: o que muda é o que cada uma custa em outro lugar. Quem gasta agora abre mão do depois. Quem guarda abre mão do agora. Quem quita dívida compra tranquilidade e perde dinheiro disponível. O erro é escolher sem enxergar o que ficou de fora.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 1",
              "mensagem": "Escolha legítima, desde que consciente. O custo é a meta que fica mais distante e o imprevisto que te pega sem reserva.",
              "cor": "green"
            },
            {
              "condicao": "valor == 2",
              "mensagem": "Você troca consumo de hoje por consumo de depois. O custo é o que dava para aproveitar agora, e isso também conta na conta.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Quitar atraso costuma valer mais que qualquer rendimento, porque juros de dívida são altos. Se ainda não sabe, comece listando o que está em aberto.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Antes da próxima compra acima de R$ 100, escreva o que ela vai custar em outra coisa."
        }
      }
    ]
  },
  {
    "slug": "ef89-preco-e-calendario",
    "titulo": "Preço que muda com o calendário",
    "subtitulo": "Safra, data comemorativa, promoção — e o dinheiro que cai do céu.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-b",
    "blocoRotulo": "Bloco B · Planejamento",
    "ordem": 4,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "sazonalidade",
      "preco",
      "safra"
    ],
    "thumbnail": "/trilha/orcamento.png",
    "preRequisitoSlug": "ef89-custo-de-oportunidade",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF06",
      "EF89LF09"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "O preço tem calendário",
        "mediacao": null,
        "conteudo": {
          "headline": "O calendário mexe no preço antes de qualquer negociação sua.",
          "corpo": "Preço não é fixo ao longo do ano. Fruta na safra custa menos porque há muita no mercado; na entressafra, sobe. Perto de datas comemorativas a procura aumenta e o vendedor aproveita. Promoção às vezes é desconto real, às vezes é preço inflado antes para parecer queda. Quem conhece esse calendário compra melhor e evita que o mesmo item estoure o orçamento do mês."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Junho apertado",
        "mediacao": null,
        "conteudo": {
          "headline": "O que muda na decisão dela pelo fato de esses R$ 400 não estarem no plano?",
          "personagem": "Márcia",
          "narrativa": "Márcia organiza a lista de compras de casa. Em março o quilo do tomate saiu por R$ 5,90; em junho, com entressafra e chuva atrasada, o mesmo quilo foi para R$ 12,50. A conta de luz de junho veio R$ 90 acima da média, por causa do chuveiro elétrico no frio. No meio desse mês entrou uma restituição de imposto de renda de R$ 400, dinheiro que ela não esperava e não tinha planejado."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Dinheiro que não estava no plano",
        "mediacao": null,
        "conteudo": {
          "headline": "Márcia recebeu R$ 400 inesperados no mesmo mês em que comida e luz subiram. Qual leitura é a mais consciente?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "É extra, então não conta no orçamento e pode ser gasto à vontade.",
              "correta": false,
              "feedback": "Dinheiro inesperado é dinheiro igual aos outros. Tratar como se não contasse é o que faz a restituição sumir sem deixar rastro."
            },
            {
              "letra": "B",
              "texto": "Encaixar os R$ 400 no orçamento do mês e decidir o destino antes de gastar.",
              "correta": true,
              "feedback": "Isso. Colocar a entrada na mesma conta das despesas mostra se ela cobre o aumento sazonal, se sobra algo ou se some no caminho."
            },
            {
              "letra": "C",
              "texto": "Guardar 100% de qualquer valor inesperado é sempre a decisão certa.",
              "correta": false,
              "feedback": "Guardar tudo pode não ser possível quando as contas do mês subiram. A decisão consciente olha primeiro o que o orçamento está pedindo."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "O tamanho da variação",
        "mediacao": null,
        "conteudo": {
          "headline": "Em quanto por cento você acha que a comida da sua casa fica mais cara nos meses ruins?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve; compare de cabeça o mês mais apertado com o mais tranquilo.",
              "tipo": "decimal",
              "placeholder": "20%"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Prever o mês caro",
        "mediacao": null,
        "conteudo": {
          "headline": "Você estimou {valor} de variação. Essa oscilação existe em quase toda casa e não depende de disciplina: depende de safra, clima, feriado e reajuste. Quem conhece o tamanho dela consegue prever o mês apertado e reservar antes, em vez de descobrir no caixa. E quando entra dinheiro fora do previsto, já existe um lugar para ele ir.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 10",
              "mensagem": "Variação baixa. Confira olhando dois recibos de meses diferentes: a diferença costuma ser maior do que a memória guarda.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 30",
              "mensagem": "É a faixa mais comum. Reservar essa diferença nos meses baratos evita cortar comida nos meses caros.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Variação alta. Vale mapear quais itens puxam esse salto e trocar por similares durante a entressafra.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Anote o preço de três itens da feira hoje e confira os mesmos daqui a dois meses."
        }
      }
    ]
  },
  {
    "slug": "ef89-orcamento-que-fecha",
    "titulo": "Orçamento que fecha",
    "subtitulo": "Superavitário, neutro ou deficitário — e como virar o jogo.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-b",
    "blocoRotulo": "Bloco B · Planejamento",
    "ordem": 5,
    "nivel": "avancado",
    "duracaoMin": 4,
    "pontos": 50,
    "tags": [
      "orcamento",
      "saldo",
      "despesas"
    ],
    "thumbnail": "/trilha/orcamento.png",
    "preRequisitoSlug": "ef89-preco-e-calendario",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF10",
      "EF89LF11"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Entra, sai, sobra",
        "mediacao": null,
        "conteudo": {
          "headline": "Saldo é receita menos despesa: sobra, empata ou falta.",
          "corpo": "Orçamento é a lista do que entra e do que sai num período. As saídas se dividem em fixas, que repetem com valor parecido, como aluguel e internet, e variáveis, que mudam, como transporte e comida. Algumas são previstas; outras chegam sem aviso, como um remédio. Receita menos despesa dá o saldo: positivo é superavitário, zero é neutro, negativo é deficitário."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A geladeira quebrou",
        "mediacao": null,
        "conteudo": {
          "headline": "De quanto é o buraco, e o que dá para mexer sem tirar comida da mesa?",
          "personagem": "Mariana",
          "narrativa": "Mariana mora com a mãe e a irmã, e entram R$ 2.400 por mês. As fixas são aluguel de R$ 900, luz de R$ 130, água de R$ 70, internet de R$ 100 e gás de R$ 120. As variáveis somam mercado de R$ 850 e transporte de R$ 260. Neste mês apareceu um imprevisto: R$ 180 do conserto da geladeira. Ela somou tudo e o número não fechou."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Apurando o saldo",
        "mediacao": null,
        "conteudo": {
          "headline": "Somando todas as despesas de Mariana no mês, incluindo o conserto de R$ 180, qual é o saldo dela?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Positivo em R$ 30: sobra pouco, mas fecha.",
              "correta": false,
              "feedback": "As despesas somam R$ 2.610 contra R$ 2.400 que entram. O saldo é negativo, não positivo."
            },
            {
              "letra": "B",
              "texto": "Negativo em R$ 210: o orçamento está deficitário.",
              "correta": true,
              "feedback": "Isso: R$ 1.320 de fixas mais R$ 1.110 de variáveis mais R$ 180 de imprevisto dão R$ 2.610, contra R$ 2.400 de receita."
            },
            {
              "letra": "C",
              "texto": "Neutro: entra e sai exatamente o mesmo valor.",
              "correta": false,
              "feedback": "Seria neutro se as despesas fossem R$ 2.400. Elas chegam a R$ 2.610, então falta dinheiro no fim do mês."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Seu saldo do mês",
        "mediacao": null,
        "conteudo": {
          "headline": "Some o que entra e o que sai na sua vida em um mês comum e informe quanto sobra, ou quanto falta.",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa com números redondos serve; se o mês fecha no vermelho, informe o valor que falta.",
              "tipo": "decimal",
              "placeholder": "R$ 120"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Virando o jogo",
        "mediacao": null,
        "conteudo": {
          "headline": "Seu saldo estimado é {valor}. Esse número resume o orçamento inteiro e muda de mês para mês. Deficitário não quer dizer descuido: renda baixa, atraso no pagamento, doença e imprevisto derrubam qualquer conta bem feita. O que resolve é agir nas duas pontas, reduzindo ou renegociando alguma saída e procurando alguma entrada a mais.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor > 0",
              "mensagem": "Orçamento superavitário. Dê nome à sobra antes que ela evapore: reserva para imprevisto, meta com data ou quitação de dívida.",
              "cor": "green"
            },
            {
              "condicao": "valor == 0",
              "mensagem": "Orçamento neutro. Fecha, mas sem folga: um imprevisto de R$ 200 já joga o mês no vermelho. Vale abrir alguma margem.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Orçamento deficitário. Liste as saídas da maior para a menor, marque as que dá para reduzir ou renegociar e veja qual entrada extra é possível.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Anote por sete dias tudo que sair da sua mão, incluindo os valores pequenos."
        }
      }
    ]
  },
  {
    "slug": "ef89-seu-dinheiro-sua-responsa",
    "titulo": "Seu dinheiro, sua responsabilidade",
    "subtitulo": "Gerenciar o próprio dinheiro e recusar o que não cabe.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-b",
    "blocoRotulo": "Bloco B · Planejamento",
    "ordem": 6,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "planejamento",
      "autonomia",
      "oferta"
    ],
    "thumbnail": "/trilha/orcamento.png",
    "preRequisitoSlug": "ef89-orcamento-que-fecha",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF07",
      "EF89LF12"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Decidir antes que decidam",
        "mediacao": null,
        "conteudo": {
          "headline": "Com um plano no papel, recusar deixa de ser sacrifício e vira cálculo.",
          "corpo": "Assumir o próprio dinheiro é decidir para onde ele vai antes que ele vá sozinho. Planejar não deixa ninguém rico da noite para o dia, mas muda três coisas: você sabe quanto tem, sabe quanto pode assumir e consegue recusar sem sentir culpa. Sem plano, cada oferta parece uma oportunidade. Com plano, ela vira uma pergunta simples: isso cabe no que eu já decidi?"
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O relógio em 12 vezes",
        "mediacao": null,
        "conteudo": {
          "headline": "A parcela cabe. Isso basta para aceitar?",
          "personagem": "Maurício",
          "narrativa": "Maurício tem 14 anos e cuida do próprio dinheiro desde que começou a ajudar no salão da tia aos sábados. Entram cerca de R$ 320 por mês. Ele separa R$ 100 para a meta de comprar uma máquina de corte, R$ 120 para transporte e lanche, e deixa R$ 100 livres. Um vendedor ofereceu um relógio conectado em 12 vezes de R$ 49, com o primeiro mês grátis. A parcela cabe no valor livre, mas ocupa ele inteiro por um ano."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Aceitar ou recusar",
        "mediacao": null,
        "conteudo": {
          "headline": "O relógio sai em 12 vezes de R$ 49 e a parcela cabe no dinheiro livre de Maurício. Qual análise sustenta melhor a decisão?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Cabe na parcela, então é seguro aceitar: é assim que se avalia uma oferta.",
              "correta": false,
              "feedback": "Caber na parcela é o mínimo, não o critério. A oferta compromete R$ 588 e todo o valor livre dele por doze meses."
            },
            {
              "letra": "B",
              "texto": "Comparar o total de R$ 588 e os doze meses travados com o que ele perde: a máquina de corte.",
              "correta": true,
              "feedback": "Isso. A pergunta certa é o que a compra desloca do plano, não se o boleto cabe no mês."
            },
            {
              "letra": "C",
              "texto": "Como o primeiro mês é grátis, o risco é zero e ele decide depois.",
              "correta": false,
              "feedback": "O mês grátis é isca. Depois dele as parcelas seguem, e cancelar costuma ter multa ou prazo mínimo de permanência."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "O que você olha primeiro",
        "mediacao": null,
        "conteudo": {
          "headline": "Quando te oferecem algo parcelado, o que você olha primeiro?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Vale a resposta honesta, não a que parece mais responsável.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "O valor da parcela",
                  "valor": "1"
                },
                {
                  "label": "O preço total",
                  "valor": "2"
                },
                {
                  "label": "Se aquilo está no meu plano",
                  "valor": "3"
                },
                {
                  "label": "Se eu quero muito",
                  "valor": "4"
                },
                {
                  "label": "Nunca parei para pensar",
                  "valor": "5"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Três perguntas, sempre",
        "mediacao": null,
        "conteudo": {
          "headline": "Você respondeu que olha primeiro {valor}. Nenhuma dessas respostas dispensa as outras: a parcela mostra se cabe no mês, o total mostra o preço real, o plano mostra o que a compra desloca. Quem assume o próprio dinheiro faz as três perguntas na mesma ordem e recusa sem precisar de justificativa elaborada.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor em 1,4",
              "mensagem": "São exatamente os dois pontos que o vendedor mais usa. Acrescente o total e o prazo antes de responder qualquer oferta.",
              "cor": "green"
            },
            {
              "condicao": "valor em 2,3",
              "mensagem": "Você já parte do critério certo. Falta manter isso quando a oferta chega com pressa e prazo curto.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Comece pelo mais simples: multiplique a parcela pelo número de meses e olhe o total antes de decidir qualquer coisa.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Escreva sua meta atual num papel e cole onde você a veja todo dia."
        }
      }
    ]
  },
  {
    "slug": "ef89-custo-depois-da-compra",
    "titulo": "O custo depois da compra",
    "subtitulo": "Manutenção, multa e imposto — e o efeito de produzir.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-c",
    "blocoRotulo": "Bloco C · Consumo",
    "ordem": 7,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "manutencao",
      "impostos",
      "multa"
    ],
    "thumbnail": "/trilha/consumo.png",
    "preRequisitoSlug": "ef89-seu-dinheiro-sua-responsa",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF13",
      "EF89LF16"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "A etiqueta é só a entrada",
        "mediacao": null,
        "conteudo": {
          "headline": "Comprar é o primeiro pagamento; manter costuma ser o mais longo.",
          "corpo": "O preço da etiqueta é só a entrada. Depois vêm manutenção, peça de reposição, imposto anual e multa quando alguma regra é descumprida. Um objeto barato de comprar pode ser caro de manter. E existe outra conta, que não chega no seu boleto: o que a produção daquilo custou em água, salário e resíduo, para alguém, em algum lugar."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O primeiro ano da moto",
        "mediacao": null,
        "conteudo": {
          "headline": "Quanto a moto custou além dos R$ 8.000, e o que dava para prever?",
          "personagem": "Michele",
          "narrativa": "Michele comprou uma moto usada por R$ 8.000 para trabalhar com entregas. No primeiro ano vieram IPVA de R$ 220, licenciamento de R$ 160, duas trocas de óleo de R$ 90 cada, um pneu novo de R$ 280 e uma multa de R$ 130 por estacionar em local proibido. Nada disso apareceu na conversa da compra. A moto segue valendo quase o que ela pagou; o ano, não."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "A soma do ano",
        "mediacao": null,
        "conteudo": {
          "headline": "Some os custos do primeiro ano de Michele além do preço da moto. Qual é o total?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "R$ 610",
              "correta": false,
              "feedback": "Ficou algo de fora. São seis valores: R$ 220, R$ 160, R$ 90, R$ 90, R$ 280 e R$ 130."
            },
            {
              "letra": "B",
              "texto": "R$ 970",
              "correta": true,
              "feedback": "Isso: 220 + 160 + 90 + 90 + 280 + 130 dá R$ 970, mais de 12% do que ela pagou pela moto."
            },
            {
              "letra": "C",
              "texto": "R$ 1.240",
              "correta": false,
              "feedback": "Passou do total. A soma dos seis itens dá R$ 970; só a troca de óleo aparece duas vezes."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "O custo de manter",
        "mediacao": null,
        "conteudo": {
          "headline": "Pense no aparelho que você mais usa. Quanto ele custa por ano depois de comprado, somando energia, internet, capinha, conserto e reposição?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve; some o que você lembra de ter gasto com ele no último ano.",
              "tipo": "decimal",
              "placeholder": "R$ 400"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "As duas contas",
        "mediacao": null,
        "conteudo": {
          "headline": "Você estimou {valor} por ano depois da compra. Esse é o custo de posse, e é ele que decide se um objeto barato foi mesmo barato. Existe ainda a conta que ninguém te cobra: minério, água e trabalho que entraram na fabricação, e o lixo eletrônico que sobra no fim. Escolher durabilidade e conserto também é um posicionamento sobre isso.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 100",
              "mensagem": "Custo de posse baixo, ou parte dele passou despercebida. Energia, pacote de dados e acessórios costumam entrar sem aparecer.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 500",
              "mensagem": "Faixa comum. Multiplicado por três ou quatro anos de uso, esse valor pode passar o preço pago pelo aparelho.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Custo alto de manter. Vale comparar com um modelo mais durável e com a opção de consertar em vez de trocar.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Antes da próxima compra, pesquise o preço de um conserto e de uma peça de reposição."
        }
      }
    ]
  },
  {
    "slug": "ef89-publicidade-por-dentro",
    "titulo": "Publicidade por dentro",
    "subtitulo": "O anúncio que você não percebe que é anúncio.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-c",
    "blocoRotulo": "Bloco C · Consumo",
    "ordem": 8,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "publicidade",
      "consumo",
      "midias"
    ],
    "thumbnail": "/trilha/consumo.png",
    "preRequisitoSlug": "ef89-custo-depois-da-compra",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF14",
      "EF89LF15"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Explícita e implícita",
        "mediacao": null,
        "conteudo": {
          "headline": "Todo anúncio quer chegar em você pela emoção antes de chegar pelo preço.",
          "corpo": "Publicidade explícita se anuncia: o comercial, o banner, o \"publi\" no canto do vídeo. A implícita não avisa. É o refrigerante que aparece na cena da novela, o tênis que o streamer usa sem comentar, a marca no fundo do vídeo. As duas querem a mesma coisa: que você associe aquele produto a um sentimento bom antes de pensar no preço."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O caderno da criadora",
        "mediacao": null,
        "conteudo": {
          "headline": "Quantos empurrões diferentes agiram sobre Milena antes de ela pensar se precisava do caderno?",
          "personagem": "Milena",
          "narrativa": "Milena assiste a um vídeo de rotina de estudos. A criadora não diz que é publicidade, mas o caderno aparece em quatro cenas e o link está na descrição. No site, o preço está escrito assim: R$ 89,90 riscado, R$ 59,90 em vermelho, \"só hoje\", com um relógio regressivo. Milena não precisava de caderno quando abriu o vídeo."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Onde está a armadilha",
        "mediacao": null,
        "conteudo": {
          "headline": "No site que Milena abriu, qual recurso age sobre a emoção dela, e não sobre a utilidade do caderno?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "A descrição técnica do caderno: número de folhas e gramatura do papel.",
              "correta": false,
              "feedback": "Isso é informação sobre o produto. Ajuda a decidir se ele serve para você, mas não mexe com o que você sente."
            },
            {
              "letra": "B",
              "texto": "O relógio regressivo com o \"só hoje\" ao lado do preço riscado.",
              "correta": true,
              "feedback": "O relógio fabrica urgência e o preço riscado cria uma referência alta para o desconto parecer maior. Os dois atacam a emoção, não a necessidade."
            },
            {
              "letra": "C",
              "texto": "O link estar na descrição do vídeo.",
              "correta": false,
              "feedback": "O link só facilita a compra. Quem pressiona a decisão são a contagem de tempo e o preço riscado."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua conta de anúncios",
        "mediacao": null,
        "conteudo": {
          "headline": "Nas últimas 24 horas, de quantas aparições de marca dentro de vídeos, séries, jogos ou stories você consegue lembrar?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve: conte só as que você consegue lembrar agora.",
              "tipo": "decimal",
              "placeholder": "6"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O que passou sem ser visto",
        "mediacao": null,
        "conteudo": {
          "headline": "Você lembrou de {valor} aparições de marca que não se anunciavam como anúncio. O número que você não lembra é sempre maior — a publicidade implícita funciona exatamente por passar sem ser notada.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 2",
              "mensagem": "Poucas lembranças costumam indicar pouca atenção ao formato, não pouca exposição. Reveja um vídeo curto contando as marcas visíveis.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 9",
              "mensagem": "Você já reconhece o formato. O próximo passo é nomear o recurso usado: urgência, preço riscado, pessoa que você admira.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Você está lendo as mídias com atenção. Use isso para separar o que você quer porque precisa do que você quer porque te mostraram bem.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Antes da próxima compra por impulso, feche o site e volte nele um dia depois."
        }
      }
    ]
  },
  {
    "slug": "ef89-poupar-e-investir-no-plano",
    "titulo": "Poupar e investir no plano",
    "subtitulo": "Duas coisas diferentes, ambas no mesmo planejamento.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-d",
    "blocoRotulo": "Bloco D · Poupança e investimento",
    "ordem": 9,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "poupar",
      "investir",
      "planejamento"
    ],
    "thumbnail": "/trilha/poupar.png",
    "preRequisitoSlug": "ef89-publicidade-por-dentro",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF17",
      "EF89LF18"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Guardar e fazer render",
        "mediacao": null,
        "conteudo": {
          "headline": "Poupar é decidir guardar. Investir é decidir onde o dinheiro guardado fica.",
          "corpo": "Poupar é separar parte do dinheiro e não gastar. Investir é colocar esse dinheiro em algum lugar onde ele renda — ou seja, onde produza juros, um valor extra pago por deixar o dinheiro ali. Poupar é a decisão de guardar; investir é a decisão de onde guardar. Sem a primeira não existe a segunda, e as duas cabem no mesmo planejamento."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Os dois anos de Natália",
        "mediacao": null,
        "conteudo": {
          "headline": "Separar os R$ 60 todo mês já é metade da decisão. Qual é a outra metade?",
          "personagem": "Natália",
          "narrativa": "Natália quer trocar o celular em dois anos, algo perto de R$ 1.600. Ela consegue separar R$ 60 por mês do que ganha ajudando na barraca da tia. Em 24 meses isso dá R$ 1.440 parados. Se esse mesmo dinheiro ficar em uma aplicação que rende cerca de 0,8% ao mês, chega perto do valor do aparelho sem ela aumentar o depósito."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "O que falta no plano",
        "mediacao": null,
        "conteudo": {
          "headline": "Natália separa R$ 60 por mês e deixa o dinheiro numa caixa em casa. O que falta para o plano dela virar investimento?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Nada: guardar todo mês já é investir.",
              "correta": false,
              "feedback": "Guardar é poupar. Vira investimento só quando o dinheiro é colocado onde rende, isto é, onde recebe juros."
            },
            {
              "letra": "B",
              "texto": "Aumentar o valor mensal de R$ 60 para R$ 100.",
              "correta": false,
              "feedback": "Depositar mais acelera o plano, mas dinheiro parado continua parado. O tamanho do depósito não é o que separa poupar de investir."
            },
            {
              "letra": "C",
              "texto": "Colocar o dinheiro guardado em uma aplicação que renda ao longo dos 24 meses.",
              "correta": true,
              "feedback": "Exato. Poupar é a decisão de separar; investir é a decisão de onde o dinheiro separado fica rendendo."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Seu valor por mês",
        "mediacao": null,
        "conteudo": {
          "headline": "Pense num objetivo seu para daqui a dois anos. Quanto você conseguiria separar por mês sem apertar o mês?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve: um valor pequeno e constante diz mais que um valor alto que não se repete.",
              "tipo": "decimal",
              "placeholder": "R$ 40"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Do parado ao rendendo",
        "mediacao": null,
        "conteudo": {
          "headline": "Separando {valor} por mês, em 24 meses você teria 24 vezes esse valor parado. O mesmo dinheiro rendendo chega mais alto sem exigir depósito maior — essa é a diferença entre poupar e investir dentro do mesmo plano.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Mês sem sobra é comum e não é falha sua. O plano começa pelo mapa do que entra e do que sai, não pelo depósito.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 50",
              "mensagem": "Valor pequeno e constante já constrói o hábito e o montante. A repetição pesa mais que o tamanho do depósito.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Com esse ritmo, um objetivo de dois anos é realista. Confira se o valor cabe também nos meses de gasto extra.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Escreva num papel só o seu objetivo, o prazo e o valor mensal."
        }
      }
    ]
  },
  {
    "slug": "ef89-casa-ou-banco",
    "titulo": "Casa ou banco",
    "subtitulo": "Onde o dinheiro rende e onde ele só espera.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-d",
    "blocoRotulo": "Bloco D · Poupança e investimento",
    "ordem": 10,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "guardar-dinheiro",
      "instituicao-financeira",
      "juros"
    ],
    "thumbnail": "/trilha/poupar.png",
    "preRequisitoSlug": "ef89-poupar-e-investir-no-plano",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF20",
      "EF89LF26"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "A lata e a instituição",
        "mediacao": null,
        "conteudo": {
          "headline": "Em casa o dinheiro espera. Na instituição autorizada, ele rende juros.",
          "corpo": "Dinheiro guardado em casa fica exatamente igual: R$ 500 hoje são R$ 500 daqui a um ano, mas comprando menos, porque os preços sobem. Em uma instituição financeira autorizada pelo Banco Central, o dinheiro aplicado rende juros — um valor pago a você por deixá-lo ali. Em casa há acesso imediato e risco de perda ou roubo; na instituição há rendimento e regras para sacar."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "R$ 900 na lata",
        "mediacao": null,
        "conteudo": {
          "headline": "Se o valor na lata continuou sendo R$ 900, o que Nicolas perdeu nesses dois anos?",
          "personagem": "Nicolas",
          "narrativa": "Nicolas juntou R$ 900 em dois anos numa lata em cima do armário. No mesmo período, os preços do que ele queria comprar subiram cerca de 10%: o que custava R$ 900 passou a custar perto de R$ 990. A lata não perdeu nenhuma nota, mas perdeu poder de compra. Se estivesse aplicado a 0,7% ao mês, o valor teria acompanhado essa alta em vez de ficar para trás."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "O primeiro critério",
        "mediacao": null,
        "conteudo": {
          "headline": "Nicolas quer manter R$ 200 disponíveis para emergência e aplicar o resto. Que critério ele deve usar para escolher onde aplicar?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "A instituição que prometer o maior rendimento, seja ela qual for.",
              "correta": false,
              "feedback": "Promessa alta sem autorização é o padrão dos golpes. Rendimento só vale alguma coisa se a instituição for autorizada e fiscalizada."
            },
            {
              "letra": "B",
              "texto": "Se a instituição é autorizada pelo Banco Central e como ele poderá sacar o dinheiro.",
              "correta": true,
              "feedback": "Confiabilidade e regras de saque vêm antes do rendimento. É a instituição autorizada e fiscalizada que torna os juros seguros."
            },
            {
              "letra": "C",
              "texto": "O aplicativo com a tela mais bonita e mais fácil de usar.",
              "correta": false,
              "feedback": "Facilidade ajuda no dia a dia, mas não diz nada sobre a segurança do dinheiro nem sobre quem responde se algo der errado."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Dinheiro em casa",
        "mediacao": null,
        "conteudo": {
          "headline": "Quanto de dinheiro em espécie costuma ficar guardado na sua casa?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve: ninguém precisa contar nota por nota.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Nada guardado em casa",
                  "valor": "0"
                },
                {
                  "label": "Até R$ 50",
                  "valor": "25"
                },
                {
                  "label": "De R$ 50 a R$ 200",
                  "valor": "125"
                },
                {
                  "label": "De R$ 200 a R$ 1.000",
                  "valor": "600"
                },
                {
                  "label": "Mais de R$ 1.000",
                  "valor": "1400"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Parado custa",
        "mediacao": null,
        "conteudo": {
          "headline": "Você marcou {valor}. Esse dinheiro rende zero enquanto está parado, e ainda assim uma parte em casa faz sentido: é o que se pega na hora, sem depender de aplicativo, senha ou prazo de saque.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Sem espécie em casa, vale ter um valor pequeno acessível para o dia em que faltar sinal, luz ou maquininha.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 200",
              "mensagem": "É um volume compatível com emergência do dia a dia. Acima disso, o que fica parado começa a custar rendimento.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Volume alto em casa soma risco de perda e roubo ao rendimento zero. Vale checar quanto poderia ir para uma instituição autorizada.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Confira no site do Banco Central se a instituição que você usa é autorizada."
        }
      }
    ]
  },
  {
    "slug": "ef89-risco-rendimento-liquidez",
    "titulo": "Risco, rendimento e liquidez",
    "subtitulo": "Os três eixos que descrevem qualquer investimento.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-d",
    "blocoRotulo": "Bloco D · Poupança e investimento",
    "ordem": 11,
    "nivel": "avancado",
    "duracaoMin": 4,
    "pontos": 50,
    "tags": [
      "investimento",
      "risco",
      "liquidez"
    ],
    "thumbnail": "/trilha/poupar.png",
    "preRequisitoSlug": "ef89-casa-ou-banco",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF21",
      "EF89LF28"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Os três eixos",
        "mediacao": null,
        "conteudo": {
          "headline": "Risco, rendimento e liquidez se puxam: melhorar um costuma piorar outro.",
          "corpo": "Todo investimento pode ser descrito por três eixos. Risco é a chance de receber menos do que esperava. Rendimento é o quanto o dinheiro cresce. Liquidez é a rapidez com que ele volta para a sua mão. Os três se puxam: rendimento maior costuma vir com risco maior ou com prazo mais longo. Antes dos três, vem uma pergunta: quem está oferecendo isso é autorizado e fiscalizado?"
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "As três ofertas de Odair",
        "mediacao": null,
        "conteudo": {
          "headline": "As duas primeiras se diferenciam por rendimento e liquidez. A terceira sai da conversa por outro motivo — qual?",
          "personagem": "Odair",
          "narrativa": "Odair tem R$ 3.000 e recebe três ofertas. A primeira rende pouco e devolve o dinheiro no mesmo dia. A segunda rende mais, mas só libera o saque em dois anos. A terceira promete 15% ao mês, garantido, e chegou por mensagem de um perfil que ele não conhece. Essa terceira não tem CNPJ nem registro em nenhum órgão regulador."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Quando tem data marcada",
        "mediacao": null,
        "conteudo": {
          "headline": "Odair precisa do dinheiro em três meses para pagar uma matrícula. Qual eixo pesa mais nessa escolha?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "O rendimento: ele deve escolher a opção que paga mais.",
              "correta": false,
              "feedback": "Render mais não adianta se o dinheiro não estiver disponível na data da matrícula. O prazo vem antes do ganho aqui."
            },
            {
              "letra": "B",
              "texto": "A liquidez: o dinheiro precisa estar disponível na data em que ele vai usar.",
              "correta": true,
              "feedback": "Quando existe data marcada, a liquidez manda. Rendimento alto com resgate só em dois anos não serve para um gasto em três meses."
            },
            {
              "letra": "C",
              "texto": "O risco: com prazo curto ele pode aceitar mais risco.",
              "correta": false,
              "feedback": "É o contrário. Quanto mais curto o prazo, menos tempo existe para recuperar uma eventual perda."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Seu eixo prioritário",
        "mediacao": null,
        "conteudo": {
          "headline": "Dos três eixos, qual pesa mais para você no dinheiro que consegue guardar hoje?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Não existe resposta única: o eixo que pesa mais depende de quando você vai usar o dinheiro.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Risco: não quero perder o que juntei",
                  "valor": "1"
                },
                {
                  "label": "Rendimento: quero o dinheiro crescendo mais",
                  "valor": "2"
                },
                {
                  "label": "Liquidez: quero poder sacar a qualquer momento",
                  "valor": "3"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Nenhum eixo sozinho",
        "mediacao": null,
        "conteudo": {
          "headline": "Você escolheu {valor}. Nenhuma das três respostas está errada — cada uma descreve um objetivo diferente. O erro é escolher sem antes verificar se quem oferece o investimento é autorizado e fiscalizado.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 1",
              "mensagem": "Priorizar risco baixo faz sentido para dinheiro que você não pode perder, como o de uma despesa já marcada.",
              "cor": "green"
            },
            {
              "condicao": "valor == 2",
              "mensagem": "Buscar rendimento maior exige aceitar mais risco ou prazo mais longo. Só cabe com dinheiro que pode ficar parado.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Priorizar liquidez custa rendimento, e é a escolha certa para a reserva que precisa estar disponível a qualquer momento.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Antes de qualquer aplicação, procure o nome da instituição no site do Banco Central."
        }
      }
    ]
  },
  {
    "slug": "ef89-conta-do-rendimento",
    "titulo": "Fazendo a conta do rendimento",
    "subtitulo": "Retorno bruto menos taxa, tarifa e imposto.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-d",
    "blocoRotulo": "Bloco D · Poupança e investimento",
    "ordem": 12,
    "nivel": "avancado",
    "duracaoMin": 4,
    "pontos": 50,
    "tags": [
      "rendimento",
      "taxas",
      "imposto"
    ],
    "thumbnail": "/trilha/poupar.png",
    "preRequisitoSlug": "ef89-risco-rendimento-liquidez",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF22",
      "EF89LF23"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Bruto e líquido",
        "mediacao": null,
        "conteudo": {
          "headline": "O retorno que vale é o líquido: o bruto menos taxa, tarifa e imposto.",
          "corpo": "O número que aparece na propaganda é o retorno bruto. O que chega na sua conta é o líquido. Entre um e outro entram a taxa de administração, cobrada pela gestão da aplicação, as tarifas do banco e o imposto de renda, descontado sobre o ganho no resgate. Comparar duas aplicações pelo bruto engana; a conta que importa é rendimento bruto menos os descontos."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A conta de Patrícia",
        "mediacao": null,
        "conteudo": {
          "headline": "Dos R$ 200 que apareceram como rendimento, quanto é de fato de Patrícia?",
          "personagem": "Patrícia",
          "narrativa": "Patrícia aplicou R$ 2.000 por um ano numa aplicação que rendeu 10% no período. O rendimento bruto foi R$ 200. A instituição cobrou R$ 20 de taxa de administração no ano e o imposto de renda levou 15% do ganho já descontada a taxa, ou seja, 15% de R$ 180, que dá R$ 27. Patrícia queria saber quanto sobrou de verdade."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Quanto sobrou",
        "mediacao": null,
        "conteudo": {
          "headline": "Com rendimento bruto de R$ 200, taxa de R$ 20 e imposto de R$ 27, qual foi o ganho líquido de Patrícia?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "R$ 200, porque taxa e imposto são cobrados à parte.",
              "correta": false,
              "feedback": "Taxa e imposto saem do próprio rendimento. O valor bruto nunca chega inteiro na conta."
            },
            {
              "letra": "B",
              "texto": "R$ 180, porque só a taxa de administração é descontada.",
              "correta": false,
              "feedback": "R$ 180 é o valor depois da taxa e antes do imposto. Faltou descontar os R$ 27 de imposto de renda."
            },
            {
              "letra": "C",
              "texto": "R$ 153, porque R$ 200 menos R$ 20 menos R$ 27 dá R$ 153.",
              "correta": true,
              "feedback": "Correto: R$ 200 − R$ 20 = R$ 180, e R$ 180 − R$ 27 = R$ 153. Sobre os R$ 2.000 aplicados, o rendimento real foi de 7,65%."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua estimativa",
        "mediacao": null,
        "conteudo": {
          "headline": "Imagine que você aplicou R$ 1.000 por um ano a 10%. Quanto você acha que sobraria de ganho depois de taxa e imposto?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve: o objetivo é perceber a distância entre o número anunciado e o que sobra.",
              "tipo": "decimal",
              "placeholder": "R$ 80"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "10% que viram 7,65%",
        "mediacao": null,
        "conteudo": {
          "headline": "Você estimou {valor} sobre um rendimento bruto de R$ 100. Com uma taxa de R$ 10 e imposto de 15% sobre o que restou, sobrariam R$ 76,50 — o anúncio dizia 10%, o bolso recebeu 7,65%.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor >= 95",
              "mensagem": "Você considerou o bruto quase inteiro. Taxa e imposto saem sempre de dentro do rendimento, nunca por fora dele.",
              "cor": "green"
            },
            {
              "condicao": "valor >= 60",
              "mensagem": "Sua estimativa está na faixa certa. Você já espera que parte do rendimento anunciado não chegue à sua conta.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Você descontou mais do que costuma acontecer. Conferir as taxas reais importa: descontar demais também atrapalha a comparação entre aplicações.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Procure a taxa de administração e o imposto antes de comparar duas aplicações pelo rendimento."
        }
      }
    ]
  },
  {
    "slug": "ef89-poupar-x-credito-aposta",
    "titulo": "Poupar, usar crédito — e aposta não entra",
    "subtitulo": "Comparar os dois caminhos, e por que apostar não é nenhum deles.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-d",
    "blocoRotulo": "Bloco D · Poupança e investimento",
    "ordem": 13,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "credito",
      "poupanca",
      "juros"
    ],
    "thumbnail": "/trilha/poupar.png",
    "preRequisitoSlug": "ef89-conta-do-rendimento",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF24",
      "EF89LF25"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Esperar ou pagar juros",
        "mediacao": null,
        "conteudo": {
          "headline": "Poupando, os juros trabalham a seu favor. No crédito, contra você.",
          "corpo": "Para comprar algo caro existem dois caminhos. Poupar: você espera, o dinheiro rende a seu favor e o preço final é menor. Usar crédito: você leva agora e paga juros, então o preço final é maior — às vezes o crédito é a opção possível, quando a necessidade não espera. Apostar não é um terceiro caminho: em loteria e jogo, a matemática trabalha contra o apostador."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A bicicleta de Paula",
        "mediacao": null,
        "conteudo": {
          "headline": "Os dois primeiros caminhos custam coisas diferentes: um custa dinheiro, o outro custa tempo. E o terceiro, o que custa?",
          "personagem": "Paula",
          "narrativa": "Paula precisa de uma bicicleta de R$ 1.200 para chegar ao curso. Parcelando em 12 vezes de R$ 128, ela paga R$ 1.536: R$ 336 a mais. Guardando R$ 100 por mês, ela leva 12 meses e paga os R$ 1.200 — mas anda de ônibus até lá. Um colega sugeriu apostar R$ 50 num site de jogos para acelerar o processo."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Por que aposta não conta",
        "mediacao": null,
        "conteudo": {
          "headline": "Por que a aposta sugerida a Paula não é uma alternativa a poupar ou a usar crédito?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Porque o valor apostado é baixo demais para comprar a bicicleta.",
              "correta": false,
              "feedback": "O problema não é o tamanho da aposta. Mesmo com valor alto, o resultado continua sendo sorteio, e não acúmulo."
            },
            {
              "letra": "B",
              "texto": "Porque em poupança e investimento o resultado é previsível; na aposta, o retorno médio é negativo e o mais provável é perder o valor.",
              "correta": true,
              "feedback": "Isso. Poupar e investir têm resultado previsível dentro de uma faixa; a aposta é montada para devolver menos do que arrecada."
            },
            {
              "letra": "C",
              "texto": "Porque apostar só compensa quando a pessoa entende bem as regras do jogo.",
              "correta": false,
              "feedback": "Conhecer as regras não muda as probabilidades. O jogo é desenhado para que a casa ganhe no conjunto das apostas."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Seu caminho",
        "mediacao": null,
        "conteudo": {
          "headline": "Pense em algo que você quer e ainda não tem. Qual caminho você escolheria hoje?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Não há resposta certa: o caminho depende de quanto essa necessidade pode esperar.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Esperar e juntar o valor inteiro",
                  "valor": "1"
                },
                {
                  "label": "Juntar uma parte e parcelar o resto",
                  "valor": "2"
                },
                {
                  "label": "Parcelar tudo e começar a pagar agora",
                  "valor": "3"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Quanto custa não esperar",
        "mediacao": null,
        "conteudo": {
          "headline": "Você escolheu {valor}. O que decide entre esperar e parcelar é uma pergunta só: quanto essa necessidade pode esperar, e quanto o crédito cobra de você por não esperar.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 1",
              "mensagem": "Esperar é o caminho mais barato e custa tempo. Funciona quando a falta do item não impede algo importante agora.",
              "cor": "green"
            },
            {
              "condicao": "valor == 2",
              "mensagem": "Uma entrada maior reduz os juros pagos. É o meio-termo mais comum quando a necessidade não espera o valor inteiro.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Às vezes essa é a única opção possível, e isso não é falha sua. Confira o total das parcelas, não só o valor de cada uma.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Some as parcelas da próxima compra a prazo e compare com o preço à vista."
        }
      }
    ]
  },
  {
    "slug": "ef89-colchao-aposentadoria-planeta",
    "titulo": "Colchão, aposentadoria e planeta",
    "subtitulo": "Resiliência, longo prazo e o critério ambiental na escolha.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-d",
    "blocoRotulo": "Bloco D · Poupança e investimento",
    "ordem": 14,
    "nivel": "avancado",
    "duracaoMin": 4,
    "pontos": 50,
    "tags": [
      "resiliencia",
      "reserva",
      "aposentadoria"
    ],
    "thumbnail": "/trilha/poupar.png",
    "preRequisitoSlug": "ef89-poupar-x-credito-aposta",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF27",
      "EF89LF19",
      "EF89LF29"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Reserva, décadas e impacto",
        "mediacao": null,
        "conteudo": {
          "headline": "Reserva cobre o mês ruim; aposentadoria cobre as décadas depois do trabalho.",
          "corpo": "Resiliência financeira é a capacidade de aguentar um imprevisto sem desmontar a vida: uma reserva que cobre o mês em que a renda cai. Aposentadoria é o mesmo raciocínio esticado por décadas — guardar hoje para quando trabalhar deixar de ser possível ou desejado. E há um terceiro critério ganhando espaço: aplicações que declaram o impacto ambiental do que financiam, permitindo escolher onde seu dinheiro atua."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Os R$ 120 de Pedro",
        "mediacao": null,
        "conteudo": {
          "headline": "A reserva de Pedro resolveu um mês. O que muda quando o mesmo hábito é esticado por trinta anos?",
          "personagem": "Pedro",
          "narrativa": "Pedro tem 14 anos e ouve em casa que o dinheiro nunca sobra. Ele começou guardando R$ 15 por mês do que ganha lavando carros no fim de semana. Em oito meses juntou R$ 120 e usou R$ 90 para consertar o celular quebrado, sem pedir emprestado a ninguém. Foi a primeira vez que um imprevisto não virou dívida na casa dele."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "O critério ambiental",
        "mediacao": null,
        "conteudo": {
          "headline": "Duas aplicações têm risco e rendimento parecidos, mas uma informa o impacto ambiental do que financia. O que esse dado permite?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Garante rendimento maior, porque projetos sustentáveis rendem mais.",
              "correta": false,
              "feedback": "Não existe essa garantia. O impacto ambiental é um critério a mais na escolha, não uma promessa de retorno."
            },
            {
              "letra": "B",
              "texto": "Acrescentar um critério à decisão: saber que atividades o seu dinheiro ajuda a financiar.",
              "correta": true,
              "feedback": "Isso. Com risco e rendimento parecidos, a informação ambiental vira um critério legítimo de desempate."
            },
            {
              "letra": "C",
              "texto": "Dispensa checar se a instituição é autorizada, já que o projeto é sustentável.",
              "correta": false,
              "feedback": "Nenhum selo substitui a checagem de confiabilidade. Instituição autorizada continua sendo o primeiro filtro."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Meses de reserva",
        "mediacao": null,
        "conteudo": {
          "headline": "Quantos meses de gastos essenciais você acha que uma reserva deveria cobrir?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve: o número depende de quanto a renda de casa varia de um mês para outro.",
              "tipo": "decimal",
              "placeholder": "3"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Do mês ruim às décadas",
        "mediacao": null,
        "conteudo": {
          "headline": "Você respondeu {valor} meses. Uma reserva desse tamanho é o que separa um imprevisto de uma dívida — e o mesmo hábito, mantido por décadas, é o que constrói a renda da aposentadoria.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 1",
              "mensagem": "Um mês cobre um susto pequeno. Renda instável costuma exigir mais tempo coberto, porque a queda pode durar.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 6",
              "mensagem": "Está na faixa que a maioria dos planejadores usa. Comece pelo menor número dessa faixa e aumente devagar.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Reserva longa dá tranquilidade, mas rende pouco por precisar de liquidez. Atingido o alvo, o excedente pode ir para prazos maiores.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Calcule quanto sua casa gasta num mês comum e divida esse valor por dez."
        }
      }
    ]
  },
  {
    "slug": "ef89-contrato-de-credito",
    "titulo": "O contrato de crédito",
    "subtitulo": "Ler as cláusulas e achar o CET no meio delas.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-e",
    "blocoRotulo": "Bloco E · Crédito e endividamento",
    "ordem": 15,
    "nivel": "avancado",
    "duracaoMin": 4,
    "pontos": 50,
    "tags": [
      "credito",
      "contrato",
      "cet"
    ],
    "thumbnail": "/trilha/credito.png",
    "preRequisitoSlug": "ef89-colchao-aposentadoria-planeta",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF31",
      "EF89LF32"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "O que está escrito ali",
        "mediacao": null,
        "conteudo": {
          "headline": "A taxa de juros é só uma parte. O CET é o preço inteiro.",
          "corpo": "Todo crédito vem com um contrato, e nele aparecem palavras que só existem naquele lugar: taxa de juros, que é o preço de usar dinheiro que não é seu; IOF, um imposto sobre operações de crédito; tarifa de cadastro; seguro prestamista; prazo. O Custo Efetivo Total, o CET, é o número que junta tudo isso em uma taxa só. Sem olhar o CET, ninguém sabe quanto o crédito realmente custa."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A letra menor da loja",
        "mediacao": null,
        "conteudo": {
          "headline": "Qual número Priscila deve levar para comparar com a outra loja: os 2,5% ou os 4,1%?",
          "personagem": "Priscila",
          "narrativa": "Priscila quer um celular de R$ 1.800 parcelado em 12 vezes na loja. O vendedor repete a taxa de juros de 2,5% ao mês. No contrato, em letra menor, aparecem tarifa de cadastro de R$ 90, IOF e seguro prestamista de R$ 6 por parcela. Somando tudo, o CET informado é 4,1% ao mês. A parcela cabe no orçamento dela, mas o preço final não é o que ela ouviu do vendedor."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Comparando duas ofertas",
        "mediacao": null,
        "conteudo": {
          "headline": "Duas lojas vendem o mesmo produto. A primeira anuncia juros de 2,5% ao mês; a segunda, CET de 3,4% ao mês. O que dá para concluir?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "A primeira é mais barata, porque 2,5% é menor que 3,4%.",
              "correta": false,
              "feedback": "Os dois números não medem a mesma coisa. A taxa de juros deixa de fora tarifas, IOF e seguros; o CET inclui todos eles."
            },
            {
              "letra": "B",
              "texto": "Ainda não dá para concluir: falta o CET da primeira loja.",
              "correta": true,
              "feedback": "Comparação só vale entre CET e CET. Pedir o CET da primeira loja é o que permite decidir com informação."
            },
            {
              "letra": "C",
              "texto": "A segunda é mais barata, porque o CET é sempre menor que os juros.",
              "correta": false,
              "feedback": "O CET nunca fica abaixo da taxa de juros do contrato, já que ele soma os outros custos ao juro cobrado."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Caça ao CET",
        "mediacao": null,
        "conteudo": {
          "headline": "Pegue um anúncio de parcelamento que você viu esta semana. O que ele diz sobre o CET mensal?",
          "campos": [
            {
              "id": "valor",
              "emoji": "🧾",
              "label": "Estimativa serve: se o anúncio não mostrar o CET, escreva a taxa de juros que ele informa.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "O anúncio não informava o CET",
                  "valor": "1"
                },
                {
                  "label": "Até 3% ao mês",
                  "valor": "2"
                },
                {
                  "label": "Mais de 3% ao mês",
                  "valor": "3"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O preço inteiro",
        "mediacao": null,
        "conteudo": {
          "headline": "Você anotou {valor} ao mês. Esse número, e não o tamanho da parcela, é o que diz quanto o crédito está custando.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 1",
              "mensagem": "Anúncio que esconde o CET já é informação: a loja não quer comparação. Peça o número por escrito antes de assinar.",
              "cor": "yellow"
            },
            {
              "condicao": "valor == 2",
              "mensagem": "Está abaixo do que costuma custar o parcelamento no varejo. Ainda assim, confira tarifa de cadastro e seguro dentro do contrato.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Custo alto. Vale simular o mesmo produto à vista e ver quanto os 12 meses acrescentam ao preço original.",
              "cor": "red"
            }
          ],
          "insightDinamico": "Procure a sigla CET em um anúncio de parcelamento hoje e veja se ela aparece."
        }
      }
    ]
  },
  {
    "slug": "ef89-cabe-no-seu-bolso",
    "titulo": "Cabe no seu bolso?",
    "subtitulo": "Capacidade de pagamento antes da assinatura.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-e",
    "blocoRotulo": "Bloco E · Crédito e endividamento",
    "ordem": 16,
    "nivel": "avancado",
    "duracaoMin": 4,
    "pontos": 50,
    "tags": [
      "credito",
      "capacidade-de-pagamento",
      "juros"
    ],
    "thumbnail": "/trilha/credito.png",
    "preRequisitoSlug": "ef89-contrato-de-credito",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF34",
      "EF89LF33"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "A pergunta certa",
        "mediacao": null,
        "conteudo": {
          "headline": "Capacidade de pagamento é o que sobra depois das contas, não o que sobra hoje.",
          "corpo": "Antes de assinar, a pergunta não é se a parcela cabe hoje, e sim se ela cabe todo mês, até o fim, mesmo se algo mudar. Capacidade de pagamento é o que sobra da renda depois das despesas fixas. E o tipo de crédito muda o tamanho do risco: cheque especial e rotativo do cartão cobram juros bem mais altos que consignado ou crédito pessoal."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A parcela maior que a folga",
        "mediacao": null,
        "conteudo": {
          "headline": "O que Rodrigo teria que cortar, e por quanto tempo, para essa parcela caber de verdade?",
          "personagem": "Rodrigo",
          "narrativa": "Rodrigo tem 17 anos e trabalha como jovem aprendiz: recebe R$ 1.100 por mês. Passe, celular e a parte dele nas contas de casa somam R$ 780, então sobram R$ 320. Ele quer um notebook de R$ 3.000 em 10 parcelas de R$ 360. O vendedor diz que dá para pagar. A parcela é maior do que tudo o que sobra, e o contrato dura dez meses seguidos."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Até quanto de parcela",
        "mediacao": null,
        "conteudo": {
          "headline": "Sobram R$ 320 por mês para Rodrigo. Qual parcela máxima ele deveria aceitar, considerando que imprevistos acontecem?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "R$ 320, usando toda a folga que ele tem.",
              "correta": false,
              "feedback": "Comprometer 100% da folga não deixa margem para um remédio, um conserto ou um mês em que a renda venha menor."
            },
            {
              "letra": "B",
              "texto": "Perto de R$ 160, deixando metade da folga livre.",
              "correta": true,
              "feedback": "Sobra espaço para imprevisto e o contrato continua sendo pago até o fim, que é o que evita juros de atraso."
            },
            {
              "letra": "C",
              "texto": "R$ 360, já que o vendedor aprovou o crédito.",
              "correta": false,
              "feedback": "A aprovação mede o risco da loja receber, não a sua capacidade de pagar sem apertar o resto do mês."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua folga do mês",
        "mediacao": null,
        "conteudo": {
          "headline": "Quanto sobra da sua renda, ou do dinheiro que você recebe, depois das despesas de um mês?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve: pense no mês passado e arredonde o valor.",
              "tipo": "decimal",
              "placeholder": "R$ 250"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Sua parcela máxima",
        "mediacao": null,
        "conteudo": {
          "headline": "Você informou {valor} de folga mensal. Metade disso é uma referência razoável de parcela máxima antes de assinar qualquer contrato.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 0",
              "mensagem": "Sem folga, qualquer parcela nova vira dívida. O caminho é reduzir despesa fixa ou aumentar renda antes de contratar crédito.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 200",
              "mensagem": "Folga pequena. Parcela acima da metade dela transforma qualquer imprevisto em atraso, e atraso custa multa e juros.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Há espaço, mas ele some rápido em crédito rotativo ou cheque especial, onde os juros são os mais altos do mercado.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Liste suas despesas fixas de um mês e subtraia da renda para achar sua folga real."
        }
      }
    ]
  },
  {
    "slug": "ef89-conta-de-emprestimo",
    "titulo": "A conta do empréstimo",
    "subtitulo": "Calcular o custo real, inclusive do financiamento estudantil.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-e",
    "blocoRotulo": "Bloco E · Crédito e endividamento",
    "ordem": 17,
    "nivel": "avancado",
    "duracaoMin": 4,
    "pontos": 50,
    "tags": [
      "financiamento-estudantil",
      "emprestimo",
      "juros"
    ],
    "thumbnail": "/trilha/credito.png",
    "preRequisitoSlug": "ef89-cabe-no-seu-bolso",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF36",
      "EF89LF30"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Estudar agora, pagar depois",
        "mediacao": null,
        "conteudo": {
          "headline": "Financiamento estudantil não é bolsa: é dívida com prazo e juros.",
          "corpo": "Financiamento estudantil é crédito: alguém paga o seu curso superior agora e você devolve depois, com juros. O Fies é o programa público mais conhecido, e existem também linhas privadas. A conta que importa é simples: quanto foi emprestado, por quanto tempo e quanto se paga no total. O mesmo cálculo vale para o cheque especial, só que ali os juros correm por dia."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Vinte e quatro mensalidades",
        "mediacao": null,
        "conteudo": {
          "headline": "Quanto de juros se acumula nesses 24 meses e qual vira o valor final da dívida de Rosana?",
          "personagem": "Rosana",
          "narrativa": "Rosana entrou em um curso superior que custa R$ 800 por mês e financiou 24 mensalidades. O valor emprestado foi R$ 19.200. O contrato prevê juros simples de 0,5% ao mês sobre esse valor durante os 24 meses do curso, e a devolução só começa depois. Ao terminar, ela quer saber quanto deve de fato: o preço do curso ou algo maior que isso."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Faça a conta",
        "mediacao": null,
        "conteudo": {
          "headline": "R$ 19.200 emprestados, com juros simples de 0,5% ao mês durante 24 meses. Quanto Rosana deve ao terminar o curso?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "R$ 19.200, porque os juros só começam depois da formatura.",
              "correta": false,
              "feedback": "Os juros correm desde a contratação. O que fica para depois é o pagamento das parcelas, não a cobrança do juro."
            },
            {
              "letra": "B",
              "texto": "R$ 21.504, somando R$ 2.304 de juros.",
              "correta": true,
              "feedback": "0,5% de R$ 19.200 dá R$ 96 por mês. Em 24 meses são R$ 2.304, que somados ao valor emprestado dão R$ 21.504."
            },
            {
              "letra": "C",
              "texto": "R$ 28.800, porque os juros aumentam a dívida pela metade.",
              "correta": false,
              "feedback": "Juros simples de 0,5% ao mês acrescentam 12% em dois anos, não 50%. A conta daria R$ 2.304 de juros."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "O curso que você faria",
        "mediacao": null,
        "conteudo": {
          "headline": "Pense em um curso que você faria depois da escola. Quanto custaria a mensalidade dele?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve: use o preço de um curso parecido que você já viu anunciado.",
              "tipo": "decimal",
              "placeholder": "R$ 600"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O total financiado",
        "mediacao": null,
        "conteudo": {
          "headline": "Com mensalidade de {valor}, um financiamento de 24 meses empresta 24 vezes esse valor — e ainda cobra juros sobre o total.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 500",
              "mensagem": "Mesmo mensalidade baixa vira número grande: 24 parcelas somam quase o equivalente a dois anos inteiros de custo.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 1500",
              "mensagem": "Faixa comum em curso superior privado. Vale comparar o total financiado com a renda média da profissão que você quer.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Dívida alta ao fim do curso. Antes de financiar, compare com vaga em universidade pública, bolsa e linhas de juros menores.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Multiplique a mensalidade que você escreveu por 24 e anote o total que seria financiado."
        }
      }
    ]
  },
  {
    "slug": "ef89-atrasou-e-agora",
    "titulo": "Atrasou: e agora",
    "subtitulo": "O que acontece, quando vira problema e como sair.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-e",
    "blocoRotulo": "Bloco E · Crédito e endividamento",
    "ordem": 18,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "divida",
      "inadimplencia",
      "negociacao"
    ],
    "thumbnail": "/trilha/credito.png",
    "preRequisitoSlug": "ef89-conta-de-emprestimo",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF35",
      "EF89LF37",
      "EF89LF38"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "O que acontece no atraso",
        "mediacao": null,
        "conteudo": {
          "headline": "A dívida vira problema quando começa a disputar espaço com o essencial.",
          "corpo": "Atrasar não é só levar uma multa. A partir do vencimento entram multa, juros de mora e correção; passados alguns dias, o nome vai para cadastros de inadimplentes, o que fecha portas de crédito e até de aluguel. A dívida vira problema quando as parcelas passam a competir com comida, moradia e transporte, ou quando é preciso fazer uma dívida nova para pagar a antiga."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Duas faturas atrasadas",
        "mediacao": null,
        "conteudo": {
          "headline": "Entre pagar o mínimo, aceitar o valor à vista ou parcelar, o que de fato reduz a dívida de Samuel?",
          "personagem": "Samuel",
          "narrativa": "Samuel atrasou duas faturas do cartão. O valor original era R$ 900 e, com multa, juros de mora e rotativo, chegou a R$ 1.480 em três meses. Ele passou a pagar só o mínimo, e mesmo assim a dívida cresceu. A empresa ligou oferecendo acordo: R$ 1.100 à vista ou 10 parcelas de R$ 140. A renda dele caiu quando perdeu um dos dois turnos de trabalho."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Qual saída funciona",
        "mediacao": null,
        "conteudo": {
          "headline": "Samuel tem R$ 1.480 no rotativo do cartão e recebeu uma proposta de acordo. Qual estratégia costuma reduzir mais o que ele vai pagar?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Continuar pagando o mínimo até a renda melhorar.",
              "correta": false,
              "feedback": "O mínimo mantém o restante no rotativo, que tem os juros mais altos do mercado. A dívida cresce enquanto ele paga."
            },
            {
              "letra": "B",
              "texto": "Negociar e trocar o rotativo por uma dívida com valor e prazo fixos.",
              "correta": true,
              "feedback": "Sair do rotativo interrompe o crescimento e dá um número final conhecido. Só vale aceitar parcela que caiba no orçamento."
            },
            {
              "letra": "C",
              "texto": "Usar o cheque especial para quitar a fatura do cartão.",
              "correta": false,
              "feedback": "O cheque especial está entre as linhas mais caras que existem. Seria trocar uma dívida cara por outra parecida."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Quanto você aguenta",
        "mediacao": null,
        "conteudo": {
          "headline": "Se você tivesse uma conta atrasada hoje, quanto conseguiria destinar por mês para quitá-la?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve: pense no que sobraria sem cortar comida nem transporte.",
              "tipo": "decimal",
              "placeholder": "R$ 120"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O número da negociação",
        "mediacao": null,
        "conteudo": {
          "headline": "Você informou {valor} por mês. Esse é o número que se leva para uma negociação, e não o que o credor propõe primeiro.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Sem valor disponível, procure órgãos de defesa do consumidor e mutirões de renegociação antes de assinar qualquer acordo.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 100",
              "mensagem": "Valor pequeno serve: acordo com parcela realista e paga até o fim vale mais que parcela grande abandonada no terceiro mês.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Com essa margem dá para pedir prazo mais curto e desconto maior, já que quanto menos tempo, menos juros incidem.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Antes de aceitar acordo, peça o valor total com juros por escrito e compare com sua folga."
        }
      }
    ]
  },
  {
    "slug": "ef89-endividado-ou-inadimplente",
    "titulo": "Endividado ou inadimplente",
    "subtitulo": "Duas situações diferentes — e o crédito verde.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-e",
    "blocoRotulo": "Bloco E · Crédito e endividamento",
    "ordem": 19,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "endividamento",
      "inadimplencia",
      "credito-verde"
    ],
    "thumbnail": "/trilha/credito.png",
    "preRequisitoSlug": "ef89-atrasou-e-agora",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF39",
      "EF89LF40"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Duas situações diferentes",
        "mediacao": null,
        "conteudo": {
          "headline": "Ter dívida e estar inadimplente não são a mesma situação.",
          "corpo": "Endividado é quem tem dívida e está pagando em dia: financiamento, parcela, carnê. Inadimplente é quem parou de pagar e passou do vencimento. A diferença não está no tamanho da dívida, está no pagamento. Existe ainda um tipo de crédito com condições melhores para quem faz algo de interesse coletivo: o crédito verde, voltado a projetos de menor impacto ambiental, como energia solar e saneamento."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Os dois compromissos",
        "mediacao": null,
        "conteudo": {
          "headline": "O que mudou entre as duas dívidas de Sandra: o valor, o tipo de crédito ou o pagamento?",
          "personagem": "Sandra",
          "narrativa": "Sandra tem dois compromissos. Um é o financiamento de painéis solares para a casa, com parcelas de R$ 210, todas pagas em dia, contratado em uma linha de crédito verde com juros menores que os do crédito pessoal comum. O outro é uma fatura de loja de R$ 340, vencida há 50 dias, que ela deixou de pagar. Só a segunda levou o nome dela para o cadastro de devedores."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Quem está inadimplente",
        "mediacao": null,
        "conteudo": {
          "headline": "Três pessoas têm dívidas. Qual delas está inadimplente, e não apenas endividada?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Quem financiou uma moto em 36 parcelas e paga todas na data.",
              "correta": false,
              "feedback": "Essa pessoa está endividada: tem dívida, mas em dia. A inadimplência começa depois de um vencimento não pago."
            },
            {
              "letra": "B",
              "texto": "Quem deixou de pagar a segunda parcela de um carnê e não negociou.",
              "correta": true,
              "feedback": "Passou do vencimento sem pagar e sem acordo. Isso é inadimplência, mesmo que o valor devido seja pequeno."
            },
            {
              "letra": "C",
              "texto": "Quem tem a maior dívida entre as três pessoas.",
              "correta": false,
              "feedback": "O tamanho não define a situação. Uma dívida grande paga em dia continua sendo apenas endividamento."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Crédito verde por perto",
        "mediacao": null,
        "conteudo": {
          "headline": "Que tipo de projeto do seu bairro entraria numa linha de crédito verde?",
          "campos": [
            {
              "id": "valor",
              "emoji": "🌱",
              "label": "Estimativa serve: vale qualquer ideia que reduza consumo de água, energia ou lixo.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Energia: painel solar, iluminação",
                  "valor": "1"
                },
                {
                  "label": "Água, lixo ou saneamento",
                  "valor": "2"
                },
                {
                  "label": "Não sei, ou não tem relação com meio ambiente",
                  "valor": "3"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Por que existe crédito verde",
        "mediacao": null,
        "conteudo": {
          "headline": "Você citou {valor}. O crédito verde existe porque projetos assim geram benefício além de quem toma o empréstimo.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 1",
              "mensagem": "Energia limpa reduz a conta de luz de quem instala e alivia a pressão sobre o sistema elétrico de todo mundo.",
              "cor": "green"
            },
            {
              "condicao": "valor == 2",
              "mensagem": "Saneamento e resíduos afetam a saúde coletiva; por isso essas linhas costumam ter juros e prazos melhores.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Vale olhar de novo: transporte, reforma que economiza energia e horta comunitária também entram nessas linhas.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Procure no site de um banco público quais linhas de crédito verde existem hoje."
        }
      }
    ]
  },
  {
    "slug": "ef89-o-que-determina-sua-renda",
    "titulo": "O que determina a sua renda",
    "subtitulo": "Estrutura, conjuntura, escolha pessoal e capital humano.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-f",
    "blocoRotulo": "Bloco F · Renda e empreendedorismo",
    "ordem": 20,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "renda",
      "trabalho",
      "capital-humano"
    ],
    "thumbnail": "/trilha/renda.png",
    "preRequisitoSlug": "ef89-endividado-ou-inadimplente",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF41",
      "EF89LF42"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Três forças ao mesmo tempo",
        "mediacao": null,
        "conteudo": {
          "headline": "Esforço explica parte da renda. Estrutura e conjuntura explicam outra parte.",
          "corpo": "A renda de uma pessoa não depende só do esforço dela. Determinantes estruturais são de longo prazo: onde você nasceu, a escola que teve, cor, gênero, acesso a transporte. Os conjunturais mudam com o momento: inflação, desemprego, uma crise, um setor em alta. Os pessoais são as escolhas possíveis dentro disso: estudar, trocar de área, aprender uma ferramenta nova. Os três agem juntos."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Quando a fábrica fecha",
        "mediacao": null,
        "conteudo": {
          "headline": "Quais partes dessa situação a família de Sérgio consegue mudar e quais dependem de algo maior?",
          "personagem": "Sérgio",
          "narrativa": "Sérgio tem 14 anos e mora em uma cidade onde a maior fábrica fechou no ano passado. O pai dele, torneiro mecânico há vinte anos, ficou sem vaga: não faltou qualificação, faltou emprego na região. A mãe faz faxina e viu a procura cair junto. Ao mesmo tempo, um curso técnico gratuito abriu no município, com aulas à noite. A renda da casa depende dessas três coisas."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Que tipo de determinante",
        "mediacao": null,
        "conteudo": {
          "headline": "Uma cidade perde sua maior fábrica e o desemprego sobe. Esse é um determinante de que tipo para a renda das famílias?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Pessoal, porque cada um escolhe onde vai trabalhar.",
              "correta": false,
              "feedback": "A escolha existe, mas ela não cria vagas. O fechamento atinge toda a região, independentemente do esforço de cada pessoa."
            },
            {
              "letra": "B",
              "texto": "Conjuntural, porque depende do momento econômico e pode mudar.",
              "correta": true,
              "feedback": "Conjuntura é o que muda com o ciclo: crise, setor em queda, desemprego alto. Afeta a renda sem depender da pessoa."
            },
            {
              "letra": "C",
              "texto": "Estrutural, porque é permanente e não muda mais.",
              "correta": false,
              "feedback": "Estrutural é o que vem de longo prazo, como acesso à escola e infraestrutura. Uma fábrica que fecha é um evento do momento."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua próxima habilidade",
        "mediacao": null,
        "conteudo": {
          "headline": "Que tipo de habilidade você quer ter até os 18 anos para aumentar sua renda?",
          "campos": [
            {
              "id": "valor",
              "emoji": "🎯",
              "label": "Estimativa serve: escreva a primeira que vier à cabeça, sem pesquisar antes.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Técnica e específica: solda, programação, um idioma",
                  "valor": "1"
                },
                {
                  "label": "Ampla: comunicação, organização, liderança",
                  "valor": "2"
                },
                {
                  "label": "Ainda não sei",
                  "valor": "3"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Isso é capital humano",
        "mediacao": null,
        "conteudo": {
          "headline": "Você escreveu {valor}. Isso é capital humano: o conjunto de conhecimento e experiência que uma pessoa leva para o trabalho.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 1",
              "mensagem": "Habilidade específica costuma ter demanda clara. Confira se ela existe no mercado da sua cidade e também fora dela.",
              "cor": "green"
            },
            {
              "condicao": "valor == 2",
              "mensagem": "Habilidade ampla vale em muitos setores, o que protege a renda quando um deles entra em crise.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Sem resposta, comece observando que trabalhos existem perto de você e o que cada um deles exige de quem entra.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Descubra um curso gratuito na sua cidade que ensine a habilidade que você escreveu."
        }
      }
    ]
  },
  {
    "slug": "ef89-formal-informal-precarizado",
    "titulo": "Formal, informal, precarizado",
    "subtitulo": "Direitos, deveres e o que a informalidade cobra depois.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-f",
    "blocoRotulo": "Bloco F · Renda e empreendedorismo",
    "ordem": 21,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "trabalho-formal",
      "informalidade",
      "precarizacao"
    ],
    "thumbnail": "/trilha/renda.png",
    "preRequisitoSlug": "ef89-o-que-determina-sua-renda",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF43",
      "EF89LF44"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Com registro e sem registro",
        "mediacao": null,
        "conteudo": {
          "headline": "O que a informalidade paga hoje, ela cobra na doença e na aposentadoria.",
          "corpo": "Trabalho formal tem carteira assinada: férias remuneradas, 13º, FGTS, INSS e seguro-desemprego, junto com o dever de recolher contribuição e imposto. O informal não tem esse registro. A renda pode até ser maior em um mês bom, mas não há férias pagas nem licença médica. Precarização é outra coisa: é quando o trabalho, registrado ou não, perde proteção, previsibilidade e descanso."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Dezoito dias parada",
        "mediacao": null,
        "conteudo": {
          "headline": "Quanto a mais Silvana precisaria guardar por mês para cobrir o que a formalidade cobriria?",
          "personagem": "Silvana",
          "narrativa": "Silvana faz entregas por aplicativo. Em um mês bom tira R$ 2.600, mais do que ganharia registrada na mesma função. Não desconta INSS, não tem férias nem 13º, e paga sozinha a manutenção da moto e o combustível. Quando torceu o tornozelo, ficou 18 dias sem trabalhar e sem receber nada. Como não contribui, esse tempo também não conta para a aposentadoria dela."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Comparação que engana",
        "mediacao": null,
        "conteudo": {
          "headline": "Silvana ganha mais como entregadora informal do que ganharia registrada. Por que comparar só os dois valores engana?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Porque trabalho informal é sempre pior que trabalho formal.",
              "correta": false,
              "feedback": "Nem sempre é pior; existe informal com renda alta e autonomia. O ponto é o que não vem junto, não uma regra fixa."
            },
            {
              "letra": "B",
              "texto": "Porque o salário formal vem com FGTS, 13º, férias e INSS, que valem dinheiro.",
              "correta": true,
              "feedback": "Esses direitos fazem parte da remuneração. Sem eles, a renda precisa cobrir também aquilo que deixa de ser recebido."
            },
            {
              "letra": "C",
              "texto": "Porque quem trabalha na informalidade não paga imposto nenhum.",
              "correta": false,
              "feedback": "Quem é informal paga imposto ao consumir e pode recolher INSS por conta própria. Não é isso que diferencia os dois."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua própria proteção",
        "mediacao": null,
        "conteudo": {
          "headline": "Se você trabalhasse por conta própria, que fatia da renda guardaria por mês para férias, doença e aposentadoria?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve: pense na parte da renda que daria para separar sem faltar o básico.",
              "tipo": "decimal",
              "placeholder": "20"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O que você teria que montar",
        "mediacao": null,
        "conteudo": {
          "headline": "Você separaria {valor} da renda. Quem tem carteira assinada recebe essa proteção embutida; quem não tem precisa montar a sua.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 10",
              "mensagem": "Fatia pequena. Cobre um imprevisto curto, mas não substitui 13º, férias e contribuição para a aposentadoria.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 25",
              "mensagem": "Faixa próxima do que os direitos formais representam somados. Só funciona se o dinheiro ficar separado do resto.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Reserva alta, protege bastante, mas comprime o mês. Vale checar se dá para manter isso durante o ano inteiro.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Pesquise quanto custa a contribuição do INSS para quem trabalha por conta própria."
        }
      }
    ]
  },
  {
    "slug": "ef89-atitude-empreendedora",
    "titulo": "Atitude empreendedora",
    "subtitulo": "Empreender dentro do emprego, e o que o MEI garante.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-f",
    "blocoRotulo": "Bloco F · Renda e empreendedorismo",
    "ordem": 22,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "empreendedorismo",
      "mei",
      "trabalho"
    ],
    "thumbnail": "/trilha/renda.png",
    "preRequisitoSlug": "ef89-formal-informal-precarizado",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF45",
      "EF89LF50"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Postura, não crachá",
        "mediacao": null,
        "conteudo": {
          "headline": "Atitude empreendedora aparece no emprego, no autônomo e na empresa.",
          "corpo": "Atitude empreendedora não é só abrir empresa. É perceber um problema, propor solução e assumir responsabilidade pelo resultado. Quem é assalariado pode ter essa atitude ao melhorar um processo no trabalho. Quem é autônomo tem ao buscar clientes e organizar a agenda. Quem tem empresa tem ao decidir onde investir. Muda o vínculo de trabalho, não a postura."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Padaria de dia, bolo no fim de semana",
        "mediacao": null,
        "conteudo": {
          "headline": "Em qual dos dois trabalhos Simone teve atitude empreendedora, e o que muda se ela virar MEI?",
          "personagem": "Simone",
          "narrativa": "Simone é atendente numa padaria e ganha R$ 1.800 por mês. Ela notou que sobravam pães no fim do dia e sugeriu uma sacola de véspera por R$ 6. A ideia rendeu R$ 900 a mais no mês para a padaria. No fim de semana, Simone também faz bolos por encomenda e recebe cerca de R$ 700. Ela pensa em se formalizar como MEI."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "O que o MEI garante",
        "mediacao": null,
        "conteudo": {
          "headline": "Ao se formalizar como MEI, o que Simone passa a ter garantido por lei?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Salário fixo pago pelo governo todo mês.",
              "correta": false,
              "feedback": "MEI não garante renda. O dinheiro continua vindo das vendas dela; o que a lei assegura são o CNPJ e os direitos previdenciários."
            },
            {
              "letra": "B",
              "texto": "CNPJ, emissão de nota fiscal e benefícios do INSS, como auxílio-doença e aposentadoria.",
              "correta": true,
              "feedback": "Correto. Pagando a guia mensal do MEI, ela passa a ter CNPJ, pode emitir nota fiscal e conta com cobertura previdenciária."
            },
            {
              "letra": "C",
              "texto": "Isenção total de qualquer contribuição ou imposto para sempre.",
              "correta": false,
              "feedback": "Não. O MEI paga uma guia mensal fixa, e é justamente essa contribuição que dá acesso aos benefícios."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Renda por conta própria",
        "mediacao": null,
        "conteudo": {
          "headline": "Pensando em você, em alguém da sua casa ou do seu bairro: quanto essa pessoa recebe por mês trabalhando por conta própria, fora salário fixo?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve. O objetivo é enxergar quanta renda já vem de atividade por conta própria.",
              "tipo": "decimal",
              "placeholder": "R$ 700"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Formalizar ou ainda não",
        "mediacao": null,
        "conteudo": {
          "headline": "Você estimou {valor} por mês vindos de trabalho por conta própria. Esse valor é o que sustenta a decisão de formalizar: o MEI cobra uma guia mensal fixa e devolve CNPJ, nota fiscal e direitos previdenciários.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Nenhuma renda por conta própria ainda. Vale observar onde existe um problema que se repete perto de você: é daí que costuma sair a primeira oportunidade.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 800",
              "mensagem": "Renda pequena e provavelmente irregular. Antes de formalizar, registre por três meses quanto entra de fato — a guia do MEI é cobrada mesmo em mês fraco.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Com esse movimento, a formalização começa a fazer sentido: nota fiscal abre portas para clientes maiores e a contribuição garante cobertura do INSS.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Anote por uma semana toda entrada vinda de trabalho por conta própria, com data e valor."
        }
      }
    ]
  },
  {
    "slug": "ef89-a-conta-do-negocio",
    "titulo": "A conta do negócio",
    "subtitulo": "Custo de matéria-prima, folha, imposto — e o orçamento inteiro.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-f",
    "blocoRotulo": "Bloco F · Renda e empreendedorismo",
    "ordem": 23,
    "nivel": "avancado",
    "duracaoMin": 4,
    "pontos": 50,
    "tags": [
      "custos",
      "orcamento",
      "negocio"
    ],
    "thumbnail": "/trilha/renda.png",
    "preRequisitoSlug": "ef89-atitude-empreendedora",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF46",
      "EF89LF47"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Tudo que sai antes de sobrar",
        "mediacao": null,
        "conteudo": {
          "headline": "Faturamento é o que entra. Lucro é o que sobra depois de todos os custos.",
          "corpo": "Todo negócio tem custos, e eles não são só a matéria-prima. Entram também folha de pagamento, energia, aluguel, embalagem, transporte e impostos. Orçamento é o mapa que junta tudo isso: quanto entra, quanto sai e o que sobra. Sem esse mapa, o dono confunde faturamento com lucro e acha que está ganhando quando está perdendo."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "R$ 9.000 na confecção",
        "mediacao": null,
        "conteudo": {
          "headline": "Quanto sobrou de verdade no mês da Sônia, e a máquina de R$ 2.500 cabia nesse valor?",
          "personagem": "Sônia",
          "narrativa": "Sônia tem uma pequena confecção e vendeu R$ 9.000 em camisetas no mês. Os custos foram: R$ 3.200 de tecido e aviamentos, R$ 2.400 de folha de pagamento das duas costureiras, R$ 600 de aluguel do galpão, R$ 300 de energia e R$ 540 de impostos. Ela comemorou os R$ 9.000 e comprou uma máquina de R$ 2.500 à vista."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Fazendo a conta",
        "mediacao": null,
        "conteudo": {
          "headline": "Somando todos os custos do mês da Sônia e subtraindo do que ela vendeu, quanto sobrou?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "R$ 9.000, porque foi o que entrou no caixa.",
              "correta": false,
              "feedback": "Esse é o faturamento, não o lucro. Ele ainda não desconta tecido, folha, aluguel, energia e imposto."
            },
            {
              "letra": "B",
              "texto": "R$ 1.960, porque os custos somam R$ 7.040.",
              "correta": true,
              "feedback": "Correto: 3.200 + 2.400 + 600 + 300 + 540 = 7.040, e 9.000 − 7.040 = 1.960. A máquina de R$ 2.500 não cabia no mês."
            },
            {
              "letra": "C",
              "texto": "R$ 3.400, porque só matéria-prima e folha contam como custo.",
              "correta": false,
              "feedback": "Aluguel, energia e impostos também são custos do negócio. Deixá-los de fora infla o resultado em R$ 1.440."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Seu custo fixo mensal",
        "mediacao": null,
        "conteudo": {
          "headline": "Imagine um negócio pequeno que você poderia tocar. Quanto ele teria de custo fixo por mês, somando aluguel, energia, internet, transporte e salários?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve. Some só o que sai todo mês, independentemente de quanto você vender.",
              "tipo": "decimal",
              "placeholder": "R$ 1.200"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O piso do seu orçamento",
        "mediacao": null,
        "conteudo": {
          "headline": "Você estimou {valor} de custo fixo por mês. Esse é o valor que o negócio precisa cobrir antes de dar qualquer lucro, e ele continua existindo no mês em que as vendas caem.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 500",
              "mensagem": "Custo fixo baixo: o negócio aguenta um mês fraco sem quebrar. Agora some matéria-prima e impostos para ter o orçamento completo.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 3000",
              "mensagem": "Estrutura média. Divida esse valor pelo lucro de cada item vendido para saber quantas unidades você precisa vender só para empatar.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Custo fixo alto exige volume constante de vendas. Veja o que dá para reduzir ou transformar em custo variável antes de começar.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Liste numa folha todos os custos fixos e variáveis do negócio que você imaginou."
        }
      }
    ]
  },
  {
    "slug": "ef89-vender-e-crescer",
    "titulo": "Vender e crescer",
    "subtitulo": "Marketing e crédito como ferramentas de um negócio.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-f",
    "blocoRotulo": "Bloco F · Renda e empreendedorismo",
    "ordem": 24,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "marketing",
      "publicidade",
      "credito"
    ],
    "thumbnail": "/trilha/renda.png",
    "preRequisitoSlug": "ef89-a-conta-do-negocio",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF48",
      "EF89LF49"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Ser encontrado e ter fôlego",
        "mediacao": null,
        "conteudo": {
          "headline": "Marketing traz o cliente. Crédito acelera — e cobra juros por isso.",
          "corpo": "Ter um bom produto não basta: se ninguém souber que ele existe, ninguém compra. Marketing é o trabalho de fazer o negócio ser encontrado, entendido e lembrado, da foto do produto ao preço e ao atendimento. Crédito é dinheiro emprestado com um custo, os juros. Usado para comprar máquina ou estoque que aumentam a venda, ele acelera; usado para tapar buraco, ele afunda."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Anúncio, freezer e parcela",
        "mediacao": null,
        "conteudo": {
          "headline": "Os R$ 200 em anúncio valeram a pena, e o empréstimo do freezer se paga sozinho?",
          "personagem": "Tainá",
          "narrativa": "Tainá vende açaí numa banca e fatura R$ 4.000 por mês. Ela gastou R$ 200 em fotos e anúncios no celular e passou a vender R$ 5.400. Animada, pensou em pegar R$ 8.000 emprestados a juros para comprar um freezer maior e atender encomendas. A parcela ficaria em R$ 780 por mês durante doze meses, e o freezer aumentaria a venda em cerca de R$ 1.500 mensais."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "O crédito se paga?",
        "mediacao": null,
        "conteudo": {
          "headline": "A parcela do freezer é R$ 780 e o aumento esperado de venda é R$ 1.500 por mês. O crédito faz sentido para Tainá?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Não, porque todo empréstimo é prejuízo.",
              "correta": false,
              "feedback": "Crédito não é bom nem ruim por si. Ele só fica caro quando não gera retorno maior que a parcela."
            },
            {
              "letra": "B",
              "texto": "Sim, se o aumento de venda cobrir a parcela e ainda sobrar depois do custo do açaí extra.",
              "correta": true,
              "feedback": "R$ 1.500 de venda a mais contra R$ 780 de parcela deixa R$ 720. O crédito se sustenta se a matéria-prima extra couber nesse resto."
            },
            {
              "letra": "C",
              "texto": "Sim, porque com o dinheiro na mão ela pode pagar contas atrasadas.",
              "correta": false,
              "feedback": "Usar crédito de investimento para cobrir buraco antigo mantém a dívida velha e ainda soma juros novos."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Quanto para ser encontrado",
        "mediacao": null,
        "conteudo": {
          "headline": "Se você tivesse um negócio, quanto gastaria por mês para ser encontrado por clientes: anúncio, impressão, embalagem com sua marca?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve. Pense no que cabe no mês sem depender de empréstimo.",
              "tipo": "decimal",
              "placeholder": "R$ 150"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Divulgação que se mede",
        "mediacao": null,
        "conteudo": {
          "headline": "Você reservaria {valor} por mês para divulgação. O teste é sempre o mesmo: comparar o que entrou a mais depois do anúncio com o que foi gasto nele.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Divulgação também acontece sem custo: boca a boca, grupo de mensagens, foto boa do produto. Sem nenhuma delas, só compra quem passa na frente.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 300",
              "mensagem": "Valor de teste. Anuncie por um mês, anote as vendas antes e depois e só aumente se a diferença cobrir o gasto.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Investimento alto para começar. Divida em campanhas menores e meça cada uma antes de concentrar tudo em um canal só.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Escolha um produto e escreva o anúncio dele em três linhas: o que é, para quem, quanto custa."
        }
      }
    ]
  },
  {
    "slug": "ef89-dinheiro-na-mao-risco-na-rua",
    "titulo": "Dinheiro na mão, risco na tela",
    "subtitulo": "O que expõe você no físico e no digital.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-g",
    "blocoRotulo": "Bloco G · Risco e proteção",
    "ordem": 25,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "riscos",
      "dinheiro-em-especie",
      "pagamento-digital"
    ],
    "thumbnail": "/trilha/risco.png",
    "preRequisitoSlug": "ef89-vender-e-crescer",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF51",
      "EF89LF52"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Dois jeitos de perder",
        "mediacao": null,
        "conteudo": {
          "headline": "Papel se perde sem rastro. Digital deixa rastro, mas aceita ordem de qualquer um.",
          "corpo": "Dinheiro em espécie tem riscos próprios: pode ser perdido, roubado, queimado ou simplesmente gasto sem registro, e ninguém devolve. O digital resolve parte disso e cria outros riscos: site falso, cartão clonado, senha repetida, wi-fi público, link de pagamento adulterado. Nenhuma das duas formas é segura sozinha. O que protege é a maneira como você guarda, transporta e confere cada transação."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Do livro em casa ao site do anúncio",
        "mediacao": null,
        "conteudo": {
          "headline": "Qual risco Talita correu em cada situação, e qual dos dois prejuízos tinha como ser contestado?",
          "personagem": "Talita",
          "narrativa": "Talita recebeu R$ 1.200 em dinheiro vivo por um trabalho e guardou tudo dentro de um livro em casa. Duas semanas depois, faltavam R$ 300 e ninguém soube explicar. No mês seguinte, ela passou a receber por Pix. Comprou um fone num site que apareceu num anúncio, pagou R$ 250 antecipado e o produto nunca chegou. O site saiu do ar em três dias."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Espécie contra digital",
        "mediacao": null,
        "conteudo": {
          "headline": "Comparando as duas perdas de Talita, o que diferencia o risco do dinheiro em espécie do risco da compra online?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "O dinheiro em espécie é sempre mais seguro, porque não depende de internet.",
              "correta": false,
              "feedback": "Espécie não deixa registro. Os R$ 300 que sumiram não têm comprovante, destinatário nem como contestar."
            },
            {
              "letra": "B",
              "texto": "A perda em espécie não deixa rastro; a compra online deixa comprovante, o que permite contestar e denunciar.",
              "correta": true,
              "feedback": "É a diferença central. Pix e cartão registram data, valor e destinatário, então existe o que apresentar ao banco e à polícia."
            },
            {
              "letra": "C",
              "texto": "Comprar online não tem risco, porque o banco devolve tudo automaticamente.",
              "correta": false,
              "feedback": "Devolução não é automática. Em compra de site falso o dinheiro pode não voltar; conferir o site antes de pagar é o que evita."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Dinheiro sem registro",
        "mediacao": null,
        "conteudo": {
          "headline": "Quanto dinheiro em espécie você ou alguém da sua casa costuma carregar ou guardar sem nenhum registro?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve. Considere só o que não tem comprovante nem anotação em lugar nenhum.",
              "tipo": "decimal",
              "placeholder": "R$ 80"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O que some sem prova",
        "mediacao": null,
        "conteudo": {
          "headline": "Você estimou {valor} circulando sem nenhum registro. Esse é exatamente o valor que, se sumir, não tem como provar que existia.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 50",
              "mensagem": "Pouco em espécie. O cuidado principal passa a ser digital: senha diferente por aplicativo e conferência do destinatário antes de confirmar cada pagamento.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 500",
              "mensagem": "Vale separar o que fica em casa do que anda com você e anotar as entradas, mesmo que seja num caderno.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Guardar essa quantia em espécie concentra risco de perda e furto sem nenhuma cobertura. Depositar parte reduz o prejuízo possível.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Confira hoje se você repete a mesma senha no banco, no e-mail e em loja online."
        }
      }
    ]
  },
  {
    "slug": "ef89-golpe-nao-e-azar",
    "titulo": "Golpe não é azar",
    "subtitulo": "Comportamento seguro, golpes reais e seus dados pessoais.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-g",
    "blocoRotulo": "Bloco G · Risco e proteção",
    "ordem": 26,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "golpes",
      "fraude",
      "seguranca"
    ],
    "thumbnail": "/trilha/risco.png",
    "preRequisitoSlug": "ef89-dinheiro-na-mao-risco-na-rua",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF53",
      "EF89LF54",
      "EF89LF55"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Pressa é a ferramenta do golpe",
        "mediacao": null,
        "conteudo": {
          "headline": "Todo golpe pede pressa. Quem confere por outro canal quebra o golpe.",
          "corpo": "Golpe não depende de sorte: depende de pressa, medo e informação que a pessoa entrega sem perceber. Nome completo, CPF, foto de documento, código recebido por mensagem e até a rotina que você publica são dados que valem dinheiro para o golpista. Comportamento seguro é conferir por outro canal, desconfiar de urgência e nunca repassar código de verificação."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A mensagem da tia",
        "mediacao": null,
        "conteudo": {
          "headline": "Quais sinais mostram que é golpe, e o que acontece se Thiago mandar o código?",
          "personagem": "Thiago",
          "narrativa": "Thiago recebeu mensagem de um número desconhecido usando a foto da tia dele. A pessoa dizia ter trocado de celular e pedia um Pix urgente de R$ 480 para pagar um boleto que venceria naquela hora. Em seguida, chegou um código de seis dígitos no celular do Thiago e a mesma pessoa pediu que ele repassasse o código para confirmar a conta."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "O sinal decisivo",
        "mediacao": null,
        "conteudo": {
          "headline": "Qual é o sinal mais forte de que a mensagem recebida por Thiago é um golpe?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "A pessoa usar a foto da tia dele no perfil.",
              "correta": false,
              "feedback": "Foto de perfil é pública e fácil de copiar. É indício, mas sozinha não prova nada: muita conta legítima usa foto real."
            },
            {
              "letra": "B",
              "texto": "Pedir que ele repasse o código de verificação que chegou no celular dele.",
              "correta": true,
              "feedback": "Nenhum banco, aplicativo ou parente precisa desse código. Ele serve para instalar a conta do Thiago em outro aparelho: é o roubo em si."
            },
            {
              "letra": "C",
              "texto": "O valor pedido ser de R$ 480.",
              "correta": false,
              "feedback": "O valor não define golpe. Golpistas costumam pedir quantias comuns justamente para não chamar atenção."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Tentativas no último mês",
        "mediacao": null,
        "conteudo": {
          "headline": "Quantas tentativas de golpe por mensagem, ligação ou link você e sua família receberam no último mês?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve. Conte também as que você percebeu na hora e ignorou.",
              "tipo": "decimal",
              "placeholder": "3"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Golpe é rotina, não azar",
        "mediacao": null,
        "conteudo": {
          "headline": "Você contou {valor} tentativas no último mês. O número mostra que golpe é rotina, não azar, e que a defesa precisa ser hábito, não reação de última hora.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Nenhuma percebida não quer dizer nenhuma recebida. Muitas chegam disfarçadas de cobrança ou promoção; releia mensagens com link antes de clicar.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 5",
              "mensagem": "Frequência comum hoje. Combine com sua família uma pergunta de checagem que só vocês saibam responder, para pedidos urgentes de dinheiro.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Volume alto. Além de conferir por outro canal, ative a verificação em duas etapas no aplicativo de mensagem e no do banco.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Combine hoje com sua família uma senha verbal para confirmar qualquer pedido de dinheiro por mensagem."
        }
      }
    ]
  },
  {
    "slug": "ef89-tipos-de-seguro",
    "titulo": "Tipos de seguro",
    "subtitulo": "O que cada seguro cobre e quando faz sentido ter.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-g",
    "blocoRotulo": "Bloco G · Risco e proteção",
    "ordem": 27,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "seguro",
      "protecao",
      "patrimonio"
    ],
    "thumbnail": "/trilha/risco.png",
    "preRequisitoSlug": "ef89-golpe-nao-e-azar",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF56"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Muitos pagam, poucos usam",
        "mediacao": null,
        "conteudo": {
          "headline": "Seguro troca um gasto pequeno e certo por um prejuízo grande e incerto.",
          "corpo": "Seguro é um acordo em que muita gente paga um valor pequeno e regular, o prêmio, para que quem sofrer um prejuízo grande seja indenizado. Existem tipos diferentes: de vida, de residência, de automóvel, de celular, de acidentes pessoais e o seguro-desemprego, que é público. Cada um cobre eventos específicos, escritos na apólice, e não cobre o que está fora dela."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Moto, corpo e celular",
        "mediacao": null,
        "conteudo": {
          "headline": "Qual dos três seguros do Valdir é o mais necessário, e qual pode ficar de fora?",
          "personagem": "Valdir",
          "narrativa": "Valdir é motoboy e vive da moto. Ele paga R$ 140 por mês no seguro do veículo e R$ 35 no seguro de acidentes pessoais. Também pensou em segurar o celular, que custou R$ 1.400, por R$ 45 mensais. Num ano, o seguro do celular sairia por R$ 540. A moto vale R$ 14.000 e é a fonte de renda dele; o celular ele consegue repor com reserva."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "O que dá para repor sozinho",
        "mediacao": null,
        "conteudo": {
          "headline": "Pelo critério de proteger o que ele não conseguiria repor sozinho, qual seguro faz menos sentido para Valdir?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "O da moto, porque moto é fácil de consertar.",
              "correta": false,
              "feedback": "A moto vale R$ 14.000 e é a renda dele. Perdê-la sem seguro pararia o trabalho e o sustento ao mesmo tempo."
            },
            {
              "letra": "B",
              "texto": "O do celular: R$ 540 por ano para um aparelho de R$ 1.400 que ele consegue repor.",
              "correta": true,
              "feedback": "Doze parcelas de R$ 45 somam R$ 540, quase 40% do valor do aparelho, e a perda cabe na reserva dele."
            },
            {
              "letra": "C",
              "texto": "O de acidentes pessoais, porque ele é jovem e saudável.",
              "correta": false,
              "feedback": "Idade não evita acidente, e ele trabalha na rua o dia inteiro. Esse seguro cobre justamente a perda da capacidade de trabalhar."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "O prejuízo que mais doeria",
        "mediacao": null,
        "conteudo": {
          "headline": "Qual bem ou situação da sua casa causaria o maior prejuízo se acontecesse algo hoje, e quanto custaria repor?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve. Pense no que faria falta imediata e não teria como ser reposto na hora.",
              "tipo": "decimal",
              "placeholder": "R$ 2.000"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Vale seguro ou vale reserva",
        "mediacao": null,
        "conteudo": {
          "headline": "Você estimou {valor} para repor o que mais faria falta. Esse número é o ponto de partida para decidir se vale ter seguro e de qual tipo.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 1000",
              "mensagem": "Prejuízo que cabe numa reserva. Guardar aos poucos costuma sair mais barato que pagar prêmio mensal por um bem desse valor.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 10000",
              "mensagem": "Faixa em que vale comparar: some doze meses de prêmio e veja quanto isso representa do valor de reposição antes de decidir.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Prejuízo difícil de absorver sozinho. É o tipo de risco para o qual o seguro existe; leia na apólice o que está coberto e o que não está.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Pergunte em casa quais seguros já existem e o que cada apólice cobre de fato."
        }
      }
    ]
  },
  {
    "slug": "ef89-renda-desigual",
    "titulo": "Renda desigual, escolhas desiguais",
    "subtitulo": "Como a diferença de renda muda o que cada um pode.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-h",
    "blocoRotulo": "Bloco H · Cenário financeiro e cidadania",
    "ordem": 28,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "renda",
      "desigualdade",
      "consumo"
    ],
    "thumbnail": "/trilha/cidadania.png",
    "preRequisitoSlug": "ef89-tipos-de-seguro",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF57",
      "EF89LF58"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Renda muda o campo de escolha",
        "mediacao": null,
        "conteudo": {
          "headline": "Renda diferente não muda só o valor da compra: muda a lista de opções possíveis.",
          "corpo": "Duas pessoas na mesma loja não têm as mesmas opções. Quem ganha pouco decide entre necessidades; quem ganha muito decide entre preferências. A renda não muda só o quanto se compra, muda o que sequer entra na lista. Isso não é falta de esforço: salário, emprego instável e preço dos itens básicos pesam mais do que escolha individual."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Dois salários, o mesmo tênis",
        "mediacao": null,
        "conteudo": {
          "headline": "Vanessa escolheu errado, ou a renda dela decidiu antes dela?",
          "personagem": "Vanessa",
          "narrativa": "Vanessa e uma colega ganham, cada uma, R$ 1.600 e R$ 4.200 por mês. As duas precisam de um par de tênis para trabalhar. O modelo bom custa R$ 320 e dura dois anos; o mais barato custa R$ 120 e dura seis meses. Vanessa leva o de R$ 120, porque os R$ 320 sairiam do dinheiro do mês. Em dois anos, ela terá gasto R$ 480."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Quem pode mudar isso",
        "mediacao": null,
        "conteudo": {
          "headline": "Vanessa gastou R$ 480 em dois anos por não poder pagar R$ 320 de uma vez. Qual agente econômico pode reduzir esse tipo de diferença?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Só a própria Vanessa, com mais disciplina para poupar",
              "correta": false,
              "feedback": "Com R$ 1.600 por mês, sobrar R$ 320 de uma vez não é questão de disciplina. Culpar a pessoa esconde a causa."
            },
            {
              "letra": "B",
              "texto": "O governo e as empresas, com crédito barato, salário mínimo e preço justo",
              "correta": true,
              "feedback": "Governo define regras, salário mínimo e tributos; produtores e vendedores definem preço e parcelamento. Comprador sozinho não muda esse jogo."
            },
            {
              "letra": "C",
              "texto": "Ninguém: preço e renda são naturais e não se alteram",
              "correta": false,
              "feedback": "Preço e renda resultam de decisões de produtores, vendedores, trabalhadores e governo. Podem mudar."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "O preço do que estraga rápido",
        "mediacao": null,
        "conteudo": {
          "headline": "Pense em um item que você usa sempre. Quanto custa a versão barata, que estraga rápido?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Estimativa serve. O objetivo é comparar duração, não acertar o preço exato.",
              "tipo": "decimal",
              "placeholder": "R$ 120"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "A conta em dois anos",
        "mediacao": null,
        "conteudo": {
          "headline": "Você estimou {valor} na versão que dura pouco. Conte quantas vezes precisaria recomprar em dois anos e compare com o preço da versão durável.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 50",
              "mensagem": "Item barato, mas a recompra frequente soma. Verifique quantas vezes por ano você repõe esse item.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 300",
              "mensagem": "Nessa faixa a versão durável costuma custar duas a três vezes mais e durar quatro vezes mais. Quem tem o dinheiro na hora paga menos no fim.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Acima disso quase ninguém compra à vista: entra parcelamento ou juros, o valor extra do crédito, e a diferença de renda pesa ainda mais.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Anote por três meses quantas vezes você repõe esse item e quanto somou."
        }
      }
    ]
  },
  {
    "slug": "ef89-justo-injusto-legal-ilegal",
    "titulo": "Justo, injusto, legal, ilegal",
    "subtitulo": "Nem tudo que é legal é justo — e o que fazer no conflito.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-h",
    "blocoRotulo": "Bloco H · Cenário financeiro e cidadania",
    "ordem": 29,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "consumidor",
      "direitos",
      "justo"
    ],
    "thumbnail": "/trilha/cidadania.png",
    "preRequisitoSlug": "ef89-renda-desigual",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF59",
      "EF89LF61"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Quatro caixas, não duas",
        "mediacao": null,
        "conteudo": {
          "headline": "Legal e justo são perguntas diferentes. Faça as duas antes de aceitar.",
          "corpo": "Legal é o que a lei permite. Justo é o que trata as duas partes com equilíbrio. Nem sempre andam juntas. Cobrar juros muito altos, ou seja, o valor extra pago por um empréstimo, pode ser legal e mesmo assim injusto. Vender produto vencido é ilegal e injusto. Faça as duas perguntas separadas: isso é permitido? isso é equilibrado?"
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Oito dias e um cupom",
        "mediacao": null,
        "conteudo": {
          "headline": "A regra dos sete dias da loja vale mais do que a lei?",
          "personagem": "Vera",
          "narrativa": "Vera comprou um fone por R$ 189 numa loja online. Chegou com defeito em oito dias. A loja respondeu que só troca em até sete dias e ofereceu um cupom de R$ 50 para nova compra. O Código de Defesa do Consumidor dá 30 dias para reclamar de defeito em produto não durável e 90 dias em produto durável, e o fornecedor tem 30 dias para consertar."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "O que a lei garante",
        "mediacao": null,
        "conteudo": {
          "headline": "A loja de Vera oferece cupom de R$ 50 em vez de resolver o defeito. O que a lei garante a ela?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Nada: ela aceitou os termos da loja ao comprar",
              "correta": false,
              "feedback": "Regra de loja não reduz direito previsto em lei. Cláusula que faz isso é nula."
            },
            {
              "letra": "B",
              "texto": "Conserto em até 30 dias e, se não resolver, troca, dinheiro de volta ou abatimento",
              "correta": true,
              "feedback": "É o que o Código de Defesa do Consumidor prevê para produto com defeito. Passado o prazo, quem escolhe entre as três saídas é Vera."
            },
            {
              "letra": "C",
              "texto": "Só o cupom, porque a loja fez uma oferta melhor que nada",
              "correta": false,
              "feedback": "O cupom prende Vera à mesma loja e não devolve o valor. Uma oferta ser legal não a torna justa nem obrigatória."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Quando algo deu errado",
        "mediacao": null,
        "conteudo": {
          "headline": "Na última vez que você ou sua família se sentiram prejudicados numa compra, o que foi feito?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Vale o caso de que você lembra melhor, mesmo que tenha sido há tempo.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Nada foi feito",
                  "valor": "1"
                },
                {
                  "label": "Reclamamos direto com a loja",
                  "valor": "2"
                },
                {
                  "label": "Reclamamos publicamente nas redes",
                  "valor": "3"
                },
                {
                  "label": "Procon ou consumidor.gov.br",
                  "valor": "4"
                },
                {
                  "label": "Nunca aconteceu",
                  "valor": "5"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Caminhos de reclamação",
        "mediacao": null,
        "conteudo": {
          "headline": "Você marcou {valor}. Cada caminho tem alcance diferente: a loja resolve rápido quando quer, o registro formal cria prova e obriga resposta.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor em 1,5",
              "mensagem": "Direito que não é acionado vira prejuízo silencioso. Guardar nota fiscal e print da conversa é o primeiro passo.",
              "cor": "green"
            },
            {
              "condicao": "valor em 2,3",
              "mensagem": "Funciona em muitos casos, mas depende da boa vontade da empresa. Sem solução em 30 dias, o registro formal é o próximo nível.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Esse caminho gera resposta obrigatória da empresa e entra em estatística pública de reclamação, que pressiona o setor inteiro.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Guarde nota e conversas da próxima compra online; sem prova, reclamar fica bem mais difícil."
        }
      }
    ]
  },
  {
    "slug": "ef89-imposto-vira-o-que",
    "titulo": "Imposto vira o quê",
    "subtitulo": "Onde o tributo reaparece, e como o cidadão fiscaliza.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-h",
    "blocoRotulo": "Bloco H · Cenário financeiro e cidadania",
    "ordem": 30,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "impostos",
      "servicos publicos",
      "orcamento"
    ],
    "thumbnail": "/trilha/cidadania.png",
    "preRequisitoSlug": "ef89-justo-injusto-legal-ilegal",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF60",
      "EF89LF63"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "O caminho do imposto",
        "mediacao": null,
        "conteudo": {
          "headline": "Imposto não some: vira serviço, obra ou desvio. Dá para conferir qual dos três.",
          "corpo": "Parte do preço de quase tudo que você compra é imposto. Esse dinheiro vai para governo municipal, estadual ou federal e volta como escola, posto de saúde, ônibus subsidiado, iluminação e coleta de lixo. Nem sempre volta bem: o orçamento é decidido por pessoas, e decisão pode ser errada ou desviada. Por isso existe portal da transparência, tribunal de contas e audiência pública."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "R$ 400 embutidos",
        "mediacao": null,
        "conteudo": {
          "headline": "O que Vitória pode fazer com essa informação, além de reclamar?",
          "personagem": "Vitória",
          "narrativa": "Vitória comprou um celular de R$ 1.500. Cerca de R$ 400 desse preço são tributos embutidos. Na mesma semana, ela viu que a escola do bairro está sem professor de matemática há dois meses. No portal da transparência da prefeitura, ela achou o valor previsto para educação no ano e quanto já foi executado até junho: menos da metade."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Cobrar de quem decide",
        "mediacao": null,
        "conteudo": {
          "headline": "Vitória descobriu que a prefeitura executou menos da metade do orçamento de educação até junho. Qual atitude realmente cobra resposta?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Postar a indignação e esperar viralizar",
              "correta": false,
              "feedback": "Alcance ajuda a pressionar, mas ninguém é obrigado a responder um post. Sem canal formal, o dado se perde."
            },
            {
              "letra": "B",
              "texto": "Levar o dado à audiência pública do orçamento ou à ouvidoria da prefeitura",
              "correta": true,
              "feedback": "Audiência pública e ouvidoria geram registro e exigem resposta do órgão. É a porta pela qual o cidadão entra na decisão."
            },
            {
              "letra": "C",
              "texto": "Parar de comprar produtos caros para pagar menos imposto",
              "correta": false,
              "feedback": "Consumir menos não devolve o serviço nem melhora a gestão. E quase todo consumo básico já tem tributo embutido."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Quanto você paga sem ver",
        "mediacao": null,
        "conteudo": {
          "headline": "Estime quanto sua família paga de imposto por mês só no que compra em mercado, transporte e conta de luz.",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Chute com base no gasto total: boa parte do preço de itens básicos é tributo.",
              "tipo": "decimal",
              "placeholder": "R$ 180"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O que volta para você",
        "mediacao": null,
        "conteudo": {
          "headline": "Você estimou {valor} por mês em tributo embutido. É o que sua família financia de serviço público todo mês, mesmo sem declarar imposto de renda.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 100",
              "mensagem": "Provavelmente está subestimado. Tributo aparece em quase todo item, inclusive energia e combustível, que puxam o preço do resto.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 500",
              "mensagem": "Faixa comum para muitas famílias. Em um ano passa de R$ 1.200, o bastante para justificar cobrar onde esse dinheiro reaparece.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Valor alto. Quem paga tanto tem razão de acompanhar a execução do orçamento e de falar em audiência pública.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Abra o portal da transparência da sua cidade e veja quanto foi para saúde este ano."
        }
      }
    ]
  },
  {
    "slug": "ef89-quem-e-quem-no-sfn",
    "titulo": "Quem é quem no sistema financeiro",
    "subtitulo": "Banco Central, banco, cooperativa, financeira — e quem é confiável.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-h",
    "blocoRotulo": "Bloco H · Cenário financeiro e cidadania",
    "ordem": 31,
    "nivel": "avancado",
    "duracaoMin": 4,
    "pontos": 50,
    "tags": [
      "sistema financeiro",
      "banco central",
      "cooperativa"
    ],
    "thumbnail": "/trilha/cidadania.png",
    "preRequisitoSlug": "ef89-imposto-vira-o-que",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF62",
      "EF89LF65"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "O mapa do sistema financeiro",
        "mediacao": null,
        "conteudo": {
          "headline": "Banco Central fiscaliza; banco, cooperativa e financeira é que atendem você.",
          "corpo": "O Sistema Financeiro Nacional tem andares. No topo, o Banco Central autoriza, fiscaliza e cuida do valor da moeda; ele não é banco de pessoa física. Abaixo ficam bancos, cooperativas de crédito, onde o cliente é dono e vota, financeiras e instituições de pagamento, que oferecem conta, crédito e cartão. Saber quem é quem muda o que você pode exigir de cada um."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Três ofertas para Wagner",
        "mediacao": null,
        "conteudo": {
          "headline": "Qual dessas três está autorizada a emprestar, e como Wagner confere isso?",
          "personagem": "Wagner",
          "narrativa": "Wagner quer R$ 2.000 para consertar a moto que usa no trabalho. Três ofertas de juros, o valor extra cobrado sobre o empréstimo: o banco onde recebe salário pede 4,5% ao mês; a cooperativa de crédito do bairro pede 3,2% ao mês e exige que ele se associe; um perfil de aplicativo de mensagens promete 1% ao mês, sem consulta, mas cobra R$ 200 adiantado de garantia."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Antes da taxa, a checagem",
        "mediacao": null,
        "conteudo": {
          "headline": "Antes de aceitar qualquer uma das três ofertas, qual é a checagem que Wagner precisa fazer?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Escolher a menor taxa, porque 1% ao mês é o melhor negócio",
              "correta": false,
              "feedback": "Taxa muito abaixo do mercado somada a pagamento adiantado é padrão de golpe. Instituição autorizada não cobra para liberar empréstimo."
            },
            {
              "letra": "B",
              "texto": "Consultar se a instituição é autorizada pelo Banco Central antes de olhar a taxa",
              "correta": true,
              "feedback": "O Banco Central mantém lista pública das instituições autorizadas. Fora dela, não há a quem reclamar depois."
            },
            {
              "letra": "C",
              "texto": "Confiar no banco onde recebe salário, já que banco grande cobra sempre menos",
              "correta": false,
              "feedback": "Tamanho não define preço: aqui a cooperativa cobra 3,2% contra 4,5% do banco. E a cooperativa também é fiscalizada pelo Banco Central."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Quantas instituições",
        "mediacao": null,
        "conteudo": {
          "headline": "Quantas instituições financeiras diferentes sua família usa hoje, contando banco, cooperativa, financeira e carteira digital?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Conte também aplicativo de pagamento que guarda saldo parado.",
              "tipo": "decimal",
              "placeholder": "3"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Sua lista para conferir",
        "mediacao": null,
        "conteudo": {
          "headline": "Você contou {valor} instituições. Para cada uma dá para checar, em um minuto, se ela aparece na lista de autorizadas do Banco Central.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 1",
              "mensagem": "Poucas opções costumam significar menos comparação de tarifa e de taxa. Vale ver o que cooperativa e banco digital cobram.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 4",
              "mensagem": "Situação comum. Confira se todas estão autorizadas e compare a tarifa de manutenção de cada conta.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Muitas contas espalham o controle e escondem tarifa. Encerre as que não usa e acompanhe as que ficarem.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Busque no site do Banco Central se as instituições que você usa estão autorizadas."
        }
      }
    ]
  },
  {
    "slug": "ef89-fonte-confiavel",
    "titulo": "Fonte confiável",
    "subtitulo": "Quem fala sobre dinheiro na sua timeline — e o endividamento do país.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-h",
    "blocoRotulo": "Bloco H · Cenário financeiro e cidadania",
    "ordem": 32,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "informacao",
      "fontes",
      "endividamento"
    ],
    "thumbnail": "/trilha/cidadania.png",
    "preRequisitoSlug": "ef89-quem-e-quem-no-sfn",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF66",
      "EF89LF67"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Quem ganha com o conselho",
        "mediacao": null,
        "conteudo": {
          "headline": "Antes da dica, pergunte: quem paga essa pessoa para eu ouvir isso?",
          "corpo": "Todo conteúdo sobre dinheiro tem alguém pagando a conta. Antes de seguir uma dica, veja três coisas: quem fala tem registro e responde pelo que diz; a fonte mostra de onde tirou o número; e o que essa pessoa ganha se você seguir. Promessa de ganho certo e rápido é o sinal mais forte de que a informação não é confiável."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O vídeo e o curso",
        "mediacao": null,
        "conteudo": {
          "headline": "O que enfraquece mais esse vídeo: o dado que ele usa ou o interesse de quem fala?",
          "personagem": "Yara",
          "narrativa": "Yara vê um vídeo dizendo que dívida de cartão é falta de organização. Nos comentários, gente contando que a fatura estourou depois de desemprego ou de remédio caro. No Brasil, mais de 70 milhões de pessoas estão com o nome negativado, e o cartão de crédito é a maior causa. O vídeo termina indicando um curso de R$ 297 do próprio autor."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Conflito de interesse",
        "mediacao": null,
        "conteudo": {
          "headline": "O vídeo culpa a desorganização e vende um curso de R$ 297. Por que isso pesa contra a confiabilidade dele?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Não pesa: quem cobra por conteúdo costuma ser mais qualificado",
              "correta": false,
              "feedback": "Cobrar não é problema em si, mas o autor lucra exatamente com o diagnóstico que ele mesmo deu. Isso é conflito de interesse."
            },
            {
              "letra": "B",
              "texto": "Porque ignora causas como desemprego e doença e lucra com a solução que vende",
              "correta": true,
              "feedback": "Endividamento tem causa econômica e social, não só comportamento. Fonte que reduz tudo a culpa individual e vende a cura merece desconfiança."
            },
            {
              "letra": "C",
              "texto": "Porque vídeo curto nunca serve para falar de dinheiro",
              "correta": false,
              "feedback": "O formato não define a qualidade. O que define é a origem do dado e o interesse de quem publica."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua timeline mostra fonte?",
        "mediacao": null,
        "conteudo": {
          "headline": "Das contas que falam de dinheiro e que você acompanha, quantas mostram a fonte dos números que citam?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Vale olhar as três últimas publicações de cada uma antes de responder.",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Nenhuma",
                  "valor": "1"
                },
                {
                  "label": "Quase nenhuma",
                  "valor": "2"
                },
                {
                  "label": "Cerca da metade",
                  "valor": "3"
                },
                {
                  "label": "A maioria",
                  "valor": "4"
                },
                {
                  "label": "Não acompanho nenhuma",
                  "valor": "5"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O filtro que você aplica",
        "mediacao": null,
        "conteudo": {
          "headline": "Você respondeu {valor}. Fonte citada é o critério mais fácil de checar e o que mais separa informação de propaganda.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor em 1,2",
              "mensagem": "Sua timeline entrega opinião com cara de dado. Compare qualquer número com Banco Central, IBGE ou pesquisas de inadimplência antes de usar.",
              "cor": "green"
            },
            {
              "condicao": "valor em 3,4",
              "mensagem": "Boa base. Agora aplique o segundo critério: o que cada conta vende e se o conselho leva sempre ao produto dela.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Sem referência própria, você depende do que aparece por acaso. Escolha uma fonte pública e uma independente para comparar.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Pegue um número sobre dinheiro que você viu esta semana e procure a fonte original."
        }
      }
    ]
  },
  {
    "slug": "ef89-negocio-doacao-voluntariado",
    "titulo": "Negócio novo, doação e voluntariado",
    "subtitulo": "Oportunidade em cenário difícil e o dinheiro que não volta.",
    "publico": "ef89",
    "blocoId": "ef89-bloco-h",
    "blocoRotulo": "Bloco H · Cenário financeiro e cidadania",
    "ordem": 33,
    "nivel": "intermediario",
    "duracaoMin": 3,
    "pontos": 40,
    "tags": [
      "empreendedorismo",
      "risco",
      "oportunidade"
    ],
    "thumbnail": "/trilha/cidadania.png",
    "preRequisitoSlug": "ef89-fonte-confiavel",
    "ehRevisao": false,
    "situacoes": [],
    "tipoPerfil": "ef89",
    "habilidades": [
      "EF89LF64",
      "EF89LF68"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Risco, oportunidade e o que não volta",
        "mediacao": null,
        "conteudo": {
          "headline": "Crise muda o que as pessoas compram; nem todo valor gerado passa por dinheiro.",
          "corpo": "Cenário difícil fecha portas e abre outras. Quando a renda cai, serviço barato e conserto crescem; quando sobra dinheiro, cresce o supérfluo. Negócio novo vive dessa leitura e do risco de errar. Do lado que não busca lucro, doação e voluntariado movimentam trabalho e recurso sem retorno financeiro: sustentam creche, banco de alimentos e mutirão, e valem como parte real da economia."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Duas portas no bairro",
        "mediacao": null,
        "conteudo": {
          "headline": "São escolhas concorrentes, ou dois tipos diferentes de retorno?",
          "personagem": "Zélia",
          "narrativa": "No bairro de Zélia, duas lojas fecharam e o desemprego subiu. Ela pensa em dois caminhos: abrir um conserto de roupa e eletrodoméstico, com R$ 900 de máquina e ferramenta, ou entrar no mutirão que distribui marmita e precisa de quatro horas por semana. O conserto pode render R$ 600 por mês, mas leva meses para ter clientela fixa."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Por que conserto cresce",
        "mediacao": null,
        "conteudo": {
          "headline": "Por que o conserto de roupa e eletrodoméstico pode dar certo justamente num bairro com desemprego alto?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Porque em crise as pessoas compram mais coisas novas",
              "correta": false,
              "feedback": "Ocorre o contrário: com renda menor, a compra de item novo é adiada. É aí que o conserto ganha espaço."
            },
            {
              "letra": "B",
              "texto": "Porque consertar sai mais barato que substituir, e a procura por reparo sobe",
              "correta": true,
              "feedback": "Renda apertada desloca o gasto para serviço barato e durabilidade. Ler esse deslocamento é identificar a oportunidade."
            },
            {
              "letra": "C",
              "texto": "Porque nenhum negócio tem risco quando o serviço é barato",
              "correta": false,
              "feedback": "Risco existe sempre: R$ 900 investidos, meses sem clientela e vizinhos com pouco dinheiro para pagar."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Horas que você tem",
        "mediacao": null,
        "conteudo": {
          "headline": "Quantas horas por mês você teria disponíveis para trabalho voluntário no seu bairro?",
          "campos": [
            {
              "id": "valor",
              "emoji": "✏️",
              "label": "Pense no tempo que já sobra hoje, não no que você gostaria de ter.",
              "tipo": "decimal",
              "placeholder": "8"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Tempo também é recurso",
        "mediacao": null,
        "conteudo": {
          "headline": "Você indicou {valor} horas por mês. Trabalho voluntário não entra no seu orçamento, mas entra no de quem recebe: hora doada substitui serviço que alguém teria de pagar.",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Tempo também é escasso, e agenda cheia é motivo legítimo. Doação de item usado cumpre papel parecido.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 8",
              "mensagem": "Duas horas por semana já sustentam mutirão de marmita, aula de reforço ou horta comunitária.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Volume alto. Vale escolher uma iniciativa com prestação de contas pública, para o seu tempo render de fato.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Procure uma iniciativa do seu bairro e pergunte de que ela precisa hoje."
        }
      }
    ]
  }
]
