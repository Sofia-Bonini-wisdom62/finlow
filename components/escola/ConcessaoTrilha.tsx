"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export interface ItemConcessao {
  tipo: "bloco" | "modulo"
  refId: string
  rotulo: string
  detalhe: string
  ativo: boolean
}

/**
 * Toggles de concessão da turma. EF concede por BLOCO (3–8 por segmento);
 * EM, que não tem bloco, concede por MÓDULO. A página decide os itens; aqui
 * só liga e desliga.
 *
 * O estado "sem nenhuma linha" é o padrão e significa TUDO liberado — o
 * banner explica, porque um painel todo desmarcado que significa "tudo
 * aberto" é o tipo de tela que engana.
 */
export function ConcessaoTrilha({
  turmaId,
  itens,
  restrito,
}: {
  turmaId: string
  itens: ItemConcessao[]
  restrito: boolean
}) {
  const router = useRouter()
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function chamar(metodo: "POST" | "DELETE", corpo: object, marcador: string) {
    setOcupado(marcador)
    setErro(null)
    try {
      const r = await fetch(`/api/escola/turmas/${turmaId}/acessos`, {
        method: metodo,
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
    setOcupado(null)
  }

  return (
    <div>
      <p className="rounded-xl border border-fl-sand bg-fl-page px-3 py-2 text-xs text-fl-ink/70">
        {restrito
          ? "Modo restrito: os alunos só abrem o que estiver marcado."
          : "Padrão: a trilha completa do segmento está liberada. Marcar o primeiro item liga o modo restrito."}
      </p>

      <ul className="mt-3 space-y-2">
        {itens.map((item) => {
          const chave = `${item.tipo}:${item.refId}`
          return (
            <li key={chave} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-fl-ink">{item.rotulo}</p>
                <p className="text-xs text-fl-ink/50">{item.detalhe}</p>
              </div>
              <button
                onClick={() =>
                  chamar(
                    item.ativo ? "DELETE" : "POST",
                    { tipo: item.tipo, refId: item.refId },
                    chave
                  )
                }
                disabled={ocupado === chave}
                role="switch"
                aria-checked={item.ativo}
                className="shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                style={
                  item.ativo
                    ? { background: "var(--fl-500)", borderColor: "var(--fl-500)", color: "white" }
                    : { borderColor: "var(--fl-sand)", color: "var(--fl-ink)" }
                }
              >
                {item.ativo ? "Liberado" : "Liberar"}
              </button>
            </li>
          )
        })}
      </ul>

      {restrito && (
        <button
          onClick={() => chamar("DELETE", { tudo: true }, "tudo")}
          disabled={ocupado === "tudo"}
          className="mt-3 text-sm font-medium underline decoration-fl-ink/20 underline-offset-4 disabled:opacity-50"
          style={{ color: "var(--fl-ink)" }}
        >
          Voltar ao padrão (liberar tudo)
        </button>
      )}

      {erro && <p className="mt-2 text-sm text-[var(--fl-error)]">{erro}</p>}
    </div>
  )
}
