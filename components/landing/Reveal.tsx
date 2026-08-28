"use client"

import { useEffect, useRef, useState } from "react"

// fade + translateY na entrada, com fallback que nunca deixa conteúdo escondido
export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      // Navegador sem IO: revela no próximo tick. Efeito não grava estado de
      // forma síncrona, e a transição de 0.7s roda igual nos dois caminhos.
      const t = setTimeout(() => setVisivel(true), 0)
      return () => clearTimeout(t)
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisivel(true)
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    io.observe(el)
    // segurança: se algo falhar, revela mesmo assim
    const t = setTimeout(() => setVisivel(true), 1500)
    return () => {
      io.disconnect()
      clearTimeout(t)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visivel ? 1 : 0,
        transform: visivel ? "none" : "translateY(22px)",
        transition: "opacity .7s cubic-bezier(.2,0,0,1), transform .7s cubic-bezier(.2,0,0,1)",
      }}
    >
      {children}
    </div>
  )
}
