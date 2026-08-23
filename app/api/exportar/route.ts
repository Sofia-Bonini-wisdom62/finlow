import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import { listarTransacoes, listarContasFixas } from "@/lib/financeiro-repo"
import { lerDiagnostico } from "@/lib/vazamento-repo"
import { listarInvestimentos } from "@/lib/investimento-repo"
import { listarObjetivos } from "@/lib/objetivo-repo"
import { listarOrcamentos } from "@/lib/orcamento-repo"
import { listarMemorias } from "@/lib/memoria-repo"
import { exportarConversas } from "@/lib/conversa-repo"
import { lerPersonalidade } from "@/lib/personalidade-repo"

export const dynamic = "force-dynamic"

// GET /api/exportar — baixa TODOS os dados do usuário em JSON.
// Portabilidade de dados (LGPD art. 18): o usuário leva o que é dele.
// Não inclui hash de senha nem tokens de sessão.
//
// "TODOS" passou meses sendo mentira nesta linha: conversas, memórias,
// orçamentos, respostas do onboarding, XP, insights e progresso de lição nunca
// saíram daqui. Fechado em 23/08/2026, e a lista virou dado conferível em
// `lib/dados-exportados.ts` — `scripts/testar-exportacao.mts` derruba quem
// acrescentar tabela do usuário sem decidir se ela sai no arquivo. É a regra 3
// do README ("dado novo entra em /api/exportar e sai no delete de /api/conta")
// finalmente com quem a cobre.
export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const [user, categorias, contas, transacoes, progresso, indicacoesFeitas, indicacaoRecebida, diagnostico, investimentos, objetivos, assinatura, usoIA, personalidade] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        // Sem `senha` (hash) e sem os ids da Stripe, aqui e em qualquer bloco
        // abaixo: os dois primeiros são credencial, o resto é identificador de
        // sistema nosso. O que entrou junto com a lacuna de 23/08 são as
        // colunas que a pessoa VÊ no app e não levava — apelido, nível, XP,
        // se a memória está ligada, se está no ranking, qual trilha é a dela.
        select: {
          nome: true, email: true, celular: true, dataNascimento: true, criadoEm: true,
          consentimentoPainelEm: true, codigoIndicacao: true, apelido: true, nivel: true,
          pontos: true, publico: true, memoriaAtiva: true, rankingOptIn: true, onboardingEm: true,
        },
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

    // O assistente. É o bloco mais sensível do arquivo e era o que faltava
    // inteiro: memória e conversa são onde a pessoa contou desemprego, doença e
    // separação. Os dois vêm pelo repositório porque são cifrados com AAD
    // amarrada ao dono e ao campo — `db.memoriaUsuario` direto entregaria
    // "v1.VQ3H…" num arquivo que existe justamente para ser legível.
    const [memorias, conversas, onboarding, perfilTrilha] = await Promise.all([
      listarMemorias(userId),
      exportarConversas(userId),
      db.onboarding.findUnique({
        where: { userId },
        select: {
          objetivo: true, objetivoOutro: true, eixo2: true, eixo2Valor: true, eixo2Outro: true,
          momento: true, nivelInferido: true, situacoes: true, concluidoEm: true, criadoEm: true,
        },
      }),
      db.perfil.findUnique({
        where: { userId },
        select: { tipo: true, respostas: true, criadoEm: true },
      }),
    ])

    // Aprendizado e XP. `progressoLicao` é a lacuna que o backlog nomeou quando
    // a métrica "1ª passada × após correção" entrou (14/08/2026): o professor
    // passou a ver a nota da aluna numa tela da escola, e o arquivo da própria
    // aluna não trazia nem os acertos nem o tempo dela.
    const [progressoLicoes, eventosXP, insights, recomendacoes, diasAtivos, extratos, orcamentos] =
      await Promise.all([
        db.progressoLicao.findMany({
          where: { userId },
          select: {
            licao: true, concluido: true, telaAtual: true, acertos: true, totalQuiz: true,
            acertosRevisao: true, totalQuizRevisao: true, segundos: true, concluidoEm: true,
            criadoEm: true, modulo: { select: { slug: true, titulo: true } },
          },
          orderBy: [{ criadoEm: "asc" }, { licao: "asc" }],
        }),
        db.eventoPontuacao.findMany({
          where: { userId },
          select: { motivo: true, pontos: true, refId: true, criadoEm: true },
          orderBy: { criadoEm: "asc" },
        }),
        db.insight.findMany({
          where: { userId },
          select: { texto: true, tipo: true, ativo: true, criadoEm: true },
          orderBy: { criadoEm: "asc" },
        }),
        db.recomendacaoTrilha.findMany({
          where: { userId },
          select: {
            motivo: true, origem: true, ordem: true, leva: true, entregueEm: true,
            substituidaEm: true, criadoEm: true, modulo: { select: { slug: true, titulo: true } },
          },
          orderBy: { criadoEm: "asc" },
        }),
        db.diaAtivo.findMany({
          where: { userId },
          select: { dia: true },
          orderBy: { dia: "asc" },
        }),
        // Sem `tokensEntrada`/`tokensSaida`/`modelo`: qual modelo leu e quanto
        // custou é medidor nosso, e o consumo de IA dela já sai inteiro em
        // `usoDeIA`. O que é dela aqui é a vida financeira descrita — "Nubank,
        // março a junho, 412 linhas".
        db.extratoImport.findMany({
          where: { userId },
          select: {
            status: true, banco: true, periodoInicio: true, periodoFim: true,
            totalLinhas: true, erroValidacao: true, criadoEm: true,
          },
          orderBy: { criadoEm: "asc" },
        }),
        listarOrcamentos(userId),
      ])

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
      orcamentos: orcamentos.map((o) => ({
        categoria: o.categoria?.nome ?? null, // null = teto do mês inteiro
        limite: o.limite,
      })),
      // O assistente, em três blocos. A memória sai mesmo com o opt-in
      // desligado hoje: o que está guardado está guardado, e `memoriaAtiva`
      // (em `conta`) diz se ele ainda pode ler.
      memoriaDoAssistente: memorias.map((m) => ({
        tipo: m.tipo,
        conteudo: m.conteudo,
        origem: m.origem,
        criadoEm: m.criadoEm,
      })),
      conversas,
      primeiraConversa: onboarding,
      perfilDaTrilha: perfilTrilha,
      progressoModulos: progresso.map((p) => ({
        modulo: p.modulo.slug,
        titulo: p.modulo.titulo,
        concluido: p.concluido,
        telaAtual: p.telaAtual,
        concluidoEm: p.concluidoEm,
      })),
      progressoLicoes: progressoLicoes.map((p) => ({
        modulo: p.modulo.slug,
        titulo: p.modulo.titulo,
        licao: p.licao,
        concluido: p.concluido,
        telaAtual: p.telaAtual,
        // Os dois pares separados, como no banco: o primeiro é a nota que valeu
        // XP e virou pedra; o segundo, null quando nunca refez.
        acertos: p.acertos,
        totalQuiz: p.totalQuiz,
        acertosRevisao: p.acertosRevisao,
        totalQuizRevisao: p.totalQuizRevisao,
        segundos: p.segundos,
        concluidoEm: p.concluidoEm,
      })),
      recomendacoesDaTrilha: recomendacoes.map((r) => ({
        modulo: r.modulo.slug,
        titulo: r.modulo.titulo,
        motivo: r.motivo,
        origem: r.origem,
        ordem: r.ordem,
        leva: r.leva,
        entregueEm: r.entregueEm,
        substituidaEm: r.substituidaEm,
        criadoEm: r.criadoEm,
      })),
      extratoDeXP: eventosXP,
      insights,
      diasAtivos: diasAtivos.map((d) => d.dia),
      extratosImportados: extratos,
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
