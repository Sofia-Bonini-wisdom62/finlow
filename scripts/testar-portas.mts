/**
 * Testa as PORTAS PÚBLICAS DA CONTA: o teto de tentativas de `/login` e o de
 * `/api/cadastro`, mais a aritmética do limitador que os dois usam.
 *
 * RODA SEM BANCO E SEM BUILD — relógio congelado nos casos de contagem, e
 * leitura do fonte nos casos que olham o código.
 *
 * ── Por que um teste, e por que metade dele lê o código ────────────────────
 * Teto de tentativa é a categoria de regra que some sem avisar. Nada aqui
 * quebra build, typecheck ou lint: uma porta de senha sem limite compila
 * perfeitamente, responde igual, e só se revela no dia em que alguém varre
 * senha contra uma conta e ninguém percebe. Não há tela dizendo "o teto está
 * ligado", então quem confere tem de ser um script.
 *
 * As três armadilhas que os casos de código guardam, todas concretas:
 *
 *  1. Perguntar DEPOIS do bcrypt. Funciona igual e não guarda nada do que
 *     interessa: o custo que se quer negar ao atacante é justamente o bcrypt.
 *  2. Contar o acerto junto com o erro. Dez erros de digitação e um acerto
 *     deixariam a pessoa trancada DEPOIS de já ter provado quem é — e o
 *     conserto óbvio de quem esbarrasse nisso seria desligar o teto.
 *  3. Juntar quem não tem IP conhecido numa chave "anon". Num formulário de
 *     lead isso é inofensivo; numa porta de login é queda geral no primeiro
 *     proxy que esconder o cabeçalho, e o sintoma ("ninguém consegue entrar")
 *     não aponta para cá.
 *
 *   node --import tsx scripts/testar-portas.mts
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"

const raiz = join(import.meta.dirname, "..")
const ler = (p: string) => readFileSync(join(raiz, p), "utf8")

const { excedeu, registrar, limpar, permitido } = await import("../lib/limite-taxa.js")
const portas = await import("../lib/portas-de-conta.js")
const {
  LOGIN_POR_EMAIL,
  LOGIN_POR_IP,
  CADASTRO_POR_IP,
  ipDaRequisicao,
  chaveLoginEmail,
  chaveLoginIp,
  chaveCadastroIp,
} = portas

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

/** Cabeçalhos de mentira, com a mesma cara de `Headers`. */
function cabecalhos(mapa: Record<string, string>) {
  return { get: (n: string) => mapa[n.toLowerCase()] ?? null }
}

// ------------------------------------------------ contagem só de falhas ---
console.log("CONTAGEM (relógio congelado)")

const T0 = 1_000_000
const JANELA = 15 * 60 * 1000

// Perguntar não gasta: é o que permite consultar antes de saber o veredito.
checar(
  "excedeu não registra nada",
  [...Array(50)].every(() => !excedeu("porta-a", 3, JANELA, T0))
)

registrar("porta-a", JANELA, T0 + 1)
registrar("porta-a", JANELA, T0 + 2)
checar("abaixo do teto ainda passa", !excedeu("porta-a", 3, JANELA, T0 + 3))
registrar("porta-a", JANELA, T0 + 3)
checar("no teto, barra", excedeu("porta-a", 3, JANELA, T0 + 4))
checar("outra chave não é afetada", !excedeu("porta-b", 3, JANELA, T0 + 4))
checar("janela vencida solta sozinha", !excedeu("porta-a", 3, JANELA, T0 + JANELA + 5))

// O caso que o teto ingênuo erra: erra, erra, erra... e acerta.
limpar("porta-a")
checar("o acerto perdoa os erros anteriores", !excedeu("porta-a", 3, JANELA, T0 + 4))

// A contagem de TENTATIVA (lead B2B) não pode ter mudado de comportamento.
checar("permitido: até o teto, passa", [1, 2, 3].every((i) => permitido("lead-x", 3, 1000, T0 + i)))
checar("permitido: o quarto na janela é barrado", !permitido("lead-x", 3, 1000, T0 + 4))
checar("permitido: janela vencida libera de novo", permitido("lead-x", 3, 1000, T0 + 2000))

// -------------------------------------------------------- leitura do IP ---
console.log("\nENDEREÇO DE QUEM CHAMOU")

