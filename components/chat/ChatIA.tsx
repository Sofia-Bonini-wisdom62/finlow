"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, Paperclip, ArrowUp, X, FileText, Square, History } from "lucide-react"
import type { CardIA as CardIATipo, AnexoChat, LancamentoProposto, TetoProposto } from "@/lib/ia"
import { CardIA } from "./CardIA"
import { ConfirmarLancamentos } from "./ConfirmarLancamentos"
import { ConfirmarOrcamento } from "./ConfirmarOrcamento"
import { ExtratoNoChat, type ExtratoLido } from "./ExtratoNoChat"
import { HistoricoConversas } from "./HistoricoConversas"
import { lerArquivo, ErroLeitura } from "@/lib/extrato/ler-no-navegador"

interface Mensagem {
  papel: "usuario" | "ia"
  texto: string
  cards?: CardIATipo[]
  lancamentos?: LancamentoProposto[]
  orcamento?: TetoProposto[]
  gastoAtual?: Record<string, number>
  anexos?: { nome: string; tipo: string }[]
  extrato?: ExtratoLido
}

/**
 * Extrato ou comprovante?
 *
 * PDF, CSV e OFX vão pelo pipeline do extrato — o que tem conferência
 * aritmética contra o saldo do banco. Imagem continua indo como anexo para o
 * modelo olhar, porque foto de comprovante é uma linha só e não fecha conta
 * nenhuma.
 */
const EH_EXTRATO = /\.(pdf|csv|ofx|qif|txt)$/i

const SUGESTOES = [
  "Quanto posso gastar esse fim de semana?",
  "Vale a pena parcelar?",
  "Como economizo R$ 300 este mês?",
  "Explique meu cartão.",
]

// Reconhecimento de voz nativo do navegador (Chrome/Edge). Degrada em silêncio
// onde não existe — o botão simplesmente não aparece.
type Reconhecimento = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

function criarReconhecimento(): Reconhecimento | null {
  if (typeof window === "undefined") return null
  const w = window as unknown as Record<string, unknown>
  const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as
    | (new () => Reconhecimento)
    | undefined
  if (!Ctor) return null
  const r = new Ctor()
  r.lang = "pt-BR"
  r.continuous = false
  r.interimResults = false
  return r
}

const MAX_ANEXO_MB = 8
/** Extrato tem limite próprio, igual ao da tela de extrato. */
const MAX_EXTRATO_MB = 10

