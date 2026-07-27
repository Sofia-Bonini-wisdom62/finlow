import { db } from "@/lib/db"

/**
 * O modelo devolve categoria como slug ("alimentacao"); o banco guarda
 * Categoria por usuário, com nome de exibição. Este mapa liga os dois e cria
 * o que faltar — sem isso, todo lançamento de extrato entraria sem categoria
 * e os gráficos de "onde o dinheiro foi" ficariam vazios.
 */

const NOMES: Record<string, { nome: string; tipo: "receita" | "despesa"; cor: string }> = {
  alimentacao:   { nome: "Alimentação",   tipo: "despesa", cor: "#B8863C" },
  delivery:      { nome: "Delivery",      tipo: "despesa", cor: "#C79A5B" },
  transporte:    { nome: "Transporte",    tipo: "despesa", cor: "#7BAEB0" },
  moradia:       { nome: "Moradia",       tipo: "despesa", cor: "#2B6D70" },
  assinaturas:   { nome: "Assinaturas",   tipo: "despesa", cor: "#A7CBCC" },
  compras:       { nome: "Compras",       tipo: "despesa", cor: "#3E6E93" },
  saude:         { nome: "Saúde",         tipo: "despesa", cor: "#AA4B3E" },
  lazer:         { nome: "Lazer",         tipo: "despesa", cor: "#6C9BC0" },
  educacao:      { nome: "Educação",      tipo: "despesa", cor: "#4A7F63" },
  transferencia: { nome: "Transferências", tipo: "despesa", cor: "#9AA0A3" },
  renda:         { nome: "Renda",         tipo: "receita", cor: "#4A7F63" },
  taxas_juros:   { nome: "Taxas e juros", tipo: "despesa", cor: "#8C651F" },
  outros:        { nome: "Outros",        tipo: "despesa", cor: "#9AA0A3" },
}

/**
 * Resolve todos os slugs de uma vez e devolve slug → categoriaId.
 * Faz uma leitura só e cria em lote o que faltar, em vez de uma query por linha
 * do extrato (que num extrato de 3 meses seriam centenas).
 */
export async function mapearCategorias(
  userId: string,
  slugs: string[]
): Promise<Map<string, string>> {
  const unicos = [...new Set(slugs)].filter((s) => NOMES[s])
  const mapa = new Map<string, string>()
  if (unicos.length === 0) return mapa

  const existentes = await db.categoria.findMany({ where: { userId } })
  const porNome = new Map(existentes.map((c) => [c.nome.toLowerCase(), c.id]))

  const criar: { userId: string; nome: string; tipo: string; cor: string; padrao: boolean }[] = []
  for (const slug of unicos) {
    const alvo = NOMES[slug]
    const achado = porNome.get(alvo.nome.toLowerCase())
    if (achado) mapa.set(slug, achado)
    else criar.push({ userId, nome: alvo.nome, tipo: alvo.tipo, cor: alvo.cor, padrao: true })
  }

  if (criar.length) {
    await db.categoria.createMany({ data: criar, skipDuplicates: true })
    const novas = await db.categoria.findMany({
      where: { userId, nome: { in: criar.map((c) => c.nome) } },
    })
    for (const slug of unicos) {
      if (mapa.has(slug)) continue
      const nova = novas.find((n) => n.nome.toLowerCase() === NOMES[slug].nome.toLowerCase())
      if (nova) mapa.set(slug, nova.id)
    }
  }

  return mapa
}

export function nomeDaCategoria(slug: string): string {
  return NOMES[slug]?.nome ?? "Outros"
}
