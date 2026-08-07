import { embaralharPorSemente } from "@/lib/embaralhar"
import type { TelaData } from "@/types/trilha"

/**
 * As quatro lições de um módulo.
 *
 * O módulo deixou de ser uma fila de telas e passou a ser quatro lições em
 * sequência (decisão da fundadora, 05/08/2026). Cada uma tem o seu fim, o seu
 * XP e a sua tela de fechamento, e a seguinte só abre quando a anterior fecha.
 *
 * O AGRUPAMENTO É DERIVADO DO TIPO DA TELA, NÃO DA POSIÇÃO
 * As 386 telas em produção têm SEIS sequências de tipos diferentes:
 *
 *   24x em     | conceito cenario quiz input resultado
 *   15x adulto | conceito cenario input resultado quiz resultado
 *   12x adulto | conceito cenario quiz input resultado resultado
 *    8x adulto | conceito cenario quiz conceito input resultado conceito
 *    4x adulto | conceito quiz conceito input resultado conceito
 *    4x adulto | conceito input cenario quiz resultado conceito
 *
 * Nenhuma regra por índice funciona nas seis — "a tela 2 é o quiz" está certo
 * em três e errado em três. Por tipo funciona em todas, e continua funcionando
 * quando alguém escrever um módulo com outra ordem.
 *
 * A TELA DE QUIZ APARECE DUAS VEZES, DE PROPÓSITO
 * Na lição 1 ela vem DEPOIS do conceito, então a pessoa responde com a
 * explicação ainda fresca na tela anterior — é o "com consulta" do roteiro. Na
 * lição 3 ela vem sozinha, sem conceito nenhum antes: mesma pergunta, sem
 * consulta. É por isso que o vínculo tela→lição não é coluna no banco (ver o
 * comentário em `Tela` no schema): uma coluna guardaria um valor só, e
 * duplicar a pergunta criaria duas cópias que divergem na primeira correção.
 *
 * Na lição 3 as alternativas são embaralhadas com semente DIFERENTE (ver
 * `sementeDaTela`), senão a "revisão" mediria memória de posição — a pessoa
 * lembraria que era a segunda opção, não o conteúdo.
 */

export const TIPOS_LICAO = [
  {
    licao: 1,
    nome: "Novo conceito!",
    resumo: "O conceito, e uma pergunta com a explicação à vista.",
  },
  {
    licao: 2,
    nome: "História!",
    resumo: "Um caso prático, com números de verdade.",
  },
  {
    licao: 3,
    nome: "Revisão!",
    resumo: "A mesma pergunta, agora sem consulta.",
  },
  {
    licao: 4,
    nome: "Aplicação!",
    resumo: "Agora com os seus números.",
  },
] as const

export type NumeroLicao = 1 | 2 | 3 | 4

export interface LicaoMontada {
  licao: NumeroLicao
  nome: string
  resumo: string
  telas: TelaData[]
}

/**
 * Semente do embaralhamento das alternativas de um quiz.
 *
 * Inclui a lição para que a MESMA pergunta saia em ordem diferente na lição 1
 * e na 3. Sem isso a revisão testaria "era a letra B" em vez do conteúdo.
 *
 * É UMA FUNÇÃO, e não a string montada em cada lugar, porque
 * `scripts/auditar-modulos.mts` mede a posição EXIBIDA da alternativa correta
 * para acusar viés — e essa medição só vale se a auditoria embaralhar
 * exatamente como a tela embaralha. Quando a semente ganhou a lição, a
 * auditoria passou a medir uma ordem que ninguém via; com a semente aqui, as
 * duas não têm como divergir de novo.
 */
export function sementeDoQuiz(headline: string, licao: number): string {
  return `${headline}|l${licao}`
}

/** As lições em que um quiz aparece: a de conceito e a de revisão. */
export const LICOES_COM_QUIZ = [1, 3] as const

/**
 * A ordem em que as alternativas aparecem, nesta lição.
 *
 * Semente diferente por lição quase sempre basta para a revisão sair noutra
 * ordem — mas "quase sempre" não serve: com poucas alternativas duas sementes
 * caem na mesma permutação de vez em quando, e a auditoria encontrou dois
 * quizzes reais nessa situação. Quando acontece, a lista é rotacionada em uma
 * posição, o que garante ordem diferente sem depender de sorte nem de mudar o
 * texto da pergunta.
 *
 * Continua determinístico: a mesma pessoa, na mesma lição, vê sempre o mesmo.
 */
