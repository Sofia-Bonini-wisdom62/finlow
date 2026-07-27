// Snapshot em claro de tudo que a migração de criptografia vai tocar.
// Rodar ANTES do backfill. O arquivo sai em backups/ (ignorado pelo git).
import { PrismaClient } from "@prisma/client"
import { writeFileSync, mkdirSync } from "node:fs"
const db = new PrismaClient()
mkdirSync("backups", { recursive: true })

const dados = {
  geradoEm: new Date().toISOString(),
  transacoes: await db.transacao.findMany(),
  contasFixas: await db.contaFixa.findMany(),
  categorias: await db.categoria.findMany(),
}
const arq = `backups/financeiro-${Date.now()}.json`
writeFileSync(arq, JSON.stringify(dados, null, 2))
console.log(`backup: ${arq}`)
console.log(`  transacoes: ${dados.transacoes.length}`)
console.log(`  contasFixas: ${dados.contasFixas.length}`)
console.log(`  categorias: ${dados.categorias.length}`)
await db.$disconnect()
