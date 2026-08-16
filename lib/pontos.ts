import { db } from "@/lib/db"
import { contemConteudoProibido } from "@/lib/conteudo-proibido"
import { ehDeOutroPublico, PUBLICO_ATUAL, type Publico } from "@/lib/publico"
import { Prisma } from "@prisma/client"

/**
 * Pontos.
 *
 * A regra que sustenta tudo: crédito é um EVENTO, e o total do usuário é a
 * soma dos eventos. `User.pontos` é só um cache do total, para não somar a
 * tabela inteira a cada abertura do Perfil.
 *
 * POR QUE EVENTO E NÃO UM CONTADOR
 * Contador não sabe dizer se já contou. `pontos += 10` roda duas vezes se a
 * pessoa tocar duas vezes, se a rede repetir a chamada, ou se ela refizer um
 * módulo que já tinha concluído. Com evento, a segunda tentativa esbarra na
 * chave única e não faz nada — e dá para auditar de onde veio cada ponto.
 */

/** Motivos que creditam. Fechado de propósito: motivo novo passa por aqui e
 *  ganha um valor pensado, em vez de aparecer solto no meio de uma rota. */
export const PONTOS_POR_MOTIVO = {
  onboarding: 50,
  /**
   * TETO do módulo, não o valor fixo.
   *
   * Quanto um módulo vale passou a sair da coluna `Modulo.pontos` — 30
   * iniciante, 40 intermediário, 50 avançado —, e este número é o limite que
   * `creditar` impõe a qualquer chamador. Era 30 fixo, e nesse tempo a coluna
   * existia sem ninguém ler: todo módulo pagava igual, do mais simples ao mais
   * difícil.
   *
   * Módulo concluído ANTES desta mudança recebeu 30 e continua com 30 — evento
   * de pontuação é imutável, e não há recrédito porque o refId é o módulo.
   */
  modulo_concluido: 50,
  /**
   * Uma das lições do módulo (Novo conceito, História, Revisão, Aplicação).
   *
   * Vale POUCO de propósito. O módulo continua pagando os 30 dele ao fechar, e
   * se cada lição pagasse como um módulo antigo o mesmo conteúdo passaria a
   * valer quatro vezes mais que valia — as 26 contas anteriores ao corredor
   * ficariam para trás no ranking sem ter feito nada de errado.
   *
   * refId é `${moduloId}:${licao}`, então refazer uma lição não paga de novo.
   */
  licao_concluida: 5,
  quiz_acerto: 5,
  lancamento_confirmado: 2,
  streak_semana: 20,
  // Indicação paga quando o convidado TERMINA a primeira conversa, nunca no
  // cadastro (lib/indicacao.ts). refId = Indicacao.id nos dois lados.
  indicacao_ativada: 50, // para quem convidou
  indicado_ativado: 20, // para quem entrou pelo convite
  /**
   * Bônus de combo (Redesign Fin): +3 por acerto a partir do 3º seguido,
   * recalculado NO SERVIDOR contra o gabarito (lib/combo.ts). O teto 9 cobre
   * a lição mais quizada (2 quizzes) com folga de herança — nunca inflar
   * `licao_concluida` para caber o bônus: motivo novo, teto próprio.
   * refId `${moduloId}:${licao}`, como a lição.
   */
  combo_bonus: 9,
  /**
   * Poção ×2 (Loja do Fin): o "dobro" é um SEGUNDO crédito no valor do
   * primeiro, nunca o primeiro inflado — o teto de `licao_concluida` continua
   * intacto e auditável. refId `${moduloId}:${licao}`.
   */
  pocao_bonus: 5,
  /**
   * Economia por XP (decisão da fundadora, 15/08/2026): missão e baú deixaram
   * de pagar moeda e passaram a pagar XP, porque moeda agora nasce de UM
   * lugar só, a conversão de XP na loja. Tudo desagua na mesma corrente:
   * lição, missão e baú geram XP; XP alimenta o ranking e compra moedas;
   * moedas compram itens.
   *
   * `missao` é teto (as três do dia valem 10/15/15, o valor real vem de
   * lib/missoes.ts); refId "AAAA-MM-DD:missaoId" renova à meia-noite.
   * `bau` paga cheio; refId "bloco:X" | "leva:N" abre uma vez na vida.
   */
  missao: 15,
  bau: 30,
} as const

