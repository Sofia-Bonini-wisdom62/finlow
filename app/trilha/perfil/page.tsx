import Link from "next/link"
import { redirect } from "next/navigation"
import { Flame, Star, Zap, Gem, Target, BookOpen } from "lucide-react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { lerOfensiva } from "@/lib/ofensiva"
import { nivelDoTotal } from "@/lib/nivel"
import { estadoDasMissoes } from "@/lib/missoes"
import { conquistasDe, type Conquista } from "@/lib/conquistas"
import { AVATAR_POSE, POSE } from "@/lib/fin"
import { MissoesFin } from "@/components/trilha-visual/fin/MissoesFin"
import { BottomNav } from "@/components/bottom-nav"

export const dynamic = "force-dynamic"

/**
 * O perfil do JOGADOR (Redesign Fin) — nível, missões, conquistas, recorde.
 *
 * Convive com o /perfil financeiro sem competir: este é o placar do jogo,
 * aquele é o retrato do dinheiro. Vive dentro do universo /trilha e é o
 * destino do avatar no header.
 */

const ICONE_CONQUISTA = {
  star: Star,
  flame: Flame,
  bolt: Zap,
  gem: Gem,
  target: Target,
  book: BookOpen,
} as const

function CardConquista({ c }: { c: Conquista }) {
  const Icone = ICONE_CONQUISTA[c.icone]
  return (
    <div
      className="flex flex-col items-center gap-2 rounded-2xl px-2 py-3.5 text-center"
      style={{ background: "var(--fin-surface)", opacity: c.conquistada ? 1 : 0.45 }}
    >
      <span
        className="grid size-10 place-items-center rounded-full"
        style={{
          background: c.conquistada
            ? "color-mix(in srgb, var(--fin-accent) 22%, transparent)"
            : "var(--fin-border)",
        }}
      >
        <Icone
          className="size-5"
          style={{ color: c.conquistada ? "var(--fin-accent)" : "var(--fin-dim)" }}
        />
      </span>
      <span
        className="text-[11px] font-extrabold leading-tight"
        style={{ color: c.conquistada ? "var(--fin-text)" : "var(--fin-dim)" }}
      >
        {c.titulo}
      </span>
    </div>
  )
}

