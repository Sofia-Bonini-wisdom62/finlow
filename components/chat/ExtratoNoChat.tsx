"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ChevronDown, ChevronUp, ShieldCheck, AlertTriangle, ArrowRight, Repeat } from "lucide-react"
import { DecisaoAjuste, type Ajuste } from "@/components/extrato/DecisaoAjuste"

/**
 * Extrato lido dentro da conversa.
 *
 * POR QUE PASSA PELO MESMO PIPELINE DE /extrato
 * Seria mais simples mandar o PDF direto para o modelo do chat e pedir os
 * lançamentos. Seria também errado: o pipeline do extrato tem a conferência
 * aritmética contra os saldos diários do banco, o corte de 3 meses e as regras
 * de PII. Parseando por fora, os números chegariam à tela sem nunca terem
 * passado pelo portão — e "esse número é verdade" deixaria de ser verdade
 * exatamente no caminho mais fácil de usar.
 *
 * A revisão fica aqui, e não numa tela separada, porque o arquivo já foi lido:
 * mandar a pessoa para outra página exigiria reprocessar ou reconstruir o que
 * está na memória, e ela perderia o fio da conversa no meio.
 */

export interface ExtratoLido {
  extratoImportId: string
  banco: string | null
  periodo: { inicio: string; fim: string }
  validacaoForte: boolean
  comoConferi: string | null
  contaFechou: boolean
  motivoDivergencia: string | null
  ajuste: Ajuste | null
  cortadoPara3Meses: boolean
  resumo: {
    totalEntradas: number
    totalSaidas: number
    porCategoria: { categoria: string; nome: string; total: number; qtd: number }[]
    recorrentes: { descricaoLimpa: string; valor: number; ocorrencias: number }[]
  }
  transacoes: {
    id: string
    data: string
    descricaoLimpa: string
    valor: number
    categoria: string
  }[]
}

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

const dataCurta = (iso: string) => {
  const [, m, d] = iso.split("-")
  return `${d}/${m}`
}

