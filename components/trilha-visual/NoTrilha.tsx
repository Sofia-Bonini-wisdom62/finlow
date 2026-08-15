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
  Star,
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
  /** A cor da unidade (lib/fin.ts) — pinta o nó preenchido e a sombra 3D. */
  cor?: { cor: string; sombra: string }
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
  // O nó ATUAL é a estrela do caminho (protótipo) — o tema do módulo fica
  // para o drawer; aqui o que importa é "é AQUI que você está".
  if (no.estado === "atual") return Star
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
  cor,
}: NoTrilhaProps) {
  const Icone = iconePorNo(no)
  const isTravado = no.estado === "travado"
  const isAtual = no.estado === "atual"
  const isConcluido = no.estado === "concluido"
  const isRevisao = no.estado === "revisao"
  const iconSize = Math.round(size * 0.4)

  // A cor da unidade pinta o nó; sem ela, o vocabulário --finlow-* de sempre.
  const corCheia = cor?.cor ?? "var(--finlow-accent)"
  const corSombra3d = cor?.sombra ?? "var(--finlow-branch)"

  // Cores do círculo por estado
  const preenchido = isConcluido || isAtual
  const bg = preenchido
    ? corCheia
    : isTravado
      ? "var(--finlow-surface)"
      : "var(--finlow-surface-2)"
  const iconColor = preenchido
    ? "var(--finlow-bg)"
    : isTravado
      ? "var(--finlow-locked-text)"
      : "var(--finlow-text)"

  // O 3D do protótipo: sombra dura embaixo em tudo que não está travado.
  const sombra = isTravado ? "none" : `0 5px 0 ${preenchido ? corSombra3d : "var(--finlow-surface)"}`

  const anelDuplo = isAtual
    ? {
        boxShadow: `0 5px 0 ${corSombra3d}, 0 0 0 5px var(--finlow-bg), 0 0 0 8px color-mix(in srgb, ${corCheia} 55%, transparent)`,
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
          style={{ ...posCurva, color: corCheia }}
          aria-hidden="true"
        >
          +{no.pontos}
        </span>
      )}

      {/* tooltip flutuante do protótipo (atual): chip creme acima do nó com
          seta — substitui a antiga pill "Continuar →" do lado da curva. */}
      {isAtual && (
        <span
          className="fin-floaty absolute left-1/2 z-20 whitespace-nowrap rounded-xl px-3 py-1.5 text-[11px] font-black tracking-wide"
          style={{
            top: -14,
            transform: "translate(-50%, -100%)",
            backgroundColor: "var(--fin-creme, #F6E9CE)",
            color: "#0C1B21",
            boxShadow: "0 3px 0 var(--fin-creme-sombra, #C9BA98)",
          }}
          aria-hidden="true"
        >
          {no.telasVistas > 0 ? "CONTINUAR" : "COMEÇAR"}
          {no.proximaLicao ? ` · LIÇÃO ${no.proximaLicao}` : ""}
          <span
            className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45"
            style={{ bottom: -5, backgroundColor: "var(--fin-creme, #F6E9CE)" }}
          />
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
