-- Arquitetura das tabelas do Finlow — 26 tabelas.
-- GERADO por scripts/exportar-banco.mts em 2026-08-06. Não edite à mão:
-- a fonte é prisma/schema.prisma, e é lá que os comentários explicam o PORQUÊ
-- de cada decisão (cifra, cascade, campos em claro).
--
-- Isto cria as tabelas SEM Row Level Security. Sozinho ele deixa o banco
-- aberto na API pública do Supabase — rode 02-rls.sql depois, sempre.

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "senha" TEXT,
    "consentimentoLGPD" TIMESTAMP(3),
    "consentimentoPainelEm" TIMESTAMP(3),
    "memoriaAtiva" BOOLEAN NOT NULL DEFAULT false,
    "onboardingEm" TIMESTAMP(3),
    "nivel" TEXT NOT NULL DEFAULT 'iniciante',
    "tendencia" TEXT,
    "pontos" INTEGER NOT NULL DEFAULT 0,
    "apelido" TEXT,
    "rankingOptIn" BOOLEAN NOT NULL DEFAULT false,
    "codigoIndicacao" TEXT,
    "moduloAvancado" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investimento" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "instituicao" TEXT,
    "valorAtual" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticoVazamento" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalAnual" TEXT NOT NULL,
    "achados" TEXT NOT NULL,
    "narrativa" TEXT,
    "geradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entregueEm" TIMESTAMP(3),
    "tokenPublico" TEXT,

    CONSTRAINT "DiagnosticoVazamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Indicacao" (
    "id" TEXT NOT NULL,
    "indicadorId" TEXT NOT NULL,
    "indicadoId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'cadastrado',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativadoEm" TIMESTAMP(3),

    CONSTRAINT "Indicacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemoriaUsuario" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "origem" TEXT NOT NULL DEFAULT 'ia',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemoriaUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waitlist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadEmpresa" (
    "id" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tamanho" TEXT,
    "mensagem" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaFixa" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "diaVencimento" INTEGER,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContaFixa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cor" TEXT,
    "padrao" BOOLEAN NOT NULL DEFAULT false,
    "escopo" TEXT NOT NULL DEFAULT 'pessoal',

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orcamento" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoriaId" TEXT,
    "limite" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orcamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transacao" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoriaId" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmado" BOOLEAN NOT NULL DEFAULT false,
    "origem" TEXT NOT NULL DEFAULT 'manual',
    "escopo" TEXT NOT NULL DEFAULT 'pessoal',
    "extratoImportId" TEXT,

    CONSTRAINT "Transacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtratoImport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "banco" TEXT,
    "periodoInicio" TIMESTAMP(3),
    "periodoFim" TIMESTAMP(3),
    "totalLinhas" INTEGER,
    "erroValidacao" TEXT,
    "tokensEntrada" INTEGER,
    "tokensSaida" INTEGER,
    "modelo" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtratoImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversa" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titulo" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversaMensagem" (
    "id" TEXT NOT NULL,
    "conversaId" TEXT NOT NULL,
    "papel" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "cards" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversaMensagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Onboarding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "objetivo" TEXT NOT NULL,
    "objetivoOutro" TEXT,
    "eixo2" TEXT NOT NULL,
    "eixo2Valor" TEXT NOT NULL,
    "eixo2Outro" TEXT,
    "momento" TEXT NOT NULL,
    "nivelInferido" TEXT,
    "situacoes" TEXT[],
    "concluidoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoPontuacao" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "pontos" INTEGER NOT NULL,
    "refId" TEXT NOT NULL DEFAULT '-',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoPontuacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecomendacaoTrilha" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduloId" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "origem" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "entregueEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leva" INTEGER NOT NULL DEFAULT 1,
    "substituidaEm" TIMESTAMP(3),

    CONSTRAINT "RecomendacaoTrilha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Perfil" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "respostas" JSONB NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Perfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modulo" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "subtitulo" TEXT NOT NULL,
    "tipoPerfil" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 50,
    "thumbnail" TEXT,
    "duracaoMin" INTEGER NOT NULL DEFAULT 2,
    "tags" TEXT[],
    "nivel" TEXT NOT NULL DEFAULT 'iniciante',
    "situacoes" TEXT[],
    "publico" TEXT NOT NULL DEFAULT 'adulto',

    CONSTRAINT "Modulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tela" (
    "id" TEXT NOT NULL,
    "moduloId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "conteudo" JSONB NOT NULL,

    CONSTRAINT "Tela_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressoModulo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduloId" TEXT NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "telaAtual" INTEGER NOT NULL DEFAULT 0,
    "concluidoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressoModulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Indicador" (
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "rotulo" TEXT NOT NULL,
    "numero" DOUBLE PRECISION,
    "fonte" TEXT NOT NULL,
    "apuradoEm" TIMESTAMP(3) NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Indicador_pkey" PRIMARY KEY ("chave")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_apelido_key" ON "User"("apelido");

-- CreateIndex
CREATE UNIQUE INDEX "User_codigoIndicacao_key" ON "User"("codigoIndicacao");

-- CreateIndex
CREATE INDEX "Investimento_userId_idx" ON "Investimento"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosticoVazamento_userId_key" ON "DiagnosticoVazamento"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosticoVazamento_tokenPublico_key" ON "DiagnosticoVazamento"("tokenPublico");

-- CreateIndex
CREATE UNIQUE INDEX "Indicacao_indicadoId_key" ON "Indicacao"("indicadoId");

-- CreateIndex
CREATE INDEX "Indicacao_indicadorId_idx" ON "Indicacao"("indicadorId");

-- CreateIndex
CREATE INDEX "MemoriaUsuario_userId_criadoEm_idx" ON "MemoriaUsuario"("userId", "criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "Waitlist_email_key" ON "Waitlist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LeadEmpresa_email_key" ON "LeadEmpresa"("email");

-- CreateIndex
CREATE INDEX "LeadEmpresa_criadoEm_idx" ON "LeadEmpresa"("criadoEm");

-- CreateIndex
CREATE INDEX "Orcamento_userId_idx" ON "Orcamento"("userId");

-- CreateIndex
CREATE INDEX "Transacao_userId_confirmado_idx" ON "Transacao"("userId", "confirmado");

-- CreateIndex
CREATE INDEX "ExtratoImport_userId_criadoEm_idx" ON "ExtratoImport"("userId", "criadoEm");

-- CreateIndex
CREATE INDEX "Conversa_userId_atualizadoEm_idx" ON "Conversa"("userId", "atualizadoEm");

-- CreateIndex
CREATE INDEX "ConversaMensagem_conversaId_criadoEm_idx" ON "ConversaMensagem"("conversaId", "criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "Onboarding_userId_key" ON "Onboarding"("userId");

-- CreateIndex
CREATE INDEX "EventoPontuacao_userId_criadoEm_idx" ON "EventoPontuacao"("userId", "criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "EventoPontuacao_userId_motivo_refId_key" ON "EventoPontuacao"("userId", "motivo", "refId");

-- CreateIndex
CREATE INDEX "Insight_userId_criadoEm_idx" ON "Insight"("userId", "criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "RecomendacaoTrilha_userId_moduloId_origem_key" ON "RecomendacaoTrilha"("userId", "moduloId", "origem");

-- CreateIndex
CREATE UNIQUE INDEX "Perfil_userId_key" ON "Perfil"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Modulo_slug_key" ON "Modulo"("slug");

-- CreateIndex
CREATE INDEX "Modulo_tipoPerfil_ordem_idx" ON "Modulo"("tipoPerfil", "ordem");

-- CreateIndex
CREATE INDEX "Modulo_publico_ordem_idx" ON "Modulo"("publico", "ordem");

-- CreateIndex
CREATE UNIQUE INDEX "Tela_moduloId_ordem_key" ON "Tela"("moduloId", "ordem");

-- CreateIndex
CREATE UNIQUE INDEX "ProgressoModulo_userId_moduloId_key" ON "ProgressoModulo"("userId", "moduloId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Investimento" ADD CONSTRAINT "Investimento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticoVazamento" ADD CONSTRAINT "DiagnosticoVazamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indicacao" ADD CONSTRAINT "Indicacao_indicadorId_fkey" FOREIGN KEY ("indicadorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indicacao" ADD CONSTRAINT "Indicacao_indicadoId_fkey" FOREIGN KEY ("indicadoId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoriaUsuario" ADD CONSTRAINT "MemoriaUsuario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaFixa" ADD CONSTRAINT "ContaFixa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_extratoImportId_fkey" FOREIGN KEY ("extratoImportId") REFERENCES "ExtratoImport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtratoImport" ADD CONSTRAINT "ExtratoImport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversa" ADD CONSTRAINT "Conversa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversaMensagem" ADD CONSTRAINT "ConversaMensagem_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "Conversa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Onboarding" ADD CONSTRAINT "Onboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoPontuacao" ADD CONSTRAINT "EventoPontuacao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecomendacaoTrilha" ADD CONSTRAINT "RecomendacaoTrilha_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecomendacaoTrilha" ADD CONSTRAINT "RecomendacaoTrilha_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perfil" ADD CONSTRAINT "Perfil_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tela" ADD CONSTRAINT "Tela_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressoModulo" ADD CONSTRAINT "ProgressoModulo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressoModulo" ADD CONSTRAINT "ProgressoModulo_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
