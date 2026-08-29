/**
 * Confere os 83 módulos do Fundamental já PORTADOS, contra o contrato que os
 * componentes leem e contra o motor de faixas que os avalia.
 *
 * A conferência que importa não é estrutural, é de ALCANCE: uma tela de
 * resultado pode ter três mensagens bem escritas, passar em qualquer validação
 * de forma, e mesmo assim só exibir a última para sempre — basta que as
 * condições nunca casem. `avaliarFaixa` cai na última quando nada bate, então
 * o defeito não dá erro: ele apaga o trabalho do autor em silêncio.
 *
 * Por isso cada resultado é EXECUTADO aqui, com os valores que a pergunta
 * daquele módulo consegue produzir, e o teste exige que toda faixa escrita seja
 * alcançável por algum deles.
 *
 *   node --import tsx scripts/testar-ef.mts
 */
import { MODULOS_EF } from "../prisma/modulos-ef.js"
import { avaliarFaixa } from "../lib/resultado.js"
import type { Derivados } from "../lib/resultado.js"

// `any` de propósito: este script varre a fonte BRUTA campo a campo, e tipar
// o bruto esconderia exatamente os buracos que ele existe para acusar.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Bruto = Record<string, any>

let falhas = 0
const acusar = (slug: string, o: string) => {
  falhas++
  console.log(`  ✗ ${slug}: ${o}`)
}

const TIPOS = new Set(["conceito", "cenario", "quiz", "input", "resultado"])
let telas = 0
const habilidades = new Set<string>()
const porSegmento: Record<string, number> = {}

for (const m of MODULOS_EF as unknown as Bruto[]) {
  porSegmento[m.publico] = (porSegmento[m.publico] ?? 0) + 1
  for (const h of m.habilidades ?? []) habilidades.add(h)
  telas += m.telas.length

  if (m.telas.length !== 5) acusar(m.slug, `${m.telas.length} telas (esperado 5)`)
  if (!m.blocoId || !m.blocoRotulo) acusar(m.slug, "sem bloco")
  if (!m.publico?.startsWith("ef")) acusar(m.slug, `público "${m.publico}" não é do Fundamental`)

  /** Os valores que a pergunta deste módulo consegue produzir. */
  const candidatos: number[] = []

  for (const t of m.telas as Bruto[]) {
    const c = t.conteudo ?? {}
    if (!TIPOS.has(t.tipo)) acusar(m.slug, `tipo de tela "${t.tipo}"`)

    if (t.tipo === "conceito" && (!c.headline || !c.corpo)) {
      acusar(m.slug, "conceito sem headline ou corpo")
    }

    if (t.tipo === "cenario") {
      if (!c.headline) acusar(m.slug, "cenário sem headline")
      // Modo narrativo: sem tabela, mas a história tem de estar lá.
      if (!c.narrativa && !c.linhas?.length) acusar(m.slug, "cenário sem narrativa e sem linhas")
    }

    if (t.tipo === "quiz") {
      const ops = (c.opcoes ?? []) as Bruto[]
      if (!c.headline) acusar(m.slug, "quiz sem headline")
      if (ops.length < 2) acusar(m.slug, `quiz com ${ops.length} opção(ões)`)
      if (ops.filter((o) => o.correta).length !== 1) acusar(m.slug, "quiz sem exatamente uma correta")
      if (ops.some((o) => !o.letra || !o.texto || !o.feedback)) acusar(m.slug, "opção incompleta")
      if (new Set(ops.map((o) => o.letra)).size !== ops.length) acusar(m.slug, "letras repetidas")
    }

    if (t.tipo === "input") {
      const campos = (c.campos ?? []) as Bruto[]
      if (campos.length === 0) acusar(m.slug, "input sem campos")
      for (const campo of campos) {
        if (!campo.id || !campo.tipo) acusar(m.slug, "campo sem id ou tipo")
        if (campo.tipo === "faixa") {
          const ops = (campo.opcoes ?? []) as Bruto[]
          if (ops.length < 2) acusar(m.slug, `faixa com ${ops.length} opção(ões)`)
          for (const o of ops) {
            if (!o.label) acusar(m.slug, "opção de faixa sem label")
            const n = Number(o.valor)
            if (!isFinite(n)) acusar(m.slug, `opção "${o.label}" com valor não numérico`)
            else candidatos.push(n)
          }
        }
      }
    }

    if (t.tipo === "resultado") {
      if (!c.headline) acusar(m.slug, "resultado sem headline")
      const faixas = (c.faixas ?? []) as Bruto[]
      if (faixas.length === 0) acusar(m.slug, "resultado sem faixas")
      for (const f of faixas) {
        if (!f.mensagem) acusar(m.slug, "faixa sem mensagem")
        if (!["green", "yellow", "red"].includes(f.cor)) acusar(m.slug, `cor "${f.cor}"`)
      }

      /**
       * A sondagem sai das PRÓPRIAS condições, não de uma escada fixa.
       *
       * A primeira versão usava [0, 1, …, 1000] para campo aberto e acusava
       * nove módulos de terem a última faixa inalcançável. Estavam corretos: os
       * limites deles eram 1000 e 10000, e a escada parava justo no primeiro.
       * O defeito era do teste, que media a régua em vez do texto.
       */
      const limites = faixas
        .map((f) => Number(String(f.condicao).match(/(-?\d+(?:\.\d+)?)/)?.[1]))
        .filter((n) => isFinite(n))
      const daCondicao = limites.flatMap((n) => [n - 1, n, n + 1])
      const acimaDeTudo = limites.length ? Math.max(...limites) * 2 + 10 : 0

      const valores = [
        ...new Set([...candidatos, ...daCondicao, acimaDeTudo, 0].filter((n) => isFinite(n))),
      ]

      const alcancadas = new Set<number>()
      for (const v of valores) {
        const escolhida = avaliarFaixa(faixas as never, { valor: v } as unknown as Derivados)
        const i = faixas.indexOf(escolhida as never)
        if (i >= 0) alcancadas.add(i)
      }
      for (let i = 0; i < faixas.length; i++) {
        if (!alcancadas.has(i)) {
          acusar(
            m.slug,
            `faixa ${i + 1}/${faixas.length} INALCANÇÁVEL ("${String(faixas[i]!.condicao)}") — ` +
              `a mensagem existe e nunca aparece`
          )
        }
      }
    }
  }
}

// "declaradas": conta o que os módulos DIZEM cobrir, sem abrir a matriz do BC.
// Quem confronta de verdade é scripts/testar-matriz.mts.
console.log(
  `\n${(MODULOS_EF as unknown as Bruto[]).length} módulos · ${telas} telas · ` +
    `${habilidades.size} habilidades declaradas · ${falhas} falha(s)`
)
console.log(
  "por segmento: " +
    Object.entries(porSegmento)
      .sort()
      .map(([s, n]) => `${s} ${n}`)
      .join(" · ")
)
process.exit(falhas === 0 ? 0 : 1)
