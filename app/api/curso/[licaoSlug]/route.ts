import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * GET /api/curso/[licaoSlug]
 *
 * Serve UMA lição do curso v2 ao player: a `LicaoCurso`, o conceito dela
 * (nome e a frase que fecha o encontro 1) e a FILA de itens, na ordem.
 *
 * A reserva NUNCA sai daqui. Os 3 itens `reserva: true` de cada lição
 * existem só para a revisão espaçada (arquitetura §6.2): entregá-los ao
 * player faria a revisão devolver pergunta já vista e virar teatro. Item
 * `ativo: false` (distrator morto, §10) também fica de fora.
 *
 * Sem sessão o conteúdo é servido do mesmo jeito: é currículo, não dado da
 * pessoa, e a regra é a mesma de `GET /api/trilha/[moduloId]`. O que é da
 * pessoa (progresso, caixas de Leitner) ainda não existe para o curso v2 —
 * `docs/backlog-curso-v2.md`, itens 2 e 4.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ licaoSlug: string }> }) {
  try {
    const { licaoSlug } = await params
    const licao = await db.licaoCurso.findUnique({
      where: { slug: licaoSlug },
      select: {
        id: true,
        slug: true,
        titulo: true,
        segmento: true,
        encontro: true,
        tipoEncontro: true,
        conceito: { select: { slug: true, nome: true, frase: true } },
        itens: {
          where: { reserva: false, ativo: true },
          orderBy: { ordem: "asc" },
          select: { id: true, ordem: true, papel: true, formato: true, conteudo: true },
        },
      },
    })
    if (!licao) return NextResponse.json({ error: "Lição não encontrada" }, { status: 404 })
    if (licao.itens.length === 0) return NextResponse.json({ error: "Lição sem itens" }, { status: 404 })
    return NextResponse.json(licao)
  } catch (e) {
    console.error("[curso/[licaoSlug] GET]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
