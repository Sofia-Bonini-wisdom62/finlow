import type { LinhaCenario, OpcaoFaixa, CorFaixa } from "@/types/trilha"

/**
 * As decisões que o porte da trilha de Ensino Médio NÃO consegue tomar sozinho.
 *
 * `scripts/portar-em.mts` converte a fonte (`prisma/trilha-em-fonte.ts`) para o
 * contrato que os componentes leem. Quase tudo é mecânico — `destaque` vira
 * `headline`, `alternativas` vira `opcoes`. Quatro coisas não são:
 *
 * 1. **As linhas do cenário.** O componente mostra uma tabelinha de valores; a
 *    fonte entrega prosa com os números embutidos. Alguém precisa dizer QUAIS
 *    números viram linha, e o que é entrada, saída ou saldo.
 *
 * 2. **A cor de cada faixa.** Verde, amarelo e vermelho não saem do texto. A
 *    régua aqui: vermelho só onde existe risco financeiro de verdade (mês no
 *    vermelho, mais da metade da renda comprometida, alarme de golpe que toca
 *    tarde). O resto é verde ou amarelo — o produto promete "tom calmo, sem
 *    alarme", e vermelho em constatação neutra é alarme.
 *
 * 3. **As condições, reescritas.** A fonte escreve `valor entre 4 e 12` e
 *    `valor == 'Todos'`; o motor (lib/resultado.ts) só entende
 *    `<campo> <op> <numero>`, sem `e`, sem texto — e sem `eval`, o que é a
 *    razão de ele ser limitado assim. Como `avaliarFaixa` devolve a PRIMEIRA
 *    que casa e cai na ÚLTIMA como padrão, todo intervalo vira um teto ordenado
 *    e a última faixa é o "resto". Mesma semântica, sem tocar no motor.
 *
 * 4. **O valor de cada opção de faixa.** O contrato pede `{label, valor}`
 *    porque o `valor` é o que entra na conta. A fonte manda só os rótulos.
 */

export interface EditorialModulo {
  /** Linhas da tela de cenário, extraídas da narrativa da fonte. */
  linhas: LinhaCenario[]
  /** Tela de input: o campo que a fonte descreve só como "percentual"/"moeda"/… */
  input: {
    emoji: string
    label: string
    tipo: "decimal" | "texto" | "faixa"
    opcoes?: OpcaoFaixa[]
  }
  resultado: {
    /** Fecho curto da tela. `{valorCru}` ecoa o número como a pessoa digitou. */
    headline: string
    /**
     * Uma condição por regra da fonte, na MESMA ordem. A última é o "resto" e
     * vale qualquer string — `avaliarFaixa` cai nela quando nenhuma casa.
     */
    condicoes: string[]
    cores: CorFaixa[]
    /** Sem faixas: resposta em texto livre não dá para avaliar sem eval. */
    semFaixas?: boolean
  }
}

const t = (label: string, texto: string): LinhaCenario => ({
  label,
  valor: 0,
  tipo: "saldo",
  valorTexto: texto,
})

