"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PAPEIS, rotuloDePapel, type PapelEscola } from "@/lib/escola-papeis"
import { AdicionarPessoa } from "@/components/ops/AdicionarPessoa"

interface Membro {
  userId: string
  nome: string | null
  email: string
  papel: PapelEscola
  /** Turma do aluno NESTA escola. null para professor e adm. */
  turmaId: string | null
}

/**
 * Quem está na escola, e tudo que se faz com uma pessoa: trocar papel, editar
 * nome, login e turma, sortear senha nova, e tirar da escola.
 *
 * O painel de edição fica FECHADO até alguém clicar em editar. Uma lista de
 * trinta alunos com trinta formulários abertos é uma tela em que se troca o
 * nome da pessoa errada sem perceber, e este é o único lugar do app onde uma
 * pessoa edita a conta de outra.
 *
 * O aviso sobre sair de aluno não é decoração. Promover um aluno tira as
 * turmas dele e devolve a trilha para a adulta, porque senão ele continuaria
 * contando no rank da sala e vendo aula de 5º ano no próprio app. Quem clica
 * precisa saber disso antes, não depois.
 */
export function ListaDeMembros({
  escolaId,
  membros,
  turmas,
}: {
  escolaId: string
  membros: Membro[]
  turmas: { id: string; nome: string }[]
}) {
  const router = useRouter()
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [editando, setEditando] = useState<string | null>(null)
  const [senhaNova, setSenhaNova] = useState<{ userId: string; senha: string } | null>(null)

  async function agir(userId: string, init: RequestInit) {
    setOcupado(userId)
    setErro(null)
    try {
      const r = await fetch(`/api/ops/escolas/${escolaId}/membros/${userId}`, init)
      const d = await r.json().catch(() => ({}))
      if (!r.ok) {
        setErro(d.erro ?? "Não deu certo. Tenta de novo?")
        setOcupado(null)
        return false
      }
      router.refresh()
      setOcupado(null)
      return true
    } catch {
      setErro("Sem conexão. Tenta de novo?")
      setOcupado(null)
      return false
    }
  }

  function trocar(m: Membro, papel: string) {
    if (papel === m.papel) return
    const quem = m.nome ?? m.email
    if (m.papel === "aluno" && papel !== "aluno") {
      if (!confirm(`${quem} sai das turmas e volta para a trilha adulta. Continuar?`)) return
    }
    agir(m.userId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ papel }),
    })
  }

  function remover(m: Membro) {
    const quem = m.nome ?? m.email
    if (!confirm(`Tirar ${quem} da escola? A conta continua existindo como usuário comum do Finlow, com o progresso salvo.`)) {
      return
    }
    agir(m.userId, { method: "DELETE" })
  }

  async function novaSenha(m: Membro) {
    const quem = m.nome ?? m.email
    if (!confirm(`Sortear uma senha nova para ${quem}? A senha atual para de funcionar na hora.`)) {
      return
    }
    setOcupado(m.userId)
    setErro(null)
    try {
      const r = await fetch(`/api/ops/escolas/${escolaId}/membros/${m.userId}/senha`, {
        method: "POST",
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) setErro(d.erro ?? "Não deu certo. Tenta de novo?")
      else setSenhaNova({ userId: m.userId, senha: d.senha })
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    }
    setOcupado(null)
  }

  return (
    <section className="rounded-2xl border border-fl-sand bg-fl-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-fl-ink">Pessoas ({membros.length})</h3>
        <AdicionarPessoa escolaId={escolaId} turmas={turmas} />
      </div>

      {membros.length === 0 ? (
        <p className="mt-2 text-sm text-fl-ink/60">Ninguém ainda.</p>
      ) : (
        <ul className="mt-3 divide-y divide-fl-sand">
          {membros.map((m) => (
            <li key={m.userId} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm text-fl-ink">{m.nome ?? m.email}</p>
                  <p className="truncate text-xs text-fl-ink/50">
                    {m.email}
                    {m.turmaId && (
                      <> · {turmas.find((t) => t.id === m.turmaId)?.nome ?? "turma"}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={m.papel}
                    onChange={(e) => trocar(m, e.target.value)}
                    disabled={ocupado === m.userId}
                    className="rounded-lg border border-fl-sand bg-fl-page px-2 py-1.5 text-xs text-fl-ink disabled:opacity-60"
                  >
                    {PAPEIS.map((p) => (
                      <option key={p} value={p}>
                        {rotuloDePapel(p)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setEditando(editando === m.userId ? null : m.userId)}
                    disabled={ocupado === m.userId}
                    className="text-xs font-medium disabled:opacity-60"
                    style={{ color: "var(--fl-500)" }}
                  >
                    {editando === m.userId ? "fechar" : "editar"}
                  </button>
                  <button
                    onClick={() => remover(m)}
                    disabled={ocupado === m.userId}
                    className="text-xs font-medium text-[var(--fl-error)] disabled:opacity-60"
                  >
                    tirar
                  </button>
                </div>
              </div>

              {senhaNova?.userId === m.userId && (
                <div className="mt-2 rounded-xl border border-fl-sand bg-fl-page px-4 py-3">
                  <p className="text-xs font-medium text-[var(--fl-error)]">
                    Senha nova, anota agora porque ela não aparece de novo
                  </p>
                  <p className="select-all font-mono text-base font-bold text-fl-ink">
                    {senhaNova.senha}
                  </p>
                  <button
                    onClick={() => setSenhaNova(null)}
                    className="mt-1 text-xs font-medium text-fl-ink/60"
                  >
                    Já anotei
                  </button>
                </div>
              )}

              {editando === m.userId && (
                <FormularioDeEdicao
                  membro={m}
                  turmas={turmas}
                  ocupado={ocupado === m.userId}
                  onSalvar={async (corpo) => {
                    const ok = await agir(m.userId, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(corpo),
                    })
                    if (ok) setEditando(null)
                  }}
                  onNovaSenha={() => novaSenha(m)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
      {erro && <p className="mt-3 text-sm text-[var(--fl-error)]">{erro}</p>}
    </section>
  )
}

/**
 * O formulário de uma pessoa. Só manda o que MUDOU: campo intocado sai como
 * undefined e o servidor não mexe nele. Mandar tudo sempre faria um clique em
 * salvar sem editar nada reescrever o nome com o que estava na tela, que é o
 * mesmo valor até alguém abrir dois formulários e se perder.
 */
function FormularioDeEdicao({
  membro,
  turmas,
  ocupado,
  onSalvar,
  onNovaSenha,
}: {
  membro: Membro
  turmas: { id: string; nome: string }[]
  ocupado: boolean
  onSalvar: (corpo: Record<string, string>) => void
  onNovaSenha: () => void
}) {
  const [nome, setNome] = useState(membro.nome ?? "")
  const [email, setEmail] = useState(membro.email)
  const [turmaId, setTurmaId] = useState(membro.turmaId ?? "")

  function salvar(e: React.FormEvent) {
    e.preventDefault()
    const corpo: Record<string, string> = {}
    if (nome.trim() !== (membro.nome ?? "")) corpo.nome = nome
    if (email.trim().toLowerCase() !== membro.email) corpo.email = email
    if (membro.papel === "aluno" && turmaId && turmaId !== membro.turmaId) corpo.turmaId = turmaId
    if (Object.keys(corpo).length === 0) return
    onSalvar(corpo)
  }

  return (
    <form onSubmit={salvar} className="mt-3 space-y-3 rounded-xl border border-fl-sand bg-fl-page p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-fl-ink/70">Nome</span>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mt-1 w-full rounded-xl border border-fl-sand bg-fl-card px-3 py-2 text-sm text-fl-ink"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-fl-ink/70">Login</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-fl-sand bg-fl-card px-3 py-2 font-mono text-sm text-fl-ink"
          />
        </label>
      </div>

      {membro.papel === "aluno" && (
        <label className="block">
          <span className="text-xs font-medium text-fl-ink/70">
            Turma (trocar MOVE o aluno: ele sai da turma atual nesta escola)
          </span>
          <select
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-fl-sand bg-fl-card px-3 py-2 text-sm text-fl-ink sm:w-72"
          >
            <option value="">sem turma</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </label>
      )}

      <p className="text-xs text-fl-ink/50">
        Mudar o login muda o que a pessoa digita para entrar. Avisa ela, senão fica de fora da
        própria conta.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={ocupado}
          className="rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          style={{ background: "var(--fl-500)" }}
        >
          {ocupado ? "Salvando…" : "Salvar"}
        </button>
        <button
          type="button"
          onClick={onNovaSenha}
          disabled={ocupado}
          className="rounded-xl border border-fl-sand bg-fl-card px-4 py-2.5 text-sm font-medium text-fl-ink disabled:opacity-60"
        >
          Sortear senha nova
        </button>
      </div>
    </form>
  )
}
