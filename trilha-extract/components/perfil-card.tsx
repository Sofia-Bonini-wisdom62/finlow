"use client"

import { motion } from "framer-motion"
import { Rocket, Shield, Zap, Moon } from "lucide-react"

export type TipoPerfil = "lancador" | "guardador" | "impulsivo" | "sonhador"

interface Props {
  tipo: TipoPerfil
  titulo: string
  subtitulo: string
  descricao: string
  cor: string
}

const iconePorTipo: Record<TipoPerfil, typeof Rocket> = {
  lancador: Rocket,
  guardador: Shield,
  impulsivo: Zap,
  sonhador: Moon,
}

export function PerfilCard({ tipo, titulo, subtitulo, descricao, cor }: Props) {
  const Icone = iconePorTipo[tipo]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-card p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
        className="flex size-24 items-center justify-center rounded-full"
        style={{ backgroundColor: `${cor}1A` }}
      >
        <Icone className="size-12" style={{ color: cor }} aria-hidden="true" />
      </motion.div>

      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold leading-tight text-balance" style={{ color: cor }}>
          {titulo}
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground text-pretty">{subtitulo}</p>
      </div>

      <div className="h-px w-full bg-border" role="separator" />

      <p className="text-base leading-relaxed text-foreground text-pretty">{descricao}</p>
    </motion.div>
  )
}
