"use client"

import Link from "next/link"
import { ArrowRight, Check, Clock, Target, Trophy } from "lucide-react"

/**
 * O fechamento de uma lição.
 *
 * Existe porque antes o módulo simplesmente sumia: ao concluir, o player dava
 * `router.push("/perfil")` e a pessoa era despejada noutra tela sem saber
 * quanto ganhou, quanto acertou nem o que acabou de aprender. O trabalho
 * acontecia e desaparecia.
 *
 * Os números vêm todos do SERVIDOR, inclusive os acertos: o cliente manda as
 * escolhas e recebe a nota de volta. Se esta tela calculasse o próprio acerto,
 * ela poderia discordar do XP que foi creditado, e o número visível brigaria
 * com o número real.
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
}

function tempo(segundos: number): string {
  if (segundos < 60) return `${segundos}s`
  const min = Math.floor(segundos / 60)
  const resto = segundos % 60
  return resto === 0 ? `${min} min` : `${min} min ${resto}s`
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
  const ganhou = (r.pontos?.pontos ?? 0) + (r.pontosModulo?.pontos ?? 0)
  // `creditado: false` = já tinha sido pago antes (a pessoa está refazendo).
  // Dizer "+0 XP" pareceria bug; dizer que foi revisão é o que aconteceu.
  const refazendo = r.pontos !== null && !r.pontos.creditado

  return (
    <div className="min-h-dvh w-full" style={{ background: "#112F30" }}>
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-6 py-10">
        <div className="text-center">
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full" style={{ background: "#1B3B3C" }}>
            {r.moduloConcluido ? (
              <Trophy className="size-8" style={{ color: "#5FA7A9" }} />
            ) : (
              <Check className="size-8" style={{ color: "#5FA7A9" }} />
            )}
          </div>

          <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-white">
            {r.moduloConcluido ? "Módulo completo!" : r.nome.replace(/!$/, "")} {r.moduloConcluido ? "🏁" : "✓"}
          </h1>
          <p className="mt-1.5 text-[14px]" style={{ color: "#A7ADAF" }}>
            {r.moduloConcluido
              ? "Você fechou as lições deste módulo. O próximo já abriu."
              : `${r.licoesConcluidas} de ${r.licoesTotal} lições deste módulo`}
          </p>
        </div>

        {/* ---- os números da lição ---- */}
        <div className="mt-7 grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl px-3 py-3.5 text-center" style={{ background: "#1B3B3C" }}>
            <Trophy className="mx-auto size-4" style={{ color: "#A7ADAF" }} />
            <div className="mt-1.5 text-[19px] font-extrabold tabular-nums text-white">
              {refazendo ? "—" : `+${ganhou}`}
            </div>
            <div className="text-[10.5px]" style={{ color: "#A7ADAF" }}>
              {refazendo ? "revisão" : "XP"}
            </div>
          </div>

          <div className="rounded-2xl px-3 py-3.5 text-center" style={{ background: "#1B3B3C" }}>
            <Target className="mx-auto size-4" style={{ color: "#A7ADAF" }} />
            <div className="mt-1.5 text-[19px] font-extrabold tabular-nums text-white">
              {r.quizzes > 0 ? `${r.acertos}/${r.quizzes}` : "—"}
            </div>
            <div className="text-[10.5px]" style={{ color: "#A7ADAF" }}>
              {r.quizzes > 0 ? "acertos" : "sem quiz"}
            </div>
          </div>

          <div className="rounded-2xl px-3 py-3.5 text-center" style={{ background: "#1B3B3C" }}>
            <Clock className="mx-auto size-4" style={{ color: "#A7ADAF" }} />
            <div className="mt-1.5 text-[19px] font-extrabold tabular-nums text-white">{tempo(r.segundos)}</div>
            <div className="text-[10.5px]" style={{ color: "#A7ADAF" }}>
              nesta lição
            </div>
          </div>
        </div>

        {/* ---- o que ficou ---- */}
        {r.conceito && (
          <div className="mt-4 rounded-2xl border px-4 py-3.5" style={{ borderColor: "#2A4E4F", background: "#16393A" }}>
            <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "#5FA7A9" }}>
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
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold"
              style={{ background: "#5FA7A9", color: "#112F30" }}
            >
              Próxima lição <ArrowRight className="size-4" />
            </button>
          ) : (
            <Link
              href="/trilha"
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold"
              style={{ background: "#5FA7A9", color: "#112F30" }}
            >
              {r.moduloConcluido ? "Continuar a trilha" : "Voltar pra trilha"} <ArrowRight className="size-4" />
            </Link>
          )}

          <Link
            href="/trilha"
            className="w-full rounded-2xl py-3.5 text-center text-sm font-semibold"
            style={{ color: "#A7ADAF" }}
          >
            {temProxima ? "Deixar pra depois" : "Ver minha trilha"}
          </Link>
        </div>
      </div>
    </div>
  )
}
