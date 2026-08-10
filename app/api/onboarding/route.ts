import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import { responderIA, IANaoConfigurada, type MensagemChat } from "@/lib/ia"
import { listarMemorias, guardarMemorias, type TipoMemoria } from "@/lib/memoria-repo"
import { promptOnboarding } from "@/lib/prompts/onboarding"
import { montarContexto } from "@/lib/contexto-financeiro"
import { ativarIndicacaoSeHouver } from "@/lib/indicacao"
import { filtroDeModulo } from "@/lib/publico"

export const dynamic = "force-dynamic"
// Resposta de chat leva 5–15s. 60 dá folga sem deixar um travamento
// consumir 5 minutos de função.
export const maxDuration = 60

// GET — estado da primeira conversa
export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const u = await db.user.findUnique({
    where: { id: userId },
    select: { nome: true, onboardingEm: true, memoriaAtiva: true, consentimentoPainelEm: true },
  })
  return NextResponse.json({
    nome: u?.nome ?? "",
    concluido: !!u?.onboardingEm,
    memoriaAtiva: !!u?.memoriaAtiva,
    painelAtivo: !!u?.consentimentoPainelEm,
  })
}

/**
 * POST — um turno da primeira conversa.
 *
 * É o chat normal com um roteiro por cima (lib/prompts/onboarding.ts). Não
 * duplica a costura da IA de propósito: tom, limites, regra de número, memória
 * e lançamentos continuam vindo do mesmo lugar. Se divergissem, o assistente
 * seria uma pessoa no onboarding e outra depois.
 *
 * A memória é ligada aqui SEM pedir de novo, e isso é deliberado: a tela de
 * onboarding já explica e pede o aceite antes de começar. Pedir duas vezes a
 * mesma permissão treina a pessoa a clicar em "sim" sem ler.
 */
export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const { mensagens } = await req.json()
    if (!Array.isArray(mensagens)) {
      return NextResponse.json({ error: "Nenhuma mensagem enviada" }, { status: 400 })
    }

    const [contexto, usuario] = await Promise.all([
      montarContexto(userId),
      db.user.findUnique({
        where: { id: userId },
        select: { nome: true, memoriaAtiva: true, consentimentoPainelEm: true },
      }),
    ])

    const ligada = !!usuario?.memoriaAtiva
    const podeLancar = !!usuario?.consentimentoPainelEm
    const conhecidas = ligada
      ? (await listarMemorias(userId)).map((m) => ({ tipo: m.tipo, conteudo: m.conteudo }))
      : []

    // Turno = quantas vezes o assistente já falou. É o que diz a ele onde está
    // no arco sem precisar reler a conversa inteira para contar.
    const turno = mensagens.filter((m: MensagemChat) => m.papel === "ia").length + 1

    // As aulas vêm do banco, iguais às do chat. Sem elas o onboarding não
    // consegue terminar recomendando uma aula de verdade — que é o ponto dele —
    // e um slug inventado passaria sem ninguém conferir.
    const modulos = await db.modulo.findMany({
      where: filtroDeModulo(),
      select: { slug: true, titulo: true },
      orderBy: [{ tipoPerfil: "asc" }, { ordem: "asc" }],
    })

    const resposta = await responderIA(
      mensagens as MensagemChat[],
      contexto,
      { ligada, conhecidas },
      {
        podeLancar,
        onboarding: true,
        modulos,
        sistemaExtra: promptOnboarding(usuario?.nome ?? "", turno),
        // Conta na cota, mas NÃO tem guard: o onboarding é a primeira coisa que
        // a pessoa faz e bloqueá-lo seria cobrar antes de mostrar o produto. O
        // gasto entra na conta porque é gasto de verdade; o custo é pequeno
        // perto do teto e é custo de aquisição.
        userId,
      }
    )

    let guardadas: { id: string; tipo: string; conteudo: string }[] = []
    if (ligada && resposta.memorias?.length) {
      try {
        const novas = await guardarMemorias(
          userId,
          resposta.memorias.map((m) => ({ tipo: m.tipo as TipoMemoria, conteudo: m.conteudo }))
        )
        guardadas = novas.map((m) => ({ id: m.id, tipo: m.tipo, conteudo: m.conteudo }))
      } catch (e) {
        console.error("[onboarding] falha ao guardar memória:", (e as Error)?.message)
      }
    }

    // Fecho: grava perfil e marca a data. Sem isso a pessoa refaria o
    // onboarding a cada visita.
    if (resposta.concluido && resposta.perfilSugerido) {
      try {
        await db.$transaction([
          db.perfil.upsert({
            where: { userId },
            create: { userId, tipo: resposta.perfilSugerido, respostas: { origem: "onboarding" } },
            update: { tipo: resposta.perfilSugerido },
          }),
          db.user.update({ where: { id: userId }, data: { onboardingEm: new Date() } }),
        ])
        // A indicação ativa AQUI, não no cadastro: indicado só "vale" quando
        // conversou de verdade. Idempotente — refazer a primeira conversa
        // repassa por este ponto e a chave única dos pontos segura a repetição.
        await ativarIndicacaoSeHouver(userId).catch((e) =>
          console.error("[onboarding] indicação:", (e as Error)?.message)
        )
      } catch (e) {
        console.error("[onboarding] falha ao concluir:", (e as Error)?.message)
      }
    }

    return NextResponse.json({
      ...resposta,
      memorias: undefined,
      memoriasGuardadas: guardadas,
      podeLancar,
    })
  } catch (e) {
    if (e instanceof IANaoConfigurada) {
      return NextResponse.json(
        { error: "ia_nao_configurada", mensagem: "O assistente ainda não está ligado nesta instalação." },
        { status: 503 }
      )
    }
    console.error("[onboarding]", (e as Error)?.message)
    return NextResponse.json(
      { error: "falha_temporaria", mensagem: "Não consegui responder agora. Tenta de novo em alguns segundos." },
      { status: 502 }
    )
  }
}

// PATCH — aceites do começo (memória e Painel), num toque só
export async function PATCH(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const { memoria, painel } = await req.json()
    await db.user.update({
      where: { id: userId },
      data: {
        ...(typeof memoria === "boolean" ? { memoriaAtiva: memoria } : {}),
        ...(painel === true ? { consentimentoPainelEm: new Date() } : {}),
      },
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[onboarding] PATCH", (e as Error)?.message)
    return NextResponse.json({ erro: "Não consegui salvar agora." }, { status: 503 })
  }
}