export type MotivoPonto = keyof typeof PONTOS_POR_MOTIVO

/**
 * Sentinela para crédito sem referência.
 *
 * Existe porque no Postgres dois NULL não colidem em índice único. Se
 * "onboarding" gravasse refId nulo, refazer o onboarding creditaria de novo,
 * toda vez, sem erro nenhum. Uma string qualquer resolve, desde que não seja
 * nula.
 */
export const SEM_REF = "-"

/**
 * Pontos de um módulo concluído, proporcionais ao acerto nos quizzes.
 *
 * O motivo de existir: dava para concluir clicando em qualquer alternativa —
 * o fluxo deixa avançar com resposta errada de propósito, porque o feedback
 * ensina — e levar os 30 pontos inteiros. Concluir clicando aleatório valia o
 * mesmo que concluir lendo.
 *
 * A régua: módulo sem quiz vale cheio (não há o que errar); com quiz, um
 * piso de 10 por ter percorrido as telas, mais o resto proporcional ao
 * acerto. Errar tudo ainda paga o piso — a pessoa viu o conteúdo e o
 * feedback corrigiu, o que já é a aula acontecendo.
 */
/**
 * Quanto vale estudar FORA da própria trilha: METADE (decisão da fundadora,
 * 16/08/2026 — "era pra dar metade do xp normal").
 *
 * Era 1/4, saído de uma conta de teto: escolar com 1/4 dava 0,6× o teto
 * adulto e a varredura do 1º ao 9º ano não dominava o ranking. Mas 1/4 do
 * piso de uma lição arredondava para 1 ponto, e a aula explorada parecia não
 * pagar NADA — foi reportado como bug. Com 1/2 o teto escolar vai a ~1,2× o
 * adulto: quem varrer tudo fora da trilha pode passar quem fez só o próprio
 * percurso — custo aceito na decisão.
 *
 * O peso vale para os DOIS créditos — lição e módulo. Reduzir só o fechamento
 * do módulo deixaria as 4 lições pagando cheio, e é nelas que está a maior
 * parte dos pontos.
 *
 * É uma constante só justamente para poder ser afinada quando houver dado de
 * uso real — mexa aqui, não espalhe multiplicador pelas rotas.
 */
export const PESO_FORA_DA_TRILHA = 0.5

/**
 * Ajusta o valor de uma aula conforme ela seja ou não da trilha da pessoa.
 *
 * O piso é 1: aula que paga zero é aula que o app pede para a pessoa fazer e
 * depois trata como se não tivesse acontecido.
 *
 * O terceiro parâmetro é o público DA PESSOA (publicoDoUsuario): aluno de
 * escola fazendo aula do PRÓPRIO segmento recebe cheio, e é a aula adulta que
 * vale 1/4 para ele — a mesma régua do adulto, espelhada.
 */
export function ajustarPorPublico(
  pontos: number,
  publicoDoModulo: string,
  publicoDaPessoa: Publico = PUBLICO_ATUAL
): number {
  if (!ehDeOutroPublico(publicoDoModulo, publicoDaPessoa)) return pontos
  return Math.max(1, Math.round(pontos * PESO_FORA_DA_TRILHA))
}

