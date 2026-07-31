"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { brl, dataCurta } from "@/lib/formato"

/** Estrutural de propósito: as Análises e o Painel têm cada um o seu tipo de
 *  fatia, com os mesmos campos. Pedir só o que uso serve aos dois. */
interface Fatia {
  nome: string
  cor: string
  total: number
  pct: number
}

/**
 * Os lançamentos que formam uma fatia do gráfico.
 *
 * POR QUE ISTO IMPORTA
 * "Alimentação: R$ 1.240" é uma acusação sem prova. A pessoa olha, não
 * reconhece o número e não tem o que fazer com ele. Abrir a lista transforma o
 * total em algo verificável — e é onde ela descobre que metade era a compra do
 * mês, não o cafezinho.
 *
 * Busca sob demanda, ao abrir. O mês inteiro de lançamentos não precisa viajar
 * junto com as Análises só porque a pessoa TALVEZ toque numa fatia.
 */

interface Transacao {
  id: string
  descricao: string
  valor: number
  tipo: string
  data: string
  categoria?: { nome: string } | null
}

interface Props {
  fatia: Fatia | null
  /** Só usados na busca. Com `itens`, não há busca — e eles não fazem falta. */
  mes?: number
  ano?: number
  onFechar: () => void
  /**
   * Lançamentos já carregados. Quando vêm daqui, não há busca: o Painel já tem
   * o mês inteiro em memória e pedir de novo seria uma ida ao servidor para
   * receber o que já está na tela.
   */
  itens?: Transacao[]
}

export function DetalheCategoria({ fatia, mes, ano, onFechar, itens: itensProntos }: Props) {
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [itens, setItens] = useState<Transacao[]>([])

  useEffect(() => {
    if (!fatia) return
    if (itensProntos) {
      setItens(
        itensProntos
          .filter((t) => t.tipo === "despesa" && (t.categoria?.nome ?? "Sem categoria") === fatia.nome)
          .sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))
      )
      setCarregando(false)
      setErro(null)
      return
    }
    let cancelado = false
    setCarregando(true)
    setErro(null)
    setItens([])

    fetch(`/api/painel/transacoes?mes=${mes}&ano=${ano}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => {
        if (cancelado) return
        const todas: Transacao[] = d.transacoes ?? []
        setItens(
          todas
            .filter((t) => t.tipo === "despesa" && (t.categoria?.nome ?? "Outros") === fatia.nome)
            .sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))
        )
      })
      .catch(() => { if (!cancelado) setErro("Não consegui carregar os lançamentos agora.") })
      .finally(() => { if (!cancelado) setCarregando(false) })

    return () => { cancelado = true }
  }, [fatia, mes, ano, itensProntos])

  // Esc fecha — é o que se espera de qualquer coisa que cobre a tela.
  useEffect(() => {
    if (!fatia) return
    const aoTeclar = (e: KeyboardEvent) => { if (e.key === "Escape") onFechar() }
    window.addEventListener("keydown", aoTeclar)
    return () => window.removeEventListener("keydown", aoTeclar)
  }, [fatia, onFechar])

  if (!fatia) return null

  const somaListada = itens.reduce((s, t) => s + Math.abs(t.valor), 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onFechar}
      role="dialog"
      aria-modal="true"
      aria-label={`Lançamentos de ${fatia.nome}`}
    >
      <div
        className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-fl-card p-5 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[15px] font-bold text-fl-ink">
              <span className="cor-dado size-3 shrink-0 rounded-full" style={{ background: fatia.cor }} />
              <span className="truncate">{fatia.nome}</span>
            </p>
            <p className="mt-0.5 text-[12.5px] text-fl-ink-3">
              {brl(fatia.total)} · {fatia.pct}% das saídas do mês
            </p>
          </div>
          <button
            onClick={onFechar}
            aria-label="Fechar"
            className="-mr-1 -mt-1 grid size-9 shrink-0 place-items-center rounded-full text-fl-ink-3 transition-colors hover:bg-fl-50 hover:text-fl-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        {carregando && <p className="mt-5 text-sm text-fl-ink-3">Carregando…</p>}
        {erro && <p className="mt-5 rounded-xl bg-fl-error/10 px-3 py-2 text-[13px] text-fl-error">{erro}</p>}

        {!carregando && !erro && itens.length === 0 && (
          <p className="mt-5 text-sm text-fl-ink-2">Nenhum lançamento nesta categoria neste mês.</p>
        )}

        {itens.length > 0 && (
          <>
            <ul className="mt-4 divide-y divide-fl-divider">
              {itens.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] text-fl-ink">{t.descricao}</span>
                    <span className="block text-[11.5px] text-fl-ink-3">{dataCurta(t.data)}</span>
                  </span>
                  <span className="shrink-0 text-[14px] font-semibold tabular-nums text-fl-ink">
                    {brl(Math.abs(t.valor))}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-3 flex justify-between border-t border-fl-divider pt-3 text-[13px]">
              <span className="text-fl-ink-2">
                {itens.length} {itens.length === 1 ? "lançamento" : "lançamentos"}
              </span>
              <span className="font-bold tabular-nums text-fl-ink">{brl(somaListada)}</span>
            </p>

            {/* Se a soma da lista não bate com a fatia, digo — em vez de deixar
                a pessoa conferir na mão e achar que um dos dois está mentindo. */}
            {Math.abs(somaListada - fatia.total) > 0.01 && (
              <p className="mt-1.5 text-[11.5px] leading-snug text-fl-ink-3">
                A soma da lista difere do total da fatia em {brl(Math.abs(somaListada - fatia.total))} —
                sinal de que algo mudou depois que o gráfico foi calculado. Recarrega a página para os dois
                baterem.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
