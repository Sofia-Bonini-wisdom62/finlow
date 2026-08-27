/**
 * Lê o curso escolar de `prisma/curso/` e devolve tudo já conferido.
 *
 * ⚠️ MÓDULO DE SCRIPT — usa `node:fs`. Não importe de componente nem de rota.
 * Quem serve o curso ao app lê o BANCO (`Conceito`/`LicaoCurso`/`ItemAvaliativo`),
 * não estes arquivos.
 *
 * POR QUE O VALIDADOR E O SEED COMPARTILHAM ISTO
 * São duas entradas para a mesma pergunta ("o curso está íntegro?"), e enquanto
 * cada uma tinha a sua cópia da resposta elas podiam divergir — o caso ruim é o
 * seed aceitando o que o validador reprova, porque aí o ✓ do CI não significa
 * nada sobre o que entrou no banco. Com a conferência num lugar só, `--aplicar`
 * grava exatamente o conjunto que o validador aprovou.
 *
 * As conferências que só existem AQUI, e não em `validarLicao`, são as que
 * exigem ver o curso inteiro: enunciado repetido entre os três encontros de um
 * conceito, e a integridade referencial entre conceitos, módulos e lições.
 */
import { readFileSync, readdirSync } from "node:fs"
import { validarLicao, type Licao } from "./validar"

/** Um conceito do currículo — a unidade que se repete em 3 encontros. */
export type ConceitoCurso = {
  slug: string
  nome: string
  segmento: string
  habilidades: string[]
  unidade: string
  frase: string | null
  preRequisitos: string[]
  encontros: number
  itensAlvo: number
}

/** Uma entrada do índice de currículo: qual lição, de qual conceito, em que ordem. */
export type ModuloCurso = {
  slug: string
  titulo: string
  segmento: string
  serie: string | null
  blocoId: string | null
  blocoRotulo: string | null
  nivel: string
  unidades: string[]
  conceitoPrincipal: string
  slugBase: string
  encontro: number
  tipoEncontro: string
  dificuldadeAlvo: number
  telasAlvo: number
  itensAlvo: number
  habilidades: string[]
  ordem: number
}

export type CursoCarregado = {
  conceitos: ConceitoCurso[]
  modulos: ModuloCurso[]
  licoes: Map<string, Licao>
  /** Bloqueiam o seed: conta errada, referência quebrada, contrato estourado. */
  erros: string[]
  /**
   * Aparecem, não bloqueiam.
   *
   * A distinção existe por um caso concreto: `quando-a-divida-vira-problema` é
   * a lição-piloto, escrita antes de `fraseConceito` existir, e é a única das
   * 321 sem o campo. Tratar isso como erro pararia o seed das outras 320 por
   * causa de uma frase de 140 caracteres — e tratar como nada faria a lacuna
   * sumir de vista. Fica visível a cada rodada até alguém escrever a frase.
   */
  avisos: string[]
}

const RAIZ_PADRAO = new URL("../../prisma/curso/", import.meta.url)

/**
 * Carrega e confere o curso inteiro. NÃO lança: devolve `erros` para quem
 * chamou decidir — o validador imprime e sai 1, o seed aborta antes de gravar.
 */
export function carregarCurso(raiz: URL = RAIZ_PADRAO): CursoCarregado {
  const ler = <T>(rel: string): T => JSON.parse(readFileSync(new URL(rel, raiz), "utf8")) as T

  const conceitos = ler<ConceitoCurso[]>("conceitos.json")
  const modulos = ler<ModuloCurso[]>("modulos.json")
  const erros: string[] = []
  const avisos: string[] = []

  const dirLicoes = new URL("licoes/", raiz)
  const arquivos = readdirSync(dirLicoes)
    .filter((f) => f.endsWith(".json"))
    .sort()

  const licoes = new Map<string, Licao>()
  for (const arquivo of arquivos) {
    let l: Licao
    try {
      l = JSON.parse(readFileSync(new URL(arquivo, dirLicoes), "utf8")) as Licao
    } catch (err) {
      erros.push(`licoes/${arquivo}: JSON inválido: ${(err as Error).message}`)
      continue
    }
    // O nome do arquivo é o que o seed usa para casar com o índice de
    // currículo. Divergir do slug de dentro faria a lição entrar sob a ordem
    // e o conceito de outra, sem erro nenhum.
    const esperado = arquivo.slice(0, -5)
    if (l.slug !== esperado) erros.push(`licoes/${arquivo}: slug interno é "${l.slug}"`)
    if (licoes.has(l.slug)) erros.push(`licoes/${arquivo}: slug duplicado "${l.slug}"`)
    erros.push(...validarLicao(l))
    licoes.set(l.slug, l)
  }

  const refs = conferirReferencias(conceitos, modulos, licoes)
  erros.push(...refs.erros)
  avisos.push(...refs.avisos)
  erros.push(...conferirEnunciadosRepetidos(modulos, licoes))

  return { conceitos, modulos, licoes, erros, avisos }
}

