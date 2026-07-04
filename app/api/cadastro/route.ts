import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

// ⚠️ Faixa etária 13–18 conforme CLAUDE.md. Decisão pendente da fundadora: posicionamento
// aponta 15–18. Não alterar sem confirmação dela.
const IDADE_MIN = 13
const IDADE_MAX = 18

export async function POST(req: NextRequest) {
  try {
    const { nome, email, senha, idade, perfilTipo } = await req.json()

    if (!nome || typeof nome !== "string" || nome.trim().length < 2) {
      return NextResponse.json({ error: "Me diz seu nome" }, { status: 400 })
    }
    if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }
    if (!senha || typeof senha !== "string" || senha.length < 6) {
      return NextResponse.json({ error: "Senha precisa de pelo menos 6 caracteres" }, { status: 400 })
    }
    const idadeNum = Number(idade)
    if (!Number.isInteger(idadeNum) || idadeNum < IDADE_MIN || idadeNum > IDADE_MAX) {
      return NextResponse.json(
        { error: `O Finlow é pra quem tem entre ${IDADE_MIN} e ${IDADE_MAX} anos` },
        { status: 400 }
      )
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
        idade: idadeNum,
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
