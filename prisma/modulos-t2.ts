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
]
