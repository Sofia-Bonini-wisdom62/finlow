/**
 * O que existe neste app e como se chega lá.
 *
 * POR QUE ISTO EXISTE
 * O assistente sabia falar de dinheiro e não sabia falar do app. Perguntado
 * "como apago meu histórico?", ele inventava um caminho plausível — e caminho
 * de menu inventado é pior que um "não sei": a pessoa vai procurar, não acha, e
 * conclui que ela é que não entendeu.
 *
 * Pior ainda estava o card de recomendação de módulo, que apontava para
 * `/modulo/{slug}` — rota que NUNCA existiu. Toda aula recomendada desde que o
 * chat foi ligado levava a um 404.
 *
 * Este arquivo é a fonte única. `scripts/testar-mapa.mts` confere que todo
 * `href` daqui corresponde a uma página real — um mapa que envelhece calado
 * reproduz exatamente o bug que ele deveria evitar.
 */

export interface Destino {
  /** Rota real. O teste confere que existe um page.tsx correspondente. */
  href: string
  nome: string
  /** O caminho de toques, como a pessoa faria. */
  caminho: string[]
  /** Para que serve — é o que o modelo lê para decidir se é isto mesmo. */
  paraQue: string
}

export const DESTINOS: Destino[] = [
  {
    href: "/chat",
    nome: "Chat",
    caminho: ["Chat"],
    paraQue: "conversar com o assistente, contar um gasto, mandar o extrato",
  },
  {
    href: "/trilha",
    nome: "Trilha",
    caminho: ["Trilha"],
    paraQue: "ver as aulas recomendadas e a biblioteca completa",
  },
  {
    href: "/perfil",
    nome: "Perfil",
    caminho: ["Perfil"],
    paraQue: "ver o retrato financeiro, indicadores e progresso",
  },
  {
    href: "/analises",
    nome: "Análises",
    // Deixou de ser aba: agora é profundidade do Perfil.
    caminho: ["Perfil", "Análises"],
    paraQue: "gráficos do mês, gastos por categoria, tetos de orçamento",
  },
  {
    href: "/painel",
    nome: "Painel",
    // Também dá pra chegar por Menu > "Registrar e editar lançamentos", mas o
    // mapa dá UM caminho: dois caminhos na mesma resposta viram dúvida.
    caminho: ["Perfil", "Painel"],
    paraQue: "lançar na mão, editar ou apagar um lançamento, contas fixas",
  },
  {
    href: "/ranking",
    nome: "Ranking",
    caminho: ["Perfil", "card de pontos"],
    paraQue: "ver os pontos, entrar ou sair do ranking (é opcional e vem desligado)",
  },
  {
    href: "/extrato",
    nome: "Ler extrato do banco",
    caminho: ["Menu", "Ler extrato do banco"],
    paraQue: "subir PDF, CSV ou OFX do banco e importar tudo de uma vez",
  },
  {
    href: "/diagnostico",
    nome: "Diagnóstico de Vazamento",
    caminho: ["Menu", "Diagnóstico de Vazamento"],
    paraQue: "ver quanto escapa por mês em assinaturas, tarifas, juros e cobranças em dobro",
  },
  {
    href: "/memoria",
    nome: "Memória do assistente",
    caminho: ["Menu", "Memória do assistente"],
    paraQue: "ler, editar e APAGAR tudo que o assistente aprendeu sobre a pessoa; ligar e desligar a memória",
  },
  {
    href: "/ajustes",
    nome: "Menu",
    caminho: ["Menu"],
    paraQue: "conta, tema, privacidade, exportar dados, apagar a conta",
  },
  {
    href: "/onboarding",
    nome: "Refazer a primeira conversa",
    caminho: ["Menu", "Refazer a primeira conversa"],
    paraQue: "refazer o onboarding e recalcular a trilha",
  },
]

/**
 * Perguntas de "como eu faço X" e a resposta exata.
 *
 * Separado de DESTINOS porque a pergunta não é "onde fica a tela", é "como
 * executo esta ação" — e algumas ações têm um passo extra que o nome da tela
 * não revela (apagar a conta exige digitar o e-mail).
 */
export interface Acao {
  /** Como a pessoa costuma pedir. Alimenta o reconhecimento do modelo. */
  pedido: string
  passos: string[]
  href: string
  /** Aviso obrigatório, quando existe. */
  cuidado?: string
}

