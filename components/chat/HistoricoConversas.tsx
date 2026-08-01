"use client"

import { useEffect, useState } from "react"
import { X, Trash2, MessageSquare, Plus } from "lucide-react"

/**
 * Conversas anteriores.
 *
 * Abre sob demanda e busca só ao abrir: a lista não precisa viajar junto com
 * cada mensagem só porque a pessoa TALVEZ queira reler algo de semana passada.
 *
 * Apagar uma conversa NÃO apaga o que o assistente aprendeu. São duas coisas
 * diferentes e a tela diz isso, porque quem apaga o histórico costuma achar
 * que apagou tudo.
 */

export interface ConversaResumo {
  id: string
  titulo: string
  atualizadoEm: string
  mensagens: number
}

function quando(iso: string): string {
  const d = new Date(iso)
  const hoje = new Date()
  const dias = Math.floor((hoje.getTime() - d.getTime()) / 86_400_000)
  if (dias === 0) return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  if (dias === 1) return "ontem"
  if (dias < 7) return `${dias} dias`
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

export function HistoricoConversas({
  aberto,
  atual,
  onFechar,
  onAbrir,
  onNova,
}: {
  aberto: boolean
  atual: string | null
  onFechar: () => void
  onAbrir: (id: string) => void
  onNova: () => void
}) {
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [conversas, setConversas] = useState<ConversaResumo[]>([])

  useEffect(() => {
    if (!aberto) return
    let cancelado = false
    setCarregando(true)
    setErro(null)
    fetch("/api/chat/conversas")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => { if (!cancelado) setConversas(d.conversas ?? []) })
      .catch(() => { if (!cancelado) setErro("Não consegui carregar o histórico.") })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [aberto])

  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (e: KeyboardEvent) => { if (e.key === "Escape") onFechar() }
    window.addEventListener("keydown", aoTeclar)
    return () => window.removeEventListener("keydown", aoTeclar)
  }, [aberto, onFechar])

  if (!aberto) return null

  async function apagar(id: string) {
    setConversas((c) => c.filter((x) => x.id !== id))
    await fetch(`/api/chat/conversas?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {})
    // Apagar a conversa aberta deixa a tela mostrando algo que não existe mais.
    if (id === atual) onNova()
  }

  async function apagarTudo() {
    if (!confirm("Apagar todas as conversas? Isso não tem volta.")) return
    setConversas([])
    await fetch("/api/chat/conversas?tudo=1", { method: "DELETE" }).catch(() => {})
    onNova()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onFechar}
      role="dialog"
      aria-modal="true"
      aria-label="Conversas anteriores"
    >
      <div
        className="flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-fl-card sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-5">
          <h2 className="text-[16px] font-bold text-fl-ink">Conversas</h2>
          <button
            onClick={onFechar}
            aria-label="Fechar"
            className="-mr-1 grid size-9 shrink-0 place-items-center rounded-full text-fl-ink-3 transition-colors hover:bg-fl-50 hover:text-fl-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <button
          onClick={() => { onNova(); onFechar() }}
          className="mx-5 mt-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-fl-border py-3 text-[14px] font-medium text-fl-ink-2 transition-colors hover:border-fl-500 hover:text-fl-ink"
        >
          <Plus className="size-4" /> Nova conversa
        </button>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          {carregando && <p className="py-6 text-center text-sm text-fl-ink-3">Carregando…</p>}
          {erro && <p className="rounded-xl bg-fl-error/10 px-3 py-2 text-[13px] text-fl-error">{erro}</p>}

          {!carregando && !erro && conversas.length === 0 && (
            <p className="py-6 text-center text-sm text-fl-ink-2">
              Nenhuma conversa guardada ainda.
            </p>
          )}

          {conversas.length > 0 && (
            <>
              <ul className="space-y-1">
                {conversas.map((c) => {
                  const ativa = c.id === atual
                  return (
                    <li key={c.id} className="flex items-center gap-1">
                      <button
                        onClick={() => { onAbrir(c.id); onFechar() }}
                        className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                          ativa ? "bg-fl-50" : "hover:bg-fl-50/60"
                        }`}
                      >
                        <MessageSquare className={`size-4 shrink-0 ${ativa ? "text-fl-500" : "text-fl-ink-3"}`} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] text-fl-ink">{c.titulo}</span>
                          <span className="block text-[11.5px] text-fl-ink-3">
                            {quando(c.atualizadoEm)} · {c.mensagens} {c.mensagens === 1 ? "mensagem" : "mensagens"}
                          </span>
                        </span>
                      </button>
                      <button
                        onClick={() => apagar(c.id)}
                        aria-label={`Apagar a conversa ${c.titulo}`}
                        className="grid size-9 shrink-0 place-items-center rounded-full text-fl-ink-3 transition-colors hover:text-fl-error"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  )
                })}
              </ul>

              <button onClick={apagarTudo} className="mt-4 w-full py-2 text-[12.5px] font-semibold text-fl-error">
                Apagar todas
              </button>
              <p className="mt-1 text-center text-[11.5px] leading-snug text-fl-ink-3">
                Apagar a conversa não apaga o que o assistente aprendeu sobre você. Isso fica em Menu &gt;
                Memória do assistente.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
