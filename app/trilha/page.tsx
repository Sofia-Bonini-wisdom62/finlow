import Link from "next/link"
import { auth } from "@/lib/auth"
import { garantirLevaInicial, TAMANHO_DA_LEVA } from "@/lib/recomendacao"
import { aulasParaSituacao } from "@/lib/posicionar-trilha"
import { montarTrilhaVisual } from "@/lib/trilha-visual"
import TrilhaContainer from "@/components/trilha-visual/TrilhaContainer"
import { BottomNav } from "@/components/bottom-nav"

/**
 * Trilha: o caminho, com blocos, nós e travas.
 *
 * Virou SERVIDOR (07/08/2026). A versão anterior era um client component que
 * buscava `/api/modulos` e desenhava uma lista; a nova desenha o percurso, e
 * montar isso no cliente significaria mandar o corredor inteiro pela rede para
 * a tela recalcular o que o servidor já sabe.
 *
 * A busca saiu daqui. Ela existia porque a trilha era biblioteca — com o
 * corredor, achar uma aula trancada e não poder abri-la é pior do que não
 * achar. Quem chega com dúvida específica vai ao Chat, que é onde o assistente
 * pode ADIANTAR a aula na trilha em vez de só mostrá-la trancada.
 */
export const dynamic = "force-dynamic"

export default async function TrilhaPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-fl-page px-6 text-center">
        <p className="text-fl-ink-2">Entra na sua conta pra ver a trilha.</p>
        <Link
          href="/login"
          className="rounded-full bg-fl-500 px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Entrar
        </Link>
      </main>
    )
  }

  // A primeira leva nasce ANTES de montar o caminho: sem sequência, o corredor
  // não tem o que liberar e a trilha abriria inteira trancada.
  await garantirLevaInicial(userId, await aulasParaSituacao(userId, TAMANHO_DA_LEVA))

  const { trilha, trilhas, usuario } = await montarTrilhaVisual(userId)

  return (
    <main className="min-h-dvh bg-fl-page lg:pl-56">
      <TrilhaContainer trilha={trilha} trilhas={trilhas} usuario={usuario} />
      <BottomNav />
    </main>
  )
}
