"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ModalFin } from "./ModalFin"
import { POSE } from "@/lib/fin"

/**
 * O baú da unidade (G-11), na trilha: fechado convida, aberto conta o prêmio.
 * Quem valida a completude e paga (uma vez, pela unique do ledger) é o
 * servidor — POST /api/jogo/bau.
 */
export function ModalBau({
  refId,
  onFechar,
}: {
  /** null = fechado (modal invisível). */
  refId: string | null
  onFechar: () => void
}) {
  const router = useRouter()
  const [ganho, setGanho] = useState<number | null>(null)
  const [abrindo, setAbrindo] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function abrir() {
    if (!refId || abrindo) return
    setAbrindo(true)
    setErro(null)
    try {
      const r = await fetch("/api/jogo/bau", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refId }),
      })
      const d = await r.json()
      if (r.ok && d.ok) {
        setGanho(d.xp)
        router.refresh()
      } else {
        setErro(d.erro ?? "Não deu certo. Tenta de novo?")
      }
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    }
    setAbrindo(false)
  }

  function fechar() {
    setGanho(null)
    setErro(null)
    onFechar()
  }

  return (
    <ModalFin aberto={refId !== null} onFechar={fechar}>
      {ganho === null ? (
        <>
          <div className="fin-wob mx-auto grid size-[92px] place-items-center rounded-3xl text-5xl" style={{ background: "var(--fin-accent)", boxShadow: "0 5px 0 var(--fin-accent-sombra)" }}>
            🎁
          </div>
          <h3 className="mt-4 text-[20px] font-black tracking-tight">Baú da unidade</h3>
          <p className="mx-auto mt-1 max-w-[280px] text-[13.5px] leading-relaxed" style={{ color: "var(--fin-muted)" }}>
            Recompensa surpresa por fechar a unidade. O que será que tem dentro?
          </p>
          {erro && <p className="mt-3 text-sm" style={{ color: "var(--fin-erro)" }}>{erro}</p>}
          <button
            onClick={abrir}
            disabled={abrindo}
            className="fin-btn-3d mt-5 w-full rounded-2xl py-4 text-base font-extrabold disabled:opacity-60"
            style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
          >
            {abrindo ? "Abrindo…" : "Abrir baú"}
          </button>
        </>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={POSE.proud} alt="" className="fin-pop mx-auto h-[110px] object-contain" />
          <h3 className="mt-2 text-[21px] font-black tracking-tight">+{ganho} XP!</h3>
          <p className="mx-auto mt-1 max-w-[280px] text-[13.5px] leading-relaxed" style={{ color: "var(--fin-muted)" }}>
            Entrou direto no seu total. Na Loja do Fin dá pra trocar XP por moedas quando quiser.
          </p>
        </>
      )}
      <button onClick={fechar} className="mt-2 w-full py-3 text-sm font-bold" style={{ color: "var(--fin-muted)" }}>
        Fechar
      </button>
    </ModalFin>
  )
}
