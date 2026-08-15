"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Flame, Zap } from "lucide-react"
import type { Usuario } from "@/lib/trilha-visual"
import { AVATAR_POSE } from "@/lib/fin"

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
          className="text-lg font-extrabold tracking-tight"
          style={{ color: "var(--finlow-text)" }}
        >
          finlow
        </span>

        <div className="flex items-center gap-3.5">
          <div
            className={`flex items-center gap-1 font-extrabold tabular-nums ${indicadorTexto}`}
            style={{ color: "var(--fin-combo, var(--finlow-warn))" }}
            aria-label={`Sequência de ${usuario.sequencia} dias`}
          >
            <Flame size={indicadorIcone} aria-hidden="true" />
            {usuario.sequencia}
          </div>

          {/* Energia: quem tem gate vê o saldo; isento vê ∞ (Redesign Fin). */}
          <div
            className={`flex items-center gap-1 font-extrabold tabular-nums ${indicadorTexto}`}
            style={{ color: "var(--fin-energia, #55C7EA)" }}
            aria-label={
              usuario.energia
                ? `${usuario.energia.atual} de ${usuario.energia.max} de energia`
                : "Energia infinita"
            }
          >
            <Zap size={indicadorIcone} aria-hidden="true" />
            {usuario.energia ? usuario.energia.atual : "∞"}
          </div>

          {/* Coins → Loja do Fin */}
          <Link
            href="/trilha/loja"
            className={`flex items-center gap-1 font-extrabold tabular-nums ${indicadorTexto}`}
            style={{ color: "var(--finlow-accent)" }}
            aria-label={`${usuario.coins} Finlo Coins — abrir a loja`}
          >
            <span
              className="inline-block size-[13px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, var(--fin-accent-sombra, #B97F22) 0 40%, var(--finlow-accent) 41% 100%)",
              }}
              aria-hidden="true"
            />
            {usuario.coins.toLocaleString("pt-BR")}
          </Link>

          {/* Avatar → perfil do jogador */}
          <Link
            href="/trilha/perfil"
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-sm font-extrabold"
            style={{
              backgroundColor: "var(--finlow-accent)",
              color: "var(--finlow-bg)",
              boxShadow: "0 3px 0 var(--fin-accent-sombra, #B97F22)",
            }}
            aria-label={`Perfil do jogador de ${usuario.nome}`}
          >
            {usuario.avatarFin && AVATAR_POSE[usuario.avatarFin] ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={AVATAR_POSE[usuario.avatarFin]} alt="" className="h-full w-full object-cover" />
            ) : (
              usuario.inicial
            )}
          </Link>
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
