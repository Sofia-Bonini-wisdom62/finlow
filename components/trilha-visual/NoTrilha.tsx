"use client"

import {
  Check,
  Lock,
  RefreshCw,
  BookOpen,
  CreditCard,
  PiggyBank,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Sparkles,
} from "lucide-react"
import { motion } from "framer-motion"
import type { NoTrilha as NoTrilhaTipo } from "@/lib/trilha-visual"

interface NoTrilhaProps {
  no: NoTrilhaTipo
  numero: number
  side: "left" | "right"
  size: number
  haloAtivo?: boolean
  intensidade: "sobria" | "expressiva"
  onSelecionar: () => void
}

const NIVEL_LABEL: Record<NoTrilhaTipo["nivel"], string> = {
  iniciante: "iniciante",
  intermediario: "intermediário",
  avancado: "avançado",
}

function iconePorNo(no: NoTrilhaTipo) {
  if (no.estado === "concluido") return Check
  if (no.estado === "travado") return Lock
  if (no.estado === "revisao") return RefreshCw
  const t = no.tags.join(" ")
  if (/juros|cartão|cet|crédito/i.test(t)) return CreditCard
  if (/poupан|poupar|reserva|metas/i.test(t)) return PiggyBank
  if (/seguro|proteção|golpe|risco/i.test(t)) return ShieldCheck
  if (/investir|liquidez|carteira|diversifica/i.test(t)) return TrendingUp
  if (/dívida|rotativo/i.test(t)) return AlertTriangle
  return BookOpen
}

function labelEstado(no: NoTrilhaTipo) {
  switch (no.estado) {
    case "concluido":
      return "concluído"
    case "atual":
      return "em andamento"
    case "disponivel":
      return "disponível"
    case "revisao":
      return "revisão"
    case "travado":
      return no.destravadoPor
        ? `travado, conclua ${no.destravadoPor} para abrir`
        : "travado"
  }
}

export default function NoTrilha({
  no,
  numero,
  side,
  size,
  haloAtivo,
  intensidade,
  onSelecionar,
}: NoTrilhaProps) {
  const Icone = iconePorNo(no)
  const isTravado = no.estado === "travado"
  const isAtual = no.estado === "atual"
  const isConcluido = no.estado === "concluido"
  const isRevisao = no.estado === "revisao"
  const iconSize = Math.round(size * 0.4)

  // Cores do círculo por estado
  const preenchido = isConcluido || isAtual
  const bg = preenchido
    ? "var(--finlow-accent)"
    : isTravado
      ? "var(--finlow-surface)"
      : "var(--finlow-surface-2)"
  const iconColor = preenchido
    ? "var(--finlow-bg)"
    : isTravado
      ? "var(--finlow-locked-text)"
      : "var(--finlow-text)"

  const sombra =
    isConcluido && intensidade === "expressiva"
      ? "var(--finlow-glow)"
      : isTravado
        ? "none"
        : undefined

  const anelDuplo = isAtual
    ? {
        boxShadow:
          "0 0 0 4px var(--finlow-bg), 0 0 0 6px color-mix(in srgb, var(--finlow-accent) 70%, transparent)",
      }
    : {}

  const posTexto =
    side === "right"
      ? { left: `calc(100% + 14px)`, textAlign: "left" as const }
      : { right: `calc(100% + 14px)`, textAlign: "right" as const }

  const posCurva =
    side === "right"
      ? { right: `calc(100% + 10px)` }
      : { left: `calc(100% + 10px)` }

  return (
    <motion.div
      layout
      layoutId={no.moduloId}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="relative"
      style={{ width: size, height: size }}
    >
      {/* halo de promoção — decai em 3s (controlado pelo pai) */}
      {haloAtivo && intensidade !== undefined && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full"
          initial={{ opacity: 0.7, scale: 1 }}
          animate={{ opacity: 0, scale: 1.9 }}
          transition={{ duration: 3, ease: "easeOut" }}
          style={{
            boxShadow:
              "0 0 0 8px color-mix(in srgb, var(--finlow-accent) 45%, transparent)",
          }}
        />
      )}

      <button
        type="button"
        onClick={onSelecionar}
        aria-label={`${no.titulo}, módulo ${numero}, ${labelEstado(no)}`}
        className={`relative flex items-center justify-center rounded-full ${
          isAtual ? "finlow-pulse" : ""
        }`}
        style={{
          width: size,
          height: size,
          minWidth: 44,
          minHeight: 44,
          backgroundColor: bg,
          boxShadow: sombra as string | undefined,
          border: isRevisao
            ? "2px dashed var(--finlow-accent)"
            : "2px solid transparent",
          ...anelDuplo,
        }}
      >
        <Icone size={iconSize} style={{ color: iconColor }} aria-hidden="true" />

        {/* selo de promoção */}
        {no.promovidoPelaIa && (
          <span
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full"
            style={{
              backgroundColor: "var(--finlow-warn)",
              color: "var(--finlow-bg)",
            }}
            aria-hidden="true"
          >
            <Sparkles size={12} />
          </span>
        )}
      </button>

      {/* contador de pontos (concluído) — no lado da curva */}
      {isConcluido && (
        <span
          className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-semibold tabular-nums"
          style={{ ...posCurva, color: "var(--finlow-accent)" }}
          aria-hidden="true"
        >
          +{no.pontos}
        </span>
      )}

      {/* rótulo flutuante Continuar (atual) — no lado da curva */}
      {isAtual && (
        <span
          className="absolute top-1/2 flex -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{
            ...posCurva,
            backgroundColor: "var(--finlow-accent)",
            color: "var(--finlow-bg)",
          }}
          aria-hidden="true"
        >
          Continuar →
        </span>
      )}

      {/* bloco de texto — lado oposto à curva */}
      <div
        className="absolute top-1/2 w-[calc(50vw-2.75rem)] max-w-[172px] -translate-y-1/2"
        style={posTexto}
      >
        <p
          className="line-clamp-2 text-[15px] font-semibold leading-snug"
          style={{
            color: isTravado ? "var(--finlow-locked-text)" : "var(--finlow-text)",
          }}
        >
          {no.titulo}
        </p>
        <div
          className={`mt-1 flex flex-wrap items-center gap-1.5 ${
            side === "left" ? "justify-end" : "justify-start"
          }`}
        >
          <span
            className="rounded-full px-1.5 py-0.5 text-[11px] tabular-nums"
            style={{
              backgroundColor: "var(--finlow-surface)",
              color: "var(--finlow-muted)",
            }}
          >
            ~{no.duracaoMin} min
          </span>
          <span
            className="rounded-full px-1.5 py-0.5 text-[11px]"
            style={{
              backgroundColor: "var(--finlow-surface)",
              color: "var(--finlow-muted)",
            }}
          >
            {NIVEL_LABEL[no.nivel]}
          </span>
          {isRevisao && (
            <span
              className="rounded-full px-1.5 py-0.5 text-[11px] font-medium"
              style={{
                border: "1px solid var(--finlow-accent)",
                color: "var(--finlow-accent)",
              }}
            >
              sem consulta
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
