"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { ContaFixaData } from "@/types/painel"
import { brl } from "@/lib/formato"
import { ModalBase, inputPainel, botaoPrimario } from "./ModalBase"

interface Props {
  contas: ContaFixaData[]
  onMudou: () => void
}

export function ContasFixasCard({ contas, onMudou }: Props) {
  const [modalAberto, setModalAberto] = useState(false)
  const [gerenciando, setGerenciando] = useState(false)
  const [editando, setEditando] = useState<ContaFixaData | null>(null)
  const [nome, setNome] = useState("")
  const [valor, setValor] = useState("")
  const [dia, setDia] = useState("")
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function abrirNovo() {
    setEditando(null)
    setNome("")
    setValor("")
    setDia("")
    setErro(null)
    setModalAberto(true)
  }

  function abrirEdicao(conta: ContaFixaData) {
    setEditando(conta)
    setNome(conta.nome)
    setValor(String(conta.valor))
    setDia(conta.diaVencimento ? String(conta.diaVencimento) : "")
    setErro(null)
    setModalAberto(true)
  }

  async function salvar() {
    setSalvando(true)
    setErro(null)
    const payload = {
      ...(editando ? { id: editando.id } : {}),
      nome,
      valor: valor.replace(",", "."),
      diaVencimento: dia || null,
    }
    const res = await fetch("/api/painel/contas-fixas", {
      method: editando ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
    await fetch(`/api/painel/contas-fixas?id=${id}`, { method: "DELETE" })
    onMudou()
  }

  return (
    <div className="rounded-2xl bg-fl-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-fl-ink-2">Contas Fixas</span>
        <div className="flex items-center gap-1">
          {contas.length > 0 && (
            <button
              onClick={() => setGerenciando(!gerenciando)}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-fl-ink-2 transition-colors hover:text-fl-ink"
            >
              {gerenciando ? "Concluir" : "Gerenciar Todas"}
            </button>
          )}
          <button
            aria-label="Adicionar conta fixa"
            onClick={abrirNovo}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-fl-page text-fl-500"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {contas.length === 0 ? (
        <p className="mt-3 text-sm text-fl-ink-2">Nenhuma conta fixa cadastrada.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {contas.map((c) => (
            <li key={c.id} className="flex items-center justify-between text-sm">
              <div>
                <span className="text-fl-ink">{c.nome}</span>
                {c.diaVencimento && (
                  <span className="ml-2 text-xs text-fl-ink-2">dia {c.diaVencimento}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-fl-ink-2">{brl(c.valor)}</span>
                {gerenciando && (
                  <>
                    <button aria-label={`Editar ${c.nome}`} onClick={() => abrirEdicao(c)} className="p-1.5 text-fl-ink-2 hover:text-fl-ink">
                      <Pencil className="size-4" />
                    </button>
                    <button aria-label={`Excluir ${c.nome}`} onClick={() => excluir(c.id)} className="p-1.5 text-fl-ink-2 hover:text-fl-accent-dark">
                      <Trash2 className="size-4" />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ModalBase titulo={editando ? "Editar conta fixa" : "Nova conta fixa"} aberto={modalAberto} onFechar={() => setModalAberto(false)}>
        <div className="flex flex-col gap-3">
          <input className={inputPainel} placeholder="Nome (ex: Spotify)" value={nome} onChange={(e) => setNome(e.target.value)} />
          <input className={inputPainel} inputMode="decimal" placeholder="Valor (R$)" value={valor} onChange={(e) => setValor(e.target.value)} />
          <input className={inputPainel} inputMode="numeric" placeholder="Dia do vencimento (opcional)" value={dia} onChange={(e) => setDia(e.target.value)} />
          {erro && <p className="text-sm text-fl-accent-dark">{erro}</p>}
          <button className={botaoPrimario} disabled={salvando || !nome || !valor} onClick={salvar}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </ModalBase>
    </div>
  )
}
