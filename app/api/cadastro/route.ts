import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { nome, email, senha, dataNascimento, perfilTipo } = await req.json()

    if (!nome || typeof nome !== "string" || nome.trim().length < 2) {
      return NextResponse.json({ error: "Me diz seu nome" }, { status: 400 })
    }
    if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }
    if (!senha || typeof senha !== "string" || senha.length < 6) {
      return NextResponse.json({ error: "Senha precisa de pelo menos 6 caracteres" }, { status: 400 })
    }

    // data de nascimento é só informativa — sem validação de faixa etária
    // (decisão da fundadora, 04/07/2026). Só checa se é uma data plausível.
    let nascimento: Date | null = null
    if (dataNascimento) {
      const d = new Date(dataNascimento)
      const ano = d.getFullYear()
      if (isNaN(d.getTime()) || ano < 1900 || d > new Date()) {
        return NextResponse.json({ error: "Data de nascimento inválida" }, { status: 400 })
      }
      nascimento = d
    }

    const emailNorm = email.toLowerCase().trim()

    const existe = await db.user.findUnique({ where: { email: emailNorm } })
    if (existe) {
      return NextResponse.json({ error: "Esse email já tem conta. Tenta entrar!" }, { status: 409 })
    }

    const hash = await bcrypt.hash(senha, 10)

    await db.user.create({
      data: {
        nome: nome.trim(),
        email: emailNorm,
        senha: hash,
        dataNascimento: nascimento,
        // se o usuário já fez o diagnóstico antes de criar conta, vincula o perfil
        ...(perfilTipo && ["lancador", "guardador", "impulsivo", "sonhador"].includes(perfilTipo)
          ? { perfil: { create: { tipo: perfilTipo, respostas: [] } } }
          : {}),
      },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[cadastro]", e)
    return NextResponse.json({ error: "Erro ao criar conta. Tenta de novo?" }, { status: 500 })
  }
}
