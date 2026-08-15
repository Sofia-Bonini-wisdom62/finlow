"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Brain, Trash2, Plus, X } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

/**
 * Memória do assistente — a tela onde a pessoa vê e controla o que a IA
 * aprendeu sobre ela.
 *
 * Existe pelo mesmo motivo que a memória nasce desligada: um assistente que
 * anota sozinho sobre você e não te deixa ler é um dossiê. Aqui tudo que está
 * guardado aparece em texto, com a data, e some com um toque.
 */

const TIPOS = [
  { id: "situacao", rotulo: "Situação", ajuda: "Circunstância durável: como você ganha, com quem mora, o que pesa no orçamento." },
  { id: "plano", rotulo: "Plano", ajuda: "Onde você quer chegar e até quando." },
  { id: "preferencia", rotulo: "Preferência", ajuda: "Como você quer ser ajudada: tom, assunto, formato." },
  { id: "compromisso", rotulo: "Compromisso", ajuda: "Algo que você decidiu fazer." },
] as const

interface Memoria {
  id: string
  tipo: string
  conteudo: string
  origem: string
  criadoEm: string
}

const rotuloDe = (t: string) => TIPOS.find((x) => x.id === t)?.rotulo ?? "Nota"

function dataCurta(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

export default function MemoriaPage() {
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [ligada, setLigada] = useState(false)
  const [memorias, setMemorias] = useState<Memoria[]>([])
  const [escrevendo, setEscrevendo] = useState(false)
  const [novoTipo, setNovoTipo] = useState<string>("situacao")
  const [novoTexto, setNovoTexto] = useState("")
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    setErro(null)
    try {
      const r = await fetch("/api/memoria")
      if (r.status === 401) { setErro("Entra na sua conta para ver isso."); return }
      if (!r.ok) { setErro("Não consegui carregar agora. Tenta de novo."); return }
      const d = await r.json()
      setLigada(!!d.ligada)
      setMemorias(d.memorias ?? [])
    } catch {
      setErro("Não consegui carregar agora. Tenta de novo.")
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function alternar() {
    const alvo = !ligada
    setLigada(alvo) // otimista: o toggle tem que responder na hora
    const r = await fetch("/api/memoria", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ligada: alvo }),
    })
    if (!r.ok) { setLigada(!alvo); setErro("Não consegui salvar essa mudança.") }
  }

  async function apagar(id: string) {
    setMemorias((m) => m.filter((x) => x.id !== id))
    await fetch(`/api/memoria?id=${encodeURIComponent(id)}`, { method: "DELETE" })
  }

  async function apagarTudo() {
    if (!confirm("Apagar tudo que o assistente aprendeu sobre você? Isso não tem volta.")) return
    setMemorias([])
    await fetch("/api/memoria?tudo=1", { method: "DELETE" })
  }

  async function adicionar() {
    if (novoTexto.trim().length < 8) return
    setSalvando(true)
    try {
      const r = await fetch("/api/memoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: novoTipo, conteudo: novoTexto.trim() }),
      })
      const d = await r.json().catch(() => ({}))
      if (r.ok && d.memoria) {
        setMemorias((m) => [d.memoria, ...m])
        setNovoTexto("")
        setEscrevendo(false)
      } else {
        setErro(d.erro ?? "Não consegui salvar.")
      }
    } finally {
      setSalvando(false)
    }
  }

  return (
    <main className="min-h-dvh bg-fl-page pb-28 lg:pb-12 lg:pl-56">
      <div className="mx-auto w-full max-w-[520px] px-5 md:max-w-2xl md:px-8 lg:max-w-3xl lg:px-10">
      <div className="flex items-center gap-3 pt-6">
        <Link href="/ajustes" className="grid size-9 place-items-center rounded-full border border-fl-border text-fl-ink-2">
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-[22px] font-extrabold tracking-tight text-fl-ink">Memória do assistente</h1>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-fl-ink-2">
        Com a memória ligada, o assistente guarda o que você conta sobre a sua vida financeira e usa nas
        próximas conversas, sem você ter que repetir. Tudo que ele guardar aparece aqui.
      </p>

      {/* Interruptor */}
      <section className="mt-5 rounded-2xl border border-fl-border bg-fl-card p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[15px] font-semibold text-fl-ink">
              <Brain className="size-4" /> {ligada ? "Ligada" : "Desligada"}
            </p>
            <p className="mt-1 text-[12.5px] leading-snug text-fl-ink-3">
              {ligada
                ? "O assistente pode guardar o que você contar."
                : "O assistente esquece tudo ao fim de cada conversa."}
            </p>
          </div>
          <button
            onClick={alternar}
            role="switch"
            aria-checked={ligada}
            aria-label="Ligar memória do assistente"
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${ligada ? "bg-fl-500" : "bg-fl-border"}`}
          >
            <span
              className={`absolute top-1 size-5 rounded-full bg-fl-page shadow transition-all ${ligada ? "left-6" : "left-1"}`}
            />
          </button>
        </div>

        <p className="mt-3 rounded-xl bg-fl-50 px-3 py-2 text-[12px] leading-snug text-fl-ink-3">
          Ele nunca guarda valor em dinheiro, saldo, CPF, conta ou senha, esses dados ficam só no Painel.
          O conteúdo é gravado cifrado e desligar não apaga o que já está aqui.
        </p>
      </section>

      {erro && (
        <p className="mt-4 rounded-xl bg-fl-error/10 px-3 py-2 text-[13px] text-fl-error">{erro}</p>
      )}

      {/* Lista */}
      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-fl-ink-2">
            O que ele sabe {memorias.length > 0 && `(${memorias.length})`}
          </h2>
          {memorias.length > 0 && (
            <button onClick={apagarTudo} className="text-[12px] font-semibold text-fl-error">
              Apagar tudo
            </button>
          )}
        </div>

        {carregando ? (
          <div className="rounded-2xl border border-fl-border bg-fl-card px-4 py-8 text-center text-sm text-fl-ink-3">
            Carregando…
          </div>
        ) : memorias.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-fl-border px-4 py-8 text-center">
            <p className="text-sm text-fl-ink-2">Nada guardado ainda.</p>
            <p className="mt-1 text-[12.5px] leading-snug text-fl-ink-3">
              {ligada
                ? "Conversa com o assistente e ele vai anotar o que fizer sentido."
                : "Liga a memória acima para ele começar a aprender."}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {memorias.map((m) => (
              <li key={m.id} className="flex items-start gap-3 rounded-2xl border border-fl-border bg-fl-card px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-snug text-fl-ink">{m.conteudo}</p>
                  <p className="mt-1 text-[11.5px] text-fl-ink-3">
                    {rotuloDe(m.tipo)} · {m.origem === "usuario" ? "você escreveu" : "o assistente anotou"} ·{" "}
                    {dataCurta(m.criadoEm)}
                  </p>
                </div>
                <button
                  onClick={() => apagar(m.id)}
                  aria-label="Apagar esta memória"
                  className="mt-0.5 shrink-0 text-fl-ink-3 transition-colors hover:text-fl-error"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Escrever à mão */}
      <section className="mt-4">
        {escrevendo ? (
          <div className="rounded-2xl border border-fl-border bg-fl-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-semibold text-fl-ink">Ensinar uma coisa</p>
              <button onClick={() => { setEscrevendo(false); setNovoTexto("") }} aria-label="Fechar">
                <X className="size-4 text-fl-ink-3" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {TIPOS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setNovoTipo(t.id)}
                  className={`rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                    novoTipo === t.id
                      ? "bg-fl-500 text-primary-foreground"
                      : "border border-fl-border text-fl-ink-2"
                  }`}
                >
                  {t.rotulo}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[12px] leading-snug text-fl-ink-3">
              {TIPOS.find((t) => t.id === novoTipo)?.ajuda}
            </p>

            <textarea
              value={novoTexto}
              onChange={(e) => setNovoTexto(e.target.value.slice(0, 240))}
              rows={3}
              placeholder="Ex.: sou autônoma e a renda varia bastante de um mês para o outro"
              className="mt-3 w-full resize-none rounded-xl border border-fl-border bg-fl-bg px-3 py-2.5 text-[14px] text-fl-ink outline-none placeholder:text-fl-ink-3 focus:border-fl-500"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11.5px] text-fl-ink-3">{novoTexto.length}/240</span>
              <button
                onClick={adicionar}
                disabled={salvando || novoTexto.trim().length < 8}
                className="rounded-full bg-fl-500 px-5 py-2 text-[13.5px] font-semibold text-primary-foreground disabled:opacity-40"
              >
                {salvando ? "Salvando…" : "Guardar"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEscrevendo(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-fl-border py-3.5 text-[14px] font-medium text-fl-ink-2 transition-colors hover:border-fl-500 hover:text-fl-ink"
          >
            <Plus className="size-4" /> Ensinar uma coisa
          </button>
        )}
      </section>

      </div>

      <BottomNav />
    </main>
  )
}
