import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { COOKIE_INDICACAO, DIAS_COOKIE_INDICACAO, FORMATO_CODIGO } from "@/lib/indicacao"

export const dynamic = "force-dynamic"

/**
 * GET /r/{codigo} — a porta do link de convite.
 *
 * Só faz duas coisas: planta o cookie e manda para o cadastro. O vínculo de
 * verdade acontece DEPOIS, quando a conta existe — aqui a pessoa é um
 * visitante anônimo e nada dela é gravado.
 *
 * Código inválido ou inexistente segue para o cadastro do mesmo jeito, sem
 * cookie e sem erro na cara do convidado: o link quebrado é problema de quem
 * gerou, não de quem clicou.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await ctx.params
  const res = NextResponse.redirect(new URL("/cadastro", req.url))

  const limpo = decodeURIComponent(codigo).trim().toLowerCase()
  if (FORMATO_CODIGO.test(limpo)) {
    const existe = await db.user.findUnique({
      where: { codigoIndicacao: limpo },
      select: { id: true },
    })
    if (existe) {
      res.cookies.set(COOKIE_INDICACAO, limpo, {
        maxAge: DIAS_COOKIE_INDICACAO * 24 * 60 * 60,
        httpOnly: true, // o cadastro lê no servidor; script de página não precisa ver
        sameSite: "lax",
        path: "/",
      })
    }
  }
  return res
}
