"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Lock } from "lucide-react"
import { CardFlow } from "@/components/trilha/CardFlow"
import { FimDaLicao, type ResultadoLicao } from "@/components/trilha/FimDaLicao"
import type { ModuloData } from "@/types/trilha"

/**
 * Player de UMA lição.
 *
 * Com o corredor (05/08/2026) o módulo virou 4 lições em sequência, e esta
 * página joga uma delas por vez: `?licao=N`, ou a próxima que a pessoa tem
 * para fazer quando o parâmetro não vem.
 *
 * Quem decide se pode abrir é o SERVIDOR — a rota devolve 403 com o motivo. A
 * tela só desenha a recusa; se a decisão morasse aqui, trocar o número na URL
 * bastaria para furar a fila.
 */

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
    resultado: ResultadoLicao | null
  } | null>(null)

  useEffect(() => {
    let vivo = true
    const url = `/api/trilha/${chave}${licaoPedida ? `?licao=${licaoPedida}` : ""}`
    fetch(url)
      .then(async (r) => {
        if (r.status === 403) {
          const d = await r.json().catch(() => ({}))
          return { trancado: d.motivo ?? "Esta lição ainda não abriu.", dados: null }
        }
        if (!r.ok) throw new Error("não encontrado")
        const d = (await r.json()) as Resposta
        return { trancado: null, dados: d?.modulo ? d : null }
      })
      .then(({ dados, trancado }) => {
        if (vivo) setEstado({ para: alvo, dados, trancado, resultado: null })
      })
      .catch(() => {
        if (vivo) setEstado({ para: alvo, dados: null, trancado: null, resultado: null })
      })
    return () => { vivo = false }
  }, [alvo, chave, licaoPedida])

  const atual = estado?.para === alvo ? estado : null
  const dados = atual ? atual.dados : undefined
  const trancado = atual?.trancado ?? null
  const resultado = atual?.resultado ?? null
  const setResultado = useCallback(
    (r: ResultadoLicao) => setEstado((e) => (e ? { ...e, resultado: r } : e)),
    []
  )

  // ---------- trancado ----------
  if (trancado) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 px-8 text-center" style={{ background: "#112F30" }}>
        <div className="grid size-14 place-items-center rounded-full" style={{ background: "#1B3B3C" }}>
          <Lock className="size-6" style={{ color: "#A7ADAF" }} />
        </div>
        <p className="max-w-xs text-[15px] leading-relaxed text-white">{trancado}</p>
        <Link
          href="/trilha"
          className="rounded-full px-6 py-3 text-sm font-bold"
          style={{ background: "#5FA7A9", color: "#112F30" }}
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
            setResultado({
              nome: d.nome ?? licao.nome,
              acertos: d.acertos ?? 0,
              quizzes: d.quizzes ?? 0,
              segundos: d.segundos ?? segundos,
              pontos: d.pontos ?? null,
              moduloConcluido: !!d.moduloConcluido,
              pontosModulo: d.pontosModulo ?? null,
              licoesConcluidas: d.licoesConcluidas ?? 0,
              licoesTotal: d.licoesTotal ?? licao.total,
              conceito: d.moduloConcluido ? conceitoDoFecho() : null,
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
