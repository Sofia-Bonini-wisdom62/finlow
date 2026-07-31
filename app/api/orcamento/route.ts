import { NextRequest, NextResponse } from "next/server"
import { getUserIdOr401, checarConsentimento } from "@/lib/painel"
import { listarOrcamentos, definirOrcamento, apagarOrcamento } from "@/lib/orcamento-repo"
import { mapearCategorias } from "@/lib/extrato/categorias"

export const dynamic = "force-dynamic"

/**
 * Tetos de gasto.
 *
 * O POST aceita SLUG de categoria ("delivery"), não id: é o que a IA conhece.
 * `mapearCategorias` resolve o slug para a categoria da pessoa e cria a que
 * faltar — a mesma função que o extrato usa, então um teto de "delivery"
 * aponta para a mesma categoria em que os gastos de delivery caem. Fossem
 * dois caminhos diferentes, o teto ficaria pendurado numa categoria vazia e
 * mostraria 0% para sempre.
 */

export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  return NextResponse.json({ orcamentos: await listarOrcamentos(userId) })
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  const bloqueio = await checarConsentimento(userId)
  if (bloqueio) return bloqueio

  try {
    const { tetos } = await req.json()
    if (!Array.isArray(tetos) || tetos.length === 0) {
      return NextResponse.json({ codigo: "PEDIDO_INVALIDO", erro: "Nenhum teto recebido." }, { status: 400 })
    }

    const slugs = tetos
      .map((t) => (typeof t?.categoria === "string" ? t.categoria : null))
      .filter((s): s is string => !!s && s !== "total")
    const mapa = await mapearCategorias(userId, slugs)

    const salvos = []
    for (const t of tetos.slice(0, 12)) {
      const limite = typeof t?.limite === "number" ? t.limite : NaN
      if (!Number.isFinite(limite) || limite <= 0) continue
      // "total" é o teto do mês inteiro; qualquer outro é por categoria.
      const categoriaId = t.categoria === "total" ? null : (mapa.get(t.categoria) ?? null)
      if (t.categoria !== "total" && !categoriaId) continue
      salvos.push(await definirOrcamento(userId, categoriaId, limite))
    }

    if (salvos.length === 0) {
      return NextResponse.json({ codigo: "NADA_VALIDO", erro: "Nenhum teto válido para salvar." }, { status: 400 })
    }
    return NextResponse.json({ salvos: salvos.length, orcamentos: salvos })
  } catch (e) {
    console.error("[orcamento] POST", (e as Error)?.message)
    return NextResponse.json({ codigo: "FALHOU", erro: "Não consegui salvar agora." }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ codigo: "PEDIDO_INVALIDO", erro: "Falta o id." }, { status: 400 })

  const ok = await apagarOrcamento(userId, id)
  return NextResponse.json({ apagados: ok ? 1 : 0 })
}
