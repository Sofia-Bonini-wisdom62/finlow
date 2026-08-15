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
        <ul className="space-y-2">
          {turmas.map((t, i) => (
            <li key={t.id}>
              <Link
                href={`/escola/turmas/${t.id}`}
                className="flex items-center gap-3 rounded-[14px] border-[1.5px] border-fl-border bg-fl-card px-3.5 py-3 transition-colors hover:border-[var(--fl-500)]"
              >
                {/* A inicial colorida do desenho: cores girando por índice,
                    como as unidades da trilha. Texto navy em cima. */}
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-xl text-[13px] font-black"
                  style={{
                    background: [
                      "var(--fin-accent, #E9A63C)",
                      "var(--fin-energia, #55C7EA)",
                      "var(--fin-acerto, #58C08A)",
                      "var(--fin-pocao, #8B6CC9)",
                      "var(--fin-combo, #F5772E)",
                    ][i % 5],
                    color: "var(--fin-bg, #0C1B21)",
                  }}
                >
                  {t.nome.replace(/\s/g, "").slice(0, 3).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-black text-fl-ink">{t.nome}</p>
                  <p className="mt-0.5 truncate text-[11.5px] font-bold text-fl-ink-3">
                    {t._count.membros} aluno{t._count.membros === 1 ? "" : "s"} ·{" "}
                    {nomeDoSegmento(t.segmento)}
                    {v.papel === "adm" && (
                      <> · {t.professor?.nome ?? "sem professor designado"}</>
                    )}
                  </p>
                </div>
                <span className="font-black text-fl-ink-3">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
