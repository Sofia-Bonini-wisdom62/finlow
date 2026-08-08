/**
 * Porta os 83 módulos do Ensino Fundamental da fonte para o contrato do app.
 *
 * Mesmo problema que a trilha de EM teve (ver scripts/portar-em.mts): a fonte
 * veio num contrato próprio e os componentes leem outro. A diferença é a
 * ESCALA — 24 módulos deram para decidir tudo à mão em prisma/editorial-em.ts,
 * 83 não dariam. Então aqui a regra é: derivar o que a fonte já diz, e FALHAR
 * listando o que ela não diz.
 *
 * O que dá para derivar, e por que é derivação e não invenção:
 *
 *   - as regras de resultado. 296 das 321 seguem uma gramática pequena
 *     ("valor > N", "valor entre N e N", "valor <= N"…) que é traduzível para
 *     a nossa sem escolher nada. As ~25 em prosa ("valor é médio, técnico ou
 *     faculdade") não são, e essas o script cobra.
 *   - as faixas do input. A fonte traz os rótulos ("Entre 1 e 2 reais"), e o
 *     valor representativo sai do próprio rótulo.
 *   - o cenário. A fonte tem personagem, história e pergunta; o componente
 *     ganhou modo narrativo justamente para não precisar de tabela inventada.
 *
 * O QUE NÃO SE DERIVA, E FICA EM prisma/editorial-ef.ts
 * Condição em prosa e cor de faixa quando o texto implica ressalva. Cor é
 * julgamento sobre a resposta de uma criança — verde por padrão é decisão
 * consciente (no Fundamental o resultado não julga, devolve), e o editorial
 * existe para as exceções.
 *
 *   node --import tsx scripts/portar-ef.mts        → escreve prisma/modulos-ef.ts
 */
import { writeFileSync } from "node:fs"
import { TRILHA_ESCOLAR } from "../prisma/trilha-escolar-fonte.js"
import { EDITORIAL_EF } from "../prisma/editorial-ef.js"

type Bruto = Record<string, any>

const pendencias: string[] = []
const modulos: Bruto[] = []

/** Rótulos da pergunta categórica do módulo, para a tela de resultado do
 *  MESMO módulo traduzir "valor == 'Pix'" no índice certo. */
const rotulosDaVez = new Map<string, string[]>()

/** Faixa numérica: rótulo → valor, para a regra que casa por rótulo mesmo
 *  quando as opções têm número ("valor == 'Menos de 1 real'"). */
const rotulosNumericos = new Map<string, { rotulos: string[]; valores: string[] }>()

/** Só o Fundamental: os 24 de "em" já foram portados e semeados. */
const FONTE = (TRILHA_ESCOLAR as Bruto[]).filter((m) => m.segmento !== "em")

/**
 * Traduz a condição da fonte para a gramática de lib/resultado.ts
 * ("campo op numero", ou "resto" como último caso).
 *
 * Devolve null quando a condição é prosa — aí quem decide é o editorial.
 */
/**
 * A fonte lista as faixas em ordem crescente OU decrescente, conforme o autor.
 * Descobrir qual decide que ponta de um intervalo vira a condição.
 */
function ehDescendente(regras: Bruto[]): boolean {
  const primeira = String(regras[0]?.se ?? "").toLowerCase()
  return /^valor\s*(>=|>)\s*-?\d/.test(primeira)
}

