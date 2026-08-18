import type { SessaoFluxo, FaixaResultado } from "@/types/trilha"
import { escaparHtml } from "./escapar-html"

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
  reserva3Num: number    // M03 — meta de 3 meses de custo fixo
  reserva6Num: number    // M03 — meta de 6 meses
  anoNum: number         // M04 — o mesmo gasto ao longo de 12 meses
  acimaDaMedia: number   // M02 (0/1) — a dívida está acima da média nacional
  comprometidoNum: number // M05 — quanto do mês que vem já foi
  descontoNum: number     // M06 — bruto menos líquido
  apostadoNum: number     // M07 — o total que sai da mão em 12 meses
  guardadoNum: number     // M07/M24 — o mesmo dinheiro do outro lado
  sobraNum: number        // M11 — o que sobra depois do essencial
  anualNum: number        // M13/M26 — o valor no ano, ou a taxa no ano
  cabe: number            // M13/M15/M18 (0/1)
  precoNum: number        // M14 — preço mínimo que não dá prejuízo
  pctA: number            // M16 — participação de quem ganha mais
  economiaNum: number     // M18 — o que a troca de dívida devolve por mês
  jurosPriceNum: number   // M19
  jurosSacNum: number     // M19
  perdaNum: number        // M07/M22 — o que se perde no ano
  anosNum: number         // M23 — anos para dobrar, pela regra do 72
  mesesRendaNum: number   // M27 — meses de renda guardados
}

