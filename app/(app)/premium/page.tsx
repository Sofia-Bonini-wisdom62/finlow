"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Loader2, TriangleAlert } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { POSE } from "@/lib/fin"
import { dinheiro, porIntervalo } from "@/lib/formato"
import { perguntasNoTeto, perguntasRestantes, rotuloPerguntas } from "@/lib/pagamento/perguntas"

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
  /** "assinatura" | "escola" | null — de onde vem o premium. Decidido em
   *  lib/pagamento/acesso.ts; a tela só obedece. */
  origem: string | null
  escolaNome: string | null
  saindoNoFimDoPeriodo: boolean
  emAtraso: boolean
  /** O que a Stripe JÁ cobrou de quem assina. Não existe para quem não assina. */
  valorCentavos: number | null
  proximaCobranca: string | null
  expiraEm: string | null
  cota: { usados: number; teto: number | null; restam: number | null; podeUsar: boolean }
  /** O preço de tabela, para quem ainda vai decidir. Vem do mesmo id de preço
   *  que o checkout cobra (`lib/pagamento/preco.ts`). `null` quando a Stripe não
   *  respondeu ou não está configurada — a tela tem estado próprio para isso. */
  plano: {
    valorCentavos: number
    moeda: string
    intervalo: string
    intervaloContagem: number
  } | null
}

// A lista do protótipo v2 — "energia infinita" entrou quando virou verdade
// (isentoDeEnergia em lib/energia.ts): vender o que não existe seria pior
// que não vender.
const VANTAGENS = [
  "Conversa sem limite com o Fin",
  "Energia infinita na trilha",
  "Extrato do banco lido quantas vezes precisar",
  "Diagnóstico de vazamentos sempre atualizado",
]

function dia(iso: string | null): string {
  if (!iso) return "-"
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
}

const milhar = (n: number) => n.toLocaleString("pt-BR")

/**
 * O consumo do mês, para os DOIS estados.
 *
 * Antes este bloco só existia para quem não paga, e o efeito era esquisito: a
 * pessoa via o próprio consumo enquanto estava no limite e deixava de ver no
 * instante em que passou a pagar por ele. Quem assina é justamente quem tem
 * motivo para acompanhar.
 *
 * MOSTRA O NÚMERO, não só a barra. "Você atingiu o limite" não deixa ninguém
 * calibrar nada; "94.300 de 120.000" deixa. E o rótulo evita "tokens" no lugar
 * de destaque — é jargão, e a regra do produto é não usar jargão sem explicação
 * na mesma frase. O termo aparece na nota de rodapé, onde é explicado.
 *
 * O NÚMERO GRANDE VIROU PERGUNTA (item 9c da avaliação de UX). "94.300 de
 * 120.000" calibra a régua de quem já entende a régua: quem lê quer saber se dá
 * para conversar amanhã, e token não responde isso. O destaque passou a ser a
 * estimativa em perguntas (`lib/pagamento/perguntas.ts`), e a conta em token
 * continua logo abaixo, inteira — ela não some, ela deixa de ser a manchete.
 *
 * "Cerca de" não é modéstia: o custo real de um turno varia, e um extrato
 * inteiro pesa muito mais que uma pergunta. A estimativa usa a ponta alta da
 * faixa para errar para menos.
 */
