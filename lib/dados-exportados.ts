/**
 * O que É "todos os dados do usuário" — a lista que `/api/exportar` obedece.
 *
 * POR QUE ISSO EXISTE COMO ARQUIVO
 *
 * A regra 3 do `README.md` diz, desde antes de haver quem a conferisse: *"dado
 * novo do usuário entra em `/api/exportar` e sai no delete de `/api/conta`"*. O
 * lado do delete se cumpre sozinho — é CASCADE do banco, e tabela nova nasce
 * coberta. O lado da exportação é uma lista escrita à mão dentro de uma rota, e
 * lista escrita à mão envelhece calada: o comentário no topo da rota dizia
 * "baixa TODOS os dados" enquanto conversas, memórias, orçamentos, respostas do
 * onboarding, XP, insights e progresso de lição nunca saíram de lá. Cada uma
 * dessas tabelas chegou depois, e nenhuma falhou nada ao não ser somada.
 *
 * É o mesmo defeito, e a mesma cura, de `lib/dados-financeiros.ts` — que nasceu
 * quando "Apagar meus dados financeiros" deixou a carteira inteira no banco e a
 * tela respondeu "Dados financeiros apagados.". Ali a lista virou dado e o teste
 * passou a exigir que todo modelo com `userId` estivesse classificado. Aqui vale
 * a mesma exigência, do outro lado do mesmo direito: `scripts/testar-exportacao.mts`
 * confere contra o `schema.prisma` e derruba a build de quem acrescenta tabela
 * do usuário sem decidir se ela sai no arquivo — que é o único momento em que
 * alguém sabe a resposta.
 *
 * A REGRA DA FRONTEIRA: sai o que é DELA; fica o que é CREDENCIAL nossa. Ela
 * leva o que escreveu, o que a IA escreveu sobre ela e o que o app registrou do
 * uso dela. Não leva o que serve para entrar na conta (hash de senha, token de
 * sessão, token do Google) nem identificador de sistema que num arquivo
 * compartilhável vira material para alguém se passar por ela.
 *
 * NÃO CONFUNDIR COM A LISTA DE APAGAR. Lá a resposta certa é "uma parte" — só o
 * dinheiro. Aqui a resposta certa é "quase tudo", e as duas listas se cruzam
 * numa invariante que o teste também confere: **toda tabela que o botão de
 * apagar financeiro destrói precisa sair na exportação**, porque a tela de
 * Ajustes oferece "Baixar meus dados antes" ao lado do botão, e a oferta seria
 * falsa para o que o arquivo não trouxesse.
 */

export interface TabelaExportada {
  /** A chave onde a pessoa encontra isto no JSON. */
  chave: string
  /**
   * Quando a leitura NÃO é `db.<tabela>` direto: o nome da função de
   * repositório que a rota chama. Campo cifrado só se lê pelo repositório dele
   * (`lib/cripto.ts` amarra a cifra ao dono e ao campo) — ler direto entregaria
   * "v1.VQ3H…" num arquivo que existe para ser legível.
   */
  via?: string
  /** O que sai daqui, e o que fica de fora de propósito. */
  nota: string
}

