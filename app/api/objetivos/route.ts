import { NextRequest, NextResponse } from "next/server"
import { getUserIdOr401, checarConsentimento } from "@/lib/painel"
import { contemConteudoProibido } from "@/lib/conteudo-proibido"
import {
  listarObjetivos,
  criarObjetivo,
  atualizarObjetivo,
  guardarNoObjetivo,
  apagarObjetivo,
  resumirObjetivos,
  ALVO_ABSURDO,
} from "@/lib/objetivo-repo"

export const dynamic = "force-dynamic"

/**
 * CRUD dos objetivos financeiros.
 *
 * Escrita exige o consentimento do Painel (R8): objetivo guarda valor
 * financeiro real da pessoa, mesma regra de Transacao e Investimento. Leitura
 * não exige — quem ainda não ativou o Painel não tem objetivo nenhum, e a
 * lista vazia é o que a tela precisa para desenhar o convite.
 *
 * Sem flag de beta, ao contrário de /api/investimentos: objetivo é produto
 * central, não Módulo Avançado.
 */

/** Teto de tamanho do emoji. Dois caracteres cobrem bandeiras e ZWJ curtos. */
const MAX_EMOJI = 8

type CorpoEscrita = {
  id?: unknown
  nome?: unknown
  emoji?: unknown
  valorAlvo?: unknown
  valorGuardado?: unknown
  prazo?: unknown
  guardar?: unknown
}

type Campos = {
  nome?: string
  emoji?: string | null
  valorAlvo?: number
  valorGuardado?: number
  prazo?: Date | null
}

function validar(corpo: CorpoEscrita, parcial: boolean): { erro: string } | Campos {
  const saida: Campos = {}

  if (corpo.nome !== undefined || !parcial) {
    const nome = String(corpo.nome ?? "").trim()
    if (nome.length < 1 || nome.length > 60) return { erro: "Nome entre 1 e 60 caracteres" }
    if (contemConteudoProibido(nome)) return { erro: "Esse nome não pode ser registrado." }
    saida.nome = nome
  }

  if (corpo.emoji !== undefined) {
    const emoji = corpo.emoji === null ? "" : String(corpo.emoji).trim()
    if (emoji.length > MAX_EMOJI) return { erro: "Emoji inválido" }
    saida.emoji = emoji || null
  }

  if (corpo.valorAlvo !== undefined || !parcial) {
    const alvo = Number(corpo.valorAlvo)
    if (!isFinite(alvo) || alvo <= 0 || alvo > ALVO_ABSURDO) return { erro: "Valor do objetivo inválido" }
    saida.valorAlvo = arredondar(alvo)
  }

  // Só na criação: depois disso o guardado se move por `guardar`, para que o
  // caminho de somar/tirar seja um só e o carimbo de conclusão passe por ele.
  if (corpo.valorGuardado !== undefined && !parcial) {
    const guardado = Number(corpo.valorGuardado)
    if (!isFinite(guardado) || guardado < 0 || guardado > ALVO_ABSURDO) return { erro: "Valor guardado inválido" }
    saida.valorGuardado = arredondar(guardado)
  }

  if (corpo.prazo !== undefined) {
    if (corpo.prazo === null || corpo.prazo === "") {
      saida.prazo = null
    } else {
      const d = new Date(String(corpo.prazo))
      if (isNaN(d.getTime())) return { erro: "Prazo inválido" }
      saida.prazo = d
    }
  }

  return saida
}

function arredondar(n: number): number {
  return Math.round(n * 100) / 100
}

export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const objetivos = await listarObjetivos(userId)
    return NextResponse.json({ objetivos, resumo: resumirObjetivos(objetivos) })
  } catch (e) {
    console.error("[objetivos]", (e as Error)?.message)
    return NextResponse.json({ error: "Erro ao carregar" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  const bloqueio = await checarConsentimento(userId)
  if (bloqueio) return bloqueio

  try {
    const corpo = (await req.json()) as CorpoEscrita
    const v = validar(corpo, false)
    if ("erro" in v) return NextResponse.json({ error: v.erro, erro: v.erro }, { status: 400 })

    const objetivo = await criarObjetivo(userId, {
      nome: v.nome!,
      emoji: v.emoji ?? null,
      valorAlvo: v.valorAlvo!,
      valorGuardado: v.valorGuardado ?? 0,
      prazo: v.prazo ?? null,
    })
    return NextResponse.json({ objetivo })
  } catch (e) {
    console.error("[objetivos POST]", (e as Error)?.message)
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}

/**
 * Duas escritas na mesma rota, e a diferença importa: `guardar` é um DELTA
 * (some 200 ao que já tem), os outros campos são substituição. Mandar os dois
 * no mesmo corpo é ambíguo — qual vale primeiro muda o resultado — então a
 * rota recusa em vez de escolher por conta própria.
 */
export async function PATCH(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  const bloqueio = await checarConsentimento(userId)
  if (bloqueio) return bloqueio

  try {
    const corpo = (await req.json()) as CorpoEscrita
    const id = typeof corpo.id === "string" ? corpo.id : ""
    if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

    const outrosCampos = ["nome", "emoji", "valorAlvo", "prazo"].some((k) => corpo[k as keyof CorpoEscrita] !== undefined)

    if (corpo.guardar !== undefined) {
      if (outrosCampos) {
        const erro = "Mande 'guardar' sozinho ou os campos do objetivo, não os dois"
        return NextResponse.json({ error: erro, erro }, { status: 400 })
      }
      const delta = Number(corpo.guardar)
      if (!isFinite(delta) || delta === 0 || Math.abs(delta) > ALVO_ABSURDO) {
        return NextResponse.json({ error: "Valor inválido" }, { status: 400 })
      }
      const objetivo = await guardarNoObjetivo(userId, id, arredondar(delta))
      if (!objetivo) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
      return NextResponse.json({ objetivo })
    }

    const v = validar(corpo, true)
    if ("erro" in v) return NextResponse.json({ error: v.erro, erro: v.erro }, { status: 400 })
    if (Object.keys(v).length === 0) return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 })

    const objetivo = await atualizarObjetivo(userId, id, v)
    if (!objetivo) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    return NextResponse.json({ objetivo })
  } catch (e) {
    console.error("[objetivos PATCH]", (e as Error)?.message)
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  const bloqueio = await checarConsentimento(userId)
  if (bloqueio) return bloqueio

  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

  const apagou = await apagarObjetivo(userId, id)
  if (!apagou) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
