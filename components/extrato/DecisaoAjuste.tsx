"use client"

import { AlertTriangle, ShieldCheck, Check } from "lucide-react"

/**
 * A decisão sobre a linha de ajuste, quando ela existe.
 *
 * Fica ACIMA do botão de confirmar de propósito. Escolha oferecida depois que a
 * pessoa já decidiu registrar vira ruído que ela clica sem ler — e esta aqui
 * muda o total do Painel dela.
 *
 * O valor aparece por extenso na pergunta, não só na linha. "A conta não
 * fechou" sem número não dá para julgar: R$ 0,15 e R$ 1.500 pedem decisões
 * diferentes, e só o segundo merece a pessoa parar e conferir o arquivo.
 */

export interface Ajuste {
  tipo: "saldo_inicial" | "compensacao"
  descricao: string
  valor: number
  data: string
  explicacao: string
}

const brl = (n: number) =>
  Math.abs(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export function DecisaoAjuste({
  ajuste,
  contaFechou,
  motivo,
  incluir,
  onMudar,
}: {
  ajuste: Ajuste | null
  contaFechou: boolean
  motivo?: string | null
  incluir: boolean
  onMudar: (v: boolean) => void
}) {
  if (!ajuste) return null

  const alerta = !contaFechou

  return (
    <div
      className={`mt-3 rounded-2xl border p-4 ${
        alerta ? "border-fl-accent/40 bg-fl-accent/5" : "border-fl-border bg-fl-50"
      }`}
    >
      <p className="flex items-start gap-2 text-[13.5px] font-semibold text-fl-ink">
        {alerta ? (
          <AlertTriangle className="mt-px size-4 shrink-0 text-fl-accent-dark" />
        ) : (
          <ShieldCheck className="mt-px size-4 shrink-0 text-fl-500" />
        )}
        {alerta ? "A conta não fechou" : "Esse extrato começa no meio"}
      </p>

      <p className="mt-1.5 text-[12.5px] leading-relaxed text-fl-ink-2">{ajuste.explicacao}</p>

      {alerta && motivo && (
        <p className="mt-1.5 text-[11.5px] leading-snug text-fl-ink-3">{motivo}</p>
      )}

      <button
        onClick={() => onMudar(!incluir)}
        role="switch"
        aria-checked={incluir}
        className="mt-3 flex w-full items-center gap-2.5 rounded-xl border border-fl-border bg-fl-card px-3 py-2.5 text-left transition-colors hover:bg-fl-50"
      >
        <span
          aria-hidden
          className={`grid size-[18px] shrink-0 place-items-center rounded-md border transition-colors ${
            incluir ? "border-fl-500 bg-fl-500" : "border-fl-border"
          }`}
        >
          {incluir && <Check className="size-3 text-primary-foreground" />}
        </span>
        <span className="min-w-0 flex-1 text-[13px] text-fl-ink">
          Incluir &ldquo;{ajuste.descricao}&rdquo; de{" "}
          <strong className="font-semibold tabular-nums">{brl(ajuste.valor)}</strong>
        </span>
      </button>

      <p className="mt-2 text-[11.5px] leading-snug text-fl-ink-3">
        {incluir
          ? "Vai entrar como um lançamento comum, com esse nome, dá para apagar quando quiser."
          : alerta
            ? "Sem essa linha, o total do Painel vai ficar diferente do saldo do banco."
            : "Sem essa linha, o Acumulado conta como se você tivesse começado do zero."}
      </p>
    </div>
  )
}
