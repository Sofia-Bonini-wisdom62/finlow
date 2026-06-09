"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ModuloCard } from "@/components/modulo-card"
import { getModulosPorPerfil, type Modulo } from "@/lib/trilha-data"
import { descricoesPerfil, type TipoPerfil } from "@/lib/perfis"

export default function TrilhaPage() {
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [tipo, setTipo] = useState<TipoPerfil | null>(null)

  useEffect(() => {
    const salvo = localStorage.getItem("finlow_perfil") as TipoPerfil | null
    if (!salvo) return
    const progresso = JSON.parse(localStorage.getItem("finlow_progresso") || "{}")
    setTipo(salvo)
    setModulos(getModulosPorPerfil(salvo, progresso))
  }, [])

  if (!tipo) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-6 text-center">
        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground">Você ainda não fez o diagnóstico.</p>
          <Link href="/diagnostico" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            Fazer diagnóstico
          </Link>
        </div>
      </main>
    )
  }

  const perfil = descricoesPerfil[tipo]
  const totalModulos = modulos.length
  const modulosConcluidos = modulos.filter((m) => m.itensConcluidos === m.totalItens).length

  return (
    <main className="relative min-h-dvh bg-background"
      style={{ background: "radial-gradient(ellipse at top, rgba(0,200,150,0.08), transparent 55%), #0D1B2A" }}
    >
      <div className="mx-auto w-full max-w-md px-5 py-8 md:max-w-2xl md:py-12">
        <header className="flex flex-col gap-5">
          <span className="text-lg font-bold tracking-tight text-primary">Finlow</span>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Sua trilha,{" "}
              <span style={{ color: perfil.cor }}>{perfil.titulo}</span>
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Avança no seu ritmo. Cada módulo desbloqueia o próximo.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-card">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${totalModulos > 0 ? Math.round((modulosConcluidos / totalModulos) * 100) : 0}%` }}
              />
            </div>
            <span className="text-sm font-medium text-primary">
              {modulosConcluidos} de {totalModulos} concluídos
            </span>
          </div>
        </header>

        <section className="mt-8 flex flex-col gap-4">
          {modulos.map((modulo) => (
            <ModuloCard key={modulo.id} modulo={modulo} />
          ))}
        </section>
      </div>
    </main>
  )
}
