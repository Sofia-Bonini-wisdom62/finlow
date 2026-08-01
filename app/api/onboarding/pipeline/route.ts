import { NextResponse } from "next/server"
import { getUserIdOr401 } from "@/lib/painel"
import { rodarPipeline, PASSOS } from "@/lib/onboarding/pipeline"

export const dynamic = "force-dynamic"
export const maxDuration = 120

/** GET — os passos, para a tela desenhar a lista antes de começar. */
export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  return NextResponse.json({ passos: PASSOS })
}

/**
 * POST — roda o processamento e vai transmitindo cada passo.
 *
 * NDJSON, uma linha por passo, conforme termina. Podia devolver tudo no fim e
 * a tela animar sozinha, mas aí a barra andaria por conta própria enquanto o
 * servidor faz outra coisa — e quando travasse, a pessoa ficaria olhando uma
 * animação alegre sem saber que deu errado. A §2.7 pede o passo real, não
 * spinner genérico, e é isto que a diferença custa.
 */
export async function POST() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const enc = new TextEncoder()
  const stream = new ReadableStream({
    async start(controle) {
      try {
        for await (const passo of rodarPipeline(userId)) {
          controle.enqueue(enc.encode(JSON.stringify(passo) + "\n"))
        }
      } catch (e) {
        console.error("[pipeline] stream", (e as Error)?.message)
        controle.enqueue(enc.encode(JSON.stringify({ id: "erro", ok: false }) + "\n"))
      } finally {
        controle.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      // Sem isto um proxy pode segurar o corpo até o fim e entregar as seis
      // linhas de uma vez, o que devolve exatamente o spinner que se queria
      // evitar.
      "X-Accel-Buffering": "no",
    },
  })
}
