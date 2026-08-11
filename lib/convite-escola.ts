import { db } from "@/lib/db"
import { FORMATO_CODIGO, gerarCodigo } from "@/lib/indicacao"
import { ehPublico } from "@/lib/publico"
import { Prisma } from "@prisma/client"

/**
 * Convite de escola (Finlow para Escolas).
 *
 * O fluxo inteiro, no desenho do programa de indicação:
 *
 *   1. Adm gera convite de professor; adm ou professor geram convite de
 *      aluno, amarrado a uma turma (POST /api/escola/convites).
 *   2. Quem recebe abre /convite/{codigo}: a rota planta o cookie e manda
 *      para o cadastro (sem conta) ou para /convite/aceitar (logado).
 *   3. No cadastro (rota própria OU createUser do Google) ou no aceite, o
 *      cookie vira MembroEscola — e, para aluno, MembroTurma + User.publico
 *      apontando para o segmento da turma.
 *
 * DIFERENTE da indicação em um ponto que muda tudo: o código é MULTIUSO.
 * Um convite de turma serve à turma inteira — o professor escreve no quadro.
 * O freio é o trio expiração + teto de usos + revogação, e a checagem é um
 * updateMany condicionado: duas abas resgatando no mesmo segundo não furam o
 * teto, porque só uma delas incrementa o contador dentro da janela.
 */

/** Nome do cookie plantado por /convite/[codigo]. */
export const COOKIE_CONVITE = "finlow_convite"

/** Validade do COOKIE (a do convite mora no banco, em expiraEm). */
export const DIAS_COOKIE_CONVITE = 14

/** Defaults de geração — o gerador aceita outros valores por parâmetro. */
export const DIAS_VALIDADE_CONVITE = 30
export const USOS_MAX_CONVITE = 50

/**
 * Por que um convite não pode ser resgatado — ou null quando pode.
 *
 * PURA de propósito (testável em scripts/testar-convite.mts sem banco), e o
 * `where` do updateMany em resgatarConvite é a MESMA regra em SQL: mudar um
 * sem o outro faz o preview prometer o que o resgate recusa.
 */
export function motivoDeRecusa(
  c: { revogadoEm: Date | null; expiraEm: Date; usos: number; usosMax: number },
  agora: Date
): "revogado" | "expirado" | "esgotado" | null {
  if (c.revogadoEm) return "revogado"
  if (c.expiraEm <= agora) return "expirado"
  if (c.usos >= c.usosMax) return "esgotado"
  return null
}

export interface OpcoesConvite {
  escolaId: string
  papel: "professor" | "aluno"
  /** Obrigatório quando papel é "aluno" — o convite diz onde o aluno cai. */
  turmaId?: string | null
  criadoPorId: string
  diasValidade?: number
  usosMax?: number
}

/** Cria o convite. Colisão de código é rara; o @unique recusa e sorteia de novo. */
export async function gerarConvite(opts: OpcoesConvite): Promise<{ id: string; codigo: string }> {
  if (opts.papel === "aluno" && !opts.turmaId) {
    throw new Error("convite de aluno precisa de turma")
  }
  const expiraEm = new Date(
    Date.now() + (opts.diasValidade ?? DIAS_VALIDADE_CONVITE) * 24 * 60 * 60 * 1000
  )
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    try {
      const c = await db.conviteEscola.create({
        data: {
          escolaId: opts.escolaId,
          papel: opts.papel,
          turmaId: opts.papel === "aluno" ? opts.turmaId : null,
          codigo: gerarCodigo(),
          criadoPorId: opts.criadoPorId,
          expiraEm,
          usosMax: opts.usosMax ?? USOS_MAX_CONVITE,
        },
        select: { id: true, codigo: true },
      })
      return c
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue
      throw e
    }
  }
  throw new Error("não consegui gerar um código único")
}

export interface PreviewConvite {
  papel: string
  escolaNome: string
  turmaNome: string | null
  segmento: string | null
  /** null = resgatável agora. A tela mostra o motivo em vez do formulário. */
  recusa: "revogado" | "expirado" | "esgotado" | null
}

