/**
 * Testa o JORRO do chat: a resposta que aparece enquanto o modelo escreve.
 *
 * POR QUE ISTO EXISTE
 * O assistente responde em JSON porque a tela precisa separar texto de card, de
 * lançamento e de proposta de teto. JSON não é legível pela metade — e a metade
 * é justamente o que trafega enquanto o modelo escreve. `lib/resposta-parcial.ts`
 * é quem lê esse pedaço sem adivinhar nada, e este arquivo é o que garante que
 * ele continue sem adivinhar.
 *
 * As três coisas que precisam continuar verdadeiras:
 *
 *  1. **Nada sai pela metade de um caractere.** Escape cortado (`\u00e`),
 *     barra invertida sozinha, meio par substituto de emoji: tudo espera o
 *     resto chegar. Um `\u00e` cru na bolha é pior do que meio segundo a menos.
 *  2. **O `texto` do card não vira a resposta.** Card de recomendação e de
 *     lembrete têm um campo chamado `texto`, e a ordem das chaves é do modelo.
 *     Uma busca ingênua mostraria o texto do card na bolha.
 *  3. **A trava de conteúdo continua valendo com o jorro ligado.** O termo
 *     proibido que se completa no meio do caminho tem de travar o fluxo ANTES
 *     de o pedaço sair — não depois, quando já estaria na tela de alguém.
 *
 * Nada disso quebra build, typecheck ou lint: um jorro que mostra `\u00e`, ou
 * que deixa passar o que a trava deveria barrar, compila perfeitamente.
 *
 * A segunda metade do arquivo olha o CÓDIGO das duas pontas — rota e tela.
 * Streaming é um contrato entre dois arquivos que ninguém compila junto: se a
 * tela parar de pedir jorro, ou a rota parar de responder em SSE, o chat volta
 * calado para os 5–15 segundos de pontinhos e tudo continua "funcionando".
 *
 * Roda SEM banco, sem build e sem chamar a Vertex.
 *
 *   node --import tsx scripts/testar-jorro.mts
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { textoParcial, FluxoDeTexto } from "../lib/resposta-parcial.js"
import { contemConteudoProibido } from "../lib/conteudo-proibido.js"

const raiz = join(import.meta.dirname, "..")
const ler = (p: string) => readFileSync(join(raiz, p), "utf8")

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

/**
 * Corta um JSON em pedaços de `n` caracteres, como a rede faz.
 *
 * O tamanho pequeno é de propósito: é ele que põe a fronteira do pedaço no meio
 * de um escape, que é o caso que quebra parser ingênuo.
 */
function pedacos(bruto: string, n: number): string[] {
  const saida: string[] = []
  for (let i = 0; i < bruto.length; i += n) saida.push(bruto.slice(i, i + n))
  return saida
}

/** Roda o fluxo pedaço a pedaço e devolve o que foi emitido, em ordem. */
function jorrar(bruto: string, tamanho: number, barrar?: (t: string) => boolean) {
  const fluxo = new FluxoDeTexto(barrar)
  const emitidos: string[] = []
  let acumulado = ""
  for (const p of pedacos(bruto, tamanho)) {
    acumulado += p
    const novo = fluxo.avancar(acumulado)
    if (novo) emitidos.push(novo)
  }
  return { emitidos, fluxo, texto: emitidos.join("") }
}

// ------------------------------------------------ o texto, letra a letra ---
console.log("\ntexto parcial: o que já dá para mostrar")

const RESPOSTA = JSON.stringify({
  texto: "Você gastou R$ 1.240,00 com delivery em julho.\nÉ 18% do que entrou — dá para diminuir sem cortar o que você gosta.",
  cards: [
    { tipo: "recomendacao", titulo: "Delivery sem culpa", texto: "Uma aula curta sobre gasto repetido.", moduloSlug: "gasto-invisivel" },
  ],
  memorias: [],
})

checar("nada a mostrar antes de o campo chegar", textoParcial('{"cards":[') === "")
checar(
  "mostra o que já veio, com a string ainda aberta",
  textoParcial('{"texto":"Você gastou R$ 1.2') === "Você gastou R$ 1.2"
)
checar(
  "o texto completo bate com o que o JSON.parse devolveria",
  jorrar(RESPOSTA, 7).texto === JSON.parse(RESPOSTA).texto
)
checar(
  "os pedaços emitidos nunca repetem nem voltam atrás",
  (() => {
    const { emitidos } = jorrar(RESPOSTA, 3)
    let montado = ""
    for (const p of emitidos) {
      montado += p
      if (!JSON.parse(RESPOSTA).texto.startsWith(montado)) return false
    }
    return montado === JSON.parse(RESPOSTA).texto
  })()
)

// ------------------------------------------------------- escapes e emoji ---
console.log("\nnada sai pela metade de um caractere")

checar(
  "escape de aspas e de barra chega decodificado",
  jorrar(JSON.stringify({ texto: 'Ele disse "não" \\ e saiu' }), 4).texto === 'Ele disse "não" \\ e saiu'
)
checar(
  "quebra de linha vira quebra de linha, não \\n na tela",
  jorrar(JSON.stringify({ texto: "linha 1\nlinha 2" }), 5).texto === "linha 1\nlinha 2"
)
checar(
  "escape \\u cortado no meio espera o resto",
  textoParcial('{"texto":"caf\\u00e') === "caf"
)
checar(
  "barra invertida sozinha no fim do pedaço espera o resto",
  textoParcial('{"texto":"caf\\') === "caf"
)
checar(
  "\\u completo vira o caractere",
  textoParcial('{"texto":"caf\\u00e9"') === "café"
)
checar(
  "meio par substituto de emoji não vai para a tela",
  textoParcial('{"texto":"boa \\ud83d') === "boa "
)
checar(
  "o emoji aparece inteiro quando o par fecha",
  textoParcial('{"texto":"boa \\ud83d\\ude00') === "boa 😀"
)

