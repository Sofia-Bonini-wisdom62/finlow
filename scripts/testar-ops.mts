/**
 * Bateria da superfície da operação (/ops).
 *
 *   node --import tsx scripts/testar-ops.mts
 *
 * SEM `--conditions react-server`, diferente de testar-escola e
 * testar-pagamento, e isso não é sorte: as duas coisas que este arquivo testa
 * foram postas em módulos FOLHA (lib/ops-lista.ts e lib/ops-escola.ts)
 * justamente para não arrastarem o next-auth. A primeira versão importava
 * lib/ops.ts direto e morria em `React.createContext is not a function`.
 *
 * Duas metades, pela mesma razão de testar-escola.mts e testar-publico.mts:
 *
 *   1. As funções PURAS que decidem coisas irreversíveis (quem está na lista
 *      de operação, que login um aluno recebe, até quando vale um contrato).
 *   2. Uma VARREDURA garantindo que toda rota sob app/api/ops escolheu um
 *      guard. Ela não afirma que o guard certo foi usado: afirma que a
 *      ESCOLHA foi feita, porque o default do Next é responder a qualquer um,
 *      e uma rota que administra todas as escolas é o pior lugar do app para
 *      alguém esquecer.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs"
import { join } from "node:path"

let falhas = 0
let total = 0

function conferir(nome: string, obtido: unknown, esperado: unknown) {
  total++
  const ok = JSON.stringify(obtido) === JSON.stringify(esperado)
  if (!ok) {
    falhas++
    console.log(
      `  ✗ ${nome}\n      esperado: ${JSON.stringify(esperado)}\n      obtido:   ${JSON.stringify(obtido)}`
    )
  } else {
    console.log(`  ✓ ${nome}`)
  }
}

// ------------------------------------------------------ a lista de acesso ---
// De lib/ops-lista.ts e não de lib/ops.ts: o guard importa `@/lib/auth`, e o
// next-auth arrasta React cliente atrás de si, o que derruba qualquer script
// que tente carregá-lo. A folha existe justamente para esta linha funcionar.
const { emailsDeOps } = await import("../lib/ops-lista.js")

console.log("\nemailsDeOps — quem opera o Finlow")

delete process.env.OPS_EMAILS
conferir("variável ausente devolve lista vazia (falha fechada)", emailsDeOps(), [])

process.env.OPS_EMAILS = ""
conferir("variável vazia devolve lista vazia", emailsDeOps(), [])

process.env.OPS_EMAILS = "   ,  , "
conferir("só vírgulas e espaço devolve lista vazia", emailsDeOps(), [])

process.env.OPS_EMAILS = "Sofia@Exemplo.com"
conferir("normaliza maiúsculas", emailsDeOps(), ["sofia@exemplo.com"])

process.env.OPS_EMAILS = " a@x.com , b@y.com "
conferir("separa por vírgula e tira espaço", emailsDeOps(), ["a@x.com", "b@y.com"])

process.env.OPS_EMAILS = "a@x.com,,b@y.com"
conferir("vírgula dupla não vira e-mail vazio", emailsDeOps(), ["a@x.com", "b@y.com"])

// A recusa por lista vazia é o coração do guard: sem ela, /ops responderia a
// qualquer pessoa logada num ambiente onde ninguém configurou a variável, que
// foi exatamente o defeito consertado em /api/ops/metrics.
delete process.env.OPS_EMAILS
conferir("lista vazia não contém ninguém", emailsDeOps().includes("sofia@exemplo.com"), false)

// -------------------------------------------------------------- vigência ---
const { fimDoDiaEmSaoPaulo } = await import("../lib/ops-escola.js")

console.log("\nfimDoDiaEmSaoPaulo — até quando o contrato vale")

conferir("formato errado devolve null", fimDoDiaEmSaoPaulo("31/12/2027"), null)
conferir("texto qualquer devolve null", fimDoDiaEmSaoPaulo("amanhã"), null)
conferir("vazio devolve null", fimDoDiaEmSaoPaulo(""), null)
// O dia inteiro, não a meia-noite: "vale até 31/12" tem de incluir o 31. Com
// a virada no começo do dia, a escola perderia acesso na madrugada anterior.
conferir(
  "AAAA-MM-DD vira o FIM do dia em São Paulo",
  fimDoDiaEmSaoPaulo("2027-12-31")?.toISOString(),
  new Date("2027-12-31T23:59:59-03:00").toISOString()
)

// ------------------------------------------------------- login dos alunos ---
const { apelidoDeLogin, dominioDaEscola, loginDeAluno, interpretarLista, senhaDeAluno } =
  await import("../lib/ops-escola.js")

console.log("\napelidoDeLogin — o nome vira login")

conferir("tira acento e junta primeiro com último", apelidoDeLogin("José da Silva"), "jose.silva")
conferir("nome único não ganha ponto", apelidoDeLogin("Madonna"), "madonna")
conferir("cedilha vira c", apelidoDeLogin("Conceição Alves"), "conceicao.alves")
conferir("hífen não sobrevive", apelidoDeLogin("Ana-Clara Souza"), "ana.souza")
conferir("nome vazio tem chão", apelidoDeLogin("   "), "aluno")
conferir("só símbolo tem chão", apelidoDeLogin("###"), "aluno")

console.log("\ndominioDaEscola")
conferir("acento e espaço viram ponto", dominioDaEscola("Colégio São José"), "colegio.sao.jose")
conferir("nome vazio tem chão", dominioDaEscola(""), "escola")
conferir("não sobra ponto na ponta", dominioDaEscola("  Escola!  "), "escola")

console.log("\nloginDeAluno — o endereço que nunca recebe mensagem")

const ocupados = new Set<string>()
const primeiro = loginDeAluno("Maria Silva", "colegio.x", ocupados)
ocupados.add(primeiro)
const segundo = loginDeAluno("Maria Silva", "colegio.x", ocupados)

// .invalid é reservado pela RFC 2606 para nunca resolver. É o que impede o
// app de um dia tentar mandar "esqueci a senha" para o endereço de uma
// criança que não tem e-mail nenhum.
conferir("o domínio é .invalid", primeiro, "maria.silva@colegio.x.invalid")
conferir("homônima na mesma lista não colide", segundo, "maria.silva2@colegio.x.invalid")
conferir("e a segunda continua sendo .invalid", segundo.endsWith(".invalid"), true)

console.log("\ninterpretarLista — o que a operadora cola na caixa")

conferir("um nome por linha", interpretarLista("Ana\nBruno").nomes, ["Ana", "Bruno"])
conferir("linha vazia some sem contar como erro", interpretarLista("Ana\n\n\nBruno").ignoradas, 0)
conferir("fica com a primeira coluna da planilha", interpretarLista("Ana,5A,2018").nomes, ["Ana"])
conferir("ponto e vírgula também separa", interpretarLista("Ana;5A").nomes, ["Ana"])
conferir("tab também separa", interpretarLista("Ana\t5A").nomes, ["Ana"])
conferir("espaço repetido vira um", interpretarLista("Ana   Paula").nomes, ["Ana Paula"])
conferir("nome de uma letra é ignorado e contado", interpretarLista("Ana\nX").ignoradas, 1)
conferir("lista só de lixo devolve nada", interpretarLista("\n\n").nomes, [])

console.log("\nsenhaDeAluno — quem digita tem 7 anos")

const amostra = Array.from({ length: 200 }, () => senhaDeAluno())
conferir("tem 6 caracteres", amostra.every((s) => s.length === 6), true)
// Sem 0/O, 1/l/i: a criança lê a senha de um papel impresso, e ambiguidade
// ali vira um aluno que não entra e um professor parado esperando.
conferir(
  "nunca sai 0, o, 1, l nem i",
  amostra.every((s) => !/[0o1li]/.test(s)),
  true
)
conferir(
  "só usa o alfabeto declarado",
  amostra.every((s) => /^[abcdefghjkmnpqrstuvwxyz23456789]+$/.test(s)),
  true
)
conferir("não sai sempre igual", new Set(amostra).size > 190, true)

// -------------------------------------------------- nome de gente e login ---
const { normalizarNome, FORMATO_EMAIL } = await import("../lib/ops-escola.js")

console.log("\nnormalizarNome — a MESMA régua no cadastro e na edição")

conferir("tira espaço da ponta", normalizarNome("  Ana Souza  "), { ok: true, nome: "Ana Souza" })
conferir("espaço repetido vira um", normalizarNome("Ana    Souza"), { ok: true, nome: "Ana Souza" })
conferir("uma letra não passa", normalizarNome("A").ok, false)
conferir("vazio não passa", normalizarNome("   ").ok, false)
conferir("81 caracteres não passa", normalizarNome("a".repeat(81)).ok, false)
conferir("80 caracteres passa", normalizarNome("a".repeat(80)).ok, true)
// Acento e hífen são nome de gente de verdade, e recusá-los mandaria a
// operadora "consertar" o nome da criança para caber no formulário.
conferir("acento sobrevive", normalizarNome("José Gonçalves"), { ok: true, nome: "José Gonçalves" })
conferir("hífen sobrevive", normalizarNome("Ana-Clara D'Ávila"), { ok: true, nome: "Ana-Clara D'Ávila" })

console.log("\nFORMATO_EMAIL — o que a edição de login aceita")

conferir("e-mail comum passa", FORMATO_EMAIL.test("ana@colegio.com.br"), true)
conferir("login .invalid do lote passa", FORMATO_EMAIL.test("ana.souza@colegio.x.invalid"), true)
conferir("sem arroba não passa", FORMATO_EMAIL.test("ana.colegio.com"), false)
conferir("sem ponto no domínio não passa", FORMATO_EMAIL.test("ana@colegio"), false)
conferir("com espaço não passa", FORMATO_EMAIL.test("ana souza@colegio.com"), false)

// --------------------------------------------- rotas sem guard escolhido ---
console.log("\nrotas de /api/ops — toda rota escolheu um guard?")

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

const rotas = rotasDe(join("app", "api", "ops"))
const semGuard = rotas.filter((r) => {
  const fonte = readFileSync(r, "utf8")
  // Dois guards válidos, e a diferença é o público: `exigirOps` é para tela
  // (sessão de gente), `OPS_METRICS_TOKEN` é para máquina (cabeçalho). Uma
  // rota sem nenhum dos dois é uma rota que ninguém decidiu proteger.
  return !fonte.includes("exigirOps") && !fonte.includes("OPS_METRICS_TOKEN")
})

total++
if (semGuard.length > 0) {
  falhas++
  console.log(`  ✗ ${semGuard.length} rota(s) sem guard:`)
  for (const r of semGuard) console.log(`      ${r}`)
} else {
  console.log(`  ✓ as ${rotas.length} rotas de /api/ops escolheram um guard`)
}

// A varredura acima passaria com zero rotas encontradas, e zero rotas é o
// sintoma de a pasta ter sido renomeada sem ninguém avisar o teste.
conferir("a varredura achou rotas para varrer", rotas.length > 0, true)

console.log(`\n${falhas === 0 ? "✓" : "✗"} ${total - falhas}/${total} conferências`)
process.exit(falhas === 0 ? 0 : 1)
