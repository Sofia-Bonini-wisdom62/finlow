"use client"

import { Sparkles, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import type { Trilha } from "@/lib/trilha-visual"

interface BannerReordenacaoProps {
  resumo: NonNullable<Trilha["resumoReordenacao"]>
  onVerMudancas: () => void
  onDesfazer: () => void
  onDispensar: () => void
}

export default function BannerReordenacao({
  resumo,
  onVerMudancas,
  onDesfazer,
  onDispensar,
}: BannerReordenacaoProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className="mx-4 mb-2 overflow-hidden rounded-xl"
        style={{
          backgroundColor: "var(--finlow-surface)",
          borderLeft: "2px solid var(--finlow-accent)",
        }}
      >
        <div className="flex items-start gap-3 p-3">
          <Sparkles
            size={18}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--finlow-accent)" }}
            aria-hidden="true"
          />
          <div className="flex-1">
            <p
              className="text-[13px] leading-relaxed"
              style={{ color: "var(--finlow-text)" }}
            >
              {resumo.texto}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={onVerMudancas}
                className="rounded-md px-2.5 py-1.5 text-[13px] font-medium"
                style={{
                  backgroundColor: "var(--finlow-accent)",
                  color: "var(--finlow-bg)",
                }}
              >
                Ver o que mudou
              </button>
              <button
                type="button"
                onClick={onDesfazer}
                className="rounded-md px-2.5 py-1.5 text-[13px] font-medium"
                style={{
                  border: "1px solid var(--finlow-surface-2)",
                  color: "var(--finlow-text)",
                }}
              >
                Desfazer
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={onDispensar}
            aria-label="Dispensar aviso de reordenação"
            className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-md"
            style={{ color: "var(--finlow-muted)" }}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
