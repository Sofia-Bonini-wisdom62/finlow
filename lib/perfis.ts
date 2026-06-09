export type TipoPerfil = "lancador" | "guardador" | "impulsivo" | "sonhador"

export interface Pergunta {
  id: number
  texto: string
  opcoes: {
    letra: string
    texto: string
    pesos: Record<TipoPerfil, number>
  }[]
}

export const perguntas: Pergunta[] = [
  {
    id: 1,
    texto: "Você recebeu sua mesada hoje. O que você faz?",
    opcoes: [
      {
        letra: "A",
        texto: "Gasto logo no que eu tava com vontade",
        pesos: { lancador: 1, guardador: 0, impulsivo: 3, sonhador: 1 },
      },
      {
        letra: "B",
        texto: "Guardo tudo e só gasto se for necessário",
        pesos: { lancador: 0, guardador: 3, impulsivo: 0, sonhador: 1 },
      },
      {
        letra: "C",
        texto: "Gasto uma parte e guardo o resto sem muito planejamento",
        pesos: { lancador: 3, guardador: 1, impulsivo: 1, sonhador: 0 },
      },
      {
        letra: "D",
        texto: "Fico pensando em algo grande pra comprar no futuro",
        pesos: { lancador: 0, guardador: 1, impulsivo: 0, sonhador: 3 },
      },
    ],
  },
  {
    id: 2,
    texto: "Seu amigo te convida pra um show de última hora. Ingresso custa R$80. O que você faz?",
    opcoes: [
      {
        letra: "A",
        texto: "Vou sem pensar duas vezes",
        pesos: { lancador: 1, guardador: 0, impulsivo: 3, sonhador: 0 },
      },
      {
        letra: "B",
        texto: "Não vou, não estava no meu orçamento",
        pesos: { lancador: 0, guardador: 3, impulsivo: 0, sonhador: 1 },
      },
      {
        letra: "C",
        texto: "Vejo se tenho dinheiro sobrando e decido",
        pesos: { lancador: 3, guardador: 1, impulsivo: 1, sonhador: 0 },
      },
      {
        letra: "D",
        texto: "Penso que esse dinheiro poderia ir pro meu objetivo maior",
        pesos: { lancador: 0, guardador: 1, impulsivo: 0, sonhador: 3 },
      },
    ],
  },
  {
    id: 3,
    texto: "Quando você pensa em dinheiro, o que vem primeiro na sua cabeça?",
    opcoes: [
      {
        letra: "A",
        texto: "Experiências e momentos com pessoas que gosto",
        pesos: { lancador: 2, guardador: 0, impulsivo: 2, sonhador: 1 },
      },
      {
        letra: "B",
        texto: "Segurança e não ter que me preocupar",
        pesos: { lancador: 0, guardador: 3, impulsivo: 0, sonhador: 1 },
      },
      {
        letra: "C",
        texto: "Liberdade pra fazer o que quero quando quero",
        pesos: { lancador: 2, guardador: 0, impulsivo: 2, sonhador: 1 },
      },
      {
        letra: "D",
        texto: "Um objetivo grande que ainda vou conquistar",
        pesos: { lancador: 0, guardador: 1, impulsivo: 0, sonhador: 3 },
      },
    ],
  },
  {
    id: 4,
    texto: "No fim do mês, você geralmente:",
    opcoes: [
      {
        letra: "A",
        texto: "Fico sem dinheiro antes do mês acabar",
        pesos: { lancador: 1, guardador: 0, impulsivo: 3, sonhador: 1 },
      },
      {
        letra: "B",
        texto: "Tenho sempre um valor guardado",
        pesos: { lancador: 0, guardador: 3, impulsivo: 0, sonhador: 1 },
      },
      {
        letra: "C",
        texto: "Às vezes sobra, às vezes não — depende do mês",
        pesos: { lancador: 3, guardador: 1, impulsivo: 1, sonhador: 0 },
      },
      {
        letra: "D",
        texto: "Tenho dinheiro mas fico na dúvida se vale gastar ou guardar",
        pesos: { lancador: 1, guardador: 1, impulsivo: 0, sonhador: 3 },
      },
    ],
  },
]

export function calcularPerfil(respostas: string[]): TipoPerfil {
  const pontos: Record<TipoPerfil, number> = {
    lancador: 0,
    guardador: 0,
    impulsivo: 0,
    sonhador: 0,
  }

  respostas.forEach((letra, index) => {
    const pergunta = perguntas[index]
    const opcao = pergunta.opcoes.find((o) => o.letra === letra)
    if (opcao) {
      Object.entries(opcao.pesos).forEach(([perfil, peso]) => {
        pontos[perfil as TipoPerfil] += peso
      })
    }
  })

  return Object.entries(pontos).sort((a, b) => b[1] - a[1])[0][0] as TipoPerfil
}

export const descricoesPerfil: Record<
  TipoPerfil,
  { titulo: string; subtitulo: string; descricao: string; cor: string }
> = {
  lancador: {
    titulo: "Tipo Lançador",
    subtitulo: "Você gasta conforme entra — e tá na hora de mudar isso.",
    descricao:
      "Você curte a vida e não segura o dinheiro por muito tempo. Isso não é errado — mas sem um mínimo de controle, fica difícil chegar em algum lugar. A boa notícia: pequenas mudanças no seu jeito de gastar já fazem diferença.",
    cor: "#F5A623",
  },
  guardador: {
    titulo: "Tipo Guardador",
    subtitulo: "Você já sabe guardar. Agora aprende a fazer o dinheiro trabalhar.",
    descricao:
      "Você tem disciplina de sobra — e isso é raro. Mas guardar dinheiro parado não é o mesmo que investir. Tá na hora de dar o próximo passo e fazer seu dinheiro render de verdade.",
    cor: "#00C896",
  },
  impulsivo: {
    titulo: "Tipo Impulsivo",
    subtitulo: "Você decide rápido demais — e seu bolso sente.",
    descricao:
      "Você não é ruim com dinheiro, você só age antes de pensar. A virada acontece quando você cria um espaço entre o impulso e a ação. Pequenas pausas mudam tudo.",
    cor: "#E53E3E",
  },
  sonhador: {
    titulo: "Tipo Sonhador",
    subtitulo: "Você tem objetivos grandes — falta transformar em plano.",
    descricao:
      "Você sabe o que quer, mas o caminho ainda está nebuloso. A diferença entre sonho e meta é a data e o valor. Vamos transformar seus planos em números reais.",
    cor: "#805AD5",
  },
}
