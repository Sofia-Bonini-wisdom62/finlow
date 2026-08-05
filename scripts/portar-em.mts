/**
 * Porta a trilha de Ensino Médio da fonte para o contrato que o app lê.
 *
 * A fonte (`prisma/trilha-em-fonte.ts`) veio escrita num contrato próprio:
 * `texto`/`destaque`, `enunciado`/`alternativas`, `campo`, `regras`. Os
 * componentes leem outro: `headline`/`corpo`, `opcoes`, `campos`, `faixas`.
 * Semear a fonte direto grava 120 telas quebradas — e três dos cinco tipos
 * fazem `.map` num array que não existe, então o player estoura em vez de só
 * ficar vazio.
 *
 * O que é mecânico está aqui. O que exige decisão (linhas do cenário, cor das
 * faixas, condições reescritas, valor das opções) está em
 * `prisma/editorial-em.ts`, separado de propósito: dá para revisar as escolhas
 * sem ler o conversor.
 *
 *   node --import tsx scripts/portar-em.mts        → escreve prisma/modulos-em.ts
 */
import { writeFileSync } from "node:fs"
import { TRILHA_ENSINO_MEDIO } from "../prisma/trilha-em-fonte.js"
import { EDITORIAL_EM } from "../prisma/editorial-em.js"

type Bruto = Record<string, any>

const erros: string[] = []
const modulos: Bruto[] = []

for (const m of TRILHA_ENSINO_MEDIO as Bruto[]) {
  const ed = EDITORIAL_EM[m.slug]
  if (!ed) {
    erros.push(`${m.slug}: sem entrada em EDITORIAL_EM`)
    continue
  }

  /** A unidade da pergunta decide como o número é ecoado no resultado.
   *  `{valor}` formata como moeda; `{valorCru}` devolve o que foi digitado. */
  const campoFonte = m.telas.find((t: Bruto) => t.tipo === "input")?.conteudo?.campo
  const ehDinheiro = campoFonte === "moeda"
  const chaveEco = ehDinheiro ? "{valor}" : "{valorCru}"

  const telas = m.telas.map((t: Bruto) => {
    const c = t.conteudo as Bruto
    const base = { ordem: t.ordem, tipo: t.tipo, label: t.label }

    switch (t.tipo) {
      case "conceito":
        // `destaque` é a frase-soco (vira headline); `texto` é o desenvolvimento.
        return { ...base, conteudo: { headline: c.destaque, corpo: c.texto } }

      case "cenario":
        // A pergunta sobe para o topo e a narrativa desce para o rodapé: o meio
        // da tela é a tabelinha, que é o que o componente foi feito para mostrar.
        return {
          ...base,
          conteudo: {
            headline: c.pergunta,
            personagem: c.personagem,
            linhas: ed.linhas,
            rodape: c.texto,
          },
        }

      case "quiz":
        return {
          ...base,
          conteudo: {
            headline: c.enunciado,
            opcoes: (c.alternativas as Bruto[]).map((a) => ({
              letra: String(a.id).toUpperCase(),
              texto: a.texto,
              correta: !!a.correta,
              feedback: a.feedback,
            })),
          },
        }

      case "input": {
        const campo: Bruto = {
          id: "valor", // o que `formula: "valor_direto"` lê da sessão
          emoji: ed.input.emoji,
          label: ed.input.label,
          tipo: ed.input.tipo,
        }
        // Faixa não usa placeholder — o contrato é explícito sobre isso.
        if (ed.input.tipo !== "faixa" && c.placeholder) campo.placeholder = c.placeholder
        if (ed.input.tipo === "faixa") {
          if (!ed.input.opcoes?.length) erros.push(`${m.slug}: faixa sem opcoes`)
          campo.opcoes = ed.input.opcoes
        }
        return {
          ...base,
          conteudo: { headline: c.pergunta, subtitulo: c.ajuda, campos: [campo] },
        }
      }

      case "resultado": {
        const regras = (c.regras ?? []) as Bruto[]
        const conteudo: Bruto = {
          headline: ed.resultado.headline,
          formula: "valor_direto",
        }

        if (!ed.resultado.semFaixas) {
          if (ed.resultado.condicoes.length !== regras.length) {
            erros.push(
              `${m.slug}: ${regras.length} regra(s) na fonte e ${ed.resultado.condicoes.length} condição(ões) no editorial`
            )
          }
          if (ed.resultado.cores.length !== regras.length) {
            erros.push(`${m.slug}: cores não batem com as regras`)
          }
          conteudo.faixas = regras.map((r, i) => ({
            condicao: ed.resultado.condicoes[i] ?? "resto",
            mensagem: r.entao,
            cor: ed.resultado.cores[i] ?? "green",
          }))
        }

        // A prosa geral e o próximo passo viram o bloco de insight — é o único
        // lugar do contrato que aceita texto corrido na tela de resultado.
        const prosa = String(c.texto ?? "").replace(/\{valor\}/g, chaveEco)
        conteudo.insightDinamico = c.proximoPasso
          ? `${prosa}\n\nPróximo passo: ${c.proximoPasso}`
          : prosa

        return { ...base, conteudo }
      }

      default:
        erros.push(`${m.slug}: tipo de tela desconhecido "${t.tipo}"`)
        return { ...base, conteudo: c }
    }
  })

  modulos.push({
    slug: m.slug,
    titulo: m.titulo,
    subtitulo: m.subtitulo,
    // Os quatro perfis são vocabulário da trilha adulta. "em" é um valor que
    // nenhum Perfil de usuário tem, então o desempate por perfil em
    // `aulasParaSituacao` nunca dispara à toa para estas aulas.
    tipoPerfil: "em",
    publico: "em",
    ordem: m.ordem,
    nivel: m.nivel,
    situacoes: m.situacoes,
    tags: m.tags,
    duracaoMin: m.duracaoMin ?? 2,
    xp: 50,
    habilidades: m.habilidades,
    telas,
  })
}

