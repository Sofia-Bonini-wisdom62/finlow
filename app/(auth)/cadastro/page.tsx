"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { BotaoGoogle } from "@/components/auth/BotaoGoogle"
import { LOGO_FIN } from "@/lib/fin"

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

// máscara (11) 99999-9999 — só visual; a API recebe os dígitos
function maskCelular(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
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
  const [celular, setCelular] = useState("")
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
        body: JSON.stringify({
          nome,
          email,
          senha,
          dataNascimento: dataISO,
          celular: celular.replace(/\D/g, "") || undefined,
          apelido: apelido || undefined,
        }),
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

        <h1 className="mt-6 text-2xl font-black" style={{ color: "var(--fin-text)" }}>Cria sua conta</h1>
        {/*
          SEM PALAVRA DE DENTRO DO APP AQUI (item 4 da avaliação de UX).
          Dizia "Pra salvar seu perfil e seu progresso na trilha": "trilha" é o
          nome que a gente dá às aulas DEPOIS que a pessoa entra, e quem está
          nesta tela nunca viu essa palavra. A landing que trouxe ela até aqui
          fala em conta grátis, extrato e IA, e é essa a linha que continua.
          Guardado por scripts/testar-landing.mts.
        */}
        <p className="mt-1 text-sm" style={{ color: "var(--fin-muted)" }}>
          É grátis e leva menos de um minuto. A conta guarda seus números, suas conversas
          com a IA e o que você aprender por aqui.
        </p>

        {convite && !convite.recusa && (
          <div
            className="mt-4 rounded-xl border px-4 py-3 text-sm"
            style={{
              borderColor: "color-mix(in srgb, var(--fin-accent) 40%, transparent)",
              background: "color-mix(in srgb, var(--fin-accent) 10%, transparent)",
              color: "var(--fin-text)",
            }}
          >
            Você está entrando na <strong>{convite.escolaNome}</strong>
            {convite.papel === "aluno" && convite.turmaNome
              ? <> como aluno da turma <strong>{convite.turmaNome}</strong>.</>
              : convite.papel === "professor"
                ? <> como professor.</>
                : "."}
          </div>
        )}
        {convite?.recusa && (
          <div
            className="mt-4 rounded-xl border px-4 py-3 text-sm"
            style={{
              borderColor: "color-mix(in srgb, var(--fin-erro) 40%, transparent)",
              background: "color-mix(in srgb, var(--fin-erro) 10%, transparent)",
              color: "var(--fin-text)",
            }}
          >
            Seu convite da {convite.escolaNome} não vale mais, pede um novo. Dá pra criar a
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
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Celular com DDD: (11) 99999-9999"
            aria-label="Celular com DDD (opcional)"
            value={celular}
            onChange={(e) => setCelular(maskCelular(e.target.value))}
            maxLength={16}
            className={inputClass}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dataNascimento" className="text-sm font-bold" style={{ color: "var(--fin-muted)" }}>
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
            <p className="text-[11.5px] leading-snug" style={{ color: "var(--fin-dim)" }}>
              Usamos pra adequar o conteúdo à sua idade, e garantir que menores nunca vejam anúncio.
            </p>
          </div>

          {/* Sempre visível desde o protótipo v2 — o apelido alimenta a Liga
              (e o rank da sala, para quem chega por convite).

              O rótulo diz "ranking", não "liga", pelo mesmo motivo do subtítulo
              acima: "Liga" é o nome da tela, aprendido lá dentro. Quem está
              criando conta ainda não tem como saber que existe uma. A tela em si
              continua se chamando Liga. */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="apelido" className="text-sm font-bold" style={{ color: "var(--fin-muted)" }}>
              {convite?.papel === "aluno" && !convite.recusa
                ? "Como você quer aparecer no ranking da sala? (opcional)"
                : "Como você quer aparecer no ranking? (opcional)"}
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
            {enviando ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <BotaoGoogle rotulo="Criar conta com o Google" />

        <p className="mt-6 text-center text-sm" style={{ color: "var(--fin-muted)" }}>
          Já tem conta?{" "}
          <Link href="/login" className="font-extrabold" style={{ color: "var(--fin-accent)" }}>
            Entrar
          </Link>
        </p>
      </div>
    </main>
  )
}
