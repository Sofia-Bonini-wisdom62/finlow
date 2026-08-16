/**
 * Bateria do roteador de consultas da IA (lib/roteador-ia.ts) — sem banco:
 * exercita só os DETECTORES, com frases como as pessoas escrevem. É o que
 * deixa alguém mexer no regex sem medo: frase real que quebrar aparece aqui.
 *
 * Rodar: node --import tsx scripts/testar-roteador.mts
 */
import { consultaQueCasa } from "../lib/roteador-ia.js"

let falhas = 0
function checar(nome: string, cond: boolean, extra = "") {
  console.log(`  ${cond ? "ok   " : "FALHA"} ${nome}${extra ? `  ${extra}` : ""}`)
  if (!cond) falhas++
}

console.log("ROTEADOR — frases que DEVEM cair no resumo de aprendizado")
const casam = [
  "me faz um resumo do que eu aprendi",
  "resume o que estudei na trilha",
  "Resumo das aulas que fiz, por favor",
  "quais módulos eu já concluí?",
  "que lições eu já fiz?",
  "o que eu já aprendi até agora?",
  "quero revisar o que aprendi nos exercícios",
  "me ajuda a relembrar as aulas da trilha",
]
for (const frase of casam) {
  checar(`"${frase}"`, consultaQueCasa(frase) === "resumo_aprendizado")
}

console.log("\nROTEADOR — frases que NÃO devem rotear (conversa normal)")
const naoCasam = [
  "quanto gastei em julho?",
  "me dá um resumo do meu mês",
  "resumo dos meus gastos",
  "vale a pena parcelar?",
  "como economizo R$ 300 este mês?",
  "quero revisar meu orçamento",
  "explica o que é CDI",
]
for (const frase of naoCasam) {
  const r = consultaQueCasa(frase)
  checar(`"${frase}"`, r === null, r ? `caiu em ${r}` : "")
}

console.log(`\n${falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`}`)
process.exit(falhas === 0 ? 0 : 1)
