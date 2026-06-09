export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { calcularPerfil } from "@/lib/perfis"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { respostas } = await req.json()

    if (!Array.isArray(respostas) || respostas.length !== 4) {
      return NextResponse.json({ error: "Respostas inválidas" }, { status: 400 })
    }

    const tipo = calcularPerfil(respostas)

    // Tenta salvar no banco — se falhar (ex: sem conexão), retorna o perfil mesmo assim
    try {
      await db.perfil.create({
        data: {
          tipo,
          respostas: respostas,
          user: {
            create: {
              email: `anonimo_${Date.now()}@finlow.temp`,
            },
          },
        },
      })
    } catch (dbError) {
      console.warn("[diagnostico] banco indisponível, continuando sem salvar:", dbError)
    }

    return NextResponse.json({ tipo })
  } catch (error) {
    console.error("[diagnostico]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
