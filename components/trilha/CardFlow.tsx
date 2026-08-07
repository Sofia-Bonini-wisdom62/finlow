"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft } from "lucide-react"
import type { ModuloData, SessaoFluxo } from "@/types/trilha"
import { TelaRenderer } from "./TelaRenderer"
import { ProgressSegments } from "./ProgressSegments"

interface Props {
  modulo: ModuloData
  /** A lição sendo jogada: número, nome e posição ("2 de 4"). */
  licao?: { numero: number; nome: string; indice: number; total: number }
  telaInicial?: number
  /**
   * Valores que já entram na sessão, antes de a pessoa digitar qualquer coisa.
   *
   * Hoje são os indicadores macro (`ind_rotativo_medio` e afins). Viajam pela
   * sessão em vez de por prop própria porque a sessão já é encaminhada até a
   * tela de resultado, que é quem calcula: uma prop nova teria de atravessar
   * quatro assinaturas para levar dois números.
   *
   * O prefixo `ind_` é o que impede colisão com id de campo de formulário.
   */
  sessaoInicial?: SessaoFluxo
  /** Recebe as respostas de quiz (telaId → letra) e os segundos gastos, para o
   *  servidor conferir o gabarito e dar os pontos proporcionais ao acerto. */
  onConcluir: (respostasQuiz: Record<string, string>, segundos: number) => void
  onAvancarTela: (tela: number) => void
}

export function CardFlow({ modulo, licao, telaInicial = 0, sessaoInicial, onConcluir, onAvancarTela }: Props) {
  const [atual, setAtual] = useState(telaInicial)
  const [sessao, setSessao] = useState<SessaoFluxo>(sessaoInicial ?? {})
  // letra escolhida por tela de quiz — permite voltar e reexibir a resposta
  const [respostasQuiz, setRespostasQuiz] = useState<Record<string, string>>({})
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Quanto tempo a lição levou, para a tela de fim.
   *
   * Conta a partir de quando ESTA lição abriu, não da montagem do componente,
   * e o servidor ainda impõe um teto — aba esquecida aberta a noite toda não
   * vira "8 horas de estudo".
   */
  const inicioRef = useRef<number | null>(null)
  useEffect(() => {
    // Só no efeito, nunca durante a renderização: ler o relógio no corpo do
    // componente é impuro e o React pode renderizar duas vezes.
    inicioRef.current = Date.now()
  }, [licao?.numero, modulo.id])

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
      const inicio = inicioRef.current
      onConcluir(respostasQuiz, inicio === null ? 0 : Math.round((Date.now() - inicio) / 1000))
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
          <div className="flex flex-col">
            {licao && (
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#5FA7A9" }}>
                {licao.nome}
              </span>
            )}
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A7ADAF]">{tela.label}</span>
          </div>
        </div>
        <span className="text-xs text-[#A7ADAF]">
          {licao ? `lição ${licao.indice}/${licao.total} · ` : ""}
          {atual + 1}/{modulo.telas.length}
        </span>
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
          licao={licao?.numero}
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
          {ehUltima ? "Concluir lição →" : "Continuar"}
        </button>
        </div>
      </div>
    </div>
  )
}