export function pontosPorConclusao(
  acertos: number,
  totalQuiz: number,
  /**
   * Quanto ESTE módulo vale (`Modulo.pontos`). O default 30 é o piso da
   * escala, para chamador antigo e para módulo sem valor gravado — nunca o
   * teto, senão esquecer o argumento premiaria por engano.
   */
  pontosDoModulo = 30
): number {
  const cheio = Math.max(0, Math.min(PONTOS_POR_MOTIVO.modulo_concluido, pontosDoModulo))
  if (totalQuiz <= 0) return cheio
  // O piso é 1/3 do valor do módulo, a mesma proporção de quando o cheio era
  // 30 e o piso 10: quem percorreu as telas leva algo mesmo errando tudo,
  // porque o feedback corrigiu e isso já é a aula acontecendo.
  const piso = Math.round(cheio / 3)
  const fracao = Math.max(0, Math.min(1, acertos / totalQuiz))
  return piso + Math.round((cheio - piso) * fracao)
}

/**
 * Pontos de uma LIÇÃO concluída, na mesma lógica do módulo: piso por ter
 * percorrido, resto proporcional ao acerto. Lição sem quiz (História,
 * Aplicação) paga cheio — não há o que errar nela.
 */
export function pontosPorLicao(acertos: number, totalQuiz: number): number {
  const cheio = PONTOS_POR_MOTIVO.licao_concluida
  if (totalQuiz <= 0) return cheio
  const piso = 2
  const fracao = Math.max(0, Math.min(1, acertos / totalQuiz))
  return piso + Math.round((cheio - piso) * fracao)
}

/**
 * Teto por dia, para os motivos que a própria pessoa dispara à vontade.
 *
 * A chave única impede pagar DUAS VEZES pela mesma coisa. Ela não impede fazer
 * a mesma coisa mil vezes: cada lançamento novo é um refId novo e credita
 * legitimamente. Sem teto, confirmar um extrato de 400 linhas daria 800 pontos
 * contra 50 do onboarding inteiro, e o ranking viraria uma disputa de quem sobe
 * o extrato maior — que não é o comportamento que o produto quer premiar.
 *
 * Motivo fora desta lista não tem teto porque não dá para repetir: onboarding
 * acontece uma vez, módulo concluído já é barrado pelo refId.
 */
const TETO_DIARIO: Partial<Record<MotivoPonto, number>> = {
  lancamento_confirmado: 10,
  quiz_acerto: 20,
  // Redesign Fin: os bônus são por lição NOVA (refId já barra o refazer), mas
  // uma maratona de lições num dia não pode virar imprensa de pontos.
  combo_bonus: 6,
  pocao_bonus: 4,
}

/**
 * Meia-noite de hoje em São Paulo, como instante real.
 *
 * O teto é diário, e "o dia" tem de ser o de quem usa o app. Na Vercel o
 * servidor roda em UTC: contar por dia UTC faria o teto reiniciar às 21h de
 * Brasília, no meio da noite de quem está lançando.
 *
 * O caminho tentador (`new Date(agora.toLocaleString(..., {timeZone}))`) está
 * errado e erra em silêncio: ele monta os componentes de São Paulo mas os
 * interpreta no fuso do servidor, e o resultado fica deslocado exatamente pela
 * diferença entre os dois — invisível em máquina brasileira, quebrado em
 * produção.
 *
 * O -03:00 é fixo: o Brasil acabou com o horário de verão em 2019.
 */
export function inicioDoDiaSP(agora: Date = new Date()): Date {
  // en-CA formata como "2026-08-01", que é o que a montagem abaixo espera.
  const dia = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora)
  return new Date(`${dia}T00:00:00-03:00`)
}

export interface Credito {
  creditado: boolean
  pontos: number
  /** Total do usuário depois desta chamada. */
  total: number
  /** Bateu o teto do dia para este motivo. */
  noTeto?: boolean
}

/**
 * Credita uma vez só.
 *
 * Repetir a mesma chamada é seguro e é o caso NORMAL, não o excepcional:
 * a tela pode reenviar, o pipeline pode ser retomado, a pessoa pode refazer o
 * módulo. Todos esses caminhos chegam aqui e devem terminar iguais.
 */
