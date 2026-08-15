import { POSE, corDaUnidade } from "@/lib/fin"

interface DivisorBlocoProps {
  rotulo: string
  /** Posição do bloco na trilha — decide a cor (lib/fin.ts). */
  indice: number
  /** "UNIDADE 2" etc.; a trilha adulta (bloco único) mostra "SUA TRILHA". */
  subRotulo: string
  /** 0..1 — fração de nós concluídos do bloco. */
  progresso: number
  /** O bloco onde a pessoa está agora — ganha o Fin apontando. */
  ativo: boolean
}

/**
 * O CARD DE UNIDADE do protótipo (Redesign Fin) — substitui a régua fina que
 * dividia blocos. Cada unidade tem cor própria com sombra 3D, barra de
 * progresso, e o Fin aparece na unidade ativa. O trilho SVG atravessa por
 * baixo; o card cobre.
 */
export default function DivisorBloco({ rotulo, indice, subRotulo, progresso, ativo }: DivisorBlocoProps) {
  const { cor, sombra } = corDaUnidade(indice)
  const pct = Math.round(progresso * 100)

  return (
    <div
      className="pointer-events-none flex w-full items-center gap-3 rounded-2xl px-4 py-3.5"
      style={{ backgroundColor: cor, boxShadow: `0 4px 0 ${sombra}` }}
      aria-hidden="true"
    >
      <div className="min-w-0 flex-1">
        <div
          className="text-[10.5px] font-black uppercase"
          style={{ color: "#0C1B21", opacity: 0.65, letterSpacing: "0.12em" }}
        >
          {subRotulo}
        </div>
        <div
          className="truncate text-[16px] font-black leading-snug"
          style={{ color: "#0C1B21", letterSpacing: "-0.01em" }}
        >
          {rotulo}
        </div>
        {pct > 0 && (
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full"
            style={{ backgroundColor: "rgba(12,27,33,0.25)" }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, backgroundColor: "#0C1B21" }}
            />
          </div>
        )}
      </div>
      {ativo && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={POSE.point} alt="" className="size-14 shrink-0 object-contain" />
      )}
    </div>
  )
}
