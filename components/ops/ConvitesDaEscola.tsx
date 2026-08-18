"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Convite {
  id: string
  codigo: string
  papel: string
  usos: number
  usosMax: number
  expiraEm: string
  turmaNome: string | null
}

/**
 * Os códigos vivos, com o botão que faltava.
 *
 * Revogar não desfaz matrícula: quem já entrou com o código continua na
 * turma. É trancar a porta, não expulsar quem passou, e a tela diz isso
 * porque a expectativa contrária é fácil de ter.
 */
export function ConvitesDaEscola({ convites }: { convites: Convite[] }) {
  const router = useRouter()
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function revogar(c: Convite) {
    if (!confirm(`Revogar o código ${c.codigo}? Quem já entrou continua na escola, o código é que para de funcionar.`)) {
      return
    }
    setOcupado(c.id)
    setErro(null)
    try {
      const r = await fetch(`/api/ops/convites/${c.id}`, { method: "DELETE" })
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
      <h3 className="text-base font-semibold text-fl-ink">Convites ativos ({convites.length})</h3>
      {convites.length === 0 ? (
        <p className="mt-2 text-sm text-fl-ink/60">Nenhum código valendo agora.</p>
      ) : (
        <ul className="mt-3 divide-y divide-fl-sand">
          {convites.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className="min-w-0">
                <p className="font-mono text-sm text-fl-ink">{c.codigo}</p>
                <p className="truncate text-xs text-fl-ink/50">
                  {c.papel}
                  {c.turmaNome ? ` · ${c.turmaNome}` : ""} · {c.usos}/{c.usosMax} usos · vale até{" "}
                  {c.expiraEm}
                </p>
              </div>
              <button
                onClick={() => revogar(c)}
                disabled={ocupado === c.id}
                className="text-xs font-medium text-[var(--fl-error)] disabled:opacity-60"
              >
                revogar
              </button>
            </li>
          ))}
        </ul>
      )}
      {erro && <p className="mt-3 text-sm text-[var(--fl-error)]">{erro}</p>}
    </section>
  )
}
