/**
 * Exporta o retrato do banco para docs/banco/: arquitetura das tabelas + os
 * dados de SISTEMA (aulas, telas, indicadores).
 *
 * POR QUE GERADO E NÃO ESCRITO À MÃO
 * Um .sql escrito à mão é a próxima coisa deste repo a envelhecer calada — foi
 * exatamente o que aconteceu com o CLAUDE.md, que passou meses descrevendo um
 * produto que já não existia. Aqui o esquema sai do próprio
 * prisma/schema.prisma e os dados saem do banco vivo, então "atualizar o
 * arquivo" é rodar isto de novo.
 *
 * O QUE NÃO SAI DAQUI, E ISSO NÃO É ESQUECIMENTO
 * Nenhuma linha de usuário. Nem transação, nem conta fixa, nem memória, nem
 * e-mail de waitlist ou de lead. Dois motivos que se somam: (1) os campos
 * financeiros são cifrados com a ENCRYPTION_KEY, então o que sairia seria
 * "v1.…" — inútil como arquivo e ainda assim um dado pessoal fora do banco;
 * (2) este arquivo vive no git, e dado pessoal em repositório é vazamento com
 * outro nome. Quem precisa dos dados de uma pessoa usa /api/exportar, que é o
 * caminho da LGPD e entrega só os dados dela.
 *
 * A LISTA DE TABELAS É FECHADA DOS DOIS LADOS: tabela nova que não esteja em
 * SISTEMA nem em USUARIO faz este script FALHAR, em vez de sumir do retrato
 * sem ninguém notar.
 *
 *   node --import tsx scripts/exportar-banco.mts
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

import { execFileSync } from "node:child_process"
import { mkdirSync, writeFileSync, readFileSync } from "node:fs"
import { createRequire } from "node:module"

const { db } = await import("../lib/db.js")

const PASTA = "docs/banco"

/** Conteúdo do produto: igual para todo mundo, e é o que vale arquivar. */
const SISTEMA = ["Modulo", "Tela", "Indicador"] as const

/**
 * Dados de gente. Ficam FORA do arquivo, de propósito — ver o cabeçalho.
 * Estar nesta lista é uma decisão registrada, não uma omissão.
 */
const USUARIO = [
  "User", "Account", "Session", "VerificationToken",
  "Perfil", "Onboarding", "ProgressoModulo", "EventoPontuacao",
  "Transacao", "Categoria", "ContaFixa", "Orcamento", "ExtratoImport",
  "Investimento", "DiagnosticoVazamento",
  "MemoriaUsuario", "Conversa", "ConversaMensagem", "Insight", "RecomendacaoTrilha",
  "Indicacao",
  "ProgressoLicao", "DiaAtivo",
  // Assinatura guarda ids da Stripe (cus_, sub_) e valor pago: dado financeiro
  // e identificador que fala com um sistema de cobrança. UsoMensalIA diz quanto
  // cada pessoa conversou — é comportamento de uso, não conteúdo de produto.
  "Assinatura", "UsoMensalIA",
  // Waitlist e LeadEmpresa são só e-mail e nome: dado pessoal, mesmo não sendo financeiro.
  "Waitlist", "LeadEmpresa",
  // Finlow para Escolas: TUDO fica fora do retrato. Escola e Turma não são
  // "conteúdo do produto igual para todo mundo" — são dado de CLIENTE (nome
  // da escola, nomes de turma), e os vínculos dizem quem estuda onde, que é
  // dado pessoal com nome e sobrenome. Não tem metade sistêmica aqui.
  "Escola", "MembroEscola", "Turma", "MembroTurma",
  "ConviteEscola", "CompetenciaProfessor", "AcessoTrilhaTurma",
]

const agora = new Date()
const dataISO = agora.toISOString().slice(0, 10)

// ---------------------------------------------------------------- guarda ---
const tabelas = (await db.$queryRawUnsafe<{ tabela: string }[]>(`
  SELECT c.relname AS tabela
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r'
  ORDER BY 1`)).map((t) => t.tabela)

const conhecidas = new Set<string>([...SISTEMA, ...USUARIO])
const orfas = tabelas.filter((t) => !conhecidas.has(t) && !t.startsWith("_"))
if (orfas.length) {
  console.error(
    `\n[exportar-banco] FALHOU: tabela(s) que ninguém classificou: ${orfas.join(", ")}\n\n` +
    `Abra scripts/exportar-banco.mts e coloque cada uma em SISTEMA (conteúdo do\n` +
    `produto, entra no arquivo) ou em USUARIO (dado de gente, fica fora). É uma\n` +
    `decisão de privacidade — não tem default seguro para adivinhar.\n`
  )
  await db.$disconnect()
  process.exit(1)
}