export function ChatIA({ nome }: { nome: string }) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [rascunho, setRascunho] = useState("")
  const [anexos, setAnexos] = useState<AnexoChat[]>([])
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [ouvindo, setOuvindo] = useState(false)
  const [temVoz, setTemVoz] = useState(false)
  // null = conversa ainda não gravada. O servidor devolve o id no 1º turno.
  const [conversaId, setConversaId] = useState<string | null>(null)
  const [historicoAberto, setHistoricoAberto] = useState(false)

  const fimRef = useRef<HTMLDivElement>(null)
  const inputArquivo = useRef<HTMLInputElement>(null)
  const recRef = useRef<Reconhecimento | null>(null)

  useEffect(() => {
    setTemVoz(criarReconhecimento() !== null)
  }, [])

  /**
   * A leva de aulas que o gatilho de percentual liberou (§2.7 passo 5).
   *
   * Chega como mensagem do assistente, não como aviso: é uma recomendação com
   * um porquê, e o lugar de uma recomendação neste app é a conversa.
   *
   * Só entra se o chat ainda estiver vazio. Empurrar isso por cima de uma
   * conversa em andamento interromperia a pessoa no meio do assunto dela.
   */
  useEffect(() => {
    let vivo = true
    fetch("/api/chat/novidades")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!vivo || !d?.recomendacoes?.length) return
        setMensagens((m) =>
          m.length > 0
            ? m
            : [{
                papel: "ia",
                texto: d.texto ?? "Separei mais algumas aulas pra você.",
                cards: d.recomendacoes.map((r: { titulo: string; motivo: string; slug: string }) => ({
                  tipo: "recomendacao" as const,
                  titulo: r.titulo,
                  texto: r.motivo,
                  moduloSlug: r.slug,
                })),
              }]
        )
      })
      .catch(() => {})
    return () => { vivo = false }
  }, [])

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensagens, enviando])

  function alternarVoz() {
    if (ouvindo) {
      recRef.current?.stop()
      return
    }
    const r = criarReconhecimento()
    if (!r) return
    recRef.current = r
    r.onresult = (e) => {
      const texto = e.results[0]?.[0]?.transcript ?? ""
      if (texto) setRascunho((atual) => (atual ? `${atual} ${texto}` : texto))
    }
    r.onend = () => setOuvindo(false)
    r.onerror = () => setOuvindo(false)
    setOuvindo(true)
    r.start()
  }

  /**
   * Lê o extrato AQUI, no navegador, e manda só o texto para /api/extrato — a
   * mesma rota da tela de extrato. O arquivo não sai do computador da pessoa.
   */
  async function lerExtrato(f: File) {
    // O caminho do extrato pula a checagem do laço de anexos, então precisa da
    // sua: sem isto, um PDF de 80 MB seria lido inteiro na memória do celular.
    if (f.size > MAX_EXTRATO_MB * 1024 * 1024) {
      setErro(`"${f.name}" passa de ${MAX_EXTRATO_MB} MB. Tenta exportar um período menor pelo app do banco.`)
      return
    }
    setEnviando(true)
    setErro(null)
    setMensagens((m) => [
      ...m,
      { papel: "usuario", texto: "(extrato)", anexos: [{ nome: f.name, tipo: f.type }] },
    ])
    // Sem isto o fetch fica pendurado calado: a pessoa vê os pontinhos girando
    // para sempre e não sabe se travou ou se ainda está lendo. 180s cobre
    // extrato de 3 meses com folga (33s em paralelo, ~66s com o retry).
    const ctrl = new AbortController()
    const limite = setTimeout(() => ctrl.abort(), 180_000)
    try {
      const lido = await lerArquivo(f)
      const r = await fetch("/api/extrato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lido),
        signal: ctrl.signal,
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) {
        setMensagens((m) => [
          ...m,
          {
            papel: "ia",
            texto:
              (d.erro ?? d.error ?? "Não consegui ler esse extrato.") +
              (d.codigo === "PAINEL_INATIVO" ? " Ativa o Painel em Menu para eu poder registrar." : ""),
          },
        ])
        return
      }
      setMensagens((m) => [
        ...m,
        {
          papel: "ia",
          texto: `Terminei de ler. Confere antes de entrar no seu Painel.`,
          extrato: d as ExtratoLido,
        },
      ])
    } catch (e) {
      const abortado = e instanceof DOMException && e.name === "AbortError"
      setMensagens((m) => [
        ...m,
        {
          papel: "ia",
          texto: abortado
            ? "Esse extrato demorou demais e eu parei no meio. Tenta exportar um período menor pelo app do banco, um mês por vez costuma resolver."
            : e instanceof ErroLeitura
              ? e.mensagemUsuario
              : "Não consegui abrir esse arquivo.",
        },
      ])
    } finally {
      clearTimeout(limite)
      setEnviando(false)
    }
  }

  async function escolherArquivos(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(e.target.files ?? [])
    e.target.value = ""
    setErro(null)

    for (const f of arquivos) {
      if (EH_EXTRATO.test(f.name)) { await lerExtrato(f); continue }
      if (f.size > MAX_ANEXO_MB * 1024 * 1024) {
        setErro(`"${f.name}" passa de ${MAX_ANEXO_MB} MB.`)
        continue
      }
      const base64 = await new Promise<string>((res, rej) => {
        const fr = new FileReader()
        fr.onload = () => res(String(fr.result).split(",")[1] ?? "")
        fr.onerror = rej
        fr.readAsDataURL(f)
      })
      setAnexos((a) => [...a, { nome: f.name, tipo: f.type, tamanho: f.size, base64 }])
    }
  }

  async function enviar(textoDireto?: string) {
    const texto = (textoDireto ?? rascunho).trim()
    if ((!texto && anexos.length === 0) || enviando) return

    const minha: Mensagem = {
      papel: "usuario",
      texto: texto || "(anexo)",
      anexos: anexos.map((a) => ({ nome: a.nome, tipo: a.tipo })),
    }
    const historico = [...mensagens, minha]
    setMensagens(historico)
    setRascunho("")
    const anexosEnvio = anexos
    setAnexos([])
    setEnviando(true)
    setErro(null)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagens: historico.map((m, i) => ({
            papel: m.papel,
            texto: m.texto,
            ...(i === historico.length - 1 && anexosEnvio.length > 0 ? { anexos: anexosEnvio } : {}),
          })),
          conversaId,
        }),
      })

      const dados = await res.json().catch(() => ({}))

      if (!res.ok) {
        setErro(
          dados.error === "ia_nao_configurada"
            ? "O assistente ainda não está ligado nesta instalação. Suas Análises e seu Perfil continuam funcionando normalmente."
            : (dados.mensagem ?? "Não consegui responder agora. Tenta de novo?")
        )
        return
      }

      if (dados.conversaId) setConversaId(dados.conversaId)

      setMensagens((m) => [
        ...m,
        {
          papel: "ia",
          texto: dados.texto ?? "",
          cards: dados.cards,
          lancamentos: Array.isArray(dados.lancamentos) && dados.lancamentos.length
            ? dados.lancamentos
            : undefined,
          orcamento: Array.isArray(dados.orcamento) && dados.orcamento.length
            ? dados.orcamento
            : undefined,
          gastoAtual: dados.gastoAtual,
        },
      ])
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    } finally {
      setEnviando(false)
    }
  }

  const vazio = mensagens.length === 0

  /** Abre uma conversa guardada. Cards de ação não voltam, por desenho. */
  async function abrirConversa(id: string) {
    setErro(null)
    setEnviando(true)
    try {
      const r = await fetch(`/api/chat/conversas?id=${encodeURIComponent(id)}`)
      const d = await r.json().catch(() => ({}))
      if (!r.ok) { setErro(d.erro ?? "Não consegui abrir essa conversa."); return }
      setConversaId(id)
      setMensagens(
        (d.mensagens ?? []).map((m: { papel: string; texto: string; cards?: CardIATipo[] }) => ({
          papel: m.papel === "ia" ? "ia" : "usuario",
          texto: m.texto,
          cards: m.cards,
        }))
      )
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    } finally {
      setEnviando(false)
    }
  }

  function novaConversa() {
    setConversaId(null)
    setMensagens([])
    setErro(null)
  }

  return (
    <div className="flex h-dvh flex-col bg-fl-page lg:pl-56">
      {/* Barra fina só com o acesso ao histórico. Um cabeçalho cheio roubaria
          altura da conversa, que é o que a pessoa veio ver. */}
      <div className="flex justify-end px-4 pt-3 sm:px-5">
        <button
          onClick={() => setHistoricoAberto(true)}
          aria-label="Conversas anteriores"
          className="flex items-center gap-1.5 rounded-full border border-fl-border px-3 py-1.5 text-[12.5px] font-medium text-fl-ink-2 transition-colors hover:bg-fl-50 hover:text-fl-ink"
        >
          <History className="size-3.5" /> Conversas
        </button>
      </div>

      {/* histórico */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4 sm:px-5">
        <div className="mx-auto flex max-w-md flex-col gap-4 lg:max-w-2xl">
          {vazio && (
            <div className="pt-6">
              <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-fl-ink">
                Oi, {nome}.<br />
                <span className="text-fl-500">O que você quer entender?</span>
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-fl-ink-2">
                Pergunte em português. As respostas usam os seus números, não conselho genérico.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                {SUGESTOES.map((s) => (
                  <button
                    key={s}
                    onClick={() => enviar(s)}
                    className="rounded-2xl border border-fl-border bg-fl-card px-4 py-3 text-left text-sm text-fl-ink transition-colors hover:border-fl-500/50 hover:bg-fl-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mensagens.map((m, i) =>
            m.papel === "usuario" ? (
              <div key={i} className="flex flex-col items-end gap-1.5">
                <div className="max-w-[85%] rounded-[16px_16px_4px_16px] bg-fl-500 px-4 py-2.5 text-[14.5px] leading-relaxed text-primary-foreground">
                  {m.texto}
                </div>
                {m.anexos?.map((a) => (
                  <span key={a.nome} className="flex items-center gap-1.5 text-[11px] text-fl-ink-2">
                    <FileText className="size-3" /> {a.nome}
                  </span>
                ))}
              </div>
            ) : (
              <div key={i} className="flex flex-col gap-2.5">
                {m.texto && (
                  <div className="max-w-[92%] self-start rounded-[16px_16px_16px_4px] border border-fl-border bg-fl-card px-4 py-3 text-[14.5px] leading-relaxed text-fl-ink">
                    {m.texto}
                  </div>
                )}
                {m.cards?.map((c, j) => <CardIA key={j} card={c} />)}
                {m.lancamentos && <ConfirmarLancamentos lancamentos={m.lancamentos} />}
                {m.extrato && <ExtratoNoChat extrato={m.extrato} />}
                {m.orcamento && <ConfirmarOrcamento tetos={m.orcamento} gastoAtual={m.gastoAtual} />}
              </div>
            )
          )}

          {enviando && (
            <div className="flex items-center gap-2 self-start rounded-full border border-fl-border bg-fl-card px-4 py-2.5">
              {[0, 150, 300].map((atraso) => (
                <span
                  key={atraso}
                  className="size-1.5 rounded-full bg-fl-300 [animation:pulseDot_1.2s_infinite]"
                  style={{ animationDelay: `${atraso}ms` }}
                />
              ))}
            </div>
          )}

          {erro && (
            <div className="rounded-2xl border border-fl-accent/40 bg-fl-accent-light/40 px-4 py-3 text-sm leading-relaxed text-fl-accent-dark">
              {erro}
            </div>
          )}

          <div ref={fimRef} />
        </div>
      </div>

      {/* composer */}
      <div className="border-t border-fl-divider bg-fl-page px-4 pb-[76px] pt-3 sm:px-5 lg:pb-5">
        <div className="mx-auto max-w-md lg:max-w-2xl">
          {anexos.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {anexos.map((a, i) => (
                <span
                  key={`${a.nome}-${i}`}
                  className="flex items-center gap-1.5 rounded-full border border-fl-border bg-fl-card py-1 pl-2.5 pr-1 text-xs text-fl-ink"
                >
                  <FileText className="size-3 text-fl-ink-2" />
                  <span className="max-w-32 truncate">{a.nome}</span>
                  <button
                    aria-label={`Remover ${a.nome}`}
                    onClick={() => setAnexos((x) => x.filter((_, j) => j !== i))}
                    className="flex size-5 items-center justify-center rounded-full text-fl-ink-2 hover:bg-fl-divider"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); enviar() }}
            className="flex items-end gap-2 rounded-[22px] border border-fl-border bg-fl-card p-2"
          >
            <input
              ref={inputArquivo}
              type="file"
              multiple
              accept="image/*,application/pdf,.csv,.ofx"
              onChange={escolherArquivos}
              className="hidden"
            />
            <button
              type="button"
              aria-label="Anexar comprovante ou extrato"
              onClick={() => inputArquivo.current?.click()}
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-fl-ink-2 transition-colors hover:bg-fl-50 hover:text-fl-500"
            >
              <Paperclip className="size-5" />
            </button>

            <textarea
              value={rascunho}
              onChange={(e) => setRascunho(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar() }
              }}
              rows={1}
              placeholder="Pergunte, ou solte o extrato do banco aqui…"
              aria-label="Sua mensagem"
              className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2.5 text-[15px] text-fl-ink placeholder-fl-ink-3 outline-none"
            />

            {temVoz && (
              <button
                type="button"
                aria-label={ouvindo ? "Parar de gravar" : "Ditar mensagem"}
                onClick={alternarVoz}
                className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                  ouvindo ? "bg-fl-error/10 text-fl-error" : "text-fl-ink-2 hover:bg-fl-50 hover:text-fl-500"
                }`}
              >
                {ouvindo ? <Square className="size-4" /> : <Mic className="size-5" />}
              </button>
            )}

            <button
              type="submit"
              aria-label="Enviar"
              disabled={enviando || (!rascunho.trim() && anexos.length === 0)}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-fl-500 text-primary-foreground transition-opacity disabled:opacity-30"
            >
              <ArrowUp className="size-5" />
            </button>
          </form>
        </div>
      </div>

      <HistoricoConversas
        aberto={historicoAberto}
        atual={conversaId}
        onFechar={() => setHistoricoAberto(false)}
        onAbrir={abrirConversa}
        onNova={novaConversa}
      />
    </div>
  )
}
