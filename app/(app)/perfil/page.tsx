"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Search, ArrowRight, Check, X } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import type { MetricasPerfil } from "@/lib/financas"

interface Perfil {
  nome: string
  email: string | null
  image: string | null
  nivel: string
  resumo: string
  metricas: MetricasPerfil
}

interface ModuloCard {
  id: string
  slug: string
  titulo: string
  subtitulo: string
  dificuldade: string
  duracao: string
  progresso: number
  concluido: boolean
}

function Metrica({ rotulo, valor, nota, barra }: { rotulo: string; valor: string; nota?: string; barra?: number }) {
  return (
    <div className="rounded-2xl border border-fl-border bg-fl-card px-4 py-3.5">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-fl-ink-2">{rotulo}</div>
      <div className="mt-0.5 text-xl font-extrabold tabular-nums tracking-tight text-fl-ink">{valor}</div>
      {barra !== undefined && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-fl-divider">
          <div className="h-full rounded-full bg-fl-500 transition-all" style={{ width: `${Math.min(100, barra)}%` }} />
        </div>
      )}
      {nota && <div className="mt-1.5 text-[11px] leading-snug text-fl-ink-3">{nota}</div>}
    </div>
  )
}

function CardModulo({ m }: { m: ModuloCard }) {
  return (
    <div className="rounded-2xl border border-fl-border bg-fl-card p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-bold leading-snug text-fl-ink">{m.titulo}</h3>
        {m.concluido && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-fl-success/10 px-2 py-0.5 text-[10.5px] font-bold text-fl-success">
            <Check className="size-3" /> feito
          </span>
        )}
      </div>
      <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-fl-ink-2">{m.subtitulo}</p>

      <div className="mt-2.5 flex items-center gap-2 text-[11px] text-fl-ink-3">
        <span className="rounded-full bg-fl-50 px-2 py-0.5 font-semibold text-fl-500">{m.dificuldade}</span>
        <span>{m.duracao}</span>
      </div>

      {m.progresso > 0 && !m.concluido && (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-fl-divider">
            <div className="h-full rounded-full bg-fl-500" style={{ width: `${m.progresso}%` }} />
          </div>
          <div className="mt-1 text-[10.5px] text-fl-ink-3">{m.progresso}% concluído</div>
        </div>
      )}

      <Link
        href={`/trilha/${m.slug}`}
        className="mt-3.5 flex items-center justify-center gap-1.5 rounded-xl bg-fl-500 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-fl-600"
      >
        {m.concluido ? "Revisitar" : m.progresso > 0 ? "Continuar" : "Começar"}
        <ArrowRight className="size-4" />
      </Link>
    </div>
  )
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [recomendados, setRecomendados] = useState<ModuloCard[]>([])
  const [carregando, setCarregando] = useState(true)
  const [logado, setLogado] = useState(true)
  const [erro, setErro] = useState(false)

  const [busca, setBusca] = useState("")
  const [resultados, setResultados] = useState<ModuloCard[] | null>(null)
  const [buscando, setBuscando] = useState(false)

  const carregar = useCallback(() => {
    setCarregando(true)
    setErro(false)
    Promise.all([
      fetch("/api/perfil-financeiro").then(async (r) => {
        if (r.status === 401) return { deslogado: true as const }
        // Um 500 devolve {error: "..."} — objeto truthy. Aceitar isso como
        // perfil válido fazia `perfil.metricas` virar undefined e o render
        // estourar em `m.mesesComDados`, derrubando a árvore React: a tela
        // ficava congelada em vez de mostrar que algo falhou.
        if (!r.ok) return { falhou: true as const }
        const j = await r.json()
        return j && j.metricas ? { perfil: j as Perfil } : { falhou: true as const }
      }),
      fetch("/api/modulos").then((r) => (r.ok ? r.json() : { recomendados: [] })),
    ])
      .then(([p, m]) => {
        if ("deslogado" in p) { setLogado(false); return }
        if ("falhou" in p) { setErro(true); return }
        setPerfil(p.perfil)
        setRecomendados(m.recomendados ?? [])
      })
      .catch(() => setErro(true))
      .finally(() => setCarregando(false))
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // busca com debounce
  useEffect(() => {
    const termo = busca.trim()
    if (termo.length < 2) { setResultados(null); return }

    setBuscando(true)
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/modulos?q=${encodeURIComponent(termo)}`)
        const d = await r.json()
        setResultados(d.resultados ?? [])
      } catch {
        setResultados([])
      } finally {
        setBuscando(false)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [busca])

  if (carregando) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-fl-page">
        <div className="size-6 animate-spin rounded-full border-2 border-fl-500 border-t-transparent" />
      </main>
    )
  }

  if (erro) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-fl-page px-6 text-center">
        <div>
          <p className="text-[15px] font-bold text-fl-ink">Não deu pra carregar seu perfil</p>
          <p className="mt-1.5 text-sm text-fl-ink-2">
            Alguma coisa falhou ao buscar seus números. Nada foi perdido.
          </p>
        </div>
        <button onClick={carregar} className="rounded-full bg-fl-500 px-6 py-3 text-sm font-semibold text-primary-foreground">
          Tentar de novo
        </button>
        <BottomNav />
      </main>
    )
  }

  if (!logado || !perfil) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-fl-page px-6 text-center">
        <p className="text-fl-ink-2">Entra na sua conta pra ver seu perfil.</p>
        <Link href="/login" className="rounded-full bg-fl-500 px-6 py-3 text-sm font-semibold text-primary-foreground">
          Entrar
        </Link>
      </main>
    )
  }

  const m = perfil.metricas
  const inicial = perfil.nome.trim().charAt(0).toUpperCase() || "?"

  return (
    <main className="min-h-dvh bg-fl-page pb-24 lg:pb-10 lg:pl-56">
      <div className="mx-auto w-full max-w-md px-5 py-6 md:max-w-2xl md:px-8 lg:max-w-3xl lg:px-10">
        {/* cabeçalho */}
        <header className="flex items-center gap-3.5">
          {perfil.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={perfil.image} alt="" className="size-14 rounded-full object-cover" />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-full bg-fl-100 text-xl font-extrabold text-fl-500">
              {inicial}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold tracking-tight text-fl-ink">{perfil.nome}</h1>
            <p className="text-sm text-fl-500">{perfil.nivel}</p>
          </div>
        </header>

        {/* resumo */}
        <p className="mt-5 rounded-2xl bg-fl-sand px-4 py-3.5 text-[14.5px] leading-relaxed text-fl-sand-text">
          {perfil.resumo}
        </p>

        {/* métricas — sem histórico, os valores são desconhecidos, não zero:
            mostrar "0%" leria como "você está mal" em vez de "ainda não sei" */}
        {(() => {
          const vazio = m.mesesComDados === 0
          const v = (texto: string) => (vazio ? "—" : texto)
          const b = (n: number) => (vazio ? undefined : n)
          return (
            <section className="mt-5 grid grid-cols-2 gap-2.5" aria-label="Métricas financeiras">
              <div className="col-span-2">
                <Metrica
                  rotulo="Índice de saúde financeira"
                  valor={vazio ? "—" : `${m.saudeFinanceira}/100`}
                  barra={b(m.saudeFinanceira)}
                  nota={
                    vazio
                      ? "Aparece depois do seu primeiro mês de lançamentos"
                      : `Composto de economia, controle, reserva e consistência · ${m.mesesComDados} ${m.mesesComDados === 1 ? "mês" : "meses"} de dados`
                  }
                />
              </div>
              <Metrica rotulo="Taxa de economia" valor={v(`${m.taxaEconomia}%`)} nota="da renda" barra={b(m.taxaEconomia)} />
              <Metrica rotulo="Controle orçamentário" valor={v(`${m.controleOrcamentario}%`)} nota="meses no orçamento" barra={b(m.controleOrcamentario)} />
              <Metrica rotulo="Reserva de emergência" valor={v(`${m.reservaEmergencia.toLocaleString("pt-BR")} meses`)} nota="de despesa coberta" barra={b((m.reservaEmergencia / 6) * 100)} />
              <Metrica rotulo="Consistência" valor={v(`${m.consistencia}%`)} nota="meses com sobra" barra={b(m.consistencia)} />
            </section>
          )
        })()}

        {/* trilha recomendada */}
        <section className="mt-8">
          <h2 className="text-[17px] font-extrabold tracking-tight text-fl-ink">Recomendado para você</h2>
          <p className="mt-0.5 text-[13px] leading-relaxed text-fl-ink-2">
            Sequência montada a partir dos seus números, atualiza conforme seu comportamento muda.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {recomendados.length === 0 ? (
              <p className="text-sm text-fl-ink-2">Nenhum módulo disponível no momento.</p>
            ) : (
              recomendados.map((mod) => <CardModulo key={mod.id} m={mod} />)
            )}
          </div>
        </section>

        {/* busca */}
        <section className="mt-8">
          <h2 className="text-[17px] font-extrabold tracking-tight text-fl-ink">Pesquisar qualquer assunto</h2>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-fl-ink-3" />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquise por investimentos, cartão de crédito, orçamento, renda extra..."
              aria-label="Pesquisar módulos"
              className="w-full rounded-2xl border border-fl-border bg-fl-card py-3.5 pl-11 pr-10 text-sm text-fl-ink placeholder-fl-ink-3 outline-none focus:border-fl-500"
            />
            {busca && (
              <button
                aria-label="Limpar busca"
                onClick={() => setBusca("")}
                className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-fl-ink-2 hover:bg-fl-divider"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {buscando && <p className="mt-3 text-sm text-fl-ink-2">Buscando…</p>}

          {!buscando && resultados !== null && (
            <div className="mt-4 flex flex-col gap-3">
              {resultados.length === 0 ? (
                <p className="text-sm text-fl-ink-2">
                  Nada encontrado para <strong className="text-fl-ink">“{busca}”</strong>. Tenta outra palavra?
                </p>
              ) : (
                <>
                  <p className="text-xs text-fl-ink-2">
                    {resultados.length} {resultados.length === 1 ? "módulo" : "módulos"}
                  </p>
                  {resultados.map((mod) => <CardModulo key={mod.id} m={mod} />)}
                </>
              )}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </main>
  )
}
