"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { Trash2, LogOut } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export default function AjustesPage() {
  const [confirmando, setConfirmando] = useState(false)
  const [apagando, setApagando] = useState(false)
  const [feito, setFeito] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function apagarDadosPainel() {
    setApagando(true)
    setErro(null)
    const res = await fetch("/api/painel/consentimento", { method: "DELETE" })
    setApagando(false)
    setConfirmando(false)
    if (!res.ok) {
      setErro("Não deu pra apagar agora. Tenta de novo?")
      return
    }
    setFeito(true)
  }

  return (
    <main className="min-h-dvh bg-finlow-bg pb-24">
      <div className="mx-auto w-full max-w-md px-5 py-8">
        <span className="text-lg font-bold tracking-tight text-finlow-green">Finlow</span>
        <h1 className="mt-6 text-2xl font-bold text-finlow-text">Ajustes</h1>

        <section className="mt-6 flex flex-col gap-3">
          <div className="rounded-2xl bg-finlow-card p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-finlow-muted">
              Dados do Painel
            </span>
            <p className="mt-2 text-sm leading-relaxed text-finlow-muted">
              Apaga todas as suas transações, contas fixas e categorias. Não tem volta —
              e o Painel volta a pedir sua autorização se você quiser usar de novo.
            </p>

            {feito ? (
              <p className="mt-3 text-sm font-medium text-finlow-green">
                Tudo apagado. O Painel está zerado.
              </p>
            ) : confirmando ? (
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-sm font-semibold text-finlow-yellow">
                  Certeza? Isso apaga tudo de verdade.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={apagarDadosPainel}
                    disabled={apagando}
                    className="flex-1 rounded-xl bg-finlow-yellow py-3 text-sm font-bold text-finlow-bg disabled:opacity-60"
                  >
                    {apagando ? "Apagando..." : "Sim, apagar tudo"}
                  </button>
                  <button
                    onClick={() => setConfirmando(false)}
                    className="flex-1 rounded-xl bg-finlow-bg py-3 text-sm font-medium text-finlow-muted"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmando(true)}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-finlow-bg px-4 py-3 text-sm font-medium text-finlow-yellow"
              >
                <Trash2 className="size-4" />
                Apagar dados do Painel
              </button>
            )}
            {erro && <p className="mt-2 text-sm text-finlow-yellow">{erro}</p>}
          </div>

          <div className="rounded-2xl bg-finlow-card p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-finlow-muted">Conta</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-finlow-bg px-4 py-3 text-sm font-medium text-finlow-muted transition-colors hover:text-finlow-text"
            >
              <LogOut className="size-4" />
              Sair da conta
            </button>
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  )
}
