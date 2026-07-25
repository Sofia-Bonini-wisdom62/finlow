"use client"

import { brl } from "@/lib/formato"
import type { BarraMes } from "@/lib/financas"

// Receitas × Despesas por mês. Verde = entradas, tijolo dessaturado = saídas.
// Meses deficitários ganham um marcador — o sinal não depende só de cor.
export function GraficoBarras({ meses }: { meses: BarraMes[] }) {
  if (meses.length === 0) {
    return <p className="text-sm text-fl-ink-2">Sem histórico suficiente ainda.</p>
  }

  const max = Math.max(...meses.flatMap((m) => [m.receita, m.despesa]), 1)

  return (
    <div>
      <div className="flex items-end justify-between gap-2" style={{ height: 150 }}>
        {meses.map((m) => (
          <div key={m.mes} className="flex flex-1 flex-col items-center justify-end gap-1.5 self-stretch">
            <div className="flex w-full flex-1 items-end justify-center gap-[3px]">
              <div
                className="w-full max-w-3 rounded-t bg-fl-success"
                style={{ height: `${Math.max((m.receita / max) * 100, m.receita > 0 ? 2 : 0)}%` }}
                title={`Entradas: ${brl(m.receita)}`}
              />
              <div
                className="w-full max-w-3 rounded-t bg-fl-error"
                style={{ height: `${Math.max((m.despesa / max) * 100, m.despesa > 0 ? 2 : 0)}%` }}
                title={`Saídas: ${brl(m.despesa)}`}
              />
            </div>
            <span className="flex items-center gap-0.5 text-[10.5px] text-fl-ink-3">
              {m.rotulo}
              {m.deficitario && <span className="text-fl-error" title="Mês deficitário">▾</span>}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-4 text-[11px] text-fl-ink-2">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-fl-success" /> Entradas</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-fl-error" /> Saídas</span>
        <span className="flex items-center gap-1"><span className="text-fl-error">▾</span> deficitário</span>
      </div>
    </div>
  )
}
