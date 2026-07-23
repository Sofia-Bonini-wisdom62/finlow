import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import { categoriasPadraoPorPerfil, categoriasPadraoGenericas } from "@/prisma/seed-categorias"
import type { TipoPerfil } from "@/types/trilha"

export const dynamic = "force-dynamic"

// GET — status do consentimento (o front decide se mostra o opt-in)
export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { consentimentoPainelEm: true, dataNascimento: true },
  })

  let menorDe18 = false
  if (user?.dataNascimento) {
    const hoje = new Date()
    const nasc = user.dataNascimento
    let idade = hoje.getFullYear() - nasc.getFullYear()
    const aniversarioPassou =
      hoje.getMonth() > nasc.getMonth() ||
      (hoje.getMonth() === nasc.getMonth() && hoje.getDate() >= nasc.getDate())
    if (!aniversarioPassou) idade--
    menorDe18 = idade < 18
  }

  return NextResponse.json({
    consentiu: user?.consentimentoPainelEm !== null && user?.consentimentoPainelEm !== undefined,
    menorDe18,
  })
}

// PATCH — ativa o Painel: registra o opt-in e copia as categorias padrão do perfil
export async function PATCH() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    await db.user.update({
      where: { id: userId },
      data: { consentimentoPainelEm: new Date() },
    })

    // copia categorias padrão só se o usuário ainda não tem nenhuma
    // (reativar depois de apagar tudo repopula; ativar duas vezes não duplica)
    const jaTem = await db.categoria.count({ where: { userId } })
    if (jaTem === 0) {
      const perfil = await db.perfil.findUnique({ where: { userId } })
      const padrao = perfil
        ? categoriasPadraoPorPerfil[perfil.tipo as TipoPerfil] ?? categoriasPadraoGenericas
        : categoriasPadraoGenericas
      await db.categoria.createMany({
        data: padrao.map((c) => ({ userId, nome: c.nome, tipo: c.tipo, cor: c.cor, padrao: true })),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[painel/consentimento PATCH]", e)
    return NextResponse.json({ error: "Erro ao ativar o Painel" }, { status: 500 })
  }
}

// DELETE — apaga TODOS os dados do Painel e volta a exigir opt-in (irreversível)
export async function DELETE() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    await db.$transaction([
      db.transacao.deleteMany({ where: { userId } }),
      db.contaFixa.deleteMany({ where: { userId } }),
      db.categoria.deleteMany({ where: { userId } }),
      db.user.update({ where: { id: userId }, data: { consentimentoPainelEm: null } }),
    ])
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[painel/consentimento DELETE]", e)
    return NextResponse.json({ error: "Erro ao apagar os dados" }, { status: 500 })
  }
}
