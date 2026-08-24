/**
 * O que É "todos os meus dados" — a lista que a exportação LGPD obedece.
 *
 * POR QUE ISSO EXISTE COMO ARQUIVO, E NÃO COMO O QUE ALGUÉM LEMBROU DE PÔR
 *
 * `/api/exportar` dizia, no comentário do topo, "baixa TODOS os dados do
 * usuário", e o `README.md` promete o mesmo na regra 3. Não era verdade desde
 * antes de alguém reparar: ficavam de fora as memórias do assistente, as
 * conversas do chat, os orçamentos, as respostas do onboarding, os eventos de
 * pontuação, os insights e o progresso das lições — e o que faltava era
 * justamente o mais sensível do banco. O *delete* cobre tudo por CASCADE; a
 * exportação, que é escrita à mão, não cobria.
 *
 * O defeito é o mesmo que `lib/dados-financeiros.ts` já tinha corrigido do
 * outro lado: a lista morava num lugar onde esquecer não dá erro. Tabela nova
 * entra no schema, ninguém lembra da rota, e o app passa a mentir numa tela de
 * privacidade — silenciosamente, e do lado que a pessoa só descobre quando
 * abre o arquivo procurando uma conversa que não está lá.
 *
 * Então a lista virou dado, e `scripts/testar-exportacao.mts` confere contra o
 * `schema.prisma`: todo modelo LIGADO A `User` precisa estar em
 * SECOES_EXPORTADAS ou em NAO_EXPORTADOS. Um modelo novo, não classificado,
 * derruba o teste pedindo a decisão — que é o único momento em que alguém sabe
 * a resposta.
 *
 * "Ligado a User" e não "tem coluna `userId`": a regra estreita deixava passar
 * quatro modelos que pertencem a alguém por outro nome de chave — `Indicacao`
 * (indicadorId/indicadoId), `Turma` (professorDaTurma), `ConviteEscola`
 * (geradorDoConvite) e `AcessoTrilhaTurma` (concessorDoAcesso). Um deles, a
 * indicação, a rota já entregava sem estar em lista nenhuma.
 *
 * A REGRA DA FRONTEIRA, aqui, é quase toda inclusiva: sai TUDO que a pessoa
 * gerou ou que foi escrito sobre ela. Só três coisas ficam, e nenhuma delas é
 * "dado dela" no sentido da portabilidade:
 *
 *   1. CREDENCIAL — token de sessão, token de OAuth, código de convite que
 *      ainda vale. Não descrevem a pessoa; são a chave de uma porta. Num
 *      arquivo que ela pode mandar para o contador por e-mail, seriam a pior
 *      linha do arquivo.
 *   2. IDENTIFICADOR DE SISTEMA NOSSO — os ids `cus_`/`sub_` da Stripe. Mesma
 *      lógica: não é o que ela pagou (isso sai), é como o nosso sistema fala
 *      com a Stripe fingindo ser ela.
 *   3. DADO DE TERCEIRO — quem entrou pelo link dela, quem estuda na mesma
 *      turma. É dado do outro, e portabilidade não é o direito de levar a
 *      identidade de mais ninguém.
 *
 * NÃO CONFUNDIR COM "APAGAR MEUS DADOS FINANCEIROS". Lá a resposta certa é
 * "uma parte" e a fronteira é dinheiro × aprendizado (ver
 * `lib/dados-financeiros.ts`). Aqui a resposta certa é "tudo", e por isso as
 * duas listas se cruzam no teste: o que a LGPD apaga a pedido, a LGPD precisa
 * saber entregar.
 */

/** Uma seção do arquivo exportado. */
export interface SecaoExportada {
  /**
   * A chave sob a qual ela aparece no JSON — o que a pessoa procura quando
   * abre o arquivo, e o que o teste exige que exista no `dump` da rota. Uma
   * seção classificada aqui e nunca escrita lá é exatamente o defeito original:
   * a promessa sem a entrega.
   */
  campo: string
  /**
   * O que a rota tem de chamar para ler aquilo: o delegate do Prisma
   * (`db.insight`) ou a função de repositório que decifra.
   *
   * Quando o campo é CIFRADO, passar pelo repositório não é preferência de
   * estilo: ler direto devolve `"v1.…"`, e um arquivo de portabilidade cheio de
   * cifra que a pessoa não tem chave para abrir cumpre a letra da lei e nenhuma
   * parte do direito.
   */
  lidoPor: string
  /**
   * Quando a seção sai ANINHADA em outra (as mensagens dentro da conversa), a
   * chave do pai. O teste então procura o campo no repositório que monta o
   * aninhado, não no `dump` da rota — onde ele nunca vai aparecer.
   */
  aninhadaEm?: string
  /** Por que ela sai, quando não é óbvio pelo nome. */
  nota?: string
}