export default async function PerfilJogadorPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const [user, ofensiva, missoes, conquistas, licoes] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { nome: true, pontos: true, coins: true, avatarFin: true, comboRecorde: true },
    }),
    lerOfensiva(userId),
    estadoDasMissoes(userId),
    conquistasDe(userId),
    db.progressoLicao.findMany({
      where: { userId, concluido: true, totalQuiz: { gt: 0 } },
      select: { acertos: true, totalQuiz: true },
    }),
  ])
  if (!user) redirect("/login")

  const nivel = nivelDoTotal(user.pontos)
  const somaAcertos = licoes.reduce((s, l) => s + l.acertos, 0)
  const somaQuiz = licoes.reduce((s, l) => s + l.totalQuiz, 0)
  const precisao = somaQuiz > 0 ? Math.round((somaAcertos / somaQuiz) * 100) : null
  const avatar = user.avatarFin ? AVATAR_POSE[user.avatarFin] : null
  const primeiroNome = (user.nome ?? "").split(" ")[0]

  return (
    <main className="tema-fin min-h-dvh pb-24 lg:pl-56" style={{ background: "var(--fin-bg)" }}>
      <div className="mx-auto w-full max-w-md px-5 py-6">
        <Link href="/trilha" className="text-sm font-extrabold" style={{ color: "var(--fin-accent)" }}>
          ← Trilha
        </Link>

        {/* cabeçalho do jogador */}
        <div className="mt-4 flex items-center gap-4">
          <div
            className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full text-2xl font-black"
            style={{
              background: "var(--fin-accent)",
              color: "var(--fin-bg)",
              boxShadow: "0 4px 0 var(--fin-accent-sombra)",
            }}
          >
            {avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              (user.nome ?? "?").trim().charAt(0).toUpperCase() || "?"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xl font-black" style={{ color: "var(--fin-text)" }}>
              {user.nome ?? "Jogador"}
            </div>
            <div className="text-[13px] font-bold" style={{ color: "var(--fin-muted)" }}>
              Nível {nivel.nivel}
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full" style={{ background: "var(--fin-border)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.round(nivel.fracao * 100)}%`, background: "var(--fin-accent)" }}
              />
            </div>
            <div className="mt-1 text-[11px] font-bold tabular-nums" style={{ color: "var(--fin-dim)" }}>
              {user.pontos.toLocaleString("pt-BR")} pontos · faltam {nivel.paraProximo} pro nível {nivel.nivel + 1}
            </div>
          </div>
        </div>

        {/* tiles */}
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl px-2 py-3.5 text-center" style={{ background: "var(--fin-surface)" }}>
            <Flame className="mx-auto size-4" style={{ color: "var(--fin-combo)" }} />
            <div className="mt-1 text-[18px] font-black tabular-nums" style={{ color: "var(--fin-text)" }}>
              {ofensiva.atual}
            </div>
            <div className="text-[10px] font-extrabold tracking-wide" style={{ color: "var(--fin-dim)" }}>
              DIAS SEGUIDOS
            </div>
          </div>
          <div className="rounded-2xl px-2 py-3.5 text-center" style={{ background: "var(--fin-surface)" }}>
            <span
              className="mx-auto block size-4 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, var(--fin-accent-sombra) 0 40%, var(--fin-accent) 41% 100%)",
              }}
            />
            <div className="mt-1 text-[18px] font-black tabular-nums" style={{ color: "var(--fin-text)" }}>
              {user.coins.toLocaleString("pt-BR")}
            </div>
            <div className="text-[10px] font-extrabold tracking-wide" style={{ color: "var(--fin-dim)" }}>
              FINLO COINS
            </div>
          </div>
          <div className="rounded-2xl px-2 py-3.5 text-center" style={{ background: "var(--fin-surface)" }}>
            <Target className="mx-auto size-4" style={{ color: "var(--fin-acerto)" }} />
            <div className="mt-1 text-[18px] font-black tabular-nums" style={{ color: "var(--fin-text)" }}>
              {precisao === null ? "—" : `${precisao}%`}
            </div>
            <div className="text-[10px] font-extrabold tracking-wide" style={{ color: "var(--fin-dim)" }}>
              PRECISÃO
            </div>
          </div>
        </div>

        {/* missões */}
        <div className="mt-6 flex items-baseline justify-between">
          <h2 className="text-[15px] font-black" style={{ color: "var(--fin-text)" }}>
            Missões
          </h2>
          <span className="text-[11px] font-bold" style={{ color: "var(--fin-dim)" }}>
            renovam à meia-noite
          </span>
        </div>
        <div className="mt-2.5">
          <MissoesFin missoes={missoes} />
        </div>

        {/* conquistas */}
        <h2 className="mt-6 text-[15px] font-black" style={{ color: "var(--fin-text)" }}>
          Conquistas
        </h2>
        <div className="mt-2.5 grid grid-cols-3 gap-2.5">
          {conquistas.map((c) => (
            <CardConquista key={c.id} c={c} />
          ))}
        </div>

        {/* dica do Fin — o recorde nunca tinha sido exibido */}
        <div
          className="mt-5 flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{ background: "var(--fin-surface)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={POSE.stars} alt="" className="size-11 shrink-0 object-contain" />
          <p className="text-[12.5px] leading-snug" style={{ color: "var(--fin-muted)" }}>
            {ofensiva.recorde > 0 ? (
              <>
                Seu recorde de ofensiva é{" "}
                <strong style={{ color: "var(--fin-text)" }}>
                  {ofensiva.recorde} {ofensiva.recorde === 1 ? "dia" : "dias"}
                </strong>
                {ofensiva.atual >= ofensiva.recorde && ofensiva.recorde > 1
                  ? " — e você está nele agora. Segura!"
                  : ". Que tal quebrar essa marca?"}
              </>
            ) : (
              <>
                Sua primeira chama acende na primeira lição
                {primeiroNome ? `, ${primeiroNome}` : ""}. Bora?
              </>
            )}
          </p>
        </div>
      </div>
      <BottomNav />
    </main>
  )
}
