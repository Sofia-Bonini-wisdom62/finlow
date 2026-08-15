import Link from "next/link"
import { ArrowLeft, Check, Lock } from "lucide-react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  filtroExploravel,
  ehDeOutroPublico,
  publicoDoUsuario,
  SEGMENTOS_ESCOLARES,
  PUBLICO_ATUAL,
  type Publico,
} from "@/lib/publico"
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

interface AulaCard {
  id: string
  slug: string
  titulo: string
  subtitulo: string
  publico: string
  duracaoMin: number
  _count: { telas: number }
}

/**
 * Uma seção da biblioteca.
 *
 * O ESTADO DE UMA AULA ESCOLAR NÃO VEM DO CORREDOR, e não é omissão: o corredor
 * é a ordem que a IA montou PARA a pessoa, e ela não montou nada sobre o 4º ano.
 * Aula de outro público simplesmente não está no mapa — se eu lesse o corredor
 * para ela, o `undefined` cairia em "trancado" e a biblioteca mostraria 107
 * cadeados que nada destrava. Por isso o público decide antes: escolar é sempre
 * abrível, na lição que a pessoa quiser.
 *
 * `podeAbrir` (lib/corredor.ts) tem exatamente a mesma regra do outro lado —
 * são as duas metades da mesma decisão, e divergir aqui produziria um card que
 * abre e uma rota que recusa.
 */
