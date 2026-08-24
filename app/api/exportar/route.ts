import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import { listarTransacoes, listarContasFixas } from "@/lib/financeiro-repo"
import { lerDiagnostico } from "@/lib/vazamento-repo"
import { listarInvestimentos } from "@/lib/investimento-repo"
import { listarObjetivos } from "@/lib/objetivo-repo"
import { listarOrcamentos } from "@/lib/orcamento-repo"
import { exportarMemorias } from "@/lib/memoria-repo"
import { exportarConversas } from "@/lib/conversa-repo"
import { lerPersonalidade } from "@/lib/personalidade-repo"

export const dynamic = "force-dynamic"

// GET /api/exportar — baixa TODOS os dados do usuário em JSON.
// Portabilidade de dados (LGPD art. 18): o usuário leva o que é dele.
//
// "TODOS" passou a ser verdade em 24/08/2026. Antes disso a frase acima era
// promessa vencida: ficavam de fora memórias, conversas, orçamentos, respostas
// do onboarding, eventos de pontuação, insights e progresso das lições — o mais
// sensível do banco. Quem decide o que sai é `lib/dados-exportacao.ts`, e
// `scripts/testar-exportacao.mts` confere a lista contra o schema: tabela nova
// do usuário sem classificação derruba o teste.
//
// O que NÃO sai, e por quê, está escrito lá: credencial (senha, token de sessão,
// token de OAuth), identificador de sistema nosso (ids da Stripe) e dado de
// terceiro (quem entrou pelo link dela, quem estuda na mesma turma).
export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const [user, categorias, contas, transacoes, progresso, indicacoesFeitas, indicacaoRecebida, diagnostico, investimentos, objetivos, assinatura, usoIA, personalidade] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          nome: true, email: true, celular: true, dataNascimento: true, criadoEm: true,
          consentimentoPainelEm: true, consentimentoLGPD: true, codigoIndicacao: true,
          // O retrato que o app faz dela: como aparece no ranking, se optou por
          // aparecer, se ligou a memória, quando terminou a primeira conversa,
          // que nível e que público a trilha assumiu. São inferências NOSSAS
          // sobre ela — o tipo de dado que a portabilidade existe para mostrar,
          // porque é o que o produto usa para decidir o que ela vê.
          apelido: true, rankingOptIn: true, memoriaAtiva: true, onboardingEm: true,
          nivel: true, publico: true, pontos: true, moduloAvancado: true,
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

    // O assistente. É a metade que faltava, e é a mais sensível do banco: a
    // conversa junta número, contexto de vida e o que a pessoa contou sobre a
    // família dela. Tudo cifrado, e por isso tudo sai pelos repositórios —
    // `db.conversaMensagem` direto devolveria "v1.…" num arquivo que a pessoa
    // abriria sem entender por que o próprio texto virou lixo.
    const [memorias, conversas, onboarding] = await Promise.all([
      exportarMemorias(userId),
      exportarConversas(userId),
      db.onboarding.findUnique({
        where: { userId },
        select: {
          objetivo: true, objetivoOutro: true, eixo2: true, eixo2Valor: true,
          eixo2Outro: true, momento: true, nivelInferido: true, situacoes: true,
          concluidoEm: true, criadoEm: true,
        },
      }),
    ])

    // Dinheiro que ainda não saía: os tetos (cifrados, pelo repo) e de que
    // banco e período veio cada extrato importado.
    const [orcamentos, importacoes, insights] = await Promise.all([
      listarOrcamentos(userId),
      db.extratoImport.findMany({
        where: { userId },
        select: {
          status: true, banco: true, periodoInicio: true, periodoFim: true,
          totalLinhas: true, erroValidacao: true, criadoEm: true,
        },
        orderBy: { criadoEm: "asc" },
      }),
      // As três linhas que a IA escreveu lendo o dash dela. `ativo: false` sai
      // junto: leitura antiga continua sendo leitura feita sobre ela.
      db.insight.findMany({
        where: { userId },
        select: { texto: true, tipo: true, ativo: true, criadoEm: true },
        orderBy: { criadoEm: "asc" },
      }),
    ])

    // Aprendizado: o quiz que escolheu a trilha, o progresso lição a lição
    // (inclusive "1ª passada × após correção") e as aulas que a IA recomendou,
    // com o porquê que ela escreveu.
    const [perfilTrilha, progressoLicoes, recomendacoes] = await Promise.all([
      db.perfil.findUnique({
        where: { userId },
        select: { tipo: true, respostas: true, criadoEm: true },
      }),
      db.progressoLicao.findMany({
        where: { userId },
        select: {
          licao: true, concluido: true, telaAtual: true, acertos: true, totalQuiz: true,
          acertosRevisao: true, totalQuizRevisao: true, segundos: true, concluidoEm: true,
          criadoEm: true, modulo: { select: { slug: true, titulo: true } },
        },
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
    ])

    // O jogo (Redesign Fin): carteira, itens e os dois extratos — coins e XP —
    // mais os dias que sustentam a ofensiva. O saldo é cache; o extrato é a
    // verdade, e é o extrato que permite conferir o saldo.
    const [jogoUser, extratoCoins, extratoXP, diasAtivos] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { coins: true, energia: true, pocaoAtiva: true, avatarFin: true, comboRecorde: true },
      }),
      db.eventoCoins.findMany({
        where: { userId },
        select: { motivo: true, moedas: true, refId: true, criadoEm: true },
        orderBy: { criadoEm: "asc" },
      }),
      db.eventoPontuacao.findMany({
        where: { userId },
        select: { motivo: true, pontos: true, refId: true, criadoEm: true },
        orderBy: { criadoEm: "asc" },
      }),
      db.diaAtivo.findMany({
        where: { userId },
        select: { dia: true },
        orderBy: { dia: "asc" },
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

    // Como ela entra no app. SÓ o nome do provedor: `access_token`,
    // `refresh_token` e `id_token` moram na mesma tabela e são a chave da conta
    // Google dela — num arquivo feito para ser guardado e compartilhado, seriam
    // a pior linha do arquivo. A senha, pelo mesmo motivo, nunca sai.
    const logins = await db.account.findMany({
      where: { userId },
      select: { provider: true },
    })

    const dump = {
      exportadoEm: new Date().toISOString(),
      conta: user,
      personalidadeAssistente: {
        tom: personalidade.id,
        comoQuerSerAtendida: personalidade.detalhe || null,
      },
      provedoresDeLogin: logins.map((l) => l.provider),
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
      orcamentos: orcamentos.map((o) => ({
        // teto de categoria ou do mês inteiro — o `null` é a informação, não
        // um dado faltando, e por isso vem dito por extenso.
        categoria: o.categoria?.nome ?? null,
        doMesInteiro: o.categoriaId === null,
        limite: o.limite,
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
      importacoesDeExtrato: importacoes,
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
        // a nota que valeu XP (1ª passada) e a de quando refez, separadas como
        // ficam no banco: juntá-las aqui apagaria a diferença que o professor vê
        acertos: p.acertos,
        totalQuiz: p.totalQuiz,
        acertosRevisao: p.acertosRevisao,
        totalQuizRevisao: p.totalQuizRevisao,
        segundos: p.segundos,
        concluidoEm: p.concluidoEm,
        criadoEm: p.criadoEm,
      })),
      perfilDaTrilha: perfilTrilha,
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
      memorias: memorias.map((m) => ({
        tipo: m.tipo,
        conteudo: m.conteudo,
        origem: m.origem,
        criadoEm: m.criadoEm,
      })),
      conversas,
      primeiraConversa: onboarding,
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
      insights,
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
        extratoDeXP: extratoXP,
        // a ofensiva é DERIVADA destas datas; entregar o número calculado sem
        // elas daria um dado que ela não teria como conferir
        diasAtivos: diasAtivos.map((d) => d.dia),
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
