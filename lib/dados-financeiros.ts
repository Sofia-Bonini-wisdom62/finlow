/**
 * O que É "meus dados financeiros" — a lista que o botão de apagar obedece.
 *
 * POR QUE ISSO EXISTE COMO ARQUIVO, E NÃO COMO TRÊS LINHAS DENTRO DA ROTA
 *
 * A rota de apagar nasceu com `transacao`, `contaFixa` e `categoria` escritos à
 * mão. Depois o app ganhou `Investimento`, e ninguém somou aqui: quem apertava
 * "Apagar meus dados financeiros" continuava com a carteira inteira no banco,
 * cifrada mas viva, e a tela dizia "Dados financeiros apagados."
 *
 * O defeito não foi ter esquecido o investimento — foi a lista morar num lugar
 * onde esquecer não dá erro. Tabela nova entra no schema, ninguém lembra da
 * rota, e o app passa a mentir numa tela de privacidade. Silenciosamente, e do
 * lado que não tem volta.
 *
 * Então a lista virou dado, num arquivo só, e `scripts/testar-apagar-dados.mts`
 * confere contra o `schema.prisma`: todo modelo com `userId` precisa estar em
 * APAGAR ou em MANTER. Um modelo novo, não classificado, faz o teste falhar
 * pedindo a decisão — que é o único momento em que alguém sabe a resposta.
 *
 * A REGRA DA FRONTEIRA: apaga o que é DINHEIRO; mantém o que é APRENDIZADO e o
 * que é ASSISTENTE. Não é arbitrário — é o que a tela de Ajustes já promete.
 * "Apagar a memória do assistente" e "Refazer a primeira conversa" são ações
 * próprias, separadas, com seus próprios botões. Se este botão levasse a
 * memória e a trilha junto, ele apagaria coisa que a pessoa não pediu e que ela
 * tem um caminho explícito para apagar quando quiser.
 *
 * NÃO CONFUNDIR COM APAGAR A CONTA. Lá (`/api/conta` DELETE) a lista correta é
 * nenhuma: sai tudo por CASCADE do banco, de propósito, porque na conta a
 * resposta certa é "tudo" e lista explícita envelhece calada. Aqui a resposta
 * certa é "uma parte", e parte é exatamente o que o banco não sabe escolher.
 */

/**
 * As tabelas que somem, NA ORDEM em que somem.
 *
 * A ordem importa: `Orcamento.categoriaId` e `Transacao.categoriaId` apontam
 * para `Categoria`, e `Transacao.extratoImportId` aponta para `ExtratoImport`.
 * Quem depende sai antes de quem é dependido — por isso `categoria` é a última.
 */
export const TABELAS_FINANCEIRAS = [
  // o livro-caixa em si
  "transacao",
  // tetos de gasto (limite é cifrado). Os de categoria cairiam por CASCADE
  // junto com a categoria; os de MÊS INTEIRO têm categoriaId nulo e não caem —
  // sobreviveriam à limpeza se não estivessem nomeados aqui.
  "orcamento",
  "contaFixa",
  // a carteira. Foi a que faltava, e a que a exportação LGPD já entregava.
  "investimento",
  // de qual banco veio o extrato e de que período — não é valor, mas é a sua
  // vida financeira descrita: "Nubank, março a junho".
  "extratoImport",
  // diagnóstico e insights são LIDOS do livro-caixa. Apagar o livro e manter a
  // leitura dele deixa no banco a frase cifrada que resume o que foi apagado.
  "diagnosticoVazamento",
  "insight",
  // por último: as outras apontam para ela.
  // O PATCH de reativação repovoa as padrão, então voltar ao Painel não deixa
  // a pessoa sem categoria nenhuma.
  "categoria",
] as const

export type TabelaFinanceira = (typeof TABELAS_FINANCEIRAS)[number]

/**
 * O outro lado da conta: todo modelo com `userId` que NÃO é dado financeiro, e
 * a razão de cada um ficar.
 *
 * Isto não é documentação decorativa — é o que permite ao teste exigir que um
 * modelo novo seja classificado. Sem esta metade, "não está na lista de apagar"
 * seria indistinguível de "ninguém olhou ainda".
 */
export const TABELAS_NAO_FINANCEIRAS: Record<string, string> = {
  // --- assistente: tem os próprios botões em Ajustes ---
  memoriaUsuario: "Memória do assistente — apagada em Menu > Apagar a memória do assistente.",
  conversa: "Histórico de conversa — sai junto com a memória, não com o dinheiro.",
  onboarding: "Primeira conversa — refeita em Menu > Refazer a primeira conversa.",

  // --- aprendizado e ofensiva: apagar aqui zeraria progresso que ninguém pediu ---
  perfil: "Tipo de perfil e respostas do quiz — é o que escolhe as categorias padrão na reativação.",
  recomendacaoTrilha: "Ordem das aulas recomendadas. Ver a ressalva sobre `motivo` abaixo.",
  progressoModulo: "Progresso na Trilha.",
  progressoLicao: "Progresso dentro da lição.",
  eventoPontuacao: "XP conquistado.",
  diaAtivo: "Dias de uso seguidos (ofensiva). Guarda data, nunca valor.",

  // --- sessão: apagar derrubaria a pessoa do app no meio da própria ação ---
  account: "Vínculo de login (Google). Some só quando a conta some.",
  session: "Sessão ativa. Idem.",
}

/**
 * RESSALVA REGISTRADA, PARA DECISÃO DE PRODUTO — `RecomendacaoTrilha.motivo`
 *
 * É texto livre escrito pela IA explicando por que aquela aula foi recomendada,
 * e ele é montado a partir dos números da pessoa. Não guarda valor em coluna,
 * mas nada impede a frase de citar um ("você gastou mais com delivery em
 * julho"). Ficou em MANTER porque é trilha, e trilha não é o que este botão
 * promete apagar — mas a chamada é de produto, não de código. Se a decisão for
 * que ele também sai, é mover uma linha daqui para a lista de cima.
 */
