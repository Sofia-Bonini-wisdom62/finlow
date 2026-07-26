import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import { metricasPerfil, nivelFinanceiro, resumoUsuario, type TransacaoCalc } from "@/lib/financas"

export const dynamic = "force-dynamic"

export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const [user, transacoes] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { nome: true, email: true, image: true },
      }),
      db.transacao.findMany({
        where: { userId },
        select: { valor: true, tipo: true, data: true },
      }),
    ])

    const calc: TransacaoCalc[] = transacoes.map((t) => ({
      valor: t.valor.toString(),
      tipo: t.tipo,
      data: t.data,
    }))

    const metricas = metricasPerfil(calc)

    return NextResponse.json({
      nome: user?.nome ?? "Você",
      email: user?.email ?? null,
      image: user?.image ?? null,
      nivel: nivelFinanceiro(metricas),
      resumo: resumoUsuario(metricas),
      metricas,
    })
  } catch (e) {
    console.error("[perfil-financeiro]", e)
    return NextResponse.json({ error: "Erro ao carregar perfil" }, { status: 500 })
  }
}
