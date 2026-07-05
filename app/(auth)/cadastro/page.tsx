"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"

export default function CadastroPage() {
  const router = useRouter()
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [dataNascimento, setDataNascimento] = useState("")
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)

    try {
      // se já fez o diagnóstico sem conta, aproveita e vincula o perfil
      const perfilTipo = localStorage.getItem("finlow_perfil")

      const res = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha, dataNascimento, perfilTipo }),
      })

      const data = await res.json()
      if (!res.ok) {
        setErro(data.error ?? "Algo deu errado. Tenta de novo?")
        setEnviando(false)
        return
      }

      // loga direto após criar a conta
      const login = await signIn("credentials", { email, senha, redirect: false })
      if (login?.error) {
        router.push("/login")
        return
      }

      router.push(perfilTipo ? "/trilha" : "/diagnostico")
    } catch {
      setErro("Sem conexão. Tenta de novo?")
      setEnviando(false)
    }
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

        <h1 className="mt-8 text-2xl font-bold text-white">Cria sua conta</h1>
        <p className="mt-1 text-sm" style={{ color: "#A0AEC0" }}>
          Pra salvar seu perfil e seu progresso na trilha.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Seu nome (ou apelido)"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className={inputClass}
          />
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
            placeholder="Senha (mínimo 6 caracteres)"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength={6}
            className={inputClass}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dataNascimento" className="text-sm font-medium" style={{ color: "#A0AEC0" }}>
              Data de nascimento
            </label>
            <input
              id="dataNascimento"
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              required
              max={new Date().toISOString().split("T")[0]}
              className={`${inputClass} [color-scheme:dark]`}
            />
          </div>

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
            {enviando ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "#A0AEC0" }}>
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "#00C896" }}>
            Entrar
          </Link>
        </p>
      </div>
    </main>
  )
}
