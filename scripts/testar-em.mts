/**
 * A trilha de Ensino Médio, conferida contra o contrato que os componentes leem.
 *
 * POR QUE ESTE TESTE EXISTE
 * A entrega original gravava num contrato próprio — `texto`/`destaque`,
 * `enunciado`/`alternativas`, `campo`, `regras`. Nada disso dá erro no banco:
 * `Tela.conteudo` é Json e aceita qualquer forma. O estrago só aparecia na tela
 * de alguém, e em três dos cinco tipos aparecia como crash (`.map` num array
 * que não existe).
 *
 * Então o teste afirma as duas coisas que o banco não afirma:
 *   1. cada tipo de tela tem os campos que o SEU componente lê;
 *   2. a tela de resultado DISCRIMINA — valores diferentes caem em faixas
 *      diferentes. Este é o ponto que mais silenciosamente falhava: sem
 *      `formula`, `valor` fica 0 fixo e todo mundo recebe a mesma mensagem
 *      final, sem erro nenhum.
 *
 *   node --import tsx scripts/testar-em.mts
 */
import { MODULOS_EM } from "../prisma/modulos-em.js"
import { calcular, avaliarFaixa, interpolar } from "../lib/resultado.js"

type Bruto = Record<string, any>

let falhas = 0
const falhar = (slug: string, msg: string) => {
  console.log(`  ✗ ${slug}: ${msg}`)
  falhas++
}

/**
 * Valores de sonda: cobrem o intervalo em que as faixas dos módulos operam.
 *
 * A lista precisa alcançar TODA faixa de todo módulo — uma faixa que nenhuma
 * sonda atinge é uma mensagem que ninguém nunca lê, e o teste avisa quando
 * isso acontece. O negativo existe por causa do módulo de orçamento, onde
 * fechar o mês no vermelho é justamente a faixa que importa.
 */
const SONDAS = [
  "-200", "0", "1", "2", "3", "8", "25", "45", "60", "80",
  "150", "350", "400", "450", "700", "1500", "3500",
]

