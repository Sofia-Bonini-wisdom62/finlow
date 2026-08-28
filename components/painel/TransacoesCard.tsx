"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import type { TransacaoData, CategoriaData } from "@/types/painel"
import { brl, dataCurta, paraNumero } from "@/lib/formato"
import { hojeNoCalendario } from "@/lib/dia"
import { ModalBase, inputPainel, botaoPrimario } from "./ModalBase"

interface Props {
  transacoes: TransacaoData[]
  categorias: CategoriaData[]
  onMudou: () => void
  /** Módulo Avançado ligado: mostra o marcador pessoal × trabalho no form. */
  avancado?: boolean
}

// O dia de HOJE é o do calendário de quem está lançando, não o do UTC: às 22h
// de 30 de setembro em São Paulo, `toISOString()` — que era o que estava aqui —
// responde "1º de outubro", e o gasto ia para o mês seguinte enquanto a pessoa
// ainda jantava. O servidor grava esse dia às 12:00Z e o lê de volta em UTC
// (`lib/dia.ts`), então o dia que ela escolheu é o dia que ela vê.
export function TransacoesCard({ transacoes, categorias, onMudou, avancado }: Props) {
  const [modalAberto, setModalAberto] = useState(false)
  const [descricao, setDescricao] = useState("")
  const [valor, setValor] = useState("")
  const [tipo, setTipo] = useState<"receita" | "despesa">("despesa")
  const [categoriaId, setCategoriaId] = useState("")
  const [data, setData] = useState(hojeNoCalendario())
  const [escopo, setEscopo] = useState<"pessoal" | "trabalho">("pessoal")
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function abrir() {
    setDescricao("")
    setValor("")
    setTipo("despesa")
    setCategoriaId("")
    setData(hojeNoCalendario())
    setEscopo("pessoal")
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
        valor: paraNumero(valor),
        tipo,
        categoriaId: categoriaId || null,
        data,
        ...(avancado && escopo === "trabalho" ? { escopo } : {}),
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
    <div className="rounded-2xl bg-fl-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-fl-ink-2">Últimas Transações</span>
        <button
          aria-label="Adicionar transação"
          onClick={abrir}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-fl-page text-fl-500"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {transacoes.length === 0 ? (
        <p className="mt-3 text-sm text-fl-ink-2">Nenhuma transação neste período.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2.5">
          {transacoes.map((t) => (
            <li key={t.id} className="group flex items-center justify-between text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="cor-dado h-2 w-2 shrink-0 rounded-full"
                  style={{ background: t.categoria?.cor ?? "var(--fl-ink-2)" }}
                  aria-hidden
                />
                <div className="min-w-0">
                  <span className="block truncate text-fl-ink">{t.descricao}</span>
                  <span className="text-xs text-fl-ink-2">
                    {dataCurta(t.data)}{t.categoria ? ` · ${t.categoria.nome}` : ""}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={t.tipo === "receita" ? "text-fl-500" : "text-fl-ink-2"}>
                  {t.tipo === "receita" ? "+" : "−"} {brl(t.valor)}
                </span>
                <button aria-label={`Excluir ${t.descricao}`} onClick={() => excluir(t.id)} className="p-1.5 text-fl-ink-2 hover:text-fl-accent-dark">
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
                    ? "border-fl-500 bg-fl-500/10 text-fl-500"
                    : "border-fl-border bg-fl-page text-fl-ink-2"
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

          <input className={`${inputPainel} `} type="date" value={data} onChange={(e) => setData(e.target.value)} />

          {avancado && (
            <div className="flex gap-2">
              {(["pessoal", "trabalho"] as const).map((e) => (
                <button
                  key={e}
                  onClick={() => setEscopo(e)}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-medium capitalize transition-colors ${
                    escopo === e
                      ? "border-fl-500 bg-fl-500/10 text-fl-500"
                      : "border-fl-border bg-fl-page text-fl-ink-2"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          )}

          {erro && <p className="text-sm text-fl-accent-dark">{erro}</p>}
          <button className={botaoPrimario} disabled={salvando || !descricao || !valor} onClick={salvar}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </ModalBase>
    </div>
  )
}
