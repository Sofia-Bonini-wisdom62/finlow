/**
 * Testa "Apagar meus dados financeiros" CONTRA UM BANCO DE VERDADE.
 *
 * POR QUE ESTE EXISTE, SE JÁ HÁ O testar-apagar-dados.mts
 *
 * O outro confere a LISTA contra o schema, sem banco, e é ele que pega o erro
 * que originou tudo isto (tabela nova sem classificação). Mas ele não consegue
 * responder à pergunta que mais importa numa operação sem volta: quando a
 * transação roda de verdade, o dado SOME? E, tão importante quanto: o que não
 * era para sumir CONTINUA LÁ?
 *
 * Duas coisas só um banco responde:
 *
 *  - ORDEM. `Orcamento.categoriaId` e `Transacao.categoriaId` apontam para
 *    `Categoria`. A ordem errada no `$transaction` não é erro de tipo nem de
 *    lint — é um erro de chave estrangeira que só aparece na hora, na única
 *    operação do app que não tem volta.
 *  - O TETO DO MÊS INTEIRO. `Orcamento` com `categoriaId` nulo não cai por
 *    CASCADE junto com a categoria; ele só some porque `orcamento` está
 *    nomeado na lista. Um teste sem banco não sabe distinguir "some por
 *    cascade" de "some porque nomeamos" — e a diferença é um limite de gasto
 *    cifrado que sobrevive a uma limpeza de privacidade.
 *
 * Exercita `apagarDadosFinanceiros`, que é a MESMA função que a rota chama.
 *
 *   DATABASE_URL=... node --import tsx scripts/testar-apagar-financeiro-banco.mts
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

const { PrismaClient } = await import("@prisma/client")
const { apagarDadosFinanceiros } = await import("../lib/apagar-financeiro.js")
const { TABELAS_FINANCEIRAS, TABELAS_NAO_FINANCEIRAS } = await import("../lib/dados-financeiros.js")

const db = new PrismaClient()

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

const marca = `apagar-teste-${process.pid}`
const email = `${marca}@exemplo.invalido`

try {
  // ------------------------------------------------------------ monta ---
  // Um usuário com dado em TODAS as tabelas financeiras e em algumas das que
  // têm que sobreviver. Sem o segundo grupo, um `deleteMany` largo demais
  // passaria despercebido: apagar de mais também é defeito.
  console.log("\n— monta um usuário com dado dos dois lados —")

  const user = await db.user.create({
    data: { email, nome: "Teste Apagar", consentimentoPainelEm: new Date() },
  })
  const uid = user.id

  const cat = await db.categoria.create({
    data: { userId: uid, nome: "Delivery", tipo: "despesa" },
  })
  const imp = await db.extratoImport.create({
    data: { userId: uid, status: "confirmado", banco: "nubank" },
  })
  await db.transacao.create({
    data: {
      userId: uid, descricao: "cifrado", valor: "cifrado", tipo: "despesa",
      categoriaId: cat.id, extratoImportId: imp.id, data: new Date(),
    },
  })
  // os DOIS tipos de teto: o de categoria (cairia por cascade) e o do mês
  // inteiro (categoriaId nulo — só cai porque `orcamento` está na lista)
  await db.orcamento.create({ data: { userId: uid, categoriaId: cat.id, limite: "cifrado" } })
  await db.orcamento.create({ data: { userId: uid, categoriaId: null, limite: "cifrado" } })
  await db.contaFixa.create({ data: { userId: uid, nome: "cifrado", valor: "cifrado", diaVencimento: 10 } })
  await db.investimento.create({
    data: { userId: uid, tipo: "cripto", nome: "cifrado", valorAtual: "cifrado" },
  })
  await db.objetivo.create({
    data: { userId: uid, nome: "cifrado", meta: "cifrado", guardado: "cifrado" },
  })
  await db.diagnosticoVazamento.create({
    data: { userId: uid, totalAnual: "cifrado", achados: "cifrado" },
  })
  await db.insight.create({ data: { userId: uid, texto: "gastou demais", tipo: "gasto" } })

  // o outro lado: precisa sobreviver
  await db.memoriaUsuario.create({ data: { userId: uid, tipo: "plano", conteudo: "cifrado" } })
  await db.diaAtivo.create({ data: { userId: uid, dia: new Date() } })
  await db.perfil.create({ data: { userId: uid, tipo: "estudante", respostas: {} } })
  await db.eventoPontuacao.create({
    data: { userId: uid, motivo: "licao", refId: "x1", pontos: 10 },
  })

  const contar = async (t: string) =>
    (await (db as unknown as Record<string, { count: (a: unknown) => Promise<number> }>)[t].count({
      where: { userId: uid },
    }))

  // As tabelas que este teste SEMEOU, escritas à mão de propósito.
  //
  // A expectativa não pode sair de `TABELAS_FINANCEIRAS`: é justamente ela que
  // está sob teste. Se o "o que era para sumir" percorresse a lista, apagar um
  // nome dela encolheria o teste junto — foi o que aconteceu na primeira versão
  // deste arquivo, e a lista antiga (só transação, conta fixa e categoria)
  // passou quase limpa, porque ninguém perguntou pelo investimento.
  //
  // Escrita à mão, ela é um segundo par de olhos: quem tirar `investimento` da
  // lista de produção vê o teste apontar o investimento que sobrou.
  const SEMEADAS = [
    "transacao", "orcamento", "contaFixa", "investimento", "objetivo",
    "extratoImport", "diagnosticoVazamento", "insight", "categoria",
  ] as const

  // ...e o contrário: tabela financeira nova que este teste não semeou passaria
  // batida. Aqui a lista de produção é a expectativa, e com razão.
  console.log("\n— o teste cobre a lista inteira? —")
  for (const t of TABELAS_FINANCEIRAS) {
    checar(
      `${t}: semeado por este teste`,
      (SEMEADAS as readonly string[]).includes(t),
      (SEMEADAS as readonly string[]).includes(t) ? "" : "← tabela financeira sem linha semeada; some sem ninguém conferir"
    )
  }

  const antesFin = Object.fromEntries(
    await Promise.all(SEMEADAS.map(async (t) => [t, await contar(t)] as const))
  )
  const guardadas = ["memoriaUsuario", "diaAtivo", "perfil", "eventoPontuacao"]
  const antesMantem = Object.fromEntries(
    await Promise.all(guardadas.map(async (t) => [t, await contar(t)] as const))
  )

  console.log("\n— tem dado dos dois lados antes de apagar —")
  for (const t of SEMEADAS) {
    checar(`${t}: tem linha antes`, antesFin[t] > 0, `${antesFin[t]}`)
  }
  checar("orçamento tem os DOIS tipos (categoria e mês inteiro)", antesFin.orcamento === 2)

  // ------------------------------------------------------------ apaga ---
  console.log("\n— roda a função que a rota chama —")
  await apagarDadosFinanceiros(db, uid)
  checar("a transação passou sem erro de chave estrangeira", true)

  // ----------------------------------------------------------- confere ---
  console.log("\n— o que era para sumir —")
  for (const t of SEMEADAS) {
    const n = await contar(t)
    checar(`${t}: zerado`, n === 0, n === 0 ? "" : `← SOBROU ${n}; a limpeza não levou esta tabela`)
  }

  console.log("\n— o que era para ficar —")
  for (const t of guardadas) {
    const n = await contar(t)
    checar(
      `${t}: intacto (${TABELAS_NAO_FINANCEIRAS[t]?.slice(0, 40) ?? ""}…)`,
      n === antesMantem[t] && n > 0,
      n === antesMantem[t] ? "" : `← tinha ${antesMantem[t]}, ficou ${n}`
    )
  }

  console.log("\n— o Painel volta a pedir opt-in —")
  const depois = await db.user.findUnique({
    where: { id: uid },
    select: { consentimentoPainelEm: true, email: true },
  })
  checar("consentimentoPainelEm zerado", depois?.consentimentoPainelEm === null)
  checar("a conta continua existindo", depois?.email === email, "apagar dados ≠ apagar conta")

  // ------------------------------------------------- roda duas vezes ---
  // Apagar de novo, com tudo já vazio, não pode explodir: a pessoa pode apertar
  // duas vezes, e a segunda tem que ser um silêncio, não um 500.
  console.log("\n— apertar o botão duas vezes —")
  await apagarDadosFinanceiros(db, uid)
  checar("segunda passada não quebra", true)
} catch (e) {
  falhas++
  console.log(`  FALHA exceção: ${(e as Error)?.message}`)
} finally {
  // limpa o usuário de teste — o resto sai por CASCADE
  await db.user.deleteMany({ where: { email } }).catch(() => {})
  await db.$disconnect()
}

console.log(
  falhas === 0
    ? `\n${"─".repeat(60)}\nTudo certo, contra Postgres de verdade.\n`
    : `\n${"─".repeat(60)}\n${falhas} FALHA(S).\n`
)
process.exit(falhas === 0 ? 0 : 1)