export const SECOES_EXPORTADAS: Record<string, SecaoExportada> = {
  // --- dinheiro ---
  categoria: { campo: "categorias", lidoPor: "db.categoria" },
  contaFixa: { campo: "contasFixas", lidoPor: "listarContasFixas" },
  transacao: { campo: "transacoes", lidoPor: "listarTransacoes" },
  orcamento: {
    campo: "orcamentos",
    lidoPor: "listarOrcamentos",
    nota:
      "Teto por categoria ou do mês inteiro. `limite` é cifrado, e é um número " +
      "que a pessoa ESCOLHEU: não dá para recalcular a partir das transações.",
  },
  investimento: { campo: "investimentos", lidoPor: "listarInvestimentos" },
  objetivo: { campo: "objetivos", lidoPor: "listarObjetivos" },
  extratoImport: {
    campo: "importacoesDeExtrato",
    lidoPor: "db.extratoImport",
    nota:
      "De qual banco veio o extrato e de que período. Não é valor, mas é a " +
      "vida financeira descrita (\"Nubank, março a junho\"), e o apagar " +
      "financeiro já leva a tabela, então a exportação tem de saber entregá-la.",
  },
  diagnosticoVazamento: { campo: "diagnosticoVazamento", lidoPor: "lerDiagnostico" },
  insight: {
    campo: "insights",
    lidoPor: "db.insight",
    nota:
      "As três linhas que a IA escreveu lendo o dash DELA. Texto sobre a " +
      "pessoa, escrito por nós: é o caso mais claro de dado que a " +
      "portabilidade devolve.",
  },

  // --- assistente: o mais sensível do banco, e o que mais faltava ---
  memoriaUsuario: { campo: "memorias", lidoPor: "exportarMemorias" },
  conversa: { campo: "conversas", lidoPor: "exportarConversas" },
  conversaMensagem: {
    campo: "mensagens",
    lidoPor: "exportarConversas",
    aninhadaEm: "conversas",
    nota:
      "Sai ANINHADA na conversa, e não tem `userId` (pendura em `Conversa`). " +
      "Está classificada assim mesmo porque é o conteúdo de verdade: uma " +
      "exportação que entregasse só os títulos passaria em qualquer regra que " +
      "olhasse apenas o schema.",
  },
  onboarding: { campo: "primeiraConversa", lidoPor: "db.onboarding" },

  // --- aprendizado ---
  perfil: { campo: "perfilDaTrilha", lidoPor: "db.perfil" },
  progressoModulo: { campo: "progressoModulos", lidoPor: "db.progressoModulo" },
  progressoLicao: {
    campo: "progressoLicoes",
    lidoPor: "db.progressoLicao",
    nota:
      "A pendência nomeada no backlog (Escola, 14/08/2026): as colunas de " +
      "\"1ª passada × após correção\" nasceram fora da exportação porque a " +
      "tabela inteira estava fora: o professor via a nota e o arquivo dela não.",
  },
  recomendacaoTrilha: {
    campo: "recomendacoesDaTrilha",
    lidoPor: "db.recomendacaoTrilha",
    nota:
      "`motivo` é texto livre escrito pela IA a partir dos números da pessoa. " +
      "Ficou FORA do apagar financeiro por ser trilha (ressalva registrada em " +
      "lib/dados-financeiros.ts); ficar fora da exportação seria outra coisa: " +
      "frase sobre ela, guardada por nós, que ela não poderia ler.",
  },

  // --- jogo e ofensiva ---
  eventoPontuacao: { campo: "extratoDeXP", lidoPor: "db.eventoPontuacao" },
  eventoCoins: { campo: "extratoDeCoins", lidoPor: "db.eventoCoins" },
  diaAtivo: {
    campo: "diasAtivos",
    lidoPor: "db.diaAtivo",
    nota: "A ofensiva é DERIVADA destas datas; sem elas ela não teria como conferir o número.",
  },

  // --- personalização, cobrança, indicação, escola ---
  imagemUsuario: { campo: "imagens", lidoPor: "db.imagemUsuario" },
  assinatura: { campo: "assinatura", lidoPor: "db.assinatura" },
  usoMensalIA: { campo: "usoDeIA", lidoPor: "db.usoMensalIA" },
  indicacao: {
    campo: "indicacoes",
    lidoPor: "db.indicacao",
    nota:
      "Não tem `userId`, e sim `indicadorId`/`indicadoId`: por isso escapava de " +
      "qualquer regra que procurasse a coluna pelo nome. Sai o VÍNCULO (status " +
      "e datas); quem entrou pelo link dela é dado do outro.",
  },
  membroEscola: { campo: "escola", lidoPor: "db.membroEscola" },
  membroTurma: { campo: "turmas", lidoPor: "db.membroTurma" },
  competenciaProfessor: { campo: "competencias", lidoPor: "db.competenciaProfessor" },
  account: {
    campo: "provedoresDeLogin",
    lidoPor: "db.account",
    nota:
      "Só o NOME do provedor (\"google\"). Os tokens moram na mesma tabela e " +
      "nunca saem. Ver CAMPOS_FORA.",
  },
  waitlist: {
    campo: "listaDeEspera",
    lidoPor: "db.waitlist",
    nota:
      "Não tem relação com `User`: é chaveada por e-mail, e nenhuma regra que " +
      "olhe o schema a alcança. Sai assim mesmo porque o DELETE de conta já a " +
      "apaga pelo e-mail (`app/api/conta`): se o app associa as duas coisas " +
      "para apagar, associa para entregar.",
  },
}

