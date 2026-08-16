import { progressoDaTrilha, blocoDoProgresso } from "@/lib/consultas-trilha"

/**
 * O roteador de consultas do chat (pedido da fundadora, 15/08/2026).
 *
 * A arquitetura: a última mensagem da pessoa passa por detectores baratos e
 * determinísticos; quando um casa, a consulta correspondente roda NO BANCO e
 * o resultado chega ao modelo já pronto, junto com a instrução do
 * especialista. O modelo nunca inventa o dado nem decide sozinho quando
 * buscá-lo: quem sabe SQL é o roteador, quem sabe conversar é o modelo.
 *
 * Detector por palavra, e não por segunda chamada de IA, de propósito: é
 * auditável (a bateria testa frases reais), não custa token e erra para o
 * lado barato. Falso negativo cai na conversa normal, que continua sabendo a
 * linha curta de progresso; falso positivo só carrega um bloco a mais.
 *
 * Consulta nova entra NESTA lista, com detector e instrução próprios: é o
 * ponto único de extensão.
 */

export interface ConsultaRoteada {
  id: string
  /** A instrução do especialista, anexada ao prompt de sistema. */
  instrucao: string
  /** O resultado da consulta ao banco, em texto pronto pro prompt. */
  bloco: string
}

/** minúsculas e sem acento, para o detector não depender de digitação. */
function normalizar(t: string): string {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

const CONSULTAS: {
  id: string
  detecta: (textoNormalizado: string) => boolean
  executar: (userId: string) => Promise<{ instrucao: string; bloco: string }>
}[] = [
  {
    id: "resumo_aprendizado",
    // Duas metades: um gatilho de retomada (resumir, revisar, relembrar) E uma
    // palavra de aprendizado na mesma mensagem. "Resumo dos meus gastos" tem a
    // primeira metade e não a segunda, e segue pro caminho financeiro normal.
    detecta: (t) =>
      (/(resum|recapitul|revis|relembr)/.test(t) &&
        /(aprend|estud|trilha|aula|licao|licoes|modulo|exercicio)/.test(t)) ||
      /o que (eu )?(ja )?(aprendi|estudei)/.test(t) ||
      /(quais|que) (aulas?|licoes|modulos?) (eu )?(ja )?(fiz|conclui|terminei|completei)/.test(t),
    executar: async (userId) => ({
      instrucao:
        "A pessoa quer entender o que já aprendeu na trilha. Responda a partir " +
        "da lista de aulas abaixo, que veio do banco: cite as aulas pelo título, " +
        "resuma em uma frase o que cada uma ensina (o subtítulo diz o conteúdo) " +
        "e aponte onde o acerto ficou baixo, sem tom de cobrança. Não invente " +
        "aula que não está na lista.",
      bloco: blocoDoProgresso(await progressoDaTrilha(userId)),
    }),
  },
]

/**
 * Roteia a última mensagem da pessoa. null = nenhuma consulta casou, e a
 * conversa segue com o contexto de sempre.
 */
export async function rotearConsulta(
  userId: string,
  ultimaMensagem: string
): Promise<ConsultaRoteada | null> {
  const texto = normalizar(ultimaMensagem)
  for (const c of CONSULTAS) {
    if (c.detecta(texto)) {
      const r = await c.executar(userId)
      return { id: c.id, ...r }
    }
  }
  return null
}

/** Exposto para a bateria exercitar os detectores sem banco. */
export function consultaQueCasa(texto: string): string | null {
  const t = normalizar(texto)
  return CONSULTAS.find((c) => c.detecta(t))?.id ?? null
}
