"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Flag } from "lucide-react"
import type { NoTrilha as NoTrilhaTipo, Trilha } from "@/lib/trilha-visual"
import NoTrilha from "./NoTrilha"
import DivisorBloco from "./DivisorBloco"
import RamoTematico from "./RamoTematico"

interface CaminhoProps {
  trilha: Trilha
  intensidade: "sobria" | "expressiva"
  haloModuloId?: string | null
  carregando?: boolean
  onSelecionarNo: (no: NoTrilhaTipo) => void
}

type Ponto = { x: number; y: number }

interface EntradaNo {
  tipo: "no"
  no: NoTrilhaTipo
  xPct: number
  y: number
  size: number
  numero: number
  isRamo: boolean
}
interface EntradaDivisor {
  tipo: "divisor"
  id: string
  rotulo: string
  y: number
}
interface EtiquetaRamo {
  id: string
  nome: string
  corToken: string
  xPct: number
  y: number
  travado: boolean
  condicao?: string
}

const PADDING_TOP = 40
const NODE_GAP = 132
const BRANCH_GAP = 108
const BRANCH_LEAD = 74 // respiro entre a origem do ramo e o 1º nó, p/ a etiqueta
const DIVIDER_SPACE = 76
const FOOTER_GAP = 150

const LANES = [50, 74, 50, 26]

function tamanhos(intensidade: "sobria" | "expressiva") {
  return intensidade === "expressiva"
    ? { node: 64, current: 72, branch: 52 }
    : { node: 60, current: 68, branch: 48 }
}

/** Curva suave (bezier com tangentes verticais) através de uma lista de pontos. */
function construirPath(pontos: Ponto[]): string {
  if (pontos.length === 0) return ""
  let d = `M ${pontos[0].x} ${pontos[0].y}`
  for (let i = 1; i < pontos.length; i++) {
    const a = pontos[i - 1]
    const b = pontos[i]
    const midY = (a.y + b.y) / 2
    d += ` C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`
  }
  return d
}

function usarLayout(trilha: Trilha, intensidade: "sobria" | "expressiva") {
  return useMemo(() => {
    const T = tamanhos(intensidade)
    const entradas: (EntradaNo | EntradaDivisor)[] = []
    const etiquetasRamo: EtiquetaRamo[] = []
    const pontosTrunk: Ponto[] = []
    let indiceProgresso = -1

    let y = PADDING_TOP
    let trunkIndex = 0
    let numero = 0

    // grupos de ramo: origem -> pontos -> ponto de reencontro
    const gruposRamo: {
      pontos: Ponto[]
      origem: Ponto | null
      reencontroIdx: number
    }[] = []

    trilha.blocos.forEach((bloco, bi) => {
      if (bi > 0) {
        y += DIVIDER_SPACE / 2
        entradas.push({
          tipo: "divisor",
          id: bloco.id,
          rotulo: bloco.rotulo,
          y,
        })
        y += DIVIDER_SPACE / 2
      }

      const nos = bloco.nos
      let i = 0
      while (i < nos.length) {
        const no = nos[i]
        if (no.ramo) {
          const ramoId = no.ramo.id
          const origem = pontosTrunk[pontosTrunk.length - 1] ?? null
          const branchX = !origem || origem.x <= 50 ? 82 : 18
          const pontos: Ponto[] = []
          // empurra o primeiro nó do ramo para baixo, abrindo espaço p/ a etiqueta
          y += BRANCH_LEAD
          const primeiroY = y
          let algumTravado = false
          while (i < nos.length && nos[i].ramo && nos[i].ramo!.id === ramoId) {
            const rno = nos[i]
            numero += 1
            entradas.push({
              tipo: "no",
              no: rno,
              xPct: branchX,
              y,
              size: T.branch,
              numero,
              isRamo: true,
            })
            pontos.push({ x: branchX, y })
            if (rno.estado === "travado") algumTravado = true
            y += BRANCH_GAP
            i++
          }
          etiquetasRamo.push({
            id: ramoId,
            nome: no.ramo.nome,
            corToken: no.ramo.corToken,
            xPct: branchX,
            y: primeiroY - BRANCH_LEAD + 14,
            travado: algumTravado,
            condicao: no.destravadoPor
              ? `abre ao concluir "${no.destravadoPor}"`
              : undefined,
          })
          gruposRamo.push({
            pontos,
            origem,
            reencontroIdx: pontosTrunk.length, // próximo ponto de trunk
          })
        } else {
          const xPct = LANES[trunkIndex % LANES.length]
          const size = no.estado === "atual" ? T.current : T.node
          numero += 1
          entradas.push({
            tipo: "no",
            no,
            xPct,
            y,
            size,
            numero,
            isRamo: false,
          })
          const p = { x: xPct, y }
          pontosTrunk.push(p)
          if (no.estado === "atual") indiceProgresso = pontosTrunk.length - 1
          trunkIndex++
          y += NODE_GAP
          i++
        }
      }
    })

    const footerY = y + FOOTER_GAP - NODE_GAP
    const alturaTotal = footerY + 150

    const pathTrunk = construirPath(pontosTrunk)
    const pathProgresso =
      indiceProgresso >= 0
        ? construirPath(pontosTrunk.slice(0, indiceProgresso + 1))
        : ""

    const pathsRamo = gruposRamo.map((g) => {
      const reencontro = pontosTrunk[g.reencontroIdx]
      const seq: Ponto[] = []
      if (g.origem) seq.push(g.origem)
      seq.push(...g.pontos)
      if (reencontro) seq.push(reencontro)
      return construirPath(seq)
    })

    return {
      entradas,
      etiquetasRamo,
      pathTrunk,
      pathProgresso,
      pathsRamo,
      alturaTotal,
      footerY,
    }
  }, [trilha, intensidade])
}

