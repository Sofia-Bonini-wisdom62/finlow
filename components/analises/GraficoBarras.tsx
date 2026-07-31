"use client"

import { useState } from "react"
import { brl } from "@/lib/formato"
import type { BarraMes } from "@/lib/financas"

/**
 * Receitas × Despesas por mês. Verde = entradas, tijolo dessaturado = saídas.
 * Meses deficitários ganham um marcador — o sinal não depende só de cor.
 *
 * SOBRE A INTERAÇÃO
 * Os valores viviam em `title=`, que é tooltip de hover: no celular não existe
 * hover, então no aparelho em que este app é usado os números simplesmente não
 * eram alcançáveis. Agora cada mês é um botão, e o mês escolhido aparece por
 * extenso acima do gráfico — legível, copiável e igual no toque e no teclado.
 *
 * Começa no mês mais recente para nunca haver gráfico sem número na tela.
 */
export function GraficoBarras({ meses }: { meses: BarraMes[] }) {
  const [selecionado, setSelecionado] = useState<number | null>(null)

  if (meses.length === 0) {
    return <p className="text-sm text-fl-ink-2">Sem histórico suficiente ainda.</p>
  }

  const max = Math.max(...meses.flatMap((m) => [m.receita, m.despesa]), 1)
  const iAtivo = selecionado ?? meses.length - 1
  const ativo = meses[iAtivo]
  const sobra = ativo.receita - ativo.despesa

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span className="text-[13px] font-semibold text-fl-ink">{ativo.rotulo}</span>
        <span className="text-[12.5px] tabular-nums text-fl-ink-2">
          <span className="text-fl-success">{brl(ativo.receita)}</span>
          {" − "}
          <span className="text-fl-error">{brl(ativo.despesa)}</span>
          {" = "}
          <strong className={`font-semibold ${sobra < 0 ? "text-fl-error" : "text-fl-ink"}`}>{brl(sobra)}</strong>
        </span>
      </div>

      <div className="flex items-end justify-between gap-1" style={{ height: 150 }}>
        {meses.map((m, i) => (
          <button
            key={m.mes}
            type="button"
            onClick={() => setSelecionado(i)}
            aria-pressed={i === iAtivo}
            aria-label={`${m.rotulo}: entradas ${brl(m.receita)}, saídas ${brl(m.despesa)}`}
            className={`flex flex-1 flex-col items-center justify-end gap-1.5 self-stretch rounded-lg py-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-fl-500 ${
              i === iAtivo ? "bg-fl-50" : "hover:bg-fl-50/60"
            }`}
          >
            <div className="flex w-full flex-1 items-end justify-center gap-[3px]">
              <div
                className={`w-full max-w-3 rounded-t bg-fl-success transition-opacity ${i === iAtivo ? "" : "opacity-70"}`}
                style={{ height: `${Math.max((m.receita / max) * 100, m.receita > 0 ? 2 : 0)}%` }}
              />
              <div
                className={`w-full max-w-3 rounded-t bg-fl-error transition-opacity ${i === iAtivo ? "" : "opacity-70"}`}
                style={{ height: `${Math.max((m.despesa / max) * 100, m.despesa > 0 ? 2 : 0)}%` }}
              />
            </div>
            <span
              className={`flex items-center gap-0.5 text-[10.5px] ${
                i === iAtivo ? "font-semibold text-fl-ink-2" : "text-fl-ink-3"
              }`}
            >
              {m.rotulo}
              {m.deficitario && <span className="text-fl-error">▾</span>}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-4 text-[11px] text-fl-ink-2">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-fl-success" /> Entradas</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-fl-error" /> Saídas</span>
        {/* só explica o marcador quando ele existe no gráfico */}
        {meses.some((m) => m.deficitario) && (
          <span className="flex items-center gap-1"><span className="text-fl-error">▾</span> deficitário</span>
        )}
      </div>
    </div>
  )
}
