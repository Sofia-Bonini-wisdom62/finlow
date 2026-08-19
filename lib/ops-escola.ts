import { randomBytes, randomInt } from "node:crypto"
import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import { ehPublico, PUBLICO_ATUAL } from "@/lib/publico"
import { ehPapel } from "@/lib/escola-papeis"

/**
 * As operações que a fundadora faz sobre escolas (superfície /ops).
 *
 * Este arquivo é a REGRA; `app/api/ops/*` é só a porta HTTP e
 * `scripts/criar-escola.mts` é a porta de linha de comando. As duas chamam as
 * mesmas funções daqui, e essa é a razão de o arquivo existir: enquanto criar
 * escola morava só dentro do script, a tela teria de reescrever a transação,
 * e duas escritas do mesmo vínculo divergem no primeiro ajuste que alguém
 * fizer em uma só.
 *
 * Nada aqui importa `next/server` nem `next-auth`, para o script continuar
 * podendo importar o módulo sem `--conditions react-server`. Quem decide se a
 * pessoa PODE fazer isto é lib/ops.ts, na rota.
 */

// ---------------------------------------------------------------- criar ---

export type MotivoCriacao = "nome" | "email" | "vigencia" | "ja_e_membro"

export type ResultadoCriacao =
  | { ok: true; escolaId: string; userId: string; senhaTemporaria: string | null; contaNova: boolean }
  | { ok: false; motivo: MotivoCriacao; detalhe: string }

export const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Cria a escola e a conta do adm dela, numa transação só.
 *
 * Se o e-mail já tem conta, ela vira o adm. Se não tem, a conta nasce com
 * senha temporária que o CHAMADOR mostra uma única vez: o banco guarda só o
 * hash, e nem a tela nem o script conseguem recuperá-la depois. Recusa quando
 * a conta já pertence a outra escola, porque `MembroEscola.userId` é @unique
 * e o estouro do banco explicaria muito pior do que esta mensagem.
 *
 * `ativaAte` no passado é recusado de propósito: vigência vencida no momento
 * da criação é suspensão disfarçada, e para suspender existe o status.
 */
export async function criarEscolaComAdm(opts: {
  nome: string
  admEmail: string
  ativaAte?: Date | null
  agora?: Date
}): Promise<ResultadoCriacao> {
  const nome = opts.nome.trim()
  const admEmail = opts.admEmail.trim().toLowerCase()
  const agora = opts.agora ?? new Date()

  if (nome.length < 2) {
    return { ok: false, motivo: "nome", detalhe: "O nome da escola não pode ser vazio." }
  }
  if (!FORMATO_EMAIL.test(admEmail)) {
    return { ok: false, motivo: "email", detalhe: `E-mail inválido: ${admEmail}` }
  }
  if (opts.ativaAte && opts.ativaAte <= agora) {
    return {
      ok: false,
      motivo: "vigencia",
      detalhe: "Essa data já passou. Vigência vencida na criação é suspensão disfarçada, use o status.",
    }
  }

  const existente = await db.user.findUnique({
    where: { email: admEmail },
    select: {
      id: true,
      membroEscola: { select: { papel: true, escola: { select: { nome: true } } } },
    },
  })

  if (existente?.membroEscola) {
    return {
      ok: false,
      motivo: "ja_e_membro",
      detalhe: `${admEmail} já é ${existente.membroEscola.papel} da escola "${existente.membroEscola.escola.nome}". Uma conta pertence a uma escola só.`,
    }
  }

  const senhaTemporaria = existente ? null : randomBytes(9).toString("base64url")

  const criado = await db.$transaction(async (tx) => {
    const escola = await tx.escola.create({
      data: { nome, status: "ativa", ativaAte: opts.ativaAte ?? null },
      select: { id: true },
    })
    const userId =
      existente?.id ??
      (
        await tx.user.create({
          data: { email: admEmail, senha: await bcrypt.hash(senhaTemporaria!, 10) },
          select: { id: true },
        })
      ).id
    await tx.membroEscola.create({ data: { userId, escolaId: escola.id, papel: "adm" } })
    return { escolaId: escola.id, userId }
  })

  return { ...criado, ok: true, senhaTemporaria, contaNova: !existente }
}

