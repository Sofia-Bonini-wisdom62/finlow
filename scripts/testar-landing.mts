/**
 * Testa a PORTA DE ENTRADA da landing (app/page.tsx, components/landing/*).
 *
 * RODA SEM BANCO E SEM BUILD — lê o fonte e confere o que ele promete.
 *
 * Por que um teste de copy e de link, e não de lógica: o defeito que ele guarda
 * não foi um bug, foi uma ausência. A landing passou meses sem nenhum link
 * "Entrar" ou "Criar conta" — quem já tinha conta precisava adivinhar /login na
 * barra de endereço — enquanto o FAQ respondia "O Finlow já está disponível?
 * Ainda não" com o app inteiro no ar no mesmo domínio. Nada disso quebra build,
 * quebra typecheck ou aparece em lint. Some sem avisar e volta sem avisar.
 *
 * As duas metades se sustentam e por isso são testadas juntas: dizer "sim, está
 * disponível" sem oferecer caminho para entrar é tão incoerente quanto oferecer
 * o caminho e continuar dizendo que não abriu.
 *
 * O teste confere também que cada rota interna citada na landing EXISTE como
 * arquivo de rota — link de entrada que aponta para 404 é pior que link nenhum,
 * porque parece resolvido.
 *
 *   node --import tsx scripts/testar-landing.mts
 */
import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"

const raiz = join(import.meta.dirname, "..")
const ler = (p: string) => readFileSync(join(raiz, p), "utf8")

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

const landing = ler("app/page.tsx")
const faq = ler("components/landing/Faq.tsx")
const formEmail = ler("components/landing/WaitlistForm.tsx")
const layout = ler("app/layout.tsx")
const ajustes = ler("app/(app)/ajustes/page.tsx")

/** Todo href="..." do arquivo, na ordem em que aparece. */
function hrefs(fonte: string): string[] {
  return [...fonte.matchAll(/href="([^"]+)"/g)].map((m) => m[1])
}

/**
 * Tira os comentários antes de conferir COPY. Os comentários daqui citam de
 * propósito a frase antiga que foi corrigida, para que ninguém a reescreva sem
 * saber — e um teste de copy que lesse o comentário acusaria justamente o aviso
 * que protege a correção.
 *
 * BLOCO E LINHA, e a segunda metade veio de um caso real. O branch do redesign
 * escreveu esse mesmo aviso com `//` em vez de bloco, e a checagem de Open
 * Finance acusou falha numa landing que estava CERTA: o "Open Finance" que ela
 * leu era o do comentário explicando por que a promessa tinha saído. Guard que
 * depende do estilo de comentário que o autor escolheu não guarda nada — só
 * treina quem vier depois a desligá-lo.
 *
 * O `[^:]` antes do `//` é o que preserva `https://`. Era a razão de a linha
 * ter ficado de fora, e ela continua valendo.
 */
function semComentarios(fonte: string): string {
  return fonte.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ")
}

/** Recorta uma seção do JSX pelo comentário de faixa que a abre. */
function trecho(fonte: string, de: RegExp, ate: RegExp): string {
  const i = fonte.search(de)
  if (i < 0) return ""
  const resto = fonte.slice(i + 1)
  const j = resto.search(ate)
  return j < 0 ? resto : resto.slice(0, j)
}

// ------------------------------------------------------- a porta existe ---
console.log("\na landing tem porta de entrada")

const todosHrefs = hrefs(landing)
checar("existe link para /login", todosHrefs.includes("/login"))
checar("existe link para /cadastro", todosHrefs.includes("/cadastro"))

const cabecalho = trecho(landing, /============ NAV ============/, /============ HERO ============/)
checar("o cabeçalho leva para /login", hrefs(cabecalho).includes("/login"))
checar("o cabeçalho leva para /cadastro", hrefs(cabecalho).includes("/cadastro"))

const rodape = trecho(landing, /============ FOOTER ============/, /<\/footer>/)
checar("o rodapé leva para /login", hrefs(rodape).includes("/login"))
checar("o rodapé leva para /cadastro", hrefs(rodape).includes("/cadastro"))

