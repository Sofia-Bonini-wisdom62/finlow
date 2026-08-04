/**
 * Testa o Módulo Avançado: projeção (matemática de papel), flag por env,
 * repo cifrado de investimentos e a separação pessoal × trabalho.
 *
 *   node --import tsx scripts/testar-avancado.mts
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

const { valorFuturo, marcosProjecao, serieProjecao, TAXA_PADRAO_MES } = await import("../lib/projecao.js")
const { db } = await import("../lib/db.js")
const { temModuloAvancado } = await import("../lib/plano.js")
const { listarInvestimentos, criarInvestimento, atualizarInvestimento } = await import("../lib/investimento-repo.js")
const { criarTransacao, listarTransacoes } = await import("../lib/financeiro-repo.js")
const { estaCifrado } = await import("../lib/cripto.js")

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

// ---------------------------------------------------------- projeção ---
console.log("PROJEÇÃO (matemática de papel)")

checar("0 meses devolve o principal", valorFuturo(1000, 500, 0) === 1000)
checar("taxa 0 = principal + aportes", valorFuturo(1000, 100, 12, 0) === 2200)
// 1000 a 1% a.m. por 2 meses, sem aporte: 1000 * 1.01^2 = 1020.10
checar("juro composto sem aporte", valorFuturo(1000, 0, 2, 0.01) === 1020.1)
// só aporte, 2 meses a 1%: 100*((1.01^2-1)/0.01) = 201.00
checar("aporte capitaliza certo", valorFuturo(0, 100, 2, 0.01) === 201)
const marcos = marcosProjecao(10000, 500)
checar("marcos são 1, 5 e 10 anos", marcos.map((m) => m.anos).join(",") === "1,5,10")
checar("mais tempo, mais valor", marcos[0]!.valor < marcos[1]!.valor && marcos[1]!.valor < marcos[2]!.valor)
const serie = serieProjecao(10000, 500)
checar("série tem 11 pontos (hoje..10a)", serie.length === 11 && serie[0]!.rotulo === "hoje" && serie[10]!.rotulo === "10a")
checar("série termina no marco de 10 anos", serie[10]!.valor === marcos[2]!.valor)
checar("taxa padrão é 0,8% a.m.", TAXA_PADRAO_MES === 0.008)

// --------------------------------------------------------------- flag ---
console.log("\nFLAG + REPO + ESCOPO")

const familia = "teste-avancado-"
async function varrerDescartaveis(): Promise<number> {
  const orfaos = await db.user.findMany({
    where: { email: { startsWith: familia, endsWith: "@exemplo.invalido" } },
    select: { id: true },
  })
  if (orfaos.length) await db.user.deleteMany({ where: { id: { in: orfaos.map((o) => o.id) } } })
  return orfaos.length
}

try {
  await varrerDescartaveis()
  const email = `${familia}${Date.now()}@exemplo.invalido`
  const u = await db.user.create({ data: { email, nome: "Teste" } })

  checar("sem flag e fora da lista beta: desligado", !(await temModuloAvancado(u.id)))
  process.env.AVANCADO_BETA_EMAILS = `outra@x.com, ${email.toUpperCase()}`
  checar("na lista beta (case-insensitive): ligado", await temModuloAvancado(u.id))
  process.env.AVANCADO_BETA_EMAILS = ""
  checar("fora da lista de novo: desligado", !(await temModuloAvancado(u.id)))
  await db.user.update({ where: { id: u.id }, data: { moduloAvancado: true } })
  checar("coluna moduloAvancado liga sozinha", await temModuloAvancado(u.id))

  // repo cifrado
  const inv = await criarInvestimento(u.id, {
    tipo: "renda_fixa", nome: "Tesouro Selic 2029", instituicao: "Corretora X", valorAtual: 12500.5,
  })
  const cru = await db.investimento.findUnique({ where: { id: inv.id } })
  checar("nome gravado CIFRADO", estaCifrado(cru?.nome))
  checar("valorAtual gravado CIFRADO", estaCifrado(cru?.valorAtual))
  checar("tipo em claro (agrupa no banco)", cru?.tipo === "renda_fixa")

  const lidos = await listarInvestimentos(u.id)
  checar("lê de volta em claro", lidos.length === 1 && lidos[0]!.nome === "Tesouro Selic 2029"
    && lidos[0]!.valorAtual === 12500.5)

  const n = await atualizarInvestimento(u.id, inv.id, { valorAtual: 13000 })
  checar("atualiza o valor", n === 1 && (await listarInvestimentos(u.id))[0]!.valorAtual === 13000)
  checar("atualizar com userId de outro não acha", (await atualizarInvestimento("naoexiste", inv.id, { valorAtual: 1 })) === 0)

  // escopo pessoal × trabalho
  await criarTransacao(u.id, { descricao: "Mercado", valor: 100, tipo: "despesa", categoriaId: null, data: new Date() })
  await criarTransacao(u.id, { descricao: "Notebook cliente", valor: 300, tipo: "despesa", categoriaId: null, data: new Date(), escopo: "trabalho" })
  const todas = await listarTransacoes(u.id)
  const trabalho = await listarTransacoes(u.id, { escopo: "trabalho" })
  const pessoal = await listarTransacoes(u.id, { escopo: "pessoal" })
  checar("sem filtro vem tudo", todas.length === 2)
  checar("filtro trabalho separa", trabalho.length === 1 && trabalho[0]!.descricao === "Notebook cliente")
  checar("padrão é pessoal", pessoal.length === 1 && pessoal[0]!.escopo === "pessoal")

  // cascade
  await db.user.delete({ where: { id: u.id } })
  checar("apagar a conta leva os investimentos", (await db.investimento.count({ where: { userId: u.id } })) === 0)
} finally {
  const varridos = await varrerDescartaveis()
  console.log(`\n[limpeza] ${varridos} usuário(s) descartável(is) removido(s)`)
  await db.$disconnect()
}

console.log(falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`)
process.exit(falhas === 0 ? 0 : 1)
