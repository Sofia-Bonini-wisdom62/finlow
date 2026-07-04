// Gera e persiste um userId temporário até o auth estar configurado.
// Quando NextAuth for ativado, substituir por getServerSession() nas API routes.
export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return ""
  let id = localStorage.getItem("finlow_uid")
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem("finlow_uid", id)
  }
  return id
}
