"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Upload } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { ConsentimentoPainel } from "@/components/painel/ConsentimentoPainel"
import { SeletorMes } from "@/components/painel/SeletorMes"
import { ToggleControleAnalises } from "@/components/painel/ToggleControleAnalises"
import { ResultadoPeriodoCard } from "@/components/painel/ResultadoPeriodoCard"
import { ContasFixasCard } from "@/components/painel/ContasFixasCard"
import { TransacoesCard } from "@/components/painel/TransacoesCard"
import { CategoriasCard } from "@/components/painel/CategoriasCard"
import { InvestimentosCard } from "@/components/painel/InvestimentosCard"
import type { TransacaoData, ContaFixaData, CategoriaData } from "@/types/painel"

type Escopo = "todos" | "pessoal" | "trabalho"

export default function PainelPage() {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())

  const [carregando, setCarregando] = useState(true)
  const [logado, setLogado] = useState(true)
  const [consentiu, setConsentiu] = useState<boolean | null>(null)
  const [menorDe18, setMenorDe18] = useState(false)
  const [modalConsentimento, setModalConsentimento] = useState(false)

  const [transacoes, setTransacoes] = useState<TransacaoData[]>([])
  const [contas, setContas] = useState<ContaFixaData[]>([])
  const [categorias, setCategorias] = useState<CategoriaData[]>([])

  // Módulo Avançado: separa pessoal × trabalho. O filtro só aparece com a
  // flag; sem ela a página é idêntica à de sempre ("todos").
  const [avancado, setAvancado] = useState(false)
  const [escopo, setEscopo] = useState<Escopo>("todos")

  useEffect(() => {
    fetch("/api/investimentos")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setAvancado(!!d?.ativo))
      .catch(() => {})
  }, [])

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

  // Disparo numa microtask: a regra de hooks proíbe setState síncrono no
  // corpo do efeito, e um tick de atraso não muda nada visível.
  useEffect(() => {
    if (consentiu) Promise.resolve().then(carregarDados)
  }, [consentiu, carregarDados])

  // O filtro corta em memória: a lista do mês já está aqui, e refazer a
  // chamada para cada toque no chip seria ida ao banco por nada.
  const transacoesDoEscopo =
    escopo === "todos" ? transacoes : transacoes.filter((t) => (t.escopo ?? "pessoal") === escopo)

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
        <Link href="/login" className="rounded-full bg-fl-500 px-6 py-3 text-sm font-semibold text-primary-foreground">
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

          <ToggleControleAnalises ativa="controle" />

          <SeletorMes mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a) }} />

          {avancado && consentiu && (
            <div className="flex gap-1.5">
              {([["todos", "Tudo"], ["pessoal", "Pessoal"], ["trabalho", "Trabalho"]] as [Escopo, string][]).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setEscopo(id)}
                  className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
                    escopo === id ? "bg-fl-500 text-primary-foreground" : "bg-fl-card text-fl-ink-2"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </header>

        {!consentiu ? (
          /* estado vazio sem opt-in — não bloqueia navegação */
          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <p className="text-sm leading-relaxed text-fl-ink-2">
              O Painel guarda seus números de verdade, contas, gastos, saldo.
              Ativa quando quiser começar.
            </p>
            <button
              onClick={() => setModalConsentimento(true)}
              className="fin-btn-3d rounded-full bg-fl-500 px-6 py-3 text-sm font-extrabold text-primary-foreground"
            >
              Ativar meu Painel
            </button>
          </div>
        ) : (
          <section className="mt-5 flex flex-col gap-4 md:grid md:grid-cols-2 md:items-start md:gap-5">
            <ResultadoPeriodoCard transacoes={transacoesDoEscopo} />
            <ContasFixasCard contas={contas} onMudou={carregarDados} />
            <TransacoesCard transacoes={transacoesDoEscopo} categorias={categorias} onMudou={carregarDados} avancado={avancado} />
            {avancado && <InvestimentosCard />}
            <CategoriasCard categorias={categorias} onMudou={carregarDados} />
            <Link
              href="/extrato"
              className="fin-btn-3d flex items-center justify-center gap-2 rounded-2xl bg-fl-500 py-4 text-sm font-extrabold text-primary-foreground md:col-span-2"
            >
              <Upload className="size-4" /> Subir extrato do banco
            </Link>
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
