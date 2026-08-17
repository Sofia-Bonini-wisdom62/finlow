# Arquivo do banco

Retrato do banco do Finlow em SQL: a arquitetura das tabelas e o conteúdo do
produto. Serve para consultar sem abrir o Supabase, para recriar o banco do
zero, e como registro de como as coisas estavam numa data.

**Nada aqui é escrito à mão.** Roda:

```bash
node --import tsx scripts/exportar-banco.mts
```

O esquema sai de `prisma/schema.prisma` e os dados saem do banco de produção,
então atualizar é reexecutar. Editar os `.sql` na mão cria uma segunda versão
da verdade, que é o problema que esta pasta existe para não ter.

| Arquivo | O que é |
|---|---|
| `01-esquema.sql` | `CREATE TABLE` de todas as tabelas do schema, com índices e chaves estrangeiras — a contagem exata está no cabeçalho do próprio arquivo, que se regenera junto |
| `02-rls.sql` | Cópia de `prisma/seguranca-rls.sql` — liga RLS e fecha o acesso do papel `anon` |
| `03-dados-de-sistema.sql` | Os módulos da trilha, as telas de cada um e a tabela de indicadores |

## O que NÃO está aqui

Nenhuma linha de usuário: nem transação, nem conta fixa, nem orçamento, nem
memória do assistente, nem investimento, nem diagnóstico, nem e-mail de
waitlist ou de lead. Do schema inteiro, só as três tabelas de conteúdo de
sistema (`Modulo`, `Tela`, `Indicador`) têm dados no retrato; todo o resto é
dado de gente e fica fora, decisão registrada em
`scripts/exportar-banco.mts`, não esquecimento.

Dois motivos que se somam. Os campos financeiros são cifrados com a
`ENCRYPTION_KEY`, então o que sairia num dump seria `"v1.…"` — inútil como
arquivo e ainda assim um dado pessoal fora do banco. E esta pasta vive no git:
dado pessoal em repositório é vazamento com outro nome.

Quem precisa dos dados de uma pessoa usa `/api/exportar`, que é o caminho da
LGPD e entrega só os dados dela, em claro, para ela.

## Tabela nova quebra a exportação, de propósito

O script tem a lista fechada dos dois lados: tabela que não esteja classificada
como conteúdo de sistema nem como dado de gente faz ele **falhar**. É para
alguém decidir de que lado ela fica em vez de a tabela sumir do retrato sem
ninguém notar — a mesma razão pela qual `pnpm db:push` falha quando uma tabela
nasce sem RLS.

## A exportação se prova

No fim, o script roda o que acabou de escrever: cria um schema temporário,
aplica `01` e `03` na ordem documentada, confere se a contagem de módulos bate,
e desfaz tudo com rollback. Um `.sql` arquivado que não roda é papel de parede,
parece um backup e não é — e o erro que importa (coluna que virou array, jsonb
com apóstrofo, `ON CONFLICT` sem a constraint) só aparece na execução.

Se a prova falhar, o script sai com erro em vez de deixar um arquivo quebrado
com cara de pronto.

## Restaurar

Em banco vazio, na ordem: `01`, `02`, `03`.

O `03` é idempotente (`ON CONFLICT DO UPDATE`) e **não apaga nada** — rodar de
novo atualiza os módulos no lugar. Isso é deliberado: apagar `Modulo` levaria o
`ProgressoModulo` de todos os usuários em cascade.

O `01` sozinho cria as tabelas **sem** RLS, e no Supabase tabela sem RLS é
legível pela API REST pública. O `02` nunca é opcional.

> ⚠️ Isto não substitui o backup do Supabase, e não é backup dos dados de
> ninguém. Para os dados financeiros existe `node scripts/backup-financeiro.mjs`,
> que é o que se roda antes de qualquer migração deles.
