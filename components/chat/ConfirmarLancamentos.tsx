"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Plus, Minus, ArrowRight } from "lucide-react"
import type { LancamentoProposto } from "@/lib/ia"

/**
 * O passo entre "a IA entendeu" e "está no seu Painel".
 *
 * A IA nunca grava. Ela devolve o que entendeu, isto aqui mostra valor e data à
 * vista, e só o toque em Confirmar registra. Tudo vem marcado — o caso comum é
 * a leitura estar certa —, mas dá para desmarcar linha a linha antes.
 */

const NOME_CATEGORIA: Record<string, string> = {
  alimentacao: "Alimentação", delivery: "Delivery", transporte: "Transporte",
  moradia: "Moradia", assinaturas: "Assinaturas", compras: "Compras",
  saude: "Saúde", lazer: "Lazer", educacao: "Educação",
  transferencia: "Transferências", renda: "Renda", taxas_juros: "Taxas e juros",
  poupanca: "Poupança", outros: "Outros",
}

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

function dataCurta(iso: string): string {
  const hoje = new Date().toISOString().slice(0, 10)
  if (iso === hoje) return "hoje"
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

export function ConfirmarLancamentos({ lancamentos }: { lancamentos: LancamentoProposto[] }) {
  const [marcados, setMarcados] = useState<boolean[]>(() => lancamentos.map(() => true))
  const [estado, setEstado] = useState<"aberto" | "salvando" | "salvo" | "erro">("aberto")
  const [erro, setErro] = useState<string | null>(null)
  const [registrados, setRegistrados] = useState(0)

  const escolhidos = lancamentos.filter((_, i) => marcados[i])

  async function confirmar() {
    if (escolhidos.length === 0) return
    setEstado("salvando")
    setErro(null)
    try {
      const r = await fetch("/api/chat/lancamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lancamentos: escolhidos }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) {
        setEstado("erro")
        setErro(d.erro ?? d.error ?? "Não consegui registrar agora.")
        return
      }
      setRegistrados(d.registrados ?? escolhidos.length)
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
          {registrados === 1 ? "1 lançamento registrado" : `${registrados} lançamentos registrados`}
        </p>
        <Link
          href="/painel"
          className="mt-1.5 inline-flex items-center gap-1 text-[12.5px] font-semibold text-fl-500"
        >
          Ver no Painel <ArrowRight className="size-3.5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-fl-border bg-fl-card">
      <div className="px-4 pt-3">
        <p className="text-[13.5px] font-semibold text-fl-ink">Confirma que entendi certo?</p>
        <p className="mt-0.5 text-[12px] leading-snug text-fl-ink-3">
          Nada foi registrado ainda. Desmarca o que estiver errado.
        </p>
      </div>

      <ul className="mt-2.5 divide-y divide-fl-divider">
        {lancamentos.map((l, i) => (
          <li key={i}>
            <button
              onClick={() => setMarcados((m) => m.map((v, j) => (j === i ? !v : v)))}
              disabled={estado === "salvando"}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-fl-50"
            >
              <span
                aria-hidden
                className={`grid size-[18px] shrink-0 place-items-center rounded-md border transition-colors ${
                  marcados[i] ? "border-fl-500 bg-fl-500" : "border-fl-border"
                }`}
              >
                {marcados[i] && <Check className="size-3 text-primary-foreground" />}
              </span>

              <span className="min-w-0 flex-1">
                <span className={`block truncate text-[13.5px] ${marcados[i] ? "text-fl-ink" : "text-fl-ink-3 line-through"}`}>
                  {l.descricao}
                </span>
                <span className="block text-[11.5px] text-fl-ink-3">
                  {NOME_CATEGORIA[l.categoria] ?? "Outros"} · {dataCurta(l.data)}
                </span>
              </span>

              <span
                className={`flex shrink-0 items-center gap-0.5 text-[13.5px] font-semibold tabular-nums ${
                  !marcados[i] ? "text-fl-ink-3" : l.tipo === "receita" ? "text-fl-500" : "text-fl-ink"
                }`}
              >
                {l.tipo === "receita" ? <Plus className="size-3" /> : <Minus className="size-3" />}
                {brl(l.valor).replace("R$", "").trim()}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {erro && <p className="px-4 pt-2 text-[12.5px] text-fl-error">{erro}</p>}

      <div className="p-3">
        <button
          onClick={confirmar}
          disabled={estado === "salvando" || escolhidos.length === 0}
          className="w-full rounded-xl bg-fl-500 py-2.5 text-[13.5px] font-semibold text-primary-foreground disabled:opacity-40"
        >
          {estado === "salvando"
            ? "Registrando…"
            : escolhidos.length === 0
              ? "Nada marcado"
              : `Registrar ${escolhidos.length === 1 ? "1 lançamento" : `${escolhidos.length} lançamentos`}`}
        </button>
      </div>
    </div>
  )
}
