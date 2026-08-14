import Link from "next/link"

/**
 * O toggle Controle Financeiro ↔ Análises do protótipo v2 (14/08/2026).
 *
 * Antes ele era um estado INTERNO do Painel, com uma aba "análises" que
 * duplicava a página /analises em miniatura — duas portas para a mesma ideia,
 * e a menor sempre um passo atrás da maior. O desenho resolveu: o toggle
 * navega entre as DUAS páginas, cada uma dona do seu conteúdo. Os cards que
 * só existiam na aba interna (gasto médio por dia, insight do perfil)
 * mudaram-se para /analises — nada foi perdido, só deixou de ter cópia.
 */
export function ToggleControleAnalises({ ativa }: { ativa: "controle" | "analises" }) {
  const base = "flex-1 rounded-xl py-2.5 text-center text-[13px] font-extrabold transition-colors"
  return (
    <div className="flex gap-1 rounded-2xl bg-fl-card p-1">
      {ativa === "controle" ? (
        <span className={`${base} bg-fl-500 text-primary-foreground`}>Controle Financeiro</span>
      ) : (
        <Link href="/painel" className={`${base} text-fl-ink-2 hover:text-fl-ink`}>
          Controle Financeiro
        </Link>
      )}
      {ativa === "analises" ? (
        <span className={`${base} bg-fl-500 text-primary-foreground`}>Análises</span>
      ) : (
        <Link href="/analises" className={`${base} text-fl-ink-2 hover:text-fl-ink`}>
          Análises
        </Link>
      )}
    </div>
  )
}
