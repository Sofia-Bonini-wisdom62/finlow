import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { vinculoEscolar } from "@/lib/escola"
import { SEGMENTOS_ESCOLARES } from "@/lib/publico"
import { GerarConvite } from "@/components/escola/GerarConvite"

/**
 * A página da turma: alunos, convite e (nas próximas etapas) concessões de
 * trilha, rank e desempenho.
 *
 * AQUI o professor vê NOME REAL — é a superfície interna da escola, o mesmo
 * que a chamada em papel. O que os COLEGAS veem uns dos outros é outra
 * superfície (o rank da sala), e lá é apelido. A distinção está registrada em
 * docs/backlog-produto.md junto da pendência LGPD.
 */
export default async function TurmaPage({ params }: { params: Promise<{ turmaId: string }> }) {
  const { turmaId } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const v = await vinculoEscolar(session.user.id)
  if (!v || v.papel === "aluno") redirect("/chat")

  const turma = await db.turma.findFirst({
    // escolaId no where: id de turma de OUTRA escola dá 404, não vazamento.
    where:
      v.papel === "adm"
        ? { id: turmaId, escolaId: v.escolaId }
        : { id: turmaId, escolaId: v.escolaId, professorId: v.userId },
    select: {
      id: true,
      nome: true,
      segmento: true,
      serie: true,
      professor: { select: { nome: true } },
      membros: {
        select: { user: { select: { id: true, nome: true, apelido: true, criadoEm: true } } },
        orderBy: { criadoEm: "asc" },
      },
      convites: {
        where: { papel: "aluno", revogadoEm: null },
        select: { codigo: true, usos: true, usosMax: true, expiraEm: true },
        orderBy: { criadoEm: "desc" },
        take: 3,
      },
    },
  })
  if (!turma) notFound()

  const segmento = SEGMENTOS_ESCOLARES.find((s) => s.id === turma.segmento)?.nome ?? turma.segmento

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-fl-ink">{turma.nome}</h2>
        <p className="text-sm text-fl-ink/60">
          {segmento}
          {turma.professor?.nome && <> · {turma.professor.nome}</>}
        </p>
      </div>

      <section className="rounded-2xl border border-fl-sand bg-fl-card p-5">
        <h3 className="text-base font-semibold text-fl-ink">Convite da turma</h3>
        <p className="mt-1 text-sm text-fl-ink/60">
          Um link para a turma inteira: cada aluno cria a própria conta e já cai aqui.
        </p>
        <div className="mt-3">
          <GerarConvite papel="aluno" turmaId={turma.id} rotulo="Gerar convite de aluno" />
        </div>
        {turma.convites.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-fl-ink/70">
            {turma.convites.map((c) => (
              <li key={c.codigo} className="font-mono">
                {c.codigo} · {c.usos}/{c.usosMax} usos · vale até{" "}
                {new Date(c.expiraEm).toLocaleDateString("pt-BR")}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-fl-sand bg-fl-card p-5">
        <h3 className="text-base font-semibold text-fl-ink">
          Alunos ({turma.membros.length})
        </h3>
        {turma.membros.length === 0 ? (
          <p className="mt-2 text-sm text-fl-ink/60">
            Ninguém ainda — passa o link do convite para a turma.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-fl-sand">
            {turma.membros.map((m) => (
              <li key={m.user.id} className="flex items-baseline justify-between py-2 text-sm">
                <span className="text-fl-ink">{m.user.nome ?? m.user.apelido ?? "sem nome"}</span>
                <span className="text-fl-ink/50">
                  desde {new Date(m.user.criadoEm).toLocaleDateString("pt-BR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