export const EDITORIAL_EM: Record<string, EditorialModulo> = {
  "de-onde-veio-esse-dinheiro": {
    linhas: [
      t("Nota de 50 cruzados novos", "não compra nada hoje"),
      { label: "Pix ao pedreiro", valor: 300, tipo: "saida" },
      t("Caixa de laranjas do quintal", "quitou parte, sem registro"),
    ],
    input: { emoji: "💵", label: "Em papel, dos últimos 7 dias", tipo: "decimal" },
    resultado: {
      headline: "Você estimou <strong>{valorCru}%</strong> em papel",
      condicoes: ["valor == 0", "valor <= 30", "resto"],
      cores: ["green", "green", "yellow"],
    },
  },

  "por-que-custa-o-que-custa": {
    linhas: [
      { label: "Preço de venda do pote", valor: 12, tipo: "entrada" },
      { label: "Custo por pote", valor: 4.2, tipo: "saida" },
      { label: "Fixos da semana", valor: 60, tipo: "saida" },
      t("Vendidos por semana", "90 potes"),
      { label: "Lucro da semana", valor: 642, tipo: "saldo" },
    ],
    input: { emoji: "🏷️", label: "Fatia que foi custo", tipo: "decimal" },
    resultado: {
      headline: "Você chutou <strong>{valorCru}%</strong> de custo",
      condicoes: ["valor < 40", "valor <= 75", "resto"],
      cores: ["yellow", "green", "yellow"],
    },
  },

  "ler-antes-de-assinar": {
    linhas: [
      { label: "Plano contratado", valor: 99.9, tipo: "saida" },
      { label: "Antivírus que ele não pediu", valor: 24.9, tipo: "saida" },
      { label: "Taxa de instalação parcelada", valor: 12.6, tipo: "saida" },
      { label: "Fatura que chegou", valor: 137.4, tipo: "saldo" },
    ],
    input: {
      emoji: "📄",
      label: "Documentos lidos até o fim",
      tipo: "faixa",
      opcoes: [
        { label: "Nenhum", valor: "0" },
        { label: "Um ou dois", valor: "1" },
        { label: "Metade", valor: "2" },
        { label: "Quase todos", valor: "3" },
        { label: "Todos", valor: "4" },
      ],
    },
    resultado: {
      headline: "O que passa sem leitura costuma ser pequeno e mensal",
      condicoes: ["valor <= 1", "valor <= 3", "resto"],
      cores: ["yellow", "green", "green"],
    },
  },

  "fonte-confiavel": {
    linhas: [
      t("Vídeo com 800 mil visualizações", "alcance, não apuração"),
      t("Matéria de jornal com o nome do CEO", "fonte secundária"),
      t("Consulta no Banco Central", "empresa não aparece"),
      t("Promessa anunciada", "4% ao mês"),
    ],
    input: { emoji: "✍️", label: "Sua frase de abertura", tipo: "texto" },
    resultado: {
      headline: "Uma frase vira texto quando dá para conferir",
      condicoes: [],
      cores: [],
      semFaixas: true,
    },
  },

  "escolher-e-abrir-mao": {
    linhas: [
      { label: "Juntado em freelas", valor: 900, tipo: "entrada" },
      { label: "Notebook agora, em dezembro", valor: 900, tipo: "saida" },
      { label: "Mesmo modelo em março", valor: 750, tipo: "saida" },
      { label: "Trabalhos recusados até lá", valor: 400, tipo: "saida" },
    ],
    input: { emoji: "⏳", label: "Compra que dá para adiar", tipo: "decimal" },
    resultado: {
      headline: "Adiar <strong>R$ {valor}</strong> tem um preço e um ganho",
      condicoes: ["valor < 100", "valor <= 500", "resto"],
      cores: ["green", "yellow", "yellow"],
    },
  },

  "seu-orcamento-em-uma-tela": {
    linhas: [
      { label: "Entra por mês", valor: 3200, tipo: "entrada" },
      { label: "Fixos", valor: 1840, tipo: "saida" },
      { label: "Variáveis, na média", valor: 950, tipo: "saida" },
      { label: "Sobra no papel", valor: 410, tipo: "saldo" },
      t("Imprevisto, em 4 dos últimos 6 meses", "de R$ 200 a R$ 500"),
    ],
    input: { emoji: "🧮", label: "Quanto sobra no seu mês", tipo: "decimal" },
    resultado: {
      headline: "Sua sobra real: <strong>R$ {valor}</strong>",
      condicoes: ["valor < 0", "valor <= 300", "resto"],
      cores: ["red", "yellow", "green"],
    },
  },

  "preco-justo": {
    linhas: [
      { label: "Loja A — à vista, hoje", valor: 1400, tipo: "saida" },
      { label: "Loja B — com frete, 20 dias", valor: 1380, tipo: "saida" },
      { label: "Site C — à vista, 12 dias", valor: 1180, tipo: "saida" },
      { label: "O que ela gasta hoje em transporte", valor: 180, tipo: "saida" },
    ],
    input: { emoji: "🔍", label: "Lugares comparados", tipo: "decimal" },
    resultado: {
      headline: "Você comparou <strong>{valorCru}</strong> lugar(es)",
      condicoes: ["valor <= 1", "valor == 2", "resto"],
      cores: ["yellow", "yellow", "green"],
    },
  },

  "o-que-te-faz-comprar": {
    linhas: [
      { label: "Juntado para o curso de inglês", valor: 700, tipo: "entrada" },
      { label: "Tênis que o grupo comprou", valor: 650, tipo: "saida" },
      t("Duração média do tênis", "um ano"),
      t("Vezes que o curso já foi adiado", "duas"),
    ],
    input: {
      emoji: "🛒",
      label: "Gasto fora do plano, 30 dias",
      tipo: "faixa",
      opcoes: [
        { label: "Nada", valor: "0" },
        { label: "Até R$ 50", valor: "25" },
        { label: "R$ 50 a R$ 200", valor: "125" },
        { label: "R$ 200 a R$ 500", valor: "350" },
        { label: "Mais de R$ 500", valor: "600" },
      ],
    },
    resultado: {
      headline: "O gasto fora do plano cabe no mês. E no ano?",
      condicoes: ["valor == 0", "valor <= 200", "resto"],
      cores: ["green", "yellow", "yellow"],
    },
  },

  "poupar-tem-um-porque": {
    linhas: [
      { label: "Guardado hoje", valor: 3200, tipo: "entrada" },
      { label: "Notebook, daqui a 6 meses", valor: 4000, tipo: "saida" },
      t("Viagem", "daqui a 3 anos"),
      t("Proposta do conhecido", "dobrar num fim de semana"),
    ],
    input: { emoji: "📅", label: "Meses até o objetivo", tipo: "decimal" },
    resultado: {
      headline: "<strong>{valorCru}</strong> meses: é o prazo que escolhe onde o dinheiro fica",
      condicoes: ["valor <= 12", "valor <= 60", "resto"],
      cores: ["green", "green", "green"],
    },
  },

  "risco-retorno-liquidez": {
    linhas: [
      { label: "Aplicado num ativo só", valor: 12000, tipo: "saida" },
      t("Prazo de resgate", "dois anos"),
      { label: "Precisou no terceiro mês", valor: 2000, tipo: "saida" },
      t("Conseguiu tirar", "nada"),
    ],
    input: { emoji: "🚪", label: "Precisa sacar em até 30 dias", tipo: "decimal" },
    resultado: {
      headline: "<strong>{valorCru}%</strong> à mão em 30 dias",
      condicoes: ["valor < 20", "valor <= 60", "resto"],
      cores: ["yellow", "green", "yellow"],
    },
  },

  "quanto-sobra-de-verdade": {
    linhas: [
      { label: "Aplicado por um ano", valor: 8000, tipo: "entrada" },
      t("Rendimento anunciado", "11% ao ano"),
      t("Imposto de renda", "sobre o ganho, no resgate"),
      t("Inflação do período", "5%"),
    ],
    input: { emoji: "📥", label: "Aporte mensal possível", tipo: "decimal" },
    resultado: {
      headline: "<strong>R$ {valor}</strong> por mês, e o que sobra depois de tudo",
      condicoes: ["valor < 100", "valor < 500", "resto"],
      cores: ["green", "green", "yellow"],
    },
  },

  "aposentadoria-comeca-hoje": {
    linhas: [
      t("Vínculo", "sem carteira, dirige por aplicativo"),
      t("INSS", "ele mesmo recolhe, todo mês"),
      t("Benefício público", "tem teto, menor que a renda dele"),
      t("Quem chega aos 65 no Brasil", "tende a viver mais de 20 anos"),
    ],
    input: { emoji: "🕰️", label: "Idade para reduzir o ritmo", tipo: "decimal" },
    resultado: {
      headline: "Reduzir aos <strong>{valorCru}</strong>: o intervalo a bancar começa aí",
      condicoes: ["valor < 55", "valor <= 64", "resto"],
      cores: ["yellow", "yellow", "green"],
    },
  },

  "dinheiro-com-impacto": {
    linhas: [
      { label: "Empréstimo para a máquina", valor: 15000, tipo: "entrada" },
      t("Instituição A", "0,4 ponto mais barata, cobrança abusiva"),
      t("Instituição B", "mais cara, contrato claro e ouvidoria"),
      t("Fornecedor da madeira", "só um comprova origem legal"),
    ],
    input: {
      emoji: "🌱",
      label: "Critério que pesaria mais",
      tipo: "faixa",
      opcoes: [
        { label: "Ambiental: clima, água e resíduos", valor: "1" },
        { label: "Social: trabalho e comunidade", valor: "2" },
        { label: "Governança: transparência e contratos", valor: "3" },
      ],
    },
    resultado: {
      headline: "Critério só vale quando vira pergunta que dá para conferir",
      condicoes: ["valor == 1", "valor == 2", "resto"],
      cores: ["green", "green", "green"],
    },
  },

  "promessa-boa-demais": {
    linhas: [
      { label: "Primeiro Pix, para conta de pessoa física", valor: 300, tipo: "saida" },
      { label: "Devolvido na primeira semana", valor: 24, tipo: "entrada" },
      { label: "Oferta seguinte, só hoje", valor: 3000, tipo: "saida" },
      t("Promessa", "8% ao mês, sem CNPJ no site"),
    ],
    input: { emoji: "🚨", label: "Retorno que te faria desconfiar", tipo: "decimal" },
    resultado: {
      headline: "Seu alarme toca em <strong>{valorCru}%</strong> ao mês",
      condicoes: ["valor <= 1", "valor <= 5", "resto"],
      cores: ["green", "yellow", "red"],
    },
  },

  "colchao-e-apolice": {
    linhas: [
      { label: "Prêmio do seguro, no ano", valor: 1380, tipo: "saida" },
      { label: "Conserto depois da queda", valor: 5200, tipo: "saida" },
      { label: "Franquia — fica com ela", valor: 2000, tipo: "saida" },
      { label: "Indenização — a seguradora paga", valor: 3200, tipo: "entrada" },
    ],
    input: { emoji: "🛟", label: "Seu mês essencial", tipo: "decimal" },
    resultado: {
      headline: "Um mês essencial: <strong>R$ {valor}</strong>",
      condicoes: ["valor < 1000", "valor <= 3000", "resto"],
      cores: ["green", "yellow", "yellow"],
    },
  },

  "o-preco-do-credito": {
    linhas: [
      { label: "Precisa emprestado", valor: 4000, tipo: "entrada" },
      { label: "Oferta A — parcela (CET 2,9% a.m.)", valor: 385, tipo: "saida" },
      { label: "Oferta B — parcela (CET 4,4% a.m.)", valor: 427, tipo: "saida" },
      t("Mesma taxa anunciada nas duas", "2,3% ao mês"),
      { label: "Diferença no total pago", valor: 501, tipo: "saldo" },
    ],
    input: { emoji: "📆", label: "Parcela que cabe no seu mês", tipo: "decimal" },
    resultado: {
      headline: "Cabe até <strong>R$ {valor}</strong> por mês",
      condicoes: ["valor < 385", "valor < 427", "resto"],
      cores: ["yellow", "yellow", "green"],
    },
  },

  "quando-a-divida-vira-problema": {
    linhas: [
      { label: "Sobrou da fatura, no rotativo", valor: 1200, tipo: "saida" },
      t("Taxa", "14% ao mês, juros sobre juros"),
      { label: "Quatro meses depois", valor: 2027, tipo: "saldo" },
      { label: "Entrada proposta no acordo", valor: 300, tipo: "entrada" },
    ],
    input: { emoji: "⛓️", label: "Da renda já comprometida", tipo: "decimal" },
    resultado: {
      headline: "<strong>{valorCru}%</strong> da sua renda já tem dono",
      condicoes: ["valor < 30", "valor <= 50", "resto"],
      cores: ["green", "yellow", "red"],
    },
  },

  "estudar-sem-se-afundar": {
    linhas: [
      t("Vaga pública, outra cidade", "mensalidade zero"),
      { label: "…mas moradia, transporte e material", valor: 1200, tipo: "saida" },
      { label: "Bolsa de 50%, na própria cidade", valor: 700, tipo: "saida" },
      { label: "…mais transporte, morando em casa", valor: 160, tipo: "saida" },
    ],
    input: { emoji: "🎓", label: "Custo mensal de permanência", tipo: "decimal" },
    resultado: {
      headline: "Manter-se estudando: <strong>R$ {valor}</strong> por mês",
      condicoes: ["valor < 400", "valor <= 1000", "resto"],
      cores: ["green", "yellow", "yellow"],
    },
  },

  "de-onde-vem-a-sua-renda": {
    linhas: [
      { label: "Mês bom, 200 horas rodadas", valor: 2800, tipo: "entrada" },
      { label: "INSS, que ele mesmo recolhe", valor: 200, tipo: "saida" },
      t("Férias, 13º, afastamento", "nenhum"),
      t("Quando o combustível sobe", "o valor por corrida cai"),
    ],
    input: { emoji: "🧾", label: "Da renda da casa, sem carteira", tipo: "decimal" },
    resultado: {
      headline: "<strong>{valorCru}%</strong> da renda da casa vem sem proteção",
      condicoes: ["valor == 0", "valor <= 40", "resto"],
      cores: ["green", "yellow", "yellow"],
    },
  },

  "pensar-como-quem-empreende": {
    linhas: [
      t("Ferramentas", "emprestadas de um vizinho"),
      { label: "Faturou no sábado", valor: 100, tipo: "entrada" },
      { label: "Gastou em peças", valor: 18, tipo: "saida" },
      t("Clientes atendidos", "quatro, a R$ 25 cada"),
    ],
    input: {
      emoji: "🧪",
      label: "Natureza da sua próxima ideia",
      tipo: "faixa",
      opcoes: [
        { label: "Cultural: oficina, evento, produto artístico", valor: "1" },
        { label: "Social: resolver um problema da comunidade", valor: "2" },
        { label: "Comercial: vender produto ou serviço", valor: "3" },
        { label: "Dentro de onde já estou", valor: "4" },
      ],
    },
    resultado: {
      headline: "Teste pequeno responde o que projeção nenhuma responde",
      condicoes: ["valor == 3", "valor <= 2", "resto"],
      cores: ["green", "green", "green"],
    },
  },

  "a-conta-do-negocio": {
    linhas: [
      { label: "Receita do mês — 600 marmitas a R$ 20", valor: 12000, tipo: "entrada" },
      { label: "Custo variável", valor: 6600, tipo: "saida" },
      { label: "Custo fixo", valor: 4200, tipo: "saida" },
      { label: "Lucro — 10% da receita", valor: 1200, tipo: "saldo" },
      t("Desperdício de legumes", "8% por compra mal dimensionada"),
    ],
    input: { emoji: "♻️", label: "Corte proposto por mês", tipo: "decimal" },
    resultado: {
      headline: "<strong>R$ {valor}</strong> por mês saindo do desperdício",
      condicoes: ["valor < 200", "valor <= 500", "resto"],
      cores: ["green", "green", "yellow"],
    },
  },

  "quem-move-a-economia": {
    linhas: [
      t("Fábrica da região", "demitiu 200 pessoas"),
      t("Faturamento da padaria", "caiu 18% em dois meses"),
      t("O que mudou na prateleira", "pão de queijo de R$ 6 → pão francês de R$ 1"),
      t("Clínica nova na mesma rua", "15 vagas de salário alto"),
    ],
    input: { emoji: "🏘️", label: "Gasto no comércio do bairro", tipo: "decimal" },
    resultado: {
      headline: "<strong>R$ {valor}</strong> viraram renda perto de você",
      condicoes: ["valor < 200", "valor <= 800", "resto"],
      cores: ["yellow", "green", "green"],
    },
  },

  "imposto-servico-publico-e-voce": {
    linhas: [
      { label: "Freela de edição", valor: 400, tipo: "entrada" },
      { label: "Fone comprado", valor: 250, tipo: "saida" },
      { label: "Tributo embutido no preço", valor: 90, tipo: "saida" },
      t("O mesmo tributo, para quem ganha R$ 22 mil", "0,4% da renda, contra 22%"),
    ],
    input: {
      emoji: "🔎",
      label: "Ferramentas que você já usou",
      tipo: "faixa",
      opcoes: [
        { label: "Nenhum deles", valor: "0" },
        { label: "Um deles", valor: "1" },
        { label: "Dois deles", valor: "2" },
        { label: "Os três", valor: "3" },
      ],
    },
    resultado: {
      headline: "Fiscalizar é a parte do preço que quase ninguém cobra",
      condicoes: ["valor == 0", "valor <= 2", "resto"],
      cores: ["yellow", "green", "green"],
    },
  },

  "o-termometro-da-economia": {
    linhas: [
      { label: "US$ 600 quando o dólar valia R$ 5,20", valor: 3120, tipo: "entrada" },
      { label: "Os mesmos US$ 600 com o dólar a R$ 5,90", valor: 3540, tipo: "entrada" },
      { label: "Notebook importado, antes", valor: 6000, tipo: "saida" },
      { label: "…e depois", valor: 6700, tipo: "saida" },
    ],
    input: { emoji: "🌡️", label: "Sua leitura da inflação, 12 meses", tipo: "decimal" },
    resultado: {
      headline: "Você sentiu <strong>{valorCru}%</strong> em 12 meses",
      condicoes: ["valor < 4", "valor <= 12", "resto"],
      cores: ["green", "green", "yellow"],
    },
  },
}
