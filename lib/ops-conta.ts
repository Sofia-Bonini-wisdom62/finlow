import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { redefinirSenha, senhaTemporariaDeAdulto, FORMATO_EMAIL } from "@/lib/ops-escola"

/**
 * Reposição de senha de uma conta QUALQUER, pela operação (superfície /ops).
 *
 * É a metade do item *Recuperação de senha* do backlog que NÃO depende de
 * escolher provedor de e-mail. O recurso de verdade — "esqueci minha senha"
 * com link no e-mail — continua parado numa decisão que não se toma dentro do
 * repositório (provedor, domínio verificado, SPF/DKIM, custo por mensagem).
 * O que este arquivo faz é tirar da mesa o "perdeu a conta para sempre":
 * quem escreve para o suporte volta a entrar hoje, pelas mãos da operação.
 *
 * Já existia a mesma operação para MEMBRO DE ESCOLA
 * (`redefinirSenha`, em lib/ops-escola.ts, com a tela em /ops/escolas/[id]).
 * Ela nasceu para a criança do lote, cujo login `.invalid` não recebe
 * mensagem nenhuma. Faltava exatamente o resto do mundo: o adulto que se
 * cadastrou com e-mail e senha e não tem escola nenhuma por trás — que é a
 * maior parte da base.
 *
 * Este arquivo é a REGRA; `app/api/ops/contas/*` é só a porta HTTP. Como
 * lib/ops-escola.ts, não importa `next/server` nem `next-auth`, para o
 * script de teste conseguir carregá-lo sem `--conditions react-server`.
 * Quem decide se a pessoa PODE fazer isto é lib/ops.ts, na rota.
 *
 * ⚠️ **Trocar a senha NÃO derruba as sessões já abertas.** A sessão é JWT
 * (`lib/auth.ts`, obrigatório com provider de credenciais), então quem entrou
 * com a senha antiga continua dentro até o token vencer. Isto está escrito
 * aqui e na tela porque muda o que a operação pode PROMETER: reposição
 * devolve o acesso de quem perdeu; ela não expulsa ninguém. Expulsar é
 * trabalho próprio (decisão 3 do item do backlog) e não sai de graça com
 * este.
 */

// ------------------------------------------------------------- a decisão ---

/** O que a operação pode fazer com uma conta, e por quê. */
export type AcaoDeReposicao =
  /** Tem senha (ou a operadora assumiu criar uma): sorteia e mostra uma vez. */
  | "repor"
  /** Só entra pelo Google. A senha que falta não existe — e não deveria nascer. */
  | "so_google"
  /** Nenhuma conta com esse login. */
  | "nao_existe"

export interface Reposicao {
  acao: AcaoDeReposicao
  /** A frase que a operadora lê na tela. Sempre preenchida. */
  motivo: string
}

/**
 * A decisão, sem banco e sem efeito: é o que este arquivo tem de mais
 * importante para testar, porque ela é a diferença entre devolver uma conta e
 * criar uma credencial que ninguém pediu.
 *
 * **Conta do Google é recusada por padrão, e isso é escolha.** Quando
 * `User.senha` é `null` a pessoa nunca teve senha: ela não esqueceu nada, ela
 * entra pelo botão do Google. A resposta certa para o pedido dela é "usa
 * Entrar com Google", que devolve o acesso na hora, sem a operação ver
 * segredo nenhum. Sortear uma senha ali faria três coisas ruins de uma vez:
 * responderia uma pergunta que não foi feita, poria uma credencial nova numa
 * conta que estava protegida pelo login do Google (verificação em duas etapas
 * inclusive), e faria a operadora conhecer a senha de alguém que não pediu.
 *
 * Mas a recusa tem um caso legítimo do outro lado: quem perdeu o acesso à
 * PRÓPRIA conta do Google. Para esse existe `assumirContaGoogle`, que é um
 * segundo clique com a consequência escrita — e não o default, porque default
 * é o que se faz sem ler.
 *
 * (A tela da escola decide diferente de propósito: lá a operadora está na
 * lista de membros de UMA escola, o vínculo já é a autorização, e o botão que
 * "não faz nada visível" seria pior. Aqui ela está respondendo a um pedido de
 * fora, e a assimetria é a razão de as duas regras não terem virado uma.)
 */
