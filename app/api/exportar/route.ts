import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import { listarTransacoes, listarContasFixas } from "@/lib/financeiro-repo"

export const dynamic = "force-dynamic"

// GET /api/exportar — baixa TODOS os dados do usuário em JSON.
// Portabilidade de dados (LGPD art. 18): o usuário leva o que é dele.
// Não inclui hash de senha nem tokens de sessão.
export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const [user, categorias, contas, transacoes, progresso, indicacoesFeitas, indicacaoRecebida] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { nome: true, email: true, dataNascimento: true, criadoEm: true, consentimentoPainelEm: true, codigoIndicacao: true },
      }),
      db.categoria.findMany({
        where: { userId },
        select: { nome: true, tipo: true, cor: true, padrao: true },
        orderBy: { nome: "asc" },
      }),
      listarContasFixas(userId),
      listarTransacoes(userId),
      db.progressoModulo.findMany({
        where: { userId },
        select: { concluido: true, telaAtual: true, concluidoEm: true, modulo: { select: { slug: true, titulo: true } } },
      }),
      // Indicações: só status e datas. A identidade do outro lado (quem entrou
      // pelo meu link, ou quem me convidou) é dado DELE, não meu — não sai aqui.
      db.indicacao.findMany({
        where: { indicadorId: userId },
        select: { status: true, criadoEm: true, ativadoEm: true },
        orderBy: { criadoEm: "asc" },
      }),
      db.indicacao.findUnique({
        where: { indicadoId: userId },
        select: { status: true, criadoEm: true, ativadoEm: true },
      }),
    ])

    const dump = {
      exportadoEm: new Date().toISOString(),
      conta: user,
      categorias,
      // a exportação sai em CLARO de propósito: é o direito de portabilidade da
      // LGPD, e um arquivo cifrado com chave que o usuário não tem seria inútil
      contasFixas: contas.map((c) => ({
        nome: c.nome, valor: c.valor, diaVencimento: c.diaVencimento, ativa: c.ativa, criadoEm: c.criadoEm,
      })),
      transacoes: transacoes.map((t) => ({
        descricao: t.descricao,
        valor: t.valor,
        tipo: t.tipo,
        categoria: t.categoria?.nome ?? null,
        data: t.data,
        criadoEm: t.criadoEm,
      })),
      progressoModulos: progresso.map((p) => ({
        modulo: p.modulo.slug,
        titulo: p.modulo.titulo,
        concluido: p.concluido,
        telaAtual: p.telaAtual,
        concluidoEm: p.concluidoEm,
      })),
      indicacoes: {
        meuCodigo: user?.codigoIndicacao ?? null,
        convitesQueFiz: indicacoesFeitas,
        entreiPorIndicacao: indicacaoRecebida,
      },
    }

    const data = new Date().toISOString().split("T")[0]
    return new NextResponse(JSON.stringify(dump, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="finlow-dados-${data}.json"`,
      },
    })
  } catch (e) {
    console.error("[exportar]", e)
    return NextResponse.json({ error: "Erro ao exportar" }, { status: 500 })
  }
}
