"use client"

import { brl } from "@/lib/formato"
import type { FatiaCategoria } from "@/lib/financas"

export function GraficoRosca({ fatias }: { fatias: FatiaCategoria[] }) {
  if (fatias.length === 0) {
    return <p className="text-sm text-fl-ink-2">Nenhuma despesa registrada neste mês.</p>
  }

  const total = fatias.reduce((s, f) => s + f.total, 0)

  // As paradas saem do valor real, não do pct arredondado: somar inteiros
  // arredondados dava 99% ou 101% e a rosca fechava com uma fatia torta.
  let acumulado = 0
  const paradas = fatias.map((f, i) => {
    const inicio = (acumulado / total) * 100
    acumulado += f.total
    const fim = i === fatias.length - 1 ? 100 : (acumulado / total) * 100
    return `${f.cor} ${inicio.toFixed(3)}% ${fim.toFixed(3)}%`
  })

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div
        aria-hidden
        className="cor-dado relative mx-auto size-[132px] shrink-0 rounded-full sm:mx-0"
        style={{ background: `conic-gradient(${paradas.join(", ")})` }}
      >
        <div className="absolute inset-[26px] flex flex-col items-center justify-center rounded-full bg-fl-card">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-fl-ink-2">Total</span>
          <span className="text-[15px] font-extrabold tabular-nums text-fl-ink">{brl(total)}</span>
        </div>
      </div>

      <ul className="flex min-w-0 flex-1 flex-col gap-2">
        {fatias.map((f) => (
          <li key={f.nome} className="flex items-center justify-between gap-2 text-sm">
            <div className="flex min-w-0 items-center gap-2">
              <span className="cor-dado size-2.5 shrink-0 rounded-full" style={{ background: f.cor }} />
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
