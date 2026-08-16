import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { inicioDoDiaSP } from "@/lib/pontos"

// ROTA TEMPORÁRIA DE TESTE — apagar depois de validar a tela de ofensiva.
export const dynamic = "force-dynamic"

const EMAIL = "teste.ofensiva@finlow.dev"
const SENHA = "teste123"

function diasAtras(n: number): Date {
  return new Date(inicioDoDiaSP().getTime() - n * 86_400_000)
}

export async function GET(req: Request) {
  // Rota temporária: exige um token bobo na query só para não ser trivial de
  // acionar. Será removida assim que a tela for validada.
  if (new URL(req.url).searchParams.get("token") !== "finlow-seed") {
    return NextResponse.json({ error: "no" }, { status: 404 })
  }

  const hash = await bcrypt.hash(SENHA, 10)
  const user = await db.user.upsert({
    where: { email: EMAIL },
    update: { senha: hash, nome: "Teste Ofensiva" },
    create: { email: EMAIL, senha: hash, nome: "Teste Ofensiva" },
  })

  await db.diaAtivo.deleteMany({ where: { userId: user.id } })

  const atual: number[] = []
  for (let i = 0; i <= 11; i++) atual.push(i) // hoje..-11 => ofensiva 12
  const antigo: number[] = []
  for (let i = 15; i <= 37; i++) antigo.push(i) // recorde 23
  const esparsos = [45, 46, 50, 60, 61, 62]

  const todos = [...atual, ...antigo, ...esparsos]
  await db.diaAtivo.createMany({
    data: todos.map((n) => ({ userId: user.id, dia: diasAtras(n) })),
    skipDuplicates: true,
  })

  return NextResponse.json({ email: EMAIL, senha: SENHA, dias: todos.length })
}
