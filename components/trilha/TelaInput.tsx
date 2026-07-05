"use client"

import type { ConteudoInput, SessaoFluxo } from "@/types/trilha"

interface Props {
  conteudo: ConteudoInput
  sessao: SessaoFluxo
  onMudou: (valores: SessaoFluxo) => void
}

export function TelaInput({ conteudo, sessao, onMudou }: Props) {
  function handleChange(id: string, valor: string) {
    onMudou({ ...sessao, [id]: valor })
  }

  return (
    <div className="card-enter flex h-full flex-col justify-center gap-6 px-6 py-8">
      <div>
        <h2
          className="rich-text text-2xl font-bold leading-snug text-white"
          dangerouslySetInnerHTML={{ __html: conteudo.headline }}
        />
        {conteudo.subtitulo && (
          <p className="mt-2 text-sm text-[#A0AEC0]">{conteudo.subtitulo}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {conteudo.campos.map((campo) => (
          <div key={campo.id} className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-white">
              <span>{campo.emoji}</span>
              <span>{campo.label}</span>
            </label>
            <input
              type={campo.tipo === "decimal" ? "text" : "text"}
              inputMode={campo.tipo === "decimal" ? "decimal" : "text"}
              placeholder={campo.placeholder}
              value={sessao[campo.id] ?? ""}
              onChange={(e) => handleChange(campo.id, e.target.value)}
              className="w-full rounded-xl border border-[#1A2B3C] bg-[#1A2B3C] px-4 py-3 text-sm text-white placeholder-[#A0AEC0] outline-none focus:border-[#00C896] transition-colors"
            />
          </div>
        ))}
      </div>

      {conteudo.aviso && (
        <p className="text-xs text-[#A0AEC0]">🔒 {conteudo.aviso}</p>
      )}
    </div>
  )
}
