"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Target, Trash2, Pencil, Check } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { ConsentimentoPainel } from "@/components/painel/ConsentimentoPainel"
import { ModalBase, inputPainel, botaoPrimario } from "@/components/painel/ModalBase"
import { brl, paraNumero } from "@/lib/formato"

/**
 * Objetivos: a tela do futuro.
 *
 * O resto do app conta o que já aconteceu — extrato, lançamentos, o mês que
 * passou. Aqui a pessoa escreve o que quer que aconteça e vê o quanto falta.
 *
 * O QUE ESTA TELA NÃO FAZ
 * Guardar dinheiro num objetivo NÃO mexe no saldo do Painel. O valor já foi
 * contado quando entrou, e descontá-lo de novo faria a mesma quantia sumir
 * duas vezes. Aqui é marcador de progresso; quem transferiu de verdade
 * registra a transferência no Painel. A tela diz isso em uma linha, embaixo,
 * porque a alternativa é alguém achar que o dash quebrou.
 */

interface Objetivo {
  id: string
  nome: string
  emoji: string | null
  valorAlvo: number
  valorGuardado: number
  restante: number
  pct: number
  prazo: string | null
  concluidoEm: string | null
}

interface Resumo {
  total: number
  concluidos: number
  alvoAberto: number
  guardadoAberto: number
  restanteAberto: number
}

/** Prazo como a pessoa pensa nele: o quanto falta, não a data crua. */
function textoPrazo(prazo: string | null): string | null {
  if (!prazo) return null
  const d = new Date(prazo)
  if (isNaN(d.getTime())) return null

  const mes = d.toLocaleDateString("pt-BR", { month: "short", year: "numeric", timeZone: "UTC" })
  const hoje = new Date()
  const dias = Math.ceil((d.getTime() - hoje.getTime()) / 86_400_000)

  if (dias < 0) return `${mes} · passou do prazo`
  if (dias === 0) return `${mes} · é hoje`
  if (dias <= 31) return `${mes} · faltam ${dias} ${dias === 1 ? "dia" : "dias"}`
  const meses = Math.round(dias / 30)
  return `${mes} · faltam ${meses} meses`
}

/** input[type=date] fala YYYY-MM-DD; o banco guarda ISO. */
function paraCampoData(prazo: string | null): string {
  if (!prazo) return ""
  const d = new Date(prazo)
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10)
}

