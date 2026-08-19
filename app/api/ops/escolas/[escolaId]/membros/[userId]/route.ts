import { NextRequest, NextResponse } from "next/server"
import { exigirOps } from "@/lib/ops"
import { editarMembro, removerMembro, trocarPapel } from "@/lib/ops-escola"

export const dynamic = "force-dynamic"

/**
 * PATCH e DELETE de um membro. As operações que só existiam no Prisma Studio:
 * `MembroEscola` nascia por resgate de convite e nunca mudava depois.
 *
 * O PATCH faz duas coisas diferentes na mesma request, e de propósito: trocar
 * PAPEL e editar DADOS (nome, login, turma). São campos do mesmo formulário na
 * tela, e separá-los em duas rotas faria a operadora salvar duas vezes para um
 * ajuste só. A ordem importa: o papel muda primeiro, porque sair de aluno
 * limpa as turmas, e só faz sentido escolher turma nova depois disso.
 *
 * DELETE tira da escola, não apaga a conta. Apagar conta continua sendo
 * exclusividade da própria pessoa em /api/conta, e essa fronteira é a razão de
 * este verbo poder existir aqui sem medo: o pior que ele faz é devolver alguém
 * à condição de usuário comum, com o progresso intacto.
 */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ escolaId: string; userId: string }> }
) {
  const op = await exigirOps()
  if (op instanceof NextResponse) return op
  const { escolaId, userId } = await ctx.params

  const corpo = await req.json().catch(() => null)
  if (!corpo || typeof corpo !== "object") {
    return NextResponse.json(
      { codigo: "CORPO", erro: "Não entendi o pedido.", error: "Não entendi o pedido." },
      { status: 400 }
    )
  }

  if (typeof corpo.papel === "string") {
    const r = await trocarPapel(escolaId, userId, corpo.papel)
    if (!r.ok) {
      return NextResponse.json({ codigo: "PAPEL", erro: r.detalhe, error: r.detalhe }, { status: 400 })
    }
    console.log(`[ops] ${op.email} deixou ${userId} como ${corpo.papel} na escola ${escolaId}`)
  }

  // `undefined` quando o campo não veio: editarMembro não toca no que não foi
  // mandado, e é isso que deixa a tela enviar só o que a operadora alterou.
  const edicao = {
    escolaId,
    userId,
    nome: typeof corpo.nome === "string" ? corpo.nome : undefined,
    email: typeof corpo.email === "string" ? corpo.email : undefined,
    turmaId: typeof corpo.turmaId === "string" && corpo.turmaId ? corpo.turmaId : undefined,
  }
  if (edicao.nome !== undefined || edicao.email !== undefined || edicao.turmaId !== undefined) {
    const r = await editarMembro(edicao)
    if (!r.ok) {
      return NextResponse.json({ codigo: "EDICAO", erro: r.detalhe, error: r.detalhe }, { status: 400 })
    }
    console.log(`[ops] ${op.email} editou ${userId} na escola ${escolaId}`)
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ escolaId: string; userId: string }> }
) {
  const op = await exigirOps()
  if (op instanceof NextResponse) return op
  const { escolaId, userId } = await ctx.params

  const r = await removerMembro(escolaId, userId)
  if (!r.ok) {
    return NextResponse.json({ codigo: "MEMBRO", erro: r.detalhe, error: r.detalhe }, { status: 400 })
  }
  console.log(`[ops] ${op.email} tirou ${userId} da escola ${escolaId}`)
  return NextResponse.json({ ok: true })
}
