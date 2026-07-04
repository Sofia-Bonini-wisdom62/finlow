-- Migração: checklist -> card flow (idempotente)
-- Rodar inteiro no Supabase SQL Editor

-- 1. Remove tabelas antigas
DROP TABLE IF EXISTS "Progresso";
DROP TABLE IF EXISTS "ChecklistItem";

-- 2. Ajusta Modulo
ALTER TABLE "Modulo" DROP COLUMN IF EXISTS "descricao";
ALTER TABLE "Modulo" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Modulo" ADD COLUMN IF NOT EXISTS "subtitulo" TEXT;
ALTER TABLE "Modulo" ADD COLUMN IF NOT EXISTS "xp" INTEGER NOT NULL DEFAULT 50;

-- limpa módulos sem slug (dados antigos do checklist)
DELETE FROM "Modulo" WHERE "slug" IS NULL;

ALTER TABLE "Modulo" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "Modulo" ALTER COLUMN "subtitulo" SET NOT NULL;

DROP INDEX IF EXISTS "Modulo_slug_key";
CREATE UNIQUE INDEX "Modulo_slug_key" ON "Modulo"("slug");

DROP INDEX IF EXISTS "Modulo_tipoPerfil_ordem_idx";
CREATE INDEX "Modulo_tipoPerfil_ordem_idx" ON "Modulo"("tipoPerfil", "ordem");

-- 3. Tela (cria se não existir)
CREATE TABLE IF NOT EXISTS "Tela" (
    "id" TEXT NOT NULL,
    "moduloId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "conteudo" JSONB NOT NULL,
    CONSTRAINT "Tela_pkey" PRIMARY KEY ("id")
);

DROP INDEX IF EXISTS "Tela_moduloId_ordem_key";
CREATE UNIQUE INDEX "Tela_moduloId_ordem_key" ON "Tela"("moduloId", "ordem");

ALTER TABLE "Tela" DROP CONSTRAINT IF EXISTS "Tela_moduloId_fkey";
ALTER TABLE "Tela"
  ADD CONSTRAINT "Tela_moduloId_fkey"
  FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. ProgressoModulo (cria se não existir)
CREATE TABLE IF NOT EXISTS "ProgressoModulo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduloId" TEXT NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "telaAtual" INTEGER NOT NULL DEFAULT 0,
    "concluidoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgressoModulo_pkey" PRIMARY KEY ("id")
);

DROP INDEX IF EXISTS "ProgressoModulo_userId_moduloId_key";
CREATE UNIQUE INDEX "ProgressoModulo_userId_moduloId_key" ON "ProgressoModulo"("userId", "moduloId");

ALTER TABLE "ProgressoModulo" DROP CONSTRAINT IF EXISTS "ProgressoModulo_userId_fkey";
ALTER TABLE "ProgressoModulo"
  ADD CONSTRAINT "ProgressoModulo_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProgressoModulo" DROP CONSTRAINT IF EXISTS "ProgressoModulo_moduloId_fkey";
ALTER TABLE "ProgressoModulo"
  ADD CONSTRAINT "ProgressoModulo_moduloId_fkey"
  FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
