"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { CategoriaData } from "@/types/painel"
import { ModalBase, inputPainel, botaoPrimario } from "./ModalBase"

// Paleta de categoria conforme a identidade: Primary + Secondary + Accent +
// neutros intermediários. Nunca cores semânticas (verde/vermelho) — essas são
// reservadas a "dentro/fora do orçamento". A lista antiga trazia roxo (#9F7AEA),
// que a identidade veta explicitamente por ser território do Nubank.
const CORES = [
  "var(--fl-500)",
  "var(--fl-accent)",
  "var(--fl-300)",
  "var(--fl-info)",
  "var(--fl-200)",
  "var(--fl-sand)",
]

interface Props {
  categorias: CategoriaData[]
  onMudou: () => void
}

export function CategoriasCard({ categorias, onMudou }: Props) {
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<CategoriaData | null>(null)
  const [nome, setNome] = useState("")
  const [tipo, setTipo] = useState<"receita" | "despesa">("despesa")
  const [cor, setCor] = useState(CORES[0])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function abrirNovo() {
    setEditando(null)
    setNome("")
    setTipo("despesa")
    setCor(CORES[0])
    setErro(null)
    setModalAberto(true)
  }

  function abrirEdicao(cat: CategoriaData) {
    setEditando(cat)
    setNome(cat.nome)
    setTipo(cat.tipo)
    setCor(cat.cor ?? CORES[0])
    setErro(null)
    setModalAberto(true)
  }

  async function salvar() {
    setSalvando(true)
    setErro(null)
    const res = await fetch("/api/painel/categorias", {
      method: editando ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...(editando ? { id: editando.id } : {}), nome, tipo, cor }),
    })
    setSalvando(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setErro(d.error ?? "Erro ao salvar")
      return
    }
    setModalAberto(false)
    onMudou()
  }

  async function excluir(id: string) {
    await fetch(`/api/painel/categorias?id=${id}`, { method: "DELETE" })
    onMudou()
  }

  return (
    <div className="rounded-2xl bg-fl-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-fl-ink-2">Categorias</span>
        <button
          aria-label="Criar categoria"
          onClick={abrirNovo}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-fl-page text-fl-500"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {categorias.length === 0 ? (
        <p className="mt-3 text-sm text-fl-ink-2">Nenhuma categoria ainda.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {categorias.map((c) => (
            <li key={c.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="cor-dado h-2.5 w-2.5 rounded-full" style={{ background: c.cor ?? "var(--fl-ink-2)" }} aria-hidden />
                <span className="text-fl-ink">{c.nome}</span>
                <span className="text-xs text-fl-ink-2">{c.tipo}</span>
              </div>
              <div className="flex items-center gap-1">
                <button aria-label={`Editar ${c.nome}`} onClick={() => abrirEdicao(c)} className="p-1.5 text-fl-ink-2 hover:text-fl-ink">
                  <Pencil className="size-4" />
                </button>
                <button aria-label={`Excluir ${c.nome}`} onClick={() => excluir(c.id)} className="p-1.5 text-fl-ink-2 hover:text-fl-accent-dark">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ModalBase titulo={editando ? "Editar categoria" : "Nova categoria"} aberto={modalAberto} onFechar={() => setModalAberto(false)}>
        <div className="flex flex-col gap-3">
          <input className={inputPainel} placeholder="Nome da categoria" value={nome} onChange={(e) => setNome(e.target.value)} />

          <div className="flex gap-2">
            {(["despesa", "receita"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium capitalize transition-colors ${
                  tipo === t
                    ? "border-fl-500 bg-fl-500/10 text-fl-500"
                    : "border-fl-border bg-fl-page text-fl-ink-2"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {CORES.map((c) => (
              <button
                key={c}
                aria-label={`Cor ${c}`}
                onClick={() => setCor(c)}
                className={`h-8 w-8 rounded-full transition-transform ${cor === c ? "scale-110 ring-2 ring-fl-ink" : ""}`}
                style={{ background: c }}
              />
            ))}
          </div>

          {erro && <p className="text-sm text-fl-accent-dark">{erro}</p>}
          <button className={botaoPrimario} disabled={salvando || !nome} onClick={salvar}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </ModalBase>
    </div>
  )
}
