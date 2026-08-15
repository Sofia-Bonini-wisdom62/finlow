"use client"

import { useEffect, useState } from "react"
import { getProviders, signIn } from "next-auth/react"

/**
 * Entrar com o Google.
 *
 * POR QUE O BOTÃO SE ESCONDE SOZINHO
 * O provider do Google só é registrado quando GOOGLE_CLIENT_ID e
 * GOOGLE_CLIENT_SECRET existem (lib/auth.ts). Botão fixo no HTML apareceria
 * mesmo sem as chaves e levaria a uma tela de erro do NextAuth — pior que não
 * ter o botão, porque a pessoa conclui que a conta dela é que tem problema.
 *
 * `getProviders()` pergunta ao servidor quem está ligado. Assim o dia em que as
 * chaves entrarem na Vercel o botão aparece sozinho, sem mexer em código.
 *
 * PARA ONDE VAI DEPOIS
 * Sempre /onboarding. Quem é novo faz a primeira conversa; quem já fez é
 * mandado para /chat pela própria tela, que checa isso na entrada. Um destino
 * só, sem precisar adivinhar aqui se a conta é nova.
 */

function MarcaGoogle() {
  return (
    <svg viewBox="0 0 48 48" className="size-[18px] shrink-0" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

export function BotaoGoogle({ rotulo = "Entrar com o Google" }: { rotulo?: string }) {
  const [disponivel, setDisponivel] = useState(false)
  const [indo, setIndo] = useState(false)

  useEffect(() => {
    let vivo = true
    getProviders()
      .then((p) => { if (vivo) setDisponivel(!!p?.google) })
      .catch(() => {})
    return () => { vivo = false }
  }, [])

  if (!disponivel) return null

  return (
    <>
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1" style={{ background: "var(--fin-border, var(--fl-divider))" }} />
        <span className="text-[12px]" style={{ color: "var(--fin-dim, var(--fl-ink-3))" }}>ou</span>
        <span className="h-px flex-1" style={{ background: "var(--fin-border, var(--fl-divider))" }} />
      </div>

      {/* Botão creme do protótipo — destaca do navy sem competir com o dourado. */}
      <button
        type="button"
        onClick={() => { setIndo(true); signIn("google", { callbackUrl: "/onboarding" }) }}
        disabled={indo}
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl py-3.5 text-[14.5px] font-extrabold transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ background: "var(--fin-creme, #F6E9CE)", color: "#0C1B21" }}
      >
        <MarcaGoogle />
        {indo ? "Abrindo o Google…" : rotulo}
      </button>
    </>
  )
}
