"use client"

import type { ConteudoResultado, SessaoFluxo } from "@/types/trilha"
import { calcular, interpolar, avaliarFaixa } from "@/lib/resultado"

const corClasses = {
  green: { border: "border-[var(--fin-acerto)]/30", bg: "bg-[var(--fin-acerto)]/10", text: "text-[var(--fin-acerto)]", badge: "bg-[var(--fin-acerto)]/20 text-[var(--fin-acerto)]" },
  yellow: { border: "border-[var(--fin-accent)]/30", bg: "bg-[var(--fin-accent)]/10", text: "text-[var(--fin-accent)]", badge: "bg-[var(--fin-accent)]/20 text-[var(--fin-accent)]" },
  red: { border: "border-[var(--fin-erro)]/30", bg: "bg-[var(--fin-erro)]/10", text: "text-[var(--fin-erro)]", badge: "bg-[var(--fin-erro)]/20 text-[var(--fin-erro)]" },
}

interface Props {
  conteudo: ConteudoResultado
  sessao: SessaoFluxo
}

export function TelaResultado({ conteudo, sessao }: Props) {
  const d = calcular(conteudo.formula, sessao)
  const headline = interpolar(conteudo.headline, d, sessao)
  const faixa = conteudo.faixas ? avaliarFaixa(conteudo.faixas, d) : undefined
  const insight = conteudo.insightDinamico ? interpolar(conteudo.insightDinamico, d, sessao) : undefined
  const cores = faixa ? corClasses[faixa.cor] : corClasses.green

  return (
    <div className="card-enter flex h-full flex-col justify-center gap-6 px-6 py-8">
      <h2
        className="rich-text text-2xl font-bold leading-snug text-white"
        dangerouslySetInnerHTML={{ __html: headline }}
      />

      {faixa && (
        <div className={`rounded-2xl border ${cores.border} ${cores.bg} p-4`}>
          <p className={`text-sm leading-relaxed ${cores.text}`}>{interpolar(faixa.mensagem, d, sessao)}</p>
        </div>
      )}

      {insight && insight.trim().length > 0 && (
        <div className="rounded-2xl border border-[var(--fin-surface)] bg-[var(--fin-surface)] p-4">
          <p className="text-sm leading-relaxed text-[var(--fin-muted)]">{insight}</p>
        </div>
      )}
    </div>
  )
}
