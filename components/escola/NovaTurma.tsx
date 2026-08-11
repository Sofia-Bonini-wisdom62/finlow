"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SEGMENTOS_ESCOLARES } from "@/lib/publico"

/**
 * Formulário de turma nova. Quem valida de verdade é a rota.
 *
 * `segmentos` chega da página (server), já reduzido pela competência do
 * professor — o select só mostra o que a API aceitaria. Sem a prop, mostra
 * todos (adm, ou professor sem competência registrada).
 */
export function NovaTurma({
  segmentos = [...SEGMENTOS_ESCOLARES],
}: {
  segmentos?: { id: string; nome: string }[]
}) {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [nome, setNome] = useState("")
  const [segmento, setSegmento] = useState<string>(segmentos[0]?.id ?? "")
  const [serie, setSerie] = useState("")
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    setOcupado(true)
    setErro(null)
    try {
      const r = await fetch("/api/escola/turmas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, segmento, serie: serie || undefined }),
      })
      const d = await r.json()
      if (!r.ok) {
        setErro(d.erro ?? "Não deu certo. Tenta de novo?")
        setOcupado(false)
        return
      }
      setAberto(false)
      setNome("")
      setSerie("")
      setOcupado(false)
      router.refresh()
    } catch {
      setErro("Sem conexão. Tenta de novo?")
      setOcupado(false)
    }
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="rounded-xl px-4 py-2.5 text-sm font-medium text-white"
        style={{ background: "var(--fl-500)" }}
      >
        Nova turma
      </button>
    )
  }

  const inputClass =
    "w-full rounded-xl border border-fl-border bg-fl-card px-4 py-3 text-sm text-fl-ink outline-none focus:border-[var(--fl-500)]"

  return (
    <form onSubmit={criar} className="w-full space-y-3 rounded-2xl border border-fl-sand bg-fl-card p-4">
      <input
        type="text"
        placeholder="Nome da turma (ex.: 5º ano A)"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
        className={inputClass}
      />
      <select value={segmento} onChange={(e) => setSegmento(e.target.value)} className={inputClass}>
        {segmentos.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nome}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Série (opcional — ex.: 5)"
        value={serie}
        onChange={(e) => setSerie(e.target.value)}
        maxLength={4}
        className={inputClass}
      />
      {erro && <p className="text-sm text-[var(--fl-error)]">{erro}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={ocupado}
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          style={{ background: "var(--fl-500)" }}
        >
          {ocupado ? "Criando…" : "Criar turma"}
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-fl-ink/70"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
