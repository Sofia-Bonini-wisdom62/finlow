import type { Nivel, Situacao } from "@/lib/situacoes"

/**
 * Os 16 módulos da Temporada 1, reclassificados no schema da biblioteca
 * (recomendação 4 do backlog T2).
 *
 * Isto vem ANTES de escrever módulo novo, e não por burocracia: sem saber o que
 * a T1 já cobre, o backlog de 27 escreveria de novo o que existe. As
 * sobreposições encontradas estão registradas em `SOBREPOSICOES` abaixo — três
 * delas passam da regra dos 70%.
 *
 * `situacoes: []` é classificação, não ausência dela: quer dizer "serve pra
 * todo mundo". Os quatro módulos do Guardador caem aí porque o vocabulário de
 * situações é todo de déficit e eles são para quem já guarda bem.
 */

export interface ClassificacaoModulo {
  slug: string
  nivel: Nivel
  situacoes: Situacao[]
  tags: string[]
}

export const CLASSIFICACAO_T1: ClassificacaoModulo[] = [
  // --- fluxo de caixa: o dinheiro entra e some ---------------------------
  {
    slug: "lancador-m1-fluxo",
    nivel: "iniciante",
    situacoes: ["sem_reserva", "renda_variavel"],
    tags: ["fluxo", "gastos", "extrato", "consciencia", "para-onde-vai"],
  },
  {
    slug: "lancador-m2-respiro",
    nivel: "iniciante",
    situacoes: ["sem_reserva", "renda_variavel"],
    tags: ["pague-se-primeiro", "guardar", "ordem", "automatico", "sobra"],
  },
  {
    slug: "lancador-m3-meta-ancora",
    nivel: "iniciante",
    situacoes: ["sem_reserva"],
    tags: ["meta", "reserva", "destino", "ancora", "sobra"],
  },
  {
    slug: "lancador-m4-freio",
    nivel: "iniciante",
    situacoes: ["divida_rotativa", "sem_reserva"],
    tags: ["impulso", "pausa", "freio", "gasto-grande", "24-horas"],
  },

  // --- compra por impulso ------------------------------------------------
  {
    slug: "impulsivo-m1-gatilho",
    nivel: "iniciante",
    situacoes: ["divida_rotativa"],
    tags: ["impulso", "gatilho", "emocao", "compra", "autoconhecimento"],
  },
  {
    slug: "impulsivo-m2-pausa",
    nivel: "iniciante",
    situacoes: ["divida_rotativa"],
    tags: ["pausa", "impulso", "tecnica", "autocontrole"],
  },
  {
    slug: "impulsivo-m3-substituto",
    nivel: "intermediario",
    situacoes: ["divida_rotativa"],
    tags: ["substituicao", "habito", "emocao", "alivio"],
  },
  {
    slug: "impulsivo-m4-lista",
    nivel: "intermediario",
    situacoes: ["divida_rotativa", "sem_reserva"],
    tags: ["lista-de-desejos", "decisao", "adiamento", "compra"],
  },

  // --- guarda bem, falta usar e render -----------------------------------
  // Os quatro sem situação: o vocabulário não tem "já guarda bem", e forçar
  // um déficit aqui recomendaria a aula errada para a pessoa errada.
  {
    slug: "guardador-m1-permissao",
    nivel: "intermediario",
    situacoes: [],
    tags: ["permissao", "gastar", "culpa", "equilibrio"],
  },
  {
    slug: "guardador-m2-valor-livre",
    nivel: "intermediario",
    situacoes: [],
    tags: ["valor-livre", "orcamento", "gastar-sem-culpa", "regra"],
  },
  {
    slug: "guardador-m3-investir",
    nivel: "intermediario",
    situacoes: [],
    tags: ["inflacao", "dinheiro-parado", "poder-de-compra", "render"],
  },
  {
    slug: "guardador-m4-prazer",
    nivel: "intermediario",
    situacoes: [],
    tags: ["prazer", "recompensa", "planejamento", "data-marcada"],
  },

  // --- metas e planos ----------------------------------------------------
  {
    slug: "sonhador-m1-sonho-prazo",
    nivel: "iniciante",
    situacoes: [],
    tags: ["meta", "objetivo", "prazo", "sonho", "escolher"],
  },
  {
    slug: "sonhador-m2-passo-minimo",
    nivel: "iniciante",
    situacoes: ["sem_reserva"],
    tags: ["primeiro-passo", "meta", "aporte", "comecar"],
  },
  {
    slug: "sonhador-m3-realidade",
    nivel: "intermediario",
    situacoes: ["renda_variavel"],
    tags: ["meta", "calculo", "realidade", "aporte", "teste"],
  },
  {
    slug: "sonhador-m4-revisao",
    nivel: "intermediario",
    situacoes: [],
    tags: ["revisao", "ritual", "habito", "acompanhamento"],
  },
]

/**
 * Onde o backlog T2 repetiria o que a T1 já tem.
 *
 * A recomendação 4 manda fundir quando a cobertura passa de 70%. Estas são as
 * que passam, e o que sobra de novo em cada caso.
 */
export const SOBREPOSICOES = [
  {
    t1: ["guardador-m3-investir"],
    t2: ["M22 Inflação e poder de compra", "M24 Selic, CDI e poupança"],
    cobertura: "alta",
    veredito:
      "'Dinheiro parado encolhe' JÁ É a aula de inflação corroendo o dinheiro " +
      "parado. M22 repetiria a tese inteira. O que M22 tem de novo é só o " +
      "vocabulário (nominal x real, IPCA/INPC/IGP-M) e M24, a mecânica de " +
      "Selic e CDI. Fundir: guardador-m3 vira a porta, M22/M24 viram o " +
      "aprofundamento de quem quer o nome das coisas.",
  },
  {
    t1: ["sonhador-m1-sonho-prazo", "sonhador-m2-passo-minimo", "sonhador-m3-realidade"],
    t2: ["M17 Metas grandes do adulto"],
    cobertura: "alta",
    veredito:
      "A T1 já faz meta → número → prazo → aporte → teste de realidade, que é " +
      "exatamente o card flow proposto para M17. O que M17 tem de próprio é o " +
      "CONTEXTO adulto (entrada de imóvel, casamento, voltar a estudar), não a " +
      "mecânica. M17 deve ser escrito como aplicação desses três, citando-os, " +
      "não como aula de 'como montar uma meta'.",
  },
  {
    t1: ["lancador-m4-freio", "impulsivo-m2-pausa"],
    t2: ["M05 Impulso e o parcelado sem juros"],
    cobertura: "parcial",
    veredito:
      "A pausa de 24h está feita duas vezes na T1. O que M05 traz de novo é a " +
      "aritmética do parcelado: somar parcelas em aberto e ver quanto do mês " +
      "que vem já foi. M05 deve focar nisso e apontar para a pausa que já " +
      "existe, em vez de ensiná-la pela terceira vez.",
  },
  {
    t1: ["lancador-m3-meta-ancora"],
    t2: ["M03 Reserva de emergência"],
    cobertura: "baixa",
    veredito:
      "Complementares, manter as duas. A T1 dá DESTINO ao que sobra ('reserva " +
      "sem destino evapora'); M03 dimensiona o colchão (3 a 6 meses de custo " +
      "fixo) e trata de liquidez. São perguntas diferentes.",
  },
] as const
