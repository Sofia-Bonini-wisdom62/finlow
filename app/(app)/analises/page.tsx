"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Plus, TrendingUp, Upload } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { SeletorMes, NOMES_MESES } from "@/components/painel/SeletorMes"
import { GraficoLinha } from "@/components/analises/GraficoLinha"
import { GraficoRosca } from "@/components/analises/GraficoRosca"
import { GraficoBarras } from "@/components/analises/GraficoBarras"
import { brl } from "@/lib/formato"
import type { Indicadores, PontoPatrimonio, FatiaCategoria, BarraMes, PontoDia } from "@/lib/financas"

interface Dados {
  temDados: boolean
  temDadosNoMes: boolean
  mesAnterior: { mes: number; ano: number } | null
  indicadores: Indicadores
  patrimonio: PontoPatrimonio[]
  categorias: FatiaCategoria[]
  receitasDespesas: BarraMes[]
  fluxoDiario: PontoDia[]
}

function Aviso({ titulo, texto, acao }: { titulo: string; texto: string; acao?: React.ReactNode }) {
  return (
    <div className="mt-8 rounded-[20px] border border-fl-border bg-fl-card p-6 text-center">
      <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-fl-50">
        <TrendingUp className="size-5 text-fl-500" />
      </div>
      <p className="text-[15px] font-bold text-fl-ink">{titulo}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-fl-ink-2">{texto}</p>
      {acao}
    </div>
  )
}

