import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { vinculoEscolar, segmentosDoProfessor } from "@/lib/escola"
import { SEGMENTOS_ESCOLARES } from "@/lib/publico"
import { NovaTurma } from "@/components/escola/NovaTurma"

function nomeDoSegmento(id: string): string {
  return SEGMENTOS_ESCOLARES.find((s) => s.id === id)?.nome ?? id
}

/** Professor vê as turmas dele; adm vê todas as da escola. */
export default async function TurmasPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const v = await vinculoEscolar(session.user.id)
  if (!v || v.papel === "aluno") redirect("/chat")

  // Competência reduz o select da turma nova. null = todos os segmentos.
  const permitidos = await segmentosDoProfessor(v)
  const segmentosDoSelect = permitidos
    ? SEGMENTOS_ESCOLARES.filter((s) => permitidos.includes(s.id)).map((s) => ({ ...s }))
    : undefined

  const turmas = await db.turma.findMany({
    where: v.papel === "adm" ? { escolaId: v.escolaId } : { escolaId: v.escolaId, professorId: v.userId },
    select: {
      id: true,
      nome: true,
      segmento: true,
      serie: true,
      professor: { select: { nome: true } },
      _count: { select: { membros: true } },
    },
    orderBy: { criadoEm: "asc" },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-fl-ink">
          {v.papel === "adm" ? "Turmas da escola" : "Minhas turmas"}
        </h2>
      </div>

      <NovaTurma segmentos={segmentosDoSelect} />

      {turmas.length === 0 ? (
        <p className="text-sm text-fl-ink/60">
          Nenhuma turma ainda. Cria a primeira e gera o convite para os alunos entrarem.
        </p>
      ) : (
        <ul className="space-y-3">
          {turmas.map((t) => (
            <li key={t.id}>
              <Link
                href={`/escola/turmas/${t.id}`}
                className="block rounded-2xl border border-fl-sand bg-fl-card p-4 transition-colors hover:border-[var(--fl-500)]"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold text-fl-ink">{t.nome}</p>
                  <p className="text-sm text-fl-ink/60">
                    {t._count.membros} aluno{t._count.membros === 1 ? "" : "s"}
                  </p>
                </div>
                <p className="mt-1 text-sm text-fl-ink/60">
                  {nomeDoSegmento(t.segmento)}
                  {v.papel === "adm" && (
                    <> · {t.professor?.nome ?? "sem professor designado"}</>
                  )}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
