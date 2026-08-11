import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { vinculoEscolar } from "@/lib/escola"
import { GerarConvite } from "@/components/escola/GerarConvite"
import { CompetenciasProfessor } from "@/components/escola/CompetenciasProfessor"

/** Só o adm: professores da escola e o convite para entrar mais um. */
export default async function ProfessoresPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const v = await vinculoEscolar(session.user.id)
  if (!v || v.papel !== "adm") redirect("/escola")

  const [professores, convites] = await Promise.all([
    db.membroEscola.findMany({
      where: { escolaId: v.escolaId, papel: "professor" },
      select: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            turmasQueLeciona: { select: { id: true } },
            competencias: { where: { escolaId: v.escolaId }, select: { segmento: true } },
          },
        },
      },
      orderBy: { criadoEm: "asc" },
    }),
    db.conviteEscola.findMany({
      where: { escolaId: v.escolaId, papel: "professor", revogadoEm: null },
      select: { codigo: true, usos: true, usosMax: true, expiraEm: true },
      orderBy: { criadoEm: "desc" },
      take: 3,
    }),
  ])

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-fl-ink">Professores</h2>

      <section className="rounded-2xl border border-fl-sand bg-fl-card p-5">
        <h3 className="text-base font-semibold text-fl-ink">Convidar professor</h3>
        <p className="mt-1 text-sm text-fl-ink/60">
          O professor cria a própria conta pelo link e já entra na escola.
        </p>
        <div className="mt-3">
          <GerarConvite papel="professor" rotulo="Gerar convite de professor" />
        </div>
        {convites.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-fl-ink/70">
            {convites.map((c) => (
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
          Na escola ({professores.length})
        </h3>
        {professores.length === 0 ? (
          <p className="mt-2 text-sm text-fl-ink/60">Nenhum professor ainda.</p>
        ) : (
          <ul className="mt-3 divide-y divide-fl-sand">
            {professores.map((p) => (
              <li key={p.user.id} className="py-3 text-sm">
                <div className="flex items-baseline justify-between">
                  <span className="text-fl-ink">{p.user.nome ?? p.user.email}</span>
                  <span className="text-fl-ink/50">
                    {p.user.turmasQueLeciona.length} turma{p.user.turmasQueLeciona.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-2">
                  <CompetenciasProfessor
                    professorId={p.user.id}
                    ativas={p.user.competencias.map((c) => c.segmento)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
