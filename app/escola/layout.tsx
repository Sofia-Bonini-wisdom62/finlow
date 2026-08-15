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

  // `tema-fin` aqui porque /escola vive FORA do grupo (app): sem o escopo, os
  // tokens fl-* abaixo resolveriam para a paleta clara antiga (protótipo v2).
  return (
    <div className="tema-fin min-h-dvh bg-fl-page">
      <header className="border-b-2 border-fl-divider bg-fl-page">
        <div className="mx-auto max-w-3xl px-5 py-4">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[1.4px]" style={{ color: "var(--fl-500)" }}>
                Finlow para Escolas
              </p>
              <h1 className="mt-0.5 text-lg font-black tracking-tight text-fl-ink">{v.escolaNome}</h1>
            </div>
            <span className="text-xs font-bold text-fl-ink/60">
              {v.papel === "adm" ? "administração" : "professor"}
            </span>
          </div>
          <nav className="mt-3 flex gap-4 text-[12.5px]">
            {/* Sem estado ativo: layout é server component, não sabe a rota —
                aba dourada fixa mentiria nas outras páginas. */}
            <Link href="/escola" className="font-extrabold text-fl-ink-2 hover:text-fl-ink">Início</Link>
            <Link href="/escola/turmas" className="font-extrabold text-fl-ink-2 hover:text-fl-ink">Turmas</Link>
            {v.papel === "adm" && (
              <Link href="/escola/professores" className="font-extrabold text-fl-ink-2 hover:text-fl-ink">Professores</Link>
            )}
            <Link href="/chat" className="ml-auto font-bold text-fl-ink-3 hover:text-fl-ink-2">Ir para o app →</Link>
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
