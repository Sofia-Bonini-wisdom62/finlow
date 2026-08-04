"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus, Trash2, PiggyBank } from "lucide-react"
import { brl, paraNumero } from "@/lib/formato"
import { ModalBase, inputPainel, botaoPrimario } from "./ModalBase"

/**
 * Consolidação de investimentos (Módulo Avançado). Entrada manual — a pessoa
 * digita onde tem e quanto tem, e o card agrupa por tipo. Sem a flag o
 * componente devolve null e a página fica como sempre foi.
 */

const NOME_TIPO: Record<string, string> = {
  renda_fixa: "Renda fixa",
  acoes: "Ações",
  fundos: "Fundos",
  cripto: "Cripto",
  outro: "Outros",
}

interface Investimento {
  id: string
  tipo: string
  nome: string
  instituicao: string | null
  valorAtual: number
}

interface Dados {
  ativo: boolean
  investimentos?: Investimento[]
  total?: number
  porTipo?: Record<string, number>
}

export function InvestimentosCard() {
  const [dados, setDados] = useState<Dados | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [tipo, setTipo] = useState("renda_fixa")
  const [nome, setNome] = useState("")
  const [instituicao, setInstituicao] = useState("")
  const [valor, setValor] = useState("")
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(() => {
    fetch("/api/investimentos")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setDados(d) })
      .catch(() => {})
  }, [])

  useEffect(() => { carregar() }, [carregar])

  if (!dados?.ativo) return null

  const investimentos = dados.investimentos ?? []

  function abrir() {
    setTipo("renda_fixa")
    setNome("")
    setInstituicao("")
    setValor("")
    setErro(null)
    setModalAberto(true)
  }

  async function salvar() {
    setSalvando(true)
    setErro(null)
    const res = await fetch("/api/investimentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo,
        nome,
        instituicao: instituicao.trim() || null,
        valorAtual: paraNumero(valor),
      }),
    })
    setSalvando(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setErro(d.error ?? "Erro ao salvar")
      return
    }
    setModalAberto(false)
    carregar()
  }

  async function excluir(id: string) {
    await fetch(`/api/investimentos?id=${id}`, { method: "DELETE" })
    carregar()
  }

  return (
    <div className="rounded-2xl bg-fl-card p-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-fl-ink-2">
          <PiggyBank className="size-3.5" /> Investimentos
        </span>
        <button
          aria-label="Adicionar investimento"
          onClick={abrir}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-fl-page text-fl-500"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {investimentos.length === 0 ? (
        <p className="mt-3 text-sm text-fl-ink-2">
          Registra onde seu dinheiro está aplicado e o total aparece aqui, junto
          da projeção nas Análises.
        </p>
      ) : (
        <>
          <div className="mt-3 text-2xl font-extrabold tabular-nums tracking-tight text-fl-ink">
            {brl(dados.total ?? 0)}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11.5px] text-fl-ink-2">
            {Object.entries(dados.porTipo ?? {}).map(([t, v]) => (
              <span key={t}>{NOME_TIPO[t] ?? t}: <strong className="font-semibold text-fl-ink">{brl(v)}</strong></span>
            ))}
          </div>

          <ul className="mt-3 flex flex-col gap-2 border-t border-fl-divider pt-3">
            {investimentos.map((i) => (
              <li key={i.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <span className="block truncate text-fl-ink">{i.nome}</span>
                  <span className="text-xs text-fl-ink-2">
                    {NOME_TIPO[i.tipo] ?? i.tipo}{i.instituicao ? ` · ${i.instituicao}` : ""}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="tabular-nums text-fl-ink-2">{brl(i.valorAtual)}</span>
                  <button aria-label={`Excluir ${i.nome}`} onClick={() => excluir(i.id)} className="p-1.5 text-fl-ink-2 hover:text-fl-accent-dark">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <ModalBase titulo="Novo investimento" aberto={modalAberto} onFechar={() => setModalAberto(false)}>
        <div className="flex flex-col gap-3">
          <select className={inputPainel} value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {Object.entries(NOME_TIPO).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
          <input className={inputPainel} placeholder="Nome (ex: Tesouro Selic 2029)" value={nome} onChange={(e) => setNome(e.target.value)} />
          <input className={inputPainel} placeholder="Instituição (opcional)" value={instituicao} onChange={(e) => setInstituicao(e.target.value)} />
          <input className={inputPainel} inputMode="decimal" placeholder="Valor atual (R$)" value={valor} onChange={(e) => setValor(e.target.value)} />

          {erro && <p className="text-sm text-fl-accent-dark">{erro}</p>}
          <button className={botaoPrimario} disabled={salvando || !nome || !valor} onClick={salvar}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </ModalBase>
    </div>
  )
}
