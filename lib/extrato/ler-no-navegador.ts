"use client"

/**
 * Leitura do arquivo NO NAVEGADOR.
 *
 * POR QUE AQUI E NÃO NO SERVIDOR
 * A leitura de PDF rodava na função serverless e quebrou três vezes seguidas
 * em produção, sempre por causa da mesma coisa: o pdfjs precisa de um arquivo
 * de worker em disco, e nenhuma das formas de fazê-lo chegar lá sobreviveu ao
 * empacotamento (require.resolve dinâmico quebrou o build; um glob de
 * outputFileTracingIncludes atravessou os symlinks do pnpm e derrubou o
 * deploy; sem nada disso, o módulo simplesmente não carregava e a rota morria
 * com 500 sem corpo, antes de qualquer try/catch).
 *
 * No navegador o worker é servido de /public — asset estático, sem
 * empacotador no meio. E três coisas melhoram de brinde:
 *  - o arquivo bruto NUNCA sai do computador da pessoa (o servidor recebe só
 *    o texto já extraído), o que é mais forte do que a promessa que a tela faz
 *  - o request cai de ~100 KB de PDF para o texto puro
 *  - CSV e OFX passam a ser triviais: é só ler como texto
 */

import type { ConteudoExtrato } from "@/types/extrato"

export class ErroLeitura extends Error {
  constructor(readonly codigo: string, readonly mensagemUsuario: string) {
    super(mensagemUsuario)
    this.name = "ErroLeitura"
  }
}

/** Abaixo disso o PDF é digitalizado: não há texto, só imagem. */
const MINIMO_CARACTERES = 200
const MAX_PAGINAS_IMAGEM = 10

async function pdfjs() {
  const lib = await import("pdfjs-dist")
  // Servido de public/ — ver scripts/copiar-worker-pdfjs.mjs
  lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"
  return lib
}

function ehErroDeSenha(e: unknown): boolean {
  const nome = (e as { name?: string })?.name ?? ""
  return nome === "PasswordException" || /password|senha/i.test((e as Error)?.message ?? "")
}

export async function lerArquivo(arquivo: File): Promise<ConteudoExtrato> {
  const nome = arquivo.name.toLowerCase()

  // ---- texto puro: CSV, OFX, TXT ----
  if (/\.(csv|ofx|txt|qif)$/.test(nome)) {
    const texto = (await arquivo.text()).trim()
    if (texto.length < 20) {
      throw new ErroLeitura("ARQUIVO_VAZIO", "Esse arquivo está vazio ou não tem conteúdo legível.")
    }
    return { modo: "texto", texto, paginas: 1 }
  }

  if (!/\.pdf$/.test(nome)) {
    throw new ErroLeitura(
      "FORMATO_INVALIDO",
      "Consigo ler PDF, CSV e OFX. Exporta o extrato num desses formatos pelo app do banco."
    )
  }

  // ---- PDF ----
  const lib = await pdfjs()
  const dados = new Uint8Array(await arquivo.arrayBuffer())

  let doc
  try {
    doc = await lib.getDocument({ data: dados }).promise
  } catch (e) {
    if (ehErroDeSenha(e)) {
      throw new ErroLeitura(
        "PDF_PROTEGIDO",
        "Esse PDF tem senha (geralmente seu CPF ou data de nascimento). Abre ele no computador, salva uma cópia sem senha e sobe de novo — ou exporta em CSV pelo app do banco."
      )
    }
    throw new ErroLeitura("FORMATO_INVALIDO", "Não consegui abrir esse arquivo. Confere se é mesmo o PDF do extrato.")
  }

  try {
    const partes: string[] = []
    for (let i = 1; i <= doc.numPages; i++) {
      const pagina = await doc.getPage(i)
      const conteudo = await pagina.getTextContent()
      partes.push(
        conteudo.items
          .map((it) => ("str" in it ? it.str : ""))
          .join(" ")
      )
      pagina.cleanup()
    }
    const texto = partes.join("\n").replace(/[ \t]+/g, " ").trim()

    if (texto.length >= MINIMO_CARACTERES) {
      return { modo: "texto", texto, paginas: doc.numPages }
    }

    // Texto curto = digitalizado. Renderiza as páginas e manda como imagem.
    const imagens: { base64: string; mime: string }[] = []
    for (let i = 1; i <= Math.min(doc.numPages, MAX_PAGINAS_IMAGEM); i++) {
      const pagina = await doc.getPage(i)
      const viewport = pagina.getViewport({ scale: 1.6 })
      const canvas = document.createElement("canvas")
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext("2d")
      if (!ctx) break
      // Canvas nasce transparente e transparência vira PRETO em JPEG — a
      // página inteira ficaria ilegível para o modelo. Pinta branco antes.
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      await pagina.render({ canvas, canvasContext: ctx, viewport }).promise
      // JPEG, não PNG: 10 páginas em PNG passam de 15 MB de request.
      imagens.push({ base64: canvas.toDataURL("image/jpeg", 0.85).split(",")[1] ?? "", mime: "image/jpeg" })
      pagina.cleanup()
    }

    if (imagens.length === 0) {
      throw new ErroLeitura(
        "PDF_ILEGIVEL",
        "Não consegui ler nada desse PDF. Se for uma foto ou digitalização, tenta exportar o extrato direto pelo app do banco."
      )
    }
    return { modo: "imagem", imagens, paginas: doc.numPages }
  } finally {
    await doc.cleanup().catch(() => {})
  }
}