checar(
  "x-forwarded-for: fica com o primeiro, sem espaço",
  ipDaRequisicao(cabecalhos({ "x-forwarded-for": " 203.0.113.7 , 10.0.0.1 " })) === "203.0.113.7"
)
checar(
  "sem x-forwarded-for, cai no x-real-ip",
  ipDaRequisicao(cabecalhos({ "x-real-ip": "203.0.113.9" })) === "203.0.113.9"
)
checar("sem cabeçalho nenhum, null", ipDaRequisicao(cabecalhos({})) === null)
checar("cabeçalho vazio não vira chave vazia", ipDaRequisicao(cabecalhos({ "x-forwarded-for": "  " })) === null)
checar("sem headers, null", ipDaRequisicao(undefined) === null)

// --------------------------------------------------------------- chaves ---
console.log("\nCHAVES")

checar(
  "o mesmo e-mail em outra caixa cai no mesmo balde",
  chaveLoginEmail(" Ana@Exemplo.COM ") === chaveLoginEmail("ana@exemplo.com")
)
checar(
  "porta diferente, contagem diferente",
  new Set([chaveLoginEmail("a@b.c"), chaveLoginIp("1.2.3.4"), chaveCadastroIp("1.2.3.4")]).size === 3
)

// --------------------------------------------------------------- tetos ---
console.log("\nTETOS")

for (const [nome, teto] of Object.entries({ LOGIN_POR_EMAIL, LOGIN_POR_IP, CADASTRO_POR_IP })) {
  checar(`${nome} é um teto de verdade`, teto.max > 0 && teto.janelaMs > 0)
}
// Casa, escola e escritório saem por um endereço só: um teto por IP igual ou
// menor que o teto por conta trancaria a sala inteira quando um aluno erra.
checar("o teto por IP é mais folgado que o por conta", LOGIN_POR_IP.max > LOGIN_POR_EMAIL.max)

// ------------------------------------------------------ o código da porta ---
console.log("\nO CÓDIGO DAS PORTAS")

const auth = ler("lib/auth.ts")
const cadastro = ler("app/api/cadastro/route.ts")
const login = ler("app/(auth)/login/page.tsx")

checar("o login pergunta o teto", auth.includes("excedeu(") && auth.includes("@/lib/portas-de-conta"))

// Armadilha 1: perguntar depois do bcrypt não nega ao atacante o custo do
// bcrypt, que é justamente o que se está protegendo. TODAS as perguntas têm de
// vir antes — olhar só a primeira deixaria passar mover uma das duas para
// depois, que é o passo em falso realista (são dois tetos, não um).
const ultimoExcedeu = auth.lastIndexOf("excedeu(")
const posCompare = auth.indexOf("bcrypt.compare")
checar(
  "todo teto é conferido ANTES do bcrypt",
  ultimoExcedeu > 0 && posCompare > 0 && ultimoExcedeu < posCompare,
  `último excedeu@${ultimoExcedeu} compare@${posCompare}`
)

// Armadilha 2: contar o acerto junto com o erro. O guard é o NOME da função
// usada, não a posição dela: `permitido` é a contagem que gasta uma tentativa
// a cada chamada, e é exatamente o que não serve numa porta de senha.
checar("a falha é registrada", auth.includes("registrar("))
checar("o acerto zera a contagem", auth.includes("limpar("))
checar(
  "o login conta falha, não tentativa",
  !auth.includes("permitido("),
  "permitido() contaria também quem entrou com a senha certa"
)

// Armadilha 3: o balde compartilhado de quem não tem IP.
for (const [arquivo, fonte] of [["lib/auth.ts", auth], ["app/api/cadastro/route.ts", cadastro]] as const) {
  checar(
    `${arquivo} não inventa IP quando não sabe`,
    !/\?\?\s*["'](anon|unknown|desconhecido|0\.0\.0\.0)["']/.test(fonte)
  )
}

checar("o cadastro pergunta o teto", cadastro.includes("permitido(") && cadastro.includes("chaveCadastroIp"))
checar("e recusa com 429, não com 400", /status:\s*429/.test(cadastro))

// Amarrado à MECÂNICA e não à data: no dia em que o teto sair do login, esta
// exigência de copy afrouxa sozinha, em vez de virar teste mentiroso pedindo
// para ser apagado.
if (auth.includes("excedeu(")) {
  checar("a tela de login diz que a entrada esfria", /esfria/i.test(login))
}

// ------------------------------------------------------------------ fim ---
console.log(falhas === 0 ? "\nTUDO OK" : `\n${falhas} FALHA(S)`)
process.exit(falhas === 0 ? 0 : 1)
