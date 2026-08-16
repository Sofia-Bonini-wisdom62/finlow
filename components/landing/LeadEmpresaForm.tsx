"use client"

import { useState } from "react"
import { Check } from "lucide-react"

/**
 * O formulário da página /empresas. Sem preço e sem promessa de prazo — o
 * envio abre uma CONVERSA, e é isso que o botão diz.
 */

const TAMANHOS = ["1-10", "11-50", "51-200", "200+"] as const

const inputCls =
  "w-full rounded-xl border border-fl-border bg-fl-page px-3.5 py-3 text-[14.5px] text-fl-ink outline-none placeholder:text-fl-ink-3 focus:border-fl-500"

export function LeadEmpresaForm() {
  const [empresa, setEmpresa] = useState("")
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [tamanho, setTamanho] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [estado, setEstado] = useState<"aberto" | "enviando" | "enviado">("aberto")
  const [erro, setErro] = useState<string | null>(null)

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setEstado("enviando")
    setErro(null)
    try {
      const r = await fetch("/api/empresas/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa,
          nome,
          email,
          ...(tamanho ? { tamanho } : {}),
          ...(mensagem.trim() ? { mensagem: mensagem.trim() } : {}),
        }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) {
        setEstado("aberto")
        setErro(d.error ?? "Não deu pra enviar agora. Tenta de novo?")
        return
      }
      setEstado("enviado")
    } catch {
      setEstado("aberto")
      setErro("A conexão caiu no meio. Tenta de novo?")
    }
  }

  if (estado === "enviado") {
    return (
      <div className="rounded-2xl border border-fl-500/30 bg-fl-50 p-6 text-center">
        <Check className="mx-auto size-8 text-fl-500" />
        <p className="mt-3 text-[15px] font-bold text-fl-ink">Recebido!</p>
        <p className="mt-1 text-sm leading-relaxed text-fl-ink-2">
          A gente te escreve em {email} pra marcar uma conversa. Sem spam: é um
          e-mail de gente, não de robô.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3">
      <input className={inputCls} placeholder="Nome da empresa" value={empresa} onChange={(e) => setEmpresa(e.target.value)} required maxLength={80} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <input className={inputCls} placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required maxLength={80} />
        <input className={inputCls} type="email" placeholder="E-mail de trabalho" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <select className={inputCls} value={tamanho} onChange={(e) => setTamanho(e.target.value)} aria-label="Quantas pessoas trabalham aí">
        <option value="">Quantas pessoas trabalham aí? (opcional)</option>
        {TAMANHOS.map((t) => (
          <option key={t} value={t}>{t} pessoas</option>
        ))}
      </select>
      <textarea
        className={`${inputCls} min-h-24 resize-y`}
        placeholder="Conta rapidinho o que você procura (opcional)"
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        maxLength={500}
      />

      {erro && <p className="text-sm text-fl-error">{erro}</p>}

      <button
        type="submit"
        disabled={estado === "enviando"}
        className="mt-1 rounded-xl bg-fl-500 py-3.5 text-[15px] font-bold text-primary-foreground transition-colors hover:bg-fl-600 disabled:opacity-60"
      >
        {estado === "enviando" ? "Enviando…" : "Quero conversar"}
      </button>
      <p className="text-center text-[12px] text-fl-ink-3">
        Usamos esses dados só pra essa conversa. Nada de lista de marketing.
      </p>
    </form>
  )
}
