interface DivisorBlocoProps {
  rotulo: string
}

/**
 * Divisor de bloco. O trilho SVG atravessa esta linha por baixo — este
 * componente só desenha a régua e o rótulo centralizado sobre ela.
 */
export default function DivisorBloco({ rotulo }: DivisorBlocoProps) {
  return (
    <div
      className="pointer-events-none flex w-full items-center gap-3"
      aria-hidden="true"
    >
      <span
        className="h-px flex-1"
        style={{ backgroundColor: "var(--finlow-surface-2)" }}
      />
      <span
        className="whitespace-nowrap px-1 text-[11px] font-semibold uppercase"
        style={{
          color: "var(--finlow-muted)",
          letterSpacing: "0.14em",
          backgroundColor: "var(--finlow-bg)",
        }}
      >
        {rotulo}
      </span>
      <span
        className="h-px flex-1"
        style={{ backgroundColor: "var(--finlow-surface-2)" }}
      />
    </div>
  )
}
