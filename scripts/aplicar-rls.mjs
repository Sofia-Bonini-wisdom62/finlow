/**
 * Liga RLS em toda tabela do schema public e tira o acesso do papel `anon`.
 *
 * POR QUE ISTO É UM SCRIPT E NÃO UM PASSO NA CABEÇA DE ALGUÉM
 * `prisma db push` cria tabela SEM RLS. No Supabase, tabela sem RLS é legível
 * pela API REST pública com a chave anônima — que é pública por design. Ou
 * seja: toda tabela nova nasce aberta na internet até alguém rodar isto.
 *
 * Aconteceu duas vezes neste projeto (MemoriaUsuario e Orcamento). Nas duas a
 * tabela estava vazia e nada vazou, mas a janela existiu — e a regra estava
 * documentada nas duas vezes. Documentação não fecha janela; `pnpm db:push`,
 * que roda os dois juntos, fecha.
 *
 *   node scripts/aplicar-rls.mjs
 */
import { readFileSync } from "node:fs"
import { PrismaClient } from "@prisma/client"
import { config } from "dotenv"

config({ path: ".env.local" })
config({ path: ".env" })

const db = new PrismaClient()

const CONSULTA_ABERTAS = `
  SELECT c.relname AS tabela
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname='public' AND c.relkind='r'
    AND (NOT c.relrowsecurity OR has_table_privilege('anon', c.oid,'SELECT'))`

try {
  const abertas = await db.$queryRawUnsafe(CONSULTA_ABERTAS)
  if (abertas.length) {
    console.log(`[rls] abertas antes: ${abertas.map((a) => a.tabela).join(", ")}`)
  }

  const sql = readFileSync("prisma/seguranca-rls.sql", "utf8")
  const bloco = sql.slice(sql.indexOf("DO $$"), sql.indexOf("-- 2)"))
  await db.$executeRawUnsafe(bloco)

  const restantes = await db.$queryRawUnsafe(CONSULTA_ABERTAS)
  const [{ total }] = await db.$queryRawUnsafe(`
    SELECT count(*)::int AS total FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='public' AND c.relkind='r'`)

  if (restantes.length) {
    console.error(`[rls] FALHOU — ainda abertas: ${restantes.map((r) => r.tabela).join(", ")}`)
    process.exit(1)
  }
  console.log(`[rls] ok — ${total} tabelas com RLS, nenhuma legível por anon`)
} finally {
  await db.$disconnect()
}
