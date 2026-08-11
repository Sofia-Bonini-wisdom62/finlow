import { NextRequest, NextResponse } from "next/server"
import { exigirPapel, podeGerirTurma } from "@/lib/escola"
import { gerarConvite } from "@/lib/convite-escola"

export const dynamic = "force-dynamic"

/**
 * POST /api/escola/convites — gera o código.
 *
 * Adm convida professor E aluno; professor só convida aluno, e só para turma
 * que ele gere. A regra de quem-pode-o-quê mora aqui; a mecânica do código
 * (formato, teto, expiração) mora em lib/convite-escola.ts.
 */
export async function POST(req: NextRequest) {
  const v = await exigirPapel("adm", "professor")
  if (v instanceof NextResponse) return v

  const corpo = await req.json().catch(() => null)
  const papel = corpo?.papel
  const turmaId = typeof corpo?.turmaId === "string" ? corpo.turmaId : null

  if (papel !== "professor" && papel !== "aluno") {
    return NextResponse.json(
      { codigo: "PAPEL", erro: "Convite é de professor ou de aluno.", error: "Convite é de professor ou de aluno." },
      { status: 400 }
    )
  }
  if (papel === "professor" && v.papel !== "adm") {
    return NextResponse.json(
      { codigo: "PAPEL_INSUFICIENTE", erro: "Só a administração convida professores.", error: "Só a administração convida professores." },
      { status: 403 }
    )
  }
  if (papel === "aluno") {
    if (!turmaId) {
      return NextResponse.json(
        { codigo: "TURMA", erro: "Convite de aluno precisa de uma turma.", error: "Convite de aluno precisa de uma turma." },
        { status: 400 }
      )
    }
    if (!(await podeGerirTurma(v, turmaId))) {
      return NextResponse.json(
        { codigo: "TURMA_ALHEIA", erro: "Essa turma não é sua para convidar.", error: "Essa turma não é sua para convidar." },
        { status: 403 }
      )
    }
  }

  const c = await gerarConvite({
    escolaId: v.escolaId,
    papel,
    turmaId,
    criadoPorId: v.userId,
  })
  return NextResponse.json({ ok: true, codigo: c.codigo })
}
