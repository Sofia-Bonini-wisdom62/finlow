"use client"

import { useState } from "react"
import { POSE } from "@/lib/fin"
import { avaliar } from "@/lib/licao/validar"
import type { ConteudoItem, RespostaItem } from "@/types/licao-item"

interface Props {
  conteudo: Extract<ConteudoItem, { formato: "estimativa" }>
  resposta: RespostaItem | undefined
  onResponder: (r: RespostaItem) => void
}

const ROTULO_CAMPO: Record<string, string> = { moeda: "R$", percentual: "%", numero: "" }

/**
 * Estimativa numérica com tolerância. A correção REAL é sempre
 * `gabarito` ± `toleranciaPct` (o servidor recalcula igual, em
 * `lib/licao-item/grading.ts`) — `verificacao.expressao`, quando existe, só
 * aparece no feedback para MOSTRAR a conta por trás do gabarito, nunca para
 * julgar o que a pessoa digitou.
 */
export function ItemEstimativa({ conteudo, resposta, onResponder }: Props) {
  const respondida = resposta?.formato === "estimativa"
  const [texto, setTexto] = useState("")

  const valorDigitado = Number(texto.replace(",", "."))
  const podeConferir = texto.trim().length > 0 && isFinite(valorDigitado)

  function conferir() {
    if (!podeConferir || respondida) return
    onResponder({ formato: "estimativa", valor: valorDigitado })
  }

  const valorFinal = respondida ? resposta.valor : null
  const tolerancia = Math.abs(conteudo.gabarito) * (conteudo.toleranciaPct / 100)
  const dentro = valorFinal !== null && Math.abs(valorFinal - conteudo.gabarito) <= tolerancia

  let conta: number | null = null
  if (respondida && conteudo.verificacao) {
    try {
      conta = avaliar(conteudo.verificacao.expressao)
    } catch {
      conta = null
    }
  }

  return (
    <div className="card-enter flex h-full flex-col justify-center gap-6 overflow-y-auto px-6 py-8">
      <h2 className="text-2xl font-bold leading-snug text-white">{conteudo.pergunta}</h2>

      <div className="flex items-center gap-2 rounded-2xl border-2 border-[var(--fin-border-2)] bg-[var(--fin-surface)] px-4 py-3.5">
        {ROTULO_CAMPO[conteudo.campo] && (
          <span className="text-lg font-black text-[var(--fin-muted)]">{ROTULO_CAMPO[conteudo.campo]}</span>
        )}
        <input
          type="text"
          inputMode="decimal"
          disabled={respondida}
          value={respondida ? String(valorFinal) : texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="seu chute"
          className="flex-1 bg-transparent text-lg font-bold text-white placeholder-[var(--fin-muted)] outline-none disabled:opacity-70"
        />
      </div>

      {!respondida && (
        <button
          onClick={conferir}
          disabled={!podeConferir}
          className={`w-full rounded-2xl py-3.5 text-sm font-extrabold transition-colors disabled:cursor-not-allowed ${podeConferir ? "fin-btn-3d" : ""}`}
          style={{
            background: podeConferir ? "var(--fin-accent)" : "var(--fin-border)",
            color: podeConferir ? "var(--fin-bg)" : "var(--fin-muted)",
          }}
        >
          Conferir
        </button>
      )}

      {respondida && (
        <div className="fin-slide-up flex items-end gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dentro ? POSE.cheer : POSE.worried} alt="" className="fin-pop size-[72px] shrink-0 object-contain" />
          <div
            className="flex-1 rounded-2xl rounded-bl-sm border px-3.5 py-3"
            style={{ background: "var(--fin-surface)", borderColor: dentro ? "var(--fin-acerto)" : "var(--fin-erro)" }}
          >
            <div
              className="text-[11px] font-black uppercase tracking-wide"
              style={{ color: dentro ? "var(--fin-acerto)" : "var(--fin-erro)" }}
            >
              {dentro ? "Na faixa!" : "Longe da conta"}
            </div>
            <p className="mt-0.5 text-sm leading-relaxed" style={{ color: "var(--fin-text)" }}>
              {dentro ? conteudo.feedbackPerto : conteudo.feedbackLonge}
            </p>
            {conta !== null && (
              <p className="mt-1.5 text-xs" style={{ color: "var(--fin-muted)" }}>
                A conta: {conteudo.verificacao!.expressao} = {conta} · fonte: {conteudo.fonte}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
