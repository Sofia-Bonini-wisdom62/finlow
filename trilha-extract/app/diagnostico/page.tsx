"use client"

import { DiagnosticoFlow } from "@/components/diagnostico-flow"

const perguntas = [
  {
    id: 1,
    texto: "De onde vem a maior parte do dinheiro que você recebe?",
    opcoes: [
      { letra: "A", texto: "Mesada dos meus pais" },
      { letra: "B", texto: "Freelas e bicos que eu faço" },
      { letra: "C", texto: "Um trabalho fixo" },
      { letra: "D", texto: "Mistura de várias fontes" },
    ],
  },
  {
    id: 2,
    texto: "Quando o dinheiro cai na sua mão, o que rola primeiro?",
    opcoes: [
      { letra: "A", texto: "Gasto quase tudo na hora" },
      { letra: "B", texto: "Guardo uma parte antes de gastar" },
      { letra: "C", texto: "Pago o que devo primeiro" },
      { letra: "D", texto: "Fico sem saber o que fazer" },
    ],
  },
  {
    id: 3,
    texto: "Você tem algum objetivo pra esse dinheiro?",
    opcoes: [
      { letra: "A", texto: "Comprar algo específico" },
      { letra: "B", texto: "Juntar pra uma viagem" },
      { letra: "C", texto: "Começar a investir" },
      { letra: "D", texto: "Ainda não pensei nisso" },
    ],
  },
  {
    id: 4,
    texto: "Como você se sente falando sobre dinheiro?",
    opcoes: [
      { letra: "A", texto: "Tranquilo, curto o assunto" },
      { letra: "B", texto: "Curioso, quero aprender mais" },
      { letra: "C", texto: "Meio perdido" },
      { letra: "D", texto: "Prefiro nem pensar" },
    ],
  },
]

export default function DiagnosticoPage() {
  return (
    <main className="min-h-dvh">
      <DiagnosticoFlow
        perguntas={perguntas}
        onConcluir={(respostas) => {
          console.log("[v0] Respostas:", respostas)
        }}
      />
    </main>
  )
}
