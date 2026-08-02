import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import {
  metricasPerfil, nivelFinanceiro, resumoUsuario, gastosPorCategoria,
  type TransacaoCalc,
} from "@/lib/financas"
import { listarTransacoes } from "@/lib/financeiro-repo"

const NOMES_MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]

/**
 * O mês que a rosca do Perfil mostra.
 *
 * O último COM movimento, não o corrente. No dia 1º o mês corrente está vazio
 * por definição, e a rosca apareceria oca para quem tem meses de histórico —
 * o mesmo defeito que as leituras tinham. O Perfil é retrato, não extrato do
 * mês: mostrar o último mês real é o que responde "para onde vai meu dinheiro".
 */
function mesDaRosca(calc: TransacaoCalc[]): { mes: number; ano: number } {
  const hoje = new Date()
  let maior = 0
  for (const t of calc) {
    const d = t.data instanceof Date ? t.data : new Date(t.data)
    const ordinal = d.getUTCFullYear() * 12 + d.getUTCMonth() + 1
    if (ordinal > maior) maior = ordinal
  }
  if (maior === 0) return { mes: hoje.getMonth() + 1, ano: hoje.getFullYear() }
  const mes = ((maior - 1) % 12) + 1
  return { mes, ano: Math.floor((maior - mes) / 12) }
}

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
    const { mes, ano } = mesDaRosca(calc)

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
      insights,
      pontos: user?.pontos ?? 0,
      noRanking: !!user?.rankingOptIn,
    })
  } catch (e) {
    console.error("[perfil-financeiro]", e)
    return NextResponse.json({ error: "Erro ao carregar perfil" }, { status: 500 })
  }
}
