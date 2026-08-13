import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { CATALOGO, estadoDaLoja } from "@/lib/loja"
import { POSE } from "@/lib/fin"
import { LojaFin } from "@/components/trilha-visual/fin/LojaFin"
import { BottomNav } from "@/components/bottom-nav"

export const dynamic = "force-dynamic"

/**
 * A Loja do Fin (G-06/12/13): poção ×2 e avatares, pagos em Finlo Coins.
 * Catálogo fixo em código (lib/loja.ts); cobrança e posse no servidor.
 */
export default async function LojaPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const estado = await estadoDaLoja(session.user.id)

  return (
    <main className="tema-fin min-h-dvh pb-24 lg:pl-56" style={{ background: "var(--fin-bg)" }}>
      <div className="mx-auto w-full max-w-md px-5 py-6">
        <div className="flex items-center justify-between">
          <Link href="/trilha" className="text-sm font-extrabold" style={{ color: "var(--fin-accent)" }}>
            ← Trilha
          </Link>
          <span
            className="flex items-center gap-1.5 text-[15px] font-black tabular-nums"
            style={{ color: "var(--fin-accent)" }}
            aria-label={`${estado.coins} Finlo Coins`}
          >
            <span
              className="inline-block size-[15px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, var(--fin-accent-sombra) 0 40%, var(--fin-accent) 41% 100%)",
              }}
              aria-hidden="true"
            />
            {estado.coins.toLocaleString("pt-BR")}
          </span>
        </div>

        <h1 className="mt-4 text-xl font-black" style={{ color: "var(--fin-text)" }}>
          Loja do Fin
        </h1>

        <div
          className="mt-3 flex items-center gap-3 rounded-2xl border px-3.5 py-2.5"
          style={{ background: "var(--fin-surface)", borderColor: "var(--fin-border-2)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={POSE.teach} alt="" className="size-10 shrink-0 object-contain" />
          <p className="text-[12.5px] leading-snug" style={{ color: "var(--fin-muted)" }}>
            Coins vêm de lições, missões e baús. Gaste com calma — elas não expiram!
          </p>
        </div>

        <div className="mt-4">
          <LojaFin
            itens={[...CATALOGO]}
            coins={estado.coins}
            pocaoAtiva={estado.pocaoAtiva}
            avatarFin={estado.avatarFin}
            possuidos={[...estado.possuidos]}
          />
        </div>
      </div>
      <BottomNav />
    </main>
  )
}
