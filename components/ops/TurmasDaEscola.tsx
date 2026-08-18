"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Turma {
  id: string
  nome: string
  segmento: string
  serie: string | null
  professorId: string | null
  alunos: number
}

/**
 * As turmas, com o campo que o schema prometia e nenhuma rota escrevia.
 *
 * Turma criada por adm nascia com `professorId` nulo, e o comentário do
 * schema dizia que "o adm designa outro professor" quando o anterior sai. Não
 * havia onde. Aqui há.
 */
export function TurmasDaEscola({
  escolaId,
  turmas,
  professores,
}: {
  escolaId: string
  turmas: Turma[]
  professores: { userId: string; nome: string }[]
}) {
  const router = useRouter()
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function designar(turmaId: string, professorId: string) {
    setOcupado(turmaId)
    setErro(null)
    try {
      const r = await fetch(`/api/ops/escolas/${escolaId}/turmas/${turmaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professorId: professorId || null }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) setErro(d.erro ?? "Não deu certo. Tenta de novo?")
      else router.refresh()
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    }
    setOcupado(null)
  }

  return (
    <section className="rounded-2xl border border-fl-sand bg-fl-card p-5">
      <h3 className="text-base font-semibold text-fl-ink">Turmas ({turmas.length})</h3>
      <p className="mt-1 text-sm text-fl-ink/60">
        Quem cria turma é a escola, em /escola/turmas. Aqui você só decide quem leciona cada uma.
      </p>
      {turmas.length === 0 ? (
        <p className="mt-2 text-sm text-fl-ink/60">Nenhuma turma ainda.</p>
      ) : (
        <ul className="mt-3 divide-y divide-fl-sand">
          {turmas.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-fl-ink">{t.nome}</p>
                <p className="truncate text-xs text-fl-ink/50">
                  {t.segmento}
                  {t.serie ? ` · ${t.serie}` : ""} · {t.alunos} aluno{t.alunos === 1 ? "" : "s"}
                </p>
              </div>
              <select
                value={t.professorId ?? ""}
                onChange={(e) => designar(t.id, e.target.value)}
                disabled={ocupado === t.id}
                className="rounded-lg border border-fl-sand bg-fl-page px-2 py-1.5 text-xs text-fl-ink disabled:opacity-60"
              >
                <option value="">sem professor</option>
                {professores.map((p) => (
                  <option key={p.userId} value={p.userId}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      )}
      {erro && <p className="mt-3 text-sm text-[var(--fl-error)]">{erro}</p>}
    </section>
  )
}
