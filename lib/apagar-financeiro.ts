/**
 * A execução de "Apagar meus dados financeiros".
 *
 * Separado de `lib/dados-financeiros.ts` de propósito: aquele arquivo é a LISTA,
 * e é lido por `scripts/testar-apagar-dados.mts`, que roda sem banco. Se a
 * lista morasse junto com este import de `db`, ler a lista passaria a exigir
 * DATABASE_URL, e o teste que protege a lista deixaria de rodar na máquina da
 * rotina agendada — que é justamente onde ele precisa rodar.
 *
 * Aqui, ao contrário, o banco é o ponto: esta função é o que a rota chama e o
 * que `scripts/testar-apagar-financeiro-banco.mts` exercita contra um Postgres
 * de verdade. Uma função só, um caminho só — o teste não prova um código
 * parecido com o de produção, prova o de produção.
 */
import type { PrismaClient, Prisma } from "@prisma/client"
import { TABELAS_FINANCEIRAS, type TabelaFinanceira } from "./dados-financeiros"

/** O que um delegate precisa expor para entrar na limpeza. */
type Apagavel = {
  deleteMany: (args: { where: { userId: string } }) => Prisma.PrismaPromise<unknown>
}

/**
 * Apaga os dados financeiros do usuário e devolve o Painel ao estado de opt-in.
 *
 * TUDO NUMA TRANSAÇÃO SÓ. Meia limpeza é pior que limpeza nenhuma: a tela diz
 * "Dados financeiros apagados." e a pessoa vai embora achando que acabou. Ou
 * cai tudo, ou não cai nada e ela vê o erro.
 *
 * `consentimentoPainelEm: null` sai no mesmo lote porque é o que faz o Painel
 * voltar a pedir opt-in. Se ele sobrevivesse à limpeza, a pessoa voltaria para
 * um Painel "ativo" e vazio, sem nunca ter reconsentido.
 */
export async function apagarDadosFinanceiros(db: PrismaClient, userId: string) {
  // O cast é o preço de percorrer a lista por nome: `db[nome]` com nome vindo de
  // um array não é algo que o tipo do Prisma resolva sozinho. A suposição — todo
  // nome da lista é delegate real, com deleteMany por userId — não fica no
  // escuro: é a primeira coisa que testar-apagar-dados.mts confere, contra o
  // schema, e sem precisar de banco.
  const tabelas = db as unknown as Record<TabelaFinanceira, Apagavel>

  await db.$transaction([
    ...TABELAS_FINANCEIRAS.map((t) => tabelas[t].deleteMany({ where: { userId } })),
    db.user.update({ where: { id: userId }, data: { consentimentoPainelEm: null } }),
  ])
}
