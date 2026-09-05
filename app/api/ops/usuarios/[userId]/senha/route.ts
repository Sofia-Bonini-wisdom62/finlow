import { NextRequest, NextResponse } from "next/server"
import { exigirOps } from "@/lib/ops"
import { redefinirSenhaDaConta } from "@/lib/ops-usuario"

export const dynamic = "force-dynamic"

/**
 * POST /api/ops/usuarios/{userId}/senha — sorteia senha nova para QUALQUER
 * conta do Finlow, esteja ela numa escola ou não.
 *
 * É a rede de segurança que o backlog descreveu no item *Recuperação de
 * senha* (30/08/2026) como a saída que não depende de escolher provedor de
 * e-mail. A rota irmã em `escolas/{id}/membros/{userId}/senha` continua
 * existindo e é a que a administração da escola usa; esta é da operação, e
 * alcança a assinante adulta que hoje não tem saída nenhuma.
 *
 * POST e não PATCH pelo mesmo motivo da outra: não é edição de campo, é a
 * criação de um segredo que existe uma vez só, na resposta, e some.
 *
 * ⚠️ A senha NÃO entra no log — só o fato de ter sido trocada, com o e-mail de
 * quem operou. Ela também não deve ser dita à pessoa por um canal que fica
 * guardado; quem recebe a resposta é quem está atendendo, e o caminho honesto
 * é a pessoa trocar a senha assim que entrar. Enquanto não houver troca de
 * senha dentro do app, isso é combinado no atendimento, e está registrado como
 * pendência no backlog.
 */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ userId: string }> }) {
  const op = await exigirOps()
  if (op instanceof NextResponse) return op
  const { userId } = await ctx.params

  const r = await redefinirSenhaDaConta(userId)
  if (!r.ok) {
    return NextResponse.json({ codigo: "SENHA", erro: r.detalhe, error: r.detalhe }, { status: 400 })
  }

  console.log(`[ops] ${op.email} redefiniu a senha da conta ${userId}`)
  return NextResponse.json({ ok: true, senha: r.senha, login: r.login, eraSoGoogle: r.eraSoGoogle })
}
