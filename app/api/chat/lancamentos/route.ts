import { NextRequest, NextResponse } from "next/server"
import { getUserIdOr401, checarConsentimento } from "@/lib/painel"
import { criarTransacao } from "@/lib/financeiro-repo"
import { creditar } from "@/lib/pontos"
import { mapearCategorias } from "@/lib/extrato/categorias"
import { lancamentosValidos } from "@/lib/ia"

export const dynamic = "force-dynamic"

/**
 * Grava os lançamentos que a pessoa confirmou no chat.
 *
 * O MODELO NÃO CHEGA AQUI. Esta rota é chamada pelo toque em "Confirmar", com
 * o que a tela mostrou. Por isso ela revalida tudo com `lancamentosValidos()`
 * em vez de confiar no corpo do request: o que veio da tela passou pelo
 * navegador, e um navegador é do usuário, não nosso.
 *
 * Nasce `confirmado: true` — ao contrário do extrato, que entra pendente. A
 * diferença é que aqui a revisão já aconteceu: a pessoa leu valor e data antes
 * de tocar. Fazer ela revisar de novo no Painel seria pedir a mesma coisa duas
 * vezes.
 */
export async function POST(req: NextRequest) {
  let userId: string
  try {
    const r = await getUserIdOr401()
    if (r instanceof NextResponse) return r
    userId = r
    const bloqueio = await checarConsentimento(userId)
    if (bloqueio) return bloqueio
  } catch (e) {
    console.error("[chat/lancamentos] falha antes de começar:", (e as Error)?.message)
    return NextResponse.json(
      { codigo: "INDISPONIVEL", erro: "Não consegui registrar agora. Tenta de novo." },
      { status: 503 }
    )
  }

  try {
    const corpo = await req.json()
    const itens = lancamentosValidos(corpo?.lancamentos)
    // O toque em "gasto do trabalho" vale para o lote inteiro: quem lança pelo
    // chat descreve UMA situação por vez. Linha fora do padrão se corrige no
    // Painel. Qualquer outro valor cai no "pessoal" do banco.
    const escopo = corpo?.escopo === "trabalho" ? "trabalho" : undefined

    if (itens.length === 0) {
      return NextResponse.json(
        { codigo: "NADA_VALIDO", erro: "Não recebi nenhum lançamento válido para registrar." },
        { status: 400 }
      )
    }

    const mapa = await mapearCategorias(userId, itens.map((i) => i.categoria))

    const criadas = await Promise.all(
      itens.map((i) =>
        criarTransacao(userId, {
          descricao: i.descricao,
          valor: i.valor,
          tipo: i.tipo,
          categoriaId: mapa.get(i.categoria) ?? null,
          // meio-dia para o fuso não empurrar o lançamento para o dia anterior
          data: new Date(`${i.data}T12:00:00`),
          escopo,
        })
      )
    )

    // Pontua só AQUI, depois do toque dela. A proposta da IA no chat não vale
    // ponto nenhum: se valesse, bastaria pedir lançamento e nunca confirmar.
    // O refId é o id da transação, então reenviar o mesmo lote não credita duas
    // vezes. Falha na pontuação não derruba o registro, que é o que ela pediu.
    for (const c of criadas) {
      await creditar(userId, "lancamento_confirmado", c.id).catch((e) =>
        console.warn("[chat/lancamentos] ponto:", (e as Error)?.message)
      )
    }

    console.log(`[chat/lancamentos] ${criadas.length} registrados`)
    return NextResponse.json({
      registrados: criadas.length,
      total: criadas.reduce((s, c) => s + (c.tipo === "receita" ? c.valor : -c.valor), 0),
    })
  } catch (e) {
    console.error("[chat/lancamentos]", (e as Error)?.message)
    return NextResponse.json(
      { codigo: "FALHOU", erro: "Não consegui registrar agora. Tenta de novo." },
      { status: 500 }
    )
  }
}
