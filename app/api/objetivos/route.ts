import { NextRequest, NextResponse } from "next/server"
import { getUserIdOr401, checarConsentimento } from "@/lib/painel"
import { contemConteudoProibido } from "@/lib/conteudo-proibido"
import { listarObjetivos, criarObjetivo, guardarNoObjetivo } from "@/lib/objetivo-repo"
import { lerValor } from "@/lib/objetivo"

export const dynamic = "force-dynamic"

/**
 * Objetivos de poupança (protótipo v2). Leitura é livre — o dado só existe se
 * a pessoa criou. Escrita exige o consentimento do Painel (regra R8):
 * objetivo é dado financeiro real, mesma régua de Transacao e Investimento.
 *
 * Sem DELETE de propósito: o desenho não tem caminho de remover/editar
 * objetivo, e rota sem tela é porta morta. Está registrado como pendência de
 * design no backlog; o dado sai na exportação e morre com a conta (Cascade).
 *
 * Quem decide se um valor vale é `lerValor`, em `lib/objetivo.ts`, e é a MESMA
 * função que a tela chama antes de mandar. A validação continua aqui porque a
 * tela não é autoridade: o que chega neste `fetch` pode não ter vindo dela.
 */

export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const objetivos = await listarObjetivos(userId)
    return NextResponse.json({ objetivos })
  } catch (e) {
    console.error("[objetivos]", (e as Error)?.message)
    return NextResponse.json({ error: "Erro ao carregar" }, { status: 500 })
  }
}

// POST — cria um objetivo { nome, meta }
export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  const bloqueio = await checarConsentimento(userId)
  if (bloqueio) return bloqueio

  try {
    const corpo = await req.json()
    const nome = String(corpo?.nome ?? "").trim()

    if (nome.length < 1 || nome.length > 60) {
      return NextResponse.json({ error: "Nome entre 1 e 60 caracteres" }, { status: 400 })
    }
    if (contemConteudoProibido(nome)) {
      return NextResponse.json({ error: "Esse nome não pode ser registrado." }, { status: 400 })
    }
    const meta = lerValor(corpo?.meta)
    if (!meta.ok) return NextResponse.json({ error: meta.motivo }, { status: 400 })

    const objetivo = await criarObjetivo(userId, { nome, meta: meta.valor })
    return NextResponse.json({ objetivo })
  } catch (e) {
    console.error("[objetivos POST]", (e as Error)?.message)
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}

// PATCH — guarda mais um pouco { id, guardar }
export async function PATCH(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  const bloqueio = await checarConsentimento(userId)
  if (bloqueio) return bloqueio

  try {
    const corpo = await req.json()
    const id = typeof corpo?.id === "string" ? corpo.id : ""

    if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
    const valor = lerValor(corpo?.guardar)
    if (!valor.ok) return NextResponse.json({ error: valor.motivo }, { status: 400 })

    const objetivo = await guardarNoObjetivo(userId, id, valor.valor)
    if (!objetivo) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    return NextResponse.json({ objetivo })
  } catch (e) {
    console.error("[objetivos PATCH]", (e as Error)?.message)
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}
