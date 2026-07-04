export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { calcularPerfil } from "@/lib/perfis"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const { respostas } = await req.json()

    if (!Array.isArray(respostas) || respostas.length !== 4) {
      return NextResponse.json({ error: "Respostas inválidas" }, { status: 400 })
    }

    const tipo = calcularPerfil(respostas)

    // Logado: salva/atualiza o perfil no usuário. Sem sessão: só devolve o tipo
    // (o front guarda no localStorage e o cadastro vincula depois via perfilTipo).
    try {
      const session = await auth()
      if (session?.user?.id) {
        await db.perfil.upsert({
          where: { userId: session.user.id },
          create: { userId: session.user.id, tipo, respostas },
          update: { tipo, respostas },
        })
      }
    } catch (dbError) {
      console.warn("[diagnostico] falha ao salvar perfil, continuando:", dbError)
    }

    return NextResponse.json({ tipo })
  } catch (error) {
    console.error("[diagnostico]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