export async function creditar(
  userId: string,
  motivo: MotivoPonto,
  refId: string = SEM_REF,
  /**
   * Valor menor que o da tabela, para crédito proporcional (módulo concluído
   * com quiz errado). É TETO, não substituto: nunca credita acima da tabela,
   * então nenhum chamador consegue inflar pontos por aqui.
   */
  pontosCustom?: number
): Promise<Credito> {
  const tabela = PONTOS_POR_MOTIVO[motivo]
  const pontos =
    pontosCustom === undefined
      ? tabela
      : Math.max(0, Math.min(tabela, Math.round(pontosCustom)))

  const teto = TETO_DIARIO[motivo]
  if (teto !== undefined) {
    const hoje = await db.eventoPontuacao.count({
      where: { userId, motivo, criadoEm: { gte: inicioDoDiaSP() } },
    })
    if (hoje >= teto) {
      const u = await db.user.findUnique({ where: { id: userId }, select: { pontos: true } })
      return { creditado: false, pontos: 0, total: u?.pontos ?? 0, noTeto: true }
    }
  }

  try {
    // Evento e cache no mesmo lugar: se a linha do evento não entrar, o total
    // não pode subir. Fora de uma transação dá para creditar o cache e perder
    // o evento, e aí o total passa a mentir sem nada apontando o porquê.
    const total = await db.$transaction(async (tx) => {
      await tx.eventoPontuacao.create({ data: { userId, motivo, pontos, refId } })
      const u = await tx.user.update({
        where: { id: userId },
        data: { pontos: { increment: pontos } },
        select: { pontos: true },
      })
      return u.pontos
    })
    return { creditado: true, pontos, total }
  } catch (e) {
    // P2002 = a chave única recusou. É o mecanismo funcionando, não uma falha:
    // já foi creditado antes.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const u = await db.user.findUnique({ where: { id: userId }, select: { pontos: true } })
      return { creditado: false, pontos: 0, total: u?.pontos ?? 0 }
    }
    throw e
  }
}

/**
 * Recalcula o cache a partir dos eventos.
 *
 * O cache pode divergir se alguém apagar eventos na mão ou se uma transação
 * cair no meio. A verdade são os eventos, então a correção sempre vem daqui,
 * nunca o contrário.
 */
export async function recalcularTotal(userId: string): Promise<number> {
  const soma = await db.eventoPontuacao.aggregate({
    where: { userId },
    _sum: { pontos: true },
  })
  const total = soma._sum.pontos ?? 0
  await db.user.update({ where: { id: userId }, data: { pontos: total } })
  return total
}

export interface LinhaRanking {
  apelido: string
  pontos: number
  posicao: number
  /** Marca a linha de quem está olhando, para a tela destacá-la. */
  euMesmo: boolean
}

/**
 * O ranking.
 *
 * Devolve APELIDO E PONTOS. Nada mais sai daqui: nem e-mail, nem nome real,
 * nem id, nem qualquer número financeiro. Ranking é a única superfície do app
 * em que uma pessoa vê dado de outra, então o que ele não seleciona é tão
 * importante quanto o que ele seleciona.
 *
 * Quem não deu opt-in não aparece, inclusive para si mesmo: aparecer só para
 * você numa lista que os outros não veem é confuso e sugere que você está lá.
 */
export async function listarRanking(userId: string, limite = 50): Promise<LinhaRanking[]> {
  const linhas = await db.user.findMany({
    where: { rankingOptIn: true, apelido: { not: null } },
    select: { id: true, apelido: true, pontos: true },
    orderBy: [{ pontos: "desc" }, { criadoEm: "asc" }],
    take: limite,
  })

  return linhas.map((u, i) => ({
    apelido: u.apelido as string,
    pontos: u.pontos,
    posicao: i + 1,
    euMesmo: u.id === userId,
  }))
}

export interface RankingEscolar {
  turmaNome: string
  escopo: "sala" | "ano" | "escola"
  linhas: LinhaRanking[]
}

