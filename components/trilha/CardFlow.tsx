"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, Flame } from "lucide-react"
import type { ModuloData, SessaoFluxo, ConteudoQuiz } from "@/types/trilha"
import { TelaRenderer } from "./TelaRenderer"
import { ProgressSegments } from "./ProgressSegments"
import { COMBO_ACENDE } from "@/lib/combo"

interface Props {
  modulo: ModuloData
  /** A lição sendo jogada: número, nome e posição ("2 de 4"). */
  licao?: { numero: number; nome: string; indice: number; total: number }
  telaInicial?: number
  /**
   * O combo herdado das lições anteriores (User.comboAtual, via GET). O chip
   * daqui é CORTESIA — quem paga o bônus é o servidor, recalculando contra o
   * gabarito no POST. Divergência entre os dois é impossível de premiar: o
   * chip não credita nada.
   */
  comboInicial?: number
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

export function CardFlow({ modulo, licao, telaInicial = 0, comboInicial = 0, sessaoInicial, onConcluir, onAvancarTela }: Props) {
  const [atual, setAtual] = useState(telaInicial)
  const [sessao, setSessao] = useState<SessaoFluxo>(sessaoInicial ?? {})
  // letra escolhida por tela de quiz — permite voltar e reexibir a resposta
  const [respostasQuiz, setRespostasQuiz] = useState<Record<string, string>>({})
  /**
   * Segunda chance (pedido da fundadora, 15/08/2026): pergunta errada volta
   * ao FIM da mesma lição, como oportunidade de acertar. A nota e o XP são
   * da PRIMEIRA tentativa, sempre: as respostas da revanche ficam num mapa
   * separado que nunca viaja pro servidor, então não há como a segunda
   * rodada inflar nada. Errar de novo só segue em frente: a chance é uma.
   */
  const [revanche, setRevanche] = useState<string[]>([])
  const [respostasRevanche, setRespostasRevanche] = useState<Record<string, string>>({})
  const [combo, setCombo] = useState(Math.max(0, comboInicial))
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

  // A sequência real mais a fila de revanche, como extensão virtual: os
  // índices além de telas.length reapresentam os quizzes errados, na ordem
  // em que foram errados.
  const totalReal = modulo.telas.length
  const emRevanche = atual >= totalReal
  const tela = emRevanche
    ? modulo.telas.find((t) => t.id === revanche[atual - totalReal]) ?? modulo.telas[totalReal - 1]
    : modulo.telas[atual]
  const totalVirtual = totalReal + revanche.length
  const ehUltima = atual === totalVirtual - 1

  function podeAvancar(): boolean {
    // quiz: basta ter respondido (certo ou errado — o feedback já ensinou)
    if (tela.tipo === "quiz") {
      return (emRevanche ? respostasRevanche : respostasQuiz)[tela.id] !== undefined
    }
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
    // O retomar-onde-parou só conhece as telas reais: índice de revanche não
    // vira telaAtual no servidor.
    if (next < totalReal) {
      // debounce pra não spammar o servidor ao passar rápido
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => onAvancarTela(next), 500)
    }
  }

  function anterior() {
    if (atual === 0) return
    setAtual(atual - 1)
  }

  /**
   * O chip acompanha as respostas na hora: acertou soma, errou zera. Cada
   * tela de quiz só entra uma vez na conta — o guard de resposta única do
   * TelaQuiz garante que este handler roda uma vez por tela.
   *
   * Errou? A tela entra UMA vez na fila de revanche do fim da lição. Na
   * revanche, a resposta vai pro mapa separado: não mexe no combo, não muda
   * a nota, não gera fila nova — é só a chance de acertar.
   */
  function registrarResposta(letra: string) {
    if (emRevanche) {
      setRespostasRevanche((prev) => ({ ...prev, [tela.id]: letra }))
      return
    }
    setRespostasQuiz((prev) => ({ ...prev, [tela.id]: letra }))
    if (tela.tipo === "quiz") {
      const acertou = !!(tela.conteudo as ConteudoQuiz).opcoes.find((o) => o.letra === letra)?.correta
      setCombo((c) => (acertou ? c + 1 : 0))
      if (!acertou) {
        setRevanche((fila) => (fila.includes(tela.id) ? fila : [...fila, tela.id]))
      }
    }
  }

  // O fundo escuro sangra a tela inteira, mas o conteúdo fica numa coluna: num
  // monitor de 1440px uma linha de texto com 1400px de largura é ilegível — o
  // olho se perde ao voltar para a linha seguinte.
  return (
    <div className="tema-fin min-h-dvh w-full" style={{ background: "var(--fin-bg)" }}>
      <div className="relative mx-auto flex h-dvh w-full flex-col md:max-w-lg">
      {/* header: voltar (a partir da tela 1) + label + contador */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center">
          {atual > 0 && (
            <button
              aria-label="Voltar"
              onClick={anterior}
              className="-ml-2 mr-1 flex h-11 w-11 items-center justify-center rounded-full text-[var(--fin-muted)] transition-colors hover:text-white"
            >
              <ChevronLeft className="size-6" />
            </button>
          )}
          <div className="flex flex-col">
            {licao && (
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--fin-accent)" }}>
                {licao.nome}
              </span>
            )}
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fin-muted)]">{tela.label}</span>
          </div>
        </div>
        <span className="text-xs text-[var(--fin-muted)]">
          {licao ? `lição ${licao.indice}/${licao.total} · ` : ""}
          {atual + 1}/{totalVirtual}
        </span>
      </div>

      <ProgressSegments total={totalVirtual} atual={atual} />

      {emRevanche && (
        <div
          className="fin-pop mx-auto mt-2 flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[12.5px] font-black"
          style={{
            borderColor: "var(--fin-energia)",
            background: "color-mix(in srgb, var(--fin-energia) 13%, transparent)",
            color: "var(--fin-energia)",
          }}
        >
          Segunda chance: sem XP, valendo o aprendizado
        </div>
      )}

      {combo >= 2 && (
        <div
          className="fin-pop mx-auto mt-2 flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[12.5px] font-black"
          style={{
            borderColor: "var(--fin-combo)",
            background: "color-mix(in srgb, var(--fin-combo) 13%, transparent)",
            color: "var(--fin-combo)",
          }}
        >
          <Flame className="size-3.5" aria-hidden="true" />
          {combo} seguidas{combo >= COMBO_ACENDE ? " · bônus valendo!" : " · bônus a caminho"}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <TelaRenderer
          key={emRevanche ? `revanche-${tela.id}` : tela.id}
          tela={tela}
          sessao={sessao}
          quizSelecionada={(emRevanche ? respostasRevanche : respostasQuiz)[tela.id] ?? null}
          onQuizSelecionar={registrarResposta}
          onInputMudou={setSessao}
          licao={licao?.numero}
          combo={combo}
        />
      </div>

      <div className="px-6 pb-8 pt-2">
        <button
          disabled={!podeAvancar()}
          onClick={proxima}
          className={`w-full rounded-2xl py-4 text-base font-extrabold transition-colors disabled:cursor-not-allowed ${podeAvancar() ? "fin-btn-3d" : ""}`}
          style={{
            background: podeAvancar() ? "var(--fin-accent)" : "var(--fin-surface)",
            color: podeAvancar() ? "var(--fin-bg)" : "var(--fin-muted)",
          }}
        >
          {ehUltima ? "Concluir lição →" : "Continuar"}
        </button>
        </div>
      </div>
    </div>
  )
}
