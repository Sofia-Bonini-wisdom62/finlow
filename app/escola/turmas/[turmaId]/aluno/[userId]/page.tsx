import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { vinculoEscolar, podeGerirTurma } from "@/lib/escola"
import { desempenhoDoAluno } from "@/lib/escola-desempenho"
import { quantasLicoes } from "@/lib/licoes"
import { db } from "@/lib/db"
import { POSE } from "@/lib/fin"

/**
 * O desempenho de UM aluno, na visão do professor (protótipo v2).
 *
 * Nome real, superfície interna da escola. Os quatro tiles em cima, as lições
 * recentes com "1ª passada × após correção" — a nota que valeu XP separada do
 * que o aluno consertou depois — e a tabela módulo a módulo embaixo. O total
 * de lições vem de quantasLicoes (nunca supor 4 — há módulo sem cenário).
 */

function dataCurta(d: Date | null): string {
  if (!d) return "-"
  const hoje = new Date()
  const dia = new Date(d)
  const diff = Math.floor((hoje.setHours(0, 0, 0, 0) - new Date(dia).setHours(0, 0, 0, 0)) / 86_400_000)
  if (diff === 0) return "hoje"
  if (diff === 1) return "ontem"
  return dia.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "")
}

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
  const somaAcertos = d.modulos.reduce((s, m) => s + m.acertos, 0)
  const somaQuiz = d.modulos.reduce((s, m) => s + m.totalQuiz, 0)
  const licoesTotal = d.modulos.reduce((s, m) => s + m.licoesConcluidas, 0)

  return (
    <div className="space-y-5">
      <div>
        <Link href={`/escola/turmas/${turmaId}`} className="text-sm font-bold" style={{ color: "var(--fl-500)" }}>
          ← Voltar para a turma
        </Link>
        <h2 className="mt-2 text-lg font-black text-fl-ink">{d.nome}</h2>
        <p className="text-sm text-fl-ink/60">
          {comecados.length} de {d.modulos.length} aulas começadas
        </p>
      </div>

      {/* Os quatro tiles do desenho. */}
      <section className="grid grid-cols-4 gap-2" aria-label="Resumo do aluno">
        <div className="rounded-[13px] bg-fl-card px-1 py-2.5 text-center">
          <div className="text-sm font-black text-fl-500">{d.pontos}</div>
          <div className="text-[9.5px] font-extrabold text-fl-ink-3">XP</div>
        </div>
        <div className="rounded-[13px] bg-fl-card px-1 py-2.5 text-center">
          <div className="text-sm font-black text-fl-success">
            {somaQuiz > 0 ? `${Math.round((somaAcertos / somaQuiz) * 100)}%` : "-"}
          </div>
          <div className="text-[9.5px] font-extrabold text-fl-ink-3">ACERTO</div>
        </div>
        <div className="rounded-[13px] bg-fl-card px-1 py-2.5 text-center">
          <div className="text-sm font-black text-fl-ink">{licoesTotal}</div>
          <div className="text-[9.5px] font-extrabold text-fl-ink-3">LIÇÕES</div>
        </div>
        <div className="rounded-[13px] bg-fl-card px-1 py-2.5 text-center">
          <div className="text-sm font-black" style={{ color: "var(--fin-combo, #F5772E)" }}>
            {d.ofensiva}
          </div>
          <div className="text-[9.5px] font-extrabold text-fl-ink-3">OFENSIVA</div>
        </div>
      </section>

      {/* 1ª passada × após correção. */}
      {d.licoesRecentes.length > 0 && (
        <section aria-label="Lições recentes">
          <h3 className="mb-2 px-0.5 text-[11px] font-black tracking-widest text-fl-ink-3">
            LIÇÕES RECENTES · 1ª PASSADA × APÓS CORREÇÃO
          </h3>
          <div className="flex flex-col gap-2">
            {d.licoesRecentes.map((l, i) => {
              const cheia = l.acertos === l.totalQuiz
              return (
                <div key={i} className="rounded-[13px] bg-fl-card px-3.5 py-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[12.5px] font-black text-fl-ink">
                      Lição {l.licao} · {l.moduloTitulo}
                    </span>
                    <span className="shrink-0 text-[11px] font-extrabold text-fl-ink-3">
                      {dataCurta(l.concluidoEm)}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-fl-ink-2">
                    <strong className={cheia ? "font-black text-fl-success" : "font-black text-fl-500"}>
                      {l.acertos}/{l.totalQuiz} de primeira
                    </strong>
                    {l.totalQuizRevisao != null && (
                      <> · {l.acertosRevisao}/{l.totalQuizRevisao} após correção</>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-3 flex items-center gap-2.5 rounded-[14px] bg-fl-card px-3.5 py-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={POSE.teach} alt="" className="size-[38px] shrink-0 object-contain" />
            <p className="text-xs leading-snug text-fl-ink-2">
              A 2ª rodada não vale XP nem infla a média: os dois números ficam separados.
            </p>
          </div>
        </section>
      )}

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
                    {m.totalQuiz > 0 ? `${Math.round((m.acertos / m.totalQuiz) * 100)}%` : "-"}
                  </td>
                  <td className="py-2 pr-3 tabular-nums text-fl-ink">{m.minutos} min</td>
                  <td className="py-2 text-fl-ink/70">
                    {m.concluidoEm ? new Date(m.concluidoEm).toLocaleDateString("pt-BR") : "-"}
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
