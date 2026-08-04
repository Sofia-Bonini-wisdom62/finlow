import { db } from "@/lib/db"

/**
 * Módulo Avançado (persona C do plano de negócios): consolidação de
 * investimentos, projeção de patrimônio e separação pessoal × trabalho.
 *
 * Está atrás de flag POR USUÁRIO, e a flag tem duas fontes: a coluna
 * `moduloAvancado` (liga definitivamente, conta a conta) e a lista
 * `AVANCADO_BETA_EMAILS` do ambiente (beta fechado sem mexer no banco —
 * adicionar um e-mail na Vercel liga na hora, remover desliga).
 *
 * A checagem roda no SERVIDOR, em toda rota do módulo. Esconder botão no
 * cliente é cortesia; quem decide é a API.
 */
export async function temModuloAvancado(userId: string): Promise<boolean> {
  const u = await db.user.findUnique({
    where: { id: userId },
    select: { moduloAvancado: true, email: true },
  })
  if (!u) return false
  if (u.moduloAvancado) return true

  const beta = (process.env.AVANCADO_BETA_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return beta.includes(u.email.toLowerCase())
}
