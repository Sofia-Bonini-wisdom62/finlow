"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { POSE } from "@/lib/fin"
import { embaralharPorSemente } from "@/lib/embaralhar"
import type { ConteudoItem, RespostaItem } from "@/types/licao-item"

interface Props {
  conteudo: Extract<ConteudoItem, { formato: "ordenar" }>
  resposta: RespostaItem | undefined
  onResponder: (r: RespostaItem) => void
}

/**
 * Ordenar por toque: sem drag, a pessoa toca os itens na ordem que acha
 * certa. `ordem[posição] = índice ORIGINAL do item` — o mesmo contrato que
 * `lib/licao-item/grading.ts::corrigirItem` espera.
 *
 * A lista de disponíveis embaralha DETERMINISTICAMENTE (semente = instrução)
 * — mesmo princípio de `ordemDoQuiz`: mostrar sempre fora de ordem, sem
 * depender de o conteúdo já vir bagunçado.
 */
export function ItemOrdenar({ conteudo, resposta, onResponder }: Props) {
  const respondida = resposta?.formato === "ordenar"
  const [escolhidos, setEscolhidos] = useState<number[]>([])

  const comIndice = conteudo.itens.map((item, i) => ({ item, i }))
  const disponiveis = embaralharPorSemente(comIndice, conteudo.instrucao).filter(
    ({ i }) => !escolhidos.includes(i)
  )

  function tocar(indiceOriginal: number) {
    if (respondida || escolhidos.includes(indiceOriginal)) return
    const proximos = [...escolhidos, indiceOriginal]
    setEscolhidos(proximos)
    if (proximos.length === conteudo.itens.length) {
      onResponder({ formato: "ordenar", ordem: proximos })
    }
  }

  const ordemMostrada = respondida ? resposta.ordem : escolhidos
  const acertouTudo =
    respondida && resposta.ordem.every((idx, pos) => conteudo.itens[idx]?.posicaoCorreta === pos + 1)

  return (
    <div className="card-enter flex h-full flex-col justify-center gap-5 overflow-y-auto px-6 py-8">
      <h2 className="text-2xl font-bold leading-snug text-white">{conteudo.instrucao}</h2>

      <div className="flex flex-col gap-2">
        {ordemMostrada.map((indiceOriginal, posicao) => {
          const item = conteudo.itens[indiceOriginal]
          const noLugarCerto = item?.posicaoCorreta === posicao + 1
          return (
            <div
              key={indiceOriginal}
              className="flex items-center gap-3 rounded-2xl border-2 p-3.5"
              style={{
                borderColor: respondida
                  ? noLugarCerto
                    ? "var(--fin-acerto)"
                    : "var(--fin-erro)"
                  : "var(--fin-accent)",
                background: "var(--fin-surface)",
              }}
            >
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-black"
                style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
              >
                {posicao + 1}
              </span>
              <span className="flex-1 text-sm text-white">{item?.texto}</span>
              {respondida &&
                (noLugarCerto ? (
                  <Check className="size-4 shrink-0 text-[var(--fin-acerto)]" />
                ) : (
                  <X className="size-4 shrink-0 text-[var(--fin-erro)]" />
                ))}
            </div>
          )
        })}
        {!respondida &&
          Array.from({ length: conteudo.itens.length - escolhidos.length }).map((_, i) => (
            <div
              key={`vazio-${i}`}
              className="rounded-2xl border-2 border-dashed p-3.5 text-center text-xs"
              style={{ borderColor: "var(--fin-border-2)", color: "var(--fin-muted)" }}
            >
              toque um item abaixo
            </div>
          ))}
      </div>

      {!respondida && (
        <div className="flex flex-wrap gap-2">
          {disponiveis.map(({ item, i }) => (
            <button
              key={i}
              onClick={() => tocar(i)}
              className="rounded-xl border-2 border-[var(--fin-border-2)] bg-[var(--fin-surface)] px-3.5 py-2.5 text-sm text-white transition-colors"
            >
              {item.texto}
            </button>
          ))}
        </div>
      )}

      {respondida && (
        <div className="fin-slide-up flex items-end gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={acertouTudo ? POSE.cheer : POSE.worried}
            alt=""
            className="fin-pop size-[72px] shrink-0 object-contain"
          />
          <div
            className="flex-1 rounded-2xl rounded-bl-sm border px-3.5 py-3"
            style={{
              background: "var(--fin-surface)",
              borderColor: acertouTudo ? "var(--fin-acerto)" : "var(--fin-erro)",
            }}
          >
            <div
              className="text-[11px] font-black uppercase tracking-wide"
              style={{ color: acertouTudo ? "var(--fin-acerto)" : "var(--fin-erro)" }}
            >
              {acertouTudo ? "Boa!" : "Quase lá"}
            </div>
            <p className="mt-0.5 text-sm leading-relaxed" style={{ color: "var(--fin-text)" }}>
              {acertouTudo ? conteudo.ancora : conteudo.feedbackErro}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
