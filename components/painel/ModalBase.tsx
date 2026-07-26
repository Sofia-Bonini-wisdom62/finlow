"use client"

interface Props {
  titulo: string
  aberto: boolean
  onFechar: () => void
  children: React.ReactNode
}

export function ModalBase({ titulo, aberto, onFechar, children }: Props) {
  if (!aberto) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={onFechar}>
      <div
        className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-fl-card p-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-fl-ink">{titulo}</h3>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

export const inputPainel =
  "w-full rounded-xl border border-fl-border bg-fl-page px-4 py-3 text-sm text-fl-ink placeholder-fl-ink-3 outline-none focus:border-fl-500 transition-colors"

export const botaoPrimario =
  "w-full rounded-2xl bg-fl-500 py-3.5 text-base font-bold text-fl-ink transition-opacity disabled:opacity-50"
