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
 * `schema.prisma`: todo modelo com `userId` precisa estar em SECOES_EXPORTADAS
 * ou em NAO_EXPORTADOS. Um modelo novo, não classificado, derruba o teste
 * pedindo a decisão — que é o único momento em que alguém sabe a resposta.
 *
 * A REGRA DA FRONTEIRA, aqui, é quase toda inclusiva: sai TUDO que a pessoa
 * gerou ou que foi escrito sobre ela. Só três coisas ficam, e nenhuma delas é
 * "dado dela" no sentido da portabilidade:
 *
 *   1. CREDENCIAL — token de sessão e token de OAuth. Não descrevem a pessoa;
 *      são a chave da conta dela. Num arquivo que ela pode mandar para o
 *      contador por e-mail, seriam a pior linha do arquivo.
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

/**
 * Modelo do Prisma (delegate) → campo em que ele aparece no JSON exportado.
 *
 * O nome do campo não é decorativo: `scripts/testar-exportacao.mts` procura por
 * ele no código da rota. Uma seção classificada aqui e nunca escrita lá é
 * exatamente o defeito original — a promessa sem a entrega — e o teste acusa.
 */
export const SECOES_EXPORTADAS: Record<string, string> = {
  // --- dinheiro ---
  categoria: "categorias",
  contaFixa: "contasFixas",
  transacao: "transacoes",
  // teto por categoria ou do mês inteiro. `limite` é cifrado: sai por
  // lib/orcamento-repo.ts, decifrado, como todo o resto do dinheiro.
  orcamento: "orcamentos",
  investimento: "investimentos",
  objetivo: "objetivos",
  // de qual banco veio cada extrato e de que período. Não é valor, mas é a
  // vida financeira descrita — "Nubank, março a junho" — e o apagar financeiro
  // já leva a tabela, então a exportação tem de saber entregá-la.
  extratoImport: "importacoesDeExtrato",
  diagnosticoVazamento: "diagnosticoVazamento",
  // as três linhas que a IA escreveu lendo o dash DELA. Texto sobre a pessoa,
  // escrito por nós: é o caso mais claro de dado que a portabilidade devolve.
  insight: "insights",

  // --- assistente: o mais sensível do banco, e o que mais faltava ---
  memoriaUsuario: "memorias",
  // a conversa inteira, mensagem a mensagem. ConversaMensagem não tem `userId`
  // (pende de Conversa), então não aparece nesta lista — o teste confere que
  // ela sai junto olhando o repositório, não o schema.
  conversa: "conversas",
  onboarding: "primeiraConversa",

  // --- aprendizado ---
  perfil: "perfilDaTrilha",
  progressoModulo: "progressoModulos",
  // A pendência nomeada no backlog (Escola, 14/08/2026): as colunas de
  // "1ª passada × após correção" nasceram fora da exportação porque a tabela
  // inteira estava fora.
  progressoLicao: "progressoLicoes",
  // `motivo` é texto livre escrito pela IA a partir dos números da pessoa.
  // Ficou FORA do apagar financeiro por ser trilha (ressalva registrada em
  // lib/dados-financeiros.ts); ficar fora da exportação seria outra coisa —
  // frase sobre ela, guardada por nós, que ela não poderia ler.
  recomendacaoTrilha: "recomendacoesDaTrilha",

  // --- jogo e ofensiva ---
  eventoPontuacao: "extratoDeXP",
  eventoCoins: "extratoDeCoins",
  diaAtivo: "diasAtivos",

  // --- personalização, cobrança, escola ---
  imagemUsuario: "imagens",
  assinatura: "assinatura",
  usoMensalIA: "usoDeIA",
  membroEscola: "escola",
  membroTurma: "turmas",
  competenciaProfessor: "competencias",
  // só o NOME do provedor ("google"), nunca os tokens — ver CAMPOS_FORA.
  account: "provedoresDeLogin",
}

/**
 * O outro lado da conta: modelo com `userId` que NÃO sai, e a razão.
 *
 * Isto não é documentação decorativa — é o que permite ao teste exigir que um
 * modelo novo seja classificado. Sem esta metade, "não está na lista" seria
 * indistinguível de "ninguém olhou ainda", que foi exatamente o estado
 * anterior da rota.
 */
export const NAO_EXPORTADOS: Record<string, string> = {
  session:
    "Sessão ativa. É CREDENCIAL, não dado sobre a pessoa: o `sessionToken` " +
    "no arquivo é a chave da conta dela, e o arquivo é feito para ser " +
    "guardado, copiado e mandado para outra pessoa. Quem quer saber onde " +
    "está logado usa a tela, não um dump.",
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
