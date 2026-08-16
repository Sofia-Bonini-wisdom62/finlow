import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"

export const dynamic = "force-dynamic"

/**
 * Foto de perfil e banner — escrita e remoção.
 *
 * O corte e a compressão acontecem no CLIENTE (canvas, antes do POST); aqui o
 * servidor só confere o contrato e recusa o que passar do teto. O teto não é
 * frescura: a imagem mora no banco (ver o comentário do modelo), e sem ele um
 * PNG de 12 MB viraria linha de tabela.
 *
 * Sem consentimento do Painel de propósito: foto não é dado financeiro — a
 * regra R8 não alcança aqui. O que vale é a decisão LGPD do backlog: a imagem
 * é visível SÓ para o dono (o GET em [tipo] exige a sessão dele).
 */

export const TIPOS_IMAGEM = ["foto", "banner"] as const

// data URI de jpeg/png/webp, e nada além. SVG fica FORA de propósito:
// é XML executável (scripts, fetch externo) com cara de imagem.
const FORMATO = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/

/** Teto em caracteres do data URI (~72% disso em bytes reais).
 *  256² jpeg cabe folgado em 400k; 1280×512 jpeg em 1,2M. */
const TETO: Record<string, number> = { foto: 400_000, banner: 1_200_000 }

export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const corpo = await req.json()
    const tipo = String(corpo?.tipo ?? "")
    const dados = typeof corpo?.dados === "string" ? corpo.dados : ""

    if (!(TIPOS_IMAGEM as readonly string[]).includes(tipo)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
    }
    if (dados.length > TETO[tipo]) {
      return NextResponse.json(
        { error: "Imagem grande demais mesmo depois da compressão. Tenta outra?" },
        { status: 413 }
      )
    }
    if (!FORMATO.test(dados)) {
      return NextResponse.json({ error: "Formato inválido: só JPEG, PNG ou WebP" }, { status: 400 })
    }

    await db.imagemUsuario.upsert({
      where: { userId_tipo: { userId, tipo } },
      create: { userId, tipo, dados },
      update: { dados },
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[imagem POST]", (e as Error)?.message)
    return NextResponse.json({ error: "Erro ao salvar a imagem" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const tipo = new URL(req.url).searchParams.get("tipo") ?? ""
  if (!(TIPOS_IMAGEM as readonly string[]).includes(tipo)) {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
  }

  await db.imagemUsuario.deleteMany({ where: { userId, tipo } })
  return NextResponse.json({ ok: true })
}
