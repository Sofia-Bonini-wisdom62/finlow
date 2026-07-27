/**
 * Backfill: cifra os dados financeiros que já existem no banco.
 *
 * Idempotente — linha já cifrada (prefixo "v1.") é pulada, então rodar duas
 * vezes não cifra em cima da cifra. Roda em transação por usuário, e valida
 * decifrando de volta antes de dar a linha por convertida.
 *
 * Ordem obrigatória:
 *   1. node scripts/backup-financeiro.mjs      (snapshot em claro)
 *   2. ALTER das colunas valor para TEXT       (já aplicado)
 *   3. node scripts/cifrar-dados-financeiros.mjs
 *
 * Exige ENCRYPTION_KEY no ambiente. Sem ela o script se recusa a rodar.
 */
import { PrismaClient } from "@prisma/client"
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"

const PREFIXO = "v1"
const bruta = process.env.ENCRYPTION_KEY
if (!bruta) {
  console.error("ENCRYPTION_KEY ausente. Abortado — nada foi tocado.")
  process.exit(1)
}
const CHAVE = Buffer.from(bruta, "base64")
if (CHAVE.length !== 32) {
  console.error(`ENCRYPTION_KEY deve ter 32 bytes em base64 (tem ${CHAVE.length}). Abortado.`)
  process.exit(1)
}

const cifrado = (v) => typeof v === "string" && v.startsWith(PREFIXO + ".")

function cifrar(texto, userId, campo) {
  const iv = randomBytes(12)
  const c = createCipheriv("aes-256-gcm", CHAVE, iv)
  c.setAAD(Buffer.from(`${userId}:${campo}`, "utf8"))
  const ct = Buffer.concat([c.update(String(texto), "utf8"), c.final()])
  return [PREFIXO, iv.toString("base64url"), c.getAuthTag().toString("base64url"), ct.toString("base64url")].join(".")
}

function decifrar(valor, userId, campo) {
  const [, ivB64, tagB64, ctB64] = valor.split(".")
  const d = createDecipheriv("aes-256-gcm", CHAVE, Buffer.from(ivB64, "base64url"))
  d.setAAD(Buffer.from(`${userId}:${campo}`, "utf8"))
  d.setAuthTag(Buffer.from(tagB64, "base64url"))
  return Buffer.concat([d.update(Buffer.from(ctB64, "base64url")), d.final()]).toString("utf8")
}

const db = new PrismaClient()
let convertidas = 0
let puladas = 0

async function migrar(nome, registros, campos, atualizar) {
  for (const r of registros) {
    const dados = {}
    for (const campo of campos) {
      const atual = r[campo]
      if (atual === null || atual === undefined) continue
      if (cifrado(atual)) { continue }
      const cifra = cifrar(atual, r.userId, campo)
      // só aceita a conversão se a volta bater exatamente
      if (decifrar(cifra, r.userId, campo) !== String(atual)) {
        throw new Error(`Verificação falhou em ${nome} ${r.id}, campo ${campo}. Nada foi gravado nessa linha.`)
      }
      dados[campo] = cifra
    }
    if (Object.keys(dados).length === 0) { puladas++; continue }
    await atualizar(r.id, dados)
    convertidas++
  }
}

console.log("lendo…")
const transacoes = await db.transacao.findMany()
const contas = await db.contaFixa.findMany()
console.log(`  ${transacoes.length} transações, ${contas.length} contas fixas`)

await migrar("Transacao", transacoes, ["descricao", "valor"], (id, data) =>
  db.transacao.update({ where: { id }, data })
)
await migrar("ContaFixa", contas, ["nome", "valor"], (id, data) =>
  db.contaFixa.update({ where: { id }, data })
)

// conferência final: tudo cifrado e decifrável
const depois = await db.transacao.findMany()
const contasDepois = await db.contaFixa.findMany()
let erros = 0
for (const t of depois) {
  for (const campo of ["descricao", "valor"]) {
    if (!cifrado(t[campo])) { console.error(`  ! ainda em claro: Transacao ${t.id}.${campo}`); erros++; continue }
    try { decifrar(t[campo], t.userId, campo) } catch { console.error(`  ! não decifra: Transacao ${t.id}.${campo}`); erros++ }
  }
}
for (const c of contasDepois) {
  for (const campo of ["nome", "valor"]) {
    if (!cifrado(c[campo])) { console.error(`  ! ainda em claro: ContaFixa ${c.id}.${campo}`); erros++; continue }
    try { decifrar(c[campo], c.userId, campo) } catch { console.error(`  ! não decifra: ContaFixa ${c.id}.${campo}`); erros++ }
  }
}

console.log(`\nconvertidas: ${convertidas} | já cifradas: ${puladas} | erros: ${erros}`)
await db.$disconnect()
process.exit(erros ? 1 : 0)
