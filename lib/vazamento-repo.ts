import { randomUUID } from "node:crypto"
import { db } from "@/lib/db"
import { cifrar, cifrarNumero, decifrar, decifrarNumero } from "@/lib/cripto"
import type { Achado, ResultadoVazamento } from "@/lib/vazamento"

/**
 * Ponto único de entrada/saída do DiagnosticoVazamento — mesma razão do
 * financeiro-repo: os campos são cifrados, e rota que fala com
 * db.diagnosticoVazamento direto lê "v1.…" achando que leu um número.
 */

export interface DiagnosticoClaro extends ResultadoVazamento {
  narrativa: string | null
  geradoEm: Date
  entregueEm: Date | null
  tokenPublico: string | null
}

/**
 * Regrava a foto. `entregueEm` e `tokenPublico` NÃO entram no update de
 * propósito: sobrevivem à regeração (a entrega é única, o link não pode
 * trocar). `mesesAnalisados` viaja dentro do JSON de achados para não virar
 * coluna em claro contando quanto histórico a pessoa tem.
 */
export async function salvarDiagnostico(
  userId: string,
  resultado: ResultadoVazamento,
  narrativa: string
): Promise<void> {
  const conteudo = cifrar(
    JSON.stringify({ achados: resultado.achados, mesesAnalisados: resultado.mesesAnalisados }),
    userId,
    "achados"
  )
  const total = cifrarNumero(resultado.totalAnual, userId, "totalAnual")
  const nar = cifrar(narrativa, userId, "narrativa")

  await db.diagnosticoVazamento.upsert({
    where: { userId },
    create: { userId, totalAnual: total, achados: conteudo, narrativa: nar },
    update: { totalAnual: total, achados: conteudo, narrativa: nar, geradoEm: new Date() },
  })
}

export async function lerDiagnostico(userId: string): Promise<DiagnosticoClaro | null> {
  const linha = await db.diagnosticoVazamento.findUnique({ where: { userId } })
  if (!linha) return null

  let achados: Achado[] = []
  let mesesAnalisados = 0
  try {
    const j = JSON.parse(decifrar(linha.achados, userId, "achados")) as {
      achados?: Achado[]
      mesesAnalisados?: number
    }
    achados = Array.isArray(j.achados) ? j.achados : []
    mesesAnalisados = typeof j.mesesAnalisados === "number" ? j.mesesAnalisados : 0
  } catch {}

  const totalAnual = decifrarNumero(linha.totalAnual, userId, "totalAnual")
  return {
    achados,
    mesesAnalisados,
    totalAnual,
    totalMensal: Math.round((totalAnual / 12) * 100) / 100,
    narrativa: linha.narrativa ? decifrar(linha.narrativa, userId, "narrativa") : null,
    geradoEm: linha.geradoEm,
    entregueEm: linha.entregueEm,
    tokenPublico: linha.tokenPublico,
  }
}

/**
 * O que o link público mostra — e NADA além disso: o número anualizado,
 * quantos achados, e o código de indicação do dono para o CTA. Nem nome, nem
 * e-mail, nem os achados em si (têm nome de estabelecimento).
 */
export async function lerDiagnosticoPublico(token: string): Promise<{
  totalAnual: number
  quantosAchados: number
  codigoIndicacao: string | null
} | null> {
  const linha = await db.diagnosticoVazamento.findUnique({
    where: { tokenPublico: token },
    include: { user: { select: { codigoIndicacao: true } } },
  })
  if (!linha) return null

  let quantos = 0
  try {
    const j = JSON.parse(decifrar(linha.achados, linha.userId, "achados")) as { achados?: unknown[] }
    quantos = Array.isArray(j.achados) ? j.achados.length : 0
  } catch {}

  return {
    totalAnual: decifrarNumero(linha.totalAnual, linha.userId, "totalAnual"),
    quantosAchados: quantos,
    codigoIndicacao: linha.user.codigoIndicacao,
  }
}

/** A entrega no chat aconteceu — uma vez, e o updateMany segura corrida. */
export async function marcarEntregue(userId: string): Promise<void> {
  await db.diagnosticoVazamento.updateMany({
    where: { userId, entregueEm: null },
    data: { entregueEm: new Date() },
  })
}

/** Cria (ou devolve) o link público. Opt-in: só roda quando a pessoa pede. */
export async function gerarTokenPublico(userId: string): Promise<string | null> {
  const linha = await db.diagnosticoVazamento.findUnique({ where: { userId }, select: { tokenPublico: true } })
  if (!linha) return null
  if (linha.tokenPublico) return linha.tokenPublico
  const token = randomUUID()
  await db.diagnosticoVazamento.update({ where: { userId }, data: { tokenPublico: token } })
  return token
}

export async function revogarTokenPublico(userId: string): Promise<void> {
  await db.diagnosticoVazamento.updateMany({ where: { userId }, data: { tokenPublico: null } })
}
