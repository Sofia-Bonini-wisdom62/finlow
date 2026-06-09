import { notFound } from "next/navigation"
import { ModuloDetalhe } from "@/components/modulo-detalhe"
import { getModulo, modulos } from "@/lib/trilha-data"

export function generateStaticParams() {
  return modulos.map((m) => ({ id: m.id }))
}

export default async function ModuloPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const modulo = getModulo(id)

  if (!modulo || !modulo.desbloqueado) {
    notFound()
  }

  return <ModuloDetalhe modulo={modulo} />
}
