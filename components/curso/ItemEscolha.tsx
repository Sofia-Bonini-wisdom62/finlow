"use client"

import { Check, X } from "lucide-react"
import type { ConteudoItem, RespostaItem } from "@/types/curso"
import { Feedback, estiloOpcao } from "./Feedback"

interface Props {
  conteudo: Extract<ConteudoItem, { formato: "escolha3" | "fecho" }>
  resposta: RespostaItem | undefined
  onResponder: (r: RespostaItem) => void
}

/**
 * Escolha de 3, com feedback POR ALTERNATIVA: cada distrator errado explica
 * o que acerta, onde falha e o critério que resolve (§3). O `fecho` usa o
 * mesmo componente: é uma escolha3 em que a alternativa certa é a frase que
 * resume a lição (§3, "fecho ativo") — a pessoa escolhe o resumo em vez de
 * ler o resumo.
 *
 * Sem embaralhar: nenhum enunciado se repete entre os três encontros (o
 * validador barra), então não há "memória de posição" de que se defender.
 */
export function ItemEscolha({ conteudo, resposta, onResponder }: Props) {
  const respondida = resposta?.formato === "escolha3" || resposta?.formato === "fecho"
  const indice = respondida ? resposta.indice : null
  const escolhida = indice !== null ? conteudo.alternativas[indice] : null
  const fecho = conteudo.formato === "fecho"

  return (
    <div className="card-enter flex h-full flex-col justify-center gap-6 overflow-y-auto px-6 py-8">
      <div>
        {fecho && (
          <div
            className="mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide"
            style={{ background: "var(--fin-surface)", color: "var(--fin-accent)" }}
          >
            Pra fechar
          </div>
        )}
        <h2 className="text-2xl font-bold leading-snug text-white">{conteudo.pergunta}</h2>
      </div>

      <div className="flex flex-col gap-3" role="group" aria-label="Alternativas">
        {conteudo.alternativas.map((alt, i) => {
          const s = estiloOpcao(respondida, alt.correta, indice === i)
          return (
            <button
              key={i}
              type="button"
              onClick={() => !respondida && onResponder({ formato: conteudo.formato, indice: i })}
              disabled={respondida}
              aria-pressed={indice === i}
              className={`flex min-h-11 items-start gap-3 rounded-2xl border-2 ${s.borda} ${s.fundo} p-4 text-left transition-colors disabled:cursor-default`}
            >
              <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border ${s.borda} text-xs font-bold ${s.texto}`}>
                {respondida && alt.correta ? (
                  <Check className="size-4 text-[var(--fin-acerto)]" aria-label="Correta" />
                ) : respondida && indice === i ? (
                  <X className="size-4 text-[var(--fin-erro)]" aria-label="Incorreta" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span className={`text-sm leading-relaxed ${s.texto}`}>{alt.texto}</span>
            </button>
          )
        })}
      </div>

      {escolhida && (
        <Feedback
          acertou={escolhida.correta}
          texto={
            escolhida.correta
              ? (conteudo.ancora ?? (fecho ? "Essa frase fica com você." : "Isso mesmo."))
              : (escolhida.feedbackErro ?? "Não é essa.")
          }
        />
      )}
    </div>
  )
}
