"use client"

import { useState } from "react"

export function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function submeter(e: React.FormEvent) {
    e.preventDefault()
    const valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!valido) {
      setErro("Digite um e-mail válido para continuar.")
      return
    }

    setEnviando(true)
    setErro(null)
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErro(data.error ?? "Não deu pra salvar agora. Tenta de novo?")
        setEnviando(false)
        return
      }
      setEnviado(true)
    } catch {
      setErro("Sem conexão. Tenta de novo?")
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <div className="mx-auto max-w-[460px] rounded-2xl bg-fl-page p-7">
        <div className="mx-auto mb-3.5 flex h-13 w-13 items-center justify-center rounded-full bg-fl-500 text-2xl text-white" style={{ height: 52, width: 52 }}>
          ✓
        </div>
        <div className="mb-1.5 text-[19px] font-bold text-fl-ink">Você está na lista!</div>
        <div className="text-[15px] text-fl-ink-2">
          Avisaremos em <strong className="text-fl-ink">{email}</strong> assim que o acesso abrir.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[480px]">
      <form onSubmit={submeter} className="flex flex-wrap gap-2.5">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErro(null) }}
          placeholder="seu@email.com"
          aria-label="Seu e-mail"
          className="min-w-[200px] flex-1 rounded-[14px] border-[1.5px] border-[#d8cdb8] bg-fl-page px-[18px] py-[15px] text-base text-fl-ink outline-none focus:border-fl-500"
        />
        <button
          type="submit"
          disabled={enviando}
          className="rounded-[14px] bg-fl-500 px-7 py-[15px] text-base font-semibold text-white shadow-[0_2px_8px_rgba(43,109,112,.28)] transition-colors hover:bg-fl-600 disabled:opacity-60"
        >
          {enviando ? "Salvando…" : "Garantir minha vaga →"}
        </button>
      </form>
      {erro && <div className="mt-2.5 text-left text-[13.5px] font-medium text-fl-error">{erro}</div>}
      <div className="mt-3.5 text-[12.5px] text-[#8c8069]">
        🔒 Seus dados ficam com você. Nunca vendemos nada, nunca viramos vitrine de anúncio.
      </div>
    </div>
  )
}
