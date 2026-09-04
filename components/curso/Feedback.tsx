"use client"

import { POSE } from "@/lib/fin"

/**
 * A bolha de correção, uma só para os 6 formatos (arquitetura §3, "onde a
 * explicação mora agora"): o Fin reage, e o texto é a âncora (acertou) ou o
 * feedback de erro (errou), que é a aula de verdade. `aria-live` para o
 * leitor de tela ouvir a correção sem precisar procurar.
 */
export function Feedback({
  acertou,
  texto,
  rodape,
}: {
  acertou: boolean
  texto: string
  /** Linha miúda opcional (a conta da estimativa, a fonte). */
  rodape?: string | null
}) {
  const cor = acertou ? "var(--fin-acerto)" : "var(--fin-erro)"
  return (
    <div className="fin-slide-up flex items-end gap-2.5" role="status" aria-live="polite">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={acertou ? POSE.cheer : POSE.worried} alt="" className="fin-pop size-[72px] shrink-0 object-contain" />
      <div
        className="flex-1 rounded-2xl rounded-bl-sm border px-3.5 py-3"
        style={{ background: "var(--fin-surface)", borderColor: cor }}
      >
        <div className="text-[11px] font-black uppercase tracking-wide" style={{ color: cor }}>
          {acertou ? "Boa!" : "Quase lá"}
        </div>
        <p className="mt-0.5 text-sm leading-relaxed" style={{ color: "var(--fin-text)" }}>
          {texto}
        </p>
        {rodape && (
          <p className="mt-1.5 text-xs" style={{ color: "var(--fin-muted)" }}>
            {rodape}
          </p>
        )}
      </div>
    </div>
  )
}

/** Cores de borda/fundo/texto de uma opção, pelo estado (o mesmo vocabulário de TelaQuiz). */
export function estiloOpcao(respondida: boolean, correta: boolean, selecionada: boolean) {
  if (!respondida) return { borda: "border-[var(--fin-border-2)]", fundo: "bg-[var(--fin-surface)]", texto: "text-white" }
  if (correta) return { borda: "border-[var(--fin-acerto)]", fundo: "bg-[var(--fin-acerto)]/10", texto: "text-white" }
  if (selecionada) return { borda: "border-[var(--fin-erro)]", fundo: "bg-[var(--fin-erro)]/10", texto: "text-[var(--fin-erro)]" }
  return { borda: "border-[var(--fin-border-2)]", fundo: "bg-[var(--fin-surface)]", texto: "text-[var(--fin-muted)]" }
}
