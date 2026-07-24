"use client"

import { useState } from "react"

const faqs = [
  { q: "O Finlow já está disponível?", a: "Ainda não — estamos em desenvolvimento ativo. Quem entra na lista de espera ganha acesso antecipado e gratuito assim que a primeira versão abrir." },
  { q: "Meus dados financeiros ficam seguros?", a: "Sim. Segurança e privacidade são inegociáveis: usamos conexão criptografada, nunca vendemos seus dados e a interface nunca vira espaço de anúncio. Seus dados são seus." },
  { q: "Preciso entender de finanças para usar?", a: "Não. O Finlow foi feito exatamente para quem nunca teve educação financeira formal. A IA traduz tudo em linguagem simples, sem jargão e sem julgamento." },
  { q: "Como a inteligência artificial ajuda no dia a dia?", a: "Ela categoriza suas transações automaticamente, revela padrões de gasto que passam despercebidos e responde suas perguntas em português — sempre com base nos seus números reais." },
  { q: "Vai ter custo?", a: "Entrar na lista de espera é gratuito. Os detalhes de planos serão definidos ao longo do desenvolvimento — quem entrar cedo terá condições especiais." },
]

export function Faq() {
  const [aberta, setAberta] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((f, i) => {
        const aberto = aberta === i
        return (
          <div key={f.q} className="overflow-hidden rounded-2xl border border-fl-border bg-white">
            <button
              onClick={() => setAberta(aberto ? null : i)}
              aria-expanded={aberto}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-[16px] font-semibold text-fl-ink sm:px-6 sm:text-[17px]"
            >
              {f.q}
              <span className="shrink-0 text-[22px] font-normal text-fl-500">{aberto ? "−" : "+"}</span>
            </button>
            {aberto && (
              <div className="px-5 pb-5 text-[15px] leading-relaxed text-fl-ink-2 sm:px-6 sm:text-[15.5px]">
                {f.a}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
