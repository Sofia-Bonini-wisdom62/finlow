import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { lerOfensiva } from "@/lib/ofensiva"
import { ChatIA } from "@/components/chat/ChatIA"
import { BottomNav } from "@/components/bottom-nav"

export const dynamic = "force-dynamic"

export default async function ChatPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const primeiroNome = (session.user.name ?? "").split(" ")[0] || "tudo bem"

  // A chama no cabeçalho do Fin (protótipo v2). Falha vira 0 e o chip some —
  // ninguém fica sem conversar porque um contador de dias engasgou.
  const ofensiva = await lerOfensiva(session.user.id).catch(() => null)

  return (
    <>
      <ChatIA nome={primeiroNome} sequencia={ofensiva?.atual ?? 0} />
      <BottomNav />
    </>
  )
}
