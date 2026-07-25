"use client"

import { brl } from "@/lib/formato"
import type { FatiaCategoria } from "@/lib/financas"

export function GraficoRosca({ fatias }: { fatias: FatiaCategoria[] }) {
  if (fatias.length === 0) {
    return <p className="text-sm text-fl-ink-2">Nenhuma despesa registrada neste mês.</p>
  }

  let acumulado = 0
  const paradas = fatias.map((f) => {
    const inicio = acumulado
    acumulado += f.pct
    return `${f.cor} ${inicio}% ${acumulado}%`
  })
  const total = fatias.reduce((s, f) => s + f.total, 0)

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div
        aria-hidden
        className="relative mx-auto size-[132px] shrink-0 rounded-full sm:mx-0"
        style={{ background: `conic-gradient(${paradas.join(", ")})` }}
      >
        <div className="absolute inset-[26px] flex flex-col items-center justify-center rounded-full bg-white">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-fl-ink-2">Total</span>
          <span className="text-[15px] font-extrabold tabular-nums text-fl-ink">{brl(total)}</span>
        </div>
      </div>

      <ul className="flex min-w-0 flex-1 flex-col gap-2">
        {fatias.map((f) => (
          <li key={f.nome} className="flex items-center justify-between gap-2 text-sm">
            <div className="flex min-w-0 items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: f.cor }} />
              <span className="truncate text-fl-ink">{f.nome}</span>
            </div>
            <span className="shrink-0 text-xs tabular-nums text-fl-ink-2">
              {f.pct}% · {brl(f.total)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
