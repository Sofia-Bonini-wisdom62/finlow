"use client"

import { brl } from "@/lib/formato"

interface Props {
  pontos: { rotulo: string; valor: number }[]
  altura?: number
  /** destaca o cruzamento com zero (usado no fluxo de caixa) */
  mostrarZero?: boolean
}

// Linha temporal em SVG. Sem lib: viewBox 0..100 x 0..100 e preserveAspectRatio
// "none" fazem o gráfico esticar na largura disponível.
export function GraficoLinha({ pontos, altura = 140, mostrarZero = false }: Props) {
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
  const ultimo = pontos[pontos.length - 1]

  return (
    <div>
      <div className="relative" style={{ height: altura }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
          role="img"
          aria-label={`Linha de ${pontos.length} pontos, valor final ${brl(ultimo.valor)}`}
        >
          <defs>
            <linearGradient id="grad-linha" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2B6D70" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#2B6D70" stopOpacity="0" />
            </linearGradient>
          </defs>

          {mostrarZero && min < 0 && (
            <line x1="0" y1={yZero} x2="100" y2={yZero} stroke="#E1DED6" strokeWidth="0.5" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
          )}

          <polygon points={area} fill="url(#grad-linha)" />
          <polyline
            points={linha}
            fill="none"
            stroke="#2B6D70"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {pontos.length <= 12 &&
            pontos.map((p, i) => (
              <circle key={i} cx={x(i)} cy={y(p.valor)} r="3" fill="#FAF9F6" stroke="#2B6D70" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            ))}
        </svg>
      </div>

      <div className="mt-2 flex justify-between text-[10.5px] text-fl-ink-3">
        {pontos.length <= 12 ? (
          pontos.map((p, i) => <span key={i}>{p.rotulo}</span>)
        ) : (
          <>
            <span>{pontos[0].rotulo}</span>
            <span>{pontos[Math.floor(pontos.length / 2)].rotulo}</span>
            <span>{ultimo.rotulo}</span>
          </>
        )}
      </div>
    </div>
  )
}
