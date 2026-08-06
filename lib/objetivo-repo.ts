import { db } from "@/lib/db"
import { cifrar, cifrarNumero, decifrar, decifrarNumero } from "@/lib/cripto"

/**
 * Ponto único de entrada/saída dos objetivos — mesma razão do
 * investimento-repo: `nome`, `valorAlvo` e `valorGuardado` são cifrados, e
 * rota que fala com db.objetivo direto lê "v1.…" e soma zero em silêncio.
 * Só deleteMany pode ir direto: apagar não toca campo cifrado.
 */

/** Alvo maior que isto é dedo escorregado no teclado, não sonho. */
export const ALVO_ABSURDO = 100_000_000

export interface ObjetivoClaro {
  id: string
  nome: string
  emoji: string | null
  valorAlvo: number
  valorGuardado: number
  /** Derivados: quem exibe não recalcula, e o chat lê os mesmos números. */
  restante: number
  pct: number
  prazo: Date | null
  concluidoEm: Date | null
  criadoEm: Date
  atualizadoEm: Date
}

type Linha = {
  id: string
  userId: string
  nome: string
  emoji: string | null
  valorAlvo: string
  valorGuardado: string
  prazo: Date | null
  concluidoEm: Date | null
  criadoEm: Date
  atualizadoEm: Date
}

/**
 * Quanto falta e quanto por cento — a conta que a tela mostra.
 *
 * Exportada porque é o que o teste consegue verificar sem banco, e porque
 * errar aqui não quebra nada: entrega um número errado com toda a calma.
 */
export function derivados(valorAlvo: number, valorGuardado: number): { restante: number; pct: number } {
  return {
    // Não fica negativo nem passa de 100: aqui, diferente do teto de orçamento,
    // estourar não é informação — guardar mais que o alvo é só ter chegado lá.
    restante: Math.max(0, Math.round((valorAlvo - valorGuardado) * 100) / 100),
    pct: valorAlvo > 0 ? Math.min(100, Math.max(0, Math.round((valorGuardado / valorAlvo) * 100))) : 0,
  }
}

function abrir(l: Linha): ObjetivoClaro {
  const valorAlvo = decifrarNumero(l.valorAlvo, l.userId, "valorAlvo")
  const valorGuardado = decifrarNumero(l.valorGuardado, l.userId, "valorGuardado")
  return {
    id: l.id,
    nome: decifrar(l.nome, l.userId, "nome"),
    emoji: l.emoji,
    valorAlvo,
    valorGuardado,
    ...derivados(valorAlvo, valorGuardado),
    prazo: l.prazo,
    concluidoEm: l.concluidoEm,
    criadoEm: l.criadoEm,
    atualizadoEm: l.atualizadoEm,
  }
}

/**
 * Ordem da tela: o que ainda está de pé primeiro, depois o mais urgente.
 *
 * A ordenação é feita aqui e não no banco por causa dos nulos. Objetivo sem
 * prazo é comum de propósito, e num ORDER BY ele viria antes de tudo (Postgres
 * ordena NULL primeiro no ASC) — o sonho sem data empurraria para baixo
 * justamente o que vence semana que vem. São poucas linhas por pessoa; ordenar
 * em memória custa menos que a cláusula que acerta isso.
 */
export function ordenar(a: ObjetivoClaro, b: ObjetivoClaro): number {
  const concluido = Number(!!a.concluidoEm) - Number(!!b.concluidoEm)
  if (concluido !== 0) return concluido
  if (a.prazo && b.prazo) return a.prazo.getTime() - b.prazo.getTime()
  if (a.prazo) return -1
  if (b.prazo) return 1
  return a.criadoEm.getTime() - b.criadoEm.getTime()
}

export async function listarObjetivos(userId: string): Promise<ObjetivoClaro[]> {
  const linhas = await db.objetivo.findMany({ where: { userId } })
  return (linhas as Linha[]).map(abrir).sort(ordenar)
}

export async function criarObjetivo(
  userId: string,
  d: { nome: string; emoji: string | null; valorAlvo: number; valorGuardado?: number; prazo: Date | null }
): Promise<ObjetivoClaro> {
  const guardado = d.valorGuardado ?? 0
  const linha = await db.objetivo.create({
    data: {
      userId,
      nome: cifrar(d.nome, userId, "nome"),
      emoji: d.emoji,
      valorAlvo: cifrarNumero(d.valorAlvo, userId, "valorAlvo"),
      valorGuardado: cifrarNumero(guardado, userId, "valorGuardado"),
      prazo: d.prazo,
      concluidoEm: guardado >= d.valorAlvo ? new Date() : null,
    },
  })
  return abrir(linha as Linha)
}

