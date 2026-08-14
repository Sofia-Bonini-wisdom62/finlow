"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, MessageCircle } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

/**
 * Personalidade do assistente — onde a pessoa escolhe o tom das respostas.
 *
 * Cada tom traz a MESMA frase escrita daquele jeito. Sem a amostra, escolher
 * entre "Acolhedor" e "Equilibrado" é escolher entre dois adjetivos: ela só
 * descobriria o que mudou na conversa seguinte, e provavelmente sem ligar uma
 * coisa à outra.
 *
 * A lista de tons vem do servidor de propósito. Escrita aqui, seria uma
 * segunda verdade sobre o catálogo, e o dia em que um tom mudasse de nome esta
 * tela mostraria o nome velho sem nada reclamar.
 */

interface Opcao {
  id: string
  nome: string
  resumo: string
  exemplo: string
}

export default function PersonalidadePage() {
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [opcoes, setOpcoes] = useState<Opcao[]>([])
  const [escolhido, setEscolhido] = useState<string>("")
  const [detalhe, setDetalhe] = useState("")
  const [detalheSalvo, setDetalheSalvo] = useState("")
  const [maxDetalhe, setMaxDetalhe] = useState(200)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch("/api/personalidade")
        if (r.status === 401) { setErro("Entra na sua conta para ver isso."); return }
        if (!r.ok) { setErro("Não consegui carregar agora. Tenta de novo."); return }
        const d = await r.json()
        setOpcoes(d.personalidades ?? [])
        setEscolhido(d.escolha?.id ?? "")
        setDetalhe(d.escolha?.detalhe ?? "")
        setDetalheSalvo(d.escolha?.detalhe ?? "")
        if (typeof d.maxDetalhe === "number") setMaxDetalhe(d.maxDetalhe)
      } catch {
        setErro("Não consegui carregar agora. Tenta de novo.")
      } finally {
        setCarregando(false)
      }
    })()
  }, [])

  /**
   * Tocar num tom salva na hora, sem botão de confirmar.
   *
   * É uma preferência reversível de um toque: pedir "Salvar" depois de
   * escolher acrescenta um passo e um jeito de sair da tela achando que salvou
   * quando não salvou. O texto livre é outra história e tem botão próprio,
   * porque lá a pessoa está no meio de uma frase.
   */
  async function escolher(id: string) {
    if (id === escolhido) return
    const anterior = escolhido
    setEscolhido(id)
    setAviso(null)
    setErro(null)
    const r = await fetch("/api/personalidade", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (!r.ok) {
      setEscolhido(anterior)
      setErro("Não consegui salvar essa escolha.")
    }
  }

  async function salvarDetalhe() {
    setSalvando(true)
    setErro(null)
    setAviso(null)
    try {
      const r = await fetch("/api/personalidade", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detalhe: detalhe.trim() }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) { setErro(d.erro ?? "Não consegui salvar agora."); return }
      const guardado = d.escolha?.detalhe ?? ""
      setDetalhe(guardado)
      setDetalheSalvo(guardado)
      setAviso(guardado ? "Guardado. Vale a partir da próxima resposta." : "Texto removido.")
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    } finally {
      setSalvando(false)
    }
  }

  const mudouDetalhe = detalhe.trim() !== detalheSalvo

  if (erro && !opcoes.length) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-fl-page px-6 text-center">
        <p className="text-fl-ink-2">{erro}</p>
        <Link href="/ajustes" className="rounded-full bg-fl-500 px-6 py-3 text-sm font-semibold text-primary-foreground">
          Voltar ao menu
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-fl-page pb-28 lg:pb-12 lg:pl-56">
      <div className="mx-auto w-full max-w-[520px] px-5 md:max-w-2xl md:px-8 lg:max-w-3xl lg:px-10">
        <div className="flex items-center gap-3 pt-6">
          <Link href="/ajustes" className="grid size-9 place-items-center rounded-full border border-fl-border text-fl-ink-2">
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-[22px] font-extrabold tracking-tight text-fl-ink">Personalidade do assistente</h1>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-fl-ink-2">
          Escolhe como o assistente fala com você. Muda o jeito, nunca o conteúdo: os números
          continuam sendo os seus lançamentos, e o que ele não sabe ele continua dizendo que não sabe.
        </p>

        {erro && (
          <p className="mt-4 rounded-xl bg-fl-error/10 px-3 py-2 text-[13px] text-fl-error">{erro}</p>
        )}
        {aviso && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-fl-success/10 px-3 py-2 text-[13px] text-fl-success">
            <Check className="size-4 shrink-0" /> {aviso}
          </p>
        )}

        {/* Tons */}
        <section className="mt-6">
          <h2 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-fl-ink-2">
            O tom
          </h2>

          {carregando ? (
            <div className="rounded-2xl border border-fl-border bg-fl-card px-4 py-8 text-center text-sm text-fl-ink-3">
              Carregando…
            </div>
          ) : (
            <ul className="space-y-2">
              {opcoes.map((o) => {
                const ativo = o.id === escolhido
                return (
                  <li key={o.id}>
                    <button
                      onClick={() => escolher(o.id)}
                      aria-pressed={ativo}
                      className={`w-full rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                        ativo
                          ? "border-fl-500 bg-fl-50"
                          : "border-fl-border bg-fl-card hover:border-fl-500/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[15px] font-semibold text-fl-ink">{o.nome}</span>
                        {ativo && (
                          <span className="flex shrink-0 items-center gap-1 rounded-full bg-fl-500 px-2 py-0.5 text-[10.5px] font-semibold text-primary-foreground">
                            <Check className="size-3" /> em uso
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[12.5px] leading-snug text-fl-ink-2">{o.resumo}</p>
                      <p className="mt-2 flex gap-2 rounded-xl bg-fl-page px-3 py-2 text-[12.5px] leading-snug text-fl-ink-3">
                        <MessageCircle className="mt-0.5 size-3.5 shrink-0" />
                        <span>{o.exemplo}</span>
                      </p>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* Texto livre */}
        <section className="mt-6">
          <h2 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-fl-ink-2">
            Mais alguma coisa
          </h2>
          <div className="rounded-2xl border border-fl-border bg-fl-card p-4">
            <p className="text-[13px] leading-snug text-fl-ink-2">
              Se tiver algo sobre como você quer ser atendida, escreve aqui. Vale para todas as
              conversas.
            </p>
            <textarea
              value={detalhe}
              onChange={(e) => setDetalhe(e.target.value.slice(0, maxDetalhe))}
              rows={3}
              placeholder="Ex.: fala comigo como quem fala com um adulto apressado, sem dourar a pílula"
              aria-label="Como você quer ser atendida"
              className="mt-3 w-full resize-none rounded-xl border border-fl-border bg-fl-page px-3 py-2.5 text-[14px] text-fl-ink outline-none placeholder:text-fl-ink-3 focus:border-fl-500"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11.5px] text-fl-ink-3">{detalhe.length}/{maxDetalhe}</span>
              <button
                onClick={salvarDetalhe}
                disabled={salvando || !mudouDetalhe}
                className="rounded-full bg-fl-500 px-5 py-2 text-[13.5px] font-semibold text-primary-foreground disabled:opacity-40"
              >
                {salvando ? "Salvando…" : detalhe.trim() ? "Guardar" : "Remover"}
              </button>
            </div>

            <p className="mt-3 rounded-xl bg-fl-50 px-3 py-2 text-[12px] leading-snug text-fl-ink-3">
              Isto é uma preferência de atendimento, não uma ordem: pedidos como mudar um número,
              ignorar as regras dele ou virar outro assistente são ignorados. O texto é gravado
              cifrado e sai junto na exportação dos seus dados.
            </p>
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  )
}
