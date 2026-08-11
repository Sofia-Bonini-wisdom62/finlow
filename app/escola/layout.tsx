import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { vinculoEscolar } from "@/lib/escola"

/**
 * A superfície do professor e do adm (Finlow para Escolas).
 *
 * NÃO é uma aba do app do consumidor — o aluno usa o app normal (/trilha,
 * /ranking) e nunca vem aqui; por isso /escola fica fora de lib/abas.ts e de
 * lib/app-mapa.ts, e sem BottomNav. O gate roda no servidor a cada request:
 * quem perde o vínculo perde a superfície na navegação seguinte.
 *
 * Escola inativa NÃO bloqueia a leitura das telas (o adm precisa ver a casa
 * para resolver o contrato) — bloqueia os writes, em exigirPapel, nas rotas.
 * O banner aqui é o aviso; a recusa de verdade mora na API.
 */
export default async function EscolaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const v = await vinculoEscolar(session.user.id)
  if (!v || v.papel === "aluno") redirect("/chat")

  return (
    <div className="min-h-dvh bg-fl-page">
      <header className="border-b border-fl-sand bg-fl-card">
        <div className="mx-auto max-w-3xl px-5 py-4">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--fl-500)" }}>
                Finlow para Escolas
              </p>
              <h1 className="text-lg font-semibold text-fl-ink">{v.escolaNome}</h1>
            </div>
            <span className="text-xs text-fl-ink/60">
              {v.papel === "adm" ? "administração" : "professor"}
            </span>
          </div>
          <nav className="mt-3 flex gap-4 text-sm">
            <Link href="/escola" className="font-medium text-fl-ink">Início</Link>
            <Link href="/escola/turmas" className="font-medium text-fl-ink">Turmas</Link>
            {v.papel === "adm" && (
              <Link href="/escola/professores" className="font-medium text-fl-ink">Professores</Link>
            )}
            <Link href="/chat" className="ml-auto font-medium text-fl-ink/60">Ir para o app</Link>
          </nav>
        </div>
      </header>

      {!v.escolaAtiva && (
        <div className="mx-auto max-w-3xl px-5 pt-4">
          <p className="rounded-xl border border-fl-accent/40 bg-fl-accent/10 px-4 py-3 text-sm text-fl-ink">
            A conta da escola não está ativa — dá para ver tudo, mas nada novo entra até o
            contrato ser resolvido.
          </p>
        </div>
      )}

      <main className="mx-auto max-w-3xl px-5 py-6">{children}</main>
    </div>
  )
}
