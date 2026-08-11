import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { exigirPapel, podeGerirTurma, segmentosDoProfessor } from "@/lib/escola"
import { filtroDeModulo, ehPublico } from "@/lib/publico"

export const dynamic = "force-dynamic"

/**
 * Concessões de trilha da turma (Finlow para Escolas).
 *
 * POST   { tipo: "bloco"|"modulo", refId }  → libera
 * DELETE { tipo, refId } ou { tudo: true }  → revoga (tudo = volta ao padrão,
 *                                             que é a trilha completa)
 *
 * O refId é validado contra o SEGMENTO da turma: conceder bloco de outro
 * segmento (ou módulo adulto) gravaria uma linha que o corredor do aluno
 * nunca expande — lixo que confunde a tela do professor. "segmento" não é
 * gravado por aqui de propósito: o padrão sem linhas já é a trilha completa.
 */

function recusa(codigo: string, mensagem: string, status: number) {
  return NextResponse.json({ codigo, erro: mensagem, error: mensagem }, { status })
}

async function turmaGerivel(req: NextRequest, turmaId: string) {
  const v = await exigirPapel("adm", "professor")
  if (v instanceof NextResponse) return { erro: v }

  if (!(await podeGerirTurma(v, turmaId))) {
    return { erro: recusa("TURMA_ALHEIA", "Essa turma não é sua para gerir.", 403) }
  }
  const turma = await db.turma.findUnique({
    where: { id: turmaId },
    select: { segmento: true },
  })
  if (!turma || !ehPublico(turma.segmento)) {
    return { erro: recusa("TURMA", "Turma não encontrada.", 404) }
  }
  // Competência reduz também aqui: professor restrito a ef35 não concede
  // trilha numa turma de em, mesmo sendo o professor dela.
  const permitidos = await segmentosDoProfessor(v)
  if (permitidos && !permitidos.includes(turma.segmento)) {
    return {
      erro: recusa(
        "FORA_DA_COMPETENCIA",
        "O segmento desta turma está fora das suas competências.",
        403
      ),
    }
  }
  return { v, segmento: turma.segmento }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ turmaId: string }> }) {
  const { turmaId } = await ctx.params
  const r = await turmaGerivel(req, turmaId)
  if ("erro" in r) return r.erro

  const corpo = await req.json().catch(() => null)
  const tipo = corpo?.tipo
  const refId = typeof corpo?.refId === "string" ? corpo.refId : ""

  if (tipo !== "bloco" && tipo !== "modulo") {
    return recusa("TIPO", "Concessão é por bloco ou por módulo.", 400)
  }

  // O refId precisa existir DENTRO do segmento da turma.
  const existe = await db.modulo.findFirst({
    where:
      tipo === "bloco"
        ? { ...filtroDeModulo(r.segmento), blocoId: refId }
        : { ...filtroDeModulo(r.segmento), id: refId },
    select: { id: true },
  })
  if (!existe) {
    return recusa("REF", "Isso não existe no segmento desta turma.", 400)
  }

  await db.acessoTrilhaTurma.upsert({
    where: { turmaId_tipo_refId: { turmaId, tipo, refId } },
    create: { turmaId, tipo, refId, concedidoPorId: r.v.userId },
    update: {},
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ turmaId: string }> }) {
  const { turmaId } = await ctx.params
  const r = await turmaGerivel(req, turmaId)
  if ("erro" in r) return r.erro

  const corpo = await req.json().catch(() => null)

  if (corpo?.tudo === true) {
    // Volta ao padrão: sem linhas, a trilha completa do segmento abre.
    await db.acessoTrilhaTurma.deleteMany({ where: { turmaId } })
    return NextResponse.json({ ok: true })
  }

  const tipo = corpo?.tipo
  const refId = typeof corpo?.refId === "string" ? corpo.refId : ""
  if ((tipo !== "bloco" && tipo !== "modulo") || !refId) {
    return recusa("TIPO", "Diz o que revogar: { tipo, refId } ou { tudo: true }.", 400)
  }

  await db.acessoTrilhaTurma.deleteMany({ where: { turmaId, tipo, refId } })
  return NextResponse.json({ ok: true })
}