/** O que a tela de cadastro/aceite mostra ANTES de existir conta. */
export async function previewConvite(codigoBruto: string): Promise<PreviewConvite | null> {
  const codigo = codigoBruto.trim().toLowerCase()
  if (!FORMATO_CODIGO.test(codigo)) return null
  const c = await db.conviteEscola.findUnique({
    where: { codigo },
    select: {
      papel: true,
      revogadoEm: true,
      expiraEm: true,
      usos: true,
      usosMax: true,
      escola: { select: { nome: true } },
      turma: { select: { nome: true, segmento: true } },
    },
  })
  if (!c) return null
  return {
    papel: c.papel,
    escolaNome: c.escola.nome,
    turmaNome: c.turma?.nome ?? null,
    segmento: c.turma?.segmento ?? null,
    recusa: motivoDeRecusa(c, new Date()),
  }
}

export type MotivoResgate =
  | "formato"
  | "inexistente"
  | "revogado"
  | "expirado"
  | "esgotado"
  | "ja_vinculado"
  | "convite_quebrado"

export type ResultadoResgate =
  | { ok: true; papel: "professor" | "aluno" }
  | { ok: false; motivo: MotivoResgate }

/** Erro interno para abortar a transação carregando o motivo. */
class RecusaResgate extends Error {
  constructor(public motivo: MotivoResgate) {
    super(motivo)
  }
}

/**
 * O resgate: o cookie (ou o botão de aceite) vira vínculo.
 *
 * Tudo que muda o banco acontece numa transação: o incremento condicionado do
 * contador, o MembroEscola e — para aluno — o MembroTurma e o User.publico.
 * Se qualquer parte recusa (teto estourou entre o preview e o clique, conta
 * já vinculada a outra escola), NADA fica gravado: convite meio-resgatado é
 * aluno fantasma na contagem.
 *
 * `apelido` chega VALIDADO por quem chama (apelidoValido, em lib/pontos.ts) e
 * é gravado FORA da transação, best-effort: apelido em conflito não pode
 * desfazer uma matrícula — a pessoa escolhe outro depois, em /ranking.
 */
export async function resgatarConvite(
  userId: string,
  codigoBruto: string,
  apelido?: string | null
): Promise<ResultadoResgate> {
  const codigo = codigoBruto.trim().toLowerCase()
  if (!FORMATO_CODIGO.test(codigo)) return { ok: false, motivo: "formato" }

  const convite = await db.conviteEscola.findUnique({
    where: { codigo },
    select: {
      id: true,
      escolaId: true,
      papel: true,
      revogadoEm: true,
      expiraEm: true,
      usos: true,
      usosMax: true,
      turma: { select: { id: true, segmento: true } },
    },
  })
  if (!convite) return { ok: false, motivo: "inexistente" }
  if (convite.papel !== "professor" && convite.papel !== "aluno") {
    return { ok: false, motivo: "convite_quebrado" }
  }
  if (convite.papel === "aluno" && !convite.turma) {
    // Só possível se alguém gravar à mão: gerarConvite exige turma.
    return { ok: false, motivo: "convite_quebrado" }
  }
  const papel = convite.papel

  try {
    await db.$transaction(async (tx) => {
      const agora = new Date()
      // A MESMA regra de motivoDeRecusa, em SQL, atômica: só incrementa se
      // ainda cabe. count 0 = alguém (ou o relógio) chegou antes.
      const r = await tx.conviteEscola.updateMany({
        where: {
          id: convite.id,
          revogadoEm: null,
          expiraEm: { gt: agora },
          usos: { lt: convite.usosMax },
        },
        data: { usos: { increment: 1 } },
      })
      if (r.count === 0) {
        throw new RecusaResgate(motivoDeRecusa(convite, agora) ?? "esgotado")
      }

      await tx.membroEscola.create({
        data: { userId, escolaId: convite.escolaId, papel },
      })

      if (papel === "aluno" && convite.turma) {
        await tx.membroTurma.create({
          data: { turmaId: convite.turma.id, userId },
        })
        // O segmento da turma vira a trilha do aluno. Validado contra o
        // vocabulário: turma com segmento desconhecido não pode apontar a
        // trilha de ninguém para o nada.
        if (ehPublico(convite.turma.segmento)) {
          await tx.user.update({
            where: { id: userId },
            data: { publico: convite.turma.segmento },
          })
        }
      }
    })
  } catch (e) {
    if (e instanceof RecusaResgate) return { ok: false, motivo: e.motivo }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      // @unique de MembroEscola.userId: a conta já pertence a uma escola.
      return { ok: false, motivo: "ja_vinculado" }
    }
    throw e
  }

  if (apelido) {
    try {
      await db.user.update({ where: { id: userId }, data: { apelido } })
    } catch {
      // Apelido em uso (@unique). A matrícula já valeu; o apelido espera.
    }
  }

  return { ok: true, papel }
}
