"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { LicaoFlow, type ResultadoLicaoCurso } from "@/components/curso/LicaoFlow"
import { POSE, poseDoDesempenho, tituloDoDesempenho } from "@/lib/fin"
import type { LicaoCursoData } from "@/types/curso"

/**
 * Player de UMA lição do curso v2 (`/curso/<slug>`).
 *
 * Nasce enxuto de propósito (backlog-curso-v2, P0 §1, "pronto quando: uma
 * lição de 15 telas roda ponta a ponta"): busca a lição, joga, mostra a nota
 * para a PESSOA. Não credita XP, não grava progresso, não entra no corredor.
 * Isso é o que a arquitetura quer neste passo — "item respondido não pontua
 * sozinho" (§8) — e o resto (caixas de Leitner, revisão diária, fusão com a
 * trilha) é fila própria em `docs/backlog-curso-v2.md`.
 */

function tempo(segundos: number): string {
  if (segundos < 60) return `${segundos}s`
  const min = Math.floor(segundos / 60)
  const resto = segundos % 60
  return resto === 0 ? `${min} min` : `${min} min ${resto}s`
}

export default function LicaoCursoPage() {
  const params = useParams()
  const slug = params.licaoSlug as string
  const [licao, setLicao] = useState<LicaoCursoData | null | undefined>(undefined)
  const [resultado, setResultado] = useState<ResultadoLicaoCurso | null>(null)

  useEffect(() => {
    let vivo = true
    fetch(`/api/curso/${slug}`)
      .then(async (r) => (r.ok ? ((await r.json()) as LicaoCursoData) : null))
      .then((d) => {
        if (vivo) setLicao(d)
      })
      .catch(() => {
        if (vivo) setLicao(null)
      })
    return () => {
      vivo = false
    }
  }, [slug])

  if (licao === undefined) {
    return (
      <div className="tema-fin flex h-dvh items-center justify-center" style={{ background: "var(--fin-bg)" }}>
        <div className="size-6 animate-spin rounded-full border-2 border-[var(--fin-accent)] border-t-transparent" />
      </div>
    )
  }

  if (licao === null) {
    return (
      <div className="tema-fin flex h-dvh flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: "var(--fin-bg)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={POSE.search} alt="" className="h-[110px] object-contain" />
        <p className="text-[15px] text-white">Essa lição não está por aqui.</p>
        <Link
          href="/trilha"
          className="fin-btn-3d min-h-11 rounded-2xl px-6 py-3 text-sm font-extrabold"
          style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
        >
          Ver minha trilha
        </Link>
      </div>
    )
  }

  if (resultado) {
    const pct = resultado.total > 0 ? Math.round((resultado.acertos / resultado.total) * 100) : 0
    return (
      <div className="tema-fin min-h-dvh w-full" style={{ background: "var(--fin-bg)" }}>
        <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-6 py-10">
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poseDoDesempenho(pct)} alt="" className="fin-pop mx-auto h-[120px] object-contain" />
            <h1 className="mt-2 text-[25px] font-black leading-tight tracking-tight text-white">{tituloDoDesempenho(pct)}</h1>
            <p className="mt-1 text-[14px]" style={{ color: "var(--fin-muted)" }}>
              {licao.titulo} · encontro {licao.encontro} de 3
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2.5">
            {[
              { n: `${pct}%`, rotulo: "PRECISÃO", cor: "var(--fin-accent)" },
              { n: `${resultado.acertos}/${resultado.total}`, rotulo: "ACERTOS", cor: "var(--fin-acerto)" },
              { n: tempo(resultado.segundos), rotulo: "TEMPO", cor: "var(--fin-text)" },
            ].map((t) => (
              <div key={t.rotulo} className="rounded-2xl px-3 py-3.5 text-center" style={{ background: "var(--fin-surface)" }}>
                <div className="text-[19px] font-black tabular-nums" style={{ color: t.cor }}>
                  {t.n}
                </div>
                <div className="text-[10.5px] font-extrabold tracking-wide" style={{ color: "var(--fin-dim)" }}>
                  {t.rotulo}
                </div>
              </div>
            ))}
          </div>

          {licao.conceito.frase && (
            <div className="mt-4 rounded-2xl border px-4 py-3.5" style={{ borderColor: "var(--fin-border-2)", background: "var(--fin-surface)" }}>
              <div className="text-[10.5px] font-black uppercase tracking-wider" style={{ color: "var(--fin-accent)" }}>
                O que ficou
              </div>
              <p className="mt-1 text-[13.5px] leading-relaxed text-white">{licao.conceito.frase}</p>
            </div>
          )}

          <div className="mt-7 flex flex-col gap-2.5">
            <Link
              href="/trilha"
              className="fin-btn-3d flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-extrabold"
              style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
            >
              Voltar pra trilha <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <LicaoFlow licao={licao} onConcluir={setResultado} />
}
