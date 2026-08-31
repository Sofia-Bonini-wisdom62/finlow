import "server-only"
import { db } from "@/lib/db"
import { acessoPremium, type OrigemPremium } from "@/lib/pagamento/acesso"

/**
 * O limite grátis, contado em TOKENS.
 *
 * POR QUE TOKEN E NÃO MENSAGEM
 * Decisão da Sofia. Mensagem não mede nada: uma pergunta de três palavras e uma
 * conversa de vinte turnos sobre o extrato inteiro contam igual, e é a segunda
 * que custa. O contexto financeiro que vai em cada chamada é o grosso do gasto,
 * então o token é o que corresponde ao que a gente paga.
 *
 * O TETO PODE SER ESTOURADO POR UMA CHAMADA, DE PROPÓSITO
 * O guard roda ANTES da chamada e não há como saber o custo de uma resposta
 * antes de recebê-la. Então quem está em 99% do teto ganha a última resposta
 * inteira e só depois bate na parede. Estimar para cortar antes erraria nos dois
 * sentidos e cortaria no meio de uma resposta já começada — pior experiência
 * por alguns centavos.
 */

/**
 * 120 mil tokens por mês.
 *
 * A régua vem do que o doc pedia (15 mensagens grátis) traduzida para a moeda
 * certa: uma conversa de chat gasta ~5 a 8 mil tokens de entrada, porque o
 * contexto financeiro inteiro vai em cada turno, mais a resposta. 15 turnos dão
 * algo perto de 100 mil. 120 mil deixa a conta com folga para quem escreve
 * pergunta longa, e ainda cabe num custo de aquisição aceitável.
 *
 * Muda aqui e muda em todo lugar: ninguém mais tem esse número escrito.
 */
export const TETO_GRATIS_TOKENS = 120_000

/**
 * 300 mil tokens por mês para quem é premium PELA ESCOLA (Finlow para
 * Escolas) — 2,5× o grátis, e não Infinity de propósito: uma escola de 500
 * alunos com chat sem teto é custo de token sem contrato que o cubra. O
 * assinante que paga do próprio bolso continua sem teto.
 *
 * O número é afinável como PESO_FORA_DA_TRILHA: muda aqui e muda em todo
 * lugar. A decisão de derrubar o teto é da fundadora e está registrada em
 * docs/backlog-produto.md.
 */
export const TETO_ESCOLA_TOKENS = 300_000

/**
 * 360 mil tokens por mês para quem é premium POR ASSINATURA PRÓPRIA. 3×
 * o grátis (decisão da fundadora, 20/08/2026: teto, não Infinity) porque
 * conta sem teto nenhum é conta de Vertex sem parede, e uma única conta
 * abusiva vira o custo de centenas de assinantes normais. 3× dá folga real
 * para quem usa o Fin todo dia, sem ser um cheque em branco.
 *
 * Maior que TETO_ESCOLA_TOKENS de propósito, mas por pouco: quem paga do
 * próprio bolso tem mais folga que quem entra pela escola.
 *
 * O número é afinável como TETO_ESCOLA_TOKENS: muda aqui e muda em todo lugar.
 */
export const TETO_PREMIUM_TOKENS = TETO_GRATIS_TOKENS * 3

/** As origens de IA que consomem a cota. */
export type OrigemIA = "chat" | "onboarding" | "recomendacao" | "insights" | "extrato"

/**
 * "AAAA-MM" no fuso de São Paulo.
 *
 * Mesma armadilha de `inicioDoDiaSP`: a Vercel roda em UTC, e contar o mês em
 * UTC faria a cota virar às 21h do dia 31 — quem conversasse às 22h estaria
 * gastando a cota do mês seguinte. O -03:00 é fixo desde que o Brasil acabou
 * com o horário de verão em 2019.
 */
export function mesSP(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
  }).format(agora)
}

export interface Cota {
  premium: boolean
  /** Por qual porta a pessoa é premium — null quando não é. */
  origem: OrigemPremium | null
  usados: number
  teto: number
  restam: number
  /** `false` quando a cota acabou. */
  podeUsar: boolean
}

/** Quanto esta pessoa já gastou no mês corrente. */
export async function tokensDoMes(userId: string, agora = new Date()): Promise<number> {
  const linha = await db.usoMensalIA.findUnique({
    where: { userId_mes: { userId, mes: mesSP(agora) } },
    select: { tokensEntrada: true, tokensSaida: true },
  })
  return (linha?.tokensEntrada ?? 0) + (linha?.tokensSaida ?? 0)
}

/**
 * A cota da pessoa: usada pelo guard E pela tela.
 *
 * Todo mundo tem teto, inclusive quem assina — só o tamanho muda:
 * TETO_PREMIUM_TOKENS (assinatura própria) > TETO_ESCOLA_TOKENS (pela escola)
 * > TETO_GRATIS_TOKENS. Antes de 20/08/2026 o assinante era `Infinity`; virou
 * teto finito porque conta sem parede é custo de Vertex sem dono.
 */
export async function cotaDoMes(userId: string, agora = new Date()): Promise<Cota> {
  const [acesso, usados] = await Promise.all([
    acessoPremium(userId, agora),
    tokensDoMes(userId, agora),
  ])

  const teto =
    acesso.origem === "assinatura"
      ? TETO_PREMIUM_TOKENS
      : acesso.origem === "escola"
        ? TETO_ESCOLA_TOKENS
        : TETO_GRATIS_TOKENS
  return {
    premium: acesso.premium,
    origem: acesso.origem,
    usados,
    teto,
    restam: Math.max(0, teto - usados),
    podeUsar: usados < teto,
  }
}

/**
 * Soma o gasto de uma chamada na cota do mês.
 *
 * NUNCA LANÇA, e isso é escolha: a resposta já foi gerada e já foi paga. Perder
 * a contagem de um turno custa alguns tokens; engolir uma resposta pronta por
 * causa de um `upsert` que falhou custa a confiança de quem perguntou. Mesma
 * razão pela qual guardar memória e guardar o turno também não derrubam o chat.
 *
 * O `upsert` é atômico na chave única `[userId, mes]`: duas chamadas do mesmo
 * usuário ao mesmo tempo somam as duas em vez de uma sobrescrever a outra —
 * seria o caso se isto fosse um `findUnique` seguido de `update`.
 */
export async function somarUso(
  userId: string,
  origem: OrigemIA,
  uso: { entrada: number; saida: number },
  agora = new Date()
): Promise<void> {
  try {
    if (uso.entrada <= 0 && uso.saida <= 0) return
    const mes = mesSP(agora)
    await db.usoMensalIA.upsert({
      where: { userId_mes: { userId, mes } },
      create: {
        userId,
        mes,
        tokensEntrada: uso.entrada,
        tokensSaida: uso.saida,
        chamadas: 1,
      },
      update: {
        tokensEntrada: { increment: uso.entrada },
        tokensSaida: { increment: uso.saida },
        chamadas: { increment: 1 },
      },
    })
  } catch (e) {
    console.error(`[tokens] falha ao somar uso de ${origem}:`, (e as Error)?.message)
  }
}
