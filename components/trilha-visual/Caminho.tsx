"use client"

import { useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Flag } from "lucide-react"
import type { NoTrilha as NoTrilhaTipo, Trilha } from "@/lib/trilha-visual"
import NoTrilha from "./NoTrilha"
import DivisorBloco from "./DivisorBloco"
import RamoTematico from "./RamoTematico"
import { corDaUnidade } from "@/lib/fin"

interface CaminhoProps {
  trilha: Trilha
  intensidade: "sobria" | "expressiva"
  haloModuloId?: string | null
  carregando?: boolean
  onSelecionarNo: (no: NoTrilhaTipo) => void
  /** Toque num baú disponível (Redesign Fin). */
  onAbrirBau?: (refId: string) => void
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
  /** A cor da unidade a que o nó pertence. */
  cor: { cor: string; sombra: string }
}
interface EntradaDivisor {
  tipo: "divisor"
  id: string
  rotulo: string
  y: number
  indice: number
  subRotulo: string
  progresso: number
  ativo: boolean
}
interface EntradaBau {
  tipo: "bau"
  refId: string
  estado: "travado" | "disponivel" | "aberto"
  xPct: number
  y: number
  cor: { cor: string; sombra: string }
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
// O divisor deixou de ser régua e virou CARD de unidade (Redesign Fin) —
// precisa da altura de um card com barra de progresso, não de uma linha.
const DIVIDER_SPACE = 150
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
    const entradas: (EntradaNo | EntradaDivisor | EntradaBau)[] = []
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
      const cor = corDaUnidade(bloco.indice ?? bi)

      // O card de unidade abre TODO bloco (a trilha adulta ganha o dela) —
      // antes só havia régua entre blocos.
      {
        if (bi > 0) y += DIVIDER_SPACE / 2
        const feitos = bloco.nos.filter((n) => n.estado === "concluido").length
        entradas.push({
          tipo: "divisor",
          id: bloco.id,
          rotulo: trilha.escolar ? bloco.rotulo : "Montada pela IA a partir dos seus números",
          y,
          indice: bloco.indice ?? bi,
          subRotulo: trilha.escolar ? `Unidade ${(bloco.indice ?? bi) + 1}` : "Sua trilha",
          progresso: bloco.nos.length ? feitos / bloco.nos.length : 0,
          ativo: bloco.nos.some((n) => n.estado === "atual"),
        })
        y += DIVIDER_SPACE / 2 + 20
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
              cor,
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
            cor,
          })
          const p = { x: xPct, y }
          pontosTrunk.push(p)
          if (no.estado === "atual") indiceProgresso = pontosTrunk.length - 1
          trunkIndex++
          y += NODE_GAP
          i++
        }
      }

      // O baú fecha a unidade escolar — entra como nó do tronco, para o
      // caminho atravessá-lo em vez de terminar antes dele.
      if (bloco.bau) {
        const xPct = LANES[trunkIndex % LANES.length]
        entradas.push({
          tipo: "bau",
          refId: bloco.bau.refId,
          estado: bloco.bau.estado,
          xPct,
          y,
          cor,
        })
        pontosTrunk.push({ x: xPct, y })
        trunkIndex++
        y += NODE_GAP
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
  onAbrirBau,
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

      {/* Cards de unidade */}
      {layout.entradas.map((e) =>
        e.tipo === "divisor" ? (
          <div
            key={e.id}
            className="absolute left-0 right-0 -translate-y-1/2 px-2"
            style={{ top: e.y }}
          >
            <DivisorBloco
              rotulo={e.rotulo}
              indice={e.indice}
              subRotulo={e.subRotulo}
              progresso={e.progresso}
              ativo={e.ativo}
            />
          </div>
        ) : null,
      )}

      {/* Baús de unidade (Redesign Fin) */}
      {layout.entradas.map((e) =>
        e.tipo === "bau" ? (
          <div
            key={e.refId}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${e.xPct}%`, top: e.y }}
          >
            <button
              type="button"
              disabled={e.estado !== "disponivel"}
              onClick={() => e.estado === "disponivel" && onAbrirBau?.(e.refId)}
              aria-label={
                e.estado === "aberto"
                  ? "Baú da unidade, já aberto"
                  : e.estado === "disponivel"
                    ? "Abrir o baú da unidade"
                    : "Baú da unidade — complete a unidade para abrir"
              }
              className={`grid size-14 place-items-center rounded-2xl text-2xl ${
                e.estado === "disponivel" ? "fin-wob cursor-pointer" : "cursor-default"
              }`}
              style={
                e.estado === "disponivel"
                  ? { backgroundColor: e.cor.cor, boxShadow: `0 5px 0 ${e.cor.sombra}` }
                  : e.estado === "aberto"
                    ? { backgroundColor: "var(--finlow-surface)", opacity: 0.85 }
                    : { backgroundColor: "var(--finlow-surface)" }
              }
            >
              {e.estado === "aberto" ? "🎉" : e.estado === "disponivel" ? "🎁" : "🔒"}
            </button>
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
              cor={e.cor}
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
          {trilha.escolar
            ? "Fim da trilha da turma · quem chega aqui fechou o segmento inteiro."
            : "Fim da trilha atual · a IA libera os próximos 4 módulos quando você chegar aqui."}
        </p>
        {/* Era um <button> sem onClick — desenhava e não fazia nada. Virou link
            porque o destino é uma página inteira, e navegação que finge ser
            botão perde o meio-clique, o "abrir em nova aba" e o foco do teclado. */}
        <Link
          href="/trilha/biblioteca"
          className="rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
          style={{
            border: "1px solid var(--finlow-surface-2)",
            color: "var(--finlow-text)",
          }}
        >
          Explorar biblioteca
        </Link>
      </div>
    </div>
  )
}
