"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, BookText, ChartColumn, Trophy, Wallet } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import type { MetricasPerfil } from "@/lib/financas"

interface Perfil {
  nome: string
  email: string | null
  image: string | null
  nivel: string
  resumo: string
  metricas: MetricasPerfil
  pontos: number
  noRanking: boolean
  insights: { texto: string; tipo: string }[]
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

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [logado, setLogado] = useState(true)
  const [erro, setErro] = useState(false)

  const carregar = useCallback(() => {
    setCarregando(true)
    setErro(false)
    Promise.resolve(
      fetch("/api/perfil-financeiro").then(async (r) => {
        if (r.status === 401) return { deslogado: true as const }
        // Um 500 devolve {error: "..."} — objeto truthy. Aceitar isso como
        // perfil válido fazia `perfil.metricas` virar undefined e o render
        // estourar em `m.mesesComDados`, derrubando a árvore React: a tela
        // ficava congelada em vez de mostrar que algo falhou.
        if (!r.ok) return { falhou: true as const }
        const j = await r.json()
        return j && j.metricas ? { perfil: j as Perfil } : { falhou: true as const }
      })
    )
      .then((p) => {
        if ("deslogado" in p) { setLogado(false); return }
        if ("falhou" in p) { setErro(true); return }
        setPerfil(p.perfil)
      })
      .catch(() => setErro(true))
      .finally(() => setCarregando(false))
  }, [])

  useEffect(() => { carregar() }, [carregar])

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

        {/* As três leituras do mês, escritas quando o onboarding fechou.
            Ficam ANTES da trilha porque respondem "o que os meus números
            dizem", que é a pergunta que traz a pessoa ao Perfil. */}
        {perfil.insights?.length > 0 && (
          <section className="mt-6 space-y-2" aria-label="Leituras do seu mês">
            {perfil.insights.map((i) => (
              <div
                key={i.texto}
                className="flex gap-2.5 rounded-2xl border border-fl-border bg-fl-card px-4 py-3.5"
              >
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 shrink-0 rounded-full"
                  style={{ background: i.tipo === "alerta" || i.tipo === "divida" ? "var(--fl-accent)" : "var(--fl-500)" }}
                />
                <p className="text-[13.5px] leading-relaxed text-fl-ink">{i.texto}</p>
              </div>
            ))}
          </section>
        )}

        {/* A trilha saiu daqui: virou aba própria. Fica um convite curto, não
            a lista inteira, porque duplicar a Trilha dentro do Perfil daria
            dois lugares para manter e nenhum dono claro. */}
        <section className="mt-8">
          <Link
            href="/trilha"
            className="flex items-center gap-3 rounded-[20px] border border-fl-border bg-fl-card p-5 transition-colors hover:border-fl-500/40 hover:bg-fl-50/50"
          >
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-fl-50">
              <BookText className="size-5 text-fl-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-fl-ink">Sua trilha</p>
              <p className="mt-0.5 text-[13px] leading-snug text-fl-ink-2">
                Aulas de dois minutos, escolhidas a partir dos seus números.
              </p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-fl-ink-3" />
          </Link>
        </section>

        {/* Score: pontos e a porta do ranking (§2.10). Fica ANTES do DASH
            porque é leitura de um segundo, e o DASH é para quem quer cavar. */}
        <Link
          href="/ranking"
          className="mt-4 flex items-center gap-3 rounded-[20px] border border-fl-border bg-fl-card p-5 transition-colors hover:border-fl-500/40 hover:bg-fl-50/50"
        >
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-fl-50">
            <Trophy className="size-5 text-fl-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold text-fl-ink">
              <span className="tabular-nums">{perfil.pontos}</span>{" "}
              {perfil.pontos === 1 ? "ponto" : "pontos"}
            </p>
            <p className="mt-0.5 text-[13px] leading-snug text-fl-ink-2">
              {perfil.noRanking
                ? "Você está no ranking. Toca pra ver sua posição."
                : "O ranking é opcional. Toca pra ver como funciona."}
            </p>
          </div>
          <ArrowRight className="size-4 shrink-0 text-fl-ink-3" />
        </Link>

        {/* DASH: a profundidade do Perfil. Análises e Painel deixaram de ser
            abas e passam por aqui. */}
        <section className="mt-4 grid grid-cols-2 gap-2.5">
          <Link
            href="/analises"
            className="flex flex-col gap-1.5 rounded-[20px] border border-fl-border bg-fl-card p-4 transition-colors hover:border-fl-500/40 hover:bg-fl-50/50"
          >
            <ChartColumn className="size-5 text-fl-500" />
            <span className="text-[14.5px] font-bold text-fl-ink">Análises</span>
            <span className="text-[12px] leading-snug text-fl-ink-2">Gráficos, categorias e tetos</span>
          </Link>
          <Link
            href="/painel"
            className="flex flex-col gap-1.5 rounded-[20px] border border-fl-border bg-fl-card p-4 transition-colors hover:border-fl-500/40 hover:bg-fl-50/50"
          >
            <Wallet className="size-5 text-fl-500" />
            <span className="text-[14.5px] font-bold text-fl-ink">Painel</span>
            <span className="text-[12px] leading-snug text-fl-ink-2">Lançamentos e contas fixas</span>
          </Link>
        </section>
      </div>

      <BottomNav />
    </main>
  )
}
