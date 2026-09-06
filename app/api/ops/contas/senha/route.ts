import { NextRequest, NextResponse } from "next/server"
import { exigirOps } from "@/lib/ops"
import { reporSenhaDeConta } from "@/lib/ops-conta"

export const dynamic = "force-dynamic"

/**
 * POST /api/ops/contas/senha — sorteia senha nova para uma conta qualquer.
 *
 * A irmã de `escolas/{id}/membros/{userId}/senha`, para quem NÃO tem escola
 * por trás: o adulto que se cadastrou com e-mail e senha, esqueceu, e hoje
 * perderia a conta inteira — histórico financeiro cifrado, objetivos, trilha
 * e conversas junto. Enquanto o "esqueci minha senha" por e-mail não existir
 * (falta escolher provedor, e isso não se decide dentro do repositório), esta
 * rota é a única saída dessa pessoa, pelas mãos da operação.
 *
 * POST e não PATCH pela mesma razão da rota da escola: não é edição de campo,
 * é a criação de um segredo que existe uma vez só, na resposta, e some.
 *
 * `assumirContaGoogle` é o segundo clique da conta que só entra pelo Google.
 * Sem ele a rota RECUSA — a pessoa não esqueceu senha nenhuma, ela entra pelo
 * botão —, e o motivo volta na resposta para a tela poder dizê-lo.
 */
export async function POST(req: NextRequest) {
  const op = await exigirOps()
  if (op instanceof NextResponse) return op

  const corpo = await req.json().catch(() => null)
  const login = typeof corpo?.login === "string" ? corpo.login : ""
  const assumirContaGoogle = corpo?.assumirContaGoogle === true

  const r = await reporSenhaDeConta(login, { assumirContaGoogle })
  if (!r.ok) {
    return NextResponse.json(
      { codigo: r.acao.toUpperCase(), erro: r.detalhe, error: r.detalhe },
      { status: r.acao === "nao_existe" ? 404 : 400 }
    )
  }

  // A senha NÃO entra no log. Só o fato de ter sido trocada, e por quem —
  // esta é a única superfície do app em que uma pessoa repõe a credencial de
  // outra, e um registro sem autor não serve para conferir nada depois.
  console.log(`[ops] ${op.email} repôs a senha de ${r.login}`)
  return NextResponse.json({ ok: true, senha: r.senha, aviso: r.aviso })
}
