"use client"

import { useEffect, useState } from "react"
import { Monitor, Sun, Moon } from "lucide-react"
import { aplicarTema, lerTema, salvarTema, type Tema } from "@/lib/tema"

const OPCOES: { valor: Tema; rotulo: string; Icone: typeof Sun }[] = [
  { valor: "sistema", rotulo: "Sistema", Icone: Monitor },
  { valor: "claro", rotulo: "Claro", Icone: Sun },
  { valor: "escuro", rotulo: "Escuro", Icone: Moon },
]

export function SeletorTema() {
  // Começa em null porque o valor real só existe no cliente: renderizar
  // "sistema" no servidor e trocar na hidratação piscaria a seleção.
  const [tema, setTema] = useState<Tema | null>(null)

  // A leitura fica num efeito porque no initializer o localStorage não existe
  // no servidor, e chutar um valor lá diverge na hidratação. O set vai numa
  // microtask: a regra de hooks proíbe setState síncrono no efeito.
  useEffect(() => {
    Promise.resolve().then(() => setTema(lerTema()))
  }, [])

  // Em "sistema", seguir o SO ao vivo — se a pessoa muda o tema do aparelho
  // com o app aberto, a tela acompanha sem precisar recarregar.
  useEffect(() => {
    if (tema !== "sistema") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const aoMudar = () => aplicarTema("sistema")
    mq.addEventListener("change", aoMudar)
    return () => mq.removeEventListener("change", aoMudar)
  }, [tema])

  function escolher(novo: Tema) {
    setTema(novo)
    salvarTema(novo)
    aplicarTema(novo)
  }

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className="flex gap-1 rounded-full border border-fl-border bg-fl-page p-1"
    >
      {OPCOES.map(({ valor, rotulo, Icone }) => {
        const ativo = tema === valor
        return (
          <button
            key={valor}
            role="radio"
            aria-checked={ativo}
            onClick={() => escolher(valor)}
            className={`flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold transition-colors ${
              ativo ? "bg-fl-500 text-primary-foreground" : "text-fl-ink-2 hover:bg-fl-50"
            }`}
          >
            <Icone className="size-3.5" />
            {rotulo}
          </button>
        )
      })}
    </div>
  )
}
