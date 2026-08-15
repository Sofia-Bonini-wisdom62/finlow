import { db } from "@/lib/db"
import { cifrar, cifrarNumero, decifrar, decifrarNumero } from "@/lib/cripto"

/**
 * Ponto único de entrada/saída dos objetivos — mesma razão do
 * investimento-repo: `nome`, `meta` e `guardado` são cifrados, e rota que
 * fala com db.objetivo direto lê "v1.…" e soma zero em silêncio.
 * Só deleteMany pode ir direto: apagar não toca campo cifrado.
 */

export interface ObjetivoClaro {
  id: string
  nome: string
  meta: number
  guardado: number
  criadoEm: Date
  atualizadoEm: Date
}

type Linha = {
  id: string
  userId: string
  nome: string
  meta: string
  guardado: string
  criadoEm: Date
  atualizadoEm: Date
}

function abrir(l: Linha): ObjetivoClaro {
  return {
    id: l.id,
    nome: decifrar(l.nome, l.userId, "nome"),
    meta: decifrarNumero(l.meta, l.userId, "meta"),
    guardado: decifrarNumero(l.guardado, l.userId, "guardado"),
    criadoEm: l.criadoEm,
    atualizadoEm: l.atualizadoEm,
  }
}

export async function listarObjetivos(userId: string): Promise<ObjetivoClaro[]> {
  const linhas = await db.objetivo.findMany({
    where: { userId },
    orderBy: { criadoEm: "asc" },
  })
  return (linhas as Linha[]).map(abrir)
}

export async function criarObjetivo(
  userId: string,
  d: { nome: string; meta: number }
): Promise<ObjetivoClaro> {
  const linha = await db.objetivo.create({
    data: {
      userId,
      nome: cifrar(d.nome, userId, "nome"),
      meta: cifrarNumero(d.meta, userId, "meta"),
      guardado: cifrarNumero(0, userId, "guardado"),
    },
  })
  return abrir(linha as Linha)
}

/**
 * Soma `valor` ao guardado do objetivo. Lê, decifra, soma e regrava — o
 * incremento não dá para fazer no banco porque o campo é cifrado. O updateMany
 * condicionado ao `atualizadoEm` lido impede que duas escritas simultâneas se
 * atropelem (a perdedora não sobrescreve, relê e re-aplica) — e toque rápido
 * repetido no "+ Guardar" é o caso NORMAL desta tela, não o raro: sem o laço
 * de retentativa, o segundo toque de uma rajada morria com "não encontrado".
 * `null` só quando o objetivo realmente não existe (ou não é da pessoa).
 */
export async function guardarNoObjetivo(
  userId: string,
  id: string,
  valor: number
): Promise<ObjetivoClaro | null> {
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const linha = (await db.objetivo.findFirst({ where: { id, userId } })) as Linha | null
    if (!linha) return null

    const atual = decifrarNumero(linha.guardado, userId, "guardado")
    const novo = Math.round((atual + valor) * 100) / 100

    const r = await db.objetivo.updateMany({
      where: { id, userId, atualizadoEm: linha.atualizadoEm },
      data: { guardado: cifrarNumero(novo, userId, "guardado") },
    })
    if (r.count > 0) return { ...abrir(linha), guardado: novo }
  }
  // 3 conflitos seguidos num dado de uma pessoa só: algo muito estranho.
  return null
}