const ZERO: Omit<Derivados, "entrou" | "saiu" | "sobrou" | "pct"> = {
  valor: 0, pctGuardador: 0, porMesNum: 0, respiroNum: 0, periodosNum: 0,
  acimaLimite: 0, livreNum: 0, rendeNum: 0, mesesJuntar: 0, cobre: 0, pctMeta: 0,
  semTetoNum: 0, comTetoNum: 0, subestimou: 0,
  reserva3Num: 0, reserva6Num: 0, anoNum: 0, acimaDaMedia: 0,
  comprometidoNum: 0, descontoNum: 0, apostadoNum: 0, guardadoNum: 0,
  sobraNum: 0, anualNum: 0, cabe: 0, precoNum: 0, pctA: 0, economiaNum: 0,
  jurosPriceNum: 0, jurosSacNum: 0, perdaNum: 0, anosNum: 0, mesesRendaNum: 0,
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

    /**
     * M02 — a dívida negociada.
     *
     * NÃO calcula desconto. Seria fácil escrever "você consegue 50% off" e
     * seria invenção: desconto depende do credor, do tempo de atraso e da
     * campanha da semana. O que existe com fonte é o ticket médio de acordo
     * e a dívida média do país, e é só isso que a tela mostra — o suficiente
     * para a pessoa ver que a dívida dela cabe no que se costuma negociar.
     */
    case "divida_negociada": {
      const divida = num(sessao.divida)
      const media = num(sessao.ind_divida_media) || 6598.13
      return { ...base, valor: divida, acimaDaMedia: divida > media ? 1 : 0 }
    }

    /**
     * M03 — o tamanho do colchão.
     *
     * A meta é de 3 a 6 meses de CUSTO FIXO, não de renda. A diferença importa:
     * quem ganha 6 mil e gasta 3 mil precisa de um colchão de 9 a 18 mil, não
     * de 18 a 36. Calcular sobre a renda infla a meta e faz desistir na
     * primeira conta.
     */
    case "reserva_meta": {
      const custoFixo = num(sessao.custoFixo)
      return {
        ...base,
        valor: custoFixo,
        reserva3Num: Math.round(custoFixo * 3),
        reserva6Num: Math.round(custoFixo * 6),
      }
    }

    /** M04 — o mesmo boleto, doze vezes. */
    case "assinaturas_ano": {
      const porMes = num(sessao.assinaturas)
      return { ...base, valor: porMes, anoNum: Math.round(porMes * 12), porMesNum: Math.round(porMes) }
    }


    /** M05 — quanto do mês que vem já está gasto antes de ele começar. */
    case "parcelas_comprometem": {
      const parcelas = num(sessao.parcelas), renda = num(sessao.rendaMes)
      return {
        ...base,
        valor: parcelas,
        comprometidoNum: renda > 0 ? Math.round((parcelas / renda) * 100) : 0,
      }
    }

    /**
     * M06 — o que some entre o combinado e o que cai.
     *
     * NÃO reparte o desconto entre INSS e IRRF. As duas tabelas são
     * progressivas, mudam de ano em ano e dependem de dependentes e de outras
     * deduções: uma repartição estimada aqui pareceria precisa e estaria errada
     * para quase todo mundo. Mostra o TOTAL, que a pessoa confere no próprio
     * holerite, e explica cada linha por escrito.
     */
    case "holerite_descontos": {
      const bruto = num(sessao.bruto), liquido = num(sessao.liquido)
      const desconto = Math.max(0, bruto - liquido)
      return {
        ...base,
        valor: bruto,
        descontoNum: Math.round(desconto),
        pctMeta: bruto > 0 ? Math.round((desconto / bruto) * 100) : 0,
      }
    }

    /**
     * M07 — a aposta contra o mesmo dinheiro guardado.
     *
     * A perda não é projeção de probabilidade: é o gasto médio mensal do
     * apostador ativo brasileiro, medido pela Secretaria de Prêmios e Apostas.
     * Estimar "quanto você perderia" a partir de odds seria discutível; usar o
     * que os apostadores REAIS perderam, não.
     */
    case "bets_comparacao": {
      const porMes = 100, meses = 12
      const perdaMes = num(sessao.ind_gasto_medio_bets) || 164
      return {
        ...base,
        valor: num(sessao.chute),
        apostadoNum: porMes * meses,
        guardadoNum: Math.round(porMes * meses * 1.05),
        perdaNum: Math.round(perdaMes * meses),
      }
    }

    /** M11 — o esqueleto: essencial, guardar, torrar. */
    case "orcamento_esqueleto": {
      const renda = num(sessao.rendaMedia), fixo = num(sessao.gastoFixo)
      return {
        ...base,
        valor: renda,
        sobraNum: Math.round(renda - fixo),
        pctMeta: renda > 0 ? Math.round((fixo / renda) * 100) : 0,
      }
    }

    /** M13 — cabe no MEI? O teto é anual, não mensal. */
    case "mei_cabe": {
      const mes = num(sessao.faturamento)
      const ano = mes * 12
      const teto = num(sessao.ind_teto_mei) || 81000
      return { ...base, valor: mes, anualNum: Math.round(ano), cabe: ano <= teto ? 1 : 0 }
    }

    /** M14 — o preço abaixo do qual você trabalha de graça. */
    case "preco_minimo": {
      const custo = num(sessao.custoMaterial)
      const horas = Math.max(0.5, num(sessao.horas))
      const valorHora = num(sessao.valorHora)
      return { ...base, precoNum: Math.round(custo + horas * valorHora), valor: custo }
    }

    /** M15 — está na faixa de isenção? */
    case "ir_isencao": {
      const renda = num(sessao.rendaMes)
      const teto = num(sessao.ind_isencao_ir) || 5000
      return { ...base, valor: renda, cabe: renda <= teto ? 1 : 0 }
    }

    /** M16 — divisão proporcional à renda, não meio a meio. */
    case "divisao_casal": {
      const a = num(sessao.rendaA), b = num(sessao.rendaB)
      const total = a + b
      return { ...base, valor: total, pctA: total > 0 ? Math.round((a / total) * 100) : 50 }
    }

    /** M18 — o que trocar dívida cara por barata devolve por mês. */
    case "troca_divida": {
      const saldo = num(sessao.saldo)
      const taxaAtual = num(sessao.taxaAtual)
      const consignado = num(sessao.ind_consignado_clt) || 3.2
      return {
        ...base,
        valor: saldo,
        economiaNum: Math.round(Math.max(0, saldo * ((taxaAtual - consignado) / 100))),
        cabe: taxaAtual > consignado ? 1 : 0,
      }
    }

    /**
     * M19 — Price contra SAC.
     *
     * Aproximação didática, e o módulo diz que é. No SAC a amortização é
     * constante, então os juros somam o saldo médio vezes a taxa vezes o prazo;
     * no Price a parcela é fixa e os juros somam mais. Não substitui a planilha
     * do banco: serve para entender a DIREÇÃO antes de pedir o CET.
     */
    case "price_vs_sac": {
      const valor = num(sessao.valorFinanciado)
      const anos = Math.max(1, num(sessao.anos))
      const taxaAno = (num(sessao.ind_financiamento_imovel) || 11) / 100
      const n = anos * 12
      const i = taxaAno / 12
      const parcelaPrice = i > 0 ? (valor * i) / (1 - Math.pow(1 + i, -n)) : valor / n
      return {
        ...base,
        valor,
        jurosPriceNum: Math.round(parcelaPrice * n - valor),
        jurosSacNum: Math.round((valor * i * (n + 1)) / 2),
      }
    }

    /** M22 — o que a inflação tira de quem deixa parado. */
    case "perda_inflacao": {
      const parado = num(sessao.parado)
      const ipca = num(sessao.ind_ipca_12m) || 4.64
      return { ...base, valor: parado, perdaNum: Math.round(parado * (ipca / 100)) }
    }

    /**
     * M23 — a regra do 72.
     *
     * 72 dividido pela taxa anual dá, por aproximação, os anos para o dinheiro
     * dobrar. É atalho de cabeça, não fórmula exata, e o módulo apresenta assim.
     */
    case "regra_72": {
      const taxa = Math.max(0.1, num(sessao.taxaAno))
      return { ...base, valor: num(sessao.chute), anosNum: Math.round((72 / taxa) * 10) / 10 }
    }

    /** M24 — o que rende parado na poupança, em um ano. */
    case "poupanca_rende": {
      const guardado = num(sessao.guardadoPoupanca)
      // Com a Selic acima de 8,5% ao ano, a poupança rende 0,5% ao mês mais TR.
      return { ...base, valor: guardado, guardadoNum: Math.round(guardado * 0.005 * 12) }
    }

    /** M26 — a taxa mensal, no ano, com juro sobre juro. */
    case "taxa_anual": {
      const mes = num(sessao.taxaMes)
      return { ...base, valor: mes, anualNum: Math.round((Math.pow(1 + mes / 100, 12) - 1) * 1000) / 10 }
    }

    /** M27 — quantos meses de vida o seu estoque cobre. */
    case "fluxo_estoque": {
      const renda = num(sessao.rendaMensal), patrimonio = num(sessao.patrimonio)
      return {
        ...base,
        valor: patrimonio,
        mesesRendaNum: renda > 0 ? Math.round((patrimonio / renda) * 10) / 10 : 0,
      }
    }

    /**
     * O que a pessoa digitou, sem conta nenhuma em cima.
     *
     * É a fórmula da trilha de Ensino Médio, onde a tela de input quase sempre
     * pergunta UM número (um percentual, um valor, uma quantidade de meses) e a
     * tela de resultado só precisa comparar esse número com faixas.
     *
     * Sem isto as faixas não funcionam — e falham do pior jeito possível: com
     * `formula` ausente, `calcular` cai no `default`, `valor` fica 0 fixo, e
     * `avaliarFaixa` devolve sempre a mesma mensagem sem erro nenhum. Todo
     * mundo receberia o mesmo resultado final, tendo digitado o que digitasse.
     */
    case "valor_direto":
      return { ...base, valor: num(sessao.valor) }

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
      case "comprometido":
        return String(d.comprometidoNum)
      case "desconto":
        return "R$ " + formatInteiroBRL(d.descontoNum)
      case "apostado":
        return "R$ " + formatInteiroBRL(d.apostadoNum)
      case "guardado":
        return "R$ " + formatInteiroBRL(d.guardadoNum)
      case "sobra":
        return "R$ " + formatInteiroBRL(d.sobraNum)
      case "anual":
        return "R$ " + formatInteiroBRL(d.anualNum)
      case "taxaAnual":
        return String(d.anualNum).replace(".", ",")
      case "preco":
        return "R$ " + formatInteiroBRL(d.precoNum)
      case "pctA":
        return String(d.pctA)
      case "pctB":
        return String(100 - d.pctA)
      case "economia":
        return "R$ " + formatInteiroBRL(d.economiaNum)
      case "jurosPrice":
        return "R$ " + formatInteiroBRL(d.jurosPriceNum)
      case "jurosSac":
        return "R$ " + formatInteiroBRL(d.jurosSacNum)
      case "perda":
        return "R$ " + formatInteiroBRL(d.perdaNum)
      case "anosDobrar":
        return String(d.anosNum).replace(".", ",")
      case "mesesRenda":
        return String(d.mesesRendaNum).replace(".", ",")
      case "reserva3":
        return "R$ " + formatInteiroBRL(d.reserva3Num)
      case "reserva6":
        return "R$ " + formatInteiroBRL(d.reserva6Num)
      case "ano":
        return "R$ " + formatInteiroBRL(d.anoNum)
      case "semTeto":
        return "R$ " + formatInteiroBRL(d.semTetoNum)
      case "comTeto":
        return "R$ " + formatInteiroBRL(d.comTetoNum)
      /**
       * O número como a pessoa digitou, sem moeda.
       *
       * `{valor}` formata como BRL, e isso é certo quando a pergunta é sobre
       * dinheiro. A trilha de Ensino Médio também pergunta percentual, meses e
       * quantidade — ali o BRL leria errado: "você estimou 30,00 em papel".
       * Quem escreve a aula escolhe a chave conforme a unidade da pergunta.
       */
      case "valorCru":
        // Escapado porque o retorno de interpolar() vai para dangerouslySetInnerHTML
        // em TelaResultado. O HTML que o autor da aula escreveu no template segue
        // valendo: quem é escapado aqui é só o pedaço que a pessoa digitou.
        return escaparHtml(sessao.valor ?? "")
      case "entrou":
      case "saiu":
      case "sobrou":
      case "valor":
        return formatBRL(d[chave as "entrou" | "saiu" | "sobrou" | "valor"])
      default:
        // Mesma razão do valorCru: chave livre da aula lendo campo cru da sessão.
        return escaparHtml(sessao[chave] ?? "")
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

/**
 * A gramática das faixas: `campo op numero`, `campo em n,n,n`, ou "resto".
 *
 * Duas coisas entraram com a trilha escolar, e a primeira conserta um erro
 * que já estava aqui:
 *
 *  - DECIMAL. O número só aceitava `-?\d+`, então uma condição como
 *    `valor >= 1.5` não casava com o padrão e a função devolvia false — a
 *    faixa era silenciosamente pulada e a pessoa caía na última. Ninguém
 *    escrevera condição decimal ainda, então o defeito nunca apareceu.
 *
 *  - `em`, para escolha entre opções. As perguntas do Fundamental são
 *    categóricas ("Hoje", "Esta semana", "Mês que vem"), e a regra da fonte
 *    casa por rótulo: "valor == 'Hoje' ou valor == 'Esta semana'". As opções
 *    viram índices no porte, e o "ou" vira pertencimento a um conjunto —
 *    porque índices escolhidos NÃO são contíguos ("influenciador ou site da
 *    loja" são a 2ª e a 4ª), e sem isso a condição teria de ser reescrita à
 *    mão em dezenas de módulos.
 */
function testarCondicao(cond: string, d: Derivados): boolean {
  const lista = cond.match(/^(\w+)\s+em\s+([-\d.,\s]+)$/)
  if (lista) {
    const esquerda = (d as unknown as Record<string, number>)[lista[1]!]
    if (typeof esquerda !== "number") return false
    return lista[2]!
      .split(",")
      .map((x) => parseFloat(x.trim()))
      .filter((x) => isFinite(x))
      .some((x) => x === esquerda)
  }

  const m = cond.match(/^(\w+)\s*(>=|<=|>|<|==)\s*(-?\d+(?:\.\d+)?)(pct)?$/)
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
