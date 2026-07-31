import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401, checarConsentimento } from "@/lib/painel"
import { criarTransacoesDeExtrato } from "@/lib/financeiro-repo"
import { parsearExtratoParalelo } from "@/lib/extrato/parsear"
import { validarExtrato, limitarA3Meses } from "@/lib/extrato/validar"
import { mapearCategorias, nomeDaCategoria } from "@/lib/extrato/categorias"
import { ErroExtrato, type ExtratoParseado, type ConteudoExtrato } from "@/types/extrato"
import { estimarCustoBRL } from "@/lib/custo"

/** ~1 MB de texto cobre extrato de 3 meses com folga. */
const LIMITE_TEXTO = 1_000_000

export const dynamic = "force-dynamic"
// O parsing de um extrato de 3 meses pode passar de 60s no modelo.
export const maxDuration = 300

function resumir(e: ExtratoParseado) {
  const totalEntradas = e.transacoes.filter((t) => t.valor > 0).reduce((s, t) => s + t.valor, 0)
  const totalSaidas = e.transacoes.filter((t) => t.valor < 0).reduce((s, t) => s + Math.abs(t.valor), 0)

  const porCat = new Map<string, { total: number; qtd: number }>()
  for (const t of e.transacoes) {
    if (t.valor >= 0) continue
    const a = porCat.get(t.categoria) ?? { total: 0, qtd: 0 }
    a.total += Math.abs(t.valor)
    a.qtd++
    porCat.set(t.categoria, a)
  }

  // Candidatas a "assinatura esquecida": mesma descrição limpa, marcada como
  // recorrente, aparecendo em mais de um mês. É o gancho do onboarding.
  const porDescricao = new Map<string, { valor: number; meses: Set<string> }>()
  for (const t of e.transacoes) {
    if (!t.recorrente || t.valor >= 0) continue
    const chave = t.descricaoLimpa.toLowerCase()
    const a = porDescricao.get(chave) ?? { valor: Math.abs(t.valor), meses: new Set<string>() }
    a.meses.add(t.data.slice(0, 7))
    porDescricao.set(chave, a)
  }

  return {
    totalEntradas: Number(totalEntradas.toFixed(2)),
    totalSaidas: Number(totalSaidas.toFixed(2)),
    porCategoria: [...porCat.entries()]
      .map(([categoria, v]) => ({
        categoria,
        nome: nomeDaCategoria(categoria),
        total: Number(v.total.toFixed(2)),
        qtd: v.qtd,
      }))
      .sort((a, b) => b.total - a.total),
    recorrentes: [...porDescricao.entries()]
      .filter(([, v]) => v.meses.size > 1)
      .map(([descricaoLimpa, v]) => ({
        descricaoLimpa,
        valor: Number(v.valor.toFixed(2)),
        ocorrencias: v.meses.size,
      }))
      .sort((a, b) => b.valor * b.ocorrencias - a.valor * a.ocorrencias),
  }
}

