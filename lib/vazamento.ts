/**
 * Motor do Diagnóstico de Vazamento.
 *
 * PURO de propósito: entra uma lista de lançamentos em claro, sai a lista de
 * achados. Nada de banco, nada de cifra, nada de IA — assim a bateria de teste
 * fabrica cenários e afirma resultados sem tocar em produção, e a rota fica
 * sendo só costura.
 *
 * A regra de ouro é NÃO CONTAR DUAS VEZES: cada lançamento pertence a no
 * máximo um achado. Os detectores rodam em ordem de certeza (encargo é
 * vazamento na certa; assinatura é candidato) e cada um retira do pool o que
 * reivindicou. A categoria fora da curva roda por último, só sobre o que
 * ninguém levou — senão o número grande da página vira soma de sobreposição,
 * e um número que não fecha é pior que número nenhum.
 */

import { chaveDia, chaveMes } from "@/lib/dia"

export interface LancamentoDiagnostico {
  id: string
  descricao: string
  valor: number
  tipo: string // "receita" | "despesa"
  data: Date
  categoria?: string | null
}

export type TipoAchado = "encargo" | "duplicada" | "assinatura" | "categoria_inflada"

export interface Achado {
  tipo: TipoAchado
  titulo: string
  detalhe: string
  valorMensal: number
  valorAnual: number
}

export interface ResultadoVazamento {
  achados: Achado[]
  totalMensal: number
  totalAnual: number
  mesesAnalisados: number
}

/** Janela do diagnóstico: os N meses mais recentes com movimento. */
const MESES_JANELA = 6

/** Recorrência acima disso não é assinatura, é aluguel/parcela — fica de fora. */
const TETO_ASSINATURA = 400

/** Excesso de categoria menor que isso não vale um achado. */
const PISO_EXCESSO = 50

// Mês e dia saem de `lib/dia.ts`: a janela do diagnóstico tem de ser o mesmo
// mês que as Análises somam, senão "seu vazamento em julho" é sobre outro julho.

