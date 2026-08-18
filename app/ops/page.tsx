import Link from "next/link"
import { numerosDaOperacao } from "@/lib/ops-numeros"

export const dynamic = "force-dynamic"

/**
 * Os números do produto, com rosto.
 *
 * Eles já existiam: /api/ops/metrics calcula quase tudo isto desde sempre,
 * mas só sai por curl com o token no cabeçalho, o que na prática significa
 * que ninguém olha. A rota continua onde está, porque ela serve máquina (e
 * traz junto a telemetria do Vertex, que não cabe numa tela de contagem).
 *
 * A contagem mora em lib/ops-numeros.ts, não aqui: ler o relógio durante o
 * render é chamada impura, e o lint do React recusa com razão.
 */

function Tile({ valor, rotulo }: { valor: number | string; rotulo: string }) {
  return (
    <div className="rounded-2xl border border-fl-sand bg-fl-card p-4">
      <p className="text-2xl font-semibold tabular-nums text-fl-ink">{valor}</p>
      <p className="text-xs text-fl-ink/60">{rotulo}</p>
    </div>
  )
}

export default async function OpsHome() {
  const n = await numerosDaOperacao()

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-fl-ink/50">Pessoas</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tile valor={n.usuarios} rotulo="contas" />
          <Tile valor={n.usuarios30d} rotulo="novas em 30 dias" />
          <Tile valor={n.assinaturasAtivas} rotulo="assinaturas ativas" />
          <Tile valor={n.inadimplentes} rotulo="inadimplentes" />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-fl-ink/50">Escolas</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tile valor={n.escolasAtivas} rotulo="escolas ativas" />
          <Tile valor={n.escolasSuspensas} rotulo="suspensas" />
          <Tile valor={n.turmas} rotulo="turmas" />
          <Tile valor={`${n.alunos} / ${n.professores}`} rotulo="alunos e professores" />
        </div>
        <p className="mt-3 text-sm text-fl-ink/70">
          <Link href="/ops/escolas" className="font-medium" style={{ color: "var(--fl-500)" }}>
            Ver e administrar as escolas
          </Link>
        </p>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-fl-ink/50">Aquisição</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tile valor={n.indicacoes} rotulo="indicações" />
          <Tile valor={n.indicacoesAtivadas} rotulo="indicações ativadas" />
          <Tile valor={`${n.pctIndicacao}%`} rotulo="da base veio por indicação" />
          <Tile valor={n.leads} rotulo="leads de empresa" />
        </div>
      </section>

      <p className="text-xs text-fl-ink/50">
        Contagens do banco, no instante em que a página carregou. A telemetria da IA (tokens,
        latência, taxa de erro do Vertex) continua em /api/ops/metrics, que precisa do token no
        cabeçalho.
      </p>
    </div>
  )
}
