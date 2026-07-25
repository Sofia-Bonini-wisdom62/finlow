import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import { metricasPerfil, type TransacaoCalc, type MetricasPerfil } from "@/lib/financas"

export const dynamic = "force-dynamic"

// Dificuldade e duração derivam da posição e do tamanho do módulo —
// não há campo próprio no banco (e não precisa ter: são funções do conteúdo).
function dificuldade(ordem: number): string {
  if (ordem <= 1) return "Iniciante"
  if (ordem <= 3) return "Intermediário"
  return "Avançado"
}

function duracao(telas: number): string {
  const min = Math.max(2, Math.round((telas * 20) / 60))
  return `${telas} telas · ~${min} min`
}

// Ordem de recomendação: cada sinal financeiro fraco puxa os módulos que o
// endereçam. Percorre os sinais do mais urgente ao menos e monta a sequência
// cruzando os quatro perfis (o usuário não fica preso a uma trilha só).
function slugsRecomendados(m: MetricasPerfil): string[] {
  const seq: string[] = []
  const add = (...s: string[]) => s.forEach((x) => { if (!seq.includes(x)) seq.push(x) })

  // Sem histórico: começa pelo básico de consciência de fluxo
  if (m.mesesComDados === 0) {
    add("lancador-m1-fluxo", "lancador-m2-respiro", "sonhador-m1-sonho-prazo",
        "impulsivo-m1-gatilho", "guardador-m3-investir")
    return seq
  }

  // 1. Gasta mais do que entra → enxergar o fluxo e inverter a ordem
  if (m.controleOrcamentario < 70) add("lancador-m1-fluxo", "lancador-m2-respiro")

  // 2. Sobra pouco → separar antes de gastar, freio nos gastos grandes
  if (m.taxaEconomia < 15) add("lancador-m2-respiro", "lancador-m4-freio")

  // 3. Reserva curta → destino pro que sobra e primeiro passo
  if (m.reservaEmergencia < 3) add("lancador-m3-meta-ancora", "sonhador-m2-passo-minimo")

  // 4. Irregular → gatilho e pausa (padrão emocional) + ritual de revisão
  if (m.consistencia < 60) add("impulsivo-m1-gatilho", "impulsivo-m2-pausa", "sonhador-m4-revisao")

  // 5. Base sólida → fazer o dinheiro render e gastar sem culpa
  if (m.reservaEmergencia >= 3 && m.taxaEconomia >= 15) {
    add("guardador-m3-investir", "guardador-m2-valor-livre", "guardador-m4-prazer")
  }

  // Completa até 5 com o arco de metas
  add("sonhador-m1-sonho-prazo", "sonhador-m3-realidade", "impulsivo-m4-lista")
  return seq.slice(0, 5)
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
        dificuldade: dificuldade(m.ordem),
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
    const transacoes = await db.transacao.findMany({
      where: { userId },
      select: { valor: true, tipo: true, data: true },
    })
    const calc: TransacaoCalc[] = transacoes.map((t) => ({
      valor: t.valor.toString(),
      tipo: t.tipo,
      data: t.data,
    }))
    const met = metricasPerfil(calc)

    const porSlug = new Map(modulos.map((m) => [m.slug, m]))
    const recomendados = slugsRecomendados(met)
      .map((s) => porSlug.get(s))
      .filter((m): m is (typeof modulos)[number] => m !== undefined)
      .map(enriquecer)

    return NextResponse.json({ recomendados })
  } catch (e) {
    console.error("[modulos]", e)
    return NextResponse.json({ error: "Erro ao carregar módulos" }, { status: 500 })
  }
}
