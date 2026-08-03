"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle, Check, Copy, Droplets, FileUp, Gift, Link2, MessageCircle,
  Repeat, TrendingUp, X,
} from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { ConvidarAmigos } from "@/components/ajustes/ConvidarAmigos"
import { brl } from "@/lib/formato"

/**
 * Diagnóstico de Vazamento — o número grande e de onde ele vem.
 *
 * A página não aconselha: mostra o que os detectores acharam (lib/vazamento.ts)
 * e abre dois caminhos, conversar sobre isso no chat e mandar pra um amigo.
 * O diagnóstico recalcula a cada visita — foto velha aqui seria mentira.
 */

interface Achado {
  tipo: "encargo" | "duplicada" | "assinatura" | "categoria_inflada"
  titulo: string
  detalhe: string
  valorMensal: number
  valorAnual: number
}

interface Diagnostico {
  pronto: boolean
  motivo?: string
  achados?: Achado[]
  totalMensal?: number
  totalAnual?: number
  mesesAnalisados?: number
  narrativa?: string
  tokenPublico?: string | null
}

const ICONE_POR_TIPO = {
  encargo: AlertTriangle,
  duplicada: Copy,
  assinatura: Repeat,
  categoria_inflada: TrendingUp,
} as const

export default function DiagnosticoPage() {
  const [diag, setDiag] = useState<Diagnostico | null>(null)
  const [erro, setErro] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [mexendoNoLink, setMexendoNoLink] = useState(false)

  useEffect(() => {
    fetch("/api/vazamento")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Diagnostico) => {
        setDiag(d)
        setToken(d.tokenPublico ?? null)
      })
      .catch(() => setErro(true))
  }, [])

  const urlPublica = token && typeof window !== "undefined" ? `${window.location.origin}/v/${token}` : null

  async function criarLink() {
    setMexendoNoLink(true)
    try {
      const r = await fetch("/api/vazamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "compartilhar" }),
      })
      const d = await r.json().catch(() => ({}))
      if (r.ok && d.token) setToken(d.token)
    } finally {
      setMexendoNoLink(false)
    }
  }

  async function revogarLink() {
    setMexendoNoLink(true)
    try {
      const r = await fetch("/api/vazamento", { method: "DELETE" })
      if (r.ok) setToken(null)
    } finally {
      setMexendoNoLink(false)
    }
  }

  async function copiarLink() {
    if (!urlPublica) return
    try {
      await navigator.clipboard.writeText(urlPublica)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {}
  }

  return (
    <main className="min-h-dvh bg-fl-page pb-24 lg:pb-10 lg:pl-56">
      <div className="mx-auto w-full max-w-md px-5 py-6 md:max-w-2xl md:px-8 lg:max-w-3xl lg:px-10">
        <h1 className="flex items-center gap-2.5 text-[26px] font-extrabold tracking-tight text-fl-ink">
          <Droplets className="size-6 text-fl-500" /> Diagnóstico de Vazamento
        </h1>
        <p className="mt-1 text-[13.5px] text-fl-ink-2">
          Quanto sai todo mês sem você perceber — assinaturas, tarifas, cobrança em dobro.
        </p>

        {erro && (
          <div className="mt-6 rounded-2xl bg-fl-error/10 px-4 py-3 text-sm text-fl-error">
            Não consegui gerar o diagnóstico agora. Tenta de novo daqui a pouco.
          </div>
        )}

        {!diag && !erro && (
          <div className="mt-6 rounded-2xl border border-fl-border bg-fl-card px-4 py-6 text-center text-sm text-fl-ink-2">
            Passando o pente-fino nos seus lançamentos…
          </div>
        )}

        {diag && !diag.pronto && (
          <div className="mt-6 rounded-2xl border border-fl-border bg-fl-card p-5">
            <p className="text-sm leading-relaxed text-fl-ink">
              Ainda não tem lançamento suficiente pra um diagnóstico honesto. Com pelo
              menos um mês de movimento, eu consigo apontar o que está vazando.
            </p>
            <Link
              href="/extrato"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-fl-500 px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <FileUp className="size-4" /> Ler meu extrato
            </Link>
          </div>
        )}

        {diag?.pronto && (
          <>
            {/* ---------- o número grande ---------- */}
            <section className="mt-6 rounded-2xl border border-fl-500/30 bg-fl-card p-5 text-center">
              <div className="text-[12px] font-bold uppercase tracking-wider text-fl-ink-2">
                escapando por ano
              </div>
              <div className="mt-1 text-[40px] font-extrabold leading-tight tracking-tight text-fl-500">
                {brl(diag.totalAnual ?? 0)}
              </div>
              <div className="mt-1 text-[13px] text-fl-ink-2">
                {brl(diag.totalMensal ?? 0)} por mês · {diag.mesesAnalisados}{" "}
                {diag.mesesAnalisados === 1 ? "mês analisado" : "meses analisados"}
              </div>
              {diag.narrativa && (
                <p className="mt-3 border-t border-fl-divider pt-3 text-left text-sm leading-relaxed text-fl-ink">
                  {diag.narrativa}
                </p>
              )}
            </section>

            {/* ---------- os achados ---------- */}
            {(diag.achados ?? []).length > 0 && (
              <section className="mt-4 flex flex-col gap-2.5">
                {(diag.achados ?? []).map((a, i) => {
                  const Icone = ICONE_POR_TIPO[a.tipo] ?? Droplets
                  return (
                    <div key={i} className="flex items-start gap-3 rounded-2xl border border-fl-border bg-fl-card p-4">
                      <Icone className="mt-0.5 size-4.5 shrink-0 text-fl-500" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-[14.5px] font-semibold text-fl-ink">{a.titulo}</span>
                          <span className="shrink-0 text-sm font-bold text-fl-ink">
                            {brl(a.valorMensal)}<span className="font-normal text-fl-ink-3">/mês</span>
                          </span>
                        </div>
                        <p className="mt-0.5 text-[12.5px] leading-snug text-fl-ink-2">{a.detalhe}</p>
                      </div>
                    </div>
                  )
                })}
              </section>
            )}

            {(diag.achados ?? []).length === 0 && (
              <section className="mt-4 rounded-2xl border border-fl-border bg-fl-card p-5 text-sm leading-relaxed text-fl-ink">
                Nenhum vazamento claro nos últimos {diag.mesesAnalisados} meses. Bom
                sinal — repete depois do próximo extrato.
              </section>
            )}

            {/* ---------- conversar ---------- */}
            <Link
              href="/chat"
              className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-fl-500 py-3.5 text-sm font-bold text-primary-foreground"
            >
              <MessageCircle className="size-4" /> Conversar sobre isso
            </Link>

            {/* ---------- card público (opt-in) ---------- */}
            <section className="mt-6 rounded-2xl border border-fl-border bg-fl-card p-4">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-fl-ink-2">
                <Link2 className="size-3.5" /> Card pra compartilhar
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-fl-ink-2">
                Um link anônimo com só o número do ano — sem seu nome, sem os detalhes.
                Quem abrir pode fazer o próprio diagnóstico pelo seu convite.
              </p>
              {!urlPublica ? (
                <button
                  onClick={criarLink}
                  disabled={mexendoNoLink}
                  className="mt-3 rounded-xl border border-fl-border bg-fl-page px-4 py-2.5 text-sm font-semibold text-fl-ink disabled:opacity-60"
                >
                  {mexendoNoLink ? "Criando…" : "Criar link público"}
                </button>
              ) : (
                <div className="mt-3 flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-xl border border-fl-border bg-fl-page px-3 py-2.5 text-[12px] text-fl-ink">
                    {urlPublica}
                  </code>
                  <button onClick={copiarLink} aria-label="Copiar link"
                    className="shrink-0 rounded-xl border border-fl-border bg-fl-page p-2.5 text-fl-ink-2 hover:text-fl-ink">
                    {copiado ? <Check className="size-4 text-fl-success" /> : <Copy className="size-4" />}
                  </button>
                  <button onClick={revogarLink} disabled={mexendoNoLink} aria-label="Apagar link público"
                    className="shrink-0 rounded-xl border border-fl-error/40 bg-fl-page p-2.5 text-fl-error">
                    <X className="size-4" />
                  </button>
                </div>
              )}
            </section>

            {/* ---------- convidar ---------- */}
            <section className="mt-4 overflow-hidden rounded-2xl border border-fl-border bg-fl-card">
              <div className="flex items-center gap-2 px-4 pt-3.5 text-[11px] font-bold uppercase tracking-wider text-fl-ink-2">
                <Gift className="size-3.5" /> Convide amigos
              </div>
              <ConvidarAmigos />
            </section>
          </>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
