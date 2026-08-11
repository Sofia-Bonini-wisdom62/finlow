import { NextRequest, NextResponse } from "next/server"
import { getUserIdOr401 } from "@/lib/painel"
import { COOKIE_CONVITE, resgatarConvite, type MotivoResgate } from "@/lib/convite-escola"
import { apelidoValido } from "@/lib/pontos"

export const dynamic = "force-dynamic"

/** O que a tela de aceite mostra para cada recusa. */
const MENSAGENS: Record<MotivoResgate, string> = {
  formato: "Esse convite não parece válido. Pede um link novo para a escola.",
  inexistente: "Esse convite não existe mais. Pede um link novo para a escola.",
  revogado: "Esse convite foi cancelado pela escola. Pede um novo.",
  expirado: "Esse convite venceu. Pede um novo para a escola.",
  esgotado: "Esse convite já foi usado pelo número máximo de pessoas. Pede um novo.",
  ja_vinculado: "Sua conta já está vinculada a uma escola.",
  convite_quebrado: "Esse convite está com problema. Avisa a escola para gerar outro.",
}

/**
 * POST /api/convite/resgatar — conta EXISTENTE entra na escola.
 *
 * O caminho de conta nova é o cadastro (que lê o mesmo cookie); este aqui é o
 * botão "Entrar na escola com esta conta" de /convite/aceitar. O código vem
 * do cookie, nunca do corpo: o cookie foi plantado por um link que provamos
 * existir, e corpo com código viraria uma API de força bruta.
 */
export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const codigo = req.cookies.get(COOKIE_CONVITE)?.value
  if (!codigo) {
    return NextResponse.json(
      { codigo: "SEM_CONVITE", erro: "Não achei convite nenhum. Abre o link de novo?", error: "Não achei convite nenhum. Abre o link de novo?" },
      { status: 400 }
    )
  }

  let apelido: string | null = null
  try {
    const corpo = await req.json()
    if (typeof corpo?.apelido === "string" && corpo.apelido.trim()) {
      const v = apelidoValido(corpo.apelido)
      if (!v.ok) {
        return NextResponse.json({ codigo: "APELIDO", erro: v.erro, error: v.erro }, { status: 400 })
      }
      apelido = v.apelido
    }
  } catch {
    // corpo vazio é permitido — apelido é opcional
  }

  const r = await resgatarConvite(userId, codigo, apelido)

  const res = NextResponse.json(
    r.ok ? { ok: true, papel: r.papel } : { ok: false, motivo: r.motivo, erro: MENSAGENS[r.motivo], error: MENSAGENS[r.motivo] },
    { status: r.ok ? 200 : 409 }
  )
  // Consumido, some — resgatado ou recusado de vez. Só sobrevive quando vale
  // tentar de novo mais tarde (nada muda sozinho num formato inválido, mas um
  // "ja_vinculado" pode ser a pessoa na conta errada).
  if (r.ok || r.motivo === "inexistente" || r.motivo === "revogado" || r.motivo === "expirado" || r.motivo === "esgotado") {
    res.cookies.delete(COOKIE_CONVITE)
  }
  return res
}
