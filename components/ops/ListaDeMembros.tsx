"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PAPEIS, rotuloDePapel, type PapelEscola } from "@/lib/escola-papeis"

interface Membro {
  userId: string
  nome: string | null
  email: string
  papel: PapelEscola
}

/**
 * Quem está na escola, e as duas ações que faltavam: trocar o papel e tirar
 * da escola.
 *
 * O aviso sobre sair de aluno não é decoração. Promover um aluno tira as
 * turmas dele e devolve a trilha para a adulta, porque senão ele continuaria
 * contando no rank da sala e vendo aula de 5º ano no próprio app. Quem clica
 * precisa saber disso antes, não depois.
 */
export function ListaDeMembros({ escolaId, membros }: { escolaId: string; membros: Membro[] }) {
  const router = useRouter()
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function agir(userId: string, init: RequestInit) {
    setOcupado(userId)
    setErro(null)
    try {
      const r = await fetch(`/api/ops/escolas/${escolaId}/membros/${userId}`, init)
      const d = await r.json().catch(() => ({}))
      if (!r.ok) setErro(d.erro ?? "Não deu certo. Tenta de novo?")
      else router.refresh()
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    }
    setOcupado(null)
  }

  function trocar(m: Membro, papel: string) {
    if (papel === m.papel) return
    const quem = m.nome ?? m.email
    if (m.papel === "aluno" && papel !== "aluno") {
      if (!confirm(`${quem} sai das turmas e volta para a trilha adulta. Continuar?`)) return
    }
    agir(m.userId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ papel }),
    })
  }

  function remover(m: Membro) {
    const quem = m.nome ?? m.email
    if (!confirm(`Tirar ${quem} da escola? A conta continua existindo como usuário comum do Finlow, com o progresso salvo.`)) {
      return
    }
    agir(m.userId, { method: "DELETE" })
  }

  return (
    <section className="rounded-2xl border border-fl-sand bg-fl-card p-5">
      <h3 className="text-base font-semibold text-fl-ink">Pessoas ({membros.length})</h3>
      {membros.length === 0 ? (
        <p className="mt-2 text-sm text-fl-ink/60">Ninguém ainda.</p>
      ) : (
        <ul className="mt-3 divide-y divide-fl-sand">
          {membros.map((m) => (
            <li key={m.userId} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-fl-ink">{m.nome ?? m.email}</p>
                <p className="truncate text-xs text-fl-ink/50">{m.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={m.papel}
                  onChange={(e) => trocar(m, e.target.value)}
                  disabled={ocupado === m.userId}
                  className="rounded-lg border border-fl-sand bg-fl-page px-2 py-1.5 text-xs text-fl-ink disabled:opacity-60"
                >
                  {PAPEIS.map((p) => (
                    <option key={p} value={p}>
                      {rotuloDePapel(p)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => remover(m)}
                  disabled={ocupado === m.userId}
                  className="text-xs font-medium text-[var(--fl-error)] disabled:opacity-60"
                >
                  tirar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {erro && <p className="mt-3 text-sm text-[var(--fl-error)]">{erro}</p>}
    </section>
  )
}
