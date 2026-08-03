"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Search, X, BookOpen, ChevronDown } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { CardModulo, type ModuloCard } from "@/components/trilha/CardModulo"

/**
 * Trilha: aba própria, na ordem do quadro.
 *
 * Busca, Recomendados, cards, "Todos…". A busca fica no TOPO de propósito:
 * quem chega com uma dúvida ("como funciona juros do cartão") não quer
 * percorrer uma lista curada antes de perguntar.
 *
 * Nenhum módulo é bloqueado por sequência. A trilha é biblioteca posicionada,
 * não corredor: travar a aula 3 até concluir a 2 transforma quem veio tirar uma
 * dúvida específica em alguém que desiste.
 */

const ATRASO_BUSCA = 320

export default function TrilhaPage() {
  const [recomendados, setRecomendados] = useState<ModuloCard[]>([])
  const [concluidas, setConcluidas] = useState(0)
  const [totalLeva, setTotalLeva] = useState(0)
  const [todos, setTodos] = useState<ModuloCard[]>([])
  const [carregando, setCarregando] = useState(true)
  const [logado, setLogado] = useState(true)
  const [erro, setErro] = useState(false)

  const [busca, setBusca] = useState("")
  /**
   * O resultado guarda o TERMO que o produziu.
   *
   * Sem isso eu precisaria limpar o estado no corpo do efeito toda vez que a
   * busca encurtasse, e setState síncrono dentro de efeito dispara renderização
   * em cascata. Guardando o termo junto, a tela simplesmente ignora resultado
   * que não é da pergunta atual.
   */
  const [resultados, setResultados] = useState<{ termo: string; itens: ModuloCard[] } | null>(null)
  const [mostrarTodos, setMostrarTodos] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(false)
    try {
      const r = await fetch("/api/modulos")
      if (r.status === 401) { setLogado(false); return }
      if (!r.ok) throw new Error("falhou")
      const d = await r.json()
      setRecomendados(d.recomendados ?? [])
      setConcluidas(d.concluidasDaLeva ?? 0)
      setTotalLeva(d.totalDaLeva ?? 0)
      setTodos(d.todos ?? d.modulos ?? [])
    } catch {
      setErro(true)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // Espera a pessoa parar de digitar. Uma busca por tecla dispararia uma
  // consulta a cada letra e a lista piscaria enquanto ela ainda escreve.
  useEffect(() => {
    const termo = busca.trim()
    if (termo.length < 2) return
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/modulos?q=${encodeURIComponent(termo)}`)
        const d = await r.json()
        setResultados({ termo, itens: d.resultados ?? d.modulos ?? [] })
      } catch {
        setResultados({ termo, itens: [] })
      }
    }, ATRASO_BUSCA)
    return () => clearTimeout(t)
  }, [busca])

  if (!logado) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-fl-page px-6 text-center">
        <p className="text-fl-ink-2">Entra na sua conta pra ver a trilha.</p>
        <Link href="/login" className="rounded-full bg-fl-500 px-6 py-3 text-sm font-semibold text-primary-foreground">
          Entrar
        </Link>
      </main>
    )
  }

  const termo = busca.trim()
  const emBusca = termo.length >= 2
  // Resultado de outra pergunta não conta como resposta desta.
  const achados = resultados?.termo === termo ? resultados.itens : null

  return (
    <main className="min-h-dvh bg-fl-page pb-24 lg:pb-10 lg:pl-56">
      <div className="mx-auto w-full max-w-md px-5 py-6 md:max-w-2xl md:px-8 lg:max-w-4xl lg:px-10">
        <h1 className="text-[26px] font-extrabold tracking-tight text-fl-ink">Trilha</h1>
        <p className="text-sm text-fl-ink-2">Aulas de dois minutos, na ordem que faz sentido pra você.</p>

        {/* busca no topo: quem chega com dúvida não quer percorrer curadoria */}
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-fl-ink-3" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por assunto: cartão, reserva, juros…"
            aria-label="Buscar aulas"
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

        {carregando ? (
          <div className="mt-10 flex justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-fl-500 border-t-transparent" />
          </div>
        ) : erro ? (
          <div className="mt-8 rounded-[20px] border border-fl-border bg-fl-card p-6 text-center">
            <p className="text-[15px] font-bold text-fl-ink">Não deu pra carregar</p>
            <button
              onClick={carregar}
              className="mt-4 rounded-full bg-fl-500 px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Tentar de novo
            </button>
          </div>
        ) : emBusca ? (
          <section className="mt-6">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-fl-ink-2">
              {achados === null ? "Buscando…" : `${achados.length} resultado${achados.length === 1 ? "" : "s"}`}
            </h2>
            <div className="mt-3 flex flex-col gap-2.5 md:grid md:grid-cols-2 md:items-start">
              {(achados ?? []).map((m) => <CardModulo key={m.id} m={m} />)}
            </div>
            {achados?.length === 0 && (
              <p className="mt-4 text-sm text-fl-ink-2">
                Nada com esse termo. Tenta uma palavra mais geral, ou pergunta direto no{" "}
                <Link href="/chat" className="font-semibold text-fl-500">Chat</Link>.
              </p>
            )}
          </section>
        ) : (
          <>
            <section className="mt-7">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-[17px] font-extrabold tracking-tight text-fl-ink">Recomendados</h2>
                {/* A leva só some inteira, então o contador é o que mostra o
                    quanto falta para ela fechar. */}
                {concluidas > 0 && (
                  <span className="shrink-0 text-[12.5px] font-semibold text-fl-500">
                    {concluidas} de {totalLeva} {totalLeva === 1 ? "concluída" : "concluídas"}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[13px] leading-relaxed text-fl-ink-2">
                Quatro aulas escolhidas a partir dos seus números. Elas ficam aqui até você
                fechar as quatro, e aí entram outras.
              </p>

              {recomendados.length === 0 ? (
                /* Vazio aqui quer dizer duas coisas diferentes, e a pessoa
                   precisa saber qual: ou ela fechou tudo que foi indicado, ou
                   ainda não há indicação nenhuma. */
                <div className="mt-3.5 rounded-[20px] border border-fl-border bg-fl-card p-5">
                  {concluidas > 0 ? (
                    <>
                      <p className="text-[15px] font-bold text-fl-ink">
                        Leva fechada. Você terminou as quatro.
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-fl-ink-2">
                        As próximas são montadas a partir dos seus números de agora. Abre o{" "}
                        <Link href="/chat" className="font-semibold text-fl-500">Chat</Link> que
                        elas chegam por lá, ou procura um assunto na busca aqui em cima.
                      </p>
                    </>
                  ) : (
                    <p className="text-[13.5px] leading-relaxed text-fl-ink-2">
                      Ainda não tenho o que indicar. Registra alguns gastos e eu monto sua
                      trilha a partir deles.
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-3.5 flex flex-col gap-2.5 md:grid md:grid-cols-2 md:items-start">
                  {recomendados.map((m) => <CardModulo key={m.id} m={m} />)}
                </div>
              )}
            </section>

            <section className="mt-8">
              <button
                onClick={() => setMostrarTodos((v) => !v)}
                aria-expanded={mostrarTodos}
                className="flex w-full items-center justify-between gap-2 rounded-2xl border border-fl-border bg-fl-card px-4 py-3.5 text-left transition-colors hover:bg-fl-50"
              >
                <span className="flex items-center gap-2.5 text-[14.5px] font-semibold text-fl-ink">
                  <BookOpen className="size-4 text-fl-ink-2" />
                  Todos os módulos
                  <span className="text-[12.5px] font-normal text-fl-ink-3">({todos.length})</span>
                </span>
                <ChevronDown className={`size-4 shrink-0 text-fl-ink-3 transition-transform ${mostrarTodos ? "rotate-180" : ""}`} />
              </button>

              {mostrarTodos && (
                <div className="mt-2.5 flex flex-col gap-2.5 md:grid md:grid-cols-2 md:items-start">
                  {todos.map((m) => <CardModulo key={m.id} m={m} />)}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
