/**
 * Testa os objetivos financeiros: a conta pura e a camada cifrada.
 *
 * A PARTE PURA RODA SEM BANCO. O que precisa ser verdade:
 * - "faltam" nunca fica negativo e a barra nunca passa de 100%;
 * - a conclusão é DERIVADA: alcançou carimba, tirou dinheiro descarimba, e
 *   editar o nome não muda a data de quem já concluiu;
 * - objetivo sem prazo não empurra para baixo o que vence semana que vem
 *   (o motivo de a ordenação não ser um ORDER BY);
 * - o resumo ignora o que já foi concluído — senão "faltam R$ 0" some no meio
 *   de alvos já pagos.
 *
 * A PARTE COM BANCO só roda se DATABASE_URL responder. Ela verifica o que o
 * teste puro não alcança: que nome e valores chegam CIFRADOS na tabela, que
 * guardar soma sem virar lançamento, e que objetivo de outro dono não se move.
 *
 *   node --import tsx scripts/testar-objetivos.mts
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

const { derivados, ordenar, carimbo, resumirObjetivos } = await import("../lib/objetivo-repo.js")
import type { ObjetivoClaro } from "../lib/objetivo-repo.js"

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

function objetivo(p: Partial<ObjetivoClaro>): ObjetivoClaro {
  const valorAlvo = p.valorAlvo ?? 1000
  const valorGuardado = p.valorGuardado ?? 0
  return {
    id: p.id ?? "x",
    nome: p.nome ?? "Objetivo",
    emoji: p.emoji ?? null,
    valorAlvo,
    valorGuardado,
    ...derivados(valorAlvo, valorGuardado),
    prazo: p.prazo ?? null,
    concluidoEm: p.concluidoEm ?? null,
    criadoEm: p.criadoEm ?? new Date("2026-01-01"),
    atualizadoEm: p.atualizadoEm ?? new Date("2026-01-01"),
  }
}

console.log("DERIVADOS (quanto falta, quantos por cento)")
{
  const meio = derivados(1000, 250)
  checar("metade do caminho", meio.pct === 25 && meio.restante === 750, `${meio.pct}% · falta ${meio.restante}`)

  const passou = derivados(1000, 1400)
  checar("guardou mais que o alvo: 100% e falta 0", passou.pct === 100 && passou.restante === 0,
    `${passou.pct}% · falta ${passou.restante}`)

  const zerado = derivados(0, 500)
  checar("alvo zero não divide por zero", zerado.pct === 0 && Number.isFinite(zerado.pct))

  const centavos = derivados(100.05, 33.34)
  checar("centavo não vira dízima", centavos.restante === 66.71, `falta ${centavos.restante}`)
}

console.log("\nCARIMBO DE CONCLUSÃO (é derivado, não botão)")
{
  const antes = new Date("2026-03-10")
  checar("alcançou o alvo: carimba", carimbo(1000, 1000, null) !== null)
  checar("ainda falta: sem carimbo", carimbo(999, 1000, null) === null)
  checar("continua alcançado: mantém a data antiga", carimbo(1200, 1000, antes)?.getTime() === antes.getTime())
  checar("tirou dinheiro e caiu abaixo: descarimba", carimbo(500, 1000, antes) === null)
  checar("subiu o alvo acima do guardado: descarimba", carimbo(1000, 5000, antes) === null)
}

console.log("\nORDEM DA TELA")
{
  const semPrazo = objetivo({ id: "sem-prazo", criadoEm: new Date("2026-01-01") })
  const urgente = objetivo({ id: "urgente", prazo: new Date("2026-09-01") })
  const distante = objetivo({ id: "distante", prazo: new Date("2027-06-01") })
  const pronto = objetivo({ id: "pronto", prazo: new Date("2026-08-01"), concluidoEm: new Date("2026-08-01") })

  const fila = [pronto, semPrazo, distante, urgente].sort(ordenar).map((o) => o.id)
  checar("urgente primeiro, sem prazo depois, concluído por último",
    JSON.stringify(fila) === JSON.stringify(["urgente", "distante", "sem-prazo", "pronto"]), fila.join(" > "))
}

console.log("\nRESUMO DA FILA")
{
  const r = resumirObjetivos([
    objetivo({ valorAlvo: 5000, valorGuardado: 1500 }),
    objetivo({ valorAlvo: 800, valorGuardado: 200 }),
    objetivo({ valorAlvo: 300, valorGuardado: 300, concluidoEm: new Date("2026-05-01") }),
  ])
  checar("conta os concluídos à parte", r.total === 3 && r.concluidos === 1)
  checar("só o que está aberto entra na soma", r.guardadoAberto === 1700 && r.restanteAberto === 4100,
    `guardado ${r.guardadoAberto} · falta ${r.restanteAberto}`)
  checar("alvo aberto ignora o já concluído", r.alvoAberto === 5800, String(r.alvoAberto))
}

// ---------------------------------------------------------------- com banco
const temBanco = !!process.env.DATABASE_URL
if (!temBanco) {
  console.log("\n(sem DATABASE_URL — a parte cifrada não rodou)")
} else {
  const { db } = await import("../lib/db.js")
  const { estaCifrado } = await import("../lib/cripto.js")
  const { criarObjetivo, listarObjetivos, guardarNoObjetivo, atualizarObjetivo, apagarObjetivo } =
    await import("../lib/objetivo-repo.js")

  console.log("\nCIFRA E POSSE (banco)")
  const email = `teste-objetivos-${Date.now()}@finlow.local`
  const outroEmail = `teste-objetivos-outro-${Date.now()}@finlow.local`
  let userId = ""
  let outroId = ""
  try {
    userId = (await db.user.create({ data: { email } })).id
    outroId = (await db.user.create({ data: { email: outroEmail } })).id

    const criado = await criarObjetivo(userId, {
      nome: "Viagem pro Chile",
      emoji: "✈️",
      valorAlvo: 6000,
      valorGuardado: 1000,
      prazo: new Date("2027-01-15"),
    })
    checar("cria com o guardado inicial", criado.valorGuardado === 1000 && criado.restante === 5000)

    const cru = await db.objetivo.findUnique({ where: { id: criado.id } })
    checar("nome vai cifrado para a tabela", estaCifrado(cru?.nome))
    checar("valores vão cifrados para a tabela", estaCifrado(cru?.valorAlvo) && estaCifrado(cru?.valorGuardado))
    checar("emoji e prazo ficam em claro (o banco ordena por eles)", cru?.emoji === "✈️" && cru?.prazo !== null)

    const somado = await guardarNoObjetivo(userId, criado.id, 2000)
    checar("guardar soma ao que já tinha", somado?.valorGuardado === 3000, String(somado?.valorGuardado))

    const tirouDemais = await guardarNoObjetivo(userId, criado.id, -99999)
    checar("tirar mais do que tem zera, não fica devendo", tirouDemais?.valorGuardado === 0)

    const concluiu = await guardarNoObjetivo(userId, criado.id, 6000)
    checar("alcançar o alvo carimba a conclusão", concluiu?.concluidoEm !== null && concluiu?.pct === 100)

    const renomeado = await atualizarObjetivo(userId, criado.id, { nome: "Viagem pro Chile (2027)" })
    checar("editar o nome não desfaz a conclusão", renomeado?.concluidoEm !== null)

    const subiuAlvo = await atualizarObjetivo(userId, criado.id, { valorAlvo: 12000 })
    checar("subir o alvo acima do guardado descarimba", subiuAlvo?.concluidoEm === null)

    checar("guardar não cria lançamento no Painel",
      (await db.transacao.count({ where: { userId } })) === 0)

    // Posse: o objetivo de um não se move nem se lê pelo id do outro.
    checar("outro dono não guarda no meu objetivo", (await guardarNoObjetivo(outroId, criado.id, 500)) === null)
    checar("outro dono não edita o meu objetivo", (await atualizarObjetivo(outroId, criado.id, { nome: "meu agora" })) === null)
    checar("outro dono não apaga o meu objetivo", (await apagarObjetivo(outroId, criado.id)) === false)
    checar("a lista do outro dono continua vazia", (await listarObjetivos(outroId)).length === 0)

    checar("o dono apaga o próprio", (await apagarObjetivo(userId, criado.id)) === true)
  } catch (e) {
    falhas++
    console.log(`  FALHA erro inesperado: ${(e as Error)?.message}`)
  } finally {
    if (userId) await db.user.delete({ where: { id: userId } }).catch(() => {})
    if (outroId) await db.user.delete({ where: { id: outroId } }).catch(() => {})
    await db.$disconnect()
  }
}

console.log(falhas === 0 ? "\n✓ tudo certo" : `\n✗ ${falhas} falha(s)`)
process.exit(falhas === 0 ? 0 : 1)
