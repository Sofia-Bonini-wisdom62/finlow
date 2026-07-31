"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ArrowRight, Target } from "lucide-react"
import type { TetoProposto } from "@/lib/ia"

/**
 * Tetos de gasto propostos na conversa, para a pessoa confirmar.
 *
 * Ao lado de cada teto vai o que ela gasta HOJE naquela categoria. Sem isso,
 * "R$ 480 em delivery" é um número solto: apertado ou folgado? A comparação é
 * o que transforma a proposta em decisão — e é também o que denuncia um teto
 * mal calculado antes de ele virar régua.
 */

const NOME_CATEGORIA: Record<string, string> = {
  alimentacao: "Alimentação", delivery: "Delivery", transporte: "Transporte",
  moradia: "Moradia", assinaturas: "Assinaturas", compras: "Compras",
  saude: "Saúde", lazer: "Lazer", educacao: "Educação",
  transferencia: "Transferências", renda: "Renda", taxas_juros: "Taxas e juros",
  poupanca: "Poupança", outros: "Outros", total: "Todo o mês",
}

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export function ConfirmarOrcamento({
  tetos,
  gastoAtual,
}: {
  tetos: TetoProposto[]
  /** slug → quanto já saiu no mês. Só para comparar; pode vir vazio. */
  gastoAtual?: Record<string, number>
}) {
  const [fora, setFora] = useState<Set<string>>(new Set())
  const [estado, setEstado] = useState<"aberto" | "salvando" | "salvo" | "erro">("aberto")
  const [erro, setErro] = useState<string | null>(null)
  const [salvos, setSalvos] = useState(0)

  const escolhidos = tetos.filter((t) => !fora.has(t.categoria))

  async function salvar() {
    if (escolhidos.length === 0) return
    setEstado("salvando")
    setErro(null)
    try {
      const r = await fetch("/api/orcamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tetos: escolhidos }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) {
        setEstado("erro")
        setErro(d.erro ?? d.error ?? "Não consegui salvar agora.")
        return
      }
      setSalvos(d.salvos ?? escolhidos.length)
      setEstado("salvo")
    } catch {
      setEstado("erro")
      setErro("A conexão caiu no meio. Tenta de novo.")
    }
  }

  if (estado === "salvo") {
    return (
      <div className="mt-2 rounded-2xl border border-fl-500/30 bg-fl-500/5 px-4 py-3">
        <p className="flex items-center gap-2 text-[13.5px] font-semibold text-fl-ink">
          <Check className="size-4 text-fl-500" />
          {salvos === 1 ? "1 teto definido" : `${salvos} tetos definidos`}
        </p>
        <Link href="/analises" className="mt-1.5 inline-flex items-center gap-1 text-[12.5px] font-semibold text-fl-500">
          Acompanhar nas Análises <ArrowRight className="size-3.5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-fl-border bg-fl-card">
      <div className="px-4 pt-3.5">
        <p className="flex items-center gap-2 text-[13.5px] font-semibold text-fl-ink">
          <Target className="size-4 text-fl-500" /> Tetos sugeridos
        </p>
        <p className="mt-0.5 text-[12px] leading-snug text-fl-ink-3">
          Nada foi salvo ainda. Desmarca o que não fizer sentido.
        </p>
      </div>

      <ul className="mt-2.5 divide-y divide-fl-divider">
        {tetos.map((t) => {
          const desmarcado = fora.has(t.categoria)
          const gasto = gastoAtual?.[t.categoria]
          const diferenca = gasto !== undefined ? gasto - t.limite : null
          return (
            <li key={t.categoria}>
              <button
                onClick={() =>
                  setFora((s) => {
                    const n = new Set(s)
                    if (n.has(t.categoria)) n.delete(t.categoria)
                    else n.add(t.categoria)
                    return n
                  })
                }
                disabled={estado === "salvando"}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-fl-50"
              >
                <span
                  aria-hidden
                  className={`grid size-[18px] shrink-0 place-items-center rounded-md border transition-colors ${
                    desmarcado ? "border-fl-border" : "border-fl-500 bg-fl-500"
                  }`}
                >
                  {!desmarcado && <Check className="size-3 text-primary-foreground" />}
                </span>

                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-[13.5px] ${desmarcado ? "text-fl-ink-3 line-through" : "text-fl-ink"}`}>
                    {NOME_CATEGORIA[t.categoria] ?? t.categoria}
                  </span>
                  {gasto !== undefined && (
                    <span className="block text-[11.5px] text-fl-ink-3">
                      hoje: {brl(gasto)}
                      {diferenca !== null && diferenca > 0
                        ? ` · corte de ${brl(diferenca)}`
                        : diferenca !== null && diferenca < 0
                          ? ` · folga de ${brl(-diferenca)}`
                          : ""}
                    </span>
                  )}
                </span>

                <span
                  className={`shrink-0 text-[14px] font-semibold tabular-nums ${
                    desmarcado ? "text-fl-ink-3" : "text-fl-ink"
                  }`}
                >
                  {brl(t.limite)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {erro && <p className="px-4 pt-2 text-[12.5px] text-fl-error">{erro}</p>}

      <div className="p-3">
        <button
          onClick={salvar}
          disabled={estado === "salvando" || escolhidos.length === 0}
          className="w-full rounded-xl bg-fl-500 py-2.5 text-[13.5px] font-semibold text-primary-foreground disabled:opacity-40"
        >
          {estado === "salvando"
            ? "Salvando…"
            : escolhidos.length === 0
              ? "Nada marcado"
              : `Definir ${escolhidos.length === 1 ? "este teto" : `os ${escolhidos.length} tetos`}`}
        </button>
      </div>
    </div>
  )
}