function traduzirCondicao(se: string, rotulos: string[] = [], descendente = false): string | null {
  const s = se
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    // A fonte escreve a mesma ideia de quatro jeitos: "valor ==", "valor é",
    // "resposta ==" e "até". Normalizar aqui evita quatro ramos idênticos
    // abaixo — e "R$" some porque é moeda no texto, não parte do número.
    .replace(/\br\$\s*/g, "")
    .replace(/^resposta\b/, "valor")
    .replace(/^valor é\b/, "valor ==")
    .replace(/^valor at[ée]\s+/, "valor <= ")
  const num = "(-?\\d+(?:[.,]\\d+)?)"
  const n = (x: string) => x.replace(",", ".")

  /**
   * Pergunta categórica: a regra casa pelo RÓTULO da opção escolhida.
   *
   * As opções viraram índices 1..N no porte, então "valor == 'Pix'" é
   * "valor == 2". O "ou" da fonte vira `em`, e não uma cadeia de
   * comparações, porque os índices escolhidos não são contíguos.
   */
  if (rotulos.length) {
    // "valor == 'A' ou valor == 'B'" e também "valor == 'A' ou 'B'", que a
    // fonte usa quando não repete o sujeito.
    const citados = [...s.matchAll(/(?:valor\s*==\s*)?'([^']+)'/g)].map((x) => x[1]!.trim())
    if (citados.length === 0 && /^valor\s*==\s*/.test(s)) {
      /**
       * Rótulo SEM aspas, e vários deles contêm "ou" por dentro: "Cartão de
       * débito ou crédito", "Caderno ou papel". Quebrar em " ou " partiria o
       * rótulo no meio. O separador de verdade é " ou valor == ", que só
       * aparece entre alternativas.
       */
      const semPrefixo = s.replace(/^valor\s*==\s*/, "")
      const porSeparadorLongo = semPrefixo.split(/\s+ou\s+valor\s*==\s*/).map((x) => x.trim())
      const conhecido = (x: string) =>
        rotulos.some((r) => r.toLowerCase().trim() === x)

      if (porSeparadorLongo.length > 1 || conhecido(porSeparadorLongo[0]!)) {
        citados.push(...porSeparadorLongo)
      } else {
        /**
         * Último recurso: a fonte às vezes lista alternativas com um " ou "
         * simples, sem repetir "valor ==". Só aceito se TODAS as partes forem
         * rótulos que existem — assim um rótulo que contenha "ou" por dentro
         * nunca é partido, porque os pedaços não bateriam com opção nenhuma.
         */
        const porSeparadorCurto = semPrefixo.split(/\s+ou\s+/).map((x) => x.trim())
        if (porSeparadorCurto.length > 1 && porSeparadorCurto.every(conhecido)) {
          citados.push(...porSeparadorCurto)
        }
      }
    }
    if (citados.length) {
      const indices = citados.map((c) =>
        rotulos.findIndex((r) => r.toLowerCase().trim() === c) + 1
      )
      if (indices.every((i) => i > 0)) {
        return indices.length === 1 ? `valor == ${indices[0]}` : `valor em ${indices.join(",")}`
      }
    }
  }

  let m = s.match(new RegExp(`^valor (?:==|=) ${num}$`))
  if (m) return `valor == ${n(m[1]!)}`

  m = s.match(new RegExp(`^valor (>=|<=|>|<) ${num}$`))
  if (m) return `valor ${m[1]} ${n(m[2]!)}`

  /**
   * "valor entre A e B" vira o limite SUPERIOR, não o inferior.
   *
   * As faixas são avaliadas em ordem e a primeira que casa vence, então quem
   * chega nesta linha já não casou com as anteriores — o piso está garantido
   * por elas. É o TETO que precisa ser dito, senão a condição engole tudo daí
   * para cima e a regra seguinte nunca dispara.
   *
   * Foi exatamente o que aconteceu na primeira versão: com `valor >= A`, mais
   * de trinta módulos ficaram com a última mensagem inalcançável. Nada dava
   * erro — a tela simplesmente nunca mostrava aquele texto.
   * `scripts/testar-ef.mts` executa cada resultado e exige que toda faixa
   * escrita seja alcançável, que é como isso apareceu.
   */
  m = s.match(new RegExp(`^valor entre ${num} e ${num}$`))
  if (m) return descendente ? `valor >= ${n(m[1]!)}` : `valor <= ${n(m[2]!)}`

  m = s.match(new RegExp(`^valor (?:>=|>) ${num} e valor (?:<=|<) ${num}$`))
  if (m) return descendente ? `valor >= ${n(m[1]!)}` : `valor <= ${n(m[2]!)}`

  return null
}

/**
 * O valor representativo de uma faixa, lido do próprio rótulo.
 *
 * Devolve null quando o rótulo não tem número — e isso NÃO é falha: metade
 * das perguntas do Fundamental é categórica ("Hoje", "Pix", "Caderno ou
 * papel"). Nesses casos quem chama usa o ÍNDICE da opção, e as condições de
 * resultado passam a comparar índice. Ver `traduzirCondicao`.
 */
function valorDaFaixa(rotulo: string): string | null {
  const s = rotulo.toLowerCase().replace(/\./g, "").replace(",", ".")

  /**
   * "Nada guardado em casa" é ZERO, não é rótulo sem número.
   *
   * Sem isto, uma única opção assim marcava a escala inteira como categórica e
   * trocava valores em reais por índices 1..5 — e aí a regra "valor <= 200"
   * passava a comparar índice com dinheiro, engolia todas as opções e matava a
   * última mensagem. Aconteceu em ef89-casa-ou-banco, cujas outras quatro
   * opções são faixas de real.
   */
  if (/^(nada|nenhum|nenhuma|zero|não|nunca)\b/.test(s)) return "0"

  const nums = [...s.matchAll(/(\d+(?:\.\d+)?)/g)].map((x) => Number(x[1]))
  if (nums.length === 0) return null
  // "entre A e B" e "de A a B" são a mesma faixa escrita de dois jeitos.
  if (nums.length >= 2 && /^(entre|de)\b/.test(s)) return String((nums[0]! + nums[1]!) / 2)
  if (/menos de|até|abaixo/.test(s)) return String(nums[0]! / 2)
  if (/mais de|acima|ou mais/.test(s)) return String(nums[0]! * 1.4)
  return String(nums[0])
}

