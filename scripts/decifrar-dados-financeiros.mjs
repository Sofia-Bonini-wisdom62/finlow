/**
 * Volta atrás: decifra os dados financeiros e devolve as colunas `valor` para
 * numeric. Existe para o caso de precisar restaurar o serviço ANTES de a
 * ENCRYPTION_KEY estar na Vercel — com o código antigo no ar, o banco cifrado
 * quebra as telas financeiras.
 *
 *   node scripts/decifrar-dados-financeiros.mjs
 *
 * Depois de rodar, o repositório volta ao estado pré-criptografia e o deploy
 * atual funciona de novo. Para refazer a migração mais tarde:
 *   1. ENCRYPTION_KEY na Vercel
 *   2. merge da branch
 *   3. node scripts/cifrar-dados-financeiros.mjs
 *
 * Idempotente: linha já em claro é pulada. Exige a MESMA chave usada para
 * cifrar — sem ela não há como voltar.
 */
import { PrismaClient } from "@prisma/client"
import { createDecipheriv } from "node:crypto"

const bruta = process.env.ENCRYPTION_KEY
if (!bruta) {
  console.error("ENCRYPTION_KEY ausente — sem ela não dá para decifrar. Abortado.")
  process.exit(1)
}
const CHAVE = Buffer.from(bruta, "base64")
if (CHAVE.length !== 32) {
  console.error(`ENCRYPTION_KEY deve ter 32 bytes em base64 (tem ${CHAVE.length}). Abortado.`)
  process.exit(1)
}

const cifrado = (v) => typeof v === "string" && v.startsWith("v1.")

function decifrar(valor, userId, campo) {
  if (!cifrado(valor)) return valor
  const [, iv, tag, ct] = valor.split(".")
  const d = createDecipheriv("aes-256-gcm", CHAVE, Buffer.from(iv, "base64url"))
  d.setAAD(Buffer.from(`${userId}:${campo}`, "utf8"))
  d.setAuthTag(Buffer.from(tag, "base64url"))
  return Buffer.concat([d.update(Buffer.from(ct, "base64url")), d.final()]).toString("utf8")
}

const db = new PrismaClient()
let n = 0

for (const t of await db.transacao.findMany()) {
  const dados = {}
  for (const campo of ["descricao", "valor"]) {
    if (cifrado(t[campo])) dados[campo] = decifrar(t[campo], t.userId, campo)
  }
  if (Object.keys(dados).length) { await db.transacao.update({ where: { id: t.id }, data: dados }); n++ }
}
for (const c of await db.contaFixa.findMany()) {
  const dados = {}
  for (const campo of ["nome", "valor"]) {
    if (cifrado(c[campo])) dados[campo] = decifrar(c[campo], c.userId, campo)
  }
  if (Object.keys(dados).length) { await db.contaFixa.update({ where: { id: c.id }, data: dados }); n++ }
}

// devolve o tipo numérico que o código pré-criptografia espera
await db.$executeRawUnsafe(`ALTER TABLE "Transacao" ALTER COLUMN "valor" TYPE NUMERIC USING "valor"::numeric`)
await db.$executeRawUnsafe(`ALTER TABLE "ContaFixa" ALTER COLUMN "valor" TYPE NUMERIC USING "valor"::numeric`)

console.log(`${n} registros decifrados; colunas valor de volta para numeric.`)
console.log("Lembre de reverter prisma/schema.prisma (valor: Decimal) antes de rodar prisma generate.")
await db.$disconnect()
