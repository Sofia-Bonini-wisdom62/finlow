/**
 * Auditoria dos módulos publicados: forma, fórmulas, tokens e vieses.
 *
 * POR QUE ISTO EXISTE
 * Conteúdo quebra sem dar erro. Um `{token}` que não existe vira texto vazio na
 * tela; uma fórmula com nome errado cai no default e mostra zero; um quiz com
 * a correta sempre na mesma letra ensina a clicar em A sem ler. Nada disso
 * aparece em build nem em log — só na tela de alguém.
 *
 *   node --import tsx scripts/auditar-modulos.mts
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

const { db } = await import("../lib/db.js")
const { calcular, interpolar } = await import("../lib/resultado.js")
const { chavesCitadas } = await import("../lib/indicadores.js")
const { embaralharPorSemente } = await import("../lib/embaralhar.js")

let problemas = 0
function acusar(slug: string, msg: string) {
  problemas++
  console.log(`  ✗ ${slug}: ${msg}`)
}

const TIPOS_TELA = new Set(["conceito", "cenario", "quiz", "input", "resultado"])
const TIPOS_CAMPO = new Set(["decimal", "texto", "faixa"])
const TIPOS_LINHA = new Set(["entrada", "saida", "saldo"])

const indicadores = new Set(
  (await db.indicador.findMany({ select: { chave: true } })).map((i) => i.chave)
)

const modulos = await db.modulo.findMany({
  include: { telas: { orderBy: { ordem: "asc" } } },
  orderBy: { ordem: "asc" },
})

console.log(`${modulos.length} módulos, ${modulos.reduce((s, m) => s + m.telas.length, 0)} telas\n`)

// Derivados de referência, para saber quais {tokens} o interpolar resolve de
// verdade: um token que devolve string vazia num Derivados populado não existe.
const derivadosProva = calcular(undefined, { entrou: "1", saiu: "1" })
const chavesDerivados = new Set(Object.keys(derivadosProva))

const distribuicaoCorretas: Record<string, number> = {}

for (const m of modulos) {
  // ---- forma ----
  const ordens = m.telas.map((t) => t.ordem)
  // T1 tem 7 telas e T2 tem 6 — os dois são válidos. O que não pode é buraco.
  if (m.telas.length < 5 || m.telas.length > 8)
    acusar(m.slug, `${m.telas.length} telas (esperado entre 5 e 8)`)
  if (new Set(ordens).size !== ordens.length) acusar(m.slug, "ordem de tela repetida")
  if (Math.min(...ordens) !== 0 || Math.max(...ordens) !== m.telas.length - 1)
    acusar(m.slug, `ordens não contíguas: ${ordens.join(",")}`)
  if (!m.tags.length) acusar(m.slug, "sem tags")

  // Campos declarados nos inputs — os {tokens} podem vir deles via sessão.
  const idsDeCampo = new Set<string>()

  for (const t of m.telas) {
    const c = t.conteudo as Record<string, unknown>
    if (!TIPOS_TELA.has(t.tipo)) acusar(m.slug, `tela ${t.ordem}: tipo desconhecido "${t.tipo}"`)

    // ---- indicadores {{...}} ----
    for (const chave of chavesCitadas(JSON.stringify(c))) {
      if (!indicadores.has(chave)) acusar(m.slug, `tela ${t.ordem}: indicador {{${chave}}} não existe`)
    }

    if (t.tipo === "quiz") {
      const opcoes = (c.opcoes ?? []) as { letra: string; correta: boolean; texto?: string; feedback?: string }[]
      // T1 usa 3 opções, T2 usa 4. Menos de 2 é que não é pergunta.
      if (opcoes.length < 2) acusar(m.slug, `quiz ${t.ordem}: ${opcoes.length} opções`)
      const corretas = opcoes.filter((o) => o.correta)
      if (corretas.length === 0) acusar(m.slug, `quiz ${t.ordem}: nenhuma correta`)
      if (opcoes.some((o) => !o.feedback)) acusar(m.slug, `quiz ${t.ordem}: opção sem feedback`)

      // Feedback citando "letra X" quebra com o embaralho: a letra exibida
      // deixou de ser a dos dados.
      for (const o of opcoes) {
        if (/letra [A-D]\b/.test(o.feedback ?? ""))
          acusar(m.slug, `quiz ${t.ordem}: feedback cita letra fixa`)
      }

      // O que interessa é a posição EXIBIDA da correta, depois do embaralho da
      // tela — a letra gravada nos dados deixou de decidir qualquer coisa.
      const headlineQuiz = (c.headline as string) ?? ""
      const exibidas = embaralharPorSemente(opcoes, headlineQuiz)
      exibidas.forEach((o, i) => {
        if (o.correta) {
          const pos = String.fromCharCode(65 + i)
          distribuicaoCorretas[pos] = (distribuicaoCorretas[pos] ?? 0) + 1
        }
      })

      // Determinismo: voltar de tela não pode rearrumar as opções.
      const deNovo = embaralharPorSemente(opcoes, headlineQuiz)
      if (exibidas.map((o) => o.letra).join() !== deNovo.map((o) => o.letra).join())
        acusar(m.slug, `quiz ${t.ordem}: embaralho não é determinístico`)
    }

    if (t.tipo === "input") {
      const campos = (c.campos ?? []) as { id?: string; tipo?: string; opcoes?: unknown[] }[]
      if (!campos.length) acusar(m.slug, `input ${t.ordem}: sem campos`)
      for (const campo of campos) {
        if (!campo.id) acusar(m.slug, `input ${t.ordem}: campo sem id`)
        else idsDeCampo.add(campo.id)
        if (campo.tipo && !TIPOS_CAMPO.has(campo.tipo))
          acusar(m.slug, `input ${t.ordem}: tipo de campo "${campo.tipo}"`)
        if (campo.tipo === "faixa" && !campo.opcoes?.length)
          acusar(m.slug, `input ${t.ordem}: faixa sem opções`)
      }
    }

    if (t.tipo === "cenario") {
      const linhas = (c.linhas ?? []) as { tipo?: string; valor?: unknown }[]
      if (!linhas.length) acusar(m.slug, `cenario ${t.ordem}: sem linhas`)
      for (const l of linhas) {
        if (l.tipo && !TIPOS_LINHA.has(l.tipo)) acusar(m.slug, `cenario ${t.ordem}: linha tipo "${l.tipo}"`)
        if (typeof l.valor !== "number") acusar(m.slug, `cenario ${t.ordem}: linha sem valor numérico`)
      }
    }

    if (t.tipo === "resultado") {
      const formula = c.formula as string | undefined
      // Fórmula desconhecida cai no default sem erro — o único jeito de pegar
      // é calcular com ela e ver se algum derivado além do base mexeu.
      // "entrou_saiu_pct" É o cálculo default — compará-la com o default
      // acusaria a única fórmula que é igual a ele por definição.
      if (formula && formula !== "entrou_saiu_pct") {
        // Valores ESCALONADOS, não iguais: fórmula de comparação (a > b?) com
        // os dois campos iguais devolve o mesmo que o default e a sonda
        // acusaria fórmula boa — foi o falso positivo de pausa_limiar.
        const sessaoProva: Record<string, string> = { entrou: "1000", saiu: "500" }
        let escala = 900
        for (const id of idsDeCampo) { sessaoProva[id] = String(escala); escala = Math.max(50, Math.round(escala / 3)) }
        const d = calcular(formula, sessaoProva)
        const dSemFormula = calcular(undefined, sessaoProva)
        if (JSON.stringify(d) === JSON.stringify(dSemFormula))
          acusar(m.slug, `resultado ${t.ordem}: fórmula "${formula}" não altera nada (nome errado?)`)
      }

      // ---- tokens {x} ----
      // {{indicador}} é interpolado ANTES, no servidor — sem tirar as chaves
      // duplas o regex de chave simples casaria o miolo delas e acusaria
      // indicador legítimo como token quebrado.
      const textos = [c.headline, c.insightDinamico, ...((c.faixas ?? []) as { mensagem?: string }[]).map((f) => f.mensagem)]
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.replace(/\{\{\w+\}\}/g, ""))
      for (const texto of textos) {
        for (const [, token] of texto.matchAll(/\{(\w+)\}/g)) {
          const resolveDerivado =
            chavesDerivados.has(token) ||
            interpolar(`{${token}}`, derivadosProva, {}) !== ""
          const resolveSessao = idsDeCampo.has(token) || token.startsWith("ind_")
          if (!resolveDerivado && !resolveSessao)
            acusar(m.slug, `resultado ${t.ordem}: token {${token}} não resolve`)
        }
      }

      // ---- faixas ----
      // Sem faixas é válido: TelaResultado renderiza só headline + insight.
      const faixas = (c.faixas ?? []) as { condicao?: string; cor?: string }[]
      for (const f of faixas) {
        const okForma = /^(\w+)\s*(>=|<=|>|<|==)\s*(-?\d+)(pct)?$/.test(f.condicao ?? "")
        if (!okForma) acusar(m.slug, `resultado ${t.ordem}: condição "${f.condicao}" malformada`)
        else {
          const campo = (f.condicao ?? "").match(/^(\w+)/)?.[1] ?? ""
          if (!chavesDerivados.has(campo))
            acusar(m.slug, `resultado ${t.ordem}: condição usa "${campo}", que não é derivado`)
        }
      }
    }
  }
}

console.log(`\nPOSIÇÃO EXIBIDA DAS CORRETAS (depois do embaralho)`)
const total = Object.values(distribuicaoCorretas).reduce((s, v) => s + v, 0)
for (const letra of ["A", "B", "C", "D"]) {
  const n = distribuicaoCorretas[letra] ?? 0
  console.log(`  ${letra}: ${String(n).padStart(3)}  (${Math.round((n / total) * 100)}%)`)
}

await db.$disconnect()
console.log(`\n${problemas === 0 ? "✓ nenhum problema estrutural" : `✗ ${problemas} problema(s)`}`)
process.exit(problemas === 0 ? 0 : 1)
