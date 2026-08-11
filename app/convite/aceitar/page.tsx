"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

/**
 * Conta EXISTENTE aceitando um convite de escola.
 *
 * Quem chega aqui veio de /convite/[codigo] já logado. Vincular conta a
 * escola é decisão com consequência (uma escola por conta, e aluno muda de
 * trilha) — por isso é um botão com o nome da escola na frente, nunca um
 * efeito colateral de abrir link.
 */
interface Preview {
  existe: boolean
  papel?: string
  escolaNome?: string
  turmaNome?: string | null
  recusa?: string | null
}

export default function AceitarConvitePage() {
  const router = useRouter()
  const [preview, setPreview] = useState<Preview | null>(null)
  const [apelido, setApelido] = useState("")
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    fetch("/api/convite/preview")
      .then((r) => r.json())
      .then(setPreview)
      .catch(() => setPreview({ existe: false }))
  }, [])

  async function aceitar() {
    setOcupado(true)
    setErro(null)
    try {
      const r = await fetch("/api/convite/resgatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apelido: apelido || undefined }),
      })
      const d = await r.json()
      if (!r.ok || !d.ok) {
        setErro(d.erro ?? "Não deu certo. Tenta de novo?")
        setOcupado(false)
        return
      }
      router.push(d.papel === "professor" ? "/escola" : "/trilha")
    } catch {
      setErro("Sem conexão. Tenta de novo?")
      setOcupado(false)
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

        {preview === null ? (
          <p className="mt-8 text-sm" style={{ color: "var(--fl-ink-2)" }}>
            Conferindo seu convite…
          </p>
        ) : !preview.existe ? (
          <>
            <h1 className="mt-8 text-2xl font-bold text-fl-ink">Convite não encontrado</h1>
            <p className="mt-2 text-sm" style={{ color: "var(--fl-ink-2)" }}>
              Não achei convite nenhum por aqui. Abre o link que a escola mandou de novo.
            </p>
            <Link href="/chat" className="mt-6 inline-block font-semibold" style={{ color: "var(--fl-500)" }}>
              Voltar para o app
            </Link>
          </>
        ) : preview.recusa ? (
          <>
            <h1 className="mt-8 text-2xl font-bold text-fl-ink">Esse convite não vale mais</h1>
            <p className="mt-2 text-sm" style={{ color: "var(--fl-ink-2)" }}>
              O convite da {preview.escolaNome} {preview.recusa === "expirado" ? "venceu" : preview.recusa === "esgotado" ? "já foi usado pelo número máximo de pessoas" : "foi cancelado"}.
              Pede um novo para quem te convidou.
            </p>
            <Link href="/chat" className="mt-6 inline-block font-semibold" style={{ color: "var(--fl-500)" }}>
              Voltar para o app
            </Link>
          </>
        ) : (
          <>
            <h1 className="mt-8 text-2xl font-bold text-fl-ink">
              Entrar na {preview.escolaNome}
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--fl-ink-2)" }}>
              {preview.papel === "aluno" && preview.turmaNome
                ? <>Sua conta vira conta de aluno da turma <strong>{preview.turmaNome}</strong>. Sua trilha passa a ser a da turma.</>
                : "Sua conta vira conta de professor desta escola."}
            </p>

            {preview.papel === "aluno" && (
              <div className="mt-6 flex flex-col gap-1.5">
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
              <p className="mt-4 rounded-xl border border-[var(--fl-error)]/30 bg-[var(--fl-error)]/10 px-4 py-3 text-sm text-[var(--fl-error)]">
                {erro}
              </p>
            )}

            <button
              onClick={aceitar}
              disabled={ocupado}
              className="mt-6 w-full rounded-2xl py-4 text-base font-bold transition-opacity disabled:opacity-60"
              style={{ background: "var(--fl-500)", color: "var(--primary-foreground)" }}
            >
              {ocupado ? "Entrando…" : "Entrar na escola com esta conta"}
            </button>
            <Link
              href="/chat"
              className="mt-4 block text-center text-sm font-medium"
              style={{ color: "var(--fl-ink-2)" }}
            >
              Agora não
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
