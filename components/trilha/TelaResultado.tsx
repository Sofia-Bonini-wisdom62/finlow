"use client"

import type { ConteudoResultado, SessaoFluxo } from "@/types/trilha"
import { calcular, interpolar, avaliarFaixa } from "@/lib/resultado"

const corClasses = {
  green: { border: "border-[#00C896]/30", bg: "bg-[#00C896]/10", text: "text-[#00C896]", badge: "bg-[#00C896]/20 text-[#00C896]" },
  yellow: { border: "border-[#F5A623]/30", bg: "bg-[#F5A623]/10", text: "text-[#F5A623]", badge: "bg-[#F5A623]/20 text-[#F5A623]" },
  red: { border: "border-[#F87171]/30", bg: "bg-[#F87171]/10", text: "text-[#F87171]", badge: "bg-[#F87171]/20 text-[#F87171]" },
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
          <p className={`text-sm leading-relaxed ${cores.text}`}>{faixa.mensagem}</p>
        </div>
      )}

      {insight && insight.trim().length > 0 && (
        <div className="rounded-2xl border border-[#1A2B3C] bg-[#1A2B3C] p-4">
          <p className="text-sm leading-relaxed text-[#A0AEC0]">{insight}</p>
        </div>
      )}
    </div>
  )
}
