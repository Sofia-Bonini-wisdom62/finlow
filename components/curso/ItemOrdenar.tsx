"use client"

import { useState } from "react"
import { Check, X, Undo2 } from "lucide-react"
import { embaralharPorSemente } from "@/lib/embaralhar"
import type { ConteudoItem, RespostaItem } from "@/types/curso"
import { Feedback } from "./Feedback"

interface Props {
  conteudo: Extract<ConteudoItem, { formato: "ordenar" }>
  resposta: RespostaItem | undefined
  onResponder: (r: RespostaItem) => void
}

/**
 * Ordenar POR TOQUE, nunca só arrastar (§11): a pessoa toca os itens na ordem
 * que acha certa, e cada toque é um botão de 44px. "Desfazer" existe porque
 * um toque errado no meio não pode ser fatal em mão trêmula.
 *
 * `ordem[posição] = índice ORIGINAL do item` — o contrato que
 * `lib/curso/corrigir.ts` confere. Os disponíveis embaralham
 * deterministicamente (semente = instrução): sempre fora de ordem, sem
 * depender de o conteúdo já vir bagunçado.
 */
export function ItemOrdenar({ conteudo, resposta, onResponder }: Props) {
  const respondida = resposta?.formato === "ordenar"
  const [escolhidos, setEscolhidos] = useState<number[]>([])

  const comIndice = conteudo.itens.map((item, i) => ({ item, i }))
  const disponiveis = embaralharPorSemente(comIndice, conteudo.instrucao).filter(({ i }) => !escolhidos.includes(i))

  function tocar(indiceOriginal: number) {
    if (respondida || escolhidos.includes(indiceOriginal)) return
    const proximos = [...escolhidos, indiceOriginal]
    setEscolhidos(proximos)
    if (proximos.length === conteudo.itens.length) onResponder({ formato: "ordenar", ordem: proximos })
  }

  const ordemMostrada = respondida ? resposta.ordem : escolhidos
  const acertou = respondida && resposta.ordem.every((idx, pos) => conteudo.itens[idx]?.posicaoCorreta === pos + 1)

  return (
    <div className="card-enter flex h-full flex-col justify-center gap-5 overflow-y-auto px-6 py-8">
      <h2 className="text-2xl font-bold leading-snug text-white">{conteudo.instrucao}</h2>

      <ol className="flex flex-col gap-2" aria-label="Sua ordem">
        {ordemMostrada.map((indiceOriginal, posicao) => {
          const item = conteudo.itens[indiceOriginal]
          const certo = item?.posicaoCorreta === posicao + 1
          return (
            <li
              key={indiceOriginal}
              className="flex min-h-11 items-center gap-3 rounded-2xl border-2 p-3.5"
              style={{
                borderColor: respondida ? (certo ? "var(--fin-acerto)" : "var(--fin-erro)") : "var(--fin-accent)",
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
                (certo ? (
                  <Check className="size-4 shrink-0 text-[var(--fin-acerto)]" aria-label="No lugar certo" />
                ) : (
                  <X className="size-4 shrink-0 text-[var(--fin-erro)]" aria-label="Fora do lugar" />
                ))}
            </li>
          )
        })}
        {!respondida &&
          Array.from({ length: conteudo.itens.length - escolhidos.length }).map((_, i) => (
            <li
              key={`vazio-${i}`}
              className="rounded-2xl border-2 border-dashed p-3.5 text-center text-xs"
              style={{ borderColor: "var(--fin-border-2)", color: "var(--fin-muted)" }}
            >
              {i === 0 ? "toque um item abaixo" : ""}
            </li>
          ))}
      </ol>

      {!respondida && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Itens para ordenar">
          {disponiveis.map(({ item, i }) => (
            <button
              key={i}
              type="button"
              onClick={() => tocar(i)}
              className="min-h-11 rounded-xl border-2 border-[var(--fin-border-2)] bg-[var(--fin-surface)] px-3.5 py-2.5 text-sm text-white transition-colors"
            >
              {item.texto}
            </button>
          ))}
          {escolhidos.length > 0 && (
            <button
              type="button"
              onClick={() => setEscolhidos((e) => e.slice(0, -1))}
              className="flex min-h-11 items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-bold"
              style={{ color: "var(--fin-muted)" }}
            >
              <Undo2 className="size-4" aria-hidden="true" /> Desfazer
            </button>
          )}
        </div>
      )}

      {respondida && <Feedback acertou={acertou} texto={acertou ? conteudo.ancora : conteudo.feedbackErro} />}
    </div>
  )
}
