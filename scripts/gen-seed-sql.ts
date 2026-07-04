// Gera SQL de seed pro Supabase SQL Editor (rede corporativa bloqueia conexão direta).
// Uso: npx tsx scripts/gen-seed-sql.ts > prisma/seed-data.sql
import { randomUUID } from "crypto"
import { modulosSeeds } from "../prisma/modulos-data"

function esc(s: string): string {
  return s.replace(/'/g, "''")
}

let sql = `-- Seed: módulos M1 dos 4 perfis (gerado por scripts/gen-seed-sql.ts)
-- Rodar inteiro no Supabase SQL Editor. Idempotente: apaga e reinsere cada módulo pelo slug.

`

for (const mod of modulosSeeds) {
  const moduloId = randomUUID()

  sql += `-- ============ ${mod.slug} ============
DELETE FROM "Tela" WHERE "moduloId" IN (SELECT id FROM "Modulo" WHERE slug = '${esc(mod.slug)}');
DELETE FROM "ProgressoModulo" WHERE "moduloId" IN (SELECT id FROM "Modulo" WHERE slug = '${esc(mod.slug)}');
DELETE FROM "Modulo" WHERE slug = '${esc(mod.slug)}';

INSERT INTO "Modulo" (id, slug, titulo, subtitulo, "tipoPerfil", ordem, xp)
VALUES ('${moduloId}', '${esc(mod.slug)}', '${esc(mod.titulo)}', '${esc(mod.subtitulo)}', '${mod.tipoPerfil}', ${mod.ordem}, ${mod.xp});

`

  for (const t of mod.telas) {
    sql += `INSERT INTO "Tela" (id, "moduloId", ordem, tipo, label, conteudo)
VALUES ('${randomUUID()}', '${moduloId}', ${t.ordem}, '${t.tipo}', '${esc(t.label)}', '${esc(JSON.stringify(t.conteudo))}'::jsonb);

`
  }
}

console.log(sql)
