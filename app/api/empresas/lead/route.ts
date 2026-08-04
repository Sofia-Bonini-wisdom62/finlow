import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { permitido } from "@/lib/limite-taxa"
import { contemConteudoProibido } from "@/lib/conteudo-proibido"

export const dynamic = "force-dynamic"

/**
 * Recebe o interesse de uma empresa (/empresas). Formulário PÚBLICO, sem
 * login — por isso as três camadas: zod no formato, limite de taxa por IP
 * (atrito anti-spam), e a trava de conteúdo nos campos livres, porque isto
 * vira registro que alguém do time vai ler.
 */

const Corpo = z.object({
  empresa: z.string().trim().min(2, "Nome da empresa muito curto").max(80),
  nome: z.string().trim().min(2, "Me diz seu nome").max(80),
  email: z.email("E-mail inválido"),
  tamanho: z.enum(["1-10", "11-50", "51-200", "200+"]).optional(),
  mensagem: z.string().trim().max(500, "Mensagem até 500 caracteres").optional(),
})

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0]!.trim()
  if (!permitido(`lead-empresa:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitos envios seguidos. Tenta daqui a pouco." }, { status: 429 })
  }

  try {
    const parse = Corpo.safeParse(await req.json())
    if (!parse.success) {
      const primeira = parse.error.issues[0]?.message ?? "Confere os campos e tenta de novo."
      return NextResponse.json({ error: primeira }, { status: 400 })
    }
    const dados = parse.data

    for (const campo of [dados.empresa, dados.nome, dados.mensagem ?? ""]) {
      if (campo && contemConteudoProibido(campo)) {
        return NextResponse.json({ error: "Esse texto não pode ser registrado." }, { status: 400 })
      }
    }

    const email = dados.email.toLowerCase().trim()
    // Reenviar não é erro: atualiza o pedido em vez de duplicar a fila.
    await db.leadEmpresa.upsert({
      where: { email },
      create: { ...dados, email },
      update: {
        empresa: dados.empresa,
        nome: dados.nome,
        ...(dados.tamanho ? { tamanho: dados.tamanho } : {}),
        ...(dados.mensagem ? { mensagem: dados.mensagem } : {}),
      },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[empresas/lead]", (e as Error)?.message)
    return NextResponse.json({ error: "Não deu pra enviar agora. Tenta de novo?" }, { status: 500 })
  }
}
