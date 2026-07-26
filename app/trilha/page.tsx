import { redirect } from "next/navigation"

// A lista de módulos por perfil comportamental foi aposentada na reestruturação
// em 4 abas: a trilha agora vive dentro do Perfil, recomendada pelos indicadores
// financeiros do usuário. Links antigos continuam funcionando.
export default function TrilhaListaPage() {
  redirect("/perfil")
}
