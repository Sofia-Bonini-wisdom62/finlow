import { Banknote, Zap, Target } from "lucide-react"

const benefits = [
  {
    icon: Banknote,
    title: "Sem jargão de adulto",
    description: "A gente explica do jeito que faz sentido pra você.",
  },
  {
    icon: Zap,
    title: "Resultado em 4 perguntas",
    description: "Rápido, direto e sem formulário gigante.",
  },
  {
    icon: Target,
    title: "Plano feito pra você",
    description: "Um caminho pensado pra sua grana e sua vida.",
  },
]

export function Benefits() {
  return (
    <ul className="flex flex-col gap-3">
      {benefits.map((benefit) => (
        <li
          key={benefit.title}
          className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <benefit.icon className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="font-medium leading-snug text-card-foreground">
              {benefit.title}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {benefit.description}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
