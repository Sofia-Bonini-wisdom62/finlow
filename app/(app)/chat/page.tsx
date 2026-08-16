import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { lerOfensiva } from "@/lib/ofensiva"
import { acessoPremium } from "@/lib/pagamento/acesso"
import { ChatIA } from "@/components/chat/ChatIA"
import { BottomNav } from "@/components/bottom-nav"

export const dynamic = "force-dynamic"

export default async function ChatPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const primeiroNome = (session.user.name ?? "").split(" ")[0] || "tudo bem"

  // A chama no cabeçalho do Fin (protótipo v2) e o plano, para o chip de
  // FINLOW+ de quem é grátis. Falha cai no seguro: sem chama, com chip.
  // O pior caso vira um assinante vendo propaganda do que já tem.
  const [ofensiva, acesso] = await Promise.all([
    lerOfensiva(session.user.id).catch(() => null),
    acessoPremium(session.user.id).catch(() => ({ premium: false })),
  ])

  return (
    <>
      <ChatIA nome={primeiroNome} sequencia={ofensiva?.atual ?? 0} premium={acesso.premium} />
      <BottomNav />
    </>
  )
}
