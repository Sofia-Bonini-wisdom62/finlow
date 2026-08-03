import { NextRequest, NextResponse } from "next/server"
import { getUserIdOr401 } from "@/lib/painel"
import { db } from "@/lib/db"
import { montarContexto } from "@/lib/contexto-financeiro"
import {
  levaAtual,
  progressoDaTrilha,
  talvezGerarNovaLeva,
  marcarEntregues,
  type Recomendada,
} from "@/lib/recomendacao"
import { escolherProximaLeva } from "@/lib/recomendacao-ia"
import { listarTransacoes } from "@/lib/financeiro-repo"
import { diagnosticar } from "@/lib/vazamento"
import { narrativaPadrao } from "@/lib/vazamento-ia"
import { salvarDiagnostico, marcarEntregue } from "@/lib/vazamento-repo"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * O que o chat tem para contar quando abre.
 *
 * Hoje é uma coisa só: a leva de aulas que o gatilho de percentual (§2.7 passo
 * 5) liberou. Fica numa rota separada do POST do chat de propósito — isto roda
 * quando a pessoa CHEGA, sem ela ter perguntado nada, e misturar com o turno
 * normal faria toda mensagem carregar uma checagem que quase sempre não dá em
 * nada.
 *
 * A checagem é barata quando não é hora: duas consultas e uma divisão. Só
 * chama a IA no momento em que a leva realmente vai nascer, que acontece
 * poucas vezes na vida de uma conta.
 */
export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    // Primeiro o que já estava pendente: se a geração anterior nasceu e a
    // entrega falhou (rede caiu, aba fechou), a leva não pode ficar presa.
    let pendentes = (await levaAtual(userId)).filter((r) => !r.entregueEm)

    if (pendentes.length === 0) {
      const contexto = await montarContexto(userId)
      pendentes = await talvezGerarNovaLeva(userId, (candidatos, jaFeitas) =>
        escolherProximaLeva(contexto, candidatos, jaFeitas)
      )
    }

    const vazamento = await novidadeDeVazamento(userId)

    if (pendentes.length === 0) return NextResponse.json({ recomendacoes: [], vazamento })

    // NÃO marca entregue aqui. Marcar no mesmo pedido em que gera é apostar que
    // a tela vai renderizar: se a aba fechar, a rede cair ou a conversa já
    // estiver em andamento, a leva fica marcada como entregue e ninguém nunca a
    // vê. Aconteceu — 8 recomendações entregues numa conta com ZERO conversas.
    // Quem confirma é o cliente, depois de desenhar, pelo POST abaixo.
    // Mesma medida do gatilho: aula feita fora da recomendação também conta,
    // senão a mensagem diz um número e o gatilho usa outro.
    const { concluidos, total } = await progressoDaTrilha(userId)
    // Primeira leva = a do onboarding. Ela precisa de outra frase: dizer
    // "você já fechou 0 de 0 aulas" para quem acabou de chegar é absurdo.
    const primeira = total === pendentes.length

    return NextResponse.json({
      texto: primeira
        ? textoDaPrimeira(pendentes.length)
        : textoDaLeva(concluidos, total - pendentes.length),
      // Os ids voltam para o cliente confirmar o que realmente apareceu.
      ids: pendentes.map((p) => p.id),
      recomendacoes: pendentes.map((p) => ({
        slug: p.slug,
        titulo: p.titulo,
        motivo: p.motivo,
      })),
      vazamento,
    })
  } catch (e) {
    // Novidade é bônus. Se falhar, o chat abre igual — quebrar a home do app
    // por causa de uma recomendação seria trocar o essencial pelo acessório.
    console.error("[chat/novidades]", (e as Error)?.message)
    return NextResponse.json({ recomendacoes: [] })
  }
}

/**
 * A entrega ÚNICA do Diagnóstico de Vazamento.
 *
 * Só nasce depois do primeiro extrato confirmado com pelo menos um mês de
 * movimento — o diagnóstico bom vem de extrato, não de meia dúzia de
 * lançamentos manuais. E só se ACHOU alguma coisa: gastar a única entrega
 * com "não achei nada" desperdiça o momento em que o app prova que olhou.
 *
 * Mesmo contrato da leva: o GET não marca entregue; o cliente confirma no
 * POST depois de desenhar. Enquanto não confirmar, volta na próxima abertura.
 */
async function novidadeDeVazamento(userId: string): Promise<{ texto: string } | null> {
  const existente = await db.diagnosticoVazamento.findUnique({
    where: { userId },
    select: { entregueEm: true },
  })
  if (existente?.entregueEm) return null

  const importados = await db.extratoImport.count({ where: { userId, status: "confirmado" } })
  if (importados === 0) return null

  const transacoes = await listarTransacoes(userId)
  if (transacoes.length < 10) return null

  const resultado = diagnosticar(
    transacoes.map((t) => ({
      id: t.id,
      descricao: t.descricao,
      valor: t.valor,
      tipo: t.tipo,
      data: t.data,
      categoria: t.categoria?.nome ?? null,
    }))
  )
  if (resultado.mesesAnalisados < 1 || resultado.achados.length === 0) return null

  // Persiste com a narrativa determinística — aqui não se chama IA: isto roda
  // a cada abertura do chat até a entrega, e a página regenera com IA depois.
  await salvarDiagnostico(userId, resultado, narrativaPadrao(resultado))

  const anual = resultado.totalAnual.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  })
  return {
    texto:
      `Passei um pente-fino no seu extrato e montei o seu Diagnóstico de Vazamento: ` +
      `são ${anual} por ano escapando em assinatura, tarifa e cobrança que quase ninguém repara. ` +
      `O detalhe, item por item, tá aqui:`,
  }
}

function textoDaPrimeira(quantas: number): string {
  return (
    `Montei a sua trilha: ${quantas} ${quantas === 1 ? "aula" : "aulas"} de dois minutos, ` +
    `na ordem que faz sentido pro que você me contou. Dá pra começar por qualquer uma.`
  )
}

function textoDaLeva(concluidos: number, totalAnterior: number): string {
  return (
    `Você já fechou ${concluidos} de ${totalAnterior} aulas da sua trilha. ` +
    `Separei mais algumas olhando os seus números de agora, não os de quando a gente começou.`
  )
}

export type { Recomendada }

/**
 * POST — o cliente confirma que a leva apareceu na tela.
 *
 * Separado do GET de propósito. O risco que sobra é o inverso do anterior e é
 * muito menor: se a confirmação falhar depois de a mensagem aparecer, a leva
 * volta na próxima abertura. Ver a mesma recomendação duas vezes incomoda;
 * nunca receber a recomendação que o app prometeu é perder a feature inteira.
 */
export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const corpo = await req.json().catch(() => ({}))
    const ids = Array.isArray(corpo?.ids) ? corpo.ids.filter((i: unknown) => typeof i === "string") : []

    // `marcarEntregues` filtra por userId: id de outra pessoa não marca nada.
    if (ids.length > 0) await marcarEntregues(userId, ids)
    // A confirmação do diagnóstico é um booleano: só existe UM por usuário.
    if (corpo?.vazamento === true) await marcarEntregue(userId)

    return NextResponse.json({ confirmadas: ids.length })
  } catch (e) {
    console.error("[chat/novidades] POST", (e as Error)?.message)
    return NextResponse.json({ confirmadas: 0 }, { status: 503 })
  }
}
