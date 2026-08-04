/**
 * Faz uma pergunta ao assistente com o contexto REAL de uma conta e imprime a
 * resposta. É o teste que as baterias não fazem: elas provam que o número
 * chegou ao prompt, este prova que o modelo o usa.
 *
 *   node --import tsx scripts/perguntar-ao-assistente.mts <email> "sua pergunta"
 *
 * Sem pergunta, roda o roteiro padrão (mês nomeado, categoria zerada, mês fora
 * do histórico) — que é onde o assistente costumava inventar ou se esquivar.
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

const { db } = await import("../lib/db.js")
const { montarContexto } = await import("../lib/contexto-financeiro.js")
const { responderIA } = await import("../lib/ia.js")

const [emailArg, perguntaArg] = process.argv.slice(2)

try {
  const usuario = emailArg
    ? await db.user.findUnique({ where: { email: emailArg.toLowerCase() }, select: { id: true, email: true } })
    : (await db.user.findMany({
        where: { transacoes: { some: { confirmado: true } } },
        select: { id: true, email: true, _count: { select: { transacoes: true } } },
        orderBy: { transacoes: { _count: "desc" } },
        take: 1,
      }))[0]

  if (!usuario) {
    console.log("Nenhuma conta com lançamentos confirmados.")
    process.exit(1)
  }

  const contexto = await montarContexto(usuario.id)
  const meses = contexto.meses ?? []
  console.log(`conta: ${usuario.email}`)
  console.log(`meses no contexto: ${meses.length}${meses.length ? ` (${meses[0]!.rotulo} → ${meses[meses.length - 1]!.rotulo})` : ""}`)
  for (const m of meses) {
    console.log(`  ${m.rotulo}: ${m.categorias.length} categoria(s) — ${m.categorias.map((c) => c.nome).join(", ") || "nenhuma"}`)
  }

  // Um mês e uma categoria que EXISTEM nesta conta, para a pergunta ter
  // resposta verificável em vez de testar um caso hipotético.
  const mesCheio = [...meses].reverse().find((m) => m.categorias.length > 0)
  const maisAntigo = meses.find((m) => m.categorias.length > 0)
  const nomeMes = (m: typeof mesCheio) => m!.rotulo.split(" de ")[0]

  // O roteiro cobre os quatro jeitos de errar que já aconteceram: número
  // inventado, "não tenho o dado" sobre gasto zero, mês fora do histórico
  // tratado como se existisse, e concordar com a suposição de quem pergunta.
  const perguntas = perguntaArg
    ? [perguntaArg]
    : mesCheio
      ? [
          `quanto eu gastei com ${mesCheio.categorias[0]!.nome.toLowerCase()} em ${nomeMes(mesCheio)}?`,
          `e com viagem em ${nomeMes(mesCheio)}?`,
          "quanto eu gastei em janeiro de 2019?",
          ...(maisAntigo && maisAntigo.mes !== mesCheio.mes
            ? [`meu gasto com ${mesCheio.categorias[0]!.nome.toLowerCase()} aumentou de ${nomeMes(maisAntigo)} pra ${nomeMes(mesCheio)}?`]
            : []),
        ]
      : ["quanto eu gastei esse mês?"]

  for (const pergunta of perguntas) {
    console.log(`\n──────────────────────────────────────────────`)
    console.log(`PERGUNTA: ${pergunta}`)
    const r = await responderIA([{ papel: "usuario", texto: pergunta }], contexto, { ligada: false, conhecidas: [] })
    console.log(`RESPOSTA: ${r.texto}`)
  }

  if (mesCheio && !perguntaArg) {
    const c = mesCheio.categorias[0]!
    console.log(`\n──────────────────────────────────────────────`)
    console.log(`VERDADE NO BANCO: ${c.nome} em ${mesCheio.rotulo} = ${c.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`)
    console.log(`Confira se o número da primeira resposta bate.`)
  }
} finally {
  await db.$disconnect()
}
