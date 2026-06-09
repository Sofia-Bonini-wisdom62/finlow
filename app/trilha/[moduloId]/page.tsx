"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import { ModuloDetalhe } from "@/components/modulo-detalhe"
import { getModulo, type Modulo } from "@/lib/trilha-data"
import type { TipoPerfil } from "@/lib/perfis"

export default function ModuloPage() {
  const params = useParams()
  const moduloId = params.moduloId as string
  const [modulo, setModulo] = useState<Modulo | null | undefined>(undefined)

  useEffect(() => {
    const tipo = localStorage.getItem("finlow_perfil") as TipoPerfil | null
    if (!tipo) { setModulo(null); return }
    const progresso = JSON.parse(localStorage.getItem("finlow_progresso") || "{}")
    const found = getModulo(moduloId, tipo, progresso)
    setModulo(found ?? null)
  }, [moduloId])

  if (modulo === undefined) return null // carregando

  if (!modulo || !modulo.desbloqueado) return notFound()

  function handleToggle(itemId: string, feito: boolean) {
    const progresso = JSON.parse(localStorage.getItem("finlow_progresso") || "{}")
    progresso[itemId] = feito
    localStorage.setItem("finlow_progresso", JSON.stringify(progresso))
  }

  return <ModuloDetalhe modulo={modulo} onToggle={handleToggle} />
}
