"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { DiagnosticoFlow } from "@/components/diagnostico-flow"
import { perguntas, calcularPerfil } from "@/lib/perfis"

export function DiagnosticoClient() {
  const router = useRouter()
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(false)

  async function handleConcluir(respostas: string[]) {
    setEnviando(true)
    setErro(false)
    try {
      const tipo = calcularPerfil(respostas)
      localStorage.setItem("finlow_perfil", tipo)

      // salva no banco em segundo plano, sem bloquear o fluxo
      fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respostas }),
      }).catch(() => {})

      router.push("/perfil")
    } catch {
      setErro(true)
      setEnviando(false)
    }
  }

  return (
    <main className="relative min-h-dvh bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, rgba(0, 200, 150, 0.10) 0%, rgba(13, 27, 42, 0) 55%)",
        }}
      />
      <div className="relative z-10 flex min-h-dvh flex-col">
        <div className="mx-auto w-full max-w-[390px] px-5 pt-8 lg:max-w-2xl">
          <span className="text-xl font-bold tracking-tight text-primary">Finlow</span>
        </div>

        {enviando ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">Calculando seu perfil...</p>
          </div>
        ) : erro ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-foreground font-medium">Algo deu errado 😕</p>
            <p className="text-sm text-muted-foreground">Não conseguimos calcular seu perfil. Tenta de novo?</p>
            <button
              onClick={() => setErro(false)}
              className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <DiagnosticoFlow
            perguntas={perguntas.map((p) => ({
              id: p.id,
              texto: p.texto,
              opcoes: p.opcoes.map((o) => ({ letra: o.letra, texto: o.texto })),
            }))}
            onConcluir={handleConcluir}
          />
        )}
      </div>
    </main>
  )
}