export const ACOES: Acao[] = [
  {
    pedido: "apagar tudo que a IA sabe sobre mim / limpar a memória",
    passos: ["Menu", "Memória do assistente", "Apagar tudo"],
    href: "/memoria",
    cuidado: "Some de vez, sem cópia.",
  },
  {
    pedido: "desligar a memória sem apagar",
    passos: ["Menu", "Memória do assistente", "desligar o interruptor"],
    href: "/memoria",
    cuidado: "Desligar não apaga o que já está guardado.",
  },
  {
    pedido: "ver conversas antigas / histórico do chat",
    passos: ["Chat", "ícone de histórico no topo"],
    href: "/chat",
  },
  {
    pedido: "apagar uma conversa / limpar o histórico do chat",
    passos: ["Chat", "ícone de histórico no topo", "Apagar tudo"],
    href: "/chat",
    cuidado: "Apagar a conversa não apaga o que o assistente aprendeu; isso fica em Menu > Memória do assistente.",
  },
  {
    pedido: "apagar meus dados financeiros",
    passos: ["Menu", "Privacidade", "Apagar meus dados financeiros"],
    href: "/ajustes",
    cuidado: "Apaga lançamentos, contas fixas e categorias. Não apaga a conta.",
  },
  {
    pedido: "apagar minha conta",
    passos: ["Menu", "rolar até o fim", "Quero apagar minha conta", "digitar o próprio e-mail"],
    href: "/ajustes",
    cuidado: "Irreversível. Vale baixar os dados antes, no mesmo lugar.",
  },
  {
    pedido: "baixar / exportar meus dados",
    passos: ["Menu", "Exportar meus dados (JSON)"],
    href: "/ajustes",
  },
  {
    pedido: "trocar o tema, modo escuro",
    passos: ["Menu", "Aparência"],
    href: "/ajustes",
  },
  {
    pedido: "mudar meu nome ou minha senha",
    passos: ["Menu", "Conta"],
    href: "/ajustes",
  },
  {
    pedido: "importar o extrato do banco",
    passos: ["Menu", "Ler extrato do banco"],
    href: "/extrato",
    cuidado: "Também dá para anexar o arquivo direto no chat.",
  },
  {
    pedido: "corrigir ou apagar um lançamento",
    passos: ["Menu", "Registrar e editar lançamentos"],
    href: "/painel",
  },
  {
    pedido: "ver ou apagar um teto de orçamento",
    passos: ["Perfil", "Análises", "card Seus tetos"],
    href: "/analises",
  },
  {
    pedido: "entrar no ranking / aparecer para outras pessoas",
    passos: ["Perfil", "card de pontos", "Entrar no ranking"],
    href: "/ranking",
    cuidado:
      "Os outros veem só o apelido e os pontos. Nenhum valor, dívida, renda ou categoria de gasto sai dali.",
  },
  {
    pedido: "sair do ranking / não quero mais aparecer",
    passos: ["Perfil", "card de pontos", "Sair do ranking"],
    href: "/ranking",
    cuidado: "Sair tira da listagem na hora. Os pontos continuam contando para você.",
  },
  {
    pedido: "sair da conta",
    passos: ["Menu", "Sair da conta"],
    href: "/ajustes",
  },
]

/** Bloco compacto para o prompt. Só o que o modelo precisa para acertar. */
export function blocoMapaDoApp(modulos: { slug: string; titulo: string }[]): string {
  const telas = DESTINOS.map((d) => `  ${d.href}, ${d.nome}: ${d.paraQue}. Caminho: ${d.caminho.join(" > ")}`).join("\n")
  const acoes = ACOES.map(
    (a) => `  "${a.pedido}" -> ${a.passos.join(" > ")}${a.cuidado ? `  (${a.cuidado})` : ""}`
  ).join("\n")
  const aulas = modulos.length
    ? modulos.map((m) => `  ${m.slug}, ${m.titulo}`).join("\n")
    : "  (nenhuma aula cadastrada)"

  return `O APP POR DENTRO
Você conhece este app. Quando perguntarem onde fica alguma coisa, responda com
o caminho REAL abaixo. Nunca invente nome de menu. Caminho inventado é pior
que "não sei": a pessoa procura, não acha, e conclui que ela é que se perdeu.

Telas:
${telas}

Como fazer:
${acoes}

Aulas da trilha (use o slug EXATO em "moduloSlug"; nunca invente um):
${aulas}

Quando a resposta for "onde fica", devolva também um card de caminho:
  {"tipo":"caminho","titulo":"Apagar a memória","passos":["Menu","Memória do assistente","Apagar tudo"],"href":"/memoria"}
Ele vira um atalho tocável. O texto continua explicando; o card poupa a busca.`
}
