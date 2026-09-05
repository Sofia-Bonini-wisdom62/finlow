"use client"

import { useState } from "react"
import { MIN_BUSCA_CONTA } from "@/lib/constantes"
import type { CaminhoDeRecuperacao } from "@/lib/senha"

interface Conta {
  id: string
  email: string
  nome: string | null
  criadoEm: string
  caminho: CaminhoDeRecuperacao
  escola: { nome: string; papel: string } | null
}

/**
 * A tela de atendimento de "esqueci minha senha".
 *
 * Enquanto não existe envio de e-mail no repositório, o caminho real de quem
 * perdeu a senha é escrever para o suporte — e alguém do outro lado precisa
 * conseguir achar a conta e repor. Sem esta tela a rota existiria sem porta, e
 * rota sem tela é porta morta (a mesma régua que segura o DELETE de Objetivos
 * até haver desenho).
 *
 * NADA É AUTOMÁTICO AQUI. A busca não dispara nada, o botão pergunta antes, e
 * a senha aparece uma vez só. É de propósito: este é o único lugar do produto
 * onde alguém define a senha de outra pessoa, e ele tem de ser chato na medida
 * exata de quem sabe o que está fazendo.
 */

const CAMINHOS: Record<CaminhoDeRecuperacao, { rotulo: string; nota: string }> = {
  senha: {
    rotulo: "Entra com senha",
    nota: "Conta comum, com e-mail de verdade. Sortear senha nova resolve.",
  },
  google: {
    rotulo: "Só pelo Google",
    nota:
      "Esta conta NÃO TEM senha — nasceu pelo botão do Google. O caminho normal é a pessoa " +
      "entrar pelo Google de novo. Sortear senha aqui cria uma que nunca existiu, e a conta " +
      "passa a abrir pelos dois jeitos.",
  },
  escola: {
    rotulo: "Login de escola",
    nota:
      "O login termina em .invalid e nunca recebe mensagem, de propósito. Quem repõe " +
      "normalmente é a escola, pela tela dela — use esta só se a escola não tiver como.",
  },
}

export function BuscaDeContas() {
  const [termo, setTermo] = useState("")
  const [contas, setContas] = useState<Conta[] | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [reposta, setReposta] = useState<{ id: string; senha: string; eraSoGoogle: boolean } | null>(null)

  async function buscar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setReposta(null)
    setBuscando(true)
    try {
      const r = await fetch(`/api/ops/usuarios?q=${encodeURIComponent(termo.trim())}`)
      const d = await r.json().catch(() => ({}))
      if (!r.ok) {
        setErro(d.erro ?? "Não deu certo. Tenta de novo?")
        setContas(null)
      } else {
        setContas(d.contas ?? [])
      }
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    }
    setBuscando(false)
  }

  async function repor(c: Conta) {
    const quem = c.nome ? `${c.nome} (${c.email})` : c.email
    const aviso =
      c.caminho === "google"
        ? `${quem} entra SÓ pelo Google e não tem senha. Criar uma agora faz a conta abrir pelos dois jeitos. Continuar?`
        : `Sortear senha nova para ${quem}? A senha atual para de funcionar na hora, e as sessões já abertas continuam abertas.`
    if (!confirm(aviso)) return

    setOcupado(c.id)
    setErro(null)
    setReposta(null)
    try {
      const r = await fetch(`/api/ops/usuarios/${c.id}/senha`, { method: "POST" })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) setErro(d.erro ?? "Não deu certo. Tenta de novo?")
      else setReposta({ id: c.id, senha: d.senha, eraSoGoogle: !!d.eraSoGoogle })
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    }
    setOcupado(null)
  }

  const curto = termo.trim().length < MIN_BUSCA_CONTA

  return (
    <section className="rounded-2xl border border-fl-sand bg-fl-card p-5">
      <h3 className="text-base font-semibold text-fl-ink">Achar uma conta</h3>
      <p className="mt-1 text-sm text-fl-ink/60">
        Pelo e-mail, pelo nome ou pelo id. Precisa de {MIN_BUSCA_CONTA} letras, no mínimo.
      </p>

      <form onSubmit={buscar} className="mt-3 flex flex-wrap gap-2">
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="maria@exemplo.com"
          className="min-w-0 flex-1 rounded-xl border border-fl-sand bg-fl-page px-3 py-2 text-sm text-fl-ink outline-none focus:border-fl-divider"
        />
        <button
          type="submit"
          disabled={curto || buscando}
          className="rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          style={{ background: "var(--fl-500)" }}
        >
          {buscando ? "Procurando…" : "Procurar"}
        </button>
      </form>

      {erro && (
        <p className="mt-3 rounded-xl border border-fl-sand bg-fl-page px-3 py-2 text-sm text-fl-ink">
          {erro}
        </p>
      )}

      {contas?.length === 0 && (
        <p className="mt-3 text-sm text-fl-ink/60">
          Nenhuma conta com isso. Confere se o e-mail é o mesmo que a pessoa usou para entrar — se
          ela criou pelo Google, é o endereço do Google.
        </p>
      )}

      {contas && contas.length > 0 && (
        <ul className="mt-4 divide-y divide-fl-sand">
          {contas.map((c) => (
            <li key={c.id} className="py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-fl-ink">{c.nome ?? "sem nome"}</p>
                  <p className="truncate text-xs text-fl-ink/60">{c.email}</p>
                  <p className="mt-1 text-xs text-fl-ink/50">
                    {CAMINHOS[c.caminho].rotulo}
                    {c.escola ? ` · ${c.escola.papel} em ${c.escola.nome}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => repor(c)}
                  disabled={ocupado === c.id}
                  className="rounded-xl border border-fl-sand px-3 py-1.5 text-xs font-bold text-fl-ink disabled:opacity-50"
                >
                  {ocupado === c.id ? "Sorteando…" : "Sortear senha nova"}
                </button>
              </div>

              <p className="mt-2 text-xs text-fl-ink/55">{CAMINHOS[c.caminho].nota}</p>

              {reposta?.id === c.id && (
                <div className="mt-3 rounded-xl border border-fl-sand bg-fl-page p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-fl-ink/50">
                    Senha nova — aparece uma vez só
                  </p>
                  <p className="mt-1 select-all font-mono text-base font-bold text-fl-ink">
                    {reposta.senha}
                  </p>
                  <p className="mt-2 text-xs text-fl-ink/60">
                    Passa para a pessoa e peça que troque assim que entrar. Quem já estava logado
                    em outro aparelho continua logado: a sessão é JWT e não cai com a troca.
                    {reposta.eraSoGoogle
                      ? " Esta conta não tinha senha antes; agora ela entra pelo Google e por senha."
                      : ""}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
