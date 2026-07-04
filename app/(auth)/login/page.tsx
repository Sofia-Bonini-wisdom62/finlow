"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)

    const res = await signIn("credentials", { email, senha, redirect: false })

    if (res?.error) {
      setErro("Email ou senha incorretos.")
      setEnviando(false)
      return
    }

    router.push("/trilha")
  }

  const inputClass =
    "w-full rounded-xl border border-[#1A2B3C] bg-[#1A2B3C] px-4 py-3.5 text-sm text-white placeholder-[#A0AEC0] outline-none focus:border-[#00C896] transition-colors"

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center px-6 py-10"
      style={{ background: "radial-gradient(ellipse at top, rgba(0,200,150,0.08), transparent 55%), #0D1B2A" }}
    >
      <div className="w-full max-w-sm">
        <Link href="/" className="text-2xl font-bold tracking-tight" style={{ color: "#00C896" }}>
          Finlow
        </Link>

        <h1 className="mt-8 text-2xl font-bold text-white">Bom te ver de novo</h1>
        <p className="mt-1 text-sm" style={{ color: "#A0AEC0" }}>
          Entra pra continuar sua trilha.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className={inputClass}
          />

          {erro && (
            <p className="rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-4 py-3 text-sm text-[#F87171]">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="mt-2 w-full rounded-2xl py-4 text-base font-bold transition-opacity disabled:opacity-60"
            style={{ background: "#00C896", color: "#0D1B2A" }}
          >
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "#A0AEC0" }}>
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-semibold" style={{ color: "#00C896" }}>
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  )
}
