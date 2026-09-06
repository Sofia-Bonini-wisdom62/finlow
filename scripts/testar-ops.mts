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

// -------------------------------------------- reposição de senha de conta ---
// A metade do item *Recuperação de senha* que não depende de escolher
// provedor de e-mail: a operação repõe a senha de quem escreveu para o
// suporte. A decisão é pura de propósito — ela é a diferença entre devolver
// uma conta e criar uma credencial que ninguém pediu.
const { decidirReposicao, avisoDeReposicao } = await import("../lib/ops-conta.js")

console.log("\ndecidirReposicao — o que a operação pode fazer com uma conta")

conferir(
  "conta que não existe não vira reposição",
  decidirReposicao({ existe: false, temSenha: false, temGoogle: false }).acao,
  "nao_existe"
)
conferir(
  "conta com senha própria repõe",
  decidirReposicao({ existe: true, temSenha: true, temGoogle: false }).acao,
  "repor"
)
conferir(
  "conta com senha E Google repõe (ela tem o que esquecer)",
  decidirReposicao({ existe: true, temSenha: true, temGoogle: true }).acao,
  "repor"
)
// O caso que a tela da escola resolve ao contrário, e de propósito: aqui a
// operadora responde a um pedido de FORA, e a pessoa que entra pelo Google
// não esqueceu senha nenhuma — nunca teve uma. Sortear uma poria credencial
// nova numa conta protegida pelo login do Google.
conferir(
  "conta só do Google é recusada por padrão",
  decidirReposicao({ existe: true, temSenha: false, temGoogle: true }).acao,
  "so_google"
)
conferir(
  "a recusa do Google manda a pessoa para o caminho que funciona",
  /Entrar com Google/.test(decidirReposicao({ existe: true, temSenha: false, temGoogle: true }).motivo),
  true
)
conferir(
  "com o segundo clique, a conta do Google ganha senha",
  decidirReposicao({ existe: true, temSenha: false, temGoogle: true, assumirContaGoogle: true }).acao,
  "repor"
)
// Sem senha e sem Google é conta órfã: recusar aqui trancaria a pessoa para
// sempre, que é exatamente o defeito que este item existe para tirar da mesa.
conferir(
  "conta sem senha e sem Google repõe sem confirmação extra",
  decidirReposicao({ existe: true, temSenha: false, temGoogle: false }).acao,
  "repor"
)
conferir(
  "toda decisão vem com motivo escrito",
  [
    decidirReposicao({ existe: false, temSenha: false, temGoogle: false }),
    decidirReposicao({ existe: true, temSenha: true, temGoogle: false }),
    decidirReposicao({ existe: true, temSenha: false, temGoogle: true }),
  ].every((d) => d.motivo.length > 0),
  true
)

console.log("\navisoDeReposicao — o que a operadora repete para quem pediu")

conferir(
  "conta comum não ganha aviso inventado",
  avisoDeReposicao({ temGoogle: false, escola: null }, false),
  null
)
conferir(
  "quem também tem Google ouve que o Google continua valendo",
  /Google/.test(avisoDeReposicao({ temGoogle: true, escola: null }, false) ?? ""),
  true
)
conferir(
  "assumir a conta do Google avisa que agora entra pelos dois caminhos",
  /dois caminhos/.test(avisoDeReposicao({ temGoogle: true, escola: null }, true) ?? ""),
  true
)
conferir(
  "membro de escola ouve que a escola também repõe",
  /escola/i.test(avisoDeReposicao({ temGoogle: false, escola: { nome: "Colégio X", papel: "aluno" } }, false) ?? ""),
  true
)

// ----------------------------------- a porta pública e a porta da operação ---
// As duas metades se obrigam: a reposição em /ops sem o aviso em /login é uma
// saída que ninguém sabe pedir, e o aviso sem a reposição manda a pessoa
// escrever para um e-mail que não tem o que responder. Nada disto quebra
// build, typecheck ou lint — some sem avisar.
console.log("\nrecuperação de senha — as duas metades continuam de pé")

/**
 * O comentário do arquivo NÃO é a tela. Este corte existe porque a primeira
 * versão do guard acusou a própria tela de prometer e-mail: o comentário do
 * topo dela CITA a promessa proibida para explicar por que ela não está lá.
 * Guard que acusa código correto ensina a próxima pessoa a desligá-lo.
 */
function semComentarios(fonte: string): string {
  return fonte
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, " ") // {/* comentário de JSX */}
    .replace(/\/\*[\s\S]*?\*\//g, " ") // /* bloco */ e /** doc */
    .replace(/^\s*\/\/.*$/gm, " ") // // linha inteira
}

