"use client"

import { useState } from "react"

/**
 * Esta lista é a resposta pública sobre o que o produto é HOJE. Ela passou
 * meses dizendo "ainda não" com o app inteiro no ar e o cadastro aberto no
 * mesmo domínio — o Menu do app logado aponta para cá ("Perguntas frequentes"),
 * então quem já era usuário lia que o produto que ele estava usando não
 * existia. Antes de mudar uma resposta, confira o que o código faz.
 */
const faqs = [
  { q: "O Finlow já está disponível?", a: "Sim. Dá para criar conta e usar hoje, de graça: subir seu extrato, ver o painel, conversar com a IA sobre seus números e fazer a trilha de educação financeira. O produto segue em desenvolvimento ativo, então coisas novas continuam entrando." },
  { q: "Meus dados financeiros ficam seguros?", a: "Sim. Segurança e privacidade são inegociáveis: usamos conexão criptografada, nunca vendemos seus dados e a interface nunca vira espaço de anúncio. Seus dados são seus." },
  { q: "Preciso entender de finanças para usar?", a: "Não. O Finlow foi feito exatamente para quem nunca teve educação financeira formal. A IA traduz tudo em linguagem simples, sem jargão e sem julgamento." },
  { q: "Como a inteligência artificial ajuda no dia a dia?", a: "Ela categoriza suas transações automaticamente, revela padrões de gasto que passam despercebidos e responde suas perguntas em português. Sempre com base nos seus números reais." },
  { q: "Vai ter custo?", a: "Criar conta e usar o Finlow é grátis, com um limite mensal de uso da inteligência artificial. Para quem quiser a IA sem limite existe um plano premium opcional — nada é cobrado sem você escolher e confirmar. Quem chega agora, no começo, terá condições especiais." },
]

export function Faq() {
  const [aberta, setAberta] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((f, i) => {
        const aberto = aberta === i
        return (
          <div key={f.q} className="overflow-hidden rounded-2xl border border-fl-border bg-fl-card">
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
