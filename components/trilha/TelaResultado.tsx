"use client"

import type { ConteudoResultado, SessaoFluxo } from "@/types/trilha"
import { calcular, interpolar, avaliarFaixa } from "@/lib/resultado"

const corClasses = {
  green: { border: "border-[#5FA7A9]/30", bg: "bg-[#5FA7A9]/10", text: "text-[#5FA7A9]", badge: "bg-[#5FA7A9]/20 text-[#5FA7A9]" },
  yellow: { border: "border-[#D3A75C]/30", bg: "bg-[#D3A75C]/10", text: "text-[#D3A75C]", badge: "bg-[#D3A75C]/20 text-[#D3A75C]" },
  red: { border: "border-[#D08277]/30", bg: "bg-[#D08277]/10", text: "text-[#D08277]", badge: "bg-[#D08277]/20 text-[#D08277]" },
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
        <div className="rounded-2xl border border-[#1B3B3C] bg-[#1B3B3C] p-4">
          <p className="text-sm leading-relaxed text-[#A7ADAF]">{insight}</p>
        </div>
      )}
    </div>
  )
}
