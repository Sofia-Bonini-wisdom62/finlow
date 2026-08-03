import type { SessaoFluxo, FaixaResultado } from "@/types/trilha"

// "120,50" | "120.50" | "120" -> número; vazio/inválido -> 0
function num(v: string | undefined): number {
  if (!v) return 0
  const limpo = v.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3})/g, "").replace(",", ".")
  const n = parseFloat(limpo)
  return isNaN(n) ? 0 : n
}

export interface Derivados {
  entrou: number
  saiu: number
  sobrou: number
  pct: number
  valor: number          // campo genérico (impulsivo M1/M4, sonhador M2)
  pctGuardador: number
  porMesNum: number
  respiroNum: number     // lançador M2
  periodosNum: number    // lançador M3 — períodos (meses) até a meta
  acimaLimite: number    // lançador M4 (0/1)
  livreNum: number       // guardador M2
  rendeNum: number       // guardador M3
  mesesJuntar: number    // guardador M4
  cobre: number          // impulsivo M2 (0/1)
  pctMeta: number        // sonhador M3
  semTetoNum: number     // M01 — o que a taxa diz
  comTetoNum: number     // M01 — o que a lei permite
  subestimou: number     // M01 (0/1)
}

const ZERO: Omit<Derivados, "entrou" | "saiu" | "sobrou" | "pct"> = {
  valor: 0, pctGuardador: 0, porMesNum: 0, respiroNum: 0, periodosNum: 0,
  acimaLimite: 0, livreNum: 0, rendeNum: 0, mesesJuntar: 0, cobre: 0, pctMeta: 0,
  semTetoNum: 0, comTetoNum: 0, subestimou: 0,
}

export function calcular(formula: string | undefined, sessao: SessaoFluxo): Derivados {
  const entrou = num(sessao.entrou)
  const saiu = num(sessao.saiu)
  const base: Derivados = {
    entrou, saiu,
    sobrou: entrou - saiu,
    pct: entrou > 0 ? Math.round((saiu / entrou) * 100) : 0,
    ...ZERO,
  }

  switch (formula) {
    // ---- módulos 1 ----
    case "guardador_ratio": {
      const guardou = num(sessao.guardou), gastou = num(sessao.gastou)
      const total = guardou + gastou
      return { ...base, pctGuardador: total > 0 ? Math.round((gastou / total) * 100) : 0 }
    }
    case "impulsivo_gatilho":
      return { ...base, valor: num(sessao.valor) }
    case "sonhador_por_mes": {
      const custo = num(sessao.custo), meses = Math.max(1, num(sessao.meses))
      return { ...base, porMesNum: Math.round(custo / meses) }
    }

    // ---- módulos 2–4 ----
    case "respiro_valor": {
      const pctRespiro = num(sessao.pctRespiro)
      return { ...base, respiroNum: Math.round(entrou * pctRespiro / 100), valor: pctRespiro }
    }
    case "semanas_meta": {
      const custo = num(sessao.custo), respiro = Math.max(1, num(sessao.respiro))
      return { ...base, periodosNum: Math.ceil(custo / respiro) }
    }
    case "freio_limite": {
      const gastoRecente = num(sessao.gastoRecente), valorLimite = num(sessao.valorLimite)
      return { ...base, acimaLimite: gastoRecente > valorLimite ? 1 : 0, valor: gastoRecente }
    }
    case "valor_livre": {
      const pctLivre = num(sessao.pctLivre)
      return { ...base, livreNum: Math.round(entrou * pctLivre / 100), valor: pctLivre }
    }
    case "render_simples": {
      // estimativa ilustrativa: ~0,8% ao mês (renda fixa conservadora). NÃO é recomendação.
      const guardado = num(sessao.guardado), meses = Math.max(1, num(sessao.meses))
      return { ...base, rendeNum: Math.round(guardado * 0.008 * meses) }
    }
    case "prazer_planejado": {
      const custoExp = num(sessao.custoExp), livre = Math.max(1, num(sessao.livre))
      return { ...base, mesesJuntar: Math.ceil(custoExp / livre) }
    }
    case "pausa_limiar": {
      const gastoTipico = num(sessao.gastoTipico), limiar = num(sessao.limiar)
      return { ...base, cobre: gastoTipico > limiar ? 1 : 0 }
    }
    case "passo_minimo":
      return { ...base, valor: num(sessao.quanto) }
    case "realidade_meta": {
      const valorMes = num(sessao.valorMes)
      return { ...base, pctMeta: entrou > 0 ? Math.round((valorMes / entrou) * 100) : 100 }
    }

    /**
     * M01 — o rotativo do cartão.
     *
     * A pessoa chuta no que R$ 1.000 se transformam em 12 meses. Duas verdades
     * saem daqui, e as duas precisam aparecer:
     *
     *  - a TAXA diz R$ 5.283, porque 428,3% ao ano multiplica a dívida por
     *    5,283 em doze meses;
     *  - a LEI diz R$ 2.000, porque desde 03/01/2024 os encargos não podem
     *    passar de 100% da dívida original (Lei 14.690/2023).
     *
     * Mostrar só a taxa assusta e mente por exagero; mostrar só o teto acalma
     * e esconde o absurdo do juro. O módulo mostra os dois: é isso que separa
     * "o cartão é caro" de saber por que e até onde.
     *
     * A taxa vem da sessão (`ind_rotativo_medio`), não do código: quando o
     * Banco Central publicar outra, é UPDATE numa linha.
     */
    case "rotativo_bola_de_neve": {
      const divida = 1000
      const taxaAno = num(sessao.ind_rotativo_medio) || 428.3
      const tetoPct = num(sessao.ind_teto_rotativo) || 100
      const semTeto = Math.round(divida * (1 + taxaAno / 100))
      const comTeto = Math.round(divida * (1 + tetoPct / 100))
      const chute = num(sessao.chute)
      return {
        ...base,
        valor: chute,
        semTetoNum: semTeto,
        comTetoNum: comTeto,
        // Quem chuta abaixo do teto legal subestimou até o piso protegido.
        subestimou: chute < comTeto ? 1 : 0,
      }
    }

    case "entrou_saiu_pct":
    default:
      return base
  }
}

