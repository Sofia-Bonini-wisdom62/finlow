import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import { listarTransacoes } from "@/lib/financeiro-repo"
import { responderIA, IANaoConfigurada, type MensagemChat } from "@/lib/ia"
import { memoriaLigada, listarMemorias, guardarMemorias, type TipoMemoria } from "@/lib/memoria-repo"
import { guardarTurno } from "@/lib/conversa-repo"
import { montarContexto } from "@/lib/contexto-financeiro"
import { slugDaCategoria } from "@/lib/extrato/categorias"

export const dynamic = "force-dynamic"
// Resposta de chat leva 5–15s. 60 dá folga sem deixar um travamento
// consumir 5 minutos de função.
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const { mensagens, conversaId } = await req.json()
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

    /**
     * Guarda o turno. Falha aqui NÃO derruba a conversa: a resposta já está
     * pronta e é o que a pessoa pediu. Perder uma linha de histórico é bem
     * menos grave do que engolir a resposta por causa dela.
     */
    let idConversa: string | null = conversaId ?? null
    try {
      const ultima = (mensagens as MensagemChat[]).filter((m) => m.papel === "usuario").pop()
      if (ultima?.texto) {
        idConversa = await guardarTurno(userId, idConversa, ultima.texto, {
          texto: resposta.texto,
          cards: resposta.cards,
        })
      }
    } catch (e) {
      console.error("[chat] falha ao guardar a conversa:", (e as Error)?.message)
    }

    return NextResponse.json({
      ...resposta,
      memorias: undefined,
      memoriasGuardadas: guardadas,
      podeLancar,
      gastoAtual,
      conversaId: idConversa,
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
