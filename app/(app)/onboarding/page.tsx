"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowUp, Brain, Landmark, Check, ArrowRight } from "lucide-react"
import type { LancamentoProposto } from "@/lib/ia"
import { ConfirmarLancamentos } from "@/components/chat/ConfirmarLancamentos"
import { POSE } from "@/lib/fin"

/**
 * Primeira conversa.
 *
 * Duas coisas que a tela resolve e o roteiro não resolveria sozinho:
 *
 * 1. Os dois aceites (memória e Painel) ficam ANTES da conversa, juntos e
 *    explicados. Pedir no meio interromperia a única conversa em que a pessoa
 *    está realmente contando algo — e pedir permissão no meio de uma frase é o
 *    jeito mais rápido de receber um "não".
 *
 * 2. Dá para pular. Onboarding obrigatório é a forma mais eficiente de perder
 *    alguém que só queria ver o app por dentro.
 */

/** Um passo do processamento, como o servidor devolve. */
interface PassoFeito {
  id: string
  rotulo: string
  ok: boolean
  detalhe?: string
}

interface Mensagem {
  papel: "usuario" | "ia"
  texto: string
  lancamentos?: LancamentoProposto[]
  /** Respostas prontas para a pergunta desta mensagem. */
  sugestoes?: string[]
}

/**
 * As opções da primeira pergunta são fixas, escritas por nós.
 *
 * A abertura também é fixa (ver `comecar()`), então não existe modelo nenhum
 * para gerá-las neste ponto. E mesmo que existisse: esta é a primeira coisa
 * que a pessoa vê dentro do app, e as quatro portas de entrada do produto não
 * deveriam mudar a cada carregamento.
 *
 * Uma para cada trilha, de propósito — quem toca já entra pelo caminho certo.
 */
const SUGESTOES_ABERTURA = [
  "Some tudo antes do fim do mês",
  "Levei um susto com a fatura",
  "Quero juntar pra uma meta",
  "Guardo, mas não sei o que fazer com isso",
]

const PERFIS: Record<string, string> = {
  lancador: "Fluxo de caixa",
  guardador: "Guardar e usar",
  impulsivo: "Compra por impulso",
  sonhador: "Metas e planos",
}

