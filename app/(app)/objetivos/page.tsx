"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { brl } from "@/lib/formato"
import { POSE } from "@/lib/fin"

interface Objetivo {
  id: string
  nome: string
  meta: number
  guardado: number
}

/** As cores dos cards giram como as unidades da trilha: cada objetivo tem a
 *  sua, e a barra e o botão falam a mesma. */
const CORES = [
  "var(--fin-accent, #E9A63C)",
  "var(--fin-energia, #55C7EA)",
  "var(--fin-acerto, #58C08A)",
  "var(--fin-pocao, #8B6CC9)",
  "var(--fin-combo, #F5772E)",
]

/** O passo fixo do desenho. Guardar é gesto repetido, não formulário. */
const PASSO = 50

export default function ObjetivosPage() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [criando, setCriando] = useState(false)
  const [nome, setNome] = useState("")
  const [meta, setMeta] = useState("")
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [precisaPainel, setPrecisaPainel] = useState(false)

  useEffect(() => {
    fetch("/api/objetivos")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setObjetivos(d?.objetivos ?? []))
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [])

  function tratarBloqueio(res: Response, d: { codigo?: string; error?: string }) {
    if (res.status === 403 || d.codigo === "PAINEL_INATIVO") {
      setPrecisaPainel(true)
      return true
    }
    setErro(d.error ?? "Não deu certo agora. Tenta de novo?")
    return true
  }

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setErro(null)
    try {
      const res = await fetch("/api/objetivos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, meta: Number(meta.replace(",", ".")) }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { tratarBloqueio(res, d); return }
      setObjetivos((o) => [...o, d.objetivo])
      setNome("")
      setMeta("")
      setCriando(false)
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    } finally {
      setSalvando(false)
    }
  }

  async function guardar(id: string) {
    setErro(null)
    try {
      const res = await fetch("/api/objetivos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, guardar: PASSO }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { tratarBloqueio(res, d); return }
      setObjetivos((os) => os.map((o) => (o.id === id ? d.objetivo : o)))
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    }
  }

  const totalGuardado = objetivos.reduce((a, o) => a + o.guardado, 0)

  return (
    <main className="min-h-dvh bg-fl-page pb-24 lg:pb-10 lg:pl-56">
      <div className="mx-auto w-full max-w-md px-5 py-6 md:max-w-2xl md:px-8 lg:max-w-3xl lg:px-10">
        <div className="flex items-center gap-3">
          <Link href="/perfil" aria-label="Voltar" className="text-fl-ink-2 transition-colors hover:text-fl-ink">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-lg font-black tracking-tight text-fl-ink">Objetivos</h1>
            <p className="text-[11.5px] text-fl-ink-2">{brl(totalGuardado)} guardados no total</p>
          </div>
        </div>

        {/* A regra que evita a conta não fechar na cabeça de ninguém: guardar
            não é gasto. É a mesma frase do "Guardado" das Análises. */}
        <div className="mt-4 flex items-center gap-2.5 rounded-[14px] border-[1.5px] border-fl-border bg-fl-card px-3 py-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={POSE.point} alt="" className="size-[34px] shrink-0 object-contain" />
          <p className="text-xs leading-snug text-fl-ink-2">
            Guardar pra objetivo fica <strong className="font-bold text-fl-ink">fora das suas saídas</strong>:
            cofrinho é bolso seu, não gasto.
          </p>
        </div>

        {erro && (
          <p className="mt-3 rounded-xl border border-fl-error/40 bg-fl-error/10 px-4 py-3 text-sm text-fl-error">
            {erro}
          </p>
        )}
        {precisaPainel && (
          <div className="mt-3 rounded-xl border border-fl-500/40 bg-fl-500/10 px-4 py-3 text-sm text-fl-ink">
            Objetivo guarda número de verdade, e isso mora no Painel.{" "}
            <Link href="/painel" className="font-extrabold text-fl-500">Ativar meu Painel</Link>
          </div>
        )}

        {carregando ? (
          <div className="mt-10 flex justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-fl-500 border-t-transparent" />
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2.5">
            {objetivos.length === 0 && !criando && (
              <p className="px-1 py-4 text-center text-sm leading-relaxed text-fl-ink-2">
                Nenhum objetivo ainda. Reserva, viagem, aquele fone: dá nome ao que você quer juntar
                e acompanha a barra encher.
              </p>
            )}

            {objetivos.map((o, i) => {
              const cor = CORES[i % CORES.length]
              const fracao = o.meta > 0 ? Math.min(1, o.guardado / o.meta) : 0
              const alcancado = o.guardado >= o.meta
              return (
                <div key={o.id} className="rounded-2xl bg-fl-card p-3.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[14.5px] font-black text-fl-ink">{o.nome}</span>
                    {alcancado ? (
                      <span className="whitespace-nowrap text-[11px] font-black text-fl-success">Alcançado ✓</span>
                    ) : (
                      <span className="whitespace-nowrap text-xs font-black" style={{ color: cor }}>
                        {Math.round(fracao * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-fl-ink-2">
                    <strong className="font-bold text-fl-ink">{brl(o.guardado)}</strong> de {brl(o.meta)}
                  </div>
                  <div className="mt-2 h-[9px] overflow-hidden rounded-full bg-fl-divider">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${fracao * 100}%`, background: cor }}
                    />
                  </div>
                  {!alcancado && (
                    <button
                      onClick={() => guardar(o.id)}
                      className="mt-2.5 w-full rounded-xl border-[1.5px] bg-fl-page py-2.5 text-[12.5px] font-black transition-opacity active:opacity-70"
                      style={{ borderColor: cor, color: cor }}
                    >
                      + Guardar {brl(PASSO)}
                    </button>
                  )}
                </div>
              )
            })}

            {criando ? (
              <form onSubmit={criar} className="flex flex-col gap-2.5 rounded-2xl bg-fl-card p-3.5">
                <input
                  autoFocus
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do objetivo (ex.: Reserva)"
                  maxLength={60}
                  required
                  className="w-full rounded-xl border border-fl-border bg-fl-page px-3.5 py-2.5 text-sm text-fl-ink placeholder-fl-ink-3 outline-none focus:border-fl-500"
                />
                <input
                  value={meta}
                  onChange={(e) => setMeta(e.target.value.replace(/[^\d.,]/g, ""))}
                  inputMode="decimal"
                  placeholder="Meta em R$ (ex.: 1000)"
                  required
                  className="w-full rounded-xl border border-fl-border bg-fl-page px-3.5 py-2.5 text-sm text-fl-ink placeholder-fl-ink-3 outline-none focus:border-fl-500"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={salvando}
                    className="fin-btn-3d flex-1 rounded-xl bg-fl-500 py-2.5 text-sm font-extrabold text-primary-foreground disabled:opacity-60"
                  >
                    {salvando ? "Criando…" : "Criar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCriando(false)}
                    className="flex-1 rounded-xl bg-fl-divider py-2.5 text-sm font-bold text-fl-ink-2"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => { setCriando(true); setErro(null) }}
                className="mt-1 w-full rounded-[14px] border-2 border-dashed border-fl-border py-3 text-[13px] font-extrabold text-fl-ink-2 transition-colors hover:border-fl-500 hover:text-fl-ink"
              >
                + Criar objetivo
              </button>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  )
}
