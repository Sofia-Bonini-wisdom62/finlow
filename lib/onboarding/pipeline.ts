import { db } from "@/lib/db"
import { listarTransacoes } from "@/lib/financeiro-repo"
import { metricasPerfil, nivelFinanceiro, type TransacaoCalc } from "@/lib/financas"
import { montarContexto, ultimoMesComMovimento } from "@/lib/contexto-financeiro"
import { listarMemorias } from "@/lib/memoria-repo"
import { garantirLevaInicial, levaAtual } from "@/lib/recomendacao"
import { creditar } from "@/lib/pontos"
import { gerarInsights } from "@/lib/insights-ia"

/**
 * O processamento do fim da primeira conversa (SPEC v3 §2.7).
 *
 * RODA UMA VEZ E PODE RODAR DE NOVO
 * Cada passo é idempotente por conta própria, não por causa de uma flag de
 * "já rodou". Isso importa porque a rede cai no meio: com flag, uma execução
 * interrompida no passo 3 deixa a conta pela metade e marcada como pronta.
 * Sem flag, é só rodar de novo — os passos que já deram certo não se repetem.
 *
 * QUANTOS PASSOS SÃO, DE VERDADE
 * O quadro lista 10. Três deles não existem como código nesta arquitetura, e
 * inventá-los seria encher a tela de transição de teatro:
 *
 *  - "registra o listener do gatilho" — não há listener. A checagem do gatilho
 *    é feita quando o chat abre (`talvezGerarNovaLeva`), a partir do que já
 *    está no banco. Listener é estado que apodrece; conta que se calcula, não.
 *  - "recomenda +4" — é o que o gatilho faz DEPOIS, ao cruzar 60% da trilha.
 *    Rodar aqui entregaria as duas levas no mesmo minuto e esvaziaria o
 *    gatilho.
 *  - "dash atualizado" — é consequência dos lançamentos, não uma ação. O donut
 *    lê a mesma tabela; não há o que executar.
 *
 * O ranking também não entra: é opt-in e nasce desligado, então "posicionar"
 * alguém que não pediu para participar seria fazer o contrário do combinado.
 */

export interface Passo {
  id: string
  /** O que a tela mostra enquanto ele roda. */
  rotulo: string
}

export interface Resultado extends Passo {
  ok: boolean
  detalhe?: string
}

export const PASSOS: Passo[] = [
  { id: "lancamentos", rotulo: "Organizando o que você me contou" },
  { id: "contexto", rotulo: "Escrevendo o seu contexto" },
  { id: "perfil", rotulo: "Montando o seu perfil" },
  { id: "trilha", rotulo: "Escolhendo por onde começar" },
  { id: "insights", rotulo: "Lendo os seus números" },
  { id: "pontos", rotulo: "Fechando" },
]

/**
 * Roda os passos e vai devolvendo cada um conforme termina.
 *
 * Generator para a tela poder mostrar o passo REAL em execução. Uma barra que
 * anda sozinha enquanto o servidor faz outra coisa é mentira barata: quando
 * trava, a pessoa fica olhando uma animação alegre sem saber que deu errado.
 */
