import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// userId sempre da sessão — nunca do client (regra de segurança do Painel)
export async function getUserIdOr401(): Promise<string | NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Entra na sua conta primeiro" }, { status: 401 })
  }
  return session.user.id
}

// Bloqueante de privacidade (R8): nenhum write de Painel sem opt-in explícito
export async function checarConsentimento(userId: string): Promise<NextResponse | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { consentimentoPainelEm: true },
  })
  if (!user?.consentimentoPainelEm) {
    return NextResponse.json(
      { error: "Você precisa ativar o Painel antes de salvar dados. Toca em 'Ativar meu Painel'." },
      { status: 403 }
    )
  }
  return null
}
