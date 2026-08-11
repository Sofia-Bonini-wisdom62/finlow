import { NextRequest, NextResponse } from "next/server"
import { COOKIE_CONVITE, previewConvite } from "@/lib/convite-escola"

export const dynamic = "force-dynamic"

/**
 * GET /api/convite/preview — o que o banner do cadastro (e a tela de aceite)
 * mostra: "Você está entrando na Escola X como aluno do 5º A".
 *
 * SEM auth de propósito: quem lê é um visitante anônimo no meio do cadastro.
 * O que sai daqui é só o que o próprio código já daria a quem o tem — nome da
 * escola, papel e turma. Nenhum dado de pessoa.
 */
export async function GET(req: NextRequest) {
  const codigo = req.cookies.get(COOKIE_CONVITE)?.value
  if (!codigo) return NextResponse.json({ existe: false })

  const p = await previewConvite(codigo)
  if (!p) return NextResponse.json({ existe: false })

  return NextResponse.json({ existe: true, ...p })
}
