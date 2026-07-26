// Migra telas da identidade antiga (navy #0D1B2A + verde #00C896) para a nova.
// Dois destinos: telas normais viram CLARAS; o card flow da trilha continua
// escuro (bloco imersivo), mas no verde-petróleo novo — igual às seções escuras
// da landing.
// Uso: node scripts/migrar-identidade.mjs
import { readFileSync, writeFileSync } from "fs"

const CLARO = [
  // hex antigos -> novos
  ["#0D1B2A", "#FAF9F6"], ["#0d1b2a", "#FAF9F6"],
  ["#1A2B3C", "#FFFFFF"], ["#1a2b3c", "#FFFFFF"],
  ["#00C896", "#2B6D70"], ["#00c896", "#2B6D70"],
  ["#33d6ab", "#215659"],
  ["#F5A623", "#B8863C"], ["#f5a623", "#B8863C"],
  ["#A0AEC0", "#5C6469"], ["#a0aec0", "#5C6469"],
  ["#F87171", "#AA4B3E"], ["#f87171", "#AA4B3E"],
  ["#E2E8F0", "#20262A"],
  ["rgba(0,200,150,", "rgba(43,109,112,"],
  ["rgba(0, 200, 150,", "rgba(43, 109, 112,"],
  ["rgba(245,166,35,", "rgba(184,134,60,"],
  // tokens tailwind antigos -> novos
  ["bg-finlow-bg", "bg-fl-page"],
  ["bg-finlow-card", "bg-white"],
  ["border-finlow-card", "border-fl-border"],
  ["border-finlow-bg", "border-fl-border"],
  ["text-finlow-text", "text-fl-ink"],
  ["text-finlow-muted", "text-fl-ink-2"],
  ["text-finlow-green", "text-fl-500"],
  ["bg-finlow-green", "bg-fl-500"],
  ["border-finlow-green", "border-fl-500"],
  ["text-finlow-yellow", "text-fl-accent-dark"],
  ["bg-finlow-yellow", "bg-fl-accent"],
  ["border-finlow-yellow", "border-fl-accent"],
  ["text-finlow-bg", "text-white"],
  ["text-white", "text-fl-ink"],
  ["placeholder-[#5C6469]", "placeholder-fl-ink-3"],
]

const ESCURO = [
  ["#0D1B2A", "#112F30"], ["#0d1b2a", "#112F30"],
  ["#1A2B3C", "#1B3B3C"], ["#1a2b3c", "#1B3B3C"],
  ["#00C896", "#5FA7A9"], ["#00c896", "#5FA7A9"],
  ["#F5A623", "#D3A75C"], ["#f5a623", "#D3A75C"],
  ["#A0AEC0", "#A7ADAF"], ["#a0aec0", "#A7ADAF"],
  ["#F87171", "#D08277"], ["#f87171", "#D08277"],
  ["rgba(0,200,150,", "rgba(95,167,169,"],
  ["rgba(0, 200, 150,", "rgba(95, 167, 169,"],
  ["bg-finlow-bg", "bg-[#112F30]"],
  ["bg-finlow-card", "bg-[#1B3B3C]"],
  ["text-finlow-text", "text-[#EDEEEC]"],
  ["text-finlow-muted", "text-[#A7ADAF]"],
  ["text-finlow-green", "text-[#5FA7A9]"],
  ["bg-finlow-green", "bg-[#5FA7A9]"],
]

const ARQUIVOS_CLAROS = [
  "app/(auth)/login/page.tsx",
  "app/(auth)/cadastro/page.tsx",
  "app/(app)/painel/page.tsx",
  "app/beta/page.tsx",
  "components/painel/ConsentimentoPainel.tsx",
  "components/painel/ModalBase.tsx",
  "components/painel/SeletorMes.tsx",
  "components/painel/ResultadoPeriodoCard.tsx",
  "components/painel/ContasFixasCard.tsx",
  "components/painel/TransacoesCard.tsx",
  "components/painel/CategoriasCard.tsx",
  "components/painel/GastoMedioPorDiaChart.tsx",
  "components/painel/DistribuicaoGastosChart.tsx",
  "components/painel/InsightPerfilCard.tsx",
]

const ARQUIVOS_ESCUROS = [
  "components/trilha/CardFlow.tsx",
  "components/trilha/ProgressSegments.tsx",
  "components/trilha/TelaConceito.tsx",
  "components/trilha/TelaCenario.tsx",
  "components/trilha/TelaQuiz.tsx",
  "components/trilha/TelaInput.tsx",
  "components/trilha/TelaResultado.tsx",
]

function aplicar(arquivo, mapa) {
  let txt
  try {
    txt = readFileSync(arquivo, "utf8")
  } catch {
    console.log(`  – ${arquivo} (não existe, ignorado)`)
    return
  }
  const antes = txt
  for (const [de, para] of mapa) txt = txt.split(de).join(para)
  if (txt !== antes) {
    writeFileSync(arquivo, txt)
    console.log(`  ✓ ${arquivo}`)
  } else {
    console.log(`  = ${arquivo} (nada a trocar)`)
  }
}

console.log("Telas claras:")
ARQUIVOS_CLAROS.forEach((f) => aplicar(f, CLARO))
console.log("Card flow (escuro novo):")
ARQUIVOS_ESCUROS.forEach((f) => aplicar(f, ESCURO))
