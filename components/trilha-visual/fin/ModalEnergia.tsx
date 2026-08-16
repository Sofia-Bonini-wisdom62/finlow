"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Zap } from "lucide-react"
import { ModalFin } from "./ModalFin"
import { PRECO_RECARGA_MOEDAS_CLIENTE } from "@/lib/fin"

/**
 * O que acontece ao tocar na energia (pedido da fundadora, 16/08/2026): o
 * estado, as duas saídas — recarga cheia por moedas ou Finlow+ com energia
 * infinita — e a regra de sempre (+1 por hora) escrita. Quem cobra e valida
 * é o servidor (/api/jogo/energia); o botão daqui é convite.
 */
export function ModalEnergia({
  aberto,
  atual,
  max,
  coins,
  onFechar,
}: {
  aberto: boolean
  atual: number
  max: number
  coins: number
  onFechar: () => void
}) {
  const router = useRouter()
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [recarregou, setRecarregou] = useState(false)

  const semSaldo = coins < PRECO_RECARGA_MOEDAS_CLIENTE
  const cheia = atual >= max

  async function comprar() {
    setOcupado(true)
    setErro(null)
    try {
      const r = await fetch("/api/jogo/energia", { method: "POST" })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.ok) {
        setErro(d.erro ?? "Não deu certo. Tenta de novo?")
      } else {
        setRecarregou(true)
        router.refresh()
      }
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    }
    setOcupado(false)
  }

  function fechar() {
    setErro(null)
    setRecarregou(false)
    onFechar()
  }

  return (
    <ModalFin aberto={aberto} onFechar={fechar}>
      <Zap className="fin-pop mx-auto size-12" style={{ color: "var(--fin-energia)" }} />
      <h3 className="mt-3 text-[20px] font-black tracking-tight">
        {recarregou ? "Energia cheia!" : `Energia: ${atual} de ${max}`}
      </h3>
      <p className="mx-auto mt-1 max-w-[280px] text-[13.5px] leading-relaxed" style={{ color: "var(--fin-muted)" }}>
        {recarregou
          ? "Boa lição! Ela continua voltando sozinha, +1 por hora."
          : "Cada lição custa 4, acertos devolvem até 3, e ela volta sozinha: +1 por hora."}
      </p>

      {erro && <p className="mt-3 text-sm" style={{ color: "var(--fin-erro)" }}>{erro}</p>}

      {!recarregou && !cheia && (
        <button
          onClick={semSaldo ? undefined : comprar}
          disabled={semSaldo || ocupado}
          className={`mt-5 w-full rounded-2xl py-4 text-base font-extrabold disabled:cursor-default ${semSaldo ? "" : "fin-btn-3d"}`}
          style={
            semSaldo
              ? { background: "var(--fin-border)", color: "var(--fin-muted)" }
              : { background: "var(--fin-accent)", color: "var(--fin-bg)" }
          }
        >
          {ocupado ? "Recarregando…" : `Recarga cheia · ${PRECO_RECARGA_MOEDAS_CLIENTE} moedas`}
        </button>
      )}
      {semSaldo && !recarregou && !cheia && (
        <p className="mt-2 text-[12px] font-bold" style={{ color: "var(--fin-dim)" }}>
          Você tem {coins} {coins === 1 ? "moeda" : "moedas"}.{" "}
          <Link href="/trilha/loja" className="font-extrabold" style={{ color: "var(--fin-accent)" }}>
            Trocar XP por moedas
          </Link>
        </p>
      )}

      <Link
        href="/premium"
        className="mt-3 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left"
        style={{ background: "var(--fin-surface)" }}
      >
        <span
          className="grid size-9 shrink-0 place-items-center rounded-xl text-[15px] font-black"
          style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
        >
          ∞
        </span>
        <span>
          <span className="block text-[13.5px] font-black" style={{ color: "var(--fin-text)" }}>
            Finlow+ tem energia infinita
          </span>
          <span className="block text-[11.5px]" style={{ color: "var(--fin-dim)" }}>
            Se fizer sentido pra você, sem pressa.
          </span>
        </span>
      </Link>

      <button onClick={fechar} className="mt-2 w-full py-3 text-sm font-bold" style={{ color: "var(--fin-muted)" }}>
        Fechar
      </button>
    </ModalFin>
  )
}
