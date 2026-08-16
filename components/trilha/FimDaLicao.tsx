"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Flame, Zap } from "lucide-react"
import { POSE, poseDoDesempenho, tituloDoDesempenho } from "@/lib/fin"

/**
 * O fechamento de uma lição — agora com o Fin no palco (Redesign Fin).
 *
 * Existe porque antes o módulo simplesmente sumia: ao concluir, o player dava
 * `router.push("/perfil")` e a pessoa era despejada noutra tela sem saber
 * quanto ganhou. Os números vêm TODOS do servidor, inclusive o combo e a
 * precisão: o cliente manda as escolhas e recebe a nota — se esta tela
 * calculasse o próprio acerto, o número visível brigaria com o creditado.
 *
 * "Porcentagem em vez de acertos" (pedido do protótipo): o anel mostra a
 * precisão da lição em %, e a fração N/M vira tile de apoio.
 */

export interface ResultadoLicao {
  nome: string
  acertos: number
  quizzes: number
  segundos: number
  pontos: { pontos: number; creditado: boolean } | null
  moduloConcluido: boolean
  pontosModulo: { pontos: number; creditado: boolean } | null
  licoesConcluidas: number
  licoesTotal: number
  /** Fecho do módulo, quando existe: a frase que resume o que ficou. */
  conceito?: string | null
  // --- a camada de jogo (Redesign Fin) ---
  comboMax?: number
  comboBonus?: number
  coins?: number | null
  energiaDevolvida?: number | null
  pocaoAplicada?: boolean
  precisao?: number | null
  sequencia?: number
  bauDisponivel?: { refId: string; rotulo: string } | null
}

function tempo(segundos: number): string {
  if (segundos < 60) return `${segundos}s`
  const min = Math.floor(segundos / 60)
  const resto = segundos % 60
  return resto === 0 ? `${min} min` : `${min} min ${resto}s`
}

/** Anel de precisão: r=54 → circunferência 2π·54 ≈ 339.3 (a do keyframe). */
function AnelPrecisao({ pct }: { pct: number }) {
  const circ = 2 * Math.PI * 54
  return (
    <div className="relative mx-auto size-[140px]">
      <svg width="140" height="140" viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r="54" fill="none" stroke="var(--fin-surface)" strokeWidth="11" />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="var(--fin-accent)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          style={{ animation: "fin-ring-in 1.1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-[31px] font-black leading-none" style={{ color: "var(--fin-accent)" }}>
            {pct}%
          </div>
          <div className="text-[11px] font-extrabold tracking-wide" style={{ color: "var(--fin-muted)" }}>
            PRECISÃO
          </div>
        </div>
      </div>
    </div>
  )
}