// Interpola {chave}. Chaves numéricas de Derivados formatam conforme o tipo;
// qualquer outra chave cai na sessão como texto cru.
export function interpolar(texto: string, d: Derivados, sessao: SessaoFluxo): string {
  return texto.replace(/\{(\w+)\}/g, (_, chave) => {
    switch (chave) {
      case "pct":
      case "pctGuardador":
      case "pctMeta":
        return String(d[chave as "pct" | "pctGuardador" | "pctMeta"])
      case "porMes":
        return "R$ " + formatInteiroBRL(d.porMesNum)
      case "respiro":
        return "R$ " + formatInteiroBRL(d.respiroNum)
      case "livre":
        return "R$ " + formatInteiroBRL(d.livreNum)
      case "rende":
        return "R$ " + formatInteiroBRL(d.rendeNum)
      case "periodos":
        return String(d.periodosNum)
      case "mesesJuntar":
        return String(d.mesesJuntar)
      case "semTeto":
        return "R$ " + formatInteiroBRL(d.semTetoNum)
      case "comTeto":
        return "R$ " + formatInteiroBRL(d.comTetoNum)
      case "entrou":
      case "saiu":
      case "sobrou":
      case "valor":
        return formatBRL(d[chave as "entrou" | "saiu" | "sobrou" | "valor"])
      default:
        return sessao[chave] ?? ""
    }
  })
}

// Com valores de adulto (milhares), separador de milhar deixou de ser opcional:
// "3800,00" lê errado, "3.800,00" lê certo.
export function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Valores inteiros interpolados no texto ({respiro}, {livre}, {rende}, {porMes})
export function formatInteiroBRL(v: number): string {
  return v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })
}

// Condições: "<campo> <op> <numero>[pct]" — ex: "sobrou > 30pct", "valor > 100", "pctGuardador < 5"
// "Npct" = N% do que entrou. Campos são sempre de Derivados. Sem eval, sem exceções.
export function avaliarFaixa(faixas: FaixaResultado[], d: Derivados): FaixaResultado | undefined {
  for (const f of faixas) {
    if (testarCondicao(f.condicao, d)) return f
  }
  return faixas[faixas.length - 1]
}

function testarCondicao(cond: string, d: Derivados): boolean {
  const m = cond.match(/^(\w+)\s*(>=|<=|>|<|==)\s*(-?\d+)(pct)?$/)
  if (!m) return false
  const [, campo, op, numStr, isPct] = m
  const esquerda = (d as unknown as Record<string, number>)[campo]
  if (typeof esquerda !== "number") return false
  let direita = parseFloat(numStr)
  if (isPct) direita = d.entrou * (direita / 100)
  switch (op) {
    case ">": return esquerda > direita
    case "<": return esquerda < direita
    case ">=": return esquerda >= direita
    case "<=": return esquerda <= direita
    case "==": return esquerda === direita
    default: return false
  }
}
