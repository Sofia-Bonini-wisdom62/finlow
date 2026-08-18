/**
 * Cria uma escola e a conta do adm dela, pela linha de comando.
 *
 * DEIXOU DE SER A ÚNICA PORTA em 18/08/2026: a mesma operação agora tem tela
 * em /ops (superfície da fundadora). As duas chamam `criarEscolaComAdm` de
 * lib/ops-escola.ts, e a regra vive lá justamente para não existirem duas
 * versões da mesma transação divergindo no primeiro ajuste.
 *
 * O script continua porque a tela depende de sessão e de `OPS_EMAILS`
 * configurada, e criar a PRIMEIRA escola de um ambiente novo (ou consertar um
 * acesso perdido) não pode depender de já se ter acesso.
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
 * escola). Se não tem, a conta nasce com senha temporária de 12 caracteres
 * IMPRESSA UMA ÚNICA VEZ no console — o banco guarda só o hash, e a pessoa
 * troca em Ajustes.
 */
import { config } from "dotenv"
config({ path: ".env.local" }); config({ path: ".env" })

const { db } = await import("../lib/db.js")
const { criarEscolaComAdm, fimDoDiaEmSaoPaulo } = await import("../lib/ops-escola.js")

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

let ativaAte: Date | null = null
if (ativaAteBruto) {
  ativaAte = fimDoDiaEmSaoPaulo(ativaAteBruto)
  if (!ativaAte) falhar(`--ativa-ate ilegível: "${ativaAteBruto}" (use AAAA-MM-DD)`)
}

// A simulação precisa saber se a conta já existe para dizer o que vai
// acontecer. É leitura, e a validação de verdade (formato do e-mail, vigência
// no passado, conta já vinculada) acontece dentro de criarEscolaComAdm — aqui
// só antecipamos a recusa para não fingir que a simulação passou.
const existente = await db.user.findUnique({
  where: { email: admEmail },
  select: { nome: true, membroEscola: { select: { papel: true, escola: { select: { nome: true } } } } },
})

console.log(`${aplicar ? "" : "[simulação] "}Escola "${nome}"`)
console.log(`  status ativa · vigência ${ativaAteBruto ? `até ${ativaAteBruto}` : "sem prazo (piloto)"}`)
console.log(
  existente
    ? `  adm: conta existente ${admEmail} (${existente.nome ?? "sem nome"}) vira adm`
    : `  adm: conta NOVA para ${admEmail}, com senha temporária`
)

if (!aplicar) {
  if (existente?.membroEscola) {
    console.log(
      `\n✗ ${admEmail} já é ${existente.membroEscola.papel} da escola "${existente.membroEscola.escola.nome}".`
    )
    console.log("  Uma conta pertence a UMA escola (MembroEscola.userId @unique). Use outro e-mail.")
  }
  console.log("\nNada gravado. Rode com --aplicar para criar de verdade.")
  await db.$disconnect()
  process.exit(existente?.membroEscola ? 1 : 0)
}

const r = await criarEscolaComAdm({ nome, admEmail, ativaAte })

if (!r.ok) {
  console.log(`\n✗ ${r.detalhe}`)
  await db.$disconnect()
  process.exit(1)
}

console.log(`\n✓ Escola "${nome}" criada, ${admEmail} é o adm.`)
if (r.senhaTemporaria) {
  console.log(`\n  SENHA TEMPORÁRIA (não aparece de novo): ${r.senhaTemporaria}`)
  console.log("  Peça para a pessoa trocar em Ajustes no primeiro acesso.")
}

await db.$disconnect()
