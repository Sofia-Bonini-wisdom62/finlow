# Finlow

Assistente financeiro conversacional com IA para adultos brasileiros.

A pessoa conversa com o assistente, sobe o extrato do banco (PDF/CSV/OFX, lido
no navegador), e o app devolve clareza: para onde o dinheiro vai, o que está
vazando, e o que fazer primeiro. As trilhas educacionais de 2 minutos existem
como instrumento de retenção, recomendadas pela situação real de cada pessoa —
não são o produto principal.

## Público (personas do plano de negócios)

- **A — Endividado em urgência.** Rotativo rodando, nome negativado ou perto
  disso. Precisa estancar o sangramento antes de qualquer outra coisa.
- **B — Desorganizado que quer visão.** Ganha razoável, não sabe para onde vai.
  Quer o retrato sem planilha e sem culpa.
- **C — Organizado que quer profundidade.** Já controla o básico; quer
  consolidação, projeção e a separação pessoal × trabalho (MEI/autônomo).

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript strict |
| Estilo | Tailwind CSS v4 + shadcn/ui |
| Banco | PostgreSQL (Supabase) + Prisma 5 — RLS em todas as tabelas |
| Auth | NextAuth.js v5 (credenciais + Google) |
| IA | Vertex AI (Gemini) via `lib/vertex.ts`, costura única em `lib/ia.ts` |
| Cifra | AES-256-GCM (`lib/cripto.ts`) nos campos financeiros |
| Deploy | Vercel, push direto na `main` — produção: https://finlow-xi.vercel.app |

## Como rodar

```bash
pnpm install
cp .env.example .env.local   # preencher — ver comentários no próprio arquivo
pnpm db:push                 # prisma db push + RLS (scripts/aplicar-rls.mjs)
npx tsx prisma/seed.ts       # módulos da Temporada 1
npx tsx scripts/classificar-t1.mts --aplicar   # nível e situações da T1
npx tsx scripts/semear-indicadores.mts         # grava direto, sem flag
npx tsx scripts/semear-t2.mts --aplicar
npx tsx scripts/semear-ef.mts --aplicar        # trilha escolar de EF (sem a flag, só simula)
npx tsx scripts/semear-em.mts --aplicar        # trilha de EM (idem)
pnpm dev
```

O `classificar-t1` não é opcional e faltava nesta lista. `prisma/seed.ts` grava
os 16 módulos da T1 **sem** `nivel`, `situacoes` e `tags` — eles nascem no
default (`iniciante`, listas vazias). Sem esse passo a T1 entra na biblioteca
sem posição nenhuma: a recomendação por situação não a alcança e a busca por
tag não a encontra. A T2 e a trilha de EM já nascem classificadas no próprio
seed.

`ENCRYPTION_KEY` precisa ser idêntica no `.env.local` e na Vercel. **Perder a
chave é perder os dados financeiros** — não há recuperação.

## Estrutura

```
app/
  (auth)/         login e cadastro
  (app)/          telas logadas: chat, perfil, análises, painel, ajustes…
  trilha/         biblioteca de aulas + player do card flow
  escola/         painel escolar: turmas, professores, desempenho por aluno
  convite/        convite de escola por código (rota + tela de aceite)
  api/            rotas — chat, extrato, painel, trilha, ranking, ops…
lib/              domínio: financas, ia, pontos, recomendacao, cripto, repos
components/       UI por área (chat/, trilha/, analises/, painel/)
prisma/           schema, seeds (modulos-data, modulos-t2), RLS
scripts/          seeds, baterias de teste (testar-*.mts), auditoria
docs/             matriz BCB, backlog T2, estado do produto
```

## Fluxo de dados

- **Hoje:** extrato em PDF/CSV/OFX lido **no navegador** (pdfjs-dist) — o
  arquivo bruto nunca sobe. O texto vai para a Vertex, as linhas voltam como
  propostas, e nada entra confirmado sem toque da pessoa.
- **Na fila (05/08/2026):** conector Open Finance — ligar os bancos direto no
  app para puxar extrato, saldo e contas fixas. Saiu de "outra frente" e entrou
  no backlog deste repo; enquanto não começa, o caminho de entrada continua
  sendo o upload acima. Ver [`docs/backlog-produto.md`](docs/backlog-produto.md).
- Campos financeiros (`descricao`, `valor`, `nome`, `limite`…) são cifrados e
  só se acessam pelos repos (`lib/financeiro-repo.ts` etc.) — ler direto
  devolve `"v1.…"` e o número vira 0 em silêncio.

## Regras que não mudam

1. A IA propõe, a pessoa confirma. Nenhum caminho grava dinheiro sem toque.
2. Tabela nova nasce com `userId`, `onDelete: Cascade` e RLS (`pnpm db:push`
   aplica e falha se alguma tabela ficar aberta).
3. Dado novo do usuário entra em `/api/exportar` e sai no delete de `/api/conta`.
   Desde 24/08/2026 a regra é conferida, não confiada: classifique o modelo em
   `lib/dados-exportacao.ts` ou `scripts/testar-exportacao.mts` acusa.
4. O Finlow explica mecanismo e nunca indica produto financeiro — recomendação
   é de profissional autorizado pela CVM.
5. Antes de qualquer push: `pnpm build` verde e as baterias `scripts/testar-*`.
6. Documentação e código mudam no **mesmo commit** — ver
   [`docs/`](docs/README.md).

## Documentação

Toda a governança do projeto está em **[`docs/`](docs/README.md)**. Os dois
atalhos mais usados:

- [`docs/estado-do-produto.md`](docs/estado-do-produto.md) — o que existe de
  verdade, promessa por promessa.
- [`docs/backlog-produto.md`](docs/backlog-produto.md) — o que está na fila.
