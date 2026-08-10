"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Loader2, TriangleAlert } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

/**
 * Premium: a mesma página vende e administra.
 *
 * DUAS TELAS SERIAM DUAS VERDADES. Quem paga precisa ver quando renova e como
 * sair; quem não paga precisa ver o que ganha e quanto custa. Separar em rotas
 * diferentes obrigaria alguém a decidir para onde mandar cada pessoa, e essa
 * decisão é a regra de acesso — que mora em `lib/pagamento/acesso.ts` e é
 * respondida por `/api/pagamento/assinatura`. Aqui só se desenha a resposta.
 *
 * SEM TELA DE RETENÇÃO COM DESCONTO no caminho de cancelar (decisão da
 * fundadora). Quem clicou quer cancelar.
 */

interface Estado {
  premium: boolean
  status: string | null
  saindoNoFimDoPeriodo: boolean
  emAtraso: boolean
  valorCentavos: number | null
  proximaCobranca: string | null
  expiraEm: string | null
  cota: { usados: number; teto: number | null; restam: number | null; podeUsar: boolean }
}

const VANTAGENS = [
  "Conversa sem limite com o assistente",
  "Extrato do banco lido quantas vezes precisar",
  "Diagnóstico de vazamentos sempre atualizado",
  "Trilha completa, sem espera entre as lições",
]

