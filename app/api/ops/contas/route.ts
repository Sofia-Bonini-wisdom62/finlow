import { NextRequest, NextResponse } from "next/server"
import { exigirOps } from "@/lib/ops"
import { procurarConta } from "@/lib/ops-conta"

export const dynamic = "force-dynamic"

/**
 * GET /api/ops/contas?login=… — quem é a pessoa, antes de mexer na conta dela.
 *
 * Só LÊ. A troca de senha é POST em `contas/senha`, e a separação é o ponto:
 * procurar é o que a operadora faz muitas vezes, inclusive para descobrir que
 * a conta nem existe, e uma busca que troca segredo por engano seria a pior
 * forma possível de descobrir isso.
 *
 * `login` e não `email` no parâmetro porque nem todo login é e-mail: aluno
 * criado em lote entra por `nome.sobrenome@escola.invalid`, endereço que a
 * RFC 2606 reserva justamente para nunca resolver.
 *
 * Esta rota existe só atrás de `exigirOps`. A busca pública equivalente NÃO
 * existe e não deve nascer: um formulário aberto que responde "essa conta
 * existe" é consulta de quem usa o Finlow, e num app de dinheiro isso é dado
 * sensível antes de qualquer número.
 */
export async function GET(req: NextRequest) {
  const op = await exigirOps()
  if (op instanceof NextResponse) return op

  const login = req.nextUrl.searchParams.get("login") ?? ""
  if (!login.trim()) {
    return NextResponse.json(
      { codigo: "LOGIN", erro: "Escreve o login para procurar.", error: "Escreve o login para procurar." },
      { status: 400 }
    )
  }

  const conta = await procurarConta(login)
  if (!conta) {
    return NextResponse.json(
      { codigo: "NAO_ENCONTRADO", erro: "Não existe conta com esse login.", error: "Não existe conta com esse login." },
      { status: 404 }
    )
  }

  return NextResponse.json({ ok: true, conta })
}