export async function* rodarPipeline(userId: string): AsyncGenerator<Resultado> {
  // ---------------------------------------------------------------- 1 ---
  // Os lançamentos já entraram pela conversa (a pessoa confirmou card a card)
  // ou pelo extrato. Aqui não se cria nada: só se conta o que existe, porque é
  // isso que os passos seguintes vão ler.
  let transacoes: TransacaoCalc[] = []
  try {
    transacoes = await listarTransacoes(userId, { comCategoria: false })
    yield ok("lancamentos", transacoes.length === 0
      ? "nenhum lançamento ainda, tudo bem"
      : `${transacoes.length} ${transacoes.length === 1 ? "lançamento" : "lançamentos"}`)
  } catch (e) {
    yield falhou("lancamentos", e)
  }

  const metricas = metricasPerfil(transacoes)

  // ---------------------------------------------------------------- 2 ---
  // O "resumo" da spec é o conjunto de memórias que a conversa gravou. Não há
  // um campo de texto corrido: memória aqui é fato separado, cifrado e
  // apagável um a um, e juntar tudo num parágrafo desfaria as três coisas.
  try {
    const memorias = await listarMemorias(userId)
    yield ok("contexto", memorias.length === 0
      ? "nada guardado ainda"
      : `${memorias.length} ${memorias.length === 1 ? "coisa" : "coisas"} sobre você`)
  } catch (e) {
    yield falhou("contexto", e)
  }

  // ---------------------------------------------------------------- 3 ---
  // Nível é derivado dos números, não perguntado. `upsert` no Onboarding
  // mantém o passo repetível.
  try {
    const nivel = nivelFinanceiro(metricas)
    await db.user.update({ where: { id: userId }, data: { nivel } })
    await db.onboarding.upsert({
      where: { userId },
      create: {
        userId,
        objetivo: "conversa",
        eixo2: "dificuldade",
        eixo2Valor: "conversa",
        momento: "chat",
        nivelInferido: nivel,
        situacoes: [],
        concluidoEm: new Date(),
      },
      update: { nivelInferido: nivel, concluidoEm: new Date() },
    })
    yield ok("perfil", nivel)
  } catch (e) {
    yield falhou("perfil", e)
  }

  // ---------------------------------------------------------------- 4 ---
  try {
    const perfil = await db.perfil.findUnique({ where: { userId }, select: { tipo: true } })
    const slugs = await slugsDaTrilha(perfil?.tipo ?? "lancador")
    // Pendente de propósito: a recomendação chega como a primeira mensagem
    // do chat, não numa tela à parte. É o passo 3 da §2.7.
    await garantirLevaInicial(userId, slugs, { jaEntregue: false })
    const leva = await levaAtual(userId)
    yield ok("trilha", `${leva.length} ${leva.length === 1 ? "aula" : "aulas"}`)
  } catch (e) {
    yield falhou("trilha", e)
  }

  // ---------------------------------------------------------------- 5 ---
  // As três linhas do Perfil (§2.10). Só reescreve se não houver nenhuma
  // ativa: rodar de novo não pode empilhar seis insights na tela.
  try {
    const jaTem = await db.insight.count({ where: { userId, ativo: true } })
    if (jaTem > 0) {
      yield ok("insights", `${jaTem} já escritos`)
    } else {
      // O último mês COM movimento, não o corrente: no dia 1º o mês corrente
      // está vazio por definição, e as três linhas sairiam todas sobre zero
      // para quem tem meses de histórico.
      const contexto = await montarContexto(userId, await ultimoMesComMovimento(userId))
      const linhas = await gerarInsights(contexto)
      if (linhas.length) {
        await db.insight.createMany({
          data: linhas.map((l) => ({ userId, texto: l.texto, tipo: l.tipo })),
        })
      }
      yield ok("insights", `${linhas.length} ${linhas.length === 1 ? "leitura" : "leituras"}`)
    }
  } catch (e) {
    yield falhou("insights", e)
  }

  // ---------------------------------------------------------------- 6 ---
  try {
    const credito = await creditar(userId, "onboarding")
    yield ok("pontos", credito.creditado ? `+${credito.pontos}` : `${credito.total} no total`)
  } catch (e) {
    yield falhou("pontos", e)
  }
}

function rotulo(id: string): string {
  return PASSOS.find((p) => p.id === id)?.rotulo ?? id
}

function ok(id: string, detalhe?: string): Resultado {
  return { id, rotulo: rotulo(id), ok: true, detalhe }
}

/**
 * Passo que falhou NÃO derruba o pipeline.
 *
 * A conversa já aconteceu e o que a pessoa contou já está gravado. Abortar
 * tudo porque a geração de insight caiu tiraria dela a trilha e os pontos
 * também — e ela não tem como saber que só uma parte falhou.
 */
function falhou(id: string, e: unknown): Resultado {
  console.error(`[pipeline] ${id}:`, (e as Error)?.message)
  return { id, rotulo: rotulo(id), ok: false, detalhe: "deixei pra depois" }
}

/** As aulas da trilha do perfil, na ordem. */
async function slugsDaTrilha(tipoPerfil: string): Promise<string[]> {
  const modulos = await db.modulo.findMany({
    where: { tipoPerfil },
    select: { slug: true },
    orderBy: { ordem: "asc" },
  })
  // Perfil sem módulo seria trilha vazia. Cai no fluxo de caixa, que é a
  // trilha de quem ainda não sabe para onde o dinheiro vai.
  if (modulos.length === 0) {
    const fallback = await db.modulo.findMany({
      where: { tipoPerfil: "lancador" },
      select: { slug: true },
      orderBy: { ordem: "asc" },
    })
    return fallback.map((m) => m.slug)
  }
  return modulos.map((m) => m.slug)
}
