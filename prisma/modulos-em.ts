import type { Nivel, Situacao } from "@/lib/situacoes"

/**
 * ARQUIVO GERADO — não edite à mão.
 *
 * Sai de `scripts/portar-em.mts`, que lê a fonte (`prisma/trilha-em-fonte.ts`)
 * e as decisões editoriais (`prisma/editorial-em.ts`). Mexeu num dos dois?
 * Rode o portador de novo:
 *
 *   node --import tsx scripts/portar-em.mts
 *
 * São 24 módulos de Ensino Médio cobrindo as 47 habilidades da Matriz de
 * Competências de Letramento Financeiro (Banco Central / Aprender Valor, 2025).
 * Todos nascem com `publico: "em"` — não aparecem para quem usa o app adulto.
 * Quem semeia é `scripts/semear-em.mts`.
 */

export interface ModuloEM {
  slug: string
  titulo: string
  subtitulo: string
  tipoPerfil: string
  publico: string
  ordem: number
  nivel: Nivel
  situacoes: Situacao[]
  tags: string[]
  duracaoMin: number
  xp: number
  /** Habilidades da matriz do BC. Rastreabilidade — não é campo do schema. */
  habilidades: string[]
  telas: {
    ordem: number
    tipo: "conceito" | "cenario" | "quiz" | "input" | "resultado"
    label: string
    conteudo: unknown
  }[]
}

