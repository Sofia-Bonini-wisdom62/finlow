/**
 * Testa a régua da senha e o caminho de volta de cada conta.
 *
 * POR QUE ISTO EXISTE
 * Até 05/09/2026 não havia recuperação de senha nenhuma: nem link em /login,
 * nem rota, nem caminho de suporte dentro do produto. Quem esquecia a senha
 * perdia o histórico financeiro, os objetivos, a trilha e as conversas. O
 * recurso completo trava numa decisão que não se toma no repositório (qual
 * provedor de e-mail), e o que entrou foi a metade que não depende dela.
 *
 * Metade que não depende quer dizer: a régua do que é uma senha aceitável, o
 * caminho de volta que cada conta tem, e a reposição pela operação. Este
 * arquivo guarda as três, e mais uma coisa que nenhum compilador guarda —
 * QUE A TELA NÃO PROMETA E-MAIL ENQUANTO NÃO HOUVER QUEM MANDE E-MAIL.
 *
 * Nada disto quebra build, typecheck ou lint. Uma tela dizendo "enviamos um
 * link para o seu e-mail" compila perfeitamente num app que não manda e-mail
 * nenhum, e o defeito só aparece do lado de quem fica esperando na caixa de
 * entrada.
 *
 *   node --import tsx scripts/testar-senha.mts
 */
import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import {
  MIN_SENHA,
  MAX_SENHA_BYTES,
  lerSenha,
  ehLoginDeEscola,
  caminhoDeRecuperacao,
  senhaDeAluno,
  senhaDeAdulto,
} from "../lib/senha.js"

const raiz = join(import.meta.dirname, "..")
const ler = (p: string) => readFileSync(join(raiz, p), "utf8")

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

function aceita(bruta: string, nota: string) {
  const r = lerSenha(bruta)
  checar(`aceita ${nota}`, r.ok && r.senha === bruta, r.ok ? "" : r.motivo)
}

function recusa(bruta: unknown, nota: string) {
  const r = lerSenha(bruta)
  checar(`recusa ${nota}`, !r.ok, r.ok ? "aceitou" : "")
  if (!r.ok) {
    // Recusa sem motivo legível é a mesma coisa que travar sem dizer por quê.
    checar(`  …com motivo em português`, r.motivo.length > 10 && /[a-zà-ú]/i.test(r.motivo))
  }
}

// ------------------------------------------------------------- a régua ---
console.log("A RÉGUA DA SENHA")

aceita("senha1", "o mínimo exato (6)")
aceita("uma senha bem comprida mas dentro do limite", "frase de senha comum")
aceita("  espaço nas pontas  ", "espaço nas pontas — é caractere de senha como outro qualquer")
aceita("çãéüñ!", "acento e símbolo")

recusa("abc", "senha curta")
recusa("", "senha vazia")
recusa("     ", "senha só de espaço")
recusa(undefined, "senha ausente")
recusa(12345678, "número em vez de texto")

/**
 * O caso que motivou o teto, e ele é BYTE e não caractere: o bcrypt lê no
 * máximo 72 bytes e ignora o resto EM SILÊNCIO. Um teto de 72 caracteres
 * deixaria passar 40 acentos (80 bytes) e voltaria a truncar — duas senhas
 * diferentes viram a mesma para o `compare`, e ninguém fica sabendo.
 */
console.log("\nO TETO É DO BCRYPT, E ELE CONTA BYTES")

aceita("a".repeat(72), "72 bytes ASCII, o limite exato")
recusa("a".repeat(73), "73 bytes ASCII")
checar(
  "40 acentos são 80 bytes e passariam de um teto em caracteres",
  new TextEncoder().encode("á".repeat(40)).length === 80
)
recusa("á".repeat(40), "40 caracteres acentuados (80 bytes)")
aceita("á".repeat(36), "36 caracteres acentuados (72 bytes) cabem")
recusa("🙂".repeat(19), "19 emojis (76 bytes)")
checar("o teto declarado é o do bcrypt", MAX_SENHA_BYTES === 72, String(MAX_SENHA_BYTES))
checar("o mínimo declarado é o que sempre valeu", MIN_SENHA === 6, String(MIN_SENHA))

/**
 * NÃO APARA as pontas, e isto é a metade que importa: aparar no cadastro e não
 * aparar no login criaria uma conta cuja senha a própria tela de entrada não
 * consegue reproduzir. A régua tem de devolver exatamente o que recebeu.
 */
const comEspaco = lerSenha("  segredo  ")
checar(
  "a senha aceita volta byte a byte, sem aparar",
  comEspaco.ok && comEspaco.senha === "  segredo  ",
  comEspaco.ok ? JSON.stringify(comEspaco.senha) : comEspaco.motivo
)

