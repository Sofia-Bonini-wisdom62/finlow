"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

/**
 * Adiciona uma pessoa só, sem convite.
 *
 * Fica ao lado da lista de pessoas e não junto do lote de propósito: o lote é
 * o começo do ano, isto é o professor que chegou em maio. Misturar os dois
 * numa tela só faria a operadora procurar o formulário grande para cadastrar
 * um nome.
 *
 * O aviso de e-mail muda com o papel porque a regra muda: aluno pode não ter
 * endereço (vira login .invalid), professor precisa ter, senão a conta dele
 * não tem como ser recuperada.
 */
export function AdicionarPessoa({
  escolaId,
  turmas,
}: {
  escolaId: string
  turmas: { id: string; nome: string }[]
}) {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [papel, setPapel] = useState<"professor" | "aluno">("aluno")
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [turmaId, setTurmaId] = useState("")
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [pronto, setPronto] = useState<{ login: string; senha: string | null } | null>(null)

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setOcupado(true)
    setErro(null)
    try {
      const r = await fetch(`/api/ops/escolas/${escolaId}/membros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ papel, nome, email, turmaId: papel === "aluno" ? turmaId : null }),
      })
      const d = await r.json()
      if (!r.ok) {
        setErro(d.erro ?? "Não deu certo. Tenta de novo?")
        setOcupado(false)
        return
      }
      setPronto({ login: d.login, senha: d.senha ?? null })
      setNome("")
      setEmail("")
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
        <p className="text-sm font-medium text-fl-ink">Pessoa adicionada.</p>
        <p className="mt-2 text-xs text-fl-ink/60">Login</p>
        <p className="select-all font-mono text-sm text-fl-ink">{pronto.login}</p>
        {pronto.senha ? (
          <>
            <p className="mt-2 text-xs font-medium text-[var(--fl-error)]">
              Senha, anota agora porque ela não aparece de novo
            </p>
            <p className="select-all font-mono text-base font-bold text-fl-ink">{pronto.senha}</p>
          </>
        ) : (
          <p className="mt-2 text-sm text-fl-ink/70">
            A conta já existia no Finlow e foi vinculada à escola. A senha continua sendo a que a
            pessoa já usava.
          </p>
        )}
        <button
          onClick={() => setPronto(null)}
          className="mt-3 text-sm font-medium"
          style={{ color: "var(--fl-500)" }}
        >
          Adicionar outra
        </button>
      </div>
    )
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="rounded-xl border border-fl-sand bg-fl-page px-4 py-2.5 text-sm font-medium text-fl-ink"
      >
        Adicionar pessoa
      </button>
    )
  }

  return (
    <form onSubmit={enviar} className="space-y-3 rounded-xl border border-fl-sand bg-fl-page p-4">
      <div className="flex gap-2">
        {(["aluno", "professor"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPapel(p)}
            className="rounded-lg px-3 py-1.5 text-xs font-bold"
            style={
              papel === p
                ? { background: "var(--fl-500)", color: "white" }
                : { background: "var(--fl-sand)", color: "var(--fl-ink)" }
            }
          >
            {p}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="text-xs font-medium text-fl-ink/70">Nome</span>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          minLength={2}
          placeholder="Ana Beatriz Souza"
          className="mt-1 w-full rounded-xl border border-fl-sand bg-fl-card px-3 py-2 text-sm text-fl-ink"
        />
      </label>

      <label className="block">
        <span className="text-xs font-medium text-fl-ink/70">
          {papel === "professor"
            ? "E-mail (obrigatório: é por ele que a conta é recuperada)"
            : "E-mail (opcional: sem ele, geramos um login para a criança)"}
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required={papel === "professor"}
          placeholder={papel === "professor" ? "professor@colegio.com.br" : "deixa vazio se não tem"}
          className="mt-1 w-full rounded-xl border border-fl-sand bg-fl-card px-3 py-2 text-sm text-fl-ink"
        />
      </label>

      {papel === "aluno" && (
        <label className="block">
          <span className="text-xs font-medium text-fl-ink/70">Turma</span>
          <select
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value)}
            required
            className="mt-1 block w-full rounded-xl border border-fl-sand bg-fl-card px-3 py-2 text-sm text-fl-ink sm:w-72"
          >
            <option value="">escolha a turma</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={ocupado}
          className="rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          style={{ background: "var(--fl-500)" }}
        >
          {ocupado ? "Adicionando…" : "Adicionar"}
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="text-sm font-medium text-fl-ink/60"
        >
          Cancelar
        </button>
      </div>
      {erro && <p className="text-sm text-[var(--fl-error)]">{erro}</p>}
    </form>
  )
}
