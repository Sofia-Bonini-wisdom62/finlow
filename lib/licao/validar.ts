/**
 * O contrato de uma lição do curso escolar v2, cobrado por código.
 *
 * O SEED ABORTA se qualquer limite estourar, e isso é o ponto: o conteúdo é
 * escrito em massa por agentes a partir de `docs/agente-de-licoes.md`, e a
 * revisão humana de 5.268 itens não acontece. O que segura a qualidade é este
 * arquivo — limite de caracteres, composição tela a tela, feedback obrigatório
 * nas alternativas erradas e, principalmente, a ARITMÉTICA RECALCULADA.
 *
 * POR QUE A CONTA É RECALCULADA E NÃO CONFERIDA NA LEITURA
 * Um gabarito errado numa lição de juros não parece errado: "R$ 2.400 a 14% ao
 * mês viram R$ 4.053 em 4 meses" passa por qualquer revisor que não abra a
 * calculadora. Com `verificacao`, quem confere é o `Function()` — e a lição não
 * entra no banco se a expressão não bater com o número que o texto afirma.
 */
import { CUSTO, LIMITES, composicaoDe, custoLicao, type Formato, type Papel } from "./formatos"

export type Alternativa = { texto: string; correta: boolean; feedbackErro?: string | null }

export type ItemLicao = {
  formato: Formato
  papel: Papel
  conceitoId: string
  dificuldade?: number
  criterio?: string
  enunciado?: string
  pergunta?: string
  instrucao?: string
  resposta?: boolean
  ancora?: string
  feedbackErro?: string
  alternativas?: Alternativa[]
  itens?: { texto: string; caixaCorreta?: string; posicaoCorreta?: number; feedbackErro?: string }[]
  caixas?: { id: string; rotulo: string }[]
  campo?: string
  min?: number
  max?: number
  gabarito?: number
  toleranciaPct?: number
  fonte?: string
  feedbackPerto?: string
  feedbackLonge?: string
  /** Obrigatório em todo item cujo gabarito vem de uma conta. */
  verificacao?: { expressao: string; esperado: number; tolerancia?: number }
}

export type Licao = {
  slug: string
  segmento: string
  conceitoPrincipal: string
  /** A definição do conceito em ≤140 caracteres. Só no encontro 1. */
  fraseConceito?: string
  telas: ItemLicao[]
  reserva: ItemLicao[]
}

/**
 * O que pode aparecer numa expressão de verificação.
 *
 * SEM LETRAS, para que nenhuma expressão consiga chamar função — isto vai para
 * um `Function()`, e a fonte é um arquivo JSON escrito por agente.
 *
 * SEM VÍRGULA, e essa parte não é sobre segurança: em JS `(1,5)` é o operador
 * vírgula e vale 5, não 1,5. Quem escreve conteúdo em português digita decimal
 * com vírgula por reflexo, e a expressão passaria avaliando o número errado —
 * em silêncio, com o validador dando ✓. Nenhuma das 689 contas de hoje usa
 * vírgula; a regra existe para a 690ª.
 *
 * SEM `%` pelo mesmo motivo: em JS é resto de divisão, e em texto de finanças
 * lê-se como porcentagem. As duas leituras divergem sem avisar.
 */
const SEGURO = /^[0-9+\-*/().\s^]+$/

export function avaliar(expr: string): number {
  if (!SEGURO.test(expr)) throw new Error(`expressão não permitida: ${expr}`)
  return Function(`"use strict";return (${expr.replace(/\^/g, "**")});`)() as number
}

