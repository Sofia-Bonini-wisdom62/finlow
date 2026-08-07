"use client"

import Link from "next/link"
import { Check, Lock, Play } from "lucide-react"

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
  // --- corredor (05/08/2026) ---
  estado?: "concluido" | "liberado" | "trancado"
  /** Por que está trancado, em português. Vem pronto do servidor. */
  bloqueio?: string | null
  licoesConcluidas?: number
  licoesTotal?: number
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
  const trancado = m.estado === "trancado"
  const total = m.licoesTotal ?? 0
  const feitas = m.licoesConcluidas ?? 0

  /**
   * Card trancado é DIV, não Link.
   *
   * Deixar como link e barrar depois faria a pessoa tocar, esperar e receber
   * um erro — o toque prometeria uma coisa que o servidor recusa. Aqui ele já
   * não parece tocável, e o motivo está escrito no lugar do subtítulo: quem
   * olha precisa saber o que fazer, não só que não pode.
   */
  const miolo = (
    <>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className={`text-[14.5px] font-semibold leading-snug ${trancado ? "text-fl-ink-3" : "text-fl-ink"}`}>
          {m.titulo}
        </p>

        {trancado ? (
          <p className="mt-0.5 flex items-start gap-1.5 text-[12.5px] leading-snug text-fl-ink-3">
            <Lock className="mt-0.5 size-3 shrink-0" />
            {m.bloqueio ?? "Ainda não abriu."}
          </p>
        ) : (
          <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-fl-ink-2">{m.subtitulo}</p>
        )}

        <div className="mt-2 flex items-center gap-2 text-[11px]">
          <span
            className={`rounded-full px-2 py-0.5 font-semibold ${
              trancado ? "bg-fl-divider text-fl-ink-3" : "bg-fl-50 text-fl-500"
            }`}
          >
            {total > 0 ? `${total} lições` : m.duracao}
          </span>
          {m.concluido ? (
            <span className="flex items-center gap-1 text-fl-500">
              <Check className="size-3" /> concluído
            </span>
          ) : (
            total > 0 && (
              <span className={trancado ? "text-fl-ink-3" : "text-fl-ink-2"}>
                {feitas} de {total}
              </span>
            )
          )}
        </div>

        {feitas > 0 && !m.concluido && (
          <div className="mt-2">
            <div className="h-1 overflow-hidden rounded-full bg-fl-divider">
              <div className="h-full rounded-full bg-fl-500" style={{ width: `${m.progresso}%` }} />
            </div>
          </div>
        )}
      </div>

      <div
        aria-hidden
        className="grid size-[68px] shrink-0 place-items-center rounded-xl"
        style={{
          background: m.thumbnail
            ? undefined
            : trancado
              ? "var(--fl-divider)"
              : `linear-gradient(140deg, ${cor}, ${cor}CC)`,
        }}
      >
        {m.thumbnail && !trancado ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.thumbnail} alt="" className="size-full rounded-xl object-cover" />
        ) : trancado ? (
          <Lock className="size-5 text-fl-ink-3" />
        ) : (
          <Play className="size-5 text-white/90" fill="currentColor" />
        )}
      </div>
    </>
  )

  if (trancado) {
    return (
      <div
        aria-disabled="true"
        className="flex items-stretch gap-3 rounded-2xl border border-fl-border bg-fl-card/60 p-3"
      >
        {miolo}
      </div>
    )
  }

  return (
    <Link
      href={`/trilha/${m.slug}`}
      className="flex items-stretch gap-3 rounded-2xl border border-fl-border bg-fl-card p-3 transition-colors hover:border-fl-500/40 hover:bg-fl-50/50"
    >
      {miolo}
    </Link>
  )
}