/**
 * Conceitos, módulos e lições precisam fechar nos dois sentidos.
 *
 * A CHAVE É `slugBase`, do índice de currículo — não `conceitoPrincipal` da
 * lição. Os dois quase sempre coincidem, mas 15 lições (5 conceitos × 3
 * encontros) seguem a lição-piloto e trazem em `conceitoPrincipal` um rótulo
 * semântico ("divida-que-cresce-sozinha") em vez do slug do módulo
 * ("quando-a-divida-vira-problema"). É a mesma natureza do `conceitoId` de cada
 * item, que tem 299 valores livres: rótulo editorial, não chave estrangeira.
 * `slugBase` é o campo que fecha 107/107 nos dois sentidos.
 */
function conferirReferencias(
  conceitos: ConceitoCurso[],
  modulos: ModuloCurso[],
  licoes: Map<string, Licao>
): { erros: string[]; avisos: string[] } {
  const erros: string[] = []
  const avisos: string[] = []
  const slugsConceito = new Set(conceitos.map((c) => c.slug))
  const usados = new Set<string>()

  for (const m of modulos) {
    if (!slugsConceito.has(m.slugBase))
      erros.push(`modulos.json: "${m.slug}" aponta para o conceito inexistente "${m.slugBase}"`)
    usados.add(m.slugBase)

    const l = licoes.get(m.slug)
    if (!l) {
      erros.push(`modulos.json: "${m.slug}" não tem arquivo em licoes/`)
      continue
    }
    if (l.segmento !== m.segmento)
      erros.push(`"${m.slug}": segmento ${l.segmento} na lição, ${m.segmento} no currículo`)
    if (l.telas.length !== m.telasAlvo)
      erros.push(`"${m.slug}": ${l.telas.length} telas, currículo pede ${m.telasAlvo}`)
    // A definição do conceito nasce no encontro 1 e não se repete: nos
    // encontros 2 e 3 a pessoa precisa RESGATAR o critério, não relê-lo.
    if (m.encontro === 1 && !l.fraseConceito)
      avisos.push(`"${m.slug}": encontro 1 sem fraseConceito, o conceito entra sem definição`)
    if (m.encontro !== 1 && l.fraseConceito)
      erros.push(`"${m.slug}": fraseConceito só no encontro 1`)
  }

  for (const c of conceitos)
    if (!usados.has(c.slug)) erros.push(`conceitos.json: "${c.slug}" não tem nenhuma lição`)

  const noIndice = new Set(modulos.map((m) => m.slug))
  for (const slug of licoes.keys())
    if (!noIndice.has(slug)) erros.push(`licoes/${slug}.json: não está em modulos.json`)

  return { erros, avisos }
}

/**
 * Nenhum enunciado pode se repetir entre os três encontros de um conceito.
 *
 * É a regra que separa "três encontros" de "o mesmo exercício três vezes". O
 * encontro 2 acontece dias depois e precisa cobrar o critério em contexto novo;
 * se o enunciado voltar igual, mede-se memória da resposta. A comparação é por
 * texto normalizado, e cobre também os itens de reserva.
 */
function conferirEnunciadosRepetidos(modulos: ModuloCurso[], licoes: Map<string, Licao>): string[] {
  const erros: string[] = []
  const porConceito = new Map<string, ModuloCurso[]>()
  for (const m of modulos) {
    const grupo = porConceito.get(m.slugBase) ?? []
    grupo.push(m)
    porConceito.set(m.slugBase, grupo)
  }

  for (const grupo of porConceito.values()) {
    const vistos = new Map<string, string>()
    for (const m of [...grupo].sort((a, b) => a.encontro - b.encontro)) {
      const l = licoes.get(m.slug)
      if (!l) continue
      for (const item of [...l.telas, ...l.reserva]) {
        const txt = (item.enunciado ?? item.pergunta ?? "").trim().toLowerCase()
        if (!txt) continue
        const antes = vistos.get(txt)
        if (antes && antes !== m.slug)
          erros.push(`"${m.slug}": repete enunciado de "${antes}": "${txt.slice(0, 60)}"`)
        else vistos.set(txt, m.slug)
      }
    }
  }

  return erros
}
