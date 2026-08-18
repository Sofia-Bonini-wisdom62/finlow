"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

/**
 * Status e vigência, os dois campos que decidem se a escola vale.
 *
 * Suspender aparece com confirmação porque recusa TODO papel de dentro, o adm
 * inclusive: é o botão de emergência de lib/escola.ts, e clicar sem querer
 * derruba a escola inteira até alguém voltar aqui.
 */
export function ContratoDaEscola({
  escolaId,
  status,
  ativaAte,
}: {
  escolaId: string
  status: string
  ativaAte: string | null
}) {
  const router = useRouter()
  const [data, setData] = useState(ativaAte ?? "")
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const suspensa = status === "suspensa"

  async function patch(corpo: Record<string, unknown>) {
    setOcupado(true)
    setErro(null)
    try {
      const r = await fetch(`/api/ops/escolas/${escolaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) setErro(d.erro ?? "Não deu certo. Tenta de novo?")
      else router.refresh()
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    }
    setOcupado(false)
  }

  return (
    <section className="rounded-2xl border border-fl-sand bg-fl-card p-5">
      <h3 className="text-base font-semibold text-fl-ink">Contrato</h3>
      <p className="mt-1 text-sm text-fl-ink/60">
        Escola suspensa continua visível para a administração dela, mas nada novo entra: nenhuma
        turma, nenhum convite, nenhuma concessão de trilha.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-xs font-medium text-fl-ink/70">Fim do contrato</span>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="mt-1 block rounded-xl border border-fl-sand bg-fl-page px-3 py-2 text-sm text-fl-ink"
          />
        </label>
        <button
          onClick={() => patch({ ativaAte: data })}
          disabled={ocupado}
          className="rounded-xl border border-fl-sand bg-fl-page px-4 py-2.5 text-sm font-medium text-fl-ink disabled:opacity-60"
        >
          Salvar vigência
        </button>
        {data && (
          <button
            onClick={() => {
              setData("")
              patch({ ativaAte: null })
            }}
            disabled={ocupado}
            className="text-sm font-medium text-fl-ink/60 disabled:opacity-60"
          >
            Tirar o prazo
          </button>
        )}
      </div>

      <div className="mt-4 border-t border-fl-sand pt-4">
        {suspensa ? (
          <button
            onClick={() => patch({ status: "ativa" })}
            disabled={ocupado}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            style={{ background: "var(--fl-500)" }}
          >
            Reativar escola
          </button>
        ) : (
          <button
            onClick={() => {
              if (confirm("Suspender a escola? Ninguém de dentro consegue criar nada até você reativar.")) {
                patch({ status: "suspensa" })
              }
            }}
            disabled={ocupado}
            className="rounded-xl border border-[var(--fl-error)] px-4 py-2.5 text-sm font-bold text-[var(--fl-error)] disabled:opacity-60"
          >
            Suspender escola
          </button>
        )}
      </div>

      {erro && <p className="mt-3 text-sm text-[var(--fl-error)]">{erro}</p>}
    </section>
  )
}
