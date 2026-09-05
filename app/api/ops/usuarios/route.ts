import { NextRequest, NextResponse } from "next/server"
import { exigirOps } from "@/lib/ops"
import { MIN_BUSCA_CONTA } from "@/lib/constantes"
import { procurarContas } from "@/lib/ops-usuario"

export const dynamic = "force-dynamic"

/**
 * GET /api/ops/usuarios?q=… — acha a conta de quem escreveu para o suporte.
 *
 * É leitura de dados de terceiros e por isso vive inteira atrás de
 * `exigirOps`, que responde 404 (e não 403) para quem não está na lista: um
 * 403 confirmaria a existência da porta para quem estava chutando endereços.
 *
 * O termo curto é recusado aqui e não só na função: `q=a` devolveria a base
 * ordenada por acaso, o que é um vazamento com cara de funcionalidade.
 */
export async function GET(req: NextRequest) {
  const op = await exigirOps()
  if (op instanceof NextResponse) return op

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""
  if (q.length < MIN_BUSCA_CONTA) {
    const msg = `Escreve pelo menos ${MIN_BUSCA_CONTA} letras do e-mail ou do nome.`
    return NextResponse.json({ codigo: "BUSCA_CURTA", erro: msg, error: msg }, { status: 400 })
  }

  return NextResponse.json({ contas: await procurarContas(q) })
}
