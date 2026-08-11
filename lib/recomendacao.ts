import { db } from "@/lib/db"
import { filtroDeModulo, publicoDoUsuario } from "@/lib/publico"

/**
 * Recomendação é mecânica do produto ADULTO — o aluno de escola tem currículo,
 * não leva (lib/corredor.ts). Ainda assim TODAS as leituras daqui passam o
 * público da pessoa: se alguma rota chamar isto para um aluno, a leva sai da
 * trilha DELE em vez de vazar aula adulta — e o corredor escolar a ignora.
 */

/**
 * A trilha recomendada, gravada, e o gatilho que gera a próxima leva.
 *
 * O QUE MUDA EM RELAÇÃO AO QUE JÁ EXISTIA
 * a Trilha monta a recomendação na hora, dos números do momento. Isso
 * serve para exibir, mas não serve para MEDIR: o gatilho da §2.7 dispara ao
 * concluir X% da trilha recomendada, e uma lista que se remonta muda de tamanho
 * junto com o extrato da pessoa. A porcentagem perseguiria um alvo móvel.
 *
 * Então a leva vira linha no banco. O que está gravado é o que conta.
 *
 * O QUE SEGURA O GATILHO DE REPETIR
 * A leva nova entra no denominador, então a própria geração empurra a
 * porcentagem para baixo. Isso é quase suficiente, e a primeira versão deste
 * arquivo dizia que era suficiente. Não era, e custou um incidente:
 *
 *  - se a leva trouxer uma aula que a pessoa JÁ concluiu, o módulo entra no
 *    numerador junto com o denominador e a fração não cai o bastante. Foi o
 *    que houve: 4/4 = 100% disparou, virou 5/8 = 63%, disparou de novo 22
 *    segundos depois, e a pessoa recebeu 8 aulas de uma vez. Por isso
 *    `talvezGerarNovaLeva` exclui os concluídos dos candidatos.
 *  - e quem conclui TUDO cai exatamente no limiar depois da leva nova (6 de 6
 *    vira 6/10 = 60%), o que dispara outra vez na borda. Por isso existe a
 *    segunda condição: tem de haver alguma conclusão NOVA desde a última leva.
 *
 * A lição que vale para o próximo: "o número se resolve sozinho" é uma
 * afirmação sobre TODOS os caminhos, e basta um caminho para derrubá-la.
 */

/**
 * A leva fecha quando a ÚLTIMA aula dela é concluída — não antes.
 *
 * A regra anterior era 60%, e ela produzia um efeito ruim: as aulas iam sumindo
 * uma a uma conforme eram feitas, e a leva seguinte chegava por cima do que
 * ainda faltava. "Recomendados" virava uma fila em movimento, não um conjunto
 * com começo e fim.
 *
 * Com a leva inteira, quem olha vê um bloco de 4 que não muda até estar
 * fechado. É um objetivo com contorno, não uma esteira.
 */
export const LIMIAR_NOVA_LEVA = 1

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
  leva: number
  substituida: boolean
}

/** Tudo que já foi recomendado a esta pessoa, com o estado de cada uma.
 *  Inclui leva fechada e aula trocada — é o histórico. */