export function FimDaLicao({
  r,
  temProxima,
  onProxima,
}: {
  r: ResultadoLicao
  temProxima: boolean
  onProxima: () => void
}) {
  const ganhou =
    (r.pontos?.pontos ?? 0) + (r.pontosModulo?.pontos ?? 0) + (r.comboBonus ?? 0)
  // `creditado: false` = já tinha sido pago antes (a pessoa está refazendo).
  // Dizer "+0 XP" pareceria bug; dizer que foi revisão é o que aconteceu.
  const refazendo = r.pontos !== null && !r.pontos.creditado
  const pct = r.precisao ?? null

  const [bau, setBau] = useState(r.bauDisponivel ?? null)
  const [bauAberto, setBauAberto] = useState<number | null>(null)
  const [abrindo, setAbrindo] = useState(false)

  async function abrirBau() {
    if (!bau || abrindo) return
    setAbrindo(true)
    try {
      const resp = await fetch("/api/jogo/bau", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refId: bau.refId }),
      })
      const d = await resp.json()
      if (resp.ok && d.ok) {
        setBauAberto(d.xp)
        setBau(null)
      } else {
        setBau(null) // já aberto/indisponível: o botão some em vez de mentir
      }
    } catch {
      // sem rede: o baú continua na trilha, nada se perde
    }
    setAbrindo(false)
  }

  const pose = refazendo
    ? POSE.teach
    : pct === null
      ? POSE.proud
      : poseDoDesempenho(pct)
  const titulo = refazendo
    ? "Revisão feita!"
    : r.moduloConcluido
      ? "Módulo completo!"
      : pct === null
        ? `${r.nome.replace(/!$/, "")} ✓`
        : tituloDoDesempenho(pct)

  return (
    <div className="tema-fin min-h-dvh w-full" style={{ background: "var(--fin-bg)" }}>
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-6 py-10">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pose} alt="" className="fin-pop mx-auto h-[120px] object-contain" />

          <h1 className="mt-2 text-[25px] font-black leading-tight tracking-tight text-white">
            {titulo}
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: "var(--fin-muted)" }}>
            {r.moduloConcluido
              ? "Você fechou as lições deste módulo. O próximo já abriu."
              : `${r.nome.replace(/!$/, "")} · ${r.licoesConcluidas} de ${r.licoesTotal} lições`}
          </p>
        </div>

        {/* ---- anel de precisão (só quando houve quiz) ---- */}
        {pct !== null && !refazendo && (
          <div className="mt-5">
            <AnelPrecisao pct={pct} />
          </div>
        )}

        {/* ---- os números da lição ---- */}
        <div className="mt-6 grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl px-3 py-3.5 text-center" style={{ background: "var(--fin-surface)" }}>
            <div className="text-[19px] font-black tabular-nums" style={{ color: "var(--fin-accent)" }}>
              {refazendo ? "-" : `+${ganhou}`}
            </div>
            <div className="text-[10.5px] font-extrabold tracking-wide" style={{ color: "var(--fin-dim)" }}>
              {refazendo ? "REVISÃO" : "GANHOS"}
            </div>
          </div>

          <div className="rounded-2xl px-3 py-3.5 text-center" style={{ background: "var(--fin-surface)" }}>
            <div className="text-[19px] font-black tabular-nums" style={{ color: "var(--fin-combo)" }}>
              {r.comboMax && r.comboMax > 1 ? `×${r.comboMax}` : "-"}
            </div>
            <div className="text-[10.5px] font-extrabold tracking-wide" style={{ color: "var(--fin-dim)" }}>
              MAIOR COMBO
            </div>
          </div>

          <div className="rounded-2xl px-3 py-3.5 text-center" style={{ background: "var(--fin-surface)" }}>
            <div className="text-[19px] font-black tabular-nums" style={{ color: "var(--fin-acerto)" }}>
              {r.quizzes > 0 ? `${r.acertos}/${r.quizzes}` : tempo(r.segundos)}
            </div>
            <div className="text-[10.5px] font-extrabold tracking-wide" style={{ color: "var(--fin-dim)" }}>
              {r.quizzes > 0 ? "ACERTOS" : "NESTA LIÇÃO"}
            </div>
          </div>
        </div>

        {/* ---- o que a lição rendeu além dos pontos ---- */}
        {!refazendo && (
          <div className="mt-3.5 flex flex-wrap justify-center gap-2">
            {typeof r.energiaDevolvida === "number" && r.energiaDevolvida > 0 && (
              <span
                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black"
                style={{
                  color: "var(--fin-energia)",
                  borderColor: "color-mix(in srgb, var(--fin-energia) 45%, transparent)",
                  background: "color-mix(in srgb, var(--fin-energia) 10%, transparent)",
                }}
              >
                <Zap className="size-3.5" /> +{r.energiaDevolvida} de energia
              </span>
            )}
            {typeof r.coins === "number" && r.coins > 0 && (
              <span
                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black"
                style={{
                  color: "var(--fin-accent)",
                  borderColor: "color-mix(in srgb, var(--fin-accent) 45%, transparent)",
                  background: "color-mix(in srgb, var(--fin-accent) 10%, transparent)",
                }}
              >
                ● +{r.coins} coins
              </span>
            )}
            {r.pocaoAplicada && (
              <span
                className="rounded-full border px-3 py-1.5 text-xs font-black"
                style={{
                  color: "var(--fin-pocao)",
                  borderColor: "color-mix(in srgb, var(--fin-pocao) 45%, transparent)",
                  background: "color-mix(in srgb, var(--fin-pocao) 10%, transparent)",
                }}
              >
                Poção ×2 aplicada
              </span>
            )}
          </div>
        )}

        {/* ---- ofensiva ---- */}
        {typeof r.sequencia === "number" && r.sequencia > 0 && !refazendo && (
          <div
            className="mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3"
            style={{
              borderColor: "color-mix(in srgb, var(--fin-combo) 40%, transparent)",
              background: "color-mix(in srgb, var(--fin-combo) 10%, transparent)",
            }}
          >
            <Flame className="size-6 shrink-0" style={{ color: "var(--fin-combo)" }} />
            <div>
              <div className="text-[14px] font-black" style={{ color: "var(--fin-combo)" }}>
                {r.sequencia} {r.sequencia === 1 ? "dia" : "dias"} de ofensiva
              </div>
              <div className="text-xs" style={{ color: "var(--fin-muted)" }}>
                Volte amanhã pra manter a chama acesa!
              </div>
            </div>
          </div>
        )}

        {/* ---- baú da unidade ---- */}
        {bau && (
          <button
            onClick={abrirBau}
            disabled={abrindo}
            className="fin-wob mt-4 flex w-full items-center justify-center gap-2.5 rounded-2xl py-3.5 text-[15px] font-black fin-btn-3d disabled:opacity-60"
            style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
          >
            🎁 {abrindo ? "Abrindo…" : `Abrir o baú: ${bau.rotulo}`}
          </button>
        )}
        {bauAberto !== null && (
          <div
            className="fin-pop mt-4 rounded-2xl border px-4 py-3.5 text-center"
            style={{
              borderColor: "color-mix(in srgb, var(--fin-accent) 50%, transparent)",
              background: "color-mix(in srgb, var(--fin-accent) 12%, transparent)",
            }}
          >
            <div className="text-[17px] font-black" style={{ color: "var(--fin-accent)" }}>
              +{bauAberto} XP!
            </div>
            <div className="text-xs" style={{ color: "var(--fin-muted)" }}>
              Entrou no seu total. Na Loja do Fin dá pra trocar XP por moedas.
            </div>
          </div>
        )}

        {/* ---- o que ficou ---- */}
        {r.conceito && (
          <div
            className="mt-4 rounded-2xl border px-4 py-3.5"
            style={{ borderColor: "var(--fin-border-2)", background: "var(--fin-surface)" }}
          >
            <div className="text-[10.5px] font-black uppercase tracking-wider" style={{ color: "var(--fin-accent)" }}>
              O que ficou
            </div>
            <p className="mt-1 text-[13.5px] leading-relaxed text-white">{r.conceito}</p>
          </div>
        )}

        {/* ---- saídas ---- */}
        <div className="mt-7 flex flex-col gap-2.5">
          {temProxima ? (
            <button
              onClick={onProxima}
              className="fin-btn-3d flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-extrabold"
              style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
            >
              Próxima lição <ArrowRight className="size-4" />
            </button>
          ) : (
            <Link
              href="/trilha"
              className="fin-btn-3d flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-extrabold"
              style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
            >
              {r.moduloConcluido ? "Continuar a trilha" : "Voltar pra trilha"} <ArrowRight className="size-4" />
            </Link>
          )}

          <Link
            href="/trilha"
            className="w-full rounded-2xl py-3.5 text-center text-sm font-semibold"
            style={{ color: "var(--fin-muted)" }}
          >
            {temProxima ? "Deixar pra depois" : "Ver minha trilha"}
          </Link>
        </div>
      </div>
    </div>
  )
}
