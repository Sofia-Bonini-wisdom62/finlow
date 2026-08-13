"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { EstadoMissao } from "@/lib/missoes"

/**
 * As missões do dia, com resgate. O botão é convite: quem reconfere a
 * condição e paga (uma vez, pela unique do ledger) é o servidor.
 */
export function MissoesFin({ missoes }: { missoes: EstadoMissao[] }) {
  const router = useRouter()
  const [ocupada, setOcupada] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function resgatar(missaoId: string) {
    setOcupada(missaoId)
    setErro(null)
    try {
      const r = await fetch("/api/jogo/missao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missaoId }),
      })
      const d = await r.json()
      if (!r.ok || !d.ok) {
        setErro(d.erro ?? "Não deu certo. Tenta de novo?")
      } else {
        router.refresh()
      }
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    }
    setOcupada(null)
  }

  return (
    <div className="flex flex-col gap-2.5">
      {missoes.map((m) => (
        <div
          key={m.id}
          className="flex items-center gap-3 rounded-2xl px-3.5 py-3"
          style={{ background: "var(--fin-surface)" }}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-[13.5px] font-extrabold" style={{ color: "var(--fin-text)" }}>
                {m.titulo}
              </span>
              <span className="text-[11px] font-bold tabular-nums" style={{ color: "var(--fin-dim)" }}>
                {m.progresso}/{m.meta}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--fin-border)" }}>
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{
                  width: `${Math.round((m.progresso / m.meta) * 100)}%`,
                  background: m.completa ? "var(--fin-acerto)" : "var(--fin-accent)",
                }}
              />
            </div>
          </div>

          {m.resgatada ? (
            <span className="shrink-0 text-xs font-black" style={{ color: "var(--fin-acerto)" }}>
              Resgatada ✓
            </span>
          ) : m.completa ? (
            <button
              onClick={() => resgatar(m.id)}
              disabled={ocupada === m.id}
              className="fin-wob fin-btn-3d shrink-0 rounded-xl px-3 py-2 text-xs font-black disabled:opacity-60"
              style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
            >
              +{m.coins} coins
            </button>
          ) : (
            <span className="shrink-0 text-xs font-black tabular-nums" style={{ color: "var(--fin-dim)" }}>
              +{m.coins}
            </span>
          )}
        </div>
      ))}
      {erro && <p className="text-sm" style={{ color: "var(--fin-erro)" }}>{erro}</p>}
    </div>
  )
}
