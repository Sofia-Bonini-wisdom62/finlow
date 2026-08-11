/**
 * Bateria do convite de escola: a regra pura de recusa e o formato do código.
 *
 *   node --import tsx scripts/testar-convite.mts
 *
 * O resgate de verdade (transação, teto atômico, MembroEscola) depende de
 * banco e é exercitado pelo fluxo manual documentado em
 * docs/estado-do-produto.md. O que dá para provar sem banco é a REGRA — e é
 * ela que o preview e o updateMany do resgate compartilham: se
 * motivoDeRecusa mudar sem o where mudar junto, o preview promete o que o
 * resgate recusa, e este arquivo é onde essa regra tem os casos escritos.
 */
import { config } from "dotenv"
config({ path: ".env.local" }); config({ path: ".env" })

const { motivoDeRecusa } = await import("../lib/convite-escola.js")
const { FORMATO_CODIGO, gerarCodigo } = await import("../lib/indicacao.js")

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

const vivo = { revogadoEm: null, expiraEm: AMANHA, usos: 0, usosMax: 50 }

console.log("\nmotivoDeRecusa — o trio que freia o código multiuso")
conferir("convite vivo passa", motivoDeRecusa(vivo, AGORA), null)
conferir("revogado recusa", motivoDeRecusa({ ...vivo, revogadoEm: ONTEM }, AGORA), "revogado")
conferir("expirado recusa", motivoDeRecusa({ ...vivo, expiraEm: ONTEM }, AGORA), "expirado")
// Borda exata, igual a decidirAcesso/decidirAcessoEscolar: expira AGORA já
// expirou. O where do resgate usa `gt`, e os dois têm de concordar.
conferir("expira exatamente agora recusa", motivoDeRecusa({ ...vivo, expiraEm: AGORA }, AGORA), "expirado")
conferir("teto atingido recusa", motivoDeRecusa({ ...vivo, usos: 50 }, AGORA), "esgotado")
conferir("último uso ainda passa", motivoDeRecusa({ ...vivo, usos: 49 }, AGORA), null)
// A ordem importa para a mensagem: revogado ganha de expirado — "a escola
// cancelou" explica mais do que "venceu" quando as duas coisas são verdade.
conferir(
  "revogado E expirado diz revogado",
  motivoDeRecusa({ ...vivo, revogadoEm: ONTEM, expiraEm: ONTEM }, AGORA),
  "revogado"
)

console.log("\ncódigo — o mesmo formato da indicação")
for (let i = 0; i < 3; i++) {
  const c = gerarCodigo()
  conferir(`gerado "${c}" casa com FORMATO_CODIGO`, FORMATO_CODIGO.test(c), true)
}
conferir("maiúscula não passa", FORMATO_CODIGO.test("ABCD1234"), false)
conferir("7 caracteres não passa", FORMATO_CODIGO.test("abc1234"), false)
conferir("9 caracteres não passa", FORMATO_CODIGO.test("abc123456"), false)

console.log(`\n${total} verificações · ${falhas} falha(s)`)
process.exit(falhas === 0 ? 0 : 1)
