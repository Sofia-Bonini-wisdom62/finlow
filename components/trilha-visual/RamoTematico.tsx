import { GitBranch } from "lucide-react"

interface RamoTematicoProps {
  nome: string
  travado?: boolean
  condicao?: string
  alinhamento?: "esquerda" | "direita"
}

/**
 * Rótulo de origem de um ramo temático. O trilho e os nós do ramo são
 * desenhados pelo Caminho; aqui fica só a etiqueta e, se travado, a condição.
 */
export default function RamoTematico({
  nome,
  travado,
  condicao,
  alinhamento = "esquerda",
}: RamoTematicoProps) {
  return (
    <div
      className={`flex max-w-[220px] flex-col gap-1 ${
        alinhamento === "direita" ? "items-end text-right" : "items-start"
      }`}
    >
      <span
        className="flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
        style={{
          backgroundColor: "color-mix(in srgb, var(--finlow-branch) 22%, transparent)",
          color: "var(--finlow-branch)",
        }}
      >
        <GitBranch size={12} aria-hidden="true" />
        Ramo · {nome}
      </span>
      {travado && condicao && (
        <span
          className="text-[10px] leading-snug text-pretty"
          style={{ color: "var(--finlow-muted)" }}
        >
          {condicao}
        </span>
      )}
    </div>
  )
}
