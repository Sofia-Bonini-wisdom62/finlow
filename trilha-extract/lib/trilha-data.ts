export interface ChecklistItem {
  id: string
  texto: string
  contexto: string
  feito: boolean
}

export interface Modulo {
  id: string
  titulo: string
  descricao: string
  totalItens: number
  itensConcluidos: number
  desbloqueado: boolean
  itens: ChecklistItem[]
}

export const perfil = {
  nome: "Lançador",
  cor: "#00C896",
}

export const modulos: Modulo[] = [
  {
    id: "primeiros-passos",
    titulo: "Primeiros passos",
    descricao: "Entenda quanto você ganha e pra onde seu dinheiro vai.",
    totalItens: 3,
    itensConcluidos: 3,
    desbloqueado: true,
    itens: [
      {
        id: "p1",
        texto: "Anota tudo que entrou esse mês",
        contexto: "Mesada, freela, aquele bico — saber o total é o ponto de partida.",
        feito: true,
      },
      {
        id: "p2",
        texto: "Lista pra onde foi seu dinheiro",
        contexto: "Lanche, jogo, transporte. Sem julgamento, só pra enxergar.",
        feito: true,
      },
      {
        id: "p3",
        texto: "Descobre seu saldo de verdade",
        contexto: "O que sobrou (ou faltou) é o número que muda tudo.",
        feito: true,
      },
    ],
  },
  {
    id: "metas",
    titulo: "Metas que fazem sentido",
    descricao: "Defina um objetivo que te anima de verdade.",
    totalItens: 4,
    itensConcluidos: 2,
    desbloqueado: true,
    itens: [
      {
        id: "m1",
        texto: "Escolhe uma meta concreta",
        contexto: "Um tênis, um curso, uma viagem. Quanto mais claro, mais fácil chegar.",
        feito: true,
      },
      {
        id: "m2",
        texto: "Coloca um valor e uma data",
        contexto: "Meta sem prazo vira sonho. Com prazo vira plano.",
        feito: true,
      },
      {
        id: "m3",
        texto: "Quebra a meta em pedaços mensais",
        contexto: "R$ 600 em 3 meses parece menos assustador que R$ 600 de uma vez.",
        feito: false,
      },
      {
        id: "m4",
        texto: "Decide de onde sai o dinheiro",
        contexto: "Saber qual renda alimenta a meta evita furar o plano.",
        feito: false,
      },
    ],
  },
  {
    id: "guardar",
    titulo: "Guardar sem sofrer",
    descricao: "Crie o hábito de separar uma parte antes de gastar.",
    totalItens: 4,
    itensConcluidos: 0,
    desbloqueado: true,
    itens: [
      {
        id: "g1",
        texto: "Separa uma % assim que o dinheiro entra",
        contexto: "Guardar primeiro e gastar o resto funciona melhor que o contrário.",
        feito: false,
      },
      {
        id: "g2",
        texto: "Escolhe onde guardar",
        contexto: "Um lugar separado evita gastar sem perceber.",
        feito: false,
      },
      {
        id: "g3",
        texto: "Define uma regra simples pra você",
        contexto: "Tipo: 'todo Pix que recebo, 20% vai pro cofre'.",
        feito: false,
      },
      {
        id: "g4",
        texto: "Confere seu progresso uma vez por semana",
        contexto: "Ver o valor subindo é o que mantém a motivação.",
        feito: false,
      },
    ],
  },
  {
    id: "gastar-melhor",
    titulo: "Gastar melhor",
    descricao: "Aprenda a decidir antes de comprar por impulso.",
    totalItens: 3,
    itensConcluidos: 0,
    desbloqueado: false,
    itens: [
      {
        id: "gm1",
        texto: "Usa a regra das 24 horas",
        contexto: "Esperar um dia antes de comprar mata metade dos impulsos.",
        feito: false,
      },
      {
        id: "gm2",
        texto: "Compara preço antes de fechar",
        contexto: "Dois minutos de pesquisa podem render um bom desconto.",
        feito: false,
      },
      {
        id: "gm3",
        texto: "Diferencia querer de precisar",
        contexto: "As duas coisas valem — mas saber qual é qual ajuda a escolher.",
        feito: false,
      },
    ],
  },
  {
    id: "renda-extra",
    titulo: "Fazer render mais",
    descricao: "Descubra formas de aumentar o que entra.",
    totalItens: 4,
    itensConcluidos: 0,
    desbloqueado: false,
    itens: [
      {
        id: "r1",
        texto: "Lista o que você sabe fazer",
        contexto: "Edição, design, aulas, vendas — tudo isso pode virar grana.",
        feito: false,
      },
      {
        id: "r2",
        texto: "Calcula quanto vale seu tempo",
        contexto: "Saber seu valor evita aceitar bico que não compensa.",
        feito: false,
      },
      {
        id: "r3",
        texto: "Faz o primeiro freela ou venda",
        contexto: "O primeiro é o mais difícil. Depois vira hábito.",
        feito: false,
      },
      {
        id: "r4",
        texto: "Guarda parte do que ganhou a mais",
        contexto: "Renda extra que some não muda nada. Guardada, sim.",
        feito: false,
      },
    ],
  },
  {
    id: "futuro",
    titulo: "Pensar no futuro",
    descricao: "Comece a entender investimentos do seu jeito.",
    totalItens: 3,
    itensConcluidos: 0,
    desbloqueado: false,
    itens: [
      {
        id: "f1",
        texto: "Entende o que são juros a seu favor",
        contexto: "O dinheiro pode trabalhar por você — e quanto antes, melhor.",
        feito: false,
      },
      {
        id: "f2",
        texto: "Conhece opções simples e seguras",
        contexto: "Dá pra começar com pouco e sem risco maluco.",
        feito: false,
      },
      {
        id: "f3",
        texto: "Simula seu dinheiro crescendo",
        contexto: "Ver o quanto vira em alguns anos muda sua cabeça.",
        feito: false,
      },
    ],
  },
]

export function getModulo(id: string): Modulo | undefined {
  return modulos.find((m) => m.id === id)
}