export const MODULOS_EM: ModuloEM[] = [
  {
    "slug": "de-onde-veio-esse-dinheiro",
    "titulo": "De onde veio esse dinheiro",
    "subtitulo": "Um acordo social que já mudou muitas vezes na história.",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 1,
    "nivel": "iniciante",
    "situacoes": [],
    "tags": [
      "confianca",
      "cultura",
      "dinheiro",
      "em13lf",
      "ensino-medio",
      "historia",
      "moeda"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF01",
      "EM13LF47"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Dinheiro é um acordo",
        "conteudo": {
          "headline": "O dinheiro vale porque as pessoas combinaram que vale.",
          "corpo": "Dinheiro não tem valor por si. Uma cédula é papel; um saldo no app é um registro digital. O que sustenta os dois é um acordo coletivo: todo mundo aceita porque confia que os outros também vão aceitar. Antes das moedas, sociedades usaram sal, gado, conchas e metal. Cada formato resolveu um problema de troca e criou limites novos."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A nota na gaveta",
        "conteudo": {
          "headline": "O que a nota antiga perdeu, e o que a caixa de laranjas nunca teve?",
          "personagem": "Tarcísio",
          "linhas": [
            {
              "label": "Nota de 50 cruzados novos",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "não compra nada hoje"
            },
            {
              "label": "Pix ao pedreiro",
              "valor": 300,
              "tipo": "saida"
            },
            {
              "label": "Caixa de laranjas do quintal",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "quitou parte, sem registro"
            }
          ],
          "rodape": "Tarcísio tem 58 anos e guarda uma nota de 50 cruzados novos numa gaveta. Em 1989 ela comprava um mês de feira; hoje não compra nada, é só lembrança. No mesmo mês, ele pagou o pedreiro de casa com R$ 300 em Pix e ainda deu uma caixa de laranjas do quintal, como o pai dele fazia. As duas coisas quitaram a dívida. Só uma delas aparece em algum registro."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Por que parou de valer",
        "conteudo": {
          "headline": "Por que uma cédula antiga como a de Tarcísio deixou de comprar qualquer coisa?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Porque o papel dela envelheceu e se desgastou.",
              "correta": false,
              "feedback": "O estado físico não define o valor. Cédulas novas daquela mesma moeda também não compram mais nada hoje."
            },
            {
              "letra": "B",
              "texto": "Porque o acordo coletivo que sustentava aquela moeda foi substituído por outro.",
              "correta": true,
              "feedback": "Exatamente. Quando a regra e a confiança mudam, o valor migra para a nova moeda e a antiga vira objeto de memória."
            },
            {
              "letra": "C",
              "texto": "Porque o governo escondeu o ouro que garantia o valor dela.",
              "correta": false,
              "feedback": "Nenhuma das duas moedas era lastreada em ouro. O que muda é a regra e a aceitação das pessoas, não um estoque de metal."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Papel ou tela",
        "conteudo": {
          "headline": "Quanto do dinheiro que passou pelas suas mãos nos últimos sete dias foi em papel, e não digital?",
          "subtitulo": "Estimativa serve; não precisa conferir extrato nem contar moedas.",
          "campos": [
            {
              "id": "valor",
              "emoji": "💵",
              "label": "Em papel, dos últimos 7 dias",
              "tipo": "decimal",
              "placeholder": "10%"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Mesmo acordo, outros rastros",
        "conteudo": {
          "headline": "Você estimou <strong>{valorCru}%</strong> em papel",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Sua vida financeira já é toda digital. Isso facilita comprovar pagamentos e concentra em poucas empresas o registro do que você compra.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 30",
              "mensagem": "É o arranjo mais comum hoje: o papel virou exceção, usado onde o digital falha, custa caro ou não é aceito.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "O papel ainda pesa no seu dia a dia. Costuma indicar renda informal, comércio local ou acesso instável à internet, cada um com vantagens e riscos próprios.",
              "cor": "yellow"
            }
          ],
          "insightDinamico": "Você estimou {valorCru} em papel. Não existe número certo aqui: a proporção muda com a região, a idade e o tipo de trabalho de cada um. O que importa é perceber que dinheiro vivo e saldo digital carregam o mesmo acordo, mas deixam rastros diferentes — em taxa, em privacidade, em prova de que o pagamento aconteceu.\n\nPróximo passo: Pergunte a alguém com mais de 50 anos qual moeda ele usava aos 20."
        }
      }
    ]
  },
  {
    "slug": "por-que-custa-o-que-custa",
    "titulo": "Por que custa o que custa",
    "subtitulo": "Preço não é custo mais um pouco. É uma disputa.",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 2,
    "nivel": "iniciante",
    "situacoes": [],
    "tags": [
      "custos",
      "demanda",
      "em13lf",
      "ensino-medio",
      "lucro",
      "margem",
      "oferta",
      "preco"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF02",
      "EM13LF04"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "O preço tem camadas",
        "conteudo": {
          "headline": "Custo é o que o vendedor gasta. Preço é o que ele consegue cobrar.",
          "corpo": "O preço que você paga não é o custo do produto com um pouco a mais. Ele junta custo de produção, transporte, impostos, aluguel, salários e a margem que o vendedor quer. Em cima disso, oferta e demanda empurram para os dois lados: pouca coisa e muita gente procurando sobe; estoque parado desce. Publicidade e marca também entram na conta."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O bolo de pote da Késia",
        "conteudo": {
          "headline": "Baixar o preço para acompanhar a concorrente vale a pena para Késia?",
          "personagem": "Késia",
          "linhas": [
            {
              "label": "Preço de venda do pote",
              "valor": 12,
              "tipo": "entrada"
            },
            {
              "label": "Custo por pote",
              "valor": 4.2,
              "tipo": "saida"
            },
            {
              "label": "Fixos da semana",
              "valor": 60,
              "tipo": "saida"
            },
            {
              "label": "Vendidos por semana",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "90 potes"
            },
            {
              "label": "Lucro da semana",
              "valor": 642,
              "tipo": "saldo"
            }
          ],
          "rodape": "Késia tem 24 anos e vende bolo de pote na saída da faculdade. Cada pote custa R$ 4,20 em ingredientes e embalagem, e ela gasta R$ 60 por semana com transporte e gás. Vende a R$ 12 e escoa 90 potes por semana. Uma concorrente abriu do lado cobrando R$ 9. Késia pensa em baixar para R$ 9,50, mas aí a margem de cada pote cai quase pela metade."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "A conta de baixar o preço",
        "conteudo": {
          "headline": "Com 90 potes por semana, o que acontece com o lucro de Késia se ela baixar de R$ 12 para R$ 9,50?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "O lucro cai de R$ 642 para R$ 417 por semana, a menos que ela venda mais.",
              "correta": true,
              "feedback": "Isso. A margem por pote cai de R$ 7,80 para R$ 5,30; para manter o mesmo lucro ela precisaria vender cerca de 133 potes."
            },
            {
              "letra": "B",
              "texto": "O lucro fica igual, porque o custo de cada pote não mudou.",
              "correta": false,
              "feedback": "O custo não muda, mas quem absorve a diferença é a margem. São R$ 2,50 a menos por pote, ou R$ 225 por semana."
            },
            {
              "letra": "C",
              "texto": "Ela passa a ter prejuízo, porque o preço fica abaixo do custo.",
              "correta": false,
              "feedback": "R$ 9,50 ainda cobre os R$ 4,20 de custo e as despesas fixas da semana. Continua havendo lucro, só que bem menor."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Quanto é custo",
        "conteudo": {
          "headline": "Pense na última coisa que você comprou. Que fatia do preço você acha que foi custo do vendedor?",
          "subtitulo": "É um palpite: ninguém sabe a planilha do outro de cabeça.",
          "campos": [
            {
              "id": "valor",
              "emoji": "🏷️",
              "label": "Fatia que foi custo",
              "tipo": "decimal",
              "placeholder": "60%"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Margem à vista",
        "conteudo": {
          "headline": "Você chutou <strong>{valorCru}%</strong> de custo",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 40",
              "mensagem": "Você imagina uma margem enorme. Ela existe em setores como cosméticos e moda de marca, mas é exceção, não regra.",
              "cor": "yellow"
            },
            {
              "condicao": "valor <= 75",
              "mensagem": "Está na faixa mais comum do comércio. Nela, uma queda de 10% no preço pode derrubar o lucro em muito mais que 10%.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Você vê pouca folga para o vendedor. Em produtos de giro rápido isso é realista; se você achar que é sempre assim, investigue por que o mesmo item varia tanto entre lojas.",
              "cor": "yellow"
            }
          ],
          "insightDinamico": "Você chutou {valorCru} de custo. No varejo comum, a mercadoria costuma ficar entre 50% e 70% do preço, e o resto paga aluguel, impostos, salários, perdas e o lucro de quem vende. Quem compra quer que essa fatia seja alta; quem vende precisa que sobre. Saber que existe margem é o que permite comparar, questionar e negociar.\n\nPróximo passo: Compare o mesmo produto em três lojas e liste o que explica a diferença."
        }
      }
    ]
  },
  {
    "slug": "ler-antes-de-assinar",
    "titulo": "Ler antes de assinar",
    "subtitulo": "Fatura, contrato e boleto dizem mais do que parecem.",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 3,
    "nivel": "iniciante",
    "situacoes": [
      "divida_rotativa",
      "financiamento"
    ],
    "tags": [
      "consumidor",
      "contrato",
      "direitos",
      "documentos",
      "em13lf",
      "ensino-medio",
      "fatura"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF06",
      "EM13LF42"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Onde mora a informação",
        "conteudo": {
          "headline": "Assinar sem ler não anula seus direitos, mas dificulta muito provar.",
          "corpo": "Todo documento financeiro tem um lugar fixo onde a informação que importa aparece. Na fatura do cartão: total, vencimento, encargos e a linha de cada compra. No contrato: prazo, multa por cancelamento, reajuste e o que está fora da cobertura. No boleto: o beneficiário e o valor após o vencimento. Ler é conferir se esses campos batem com o que foi combinado."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A fatura que cresceu",
        "conteudo": {
          "headline": "O que Wellington deve fazer antes de simplesmente pagar a fatura inteira?",
          "personagem": "Wellington",
          "linhas": [
            {
              "label": "Plano contratado",
              "valor": 99.9,
              "tipo": "saida"
            },
            {
              "label": "Antivírus que ele não pediu",
              "valor": 24.9,
              "tipo": "saida"
            },
            {
              "label": "Taxa de instalação parcelada",
              "valor": 12.6,
              "tipo": "saida"
            },
            {
              "label": "Fatura que chegou",
              "valor": 137.4,
              "tipo": "saldo"
            }
          ],
          "rodape": "Wellington tem 31 anos e assinou um plano de internet por R$ 99,90 ao mês. Na terceira fatura veio R$ 137,40: R$ 99,90 do plano, R$ 24,90 de um pacote de antivírus que ele não pediu e R$ 12,60 de taxa de instalação parcelada. O contrato, na cláusula 8, diz que serviços adicionais dependem de aceite expresso. Ele guardou o e-mail da contratação, sem nenhuma menção ao antivírus."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Contestar do jeito certo",
        "conteudo": {
          "headline": "Diante da cobrança do antivírus que não pediu, qual é a atitude que mais protege Wellington?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Não pagar nada até a empresa resolver, já que a cobrança está errada.",
              "correta": false,
              "feedback": "Deixar a fatura inteira vencer gera juros e negativação sobre a parte que ele realmente deve. Contestar não suspende o que foi contratado."
            },
            {
              "letra": "B",
              "texto": "Pagar o valor que reconhece, abrir reclamação com protocolo e guardar contrato e e-mail.",
              "correta": true,
              "feedback": "Isso o mantém em dia com o que contratou e cria a prova documental que sustenta o pedido de estorno da cobrança indevida."
            },
            {
              "letra": "C",
              "texto": "Pagar tudo agora e reclamar depois, porque contestar antes é considerado calote.",
              "correta": false,
              "feedback": "Contestar cobrança indevida é um direito, não calote. Pagar tudo sem registrar a contestação dificulta a devolução depois."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Você lê o que assina?",
        "conteudo": {
          "headline": "Quantos dos documentos financeiros que você recebeu no último mês você abriu e leu até o fim?",
          "subtitulo": "Vale a impressão geral; não precisa conferir a caixa de entrada.",
          "campos": [
            {
              "id": "valor",
              "emoji": "📄",
              "label": "Documentos lidos até o fim",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Nenhum",
                  "valor": "0"
                },
                {
                  "label": "Um ou dois",
                  "valor": "1"
                },
                {
                  "label": "Metade",
                  "valor": "2"
                },
                {
                  "label": "Quase todos",
                  "valor": "3"
                },
                {
                  "label": "Todos",
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
        "label": "Checagem de dois minutos",
        "conteudo": {
          "headline": "O que passa sem leitura costuma ser pequeno e mensal",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 1",
              "mensagem": "Cobranças pequenas e recorrentes passam despercebidas justamente aí. Comece pela fatura de maior valor do mês.",
              "cor": "yellow"
            },
            {
              "condicao": "valor <= 3",
              "mensagem": "O hábito já existe. Falta padronizar: sempre os mesmos quatro campos, sempre no mesmo dia do mês.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Leitura completa é raro. O passo seguinte é guardar contrato, protocolo e comprovante no mesmo lugar, para o dia em que precisar provar algo.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Você respondeu {valorCru}. Ler tudo, sempre, não é realista. O que funciona é uma checagem curta e fixa: valor total, vencimento, cobranças que você não reconhece e o que mudou desde o mês passado. Menos de dois minutos por documento já resolve a maior parte dos casos, e o registro de uma contestação vale mais do que a sua memória.\n\nPróximo passo: Abra a última fatura e procure uma cobrança que você não sabe explicar."
        }
      }
    ]
  },
  {
    "slug": "fonte-confiavel",
    "titulo": "Fonte confiável (e a sua opinião)",
    "subtitulo": "Checar quem regula, depois escrever o que você concluiu.",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 4,
    "nivel": "intermediario",
    "situacoes": [],
    "tags": [
      "checagem",
      "em13lf",
      "ensino-medio",
      "fontes",
      "opiniao",
      "pesquisa",
      "reguladores"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF45",
      "EM13LF05"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Quem responde por quê",
        "conteudo": {
          "headline": "Registro no regulador não garante ganho. Garante que existe a quem reclamar.",
          "corpo": "Cada parte do sistema financeiro tem um órgão que registra e fiscaliza quem pode operar. Banco Central: bancos, cooperativas e instituições de pagamento. CVM: fundos, corretoras e quem oferece investimento. Susep: seguros e capitalização. Previc: fundos de pensão fechados. Antes de acreditar em qualquer promessa, dá para procurar o nome da empresa no site do órgão certo e ver se ela existe ali."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Três fontes, três versões",
        "conteudo": {
          "headline": "Qual dessas fontes ela deve colocar no centro do texto dela?",
          "personagem": "Nayara",
          "linhas": [
            {
              "label": "Vídeo com 800 mil visualizações",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "alcance, não apuração"
            },
            {
              "label": "Matéria de jornal com o nome do CEO",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "fonte secundária"
            },
            {
              "label": "Consulta no Banco Central",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "empresa não aparece"
            },
            {
              "label": "Promessa anunciada",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "4% ao mês"
            }
          ],
          "rodape": "Nayara tem 17 anos e precisa escrever um texto de opinião sobre uma empresa que promete render 4% ao mês. Ela acha três fontes: um vídeo com 800 mil visualizações, uma matéria de jornal com o nome do CEO e uma consulta no site do Banco Central, onde a empresa não aparece em nenhuma lista de instituições autorizadas. As três dizem coisas diferentes sobre a mesma empresa."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Cada um no seu órgão",
        "conteudo": {
          "headline": "Nayara vai investigar também um seguro de celular e um fundo de investimento. Onde ela confere cada um?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Banco Central para os dois, porque ele regula todo o sistema financeiro.",
              "correta": false,
              "feedback": "O Banco Central cuida de bancos, cooperativas e meios de pagamento. Seguro e fundo têm reguladores próprios."
            },
            {
              "letra": "B",
              "texto": "Susep para o seguro e CVM para o fundo de investimento.",
              "correta": true,
              "feedback": "Cada um no seu órgão: a Susep supervisiona seguros e capitalização, e a CVM supervisiona fundos e quem os distribui."
            },
            {
              "letra": "C",
              "texto": "Procon para os dois, já que envolvem contratos com consumidores.",
              "correta": false,
              "feedback": "O Procon atua no conflito de consumo, mas não autoriza nem registra essas empresas. A autorização vem do regulador do setor."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua primeira frase",
        "conteudo": {
          "headline": "Escreva a frase de abertura de um texto seu sobre uma promessa financeira que você já viu.",
          "subtitulo": "Uma frase basta; é rascunho, não precisa estar pronta para publicar.",
          "campos": [
            {
              "id": "valor",
              "emoji": "✍️",
              "label": "Sua frase de abertura",
              "tipo": "texto",
              "placeholder": "Vi um anúncio que promete dobrar o dinheiro em 60 dias."
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Do palpite ao argumento",
        "conteudo": {
          "headline": "Uma frase vira texto quando dá para conferir",
          "formula": "valor_direto",
          "insightDinamico": "Sua abertura: {valorCru}. Um texto de opinião sustenta uma tese com evidência verificável. A estrutura mínima é: o que foi prometido, quem é a empresa, o que o regulador do setor mostra sobre ela e o que você conclui a partir disso. Sem a terceira parte, o texto vira palpite; com ela, vira argumento que outra pessoa consegue conferir.\n\nPróximo passo: Procure o nome de uma empresa financeira no site do Banco Central hoje."
        }
      }
    ]
  },
  {
    "slug": "escolher-e-abrir-mao",
    "titulo": "Escolher é abrir mão",
    "subtitulo": "Custo de oportunidade, tempo e o efeito da inflação",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 5,
    "nivel": "iniciante",
    "situacoes": [
      "sem_reserva"
    ],
    "tags": [
      "custo oportunidade",
      "em13lf",
      "ensino-medio",
      "escolhas",
      "inflacao",
      "planejamento",
      "prazos"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF07",
      "EM13LF10"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "O preço do que você não escolhe",
        "conteudo": {
          "headline": "Não existe escolha grátis: sempre há uma segunda opção que fica para trás.",
          "corpo": "Toda escolha financeira tem um preço escondido: o que você deixa de fazer com o mesmo dinheiro. Isso é custo de oportunidade. Ele aparece no tempo — gastar hoje ou daqui a seis meses muda o que aquele valor compra — e no calendário: material escolar em janeiro, passagem em julho. Quem enxerga o que abre mão escolhe com mais informação."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Notebook agora ou em março",
        "conteudo": {
          "headline": "O desconto de março compensa a renda que ela deixa de ganhar até lá?",
          "personagem": "Rafaela",
          "linhas": [
            {
              "label": "Juntado em freelas",
              "valor": 900,
              "tipo": "entrada"
            },
            {
              "label": "Notebook agora, em dezembro",
              "valor": 900,
              "tipo": "saida"
            },
            {
              "label": "Mesmo modelo em março",
              "valor": 750,
              "tipo": "saida"
            },
            {
              "label": "Trabalhos recusados até lá",
              "valor": 400,
              "tipo": "saida"
            }
          ],
          "rodape": "Rafaela, 19 anos, juntou R$ 900 fazendo freelas de edição de vídeo. Ela quer um notebook usado por R$ 900 agora, em dezembro, quando o preço sobe com a demanda de fim de ano. Em março, o mesmo modelo costuma sair por R$ 750. Só que sem o notebook ela recusa dois trabalhos de R$ 200 cada até lá. Esperar economiza R$ 150 e custa R$ 400 de renda."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Quem sente mais a inflação",
        "conteudo": {
          "headline": "A inflação de um ano ficou em 5%, puxada por alimentos e transporte. Qual família sente mais o aperto?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "A que gasta quase toda a renda com comida e ônibus",
              "correta": true,
              "feedback": "Quando quase toda a renda vai para itens que subiram, não há de onde cortar. A mesma inflação pesa mais em quem gasta tudo com o essencial."
            },
            {
              "letra": "B",
              "texto": "A de renda mais alta, porque paga mais imposto",
              "correta": false,
              "feedback": "Imposto não é o ponto aqui. Renda mais alta tem folga para trocar marcas, adiar compras ou usar reservas, e a alta de preços morde menos."
            },
            {
              "letra": "C",
              "texto": "Todas igualmente, porque o índice é o mesmo para o país",
              "correta": false,
              "feedback": "O índice é uma média. A cesta de cada família é diferente, e quem consome mais do que subiu perde mais poder de compra."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "A compra que dá para adiar",
        "conteudo": {
          "headline": "Pense em uma compra que você faria neste mês e que dá para adiar. Quanto ela custa?",
          "subtitulo": "Uma estimativa de cabeça basta; não precisa conferir o preço exato.",
          "campos": [
            {
              "id": "valor",
              "emoji": "⏳",
              "label": "Compra que dá para adiar",
              "tipo": "decimal",
              "placeholder": "R$ 320"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O que ficou de fora",
        "conteudo": {
          "headline": "Adiar <strong>R$ {valor}</strong> tem um preço e um ganho",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 100",
              "mensagem": "Valor pequeno, decisão rápida. Ainda assim, vale a pergunta: em três meses, esse dinheiro faria mais por você em outro lugar?",
              "cor": "green"
            },
            {
              "condicao": "valor <= 500",
              "mensagem": "Nessa faixa o calendário conta. Muitos itens caem de preço fora da alta temporada, e a espera costuma valer mais que o desconto de hoje.",
              "cor": "yellow"
            },
            {
              "condicao": "resto",
              "mensagem": "Acima disso o custo de oportunidade fica visível: esse valor é reserva para imprevisto, um curso ou várias contas do mês. Escreva as duas alternativas antes de decidir.",
              "cor": "yellow"
            }
          ],
          "insightDinamico": "Adiar essa compra de {valor} não é só guardar dinheiro. É comparar duas coisas: o que ela resolve hoje e o que o mesmo valor resolve daqui a alguns meses, já contando que preços mudam. A sazonalidade ajuda quem consegue esperar, e a inflação cobra de quem não consegue. A decisão muda conforme a folga que você tem.\n\nPróximo passo: Anote o preço dessa compra hoje e confira o mesmo item daqui a 30 dias."
        }
      }
    ]
  },
  {
    "slug": "seu-orcamento-em-uma-tela",
    "titulo": "Seu orçamento em uma tela",
    "subtitulo": "Monte um orçamento que aguenta o imprevisto",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 6,
    "nivel": "iniciante",
    "situacoes": [
      "sem_reserva",
      "renda_variavel",
      "dependentes"
    ],
    "tags": [
      "despesas fixas",
      "em13lf",
      "ensino-medio",
      "imprevistos",
      "orcamento",
      "planejamento",
      "renda"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF08"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "As três colunas do mês",
        "conteudo": {
          "headline": "Quem não escreve o orçamento acredita que sobra mais do que sobra.",
          "corpo": "Orçamento é uma folha com três colunas: o que entra, o que sai sempre e o que sai às vezes. Gastos fixos repetem — aluguel, transporte, assinatura. Variáveis oscilam — comida fora, presentes, farmácia. E existem os imprevistos, que ninguém agenda mas todo mês aparecem. Orçamento não é previsão perfeita: é ter o número na frente antes de decidir."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A sobra que sumia",
        "conteudo": {
          "headline": "Se o imprevisto acontece quase todo mês, ele ainda pode ficar fora do orçamento?",
          "personagem": "Everton",
          "linhas": [
            {
              "label": "Entra por mês",
              "valor": 3200,
              "tipo": "entrada"
            },
            {
              "label": "Fixos",
              "valor": 1840,
              "tipo": "saida"
            },
            {
              "label": "Variáveis, na média",
              "valor": 950,
              "tipo": "saida"
            },
            {
              "label": "Sobra no papel",
              "valor": 410,
              "tipo": "saldo"
            },
            {
              "label": "Imprevisto, em 4 dos últimos 6 meses",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "de R$ 200 a R$ 500"
            }
          ],
          "rodape": "Everton, 34 anos, recebe R$ 3.200 por mês e mora com a filha. Fixos: aluguel R$ 1.100, transporte R$ 280, internet e celular R$ 160, escola R$ 300. Variáveis, na média: mercado R$ 700, farmácia e lazer R$ 250. No papel sobram R$ 410. Só que em quatro dos últimos seis meses apareceu algo fora da conta — dentista, pneu, uniforme — entre R$ 200 e R$ 500."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Onde está o furo",
        "conteudo": {
          "headline": "Everton quer que a sobra pare de sumir. Qual mudança resolve melhor o problema dele?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Cortar o lazer de R$ 250 até zerar esse gasto",
              "correta": false,
              "feedback": "Corte total costuma durar poucas semanas e não cobre o imprevisto do mês seguinte. O problema não é o lazer, é a linha que falta no orçamento."
            },
            {
              "letra": "B",
              "texto": "Criar uma linha mensal de imprevistos, separada da sobra",
              "correta": true,
              "feedback": "Se o inesperado aparece em quatro de cada seis meses, ele é previsível o bastante para virar linha do orçamento. Aí a sobra vira sobra de verdade."
            },
            {
              "letra": "C",
              "texto": "Esperar o mês fechar e usar o cartão quando faltar",
              "correta": false,
              "feedback": "Isso empurra o problema para frente com juros junto. O gasto não some, só chega maior no mês seguinte."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Monte a sua conta",
        "conteudo": {
          "headline": "Monte a conta: tudo que entra no mês, menos os gastos fixos e a média dos variáveis. Quanto sobra?",
          "subtitulo": "Estimativa serve: use números redondos e a média dos últimos meses.",
          "campos": [
            {
              "id": "valor",
              "emoji": "🧮",
              "label": "Quanto sobra no seu mês",
              "tipo": "decimal",
              "placeholder": "R$ 240"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Sua sobra real",
        "conteudo": {
          "headline": "Sua sobra real: <strong>R$ {valor}</strong>",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 0",
              "mensagem": "O mês fecha no vermelho antes de qualquer imprevisto. A saída passa por cortar ou renegociar um gasto fixo, não por apertar os variáveis por algumas semanas.",
              "cor": "red"
            },
            {
              "condicao": "valor <= 300",
              "mensagem": "A sobra existe, mas um imprevisto médio consome ela inteira. Separar uma parte fixa por mês para o inesperado evita que a sobra vire dívida.",
              "cor": "yellow"
            },
            {
              "condicao": "resto",
              "mensagem": "Com essa folga dá para dividir a sobra em destinos: imprevisto, objetivo de curto prazo e uso livre. Sobra sem destino tende a sumir.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Sua sobra estimada é {valor}. Esse número é o orçamento funcionando: ele mostra quanto do mês já está comprometido antes de qualquer decisão. A sobra só é real quando os imprevistos têm linha própria e as despesas variáveis são a média dos últimos meses, não o melhor mês. Refaça a conta quando a renda ou um gasto fixo mudar.\n\nPróximo passo: Escreva num papel só as três linhas: entra, fixo e variável médio."
        }
      }
    ]
  },
  {
    "slug": "preco-justo",
    "titulo": "Preço justo: pesquisar e negociar",
    "subtitulo": "Compare o custo total e peça o desconto que existe",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 7,
    "nivel": "iniciante",
    "situacoes": [],
    "tags": [
      "consumo",
      "custo total",
      "em13lf",
      "ensino-medio",
      "negociacao",
      "parcelamento",
      "pesquisa preco"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF11",
      "EM13LF12"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Preço não é só a etiqueta",
        "conteudo": {
          "headline": "Compare custo total e prazo, não a etiqueta.",
          "corpo": "Preço justo não é o menor número da tela. É o menor custo total para o que você precisa, no prazo que você precisa. Some frete, taxa de entrega, juros do parcelamento, garantia e o custo de esperar quinze dias. Pesquisar é comparar três ofertas na mesma base. Negociar é pedir — desconto à vista, frete grátis, prazo menor — sabendo o que você aceita."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Três ofertas, uma decisão",
        "conteudo": {
          "headline": "Qual oferta custa menos de verdade, considerando frete, juros e dias de espera?",
          "personagem": "Iasmin",
          "linhas": [
            {
              "label": "Loja A — à vista, hoje",
              "valor": 1400,
              "tipo": "saida"
            },
            {
              "label": "Loja B — com frete, 20 dias",
              "valor": 1380,
              "tipo": "saida"
            },
            {
              "label": "Site C — à vista, 12 dias",
              "valor": 1180,
              "tipo": "saida"
            },
            {
              "label": "O que ela gasta hoje em transporte",
              "valor": 180,
              "tipo": "saida"
            }
          ],
          "rodape": "Iasmin, 22 anos, precisa de uma bicicleta para ir ao trabalho e parar de gastar R$ 180 por mês em transporte. Loja A: R$ 1.400 à vista, retirada hoje. Loja B: R$ 1.290, frete R$ 90, entrega em 20 dias. Site C: R$ 1.180 à vista ou 10x de R$ 138, entrega em 12 dias, sem loja física para garantia. Ela tem R$ 1.500 guardados."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Como se pede desconto",
        "conteudo": {
          "headline": "Iasmin liga para a loja A e quer negociar. Qual pedido tem mais chance de funcionar?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Dizer que só compra se derem 40% de desconto",
              "correta": false,
              "feedback": "Pedido sem base e fora da margem da loja costuma encerrar a conversa. Negociação precisa de um número que o outro lado consiga aceitar."
            },
            {
              "letra": "B",
              "texto": "Mostrar o preço da concorrente e pedir R$ 1.290 à vista, levando hoje",
              "correta": true,
              "feedback": "Negociação funciona com informação e contrapartida: você traz um preço real de mercado e oferece pagamento imediato, que reduz custo e risco para a loja."
            },
            {
              "letra": "C",
              "texto": "Aceitar o preço da etiqueta, porque desconto só existe em data promocional",
              "correta": false,
              "feedback": "Em compras de valor maior, à vista ou em lojas com margem, pedir é comum. Não perguntar é abrir mão de um desconto que já existia."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua última pesquisa",
        "conteudo": {
          "headline": "Na sua última compra acima de R$ 200, em quantos lugares diferentes você comparou o preço?",
          "subtitulo": "Vale o número aproximado; precisão não é exigida aqui.",
          "campos": [
            {
              "id": "valor",
              "emoji": "🔍",
              "label": "Lugares comparados",
              "tipo": "decimal",
              "placeholder": "3"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O que a pesquisa te dá",
        "conteudo": {
          "headline": "Você comparou <strong>{valorCru}</strong> lugar(es)",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 1",
              "mensagem": "Sem comparação, o preço pago foi o primeiro que apareceu. Abrir mais duas abas é o passo com maior retorno por minuto gasto.",
              "cor": "yellow"
            },
            {
              "condicao": "valor == 2",
              "mensagem": "Duas ofertas mostram uma diferença, mas não mostram a faixa de preço do item. A terceira é que revela se a barata é barata mesmo.",
              "cor": "yellow"
            },
            {
              "condicao": "resto",
              "mensagem": "Boa base de comparação. O próximo ganho vem de padronizar a conta: preço mais frete, mais juros do parcelamento, mais custo do prazo de entrega.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Você comparou preços em {valorCru} lugares. Três é um bom piso: com menos, não dá para saber se o preço é bom ou só familiar. Comparar custa alguns minutos e costuma valer entre 5% e 20% do valor da compra. E o resultado da pesquisa é a sua carta na hora de negociar: sem ele você pede desconto, com ele você propõe um preço.\n\nPróximo passo: Antes da próxima compra, abra três ofertas e some frete, juros e prazo."
        }
      }
    ]
  },
  {
    "slug": "o-que-te-faz-comprar",
    "titulo": "O que te faz comprar",
    "subtitulo": "Influência, publicidade e o custo do que você compra",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 8,
    "nivel": "iniciante",
    "situacoes": [
      "divida_rotativa"
    ],
    "tags": [
      "consumo",
      "em13lf",
      "ensino-medio",
      "etica",
      "impacto ambiental",
      "impulso",
      "publicidade"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF13",
      "EM13LF09"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "De quem veio essa vontade",
        "conteudo": {
          "headline": "A pergunta não é \"eu quero?\", é \"de quem veio essa vontade?\".",
          "corpo": "Nem toda compra começa numa necessidade. Começa num story, num amigo com o modelo novo, numa data que a publicidade inventou. Esses empurrões não são errados — são invisíveis, e é isso que os torna caros. Ao lado deles existe outra conta: quem produziu, em que condições, quanto o produto dura e o que acontece com ele quando você enjoar."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Tênis, grupo e curso",
        "conteudo": {
          "headline": "O que decide aqui: o plano dele, o grupo ou a campanha?",
          "personagem": "Caio",
          "linhas": [
            {
              "label": "Juntado para o curso de inglês",
              "valor": 700,
              "tipo": "entrada"
            },
            {
              "label": "Tênis que o grupo comprou",
              "valor": 650,
              "tipo": "saida"
            },
            {
              "label": "Duração média do tênis",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "um ano"
            },
            {
              "label": "Vezes que o curso já foi adiado",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "duas"
            }
          ],
          "rodape": "Caio, 17 anos, juntou R$ 700 de trabalho no fim de semana para um curso de inglês. Aí três amigos compraram o mesmo tênis de R$ 650, lançamento com campanha grande, e o grupo não fala de outra coisa. Ele leu que a marca responde a processos por condições de trabalho na fábrica. O tênis dura, em média, um ano. O curso, ele já adiou duas vezes."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Prós e contras de verdade",
        "conteudo": {
          "headline": "Caio quer decidir sem se enganar. Qual método pesa melhor os prós e contras dessa compra?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Listar preço e condição de pagamento, porque o resto é opinião",
              "correta": false,
              "feedback": "Preço e prazo são metade da conta. Ficam de fora o uso real, a durabilidade, o impacto social e ambiental e o plano que a compra atrasa."
            },
            {
              "letra": "B",
              "texto": "Perguntar aos amigos se o tênis vale a pena",
              "correta": false,
              "feedback": "O grupo é justamente uma das forças que criou a vontade. Consultá-lo tende a confirmar a decisão em vez de testá-la."
            },
            {
              "letra": "C",
              "texto": "Esperar 72 horas e reler o objetivo daquele dinheiro antes de decidir",
              "correta": true,
              "feedback": "O intervalo separa desejo de impulso, e o objetivo escrito devolve a comparação: curso ou tênis. A conta passa a incluir o que o dinheiro já tinha para fazer."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Compras fora do plano",
        "conteudo": {
          "headline": "Nos últimos 30 dias, quanto você gastou em compras que não estavam no seu plano?",
          "subtitulo": "Escolha a faixa mais próxima; estimativa serve, não precisa somar recibo por recibo.",
          "campos": [
            {
              "id": "valor",
              "emoji": "🛒",
              "label": "Gasto fora do plano, 30 dias",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Nada",
                  "valor": "0"
                },
                {
                  "label": "Até R$ 50",
                  "valor": "25"
                },
                {
                  "label": "R$ 50 a R$ 200",
                  "valor": "125"
                },
                {
                  "label": "R$ 200 a R$ 500",
                  "valor": "350"
                },
                {
                  "label": "Mais de R$ 500",
                  "valor": "600"
                }
              ]
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O custo de não perceber",
        "conteudo": {
          "headline": "O gasto fora do plano cabe no mês. E no ano?",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Mês sem desvio costuma significar plano claro ou pouca exposição a gatilho. Vale conferir se foi controle ou só um mês sem lançamento e promoção.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 200",
              "mensagem": "Faixa comum e administrável. O risco não é o valor do mês, é ele se repetir doze vezes sem nunca entrar na conta.",
              "cor": "yellow"
            },
            {
              "condicao": "resto",
              "mensagem": "Nessa faixa, o gasto fora do plano já concorre com um objetivo inteiro. Vale mapear onde a compra começou: anúncio, grupo, aplicativo ou data comercial.",
              "cor": "yellow"
            }
          ],
          "insightDinamico": "{valorCru} em compras fora do plano é o preço de um mês de influência: grupo, campanha, data comercial. Não é sobre culpa, é sobre saber quanto custa não perceber. A cada compra, três perguntas dão conta do recado: de onde veio a vontade, quem paga o custo social e ambiental disso, e o que esse dinheiro deixaria de fazer.\n\nPróximo passo: Escolha uma compra pendente e espere 72 horas antes de decidir."
        }
      }
    ]
  },
  {
    "slug": "poupar-tem-um-porque",
    "titulo": "Poupar tem um porquê",
    "subtitulo": "Objetivo primeiro, prazo depois, produto por último.",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 9,
    "nivel": "iniciante",
    "situacoes": [
      "sem_reserva"
    ],
    "tags": [
      "aposta",
      "em13lf",
      "ensino-medio",
      "objetivo",
      "poupanca",
      "prazo",
      "risco"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF14",
      "EM13LF21"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Poupar não é sobrar",
        "conteudo": {
          "headline": "Sem prazo definido, qualquer aplicação parece boa e nenhuma serve.",
          "corpo": "Poupar sem destino vira dinheiro parado que some no primeiro imprevisto. Quem poupa com objetivo define três coisas antes de escolher onde guardar: para quê, quanto e até quando. Um curso no fim do ano é curto prazo. Trocar de moradia em três anos é médio. Parar de depender de renda um dia é longo. O prazo é o que muda a escolha, não o contrário."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Duas metas e um atalho",
        "conteudo": {
          "headline": "O dinheiro dos dois planos deve ficar no mesmo lugar? E a proposta do conhecido?",
          "personagem": "Renata",
          "linhas": [
            {
              "label": "Guardado hoje",
              "valor": 3200,
              "tipo": "entrada"
            },
            {
              "label": "Notebook, daqui a 6 meses",
              "valor": 4000,
              "tipo": "saida"
            },
            {
              "label": "Viagem",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "daqui a 3 anos"
            },
            {
              "label": "Proposta do conhecido",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "dobrar num fim de semana"
            }
          ],
          "rodape": "Renata tem 24 anos e faz freelas de edição de vídeo. Guardou R$ 3.200 e tem dois planos: um notebook novo daqui a seis meses, por volta de R$ 4.000, e uma viagem em três anos. Um conhecido diz que ela dobra esse valor num fim de semana apostando em jogos online. Ele mostra um print de ganho. Não mostra as outras dez apostas da semana."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Investir ou apostar",
        "conteudo": {
          "headline": "Qual critério separa investir de apostar, independentemente de quanto cada um pode render?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "O valor envolvido: aposta é com pouco dinheiro, investimento é com muito.",
              "correta": false,
              "feedback": "O valor não muda a natureza da operação. Dá para apostar alto e investir pouco no mesmo dia."
            },
            {
              "letra": "B",
              "texto": "A origem do retorno: investimento remunera capital emprestado ou produtivo; aposta paga com a perda de outro apostador.",
              "correta": true,
              "feedback": "Investir compra um direito sobre juros, lucros ou aluguéis. Na aposta, o ganho de um só existe porque outros perderam."
            },
            {
              "letra": "C",
              "texto": "O tempo: aposta é rápida, investimento é lento.",
              "correta": false,
              "feedback": "Existe aplicação com resgate no mesmo dia e aposta que leva meses para ser liquidada. Prazo não define a diferença."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua meta mais próxima",
        "conteudo": {
          "headline": "Em quantos meses você quer ter o dinheiro do seu objetivo mais próximo na mão?",
          "subtitulo": "Uma estimativa basta; o número aproximado já muda a escolha.",
          "campos": [
            {
              "id": "valor",
              "emoji": "📅",
              "label": "Meses até o objetivo",
              "tipo": "decimal",
              "placeholder": "18"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O prazo escolhe por você",
        "conteudo": {
          "headline": "<strong>{valorCru}</strong> meses: é o prazo que escolhe onde o dinheiro fica",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 12",
              "mensagem": "Curto prazo: o critério principal é poder sacar sem perder valor. Rendimento alto com resgate incerto não serve aqui.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 60",
              "mensagem": "Médio prazo: dá para aceitar alguma oscilação, desde que a data-alvo tenha folga de alguns meses.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Longo prazo: aqui o inimigo é a inflação, não a oscilação de um mês. Reveja a meta uma vez por ano.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Você marcou {valorCru} meses. Esse número é o primeiro filtro: ele elimina metade das opções antes de você olhar qualquer rendimento. Quanto mais perto o objetivo, menos você pode aceitar oscilação; quanto mais longe, mais o tempo trabalha a seu favor. E nada disso vale se o dinheiro estiver numa aposta, onde não existe prazo, só sorte.\n\nPróximo passo: Escreva no celular o objetivo, o valor e a data. Sem os três, não é meta."
        }
      }
    ]
  },
  {
    "slug": "risco-retorno-liquidez",
    "titulo": "Risco, retorno e liquidez",
    "subtitulo": "Três variáveis que se puxam: nunca as três no máximo.",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 10,
    "nivel": "intermediario",
    "situacoes": [],
    "tags": [
      "diversificacao",
      "em13lf",
      "ensino-medio",
      "liquidez",
      "prazo",
      "retorno",
      "risco"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF17",
      "EM13LF18"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "O triângulo da escolha",
        "conteudo": {
          "headline": "Risco, retorno e liquidez: você escolhe duas e negocia a terceira.",
          "corpo": "Toda aplicação responde a três perguntas. Risco: qual a chance de eu receber menos do que esperava? Retorno: quanto ela promete render? Liquidez: em quanto tempo eu transformo isso em dinheiro na conta sem perder valor? As três se puxam. Retorno alto costuma vir com risco alto ou com liquidez baixa. Quem oferece as três no máximo está escondendo alguma coisa."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Tudo no mesmo lugar",
        "conteudo": {
          "headline": "O problema foi o rendimento, o prazo de resgate ou ter tudo num lugar só?",
          "personagem": "Cauã",
          "linhas": [
            {
              "label": "Aplicado num ativo só",
              "valor": 12000,
              "tipo": "saida"
            },
            {
              "label": "Prazo de resgate",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "dois anos"
            },
            {
              "label": "Precisou no terceiro mês",
              "valor": 2000,
              "tipo": "saida"
            },
            {
              "label": "Conseguiu tirar",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "nada"
            }
          ],
          "rodape": "Cauã tem 31 anos e trabalha como técnico de refrigeração. Juntou R$ 12.000 e colocou tudo em um único ativo indicado num grupo de mensagens, com resgate só depois de dois anos. No terceiro mês, a geladeira de casa queimou e o aluguel subiu. Ele precisava de R$ 2.000 e não conseguiu tirar. No papel, o rendimento era ótimo. O dinheiro existia, mas não estava disponível."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Diversificar por quê",
        "conteudo": {
          "headline": "Diversificar é dividir o dinheiro entre aplicações diferentes. Qual é o objetivo principal dessa estratégia?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Garantir que nenhuma parte do dinheiro perca valor.",
              "correta": false,
              "feedback": "Nenhuma estratégia elimina perdas. Diversificar reduz o impacto de uma perda, não a possibilidade dela."
            },
            {
              "letra": "B",
              "texto": "Multiplicar o retorno, já que mais aplicações rendem mais.",
              "correta": false,
              "feedback": "Aplicações não somam rendimento por serem várias. Parte do dinheiro em opções mais conservadoras tende a render menos, e essa é a troca aceita."
            },
            {
              "letra": "C",
              "texto": "Fazer com que um resultado ruim em uma parte não derrube o conjunto.",
              "correta": true,
              "feedback": "Riscos diferentes raramente acontecem ao mesmo tempo. É isso que estabiliza o resultado total e permite manter o plano de pé."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua régua de liquidez",
        "conteudo": {
          "headline": "Que percentual do seu dinheiro guardado você precisa poder sacar em até 30 dias?",
          "subtitulo": "Chute pelo seu histórico de imprevistos; precisão não é exigida.",
          "campos": [
            {
              "id": "valor",
              "emoji": "🚪",
              "label": "Precisa sacar em até 30 dias",
              "tipo": "decimal",
              "placeholder": "40"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Onde cada parte fica",
        "conteudo": {
          "headline": "<strong>{valorCru}%</strong> à mão em 30 dias",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 20",
              "mensagem": "Liquidez baixa demais para a maioria das rotinas. Um imprevisto médio te obriga a resgatar no pior momento.",
              "cor": "yellow"
            },
            {
              "condicao": "valor <= 60",
              "mensagem": "Faixa comum. Vale checar se essa parte acessível cobre pelo menos um mês de despesas fixas.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Quase tudo à mão. Seguro no curto prazo, mas com esse desenho a inflação corrói o que você guarda para depois.",
              "cor": "yellow"
            }
          ],
          "insightDinamico": "Você estimou {valorCru}%. Essa fatia não é a parte que rende mais: é a parte que precisa estar acessível quando algo quebra. O resto pode aceitar prazo maior e oscilação, porque não será chamado de uma hora para outra. Dividir por essa régua, e não por palpite de conhecido, é o que sustenta o plano quando um pedaço vai mal.\n\nPróximo passo: Liste onde está seu dinheiro hoje e o prazo de resgate de cada parte."
        }
      }
    ]
  },
  {
    "slug": "quanto-sobra-de-verdade",
    "titulo": "Quanto sobra de verdade",
    "subtitulo": "Rendimento bruto não é o que entra na sua conta.",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 11,
    "nivel": "avancado",
    "situacoes": [],
    "tags": [
      "em13lf",
      "ensino-medio",
      "imposto",
      "inflacao",
      "liquido",
      "plano",
      "rendimento"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF19",
      "EM13LF20"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Bruto, líquido e real",
        "conteudo": {
          "headline": "Se o preço subiu mais que o seu rendimento, você perdeu ganhando.",
          "corpo": "Um rendimento anunciado é sempre bruto. Dele saem taxas de administração ou custódia e, na maioria das aplicações de renda fixa, imposto de renda que cai conforme o prazo aumenta. O que sobra é o retorno líquido. Depois ainda vem a inflação: se os preços subiram mais que o seu líquido, você tem mais reais e compra menos. Esse resto é o retorno real."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A conta de um ano",
        "conteudo": {
          "headline": "Dos 11% anunciados, quanto de fato aumentou o poder de compra dela?",
          "personagem": "Iolanda",
          "linhas": [
            {
              "label": "Aplicado por um ano",
              "valor": 8000,
              "tipo": "entrada"
            },
            {
              "label": "Rendimento anunciado",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "11% ao ano"
            },
            {
              "label": "Imposto de renda",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "sobre o ganho, no resgate"
            },
            {
              "label": "Inflação do período",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "5%"
            }
          ],
          "rodape": "Iolanda tem 47 anos e vende marmitas. Guardou R$ 8.000 de um pedido grande e aplicou por um ano, com rendimento anunciado de 11% ao ano. No resgate, veio o imposto de renda sobre o ganho. No mesmo período, os preços que ela paga subiram 5%. Ela anotou os três números numa planilha simples e marcou uma revisão a cada seis meses."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Faça a conta",
        "conteudo": {
          "headline": "R$ 10.000 aplicados por um ano renderam 12% brutos. O imposto sobre o ganho foi de 20% e a inflação, 6%. Qual o ganho real aproximado?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "12%, ou R$ 1.200",
              "correta": false,
              "feedback": "Esse é o bruto, antes do imposto e antes da alta de preços. É o número do anúncio, não o do bolso."
            },
            {
              "letra": "B",
              "texto": "9,6%, ou R$ 960",
              "correta": false,
              "feedback": "Esse é o líquido depois do imposto: R$ 1.200 de ganho menos R$ 240 de imposto. Ainda falta descontar os 6% de inflação."
            },
            {
              "letra": "C",
              "texto": "Cerca de 3,4%, pouco mais de R$ 340",
              "correta": true,
              "feedback": "R$ 1.200 menos R$ 240 de imposto dão R$ 960, ou 9,6% líquidos. Descontando 6% de inflação, sobram cerca de 3,4% de ganho real."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Seu aporte mensal",
        "conteudo": {
          "headline": "Quanto você consegue separar por mês para o seu plano, sem contar com sorte nem com renda extra?",
          "subtitulo": "Uma estimativa média dos últimos três meses já serve.",
          "campos": [
            {
              "id": "valor",
              "emoji": "📥",
              "label": "Aporte mensal possível",
              "tipo": "decimal",
              "placeholder": "R$ 250"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Do plano ao papel",
        "conteudo": {
          "headline": "<strong>R$ {valor}</strong> por mês, e o que sobra depois de tudo",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 100",
              "mensagem": "Valor pequeno, mas no primeiro ano a data fixa e o hábito pesam mais que o tamanho do aporte.",
              "cor": "green"
            },
            {
              "condicao": "valor < 500",
              "mensagem": "Nessa faixa a diferença entre bruto e líquido já aparece em reais. Vale comparar tributação e taxas antes de decidir.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Com esse aporte, taxa de administração e imposto pesam de verdade. Um ponto percentual a menos de custo muda o resultado do ano.",
              "cor": "yellow"
            }
          ],
          "insightDinamico": "Com {valor} por mês, o plano só fica de pé se você acompanhar três números: quanto entrou, quanto rendeu líquido e quanto os preços subiram no período. Renda fixa e renda variável entram nesse plano em proporções que você decide pelo prazo de cada meta, não pelo rendimento anunciado. Marque uma revisão a cada seis meses e ajuste o aporte.\n\nPróximo passo: Abra uma planilha com três colunas: aporte, rendimento líquido e inflação do mês."
        }
      }
    ]
  },
  {
    "slug": "aposentadoria-comeca-hoje",
    "titulo": "Aposentadoria começa hoje",
    "subtitulo": "Tempo é o único insumo que não dá para comprar depois.",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 12,
    "nivel": "intermediario",
    "situacoes": [
      "renda_variavel"
    ],
    "tags": [
      "aposentadoria",
      "em13lf",
      "ensino-medio",
      "inss",
      "longevidade",
      "previdencia",
      "tempo"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF15",
      "EM13LF16"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Quem começa antes",
        "conteudo": {
          "headline": "Começar dez anos antes vale mais que dobrar o valor guardado depois.",
          "corpo": "Aposentadoria não é assunto de quem tem 50 anos. É um problema de tempo: cada ano guardado cedo rende sobre o próprio rendimento, e esse efeito não se recupera depois. Quem começa aos 20 precisa separar uma fatia bem menor da renda do que quem começa aos 40 para chegar ao mesmo lugar. O que falta não é dinheiro, é calendário."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Teto, tempo e conta",
        "conteudo": {
          "headline": "Se o benefício público tem teto, o que preenche a diferença até o padrão de vida dele?",
          "personagem": "Wesley",
          "linhas": [
            {
              "label": "Vínculo",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "sem carteira, dirige por aplicativo"
            },
            {
              "label": "INSS",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "ele mesmo recolhe, todo mês"
            },
            {
              "label": "Benefício público",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "tem teto, menor que a renda dele"
            },
            {
              "label": "Quem chega aos 65 no Brasil",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "tende a viver mais de 20 anos"
            }
          ],
          "rodape": "Wesley tem 38 anos e dirige por aplicativo. Como não tem carteira assinada, ele mesmo recolhe a contribuição ao INSS todo mês. Descobriu que o benefício público tem teto e que a renda dele hoje é maior que esse teto. Também leu que quem chega aos 65 no Brasil tende a viver mais de vinte anos depois disso. A conta dele precisa cobrir esse intervalo inteiro, não só a data de parar."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Público e privado",
        "conteudo": {
          "headline": "Qual comparação entre a previdência pública e os planos privados se sustenta?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "A previdência privada substitui a pública, então quem tem uma não precisa da outra.",
              "correta": false,
              "feedback": "São camadas diferentes. O regime público garante um piso vitalício e coberturas como incapacidade e pensão, que um plano privado não replica automaticamente."
            },
            {
              "letra": "B",
              "texto": "A pública paga enquanto a pessoa viver e tem teto; a privada complementa e depende do que foi acumulado e das taxas cobradas.",
              "correta": true,
              "feedback": "É a divisão de funções: piso vitalício de um lado, complemento acumulado do outro. Por isso prazo e taxas pesam tanto na parte privada."
            },
            {
              "letra": "C",
              "texto": "Contribuir para o INSS só faz sentido para quem tem carteira assinada.",
              "correta": false,
              "feedback": "Autônomos e informais podem contribuir por conta própria e manter direito a aposentadoria, auxílio por incapacidade e pensão."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Anos até reduzir o ritmo",
        "conteudo": {
          "headline": "Com quantos anos você imagina reduzir o ritmo de trabalho e depender do que juntou?",
          "subtitulo": "Uma idade aproximada basta; a ideia é enxergar o tamanho do intervalo.",
          "campos": [
            {
              "id": "valor",
              "emoji": "🕰️",
              "label": "Idade para reduzir o ritmo",
              "tipo": "decimal",
              "placeholder": "62"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O intervalo a bancar",
        "conteudo": {
          "headline": "Reduzir aos <strong>{valorCru}</strong>: o intervalo a bancar começa aí",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 55",
              "mensagem": "Parar cedo alonga o período a bancar: pode passar de trinta anos de despesas sem renda do trabalho.",
              "cor": "yellow"
            },
            {
              "condicao": "valor <= 64",
              "mensagem": "Idade comum de saída, mas provavelmente antes do benefício público integral. O intervalo entre parar e receber precisa estar coberto.",
              "cor": "yellow"
            },
            {
              "condicao": "resto",
              "mensagem": "Mais tempo contribuindo e menos tempo sacando alivia a conta. Ainda assim, planeje para viver bem além dessa idade.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Você marcou {valorCru} anos. A pergunta não é só quando parar, e sim por quanto tempo o dinheiro precisa durar depois disso. Como a expectativa de vida segue subindo, planejar por vinte ou trinta anos de despesas é mais realista que planejar por dez. Começar agora, mesmo com pouco, encurta o esforço mensal que você vai precisar fazer lá na frente.\n\nPróximo passo: Confira no Meu INSS quantas contribuições você já tem registradas."
        }
      }
    ]
  },
  {
    "slug": "dinheiro-com-impacto",
    "titulo": "Dinheiro com impacto (ESG)",
    "subtitulo": "Critérios ambientais, sociais e de governança na prática.",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 13,
    "nivel": "intermediario",
    "situacoes": [],
    "tags": [
      "ambiental",
      "consumo",
      "em13lf",
      "ensino-medio",
      "esg",
      "governanca",
      "social"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF24"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "As três letras",
        "conteudo": {
          "headline": "Governança fraca costuma aparecer no balanço antes de aparecer na notícia.",
          "corpo": "ESG resume três critérios usados para avaliar uma empresa além do resultado financeiro. Ambiental: o que ela emite, consome e descarta. Social: como trata trabalhadores, clientes e a comunidade ao redor. Governança: quem decide, com qual transparência e qual controle sobre conflitos de interesse. Esses critérios não valem só para investir: aparecem também em qual banco você usa e no que você compra."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Crédito, madeira e conduta",
        "conteudo": {
          "headline": "O que a taxa menor não mostra sobre quem vai ficar com o seu contrato por três anos?",
          "personagem": "Bianca",
          "linhas": [
            {
              "label": "Empréstimo para a máquina",
              "valor": 15000,
              "tipo": "entrada"
            },
            {
              "label": "Instituição A",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "0,4 ponto mais barata, cobrança abusiva"
            },
            {
              "label": "Instituição B",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "mais cara, contrato claro e ouvidoria"
            },
            {
              "label": "Fornecedor da madeira",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "só um comprova origem legal"
            }
          ],
          "rodape": "Bianca tem 29 anos e toca uma marcenaria pequena. Precisa de R$ 15.000 emprestados para comprar uma máquina. Duas instituições oferecem crédito: uma com taxa 0,4 ponto menor e histórico de cobrança abusiva contra clientes; outra um pouco mais cara, com contrato claro e ouvidoria que responde. Na mesma semana, ela escolhe o fornecedor da madeira e vê que só um deles comprova origem legal."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Critério ou marketing",
        "conteudo": {
          "headline": "Uma empresa se anuncia como sustentável. Qual evidência sustenta melhor essa afirmação?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Uma campanha com embalagem verde e um selo criado pela própria empresa.",
              "correta": false,
              "feedback": "Selo próprio e identidade visual não são verificáveis por ninguém de fora. Isso é comunicação, não critério."
            },
            {
              "letra": "B",
              "texto": "Relatórios anuais com metas medidas e auditadas por terceiros, além do histórico de multas e processos acessível.",
              "correta": true,
              "feedback": "Dado auditado é o que separa critério de propaganda. O histórico de sanções mostra o que a empresa faz quando ninguém está olhando."
            },
            {
              "letra": "C",
              "texto": "O fato de o setor dela ser considerado limpo, como tecnologia ou serviços.",
              "correta": false,
              "feedback": "Setor não define conduta. Empresas do mesmo ramo variam muito em consumo de energia, condições de trabalho e transparência."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua prioridade",
        "conteudo": {
          "headline": "Entre os três critérios, qual pesaria mais na sua próxima decisão de compra, crédito ou aplicação?",
          "subtitulo": "Não existe resposta certa; escolher é o que torna o critério utilizável.",
          "campos": [
            {
              "id": "valor",
              "emoji": "🌱",
              "label": "Critério que pesaria mais",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Ambiental: clima, água e resíduos",
                  "valor": "1"
                },
                {
                  "label": "Social: trabalho e comunidade",
                  "valor": "2"
                },
                {
                  "label": "Governança: transparência e contratos",
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
        "label": "Do valor ao critério",
        "conteudo": {
          "headline": "Critério só vale quando vira pergunta que dá para conferir",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 1",
              "mensagem": "Peça o número: emissões, consumo de água, destino dos resíduos. Promessa sem dado medido não dá para acompanhar.",
              "cor": "green"
            },
            {
              "condicao": "valor == 2",
              "mensagem": "Procure autuações trabalhistas, reclamações de clientes registradas e como a empresa fiscaliza os próprios fornecedores.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Veja quem responde pela empresa, se o contrato fica disponível antes da assinatura e se a ouvidoria dá resposta com prazo.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Você marcou {valorCru}. Critério só vale se for verificável: antes da próxima compra, do próximo crédito ou da próxima aplicação, procure um dado público que confirme ou desminta a promessa. Relatório auditado, decisão de órgão regulador, processo judicial, reclamação registrada. Quando o dado simplesmente não existe, isso também é informação sobre a empresa.\n\nPróximo passo: Escolha uma empresa que você já usa e procure o histórico dela em órgãos reguladores."
        }
      }
    ]
  },
  {
    "slug": "promessa-boa-demais",
    "titulo": "Golpe, risco e promessa boa demais",
    "subtitulo": "Retorno alto e pressa: como separar risco de golpe",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 14,
    "nivel": "iniciante",
    "situacoes": [],
    "tags": [
      "alto risco",
      "em13lf",
      "ensino-medio",
      "fraude",
      "golpe",
      "pix",
      "seguranca"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF36",
      "EM13LF37",
      "EM13LF23"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Promessa alta, pressa maior",
        "conteudo": {
          "headline": "Quanto maior a promessa e menor o prazo para decidir, mais tempo você deveria tomar.",
          "corpo": "Retorno alto com garantia e prazo apertado é a combinação que aparece tanto em golpe quanto em produto de alto risco mal explicado. Golpe é crime: promete o que não existe. Risco alto é legítimo, mas pode desvalorizar muito, como acontece com alguns criptoativos. Nos dois casos, a pressa serve para você decidir sem verificar quem está do outro lado."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O grupo que pagou primeiro",
        "conteudo": {
          "headline": "O primeiro pagamento provou alguma coisa, ou foi parte do golpe?",
          "personagem": "Otávio",
          "linhas": [
            {
              "label": "Primeiro Pix, para conta de pessoa física",
              "valor": 300,
              "tipo": "saida"
            },
            {
              "label": "Devolvido na primeira semana",
              "valor": 24,
              "tipo": "entrada"
            },
            {
              "label": "Oferta seguinte, só hoje",
              "valor": 3000,
              "tipo": "saida"
            },
            {
              "label": "Promessa",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "8% ao mês, sem CNPJ no site"
            }
          ],
          "rodape": "Otávio, 24 anos, entrou num grupo que promete 8% ao mês em uma carteira automatizada. Ele fez um Pix de R$ 300 para uma conta de pessoa física e recebeu R$ 24 de volta na primeira semana, a prova de que funcionava. Aí veio a oferta: R$ 3.000 hoje, só hoje, com rendimento dobrado. O site não traz CNPJ e o suporte só responde por mensagem."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Antes de transferir",
        "conteudo": {
          "headline": "Otávio resolve checar antes de mandar os R$ 3.000. Qual medida realmente reduz o risco dessa transação?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Fazer um Pix menor primeiro, para testar se o dinheiro volta.",
              "correta": false,
              "feedback": "Foi exatamente isso que já aconteceu: o retorno pequeno é a isca. Devolver R$ 24 é barato para quem quer R$ 3.000."
            },
            {
              "letra": "B",
              "texto": "Conferir o CNPJ e a autorização da empresa nos sites do Banco Central e da CVM antes de qualquer transferência.",
              "correta": true,
              "feedback": "A consulta ao regulador é gratuita e leva minutos. Quem capta dinheiro do público sem autorização está irregular, prometa o que prometer."
            },
            {
              "letra": "C",
              "texto": "Pagar com cartão de crédito em vez de Pix, porque o cartão sempre estorna.",
              "correta": false,
              "feedback": "Contestação de cartão existe, mas não é garantia e não cobre aporte em investimento. Trocar o meio de pagamento não torna a oferta legítima."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Seu limiar de desconfiança",
        "conteudo": {
          "headline": "Qual retorno mensal garantido alguém precisaria prometer para você desconfiar na hora?",
          "subtitulo": "Uma estimativa basta: o número serve para você medir o próprio alarme, não para acertar na régua.",
          "campos": [
            {
              "id": "valor",
              "emoji": "🚨",
              "label": "Retorno que te faria desconfiar",
              "tipo": "decimal",
              "placeholder": "3%"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Onde seu alarme toca",
        "conteudo": {
          "headline": "Seu alarme toca em <strong>{valorCru}%</strong> ao mês",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor <= 1",
              "mensagem": "Seu limiar está bem calibrado. Acima disso, com promessa de garantia, já cabe checar CNPJ e registro no regulador antes de qualquer transferência.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 5",
              "mensagem": "Faixa razoável, mas lembre que 3% ao mês garantidos viram mais de 40% ao ano. Pergunte de onde sairia esse dinheiro e quem responde por ele.",
              "cor": "yellow"
            },
            {
              "condicao": "resto",
              "mensagem": "Seu alarme toca tarde: 5% ao mês compõem cerca de 80% ao ano. Promessa desse tamanho, com garantia, não existe no mercado regulado.",
              "cor": "red"
            }
          ],
          "insightDinamico": "Você disse que desconfiaria a partir de {valorCru} ao mês. Guarde esse número: aplicações conservadoras no Brasil rendem perto de 1% ao mês, e ninguém pode garantir retorno muito acima disso. O mesmo critério vale para compra online, senha de internet banking e Pix para desconhecido: quando pedem pressa, é aí que você para.\n\nPróximo passo: Procure o CNPJ de quem te ofereceu investimento nos sites do Banco Central e da CVM."
        }
      }
    ]
  },
  {
    "slug": "colchao-e-apolice",
    "titulo": "Colchão e apólice",
    "subtitulo": "Reserva para o susto, seguro para o estrago",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 15,
    "nivel": "intermediario",
    "situacoes": [
      "sem_reserva",
      "dependentes"
    ],
    "tags": [
      "apolice",
      "em13lf",
      "ensino-medio",
      "franquia",
      "imprevisto",
      "reserva",
      "seguro"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF22",
      "EM13LF38"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Colchão e contrato",
        "conteudo": {
          "headline": "Reserva cobre o susto pequeno. Seguro cobre o estrago que quebraria você.",
          "corpo": "São duas proteções diferentes. A reserva de emergência é dinheiro seu, guardado onde dá para sacar rápido, para o imprevisto que você consegue pagar. O seguro é um contrato: você paga um valor por período, o prêmio, e a seguradora assume uma perda grande demais para o seu bolso. As regras do que está coberto ficam escritas na apólice."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A queda de Neide",
        "conteudo": {
          "headline": "O seguro resolveu tudo, ou sobrou uma parte para a reserva cobrir?",
          "personagem": "Neide",
          "linhas": [
            {
              "label": "Prêmio do seguro, no ano",
              "valor": 1380,
              "tipo": "saida"
            },
            {
              "label": "Conserto depois da queda",
              "valor": 5200,
              "tipo": "saida"
            },
            {
              "label": "Franquia — fica com ela",
              "valor": 2000,
              "tipo": "saida"
            },
            {
              "label": "Indenização — a seguradora paga",
              "valor": 3200,
              "tipo": "entrada"
            }
          ],
          "rodape": "Neide, 38 anos, usa a moto para entregas. Paga R$ 1.380 por ano de prêmio no seguro. Numa queda em dia de chuva, o sinistro, que é o evento previsto na apólice, o conserto saiu R$ 5.200. A franquia da apólice é de R$ 2.000: essa parte fica com ela. A seguradora pagou os R$ 3.200 restantes, a indenização. Sem reserva, Neide não teria os R$ 2.000."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Quem paga o quê",
        "conteudo": {
          "headline": "Um mês depois, Neide sofre outra queda e o conserto sai R$ 1.500. Com franquia de R$ 2.000, o que a apólice determina?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "A seguradora paga os R$ 1.500, já que o sinistro está coberto.",
              "correta": false,
              "feedback": "Prejuízo abaixo da franquia fica com o segurado. A cobertura vale para o que passa desse valor, não para qualquer conserto."
            },
            {
              "letra": "B",
              "texto": "Neide paga os R$ 1.500 do próprio bolso: abaixo da franquia não há indenização.",
              "correta": true,
              "feedback": "A franquia é a parte do prejuízo que fica com você em cada sinistro. É justamente aí que a reserva de emergência entra."
            },
            {
              "letra": "C",
              "texto": "Neide pode omitir que usa a moto para trabalhar e assim receber mais.",
              "correta": false,
              "feedback": "Informar dado falso descumpre um dever do segurado e pode anular a cobertura. Avisar o sinistro no prazo e dizer a verdade são obrigações do contrato."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Seu mês essencial",
        "conteudo": {
          "headline": "Quanto você gasta por mês com o essencial: moradia, comida, transporte e contas básicas?",
          "subtitulo": "Uma estimativa aproximada resolve; não precisa abrir extrato para responder.",
          "campos": [
            {
              "id": "valor",
              "emoji": "🛟",
              "label": "Seu mês essencial",
              "tipo": "decimal",
              "placeholder": "R$ 1.800"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O tamanho do colchão",
        "conteudo": {
          "headline": "Um mês essencial: <strong>R$ {valor}</strong>",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 1000",
              "mensagem": "Sua meta fica abaixo de R$ 3.000, alcançável guardando um pouco por mês. Comece pelo valor da franquia dos seguros que você tem ou pretende ter.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 3000",
              "mensagem": "A meta fica entre R$ 3.000 e R$ 9.000. Divida por doze e trate a parcela como uma conta fixa até fechar o valor.",
              "cor": "yellow"
            },
            {
              "condicao": "resto",
              "mensagem": "A meta passa de R$ 9.000 e leva tempo para juntar. Enquanto isso, o seguro é o que protege o que seria impossível repor do próprio bolso.",
              "cor": "yellow"
            }
          ],
          "insightDinamico": "Com {valor} por mês de gasto essencial, uma reserva de três meses fica em torno do triplo desse valor. É ela que cobre franquia, conta inesperada e mês sem renda. O seguro entra depois, para o estrago que a reserva não aguentaria. Guardar em algo de resgate rápido importa mais aqui do que buscar rendimento.\n\nPróximo passo: Some seus gastos essenciais de um mês e veja quanto falta para o primeiro mês de reserva."
        }
      }
    ]
  },
  {
    "slug": "o-preco-do-credito",
    "titulo": "O preço do crédito",
    "subtitulo": "A taxa anunciada não é o que você paga",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 16,
    "nivel": "intermediario",
    "situacoes": [
      "financiamento",
      "divida_rotativa"
    ],
    "tags": [
      "cadastro positivo",
      "cet",
      "credito",
      "em13lf",
      "emprestimo",
      "ensino-medio",
      "taxas"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF26",
      "EM13LF29"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Taxa não é o preço final",
        "conteudo": {
          "headline": "A taxa é a manchete. O CET é a conta.",
          "corpo": "A taxa que aparece no anúncio é só uma parte do que você paga. O Custo Efetivo Total, o CET, junta tudo: juros, tarifa de cadastro, seguro embutido, impostos e o prazo. Por lei, a instituição precisa informar o CET antes de você assinar. Duas ofertas com a mesma taxa mensal podem ter CET bem diferente. Comparar pela taxa anunciada é comparar pela metade."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Duas ofertas, mesma taxa",
        "conteudo": {
          "headline": "Duas ofertas com a mesma taxa: o que está fazendo R$ 501 de diferença?",
          "personagem": "Adriano",
          "linhas": [
            {
              "label": "Precisa emprestado",
              "valor": 4000,
              "tipo": "entrada"
            },
            {
              "label": "Oferta A — parcela (CET 2,9% a.m.)",
              "valor": 385,
              "tipo": "saida"
            },
            {
              "label": "Oferta B — parcela (CET 4,4% a.m.)",
              "valor": 427,
              "tipo": "saida"
            },
            {
              "label": "Mesma taxa anunciada nas duas",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "2,3% ao mês"
            },
            {
              "label": "Diferença no total pago",
              "valor": 501,
              "tipo": "saldo"
            }
          ],
          "rodape": "Adriano, 29 anos, precisa de R$ 4.000 para trocar o notebook que usa no freela. Duas instituições oferecem 12 parcelas à mesma taxa nominal: 2,3% ao mês. Na oferta A, o CET é 2,9% ao mês e a parcela sai R$ 385. Na oferta B, o CET é 4,4% ao mês, porque entram tarifa de cadastro de R$ 250 e seguro de R$ 180 na conta; a parcela vira R$ 427. No fim, R$ 4.623 contra R$ 5.124."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "O que o histórico muda",
        "conteudo": {
          "headline": "O cadastro positivo registra seu histórico de contas e parcelas pagas em dia. O que ele tende a mudar na hora de contratar crédito?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Garante a aprovação de qualquer empréstimo que você pedir",
              "correta": false,
              "feedback": "Nenhum histórico garante aprovação. A instituição continua avaliando renda, prazo e quanto você já deve."
            },
            {
              "letra": "B",
              "texto": "Melhora sua avaliação de risco e pode reduzir a taxa oferecida a você",
              "correta": true,
              "feedback": "É o efeito prático: pagamentos em dia registrados baixam o risco percebido, e risco menor costuma virar taxa e CET menores."
            },
            {
              "letra": "C",
              "texto": "Apaga do seu nome as dívidas antigas já vencidas",
              "correta": false,
              "feedback": "O cadastro positivo mostra o que foi pago, não elimina dívida. A negativação só sai quando a dívida é quitada ou renegociada."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "O que cabe no seu mês",
        "conteudo": {
          "headline": "Qual é o maior valor de parcela que caberia no seu mês sem cortar o essencial?",
          "subtitulo": "Uma estimativa basta; não é preciso abrir extrato nem acertar no centavo.",
          "campos": [
            {
              "id": "valor",
              "emoji": "📆",
              "label": "Parcela que cabe no seu mês",
              "tipo": "decimal",
              "placeholder": "R$ 300"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Sua faixa de decisão",
        "conteudo": {
          "headline": "Cabe até <strong>R$ {valor}</strong> por mês",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 385",
              "mensagem": "Nenhuma das duas ofertas do exemplo caberia no seu mês. Adiar a compra ou pedir menos custa bem menos do que atrasar parcela.",
              "cor": "yellow"
            },
            {
              "condicao": "valor < 427",
              "mensagem": "Só a oferta de CET menor caberia. A diferença entre as duas não estava na taxa anunciada, estava nas tarifas e no seguro.",
              "cor": "yellow"
            },
            {
              "condicao": "resto",
              "mensagem": "As duas caberiam, e é aí que o CET decide: a mais cara levaria R$ 501 a mais pelo mesmo dinheiro emprestado.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Você disse que cabe até R$ {valor} de parcela por mês. É esse número, e não o entusiasmo com a compra, que define quais ofertas entram na sua lista. Com ele na mão, peça o CET por escrito das duas propostas e compare o total pago, não a parcela isolada. Prazo maior quase sempre significa parcela menor e total maior.\n\nPróximo passo: Consulte seu cadastro positivo e peça o CET por escrito antes de assinar qualquer proposta."
        }
      }
    ]
  },
  {
    "slug": "quando-a-divida-vira-problema",
    "titulo": "Quando a dívida vira problema",
    "subtitulo": "Como a dívida cresce e como renegociar",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 17,
    "nivel": "intermediario",
    "situacoes": [
      "divida_rotativa"
    ],
    "tags": [
      "dividas",
      "em13lf",
      "endividamento",
      "ensino-medio",
      "juros",
      "mora",
      "renegociacao"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF27",
      "EM13LF28"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Como a dívida cresce",
        "conteudo": {
          "headline": "Juros compostos não perguntam por que você atrasou.",
          "corpo": "Dívida atrasada cresce em camadas: multa, que incide uma vez, juros de mora por mês de atraso e, no crédito rotativo, juros que incidem sobre o saldo já acrescido de juros. É por isso que o valor acelera. Endividamento excessivo raramente tem causa única: desemprego, doença, renda que varia de mês para mês e emergência sem reserva aparecem mais do que descontrole."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Quatro meses no rotativo",
        "conteudo": {
          "headline": "A dívida quase dobrou em quatro meses. O que fez o valor crescer assim?",
          "personagem": "Marlene",
          "linhas": [
            {
              "label": "Sobrou da fatura, no rotativo",
              "valor": 1200,
              "tipo": "saida"
            },
            {
              "label": "Taxa",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "14% ao mês, juros sobre juros"
            },
            {
              "label": "Quatro meses depois",
              "valor": 2027,
              "tipo": "saldo"
            },
            {
              "label": "Entrada proposta no acordo",
              "valor": 300,
              "tipo": "entrada"
            }
          ],
          "rodape": "Marlene, 41 anos, ficou quatro meses sem trabalho depois que a empresa fechou. Pagou o mínimo da fatura e o resto foi para o rotativo do cartão, a 14% ao mês. Os R$ 1.200 que sobraram viraram cerca de R$ 2.027 em quatro meses, porque os juros passaram a incidir sobre juros. Ela voltou a trabalhar e propôs um acordo: R$ 300 de entrada e 10 parcelas, com taxa negociada para baixo."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Multa mais mora",
        "conteudo": {
          "headline": "Uma conta de R$ 800 venceu há 3 meses. O contrato prevê multa de 2% e juros de mora de 1% ao mês. Quanto virou a dívida?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "R$ 816",
              "correta": false,
              "feedback": "Isso é só a multa de 2%, ou seja, R$ 16. Faltam os juros de mora dos três meses de atraso."
            },
            {
              "letra": "B",
              "texto": "R$ 824",
              "correta": false,
              "feedback": "Aqui entrou a multa e apenas um mês de mora. O atraso é de três meses, então a mora é R$ 8 três vezes."
            },
            {
              "letra": "C",
              "texto": "R$ 840",
              "correta": true,
              "feedback": "R$ 800 mais R$ 16 de multa mais R$ 8 de mora por mês, em três meses, dá R$ 840. Multa incide uma vez; mora, a cada mês."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Quanto já está comprometido",
        "conteudo": {
          "headline": "Quanto do que entra por mês já está comprometido com parcelas, faturas e dívidas?",
          "subtitulo": "Estimativa serve; não é preciso somar tudo no centavo para ter a leitura.",
          "campos": [
            {
              "id": "valor",
              "emoji": "⛓️",
              "label": "Da renda já comprometida",
              "tipo": "decimal",
              "placeholder": "25"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Onde você está",
        "conteudo": {
          "headline": "<strong>{valorCru}%</strong> da sua renda já tem dono",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 30",
              "mensagem": "Abaixo de 30% ainda há folga para absorver um imprevisto. É o momento de montar reserva, não de assumir mais uma parcela.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 50",
              "mensagem": "Nessa faixa, qualquer queda de renda vira atraso. Vale procurar o credor antes do primeiro vencimento perdido, quando ainda não há multa.",
              "cor": "yellow"
            },
            {
              "condicao": "resto",
              "mensagem": "Mais da metade da renda comprometida é endividamento excessivo, seja qual for a causa. Ataque primeiro a dívida de juros mais altos e proponha acordo.",
              "cor": "red"
            }
          ],
          "insightDinamico": "Você estimou que {valorCru}% do que entra por mês já está comprometido com dívidas. Esse percentual é o que decide se sobra espaço para um imprevisto ou se o próximo mês termina no rotativo. Renegociar não é favor nem confissão de erro: credor costuma preferir receber menos e certo a não receber.\n\nPróximo passo: Liste suas dívidas por taxa de juros e ligue hoje para o credor da mais cara."
        }
      }
    ]
  },
  {
    "slug": "estudar-sem-se-afundar",
    "titulo": "Estudar sem se afundar",
    "subtitulo": "O custo de estudar não é só a mensalidade",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 18,
    "nivel": "intermediario",
    "situacoes": [
      "ensino_superior",
      "dependentes"
    ],
    "tags": [
      "bolsas",
      "em13lf",
      "ensino superior",
      "ensino-medio",
      "financiamento",
      "permanencia",
      "prouni"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF25"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Entrar e permanecer",
        "conteudo": {
          "headline": "A vaga é o começo da conta, não o fim dela.",
          "corpo": "Entrar e permanecer são duas contas diferentes. Enem e Sisu, Prouni, Fies, cotas e bolsas da própria instituição mudam quanto você paga de mensalidade, e o Fies vira parcela depois de formado. Nenhum deles cobre sozinho o custo de permanência: transporte, material, moradia, alimentação e as horas que você deixa de trabalhar. Muitas instituições têm auxílio de permanência, mas é preciso procurar."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Duas aprovações",
        "conteudo": {
          "headline": "A vaga sem mensalidade é mesmo a opção mais barata para ele?",
          "personagem": "Kauã",
          "linhas": [
            {
              "label": "Vaga pública, outra cidade",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "mensalidade zero"
            },
            {
              "label": "…mas moradia, transporte e material",
              "valor": 1200,
              "tipo": "saida"
            },
            {
              "label": "Bolsa de 50%, na própria cidade",
              "valor": 700,
              "tipo": "saida"
            },
            {
              "label": "…mais transporte, morando em casa",
              "valor": 160,
              "tipo": "saida"
            }
          ],
          "rodape": "Kauã, 17 anos, fez o Enem e tem nota para duas coisas: uma vaga pública pelo Sisu em outra cidade e uma bolsa de 50% pelo Prouni numa faculdade da sua cidade. Na primeira, a mensalidade é zero, mas moradia, transporte e material somam R$ 1.200 por mês. Na segunda, a mensalidade com bolsa fica em R$ 700 e o transporte, R$ 160, porque ele continua morando em casa."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Quatro anos de conta",
        "conteudo": {
          "headline": "Manter-se na vaga pública em outra cidade custa R$ 1.200 por mês; com bolsa de 50% na própria cidade, R$ 860. Em 4 anos, o que pesa menos?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "A vaga pública, porque a mensalidade é zero",
              "correta": false,
              "feedback": "Mensalidade zero não zera moradia nem transporte. Em 48 meses, esse caminho soma R$ 57.600 de custo de permanência."
            },
            {
              "letra": "B",
              "texto": "A opção com bolsa de 50%, por cerca de R$ 16 mil a menos",
              "correta": true,
              "feedback": "São R$ 41.280 contra R$ 57.600 em 48 meses, uma diferença de R$ 16.320. O gasto de permanência decidiu, não a mensalidade."
            },
            {
              "letra": "C",
              "texto": "As duas custam o mesmo; muda só quem paga a conta",
              "correta": false,
              "feedback": "As duas contas são diferentes: R$ 340 por mês de diferença viram mais de R$ 16 mil ao longo do curso."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Seu custo de permanência",
        "conteudo": {
          "headline": "Quanto você gastaria por mês para se manter estudando: transporte, material, alimentação e moradia?",
          "subtitulo": "Uma estimativa aproximada já serve para comparar caminhos; precisão não é exigida aqui.",
          "campos": [
            {
              "id": "valor",
              "emoji": "🎓",
              "label": "Custo mensal de permanência",
              "tipo": "decimal",
              "placeholder": "R$ 600"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "A conta até a formatura",
        "conteudo": {
          "headline": "Manter-se estudando: <strong>R$ {valor}</strong> por mês",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 400",
              "mensagem": "Menos de R$ 400 por mês costuma pressupor morar em casa e trajeto curto. Confirme material e alimentação antes de fechar essa conta.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 1000",
              "mensagem": "Nessa faixa, passe estudantil e auxílio de permanência da instituição mudam bastante o resultado. Vale perguntar antes de escolher a vaga.",
              "cor": "yellow"
            },
            {
              "condicao": "resto",
              "mensagem": "Acima de R$ 1.000 por mês, mudar de cidade pesa mais que qualquer mensalidade. Compare com os caminhos disponíveis onde você já mora.",
              "cor": "yellow"
            }
          ],
          "insightDinamico": "R$ {valor} por mês é o seu custo de permanência estimado. Multiplicado pelos cerca de 48 meses de uma graduação, é ele que diz se um caminho se sustenta, não o valor da mensalidade. Compare Sisu, Prouni, Fies, cotas e bolsas da instituição por esse total, e pergunte a cada uma quais auxílios de moradia, transporte e alimentação existem.\n\nPróximo passo: Some o custo mensal de permanência de dois caminhos que te interessam e compare os totais."
        }
      }
    ]
  },
  {
    "slug": "de-onde-vem-a-sua-renda",
    "titulo": "De onde vem a sua renda",
    "subtitulo": "Estrutura, momento, escolhas e vínculo definem sua renda",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 19,
    "nivel": "intermediario",
    "situacoes": [
      "renda_variavel",
      "primeiro_emprego"
    ],
    "tags": [
      "direitos",
      "em13lf",
      "ensino-medio",
      "informalidade",
      "renda",
      "trabalho",
      "vinculo"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF30",
      "EM13LF31",
      "EM13LF35"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "As quatro forças da sua renda",
        "conteudo": {
          "headline": "Esforço explica parte da renda. Estrutura, conjuntura e vínculo explicam o resto.",
          "corpo": "Sua renda não é só resultado de esforço. Quatro forças a determinam ao mesmo tempo. As estruturais mudam devagar: escolaridade, região onde você mora, cor, gênero, a rede de contatos que herdou. As conjunturais são o momento: inflação, desemprego, o setor aquecido ou parado. As pessoais são suas escolhas e sua formação. E as do trabalho são o vínculo: carteira assinada, contrato, informalidade, quantas horas você entrega."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "Cleiton e a corrida que cai",
        "conteudo": {
          "headline": "O que na renda de Cleiton depende dele e o que depende do vínculo e do mercado?",
          "personagem": "Cleiton",
          "linhas": [
            {
              "label": "Mês bom, 200 horas rodadas",
              "valor": 2800,
              "tipo": "entrada"
            },
            {
              "label": "INSS, que ele mesmo recolhe",
              "valor": 200,
              "tipo": "saida"
            },
            {
              "label": "Férias, 13º, afastamento",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "nenhum"
            },
            {
              "label": "Quando o combustível sobe",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "o valor por corrida cai"
            }
          ],
          "rodape": "Cleiton tem 29 anos e faz entregas por aplicativo em Belo Horizonte. Em um mês bom, roda 200 horas e leva R$ 2.800. Não tem férias, décimo terceiro nem afastamento se quebrar o braço. Guarda R$ 200 por mês para o INSS como contribuinte individual, porque ninguém recolhe por ele. Quando o combustível sobe e o número de entregadores na cidade cresce, o valor por corrida cai — e ele não tem com quem negociar."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Direitos ou competitividade?",
        "conteudo": {
          "headline": "Uma empresa diz que precisa reduzir encargos trabalhistas para competir com concorrentes que operam com equipes informais. O que esse debate exige avaliar?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Nada: direitos trabalhistas são custo e sempre travam a competitividade.",
              "correta": false,
              "feedback": "Direitos como férias, FGTS e limite de jornada foram conquistados ao longo do século XX e sustentam saúde, previdência e poder de compra. Reduzi-los a custo apaga metade da conta."
            },
            {
              "letra": "B",
              "texto": "Os dois lados: o custo do vínculo para a empresa e o que o trabalhador perde sem proteção.",
              "correta": true,
              "feedback": "É o núcleo do debate. Encargos pesam no caixa de quem contrata, e a ausência deles transfere o risco de doença, acidente e velhice para o trabalhador e para o sistema público."
            },
            {
              "letra": "C",
              "texto": "Só o lado da empresa: se ela quebrar, ninguém tem emprego.",
              "correta": false,
              "feedback": "A sobrevivência da empresa importa, mas não encerra a discussão. Competir cortando proteção costuma empurrar o custo para a saúde pública e para a previdência, ou seja, para todo mundo."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Quanto da renda é informal",
        "conteudo": {
          "headline": "Da renda que entra na sua casa hoje, quanto vem de trabalho sem carteira, freela ou bico?",
          "subtitulo": "Uma estimativa aproximada basta; o objetivo é enxergar a proporção, não acertar o número.",
          "campos": [
            {
              "id": "valor",
              "emoji": "🧾",
              "label": "Da renda da casa, sem carteira",
              "tipo": "decimal",
              "placeholder": "40"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O que está exposto",
        "conteudo": {
          "headline": "<strong>{valorCru}%</strong> da renda da casa vem sem proteção",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "Toda a renda da casa passa por vínculo formal. A proteção está dada, mas a dependência de um único contratante também é risco: vale saber quantos meses a casa aguenta sem esse salário.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 40",
              "mensagem": "Parte da renda oscila e não gera direito nenhum. Uma reserva de emergência e a contribuição própria ao INSS cobrem justamente essa fatia.",
              "cor": "yellow"
            },
            {
              "condicao": "resto",
              "mensagem": "A maior parte da renda depende de trabalho sem proteção. Aqui, reserva e previdência não são luxo: substituem férias, licença e seguro-desemprego que ninguém vai pagar.",
              "cor": "yellow"
            }
          ],
          "insightDinamico": "Você estimou que {valorCru} da renda da sua casa vem de trabalho sem proteção formal. Esse número não mede o esforço de ninguém: mede exposição. Renda informal costuma variar mais de mês para mês, não gera FGTS nem seguro-desemprego e só conta para a aposentadoria se alguém recolher por conta própria. Saber a proporção é o primeiro passo para decidir o que dá para blindar.\n\nPróximo passo: Some quanto a sua renda variou nos últimos três meses e anote o pior mês."
        }
      }
    ]
  },
  {
    "slug": "pensar-como-quem-empreende",
    "titulo": "Pensar como quem empreende",
    "subtitulo": "Testar pequeno, no emprego, no bairro ou no negócio próprio",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 20,
    "nivel": "intermediario",
    "situacoes": [
      "renda_variavel"
    ],
    "tags": [
      "comunidade",
      "em13lf",
      "empreender",
      "ensino-medio",
      "negocio",
      "risco",
      "teste"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF32",
      "EM13LF33"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Empreender é comportamento",
        "conteudo": {
          "headline": "Empreender é um jeito de agir, não um tipo de CNPJ.",
          "corpo": "Empreender não começa com abrir empresa. Começa com um comportamento: notar um problema que incomoda outras pessoas, testar uma solução pequena antes de investir muito, aceitar risco calculado e recrutar quem faz melhor que você. Esse comportamento vale dentro de um emprego com carteira assinada, num projeto de bairro ou numa loja. Muda a escala, não a lógica."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O teste de R$ 18",
        "conteudo": {
          "headline": "O que o teste de R$ 18 comprou que uma planilha de projeções não compraria?",
          "personagem": "Rejane",
          "linhas": [
            {
              "label": "Ferramentas",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "emprestadas de um vizinho"
            },
            {
              "label": "Faturou no sábado",
              "valor": 100,
              "tipo": "entrada"
            },
            {
              "label": "Gastou em peças",
              "valor": 18,
              "tipo": "saida"
            },
            {
              "label": "Clientes atendidos",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "quatro, a R$ 25 cada"
            }
          ],
          "rodape": "Rejane tem 17 anos e percebeu que ninguém no bairro conserta bicicleta depois das 18h. Antes de comprar ferramentas caras, ela pegou emprestado o kit de um vizinho, avisou em dois grupos de mensagem e atendeu quatro pessoas num sábado, cobrando R$ 25 por reparo. Faturou R$ 100 e gastou R$ 18 em peças. O teste custou pouco e respondeu à pergunta que importava: existe gente disposta a pagar por isso?"
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Cultural, social ou comercial",
        "conteudo": {
          "headline": "Três pessoas querem tocar um negócio próprio: um sarau pago, um projeto de reforço escolar gratuito e uma loja de doces. O que muda entre eles?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Nada de relevante: todo negócio depende só de vender bem.",
              "correta": false,
              "feedback": "Vender importa nos três, mas a origem do dinheiro é diferente. Um projeto social costuma combinar doação, edital e contrapartida, e isso muda quem ele precisa convencer."
            },
            {
              "letra": "B",
              "texto": "De onde vem a receita e a quem cada um presta contas.",
              "correta": true,
              "feedback": "É isso. O sarau depende de público e patrocínio, o projeto social de editais e doadores, a loja de margem e giro — e cada fonte cobra uma prestação de contas diferente."
            },
            {
              "letra": "C",
              "texto": "O cultural e o social não precisam de controle financeiro, só o comercial.",
              "correta": false,
              "feedback": "Os três precisam saber custo, receita e caixa. Projetos culturais e sociais costumam ter exigência de prestação de contas ainda mais rígida, porque usam recurso de terceiros."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua próxima ideia",
        "conteudo": {
          "headline": "Se você fosse testar uma ideia nos próximos 30 dias, de que natureza ela seria?",
          "subtitulo": "Não precisa ser a ideia definitiva; vale a que você testaria com o que já tem hoje.",
          "campos": [
            {
              "id": "valor",
              "emoji": "🧪",
              "label": "Natureza da sua próxima ideia",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Cultural: oficina, evento, produto artístico",
                  "valor": "1"
                },
                {
                  "label": "Social: resolver um problema da comunidade",
                  "valor": "2"
                },
                {
                  "label": "Comercial: vender produto ou serviço",
                  "valor": "3"
                },
                {
                  "label": "Dentro de onde já estou",
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
        "label": "Do teste ao próximo passo",
        "conteudo": {
          "headline": "Teste pequeno responde o que projeção nenhuma responde",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 3",
              "mensagem": "Sua primeira pergunta é se alguém paga um preço que cobre o custo. Descubra isso com quatro clientes reais antes de investir em estoque.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 2",
              "mensagem": "Aqui a receita quase nunca vem só de quem usa. Mapeie desde já editais, parceiros e contrapartidas, porque cada fonte traz uma exigência de prestação de contas.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Empreender dentro de uma organização é o caminho de menor risco pessoal. Escolha um processo que trava toda semana e proponha a mudança com número antes e depois.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Você escolheu {valorCru}. Seja qual for a natureza, o próximo movimento é o mesmo: reduzir a ideia a um teste que caiba em uma semana e em pouco dinheiro. Quem empreende bem não aposta tudo de uma vez — troca dúvida por informação barata. O que muda entre as naturezas é de onde vem a receita e para quem você presta contas.\n\nPróximo passo: Descreva a ideia em uma frase e mostre para três pessoas que têm esse problema."
        }
      }
    ]
  },
  {
    "slug": "a-conta-do-negocio",
    "titulo": "A conta do negócio",
    "subtitulo": "Receita, custo, margem: onde mexer para o lucro subir",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 21,
    "nivel": "avancado",
    "situacoes": [
      "renda_variavel"
    ],
    "tags": [
      "custos",
      "em13lf",
      "ensino-medio",
      "margem",
      "negocio",
      "orcamento",
      "sustentabilidade"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF34"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Os quatro números do negócio",
        "conteudo": {
          "headline": "A margem paga o custo fixo. O que sobra depois disso é lucro.",
          "corpo": "Todo negócio cabe em quatro números. Receita é o que entra. Custo variável cresce a cada venda: ingrediente, embalagem, taxa da maquininha. Custo fixo você paga mesmo vendendo zero: aluguel, luz, salários. A margem de contribuição é o que sobra de cada venda depois do custo variável — é ela que precisa pagar o custo fixo antes de virar lucro."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A marmitaria de Solange",
        "conteudo": {
          "headline": "Onde mexer primeiro para o lucro subir sem empurrar o custo para o meio ambiente?",
          "personagem": "Solange",
          "linhas": [
            {
              "label": "Receita do mês — 600 marmitas a R$ 20",
              "valor": 12000,
              "tipo": "entrada"
            },
            {
              "label": "Custo variável",
              "valor": 6600,
              "tipo": "saida"
            },
            {
              "label": "Custo fixo",
              "valor": 4200,
              "tipo": "saida"
            },
            {
              "label": "Lucro — 10% da receita",
              "valor": 1200,
              "tipo": "saldo"
            },
            {
              "label": "Desperdício de legumes",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "8% por compra mal dimensionada"
            }
          ],
          "rodape": "Solange tem 41 anos e faz 600 marmitas por mês a R$ 20: R$ 12.000 de receita. Cada marmita custa R$ 11 em ingredientes e embalagem, o que dá R$ 6.600 de custo variável. Aluguel, gás, energia e a ajudante somam R$ 4.200 fixos. Sobram R$ 1.200 de lucro, 10% da receita. Ela joga fora cerca de 8% dos legumes por compra mal dimensionada e gasta R$ 380 por mês em embalagem descartável."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Qual melhoria propor",
        "conteudo": {
          "headline": "Solange quer aumentar o lucro. Ela pode subir o preço, cortar o desperdício de insumo ou demitir a ajudante. Qual proposta ataca custo sem transferir prejuízo?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Demitir a ajudante e absorver o serviço sozinha.",
              "correta": false,
              "feedback": "Corta custo fixo no papel, mas tira uma renda do bairro e joga a jornada inteira sobre ela. Se a produção cair junto, o lucro pode nem subir."
            },
            {
              "letra": "B",
              "texto": "Reduzir os 8% de perda de legumes ajustando a compra semanal.",
              "correta": true,
              "feedback": "Insumo que não vai para o lixo vira margem direta, sem aumentar preço nem cortar gente. E menos comida descartada reduz o custo ambiental da operação."
            },
            {
              "letra": "C",
              "texto": "Subir o preço da marmita para R$ 24.",
              "correta": false,
              "feedback": "Pode funcionar, mas é a saída que mais depende de o cliente aceitar: em marmita, quatro reais a mais costumam derrubar o volume. Mexer no que se controla vem antes."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Quanto dá para cortar",
        "conteudo": {
          "headline": "Quanto por mês você propõe cortar em desperdício e embalagem descartável sem reduzir a produção?",
          "subtitulo": "Uma estimativa serve: pense em quanto dos 8% de perda e dos R$ 380 de embalagem dá para reduzir.",
          "campos": [
            {
              "id": "valor",
              "emoji": "♻️",
              "label": "Corte proposto por mês",
              "tipo": "decimal",
              "placeholder": "R$ 400"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "O efeito no lucro",
        "conteudo": {
          "headline": "<strong>R$ {valor}</strong> por mês saindo do desperdício",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 200",
              "mensagem": "Parece pouco, mas R$ 150 por mês são R$ 1.800 no ano, sem depender de o cliente aceitar preço maior. Meça a perda por uma semana antes de mudar a compra.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 500",
              "mensagem": "Uma economia nessa faixa aumenta o lucro entre 17% e 42% sem tocar no preço. Compare o custo por unidade da embalagem descartável com o de uma opção retornável ou compostável.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Acima de R$ 500 a estimativa fica otimista: a embalagem inteira custa R$ 380 por mês. Confirme com nota fiscal e com a pesagem do que vai para o lixo antes de contar com esse ganho.",
              "cor": "yellow"
            }
          ],
          "insightDinamico": "Com {valor} por mês a menos em desperdício e embalagem, esse valor cai direto no lucro de R$ 1.200 — sem vender uma marmita a mais e sem cortar a ajudante. É a melhoria mais barata do orçamento: mexe no custo variável, que Solange controla, e diminui o lixo. Preço e quadro de gente entram depois, se a conta ainda não fechar.\n\nPróximo passo: Pese por uma semana o que vai para o lixo e converta em reais."
        }
      }
    ]
  },
  {
    "slug": "quem-move-a-economia",
    "titulo": "Quem move a economia",
    "subtitulo": "Quem produz, quem compra, quem regula — e onde você entra",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 22,
    "nivel": "intermediario",
    "situacoes": [],
    "tags": [
      "consumo",
      "desigualdade",
      "economia",
      "em13lf",
      "ensino-medio",
      "governo",
      "renda"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF39",
      "EM13LF40"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "A engrenagem tem quatro peças",
        "conteudo": {
          "headline": "Você é um agente econômico, não só um espectador do noticiário.",
          "corpo": "A economia é feita de gente decidindo. Produtores criam bens e serviços e contratam. Vendedores conectam quem produz a quem compra e definem preço. Compradores escolhem onde gastar e, com isso, dizem o que vale a pena existir. O governo arrecada, gasta, contrata e define regras. Cada decisão de um muda o campo de jogo dos outros — inclusive o seu."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "A padaria e o bairro",
        "conteudo": {
          "headline": "Se a soma da renda é quase a mesma, por que o consumo do bairro mudou tanto?",
          "personagem": "Elaine",
          "linhas": [
            {
              "label": "Fábrica da região",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "demitiu 200 pessoas"
            },
            {
              "label": "Faturamento da padaria",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "caiu 18% em dois meses"
            },
            {
              "label": "O que mudou na prateleira",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "pão de queijo de R$ 6 → pão francês de R$ 1"
            },
            {
              "label": "Clínica nova na mesma rua",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "15 vagas de salário alto"
            }
          ],
          "rodape": "Elaine, 41 anos, tem uma padaria num bairro de 3 mil moradores. Uma fábrica da região demitiu 200 pessoas e, em dois meses, o faturamento dela caiu 18%. Ninguém parou de comer: as pessoas trocaram o pão de queijo de R$ 6 pelo pão francês de R$ 1. Na mesma rua abriu uma clínica com 15 vagas de salário alto, e o café expresso passou a sair mais. A renda total do bairro quase não mudou. O que ela vende, sim."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Mesmo bolo, fatias diferentes",
        "conteudo": {
          "headline": "Duas cidades têm a mesma renda total. Na primeira, ela é bem distribuída; na segunda, concentrada em poucas famílias. O que tende a mudar?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Nada relevante: o que importa é o total, não como ele se reparte.",
              "correta": false,
              "feedback": "O total não determina o consumo. Renda espalhada entre muita gente sustenta padaria, farmácia e transporte; concentrada, esse gasto básico encolhe."
            },
            {
              "letra": "B",
              "texto": "Na primeira, mais gente compra itens básicos; na segunda, o gasto se concentra em menos pessoas e em itens mais caros.",
              "correta": true,
              "feedback": "É isso. A mesma renda total gera consumo, empregos e negócios diferentes conforme quem a recebe."
            },
            {
              "letra": "C",
              "texto": "A segunda cidade terá mais comércio, porque dinheiro concentrado circula mais rápido.",
              "correta": false,
              "feedback": "Não existe essa regra. Quem ganha muito tende a poupar ou investir uma fatia maior da renda, e parte desse dinheiro pode nem circular na cidade."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Onde seu dinheiro para",
        "conteudo": {
          "headline": "Pensando no último mês, quanto do seu dinheiro ficou em comércios do seu próprio bairro ou cidade?",
          "subtitulo": "Uma estimativa de cabeça resolve; não é preciso somar recibos.",
          "campos": [
            {
              "id": "valor",
              "emoji": "🏘️",
              "label": "Gasto no comércio do bairro",
              "tipo": "decimal",
              "placeholder": "R$ 350"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Seu gasto é renda de alguém",
        "conteudo": {
          "headline": "<strong>R$ {valor}</strong> viraram renda perto de você",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 200",
              "mensagem": "Boa parte do seu consumo sai do bairro: compras on-line e redes grandes levam esse dinheiro para outro lugar. Não é errado, mas muda quem recebe.",
              "cor": "yellow"
            },
            {
              "condicao": "valor <= 800",
              "mensagem": "Seu gasto está dividido entre o comércio local e o de fora, que é o padrão da maioria das famílias urbanas.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Quase tudo que você gasta vira renda perto de onde você mora. Isso sustenta empregos vizinhos e costuma custar um pouco mais caro que comprar de grandes redes.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Os {valor} que você estimou não sumiram: viraram renda de quem vendeu, salário de quem atendeu e tributo que financia serviço público. Multiplique isso por milhares de pessoas e você tem a economia local. Como distribuir melhor essa renda — via imposto, salário, crédito ou crescimento — é uma disputa política real, com bons argumentos de mais de um lado.\n\nPróximo passo: Escolha uma compra da semana e descubra quem produz, quem vende e quanto fica com cada um."
        }
      }
    ]
  },
  {
    "slug": "imposto-servico-publico-e-voce",
    "titulo": "Imposto, serviço público e você",
    "subtitulo": "Para onde vai o imposto e como você fiscaliza isso",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 23,
    "nivel": "intermediario",
    "situacoes": [],
    "tags": [
      "cidadania",
      "em13lf",
      "ensino-medio",
      "impostos",
      "servicos publicos",
      "transparencia",
      "tributos"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF41",
      "EM13LF43"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "O que o preço já cobrou",
        "conteudo": {
          "headline": "Isso se chama regressividade: é fato medido. O que fazer a respeito é debate aberto.",
          "corpo": "Tributo é o que financia escola, SUS, estrada e polícia. Ele vem por dois caminhos. O direto incide sobre renda e patrimônio, como o Imposto de Renda e o IPTU: quem tem mais, paga mais. O indireto vem embutido no preço do que você compra e é igual para todo mundo, independentemente da renda — por isso pesa proporcionalmente mais em quem ganha menos."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O fone e a nota fiscal",
        "conteudo": {
          "headline": "O imposto pago foi idêntico. O peso foi o mesmo?",
          "personagem": "Berenice",
          "linhas": [
            {
              "label": "Freela de edição",
              "valor": 400,
              "tipo": "entrada"
            },
            {
              "label": "Fone comprado",
              "valor": 250,
              "tipo": "saida"
            },
            {
              "label": "Tributo embutido no preço",
              "valor": 90,
              "tipo": "saida"
            },
            {
              "label": "O mesmo tributo, para quem ganha R$ 22 mil",
              "valor": 0,
              "tipo": "saldo",
              "valorTexto": "0,4% da renda, contra 22%"
            }
          ],
          "rodape": "Berenice, 17 anos, recebeu R$ 400 por um freela de edição de vídeo e comprou um fone de R$ 250. Na nota fiscal, a linha de tributos apontava cerca de R$ 90 embutidos no preço — valor de exemplo, que varia por produto e por estado. No mesmo dia, Regina, que ganha R$ 22.000 por mês, comprou o mesmo fone e pagou os mesmos R$ 90. Para Berenice, aquilo foi 22% da renda do freela. Para Regina, 0,4%."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Venda sem nota",
        "conteudo": {
          "headline": "Uma loja vende sem emitir nota e não recolhe o tributo daquela venda. Qual é o efeito mais direto?",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Ninguém perde: o dinheiro fica com a loja e circula do mesmo jeito.",
              "correta": false,
              "feedback": "Circula, mas fora do caixa público. Falta receita para o serviço que aquela arrecadação bancaria, e o buraco é coberto por quem não tem como deixar de pagar."
            },
            {
              "letra": "B",
              "texto": "Falta receita para serviços públicos, e a conta tende a sobrar para quem não consegue sonegar.",
              "correta": true,
              "feedback": "Sim: quem tem imposto descontado na fonte ou compra com nota sustenta a parte que faltou. É daí que nascem propostas opostas — uns querem fiscalizar e cobrar mais de quem tem renda alta, outros querem simplificar o sistema e reduzir a carga para que sonegar deixe de compensar."
            },
            {
              "letra": "C",
              "texto": "O comprador economiza, porque o tributo some da conta dele.",
              "correta": false,
              "feedback": "Em geral o preço não cai por isso: a diferença fica com o vendedor. E, sem nota, você perde a prova de compra para garantia e troca."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Ferramentas de fiscalização",
        "conteudo": {
          "headline": "Quais destes você já usou: portal da transparência, pedido pela Lei de Acesso à Informação, consulta pública do Banco Central?",
          "subtitulo": "Vale a estimativa: se você já abriu um portal de gastos por curiosidade, conta.",
          "campos": [
            {
              "id": "valor",
              "emoji": "🔎",
              "label": "Ferramentas que você já usou",
              "tipo": "faixa",
              "opcoes": [
                {
                  "label": "Nenhum deles",
                  "valor": "0"
                },
                {
                  "label": "Um deles",
                  "valor": "1"
                },
                {
                  "label": "Dois deles",
                  "valor": "2"
                },
                {
                  "label": "Os três",
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
        "label": "Fiscalizar é parte do preço",
        "conteudo": {
          "headline": "Fiscalizar é a parte do preço que quase ninguém cobra",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor == 0",
              "mensagem": "São três portas ainda fechadas. Uma consulta simples no portal do seu município costuma ser o caminho mais curto para abrir a primeira.",
              "cor": "yellow"
            },
            {
              "condicao": "valor <= 2",
              "mensagem": "Você já sabe que os dados existem. O passo seguinte é comparar o que foi orçado, o que foi pago e o que ficou pronto — números que alimentam os dois lados do debate: quem considera a carga alta demais e quem considera a receita insuficiente para os serviços.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Você usa o instrumental completo. Divulgar o que encontrou costuma render mais efeito do que guardar o achado para si.",
              "cor": "green"
            }
          ],
          "insightDinamico": "Você marcou: {valorCru}. Os três canais são públicos e gratuitos: o portal da transparência mostra contratos e repasses, a Lei de Acesso à Informação obriga o órgão a responder em até 20 dias e o Banco Central abre consulta antes de mudar regras que afetam sua conta. Fiscalizar não resolve a discussão sobre quanto e de quem cobrar — mas dá base para participar dela.\n\nPróximo passo: Procure no portal da transparência do seu município quanto foi gasto na escola mais próxima."
        }
      }
    ]
  },
  {
    "slug": "o-termometro-da-economia",
    "titulo": "O termômetro da economia",
    "subtitulo": "Selic, inflação, câmbio e PIB no seu extrato",
    "tipoPerfil": "em",
    "publico": "em",
    "ordem": 24,
    "nivel": "avancado",
    "situacoes": [],
    "tags": [
      "cambio",
      "economia",
      "em13lf",
      "ensino-medio",
      "indicadores",
      "inflacao",
      "pib",
      "selic"
    ],
    "duracaoMin": 2,
    "xp": 50,
    "habilidades": [
      "EM13LF03",
      "EM13LF44",
      "EM13LF46"
    ],
    "telas": [
      {
        "ordem": 0,
        "tipo": "conceito",
        "label": "Cinco números do noticiário",
        "conteudo": {
          "headline": "Nenhum deles é abstrato: cada um chega ao seu bolso por algum caminho.",
          "corpo": "Cinco números resumem o noticiário. Inflação: seu dinheiro compra menos a cada mês. Selic: a taxa básica que encarece o crédito e melhora o rendimento da renda fixa. Desemprego alto: mais gente disputando a vaga ou o freela que você quer. PIB: o tamanho do que o país produz, e o que sobra para contratar. Dívida pública: juro do governo disputando espaço com escola e saúde no orçamento."
        }
      },
      {
        "ordem": 1,
        "tipo": "cenario",
        "label": "O dólar mexeu",
        "conteudo": {
          "headline": "A alta do dólar foi boa ou ruim para Vinícius — e para quem não recebe em dólar?",
          "personagem": "Vinícius",
          "linhas": [
            {
              "label": "US$ 600 quando o dólar valia R$ 5,20",
              "valor": 3120,
              "tipo": "entrada"
            },
            {
              "label": "Os mesmos US$ 600 com o dólar a R$ 5,90",
              "valor": 3540,
              "tipo": "entrada"
            },
            {
              "label": "Notebook importado, antes",
              "valor": 6000,
              "tipo": "saida"
            },
            {
              "label": "…e depois",
              "valor": 6700,
              "tipo": "saida"
            }
          ],
          "rodape": "Vinícius, 27 anos, edita vídeo para um cliente nos Estados Unidos e recebe US$ 600 por mês. Quando fechou o contrato, o dólar valia R$ 5,20 — R$ 3.120. Meses depois, com o dólar a R$ 5,90, os mesmos US$ 600 viraram R$ 3.540, sem ele cobrar um centavo a mais. No mesmo período, o notebook importado que ele queria subiu de R$ 6.000 para R$ 6.700. Valores de exemplo, não a cotação de hoje."
        }
      },
      {
        "ordem": 2,
        "tipo": "quiz",
        "label": "Quando a moeda oscila",
        "conteudo": {
          "headline": "Uma crise geopolítica no exterior faz investidores correrem para o dólar, que sobe frente ao real. No Brasil, o efeito imediato é:",
          "opcoes": [
            {
              "letra": "A",
              "texto": "Todo mundo perde poder de compra, sem exceção.",
              "correta": false,
              "feedback": "Quem exporta ou recebe em moeda estrangeira passa a receber mais reais. O efeito depende de que lado da troca você está."
            },
            {
              "letra": "B",
              "texto": "Importado e viagem ficam mais caros; quem exporta ou recebe em moeda estrangeira ganha mais reais.",
              "correta": true,
              "feedback": "Isso. E o encarecimento de combustível e insumos importados costuma chegar aos preços internos algumas semanas depois."
            },
            {
              "letra": "C",
              "texto": "Nada muda para quem só compra produto nacional.",
              "correta": false,
              "feedback": "Muda: trigo, fertilizante, chip e combustível são cotados em dólar e entram no custo de coisas fabricadas aqui."
            }
          ]
        }
      },
      {
        "ordem": 3,
        "tipo": "input",
        "label": "Sua leitura da inflação",
        "conteudo": {
          "headline": "Na sua percepção, quanto os preços subiram no Brasil nos últimos 12 meses, em porcentagem?",
          "subtitulo": "Chute pela sua experiência de compra; não precisa consultar índice nenhum.",
          "campos": [
            {
              "id": "valor",
              "emoji": "🌡️",
              "label": "Sua leitura da inflação, 12 meses",
              "tipo": "decimal",
              "placeholder": "6"
            }
          ]
        }
      },
      {
        "ordem": 4,
        "tipo": "resultado",
        "label": "Seu número contra o mundo",
        "conteudo": {
          "headline": "Você sentiu <strong>{valorCru}%</strong> em 12 meses",
          "formula": "valor_direto",
          "faixas": [
            {
              "condicao": "valor < 4",
              "mensagem": "Sua percepção está na faixa de países de inflação baixa. Se a sua cesta subiu menos que a média, ela provavelmente é diferente da cesta média brasileira.",
              "cor": "green"
            },
            {
              "condicao": "valor <= 12",
              "mensagem": "É a faixa em que o Brasil costuma se mover. Vale comparar outro dado: o juro do rotativo do cartão aqui está entre os mais altos do mundo, o que faz a dívida das famílias crescer rápido.",
              "cor": "green"
            },
            {
              "condicao": "resto",
              "mensagem": "Você sentiu mais do que a média costuma registrar. Índice é média de muitos itens; aluguel, transporte e alimentação podem ter subido bem mais na sua conta.",
              "cor": "yellow"
            }
          ],
          "insightDinamico": "Você estimou {valorCru}. Como referência histórica, países ricos costumam operar perto de 2% ao ano, o Brasil orbitou entre 4% e 10% nas últimas duas décadas, e casos como Argentina e Turquia passaram de 40%. Quanto maior a inflação, mais alta tende a ser a Selic para segurá-la — e crédito caro esfria o PIB e o emprego, e encarece a dívida pública que o país precisa rolar.\n\nPróximo passo: Compare o preço de três itens que você compra sempre com o que pagava há um ano."
        }
      }
    ]
  }
]