function UsoDoMes({ cota, premium }: { cota: Estado["cota"]; premium: boolean }) {
  const ilimitado = cota.teto == null
  const pct = ilimitado ? 0 : Math.min(100, Math.round((cota.usados / cota.teto!) * 100))
  const restamPerguntas = perguntasRestantes(cota.restam, cota.podeUsar)
  const totalPerguntas = perguntasNoTeto(cota.teto)

  return (
    <div className="rounded-2xl border border-fl-sand bg-fl-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-fl-ink/70">Uso do assistente neste mês</p>
        {!ilimitado && <p className="text-sm tabular-nums text-fl-ink/50">{pct}%</p>}
      </div>

      {ilimitado ? (
        <>
          <p className="mt-1 text-xl font-semibold tabular-nums text-fl-ink">
            {milhar(cota.usados)}
          </p>
          <p className="mt-2 text-sm text-fl-ink/70">
            Sua assinatura não tem limite. O número acima é só para você acompanhar.
          </p>
        </>
      ) : (
        <>
          <p className="mt-1 text-xl font-semibold text-fl-ink">
            {cota.podeUsar ? (
              <>
                Dá para mais umas{" "}
                <span className="tabular-nums">{rotuloPerguntas(restamPerguntas ?? 0)}</span>
                {totalPerguntas != null && (
                  <span className="text-fl-ink/50"> de cerca de {totalPerguntas}</span>
                )}
              </>
            ) : (
              <>Sua cota deste mês acabou</>
            )}
          </p>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-fl-sand">
            <div
              className={`h-full rounded-full ${cota.podeUsar ? "bg-fl-500" : "bg-fl-accent"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-fl-ink/70">
            {cota.podeUsar ? (
              <>
                É estimativa: já foram <strong className="tabular-nums">{milhar(cota.usados)}</strong>{" "}
                dos <strong className="tabular-nums">{milhar(cota.teto!)}</strong> tokens do mês, e a
                cota renova no dia 1º.
              </>
            ) : (
              <>Ela renova no dia 1º.</>
            )}
          </p>
        </>
      )}

      {/* O jargão explicado, e só aqui. */}
      <p className="mt-3 text-xs text-fl-ink/50">
        A conta é em <em>tokens</em>, pedaços de palavra que o assistente lê e escreve. Uma
        conversa curta gasta pouco; mandar um extrato inteiro gasta bem mais, por isso a
        estimativa de perguntas é aproximada.
        {premium && " Cobramos por assinatura, não por uso."}
      </p>
    </div>
  )
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
  // Premium PELA ESCOLA não tem assinatura para gerir nem checkout para
  // oferecer — mostrar "Valor: — por mês" e um botão de cancelar sem
  // assinatura na Stripe seria mentira duas vezes.
  const pelaEscola = premium && estado?.origem === "escola"

  return (
    <main className="min-h-screen bg-fl-page pb-24">
      <div className="mx-auto max-w-lg px-5 py-8">
        <h1 className="text-2xl font-black tracking-tight text-fl-ink">
          {pelaEscola ? "Seu acesso" : premium ? "Sua assinatura" : "Finlow+"}
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

        {pelaEscola ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-fl-sand bg-fl-card p-5">
              <p className="text-sm text-fl-ink/70">Finlow para Escolas</p>
              <p className="text-xl font-semibold text-fl-ink">
                Seu acesso vem da {estado?.escolaNome ?? "sua escola"}
              </p>
              <p className="mt-4 text-sm text-fl-ink/70">
                Enquanto sua escola estiver com o Finlow, você usa o app completo, sem
                cobrança no seu cartão e sem nada para cancelar aqui.
              </p>
            </div>

            {estado && <UsoDoMes cota={estado.cota} premium />}
          </div>
        ) : premium ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-fl-sand bg-fl-card p-5">
              <p className="text-sm text-fl-ink/70">Valor</p>
              <p className="text-xl font-semibold text-fl-ink">
                {dinheiro(estado?.valorCentavos ?? null)} por mês
              </p>

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

            {estado && <UsoDoMes cota={estado.cota} premium />}

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
            {/* O Fin animado abre a venda (protótipo v2). */}
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={POSE.streak} alt="" className="inline-block h-[92px] object-contain" />
            </div>

            {/* Quanto da cota grátis já foi. Número concreto em vez de "você
                atingiu o limite": a pessoa consegue calibrar se assinar resolve
                o problema dela. */}
            {estado && <UsoDoMes cota={estado.cota} premium={false} />}

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

            {/* O PREÇO, ANTES DO BOTÃO.
                Esta tela passou a existir com o valor visível só para quem já
                pagava: quem não paga via as vantagens, um "Assinar" e a letra
                miúda "cobrança mensal pelo cartão", sem número nenhum. O preço
                aparecia na tela da Stripe, depois do clique — e pedir para
                alguém clicar em assinar para descobrir quanto custa é o desenho
                de um dark pattern, mesmo sem a intenção de ser um.

                O valor e a periodicidade vêm do MESMO id de preço que o checkout
                cobra. Ver `lib/pagamento/preco.ts`: é o que impede a tela de
                anunciar um número e a fatura trazer outro. */}
            <div className="rounded-2xl border border-fl-sand bg-fl-card p-5">
              {estado?.plano ? (
                <>
                  {/* Não repete "Finlow Premium", que já é o h1 da tela: o
                      rótulo aqui é a pergunta que a pessoa veio fazer. */}
                  <p className="text-sm text-fl-ink/70">Quanto custa</p>
                  <p className="mt-1 text-3xl font-semibold tabular-nums text-fl-ink">
                    {dinheiro(estado.plano.valorCentavos, estado.plano.moeda)}
                    <span className="text-base font-normal text-fl-ink/60">
                      {" "}
                      {porIntervalo(estado.plano.intervalo, estado.plano.intervaloContagem)}
                    </span>
                  </p>
                  <p className="mt-3 text-sm text-fl-ink/70">
                    Sem fidelidade e sem multa: você cancela quando quiser e mantém o acesso
                    até o fim do período já pago.
                  </p>
                </>
              ) : (
                // Sem preço, o defeito voltaria inteiro — então a tela diz que
                // não sabe, em vez de deixar o botão sozinho como antes. Não
                // desabilita o botão: o checkout da Stripe mostra o valor antes
                // de qualquer cobrança, e travar a compra por uma falha de
                // leitura seria pior do que ela.
                <>
                  <p className="text-sm font-medium text-fl-ink">
                    Não consegui carregar o valor agora.
                  </p>
                  <p className="mt-2 text-sm text-fl-ink/70">
                    O preço aparece na tela de pagamento, antes de qualquer cobrança. Nada é
                    cobrado sem você confirmar lá.
                  </p>
                  <button
                    onClick={() => void buscar()}
                    className="mt-3 text-sm font-medium text-fl-500 underline underline-offset-4"
                  >
                    Tentar de novo
                  </button>
                </>
              )}
            </div>

            <button
              onClick={assinar}
              disabled={ocupado}
              className="fin-btn-3d w-full rounded-2xl bg-fl-500 px-5 py-3.5 text-base font-extrabold text-primary-foreground disabled:opacity-50 disabled:shadow-none"
            >
              {ocupado ? "Abrindo pagamento…" : "Assinar"}
            </button>
            <p className="text-center text-xs text-fl-ink/50">
              {estado?.plano
                ? `${dinheiro(estado.plano.valorCentavos, estado.plano.moeda)} ${porIntervalo(
                    estado.plano.intervalo,
                    estado.plano.intervaloContagem
                  )}, no cartão. Cancele quando quiser, sem multa.`
                : "Cobrança recorrente pelo cartão. Cancele quando quiser, sem multa."}
            </p>
          </div>
        )}

        {erro && <p className="mt-5 text-sm text-fl-accent">{erro}</p>}
      </div>
      <BottomNav />
    </main>
  )
}
