"use client"

import Link from "next/link"
import { ArrowRight, BellRing, ChevronRight, Compass, Lightbulb } from "lucide-react"
import type { CardIA as CardIATipo } from "@/lib/ia"
import { brl } from "@/lib/formato"

// Cards que a IA pode intercalar na conversa. A UI já sabe desenhar os 4 tipos —
// a integração de IA só precisa devolvê-los no formato do contrato (lib/ia.ts).
export function CardIA({ card }: { card: CardIATipo }) {
  if (card.tipo === "resumo") {
    return (
      <div className="rounded-2xl border border-fl-border bg-fl-card p-4">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-fl-ink-2">
          {card.titulo}
        </div>
        <ul className="flex flex-col gap-2">
          {card.itens.map((i) => (
            <li key={i.rotulo} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-fl-ink-2">{i.rotulo}</span>
              <span className="font-bold tabular-nums text-fl-ink">{i.valor}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (card.tipo === "grafico") {
    const max = Math.max(...card.barras.map((b) => Math.abs(b.valor)), 1)
    return (
      <div className="rounded-2xl border border-fl-border bg-fl-card p-4">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-fl-ink-2">
          {card.titulo}
        </div>
        <div className="flex flex-col gap-2">
          {card.barras.map((b) => (
            <div key={b.rotulo} className="flex items-center gap-2.5 text-xs">
              <span className="w-20 shrink-0 truncate text-fl-ink-2">{b.rotulo}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-fl-divider">
                <div
                  className="h-full rounded-full bg-fl-500"
                  style={{ width: `${(Math.abs(b.valor) / max) * 100}%` }}
                />
              </div>
              <span className="w-20 shrink-0 text-right font-semibold tabular-nums text-fl-ink">
                {brl(b.valor)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (card.tipo === "recomendacao") {
    return (
      <div className="rounded-2xl border border-fl-500/30 bg-fl-50 p-4">
        <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-fl-500">
          <Lightbulb className="size-3.5" /> {card.titulo}
        </div>
        <p className="text-sm leading-relaxed text-fl-ink">{card.texto}</p>
        {card.moduloSlug && (
          <Link
            href={`/trilha/${card.moduloSlug}`}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-fl-500"
          >
            Abrir módulo <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
    )
  }

  /**
   * Caminho: o atalho para uma tela, com os toques à vista.
   *
   * Os passos aparecem mesmo com o botão ao lado, de propósito. Tocar resolve
   * agora; ler o caminho ensina onde fica — e da segunda vez a pessoa vai
   * sozinha, sem precisar perguntar ao assistente de novo.
   */
  if (card.tipo === "caminho") {
    return (
      <Link
        href={card.href}
        className="block rounded-2xl border border-fl-border bg-fl-card p-4 transition-colors hover:border-fl-500/40 hover:bg-fl-50"
      >
        <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-fl-ink-2">
          <Compass className="size-3.5" /> {card.titulo}
        </div>
        <p className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-sm text-fl-ink">
          {card.passos.map((passo, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              {i > 0 && <ChevronRight className="size-3.5 text-fl-ink-3" />}
              <span className={i === card.passos.length - 1 ? "font-semibold" : undefined}>{passo}</span>
            </span>
          ))}
        </p>
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-fl-500">
          Ir agora <ArrowRight className="size-4" />
        </span>
      </Link>
    )
  }

  // lembrete
  return (
    <div className="rounded-2xl border border-fl-accent/30 bg-fl-accent-light/40 p-4">
      <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-fl-accent-dark">
        <BellRing className="size-3.5" /> {card.titulo}
      </div>
      <p className="text-sm leading-relaxed text-fl-ink">{card.texto}</p>
      {card.quando && <p className="mt-1.5 text-xs text-fl-ink-2">{card.quando}</p>}
    </div>
  )
}
