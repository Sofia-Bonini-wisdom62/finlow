"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import type { TransacaoData } from "@/types/painel"
import { brl } from "@/lib/formato"

export function ResultadoPeriodoCard({ transacoes }: { transacoes: TransacaoData[] }) {
  const [expandido, setExpandido] = useState(false)

  const receitas = transacoes.filter((t) => t.tipo === "receita").reduce((s, t) => s + parseFloat(t.valor), 0)
  const despesasLista = transacoes.filter((t) => t.tipo === "despesa")
  const despesas = despesasLista.reduce((s, t) => s + parseFloat(t.valor), 0)
  const saldo = receitas - despesas

  return (
    <div className="rounded-2xl bg-finlow-card p-5">
      <button onClick={() => setExpandido(!expandido)} className="w-full text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-finlow-muted">
            Resultado do Período
          </span>
          <ChevronDown
            className={`size-4 text-finlow-muted transition-transform ${expandido ? "rotate-180" : ""}`}
          />
        </div>
        {/* saldo negativo: alerta suave (amarelo), nunca vermelho agressivo */}
        <p className={`mt-2 text-3xl font-bold ${saldo >= 0 ? "text-finlow-green" : "text-finlow-yellow"}`}>
          {brl(saldo)}
        </p>
        <div className="mt-3 flex gap-6">
          <div>
            <span className="block text-xs text-finlow-muted">Receitas</span>
            <span className="text-sm font-semibold text-finlow-green">+ {brl(receitas)}</span>
          </div>
          <div>
            <span className="block text-xs text-finlow-muted">Despesas</span>
            <span className="text-sm font-semibold text-finlow-text">− {brl(despesas)}</span>
          </div>
        </div>
      </button>

      {expandido && (
        <div className="mt-4 border-t border-finlow-bg pt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-finlow-muted">
            Minhas Despesas
          </span>
          {despesasLista.length === 0 ? (
            <p className="mt-2 text-sm text-finlow-muted">Nenhuma despesa neste período.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {despesasLista.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm">
                  <span className="text-finlow-text">{t.descricao}</span>
                  <span className="text-finlow-muted">− {brl(t.valor)}</span>
                </li>
              ))}
              <li className="mt-1 flex items-center justify-between border-t border-finlow-bg pt-2 text-sm font-semibold">
                <span className="text-finlow-text">Total</span>
                <span className="text-finlow-text">− {brl(despesas)}</span>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
