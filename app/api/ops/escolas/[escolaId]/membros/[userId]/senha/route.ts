import { NextRequest, NextResponse } from "next/server"
import { exigirOps } from "@/lib/ops"
import { redefinirSenha } from "@/lib/ops-escola"

export const dynamic = "force-dynamic"

/**
 * POST /api/ops/escolas/{id}/membros/{userId}/senha — sorteia senha nova.
 *
 * POST e não PATCH em `membros/[userId]` porque não é edição de campo: é a
 * criação de um segredo que existe uma vez só, na resposta, e some. Misturar
 * isso com o PATCH de nome faria toda edição de nome devolver uma senha que
 * ninguém pediu, e senha que aparece sem ser pedida é senha que vaza em
 * captura de tela.
 *
 * Sem o "esqueci a senha" para quem entrou pelo lote (o endereço `.invalid`
 * não recebe mensagem), esta rota é a única saída da criança que esqueceu.
 */
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ escolaId: string; userId: string }> }
) {
  const op = await exigirOps()
  if (op instanceof NextResponse) return op
  const { escolaId, userId } = await ctx.params

  const r = await redefinirSenha(escolaId, userId)
  if (!r.ok) {
    return NextResponse.json({ codigo: "SENHA", erro: r.detalhe, error: r.detalhe }, { status: 400 })
  }

  // A senha NÃO entra no log, obviamente. Só o fato de ter sido trocada.
  console.log(`[ops] ${op.email} redefiniu a senha de ${userId} na escola ${escolaId}`)
  return NextResponse.json({ ok: true, senha: r.senha })
}
