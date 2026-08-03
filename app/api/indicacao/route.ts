import { NextResponse } from "next/server"
import { getUserIdOr401 } from "@/lib/painel"
import { resumoIndicacoes } from "@/lib/indicacao"

export const dynamic = "force-dynamic"

// GET /api/indicacao — código, link pronto e contadores de quem está logado.
// Identidade dos indicados nunca sai daqui (ver lib/indicacao.ts).
export async function GET(req: Request) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const resumo = await resumoIndicacoes(userId)
    // NEXTAUTH_URL é a URL pública na Vercel; a origem do request cobre o dev.
    const base = (process.env.NEXTAUTH_URL ?? new URL(req.url).origin).replace(/\/$/, "")
    return NextResponse.json({ ...resumo, url: `${base}/r/${resumo.codigo}` })
  } catch (e) {
    console.error("[indicacao]", e)
    return NextResponse.json({ error: "Erro ao carregar" }, { status: 500 })
  }
}
