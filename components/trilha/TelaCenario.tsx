"use client"

import type { ConteudoCenario } from "@/types/trilha"

function formatBRL(v: number): string {
  const abs = Math.abs(v)
  return `R$ ${abs.toFixed(2).replace(".", ",")}`
}

export function TelaCenario({ conteudo }: { conteudo: ConteudoCenario }) {
  return (
    <div className="card-enter flex h-full flex-col justify-center gap-6 px-6 py-8">
      <div>
        <h2
          className="text-2xl font-bold leading-snug text-white"
          dangerouslySetInnerHTML={{ __html: conteudo.headline }}
        />
        {conteudo.personagem && (
          <span className="mt-1 block text-sm text-[#A0AEC0]">{conteudo.personagem}</span>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#1A2B3C] bg-[#1A2B3C]">
        {conteudo.linhas.map((linha, i) => {
          const isSaldo = linha.tipo === "saldo"
          const isSaida = linha.tipo === "saida"
          const saldoPositivo = isSaldo && linha.valor >= 0
          const temTexto = linha.valorTexto !== undefined

          return (
            <div
              key={i}
              className={`flex items-center justify-between px-4 py-3 ${
                i > 0 ? "border-t border-[#0D1B2A]" : ""
              } ${isSaldo ? "bg-[#0D1B2A]" : ""}`}
            >
              <span className={`text-sm ${isSaldo ? "font-semibold text-white" : "text-[#A0AEC0]"}`}>
                {linha.label}
              </span>
              <span
                className={`text-sm font-semibold ${
                  temTexto
                    ? "text-[#718096]"
                    : isSaldo
                    ? saldoPositivo
                      ? "text-[#00C896]"
                      : "text-[#F87171]"
                    : isSaida
                    ? "text-[#F87171]"
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

      {conteudo.rodape && (
        <p
          className="text-sm leading-relaxed text-[#A0AEC0]"
          dangerouslySetInnerHTML={{ __html: conteudo.rodape }}
        />
      )}
    </div>
  )
}
