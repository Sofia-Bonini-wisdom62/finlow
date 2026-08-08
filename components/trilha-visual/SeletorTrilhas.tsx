"use client"

import { Compass } from "lucide-react"
import type { TrilhaResumo } from "@/lib/trilha-visual"

interface SeletorTrilhasProps {
  trilhas: TrilhaResumo[]
  ativa: string
  onSelecionar: (id: string) => void
  onExplorar: () => void
}

function AnelProgresso({ percentual }: { percentual: number }) {
  const raio = 8
  const circ = 2 * Math.PI * raio
  const dash = (percentual / 100) * circ
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" aria-hidden="true">
      <circle
        cx="10"
        cy="10"
        r={raio}
        fill="none"
        strokeWidth="2.5"
        style={{ stroke: "var(--finlow-surface-2)" }}
      />
      <circle
        cx="10"
        cy="10"
        r={raio}
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 10 10)"
        style={{ stroke: "var(--finlow-accent)" }}
      />
    </svg>
  )
}

export default function SeletorTrilhas({
  trilhas,
  ativa,
  onSelecionar,
  onExplorar,
}: SeletorTrilhasProps) {
  return (
    <div
      className="relative"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)",
      }}
    >
      <div className="finlow-no-scrollbar flex gap-2 overflow-x-auto px-4 py-1">
        {trilhas.map((t) => {
          const isAtiva = t.id === ativa
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelecionar(t.id)}
              aria-pressed={isAtiva}
              className="flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: isAtiva
                  ? "var(--finlow-surface-2)"
                  : "transparent",
                border: `1px solid ${
                  isAtiva ? "var(--finlow-accent)" : "var(--finlow-surface-2)"
                }`,
                color: "var(--finlow-text)",
              }}
            >
              <AnelProgresso percentual={t.percentual} />
              <span>{t.nome}</span>
              <span
                className="tabular-nums"
                style={{ color: "var(--finlow-muted)" }}
              >
                {t.percentual}%
              </span>
              {t.novo && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{
                    backgroundColor: "var(--finlow-accent)",
                    color: "var(--finlow-bg)",
                  }}
                >
                  Novo
                </span>
              )}
            </button>
          )
        })}

        <button
          type="button"
          onClick={onExplorar}
          className="flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium"
          style={{
            border: "1px dashed var(--finlow-surface-2)",
            color: "var(--finlow-muted)",
          }}
        >
          <Compass size={16} aria-hidden="true" />
          Explorar
        </button>
      </div>
    </div>
  )
}
