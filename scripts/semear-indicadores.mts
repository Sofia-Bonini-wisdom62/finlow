/**
 * Semeia os indicadores macro. Idempotente: upsert por chave.
 *
 * Atualizar a Selic depois disto é UPDATE nesta tabela, não deploy — que é o
 * ponto de ela existir.
 *
 *   node --import tsx scripts/semear-indicadores.mts
 */
import { config } from "dotenv"
config({ path: ".env.local" }); config({ path: ".env" })

const { db } = await import("../lib/db.js")
const { INDICADORES_INICIAIS } = await import("../lib/indicadores.js")

for (const i of INDICADORES_INICIAIS) {
  await db.indicador.upsert({
    where: { chave: i.chave },
    create: { ...i },
    // `valor`, `rotulo` e `numero` são atualizáveis; a chave não.
    update: { valor: i.valor, rotulo: i.rotulo, numero: i.numero, fonte: i.fonte, apuradoEm: i.apuradoEm },
  })
}

const todos = await db.indicador.findMany({ orderBy: { chave: "asc" } })
for (const i of todos) {
  console.log(`  ${i.chave.padEnd(18)} ${i.rotulo.padEnd(34)} ${i.fonte} · ${i.apuradoEm.toISOString().slice(0, 10)}`)
}
console.log(`\n${todos.length} indicadores`)
await db.$disconnect()
