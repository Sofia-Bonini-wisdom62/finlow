import Link from "next/link"
import { ArrowLeft, Check, Lock } from "lucide-react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { filtroDeModulo } from "@/lib/publico"
import { montarCorredor } from "@/lib/corredor"
import { BottomNav } from "@/components/bottom-nav"

/**
 * Biblioteca: tudo que existe na trilha, incluindo o que ainda não abriu.
 *
 * POR QUE ELA VÊ MAS NÃO ABRE
 * A Trilha virou corredor de propósito, e a busca saiu de lá com um argumento
 * registrado: "achar uma aula trancada e não poder abri-la é pior do que não
 * achar". Esta página não desfaz isso — ela responde a uma pergunta diferente.
 * Quem toca em "Explorar biblioteca" não está procurando uma aula específica e
 * esbarrando numa trava; está querendo ver o tamanho do caminho. Mostrar o
 * mapa inteiro a quem PEDIU o mapa é outra conversa, e por isso módulo
 * trancado aqui aparece com o motivo, sem virar link.
 *
 * O estado vem de `montarCorredor`, o MESMO que desenha a Trilha. Recalcular a
 * trava aqui criaria duas fontes para a mesma pergunta, e no dia em que
 * divergissem a biblioteca ofereceria uma aula que o corredor recusa — ou o
 * contrário, que é pior: aula aberta na trilha e cadeado na biblioteca.
 *
 * A rota é `/trilha/biblioteca`, e o segmento estático ganha do dinâmico
 * `/trilha/[moduloId]` no Next. Só passaria a ser problema se existisse um
 * módulo de slug "biblioteca" — não existe, e o nome dos slugs (prefixo de
 * segmento ou de perfil) torna isso improvável.
 */
export const dynamic = "force-dynamic"

/** Rótulo do agrupamento. Bloco quando a trilha tem; nível quando não. */
const NOME_NIVEL: Record<string, string> = {
  iniciante: "Começando",
  intermediario: "Intermediário",
  avancado: "Avançado",
}

export default async function BibliotecaPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-fl-page px-6 text-center">
        <p className="text-fl-ink-2">Entra na sua conta pra ver a biblioteca.</p>
        <Link
          href="/login"
          className="rounded-full bg-fl-500 px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Entrar
        </Link>
      </main>
    )
  }

  const [modulos, corredor] = await Promise.all([
    db.modulo.findMany({
      where: filtroDeModulo(),
      select: {
        id: true,
        slug: true,
        titulo: true,
        subtitulo: true,
        blocoRotulo: true,
        nivel: true,
        duracaoMin: true,
        ordem: true,
        _count: { select: { telas: true } },
      },
      orderBy: [{ ordem: "asc" }],
    }),
    montarCorredor(userId),
  ])

  /**
   * Agrupamento por bloco, com o nível de reserva.
   *
   * As trilhas escolares vêm em blocos temáticos ("Bloco F · Renda e
   * empreendedorismo"); as 43 aulas adultas têm `blocoRotulo` nulo e se
   * organizam por nível. Um único agrupador serve aos dois sem precisar saber
   * qual público está no ar.
   */
  const grupos = new Map<string, typeof modulos>()
  for (const m of modulos) {
    const chave = m.blocoRotulo ?? NOME_NIVEL[m.nivel] ?? m.nivel
    grupos.set(chave, [...(grupos.get(chave) ?? []), m])
  }

  const concluidos = modulos.filter(
    (m) => corredor.modulos.get(m.id)?.estado === "concluido"
  ).length

  return (
    <main
      className="min-h-dvh pb-24 lg:pl-56"
      style={{ background: "var(--finlow-bg)", color: "var(--finlow-text)" }}
    >
      <header
        className="sticky top-0 z-10 border-b px-5 py-4 backdrop-blur-md"
        style={{
          borderColor: "var(--finlow-surface-2)",
          background: "color-mix(in srgb, var(--finlow-bg) 82%, transparent)",
        }}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link
            href="/trilha"
            aria-label="Voltar para a trilha"
            className="flex size-9 shrink-0 items-center justify-center rounded-full"
            style={{ border: "1px solid var(--finlow-surface-2)" }}
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-[17px] font-bold leading-tight">Biblioteca</h1>
            <p className="text-[13px]" style={{ color: "var(--finlow-muted)" }}>
              {modulos.length} aulas · {concluidos} concluída{concluidos === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-6">
        <p
          className="mb-6 text-[13px] leading-relaxed text-pretty"
          style={{ color: "var(--finlow-muted)" }}
        >
          Tudo que existe na trilha. As aulas que ainda não abriram aparecem com
          o motivo — a ordem quem monta é a IA, a partir dos seus números.
        </p>

        {[...grupos].map(([titulo, doGrupo]) => (
          <section key={titulo} className="mb-8">
            <h2
              className="mb-3 text-[11px] font-bold uppercase tracking-wider"
              style={{ color: "var(--finlow-muted)" }}
            >
              {titulo}
            </h2>
            <ul className="flex flex-col gap-2">
              {doGrupo.map((m) => {
                const no = corredor.modulos.get(m.id)
                const estado = no?.estado ?? "trancado"
                const trancado = estado === "trancado"
                const concluido = estado === "concluido"

                const conteudo = (
                  <>
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: concluido
                            ? "var(--finlow-accent)"
                            : "var(--finlow-surface-2)",
                          color: concluido ? "var(--finlow-bg)" : "var(--finlow-muted)",
                        }}
                      >
                        {concluido ? <Check size={14} /> : trancado ? <Lock size={12} /> : null}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-[15px] font-semibold leading-snug"
                          style={{
                            color: trancado
                              ? "var(--finlow-locked-text)"
                              : "var(--finlow-text)",
                          }}
                        >
                          {m.titulo}
                        </p>
                        <p
                          className="mt-0.5 text-[13px] leading-snug text-pretty"
                          style={{ color: "var(--finlow-muted)" }}
                        >
                          {m.subtitulo}
                        </p>
                        <p
                          className="mt-1.5 text-[11px]"
                          style={{ color: "var(--finlow-muted)" }}
                        >
                          {m._count.telas} telas · ~{m.duracaoMin} min
                          {no && no.licoesTotal > 0 && !trancado
                            ? ` · ${no.licoesConcluidas}/${no.licoesTotal} lições`
                            : ""}
                        </p>
                        {trancado && no?.bloqueio && (
                          <p
                            className="mt-1.5 text-[12px]"
                            style={{ color: "var(--finlow-warn)" }}
                          >
                            {no.bloqueio}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )

                const estilo = {
                  border: "1px solid var(--finlow-surface-2)",
                  background: "var(--finlow-surface)",
                  borderRadius: "var(--finlow-radius)",
                  opacity: trancado ? 0.62 : 1,
                }

                // Trancado NÃO é link: um cadeado clicável que leva a um 403 é
                // pior que um cadeado. Quem quiser adiantar a aula fala no Chat,
                // que é o caminho que o produto oferece para isso.
                return (
                  <li key={m.id}>
                    {trancado ? (
                      <div className="block p-3.5" style={estilo} aria-disabled="true">
                        {conteudo}
                      </div>
                    ) : (
                      <Link
                        href={`/trilha/${m.slug}`}
                        className="block p-3.5 transition-opacity hover:opacity-80"
                        style={estilo}
                      >
                        {conteudo}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>

      <BottomNav />
    </main>
  )
}
