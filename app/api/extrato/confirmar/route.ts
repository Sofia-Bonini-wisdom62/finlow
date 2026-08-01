import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401, checarConsentimento } from "@/lib/painel"
import { confirmarLoteExtrato, criarTransacao } from "@/lib/financeiro-repo"
import { creditar } from "@/lib/pontos"

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
    const { extratoImportId, idsAceitos, ajuste } = await req.json()

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

    /**
     * A linha que faz a conta fechar, se a pessoa aceitou incluí-la.
     *
     * Nasce com origem "ajuste" e amarrada ao import: assim ela é distinguível
     * de um gasto real em qualquer consulta futura, e some junto se o extrato
     * for desfeito. Um ajuste indistinguível de uma compra seria um número
     * inventado morando no meio dos verdadeiros.
     */
    let ajusteCriado: { descricao: string; valor: number } | null = null
    if (ajuste && typeof ajuste.valor === "number" && Number.isFinite(ajuste.valor) && Math.abs(ajuste.valor) >= 0.01) {
      const descricao = ajuste.tipo === "saldo_inicial" ? "Saldo inicial" : "Compensação"
      const data = typeof ajuste.data === "string" && /^\d{4}-\d{2}-\d{2}$/.test(ajuste.data)
        ? new Date(`${ajuste.data}T12:00:00Z`)
        : new Date()
      const criada = await criarTransacao(userId, {
        descricao,
        valor: Math.abs(ajuste.valor),
        tipo: ajuste.valor >= 0 ? "receita" : "despesa",
        categoriaId: null,
        data,
        origem: "ajuste",
        extratoImportId,
      })
      ajusteCriado = { descricao, valor: criada.valor }
      console.log(`[extrato/confirmar] ajuste ${descricao} de ${ajuste.valor}`)
    }

    await db.extratoImport.update({
      where: { id: extratoImportId },
      data: { status: "confirmado", totalLinhas: r.confirmadas },
    })

    // UM crédito para o lote inteiro, com o id da importação como refId.
    //
    // Não é por economia: pontuar linha a linha faria um extrato de 400 linhas
    // valer 800 pontos contra 50 do onboarding inteiro, e o ranking passaria a
    // medir quem subiu o arquivo maior. Confirmar o extrato é UMA ação da
    // pessoa, independente de quantas linhas o banco mandou.
    await creditar(userId, "lancamento_confirmado", extratoImportId).catch((e) =>
      console.warn("[extrato/confirmar] ponto:", (e as Error)?.message)
    )

    return NextResponse.json({ ok: true, ...r, ajuste: ajusteCriado })
  } catch (e) {
    console.error("[extrato/confirmar]", (e as Error)?.message)
    return NextResponse.json({ erro: "Erro ao confirmar" }, { status: 500 })
  }
}
