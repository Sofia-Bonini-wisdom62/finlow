"use client"

import { useMemo } from "react"
import { Check, X } from "lucide-react"
import { ordemDoQuiz } from "@/lib/licoes"
import { POSE } from "@/lib/fin"
import { COMBO_ACENDE } from "@/lib/combo"
import type { ConteudoQuiz, OpcaoQuiz } from "@/types/trilha"

interface Props {
  conteudo: ConteudoQuiz
  // letra escolhida (estado vive no CardFlow — sobrevive ao voltar/avançar)
  selecionada: string | null
  onSelecionar: (letra: string) => void
  /** Entra na semente do embaralho — ver o comentário abaixo. */
  licao?: number
  /** O combo corrente (já contando esta resposta) — muda a pose do Fin. */
  combo?: number
}

/**
 * A ordem das opções é embaralhada NA EXIBIÇÃO, não nos dados.
 *
 * Motivo: no conteúdo gravado, metade das corretas estava na primeira posição
 * — quem clicasse sempre na primeira acertaria sem ler. Reescrever 60 quizzes
 * à mão só rebalancearia a foto de hoje; o próximo módulo escrito
 * desbalancearia de novo. Embaralhar ao exibir resolve para sempre, inclusive
 * para conteúdo antigo.
 *
 * O embaralho é DETERMINÍSTICO por pergunta (semente = headline): a mesma
 * pessoa vê a mesma ordem ao voltar de tela, e ordens diferentes entre
 * perguntas. A letra exibida é a da POSIÇÃO; a `letra` original vira só
 * identidade interna, que é o que o servidor confere ao dar os pontos.
 *
 * A LIÇÃO ENTRA NA SEMENTE porque a mesma pergunta aparece duas vezes: na
 * "Novo conceito!", com a explicação na tela anterior, e na "Revisão!",
 * sozinha. Com a mesma ordem nas duas, a revisão mediria "era a segunda
 * opção" em vez do conteúdo — que é exatamente o que uma revisão não deve
 * medir.
 */
export function TelaQuiz({ conteudo, selecionada, onSelecionar, licao, combo = 0 }: Props) {
  const opcoes = useMemo(
    () => ordemDoQuiz(conteudo.opcoes, conteudo.headline, licao ?? 1),
    [conteudo, licao]
  )

  function selecionar(opcao: OpcaoQuiz) {
    if (selecionada !== null) return
    onSelecionar(opcao.letra)
  }

  const opcaoSelecionada = conteudo.opcoes.find((o) => o.letra === selecionada)

  return (
    <div className="card-enter flex h-full flex-col justify-center gap-6 overflow-y-auto px-6 py-8">
      <h2 className="text-2xl font-bold leading-snug text-white">{conteudo.headline}</h2>

      <div className="flex flex-col gap-3">
        {opcoes.map((opcao, indice) => {
          const isSelected = selecionada === opcao.letra
          const isResponded = selecionada !== null
          const isCorreta = opcao.correta

          let borderColor = "border-[var(--fin-border-2)]"
          let bgColor = "bg-[var(--fin-surface)]"
          let textColor = "text-white"

          if (isResponded) {
            if (isCorreta) {
              borderColor = "border-[var(--fin-acerto)]"
              bgColor = "bg-[var(--fin-acerto)]/10"
            } else if (isSelected && !isCorreta) {
              borderColor = "border-[var(--fin-erro)]"
              bgColor = "bg-[var(--fin-erro)]/10"
              textColor = "text-[var(--fin-erro)]"
            } else {
              textColor = "text-[var(--fin-muted)]"
            }
          }

          return (
            <button
              key={opcao.letra}
              onClick={() => selecionar(opcao)}
              disabled={isResponded}
              className={`flex items-start gap-3 rounded-2xl border-2 ${borderColor} ${bgColor} p-4 text-left transition-all duration-200 disabled:cursor-default`}
            >
              <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border ${borderColor} text-xs font-bold ${textColor}`}>
                {isResponded && isCorreta ? (
                  <Check className="size-4 text-[var(--fin-acerto)]" aria-label="Correta" />
                ) : isResponded && isSelected && !isCorreta ? (
                  <X className="size-4 text-[var(--fin-erro)]" aria-label="Incorreta" />
                ) : (
                  // Letra da POSIÇÃO exibida, não a dos dados: depois do
                  // embaralho, a letra gravada deixa de corresponder à ordem.
                  String.fromCharCode(65 + indice)
                )}
              </span>
              <span className={`text-sm leading-relaxed ${textColor}`}>{opcao.texto}</span>
            </button>
          )
        })}
      </div>

      {/* O Fin reage — bolha de fala no lugar do card seco de antes. */}
      {opcaoSelecionada && (
        <div className="fin-slide-up flex items-end gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              opcaoSelecionada.correta
                ? combo >= COMBO_ACENDE
                  ? POSE.stars
                  : POSE.cheer
                : POSE.worried
            }
            alt=""
            className="fin-pop size-[72px] shrink-0 object-contain"
          />
          <div
            className="flex-1 rounded-2xl rounded-bl-sm border px-3.5 py-3"
            style={{
              background: "var(--fin-surface)",
              borderColor: opcaoSelecionada.correta ? "var(--fin-acerto)" : "var(--fin-erro)",
            }}
          >
            <div
              className="text-[11px] font-black uppercase tracking-wide"
              style={{ color: opcaoSelecionada.correta ? "var(--fin-acerto)" : "var(--fin-erro)" }}
            >
              {opcaoSelecionada.correta
                ? combo >= COMBO_ACENDE
                  ? "Incrível!"
                  : "Boa!"
                : "Quase lá"}
            </div>
            <p className="mt-0.5 text-sm leading-relaxed" style={{ color: "var(--fin-text)" }}>
              {opcaoSelecionada.feedback}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
