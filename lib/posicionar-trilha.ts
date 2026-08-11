import { db } from "@/lib/db"
import { listarTransacoes } from "@/lib/financeiro-repo"
import { metricasPerfil, nivelDeTrilha } from "@/lib/financas"
import { filtroDeModulo, publicoDoUsuario } from "@/lib/publico"
import {
  derivarSituacoes,
  mesclarSituacoes,
  pontuarAula,
  type Situacao,
} from "@/lib/situacoes"

/**
 * Quem escolhe as aulas de alguém.
 *
 * O EIXO MUDOU. Antes era o perfil: `slugsDaTrilha(perfil.tipo)` devolvia os 4
 * módulos da trilha "lancador" e pronto. Agora é a SITUAÇÃO de quem chega
 * cruzada com o nível, e a biblioteca inteira concorre.
 *
 * O que isso resolve na prática: uma pessoa endividada e sem reserva recebia 4
 * aulas de "lancador" porque foi rotulada assim numa conversa, mesmo que a aula
 * mais útil para ela estivesse na trilha do "impulsivo". Perfil vira contexto do
 * chat, não roteador.
 *
 * Fica separado de `lib/recomendacao.ts` de propósito: lá está a REGRA do
 * gatilho, que precisa ser testável sem tocar em repositório nem em número
 * cifrado. Aqui é a composição, que precisa dos dois.
 */

export interface Posicao {
  nivel: string
  situacoes: Situacao[]
}

/**
 * Onde a pessoa está: o que os números mostram, mais o que ela contou.
 *
 * `financiamento` e `dependentes` não têm sinal no extrato e só chegam pela
 * conversa — ficam guardados em `Onboarding.situacoes` e entram por aqui.
 */
export async function posicaoDaPessoa(userId: string): Promise<Posicao> {
  const [calc, onboarding] = await Promise.all([
    listarTransacoes(userId, { comCategoria: true }),
    db.onboarding.findUnique({ where: { userId }, select: { situacoes: true } }),
  ])

  const metricas = metricasPerfil(calc)
  return {
    nivel: nivelDeTrilha(metricas),
    situacoes: mesclarSituacoes(derivarSituacoes(calc, metricas), onboarding?.situacoes ?? []),
  }
}

/**
 * As aulas que melhor respondem à situação de quem chega.
 *
 * Devolve slugs em ordem de encaixe. Empate cai para a ordem do módulo, que é
 * a sequência pedagógica de dentro de cada trilha — assim duas aulas igualmente
 * pertinentes ainda chegam na ordem que faz sentido aprender.
 */
export async function aulasParaSituacao(
  userId: string,
  quantas: number
): Promise<string[]> {
  const [posicao, perfil] = await Promise.all([
    posicaoDaPessoa(userId),
    db.perfil.findUnique({ where: { userId }, select: { tipo: true } }),
  ])

  const modulos = await db.modulo.findMany({
    where: filtroDeModulo(await publicoDoUsuario(userId)),
    select: { slug: true, nivel: true, situacoes: true, ordem: true, tipoPerfil: true },
    orderBy: [{ tipoPerfil: "asc" }, { ordem: "asc" }],
  })

  /**
   * O perfil entra como DESEMPATE, nunca como decisão.
   *
   * O backlog é claro: os quatro perfis não roteiam. E não roteiam — situação
   * e nível decidem sozinhos, e nenhuma aula sobe de posição por causa do
   * rótulo. Mas medindo nas contas reais apareceu uma perda que a regra pura
   * causava: quatro pessoas com a mesma situação recebiam as mesmas quatro
   * aulas, e quem tinha contado na conversa que vive de planos deixava de ver
   * qualquer aula de meta, porque o rótulo passou a não valer nada.
   *
   * Deixar o perfil quebrar EMPATE resolve os dois sem devolver o roteamento:
   * entre duas aulas que respondem igualmente bem à situação, ganha a que
   * conversa com o que a pessoa disse. Nunca ganha de uma aula mais pertinente.
   */
  const meuPerfil = perfil?.tipo ?? null

  return modulos
    .map((m) => ({
      slug: m.slug,
      ordem: m.ordem,
      nota: pontuarAula(m, posicao),
      doMeuPerfil: meuPerfil !== null && m.tipoPerfil === meuPerfil ? 1 : 0,
    }))
    .sort((a, b) => b.nota - a.nota || b.doMeuPerfil - a.doMeuPerfil || a.ordem - b.ordem)
    .slice(0, quantas)
    .map((m) => m.slug)
}

/**
 * Grava a situação derivada no Onboarding.
 *
 * Só ACRESCENTA o que os números mostram: o que a pessoa contou nunca é
 * apagado por um recálculo. Se o extrato dela mudar e `renda_variavel` deixar
 * de aparecer nos números, `dependentes` continua lá — ninguém deixa de ter
 * filho porque o extrato mudou.
 */
export async function guardarSituacoes(userId: string): Promise<Situacao[]> {
  const posicao = await posicaoDaPessoa(userId)
  await db.onboarding.updateMany({
    where: { userId },
    data: { situacoes: posicao.situacoes, nivelInferido: posicao.nivel },
  })
  return posicao.situacoes
}
