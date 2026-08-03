import { NextRequest, NextResponse } from "next/server"
import { getUserIdOr401 } from "@/lib/painel"
import { listarTransacoes } from "@/lib/financeiro-repo"
import { diagnosticar } from "@/lib/vazamento"
import { gerarNarrativa } from "@/lib/vazamento-ia"
import {
  salvarDiagnostico,
  lerDiagnostico,
  gerarTokenPublico,
  revogarTokenPublico,
} from "@/lib/vazamento-repo"

export const dynamic = "force-dynamic"
// A narrativa é uma chamada de IA; o resto é conta local.
export const maxDuration = 60

/** Com menos que isso, "diagnóstico" seria chute vestido de análise. */
const MINIMO_LANCAMENTOS = 10

// GET — recalcula a foto com os números de agora, persiste cifrado e devolve
// em claro para a tela. Recalcular sempre é deliberado: diagnóstico velho
// afirmando vazamento que a pessoa já estancou é o app mentindo.
export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const transacoes = await listarTransacoes(userId)
    const resultado = diagnosticar(
      transacoes.map((t) => ({
        id: t.id,
        descricao: t.descricao,
        valor: t.valor,
        tipo: t.tipo,
        data: t.data,
        categoria: t.categoria?.nome ?? null,
      }))
    )

    if (transacoes.length < MINIMO_LANCAMENTOS || resultado.mesesAnalisados < 1) {
      return NextResponse.json({ pronto: false, motivo: "poucos_dados" })
    }

    const narrativa = await gerarNarrativa(resultado)
    await salvarDiagnostico(userId, resultado, narrativa)
    const salvo = await lerDiagnostico(userId)

    return NextResponse.json({
      pronto: true,
      ...resultado,
      narrativa,
      tokenPublico: salvo?.tokenPublico ?? null,
      geradoEm: salvo?.geradoEm ?? new Date(),
    })
  } catch (e) {
    console.error("[vazamento]", (e as Error)?.message)
    return NextResponse.json({ error: "Erro ao gerar o diagnóstico" }, { status: 500 })
  }
}

// POST — cria o link público do card (opt-in explícito; o diagnóstico em si
// nunca é público). DELETE — revoga, e o link antigo morre na hora.
export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const { acao } = await req.json().catch(() => ({}))
    if (acao !== "compartilhar") {
      return NextResponse.json({ error: "Ação desconhecida" }, { status: 400 })
    }
    const token = await gerarTokenPublico(userId)
    if (!token) return NextResponse.json({ error: "Gere o diagnóstico primeiro" }, { status: 409 })
    return NextResponse.json({ token })
  } catch (e) {
    console.error("[vazamento] POST", (e as Error)?.message)
    return NextResponse.json({ error: "Erro ao criar o link" }, { status: 500 })
  }
}

export async function DELETE() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    await revogarTokenPublico(userId)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[vazamento] DELETE", (e as Error)?.message)
    return NextResponse.json({ error: "Erro ao revogar o link" }, { status: 500 })
  }
}
