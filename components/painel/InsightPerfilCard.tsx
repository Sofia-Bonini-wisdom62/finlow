"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { TransacaoData } from "@/types/painel"
import type { TipoPerfil } from "@/types/trilha"
import { agruparPorCategoria } from "./DistribuicaoGastosChart"

interface ModuloRef {
  id: string
  titulo: string
  ordem: number
  tipoPerfil: TipoPerfil
}

// Qual módulo da trilha conversa com a maior categoria de gasto do mês.
// A frase cita o módulo REAL do usuário (título vindo do banco) com link direto.
function escolherModulo(
  perfil: TipoPerfil,
  topCategoria: string,
  modulos: ModuloRef[]
): { modulo: ModuloRef; frase: string } | null {
  const porOrdem = (n: number) => modulos.find((m) => m.ordem === n)
  const cat = topCategoria.toLowerCase()

  let alvo: ModuloRef | undefined
  let frase = ""

  switch (perfil) {
    case "lancador":
      if (cat.includes("delivery") || cat.includes("streaming")) {
        alvo = porOrdem(1)
        frase = `"${topCategoria}" foi sua maior fatia do mês. O retrato clássico do gasto pequeno que soma sem você ver.`
      } else {
        alvo = porOrdem(4)
        frase = `Sua maior fatia foi "${topCategoria}". Antes da próxima compra grande, lembra da regra das 24 horas.`
      }
      break
    case "guardador":
      if (cat.includes("investimento") || cat.includes("reserva")) {
        alvo = porOrdem(4)
        frase = `Quase tudo foi pra "${topCategoria}". Guardar você domina. E o gasto bom com data marcada, já agendou?`
      } else {
        alvo = porOrdem(2)
        frase = `"${topCategoria}" liderou o mês. Se coube no seu valor livre, foi plano, não deslize.`
      }
      break
    case "impulsivo":
      if (cat.includes("impulso")) {
        alvo = porOrdem(2)
        frase = `"${topCategoria}" foi sua maior fatia. Teu gatilho apareceu esse mês. A pausa de 24h pega exatamente isso.`
      } else {
        alvo = porOrdem(4)
        frase = `Maior fatia: "${topCategoria}". Desejo que sobrevive à espera vira compra sem culpa, a lista tá rodando?`
      }
      break
    case "sonhador":
      if (cat.includes("sonho")) {
        alvo = porOrdem(4)
        frase = `"${topCategoria}" no topo do mês. O sonho tá recebendo. O check semanal mantém isso vivo.`
      } else {
        alvo = porOrdem(2)
        frase = `"${topCategoria}" liderou, e quanto foi pro seu sonho? O menor passo possível ainda vale.`
      }
      break
  }

  if (!alvo) return null
  return { modulo: alvo, frase }
}

export function InsightPerfilCard({ transacoes }: { transacoes: TransacaoData[] }) {
  const [perfil, setPerfil] = useState<TipoPerfil | null>(null)
  const [modulos, setModulos] = useState<ModuloRef[]>([])

  // O perfil vem do SERVIDOR junto com os módulos, não do localStorage.
  // Lido do navegador, ele sobrevivia ao logout: a próxima conta abria o
  // Painel com o insight da conta anterior.
  useEffect(() => {
    fetch("/api/trilha")
      .then((r) => (r.ok ? r.json() : { modulos: [] }))
      .then((d) => {
        const lista = (d.modulos ?? []) as ModuloRef[]
        if (!lista.length) return
        setPerfil(lista[0].tipoPerfil)
        setModulos(lista.map((m) => ({ id: m.id, titulo: m.titulo, ordem: m.ordem, tipoPerfil: m.tipoPerfil })))
      })
      .catch(() => {})
  }, [])

  const fatias = agruparPorCategoria(transacoes)
  if (!perfil || modulos.length === 0 || fatias.length === 0) return null

  const escolha = escolherModulo(perfil, fatias[0].nome, modulos)
  if (!escolha) return null

  return (
    <div className="rounded-2xl border border-fl-500/30 bg-fl-500/10 p-5">
      <span className="text-xs font-semibold uppercase tracking-wider text-fl-500">
        Seu perfil te avisou sobre isso
      </span>
      <p className="mt-2 text-sm leading-relaxed text-fl-ink-2">{escolha.frase}</p>
      <Link
        href={`/trilha/${escolha.modulo.id}`}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-fl-500"
      >
        Revisitar &quot;{escolha.modulo.titulo}&quot;
        <ArrowRight className="size-4" />
      </Link>
    </div>
  )
}
