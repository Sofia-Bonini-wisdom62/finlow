import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { vinculoEscolar, podeGerirTurma } from "@/lib/escola"
import { desempenhoDoAluno } from "@/lib/escola-desempenho"
import { quantasLicoes } from "@/lib/licoes"
import { db } from "@/lib/db"

/**
 * O desempenho de UM aluno, módulo a módulo do segmento da turma.
 *
 * Nome real, superfície interna da escola. O total de lições vem de
 * quantasLicoes (nunca supor 4 — há módulo sem tela de cenário).
 */
export default async function AlunoPage({
  params,
}: {
  params: Promise<{ turmaId: string; userId: string }>
}) {
  const { turmaId, userId } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const v = await vinculoEscolar(session.user.id)
  if (!v || v.papel === "aluno") redirect("/chat")
  if (!(await podeGerirTurma(v, turmaId))) redirect("/escola/turmas")

  const d = await desempenhoDoAluno(userId, turmaId)
  if (!d) notFound()

  // O total de lições por módulo, para o "2/4" fazer sentido.
  const telas = await db.tela.findMany({
    where: { moduloId: { in: d.modulos.map((m) => m.moduloId) } },
    select: { moduloId: true, tipo: true, ordem: true },
  })
  const licoesPorModulo = new Map<string, number>()
  for (const m of d.modulos) {
    licoesPorModulo.set(
      m.moduloId,
      quantasLicoes(telas.filter((t) => t.moduloId === m.moduloId))
    )
  }

  const comecados = d.modulos.filter((m) => m.licoesConcluidas > 0)

  return (
    <div className="space-y-5">
      <div>
        <Link href={`/escola/turmas/${turmaId}`} className="text-sm font-medium" style={{ color: "var(--fl-500)" }}>
          ← Voltar para a turma
        </Link>
        <h2 className="mt-2 text-lg font-semibold text-fl-ink">{d.nome}</h2>
        <p className="text-sm text-fl-ink/60">
          {comecados.length} de {d.modulos.length} aulas começadas
        </p>
      </div>

      <section className="rounded-2xl border border-fl-sand bg-fl-card p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-fl-ink/50">
                <th className="pb-2 pr-3 font-medium">Aula</th>
                <th className="pb-2 pr-3 font-medium">Lições</th>
                <th className="pb-2 pr-3 font-medium">Acerto</th>
                <th className="pb-2 pr-3 font-medium">Tempo</th>
                <th className="pb-2 font-medium">Concluída em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fl-sand">
              {d.modulos.map((m) => (
                <tr key={m.moduloId} className={m.licoesConcluidas === 0 ? "opacity-50" : ""}>
                  <td className="py-2 pr-3 text-fl-ink">{m.titulo}</td>
                  <td className="py-2 pr-3 tabular-nums text-fl-ink">
                    {m.licoesConcluidas}/{licoesPorModulo.get(m.moduloId) ?? "?"}
                  </td>
                  <td className="py-2 pr-3 tabular-nums text-fl-ink">
                    {m.totalQuiz > 0 ? `${Math.round((m.acertos / m.totalQuiz) * 100)}%` : "—"}
                  </td>
                  <td className="py-2 pr-3 tabular-nums text-fl-ink">{m.minutos} min</td>
                  <td className="py-2 text-fl-ink/70">
                    {m.concluidoEm ? new Date(m.concluidoEm).toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
