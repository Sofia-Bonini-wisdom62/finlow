import { NextRequest, NextResponse } from "next/server"
import { exigirOps } from "@/lib/ops"
import { criarAlunosEmLote } from "@/lib/ops-escola"

export const dynamic = "force-dynamic"
// bcrypt em trinta contas leva mais do que o default confortável de uma rota
// de leitura; o teto de 200 alunos por chamada foi escolhido para caber aqui.
export const maxDuration = 120

/**
 * POST /api/ops/escolas/{id}/alunos — contas de aluno criadas em lote.
 *
 * ⚠️ É a EXCEÇÃO ao caminho normal, e o motivo está inteiro em
 * lib/ops-escola.ts: no Fundamental 1 a criança não tem e-mail para receber
 * link de convite. A senha de cada aluno volta UMA VEZ nesta resposta, para a
 * escola imprimir e entregar, e depois só existe como hash.
 *
 * A pendência de LGPD de menores segue aberta em docs/backlog-produto.md.
 * Esta rota é uso com risco assumido (decisão da fundadora, 18/08/2026), não
 * a pendência resolvida.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ escolaId: string }> }) {
  const op = await exigirOps()
  if (op instanceof NextResponse) return op
  const { escolaId } = await ctx.params

  const corpo = await req.json().catch(() => null)
  const turmaId = typeof corpo?.turmaId === "string" ? corpo.turmaId : ""
  const texto = typeof corpo?.lista === "string" ? corpo.lista : ""

  if (!turmaId) {
    return NextResponse.json(
      { codigo: "TURMA", erro: "Escolhe a turma dos alunos.", error: "Escolhe a turma dos alunos." },
      { status: 400 }
    )
  }

  const r = await criarAlunosEmLote({ escolaId, turmaId, texto })
  if (!r.ok) {
    return NextResponse.json({ codigo: "LOTE", erro: r.detalhe, error: r.detalhe }, { status: 400 })
  }

  console.log(`[ops] ${op.email} criou ${r.criados.length} alunos na turma ${turmaId}`)
  return NextResponse.json({ ok: true, criados: r.criados, ignoradas: r.ignoradas })
}
