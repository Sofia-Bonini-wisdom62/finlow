/**
 * Confere o corretor do player do curso v2 contra TODO o conteúdo, sem banco.
 *
 *   node --import tsx scripts/testar-curso-player.mts
 *
 * Para cada um dos 5.268 itens (fila e reserva das 321 lições), monta a
 * resposta certa a partir do próprio conteúdo e exige que `corrigirItem`
 * aceite; monta uma errada e exige que recuse. É o teste que impede o caso
 * ruim de "a tela diz que acertou e o gabarito discorda" — o corretor roda
 * no cliente para o feedback e, quando houver `TentativaItem`, no servidor;
 * as duas pontas chamam a mesma função, então a conferência vale para ambas.
 *
 * Também garante que todo formato presente no conteúdo tem componente: um
 * formato novo que entrasse no JSON sem tela cairia no `default: null` do
 * `ItemRenderer` e a lição mostraria uma tela vazia sem erro nenhum.
 */
import { carregarCurso } from "../lib/licao/carregar.js"
import { corrigirItem, distanciaEstimativa, toleranciaAbsoluta } from "../lib/curso/corrigir.js"
import type { ConteudoItem, RespostaItem } from "../types/curso.js"

const FORMATOS_COM_TELA = new Set(["binaria", "escolha3", "classificar", "ordenar", "estimativa", "fecho"])

let falhas = 0
let conferidos = 0
const falhar = (onde: string, msg: string) => {
  console.log(`✗ ${onde}: ${msg}`)
  falhas++
}

const { licoes, erros } = carregarCurso()
if (erros.length) {
  console.log(`✗ o conteúdo não passa no próprio validador (${erros.length} erro(s)); rode scripts/validar-licoes.mts`)
  process.exit(1)
}

/** A resposta certa e uma errada, montadas do conteúdo. `null` quando não dá pra montar. */
function respostas(c: ConteudoItem): { certa: RespostaItem; errada: RespostaItem | null } | null {
  switch (c.formato) {
    case "binaria":
      return { certa: { formato: "binaria", valor: c.resposta }, errada: { formato: "binaria", valor: !c.resposta } }
    case "escolha3":
    case "fecho": {
      const certa = c.alternativas.findIndex((a) => a.correta)
      const errada = c.alternativas.findIndex((a) => !a.correta)
      if (certa < 0) return null
      return {
        certa: { formato: c.formato, indice: certa },
        errada: errada < 0 ? null : { formato: c.formato, indice: errada },
      }
    }
    case "ordenar": {
      const ordem = c.itens.map((_, pos) => c.itens.findIndex((i) => i.posicaoCorreta === pos + 1))
      if (ordem.some((i) => i < 0)) return null
      const invertida = [...ordem].reverse()
      return {
        certa: { formato: "ordenar", ordem },
        errada: ordem.length > 1 ? { formato: "ordenar", ordem: invertida } : null,
      }
    }
    case "classificar": {
      const mapa = Object.fromEntries(c.itens.map((i, idx) => [String(idx), i.caixaCorreta]))
      const outra = c.caixas.find((cx) => cx.id !== c.itens[0]?.caixaCorreta)?.id
      return {
        certa: { formato: "classificar", mapa },
        errada: outra ? { formato: "classificar", mapa: { ...mapa, "0": outra } } : null,
      }
    }
    case "estimativa": {
      const fora = c.gabarito + Math.max(toleranciaAbsoluta(c), 1) * 10
      return { certa: { formato: "estimativa", valor: c.gabarito }, errada: { formato: "estimativa", valor: fora } }
    }
    default:
      return null
  }
}

for (const [slug, l] of licoes) {
  for (const [lugar, lista] of [
    ["tela", l.telas],
    ["reserva", l.reserva],
  ] as const) {
    lista.forEach((item, i) => {
      const onde = `${slug} ${lugar} ${i + 1} (${item.formato})`
      if (!FORMATOS_COM_TELA.has(item.formato)) {
        falhar(onde, `formato "${item.formato}" sem componente no ItemRenderer`)
        return
      }
      const c = item as unknown as ConteudoItem
      const r = respostas(c)
      if (!r) {
        falhar(onde, "não deu para montar a resposta certa a partir do conteúdo")
        return
      }
      conferidos++
      if (!corrigirItem(c, r.certa)) falhar(onde, "a resposta certa foi recusada")
      if (r.errada && corrigirItem(c, r.errada)) falhar(onde, "uma resposta errada foi aceita")
      if (corrigirItem(c, undefined)) falhar(onde, "resposta ausente foi aceita")
      // Formato trocado nunca passa: é a barreira contra POST malformado.
      const trocada = { ...r.certa, formato: c.formato === "binaria" ? "escolha3" : "binaria" } as RespostaItem
      if (corrigirItem(c, trocada)) falhar(onde, "resposta de outro formato foi aceita")
    })
  }
}

// A distância da estimativa: sinal e escala (é o que a tela mostra).
const amostra: Extract<ConteudoItem, { formato: "estimativa" }> = {
  formato: "estimativa", pergunta: "", campo: "numero", min: 0, max: 200, gabarito: 100, toleranciaPct: 20,
  fonte: "teste", feedbackPerto: "", feedbackLonge: "",
}
if (distanciaEstimativa(amostra, 150) !== 50) falhar("distanciaEstimativa", "150 sobre 100 devia dar +50%")
if (distanciaEstimativa(amostra, 80) !== -20) falhar("distanciaEstimativa", "80 sobre 100 devia dar -20%")
if (distanciaEstimativa({ ...amostra, gabarito: 0 }, 5) !== null) falhar("distanciaEstimativa", "gabarito 0 devia dar null")
if (!corrigirItem(amostra, { formato: "estimativa", valor: 120 })) falhar("estimativa", "120 está dentro de 100 ± 20%")
if (corrigirItem(amostra, { formato: "estimativa", valor: 121 })) falhar("estimativa", "121 está fora de 100 ± 20%")

console.log(`\n${conferidos} itens conferidos em ${licoes.size} lições · ${falhas} falha(s)`)
process.exit(falhas === 0 ? 0 : 1)
