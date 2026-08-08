"use client"

import { useEffect, useState } from "react"
import { Flame, Diamond } from "lucide-react"
import type { Usuario } from "@/lib/trilha-visual"

interface TrilhaHeaderProps {
  usuario: Usuario
  percentualAtivo: number
  intensidade: "sobria" | "expressiva"
}

export default function TrilhaHeader({
  usuario,
  percentualAtivo,
  intensidade,
}: TrilhaHeaderProps) {
  const [rolou, setRolou] = useState(false)

  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 4)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const indicadorTexto =
    intensidade === "expressiva" ? "text-[15px]" : "text-[13px]"
  const indicadorIcone = intensidade === "expressiva" ? 18 : 15

  return (
    <header
      className="sticky top-0 z-30 w-full transition-colors"
      style={{
        backgroundColor: rolou
          ? "color-mix(in srgb, var(--finlow-bg) 72%, transparent)"
          : "var(--finlow-bg)",
        backdropFilter: rolou ? "blur(12px)" : "none",
        WebkitBackdropFilter: rolou ? "blur(12px)" : "none",
      }}
    >
      <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-4">
        <span
          className="text-lg font-semibold tracking-tight"
          style={{ color: "var(--finlow-text)" }}
        >
          finlow
        </span>

        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-1 font-medium tabular-nums ${indicadorTexto}`}
            style={{ color: "var(--finlow-text)" }}
            aria-label={`Sequência de ${usuario.sequencia} dias`}
          >
            <Flame
              size={indicadorIcone}
              style={{ color: "var(--finlow-warn)" }}
              aria-hidden="true"
            />
            {usuario.sequencia}
          </div>

          <div
            className={`flex items-center gap-1 font-medium tabular-nums ${indicadorTexto}`}
            style={{ color: "var(--finlow-text)" }}
            aria-label={`${usuario.pontos} pontos`}
          >
            <Diamond
              size={indicadorIcone}
              style={{ color: "var(--finlow-accent)" }}
              aria-hidden="true"
            />
            {usuario.pontos.toLocaleString("pt-BR")}
          </div>

          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
            style={{
              backgroundColor: "var(--finlow-surface-2)",
              color: "var(--finlow-text)",
            }}
            aria-label={`Perfil de ${usuario.nome}`}
          >
            {usuario.inicial}
          </div>
        </div>
      </div>

      <div
        className="h-0.5 w-full"
        style={{ backgroundColor: "var(--finlow-surface-2)" }}
        role="progressbar"
        aria-valuenow={percentualAtivo}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso da trilha ativa"
      >
        <div
          className="h-full transition-[width] duration-500 ease-out"
          style={{
            width: `${percentualAtivo}%`,
            backgroundColor: "var(--finlow-accent)",
          }}
        />
      </div>
    </header>
  )
}
