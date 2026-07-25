"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

export const NOMES_MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

interface Props {
  mes: number // 1–12
  ano: number
  onChange: (mes: number, ano: number) => void
}

export function SeletorMes({ mes, ano, onChange }: Props) {
  function anterior() {
    if (mes === 1) onChange(12, ano - 1)
    else onChange(mes - 1, ano)
  }
  function proximo() {
    if (mes === 12) onChange(1, ano + 1)
    else onChange(mes + 1, ano)
  }

  return (
    <div className="flex items-center justify-between rounded-2xl bg-white px-2 py-1">
      <button
        aria-label="Mês anterior"
        onClick={anterior}
        className="flex h-11 w-11 items-center justify-center rounded-full text-fl-ink-2 transition-colors hover:text-fl-ink"
      >
        <ChevronLeft className="size-5" />
      </button>
      <span className="text-sm font-semibold text-fl-ink">
        {NOMES_MESES[mes - 1]} / {ano}
      </span>
      <button
        aria-label="Próximo mês"
        onClick={proximo}
        className="flex h-11 w-11 items-center justify-center rounded-full text-fl-ink-2 transition-colors hover:text-fl-ink"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  )
}
