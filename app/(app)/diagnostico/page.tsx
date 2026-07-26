import { redirect } from "next/navigation"

// O diagnóstico de 4 perguntas foi aposentado: o Perfil Financeiro agora é
// calculado a partir dos lançamentos reais do usuário (lib/financas.ts), não de
// um quiz comportamental. Rota mantida só para não quebrar links antigos.
export default function DiagnosticoPage() {
  redirect("/perfil")
}
