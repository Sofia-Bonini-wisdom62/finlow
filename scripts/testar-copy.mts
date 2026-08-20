/**
 * Guard de duas correções de copy da avaliação de UX (itens 7 e 9a de
 * `docs/backlog-produto.md`).
 *
 * RODA SEM BANCO E SEM BUILD — lê o fonte e confere o que ele promete.
 *
 * Por que teste de copy, de novo: nenhuma das duas coisas guardadas aqui quebra
 * build, typecheck ou lint. Um rótulo de botão que promete o que o clique não
 * faz compila perfeitamente, e flexão de gênero fixa compila. Some sem avisar e
 * volta sem avisar, a mesma lição de `testar-landing.mts` — que segue dono do
 * outro lado da porta: jargão de dentro do app na copy de `/login` e
 * `/cadastro` é checado lá, e não se repete aqui.
 *
 * O QUE CADA CHECAGEM GUARDA
 *
 * 1. PROMESSA DO BOTÃO (item 7). "Enviar para a IA reordenar" prometia a
 *    reordenação como consequência do clique, e o clique só abre o chat com a
 *    pergunta pronta — se o assistente responde "não dá", o botão vira mentira.
 *    A checagem é amarrada à MECÂNICA, não à data: ela só exige o rótulo
 *    honesto enquanto o toque for navegação para o chat. No dia em que existir
 *    uma rota que reordena de verdade, ela afrouxa sozinha em vez de virar
 *    teste mentiroso pedindo para ser apagado.
 *
 * 2. FLEXÃO DE GÊNERO FIXA (item 9a). "Prefiro olhar o app sozinha" escrevia
 *    em feminino para todo mundo, e a landing tinha o espelho masculino. O
 *    guard não tenta julgar concordância em geral: ele pega a palavra
 *    flexionada SÓ quando a pessoa é o sujeito da frase ("você ... sozinho",
 *    "Prefiro ... sozinha"). É de propósito que "a energia volta sozinha"
 *    passe — ali a flexão está certa, e guard que acusa frase correta só treina
 *    quem vem depois a desligá-lo.
 *
 *   node --import tsx scripts/testar-copy.mts
 */
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

const raiz = join(import.meta.dirname, "..")
const ler = (p: string) => readFileSync(join(raiz, p), "utf8")

let falhas = 0
function checar(nota: string, ok: boolean, detalhe = "") {
  if (!ok) falhas++
  console.log(`  ${ok ? "ok   " : "FALHA"} ${nota}${detalhe ? `  ${detalhe}` : ""}`)
}

/**
 * Tira comentário de bloco e de linha, preservando `https://`.
 *
 * É o que separa copy de aviso: os comentários destas correções CITAM a frase
 * antiga de propósito, para ninguém reescrevê-la sem saber. Guard que lesse o
 * comentário acusaria justamente o aviso que protege a correção.
 */
function semComentarios(fonte: string): string {
  return fonte
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:"'])\/\/.*$/gm, (m, p: string) => p + " ".repeat(m.length - p.length))
}

function varrer(dir: string, saida: string[] = []): string[] {
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`
    if (e.isDirectory()) {
      if (e.name !== "node_modules") varrer(p, saida)
    } else if (/\.tsx?$/.test(e.name)) {
      saida.push(p)
    }
  }
  return saida
}

console.log("\n1. O botão da válvula de escape promete o que o toque faz")

const drawer = "components/trilha-visual/DrawerModulo.tsx"
const drawerCopy = semComentarios(ler(drawer))

// A mecânica de hoje: o toque monta a pergunta e navega para o chat.
const soAbreOChat = /window\.location\.href\s*=\s*`\/chat\?pergunta=/.test(drawerCopy)
checar(`${drawer} leva a pergunta para o chat`, soAbreOChat)

if (soAbreOChat) {
  checar(
    "nenhum rótulo promete que a IA reordena",
    !/reorden|reorganiz/i.test(drawerCopy),
    "o clique só abre o chat, quem decide é a resposta",
  )
  checar(
    "a tela diz que abre o chat",
    /Abre o chat/i.test(drawerCopy),
    "sem isso o rótulo honesto esconde o que vai acontecer",
  )
} else {
  console.log("  (mecânica mudou: existe caminho além do chat, checagem de copy afrouxa)")
}

console.log("\n2. Flexão de gênero fixa em texto de app")

/**
 * A pessoa como sujeito. Cada padrão precisa amarrar a palavra flexionada a
 * quem a frase fala com ("você", "eu", "prefiro"), senão pega concordância
 * legítima com substantivo feminino ("a energia volta sozinha").
 */
const FLEXOES: { padrao: RegExp; nota: string }[] = [
  {
    padrao: /\b(?:prefiro|quero|posso|consigo|eu|voc[êe]|te)\b[^.!?\n<>]{0,45}\bsozinh[oa]\b/giu,
    nota: "sozinho/sozinha com a pessoa como sujeito",
  },
  { padrao: /\bbem[-\s]vind[oa]s?\b/giu, nota: "bem-vindo/bem-vinda" },
  {
    padrao: /\bvoc[êe]\b[^.!?\n<>]{0,30}\b(?:pronto|pronta|preparad[oa]|cansad[oa])\b/giu,
    nota: "você + adjetivo flexionado",
  },
]

const achados: string[] = []
const arquivos = [...varrer("app"), ...varrer("components")]
for (const arquivo of arquivos) {
  const copy = semComentarios(ler(arquivo))
  copy.split(/\r?\n/).forEach((linha, i) => {
    for (const { padrao, nota } of FLEXOES) {
      padrao.lastIndex = 0
      if (padrao.test(linha)) achados.push(`${arquivo}:${i + 1} (${nota}): ${linha.trim().slice(0, 80)}`)
    }
  })
}
checar(`nenhuma flexão fixa em ${arquivos.length} arquivos de app/ e components/`, achados.length === 0)
for (const a of achados) console.log(`         ${a}`)

console.log(
  falhas === 0
    ? "\n✓ copy das telas coerente com o que o produto faz\n"
    : `\n✗ ${falhas} falha(s)\n`,
)
process.exit(falhas === 0 ? 0 : 1)
