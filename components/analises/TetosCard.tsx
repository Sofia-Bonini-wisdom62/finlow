"use client"

import { useState } from "react"
import { Target, Trash2 } from "lucide-react"
import { brl } from "@/lib/formato"
import type { OrcamentoComGasto } from "@/lib/orcamento-repo"

/**
 * Como estão os tetos do mês.
 *
 * TOM
 * A barra passa de 100% quando estoura, e não trava em cheio: esconder o
 * tamanho do estouro tira justamente a informação que importa naquela hora.
 * Mas o texto não repreende — "passou R$ 80" é fato, "você estourou de novo" é
 * sermão, e sermão faz a pessoa parar de abrir o app.
 *
 * O estouro não vira vermelho de erro. Vermelho é para coisa quebrada; gastar
 * mais do que planejou é coisa que acontece, e às vezes o teto é que estava
 * errado.
 */
export function TetosCard({
  tetos,
  onMudou,
}: {
  tetos: OrcamentoComGasto[]
  onMudou?: () => void
}) {
  const [apagando, setApagando] = useState<string | null>(null)

  if (tetos.length === 0) return null

  async function apagar(id: string) {
    setApagando(id)
    await fetch(`/api/orcamento?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {})
    setApagando(null)
    onMudou?.()
  }

  return (
    <section className="rounded-[20px] border border-fl-border bg-fl-card p-5">
      <h2 className="flex items-center gap-2 text-[15px] font-bold text-fl-ink">
        <Target className="size-4 text-fl-500" /> Seus tetos
      </h2>
      <p className="mt-0.5 text-xs text-fl-ink-2">Quanto você planejou gastar, e onde está</p>

      <ul className="mt-4 flex flex-col gap-3.5">
        {tetos.map((t) => {
          const passou = t.restante < 0
          const largura = Math.min(t.pct, 100)
          return (
            <li key={t.id}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="min-w-0 truncate text-[13.5px] font-medium text-fl-ink">{t.nome}</span>
                <span className="shrink-0 text-[12.5px] tabular-nums text-fl-ink-2">
                  {brl(t.gasto)} <span className="text-fl-ink-3">de {brl(t.limite)}</span>
                </span>
              </div>

              <div className="mt-1.5 flex items-center gap-2">
                <div
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-fl-divider"
                  role="progressbar"
                  aria-valuenow={t.pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${t.nome}: ${t.pct}% do teto`}
                >
                  <div
                    className={`h-full rounded-full transition-[width] ${passou ? "bg-fl-accent" : "bg-fl-500"}`}
                    style={{ width: `${largura}%` }}
                  />
                </div>
                <button
                  onClick={() => apagar(t.id)}
                  disabled={apagando === t.id}
                  aria-label={`Apagar o teto de ${t.nome}`}
                  className="shrink-0 text-fl-ink-3 transition-colors hover:text-fl-error disabled:opacity-40"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>

              <p className="mt-1 text-[11.5px] text-fl-ink-3">
                {passou
                  ? `passou ${brl(-t.restante)} do que você planejou`
                  : `restam ${brl(t.restante)} para o mês`}
              </p>
            </li>
          )
        })}
      </ul>

      <p className="mt-4 border-t border-fl-divider pt-3 text-[11.5px] leading-snug text-fl-ink-3">
        Teto é régua para enxergar, não prova para passar. Se um deles vive estourando, pode ser que ele
        esteja errado, pede pro assistente refazer.
      </p>
    </section>
  )
}
