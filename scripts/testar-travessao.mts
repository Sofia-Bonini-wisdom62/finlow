/**
 * Guard da regra "sem travessão em texto de app" (decisão da fundadora,
 * 15/08/2026, registrada no CLAUDE.md): travessão não é linguagem de
 * aplicativo. Vírgula, dois-pontos ou ponto, o que o português pedir.
 *
 * O guard varre app/, components/ e lib/ SEM os comentários, nos dois
 * estilos e independente de fim de linha, a lição do guard da landing:
 * checagem que depende do estilo de quem escreveu não guarda nada. O que
 * sobra depois de tirar comentário é código, e travessão em código é string
 * que alguém vai ler na tela, no prompt ou num erro.
 *
 * Exceção única, por conteúdo: a linha do prompt que PROÍBE o travessão
 * precisa nomear o caractere para o modelo entender do que se fala.
 *
 * Rodar: node --import tsx scripts/testar-travessao.mts
 */
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

function semComentarios(fonte: string): string {
  return fonte
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:"'])\/\/.*$/gm, (m, p: string) => p + " ".repeat(m.length - p.length))
}

function varrer(dir: string, saida: string[]): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name !== "node_modules") varrer(p, saida)
    } else if (/\.(tsx?|mts)$/.test(e.name)) {
      saida.push(p)
    }
  }
  return saida
}

const arquivos = [...varrer("app", []), ...varrer("components", []), ...varrer("lib", [])]
const achados: string[] = []

for (const arquivo of arquivos) {
  const limpo = semComentarios(readFileSync(arquivo, "utf8"))
  limpo.split(/\r?\n/).forEach((linha, i) => {
    if (!/[—–]/.test(linha)) return
    // A linha do prompt que ensina o modelo a NÃO usar o caractere.
    if (/NUNCA use travessão/.test(linha)) return
    achados.push(`${arquivo}:${i + 1}: ${linha.trim().slice(0, 90)}`)
  })
}

if (achados.length > 0) {
  console.log("Travessão em texto de app (regra do CLAUDE.md: não é linguagem de aplicativo):\n")
  for (const a of achados) console.log("  " + a)
  console.log(`\n✗ ${achados.length} linha(s). Troque por vírgula, dois-pontos ou ponto.`)
  process.exit(1)
}

console.log(`✓ nenhum travessão em texto de app (${arquivos.length} arquivos varridos)`)
process.exit(0)
