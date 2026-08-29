"use client"

import { useEffect, useState } from "react"
import { ModalFin } from "./ModalFin"
import { POSE } from "@/lib/fin"

/**
 * O pop-up de lição diária (G-03): aparece UMA vez na primeira visita do dia
 * à trilha (gatilho = `diaNovo` de registrarDiaAtivo), e "Hoje não" é
 * respeitado até amanhã via localStorage — insistência de app é o contrário
 * do tom do produto.
 */
export function PopupLicaoDiaria({
  diaNovo,
  sequencia,
  onFazer,
}: {
  diaNovo: boolean
  sequencia: number
  onFazer: () => void
}) {
  const [aberto, setAberto] = useState(false)

  const chave = `fin-popup-${new Date().toISOString().slice(0, 10)}`

  useEffect(() => {
    if (!diaNovo) return
    let mostrar = true
    try {
      if (localStorage.getItem(chave)) mostrar = false
    } catch {
      /* sem storage, mostra mesmo assim */
    }
    // Numa microtask: a regra de hooks proíbe setState síncrono no efeito.
    if (mostrar) Promise.resolve().then(() => setAberto(true))
  }, [diaNovo, chave])

  function dispensar() {
    try {
      localStorage.setItem(chave, "1")
    } catch {
      /* ok */
    }
    setAberto(false)
  }

  return (
    <ModalFin aberto={aberto} onFechar={dispensar}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={POSE.flex} alt="" className="fin-pop mx-auto h-[110px] object-contain" />
      <h3 className="mt-2 text-[20px] font-black tracking-tight">Sua lição diária te espera</h3>
      <p className="mx-auto mt-1 max-w-[280px] text-[13.5px] leading-relaxed" style={{ color: "var(--fin-muted)" }}>
        2 minutinhos{sequencia > 0 ? (
          <>
            {" "}e sua ofensiva de <strong style={{ color: "var(--fin-combo)" }}>{sequencia} {sequencia === 1 ? "dia" : "dias"}</strong> continua viva.
          </>
        ) : (
          " pra acender sua primeira chama."
        )}
      </p>
      <button
        onClick={() => {
          dispensar()
          onFazer()
        }}
        className="fin-btn-3d mt-5 w-full rounded-2xl py-4 text-base font-extrabold"
        style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
      >
        Fazer agora
      </button>
      <button
        onClick={dispensar}
        className="mt-1 w-full py-3 text-sm font-bold"
        style={{ color: "var(--fin-muted)" }}
      >
        Hoje não
      </button>
    </ModalFin>
  )
}