export async function atualizarObjetivo(
  userId: string,
  id: string,
  d: Partial<{ nome: string; emoji: string | null; valorAlvo: number; prazo: Date | null }>
): Promise<ObjetivoClaro | null> {
  // O objetivo é lido antes porque baixar o alvo pode CONCLUIR o que já estava
  // guardado, e subir pode desconcluir — a conclusão é derivada dos dois
  // valores, e um updateMany cego deixaria o carimbo mentindo.
  const atual = (await db.objetivo.findFirst({ where: { id, userId } })) as Linha | null
  if (!atual) return null

  const alvo = d.valorAlvo ?? decifrarNumero(atual.valorAlvo, userId, "valorAlvo")
  const guardado = decifrarNumero(atual.valorGuardado, userId, "valorGuardado")

  const linha = await db.objetivo.update({
    where: { id: atual.id },
    data: {
      ...(d.nome !== undefined ? { nome: cifrar(d.nome, userId, "nome") } : {}),
      ...(d.emoji !== undefined ? { emoji: d.emoji } : {}),
      ...(d.valorAlvo !== undefined ? { valorAlvo: cifrarNumero(d.valorAlvo, userId, "valorAlvo") } : {}),
      ...(d.prazo !== undefined ? { prazo: d.prazo } : {}),
      concluidoEm: carimbo(guardado, alvo, atual.concluidoEm),
    },
  })
  return abrir(linha as Linha)
}

/**
 * Move o quanto já foi separado. `delta` positivo guarda, negativo tira.
 *
 * É read-modify-write porque o valor está cifrado: não existe `increment` que
 * o banco saiba fazer sobre "v1.…". Duas abas somando ao mesmo tempo podem
 * perder um dos lançamentos, e isso é aceito — o custo de errar aqui é um
 * número que a pessoa reescreve, não dinheiro movido, e a alternativa
 * (guardar em claro para o banco poder somar) entregaria o valor do sonho a
 * quem lesse a tabela.
 */
export async function guardarNoObjetivo(
  userId: string,
  id: string,
  delta: number
): Promise<ObjetivoClaro | null> {
  const atual = (await db.objetivo.findFirst({ where: { id, userId } })) as Linha | null
  if (!atual) return null

  const alvo = decifrarNumero(atual.valorAlvo, userId, "valorAlvo")
  const antes = decifrarNumero(atual.valorGuardado, userId, "valorGuardado")
  // Guardado nunca fica negativo: tirar mais do que tem zera, não deve.
  const depois = Math.max(0, Math.round((antes + delta) * 100) / 100)

  const linha = await db.objetivo.update({
    where: { id: atual.id },
    data: {
      valorGuardado: cifrarNumero(depois, userId, "valorGuardado"),
      concluidoEm: carimbo(depois, alvo, atual.concluidoEm),
    },
  })
  return abrir(linha as Linha)
}

/**
 * Conclusão é estado derivado, não botão.
 *
 * Alcançou o alvo, carimba; caiu abaixo (tirou dinheiro, ou subiu o alvo),
 * apaga o carimbo. O carimbo antigo é preservado enquanto continuar alcançado
 * para não mudar de data a cada edição de nome.
 */
export function carimbo(guardado: number, alvo: number, atual: Date | null): Date | null {
  if (guardado >= alvo) return atual ?? new Date()
  return null
}

export async function apagarObjetivo(userId: string, id: string): Promise<boolean> {
  // deleteMany direto é permitido: apagar não toca campo cifrado.
  const r = await db.objetivo.deleteMany({ where: { id, userId } })
  return r.count > 0
}

/** Uma linha só sobre a fila inteira — o que o topo da tela e o chat mostram. */
export function resumirObjetivos(objetivos: ObjetivoClaro[]) {
  const abertos = objetivos.filter((o) => !o.concluidoEm)
  return {
    total: objetivos.length,
    concluidos: objetivos.length - abertos.length,
    alvoAberto: arredondar(abertos.reduce((s, o) => s + o.valorAlvo, 0)),
    guardadoAberto: arredondar(abertos.reduce((s, o) => s + o.valorGuardado, 0)),
    restanteAberto: arredondar(abertos.reduce((s, o) => s + o.restante, 0)),
  }
}

function arredondar(n: number): number {
  return Math.round(n * 100) / 100
}
