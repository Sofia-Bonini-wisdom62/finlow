/**
 * Nenhuma leitura de `Modulo` pode esquecer o filtro de público.
 *
 * POR QUE ISTO É UM TESTE E NÃO UMA CONVENÇÃO
 * Esquecer o `where` não dá erro: dá as duas trilhas misturadas. A aula de
 * Ensino Médio entra no bolo de recomendação de um adulto, a IA cita
 * "Estudar sem se afundar" para alguém de 38 anos, e ninguém descobre por
 * exceção — descobre por reclamação, semanas depois.
 *
 * O teste é textual de propósito. Um teste de runtime precisaria de banco,
 * usuário e leva montada para exercitar nove caminhos; a leitura do fonte
 * pega o caso que importa (alguém escreveu um findMany novo) sem nada disso,
 * e roda em milissegundos junto do build.
 *
 *   node --import tsx scripts/testar-publico.mts
 */
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

const RAIZES = ["app", "lib"]
const EXTENSOES = [".ts", ".tsx", ".mts"]

/** O arquivo que DEFINE o filtro não precisa usá-lo. */
const ISENTOS = ["lib/publico.ts"]

function arquivos(dir: string): string[] {
  const saida: string[] = []
  for (const nome of readdirSync(dir)) {
    if (nome === "node_modules" || nome.startsWith(".")) continue
    const caminho = join(dir, nome)
    if (statSync(caminho).isDirectory()) saida.push(...arquivos(caminho))
    else if (EXTENSOES.some((e) => nome.endsWith(e))) saida.push(caminho)
  }
  return saida
}

/**
 * Recorta a chamada inteira a partir de `db.modulo.find…`, contando parênteses.
 *
 * Procurar o filtro "na mesma linha" não serve: o `where` costuma estar três
 * linhas abaixo. Procurar "no arquivo" também não — um arquivo com duas
 * chamadas passaria com só uma delas filtrada, que é exatamente o bug.
 */
function chamadas(fonte: string): { trecho: string; linha: number }[] {
  const achados: { trecho: string; linha: number }[] = []
  const re = /db\.modulo\.(findMany|findFirst|findUnique|count)\s*\(/g
  let m: RegExpExecArray | null
  while ((m = re.exec(fonte)) !== null) {
    let profundidade = 0
    let i = m.index + m[0].length - 1
    const inicio = i
    do {
      if (fonte[i] === "(") profundidade++
      else if (fonte[i] === ")") profundidade--
      i++
    } while (profundidade > 0 && i < fonte.length)
    achados.push({
      trecho: fonte.slice(inicio, i),
      linha: fonte.slice(0, m.index).split("\n").length,
    })
  }
  return achados
}

let total = 0
let falhas = 0

for (const raiz of RAIZES) {
  for (const arquivo of arquivos(raiz)) {
    const rel = arquivo.replace(/\\/g, "/")
    if (ISENTOS.includes(rel)) continue
    const fonte = readFileSync(arquivo, "utf8")
    if (!fonte.includes("db.modulo.")) continue

    for (const { trecho, linha } of chamadas(fonte)) {
      total++
      if (trecho.includes("filtroDeModulo")) {
        console.log(`  ok   ${rel}:${linha}`)
      } else {
        console.log(`  ✗    ${rel}:${linha} — leitura de Modulo sem filtroDeModulo()`)
        falhas++
      }
    }
  }
}

console.log(`\n${total} leitura(s) de Modulo · ${falhas} sem filtro`)
if (falhas > 0) {
  console.log(
    "\nToda leitura de Modulo precisa de `...filtroDeModulo()` no where (lib/publico.ts).\n" +
      "Sem ele a trilha de Ensino Médio vaza para a biblioteca adulta em silêncio."
  )
}
process.exit(falhas === 0 ? 0 : 1)
