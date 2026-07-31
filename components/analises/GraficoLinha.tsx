"use client"

import { useRef, useState } from "react"
import { brl } from "@/lib/formato"

interface Props {
  pontos: { rotulo: string; valor: number }[]
  altura?: number
  /** destaca o cruzamento com zero (usado no fluxo de caixa) */
  mostrarZero?: boolean
}

/**
 * Linha temporal em SVG. Sem lib: viewBox 0..100 x 0..100 e preserveAspectRatio
 * "none" fazem o gráfico esticar na largura disponível.
 *
 * SOBRE A INTERAÇÃO
 * O valor selecionado aparece ACIMA do gráfico, e começa no último ponto. Isso
 * é de propósito: número que só existe enquanto o dedo está na tela é número
 * que a pessoa não consegue ler direito. Aqui sempre há um valor à vista, e
 * tocar só troca qual — a interação melhora a leitura, não é condição para ela.
 *
 * O alvo é uma faixa que cobre o gráfico inteiro e escolhe o ponto mais próximo
 * no eixo X. Ninguém acerta um círculo de 6px com o dedo. Teclado faz o mesmo
 * com as setas, e Esc volta ao padrão.
 */
export function GraficoLinha({ pontos, altura = 140, mostrarZero = false }: Props) {
  const [selecionado, setSelecionado] = useState<number | null>(null)
  const areaRef = useRef<HTMLDivElement>(null)

  if (pontos.length === 0) return null

  const valores = pontos.map((p) => p.valor)
  const max = Math.max(...valores, 0)
  const min = Math.min(...valores, 0)
  const amplitude = max - min || 1

  const y = (v: number) => 100 - ((v - min) / amplitude) * 100
  const x = (i: number) => (pontos.length === 1 ? 50 : (i / (pontos.length - 1)) * 100)

  const linha = pontos.map((p, i) => `${x(i)},${y(p.valor)}`).join(" ")
  const area = `0,100 ${linha} 100,100`
  const yZero = y(0)

  // Sem seleção mostra o último: o gráfico nunca fica sem número na tela.
  const iAtivo = selecionado ?? pontos.length - 1
  const ativo = pontos[iAtivo]

  function pelaPosicao(clientX: number) {
    const el = areaRef.current
    if (!el || pontos.length < 2) return
    const r = el.getBoundingClientRect()
    const frac = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    setSelecionado(Math.round(frac * (pontos.length - 1)))
  }

  return (
    <div>
      {/* Valor em destaque, rótulo secundário: quem olha já sabe o período e
          quer o número. */}
      <div className="mb-1.5 flex items-baseline gap-2">
        <span className="text-[17px] font-bold tabular-nums text-fl-ink">{brl(ativo.valor)}</span>
        <span className="text-[12px] text-fl-ink-3">
          {ativo.rotulo}
          {selecionado === null && pontos.length > 1 ? " · toque no gráfico" : ""}
        </span>
      </div>

      <div
        ref={areaRef}
        className="relative cursor-pointer touch-none rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-fl-500"
        style={{ height: altura }}
        role="slider"
        tabIndex={0}
        aria-label="Linha do tempo. Use as setas para percorrer os pontos."
        aria-valuemin={0}
        aria-valuemax={pontos.length - 1}
        aria-valuenow={iAtivo}
        aria-valuetext={`${ativo.rotulo}: ${brl(ativo.valor)}`}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          pelaPosicao(e.clientX)
        }}
        onPointerMove={(e) => {
          if (e.buttons > 0) pelaPosicao(e.clientX)
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault()
            const passo = e.key === "ArrowLeft" ? -1 : 1
            setSelecionado(Math.min(pontos.length - 1, Math.max(0, iAtivo + passo)))
          } else if (e.key === "Escape") {
            setSelecionado(null)
          }
        }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
          role="img"
          aria-label={`Linha de ${pontos.length} pontos, valor final ${brl(pontos[pontos.length - 1].valor)}`}
        >
          <defs>
            <linearGradient id="grad-linha" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--fl-500)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--fl-500)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {mostrarZero && min < 0 && (
            <line x1="0" y1={yZero} x2="100" y2={yZero} stroke="var(--fl-border)" strokeWidth="0.5" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
          )}

          <polygon points={area} fill="url(#grad-linha)" />
          <polyline
            points={linha}
            fill="none"
            stroke="var(--fl-500)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Fio do ponto escolhido — só aparece quando a pessoa interage. */}
          {selecionado !== null && (
            <line
              x1={x(iAtivo)}
              y1="0"
              x2={x(iAtivo)}
              y2="100"
              stroke="var(--fl-ink-3)"
              strokeWidth="1"
              strokeOpacity="0.45"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {pontos.length <= 12 &&
            pontos.map((p, i) => (
              <circle
                key={i}
                cx={x(i)}
                cy={y(p.valor)}
                r="3"
                fill="var(--fl-page)"
                stroke="var(--fl-500)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            ))}

          {/* Anel da cor da superfície separa o marcador ativo da linha. */}
          <circle
            cx={x(iAtivo)}
            cy={y(ativo.valor)}
            r="4.5"
            fill="var(--fl-500)"
            stroke="var(--fl-card)"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div className="mt-2 flex justify-between text-[10.5px] text-fl-ink-3">
        {pontos.length <= 12 ? (
          pontos.map((p, i) => (
            <span key={i} className={i === iAtivo ? "font-semibold text-fl-ink-2" : undefined}>
              {p.rotulo}
            </span>
          ))
        ) : (
          <>
            <span>{pontos[0].rotulo}</span>
            <span>{pontos[Math.floor(pontos.length / 2)].rotulo}</span>
            <span>{pontos[pontos.length - 1].rotulo}</span>
          </>
        )}
      </div>
    </div>
  )
}
