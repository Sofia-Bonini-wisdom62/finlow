import { NextResponse } from "next/server"
import { getUserIdOr401 } from "@/lib/painel"
import { montarContexto } from "@/lib/contexto-financeiro"
import {
  levaAtual,
  medirProgresso,
  talvezGerarNovaLeva,
  marcarEntregues,
  type Recomendada,
} from "@/lib/recomendacao"
import { escolherProximaLeva } from "@/lib/recomendacao-ia"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * O que o chat tem para contar quando abre.
 *
 * Hoje é uma coisa só: a leva de aulas que o gatilho de percentual (§2.7 passo
 * 5) liberou. Fica numa rota separada do POST do chat de propósito — isto roda
 * quando a pessoa CHEGA, sem ela ter perguntado nada, e misturar com o turno
 * normal faria toda mensagem carregar uma checagem que quase sempre não dá em
 * nada.
 *
 * A checagem é barata quando não é hora: duas consultas e uma divisão. Só
 * chama a IA no momento em que a leva realmente vai nascer, que acontece
 * poucas vezes na vida de uma conta.
 */
export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    // Primeiro o que já estava pendente: se a geração anterior nasceu e a
    // entrega falhou (rede caiu, aba fechou), a leva não pode ficar presa.
    let pendentes = (await levaAtual(userId)).filter(
      (r) => r.origem === "gatilho_percentual" && !r.entregueEm
    )

    if (pendentes.length === 0) {
      const contexto = await montarContexto(userId)
      pendentes = await talvezGerarNovaLeva(userId, (candidatos, jaFeitas) =>
        escolherProximaLeva(contexto, candidatos, jaFeitas)
      )
    }

    if (pendentes.length === 0) return NextResponse.json({ recomendacoes: [] })

    await marcarEntregues(userId, pendentes.map((p) => p.id))

    const recs = await levaAtual(userId)
    const { concluidos, total } = medirProgresso(recs)

    return NextResponse.json({
      texto: textoDaLeva(concluidos, total - pendentes.length),
      recomendacoes: pendentes.map((p) => ({
        slug: p.slug,
        titulo: p.titulo,
        motivo: p.motivo,
      })),
    })
  } catch (e) {
    // Novidade é bônus. Se falhar, o chat abre igual — quebrar a home do app
    // por causa de uma recomendação seria trocar o essencial pelo acessório.
    console.error("[chat/novidades]", (e as Error)?.message)
    return NextResponse.json({ recomendacoes: [] })
  }
}

function textoDaLeva(concluidos: number, totalAnterior: number): string {
  return (
    `Você já fechou ${concluidos} de ${totalAnterior} aulas da sua trilha. ` +
    `Separei mais algumas olhando os seus números de agora, não os de quando a gente começou.`
  )
}

export type { Recomendada }
