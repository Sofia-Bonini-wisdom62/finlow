import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import { garantirLevaInicial, levaAtiva, TAMANHO_DA_LEVA } from "@/lib/recomendacao"
import { aulasParaSituacao } from "@/lib/posicionar-trilha"
import { filtroDeModulo } from "@/lib/publico"

export const dynamic = "force-dynamic"

/**
 * A dificuldade vem do campo `nivel`, não mais da posição na fila.
 *
 * Derivar da `ordem` era o resto do modelo de corredor: numa biblioteca, ser a
 * quarta aula de uma trilha não torna nada avançado. E dava contradição visível
 * — "O freio de 24 horas" é ordem 4 e aparecia como Avançado sendo iniciante.
 */
const ROTULO_NIVEL: Record<string, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
}

function dificuldade(nivel: string): string {
  return ROTULO_NIVEL[nivel] ?? "Iniciante"
}

function duracao(telas: number): string {
  const min = Math.max(2, Math.round((telas * 20) / 60))
  return `${telas} telas · ~${min} min`
}

// GET /api/modulos            → trilha recomendada
// GET /api/modulos?q=termo    → busca no banco completo
export async function GET(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().toLowerCase()

  try {
    const [modulos, progresso] = await Promise.all([
      db.modulo.findMany({
        where: filtroDeModulo(),
        include: { telas: { select: { conteudo: true } } },
        orderBy: [{ tipoPerfil: "asc" }, { ordem: "asc" }],
      }),
      db.progressoModulo.findMany({ where: { userId } }),
    ])

    const progressoPorModulo = new Map(progresso.map((p) => [p.moduloId, p]))

    const enriquecer = (m: (typeof modulos)[number]) => {
      const p = progressoPorModulo.get(m.id)
      const totalTelas = m.telas.length
      const pct = p?.concluido
        ? 100
        : totalTelas > 0
        ? Math.round((Math.min(p?.telaAtual ?? 0, totalTelas) / totalTelas) * 100)
        : 0
      return {
        id: m.id,
        slug: m.slug,
        titulo: m.titulo,
        // os subtítulos do seed começam com "2 minutos." — a duração agora tem
        // campo próprio no card, então o prefixo sai pra não repetir
        subtitulo: m.subtitulo.replace(/^\s*\d+\s*minutos?\.\s*/i, ""),
        dificuldade: dificuldade(m.nivel),
        duracao: duracao(totalTelas),
        progresso: pct,
        concluido: p?.concluido ?? false,
      }
    }

    // ---- busca ----
    if (q) {
      const termos = q.split(/\s+/).filter(Boolean)
      const resultados = modulos
        .map((m) => {
          // pesquisa em título, subtítulo e no conteúdo das telas
          const corpo = [
            m.titulo,
            m.subtitulo,
            m.slug,
            JSON.stringify(m.telas.map((t) => t.conteudo)),
          ]
            .join(" ")
            .toLowerCase()

          // pontua: título vale mais que corpo
          let score = 0
          for (const t of termos) {
            if (m.titulo.toLowerCase().includes(t)) score += 10
            if (m.subtitulo.toLowerCase().includes(t)) score += 5
            if (corpo.includes(t)) score += 1
          }
          return { modulo: m, score }
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => enriquecer(r.modulo))

      return NextResponse.json({ resultados, total: resultados.length })
    }

    // ---- trilha recomendada ----
    const porSlug = new Map(modulos.map((m) => [m.slug, m]))

    // A primeira leva é GRAVADA na primeira vez que a Trilha é aberta.
    //
    // Sem isso a recomendação seria recalculada a cada chamada, e não haveria
    // como saber se a leva fechou: a lista mudaria de tamanho junto com o
    // extrato da pessoa. Chamar de novo não duplica.
    await garantirLevaInicial(userId, await aulasParaSituacao(userId, TAMANHO_DA_LEVA))

    // Só a leva ATIVA. As levas fechadas saíram de cena — continuam em "Todos
    // os módulos", com o selo de concluída.
    const leva = await levaAtiva(userId)
    const daLeva = leva
      .map((r) => {
        const m = porSlug.get(r.slug)
        return m ? { ...enriquecer(m), motivo: r.motivo } : null
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)

    /**
     * A leva inteira fica à vista, concluída inclusive.
     *
     * Some tudo de uma vez quando a última é concluída, e aí outra de 4 entra.
     * Tirar uma a uma conforme são feitas transformaria o bloco numa esteira:
     * a lista encolheria sem explicar por quê, e o progresso — "faltam 2 de
     * 4" — deixaria de ser visível justamente para quem está avançando.
     */
    const recomendados = daLeva
    const concluidasDaLeva = daLeva.filter((m) => m.concluido).length

    // `todos` alimenta a seção "Todos os módulos" da Trilha. Vai na mesma
    // resposta de propósito: são 16 módulos já carregados e enriquecidos aqui;
    // uma segunda rota faria uma consulta idêntica para devolver o que já
    // estava em memória.
    const todos = modulos.map(enriquecer)

    return NextResponse.json({ recomendados, concluidasDaLeva, totalDaLeva: daLeva.length, todos })
  } catch (e) {
    console.error("[modulos]", e)
    return NextResponse.json({ error: "Erro ao carregar módulos" }, { status: 500 })
  }
}
