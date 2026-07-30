import { db } from "@/lib/db"
import { cifrar, decifrar } from "@/lib/cripto"

/**
 * Ponto único de entrada/saída da memória do assistente.
 *
 * Mesmo motivo do lib/financeiro-repo.ts: se uma rota esquecer de decifrar, a
 * pessoa lê "v1.VQ3H…" na tela; se esquecer de cifrar, entra em claro no banco
 * e a camada de segurança vira enfeite. Concentrar aqui faz disso uma decisão
 * de um arquivo só.
 *
 * O conteúdo daqui é MAIS sensível que valor de transação — pode conter "estou
 * desempregada", "meu pai está doente", "vou me separar". Por isso é cifrado
 * com AAD amarrando ao dono e ao campo, e por isso a memória nasce DESLIGADA.
 */

export const TIPOS_MEMORIA = ["situacao", "plano", "preferencia", "compromisso"] as const
export type TipoMemoria = (typeof TIPOS_MEMORIA)[number]

/** Rótulos que a pessoa lê na tela. */
export const ROTULO_TIPO: Record<TipoMemoria, string> = {
  situacao: "Situação",
  plano: "Plano",
  preferencia: "Preferência",
  compromisso: "Compromisso",
}

export interface Memoria {
  id: string
  tipo: TipoMemoria
  conteudo: string
  origem: string
  criadoEm: Date
}

/**
 * Teto de memórias por pessoa.
 *
 * Não é economia de banco — é qualidade de resposta e de privacidade. Memória
 * que cresce sem limite vira ruído no prompt (o modelo passa a pesar igual "sou
 * autônoma" e "gosto de café") e acumula histórico pessoal que ninguém pediu
 * para guardar para sempre. Ao estourar, a mais antiga sai.
 */
const TETO = 60
const TAMANHO_MAXIMO = 240

function ehTipo(v: unknown): v is TipoMemoria {
  return typeof v === "string" && (TIPOS_MEMORIA as readonly string[]).includes(v)
}

export async function memoriaLigada(userId: string): Promise<boolean> {
  const u = await db.user.findUnique({ where: { id: userId }, select: { memoriaAtiva: true } })
  return u?.memoriaAtiva === true
}

export async function listarMemorias(userId: string): Promise<Memoria[]> {
  const linhas = await db.memoriaUsuario.findMany({
    where: { userId },
    orderBy: { criadoEm: "desc" },
    take: TETO,
  })
  return linhas.map((l) => ({
    id: l.id,
    tipo: ehTipo(l.tipo) ? l.tipo : "situacao",
    conteudo: decifrar(l.conteudo, userId, "memoria"),
    origem: l.origem,
    criadoEm: l.criadoEm,
  }))
}

export interface NovaMemoria {
  tipo: TipoMemoria
  conteudo: string
  origem?: string
}

/**
 * Grava o que for novo e devolve só o que entrou de fato.
 *
 * A deduplicação é por texto normalizado. Sem ela a memória enche de variações
 * da mesma frase: o modelo tende a "re-lembrar" o que já sabe a cada conversa,
 * e em duas semanas metade dos registros seria a mesma coisa escrita de seis
 * jeitos.
 */
export async function guardarMemorias(userId: string, novas: NovaMemoria[]): Promise<Memoria[]> {
  if (novas.length === 0) return []

  const existentes = await listarMemorias(userId)
  const jaTem = new Set(existentes.map((m) => normalizar(m.conteudo)))

  const aCriar: NovaMemoria[] = []
  for (const n of novas) {
    const conteudo = n.conteudo.trim().slice(0, TAMANHO_MAXIMO)
    if (conteudo.length < 8) continue
    const chave = normalizar(conteudo)
    if (jaTem.has(chave)) continue
    jaTem.add(chave)
    aCriar.push({ tipo: n.tipo, conteudo, origem: n.origem ?? "ia" })
  }
  if (aCriar.length === 0) return []

  await db.memoriaUsuario.createMany({
    data: aCriar.map((m) => ({
      userId,
      tipo: m.tipo,
      conteudo: cifrar(m.conteudo, userId, "memoria"),
      origem: m.origem ?? "ia",
    })),
  })

  await podar(userId)

  // Relê em vez de devolver o que foi montado: assim o id e a data vêm do
  // banco, e o que a tela mostra é o que ficou gravado de verdade.
  const depois = await listarMemorias(userId)
  const novasChaves = new Set(aCriar.map((m) => normalizar(m.conteudo)))
  return depois.filter((m) => novasChaves.has(normalizar(m.conteudo)))
}

export async function apagarMemoria(userId: string, id: string): Promise<boolean> {
  // deleteMany e não delete: o filtro por userId impede apagar memória de
  // outra pessoa mandando um id adivinhado.
  const r = await db.memoriaUsuario.deleteMany({ where: { id, userId } })
  return r.count > 0
}

export async function apagarTudo(userId: string): Promise<number> {
  const r = await db.memoriaUsuario.deleteMany({ where: { userId } })
  return r.count
}

/**
 * Chave de comparação para deduplicar: minúsculas, sem acento, sem pontuação.
 *
 * NFD separa o acento da letra ("ç" vira "c" mais a cedilha solta) e o filtro
 * seguinte descarta tudo que não for a-z0-9 ou espaço — inclusive essas marcas.
 * Por isso não existe um replace só para acento: seria redundante.
 */
function normalizar(t: string): string {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/** Mantém no máximo TETO registros, descartando os mais antigos. */
async function podar(userId: string): Promise<void> {
  const total = await db.memoriaUsuario.count({ where: { userId } })
  if (total <= TETO) return
  const excedente = await db.memoriaUsuario.findMany({
    where: { userId },
    orderBy: { criadoEm: "asc" },
    take: total - TETO,
    select: { id: true },
  })
  await db.memoriaUsuario.deleteMany({ where: { id: { in: excedente.map((e) => e.id) } } })
}
