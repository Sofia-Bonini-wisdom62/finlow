"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { CardFlow } from "@/components/trilha/CardFlow"
import type { ModuloData } from "@/types/trilha"

// Player do módulo. Aceita id ou slug na URL; o progresso sempre usa o id real
// resolvido pela API. Módulos não são mais travados por perfil — a trilha
// recomendada cruza os quatro arcos conforme os números do usuário.
export default function ModuloPage() {
  const params = useParams()
  const router = useRouter()
  const chave = params.moduloId as string

  const [modulo, setModulo] = useState<ModuloData | null | undefined>(undefined)
  const [telaInicial, setTelaInicial] = useState(0)

  useEffect(() => {
    fetch(`/api/trilha/${chave}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("não encontrado"))))
      .then((data) => {
        const m = data.modulo
        if (!m) { setModulo(null); return }
        setModulo(m as ModuloData)
        const prog = m.progresso?.[0]
        if (prog && !prog.concluido && prog.telaAtual > 0) {
          setTelaInicial(Math.min(prog.telaAtual, m.telas.length - 1))
        }
      })
      .catch(() => setModulo(null))
  }, [chave])

  if (modulo === undefined) {
    return (
      <div className="flex h-dvh items-center justify-center bg-fl-page">
        <div className="size-6 animate-spin rounded-full border-2 border-fl-500 border-t-transparent" />
      </div>
    )
  }

  if (modulo === null) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-fl-page px-6 text-center">
        <p className="text-fl-ink-2">Módulo não encontrado.</p>
        <button
          onClick={() => router.push("/perfil")}
          className="rounded-full bg-fl-500 px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Voltar ao perfil
        </button>
      </div>
    )
  }

  function salvarProgresso(metodo: "PATCH" | "POST", corpo: Record<string, unknown>) {
    return fetch("/api/progresso", {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduloId: modulo!.id, ...corpo }),
    }).catch(() => {})
  }

  return (
    <CardFlow
      modulo={modulo}
      telaInicial={telaInicial}
      onAvancarTela={(tela) => { salvarProgresso("PATCH", { telaAtual: tela }) }}
      onConcluir={() => {
        salvarProgresso("POST", {}).finally(() => router.push("/perfil"))
      }}
    />
  )
}
