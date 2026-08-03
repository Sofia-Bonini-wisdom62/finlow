/**
 * Testa o Diagnóstico de Vazamento: o motor puro e a camada cifrada.
 *
 * O MOTOR É PURO DE PROPÓSITO — a maior parte daqui roda sem banco, com
 * cenários fabricados. O que precisa ser verdade:
 * - encargo, cobrança em dobro, assinatura e categoria inflada são detectados;
 * - nenhum lançamento conta em DOIS achados (o total tem que fechar);
 * - aluguel (recorrente e caro) NÃO vira assinatura;
 * - "taxa de embarque" NÃO vira encargo (o falso positivo clássico);
 * - o repo grava CIFRADO e o link público expõe só número e contagem.
 *
 *   node --import tsx scripts/testar-vazamento.mts
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

const { diagnosticar } = await import("../lib/vazamento.js")
const { narrativaPadrao } = await import("../lib/vazamento-ia.js")
const { db } = await import("../lib/db.js")
const { salvarDiagnostico, lerDiagnostico, gerarTokenPublico, lerDiagnosticoPublico, marcarEntregue } =
  await import("../lib/vazamento-repo.js")
const { estaCifrado } = await import("../lib/cripto.js")

import type { LancamentoDiagnostico } from "../lib/vazamento.js"

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

// ------------------------------------------------------------ cenário ---
// Três meses: maio, junho, julho de 2026. O relógio congela em 31/07.
const AGORA = new Date(2026, 6, 31)
let seq = 0
function gasto(descricao: string, valor: number, ano: number, mes: number, dia: number, categoria?: string): LancamentoDiagnostico {
  return { id: `t${++seq}`, descricao, valor, tipo: "despesa", data: new Date(ano, mes - 1, dia), categoria: categoria ?? null }
}

const cenario: LancamentoDiagnostico[] = [
  // assinatura clássica: 3 meses seguidos, mesmo valor
  gasto("NETFLIX.COM", 39.9, 2026, 5, 5), gasto("NETFLIX.COM", 39.9, 2026, 6, 5), gasto("NETFLIX.COM", 39.9, 2026, 7, 5),
  // aluguel: recorrente, valor alto — NÃO pode virar assinatura
  gasto("Aluguel apto", 1800, 2026, 5, 10), gasto("Aluguel apto", 1800, 2026, 6, 10), gasto("Aluguel apto", 1800, 2026, 7, 10),
  // encargos com nome no texto
  gasto("IOF compra internacional", 12.4, 2026, 6, 12), gasto("Juros rotativo", 87.6, 2026, 7, 2),
  // tarifa por CATEGORIA (texto não diz nada)
  gasto("Pacote servicos PJ", 24.9, 2026, 7, 3, "Tarifas"),
  // falso positivo clássico: taxa de embarque não é tarifa bancária
  gasto("Taxa de embarque GOL", 42.0, 2026, 6, 20, "Viagem"),
  // cobrança em dobro: mesmo dia, mesmo valor
  gasto("Spotify", 21.9, 2026, 7, 8), gasto("SPOTIFY", 21.9, 2026, 7, 8),
  // categoria inflada: delivery estável e explode no último mês
  gasto("iFood", 80, 2026, 5, 15, "Delivery"), gasto("iFood", 90, 2026, 6, 15, "Delivery"),
  gasto("iFood", 180, 2026, 7, 10, "Delivery"), gasto("iFood pedido", 160, 2026, 7, 22, "Delivery"),
  // receita não entra
  { id: `t${++seq}`, descricao: "Salário", valor: 5000, tipo: "receita", data: new Date(2026, 6, 1), categoria: null },
]

console.log("MOTOR")
const r = diagnosticar(cenario, AGORA)
const tipos = r.achados.map((a) => a.tipo)

checar("3 meses analisados", r.mesesAnalisados === 3, `${r.mesesAnalisados}`)
checar("achou encargo (juros/IOF)", r.achados.some((a) => a.tipo === "encargo" && a.titulo === "Juros e multas"))
checar("achou tarifa pela CATEGORIA", r.achados.some((a) => a.tipo === "encargo" && a.titulo === "Tarifas e anuidades"))
checar("taxa de embarque NÃO virou encargo",
  !r.achados.some((a) => a.detalhe.toLowerCase().includes("embarque")),
  "")
const tarifas = r.achados.find((a) => a.titulo === "Tarifas e anuidades")
checar("tarifa somou só o pacote PJ", tarifas !== undefined && Math.abs(tarifas.valorMensal - 24.9 / 3) < 0.01,
  `mensal=${tarifas?.valorMensal}`)
checar("achou a cobrança em dobro", tipos.includes("duplicada"))
const netflix = r.achados.find((a) => a.tipo === "assinatura" && a.titulo.toLowerCase().includes("netflix"))
checar("achou a assinatura Netflix a R$ 39,90", netflix !== undefined && netflix.valorMensal === 39.9)
checar("aluguel NÃO virou assinatura", !r.achados.some((a) => a.titulo.toLowerCase().includes("aluguel")))
const inflada = r.achados.find((a) => a.tipo === "categoria_inflada")
checar("Delivery saiu fora da curva", inflada !== undefined && inflada.titulo.startsWith("Delivery"),
  inflada?.titulo ?? "nenhuma")
// 340 no último mês contra mediana 85 dos anteriores = 255 de excesso
checar("excesso do Delivery fecha a conta", inflada !== undefined && Math.abs(inflada.valorMensal - 255) < 0.01,
  `mensal=${inflada?.valorMensal}`)

const somaDosAchados = r.achados.reduce((a, x) => a + x.valorMensal, 0)
checar("total = soma dos achados (nada conta duas vezes)",
  Math.abs(somaDosAchados - r.totalMensal) < 0.01, `${somaDosAchados} vs ${r.totalMensal}`)
checar("anual = mensal x 12", Math.abs(r.totalAnual - r.totalMensal * 12) < 0.05)

console.log("\nBORDAS")
checar("sem lançamentos → sem diagnóstico", diagnosticar([], AGORA).mesesAnalisados === 0)
checar("só receitas → sem diagnóstico",
  diagnosticar([{ id: "x", descricao: "Pix", valor: 100, tipo: "receita", data: AGORA }], AGORA).mesesAnalisados === 0)
const umMes = diagnosticar([gasto("Juros cheque especial", 50, 2026, 7, 5)], AGORA)
checar("1 mês já detecta encargo", umMes.achados.length === 1 && umMes.achados[0]!.tipo === "encargo")
checar("narrativa padrão cita o maior ralo",
  narrativaPadrao(r).toLowerCase().includes(r.achados.reduce((a, b) => (b.valorMensal > a.valorMensal ? b : a)).titulo.toLowerCase().slice(0, 8)))
checar("narrativa padrão sem achados não inventa número", narrativaPadrao(umMesVazio()).includes("não achei"))
function umMesVazio() { return { achados: [], totalMensal: 0, totalAnual: 0, mesesAnalisados: 2 } }

// ------------------------------------------------------------- repo ---
console.log("\nREPO CIFRADO")

const familia = "teste-vazamento-"
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
  const u = await db.user.create({ data: { email: `${familia}${Date.now()}@exemplo.invalido`, nome: "Teste" } })

  await salvarDiagnostico(u.id, r, narrativaPadrao(r))
  const cru = await db.diagnosticoVazamento.findUnique({ where: { userId: u.id } })
  checar("totalAnual gravado CIFRADO", estaCifrado(cru?.totalAnual))
  checar("achados gravados CIFRADOS", estaCifrado(cru?.achados))

  const lido = await lerDiagnostico(u.id)
  checar("lê de volta o mesmo total", lido !== null && Math.abs(lido.totalAnual - r.totalAnual) < 0.01)
  checar("lê de volta os mesmos achados", lido !== null && lido.achados.length === r.achados.length)
  checar("meses sobrevivem à cifra", lido?.mesesAnalisados === r.mesesAnalisados)

  await marcarEntregue(u.id)
  const token = await gerarTokenPublico(u.id)
  checar("token público criado", typeof token === "string" && token.length > 10)

  // Regerar NÃO pode derrubar entrega nem token
  await salvarDiagnostico(u.id, r, "regerado")
  const depois = await lerDiagnostico(u.id)
  checar("regerar preserva entregueEm", depois?.entregueEm !== null)
  checar("regerar preserva o token", depois?.tokenPublico === token)

  const publico = await lerDiagnosticoPublico(token!)
  checar("link público expõe número e contagem", publico !== null && Math.abs(publico.totalAnual - r.totalAnual) < 0.01
    && publico.quantosAchados === r.achados.length)
  const chavesPublicas = Object.keys(publico ?? {}).sort().join(",")
  checar("link público NÃO expõe mais que o contrato",
    chavesPublicas === "codigoIndicacao,quantosAchados,totalAnual", chavesPublicas)

  await db.user.delete({ where: { id: u.id } })
  checar("apagar a conta leva o diagnóstico (cascade)",
    (await db.diagnosticoVazamento.count({ where: { userId: u.id } })) === 0)
} finally {
  const varridos = await varrerDescartaveis()
  console.log(`\n[limpeza] ${varridos} usuário(s) descartável(is) removido(s)`)
  await db.$disconnect()
}

console.log(falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`)
process.exit(falhas === 0 ? 0 : 1)
