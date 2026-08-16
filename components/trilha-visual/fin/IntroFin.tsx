"use client"

import { useEffect, useState } from "react"
import { POSE } from "@/lib/fin"

/**
 * A apresentação do Fin (os 3 slides do protótipo): primeira visita à trilha,
 * uma vez na vida, pulável. Guarda em localStorage — é boas-vindas, não gate:
 * se o storage falhar, ninguém fica preso do lado de fora.
 */
const SLIDES = [
  {
    img: POSE.hi,
    t: "Oi! Eu sou o Fin",
    s: "Seu guia pra dominar o dinheiro de um jeito leve: sem planilha, sem sermão.",
  },
  {
    img: POSE.point,
    t: "Trilhas por tema",
    s: "Lições de 2 minutos, agrupadas por assunto e destravadas na sua ordem.",
  },
  {
    img: POSE.fire,
    t: "Acertou, ganhou",
    s: "Sequências de acertos valem bônus, e a ofensiva diária mantém a chama acesa.",
  },
] as const

const CHAVE = "fin-intro-v1"

export function IntroFin() {
  const [visivel, setVisivel] = useState(false)
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    try {
      if (!localStorage.getItem(CHAVE)) setVisivel(true)
    } catch {
      /* sem storage, sem intro — melhor que intro em loop */
    }
  }, [])

  function concluir() {
    try {
      localStorage.setItem(CHAVE, "1")
    } catch {
      /* ok */
    }
    setVisivel(false)
  }

  if (!visivel) return null
  const s = SLIDES[slide]
  const ultimo = slide === SLIDES.length - 1

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col px-7 pb-10 pt-14 text-center"
      style={{ background: "var(--fin-bg, #0C1B21)", color: "var(--fin-text, #F2EEE3)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Apresentação do Fin"
    >
      <div className="flex justify-end">
        <button onClick={concluir} className="px-2 py-1 text-sm font-extrabold" style={{ color: "var(--fin-muted)" }}>
          Pular
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={s.img} src={s.img} alt="" className="fin-floaty h-[210px] object-contain" />
        <h2 className="text-[26px] font-black tracking-tight">{s.t}</h2>
        <p className="max-w-[290px] text-[15px] leading-relaxed" style={{ color: "var(--fin-muted)" }}>
          {s.s}
        </p>
      </div>

      <div className="mb-5 flex justify-center gap-2">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className="size-2 rounded-full transition-colors"
            style={{ background: i === slide ? "var(--fin-accent)" : "var(--fin-border)" }}
            aria-hidden="true"
          />
        ))}
      </div>

      <button
        onClick={() => (ultimo ? concluir() : setSlide(slide + 1))}
        className="fin-btn-3d w-full rounded-2xl py-4 text-base font-extrabold"
        style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
      >
        {ultimo ? "Bora começar" : "Continuar"}
      </button>
    </div>
  )
}
