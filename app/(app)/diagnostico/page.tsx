import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { DiagnosticoClient } from "./diagnostico-client"

export const dynamic = "force-dynamic"

export default async function DiagnosticoPage() {
  // login obrigatório antes do diagnóstico — visitante novo vai pro cadastro
  const session = await auth()
  if (!session?.user) redirect("/cadastro")

  return <DiagnosticoClient />
}