/**
 * Regra que cita o RÓTULO de uma faixa numérica.
 *
 * "valor == 'Menos de 1 real'" numa pergunta cujas opções já têm número: o
 * rótulo vira o valor que aquela opção realmente envia, e a comparação volta
 * a ser numérica.
 */
function porRotuloNumerico(
  se: string,
  faixa: { rotulos: string[]; valores: string[] }
): string | null {
  const citados = [...se.toLowerCase().matchAll(/'([^']+)'/g)].map((x) => x[1]!.trim())
  if (citados.length === 0) return null
  const valores = citados.map((c) => {
    const i = faixa.rotulos.findIndex((r) => r.toLowerCase().trim() === c)
    return i >= 0 ? faixa.valores[i]! : null
  })
  if (valores.some((v) => v === null)) return null
  return valores.length === 1 ? `valor == ${valores[0]}` : `valor em ${valores.join(",")}`
}

const TIPO_CAMPO: Record<string, string> = {
  moeda: "decimal",
  numero: "decimal",
  percentual: "decimal",
  texto: "texto",
  faixa: "faixa",
}

for (const m of FONTE) {
  const ed = (EDITORIAL_EF as Bruto)[m.slug] ?? {}

  const telas = m.telas.map((t: Bruto) => {
    const c = t.conteudo as Bruto
    const base = { ordem: t.ordem, tipo: t.tipo, label: t.label, mediacao: c.mediacao ?? null }

    switch (t.tipo) {
      case "conceito":
        // `destaque` é a frase-soco (vira headline); `texto` é o desenvolvimento.
        return { ...base, conteudo: { headline: c.destaque, corpo: c.texto } }

      case "cenario":
        // A pergunta é o título e a história é o miolo. Sem tabela: ver o
        // comentário de `linhas` em types/trilha.ts.
        return {
          ...base,
          conteudo: {
            headline: c.pergunta,
            personagem: c.personagem,
            narrativa: c.texto,
          },
        }

      case "quiz": {
        const alts = (c.alternativas ?? []) as Bruto[]
        return {
          ...base,
          conteudo: {
            headline: c.enunciado,
            // A letra é IDENTIDADE interna (o servidor confere o gabarito por
            // ela); a letra que a pessoa vê vem da posição, depois do
            // embaralho. Por isso derivar de `id` é seguro.
            opcoes: alts.map((a) => ({
              letra: String(a.id ?? "").toUpperCase(),
              texto: a.texto,
              correta: !!a.correta,
              feedback: a.feedback,
            })),
          },
        }
      }

      case "input": {
        /**
         * O editorial pode TROCAR o campo por uma escolha.
         *
         * Sete módulos tinham texto livre (ou percentual) com regras de
         * resultado que só um humano lendo a resposta avaliaria. Virar escolha
         * é o que mantém as três devolutivas escritas pelo autor alcançáveis —
         * ver o cabeçalho de prisma/editorial-ef.ts.
         */
        if (ed.opcoes?.length) {
          rotulosDaVez.set(m.slug, ed.opcoes)
          return {
            ...base,
            conteudo: {
              headline: ed.pergunta ?? c.pergunta,
              campos: [
                {
                  id: "valor",
                  emoji: ed.emoji ?? "✏️",
                  label: c.ajuda ?? ed.pergunta ?? c.pergunta,
                  tipo: "faixa",
                  opcoes: ed.opcoes.map((r: string, i: number) => ({
                    label: r,
                    valor: String(i + 1),
                  })),
                },
              ],
            },
          }
        }

        const tipo = TIPO_CAMPO[c.campo as string]
        if (!tipo) {
          pendencias.push(`${m.slug}: campo de input "${c.campo}" sem tradução`)
          return { ...base, conteudo: { headline: c.pergunta, campos: [] } }
        }
        const campo: Bruto = {
          id: "valor",
          emoji: ed.emoji ?? "✏️",
          label: c.ajuda ?? c.pergunta,
          tipo,
        }
        if (tipo !== "faixa") campo.placeholder = c.placeholder
        if (tipo === "faixa") {
          const rotulos = (c.faixas ?? []) as string[]
          if (rotulos.length === 0) pendencias.push(`${m.slug}: input faixa sem opções`)
          // Numérica: o valor sai do rótulo ("Entre 1 e 2 reais" → 1.5).
          // Categórica: o valor é a POSIÇÃO, e a regra de resultado compara
          // índice. Basta uma opção sem número para a escala inteira virar
          // ordinal — misturar 1.5 com índice 3 na mesma pergunta compararia
          // coisas de naturezas diferentes.
          const numericos = rotulos.map(valorDaFaixa)
          const ehCategorica = numericos.some((v) => v === null)
          campo.opcoes = rotulos.map((r, i) => ({
            label: r,
            valor: ehCategorica ? String(i + 1) : numericos[i]!,
          }))
          // Os rótulos são registrados SEMPRE, mesmo na faixa numérica: há
          // regra que casa por rótulo ("valor == 'Menos de 1 real'") numa
          // pergunta cujas opções têm número. Guardar só no caso categórico
          // deixava essas de fora.
          rotulosDaVez.set(m.slug, ehCategorica ? rotulos : [])
          if (!ehCategorica) rotulosNumericos.set(m.slug, { rotulos, valores: numericos as string[] })
        }
        return { ...base, conteudo: { headline: c.pergunta, campos: [campo] } }
      }

      case "resultado": {
        const regras = (c.regras ?? []) as Bruto[]
        const faixas = regras.map((r, i) => {
          const ehUltima = i === regras.length - 1
          const numerica = rotulosNumericos.get(m.slug)
          const traduzida = ehUltima
            ? "resto"
            : ed.condicoes?.[i] ??
              traduzirCondicao(
                String(r.se ?? ""),
                rotulosDaVez.get(m.slug) ?? [],
                ehDescendente(regras)
              ) ??
              (numerica ? porRotuloNumerico(String(r.se ?? ""), numerica) : null)
          if (traduzida === null) {
            pendencias.push(`${m.slug}: condição em prosa — "${r.se}"`)
          }
          return {
            condicao: traduzida ?? "resto",
            mensagem: r.entao,
            // Verde por padrão: no Fundamental o resultado devolve o que a
            // criança respondeu, não a julga. Ressalva é exceção e mora no
            // editorial.
            cor: ed.cores?.[i] ?? "green",
          }
        })
        return {
          ...base,
          conteudo: {
            headline: c.texto,
            formula: "valor_direto",
            faixas,
            ...(c.proximoPasso ? { insightDinamico: c.proximoPasso } : {}),
          },
        }
      }

      default:
        pendencias.push(`${m.slug}: tipo de tela "${t.tipo}" desconhecido`)
        return { ...base, conteudo: {} }
    }
  })

  modulos.push({
    slug: m.slug,
    titulo: m.titulo,
    subtitulo: m.subtitulo,
    publico: m.segmento,
    blocoId: m.blocoId,
    blocoRotulo: m.blocoRotulo,
    ordem: m.ordem,
    nivel: m.nivel,
    duracaoMin: m.duracaoMin,
    pontos: m.pontos,
    tags: m.tags,
    thumbnail: m.thumbnail,
    preRequisitoSlug: m.destravadoPor ?? null,
    ehRevisao: !!m.ehRevisao,
    situacoes: [],
    tipoPerfil: m.segmento,
    habilidades: m.habilidades,
    telas,
  })
}

console.log(`módulos portados: ${modulos.length}`)
console.log(`telas: ${modulos.reduce((a, m) => a + m.telas.length, 0)}`)

if (pendencias.length) {
  const unicas = [...new Set(pendencias)]
  console.error(`\n${unicas.length} pendência(s) que a fonte não resolve:\n`)
  for (const p of unicas.slice(0, 40)) console.error("  ✗ " + p)
  if (unicas.length > 40) console.error(`  … e mais ${unicas.length - 40}`)
  console.error(`\nCada uma precisa de uma entrada em prisma/editorial-ef.ts.`)
  console.error(`NÃO gravei prisma/modulos-ef.ts: arquivo meio-portado é pior`)
  console.error(`que arquivo nenhum, porque parece pronto.\n`)
  process.exit(1)
}

writeFileSync(
  "prisma/modulos-ef.ts",
  `// GERADO por scripts/portar-ef.mts — não edite à mão.\n` +
    `// Fonte: prisma/trilha-escolar-fonte.ts · decisões: prisma/editorial-ef.ts\n\n` +
    `export const MODULOS_EF = ${JSON.stringify(modulos, null, 2)} as const\n`,
  "utf8"
)
console.log("→ prisma/modulos-ef.ts")
