"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { BotaoGoogle } from "@/components/auth/BotaoGoogle"

/**
 * O convite de escola chega por COOKIE (plantado em /convite/[codigo]), não
 * por query: quem fecha a aba e volta amanhã ainda cai na turma certa. O
 * banner pergunta à API o que o cookie diz — a página não decide nada.
 */
interface Convite {
  papel: string
  escolaNome: string
  turmaNome: string | null
  recusa: string | null
}

// máscara DD/MM/AAAA — insere as barras enquanto digita
function maskData(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

// "15/03/2008" -> "2008-03-15" (ISO pra API); null se inválida
function parseData(v: string): string | null {
  const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  const [, dd, mm, aaaa] = m
  const dia = Number(dd)
  const mes = Number(mm)
  const ano = Number(aaaa)
  const dt = new Date(ano, mes - 1, dia)
  // rejeita datas que "rolam" (ex: 31/02 vira 02/03)
  if (dt.getFullYear() !== ano || dt.getMonth() !== mes - 1 || dt.getDate() !== dia) return null
  if (ano < 1900 || dt > new Date()) return null
  return `${aaaa}-${mm}-${dd}`
}

export default function CadastroPage() {
  const router = useRouter()
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [dataNascimento, setDataNascimento] = useState("")
  const [apelido, setApelido] = useState("")
  const [convite, setConvite] = useState<Convite | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    fetch("/api/convite/preview")
      .then((r) => r.json())
      .then((d) => {
        if (d?.existe) setConvite(d)
      })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)

    const dataISO = parseData(dataNascimento)
    if (!dataISO) {
      setErro("Data de nascimento inválida, usa o formato DD/MM/AAAA")
      return
    }

    setEnviando(true)

    try {
      // Nada de perfil daqui: ele é inferido na primeira conversa, depois do
      // cadastro. Mandar o que estivesse no localStorage deste navegador só
      // conseguiria herdar o perfil da conta anterior — ver /api/cadastro.
      const res = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha, dataNascimento: dataISO, apelido: apelido || undefined }),
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

      // Professor cai direto na superfície da escola; todo o resto (aluno
      // inclusive) passa pelo onboarding normal, que é pulável.
      router.push(data.escolaPapel === "professor" ? "/escola" : "/onboarding")
    } catch {
      setErro("Sem conexão. Tenta de novo?")
      setEnviando(false)
    }
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

        <h1 className="mt-8 text-2xl font-bold text-fl-ink">Cria sua conta</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--fl-ink-2)" }}>
          Pra salvar seu perfil e seu progresso na trilha.
        </p>

        {convite && !convite.recusa && (
          <div className="mt-4 rounded-xl border border-[var(--fl-500)]/30 bg-[var(--fl-500)]/10 px-4 py-3 text-sm text-fl-ink">
            Você está entrando na <strong>{convite.escolaNome}</strong>
            {convite.papel === "aluno" && convite.turmaNome
              ? <> como aluno da turma <strong>{convite.turmaNome}</strong>.</>
              : convite.papel === "professor"
                ? <> como professor.</>
                : "."}
          </div>
        )}
        {convite?.recusa && (
          <div className="mt-4 rounded-xl border border-[var(--fl-error)]/30 bg-[var(--fl-error)]/10 px-4 py-3 text-sm text-fl-ink">
            Seu convite da {convite.escolaNome} não vale mais — pede um novo. Dá pra criar a
            conta mesmo assim.
          </div>
        )}

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
            <label htmlFor="dataNascimento" className="text-sm font-medium" style={{ color: "var(--fl-ink-2)" }}>
              Data de nascimento
            </label>
            <input
              id="dataNascimento"
              type="text"
              inputMode="numeric"
              autoComplete="bday"
              placeholder="DD/MM/AAAA"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(maskData(e.target.value))}
              required
              maxLength={10}
              className={inputClass}
            />
          </div>

          {convite?.papel === "aluno" && !convite.recusa && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="apelido" className="text-sm font-medium" style={{ color: "var(--fl-ink-2)" }}>
                Como você quer aparecer no ranking da sala? (opcional)
              </label>
              <input
                id="apelido"
                type="text"
                placeholder="Seu apelido"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                maxLength={24}
                className={inputClass}
              />
            </div>
          )}

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
            {enviando ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <BotaoGoogle rotulo="Criar conta com o Google" />

        <p className="mt-6 text-center text-sm" style={{ color: "var(--fl-ink-2)" }}>
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "var(--fl-500)" }}>
            Entrar
          </Link>
        </p>
      </div>
    </main>
  )
}