export default function ObjetivosPage() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([])
  const [resumo, setResumo] = useState<Resumo | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [logado, setLogado] = useState(true)
  const [erro, setErro] = useState(false)

  const [consentiu, setConsentiu] = useState<boolean | null>(null)
  const [menorDe18, setMenorDe18] = useState(false)
  const [modalConsentimento, setModalConsentimento] = useState(false)

  // Modal de criar/editar. `editando` null = criando.
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Objetivo | null>(null)
  const [nome, setNome] = useState("")
  const [emoji, setEmoji] = useState("")
  const [alvo, setAlvo] = useState("")
  const [inicial, setInicial] = useState("")
  const [prazo, setPrazo] = useState("")

  // Modal de guardar/tirar.
  const [guardandoEm, setGuardandoEm] = useState<Objetivo | null>(null)
  const [valorGuardar, setValorGuardar] = useState("")

  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  // Nada de setState no corpo desta função: ela é chamada dentro de um efeito,
  // e o estado só muda quando a resposta chega — não na hora do pedido.
  const carregar = useCallback(() => {
    fetch("/api/objetivos")
      .then(async (r) => {
        if (r.status === 401) return { deslogado: true as const }
        if (!r.ok) return { falhou: true as const }
        return { dados: await r.json() }
      })
      .then((r) => {
        if ("deslogado" in r) { setLogado(false); return }
        if ("falhou" in r) { setErro(true); return }
        setErro(false)
        setObjetivos(r.dados.objetivos ?? [])
        setResumo(r.dados.resumo ?? null)
      })
      .catch(() => setErro(true))
      .finally(() => setCarregando(false))
  }, [])

  useEffect(() => {
    carregar()
    fetch("/api/painel/consentimento")
      .then((r) => (r.status === 401 ? null : r.json()))
      .then((d) => {
        if (!d) return
        setConsentiu(d.consentiu)
        setMenorDe18(d.menorDe18)
      })
      .catch(() => {})
  }, [carregar])

  async function ativarPainel() {
    const res = await fetch("/api/painel/consentimento", { method: "PATCH" })
    if (res.ok) {
      setConsentiu(true)
      setModalConsentimento(false)
    }
  }

  /** Toda escrita passa por aqui: sem consentimento, o modal do opt-in abre no
   *  lugar do formulário — é o mesmo 403 que a rota devolveria, antecipado. */
  function comConsentimento(acao: () => void) {
    if (consentiu === false) { setModalConsentimento(true); return }
    acao()
  }

  function abrirNovo() {
    comConsentimento(() => {
      setEditando(null)
      setNome(""); setEmoji(""); setAlvo(""); setInicial(""); setPrazo("")
      setErroForm(null)
      setModalAberto(true)
    })
  }

  function abrirEdicao(o: Objetivo) {
    comConsentimento(() => {
      setEditando(o)
      setNome(o.nome)
      setEmoji(o.emoji ?? "")
      setAlvo(String(o.valorAlvo))
      setInicial("")
      setPrazo(paraCampoData(o.prazo))
      setErroForm(null)
      setModalAberto(true)
    })
  }

  async function salvar() {
    setSalvando(true)
    setErroForm(null)
    const corpo = editando
      ? { id: editando.id, nome, emoji: emoji.trim() || null, valorAlvo: paraNumero(alvo), prazo: prazo || null }
      : {
          nome,
          emoji: emoji.trim() || null,
          valorAlvo: paraNumero(alvo),
          valorGuardado: inicial.trim() ? paraNumero(inicial) : 0,
          prazo: prazo || null,
        }

    const res = await fetch("/api/objetivos", {
      method: editando ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    })
    setSalvando(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setErroForm(d.erro ?? d.error ?? "Erro ao salvar")
      return
    }
    setModalAberto(false)
    carregar()
  }

  async function guardar(sinal: 1 | -1) {
    if (!guardandoEm) return
    setSalvando(true)
    setErroForm(null)
    const res = await fetch("/api/objetivos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: guardandoEm.id, guardar: sinal * paraNumero(valorGuardar) }),
    })
    setSalvando(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setErroForm(d.erro ?? d.error ?? "Erro ao salvar")
      return
    }
    setGuardandoEm(null)
    carregar()
  }

  async function excluir(o: Objetivo) {
    if (!confirm(`Apagar "${o.nome}"? O quanto você já marcou como guardado some junto.`)) return
    await fetch(`/api/objetivos?id=${o.id}`, { method: "DELETE" })
    carregar()
  }

  if (carregando) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-fl-page">
        <div className="size-6 animate-spin rounded-full border-2 border-fl-500 border-t-transparent" />
      </main>
    )
  }

  if (!logado) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-fl-page px-6 text-center">
        <p className="text-fl-ink-2">Entra na sua conta pra ver seus objetivos.</p>
        <Link href="/login" className="rounded-full bg-fl-500 px-6 py-3 text-sm font-semibold text-primary-foreground">
          Entrar
        </Link>
      </main>
    )
  }

  if (erro) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-fl-page px-6 text-center">
        <div>
          <p className="text-[15px] font-bold text-fl-ink">Não deu pra carregar seus objetivos</p>
          <p className="mt-1.5 text-sm text-fl-ink-2">Alguma coisa falhou na busca. Nada foi perdido.</p>
        </div>
        <button onClick={() => { setCarregando(true); carregar() }} className="rounded-full bg-fl-500 px-6 py-3 text-sm font-semibold text-primary-foreground">
          Tentar de novo
        </button>
        <BottomNav />
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-fl-page pb-24 lg:pb-10 lg:pl-56">
      <div className="mx-auto w-full max-w-md px-5 py-6 md:max-w-2xl md:px-8 lg:max-w-3xl lg:px-10">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold tracking-tight text-fl-ink">Objetivos</h1>
            <p className="mt-0.5 text-sm text-fl-ink-2">O que você quer, e o quanto falta.</p>
          </div>
          <button
            aria-label="Novo objetivo"
            onClick={abrirNovo}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-fl-500 text-primary-foreground"
          >
            <Plus className="size-5" />
          </button>
        </header>

        {/* O resumo só aparece com objetivo aberto: com a fila vazia ele seria
            três zeros ocupando o lugar do convite. */}
        {resumo && resumo.total > resumo.concluidos && (
          <section className="mt-5 rounded-[20px] border border-fl-border bg-fl-card p-5" aria-label="Resumo">
            <span className="text-xs font-semibold uppercase tracking-wider text-fl-ink-2">Já separado</span>
            <div className="mt-1 text-2xl font-extrabold tabular-nums tracking-tight text-fl-ink">
              {brl(resumo.guardadoAberto)}
            </div>
            <p className="mt-1 text-[13px] text-fl-ink-2">
              Faltam <strong className="font-semibold text-fl-ink">{brl(resumo.restanteAberto)}</strong> para
              fechar {resumo.total - resumo.concluidos === 1 ? "seu objetivo" : `seus ${resumo.total - resumo.concluidos} objetivos`}.
            </p>
          </section>
        )}

        {objetivos.length === 0 ? (
          <section className="mt-6 rounded-[20px] border border-dashed border-fl-border bg-fl-card p-6 text-center">
            <Target className="mx-auto size-7 text-fl-500" />
            <p className="mt-3 text-[15px] font-bold text-fl-ink">Nenhum objetivo por aqui ainda</p>
            <p className="mx-auto mt-1.5 max-w-xs text-[13.5px] leading-relaxed text-fl-ink-2">
              Uma viagem, a reserva de emergência, trocar de celular. Escreve o que
              você quer e quanto custa — o app cuida de mostrar o quanto falta.
            </p>
            <button onClick={abrirNovo} className="mt-4 rounded-full bg-fl-500 px-6 py-3 text-sm font-semibold text-primary-foreground">
              Criar meu primeiro objetivo
            </button>
          </section>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {objetivos.map((o) => {
              const concluido = !!o.concluidoEm
              const quando = textoPrazo(o.prazo)
              return (
                <li
                  key={o.id}
                  className={`rounded-[20px] border border-fl-border bg-fl-card p-5 ${concluido ? "opacity-70" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span aria-hidden className="text-xl leading-none">{o.emoji || "🎯"}</span>
                      <div className="min-w-0">
                        <span className="flex items-center gap-1.5 text-[15px] font-bold text-fl-ink">
                          <span className="truncate">{o.nome}</span>
                          {concluido && <Check className="size-4 shrink-0 text-fl-500" aria-label="concluído" />}
                        </span>
                        {quando && !concluido && (
                          <span className="text-xs text-fl-ink-2">{quando}</span>
                        )}
                        {concluido && <span className="text-xs text-fl-500">Objetivo alcançado</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button aria-label={`Editar ${o.nome}`} onClick={() => abrirEdicao(o)} className="p-1.5 text-fl-ink-2 hover:text-fl-ink">
                        <Pencil className="size-4" />
                      </button>
                      <button aria-label={`Apagar ${o.nome}`} onClick={() => excluir(o)} className="p-1.5 text-fl-ink-2 hover:text-fl-accent-dark">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3.5 h-2 overflow-hidden rounded-full bg-fl-divider">
                    <div
                      className="h-full rounded-full bg-fl-500 transition-[width]"
                      style={{ width: `${o.pct}%` }}
                      role="progressbar"
                      aria-valuenow={o.pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Progresso de ${o.nome}`}
                    />
                  </div>

                  <div className="mt-2 flex items-baseline justify-between text-[13px]">
                    <span className="tabular-nums text-fl-ink">
                      <strong className="font-bold">{brl(o.valorGuardado)}</strong>
                      <span className="text-fl-ink-2"> de {brl(o.valorAlvo)}</span>
                    </span>
                    <span className="tabular-nums text-fl-ink-2">
                      {concluido ? "100%" : `faltam ${brl(o.restante)}`}
                    </span>
                  </div>

                  <button
                    onClick={() => comConsentimento(() => {
                      setGuardandoEm(o)
                      setValorGuardar("")
                      setErroForm(null)
                    })}
                    className="mt-3.5 w-full rounded-xl bg-fl-page py-2.5 text-sm font-semibold text-fl-500"
                  >
                    {concluido ? "Ajustar o quanto está guardado" : "Guardar um valor"}
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {/* A linha que evita o susto: ninguém deve achar que o dash quebrou. */}
        {objetivos.length > 0 && (
          <p className="mt-5 rounded-2xl bg-fl-sand px-4 py-3.5 text-[13px] leading-relaxed text-fl-sand-text">
            Marcar um valor aqui não mexe no seu saldo nem cria lançamento — é o seu
            controle do quanto já separou. Se você transferiu o dinheiro de verdade,
            registre a transferência no{" "}
            <Link href="/painel" className="font-semibold underline">Painel</Link>.
          </p>
        )}
      </div>

      {/* criar / editar */}
      <ModalBase
        titulo={editando ? "Editar objetivo" : "Novo objetivo"}
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
      >
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              className={`${inputPainel} w-16 text-center`}
              placeholder="🎯"
              maxLength={4}
              aria-label="Emoji do objetivo"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
            />
            <input
              className={inputPainel}
              placeholder="O que você quer (ex: viagem pro Chile)"
              maxLength={60}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <input
            className={inputPainel}
            inputMode="decimal"
            placeholder="Quanto custa (R$)"
            value={alvo}
            onChange={(e) => setAlvo(e.target.value)}
          />
          {!editando && (
            <input
              className={inputPainel}
              inputMode="decimal"
              placeholder="Já tem algo guardado? (opcional)"
              value={inicial}
              onChange={(e) => setInicial(e.target.value)}
            />
          )}
          <label className="flex flex-col gap-1">
            <span className="text-xs text-fl-ink-2">Para quando (opcional)</span>
            <input className={inputPainel} type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
          </label>

          {erroForm && <p className="text-sm text-fl-accent-dark">{erroForm}</p>}
          <button className={botaoPrimario} disabled={salvando || !nome.trim() || !alvo.trim()} onClick={salvar}>
            {salvando ? "Salvando..." : editando ? "Salvar" : "Criar objetivo"}
          </button>
        </div>
      </ModalBase>

      {/* guardar / tirar */}
      <ModalBase
        titulo={guardandoEm ? guardandoEm.nome : ""}
        aberto={!!guardandoEm}
        onFechar={() => setGuardandoEm(null)}
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-fl-ink-2">
            Já separado: <strong className="font-semibold text-fl-ink">{brl(guardandoEm?.valorGuardado ?? 0)}</strong>
            {guardandoEm && !guardandoEm.concluidoEm && ` · faltam ${brl(guardandoEm.restante)}`}
          </p>
          <input
            className={inputPainel}
            inputMode="decimal"
            placeholder="Valor (R$)"
            autoFocus
            value={valorGuardar}
            onChange={(e) => setValorGuardar(e.target.value)}
          />
          {erroForm && <p className="text-sm text-fl-accent-dark">{erroForm}</p>}
          <button className={botaoPrimario} disabled={salvando || !valorGuardar.trim()} onClick={() => guardar(1)}>
            {salvando ? "Salvando..." : "Guardar"}
          </button>
          <button
            className="w-full rounded-2xl py-3 text-sm font-medium text-fl-ink-2 transition-colors hover:text-fl-ink disabled:opacity-50"
            disabled={salvando || !valorGuardar.trim()}
            onClick={() => guardar(-1)}
          >
            Tirar esse valor
          </button>
        </div>
      </ModalBase>

      {modalConsentimento && (
        <ConsentimentoPainel
          menorDe18={menorDe18}
          onAtivar={ativarPainel}
          onAgoraNao={() => setModalConsentimento(false)}
        />
      )}

      <BottomNav />
    </main>
  )
}
