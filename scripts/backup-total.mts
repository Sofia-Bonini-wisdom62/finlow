/**
 * Backup COMPLETO do banco: todas as tabelas, todas as linhas.
 *
 * Existe porque `scripts/backup-financeiro.mjs` cobre três tabelas (transações,
 * contas fixas e categorias) de vinte e oito. Ele foi escrito para uma migração
 * específica de criptografia e continua servindo para aquilo — mas não é rede
 * de segurança para mexer em schema.
 *
 * A LISTA DE TABELAS NÃO É ESCRITA À MÃO
 * Sai do próprio Prisma (`Prisma.dmmf`), então tabela nova entra no backup no
 * dia em que nasce. Lista manual é lista que esquece a vigésima nona — e o
 * jeito de descobrir seria perder justamente ela.
 *
 * O QUE ESTÁ CIFRADO CONTINUA CIFRADO
 * Descrições, valores, memórias, investimentos e o diagnóstico saem como estão
 * no banco ("v1.…"). Decifrar produziria um arquivo em claro com a vida
 * financeira de todo mundo, que é um risco maior que o problema que o backup
 * resolve. Consequência, dita em voz alta: este arquivo NÃO restaura nada sem a
 * `ENCRYPTION_KEY` — a mesma que o CLAUDE.md diz que, perdida, leva os dados
 * junto.
 *
 * Sai em `backups/`, que o .gitignore já barra. Não versione, não anexe em
 * ticket, não mande por chat.
 *
 *   node --import tsx scripts/backup-total.mts
 *   node --import tsx scripts/backup-total.mts --restaurar backups/arquivo.json --sim-eu-quero
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

import { mkdirSync, writeFileSync, readFileSync, statSync } from "node:fs"
import { Prisma } from "@prisma/client"

const { db } = await import("../lib/db.js")

type Linha = Record<string, unknown>

/**
 * Data vira marcador explícito: string ISO solta voltaria como texto.
 *
 * O VALOR VEM DE `this[chave]`, NÃO DO PARÂMETRO — e isso não é estilo.
 * `JSON.stringify` chama `Date.prototype.toJSON` ANTES de passar o valor ao
 * replacer, então `valor` já chega como string e `valor instanceof Date` é
 * sempre falso. A primeira versão fazia exatamente isso: gravava a data como
 * texto, o reviver não reconhecia nada, e o backup voltava com toda data
 * virada string. Prisma até aceita ISO em campo DateTime, então a restauração
 * podia até funcionar — o defeito só apareceria em quem comparasse datas
 * depois. `this` é o objeto que contém a chave, com o valor ainda intacto.
 */
function serializar(this: Record<string, unknown>, chave: string, valor: unknown): unknown {
  const bruto = this?.[chave]
  if (bruto instanceof Date) return { __data: bruto.toISOString() }
  if (typeof bruto === "bigint") return { __bigint: bruto.toString() }
  return valor
}

function desserializar(_chave: string, valor: unknown): unknown {
  if (valor && typeof valor === "object") {
    const v = valor as Record<string, unknown>
    if (typeof v.__data === "string") return new Date(v.__data)
    if (typeof v.__bigint === "string") return BigInt(v.__bigint)
  }
  return valor
}

/** Os modelos do schema, com o nome que o client usa (`db.progressoLicao`). */
const MODELOS = Prisma.dmmf.datamodel.models.map((m) => ({
  nome: m.name,
  acessor: m.name.charAt(0).toLowerCase() + m.name.slice(1),
  /** Modelos dos quais este depende: o pai tem de ser restaurado antes. */
  depende: m.fields
    .filter((f) => f.kind === "object" && f.relationFromFields?.length)
    .map((f) => f.type)
    .filter((t) => t !== m.name), // autorrelação não bloqueia a própria tabela
}))

/**
 * Ordem de restauração: pai antes de filho.
 *
 * Sem isto o `createMany` de Transacao bateria em chave estrangeira porque o
 * User ainda não existe. A ordem sai das relações do schema, não de uma lista
 * combinada — mesma razão da lista de tabelas.
 */
function ordenarPorDependencia(): string[] {
  const restantes = new Map(MODELOS.map((m) => [m.nome, new Set(m.depende)]))
  const ordem: string[] = []

  while (restantes.size > 0) {
    const livres = [...restantes.entries()]
      .filter(([, deps]) => [...deps].every((d) => !restantes.has(d)))
      .map(([nome]) => nome)

    if (livres.length === 0) {
      // Ciclo entre tabelas: restaurar em ordem nenhuma resolveria, e seguir
      // em silêncio produziria um backup que não volta.
      throw new Error(`ciclo de dependência entre: ${[...restantes.keys()].join(", ")}`)
    }
    for (const nome of livres.sort()) {
      ordem.push(nome)
      restantes.delete(nome)
    }
  }
  return ordem
}

