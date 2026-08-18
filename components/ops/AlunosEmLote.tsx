"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Criado {
  nome: string
  login: string
  senha: string
}

/**
 * A EXCEÇÃO: contas de aluno criadas pela operação, para quem não tem e-mail.
 *
 * O caminho normal continua sendo o convite, e a tela diz isso antes de
 * qualquer campo. Isto existe para o Fundamental 1, onde a criança não tem
 * e-mail nem celular e portanto não tem como receber um link.
 *
 * As senhas aparecem UMA vez. Recarregar a página as perde, porque o banco
 * guarda só o hash, e é por isso que a tela insiste em baixar o arquivo antes
 * de sair daqui.
 */
export function AlunosEmLote({
  escolaId,
  turmas,
}: {
  escolaId: string
  turmas: { id: string; nome: string }[]
}) {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [turmaId, setTurmaId] = useState("")
  const [lista, setLista] = useState("")
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [criados, setCriados] = useState<Criado[] | null>(null)
  const [ignoradas, setIgnoradas] = useState(0)

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    setOcupado(true)
    setErro(null)
    try {
      const r = await fetch(`/api/ops/escolas/${escolaId}/alunos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turmaId, lista }),
      })
      const d = await r.json()
      if (!r.ok) {
        setErro(d.erro ?? "Não deu certo. Tenta de novo?")
        setOcupado(false)
        return
      }
      setCriados(d.criados as Criado[])
      setIgnoradas(d.ignoradas ?? 0)
      setLista("")
      setOcupado(false)
      router.refresh()
    } catch {
      setErro("Sem conexão. Tenta de novo?")
      setOcupado(false)
    }
  }

  function baixarCsv() {
    if (!criados) return
    const linhas = [
      "nome,login,senha",
      ...criados.map((c) => `"${c.nome.replace(/"/g, '""')}",${c.login},${c.senha}`),
    ]
    const blob = new Blob(["﻿" + linhas.join("\r\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "alunos-finlow.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (criados) {
    return (
      <section className="rounded-2xl border border-fl-sand bg-fl-card p-5">
        <h3 className="text-base font-semibold text-fl-ink">
          {criados.length} conta{criados.length === 1 ? "" : "s"} criada
          {criados.length === 1 ? "" : "s"}
        </h3>
        <p className="mt-1 text-sm font-medium text-[var(--fl-error)]">
          Baixe o arquivo agora. As senhas não aparecem de novo em lugar nenhum.
        </p>
        {ignoradas > 0 && (
          <p className="mt-1 text-xs text-fl-ink/60">
            {ignoradas} linha{ignoradas === 1 ? "" : "s"} da lista não tinha nome legível e ficou
            de fora.
          </p>
        )}
        <div className="mt-3 max-h-64 overflow-auto rounded-xl border border-fl-sand bg-fl-page">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-fl-page">
              <tr className="text-left text-fl-ink/50">
                <th className="px-3 py-2 font-medium">Nome</th>
                <th className="px-3 py-2 font-medium">Login</th>
                <th className="px-3 py-2 font-medium">Senha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fl-sand">
              {criados.map((c) => (
                <tr key={c.login}>
                  <td className="px-3 py-1.5 text-fl-ink">{c.nome}</td>
                  <td className="px-3 py-1.5 font-mono text-fl-ink">{c.login}</td>
                  <td className="px-3 py-1.5 font-mono font-bold text-fl-ink">{c.senha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex gap-3">
          <button
            onClick={baixarCsv}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-white"
            style={{ background: "var(--fl-500)" }}
          >
            Baixar CSV
          </button>
          <button
            onClick={() => setCriados(null)}
            className="text-sm font-medium text-fl-ink/60"
          >
            Já baixei, fechar
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-fl-sand bg-fl-card p-5">
      <h3 className="text-base font-semibold text-fl-ink">Criar contas de aluno em lote</h3>
      <p className="mt-1 text-sm text-fl-ink/60">
        O caminho normal é o convite da turma, em que cada aluno cria a própria conta e escolhe a
        própria senha. Use isto só quando a criança não tem e-mail para receber o link.
      </p>

      {!aberto ? (
        <button
          onClick={() => setAberto(true)}
          className="mt-3 rounded-xl border border-fl-sand bg-fl-page px-4 py-2.5 text-sm font-medium text-fl-ink"
        >
          Abrir mesmo assim
        </button>
      ) : (
        <form onSubmit={criar} className="mt-4 space-y-3">
          <p className="rounded-xl border border-fl-accent/40 bg-fl-accent/10 px-4 py-3 text-xs text-fl-ink">
            Ao criar contas assim, a escola passa a conhecer a senha inicial de cada aluno e o
            Finlow passa a guardar nome de criança. A política de privacidade para menores ainda
            não existe, então isto é uso com risco assumido. Só o nome é pedido: nada de data de
            nascimento, e-mail, telefone ou nome de responsável.
          </p>

          <label className="block">
            <span className="text-xs font-medium text-fl-ink/70">Turma</span>
            <select
              value={turmaId}
              onChange={(e) => setTurmaId(e.target.value)}
              required
              className="mt-1 block w-full rounded-xl border border-fl-sand bg-fl-page px-3 py-2 text-sm text-fl-ink sm:w-72"
            >
              <option value="">escolha a turma</option>
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-fl-ink/70">
              Um nome por linha (pode colar direto da planilha)
            </span>
            <textarea
              value={lista}
              onChange={(e) => setLista(e.target.value)}
              required
              rows={8}
              placeholder={"Ana Beatriz Souza\nCarlos Eduardo Lima\nMariana Alves"}
              className="mt-1 w-full rounded-xl border border-fl-sand bg-fl-page px-3 py-2 font-mono text-sm text-fl-ink"
            />
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={ocupado || !turmaId}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              style={{ background: "var(--fl-500)" }}
            >
              {ocupado ? "Criando…" : "Criar contas"}
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
      )}
    </section>
  )
}