export default function OnboardingPage() {
  const router = useRouter()
  const [fase, setFase] = useState<"carregando" | "aceite" | "conversa" | "processando" | "fim">("carregando")
  const [feitos, setFeitos] = useState<PassoFeito[]>([])
  const [passos, setPassos] = useState<{ id: string; rotulo: string }[]>([])
  const [nome, setNome] = useState("")
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [rascunho, setRascunho] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [perfil, setPerfil] = useState<string | null>(null)
  const fim = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/onboarding")
      .then((r) => (r.status === 401 ? null : r.json()))
      .then((d) => {
        if (!d) { router.replace("/login"); return }
        setNome(d.nome ?? "")
        // Já fez: não repete. Quem quiser refazer entra pelo Menu.
        if (d.concluido) { router.replace("/chat"); return }
        setFase("aceite")
      })
      .catch(() => setFase("aceite"))
  }, [router])

  useEffect(() => { fim.current?.scrollIntoView({ behavior: "smooth" }) }, [mensagens, enviando])

  // A lista de passos vem antes de ser precisa: mostrar o que FALTA é o que
  // torna a espera legível. Uma lista que cresce sozinha não diz quanto falta.
  useEffect(() => {
    fetch("/api/onboarding/pipeline")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.passos) setPassos(d.passos) })
      .catch(() => {})
  }, [])

  /**
   * A abertura é FIXA, escrita por nós, e não vem do modelo.
   *
   * Dois motivos. O técnico: com histórico vazio a costura da IA responde
   * "Não recebi sua pergunta" — não existe turno zero. O de produto, que pesa
   * mais: esta é a primeira frase que a pessoa lê dentro do app, e ela não pode
   * mudar a cada execução nem depender de o modelo estar bem-humorado.
   */
  async function comecar() {
    setFase("conversa")
    await fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memoria: true, painel: true }),
    }).catch(() => {})
    setMensagens([{
      papel: "ia",
      texto:
        "O Finlow serve pra você saber para onde o seu dinheiro vai, sem planilha e sem culpa. " +
        "Pra começar bem: o que te fez procurar isso agora?",
      sugestoes: SUGESTOES_ABERTURA,
    }])
  }

  async function turno(historico: Mensagem[]) {
    setEnviando(true)
    setErro(null)
    try {
      const r = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagens: historico.map((m) => ({ papel: m.papel, texto: m.texto })),
        }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) {
        setErro(
          d.error === "ia_nao_configurada"
            ? "O assistente ainda não está ligado nesta instalação."
            : (d.mensagem ?? "Não consegui responder agora. Tenta de novo?")
        )
        return
      }

      setMensagens((m) => [
        ...m,
        {
          papel: "ia",
          texto: d.texto ?? "",
          lancamentos: Array.isArray(d.lancamentos) && d.lancamentos.length ? d.lancamentos : undefined,
          sugestoes: Array.isArray(d.sugestoes) && d.sugestoes.length ? d.sugestoes : undefined,
        },
      ])

      if (d.concluido && d.perfilSugerido) {
        // Só estado de tela. O perfil que o app lê é o do banco, gravado por
        // /api/onboarding — copiá-lo para o localStorage criava uma segunda
        // verdade, que sobrevivia ao logout e vazava para a conta seguinte.
        setPerfil(d.perfilSugerido)
        setFase("processando")
        processar()
      }
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    } finally {
      setEnviando(false)
    }
  }

  /**
   * O processamento do fim (§2.7), passo a passo de verdade.
   *
   * Lê NDJSON conforme o servidor manda, uma linha por passo terminado. É por
   * isso que a lista à esquerda anda junto com o que está mesmo acontecendo, e
   * não numa animação por conta própria.
   *
   * Falhar aqui não prende a pessoa na tela: o pipeline não derruba nada por
   * causa de um passo, e o que ela contou já está gravado desde a conversa.
   */
  async function processar() {
    try {
      const r = await fetch("/api/onboarding/pipeline", { method: "POST" })
      if (!r.ok || !r.body) { setFase("fim"); return }

      const leitor = r.body.getReader()
      const dec = new TextDecoder()
      let resto = ""

      for (;;) {
        const { done, value } = await leitor.read()
        if (done) break
        resto += dec.decode(value, { stream: true })
        const linhas = resto.split("\n")
        // A última pode estar cortada no meio: fica para o próximo pedaço.
        resto = linhas.pop() ?? ""
        for (const linha of linhas) {
          if (!linha.trim()) continue
          try {
            const p = JSON.parse(linha) as PassoFeito
            setFeitos((f) => [...f, p])
          } catch {}
        }
      }
    } catch {
      // sem conexão: segue para o fim, o app funciona igual
    } finally {
      setFase("fim")
    }
  }

  /**
   * Um caminho só para os dois jeitos de responder.
   *
   * O card manda o mesmo texto que a pessoa teria escrito, então nada depois
   * daqui precisa saber se ela tocou ou digitou — inclusive o modelo.
   */
  async function enviar(escolhido?: string) {
    const texto = (escolhido ?? rascunho).trim()
    if (!texto || enviando) return
    const proximo: Mensagem[] = [...mensagens, { papel: "usuario", texto }]
    setMensagens(proximo)
    setRascunho("")
    await turno(proximo)
  }

  if (fase === "carregando") {
    return <main className="grid min-h-dvh place-items-center bg-fl-page text-sm text-fl-ink-3">Um instante…</main>
  }

  // ---------- aceite ----------
  if (fase === "aceite") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col justify-center px-6 py-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={POSE.teach} alt="" className="h-[100px] self-start object-contain" />
        <h1 className="mt-3 text-[27px] font-extrabold leading-tight tracking-tight text-fl-ink">
          {nome ? `Oi, ${nome.split(" ")[0]}.` : "Oi."}
          <br />
          Vamos começar com uma conversa.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-fl-ink-2">
          Uns cinco minutos. Eu entendo o que você veio resolver, já registro seus primeiros gastos e
          escolho por onde a sua trilha começa.
        </p>

        <div className="mt-7 space-y-3">
          <div className="flex gap-3 rounded-2xl border border-fl-border bg-fl-card p-4">
            <Brain className="mt-0.5 size-5 shrink-0 text-fl-500" />
            <div>
              <p className="text-[14.5px] font-semibold text-fl-ink">Vou lembrar do que você contar</p>
              <p className="mt-0.5 text-[12.5px] leading-snug text-fl-ink-3">
                Para não te perguntar a mesma coisa toda vez. Você lê e apaga tudo em Menu &gt; Memória
                do assistente. Nunca guardo valor, saldo, CPF ou senha.
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-2xl border border-fl-border bg-fl-card p-4">
            <Landmark className="mt-0.5 size-5 shrink-0 text-fl-500" />
            <div>
              <p className="text-[14.5px] font-semibold text-fl-ink">Vou poder registrar seus gastos</p>
              <p className="mt-0.5 text-[12.5px] leading-snug text-fl-ink-3">
                Você me conta, eu mostro o que entendi e só entra depois que você confirmar. Tudo fica
                cifrado e some quando você mandar apagar.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={comecar}
          className="fin-btn-3d mt-7 w-full rounded-2xl bg-fl-500 py-3.5 text-[15px] font-extrabold text-primary-foreground"
        >
          Combinado, vamos
        </button>
        <Link href="/chat" className="mt-3 text-center text-[13.5px] font-medium text-fl-ink-3">
          Prefiro olhar o app sozinha
        </Link>
      </main>
    )
  }

  // ---------- processando ----------
  if (fase === "processando") {
    const lista = passos.length ? passos : feitos
    const emCurso = lista[feitos.length]

    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col justify-center px-6 py-10">
        <h1 className="text-[24px] font-extrabold leading-tight tracking-tight text-fl-ink">
          Deixa eu organizar isso.
        </h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-fl-ink-2">
          Uns segundos. Estou lendo o que você me contou e montando o seu começo.
        </p>

        <ul className="mt-7 space-y-2.5" aria-live="polite">
          {lista.map((p, i) => {
            const feito = feitos[i]
            const agora = !feito && p.id === emCurso?.id
            return (
              <li key={p.id} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={`grid size-6 shrink-0 place-items-center rounded-full ${
                    feito ? (feito.ok ? "bg-fl-500" : "bg-fl-divider") : "border border-fl-border"
                  }`}
                >
                  {feito ? (
                    feito.ok ? <Check className="size-3.5 text-primary-foreground" />
                             : <span className="text-[11px] text-fl-ink-3">-</span>
                  ) : agora ? (
                    <span className="size-2 animate-pulse rounded-full bg-fl-500" />
                  ) : null}
                </span>
                <span className={`text-[14px] ${feito ? "text-fl-ink" : agora ? "text-fl-ink" : "text-fl-ink-3"}`}>
                  {p.rotulo}
                  {feito?.detalhe && (
                    <span className="ml-1.5 text-[12.5px] text-fl-ink-3">{feito.detalhe}</span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      </main>
    )
  }

  // ---------- fim ----------
  if (fase === "fim") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col justify-center px-6 py-10 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={POSE.proud} alt="" className="fin-pop mx-auto h-[130px] object-contain" />
        <h1 className="mt-4 text-[26px] font-extrabold leading-tight tracking-tight text-fl-ink">
          Pronto. Já sei por onde a gente começa.
        </h1>
        {perfil && (
          <p className="mt-3 text-[15px] leading-relaxed text-fl-ink-2">
            Sua trilha é <strong className="font-semibold text-fl-ink">{PERFIS[perfil] ?? "Fluxo de caixa"}</strong>.
            São 4 módulos curtos, na ordem que faz sentido para o que você me contou.
          </p>
        )}
        <div className="mt-7 space-y-2.5">
          <Link
            href="/trilha"
            className="fin-btn-3d flex w-full items-center justify-center gap-2 rounded-2xl bg-fl-500 py-3.5 text-[15px] font-extrabold text-primary-foreground"
          >
            Ver minha trilha <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/extrato"
            className="flex w-full items-center justify-center rounded-2xl border border-fl-border py-3.5 text-[14.5px] font-medium text-fl-ink-2"
          >
            Subir o extrato do banco
          </Link>
        </div>
      </main>
    )
  }

  // ---------- conversa ----------
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col px-5">
      <div className="flex items-center justify-between pt-5">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-fl-ink-3">
          Primeira conversa
        </span>
        <Link href="/chat" className="text-[12.5px] font-medium text-fl-ink-3">Pular</Link>
      </div>

      <div className="flex-1 space-y-3 py-5">
        {mensagens.map((m, i) =>
          m.papel === "usuario" ? (
            <div key={i} className="max-w-[85%] self-end rounded-[16px_16px_4px_16px] bg-fl-500 px-4 py-2.5 text-[14.5px] leading-relaxed text-primary-foreground ml-auto">
              {m.texto}
            </div>
          ) : (
            <div key={i} className="flex flex-col gap-2">
              {m.texto && (
                <div className="flex max-w-[92%] items-end gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={POSE.hi} alt="" className="size-[30px] shrink-0 object-contain" />
                  <div className="rounded-[16px_16px_16px_4px] border border-fl-border bg-fl-card px-4 py-3 text-[14.5px] leading-relaxed text-fl-ink">
                    {m.texto}
                  </div>
                </div>
              )}
              {m.lancamentos && <ConfirmarLancamentos lancamentos={m.lancamentos} />}

              {/* Só na última mensagem: card de pergunta velha continuaria
                  clicável e responderia coisa que já passou. */}
              {m.sugestoes && i === mensagens.length - 1 && !enviando && (
                <div className="mt-0.5 flex flex-col gap-1.5">
                  {m.sugestoes.map((s) => (
                    <button
                      key={s}
                      onClick={() => enviar(s)}
                      className="flex items-center justify-between gap-2 rounded-2xl border border-fl-500/25 bg-fl-50/60 px-4 py-3 text-left text-[14px] font-medium leading-snug text-fl-ink transition-colors hover:border-fl-500 hover:bg-fl-50 active:scale-[0.99]"
                    >
                      {s}
                      <ArrowRight className="size-3.5 shrink-0 text-fl-500" />
                    </button>
                  ))}
                  <p className="mt-0.5 px-1 text-[12px] text-fl-ink-3">
                    Ou escreve do seu jeito aqui embaixo.
                  </p>
                </div>
              )}
            </div>
          )
        )}

        {enviando && (
          <div className="flex w-fit items-center gap-1.5 rounded-full border border-fl-border bg-fl-card px-4 py-2.5">
            {[0, 150, 300].map((a) => (
              <span key={a} className="size-1.5 animate-bounce rounded-full bg-fl-ink-3" style={{ animationDelay: `${a}ms` }} />
            ))}
          </div>
        )}

        {erro && <p className="rounded-xl bg-fl-error/10 px-3 py-2 text-[13px] text-fl-error">{erro}</p>}
        <div ref={fim} />
      </div>

      <div className="sticky bottom-0 flex items-end gap-2 bg-fl-page pb-5 pt-2">
        <textarea
          value={rascunho}
          onChange={(e) => setRascunho(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar() } }}
          rows={1}
          placeholder="Escreve aqui…"
          disabled={enviando}
          className="max-h-32 flex-1 resize-none rounded-2xl border border-fl-border bg-fl-card px-4 py-3 text-[14.5px] text-fl-ink outline-none placeholder:text-fl-ink-3 focus:border-fl-500"
        />
        <button
          onClick={() => enviar()}
          disabled={enviando || !rascunho.trim()}
          aria-label="Enviar"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-fl-500 text-primary-foreground disabled:opacity-40"
        >
          <ArrowUp className="size-5" />
        </button>
      </div>
    </main>
  )
}
