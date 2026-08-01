import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import { listarTransacoes, listarContasFixas } from "@/lib/financeiro-repo"
import { indicadores, gastosPorCategoria, metricasPerfil, type TransacaoCalc } from "@/lib/financas"
import { responderIA, IANaoConfigurada, type ContextoFinanceiro, type MensagemChat } from "@/lib/ia"
import { memoriaLigada, listarMemorias, guardarMemorias, type TipoMemoria } from "@/lib/memoria-repo"
import { listarOrcamentos, cruzarComGasto } from "@/lib/orcamento-repo"
import { slugDaCategoria } from "@/lib/extrato/categorias"

export const dynamic = "force-dynamic"
// Resposta de chat leva 5–15s. 60 dá folga sem deixar um travamento
// consumir 5 minutos de função.
export const maxDuration = 60

const NOMES_MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]

// Monta o retrato financeiro real do usuário para a IA usar como base.
// A IA nunca recebe as transações cruas — só os agregados de que precisa.
async function montarContexto(userId: string): Promise<ContextoFinanceiro> {
  const [calc, contas, tetos] = await Promise.all([
    listarTransacoes(userId, { ordem: "desc" }),
    listarContasFixas(userId, { apenasAtivas: true }),
    listarOrcamentos(userId),
  ])

  const hoje = new Date()
  const mes = hoje.getMonth() + 1
  const ano = hoje.getFullYear()

  const ind = indicadores(calc, mes, ano)
  const cats = gastosPorCategoria(calc, mes, ano)
  const met = metricasPerfil(calc)

  return {
    temDados: calc.length > 0,
    mesReferencia: `${NOMES_MESES[mes - 1]} de ${ano}`,
    receitaMes: ind.receita,
    despesaMes: ind.despesa,
    economiaMes: ind.economia,
    acumulado: ind.acumulado,
    reservaEmergenciaMeses: met.reservaEmergencia,
    taxaEconomiaPct: met.taxaEconomia,
    maioresCategorias: cats.slice(0, 5).map((c) => ({ nome: c.nome, total: c.total, pct: c.pct })),
    contasFixasTotal: contas.reduce((s, c) => s + c.valor, 0),
    mesesComHistorico: met.mesesComDados,
    // Sem os tetos no contexto, o assistente proporia de novo o que ela já
    // decidiu — e desfaria a decisão dela sem nem saber que existia.
    orcamentos: cruzarComGasto(
      tetos,
      calc
        .filter((t) => t.tipo === "despesa" && new Date(t.data).getUTCMonth() + 1 === mes && new Date(t.data).getUTCFullYear() === ano)
        .map((t) => ({ nomeCategoria: t.categoria?.nome ?? null, valor: t.valor }))
    ).map((o) => ({ nome: o.nome, limite: o.limite, gasto: o.gasto, restante: o.restante, pct: o.pct })),
  }
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const { mensagens } = await req.json()
    if (!Array.isArray(mensagens) || mensagens.length === 0) {
      return NextResponse.json({ error: "Nenhuma mensagem enviada" }, { status: 400 })
    }

    const [contexto, ligada, usuario] = await Promise.all([
      montarContexto(userId),
      memoriaLigada(userId),
      db.user.findUnique({ where: { id: userId }, select: { consentimentoPainelEm: true } }),
    ])
    // Sem consentimento do Painel não há onde gravar. Melhor o modelo saber
    // disso e nem propor do que a tela mostrar um botão que dá 403.
    const podeLancar = !!usuario?.consentimentoPainelEm
    const conhecidas = ligada
      ? (await listarMemorias(userId)).map((m) => ({ tipo: m.tipo, conteudo: m.conteudo }))
      : []

    // As aulas vêm do banco, nunca de uma lista escrita à mão: slug inventado
    // vira card que abre um 404 — foi exatamente o que aconteceu com
    // /modulo/{slug} por meses.
    const modulos = await db.modulo.findMany({
      select: { slug: true, titulo: true },
      orderBy: [{ tipoPerfil: "asc" }, { ordem: "asc" }],
    })

    const resposta = await responderIA(
      mensagens as MensagemChat[],
      contexto,
      { ligada, conhecidas },
      { podeLancar, modulos }
    )

    // Gravar não pode derrubar a conversa: a resposta já está pronta e é o que
    // a pessoa pediu. Falha aqui vira log, não erro na tela.
    let guardadas: { id: string; tipo: string; conteudo: string }[] = []
    if (ligada && resposta.memorias?.length) {
      try {
        const novas = await guardarMemorias(
          userId,
          resposta.memorias.map((m) => ({ tipo: m.tipo as TipoMemoria, conteudo: m.conteudo }))
        )
        guardadas = novas.map((m) => ({ id: m.id, tipo: m.tipo, conteudo: m.conteudo }))
      } catch (e) {
        console.error("[chat] falha ao guardar memória:", (e as Error)?.message)
      }
    }

    // A tela mostra o que foi guardado. Memória que grava calada é memória que
    // a pessoa descobre tarde demais, quando já não concorda com o que está lá.
    // O gasto por slug vai junto para o card de confirmação mostrar
    // "hoje: R$ 620" ao lado de cada teto proposto. Só busca quando há proposta
    // — o caso comum é uma conversa sem orçamento nenhum.
    let gastoAtual: Record<string, number> = {}
    if (resposta.orcamento?.length) {
      gastoAtual = await gastoDoMesPorSlug(userId)
    }

    return NextResponse.json({
      ...resposta,
      memorias: undefined,
      memoriasGuardadas: guardadas,
      podeLancar,
      gastoAtual,
    })
  } catch (e) {
    if (e instanceof IANaoConfigurada) {
      // Estado honesto enquanto a IA não está ligada — não finge resposta.
      return NextResponse.json(
        { error: "ia_nao_configurada", mensagem: "O assistente ainda não está ligado nesta instalação." },
        { status: 503 }
      )
    }
    // Falha do provedor é TEMPORÁRIA e merece "tenta de novo" — diferente de
    // "não está ligado", que é definitivo. Misturar os dois faria a UI mostrar
    // um aviso permanente para um timeout de 3 segundos.
    console.error("[chat]", (e as Error)?.message)
    return NextResponse.json(
      { error: "falha_temporaria", mensagem: "Não consegui responder agora. Tenta de novo em alguns segundos." },
      { status: 502 }
    )
  }
}

/** Quanto saiu neste mês, por slug de categoria, mais "total". */
async function gastoDoMesPorSlug(userId: string): Promise<Record<string, number>> {
  const hoje = new Date()
  const doMes = await listarTransacoes(userId, {
    mes: hoje.getMonth() + 1,
    ano: hoje.getFullYear(),
  })
  const mapa: Record<string, number> = {}
  for (const t of doMes) {
    if (t.tipo !== "despesa") continue
    mapa.total = (mapa.total ?? 0) + t.valor
    const slug = slugDaCategoria(t.categoria?.nome)
    if (slug) mapa[slug] = (mapa[slug] ?? 0) + t.valor
  }
  return mapa
}

// GET — devolve só o contexto (útil pra depurar o que a IA recebe)
export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  return NextResponse.json({ contexto: await montarContexto(userId) })
}