export async function levaAtual(userId: string): Promise<Recomendada[]> {
  const [recs, progresso] = await Promise.all([
    db.recomendacaoTrilha.findMany({
      where: { userId },
      orderBy: [{ criadoEm: "asc" }, { ordem: "asc" }],
      select: {
        id: true, moduloId: true, motivo: true, origem: true, entregueEm: true,
        leva: true, substituidaEm: true,
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
    leva: r.leva,
    substituida: r.substituidaEm !== null,
    concluido: concluidos.has(r.moduloId),
  }))
}

/**
 * A leva ATIVA: as aulas que estão em Recomendados agora.
 *
 * É a leva de número mais alto, sem as que o chat trocou. Aula concluída
 * CONTINUA aqui — some só quando a leva inteira fecha. Ver a aula que você
 * acabou de terminar ainda no bloco é o que mostra o progresso; tirá-la na
 * hora faria a lista encolher sem explicar por quê.
 */
export async function levaAtiva(userId: string): Promise<Recomendada[]> {
  const todas = await levaAtual(userId)
  if (todas.length === 0) return []
  const numero = Math.max(...todas.map((r) => r.leva))
  return todas.filter((r) => r.leva === numero && !r.substituida)
}

/** A leva fechou: todas as aulas dela foram concluídas. */
export function levaFechada(ativa: Recomendada[]): boolean {
  return ativa.length > 0 && ativa.every((r) => r.concluido)
}

/**
 * Grava a primeira leva, se ainda não existir.
 *
 * Recebe os slugs de fora (da página da Trilha ou do pipeline do onboarding)
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
    where: { slug: { in: slugs }, ...filtroDeModulo(await publicoDoUsuario(userId)) },
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
 * O progresso que o gatilho mede: aula concluída CONTA, tenha sido recomendada
 * ou não.
 *
 * A trilha é o que foi recomendado MAIS o que a pessoa fez por conta. A aba
 * Trilha tem busca e "Todos os módulos" em destaque; quem estuda por ali
 * estava estudando de graça — o Muniz tinha uma aula concluída e o app dizia
 * 0/4 = 0%.
 *
 * A conta se comporta: concluir qualquer aula sobe um no numerador e no
 * denominador, então a fração sempre SOBE; e uma leva nova acrescenta 4 só ao
 * denominador, então sempre DESCE.
 *
 * `desdeUltimaLeva` é a segunda condição, e ela existe por causa de um caso de
 * borda que a fração sozinha não cobre: quem conclui tudo fica exatamente no
 * limiar depois da leva nova (6 de 6 vira 6/10 = 60%) e dispararia outra vez
 * na hora. Exigir uma conclusão NOVA desde a última leva fecha isso sem
 * inventar trava artificial — é o mesmo princípio, medido no tempo.
 */
export async function progressoDaTrilha(
  userId: string
): Promise<Progresso & { desdeUltimaLeva: number }> {
  const [recs, feitos, ultima] = await Promise.all([
    db.recomendacaoTrilha.findMany({ where: { userId }, select: { moduloId: true } }),
    db.progressoModulo.findMany({
      where: { userId, concluido: true },
      select: { moduloId: true, concluidoEm: true },
    }),
    db.recomendacaoTrilha.findFirst({
      where: { userId },
      orderBy: { criadoEm: "desc" },
      select: { criadoEm: true },
    }),
  ])

  const uniao = new Set([...recs.map((r) => r.moduloId), ...feitos.map((f) => f.moduloId)])
  const total = uniao.size
  const concluidos = feitos.length

  const corte = ultima?.criadoEm
  const desdeUltimaLeva = corte
    ? feitos.filter((f) => f.concluidoEm && f.concluidoEm > corte).length
    : concluidos

  return {
    total,
    concluidos,
    fracao: total === 0 ? 0 : concluidos / total,
    desdeUltimaLeva,
  }
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
  // Quem nunca recebeu recomendação não tem leva para fechar.
  if (recs.length === 0) return []

  const ativa = await levaAtiva(userId)
  // A leva só fecha quando a ÚLTIMA aula dela é concluída. Enquanto faltar
  // uma, nada de leva nova — senão a seguinte chegaria por cima do que ainda
  // está aberto e "Recomendados" viraria uma esteira.
  if (!levaFechada(ativa)) return []

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
    where: { id: { notIn: [...fora] }, ...filtroDeModulo(await publicoDoUsuario(userId)) },
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
  if (agora.length !== recs.length || !levaFechada(await levaAtiva(userId))) {
    return agora.filter((r) => !r.entregueEm)
  }

  const permitidos = new Set(candidatos.map((c) => c.id))
  const base = await db.recomendacaoTrilha.count({ where: { userId } })
  const proximaLeva = Math.max(...recs.map((r) => r.leva)) + 1

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
        leva: proximaLeva,
        entregueEm: null, // vira mensagem no chat na próxima abertura
      })),
    skipDuplicates: true,
  })

  return (await levaAtual(userId)).filter((r) => !r.entregueEm)
}