// ------------------------------------------------------------- 1. esquema ---
// O DDL sai do próprio schema.prisma, não de um pg_dump: assim ele descreve o
// que o código espera, que é a fonte de verdade deste projeto.
//
// Chama o entrypoint JS do Prisma com o próprio node, e não `npx`: no Node 24
// o spawn de um .cmd sem shell falha com EINVAL no Windows, e passar por shell
// traria problema de quoting no caminho deste projeto, que tem espaço e "&".
const cliPrisma = createRequire(import.meta.url).resolve("prisma/build/index.js")
const ddl = execFileSync(
  process.execPath,
  [cliPrisma, "migrate", "diff", "--from-empty", "--to-schema-datamodel", "prisma/schema.prisma", "--script"],
  { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 32 * 1024 * 1024 }
)

mkdirSync(PASTA, { recursive: true })

writeFileSync(
  `${PASTA}/01-esquema.sql`,
  `-- Arquitetura das tabelas do Finlow — ${tabelas.length} tabelas.
-- GERADO por scripts/exportar-banco.mts em ${dataISO}. Não edite à mão:
-- a fonte é prisma/schema.prisma, e é lá que os comentários explicam o PORQUÊ
-- de cada decisão (cifra, cascade, campos em claro).
--
-- Isto cria as tabelas SEM Row Level Security. Sozinho ele deixa o banco
-- aberto na API pública do Supabase — rode 02-rls.sql depois, sempre.

${ddl.trimEnd()}\n`,
  "utf8"
)

// ----------------------------------------------------------------- 2. RLS ---
const rls = readFileSync("prisma/seguranca-rls.sql", "utf8")
writeFileSync(
  `${PASTA}/02-rls.sql`,
  `-- CÓPIA de prisma/seguranca-rls.sql, tirada em ${dataISO} por
-- scripts/exportar-banco.mts. O original é o que roda em produção (via
-- \`pnpm db:push\`); esta cópia existe para o arquivo do banco ficar completo.
-- Divergiu? O original manda.

${rls.trimEnd()}\n`,
  "utf8"
)

// -------------------------------------------------------------- 3. dados ---
function valor(v: unknown): string {
  if (v === null || v === undefined) return "NULL"
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL"
  if (typeof v === "boolean") return v ? "true" : "false"
  if (v instanceof Date) return `'${v.toISOString()}'`
  if (Array.isArray(v)) {
    // ARRAY[] vazio precisa do cast: sem ele o Postgres não sabe o tipo.
    return v.length === 0
      ? "ARRAY[]::TEXT[]"
      : `ARRAY[${v.map((x) => `'${String(x).replace(/'/g, "''")}'`).join(", ")}]`
  }
  if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`
  return `'${String(v).replace(/'/g, "''")}'`
}

function inserts(tabela: string, linhas: Record<string, unknown>[], pk: string): string {
  if (linhas.length === 0) return `-- ${tabela}: nenhuma linha\n`
  const colunas = Object.keys(linhas[0]!)
  const lista = colunas.map((c) => `"${c}"`).join(", ")
  // ON CONFLICT DO UPDATE em vez de DELETE + INSERT: apagar Modulo levaria o
  // ProgressoModulo de todo mundo em cascade. Rodar isto duas vezes é seguro.
  const atualiza = colunas
    .filter((c) => c !== pk)
    .map((c) => `"${c}" = EXCLUDED."${c}"`)
    .join(", ")

  const valores = linhas
    .map((l) => `  (${colunas.map((c) => valor(l[c])).join(", ")})`)
    .join(",\n")

  return `-- ${tabela}: ${linhas.length} linha(s)\nINSERT INTO "${tabela}" (${lista}) VALUES\n${valores}\nON CONFLICT ("${pk}") DO UPDATE SET ${atualiza};\n`
}

const [modulos, telas, indicadores] = await Promise.all([
  db.modulo.findMany({ orderBy: [{ publico: "asc" }, { ordem: "asc" }] }),
  db.tela.findMany({ orderBy: [{ moduloId: "asc" }, { ordem: "asc" }] }),
  db.indicador.findMany({ orderBy: { chave: "asc" } }),
])

const porPublico = modulos.reduce<Record<string, number>>((acc, m) => {
  acc[m.publico] = (acc[m.publico] ?? 0) + 1
  return acc
}, {})

