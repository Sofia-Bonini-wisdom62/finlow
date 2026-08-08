/**
 * Dá a cada módulo o valor que ele vale, pelo nível.
 *
 * 30 iniciante · 40 intermediário · 50 avançado — a régua que veio com a
 * trilha escolar, aplicada a TODOS os módulos (decisão da fundadora,
 * 07/08/2026).
 *
 * POR QUE PRECISOU DE SCRIPT
 * Os 67 módulos que já estavam no banco tinham `pontos = 50` — não porque
 * alguém tenha decidido que valem 50, mas porque esse era o default da coluna
 * `xp`, que ninguém lia. Ligar o crédito à coluna sem corrigir isso faria todo
 * módulo, do mais simples ao mais difícil, pagar o teto da escala.
 *
 * Não mexe em ponto já creditado: EventoPontuacao é imutável e o refId é o
 * módulo, então quem concluiu antes fica com o que recebeu.
 *
 *   node --import tsx scripts/pontos-por-nivel.mts            → mostra
 *   node --import tsx scripts/pontos-por-nivel.mts --aplicar  → grava
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

const { db } = await import("../lib/db.js")

const POR_NIVEL: Record<string, number> = {
  iniciante: 30,
  intermediario: 40,
  avancado: 50,
}

const aplicar = process.argv.includes("--aplicar")

try {
  const modulos = await db.modulo.findMany({
    select: { id: true, slug: true, nivel: true, pontos: true, publico: true },
    orderBy: [{ publico: "asc" }, { ordem: "asc" }],
  })

  const mudam = modulos
    .map((m) => ({ ...m, novo: POR_NIVEL[m.nivel] ?? 30 }))
    .filter((m) => m.novo !== m.pontos)

  const resumo: Record<string, number> = {}
  for (const m of modulos) {
    const novo = POR_NIVEL[m.nivel] ?? 30
    resumo[`${m.nivel} → ${novo}`] = (resumo[`${m.nivel} → ${novo}`] ?? 0) + 1
  }

  console.log(`${modulos.length} módulos no banco · ${mudam.length} mudam de valor\n`)
  for (const [k, v] of Object.entries(resumo).sort()) console.log(`  ${String(v).padStart(3)}x  ${k}`)

  if (!aplicar) {
    console.log(`\nSimulação. Rode com --aplicar para gravar.`)
  } else {
    let n = 0
    for (const [nivel, pontos] of Object.entries(POR_NIVEL)) {
      const r = await db.modulo.updateMany({ where: { nivel }, data: { pontos } })
      n += r.count
    }
    console.log(`\n${n} módulos atualizados.`)
  }
} finally {
  await db.$disconnect()
}
