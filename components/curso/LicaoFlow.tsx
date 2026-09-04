"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft } from "lucide-react"
import { ProgressSegments } from "@/components/trilha/ProgressSegments"
import { corrigirItem } from "@/lib/curso/corrigir"
import type { LicaoCursoData, RespostaItem } from "@/types/curso"
import { ItemRenderer } from "./ItemRenderer"

/** Acerto avança sozinho depois deste tanto (§12, Tarefa B). */
const AVANCO_MS = 400
/** A âncora fica visível na tela seguinte por este tanto, sem bloquear (§3). */
const ANCORA_MS = 2000

const NOME_ENCONTRO: Record<string, string> = {
  apresentacao: "Apresentação",
  reforco: "Reforço",
  consolida: "Consolidação",
}

export interface ResultadoLicaoCurso {
  acertos: number
  total: number
  segundos: number
  respostas: Record<string, RespostaItem>
}

interface Props {
  licao: LicaoCursoData
  onConcluir: (r: ResultadoLicaoCurso) => void
}

/**
 * O player do curso v2: 15 perguntas, zero telas de leitura (§3).
 *
 * A cadência é a da arquitetura, não a do CardFlow clássico:
 * - **Acertou:** a âncora aparece na hora, o item avança sozinho em ~400ms,
 *   e a âncora segue visível no topo da tela seguinte por ~2s, sem bloquear.
 * - **Errou:** o feedback de erro BLOQUEIA. É a aula (§3, "onde a explicação
 *   mora agora"); a pessoa lê e toca "Entendi" para seguir. Não há segunda
 *   chance nem revanche: o erro já ensinou, e refazer na hora mediria memória
 *   da resposta.
 * - **Nada pontua por item** (§8, §11): a nota só aparece no fim, para a
 *   pessoa, não para o ranking.
 *
 * Alvo mínimo de 44px em tudo que se toca; navegável por teclado (os botões
 * são `<button>`, o slider é `<input type="range">`, e o "Entendi" ganha o
 * foco ao aparecer para o fluxo não parar); `prefers-reduced-motion` é
 * respeitado pelas classes de animação do `globals.css`.
 */
export function LicaoFlow({ licao, onConcluir }: Props) {
  const itens = licao.itens
  const [atual, setAtual] = useState(0)
  /** O índice mais avançado já alcançado: "voltar" só olha para trás, e
   *  "Continuar" só existe quando se está atrás da frente. */
  const [frente, setFrente] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, RespostaItem>>({})
  const [bloqueada, setBloqueada] = useState(false) // erro à vista, esperando "Entendi"
  const [ancoraToast, setAncoraToast] = useState<string | null>(null)
  const inicioRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const entendiRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    inicioRef.current = Date.now()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [licao.id])

  useEffect(() => {
    if (bloqueada) entendiRef.current?.focus()
  }, [bloqueada])

  useEffect(() => {
    if (!ancoraToast) return
    const t = setTimeout(() => setAncoraToast(null), ANCORA_MS)
    return () => clearTimeout(t)
  }, [ancoraToast])

  const item = itens[atual]
  const ultima = atual === itens.length - 1

  function segundos(): number {
    const inicio = inicioRef.current
    return inicio === null ? 0 : Math.round((Date.now() - inicio) / 1000)
  }

  function avancar(proximasRespostas: Record<string, RespostaItem>) {
    if (ultima) {
      const acertos = itens.filter((i) => corrigirItem(i.conteudo, proximasRespostas[i.id])).length
      onConcluir({ acertos, total: itens.length, segundos: segundos(), respostas: proximasRespostas })
      return
    }
    setAtual((a) => a + 1)
    setFrente((f) => Math.max(f, atual + 1))
    setBloqueada(false)
  }

  function responder(r: RespostaItem) {
    if (!item || respostas[item.id]) return
    const proximas = { ...respostas, [item.id]: r }
    setRespostas(proximas)
    const acertou = corrigirItem(item.conteudo, r)
    if (acertou) {
      const c = item.conteudo
      const ancora = "ancora" in c ? (c.ancora ?? null) : null
      timerRef.current = setTimeout(() => {
        if (ancora) setAncoraToast(ancora)
        avancar(proximas)
      }, AVANCO_MS)
    } else {
      setBloqueada(true)
    }
  }

  function voltar() {
    // Voltar é só olhar: item já respondido fica travado (o componente lê a
    // resposta gravada), e ninguém volta para trás de um erro bloqueado.
    if (atual === 0 || bloqueada) return
    setAtual((a) => a - 1)
  }

  if (!item) return null

  const revendo = atual < frente && !bloqueada

  return (
    <div className="tema-fin min-h-dvh w-full" style={{ background: "var(--fin-bg)" }}>
      <div className="relative mx-auto flex h-dvh w-full flex-col md:max-w-lg">
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div className="flex min-w-0 items-center">
            {atual > 0 && !bloqueada && (
              <button
                type="button"
                aria-label="Ver a pergunta anterior"
                onClick={voltar}
                className="-ml-2 mr-1 flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--fin-muted)] transition-colors hover:text-white"
              >
                <ChevronLeft className="size-6" />
              </button>
            )}
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--fin-accent)" }}>
                {NOME_ENCONTRO[licao.tipoEncontro] ?? "Lição"} · encontro {licao.encontro}/3
              </span>
              <span className="truncate text-xs font-semibold text-[var(--fin-muted)]">{licao.titulo}</span>
            </div>
          </div>
          <span className="shrink-0 text-xs text-[var(--fin-muted)]" aria-live="polite">
            {atual + 1}/{itens.length}
          </span>
        </div>

        <ProgressSegments total={itens.length} atual={atual} />

        {ancoraToast && (
          <div
            className="fin-slide-up mx-4 mt-2 rounded-xl border px-3.5 py-2 text-[13px] leading-snug"
            style={{
              borderColor: "color-mix(in srgb, var(--fin-acerto) 45%, transparent)",
              background: "color-mix(in srgb, var(--fin-acerto) 10%, transparent)",
              color: "var(--fin-text)",
            }}
            role="status"
          >
            {ancoraToast}
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <ItemRenderer key={item.id} item={item} resposta={respostas[item.id]} onResponder={responder} />
        </div>

        {/* Só o erro tem botão na frente: acerto avança sozinho. Atrás da
            frente (revendo), "Continuar" só anda para o que já foi feito. */}
        <div className="px-6 pb-8 pt-2" style={{ minHeight: 88 }}>
          {bloqueada && (
            <button
              ref={entendiRef}
              type="button"
              onClick={() => avancar(respostas)}
              className="fin-btn-3d min-h-11 w-full rounded-2xl py-4 text-base font-extrabold"
              style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
            >
              {ultima ? "Entendi, fechar a lição" : "Entendi, continuar"}
            </button>
          )}
          {revendo && (
            <button
              type="button"
              onClick={() => setAtual((a) => a + 1)}
              className="min-h-11 w-full rounded-2xl py-4 text-base font-extrabold"
              style={{ background: "var(--fin-surface)", color: "var(--fin-text)" }}
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
