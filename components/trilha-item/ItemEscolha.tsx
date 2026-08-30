"use client"

import { Check, X } from "lucide-react"
import { POSE } from "@/lib/fin"
import type { ConteudoItem, RespostaItem } from "@/types/licao-item"

interface Props {
  conteudo: Extract<ConteudoItem, { formato: "escolha3" | "fecho" }>
  resposta: RespostaItem | undefined
  onResponder: (r: RespostaItem) => void
}

/**
 * Escolha de 3 — e o `fecho` da lição usa o MESMO componente, porque o
 * contrato é idêntico (`prisma/seeds/AGENTE.md`): 3 alternativas, 1 certa,
 * feedback nas 2 erradas. `fecho` é só a última pergunta da lição, não um
 * formato visual diferente.
 *
 * Sem embaralhar as alternativas de propósito: ao contrário do quiz antigo,
 * a mesma pergunta não aparece duas vezes na trilha nova (3 encontros nunca
 * repetem enunciado — `lib/licao/validar.ts` barra isso), então não existe
 * "memória de posição" para se defender.
 */
export function ItemEscolha({ conteudo, resposta, onResponder }: Props) {
  const respondida = resposta?.formato === "escolha3" || resposta?.formato === "fecho"
  const indiceEscolhido = respondida ? resposta.indice : null
  const alternativaEscolhida = indiceEscolhido !== null ? conteudo.alternativas[indiceEscolhido] : null

  function escolher(indice: number) {
    if (respondida) return
    onResponder({ formato: conteudo.formato, indice })
  }

  return (
    <div className="card-enter flex h-full flex-col justify-center gap-6 overflow-y-auto px-6 py-8">
      <h2 className="text-2xl font-bold leading-snug text-white">{conteudo.pergunta}</h2>

      <div className="flex flex-col gap-3">
        {conteudo.alternativas.map((alt, i) => {
          const selecionada = indiceEscolhido === i
          let borderColor = "border-[var(--fin-border-2)]"
          let bgColor = "bg-[var(--fin-surface)]"
          let textColor = "text-white"
          if (respondida) {
            if (alt.correta) {
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
              key={i}
              onClick={() => escolher(i)}
              disabled={respondida}
              className={`flex items-start gap-3 rounded-2xl border-2 ${borderColor} ${bgColor} p-4 text-left transition-all duration-200 disabled:cursor-default`}
            >
              <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border ${borderColor} text-xs font-bold ${textColor}`}>
                {respondida && alt.correta ? (
                  <Check className="size-4 text-[var(--fin-acerto)]" />
                ) : respondida && selecionada ? (
                  <X className="size-4 text-[var(--fin-erro)]" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span className={`text-sm leading-relaxed ${textColor}`}>{alt.texto}</span>
            </button>
          )
        })}
      </div>

      {alternativaEscolhida && (
        <div className="fin-slide-up flex items-end gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={alternativaEscolhida.correta ? POSE.cheer : POSE.worried}
            alt=""
            className="fin-pop size-[72px] shrink-0 object-contain"
          />
          <div
            className="flex-1 rounded-2xl rounded-bl-sm border px-3.5 py-3"
            style={{
              background: "var(--fin-surface)",
              borderColor: alternativaEscolhida.correta ? "var(--fin-acerto)" : "var(--fin-erro)",
            }}
          >
            <div
              className="text-[11px] font-black uppercase tracking-wide"
              style={{ color: alternativaEscolhida.correta ? "var(--fin-acerto)" : "var(--fin-erro)" }}
            >
              {alternativaEscolhida.correta ? "Boa!" : "Quase lá"}
            </div>
            <p className="mt-0.5 text-sm leading-relaxed" style={{ color: "var(--fin-text)" }}>
              {alternativaEscolhida.correta ? (conteudo.ancora ?? "Isso mesmo.") : alternativaEscolhida.feedbackErro}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