writeFileSync(
  `${PASTA}/03-dados-de-sistema.sql`,
  `-- Dados de SISTEMA do Finlow — o conteúdo do produto, igual para todo mundo.
-- GERADO por scripts/exportar-banco.mts em ${dataISO}, direto do banco de produção.
--
-- Retrato desta exportação:
--   ${modulos.length} módulos (${Object.entries(porPublico).map(([p, n]) => `${n} de público "${p}"`).join(", ")})
--   ${telas.length} telas
--   ${indicadores.length} indicadores
--
-- NENHUMA linha de usuário aqui: nem transação, nem conta, nem e-mail. O motivo
-- está no cabeçalho de scripts/exportar-banco.mts.
--
-- Para restaurar: rode 01, 02 e depois este. É idempotente (ON CONFLICT DO
-- UPDATE), então rodar de novo atualiza em vez de duplicar, e não apaga
-- progresso de ninguém.

BEGIN;

${inserts("Modulo", modulos as unknown as Record<string, unknown>[], "id")}
${inserts("Tela", telas as unknown as Record<string, unknown>[], "id")}
${inserts("Indicador", indicadores as unknown as Record<string, unknown>[], "chave")}
COMMIT;
`,
  "utf8"
)

// ---------------------------------------------------- 4. prova de restauro ---
/**
 * Executa o que acabou de ser escrito, do jeito que o cabeçalho manda restaurar
 * (esquema e depois dados), num schema temporário — e desfaz tudo no fim.
 *
 * Um .sql arquivado que não roda é papel de parede: parece um backup e não é.
 * O teste tem de ser este, e não uma conferência de sintaxe, porque o erro que
 * importa aparece na execução — coluna que virou array, jsonb com apóstrofo,
 * ON CONFLICT sem a constraint correspondente.
 *
 * Nada toca as tabelas de verdade: o search_path aponta para o schema
 * temporário, e o rollback leva o schema junto.
 */
async function provarRestauro(): Promise<void> {
  const esquemaSQL = readFileSync(`${PASTA}/01-esquema.sql`, "utf8")
  const dadosSQL = readFileSync(`${PASTA}/03-dados-de-sistema.sql`, "utf8")

  const limpar = (sql: string) =>
    sql
      .split(/;\r?\n/) // só ponto-e-vírgula em fim de linha: o \n dentro de JSON vem escapado
      .map((s) =>
        s
          .split("\n")
          .filter((l) => !l.trimStart().startsWith("--"))
          .join("\n")
          .trim()
      )
      .filter((s) => s.length > 0 && !/^(BEGIN|COMMIT)$/i.test(s))

  const temporario = `_prova_restauro_${Date.now()}`
  let comandos = 0

  try {
    await db.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`CREATE SCHEMA "${temporario}"`)
      await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${temporario}"`)

      for (const cmd of [...limpar(esquemaSQL), ...limpar(dadosSQL)]) {
        await tx.$executeRawUnsafe(cmd)
        comandos++
      }

      const [{ n }] = await tx.$queryRawUnsafe<{ n: bigint }[]>(
        `SELECT count(*)::bigint AS n FROM "${temporario}"."Modulo"`
      )
      if (Number(n) !== modulos.length) {
        throw new Error(`restaurou ${n} módulos, esperava ${modulos.length}`)
      }

      // Desfaz o schema inteiro. O throw é o mecanismo de rollback do Prisma.
      throw new Error("__ok__")
    }, { timeout: 120_000 })
  } catch (e) {
    const msg = (e as Error)?.message ?? ""
    if (!msg.includes("__ok__")) {
      console.error(`\n[exportar-banco] o arquivo NÃO restaura (${comandos} comandos rodaram): ${msg}\n`)
      await db.$disconnect()
      process.exit(1)
    }
  }

  console.log(`  prova de restauro       ${comandos} comandos, ${modulos.length} módulos, desfeito`)
}

console.log(`[exportar-banco] ${PASTA}/ atualizado em ${dataISO}`)
console.log(`  01-esquema.sql          ${tabelas.length} tabelas`)
console.log(`  02-rls.sql              cópia de prisma/seguranca-rls.sql`)
console.log(`  03-dados-de-sistema.sql ${modulos.length} módulos · ${telas.length} telas · ${indicadores.length} indicadores`)
console.log(`  fora do arquivo         ${USUARIO.length} tabelas de dado pessoal`)

await provarRestauro()

await db.$disconnect()
