import { NextRequest, NextResponse } from "next/server"
import { exigirOps } from "@/lib/ops"
import { adicionarPessoa } from "@/lib/ops-escola"

export const dynamic = "force-dynamic"

/**
 * POST /api/ops/escolas/{id}/membros — adiciona UMA pessoa à escola.
 *
 * Irmã do lote de alunos, para o caso de uma pessoa só: o professor que chegou
 * depois, o aluno que entrou no meio do ano. O convite continua sendo o
 * caminho em que a escola nunca conhece a senha de ninguém, e esta rota
 * continua sendo a exceção para quando a lista chega no papel.
 *
 * A senha volta no corpo e some depois: o banco guarda só o hash. Quando a
 * conta já existia no Finlow, `senha` vem null de propósito, porque a senha
 * dela não mudou e não é da escola.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ escolaId: string }> }) {
  const op = await exigirOps()
  if (op instanceof NextResponse) return op
  const { escolaId } = await ctx.params

  const corpo = await req.json().catch(() => null)
  const papel = corpo?.papel
  if (papel !== "professor" && papel !== "aluno") {
    return NextResponse.json(
      { codigo: "PAPEL", erro: "Escolhe professor ou aluno.", error: "Escolhe professor ou aluno." },
      { status: 400 }
    )
  }

  const r = await adicionarPessoa({
    escolaId,
    papel,
    nome: typeof corpo?.nome === "string" ? corpo.nome : "",
    email: typeof corpo?.email === "string" ? corpo.email : null,
    turmaId: typeof corpo?.turmaId === "string" && corpo.turmaId ? corpo.turmaId : null,
  })

  if (!r.ok) {
    return NextResponse.json({ codigo: "PESSOA", erro: r.detalhe, error: r.detalhe }, { status: 400 })
  }

  console.log(`[ops] ${op.email} adicionou um ${papel} na escola ${escolaId}`)
  return NextResponse.json({ ok: true, login: r.login, senha: r.senha, contaNova: r.contaNova })
}
