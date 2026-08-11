import { db } from "@/lib/db"
import { filtroDeModulo, ehPublico } from "@/lib/publico"

/**
 * Desempenho escolar (Finlow para Escolas) — SÓ LEITURA.
 *
 * A matéria-prima já existia antes da escola: ProgressoLicao guarda acertos,
 * totalQuiz e segundos por lição desde o corredor. Nada aqui grava; as três
 * funções agregam para as três telas — turma (professor), aluno (professor) e
 * escola (adm).
 *
 * AQUI aparece NOME REAL (User.nome): é a superfície interna da escola, o
 * mesmo que a chamada em papel. O que os COLEGAS veem uns dos outros é o rank
 * da sala, e lá é apelido — a distinção está em rankingEscolar
 * (lib/pontos.ts) e na pendência LGPD do backlog.
 *
 * O denominador é sempre a trilha do SEGMENTO da turma: aula adulta que o
 * aluno explorou por conta não entra na conta da escola — o professor mede o
 * currículo, não a curiosidade.
 */

export interface DesempenhoAlunoNaTurma {
  userId: string
  nome: string
  modulosConcluidos: number
  modulosTotal: number
  licoesConcluidas: number
  /** % de acerto agregado (Σacertos/ΣtotalQuiz); null = nenhum quiz feito. */
  acertoPct: number | null
  minutos: number
  ultimaAtividade: Date | null
}

export interface DesempenhoTurma {
  turmaId: string
  turmaNome: string
  segmento: string
  alunos: DesempenhoAlunoNaTurma[]
}

/** A turma inteira, aluno a aluno. Uma query por tabela, agregação em TS. */
export async function desempenhoDaTurma(turmaId: string): Promise<DesempenhoTurma | null> {
  const turma = await db.turma.findUnique({
    where: { id: turmaId },
    select: {
      id: true,
      nome: true,
      segmento: true,
      membros: { select: { user: { select: { id: true, nome: true } } } },
    },
  })
  if (!turma || !ehPublico(turma.segmento)) return null

  const alunosIds = turma.membros.map((m) => m.user.id)
  const [modulosTotal, modulosDoSegmento] = await Promise.all([
    db.modulo.count({ where: filtroDeModulo(turma.segmento) }),
    db.modulo.findMany({
      where: filtroDeModulo(turma.segmento),
      select: { id: true },
    }),
  ])
  const idsDoSegmento = new Set(modulosDoSegmento.map((m) => m.id))

  const [licoes, modulosFechados] = alunosIds.length
    ? await Promise.all([
        db.progressoLicao.findMany({
          where: { userId: { in: alunosIds }, concluido: true },
          select: {
            userId: true,
            moduloId: true,
            acertos: true,
            totalQuiz: true,
            segundos: true,
            concluidoEm: true,
          },
        }),
        db.progressoModulo.findMany({
          where: { userId: { in: alunosIds }, concluido: true },
          select: { userId: true, moduloId: true },
        }),
      ])
    : [[], []]

  const porAluno = new Map<string, DesempenhoAlunoNaTurma>()
  for (const m of turma.membros) {
    porAluno.set(m.user.id, {
      userId: m.user.id,
      nome: m.user.nome ?? "sem nome",
      modulosConcluidos: 0,
      modulosTotal,
      licoesConcluidas: 0,
      acertoPct: null,
      minutos: 0,
      ultimaAtividade: null,
    })
  }

  const somaQuiz = new Map<string, { acertos: number; total: number }>()
  for (const l of licoes) {
    if (!idsDoSegmento.has(l.moduloId)) continue // só o currículo conta
    const a = porAluno.get(l.userId)
    if (!a) continue
    a.licoesConcluidas++
    a.minutos += Math.round(l.segundos / 60)
    if (l.concluidoEm && (!a.ultimaAtividade || l.concluidoEm > a.ultimaAtividade)) {
      a.ultimaAtividade = l.concluidoEm
    }
    const q = somaQuiz.get(l.userId) ?? { acertos: 0, total: 0 }
    q.acertos += l.acertos
    q.total += l.totalQuiz
    somaQuiz.set(l.userId, q)
  }
  for (const [userId, q] of somaQuiz) {
    const a = porAluno.get(userId)
    if (a && q.total > 0) a.acertoPct = Math.round((q.acertos / q.total) * 100)
  }
  for (const m of modulosFechados) {
    if (!idsDoSegmento.has(m.moduloId)) continue
    const a = porAluno.get(m.userId)
    if (a) a.modulosConcluidos++
  }

  return {
    turmaId: turma.id,
    turmaNome: turma.nome,
    segmento: turma.segmento,
    alunos: [...porAluno.values()].sort((x, y) => x.nome.localeCompare(y.nome, "pt-BR")),
  }
}

