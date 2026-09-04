"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import type { ConteudoItem, RespostaItem } from "@/types/curso"
import { Feedback } from "./Feedback"

interface Props {
  conteudo: Extract<ConteudoItem, { formato: "classificar" }>
  resposta: RespostaItem | undefined
  onResponder: (r: RespostaItem) => void
}

/**
 * Classificar em 2 caixas, POR TOQUE (§11): cada item ganha dois botões de
 * 44px, um por caixa. Fecha sozinho quando o último item recebe caixa. A
 * chave do mapa é o índice ORIGINAL do item, como string (JSON), o contrato
 * que `lib/curso/corrigir.ts` confere.
 *
 * Quando o conteúdo traz `feedbackErro` por item, ele aparece embaixo do item
 * errado; o `feedbackErro` geral vai na bolha, como nos outros formatos.
 */
export function ItemClassificar({ conteudo, resposta, onResponder }: Props) {
  const respondida = resposta?.formato === "classificar"
  const [mapaLocal, setMapaLocal] = useState<Record<string, string>>({})
  const mapa = respondida ? resposta.mapa : mapaLocal

  function escolher(indice: number, caixaId: string) {
    if (respondida) return
    const proximo = { ...mapaLocal, [String(indice)]: caixaId }
    setMapaLocal(proximo)
    if (Object.keys(proximo).length === conteudo.itens.length) onResponder({ formato: "classificar", mapa: proximo })
  }

  const acertou = respondida && conteudo.itens.every((item, i) => resposta.mapa[String(i)] === item.caixaCorreta)

  return (
    <div className="card-enter flex h-full flex-col justify-center gap-5 overflow-y-auto px-6 py-8">
      <h2 className="text-2xl font-bold leading-snug text-white">{conteudo.instrucao}</h2>

      <ul className="flex flex-col gap-2.5" aria-label="Itens para classificar">
        {conteudo.itens.map((item, i) => {
          const escolha = mapa[String(i)]
          const certo = respondida && escolha === item.caixaCorreta
          return (
            <li
              key={i}
              className="rounded-2xl border-2 p-3.5"
              style={{
                borderColor: respondida ? (certo ? "var(--fin-acerto)" : "var(--fin-erro)") : "var(--fin-border-2)",
                background: "var(--fin-surface)",
              }}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex-1 text-sm text-white">{item.texto}</span>
                {respondida &&
                  (certo ? (
                    <Check className="size-4 shrink-0 text-[var(--fin-acerto)]" aria-label="Certo" />
                  ) : (
                    <X className="size-4 shrink-0 text-[var(--fin-erro)]" aria-label="Errado" />
                  ))}
              </div>
              <div className="flex gap-2" role="group" aria-label={`Caixa de: ${item.texto}`}>
                {conteudo.caixas.map((caixa) => {
                  const selecionada = escolha === caixa.id
                  return (
                    <button
                      key={caixa.id}
                      type="button"
                      onClick={() => escolher(i, caixa.id)}
                      disabled={respondida}
                      aria-pressed={selecionada}
                      className={`min-h-11 flex-1 rounded-xl border-2 py-2 text-xs font-bold transition-colors disabled:cursor-default ${
                        selecionada
                          ? "border-[var(--fin-accent)] bg-[var(--fin-accent)]/10 text-[var(--fin-accent)]"
                          : "border-[var(--fin-border-2)] text-[var(--fin-muted)]"
                      }`}
                    >
                      {caixa.rotulo}
                    </button>
                  )
                })}
              </div>
              {respondida && !certo && item.feedbackErro && (
                <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--fin-muted)" }}>
                  {item.feedbackErro}
                </p>
              )}
            </li>
          )
        })}
      </ul>

      {respondida && (
        <Feedback acertou={acertou} texto={acertou ? conteudo.ancora : (conteudo.feedbackErro ?? conteudo.ancora)} />
      )}
    </div>
  )
}