export function decidirReposicao(conta: {
  existe: boolean
  temSenha: boolean
  temGoogle: boolean
  assumirContaGoogle?: boolean
}): Reposicao {
  if (!conta.existe) {
    return { acao: "nao_existe", motivo: "Não existe conta com esse login." }
  }
  if (!conta.temSenha && conta.temGoogle && !conta.assumirContaGoogle) {
    return {
      acao: "so_google",
      motivo:
        "Essa conta entra pelo Google e nunca teve senha. Peça para usar o botão " +
        "“Entrar com Google” no /login: devolve o acesso na hora e sem senha nenhuma.",
    }
  }
  if (!conta.temSenha && !conta.temGoogle) {
    // Sem senha e sem Google não é caso de recusa: é conta órfã (o vínculo do
    // Google caiu, ou ela nasceu por um caminho que não existe mais). Sortear
    // a senha é a ÚNICA saída dela, e por isso passa sem confirmação extra.
    return { acao: "repor", motivo: "Conta sem senha e sem Google: a reposição é a única entrada." }
  }
  return { acao: "repor", motivo: "Conta com senha própria." }
}

// -------------------------------------------------------------- procurar ---

export interface ContaEncontrada {
  userId: string
  nome: string | null
  /** O que a pessoa digita para entrar. `.invalid` = aluno criado em lote. */
  login: string
  temSenha: boolean
  temGoogle: boolean
  /**
   * Escola, papel e id, quando a conta é membro de uma. O id vem junto porque
   * é ele que `reporSenhaDeConta` entrega a `redefinirSenha`: buscá-lo de novo
   * na hora de repor abriria uma janela entre "achei a pessoa" e "repus a
   * senha" que só existiria para ser tratada.
   */
  escola: { escolaId: string; nome: string; papel: string } | null
  /** A decisão já calculada, para a tela não repetir a regra. */
  reposicao: Reposicao
}

/**
 * Quem é a pessoa antes de mexer na conta dela.
 *
 * A tela procura ANTES de repor de propósito: reposição sem confirmar quem é
 * dá um clique de distância entre "a Ana esqueceu a senha" e trocar a senha
 * da Ana errada, e a operadora só descobriria pelo segundo pedido de suporte.
 *
 * Nada aqui vaza para fora de /ops: quem chama já passou por `exigirOps`.
 * A tela PÚBLICA (/recuperar-senha) não tem consulta nenhuma, e é por isso —
 * um formulário público que responde "essa conta existe" vira consulta de
 * "fulano usa o Finlow?", que num app de dinheiro é dado sensível sozinho,
 * antes de qualquer número (decisão 2 do item do backlog).
 */
export async function procurarConta(emailBruto: string): Promise<ContaEncontrada | null> {
  const login = emailBruto.trim().toLowerCase()
  if (!login) return null

  const u = await db.user.findUnique({
    where: { email: login },
    select: {
      id: true,
      nome: true,
      email: true,
      senha: true,
      accounts: { select: { provider: true } },
      membroEscola: { select: { papel: true, escolaId: true, escola: { select: { nome: true } } } },
    },
  })
  if (!u) return null

  const temSenha = Boolean(u.senha)
  const temGoogle = u.accounts.some((a) => a.provider === "google")
  return {
    userId: u.id,
    nome: u.nome,
    login: u.email,
    temSenha,
    temGoogle,
    escola: u.membroEscola
      ? {
          escolaId: u.membroEscola.escolaId,
          nome: u.membroEscola.escola.nome,
          papel: u.membroEscola.papel,
        }
      : null,
    reposicao: decidirReposicao({ existe: true, temSenha, temGoogle }),
  }
}

