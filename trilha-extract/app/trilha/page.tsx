import { ModuloCard } from "@/components/modulo-card"
import { modulos, perfil } from "@/lib/trilha-data"

export default function TrilhaPage() {
  const totalModulos = modulos.length
  const modulosConcluidos = modulos.filter((m) => m.itensConcluidos === m.totalItens).length
  const pct = Math.round((modulosConcluidos / totalModulos) * 100)

  return (
    <main className="relative min-h-dvh bg-background bg-[radial-gradient(ellipse_at_top,_rgba(0,200,150,0.08),_transparent_55%)]">
      <div className="mx-auto w-full max-w-md px-5 py-8 md:max-w-2xl md:py-12">
        <header className="flex flex-col gap-5">
          <span className="text-lg font-bold tracking-tight text-primary">Finflow</span>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-foreground text-balance md:text-3xl">
              Sua trilha,{" "}
              <span style={{ color: perfil.cor }}>Tipo {perfil.nome}</span>
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
              Avança no seu ritmo. Cada módulo desbloqueia o próximo.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-card">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-sm font-medium text-primary">
              {modulosConcluidos} de {totalModulos} concluídos
            </span>
          </div>
        </header>

        <section className="mt-8 flex flex-col gap-4" aria-label="Módulos da trilha">
          {modulos.map((modulo) => (
            <ModuloCard key={modulo.id} modulo={modulo} />
          ))}
        </section>
      </div>
    </main>
  )
}
