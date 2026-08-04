"use client"

import { useEffect, useState } from "react"
import { GraficoLinha } from "./GraficoLinha"
import { brl } from "@/lib/formato"

/**
 * Projeção de patrimônio 1/5/10 anos (Módulo Avançado). Sem a flag, null —
 * a página fica idêntica à de sempre.
 *
 * O texto diz DE ONDE os números vêm (total investido + média do que sobra +
 * taxa fixa de referência) porque projeção sem premissa à vista é promessa.
 * Não é recomendação de investimento — é régua de "se continuar assim".
 */

interface Dados {
  ativo: boolean
  total?: number
  projecao?: {
    taxaMes: number
    aporteMensal: number
    marcos: { anos: number; valor: number }[]
    serie: { rotulo: string; valor: number }[]
  }
}

export function ProjecaoPatrimonio() {
  const [dados, setDados] = useState<Dados | null>(null)

  useEffect(() => {
    fetch("/api/investimentos")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setDados(d) })
      .catch(() => {})
  }, [])

  if (!dados?.ativo || !dados.projecao) return null
  const p = dados.projecao
  const taxaPct = (p.taxaMes * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })

  return (
    <section className="rounded-[20px] border border-fl-border bg-fl-card p-5">
      <h2 className="text-[15px] font-bold text-fl-ink">Projeção de patrimônio</h2>
      <p className="mt-0.5 text-xs text-fl-ink-2">
        {brl(dados.total ?? 0)} investidos + {brl(p.aporteMensal)}/mês (sua sobra média) a {taxaPct}% a.m. É referência, não promessa.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {p.marcos.map((m) => (
          <div key={m.anos} className="rounded-2xl border border-fl-border bg-fl-page px-3 py-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-fl-ink-2">
              {m.anos} {m.anos === 1 ? "ano" : "anos"}
            </div>
            <div className="mt-0.5 truncate text-[15px] font-extrabold tabular-nums tracking-tight text-fl-ink">
              {brl(m.valor)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <GraficoLinha pontos={p.serie} mostrarZero />
      </div>
    </section>
  )
}