/**
 * O rank da sala (Finlow para Escolas) — mesma disciplina de listarRanking:
 * APELIDO E PONTOS, nada mais.
 *
 * O consentimento aqui é DIFERENTE do rank global, e é decisão de desenho
 * (quadro branco da fundadora): quem liga o rank é o PROFESSOR, por turma
 * (Turma.rankAtivo + rankEscopo), porque é dinâmica de sala de aula — não o
 * opt-in individual de rankingOptIn. O freio individual que resta é o
 * apelido: aluno sem apelido não aparece para os colegas (o professor vê
 * nome real no desempenho, que é outra superfície). A pendência LGPD de
 * menores está registrada em docs/backlog-produto.md e trava venda, não
 * build.
 *
 * Escopos: "sala" = a turma · "ano" = turmas da escola com a MESMA série e
 * rank ativo (turma sem série cai para sala) · "escola" = todas as turmas da
 * escola com rank ativo — turma cujo professor não ligou não entra em rank
 * nenhum, nem no da escola.
 *
 * R1 usa User.pontos total: pontos de uso pessoal (lançamentos, streak)
 * contam no rank da sala. Limitação conhecida e registrada no backlog —
 * recortar por eventos escolares é a segunda rodada.
 */
export async function rankingEscolar(userId: string): Promise<RankingEscolar | null> {
  const membro = await db.membroTurma.findFirst({
    where: { userId, turma: { rankAtivo: true } },
    select: {
      turma: {
        select: { id: true, nome: true, escolaId: true, serie: true, rankEscopo: true },
      },
    },
    orderBy: { criadoEm: "asc" },
  })
  if (!membro) return null
  const t = membro.turma

  const escopo: "sala" | "ano" | "escola" =
    t.rankEscopo === "ano" && t.serie ? "ano" : t.rankEscopo === "escola" ? "escola" : "sala"

  const filtroTurma =
    escopo === "sala"
      ? { id: t.id }
      : escopo === "ano"
        ? { escolaId: t.escolaId, rankAtivo: true, serie: t.serie }
        : { escolaId: t.escolaId, rankAtivo: true }

  const linhas = await db.user.findMany({
    where: { apelido: { not: null }, turmas: { some: { turma: filtroTurma } } },
    select: { id: true, apelido: true, pontos: true },
    orderBy: [{ pontos: "desc" }, { criadoEm: "asc" }],
    take: 50,
  })

  return {
    turmaNome: t.nome,
    escopo,
    linhas: linhas.map((u, i) => ({
      apelido: u.apelido as string,
      pontos: u.pontos,
      posicao: i + 1,
      euMesmo: u.id === userId,
    })),
  }
}

/** Um apelido serve se dá para exibir e não se passa por outra pessoa. */
export function apelidoValido(bruto: string): { ok: true; apelido: string } | { ok: false; erro: string } {
  const apelido = bruto.trim().replace(/\s+/g, " ")
  if (apelido.length < 2) return { ok: false, erro: "Escolhe pelo menos 2 letras." }
  if (apelido.length > 20) return { ok: false, erro: "No máximo 20 caracteres." }
  // Sem e-mail nem @: os dois identificam a pessoa fora do app, e o ranking é
  // visto por estranhos.
  if (/[@]/.test(apelido) || /\S+@\S+\.\S+/.test(apelido)) {
    return { ok: false, erro: "Sem e-mail nem @ no apelido." }
  }
  if (!/^[\p{L}\p{N} ._-]+$/u.test(apelido)) {
    return { ok: false, erro: "Usa letras, números, espaço, ponto, hífen ou _." }
  }
  // O apelido é o ÚNICO texto do app que outras pessoas leem. A trava aqui
  // protege quem olha o ranking, não quem escreve.
  if (contemConteudoProibido(apelido)) {
    return { ok: false, erro: "Esse apelido não pode aparecer no ranking. Escolhe outro." }
  }
  return { ok: true, apelido }
}
