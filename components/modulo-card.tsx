"use client"

import Link from "next/link"
import { Lock, Check } from "lucide-react"
import type { Modulo } from "@/lib/trilha-data"

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-background">
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function ModuloCard({ modulo }: { modulo: Modulo }) {
  const { titulo, descricao, totalItens, itensConcluidos, desbloqueado } = modulo
  const concluido = itensConcluidos === totalItens
  const emAndamento = itensConcluidos > 0 && !concluido

  const conteudo = (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-colors ${
        desbloqueado ? "hover:border-primary/40" : "opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-card-foreground text-balance">{titulo}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{descricao}</p>
        </div>
        {!desbloqueado && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground">
            <Lock className="size-4" aria-hidden="true" />
            <span className="sr-only">Bloqueado</span>
          </span>
        )}
        {concluido && desbloqueado && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-5" aria-hidden="true" />
            <span className="sr-only">Concluído</span>
          </span>
        )}
      </div>

      {desbloqueado && (
        <>
          <ProgressBar value={itensConcluidos} total={totalItens} />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {itensConcluidos} de {totalItens} itens
            </span>
            {emAndamento && (
              <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                Em andamento
              </span>
            )}
            {concluido && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                <Check className="size-3" aria-hidden="true" /> Concluído
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )

  if (!desbloqueado) {
    return <div aria-disabled="true">{conteudo}</div>
  }

  return (
    <Link href={`/trilha/${modulo.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl">
      {conteudo}
    </Link>
  )
}
