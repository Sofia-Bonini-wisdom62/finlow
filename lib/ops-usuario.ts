import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { MIN_BUSCA_CONTA } from "@/lib/constantes"
import { caminhoDeRecuperacao, senhaDeAluno, senhaDeAdulto, type CaminhoDeRecuperacao } from "@/lib/senha"

/**
 * A reposição de senha pela OPERAÇÃO, para qualquer conta do Finlow.
 *
 * ── Por que existe (05/09/2026) ────────────────────────────────────────────
 * O backlog registrou em 30/08 que não há "esqueci minha senha" nenhum no
 * produto, e que a consequência é perder a conta inteira — histórico
 * financeiro, objetivos, trilha e conversas. Registrou também o que trava o
 * recurso de verdade: não existe envio de e-mail neste repositório, e escolher
 * um provedor é decisão com contrato, custo e credencial de produção.
 *
 * E registrou a saída que não depende dessa decisão, que é esta: reposição
 * pela operação. Não é o recurso — não atende quem esqueceu a senha às 23h de
 * um domingo —, mas tira o "perdeu a conta para sempre" da mesa enquanto a
 * decisão do provedor não vem.
 *
 * ── Isto já existia, e só para escola ──────────────────────────────────────
 * `redefinirSenha` (lib/ops-escola.ts) faz exatamente isto desde 18/08, e
 * recusa quem não é membro de uma escola. Ou seja: a criança de 8 anos tinha
 * saída e a assinante adulta não tinha nenhuma — que é justo o público do
 * pedido. Aquela função agora delega a escrita para cá, em vez de manter uma
 * segunda cópia do "sorteia, faz o hash e grava".
 *
 * ── O que este arquivo custa, dito em voz alta ─────────────────────────────
 * Quem opera passa a poder definir a senha de qualquer pessoa e, com ela,
 * entrar na conta e ler o dinheiro dela. Não é uma capacidade NOVA — a chave
 * de criptografia é variável de ambiente do servidor e lib/cripto.ts já diz,
 * com todas as letras, que quem executa código no servidor lê tudo. Mas é uma
 * capacidade que passa a caber num toque, e toque não deixa rastro sozinho.
 * Por isso toda reposição vai para o log com o e-mail de quem operou, como já
 * ia a da escola, e por isso a senha sorteada aparece UMA vez na resposta e
 * nunca é gravada em claro.
 */

export type ResultadoSenha =
  | { ok: true; senha: string; login: string; eraSoGoogle: boolean }
  | { ok: false; detalhe: string }

/**
 * Sorteia uma senha nova para uma conta e devolve UMA vez.
 *
 * `curta` é o aluno que digita de um papel impresso (6 caracteres legíveis);
 * o resto é adulto, que tem gerenciador ou pelo menos teclado.
 *
 * ⚠️ Conta que só entrava pelo Google ganha senha própria aqui e passa a poder
 * entrar pelos dois caminhos. É efeito colateral aceito — sem ele o botão não
 * faria nada visível —, mas agora ele SAI NO RESULTADO (`eraSoGoogle`), para a
 * tela poder avisar antes de a operadora ditar uma senha a quem nunca teve
 * uma. Antes disto o efeito era só um comentário no código.
 *
 * O hash nunca é lido: para saber se havia senha, a consulta pergunta ao banco
 * `senha: { not: null }` e recebe um id. Carregar o hash para dentro do
 * processo só para testá-lo contra null é expô-lo a todo log e a todo erro
 * serializado no caminho, sem nenhuma necessidade.
 */
export async function redefinirSenhaDaConta(
  userId: string,
  opts: { curta?: boolean } = {}
): Promise<ResultadoSenha> {
  const conta = await db.user.findUnique({ where: { id: userId }, select: { id: true, email: true } })
  if (!conta) return { ok: false, detalhe: "Não existe conta com esse id." }

  const comSenha = await db.user.findFirst({
    where: { id: userId, senha: { not: null } },
    select: { id: true },
  })

  const senha = opts.curta ? senhaDeAluno() : senhaDeAdulto()
  await db.user.update({ where: { id: userId }, data: { senha: await bcrypt.hash(senha, 10) } })

  return { ok: true, senha, login: conta.email, eraSoGoogle: !comSenha }
}

// ---------------------------------------------------------------- procura ---

export interface ContaEncontrada {
  id: string
  email: string
  nome: string | null
  criadoEm: Date
  /** Por onde esta conta volta hoje: "senha" | "google" | "escola". */
  caminho: CaminhoDeRecuperacao
  /** A escola dela, quando tem — é o que diz se a reposição é assunto da escola. */
  escola: { nome: string; papel: string } | null
}

/**
 * Menos que isto varre a base inteira num descuido de teclado. O número mora
 * em lib/constantes.ts porque a tela (cliente) também precisa dele, e este
 * arquivo importa o Prisma.
 */
export { MIN_BUSCA_CONTA } from "@/lib/constantes"

/** Uma tela que devolve 500 contas não é busca, é despejo. */
const MAX_RESULTADOS = 20

/**
 * Acha a conta pelo que a pessoa escreve no e-mail de suporte: o endereço, o
 * nome, ou o id que ela copiou de algum lugar.
 *
 * É consulta de dados de terceiros, e por isso vive atrás do guard de /ops
 * (lib/ops.ts) e recusa termo curto: `q=a` devolveria a base ordenada por
 * acaso, o que é um vazamento com cara de funcionalidade.
 *
 * O HASH NUNCA É SELECIONADO. Para saber se a conta tem senha, uma segunda
 * consulta pergunta quais dos ids achados têm `senha: { not: null }` e traz de
 * volta só ids. Trazer o hash para marcar um booleano seria carregar o
 * segredo de N pessoas para dentro de um processo que só precisa contar.
 */
export async function procurarContas(termo: string): Promise<ContaEncontrada[]> {
  const q = termo.trim()
  if (q.length < MIN_BUSCA_CONTA) return []

  const achadas = await db.user.findMany({
    where: {
      OR: [
        { id: q },
        { email: { contains: q, mode: "insensitive" } },
        { nome: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      email: true,
      nome: true,
      criadoEm: true,
      membroEscola: { select: { papel: true, escola: { select: { nome: true } } } },
    },
    orderBy: { criadoEm: "desc" },
    take: MAX_RESULTADOS,
  })
  if (achadas.length === 0) return []

  const comSenha = new Set(
    (
      await db.user.findMany({
        where: { id: { in: achadas.map((u) => u.id) }, senha: { not: null } },
        select: { id: true },
      })
    ).map((u) => u.id)
  )

  return achadas.map((u) => ({
    id: u.id,
    email: u.email,
    nome: u.nome,
    criadoEm: u.criadoEm,
    caminho: caminhoDeRecuperacao({ email: u.email, temSenha: comSenha.has(u.id) }),
    escola: u.membroEscola
      ? { nome: u.membroEscola.escola.nome, papel: u.membroEscola.papel }
      : null,
  }))
}
