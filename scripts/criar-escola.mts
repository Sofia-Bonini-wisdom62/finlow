/**
 * Cria uma escola e a conta do adm dela. É a ÚNICA porta de entrada de escola
 * — não existe UI de signup B2B, e isso é decisão: a venda é manual e a
 * cobrança B2B fica fora deste repo por enquanto (docs/backlog-produto.md).
 *
 * Roda em SIMULAÇÃO por padrão. Grava só com `--aplicar`, e isso não é
 * cerimônia: o banco deste projeto é o de produção.
 *
 *   node --import tsx scripts/criar-escola.mts --nome "Colégio X" --adm-email dir@colegiox.com
 *   node --import tsx scripts/criar-escola.mts --nome "Colégio X" --adm-email dir@colegiox.com --ativa-ate 2027-12-31 --aplicar
 *
 * Sem `--ativa-ate` a escola nasce como piloto sem prazo (ativaAte null) —
 * membro conta como premium até alguém suspender. Quem interpreta isso é
 * lib/pagamento/acesso.ts (decidirAcessoEscolar).
 *
 * Se o e-mail já tem conta, ela vira o adm (recusa se já for membro de outra
 * escola — o @unique de MembroEscola.userId pegaria de qualquer jeito, mas a
 * mensagem daqui explica em vez de estourar). Se não tem, a conta nasce com
 * senha temporária de 12 caracteres IMPRESSA UMA ÚNICA VEZ no console — o
 * banco guarda só o hash, e a pessoa troca em Ajustes.
 */
import { config } from "dotenv"
config({ path: ".env.local" }); config({ path: ".env" })

import { randomBytes } from "node:crypto"
import bcrypt from "bcryptjs"

const { db } = await import("../lib/db.js")

function arg(nome: string): string | null {
  const i = process.argv.indexOf(`--${nome}`)
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")
    ? process.argv[i + 1]
    : null
}

const aplicar = process.argv.includes("--aplicar")
const nome = arg("nome")?.trim() ?? ""
const admEmail = arg("adm-email")?.trim().toLowerCase() ?? ""
const ativaAteBruto = arg("ativa-ate")

function falhar(msg: string): never {
  console.log(`✗ ${msg}`)
  console.log(
    "\nuso: node --import tsx scripts/criar-escola.mts --nome \"Colégio X\" --adm-email dir@colegiox.com [--ativa-ate 2027-12-31] [--aplicar]"
  )
  process.exit(1)
}

if (!nome) falhar("--nome é obrigatório e não pode ser vazio.")
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(admEmail)) falhar(`--adm-email inválido: "${admEmail}"`)

let ativaAte: Date | null = null
if (ativaAteBruto) {
  ativaAte = new Date(`${ativaAteBruto}T23:59:59-03:00`)
  if (Number.isNaN(ativaAte.getTime())) falhar(`--ativa-ate ilegível: "${ativaAteBruto}" (use AAAA-MM-DD)`)
  if (ativaAte <= new Date()) falhar(`--ativa-ate já passou: ${ativaAteBruto}. Vigência nova no passado é suspensão disfarçada — use o status.`)
}

const existente = await db.user.findUnique({
  where: { email: admEmail },
  select: { id: true, nome: true, membroEscola: { select: { papel: true, escola: { select: { nome: true } } } } },
})

if (existente?.membroEscola) {
  console.log(
    `✗ ${admEmail} já é ${existente.membroEscola.papel} da escola "${existente.membroEscola.escola.nome}".`
  )
  console.log("  Uma conta pertence a UMA escola (MembroEscola.userId @unique). Use outro e-mail.")
  await db.$disconnect()
  process.exit(1)
}

console.log(`${aplicar ? "" : "[simulação] "}Escola "${nome}"`)
console.log(`  status ativa · vigência ${ativaAte ? `até ${ativaAteBruto}` : "sem prazo (piloto)"}`)
console.log(
  existente
    ? `  adm: conta existente ${admEmail} (${existente.nome ?? "sem nome"}) vira adm`
    : `  adm: conta NOVA para ${admEmail}, com senha temporária`
)

if (!aplicar) {
  console.log("\nNada gravado. Rode com --aplicar para criar de verdade.")
  await db.$disconnect()
  process.exit(0)
}

const senhaTemporaria = existente ? null : randomBytes(9).toString("base64url")

await db.$transaction(async (tx) => {
  const escola = await tx.escola.create({
    data: { nome, status: "ativa", ativaAte },
  })
  const userId =
    existente?.id ??
    (
      await tx.user.create({
        data: { email: admEmail, senha: await bcrypt.hash(senhaTemporaria!, 10) },
        select: { id: true },
      })
    ).id
  await tx.membroEscola.create({
    data: { userId, escolaId: escola.id, papel: "adm" },
  })
})

console.log(`\n✓ Escola "${nome}" criada, ${admEmail} é o adm.`)
if (senhaTemporaria) {
  console.log(`\n  SENHA TEMPORÁRIA (não aparece de novo): ${senhaTemporaria}`)
  console.log("  Peça para a pessoa trocar em Ajustes no primeiro acesso.")
}

await db.$disconnect()
