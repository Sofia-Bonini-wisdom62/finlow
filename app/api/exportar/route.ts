import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import { listarTransacoes, listarContasFixas } from "@/lib/financeiro-repo"
import { lerDiagnostico } from "@/lib/vazamento-repo"
import { listarInvestimentos } from "@/lib/investimento-repo"
import { listarObjetivos } from "@/lib/objetivo-repo"
import { lerPersonalidade } from "@/lib/personalidade-repo"

export const dynamic = "force-dynamic"

// GET /api/exportar — baixa TODOS os dados do usuário em JSON.
// Portabilidade de dados (LGPD art. 18): o usuário leva o que é dele.
// Não inclui hash de senha nem tokens de sessão.
export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const [user, categorias, contas, transacoes, progresso, indicacoesFeitas, indicacaoRecebida, diagnostico, investimentos, objetivos, assinatura, usoIA, personalidade] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { nome: true, email: true, celular: true, dataNascimento: true, criadoEm: true, consentimentoPainelEm: true, codigoIndicacao: true },
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
      lerDiagnostico(userId),
      listarInvestimentos(userId),
      listarObjetivos(userId),
      // Assinatura: o que ela pagou, quando, e até quando vale. SEM os ids da
      // Stripe (`cus_`, `sub_`, `cs_`) — são identificadores de sistema nosso,
      // não dado dela, e num arquivo que ela pode compartilhar sem pensar viram
      // material para alguém falar com a Stripe fingindo ser ela.
      db.assinatura.findUnique({
        where: { userId },
        select: {
          status: true, provedor: true, metodo: true, valorCentavos: true,
          proximaCobranca: true, expiraEm: true, canceladoEm: true, criadoEm: true,
        },
      }),
      db.usoMensalIA.findMany({
        where: { userId },
        select: { mes: true, tokensEntrada: true, tokensSaida: true, chamadas: true },
        orderBy: { mes: "asc" },
      }),
      // O tom escolhido e, principalmente, o texto livre: ele é escrito pela
      // pessoa sobre ela mesma e fica cifrado no banco, então é exatamente o
      // tipo de dado que a portabilidade existe para devolver.
      lerPersonalidade(userId),
    ])

    // Personalização: foto e capa saem como data URI — imagem é dado pessoal,
    // e portabilidade de imagem é a própria imagem, não um "tem foto: sim".
    const imagens = await db.imagemUsuario.findMany({
      where: { userId },
      select: { tipo: true, dados: true, atualizadoEm: true },
    })

    // O jogo (Redesign Fin): carteira, itens e o extrato de coins — tudo dela.
    const [jogoUser, extratoCoins] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { coins: true, energia: true, pocaoAtiva: true, avatarFin: true, comboRecorde: true },
      }),
      db.eventoCoins.findMany({
        where: { userId },
        select: { motivo: true, moedas: true, refId: true, criadoEm: true },
        orderBy: { criadoEm: "asc" },
      }),
    ])

    // Vínculo escolar: escola, papel, turmas e competências — o que É da
    // pessoa. Colegas de turma ficam de fora pela mesma regra das indicações:
    // quem estuda comigo é dado dos outros.
    const [membroEscola, minhasTurmas, minhasCompetencias] = await Promise.all([
      db.membroEscola.findUnique({
        where: { userId },
        select: { papel: true, criadoEm: true, escola: { select: { nome: true } } },
      }),
      db.membroTurma.findMany({
        where: { userId },
        select: { criadoEm: true, turma: { select: { nome: true, segmento: true, serie: true } } },
        orderBy: { criadoEm: "asc" },
      }),
      db.competenciaProfessor.findMany({
        where: { userId },
        select: { segmento: true, criadoEm: true },
        orderBy: { criadoEm: "asc" },
      }),
    ])

    const dump = {
      exportadoEm: new Date().toISOString(),
      conta: user,
      personalidadeAssistente: {
        tom: personalidade.id,
        comoQuerSerAtendida: personalidade.detalhe || null,
      },
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
        escopo: t.escopo,
        data: t.data,
        criadoEm: t.criadoEm,
      })),
      investimentos: investimentos.map((i) => ({
        tipo: i.tipo,
        nome: i.nome,
        instituicao: i.instituicao,
        valorAtual: i.valorAtual,
        criadoEm: i.criadoEm,
        atualizadoEm: i.atualizadoEm,
      })),
      objetivos: objetivos.map((o) => ({
        nome: o.nome,
        meta: o.meta,
        guardado: o.guardado,
        criadoEm: o.criadoEm,
        atualizadoEm: o.atualizadoEm,
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
      diagnosticoVazamento: diagnostico
        ? {
            totalAnual: diagnostico.totalAnual,
            totalMensal: diagnostico.totalMensal,
            mesesAnalisados: diagnostico.mesesAnalisados,
            achados: diagnostico.achados,
            narrativa: diagnostico.narrativa,
            geradoEm: diagnostico.geradoEm,
          }
        : null,
      assinatura,
      usoDeIA: usoIA,
      imagens: imagens.map((i) => ({ tipo: i.tipo, dados: i.dados, atualizadoEm: i.atualizadoEm })),
      jogo: {
        coins: jogoUser?.coins ?? 0,
        energia: jogoUser?.energia ?? null,
        pocaoAtiva: jogoUser?.pocaoAtiva ?? false,
        avatarEquipado: jogoUser?.avatarFin ?? null,
        comboRecorde: jogoUser?.comboRecorde ?? 0,
        extratoDeCoins: extratoCoins,
      },
      escola: membroEscola
        ? {
            nome: membroEscola.escola.nome,
            papel: membroEscola.papel,
            desde: membroEscola.criadoEm,
            turmas: minhasTurmas.map((t) => ({
              nome: t.turma.nome,
              segmento: t.turma.segmento,
              serie: t.turma.serie,
              desde: t.criadoEm,
            })),
            competencias: minhasCompetencias,
          }
        : null,
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