// ----------------------------------------------------------------- repor ---

export type ResultadoReposicao =
  | { ok: true; senha: string; login: string; aviso: string | null }
  | { ok: false; acao: AcaoDeReposicao | "login"; detalhe: string }

/**
 * Sorteia uma senha nova e devolve UMA vez. O banco guarda só o hash: nem
 * esta função nem a tela conseguem recuperá-la numa segunda chamada.
 *
 * **Membro de escola cai em `redefinirSenha`, não numa segunda escrita.** É a
 * mesma razão de `gravarAluno` existir: duas escritas da mesma coisa divergem
 * no primeiro ajuste que alguém fizer em uma só, e o ajuste que mais doeria
 * aqui é o do TAMANHO — seis caracteres legíveis para quem tem sete anos e
 * digita de um papel impresso, doze para adulto. Delegando, a régua do aluno
 * continua valendo por qual pessoa ela é, não por qual tela a operadora abriu.
 */
export async function reporSenhaDeConta(
  emailBruto: string,
  opts: { assumirContaGoogle?: boolean } = {}
): Promise<ResultadoReposicao> {
  const login = emailBruto.trim().toLowerCase()
  // O login de aluno em lote não é e-mail de verdade (`nome.sobrenome@escola.invalid`
  // ainda casa com o formato), mas texto solto casa com nada — e uma busca por
  // "ana" varrendo a tabela é um clique perdido, não um erro do banco.
  if (!login || !FORMATO_EMAIL.test(login)) {
    return { ok: false, acao: "login", detalhe: "Escreve o login inteiro, como a pessoa digita para entrar." }
  }

  const conta = await procurarConta(login)
  if (!conta) {
    return { ok: false, acao: "nao_existe", detalhe: decidirReposicao({ existe: false, temSenha: false, temGoogle: false }).motivo }
  }

  const decisao = decidirReposicao({
    existe: true,
    temSenha: conta.temSenha,
    temGoogle: conta.temGoogle,
    assumirContaGoogle: opts.assumirContaGoogle,
  })
  if (decisao.acao !== "repor") {
    return { ok: false, acao: decisao.acao, detalhe: decisao.motivo }
  }

  // Aviso que a operadora precisa REPETIR para quem pediu — a resposta de
  // suporte fica errada sem ele, e errada de um jeito que só aparece depois.
  const aviso = avisoDeReposicao(conta, Boolean(opts.assumirContaGoogle))

  if (conta.escola) {
    const r = await redefinirSenha(conta.escola.escolaId, conta.userId)
    if (!r.ok) return { ok: false, acao: "nao_existe", detalhe: r.detalhe }
    return { ok: true, senha: r.senha, login: conta.login, aviso }
  }

  const senha = senhaTemporariaDeAdulto()
  await db.user.update({
    where: { id: conta.userId },
    data: { senha: await bcrypt.hash(senha, 10) },
  })
  return { ok: true, senha, login: conta.login, aviso }
}

/**
 * O que a operadora tem de dizer junto com a senha. Puro, e por isso testável
 * — a frase que falta é a que vira o segundo pedido de suporte.
 */
export function avisoDeReposicao(
  conta: { temGoogle: boolean; escola: { nome: string; papel: string } | null },
  /** true quando a operadora usou o segundo clique da conta só do Google. */
  assumiuContaGoogle: boolean
): string | null {
  const partes: string[] = []
  if (assumiuContaGoogle) {
    partes.push(
      "Essa conta não tinha senha: agora tem, e passa a entrar pelos dois caminhos (senha e Google)."
    )
  } else if (conta.temGoogle) {
    partes.push("A conta também entra pelo Google, e continua entrando.")
  }
  if (conta.escola) {
    partes.push(
      `A pessoa é ${conta.escola.papel} da escola ${conta.escola.nome}. A própria escola também repõe essa senha, em /ops/escolas.`
    )
  }
  return partes.length > 0 ? partes.join(" ") : null
}