// --- conferências que valem antes de gravar arquivo -------------------------

const habilidades = modulos.flatMap((m) => m.habilidades as string[])
const unicas = new Set(habilidades)
if (unicas.size !== 47 || habilidades.length !== 47) {
  erros.push(`cobertura da matriz: ${unicas.size} únicas em ${habilidades.length} atribuições (esperado 47/47)`)
}

for (const m of modulos) {
  for (const t of m.telas as Bruto[]) {
    const c = t.conteudo as Bruto
    const foraDoHeadline = [
      c.corpo, c.rodape, c.subtitulo, c.insightDinamico,
      ...((c.faixas as Bruto[] | undefined) ?? []).map((f) => f.mensagem),
      ...((c.opcoes as Bruto[] | undefined) ?? []).map((o) => o.feedback),
    ].filter((x): x is string => typeof x === "string")
    if (foraDoHeadline.some((x) => /<\w+>/.test(x))) {
      erros.push(`${m.slug} tela ${t.ordem}: HTML fora do headline vira texto literal`)
    }
  }
  const quiz = (m.telas as Bruto[]).find((t) => t.tipo === "quiz")
  if (quiz && !(quiz.conteudo.opcoes as Bruto[]).some((o) => o.correta)) {
    erros.push(`${m.slug}: quiz sem alternativa correta`)
  }
}

if (erros.length) {
  console.log("Não gravei. Problemas encontrados:\n")
  for (const e of erros) console.log(`  ✗ ${e}`)
  process.exit(1)
}

const cabecalho = `import type { Nivel, Situacao } from "@/lib/situacoes"

/**
 * ARQUIVO GERADO — não edite à mão.
 *
 * Sai de \`scripts/portar-em.mts\`, que lê a fonte (\`prisma/trilha-em-fonte.ts\`)
 * e as decisões editoriais (\`prisma/editorial-em.ts\`). Mexeu num dos dois?
 * Rode o portador de novo:
 *
 *   node --import tsx scripts/portar-em.mts
 *
 * São ${modulos.length} módulos de Ensino Médio cobrindo as 47 habilidades da Matriz de
 * Competências de Letramento Financeiro (Banco Central / Aprender Valor, 2025).
 * Todos nascem com \`publico: "em"\` — não aparecem para quem usa o app adulto.
 * Quem semeia é \`scripts/semear-em.mts\`.
 */

export interface ModuloEM {
  slug: string
  titulo: string
  subtitulo: string
  tipoPerfil: string
  publico: string
  ordem: number
  nivel: Nivel
  situacoes: Situacao[]
  tags: string[]
  duracaoMin: number
  xp: number
  /** Habilidades da matriz do BC. Rastreabilidade — não é campo do schema. */
  habilidades: string[]
  telas: {
    ordem: number
    tipo: "conceito" | "cenario" | "quiz" | "input" | "resultado"
    label: string
    conteudo: unknown
  }[]
}

export const MODULOS_EM: ModuloEM[] = `

writeFileSync("prisma/modulos-em.ts", cabecalho + JSON.stringify(modulos, null, 2) + "\n", "utf8")

const telas = modulos.reduce((n, m) => n + (m.telas as unknown[]).length, 0)
console.log(`prisma/modulos-em.ts — ${modulos.length} módulos · ${telas} telas · ${unicas.size}/47 habilidades`)
