import { Button } from "@/components/ui/button"
import { Benefits } from "@/components/benefits"

export default function Page() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Textura/gradiente sutil de fundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, rgba(0, 200, 150, 0.14) 0%, rgba(13, 27, 42, 0) 55%), radial-gradient(90% 60% at 90% 110%, rgba(245, 166, 35, 0.08) 0%, rgba(13, 27, 42, 0) 60%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[390px] flex-1 flex-col px-6 pb-10 pt-12">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-2xl font-bold tracking-tight text-primary">
            Finflow
          </span>
        </div>

        {/* Hero */}
        <div className="mt-16 flex flex-col">
          <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            Pra quem já tem a própria grana
          </span>

          <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground">
            Seu dinheiro, suas regras.
          </h1>

          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
            Descobre o que fazer com o que você já tem — sem enrolação.
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-col items-center gap-2">
            <Button
              size="lg"
              className="h-14 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Descobrir meu perfil
            </Button>
            <p className="text-xs text-muted-foreground">
              Leva menos de 2 minutos
            </p>
          </div>
        </div>

        {/* Benefícios */}
        <div className="mt-12">
          <Benefits />
        </div>
      </div>
    </main>
  )
}
