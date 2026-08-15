import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import {
  metricasPerfil, nivelFinanceiro, resumoUsuario, gastosPorCategoria,
  indicadores, mesDeReferencia,
  type TransacaoCalc,
} from "@/lib/financas"
import { listarTransacoes } from "@/lib/financeiro-repo"
import { lerOfensiva } from "@/lib/ofensiva"
import { listarObjetivos } from "@/lib/objetivo-repo"

const NOMES_MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]

// O mês de que o Perfil fala — o último COM movimento — mora em
// `lib/financas.ts` (`mesDeReferencia`). A rosca, as entradas e as saídas
// desta rota são três leituras da MESMA competência, e uma função privada aqui
// já tinha começado a divergir da leitura de data do resto da biblioteca.

export const dynamic = "force-dynamic"

export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const [user, transacoes] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { nome: true, email: true, image: true, pontos: true, rankingOptIn: true },
      }),
      // COM categoria: a rosca agrupa por ela. Sem, tudo cai em "Outros" e o
      // gráfico vira um círculo cinza de 100% que não informa nada.
      listarTransacoes(userId),
    ])

    // As três linhas que o pipeline escreveu (§2.10). Ficam no banco, não são
    // regeradas a cada abertura: custo de IA por pull-to-refresh não se
    // justifica, e a leitura de ontem não fica errada hoje.
    const insights = await db.insight.findMany({
      where: { userId, ativo: true },
      orderBy: { criadoEm: "desc" },
      take: 3,
      select: { texto: true, tipo: true },
    })

    const calc: TransacaoCalc[] = transacoes

    const metricas = metricasPerfil(calc)
    const { mes, ano } = mesDeReferencia(calc)
    // O bloco de dinheiro do topo (backlog "Tela de perfil a reconfigurar"):
    // saldo acumulado + o que entrou e o que saiu NO MESMO mês da rosca.
    // `indicadores` já é a fonte do topo das Análises — dois cálculos de saldo
    // no app seriam duas respostas para a mesma pergunta.
    const ind = indicadores(calc, mes, ano)

    // O cabeçalho de jogo do protótipo v2 (chama, precisão, objetivos) e as
    // imagens da personalização. Tudo acessório: qualquer falha vira
    // ausência, nunca derruba o retrato.
    const [ofensiva, licoes7d, objetivos, imagens] = await Promise.all([
      lerOfensiva(userId).catch(() => null),
      db.progressoLicao
        .findMany({
          where: {
            userId,
            concluidoEm: { gte: new Date(Date.now() - 7 * 86_400_000) },
            totalQuiz: { gt: 0 },
          },
          select: { acertos: true, totalQuiz: true },
        })
        .catch(() => []),
      listarObjetivos(userId).catch(() => []),
      db.imagemUsuario
        .findMany({ where: { userId }, select: { tipo: true } })
        .catch(() => [] as { tipo: string }[]),
    ])
    const somaAcertos = licoes7d.reduce((s, l) => s + l.acertos, 0)
    const somaQuiz = licoes7d.reduce((s, l) => s + l.totalQuiz, 0)
    const emAberto = objetivos.find((o) => o.guardado < o.meta) ?? objetivos[0] ?? null

    return NextResponse.json({
      nome: user?.nome ?? "Você",
      email: user?.email ?? null,
      image: user?.image ?? null,
      nivel: nivelFinanceiro(metricas),
      resumo: resumoUsuario(metricas),
      // `metricas` continua saindo daqui mesmo com os KPIs tendo mudado de
      // tela: o Perfil ainda usa `mesesComDados` para saber se tem o que
      // mostrar, e o nível e o resumo saem dela.
      metricas,
      categorias: gastosPorCategoria(calc, mes, ano),
      mesRosca: `${NOMES_MESES[mes - 1]} de ${ano}`,
      // Nome curto do mês para a linha de entradas/saídas: "em julho" cabe onde
      // "em julho de 2026" quebraria, e o ano já está dito acima na rosca.
      mesCurto: NOMES_MESES[mes - 1],
      dinheiro: {
        saldo: ind.acumulado,
        entradas: ind.receita,
        saidas: ind.despesa,
        guardado: ind.investimentos,
        lancamentos: ind.lancamentosNoMes,
      },
      insights,
      pontos: user?.pontos ?? 0,
      noRanking: !!user?.rankingOptIn,
      sequencia: ofensiva?.atual ?? 0,
      precisaoSemana: somaQuiz > 0 ? Math.round((somaAcertos / somaQuiz) * 100) : null,
      temFoto: imagens.some((i) => i.tipo === "foto"),
      temBanner: imagens.some((i) => i.tipo === "banner"),
      objetivos:
        objetivos.length > 0
          ? {
              quantos: objetivos.length,
              totalGuardado: objetivos.reduce((s, o) => s + o.guardado, 0),
              destaque: emAberto
                ? { nome: emAberto.nome, guardado: emAberto.guardado, meta: emAberto.meta }
                : null,
            }
          : null,
    })
  } catch (e) {
    console.error("[perfil-financeiro]", e)
    return NextResponse.json({ error: "Erro ao carregar perfil" }, { status: 500 })
  }
}
