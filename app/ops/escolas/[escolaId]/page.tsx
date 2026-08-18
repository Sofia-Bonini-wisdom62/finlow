import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { ehPapel } from "@/lib/escola-papeis"
import { SEGMENTOS_ESCOLARES } from "@/lib/publico"
import { ContratoDaEscola } from "@/components/ops/ContratoDaEscola"
import { ListaDeMembros } from "@/components/ops/ListaDeMembros"
import { TurmasDaEscola } from "@/components/ops/TurmasDaEscola"
import { ConvitesDaEscola } from "@/components/ops/ConvitesDaEscola"
import { AlunosEmLote } from "@/components/ops/AlunosEmLote"

export const dynamic = "force-dynamic"

/** Uma escola inteira numa página: contrato, gente, turmas e convites. */
export default async function OpsEscola(ctx: { params: Promise<{ escolaId: string }> }) {
  const { escolaId } = await ctx.params

  const escola = await db.escola.findUnique({
    where: { id: escolaId },
    select: {
      id: true,
      nome: true,
      status: true,
      ativaAte: true,
      membros: {
        select: {
          papel: true,
          criadoEm: true,
          user: { select: { id: true, nome: true, email: true } },
        },
        orderBy: { criadoEm: "asc" },
      },
      turmas: {
        select: {
          id: true,
          nome: true,
          segmento: true,
          serie: true,
          professorId: true,
          _count: { select: { membros: true } },
        },
        orderBy: { criadoEm: "asc" },
      },
      convites: {
        where: { revogadoEm: null },
        select: {
          id: true,
          codigo: true,
          papel: true,
          usos: true,
          usosMax: true,
          expiraEm: true,
          turma: { select: { nome: true } },
        },
        orderBy: { criadoEm: "desc" },
      },
    },
  })

  if (!escola) notFound()

  // Papel desconhecido no banco não derruba a página: some da lista, do mesmo
  // jeito que vinculoEscolar devolve null em vez de lançar.
  const membros = escola.membros
    .filter((m) => ehPapel(m.papel))
    .map((m) => ({
      userId: m.user.id,
      nome: m.user.nome,
      email: m.user.email,
      papel: m.papel as "adm" | "professor" | "aluno",
    }))

  const podemLecionar = membros
    .filter((m) => m.papel === "professor" || m.papel === "adm")
    .map((m) => ({ userId: m.userId, nome: m.nome ?? m.email }))

  const turmas = escola.turmas.map((t) => ({
    id: t.id,
    nome: t.nome,
    segmento: SEGMENTOS_ESCOLARES.find((s) => s.id === t.segmento)?.nome ?? t.segmento,
    serie: t.serie,
    professorId: t.professorId,
    alunos: t._count.membros,
  }))

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-fl-ink">{escola.nome}</h2>
        <p className="text-sm text-fl-ink/60">
          {membros.length} pessoa{membros.length === 1 ? "" : "s"} · {turmas.length} turma
          {turmas.length === 1 ? "" : "s"}
        </p>
      </div>

      <ContratoDaEscola
        escolaId={escola.id}
        status={escola.status}
        ativaAte={escola.ativaAte ? escola.ativaAte.toISOString().slice(0, 10) : null}
      />

      <ListaDeMembros escolaId={escola.id} membros={membros} />

      <TurmasDaEscola escolaId={escola.id} turmas={turmas} professores={podemLecionar} />

      <AlunosEmLote escolaId={escola.id} turmas={turmas.map((t) => ({ id: t.id, nome: t.nome }))} />

      <ConvitesDaEscola
        convites={escola.convites.map((c) => ({
          id: c.id,
          codigo: c.codigo,
          papel: c.papel,
          usos: c.usos,
          usosMax: c.usosMax,
          expiraEm: c.expiraEm.toLocaleDateString("pt-BR"),
          turmaNome: c.turma?.nome ?? null,
        }))}
      />
    </div>
  )
}