/**
 * O outro lado da conta: modelo ligado a `User` que NÃO sai, e a razão.
 *
 * Isto não é documentação decorativa — é o que permite ao teste exigir que um
 * modelo novo seja classificado. Sem esta metade, "não está na lista" seria
 * indistinguível de "ninguém olhou ainda", que foi exatamente o estado anterior
 * da rota.
 */
export const NAO_EXPORTADOS: Record<string, string> = {
  session:
    "Sessão ativa. É CREDENCIAL, não dado sobre a pessoa: o `sessionToken` " +
    "no arquivo é a chave da conta dela, e o arquivo é feito para ser " +
    "guardado, copiado e mandado para outra pessoa. Quem quer saber onde " +
    "está logado usa a tela, não um dump.",

  // --- escola: pertence à instituição, não a quem a opera ---
  turma:
    "A turma é da ESCOLA, não do professor que a leciona. O vínculo dele sai " +
    "em `escola.turmas`; a lista de quem estuda ali é dado dos alunos.",
  conviteEscola:
    "Código de convite MULTIUSO da turma. É credencial de entrada: exportado, " +
    "continuaria valendo na mão de quem já saiu da escola.",
  acessoTrilhaTurma:
    "O que o professor liberou para a turma. É configuração da escola sobre a " +
    "trilha dos alunos, não dado de quem concedeu.",
}

/**
 * Campos que NÃO saem de dentro de uma seção que sai.
 *
 * A granularidade importa: a assinatura é dela (o que pagou, quando, até
 * quando vale) e sai inteira menos os ids da Stripe; o vínculo de login é dela
 * ("entro com Google") e sai como nome de provedor, sem os tokens que dão
 * acesso à conta Google. O teste confere que nenhum destes nomes reaparece no
 * código da rota — um `select` copiado de outro arquivo é o jeito comum de
 * isso voltar sem ninguém decidir.
 */
export const CAMPOS_FORA: Record<string, string> = {
  senha: "Hash da senha. Não é dado dela; é o que protege a conta.",
  sessionToken: "Credencial de sessão viva.",
  access_token: "Token do provedor OAuth: dá acesso à conta Google dela.",
  refresh_token: "Idem, e este não expira sozinho.",
  id_token: "Idem.",
  session_state: "Estado da sessão no provedor. Mesma família dos tokens.",
  clienteStripeId:
    "Customer id da Stripe (`cus_…`). Identificador do NOSSO sistema, não " +
    "dela. Num arquivo compartilhável, vira material para alguém falar com a " +
    "Stripe fingindo ser ela.",
  externalId: "Subscription id da Stripe (`sub_…`). Idem.",
  checkoutId: "Session id do checkout (`cs_…`). Idem.",
}
