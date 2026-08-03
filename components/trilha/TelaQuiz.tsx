"use client"

import { useMemo } from "react"
import { Check, X } from "lucide-react"
import { embaralharPorSemente } from "@/lib/embaralhar"
import type { ConteudoQuiz, OpcaoQuiz } from "@/types/trilha"

interface Props {
  conteudo: ConteudoQuiz
  // letra escolhida (estado vive no CardFlow — sobrevive ao voltar/avançar)
  selecionada: string | null
  onSelecionar: (letra: string) => void
}

/**
 * A ordem das opções é embaralhada NA EXIBIÇÃO, não nos dados.
 *
 * Motivo: no conteúdo gravado, metade das corretas estava na primeira posição
 * — quem clicasse sempre na primeira acertaria sem ler. Reescrever 60 quizzes
 * à mão só rebalancearia a foto de hoje; o próximo módulo escrito
 * desbalancearia de novo. Embaralhar ao exibir resolve para sempre, inclusive
 * para conteúdo antigo.
 *
 * O embaralho é DETERMINÍSTICO por pergunta (semente = headline): a mesma
 * pessoa vê a mesma ordem ao voltar de tela, e ordens diferentes entre
 * perguntas. A letra exibida é a da POSIÇÃO; a `letra` original vira só
 * identidade interna, que é o que o servidor confere ao dar os pontos.
 */
export function TelaQuiz({ conteudo, selecionada, onSelecionar }: Props) {
  const opcoes = useMemo(
    () => embaralharPorSemente(conteudo.opcoes, conteudo.headline),
    [conteudo]
  )

  function selecionar(opcao: OpcaoQuiz) {
    if (selecionada !== null) return
    onSelecionar(opcao.letra)
  }

  const opcaoSelecionada = conteudo.opcoes.find((o) => o.letra === selecionada)

  return (
    <div className="card-enter flex h-full flex-col justify-center gap-6 px-6 py-8">
      <h2 className="text-2xl font-bold leading-snug text-white">{conteudo.headline}</h2>

      <div className="flex flex-col gap-3">
        {opcoes.map((opcao, indice) => {
          const isSelected = selecionada === opcao.letra
          const isResponded = selecionada !== null
          const isCorreta = opcao.correta

          let borderColor = "border-[#1B3B3C]"
          let bgColor = "bg-[#1B3B3C]"
          let textColor = "text-white"

          if (isResponded) {
            if (isCorreta) {
              borderColor = "border-[#5FA7A9]"
              bgColor = "bg-[#5FA7A9]/10"
            } else if (isSelected && !isCorreta) {
              borderColor = "border-[#D08277]"
              bgColor = "bg-[#D08277]/10"
              textColor = "text-[#D08277]"
            } else {
              textColor = "text-[#A7ADAF]"
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
                  <Check className="size-4 text-[#5FA7A9]" aria-label="Correta" />
                ) : isResponded && isSelected && !isCorreta ? (
                  <X className="size-4 text-[#D08277]" aria-label="Incorreta" />
                ) : (
                  // Letra da POSIÇÃO exibida, não a dos dados: depois do
                  // embaralho, a letra gravada deixa de corresponder à ordem.
                  String.fromCharCode(65 + indice)
                )}
              </span>
              <span className={`text-sm leading-relaxed ${textColor}`}>{opcao.texto}</span>
            </button>
          )
        })}
      </div>

      {opcaoSelecionada && (
        <div className={`rounded-2xl p-4 ${opcaoSelecionada.correta ? "bg-[#5FA7A9]/10 border border-[#5FA7A9]/30" : "bg-[#D08277]/10 border border-[#D08277]/30"}`}>
          <p className="text-sm leading-relaxed text-[#A7ADAF]">{opcaoSelecionada.feedback}</p>
        </div>
      )}
    </div>
  )
}
