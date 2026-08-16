"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Lock } from "lucide-react"
import { CardFlow } from "@/components/trilha/CardFlow"
import { FimDaLicao, type ResultadoLicao } from "@/components/trilha/FimDaLicao"
import { POSE } from "@/lib/fin"
import type { ModuloData } from "@/types/trilha"

/**
 * Player do módulo, em SEQUÊNCIA ÚNICA (pedido da fundadora, 16/08/2026).
 *
 * Com o corredor (05/08/2026) o módulo virou 4 lições; a página joga uma por
 * vez (`?licao=N`), mas desde 16/08 as lições EMENDAM: concluir uma navega
 * direto pra próxima, sem a tela de concluído no meio. A tela de fim aparece
 * UMA vez, no fechamento do módulo, com os números da sentada inteira
 * somados. O servidor continua cobrando e creditando POR LIÇÃO — energia,
 * XP, combo e revanche não mudaram de mecânica, só a costura visual.
 *
 * O acumulado da sentada vive em sessionStorage (a navegação entre lições
 * remonta o componente): expira em 2h pra sentada abandonada não somar com a
 * próxima, e é limpo quando a tela de fim aparece.
 *
 * Quem decide se pode abrir é o SERVIDOR — a rota devolve 403 com o motivo. A
 * tela só desenha a recusa; se a decisão morasse aqui, trocar o número na URL
 * bastaria para furar a fila.
 */

interface Corrida {
  quando: number
  acertos: number
  quizzes: number
  segundos: number
  xpLicoes: number
  algumCredito: boolean
  comboMax: number
  comboBonus: number
  energiaDevolvida: number
  pocaoAplicada: boolean
}

const chaveCorrida = (moduloId: string) => `fin-corrida:${moduloId}`

function lerCorrida(moduloId: string): Corrida | null {
  try {
    const c = JSON.parse(sessionStorage.getItem(chaveCorrida(moduloId)) ?? "null") as Corrida | null
    // Sentada abandonada não soma com a de amanhã.
    if (c && Date.now() - c.quando < 2 * 60 * 60 * 1000) return c
  } catch {}
  return null
}

function somarCorrida(moduloId: string, parcial: Omit<Corrida, "quando">) {
  const antes = lerCorrida(moduloId)
  const soma: Corrida = {
    quando: Date.now(),
    acertos: (antes?.acertos ?? 0) + parcial.acertos,
    quizzes: (antes?.quizzes ?? 0) + parcial.quizzes,
    segundos: (antes?.segundos ?? 0) + parcial.segundos,
    xpLicoes: (antes?.xpLicoes ?? 0) + parcial.xpLicoes,
    algumCredito: (antes?.algumCredito ?? false) || parcial.algumCredito,
    comboMax: Math.max(antes?.comboMax ?? 0, parcial.comboMax),
    comboBonus: (antes?.comboBonus ?? 0) + parcial.comboBonus,
    energiaDevolvida: (antes?.energiaDevolvida ?? 0) + parcial.energiaDevolvida,
    pocaoAplicada: (antes?.pocaoAplicada ?? false) || parcial.pocaoAplicada,
  }
  try {
    sessionStorage.setItem(chaveCorrida(moduloId), JSON.stringify(soma))
  } catch {}
}

function limparCorrida(moduloId: string) {
  try {
    sessionStorage.removeItem(chaveCorrida(moduloId))
  } catch {}
}

/**
 * Comprar a recarga direto de onde ela faz falta (pedido da fundadora,
 * 16/08). Sucesso recarrega a página: o GET cobra a lição de novo, agora
 * com energia — é o fluxo normal, não um caso especial.
 */
