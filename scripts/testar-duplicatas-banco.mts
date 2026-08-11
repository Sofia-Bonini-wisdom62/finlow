/**
 * Prova de ponta a ponta da conferência de duplicata, CONTRA BANCO DE VERDADE.
 *
 * O irmão puro (scripts/testar-duplicatas.mts) prova a regra. Este prova a
 * ligação — que é onde a cifra podia estragar tudo em silêncio:
 *
 * `descricao` e `valor` são cifrados com IV aleatório, então a MESMA descrição
 * gravada duas vezes produz duas cifras diferentes no banco. Um comparador
 * escrito contra a coluna (em vez de contra o texto decifrado) nunca acharia
 * nada e passaria por "não há duplicatas" para sempre. Este teste grava de
 * verdade, lê pelo repo e confere que o casamento acontece MESMO com as cifras
 * diferentes — e confere também que elas são, de fato, diferentes.
 *
 *   DATABASE_URL=... ENCRYPTION_KEY=... node --import tsx scripts/testar-duplicatas-banco.mts
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

const { db } = await import("../lib/db.js")
const { criarTransacao, listarTransacoes } = await import("../lib/financeiro-repo.js")
const { acharDuplicatas } = await import("../lib/extrato/duplicatas.js")
const { estaCifrado } = await import("../lib/cripto.js")

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

const dia = (d: number) => new Date(Date.UTC(2026, 6, d, 12, 0, 0))

const u = await db.user.create({
  data: { email: `dup-${Date.now()}@teste.finlow`, nome: "Teste Duplicata" },
})

try {
  // ---- histórico já confirmado ----
  await criarTransacao(u.id, { descricao: "NETFLIX.COM", valor: 39.9, tipo: "despesa", categoriaId: null, data: dia(5) })
  await criarTransacao(u.id, { descricao: "Café", valor: 12, tipo: "despesa", categoriaId: null, data: dia(8) })
  await criarTransacao(u.id, { descricao: "Salário", valor: 5000, tipo: "receita", categoriaId: null, data: dia(1) })
  // pendente de outro import: NÃO pode contar como "já lançado"
  await criarTransacao(u.id, {
    descricao: "Mercado", valor: 210.5, tipo: "despesa", categoriaId: null, data: dia(9), confirmado: false,
  })

  console.log("\na cifra é mesmo não determinística (é o que quebra comparar em SQL)")
  const brutas = await db.transacao.findMany({ where: { userId: u.id }, select: { descricao: true } })
  checar("tudo gravado cifrado", brutas.every((t) => estaCifrado(t.descricao)))
  const a = await criarTransacao(u.id, { descricao: "Café", valor: 12, tipo: "despesa", categoriaId: null, data: dia(30) })
  const doisCafes = await db.transacao.findMany({
    where: { userId: u.id, id: { in: [a.id] } }, select: { descricao: true },
  })
  const cafeAntigo = await db.transacao.findFirst({ where: { userId: u.id, data: dia(8) }, select: { descricao: true } })
  checar(
    "'Café' gravado duas vezes tem cifra DIFERENTE no banco",
    doisCafes[0].descricao !== cafeAntigo!.descricao
  )
  await db.transacao.delete({ where: { id: a.id } })

  // ---- o que um segundo extrato traria ----
  console.log("\nconferência lendo pelo repo (decifrado)")
  const novas = [
    { data: dia(5), tipo: "despesa", valor: 39.9, descricao: "netflix com" }, // 0 repetida, outro grafismo
    { data: dia(8), tipo: "despesa", valor: 12, descricao: "PAG*CAFETERIA" }, // 1 mesmo dia/valor, outro nome
    { data: dia(1), tipo: "receita", valor: 5000, descricao: "Salário" }, // 2 repetida
    { data: dia(9), tipo: "despesa", valor: 210.5, descricao: "Mercado" }, // 3 igual a uma PENDENTE
    { data: dia(22), tipo: "despesa", valor: 39.9, descricao: "NETFLIX.COM" }, // 4 mês seguinte, gasto real
  ]

  const dias = novas.map((t) => t.data.getTime())
  const jaLancadas = await listarTransacoes(u.id, {
    de: new Date(Math.min(...dias) - 86_400_000),
    ate: new Date(Math.max(...dias) + 86_400_000),
    incluir: "confirmadas",
    comCategoria: false,
  })
  checar("o repo devolve só as confirmadas (a pendente fica fora)", jaLancadas.length === 3, `veio ${jaLancadas.length}`)
  checar("e devolve decifrado", jaLancadas.some((t) => t.descricao === "NETFLIX.COM" && t.valor === 39.9))

  const r = acharDuplicatas(jaLancadas, novas)
  const mapa = new Map(r.map((d) => [d.indice, d.confianca]))
  checar("a repetida de nome equivalente casa apesar da cifra", mapa.get(0) === "exata", `veio ${mapa.get(0)}`)
  checar("mesmo dia/valor com outro nome sai como provável", mapa.get(1) === "provavel", `veio ${mapa.get(1)}`)
  checar("receita repetida casa", mapa.get(2) === "exata", `veio ${mapa.get(2)}`)
  checar("linha igual a uma PENDENTE não é duplicata", !mapa.has(3))
  checar("mesmo valor em outro mês não é duplicata", !mapa.has(4))
  checar("no total, 3 suspeitas de 5 linhas", r.length === 3, `veio ${r.length}`)

  // ---- a consulta é barata: janela em claro, não histórico inteiro ----
  console.log("\na janela limita o que é lido")
  await criarTransacao(u.id, { descricao: "Antigo", valor: 10, tipo: "despesa", categoriaId: null, data: new Date(Date.UTC(2025, 0, 5, 12)) })
  const janela = await listarTransacoes(u.id, {
    de: dia(1), ate: dia(30), incluir: "confirmadas", comCategoria: false,
  })
  checar("lançamento de 2025 fica fora da janela de julho/2026", !janela.some((t) => t.descricao === "Antigo"))
} finally {
  await db.user.delete({ where: { id: u.id } }).catch(() => {})
  await db.$disconnect()
}

console.log(falhas === 0 ? "\n✓ todos os casos passaram" : `\n✗ ${falhas} falha(s)`)
process.exit(falhas === 0 ? 0 : 1)
