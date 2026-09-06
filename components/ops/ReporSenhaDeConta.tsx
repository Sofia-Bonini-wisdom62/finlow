"use client"

import { useState } from "react"

interface Conta {
  userId: string
  nome: string | null
  login: string
  temSenha: boolean
  temGoogle: boolean
  escola: { escolaId: string; nome: string; papel: string } | null
  reposicao: { acao: "repor" | "so_google" | "nao_existe"; motivo: string }
}

/**
 * Procurar a conta, ver quem é, e só então repor a senha.
 *
 * Os dois passos são separados de propósito. Um campo só, com botão "repor",
 * põe um clique de distância entre "a Ana esqueceu a senha" e trocar a senha
 * da Ana errada — e a operadora descobriria pelo segundo pedido de suporte,
 * já com a conta de outra pessoa mexida.
 *
 * A senha aparece UMA vez, como no lote e na tela da escola: o banco guarda
 * só o hash, e recarregar a página não a traz de volta.
 */
export function ReporSenhaDeConta() {
  const [login, setLogin] = useState("")
  const [conta, setConta] = useState<Conta | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<{ senha: string; aviso: string | null } | null>(null)

  async function procurar(e: React.FormEvent) {
    e.preventDefault()
    setOcupado(true)
    setErro(null)
    setConta(null)
    setResultado(null)
    try {
      const r = await fetch(`/api/ops/contas?login=${encodeURIComponent(login)}`)
      const d = await r.json().catch(() => ({}))
      if (!r.ok) setErro(d.erro ?? "Não deu certo. Tenta de novo?")
      else setConta(d.conta)
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    }
    setOcupado(false)
  }

  async function repor(assumirContaGoogle: boolean) {
    if (!conta) return
    const quem = conta.nome ?? conta.login
    if (!confirm(`Sortear uma senha nova para ${quem}? A senha atual para de funcionar na hora.`)) {
      return
    }
    setOcupado(true)
    setErro(null)
    try {
      const r = await fetch("/api/ops/contas/senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: conta.login, assumirContaGoogle }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) setErro(d.erro ?? "Não deu certo. Tenta de novo?")
      else setResultado({ senha: d.senha, aviso: d.aviso ?? null })
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    }
    setOcupado(false)
  }

  return (
    <section className="rounded-2xl border border-fl-sand bg-fl-card p-5">
      <h3 className="text-base font-semibold text-fl-ink">Repor a senha de uma conta</h3>
      <p className="mt-1 text-sm text-fl-ink/60">
        Escreve o login inteiro, do jeito que a pessoa digita para entrar.
      </p>

      <form onSubmit={procurar} className="mt-4 flex flex-wrap gap-2">
        <input
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="pessoa@exemplo.com"
          className="min-w-0 flex-1 rounded-xl border border-fl-sand bg-fl-page px-3 py-2 font-mono text-sm text-fl-ink"
        />
        <button
          type="submit"
          disabled={ocupado || login.trim().length === 0}
          className="rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          style={{ background: "var(--fl-500)" }}
        >
          {ocupado ? "Procurando…" : "Procurar"}
        </button>
      </form>

      {conta && !resultado && (
        <div className="mt-4 rounded-xl border border-fl-sand bg-fl-page p-4">
          <p className="text-sm font-semibold text-fl-ink">{conta.nome ?? "sem nome"}</p>
          <p className="font-mono text-xs text-fl-ink/60">{conta.login}</p>

          <ul className="mt-2 space-y-1 text-xs text-fl-ink/70">
            <li>{conta.temSenha ? "Tem senha própria." : "Não tem senha própria."}</li>
            <li>{conta.temGoogle ? "Entra pelo Google." : "Não tem Google vinculado."}</li>
            {conta.escola && (
              <li>
                {conta.escola.papel} da escola {conta.escola.nome}. A escola também repõe, em
                /ops/escolas.
              </li>
            )}
          </ul>

          <p className="mt-3 text-xs text-fl-ink/70">{conta.reposicao.motivo}</p>

          {conta.reposicao.acao === "repor" ? (
            <button
              onClick={() => repor(false)}
              disabled={ocupado}
              className="mt-3 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              style={{ background: "var(--fl-500)" }}
            >
              Sortear senha nova
            </button>
          ) : (
            <div className="mt-3">
              <p className="text-xs text-fl-ink/50">
                Só se a pessoa também perdeu o acesso à conta do Google. Criar senha aqui põe uma
                credencial numa conta que estava protegida pelo login do Google.
              </p>
              <button
                onClick={() => repor(true)}
                disabled={ocupado}
                className="mt-2 rounded-xl border border-fl-sand bg-fl-card px-4 py-2.5 text-sm font-medium text-fl-ink disabled:opacity-60"
              >
                Criar senha assim mesmo
              </button>
            </div>
          )}
        </div>
      )}

      {resultado && (
        <div className="mt-4 rounded-xl border border-fl-sand bg-fl-page px-4 py-3">
          <p className="text-xs font-medium text-[var(--fl-error)]">
            Senha nova, anota agora porque ela não aparece de novo
          </p>
          <p className="select-all font-mono text-base font-bold text-fl-ink">{resultado.senha}</p>
          {resultado.aviso && <p className="mt-2 text-xs text-fl-ink/70">{resultado.aviso}</p>}
          <p className="mt-2 text-xs text-fl-ink/50">
            Quem já estava logado com a senha antiga continua logado até a sessão vencer: trocar a
            senha devolve o acesso de quem perdeu, não expulsa ninguém.
          </p>
          <button
            onClick={() => {
              setResultado(null)
              setConta(null)
              setLogin("")
            }}
            className="mt-2 text-xs font-medium text-fl-ink/60"
          >
            Já anotei
          </button>
        </div>
      )}

      {erro && <p className="mt-3 text-sm text-[var(--fl-error)]">{erro}</p>}
    </section>
  )
}
