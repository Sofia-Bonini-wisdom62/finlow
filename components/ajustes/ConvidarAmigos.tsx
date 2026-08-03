"use client"

import { useEffect, useState } from "react"
import { Check, Copy, Share2 } from "lucide-react"

interface Resumo {
  codigo: string
  url: string
  cadastradas: number
  ativadas: number
}

/**
 * Card "Convide amigos" dos Ajustes.
 *
 * Mostra o link pessoal e dois contadores — quantos entraram, quantos já
 * conversaram. De propósito NÃO mostra quem: a identidade de quem aceitou o
 * convite é dado do outro, não de quem convidou.
 */
export function ConvidarAmigos() {
  const [resumo, setResumo] = useState<Resumo | null>(null)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    fetch("/api/indicacao")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.url) setResumo(d) })
      .catch(() => {})
  }, [])

  if (!resumo) return null

  async function compartilhar() {
    if (!resumo) return
    const texto = `Tô usando o Finlow pra entender pra onde meu dinheiro vai. Entra por aqui: ${resumo.url}`
    // Web Share abre a folha nativa no celular; sem ela, copia o link.
    if (navigator.share) {
      try {
        await navigator.share({ text: texto })
        return
      } catch {
        // cancelou a folha — não é erro, e copiar sem pedir seria surpresa
        return
      }
    }
    await copiar()
  }

  async function copiar() {
    if (!resumo) return
    try {
      await navigator.clipboard.writeText(resumo.url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {}
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-3.5">
      <p className="text-[13px] leading-relaxed text-fl-ink-2">
        Manda seu link pra quem também quer clareza com dinheiro. Quando a pessoa
        termina a primeira conversa, vocês dois ganham pontos.
      </p>

      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-xl border border-fl-border bg-fl-page px-3 py-2.5 text-[12.5px] text-fl-ink">
          {resumo.url}
        </code>
        <button
          onClick={copiar}
          aria-label="Copiar link"
          className="shrink-0 rounded-xl border border-fl-border bg-fl-page p-2.5 text-fl-ink-2 transition-colors hover:text-fl-ink"
        >
          {copiado ? <Check className="size-4 text-fl-success" /> : <Copy className="size-4" />}
        </button>
      </div>

      <button
        onClick={compartilhar}
        className="flex items-center justify-center gap-2 rounded-xl bg-fl-500 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        <Share2 className="size-4" /> Convidar
      </button>

      <div className="flex gap-4 text-[12.5px] text-fl-ink-2">
        <span>
          <strong className="font-semibold text-fl-ink">{resumo.cadastradas}</strong>{" "}
          {resumo.cadastradas === 1 ? "pessoa entrou" : "pessoas entraram"}
        </span>
        <span>
          <strong className="font-semibold text-fl-ink">{resumo.ativadas}</strong>{" "}
          {resumo.ativadas === 1 ? "já conversou" : "já conversaram"}
        </span>
      </div>
    </div>
  )
}
