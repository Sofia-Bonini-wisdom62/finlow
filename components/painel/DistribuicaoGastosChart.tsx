"use client"

import type { TransacaoData } from "@/types/painel"
import { brl } from "@/lib/formato"

const COR_SEM_CATEGORIA = "#5C6469"

export interface FatiaCategoria {
  nome: string
  cor: string
  total: number
  pct: number
}

export function agruparPorCategoria(transacoes: TransacaoData[]): FatiaCategoria[] {
  const mapa = new Map<string, { cor: string; total: number }>()
  let totalGeral = 0

  for (const t of transacoes) {
    if (t.tipo !== "despesa") continue
    const valor = parseFloat(t.valor)
    totalGeral += valor
    const nome = t.categoria?.nome ?? "Sem categoria"
    const cor = t.categoria?.cor ?? COR_SEM_CATEGORIA
    const atual = mapa.get(nome) ?? { cor, total: 0 }
    atual.total += valor
    mapa.set(nome, atual)
  }

  return [...mapa.entries()]
    .map(([nome, { cor, total }]) => ({
      nome,
      cor,
      total,
      pct: totalGeral > 0 ? Math.round((total / totalGeral) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
}

// pizza em conic-gradient — comunica "fatia do total" sem lib de gráfico
export function DistribuicaoGastosChart({ transacoes }: { transacoes: TransacaoData[] }) {
  const fatias = agruparPorCategoria(transacoes)

  let acumulado = 0
  const paradas = fatias.map((f) => {
    const inicio = acumulado
    acumulado += f.pct
    return `${f.cor} ${inicio}% ${acumulado}%`
  })

  return (
    <div className="rounded-2xl bg-white p-5">
      <span className="text-xs font-semibold uppercase tracking-wider text-fl-ink-2">
        Distribuição de Gastos
      </span>

      {fatias.length === 0 ? (
        <p className="mt-3 text-sm text-fl-ink-2">Suas despesas por categoria aparecem aqui.</p>
      ) : (
        <div className="mt-4 flex items-center gap-5">
          <div
            aria-hidden
            className="h-28 w-28 shrink-0 rounded-full"
            style={{ background: `conic-gradient(${paradas.join(", ")})` }}
          />
          <ul className="flex min-w-0 flex-1 flex-col gap-2">
            {fatias.map((f) => (
              <li key={f.nome} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: f.cor }} aria-hidden />
                  <span className="truncate text-fl-ink">{f.nome}</span>
                </div>
                <span className="shrink-0 text-xs text-fl-ink-2">{f.pct}% · {brl(f.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
