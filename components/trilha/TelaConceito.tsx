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
        className="rich-text text-base leading-relaxed text-[#A7ADAF]"
        dangerouslySetInnerHTML={{ __html: conteudo.corpo }}
      />
      {conteudo.insight && (
        <div className="rounded-2xl border border-[#5FA7A9]/30 bg-[#5FA7A9]/10 p-4">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5FA7A9]">
            {conteudo.insight.label}
          </span>
          <p
            className="rich-text text-sm leading-relaxed text-[#A7ADAF]"
            dangerouslySetInnerHTML={{ __html: conteudo.insight.texto }}
          />
        </div>
      )}
    </div>
  )
}
