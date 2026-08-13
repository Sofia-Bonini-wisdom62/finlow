"use client"

import type { TelaData, SessaoFluxo } from "@/types/trilha"
import { TelaConceito } from "./TelaConceito"
import { TelaCenario } from "./TelaCenario"
import { TelaQuiz } from "./TelaQuiz"
import { TelaInput } from "./TelaInput"
import { TelaResultado } from "./TelaResultado"

interface Props {
  tela: TelaData
  sessao: SessaoFluxo
  quizSelecionada: string | null
  onQuizSelecionar: (letra: string) => void
  onInputMudou: (valores: SessaoFluxo) => void
  /** Qual lição está sendo jogada — muda a ordem das opções do quiz. */
  licao?: number
  /** O combo corrente — decide a pose e a fala do Fin no feedback do quiz. */
  combo?: number
}

export function TelaRenderer({ tela, sessao, quizSelecionada, onQuizSelecionar, onInputMudou, licao, combo }: Props) {
  switch (tela.tipo) {
    case "conceito":
      return <TelaConceito conteudo={tela.conteudo as Parameters<typeof TelaConceito>[0]["conteudo"]} />
    case "cenario":
      return <TelaCenario conteudo={tela.conteudo as Parameters<typeof TelaCenario>[0]["conteudo"]} />
    case "quiz":
      return (
        <TelaQuiz
          conteudo={tela.conteudo as Parameters<typeof TelaQuiz>[0]["conteudo"]}
          selecionada={quizSelecionada}
          onSelecionar={onQuizSelecionar}
          licao={licao}
          combo={combo}
        />
      )
    case "input":
      return <TelaInput conteudo={tela.conteudo as Parameters<typeof TelaInput>[0]["conteudo"]} sessao={sessao} onMudou={onInputMudou} />
    case "resultado":
      return <TelaResultado conteudo={tela.conteudo as Parameters<typeof TelaResultado>[0]["conteudo"]} sessao={sessao} />
    default:
      return null
  }
}
