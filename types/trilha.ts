export type TipoPerfil = "lancador" | "guardador" | "impulsivo" | "sonhador"
export type TipoTela = "conceito" | "cenario" | "quiz" | "input" | "resultado"

export interface ConteudoConceito {
  headline: string
  corpo: string
  insight?: {
    label: string
    texto: string
  }
}

export interface LinhaCenario {
  label: string
  valor: number
  tipo: "entrada" | "saida" | "saldo"
  valorTexto?: string // se presente, renderiza este texto no lugar do valor (ex: "— sem número")
}

export interface ConteudoCenario {
  headline: string
  personagem?: string
  /**
   * A tabelinha de entradas e saídas. OPCIONAL desde a trilha escolar.
   *
   * No produto adulto o cenário é uma conta: três linhas e um saldo, e a
   * tabela é o que a tela existe para mostrar. No Fundamental o cenário é uma
   * HISTÓRIA — "Alessandra foi à feira com a avó e entregou uma cédula de 10
   * reais" — e não há entrada, saída nem saldo para tabelar. Fabricar linhas
   * ali seria inventar dado que a fonte não tem, para preencher um componente.
   */
  linhas?: LinhaCenario[]
  /** A história, quando o cenário é narrativo em vez de numérico. */
  narrativa?: string
  rodape?: string
}

export interface OpcaoQuiz {
  letra: string
  texto: string
  correta: boolean
  feedback: string
}

export interface ConteudoQuiz {
  headline: string
  opcoes: OpcaoQuiz[]
}

export interface OpcaoFaixa {
  label: string // "R$ 30–70"
  valor: string // "50" — valor representativo (ponto médio) usado nos cálculos
}

export interface CampoInput {
  id: string
  emoji: string
  label: string
  placeholder?: string // faixa não usa
  tipo: "decimal" | "texto" | "faixa"
  opcoes?: OpcaoFaixa[] // obrigatório quando tipo === "faixa"
}

export interface ConteudoInput {
  headline: string
  subtitulo?: string
  aviso?: string
  campos: CampoInput[]
}

export type CorFaixa = "green" | "yellow" | "red"

export interface FaixaResultado {
  condicao: string
  mensagem: string
  cor: CorFaixa
}

export interface ConteudoResultado {
  headline: string
  formula?: string
  faixas?: FaixaResultado[]
  insightDinamico?: string
}

export type ConteudoTela =
  | ConteudoConceito
  | ConteudoCenario
  | ConteudoQuiz
  | ConteudoInput
  | ConteudoResultado

export interface TelaData {
  id: string
  ordem: number
  tipo: TipoTela
  label: string
  conteudo: ConteudoTela
  /** Instrução para quem acompanha a criança. Ver `Tela.mediacao` no schema. */
  mediacao?: string | null
}

export interface ModuloData {
  id: string
  slug: string
  titulo: string
  subtitulo: string
  tipoPerfil: TipoPerfil
  ordem: number
  xp: number
  telas: TelaData[]
}

export type SessaoFluxo = Record<string, string>
