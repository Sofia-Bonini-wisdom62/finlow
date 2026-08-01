/**
 * Testa o processamento do fim da primeira conversa (SPEC v3, tarefa 5).
 *
 * O critério da spec é o que tem de existir quando o onboarding acaba: perfil,
 * trilha, insights, pontos e a primeira mensagem esperando no chat.
 *
 * O que este teste realmente protege é a IDEMPOTÊNCIA. O pipeline não tem flag
 * de "já rodei", de propósito: com flag, uma execução que cai no meio deixa a
 * conta pela metade e marcada como pronta. Sem flag, é só rodar de novo — mas
 * só se rodar de novo não duplicar nada, e é exatamente isso que se verifica
 * aqui, rodando duas vezes seguidas e comparando.
 *
 *   node --import tsx scripts/testar-pipeline.mts
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

const { db } = await import("../lib/db.js")
const { rodarPipeline, PASSOS } = await import("../lib/onboarding/pipeline.js")
const { levaAtual } = await import("../lib/recomendacao.js")

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

async function rodar(userId: string) {
  const passos = []
  for await (const p of rodarPipeline(userId)) passos.push(p)
  return passos
}

async function retrato(userId: string) {
  const [u, onb, recs, insights, eventos] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { nivel: true, pontos: true } }),
    db.onboarding.findUnique({ where: { userId }, select: { nivelInferido: true } }),
    levaAtual(userId),
    db.insight.count({ where: { userId, ativo: true } }),
    db.eventoPontuacao.count({ where: { userId } }),
  ])
  return { nivel: u?.nivel, pontos: u?.pontos, onb: !!onb, recs: recs.length, insights, eventos, lista: recs }
}

const marca = `teste-pipeline-${Date.now()}`
let userId = ""

try {
  const u = await db.user.create({ data: { email: `${marca}@exemplo.invalido`, nome: "Teste" } })
  userId = u.id
  await db.perfil.create({
    data: { userId, tipo: "lancador", respostas: { origem: "teste" } },
  })

  // ---------------------------------------------------------- 1ª execução ---
  console.log("PRIMEIRA EXECUÇÃO")
  const passos1 = await rodar(userId)
  for (const p of passos1) {
    console.log(`  ${p.ok ? "ok   " : "FALHA"} ${p.id.padEnd(12)} ${p.detalhe ?? ""}`)
    if (!p.ok) falhas++
  }
  checar("rodou todos os passos", passos1.length === PASSOS.length, `${passos1.length} de ${PASSOS.length}`)
  checar(
    "os passos vêm na ordem declarada",
    passos1.map((p) => p.id).join(",") === PASSOS.map((p) => p.id).join(",")
  )

  const a = await retrato(userId)

  console.log("\nO QUE FICOU (critério da spec)")
  checar("nível inferido no User", !!a.nivel, a.nivel ?? "")
  checar("linha de Onboarding gravada", a.onb)
  checar("trilha recomendada gravada", a.recs > 0, `${a.recs} aulas`)
  checar("pontos do onboarding creditados", a.pontos === 50, `${a.pontos}`)

  // Insight depende da IA E de haver número. Este usuário não tem lançamento
  // nenhum, então zero é o comportamento CERTO: inventar três frases sem dado
  // seria a tela dizer que olhou quando não olhou.
  checar("sem lançamento, nenhum insight inventado", a.insights === 0, `${a.insights}`)

  const pendentes = a.lista.filter((r) => !r.entregueEm)
  checar(
    "a trilha fica esperando para chegar como mensagem no chat",
    pendentes.length === a.recs && a.recs > 0,
    `${pendentes.length} pendentes`
  )

  // ---------------------------------------------------------- 2ª execução ---
  console.log("\nSEGUNDA EXECUÇÃO (a mesma, de novo)")
  const passos2 = await rodar(userId)
  for (const p of passos2) if (!p.ok) falhas++
  const b = await retrato(userId)

  checar("não duplica recomendação", b.recs === a.recs, `${a.recs} → ${b.recs}`)
  checar("não credita ponto de novo", b.pontos === a.pontos, `${a.pontos} → ${b.pontos}`)
  checar("não cria evento de ponto a mais", b.eventos === a.eventos, `${a.eventos} → ${b.eventos}`)
  checar("não duplica insight", b.insights === a.insights, `${a.insights} → ${b.insights}`)
  checar("continua uma linha só de Onboarding", b.onb)
  checar(
    "não reabre a entrega do que já foi entregue",
    (await levaAtual(userId)).filter((r) => !r.entregueEm).length === pendentes.length
  )
  // -------------------------------------------------------------- insights ---
  // Só com --vivo: fala com a Vertex. O caminho sem dado já foi coberto acima;
  // o que falta é o COM dado, que é onde mora o prompt e a leitura da resposta.
  if (process.argv.includes("--vivo")) {
    console.log("\nINSIGHTS COM NÚMERO (chamando o modelo)")
    const { gerarInsights } = await import("../lib/insights-ia.js")

    const contexto = {
      temDados: true,
      mesReferencia: "julho de 2026",
      receitaMes: 6200,
      despesaMes: 5480,
      economiaMes: 720,
      acumulado: 3100,
      reservaEmergenciaMeses: 0.6,
      taxaEconomiaPct: 12,
      maioresCategorias: [
        { nome: "Delivery", total: 1420, pct: 26 },
        { nome: "Moradia", total: 1800, pct: 33 },
        { nome: "Transporte", total: 610, pct: 11 },
      ],
      contasFixasTotal: 2400,
      mesesComHistorico: 4,
    }

    const linhas = await gerarInsights(contexto as never)
    linhas.forEach((l) => console.log(`     · [${l.tipo}] ${l.texto}  (${l.texto.length})`))

    checar("escreve três linhas", linhas.length === 3, `${linhas.length}`)
    checar("nenhuma linha comprida demais", linhas.every((l) => l.texto.length <= 160))
    checar("todas com tipo válido", linhas.every((l) =>
      ["gasto", "divida", "progresso", "alerta"].includes(l.tipo)))
    checar("três leituras diferentes", new Set(linhas.map((l) => l.texto.toLowerCase())).size === linhas.length)
    // Sem número, é frase de efeito e não leitura. É a regra central do prompt.
    const comNumero = linhas.filter((l) => /\d/.test(l.texto)).length
    checar("pelo menos duas citam um número", comNumero >= 2, `${comNumero} de ${linhas.length}`)
  } else {
    console.log("\n(insights com número não testados — rode com --vivo)")
  }
} finally {
  if (userId) await db.user.delete({ where: { id: userId } }).catch(() => {})
  const sobrou = await db.user.count({ where: { email: { contains: marca } } })
  console.log(`\nlimpeza: ${sobrou === 0 ? "nada ficou no banco" : `SOBRARAM ${sobrou}`}`)
  if (sobrou !== 0) falhas++
  await db.$disconnect()
}

console.log(`\n${falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} falha(s)`}`)
process.exit(falhas === 0 ? 0 : 1)
