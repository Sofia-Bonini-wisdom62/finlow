"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { POSE } from "@/lib/fin"
import type { ConteudoItem, RespostaItem } from "@/types/licao-item"

interface Props {
  conteudo: Extract<ConteudoItem, { formato: "classificar" }>
  resposta: RespostaItem | undefined
  onResponder: (r: RespostaItem) => void
}

/** Classificar em 2 caixas: cada item ganha 2 botões (um por caixa) — sem
 *  drag, mobile-first. Chave do mapa é o índice ORIGINAL como string, o
 *  mesmo contrato que `corrigirItem` espera. */
export function ItemClassificar({ conteudo, resposta, onResponder }: Props) {
  const respondida = resposta?.formato === "classificar"
  const [mapaLocal, setMapaLocal] = useState<Record<string, string>>({})
  const mapa = respondida ? resposta.mapa : mapaLocal

  function escolher(indice: number, caixaId: string) {
    if (respondida) return
    const proximo = { ...mapaLocal, [String(indice)]: caixaId }
    setMapaLocal(proximo)
    if (Object.keys(proximo).length === conteudo.itens.length) {
      onResponder({ formato: "classificar", mapa: proximo })
    }
  }

  const acertouTudo =
    respondida && conteudo.itens.every((item, i) => resposta.mapa[String(i)] === item.caixaCorreta)

  return (
    <div className="card-enter flex h-full flex-col justify-center gap-5 overflow-y-auto px-6 py-8">
      <h2 className="text-2xl font-bold leading-snug text-white">{conteudo.instrucao}</h2>

      <div className="flex flex-col gap-2.5">
        {conteudo.itens.map((item, i) => {
          const escolha = mapa[String(i)]
          const certo = respondida && escolha === item.caixaCorreta
          return (
            <div
              key={i}
              className="rounded-2xl border-2 p-3.5"
              style={{
                borderColor: respondida
                  ? certo
                    ? "var(--fin-acerto)"
                    : "var(--fin-erro)"
                  : "var(--fin-border-2)",
                background: "var(--fin-surface)",
              }}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex-1 text-sm text-white">{item.texto}</span>
                {respondida &&
                  (certo ? (
                    <Check className="size-4 shrink-0 text-[var(--fin-acerto)]" />
                  ) : (
                    <X className="size-4 shrink-0 text-[var(--fin-erro)]" />
                  ))}
              </div>
              <div className="flex gap-2">
                {conteudo.caixas.map((caixa) => {
                  const selecionada = escolha === caixa.id
                  return (
                    <button
                      key={caixa.id}
                      onClick={() => escolher(i, caixa.id)}
                      disabled={respondida}
                      className={`flex-1 rounded-xl border-2 py-2 text-xs font-bold transition-colors disabled:cursor-default ${
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
            </div>
          )
        })}
      </div>

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
