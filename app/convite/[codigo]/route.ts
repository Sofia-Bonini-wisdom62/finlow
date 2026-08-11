import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { FORMATO_CODIGO } from "@/lib/indicacao"
import { COOKIE_CONVITE, DIAS_COOKIE_CONVITE } from "@/lib/convite-escola"

export const dynamic = "force-dynamic"

/**
 * GET /convite/{codigo} — a porta do convite de escola.
 *
 * Irmã de /r/[codigo]: planta o cookie e encaminha. O vínculo de verdade
 * acontece depois, quando existe conta. A diferença é o destino: quem NÃO tem
 * conta vai para o cadastro (com o banner de convite); quem JÁ tem vai para
 * /convite/aceitar, porque vincular uma conta existente a uma escola é
 * decisão que merece um botão, não um efeito colateral de abrir link.
 *
 * Código inválido ou inexistente segue para o cadastro do mesmo jeito, sem
 * cookie e sem erro na cara do convidado: o link quebrado é problema de quem
 * gerou, não de quem clicou.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await ctx.params
  const limpo = decodeURIComponent(codigo).trim().toLowerCase()

  let valido = false
  if (FORMATO_CODIGO.test(limpo)) {
    const existe = await db.conviteEscola.findUnique({
      where: { codigo: limpo },
      select: { id: true },
    })
    valido = !!existe
  }

  const session = await auth()
  const destino = valido && session?.user?.id ? "/convite/aceitar" : valido ? "/cadastro?convite=1" : "/cadastro"

  const res = NextResponse.redirect(new URL(destino, req.url))
  if (valido) {
    res.cookies.set(COOKIE_CONVITE, limpo, {
      maxAge: DIAS_COOKIE_CONVITE * 24 * 60 * 60,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    })
  }
  return res
}
