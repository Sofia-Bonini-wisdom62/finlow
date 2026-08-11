import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { decidirAcessoEscolar } from "@/lib/pagamento/acesso"

/**
 * Papel e vínculo escolar (Finlow para Escolas).
 *
 * É o `lib/painel.ts` da escola: o mesmo desenho de guard por rota, com o
 * mesmo formato de recusa em três campos. O papel NÃO entra no JWT — é lido
 * do banco a cada request, como `temModuloAvancado` e `temAcessoPremium`
 * fazem. Um aluno removido da escola perde o acesso na request seguinte, não
 * no próximo login.
 *
 * O vocabulário dos papéis mora aqui; o banco guarda string
 * (MembroEscola.papel) e é este arquivo que dá sentido a ela.
 */

export const PAPEIS = ["adm", "professor", "aluno"] as const
export type PapelEscola = (typeof PAPEIS)[number]

export function ehPapel(v: string): v is PapelEscola {
  return (PAPEIS as readonly string[]).includes(v)
}

/** Os estados de uma escola. Quem interpreta é decidirAcessoEscolar. */
export const STATUS_ESCOLA = ["ativa", "suspensa"] as const

export interface VinculoEscolar {
  userId: string
  escolaId: string
  escolaNome: string
  papel: PapelEscola
  /** status "ativa" e vigência em dia — a mesma régua do premium escolar. */
  escolaAtiva: boolean
}

/** Mesmos três campos de lib/painel.ts, pela mesma história: a tela que lê só
 *  `erro` não pode receber um 403 perfeitamente explicado em `error`. */
function recusa(codigo: string, mensagem: string, status: number) {
  return NextResponse.json({ codigo, erro: mensagem, error: mensagem }, { status })
}

/**
 * O vínculo desta pessoa com uma escola. `null` = usuário comum.
 *
 * Papel desconhecido no banco devolve `null` em vez de lançar: uma linha
 * gravada por um script futuro com papel novo não pode derrubar toda rota que
 * checa vínculo — ela só deixa de contar até o vocabulário conhecer o papel.
 */
export async function vinculoEscolar(userId: string): Promise<VinculoEscolar | null> {
  const m = await db.membroEscola.findUnique({
    where: { userId },
    select: {
      papel: true,
      escolaId: true,
      escola: { select: { nome: true, status: true, ativaAte: true } },
    },
  })
  if (!m || !ehPapel(m.papel)) return null
  return {
    userId,
    escolaId: m.escolaId,
    escolaNome: m.escola.nome,
    papel: m.papel,
    escolaAtiva: decidirAcessoEscolar(m.escola.status, m.escola.ativaAte, new Date()),
  }
}

/**
 * O `getUserIdOr401` da escola: sessão → vínculo → papel → escola ativa.
 *
 * Uso nas rotas, espelho exato do padrão do Painel:
 *
 *   const v = await exigirPapel("adm", "professor")
 *   if (v instanceof NextResponse) return v
 *
 * Escola inativa recusa TODO papel, inclusive o adm: suspender é o botão de
 * emergência, e um botão de emergência que deixa metade das portas abertas
 * não é de emergência. Reativar é decisão manual (script), como criar.
 */
export async function exigirPapel(
  ...papeis: PapelEscola[]
): Promise<VinculoEscolar | NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return recusa("SEM_SESSAO", "Entra na sua conta primeiro", 401)
  }
  const v = await vinculoEscolar(session.user.id)
  if (!v) {
    return recusa("SEM_ESCOLA", "Sua conta não está vinculada a uma escola.", 403)
  }
  if (!papeis.includes(v.papel)) {
    return recusa("PAPEL_INSUFICIENTE", "Seu perfil na escola não tem acesso a esta ação.", 403)
  }
  if (!v.escolaAtiva) {
    return recusa(
      "ESCOLA_INATIVA",
      "A conta da sua escola não está ativa. Fala com quem administra o contrato.",
      403
    )
  }
  return v
}

/**
 * Os segmentos que este vínculo pode ensinar/gerir.
 *
 * `null` = SEM RESTRIÇÃO: adm sempre, e professor sem nenhuma competência
 * registrada. A competência REDUZ (o verbo do quadro branco) — ela nunca
 * concede o que já era de todos. Uma escola que não usa competências continua
 * funcionando exatamente como antes, e é isso que permite o piloto começar
 * sem o adm classificar professor por professor.
 */
export async function segmentosDoProfessor(v: VinculoEscolar): Promise<string[] | null> {
  if (v.papel !== "professor") return null
  const linhas = await db.competenciaProfessor.findMany({
    where: { userId: v.userId, escolaId: v.escolaId },
    select: { segmento: true },
  })
  if (linhas.length === 0) return null
  return linhas.map((l) => l.segmento)
}

/**
 * Professor só gere a própria turma; adm gere qualquer turma da escola.
 *
 * A checagem de escola importa tanto quanto a de dono: sem o
 * `escolaId: v.escolaId` um adm de uma escola qualquer poderia gerir turma de
 * outra sabendo o id — o guard é o que faz o id não valer nada sozinho.
 */
export async function podeGerirTurma(
  v: VinculoEscolar,
  turmaId: string
): Promise<boolean> {
  const t = await db.turma.findFirst({
    where: { id: turmaId, escolaId: v.escolaId },
    select: { professorId: true },
  })
  if (!t) return false
  return v.papel === "adm" || t.professorId === v.userId
}
