import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { vinculoEscolar } from "@/lib/escola"

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
