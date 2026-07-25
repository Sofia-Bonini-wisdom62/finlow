import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"

export const dynamic = "force-dynamic"

export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { nome: true, email: true, dataNascimento: true, consentimentoPainelEm: true, senha: true },
  })

  return NextResponse.json({
    nome: user?.nome ?? "",
    email: user?.email ?? "",
    dataNascimento: user?.dataNascimento ?? null,
    painelAtivo: user?.consentimentoPainelEm !== null && user?.consentimentoPainelEm !== undefined,
    temSenha: Boolean(user?.senha),
  })
}

// PATCH — atualiza nome e/ou senha
export async function PATCH(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const { nome, senhaAtual, senhaNova } = await req.json()
    const dados: { nome?: string; senha?: string } = {}

    if (nome !== undefined) {
      if (typeof nome !== "string" || nome.trim().length < 2) {
        return NextResponse.json({ error: "Nome muito curto" }, { status: 400 })
      }
      dados.nome = nome.trim()
    }

    if (senhaNova !== undefined) {
      if (typeof senhaNova !== "string" || senhaNova.length < 6) {
        return NextResponse.json({ error: "A senha nova precisa de pelo menos 6 caracteres" }, { status: 400 })
      }
      const user = await db.user.findUnique({ where: { id: userId }, select: { senha: true } })
      // quem tem senha precisa confirmar a atual (contas OAuth não têm)
      if (user?.senha) {
        if (!senhaAtual || !(await bcrypt.compare(senhaAtual, user.senha))) {
          return NextResponse.json({ error: "Senha atual incorreta" }, { status: 403 })
        }
      }
      dados.senha = await bcrypt.hash(senhaNova, 10)
    }

    if (Object.keys(dados).length === 0) {
      return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 })
    }

    await db.user.update({ where: { id: userId }, data: dados })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[conta PATCH]", e)
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}
