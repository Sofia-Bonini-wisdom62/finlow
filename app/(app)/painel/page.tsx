"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { BottomNav } from "@/components/bottom-nav"
import { ConsentimentoPainel } from "@/components/painel/ConsentimentoPainel"
import { SeletorMes } from "@/components/painel/SeletorMes"
import { ResultadoPeriodoCard } from "@/components/painel/ResultadoPeriodoCard"
import { ContasFixasCard } from "@/components/painel/ContasFixasCard"
import { TransacoesCard } from "@/components/painel/TransacoesCard"
import { CategoriasCard } from "@/components/painel/CategoriasCard"
import { GastoMedioPorDiaChart } from "@/components/painel/GastoMedioPorDiaChart"
import { DistribuicaoGastosChart } from "@/components/painel/DistribuicaoGastosChart"
import { InsightPerfilCard } from "@/components/painel/InsightPerfilCard"
import type { TransacaoData, ContaFixaData, CategoriaData } from "@/types/painel"

type Aba = "controle" | "analises"

export default function PainelPage() {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())
  const [aba, setAba] = useState<Aba>("controle")

  const [carregando, setCarregando] = useState(true)
  const [logado, setLogado] = useState(true)
  const [consentiu, setConsentiu] = useState<boolean | null>(null)
  const [menorDe18, setMenorDe18] = useState(false)
  const [modalConsentimento, setModalConsentimento] = useState(false)

  const [transacoes, setTransacoes] = useState<TransacaoData[]>([])
  const [contas, setContas] = useState<ContaFixaData[]>([])
  const [categorias, setCategorias] = useState<CategoriaData[]>([])

  const carregarDados = useCallback(async () => {
    const [t, c, cat] = await Promise.all([
      fetch(`/api/painel/transacoes?mes=${mes}&ano=${ano}`).then((r) => (r.ok ? r.json() : { transacoes: [] })),
      fetch("/api/painel/contas-fixas").then((r) => (r.ok ? r.json() : { contas: [] })),
      fetch("/api/painel/categorias").then((r) => (r.ok ? r.json() : { categorias: [] })),
    ])
    setTransacoes(t.transacoes ?? [])
    setContas(c.contas ?? [])
    setCategorias(cat.categorias ?? [])
  }, [mes, ano])

  useEffect(() => {
    fetch("/api/painel/consentimento")
      .then((r) => {
        if (r.status === 401) {
          setLogado(false)
          return null
        }
        return r.json()
      })
      .then((d) => {
        if (!d) return
        setConsentiu(d.consentiu)
        setMenorDe18(d.menorDe18)
        if (!d.consentiu) setModalConsentimento(true)
      })
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [])

  useEffect(() => {
    if (consentiu) carregarDados()
  }, [consentiu, carregarDados])

  async function ativarPainel() {
    const res = await fetch("/api/painel/consentimento", { method: "PATCH" })
    if (res.ok) {
      setConsentiu(true)
      setModalConsentimento(false)
    }
  }

  if (carregando) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-fl-page">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-fl-500 border-t-transparent" />
      </main>
    )
  }

  if (!logado) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-fl-page px-6 text-center">
        <p className="text-fl-ink-2">Entra na sua conta pra usar o Painel.</p>
        <Link href="/login" className="rounded-full bg-fl-500 px-6 py-3 text-sm font-semibold text-fl-ink">
          Entrar
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-fl-page pb-24 lg:pb-10 lg:pl-56">
      <div className="mx-auto w-full max-w-md px-5 py-8 md:max-w-2xl md:px-8 lg:max-w-5xl lg:px-10">
        <header className="flex flex-col gap-4">
          <span className="text-lg font-bold tracking-tight text-fl-500 lg:hidden">Finlow</span>

          {/* sub-toggle Controle Financeiro / Análises */}
          <div className="flex rounded-2xl bg-fl-card p-1">
            {([["controle", "Controle Financeiro"], ["analises", "Análises"]] as [Aba, string][]).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setAba(id)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                  aba === id ? "bg-fl-500 text-fl-ink" : "text-fl-ink-2"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <SeletorMes mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a) }} />
        </header>

        {!consentiu ? (
          /* estado vazio sem opt-in — não bloqueia navegação */
          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <p className="text-sm leading-relaxed text-fl-ink-2">
              O Painel guarda seus números de verdade — contas, gastos, saldo.
              Ativa quando quiser começar.
            </p>
            <button
              onClick={() => setModalConsentimento(true)}
              className="rounded-full bg-fl-500 px-6 py-3 text-sm font-semibold text-fl-ink"
            >
              Ativar meu Painel
            </button>
          </div>
        ) : aba === "controle" ? (
          <section className="mt-5 flex flex-col gap-4 md:grid md:grid-cols-2 md:items-start md:gap-5">
            <ResultadoPeriodoCard transacoes={transacoes} />
            <ContasFixasCard contas={contas} onMudou={carregarDados} />
            <TransacoesCard transacoes={transacoes} categorias={categorias} onMudou={carregarDados} />
            <CategoriasCard categorias={categorias} onMudou={carregarDados} />
          </section>
        ) : (
          <section className="mt-5 flex flex-col gap-4 md:grid md:grid-cols-2 md:items-start md:gap-5">
            <GastoMedioPorDiaChart transacoes={transacoes} />
            <DistribuicaoGastosChart transacoes={transacoes} />
            <InsightPerfilCard transacoes={transacoes} />
          </section>
        )}
      </div>

      {modalConsentimento && !consentiu && (
        <ConsentimentoPainel
          menorDe18={menorDe18}
          onAtivar={ativarPainel}
          onAgoraNao={() => setModalConsentimento(false)}
        />
      )}

      <BottomNav />
    </main>
  )
}
