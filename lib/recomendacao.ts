import { db } from "@/lib/db"

/**
 * A trilha recomendada, gravada, e o gatilho que gera a próxima leva.
 *
 * O QUE MUDA EM RELAÇÃO AO QUE JÁ EXISTIA
 * `/api/modulos` monta a recomendação na hora, dos números do momento. Isso
 * serve para exibir, mas não serve para MEDIR: o gatilho da §2.7 dispara ao
 * concluir X% da trilha recomendada, e uma lista que se remonta muda de tamanho
 * junto com o extrato da pessoa. A porcentagem perseguiria um alvo móvel.
 *
 * Então a leva vira linha no banco. O que está gravado é o que conta.
 *
 * POR QUE O GATILHO NÃO SE REPETE SOZINHO
 * A leva nova ENTRA na conta do denominador. Com limiar de 60%: 5 aulas e 3
 * concluídas dá 60%, dispara, viram 9 aulas e 3 concluídas, que dá 33%. A
 * própria geração empurra a porcentagem para baixo do limiar. Não precisa de
 * trava, flag nem cooldown — o número se resolve.
 */

/** 60%: exigir 100% deixaria de fora quem pula uma aula e nunca mais recebe
 *  leva nova. Três de cinco já mostra que a pessoa está andando. */
export const LIMIAR_NOVA_LEVA = 0.6

/** Quantas aulas a leva nova traz, conforme a §2.7 ("recomenda +4"). */
export const TAMANHO_DA_LEVA = 4

export interface Recomendada {
  id: string
  moduloId: string
  slug: string
  titulo: string
  subtitulo: string
  motivo: string
  origem: string
  concluido: boolean
  entregueEm: Date | null
}

/** Tudo que já foi recomendado a esta pessoa, com o estado de cada uma. */
export async function levaAtual(userId: string): Promise<Recomendada[]> {
  const [recs, progresso] = await Promise.all([
    db.recomendacaoTrilha.findMany({
      where: { userId },
      orderBy: [{ criadoEm: "asc" }, { ordem: "asc" }],
      select: {
        id: true, moduloId: true, motivo: true, origem: true, entregueEm: true,
        modulo: { select: { slug: true, titulo: true, subtitulo: true } },
      },
    }),
    db.progressoModulo.findMany({
      where: { userId, concluido: true },
      select: { moduloId: true },
    }),
  ])

  const concluidos = new Set(progresso.map((p) => p.moduloId))
  return recs.map((r) => ({
    id: r.id,
    moduloId: r.moduloId,
    slug: r.modulo.slug,
    titulo: r.modulo.titulo,
    subtitulo: r.modulo.subtitulo,
    motivo: r.motivo,
    origem: r.origem,
    entregueEm: r.entregueEm,
    concluido: concluidos.has(r.moduloId),
  }))
}

/**
 * Grava a primeira leva, se ainda não existir.
 *
 * Recebe os slugs de fora (de `/api/modulos` ou do pipeline do onboarding)
 * porque a ESCOLHA de quais aulas é assunto de lá; aqui é só a persistência.
 * Chamar duas vezes não duplica: a segunda encontra linhas e não faz nada.
 */
export async function garantirLevaInicial(
  userId: string,
  slugs: string[],
  opcoes?: {
    motivoPorSlug?: Record<string, string>
    /**
     * Nasce já entregue, sem virar mensagem no chat.
     *
     * `true` quando quem semeia é a própria Trilha: a pessoa está OLHANDO a
     * lista, mandar uma mensagem contando o que ela acabou de ver é ruído.
     * `false` quando quem semeia é o pipeline do onboarding — aí a
     * recomendação chega dentro da conversa, que é o que a §2.7 pede.
     */
    jaEntregue?: boolean
  }
): Promise<number> {
  const jaTem = await db.recomendacaoTrilha.count({ where: { userId } })
  if (jaTem > 0) return 0

  const modulos = await db.modulo.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  })
  const porSlug = new Map(modulos.map((m) => [m.slug, m.id]))

  // A ordem dos slugs é a ordem da recomendação, e ela importa: quem chega
  // primeiro é a aula mais urgente para os números desta pessoa.
  const dados = slugs
    .map((slug, i) => ({ slug, id: porSlug.get(slug), ordem: i }))
    .filter((x): x is { slug: string; id: string; ordem: number } => !!x.id)
    .map((x) => ({
      userId,
      moduloId: x.id,
      ordem: x.ordem,
      origem: "onboarding",
      motivo: opcoes?.motivoPorSlug?.[x.slug] ?? "Escolhida a partir dos seus números.",
      entregueEm: opcoes?.jaEntregue === false ? null : new Date(),
    }))

  if (dados.length === 0) return 0
  const r = await db.recomendacaoTrilha.createMany({ data: dados, skipDuplicates: true })
  return r.count
}

