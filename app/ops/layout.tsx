import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { emailsDeOps, operadorAtual } from "@/lib/ops"

export const dynamic = "force-dynamic"

/**
 * A superfície da OPERAÇÃO do Finlow, acima de qualquer escola.
 *
 * Três superfícies, três públicos, e nenhuma delas é aba da outra:
 *
 *   /(app)    o produto      quem usa o Finlow
 *   /escola   a escola       professor e adm de UMA escola
 *   /ops      a operação     quem opera o Finlow
 *
 * Por isso /ops fica fora do grupo (app), sem BottomNav, e fora de
 * lib/abas.ts e lib/app-mapa.ts, exatamente como /escola.
 *
 * QUEM NÃO ESTÁ NA LISTA VÊ 404, não 403: um 403 confirma que a página existe
 * e que falta só o crachá, o que é informação de graça para quem estava
 * chutando endereços. Já quem nem sessão tem vai para o login, porque a
 * alternativa (404 para deslogado) transformaria "esqueci de entrar" num
 * mistério para a única pessoa que usa esta tela.
 */
export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  if (emailsDeOps().length === 0) notFound()

  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const op = await operadorAtual()
  if (!op) notFound()

  return (
    <div className="tema-fin min-h-dvh bg-fl-page">
      <header className="border-b-2 border-fl-divider bg-fl-page">
        <div className="mx-auto max-w-4xl px-5 py-4">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p
                className="text-[10px] font-black uppercase tracking-[1.4px]"
                style={{ color: "var(--fl-500)" }}
              >
                Operação Finlow
              </p>
              <h1 className="mt-0.5 text-lg font-black tracking-tight text-fl-ink">
                Painel da operação
              </h1>
            </div>
            <span className="text-xs font-bold text-fl-ink/60">{op.email}</span>
          </div>
          <nav className="mt-3 flex gap-4 text-[12.5px]">
            <Link href="/ops" className="font-extrabold text-fl-ink-2 hover:text-fl-ink">
              Números
            </Link>
            <Link href="/ops/escolas" className="font-extrabold text-fl-ink-2 hover:text-fl-ink">
              Escolas
            </Link>
            <Link href="/chat" className="ml-auto font-bold text-fl-ink-3 hover:text-fl-ink-2">
              Ir para o app
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-6">{children}</main>
    </div>
  )
}
