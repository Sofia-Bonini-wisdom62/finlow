"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { BookText, ChartColumn, Trophy, Wallet } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { GraficoRosca } from "@/components/analises/GraficoRosca"
import type { MetricasPerfil, FatiaCategoria } from "@/lib/financas"

/**
 * Perfil: retrato de um minuto.
 *
 * A ordem é para onde foi o dinheiro, o que isso quer dizer, e para onde ir.
 * Rosca, leituras, portas. Nada de número solto no meio.
 *
 * OS KPIs SAÍRAM DAQUI
 * Taxa de economia, controle orçamentário, reserva e consistência foram para
 * Análises. São quatro percentuais que exigem interpretação, e num retrato eles
 * competiam com a rosca e com as leituras pela mesma atenção — as leituras
 * dizem em português a mesma coisa que os percentuais dizem em número, e em
 * português ganha. Quem quer o número atrás da frase toca em Análises.
 */

interface Perfil {
  nome: string
  email: string | null
  image: string | null
  nivel: string
  resumo: string
  metricas: MetricasPerfil
  categorias: FatiaCategoria[]
  mesRosca: string
  pontos: number
  noRanking: boolean
  insights: { texto: string; tipo: string }[]
}

/** As quatro portas. Mesma forma para as quatro: nenhuma é mais importante,
 *  e tamanhos diferentes fariam a pessoa achar que uma é a principal. */
function Porta({
  href, Icon, titulo, nota,
}: {
  href: string
  Icon: typeof BookText
  titulo: string
  nota: string
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1.5 rounded-[20px] border border-fl-border bg-fl-card p-4 transition-colors hover:border-fl-500/40 hover:bg-fl-50/50"
    >
      <Icon className="size-5 text-fl-500" />
      <span className="text-[14.5px] font-bold text-fl-ink">{titulo}</span>
      <span className="text-[12px] leading-snug text-fl-ink-2">{nota}</span>
    </Link>
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

  const inicial = perfil.nome.trim().charAt(0).toUpperCase() || "?"
  const temGastos = perfil.categorias?.length > 0

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

        {/* A rosca abre a página: "para onde foi o meu dinheiro" é a pergunta
            que traz alguém ao Perfil, e ela se responde de relance.

            A legenda não é clicável aqui de propósito. Em Análises tocar abre
            os lançamentos da categoria; repetir isso no Perfil daria dois
            lugares para a mesma tela e dois lugares para manter. O Perfil é
            retrato, e a porta para cavar está logo abaixo. */}
        <section className="mt-6" aria-label="Saídas por categoria">
          <div className="rounded-[20px] border border-fl-border bg-fl-card p-5">
            <h2 className="text-[15px] font-bold text-fl-ink">Para onde foi</h2>
            <p className="mt-0.5 text-xs text-fl-ink-2">
              {temGastos
                ? `Suas saídas em ${perfil.mesRosca}`
                : "Aparece assim que você registrar as primeiras saídas"}
            </p>
            {/* Sem gasto, só a legenda acima. O gráfico tem mensagem própria
                de vazio, e as duas juntas diriam a mesma coisa duas vezes. */}
            {temGastos && (
              <div className="mt-4">
                <GraficoRosca fatias={perfil.categorias} />
              </div>
            )}
            {!temGastos && (
              <Link href="/extrato" className="mt-3 inline-block text-[13px] font-semibold text-fl-500">
                Subir o extrato do banco
              </Link>
            )}
          </div>
        </section>

        {/* As leituras vêm logo depois porque dizem em português o que a rosca
            mostra em fatia. Uma explica a outra. */}
        {perfil.insights?.length > 0 && (
          <section className="mt-4 space-y-2" aria-label="Leituras do seu mês">
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

        {/* Sem leitura ainda, o resumo faz o papel: uma frase é melhor que um
            buraco entre a rosca e os botões. */}
        {!perfil.insights?.length && (
          <p className="mt-4 rounded-2xl bg-fl-sand px-4 py-3.5 text-[14.5px] leading-relaxed text-fl-sand-text">
            {perfil.resumo}
          </p>
        )}

        {/* As quatro portas. */}
        <section className="mt-6 grid grid-cols-2 gap-2.5" aria-label="Onde ir">
          <Porta href="/trilha" Icon={BookText} titulo="Trilha" nota="Aulas escolhidas pelos seus números" />
          <Porta
            href="/ranking"
            Icon={Trophy}
            titulo="Ranking"
            nota={`${perfil.pontos} ${perfil.pontos === 1 ? "ponto" : "pontos"} · ${perfil.noRanking ? "você está dentro" : "entrar é opcional"}`}
          />
          <Porta href="/analises" Icon={ChartColumn} titulo="Análises" nota="Saúde financeira, gráficos e tetos" />
          <Porta href="/painel" Icon={Wallet} titulo="Painel" nota="Lançamentos e contas fixas" />
        </section>
      </div>

      <BottomNav />
    </main>
  )
}