// -------------------------------------------------- o caminho de volta ---
console.log("\nPOR ONDE CADA CONTA VOLTA")

checar(
  "conta comum com senha volta pela senha",
  caminhoDeRecuperacao({ email: "maria@gmail.com", temSenha: true }) === "senha"
)
checar(
  "conta sem senha é conta do Google",
  caminhoDeRecuperacao({ email: "maria@gmail.com", temSenha: false }) === "google"
)
checar(
  "login .invalid é escola mesmo tendo senha (ela sempre tem)",
  caminhoDeRecuperacao({ email: "maria.silva@colegio.invalid", temSenha: true }) === "escola"
)
checar(
  "login .invalid continua escola em MAIÚSCULA",
  caminhoDeRecuperacao({ email: "MARIA@COLEGIO.INVALID", temSenha: true }) === "escola"
)

/**
 * O caso que um `includes` estragaria: "nota.invalid@gmail.com" é um Gmail de
 * verdade. Tratá-lo como login de escola mandaria a pessoa falar com uma
 * escola que ela nunca viu, e ela não teria a quem recorrer.
 */
checar(
  "e-mail que só CONTÉM .invalid não é login de escola",
  !ehLoginDeEscola("nota.invalid@gmail.com")
)
checar("e-mail comum não é login de escola", !ehLoginDeEscola("joao@empresa.com.br"))
checar("espaço em volta não engana", ehLoginDeEscola("  joao@escola.invalid  "))

// ------------------------------------------------------------ o sorteio ---
console.log("\nO SORTEIO")

const amostraAluno = Array.from({ length: 300 }, () => senhaDeAluno())
checar("senha de aluno tem 6 caracteres", amostraAluno.every((s) => s.length === 6))
checar(
  "senha de aluno não tem caractere ambíguo (i, l, o, 0, 1)",
  amostraAluno.every((s) => !/[ilo01]/.test(s)),
  amostraAluno.find((s) => /[ilo01]/.test(s)) ?? ""
)
checar("senha de aluno não se repete em 300 sorteios", new Set(amostraAluno).size > 290)

const amostraAdulto = Array.from({ length: 300 }, () => senhaDeAdulto())
checar("senha de adulto é bem mais longa", amostraAdulto.every((s) => s.length >= 12))
checar("senha de adulto não se repete", new Set(amostraAdulto).size === 300)
checar(
  "toda senha sorteada passa na própria régua",
  [...amostraAluno, ...amostraAdulto].every((s) => lerSenha(s).ok)
)

// ================================================================ código ===
/**
 * Daqui para baixo o teste olha o CÓDIGO. Nada disto quebra build, typecheck
 * ou lint, e é justamente por isso que some sem avisar.
 */
console.log("\nO QUE O COMPILADOR NÃO VÊ")

const login = ler("app/(auth)/login/page.tsx")
const esqueci = ler("app/(auth)/esqueci-senha/page.tsx")
const cadastroRota = ler("app/api/cadastro/route.ts")
const contaRota = ler("app/api/conta/route.ts")
const opsSenhaRota = ler("app/api/ops/usuarios/[userId]/senha/route.ts")
const opsBuscaRota = ler("app/api/ops/usuarios/route.ts")
const opsLib = ler("lib/ops-usuario.ts")

// A porta. Sem ela a tela existe e ninguém chega nela.
checar("/login leva para /esqueci-senha", login.includes("/esqueci-senha"))
checar("a rota /esqueci-senha existe como arquivo", existsSync(join(raiz, "app/(auth)/esqueci-senha/page.tsx")))