export const TABELAS_EXPORTADAS: Record<string, TabelaExportada> = {
  // --- o dinheiro (todas cifradas, todas por repositório) ---
  transacao: { chave: "transacoes", via: "listarTransacoes", nota: "O livro-caixa, com a categoria pelo nome." },
  contaFixa: { chave: "contasFixas", via: "listarContasFixas", nota: "Contas do mês e o dia de vencimento." },
  categoria: { chave: "categorias", nota: "Nome, tipo e cor, inclusive as que ela criou." },
  orcamento: {
    chave: "orcamentos",
    via: "listarOrcamentos",
    nota: "Tetos de gasto. O limite é cifrado; o de mês inteiro tem categoria nula.",
  },
  investimento: { chave: "investimentos", via: "listarInvestimentos", nota: "A carteira, em entrada manual." },
  objetivo: { chave: "objetivos", via: "listarObjetivos", nota: "O cofrinho: nome, meta e quanto já guardou." },
  extratoImport: {
    chave: "extratosImportados",
    nota:
      "De qual banco veio o extrato, de que período e quantas linhas. Sem os " +
      "tokens gastos na leitura: custo de máquina é medidor nosso, e o consumo " +
      "de IA dela já sai inteiro em usoDeIA.",
  },
  diagnosticoVazamento: { chave: "diagnosticoVazamento", via: "lerDiagnostico", nota: "Achados e narrativa do diagnóstico." },
  insight: { chave: "insights", nota: "As linhas que a IA escreveu lendo o Painel dela." },

  // --- o assistente: o mais sensível do app, e o que mais faltava ---
  memoriaUsuario: {
    chave: "memoriaDoAssistente",
    via: "listarMemorias",
    nota:
      "O que o assistente aprendeu sobre a vida dela. Cifrado, opt-in, e " +
      "exatamente o tipo de dado que a portabilidade existe para devolver.",
  },
  conversa: {
    chave: "conversas",
    via: "exportarConversas",
    nota:
      "O histórico do chat COM as mensagens (ConversaMensagem sai aninhada " +
      "aqui: ela não tem userId próprio, pendura na conversa).",
  },
  onboarding: { chave: "primeiraConversa", nota: "O que ela respondeu na primeira conversa, e o nível inferido." },
  perfil: { chave: "perfilDaTrilha", nota: "Tipo de perfil e as respostas que o escolheram." },

  // --- aprendizado, XP e ofensiva ---
  progressoModulo: { chave: "progressoModulos", nota: "Módulo concluído ou em andamento." },
  progressoLicao: {
    chave: "progressoLicoes",
    nota:
      "Lição a lição: acertos da 1ª passada, os da revisão, tempo e conclusão. " +
      "Era a lacuna nomeada no backlog quando a métrica '1ª passada × após " +
      "correção' entrou (14/08): o professor via a nota da aluna e o arquivo " +
      "dela não trazia.",
  },
  recomendacaoTrilha: { chave: "recomendacoesDaTrilha", nota: "Aula recomendada, a leva e o motivo escrito pela IA." },
  eventoPontuacao: { chave: "extratoDeXP", nota: "Cada crédito de ponto, com o motivo: é o ledger do XP." },
  diaAtivo: { chave: "diasAtivos", nota: "Os dias em que ela usou o app (a ofensiva sai daqui)." },
  eventoCoins: { chave: "jogo.extratoDeCoins", nota: "Ledger de Finlo Coins, dentro do bloco do jogo." },

  // --- personalização e conta ---
  imagemUsuario: { chave: "imagens", nota: "Foto e capa como data URI. Portabilidade de imagem é a imagem." },
  indicacao: {
    chave: "indicacoes",
    nota:
      "Status e datas dos convites. A identidade do outro lado NÃO sai: quem " +
      "entrou pelo meu link é dado dele.",
  },

  // --- cobrança e cota ---
  assinatura: {
    chave: "assinatura",
    nota:
      "Status, valor, próxima cobrança. SEM os ids da Stripe (cus_/sub_/cs_): " +
      "num arquivo que ela pode compartilhar sem pensar, viram material para " +
      "alguém falar com a Stripe fingindo ser ela.",
  },
  usoMensalIA: { chave: "usoDeIA", nota: "Tokens e chamadas por mês: o medidor da cota." },

  // --- escola (Finlow para Escolas) ---
  membroEscola: { chave: "escola", nota: "Escola e papel. Colegas de turma ficam fora: são dado dos outros." },
  membroTurma: { chave: "escola.turmas", nota: "As turmas dela, com segmento e série." },
  competenciaProfessor: { chave: "escola.competencias", nota: "O que o adm liberou para ela enxergar, quando é professora." },
}

/**
 * O outro lado da conta: modelo com `userId` que NÃO sai no arquivo, e por quê.
 *
 * Isto não é documentação decorativa — é o que permite ao teste exigir decisão.
 * Sem esta metade, "não está na lista de exportar" seria indistinguível de
 * "ninguém olhou ainda", que é como as sete tabelas ausentes passaram meses.
 */
export const TABELAS_FORA_DA_EXPORTACAO: Record<string, string> = {
  account:
    "Vínculo de login com o Google: guarda access_token, refresh_token e " +
    "id_token. É CREDENCIAL viva, não dado dela: num arquivo baixado (que vai " +
    "para a pasta de downloads, o Drive, o anexo de e-mail) vira acesso à " +
    "conta Google dela na mão de quem abrir. O que ela leva daqui é o que " +
    "importa e já sai: o e-mail com que entra.",
  session:
    "Token de sessão ativa. Mesma razão, mais direta: quem tiver o token entra " +
    "na conta sem senha. O topo da rota promete não incluí-lo desde o primeiro dia.",
}