export async function POST(req: NextRequest) {
  // Auth e consentimento também ficavam fora de qualquer try. Uma falha de
  // conexão aqui subia pro framework e virava 500 com HTML — sem código, sem
  // mensagem, indiagnosticável. Esta rota nunca mais responde não-JSON.
  let userId: string
  try {
    const r = await getUserIdOr401()
    if (r instanceof NextResponse) return r
    userId = r
    const bloqueio = await checarConsentimento(userId)
    if (bloqueio) return bloqueio
  } catch (e) {
    console.error("[extrato] falha antes de começar:", (e as Error)?.message)
    return NextResponse.json(
      {
        codigo: "INDISPONIVEL",
        erro: "Não consegui nem começar. Tenta de novo em alguns segundos.",
        motivo: (e as Error)?.message?.slice(0, 200),
      },
      { status: 503 }
    )
  }

  // ---- conteúdo já extraído no navegador ----
  // O servidor NÃO recebe mais o arquivo. A leitura acontece no cliente
  // (lib/extrato/ler-no-navegador.ts) e aqui chega só texto ou imagens de
  // página. Isso tirou o pdfjs da função serverless — origem de três quebras
  // seguidas de deploy — e faz o arquivo bruto nunca sair do computador
  // da pessoa, que é mais forte do que a promessa da tela.
  let entrada: ConteudoExtrato
  try {
    const corpo = await req.json()
    if (corpo?.modo === "texto" && typeof corpo.texto === "string" && corpo.texto.trim().length >= 20) {
      if (corpo.texto.length > LIMITE_TEXTO) {
        return NextResponse.json(
          { codigo: "ARQUIVO_GRANDE", erro: "Esse extrato é longo demais. Tenta exportar um período menor pelo app do banco." },
          { status: 413 }
        )
      }
      entrada = { modo: "texto", texto: corpo.texto, paginas: Number(corpo.paginas) || 1 }
    } else if (corpo?.modo === "imagem" && Array.isArray(corpo.imagens) && corpo.imagens.length) {
      entrada = {
        modo: "imagem",
        paginas: Number(corpo.paginas) || corpo.imagens.length,
        imagens: corpo.imagens.slice(0, 10).filter(
          (i: unknown) => !!i && typeof (i as { base64?: unknown }).base64 === "string"
        ),
      }
    } else {
      return NextResponse.json(
        { codigo: "FORMATO_INVALIDO", erro: "Não recebi conteúdo legível do arquivo." },
        { status: 400 }
      )
    }
  } catch {
    return NextResponse.json({ codigo: "FORMATO_INVALIDO", erro: "Não consegui ler o envio." }, { status: 400 })
  }

  // Duração é o que diferencia "falhou" de "a plataforma me matou no meio".
  const t0 = Date.now()

  // O create ficava FORA do try. Se ele estourasse — pool esgotado, tabela
  // fora de sincronia, o que for — o erro subia pro framework e virava um 500
  // com HTML, sem código nem mensagem. Foi exatamente o "HTTP 500 após 1s,
  // resposta não-JSON" visto em produção. Daqui pra baixo, TUDO devolve JSON.
  let registro: { id: string }
  try {
    registro = await db.extratoImport.create({ data: { userId, status: "processando" } })
  } catch (e) {
    console.error("[extrato] falha ao abrir o registro de import:", (e as Error)?.message)
    return NextResponse.json(
      {
        codigo: "BANCO_INDISPONIVEL",
        erro: "Não consegui nem começar a leitura porque o banco de dados não respondeu. Tenta de novo em alguns segundos.",
        motivo: (e as Error)?.message?.slice(0, 200),
      },
      { status: 503 }
    )
  }

  try {
    console.log(
      `[extrato] ${registro.id} recebido modo=${entrada.modo} paginas=${entrada.paginas} ` +
      `tamanho=${(entrada.modo === "texto" ? entrada.texto.length : entrada.imagens.length)}`
    )

    // 1ª tentativa
    let r = await parsearExtratoParalelo(entrada)
    let veredito = validarExtrato(r.extrato)
    let tokensEntrada = r.tokensEntrada
    let tokensSaida = r.tokensSaida

    // Retry único, informando ao modelo a diferença encontrada.
    if (!veredito.ok && veredito.divergencia !== undefined) {
      const r2 = await parsearExtratoParalelo(entrada, { divergencia: veredito.divergencia })
      tokensEntrada += r2.tokensEntrada
      tokensSaida += r2.tokensSaida
      const v2 = validarExtrato(r2.extrato)
      if (v2.ok) { r = r2; veredito = v2 }
      else veredito = v2
    }

    if (!veredito.ok) {
      await db.extratoImport.update({
        where: { id: registro.id },
        data: {
          status: "falhou",
          erroValidacao: veredito.motivo,
          tokensEntrada, tokensSaida, modelo: r.modelo,
        },
      })
      // Sem número na resposta: o produto vende "esse número é verdade".
      // Parsing que não fechou a conta não vira tela, nem parcialmente.
      return NextResponse.json(
        {
          codigo: "VALIDACAO_FALHOU",
          extratoImportId: registro.id,
          erro: "Não consegui conferir esse extrato com segurança, então prefiro não te mostrar números que podem estar errados. Tenta exportar em CSV ou OFX pelo app do banco.",
          motivo: veredito.motivo,
        },
        { status: 422 }
      )
    }

    const { extrato, cortou } = limitarA3Meses(r.extrato)

    // ---- grava, sempre não confirmado ----
    const mapaCat = await mapearCategorias(userId, extrato.transacoes.map((t) => t.categoria))
    const criadas = await criarTransacoesDeExtrato(
      userId,
      registro.id,
      extrato.transacoes.map((t) => ({
        descricao: t.descricaoLimpa,
        valor: Math.abs(t.valor),
        tipo: t.valor >= 0 ? "receita" : "despesa",
        categoriaId: mapaCat.get(t.categoria) ?? null,
        data: new Date(t.data),
      }))
    )

    await db.extratoImport.update({
      where: { id: registro.id },
      data: {
        status: "aguardando_confirmacao",
        banco: extrato.banco,
        periodoInicio: new Date(extrato.periodoInicio),
        periodoFim: new Date(extrato.periodoFim),
        totalLinhas: criadas.length,
        tokensEntrada, tokensSaida, modelo: r.modelo,
      },
    })

    const custo = estimarCustoBRL(tokensEntrada, tokensSaida, r.modelo)
    console.log(
      `[extrato] ${registro.id} OK total=${((Date.now() - t0) / 1000).toFixed(1)}s pedacos=${r.pedacos} ` +
      `linhas=${criadas.length} tokens=${tokensEntrada}/${tokensSaida} custo=R$${custo.brl}`
    )

    return NextResponse.json({
      extratoImportId: registro.id,
      banco: extrato.banco,
      periodo: { inicio: extrato.periodoInicio, fim: extrato.periodoFim },
      validacaoForte: veredito.forte,
      comoConferi: veredito.comoConferi ?? null,
      cortadoPara3Meses: cortou,
      resumo: resumir(extrato),
      // id do banco casado com a linha lida, para a tela permitir desmarcar
      transacoes: extrato.transacoes.map((t, i) => ({ ...t, id: criadas[i]?.id })),
      custo: { brl: custo.brl, tokensEntrada, tokensSaida },
    })
  } catch (e) {
    const erro = e instanceof ErroExtrato ? e : null
    // console.error sem o conteúdo do extrato — só o código e o detalhe curto.
    console.error(
      `[extrato] ${registro.id} FALHOU total=${((Date.now() - t0) / 1000).toFixed(1)}s`,
      erro?.codigo ?? "ERRO",
      erro?.detalhe ?? (e as Error)?.message
    )

    await db.extratoImport.update({
      where: { id: registro.id },
      data: { status: "falhou", erroValidacao: erro?.codigo ?? "erro inesperado" },
    }).catch(() => {})

    return NextResponse.json(
      {
        codigo: erro?.codigo ?? "FORMATO_INVALIDO",
        erro: erro?.mensagemUsuario ?? "Não consegui processar esse extrato. Tenta de novo.",
      },
      { status: erro?.codigo === "IA_NAO_CONFIGURADA" ? 503 : 400 }
    )
  }
}
