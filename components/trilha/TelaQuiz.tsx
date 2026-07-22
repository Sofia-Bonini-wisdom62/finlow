"use client"

import { Check, X } from "lucide-react"
import type { ConteudoQuiz, OpcaoQuiz } from "@/types/trilha"

interface Props {
  conteudo: ConteudoQuiz
  // letra escolhida (estado vive no CardFlow — sobrevive ao voltar/avançar)
  selecionada: string | null
  onSelecionar: (letra: string) => void
}

export function TelaQuiz({ conteudo, selecionada, onSelecionar }: Props) {
  function selecionar(opcao: OpcaoQuiz) {
    if (selecionada !== null) return
    onSelecionar(opcao.letra)
  }

  const opcaoSelecionada = conteudo.opcoes.find((o) => o.letra === selecionada)

  return (
    <div className="card-enter flex h-full flex-col justify-center gap-6 px-6 py-8">
      <h2 className="text-2xl font-bold leading-snug text-white">{conteudo.headline}</h2>

      <div className="flex flex-col gap-3">
        {conteudo.opcoes.map((opcao) => {
          const isSelected = selecionada === opcao.letra
          const isResponded = selecionada !== null
          const isCorreta = opcao.correta

          let borderColor = "border-[#1A2B3C]"
          let bgColor = "bg-[#1A2B3C]"
          let textColor = "text-white"

          if (isResponded) {
            if (isCorreta) {
              borderColor = "border-[#00C896]"
              bgColor = "bg-[#00C896]/10"
            } else if (isSelected && !isCorreta) {
              borderColor = "border-[#F87171]"
              bgColor = "bg-[#F87171]/10"
              textColor = "text-[#F87171]"
            } else {
              textColor = "text-[#A0AEC0]"
            }
          }

          return (
            <button
              key={opcao.letra}
              onClick={() => selecionar(opcao)}
              disabled={isResponded}
              className={`flex items-start gap-3 rounded-2xl border ${borderColor} ${bgColor} p-4 text-left transition-all duration-200 disabled:cursor-default`}
            >
              <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border ${borderColor} text-xs font-bold ${textColor}`}>
                {isResponded && isCorreta ? (
                  <Check className="size-4 text-[#00C896]" aria-label="Correta" />
                ) : isResponded && isSelected && !isCorreta ? (
                  <X className="size-4 text-[#F87171]" aria-label="Incorreta" />
                ) : (
                  opcao.letra
                )}
              </span>
              <span className={`text-sm leading-relaxed ${textColor}`}>{opcao.texto}</span>
            </button>
          )
        })}
      </div>

      {opcaoSelecionada && (
        <div className={`rounded-2xl p-4 ${opcaoSelecionada.correta ? "bg-[#00C896]/10 border border-[#00C896]/30" : "bg-[#F87171]/10 border border-[#F87171]/30"}`}>
          <p className="text-sm leading-relaxed text-[#A0AEC0]">{opcaoSelecionada.feedback}</p>
        </div>
      )}
    </div>
  )
}
