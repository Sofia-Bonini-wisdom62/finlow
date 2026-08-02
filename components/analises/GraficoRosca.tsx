"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { brl } from "@/lib/formato"
import type { FatiaCategoria } from "@/lib/financas"

/**
 * Rosca de gastos por categoria.
 *
 * SOBRE A INTERAÇÃO
 * O valor de cada fatia já está escrito na legenda — então tocar não precisa
 * servir para "revelar o número". Tocar tem um significado só: ABRIR a
 * categoria e ver os lançamentos que a compõem. Um gesto, uma consequência.
 *
 * A fatia em si é um conic-gradient, não um caminho SVG, então quem recebe o
 * toque é a linha da legenda — que já tem altura de alvo confortável. Passar o
 * dedo ou o foco por ela apaga as outras fatias, para a pessoa ver qual é qual.
 */
export function GraficoRosca({
  fatias,
  onAbrir,
}: {
  fatias: FatiaCategoria[]
  /** Sem isto a legenda vira texto puro — o gráfico continua servindo. */
  onAbrir?: (fatia: FatiaCategoria) => void
}) {
  const [destaque, setDestaque] = useState<string | null>(null)

  if (fatias.length === 0) {
    return <p className="text-sm text-fl-ink-2">Nenhuma despesa registrada neste mês.</p>
  }

  const total = fatias.reduce((s, f) => s + f.total, 0)
  const emFoco = fatias.find((f) => f.nome === destaque) ?? null

  // As paradas saem do valor real, não do pct arredondado: somar inteiros
  // arredondados dava 99% ou 101% e a rosca fechava com uma fatia torta.
  //
  // Entre uma fatia e a seguinte entra um fio da cor do card. Duas cores
  // encostadas se contaminam na borda, e num anel a última fatia ainda encosta
  // na primeira — o vão é o que garante que cada uma comece e termine num
  // lugar visível, mesmo para quem não distingue as duas cores.
  const VAO = fatias.length > 1 ? 0.55 : 0 // ≈2px na circunferência de 132px
  const paradas: string[] = []
  let acumulado = 0
  // Laço, não forEach: o acumulador é reatribuído a cada volta, e a regra do
  // React que proíbe reatribuir depois do render não consegue provar que uma
  // callback roda durante ele.
  for (let i = 0; i < fatias.length; i++) {
    const f = fatias[i]
    const inicio = (acumulado / total) * 100
    acumulado += f.total
    const bruto = i === fatias.length - 1 ? 100 : (acumulado / total) * 100
    // Fatia minúscula não pode ser engolida pelo próprio vão.
    const fim = Math.max(inicio + 0.15, bruto - VAO)
    // Fatia sem destaque desbota; sem destaque nenhum, todas cheias.
    const cor = !destaque || f.nome === destaque ? f.cor : "var(--fl-divider)"
    paradas.push(`${cor} ${inicio.toFixed(3)}% ${fim.toFixed(3)}%`)
    if (VAO > 0) paradas.push(`var(--fl-card) ${fim.toFixed(3)}% ${bruto.toFixed(3)}%`)
  }

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div
        aria-hidden
        className="cor-serie relative mx-auto size-[132px] shrink-0 rounded-full transition-[background] sm:mx-0"
        style={{ background: `conic-gradient(${paradas.join(", ")})` }}
      >
        <div className="absolute inset-[26px] flex flex-col items-center justify-center rounded-full bg-fl-card px-1 text-center">
          <span className="w-full truncate text-[10px] font-semibold uppercase tracking-wide text-fl-ink-2">
            {emFoco ? emFoco.nome : "Total"}
          </span>
          <span className="text-[15px] font-extrabold tabular-nums text-fl-ink">
            {brl(emFoco ? emFoco.total : total)}
          </span>
        </div>
      </div>

      <ul className="flex min-w-0 flex-1 flex-col gap-0.5">
        {fatias.map((f) => {
          const conteudo = (
            <>
              <span className="flex min-w-0 items-center gap-2">
                <span className="cor-serie size-2.5 shrink-0 rounded-full" style={{ background: f.cor }} />
                <span className="truncate text-fl-ink">{f.nome}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-xs tabular-nums text-fl-ink-2">
                {f.pct}% · {brl(f.total)}
                {onAbrir && <ChevronRight className="size-3.5 text-fl-ink-3" />}
              </span>
            </>
          )

          if (!onAbrir) {
            return (
              <li key={f.nome} className="flex items-center justify-between gap-2 px-1 py-1.5 text-sm">
                {conteudo}
              </li>
            )
          }

          return (
            <li key={f.nome}>
              <button
                type="button"
                onClick={() => onAbrir(f)}
                onPointerEnter={() => setDestaque(f.nome)}
                onPointerLeave={() => setDestaque(null)}
                onFocus={() => setDestaque(f.nome)}
                onBlur={() => setDestaque(null)}
                aria-label={`${f.nome}: ${brl(f.total)}, ${f.pct}% das saídas. Ver lançamentos.`}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1.5 text-left text-sm outline-none transition-colors hover:bg-fl-50 focus-visible:ring-2 focus-visible:ring-fl-500"
              >
                {conteudo}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
