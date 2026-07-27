"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import type { TransacaoData } from "@/types/painel"
import { brl } from "@/lib/formato"

export function ResultadoPeriodoCard({ transacoes }: { transacoes: TransacaoData[] }) {
  const [expandido, setExpandido] = useState(false)

  const receitas = transacoes.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0)
  const despesasLista = transacoes.filter((t) => t.tipo === "despesa")
  const despesas = despesasLista.reduce((s, t) => s + t.valor, 0)
  const saldo = receitas - despesas

  return (
    <div className="rounded-2xl bg-fl-card p-5">
      <button onClick={() => setExpandido(!expandido)} className="w-full text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-fl-ink-2">
            Resultado do Período
          </span>
          <ChevronDown
            className={`size-4 text-fl-ink-2 transition-transform ${expandido ? "rotate-180" : ""}`}
          />
        </div>
        {/* saldo negativo: alerta suave (amarelo), nunca vermelho agressivo */}
        <p className={`mt-2 text-3xl font-bold ${saldo >= 0 ? "text-fl-500" : "text-fl-accent-dark"}`}>
          {brl(saldo)}
        </p>
        <div className="mt-3 flex gap-6">
          <div>
            <span className="block text-xs text-fl-ink-2">Receitas</span>
            <span className="text-sm font-semibold text-fl-500">+ {brl(receitas)}</span>
          </div>
          <div>
            <span className="block text-xs text-fl-ink-2">Despesas</span>
            <span className="text-sm font-semibold text-fl-ink">− {brl(despesas)}</span>
          </div>
        </div>
      </button>

      {expandido && (
        <div className="mt-4 border-t border-fl-border pt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-fl-ink-2">
            Minhas Despesas
          </span>
          {despesasLista.length === 0 ? (
            <p className="mt-2 text-sm text-fl-ink-2">Nenhuma despesa neste período.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {despesasLista.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm">
                  <span className="text-fl-ink">{t.descricao}</span>
                  <span className="text-fl-ink-2">− {brl(t.valor)}</span>
                </li>
              ))}
              <li className="mt-1 flex items-center justify-between border-t border-fl-border pt-2 text-sm font-semibold">
                <span className="text-fl-ink">Total</span>
                <span className="text-fl-ink">− {brl(despesas)}</span>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
