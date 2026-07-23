import Link from "next/link"
import { ArrowLeft } from "lucide-react"

// ⚠️ TROCAR pelo link real do Google Forms de beta testers
const GOOGLE_FORMS_BETA_URL = "https://forms.gle/SEU-LINK-AQUI"

export default function BetaPage() {
  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center px-6 py-10 text-center"
      style={{ background: "radial-gradient(ellipse at top, rgba(0,200,150,0.1), transparent 55%), #0D1B2A" }}
    >
      <div className="w-full max-w-md">
        <span className="text-2xl font-bold tracking-tight text-finlow-green">Finlow</span>

        <div className="mt-10 text-5xl" aria-hidden>
          💚
        </div>

        <h1 className="mt-6 text-balance text-3xl font-bold text-finlow-text">
          Eii, ainda não disponibilizamos a assinatura
        </h1>

        <p className="mt-4 text-pretty text-base leading-relaxed text-finlow-muted">
          O Premium tá quase pronto — e antes de abrir pra todo mundo, a gente quer construir ele
          com quem usa de verdade. Você gostaria de ser um dos nossos <strong className="text-finlow-text">beta testers</strong>?
          Acesso antecipado, contato direto com a gente e voz ativa no que vem por aí.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href={GOOGLE_FORMS_BETA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-2xl bg-finlow-green py-4 text-base font-bold text-finlow-bg transition-colors hover:bg-[#33d6ab]"
          >
            Quero ser beta tester
          </a>
          <Link
            href="/cadastro"
            className="w-full rounded-2xl border border-white/15 py-4 text-base font-semibold text-finlow-text transition-colors hover:border-finlow-green hover:text-finlow-green"
          >
            Começar pelo plano gratuito
          </Link>
        </div>

        <Link href="/" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-finlow-muted transition-colors hover:text-finlow-text">
          <ArrowLeft className="size-4" />
          Voltar pro início
        </Link>
      </div>
    </main>
  )
}
