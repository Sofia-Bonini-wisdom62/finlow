import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"

export const dynamic = "force-dynamic"

/**
 * Serve a foto/banner DO PRÓPRIO usuário logado.
 *
 * Não existe rota pública nem por id de outra pessoa, de propósito (decisão
 * LGPD do backlog, 14/08): até haver moderação e decisão registrada, ninguém
 * vê a imagem de ninguém — nem colega de turma, nem professor. O <img> das
 * telas aponta pra cá e a sessão resolve de quem é.
 *
 * Cache privado e curto: o navegador segura um pouco, mas troca de imagem
 * aparece rápido — as telas ainda somam ?v= na URL para furar na hora.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tipo: string }> }
) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const { tipo } = await params
  if (tipo !== "foto" && tipo !== "banner") {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
  }

  const linha = await db.imagemUsuario.findUnique({
    where: { userId_tipo: { userId, tipo } },
    select: { dados: true },
  })
  if (!linha) return NextResponse.json({ error: "Sem imagem" }, { status: 404 })

  const virgula = linha.dados.indexOf(",")
  const mime = linha.dados.slice(5, linha.dados.indexOf(";"))
  const bytes = Buffer.from(linha.dados.slice(virgula + 1), "base64")

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "private, max-age=60",
    },
  })
}