// ------------------------------------------- o card não vira a resposta ---
console.log("\no campo texto do card não é a resposta")

const CARD_PRIMEIRO = '{"cards":[{"tipo":"lembrete","titulo":"Fatura","texto":"Vence dia 10"}],"texto":"Sua fatura'
checar(
  "com os cards vindo antes, a bolha mostra a RESPOSTA, não o card",
  textoParcial(CARD_PRIMEIRO) === "Sua fatura"
)
checar(
  "com o card ainda aberto e nenhuma resposta, não mostra nada",
  textoParcial('{"cards":[{"tipo":"lembrete","titulo":"Fatura","texto":"Vence dia') === ""
)
checar(
  "chave texto dentro de objeto aninhado não conta",
  textoParcial('{"cards":[{"texto":"do card"}],"outro":1}') === ""
)
checar(
  "valor que não é string não é inventado",
  textoParcial('{"texto":123') === ""
)

// --------------------------------------------------- trava de conteúdo ---
console.log("\ntrava de conteúdo com o jorro ligado")

const PROIBIDA = JSON.stringify({ texto: "Que caralho de fatura é essa" })
const barrado = jorrar(PROIBIDA, 4, contemConteudoProibido)

checar("o fluxo trava quando o termo se completa", barrado.fluxo.barrado)
checar(
  "o termo proibido NUNCA foi emitido",
  !contemConteudoProibido(barrado.texto),
  `emitido: ${JSON.stringify(barrado.texto)}`
)
checar(
  "depois de travado, o fluxo não volta a emitir",
  barrado.fluxo.avancar(PROIBIDA + '} extra') === ""
)
checar(
  "resposta limpa não é barrada",
  !jorrar(RESPOSTA, 6, contemConteudoProibido).fluxo.barrado
)

// ------------------------------------------------- o contrato das pontas ---
console.log("\no contrato entre a rota e a tela")

const rota = ler("app/api/chat/route.ts")
const tela = ler("components/chat/ChatIA.tsx")
const ia = ler("lib/ia.ts")

checar(
  "a tela pede o jorro",
  /stream:\s*true/.test(tela)
)
checar(
  "a rota responde em SSE quando o jorro é pedido",
  rota.includes("text/event-stream") && /stream\s*===\s*true/.test(rota)
)
checar(
  "a rota manda os três eventos: texto, fim e erro",
  ['enviar("texto"', 'enviar("fim"', 'enviar("erro"'].every((e) => rota.includes(e))
)
checar(
  "a tela entende os três",
  ['"texto"', '"fim"', '"erro"'].every((e) => tela.includes(`nome === ${e}`))
)
checar(
  "o proxy é proibido de juntar os pedaços",
  rota.includes("no-transform") && rota.includes("X-Accel-Buffering")
)
checar(
  "quem não pode responder continua dizendo isso ANTES de abrir o jorro",
  rota.includes("vertexConfigurada()") && rota.includes("ia_nao_configurada")
)
checar(
  "o fecho do turno é UM só (memória, recomendação e histórico não têm cópia)",
  (rota.match(/guardarTurno\(/g) ?? []).length === 1 &&
    (rota.match(/guardarMemorias\(/g) ?? []).length === 1
)
checar(
  "o texto final substitui o parcial em vez de somar com ele",
  /emCurso = ""/.test(tela) && /texto: dados\.texto/.test(tela)
)
checar(
  "a trava de conteúdo está ligada no fluxo, não só no fim",
  /new FluxoDeTexto\(contemConteudoProibido\)/.test(ia)
)
checar(
  "o jorro é opcional: quem não passa aoTexto continua na chamada de uma vez",
  ia.includes("generateContent(pedido)") && ia.includes("generateContentStream(pedido)")
)

// --------------------------------------- o gesto que a tela prometia ---
console.log("\narrastar e soltar: o gesto sugerido pelo campo de escrever")

const prometeSoltar = /solte .*aqui|solta .*aqui/i.test(tela)
checar("o campo continua convidando a soltar o arquivo", prometeSoltar)
checar(
  "e existe handler de drop para o convite (sem ele o navegador abre o arquivo)",
  !prometeSoltar || (tela.includes("onDrop=") && tela.includes("onDragOver="))
)
checar(
  "o dragOver chama preventDefault — é ele que permite o drop",
  /onDragOver=\{\(e\) => \{[\s\S]*?e\.preventDefault\(\)/.test(tela)
)
checar(
  "clipe e arrastar caem no MESMO caminho de leitura",
  (tela.match(/receberArquivos\(/g) ?? []).length >= 3
)

// --------------------------------------------------------------- fim ---
console.log(
  falhas === 0
    ? "\n✅ o jorro mostra só o que dá para afirmar, e a trava continua de pé\n"
    : `\n❌ ${falhas} falha(s)\n`
)
process.exit(falhas === 0 ? 0 : 1)