export function ExtratoNoChat({ extrato }: { extrato: ExtratoLido }) {
  const [recusados, setRecusados] = useState<Set<string>>(new Set())
  // Ajuste vem marcado: sem ele o total fica errado, e o caso comum é a pessoa
  // querer o número certo. Desmarcar continua sendo um toque.
  const [incluirAjuste, setIncluirAjuste] = useState(true)
  const [aberto, setAberto] = useState(false)
  const [estado, setEstado] = useState<"aberto" | "salvando" | "salvo" | "erro">("aberto")
  const [erro, setErro] = useState<string | null>(null)
  const [confirmadas, setConfirmadas] = useState(0)

  const aceitos = extrato.transacoes.filter((t) => !recusados.has(t.id))

  async function confirmar() {
    setEstado("salvando")
    setErro(null)
    try {
      const r = await fetch("/api/extrato/confirmar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extratoImportId: extrato.extratoImportId,
          idsAceitos: aceitos.map((t) => t.id),
          ajuste: incluirAjuste ? extrato.ajuste : null,
        }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) {
        setEstado("erro")
        setErro(d.erro ?? d.error ?? "Não consegui registrar agora.")
        return
      }
      setConfirmadas(d.confirmadas ?? aceitos.length)
      setEstado("salvo")
    } catch {
      setEstado("erro")
      setErro("A conexão caiu no meio. Tenta de novo.")
    }
  }

  if (estado === "salvo") {
    return (
      <div className="mt-2 rounded-2xl border border-fl-500/30 bg-fl-500/5 px-4 py-3">
        <p className="flex items-center gap-2 text-[13.5px] font-semibold text-fl-ink">
          <Check className="size-4 text-fl-500" />
          {confirmadas} {confirmadas === 1 ? "lançamento registrado" : "lançamentos registrados"}
        </p>
        <Link href="/analises" className="mt-1.5 inline-flex items-center gap-1 text-[12.5px] font-semibold text-fl-500">
          Ver nas Análises <ArrowRight className="size-3.5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-fl-border bg-fl-card">
      <div className="px-4 pt-3.5">
        <p className="text-[14px] font-semibold text-fl-ink">
          Li {extrato.transacoes.length} lançamentos
          {extrato.banco ? ` do ${extrato.banco}` : ""}
        </p>
        <p className="mt-0.5 text-[12px] text-fl-ink-3">
          {dataCurta(extrato.periodo.inicio)} a {dataCurta(extrato.periodo.fim)} · nada entra sem você confirmar
        </p>

        <div className="mt-3 flex gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-fl-ink-3">Entrou</p>
            <p className="text-[15px] font-semibold tabular-nums text-fl-500">{brl(extrato.resumo.totalEntradas)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-fl-ink-3">Saiu</p>
            <p className="text-[15px] font-semibold tabular-nums text-fl-ink">{brl(extrato.resumo.totalSaidas)}</p>
          </div>
        </div>

        {/* A conferência só aparece quando ela EXISTE. Quando a conta não
            fechou, quem fala é o bloco de decisão logo abaixo — dois avisos
            sobre a mesma coisa competem e a pessoa não lê nenhum. */}
        {extrato.contaFechou && (
          <p
            className={`mt-3 flex items-start gap-1.5 rounded-xl px-3 py-2 text-[12px] leading-snug ${
              extrato.validacaoForte ? "bg-fl-500/10 text-fl-ink-2" : "bg-fl-accent/10 text-fl-accent-dark"
            }`}
          >
            {extrato.validacaoForte ? (
              <ShieldCheck className="mt-px size-3.5 shrink-0 text-fl-500" />
            ) : (
              <AlertTriangle className="mt-px size-3.5 shrink-0" />
            )}
            {extrato.validacaoForte ? (
              <span>
                <strong className="font-semibold text-fl-ink">A conta fecha.</strong> Somei dia a dia e bateu
                com os saldos que o banco declara.
              </span>
            ) : (
              <span>Esse extrato não declara saldo suficiente para eu conferir a soma. Vale uma olhada com atenção.</span>
            )}
          </p>
        )}

        <DecisaoAjuste
          ajuste={extrato.ajuste}
          contaFechou={extrato.contaFechou}
          motivo={extrato.motivoDivergencia}
          incluir={incluirAjuste}
          onMudar={setIncluirAjuste}
        />

        {extrato.cortadoPara3Meses && (
          <p className="mt-1.5 text-[11.5px] text-fl-ink-3">
            O arquivo tinha mais de 3 meses, trouxe só os 3 mais recentes.
          </p>
        )}
      </div>

      {/* O gancho: assinatura que se repete todo mês vem ANTES da lista. */}
      {extrato.resumo.recorrentes.length > 0 && (
        <div className="mx-4 mt-3 rounded-xl border border-fl-accent/30 bg-fl-accent/5 p-3">
          <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-fl-ink">
            <Repeat className="size-3.5" /> Isso se repete todo mês
          </p>
          <ul className="mt-1.5 space-y-1">
            {extrato.resumo.recorrentes.slice(0, 4).map((r) => (
              <li key={r.descricaoLimpa} className="flex justify-between gap-3 text-[12.5px]">
                <span className="min-w-0 truncate text-fl-ink-2">{r.descricaoLimpa}</span>
                <span className="shrink-0 tabular-nums text-fl-ink">
                  {brl(r.valor)} × {r.ocorrencias}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => setAberto((a) => !a)}
        className="mt-3 flex w-full items-center justify-between px-4 py-2.5 text-[12.5px] font-medium text-fl-ink-2"
      >
        {aberto ? "Esconder a lista" : `Ver os ${extrato.transacoes.length} um por um`}
        {aberto ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>

      {aberto && (
        <ul className="max-h-80 divide-y divide-fl-divider overflow-y-auto border-t border-fl-divider">
          {extrato.transacoes.map((t) => {
            const fora = recusados.has(t.id)
            return (
              <li key={t.id}>
                <button
                  onClick={() =>
                    setRecusados((s) => {
                      const n = new Set(s)
                      if (n.has(t.id)) n.delete(t.id)
                      else n.add(t.id)
                      return n
                    })
                  }
                  className="flex w-full items-center gap-3 px-4 py-2 text-left"
                >
                  <span
                    aria-hidden
                    className={`grid size-4 shrink-0 place-items-center rounded border transition-colors ${
                      fora ? "border-fl-border" : "border-fl-500 bg-fl-500"
                    }`}
                  >
                    {!fora && <Check className="size-2.5 text-primary-foreground" />}
                  </span>
                  <span className={`min-w-0 flex-1 truncate text-[12.5px] ${fora ? "text-fl-ink-3 line-through" : "text-fl-ink"}`}>
                    {t.descricaoLimpa}
                  </span>
                  <span className="shrink-0 text-[11px] text-fl-ink-3">{dataCurta(t.data)}</span>
                  <span
                    className={`shrink-0 text-[12.5px] font-semibold tabular-nums ${
                      fora ? "text-fl-ink-3" : t.valor >= 0 ? "text-fl-500" : "text-fl-ink"
                    }`}
                  >
                    {brl(t.valor)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {erro && <p className="px-4 pt-2 text-[12.5px] text-fl-error">{erro}</p>}

      <div className="p-3">
        <button
          onClick={confirmar}
          disabled={estado === "salvando" || aceitos.length === 0}
          className="w-full rounded-xl bg-fl-500 py-2.5 text-[13.5px] font-semibold text-primary-foreground disabled:opacity-40"
        >
          {estado === "salvando"
            ? "Registrando…"
            : aceitos.length === 0
              ? "Nada marcado"
              : `Registrar ${aceitos.length} ${aceitos.length === 1 ? "lançamento" : "lançamentos"}`}
        </button>
        {recusados.size > 0 && (
          <p className="mt-1.5 text-center text-[11.5px] text-fl-ink-3">
            {recusados.size} desmarcado{recusados.size > 1 ? "s" : ""}, some sem entrar no Painel
          </p>
        )}
      </div>
    </div>
  )
}
