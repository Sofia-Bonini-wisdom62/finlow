/**
 * As decisões que a fonte do Fundamental NÃO resolve.
 *
 * Separado do conversor de propósito, como em `editorial-em.ts`: dá para
 * revisar as escolhas sem ler código. A diferença é o tamanho — aqui só entram
 * exceções, porque `scripts/portar-ef.mts` deriva o resto da própria fonte.
 * Entrada vazia é o normal, e a maioria dos 83 módulos não tem entrada nenhuma.
 *
 * `cores`: por índice de faixa. O padrão é verde, e isso é decisão: no
 * Fundamental a tela de resultado devolve o que a criança respondeu, não a
 * julga. "Você encontrou 3 moedas" não é bom nem ruim.
 *
 * ---------------------------------------------------------------------------
 * POR QUE SETE MÓDULOS TROCAM TEXTO LIVRE POR ESCOLHA
 *
 * A fonte escreveu, nesses sete, regras de resultado que só um humano lendo a
 * resposta consegue avaliar: "a profissão tira algo da natureza", "o anúncio
 * não informava CET", "a resposta envolve energia". O campo era texto livre e o
 * motor de faixas compara número — não existe regra determinística que decida
 * se "costureira" tira algo da natureza.
 *
 * Havia duas saídas, e as duas mexem no conteúdo: deixar uma mensagem só (e
 * perder as três devolutivas que o autor escreveu para os três casos), ou
 * transformar a pergunta em escolha usando as categorias que a PRÓPRIA regra já
 * nomeia. A fundadora escolheu a segunda (07/08/2026), que é a que preserva o
 * material: as três mensagens continuam existindo e continuam sendo alcançadas.
 *
 * As opções abaixo não foram inventadas — cada uma é a categoria escrita na
 * condição da fonte, com os exemplos que ela mesma dá entre parênteses. Onde a
 * pergunta pedia para escrever ("Cite uma habilidade…"), ela vira pergunta de
 * escolha, senão o enunciado pediria uma coisa e a tela ofereceria outra.
 */

export interface EditorialModuloEF {
  emoji?: string
  cores?: ("green" | "yellow" | "red")[]
  /** Condição já na gramática de lib/resultado.ts, por índice de faixa. */
  condicoes?: string[]
  /** Troca o campo por uma escolha entre estas opções. */
  opcoes?: string[]
  /** Reescreve o enunciado, quando `opcoes` muda a natureza da pergunta. */
  pergunta?: string
}

export const EDITORIAL_EF: Record<string, EditorialModuloEF> = {
  // ---- texto livre → escolha (as três categorias da própria regra) ----

  "ef35-trabalho-e-profissoes": {
    emoji: "🧰",
    pergunta: "Pense numa profissão que existe onde você mora. O que essa pessoa faz?",
    opcoes: [
      "Tira algo da natureza: planta, pesca ou cria animais",
      "Transforma matéria-prima: fábrica, padaria, marcenaria",
      "Atende pessoas: escola, ônibus, salão, loja",
    ],
    condicoes: ["valor == 1", "valor == 2"],
  },

  "ef67-credito-pra-que-serve": {
    emoji: "🏠",
    pergunta:
      "Pense numa situação da sua casa ou do seu bairro em que pegar crédito resolveria algo. Qual delas é?",
    opcoes: [
      "Uma necessidade urgente ou uma ferramenta de trabalho",
      "Um desejo de consumo que pode esperar",
      "Algo para tocar um negócio",
    ],
    condicoes: ["valor == 1", "valor == 2"],
  },

  "ef89-endividado-ou-inadimplente": {
    emoji: "🌱",
    pergunta: "Que tipo de projeto do seu bairro entraria numa linha de crédito verde?",
    opcoes: [
      "Energia: painel solar, iluminação",
      "Água, lixo ou saneamento",
      "Não sei, ou não tem relação com meio ambiente",
    ],
    condicoes: ["valor == 1", "valor == 2"],
  },

  "ef89-o-que-determina-sua-renda": {
    emoji: "🎯",
    pergunta: "Que tipo de habilidade você quer ter até os 18 anos para aumentar sua renda?",
    opcoes: [
      "Técnica e específica: solda, programação, um idioma",
      "Ampla: comunicação, organização, liderança",
      "Ainda não sei",
    ],
    condicoes: ["valor == 1", "valor == 2"],
  },

  /**
   * Aqui o campo era percentual, e a PRIMEIRA regra falava da ausência do dado
   * ("o anúncio não informava CET"). Número nenhum representa ausência: 0 seria
   * confundido com CET zero, que é justamente o que a aula ensina a duvidar.
   * Vira escolha com as três respostas possíveis da própria fonte.
   */
  "ef89-contrato-de-credito": {
    emoji: "🧾",
    pergunta:
      "Pegue um anúncio de parcelamento que você viu esta semana. O que ele diz sobre o CET mensal?",
    opcoes: [
      "O anúncio não informava o CET",
      "Até 3% ao mês",
      "Mais de 3% ao mês",
    ],
    condicoes: ["valor == 1", "valor == 2"],
    cores: ["yellow", "green", "red"],
  },

  // ---- já eram escolha; só a regra vinha em prosa ----

  /** As cinco opções da fonte; a regra agrupa 1, 2 e 5 como causa externa. */
  "ef67-quando-nao-paga": {
    condicoes: ["valor em 1,2,5", "valor == 3"],
  },

  /** "médio, técnico ou faculdade" são a 2ª, 3ª e 4ª opções. */
  "ef67-estudo-desigualdade-lucro": {
    condicoes: ["valor == 1", "valor em 2,3,4"],
  },
}
