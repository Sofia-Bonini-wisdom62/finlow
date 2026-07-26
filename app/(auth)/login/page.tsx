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

    router.push("/chat")
  }

  const inputClass =
    "w-full rounded-xl border border-[#FFFFFF] bg-[#FFFFFF] px-4 py-3.5 text-sm text-fl-ink placeholder-fl-ink-3 outline-none focus:border-[#2B6D70] transition-colors"

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center px-6 py-10"
      style={{ background: "radial-gradient(ellipse at top, rgba(43,109,112,0.08), transparent 55%), #FAF9F6" }}
    >
      <div className="w-full max-w-sm">
        <Link href="/" className="text-2xl font-bold tracking-tight" style={{ color: "#2B6D70" }}>
          Finlow
        </Link>

        <h1 className="mt-8 text-2xl font-bold text-fl-ink">Bom te ver de novo</h1>
        <p className="mt-1 text-sm" style={{ color: "#5C6469" }}>
          Entra pra continuar de onde parou.
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
            <p className="rounded-xl border border-[#AA4B3E]/30 bg-[#AA4B3E]/10 px-4 py-3 text-sm text-[#AA4B3E]">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="mt-2 w-full rounded-2xl py-4 text-base font-bold transition-opacity disabled:opacity-60"
            style={{ background: "#2B6D70", color: "#FAF9F6" }}
          >
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "#5C6469" }}>
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-semibold" style={{ color: "#2B6D70" }}>
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  )
}
