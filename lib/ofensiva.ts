import { db } from "@/lib/db"
import { creditar, inicioDoDiaSP } from "@/lib/pontos"
import { Prisma } from "@prisma/client"

/**
 * A ofensiva: dias seguidos usando o app.
 *
 * DERIVADA, nunca acumulada. Cada dia de uso vira uma linha em `DiaAtivo` e a
 * contagem é feita andando para trás a partir de hoje. Um contador em `User`
 * seria mais barato e teria o defeito dos pontos antes da tabela de eventos:
 * não saber se já contou, e ficar errado para sempre quando uma escrita se
 * perde.
 *
 * O DIA É EM SÃO PAULO
 * A Vercel roda em UTC. Contar por dia UTC faria a ofensiva virar às 21h de
 * Brasília: quem abrisse o app às 22h estaria "no dia seguinte", e o dia em
 * que ela de fato usou ficaria sem marca. `inicioDoDiaSP` já existe por causa
 * do mesmo problema no teto diário de pontos.
 *
 * ONTEM AINDA CONTA
 * Quem usou ontem e ainda não abriu hoje continua vendo a ofensiva de pé. Ela
 * só zera quando um dia inteiro passa em branco — zerar à meia-noite puniria
 * a pessoa por dormir.
 */

/** Quantos dias para trás a contagem olha. Ofensiva maior que isso é rara e
 *  o corte evita carregar anos de linhas para desenhar um número. */
const JANELA_DIAS = 400

/** Cada bloco de 7 dias seguidos paga uma vez. */
const DIAS_POR_PREMIO = 7

/** A data de hoje em São Paulo, à meia-noite, como o banco guarda. */
export function diaDeHoje(agora: Date = new Date()): Date {
  return inicioDoDiaSP(agora)
}

/** Distância em dias entre duas datas de dia (ambas à meia-noite SP). */
function distanciaEmDias(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86_400_000)
}

export interface Ofensiva {
  /** Dias seguidos até hoje (ou até ontem, se hoje ainda não teve uso). */
  atual: number
  /** A maior sequência já alcançada. */
  recorde: number
  /** A pessoa já usou o app hoje? A tela usa para dizer "não perca". */
  hoje: boolean
}

/**
 * Conta a ofensiva a partir dos dias registrados.
 *
 * Pura em relação ao relógio: `agora` entra por parâmetro para a bateria
 * congelar o tempo em vez de esperar a meia-noite.
 */
export function contarOfensiva(dias: Date[], agora: Date = new Date()): Ofensiva {
  if (dias.length === 0) return { atual: 0, recorde: 0, hoje: false }

  // Do mais recente para o mais antigo, sem repetidos.
  const ordenados = [...new Set(dias.map((d) => d.getTime()))].sort((a, b) => b - a)
  const hojeMs = diaDeHoje(agora).getTime()
  const hoje = ordenados[0] === hojeMs

  // A ofensiva atual só existe se o dia mais recente for hoje ou ontem.
  let atual = 0
  const distanciaDoTopo = Math.round((hojeMs - ordenados[0]!) / 86_400_000)
  if (distanciaDoTopo <= 1) {
    atual = 1
    for (let i = 1; i < ordenados.length; i++) {
      if (Math.round((ordenados[i - 1]! - ordenados[i]!) / 86_400_000) === 1) atual++
      else break
    }
  }

  // O recorde percorre a lista inteira, não só a ponta.
  let recorde = 1
  let corrente = 1
  for (let i = 1; i < ordenados.length; i++) {
    if (Math.round((ordenados[i - 1]! - ordenados[i]!) / 86_400_000) === 1) corrente++
    else corrente = 1
    if (corrente > recorde) recorde = corrente
  }

  return { atual, recorde: Math.max(recorde, atual), hoje }
}

/** Lê a ofensiva de alguém, sem gravar nada. */
export async function lerOfensiva(userId: string, agora: Date = new Date()): Promise<Ofensiva> {
  const corte = new Date(diaDeHoje(agora).getTime() - JANELA_DIAS * 86_400_000)
  const linhas = await db.diaAtivo.findMany({
    where: { userId, dia: { gte: corte } },
    select: { dia: true },
    orderBy: { dia: "desc" },
  })
  return contarOfensiva(linhas.map((l) => l.dia), agora)
}

