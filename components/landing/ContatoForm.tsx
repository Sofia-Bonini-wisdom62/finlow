"use client"

import { useState } from "react"
import { EMAIL_CONTATO } from "@/lib/constantes"

const inputClass =
  "w-full rounded-xl border border-white/10 bg-finlow-card px-4 py-3 text-[15px] text-finlow-text placeholder-finlow-muted outline-none transition-colors focus:border-finlow-green"

// Sem backend de email por ora: o form monta a mensagem e abre o app de
// email do usuário via mailto (honesto e funcional — nada some no vazio).
export function ContatoForm() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [assunto, setAssunto] = useState("Quero saber mais sobre o app")
  const [mensagem, setMensagem] = useState("")
  const [enviado, setEnviado] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const corpo = `Nome: ${nome}\nEmail: ${email}\n\n${mensagem}`
    window.location.href = `mailto:${EMAIL_CONTATO}?subject=${encodeURIComponent(
      `[Site] ${assunto}`
    )}&body=${encodeURIComponent(corpo)}`
    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="rounded-3xl border border-white/10 bg-finlow-bg p-9 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-finlow-green/15">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <p className="text-xl font-bold text-finlow-text">Quase lá!</p>
        <p className="mt-2 text-[15px] text-finlow-muted">
          Seu app de e-mail abriu com a mensagem pronta — é só enviar. Se não abriu, escreve direto pra{" "}
          <a href={`mailto:${EMAIL_CONTATO}`} className="font-semibold text-finlow-green">{EMAIL_CONTATO}</a>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-finlow-bg p-6 sm:p-9">
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ct-nome" className="mb-1.5 block text-[13px] font-bold text-finlow-muted">Nome</label>
            <input id="ct-nome" type="text" placeholder="Seu nome" required value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="ct-email" className="mb-1.5 block text-[13px] font-bold text-finlow-muted">E-mail</label>
            <input id="ct-email" type="email" placeholder="voce@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="ct-assunto" className="mb-1.5 block text-[13px] font-bold text-finlow-muted">Assunto</label>
          <select id="ct-assunto" value={assunto} onChange={(e) => setAssunto(e.target.value)} className={inputClass}>
            <option>Quero saber mais sobre o app</option>
            <option>Parceria com escola</option>
            <option>Imprensa</option>
            <option>Outro</option>
          </select>
        </div>
        <div>
          <label htmlFor="ct-msg" className="mb-1.5 block text-[13px] font-bold text-finlow-muted">Mensagem</label>
          <textarea id="ct-msg" rows={4} placeholder="Como podemos ajudar?" required value={mensagem} onChange={(e) => setMensagem(e.target.value)} className={`${inputClass} resize-y`} />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-finlow-green py-4 text-base font-extrabold text-finlow-bg transition-colors hover:bg-[#33d6ab]"
        >
          Enviar mensagem
        </button>
      </div>
    </form>
  )
}
