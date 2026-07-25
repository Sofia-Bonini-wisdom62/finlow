"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Plus, TrendingUp } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { SeletorMes } from "@/components/painel/SeletorMes"
import { GraficoLinha } from "@/components/analises/GraficoLinha"
import { GraficoRosca } from "@/components/analises/GraficoRosca"
import { GraficoBarras } from "@/components/analises/GraficoBarras"
import { brl } from "@/lib/formato"
import type { Indicadores, PontoPatrimonio, FatiaCategoria, BarraMes, PontoDia } from "@/lib/financas"

interface Dados {
  temDados: boolean
  indicadores: Indicadores
  patrimonio: PontoPatrimonio[]
  categorias: FatiaCategoria[]
  receitasDespesas: BarraMes[]
  fluxoDiario: PontoDia[]
}

function Secao({ titulo, legenda, children }: { titulo: string; legenda?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border border-fl-border bg-white p-5">
      <h2 className="text-[15px] font-bold text-fl-ink">{titulo}</h2>
      {legenda && <p className="mt-0.5 text-xs text-fl-ink-2">{legenda}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default function AnalisesPage() {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())
  const [dados, setDados] = useState<Dados | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [logado, setLogado] = useState(true)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await fetch(`/api/analises?mes=${mes}&ano=${ano}`)
      if (res.status === 401) { setLogado(false); return }
      setDados(await res.json())
    } catch {
      // mantém o último estado válido
    } finally {
      setCarregando(false)
    }
  }, [mes, ano])

  useEffect(() => { carregar() }, [carregar])

  if (!logado) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-fl-page px-6 text-center">
        <p className="text-fl-ink-2">Entra na sua conta pra ver suas análises.</p>
        <Link href="/login" className="rounded-full bg-fl-500 px-6 py-3 text-sm font-semibold text-white">
          Entrar
        </Link>
      </main>
    )
  }

  const ind = dados?.indicadores
  const kpis: { rotulo: string; valor: number; destaque?: boolean }[] = [
    { rotulo: "Receita do mês", valor: ind?.receita ?? 0 },
    { rotulo: "Despesas", valor: ind?.despesa ?? 0 },
    { rotulo: "Economia", valor: ind?.economia ?? 0, destaque: true },
    { rotulo: "Investimentos", valor: ind?.investimentos ?? 0 },
    { rotulo: "Patrimônio", valor: ind?.patrimonio ?? 0, destaque: true },
  ]

  return (
    <main className="min-h-dvh bg-fl-page pb-24">
      <div className="mx-auto w-full max-w-md px-5 py-6">
        <header className="flex flex-col gap-4">
          <div>
            <h1 className="text-[26px] font-extrabold tracking-tight text-fl-ink">Análises</h1>
            <p className="text-sm text-fl-ink-2">Sua situação financeira, visualmente.</p>
          </div>
          <SeletorMes mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a) }} />
        </header>

        {/* indicadores rápidos — cinco "R$ 0,00" acima do estado vazio só poluem */}
        {dados?.temDados && (
        <section className="mt-5 grid grid-cols-2 gap-2.5" aria-label="Indicadores do mês">
          {kpis.map((k, i) => (
            <div
              key={k.rotulo}
              className={`rounded-2xl border border-fl-border bg-white px-4 py-3 ${
                i === kpis.length - 1 ? "col-span-2" : ""
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wide text-fl-ink-2">{k.rotulo}</div>
              <div
                className={`mt-0.5 text-lg font-extrabold tabular-nums tracking-tight ${
                  k.destaque && k.valor < 0 ? "text-fl-accent-dark" : k.destaque ? "text-fl-success" : "text-fl-ink"
                }`}
              >
                {brl(k.valor)}
              </div>
            </div>
          ))}
        </section>
        )}

        {carregando && !dados ? (
          <div className="mt-10 flex justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-fl-500 border-t-transparent" />
          </div>
        ) : !dados?.temDados ? (
          <div className="mt-8 rounded-[20px] border border-fl-border bg-white p-6 text-center">
            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-fl-50">
              <TrendingUp className="size-5 text-fl-500" />
            </div>
            <p className="text-[15px] font-bold text-fl-ink">Nada pra mostrar ainda</p>
            <p className="mt-1.5 text-sm leading-relaxed text-fl-ink-2">
              Registre suas entradas e saídas e os gráficos aparecem aqui — evolução do patrimônio,
              gastos por categoria e fluxo de caixa.
            </p>
            <Link
              href="/painel"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-fl-500 px-5 py-3 text-sm font-semibold text-white"
            >
              <Plus className="size-4" /> Registrar lançamentos
            </Link>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            <Secao titulo="Evolução do patrimônio" legenda="Acumulado das entradas menos as saídas, mês a mês">
              <GraficoLinha pontos={dados.patrimonio.map((p) => ({ rotulo: p.rotulo, valor: p.patrimonio }))} />
            </Secao>

            <Secao titulo="Gastos por categoria" legenda="Onde o dinheiro foi neste mês">
              <GraficoRosca fatias={dados.categorias} />
            </Secao>

            <Secao titulo="Receitas × Despesas" legenda="Compare mês a mês e identifique os deficitários">
              <GraficoBarras meses={dados.receitasDespesas} />
            </Secao>

            <Secao titulo="Fluxo de caixa diário" legenda="Saldo ao longo do mês — ajuda a prever o aperto">
              <GraficoLinha
                pontos={dados.fluxoDiario.map((p) => ({ rotulo: String(p.dia), valor: p.saldo }))}
                mostrarZero
              />
            </Secao>

            <Link
              href="/painel"
              className="flex items-center justify-center gap-2 rounded-2xl border border-fl-border bg-white py-4 text-sm font-semibold text-fl-500 transition-colors hover:bg-fl-50"
            >
              <Plus className="size-4" /> Registrar ou editar lançamentos
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
