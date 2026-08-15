"use client"

import type { ConteudoCenario } from "@/types/trilha"
import { formatBRL as brl } from "@/lib/resultado"

function formatBRL(v: number): string {
  return `R$ ${brl(Math.abs(v))}`
}

export function TelaCenario({ conteudo }: { conteudo: ConteudoCenario }) {
  return (
    <div className="card-enter flex h-full flex-col justify-center gap-6 px-6 py-8">
      <div>
        <h2
          className="rich-text text-2xl font-bold leading-snug text-white"
          dangerouslySetInnerHTML={{ __html: conteudo.headline }}
        />
        {conteudo.personagem && (
          <span className="mt-1 block text-sm text-[var(--fin-muted)]">{conteudo.personagem}</span>
        )}
      </div>

      {/* A HISTÓRIA, quando o cenário é narrativo.
          No produto adulto o cenário é uma conta e a tabela abaixo é o miolo
          da tela. No Fundamental é uma história de feira, e não há entrada,
          saída nem saldo para tabelar — a narrativa ocupa esse lugar. */}
      {conteudo.narrativa && (
        <p
          className="rich-text rounded-2xl border border-[var(--fin-surface)] bg-[var(--fin-surface)] px-4 py-4 text-[15px] leading-relaxed text-white"
          dangerouslySetInnerHTML={{ __html: conteudo.narrativa }}
        />
      )}

      {!!conteudo.linhas?.length && (
      <div className="overflow-hidden rounded-2xl border border-[var(--fin-surface)] bg-[var(--fin-surface)]">
        {conteudo.linhas.map((linha, i) => {
          const isSaldo = linha.tipo === "saldo"
          const isSaida = linha.tipo === "saida"
          const saldoPositivo = isSaldo && linha.valor >= 0
          const temTexto = linha.valorTexto !== undefined

          return (
            <div
              key={i}
              className={`flex items-center justify-between px-4 py-3 ${
                i > 0 ? "border-t border-[var(--fin-bg)]" : ""
              } ${isSaldo ? "bg-[var(--fin-bg)]" : ""}`}
            >
              <span className={`text-sm ${isSaldo ? "font-semibold text-white" : "text-[var(--fin-muted)]"}`}>
                {linha.label}
              </span>
              <span
                className={`text-sm font-semibold ${
                  temTexto
                    ? "text-[var(--fin-dim)]"
                    : isSaldo
                    ? saldoPositivo
                      ? "text-[var(--fin-acerto)]"
                      : "text-[var(--fin-erro)]"
                    : isSaida
                    ? "text-[var(--fin-erro)]"
                    : "text-white"
                }`}
              >
                {temTexto
                  ? linha.valorTexto
                  : isSaida
                  ? `− ${formatBRL(linha.valor)}`
                  : formatBRL(linha.valor)}
              </span>
            </div>
          )
        })}
      </div>
      )}

      {conteudo.rodape && (
        <p
          className="rich-text text-sm leading-relaxed text-[var(--fin-muted)]"
          dangerouslySetInnerHTML={{ __html: conteudo.rodape }}
        />
      )}
    </div>
  )
}