// --------------------------------------------------------------- backup ---
async function fazerBackup() {
  const ordem = ordenarPorDependencia()
  const dados: Record<string, Linha[]> = {}
  const contagem: Record<string, number> = {}

  for (const nome of ordem) {
    const acessor = MODELOS.find((m) => m.nome === nome)!.acessor
    const cliente = (db as unknown as Record<string, { findMany: () => Promise<Linha[]> }>)[acessor]
    if (!cliente?.findMany) throw new Error(`sem acessor para o modelo ${nome}`)
    const linhas = await cliente.findMany()
    dados[nome] = linhas
    contagem[nome] = linhas.length
  }

  // Confere contra o próprio banco: tabela do Postgres que o Prisma não conhece
  // ficaria de fora sem ninguém notar.
  const tabelas = (await db.$queryRawUnsafe<{ tabela: string }[]>(`
    SELECT c.relname AS tabela FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='public' AND c.relkind='r'`)).map((t) => t.tabela)
  const foraDoBackup = tabelas.filter((t) => !ordem.includes(t) && !t.startsWith("_"))

  const conteudo = {
    geradoEm: new Date().toISOString(),
    ordemDeRestauracao: ordem,
    contagem,
    totalLinhas: Object.values(contagem).reduce((a, b) => a + b, 0),
    aviso:
      "Campos cifrados saem como estão. Sem a ENCRYPTION_KEY correspondente, " +
      "os valores financeiros deste arquivo são irrecuperáveis.",
    dados,
  }

  mkdirSync("backups", { recursive: true })
  const carimbo = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
  const arquivo = `backups/completo-${carimbo}.json`
  writeFileSync(arquivo, JSON.stringify(conteudo, serializar, 2), "utf8")

  // Relê o que foi escrito: arquivo que não volta do disco não é backup.
  const relido = JSON.parse(readFileSync(arquivo, "utf8"), desserializar) as typeof conteudo
  const divergentes = ordem.filter((n) => (relido.dados[n]?.length ?? -1) !== contagem[n])

  console.log(`backup: ${arquivo}  (${(statSync(arquivo).size / 1048576).toFixed(2)} MB)`)
  console.log(`${ordem.length} tabelas · ${conteudo.totalLinhas} linhas\n`)
  for (const n of ordem) {
    if (contagem[n]! > 0) console.log(`  ${String(contagem[n]).padStart(6)}  ${n}`)
  }
  const vazias = ordem.filter((n) => contagem[n] === 0)
  if (vazias.length) console.log(`\n  (vazias: ${vazias.join(", ")})`)

  if (foraDoBackup.length) {
    console.error(`\n✗ tabela(s) no banco que o Prisma não conhece, FORA do backup: ${foraDoBackup.join(", ")}`)
    process.exit(1)
  }
  if (divergentes.length) {
    console.error(`\n✗ o arquivo não confere com o que foi lido: ${divergentes.join(", ")}`)
    process.exit(1)
  }
  console.log(`\n✓ relido do disco, ${ordem.length} tabelas conferem`)
}

// ------------------------------------------------------------ restauração ---
async function restaurar(arquivo: string) {
  const conteudo = JSON.parse(readFileSync(arquivo, "utf8"), desserializar) as {
    geradoEm: string
    ordemDeRestauracao: string[]
    contagem: Record<string, number>
    dados: Record<string, Linha[]>
  }

  console.log(`restaurando ${arquivo} (de ${conteudo.geradoEm})`)
  console.log(`APAGA o conteúdo atual das tabelas e regrava o do arquivo.\n`)

  // Apaga na ordem INVERSA da restauração: filho antes de pai.
  const inversa = [...conteudo.ordemDeRestauracao].reverse()
  for (const nome of inversa) {
    const acessor = MODELOS.find((m) => m.nome === nome)?.acessor
    if (!acessor) continue
    const cliente = (db as unknown as Record<string, { deleteMany: () => Promise<{ count: number }> }>)[acessor]
    await cliente.deleteMany()
  }

  for (const nome of conteudo.ordemDeRestauracao) {
    const linhas = conteudo.dados[nome] ?? []
    if (linhas.length === 0) continue
    const acessor = MODELOS.find((m) => m.nome === nome)?.acessor
    if (!acessor) continue
    const cliente = (db as unknown as Record<string, { createMany: (a: { data: Linha[] }) => Promise<{ count: number }> }>)[acessor]
    await cliente.createMany({ data: linhas })
    console.log(`  ${String(linhas.length).padStart(6)}  ${nome}`)
  }
  console.log(`\n✓ restaurado. Rode 'node scripts/aplicar-rls.mjs' se o schema mudou.`)
}

// ------------------------------------------------------------------ cli ---
try {
  const args = process.argv.slice(2)
  const i = args.indexOf("--restaurar")

  if (i >= 0) {
    const arquivo = args[i + 1]
    if (!arquivo) throw new Error("uso: --restaurar <arquivo.json> --sim-eu-quero")
    // Restaurar APAGA o banco atual. Uma flag longa e feia é de propósito:
    // ninguém digita isso por engano ao repetir um comando do histórico.
    if (!args.includes("--sim-eu-quero")) {
      console.error(
        `\nIsto APAGA todas as tabelas e regrava o conteúdo de ${arquivo}.\n` +
        `Se é isso mesmo, repita com --sim-eu-quero no fim.\n`
      )
      process.exit(1)
    }
    await restaurar(arquivo)
  } else {
    await fazerBackup()
  }
} finally {
  await db.$disconnect()
}
