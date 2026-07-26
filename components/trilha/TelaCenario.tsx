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
          <span className="mt-1 block text-sm text-[#A7ADAF]">{conteudo.personagem}</span>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#1B3B3C] bg-[#1B3B3C]">
        {conteudo.linhas.map((linha, i) => {
          const isSaldo = linha.tipo === "saldo"
          const isSaida = linha.tipo === "saida"
          const saldoPositivo = isSaldo && linha.valor >= 0
          const temTexto = linha.valorTexto !== undefined

          return (
            <div
              key={i}
              className={`flex items-center justify-between px-4 py-3 ${
                i > 0 ? "border-t border-[#112F30]" : ""
              } ${isSaldo ? "bg-[#112F30]" : ""}`}
            >
              <span className={`text-sm ${isSaldo ? "font-semibold text-white" : "text-[#A7ADAF]"}`}>
                {linha.label}
              </span>
              <span
                className={`text-sm font-semibold ${
                  temTexto
                    ? "text-[#718096]"
                    : isSaldo
                    ? saldoPositivo
                      ? "text-[#5FA7A9]"
                      : "text-[#D08277]"
                    : isSaida
                    ? "text-[#D08277]"
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
          className="rich-text text-sm leading-relaxed text-[#A7ADAF]"
          dangerouslySetInnerHTML={{ __html: conteudo.rodape }}
        />
      )}
    </div>
  )
}
