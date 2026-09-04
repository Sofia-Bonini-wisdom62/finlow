"use client"

import { Check, X } from "lucide-react"
import type { ConteudoItem, RespostaItem } from "@/types/curso"
import { Feedback, estiloOpcao } from "./Feedback"

interface Props {
  conteudo: Extract<ConteudoItem, { formato: "binaria" }>
  resposta: RespostaItem | undefined
  onResponder: (r: RespostaItem) => void
}

/** Dois botões grandes, 1 toque (§4). O critério fica fixo no topo; o
 *  enunciado é o caso a julgar. Alvo mínimo de 44px em cada botão. */
export function ItemBinaria({ conteudo, resposta, onResponder }: Props) {
  const respondida = resposta?.formato === "binaria"
  const escolha = respondida ? resposta.valor : null
  const acertou = respondida && escolha === conteudo.resposta

  return (
    <div className="card-enter flex h-full flex-col justify-center gap-6 overflow-y-auto px-6 py-8">
      <div>
        <div
          className="mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide"
          style={{ background: "var(--fin-surface)", color: "var(--fin-accent)" }}
        >
          {conteudo.criterio}
        </div>
        <h2 className="text-2xl font-bold leading-snug text-white">{conteudo.enunciado}</h2>
      </div>

      <div className="grid grid-cols-2 gap-3" role="group" aria-label={conteudo.criterio}>
        {([true, false] as const).map((valor) => {
          const s = estiloOpcao(respondida, valor === conteudo.resposta, escolha === valor)
          return (
            <button
              key={String(valor)}
              type="button"
              onClick={() => !respondida && onResponder({ formato: "binaria", valor })}
              disabled={respondida}
              aria-pressed={escolha === valor}
              className={`flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-2xl border-2 ${s.borda} ${s.fundo} py-5 transition-colors disabled:cursor-default`}
            >
              {respondida && valor === conteudo.resposta ? (
                <Check className="size-6 text-[var(--fin-acerto)]" aria-hidden="true" />
              ) : respondida && escolha === valor ? (
                <X className="size-6 text-[var(--fin-erro)]" aria-hidden="true" />
              ) : null}
              <span className={`text-lg font-black ${s.texto}`}>{valor ? "Sim" : "Não"}</span>
            </button>
          )
        })}
      </div>

      {respondida && <Feedback acertou={acertou} texto={acertou ? conteudo.ancora : conteudo.feedbackErro} />}
    </div>
  )
}
