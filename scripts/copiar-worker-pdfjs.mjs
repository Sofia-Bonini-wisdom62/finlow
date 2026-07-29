/**
 * Copia o worker do pdfjs para public/ como asset estático.
 *
 * A leitura do PDF acontece no NAVEGADOR (ver lib/extrato/ler-no-navegador.ts).
 * O pdfjs precisa do worker por URL, e servir de public/ é o único caminho que
 * não depende de empacotador nenhum — foi justamente tentar resolver esse
 * arquivo pelo bundler que derrubou o deploy duas vezes (require.resolve com
 * variável, e outputFileTracingIncludes atravessando symlink do pnpm).
 *
 * Aqui require.resolve é seguro: este script roda no Node puro, em tempo de
 * install/build, sem bundler no meio. É a diferença que faltou na primeira
 * tentativa.
 *
 * Pendurado em postinstall E prebuild de propósito. O worker é versionado no
 * git (para `next dev` funcionar em clone novo, que não roda prebuild), e um
 * worker de versão diferente do pdfjs instalado falha com
 * "The API version does not match the Worker version" — erro que não diz o que
 * fazer. Recopiar a cada install mata esse desencontro na raiz.
 */
import { copyFileSync, mkdirSync, existsSync, readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"

const require = createRequire(import.meta.url)

let origem
try {
  const raiz = dirname(require.resolve("pdfjs-dist/package.json"))
  origem = join(raiz, "build", "pdf.worker.min.mjs")
  if (!existsSync(origem)) throw new Error(`existe o pacote, mas não ${origem}`)
} catch (e) {
  console.error(
    "[worker] não achei o pdf.worker.min.mjs do pdfjs-dist.\n" +
    "         A leitura de PDF no navegador não vai funcionar sem ele.\n" +
    `         Detalhe: ${e.message}`
  )
  process.exit(1)
}

const destino = join("public", "pdf.worker.min.mjs")
mkdirSync("public", { recursive: true })

// Sem reescrever quando já está igual: evita sujar o git status a cada install.
if (existsSync(destino) && readFileSync(destino).equals(readFileSync(origem))) {
  console.log("[worker] public/pdf.worker.min.mjs já está na versão instalada")
} else {
  copyFileSync(origem, destino)
  const versao = require("pdfjs-dist/package.json").version
  console.log(`[worker] copiado (pdfjs-dist ${versao})`)
}
