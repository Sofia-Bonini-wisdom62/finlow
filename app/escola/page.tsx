import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { vinculoEscolar } from "@/lib/escola"
import { visaoGeralDaEscola } from "@/lib/escola-desempenho"
import { SEGMENTOS_ESCOLARES } from "@/lib/publico"

/**
 * Home da escola, por papel: o adm vê a casa inteira; o professor, as turmas
 * dele. Os números saem de counts — nada aqui lista pessoa.
 */
export default async function EscolaHome() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const v = await vinculoEscolar(session.user.id)
  if (!v || v.papel === "aluno") redirect("/chat")

  const [turmas, alunos, professores] = await Promise.all([
    db.turma.count({
      where: v.papel === "adm" ? { escolaId: v.escolaId } : { escolaId: v.escolaId, professorId: v.userId },
    }),
    db.membroEscola.count({ where: { escolaId: v.escolaId, papel: "aluno" } }),
    db.membroEscola.count({ where: { escolaId: v.escolaId, papel: "professor" } }),
  ])

  // A visão do quadro branco do adm: "desempenho geral salas". O professor
  // tem o mesmo por turma, dentro de cada turma.
  const visao = v.papel === "adm" ? await visaoGeralDaEscola(v.escolaId) : []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-fl-sand bg-fl-card p-4">
          <p className="text-2xl font-semibold text-fl-ink">{turmas}</p>
          <p className="text-xs text-fl-ink/60">{v.papel === "adm" ? "turmas" : "minhas turmas"}</p>
        </div>
        <div className="rounded-2xl border border-fl-sand bg-fl-card p-4">
          <p className="text-2xl font-semibold text-fl-ink">{alunos}</p>
          <p className="text-xs text-fl-ink/60">alunos</p>
        </div>
        <div className="rounded-2xl border border-fl-sand bg-fl-card p-4">
          <p className="text-2xl font-semibold text-fl-ink">{professores}</p>
          <p className="text-xs text-fl-ink/60">professores</p>
        </div>
      </div>

      {visao.length > 0 && (
        <div className="rounded-2xl border border-fl-sand bg-fl-card p-5">
          <h2 className="text-base font-semibold text-fl-ink">Desempenho por turma</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-fl-ink/50">
                  <th className="pb-2 pr-3 font-medium">Turma</th>
                  <th className="pb-2 pr-3 font-medium">Alunos</th>
                  <th className="pb-2 pr-3 font-medium">Conclusão média</th>
                  <th className="pb-2 font-medium">Acerto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fl-sand">
                {visao.map((t) => (
                  <tr key={t.turmaId}>
                    <td className="py-2 pr-3">
                      <Link
                        href={`/escola/turmas/${t.turmaId}`}
                        className="font-medium"
                        style={{ color: "var(--fl-500)" }}
                      >
                        {t.turmaNome}
                      </Link>
                      <span className="ml-2 text-xs text-fl-ink/50">
                        {SEGMENTOS_ESCOLARES.find((s) => s.id === t.segmento)?.nome ?? t.segmento}
                      </span>
                    </td>
                    <td className="py-2 pr-3 tabular-nums text-fl-ink">{t.alunos}</td>
                    <td className="py-2 pr-3 tabular-nums text-fl-ink">
                      {t.conclusaoMediaPct === null ? "—" : `${t.conclusaoMediaPct}%`}
                    </td>
                    <td className="py-2 tabular-nums text-fl-ink">
                      {t.acertoPct === null ? "—" : `${t.acertoPct}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-fl-sand bg-fl-card p-5">
        <h2 className="text-base font-semibold text-fl-ink">Por onde começar</h2>
        <ul className="mt-3 space-y-2 text-sm text-fl-ink/80">
          <li>
            <Link href="/escola/turmas" className="font-medium" style={{ color: "var(--fl-500)" }}>
              Criar uma turma
            </Link>{" "}
            — cada turma tem um segmento (do 1º ano ao Ensino Médio) que define a trilha dos alunos.
          </li>
          <li>
            Gerar o convite da turma e passar o código para os alunos — cada um cria a própria
            conta e já cai no lugar certo.
          </li>
          {v.papel === "adm" && (
            <li>
              <Link href="/escola/professores" className="font-medium" style={{ color: "var(--fl-500)" }}>
                Convidar professores
              </Link>{" "}
              — eles criam as próprias turmas e acompanham o desempenho.
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