for (const m of MODULOS_EM) {
  const tipos = m.telas.map((t) => t.tipo)
  if (m.telas.length !== 5) falhar(m.slug, `${m.telas.length} telas (esperado 5)`)
  for (const esperado of ["conceito", "cenario", "quiz", "input", "resultado"]) {
    if (!tipos.includes(esperado as never)) falhar(m.slug, `sem tela de ${esperado}`)
  }
  if (m.publico !== "em") falhar(m.slug, `publico = "${m.publico}"`)

  for (const t of m.telas) {
    const c = t.conteudo as Bruto

    // --- os campos que cada componente realmente lê ---
    if (t.tipo === "conceito" && (!c.headline || !c.corpo)) {
      falhar(m.slug, `conceito sem headline/corpo`)
    }
    if (t.tipo === "cenario") {
      if (!c.headline) falhar(m.slug, "cenario sem headline")
      // TelaCenario faz conteudo.linhas.map sem optional chaining: undefined = crash.
      if (!Array.isArray(c.linhas)) falhar(m.slug, "cenario sem linhas[] — o player estoura")
      for (const l of c.linhas ?? []) {
        if (!["entrada", "saida", "saldo"].includes(l.tipo)) {
          falhar(m.slug, `linha de cenário com tipo "${l.tipo}"`)
        }
      }
    }
    if (t.tipo === "quiz") {
      if (!Array.isArray(c.opcoes)) falhar(m.slug, "quiz sem opcoes[] — o embaralhamento estoura")
      const corretas = (c.opcoes ?? []).filter((o: Bruto) => o.correta)
      if (corretas.length !== 1) falhar(m.slug, `quiz com ${corretas.length} alternativas corretas`)
      for (const o of c.opcoes ?? []) {
        if (!o.letra) falhar(m.slug, "opção de quiz sem letra — a seleção compara por letra")
        if (!o.feedback) falhar(m.slug, `opção ${o.letra} sem feedback`)
      }
    }
    if (t.tipo === "input") {
      if (!Array.isArray(c.campos) || c.campos.length === 0) {
        falhar(m.slug, "input sem campos[] — o player estoura")
      }
      for (const campo of c.campos ?? []) {
        if (campo.id !== "valor") falhar(m.slug, `campo id="${campo.id}" (a fórmula lê sessao.valor)`)
        if (!["decimal", "texto", "faixa"].includes(campo.tipo)) {
          falhar(m.slug, `campo com tipo "${campo.tipo}"`)
        }
        if (campo.tipo === "faixa" && !campo.opcoes?.length) {
          falhar(m.slug, "campo faixa sem opcoes — a pessoa não teria o que escolher")
        }
      }
    }
    if (t.tipo === "resultado") {
      if (!c.headline) falhar(m.slug, "resultado sem headline")
      // Uma chave que não existe some do texto sem avisar.
      const chaves = [...String(c.headline).matchAll(/\{(\w+)\}/g)].map((x) => x[1])
      for (const k of chaves) {
        if (!["valor", "valorCru"].includes(k)) {
          falhar(m.slug, `headline usa {${k}}, que esta trilha não preenche`)
        }
      }
    }
  }

  // --- a prova: valores diferentes produzem faixas diferentes ---
  const res = m.telas.find((t) => t.tipo === "resultado")!.conteudo as Bruto
  const inputTipo = ((m.telas.find((t) => t.tipo === "input")!.conteudo as Bruto).campos[0] as Bruto).tipo

  if (res.faixas) {
    const sondas =
      inputTipo === "faixa"
        ? ((m.telas.find((t) => t.tipo === "input")!.conteudo as Bruto).campos[0].opcoes as Bruto[]).map(
            (o) => o.valor
          )
        : SONDAS

    const atingidas = new Set<string>()
    for (const s of sondas) {
      const d = calcular(res.formula, { valor: s })
      const faixa = avaliarFaixa(res.faixas, d)
      if (faixa) atingidas.add(faixa.condicao)
    }
    if (atingidas.size < 2) {
      falhar(
        m.slug,
        `todas as sondas caem na mesma faixa (${[...atingidas][0] ?? "nenhuma"}) — o resultado não discrimina`
      )
    }
    if (atingidas.size < res.faixas.length) {
      const mortas = (res.faixas as Bruto[])
        .map((f) => f.condicao)
        .filter((cd) => !atingidas.has(cd))
      console.log(`  ·  ${m.slug}: faixa(s) que nenhuma sonda alcançou: ${mortas.join(" | ")}`)
    }
    for (const f of res.faixas as Bruto[]) {
      if (!["green", "yellow", "red"].includes(f.cor)) falhar(m.slug, `cor "${f.cor}"`)
    }
  }

  // Interpolação não pode deixar buraco no texto.
  const d = calcular(res.formula, { valor: "42" })
  const texto = interpolar(String(res.headline), d, { valor: "42" })
  if (/\{\w+\}/.test(texto)) falhar(m.slug, `headline com chave não resolvida: ${texto}`)
  if (texto.includes("undefined")) falhar(m.slug, "headline interpolou undefined")
}

const telas = MODULOS_EM.reduce((n, m) => n + m.telas.length, 0)
const habilidades = new Set(MODULOS_EM.flatMap((m) => m.habilidades))
// "declaradas", não "cobertas": isto conta o que os módulos DIZEM cobrir, sem
// abrir a matriz. O 47 era literal cravado aqui, o que fazia a linha parecer
// uma verificação de cobertura sendo que os dois lados vinham do mesmo lugar.
// Quem confronta com a matriz do BC é scripts/testar-matriz.mts.
console.log(`\n${MODULOS_EM.length} módulos · ${telas} telas · ${habilidades.size} habilidades declaradas · ${falhas} falha(s)`)
console.log(`(cobertura real: node --import tsx scripts/testar-matriz.mts)`)
process.exit(falhas === 0 ? 0 : 1)
