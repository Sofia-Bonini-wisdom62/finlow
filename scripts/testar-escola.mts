/**
 * Bateria do Finlow para Escolas: a regra de acesso escolar e a varredura que
 * garante que toda rota de /api/escola escolheu um papel.
 *
 * ⚠️ PRECISA DE `--conditions react-server` (mesmo motivo de testar-pagamento):
 *
 *   node --conditions react-server --import tsx scripts/testar-escola.mts
 *
 * A varredura é irmã da de testar-publico.mts: ela não garante que o papel
 * certo foi exigido — garante que a ESCOLHA foi feita. Uma rota sob
 * app/api/escola/ que não menciona `exigirPapel` é uma rota em que ninguém
 * decidiu quem pode entrar, e o default do Next é responder a qualquer um.
 * A bateria nasce passando com zero rotas: o guard vale desde a primeira.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { decidirAcessoEscolar } from "../lib/pagamento/acesso.js"

let falhas = 0
let total = 0

function conferir(nome: string, obtido: unknown, esperado: unknown) {
  total++
  const ok = JSON.stringify(obtido) === JSON.stringify(esperado)
  if (!ok) {
    falhas++
    console.log(`  ✗ ${nome}\n      esperado: ${JSON.stringify(esperado)}\n      obtido:   ${JSON.stringify(obtido)}`)
  } else {
    console.log(`  ✓ ${nome}`)
  }
}

const AGORA = new Date("2026-08-11T15:00:00-03:00")
const ONTEM = new Date("2026-08-10T15:00:00-03:00")
const AMANHA = new Date("2026-08-12T15:00:00-03:00")

console.log("\ndecidirAcessoEscolar — a regra escolar")
conferir("ativa sem prazo libera (piloto)", decidirAcessoEscolar("ativa", null, AGORA), true)
conferir("ativa com prazo futuro libera", decidirAcessoEscolar("ativa", AMANHA, AGORA), true)
conferir("ativa com prazo vencido nega", decidirAcessoEscolar("ativa", ONTEM, AGORA), false)
// A borda exata, igual à do inadimplente em decidirAcesso: vigência IGUAL a
// agora já venceu. Se virar `>=`, a escola ganha um instante de graça — e o
// teste existe para ninguém "arrumar" isso sem perceber.
conferir("ativa com prazo IGUAL a agora nega", decidirAcessoEscolar("ativa", AGORA, AGORA), false)
conferir("suspensa nega mesmo com prazo futuro", decidirAcessoEscolar("suspensa", AMANHA, AGORA), false)
conferir("suspensa sem prazo nega", decidirAcessoEscolar("suspensa", null, AGORA), false)
conferir("status desconhecido nega", decidirAcessoEscolar("pendente", AMANHA, AGORA), false)
conferir("sem escola (null) nega", decidirAcessoEscolar(null, null, AGORA), false)
conferir("undefined nega", decidirAcessoEscolar(undefined, undefined, AGORA), false)

// ------------------------------------------------- rotas sem papel exigido ---
console.log("\nrotas de /api/escola — toda rota escolheu um papel?")

function rotasDe(dir: string): string[] {
  if (!existsSync(dir)) return []
  const achadas: string[] = []
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const caminho = join(dir, item.name)
    if (item.isDirectory()) achadas.push(...rotasDe(caminho))
    else if (item.name === "route.ts") achadas.push(caminho)
  }
  return achadas
}

const rotas = rotasDe("app/api/escola")
let semGuard = 0
for (const rota of rotas) {
  const fonte = readFileSync(rota, "utf8")
  if (!/exigirPapel\s*\(/.test(fonte)) {
    console.log(`  ✗ ${rota} não menciona exigirPapel — ninguém decidiu quem entra`)
    semGuard++
    falhas++
  }
}
total++
if (semGuard === 0) console.log(`  ✓ ${rotas.length} rota(s), todas com exigirPapel`)

console.log(`\n${total} verificações · ${falhas} falha(s)`)
process.exit(falhas === 0 ? 0 : 1)
