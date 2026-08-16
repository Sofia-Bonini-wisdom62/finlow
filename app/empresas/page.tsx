import type { Metadata } from "next"
import Link from "next/link"
import { Inter } from "next/font/google"
import { MessageCircle, ShieldCheck, TrendingUp } from "lucide-react"
import { LeadEmpresaForm } from "@/components/landing/LeadEmpresaForm"

/**
 * Landing B2B: Finlow como benefício de bem-estar financeiro para equipes.
 *
 * SEM preço público de propósito (decisão do plano): o formulário abre uma
 * conversa comercial. Mesma identidade da landing principal — é a mesma
 * marca falando com outra pessoa, o RH em vez do usuário final.
 */

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] })

export const metadata: Metadata = {
  title: "Finlow para empresas: bem-estar financeiro como benefício",
  description:
    "Clareza financeira com IA para o time inteiro: menos estresse com dinheiro, mais foco no trabalho. Fale com a gente.",
}

function LogoMarca({ tamanho = 30 }: { tamanho?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Finlow"
      width={tamanho}
      height={tamanho}
      className="shrink-0 rounded-[22%]"
      style={{ width: tamanho, height: tamanho }}
    />
  )
}

const PROVAS = [
  {
    Icone: TrendingUp,
    titulo: "Estresse financeiro custa produtividade",
    texto:
      "Quem está com o rotativo rodando leva o problema pro expediente. Clareza sobre o próprio dinheiro devolve foco, e o Finlow entrega isso em minutos, não em consultoria.",
  },
  {
    Icone: MessageCircle,
    titulo: "Um assistente, não uma planilha",
    texto:
      "Cada pessoa do time conversa com a IA sobre os números dela: extrato lido na hora, diagnóstico de vazamento, trilhas de 2 minutos. Sem treinamento, sem manual.",
  },
  {
    Icone: ShieldCheck,
    titulo: "Privacidade de verdade",
    texto:
      "A empresa NUNCA vê os dados de ninguém. Valores são cifrados um a um, e o que a empresa recebe é adesão agregada: nada individual, nem sob pedido.",
  },
]

export default function EmpresasPage() {
  return (
    <div className={`${inter.className} min-h-dvh overflow-x-hidden bg-fl-page text-fl-ink [font-variant-numeric:tabular-nums]`}>
      <header className="sticky top-0 z-50 border-b border-fl-divider bg-fl-page/[0.82] backdrop-blur-[14px]">
        <nav className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-5 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMarca />
            <span className="text-[19px] font-bold tracking-tight">Finlow</span>
            <span className="mt-0.5 rounded-full bg-fl-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-fl-500">
              empresas
            </span>
          </Link>
          <a
            href="#conversa"
            className="flex min-h-11 items-center rounded-xl bg-fl-500 px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-fl-600 sm:px-5"
          >
            Falar com a gente
          </a>
        </nav>
      </header>

      {/* hero */}
      <section className="mx-auto max-w-[760px] px-5 pb-12 pt-16 text-center sm:px-6 lg:pt-24">
        <h1 className="text-balance text-[34px] font-extrabold leading-[1.08] tracking-[-.03em] lg:text-[46px]">
          Bem-estar financeiro como benefício, sem virar mais um app que ninguém abre
        </h1>
        <p className="mx-auto mt-5 max-w-[560px] text-[16.5px] leading-[1.6] text-fl-ink-2">
          O Finlow dá ao seu time um assistente de IA que lê o extrato, mostra para
          onde o dinheiro vai e ensina o próximo passo, na linguagem de quem não é
          do financeiro.
        </p>
      </section>

      {/* provas */}
      <section className="mx-auto grid max-w-[1100px] gap-4 px-5 pb-16 sm:px-6 md:grid-cols-3">
        {PROVAS.map((p) => (
          <div key={p.titulo} className="rounded-[20px] border border-fl-border bg-fl-card p-6">
            <p.Icone className="size-6 text-fl-500" />
            <h2 className="mt-3 text-[16.5px] font-bold leading-snug">{p.titulo}</h2>
            <p className="mt-2 text-sm leading-[1.6] text-fl-ink-2">{p.texto}</p>
          </div>
        ))}
      </section>

      {/* formulário */}
      <section id="conversa" className="mx-auto max-w-[560px] px-5 pb-24 sm:px-6">
        <div className="rounded-[24px] border border-fl-border bg-fl-card p-6 sm:p-8">
          <h2 className="text-[24px] font-extrabold leading-tight tracking-[-.02em]">
            Vamos conversar?
          </h2>
          <p className="mb-6 mt-1.5 text-sm leading-relaxed text-fl-ink-2">
            Conta quem vocês são e a gente volta com uma proposta do tamanho do seu
            time. Sem compromisso.
          </p>
          <LeadEmpresaForm />
        </div>
      </section>

      <footer className="border-t border-fl-divider px-5 py-8 text-center text-[12.5px] text-fl-ink-3 sm:px-6">
        © 2026 Finlow · <Link href="/" className="hover:text-fl-500">Página principal</Link>
      </footer>
    </div>
  )
}