const heroECta = trecho(landing, /============ HERO ============/, /============ TRUST STRIP ============/)
checar("o hero tem chamada para criar conta", hrefs(heroECta).includes("/cadastro"))

// ------------------------------------------- os links apontam para algo ---
console.log("\ntoda rota interna citada existe como arquivo de rota")

/** "/premium" -> app/(grupo)/premium/page.tsx, em qualquer grupo de rota. */
const GRUPOS = ["", "(app)", "(auth)", "(marketing)"]
function rotaExiste(rota: string): boolean {
  const limpa = rota.replace(/[?#].*$/, "").replace(/^\/+|\/+$/g, "")
  if (limpa === "") return existsSync(join(raiz, "app/page.tsx"))
  return GRUPOS.some((g) =>
    ["page.tsx", "route.ts"].some((f) => existsSync(join(raiz, "app", g, limpa, f)))
  )
}

const internos = [...new Set(todosHrefs.filter((h) => h.startsWith("/")))]
checar("há rota interna para conferir", internos.length > 0, `(${internos.length})`)
for (const rota of internos) {
  checar(`${rota} existe`, rotaExiste(rota))
}

// a própria checagem precisa poder falhar, senão ela não prova nada
checar("a checagem de rota reprova rota inventada", !rotaExiste("/rota-que-nao-existe"))

// ------------------------------------------------ o FAQ diz a verdade ---
console.log("\no FAQ não nega um produto que está no ar")

const perguntaDisponivel = faq.match(/\{ q: "O Finlow já está disponível\?", a: "([^"]+)" \}/)
checar("a pergunta sobre disponibilidade continua no FAQ", !!perguntaDisponivel)
if (perguntaDisponivel) {
  const resposta = perguntaDisponivel[1]
  checar("ela não responde 'ainda não'", !/^ainda não/i.test(resposta.trim()), `→ "${resposta.slice(0, 40)}…"`)
  checar("ela afirma que dá para usar", /\bsim\b/i.test(resposta) && /criar conta|usar/i.test(resposta))
}

checar(
  "nenhuma resposta do FAQ promete avisar 'quando abrir'",
  !/assim que (o acesso|a primeira versão) abrir/i.test(faq)
)
checar(
  "o FAQ não trata a lista de espera como a forma de entrar",
  !/entrar na lista de espera é grat/i.test(faq)
)

// O Menu do app logado manda o usuário para este mesmo FAQ. Enquanto ele
// respondia "ainda não", quem já era usuário lia que o produto não existia.
const linkFaqNoMenu = /rotulo="Perguntas frequentes" href="([^"]+)"/.exec(ajustes)
checar("o Menu do app aponta para o FAQ da landing", linkFaqNoMenu?.[1] === "/#faq", linkFaqNoMenu?.[1] ?? "não achei")

// ------------------------------ a landing não vende o que não existe ---
console.log("\na landing não promete conexão automática de contas")

/**
 * O passo 1 do "Como funciona" dizia "Conecte suas contas — suas transações
 * entram sozinhas, nada de digitar CSV". Isso é Open Finance, que está no
 * backlog e não foi construído: falta escolher um agregador regulado, que é
 * contrato e custo, não código. O caminho real é o upload de extrato.
 *
 * A checagem é amarrada ao CÓDIGO, não à data: enquanto não houver conector, a
 * home não pode prometer conexão automática. No dia em que ele existir, esta
 * seção afrouxa sozinha em vez de virar um teste mentiroso pedindo para ser
 * apagado.
 */
const conectorExiste =
  existsSync(join(raiz, "app/api/open-finance")) ||
  existsSync(join(raiz, "lib/open-finance")) ||
  /"(pluggy|belvo|klavi)[^"]*":/i.test(ler("package.json"))

// trecho() se orienta pelos comentários de faixa, então o corte vem primeiro
// e a limpeza depois.
const comoFunciona = semComentarios(
  trecho(landing, /============ COMO FUNCIONA ============/, /============ DIFERENCIAL ============/)
)
const landingCopy = semComentarios(landing)
checar("achei a seção 'Como funciona'", comoFunciona.length > 0)

