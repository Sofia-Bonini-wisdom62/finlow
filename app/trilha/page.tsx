"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Lock, CheckCircle, PlayCircle } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { descricoesPerfil, type TipoPerfil } from "@/lib/perfis"
import { getOrCreateUserId } from "@/lib/usuario-id"

interface ProgressoModulo {
  concluido: boolean
  telaAtual: number
}

interface ModuloListItem {
  id: string
  slug: string
  titulo: string
  subtitulo: string
  ordem: number
  xp: number
  progresso: ProgressoModulo[]
}

export default function TrilhaPage() {
  const [tipo, setTipo] = useState<TipoPerfil | null>(null)
  const [modulos, setModulos] = useState<ModuloListItem[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function init() {
      let salvo = localStorage.getItem("finlow_perfil") as TipoPerfil | null

      // sem localStorage (outro dispositivo?) — recupera do banco pela sessão
      if (!salvo) {
        try {
          const d = await fetch("/api/perfil").then((r) => r.json())
          if (d.tipo) {
            salvo = d.tipo as TipoPerfil
            localStorage.setItem("finlow_perfil", salvo)
          }
        } catch {}
      }

      if (!salvo) { setCarregando(false); return }
      setTipo(salvo)

      const userId = getOrCreateUserId()
      try {
        const data = await fetch(`/api/trilha?tipoPerfil=${salvo}&userId=${userId}`).then((r) => r.json())
        setModulos(data.modulos ?? [])
      } catch {}
      setCarregando(false)
    }
    init()
  }, [])

  if (carregando) {
    return (
      <main className="flex min-h-dvh items-center justify-center" style={{ background: "#0D1B2A" }}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00C896] border-t-transparent" />
      </main>
    )
  }

  if (!tipo) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6 text-center" style={{ background: "#0D1B2A" }}>
        <div className="flex flex-col gap-4">
          <p className="text-[#A0AEC0]">Você ainda não fez o diagnóstico.</p>
          <Link
            href="/diagnostico"
            className="rounded-full px-6 py-3 text-sm font-semibold transition-colors"
            style={{ background: "#00C896", color: "#0D1B2A" }}
          >
            Fazer diagnóstico
          </Link>
        </div>
      </main>
    )
  }

  const perfil = descricoesPerfil[tipo]
  const total = modulos.length
  const concluidos = modulos.filter((m) => m.progresso?.[0]?.concluido).length

  return (
    <main
      className="relative min-h-dvh pb-24"
      style={{ background: "radial-gradient(ellipse at top, rgba(0,200,150,0.08), transparent 55%), #0D1B2A" }}
    >
      <div className="mx-auto w-full max-w-md px-5 py-8 md:max-w-2xl md:py-12">
        <header className="flex flex-col gap-5">
          <span className="text-lg font-bold tracking-tight" style={{ color: "#00C896" }}>Finlow</span>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-white md:text-3xl">
              Sua trilha,{" "}
              <span style={{ color: perfil.cor }}>{perfil.titulo}</span>
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "#A0AEC0" }}>
              Avança no seu ritmo. Cada módulo desbloqueia o próximo.
            </p>
          </div>

          {total > 0 && (
            <div className="flex flex-col gap-2">
              <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ background: "#1A2B3C" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((concluidos / total) * 100)}%`, background: "#00C896" }}
                />
              </div>
              <span className="text-sm font-medium" style={{ color: "#00C896" }}>
                {concluidos} de {total} concluídos
              </span>
            </div>
          )}
        </header>

        <section className="mt-8 flex flex-col gap-4">
          {modulos.length === 0 ? (
            <p className="text-sm" style={{ color: "#A0AEC0" }}>
              Nenhum módulo disponível ainda para seu perfil.
            </p>
          ) : (
            modulos.map((modulo, idx) => {
              const prog = modulo.progresso?.[0]
              const concluido = prog?.concluido ?? false
              const emAndamento = !concluido && (prog?.telaAtual ?? 0) > 0
              const bloqueado = idx > 0 && !modulos[idx - 1].progresso?.[0]?.concluido

              return (
                <ModuloCardItem
                  key={modulo.id}
                  modulo={modulo}
                  concluido={concluido}
                  emAndamento={emAndamento}
                  bloqueado={bloqueado}
                />
              )
            })
          )}
        </section>
      </div>
      <BottomNav />
    </main>
  )
}

function ModuloCardItem({
  modulo,
  concluido,
  emAndamento,
  bloqueado,
}: {
  modulo: ModuloListItem
  concluido: boolean
  emAndamento: boolean
  bloqueado: boolean
}) {
  const Wrapper = bloqueado ? "div" : Link

  return (
    <Wrapper
      href={bloqueado ? ("#" as never) : (`/trilha/${modulo.id}` as never)}
      className={`flex flex-col gap-3 rounded-2xl border p-5 transition-colors ${
        bloqueado
          ? "cursor-not-allowed border-[#1A2B3C] opacity-50"
          : concluido
          ? "border-[#00C896]/30 bg-[#00C896]/5 hover:bg-[#00C896]/10"
          : "border-[#1A2B3C] bg-[#1A2B3C] hover:border-[#00C896]/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#A0AEC0" }}>
            Módulo {modulo.ordem}
          </span>
          <h2 className="text-base font-bold text-white">{modulo.titulo}</h2>
          <p className="text-sm leading-relaxed" style={{ color: "#A0AEC0" }}>{modulo.subtitulo}</p>
        </div>
        <div className="mt-1 shrink-0">
          {bloqueado ? (
            <Lock className="size-5" style={{ color: "#A0AEC0" }} />
          ) : concluido ? (
            <CheckCircle className="size-5" style={{ color: "#00C896" }} />
          ) : (
            <PlayCircle className="size-5" style={{ color: "#00C896" }} />
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "#0D1B2A", color: "#F5A623" }}>
          +{modulo.xp} XP
        </span>
        {concluido && (
          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "rgba(0,200,150,0.1)", color: "#00C896" }}>
            Concluído
          </span>
        )}
        {emAndamento && !concluido && (
          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "rgba(245,166,35,0.1)", color: "#F5A623" }}>
            Em andamento
          </span>
        )}
      </div>
    </Wrapper>
  )
}
