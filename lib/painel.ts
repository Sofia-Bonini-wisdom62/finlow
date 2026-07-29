import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * Toda recusa daqui sai com TRÊS campos, de propósito:
 *   codigo — para a tela decidir qual botão oferecer, sem inferir do status
 *   erro   — nome em português, que é o que as telas novas leem
 *   error  — nome em inglês, que as telas do Painel já leem
 *
 * O motivo é concreto: quando isto devolvia só `error`, a tela do extrato
 * (que lia só `erro`) recebia um 403 perfeitamente explicado e mostrava
 * "Não consegui processar esse extrato" — mandando a pessoa trocar de arquivo
 * quando o problema era consentimento. Um 403 legível vale mais do que
 * qualquer retry.
 */
function recusa(codigo: string, mensagem: string, status: number) {
  return NextResponse.json({ codigo, erro: mensagem, error: mensagem }, { status })
}

// userId sempre da sessão — nunca do client (regra de segurança do Painel)
export async function getUserIdOr401(): Promise<string | NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return recusa("SEM_SESSAO", "Entra na sua conta primeiro", 401)
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
    return recusa(
      "PAINEL_INATIVO",
      "Você precisa ativar o Painel antes de salvar dados. Toca em 'Ativar meu Painel'.",
      403
    )
  }
  return null
}
