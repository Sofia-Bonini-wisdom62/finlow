"use client"

import type { ConteudoConceito } from "@/types/trilha"

export function TelaConceito({ conteudo }: { conteudo: ConteudoConceito }) {
  return (
    <div className="card-enter flex h-full flex-col justify-center gap-6 px-6 py-8">
      <h2
        className="rich-text text-2xl font-bold leading-snug text-white"
        dangerouslySetInnerHTML={{ __html: conteudo.headline }}
      />
      <p
        className="rich-text text-base leading-relaxed text-[var(--fin-muted)]"
        dangerouslySetInnerHTML={{ __html: conteudo.corpo }}
      />
      {conteudo.insight && (
        <div className="rounded-2xl border border-[var(--fin-accent)]/30 bg-[var(--fin-accent)]/10 p-4">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--fin-accent)]">
            {conteudo.insight.label}
          </span>
          <p
            className="rich-text text-sm leading-relaxed text-[var(--fin-muted)]"
            dangerouslySetInnerHTML={{ __html: conteudo.insight.texto }}
          />
        </div>
      )}
    </div>
  )
}