function Secao({
  titulo,
  aulas,
  corredor,
  publico,
}: {
  titulo: string
  aulas: AulaCard[]
  corredor: Awaited<ReturnType<typeof montarCorredor>>
  /** O público da PESSOA — decide o que é "de outra trilha" para ela. */
  publico: Publico
}) {
  return (
    <section className="mb-8">
      <h2
        className="mb-3 text-[11px] font-bold uppercase tracking-wider"
        style={{ color: "var(--finlow-muted)" }}
      >
        {titulo}
      </h2>
      <ul className="flex flex-col gap-2">
        {aulas.map((m) => {
          const deOutraTrilha = ehDeOutroPublico(m.publico, publico)
          const no = corredor.modulos.get(m.id)
          const estado = deOutraTrilha ? "liberado" : no?.estado ?? "trancado"
          const trancado = estado === "trancado"
          const concluido = estado === "concluido"

          // Protótipo v2: a aula liberada tem borda e anel dourados — é a que
          // chama pro toque. Concluída fica verde, trancada apaga.
          const estilo = {
            border: trancado || concluido
              ? "1.5px solid var(--finlow-surface-2)"
              : "1.5px solid color-mix(in srgb, var(--finlow-accent) 40%, transparent)",
            background: "var(--finlow-surface)",
            borderRadius: "var(--finlow-radius)",
            opacity: trancado ? 0.62 : 1,
          }

          const conteudo = (
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full"
                style={
                  concluido
                    ? { background: "var(--fin-acerto, var(--finlow-accent))", color: "var(--finlow-bg)" }
                    : trancado
                      ? { background: "var(--finlow-surface-2)", color: "var(--finlow-muted)" }
                      : { border: "2.5px solid var(--finlow-accent)" }
                }
              >
                {concluido ? <Check size={14} /> : trancado ? <Lock size={12} /> : null}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="text-[15px] font-semibold leading-snug"
                  style={{
                    color: trancado ? "var(--finlow-locked-text)" : "var(--finlow-text)",
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
                <p className="mt-1.5 text-[11px]" style={{ color: "var(--finlow-muted)" }}>
                  {m._count.telas} telas · ~{m.duracaoMin} min
                  {!deOutraTrilha && no && no.licoesTotal > 0 && !trancado
                    ? ` · ${no.licoesConcluidas}/${no.licoesTotal} lições`
                    : ""}
                </p>
                {trancado && no?.bloqueio && (
                  <p className="mt-1.5 text-[12px]" style={{ color: "var(--finlow-warn)" }}>
                    {no.bloqueio}
                  </p>
                )}
              </div>
            </div>
          )

          // Trancado NÃO é link: um cadeado clicável que leva a um 403 é pior
          // que um cadeado. Quem quiser adiantar a aula fala no Chat, que é o
          // caminho que o produto oferece para isso.
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
  )
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

  const publico = await publicoDoUsuario(userId)
  const [modulos, corredor] = await Promise.all([
    db.modulo.findMany({
      where: filtroExploravel(),
      select: {
        id: true,
        slug: true,
        titulo: true,
        subtitulo: true,
        blocoRotulo: true,
        nivel: true,
        publico: true,
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
  const daPessoa = modulos.filter((m) => !ehDeOutroPublico(m.publico, publico))
  const deOutras = modulos.filter((m) => ehDeOutroPublico(m.publico, publico))

  const grupos = new Map<string, typeof modulos>()
  for (const m of daPessoa) {
    const chave = m.blocoRotulo ?? NOME_NIVEL[m.nivel] ?? m.nivel
    grupos.set(chave, [...(grupos.get(chave) ?? []), m])
  }

  /**
   * As aulas de FORA da trilha da pessoa, agrupadas na ordem dos segmentos.
   *
   * Para o adulto são os cinco segmentos escolares. Para o aluno de escola, a
   * trilha ADULTA entra como primeiro grupo — sem isso as 43 aulas adultas
   * sumiriam da biblioteca dele, que é o bug espelhado do que o gate evita.
   */
  const porSegmento = [
    ...(publico === PUBLICO_ATUAL ? [] : [{ id: "adulto" as const, nome: "Trilha adulta" }]),
    ...SEGMENTOS_ESCOLARES.filter((s) => s.id !== publico),
  ]
    .map((s) => ({ ...s, aulas: deOutras.filter((m) => m.publico === s.id) }))
    .filter((s) => s.aulas.length > 0)

  const concluidos = daPessoa.filter(
    (m) => corredor.modulos.get(m.id)?.estado === "concluido"
  ).length

  return (
    // `tema-fin` aqui porque a rota vive FORA do grupo (app): sem o escopo, os
    // --finlow-* abaixo resolveriam para a paleta antiga da trilha.
    <main
      className="tema-fin min-h-dvh pb-24 lg:pl-56"
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
          {publico === PUBLICO_ATUAL
            ? "Tudo que existe na trilha. As aulas que ainda não abriram aparecem com o motivo — a ordem quem monta é a IA, a partir dos seus números."
            : "Tudo que existe na sua trilha, na ordem da turma, bloco a bloco. As aulas que ainda não abriram aparecem com o motivo."}
        </p>

        {[...grupos].map(([titulo, doGrupo]) => (
          <Secao key={titulo} titulo={titulo} aulas={doGrupo} corredor={corredor} publico={publico} />
        ))}

        {porSegmento.length > 0 && (
          <div
            className="mt-10 border-t pt-8"
            style={{ borderColor: "var(--finlow-surface-2)" }}
          >
            <h2 className="text-[15px] font-bold">
              {publico === PUBLICO_ATUAL ? "Trilha escolar" : "Outras trilhas"}
            </h2>
            <p
              className="mt-1.5 mb-6 text-[13px] leading-relaxed text-pretty"
              style={{ color: "var(--finlow-muted)" }}
            >
              {publico === PUBLICO_ATUAL
                ? "Do 1º ano do fundamental ao Ensino Médio, cobrindo a matriz de letramento financeiro do Banco Central. Você pode fazer qualquer uma, na ordem que quiser — elas não entram no seu caminho e valem menos pontos, porque o percurso que a IA montou para você continua sendo o da sua trilha."
                : "Aulas de fora da sua trilha. Você pode explorar qualquer uma, na ordem que quiser — elas valem menos pontos, porque o seu caminho continua sendo o da turma."}
            </p>
            {porSegmento.map((s) => (
              <Secao key={s.id} titulo={s.nome} aulas={s.aulas} corredor={corredor} publico={publico} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
