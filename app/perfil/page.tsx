"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { PerfilCard, type TipoPerfil } from "@/components/perfil-card"
import { descricoesPerfil } from "@/lib/perfis"

export default function PerfilPage() {
  const [tipo, setTipo] = useState<TipoPerfil | null>(null)

  useEffect(() => {
    const salvo = localStorage.getItem("finlow_perfil") as TipoPerfil | null
    if (salvo) setTipo(salvo)
  }, [])

  if (!tipo) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <p className="text-muted-foreground">Calculando seu perfil...</p>
          <Link href="/diagnostico" className="text-sm text-primary underline underline-offset-4">
            Fazer o diagnóstico
          </Link>
        </div>
      </main>
    )
  }

  const perfil = descricoesPerfil[tipo]

  return (
    <main className="min-h-dvh bg-background px-5 py-8"
      style={{ background: "linear-gradient(to bottom, #0D1B2A, #0a1622)" }}
    >
      <div className="mx-auto flex max-w-[390px] flex-col gap-8 lg:max-w-4xl">
        <header className="flex justify-center lg:justify-start">
          <span className="text-2xl font-bold text-primary">Finlow</span>
        </header>

        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
          {/* Lado esquerdo — texto intro (só desktop) */}
          <div className="flex flex-col items-center gap-6 lg:items-start lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
            >
              Seu perfil está pronto
              <span aria-hidden="true">🎯</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden flex-col gap-3 lg:flex"
            >
              <h1 className="text-balance text-4xl font-bold leading-tight text-foreground">
                Esse é o jeito que você se relaciona com dinheiro.
              </h1>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                A partir daqui, montamos uma trilha sob medida pra você evoluir no seu ritmo.
              </p>
            </motion.div>
          </div>

          {/* Lado direito — card + botões */}
          <div className="flex flex-col gap-6">
            <PerfilCard
              tipo={tipo}
              titulo={perfil.titulo}
              subtitulo={perfil.subtitulo}
              descricao={perfil.descricao}
              cor={perfil.cor}
            />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col gap-3"
            >
              <Link
                href="/trilha"
                className="flex h-14 w-full items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Ver minha trilha
              </Link>
              <Link
                href="/diagnostico"
                className="flex h-14 w-full items-center justify-center rounded-full border border-border bg-transparent text-base font-semibold text-foreground hover:bg-card transition-colors"
              >
                Refazer diagnóstico
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}
