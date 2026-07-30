"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  ChevronRight, Download, LogOut, Trash2, Check, X, Clock,
  User, Landmark, Sparkles, ShieldCheck, Palette, LifeBuoy, Brain, FileUp, MessageCircle,
} from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { SeletorTema } from "@/components/SeletorTema"
import { EMAIL_CONTATO } from "@/lib/constantes"

interface Conta {
  nome: string
  email: string
  painelAtivo: boolean
  temSenha: boolean
}

function Secao({ titulo, Icon, children }: { titulo: string; Icon: typeof User; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 flex items-center gap-2 px-1 text-[11px] font-bold uppercase tracking-wider text-fl-ink-2">
        <Icon className="size-3.5" /> {titulo}
      </h2>
      <div className="divide-y divide-fl-divider overflow-hidden rounded-2xl border border-fl-border bg-fl-card">
        {children}
      </div>
    </section>
  )
}

function Linha({ rotulo, valor, children }: { rotulo: string; valor?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <span className="text-[14.5px] text-fl-ink">{rotulo}</span>
      {children ?? <span className="truncate text-sm text-fl-ink-2">{valor}</span>}
    </div>
  )
}

function Acao({ rotulo, Icon, onClick, href, download, perigo }: {
  rotulo: string
  Icon?: typeof Download
  onClick?: () => void
  href?: string
  download?: boolean
  perigo?: boolean
}) {
  const classe = `flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-[14.5px] transition-colors hover:bg-fl-50 ${
    perigo ? "text-fl-error" : "text-fl-ink"
  }`
  const conteudo = (
    <>
      <span className="flex items-center gap-2.5">{Icon && <Icon className="size-4" />}{rotulo}</span>
      <ChevronRight className="size-4 shrink-0 text-fl-ink-3" />
    </>
  )

  if (href) {
    return download ? (
      <a href={href} download className={classe}>{conteudo}</a>
    ) : (
      <a href={href} className={classe}>{conteudo}</a>
    )
  }
  return <button onClick={onClick} className={classe}>{conteudo}</button>
}

// Item que depende de integração que ainda não existe. Preferimos mostrar
// desabilitado com o motivo a fingir um controle que não faz nada.
function EmBreve({ rotulo, motivo }: { rotulo: string; motivo: string }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3.5">
      <div className="min-w-0">
        <div className="text-[14.5px] text-fl-ink-3">{rotulo}</div>
        <div className="mt-0.5 text-[11.5px] leading-snug text-fl-ink-3">{motivo}</div>
      </div>
      <span className="mt-0.5 flex shrink-0 items-center gap-1 rounded-full bg-fl-divider px-2 py-0.5 text-[10.5px] font-semibold text-fl-ink-2">
        <Clock className="size-3" /> em breve
      </span>
    </div>
  )
}

