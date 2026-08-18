import { NextRequest, NextResponse } from "next/server"
import { exigirOps } from "@/lib/ops"
import { criarEscolaComAdm, fimDoDiaEmSaoPaulo } from "@/lib/ops-escola"

export const dynamic = "force-dynamic"

/**
 * POST /api/ops/escolas — cria a escola e a conta do adm dela.
 *
 * A tela de /escola nunca teve esta porta de propósito (venda manual, sem
 * signup B2B), e continua sem ter: quem cria escola é a operação do Finlow,
 * não a escola. O que mudou é que a operação deixou de precisar de terminal.
 *
 * A senha temporária volta no corpo da resposta e some depois: o banco guarda
 * só o hash, e nem esta rota consegue recuperá-la numa segunda chamada.
 */
export async function POST(req: NextRequest) {
  const op = await exigirOps()
  if (op instanceof NextResponse) return op

  const corpo = await req.json().catch(() => null)
  const nome = typeof corpo?.nome === "string" ? corpo.nome : ""
  const admEmail = typeof corpo?.admEmail === "string" ? corpo.admEmail : ""
  const ativaAteBruto = typeof corpo?.ativaAte === "string" ? corpo.ativaAte.trim() : ""

  let ativaAte: Date | null = null
  if (ativaAteBruto) {
    ativaAte = fimDoDiaEmSaoPaulo(ativaAteBruto)
    if (!ativaAte) {
      return NextResponse.json(
        { codigo: "VIGENCIA", erro: "Data ilegível. Use AAAA-MM-DD.", error: "Data ilegível. Use AAAA-MM-DD." },
        { status: 400 }
      )
    }
  }

  const r = await criarEscolaComAdm({ nome, admEmail, ativaAte })
  if (!r.ok) {
    return NextResponse.json(
      { codigo: r.motivo.toUpperCase(), erro: r.detalhe, error: r.detalhe },
      { status: r.motivo === "ja_e_membro" ? 409 : 400 }
    )
  }

  console.log(`[ops] ${op.email} criou a escola ${r.escolaId}`)
  return NextResponse.json({
    ok: true,
    escolaId: r.escolaId,
    contaNova: r.contaNova,
    senhaTemporaria: r.senhaTemporaria,
  })
}
