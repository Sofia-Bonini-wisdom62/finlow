"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft } from "lucide-react"
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
  // indexado pela pergunta — voltar preserva e permite trocar a resposta
  const [respostas, setRespostas] = useState<(string | undefined)[]>([])

  const total = perguntas.length
  const pergunta = perguntas[indice]
  const progresso = ((indice + 1) / total) * 100
  const selecionada = respostas[indice]
  const ehUltima = indice + 1 >= total

  function selecionar(letra: string) {
    setRespostas((prev) => {
      const novas = [...prev]
      novas[indice] = letra
      return novas
    })
  }

  function voltar() {
    if (indice > 0) setIndice((i) => i - 1)
  }

  function continuar() {
    if (!selecionada) return
    if (ehUltima) {
      onConcluir(respostas as string[])
      return
    }
    setIndice((i) => i + 1)
  }

  return (
    <div className="mx-auto w-full max-w-[390px] px-5 py-8">
      {/* Barra de progresso */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center">
            {indice > 0 && (
              <button
                aria-label="Voltar"
                onClick={voltar}
                className="-ml-2 mr-1 flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronLeft className="size-6" />
              </button>
            )}
            <span className="text-sm font-medium text-primary">
              {indice + 1} de {total}
            </span>
          </div>
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

          {/* Opções — selecionar não avança; dá pra trocar à vontade */}
          <div className="flex flex-col gap-3">
            {pergunta.opcoes.map((opcao) => {
              const ativa = selecionada === opcao.letra
              return (
                <button
                  key={opcao.letra}
                  type="button"
                  onClick={() => selecionar(opcao.letra)}
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

          {/* Avanço deliberado, só por botão */}
          <button
            type="button"
            onClick={continuar}
            disabled={!selecionada}
            className="mt-6 w-full rounded-2xl py-4 text-base font-bold transition-colors disabled:cursor-not-allowed"
            style={{
              background: selecionada ? "#00C896" : "#1A2B3C",
              color: selecionada ? "#0D1B2A" : "#A0AEC0",
            }}
          >
            {ehUltima ? "Ver meu perfil →" : "Continuar"}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