/** "NETFLIX.COM  01/12" e "Netflix com" precisam cair na mesma chave. */
function normalizar(descricao: string): string {
  return descricao
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function mediana(nums: number[]): number {
  const s = [...nums].sort((a, b) => a - b)
  const meio = Math.floor(s.length / 2)
  return s.length % 2 ? s[meio]! : (s[meio - 1]! + s[meio]!) / 2
}

const arred = (n: number) => Math.round(n * 100) / 100

// Encargos por nome: o que o banco cobra por atraso, crédito e manutenção.
// "taxa" sozinha ficou de fora — pega "taxa de embarque" e vira falso positivo.
const RE_JUROS = /(^|\s)(juros|iof|multa|mora|rotativo|encargo|encargos)(\s|$)/
const RE_TARIFA = /(^|\s)(tarifa|tarifas|anuidade|manutencao de conta)(\s|$)/

/**
 * Roda o diagnóstico. `agora` existe para a bateria congelar o relógio.
 */
export function diagnosticar(lancamentos: LancamentoDiagnostico[], agora: Date = new Date()): ResultadoVazamento {
  // Só despesas, só da janela. Receita não vaza.
  const mesesComMovimento = [...new Set(
    lancamentos.filter((l) => l.tipo === "despesa" && l.data <= agora).map((l) => chaveMes(l.data))
  )].sort().slice(-MESES_JANELA)
  const janela = new Set(mesesComMovimento)

  let pool = lancamentos.filter(
    (l) => l.tipo === "despesa" && l.data <= agora && janela.has(chaveMes(l.data)) && l.valor > 0
  )
  const meses = mesesComMovimento.length
  if (meses === 0) return { achados: [], totalMensal: 0, totalAnual: 0, mesesAnalisados: 0 }

  const achados: Achado[] = []
  const reivindicar = (ids: Set<string>) => { pool = pool.filter((l) => !ids.has(l.id)) }

  // ------------------------------------------------ 1. juros e tarifas ---
  // O texto e a categoria contam juntos: extrato escreve "IOF", categoria
  // manual escreve "Tarifas". Vazamento na certa — ninguém escolhe pagar juros.
  for (const [re, titulo, detalheBase] of [
    [RE_JUROS, "Juros e multas", "dinheiro que só paga atraso e rotativo"],
    [RE_TARIFA, "Tarifas e anuidades", "custo de manter conta e cartão, quase sempre negociável"],
  ] as const) {
    const grupo = pool.filter((l) => re.test(normalizar(`${l.descricao} ${l.categoria ?? ""}`)))
    if (grupo.length === 0) continue
    const total = grupo.reduce((a, l) => a + l.valor, 0)
    const porMes = total / meses
    achados.push({
      tipo: "encargo",
      titulo,
      detalhe: `R$ ${total.toFixed(2)} em ${meses} ${meses === 1 ? "mês" : "meses"}: ${detalheBase}.`,
      valorMensal: arred(porMes),
      valorAnual: arred(porMes * 12),
    })
    reivindicar(new Set(grupo.map((l) => l.id)))
  }

  // -------------------------------------------- 2. cobranças em dobro ---
  // Mesmo estabelecimento, mesmo valor, mesmo dia, mais de uma vez: a segunda
  // cobrança é a que vaza. Falso positivo existe (dois cafés iguais no mesmo
  // dia), por isso o detalhe nomeia o exemplo — a pessoa é quem sabe.
  const porDia = new Map<string, LancamentoDiagnostico[]>()
  for (const l of pool) {
    const chave = `${normalizar(l.descricao)}|${l.valor.toFixed(2)}|${chaveDia(l.data)}`
    porDia.set(chave, [...(porDia.get(chave) ?? []), l])
  }
  const extras: LancamentoDiagnostico[] = []
  for (const grupo of porDia.values()) {
    if (grupo.length > 1) extras.push(...grupo.slice(1))
  }
  if (extras.length > 0) {
    const total = extras.reduce((a, l) => a + l.valor, 0)
    const maior = extras.reduce((a, b) => (b.valor > a.valor ? b : a))
    const porMes = total / meses
    achados.push({
      tipo: "duplicada",
      titulo: "Cobranças em dobro",
      detalhe: `${extras.length} ${extras.length === 1 ? "cobrança repetida" : "cobranças repetidas"} no mesmo dia, ex.: ${maior.descricao} (R$ ${maior.valor.toFixed(2)}). Vale conferir se as duas eram pra existir.`,
      valorMensal: arred(porMes),
      valorAnual: arred(porMes * 12),
    })
    reivindicar(new Set(extras.map((l) => l.id)))
  }

  // ------------------------------------------------------ 3. assinaturas ---
  // Mesmo estabelecimento, valor ~igual (±15% da mediana), em 2+ meses
  // SEGUIDOS. Assinatura não é desperdício por definição — o achado existe
  // para a pergunta "quais dessas você ainda usa?", e o teto de valor deixa
  // aluguel e parcela de fora.
  if (meses >= 2) {
    const porEstab = new Map<string, LancamentoDiagnostico[]>()
    for (const l of pool) {
      const chave = normalizar(l.descricao)
      if (!chave) continue
      porEstab.set(chave, [...(porEstab.get(chave) ?? []), l])
    }

    const assinaturas: { exemplar: LancamentoDiagnostico; valor: number; meses: number; ids: string[] }[] = []
    for (const grupo of porEstab.values()) {
      const mesesDoGrupo = [...new Set(grupo.map((l) => chaveMes(l.data)))].sort()
      if (mesesDoGrupo.length < 2) continue

      // consecutivos: algum par de meses vizinhos na janela
      const indices = mesesDoGrupo.map((m) => mesesComMovimento.indexOf(m))
      const temSeguidos = indices.some((v, i) => i > 0 && v - indices[i - 1]! === 1)
      if (!temSeguidos) continue

      const valores = grupo.map((l) => l.valor)
      const med = mediana(valores)
      if (med > TETO_ASSINATURA) continue
      if (!valores.every((v) => Math.abs(v - med) <= med * 0.15)) continue

      assinaturas.push({
        exemplar: grupo[grupo.length - 1]!,
        valor: med,
        meses: mesesDoGrupo.length,
        ids: grupo.map((l) => l.id),
      })
    }

    assinaturas.sort((a, b) => b.valor - a.valor)
    for (const a of assinaturas.slice(0, 8)) {
      achados.push({
        tipo: "assinatura",
        titulo: `Assinatura: ${a.exemplar.descricao}`,
        detalhe: `R$ ${a.valor.toFixed(2)} por mês, cobrada em ${a.meses} dos últimos ${meses} meses. Ainda usa?`,
        valorMensal: arred(a.valor),
        valorAnual: arred(a.valor * 12),
      })
      reivindicar(new Set(a.ids))
    }
  }

  // -------------------------------------- 4. categoria fora da curva ---
  // O último mês contra a mediana dos anteriores, só sobre o que nenhum
  // detector levou. Pede 3+ meses: com menos, "fora da curva" é chute.
  if (meses >= 3) {
    const ultimoMes = mesesComMovimento[mesesComMovimento.length - 1]!
    const porCategoria = new Map<string, Map<string, number>>()
    for (const l of pool) {
      const cat = l.categoria?.trim()
      if (!cat) continue
      const porMesCat = porCategoria.get(cat) ?? new Map<string, number>()
      const m = chaveMes(l.data)
      porMesCat.set(m, (porMesCat.get(m) ?? 0) + l.valor)
      porCategoria.set(cat, porMesCat)
    }

    const infladas: Achado[] = []
    for (const [cat, porMesCat] of porCategoria) {
      const doUltimo = porMesCat.get(ultimoMes)
      if (!doUltimo) continue
      const anteriores = mesesComMovimento.slice(0, -1).map((m) => porMesCat.get(m) ?? 0)
      const comMovimento = anteriores.filter((v) => v > 0)
      if (comMovimento.length < 2) continue
      const med = mediana(comMovimento)
      const excesso = doUltimo - med
      if (doUltimo < med * 2 || excesso < PISO_EXCESSO) continue
      infladas.push({
        tipo: "categoria_inflada",
        titulo: `${cat} fora da curva`,
        detalhe: `R$ ${doUltimo.toFixed(2)} no último mês, contra R$ ${med.toFixed(2)} de costume. Se esse ritmo ficar, é isto aqui por ano.`,
        valorMensal: arred(excesso),
        valorAnual: arred(excesso * 12),
      })
    }
    infladas.sort((a, b) => b.valorMensal - a.valorMensal)
    achados.push(...infladas.slice(0, 3))
  }

  const totalMensal = arred(achados.reduce((a, x) => a + x.valorMensal, 0))
  return { achados, totalMensal, totalAnual: arred(totalMensal * 12), mesesAnalisados: meses }
}
