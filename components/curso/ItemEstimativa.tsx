"use client"

import { useState } from "react"
import { avaliar } from "@/lib/licao/validar"
import { distanciaEstimativa, toleranciaAbsoluta } from "@/lib/curso/corrigir"
import type { ConteudoItem, RespostaItem } from "@/types/curso"
import { Feedback } from "./Feedback"

interface Props {
  conteudo: Extract<ConteudoItem, { formato: "estimativa" }>
  resposta: RespostaItem | undefined
  onResponder: (r: RespostaItem) => void
}

/** Formata pelo `campo` do item: moeda em R$, percentual com %, número seco. */
export function formatarEstimativa(campo: "moeda" | "percentual" | "numero", v: number): string {
  const n = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: Number.isInteger(v) ? 0 : 1 }).format(v)
  if (campo === "moeda") return `R$ ${n}`
  if (campo === "percentual") return `${n}%`
  return n
}

/** Passo do slider: ~100 posições entre min e max, arredondado a um número redondo. */
function passoDe(min: number, max: number): number {
  const bruto = (max - min) / 100
  if (bruto <= 0) return 1
  const ordem = 10 ** Math.floor(Math.log10(bruto))
  const candidatos = [1, 2, 5, 10].map((c) => c * ordem)
  return candidatos.find((c) => c >= bruto) ?? ordem * 10
}

/**
 * Estimativa por SLIDER (§4: "slider → revela gabarito e a distância"). O
 * `<input type="range">` é acessível por teclado de nascença (setas), e o
 * botão "Conferir" é o toque que fecha a resposta. Depois: o gabarito, a
 * distância em %, o feedback perto/longe, a fonte do número e, quando o
 * item traz `verificacao`, a conta por trás do gabarito, só para explicar.
 */
export function ItemEstimativa({ conteudo, resposta, onResponder }: Props) {
  const respondida = resposta?.formato === "estimativa"
  const passo = passoDe(conteudo.min, conteudo.max)
  const [valor, setValor] = useState(() => {
    const meio = (conteudo.min + conteudo.max) / 2
    return Math.round(meio / passo) * passo
  })

  const valorFinal = respondida ? resposta.valor : valor
  const dentro = respondida && Math.abs(valorFinal - conteudo.gabarito) <= toleranciaAbsoluta(conteudo)
  const distancia = respondida ? distanciaEstimativa(conteudo, valorFinal) : null

  let conta: string | null = null
  if (respondida && conteudo.verificacao) {
    try {
      conta = `${conteudo.verificacao.expressao} = ${formatarEstimativa("numero", avaliar(conteudo.verificacao.expressao))}`
    } catch {
      conta = null
    }
  }

  const rotuloId = `estimativa-${conteudo.pergunta.slice(0, 16).replace(/\W+/g, "-")}`

  return (
    <div className="card-enter flex h-full flex-col justify-center gap-6 overflow-y-auto px-6 py-8">
      <h2 id={rotuloId} className="text-2xl font-bold leading-snug text-white">
        {conteudo.pergunta}
      </h2>

      <div className="rounded-2xl border-2 border-[var(--fin-border-2)] bg-[var(--fin-surface)] px-4 py-4">
        <div className="mb-3 text-center text-3xl font-black tabular-nums" style={{ color: "var(--fin-accent)" }}>
          {formatarEstimativa(conteudo.campo, valorFinal)}
        </div>
        <input
          type="range"
          min={conteudo.min}
          max={conteudo.max}
          step={passo}
          value={valorFinal}
          disabled={respondida}
          onChange={(e) => setValor(Number(e.target.value))}
          aria-labelledby={rotuloId}
          aria-valuetext={formatarEstimativa(conteudo.campo, valorFinal)}
          className="h-11 w-full cursor-pointer accent-[var(--fin-accent)] disabled:cursor-default"
        />
        <div className="mt-1 flex justify-between text-[11px]" style={{ color: "var(--fin-muted)" }}>
          <span>{formatarEstimativa(conteudo.campo, conteudo.min)}</span>
          <span>{formatarEstimativa(conteudo.campo, conteudo.max)}</span>
        </div>
      </div>

      {!respondida && (
        <button
          type="button"
          onClick={() => onResponder({ formato: "estimativa", valor })}
          className="fin-btn-3d min-h-11 w-full rounded-2xl py-3.5 text-sm font-extrabold"
          style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
        >
          Conferir
        </button>
      )}

      {respondida && (
        <Feedback
          acertou={dentro}
          texto={`${dentro ? "Na faixa. " : ""}Gabarito: ${formatarEstimativa(conteudo.campo, conteudo.gabarito)}${
            distancia !== null && distancia !== 0 ? ` (você chutou ${Math.abs(distancia)}% ${distancia > 0 ? "acima" : "abaixo"})` : ""
          }. ${dentro ? conteudo.feedbackPerto : conteudo.feedbackLonge}`}
          rodape={[conta, `Fonte: ${conteudo.fonte}`].filter(Boolean).join(" · ")}
        />
      )}
    </div>
  )
}
