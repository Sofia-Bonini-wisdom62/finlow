"use client"

import { Check, X } from "lucide-react"
import { POSE } from "@/lib/fin"
import type { ConteudoItem, RespostaItem } from "@/types/licao-item"

interface Props {
  conteudo: Extract<ConteudoItem, { formato: "binaria" }>
  resposta: RespostaItem | undefined
  onResponder: (r: RespostaItem) => void
}

/**
 * Card binário: um critério fixo no topo ("Isso é hoje?"), um enunciado, e
 * Sim/Não. O par criterio+enunciado é o que muda de um item pro outro dentro
 * da mesma lição — o critério ancora a pergunta, o enunciado é o caso a
 * julgar.
 */
export function ItemBinaria({ conteudo, resposta, onResponder }: Props) {
  const respondida = resposta?.formato === "binaria"
  const escolha = respondida ? resposta.valor : null
  const acertou = respondida && escolha === conteudo.resposta

  function escolher(valor: boolean) {
    if (respondida) return
    onResponder({ formato: "binaria", valor })
  }

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

      <div className="grid grid-cols-2 gap-3">
        {([true, false] as const).map((valor) => {
          const selecionada = respondida && escolha === valor
          const eCorreta = valor === conteudo.resposta
          let borderColor = "border-[var(--fin-border-2)]"
          let bgColor = "bg-[var(--fin-surface)]"
          let textColor = "text-white"
          if (respondida) {
            if (eCorreta) {
              borderColor = "border-[var(--fin-acerto)]"
              bgColor = "bg-[var(--fin-acerto)]/10"
            } else if (selecionada) {
              borderColor = "border-[var(--fin-erro)]"
              bgColor = "bg-[var(--fin-erro)]/10"
              textColor = "text-[var(--fin-erro)]"
            } else {
              textColor = "text-[var(--fin-muted)]"
            }
          }
          return (
            <button
              key={String(valor)}
              onClick={() => escolher(valor)}
              disabled={respondida}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 ${borderColor} ${bgColor} py-6 transition-all duration-200 disabled:cursor-default`}
            >
              {respondida && eCorreta ? (
                <Check className="size-6 text-[var(--fin-acerto)]" />
              ) : respondida && selecionada ? (
                <X className="size-6 text-[var(--fin-erro)]" />
              ) : null}
              <span className={`text-lg font-black ${textColor}`}>{valor ? "Sim" : "Não"}</span>
            </button>
          )
        })}
      </div>

      {respondida && (
        <div className="fin-slide-up flex items-end gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={acertou ? POSE.cheer : POSE.worried} alt="" className="fin-pop size-[72px] shrink-0 object-contain" />
          <div
            className="flex-1 rounded-2xl rounded-bl-sm border px-3.5 py-3"
            style={{
              background: "var(--fin-surface)",
              borderColor: acertou ? "var(--fin-acerto)" : "var(--fin-erro)",
            }}
          >
            <div
              className="text-[11px] font-black uppercase tracking-wide"
              style={{ color: acertou ? "var(--fin-acerto)" : "var(--fin-erro)" }}
            >
              {acertou ? "Boa!" : "Quase lá"}
            </div>
            <p className="mt-0.5 text-sm leading-relaxed" style={{ color: "var(--fin-text)" }}>
              {acertou ? conteudo.ancora : conteudo.feedbackErro}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
