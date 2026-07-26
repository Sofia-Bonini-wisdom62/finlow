"use client"

import type { TransacaoData } from "@/types/painel"
import { brl } from "@/lib/formato"

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export function GastoMedioPorDiaChart({ transacoes }: { transacoes: TransacaoData[] }) {
  const somas = Array(7).fill(0) as number[]
  const contagens = Array(7).fill(0) as number[]

  for (const t of transacoes) {
    if (t.tipo !== "despesa") continue
    const dia = new Date(t.data).getDay()
    somas[dia] += parseFloat(t.valor)
    contagens[dia]++
  }

  const medias = somas.map((s, i) => (contagens[i] > 0 ? s / contagens[i] : 0))
  const max = Math.max(...medias, 1)
  const temDados = medias.some((m) => m > 0)

  return (
    <div className="rounded-2xl bg-fl-card p-5">
      <span className="text-xs font-semibold uppercase tracking-wider text-fl-ink-2">
        Gasto Médio por Dia
      </span>

      {!temDados ? (
        <p className="mt-3 text-sm text-fl-ink-2">Registra algumas despesas pra ver seu padrão semanal.</p>
      ) : (
        <div className="mt-4 flex items-end justify-between gap-2" style={{ height: 140 }}>
          {medias.map((m, i) => (
            <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1.5 self-stretch">
              {m > 0 && (
                <span className="text-[10px] text-fl-ink-2">{brl(m).replace(",00", "")}</span>
              )}
              <div
                className="w-full rounded-t-md bg-fl-500 transition-all"
                style={{ height: `${Math.max((m / max) * 100, m > 0 ? 4 : 0)}%`, opacity: m > 0 ? 1 : 0.15 }}
              />
              <span className="text-[10px] text-fl-ink-2">{DIAS[i]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