function BotaoRecarga() {
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function comprar() {
    setOcupado(true)
    setErro(null)
    try {
      const r = await fetch("/api/jogo/energia", { method: "POST" })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.ok) {
        setErro(d.erro ?? "Não deu certo. Tenta de novo?")
        setOcupado(false)
        return
      }
      window.location.reload()
    } catch {
      setErro("Sem conexão. Tenta de novo?")
      setOcupado(false)
    }
  }

  return (
    <div className="w-full max-w-xs">
      <button
        onClick={comprar}
        disabled={ocupado}
        className="fin-btn-3d w-full rounded-2xl py-3.5 text-sm font-extrabold disabled:opacity-60"
        style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
      >
        {ocupado ? "Recarregando…" : "Recarga cheia · 10 moedas"}
      </button>
      {erro && <p className="mt-2 text-xs" style={{ color: "var(--fin-erro)" }}>{erro}</p>}
    </div>
  )
}

interface LicaoDoModulo {
  numero: number
  nome: string
  resumo: string
  concluida: boolean
  liberada: boolean
}

interface Resposta {
  modulo: ModuloData
  licao: { numero: number; nome: string; resumo: string; total: number }
  indice: number
  licoesDoModulo?: LicaoDoModulo[]
  indicadores: Record<string, number>
  telaInicial: number
  /** null = isento (premium ou escola); a UI não mostra custo nenhum. */
  energia?: { atual: number; max: number } | null
  /** O combo herdado das lições anteriores — semente do chip do CardFlow. */
  comboAtual?: number
}

/** O 403 de energia vem com estes campos — é recusa DIFERENTE de "trancado". */
interface SemEnergia {
  energia: number
  max: number
  minutos: number
}