if (conectorExiste) {
  console.log("  (conector Open Finance encontrado no repo — a copy pode prometer conexão; revise esta seção)")
} else {
  checar(
    "o passo 1 não é 'conecte suas contas'",
    !/t: "Conecte suas contas"/i.test(comoFunciona)
  )
  checar(
    "nenhum passo diz que as transações entram sozinhas",
    !/entram sozinhas|entram automaticamente|sincroniza(ção|r) com o banco/i.test(comoFunciona)
  )
  checar(
    "o passo 1 descreve o caminho que existe (extrato)",
    /extrato/i.test(comoFunciona)
  )
  // Se a home cita Open Finance, tem de citar como plano — nunca como recurso.
  const citaOpenFinance = /open finance/i.test(landingCopy)
  checar(
    "se cita Open Finance, deixa claro que ainda não existe",
    !citaOpenFinance || /ainda não existe|está no plano/i.test(landingCopy),
    citaOpenFinance ? "" : "(não cita)"
  )
}

// A home e o app logado não podem discordar sobre o mesmo recurso: Ajustes
// lista "Bancos conectados" como Em breve. Foi o mesmo erro do FAQ — a tela de
// dentro dizia a verdade enquanto a de fora vendia o recurso como pronto.
const bancosEmBreve = /<EmBreve rotulo="Bancos conectados"/.test(ajustes)
checar(
  "o app logado ainda trata 'Bancos conectados' como Em breve",
  bancosEmBreve || conectorExiste,
  bancosEmBreve ? "" : "(mudou em Ajustes — reveja a copy da home)"
)
if (bancosEmBreve) {
  checar(
    "e a home não contradiz o app logado",
    !/Conecte suas contas|entram sozinhas/i.test(landingCopy)
  )
}

// Os formatos citados na home têm de ser os que a tela de upload aceita.
// Prometer OFX na home e não aceitar OFX na tela é a mesma falha, menor.
const telaExtrato = ler("app/(app)/extrato/page.tsx")
const aceita = /accept="([^"]+)"/.exec(telaExtrato)?.[1] ?? ""
checar("achei o accept da tela de extrato", aceita.length > 0, aceita)
const formatosCitados = [...new Set([...comoFunciona.matchAll(/\b(PDF|CSV|OFX|QIF|TXT|XLSX?|JSON)\b/g)].map((m) => m[1]))]
checar("a home cita algum formato de arquivo", formatosCitados.length > 0, formatosCitados.join(", "))
for (const formato of formatosCitados) {
  checar(`a tela de upload aceita ${formato}`, aceita.toLowerCase().includes(`.${formato.toLowerCase()}`))
}

// --------------------------------------- a captura de e-mail não mente ---
console.log("\na captura de e-mail não promete acesso que já está aberto")

checar(
  "o formulário não diz 'você está na lista'",
  !/você está na lista/i.test(formEmail)
)
checar(
  "o formulário não promete avisar quando o acesso abrir",
  !/assim que o acesso abrir/i.test(formEmail)
)
checar(
  "o sucesso oferece o caminho de criar conta",
  hrefs(formEmail).includes("/cadastro")
)
checar(
  "a rota que grava o e-mail continua a mesma (nada de dado perdido)",
  formEmail.includes('fetch("/api/waitlist"') && existsSync(join(raiz, "app/api/waitlist/route.ts"))
)

// ------------------------------------------------------------ metadados ---
console.log("\nmetadados e selo da página")

checar(
  "a description não vende lista de espera",
  !/lista de (espera|acesso antecipado)/i.test(layout)
)
checar(
  "o selo do hero não diz que o produto ainda não abriu",
  !/vagas de acesso antecipado/i.test(landing)
)

// --------------------------------------------------------------- fim ---
console.log(falhas === 0 ? "\n✅ landing com porta de entrada, e coerente com o que o app é hoje\n" : `\n❌ ${falhas} falha(s)\n`)
process.exit(falhas === 0 ? 0 : 1)