export interface DesempenhoModuloDoAluno {
  moduloId: string
  titulo: string
  ordem: number
  licoesConcluidas: number
  acertos: number
  totalQuiz: number
  minutos: number
  concluidoEm: Date | null
}

/** O detalhe de UM aluno, módulo a módulo do segmento da turma. */
export async function desempenhoDoAluno(
  userId: string,
  turmaId: string
): Promise<{ nome: string; modulos: DesempenhoModuloDoAluno[] } | null> {
  const turma = await db.turma.findUnique({
    where: { id: turmaId },
    select: { segmento: true, membros: { where: { userId }, select: { userId: true } } },
  })
  // Aluno fora da turma = 404, não uma tela vazia: o professor colou um link
  // de outra turma e precisa saber, não achar que o aluno nunca estudou.
  if (!turma || !ehPublico(turma.segmento) || turma.membros.length === 0) return null

  const [user, modulos, licoes, fechados] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { nome: true } }),
    db.modulo.findMany({
      where: filtroDeModulo(turma.segmento),
      select: { id: true, titulo: true, ordem: true },
      orderBy: { ordem: "asc" },
    }),
    db.progressoLicao.findMany({
      where: { userId, concluido: true },
      select: { moduloId: true, acertos: true, totalQuiz: true, segundos: true },
    }),
    db.progressoModulo.findMany({
      where: { userId, concluido: true },
      select: { moduloId: true, concluidoEm: true },
    }),
  ])
  if (!user) return null

  const fechadoPor = new Map(fechados.map((f) => [f.moduloId, f.concluidoEm]))
  const linhas = modulos.map((m) => {
    const doModulo = licoes.filter((l) => l.moduloId === m.id)
    return {
      moduloId: m.id,
      titulo: m.titulo,
      ordem: m.ordem,
      licoesConcluidas: doModulo.length,
      acertos: doModulo.reduce((s, l) => s + l.acertos, 0),
      totalQuiz: doModulo.reduce((s, l) => s + l.totalQuiz, 0),
      minutos: Math.round(doModulo.reduce((s, l) => s + l.segundos, 0) / 60),
      concluidoEm: fechadoPor.get(m.id) ?? null,
    }
  })

  return { nome: user.nome ?? "sem nome", modulos: linhas }
}

export interface ResumoTurmaDaEscola {
  turmaId: string
  turmaNome: string
  segmento: string
  alunos: number
  /** Média de módulos concluídos por aluno, sobre o total do segmento. */
  conclusaoMediaPct: number | null
  acertoPct: number | null
}

/** A visão do adm: um resumo por turma, sem descer a aluno. */
export async function visaoGeralDaEscola(escolaId: string): Promise<ResumoTurmaDaEscola[]> {
  const turmas = await db.turma.findMany({
    where: { escolaId },
    select: { id: true },
    orderBy: { criadoEm: "asc" },
  })

  const resumos: ResumoTurmaDaEscola[] = []
  for (const t of turmas) {
    const d = await desempenhoDaTurma(t.id)
    if (!d) continue
    const n = d.alunos.length
    const somaModulos = d.alunos.reduce((s, a) => s + a.modulosConcluidos, 0)
    const comQuiz = d.alunos.filter((a) => a.acertoPct !== null)
    resumos.push({
      turmaId: d.turmaId,
      turmaNome: d.turmaNome,
      segmento: d.segmento,
      alunos: n,
      conclusaoMediaPct:
        n > 0 && d.alunos[0].modulosTotal > 0
          ? Math.round((somaModulos / (n * d.alunos[0].modulosTotal)) * 100)
          : null,
      acertoPct: comQuiz.length
        ? Math.round(comQuiz.reduce((s, a) => s + (a.acertoPct ?? 0), 0) / comQuiz.length)
        : null,
    })
  }
  return resumos
}