// ---------------------------------------------------------------- listar ---

export interface EscolaNaLista {
  id: string
  nome: string
  status: string
  ativaAte: Date | null
  membros: number
  turmas: number
  /** A MESMA régua que decide o premium do membro (decidirAcessoEscolar). */
  valendo: boolean
}

/**
 * A lista de escolas, com o veredito de vigência já resolvido.
 *
 * O veredito vem daqui e não da tela por dois motivos. O primeiro é honestidade:
 * "ativa" no banco e "valendo hoje" são coisas diferentes quando a vigência
 * venceu ontem, e uma lista que mostra só o status mentiria exatamente no caso
 * que interessa. O segundo é o relógio: ler a hora durante o render é chamada
 * impura, e o lint do React recusa, com razão.
 */
export async function listarEscolas(agora: Date = new Date()): Promise<EscolaNaLista[]> {
  const { decidirAcessoEscolar } = await import("@/lib/pagamento/acesso")
  const escolas = await db.escola.findMany({
    select: {
      id: true,
      nome: true,
      status: true,
      ativaAte: true,
      _count: { select: { turmas: true, membros: true } },
    },
    orderBy: { criadoEm: "desc" },
  })
  return escolas.map((e) => ({
    id: e.id,
    nome: e.nome,
    status: e.status,
    ativaAte: e.ativaAte,
    membros: e._count.membros,
    turmas: e._count.turmas,
    valendo: decidirAcessoEscolar(e.status, e.ativaAte, agora),
  }))
}

// -------------------------------------------------------------- vigência ---

export type ResultadoSimples = { ok: true } | { ok: false; detalhe: string }

/**
 * Suspender e reativar. Suspensa recusa TODO papel, adm inclusive
 * (lib/escola.ts), e é por isso que o botão vive aqui e não lá dentro: quem
 * suspende não pode ser quem foi suspenso.
 */
export async function mudarStatusDaEscola(
  escolaId: string,
  status: "ativa" | "suspensa"
): Promise<ResultadoSimples> {
  if (status !== "ativa" && status !== "suspensa") {
    return { ok: false, detalhe: "Status desconhecido." }
  }
  await db.escola.update({ where: { id: escolaId }, data: { status } })
  return { ok: true }
}

/**
 * O fim do contrato. `null` devolve a escola ao piloto sem prazo.
 *
 * A data chega como AAAA-MM-DD e vira o FIM daquele dia no fuso de São Paulo,
 * a mesma conversão que o script fazia: "vale até 31/12" tem de incluir o dia
 * 31 inteiro, senão a escola perde acesso na virada da madrugada anterior.
 */
