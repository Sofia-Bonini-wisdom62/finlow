import Link from "next/link"
import { listarEscolas } from "@/lib/ops-escola"
import { CriarEscola } from "@/components/ops/CriarEscola"

export const dynamic = "force-dynamic"

/**
 * Todas as escolas, e a porta para criar mais uma.
 *
 * A leitura (e o veredito de vigência, que depende do relógio) mora em
 * `listarEscolas`: ler a hora durante o render é chamada impura.
 */
export default async function OpsEscolas() {
  const escolas = await listarEscolas()

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-fl-sand bg-fl-card p-5">
        <h2 className="text-base font-semibold text-fl-ink">Criar escola</h2>
        <p className="mt-1 text-sm text-fl-ink/60">
          Nasce ativa, com a conta da administração junto. Se o e-mail ainda não tem conta no
          Finlow, ela é criada com uma senha temporária que aparece aqui uma única vez.
        </p>
        <div className="mt-4">
          <CriarEscola />
        </div>
      </section>

      <section className="rounded-2xl border border-fl-sand bg-fl-card p-5">
        <h2 className="text-base font-semibold text-fl-ink">Escolas ({escolas.length})</h2>
        {escolas.length === 0 ? (
          <p className="mt-2 text-sm text-fl-ink/60">Nenhuma escola ainda.</p>
        ) : (
          <ul className="mt-3 divide-y divide-fl-sand">
            {escolas.map((e) => (
              <li key={e.id} className="flex items-baseline justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/ops/escolas/${e.id}`}
                    className="font-medium"
                    style={{ color: "var(--fl-500)" }}
                  >
                    {e.nome}
                  </Link>
                  <p className="mt-0.5 text-xs text-fl-ink/50">
                    {e.membros} pessoa{e.membros === 1 ? "" : "s"} · {e.turmas} turma
                    {e.turmas === 1 ? "" : "s"} ·{" "}
                    {e.ativaAte
                      ? `vale até ${e.ativaAte.toLocaleDateString("pt-BR")}`
                      : "piloto sem prazo"}
                  </p>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold"
                  style={
                    e.valendo
                      ? { background: "var(--fl-500)", color: "white" }
                      : { background: "var(--fl-sand)", color: "var(--fl-ink)" }
                  }
                >
                  {e.status === "suspensa" ? "suspensa" : e.valendo ? "ativa" : "vencida"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