export default function AjustesPage() {
  const [conta, setConta] = useState<Conta | null>(null)
  const [logado, setLogado] = useState(true)

  // edição de nome
  const [editandoNome, setEditandoNome] = useState(false)
  const [nome, setNome] = useState("")
  // troca de senha
  const [trocandoSenha, setTrocandoSenha] = useState(false)
  const [senhaAtual, setSenhaAtual] = useState("")
  const [senhaNova, setSenhaNova] = useState("")
  // apagar dados financeiros
  const [confirmandoApagar, setConfirmandoApagar] = useState(false)
  // apagar a conta inteira — separado de propósito, ver a seção lá embaixo
  const [apagandoConta, setApagandoConta] = useState(false)
  const [confirmacaoEmail, setConfirmacaoEmail] = useState("")

  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    fetch("/api/conta")
      .then((r) => (r.status === 401 ? null : r.json()))
      .then((d) => {
        if (!d) { setLogado(false); return }
        setConta(d)
        setNome(d.nome)
      })
      .catch(() => {})
  }, [])

  async function salvarNome() {
    setSalvando(true)
    setMsg(null)
    const res = await fetch("/api/conta", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    })
    const d = await res.json().catch(() => ({}))
    setSalvando(false)
    if (!res.ok) { setMsg({ tipo: "erro", texto: d.error ?? "Erro ao salvar" }); return }
    setConta((c) => (c ? { ...c, nome } : c))
    setEditandoNome(false)
    setMsg({ tipo: "ok", texto: "Nome atualizado." })
  }

  async function salvarSenha() {
    setSalvando(true)
    setMsg(null)
    const res = await fetch("/api/conta", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senhaAtual, senhaNova }),
    })
    const d = await res.json().catch(() => ({}))
    setSalvando(false)
    if (!res.ok) { setMsg({ tipo: "erro", texto: d.error ?? "Erro ao salvar" }); return }
    setSenhaAtual("")
    setSenhaNova("")
    setTrocandoSenha(false)
    setMsg({ tipo: "ok", texto: "Senha alterada." })
  }

  async function apagarDados() {
    setSalvando(true)
    const res = await fetch("/api/painel/consentimento", { method: "DELETE" })
    setSalvando(false)
    setConfirmandoApagar(false)
    setMsg(
      res.ok
        ? { tipo: "ok", texto: "Dados financeiros apagados." }
        : { tipo: "erro", texto: "Não deu pra apagar agora." }
    )
    if (res.ok) setConta((c) => (c ? { ...c, painelAtivo: false } : c))
  }

  async function apagarConta() {
    setSalvando(true)
    setMsg(null)
    try {
      const res = await fetch("/api/conta", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmacao: confirmacaoEmail.trim() }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSalvando(false)
        setMsg({ tipo: "erro", texto: d.erro ?? d.error ?? "Não consegui apagar agora." })
        return
      }
      // O perfil da trilha vive no localStorage; sem limpar, a próxima conta
      // criada neste navegador herdaria a trilha de uma conta que não existe.
      try { localStorage.removeItem("finlow_perfil") } catch {}
      await signOut({ callbackUrl: "/" })
    } catch {
      setSalvando(false)
      setMsg({ tipo: "erro", texto: "Sem conexão. Tenta de novo?" })
    }
  }

  if (!logado) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-fl-page px-6 text-center">
        <p className="text-fl-ink-2">Entra na sua conta pra ver os ajustes.</p>
        <Link href="/login" className="rounded-full bg-fl-500 px-6 py-3 text-sm font-semibold text-primary-foreground">Entrar</Link>
      </main>
    )
  }

  const inputClass = "w-full rounded-xl border border-fl-border bg-fl-page px-3.5 py-2.5 text-sm text-fl-ink outline-none focus:border-fl-500"

  return (
    <main className="min-h-dvh bg-fl-page pb-24">
      <div className="mx-auto w-full max-w-md px-5 py-6">
        <h1 className="text-[26px] font-extrabold tracking-tight text-fl-ink">Menu</h1>

        {msg && (
          <div
            className={`mt-4 flex items-start gap-2 rounded-2xl px-4 py-3 text-sm ${
              msg.tipo === "ok"
                ? "bg-fl-success/10 text-fl-success"
                : "bg-fl-error/10 text-fl-error"
            }`}
          >
            {msg.tipo === "ok" ? <Check className="mt-0.5 size-4 shrink-0" /> : <X className="mt-0.5 size-4 shrink-0" />}
            {msg.texto}
          </div>
        )}

        {/* ---------- CONTA ---------- */}
        <Secao titulo="Conta" Icon={User}>
          {editandoNome ? (
            <div className="flex flex-col gap-2.5 px-4 py-3.5">
              <label htmlFor="nome" className="text-[13px] font-semibold text-fl-ink-2">Nome</label>
              <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
              <div className="flex gap-2">
                <button onClick={salvarNome} disabled={salvando} className="flex-1 rounded-xl bg-fl-500 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                  {salvando ? "Salvando…" : "Salvar"}
                </button>
                <button onClick={() => { setEditandoNome(false); setNome(conta?.nome ?? "") }} className="flex-1 rounded-xl bg-fl-divider py-2.5 text-sm font-medium text-fl-ink-2">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setEditandoNome(true)} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-fl-50">
              <span className="text-[14.5px] text-fl-ink">Nome</span>
              <span className="flex items-center gap-2 truncate text-sm text-fl-ink-2">
                {conta?.nome || "—"} <ChevronRight className="size-4 shrink-0 text-fl-ink-3" />
              </span>
            </button>
          )}

          <Linha rotulo="E-mail" valor={conta?.email ?? "—"} />

          {trocandoSenha ? (
            <div className="flex flex-col gap-2.5 px-4 py-3.5">
              {conta?.temSenha && (
                <input type="password" placeholder="Senha atual" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} className={inputClass} />
              )}
              <input type="password" placeholder="Senha nova (mín. 6)" value={senhaNova} onChange={(e) => setSenhaNova(e.target.value)} className={inputClass} />
              <div className="flex gap-2">
                <button onClick={salvarSenha} disabled={salvando || senhaNova.length < 6} className="flex-1 rounded-xl bg-fl-500 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                  {salvando ? "Salvando…" : "Alterar senha"}
                </button>
                <button onClick={() => { setTrocandoSenha(false); setSenhaAtual(""); setSenhaNova("") }} className="flex-1 rounded-xl bg-fl-divider py-2.5 text-sm font-medium text-fl-ink-2">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <Acao rotulo={conta?.temSenha ? "Alterar senha" : "Criar senha"} onClick={() => setTrocandoSenha(true)} />
          )}

          <EmBreve rotulo="Alterar foto" motivo="Depende de armazenamento de imagens, ainda não configurado." />
        </Secao>

        {/* ---------- DADOS FINANCEIROS ---------- */}
        <Secao titulo="Dados financeiros" Icon={Landmark}>
          <Acao rotulo="Registrar e editar lançamentos" href="/painel" />
          <Acao rotulo="Ler extrato do banco (PDF, CSV ou OFX)" Icon={FileUp} href="/extrato" />
          <Acao rotulo="Exportar meus dados (JSON)" Icon={Download} href="/api/exportar" download />
          <EmBreve rotulo="Bancos conectados" motivo="Requer Open Finance. Por ora, o extrato faz o mesmo trabalho." />
        </Secao>

        {/* ---------- IA ---------- */}
        <Secao titulo="Assistente de IA" Icon={Sparkles}>
          <Acao rotulo="Refazer a primeira conversa" Icon={Sparkles} href="/onboarding" />
          <Acao rotulo="Memória do assistente" Icon={Brain} href="/memoria" />
          <Acao rotulo="Conversar com o assistente" Icon={MessageCircle} href="/chat" />
          <EmBreve rotulo="Personalidade da IA" motivo="O tom do assistente é fixo por enquanto." />
          <EmBreve rotulo="Frequência de lembretes" motivo="Depende de notificações, ainda não implementadas." />
        </Secao>

        {/* ---------- PRIVACIDADE ---------- */}
        <Secao titulo="Privacidade" Icon={ShieldCheck}>
          {confirmandoApagar ? (
            <div className="flex flex-col gap-2.5 px-4 py-3.5">
              <p className="text-sm font-semibold text-fl-error">
                Apagar todas as transações, contas fixas e categorias? Não tem volta.
              </p>
              <div className="flex gap-2">
                <button onClick={apagarDados} disabled={salvando} className="flex-1 rounded-xl bg-fl-error py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
                  {salvando ? "Apagando…" : "Sim, apagar tudo"}
                </button>
                <button onClick={() => setConfirmandoApagar(false)} className="flex-1 rounded-xl bg-fl-divider py-2.5 text-sm font-medium text-fl-ink-2">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <Acao rotulo="Apagar meus dados financeiros" Icon={Trash2} onClick={() => setConfirmandoApagar(true)} perigo />
          )}
          <Acao rotulo="Apagar a memória do assistente" Icon={Brain} href="/memoria" />
          <EmBreve rotulo="Biometria e PIN" motivo="Precisa de app nativo — hoje o Finlow roda no navegador." />
        </Secao>

        {/* ---------- APARÊNCIA ---------- */}
        <Secao titulo="Aparência" Icon={Palette}>
          <div className="flex flex-col gap-2.5 py-3">
            <div>
              <div className="text-[15px] text-fl-ink">Tema</div>
              <div className="text-[12.5px] text-fl-ink-3">
                Em &quot;Sistema&quot;, acompanha a configuração do seu aparelho.
              </div>
            </div>
            <SeletorTema />
          </div>
          <EmBreve rotulo="Idioma" motivo="Hoje o Finlow existe só em português." />
        </Secao>

        {/* ---------- SUPORTE ---------- */}
        <Secao titulo="Suporte" Icon={LifeBuoy}>
          <Acao rotulo="Perguntas frequentes" href="/#faq" />
          <Acao rotulo="Falar com suporte" href={`mailto:${EMAIL_CONTATO}?subject=${encodeURIComponent("Suporte Finlow")}`} />
          <Acao rotulo="Enviar feedback" href={`mailto:${EMAIL_CONTATO}?subject=${encodeURIComponent("Feedback do Finlow")}`} />
        </Secao>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-fl-border bg-fl-card py-4 text-sm font-semibold text-fl-ink-2 transition-colors hover:text-fl-ink"
        >
          <LogOut className="size-4" /> Sair da conta
        </button>

        {/* ---------- APAGAR A CONTA ----------
            Fica no fim, numa seção própria, longe de "Apagar dados
            financeiros". As duas são destrutivas e parecidas no nome; vizinhas
            na tela, alguém toca na errada. */}
        <section className="mt-10 rounded-2xl border border-fl-error/30 p-4">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-fl-error">Apagar a conta</h2>

          {!apagandoConta ? (
            <>
              <p className="mt-2 text-[13px] leading-relaxed text-fl-ink-2">
                Some tudo: lançamentos, extratos, categorias, progresso da trilha, a memória do
                assistente e o seu login. Não dá para desfazer, e não guardamos cópia.
              </p>
              <a
                href="/api/exportar"
                download
                className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-fl-ink-2"
              >
                <Download className="size-3.5" /> Baixar meus dados antes
              </a>
              <button
                onClick={() => setApagandoConta(true)}
                className="mt-4 w-full rounded-xl border border-fl-error/40 py-3 text-[14px] font-semibold text-fl-error"
              >
                Quero apagar minha conta
              </button>
            </>
          ) : (
            <div className="mt-3">
              <p className="text-[13px] leading-relaxed text-fl-ink-2">
                Para confirmar, digita{" "}
                <strong className="font-semibold text-fl-ink">{conta?.email}</strong> abaixo.
              </p>
              <input
                value={confirmacaoEmail}
                onChange={(e) => setConfirmacaoEmail(e.target.value)}
                placeholder="seu e-mail"
                autoComplete="off"
                aria-label="Confirme digitando seu e-mail"
                className="mt-2.5 w-full rounded-xl border border-fl-border bg-fl-page px-3.5 py-2.5 text-sm text-fl-ink outline-none focus:border-fl-error"
              />
              <div className="mt-2.5 flex gap-2">
                <button
                  onClick={apagarConta}
                  disabled={
                    salvando ||
                    confirmacaoEmail.trim().toLowerCase() !== (conta?.email ?? "").toLowerCase()
                  }
                  className="flex-1 rounded-xl bg-fl-error py-3 text-sm font-bold text-primary-foreground disabled:opacity-40"
                >
                  {salvando ? "Apagando…" : "Apagar para sempre"}
                </button>
                <button
                  onClick={() => { setApagandoConta(false); setConfirmacaoEmail("") }}
                  className="flex-1 rounded-xl bg-fl-divider py-3 text-sm font-medium text-fl-ink-2"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </main>
  )
}
