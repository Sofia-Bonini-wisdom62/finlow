"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Upload, FileText, AlertTriangle, Check, Repeat, ArrowLeft, Loader2 } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { brl } from "@/lib/formato"
import { lerArquivo, ErroLeitura } from "@/lib/extrato/ler-no-navegador"

const LIMITE_MB = 10

interface TransacaoLida {
  id: string
  data: string
  descricaoOriginal: string
  descricaoLimpa: string
  valor: number
  categoria: string
  recorrente: boolean
}

interface Resultado {
  extratoImportId: string
  banco: string | null
  periodo: { inicio: string; fim: string }
  validacaoForte: boolean
  comoConferi: string | null
  cortadoPara3Meses: boolean
  resumo: {
    totalEntradas: number
    totalSaidas: number
    porCategoria: { categoria: string; nome: string; total: number; qtd: number }[]
    recorrentes: { descricaoLimpa: string; valor: number; ocorrencias: number }[]
  }
  transacoes: TransacaoLida[]
}

interface Falha {
  codigo: string
  erro: string
  motivo?: string
}

function dataCurta(iso: string): string {
  const [, m, d] = iso.split("-")
  return `${d}/${m}`
}

export default function ExtratoPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [falha, setFalha] = useState<Falha | null>(null)
  const [aceitos, setAceitos] = useState<Set<string>>(new Set())
  const [confirmando, setConfirmando] = useState(false)

  async function enviar(arquivo: File) {
    setFalha(null)
    if (arquivo.size > LIMITE_MB * 1024 * 1024) {
      setFalha({ codigo: "ARQUIVO_GRANDE", erro: `Esse arquivo passa de ${LIMITE_MB} MB. Tenta exportar de novo pelo app do banco — o PDF do extrato costuma ser bem menor.` })
      return
    }

    setEnviando(true)
    const inicio = Date.now()
    // Um extrato de 3 meses leva ~25s; extrato digitalizado (rota de visão)
    // leva bem mais. O corte precisa ser generoso o suficiente para não matar
    // um processamento que ia dar certo.
    const ctrl = new AbortController()
    const limite = setTimeout(() => ctrl.abort(), 180_000)

    try {
      // A leitura acontece AQUI, no navegador. O arquivo não é enviado —
      // o servidor recebe só o texto (ou as páginas em imagem, se for
      // digitalizado). Ver lib/extrato/ler-no-navegador.ts para o porquê.
      const lido = await lerArquivo(arquivo)
      const res = await fetch("/api/extrato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lido),
        signal: ctrl.signal,
      })

      // Resposta que não é JSON quase sempre é a plataforma cortando o caminho:
      // página de timeout do gateway, 413 de tamanho, HTML de erro.
      const tipo = res.headers.get("content-type") ?? ""
      if (!tipo.includes("application/json")) {
        setFalha({
          codigo: "PLATAFORMA",
          erro:
            res.status === 413
              ? "O servidor recusou o arquivo por tamanho antes mesmo de eu ler."
              : "O servidor encerrou a requisição antes de eu terminar de ler o extrato.",
          motivo: `HTTP ${res.status} após ${Math.round((Date.now() - inicio) / 1000)}s, resposta não-JSON`,
        })
        return
      }

      const d = await res.json()
      if (!res.ok) {
        // Os helpers compartilhados (getUserIdOr401, checarConsentimento) usam a
        // chave `error`; esta rota usa `erro`. Lendo só uma delas, um 401 ou 403
        // chegava como JSON válido e a tela caía no texto genérico — foi o
        // "Não consegui processar esse extrato." sem motivo nenhum.
        const mensagem = d.erro ?? d.error ?? d.mensagem
        setFalha({
          codigo: d.codigo ?? (res.status === 401 ? "SEM_SESSAO" : res.status === 403 ? "PAINEL_INATIVO" : `HTTP_${res.status}`),
          erro: mensagem ?? "Não consegui processar esse extrato.",
          motivo: d.motivo,
        })
        return
      }
      setResultado(d)
      // tudo vem marcado: o caminho comum é aceitar, e desmarcar é a exceção
      setAceitos(new Set(d.transacoes.map((t: TransacaoLida) => t.id)))
    } catch (e) {
      const segundos = Math.round((Date.now() - inicio) / 1000)
      // Erro de leitura local (PDF com senha, formato não suportado) tem
      // mensagem própria e não é falha de rede.
      if (e instanceof ErroLeitura) {
        setFalha({ codigo: e.codigo, erro: e.mensagemUsuario })
        return
      }
      const abortado = e instanceof DOMException && e.name === "AbortError"
      setFalha(
        abortado
          ? {
              codigo: "DEMOROU",
              erro: "A leitura passou de 3 minutos e eu parei de esperar. Extrato muito longo ou digitalizado costuma demorar — tenta um período menor, ou o PDF gerado pelo próprio app do banco em vez de um escaneado.",
              motivo: `abortado pelo app após ${segundos}s`,
            }
          : {
              codigo: "REDE",
              // Não afirmo mais "a conexão caiu": pode ter sido o servidor
              // encerrando a função no meio. Digo o que sei, não o que suponho.
              erro: "A requisição foi interrompida antes de terminar. Pode ter sido a conexão ou o servidor ter desistido de esperar.",
              motivo: `interrompida após ${segundos}s`,
            }
      )
    } finally {
      clearTimeout(limite)
      setEnviando(false)
    }
  }

  async function confirmar() {
    if (!resultado) return
    setConfirmando(true)
    try {
      const res = await fetch("/api/extrato/confirmar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extratoImportId: resultado.extratoImportId, idsAceitos: [...aceitos] }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setFalha({ codigo: "CONFIRMAR", erro: d.erro ?? d.error ?? "Não deu pra confirmar agora. Tenta de novo." })
        return
      }
      router.push("/analises")
    } finally {
      setConfirmando(false)
    }
  }

  function alternar(id: string) {
    setAceitos((s) => {
      const novo = new Set(s)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      return novo
    })
  }

  // ---------- estados de erro ----------
  if (falha) {
    const temCaminhoCSV = falha.codigo === "PDF_PROTEGIDO" || falha.codigo === "VALIDACAO_FALHOU" || falha.codigo === "PDF_ILEGIVEL"
    return (
      <main className="min-h-dvh bg-fl-page pb-24">
        <div className="mx-auto w-full max-w-md px-5 py-6">
          <Voltar />
          <div className="mt-6 rounded-[20px] border border-fl-border bg-fl-card p-6">
            <div className="flex size-11 items-center justify-center rounded-xl bg-fl-error/10">
              <AlertTriangle className="size-5 text-fl-error" />
            </div>
            <p className="mt-3 text-[15px] font-bold text-fl-ink">Não deu certo</p>
            <p className="mt-1.5 text-sm leading-relaxed text-fl-ink-2">{falha.erro}</p>
            {falha.motivo && (
              <p className="mt-2 rounded-xl bg-fl-page px-3 py-2 text-[12.5px] leading-snug text-fl-ink-3">{falha.motivo}</p>
            )}
            {temCaminhoCSV && (
              <p className="mt-3 text-[12.5px] leading-relaxed text-fl-ink-3">
                Você também pode lançar na mão — leva alguns minutos, mas funciona sempre.
              </p>
            )}
            {/* Erro de sessão ou de consentimento tem conserto de um clique —
                mandar a pessoa "tentar outro arquivo" seria um beco sem saída. */}
            <div className="mt-4 flex flex-col gap-2">
              {falha.codigo === "SEM_SESSAO" ? (
                <Link href="/login" className="rounded-xl bg-fl-500 py-3 text-center text-sm font-semibold text-primary-foreground">
                  Entrar de novo
                </Link>
              ) : falha.codigo === "PAINEL_INATIVO" ? (
                <Link href="/painel" className="rounded-xl bg-fl-500 py-3 text-center text-sm font-semibold text-primary-foreground">
                  Ativar meu Painel
                </Link>
              ) : (
                <button
                  onClick={() => { setFalha(null); setResultado(null) }}
                  className="rounded-xl bg-fl-500 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Tentar outro arquivo
                </button>
              )}
              <Link href="/painel" className="rounded-xl border border-fl-border py-3 text-center text-sm font-semibold text-fl-ink-2">
                Lançar na mão
              </Link>
            </div>
          </div>
        </div>
        <BottomNav />
      </main>
    )
  }

  // ---------- confirmação ----------
  if (resultado) {
    const { resumo, transacoes } = resultado
    const somaAceita = transacoes.filter((t) => aceitos.has(t.id)).length

    return (
      <main className="min-h-dvh bg-fl-page pb-32">
        <div className="mx-auto w-full max-w-md px-5 py-6">
          <Voltar />

          <header className="mt-4">
            <h1 className="text-[22px] font-extrabold tracking-tight text-fl-ink">Confere antes de entrar</h1>
            <p className="mt-1 text-sm leading-relaxed text-fl-ink-2">
              Li {transacoes.length} lançamentos
              {resultado.banco ? ` do ${resultado.banco}` : ""}, de {dataCurta(resultado.periodo.inicio)} a{" "}
              {dataCurta(resultado.periodo.fim)}. <strong className="text-fl-ink">Nada entra sem você confirmar.</strong>
            </p>
            {/* O produto promete "esse número é verdade". Quando dá para
                provar, prova — a frase abaixo é a diferença entre pedir
                confiança e mostrar o serviço. */}
            {resultado.validacaoForte ? (
              <p className="mt-2 rounded-xl bg-fl-500/10 px-3 py-2 text-[12.5px] leading-snug text-fl-ink-2">
                <strong className="font-semibold text-fl-ink">A conta fecha.</strong>{" "}
                Somei os lançamentos dia a dia e bateram com os saldos que o próprio banco declara no extrato
                {resultado.comoConferi ? ` (${resultado.comoConferi})` : ""}.
              </p>
            ) : (
              <p className="mt-2 rounded-xl bg-fl-accent/10 px-3 py-2 text-[12.5px] leading-snug text-fl-accent-dark">
                Esse extrato não declara saldo suficiente para eu conferir a soma contra o documento. Li o que
                estava lá, mas vale uma olhada com mais atenção nos valores.
              </p>
            )}
            {resultado.cortadoPara3Meses && (
              <p className="mt-2 text-[12.5px] leading-snug text-fl-ink-3">
                O arquivo tinha mais de 3 meses — trouxe só os 3 mais recentes.
              </p>
            )}
          </header>

          {/* O gancho: assinatura esquecida vem ANTES da lista, porque é o
              que a pessoa não sabia que ia descobrir ao subir o extrato. */}
          {resumo.recorrentes.length > 0 && (
            <section className="mt-5 rounded-[20px] border border-fl-accent/30 bg-fl-accent/5 p-5">
              <div className="flex items-center gap-2">
                <Repeat className="size-4 text-fl-accent-dark" />
                <h2 className="text-[15px] font-bold text-fl-ink">Isso se repete todo mês</h2>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-fl-ink-2">
                Cobranças que apareceram em mais de um mês. Vale conferir se você ainda usa todas.
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {resumo.recorrentes.slice(0, 5).map((r) => (
                  <li key={r.descricaoLimpa} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate capitalize text-fl-ink">{r.descricaoLimpa}</span>
                    <span className="shrink-0 tabular-nums text-fl-ink-2">
                      {brl(r.valor)} · {r.ocorrencias}×
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* resumo */}
          <section className="mt-4 grid grid-cols-2 gap-2.5">
            <Kpi rotulo="Entradas" valor={resumo.totalEntradas} cor="text-fl-success" />
            <Kpi rotulo="Saídas" valor={resumo.totalSaidas} cor="text-fl-ink" />
          </section>

          {resumo.porCategoria.length > 0 && (
            <section className="mt-4 rounded-[20px] border border-fl-border bg-fl-card p-5">
              <h2 className="text-[15px] font-bold text-fl-ink">Por categoria</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {resumo.porCategoria.slice(0, 6).map((c) => (
                  <li key={c.categoria} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-fl-ink">{c.nome}</span>
                    <span className="shrink-0 tabular-nums text-fl-ink-2">
                      {brl(c.total)} · {c.qtd}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* lista */}
          <section className="mt-4">
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-[15px] font-bold text-fl-ink">Lançamentos</h2>
              <button
                onClick={() =>
                  setAceitos(aceitos.size === transacoes.length ? new Set() : new Set(transacoes.map((t) => t.id)))
                }
                className="text-[12.5px] font-semibold text-fl-500"
              >
                {aceitos.size === transacoes.length ? "Desmarcar todos" : "Marcar todos"}
              </button>
            </div>

            <ul className="divide-y divide-fl-divider overflow-hidden rounded-[20px] border border-fl-border bg-fl-card">
              {transacoes.map((t) => {
                const marcado = aceitos.has(t.id)
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => alternar(t.id)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                        marcado ? "" : "opacity-45"
                      }`}
                      aria-pressed={marcado}
                    >
                      <span
                        aria-hidden
                        className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          marcado ? "border-fl-500 bg-fl-500" : "border-fl-border"
                        }`}
                      >
                        {marcado && <Check className="size-3.5 text-primary-foreground" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-fl-ink">{t.descricaoLimpa}</span>
                        <span className="text-[11.5px] text-fl-ink-3">
                          {dataCurta(t.data)}
                          {t.recorrente ? " · recorrente" : ""}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 text-sm font-semibold tabular-nums ${
                          t.valor >= 0 ? "text-fl-success" : "text-fl-ink-2"
                        }`}
                      >
                        {t.valor >= 0 ? "+" : "−"} {brl(Math.abs(t.valor))}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>

        {/* barra fixa: a decisão fica sempre à mão, sem precisar rolar até o fim */}
        <div className="fixed inset-x-0 bottom-14 border-t border-fl-border bg-fl-card/95 px-5 py-3 backdrop-blur">
          <div className="mx-auto flex w-full max-w-md items-center gap-3">
            <span className="text-[12.5px] text-fl-ink-2">
              {somaAceita} de {transacoes.length}
            </span>
            <button
              onClick={confirmar}
              disabled={confirmando || somaAceita === 0}
              className="flex-1 rounded-xl bg-fl-500 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {confirmando ? "Confirmando…" : somaAceita === 0 ? "Marque ao menos um" : `Confirmar ${somaAceita}`}
            </button>
          </div>
        </div>
        <BottomNav />
      </main>
    )
  }

  // ---------- upload ----------
  return (
    <main className="min-h-dvh bg-fl-page pb-24">
      <div className="mx-auto w-full max-w-md px-5 py-6">
        <Voltar />

        <header className="mt-4">
          <h1 className="text-[26px] font-extrabold tracking-tight text-fl-ink">Subir extrato</h1>
          <p className="mt-1 text-sm leading-relaxed text-fl-ink-2">
            Manda o extrato ou a fatura em PDF, CSV ou OFX. Eu leio, organizo por categoria e te
            mostro tudo antes de qualquer coisa entrar.
          </p>
        </header>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf,.csv,.ofx,.txt"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) enviar(f) }}
        />

        <button
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
          className="mt-6 flex w-full flex-col items-center gap-3 rounded-[20px] border-2 border-dashed border-fl-border bg-fl-card px-6 py-10 transition-colors hover:border-fl-500 disabled:opacity-70"
        >
          {enviando ? (
            <>
              <Loader2 className="size-7 animate-spin text-fl-500" />
              <span className="text-[15px] font-bold text-fl-ink">Lendo seu extrato…</span>
              <span className="text-center text-[12.5px] leading-relaxed text-fl-ink-2">
                Leva alguns segundos. O arquivo não é salvo — some assim que eu termino de ler.
              </span>
            </>
          ) : (
            <>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-fl-50">
                <Upload className="size-5 text-fl-500" />
              </div>
              <span className="text-[15px] font-bold text-fl-ink">Escolher arquivo</span>
              <span className="text-[12.5px] text-fl-ink-3">PDF, CSV ou OFX — até {LIMITE_MB} MB</span>
            </>
          )}
        </button>

        <section className="mt-6 rounded-[20px] border border-fl-border bg-fl-card p-5">
          <h2 className="flex items-center gap-2 text-[14px] font-bold text-fl-ink">
            <FileText className="size-4 text-fl-500" /> O que acontece com o arquivo
          </h2>
          <ul className="mt-2.5 flex flex-col gap-1.5 text-[13px] leading-relaxed text-fl-ink-2">
            <li>• O arquivo <strong className="font-semibold">não sai do seu computador</strong> — a leitura acontece aqui, e só o texto vai para o servidor.</li>
            <li>• Nome de pessoa, CPF e chave Pix são removidos das descrições.</li>
            <li>• Nada entra nas suas Análises sem você confirmar linha a linha.</li>
          </ul>
        </section>

        <p className="mt-4 px-1 text-[12.5px] leading-relaxed text-fl-ink-3">
          Se o PDF tiver senha, abre ele no computador e salva uma cópia sem senha antes de subir.
          Se preferir, dá pra{" "}
          <Link href="/painel" className="font-semibold text-fl-500">lançar na mão</Link>.
        </p>
      </div>
      <BottomNav />
    </main>
  )
}

function Voltar() {
  return (
    <Link href="/analises" className="inline-flex items-center gap-1.5 text-sm font-semibold text-fl-ink-2">
      <ArrowLeft className="size-4" /> Voltar
    </Link>
  )
}

function Kpi({ rotulo, valor, cor }: { rotulo: string; valor: number; cor: string }) {
  return (
    <div className="rounded-2xl border border-fl-border bg-fl-card px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-fl-ink-2">{rotulo}</div>
      <div className={`mt-0.5 text-lg font-extrabold tabular-nums tracking-tight ${cor}`}>{brl(valor)}</div>
    </div>
  )
}
