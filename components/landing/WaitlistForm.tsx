"use client"

import { useState } from "react"

/**
 * Captura de e-mail da landing. NÃO é mais lista de espera: o app está no ar e
 * /cadastro é aberto, então "avisamos quando abrir" era promessa vencida — quem
 * deixava o e-mail já podia entrar naquele minuto.
 *
 * A tabela `Waitlist` e a rota `/api/waitlist` continuam as mesmas de
 * propósito: os e-mails já coletados não se perdem e o delete de conta segue
 * limpando o registro (`app/api/conta/route.ts`). O que mudou é só o que a
 * tela promete, e o caminho para quem quer usar agora.
 */
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
        <div className="mx-auto mb-3.5 flex h-13 w-13 items-center justify-center rounded-full bg-fl-500 text-2xl text-primary-foreground" style={{ height: 52, width: 52 }}>
          ✓
        </div>
        <div className="mb-1.5 text-[19px] font-bold text-fl-ink">Pronto, anotado!</div>
        <div className="text-[15px] text-fl-ink-2">
          Mandaremos as novidades do Finlow para <strong className="text-fl-ink">{email}</strong>.
          Para usar agora, é só{" "}
          <a href="/cadastro" className="font-semibold text-fl-500 underline underline-offset-4 hover:text-fl-600">
            criar sua conta
          </a>{" "}
          — é grátis.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[480px]">
      <form onSubmit={submeter} className="flex flex-col gap-2.5 sm:flex-row">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErro(null) }}
          placeholder="seu@email.com"
          aria-label="Seu e-mail"
          className="w-full rounded-[14px] border-[1.5px] border-fl-border bg-fl-card px-[18px] py-[15px] text-base text-fl-ink outline-none focus:border-fl-500 sm:min-w-[200px] sm:flex-1"
        />
        <button
          type="submit"
          disabled={enviando}
          className="w-full shrink-0 rounded-[14px] bg-fl-500 px-7 py-[15px] text-base font-semibold text-primary-foreground shadow-[0_2px_8px_rgba(43,109,112,.28)] transition-colors hover:bg-fl-600 disabled:opacity-60 sm:w-auto"
        >
          {enviando ? "Salvando…" : "Quero acompanhar"}
        </button>
      </form>
      {erro && <div className="mt-2.5 text-left text-[13.5px] font-medium text-fl-error">{erro}</div>}
      <div className="mt-3.5 text-[12.5px] text-fl-sand-text/70">
        🔒 Seus dados ficam com você. Nunca vendemos nada, nunca viramos vitrine de anúncio.
      </div>
    </div>
  )
}
