import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { getUserIdOr401 } from "@/lib/painel"

export const dynamic = "force-dynamic"

export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { nome: true, email: true, dataNascimento: true, consentimentoPainelEm: true, senha: true },
  })

  return NextResponse.json({
    nome: user?.nome ?? "",
    email: user?.email ?? "",
    dataNascimento: user?.dataNascimento ?? null,
    painelAtivo: user?.consentimentoPainelEm !== null && user?.consentimentoPainelEm !== undefined,
    temSenha: Boolean(user?.senha),
  })
}

// PATCH — atualiza nome e/ou senha
export async function PATCH(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const { nome, senhaAtual, senhaNova } = await req.json()
    const dados: { nome?: string; senha?: string } = {}

    if (nome !== undefined) {
      if (typeof nome !== "string" || nome.trim().length < 2) {
        return NextResponse.json({ error: "Nome muito curto" }, { status: 400 })
      }
      dados.nome = nome.trim()
    }

    if (senhaNova !== undefined) {
      if (typeof senhaNova !== "string" || senhaNova.length < 6) {
        return NextResponse.json({ error: "A senha nova precisa de pelo menos 6 caracteres" }, { status: 400 })
      }
      const user = await db.user.findUnique({ where: { id: userId }, select: { senha: true } })
      // quem tem senha precisa confirmar a atual (contas OAuth não têm)
      if (user?.senha) {
        if (!senhaAtual || !(await bcrypt.compare(senhaAtual, user.senha))) {
          return NextResponse.json({ error: "Senha atual incorreta" }, { status: 403 })
        }
      }
      dados.senha = await bcrypt.hash(senhaNova, 10)
    }

    if (Object.keys(dados).length === 0) {
      return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 })
    }

    await db.user.update({ where: { id: userId }, data: dados })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[conta PATCH]", e)
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}

/**
 * DELETE — apaga a conta e tudo que está ligado a ela.
 *
 * IRREVERSÍVEL, e a única operação do app que é. Por isso:
 *
 *  - exige a pessoa DIGITAR o próprio e-mail. Um botão "confirmar" pode ser
 *    tocado sem ler; digitar o e-mail não acontece por acidente. E funciona
 *    para conta com senha e para conta do Google, que não tem senha para pedir.
 *  - o apagamento é o `delete` do User. Todo o resto sai por CASCADE no banco,
 *    e é de propósito: lista explícita de tabelas envelhece calada — bastaria
 *    alguém criar uma tabela nova e esquecer de somar aqui para sobrar dado de
 *    uma conta apagada. O banco é quem garante a completude.
 *
 * A Waitlist NÃO cascateia (não tem relação com User — é só um e-mail), então
 * sai por e-mail, explicitamente. Manter um endereço numa lista de e-mail
 * depois de a pessoa apagar a conta é exatamente o que ela não quis.
 */
export async function DELETE(req: NextRequest) {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  try {
    const { confirmacao } = await req.json().catch(() => ({}))

    const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } })
    if (!user) {
      return NextResponse.json({ codigo: "SEM_CONTA", erro: "Conta não encontrada." }, { status: 404 })
    }

    const digitado = typeof confirmacao === "string" ? confirmacao.trim().toLowerCase() : ""
    if (digitado !== user.email.toLowerCase()) {
      return NextResponse.json(
        { codigo: "CONFIRMACAO_INVALIDA", erro: "Digite o seu e-mail exatamente como aparece acima." },
        { status: 400 }
      )
    }

    await db.$transaction([
      db.waitlist.deleteMany({ where: { email: user.email } }),
      db.user.delete({ where: { id: userId } }),
    ])

    // Sem e-mail no log: a conta acabou de ser apagada, registrar quem era
    // seria guardar justamente o que a pessoa pediu para sumir.
    console.log("[conta] conta apagada")
    return NextResponse.json({ apagada: true })
  } catch (e) {
    console.error("[conta] falha ao apagar:", (e as Error)?.message)
    return NextResponse.json(
      { codigo: "FALHOU", erro: "Não consegui apagar agora. Tenta de novo em alguns segundos." },
      { status: 500 }
    )
  }
}
