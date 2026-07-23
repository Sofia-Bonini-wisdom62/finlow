"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import type { TransacaoData, CategoriaData } from "@/types/painel"
import { brl, dataCurta } from "@/lib/formato"
import { ModalBase, inputPainel, botaoPrimario } from "./ModalBase"

interface Props {
  transacoes: TransacaoData[]
  categorias: CategoriaData[]
  onMudou: () => void
}

function hojeISO(): string {
  return new Date().toISOString().split("T")[0]
}

export function TransacoesCard({ transacoes, categorias, onMudou }: Props) {
  const [modalAberto, setModalAberto] = useState(false)
  const [descricao, setDescricao] = useState("")
  const [valor, setValor] = useState("")
  const [tipo, setTipo] = useState<"receita" | "despesa">("despesa")
  const [categoriaId, setCategoriaId] = useState("")
  const [data, setData] = useState(hojeISO())
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function abrir() {
    setDescricao("")
    setValor("")
    setTipo("despesa")
    setCategoriaId("")
    setData(hojeISO())
    setErro(null)
    setModalAberto(true)
  }

  async function salvar() {
    setSalvando(true)
    setErro(null)
    const res = await fetch("/api/painel/transacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descricao,
        valor: valor.replace(",", "."),
        tipo,
        categoriaId: categoriaId || null,
        data,
      }),
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
    await fetch(`/api/painel/transacoes?id=${id}`, { method: "DELETE" })
    onMudou()
  }

  const categoriasDoTipo = categorias.filter((c) => c.tipo === tipo)

  return (
    <div className="rounded-2xl bg-finlow-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-finlow-muted">Últimas Transações</span>
        <button
          aria-label="Adicionar transação"
          onClick={abrir}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-finlow-bg text-finlow-green"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {transacoes.length === 0 ? (
        <p className="mt-3 text-sm text-finlow-muted">Nenhuma transação neste período.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2.5">
          {transacoes.map((t) => (
            <li key={t.id} className="group flex items-center justify-between text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: t.categoria?.cor ?? "#A0AEC0" }}
                  aria-hidden
                />
                <div className="min-w-0">
                  <span className="block truncate text-finlow-text">{t.descricao}</span>
                  <span className="text-xs text-finlow-muted">
                    {dataCurta(t.data)}{t.categoria ? ` · ${t.categoria.nome}` : ""}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={t.tipo === "receita" ? "text-finlow-green" : "text-finlow-muted"}>
                  {t.tipo === "receita" ? "+" : "−"} {brl(t.valor)}
                </span>
                <button aria-label={`Excluir ${t.descricao}`} onClick={() => excluir(t.id)} className="p-1.5 text-finlow-muted hover:text-finlow-yellow">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ModalBase titulo="Nova transação" aberto={modalAberto} onFechar={() => setModalAberto(false)}>
        <div className="flex flex-col gap-3">
          <input className={inputPainel} placeholder="Descrição (ex: iFood)" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          <input className={inputPainel} inputMode="decimal" placeholder="Valor (R$)" value={valor} onChange={(e) => setValor(e.target.value)} />

          <div className="flex gap-2">
            {(["despesa", "receita"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTipo(t); setCategoriaId("") }}
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

          <select className={inputPainel} value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
            <option value="">Sem categoria</option>
            {categoriasDoTipo.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>

          <input className={`${inputPainel} [color-scheme:dark]`} type="date" value={data} onChange={(e) => setData(e.target.value)} />

          {erro && <p className="text-sm text-finlow-yellow">{erro}</p>}
          <button className={botaoPrimario} disabled={salvando || !descricao || !valor} onClick={salvar}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </ModalBase>
    </div>
  )
}