export interface HistoricoOfensiva extends Ofensiva {
  /**
   * Cada dia ativo como "YYYY-MM-DD". A tela de histórico desenha o calendário
   * a partir daqui; a chave de data (e não o Date cru) evita o descasamento de
   * fuso entre o `@db.Date` (volta à meia-noite UTC) e a meia-noite de SP.
   */
  chaves: string[]
  /** Quantos dias distintos a pessoa esteve ativa dentro da janela. */
  total: number
  /** Dias que faltam para fechar o próximo bloco de 7 (o prêmio da semana). */
  ateProximoPremio: number
  /** Quantos prêmios de semana a ofensiva atual já rendeu. */
  premios: number
}

/**
 * A ofensiva mais o histórico de dias, para a tela dedicada.
 *
 * Usa a MESMA janela e a MESMA contagem de `lerOfensiva` — só acrescenta a
 * lista de dias e os números derivados do prêmio, sem uma segunda consulta.
 */
export async function lerHistoricoOfensiva(
  userId: string,
  agora: Date = new Date()
): Promise<HistoricoOfensiva> {
  const corte = new Date(diaDeHoje(agora).getTime() - JANELA_DIAS * 86_400_000)
  const linhas = await db.diaAtivo.findMany({
    where: { userId, dia: { gte: corte } },
    select: { dia: true },
    orderBy: { dia: "desc" },
  })
  const ofensiva = contarOfensiva(linhas.map((l) => l.dia), agora)
  const chaves = [...new Set(linhas.map((l) => l.dia.toISOString().slice(0, 10)))]
  const resto = ofensiva.atual % DIAS_POR_PREMIO
  return {
    ...ofensiva,
    chaves,
    total: chaves.length,
    ateProximoPremio: resto === 0 ? DIAS_POR_PREMIO : DIAS_POR_PREMIO - resto,
    premios: Math.floor(ofensiva.atual / DIAS_POR_PREMIO),
  }
}

/**
 * Marca que a pessoa usou o app hoje e devolve a ofensiva já atualizada.
 *
 * Chamada em toda visualização de página logada. O caminho comum é o de quem
 * já abriu o app hoje: aí o `create` bate na chave única, não faz nada, e a
 * função só conta. Nenhuma escrita repetida por requisição.
 *
 * O PRÊMIO SÓ SAI EM DIA NOVO. `creditar` já é idempotente pelo refId, mas
 * pagar dentro do `if` evita a consulta de crédito em toda navegação.
 */
export async function registrarDiaAtivo(
  userId: string,
  agora: Date = new Date()
): Promise<Ofensiva & { diaNovo: boolean }> {
  const hoje = diaDeHoje(agora)
  let diaNovo = false

  try {
    await db.diaAtivo.create({ data: { userId, dia: hoje } })
    diaNovo = true
  } catch (e) {
    // P2002 = já havia linha para hoje. É o caso NORMAL, não uma falha.
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e
  }

  const ofensiva = await lerOfensiva(userId, agora)

  if (diaNovo && ofensiva.atual > 0 && ofensiva.atual % DIAS_POR_PREMIO === 0) {
    /**
     * refId é a DATA em que a marca foi batida, não o número de dias.
     *
     * Com o número, quem perdesse a ofensiva e reconstruísse até 7 não
     * receberia de novo — a chave única veria "7" já pago e a segunda
     * conquista sairia de graça para o app. Com a data, cada 7º dia paga uma
     * vez, e recomeçar do zero volta a valer.
     */
    await creditar(userId, "streak_semana", hoje.toISOString().slice(0, 10)).catch((erro) =>
      console.warn("[ofensiva] ponto:", (erro as Error)?.message)
    )
  }

  // `diaNovo` sai junto (Redesign Fin): é o gatilho do pop-up de lição diária
  // — "primeira visita do dia", que ofensiva.hoje sozinho não distingue,
  // porque o registro acima acabou de marcar o dia. Aditivo: quem só quer a
  // ofensiva ignora o campo.
  return { ...ofensiva, diaNovo }
}
