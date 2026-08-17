-- CÓPIA de prisma/seguranca-rls.sql, tirada em 2026-08-17 por
-- scripts/exportar-banco.mts. O original é o que roda em produção (via
-- `pnpm db:push`); esta cópia existe para o arquivo do banco ficar completo.
-- Divergiu? O original manda.

-- Segurança do banco (Supabase) — RLS e grants
--
-- POR QUE ISSO EXISTE:
-- `prisma db push` cria tabelas SEM Row Level Security. No Supabase, qualquer
-- tabela sem RLS fica legível/gravável pela API REST pública (PostgREST) por
-- quem tiver a chave anônima — que é pública por design, exposta em qualquer
-- frontend. Ou seja: tabela sem RLS = dados abertos na internet.
--
-- COMO FUNCIONA A PROTEÇÃO:
-- RLS ligado SEM nenhuma policy = nega tudo para os papéis `anon` e
-- `authenticated`. O app não quebra porque o Prisma conecta como `postgres`,
-- que tem BYPASSRLS (verificado: rolbypassrls = true).
--
-- ⚠️ SEMPRE que criar tabela nova (db push / migrate), rode este arquivo de novo.
--    O `db push` não reaplica RLS sozinho.

-- 1) Liga RLS em todas as tabelas do schema public
DO $$
DECLARE t record;
BEGIN
  FOR t IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t.relname);
    EXECUTE format('REVOKE ALL ON TABLE %I FROM anon, authenticated', t.relname);
  END LOOP;
END $$;

-- 2) Conferência — o esperado é sem_rls = 0 e anon_le = 0
SELECT
  count(*) FILTER (WHERE NOT c.relrowsecurity) AS sem_rls,
  count(*) FILTER (WHERE has_table_privilege('anon', c.oid, 'SELECT')) AS anon_le,
  count(*) AS total
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r';
