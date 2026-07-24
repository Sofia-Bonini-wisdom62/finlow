import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Digite um e-mail válido para continuar." }, { status: 400 })
    }

    const emailNorm = email.toLowerCase().trim()

    // já estar na lista não é erro pro usuário — a experiência é a mesma
    await db.waitlist.upsert({
      where: { email: emailNorm },
      create: { email: emailNorm },
      update: {},
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[waitlist]", e)
    return NextResponse.json({ error: "Não deu pra salvar agora. Tenta de novo?" }, { status: 500 })
  }
}
