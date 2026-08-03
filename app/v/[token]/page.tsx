import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { lerDiagnosticoPublico } from "@/lib/vazamento-repo"

/**
 * O card público do Diagnóstico de Vazamento.
 *
 * ANÔNIMO por contrato: número do ano, quantidade de achados, e mais nada —
 * nem nome, nem os achados (têm estabelecimento). Só existe se o dono criou o
 * link (opt-in), e revogar mata a página na hora.
 *
 * O CTA usa o link de indicação do dono quando existe: quem compartilhou o
 * diagnóstico está convidando, e o convite pode valer os pontos dele.
 */

export const dynamic = "force-dynamic"

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params
  const d = await lerDiagnosticoPublico(token)
  if (!d) return { title: "Finlow" }
  return {
    title: `${brl(d.totalAnual)} vazando por ano — Diagnóstico de Vazamento`,
    description: "Assinaturas esquecidas, tarifas e cobranças em dobro. Descubra o seu no Finlow.",
  }
}

export default async function CardVazamentoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const d = await lerDiagnosticoPublico(token)
  if (!d) notFound()

  const destino = d.codigoIndicacao ? `/r/${d.codigoIndicacao}` : "/"

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-fl-page px-6 py-10 text-center">
      <div className="w-full max-w-md rounded-3xl border border-fl-500/30 bg-fl-card p-8">
        <div className="text-[12px] font-bold uppercase tracking-wider text-fl-ink-2">
          Diagnóstico de Vazamento
        </div>
        <div className="mt-3 text-[46px] font-extrabold leading-tight tracking-tight text-fl-500">
          {brl(d.totalAnual)}
        </div>
        <p className="mt-1 text-[14px] text-fl-ink-2">
          por ano escapando sem ninguém ver
        </p>
        <p className="mt-4 text-[13px] leading-relaxed text-fl-ink-2">
          {d.quantosAchados}{" "}
          {d.quantosAchados === 1 ? "achado" : "achados"} entre assinaturas, tarifas e
          cobranças em dobro — direto do extrato, sem planilha.
        </p>
        <Link
          href={destino}
          className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-fl-500 py-3.5 text-sm font-bold text-primary-foreground"
        >
          Descobrir o meu vazamento
        </Link>
        <p className="mt-3 text-[11.5px] text-fl-ink-3">
          Finlow — clareza financeira sem culpa.
        </p>
      </div>
    </main>
  )
}
