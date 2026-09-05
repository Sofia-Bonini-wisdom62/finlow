"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { BotaoGoogle } from "@/components/auth/BotaoGoogle"
import { LOGO_FIN } from "@/lib/fin"

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
    // Numa microtask: a regra de hooks proíbe setState síncrono no efeito.
    Promise.resolve().then(() =>
      setErro(ERROS_OAUTH[codigo] ?? "Não deu pra entrar com o Google. Tenta de novo?")
    )
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
    "w-full rounded-[14px] border-[1.5px] border-[var(--fin-border-2)] bg-[var(--fin-surface)] px-4 py-3.5 text-sm text-[var(--fin-text)] placeholder-[var(--fin-dim)] outline-none focus:border-[var(--fin-accent)] transition-colors"

  return (
    <main
      className="tema-fin flex min-h-dvh flex-col items-center justify-center px-6 py-10"
      style={{ background: "radial-gradient(ellipse at top, color-mix(in srgb, var(--fin-accent) 7%, transparent), transparent 55%), var(--fin-bg)" }}
    >
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_FIN} alt="Finlow" className="size-[52px] rounded-xl" />
        </Link>

        <h1 className="mt-6 text-2xl font-black" style={{ color: "var(--fin-text)" }}>Bom te ver de novo</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--fin-muted)" }}>
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
            <p
              className="rounded-xl border px-4 py-3 text-sm"
              style={{
                borderColor: "color-mix(in srgb, var(--fin-erro) 40%, transparent)",
                background: "color-mix(in srgb, var(--fin-erro) 10%, transparent)",
                color: "var(--fin-erro)",
              }}
            >
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="fin-btn-3d mt-2 w-full rounded-2xl py-4 text-base font-extrabold transition-opacity disabled:opacity-60"
            style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
          >
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/*
          A porta que faltava. Sem ela, quem esquecia a senha ficava olhando o
          formulário sem saber que existia saída — e a saída existe, mesmo sem
          link automático por e-mail. O destino explica o que dá para fazer
          hoje em vez de prometer uma mensagem que não sai.
        */}
        <p className="mt-3 text-center text-sm">
          <Link href="/esqueci-senha" className="font-bold" style={{ color: "var(--fin-muted)" }}>
            Esqueci minha senha
          </Link>
        </p>

        <BotaoGoogle />

        <p className="mt-6 text-center text-sm" style={{ color: "var(--fin-muted)" }}>
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-extrabold" style={{ color: "var(--fin-accent)" }}>
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  )
}