export function ordemDoQuiz<T>(opcoes: T[], headline: string, licao: number): T[] {
  const ordem = embaralharPorSemente(opcoes, sementeDoQuiz(headline, licao))
  if (licao === 1 || opcoes.length < 2) return ordem

  const primeira = embaralharPorSemente(opcoes, sementeDoQuiz(headline, 1))
  const iguais = ordem.every((o, i) => o === primeira[i])
  return iguais ? [...ordem.slice(1), ordem[0]!] : ordem
}

/**
 * A última tela de fechamento do módulo ("Módulo completo", "Trilha completa").
 *
 * É um `conceito` no fim da fila que só faz sentido depois de tudo, então ela
 * pertence à ÚLTIMA lição, não à primeira com os outros conceitos. Reconhecida
 * pela posição (é a última) somada ao tipo, e não pelo texto do label: label é
 * conteúdo editorial e muda sem avisar ninguém.
 */
function ehFechamento(telas: TelaMinima[], indice: number): boolean {
  return indice === telas.length - 1 && telas[indice]!.tipo === "conceito" && telas.length > 1
}

/**
 * O mínimo para decidir a que lição uma tela pertence.
 *
 * Genérico porque a Trilha precisa CONTAR as lições de 67 módulos para desenhar
 * "2 de 4", e carregar o `conteudo` de 386 telas só para contar traria os
 * ~320 KB de JSON das aulas em cada abertura da tela. Contando por tipo e
 * ordem, a consulta não toca a coluna pesada.
 */
export interface TelaMinima {
  tipo: string
  ordem: number
}

/** O agrupamento, sobre qualquer coisa que tenha tipo e ordem. */
function agrupar<T extends TelaMinima>(telas: T[]): Record<NumeroLicao, T[]> {
  const ordenadas = [...telas].sort((a, b) => a.ordem - b.ordem)

  const conceitos: T[] = []
  const cenarios: T[] = []
  const quizzes: T[] = []
  const aplicacao: T[] = []
  let fechamento: T | null = null

  ordenadas.forEach((t, i) => {
    if (ehFechamento(ordenadas, i)) {
      fechamento = t
      return
    }
    if (t.tipo === "conceito") conceitos.push(t)
    else if (t.tipo === "cenario") cenarios.push(t)
    else if (t.tipo === "quiz") quizzes.push(t)
    else aplicacao.push(t) // input e resultado
  })

  const porLicao: Record<NumeroLicao, T[]> = {
    1: [...conceitos, ...quizzes],
    2: cenarios,
    3: quizzes,
    4: aplicacao,
  }

  // O fechamento vai na última lição que EXISTE neste módulo, não na 4 fixa.
  const ultima = ([4, 3, 2, 1] as NumeroLicao[]).find((n) => porLicao[n].length > 0)
  if (fechamento && ultima) porLicao[ultima].push(fechamento)

  return porLicao
}

/**
 * Quais lições este módulo tem, só pelos tipos das telas. Sem carregar
 * conteúdo — é o que a Trilha usa para desenhar o progresso de cada card.
 */
export function licoesExistentes(telas: TelaMinima[]): NumeroLicao[] {
  const porLicao = agrupar(telas)
  return ([1, 2, 3, 4] as NumeroLicao[]).filter((n) => porLicao[n].length > 0)
}

/**
 * Monta as lições de um módulo.
 *
 * Lição sem tela nenhuma NÃO entra no resultado: 4 dos 67 módulos não têm tela
 * `cenario`, e para eles a "História!" não existe. Devolver uma lição vazia
 * faria o player abrir uma lição em branco e o corredor pedir para concluir
 * algo que não dá para concluir. Por isso quem consome deve olhar o TAMANHO da
 * lista, nunca supor 4.
 */
export function montarLicoes(telas: TelaData[]): LicaoMontada[] {
  const porLicao = agrupar(telas)
  return TIPOS_LICAO.filter((t) => porLicao[t.licao as NumeroLicao].length > 0).map((t) => ({
    licao: t.licao as NumeroLicao,
    nome: t.nome,
    resumo: t.resumo,
    telas: porLicao[t.licao as NumeroLicao],
  }))
}

/** Quantas lições este módulo tem de verdade (3 ou 4, hoje). */
export function quantasLicoes(telas: TelaMinima[]): number {
  return licoesExistentes(telas).length
}

/** As telas de UMA lição, ou null se a lição não existe neste módulo. */
export function telasDaLicao(telas: TelaData[], licao: number): LicaoMontada | null {
  return montarLicoes(telas).find((l) => l.licao === licao) ?? null
}
