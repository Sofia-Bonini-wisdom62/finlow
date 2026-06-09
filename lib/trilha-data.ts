import type { TipoPerfil } from "./perfis"

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
  tipoPerfil: TipoPerfil
  ordem: number
  totalItens: number
  itensConcluidos: number
  desbloqueado: boolean
  itens: ChecklistItem[]
}

const modulosPorPerfil: Record<TipoPerfil, Omit<Modulo, "itensConcluidos" | "desbloqueado">[]> = {
  lancador: [
    {
      id: "lancador-1",
      titulo: "Entende pra onde vai seu dinheiro",
      descricao: "O primeiro passo é saber o que entra e o que sai. Sem isso, qualquer plano vai por água abaixo.",
      tipoPerfil: "lancador",
      ordem: 1,
      totalItens: 4,
      itens: [
        { id: "l1-1", texto: "Anota quanto dinheiro você recebeu esse mês", contexto: "Você não pode controlar o que não consegue enxergar.", feito: false },
        { id: "l1-2", texto: "Lista os 5 maiores gastos da semana passada", contexto: "A maioria das pessoas se surpreende com o que acha.", feito: false },
        { id: "l1-3", texto: "Escolhe um app ou caderno pra registrar gastos por 7 dias", contexto: "Não precisa ser perfeito — precisa ser consistente.", feito: false },
        { id: "l1-4", texto: "Calcula quanto sobrou (ou faltou) no mês", contexto: "Esse número é o ponto de partida da sua virada.", feito: false },
      ],
    },
    {
      id: "lancador-2",
      titulo: "Cria sua primeira reserva",
      descricao: "Antes de qualquer investimento, você precisa de um colchão de segurança. Pequeno, mas seu.",
      tipoPerfil: "lancador",
      ordem: 2,
      totalItens: 3,
      itens: [
        { id: "l2-1", texto: "Define um valor fixo pra guardar todo mês (pode ser R$20)", contexto: "O valor não importa tanto quanto o hábito.", feito: false },
        { id: "l2-2", texto: "Abre uma conta separada pra sua reserva", contexto: "Dinheiro misturado com o do dia a dia some rápido.", feito: false },
        { id: "l2-3", texto: "Faz o primeiro depósito na reserva hoje", contexto: "Começar pequeno é melhor que não começar.", feito: false },
      ],
    },
  ],
  guardador: [
    {
      id: "guardador-1",
      titulo: "Faz seu dinheiro render",
      descricao: "Guardar é ótimo. Mas dinheiro parado na conta corrente perde valor todo mês por causa da inflação.",
      tipoPerfil: "guardador",
      ordem: 1,
      totalItens: 4,
      itens: [
        { id: "g1-1", texto: "Descobre quanto rende sua poupança atual", contexto: "A poupança paga menos que a inflação na maioria dos meses.", feito: false },
        { id: "g1-2", texto: "Pesquisa sobre CDB com liquidez diária", contexto: "Rende mais que a poupança e você saca quando quiser.", feito: false },
        { id: "g1-3", texto: "Compara dois bancos digitais (ex: Nubank e Inter)", contexto: "Pequenas diferenças de rendimento fazem diferença no longo prazo.", feito: false },
        { id: "g1-4", texto: "Move pelo menos parte da sua reserva pra um investimento melhor", contexto: "Você já guarda bem — agora guarda de forma mais inteligente.", feito: false },
      ],
    },
    {
      id: "guardador-2",
      titulo: "Define um objetivo com prazo e valor",
      descricao: "Você tem disciplina. O que falta é uma meta concreta pra direcionar essa energia.",
      tipoPerfil: "guardador",
      ordem: 2,
      totalItens: 3,
      itens: [
        { id: "g2-1", texto: "Escreve um objetivo financeiro que quer alcançar em 6 meses", contexto: "Meta sem prazo é só desejo.", feito: false },
        { id: "g2-2", texto: "Calcula quanto precisa guardar por mês pra chegar lá", contexto: "Divide o valor total pelos meses disponíveis.", feito: false },
        { id: "g2-3", texto: "Cria uma conta ou aplicação exclusiva pra esse objetivo", contexto: "Separar o dinheiro da meta evita que ele seja gasto.", feito: false },
      ],
    },
  ],
  impulsivo: [
    {
      id: "impulsivo-1",
      titulo: "Cria um freio antes de gastar",
      descricao: "Você não é ruim com dinheiro — você decide rápido demais. Um pequeno ritual muda tudo.",
      tipoPerfil: "impulsivo",
      ordem: 1,
      totalItens: 4,
      itens: [
        { id: "i1-1", texto: "Adota a regra das 24h: espera um dia antes de qualquer compra acima de R$50", contexto: "A maioria dos impulsos some em menos de um dia.", feito: false },
        { id: "i1-2", texto: "Cria uma lista de desejos (wishlist) no celular", contexto: "Colocar na lista alivia o impulso sem gastar nada.", feito: false },
        { id: "i1-3", texto: "Revisa a wishlist depois de 7 dias e vê o que ainda quer", contexto: "Você vai se surpreender com o que perdeu a graça.", feito: false },
        { id: "i1-4", texto: "Calcula quanto economizou com essa regra no primeiro mês", contexto: "Ver o número concreto é motivador pra continuar.", feito: false },
      ],
    },
    {
      id: "impulsivo-2",
      titulo: "Cria um orçamento que não sufoca",
      descricao: "Orçamento rígido não funciona pra você. Vamos criar um que tem espaço pra curtir a vida.",
      tipoPerfil: "impulsivo",
      ordem: 2,
      totalItens: 3,
      itens: [
        { id: "i2-1", texto: "Separa uma parte fixa do mês só pra gastos livres (ex: 30%)", contexto: "Ter um limite pra gastar sem culpa é libertador.", feito: false },
        { id: "i2-2", texto: "Quando esse valor acabar, para de gastar até o mês seguinte", contexto: "A regra simples é mais fácil de seguir que planilhas complexas.", feito: false },
        { id: "i2-3", texto: "Faz isso por 30 dias e anota como se sentiu", contexto: "Consciência é o primeiro passo pra mudança real.", feito: false },
      ],
    },
  ],
  sonhador: [
    {
      id: "sonhador-1",
      titulo: "Transforma sonho em meta com número",
      descricao: "Você tem objetivos grandes. Falta dar um número e uma data pra cada um — aí vira plano.",
      tipoPerfil: "sonhador",
      ordem: 1,
      totalItens: 4,
      itens: [
        { id: "s1-1", texto: "Escreve seu maior objetivo financeiro hoje", contexto: "Colocar no papel torna real o que é só imaginação.", feito: false },
        { id: "s1-2", texto: "Pesquisa quanto custa esse objetivo (valor real)", contexto: "Número vago = plano vago. Pesquisa o preço real.", feito: false },
        { id: "s1-3", texto: "Define uma data realista pra chegar lá", contexto: "Sem prazo, qualquer dia serve — e qualquer dia nunca chega.", feito: false },
        { id: "s1-4", texto: "Calcula quanto precisa guardar por mês pra atingir o valor", contexto: "Divide o valor pela quantidade de meses. Simples assim.", feito: false },
      ],
    },
    {
      id: "sonhador-2",
      titulo: "Dá o primeiro passo concreto",
      descricao: "Planejar é fácil. O que diferencia é agir — mesmo que seja um passo pequeno.",
      tipoPerfil: "sonhador",
      ordem: 2,
      totalItens: 3,
      itens: [
        { id: "s2-1", texto: "Abre uma conta ou aplicação exclusiva pra esse objetivo", contexto: "Dinheiro misturado com o cotidiano nunca chega lá.", feito: false },
        { id: "s2-2", texto: "Faz o primeiro depósito, mesmo que seja R$10", contexto: "O primeiro passo quebra a inércia. O tamanho não importa.", feito: false },
        { id: "s2-3", texto: "Configura um lembrete mensal pra depositar no dia fixo", contexto: "Automatizar o hábito é mais eficiente que depender da vontade.", feito: false },
      ],
    },
  ],
}

export function getModulosPorPerfil(tipo: TipoPerfil, progresso: Record<string, boolean> = {}): Modulo[] {
  const base = modulosPorPerfil[tipo]
  return base.map((m, idx) => {
    const itensComProgresso = m.itens.map((item) => ({
      ...item,
      feito: progresso[item.id] ?? false,
    }))
    const itensConcluidos = itensComProgresso.filter((i) => i.feito).length
    const desbloqueado = idx === 0 || (base[idx - 1] !== undefined && getItensConcluidos(base[idx - 1], progresso) === base[idx - 1].totalItens)
    return {
      ...m,
      itens: itensComProgresso,
      itensConcluidos,
      desbloqueado,
    }
  })
}

function getItensConcluidos(m: Omit<Modulo, "itensConcluidos" | "desbloqueado">, progresso: Record<string, boolean>) {
  return m.itens.filter((i) => progresso[i.id] ?? false).length
}

export function getModulo(id: string, tipo: TipoPerfil, progresso: Record<string, boolean> = {}): Modulo | undefined {
  return getModulosPorPerfil(tipo, progresso).find((m) => m.id === id)
}
