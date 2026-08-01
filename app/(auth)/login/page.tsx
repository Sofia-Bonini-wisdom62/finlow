"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { BotaoGoogle } from "@/components/auth/BotaoGoogle"

/**
 * Quando o login pelo Google falha, o NextAuth traz a pessoa de volta para cá
 * com ?error=. Sem tradução ela lê "OAuthAccountNotLinked" e não tem como
 * saber que a conta dela existe e só precisa da senha.
 *
 * O caso que mais acontece é justamente esse: cadastrou com e-mail e senha,
 * meses depois tenta o botão do Google com o mesmo e-mail.
 */
const ERROS_OAUTH: Record<string, string> = {
  OAuthAccountNotLinked:
    "Esse e-mail já tem conta aqui, criada com senha. Entra com a senha aqui embaixo.",
  AccessDenied: "O Google não liberou o acesso. Tenta de novo ou entra com e-mail e senha.",
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  // Lido do window em vez de useSearchParams: esta página é estática, e o hook
  // exigiria envolvê-la num Suspense só para ler um parâmetro de erro.
  useEffect(() => {
    const codigo = new URLSearchParams(window.location.search).get("error")
    if (!codigo) return
    setErro(ERROS_OAUTH[codigo] ?? "Não deu pra entrar com o Google. Tenta de novo?")
  }, [])

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
    "w-full rounded-xl border border-fl-border bg-fl-card px-4 py-3.5 text-sm text-fl-ink placeholder-fl-ink-3 outline-none focus:border-[var(--fl-500)] transition-colors"

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center px-6 py-10"
      style={{ background: "radial-gradient(ellipse at top, rgba(43,109,112,0.08), transparent 55%), var(--fl-page)" }}
    >
      <div className="w-full max-w-sm">
        <Link href="/" className="text-2xl font-bold tracking-tight" style={{ color: "var(--fl-500)" }}>
          Finlow
        </Link>

        <h1 className="mt-8 text-2xl font-bold text-fl-ink">Bom te ver de novo</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--fl-ink-2)" }}>
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
            <p className="rounded-xl border border-[var(--fl-error)]/30 bg-[var(--fl-error)]/10 px-4 py-3 text-sm text-[var(--fl-error)]">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="mt-2 w-full rounded-2xl py-4 text-base font-bold transition-opacity disabled:opacity-60"
            style={{ background: "var(--fl-500)", color: "var(--primary-foreground)" }}
          >
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <BotaoGoogle />

        <p className="mt-6 text-center text-sm" style={{ color: "var(--fl-ink-2)" }}>
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-semibold" style={{ color: "var(--fl-500)" }}>
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  )
}
