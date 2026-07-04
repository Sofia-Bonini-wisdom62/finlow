"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { CardFlow } from "@/components/trilha/CardFlow"
import type { ModuloData, TipoPerfil } from "@/types/trilha"
import { getOrCreateUserId } from "@/lib/usuario-id"

export default function ModuloPage() {
  const params = useParams()
  const router = useRouter()
  const moduloId = params.moduloId as string

  const [modulo, setModulo] = useState<ModuloData | null | undefined>(undefined)
  const [telaInicial, setTelaInicial] = useState(0)
  const [userId, setUserId] = useState("")

  useEffect(() => {
    const uid = getOrCreateUserId()
    setUserId(uid)

    const tipoPerfil = localStorage.getItem("finlow_perfil") as TipoPerfil | null
    if (!tipoPerfil) { router.replace("/diagnostico"); return }

    fetch(`/api/trilha/${moduloId}?userId=${uid}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found")
        return r.json()
      })
      .then((data) => {
        const m = data.modulo
        if (!m) { setModulo(null); return }
        // verifica se o perfil do módulo bate com o do usuário
        if (m.tipoPerfil !== tipoPerfil) { router.replace("/trilha"); return }
        setModulo(m as ModuloData)
        // retoma de onde parou
        const prog = m.progresso?.[0]
        if (prog && !prog.concluido && prog.telaAtual > 0) {
          setTelaInicial(Math.min(prog.telaAtual, m.telas.length - 1))
        }
      })
      .catch(() => setModulo(null))
  }, [moduloId, router])

  if (modulo === undefined) {
    return (
      <div className="flex h-dvh items-center justify-center" style={{ background: "#0D1B2A" }}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00C896] border-t-transparent" />
      </div>
    )
  }

  if (modulo === null) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: "#0D1B2A" }}>
        <p style={{ color: "#A0AEC0" }}>Módulo não encontrado.</p>
        <button
          onClick={() => router.push("/trilha")}
          className="rounded-full px-6 py-3 text-sm font-semibold"
          style={{ background: "#00C896", color: "#0D1B2A" }}
        >
          Voltar à trilha
        </button>
      </div>
    )
  }

  function handleAvancarTela(tela: number) {
    if (!userId) return
    fetch("/api/progresso", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ moduloId, telaAtual: tela }),
    }).catch(() => {})
  }

  function handleConcluir() {
    if (!userId) { router.push("/trilha"); return }
    fetch("/api/progresso", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ moduloId }),
    })
      .catch(() => {})
      .finally(() => router.push("/trilha"))
  }

  return (
    <CardFlow
      modulo={modulo}
      telaInicial={telaInicial}
      onConcluir={handleConcluir}
      onAvancarTela={handleAvancarTela}
    />
  )
}