export function fimDoDiaEmSaoPaulo(dataISO: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataISO)) return null
  const d = new Date(`${dataISO}T23:59:59-03:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

export async function mudarVigencia(
  escolaId: string,
  ativaAte: Date | null
): Promise<ResultadoSimples> {
  await db.escola.update({ where: { id: escolaId }, data: { ativaAte } })
  return { ok: true }
}

// --------------------------------------------------------------- membros ---

/**
 * Escola sem nenhum adm é escola que ninguém consegue administrar de dentro.
 *
 * A fundadora sempre conseguiria consertar por /ops, então isto não é um
 * bloqueio de segurança: é um freio contra o passo em falso mais fácil de
 * dar, que é rebaixar a si mesma numa lista de nomes parecidos.
 */
async function seriaOUltimoAdm(escolaId: string, userId: string): Promise<boolean> {
  const admins = await db.membroEscola.count({ where: { escolaId, papel: "adm" } })
  if (admins > 1) return false
  const eu = await db.membroEscola.findFirst({
    where: { escolaId, userId, papel: "adm" },
    select: { id: true },
  })
  return !!eu
}

/**
 * Troca o papel de quem já está na escola. Era o buraco da superfície de
 * escola: `MembroEscola` só nascia por resgate de convite, e mudar um aluno
 * para professor exigia Prisma Studio.
 *
 * SAIR de aluno limpa o rastro de aluno: as turmas e a trilha escolar. Sem
 * isso o promovido continuaria contando como aluno no rank da sala e no
 * denominador do desempenho, e continuaria vendo a trilha do 5º ano no
 * próprio app. Entrar como aluno NÃO faz o inverso: matrícula em turma tem
 * porta própria (o convite), e adivinhar a turma seria pior do que não ter.
 */
export async function trocarPapel(
  escolaId: string,
  userId: string,
  papel: string
): Promise<ResultadoSimples> {
  if (!ehPapel(papel)) return { ok: false, detalhe: "Papel desconhecido." }

  const atual = await db.membroEscola.findFirst({
    where: { escolaId, userId },
    select: { papel: true },
  })
  if (!atual) return { ok: false, detalhe: "Essa pessoa não está nesta escola." }
  if (atual.papel === papel) return { ok: true }
  if (papel !== "adm" && (await seriaOUltimoAdm(escolaId, userId))) {
    return { ok: false, detalhe: "É o único adm da escola. Promova outra pessoa antes." }
  }

  await db.$transaction(async (tx) => {
    await tx.membroEscola.updateMany({ where: { escolaId, userId }, data: { papel } })
    if (atual.papel === "aluno" && papel !== "aluno") {
      await tx.membroTurma.deleteMany({ where: { userId, turma: { escolaId } } })
      await tx.user.update({ where: { id: userId }, data: { publico: PUBLICO_ATUAL } })
    }
  })
  return { ok: true }
}

/**
 * Tira a pessoa da escola sem apagar a conta: ela vira usuária comum do
 * Finlow, com o progresso intacto. Apagar conta continua sendo só da própria
 * pessoa, em /api/conta, e essa fronteira é de propósito.
 *
 * As turmas que ela lecionava ficam SEM professor em vez de sumir, que é o
 * mesmo desenho do `onDelete: SetNull` do schema: turma é dos alunos.
 */
export async function removerMembro(
  escolaId: string,
  userId: string
): Promise<ResultadoSimples> {
  const atual = await db.membroEscola.findFirst({
    where: { escolaId, userId },
    select: { papel: true },
  })
  if (!atual) return { ok: false, detalhe: "Essa pessoa não está nesta escola." }
  if (await seriaOUltimoAdm(escolaId, userId)) {
    return { ok: false, detalhe: "É o único adm da escola. Promova outra pessoa antes." }
  }

  await db.$transaction(async (tx) => {
    await tx.membroTurma.deleteMany({ where: { userId, turma: { escolaId } } })
    await tx.turma.updateMany({ where: { escolaId, professorId: userId }, data: { professorId: null } })
    await tx.competenciaProfessor.deleteMany({ where: { escolaId, userId } })
    await tx.membroEscola.deleteMany({ where: { escolaId, userId } })
    if (atual.papel === "aluno") {
      await tx.user.update({ where: { id: userId }, data: { publico: PUBLICO_ATUAL } })
    }
  })
  return { ok: true }
}

/**
 * Designa (ou tira) o professor de uma turma. O comentário do schema já
 * prometia que "o adm designa outro professor" quando o anterior sai, mas
 * nenhuma rota escrevia `professorId`, e turma criada por adm nascia órfã.
 */
export async function designarProfessor(
  escolaId: string,
  turmaId: string,
  professorId: string | null
): Promise<ResultadoSimples> {
  const turma = await db.turma.findFirst({ where: { id: turmaId, escolaId }, select: { id: true } })
  if (!turma) return { ok: false, detalhe: "Turma não encontrada nesta escola." }

  if (professorId) {
    const m = await db.membroEscola.findFirst({
      where: { escolaId, userId: professorId, papel: { in: ["professor", "adm"] } },
      select: { id: true },
    })
    if (!m) return { ok: false, detalhe: "Só professor ou adm desta escola pode receber uma turma." }
  }
  await db.turma.update({ where: { id: turmaId }, data: { professorId } })
  return { ok: true }
}

// -------------------------------------------------------------- convites ---

/**
 * Revoga o código. `revogadoEm` existia no schema desde o começo e era lido
 * em quatro lugares (o preview, o motivo de recusa e o `where` do resgate)
 * sem que nada jamais o escrevesse: um link vazado no grupo errado só morria
 * por expirar ou por esgotar os 50 usos.
 */
export async function revogarConvite(conviteId: string): Promise<ResultadoSimples> {
  const r = await db.conviteEscola.updateMany({
    where: { id: conviteId, revogadoEm: null },
    data: { revogadoEm: new Date() },
  })
  if (r.count === 0) return { ok: false, detalhe: "Esse convite não existe ou já estava revogado." }
  return { ok: true }
}

// ------------------------------------------------------- alunos em lote ---

/**
 * ⚠️ CONTAS DE ALUNO CRIADAS PELA OPERAÇÃO (decisão da fundadora, 18/08/2026).
 *
 * O caminho normal de matrícula é o convite: o aluno cria a própria conta e a
 * escola nunca toca na senha dele. Isto aqui é a exceção pedida para o
 * Fundamental 1, onde a criança não tem e-mail nem celular para receber link.
 *
 * O que a exceção custa, escrito porque custa mesmo: a escola passa a
 * conhecer a senha inicial de cada aluno, e o Finlow passa a guardar nome de
 * criança sem nenhum consentimento coletado no produto. A pendência de LGPD
 * de menores segue ABERTA em docs/backlog-produto.md, e a decisão registrada
 * é usar isto com risco assumido até o texto jurídico existir.
 *
 * O que a exceção NÃO faz, para o risco não crescer sozinho: não pede e não
 * guarda data de nascimento, e-mail, telefone nem nome de responsável. Só o
 * nome, porque sem ele o professor não sabe quem é quem na lista.
 */

/**
 * Os acentos, para tirar depois do NFD. Montado por `new RegExp` e não por
 * literal: o range U+0300 a U+036F são caracteres COMBINANTES, invisíveis no
 * fonte, e um copia-e-cola distraído os apaga sem mudar nada que se veja.
 * (`\p{M}` resolveria em uma linha, mas o target do projeto é ES2017.)
 */
const ACENTOS = new RegExp("[\\u0300-\\u036f]", "g")

/** Alfabeto sem caractere ambíguo: quem digita a senha tem 7 anos. */
const ALFABETO_SENHA = "abcdefghjkmnpqrstuvwxyz23456789"

export function senhaDeAluno(tamanho = 6): string {
  let s = ""
  for (let i = 0; i < tamanho; i++) s += ALFABETO_SENHA[randomInt(ALFABETO_SENHA.length)]
  return s
}

/** "José da Silva Júnior" vira "jose.silva". Puro, e por isso testável. */
export function apelidoDeLogin(nome: string): string {
  const limpo = nome
    .normalize("NFD")
    .replace(ACENTOS, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (limpo.length === 0) return "aluno"
  const primeiro = limpo[0]
  const ultimo = limpo.length > 1 ? limpo[limpo.length - 1] : ""
  return (ultimo ? `${primeiro}.${ultimo}` : primeiro).slice(0, 40)
}

/** "Colégio São José" vira "colegio.sao.jose". */
export function dominioDaEscola(nomeEscola: string): string {
  const s = nomeEscola
    .normalize("NFD")
    .replace(ACENTOS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 40)
  return s || "escola"
}

/**
 * O "e-mail" do aluno criado em lote, que não é um e-mail e não pode fingir
 * que é.
 *
 * O login precisa caber em `User.email` porque é ali que o provider de
 * credenciais procura (lib/auth.ts), e a coluna é @unique. O domínio é
 * `.invalid`, que a RFC 2606 reserva justamente para nunca resolver: nenhuma
 * mensagem sai daqui por engano, nenhum "esqueci a senha" promete um link que
 * não chega, e qualquer pessoa lendo a tabela vê na hora que aquilo não é um
 * endereço de verdade.
 *
 * `ocupados` recebe os logins já usados nesta escola E os que esta mesma
 * rodada acabou de gerar: duas Marias Silva na mesma lista precisam sair
 * daqui como maria.silva e maria.silva2 antes de qualquer banco reclamar.
 */
export function loginDeAluno(nome: string, dominio: string, ocupados: Set<string>): string {
  const base = apelidoDeLogin(nome)
  let tentativa = `${base}@${dominio}.invalid`
  let n = 1
  while (ocupados.has(tentativa)) {
    n++
    tentativa = `${base}${n}@${dominio}.invalid`
  }
  return tentativa
}

/**
 * Uma linha por aluno. Aceita "Nome" e também "Nome, alguma coisa" ou
 * "Nome;coisa" (planilha colada), ficando com a primeira coluna: colar direto
 * do Excel é o caminho real, e exigir limpeza antes seria devolver o trabalho
 * para quem pediu a tela.
 */
export function interpretarLista(texto: string): { nomes: string[]; ignoradas: number } {
  const linhas = texto.split(/\r?\n/)
  const nomes: string[] = []
  let ignoradas = 0
  for (const linha of linhas) {
    const primeira = linha.split(/[,;\t]/)[0].trim().replace(/\s+/g, " ")
    if (!primeira) continue
    if (primeira.length < 2) {
      ignoradas++
      continue
    }
    nomes.push(primeira.slice(0, 80))
  }
  return { nomes, ignoradas }
}

export interface AlunoCriado {
  nome: string
  login: string
  senha: string
}

export type ResultadoLote =
  | { ok: true; criados: AlunoCriado[]; ignoradas: number }
  | { ok: false; detalhe: string }

/**
 * Cria as contas e matricula todas na turma.
 *
 * As três escritas por aluno são as MESMAS de `resgatarConvite`: vínculo com
 * a escola, vínculo com a turma e `publico` apontando para o segmento dela.
 * Não dá para chamar aquela função aqui porque ela existe para consumir um
 * código, e inventar um convite descartável por aluno sujaria a contagem de
 * usos que é o freio do outro fluxo.
 *
 * Uma transação POR ALUNO, não uma para a lista inteira: numa lista de trinta
 * nomes, a falha de um não pode desfazer os vinte e nove que entraram, e a
 * senha dos que entraram só aparece uma vez.
 */
export async function criarAlunosEmLote(opts: {
  escolaId: string
  turmaId: string
  texto: string
}): Promise<ResultadoLote> {
  const turma = await db.turma.findFirst({
    where: { id: opts.turmaId, escolaId: opts.escolaId },
    select: { id: true, segmento: true, escola: { select: { nome: true } } },
  })
  if (!turma) return { ok: false, detalhe: "Turma não encontrada nesta escola." }

  const { nomes, ignoradas } = interpretarLista(opts.texto)
  if (nomes.length === 0) return { ok: false, detalhe: "Nenhum nome legível na lista." }
  if (nomes.length > 200) {
    return { ok: false, detalhe: "São 200 alunos por vez, no máximo. Quebra a lista." }
  }

  const dominio = dominioDaEscola(turma.escola.nome)
  const jaExistem = await db.user.findMany({
    where: { email: { endsWith: `@${dominio}.invalid` } },
    select: { email: true },
  })
  const ocupados = new Set(jaExistem.map((u) => u.email))

  const criados: AlunoCriado[] = []
  for (const nome of nomes) {
    const login = loginDeAluno(nome, dominio, ocupados)
    ocupados.add(login)
    const senha = senhaDeAluno()
    const hash = await bcrypt.hash(senha, 10)
    try {
      await gravarAluno({
        escolaId: opts.escolaId,
        turmaId: turma.id,
        segmento: turma.segmento,
        nome,
        login,
        hash,
      })
      criados.push({ nome, login, senha })
    } catch (e) {
      // Nome que colide de um jeito que o Set não previu (duas rodadas no
      // mesmo segundo) apenas não entra: a lista devolvida é a verdade do que
      // existe, e a operadora roda de novo com os que faltaram.
      console.error("[ops] aluno em lote:", nome, (e as Error)?.message)
    }
  }

  if (criados.length === 0) {
    return { ok: false, detalhe: "Nenhuma conta foi criada. Confere a lista e tenta de novo." }
  }
  return { ok: true, criados, ignoradas }
}

/**
 * As TRÊS escritas que fazem um aluno existir, num lugar só.
 *
 * São exatamente as de `resgatarConvite`: vínculo com a escola, vínculo com a
 * turma e `publico` apontando para o segmento dela. Viraram função quando o
 * cadastro individual nasceu ao lado do lote, porque duas cópias da mesma
 * transação divergem no primeiro ajuste, e o ajuste que mais dói é o do
 * `publico`: esquecer dele num dos caminhos cria aluno de 5º ano olhando a
 * trilha adulta, sem erro nenhum na tela.
 */
async function gravarAluno(opts: {
  escolaId: string
  turmaId: string
  segmento: string
  nome: string
  login: string
  hash: string
}): Promise<string> {
  return db.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: {
        nome: opts.nome,
        email: opts.login,
        senha: opts.hash,
        publico: ehPublico(opts.segmento) ? opts.segmento : PUBLICO_ATUAL,
      },
      select: { id: true },
    })
    await tx.membroEscola.create({
      data: { userId: u.id, escolaId: opts.escolaId, papel: "aluno" },
    })
    await tx.membroTurma.create({ data: { turmaId: opts.turmaId, userId: u.id } })
    return u.id
  })
}

/** Senha temporária de adulto: 12 caracteres, a mesma do adm da escola. */
function senhaTemporariaDeAdulto(): string {
  return randomBytes(9).toString("base64url")
}

/**
 * O nome, limpo e conferido. Pura, e por isso testável.
 *
 * Vive fora de `adicionarPessoa` e `editarMembro` porque as duas precisam da
 * MESMA régua: um nome que entra no cadastro e é recusado na edição obrigaria
 * a operadora a descobrir a diferença por tentativa.
 */
export function normalizarNome(bruto: string): { ok: true; nome: string } | { ok: false; detalhe: string } {
  const nome = bruto.trim().replace(/\s+/g, " ")
  if (nome.length < 2) return { ok: false, detalhe: "O nome não pode ser vazio." }
  if (nome.length > 80) return { ok: false, detalhe: "Esse nome é longo demais." }
  return { ok: true, nome }
}

// -------------------------------------------------- adicionar uma pessoa ---

export interface PessoaCriada {
  /** O que a pessoa digita para entrar: e-mail de verdade ou login .invalid. */
  login: string
  /** Só quando a conta NASCEU aqui. null = conta já existia, senha é a dela. */
  senha: string | null
  contaNova: boolean
}

export type ResultadoPessoa = ({ ok: true } & PessoaCriada) | { ok: false; detalhe: string }

/**
 * Adiciona UMA pessoa à escola, já com papel, sem passar por convite.
 *
 * O convite continua sendo o caminho normal, e a diferença entre os dois não é
 * de conveniência: no convite a pessoa escolhe a própria senha e a escola
 * nunca a conhece. Aqui a escola conhece, porque foi ela quem criou. Vale a
 * mesma ressalva do lote, e por isso este caminho existe para quando a lista
 * chega pronta no papel, não como preferência.
 *
 * Se o e-mail já tem conta no Finlow, ela é VINCULADA em vez de recriada, e a
 * senha continua sendo a que a pessoa já usava. Mesmo desenho de
 * `criarEscolaComAdm`, pela mesma razão: recusar quem já existe faria a
 * operadora inventar um segundo e-mail para a mesma pessoa.
 */
export async function adicionarPessoa(opts: {
  escolaId: string
  papel: "professor" | "aluno"
  nome: string
  /** Opcional para aluno (vira login .invalid); obrigatório para professor. */
  email?: string | null
  /** Obrigatório para aluno. */
  turmaId?: string | null
}): Promise<ResultadoPessoa> {
  const v = normalizarNome(opts.nome)
  if (!v.ok) return v
  const nome = v.nome

  const emailBruto = opts.email?.trim().toLowerCase() ?? ""

  // Professor sem e-mail não teria como recuperar a conta: o login .invalid é
  // concessão feita à criança que não tem endereço, e esticá-la para adulto
  // criaria conta que ninguém consegue destravar.
  if (opts.papel === "professor" && !emailBruto) {
    return { ok: false, detalhe: "Professor precisa de e-mail: é por ele que a conta é recuperada." }
  }
  if (emailBruto && !FORMATO_EMAIL.test(emailBruto)) {
    return { ok: false, detalhe: `E-mail inválido: ${emailBruto}` }
  }

  if (emailBruto) {
    const existente = await db.user.findUnique({
      where: { email: emailBruto },
      select: {
        id: true,
        membroEscola: { select: { papel: true, escola: { select: { nome: true } } } },
      },
    })
    if (existente?.membroEscola) {
      return {
        ok: false,
        detalhe: `${emailBruto} já é ${existente.membroEscola.papel} da escola "${existente.membroEscola.escola.nome}". Uma conta pertence a uma escola só.`,
      }
    }
    if (existente) {
      const r = await vincularContaExistente(existente.id, opts)
      return r.ok ? { ok: true, login: emailBruto, senha: null, contaNova: false } : r
    }
  }

  if (opts.papel === "professor") {
    const senha = senhaTemporariaDeAdulto()
    const hash = await bcrypt.hash(senha, 10)
    await db.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: { nome, email: emailBruto, senha: hash },
        select: { id: true },
      })
      await tx.membroEscola.create({
        data: { userId: u.id, escolaId: opts.escolaId, papel: "professor" },
      })
    })
    return { ok: true, login: emailBruto, senha, contaNova: true }
  }

  // Aluno: precisa de turma, porque é dela que sai a trilha dele.
  if (!opts.turmaId) return { ok: false, detalhe: "Escolhe a turma do aluno." }
  const turma = await db.turma.findFirst({
    where: { id: opts.turmaId, escolaId: opts.escolaId },
    select: { id: true, segmento: true, escola: { select: { nome: true } } },
  })
  if (!turma) return { ok: false, detalhe: "Turma não encontrada nesta escola." }

  let login = emailBruto
  if (!login) {
    const dominio = dominioDaEscola(turma.escola.nome)
    const jaExistem = await db.user.findMany({
      where: { email: { endsWith: `@${dominio}.invalid` } },
      select: { email: true },
    })
    login = loginDeAluno(nome, dominio, new Set(jaExistem.map((u) => u.email)))
  }

  const senha = senhaDeAluno()
  try {
    await gravarAluno({
      escolaId: opts.escolaId,
      turmaId: turma.id,
      segmento: turma.segmento,
      nome,
      login,
      hash: await bcrypt.hash(senha, 10),
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, detalhe: "Já existe conta com esse login. Tenta de novo." }
    }
    throw e
  }
  return { ok: true, login, senha, contaNova: true }
}

/** Conta que já existe no Finlow entrando numa escola pela primeira vez. */
async function vincularContaExistente(
  userId: string,
  opts: { escolaId: string; papel: "professor" | "aluno"; turmaId?: string | null }
): Promise<ResultadoSimples> {
  if (opts.papel === "professor") {
    await db.membroEscola.create({
      data: { userId, escolaId: opts.escolaId, papel: "professor" },
    })
    return { ok: true }
  }
  if (!opts.turmaId) return { ok: false, detalhe: "Escolhe a turma do aluno." }
  const turma = await db.turma.findFirst({
    where: { id: opts.turmaId, escolaId: opts.escolaId },
    select: { id: true, segmento: true },
  })
  if (!turma) return { ok: false, detalhe: "Turma não encontrada nesta escola." }

  await db.$transaction(async (tx) => {
    await tx.membroEscola.create({ data: { userId, escolaId: opts.escolaId, papel: "aluno" } })
    await tx.membroTurma.create({ data: { turmaId: turma.id, userId } })
    if (ehPublico(turma.segmento)) {
      await tx.user.update({ where: { id: userId }, data: { publico: turma.segmento } })
    }
  })
  return { ok: true }
}

// ----------------------------------------------------- editar uma pessoa ---

/**
 * Muda o que a escola sabe sobre a pessoa: nome, login e turma.
 *
 * Campo AUSENTE não é mexido, que é diferente de mandar vazio. É o que deixa a
 * tela enviar só o que a operadora tocou, e o que impede abrir um formulário e
 * fechar sem editar de apagar o nome de alguém.
 *
 * TROCAR DE TURMA aqui MOVE o aluno: ele sai das turmas que tinha NESTA escola
 * e entra na escolhida. O schema permite N:N de propósito (o mesmo aluno na
 * sala e no clube de reforço), e esta tela não serve esse caso: serve o comum,
 * que é "entrou na turma errada". Quem precisa de duas turmas usa o convite da
 * segunda, que soma em vez de mover.
 */
export async function editarMembro(opts: {
  escolaId: string
  userId: string
  nome?: string
  email?: string
  turmaId?: string
}): Promise<ResultadoSimples> {
  const membro = await db.membroEscola.findFirst({
    where: { escolaId: opts.escolaId, userId: opts.userId },
    select: { papel: true },
  })
  if (!membro) return { ok: false, detalhe: "Essa pessoa não está nesta escola." }

  const dados: { nome?: string; email?: string; publico?: string } = {}

  if (opts.nome !== undefined) {
    const v = normalizarNome(opts.nome)
    if (!v.ok) return v
    dados.nome = v.nome
  }

  if (opts.email !== undefined) {
    const email = opts.email.trim().toLowerCase()
    if (!FORMATO_EMAIL.test(email)) return { ok: false, detalhe: `E-mail inválido: ${email}` }
    dados.email = email
  }

  let turma: { id: string; segmento: string } | null = null
  if (opts.turmaId !== undefined) {
    if (membro.papel !== "aluno") {
      return { ok: false, detalhe: "Só aluno fica em turma. Para professor, use a lista de turmas." }
    }
    turma = await db.turma.findFirst({
      where: { id: opts.turmaId, escolaId: opts.escolaId },
      select: { id: true, segmento: true },
    })
    if (!turma) return { ok: false, detalhe: "Turma não encontrada nesta escola." }
    // A turma nova manda na trilha, como manda no resgate do convite.
    if (ehPublico(turma.segmento)) dados.publico = turma.segmento
  }

  try {
    await db.$transaction(async (tx) => {
      if (Object.keys(dados).length > 0) {
        await tx.user.update({ where: { id: opts.userId }, data: dados })
      }
      if (turma) {
        await tx.membroTurma.deleteMany({
          where: { userId: opts.userId, turma: { escolaId: opts.escolaId } },
        })
        await tx.membroTurma.create({ data: { turmaId: turma.id, userId: opts.userId } })
      }
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, detalhe: "Já existe outra conta com esse e-mail." }
    }
    throw e
  }
  return { ok: true }
}

export type ResultadoSenha = { ok: true; senha: string } | { ok: false; detalhe: string }

/**
 * Sorteia uma senha nova e devolve UMA vez.
 *
 * Existe porque o "esqueci a senha" não alcança quem entrou pelo lote: o
 * endereço `.invalid` não recebe mensagem nenhuma, de propósito. Sem esta
 * função, uma criança de 8 anos que esquece a senha perde a conta e o
 * progresso junto, e a operadora não teria o que fazer além de criar outra.
 *
 * O tamanho muda com o papel: seis caracteres legíveis para o aluno, que
 * digita de um papel impresso, e doze para adulto, que tem gerenciador ou pelo
 * menos teclado.
 *
 * ⚠️ Conta que só entrava pelo Google ganha senha própria aqui, e passa a
 * poder entrar pelos dois caminhos. É efeito colateral aceito: sem ele, a
 * operadora clicaria num botão que não faz nada visível.
 */
export async function redefinirSenha(escolaId: string, userId: string): Promise<ResultadoSenha> {
  const membro = await db.membroEscola.findFirst({
    where: { escolaId, userId },
    select: { papel: true },
  })
  if (!membro) return { ok: false, detalhe: "Essa pessoa não está nesta escola." }

  const senha = membro.papel === "aluno" ? senhaDeAluno() : senhaTemporariaDeAdulto()
  await db.user.update({ where: { id: userId }, data: { senha: await bcrypt.hash(senha, 10) } })
  return { ok: true, senha }
}
