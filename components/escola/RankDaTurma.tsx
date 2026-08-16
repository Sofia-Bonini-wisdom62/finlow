"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const ESCOPOS = [
  { id: "sala", nome: "Só a sala" },
  { id: "ano", nome: "O ano inteiro" },
  { id: "escola", nome: "A escola inteira" },
] as const

/**
 * Config do rank da turma, na mão do professor. O aluno aparece por APELIDO
 * no rank dos colegas — e turma sem série só ranqueia como "sala", regra que
 * mora em rankingEscolar (lib/pontos.ts); aqui a gente só avisa.
 */
export function RankDaTurma({
  turmaId,
  rankAtivo,
  rankEscopo,
  temSerie,
}: {
  turmaId: string
  rankAtivo: boolean
  rankEscopo: string
  temSerie: boolean
}) {
  const router = useRouter()
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function mudar(corpo: object) {
    setOcupado(true)
    setErro(null)
    try {
      const r = await fetch(`/api/escola/turmas/${turmaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
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
    setOcupado(false)
  }

  return (
    <div>
      <button
        onClick={() => mudar({ rankAtivo: !rankAtivo })}
        disabled={ocupado}
        role="switch"
        aria-checked={rankAtivo}
        className="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
        style={
          rankAtivo
            ? { background: "var(--fl-500)", borderColor: "var(--fl-500)", color: "white" }
            : { borderColor: "var(--fl-sand)", color: "var(--fl-ink)" }
        }
      >
        {rankAtivo ? "Rank ligado" : "Ligar o rank"}
      </button>

      {rankAtivo && (
        <div className="mt-3">
          <p className="text-xs text-fl-ink/60">Quem os alunos veem no rank:</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {ESCOPOS.map((e) => (
              <button
                key={e.id}
                onClick={() => mudar({ rankEscopo: e.id })}
                disabled={ocupado || (e.id === "ano" && !temSerie)}
                className="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-40"
                style={
                  rankEscopo === e.id
                    ? { background: "var(--fl-500)", borderColor: "var(--fl-500)", color: "white" }
                    : { borderColor: "var(--fl-sand)", color: "var(--fl-ink)" }
                }
              >
                {e.nome}
              </button>
            ))}
          </div>
          {!temSerie && (
            <p className="mt-1.5 text-xs text-fl-ink/50">
              Turma sem série não entra no rank do ano: defina a série da turma para isso.
            </p>
          )}
          <p className="mt-1.5 text-xs text-fl-ink/50">
            Os alunos aparecem pelo apelido; quem não escolheu apelido fica de fora da lista
            dos colegas.
          </p>
        </div>
      )}

      {erro && <p className="mt-2 text-sm text-[var(--fl-error)]">{erro}</p>}
    </div>
  )
}
