import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import { filtroDeModulo } from "@/lib/publico"

export const dynamic = "force-dynamic"

/**
 * GET /api/trilha — os módulos do arco de quem está logado.
 *
 * Dois parâmetros de URL saíram daqui, e nenhum era detalhe:
 *
 *  - `?userId=` valia como "sessão anônima". Passando o id de outra pessoa,
 *    vinha o progresso dela junto. Nenhuma tela mandava — era resto da era
 *    pré-login que ninguém tinha fechado.
 *  - `?tipoPerfil=` deixava o cliente escolher o arco. Quem mandava era um
 *    valor guardado no `localStorage` do navegador, não a conta — então bastava
 *    trocar de conta no mesmo navegador para a tela ler o perfil da anterior.
 *    O perfil vive no banco (`Perfil.tipo`, escrito pelo onboarding); é de lá
 *    que ele sai agora.
 */
export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const perfil = await db.perfil.findUnique({
      where: { userId },
      select: { tipo: true },
    })

    // Sem onboarding concluído não há arco: lista vazia é a resposta honesta.
    // A tela que consome isto some sozinha quando não vem módulo.
    if (!perfil) return NextResponse.json({ modulos: [] })

    const modulos = await db.modulo.findMany({
      where: { tipoPerfil: perfil.tipo, ...filtroDeModulo() },
      orderBy: { ordem: "asc" },
      include: { progresso: { where: { userId } } },
    })

    return NextResponse.json({ modulos })
  } catch (e) {
    console.error("[trilha GET]", e)
    return NextResponse.json({ modulos: [], error: String(e) })
  }
}
