"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SEGMENTOS_ESCOLARES } from "@/lib/publico"

/**
 * Chips de competência de UM professor, na tela do adm.
 *
 * Cada toque concede/revoga um segmento (POST/DELETE
 * /api/escola/competencias). Sem nenhum chip ativo o professor vê tudo —
 * a competência REDUZ, nunca concede (lib/escola.ts).
 */
export function CompetenciasProfessor({
  professorId,
  ativas,
}: {
  professorId: string
  ativas: string[]
}) {
  const router = useRouter()
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function alternar(segmento: string, ligada: boolean) {
    setOcupado(segmento)
    setErro(null)
    try {
      const r = await fetch("/api/escola/competencias", {
        method: ligada ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professorId, segmento }),
      })
      if (!r.ok) {
        const d = await r.json().catch(() => null)
        setErro(d?.erro ?? "Não deu certo. Tenta de novo?")
      } else {
        router.refresh()
      }
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    }
    setOcupado(null)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {SEGMENTOS_ESCOLARES.map((s) => {
          const ligada = ativas.includes(s.id)
          return (
            <button
              key={s.id}
              onClick={() => alternar(s.id, ligada)}
              disabled={ocupado === s.id}
              className="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
              style={
                ligada
                  ? { background: "var(--fl-500)", borderColor: "var(--fl-500)", color: "white" }
                  : { borderColor: "var(--fl-sand)", color: "var(--fl-ink)" }
              }
            >
              {s.nome}
            </button>
          )
        })}
      </div>
      <p className="mt-1.5 text-xs text-fl-ink/50">
        {ativas.length === 0
          ? "Sem competência marcada: vê todos os segmentos."
          : "Só cria turma e concede trilha nos segmentos marcados."}
      </p>
      {erro && <p className="mt-1 text-xs text-[var(--fl-error)]">{erro}</p>}
    </div>
  )
}
