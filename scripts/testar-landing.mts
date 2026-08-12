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
