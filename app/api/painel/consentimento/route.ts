import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import { categoriasPadrao } from "@/prisma/seed-categorias"
import { apagarDadosFinanceiros } from "@/lib/apagar-financeiro"

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
      await db.categoria.createMany({
        data: categoriasPadrao.map((c) => ({ userId, nome: c.nome, tipo: c.tipo, cor: c.cor, padrao: true })),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[painel/consentimento PATCH]", e)
    return NextResponse.json({ error: "Erro ao ativar o Painel" }, { status: 500 })
  }
}

/**
 * DELETE — apaga TODOS os dados financeiros e volta a exigir opt-in (irreversível)
 *
 * O QUE sai não está escrito aqui, e sim em `lib/dados-financeiros.ts`. A lista
 * morava nesta função e envelheceu calada: ganhamos a tabela de investimentos e
 * ninguém somou nela, então a tela respondia "Dados financeiros apagados." com a
 * carteira inteira ainda no banco. Lá fora a lista é conferida contra o schema
 * por `scripts/testar-apagar-dados.mts`, que falha quando aparece tabela nova
 * sem classificação — aqui dentro, esquecer não dava erro nenhum.
 *
 * Continua em UMA transação: meia limpeza é pior que limpeza nenhuma, porque a
 * tela diz que acabou.
 */
export async function DELETE() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    await apagarDadosFinanceiros(db, userId)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[painel/consentimento DELETE]", e)
    return NextResponse.json({ error: "Erro ao apagar os dados" }, { status: 500 })
  }
}