const login = readFileSync(join("app", "(auth)", "login", "page.tsx"), "utf8")
const recuperar = semComentarios(
  readFileSync(join("app", "(auth)", "recuperar-senha", "page.tsx"), "utf8")
)
const opsContas = readFileSync(join("app", "ops", "contas", "page.tsx"), "utf8")
const opsLayout = readFileSync(join("app", "ops", "layout.tsx"), "utf8")

conferir("o login oferece a saída de quem esqueceu", login.includes("/recuperar-senha"), true)
conferir("a tela pública existe e volta para o login", recuperar.includes("/login"), true)
conferir("a tela pública dá o e-mail do suporte", recuperar.includes("EMAIL_CONTATO"), true)
// Os três caminhos são três pessoas diferentes, e a que entrou pelo Google
// resolve sem suporte nenhum. Tirar esse bloco manda para o e-mail quem podia
// voltar sozinha em um toque.
conferir("a tela pública explica o caminho do Google", /Google/.test(recuperar), true)
conferir("a tela pública explica o caminho da escola", /escola/i.test(recuperar), true)
conferir("a porta da operação existe", opsContas.includes("ReporSenhaDeConta"), true)
// Tela que a navegação não alcança é tela que ninguém acha na hora em que o
// pedido de suporte chega, que é a única hora em que ela importa.
conferir("a navegação de /ops leva até ela", opsLayout.includes("/ops/contas"), true)

/**
 * A honestidade da tela pública é amarrada ao CÓDIGO, não à data: ela só é
 * exigida sem formulário enquanto não houver envio de e-mail no repositório.
 * No dia em que o provedor entrar, esta checagem afrouxa sozinha, em vez de
 * virar teste mentiroso pedindo para ser apagado.
 */
const pacote = readFileSync("package.json", "utf8")
const ENVIO_DE_EMAIL = /"(resend|nodemailer|postmark|@sendgrid\/mail|mailgun\.js|@aws-sdk\/client-ses)"/
const temEnvio = ENVIO_DE_EMAIL.test(pacote)

total++
if (temEnvio) {
  console.log("  ✓ há envio de e-mail no package.json — o formulário de reset está liberado")
} else {
  // Sem envio, as duas respostas possíveis de um formulário são ruins:
  // "enviamos o link" é mentira, e "não achei essa conta" transforma a tela
  // numa consulta pública de quem usa o Finlow.
  const temCampo = /<input\b|<form\b|fetch\(/.test(recuperar)
  if (temCampo) {
    falhas++
    console.log("  ✗ a tela pública ganhou formulário sem existir envio de e-mail")
  } else {
    console.log("  ✓ sem envio de e-mail, a tela pública não tem formulário nem consulta")
  }

  total++
  const PROMESSA = /enviamos|enviaremos|te mandamos|link no seu e-?mail|verifique seu e-?mail/i
  if (PROMESSA.test(recuperar)) {
    falhas++
    console.log("  ✗ a tela pública promete e-mail que o repositório não sabe mandar")
  } else {
    console.log("  ✓ a tela pública não promete e-mail nenhum")
  }
}

// A senha existe UMA vez, na resposta. Um console.log com ela dentro a
// transforma em linha permanente no log da Vercel, lida por quem tem acesso
// ao projeto — que é o oposto do que "some depois" quer dizer.
console.log("\nsenha reposta não vai parar no log")

/**
 * O que é registrado é o VALOR interpolado, não a palavra. As duas rotas
 * escrevem "repôs a senha de {login}" na mensagem, e um guard que lesse a
 * linha inteira acusaria as duas por causa da frase em português — enquanto
 * um `${r.senha}` de verdade passaria despercebido no meio do mesmo texto.
 */
function valoresRegistrados(fonte: string): string[] {
  const chamadas = [...fonte.matchAll(/console\.\w+\(([\s\S]*?)\)\s*$/gm)].map((m) => m[1])
  return chamadas.flatMap((c) => [...c.matchAll(/\$\{([^}]*)\}/g)].map((m) => m[1].trim()))
}

for (const rota of [
  join("app", "api", "ops", "contas", "senha", "route.ts"),
  join("app", "api", "ops", "escolas", "[escolaId]", "membros", "[userId]", "senha", "route.ts"),
]) {
  const valores = valoresRegistrados(readFileSync(rota, "utf8"))
  conferir(
    `${rota.split(/[\\/]/).slice(-3).join("/")} não registra a senha`,
    valores.some((v) => /senha/i.test(v)),
    false
  )
}

// E o guard precisa acusar quando a senha ENTRA no log, senão ele é decoração.
conferir(
  "o guard pega um log que registra a senha",
  valoresRegistrados("console.log(`[ops] repôs para ${r.login}: ${r.senha}`)").some((v) =>
    /senha/i.test(v)
  ),
  true
)

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