// Uma régua só. Duas cópias divergem, e a divergência de senha aparece do pior
// jeito: a pessoa cadastra o que a tela aceitou e não consegue mais entrar.
for (const [nome, fonte] of [
  ["o cadastro", cadastroRota],
  ["a troca de senha", contaRota],
] as const) {
  checar(`${nome} usa lerSenha em vez de régua própria`, /lerSenha\(/.test(fonte))
  checar(
    `${nome} não tem comprimento de senha escrito à mão`,
    !/senha\w*\.length\s*<\s*\d/i.test(fonte),
    (fonte.match(/senha\w*\.length\s*<\s*\d/i) ?? [""])[0]
  )
}

/**
 * A TRAVA DE HONESTIDADE, e ela é amarrada ao código e não à data.
 *
 * Enquanto não existir quem mande e-mail, a tela não pode prometer e-mail. No
 * dia em que o provedor entrar (dependência no package.json ou lib/email), a
 * checagem AFROUXA SOZINHA, em vez de virar teste mentiroso pedindo para ser
 * apagado — a mesma forma da trava de Open Finance em testar-landing.mts.
 */
const pacote = ler("package.json")
const temEnvio =
  /"(resend|postmark|nodemailer|@aws-sdk\/client-ses|@sendgrid\/mail|mailgun\.js)"/.test(pacote) ||
  existsSync(join(raiz, "lib/email.ts")) ||
  existsSync(join(raiz, "lib/email"))

if (temEnvio) {
  console.log("  (existe envio de e-mail no repo — a trava de honestidade afrouxa sozinha)")
} else {
  const promessas = [
    /enviamos?\s+(um\s+)?(link|e-?mail)/i,
    /link\s+de\s+redefini/i,
    /te\s+mandamos/i,
    /confere?\s+(a\s+)?sua\s+caixa/i,
    /verifique?\s+seu\s+e-?mail/i,
  ]
  for (const p of promessas) {
    checar(
      `/esqueci-senha não promete e-mail que ninguém manda  ${p.source.slice(0, 28)}`,
      !p.test(esqueci),
      (esqueci.match(p) ?? [""])[0]
    )
  }
  // Formulário de e-mail nesta tela só faria sentido para MANDAR alguma coisa.
  checar(
    "/esqueci-senha não tem campo de e-mail (não há o que enviar, e responder diferente por e-mail cadastrado vaza quem tem conta)",
    !/<input[^>]*type=["']email["']/.test(esqueci)
  )
  // A pergunta não pode ser varrida para debaixo do tapete: a tela tem de
  // dizer por que não existe link, como a landing faz com o Open Finance.
  checar("/esqueci-senha explica por que não é automático", /ainda não manda e-?mail/i.test(esqueci))
}

// Os dois casos que o backlog listou como decisões do item têm de estar à
// vista de quem chega na tela, senão a pessoa errada escreve para o suporte.
checar("/esqueci-senha fala do caso Google", /google/i.test(esqueci))
checar("/esqueci-senha fala do login de escola", /\.invalid/i.test(esqueci))
checar("/esqueci-senha dá o e-mail de contato", /EMAIL_CONTATO/.test(esqueci))

// A superfície de operação inteira atrás do guard. Uma busca de contas aberta
// seria consulta pública de quem usa o Finlow.
for (const [nome, fonte] of [
  ["a reposição de senha", opsSenhaRota],
  ["a busca de contas", opsBuscaRota],
] as const) {
  checar(`${nome} exige ops`, /exigirOps\(\)/.test(fonte))
  checar(
    `${nome} devolve cedo quando não é ops`,
    /if\s*\(\s*op instanceof NextResponse\s*\)\s*return op/.test(fonte)
  )
}

// Rastro. A capacidade não é nova (a chave de cifra é do servidor), mas passou
// a caber num toque — e toque não deixa rastro sozinho.
checar("a reposição vai para o log com quem operou", /console\.log\([^)]*op\.email/.test(opsSenhaRota))
checar(
  "a senha sorteada NÃO vai para o log",
  !/console\.(log|error)\([^)]*\br\.senha\b/.test(opsSenhaRota)
)

// O hash nunca é carregado para dentro do processo só para virar um booleano.
checar(
  "lib/ops-usuario.ts nunca seleciona o hash da senha",
  !/senha:\s*true/.test(opsLib),
  (opsLib.match(/senha:\s*true/) ?? [""])[0]
)
checar(
  "…e pergunta ao banco quem tem senha, em vez de ler o hash",
  /senha:\s*\{\s*not:\s*null\s*\}/.test(opsLib)
)

// Termo curto recusado nas DUAS pontas: a tela desabilita, a rota recusa. A
// tela não é autoridade — o fetch que chega ali pode não ter vindo dela.
checar("a rota de busca recusa termo curto", /MIN_BUSCA_CONTA/.test(opsBuscaRota))
checar("a função de busca recusa termo curto", /MIN_BUSCA_CONTA/.test(opsLib))
checar(
  "a tela usa a MESMA constante",
  /MIN_BUSCA_CONTA/.test(ler("components/ops/BuscaDeContas.tsx"))
)

// A escola continua com a saída dela, e agora pela mesma escrita.
const opsEscola = ler("lib/ops-escola.ts")
checar(
  "a reposição da escola delega a escrita, sem segunda cópia",
  /redefinirSenhaDaConta\(/.test(opsEscola)
)
checar(
  "…e não grava senha por conta própria",
  !/data:\s*\{\s*senha:\s*await bcrypt\.hash/.test(opsEscola)
)

console.log(falhas === 0 ? "\nTudo certo." : `\n${falhas} falha(s).`)
process.exit(falhas === 0 ? 0 : 1)
