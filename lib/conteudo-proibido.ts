/**
 * Trava de conteúdo impróprio: baixo calão e conotação sexual.
 *
 * Decisão da fundadora (03/08/2026): o assistente não cita, não repete e não
 * GRAVA texto com esse conteúdo — nem em resposta, nem em memória, lançamento,
 * apelido ou conta fixa.
 *
 * DUAS CAMADAS, DE PROPÓSITO
 * O prompt instrui o modelo a recusar o assunto; este arquivo é o que garante
 * quando a instrução falhar. Prompt é pedido, não garantia — é a lição que se
 * repetiu a sessão inteira.
 *
 * O CUIDADO QUE IMPORTA TANTO QUANTO A LISTA
 * Filtro léxico erra para os dois lados, e o falso positivo aqui é grave:
 * "Pinto" é sobrenome (inclusive da fundadora), "transação" contém "transa",
 * "disputa" contém "puta". Por isso a lista tem dois regimes:
 *
 *  - SUBSTRING só para radicais que não existem dentro de palavra inocente;
 *  - PALAVRA EXATA (com borda) para tudo que é ambíguo como fragmento.
 *
 * E termos curtos demais ou de duplo uso corrente ("pau", "rola", "gozo")
 * ficam FORA: numa conversa sobre dinheiro, "não rola parcelar" e "meio pau"
 * são linguagem normal, e barrá-los quebraria conversa legítima.
 *
 * O EXTRATO FICA FORA DA TRAVA
 * A descrição de linha de extrato vem do banco da própria pessoa e só ela vê.
 * Bloquear uma linha faria a conciliação não fechar por causa do nome de um
 * estabelecimento — o custo do falso positivo é maior que o ganho.
 */

/** Radicais inequívocos: não aparecem dentro de palavra inocente em PT-BR. */
const RADICAIS = [
  "caralh",
  "buceta",
  "boceta",
  "piroca",
  "punhet",
  "siriric",
  "boquete",
  "xoxota",
  "xereca",
  "masturb",
  "pornograf",
  "prostitu",
  "arrombad",
  "orgasm",
  "cuzao",
  "vagabund",
  "fodid",
]

/** Palavra exata: como fragmento seriam falso positivo ("transação", "disputa"). */
const PALAVRAS = [
  "cu",
  "puta", "putas", "puto", "putos",
  "porra", "porras",
  "merda", "merdas",
  "bosta", "bostas",
  "foda", "fodas", "fodase", "foder", "fode", "fodeu", "fodi",
  "transa", "transar", "transou",
  "tesao",
  "sexo", "sexual", "sexy",
  "porno", "pornos",
  "nude", "nudes",
  "penis", "vagina", "anus",
  "viado", "viados",
  "escroto", "escrota",
  "cacete", "cacetada",
  "pica", "picas",
  "gozada", "gozadas",
  "xana",
  "putaria", "sacanagem", "safadeza",
  // siglas chulas correntes
  "fdp", "pqp", "vsf", "vtnc", "tnc", "krl", "bct",
]

/**
 * Normaliza para comparação: minúsculas, sem acento, leet desfeito e
 * repetições colapsadas.
 *
 * O leet (p0rra, m3rda) só é desfeito quando o dígito está ENTRE letras.
 * Num app financeiro os textos são cheios de números legítimos ("Uber 40",
 * "13º") e trocar dígito por letra no texto inteiro fabricaria palavras que
 * nunca existiram.
 */
function normalizar(texto: string): string {
  let t = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
  t = t.replace(/(?<=[a-z])[01345@$](?=[a-z])/g, (d) =>
    ({ "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "@": "a", "$": "s" })[d] ?? d
  )
  return t
}

/** "porrrra" e "caraaaalho" contam como a palavra que tentam disfarçar. */
function variantes(t: string): string[] {
  return [t, t.replace(/([a-z])\1{2,}/g, "$1"), t.replace(/([a-z])\1{2,}/g, "$1$1")]
}

const REGEX_PALAVRAS = new RegExp(`(?<![a-z])(${PALAVRAS.join("|")})(?![a-z])`)

export function contemConteudoProibido(texto: string): boolean {
  if (!texto) return false
  for (const v of variantes(normalizar(texto))) {
    if (RADICAIS.some((r) => v.includes(r))) return true
    if (REGEX_PALAVRAS.test(v)) return true
  }
  return false
}

/**
 * A resposta que o chat dá no lugar do que foi barrado.
 *
 * Não repete o termo, não dá bronca e volta para o assunto do app — o mesmo
 * tom da recusa que o prompt instrui, para a pessoa não distinguir qual camada
 * a atendeu.
 */
export const RESPOSTA_FORA_DE_ESCOPO =
  "Esse assunto eu não acompanho. Eu funciono melhor falando do seu dinheiro: " +
  "posso olhar seus gastos do mês, montar um teto de orçamento ou te indicar " +
  "uma aula da trilha. Por onde quer começar?"
