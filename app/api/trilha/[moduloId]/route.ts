import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { carregarIndicadores, interpolarIndicadores } from "@/lib/indicadores"
import { filtroDeModulo } from "@/lib/publico"
import { montarLicoes } from "@/lib/licoes"
import { montarCorredor } from "@/lib/corredor"

export const dynamic = "force-dynamic"

/**
 * GET /api/trilha/[moduloId]?licao=N
 *
 * Serve as telas de UMA lição, não do módulo inteiro. Sem `licao`, devolve a
 * próxima que a pessoa tem para fazer.
 *
 * O userId sai SÓ da sessão. O fallback `?userId=` que existia aqui deixava
 * qualquer um ler o progresso de qualquer conta passando o id na URL.
 *
 * A TRAVA DO CORREDOR É CONFERIDA AQUI, no servidor. Se ela vivesse só no
 * desenho da Trilha, trocar o número da lição na URL bastaria para pular a
 * fila — e um corredor que qualquer um contorna pela barra de endereço não é
 * um corredor.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ moduloId: string }> }
) {
  try {
    const { moduloId } = await params
    const { searchParams } = new URL(req.url)
    const session = await auth()
    const userId = session?.user?.id ?? null

    // aceita id (cuid) ou slug — os cards do Perfil linkam por slug
    const modulo = await db.modulo.findFirst({
      where: { OR: [{ id: moduloId }, { slug: moduloId }], ...filtroDeModulo() },
      include: { telas: { orderBy: { ordem: "asc" } } },
    })

    if (!modulo) return NextResponse.json({ error: "Módulo não encontrado" }, { status: 404 })

    /**
     * O dado macro entra AQUI, não no conteúdo gravado.
     *
     * O módulo escreve `{{rotativo_medio}}` e a troca acontece na hora de
     * exibir. Quando o Banco Central publicar taxa nova, é UPDATE numa linha,
     * não reescrever aula.
     *
     * Os números vão junto em `indicadores` porque a fórmula da tela de
     * resultado roda no navegador e precisa calcular com eles — sem isso a
     * taxa ficaria cravada no código do cálculo, que é o mesmo problema uma
     * camada abaixo.
     */
    const indicadores = await carregarIndicadores()
    const telasClaras = modulo.telas.map((t) => ({
      ...t,
      conteudo: JSON.parse(
        interpolarIndicadores(JSON.stringify(t.conteudo), indicadores)
      ),
    }))

    const numeros: Record<string, number> = {}
    for (const [chave, i] of indicadores) if (i.numero !== null) numeros[chave] = i.numero

    const licoes = montarLicoes(telasClaras as never)

    // Sem sessão o conteúdo da aula ainda é servido, mas sem corredor e sem
    // progresso: os dois são da PESSOA, e aqui não há pessoa nenhuma.
    if (!userId) {
      const pedida = Number(searchParams.get("licao")) || licoes[0]?.licao
      const l = licoes.find((x) => x.licao === pedida) ?? licoes[0]
      if (!l) return NextResponse.json({ error: "Módulo sem telas" }, { status: 404 })
      return NextResponse.json({
        modulo: { ...modulo, telas: l.telas },
        licao: { numero: l.licao, nome: l.nome, resumo: l.resumo, total: licoes.length },
        indice: licoes.findIndex((x) => x.licao === l.licao) + 1,
        indicadores: numeros,
        telaInicial: 0,
      })
    }

    const corredor = await montarCorredor(userId)
    const noCorredor = corredor.modulos.get(modulo.id)

    if (noCorredor?.estado === "trancado") {
      return NextResponse.json(
        { error: "trancado", motivo: noCorredor.bloqueio ?? "Este módulo ainda não abriu." },
        { status: 403 }
      )
    }

    // Sem `licao` na URL: a próxima a fazer. Módulo já concluído reabre na
    // primeira — revisar o que já foi feito é permitido, o que não é permitido
    // é ADIANTAR.
    const pedida = Number(searchParams.get("licao"))
    const alvo = pedida || noCorredor?.proximaLicao || licoes[0]?.licao
    const l = licoes.find((x) => x.licao === alvo)
    if (!l) return NextResponse.json({ error: "Lição não encontrada" }, { status: 404 })

    const estadoLicao = noCorredor?.licoes.find((x) => x.licao === l.licao)
    if (estadoLicao && !estadoLicao.liberada) {
      return NextResponse.json(
        { error: "trancado", motivo: "Conclua a lição anterior para abrir esta." },
        { status: 403 }
      )
    }

    const prog = await db.progressoLicao.findUnique({
      where: { userId_moduloId_licao: { userId, moduloId: modulo.id, licao: l.licao } },
      select: { telaAtual: true, concluido: true, segundos: true },
    })

    return NextResponse.json({
      modulo: { ...modulo, telas: l.telas },
      licao: {
        numero: l.licao,
        nome: l.nome,
        resumo: l.resumo,
        total: licoes.length,
        concluida: !!prog?.concluido,
        segundos: prog?.segundos ?? 0,
      },
      // Qual das N lições é esta, para o header dizer "2 de 4" sem que a tela
      // precise saber que a numeração pode pular (módulo sem História).
      indice: licoes.findIndex((x) => x.licao === l.licao) + 1,
      licoesDoModulo: licoes.map((x) => {
        const e = noCorredor?.licoes.find((y) => y.licao === x.licao)
        return {
          numero: x.licao,
          nome: x.nome,
          resumo: x.resumo,
          concluida: !!e?.concluida,
          liberada: !!e?.liberada,
        }
      }),
      indicadores: numeros,
      // Retomar de onde parou, sem passar do fim da lição.
      telaInicial:
        prog && !prog.concluido ? Math.min(prog.telaAtual, l.telas.length - 1) : 0,
    })
  } catch (e) {
    console.error("[trilha/[moduloId] GET]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
