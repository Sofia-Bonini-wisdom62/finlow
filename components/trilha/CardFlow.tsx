"use client"

import { useState, useRef } from "react"
import { ChevronLeft } from "lucide-react"
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
  // letra escolhida por tela de quiz — permite voltar e reexibir a resposta
  const [respostasQuiz, setRespostasQuiz] = useState<Record<string, string>>({})
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tela = modulo.telas[atual]
  const ehUltima = atual === modulo.telas.length - 1

  function podeAvancar(): boolean {
    // quiz: basta ter respondido (certo ou errado — o feedback já ensinou)
    if (tela.tipo === "quiz") return respostasQuiz[tela.id] !== undefined
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
    // debounce pra não spammar o servidor ao passar rápido
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onAvancarTela(next), 500)
  }

  function anterior() {
    if (atual === 0) return
    setAtual(atual - 1)
  }

  // O fundo escuro sangra a tela inteira, mas o conteúdo fica numa coluna: num
  // monitor de 1440px uma linha de texto com 1400px de largura é ilegível — o
  // olho se perde ao voltar para a linha seguinte.
  return (
    <div className="min-h-dvh w-full" style={{ background: "#112F30" }}>
      <div className="relative mx-auto flex h-dvh w-full flex-col md:max-w-lg">
      {/* header: voltar (a partir da tela 1) + label + contador */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center">
          {atual > 0 && (
            <button
              aria-label="Voltar"
              onClick={anterior}
              className="-ml-2 mr-1 flex h-11 w-11 items-center justify-center rounded-full text-[#A7ADAF] transition-colors hover:text-white"
            >
              <ChevronLeft className="size-6" />
            </button>
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A7ADAF]">{tela.label}</span>
        </div>
        <span className="text-xs text-[#A7ADAF]">{atual + 1} / {modulo.telas.length}</span>
      </div>

      <ProgressSegments total={modulo.telas.length} atual={atual} />

      <div className="flex-1 overflow-hidden">
        <TelaRenderer
          key={tela.id}
          tela={tela}
          sessao={sessao}
          quizSelecionada={respostasQuiz[tela.id] ?? null}
          onQuizSelecionar={(letra) => setRespostasQuiz((prev) => ({ ...prev, [tela.id]: letra }))}
          onInputMudou={setSessao}
        />
      </div>

      <div className="px-6 pb-8 pt-2">
        <button
          disabled={!podeAvancar()}
          onClick={proxima}
          className="w-full rounded-2xl py-4 text-base font-bold transition-colors disabled:cursor-not-allowed"
          style={{
            background: podeAvancar() ? "#5FA7A9" : "#1B3B3C",
            color: podeAvancar() ? "#112F30" : "#A7ADAF",
          }}
        >
          {ehUltima ? "Concluir módulo →" : "Continuar"}
        </button>
        </div>
      </div>
    </div>
  )
}
