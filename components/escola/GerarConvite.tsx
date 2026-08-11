"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

/**
 * Gera um convite e mostra o LINK inteiro, não só o código: o professor cola
 * no grupo da turma e pronto. O código continua visível para quem prefere
 * ditar em sala.
 */
export function GerarConvite({ papel, turmaId, rotulo }: { papel: "professor" | "aluno"; turmaId?: string; rotulo: string }) {
  const router = useRouter()
  const [link, setLink] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  async function gerar() {
    setOcupado(true)
    setErro(null)
    try {
      const r = await fetch("/api/escola/convites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ papel, turmaId }),
      })
      const d = await r.json()
      if (!r.ok) {
        setErro(d.erro ?? "Não deu certo. Tenta de novo?")
        setOcupado(false)
        return
      }
      setLink(`${window.location.origin}/convite/${d.codigo}`)
      setOcupado(false)
      router.refresh()
    } catch {
      setErro("Sem conexão. Tenta de novo?")
      setOcupado(false)
    }
  }

  async function copiar() {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // seleção manual ainda funciona — o link está na tela
    }
  }

  return (
    <div className="space-y-2">
      {link ? (
        <div className="rounded-xl border border-fl-sand bg-fl-page px-4 py-3">
          <p className="break-all font-mono text-sm text-fl-ink">{link}</p>
          <button onClick={copiar} className="mt-2 text-sm font-medium" style={{ color: "var(--fl-500)" }}>
            {copiado ? "Copiado!" : "Copiar link"}
          </button>
        </div>
      ) : (
        <button
          onClick={gerar}
          disabled={ocupado}
          className="rounded-xl border border-fl-sand bg-fl-card px-4 py-2.5 text-sm font-medium text-fl-ink disabled:opacity-60"
        >
          {ocupado ? "Gerando…" : rotulo}
        </button>
      )}
      {erro && <p className="text-sm text-[var(--fl-error)]">{erro}</p>}
    </div>
  )
}
