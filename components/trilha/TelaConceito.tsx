"use client"

import type { ConteudoConceito } from "@/types/trilha"

export function TelaConceito({ conteudo }: { conteudo: ConteudoConceito }) {
  return (
    <div className="card-enter flex h-full flex-col justify-center gap-6 px-6 py-8">
      <h2
        className="text-2xl font-bold leading-snug text-white"
        dangerouslySetInnerHTML={{ __html: conteudo.headline }}
      />
      <p className="text-base leading-relaxed text-[#A0AEC0]">{conteudo.corpo}</p>
      {conteudo.insight && (
        <div className="rounded-2xl border border-[#00C896]/30 bg-[#00C896]/10 p-4">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#00C896]">
            {conteudo.insight.label}
          </span>
          <p className="text-sm leading-relaxed text-[#A0AEC0]">{conteudo.insight.texto}</p>
        </div>
      )}
    </div>
  )
}
