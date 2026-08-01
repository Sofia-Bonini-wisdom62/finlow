/**
 * As abas do app, em ordem.
 *
 * POR QUE ISTO NÃO MORA DENTRO DO COMPONENTE
 * A lista não é só desenho. O mapa que o assistente lê (`lib/app-mapa.ts`)
 * descreve caminhos que COMEÇAM numa aba — "Perfil > Análises". Quando a
 * navegação muda e o mapa não muda junto, o assistente passa a mandar a pessoa
 * tocar numa aba que não existe mais, com toda a confiança do mundo. Foi o que
 * aconteceu quando Análises e Painel deixaram de ser abas.
 *
 * Com a lista aqui, `scripts/testar-mapa.mts` compara as duas coisas e o teste
 * quebra antes de a resposta errada chegar em alguém.
 *
 * O ícone fica no componente: é a única parte disto que é mesmo desenho.
 */
export interface Aba {
  href: string
  label: string
}

/**
 * Quatro é o teto do celular. Com cinco, cada alvo cai para menos de 75px de
 * largura num iPhone SE, e alvo apertado erra o toque justamente em quem tem o
 * polegar grande ou a mão trêmula.
 */
export const ABAS: Aba[] = [
  { href: "/chat", label: "Chat" },
  { href: "/trilha", label: "Trilha" },
  { href: "/perfil", label: "Perfil" },
  { href: "/ajustes", label: "Menu" },
]
