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
  pct: number            // % do que entrou que foi gasto
  valor: number          // valor cru do campo "valor" da sessão (impulsivo)
  pctGuardador: number   // % do dinheiro usado consigo (guardador)
  porMesNum: number      // valor mensal p/ meta (sonhador), cru p/ faixas
}

export function calcular(formula: string | undefined, sessao: SessaoFluxo): Derivados {
  const entrou = num(sessao.entrou)
  const saiu = num(sessao.saiu)
  const base: Derivados = {
    entrou,
    saiu,
    sobrou: entrou - saiu,
    pct: entrou > 0 ? Math.round((saiu / entrou) * 100) : 0,
    valor: 0,
    pctGuardador: 0,
    porMesNum: 0,
  }

  switch (formula) {
    case "guardador_ratio": {
      const guardou = num(sessao.guardou)
      const gastou = num(sessao.gastou)
      const total = guardou + gastou
      return { ...base, pctGuardador: total > 0 ? Math.round((gastou / total) * 100) : 0 }
    }
    case "impulsivo_gatilho": {
      return { ...base, valor: num(sessao.valor) }
    }
    case "sonhador_por_mes": {
      const custo = num(sessao.custo)
      const meses = Math.max(1, num(sessao.meses))
      return { ...base, porMesNum: Math.round(custo / meses) }
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
        return String(d[chave as "pct" | "pctGuardador"])
      case "porMes":
        return "R$ " + d.porMesNum // inteiro, sem centavos
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

export function formatBRL(v: number): string {
  return v.toFixed(2).replace(".", ",")
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
