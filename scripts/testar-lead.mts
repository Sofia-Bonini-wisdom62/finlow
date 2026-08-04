/**
 * Testa a captação B2B: o limitador de taxa (puro, relógio congelado) e o
 * upsert do lead no banco.
 *
 *   node --import tsx scripts/testar-lead.mts
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

const { permitido } = await import("../lib/limite-taxa.js")
const { db } = await import("../lib/db.js")

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

// ------------------------------------------------------ limite de taxa ---
console.log("LIMITE DE TAXA (relógio congelado)")

const T0 = 1_000_000
checar("até o teto, passa", [1, 2, 3].every((i) => permitido("ip-a", 3, 1000, T0 + i)))
checar("o quarto na janela é barrado", !permitido("ip-a", 3, 1000, T0 + 4))
checar("outra chave não é afetada", permitido("ip-b", 3, 1000, T0 + 4))
checar("janela vencida libera de novo", permitido("ip-a", 3, 1000, T0 + 2000))

// ------------------------------------------------------------- upsert ---
console.log("\nLEAD NO BANCO")

const email = `teste-lead-${Date.now()}@exemplo.invalido`
try {
  await db.leadEmpresa.deleteMany({ where: { email: { endsWith: "@exemplo.invalido" } } })

  await db.leadEmpresa.create({ data: { empresa: "ACME", nome: "Teste", email } })
  await db.leadEmpresa.upsert({
    where: { email },
    create: { empresa: "ACME", nome: "Teste", email },
    update: { empresa: "ACME Ltda", tamanho: "11-50" },
  })

  const linhas = await db.leadEmpresa.findMany({ where: { email } })
  checar("reenviar não duplica", linhas.length === 1)
  checar("reenviar atualiza os campos", linhas[0]?.empresa === "ACME Ltda" && linhas[0]?.tamanho === "11-50")
} finally {
  const r = await db.leadEmpresa.deleteMany({ where: { email: { endsWith: "@exemplo.invalido" } } })
  console.log(`\n[limpeza] ${r.count} lead(s) descartável(is) removido(s)`)
  await db.$disconnect()
}

console.log(falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`)
process.exit(falhas === 0 ? 0 : 1)
