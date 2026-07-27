import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401, checarConsentimento } from "@/lib/painel"
import { confirmarLoteExtrato } from "@/lib/financeiro-repo"

export const dynamic = "force-dynamic"

/**
 * PATCH — a pessoa revisou e decidiu.
 * Aceitas viram confirmado: true (aí sim entram nas Análises).
 * Recusadas são apagadas — o que ela não reconheceu não fica no banco.
 */
export async function PATCH(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  const bloqueio = await checarConsentimento(userId)
  if (bloqueio) return bloqueio

  try {
    const { extratoImportId, idsAceitos } = await req.json()

    if (!extratoImportId || typeof extratoImportId !== "string") {
      return NextResponse.json({ erro: "extratoImportId obrigatório" }, { status: 400 })
    }
    if (!Array.isArray(idsAceitos) || idsAceitos.some((i) => typeof i !== "string")) {
      return NextResponse.json({ erro: "idsAceitos deve ser uma lista de ids" }, { status: 400 })
    }

    // o import tem de ser do próprio usuário — senão dá para confirmar o de outro
    const registro = await db.extratoImport.findFirst({ where: { id: extratoImportId, userId } })
    if (!registro) {
      return NextResponse.json({ erro: "Import não encontrado" }, { status: 404 })
    }
    if (registro.status === "confirmado") {
      return NextResponse.json({ erro: "Esse extrato já foi confirmado" }, { status: 409 })
    }
    if (registro.status !== "aguardando_confirmacao") {
      return NextResponse.json({ erro: "Esse extrato não está aguardando confirmação" }, { status: 409 })
    }

    const r = await confirmarLoteExtrato(userId, extratoImportId, idsAceitos)

    await db.extratoImport.update({
      where: { id: extratoImportId },
      data: { status: "confirmado", totalLinhas: r.confirmadas },
    })

    return NextResponse.json({ ok: true, ...r })
  } catch (e) {
    console.error("[extrato/confirmar]", (e as Error)?.message)
    return NextResponse.json({ erro: "Erro ao confirmar" }, { status: 500 })
  }
}