function Secao({ titulo, legenda, children }: { titulo: string; legenda?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border border-fl-border bg-fl-card p-5">
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
  const [erro, setErro] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(false)
    try {
      const res = await fetch(`/api/analises?mes=${mes}&ano=${ano}`)
      if (res.status === 401) { setLogado(false); return }
      if (!res.ok) throw new Error("falhou")
      setDados(await res.json())
    } catch {
      // Manter os números do mês anterior sob o cabeçalho do novo mês seria
      // mostrar dado errado com cara de dado certo. Melhor descartar e avisar.
      setDados(null)
      setErro(true)
    } finally {
      setCarregando(false)
    }
  }, [mes, ano])

  useEffect(() => { carregar() }, [carregar])

  if (!logado) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-fl-page px-6 text-center">
        <p className="text-fl-ink-2">Entra na sua conta pra ver suas análises.</p>
        <Link href="/login" className="rounded-full bg-fl-500 px-6 py-3 text-sm font-semibold text-primary-foreground">
          Entrar
        </Link>
      </main>
    )
  }

  const ind = dados?.indicadores
  // "Guardado" fica FORA de Entradas e Saídas: cofrinho, reserva e aplicação são
  // bolsos da própria pessoa, e contar isso como saída dizia "você se
  // descontrolou" no mês em que ela mais guardou. "Acumulado" atravessa meses.
  // Os dois precisam dizer isso, senão o usuário soma tudo e a conta não fecha.
  const kpis: { rotulo: string; valor: number; nota?: string; destaque?: boolean }[] = [
    { rotulo: "Entradas", valor: ind?.receita ?? 0 },
    { rotulo: "Saídas", valor: ind?.despesa ?? 0 },
    { rotulo: "Sobrou", valor: ind?.economia ?? 0, nota: "entradas − saídas", destaque: true },
    { rotulo: "Guardado", valor: ind?.investimentos ?? 0, nota: "cofrinho e reserva — fora das saídas" },
    { rotulo: "Acumulado", valor: ind?.acumulado ?? 0, nota: "desde o 1º registro até este mês", destaque: true },
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

        {/* indicadores rápidos — só quando o mês selecionado tem lançamento */}
        {dados?.temDadosNoMes && (
        <section className="mt-5 grid grid-cols-2 gap-2.5" aria-label={`Indicadores de ${NOMES_MESES[mes - 1]} de ${ano}`}>
          {kpis.map((k, i) => (
            <div
              key={k.rotulo}
              className={`rounded-2xl border border-fl-border bg-fl-card px-4 py-3 ${
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
              {k.nota && <div className="mt-0.5 text-[10.5px] leading-snug text-fl-ink-3">{k.nota}</div>}
            </div>
          ))}
        </section>
        )}

        {carregando ? (
          <div className="mt-10 flex justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-fl-500 border-t-transparent" />
          </div>
        ) : erro ? (
          <Aviso
            titulo="Não deu pra carregar"
            texto="Alguma coisa falhou ao buscar seus lançamentos. Os números de outro mês não aparecem aqui pra não confundir."
            acao={
              <button
                onClick={carregar}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-fl-500 px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                Tentar de novo
              </button>
            }
          />
        ) : !dados?.temDados ? (
          <Aviso
            titulo="Nada pra mostrar ainda"
            texto="Registre suas entradas e saídas e os gráficos aparecem aqui — evolução do acumulado, gastos por categoria e fluxo de caixa."
            acao={
              <div className="mt-4 flex flex-col items-center gap-2">
                <Link
                  href="/extrato"
                  className="inline-flex items-center gap-1.5 rounded-full bg-fl-500 px-5 py-3 text-sm font-semibold text-primary-foreground"
                >
                  <Upload className="size-4" /> Subir extrato do banco
                </Link>
                <Link href="/painel" className="text-sm font-semibold text-fl-500">
                  Ou lançar na mão
                </Link>
              </div>
            }
          />
        ) : !dados.temDadosNoMes ? (
          <Aviso
            titulo={`Nenhum lançamento em ${NOMES_MESES[mes - 1]}`}
            texto="Você tem lançamentos em outros meses — este está vazio. Gráficos com zeros não diriam nada sobre suas finanças."
            acao={
              <div className="mt-4 flex flex-col items-center gap-2">
                {dados.mesAnterior && (
                  <button
                    onClick={() => { setMes(dados.mesAnterior!.mes); setAno(dados.mesAnterior!.ano) }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-fl-500 px-5 py-3 text-sm font-semibold text-primary-foreground"
                  >
                    Ver {NOMES_MESES[dados.mesAnterior.mes - 1].toLowerCase()} de {dados.mesAnterior.ano}
                  </button>
                )}
                <Link href="/painel" className="text-sm font-semibold text-fl-500">
                  Registrar lançamentos deste mês
                </Link>
              </div>
            }
          />
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            <Secao
              titulo="Evolução do acumulado"
              legenda={`Entradas menos saídas, somadas mês a mês até ${NOMES_MESES[mes - 1].toLowerCase()}`}
            >
              <GraficoLinha
                pontos={dados.patrimonio.map((p) => ({ rotulo: p.rotulo, valor: p.patrimonio }))}
                mostrarZero
              />
            </Secao>

            <Secao titulo="Saídas por categoria" legenda={`Onde o dinheiro foi em ${NOMES_MESES[mes - 1].toLowerCase()}`}>
              <GraficoRosca fatias={dados.categorias} />
            </Secao>

            <Secao
              titulo="Entradas × Saídas"
              legenda={`Últimos meses até ${NOMES_MESES[mes - 1].toLowerCase()} — o marcador aponta os deficitários`}
            >
              <GraficoBarras meses={dados.receitasDespesas} />
            </Secao>

            <Secao
              titulo="Fluxo de caixa diário"
              legenda="Quanto entrou menos quanto saiu ao longo do mês, dia a dia — começa do zero, não é saldo de conta"
            >
              <GraficoLinha
                pontos={dados.fluxoDiario.map((p) => ({ rotulo: String(p.dia), valor: p.saldo }))}
                mostrarZero
              />
            </Secao>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/extrato"
                className="flex items-center justify-center gap-2 rounded-2xl bg-fl-500 py-4 text-sm font-semibold text-primary-foreground"
              >
                <Upload className="size-4" /> Subir extrato do banco
              </Link>
              <Link
                href="/painel"
                className="flex items-center justify-center gap-2 rounded-2xl border border-fl-border bg-fl-card py-4 text-sm font-semibold text-fl-500 transition-colors hover:bg-fl-50"
              >
                <Plus className="size-4" /> Registrar ou editar lançamentos
              </Link>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
