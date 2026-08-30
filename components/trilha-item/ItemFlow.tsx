"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, Flame } from "lucide-react"
import type { ModuloItemData, RespostaItem } from "@/types/licao-item"
import { ItemRenderer } from "./ItemRenderer"
import { ProgressSegments } from "@/components/trilha/ProgressSegments"
import { COMBO_ACENDE } from "@/lib/combo"
import { corrigirItem } from "@/lib/licao-item/grading"

interface Props {
  modulo: ModuloItemData
  telaInicial?: number
  /** Herdado de User.comboAtual — cortesia visual, igual ao CardFlow: quem
   *  paga o bônus é o servidor, recalculando contra o gabarito no POST. */
  comboInicial?: number
  /** Manda a resposta por item (id → RespostaItem) e os segundos gastos —
   *  o servidor confere contra ItemLicao.conteudo, nunca confia na nota. */
  onConcluir: (respostas: Record<string, RespostaItem>, segundos: number) => void
  onAvancarTela: (tela: number) => void
}

/**
 * Irmão de `components/trilha/CardFlow.tsx`, para módulos `formato: "item"`
 * (base nova de lições, 20/08/2026) — não uma extensão dele.
 *
 * O formato de resposta por item (booleano / índice / ordem / mapa / número)
 * não tem nada em comum com o `telaId → letra` que o CardFlow usa há um ano
 * em produção; encaixar os 6 formatos novos ali reescreveria o coração de um
 * fluxo estável, por um ganho que este componente já entrega sozinho.
 *
 * Mesma cadência do CardFlow: revanche (erro volta pro fim da fila, a
 * resposta da revanche nunca viaja pro servidor), combo cosmético, avançar
 * com debounce. Cada Modulo novo já É a lição inteira — sem sublição — então
 * não existe "lições emendam" aqui: concluir sempre fecha o módulo.
 */
export function ItemFlow({ modulo, telaInicial = 0, comboInicial = 0, onConcluir, onAvancarTela }: Props) {
  const [atual, setAtual] = useState(telaInicial)
  const [respostas, setRespostas] = useState<Record<string, RespostaItem>>({})
  const [revanche, setRevanche] = useState<string[]>([])
  const [respostasRevanche, setRespostasRevanche] = useState<Record<string, RespostaItem>>({})
  const [combo, setCombo] = useState(Math.max(0, comboInicial))
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const inicioRef = useRef<number | null>(null)
  useEffect(() => {
    inicioRef.current = Date.now()
  }, [modulo.id])

  const totalReal = modulo.itens.length
  const emRevanche = atual >= totalReal
  const item = emRevanche
    ? modulo.itens.find((t) => t.id === revanche[atual - totalReal]) ?? modulo.itens[totalReal - 1]
    : modulo.itens[atual]
  const totalVirtual = totalReal + revanche.length
  const ehUltima = atual === totalVirtual - 1

  function podeAvancar(): boolean {
    return (emRevanche ? respostasRevanche : respostas)[item.id] !== undefined
  }

  function proxima() {
    if (!podeAvancar()) return
    if (ehUltima) {
      const inicio = inicioRef.current
      onConcluir(respostas, inicio === null ? 0 : Math.round((Date.now() - inicio) / 1000))
      return
    }
    const next = atual + 1
    setAtual(next)
    if (next < totalReal) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => onAvancarTela(next), 500)
    }
  }

  function anterior() {
    if (atual === 0) return
    setAtual(atual - 1)
  }

  /** Cosmético: o combo do chip e a fila de revanche seguem o mesmo acerto
   *  que o servidor vai recalcular — mas quem credita é sempre o POST. */
  function registrarResposta(r: RespostaItem) {
    if (emRevanche) {
      setRespostasRevanche((prev) => ({ ...prev, [item.id]: r }))
      return
    }
    setRespostas((prev) => ({ ...prev, [item.id]: r }))
    const acertou = corrigirItem(item.conteudo, r)
    setCombo((c) => (acertou ? c + 1 : 0))
    if (!acertou) {
      setRevanche((fila) => (fila.includes(item.id) ? fila : [...fila, item.id]))
    }
  }

  return (
    <div className="tema-fin min-h-dvh w-full" style={{ background: "var(--fin-bg)" }}>
      <div className="relative mx-auto flex h-dvh w-full flex-col md:max-w-lg">
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
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fin-muted)]">
              {modulo.titulo}
            </span>
          </div>
          <span className="text-xs text-[var(--fin-muted)]">
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
          <ItemRenderer
            key={emRevanche ? `revanche-${item.id}` : item.id}
            item={item}
            resposta={(emRevanche ? respostasRevanche : respostas)[item.id]}
            onResponder={registrarResposta}
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