/**
 * A aula que o chat recomendou vira parte da trilha.
 *
 * POR QUE ISTO PRECISA EXISTIR
 * O assistente já sabia recomendar módulo num card. Só que o card morria com a
 * conversa: a aula não entrava na trilha da pessoa, não contava para o gatilho
 * de percentual, e sumia quando o histórico rolava. `origem: "lacuna_chat"`
 * estava no schema e nunca tinha sido escrito por ninguém — era o gatilho
 * declarado na maioria do backlog e a justificativa da Faixa 1 inteira.
 *
 * Nasce ENTREGUE porque o card já é a entrega: a pessoa está lendo a
 * recomendação agora. Mandar uma mensagem no chat contando o que o chat acabou
 * de dizer seria eco.
 *
 * Idempotente pela chave (userId, moduloId, origem): o assistente citar a mesma
 * aula em três conversas grava uma linha só.
 *
 * Para o ALUNO DE ESCOLA isto é um no-op por construção: ele nunca tem leva
 * ativa (o corredor dele é o currículo), então a checagem de `ativa.length`
 * devolve 0 antes de escrever qualquer coisa. O card da aula continua
 * aparecendo no chat — e, como a lista de aulas que a IA enxerga já é a do
 * segmento dele, o card aponta para a trilha certa.
 */
export async function guardarRecomendacaoDoChat(
  userId: string,
  slugs: string[],
  motivoPorSlug: Record<string, string>
): Promise<number> {
  if (slugs.length === 0) return 0

  const publico = await publicoDoUsuario(userId)
  const modulos = await db.modulo.findMany({
    where: { slug: { in: slugs }, ...filtroDeModulo(publico) },
    select: { id: true, slug: true },
  })
  if (modulos.length === 0) return 0

  const ativa = await levaAtiva(userId)
  // Sem leva ainda: não há o que trocar. A primeira leva é assunto do
  // onboarding ou da primeira abertura da Trilha.
  if (ativa.length === 0) return 0

  const jaNaLeva = new Set(ativa.map((r) => r.moduloId))
  const entrando = modulos.filter((m) => !jaNaLeva.has(m.id))
  if (entrando.length === 0) return 0

  /**
   * Quem sai é a aula NÃO CONCLUÍDA que menos combina com a situação de agora.
   *
   * Concluída nunca sai: ela é trabalho feito, precisa continuar contando para
   * a leva fechar, e tirá-la faria a leva nunca completar. Entre as pendentes,
   * sai a de menor encaixe — se a conversa revelou uma necessidade nova, a
   * aula menos pertinente é justamente a que devia ceder o lugar.
   */
  const pendentes = ativa.filter((r) => !r.concluido)
  if (pendentes.length === 0) return 0

  const { posicaoDaPessoa } = await import("@/lib/posicionar-trilha")
  const { pontuarAula } = await import("@/lib/situacoes")
  const posicao = await posicaoDaPessoa(userId)

  const notas = await db.modulo.findMany({
    where: { id: { in: pendentes.map((p) => p.moduloId) }, ...filtroDeModulo(publico) },
    select: { id: true, nivel: true, situacoes: true },
  })
  const notaPorId = new Map(notas.map((m) => [m.id, pontuarAula(m, posicao)]))

  const fila = [...pendentes].sort(
    (a, b) => (notaPorId.get(a.moduloId) ?? 0) - (notaPorId.get(b.moduloId) ?? 0)
  )

  // Troca 1 por 1: a leva tem tamanho fixo. Se o assistente citar três aulas e
  // só houver duas pendentes, entram duas — a leva não incha para acomodar a
  // conversa.
  const quantas = Math.min(entrando.length, fila.length)
  if (quantas === 0) return 0

  const numeroDaLeva = ativa[0].leva
  const base = await db.recomendacaoTrilha.count({ where: { userId } })

  await db.$transaction([
    db.recomendacaoTrilha.updateMany({
      where: { userId, id: { in: fila.slice(0, quantas).map((f) => f.id) } },
      data: { substituidaEm: new Date() },
    }),
    db.recomendacaoTrilha.createMany({
      data: entrando.slice(0, quantas).map((m, i) => ({
        userId,
        moduloId: m.id,
        origem: "lacuna_chat",
        ordem: base + i,
        leva: numeroDaLeva,
        motivo: motivoPorSlug[m.slug] ?? "Veio de uma conversa sua com o assistente.",
        // Já entregue: a pessoa está lendo a recomendação no chat agora. Mandar
        // uma mensagem contando o que o chat acabou de dizer seria eco.
        entregueEm: new Date(),
      })),
      skipDuplicates: true,
    }),
  ])

  return quantas
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
