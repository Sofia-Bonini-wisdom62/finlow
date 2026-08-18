"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

/**
 * O formulário que aposentou o terminal para o caso comum.
 *
 * A senha temporária volta na resposta e é mostrada aqui UMA vez, com o aviso
 * de que não aparece de novo: o banco guarda só o hash, e recarregar a página
 * a perde para sempre. É o mesmo contrato do script, que a imprimia no
 * console com o mesmo aviso.
 */
export function CriarEscola() {
  const router = useRouter()
  const [nome, setNome] = useState("")
  const [admEmail, setAdmEmail] = useState("")
  const [ativaAte, setAtivaAte] = useState("")
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [pronto, setPronto] = useState<{ senha: string | null; contaNova: boolean } | null>(null)

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    setOcupado(true)
    setErro(null)
    try {
      const r = await fetch("/api/ops/escolas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, admEmail, ativaAte }),
      })
      const d = await r.json()
      if (!r.ok) {
        setErro(d.erro ?? "Não deu certo. Tenta de novo?")
        setOcupado(false)
        return
      }
      setPronto({ senha: d.senhaTemporaria ?? null, contaNova: !!d.contaNova })
      setNome("")
      setAdmEmail("")
      setAtivaAte("")
      setOcupado(false)
      router.refresh()
    } catch {
      setErro("Sem conexão. Tenta de novo?")
      setOcupado(false)
    }
  }

  if (pronto) {
    return (
      <div className="rounded-xl border border-fl-sand bg-fl-page px-4 py-3">
        <p className="text-sm font-medium text-fl-ink">Escola criada.</p>
        {pronto.senha ? (
          <>
            <p className="mt-2 text-sm text-fl-ink/70">
              Senha temporária da administração, anota agora porque ela não aparece de novo:
            </p>
            <p className="mt-1 select-all font-mono text-base font-bold text-fl-ink">
              {pronto.senha}
            </p>
            <p className="mt-2 text-xs text-fl-ink/60">
              Peça para a pessoa trocar em Ajustes no primeiro acesso.
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-fl-ink/70">
            A conta já existia no Finlow e virou a administração desta escola. A senha continua
            sendo a que a pessoa já usava.
          </p>
        )}
        <button
          onClick={() => setPronto(null)}
          className="mt-3 text-sm font-medium"
          style={{ color: "var(--fl-500)" }}
        >
          Criar outra
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={criar} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-fl-ink/70">Nome da escola</span>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            minLength={2}
            placeholder="Colégio Santa Clara"
            className="mt-1 w-full rounded-xl border border-fl-sand bg-fl-page px-3 py-2 text-sm text-fl-ink"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-fl-ink/70">E-mail de quem administra</span>
          <input
            type="email"
            value={admEmail}
            onChange={(e) => setAdmEmail(e.target.value)}
            required
            placeholder="direcao@colegio.com.br"
            className="mt-1 w-full rounded-xl border border-fl-sand bg-fl-page px-3 py-2 text-sm text-fl-ink"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-medium text-fl-ink/70">
          Fim do contrato (opcional, vazio é piloto sem prazo)
        </span>
        <input
          type="date"
          value={ativaAte}
          onChange={(e) => setAtivaAte(e.target.value)}
          className="mt-1 w-full rounded-xl border border-fl-sand bg-fl-page px-3 py-2 text-sm text-fl-ink sm:w-56"
        />
      </label>
      <button
        type="submit"
        disabled={ocupado}
        className="rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        style={{ background: "var(--fl-500)" }}
      >
        {ocupado ? "Criando…" : "Criar escola"}
      </button>
      {erro && <p className="text-sm text-[var(--fl-error)]">{erro}</p>}
    </form>
  )
}
