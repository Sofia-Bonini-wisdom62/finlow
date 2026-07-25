import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ChatIA } from "@/components/chat/ChatIA"
import { BottomNav } from "@/components/bottom-nav"

export const dynamic = "force-dynamic"

export default async function ChatPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const primeiroNome = (session.user.name ?? "").split(" ")[0] || "tudo bem"

  return (
    <>
      <ChatIA nome={primeiroNome} />
      <BottomNav />
    </>
  )
}
