import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import { listarTransacoes } from "@/lib/financeiro-repo"
import { responderIA, IANaoConfigurada, type MensagemChat, type RespostaIA } from "@/lib/ia"
import { memoriaLigada, listarMemorias, guardarMemorias, type TipoMemoria } from "@/lib/memoria-repo"
import { guardarTurno } from "@/lib/conversa-repo"
import { guardarRecomendacaoDoChat } from "@/lib/recomendacao"
import { montarContexto } from "@/lib/contexto-financeiro"
import { lerPersonalidade } from "@/lib/personalidade-repo"
import { progressoDaTrilha, linhaDoProgresso } from "@/lib/consultas-trilha"
import { rotearConsulta } from "@/lib/roteador-ia"
import { slugDaCategoria } from "@/lib/extrato/categorias"
import { filtroDeModulo, publicoDoUsuario } from "@/lib/publico"
import { cotaDoMes } from "@/lib/pagamento/tokens"
import { vertexConfigurada } from "@/lib/vertex"

export const dynamic = "force-dynamic"
// Resposta de chat leva 5–15s. 60 dá folga sem deixar um travamento
// consumir 5 minutos de função.
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const { mensagens, conversaId, stream } = await req.json()
    if (!Array.isArray(mensagens) || mensagens.length === 0) {
      return NextResponse.json({ error: "Nenhuma mensagem enviada" }, { status: 400 })
    }

    // A última fala da pessoa decide o roteamento de consulta. Vem antes do
    // Promise.all porque duas das pernas dependem dela.
    const ultimaDaPessoa =
      (mensagens as MensagemChat[]).filter((m) => m.papel === "usuario").pop()?.texto ?? ""

    const [contexto, ligada, usuario, personalidade, progresso, consulta] = await Promise.all([
      montarContexto(userId),
      memoriaLigada(userId),
      db.user.findUnique({ where: { id: userId }, select: { consentimentoPainelEm: true } }),
      lerPersonalidade(userId),
      // O assistente sempre sabe onde a pessoa está na trilha; falha vira
      // ausência, nunca derruba a conversa.
      progressoDaTrilha(userId).catch(() => null),
      rotearConsulta(userId, ultimaDaPessoa).catch(() => null),
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
      where: filtroDeModulo(await publicoDoUsuario(userId)),
      select: { slug: true, titulo: true },
      orderBy: [{ tipoPerfil: "asc" }, { ordem: "asc" }],
    })

    /**
     * Limite grátis, em TOKENS. ANTES da chamada ao Vertex.
     *
     * Depois não serviria para nada: o token já teria sido gasto, e a gente
     * pagaria a resposta de quem não paga a gente para então esconder ela.
     *
     * 402 e não 403: "precisa pagar" é diferente de "não pode". A tela usa esse
     * código para abrir o paywall em vez de mostrar erro.
     */
    const cota = await cotaDoMes(userId)
    if (!cota.podeUsar) {
      return NextResponse.json(
        {
          error: "cota_esgotada",
          mensagem:
            "Suas conversas gratuitas deste mês acabaram. Assine para continuar, " +
            "ou volte no dia 1º, que a cota renova.",
          cota: { usados: cota.usados, teto: cota.teto },
        },
        { status: 402 }
      )
    }

    const opcoesIA = {
      podeLancar,
      modulos,
      userId,
      personalidade,
      progressoTrilha: progresso ? linhaDoProgresso(progresso) : undefined,
      consulta: consulta ?? undefined,
    }

    /**
     * O fecho do turno: grava o que a resposta produziu e monta o corpo que a
     * tela consome.
     *
     * É UM só para os dois modos de entrega — resposta inteira e jorro. Duas
     * cópias divergiriam no primeiro campo que alguém acrescentasse de um lado
     * e esquecesse do outro, e o campo esquecido sumiria sem erro nenhum: quem
     * usasse o chat pelo caminho novo simplesmente deixaria de ter memória
     * gravada, ou de ter a conversa guardada no histórico.
     */
    const fecharTurno = async (resposta: RespostaIA) => {
      // A aula que o assistente citou entra na trilha da pessoa.
      //
      // Sem isto o card morria com a conversa: a aula não entrava na trilha, não
      // contava para o gatilho de percentual e sumia quando o histórico rolava.
      // Falha aqui não derruba a resposta, que é o que ela pediu.
      const recomendadas = (resposta.cards ?? [])
        .filter((c): c is Extract<typeof c, { tipo: "recomendacao" }> => c.tipo === "recomendacao")
        .filter((c) => !!c.moduloSlug)
      if (recomendadas.length) {
        await guardarRecomendacaoDoChat(
          userId,
          recomendadas.map((c) => c.moduloSlug as string),
          Object.fromEntries(recomendadas.map((c) => [c.moduloSlug as string, c.texto]))
        ).catch((e) => console.warn("[chat] recomendação:", (e as Error)?.message))
      }

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
        if (ultimaDaPessoa) {
          idConversa = await guardarTurno(userId, idConversa, ultimaDaPessoa, {
            texto: resposta.texto,
            cards: resposta.cards,
          })
        }
      } catch (e) {
        console.error("[chat] falha ao guardar a conversa:", (e as Error)?.message)
      }

      return {
        ...resposta,
        memorias: undefined,
        memoriasGuardadas: guardadas,
        podeLancar,
        gastoAtual,
        conversaId: idConversa,
        // A cota ANTES desta chamada. A tela usa para avisar quando está perto do
        // fim, em vez de a pessoa bater na parede sem aviso. Premium vem como
        // null: não há número para mostrar a quem não tem teto.
        cota: cota.premium ? null : { usados: cota.usados, teto: cota.teto },
      }
    }

    /**
     * ENTREGA EM JORRO (SSE) — o texto vai aparecendo enquanto o modelo escreve.
     *
     * Por que SSE e não WebSocket: o tráfego é de mão única e dura um turno.
     * WebSocket pediria estado de conexão em serverless para não ganhar nada.
     *
     * Três eventos, e a ordem importa:
     *  - `texto`: pedaço novo da resposta. Só o texto — nunca card, nunca
     *    lançamento. Proposta pela metade seria proposta errada.
     *  - `fim`: o mesmo corpo que o modo sem jorro devolve, com o texto JÁ
     *    validado. A tela troca o que mostrou pelo que veio aqui, e é isso que
     *    mantém a trava de conteúdo valendo mesmo depois de a bolha ter
     *    começado a aparecer.
     *  - `erro`: falha no meio. O cabeçalho já foi enviado com 200 e não dá
     *    para voltar atrás no status — então o erro viaja como evento, e a tela
     *    guarda o pedaço que já tinha chegado em vez de jogá-lo fora.
     */
    if (stream === true) {
      // "Não está ligado" é definitivo e a tela mostra aviso próprio para ele.
      // Precisa ser decidido ANTES de abrir o jorro: depois do 200 não há mais
      // status para dizer isso, e um erro definitivo virando "tenta de novo"
      // faria a pessoa tentar para sempre.
      if (!vertexConfigurada()) {
        return NextResponse.json(
          { error: "ia_nao_configurada", mensagem: "O assistente ainda não está ligado nesta instalação." },
          { status: 503 }
        )
      }

      const codificador = new TextEncoder()
      const corpo = new ReadableStream<Uint8Array>({
        async start(controlador) {
          let aberto = true
          const enviar = (evento: string, dado: unknown) => {
            if (!aberto) return
            try {
              controlador.enqueue(
                codificador.encode(`event: ${evento}\ndata: ${JSON.stringify(dado)}\n\n`)
              )
            } catch {
              // Aba fechada no meio da resposta. O turno continua e é gravado:
              // a chamada já foi paga, e a conversa é dela.
              aberto = false
            }
          }
          try {
            const resposta = await responderIA(
              mensagens as MensagemChat[],
              contexto,
              { ligada, conhecidas },
              { ...opcoesIA, aoTexto: (pedaco) => enviar("texto", { delta: pedaco }) }
            )
            enviar("fim", await fecharTurno(resposta))
          } catch (e) {
            console.error("[chat/jorro]", (e as Error)?.message)
            enviar("erro", {
              error: "falha_temporaria",
              mensagem: "Não consegui terminar de responder. Tenta de novo em alguns segundos.",
            })
          } finally {
            aberto = false
            // Fechar o que a outra ponta já derrubou lança — e lançar aqui, no
            // fim de tudo, só produziria ruído de log sobre uma aba que sumiu.
            try {
              controlador.close()
            } catch {}
          }
        },
      })

      return new Response(corpo, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          // `no-transform` junto com `no-cache`: sem ele um proxy pode juntar os
          // pedaços "para otimizar" e devolver tudo no fim — que é exatamente o
          // comportamento que se está corrigindo, agora sem ninguém ver por quê.
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      })
    }

    const resposta = await responderIA(
      mensagens as MensagemChat[],
      contexto,
      { ligada, conhecidas },
      opcoesIA
    )
    return NextResponse.json(await fecharTurno(resposta))
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
