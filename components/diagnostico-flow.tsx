"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Props {
  perguntas: {
    id: number
    texto: string
    opcoes: { letra: string; texto: string }[]
  }[]
  onConcluir: (respostas: string[]) => void
}

export function DiagnosticoFlow({ perguntas, onConcluir }: Props) {
  const [indice, setIndice] = useState(0)
  const [respostas, setRespostas] = useState<string[]>([])
  const [selecionada, setSelecionada] = useState<string | null>(null)

  const total = perguntas.length
  const pergunta = perguntas[indice]
  const progresso = ((indice + 1) / total) * 100

  function selecionar(letra: string) {
    if (selecionada) return
    setSelecionada(letra)

    const novasRespostas = [...respostas, letra]
    setRespostas(novasRespostas)

    setTimeout(() => {
      if (indice + 1 >= total) {
        onConcluir(novasRespostas)
      } else {
        setIndice((i) => i + 1)
        setSelecionada(null)
      }
    }, 400)
  }

  return (
    <div className="mx-auto w-full max-w-[390px] px-5 py-8">
      {/* Barra de progresso */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-primary">
            {indice + 1} de {total}
          </span>
          <span className="text-sm text-muted-foreground">Diagnóstico</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-card">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${progresso}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Pergunta + opções com slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pergunta.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Card da pergunta */}
          <div className="mb-6 rounded-2xl bg-card p-6">
            <h2 className="text-xl font-bold leading-snug text-balance text-foreground">
              {pergunta.texto}
            </h2>
          </div>

          {/* Opções */}
          <div className="flex flex-col gap-3">
            {pergunta.opcoes.map((opcao) => {
              const ativa = selecionada === opcao.letra
              return (
                <button
                  key={opcao.letra}
                  type="button"
                  onClick={() => selecionar(opcao.letra)}
                  disabled={!!selecionada}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border-2 bg-card p-4 text-left transition-colors",
                    ativa
                      ? "border-primary"
                      : "border-transparent hover:border-border",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold transition-colors",
                      ativa
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-primary",
                    )}
                  >
                    {opcao.letra}
                  </span>
                  <span className="text-sm leading-relaxed text-foreground">
                    {opcao.texto}
                  </span>
                </button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
