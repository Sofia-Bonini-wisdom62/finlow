"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check } from "lucide-react"
import { motion } from "framer-motion"
import type { Modulo, ChecklistItem } from "@/lib/trilha-data"

function ChecklistRow({
  item,
  onToggle,
}: {
  item: ChecklistItem
  onToggle: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      layout
      animate={{
        backgroundColor: item.feito ? "rgba(0, 200, 150, 0.12)" : "rgba(26, 43, 60, 1)",
      }}
      transition={{ duration: 0.25 }}
      className="flex w-full items-start gap-3 rounded-2xl border border-border p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-pressed={item.feito}
    >
      <span
        className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          item.feito ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground bg-transparent"
        }`}
      >
        {item.feito && <Check className="size-4" aria-hidden="true" />}
      </span>
      <span className="flex flex-col gap-1">
        <span
          className={`text-base font-medium transition-colors ${
            item.feito ? "text-muted-foreground line-through" : "text-card-foreground"
          }`}
        >
          {item.texto}
        </span>
        <span className="text-sm leading-relaxed text-muted-foreground text-pretty">{item.contexto}</span>
      </span>
    </motion.button>
  )
}

export function ModuloDetalhe({ modulo, onToggle }: { modulo: Modulo; onToggle?: (id: string, feito: boolean) => void }) {
  const [itens, setItens] = useState<ChecklistItem[]>(modulo.itens)

  function toggle(id: string) {
    setItens((prev) => prev.map((i) => {
      if (i.id !== id) return i
      const novoFeito = !i.feito
      onToggle?.(id, novoFeito)
      return { ...i, feito: novoFeito }
    }))
  }

  const concluidos = itens.filter((i) => i.feito).length

  return (
    <main className="relative min-h-dvh bg-background bg-[radial-gradient(ellipse_at_top,_rgba(0,200,150,0.08),_transparent_55%)]">
      <div className="mx-auto w-full max-w-md px-5 py-8 md:max-w-2xl md:py-12">
        <Link
          href="/trilha"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Trilha
        </Link>

        <header className="mt-6 flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground text-balance md:text-3xl">{modulo.titulo}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{modulo.descricao}</p>
          <span className="mt-1 text-sm font-medium text-primary">
            {concluidos} de {itens.length} itens
          </span>
        </header>

        <section className="mt-7 flex flex-col gap-3" aria-label="Itens do módulo">
          {itens.map((item) => (
            <ChecklistRow key={item.id} item={item} onToggle={() => toggle(item.id)} />
          ))}
        </section>
      </div>
    </main>
  )
}
