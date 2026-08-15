"use client"

import { useEffect } from "react"

/**
 * A moldura dos modais do universo Fin: bottom sheet navy com fundo escurecido,
 * fecha no Escape e no toque fora. Sem framer aqui — os keyframes fin-* do
 * tema dão conta, e um modal a menos com dependência é um modal a menos que
 * quebra.
 */
export function ModalFin({
  aberto,
  onFechar,
  children,
}: {
  aberto: boolean
  onFechar: () => void
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!aberto) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [aberto, onFechar])

  if (!aberto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(5, 13, 17, 0.8)" }}
      onClick={onFechar}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fin-slide-up w-full max-w-md rounded-t-[26px] px-6 pb-10 pt-6 text-center"
        style={{ background: "var(--fin-surface-2, #12242B)", color: "var(--fin-text, #F2EEE3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
