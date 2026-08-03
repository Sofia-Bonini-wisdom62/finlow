import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { carregarIndicadores, interpolarIndicadores } from "@/lib/indicadores"

export const dynamic = "force-dynamic"

// GET /api/trilha/[moduloId]?userId=xxx
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ moduloId: string }> }
) {
  try {
    const { moduloId } = await params
    const { searchParams } = new URL(req.url)
    // sessão NextAuth tem prioridade; query param é o fallback anônimo
    const session = await auth()
    const userId = session?.user?.id ?? searchParams.get("userId")

    // aceita id (cuid) ou slug — os cards do Perfil linkam por slug
    const modulo = await db.modulo.findFirst({
      where: { OR: [{ id: moduloId }, { slug: moduloId }] },
      include: {
        telas: { orderBy: { ordem: "asc" } },
        ...(userId ? { progresso: { where: { userId } } } : {}),
      },
    })

    if (!modulo) return NextResponse.json({ error: "Módulo não encontrado" }, { status: 404 })

    /**
     * O dado macro entra AQUI, não no conteúdo gravado.
     *
     * O módulo escreve `{{rotativo_medio}}` e a troca acontece na hora de
     * exibir. Quando o Banco Central publicar taxa nova, é UPDATE numa linha,
     * não reescrever aula.
     *
     * Os números vão junto em `indicadores` porque a fórmula da tela de
     * resultado roda no navegador e precisa calcular com eles — sem isso a
     * taxa ficaria cravada no código do cálculo, que é o mesmo problema uma
     * camada abaixo.
     */
    const indicadores = await carregarIndicadores()
    const telas = modulo.telas.map((t) => ({
      ...t,
      conteudo: JSON.parse(
        interpolarIndicadores(JSON.stringify(t.conteudo), indicadores)
      ),
    }))

    const numeros: Record<string, number> = {}
    for (const [chave, i] of indicadores) if (i.numero !== null) numeros[chave] = i.numero

    return NextResponse.json({ modulo: { ...modulo, telas }, indicadores: numeros })
  } catch (e) {
    console.error("[trilha/[moduloId] GET]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
