import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import {
  listarMemorias,
  guardarMemorias,
  apagarMemoria,
  apagarTudo,
  memoriaLigada,
  TIPOS_MEMORIA,
  type TipoMemoria,
} from "@/lib/memoria-repo"

export const dynamic = "force-dynamic"

/**
 * Controle da memória do assistente.
 *
 * Tudo que o assistente guarda tem que ser legível e apagável por quem é dono
 * do dado — é o mínimo para uma memória que grava sozinha. Sem esta rota, a
 * feature seria um arquivo secreto sobre a pessoa dentro do próprio app dela.
 */

// GET — estado e conteúdo
export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const [ligada, memorias] = await Promise.all([memoriaLigada(userId), listarMemorias(userId)])
  return NextResponse.json({
    ligada,
    memorias: memorias.map((m) => ({
      id: m.id,
      tipo: m.tipo,
      conteudo: m.conteudo,
      origem: m.origem,
      criadoEm: m.criadoEm,
    })),
  })
}

// PATCH — liga ou desliga
export async function PATCH(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const { ligada } = await req.json()
    if (typeof ligada !== "boolean") {
      return NextResponse.json({ codigo: "PEDIDO_INVALIDO", erro: "Envie 'ligada' como true ou false." }, { status: 400 })
    }
    await db.user.update({ where: { id: userId }, data: { memoriaAtiva: ligada } })

    // Desligar NÃO apaga: a pessoa pode querer pausar sem perder o que já
    // ensinou. Apagar é uma ação separada e explícita, com botão próprio.
    return NextResponse.json({ ligada })
  } catch (e) {
    console.error("[memoria] PATCH", (e as Error)?.message)
    return NextResponse.json({ codigo: "INDISPONIVEL", erro: "Não consegui salvar agora." }, { status: 503 })
  }
}

// POST — a pessoa escreve uma memória à mão
export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const { tipo, conteudo } = await req.json()
    if (!TIPOS_MEMORIA.includes(tipo) || typeof conteudo !== "string" || conteudo.trim().length < 8) {
      return NextResponse.json(
        { codigo: "PEDIDO_INVALIDO", erro: "Escreve uma frase um pouco maior e escolhe um tipo." },
        { status: 400 }
      )
    }
    const criadas = await guardarMemorias(userId, [
      { tipo: tipo as TipoMemoria, conteudo, origem: "usuario" },
    ])
    if (criadas.length === 0) {
      return NextResponse.json({ codigo: "JA_EXISTE", erro: "Isso já está na memória." }, { status: 409 })
    }
    return NextResponse.json({ memoria: criadas[0] })
  } catch (e) {
    console.error("[memoria] POST", (e as Error)?.message)
    return NextResponse.json({ codigo: "INDISPONIVEL", erro: "Não consegui salvar agora." }, { status: 503 })
  }
}

// DELETE — ?id=xxx apaga uma; ?tudo=1 apaga todas
export async function DELETE(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const { searchParams } = new URL(req.url)

  try {
    if (searchParams.get("tudo") === "1") {
      return NextResponse.json({ apagadas: await apagarTudo(userId) })
    }
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ codigo: "PEDIDO_INVALIDO", erro: "Falta o id." }, { status: 400 })
    }
    const ok = await apagarMemoria(userId, id)
    return NextResponse.json({ apagadas: ok ? 1 : 0 })
  } catch (e) {
    console.error("[memoria] DELETE", (e as Error)?.message)
    return NextResponse.json({ codigo: "INDISPONIVEL", erro: "Não consegui apagar agora." }, { status: 503 })
  }
}
