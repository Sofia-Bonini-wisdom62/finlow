import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"
import { listarRanking, apelidoValido } from "@/lib/pontos"
import { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

/**
 * Ranking.
 *
 * É a única tela do app em que alguém vê dado de outra pessoa, então o que ela
 * NÃO devolve importa tanto quanto o que devolve: só apelido e pontos saem
 * daqui. Nada de e-mail, nome real, id, valor, dívida, renda ou categoria.
 *
 * Entrar é opt-in explícito, e sair some da lista na mesma hora.
 */
export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const eu = await db.user.findUnique({
      where: { id: userId },
      select: { pontos: true, apelido: true, rankingOptIn: true },
    })

    // A lista só vem para quem está dentro. Ver o ranking sem participar
    // transforma em vitrine o que devia ser troca: quem olha não é olhado.
    const linhas = eu?.rankingOptIn ? await listarRanking(userId) : []

    return NextResponse.json({
      participando: !!eu?.rankingOptIn,
      apelido: eu?.apelido ?? null,
      meusPontos: eu?.pontos ?? 0,
      linhas,
    })
  } catch (e) {
    console.error("[ranking] GET", (e as Error)?.message)
    return NextResponse.json(
      { codigo: "INDISPONIVEL", erro: "Não consegui carregar o ranking agora." },
      { status: 503 }
    )
  }
}

/** PATCH — entra, sai, ou troca o apelido. */
export async function PATCH(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const corpo = await req.json().catch(() => ({}))
  const querParticipar = corpo.participar === true

  try {
    if (!querParticipar) {
      // Sair remove da listagem imediatamente. O apelido fica guardado para
      // quem voltar não ter de escolher de novo — ele não aparece em lugar
      // nenhum enquanto rankingOptIn for false.
      await db.user.update({ where: { id: userId }, data: { rankingOptIn: false } })
      return NextResponse.json({ participando: false })
    }

    const bruto = typeof corpo.apelido === "string" ? corpo.apelido : ""
    const check = apelidoValido(bruto)
    if (!check.ok) {
      return NextResponse.json({ codigo: "APELIDO_INVALIDO", erro: check.erro }, { status: 400 })
    }

    await db.user.update({
      where: { id: userId },
      data: { apelido: check.apelido, rankingOptIn: true },
    })
    return NextResponse.json({ participando: true, apelido: check.apelido })
  } catch (e) {
    // P2002 aqui só pode ser o apelido, que é @unique. Mensagem específica:
    // "erro ao salvar" faria a pessoa tentar o mesmo apelido de novo.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { codigo: "APELIDO_EM_USO", erro: "Esse apelido já é de outra pessoa. Tenta outro." },
        { status: 409 }
      )
    }
    console.error("[ranking] PATCH", (e as Error)?.message)
    return NextResponse.json(
      { codigo: "INDISPONIVEL", erro: "Não consegui salvar agora." },
      { status: 503 }
    )
  }
}
