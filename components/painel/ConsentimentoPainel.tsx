"use client"

import { useState } from "react"

interface Props {
  menorDe18: boolean
  onAtivar: () => Promise<void>
  onAgoraNao: () => void
}

export function ConsentimentoPainel({ menorDe18, onAtivar, onAgoraNao }: Props) {
  const [ativando, setAtivando] = useState(false)

  async function ativar() {
    setAtivando(true)
    await onAtivar()
    setAtivando(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-finlow-card p-6 sm:rounded-3xl">
        <h2 className="text-xl font-bold text-finlow-text">Isso aqui guarda número de verdade</h2>

        <p className="mt-3 text-sm leading-relaxed text-finlow-muted">
          Diferente da Trilha, o Painel salva os valores que você digitar — contas, gastos, saldo.
          É seu controle financeiro de verdade, não só um exercício.
        </p>

        <ul className="mt-4 flex flex-col gap-2">
          <li className="flex items-start gap-2 text-sm text-finlow-muted">
            <span className="mt-0.5 text-finlow-green">•</span>
            Só você vê esses dados
          </li>
          <li className="flex items-start gap-2 text-sm text-finlow-muted">
            <span className="mt-0.5 text-finlow-green">•</span>
            Dá pra apagar tudo quando quiser, em Ajustes
          </li>
          {menorDe18 && (
            <li className="flex items-start gap-2 text-sm text-finlow-muted">
              <span className="mt-0.5 text-finlow-yellow">•</span>
              Aviso: seu responsável já autorizou o uso do app; isso aqui é uma funcionalidade
              dentro dele, não uma conta financeira nova.
            </li>
          )}
        </ul>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={ativar}
            disabled={ativando}
            className="w-full rounded-2xl bg-finlow-green py-4 text-base font-bold text-finlow-bg transition-opacity disabled:opacity-60"
          >
            {ativando ? "Ativando..." : "Ativar meu Painel"}
          </button>
          <button
            onClick={onAgoraNao}
            className="w-full rounded-2xl py-3 text-sm font-medium text-finlow-muted transition-colors hover:text-finlow-text"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  )
}
