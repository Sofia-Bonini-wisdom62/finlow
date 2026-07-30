"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowUp, Brain, Landmark, Check, ArrowRight } from "lucide-react"
import type { LancamentoProposto } from "@/lib/ia"
import { ConfirmarLancamentos } from "@/components/chat/ConfirmarLancamentos"

/**
 * Primeira conversa.
 *
 * Duas coisas que a tela resolve e o roteiro não resolveria sozinho:
 *
 * 1. Os dois aceites (memória e Painel) ficam ANTES da conversa, juntos e
 *    explicados. Pedir no meio interromperia a única conversa em que a pessoa
 *    está realmente contando algo — e pedir permissão no meio de uma frase é o
 *    jeito mais rápido de receber um "não".
 *
 * 2. Dá para pular. Onboarding obrigatório é a forma mais eficiente de perder
 *    alguém que só queria ver o app por dentro.
 */

interface Mensagem {
  papel: "usuario" | "ia"
  texto: string
  lancamentos?: LancamentoProposto[]
}

const PERFIS: Record<string, string> = {
  lancador: "Fluxo de caixa",
  guardador: "Guardar e usar",
  impulsivo: "Compra por impulso",
  sonhador: "Metas e planos",
}

export default function OnboardingPage() {
  const router = useRouter()
  const [fase, setFase] = useState<"carregando" | "aceite" | "conversa" | "fim">("carregando")
  const [nome, setNome] = useState("")
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [rascunho, setRascunho] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [perfil, setPerfil] = useState<string | null>(null)
  const fim = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/onboarding")
      .then((r) => (r.status === 401 ? null : r.json()))
      .then((d) => {
        if (!d) { router.replace("/login"); return }
        setNome(d.nome ?? "")
        // Já fez: não repete. Quem quiser refazer entra pelo Menu.
        if (d.concluido) { router.replace("/chat"); return }
        setFase("aceite")
      })
      .catch(() => setFase("aceite"))
  }, [router])

  useEffect(() => { fim.current?.scrollIntoView({ behavior: "smooth" }) }, [mensagens, enviando])

  async function comecar() {
    setFase("conversa")
    setEnviando(true)
    await fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memoria: true, painel: true }),
    }).catch(() => {})
    await turno([])
  }

  async function turno(historico: Mensagem[]) {
    setEnviando(true)
    setErro(null)
    try {
      const r = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagens: historico.map((m) => ({ papel: m.papel, texto: m.texto })),
        }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) {
        setErro(
          d.error === "ia_nao_configurada"
            ? "O assistente ainda não está ligado nesta instalação."
            : (d.mensagem ?? "Não consegui responder agora. Tenta de novo?")
        )
        return
      }

      setMensagens((m) => [
        ...m,
        {
          papel: "ia",
          texto: d.texto ?? "",
          lancamentos: Array.isArray(d.lancamentos) && d.lancamentos.length ? d.lancamentos : undefined,
        },
      ])

      if (d.concluido && d.perfilSugerido) {
        // A trilha lê o perfil daqui — sem isto ela abriria vazia.
        try { localStorage.setItem("finlow_perfil", d.perfilSugerido) } catch {}
        setPerfil(d.perfilSugerido)
        setFase("fim")
      }
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    } finally {
      setEnviando(false)
    }
  }

  async function enviar() {
    const texto = rascunho.trim()
    if (!texto || enviando) return
    const proximo: Mensagem[] = [...mensagens, { papel: "usuario", texto }]
    setMensagens(proximo)
    setRascunho("")
    await turno(proximo)
  }

  if (fase === "carregando") {
    return <main className="grid min-h-dvh place-items-center bg-fl-page text-sm text-fl-ink-3">Um instante…</main>
  }

  // ---------- aceite ----------
  if (fase === "aceite") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col justify-center px-6 py-10">
        <h1 className="text-[27px] font-extrabold leading-tight tracking-tight text-fl-ink">
          {nome ? `Oi, ${nome.split(" ")[0]}.` : "Oi."}
          <br />
          Vamos começar com uma conversa.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-fl-ink-2">
          Uns cinco minutos. Eu entendo o que você veio resolver, já registro seus primeiros gastos e
          escolho por onde a sua trilha começa.
        </p>

        <div className="mt-7 space-y-3">
          <div className="flex gap-3 rounded-2xl border border-fl-border bg-fl-card p-4">
            <Brain className="mt-0.5 size-5 shrink-0 text-fl-500" />
            <div>
              <p className="text-[14.5px] font-semibold text-fl-ink">Vou lembrar do que você contar</p>
              <p className="mt-0.5 text-[12.5px] leading-snug text-fl-ink-3">
                Para não te perguntar a mesma coisa toda vez. Você lê e apaga tudo em Menu &gt; Memória
                do assistente. Nunca guardo valor, saldo, CPF ou senha.
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-2xl border border-fl-border bg-fl-card p-4">
            <Landmark className="mt-0.5 size-5 shrink-0 text-fl-500" />
            <div>
              <p className="text-[14.5px] font-semibold text-fl-ink">Vou poder registrar seus gastos</p>
              <p className="mt-0.5 text-[12.5px] leading-snug text-fl-ink-3">
                Você me conta, eu mostro o que entendi e só entra depois que você confirmar. Tudo fica
                cifrado e some quando você mandar apagar.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={comecar}
          className="mt-7 w-full rounded-2xl bg-fl-500 py-3.5 text-[15px] font-semibold text-primary-foreground"
        >
          Combinado, vamos
        </button>
        <Link href="/chat" className="mt-3 text-center text-[13.5px] font-medium text-fl-ink-3">
          Prefiro olhar o app sozinha
        </Link>
      </main>
    )
  }

  // ---------- fim ----------
  if (fase === "fim") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col justify-center px-6 py-10">
        <div className="grid size-12 place-items-center rounded-full bg-fl-500/10">
          <Check className="size-6 text-fl-500" />
        </div>
        <h1 className="mt-5 text-[26px] font-extrabold leading-tight tracking-tight text-fl-ink">
          Pronto. Já sei por onde a gente começa.
        </h1>
        {perfil && (
          <p className="mt-3 text-[15px] leading-relaxed text-fl-ink-2">
            Sua trilha é <strong className="font-semibold text-fl-ink">{PERFIS[perfil] ?? "Fluxo de caixa"}</strong>.
            São 4 módulos curtos, na ordem que faz sentido para o que você me contou.
          </p>
        )}
        <div className="mt-7 space-y-2.5">
          <Link
            href="/trilha"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-fl-500 py-3.5 text-[15px] font-semibold text-primary-foreground"
          >
            Ver minha trilha <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/extrato"
            className="flex w-full items-center justify-center rounded-2xl border border-fl-border py-3.5 text-[14.5px] font-medium text-fl-ink-2"
          >
            Subir o extrato do banco
          </Link>
        </div>
      </main>
    )
  }

  // ---------- conversa ----------
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col px-5">
      <div className="flex items-center justify-between pt-5">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-fl-ink-3">
          Primeira conversa
        </span>
        <Link href="/chat" className="text-[12.5px] font-medium text-fl-ink-3">Pular</Link>
      </div>

      <div className="flex-1 space-y-3 py-5">
        {mensagens.map((m, i) =>
          m.papel === "usuario" ? (
            <div key={i} className="max-w-[85%] self-end rounded-[16px_16px_4px_16px] bg-fl-500 px-4 py-2.5 text-[14.5px] leading-relaxed text-primary-foreground ml-auto">
              {m.texto}
            </div>
          ) : (
            <div key={i} className="flex flex-col gap-2">
              {m.texto && (
                <div className="max-w-[92%] rounded-[16px_16px_16px_4px] border border-fl-border bg-fl-card px-4 py-3 text-[14.5px] leading-relaxed text-fl-ink">
                  {m.texto}
                </div>
              )}
              {m.lancamentos && <ConfirmarLancamentos lancamentos={m.lancamentos} />}
            </div>
          )
        )}

        {enviando && (
          <div className="flex w-fit items-center gap-1.5 rounded-full border border-fl-border bg-fl-card px-4 py-2.5">
            {[0, 150, 300].map((a) => (
              <span key={a} className="size-1.5 animate-bounce rounded-full bg-fl-ink-3" style={{ animationDelay: `${a}ms` }} />
            ))}
          </div>
        )}

        {erro && <p className="rounded-xl bg-fl-error/10 px-3 py-2 text-[13px] text-fl-error">{erro}</p>}
        <div ref={fim} />
      </div>

      <div className="sticky bottom-0 flex items-end gap-2 bg-fl-page pb-5 pt-2">
        <textarea
          value={rascunho}
          onChange={(e) => setRascunho(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar() } }}
          rows={1}
          placeholder="Escreve aqui…"
          disabled={enviando}
          className="max-h-32 flex-1 resize-none rounded-2xl border border-fl-border bg-fl-card px-4 py-3 text-[14.5px] text-fl-ink outline-none placeholder:text-fl-ink-3 focus:border-fl-500"
        />
        <button
          onClick={enviar}
          disabled={enviando || !rascunho.trim()}
          aria-label="Enviar"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-fl-500 text-primary-foreground disabled:opacity-40"
        >
          <ArrowUp className="size-5" />
        </button>
      </div>
    </main>
  )
}
