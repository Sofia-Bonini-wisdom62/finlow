// Formatação BR pra valores do Painel
export function brl(v: number | string): string {
  const n = typeof v === "string" ? parseFloat(v) : v
  if (!isFinite(n)) return "R$ 0,00"
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function dataCurta(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}