function reais(centavos: number | null): string {
  if (centavos == null) return "—"
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function dia(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
}

export default function PremiumPage() {
  const [estado, setEstado] = useState<Estado | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [confirmandoSaida, setConfirmandoSaida] = useState(false)

  const buscar = useCallback(async () => {
    try {
      const r = await fetch("/api/pagamento/assinatura")
      if (!r.ok) throw new Error("falhou")
      setEstado(await r.json())
      setErro(null)
    } catch {
      setErro("Não consegui carregar o estado da sua assinatura.")
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    void buscar()
  }, [buscar])

  async function assinar() {
    setOcupado(true)
    setErro(null)
    try {
      const r = await fetch("/api/pagamento/checkout", { method: "POST" })
      const j = await r.json()
      // A rota devolve 409 para quem já é premium. Recarregar em vez de mostrar
      // erro: o estado da tela é que estava velho, não há nada errado com ela.
      if (r.status === 409) {
        await buscar()
        return
      }
      if (!r.ok || !j.url) throw new Error(j.mensagem ?? "falhou")
      window.location.href = j.url
    } catch (e) {
      setErro((e as Error).message || "Não consegui abrir o pagamento.")
      setOcupado(false)
    }
  }

  async function cancelar() {
    setOcupado(true)
    setErro(null)
    try {
      const r = await fetch("/api/pagamento/cancelar", { method: "POST" })
      const j = await r.json()
      if (!r.ok) throw new Error(j.mensagem ?? "falhou")
      setConfirmandoSaida(false)
      await buscar()
    } catch (e) {
      setErro((e as Error).message || "Não consegui cancelar.")
    } finally {
      setOcupado(false)
    }
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-fl-page pb-24">
        <div className="mx-auto flex max-w-lg items-center justify-center px-5 py-20 text-fl-ink/60">
          <Loader2 className="size-5 animate-spin" />
        </div>
        <BottomNav />
      </main>
    )
  }

  const premium = estado?.premium ?? false

  return (
    <main className="min-h-screen bg-fl-page pb-24">
      <div className="mx-auto max-w-lg px-5 py-8">
        <h1 className="text-2xl font-semibold text-fl-ink">
          {premium ? "Sua assinatura" : "Finlow Premium"}
        </h1>

        {/* O atraso vem ANTES de tudo: a pessoa tem acesso, mas por tempo
            limitado, e precisa saber disso enquanto ainda dá para resolver. */}
        {estado?.emAtraso && (
          <div className="mt-5 rounded-2xl border border-fl-accent/40 bg-fl-accent/10 p-4">
            <p className="flex items-start gap-2 text-sm text-fl-ink">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-fl-accent" />
              <span>
                A última cobrança não passou. Seu acesso continua até{" "}
                <strong>{dia(estado.expiraEm)}</strong> enquanto tentamos de novo. Atualize o
                cartão para não perder nada.
              </span>
            </p>
          </div>
        )}

        {premium ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-fl-sand bg-fl-card p-5">
              <p className="text-sm text-fl-ink/70">Valor</p>
              <p className="text-xl font-semibold text-fl-ink">{reais(estado?.valorCentavos ?? null)} por mês</p>

              {estado?.saindoNoFimDoPeriodo ? (
                // Cancelamento pedido: o acesso continua, e dizer isso é o
                // ponto. "Cancelada" sem data faria a pessoa achar que perdeu
                // o mês que já pagou.
                <p className="mt-4 text-sm text-fl-ink/70">
                  Você cancelou. O acesso vai até <strong>{dia(estado.expiraEm)}</strong> e
                  não haverá nova cobrança.
                </p>
              ) : (
                <p className="mt-4 text-sm text-fl-ink/70">
                  Próxima cobrança em <strong>{dia(estado?.proximaCobranca ?? null)}</strong>.
                </p>
              )}
            </div>

            {!estado?.saindoNoFimDoPeriodo && (
              <div className="rounded-2xl border border-fl-sand bg-fl-card p-5">
                {confirmandoSaida ? (
                  <>
                    <p className="text-sm text-fl-ink">
                      Você mantém o acesso até o fim do período já pago. Depois disso, nada é
                      cobrado.
                    </p>
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={cancelar}
                        disabled={ocupado}
                        className="rounded-xl bg-fl-ink px-4 py-2.5 text-sm font-medium text-fl-page disabled:opacity-50"
                      >
                        {ocupado ? "Cancelando…" : "Confirmar cancelamento"}
                      </button>
                      <button
                        onClick={() => setConfirmandoSaida(false)}
                        disabled={ocupado}
                        className="rounded-xl px-4 py-2.5 text-sm font-medium text-fl-ink/70"
                      >
                        Voltar
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmandoSaida(true)}
                    className="text-sm font-medium text-fl-ink/60 underline decoration-fl-ink/20 underline-offset-4"
                  >
                    Cancelar assinatura
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {/* Quanto da cota grátis já foi. Número concreto em vez de "você
                atingiu o limite": a pessoa consegue calibrar se assinar resolve
                o problema dela. */}
            {estado?.cota.teto != null && (
              <div className="rounded-2xl border border-fl-sand bg-fl-card p-5">
                <p className="text-sm text-fl-ink/70">
                  {estado.cota.podeUsar
                    ? "Você ainda tem conversas gratuitas neste mês."
                    : "Suas conversas gratuitas deste mês acabaram. A cota renova no dia 1º."}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-fl-sand">
                  <div
                    className="h-full rounded-full bg-fl-500"
                    style={{
                      width: `${Math.min(100, Math.round((estado.cota.usados / estado.cota.teto) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-fl-sand bg-fl-card p-5">
              <ul className="space-y-3">
                {VANTAGENS.map((v) => (
                  <li key={v} className="flex items-start gap-2.5 text-sm text-fl-ink">
                    <Check className="mt-0.5 size-4 shrink-0 text-fl-500" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={assinar}
              disabled={ocupado}
              className="w-full rounded-xl bg-fl-500 px-5 py-3.5 text-base font-medium text-white disabled:opacity-50"
            >
              {ocupado ? "Abrindo pagamento…" : "Assinar"}
            </button>
            <p className="text-center text-xs text-fl-ink/50">
              Cobrança mensal pelo cartão. Cancele quando quiser, sem multa.
            </p>
          </div>
        )}

        {erro && <p className="mt-5 text-sm text-fl-accent">{erro}</p>}
      </div>
      <BottomNav />
    </main>
  )
}
