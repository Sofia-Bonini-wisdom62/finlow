"use client"

import Link from "next/link"
import { Check, Play } from "lucide-react"

/**
 * Card de módulo, no layout do quadro: título à esquerda, miniatura à direita.
 *
 * A miniatura ainda não existe no banco (`Modulo.thumbnail` é null em todos).
 * Em vez de deixar um buraco cinza, ela é gerada da cor da trilha a que o
 * módulo pertence: fica com cara de coisa intencional, e o dia em que houver
 * imagem de verdade o campo entra sem mudar o layout.
 */

export interface ModuloCard {
  id: string
  slug: string
  titulo: string
  subtitulo: string
  dificuldade: string
  duracao: string
  progresso: number
  concluido: boolean
  thumbnail?: string | null
}

/** Uma cor por trilha, lida do slug. Módulo de impulso e de reserva não podem
 *  ter a mesma cara quando a lista mistura os quatro. */
const COR_POR_TRILHA: Record<string, string> = {
  lancador: "#2B6D70",
  guardador: "#4A7F63",
  impulsivo: "#B8863C",
  sonhador: "#3E6E93",
}

function corDe(slug: string): string {
  const trilha = slug.split("-")[0]
  return COR_POR_TRILHA[trilha] ?? "#5C6469"
}

export function CardModulo({ m }: { m: ModuloCard }) {
  const cor = corDe(m.slug)

  return (
    <Link
      href={`/trilha/${m.slug}`}
      className="flex items-stretch gap-3 rounded-2xl border border-fl-border bg-fl-card p-3 transition-colors hover:border-fl-500/40 hover:bg-fl-50/50"
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="text-[14.5px] font-semibold leading-snug text-fl-ink">{m.titulo}</p>
        <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-fl-ink-2">{m.subtitulo}</p>

        <div className="mt-2 flex items-center gap-2 text-[11px]">
          <span className="rounded-full bg-fl-50 px-2 py-0.5 font-semibold text-fl-500">{m.duracao}</span>
          {m.concluido && (
            <span className="flex items-center gap-1 text-fl-500">
              <Check className="size-3" /> concluído
            </span>
          )}
        </div>

        {m.progresso > 0 && !m.concluido && (
          <div className="mt-2">
            <div className="h-1 overflow-hidden rounded-full bg-fl-divider">
              <div className="h-full rounded-full bg-fl-500" style={{ width: `${m.progresso}%` }} />
            </div>
            <span className="mt-1 block text-[10.5px] text-fl-ink-3">{m.progresso}% concluído</span>
          </div>
        )}
      </div>

      <div
        aria-hidden
        className="grid size-[68px] shrink-0 place-items-center rounded-xl"
        style={{ background: m.thumbnail ? undefined : `linear-gradient(140deg, ${cor}, ${cor}CC)` }}
      >
        {m.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.thumbnail} alt="" className="size-full rounded-xl object-cover" />
        ) : (
          <Play className="size-5 text-white/90" fill="currentColor" />
        )}
      </div>
    </Link>
  )
}