export function validarLicao(l: Licao): string[] {
  const e: string[] = []
  const push = (m: string) => e.push(`[${l.slug}] ${m}`)
  const comp = composicaoDe(l.segmento)

  if (l.telas.length !== comp.length) push(`${l.telas.length} telas, esperado ${comp.length}`)
  l.telas.forEach((t, i) => {
    const esperado = comp[i]
    if (esperado && t.papel !== esperado.papel)
      push(`tela ${i + 1}: papel ${t.papel}, esperado ${esperado.papel}`)
    if (!CUSTO[t.formato]) push(`tela ${i + 1}: formato desconhecido ${t.formato}`)
  })

  const custo = custoLicao(l.telas.map((t) => t.formato))
  if (custo > LIMITES.custoMaxSeg) push(`custo ${custo}s acima do teto de ${LIMITES.custoMaxSeg}s`)

  if (l.fraseConceito && l.fraseConceito.length > LIMITES.frase)
    push(`fraseConceito com ${l.fraseConceito.length} car., limite ${LIMITES.frase}`)

  let respostas = 0
  for (const [i, t] of l.telas.entries()) {
    const n = `tela ${i + 1} (${t.formato})`
    const max = (campo: string, txt: string | undefined, lim: number) => {
      if (txt && txt.length > lim) push(`${n}: ${campo} com ${txt.length} car., limite ${lim}`)
    }
    max("enunciado", t.enunciado, LIMITES.enunciado)
    max("pergunta", t.pergunta, LIMITES.enunciado)
    max("instrucao", t.instrucao, LIMITES.instrucao)
    max("criterio", t.criterio, LIMITES.criterio)
    max("ancora", t.ancora, LIMITES.ancora)
    max("feedbackErro", t.feedbackErro, LIMITES.feedback)
    if (!t.conceitoId) push(`${n}: sem conceitoId`)

    switch (t.formato) {
      case "binaria":
        if (typeof t.resposta !== "boolean") push(`${n}: sem resposta booleana`)
        if (!t.feedbackErro) push(`${n}: sem feedback de erro`)
        if (!t.criterio) push(`${n}: sem critério fixo`)
        respostas += 1
        break
      case "escolha3":
      case "fecho": {
        const alts = t.alternativas ?? []
        const lim = t.formato === "fecho" ? LIMITES.alternativaFecho : LIMITES.alternativa
        if (alts.length !== LIMITES.alternativasEscolha3)
          push(`${n}: ${alts.length} alternativas, exigido 3`)
        if (alts.filter((a) => a.correta).length !== 1) push(`${n}: precisa de exatamente 1 correta`)
        alts.forEach((a, j) => {
          if (a.texto.length > lim)
            push(`${n}: alternativa ${j + 1} com ${a.texto.length} car., limite ${lim}`)
          if (!a.correta && !a.feedbackErro) push(`${n}: alternativa errada ${j + 1} sem feedback`)
          if (a.feedbackErro && a.feedbackErro.length > LIMITES.feedback)
            push(`${n}: feedback ${j + 1} com ${a.feedbackErro.length} car.`)
        })
        respostas += 1
        break
      }
      case "classificar":
      case "ordenar": {
        const its = t.itens ?? []
        if (its.length < 3 || its.length > 6) push(`${n}: ${its.length} itens, esperado 3 a 6`)
        if (t.formato === "classificar" && (t.caixas?.length ?? 0) !== 2)
          push(`${n}: precisa de 2 caixas`)
        if (!t.feedbackErro && !its.every((i) => i.feedbackErro)) push(`${n}: sem feedback de erro`)
        respostas += its.length
        break
      }
      case "estimativa":
        if (typeof t.gabarito !== "number") push(`${n}: sem gabarito`)
        if (!t.fonte) push(`${n}: estimativa sem campo 'fonte', rejeitada`)
        if (!t.feedbackPerto || !t.feedbackLonge) push(`${n}: faltam os dois feedbacks`)
        respostas += 1
        break
      case "caca_erro":
        respostas += 1
        break
    }

    if (t.verificacao) {
      try {
        const v = avaliar(t.verificacao.expressao)
        const tol = t.verificacao.tolerancia ?? 0.01
        if (Math.abs(v - t.verificacao.esperado) > tol)
          push(`${n}: CONTA ERRADA: ${t.verificacao.expressao} = ${v}, item diz ${t.verificacao.esperado}`)
      } catch (err) {
        push(`${n}: expressão inválida (${(err as Error).message})`)
      }
    }
  }

  const minResp = l.segmento === "ef12" ? LIMITES.respostasMinEf12 : LIMITES.respostasMin
  if (respostas < minResp) push(`${respostas} respostas avaliáveis, mínimo ${minResp}`)
  if (l.reserva.length < LIMITES.itensReserva)
    push(`${l.reserva.length} itens de reserva, mínimo ${LIMITES.itensReserva}`)

  // A reserva alimenta a repetição espaçada. Repetir um enunciado da própria
  // lição faria a revisão medir memória da RESPOSTA, não do conceito — e variar
  // de formato é o que força transferência em vez de reconhecimento.
  const textosLicao = new Set(
    l.telas.map((t) => (t.enunciado ?? t.pergunta ?? "").trim()).filter(Boolean)
  )
  l.reserva.forEach((r, i) => {
    const txt = (r.enunciado ?? r.pergunta ?? "").trim()
    if (txt && textosLicao.has(txt)) push(`reserva ${i + 1}: repete um enunciado da lição`)
    if (r.papel !== "reserva") push(`reserva ${i + 1}: papel deve ser "reserva"`)
  })
  if (new Set(l.reserva.map((r) => r.formato)).size < 2)
    push(`reserva precisa de ao menos 2 formatos distintos`)

  return e
}
