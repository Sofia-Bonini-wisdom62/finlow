/**
 * Testa as respostas prontas do onboarding.
 *
 * POR QUE ISTO EXISTE
 * A tela em branco é o que faz alguém abandonar o app no primeiro minuto, e a
 * correção depende de duas coisas que falham de jeitos diferentes:
 *
 *  - o CORTE (`sugestoesValidas`): erra devolvendo card longo demais ou
 *    duplicado, e aí a tela fica feia mas funciona;
 *  - o ROTEIRO (o prompt): erra devolvendo NADA, e aí a correção simplesmente
 *    não existe — a pessoa vê o mesmo campo vazio de antes e ninguém percebe,
 *    porque a conversa continua respondendo normalmente.
 *
 * O segundo é o perigoso, e é por isso que este teste fala com o modelo de
 * verdade em vez de só exercitar a função.
 *
 *   node --import tsx scripts/testar-sugestoes.mts          (só o corte)
 *   node --import tsx scripts/testar-sugestoes.mts --vivo   (corte + modelo)
 */
import { config } from "dotenv"
import { sugestoesValidas } from "../lib/ia.js"
// Tipo some na compilação, então importar aqui não carrega o cliente da Vertex
// — o que importa, porque sem --vivo este teste não deve falar com ninguém.
import type { MensagemChat, ContextoFinanceiro } from "../lib/ia.js"

config({ path: ".env.local" })
config({ path: ".env" })

let falhas = 0
const vivo = process.argv.includes("--vivo")

// ---------------------------------------------------------------- o corte ---
console.log("CORTE")

const casos: { nota: string; entrada: unknown; esperado: string[] }[] = [
  {
    nota: "passa o normal",
    entrada: ["Some antes do fim do mês", "Levei um susto com a fatura"],
    esperado: ["Some antes do fim do mês", "Levei um susto com a fatura"],
  },
  {
    nota: "corta em 4",
    entrada: ["um", "dois", "três", "quatro", "cinco", "seis"],
    esperado: ["um", "dois", "três", "quatro"],
  },
  {
    nota: "derruba longa demais",
    entrada: ["curta", "a".repeat(53)],
    esperado: ["curta"],
  },
  {
    nota: "aceita exatamente no limite",
    entrada: ["b".repeat(52)],
    esperado: ["b".repeat(52)],
  },
  {
    nota: "duplicata some, mesmo com caixa diferente",
    entrada: ["Some tudo", "SOME TUDO", "outra"],
    esperado: ["Some tudo", "outra"],
  },
  {
    nota: "espaço sobrando é normalizado",
    entrada: ["  Some   tudo  "],
    esperado: ["Some tudo"],
  },
  { nota: "não-string é ignorado", entrada: ["ok", 42, null, { a: 1 }], esperado: ["ok"] },
  { nota: "string vazia é ignorada", entrada: ["", "   ", "ok"], esperado: ["ok"] },
  { nota: "não-array vira lista vazia", entrada: "Some tudo", esperado: [] },
  { nota: "ausente vira lista vazia", entrada: undefined, esperado: [] },
]

for (const c of casos) {
  const obtido = sugestoesValidas(c.entrada)
  const ok = JSON.stringify(obtido) === JSON.stringify(c.esperado)
  if (!ok) {
    falhas++
    console.log(`  FALHA ${c.nota}`)
    console.log(`        esperado ${JSON.stringify(c.esperado)}`)
    console.log(`        obtido   ${JSON.stringify(obtido)}`)
  } else {
    console.log(`  ok    ${c.nota}`)
  }
}

// -------------------------------------------------------------- o roteiro ---
if (vivo) {
  console.log("\nROTEIRO (chamando o modelo)")

  const { responderIA } = await import("../lib/ia.js")
  const { promptOnboarding } = await import("../lib/prompts/onboarding.js")

  const semDados: ContextoFinanceiro = { temDados: false } as ContextoFinanceiro

  /** Roda um turno de onboarding como a rota roda. */
  async function turno(historico: [string, string][], numero: number) {
    const mensagens = historico.map(([papel, texto]) => ({
      papel: papel as "usuario" | "ia",
      texto,
    })) as MensagemChat[]
    return responderIA(mensagens, semDados, { ligada: false, conhecidas: [] }, {
      podeLancar: true,
      onboarding: true,
      modulos: [{ slug: "lancador-m1-fluxo", titulo: "Para onde vai o seu mês" }],
      sistemaExtra: promptOnboarding("Sofia", numero),
    })
  }

  const abertura =
    "O Finlow serve pra você saber para onde o seu dinheiro vai, sem planilha e sem culpa. " +
    "Pra começar bem: o que te fez procurar isso agora?"

  // 1. Turno com pergunta: tem de vir com opções.
  const r1 = await turno(
    [["ia", abertura], ["usuario", "Some tudo antes do fim do mês, nunca sei pra onde foi"]],
    2
  )
  const s1 = r1.sugestoes ?? []
  console.log(`  resposta: ${r1.texto.slice(0, 90)}…`)
  s1.forEach((s) => console.log(`     · ${s}  (${s.length})`))

  const terminaEmPergunta = r1.texto.trim().endsWith("?")
  if (terminaEmPergunta && s1.length < 3) {
    falhas++
    console.log(`  FALHA perguntou e devolveu ${s1.length} opção(ões); o mínimo é 3`)
  } else if (!terminaEmPergunta) {
    console.log("  (não terminou em pergunta — o contrato não exige opções aqui)")
  } else {
    console.log(`  ok    ${s1.length} opções na pergunta`)
  }

  // Distintas de verdade: quatro jeitos de dizer a mesma coisa não são escolha.
  const primeirasPalavras = new Set(s1.map((s) => s.toLowerCase().split(" ").slice(0, 2).join(" ")))
  if (s1.length >= 3 && primeirasPalavras.size < s1.length) {
    falhas++
    console.log("  FALHA opções começam iguais entre si — não oferecem caminhos diferentes")
  } else if (s1.length >= 3) {
    console.log("  ok    opções são distintas entre si")
  }

  // "Outro / prefiro escrever" é o campo de texto, não um card.
  const escapatoria = s1.find((s) => /^(outro|outra|prefiro escrever|nenhum)/i.test(s))
  if (escapatoria) {
    falhas++
    console.log(`  FALHA card de escapatória: "${escapatoria}"`)
  } else {
    console.log("  ok    sem card de escapatória")
  }

  // 2. Fecho: não pode oferecer resposta pronta para pergunta que não existe.
  const r2 = await turno(
    [
      ["ia", abertura],
      ["usuario", "Some tudo antes do fim do mês"],
      ["ia", "Entendi. E como a sua renda entra: salário fixo, ou varia?"],
      ["usuario", "Salário fixo todo dia 5"],
      ["ia", "Beleza. Me conta dois ou três gastos recentes, mesmo aproximado."],
      ["usuario", "Mercado 320, uber 45 e a academia 120. Acho que é isso, pode fechar"],
    ],
    6
  )
  console.log(`  fecho: concluido=${r2.concluido === true} sugestoes=${(r2.sugestoes ?? []).length}`)
  if (r2.concluido === true && (r2.sugestoes ?? []).length > 0) {
    falhas++
    console.log("  FALHA fechou a conversa e ainda ofereceu resposta pronta")
  } else {
    console.log("  ok    fecho sem resposta pronta")
  }
} else {
  console.log("\n(roteiro não testado — rode com --vivo para falar com o modelo)")
}

console.log(`\n${falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`}`)
process.exit(falhas === 0 ? 0 : 1)
