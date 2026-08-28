"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import type { TransacaoData } from "@/types/painel"
import { brl } from "@/lib/formato"
import { montarFatias } from "@/lib/financas"
import { DetalheCategoria } from "@/components/analises/DetalheCategoria"

export interface FatiaCategoria {
  nome: string
  cor: string
  total: number
  pct: number
}

/**
 * A cor vem do mesmo lugar da rosca de Análises (`corDaSerie`), não do banco.
 * Duas roscas no mesmo app com paletas diferentes seriam duas linguagens; e as
 * cores do banco colidem entre si, o que juntava fatias vizinhas numa cunha só.
 *
 * Teto de fatias igual pelo mesmo motivo: são seis cores que se distinguem em
 * círculo fechado, nos dois modos, inclusive para daltonismo.
 */
export function agruparPorCategoria(transacoes: TransacaoData[]): FatiaCategoria[] {
  const mapa = new Map<string, number>()
  let totalGeral = 0

  for (const t of transacoes) {
    if (t.tipo !== "despesa") continue
    totalGeral += t.valor
    const nome = t.categoria?.nome ?? "Sem categoria"
    mapa.set(nome, (mapa.get(nome) ?? 0) + t.valor)
  }

  return montarFatias(
    [...mapa.entries()].map(([nome, total]) => ({ nome, total })),
    totalGeral
  )
}

/**
 * Pizza em conic-gradient — comunica "fatia do total" sem lib de gráfico.
 *
 * Tocar numa categoria abre os lançamentos que a formam. Não há busca: o Painel
 * já tem o mês inteiro em memória, então o detalhe filtra o que está aqui.
 */
export function DistribuicaoGastosChart({ transacoes }: { transacoes: TransacaoData[] }) {
  const [aberta, setAberta] = useState<FatiaCategoria | null>(null)
  const [destaque, setDestaque] = useState<string | null>(null)

  const fatias = agruparPorCategoria(transacoes)
  const total = fatias.reduce((s, f) => s + f.total, 0)

  // As paradas saem do valor real, não do pct arredondado. Somando inteiros
  // arredondados o total dava 99% ou 101% e a última fatia fechava torta.
  // A soma refaz o prefixo a cada fatia em vez de acumular numa variável:
  // são poucas categorias, e render não pode reatribuir o que capturou.
  const paradas = fatias.map((f, i) => {
    const antes = fatias.slice(0, i).reduce((s, x) => s + x.total, 0)
    const inicio = (antes / total) * 100
    const fim = i === fatias.length - 1 ? 100 : ((antes + f.total) / total) * 100
    const cor = !destaque || f.nome === destaque ? f.cor : "var(--fl-divider)"
    return `${cor} ${inicio.toFixed(3)}% ${fim.toFixed(3)}%`
  })

  return (
    <div className="rounded-2xl bg-fl-card p-5">
      <span className="text-xs font-semibold uppercase tracking-wider text-fl-ink-2">
        Distribuição de Gastos
      </span>

      {fatias.length === 0 ? (
        <p className="mt-3 text-sm text-fl-ink-2">Suas despesas por categoria aparecem aqui.</p>
      ) : (
        <div className="mt-4 flex items-center gap-5">
          <div
            aria-hidden
            className="cor-serie h-28 w-28 shrink-0 rounded-full transition-[background]"
            style={{ background: `conic-gradient(${paradas.join(", ")})` }}
          />
          <ul className="flex min-w-0 flex-1 flex-col gap-0.5">
            {fatias.map((f) => (
              <li key={f.nome}>
                <button
                  type="button"
                  onClick={() => setAberta(f)}
                  onPointerEnter={() => setDestaque(f.nome)}
                  onPointerLeave={() => setDestaque(null)}
                  onFocus={() => setDestaque(f.nome)}
                  onBlur={() => setDestaque(null)}
                  aria-label={`${f.nome}: ${brl(f.total)}, ${f.pct}% das saídas. Ver lançamentos.`}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1.5 text-left text-sm outline-none transition-colors hover:bg-fl-50 focus-visible:ring-2 focus-visible:ring-fl-500"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="cor-serie h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: f.cor }} aria-hidden />
                    <span className="truncate text-fl-ink">{f.nome}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs tabular-nums text-fl-ink-2">
                    {f.pct}% · {brl(f.total)}
                    <ChevronRight className="size-3.5 text-fl-ink-3" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <DetalheCategoria
        fatia={aberta}
        itens={transacoes}
        onFechar={() => setAberta(null)}
      />
    </div>
  )
}