export interface Progresso {
  total: number
  concluidos: number
  fracao: number
}

export function medirProgresso(recs: Recomendada[]): Progresso {
  const total = recs.length
  const concluidos = recs.filter((r) => r.concluido).length
  return { total, concluidos, fracao: total === 0 ? 0 : concluidos / total }
}

/**
 * Dispara a leva nova, se for a hora.
 *
 * Devolve as recomendações criadas, ou lista vazia quando não é hora. Quem
 * chama não precisa saber a regra — só entregar o que vier.
 *
 * `escolher` recebe os módulos ainda não recomendados e devolve os escolhidos
 * com o porquê. Fica de fora daqui porque é a parte que fala com a IA, e esta
 * função precisa continuar testável sem rede.
 */
export async function talvezGerarNovaLeva(
  userId: string,
  escolher: (
    candidatos: { id: string; slug: string; titulo: string; subtitulo: string }[],
    jaFeitas: Recomendada[]
  ) => Promise<{ moduloId: string; motivo: string }[]>
): Promise<Recomendada[]> {
  const recs = await levaAtual(userId)
  // Sem leva inicial não há o que medir: quem nunca recebeu recomendação não
  // pode ter concluído 60% dela.
  if (recs.length === 0) return []

  const { fracao } = medirProgresso(recs)
  if (fracao < LIMIAR_NOVA_LEVA) return []

  /**
   * Fora: o que já foi recomendado E o que ela já concluiu por conta própria.
   *
   * O segundo conjunto não é detalhe. Recomendar uma aula já concluída é ruim
   * por si só, mas o estrago real é na conta: o módulo entra no numerador E no
   * denominador ao mesmo tempo, então a leva nova NÃO derruba a porcentagem
   * como deveria, e o gatilho dispara outra vez em seguida.
   *
   * Aconteceu em produção: 4/4 = 100% disparou; a leva trouxe uma aula que a
   * pessoa já tinha feito fora da trilha; virou 5/8 = 63%, ainda acima do
   * limiar; disparou de novo 22 segundos depois. Ela recebeu 8 aulas de uma
   * vez em vez de 4.
   */
  const feitos = await db.progressoModulo.findMany({
    where: { userId, concluido: true },
    select: { moduloId: true },
  })
  const fora = new Set([...recs.map((r) => r.moduloId), ...feitos.map((f) => f.moduloId)])

  const candidatos = await db.modulo.findMany({
    where: { id: { notIn: [...fora] } },
    select: { id: true, slug: true, titulo: true, subtitulo: true },
    orderBy: [{ tipoPerfil: "asc" }, { ordem: "asc" }],
  })
  // Acabaram as aulas: sem isso a condição continuaria verdadeira para sempre e
  // a checagem rodaria a cada abertura do chat sem nunca produzir nada.
  if (candidatos.length === 0) return []

  const escolhidas = (await escolher(candidatos, recs)).slice(0, TAMANHO_DA_LEVA)
  if (escolhidas.length === 0) return []

  // `escolher` fala com a IA e leva segundos. Duas abas abertas ao mesmo tempo
  // leem a mesma porcentagem antes de qualquer uma gravar, e as duas geram —
  // 8 aulas de uma vez, com módulos diferentes, então nem a chave única
  // segura. Reler aqui estreita a janela de segundos para milissegundos.
  const agora = await levaAtual(userId)
  if (agora.length !== recs.length || medirProgresso(agora).fracao < LIMIAR_NOVA_LEVA) {
    return agora.filter((r) => !r.entregueEm)
  }

  const permitidos = new Set(candidatos.map((c) => c.id))
  const base = await db.recomendacaoTrilha.count({ where: { userId } })

  await db.recomendacaoTrilha.createMany({
    data: escolhidas
      // Módulo já recomendado ou inexistente não entra: `escolher` fala com a
      // IA, e o que volta de lá é proposta, não fato.
      .filter((e) => permitidos.has(e.moduloId))
      .map((e, i) => ({
        userId,
        moduloId: e.moduloId,
        motivo: e.motivo,
        origem: "gatilho_percentual",
        ordem: base + i,
        entregueEm: null, // vira mensagem no chat na próxima abertura
      })),
    skipDuplicates: true,
  })

  return (await levaAtual(userId)).filter((r) => !r.entregueEm)
}

/** Marca como entregue. É o que impede a mesma leva de reaparecer a cada
 *  abertura do chat, já que a condição que a gerou continua verdadeira. */
export async function marcarEntregues(userId: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return
  await db.recomendacaoTrilha.updateMany({
    where: { userId, id: { in: ids } },
    data: { entregueEm: new Date() },
  })
}
