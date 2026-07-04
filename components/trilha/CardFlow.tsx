"use client"

import { useState, useRef } from "react"
import type { ModuloData, SessaoFluxo } from "@/types/trilha"
import { TelaRenderer } from "./TelaRenderer"
import { ProgressSegments } from "./ProgressSegments"

interface Props {
  modulo: ModuloData
  telaInicial?: number
  onConcluir: () => void
  onAvancarTela: (tela: number) => void
}

export function CardFlow({ modulo, telaInicial = 0, onConcluir, onAvancarTela }: Props) {
  const [atual, setAtual] = useState(telaInicial)
  const [sessao, setSessao] = useState<SessaoFluxo>({})
  const [quizOk, setQuizOk] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tela = modulo.telas[atual]
  const ehUltima = atual === modulo.telas.length - 1

  function podeAvancar(): boolean {
    if (tela.tipo === "quiz") return quizOk
    if (tela.tipo === "input") {
      const conteudo = tela.conteudo as { campos: { id: string }[] }
      return conteudo.campos.every((c) => (sessao[c.id] ?? "").trim().length > 0)
    }
    return true
  }

  function proxima() {
    if (!podeAvancar()) return
    if (ehUltima) {
      onConcluir()
      return
    }
    const next = atual + 1
    setAtual(next)
    setQuizOk(false)
    // debounce pra não spammar o servidor ao passar rápido
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onAvancarTela(next), 500)
  }

  function anterior() {
    if (atual === 0) return
    setAtual(atual - 1)
    setQuizOk(false)
  }

  return (
    <div className="relative flex h-dvh flex-col" style={{ background: "#0D1B2A" }}>
      {/* label da tela */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#A0AEC0]">{tela.label}</span>
        <span className="text-xs text-[#A0AEC0]">{atual + 1} / {modulo.telas.length}</span>
      </div>

      <ProgressSegments total={modulo.telas.length} atual={atual} />

      <div className="flex-1 overflow-hidden">
        <TelaRenderer
          key={tela.id}
          tela={tela}
          sessao={sessao}
          onQuizRespondido={(ok) => setQuizOk(ok)}
          onInputMudou={setSessao}
        />
      </div>

      <div className="px-6 pb-8 pt-2">
        <button
          disabled={!podeAvancar()}
          onClick={proxima}
          className="w-full rounded-2xl py-4 text-base font-bold transition-colors disabled:cursor-not-allowed"
          style={{
            background: podeAvancar() ? "#00C896" : "#1A2B3C",
            color: podeAvancar() ? "#0D1B2A" : "#A0AEC0",
          }}
        >
          {ehUltima ? "Concluir módulo →" : "Continuar"}
        </button>
      </div>

      {/* zonas de toque laterais estilo Stories — só em telas sem interação própria,
          senão os overlays roubam o clique das opções do quiz e dos inputs */}
      {tela.tipo !== "quiz" && tela.tipo !== "input" && (
        <>
          <button
            aria-label="Anterior"
            onClick={anterior}
            className="absolute left-0 top-20 bottom-28 w-[30%] cursor-pointer"
          />
          <button
            aria-label="Próxima"
            onClick={proxima}
            className="absolute right-0 top-20 bottom-28 w-[30%] cursor-pointer"
          />
        </>
      )}
    </div>
  )
}
