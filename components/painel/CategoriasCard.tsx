"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { CategoriaData } from "@/types/painel"
import { ModalBase, inputPainel, botaoPrimario } from "./ModalBase"

const CORES = ["#00C896", "#F5A623", "#4FD1C5", "#63B3ED", "#9F7AEA", "#F87171"]

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
    <div className="rounded-2xl bg-finlow-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-finlow-muted">Categorias</span>
        <button
          aria-label="Criar categoria"
          onClick={abrirNovo}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-finlow-bg text-finlow-green"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {categorias.length === 0 ? (
        <p className="mt-3 text-sm text-finlow-muted">Nenhuma categoria ainda.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {categorias.map((c) => (
            <li key={c.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.cor ?? "#A0AEC0" }} aria-hidden />
                <span className="text-finlow-text">{c.nome}</span>
                <span className="text-xs text-finlow-muted">{c.tipo}</span>
              </div>
              <div className="flex items-center gap-1">
                <button aria-label={`Editar ${c.nome}`} onClick={() => abrirEdicao(c)} className="p-1.5 text-finlow-muted hover:text-finlow-text">
                  <Pencil className="size-4" />
                </button>
                <button aria-label={`Excluir ${c.nome}`} onClick={() => excluir(c.id)} className="p-1.5 text-finlow-muted hover:text-finlow-yellow">
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
                    ? "border-finlow-green bg-finlow-green/10 text-finlow-green"
                    : "border-finlow-bg bg-finlow-bg text-finlow-muted"
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
                className={`h-8 w-8 rounded-full transition-transform ${cor === c ? "scale-110 ring-2 ring-finlow-text" : ""}`}
                style={{ background: c }}
              />
            ))}
          </div>

          {erro && <p className="text-sm text-finlow-yellow">{erro}</p>}
          <button className={botaoPrimario} disabled={salvando || !nome} onClick={salvar}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </ModalBase>
    </div>
  )
}
