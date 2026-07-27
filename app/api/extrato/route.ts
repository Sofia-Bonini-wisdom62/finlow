import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserIdOr401, checarConsentimento } from "@/lib/painel"
import { criarTransacoesDeExtrato } from "@/lib/financeiro-repo"
import { extrairTexto, LIMITE_BYTES } from "@/lib/extrato/extrair-texto"
import { parsearExtrato } from "@/lib/extrato/parsear"
import { validarExtrato, limitarA3Meses } from "@/lib/extrato/validar"
import { mapearCategorias, nomeDaCategoria } from "@/lib/extrato/categorias"
import { ErroExtrato, type ExtratoParseado } from "@/types/extrato"
import { estimarCustoBRL } from "@/lib/custo"

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
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId
  const bloqueio = await checarConsentimento(userId)
  if (bloqueio) return bloqueio

  // ---- arquivo, em memória ----
  let buffer: Buffer
  try {
    const form = await req.formData()
    const arquivo = form.get("arquivo")
    if (!(arquivo instanceof File)) {
      return NextResponse.json({ codigo: "FORMATO_INVALIDO", erro: "Envie o PDF no campo 'arquivo'." }, { status: 400 })
    }
    if (arquivo.size > LIMITE_BYTES) {
      return NextResponse.json(
        { codigo: "ARQUIVO_GRANDE", erro: "Esse arquivo passa de 10 MB. Tenta exportar de novo pelo app do banco." },
        { status: 413 }
      )
    }
    buffer = Buffer.from(await arquivo.arrayBuffer())
  } catch {
    return NextResponse.json({ codigo: "FORMATO_INVALIDO", erro: "Não consegui ler o upload." }, { status: 400 })
  }

  const registro = await db.extratoImport.create({ data: { userId, status: "processando" } })

  try {
    const entrada = await extrairTexto(buffer)

    // 1ª tentativa
    let r = await parsearExtrato(entrada)
    let veredito = validarExtrato(r.extrato)
    let tokensEntrada = r.tokensEntrada
    let tokensSaida = r.tokensSaida

    // Retry único, informando ao modelo a diferença encontrada.
    if (!veredito.ok && veredito.divergencia !== undefined) {
      const r2 = await parsearExtrato(entrada, { divergencia: veredito.divergencia })
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

    return NextResponse.json({
      extratoImportId: registro.id,
      banco: extrato.banco,
      periodo: { inicio: extrato.periodoInicio, fim: extrato.periodoFim },
      validacaoForte: veredito.forte,
      cortadoPara3Meses: cortou,
      resumo: resumir(extrato),
      // id do banco casado com a linha lida, para a tela permitir desmarcar
      transacoes: extrato.transacoes.map((t, i) => ({ ...t, id: criadas[i]?.id })),
      custo: { brl: custo.brl, tokensEntrada, tokensSaida },
    })
  } catch (e) {
    const erro = e instanceof ErroExtrato ? e : null
    // console.error sem o conteúdo do extrato — só o código e o detalhe curto.
    console.error("[extrato]", erro?.codigo ?? "ERRO", erro?.detalhe ?? (e as Error)?.message)

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
