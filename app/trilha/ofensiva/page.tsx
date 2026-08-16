import Link from "next/link"
import { redirect } from "next/navigation"
import { Flame, Trophy, CalendarDays, Gift } from "lucide-react"
import { auth } from "@/lib/auth"
import { diaDeHoje, lerHistoricoOfensiva } from "@/lib/ofensiva"
import { POSE } from "@/lib/fin"
import { OfensivaCalendario } from "@/components/trilha-visual/fin/OfensivaCalendario"
import { BottomNav } from "@/components/bottom-nav"

export const dynamic = "force-dynamic"

/**
 * A tela dedicada da ofensiva: o número grande, o recorde e o histórico.
 *
 * Só LÊ — não marca dia ativo. O registro mora na /trilha e no layout de
 * (app) (ver lib/ofensiva.ts); esta é uma sub-rota que a pessoa alcança pela
 * chama do header, depois de o dia já ter sido marcado.
 */

function Tile({
  icone: Icone,
  cor,
  valor,
  rotulo,
}: {
  icone: typeof Flame
  cor: string
  valor: string
  rotulo: string
}) {
  return (
    <div className="rounded-2xl px-2 py-3.5 text-center" style={{ background: "var(--fin-surface)" }}>
      <Icone className="mx-auto size-4" style={{ color: cor }} />
      <div className="mt-1 text-[18px] font-black tabular-nums" style={{ color: "var(--fin-text)" }}>
        {valor}
      </div>
      <div className="text-[10px] font-extrabold tracking-wide" style={{ color: "var(--fin-dim)" }}>
        {rotulo}
      </div>
    </div>
  )
}

export default async function OfensivaPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const historico = await lerHistoricoOfensiva(session.user.id)
  const hoje = diaDeHoje().toISOString().slice(0, 10)

  const { atual, recorde, total, ateProximoPremio, premios, hoje: usouHoje } = historico
  const noRecorde = atual > 0 && atual >= recorde

  return (
    <main className="tema-fin min-h-dvh pb-24 lg:pl-56" style={{ background: "var(--fin-bg)" }}>
      <div className="mx-auto w-full max-w-md px-5 py-6">
        <Link href="/trilha" className="text-sm font-extrabold" style={{ color: "var(--fin-accent)" }}>
          ← Trilha
        </Link>

        {/* herói: a chama grande */}
        <div className="mt-5 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={POSE.streak} alt="" className="size-24 object-contain" />
          <div className="mt-2 flex items-center gap-2">
            <Flame className="size-9" style={{ color: "var(--fin-combo)" }} aria-hidden="true" />
            <span className="text-6xl font-black tabular-nums leading-none" style={{ color: "var(--fin-text)" }}>
              {atual}
            </span>
          </div>
          <p className="mt-2 text-[15px] font-black" style={{ color: "var(--fin-text)" }}>
            {atual === 0
              ? "Sua chama está apagada"
              : `${atual} ${atual === 1 ? "dia seguido" : "dias seguidos"}`}
          </p>
          <p className="mt-1 text-[12.5px] font-semibold" style={{ color: "var(--fin-muted)" }}>
            {atual === 0
              ? "Complete uma lição hoje para acender."
              : usouHoje
                ? "Já garantiu o dia de hoje. Manda ver!"
                : "Você ainda não estudou hoje. Não perca a sequência!"}
          </p>
        </div>

        {/* números */}
        <div className="mt-6 grid grid-cols-3 gap-2.5">
          <Tile icone={Trophy} cor="var(--fin-accent)" valor={String(recorde)} rotulo="RECORDE" />
          <Tile icone={CalendarDays} cor="var(--fin-acerto)" valor={String(total)} rotulo="DIAS ATIVOS" />
          <Tile
            icone={Gift}
            cor="var(--fin-combo)"
            valor={`${ateProximoPremio}d`}
            rotulo="PRÓX. PRÊMIO"
          />
        </div>

        {/* prêmio da semana */}
        <div
          className="mt-3 flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{ background: "var(--fin-surface)" }}
        >
          <span
            className="grid size-10 shrink-0 place-items-center rounded-full"
            style={{ background: "color-mix(in srgb, var(--fin-combo) 22%, transparent)" }}
          >
            <Gift className="size-5" style={{ color: "var(--fin-combo)" }} />
          </span>
          <p className="text-[12.5px] leading-snug" style={{ color: "var(--fin-muted)" }}>
            A cada <strong style={{ color: "var(--fin-text)" }}>7 dias seguidos</strong> você ganha um prêmio.
            {premios > 0 ? (
              <>
                {" "}
                Já foram{" "}
                <strong style={{ color: "var(--fin-text)" }}>
                  {premios} {premios === 1 ? "prêmio" : "prêmios"}
                </strong>{" "}
                nessa sequência, faltam {ateProximoPremio} para o próximo.
              </>
            ) : (
              <>
                {" "}
                Faltam <strong style={{ color: "var(--fin-text)" }}>{ateProximoPremio} dias</strong> para o
                primeiro.
              </>
            )}
          </p>
        </div>

        {/* histórico */}
        <div className="mt-6 flex items-baseline justify-between">
          <h2 className="text-[15px] font-black" style={{ color: "var(--fin-text)" }}>
            Histórico
          </h2>
          <span className="text-[11px] font-bold" style={{ color: "var(--fin-dim)" }}>
            últimos meses
          </span>
        </div>
        <div className="mt-3 overflow-x-auto rounded-2xl px-4 py-4" style={{ background: "var(--fin-surface)" }}>
          <OfensivaCalendario chaves={historico.chaves} hoje={hoje} />
          <div className="mt-3 flex items-center gap-3 text-[10px] font-bold" style={{ color: "var(--fin-dim)" }}>
            <span className="flex items-center gap-1.5">
              <span className="size-[11px] rounded-[3px]" style={{ background: "var(--fin-combo)" }} />
              Dia ativo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-[11px] rounded-[3px]" style={{ background: "var(--fin-border)" }} />
              Sem uso
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="size-[11px] rounded-[3px]"
                style={{ boxShadow: "inset 0 0 0 1.5px var(--fin-accent)" }}
              />
              Hoje
            </span>
          </div>
        </div>

        {/* dica do Fin */}
        <div
          className="mt-5 flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{ background: "var(--fin-surface)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={noRecorde ? POSE.flex : POSE.determined} alt="" className="size-11 shrink-0 object-contain" />
          <p className="text-[12.5px] leading-snug" style={{ color: "var(--fin-muted)" }}>
            {recorde === 0 ? (
              <>Sua primeira chama acende na primeira lição. Bora?</>
            ) : noRecorde && recorde > 1 ? (
              <>
                Você está no seu recorde de{" "}
                <strong style={{ color: "var(--fin-text)" }}>{recorde} dias</strong> agora mesmo. Segura firme!
              </>
            ) : (
              <>
                Seu recorde é de{" "}
                <strong style={{ color: "var(--fin-text)" }}>
                  {recorde} {recorde === 1 ? "dia" : "dias"}
                </strong>
                . Que tal quebrar essa marca?
              </>
            )}
          </p>
        </div>
      </div>
      <BottomNav />
    </main>
  )
}