export default function Caminho({
  trilha,
  intensidade,
  haloModuloId,
  carregando,
  onSelecionarNo,
}: CaminhoProps) {
  const layout = usarLayout(trilha, intensidade)

  if (carregando) {
    return (
      <div
        className="relative mx-auto w-full max-w-md"
        style={{ height: layout.alturaTotal }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 100 ${layout.alturaTotal}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d={layout.pathTrunk}
            fill="none"
            strokeWidth={4}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ stroke: "var(--finlow-surface-2)" }}
          />
        </svg>
        {layout.entradas.map((e, idx) =>
          e.tipo === "no" ? (
            <div
              key={idx}
              className="finlow-skeleton absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${e.xPct}%`,
                top: e.y,
                width: e.size,
                height: e.size,
                backgroundColor: "var(--finlow-surface-2)",
              }}
            />
          ) : null,
        )}
      </div>
    )
  }

  return (
    <div
      className="relative mx-auto w-full max-w-md"
      style={{ height: layout.alturaTotal }}
    >
      {/* Trilho SVG — decorativo */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 100 ${layout.alturaTotal}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d={layout.pathTrunk}
          fill="none"
          strokeWidth={4}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ stroke: "var(--finlow-surface-2)" }}
        />
        {layout.pathsRamo.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="1 6"
            vectorEffect="non-scaling-stroke"
            style={{ stroke: "var(--finlow-branch)" }}
          />
        ))}
        <motion.path
          d={layout.pathProgresso}
          fill="none"
          strokeWidth={4}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          strokeDasharray={1}
          initial={{ strokeDashoffset: 1 }}
          // `d` NÃO entra no animate. Ele já é prop estática, e pedir ao motion
          // para animá-lo fazia o atributo sair como "undefined" nos primeiros
          // quadros — três erros de SVG no console a cada render. O traço é o
          // que anima; o desenho do caminho não muda.
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ stroke: "var(--finlow-accent)" }}
        />
      </svg>

      {/* Divisores de bloco */}
      {layout.entradas.map((e) =>
        e.tipo === "divisor" ? (
          <div
            key={e.id}
            className="absolute left-0 right-0 -translate-y-1/2 px-4"
            style={{ top: e.y }}
          >
            <DivisorBloco rotulo={e.rotulo} />
          </div>
        ) : null,
      )}

      {/* Etiquetas de ramo — ancoradas à coluna do ramo, sem sair da tela */}
      {layout.etiquetasRamo.map((r) => (
        <div
          key={r.id}
          className="absolute z-20 -translate-y-1/2 px-2"
          style={{
            top: r.y,
            left: r.xPct <= 50 ? "0.75rem" : "auto",
            right: r.xPct > 50 ? "0.75rem" : "auto",
          }}
        >
          <RamoTematico
            nome={r.nome}
            travado={r.travado}
            condicao={r.condicao}
            alinhamento={r.xPct > 50 ? "direita" : "esquerda"}
          />
        </div>
      ))}

      {/* Nós */}
      {layout.entradas.map((e) =>
        e.tipo === "no" ? (
          <div
            key={e.no.moduloId}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${e.xPct}%`,
              top: e.y,
              width: e.size,
              height: e.size,
            }}
          >
            <NoTrilha
              no={e.no}
              numero={e.numero}
              side={e.xPct <= 50 ? "right" : "left"}
              size={e.size}
              intensidade={intensidade}
              haloAtivo={haloModuloId === e.no.moduloId}
              onSelecionar={() => onSelecionarNo(e.no)}
            />
          </div>
        ) : null,
      )}

      {/* Fim da trilha */}
      <div
        className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 px-6 text-center"
        style={{ top: layout.footerY }}
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            border: "2px dashed var(--finlow-surface-2)",
            color: "var(--finlow-muted)",
          }}
        >
          <Flag size={24} aria-hidden="true" />
        </div>
        <p
          className="max-w-[260px] text-[13px] leading-relaxed text-pretty"
          style={{ color: "var(--finlow-muted)" }}
        >
          Fim da trilha atual · a IA libera os próximos 4 módulos quando você
          chegar aqui.
        </p>
        <button
          type="button"
          className="rounded-full px-4 py-2 text-sm font-medium"
          style={{
            border: "1px solid var(--finlow-surface-2)",
            color: "var(--finlow-text)",
          }}
        >
          Explorar biblioteca
        </button>
      </div>
    </div>
  )
}