export default function ModuloPage() {
  const params = useParams()
  const router = useRouter()
  const busca = useSearchParams()
  const chave = params.moduloId as string
  const licaoPedida = busca.get("licao")

  /**
   * O estado guarda PARA QUAL lição ele é.
   *
   * Duas coisas de graça com isso. A tela não precisa limpar nada de forma
   * síncrona ao trocar de lição — "carregando" passa a ser simplesmente
   * "ainda não tenho resposta para o alvo atual" —, e resposta atrasada de uma
   * lição anterior não pinta por cima da atual: ela chega com outro `para` e é
   * ignorada. Trocar de lição é rápido (mesmo módulo, mesma aba), então a
   * corrida é real, não teórica.
   */
  const alvo = `${chave}|${licaoPedida ?? ""}`
  const [estado, setEstado] = useState<{
    para: string
    dados: Resposta | null
    trancado: string | null
    semEnergia: SemEnergia | null
    resultado: ResultadoLicao | null
  } | null>(null)

  useEffect(() => {
    let vivo = true
    const url = `/api/trilha/${chave}${licaoPedida ? `?licao=${licaoPedida}` : ""}`
    fetch(url)
      .then(async (r) => {
        if (r.status === 403) {
          const d = await r.json().catch(() => ({}))
          if (d.error === "energia") {
            return {
              trancado: null,
              semEnergia: { energia: d.energia ?? 0, max: d.max ?? 24, minutos: d.minutos ?? 60 },
              dados: null,
            }
          }
          return { trancado: d.motivo ?? "Esta lição ainda não abriu.", semEnergia: null, dados: null }
        }
        if (!r.ok) throw new Error("não encontrado")
        const d = (await r.json()) as Resposta
        return { trancado: null, semEnergia: null, dados: d?.modulo ? d : null }
      })
      .then(({ dados, trancado, semEnergia }) => {
        if (vivo) setEstado({ para: alvo, dados, trancado, semEnergia, resultado: null })
      })
      .catch(() => {
        if (vivo) setEstado({ para: alvo, dados: null, trancado: null, semEnergia: null, resultado: null })
      })
    return () => { vivo = false }
  }, [alvo, chave, licaoPedida])

  const atual = estado?.para === alvo ? estado : null
  const dados = atual ? atual.dados : undefined
  const trancado = atual?.trancado ?? null
  const semEnergia = atual?.semEnergia ?? null
  const resultado = atual?.resultado ?? null
  const setResultado = useCallback(
    (r: ResultadoLicao) => setEstado((e) => (e ? { ...e, resultado: r } : e)),
    []
  )

  // ---------- sem energia ----------
  if (semEnergia) {
    return (
      <div className="tema-fin flex h-dvh flex-col items-center justify-center gap-4 px-8 text-center" style={{ background: "var(--fin-bg)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={POSE.worry} alt="" className="fin-pop h-[110px] object-contain" />
        <h1 className="text-[21px] font-black text-white">Sua energia acabou</h1>
        <p className="max-w-xs text-sm leading-relaxed" style={{ color: "var(--fin-muted)" }}>
          Ela volta sozinha: <strong style={{ color: "var(--fin-energia)" }}>+1 a cada hora</strong>.
          Próxima recarga em <strong className="text-white">{semEnergia.minutos} min</strong>.
        </p>
        <BotaoRecarga />
        <Link
          href="/premium"
          className="flex w-full max-w-xs items-center gap-3 rounded-2xl px-4 py-3 text-left"
          style={{ background: "var(--fin-surface)" }}
        >
          <span
            className="grid size-9 shrink-0 place-items-center rounded-xl text-[15px] font-black"
            style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
          >
            ∞
          </span>
          <span>
            <span className="block text-[13.5px] font-black text-white">Finlow+ tem energia infinita</span>
            <span className="block text-[11.5px]" style={{ color: "var(--fin-dim)" }}>
              Se fizer sentido pra você, sem pressa.
            </span>
          </span>
        </Link>
        <Link
          href="/trilha"
          className="rounded-2xl px-6 py-3.5 text-sm font-extrabold"
          style={{ background: "var(--fin-border)", color: "var(--fin-text)" }}
        >
          Volto mais tarde
        </Link>
      </div>
    )
  }

  // ---------- trancado ----------
  if (trancado) {
    return (
      <div className="tema-fin flex h-dvh flex-col items-center justify-center gap-4 px-8 text-center" style={{ background: "var(--fin-bg)" }}>
        <div className="grid size-14 place-items-center rounded-full" style={{ background: "var(--fin-surface)" }}>
          <Lock className="size-6" style={{ color: "var(--fin-muted)" }} />
        </div>
        <p className="max-w-xs text-[15px] leading-relaxed text-white">{trancado}</p>
        <Link
          href="/trilha"
          className="fin-btn-3d rounded-2xl px-6 py-3 text-sm font-extrabold"
          style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
        >
          Ver minha trilha
        </Link>
      </div>
    )
  }

  if (dados === undefined) {
    return (
      <div className="flex h-dvh items-center justify-center bg-fl-page">
        <div className="size-6 animate-spin rounded-full border-2 border-fl-500 border-t-transparent" />
      </div>
    )
  }

  if (dados === null) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-fl-page px-6 text-center">
        <p className="text-fl-ink-2">Módulo não encontrado.</p>
        <button
          onClick={() => router.push("/trilha")}
          className="rounded-full bg-fl-500 px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Voltar à trilha
        </button>
      </div>
    )
  }

  // ---------- fim da lição ----------
  if (resultado) {
    // A próxima é a primeira ainda não concluída depois desta.
    const proxima = (dados.licoesDoModulo ?? []).find(
      (l) => l.numero > dados.licao.numero && !l.concluida
    )
    return (
      <FimDaLicao
        r={resultado}
        temProxima={!!proxima && !resultado.moduloConcluido}
        onProxima={() => {
          if (proxima) router.push(`/trilha/${chave}?licao=${proxima.numero}`)
        }}
      />
    )
  }

  const { modulo, licao, indice } = dados
  // Prefixo `ind_` para não colidir com id de campo de formulário.
  const sessaoInicial = Object.fromEntries(
    Object.entries(dados.indicadores ?? {}).map(([k, v]) => [`ind_${k}`, String(v)])
  )

  /** O fecho do módulo, quando existe: vira "o que ficou" na tela de fim. */
  function conceitoDoFecho(): string | null {
    const ultima = modulo.telas[modulo.telas.length - 1]
    if (!ultima || ultima.tipo !== "conceito") return null
    const c = ultima.conteudo as { insight?: { texto?: string }; corpo?: string }
    const texto = c.insight?.texto ?? c.corpo ?? ""
    return texto.replace(/<[^>]+>/g, "").trim() || null
  }

  return (
    <CardFlow
      modulo={modulo}
      licao={{ numero: licao.numero, nome: licao.nome, indice, total: licao.total }}
      telaInicial={dados.telaInicial}
      comboInicial={dados.comboAtual ?? 0}
      sessaoInicial={sessaoInicial}
      onAvancarTela={(tela) => {
        fetch("/api/progresso", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduloId: modulo.id, licao: licao.numero, telaAtual: tela }),
        }).catch(() => {})
      }}
      onConcluir={(respostas, segundos) => {
        // As respostas vão para o servidor CONFERIR contra o gabarito do
        // banco — o cliente manda escolhas, nunca acertos. A nota volta de lá
        // e é ela que a tela de fim mostra.
        fetch("/api/progresso", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduloId: modulo.id, licao: licao.numero, respostas, segundos }),
        })
          .then((r) => r.json())
          .then((d) => {
            const proxima = (dados.licoesDoModulo ?? []).find(
              (l) => l.numero > licao.numero && !l.concluida
            )

            // As lições EMENDAM: com módulo aberto e próxima na fila, soma a
            // parcial e navega direto — sem tela de concluído no meio.
            if (!d.moduloConcluido && proxima) {
              somarCorrida(modulo.id, {
                acertos: d.acertos ?? 0,
                quizzes: d.quizzes ?? 0,
                segundos: d.segundos ?? segundos,
                xpLicoes: d.pontos?.pontos ?? 0,
                algumCredito: !!d.pontos?.creditado,
                comboMax: d.comboMax ?? 0,
                comboBonus: d.comboBonus ?? 0,
                energiaDevolvida: d.energiaDevolvida ?? 0,
                pocaoAplicada: !!d.pocaoAplicada,
              })
              router.push(`/trilha/${chave}?licao=${proxima.numero}`)
              return
            }

            // Fim da sentada: a tela de fim mostra o TOTAL do que foi jogado
            // agora — as parciais acumuladas mais esta última lição.
            const antes = lerCorrida(modulo.id)
            limparCorrida(modulo.id)
            const acertos = (antes?.acertos ?? 0) + (d.acertos ?? 0)
            const quizzes = (antes?.quizzes ?? 0) + (d.quizzes ?? 0)
            setResultado({
              nome: d.nome ?? licao.nome,
              acertos,
              quizzes,
              segundos: (antes?.segundos ?? 0) + (d.segundos ?? segundos),
              pontos: {
                creditado: (antes?.algumCredito ?? false) || !!d.pontos?.creditado,
                pontos: (antes?.xpLicoes ?? 0) + (d.pontos?.pontos ?? 0),
              },
              moduloConcluido: !!d.moduloConcluido,
              pontosModulo: d.pontosModulo ?? null,
              licoesConcluidas: d.licoesConcluidas ?? 0,
              licoesTotal: d.licoesTotal ?? licao.total,
              conceito: d.moduloConcluido ? conceitoDoFecho() : null,
              // --- a camada de jogo (Redesign Fin) ---
              comboMax: Math.max(antes?.comboMax ?? 0, d.comboMax ?? 0),
              comboBonus: (antes?.comboBonus ?? 0) + (d.comboBonus ?? 0),
              coins: d.coins ?? null,
              energiaDevolvida:
                (antes?.energiaDevolvida ?? 0) + (d.energiaDevolvida ?? 0) || null,
              pocaoAplicada: (antes?.pocaoAplicada ?? false) || !!d.pocaoAplicada,
              precisao: quizzes > 0 ? Math.round((acertos / quizzes) * 100) : null,
              sequencia: d.sequencia ?? 0,
              bauDisponivel: d.bauDisponivel ?? null,
            })
          })
          .catch(() => {
            // Sem resposta do servidor não dá para mostrar nota nenhuma —
            // inventar "+5 XP" aqui seria mentir sobre o que foi creditado.
            router.push("/trilha")
          })
      }}
    />
  )
}
