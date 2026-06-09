import Link from "next/link"
import { Benefits } from "@/components/benefits"

export default function Page() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, rgba(0, 200, 150, 0.14) 0%, rgba(13, 27, 42, 0) 55%), radial-gradient(90% 60% at 90% 110%, rgba(245, 166, 35, 0.08) 0%, rgba(13, 27, 42, 0) 60%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[390px] flex-1 flex-col px-6 pb-10 pt-12 lg:max-w-5xl lg:flex-row lg:items-center lg:gap-20 lg:px-16 lg:pt-0">

        {/* Coluna esquerda — hero */}
        <div className="flex flex-1 flex-col lg:py-24">
          <div className="flex items-center">
            <span className="text-2xl font-bold tracking-tight text-primary lg:text-3xl">
              Finlow
            </span>
          </div>

          <div className="mt-16 flex flex-col lg:mt-12">
            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              Pra quem já tem a própria grana
            </span>

            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground lg:text-6xl">
              Seu dinheiro,<br className="hidden lg:block" /> suas regras.
            </h1>

            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground lg:mt-6 lg:text-lg lg:max-w-md">
              Descobre o que fazer com o que você já tem — sem enrolação.
            </p>

            <div className="mt-8 flex flex-col items-center gap-2 lg:items-start lg:mt-10">
              <Link
                href="/diagnostico"
                className="flex h-14 w-full items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors lg:w-64"
              >
                Descobrir meu perfil
              </Link>
              <p className="text-xs text-muted-foreground">
                Leva menos de 2 minutos
              </p>
            </div>
          </div>
        </div>

        {/* Coluna direita — benefícios (só no desktop) */}
        <div className="mt-12 lg:mt-0 lg:w-96">
          <Benefits />
        </div>

      </div>
    </main>
  )
}
